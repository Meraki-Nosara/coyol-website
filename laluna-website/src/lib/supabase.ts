import { createClient } from '@supabase/supabase-js';

// Using shared Supabase project
const supabaseUrl = 'https://mnxjzvqgrrodalcmtntf.supabase.co';
const supabaseAnonKey = 'sb_publishable_gO-cG9R8SahPuHyZRaeA_w_ajibiSiD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Guest {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  tags?: string[];
  notes?: string;
  visit_count?: number;
  last_visit?: string;
  created_at?: string;
}

export interface Reservation {
  id?: string;
  guest_id?: string;
  date: string;
  time: string;
  guests: number;
  guest_name: string;
  guest_email?: string;
  guest_phone?: string;
  zone_preference?: string;
  table_id?: string;
  special_requests?: string;
  status: string;
  created_at?: string;
}

export interface Shift {
  id?: string;
  name: string;
  start_time: string;
  end_time: string;
  days: number[];
  active: boolean;
}

// Guest API
export async function getGuests() {
  const { data, error } = await supabase
    .from('laluna_guests')
    .select('*')
    .order('last_visit', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return data || [];
}

export async function createGuest(guest: Omit<Guest, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('laluna_guests')
    .insert([guest])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGuest(id: string, updates: Partial<Guest>) {
  const { data, error } = await supabase
    .from('laluna_guests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function findGuestByPhone(phone: string) {
  const { data, error } = await supabase
    .from('laluna_guests')
    .select('*')
    .eq('phone', phone)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// Reservation API
export async function getReservations(date?: string) {
  let query = supabase
    .from('laluna_reservations')
    .select('*')
    .order('time', { ascending: true });
  
  if (date) {
    query = query.eq('date', date);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createReservation(reservation: Omit<Reservation, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('laluna_reservations')
    .insert([{ ...reservation, status: reservation.status || 'confirmed' }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateReservation(id: string, updates: Partial<Reservation>) {
  const { data, error } = await supabase
    .from('laluna_reservations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Shift API
export async function getShifts() {
  const { data, error } = await supabase
    .from('laluna_shifts')
    .select('*')
    .order('start_time', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateShift(id: string, updates: Partial<Shift>) {
  const { data, error } = await supabase
    .from('laluna_shifts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
