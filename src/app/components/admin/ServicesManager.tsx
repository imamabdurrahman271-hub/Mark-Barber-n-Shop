import React, { useState } from 'react';
import { createService, updateService, deleteService, Service } from '@/lib/db';

interface ServicesManagerProps {
  services: Service[];
  onRefresh: () => void;
}

export default function ServicesManager({ services, onRefresh }: ServicesManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Form States
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [durationMins, setDurationMins] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Service['category']>('Haircut');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddModal = () => {
    setEditingService(null);
    setTitle('');
    setPrice('');
    setDurationMins('60');
    setDescription('');
    setCategory('Haircut');
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setTitle(service.title);
    setPrice(service.price.toString());
    setDurationMins(service.durationMins.toString());
    setDescription(service.description);
    setCategory(service.category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !durationMins) {
      alert('Mohon isi semua kolom wajib.');
      return;
    }

    setIsSubmitting(true);
    try {
      const serviceData = {
        title,
        price: Number(price),
        durationMins: Number(durationMins),
        description,
        category
      };

      if (editingService) {
        await updateService(editingService.id, serviceData);
        alert('Layanan berhasil diperbarui.');
      } else {
        await createService(serviceData);
        alert('Layanan baru berhasil ditambahkan.');
      }
      
      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Error saving service:', err);
      alert('Terjadi kesalahan saat menyimpan layanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus layanan "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        const success = await deleteService(id);
        if (success) {
          alert('Layanan berhasil dihapus.');
          onRefresh();
        } else {
          alert('Gagal menghapus layanan.');
        }
      } catch (err) {
        console.error('Error deleting service:', err);
        alert('Terjadi kesalahan saat menghapus layanan.');
      }
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>Daftar Layanan & Treatment</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)' }}>Kelola layanan barbershop, durasi, dan harga yang muncul di halaman booking pelanggan.</p>
        </div>
        <button 
          onClick={openAddModal} 
          className="btn btn-primary glow-pulse" 
          style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
        >
          + Tambah Layanan
        </button>
      </div>

      {/* Services List Table/Cards */}
      {services.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          backgroundColor: 'var(--surface)',
          borderRadius: '0.75rem',
          border: '1px solid var(--surface-border)',
          color: 'var(--foreground-muted)'
        }}>
          Belum ada layanan yang terdaftar. Klik &quot;+ Tambah Layanan&quot; untuk membuat layanan pertama.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {services.map((service) => (
            <div 
              key={service.id} 
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem',
                backgroundColor: 'var(--surface)',
                borderRadius: '0.75rem',
                border: '1px solid var(--surface-border)',
                flexWrap: 'wrap',
                gap: '1rem'
              }}
            >
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '0.25rem',
                    backgroundColor: 'rgba(235, 220, 185, 0.1)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(235, 220, 185, 0.2)'
                  }}>
                    {service.category}
                  </span>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{service.title}</h4>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginBottom: '0.5rem' }}>
                  {service.description || 'Tidak ada deskripsi.'}
                </p>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--primary)' }}>
                  <span>⏱️ {service.durationMins} menit</span>
                  <span style={{ fontWeight: 700 }}>💰 Rp {service.price.toLocaleString('id-ID')}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => openEditModal(service)}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', borderColor: 'rgba(235, 220, 185, 0.2)', color: 'var(--primary)' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(service.id, service.title)}
                  className="btn btn-danger"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          padding: '1rem',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="glass" style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: '#0c0c0d',
            borderRadius: '1rem',
            border: '1px solid var(--surface-border)',
            padding: '1.75rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.3s ease'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem' }}>
              {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground-muted)', marginBottom: '0.35rem' }}>
                  Nama Layanan *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Premium Haircut & Wash"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#141416',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground-muted)', marginBottom: '0.35rem' }}>
                    Kategori *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Service['category'])}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#141416',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  >
                    <option value="Haircut">Haircut</option>
                    <option value="Shaving">Shaving</option>
                    <option value="Colouring">Colouring</option>
                    <option value="Styling">Styling</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground-muted)', marginBottom: '0.35rem' }}>
                    Durasi (Menit) *
                  </label>
                  <input 
                    type="number"
                    required
                    min="1"
                    placeholder="Contoh: 60"
                    value={durationMins}
                    onChange={(e) => setDurationMins(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#141416',
                      border: '1px solid var(--surface-border)',
                      borderRadius: '0.5rem',
                      color: '#fff',
                      outline: 'none',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground-muted)', marginBottom: '0.35rem' }}>
                  Harga (Rupiah) *
                </label>
                <input 
                  type="number"
                  required
                  min="0"
                  placeholder="Contoh: 120000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#141416',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground-muted)', marginBottom: '0.35rem' }}>
                  Deskripsi Singkat
                </label>
                <textarea 
                  rows={3}
                  placeholder="Tulis apa saja kelebihan treatment ini..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#141416',
                    border: '1px solid var(--surface-border)',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.9rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.75rem' }}
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.75rem' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
