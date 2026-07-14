import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data/reservations.json');

interface Reservation {
  id: string;
  restaurant: string;
  date: string;
  time: string;
  guestName: string;
  pax: number;
  tables: string[]; // Array of table IDs (supports combining)
  phone?: string;
  email?: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  createdAt: string;
  updatedAt: string;
  syncStatus?: 'synced' | 'pending'; // For offline support
}

interface ReservationsData {
  restaurants: Record<string, {
    name: string;
    tables: Array<{ id: string; capacity: number; location: string }>;
  }>;
  reservations: Reservation[];
}

function loadData(): ReservationsData {
  if (!fs.existsSync(DATA_FILE)) {
    return { restaurants: {}, reservations: [] };
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data: ReservationsData): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId(): string {
  return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// GET - List reservations (with filters)
export const GET: APIRoute = async ({ url }) => {
  const data = loadData();
  const restaurant = url.searchParams.get('restaurant');
  const date = url.searchParams.get('date');
  const includeConfig = url.searchParams.get('config') === 'true';
  
  let reservations = data.reservations;
  
  if (restaurant) {
    reservations = reservations.filter(r => r.restaurant === restaurant);
  }
  
  if (date) {
    reservations = reservations.filter(r => r.date === date);
  }
  
  // Sort by time
  reservations.sort((a, b) => a.time.localeCompare(b.time));
  
  const response: any = { reservations };
  
  if (includeConfig) {
    response.restaurants = data.restaurants;
  }
  
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// POST - Create or sync reservations
export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();
  const data = loadData();
  
  // Handle bulk sync from offline mode
  if (body.sync && Array.isArray(body.reservations)) {
    const results: Array<{ localId: string; serverId: string; status: string }> = [];
    
    for (const res of body.reservations) {
      if (res.syncStatus === 'pending') {
        // Check if this is an update (has server ID) or new
        const existingIndex = data.reservations.findIndex(r => r.id === res.id);
        
        if (existingIndex >= 0) {
          // Update existing
          data.reservations[existingIndex] = {
            ...res,
            syncStatus: 'synced',
            updatedAt: new Date().toISOString()
          };
          results.push({ localId: res.id, serverId: res.id, status: 'updated' });
        } else {
          // Create new with server ID
          const serverId = generateId();
          data.reservations.push({
            ...res,
            id: serverId,
            syncStatus: 'synced',
            createdAt: res.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          results.push({ localId: res.id, serverId, status: 'created' });
        }
      }
    }
    
    saveData(data);
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Single reservation create
  const reservation: Reservation = {
    id: generateId(),
    restaurant: body.restaurant,
    date: body.date,
    time: body.time,
    guestName: body.guestName,
    pax: body.pax,
    tables: body.tables || [],
    phone: body.phone,
    email: body.email,
    notes: body.notes,
    status: body.status || 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced'
  };
  
  data.reservations.push(reservation);
  saveData(data);
  
  return new Response(JSON.stringify({ success: true, reservation }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// PUT - Update reservation
export const PUT: APIRoute = async ({ request }) => {
  const body = await request.json();
  const data = loadData();
  
  const index = data.reservations.findIndex(r => r.id === body.id);
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Reservation not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  data.reservations[index] = {
    ...data.reservations[index],
    ...body,
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced'
  };
  
  saveData(data);
  
  return new Response(JSON.stringify({ success: true, reservation: data.reservations[index] }), {
    headers: { 'Content-Type': 'application/json' }
  });
};

// DELETE - Cancel/delete reservation
export const DELETE: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'ID required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const data = loadData();
  const index = data.reservations.findIndex(r => r.id === id);
  
  if (index === -1) {
    return new Response(JSON.stringify({ error: 'Reservation not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Soft delete - mark as cancelled
  data.reservations[index].status = 'cancelled';
  data.reservations[index].updatedAt = new Date().toISOString();
  
  saveData(data);
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
