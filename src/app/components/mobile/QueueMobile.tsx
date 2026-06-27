"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getQueue, subscribeToQueue, QueueItem } from '@/lib/db';

export default function QueueMobile() {
  const [queueList, setQueueList] = useState<QueueItem[]>([]);
  
  const fetchQueueData = () => {
    getQueue().then(setQueueList);
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
      background: 'radial-gradient(circle at 50% 0%, rgba(235, 220, 185, 0.08) 0%, transparent 75%), #050505',
      padding: '2rem 1rem 8rem 1rem'
    }} className="animate-fade-in">
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{
          color: '#ebdcb9',
          fontSize: '0.7rem',
          fontWeight: 600,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.75rem',
          border: '1px solid rgba(235, 220, 185, 0.2)',
          padding: '0.25rem 0.75rem',
          borderRadius: '50px',
          background: 'rgba(235, 220, 185, 0.03)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)'
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            display: 'inline-block',
            boxShadow: '0 0 8px #10b981',
            animation: 'pulse-glow 2s infinite'
          }}></span>
          Live Monitor Active
        </span>
        <h1 className="gold-gradient-text" style={{ 
          fontSize: '1.85rem', 
          fontWeight: 800, 
          letterSpacing: '-0.5px', 
          color: '#fff',
          marginTop: '0.25rem'
        }}>
          Antrian Hari Ini
        </h1>
        <p style={{ color: '#a49e8f', fontSize: '0.8rem', marginTop: '0.25rem', letterSpacing: '0.5px' }}>
          Pantau status antrian Anda secara real-time
        </p>
      </div>

      {queueList.length === 0 ? (
        <div className="glass" style={{
          textAlign: 'center',
          padding: '3.5rem 2rem',
          borderRadius: '1.25rem',
          border: '1px solid rgba(235, 220, 185, 0.12)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)',
          background: 'linear-gradient(180deg, rgba(18, 18, 22, 0.8) 0%, rgba(12, 12, 14, 0.8) 100%)',
          marginTop: '2rem'
        }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            background: 'rgba(235, 220, 185, 0.04)',
            border: '1px solid rgba(235, 220, 185, 0.15)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ebdcb9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(235,220,185,0.2))' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.5px' }}>
            Belum Ada Antrian
          </h3>
          <p style={{ color: '#a49e8f', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: '1.5' }}>
            Semua slot antrian saat ini masih kosong. Silakan lakukan reservasi sekarang untuk mengamankan nomor antrian Anda.
          </p>
          <a href="/book" className="btn" style={{
            width: '100%',
            padding: '1rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f4ebd0 0%, #ebdcb9 100%)',
            color: '#050505',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 20px rgba(235, 220, 185, 0.25)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            display: 'inline-block',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            Booking Sekarang
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* SERVING NOW CARD */}
          <div className="glass" style={{
            borderRadius: '1.25rem',
            padding: '1.75rem',
            border: '1px solid rgba(235, 220, 185, 0.18)',
            background: 'linear-gradient(180deg, rgba(18, 18, 22, 0.9) 0%, rgba(12, 12, 14, 0.9) 100%)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ 
                color: '#ebdcb9', 
                fontSize: '0.7rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                letterSpacing: '1.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                Sedang Dicukur
              </span>
              <span style={{ fontSize: '1.2rem' }}>✂️</span>
            </div>
            
            {servingItem ? (
              <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                <div style={{
                  fontSize: '5rem',
                  fontWeight: 900,
                  background: 'linear-gradient(135deg, #fff 20%, #ebdcb9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.1,
                  marginBottom: '0.5rem',
                  letterSpacing: '-2px',
                  filter: 'drop-shadow(0 4px 12px rgba(235, 220, 185, 0.25))'
                }}>
                  {servingItem.queueNumber}
                </div>
                <h3 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: 700, letterSpacing: '0.25px' }}>
                  {servingItem.customerName}
                </h3>
                <p style={{ color: '#a49e8f', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                  Layanan: <span style={{ color: '#fff', fontWeight: 600 }}>{servingItem.serviceTitle}</span>
                </p>

                <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(235, 220, 185, 0.1)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#a49e8f', marginBottom: '0.5rem' }}>
                    <span>Progress Cukur</span>
                    <span style={{ color: '#ebdcb9', fontWeight: 600 }}>{servingItem.durationMins} Menit</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: '45%', 
                      height: '100%', 
                      background: 'linear-gradient(90deg, #ebdcb9 0%, #d4a359 100%)', 
                      borderRadius: '10px',
                      boxShadow: '0 0 8px rgba(235,220,185,0.5)'
                    }}></div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#a49e8f' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#fff' }}>Tidak ada yang sedang dicukur</p>
                <span style={{ fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>Menunggu panggilan antrian berikutnya.</span>
              </div>
            )}
          </div>

          {/* WAITING SUMMARY WIDGET */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem'
          }}>
            <div style={{
              backgroundColor: 'rgba(18, 18, 22, 0.5)',
              border: '1px solid rgba(235, 220, 185, 0.1)',
              padding: '1.1rem 0.75rem',
              borderRadius: '1rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontSize: '0.7rem', color: '#a49e8f', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Mengantri</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
                {waitingItems.length} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#a49e8f' }}>Orang</span>
              </h4>
            </div>
            <div style={{
              backgroundColor: 'rgba(18, 18, 22, 0.5)',
              border: '1px solid rgba(235, 220, 185, 0.1)',
              padding: '1.1rem 0.75rem',
              borderRadius: '1rem',
              textAlign: 'center',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}>
              <span style={{ fontSize: '0.7rem', color: '#a49e8f', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Estimasi Tunggu</span>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ebdcb9', marginTop: '0.25rem', filter: 'drop-shadow(0 0 4px rgba(235,220,185,0.2))' }}>
                &plusmn; {calculateTotalWaitTime()} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#a49e8f' }}>Min</span>
              </h4>
            </div>
          </div>

          {/* LIST OF WAITING CUSTOMERS */}
          <div style={{ marginTop: '0.5rem' }}>
            <h3 style={{ 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: '#ebdcb9', 
              marginBottom: '1rem', 
              textTransform: 'uppercase', 
              letterSpacing: '1.5px',
              borderBottom: '1px solid rgba(235, 220, 185, 0.1)',
              paddingBottom: '0.5rem'
            }}>
              Daftar Antrian Hari Ini
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {queueList.map((item) => {
                const isServing = item.status === 'serving';
                return (
                  <div 
                    key={item.id} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 1.25rem',
                      borderRadius: '0.85rem',
                      backgroundColor: isServing ? 'rgba(235, 220, 185, 0.05)' : 'rgba(18, 18, 22, 0.4)',
                      border: `1px solid ${isServing ? 'rgba(235, 220, 185, 0.25)' : 'rgba(235, 220, 185, 0.08)'}`,
                      boxShadow: isServing ? '0 0 15px rgba(235, 220, 185, 0.08)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        color: isServing ? '#ebdcb9' : '#fff',
                        width: '2.2rem',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '0.375rem',
                        padding: '0.2rem 0'
                      }}>
                        {item.queueNumber}
                      </span>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                          {item.customerName}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#a49e8f', display: 'block', marginTop: '0.15rem' }}>
                          {item.serviceTitle}
                        </span>
                      </div>
                    </div>
                    
                    <span style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '50px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      backgroundColor: isServing ? 'rgba(235,220,185,0.12)' : 'rgba(255,255,255,0.03)',
                      color: isServing ? '#ebdcb9' : '#a49e8f',
                      border: `1px solid ${isServing ? 'rgba(235,220,185,0.2)' : 'rgba(255,255,255,0.05)'}`
                    }}>
                      {isServing ? 'Dicukur' : 'Menunggu'}
                    </span>
                  </div>
                );
              })}
            </div>
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
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#a49e8f', transition: 'color 0.2s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.5px' }}>Home</span>
        </Link>
        <Link href="/book" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#a49e8f', transition: 'color 0.2s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.5px' }}>Booking</span>
        </Link>
        <Link href="/queue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#ebdcb9', transition: 'color 0.2s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(235,220,185,0.4))' }}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', color: '#ebdcb9' }}>Antrian</span>
        </Link>
      </div>
    </div>
  );
}
