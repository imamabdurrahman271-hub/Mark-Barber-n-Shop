"use client";

import React, { useState, useEffect } from 'react';
import { getQueue, subscribeToQueue, QueueItem } from '@/lib/db';

export default function QueueMobile() {
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
  
  const calculateTotalWaitTime = () => {
    return waitingItems.reduce((acc, curr) => acc + curr.durationMins, 0);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)',
      padding: '2rem 1rem 7rem 1rem'
    }} className="animate-fade-in">
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span style={{
          color: 'var(--success)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.5rem',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          padding: '0.2rem 0.6rem',
          borderRadius: '50px',
          background: 'rgba(16, 185, 129, 0.03)'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'inline-block',
            boxShadow: '0 0 6px #10b981'
          }}></span>
          Live Connection Active
        </span>
        <h1 className="gold-gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
          Antrian Mark Barber
        </h1>
      </div>

      {queueList.length === 0 ? (
        <div className="glass" style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          borderRadius: '1rem',
          marginTop: '2rem'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" style={{ marginBottom: '1rem' }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Belum Ada Antrian</h3>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.8rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>
            Semua slot antrian saat ini masih kosong. Silakan booking untuk mengamankan nomor antrian Anda.
          </p>
          <a href="/book" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem', width: '100%' }}>
            Booking Sekarang
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* SERVING NOW CARD */}
          <div className="glass" style={{
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            background: 'linear-gradient(180deg, rgba(24, 24, 28, 0.9) 0%, rgba(18, 18, 21, 0.9) 100%)'
          }}>
            <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Sedang Dicukur ✂️
            </span>
            
            {servingItem ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{
                  fontSize: '4.5rem',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  lineHeight: 1,
                  marginBottom: '0.5rem',
                  textShadow: '0 0 15px rgba(245, 158, 11, 0.25)'
                }}>
                  {servingItem.queueNumber}
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700 }}>
                  {servingItem.customerName}
                </h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                  Layanan: <strong style={{ color: '#fff' }}>{servingItem.serviceTitle}</strong>
                </p>

                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: '0.4rem' }}>
                    <span>Progress Cukur</span>
                    <span>{servingItem.durationMins} Menit</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--surface-border)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: '45%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '10px', animation: 'pulse-glow 2s infinite' }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--foreground-muted)' }}>
                <p style={{ fontSize: '0.85rem' }}>Tidak ada yang sedang dicukur.</p>
                <span style={{ fontSize: '0.75rem' }}>Menunggu panggilan antrian berikutnya.</span>
              </div>
            )}
          </div>

          {/* WAITING SUMMARY WIDGET */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            padding: '1rem',
            borderRadius: '0.75rem',
            textAlign: 'center'
          }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>Mengantri</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '0.15rem' }}>{waitingItems.length} Orang</h4>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)' }}>Estimasi Tunggu</span>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.15rem' }}>&plusmn; {calculateTotalWaitTime()} Min</h4>
            </div>
          </div>

          {/* LIST OF WAITING CUSTOMERS */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Daftar Antrian Hari Ini
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {queueList.map((item) => {
                const isServing = item.status === 'serving';
                return (
                  <div 
                    key={item.id} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.5rem',
                      backgroundColor: isServing ? 'rgba(245, 158, 11, 0.05)' : 'var(--surface)',
                      border: `1px solid ${isServing ? 'rgba(245,158,11,0.2)' : 'var(--surface-border)'}`
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        color: isServing ? 'var(--primary)' : '#fff',
                        width: '2rem'
                      }}>
                        {item.queueNumber}
                      </span>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{item.customerName}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>{item.serviceTitle}</span>
                      </div>
                    </div>
                    
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: isServing ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
                      color: isServing ? 'var(--primary)' : 'var(--foreground-muted)',
                      border: `1px solid ${isServing ? 'rgba(245,158,11,0.2)' : 'var(--surface-border)'}`
                    }}>
                      {isServing ? 'Cukur' : 'Menunggu'}
                    </span>
                  </div>
                );
              })}
            </div>
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
        <a href="/queue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Antrian</span>
        </a>
        <a href="/admin" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--foreground-muted)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          <span style={{ fontSize: '0.65rem' }}>Admin</span>
        </a>
      </div>
    </div>
  );
}
