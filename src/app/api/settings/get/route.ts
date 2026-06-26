import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_SETTINGS = {
  operatingHours: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'],
  closedDays: [0, 6], // 0 = Minggu, 6 = Sabtu
  holidays: [] as string[]
};

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('shop_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error) {
      console.warn('Shop settings table might not exist yet, returning defaults:', error.message);
      return NextResponse.json({ 
        success: true, 
        settings: { id: 'default', ...DEFAULT_SETTINGS } 
      });
    }

    if (!data) {
      return NextResponse.json({ 
        success: true, 
        settings: { id: 'default', ...DEFAULT_SETTINGS } 
      });
    }

    const settings = {
      id: data.id,
      operatingHours: data.operating_hours || DEFAULT_SETTINGS.operatingHours,
      closedDays: data.closed_days || DEFAULT_SETTINGS.closedDays,
      holidays: data.holidays || DEFAULT_SETTINGS.holidays
    };

    return NextResponse.json({ success: true, settings });
  } catch (err) {
    console.error('Error in get settings API, returning defaults:', err);
    return NextResponse.json({ 
      success: true, 
      settings: { id: 'default', ...DEFAULT_SETTINGS } 
      });
  }
}
