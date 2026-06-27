"use client";

import React, { useState, useEffect } from 'react';
import { getBookingInitData, createBooking, SOLO_STAFF, Booking, Service } from '@/lib/db';

export default function BookMobile() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('1');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Form Inputs
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentSender, setPaymentSender] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('Manual');
  const [notes, setNotes] = useState<string>('');
  
  // Database states
  const [services, setServices] = useState<Service[]>([]);
  const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [shopSettings, setShopSettings] = useState<{ operatingHours: string[], closedDays: number[], holidays: string[] }>({
    operatingHours: [
      "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
      "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", 
      "20:00", "20:30", "21:00"
    ],
    closedDays: [0, 6],
    holidays: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getBookingInitData().then(({ services, bookings, settings }) => {
      setServices(services);
      setExistingBookings(bookings);
      setShopSettings(settings);
      
      // Set default selected service ID to the first service if available
      if (services.length > 0) {
        setSelectedServiceId(services[0].id);
      }
      setIsLoading(false);
    }).catch(err => {
      console.error('Error loading booking data:', err);
      setIsLoading(false);
    });
  }, []);

  const selectedService = services.find(s => s.id === selectedServiceId);

  const getMinDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 14); // Batasi booking maksimal 2 minggu ke depan
    const yyyy = maxDate.getFullYear();
    const mm = String(maxDate.getMonth() + 1).padStart(2, '0');
    const dd = String(maxDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    if (!date) return;
    
    const [year, month, dayStr] = date.split('-');
    const day = new Date(Number(year), Number(month) - 1, Number(dayStr)).getDay();
    
    // 1. Cek Hari Libur Rutin (closedDays)
    if (shopSettings.closedDays.includes(day)) {
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      alert(`Maaf, Mark Barber n Shop libur pada hari ${dayNames[day]}. Silakan pilih hari lain.`);
      setSelectedDate('');
      setSelectedTime('');
      return;
    }
    
    // 2. Cek Tanggal Cuti/Libur Khusus (holidays)
    if (shopSettings.holidays.includes(date)) {
      alert("Maaf, Mark Barber n Shop sedang tutup/libur pada tanggal tersebut. Silakan pilih tanggal lain.");
      setSelectedDate('');
      setSelectedTime('');
      return;
    }
    
    setSelectedDate(date);
    setSelectedTime(''); // Reset pilihan waktu saat tanggal diubah
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

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        color: '#a49e8f',
        background: '#050505'
      }}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(235, 220, 185, 0.1)',
          borderTop: '3px solid #ebdcb9',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1.25rem',
          boxShadow: '0 0 10px rgba(235, 220, 185, 0.15)'
        }}></div>
        <span style={{ fontSize: '0.85rem', fontWeight: 500, letterSpacing: '0.5px' }}>Memuat data layanan & jadwal...</span>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'radial-gradient(circle at 50% 0%, rgba(235, 220, 185, 0.06) 0%, transparent 75%), #050505',
      padding: '2rem 1rem 8rem 1rem', 
      minHeight: '100vh' 
    }} className="animate-fade-in">
      
      {/* Progress Steps Header */}
      {step < 4 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2.5rem',
          position: 'relative',
          maxWidth: '450px',
          margin: '0 auto 2.5rem auto',
          padding: '0 1rem'
        }}>
          {/* Progress Line */}
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '2rem',
            right: '2rem',
            height: '1.5px',
            backgroundColor: 'rgba(235, 220, 185, 0.12)',
            zIndex: 1
          }}>
            <div style={{
              width: `${((step - 1) / 2) * 100}%`,
              height: '100%',
              backgroundColor: '#ebdcb9',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 8px rgba(235, 220, 185, 0.5)'
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
                width: '2.1rem',
                height: '2.1rem',
                borderRadius: '50%',
                backgroundColor: step === s.num ? '#ebdcb9' : step > s.num ? '#10b981' : '#0c0c0d',
                color: step === s.num ? '#050505' : '#fff',
                border: `1.5px solid ${step >= s.num ? '#ebdcb9' : 'rgba(235, 220, 185, 0.15)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
                boxShadow: step === s.num ? '0 0 12px rgba(235, 220, 185, 0.4)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {step > s.num ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : s.num}
              </div>
              <span style={{
                fontSize: '0.7rem',
                color: step >= s.num ? '#ebdcb9' : '#a49e8f',
                marginTop: '0.5rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: PILIH LAYANAN */}
      {step === 1 && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem', color: '#fff', letterSpacing: '-0.5px' }}>Pilih Layanan</h2>
          <p style={{ color: '#a49e8f', marginBottom: '1.75rem', fontSize: '0.85rem', fontWeight: 400 }}>
            Pilih layanan premium yang Anda inginkan untuk melanjutkan ke alur jadwal.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {services.map((s) => (
              <div 
                key={s.id} 
                onClick={() => handleServiceSelect(s.id)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.35rem',
                  borderRadius: '1rem',
                  backgroundColor: 'rgba(18, 18, 22, 0.65)',
                  border: `1px solid ${selectedServiceId === s.id ? '#ebdcb9' : 'rgba(235, 220, 185, 0.12)'}`,
                  boxShadow: selectedServiceId === s.id ? '0 0 15px rgba(235, 220, 185, 0.08)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <span style={{ fontSize: '0.65rem', color: '#ebdcb9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {s.category}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginTop: '0.15rem' }}>{s.title}</h3>
                  <p style={{ color: '#a49e8f', fontSize: '0.75rem', marginTop: '0.35rem', lineHeight: '1.4' }}>
                    {s.description}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#a49e8f', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.6rem', fontWeight: 500 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    {s.durationMins} Min
                  </span>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ebdcb9' }}>
                    Rp {s.price.toLocaleString('id-ID')}
                  </div>
                  <span style={{ 
                    color: '#050505', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    background: 'linear-gradient(135deg, #f4ebd0 0%, #ebdcb9 100%)',
                    padding: '0.25rem 0.65rem', 
                    borderRadius: '0.375rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
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
        <div style={{ maxWidth: '500px', margin: '0 auto' }} className="animate-fade-in">
          <button 
            onClick={() => setStep(1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ebdcb9',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Layanan
          </button>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem', color: '#fff', letterSpacing: '-0.5px' }}>Pilih Jadwal</h2>
          <p style={{ color: '#a49e8f', marginBottom: '1.75rem', fontSize: '0.85rem' }}>
            Layanan terpilih: <span style={{ color: '#fff', fontWeight: 700 }}>{selectedService.title}</span>
          </p>

          <form onSubmit={handleNextToPayment}>
            {/* Date Input */}
            <div style={{ marginBottom: '2rem' }}>
              <label htmlFor="bookingDate" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.6rem', color: '#fff' }}>
                1. Pilih Tanggal Cukur (Senin - Jumat)
              </label>
              <input 
                type="date"
                id="bookingDate"
                value={selectedDate}
                onChange={handleDateChange}
                onClick={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
                onFocus={(e) => {
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {}
                }}
                min={getMinDate()}
                max={getMaxDate()}
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#0c0c0d',
                  border: '1px solid rgba(235, 220, 185, 0.2)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
                  fontFamily: 'inherit',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* Time Slot Input */}
            {selectedDate && (
              <div style={{ marginBottom: '2.5rem' }} className="animate-fade-in">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.85rem', color: '#fff' }}>
                  2. Pilih Jam Mulai Cukur (30 Menit Interval)
                </label>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.6rem'
                }}>
                  {shopSettings.operatingHours.map((time) => {
                    const booked = isTimeSlotBooked(time);
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        disabled={booked}
                        onClick={() => handleTimeSelect(time)}
                        style={{
                          padding: '0.85rem 0.25rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          textAlign: 'center',
                          cursor: booked ? 'not-allowed' : 'pointer',
                          backgroundColor: isSelected ? '#ebdcb9' : booked ? 'rgba(239, 68, 68, 0.02)' : 'rgba(18, 18, 22, 0.65)',
                          color: isSelected ? '#050505' : booked ? 'rgba(255,255,255,0.15)' : '#fff',
                          border: `1px solid ${isSelected ? '#ebdcb9' : booked ? 'rgba(239, 68, 68, 0.12)' : 'rgba(235, 220, 185, 0.12)'}`,
                          opacity: booked ? 0.35 : 1,
                          transition: 'all 0.15s',
                          boxShadow: isSelected ? '0 0 10px rgba(235, 220, 185, 0.25)' : 'none'
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
              <button type="submit" className="btn animate-slide-up" style={{ 
                width: '100%', 
                padding: '1rem', 
                fontSize: '0.95rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: 'linear-gradient(135deg, #f4ebd0 0%, #ebdcb9 100%)',
                color: '#050505',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 20px rgba(235, 220, 185, 0.25)'
              }}>
                Lanjut ke Pembayaran
              </button>
            )}
          </form>
        </div>
      )}

      {/* STEP 3: DATA PELANGGAN & PEMBAYARAN MANUAL */}
      {step === 3 && selectedService && (
        <div style={{ maxWidth: '500px', margin: '0 auto' }} className="animate-fade-in">
          <button 
            onClick={() => setStep(2)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ebdcb9',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              marginBottom: '1.5rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Jadwal
          </button>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.35rem', color: '#fff', letterSpacing: '-0.5px' }}>Konfirmasi & Bayar</h2>
          <p style={{ color: '#a49e8f', marginBottom: '1.75rem', fontSize: '0.85rem', lineHeight: '1.45' }}>
            Layanan: <strong style={{ color: '#fff' }}>{selectedService.title}</strong><br />
            Jadwal: <strong style={{ color: '#ebdcb9' }}>{selectedDate} @ {selectedTime} WIB</strong>
          </p>

          {/* Payment Details VIP Card */}
          <div style={{
            background: 'rgba(18, 18, 22, 0.5)',
            border: '1px solid rgba(235, 220, 185, 0.12)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}>
            <h4 style={{ color: '#ebdcb9', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.1rem', borderBottom: '1px solid rgba(235, 220, 185, 0.1)', paddingBottom: '0.5rem' }}>
              Rekening Transfer Resmi
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#a49e8f', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Silakan lakukan transfer penuh sebesar <strong style={{ color: '#ebdcb9', fontSize: '0.9rem' }}>Rp {selectedService.price.toLocaleString('id-ID')}</strong> ke salah satu akun di bawah:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(235, 220, 185, 0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#a49e8f' }}>QRIS Mark Barber</span>
                <strong style={{ color: '#ebdcb9' }}>[ Scan di Kasir ]</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(235, 220, 185, 0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#a49e8f' }}>BCA (Arif)</span>
                <strong style={{ color: '#fff', letterSpacing: '0.5px' }}>777-12345-67</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(235, 220, 185, 0.1)', paddingBottom: '0.5rem' }}>
                <span style={{ color: '#a49e8f' }}>GOPAY (Arif)</span>
                <strong style={{ color: '#fff', letterSpacing: '0.5px' }}>0811-2160-042</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.1rem' }}>
                <span style={{ color: '#a49e8f' }}>DANA (Arif)</span>
                <strong style={{ color: '#fff', letterSpacing: '0.5px' }}>0811-2160-042</strong>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmitBooking}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#a49e8f', marginBottom: '0.4rem', fontWeight: 600 }}>Nama Lengkap Pelanggan *</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Contoh: Andi Wijaya" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', backgroundColor: '#0c0c0d', border: '1px solid rgba(235, 220, 185, 0.15)', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#a49e8f', marginBottom: '0.4rem', fontWeight: 600 }}>Nomor WhatsApp Aktif *</label>
                <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="Contoh: 0812345678" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', backgroundColor: '#0c0c0d', border: '1px solid rgba(235, 220, 185, 0.15)', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#a49e8f', marginBottom: '0.4rem', fontWeight: 600 }}>Nama Pengirim Transfer *</label>
                <input type="text" value={paymentSender} onChange={(e) => setPaymentSender(e.target.value)} placeholder="Contoh: Andi (BCA/DANA)" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', backgroundColor: '#0c0c0d', border: '1px solid rgba(235, 220, 185, 0.15)', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'all 0.2s' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#a49e8f', marginBottom: '0.4rem', fontWeight: 600 }}>Catatan Tambahan (Opsional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Model rambut undercut, dll." rows={2} style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '0.5rem', backgroundColor: '#0c0c0d', border: '1px solid rgba(235, 220, 185, 0.15)', color: '#fff', fontSize: '0.9rem', outline: 'none', resize: 'none', transition: 'all 0.2s' }} />
              </div>

              <button type="submit" className="btn" style={{ 
                width: '100%', 
                padding: '1rem', 
                fontSize: '0.95rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                background: 'linear-gradient(135deg, #f4ebd0 0%, #ebdcb9 100%)',
                color: '#050505',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 20px rgba(235, 220, 185, 0.25)',
                marginTop: '1.25rem'
              }}>
                Kirim Booking & Konfirmasi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 4: TIKET SUKSES */}
      {step === 4 && createdBooking && selectedService && (
        <div className="animate-slide-up" style={{ textAlign: 'center', maxWidth: '450px', margin: '0 auto' }}>
          <div style={{
            width: '3.75rem',
            height: '3.75rem',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            color: '#10b981',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            border: '2px solid #10b981',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.35rem', color: '#fff', letterSpacing: '-0.5px' }}>Pemesanan Terkirim</h2>
          <p style={{ color: '#a49e8f', marginBottom: '2.25rem', fontSize: '0.85rem', padding: '0 1rem', lineHeight: '1.5' }}>
            Admin akan segera melakukan konfirmasi pembayaran manual Anda. Tiket ini dapat Anda tunjukkan saat datang ke lokasi.
          </p>

          {/* Luxury Physical Ticket Style */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(22, 22, 26, 0.95) 0%, rgba(14, 14, 16, 0.95) 100%)',
            border: '1px solid rgba(235, 220, 185, 0.2)',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            textAlign: 'left',
            position: 'relative',
            marginBottom: '2.5rem',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
          }}>
            {/* Top gold bar strip */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: '#ebdcb9',
              borderRadius: '1.25rem 1.25rem 0 0'
            }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(235, 220, 185, 0.12)', paddingBottom: '0.85rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.65rem', color: '#a49e8f', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID Reservasi</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ebdcb9', marginTop: '0.15rem' }}>{createdBooking.id}</h4>
              </div>
              <span style={{ 
                padding: '0.25rem 0.6rem', 
                borderRadius: '4px', 
                backgroundColor: 'rgba(235, 220, 185, 0.08)', 
                color: '#ebdcb9', 
                fontSize: '0.65rem', 
                fontWeight: 700,
                border: '1px solid rgba(235, 220, 185, 0.15)',
                letterSpacing: '0.5px'
              }}>
                PENDING
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 1rem', fontSize: '0.8rem', marginBottom: '1.75rem' }}>
              <div>
                <span style={{ color: '#a49e8f', fontSize: '0.7rem', textTransform: 'uppercase' }}>Layanan</span>
                <p style={{ fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>{selectedService.title}</p>
              </div>
              <div>
                <span style={{ color: '#a49e8f', fontSize: '0.7rem', textTransform: 'uppercase' }}>Tukang Cukur</span>
                <p style={{ fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>{SOLO_STAFF.displayName}</p>
              </div>
              <div>
                <span style={{ color: '#a49e8f', fontSize: '0.7rem', textTransform: 'uppercase' }}>Tanggal</span>
                <p style={{ fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>{createdBooking.bookingDate}</p>
              </div>
              <div>
                <span style={{ color: '#a49e8f', fontSize: '0.7rem', textTransform: 'uppercase' }}>Jam Cukur</span>
                <p style={{ fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>{createdBooking.bookingTime} WIB</p>
              </div>
              <div>
                <span style={{ color: '#a49e8f', fontSize: '0.7rem', textTransform: 'uppercase' }}>Pelanggan</span>
                <p style={{ fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>{createdBooking.customerName}</p>
              </div>
              <div>
                <span style={{ color: '#a49e8f', fontSize: '0.7rem', textTransform: 'uppercase' }}>Total Bayar</span>
                <p style={{ fontWeight: 800, color: '#ebdcb9', fontSize: '1rem', marginTop: '0.2rem' }}>Rp {selectedService.price.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* High-fidelity Vector Barcode */}
            <div style={{ borderTop: '1px dashed rgba(235, 220, 185, 0.2)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <svg width="180" height="35" viewBox="0 0 180 35">
                {Array.from({ length: 32 }).map((_, idx) => {
                  const widths = [1, 2, 3, 4];
                  const width = widths[Math.floor((idx * 3) % 4)];
                  const x = idx * 5.5;
                  return (
                    <rect key={idx} x={x} y="0" width={width} height="35" fill="#a49e8f" />
                  );
                })}
              </svg>
              <span style={{ fontSize: '0.65rem', color: '#a49e8f', letterSpacing: '2px', fontWeight: 500 }}>* {createdBooking.id} *</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0 1rem' }}>
            <a href="/" className="btn" style={{ 
              padding: '1rem', 
              fontSize: '0.9rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(235, 220, 185, 0.2)',
              color: '#ebdcb9',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              Kembali ke Beranda
            </a>
            <a href="/queue" className="btn" style={{ 
              padding: '1rem', 
              fontSize: '0.9rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              background: 'linear-gradient(135deg, #f4ebd0 0%, #ebdcb9 100%)',
              color: '#050505',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 15px rgba(235, 220, 185, 0.2)',
              textAlign: 'center'
            }}>
              Lihat Antrian Live
            </a>
          </div>
        </div>
      )}

      {/* Bottom Floating Nav Bar */}
      <div style={{
        position: 'fixed',
        bottom: '1.25rem',
        left: '1rem',
        right: '1rem',
        height: '4.25rem',
        borderRadius: '1.5rem',
        border: '1px solid rgba(235, 220, 185, 0.15)',
        background: 'rgba(12, 12, 13, 0.85)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        alignItems: 'center',
        zIndex: 40,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <a href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#a49e8f', transition: 'color 0.2s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.5px' }}>Home</span>
        </a>
        <a href="/book" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#ebdcb9', transition: 'color 0.2s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(235,220,185,0.4))' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', color: '#ebdcb9' }}>Booking</span>
        </a>
        <a href="/queue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#a49e8f', transition: 'color 0.2s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.5px' }}>Antrian</span>
        </a>
      </div>
    </div>
  );
}
