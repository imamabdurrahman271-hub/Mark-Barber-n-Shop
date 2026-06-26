"use client";

import React, { useState, useEffect } from 'react';
import { getQueue, subscribeToQueue, QueueItem, SOLO_STAFF } from '@/lib/db';

export default function QueueDesktop() {
  const [queueList, setQueueList] = useState<QueueItem[]>([]);
  
  const fetchQueueData = () => {
    setQueueList(getQueue());
  };

  useEffect(() => {
    fetchQueueData();
    const unsubscribe = subscribeToQueue(() => {
      fetchQueueData();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const servingItem = queueList.find(item => item.status === 'serving');
  const waitingItems = queueList.filter(item => item.status === 'waiting');
  
  const nextItem = waitingItems[0] || null;
  const subsequentItems = waitingItems.slice(1);

  const calculateTotalWaitTime = () => {
    return waitingItems.reduce((acc, curr) => acc + curr.durationMins, 0);
  };

  return (
    <div style={{
      minHeight: '90vh',
      background: 'radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.05) 0%, transparent 60%)',
      paddingBottom: '5rem'
    }} className="animate-fade-in">
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        
        {/* TV Header Title */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '3rem',
          borderBottom: '1px solid var(--surface-border)',
          paddingBottom: '1.5rem'
        }}>
          <div>
            <h1 className="gold-gradient-text" style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
              Papan Antrian Utama
            </h1>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Mark Barber n Shop &bull; Layanan Cukur Personal 1-on-1 bersama <strong>Bang Arif</strong>
            </p>
          </div>
          
          {/* Live Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.5rem 1.25rem',
            borderRadius: '50px',
            background: 'rgba(16, 185, 129, 0.05)'
          }}>
            <span style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#10b981',
              borderRadius: '50%',
              display: 'inline-block',
              boxShadow: '0 0 10px #10b981',
              animation: 'fadeIn 0.8s infinite alternate'
            }}></span>
            <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
              TV Monitor Active
            </span>
          </div>
        </div>

        {queueList.length === 0 ? (
          <div className="glass animate-slide-up" style={{
            textAlign: 'center',
            padding: '5rem 2rem',
            borderRadius: '1.5rem',
            maxWidth: '650px',
            margin: '4rem auto 0 auto'
          }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" style={{ marginBottom: '1.5rem' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Belum Ada Antrian Hari Ini</h3>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', marginBottom: '2.5rem', maxWidth: '450px', margin: '0 auto 2.5rem auto', lineHeight: '1.6' }}>
              Barbershop siap melayani Anda! Semua nomor antrian saat ini masih kosong. Pesan jadwal secara online untuk mengantri sekarang.
            </p>
            <a href="/book" className="btn btn-primary glow-pulse" style={{ padding: '0.9rem 2.5rem', fontSize: '1rem' }}>
              Booking Online Sekarang
            </a>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.3fr',
            gap: '3rem',
            alignItems: 'start'
          }}>
            
            {/* LEFT COLUMN: ACTIVE MONITORS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* CURRENTLY SERVING */}
              <div className="glass animate-slide-up" style={{
                borderRadius: '1.5rem',
                padding: '3rem',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                boxShadow: '0 20px 40px rgba(245, 158, 11, 0.06)',
                background: 'linear-gradient(180deg, #16161a 0%, #0d0d10 100%)',
                textAlign: 'center'
              }}>
                <span style={{ 
                  color: 'var(--primary)', 
                  fontSize: '0.9rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase', 
                  letterSpacing: '2px',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  padding: '0.35rem 1rem',
                  borderRadius: '50px',
                  background: 'rgba(245,158,11,0.04)',
                  display: 'inline-block',
                  marginBottom: '1.5rem'
                }}>
                  Sedang Dilayani &bull; Serving
                </span>

                {servingItem ? (
                  <div style={{ padding: '1rem 0' }}>
                    <div style={{
                      fontSize: '9rem',
                      fontWeight: 900,
                      color: 'var(--primary)',
                      lineHeight: 0.9,
                      letterSpacing: '-4px',
                      marginBottom: '1.5rem',
                      textShadow: '0 0 30px rgba(245, 158, 11, 0.4)'
                    }}>
                      {servingItem.queueNumber}
                    </div>
                    <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                      {servingItem.customerName}
                    </h2>
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '1.1rem' }}>
                      Layanan: <strong style={{ color: '#fff' }}>{servingItem.serviceTitle}</strong>
                    </p>
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
                      Kapster: <strong style={{ color: 'var(--primary)' }}>{SOLO_STAFF.displayName} (Owner)</strong>
                    </p>

                    <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--surface-border)', paddingTop: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--foreground-muted)', marginBottom: '0.75rem' }}>
                        <span>Progress Layanan</span>
                        <span>Estimasi: {servingItem.durationMins} Menit</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--surface-border)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: '45%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '10px', boxShadow: '0 0 15px var(--primary)', animation: 'pulse-glow 2s infinite' }}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '4rem 0', color: 'var(--foreground-muted)' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '1rem', opacity: 0.4 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Kursi Cukur Kosong</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Menunggu panggilan antrian berikutnya oleh kapster.</p>
                  </div>
                )}
              </div>

              {/* STATS SUMMARY WIDGET */}
              <div className="glass" style={{
                borderRadius: '1rem',
                padding: '1.5rem 2rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--surface)'
              }}>
                <div style={{ borderRight: '1px solid var(--surface-border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Sisa Mengantri</span>
                  <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
                    {waitingItems.length} Orang
                  </h4>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Estimasi Waktu Tunggu</span>
                  <h4 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
                    &plusmn; {calculateTotalWaitTime()} Menit
                  </h4>
                </div>
              </div>
              
            </div>

            {/* RIGHT COLUMN: COMPLETE WAITING BOARD */}
            <div className="glass animate-slide-up" style={{
              borderRadius: '1.5rem',
              padding: '2.5rem',
              minHeight: '500px',
              border: '1px solid var(--surface-border)'
            }}>
              
              <h3 style={{ 
                fontSize: '1.35rem', 
                fontWeight: 800, 
                color: '#fff', 
                marginBottom: '2rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                borderBottom: '1px solid var(--surface-border)',
                paddingBottom: '1rem'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                Papan Antrian Hari Ini
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                {/* Active Serving row in list */}
                {servingItem && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '0.75rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.06)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.05)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
                        {servingItem.queueNumber}
                      </span>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                          {servingItem.customerName}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>
                          {servingItem.serviceTitle} &bull; {servingItem.durationMins} Menit
                        </p>
                      </div>
                    </div>
                    
                    <span style={{
                      padding: '0.35rem 0.85rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--primary)',
                      color: '#000',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.5px'
                    }}>
                      SEDANG CUKUR
                    </span>
                  </div>
                )}

                {/* Waiting rows */}
                {waitingItems.length > 0 ? (
                  waitingItems.map((item, index) => {
                    const isNext = index === 0;
                    return (
                      <div 
                        key={item.id} 
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '1.25rem 1.5rem',
                          borderRadius: '0.75rem',
                          backgroundColor: 'var(--surface)',
                          border: `1px solid ${isNext ? 'rgba(255,255,255,0.15)' : 'var(--surface-border)'}`
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <span style={{ fontSize: '1.75rem', fontWeight: 800, color: isNext ? '#fff' : 'var(--foreground-muted)', width: '3.5rem' }}>
                            {item.queueNumber}
                          </span>
                          <div>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                              {item.customerName}
                            </h4>
                            <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>
                              {item.serviceTitle} &bull; {item.durationMins} Menit
                            </p>
                          </div>
                        </div>
                        
                        <span style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '4px',
                          backgroundColor: isNext ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                          color: isNext ? '#fff' : 'var(--foreground-muted)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: `1px solid ${isNext ? 'rgba(255,255,255,0.2)' : 'var(--surface-border)'}`
                        }}>
                          {isNext ? 'SIAP-SIAP (NEXT)' : 'MENUNGGU'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  !servingItem && (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--foreground-muted)' }}>
                      Belum ada antrian terdaftar hari ini.
                    </div>
                  )
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
