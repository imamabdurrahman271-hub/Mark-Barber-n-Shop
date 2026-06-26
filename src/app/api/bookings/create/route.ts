import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendWhatsApp } from '@/lib/fonnte';

export async function POST(request: Request) {
  try {
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

💳 DETAIL PEMBAYARAN DP:
• Pengirim: ${createdBooking.paymentSender}
• No Referensi: ${createdBooking.paymentReference || '-'}

Silakan periksa mutasi rekening Anda, lalu lakukan konfirmasi pada dashboard admin:
https://mark-barber-n-shop.vercel.app/admin`;

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
