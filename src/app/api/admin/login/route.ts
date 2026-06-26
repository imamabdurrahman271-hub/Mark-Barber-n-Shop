import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Authenticate via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json({ error: 'Email atau Password salah' }, { status: 401 });
    }

    if (data.session) {
      const cookieStore = await cookies();
      cookieStore.set('admin_session', 'session_arif_active', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 hari
        path: '/'
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Sesi tidak dapat dibuat' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
