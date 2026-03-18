import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Tạo một dummy client nếu thiếu config để app không crash
function createSafeClient(): SupabaseClient {
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey);
  }
  
  console.warn('⚠️ Thiếu cấu hình Supabase! App sẽ chạy ở chế độ offline.');
  console.warn('   Thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào Environment Variables.');
  
  // Tạo client với URL placeholder - sẽ không hoạt động nhưng không crash app
  return createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export const supabase = createSafeClient();
