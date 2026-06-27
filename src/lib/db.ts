import { supabase } from './supabase';

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

export interface ShopSettings {
  id: string;
  operatingHours: string[];
  closedDays: number[];
  holidays: string[];
}

// 1. Data Statis Awal (Diambil langsung dari referensi Hairnerds Studio Bandung)
export const SERVICES: Service[] = [
  {
    id: '1',
    title: "Pangkas Rambut Dewasa",
    price: 25000,
    durationMins: 30,
    description: "Potong rambut dewasa rapi dan nyaman",
    category: 'Haircut'
  },
  {
    id: '2',
    title: "Pangkas Rambut Remaja",
    price: 20000,
    durationMins: 30,
    description: "Potong rambut remaja gaya kekinian",
    category: 'Haircut'
  },
  {
    id: '3',
    title: "Pangkas Rambut Anak",
    price: 15000,
    durationMins: 30,
    description: "Potong rambut anak-anak rapi dan ramah anak",
    category: 'Haircut'
  }
];

// Stylist tunggal default karena kapster saat ini bekerja sendiri (Solo Barber)
export const SOLO_STAFF: Staff = {
  id: 'solo-barber-owner',
  displayName: "Bang Arif",
  bio: "Master Barber & Stylist Specialist. Berpengalaman dalam haircutting, shaving, pengeritingan (perm), dan pengerjaan rambut gimbal (dreadlocks).",
  avatarUrl: "https://lh3.googleusercontent.com/l9m1V34JHLZVqb2fWcP94Dq4qK_j-8JzKLs0_IhZBRU7MVcKy3CK9a8lRat7AnBV8FaU3VRfqALenmbN5Uui8d0ligRh6rNgcw"
};

// 2. Realtime & Database Layer dengan Supabase

export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('id', { ascending: true });
    
  if (error) {
    console.error('Error fetching services:', error);
    return SERVICES;
  }
  
  return data.map(s => ({
    id: s.id,
    title: s.title,
    price: Number(s.price),
    durationMins: s.duration_mins,
    description: s.description,
    category: s.category
  }));
};

export const getBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
  
  return data.map(b => ({
    id: b.id,
    customerName: b.customer_name,
    customerPhone: b.customer_phone,
    serviceId: b.service_id,
    staffId: b.staff_id,
    bookingDate: b.booking_date,
    bookingTime: b.booking_time,
    status: b.status,
    paymentSender: b.payment_sender,
    paymentReference: b.payment_reference,
    createdAt: b.created_at
  }));
};

export const createBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<Booking> => {
  const response = await fetch('/api/bookings/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  });
  
  const data = await response.json();
  if (!response.ok) {
    console.error('Error creating booking via API:', data.error);
    throw new Error(data.error || 'Gagal membuat booking');
  }
  
  return data.booking;
};

export const updateBookingStatus = async (id: string, status: Booking['status']): Promise<Booking | null> => {
  const response = await fetch('/api/bookings/update-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, status })
  });
  
  const data = await response.json();
  if (!response.ok) {
    console.error('Error updating booking status via API:', data.error);
    return null;
  }
  
  return data.booking;
};

// Logika Antrian (Queues)
export const getQueue = async (): Promise<QueueItem[]> => {
  const { data, error } = await supabase
    .from('queue_items')
    .select('*')
    .order('created_at', { ascending: true });
    
  if (error) {
    console.error('Error fetching queue:', error);
    return [];
  }
  
  return data.map(q => ({
    id: q.id,
    bookingId: q.booking_id,
    customerName: q.customer_name,
    queueNumber: q.queue_number,
    status: q.status,
    createdAt: q.created_at,
    servedAt: q.served_at,
    serviceTitle: q.service_title,
    durationMins: q.duration_mins
  }));
};

export const addToQueue = async (booking: Booking): Promise<QueueItem> => {
  const { data: existingQueues } = await supabase
    .from('queue_items')
    .select('id');
    
  const queueCount = existingQueues ? existingQueues.length : 0;
  const services = await getServices();
  const service = services.find(s => s.id === booking.serviceId) || SERVICES[0];
  
  const todayPrefix = "A-";
  const queueNumber = `${todayPrefix}${(queueCount + 1).toString().padStart(2, '0')}`;
  const newId = `q-${Math.random().toString(36).substr(2, 9)}`;
  
  const insertData = {
    id: newId,
    booking_id: booking.id,
    customer_name: booking.customerName,
    queue_number: queueNumber,
    status: 'waiting',
    service_title: service.title,
    duration_mins: service.durationMins
  };
  
  const { data, error } = await supabase
    .from('queue_items')
    .insert(insertData)
    .select()
    .single();
    
  if (error) {
    console.error('Error adding to queue:', error);
    throw error;
  }
  
  return {
    id: data.id,
    bookingId: data.booking_id,
    customerName: data.customer_name,
    queueNumber: data.queue_number,
    status: data.status,
    createdAt: data.created_at,
    servedAt: data.served_at,
    serviceTitle: data.service_title,
    durationMins: data.duration_mins
  };
};

// Tambahkan antrian secara manual (Walk-in)
export const addWalkInQueue = async (customerName: string, serviceId: string): Promise<QueueItem> => {
  const { data: existingQueues } = await supabase
    .from('queue_items')
    .select('id');
    
  const queueCount = existingQueues ? existingQueues.length : 0;
  const services = await getServices();
  const service = services.find(s => s.id === serviceId) || SERVICES[0];
  
  const todayPrefix = "A-";
  const queueNumber = `${todayPrefix}${(queueCount + 1).toString().padStart(2, '0')}`;
  const newId = `q-${Math.random().toString(36).substr(2, 9)}`;
  
  const insertData = {
    id: newId,
    booking_id: null,
    customer_name: customerName,
    queue_number: queueNumber,
    status: 'waiting',
    service_title: service.title,
    duration_mins: service.durationMins
  };
  
  const { data, error } = await supabase
    .from('queue_items')
    .insert(insertData)
    .select()
    .single();
    
  if (error) {
    console.error('Error adding walk-in to queue:', error);
    throw error;
  }
  
  return {
    id: data.id,
    bookingId: data.booking_id,
    customerName: data.customer_name,
    queueNumber: data.queue_number,
    status: data.status,
    createdAt: data.created_at,
    servedAt: data.served_at,
    serviceTitle: data.service_title,
    durationMins: data.duration_mins
  };
};

export const updateQueueStatus = async (id: string, status: QueueItem['status']): Promise<QueueItem | null> => {
  const updateData: any = { status };
  if (status === 'serving') {
    updateData.served_at = new Date().toISOString();
  }
  
  const { data, error } = await supabase
    .from('queue_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating queue status:', error);
    return null;
  }
  
  const updatedItem: QueueItem = {
    id: data.id,
    bookingId: data.booking_id,
    customerName: data.customer_name,
    queueNumber: data.queue_number,
    status: data.status,
    createdAt: data.created_at,
    servedAt: data.served_at,
    serviceTitle: data.service_title,
    durationMins: data.duration_mins
  };
  
  if (status === 'completed' && updatedItem.bookingId) {
    await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('id', updatedItem.bookingId);
  }
  
  return updatedItem;
};

// Berlangganan (Subscribe) perubahan secara Real-time via Supabase Channels
export const subscribeToQueue = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const channel = supabase
    .channel('public:queue_items')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'queue_items' },
      () => {
        callback();
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToBookings = (callback: () => void) => {
  if (typeof window === 'undefined') return () => {};
  
  const channel = supabase
    .channel('public:bookings')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bookings' },
      () => {
        callback();
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};

// Pengaturan Toko (Shop Settings)
export const getShopSettings = async (): Promise<ShopSettings> => {
  const response = await fetch('/api/settings/get');
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Gagal mengambil pengaturan');
  }
  return data.settings;
};

export const updateShopSettings = async (settings: Omit<ShopSettings, 'id'>): Promise<ShopSettings> => {
  const response = await fetch('/api/settings/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(settings)
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Gagal memperbarui pengaturan');
  }
  return data.settings;
};

// Kelola Layanan (Service CRUD)
export const createService = async (serviceData: Omit<Service, 'id'>): Promise<Service> => {
  const response = await fetch('/api/services/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(serviceData)
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Gagal membuat layanan');
  }
  return data.service;
};

export const updateService = async (id: string, serviceData: Partial<Omit<Service, 'id'>>): Promise<Service> => {
  const response = await fetch('/api/services/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, ...serviceData })
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Gagal memperbarui layanan');
  }
  return data.service;
};

export const deleteService = async (id: string): Promise<boolean> => {
  const response = await fetch('/api/services/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id })
  });
  
  const data = await response.json();
  if (!response.ok) {
    console.error('Error deleting service:', data.error);
    return false;
  }
  return data.success;
};

// Tambahan Optimasi Server-Side API Bundling
export interface BookingInitData {
  services: Service[];
  bookings: Booking[];
  settings: ShopSettings;
}

export interface AdminInitData {
  bookings: Booking[];
  queues: QueueItem[];
  services: Service[];
  settings: ShopSettings;
}

export const getBookingInitData = async (): Promise<BookingInitData> => {
  const response = await fetch('/api/bookings/init');
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Gagal mengambil data inisialisasi booking');
  }
  return {
    services: data.services,
    bookings: data.bookings,
    settings: data.settings
  };
};

export const getAdminInitData = async (): Promise<AdminInitData> => {
  const response = await fetch('/api/admin/init');
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Gagal mengambil data inisialisasi dasbor admin');
  }
  return {
    bookings: data.bookings,
    queues: data.queue,
    services: data.services,
    settings: data.settings
  };
};

