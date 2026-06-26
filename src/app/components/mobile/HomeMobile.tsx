import React from 'react';
import { SERVICES, SOLO_STAFF } from '@/lib/db';

export default function HomeMobile() {
  // Group services by category
  const categories = {
    'Haircut': SERVICES.filter(s => s.category === 'Haircut'),
    'Shaving': SERVICES.filter(s => s.category === 'Shaving'),
    'Colouring': SERVICES.filter(s => s.category === 'Colouring'),
    'Styling': SERVICES.filter(s => s.category === 'Styling'),
    'Other': SERVICES.filter(s => s.category === 'Other'),
  };

  return (
    <div style={{ paddingBottom: '6rem' }} className="animate-fade-in">
      {/* Mobile Hero Section */}
      <section style={{
        padding: '4rem 1rem 3rem 1rem',
        background: 'radial-gradient(circle at 50% 20%, rgba(var(--primary-rgb), 0.1) 0%, transparent 70%)',
        textAlign: 'center',
        borderBottom: '1px solid var(--surface-border)'
      }}>
        <span style={{
          color: 'var(--primary)',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          display: 'inline-block',
          marginBottom: '0.75rem',
          border: '1px solid rgba(var(--primary-rgb), 0.3)',
          padding: '0.2rem 0.6rem',
          borderRadius: '50px',
          background: 'rgba(var(--primary-rgb), 0.03)'
        }}>
          Solo Barbershop
        </span>
        <h1 className="gold-gradient-text" style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          lineHeight: '1.2',
          marginBottom: '1rem',
        }}>
          Kualitas Potongan<br />Terbaik
        </h1>
        <p style={{
          color: 'var(--foreground-muted)',
          fontSize: '0.95rem',
          lineHeight: '1.5',
          marginBottom: '2rem',
          fontWeight: 300
        }}>
          Dikerjakan langsung oleh owner berpengalaman. Cukur premium, cat rambut fashion, perm, dan dreadlocks di Bandung.
        </p>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '0.75rem',
          width: '100%',
          marginTop: '0.5rem'
        }}>
          <a href="/book" className="btn btn-primary glow-pulse" style={{ 
            padding: '0.85rem 0.5rem', 
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
            fontWeight: 600
          }}>
            Booking Sekarang
          </a>
          <a href="/queue" className="btn btn-secondary" style={{ 
            padding: '0.85rem 0.5rem', 
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
            borderColor: 'rgba(235, 220, 185, 0.25)',
            color: 'var(--primary)',
            fontWeight: 600
          }}>
            Pantau Antrian
          </a>
        </div>
      </section>

      {/* Mobile Barber Profile */}
      <section style={{
        padding: '3rem 1rem',
        borderBottom: '1px solid var(--surface-border)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center' }}>
          <div style={{
            width: '180px',
            height: '220px',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: '1px solid var(--surface-border)',
            position: 'relative'
          }}>
            <img 
              src={SOLO_STAFF.avatarUrl} 
              alt={SOLO_STAFF.displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(9, 9, 11, 0.95)',
              padding: '0.5rem',
              textAlign: 'center',
              borderTop: '1px solid rgba(245,158,11,0.2)'
            }}>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{SOLO_STAFF.displayName}</h4>
              <p style={{ color: 'var(--primary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Owner</p>
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Kapster Anda
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '1rem', color: '#fff' }}>
              Dilayani Langsung Oleh Ahlinya
            </h2>
            <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.6', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              {SOLO_STAFF.bio}
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              backgroundColor: 'var(--surface)',
              padding: '1rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--surface-border)'
            }}>
              <div>
                <h4 style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 800 }}>100%</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Puas Hasilnya</p>
              </div>
              <div>
                <h4 style={{ color: 'var(--primary)', fontSize: '1.25rem', fontWeight: 800 }}>1-on-1</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)' }}>Fokus & Personal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Services List */}
      <section style={{ padding: '3rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Price List
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#fff' }}>
            Layanan Terbaik Kami
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {Object.entries(categories).map(([categoryName, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={categoryName} style={{
                border: '1px solid var(--surface-border)',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                backgroundColor: 'var(--surface)'
              }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--primary)',
                  marginBottom: '1rem',
                  borderBottom: '1px solid rgba(245,158,11,0.1)',
                  paddingBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {categoryName}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {items.map((service) => (
                    <div key={service.id} style={{
                      padding: '0.75rem 0',
                      borderBottom: '1px dashed rgba(255,255,255,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{service.title}</h4>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                          Rp {service.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p style={{ color: 'var(--foreground-muted)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                        {service.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          {service.durationMins} Min
                        </span>
                        <a href="/book" style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                          Pesan
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mobile Info & Map */}
      <section style={{
        padding: '3rem 1rem',
        backgroundColor: '#050507',
        borderTop: '1px solid var(--surface-border)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>
          Hubungi & Kunjungi
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ color: 'var(--primary)', marginTop: '0.1rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>
              Jalan Taman Sari No.42, Bandung, Jawa Barat 40116
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ color: 'var(--primary)', marginTop: '0.1rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>
              Senin - Jumat: 08.00 - 17.00 WIB (Sabtu-Minggu Tutup)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ color: 'var(--primary)', marginTop: '0.1rem' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>
              WA: +62 811 2160 042 | info@markbarbernshop.com
            </p>
          </div>
        </div>

        {/* Bottom Navigation Mock Bar for Mobile */}
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
          <a href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Home</span>
          </a>
          <a href="/book" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--foreground-muted)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span style={{ fontSize: '0.65rem' }}>Booking</span>
          </a>
          <a href="/queue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', color: 'var(--foreground-muted)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style={{ fontSize: '0.65rem' }}>Antrian</span>
          </a>
        </div>
      </section>
    </div>
  );
}
