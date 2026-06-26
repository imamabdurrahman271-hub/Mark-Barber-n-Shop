export interface Service {
  id: string;
  title: string;
  price: number;
  durationMins: number;
  description: string;
  category: 'Haircut' | 'Shaving' | 'Colouring' | 'Styling' | 'Other';
}

export interface Staff {
  id: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  staffId: string;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // HH:MM
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentSender: string;
  paymentReference: string;
  createdAt: string;
}

export interface QueueItem {
  id: string;
  bookingId: string | null;
  customerName: string;
  queueNumber: string;
  status: 'waiting' | 'serving' | 'completed' | 'skipped';
  createdAt: string;
  servedAt: string | null;
  serviceTitle: string;
  durationMins: number;
}

// 1. Data Statis Awal (Diambil langsung dari referensi Hairnerds Studio Bandung)
export const SERVICES: Service[] = [
  {
    id: '1',
    title: "Men's Reguler Haircut",
    price: 120000,
    durationMins: 60,
    description: "Hairwash, Haircut & Premium Hairstyling",
    category: 'Haircut'
  },
  {
    id: '2',
    title: "Haircut + Hot Towel Shaving",
    price: 150000,
    durationMins: 60,
    description: "Layanan lengkap: Hairwash, Haircut, Hairstyling, & Premium Shaving",
    category: 'Haircut'
  },
  {
    id: '3',
    title: "Hot Towel Shaving",
    price: 85000,
    durationMins: 60,
    description: "Cukur jenggot/kumis premium dengan handuk hangat dan pijatan wajah",
    category: 'Shaving'
  },
  {
    id: '4',
    title: "Perm Hair (Pengeritingan)",
    price: 500000,
    durationMins: 180,
    description: "Pengeritingan rambut modern untuk tampilan bertekstur dan bervolume",
    category: 'Other'
  },
  {
    id: '5',
    title: "Men's Haircolour Fashion",
    price: 700000,
    durationMins: 120,
    description: "Pewarnaan fashion premium (Grey, Purple, Pink, dll.) *Harga mulai dari 700rb",
    category: 'Colouring'
  },
  {
    id: '6',
    title: "Men's Basic Colour",
    price: 400000,
    durationMins: 60,
    description: "Pewarnaan dasar natural (Brown & Black) *Harga mulai dari 400rb",
    category: 'Colouring'
  },
  {
    id: '7',
    title: "Men Darken Colour",
    price: 250000,
    durationMins: 120,
    description: "Pewarnaan untuk menutupi uban secara alami",
    category: 'Colouring'
  },
  {
    id: '8',
    title: "Men's Highlight",
    price: 600000,
    durationMins: 120,
    description: "Pewarnaan highlight parsial untuk dimensi rambut *Harga mulai dari 600rb",
    category: 'Colouring'
  },
  {
    id: '9',
    title: "Styling & Hairwash",
    price: 85000,
    durationMins: 30,
    description: "Cuci rambut premium, styling menggunakan produk rambut berkualitas (pomade/clay)",
    category: 'Styling'
  },
  {
    id: '10',
    title: "Dreadlock (Rambut Gimbal)",
    price: 1500000,
    durationMins: 360,
    description: "Pembuatan rambut gimbal premium berdurasi panjang",
    category: 'Other'
  },
  {
    id: '11',
    title: "Cornrow",
    price: 300000,
    durationMins: 180,
    description: "Kepang rambut gaya Cornrow rapi",
    category: 'Other'
  },
  {
    id: '12',
    title: "Braid Box",
    price: 450000,
    durationMins: 180,
    description: "Kepang rambut gaya Braid Box kreatif",
    category: 'Other'
  },
  {
    id: '13',
    title: "Hair Design / Hair Tattoo",
    price: 250000,
    durationMins: 120,
    description: "Seni ukir pola/tato pada rambut kepala",
    category: 'Styling'
  }
];

// Stylist tunggal default karena kapster saat ini bekerja sendiri (Solo Barber)
export const SOLO_STAFF: Staff = {
  id: 'solo-barber-owner',
  displayName: "Bang Arif",
  bio: "Master Barber & Stylist Specialist. Berpengalaman dalam haircutting, shaving, pengeritingan (perm), dan pengerjaan rambut gimbal (dreadlocks).",
  avatarUrl: "https://lh3.googleusercontent.com/l9m1V34JHLZVqb2fWcP94Dq4qK_j-8JzKLs0_IhZBRU7MVcKy3CK9a8lRat7AnBV8FaU3VRfqALenmbN5Uui8d0ligRh6rNgcw"
};

// 2. Simulasi Database via LocalStorage (Mencegah SSR Crash dengan pengecekan typeof window)
const isBrowser = () => typeof window !== 'undefined';

const getLocalStorageData = <T>(key: string, defaultValue: T): T => {
  if (!isBrowser()) return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLocalStorageData = <T>(key: string, data: T): void => {
  if (isBrowser()) {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Pemicu event kustom untuk mensimulasikan realtime subscription di browser
const triggerQueueUpdate = () => {
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent('queue_update'));
  }
};

const triggerBookingUpdate = () => {
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent('booking_update'));
  }
};

// Mengisi data transaksi palsu awal agar Laporan Keuangan di Dashboard Admin langsung terlihat menarik saat pertama kali dibuka
const initializeMockHistory = () => {
  if (!isBrowser()) return;
  const bookingsKey = 'barbershop_bookings';
  const existingBookings = localStorage.getItem(bookingsKey);
  
  if (!existingBookings) {
    const mockBookings: Booking[] = [];
    const today = new Date();
    
    // Hasilkan data transaksi acak selama 7 hari ke belakang
    const paymentMethods = ['GOPAY', 'DANA', 'OVO', 'QRIS Mandiri', 'QRIS BCA'];
    const names = ['Budi', 'Joko', 'Andi', 'Rian', 'Fajar', 'Toni', 'Dika', 'Gani', 'Hendra', 'Sony', 'Rudi', 'Bayu', 'Eko', 'Rizky', 'Agus', 'Ivan'];
    
    for (let i = 7; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() - i);
      const dateString = targetDate.toISOString().split('T')[0];
      
      // Jumlah transaksi per hari berkisar 2 sampai 5
      const txCount = Math.floor(Math.random() * 4) + 2;
      for (let j = 0; j < txCount; j++) {
        // Jangan membuat booking hari ini otomatis completed agar user bisa mengujinya sendiri
        const isToday = i === 0;
        const status = isToday ? 'pending' : 'completed';
        
        const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
        const hour = 9 + Math.floor(Math.random() * 8); // Jam 9 - 17
        const minute = Math.random() > 0.5 ? '00' : '30';
        
        mockBookings.push({
          id: `mock-tx-${i}-${j}-${Math.random().toString(36).substr(2, 4)}`,
          customerName: names[Math.floor(Math.random() * names.length)],
          customerPhone: `0812345678${Math.floor(10 + Math.random() * 90)}`,
          serviceId: service.id,
          staffId: SOLO_STAFF.id,
          bookingDate: dateString,
          bookingTime: `${hour.toString().padStart(2, '0')}:${minute}`,
          status: status,
          paymentSender: names[Math.floor(Math.random() * names.length)],
          paymentReference: `TX${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date(targetDate.getTime() - (3 * 3600000)).toISOString() // 3 jam sebelumnya
        });
      }
    }
    
    localStorage.setItem(bookingsKey, JSON.stringify(mockBookings));
  }
};

// Jalankan inisialisasi history transaksi jika di browser
if (isBrowser()) {
  initializeMockHistory();
}

// 3. API Database Layer (Bisa diganti langsung ke Supabase Client)

/* 
========================================================================
PETUNJUK INTEGRASI SUPABASE:
========================================================================
1. Install Supabase client: npm install @supabase/supabase-js
2. Buat file supabaseClient.ts dan inisialisasi client:
   import { createClient } from '@supabase/supabase-js'
   export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
   
3. Ganti fungsi-fungsi di bawah ini dengan query Supabase. Contoh:

   export const getServices = async (): Promise<Service[]> => {
     const { data, error } = await supabase.from('services').select('*')
     if (error) throw error
     return data
   }
   
   export const createBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> => {
     const { data, error } = await supabase.from('bookings').insert(booking).select().single()
     if (error) throw error
     return data
   }
========================================================================
*/

export const getServices = (): Service[] => {
  return SERVICES;
};

export const getBookings = (): Booking[] => {
  return getLocalStorageData<Booking[]>('barbershop_bookings', []);
};

export const createBooking = (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>): Booking => {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...bookingData,
    id: `book-${Math.random().toString(36).substr(2, 9)}`,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  bookings.push(newBooking);
  setLocalStorageData('barbershop_bookings', bookings);
  triggerBookingUpdate();
  return newBooking;
};

export const updateBookingStatus = (id: string, status: Booking['status']): Booking | null => {
  const bookings = getBookings();
  const index = bookings.findIndex(b => b.id === id);
  if (index === -1) return null;
  
  bookings[index].status = status;
  setLocalStorageData('barbershop_bookings', bookings);
  triggerBookingUpdate();

  // Jika status berubah menjadi 'confirmed', masukkan otomatis ke tabel antrian harian (Queues)
  if (status === 'confirmed') {
    addToQueue(bookings[index]);
  }
  
  return bookings[index];
};

// Logika Antrian (Queues)
export const getQueue = (): QueueItem[] => {
  return getLocalStorageData<QueueItem[]>('barbershop_queues', []);
};

export const addToQueue = (booking: Booking): QueueItem => {
  const queues = getQueue();
  const service = SERVICES.find(s => s.id === booking.serviceId) || SERVICES[0];
  
  // Hitung nomor antrian berikutnya hari ini (A-01, A-02, dst.)
  const todayPrefix = "A-";
  const todayQueueCount = queues.length + 1;
  const queueNumber = `${todayPrefix}${todayQueueCount.toString().padStart(2, '0')}`;
  
  const newItem: QueueItem = {
    id: `q-${Math.random().toString(36).substr(2, 9)}`,
    bookingId: booking.id,
    customerName: booking.customerName,
    queueNumber: queueNumber,
    status: 'waiting',
    createdAt: new Date().toISOString(),
    servedAt: null,
    serviceTitle: service.title,
    durationMins: service.durationMins
  };
  
  queues.push(newItem);
  setLocalStorageData('barbershop_queues', queues);
  triggerQueueUpdate();
  return newItem;
};

// Tambahkan antrian secara manual (Walk-in)
export const addWalkInQueue = (customerName: string, serviceId: string): QueueItem => {
  const queues = getQueue();
  const service = SERVICES.find(s => s.id === serviceId) || SERVICES[0];
  
  const todayPrefix = "A-";
  const todayQueueCount = queues.length + 1;
  const queueNumber = `${todayPrefix}${todayQueueCount.toString().padStart(2, '0')}`;
  
  const newItem: QueueItem = {
    id: `q-${Math.random().toString(36).substr(2, 9)}`,
    bookingId: null, // Tanpa booking karena walk-in
    customerName: customerName,
    queueNumber: queueNumber,
    status: 'waiting',
    createdAt: new Date().toISOString(),
    servedAt: null,
    serviceTitle: service.title,
    durationMins: service.durationMins
  };
  
  queues.push(newItem);
  setLocalStorageData('barbershop_queues', queues);
  triggerQueueUpdate();
  return newItem;
};

export const updateQueueStatus = (id: string, status: QueueItem['status']): QueueItem | null => {
  const queues = getQueue();
  const index = queues.findIndex(q => q.id === id);
  if (index === -1) return null;
  
  queues[index].status = status;
  if (status === 'serving') {
    queues[index].servedAt = new Date().toISOString();
  }
  
  setLocalStorageData('barbershop_queues', queues);
  triggerQueueUpdate();

  // Jika status antrian selesai (completed), sinkronkan status booking-nya juga menjadi completed
  if (status === 'completed' && queues[index].bookingId) {
    const bookings = getBookings();
    const bIndex = bookings.findIndex(b => b.id === queues[index].bookingId);
    if (bIndex !== -1) {
      bookings[bIndex].status = 'completed';
      setLocalStorageData('barbershop_bookings', bookings);
      triggerBookingUpdate();
    }
  }
  
  return queues[index];
};

// Berlangganan (Subscribe) perubahan antrian secara Real-time
export const subscribeToQueue = (callback: () => void) => {
  if (!isBrowser()) return () => {};
  
  window.addEventListener('queue_update', callback);
  // Kembalikan fungsi unsubscribe
  return () => {
    window.removeEventListener('queue_update', callback);
  };
};

export const subscribeToBookings = (callback: () => void) => {
  if (!isBrowser()) return () => {};
  
  window.addEventListener('booking_update', callback);
  return () => {
    window.removeEventListener('booking_update', callback);
  };
};
