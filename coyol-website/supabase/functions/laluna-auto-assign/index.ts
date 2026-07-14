// Supabase Edge Function: Auto-assign tables for La Luna reservations
// Triggers on INSERT to laluna_reservations when table_id is null

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://mnxjzvqgrrodalcmtntf.supabase.co'
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// La Luna table configuration with capacities
const TABLES = [
  // Jardin (Garden) - Priority 1
  { id: 't17', zone: 'jardin', minCovers: 2, maxCovers: 4, priority: 10 },
  { id: 't18', zone: 'jardin', minCovers: 2, maxCovers: 4, priority: 11 },
  { id: 't18-1', zone: 'jardin', minCovers: 2, maxCovers: 4, priority: 12 },
  { id: 't19', zone: 'jardin', minCovers: 4, maxCovers: 6, priority: 13 },
  { id: 't20', zone: 'jardin', minCovers: 2, maxCovers: 4, priority: 14 },
  { id: 't21', zone: 'jardin', minCovers: 2, maxCovers: 4, priority: 15 },
  { id: 't22', zone: 'jardin', minCovers: 4, maxCovers: 6, priority: 16 },
  { id: 't23', zone: 'jardin', minCovers: 2, maxCovers: 4, priority: 17 },
  { id: 't24', zone: 'jardin', minCovers: 2, maxCovers: 4, priority: 18 },
  { id: 't25', zone: 'jardin', minCovers: 4, maxCovers: 8, priority: 19 },
  { id: 't26', zone: 'jardin', minCovers: 4, maxCovers: 6, priority: 20 },
  { id: 't27', zone: 'jardin', minCovers: 2, maxCovers: 4, priority: 21 },
  { id: 'sofa-16', zone: 'jardin', minCovers: 2, maxCovers: 4, priority: 5 },
  
  // Fantasma tables (larger groups)
  { id: 'fan-1', zone: 'fantasma', minCovers: 4, maxCovers: 8, priority: 30 },
  { id: 'fan-2', zone: 'fantasma', minCovers: 4, maxCovers: 8, priority: 31 },
  { id: 'fan-19', zone: 'fantasma', minCovers: 2, maxCovers: 4, priority: 32 },
  
  // Terraza - Priority 2
  { id: 'terr-1', zone: 'terraza', minCovers: 2, maxCovers: 4, priority: 40 },
  { id: 'terr-2', zone: 'terraza', minCovers: 2, maxCovers: 4, priority: 41 },
  { id: 'terr-3', zone: 'terraza', minCovers: 2, maxCovers: 4, priority: 42 },
  { id: 'terr-4', zone: 'terraza', minCovers: 4, maxCovers: 6, priority: 43 },
  
  // Inside - Priority 3 (last resort)
  { id: 'in-1', zone: 'inside', minCovers: 2, maxCovers: 4, priority: 50 },
  { id: 'in-2', zone: 'inside', minCovers: 2, maxCovers: 4, priority: 51 },
  { id: 'in-3', zone: 'inside', minCovers: 2, maxCovers: 4, priority: 52 },
]

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

function findBestTable(guests: number, date: string, time: string, existingReservations: any[], zonePreference?: string): string | null {
  const resMinutes = parseTime(time)
  
  // Sort tables by priority
  let availableTables = [...TABLES].sort((a, b) => a.priority - b.priority)
  
  // If zone preference, prioritize that zone
  if (zonePreference && zonePreference !== 'any') {
    availableTables.sort((a, b) => {
      const aMatch = a.zone === zonePreference ? 0 : 1
      const bMatch = b.zone === zonePreference ? 0 : 1
      return aMatch - bMatch || a.priority - b.priority
    })
  }
  
  for (const table of availableTables) {
    // Check capacity
    const effectiveMin = table.maxCovers <= 6 ? Math.max(1, table.minCovers - 1) : table.minCovers
    if (guests < effectiveMin || guests > table.maxCovers) continue
    
    // Check for conflicts (2-hour window)
    const hasConflict = existingReservations.some(r => {
      if (r.table_id !== table.id) return false
      if (r.status === 'cancelled' || r.status === 'no-show') return false
      const rMinutes = parseTime(r.time)
      return Math.abs(rMinutes - resMinutes) < 120
    })
    
    if (!hasConflict) {
      return table.id
    }
  }
  
  return null
}

serve(async (req) => {
  try {
    const { record, type } = await req.json()
    
    // Only process new reservations without a table
    if (type !== 'INSERT' || record.table_id) {
      return new Response(JSON.stringify({ skipped: true, reason: 'Not a new unassigned reservation' }), { status: 200 })
    }
    
    // Skip cancelled reservations
    if (record.status === 'cancelled' || record.status === 'no-show') {
      return new Response(JSON.stringify({ skipped: true, reason: 'Cancelled or no-show' }), { status: 200 })
    }
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    // Get existing reservations for that date
    const { data: existingReservations, error: fetchError } = await supabase
      .from('laluna_reservations')
      .select('*')
      .eq('date', record.date)
      .neq('id', record.id)
    
    if (fetchError) {
      console.error('Failed to fetch existing reservations:', fetchError)
      return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 })
    }
    
    // Find best available table
    const bestTable = findBestTable(
      record.guests,
      record.date,
      record.time,
      existingReservations || [],
      record.zone_preference
    )
    
    if (!bestTable) {
      console.log('No suitable table found for:', record.guest_name, record.guests, 'guests')
      return new Response(JSON.stringify({ skipped: true, reason: 'No available table found' }), { status: 200 })
    }
    
    // Update the reservation with the assigned table
    const { error: updateError } = await supabase
      .from('laluna_reservations')
      .update({ table_id: bestTable })
      .eq('id', record.id)
    
    if (updateError) {
      console.error('Failed to assign table:', updateError)
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
    }
    
    console.log(`Auto-assigned table ${bestTable} to ${record.guest_name} (${record.guests} guests)`)
    
    return new Response(JSON.stringify({ 
      success: true, 
      assigned_table: bestTable,
      guest_name: record.guest_name,
      guests: record.guests
    }), { status: 200 })
    
  } catch (error) {
    console.error('Auto-assign error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
