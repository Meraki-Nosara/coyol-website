-- La Luna Reservation System Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Restaurants table
create table restaurants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  phone text,
  email text,
  address text,
  created_at timestamptz default now()
);

-- Zones (Indoor, Patio, Garden)
create table zones (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Tables
create table tables (
  id uuid primary key default uuid_generate_v4(),
  zone_id uuid references zones(id) on delete cascade,
  name text not null,
  capacity int not null default 4,
  type text default 'square', -- square, round, sofa, bar, communal
  position_x int default 0,
  position_y int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Shifts
create table shifts (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  days_active int[] default '{0,1,2,3,4,5,6}', -- 0=Sunday
  created_at timestamptz default now()
);

-- Guests (customer database)
create table guests (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  tags text[] default '{}',
  notes text,
  visit_count int default 0,
  last_visit date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reservation status enum
create type reservation_status as enum (
  'pending',
  'confirmed',
  'seated',
  'completed',
  'cancelled',
  'no_show'
);

-- Reservations
create table reservations (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  table_id uuid references tables(id) on delete set null,
  guest_id uuid references guests(id) on delete set null,
  date date not null,
  time time not null,
  duration_minutes int default 150, -- 2h 30m default
  guests int not null default 2,
  status reservation_status default 'pending',
  guest_name text not null,
  guest_email text,
  guest_phone text,
  zone_preference text,
  special_requests text,
  internal_notes text,
  tags text[] default '{}',
  created_by text,
  is_walk_in boolean default false,
  confirmation_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Settings (key-value store)
create table settings (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  key text not null,
  value jsonb,
  unique(restaurant_id, key)
);

-- Gift certificates
create table gift_certificates (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  code text unique not null,
  amount decimal(10,2) not null,
  balance decimal(10,2) not null,
  purchaser_name text,
  purchaser_email text,
  recipient_name text,
  recipient_email text,
  message text,
  is_redeemed boolean default false,
  expires_at date,
  created_at timestamptz default now()
);

-- Event inquiries
create table event_inquiries (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  event_type text not null, -- wedding, private_dining, corporate, celebration
  event_date date,
  guest_count int,
  name text not null,
  email text not null,
  phone text,
  message text,
  budget_range text,
  status text default 'new', -- new, contacted, quoted, confirmed, declined
  notes text,
  created_at timestamptz default now()
);

-- Indexes
create index idx_reservations_date on reservations(date);
create index idx_reservations_status on reservations(status);
create index idx_reservations_restaurant on reservations(restaurant_id);
create index idx_guests_email on guests(email);
create index idx_guests_phone on guests(phone);

-- Row Level Security
alter table restaurants enable row level security;
alter table zones enable row level security;
alter table tables enable row level security;
alter table shifts enable row level security;
alter table guests enable row level security;
alter table reservations enable row level security;
alter table settings enable row level security;
alter table gift_certificates enable row level security;
alter table event_inquiries enable row level security;

-- Public read access for reservations (for customer-facing booking)
create policy "Public can view available times"
  on tables for select using (is_active = true);

create policy "Public can create reservations"
  on reservations for insert with check (true);

create policy "Guests can view their own reservations"
  on reservations for select using (guest_email = current_setting('app.user_email', true));

-- Insert La Luna data
insert into restaurants (name, slug, phone, email, address) values
  ('La Luna', 'laluna', '+506 2682-0122', 'reservations@lalunanosara.com', 'Playa Pelada, Nosara, Guanacaste, Costa Rica');

-- Get restaurant ID for foreign keys
do $$
declare
  r_id uuid;
  z_indoor uuid;
  z_patio uuid;
  z_garden uuid;
begin
  select id into r_id from restaurants where slug = 'laluna';
  
  -- Create zones
  insert into zones (restaurant_id, name, sort_order) values (r_id, 'Indoor', 1) returning id into z_indoor;
  insert into zones (restaurant_id, name, sort_order) values (r_id, 'Patio Terrace', 2) returning id into z_patio;
  insert into zones (restaurant_id, name, sort_order) values (r_id, 'Garden', 3) returning id into z_garden;
  
  -- Indoor tables
  insert into tables (zone_id, name, capacity, type) values
    (z_indoor, 'High Table 1', 4, 'high'),
    (z_indoor, 'High Table 2', 4, 'high'),
    (z_indoor, 'Indoor Sofa 1', 4, 'sofa'),
    (z_indoor, 'Indoor Sofa 2', 4, 'sofa'),
    (z_indoor, 'Indoor Sofa 3', 4, 'sofa'),
    (z_indoor, 'Indoor Sofa 4', 4, 'sofa'),
    (z_indoor, 'Indoor Sofa 5', 4, 'sofa'),
    (z_indoor, 'Indoor Sofa 6', 4, 'sofa'),
    (z_indoor, 'Bar', 8, 'bar');
  
  -- Patio tables
  insert into tables (zone_id, name, capacity, type) values
    (z_patio, 'Table 1', 6, 'round'),
    (z_patio, 'Table 2', 6, 'round'),
    (z_patio, 'Table 3', 4, 'round'),
    (z_patio, 'Table 4', 4, 'square'),
    (z_patio, 'Table 5', 4, 'square'),
    (z_patio, 'Table 6', 4, 'square'),
    (z_patio, 'Table 7', 4, 'square'),
    (z_patio, 'Table 8', 4, 'square'),
    (z_patio, 'Table 9', 4, 'round'),
    (z_patio, 'Table 10', 4, 'square'),
    (z_patio, 'Table 11', 4, 'square'),
    (z_patio, 'Table 12', 4, 'square');
  
  -- Garden tables
  insert into tables (zone_id, name, capacity, type) values
    (z_garden, 'Table 17', 4, 'square'),
    (z_garden, 'Table 18', 16, 'communal'),
    (z_garden, 'Table 19', 4, 'square'),
    (z_garden, 'Table 20', 4, 'diamond'),
    (z_garden, 'Table 22', 4, 'square'),
    (z_garden, 'Table 24', 4, 'square'),
    (z_garden, 'Table 25', 8, 'round'),
    (z_garden, 'Table 26', 8, 'round'),
    (z_garden, 'Sofa 13', 4, 'sofa'),
    (z_garden, 'Sofa 14', 4, 'sofa'),
    (z_garden, 'Sofa 15', 4, 'sofa'),
    (z_garden, 'Sofa 16', 4, 'sofa'),
    (z_garden, 'Sofa 21', 4, 'sofa'),
    (z_garden, 'Sofa 23', 4, 'sofa');
  
  -- Shifts
  insert into shifts (restaurant_id, name, start_time, end_time) values
    (r_id, 'Lunch', '12:00', '15:00'),
    (r_id, 'Dinner 1', '16:45', '18:30'),
    (r_id, 'Dinner 2', '18:30', '22:00');
  
  -- Default settings
  insert into settings (restaurant_id, key, value) values
    (r_id, 'default_duration', '150'),
    (r_id, 'booking_window_days', '30'),
    (r_id, 'cancellation_hours', '2');
end $$;
