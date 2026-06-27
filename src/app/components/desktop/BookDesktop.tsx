"use client";

import React, { useState, useEffect } from 'react';
import { getBookingInitData, createBooking, SOLO_STAFF, Booking, Service } from '@/lib/db';

export default function BookDesktop() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('1');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Form State
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [paymentSender, setPaymentSender] = useState<string>('Tunai / Transfer');
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

  // Fungsi untuk memvalidasi tanggal (hanya Senin-Jumat, dan mulai hari ini ke depan)
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
      staffId: SOLO_STAFF.id, // Otomatis diarahkan ke solo barber
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
        minHeight: '60vh',
        color: 'var(--foreground-muted)'
      }}>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid var(--surface-border)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1.5rem'
        }}></div>
        <span style={{ fontSize: '1rem' }}>Memuat data layanan & jadwal...</span>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1100px', padding: '3rem 1.5rem 6rem 1.5rem' }}>
      
      {/* Step Indicator */}
      {step < 4 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '3.5rem',
          position: 'relative',
          maxWidth: '600px',
          margin: '0 auto 3.5rem auto'
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
            { num: 1, label: "Pilih Layanan" },
            { num: 2, label: "Atur Jadwal" },
            { num: 3, label: "Konfirmasi & Bayar" }
          ].map((s) => (
            <div key={s.num} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 2,
              position: 'relative'
            }}>
              <div style={{
                width: '2.75rem',
                height: '2.75rem',
                borderRadius: '50%',
                backgroundColor: step === s.num ? 'var(--primary)' : step > s.num ? 'var(--success)' : 'var(--surface)',
                color: step === s.num ? '#000' : '#fff',
                border: `2px solid ${step >= s.num ? 'var(--primary)' : 'var(--surface-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
                boxShadow: step === s.num ? '0 0 15px var(--primary-glow)' : 'none',
                transition: 'all 0.3s ease'
              }}>
                {step > s.num ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : s.num}
              </div>
              <span style={{
                fontSize: '0.85rem',
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

      {step < 4 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2.5rem',
          alignItems: 'start'
        }}>
          
          {/* LEFT COLUMN: WIZARD FORM */}
          <div className="glass" style={{
            padding: '2.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--surface-border)'
          }}>
            
            {/* STEP 1: LAYANAN */}
            {step === 1 && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Pilih Layanan Cukur</h2>
                <p style={{ color: 'var(--foreground-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                  Layanan potong, pewarnaan, gimbal, dan perm dikerjakan personal 1-on-1 langsung oleh owner **Bang Arif**.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {services.map((s) => (
                    <div 
                      key={s.id} 
                      onClick={() => handleServiceSelect(s.id)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1.25rem 1.5rem',
                        borderRadius: '0.75rem',
                        backgroundColor: 'var(--surface)',
                        border: `1px solid ${selectedServiceId === s.id ? 'var(--primary)' : 'var(--surface-border)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                      className="service-booking-row"
                    >
                      <div style={{ flex: 1, paddingRight: '2rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {s.category}
                        </span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginTop: '0.15rem' }}>{s.title}</h3>
                        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', marginTop: '0.25rem', lineHeight: '1.4' }}>
                          {s.description}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {s.durationMins} Menit
                          </span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                          Rp {s.price.toLocaleString('id-ID')}
                        </div>
                        <button className="btn btn-secondary" style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}>
                          Pilih
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: TANGGAL & JAM */}
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

                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Pilih Tanggal & Jam</h2>
                <p style={{ color: 'var(--foreground-muted)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
                  Silakan tentukan jadwal kedatangan Anda. Barbershop buka Senin - Jumat (Sabtu & Minggu tutup).
                </p>

                <form onSubmit={handleNextToPayment}>
                  {/* Date selection */}
                  <div style={{ marginBottom: '2rem' }}>
                    <label htmlFor="bookingDate" style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: '#fff' }}>
                      1. Pilih Tanggal Cukur
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
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--surface-border)',
                        color: '#fff',
                        fontSize: '1rem',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                  </div>

                  {/* Time slots */}
                  {selectedDate && (
                    <div className="animate-fade-in" style={{ marginBottom: '2.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>
                        2. Pilih Jam Mulai
                      </label>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.75rem'
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
                                padding: '1rem 0.5rem',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: booked ? 'not-allowed' : 'pointer',
                                backgroundColor: isSelected ? 'var(--primary)' : booked ? 'rgba(239, 68, 68, 0.04)' : 'var(--surface)',
                                color: isSelected ? '#000' : booked ? 'var(--foreground-muted)' : '#fff',
                                border: `1px solid ${isSelected ? 'var(--primary)' : booked ? 'rgba(239, 68, 68, 0.2)' : 'var(--surface-border)'}`,
                                opacity: booked ? 0.4 : 1,
                                textDecoration: booked ? 'line-through' : 'none',
                                transition: 'all 0.2s'
                              }}
                            >
                              {time}
                              {booked && <span style={{ display: 'block', fontSize: '0.65rem', marginTop: '0.25rem', fontWeight: 400 }}>Penuh</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                      Lanjut ke Pembayaran
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                  )}
                </form>
              </div>
            )}

            {/* STEP 3: DETAIL PEMBAYARAN */}
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

                 <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Form Data Kontak & Booking</h2>
                <p style={{ color: 'var(--foreground-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                  Mohon isi detail kontak Anda di bawah ini untuk menyelesaikan booking.
                </p>

                <form onSubmit={handleSubmitBooking}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Customer Name */}
                    <div>
                      <label htmlFor="custName" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Nama Lengkap Anda *
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
                          padding: '0.85rem 1rem',
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
                    <div>
                      <label htmlFor="custPhone" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                        Nomor WhatsApp Aktif *
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
                          padding: '0.85rem 1rem',
                          borderRadius: '0.375rem',
                          backgroundColor: 'var(--surface)',
                          border: '1px solid var(--surface-border)',
                          color: '#fff',
                          fontSize: '0.95rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div style={{ marginBottom: '2.5rem' }}>
                    <label htmlFor="notes" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                      Catatan Tambahan (Model Rambut / Preferensi)
                    </label>
                    <textarea 
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Jelaskan jika ada model potongan khusus atau riwayat ketombe, dll."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
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

                  <button type="submit" className="btn btn-primary glow-pulse" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
                    Kirim Formulir Booking & Konfirmasi
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                </form>
              </div>
            )}
            
          </div>

          {/* RIGHT COLUMN: STICKY BOOKING SUMMARY */}
          <div style={{
            position: 'sticky',
            top: '6rem'
          }}>
            <div className="glass" style={{
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid var(--surface-border)',
              backgroundColor: 'var(--surface)'
            }}>
              <h3 style={{
                color: 'var(--primary)',
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--surface-border)',
                paddingBottom: '0.75rem'
              }}>
                Ringkasan Booking
              </h3>

              {selectedService ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Service Info */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Layanan Terpilih</span>
                    <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{selectedService.title}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                      Rp {selectedService.price.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Stylist info */}
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Kapster</span>
                    <p style={{ color: '#fff', fontWeight: 500, fontSize: '0.9rem', marginTop: '0.2rem' }}>{SOLO_STAFF.displayName} (Owner)</p>
                  </div>

                  {/* Schedule info */}
                  {(selectedDate || selectedTime) && (
                    <div style={{ borderTop: '1px dashed var(--surface-border)', paddingTop: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Jadwal Kedatangan</span>
                      {selectedDate && (
                        <p style={{ color: '#fff', fontWeight: 500, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                          Tanggal: {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                      {selectedTime && (
                        <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', marginTop: '0.25rem' }}>
                          Pukul: {selectedTime} WIB
                        </p>
                      )}
                    </div>
                  )}

                  {/* Payment Account Details */}
                  {step === 3 && (
                    <div style={{
                      borderTop: '1px solid var(--surface-border)',
                      paddingTop: '1.25rem',
                      fontSize: '0.85rem'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Tujuan Transfer Bank:
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--foreground-muted)' }}>
                        <div>BCA: <strong style={{ color: '#fff' }}>777-12345-67</strong> (Arif)</div>
                        <div>GOPAY/OVO: <strong style={{ color: '#fff' }}>0811-2160-042</strong></div>
                        <div>DANA: <strong style={{ color: '#fff' }}>0811-2160-042</strong></div>
                      </div>
                    </div>
                  )}

                  <div style={{
                    borderTop: '1px solid var(--surface-border)',
                    paddingTop: '1.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.5rem'
                  }}>
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>Total Bayar:</span>
                    <strong style={{ color: 'var(--primary)', fontSize: '1.35rem', fontWeight: 800 }}>
                      Rp {selectedService.price.toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.75rem', opacity: 0.5 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <p>Silakan pilih layanan terlebih dahulu untuk melihat ringkasan.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* STEP 4: TIKET KONFIRMASI (SUKSES) */
        <div className="animate-slide-up" style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto' }}>
          
          <div style={{
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            border: '2px solid var(--success)'
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>

          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>Pemesanan Berhasil Dikirim!</h2>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '3rem', fontSize: '1rem' }}>
            Detail pemesanan Anda telah terekam. Pembayaran Anda akan segera diverifikasi oleh Bang Arif secara manual. Silakan simpan struk tiket digital Anda di bawah:
          </p>

          {/* Ticket layout */}
          <div style={{
            background: 'linear-gradient(135deg, #16161a 0%, #0d0d10 100%)',
            border: '1px solid var(--surface-border)',
            borderRadius: '1.25rem',
            padding: '3rem',
            textAlign: 'left',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '3.5rem'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: 'var(--primary)'
            }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>ID Pemesanan</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.15rem' }}>{createdBooking?.id}</h4>
              </div>
              <div style={{
                padding: '0.35rem 1rem',
                borderRadius: '50px',
                backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                color: 'var(--primary)',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid rgba(var(--primary-rgb), 0.2)'
              }}>
                Menunggu Verifikasi
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>Layanan</span>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginTop: '0.25rem' }}>{selectedService?.title}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>Tukang Cukur (Kapster)</span>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginTop: '0.25rem' }}>{SOLO_STAFF.displayName} (Owner)</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>Hari & Tanggal</span>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginTop: '0.25rem' }}>{createdBooking?.bookingDate}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>Waktu Mulai</span>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginTop: '0.25rem' }}>{createdBooking?.bookingTime} WIB</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>Nama Pelanggan</span>
                <p style={{ fontWeight: 700, color: '#fff', fontSize: '1.05rem', marginTop: '0.25rem' }}>{createdBooking?.customerName}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>Jumlah Pembayaran</span>
                <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.25rem', marginTop: '0.25rem' }}>Rp {selectedService?.price.toLocaleString('id-ID')}</p>
              </div>
            </div>

            {/* Barcode SVG */}
            <div style={{
              borderTop: '1px dashed var(--surface-border)',
              paddingTop: '2rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="220" height="45" viewBox="0 0 220 45">
                {Array.from({ length: 38 }).map((_, idx) => {
                  const width = [1, 2, 3, 4][Math.floor(Math.random() * 4)];
                  const x = idx * 6;
                  return (
                    <rect key={idx} x={x} y="0" width={width} height="45" fill="var(--foreground-muted)" />
                  );
                })}
              </svg>
              <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', letterSpacing: '3px' }}>* MARK-BARBER-N-SHOP *</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem' }}>
            <a href="/" className="btn btn-secondary" style={{ padding: '0.85rem 2.5rem', fontSize: '0.95rem' }}>
              Kembali ke Beranda
            </a>
            <a href="/queue" className="btn btn-primary" style={{ padding: '0.85rem 2.5rem', fontSize: '0.95rem' }}>
              Pantau Antrian Live
            </a>
          </div>
        </div>
      )}
      
    </div>
  );
}
