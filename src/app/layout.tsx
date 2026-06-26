import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mark Barber n Shop | Booking Online & Antrian Live",
  description: "Dapatkan layanan cukur, pengeritingan (perm), rambut gimbal (dreadlocks) terbaik. Reservasi jadwal online dan pantau nomor antrian Anda secara langsung.",
  openGraph: {
    title: "Mark Barber n Shop | Booking Online & Antrian Live",
    description: "Premium Barbershop. Booking jadwal mudah secara online dan pantau antrian live hari ini.",
    url: "https://markbarbernshop.com",
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
            <a href="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              {/* Scissors Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="20" y1="4" x2="8.12" y2="15.88" />
                <line x1="14.47" y1="14.48" x2="20" y2="20" />
                <line x1="8.12" y1="8.12" x2="12" y2="12" />
              </svg>
              <span>Mark Barber <span style={{ color: 'var(--primary)' }}>n Shop</span></span>
            </a>

            {/* Navigation Links */}
            <nav style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem'
            }}>
              <a href="/" style={{ fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s' }} className="nav-link">Home</a>
              <a href="/queue" style={{ fontWeight: 500, fontSize: '0.95rem', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }} className="nav-link">
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  animation: 'fadeIn 1s infinite alternate'
                }}></span>
                Live Antrian
              </a>
              <a href="/admin" style={{
                fontWeight: 500,
                fontSize: '0.85rem',
                color: 'var(--foreground-muted)',
                border: '1px solid var(--surface-border)',
                padding: '0.35rem 0.75rem',
                borderRadius: '0.375rem',
                transition: 'all 0.2s'
              }} className="nav-link-admin">Admin Dashboard</a>
              
              <a href="/book" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                Book Now
              </a>
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
                Quality over Quantity. Barbershop premium di Bandung dengan fokus pada kualitas hasil cukur dan kenyamanan pelanggan maksimal.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {/* Social icons */}
                <a href="https://instagram.com" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://whatsapp.com" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
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
                Jalan Taman Sari No.42,<br />
                Bandung, Jawa Barat 4116
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
      </body>
    </html>
  );
}
