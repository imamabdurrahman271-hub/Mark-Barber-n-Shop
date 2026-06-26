"use client";

import React, { useState, useEffect } from 'react';
import { 
  getBookings, 
  getQueue, 
  updateBookingStatus, 
  updateQueueStatus, 
  addWalkInQueue,
  subscribeToBookings, 
  subscribeToQueue, 
  Booking, 
  QueueItem,
  getServices,
  createService,
  updateService,
  deleteService,
  getShopSettings,
  updateShopSettings,
  Service,
  ShopSettings
} from '@/lib/db';
import ServicesManager from '@/app/components/admin/ServicesManager';
import SettingsManager from '@/app/components/admin/SettingsManager';

export default function AdminDesktop() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'queue' | 'finance' | 'services' | 'settings'>('bookings');
  
  // Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    id: 'default',
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
  
  // Walk-in form state
  const [walkInName, setWalkInName] = useState('');
  const [walkInServiceId, setWalkInServiceId] = useState('');
  
  // Filter tanggal laporan keuangan (Default: 7 hari terakhir)
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari dasbor admin?")) {
      try {
        await fetch('/api/admin/logout', { method: 'POST' });
        window.location.href = '/';
      } catch (err) {
        alert('Gagal melakukan logout.');
      }
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    Promise.all([
      getBookings(),
      getQueue(),
      getServices(),
      getShopSettings()
    ]).then(([fetchedBookings, fetchedQueues, fetchedServices, fetchedSettings]) => {
      setBookings(fetchedBookings);
      setQueues(fetchedQueues);
      setServices(fetchedServices);
      setShopSettings(fetchedSettings);
      if (fetchedServices.length > 0 && !walkInServiceId) {
        setWalkInServiceId(fetchedServices[0].id);
      }
      setIsLoading(false);
    }).catch(err => {
      console.error('Error refreshing admin data:', err);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    refreshData();
    const unsubscribeBookings = subscribeToBookings(() => {
      getBookings().then(setBookings);
    });
    const unsubscribeQueue = subscribeToQueue(refreshData);
    
    // Set default filter to last 7 days
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

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeQueues = queues.filter(q => q.status === 'waiting' || q.status === 'serving');
  
  const completedBookings = bookings.filter(b => {
    if (b.status !== 'completed') return false;
    if (filterStartDate && b.bookingDate < filterStartDate) return false;
    if (filterEndDate && b.bookingDate > filterEndDate) return false;
    return true;
  });

  const totalRevenue = completedBookings.reduce((sum, b) => {
    const service = services.find(s => s.id === b.serviceId);
    return sum + (service ? service.price : 0);
  }, 0);

  const avgTicketSize = completedBookings.length > 0 ? totalRevenue / completedBookings.length : 0;

  const serviceStats = services.map(s => {
    const count = completedBookings.filter(b => b.serviceId === s.id).length;
    return {
      title: s.title,
      count,
      revenue: count * s.price
    };
  }).filter(stat => stat.count > 0).sort((a, b) => b.count - a.count);

  const getDailyRevenueStats = () => {
    const dailyMap: { [date: string]: number } = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailyMap[dateStr] = 0;
    }
    
    completedBookings.forEach(b => {
      if (dailyMap[b.bookingDate] !== undefined) {
        const s = services.find(serv => serv.id === b.serviceId);
        dailyMap[b.bookingDate] += s ? s.price : 0;
      }
    });

    return Object.entries(dailyMap).map(([date, revenue]) => {
      const parts = date.split('-');
      const shortDate = `${parts[2]}/${parts[1]}`;
      return { label: shortDate, value: revenue };
    });
  };

  const dailyStats = getDailyRevenueStats();
  const maxDailyVal = Math.max(...dailyStats.map(d => d.value), 100000);

  const handleApproveBooking = async (id: string) => {
    await updateBookingStatus(id, 'confirmed');
  };

  const handleCancelBooking = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menolak booking ini?")) {
      await updateBookingStatus(id, 'cancelled');
    }
  };

  const handleStartServing = async (id: string) => {
    const alreadyServing = queues.some(q => q.status === 'serving');
    if (alreadyServing) {
      alert("Masih ada pelanggan yang sedang dicukur. Selesaikan layanan tersebut terlebih dahulu!");
      return;
    }
    await updateQueueStatus(id, 'serving');
  };

  const handleCompleteServing = async (id: string) => {
    await updateQueueStatus(id, 'completed');
  };

  const handleSkipQueue = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin melempar/melewati nomor antrian ini?")) {
      await updateQueueStatus(id, 'skipped');
    }
  };

  const handleAddWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName || !walkInServiceId) {
      alert("Lengkapi nama pelanggan dan pilih layanan.");
      return;
    }
    try {
      await addWalkInQueue(walkInName, walkInServiceId);
      setWalkInName('');
      setWalkInServiceId('');
      alert("Pelanggan walk-in berhasil dimasukkan ke antrian!");
    } catch (err) {
      alert("Gagal menambahkan pelanggan walk-in.");
    }
  };

  const handleExportExcel = () => {
    let csvContent = "\uFEFF";
    csvContent += "ID Transaksi,Tanggal,Pelanggan,WhatsApp,Layanan,Harga,Metode Pembayaran,Referensi\n";
    
    completedBookings.forEach(b => {
      const service = services.find(s => s.id === b.serviceId);
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

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 6rem 1.5rem' }}>
      
      {/* PRINT VIEW (Hanya muncul saat Window.print() / ekspor PDF dipicu) */}
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
              const service = services.find(s => s.id === b.serviceId);
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

      {/* SCREEN VIEW (Disembunyikan saat dicetak) */}
      <div className="no-print animate-fade-in">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 className="gold-gradient-text" style={{ fontSize: '2.25rem', fontWeight: 800 }}>
              Dasbor Admin Utama
            </h1>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Kelola pesanan masuk, antrian berjalan, dan analisis omzet harian <strong>Bang Arif</strong>.
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              border: '1px solid var(--surface-border)',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--surface)'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>Desktop Admin Mode</span>
            </div>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary" 
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem', border: '1px solid var(--error)', color: 'var(--error)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--surface-border)',
          paddingBottom: '1rem',
          marginBottom: '2.5rem'
        }}>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`btn ${activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
          >
            Persetujuan Booking ({pendingBookings.length})
          </button>
          <button 
            onClick={() => setActiveTab('queue')}
            className={`btn ${activeTab === 'queue' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
          >
            Kontrol Antrian ({activeQueues.length})
          </button>
          <button 
            onClick={() => setActiveTab('finance')}
            className={`btn ${activeTab === 'finance' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
          >
            Laporan Keuangan
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`btn ${activeTab === 'services' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
          >
            Kelola Layanan
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
          >
            Pengaturan Toko
          </button>
        </div>

        {/* TAB 1: PERSETUJUAN BOOKING */}
        {activeTab === 'bookings' && (
          <div className="animate-slide-up">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>
              Daftar Reservasi Online Menunggu Konfirmasi
            </h3>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Cek mutasi bank/e-wallet untuk memastikan dana pembayaran manual telah diterima, lalu setujui reservasi agar dimasukkan ke antrian harian.
            </p>

            {pendingBookings.length === 0 ? (
              <div className="glass" style={{ textAlign: 'center', padding: '4rem 1rem', borderRadius: '1rem', color: 'var(--foreground-muted)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.4 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
                <p style={{ fontSize: '0.95rem' }}>Tidak ada reservasi pending saat ini.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {pendingBookings.map((b) => {
                  const service = services.find(s => s.id === b.serviceId);
                  const cleanPhone = b.customerPhone.replace(/^0/, '62');
                  const waUrl = `https://wa.me/${cleanPhone}?text=Halo%20${encodeURIComponent(b.customerName)},%20booking%20barbershop%20Anda%20pada%20tanggal%20${b.bookingDate}%20jam%20${b.bookingTime}%20WIB%20telah%20kami%20verifikasi.%20Silakan%20datang%20tepat%20waktu!`;

                  return (
                    <div key={b.id} className="glass" style={{
                      padding: '1.75rem',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--surface-border)',
                      display: 'grid',
                      gridTemplateColumns: '1fr',
                      gap: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem' }}>
                        <div>
                          <h4 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700 }}>{b.customerName}</h4>
                          <a href={waUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.25rem', fontWeight: 600 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            {b.customerPhone} (Hubungi WhatsApp)
                          </a>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)' }}>Rencana Kedatangan:</span>
                          <p style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', marginTop: '0.15rem' }}>{b.bookingDate} &bull; {b.bookingTime} WIB</p>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', fontSize: '0.9rem' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Layanan</span>
                          <p style={{ color: '#fff', fontWeight: 600, marginTop: '0.15rem' }}>{service?.title}</p>
                          <strong style={{ color: 'var(--primary)' }}>Rp {service?.price.toLocaleString('id-ID')}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Metode Bayar</span>
                          <p style={{ color: '#fff', fontWeight: 600, marginTop: '0.15rem' }}>Transfer Manual</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Pengirim Rekening</span>
                          <p style={{ color: '#fff', fontWeight: 600, marginTop: '0.15rem' }}>{b.paymentSender}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>ID Referensi Pembayaran</span>
                          <p style={{ color: 'var(--success)', fontWeight: 700, marginTop: '0.15rem' }}>{b.paymentReference}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                        <button onClick={() => handleCancelBooking(b.id)} className="btn btn-secondary btn-danger" style={{ padding: '0.5rem 1.5rem', fontSize: '0.85rem' }}>
                          Tolak Reservasi
                        </button>
                        <button onClick={() => handleApproveBooking(b.id)} className="btn btn-primary" style={{ padding: '0.5rem 2rem', fontSize: '0.85rem' }}>
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

        {/* TAB 2: KONTROL ANTRIAN BERJALAN */}
        {activeTab === 'queue' && (
          <div className="animate-slide-up" style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '3rem',
            alignItems: 'start'
          }}>
            
            {/* Left side: Queue items list */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff' }}>
                Monitor Antrian Berjalan Hari Ini
              </h3>

              {activeQueues.length === 0 ? (
                <div className="glass" style={{ textAlign: 'center', padding: '4rem 1.5rem', borderRadius: '1rem', color: 'var(--foreground-muted)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.4 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <p style={{ fontSize: '0.95rem' }}>Tidak ada antrian aktif saat ini.</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Setujui booking online di tab sebelah atau input pelanggan walk-in di samping.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {activeQueues.map((q) => {
                    const isServing = q.status === 'serving';
                    return (
                      <div key={q.id} className="glass" style={{
                        padding: '1.5rem',
                        borderRadius: '0.75rem',
                        border: `1px solid ${isServing ? 'var(--primary)' : 'var(--surface-border)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1.5rem',
                        background: isServing ? 'linear-gradient(90deg, rgba(245,158,11,0.04) 0%, transparent 100%)' : 'var(--surface)'
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: isServing ? 'var(--primary)' : '#fff', lineHeight: 1 }}>
                              {q.queueNumber}
                            </span>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px',
                              backgroundColor: isServing ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(255,255,255,0.03)',
                              color: isServing ? 'var(--primary)' : 'var(--foreground-muted)',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              border: `1px solid ${isServing ? 'rgba(var(--primary-rgb), 0.2)' : 'var(--surface-border)'}`
                            }}>
                              {isServing ? 'SEDANG DICUKUR' : 'MENUNGGU'}
                            </span>
                          </div>
                          <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginTop: '0.4rem' }}>
                            {q.customerName} {q.bookingId === null && <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>(Walk-In)</span>}
                          </h4>
                          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                            Layanan: {q.serviceTitle} &bull; Estimasi: {q.durationMins} Menit
                          </p>
                        </div>

                        {/* Controls */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {isServing ? (
                            <button 
                              onClick={() => handleCompleteServing(q.id)}
                              className="btn btn-primary" 
                              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', backgroundColor: 'var(--success)', color: '#fff' }}
                            >
                              Selesai Cukur
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={() => handleSkipQueue(q.id)}
                                className="btn btn-secondary btn-danger" 
                                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                              >
                                Lewati
                              </button>
                              <button 
                                onClick={() => handleStartServing(q.id)}
                                className="btn btn-primary" 
                                style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
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

            {/* Right side: Add walk-in */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: '#fff' }}>
                Tambah Antrian Walk-In (Langsung)
              </h3>
              <div className="glass" style={{ padding: '2.5rem', borderRadius: '1rem' }}>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                  Formulir ini digunakan apabila ada pelanggan datang langsung ke studio cukur tanpa memesan online.
                </p>

                <form onSubmit={handleAddWalkIn}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label htmlFor="walkInName" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Nama Pelanggan Walk-In *</label>
                    <input type="text" id="walkInName" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} placeholder="Contoh: Budi" required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.375rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.95rem', outline: 'none' }} />
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label htmlFor="walkInService" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>Layanan Cukur *</label>
                    <select id="walkInService" value={walkInServiceId} onChange={(e) => setWalkInServiceId(e.target.value)} required style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.375rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.95rem', outline: 'none' }}>
                      <option value="" disabled>-- Pilih Layanan --</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.title} (Rp {s.price.toLocaleString('id-ID')})</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}>
                    Masukkan ke Antrian Harian
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: LAPORAN KEUANGAN */}
        {activeTab === 'finance' && (
          <div className="animate-slide-up">
            
            {/* Filter Date & Export Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              marginBottom: '2.5rem',
              padding: '1.5rem 2rem',
              borderRadius: '1rem',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--surface-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>Dari Tanggal</label>
                  <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.9rem' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>Sampai Tanggal</label>
                  <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.25rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.9rem' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={handleExportExcel} className="btn btn-secondary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
                  Ekspor Ke Excel (CSV)
                </button>
                <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
                  Cetak PDF Laporan
                </button>
              </div>
            </div>

            {/* Metrics cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
              <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid var(--surface-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>TOTAL PENDAPATAN</span>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.5rem' }}>
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>Pendapatan lunas terverifikasi</p>
              </div>
              <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid var(--surface-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>TRANSAKSI SELESAI</span>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
                  {completedBookings.length} Kepala
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>Pelanggan selesai dicukur</p>
              </div>
              <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', border: '1px solid var(--surface-border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', fontWeight: 700 }}>RATA-RATA / KEPALA</span>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
                  Rp {avgTicketSize.toLocaleString('id-ID')}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>Pengeluaran rata-rata pelanggan</p>
              </div>
            </div>

            {/* SVG Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
              {/* Daily revenue bar chart */}
              <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem' }}>Tren Pendapatan Harian (7 Hari Terakhir)</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {dailyStats.map((item, idx) => {
                    const pct = (item.value / maxDailyVal) * 100;
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ width: '50px', fontSize: '0.85rem', color: 'var(--foreground-muted)', textAlign: 'right' }}>{item.label}</span>
                        <div style={{ flex: 1, height: '20px', backgroundColor: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-hover) 0%, var(--primary) 100%)', borderRadius: '4px' }}></div>
                        </div>
                        <span style={{ width: '90px', fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Rp {item.value.toLocaleString('id-ID')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Service contribution donut bar list */}
              <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 800, marginBottom: '2rem' }}>Layanan Terlaris & Distribusi Omzet</h4>
                {serviceStats.length === 0 ? (
                  <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '3rem 0' }}>Tidak ada data penjualan untuk periode ini.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {serviceStats.map((stat, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong style={{ color: '#fff' }}>{stat.title}</strong>
                          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{stat.count}x cukur ({Math.round((stat.revenue / totalRevenue) * 100)}%)</span>
                        </div>
                        <div style={{ height: '6px', backgroundColor: 'var(--surface-hover)', borderRadius: '10px', overflow: 'hidden' }}>
                          <div style={{ width: `${(stat.revenue / totalRevenue) * 100}%`, height: '100%', backgroundColor: 'var(--success)', borderRadius: '10px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Kontribusi: Rp {stat.revenue.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Complete Transaction log table */}
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '1rem' }}>
              <h4 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.5rem' }}>Riwayat Transaksi Selesai & Lunas</h4>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--foreground-muted)' }}>
                      <th style={{ padding: '1rem' }}>ID Transaksi</th>
                      <th style={{ padding: '1rem' }}>Tanggal</th>
                      <th style={{ padding: '1rem' }}>Pelanggan</th>
                      <th style={{ padding: '1rem' }}>Layanan</th>
                      <th style={{ padding: '1rem' }}>Harga</th>
                      <th style={{ padding: '1rem' }}>Metode / Ref ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedBookings.map((b) => {
                      const service = services.find(s => s.id === b.serviceId);
                      return (
                        <tr key={b.id} style={{ borderBottom: '1px solid var(--surface-border)' }} className="table-row-hover">
                          <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 600 }}>{b.id}</td>
                          <td style={{ padding: '1rem', color: '#fff' }}>{b.bookingDate}</td>
                          <td style={{ padding: '1rem', color: '#fff', fontWeight: 600 }}>{b.customerName}</td>
                          <td style={{ padding: '1rem', color: 'var(--foreground-muted)' }}>{service?.title}</td>
                          <td style={{ padding: '1rem', color: '#fff', fontWeight: 700 }}>Rp {service ? service.price.toLocaleString('id-ID') : 0}</td>
                          <td style={{ padding: '1rem', color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>
                            <strong>{b.paymentSender}</strong> &bull; {b.paymentReference}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: KELOLA LAYANAN */}
        {activeTab === 'services' && (
          <div className="animate-slide-up">
            <ServicesManager services={services} onRefresh={refreshData} />
          </div>
        )}

        {/* TAB 5: PENGATURAN TOKO */}
        {activeTab === 'settings' && (
          <div className="animate-slide-up">
            <SettingsManager settings={shopSettings} onRefresh={refreshData} />
          </div>
        )}

      </div>
    </div>
  );
}
