-- Create tables that match our Prisma schema
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  image TEXT,
  phone TEXT,
  location TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_verified_organizer BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create an enum for event categories
CREATE TYPE event_category AS ENUM (
  'GARAGE_SALE',
  'SPORTS',
  'MATCH',
  'COMMUNITY_CLASS',
  'VOLUNTEER',
  'EXHIBITION',
  'FESTIVAL'
);

-- Create events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category event_category NOT NULL,
  location TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- Create attendance table
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  people_count INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create notification type enum
CREATE TYPE notification_type AS ENUM (
  'EVENT_REMINDER',
  'EVENT_UPDATE',
  'EVENT_CANCELLATION'
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  type notification_type NOT NULL,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create RLS policies for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example policies (modify as needed for your application)
CREATE POLICY "Users can read their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Public can read approved events" 
  ON events FOR SELECT 
  USING (is_approved = true);

CREATE POLICY "Users can create events" 
  ON events FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events" 
  ON events FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events" 
  ON events FOR DELETE
  USING (auth.uid() = created_by);

-- Add indexes for performance
CREATE INDEX idx_events_created_by ON events(created_by);
CREATE INDEX idx_attendances_event_id ON attendances(event_id);
CREATE INDEX idx_attendances_user_id ON attendances(user_id);
