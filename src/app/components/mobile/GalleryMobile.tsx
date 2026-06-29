"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface Certificate {
  id: string;
  title: string;
  subtitle: string;
  organizer: string;
  description: string;
  imagePath: string;
}

const CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    title: 'Fixie Barber Course',
    subtitle: 'Pelatihan Profesional Barbershop',
    organizer: 'FIXIE BARBER COURSE (Bandung)',
    description: 'Sertifikasi kelulusan pelatihan potong rambut dengan predikat Skill ADVANCE. Menunjukkan penguasaan teknik pemotongan rambut modern, hair styling pria tingkat tinggi, serta pemahaman mendalam tentang tata kelola pelayanan barbershop profesional.',
    imagePath: '/cert2.jpg'
  },
  {
    id: 'cert-2',
    title: 'Workshop Barber Level Up',
    subtitle: 'Demo Haircut & Upgrading Skill',
    organizer: 'Tukang Cukur Bengkulu (TCB)',
    description: 'Sertifikat apresiasi dan kepesertaan dalam Workshop Barber Level Up yang diselenggarakan pada peringatan Special 1st Anniversary Tukang Cukur Bengkulu. Berfokus pada inovasi teknik cukur terbaru, pengenalan tren model rambut modern, serta demo interaktif bersama barber berskala nasional.',
    imagePath: '/cert1.jpg'
  }
];

export default function GalleryMobile() {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050505',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(235, 220, 185, 0.08) 0%, transparent 75%)',
      color: '#fff',
      padding: '2.5rem 1.25rem 7.5rem 1.25rem'
    }}>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{
          color: '#ebdcb9',
          fontWeight: 700,
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          display: 'inline-block',
          marginBottom: '0.5rem'
        }}>
          Bukti Keahlian
        </span>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          Lisensi & Sertifikasi
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#a49e8f', marginTop: '0.5rem', lineHeight: '1.5', maxWidth: '340px', margin: '0.5rem auto 0 auto' }}>
          Bang Arif dibekali dengan kompetensi bersertifikat formal untuk menjamin kualitas terbaik rambut Anda.
        </p>
      </div>

      {/* Certs List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '450px', margin: '0 auto' }}>
        {CERTIFICATES.map((cert) => (
          <div 
            key={cert.id}
            className="glass"
            style={{
              border: '1px solid rgba(235, 220, 185, 0.12)',
              borderRadius: '1.25rem',
              overflow: 'hidden',
              backgroundColor: 'rgba(18, 18, 22, 0.65)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
            }}
          >
            {/* Image Box */}
            <div 
              onClick={() => setSelectedCert(cert)}
              style={{
                height: '240px',
                position: 'relative',
                cursor: 'pointer',
                backgroundColor: '#101012',
                borderBottom: '1px solid rgba(235, 220, 185, 0.1)'
              }}
            >
              <img 
                src={cert.imagePath} 
                alt={cert.title} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Zoom badge indicator */}
              <div style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                backgroundColor: 'rgba(5, 5, 5, 0.8)',
                border: '1px solid rgba(235, 220, 185, 0.2)',
                padding: '0.35rem 0.6rem',
                borderRadius: '0.5rem',
                fontSize: '0.65rem',
                color: '#ebdcb9',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 600,
                backdropFilter: 'blur(4px)'
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                Perbesar
              </div>
            </div>

            {/* Content Box */}
            <div style={{ padding: '1.25rem' }}>
              <span style={{ color: '#ebdcb9', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                {cert.organizer}
              </span>
              <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.15rem' }}>
                {cert.title}
              </h3>
              <p style={{ color: '#a49e8f', fontSize: '0.75rem', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                {cert.subtitle}
              </p>
              <p style={{ color: '#a49e8f', fontSize: '0.8rem', lineHeight: '1.5', fontWeight: 400 }}>
                {cert.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <div style={{ textAlign: 'center', marginTop: '3rem', padding: '0 1rem' }}>
        <Link 
          href="/book" 
          className="btn glow-pulse" 
          style={{
            display: 'block',
            padding: '1rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: 'linear-gradient(135deg, #f4ebd0 0%, #ebdcb9 100%)',
            color: '#050505',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 15px rgba(235, 220, 185, 0.2)',
            textAlign: 'center',
            textDecoration: 'none'
          }}
        >
          Booking Sekarang
        </Link>
      </div>

      {/* Fullscreen Modal Image Preview */}
      {selectedCert && (
        <div 
          onClick={() => setSelectedCert(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.98)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Close button */}
          <button 
            onClick={() => setSelectedCert(null)}
            style={{
              position: 'absolute',
              top: '1.5rem',
              right: '1.5rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.25rem',
              zIndex: 10000
            }}
          >
            &times;
          </button>

          {/* Image container */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '95vw',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(235,220,185,0.15)',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}
          >
            <img 
              src={selectedCert.imagePath} 
              alt={selectedCert.title}
              style={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
            {/* Modal label */}
            <div style={{
              width: '100%',
              backgroundColor: '#0a0a0c',
              padding: '1rem',
              borderTop: '1px solid rgba(235,220,185,0.1)',
              textAlign: 'center'
            }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ebdcb9' }}>{selectedCert.title}</h4>
              <p style={{ fontSize: '0.75rem', color: '#a49e8f', marginTop: '0.2rem' }}>{selectedCert.organizer}</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav Bar */}
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
        gridTemplateColumns: 'repeat(4, 1fr)',
        alignItems: 'center',
        zIndex: 40,
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
        <Link href="/queue" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#a49e8f', transition: 'color 0.2s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 500, letterSpacing: '0.5px' }}>Antrian</span>
        </Link>
        <Link href="/gallery" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', color: '#ebdcb9', transition: 'color 0.2s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(235,220,185,0.4))' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', color: '#ebdcb9' }}>Sertifikasi</span>
        </Link>
      </div>
    </div>
  );
}
