import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_SETTINGS = {
  operatingHours: [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', 
    '20:00', '20:30', '21:00'
  ],
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
