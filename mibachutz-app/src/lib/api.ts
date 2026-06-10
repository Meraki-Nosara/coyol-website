import { supabase } from './supabase';

// Types
export interface User {
  id: string;
  phone: string;
  name: string;
  baby_age: string;
  city: string;
  area: string;
  about: string;
  photo_url?: string;
  push_token?: string;
  status: 'waiting' | 'invited' | 'in_group';
  created_at: string;
}

export interface Group {
  id: string;
  city: string;
  area: string;
  name: string;
  status: 'filling' | 'pre_meeting' | 'locked' | 'active';
  meeting_location?: string;
  meeting_time?: string;
  min_members: number;
  created_at: string;
  locked_at?: string;
}

export interface Message {
  id: string;
  group_id: string;
  user_id?: string;
  content: string;
  message_type: 'text' | 'image' | 'intro' | 'system';
  image_url?: string;
  is_intro: boolean;
  created_at: string;
  user?: User;
}

// Sign up a new user
export async function signUp(data: {
  phone: string;
  name: string;
  baby_age: string;
  city: string;
  area: string;
  about: string;
  photo_url?: string;
  push_token?: string;
}): Promise<{ user: User | null; error: string | null }> {
  const { data: user, error } = await supabase
    .from('users')
    .insert([{ ...data, status: 'waiting' }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { user: null, error: 'מספר טלפון כבר רשום' };
    }
    return { user: null, error: error.message };
  }

  return { user, error: null };
}

// Get user by phone
export async function getUserByPhone(phone: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();
  return data;
}

// Get user's current group
export async function getUserGroup(userId: string): Promise<Group | null> {
  const { data } = await supabase
    .from('group_members')
    .select('group_id, groups(*)')
    .eq('user_id', userId)
    .single();
  
  return data?.groups as Group || null;
}

// Get group members with their intros
export async function getGroupMembers(groupId: string): Promise<User[]> {
  const { data } = await supabase
    .from('group_members')
    .select('user_id, users(*)')
    .eq('group_id', groupId)
    .in('status', ['invited', 'confirmed', 'arrived']);
  
  return data?.map(d => d.users as User) || [];
}

// Get messages for a group
export async function getMessages(groupId: string, limit = 50): Promise<Message[]> {
  const { data } = await supabase
    .from('messages')
    .select('*, user:users(*)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(limit);
  
  return data || [];
}

// Send a message
export async function sendMessage(
  groupId: string, 
  userId: string, 
  content: string,
  type: 'text' | 'image' | 'intro' = 'text',
  imageUrl?: string
): Promise<Message | null> {
  const { data } = await supabase
    .from('messages')
    .insert([{
      group_id: groupId,
      user_id: userId,
      content,
      message_type: type,
      image_url: imageUrl,
      is_intro: type === 'intro'
    }])
    .select('*, user:users(*)')
    .single();
  
  return data;
}

// Post user's intro to group chat
export async function postIntro(groupId: string, userId: string): Promise<boolean> {
  // Get user data
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (!user) return false;

  // Create intro message
  const introContent = `👋 ${user.name}\n👶 ${user.baby_age}\n📍 ${user.area}\n\n${user.about}`;
  
  await sendMessage(groupId, userId, introContent, 'intro', user.photo_url);
  return true;
}

// Confirm attendance for meetup
export async function confirmMeetup(groupId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('group_members')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('group_id', groupId)
    .eq('user_id', userId);
  
  return !error;
}

// Check in at meetup (with location)
export async function checkIn(
  meetupId: string, 
  userId: string, 
  lat: number, 
  lng: number
): Promise<{ success: boolean; error?: string }> {
  // Get meetup location
  const { data: meetup } = await supabase
    .from('meetups')
    .select('*')
    .eq('id', meetupId)
    .single();
  
  if (!meetup) {
    return { success: false, error: 'מפגש לא נמצא' };
  }

  // Check if within ~100m (rough check)
  if (meetup.location_lat && meetup.location_lng) {
    const distance = getDistanceKm(lat, lng, meetup.location_lat, meetup.location_lng);
    if (distance > 0.15) { // 150m tolerance
      return { success: false, error: 'את לא במיקום המפגש' };
    }
  }

  // Record check-in
  const { error } = await supabase
    .from('checkins')
    .insert([{ meetup_id: meetupId, user_id: userId, lat, lng }]);
  
  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'כבר עשית צ\'ק-אין' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Get current meetup for a group
export async function getCurrentMeetup(groupId: string) {
  const { data } = await supabase
    .from('meetups')
    .select('*')
    .eq('group_id', groupId)
    .in('status', ['scheduled', 'in_progress'])
    .order('scheduled_for', { ascending: true })
    .limit(1)
    .single();
  
  return data;
}

// Get check-in count for a meetup
export async function getMeetupAttendance(meetupId: string): Promise<number> {
  const { count } = await supabase
    .from('checkins')
    .select('*', { count: 'exact', head: true })
    .eq('meetup_id', meetupId);
  
  return count || 0;
}

// Get area stats (for signup page)
export async function getAreaStats(city: string, area: string): Promise<{ waiting: number; groups: number }> {
  const { count: waiting } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('city', city)
    .eq('area', area)
    .eq('status', 'waiting');
  
  const { count: groups } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true })
    .eq('city', city)
    .eq('area', area);
  
  return { waiting: waiting || 0, groups: groups || 0 };
}

// Subscribe to messages (realtime)
export function subscribeToMessages(groupId: string, callback: (message: Message) => void) {
  return supabase
    .channel(`messages:${groupId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
      async (payload) => {
        // Fetch full message with user
        const { data } = await supabase
          .from('messages')
          .select('*, user:users(*)')
          .eq('id', payload.new.id)
          .single();
        if (data) callback(data);
      }
    )
    .subscribe();
}

// Helper: Calculate distance between two points (km)
function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Upload photo to Supabase Storage
export async function uploadPhoto(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const path = `photos/${userId}.${ext}`;
  
  const { error } = await supabase.storage
    .from('mibachutz')
    .upload(path, file, { upsert: true });
  
  if (error) return null;
  
  const { data } = supabase.storage
    .from('mibachutz')
    .getPublicUrl(path);
  
  return data.publicUrl;
}
