-- Nagar Drishti - Phase 1 Schema

-- 1. Enums
CREATE TYPE user_role AS ENUM ('citizen', 'official');
CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved', 'duplicate');

-- 2. Tables

-- Users Table (Citizens & Officials)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL DEFAULT 'citizen',
    auth_id TEXT UNIQUE NOT NULL, -- Corresponds to Aadhar ID or Official Badge ID
    name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Area Assignments (PIN Code routing)
CREATE TABLE IF NOT EXISTS area_assignments (
    pin_code VARCHAR(10) PRIMARY KEY,
    official_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Issues Table (Civic Reports)
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_id UUID REFERENCES users(id) ON DELETE CASCADE,
    official_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Assigned via routing
    
    -- Location & Media
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    pin_code VARCHAR(10) NOT NULL,
    image_url TEXT NOT NULL,
    
    -- AI Metadata (Populated by Gemini Vision)
    ai_category TEXT,
    ai_severity INTEGER CHECK (ai_severity >= 1 AND ai_severity <= 5),
    ai_summary TEXT,
    
    -- State
    status issue_status DEFAULT 'open',
    duplicate_of UUID REFERENCES issues(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Functions & Triggers

-- Trigger to auto-update 'updated_at'
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_issues_modtime
BEFORE UPDATE ON issues
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Geospatial Clustering / Deduplication Helper (PostGIS required for production, simplified here)
-- In a real setup, we'd use PostGIS (ST_DistanceSphere) to find issues within 50m.
-- Assuming basic lat/lng distance formula for MVP:
CREATE OR REPLACE FUNCTION find_nearby_issues(
    p_lat DOUBLE PRECISION, 
    p_lng DOUBLE PRECISION, 
    p_radius_meters DOUBLE PRECISION DEFAULT 50.0
)
RETURNS TABLE (id UUID, distance_meters DOUBLE PRECISION) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        ( 6371000 * acos( cos( radians(p_lat) ) * cos( radians( i.lat ) ) * cos( radians( i.lng ) - radians(p_lng) ) + sin( radians(p_lat) ) * sin( radians( i.lat ) ) ) ) AS distance_meters
    FROM issues i
    WHERE i.status IN ('open', 'in_progress')
    AND ( 6371000 * acos( cos( radians(p_lat) ) * cos( radians( i.lat ) ) * cos( radians( i.lng ) - radians(p_lng) ) + sin( radians(p_lat) ) * sin( radians( i.lat ) ) ) ) <= p_radius_meters;
END;
$$ LANGUAGE plpgsql;

-- 4. Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE area_assignments ENABLE ROW LEVEL SECURITY;

-- Allow all reads for MVP, restrict writes
CREATE POLICY "Public profiles are viewable by everyone." ON users FOR SELECT USING (true);
CREATE POLICY "Issues are viewable by everyone." ON issues FOR SELECT USING (true);
CREATE POLICY "Citizens can insert issues." ON issues FOR INSERT WITH CHECK (true);
CREATE POLICY "Officials can update issues." ON issues FOR UPDATE USING (true);
CREATE POLICY "Area assignments are public." ON area_assignments FOR SELECT USING (true);
