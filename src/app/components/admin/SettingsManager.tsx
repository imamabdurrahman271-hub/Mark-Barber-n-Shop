import React, { useState } from 'react';
import { updateShopSettings, ShopSettings } from '@/lib/db';

interface SettingsManagerProps {
  settings: ShopSettings;
  onRefresh: () => void;
}

const STANDARD_HOURS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", 
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", 
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
];

const DAY_NAMES = [
  { value: 0, label: "Minggu" },
  { value: 1, label: "Senin" },
  { value: 2, label: "Selasa" },
  { value: 3, label: "Rabu" },
  { value: 4, label: "Kamis" },
  { value: 5, label: "Jumat" },
  { value: 6, label: "Sabtu" }
];

export default function SettingsManager({ settings, onRefresh }: SettingsManagerProps) {
  const [operatingHours, setOperatingHours] = useState<string[]>(settings.operatingHours);
  const [closedDays, setClosedDays] = useState<number[]>(settings.closedDays);
  const [holidays, setHolidays] = useState<string[]>(settings.holidays);

  // Synchronize prop changes to state during render to avoid useEffect cascading renders
  const [prevSettings, setPrevSettings] = useState(settings);
  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setOperatingHours(settings.operatingHours || []);
    setClosedDays(settings.closedDays || []);
    setHolidays(settings.holidays || []);
  }
  
  // Input untuk cuti baru
  const [newHoliday, setNewHoliday] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toggle Jam Kerja
  const handleHourToggle = (hour: string) => {
    if (operatingHours.includes(hour)) {
      setOperatingHours(operatingHours.filter(h => h !== hour));
    } else {
      // Urutkan jam agar rapi
      const newHours = [...operatingHours, hour].sort((a, b) => a.localeCompare(b));
      setOperatingHours(newHours);
    }
  };

  // Toggle Hari Libur Rutin
  const handleDayToggle = (dayValue: number) => {
    if (closedDays.includes(dayValue)) {
      setClosedDays(closedDays.filter(d => d !== dayValue));
    } else {
      setClosedDays([...closedDays, dayValue].sort());
    }
  };

  // Tambah Tanggal Cuti Khusus
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoliday) return;

    if (holidays.includes(newHoliday)) {
      alert('Tanggal cuti tersebut sudah ada dalam daftar.');
      return;
    }

    const updatedHolidays = [...holidays, newHoliday].sort();
    setHolidays(updatedHolidays);
    setNewHoliday('');
  };

  // Hapus Tanggal Cuti
  const handleRemoveHoliday = (dateToRemove: string) => {
    const updatedHolidays = holidays.filter(d => d !== dateToRemove);
    setHolidays(updatedHolidays);
  };

  // Simpan Semua Pengaturan ke Supabase
  const handleSave = async () => {
    if (operatingHours.length === 0) {
      alert('Mohon pilih minimal satu jam operasional aktif.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateShopSettings({
        operatingHours,
        closedDays,
        holidays
      });
      alert('Pengaturan toko berhasil diperbarui.');
      onRefresh();
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>Pengaturan Jadwal & Hari Libur</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Atur jam operasional barbershop, hari libur rutin mingguan, serta atur tanggal cuti liburan khusus Bang Arif.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '1.5rem'
      }}>
        {/* 1. HARI LIBUR RUTIN */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--surface)',
          borderRadius: '0.75rem',
          border: '1px solid var(--surface-border)'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>📅 1. Hari Libur Rutin Mingguan</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.25rem' }}>Centang hari di mana barbershop tutup secara rutin setiap minggunya.</p>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            {DAY_NAMES.map((day) => {
              const isClosed = closedDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: isClosed ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    color: isClosed ? '#ef4444' : 'var(--foreground-muted)',
                    border: `1px solid ${isClosed ? '#ef4444' : 'var(--surface-border)'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  {day.label} {isClosed ? '🔴 (Tutup)' : '🟢 (Buka)'}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. JAM OPERASIONAL AKTIF */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--surface)',
          borderRadius: '0.75rem',
          border: '1px solid var(--surface-border)'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>⏱️ 2. Jam Operasional Kerja</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.25rem' }}>Pilih jam-jam mulai yang aktif tersedia untuk dibooking oleh pelanggan di website.</p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '0.5rem'
          }}>
            {STANDARD_HOURS.map((hour) => {
              const isActive = operatingHours.includes(hour);
              return (
                <button
                  key={hour}
                  type="button"
                  onClick={() => handleHourToggle(hour)}
                  style={{
                    padding: '0.6rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? '#000' : 'var(--foreground-muted)',
                    border: `1px solid ${isActive ? 'var(--primary)' : 'var(--surface-border)'}`,
                    transition: 'all 0.2s'
                  }}
                >
                  {hour}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. TANGGAL CUTI / LIBUR KHUSUS */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: 'var(--surface)',
          borderRadius: '0.75rem',
          border: '1px solid var(--surface-border)'
        }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>🌴 3. Cuti & Tanggal Libur Khusus (Toko Tutup)</h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '1.25rem' }}>Atur tanggal spesifik saat Anda ingin meliburkan toko (misal: mudik, liburan, atau keperluan mendadak).</p>
          
          {/* Form Tambah Cuti */}
          <form onSubmit={handleAddHoliday} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input 
              type="date"
              value={newHoliday}
              onChange={(e) => setNewHoliday(e.target.value)}
              style={{
                padding: '0.6rem 1rem',
                backgroundColor: '#141416',
                border: '1px solid var(--surface-border)',
                borderRadius: '0.375rem',
                color: '#fff',
                outline: 'none',
                fontSize: '0.9rem',
                flex: 1
              }}
            />
            <button
              type="submit"
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap', borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              + Tambah Hari Libur
            </button>
          </form>

          {/* Daftar Cuti */}
          {holidays.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', textAlign: 'center', padding: '1.5rem', border: '1px dashed var(--surface-border)', borderRadius: '0.5rem' }}>
              Tidak ada tanggal libur khusus yang dijadwalkan.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {holidays.map((date) => {
                // Format tanggal ke format lokal Indonesia (misal: 10 Juli 2026)
                const formattedDate = new Date(date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                });
                return (
                  <div
                    key={date}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.4rem 0.75rem',
                      backgroundColor: '#141416',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '0.375rem',
                      fontSize: '0.8rem',
                      color: '#fff'
                    }}
                  >
                    <span>📅 {formattedDate}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHoliday(date)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        padding: '0 0.2rem'
                      }}
                      title="Hapus Hari Libur"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ACTION BUTTON */}
      <button
        type="button"
        onClick={handleSave}
        className="btn btn-primary glow-pulse"
        disabled={isSubmitting}
        style={{
          padding: '1rem',
          width: '100%',
          fontSize: '1rem',
          fontWeight: 700,
          marginTop: '1rem',
          borderRadius: '0.5rem'
        }}
      >
        {isSubmitting ? 'Menyimpan Pengaturan...' : '💾 Simpan Seluruh Pengaturan'}
      </button>
    </div>
  );
}
