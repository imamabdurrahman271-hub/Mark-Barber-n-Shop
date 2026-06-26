"use client";

import React, { useState, useEffect } from 'react';
import { getServices, createBooking, getBookings, SERVICES, SOLO_STAFF, Booking } from '@/lib/db';

export default function BookPage() {
  const [step, setStep] = useState(1);
  
  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentSender, setPaymentSender] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  
  // Calculated state
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    setExistingBookings(getBookings());
  }, []);

  const selectedService = SERVICES.find(s => s.id === selectedServiceId);

  // Jam operasional harian: 08:00 - 17:00 (Setiap 1 jam sesuai durasi rata-rata 60 menit)
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00"
  ];

  // Fungsi untuk memvalidasi tanggal (hanya Senin-Jumat, dan mulai hari ini ke depan)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 14); // Batasi booking maksimal 2 minggu ke depan
    return maxDate.toISOString().split('T')[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    const day = new Date(date).getDay();
    
    if (day === 0 || day === 6) {
      alert("Maaf, Mark Barber n Shop tutup pada hari Sabtu dan Minggu. Silakan pilih hari Senin s/d Jumat.");
      setSelectedDate('');
      setSelectedTime('');
    } else {
      setSelectedDate(date);
      setSelectedTime(''); // Reset pilihan waktu saat tanggal diubah
    }
  };

  // Cek apakah slot waktu sudah dipesan oleh orang lain untuk tanggal yang dipilih
  const isTimeSlotBooked = (time: string) => {
    return existingBookings.some(b => 
      b.bookingDate === selectedDate && 
      b.bookingTime === time && 
      b.status !== 'cancelled'
    );
  };

  const handleServiceSelect = (id: string) => {
    setSelectedServiceId(id);
    setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    if (isTimeSlotBooked(time)) return;
    setSelectedTime(time);
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert("Silakan pilih tanggal dan waktu terlebih dahulu.");
      return;
    }
    setStep(3);
  };

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !paymentSender || !paymentReference) {
      alert("Silakan lengkapi seluruh data pembayaran dan kontak.");
      return;
    }

    const bookingInput = {
      customerName,
      customerPhone,
      serviceId: selectedServiceId,
      staffId: SOLO_STAFF.id, // Otomatis diarahkan ke solo barber
      bookingDate: selectedDate,
      bookingTime: selectedTime,
      paymentSender,
      paymentReference
    };

    const newBooking = createBooking(bookingInput);
    setCreatedBooking(newBooking);
    setStep(4);
  };

  return (
    <div className="container" style={{ maxWidth: '700px', padding: '3rem 1.5rem 5rem 1.5rem' }}>
      
      {/* Progress Steps Header */}
      {step < 4 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3rem',
          position: 'relative'
        }}>
          {/* Progress Line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '2px',
            backgroundColor: 'var(--surface-border)',
            zIndex: 1
          }}>
            <div style={{
              width: `${((step - 1) / 2) * 100}%`,
              height: '100%',
              backgroundColor: 'var(--primary)',
              transition: 'width 0.3s ease'
            }}></div>
          </div>

          {[
            { num: 1, label: "Layanan" },
            { num: 2, label: "Jadwal" },
            { num: 3, label: "Pembayaran" }
          ].map((s) => (
            <div key={s.num} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
              position: 'relative'
            }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: step === s.num ? 'var(--primary)' : step > s.num ? 'var(--success)' : 'var(--surface)',
                color: step === s.num ? '#000' : '#fff',
                border: `2px solid ${step >= s.num ? 'var(--primary)' : 'var(--surface-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                boxShadow: step === s.num ? '0 0 15px var(--primary-glow)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {step > s.num ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : s.num}
              </div>
              <span style={{
                fontSize: '0.8rem',
                color: step >= s.num ? 'var(--foreground)' : 'var(--foreground-muted)',
                marginTop: '0.5rem',
                fontWeight: 600
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: PILIH LAYANAN */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Pilih Layanan</h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Daftar layanan premium yang dikerjakan langsung oleh owner.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {SERVICES.map((s) => (
              <div 
                key={s.id} 
                onClick={() => handleServiceSelect(s.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'var(--surface)',
                  border: `1px solid ${selectedServiceId === s.id ? 'var(--primary)' : 'var(--surface-border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="service-selection-card"
              >
                {selectedServiceId === s.id && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '4px',
                    backgroundColor: 'var(--primary)'
                  }}></div>
                )}
                
                <div style={{ paddingRight: '1.5rem', flex: 1 }}>
                  <span style={{ 
                    fontSize: '0.7rem', 
                    color: 'var(--primary)', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '1px',
                    display: 'inline-block',
                    marginBottom: '0.25rem'
                  }}>
                    {s.category}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>{s.title}</h3>
                  <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', marginTop: '0.35rem', lineHeight: '1.4' }}>
                    {s.description}
                  </p>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    color: 'var(--foreground-muted)', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '0.25rem',
                    marginTop: '0.75rem'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {s.durationMins} Menit
                  </span>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                    Rp {s.price.toLocaleString('id-ID')}
                  </div>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                    Pilih
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: PILIH TANGGAL & WAKTU */}
      {step === 2 && selectedService && (
        <div className="animate-fade-in">
          <button 
            onClick={() => setStep(1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Pilih Layanan
          </button>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Pilih Jadwal Cukur</h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Layanan: <strong style={{ color: '#fff' }}>{selectedService.title}</strong> (Rp {selectedService.price.toLocaleString('id-ID')})
          </p>

          <form onSubmit={handleNextToPayment}>
            {/* Date Input */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label htmlFor="bookingDate" style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: '#fff' }}>
                1. Pilih Tanggal (Senin - Jumat)
              </label>
              <input 
                type="date"
                id="bookingDate"
                value={selectedDate}
                onChange={handleDateChange}
                min={getMinDate()}
                max={getMaxDate()}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Time Slot Input */}
            {selectedDate && (
              <div style={{ marginBottom: '3rem' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>
                  2. Pilih Jam Mulai
                </label>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem'
                }}>
                  {timeSlots.map((time) => {
                    const booked = isTimeSlotBooked(time);
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={booked}
                        onClick={() => handleTimeSelect(time)}
                        style={{
                          padding: '1rem 0.5rem',
                          borderRadius: '0.5rem',
                          fontSize: '1rem',
                          fontWeight: 600,
                          textAlign: 'center',
                          cursor: booked ? 'not-allowed' : 'pointer',
                          backgroundColor: isSelected ? 'var(--primary)' : booked ? 'rgba(239, 68, 68, 0.05)' : 'var(--surface)',
                          color: isSelected ? '#000' : booked ? 'var(--foreground-muted)' : '#fff',
                          border: `1px solid ${isSelected ? 'var(--primary)' : booked ? 'rgba(239, 68, 68, 0.2)' : 'var(--surface-border)'}`,
                          opacity: booked ? 0.4 : 1,
                          textDecoration: booked ? 'line-through' : 'none',
                          transition: 'all 0.2s'
                        }}
                      >
                        {time}
                        {booked && <span style={{ display: 'block', fontSize: '0.65rem', marginTop: '0.25rem', fontWeight: 400 }}>Booked</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit */}
            {selectedDate && selectedTime && (
              <button type="submit" className="btn btn-primary animate-slide-up" style={{ width: '100%', padding: '1rem' }}>
                Lanjut ke Pembayaran
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </button>
            )}
          </form>
        </div>
      )}

      {/* STEP 3: DATA PELANGGAN & PEMBAYARAN MANUAL */}
      {step === 3 && selectedService && (
        <div className="animate-fade-in">
          <button 
            onClick={() => setStep(2)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginBottom: '1.5rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Pilih Jadwal
          </button>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Pembayaran & Kontak</h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
            Layanan: <strong style={{ color: '#fff' }}>{selectedService.title}</strong> pada <strong style={{ color: '#fff' }}>{selectedDate} @ {selectedTime}</strong>
          </p>

          {/* Payment Account Details */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <h4 style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>
              REKENING PEMBAYARAN BARBERSHOP
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Silakan lakukan transfer pembayaran penuh sebesar <strong style={{ color: '#fff', fontSize: '1.05rem' }}>Rp {selectedService.price.toLocaleString('id-ID')}</strong> ke salah satu rekening/e-wallet berikut:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>
                <span>QRIS Mark Barber n Shop</span>
                <strong style={{ color: '#fff' }}>[ Tampilkan Kode QR saat Check-in / Scan di Kasir ]</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>
                <span>Bank BCA (Bang Arif)</span>
                <strong style={{ color: '#fff' }}>777-12345-67</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.5rem' }}>
                <span>GOPAY / OVO (Bang Arif)</span>
                <strong style={{ color: '#fff' }}>0811-2160-042</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.25rem' }}>
                <span>DANA (Bang Arif)</span>
                <strong style={{ color: '#fff' }}>0811-2160-042</strong>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitBooking}>
            <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Lengkapi Detail Anda:</h4>
            
            {/* Customer Name */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="custName" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
                Nama Lengkap Pelanggan *
              </label>
              <input 
                type="text"
                id="custName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Budi Susanto"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Customer Phone */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="custPhone" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
                Nomor WhatsApp (Aktif) *
              </label>
              <input 
                type="tel"
                id="custPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Sender Account */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="senderAcc" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
                Nama Pengirim Rekening / E-Wallet Anda *
              </label>
              <input 
                type="text"
                id="senderAcc"
                value={paymentSender}
                onChange={(e) => setPaymentSender(e.target.value)}
                placeholder="Contoh: Budi Susanto (Gopay)"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Payment Ref */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="payRef" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
                Nomor Referensi Transaksi / ID Transaksi *
              </label>
              <input 
                type="text"
                id="payRef"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Contoh: GOP-9872615 atau Ref: 128367"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label htmlFor="notes" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
                Catatan Tambahan (Opsional)
              </label>
              <textarea 
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan khusus model rambut, dll."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <button type="submit" className="btn btn-primary glow-pulse" style={{ width: '100%', padding: '1rem' }}>
              Selesaikan Pemesanan & Kirim
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
          </form>
        </div>
      )}

      {/* STEP 4: TIKET KONFIRMASI BOOKING (SUKSES) */}
      {step === 4 && createdBooking && selectedService && (
        <div className="animate-slide-up" style={{ textAlign: 'center' }}>
          
          {/* Success Icon */}
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            border: '2px solid var(--success)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Pemesanan Berhasil Dikirim!</h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '3rem', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 3rem auto' }}>
            Pemesanan Anda telah tercatat. Admin kami akan segera melakukan verifikasi pembayaran manual. Silakan simpan detail tiket berikut:
          </p>

          {/* Ticket Body */}
          <div style={{
            background: 'linear-gradient(135deg, #18181c 0%, #121215 100%)',
            border: '1px solid var(--surface-border)',
            borderRadius: '1rem',
            padding: '2.5rem',
            textAlign: 'left',
            boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '3rem'
          }}>
            {/* Top border decoration */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: 'var(--primary)'
            }}></div>
            
            {/* Ticket Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>ID Pemesanan</span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)' }}>{createdBooking.id}</h4>
              </div>
              <div style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '50px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid rgba(245, 158, 11, 0.2)'
              }}>
                Menunggu Verifikasi
              </div>
            </div>

            {/* Ticket Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Layanan</span>
                <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginTop: '0.2rem' }}>{selectedService.title}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Kapster (Barber)</span>
                <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginTop: '0.2rem' }}>{SOLO_STAFF.displayName}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Jadwal Cukur</span>
                <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginTop: '0.2rem' }}>{createdBooking.bookingDate}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Jam Mulai</span>
                <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginTop: '0.2rem' }}>{createdBooking.bookingTime} WIB</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Nama Pelanggan</span>
                <p style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', marginTop: '0.2rem' }}>{createdBooking.customerName}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Total Harga</span>
                <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem', marginTop: '0.2rem' }}>Rp {selectedService.price.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Mock barcode using SVG */}
            <div style={{
              borderTop: '1px dashed var(--surface-border)',
              paddingTop: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="180" height="40" viewBox="0 0 180 40">
                {Array.from({ length: 32 }).map((_, idx) => {
                  const width = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
                  const spacing = [2, 3, 4][Math.floor(Math.random() * 3)];
                  const x = idx * 6;
                  return (
                    <rect key={idx} x={x} y="0" width={width} height="40" fill="var(--foreground-muted)" />
                  );
                })}
              </svg>
              <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', letterSpacing: '2px' }}>* MARK-BARBER-N-SHOP *</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <a href="/" className="btn btn-secondary" style={{ padding: '0.75rem 2rem' }}>
              Kembali ke Beranda
            </a>
            <a href="/queue" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
              Lihat Antrian Live
            </a>
          </div>
        </div>
      )}
      
    </div>
  );
}
