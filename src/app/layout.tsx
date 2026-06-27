import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mark Barber n Shop | Booking Online & Antrian Live",
  description: "Dapatkan layanan cukur, pengeritingan (perm), rambut gimbal (dreadlocks) terbaik. Reservasi jadwal online dan pantau nomor antrian Anda secara langsung.",
  openGraph: {
    title: "Mark Barber n Shop | Booking Online & Antrian Live",
    description: "Premium Barbershop. Booking jadwal mudah secara online dan pantau antrian live hari ini.",
    url: "https://markbarber.vercel.app",
    siteName: "Mark Barber n Shop",
    locale: "id_ID",
    type: "website",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const deviceType = headerList.get('x-device-type') || 'desktop';

  if (deviceType === 'mobile') {
    return (
      <html lang="id">
        <head>
          <meta name="theme-color" content="#050505" />
        </head>
        <body style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
          <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
          {/* Floating WhatsApp Button for Mobile */}
          <a 
            href="https://wa.me/6285382926336" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              position: 'fixed',
              bottom: '6.5rem',
              right: '1.25rem',
              backgroundColor: '#25d366',
              color: '#fff',
              width: '3.25rem',
              height: '3.25rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
              zIndex: 9999
            }}
            aria-label="Hubungi WhatsApp"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328.001 11.894 0c3.18.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.57-5.328 11.892-11.893 11.893-1.997-.001-3.957-.502-5.7-1.45L0 24zm6.59-4.846c1.6.95 3.197 1.489 4.887 1.49 5.33-.001 9.67-4.34 9.67-9.67 0-2.584-1.005-5.01-2.83-6.837C16.49 2.31 14.06 1.304 11.478 1.305c-5.33 0-9.67 4.34-9.67 9.67 0 1.764.487 3.393 1.414 4.888L2.148 20.1l4.5-1.155zM17.486 15c-.3-.15-1.782-.88-2.062-1-.28-.105-.485-.15-.69.15-.205.3-.79.99-.97 1.2-.18.205-.36.23-.66.075-3.002-1.246-4.59-2.596-5.46-4.095-.22-.38.22-.35.635-1.17.11-.22.055-.41-.027-.56-.083-.15-.69-1.666-.943-2.277-.247-.59-.5-.51-.69-.52-.18-.01-.385-.01-.59-.01-.205 0-.54.075-.823.385-.283.31-1.08 1.055-1.08 2.574 0 1.52 1.107 2.99 1.26 3.2 1.5 2.025 3.32 3.12 5.3 3.12 1.62 0 2.97-.24 3.99-.57.38-.13 1.07-.63 1.22-1.22.15-.59.15-1.1.1-1.2-.05-.1-.2-.15-.5-.3z"/>
            </svg>
          </a>
        </body>
      </html>
    );
  }

  return (
    <html lang="id">
      <head>
        <meta name="theme-color" content="#050505" />
      </head>
      <body>
        {/* Header / Navigation */}
        <header className="glass no-print" style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          borderBottom: '1px solid var(--surface-border)',
          backdropFilter: 'blur(12px)'
        }}>
          <div className="container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '4.5rem'
          }}>
            {/* Logo */}
            <Link href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              <img 
                src="/logo.webp" 
                alt="Mark Barber logo" 
                style={{ 
                  height: '2.5rem', 
                  width: 'auto',
                  borderRadius: '0.25rem',
                  objectFit: 'contain'
                }} 
              />
              <span>Mark Barber <span style={{ color: 'var(--primary)' }}>n Shop</span></span>
            </Link>

            {/* Navigation Links */}
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem'
            }}>
              <Link href="/" style={{ fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' }} className="nav-link">Home</Link>
              <Link href="/queue" style={{ fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="nav-link">
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'fadeIn 1s infinite alternate'
                }}></span>
                Live Antrian
              </Link>
              <Link href="/book" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                Book Now
              </Link>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ flex: 1 }}>
          {children}
        </main>

        {/* Footer */}
        <footer className="no-print" style={{
          backgroundColor: '#050507',
          borderTop: '1px solid var(--surface-border)',
          padding: '4rem 0 2rem 0',
          color: 'var(--foreground-muted)',
          fontSize: '0.9rem'
        }}>
          <div className="container" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem'
          }}>
            {/* Brand column */}
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                MARK BARBER N SHOP
              </h3>
              <p style={{ lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Quality over Quantity. Barbershop premium di Manna, Bengkulu Selatan dengan fokus pada kualitas hasil cukur dan kenyamanan pelanggan maksimal.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* Social icons */}
                <a href="https://instagram.com" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://whatsapp.com" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.5 8.5 0 0 1-7.6-4.7L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </a>
              </div>
            </div>

            {/* Jam Operasional */}
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Jam Operasional</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: 0 }}>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Senin - Jumat</span>
                  <span style={{ color: '#fff', fontWeight: 500 }}>08.00 - 17.00 WIB</span>
                </li>
                <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sabtu - Minggu</span>
                  <span style={{ color: 'var(--error)' }}>Tutup</span>
                </li>
              </ul>
            </div>

            {/* Lokasi */}
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Lokasi Studio</h3>
              <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
                Manna, Bengkulu Selatan,<br />
                Bengkulu
              </p>
              <a href="https://maps.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Petunjuk Arah (Google Maps)
              </a>
            </div>
          </div>

          <div className="container" style={{
            borderTop: '1px solid var(--surface-border)',
            paddingTop: '2rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--foreground-muted)'
          }}>
            <p>&copy; {new Date().getFullYear()} Mark Barber n Shop. All rights reserved.</p>
          </div>
        </footer>
        {/* Floating WhatsApp Button for Desktop */}
        <a 
          href="https://wa.me/6285382926336" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#25d366',
            color: '#fff',
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
            zIndex: 9999,
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.15) rotate(5deg)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(37, 211, 102, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(37, 211, 102, 0.4)';
          }}
          aria-label="Hubungi WhatsApp"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.003 5.324 5.328.001 11.894 0c3.18.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.57-5.328 11.892-11.893 11.893-1.997-.001-3.957-.502-5.7-1.45L0 24zm6.59-4.846c1.6.95 3.197 1.489 4.887 1.49 5.33-.001 9.67-4.34 9.67-9.67 0-2.584-1.005-5.01-2.83-6.837C16.49 2.31 14.06 1.304 11.478 1.305c-5.33 0-9.67 4.34-9.67 9.67 0 1.764.487 3.393 1.414 4.888L2.148 20.1l4.5-1.155zM17.486 15c-.3-.15-1.782-.88-2.062-1-.28-.105-.485-.15-.69.15-.205.3-.79.99-.97 1.2-.18.205-.36.23-.66.075-3.002-1.246-4.59-2.596-5.46-4.095-.22-.38.22-.35.635-1.17.11-.22.055-.41-.027-.56-.083-.15-.69-1.666-.943-2.277-.247-.59-.5-.51-.69-.52-.18-.01-.385-.01-.59-.01-.205 0-.54.075-.823.385-.283.31-1.08 1.055-1.08 2.574 0 1.52 1.107 2.99 1.26 3.2 1.5 2.025 3.32 3.12 5.3 3.12 1.62 0 2.97-.24 3.99-.57.38-.13 1.07-.63 1.22-1.22.15-.59.15-1.1.1-1.2-.05-.1-.2-.15-.5-.3z"/>
          </svg>
        </a>
      </body>
    </html>
  );
}
