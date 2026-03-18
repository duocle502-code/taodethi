-- =====================================================
-- SUPABASE SETUP: Bảng profiles + Trigger + RLS
-- Chạy file này trên Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Tạo bảng profiles liên kết với auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Bật RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- User tự xem profile của mình
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Admin xem tất cả profiles
CREATE POLICY "Admin can view all profiles"
  ON profiles FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- User tự cập nhật profile của mình
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Admin cập nhật bất kỳ profile nào
CREATE POLICY "Admin can update any profile"
  ON profiles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. Trigger tự tạo profile khi user đăng ký
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'  -- Mặc định là customer
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- SAU KHI ĐĂNG KÝ USER ĐẦU TIÊN, CHẠY LỆNH NÀY
-- ĐỂ THĂNG CẤP ADMIN:
-- UPDATE profiles SET role = 'admin' WHERE id = 'USER_ID_HERE';
-- =====================================================
