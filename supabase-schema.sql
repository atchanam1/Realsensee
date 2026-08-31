-- ============================================
-- Gang System - Supabase Database Schema
-- รัน SQL นี้ใน Supabase SQL Editor
-- ============================================

-- 1. Users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  is_approved BOOLEAN DEFAULT FALSE,
  joined_gang_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Leaves (การลา)
CREATE TABLE leaves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  leave_date DATE NOT NULL,
  return_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Attendance (การมา/ไม่มา)
CREATE TABLE attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'leave')),
  note TEXT,
  UNIQUE(user_id, event_date)
);

-- 4. Gang Events (เข้า-ออกแก๊ง)
CREATE TABLE gang_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('join', 'leave')),
  event_date TIMESTAMPTZ DEFAULT NOW(),
  note TEXT
);

-- 5. Items (ส่งของ)
CREATE TABLE items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('wood', 'iron', 'mine')),
  quantity INTEGER DEFAULT 100,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Disable RLS (ใช้ Service Role Key แทน)
-- ============================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE leaves DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE gang_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE items DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ตั้งค่า Admin คนแรก (แก้ discord_id เป็นของคุณ)
-- ============================================
-- UPDATE users SET role = 'admin', is_approved = true WHERE discord_id = 'YOUR_DISCORD_ID';
