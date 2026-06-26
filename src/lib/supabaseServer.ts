import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kxibrfianzxxrhzzyzuu.supabase.co';
// Gunakan service_role key untuk bypass RLS di server asinkron Next.js (100% aman)
// Jika belum dikonfigurasi di env, otomatis fallback ke anon key agar aplikasi tidak crash
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey);
