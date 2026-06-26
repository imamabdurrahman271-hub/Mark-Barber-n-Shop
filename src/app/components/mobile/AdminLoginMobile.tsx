"use client";

import React, { useState } from 'react';

export default function AdminLoginMobile() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Mohon lengkapi seluruh kolom.');
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
        // Redirect ke dasbor admin dengan reload halaman penuh untuk mematikan status login di server
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Email atau Password salah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'radial-gradient(circle at 50% 30%, rgba(var(--primary-rgb), 0.08) 0%, transparent 70%)'
    }} className="animate-fade-in">
      
      {/* Brand & Logo */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          backgroundColor: 'var(--surface)',
          border: '2px solid var(--primary)',
          boxShadow: '0 0 15px var(--primary-glow)',
          marginBottom: '1rem'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
        </div>
        <h1 className="gold-gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
          Mark Barber n Shop
        </h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Dasbor Keamanan & Administrasi Toko
        </p>
      </div>

      {/* Login Box */}
      <div className="glass" style={{
        padding: '2rem 1.5rem',
        borderRadius: '1rem',
        border: '1px solid var(--surface-border)',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', textAlign: 'center' }}>
          Masuk Sebagai Admin
        </h2>

        {error && (
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--error-bg)',
            color: 'var(--error)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }} className="animate-slide-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email input */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Email Admin *
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
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Password input */}
          <div style={{ marginBottom: '2rem' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
              Password Kunci *
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
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--surface-border)',
                color: '#fff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn btn-primary glow-pulse" 
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700 }}
          >
            {loading ? 'Memverifikasi...' : 'Masuk Ke Dasbor'}
          </button>
        </form>
      </div>

      {/* Back Link */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <a href="/" style={{
          color: 'var(--foreground-muted)',
          fontSize: '0.85rem',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--foreground-muted)'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Kembali ke Beranda
        </a>
      </div>

    </div>
  );
}
