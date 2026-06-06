import { createClient } from '@supabase/supabase-js';

// Alina's Supabase - Mibachutz
const supabaseUrl = 'https://gpljqftohqrnpbdclbrl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwbGpxZnRvaHFybnBiZGNsYnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxMzYxMjcsImV4cCI6MjA2NDcxMjEyN30.WRRz1RimsYcsKCh6ek3ONw_8dTikaM7';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
