import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

// Combined tables - DISABLED
// All tables are independent - no automatic blocking
const COMBINED_TABLES: Record<string, string[]> = {};

// Get all tables that would be blocked by a given table assignment
function getBlockedTables(tableId: string): string[] {
  const blocked = new Set<string>();
  
  // Handle multiple tables (comma-separated: "t20,t21" or plus-separated: "t20+t21")
  const separator = tableId.includes(',') ? ',' : tableId.includes('+') ? '+' : null;
  
  if (separator) {
    tableId.split(separator).forEach(t => {
      const trimmed = t.trim().toLowerCase();
      if (trimmed) {
        blocked.add(trimmed);
        const related = COMBINED_TABLES[trimmed];
        if (related) related.forEach(r => blocked.add(r));
      }
    });
  } else {
    // Single table
    blocked.add(tableId.toLowerCase());
    const related = COMBINED_TABLES[tableId.toLowerCase()];
    if (related) related.forEach(r => blocked.add(r));
  }
  
  return Array.from(blocked);
}

// Coyol table configuration - fetched from Supabase floor layout
// Naming: I=Inside, T=Terraza, J=Jardin (no conflicts!)
let cachedTables: Record<string, { minCovers: number; maxCovers: number; zone: string; priority: number }> | null = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute cache

async function getTablesFromSupabase(): Promise<Record<string, { minCovers: number; maxCovers: number; zone: string; priority: number }>> {
  // Return cache if still valid
  if (cachedTables && Date.now() - cacheTime < CACHE_TTL) {
    return cachedTables;
  }
  
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/restaurant_settings?key=eq.coyol_floor_layout&select=value`, {
      headers: { 'apikey': SUPABASE_KEY }
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.length > 0 && data[0].value) {
        const layout = JSON.parse(data[0].value);
        const tables: Record<string, { minCovers: number; maxCovers: number; zone: string; priority: number }> = {};
        
        // Process each zone
        const zones = ['inside', 'terraza', 'jardin'];
        zones.forEach((zone, zoneIndex) => {
          const zoneTables = layout[zone] || [];
          zoneTables.forEach((t: any, i: number) => {
            tables[t.id.toLowerCase()] = {
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
    console.error('Failed to fetch Coyol table layout:', e);
  }
  
  // Fallback to defaults if fetch fails
  return getDefaultTables();
}

function getDefaultTables(): Record<string, { minCovers: number; maxCovers: number; zone: string; priority: number }> {
  return {
    // Fallback hardcoded tables (used if Supabase fails)
    'i1': { minCovers: 2, maxCovers: 4, zone: 'inside', priority: 10 },
    'i2': { minCovers: 2, maxCovers: 4, zone: 'inside', priority: 11 },
    'i3': { minCovers: 2, maxCovers: 4, zone: 'inside', priority: 12 },
    't20': { minCovers: 2, maxCovers: 4, zone: 'terraza', priority: 20 },
    't21': { minCovers: 1, maxCovers: 2, zone: 'terraza', priority: 21 },
    'j1': { minCovers: 4, maxCovers: 8, zone: 'jardin', priority: 30 },
    'j2': { minCovers: 4, maxCovers: 8, zone: 'jardin', priority: 31 },
  };
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

async function getExistingReservations(date: string, excludeId?: string): Promise<any[]> {
  let query = `${SUPABASE_URL}/rest/v1/coyol_reservations?date=eq.${date}&select=*`;
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

function checkTableTimeConflict(tableId: string, date: string, time: string, existingReservations: any[]): { hasConflict: boolean; conflictWith?: any; conflictingTable?: string } {
  const resMinutes = parseTime(time);
  const tablesToCheck = getBlockedTables(tableId.toLowerCase());
  
  for (const r of existingReservations) {
    // Skip cancelled/no-show
    if (r.status === 'cancelled' || r.status === 'no-show') continue;
    
    // Check if this reservation's table conflicts with our target (including combined tables)
    const reservationBlockedTables = getBlockedTables((r.table_id || '').toLowerCase());
    const hasTableOverlap = tablesToCheck.some(t => reservationBlockedTables.includes(t));
    if (!hasTableOverlap) continue;
    
    // Check 90-minute conflict window (Coyol has faster turns than La Luna)
    const rMinutes = parseTime(r.time);
    if (Math.abs(rMinutes - resMinutes) < 90) {
      return { hasConflict: true, conflictWith: r, conflictingTable: r.table_id };
    }
  }
  
  return { hasConflict: false };
}

async function validateTableAssignment(tableId: string, guests: number): Promise<{ valid: boolean; error?: string }> {
  const TABLES = await getTablesFromSupabase();
  
  // Handle multiple tables (comma-separated)
  if (tableId.includes(',')) {
    const tables = tableId.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    let totalCapacity = 0;
    
    for (const t of tables) {
      const table = TABLES[t];
      if (!table) {
        totalCapacity += 4; // Assume 4 for unknown
        continue;
      }
      totalCapacity += table.maxCovers;
    }
    
    if (guests > totalCapacity) {
      return { 
        valid: false, 
        error: `Combined tables ${tableId} have max capacity of ${totalCapacity} (you have ${guests} guests)` 
      };
    }
    
    return { valid: true };
  }
  
  const table = TABLES[tableId.toLowerCase()];
  
  if (!table) {
    // Unknown table - allow it (might be custom/new table)
    return { valid: true };
  }
  
  // Allow 1 person less than min for small tables
  const effectiveMin = table.maxCovers <= 4 ? Math.max(1, table.minCovers - 1) : table.minCovers;
  
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

// Check if restaurant is full for a given time slot
async function isRestaurantFull(date: string, time: string, existingReservations: any[], additionalGuests: number = 0): Promise<{ full: boolean; currentCovers: number; totalCapacity: number; availableCapacity: number }> {
  const TABLES = await getTablesFromSupabase();
  const resMinutes = parseTime(time);
  
  // Calculate total capacity (only tables available for online booking)
  let totalCapacity = 0;
  for (const [id, config] of Object.entries(TABLES)) {
    // Check if table is available for online (default true if not set)
    const layout = await getFloorLayoutFromSupabase();
    let isOnline = true;
    if (layout) {
      const zones = ['inside', 'terraza', 'jardin'];
      for (const zone of zones) {
        const table = (layout[zone] || []).find((t: any) => t.id.toLowerCase() === id.toLowerCase());
        if (table && table.onlineAvailable === false) {
          isOnline = false;
          break;
        }
      }
    }
    if (isOnline) {
      totalCapacity += config.maxCovers;
    }
  }
  
  // Count current covers in the 90-minute window
  let currentCovers = 0;
  for (const r of existingReservations) {
    if (r.status === 'cancelled' || r.status === 'no-show') continue;
    const rMinutes = parseTime(r.time);
    // Check if reservation overlaps with requested time (90-min window)
    if (Math.abs(rMinutes - resMinutes) < 90) {
      currentCovers += parseInt(r.guests) || 2;
    }
  }
  
  const availableCapacity = totalCapacity - currentCovers;
  const full = (currentCovers + additionalGuests) > totalCapacity;
  
  return { full, currentCovers, totalCapacity, availableCapacity };
}

// Get floor layout from Supabase
async function getFloorLayoutFromSupabase(): Promise<any | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/restaurant_settings?key=eq.coyol_floor_layout&select=value`, {
      headers: { 'apikey': SUPABASE_KEY }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.length > 0 && data[0].value) {
        return JSON.parse(data[0].value);
      }
    }
  } catch (e) {
    console.error('Failed to fetch floor layout:', e);
  }
  return null;
}

async function findBestTable(guests: number, date: string, time: string, existingReservations: any[], zonePreference?: string): Promise<string | null> {
  const TABLES = await getTablesFromSupabase();
  const layout = await getFloorLayoutFromSupabase();
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
    // Check if table is available for online reservations
    if (layout) {
      const zones = ['inside', 'terraza', 'jardin'];
      let isOnline = true;
      for (const zone of zones) {
        const layoutTable = (layout[zone] || []).find((t: any) => t.id.toLowerCase() === table.id.toLowerCase());
        if (layoutTable && layoutTable.onlineAvailable === false) {
          isOnline = false;
          break;
        }
      }
      if (!isOnline) continue; // Skip tables not available online
    }
    
    // Check capacity
    const effectiveMin = table.maxCovers <= 4 ? Math.max(1, table.minCovers - 1) : table.minCovers;
    if (guests < effectiveMin || guests > table.maxCovers) continue;
    
    // Check for time conflicts (90-min window) - including combined tables
    const tablesToCheck = getBlockedTables(table.id.toLowerCase());
    const hasConflict = existingReservations.some(r => {
      if (r.status === 'cancelled' || r.status === 'no-show') return false;
      const reservationBlockedTables = getBlockedTables((r.table_id || '').toLowerCase());
      const hasTableOverlap = tablesToCheck.some(t => reservationBlockedTables.includes(t));
      if (!hasTableOverlap) return false;
      const rMinutes = parseTime(r.time);
      return Math.abs(rMinutes - resMinutes) < 90;
    });
    
    if (!hasConflict) {
      return table.id;
    }
  }
  
  return null;
}

// GET - fetch reservations
export const GET: APIRoute = async ({ url }) => {
  const date = url.searchParams.get('date');
  const id = url.searchParams.get('id');
  
  let query = `${SUPABASE_URL}/rest/v1/coyol_reservations?select=*`;
  if (date) query += `&date=eq.${date}`;
  if (id) query += `&id=eq.${id}`;
  query += '&order=time.asc';
  
  const res = await fetch(query, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    }
  });
  
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// POST - create reservation with auto table assignment
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { guests, date, time, zone_preference, ...rest } = body;
    
    const guestCount = parseInt(guests) || 2;
    const existingReservations = await getExistingReservations(date);
    
    // Check if restaurant is full for this time slot
    const capacityCheck = await isRestaurantFull(date, time, existingReservations, guestCount);
    if (capacityCheck.full) {
      return new Response(JSON.stringify({
        error: `Lo sentimos, el restaurante está lleno para este horario. Capacidad: ${capacityCheck.totalCapacity}, Reservado: ${capacityCheck.currentCovers}. Por favor llame para lista de espera.`,
        error_en: `Sorry, the restaurant is fully booked for this time slot. Capacity: ${capacityCheck.totalCapacity}, Booked: ${capacityCheck.currentCovers}. Please call for waitlist.`,
        restaurant_full: true,
        capacity: capacityCheck
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // If table provided, check for conflicts FIRST
    let assignedTable = body.table_id;
    if (assignedTable) {
      const conflict = checkTableTimeConflict(assignedTable, date, time, existingReservations);
      if (conflict.hasConflict) {
        return new Response(JSON.stringify({
          error: `Mesa ${conflict.conflictingTable} ya tiene reserva a las ${conflict.conflictWith.time} (${conflict.conflictWith.name}). No se puede asignar.`,
          validation_failed: true,
          conflict: conflict.conflictWith
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      // Auto-assign table if not provided
      assignedTable = await findBestTable(guestCount, date, time, existingReservations, zone_preference);
      
      // BLOCK if no table available (prevents overbooking)
      if (!assignedTable) {
        return new Response(JSON.stringify({
          error: `Lo sentimos, no hay mesas disponibles para ${guestCount} personas a las ${time}. Por favor intente otro horario o llame para lista de espera.`,
          error_en: `Sorry, no tables available for ${guestCount} guests at ${time}. Please try a different time or call for waitlist.`,
          no_table_available: true
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    const reservation = {
      ...rest,
      guests: guestCount,
      date,
      time,
      table_id: assignedTable,
      status: 'confirmed',
      created_at: new Date().toISOString()
    };
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/coyol_reservations`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(reservation)
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
    const guest_name = rest.name;
    const guest_phone = rest.phone;
    const guest_email = rest.email;
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
          const phoneCheck = await fetch(`${SUPABASE_URL}/rest/v1/coyol_guests?phone=eq.${encodeURIComponent(guest_phone)}&limit=1`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
          });
          const phoneResults = await phoneCheck.json();
          if (phoneResults.length > 0) existingGuest = phoneResults[0];
        }
        
        if (!existingGuest && guest_email) {
          const emailCheck = await fetch(`${SUPABASE_URL}/rest/v1/coyol_guests?email=eq.${encodeURIComponent(guest_email)}&limit=1`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
          });
          const emailResults = await emailCheck.json();
          if (emailResults.length > 0) existingGuest = emailResults[0];
        }
        
        if (existingGuest) {
          await fetch(`${SUPABASE_URL}/rest/v1/coyol_guests?id=eq.${existingGuest.id}`, {
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
          await fetch(`${SUPABASE_URL}/rest/v1/coyol_guests`, {
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

// PATCH - update reservation with conflict validation
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
    
    // If changing table assignment, check time conflicts (capacity is just a warning)
    if (table_id) {
      // Get current reservation to check date/time AND guests
      const currentRes = await fetch(`${SUPABASE_URL}/rest/v1/coyol_reservations?id=eq.${id}&select=date,time,guests`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      });
      const current = await currentRes.json();
      
      if (current?.[0]) {
        // Capacity validation is informational only - trust manual selection
        const guestCount = guests ? parseInt(guests) : (current[0].guests || 2);
        const validation = await validateTableAssignment(table_id, guestCount);
        if (!validation.valid) {
          console.warn(`Table capacity warning (staff override): ${validation.error}`);
          // Don't block - staff knows what they're doing
        }
        
        // Time conflicts ARE a hard block
        const checkDate = date || current[0].date;
        const checkTime = time || current[0].time;
        const existingReservations = await getExistingReservations(checkDate, id);
        const conflict = checkTableTimeConflict(table_id, checkDate, checkTime, existingReservations);
        
        if (conflict.hasConflict) {
          return new Response(JSON.stringify({ 
            error: `Mesa ${conflict.conflictingTable} ya tiene reserva a las ${conflict.conflictWith.time} (${conflict.conflictWith.name}). No se puede asignar.`,
            validation_failed: true,
            conflict: conflict.conflictWith
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    const res = await fetch(`${SUPABASE_URL}/rest/v1/coyol_reservations?id=eq.${id}`, {
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
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// DELETE - cancel reservation
export const DELETE: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing reservation id' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Soft delete - mark as cancelled
  const res = await fetch(`${SUPABASE_URL}/rest/v1/coyol_reservations?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ status: 'cancelled', table_id: null })
  });
  
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'Failed to cancel' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
