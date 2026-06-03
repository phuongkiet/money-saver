import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'CẢNH BÁO: Chưa cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong file .env. ' +
    'Ứng dụng sẽ hoạt động ở chế độ ngoại tuyến (Offline Mode).'
  );
}

// Khởi tạo Supabase client.
// Nếu chưa cấu hình key, client vẫn được khởi tạo nhưng các request sẽ fail, 
// app sẽ catch lỗi và hoạt động ở chế độ Offline/Local mượt mà.
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
