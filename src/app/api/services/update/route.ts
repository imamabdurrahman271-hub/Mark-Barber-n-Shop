import { NextResponse } from 'next/server';
import { supabaseServer as supabase } from '@/lib/supabaseServer';

export async function POST(request: Request) {
  try {
    const { id, title, price, durationMins, description, category } = await request.json();

    const updateData: Record<string, string | number | undefined> = {};
    if (title !== undefined) updateData.title = title;
    if (price !== undefined) updateData.price = price;
    if (durationMins !== undefined) updateData.duration_mins = durationMins;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;

    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service in Supabase:', error);
      return NextResponse.json({ error: 'Gagal memperbarui layanan' }, { status: 500 });
    }

    const updatedService = {
      id: data.id,
      title: data.title,
      price: Number(data.price),
      durationMins: data.duration_mins,
      description: data.description,
      category: data.category
    };

    return NextResponse.json({ success: true, service: updatedService });
  } catch (err) {
    console.error('Error in update service API:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
