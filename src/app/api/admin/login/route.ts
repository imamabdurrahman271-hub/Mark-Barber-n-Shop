import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const adminEmail = process.env.ADMIN_EMAIL || 'arif@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'arifbarbershop';

    if (email === adminEmail && password === adminPassword) {
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

    return NextResponse.json({ error: 'Email atau Password salah' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
