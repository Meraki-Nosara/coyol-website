import type { APIRoute } from 'astro';

const SUPABASE_URL = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const SUPABASE_KEY = 'sb_secret_4gCkzhlfhZzJLynh4NOZDQ_Vm9o4mng';

// La Luna table configuration with capacities - SERVER-SIDE SOURCE OF TRUTH
const TABLES: Record<string, { minCovers: number; maxCovers: number; zone: string; priority: number }> = {
  // Inside
  'high-1': { minCovers: 2, maxCovers: 4, zone: 'inside', priority: 50 },
  'high-2': { minCovers: 2, maxCovers: 4, zone: 'inside', priority: 51 },
  'indoor-sofa-1': { minCovers: 2, maxCovers: 4, zone: 'inside', priority: 52 },
  'bar': { minCovers: 1, maxCovers: 8, zone: 'inside', priority: 60 },
  'indoor-sofa-2': { minCovers: 4, maxCovers: 6, zone: 'inside', priority: 53 },
  'indoor-sofa-3': { minCovers: 4, maxCovers: 6, zone: 'inside', priority: 54 },
  'indoor-sof': { minCovers: 2, maxCovers: 4, zone: 'inside', priority: 55 },
  'indoor-sofa-4': { minCovers: 2, maxCovers: 4, zone: 'inside', priority: 56 },
  'indoor-sofa-5': { minCovers: 2, maxCovers: 4, zone: 'inside', priority: 57 },
  
  // Terraza
  'terr-1': { minCovers: 2, maxCovers: 4, zone: 'terraza', priority: 40 },
  'terr-2': { minCovers: 2, maxCovers: 4, zone: 'terraza', priority: 41 },
  'terr-3': { minCovers: 2, maxCovers: 4, zone: 'terraza', priority: 42 },
  'terr-4': { minCovers: 4, maxCovers: 6, zone: 'terraza', priority: 43 },
  'terr-5': { minCovers: 2, maxCovers: 4, zone: 'terraza', priority: 44 },
  'terr-6': { minCovers: 2, maxCovers: 4, zone: 'terraza', priority: 45 },
  
  // Jardin (Garden) - Best tables, priority
  't17': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 10 },
  't18': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 11 },
  't18-1': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 12 },
  't19': { minCovers: 4, maxCovers: 6, zone: 'jardin', priority: 13 },
  't20': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 14 },
  't21': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 15 },
  't22': { minCovers: 4, maxCovers: 6, zone: 'jardin', priority: 16 },
  't23': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 17 },
  't24': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 18 },
  't25': { minCovers: 4, maxCovers: 8, zone: 'jardin', priority: 19 },
  't26': { minCovers: 4, maxCovers: 6, zone: 'jardin', priority: 20 },
  't27': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 21 },
  'sofa-16': { minCovers: 2, maxCovers: 4, zone: 'jardin', priority: 5 },
  
  // Fantasma (larger groups)
  'fan-1': { minCovers: 4, maxCovers: 8, zone: 'fantasma', priority: 30 },
  'fan-2': { minCovers: 4, maxCovers: 8, zone: 'fantasma', priority: 31 },
  'fan-19': { minCovers: 2, maxCovers: 4, zone: 'fantasma', priority: 32 },
};

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

function findBestTable(guests: number, date: string, time: string, existingReservations: any[], zonePreference?: string): string | null {
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
    
    // Check for time conflicts (2-hour window)
    const hasConflict = existingReservations.some(r => {
      if (r.table_id !== table.id) return false;
      if (r.status === 'cancelled' || r.status === 'no-show') return false;
      const rMinutes = parseTime(r.time);
      return Math.abs(rMinutes - resMinutes) < 120;
    });
    
    if (!hasConflict) {
      return table.id;
    }
  }
  
  return null; // No table available
}

function validateTableAssignment(tableId: string, guests: number): { valid: boolean; error?: string; suggested?: string } {
  const table = TABLES[tableId];
  
  if (!table) {
    return { valid: false, error: `Unknown table: ${tableId}` };
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
    
    // If table provided, validate capacity
    if (table_id) {
      const validation = validateTableAssignment(table_id, guestCount);
      if (!validation.valid) {
        // Don't reject - just log warning and try to find a better table
        console.warn(`Table validation failed: ${validation.error}`);
        assignedTable = null; // Will auto-assign below
      }
    }
    
    // Auto-assign table if not provided or validation failed
    if (!assignedTable) {
      const existingReservations = await getExistingReservations(date);
      assignedTable = findBestTable(guestCount, date, time, existingReservations, zone_preference);
      
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
    
    // If changing table assignment, validate capacity
    if (table_id && guests) {
      const guestCount = parseInt(guests);
      const validation = validateTableAssignment(table_id, guestCount);
      if (!validation.valid) {
        return new Response(JSON.stringify({ 
          error: validation.error,
          validation_failed: true 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // If changing guests but keeping table, validate
    if (guests && !table_id) {
      // Get current reservation to check table
      const currentRes = await fetch(`${SUPABASE_URL}/rest/v1/laluna_reservations?id=eq.${id}&select=table_id`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      });
      const current = await currentRes.json();
      
      if (current?.[0]?.table_id) {
        const guestCount = parseInt(guests);
        const validation = validateTableAssignment(current[0].table_id, guestCount);
        if (!validation.valid) {
          // Find a new table for the updated guest count
          const existingReservations = await getExistingReservations(date || new Date().toISOString().split('T')[0], id);
          const newTable = findBestTable(guestCount, date || new Date().toISOString().split('T')[0], time || '18:00', existingReservations);
          
          if (newTable) {
            body.table_id = newTable;
          } else {
            body.table_id = null; // TBA
          }
        }
      }
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
  return new Response(JSON.stringify({ tables: TABLES }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS'
    }
  });
};
