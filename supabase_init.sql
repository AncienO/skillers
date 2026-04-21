-- Skillers Database Schema and RLS Policies
-- Execute this file in the Supabase SQL Editor

-- Creates fully commented and readable schema!
-- Creates enum types for strict type safety
CREATE TYPE member_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE sec_role_type AS ENUM ('impact_director', 'deputy_impact_director', 'welfare_coordinator', 'brand_ambassador', 'event_coordinator');
CREATE TYPE announcement_segment AS ENUM ('all', 'approved_members');

-- 1. admins 
-- Tied to Supabase auth.users
CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE
);

-- 2. members
-- The core entity for the platform
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE, -- used for /members/[slug]
    email TEXT NOT NULL UNIQUE,
    bio TEXT,
    avatar_url TEXT,
    status member_status DEFAULT 'pending'::member_status,
    is_sec BOOLEAN DEFAULT FALSE,
    sec_role sec_role_type,
    preferred_contact TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Unique constraint ensuring only one member per SEC role exists at any time
CREATE UNIQUE INDEX unique_sec_role ON members (sec_role) WHERE sec_role IS NOT NULL;

-- 3. goals
-- What the members are building towards
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. tags
-- Used for indexing and filtering searches
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT UNIQUE NOT NULL
);

-- 5. member_tags
-- Join table for member to tag assignment
CREATE TABLE member_tags (
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (member_id, tag_id)
);

-- 6. connection_requests
-- When someone wants to reach out to a member
CREATE TABLE connection_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_name TEXT NOT NULL,
    from_email TEXT NOT NULL,
    to_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. announcements
-- Broadcasting messages to segments or the whole community
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    segment announcement_segment NOT NULL,
    sent_at TIMESTAMPTZ,
    created_by UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

--- RLS (Row Level Security) POLICIES ---

-- Enable RLS on all tables to enforce security at the database layer
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM admins WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies
CREATE POLICY "Admins can read everything" ON admins FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can manage all members" ON members FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins can manage all goals" ON goals FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins can manage tags" ON tags FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins can manage member_tags" ON member_tags FOR ALL TO authenticated USING (is_admin());
CREATE POLICY "Admins can read connection requests" ON connection_requests FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL TO authenticated USING (is_admin());

-- Public / General Member read policies (approved only)
CREATE POLICY "Public can view approved members" ON members FOR SELECT USING (status = 'approved'::member_status);
CREATE POLICY "Public can view goals of approved members" ON goals FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE id = goals.member_id AND status = 'approved'::member_status)
);
CREATE POLICY "Public can view all tags" ON tags FOR SELECT USING (TRUE);
CREATE POLICY "Public can view member tags of approved members" ON member_tags FOR SELECT USING (
    EXISTS (SELECT 1 FROM members WHERE id = member_tags.member_id AND status = 'approved'::member_status)
);

-- Seed some default tags
INSERT INTO tags (label) VALUES
('Entrepreneur'),
('Open to collaboration'),
('Looking for mentorship'),
('Software Development'),
('Product Management'),
('Design & Creative'),
('Marketing'),
('Sales & Business Development'),
('Operations'),
('Finance'),
('Recruiting / HR')
ON CONFLICT DO NOTHING;
