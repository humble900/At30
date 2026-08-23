import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://ttxuhctswptymmhvcsqr.supabase.co').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_KhR_zRepLeUSsdv1_D2LZg_64dRH_d2').trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

