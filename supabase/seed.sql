-- Nagar Drishti - Phase 1 Seed Data
-- Centered around Bhubaneswar, Odisha (PIN 751001, 751024)

-- 1. Create Mock Users
INSERT INTO users (id, role, auth_id, name, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'citizen', 'AADHAR_751001_001', 'Ramesh Kumar', '+91-9876543210'),
('22222222-2222-2222-2222-222222222222', 'citizen', 'AADHAR_751024_002', 'Sunita Dash', '+91-9876543211'),
('33333333-3333-3333-3333-333333333333', 'official', 'OFFICIAL_BMC_001', 'Inspector Das (Central)', '+91-9876543212'),
('44444444-4444-4444-4444-444444444444', 'official', 'OFFICIAL_BMC_002', 'Inspector Nayak (North)', '+91-9876543213')
ON CONFLICT (id) DO NOTHING;

-- 2. Assign Officials to PIN Codes
INSERT INTO area_assignments (pin_code, official_id) VALUES
('751001', '33333333-3333-3333-3333-333333333333'), -- Secretariat/Central
('751024', '44444444-4444-4444-4444-444444444444')  -- Patia/North
ON CONFLICT (pin_code) DO NOTHING;

-- 3. Create Mock Issues (Bhubaneswar Coordinates approx 20.296, 85.824)
INSERT INTO issues (id, citizen_id, official_id, lat, lng, pin_code, image_url, ai_category, ai_severity, ai_summary, status, created_at) VALUES
-- PIN 751001 (Central)
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 20.266, 85.836, '751001', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7', 'Infrastructure', 4, 'Large pothole causing traffic slowdown near Secretariat.', 'open', now() - interval '2 days'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 20.267, 85.837, '751001', 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd', 'Waste Management', 3, 'Garbage bin overflowing near AG Square.', 'in_progress', now() - interval '1 day'),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 20.265, 85.835, '751001', 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69', 'Water Supply', 5, 'Major pipe burst flooding the main road.', 'open', now() - interval '3 hours'),

-- PIN 751024 (Patia)
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 20.345, 85.818, '751024', 'https://images.unsplash.com/photo-1574706248235-98319f604473', 'Street Lighting', 2, 'Street light non-functional near KIIT Square.', 'resolved', now() - interval '5 days'),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 20.346, 85.817, '751024', 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81', 'Infrastructure', 4, 'Open manhole on the footpath, high risk for pedestrians.', 'open', now() - interval '12 hours'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 20.343, 85.820, '751024', 'https://images.unsplash.com/photo-1616423640778-28d1b50a26dd', 'Waste Management', 1, 'Minor litter accumulation near bus stop.', 'open', now() - interval '1 hour');

-- Add more random mock issues to hit the 20-30 requirement
DO $$
DECLARE
    i INT;
    rand_lat DOUBLE PRECISION;
    rand_lng DOUBLE PRECISION;
    rand_sev INT;
    rand_cat TEXT;
    rand_pin VARCHAR(10);
    rand_official UUID;
BEGIN
    FOR i IN 1..20 LOOP
        -- Randomize between Central (751001) and Patia (751024)
        IF random() > 0.5 THEN
            rand_pin := '751001';
            rand_official := '33333333-3333-3333-3333-333333333333';
            rand_lat := 20.260 + (random() * 0.015);
            rand_lng := 85.830 + (random() * 0.015);
        ELSE
            rand_pin := '751024';
            rand_official := '44444444-4444-4444-4444-444444444444';
            rand_lat := 20.340 + (random() * 0.015);
            rand_lng := 85.810 + (random() * 0.015);
        END IF;

        rand_sev := floor(random() * 5 + 1)::INT;
        
        IF rand_sev >= 4 THEN rand_cat := 'Infrastructure';
        ELSIF rand_sev = 3 THEN rand_cat := 'Water Supply';
        ELSE rand_cat := 'Waste Management';
        END IF;

        INSERT INTO issues (id, citizen_id, official_id, lat, lng, pin_code, image_url, ai_category, ai_severity, ai_summary, status, created_at)
        VALUES (
            gen_random_uuid(),
            '11111111-1111-1111-1111-111111111111',
            rand_official,
            rand_lat,
            rand_lng,
            rand_pin,
            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7',
            rand_cat,
            rand_sev,
            'AI generated summary for mock issue ' || i,
            'open',
            now() - (random() * interval '7 days')
        );
    END LOOP;
END $$;
