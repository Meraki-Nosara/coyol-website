// Table Assignment Logic for La Luna Reservation System
// Fixes: Table size mismatch + TBA problem

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

/**
 * Find the best table for a reservation based on:
 * 1. Minimum capacity >= guest count
 * 2. Zone preference (if specified)
 * 3. Smallest available table that fits (don't waste big tables on small parties)
 * 4. Not already booked for that time slot
 */
export async function findBestTable(date, time, guestCount, zonePreference = 'any') {
  // Get all tables with their zones
  const tablesRes = await fetch(
    `${SUPABASE_URL}/rest/v1/tables?is_active=eq.true&select=*,zones(name)`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  );
  
  if (!tablesRes.ok) return null;
  const allTables = await tablesRes.json();
  
  // Get existing reservations for this date/time (within 2.5 hour window)
  const reservationsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/reservations?date=eq.${date}&status=in.(confirmed,pending,seated)&select=table_id,time`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  );
  
  const reservations = reservationsRes.ok ? await reservationsRes.json() : [];
  
  // Find tables that are booked during the requested time
  const requestedTime = parseTime(time);
  const bookedTableIds = new Set();
  
  reservations.forEach(res => {
    if (!res.table_id) return; // Skip TBA reservations
    
    const resTime = parseTime(res.time);
    // Check if times overlap (assuming 2.5 hour duration)
    if (Math.abs(requestedTime - resTime) < 150) { // 150 minutes = 2.5 hours
      bookedTableIds.add(res.table_id);
    }
  });
  
  // Filter tables that:
  // 1. Have enough capacity
  // 2. Are not booked
  // 3. Match zone preference (if specified)
  let availableTables = allTables.filter(t => {
    if (t.capacity < guestCount) return false;
    if (bookedTableIds.has(t.id)) return false;
    if (zonePreference !== 'any') {
      const zoneName = t.zones?.name?.toLowerCase() || '';
      if (zonePreference === 'indoor' && !zoneName.includes('indoor')) return false;
      if (zonePreference === 'patio' && !zoneName.includes('patio')) return false;
      if (zonePreference === 'garden' && !zoneName.includes('garden')) return false;
    }
    return true;
  });
  
  // If no tables in preferred zone, try any zone
  if (availableTables.length === 0 && zonePreference !== 'any') {
    availableTables = allTables.filter(t => {
      return t.capacity >= guestCount && !bookedTableIds.has(t.id);
    });
  }
  
  if (availableTables.length === 0) {
    return null; // No table available = TBA
  }
  
  // Sort by capacity (smallest fitting table first to optimize usage)
  availableTables.sort((a, b) => a.capacity - b.capacity);
  
  // For large groups (7+), prefer bigger tables
  if (guestCount >= 7) {
    // Look for communal/round tables first
    const largeTable = availableTables.find(t => 
      t.type === 'communal' || t.capacity >= 8
    );
    if (largeTable) return largeTable;
  }
  
  // Return the smallest available table that fits
  return availableTables[0];
}

/**
 * Check if a specific date/time has capacity issues
 * Returns warning if many TBA reservations or high occupancy
 */
export async function checkCapacityWarnings(date, time) {
  const reservationsRes = await fetch(
    `${SUPABASE_URL}/rest/v1/reservations?date=eq.${date}&status=in.(confirmed,pending)&select=table_id,guests,time`,
    {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    }
  );
  
  if (!reservationsRes.ok) return { warning: false };
  
  const reservations = await reservationsRes.json();
  const requestedTime = parseTime(time);
  
  // Filter to overlapping time slots
  const overlapping = reservations.filter(r => {
    const resTime = parseTime(r.time);
    return Math.abs(requestedTime - resTime) < 150;
  });
  
  const tbaCount = overlapping.filter(r => !r.table_id).length;
  const totalGuests = overlapping.reduce((sum, r) => sum + (r.guests || 2), 0);
  
  const warnings = [];
  
  if (tbaCount > 0) {
    warnings.push(`${tbaCount} reservation(s) without assigned table`);
  }
  
  if (totalGuests > 80) { // Rough capacity estimate
    warnings.push(`High occupancy: ${totalGuests} guests expected`);
  }
  
  if (overlapping.length > 15) {
    warnings.push(`${overlapping.length} overlapping reservations`);
  }
  
  return {
    warning: warnings.length > 0,
    messages: warnings,
    tbaCount,
    totalGuests,
    reservationCount: overlapping.length
  };
}

/**
 * Validate reservation before confirming
 * Returns { valid: boolean, error?: string, warning?: string }
 */
export async function validateReservation(date, time, guestCount, zonePreference) {
  // Large group validation
  if (guestCount >= 10) {
    return {
      valid: false,
      error: 'For parties of 10 or more, please call us at +506 2682-0122 to arrange your reservation.',
      requiresCall: true
    };
  }
  
  // Try to find a table
  const table = await findBestTable(date, time, guestCount, zonePreference);
  
  if (!table) {
    // Check if it's a capacity issue or fully booked
    const warnings = await checkCapacityWarnings(date, time);
    
    if (warnings.totalGuests > 70) {
      return {
        valid: false,
        error: 'Sorry, we are fully booked at this time. Please try a different time or call us.',
        fullyBooked: true
      };
    }
    
    return {
      valid: true,
      warning: 'No specific table available. Your reservation will be confirmed pending table assignment.',
      tableId: null,
      tba: true
    };
  }
  
  return {
    valid: true,
    tableId: table.id,
    tableName: table.name,
    tableCapacity: table.capacity,
    zone: table.zones?.name || 'TBD'
  };
}

// Helper: Parse time string to minutes since midnight
function parseTime(timeStr) {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export default {
  findBestTable,
  checkCapacityWarnings,
  validateReservation
};
