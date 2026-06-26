import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kxibrfianzxxrhzzyzuu.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4aWJyZmlhbnp4eHJoenp5enV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0Njc2NjQsImV4cCI6MjA5ODA0MzY2NH0.Mt81tGJmvk6fLtbij1CsybPxvSeoZnvg6QQZOryzcH4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
