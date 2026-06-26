"use client";

import React, { useState, useEffect } from 'react';
import { getQueue, subscribeToQueue, QueueItem } from '@/lib/db';

export default function QueuePage() {
  const [queueList, setQueueList] = useState<QueueItem[]>([]);
  
  const fetchQueueData = () => {
    setQueueList(getQueue());
  };

  useEffect(() => {
    // Ambil data antrian pertama kali
    fetchQueueData();

    // Berlangganan perubahan antrian secara live-time (realtime simulation)
    const unsubscribe = subscribeToQueue(() => {
      fetchQueueData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter antrian berdasarkan status
  const servingItem = queueList.find(item => item.status === 'serving');
  const waitingItems = queueList.filter(item => item.status === 'waiting');
  const completedItems = queueList.filter(item => item.status === 'completed');
  
  // Antrian berikutnya (indeks pertama dari waitingItems)
  const nextItem = waitingItems[0] || null;
  // Sisa antrian dalam daftar tunggu (setelah yang berikutnya)
  const subsequentItems = waitingItems.slice(1);

  // Hitung total estimasi waktu tunggu untuk yang sedang mengantri (selain yang sedang dilayani)
  const calculateTotalWaitTime = () => {
    return waitingItems.reduce((acc, curr) => acc + curr.durationMins, 0);
  };

  return (
    <div style={{
      minHeight: '80vh',
      background: 'radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)',
      paddingBottom: '5rem'
    }}>
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        
        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }} className="animate-fade-in">
          <span style={{
            color: 'var(--success)',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.25rem 0.75rem',
            borderRadius: '50px',
            background: 'rgba(16, 185, 129, 0.05)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'inline-block',
              boxShadow: '0 0 8px #10b981'
            }}></span>
            Live Connection Active
          </span>
          
          <h1 className="gold-gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>
            Monitor Antrian Live-Time
          </h1>
          <p style={{ color: 'var(--foreground-muted)', marginTop: '0.5rem', fontSize: '1rem', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Halaman ini ter-update secara otomatis begitu kapster selesai memotong rambut pelanggan.
          </p>
        </div>

        {queueList.length === 0 ? (
          /* Empty Queue State */
          <div className="glass animate-slide-up" style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            borderRadius: '1.5rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" style={{ marginBottom: '1.5rem' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Belum Ada Antrian Hari Ini</h3>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem auto', lineHeight: '1.5' }}>
              Semua slot antrian saat ini masih kosong. Silakan lakukan pemesanan online untuk mengantri hari ini!
            </p>
            <a href="/book" className="btn btn-primary glow-pulse" style={{ padding: '0.75rem 2rem' }}>
              Booking Sekarang
            </a>
          </div>
        ) : (
          /* Active Queue Dashboard */
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '2.5rem'
          }}>
            
            {/* Grid 1: Active Serving & Next Up */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              
              {/* CURRENTLY SERVING (SEDANG DILAYANI) */}
              <div className="glass animate-slide-up" style={{
                borderRadius: '1.5rem',
                padding: '2.5rem',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                boxShadow: '0 15px 30px rgba(245, 158, 11, 0.04)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'linear-gradient(180deg, rgba(24, 24, 28, 0.9) 0%, rgba(18, 18, 21, 0.9) 100%)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                      Sedang Dilayani
                    </span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '50px',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      color: 'var(--primary)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      border: '1px solid rgba(245, 158, 11, 0.2)',
                      animation: 'pulse-glow 2s infinite'
                    }}>
                      ACTIVE
                    </span>
                  </div>

                  {servingItem ? (
                    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                      <div style={{
                        fontSize: '6rem',
                        fontWeight: 900,
                        color: 'var(--primary)',
                        lineHeight: 1,
                        letterSpacing: '-2px',
                        marginBottom: '1rem',
                        textShadow: '0 0 20px rgba(245, 158, 11, 0.3)'
                      }}>
                        {servingItem.queueNumber}
                      </div>
                      <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {servingItem.customerName}
                      </h3>
                      <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
                        Layanan: <strong style={{ color: '#fff' }}>{servingItem.serviceTitle}</strong>
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', margin: '3rem 0', color: 'var(--foreground-muted)' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      <p style={{ fontSize: '0.95rem' }}>Tidak ada antrian yang sedang dilayani saat ini.</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Admin belum memanggil nomor berikutnya.</p>
                    </div>
                  )}
                </div>

                {/* Progress bar animation if serving */}
                {servingItem && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
                      <span>Estimasi Layanan</span>
                      <span>{servingItem.durationMins} Menit</span>
                    </div>
                    {/* Animated glowing bar */}
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: 'var(--surface-border)',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: '45%', // Simulasi progress berjalan
                        height: '100%',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '10px',
                        boxShadow: '0 0 10px var(--primary)',
                        animation: 'pulse-glow 2s infinite'
                      }}></div>
                    </div>
                  </div>
                )}
              </div>

              {/* NEXT IN LINE (ANTRIAN BERIKUTNYA) */}
              <div className="glass animate-slide-up" style={{
                borderRadius: '1.5rem',
                padding: '2.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'linear-gradient(180deg, rgba(24, 24, 28, 0.7) 0%, rgba(18, 18, 21, 0.7) 100%)'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ color: 'var(--foreground-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                      Antrian Berikutnya
                    </span>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '50px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--foreground-muted)',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      border: '1px solid var(--surface-border)'
                    }}>
                      NEXT UP
                    </span>
                  </div>

                  {nextItem ? (
                    <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                      <div style={{
                        fontSize: '5rem',
                        fontWeight: 800,
                        color: 'var(--foreground)',
                        lineHeight: 1,
                        marginBottom: '1rem'
                      }}>
                        {nextItem.queueNumber}
                      </div>
                      <h3 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {nextItem.customerName}
                      </h3>
                      <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>
                        Layanan: <strong style={{ color: 'var(--foreground)' }}>{nextItem.serviceTitle}</strong>
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', margin: '3rem 0', color: 'var(--foreground-muted)' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.5 }}><circle cx="12" cy="12" r="10"></circle><path d="M8 12h8"></path></svg>
                      <p style={{ fontSize: '0.95rem' }}>Daftar tunggu kosong.</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Tidak ada antrian berikutnya.</p>
                    </div>
                  )}
                </div>

                {/* Queue Summary */}
                <div style={{
                  marginTop: '1.5rem',
                  borderTop: '1px solid var(--surface-border)',
                  paddingTop: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Sisa Antrian</span>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '0.25rem' }}>
                      {waitingItems.length} Orang
                    </h4>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Estimasi Tunggu</span>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
                      &plusmn; {calculateTotalWaitTime()} Menit
                    </h4>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Grid 2: Waiting List Table */}
            <div className="glass animate-slide-up" style={{
              borderRadius: '1.5rem',
              padding: '2rem',
              overflow: 'hidden'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Daftar Tunggu Antrian Hari Ini
              </h3>

              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.95rem',
                  textAlign: 'left'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <th style={{ padding: '1rem', color: 'var(--foreground-muted)', fontWeight: 600 }}>No. Antrian</th>
                      <th style={{ padding: '1rem', color: 'var(--foreground-muted)', fontWeight: 600 }}>Nama Pelanggan</th>
                      <th style={{ padding: '1rem', color: 'var(--foreground-muted)', fontWeight: 600 }}>Layanan</th>
                      <th style={{ padding: '1rem', color: 'var(--foreground-muted)', fontWeight: 600 }}>Durasi</th>
                      <th style={{ padding: '1rem', color: 'var(--foreground-muted)', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render yang sedang dilayani terlebih dahulu jika ada */}
                    {servingItem && (
                      <tr style={{ 
                        borderBottom: '1px solid var(--surface-border)', 
                        backgroundColor: 'rgba(245, 158, 11, 0.03)',
                      }}>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {servingItem.queueNumber}
                        </td>
                        <td style={{ padding: '1.25rem 1rem', fontWeight: 600, color: '#fff' }}>
                          {servingItem.customerName}
                        </td>
                        <td style={{ padding: '1.25rem 1rem', color: 'var(--foreground-muted)' }}>
                          {servingItem.serviceTitle}
                        </td>
                        <td style={{ padding: '1.25rem 1rem', color: 'var(--foreground-muted)' }}>
                          {servingItem.durationMins} Mins
                        </td>
                        <td style={{ padding: '1.25rem 1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            color: 'var(--primary)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: '1px solid rgba(245, 158, 11, 0.2)'
                          }}>
                            Sedang Cukur
                          </span>
                        </td>
                      </tr>
                    )}
                    
                    {/* Render daftar tunggu sisanya */}
                    {waitingItems.length > 0 ? (
                      waitingItems.map((item) => (
                        <tr key={item.id} style={{ 
                          borderBottom: '1px solid var(--surface-border)',
                          transition: 'background-color 0.2s'
                        }}
                        className="table-row-hover"
                        >
                          <td style={{ padding: '1.25rem 1rem', fontWeight: 700, color: '#fff' }}>
                            {item.queueNumber}
                          </td>
                          <td style={{ padding: '1.25rem 1rem', fontWeight: 500, color: '#fff' }}>
                            {item.customerName}
                          </td>
                          <td style={{ padding: '1.25rem 1rem', color: 'var(--foreground-muted)' }}>
                            {item.serviceTitle}
                          </td>
                          <td style={{ padding: '1.25rem 1rem', color: 'var(--foreground-muted)' }}>
                            {item.durationMins} Mins
                          </td>
                          <td style={{ padding: '1.25rem 1rem' }}>
                            <span style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              color: 'var(--foreground-muted)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              border: '1px solid var(--surface-border)'
                            }}>
                              Menunggu
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      !servingItem && (
                        <tr>
                          <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--foreground-muted)' }}>
                            Tidak ada pelanggan mengantri.
                          </td>
                        </tr>
                      )
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
