import { createClient } from '@supabase/supabase-js';

// Mibachutz Supabase project
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://fkikzryelozciailbryh.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ZOLf9xFyix_92BjpOggZxw_PID3uDli';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Mom {
  id: string;
  name: string;
  phone: string;
  email?: string;
  baby_name?: string;
  baby_birth_date?: string;
  baby_age_range?: string;
  neighborhood_id?: string;
  group_id?: string;
  is_available: boolean;
  always_available: boolean;
  latitude?: number;
  longitude?: number;
  last_available_at?: string;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  neighborhood_id: string;
  age_range: string;
  member_count: number;
  max_members: number;
  is_full: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string;
  group_id?: string;
  text: string;
  created_at: string;
  sender?: Mom;
}

export interface Neighborhood {
  id: string;
  name_he: string;
  name_en?: string;
  latitude?: number;
  longitude?: number;
}

// Helper functions
export async function getMom(phone: string): Promise<Mom | null> {
  const { data, error } = await supabase
    .from('moms')
    .select('*')
    .eq('phone', phone)
    .single();
  
  if (error) return null;
  return data;
}

export async function getGroupMembers(groupId: string): Promise<Mom[]> {
  const { data, error } = await supabase
    .from('moms')
    .select('*')
    .eq('group_id', groupId)
    .eq('is_active', true);
  
  if (error) return [];
  return data || [];
}

export async function getMessages(userId: string, otherUserId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id(id, name, baby_name)
    `)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });
  
  if (error) return [];
  return data || [];
}

export async function sendMessage(senderId: string, receiverId: string, text: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      text
    })
    .select()
    .single();
  
  if (error) return null;
  return data;
}

export async function getGroupMessages(groupId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id(id, name, baby_name)
    `)
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });
  
  if (error) return [];
  return data || [];
}

export async function sendGroupMessage(senderId: string, groupId: string, text: string): Promise<Message | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      group_id: groupId,
      text
    })
    .select()
    .single();
  
  if (error) return null;
  return data;
}

export async function updateAvailability(momId: string, available: boolean, lat?: number, lng?: number) {
  const { error } = await supabase
    .from('moms')
    .update({
      is_available: available,
      latitude: lat,
      longitude: lng,
      last_available_at: available ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString()
    })
    .eq('id', momId);
  
  return !error;
}

export async function getAvailableMoms(groupId?: string): Promise<Mom[]> {
  let query = supabase
    .from('moms')
    .select('*')
    .eq('is_active', true)
    .or('is_available.eq.true,always_available.eq.true');
  
  if (groupId) {
    query = query.eq('group_id', groupId);
  }
  
  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

// Real-time subscriptions
export function subscribeToMessages(
  userId: string, 
  callback: (message: Message) => void
) {
  return supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
}

export function subscribeToGroupMessages(
  groupId: string,
  callback: (message: Message) => void
) {
  return supabase
    .channel(`group-${groupId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `group_id=eq.${groupId}`
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
}

export function subscribeToAvailability(
  groupId: string,
  callback: (mom: Mom) => void
) {
  return supabase
    .channel(`availability-${groupId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'moms',
        filter: `group_id=eq.${groupId}`
      },
      (payload) => {
        callback(payload.new as Mom);
      }
    )
    .subscribe();
}
