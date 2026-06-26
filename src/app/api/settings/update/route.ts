import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const { operatingHours, closedDays, holidays } = await request.json();

    const updateData = {
      id: 'default',
      operating_hours: operatingHours,
      closed_days: closedDays,
      holidays: holidays,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('shop_settings')
      .upsert(updateData)
      .select()
      .single();

    if (error) {
      console.error('Error updating shop settings in Supabase:', error);
      return NextResponse.json({ error: 'Gagal memperbarui pengaturan toko. Pastikan tabel shop_settings sudah dibuat di Supabase.' }, { status: 500 });
    }

    const updatedSettings = {
      id: data.id,
      operatingHours: data.operating_hours,
      closedDays: data.closed_days,
      holidays: data.holidays
    };

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (err) {
    console.error('Error in update settings API:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
