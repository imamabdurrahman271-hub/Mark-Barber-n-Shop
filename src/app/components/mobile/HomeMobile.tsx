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
    <div style={{ 
      background: 'linear-gradient(to bottom, #050505 0%, #0a0a0c 100%)',
      paddingBottom: '8rem',
      minHeight: '100vh'
    }} className="animate-fade-in">
      
      {/* Mobile Hero Section */}
      <section style={{
        padding: '5rem 1.25rem 3.5rem 1.25rem',
        background: 'radial-gradient(circle at 50% 20%, rgba(235, 220, 185, 0.08) 0%, transparent 70%)',
        textAlign: 'center',
        borderBottom: '1px solid rgba(235, 220, 185, 0.08)'
      }}>
        <span style={{
          color: '#ebdcb9',
          fontSize: '0.7rem',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          display: 'inline-block',
          marginBottom: '1rem',
          border: '1px solid rgba(235, 220, 185, 0.25)',
          padding: '0.25rem 0.75rem',
          borderRadius: '50px',
          background: 'rgba(235, 220, 185, 0.03)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)'
        }}>
          Solo Barbershop
        </span>
        <h1 className="gold-gradient-text" style={{
          fontSize: '2.15rem',
          fontWeight: 900,
          lineHeight: '1.25',
          marginBottom: '1rem',
          letterSpacing: '-0.5px'
        }}>
          Kualitas Potongan<br />Terbaik
        </h1>
        <p style={{
          color: '#a49e8f',
          fontSize: '0.9rem',
          lineHeight: '1.6',
          marginBottom: '2.25rem',
          fontWeight: 400,
          padding: '0 0.5rem'
        }}>
          Dikerjakan langsung oleh owner berpengalaman. Cukur premium, cat rambut fashion, perm, dan dreadlocks di Manna, Bengkulu Selatan.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '0.75rem',
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <a href="/book" className="btn" style={{ 
            padding: '1rem 0.5rem', 
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: 'linear-gradient(135deg, #f4ebd0 0%, #ebdcb9 100%)',
            color: '#050505',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 15px rgba(235, 220, 185, 0.25)',
            textAlign: 'center'
          }}>
            Booking Sekarang
          </a>
          <a href="/queue" className="btn" style={{ 
            padding: '1rem 0.5rem', 
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(235, 220, 185, 0.25)',
            color: '#ebdcb9',
            borderRadius: '0.75rem',
            textAlign: 'center',
            transition: 'all 0.2s'
          }}>
            Pantau Antrian
          </a>
        </div>
      </section>

      {/* Mobile Barber Profile */}
      <section style={{
        padding: '3.5rem 1.25rem',
        borderBottom: '1px solid rgba(235, 220, 185, 0.08)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.75rem', textAlign: 'center' }}>
          <div style={{
            width: '180px',
            height: '230px',
            borderRadius: '1.25rem',
            overflow: 'hidden',
            border: '1px solid rgba(235, 220, 185, 0.2)',
            position: 'relative',
            boxShadow: '0 8px 24px rgba(235, 220, 185, 0.1)'
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
              background: 'rgba(9, 9, 11, 0.9)',
              padding: '0.6rem',
              textAlign: 'center',
              borderTop: '1px solid rgba(235, 220, 185, 0.2)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)'
            }}>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>{SOLO_STAFF.displayName}</h4>
              <p style={{ color: '#ebdcb9', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, marginTop: '0.1rem' }}>Owner & Stylist</p>
            </div>
          </div>

          <div style={{ maxWidth: '450px' }}>
            <span style={{ color: '#ebdcb9', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Kapster Anda
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.35rem', marginBottom: '1rem', color: '#fff', letterSpacing: '-0.5px' }}>
              Dilayani Langsung Oleh Ahlinya
            </h2>
            <p style={{ color: '#a49e8f', lineHeight: '1.65', fontSize: '0.9rem', marginBottom: '1.75rem', fontWeight: 400 }}>
              {SOLO_STAFF.bio}
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              backgroundColor: 'rgba(18, 18, 22, 0.5)',
              padding: '1.25rem',
              borderRadius: '1rem',
              border: '1px solid rgba(235, 220, 185, 0.1)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}>
              <div>
                <h4 style={{ color: '#ebdcb9', fontSize: '1.5rem', fontWeight: 800, filter: 'drop-shadow(0 0 3px rgba(235,220,185,0.2))' }}>100%</h4>
                <p style={{ fontSize: '0.75rem', color: '#a49e8f', marginTop: '0.15rem', fontWeight: 500 }}>Puas Hasilnya</p>
              </div>
              <div>
                <h4 style={{ color: '#ebdcb9', fontSize: '1.5rem', fontWeight: 800, filter: 'drop-shadow(0 0 3px rgba(235,220,185,0.2))' }}>1-on-1</h4>
                <p style={{ fontSize: '0.75rem', color: '#a49e8f', marginTop: '0.15rem', fontWeight: 500 }}>Fokus & Personal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Services List */}
      <section style={{ padding: '3.5rem 1.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ color: '#ebdcb9', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Price List
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem', color: '#fff', letterSpacing: '-0.5px' }}>
            Layanan Terbaik Kami
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '500px', margin: '0 auto' }}>
          {Object.entries(categories).map(([categoryName, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={categoryName} className="glass" style={{
                border: '1px solid rgba(235, 220, 185, 0.12)',
                borderRadius: '1rem',
                padding: '1.5rem',
                backgroundColor: 'rgba(18, 18, 22, 0.65)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
              }}>
                <h3 style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: '#ebdcb9',
                  marginBottom: '1.25rem',
                  borderBottom: '1px solid rgba(235, 220, 185, 0.15)',
                  paddingBottom: '0.6rem',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {categoryName}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {items.map((service) => (
                    <div key={service.id} style={{
                      paddingBottom: '1rem',
                      borderBottom: '1px dashed rgba(235, 220, 185, 0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{service.title}</h4>
                        <span style={{ color: '#ebdcb9', fontWeight: 800, fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
                          Rp {service.price.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p style={{ color: '#a49e8f', fontSize: '0.8rem', lineHeight: '1.45', fontWeight: 400 }}>
                        {service.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#a49e8f', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 500 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                          {service.durationMins} Min
                        </span>
                        <a href="/book" style={{ 
                          color: '#ebdcb9', 
                          fontSize: '0.8rem', 
                          fontWeight: 700, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.2rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Pesan
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
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
        padding: '3.5rem 1.25rem',
        backgroundColor: '#070709',
        borderTop: '1px solid rgba(235, 220, 185, 0.08)',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '2rem', letterSpacing: '-0.5px' }}>
          Hubungi & Kunjungi
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          
          {/* Alamat */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            background: 'rgba(18, 18, 22, 0.4)',
            padding: '1rem 1.25rem',
            borderRadius: '0.85rem',
            border: '1px solid rgba(235, 220, 185, 0.06)'
          }}>
            <div style={{ color: '#ebdcb9', marginTop: '0.1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            </div>
            <div>
              <h5 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>Alamat Galeri</h5>
              <p style={{ color: '#a49e8f', fontSize: '0.8rem', lineHeight: '1.45' }}>
                Manna, Bengkulu Selatan
              </p>
            </div>
          </div>

          {/* Jam Kerja */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            background: 'rgba(18, 18, 22, 0.4)',
            padding: '1rem 1.25rem',
            borderRadius: '0.85rem',
            border: '1px solid rgba(235, 220, 185, 0.06)'
          }}>
            <div style={{ color: '#ebdcb9', marginTop: '0.1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div>
              <h5 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>Jam Operasional</h5>
              <p style={{ color: '#a49e8f', fontSize: '0.8rem', lineHeight: '1.45' }}>
                Senin - Jumat: 08.00 - 17.00 WIB<br />
                <span style={{ color: '#ef4444', fontWeight: 500 }}>Sabtu - Minggu: Tutup/Libur</span>
              </p>
            </div>
          </div>

          {/* Kontak */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem',
            background: 'rgba(18, 18, 22, 0.4)',
            padding: '1rem 1.25rem',
            borderRadius: '0.85rem',
            border: '1px solid rgba(235, 220, 185, 0.06)'
          }}>
            <div style={{ color: '#ebdcb9', marginTop: '0.1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            </div>
            <div>
              <h5 style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>Hubungi Kami</h5>
              <a 
                href="https://wa.me/6285382926336" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.35rem', 
                  color: '#ebdcb9', 
                  fontSize: '0.85rem', 
                  fontWeight: 600,
                  textDecoration: 'none'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328.001 11.894 0c3.18.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.57-5.328 11.892-11.893 11.893-1.997-.001-3.957-.502-5.7-1.45L0 24zm6.59-4.846c1.6.95 3.197 1.489 4.887 1.49 5.33-.001 9.67-4.34 9.67-9.67 0-2.584-1.005-5.01-2.83-6.837C16.49 2.31 14.06 1.304 11.478 1.305c-5.33 0-9.67 4.34-9.67 9.67 0 1.764.487 3.393 1.414 4.888L2.148 20.1l4.5-1.155zM17.486 15c-.3-.15-1.782-.88-2.062-1-.28-.105-.485-.15-.69.15-.205.3-.79.99-.97 1.2-.18.205-.36.23-.66.075-3.002-1.246-4.59-2.596-5.46-4.095-.22-.38.22-.35.635-1.17.11-.22.055-.41-.027-.56-.083-.15-.69-1.666-.943-2.277-.247-.59-.5-.51-.69-.52-.18-.01-.385-.01-.59-.01-.205 0-.54.075-.823.385-.283.31-1.08 1.055-1.08 2.574 0 1.52 1.107 2.99 1.26 3.2 1.5 2.025 3.32 3.12 5.3 3.12 1.62 0 2.97-.24 3.99-.57.38-.13 1.07-.63 1.22-1.22.15-.59.15-1.1.1-1.2-.05-.1-.2-.15-.5-.3z"/>
                </svg>
                0853-8292-6336
              </a>
            </div>
          </div>

        </div>

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
          <a href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#ebdcb9', transition: 'color 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(235,220,185,0.4))' }}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', color: '#ebdcb9' }}>Home</span>
          </a>
          <a href="/book" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#a49e8f', transition: 'color 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.5px' }}>Booking</span>
          </a>
          <a href="/queue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#a49e8f', transition: 'color 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.5px' }}>Antrian</span>
          </a>
        </div>
      </section>
    </div>
  );
}
