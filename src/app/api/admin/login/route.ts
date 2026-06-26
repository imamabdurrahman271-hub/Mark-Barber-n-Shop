import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // Get client IP address
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const ip = ipHeader.split(',')[0].trim();

    // Rate Limit: Maksimal 5 kali percobaan login dalam 5 menit (300.000 ms)
    const limitResult = rateLimit(ip, 5, 300000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan login. Silakan coba lagi dalam ${limitResult.reset} detik.` },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();
    
    // Authenticate via Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json({ error: 'Email atau Password salah' }, { status: 401 });
    }

    // Pastikan email yang login adalah email admin yang terdaftar di env
    const adminEmail = process.env.ADMIN_EMAIL;
    if (data.user?.email !== adminEmail) {
      await supabase.auth.signOut();
      return NextResponse.json({ error: 'Email Anda tidak memiliki akses admin' }, { status: 403 });
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
