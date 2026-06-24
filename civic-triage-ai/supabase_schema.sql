-- 1. Enable PostGIS extension for spatial queries
create extension if not exists postgis with schema extensions;

-- 2. Create the reports table
create table public.reports (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    
    -- Spatial data
    location geography(POINT) not null,
    lat double precision not null,
    lng double precision not null,
    
    -- Report details
    image_url text not null,
    description text,
    
    -- AI Generated Fields
    ai_category text,
    ai_severity integer,
    ai_confidence double precision,
    ai_justification text,
    ai_suggested_department text,
    ai_estimated_complexity text,
    
    -- Status and deduplication
    status text default 'open' check (status in ('open', 'in_progress', 'resolved', 'duplicate', 'rejected')),
    merged_into_id uuid references public.reports(id)
);

-- 3. Create spatial index for fast distance queries
create index reports_geo_index on public.reports using gist (location);

-- 4. Set up Row Level Security (RLS) - simplified for hackathon
alter table public.reports enable row level security;

-- Allow public read access to reports
create policy "Allow public read access"
  on public.reports
  for select
  to public
  using (true);

-- Allow public insert (Citizen submissions)
create policy "Allow public insert"
  on public.reports
  for insert
  to public
  with check (true);

-- Allow public update (for officials, simplified for demo)
create policy "Allow public update"
  on public.reports
  for update
  to public
  using (true);

-- 5. Create a Postgres function to find reports within a radius
-- This will be called via Supabase RPC to check for nearby duplicates
create or replace function get_reports_within_radius(
  query_lat double precision,
  query_lng double precision,
  radius_meters double precision
)
returns table (
  id uuid,
  lat double precision,
  lng double precision,
  image_url text,
  ai_category text,
  ai_severity integer,
  status text,
  distance_meters double precision
)
language sql
as $$
  select
    id,
    lat,
    lng,
    image_url,
    ai_category,
    ai_severity,
    status,
    st_distance(location, st_point(query_lng, query_lat)::geography) as distance_meters
  from
    public.reports
  where
    status = 'open'
    and st_dwithin(location, st_point(query_lng, query_lat)::geography, radius_meters)
  order by
    distance_meters asc;
$$;
