"use client";

import React, { useState } from 'react';

export default function AdminLoginDesktop() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Mohon isi semua kolom input.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Email atau Password salah.');
      }
    } catch (err) {
      setError('Gagal tersambung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 1.5rem',
      background: 'radial-gradient(circle at 50% 30%, rgba(var(--primary-rgb), 0.06) 0%, transparent 60%)'
    }} className="animate-fade-in">
      
      <div style={{ width: '100%', maxWidth: '440px' }} className="animate-slide-up">
        
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            backgroundColor: 'var(--surface)',
            border: '2px solid var(--primary)',
            boxShadow: '0 0 20px var(--primary-glow)',
            marginBottom: '1.25rem'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
              <line x1="8.12" y1="8.12" x2="12" y2="12" />
            </svg>
          </div>
          <h1 className="gold-gradient-text" style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px' }}>
            Mark Barber n Shop
          </h1>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Sistem Keamanan & Dasbor Administrasi Utama
          </p>
        </div>

        {/* Glassmorphism Panel */}
        <div className="glass" style={{
          padding: '3rem 2.5rem',
          borderRadius: '1.25rem',
          border: '1px solid var(--surface-border)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
          position: 'relative'
        }}>
          {/* Top accent line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: 'var(--primary)',
            borderRadius: '1.25rem 1.25rem 0 0'
          }}></div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '2rem', textAlign: 'center' }}>
            Masuk Administrator
          </h2>

          {error && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'var(--error-bg)',
              color: 'var(--error)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }} className="animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Email Administrator *
              </label>
              <input 
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="arif@example.com"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '2.5rem' }}>
              <label htmlFor="password" style={{ display: 'block', fontSize: '0.85rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                Password Keamanan *
              </label>
              <input 
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--surface-border)',
                  color: '#fff',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--surface-border)'}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn btn-primary glow-pulse" 
              style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700 }}
            >
              {loading ? 'Memverifikasi Akses...' : 'Buka Dasbor Keamanan'}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a href="/" style={{
            color: 'var(--foreground-muted)',
            fontSize: '0.9rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground-muted)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Kembali ke Halaman Utama
          </a>
        </div>

      </div>

    </div>
  );
}
