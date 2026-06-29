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
  skills: string[];
}

const CERTIFICATES: Certificate[] = [
  {
    id: 'cert-1',
    title: 'Fixie Barber Course',
    subtitle: 'Pelatihan Profesional Barbershop',
    organizer: 'FIXIE BARBER COURSE (Bandung)',
    description: 'Sertifikasi kelulusan pelatihan potong rambut dengan predikat Skill ADVANCE. Menunjukkan penguasaan teknik pemotongan rambut modern, hair styling pria tingkat tinggi, serta pemahaman mendalam tentang tata kelola pelayanan barbershop profesional.',
    imagePath: '/cert2.jpg',
    skills: ['Classic Cuts', 'Modern Hair Styling', 'Customer Service', 'Fade & Tapering']
  },
  {
    id: 'cert-2',
    title: 'Workshop Barber Level Up',
    subtitle: 'Demo Haircut & Upgrading Skill',
    organizer: 'Tukang Cukur Bengkulu (TCB)',
    description: 'Sertifikat apresiasi dan kepesertaan dalam Workshop Barber Level Up yang diselenggarakan pada peringatan Special 1st Anniversary Tukang Cukur Bengkulu. Berfokus pada inovasi teknik cukur terbaru, pengenalan tren model rambut modern, serta demo interaktif bersama barber berskala nasional.',
    imagePath: '/cert1.jpg',
    skills: ['Trend Model Rambut', 'Inovasi Teknik Cukur', 'Demo Haircut', 'Barber Networking']
  }
];

export default function GalleryDesktop() {
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  return (
    <div style={{ padding: '6rem 0' }} className="animate-fade-in">
      <div className="container">
        {/* Title Header */}
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
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
            Kredibilitas Profesional
          </span>
          <h1 className="gold-gradient-text" style={{
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: '1.2',
            letterSpacing: '-1px',
            marginBottom: '1rem'
          }}>
            Lisensi & Sertifikasi
          </h1>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '1.1rem', maxWidth: '650px', margin: '0 auto', fontWeight: 300, lineHeight: '1.6' }}>
            Bukti nyata dedikasi Bang Arif dalam dunia barbershop. Setiap pelayanan dikerjakan dengan standar kompetensi formal dan teknik yang telah diuji secara profesional.
          </p>
        </div>

        {/* Certificates Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
          gap: '3rem',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>
          {CERTIFICATES.map((cert) => (
            <div 
              key={cert.id}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                borderRadius: '1.5rem',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                transition: 'transform 0.3s, border-color 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--surface-border)';
              }}
            >
              {/* Image Frame */}
              <div 
                onClick={() => setSelectedCert(cert)}
                style={{
                  height: '350px',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'zoom-in',
                  borderBottom: '1px solid var(--surface-border)',
                  backgroundColor: '#101012'
                }}
              >
                <img 
                  src={cert.imagePath} 
                  alt={cert.title} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  paddingBottom: '1.5rem',
                  opacity: 0,
                  transition: 'opacity 0.3s'
                }}
                className="hover-overlay"
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                  <span style={{
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary)',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: '0 4px 15px rgba(245,158,11,0.3)'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    Klik untuk Memperbesar
                  </span>
                </div>
              </div>

              {/* Text Area */}
              <div style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                  {cert.organizer}
                </span>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                  {cert.title}
                </h3>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                  {cert.subtitle}
                </p>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem', flex: 1 }}>
                  {cert.description}
                </p>

                {/* Skills/Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {cert.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--foreground-muted)',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        padding: '0.35rem 0.8rem',
                        borderRadius: '0.5rem',
                        fontWeight: 500
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div style={{ textAlign: 'center', marginTop: '5rem' }}>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
            Ingin merasakan langsung potongan berstandar sertifikasi profesional?
          </p>
          <Link href="/book" className="btn btn-primary glow-pulse" style={{ padding: '1rem 3rem', fontSize: '1.05rem' }}>
            Jadwalkan Potongan Anda
          </Link>
        </div>
      </div>

      {/* Lightbox / Preview Modal */}
      {selectedCert && (
        <div 
          onClick={() => setSelectedCert(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          {/* Close button */}
          <button 
            onClick={() => setSelectedCert(null)}
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1.5rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            &times;
          </button>

          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '85vw',
              maxHeight: '85vh',
              boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
              borderRadius: '0.75rem',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.15)'
            }}
          >
            <img 
              src={selectedCert.imagePath} 
              alt={selectedCert.title} 
              style={{
                width: 'auto',
                height: 'auto',
                maxWidth: '85vw',
                maxHeight: '85vh',
                display: 'block',
                objectFit: 'contain'
              }}
            />
            {/* Modal Caption */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)',
              padding: '2rem 2rem 1.5rem 2rem',
              color: '#fff'
            }}>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{selectedCert.title}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', marginTop: '0.25rem' }}>{selectedCert.organizer} &bull; {selectedCert.subtitle}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
