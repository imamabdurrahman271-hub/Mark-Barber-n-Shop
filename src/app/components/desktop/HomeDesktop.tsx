import React from 'react';
import { SERVICES, SOLO_STAFF } from '@/lib/db';

export default function HomeDesktop() {
  // Group services by category
  const categories = {
    'Haircut': SERVICES.filter(s => s.category === 'Haircut'),
    'Shaving': SERVICES.filter(s => s.category === 'Shaving'),
    'Colouring': SERVICES.filter(s => s.category === 'Colouring'),
    'Styling': SERVICES.filter(s => s.category === 'Styling'),
    'Other': SERVICES.filter(s => s.category === 'Other'),
  };

  return (
    <div style={{ paddingBottom: '5rem' }} className="animate-fade-in">
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '8rem 0 6rem 0',
        background: 'radial-gradient(circle at 50% 30%, rgba(var(--primary-rgb), 0.08) 0%, transparent 60%)',
        textAlign: 'center',
        borderBottom: '1px solid var(--surface-border)'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <span style={{
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: '1rem',
            border: '1px solid rgba(var(--primary-rgb), 0.3)',
            padding: '0.25rem 0.75rem',
            borderRadius: '50px',
            background: 'rgba(var(--primary-rgb), 0.05)'
          }}>
            Premium Solo Barbershop
          </span>
          
          <h1 className="gold-gradient-text" style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            lineHeight: '1.15',
            letterSpacing: '-1px',
            marginBottom: '1.5rem',
          }}>
            Kualitas Potongan Terbaik,<br />
            Tanpa Kompromi
          </h1>
          
          <p style={{
            color: 'var(--foreground-muted)',
            fontSize: '1.15rem',
            lineHeight: '1.6',
            marginBottom: '2.5rem',
            fontWeight: 300
          }}>
            Dikerjakan langsung oleh owner berpengalaman. Dapatkan kenyamanan cukur premium, layanan cat rambut fashion, perm, hingga pengerjaan dreadlocks berkualitas di Manna, Bengkulu Selatan.
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <a href="/book" className="btn btn-primary glow-pulse" style={{ padding: '0.9rem 2.5rem', fontSize: '1rem' }}>
              Booking Online Sekarang
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '0.25rem' }}>
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
            <a href="/queue" className="btn btn-secondary" style={{ padding: '0.9rem 2rem', fontSize: '1rem' }}>
              Pantau Antrian Live
            </a>
          </div>
        </div>
      </section>

      {/* Meet the Barber (Solo Barber Profile) */}
      <section style={{
        padding: '5rem 0',
        borderBottom: '1px solid var(--surface-border)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
            alignItems: 'center'
          }}>
            {/* Barber Photo Mockup */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} className="animate-slide-up">
              <div style={{
                width: '320px',
                height: '400px',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid var(--surface-border)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
              }}>
                <img 
                  src={SOLO_STAFF.avatarUrl} 
                  alt={SOLO_STAFF.displayName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'grayscale(30%)'
                  }}
                />
                {/* Decorative gold badge */}
                <div style={{
                  position: 'absolute',
                  bottom: '1.5rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  background: 'rgba(0, 0, 0, 0.9)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(var(--primary-rgb), 0.2)',
                  padding: '1rem',
                  borderRadius: '1rem',
                  textAlign: 'center'
                }}>
                  <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>{SOLO_STAFF.displayName}</h4>
                  <p style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.2rem' }}>
                    Owner & Barber
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Bio */}
            <div>
              <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                Keahlian & Pengalaman
              </span>
              <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '1.5rem', color: '#fff' }}>
                Dikerjakan Langsung Oleh Ahlinya
              </h2>
              <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                {SOLO_STAFF.bio}
              </p>
              <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.7', fontSize: '1.05rem', marginBottom: '2rem' }}>
                Di Mark Barber n Shop, kepuasan Anda adalah prioritas utama. Karena ditangani langsung oleh pemilik, kualitas setiap potongan, pewarnaan, dan layanan perawatan rambut dijamin konsisten dan presisi tinggi sesuai keinginan Anda.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                borderTop: '1px solid var(--surface-border)',
                paddingTop: '1.5rem'
              }}>
                <div>
                  <h4 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 800 }}>100%</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Garansi Kepuasan Hasil</p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--primary)', fontSize: '1.5rem', fontWeight: 800 }}>1-on-1</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Pelayanan Personal & Fokus</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services List Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Price List
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem', color: '#fff' }}>
              Daftar Layanan Premium
            </h2>
            <p style={{ color: 'var(--foreground-muted)', marginTop: '0.75rem', maxWidth: '600px', margin: '0.75rem auto 0 auto' }}>
              Pilih dari rangkaian layanan perawatan rambut pria terlengkap di Manna, Bengkulu Selatan. Harga transparan dan sudah termasuk cuci rambut serta produk styling berkualitas.
            </p>
          </div>

          {/* Service categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {Object.entries(categories).map(([categoryName, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={categoryName} style={{
                  border: '1px solid var(--surface-border)',
                  borderRadius: '1rem',
                  padding: '2.5rem',
                  backgroundColor: 'var(--surface)'
                }}>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    marginBottom: '1.5rem',
                    borderBottom: '1px solid rgba(245,158,11,0.1)',
                    paddingBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {categoryName}
                  </h3>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                  }}>
                    {items.map((service) => (
                      <div key={service.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '1.25rem',
                        borderRadius: '0.75rem',
                        backgroundColor: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.02)',
                        transition: 'transform 0.2s, border-color 0.2s',
                        cursor: 'pointer'
                      }}
                      className="service-card"
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                            <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>{service.title}</h4>
                            <span style={{ color: 'var(--primary)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              Rp {service.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', marginTop: '0.5rem', lineHeight: '1.5' }}>
                            {service.description || "Layanan perawatan rambut berkualitas tinggi."}
                          </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', borderTop: '1px dashed var(--surface-border)', paddingTop: '0.75rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {service.durationMins} Menit
                          </span>
                          <a href="/book" style={{
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem'
                          }}>
                            Pesan
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Jam Buka & Lokasi Section */}
      <section style={{
        padding: '5rem 0',
        backgroundColor: '#050507',
        borderTop: '1px solid var(--surface-border)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem'
          }}>
            {/* Opening hours & contact info */}
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>
                Kunjungi Studio Kami
              </h2>
              <p style={{ color: 'var(--foreground-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
                Nikmati suasana potong rambut yang tenang dan personal. Barbershop kami berlokasi strategis di Manna, Bengkulu Selatan dengan tempat parkir yang memadai.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>Alamat Studio</h4>
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                      Manna, Bengkulu Selatan
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>Jam Kerja</h4>
                    <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                      Senin - Jumat: 08.00 - 17.00 WIB<br />
                      Sabtu & Minggu: Tutup
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  </div>
                  <div>
                    <h4 style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>Hubungi Kami</h4>
                    <a 
                      href="https://wa.me/6285382926336" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contact-link"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        color: 'var(--primary)', 
                        fontSize: '0.95rem', 
                        marginTop: '0.35rem',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328.001 11.894 0c3.18.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.57-5.328 11.892-11.893 11.893-1.997-.001-3.957-.502-5.7-1.45L0 24zm6.59-4.846c1.6.95 3.197 1.489 4.887 1.49 5.33-.001 9.67-4.34 9.67-9.67 0-2.584-1.005-5.01-2.83-6.837C16.49 2.31 14.06 1.304 11.478 1.305c-5.33 0-9.67 4.34-9.67 9.67 0 1.764.487 3.393 1.414 4.888L2.148 20.1l4.5-1.155zM17.486 15c-.3-.15-1.782-.88-2.062-1-.28-.105-.485-.15-.69.15-.205.3-.79.99-.97 1.2-.18.205-.36.23-.66.075-3.002-1.246-4.59-2.596-5.46-4.095-.22-.38.22-.35.635-1.17.11-.22.055-.41-.027-.56-.083-.15-.69-1.666-.943-2.277-.247-.59-.5-.51-.69-.52-.18-.01-.385-.01-.59-.01-.205 0-.54.075-.823.385-.283.31-1.08 1.055-1.08 2.574 0 1.52 1.107 2.99 1.26 3.2 1.5 2.025 3.32 3.12 5.3 3.12 1.62 0 2.97-.24 3.99-.57.38-.13 1.07-.63 1.22-1.22.15-.59.15-1.1.1-1.2-.05-.1-.2-.15-.5-.3z"/>
                      </svg>
                      0853-8292-6336
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Mockup */}
            <div style={{
              height: '320px',
              borderRadius: '1rem',
              overflow: 'hidden',
              border: '1px solid var(--surface-border)',
              position: 'relative',
              background: '#18181c'
            }}>
              {/* Stylized dark map placeholder */}
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle, #202027 0%, #0c0c10 100%)',
                color: 'var(--foreground-muted)',
                padding: '2rem',
                textAlign: 'center'
              }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" style={{ marginBottom: '1rem' }}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
                <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Peta Lokasi Interaktif</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem', maxWidth: '300px' }}>
                  Manna, Bengkulu Selatan
                </p>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
