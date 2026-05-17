import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const supabaseAnonKey = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Coyol Reservations
export async function createCoyolReservation(reservation: {
  date: string;
  time: string;
  guests: number;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  zone_preference?: string;
  table_id?: string;
  special_requests?: string;
}) {
  const { data, error } = await supabase
    .from('coyol_reservations')
    .insert([{ ...reservation, status: 'confirmed' }])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCoyolReservations(date?: string) {
  let query = supabase
    .from('coyol_reservations')
    .select('*')
    .order('time', { ascending: true });
  
  if (date) {
    query = query.eq('date', date);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateCoyolReservation(id: string, updates: Partial<{
  status: string;
  table_id: string;
  special_requests: string;
}>) {
  const { data, error } = await supabase
    .from('coyol_reservations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function cancelCoyolReservation(cancelToken: string) {
  const { data, error } = await supabase
    .from('coyol_reservations')
    .update({ status: 'cancelled' })
    .eq('cancel_token', cancelToken)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCoyolReservationByToken(cancelToken: string) {
  const { data, error } = await supabase
    .from('coyol_reservations')
    .select('*')
    .eq('cancel_token', cancelToken)
    .single();
  
  if (error) throw error;
  return data;
}
