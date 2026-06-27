import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';
import { sendWhatsApp } from '@/lib/fonnte';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    // Get client IP address
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const ip = ipHeader.split(',')[0].trim();

    // Rate Limit: Maksimal 3 kali pembuatan booking dalam 10 menit (600.000 ms)
    const limitResult = rateLimit(ip, 3, 600000);
    if (!limitResult.success) {
      return NextResponse.json(
        { error: `Terlalu banyak permintaan pembuatan booking. Silakan coba lagi dalam ${limitResult.reset} detik.` },
        { status: 429 }
      );
    }

    const bookingData = await request.json();
    
    // 1. Dapatkan detail layanan untuk isi pesan WA
    const { data: serviceData, error: serviceError } = await supabase
      .from('services')
      .select('title, price')
      .eq('id', bookingData.serviceId)
      .single();

    const serviceTitle = serviceData ? serviceData.title : 'Layanan tidak diketahui';
    const servicePrice = serviceData ? Number(serviceData.price).toLocaleString('id-ID') : '0';

    // 2. Buat ID booking unik
    const newId = `book-${Math.random().toString(36).substr(2, 9)}`;
    
    const insertData = {
      id: newId,
      customer_name: bookingData.customerName,
      customer_phone: bookingData.customerPhone,
      service_id: bookingData.serviceId,
      staff_id: bookingData.staffId,
      booking_date: bookingData.bookingDate,
      booking_time: bookingData.bookingTime,
      status: 'pending',
      payment_sender: bookingData.paymentSender,
      payment_reference: bookingData.paymentReference
    };

    // 3. Simpan ke database Supabase
    const { data, error } = await supabase
      .from('bookings')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting booking in Supabase:', error);
      return NextResponse.json({ error: 'Gagal menyimpan data booking' }, { status: 500 });
    }

    const createdBooking = {
      id: data.id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      serviceId: data.service_id,
      staffId: data.staff_id,
      bookingDate: data.booking_date,
      bookingTime: data.booking_time,
      status: data.status,
      paymentSender: data.payment_sender,
      paymentReference: data.payment_reference,
      createdAt: data.created_at
    };

    // 4. Kirim notifikasi WhatsApp ke Admin (Bang Arif) jika nomor admin dikonfigurasi
    const adminWhatsApp = process.env.ADMIN_WHATSAPP;
    if (adminWhatsApp) {
      const waMessage = 
`🔔 BOOKING BARU MASUK!

Ada pelanggan yang baru saja memesan slot online:
• Nama: ${createdBooking.customerName}
• WhatsApp: ${createdBooking.customerPhone}
• Layanan: ${serviceTitle} (Rp ${servicePrice})
• Jadwal: ${createdBooking.bookingDate} pada jam ${createdBooking.bookingTime}

💳 METODE PEMBAYARAN:
• Pembayaran: Tunai (Bayar di Tempat)

Silakan lakukan konfirmasi booking ini pada dashboard admin:
https://markbarber.vercel.app/admin`;

      // Kirim pesan secara asynchronous (jangan memblokir response client)
      sendWhatsApp(adminWhatsApp, waMessage).catch(err => {
        console.error('Failed to send admin WA notification:', err);
      });
    }

    return NextResponse.json({ success: true, booking: createdBooking });
  } catch (err) {
    console.error('Error in create booking API:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
