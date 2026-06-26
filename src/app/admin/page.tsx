"use client";

import React, { useState, useEffect } from 'react';
import { 
  getBookings, 
  getQueue, 
  getServices, 
  updateBookingStatus, 
  updateQueueStatus, 
  addWalkInQueue,
  subscribeToBookings, 
  subscribeToQueue, 
  Booking, 
  QueueItem,
  SERVICES 
} from '@/lib/db';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'queue' | 'finance'>('bookings');
  
  // Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [queues, setQueues] = useState<QueueItem[]>([]);
  
  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInServiceId, setWalkInServiceId] = useState('');
  
  // Filter tanggal laporan keuangan (Default: 7 hari terakhir)
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const refreshData = () => {
    setBookings(getBookings());
    setQueues(getQueue());
  };

  useEffect(() => {
    refreshData();
    
    // Subscribe to real-time events to sync admin dashboard instantly
    const unsubscribeBookings = subscribeToBookings(refreshData);
    const unsubscribeQueue = subscribeToQueue(refreshData);
    
    // Set filter default ke 7 hari terakhir
    const today = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7);
    setFilterStartDate(lastWeek.toISOString().split('T')[0]);
    setFilterEndDate(today.toISOString().split('T')[0]);

    return () => {
      unsubscribeBookings();
      unsubscribeQueue();
    };
  }, []);

  // Filter Bookings & Queues
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeQueues = queues.filter(q => q.status === 'waiting' || q.status === 'serving');
  
  // Hitung data untuk Laporan Keuangan
  const completedBookings = bookings.filter(b => {
    if (b.status !== 'completed') return false;
    
    // Filter rentang tanggal
    if (filterStartDate && b.bookingDate < filterStartDate) return false;
    if (filterEndDate && b.bookingDate > filterEndDate) return false;
    return true;
  });

  const totalRevenue = completedBookings.reduce((sum, b) => {
    const service = SERVICES.find(s => s.id === b.serviceId);
    return sum + (service ? service.price : 0);
  }, 0);

  const avgTicketSize = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

  // Layanan Terpopuler
  const serviceStats = SERVICES.map(s => {
    const count = completedBookings.filter(b => b.serviceId === s.id).length;
    return {
      title: s.title,
      count,
      revenue: count * s.price
    };
  }).filter(stat => stat.count > 0).sort((a, b) => b.count - a.count);

  // Pendapatan Harian selama 7 hari terakhir
  const getDailyRevenueStats = () => {
    const dailyMap: { [date: string]: number } = {};
    
    // Inisialisasi 7 hari terakhir dengan 0
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = 0;
    }
    
    // Masukkan data transaksi riil
    completedBookings.forEach(b => {
      if (dailyMap[b.bookingDate] !== undefined) {
        const s = SERVICES.find(serv => serv.id === b.serviceId);
        dailyMap[b.bookingDate] += s ? s.price : 0;
      }
    });

    return Object.entries(dailyMap).map(([date, revenue]) => {
      // Format tanggal pendek (dd/mm)
      const parts = date.split('-');
      const shortDate = `${parts[2]}/${parts[1]}`;
      return { label: shortDate, value: revenue };
    });
  };

  const dailyStats = getDailyRevenueStats();
  const maxDailyVal = Math.max(...dailyStats.map(d => d.value), 100000); // Mencegah bagi dengan 0

  // Aksi Konfirmasi Booking
  const handleApproveBooking = (id: string) => {
    updateBookingStatus(id, 'confirmed');
  };

  const handleCancelBooking = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menolak booking ini?")) {
      updateBookingStatus(id, 'cancelled');
    }
  };

  // Aksi Kelola Antrian
  const handleStartServing = (id: string) => {
    // Cari apakah sudah ada yang sedang dilayani, selesaikan dulu atau beri peringatan
    const alreadyServing = queues.some(q => q.status === 'serving');
    if (alreadyServing) {
      alert("Masih ada pelanggan yang sedang dicukur. Selesaikan layanan tersebut terlebih dahulu!");
      return;
    }
    updateQueueStatus(id, 'serving');
  };

  const handleCompleteServing = (id: string) => {
    updateQueueStatus(id, 'completed');
  };

  const handleSkipQueue = (id: string) => {
    if (confirm("Apakah Anda yakin ingin melempar/melewati nomor antrian ini?")) {
      updateQueueStatus(id, 'skipped');
    }
  };

  // Aksi Tambah Walk-in
  const handleAddWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInServiceId) {
      alert("Lengkapi nama pelanggan dan pilih layanan.");
      return;
    }
    addWalkInQueue(walkInName, walkInServiceId);
    setWalkInName('');
    setWalkInServiceId('');
    alert("Pelanggan walk-in berhasil ditambahkan ke antrian!");
  };

  // Ekspor ke Excel (Format CSV Enkode UTF-8)
  const handleExportExcel = () => {
    let csvContent = "\uFEFF"; // Byte Order Mark (BOM) agar Excel mengenali karakter UTF-8
    csvContent += "ID Transaksi,Tanggal,Pelanggan,WhatsApp,Layanan,Harga,Metode Pembayaran,Referensi\n";
    
    completedBookings.forEach(b => {
      const service = SERVICES.find(s => s.id === b.serviceId);
      const price = service ? service.price : 0;
      const title = service ? service.title.replace(/,/g, ' ') : '';
      const name = b.customerName.replace(/,/g, ' ');
      const phone = b.customerPhone;
      const ref = b.paymentReference.replace(/,/g, ' ');
      const sender = b.paymentSender.replace(/,/g, ' ');
      
      csvContent += `${b.id},${b.bookingDate},${name},${phone},${title},${price},"${sender}",${ref}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Keuangan_MarkBarber_${filterStartDate}_to_${filterEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ekspor ke PDF (Trigger Cetak)
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      
      {/* Printable Report View (Hanya muncul saat window.print() dijalankan) */}
      <div className="print-report-header" style={{ width: '100%' }}>
        <h1 className="print-report-title">MARK BARBER N SHOP</h1>
        <p style={{ fontSize: '12pt', marginBottom: '0.5rem' }}>Laporan Pendapatan Keuangan Barbershop (Solo Barber)</p>
        <p style={{ fontSize: '10pt', color: '#555', marginBottom: '1.5rem' }}>
          Periode Laporan: <strong>{filterStartDate}</strong> s/d <strong>{filterEndDate}</strong> | Dicetak pada: {new Date().toLocaleDateString('id-ID')}
        </p>
        
        <h3 style={{ borderBottom: '1px solid #000', paddingBottom: '0.25rem', marginTop: '2rem' }}>Ringkasan Pendapatan</h3>
        <table style={{ margin: '1rem 0 2rem 0' }}>
          <thead>
            <tr>
              <th>Total Pendapatan (IDR)</th>
              <th>Total Transaksi Sukses</th>
              <th>Rata-rata Pendapatan / Kepala</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Rp {totalRevenue.toLocaleString('id-ID')}</td>
              <td>{completedBookings.length} Kali Cukur</td>
              <td>Rp {avgTicketSize.toLocaleString('id-ID')}</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ borderBottom: '1px solid #000', paddingBottom: '0.25rem', marginTop: '2rem' }}>Detail Transaksi Selesai</h3>
        <table>
          <thead>
            <tr>
              <th>ID Booking</th>
              <th>Tanggal</th>
              <th>Nama Pelanggan</th>
              <th>Layanan Terpilih</th>
              <th>Pendapatan</th>
              <th>Pengirim / Ref</th>
            </tr>
          </thead>
          <tbody>
            {completedBookings.map((b) => {
              const service = SERVICES.find(s => s.id === b.serviceId);
              return (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.bookingDate}</td>
                  <td>{b.customerName}</td>
                  <td>{service?.title}</td>
                  <td>Rp {service ? service.price.toLocaleString('id-ID') : 0}</td>
                  <td>{b.paymentSender} ({b.paymentReference})</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Screen view content */}
      <div className="no-print animate-fade-in">
        <h1 className="gold-gradient-text" style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '2rem' }}>
          Dasbor Admin Barbershop
        </h1>

        {/* Tab Navigation buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--surface-border)',
          paddingBottom: '1rem',
          marginBottom: '2.5rem',
          overflowX: 'auto'
        }}>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
          >
            Persetujuan Booking ({pendingBookings.length})
          </button>
          <button 
            onClick={() => setActiveTab('queue')}
            className={`btn ${activeTab === 'queue' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
          >
            Kontrol Antrian ({activeQueues.length})
          </button>
          <button 
            onClick={() => setActiveTab('finance')}
            className={`btn ${activeTab === 'finance' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
          >
            Laporan Keuangan
          </button>
        </div>

        {/* TAB 1: PERSETUJUAN BOOKING */}
        {activeTab === 'bookings' && (
          <div className="animate-slide-up">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
              Booking Online Menunggu Konfirmasi Manual
            </h3>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Periksa mutasi e-wallet / bank Anda berdasarkan Nama Pengirim & Nomor Referensi di bawah ini. Jika dana sudah masuk, klik tombol **Setujui** untuk memindahkan pelanggan ke Antrian Live.
            </p>

            {pendingBookings.length === 0 ? (
              <div className="glass" style={{ textAlign: 'center', padding: '3rem 1rem', borderRadius: '1rem', color: 'var(--foreground-muted)' }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                <p>Tidak ada booking pending yang perlu dikonfirmasi.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {pendingBookings.map((b) => {
                  const service = SERVICES.find(s => s.id === b.serviceId);
                  // Ubah nomor telepon agar bisa diklik langsung buka WA (misal: 0812 -> 62812)
                  const cleanPhone = b.customerPhone.replace(/^0/, '62');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Halo%20${encodeURIComponent(b.customerName)},%20booking%20barbershop%20Anda%20pada%20tanggal%20${b.bookingDate}%20jam%20${b.bookingTime}%20WIB%20telah%20kami%20verifikasi.%20Silakan%20datang%20tepat%20waktu!`;

                  return (
                    <div key={b.id} className="glass" style={{
                      padding: '1.5rem',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--surface-border)',
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '1.25rem'
                    }}>
                      {/* Grid Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>{b.customerName}</h4>
                          <a 
                            href={waUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            style={{ 
                              color: 'var(--primary)', 
                              fontSize: '0.85rem', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.25rem',
                              marginTop: '0.25rem'
                            }}
                          >
                            {/* WA logo path */}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            {b.customerPhone} (Hubungi via WA)
                          </a>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Jadwal yang Diminta:</span>
                          <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{b.bookingDate} @ {b.bookingTime} WIB</p>
                        </div>
                      </div>

                      {/* Grid Body */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', fontSize: '0.9rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Layanan Terpilih</span>
                          <p style={{ color: '#fff', fontWeight: 600, marginTop: '0.15rem' }}>{service?.title}</p>
                          <p style={{ color: 'var(--primary)', fontWeight: 700, marginTop: '0.15rem' }}>Rp {service ? service.price.toLocaleString('id-ID') : 0}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Nama Pengirim Pembayaran</span>
                          <p style={{ color: '#fff', fontWeight: 600, marginTop: '0.15rem' }}>{b.paymentSender}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Nomor / ID Referensi</span>
                          <p style={{ color: 'var(--success)', fontWeight: 700, marginTop: '0.15rem' }}>{b.paymentReference}</p>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                        <button 
                          onClick={() => handleCancelBooking(b.id)}
                          className="btn btn-secondary btn-danger" 
                          style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                        >
                          Tolak Booking
                        </button>
                        <button 
                          onClick={() => handleApproveBooking(b.id)}
                          className="btn btn-primary" 
                          style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}
                        >
                          Setujui & Antrikan
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: KONTROL ANTRIAN JALAN */}
        {activeTab === 'queue' && (
          <div className="animate-slide-up" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem'
          }}>
            
            {/* Kolom Kiri: Antrian Harian & Kontrol */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>
                Nomor Antrian Harian Berjalan
              </h3>

              {activeQueues.length === 0 ? (
                <div className="glass" style={{ textAlign: 'center', padding: '3rem 1rem', borderRadius: '1rem', color: 'var(--foreground-muted)' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <p>Belum ada antrian aktif saat ini.</p>
                  <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Setujui booking online atau tambahkan walk-in di sebelah kanan.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeQueues.map((q) => {
                    const isServing = q.status === 'serving';
                    return (
                      <div key={q.id} className="glass" style={{
                        padding: '1.25rem',
                        borderRadius: '0.75rem',
                        border: `1px solid ${isServing ? 'var(--primary)' : 'var(--surface-border)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        background: isServing ? 'linear-gradient(90deg, rgba(245,158,11,0.03) 0%, transparent 100%)' : 'var(--surface)'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: isServing ? 'var(--primary)' : '#fff' }}>
                              {q.queueNumber}
                            </span>
                            <span style={{
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              backgroundColor: isServing ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)',
                              color: isServing ? 'var(--primary)' : 'var(--foreground-muted)',
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              border: `1px solid ${isServing ? 'rgba(245, 158, 11, 0.2)' : 'var(--surface-border)'}`
                            }}>
                              {isServing ? 'SEDANG DICUKUR' : 'MENUNGGU'}
                            </span>
                          </div>
                          <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600, marginTop: '0.25rem' }}>
                            {q.customerName} {q.bookingId === null && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 500 }}>(Walk-In)</span>}
                          </h4>
                          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                            Layanan: {q.serviceTitle} ({q.durationMins} Mins)
                          </p>
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {isServing ? (
                            <button 
                              onClick={() => handleCompleteServing(q.id)}
                              className="btn btn-primary" 
                              style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', backgroundColor: 'var(--success)', color: '#fff' }}
                            >
                              Selesai Cukur
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleSkipQueue(q.id)}
                                className="btn btn-secondary btn-danger" 
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                title="Lewati Antrian"
                              >
                                Lewati
                              </button>
                              <button 
                                onClick={() => handleStartServing(q.id)}
                                className="btn btn-primary" 
                                style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                              >
                                Mulai Layani
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Kolom Kanan: Input Pelanggan Walk-In */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#fff' }}>
                Tambah Antrian Walk-In (Langsung)
              </h3>
              
              <div className="glass" style={{
                padding: '2rem',
                borderRadius: '1rem'
              }}>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                  Gunakan formulir ini apabila ada pelanggan datang langsung ke toko tanpa melakukan booking online sebelumnya.
                </p>

                <form onSubmit={handleAddWalkIn}>
                  {/* Name */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="walkInName" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
                      Nama Pelanggan Walk-In *
                    </label>
                    <input 
                      type="text" 
                      id="walkInName"
                      value={walkInName}
                      onChange={(e) => setWalkInName(e.target.value)}
                      placeholder="Contoh: Andi Wijaya"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.375rem',
                        backgroundColor: 'var(--surface-hover)',
                        border: '1px solid var(--surface-border)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Service */}
                  <div style={{ marginBottom: '1.75rem' }}>
                    <label htmlFor="walkInService" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
                      Layanan Terpilih *
                    </label>
                    <select
                      id="walkInService"
                      value={walkInServiceId}
                      onChange={(e) => setWalkInServiceId(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.375rem',
                        backgroundColor: 'var(--surface-hover)',
                        border: '1px solid var(--surface-border)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    >
                      <option value="" disabled>-- Pilih Layanan --</option>
                      {SERVICES.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title} (Rp {s.price.toLocaleString('id-ID')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                    Masukkan ke Antrian
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: LAPORAN KEUANGAN & EKSPOR */}
        {activeTab === 'finance' && (
          <div className="animate-slide-up">
            
            {/* Filter Rentang Tanggal & Tombol Ekspor */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginBottom: '2.5rem',
              padding: '1.5rem',
              borderRadius: '1rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--surface-border)'
            }}>
              {/* Date Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>Mulai Tanggal</label>
                  <input 
                    type="date" 
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>Sampai Tanggal</label>
                  <input 
                    type="date" 
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handleExportExcel} className="btn btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Ekspor ke Excel
                </button>
                <button onClick={handleExportPDF} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Cetak PDF Laporan
                </button>
              </div>
            </div>

            {/* Metrics Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              {/* Card 1: Revenue */}
              <div className="glass" style={{ padding: '1.75rem', borderRadius: '0.75rem', border: '1px solid var(--surface-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontWeight: 600 }}>TOTAL PENDAPATAN</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.5rem' }}>
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>
                  Berdasarkan rentang tanggal terpilih
                </p>
              </div>

              {/* Card 2: Transactions */}
              <div className="glass" style={{ padding: '1.75rem', borderRadius: '0.75rem', border: '1px solid var(--surface-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontWeight: 600 }}>TRANSAKSI SELESAI</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
                  {completedBookings.length} Kepala
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>
                  Pelanggan selesai dicukur
                </p>
              </div>

              {/* Card 3: Average Ticket */}
              <div className="glass" style={{ padding: '1.75rem', borderRadius: '0.75rem', border: '1px solid var(--surface-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontWeight: 600 }}>RATA-RATA TRANSAKSI</span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
                  Rp {avgTicketSize.toLocaleString('id-ID')}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>
                  Rata-rata pengeluaran per kepala
                </p>
              </div>
            </div>

            {/* Graphs Grid (SVG Charts) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              marginBottom: '3rem'
            }}>
              
              {/* Daily Revenue Bar Graph (SVG) */}
              <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '2rem' }}>
                  Grafik Pendapatan Harian (7 Hari Terakhir)
                </h4>

                {/* SVG Bar Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {dailyStats.map((item, idx) => {
                    const pct = (item.value / maxDailyVal) * 100;
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {/* Date label */}
                        <span style={{ width: '45px', fontSize: '0.8rem', color: 'var(--foreground-muted)', textAlign: 'right' }}>
                          {item.label}
                        </span>
                        {/* Bar container */}
                        <div style={{ flex: 1, height: '18px', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 100%)',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease'
                          }}></div>
                        </div>
                        {/* Value label */}
                        <span style={{ width: '85px', fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>
                          Rp {item.value.toLocaleString('id-ID')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Popular Services (SVG Donut Chart or Stylized List) */}
              <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                  Layanan Terlaris & Kontribusi Omzet
                </h4>

                {serviceStats.length === 0 ? (
                  <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>
                    Belum ada riwayat transaksi selesai untuk periode ini.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {serviceStats.map((stat, idx) => {
                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                            <strong style={{ color: '#fff' }}>{stat.title}</strong>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{stat.count}x dicukur ({Math.round((stat.revenue / totalRevenue) * 100)}%)</span>
                          </div>
                          {/* Progress/omzet bar */}
                          <div style={{ height: '6px', backgroundColor: 'var(--surface-hover)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${(stat.revenue / totalRevenue) * 100}%`,
                              height: '100%',
                              backgroundColor: 'var(--success)',
                              borderRadius: '10px'
                            }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
                            Kontribusi Omzet: Rp {stat.revenue.toLocaleString('id-ID')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Transactions History Table */}
            <div className="glass" style={{ borderRadius: '1rem', padding: '2rem' }}>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                Daftar Riwayat Transaksi Lunas
              </h4>

              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem',
                  textAlign: 'left'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--foreground-muted)' }}>
                      <th style={{ padding: '1rem' }}>ID Transaksi</th>
                      <th style={{ padding: '1rem' }}>Tanggal</th>
                      <th style={{ padding: '1rem' }}>Pelanggan</th>
                      <th style={{ padding: '1rem' }}>Layanan</th>
                      <th style={{ padding: '1rem' }}>Harga</th>
                      <th style={{ padding: '1rem' }}>Pengirim / Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedBookings.length > 0 ? (
                      completedBookings.map((b) => {
                        const service = SERVICES.find(s => s.id === b.serviceId);
                        return (
                          <tr key={b.id} style={{ borderBottom: '1px solid var(--surface-border)' }} className="table-row-hover">
                            <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>{b.id}</td>
                            <td style={{ padding: '1rem', color: '#fff' }}>{b.bookingDate}</td>
                            <td style={{ padding: '1rem', color: '#fff', fontWeight: 500 }}>{b.customerName}</td>
                            <td style={{ padding: '1rem', color: 'var(--foreground-muted)' }}>{service?.title}</td>
                            <td style={{ padding: '1rem', color: '#fff', fontWeight: 600 }}>
                              Rp {service ? service.price.toLocaleString('id-ID') : 0}
                            </td>
                            <td style={{ padding: '1rem', color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>
                              <strong>{b.paymentSender}</strong> ({b.paymentReference})
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>
                          Tidak ada transaksi selesai pada periode ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
