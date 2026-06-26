import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { title, price, durationMins, description, category } = await request.json();

    const insertData = {
      title,
      price,
      duration_mins: durationMins,
      description,
      category
    };

    const { data, error } = await supabase
      .from('services')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating service in Supabase:', error);
      return NextResponse.json({ error: 'Gagal membuat layanan' }, { status: 500 });
    }

    const createdService = {
      id: data.id,
      title: data.title,
      price: Number(data.price),
      durationMins: data.duration_mins,
      description: data.description,
      category: data.category
    };

    return NextResponse.json({ success: true, service: createdService });
  } catch (err) {
    console.error('Error in create service API:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
