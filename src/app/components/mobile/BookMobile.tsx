"use client";

import React, { useState, useEffect } from 'react';
import { getServices, createBooking, getBookings, SERVICES, SOLO_STAFF, Booking } from '@/lib/db';

export default function BookMobile() {
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
    getBookings().then(setExistingBookings);
  }, []);

  const selectedService = SERVICES.find(s => s.id === selectedServiceId);

  // Jam operasional harian: 08:00 - 17:00 (Setiap 1 jam sesuai durasi rata-rata 60 menit)
  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00"
  ];

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

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !paymentSender || !paymentReference) {
      alert("Silakan lengkapi seluruh data pembayaran dan kontak.");
      return;
    }

    const bookingInput = {
      customerName,
      customerPhone,
      serviceId: selectedServiceId,
      staffId: SOLO_STAFF.id,
      bookingDate: selectedDate,
      bookingTime: selectedTime,
      paymentSender,
      paymentReference
    };

    try {
      const newBooking = await createBooking(bookingInput);
      setCreatedBooking(newBooking);
      setStep(4);
    } catch (err) {
      alert("Gagal membuat reservasi. Silakan coba kembali.");
    }
  };

  return (
    <div style={{ padding: '2rem 1rem 7rem 1rem', minHeight: '90vh' }} className="animate-fade-in">
      
      {/* Progress Steps Header */}
      {step < 4 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
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
                width: '2.2rem',
                height: '2.2rem',
                borderRadius: '50%',
                backgroundColor: step === s.num ? 'var(--primary)' : step > s.num ? 'var(--success)' : 'var(--surface)',
                color: step === s.num ? '#000' : '#fff',
                border: `2px solid ${step >= s.num ? 'var(--primary)' : 'var(--surface-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: step === s.num ? '0 0 12px var(--primary-glow)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {step > s.num ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : s.num}
              </div>
              <span style={{
                fontSize: '0.75rem',
                color: step >= s.num ? 'var(--foreground)' : 'var(--foreground-muted)',
                marginTop: '0.4rem',
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
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#fff' }}>Pilih Layanan</h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            Ketuk layanan premium untuk memilih jadwal cukur Anda.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {SERVICES.map((s) => (
              <div 
                key={s.id} 
                onClick={() => handleServiceSelect(s.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  backgroundColor: 'var(--surface)',
                  border: `1px solid ${selectedServiceId === s.id ? 'var(--primary)' : 'var(--surface-border)'}`,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {s.category}
                  </span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginTop: '0.1rem' }}>{s.title}</h3>
                  <p style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem', marginTop: '0.25rem', lineHeight: '1.3' }}>
                    {s.description}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {s.durationMins} Min
                  </span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
                    Rp {s.price.toLocaleString('id-ID')}
                  </div>
                  <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(245,158,11,0.2)', padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(245,158,11,0.05)' }}>
                    Pilih
                  </span>
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
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              marginBottom: '1.25rem'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Layanan
          </button>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#fff' }}>Pilih Jadwal</h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            Layanan: <strong style={{ color: '#fff' }}>{selectedService.title}</strong>
          </p>

          <form onSubmit={handleNextToPayment}>
            {/* Date Input */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="bookingDate" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>
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
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Time Slot Input */}
            {selectedDate && (
              <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: '#fff' }}>
                  2. Pilih Jam Mulai
                </label>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem'
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
                          padding: '0.75rem 0.25rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          textAlign: 'center',
                          cursor: booked ? 'not-allowed' : 'pointer',
                          backgroundColor: isSelected ? 'var(--primary)' : booked ? 'rgba(239, 68, 68, 0.03)' : 'var(--surface)',
                          color: isSelected ? '#000' : booked ? 'var(--foreground-muted)' : '#fff',
                          border: `1px solid ${isSelected ? 'var(--primary)' : booked ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-border)'}`,
                          opacity: booked ? 0.4 : 1,
                          transition: 'all 0.2s'
                        }}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit */}
            {selectedDate && selectedTime && (
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}>
                Lanjut ke Pembayaran
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
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              marginBottom: '1.25rem'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Jadwal
          </button>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#fff' }}>Pembayaran</h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            Layanan: <strong>{selectedService.title}</strong><br />
            Jadwal: <strong>{selectedDate} @ {selectedTime}</strong>
          </p>

          {/* Payment Details Mobile Card */}
          <div style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: '0.75rem',
            padding: '1.25rem',
            marginBottom: '1.75rem'
          }}>
            <h4 style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
              REKENING TRANSFER
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
              Silakan transfer penuh sebesar <strong style={{ color: '#fff' }}>Rp {selectedService.price.toLocaleString('id-ID')}</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.35rem' }}>
                <span>QRIS Mark Barber</span>
                <strong style={{ color: '#fff' }}>[ Scan saat Check-in ]</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.35rem' }}>
                <span>BCA (Bang Arif)</span>
                <strong style={{ color: '#fff' }}>777-12345-67</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--surface-border)', paddingBottom: '0.35rem' }}>
                <span>GOPAY/OVO (Arif)</span>
                <strong style={{ color: '#fff' }}>0811-2160-042</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.15rem' }}>
                <span>DANA (Bang Arif)</span>
                <strong style={{ color: '#fff' }}>0811-2160-042</strong>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitBooking}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.35rem' }}>Nama Lengkap Pelanggan *</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Contoh: Andi Wijaya" required style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.375rem', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.35rem' }}>Nomor WhatsApp (Aktif) *</label>
                <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Contoh: 0812345678" required style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.375rem', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.35rem' }}>Pengirim Rekening / E-Wallet Anda *</label>
                <input type="text" value={paymentSender} onChange={(e) => setPaymentSender(e.target.value)} placeholder="Contoh: Andi (DANA)" required style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.375rem', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.35rem' }}>ID Transaksi / Referensi *</label>
                <input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} placeholder="Contoh: TR-283123 atau ID GOPAY" required style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.375rem', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.35rem' }}>Catatan (Opsional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Model rambut undercut, dll." rows={2} style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.375rem', backgroundColor: 'var(--surface)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'none' }} />
              </div>

              <button type="submit" className="btn btn-primary glow-pulse" style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', marginTop: '1rem' }}>
                Kirim Booking & Pembayaran
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 4: TIKET SUKSES */}
      {step === 4 && createdBooking && selectedService && (
        <div className="animate-slide-up" style={{ textAlign: 'center' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            border: '2px solid var(--success)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#fff' }}>Pemesanan Terkirim</h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '2rem', fontSize: '0.8rem', padding: '0 1rem' }}>
            Admin akan segera melakukan konfirmasi pembayaran manual Anda secara berkala.
          </p>

          {/* Compact Mobile Ticket */}
          <div style={{
            background: 'linear-gradient(135deg, #18181c 0%, #121215 100%)',
            border: '1px solid var(--surface-border)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            textAlign: 'left',
            position: 'relative',
            marginBottom: '2.5rem'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: 'var(--primary)'
            }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: 'var(--foreground-muted)' }}>ID Booking</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>{createdBooking.id}</h4>
              </div>
              <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: 'rgba(var(--primary-rgb), 0.08)', color: 'var(--primary)', fontSize: '0.65rem', fontWeight: 700 }}>
                PENDING
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ color: 'var(--foreground-muted)', fontSize: '0.7rem' }}>Layanan</span>
                <p style={{ fontWeight: 600, color: '#fff', marginTop: '0.1rem' }}>{selectedService.title}</p>
              </div>
              <div>
                <span style={{ color: 'var(--foreground-muted)', fontSize: '0.7rem' }}>Tukang Cukur</span>
                <p style={{ fontWeight: 600, color: '#fff', marginTop: '0.1rem' }}>{SOLO_STAFF.displayName}</p>
              </div>
              <div>
                <span style={{ color: 'var(--foreground-muted)', fontSize: '0.7rem' }}>Jadwal</span>
                <p style={{ fontWeight: 600, color: '#fff', marginTop: '0.1rem' }}>{createdBooking.bookingDate}</p>
              </div>
              <div>
                <span style={{ color: 'var(--foreground-muted)', fontSize: '0.7rem' }}>Jam</span>
                <p style={{ fontWeight: 600, color: '#fff', marginTop: '0.1rem' }}>{createdBooking.bookingTime} WIB</p>
              </div>
              <div>
                <span style={{ color: 'var(--foreground-muted)', fontSize: '0.7rem' }}>Pelanggan</span>
                <p style={{ fontWeight: 600, color: '#fff', marginTop: '0.1rem' }}>{createdBooking.customerName}</p>
              </div>
              <div>
                <span style={{ color: 'var(--foreground-muted)', fontSize: '0.7rem' }}>Total Harga</span>
                <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem', marginTop: '0.1rem' }}>Rp {selectedService.price.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Mock barcode */}
            <div style={{ borderTop: '1px dashed var(--surface-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <svg width="140" height="25" viewBox="0 0 140 25">
                {Array.from({ length: 24 }).map((_, idx) => {
                  const width = [1, 2, 3][Math.floor(Math.random() * 3)];
                  const x = idx * 6;
                  return (
                    <rect key={idx} x={x} y="0" width={width} height="25" fill="var(--foreground-muted)" />
                  );
                })}
              </svg>
              <span style={{ fontSize: '0.6rem', color: 'var(--foreground-muted)', letterSpacing: '1px' }}>* MARK-BARBER-N-SHOP *</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <a href="/" className="btn btn-secondary" style={{ padding: '0.85rem' }}>
              Kembali ke Beranda
            </a>
            <a href="/queue" className="btn btn-primary" style={{ padding: '0.85rem' }}>
              Lihat Antrian Live
            </a>
          </div>
        </div>
      )}

      {/* Bottom Nav Mock Bar */}
      <div className="glass" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '4rem',
        borderTop: '1px solid var(--surface-border)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        alignItems: 'center',
        zIndex: 40,
        backdropFilter: 'blur(16px)'
      }}>
        <a href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--foreground-muted)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span style={{ fontSize: '0.65rem' }}>Home</span>
        </a>
        <a href="/book" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Booking</span>
        </a>
        <a href="/queue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--foreground-muted)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span style={{ fontSize: '0.65rem' }}>Antrian</span>
        </a>
      </div>
    </div>
  );
}
