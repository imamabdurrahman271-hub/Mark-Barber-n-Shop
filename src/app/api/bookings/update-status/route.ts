import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';
import { sendWhatsApp } from '@/lib/fonnte';

export async function POST(request: Request) {
  try {
    const { id, status } = await request.json();

    // 1. Update status booking di Supabase
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (bookingError || !bookingData) {
      console.error('Error updating booking in Supabase:', bookingError);
      return NextResponse.json({ error: 'Gagal memperbarui status booking' }, { status: 500 });
    }

    const updatedBooking = {
      id: bookingData.id,
      customerName: bookingData.customer_name,
      customerPhone: bookingData.customer_phone,
      serviceId: bookingData.service_id,
      staffId: bookingData.staff_id,
      bookingDate: bookingData.booking_date,
      bookingTime: bookingData.booking_time,
      status: bookingData.status,
      paymentSender: bookingData.payment_sender,
      paymentReference: bookingData.payment_reference,
      createdAt: bookingData.created_at
    };

    // 2. Jika status berubah menjadi 'confirmed', otomatis masukkan ke antrian (queue_items) dan kirim WA ke pelanggan
    if (status === 'confirmed') {
      try {
        // A. Dapatkan detail layanan
        const { data: serviceData } = await supabase
          .from('services')
          .select('title, duration_mins')
          .eq('id', updatedBooking.serviceId)
          .single();

        const serviceTitle = serviceData ? serviceData.title : 'Layanan Haircut';
        const durationMins = serviceData ? serviceData.duration_mins : 60;

        // B. Hitung jumlah antrian saat ini untuk menentukan nomor antrian berikutnya
        const { data: existingQueues } = await supabase
          .from('queue_items')
          .select('id');

        const queueCount = existingQueues ? existingQueues.length : 0;
        const todayPrefix = "A-";
        const queueNumber = `${todayPrefix}${(queueCount + 1).toString().padStart(2, '0')}`;
        const queueItemId = `q-${Math.random().toString(36).substr(2, 9)}`;

        const queueInsertData = {
          id: queueItemId,
          booking_id: updatedBooking.id,
          customer_name: updatedBooking.customerName,
          queue_number: queueNumber,
          status: 'waiting',
          service_title: serviceTitle,
          duration_mins: durationMins
        };

        // C. Simpan ke tabel queue_items
        const { error: queueError } = await supabase
          .from('queue_items')
          .insert(queueInsertData);

        if (queueError) {
          console.error('Error inserting into queue_items:', queueError);
        } else {
          // D. Kirim notifikasi WhatsApp ke Pelanggan berisi nomor antrian & link pantau live
          const customerMessage = 
`Halo ${updatedBooking.customerName},

Pembayaran DP Anda telah berhasil kami verifikasi. Booking Anda di Mark Barber n Shop telah dikonfirmasi!

📅 DETAIL BOOKING:
• Layanan: ${serviceTitle}
• Jadwal: ${updatedBooking.bookingDate} pada jam ${updatedBooking.bookingTime}
• Nomor Antrian Anda: ${queueNumber}

Sistem antrian kami berjalan secara real-time. Anda dapat memantau urutan antrian live di toko kami tanpa harus menunggu lama di lokasi melalui link berikut:
https://mark-barber-n-shop.vercel.app/queue

Sampai jumpa di barbershop!`;

          sendWhatsApp(updatedBooking.customerPhone, customerMessage).catch(err => {
            console.error('Failed to send customer WA notification:', err);
          });
        }
      } catch (queueEx) {
        console.error('Exception adding to queue and sending WA:', queueEx);
      }
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (err) {
    console.error('Error in update status API:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
