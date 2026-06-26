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
