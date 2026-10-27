import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

// Combined tables - DISABLED
// All tables are independent - no automatic blocking
const COMBINED_TABLES: Record<string, string[]> = {};

// Get all tables that would be blocked by a given table assignment
function getBlockedTables(tableId: string): string[] {
  const blocked = new Set<string>();
  
  // Handle multiple tables (comma-separated: "t17,t18,t19" or plus-separated: "t17+t18")
  const separator = tableId.includes(',') ? ',' : tableId.includes('+') ? '+' : null;
  
  if (separator) {
    tableId.split(separator).forEach(t => {
      const trimmed = t.trim();
      if (trimmed) {
        blocked.add(trimmed);
        // Also add any related tables from combinations
        const related = COMBINED_TABLES[trimmed];
        if (related) related.forEach(r => blocked.add(r));
      }
    });
  } else {
    // Single table
    blocked.add(tableId);
    const related = COMBINED_TABLES[tableId];
    if (related) related.forEach(r => blocked.add(r));
  }
  
  return Array.from(blocked);
}

// La Luna table configuration - fetched from Supabase floor layout
let cachedTables: Record<string, { minCovers: number; maxCovers: number; zone: string; priority: number }> | null = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

async function getTablesFromSupabase(): Promise<Record<string, { minCovers: number; maxCovers: number; zone: string; priority: number }>> {
  // Return cache if still valid
  if (cachedTables && Date.now() - cacheTime < CACHE_TTL) {
    return cachedTables;
  }
  
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/restaurant_settings?key=eq.laluna_floor_layout&select=value`, {
      headers: { 'apikey': SUPABASE_KEY }
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.length > 0 && data[0].value) {
        const layout = JSON.parse(data[0].value);
        const tables: Record<string, { minCovers: number; maxCovers: number; zone: string; priority: number }> = {};
        
        // Process each zone
        const zones = ['inside', 'terraza', 'jardin', 'fantasma'];
        zones.forEach((zone, zoneIndex) => {
          const zoneTables = layout[zone] || [];
          zoneTables.forEach((t: any, i: number) => {
            tables[t.id] = {
              minCovers: t.minCovers || 2,
              maxCovers: t.maxCovers || 4,
              zone: zone,
              priority: zoneIndex * 20 + i
            };
          });
        });
        
        cachedTables = tables;
        cacheTime = Date.now();
        return tables;
      }
    }
  } catch (e) {
    console.error('Failed to fetch table layout:', e);
  }
  
  // Fallback to defaults if fetch fails
  return getDefaultTables();
}

function getDefaultTables(): Record<string, { minCovers: number; maxCovers: number; zone: string; priority: number }> {
  return {
    // Fallback hardcoded tables (used if Supabase fails)
    't17': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 10 },
    't18': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 11 },
    't19': { minCovers: 4, maxCovers: 6, zone: 'jardin', priority: 13 },
    't20': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 14 },
    't21': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 15 },
    't22': { minCovers: 4, maxCovers: 6, zone: 'jardin', priority: 16 },
    't23': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 17 },
    't24': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 18 },
    't25': { minCovers: 4, maxCovers: 8, zone: 'jardin', priority: 19 },
    't26': { minCovers: 6, maxCovers: 10, zone: 'jardin', priority: 20 },
    't27': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 21 },
  };
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

async function getExistingReservations(date: string, excludeId?: string): Promise<any[]> {
  let query = `${SUPABASE_URL}/rest/v1/laluna_reservations?date=eq.${date}&select=*`;
  if (excludeId) {
    query += `&id=neq.${excludeId}`;
  }
  
  const res = await fetch(query, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }
  });
  
  return res.ok ? await res.json() : [];
}

async function findBestTable(guests: number, date: string, time: string, existingReservations: any[], zonePreference?: string): Promise<string | null> {
  const TABLES = await getTablesFromSupabase();
  const resMinutes = parseTime(time);
  
  // Get all tables sorted by priority
  let tableEntries = Object.entries(TABLES)
    .map(([id, config]) => ({ id, ...config }))
    .sort((a, b) => a.priority - b.priority);
  
  // If zone preference, prioritize that zone
  if (zonePreference && zonePreference !== 'any') {
    tableEntries.sort((a, b) => {
      const aMatch = a.zone === zonePreference ? 0 : 1;
      const bMatch = b.zone === zonePreference ? 0 : 1;
      return aMatch - bMatch || a.priority - b.priority;
    });
  }
  
  for (const table of tableEntries) {
    // Check capacity - allow 1 person less than min for small tables only
    const effectiveMin = table.maxCovers <= 6 ? Math.max(1, table.minCovers - 1) : table.minCovers;
    if (guests < effectiveMin || guests > table.maxCovers) continue;
    
    // Check for time conflicts (2-hour window) - including combined tables
    const tablesToCheck = getBlockedTables(table.id);
    const hasConflict = existingReservations.some(r => {
      if (r.status === 'cancelled' || r.status === 'no-show') return false;
      // Check if this reservation's table blocks our target table
      const reservationBlockedTables = getBlockedTables(r.table_id || '');
      const hasTableOverlap = tablesToCheck.some(t => reservationBlockedTables.includes(t));
      if (!hasTableOverlap) return false;
      const rMinutes = parseTime(r.time);
      return Math.abs(rMinutes - resMinutes) < 120;
    });
    
    if (!hasConflict) {
      return table.id;
    }
  }
  
  return null; // No table available
}

function checkTableTimeConflict(tableId: string, date: string, time: string, existingReservations: any[]): { hasConflict: boolean; conflictWith?: any; conflictingTable?: string } {
  const resMinutes = parseTime(time);
  const tablesToCheck = getBlockedTables(tableId);
  
  for (const r of existingReservations) {
    // Skip cancelled/no-show
    if (r.status === 'cancelled' || r.status === 'no-show') continue;
    
    // Check if this reservation's table conflicts with our target (including combined tables)
    const reservationBlockedTables = getBlockedTables(r.table_id || '');
    const overlappingTables = tablesToCheck.filter(t => reservationBlockedTables.includes(t));
    if (overlappingTables.length === 0) continue;
    
    // Check 2-hour conflict window
    const rMinutes = parseTime(r.time);
    if (Math.abs(rMinutes - resMinutes) < 120) {
      // Return the specific table that has the conflict
      return { hasConflict: true, conflictWith: r, conflictingTable: r.table_id };
    }
  }
  
  return { hasConflict: false };
}

async function validateTableAssignment(tableId: string, guests: number): Promise<{ valid: boolean; error?: string; suggested?: string }> {
  const TABLES = await getTablesFromSupabase();
  
  // Handle multiple tables (comma-separated)
  if (tableId.includes(',')) {
    const tables = tableId.split(',').map(t => t.trim()).filter(Boolean);
    let totalCapacity = 0;
    
    for (const t of tables) {
      const table = TABLES[t];
      if (!table) {
        // Allow unknown tables (might be custom/new)
        totalCapacity += 4; // Assume 4 capacity for unknown
        continue;
      }
      totalCapacity += table.maxCovers;
    }
    
    // For multiple tables, just check if total capacity is enough
    if (guests > totalCapacity) {
      return { 
        valid: false, 
        error: `Combined tables ${tableId} have max capacity of ${totalCapacity} (you have ${guests} guests)` 
      };
    }
    
    return { valid: true };
  }
  
  // Single table validation
  const table = TABLES[tableId];
  
  if (!table) {
    // Allow unknown tables
    return { valid: true };
  }
  
  // Allow 1 person less than min for small tables
  const effectiveMin = table.maxCovers <= 6 ? Math.max(1, table.minCovers - 1) : table.minCovers;
  
  if (guests < effectiveMin) {
    return { 
      valid: false, 
      error: `Table ${tableId} requires at least ${effectiveMin} guests (you have ${guests})` 
    };
  }
  
  if (guests > table.maxCovers) {
    return { 
      valid: false, 
      error: `Table ${tableId} has max capacity of ${table.maxCovers} (you have ${guests} guests)` 
    };
  }
  
  return { valid: true };
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const today = url.searchParams.get('today');
    const date = url.searchParams.get('date');
    let query = `${SUPABASE_URL}/rest/v1/laluna_reservations?select=*`;
    
    if (today === 'true') {
      const todayDate = new Date().toISOString().split('T')[0];
      query += `&date=eq.${todayDate}`;
    } else if (date) {
      query += `&date=eq.${date}`;
    }
    
    query += '&order=time.asc';
    
    const res = await fetch(query, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      }
    });
    
    const data = await res.json();
    
    return new Response(JSON.stringify(Array.isArray(data) ? data : []), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { date, time, guests, guest_name, guest_phone, guest_email, table_id, zone_preference, special_requests, status } = body;
    
    // Validate required fields
    if (!date || !time || !guests || !guest_name) {
      return new Response(JSON.stringify({ error: 'Missing required fields: date, time, guests, guest_name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const guestCount = parseInt(guests);
    let assignedTable = table_id;
    
    // Get existing reservations for conflict checking
    const existingReservations = await getExistingReservations(date);
    
    // If table provided, check for conflicts FIRST (always reject conflicts)
    if (table_id) {
      // Check for time conflicts - this is a hard stop
      const conflict = checkTableTimeConflict(table_id, date, time, existingReservations);
      if (conflict.hasConflict) {
        return new Response(JSON.stringify({
          error: `Mesa ${conflict.conflictingTable} ya tiene reserva a las ${conflict.conflictWith.time} (${conflict.conflictWith.guest_name}). No se puede asignar.`,
          validation_failed: true,
          conflict: conflict.conflictWith
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Capacity validation is informational only - trust manual table selection
      const validation = await validateTableAssignment(table_id, guestCount);
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: validation.error, validation_failed: true }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        // Keep the manually selected table(s) - don't override to null
      }
    }
    
    // Auto-assign table if not provided or validation failed
    if (!assignedTable) {
      assignedTable = await findBestTable(guestCount, date, time, existingReservations, zone_preference);
      
      if (!assignedTable) {
        console.log(`No suitable table for ${guestCount} guests on ${date} at ${time} - leaving as TBA`);
      }
    }
    
    const payload = {
      date,
      time,
      guests: guestCount,
      guest_name,
      guest_phone: guest_phone || '',
      guest_email: guest_email || '',
      table_id: assignedTable,
      zone_preference: zone_preference || null,
      special_requests: special_requests || '',
      status: status || 'confirmed'
    };
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/laluna_reservations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });
    
    if (!res.ok) {
      const error = await res.text();
      return new Response(JSON.stringify({ error }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await res.json();
    
    // Upsert guest record for future autocomplete
    if (guest_phone || guest_email) {
      try {
        const guestPayload = {
          name: guest_name,
          phone: guest_phone || null,
          email: guest_email || null,
          last_visit: date,
          updated_at: new Date().toISOString()
        };
        
        // Try to find existing guest by phone or email
        let existingGuest = null;
        if (guest_phone) {
          const phoneCheck = await fetch(`${SUPABASE_URL}/rest/v1/laluna_guests?phone=eq.${encodeURIComponent(guest_phone)}&limit=1`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
          });
          const phoneResults = await phoneCheck.json();
          if (phoneResults.length > 0) existingGuest = phoneResults[0];
        }
        
        if (!existingGuest && guest_email) {
          const emailCheck = await fetch(`${SUPABASE_URL}/rest/v1/laluna_guests?email=eq.${encodeURIComponent(guest_email)}&limit=1`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
          });
          const emailResults = await emailCheck.json();
          if (emailResults.length > 0) existingGuest = emailResults[0];
        }
        
        if (existingGuest) {
          // Update existing guest
          await fetch(`${SUPABASE_URL}/rest/v1/laluna_guests?id=eq.${existingGuest.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...guestPayload,
              visit_count: (existingGuest.visit_count || 0) + 1
            })
          });
        } else {
          // Create new guest
          await fetch(`${SUPABASE_URL}/rest/v1/laluna_guests`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...guestPayload, visit_count: 1 })
          });
        }
      } catch (guestError) {
        console.error('Failed to upsert guest:', guestError);
        // Don't fail the reservation if guest upsert fails
      }
    }
    
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const PATCH: APIRoute = async ({ request, url }) => {
  try {
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing reservation id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const body = await request.json();
    const { table_id, guests, date, time, ...otherFields } = body;
    
    // If changing table assignment, validate capacity AND time conflicts
    if (table_id) {
      // Get current reservation to check date/time AND guest count
      const currentRes = await fetch(`${SUPABASE_URL}/rest/v1/laluna_reservations?id=eq.${id}&select=date,time,guests`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      });
      const current = await currentRes.json();
      
      if (current?.[0]) {
        // Use guest count from request body, or from current reservation
        const guestCount = guests ? parseInt(guests) : (current[0].guests || 2);
        
        // Validate table capacity - WARNING ONLY, don't block manual staff selection
        const validation = await validateTableAssignment(table_id, guestCount);
        if (!validation.valid) {
          console.warn(`Table capacity warning (staff override): ${validation.error}`);
          // Don't block - staff knows what they're doing
        }
        
        // Check time conflicts - THIS is a hard block
        const checkDate = date || current[0].date;
        const checkTime = time || current[0].time;
        const existingReservations = await getExistingReservations(checkDate, id);
        const conflict = checkTableTimeConflict(table_id, checkDate, checkTime, existingReservations);
        
        if (conflict.hasConflict) {
          return new Response(JSON.stringify({ 
            error: `Table ${table_id} already has a reservation at ${conflict.conflictWith.time} (${conflict.conflictWith.name})`,
            validation_failed: true,
            conflict: conflict.conflictWith
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    // If changing guests but keeping table - TRUST the staff selection
    // Don't auto-reassign tables, just log a warning if capacity looks off
    if (guests && !table_id) {
      const guestCount = parseInt(guests);
      // Just log for debugging, don't block or reassign
      console.log(`Guests updated to ${guestCount} without table change - trusting staff selection`);
    }
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/laluna_reservations?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) {
      const error = await res.text();
      return new Response(JSON.stringify({ error }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const result = await res.json();
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Endpoint to get table configuration (for client sync)
export const OPTIONS: APIRoute = async () => {
  const tables = await getTablesFromSupabase();
  return new Response(JSON.stringify({ tables }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
    }
  });
};
// deploy Thu Sep 24 15:56:15 CST 2026
