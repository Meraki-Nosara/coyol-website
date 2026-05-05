-- La Luna Reservations - Simple Schema
-- Run this in Supabase SQL Editor (supabase.com/dashboard)

-- Reservations table
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time time not null,
  guests int not null default 2,
  guest_name text not null,
  guest_email text,
  guest_phone text,
  zone_preference text,
  table_id text,
  special_requests text,
  status text default 'confirmed',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table reservations enable row level security;

-- Allow public to create reservations (for booking form)
create policy "Anyone can create reservations"
  on reservations for insert
  with check (true);

-- Allow public to read all reservations (for admin dashboard)
create policy "Anyone can view reservations"
  on reservations for select
  using (true);

-- Allow updates (for admin)
create policy "Anyone can update reservations"
  on reservations for update
  using (true);

-- Allow deletes (for admin)
create policy "Anyone can delete reservations"
  on reservations for delete
  using (true);

-- Index for fast date lookups
create index if not exists idx_reservations_date on reservations(date);
