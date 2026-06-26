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

export default function AdminMobile() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'queue' | 'finance' | 'services' | 'settings'>('bookings');
  
  // Data State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    id: 'default',
    operatingHours: ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"],
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
      alert("Pelanggan walk-in berhasil ditambahkan!");
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
    <div style={{
      padding: '1.5rem 1rem 7rem 1rem',
      minHeight: '100vh',
      backgroundColor: 'var(--background)'
    }} className="animate-fade-in">
      
      {/* Mobile Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="gold-gradient-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            Dasbor Admin
          </h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>
            Owner: Bang Arif
          </span>
        </div>
        <button 
          onClick={handleLogout}
          className="btn btn-secondary" 
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid var(--error)', color: 'var(--error)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Keluar
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="glass" style={{
        display: 'flex',
        borderRadius: '0.5rem',
        padding: '0.25rem',
        marginBottom: '1.5rem',
        border: '1px solid var(--surface-border)',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        gap: '0.25rem',
        scrollbarWidth: 'none', // Hide scrollbar in Firefox
        msOverflowStyle: 'none'  // Hide scrollbar in IE/Edge
      }}>
        {/* Style tag to hide scrollbars for Chrome/Safari */}
        <style dangerouslySetInnerHTML={{__html: `
          div::-webkit-scrollbar {
            display: none;
          }
        `}} />
        {[
          { id: 'bookings', label: `Booking (${pendingBookings.length})` },
          { id: 'queue', label: `Antrian (${activeQueues.length})` },
          { id: 'finance', label: 'Keuangan' },
          { id: 'services', label: 'Layanan' },
          { id: 'settings', label: 'Pengaturan' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flexShrink: 0,
              padding: '0.6rem 1.25rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '0.375rem',
              border: 'none',
              backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? '#000' : 'var(--foreground-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BOOKING APPROVALS */}
      {activeTab === 'bookings' && (
        <div className="animate-slide-up">
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.8rem', marginBottom: '1.25rem', lineHeight: '1.4' }}>
            Konfirmasi pembayaran transfer manual dari pelanggan. Cocokkan bukti transfer sebelum menyetujui.
          </p>

          {pendingBookings.length === 0 ? (
            <div className="glass" style={{ textAlign: 'center', padding: '3rem 1rem', borderRadius: '0.75rem', color: 'var(--foreground-muted)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '0.75rem', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
              <p style={{ fontSize: '0.85rem' }}>Tidak ada booking menunggu persetujuan.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingBookings.map((b) => {
                const service = services.find(s => s.id === b.serviceId);
                const cleanPhone = b.customerPhone.replace(/^0/, '62');
                const waUrl = `https://wa.me/${cleanPhone}?text=Halo%20${encodeURIComponent(b.customerName)},%20booking%20barbershop%20Anda%20pada%20tanggal%20${b.bookingDate}%20jam%20${b.bookingTime}%20WIB%20telah%20kami%20verifikasi.%20Silakan%20datang%20tepat%20waktu!`;

                return (
                  <div key={b.id} className="glass" style={{
                    padding: '1.25rem',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--surface-border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700 }}>{b.customerName}</h4>
                        <a href={waUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
                          WhatsApp: {b.customerPhone}
                        </a>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700 }}>
                        {b.bookingTime} WIB
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1rem' }}>
                      <div>Layanan: <strong style={{ color: '#fff' }}>{service?.title}</strong></div>
                      <div>Total Bayar: <strong style={{ color: 'var(--primary)' }}>Rp {service?.price.toLocaleString('id-ID')}</strong></div>
                      <div>Pengirim: <strong style={{ color: '#fff' }}>{b.paymentSender}</strong></div>
                      <div>Ref ID: <strong style={{ color: 'var(--success)' }}>{b.paymentReference}</strong></div>
                      <div>Tanggal Cukur: <strong style={{ color: '#fff' }}>{b.bookingDate}</strong></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '0.5rem' }}>
                      <button onClick={() => handleCancelBooking(b.id)} className="btn btn-secondary btn-danger" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
                        Tolak
                      </button>
                      <button onClick={() => handleApproveBooking(b.id)} className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
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

      {/* TAB 2: QUEUE CONTROL */}
      {activeTab === 'queue' && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Active Queue List */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>
              Daftar Antrian Aktif
            </h3>

            {activeQueues.length === 0 ? (
              <div className="glass" style={{ textAlign: 'center', padding: '3rem 1rem', borderRadius: '0.75rem', color: 'var(--foreground-muted)' }}>
                <p style={{ fontSize: '0.85rem' }}>Tidak ada antrian aktif saat ini.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeQueues.map((q) => {
                  const isServing = q.status === 'serving';
                  return (
                    <div key={q.id} className="glass" style={{
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      border: `1px solid ${isServing ? 'var(--primary)' : 'var(--surface-border)'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: isServing ? 'rgba(245,158,11,0.03)' : 'var(--surface)'
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: isServing ? 'var(--primary)' : '#fff' }}>
                            {q.queueNumber}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: isServing ? 'var(--primary)' : 'var(--foreground-muted)', fontWeight: 700 }}>
                            {isServing ? 'DICUKUR' : 'MENUNGGU'}
                          </span>
                        </div>
                        <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, marginTop: '0.15rem' }}>
                          {q.customerName} {q.bookingId === null && <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>(Walk-in)</span>}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>
                          {q.serviceTitle}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {isServing ? (
                          <button onClick={() => handleCompleteServing(q.id)} className="btn" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'var(--success)', color: '#fff' }}>
                            Selesai
                          </button>
                        ) : (
                          <>
                            <button onClick={() => handleSkipQueue(q.id)} className="btn btn-secondary btn-danger" style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem' }}>
                              Lewati
                            </button>
                            <button onClick={() => handleStartServing(q.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}>
                              Mulai
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

          {/* Add Walk-in form */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#fff' }}>
              Input Pelanggan Walk-In
            </h3>
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
              <form onSubmit={handleAddWalkIn}>
                <div style={{ marginBottom: '1rem' }}>
                  <label htmlFor="walkInName" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>Nama Pelanggan *</label>
                  <input type="text" id="walkInName" value={walkInName} onChange={(e) => setWalkInName(e.target.value)} placeholder="Contoh: Tommy" required style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '0.25rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.85rem', outline: 'none' }} />
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label htmlFor="walkInService" style={{ display: 'block', fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.25rem' }}>Layanan Cukur *</label>
                  <select id="walkInService" value={walkInServiceId} onChange={(e) => setWalkInServiceId(e.target.value)} required style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '0.25rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.85rem', outline: 'none' }}>
                    <option value="" disabled>-- Pilih Layanan --</option>
                    {services.map(s => (
                      <option key={s.id} value={s.id}>{s.title} (Rp {s.price.toLocaleString('id-ID')})</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.65rem', fontSize: '0.85rem' }}>
                  Tambah ke Antrian
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: FINANCE REPORT */}
      {activeTab === 'finance' && (
        <div className="animate-slide-up">
          {/* Date Filter & Print triggers */}
          <div className="glass" style={{ padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--foreground-muted)', marginBottom: '0.15rem' }}>Mulai</label>
                <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '0.25rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.8rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--foreground-muted)', marginBottom: '0.15rem' }}>Sampai</label>
                <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} style={{ width: '100%', padding: '0.4rem', borderRadius: '0.25rem', backgroundColor: 'var(--surface-hover)', border: '1px solid var(--surface-border)', color: '#fff', fontSize: '0.8rem' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button onClick={handleExportExcel} className="btn btn-secondary" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
                Ekspor Excel
              </button>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.75rem' }}>
                Cetak PDF Laporan
              </button>
            </div>
          </div>

          {/* Metrics summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="glass" style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--surface-border)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>PENDAPATAN</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.15rem' }}>
                Rp {totalRevenue.toLocaleString('id-ID')}
              </h3>
            </div>
            <div className="glass" style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--surface-border)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>TRANSAKSI SELESAI</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem' }}>
                {completedBookings.length} Kepala
              </h3>
            </div>
            <div className="glass" style={{ padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--surface-border)' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>RATA-RATA / KEPALA</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginTop: '0.15rem' }}>
                Rp {avgTicketSize.toLocaleString('id-ID')}
              </h3>
            </div>
          </div>

          {/* Daily graph */}
          <div className="glass" style={{ padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Pendapatan 7 Hari Terakhir</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dailyStats.map((item, idx) => {
                const pct = (item.value / maxDailyVal) * 100;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                    <span style={{ width: '35px', color: 'var(--foreground-muted)', textAlign: 'right' }}>{item.label}</span>
                    <div style={{ flex: 1, height: '12px', backgroundColor: 'var(--surface-hover)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
                    </div>
                    <span style={{ width: '70px', fontWeight: 600, color: '#fff', textAlign: 'right' }}>Rp{item.value >= 1000 ? (item.value/1000) + 'k' : item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Popular services */}
          <div className="glass" style={{ padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Kontribusi Layanan Terlaris</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {serviceStats.map((stat, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#fff' }}>{stat.title}</strong>
                    <span style={{ color: 'var(--primary)' }}>{stat.count}x ({Math.round((stat.revenue / totalRevenue) * 100)}%)</span>
                  </div>
                  <div style={{ height: '5px', backgroundColor: 'var(--surface-hover)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${(stat.revenue / totalRevenue) * 100}%`, height: '100%', backgroundColor: 'var(--success)', borderRadius: '5px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Transaction History List */}
          <div className="glass" style={{ padding: '1.25rem', borderRadius: '0.75rem' }}>
            <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Riwayat Transaksi</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {completedBookings.map((b) => {
                const service = services.find(s => s.id === b.serviceId);
                return (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--surface-border)', fontSize: '0.8rem' }}>
                    <div>
                      <strong style={{ color: '#fff' }}>{b.customerName}</strong>
                      <div style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem', marginTop: '0.1rem' }}>{service?.title} &bull; {b.bookingDate}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong style={{ color: 'var(--primary)' }}>Rp {service?.price.toLocaleString('id-ID')}</strong>
                      <div style={{ color: 'var(--foreground-muted)', fontSize: '0.7rem' }}>{b.paymentReference}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LAYANAN */}
      {activeTab === 'services' && (
        <div className="animate-slide-up">
          <ServicesManager services={services} onRefresh={refreshData} />
        </div>
      )}

      {/* TAB 5: PENGATURAN */}
      {activeTab === 'settings' && (
        <div className="animate-slide-up">
          <SettingsManager settings={shopSettings} onRefresh={refreshData} />
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
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
        zIndex: 40,
        backdropFilter: 'blur(16px)'
      }}>
        <a href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--foreground-muted)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span style={{ fontSize: '0.65rem' }}>Home</span>
        </a>
        <a href="/book" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--foreground-muted)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span style={{ fontSize: '0.65rem' }}>Booking</span>
        </a>
        <a href="/queue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--foreground-muted)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span style={{ fontSize: '0.65rem' }}>Antrian</span>
        </a>
        <a href="/admin" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Admin</span>
        </a>
      </div>
    </div>
  );
}
