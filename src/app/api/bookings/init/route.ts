import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

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
    const [servicesRes, bookingsRes, settingsRes] = await Promise.all([
      supabaseServer.from('services').select('*').order('id', { ascending: true }),
      supabaseServer.from('bookings').select('*').order('created_at', { ascending: false }),
      supabaseServer.from('shop_settings').select('*').eq('id', 'default').maybeSingle()
    ]);

    // Format services
    const services = (servicesRes.data || []).map(s => ({
      id: s.id,
      title: s.title,
      price: Number(s.price),
      durationMins: s.duration_mins,
      description: s.description,
      category: s.category
    }));

    // Format bookings
    const bookings = (bookingsRes.data || []).map(b => ({
      id: b.id,
      customerName: b.customer_name,
      customerPhone: b.customer_phone,
      serviceId: b.service_id,
      staffId: b.staff_id,
      bookingDate: b.booking_date,
      bookingTime: b.booking_time,
      status: b.status,
      paymentSender: b.payment_sender,
      paymentReference: b.payment_reference,
      createdAt: b.created_at
    }));

    // Format settings
    const settingsData = settingsRes.data;
    const settings = {
      id: 'default',
      operatingHours: settingsData?.operating_hours || DEFAULT_SETTINGS.operatingHours,
      closedDays: settingsData?.closed_days || DEFAULT_SETTINGS.closedDays,
      holidays: settingsData?.holidays || DEFAULT_SETTINGS.holidays
    };

    return NextResponse.json({
      success: true,
      services,
      bookings,
      settings
    });
  } catch (err) {
    console.error('Error in init bookings API:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Terjadi kesalahan server saat mengambil data booking.' 
    }, { status: 500 });
  }
}
