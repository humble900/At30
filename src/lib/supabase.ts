import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { EXHIBITS } from '../data/exhibits';
import { ONLINE_MASTERPIECES, type MasterpieceArt } from '../data/artworks';
import type { BrandKey, ExhibitItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim();

export const supabase: SupabaseClient | null = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null;

export const isMultiplayerConfigured = Boolean(supabase);

export interface BrandData {
  id: string;
  key: BrandKey;
  name: string;
  tagline: string;
  wing_name: string;
  theme_color: string;
  banner_gradient: string;
  logo_url?: string;
  website_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface MuseumConfigData {
  id: number;
  museum_name: string;
  tagline: string;
  maintenance_mode: boolean;
  maintenance_message: string;
  global_announcement: string;
  announcement_active: boolean;
  spawn_x: number;
  spawn_y: number;
  spawn_z: number;
  spawn_rotation: number;
  fog_color: string;
  fog_density: number;
  ambient_light_intensity: number;
  max_concurrent_players: number;
}

export const DEFAULT_MUSEUM_CONFIG: MuseumConfigData = {
  id: 1,
  museum_name: 'Any30 Digital Museum',
  tagline: 'The Future, Curated.',
  maintenance_mode: false,
  maintenance_message: 'The museum is currently undergoing an exhibition curation update. Please check back shortly.',
  global_announcement: '',
  announcement_active: false,
  spawn_x: 0,
  spawn_y: 0,
  spawn_z: 8.5,
  spawn_rotation: 3.14159,
  fog_color: '#0C0E14',
  fog_density: 0.012,
  ambient_light_intensity: 0.45,
  max_concurrent_players: 50,
};

// ─── DATA FETCHERS WITH FALLBACKS ────────────────────────────

export async function fetchExhibits(): Promise<ExhibitItem[]> {
  if (!supabase) return EXHIBITS;
  try {
    const { data, error } = await supabase
      .from('exhibits')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data || data.length === 0) {
      return EXHIBITS;
    }

    return data.map((row: any) => ({
      id: row.id,
      brandKey: row.brand_key as BrandKey,
      brandName: row.brand_name,
      brandTagline: row.brand_tagline,
      title: row.title,
      wing: row.wing,
      position: [Number(row.position_x), Number(row.position_y), Number(row.position_z)],
      rotationY: Number(row.rotation_y),
      type: row.type,
      description: row.description,
      detailedStory: row.detailed_story,
      clueHint: row.clue_hint,
      puzzleType: row.puzzle_type,
      couponCode: row.coupon_code,
      couponDiscount: row.coupon_discount,
      redeemUrl: row.redeem_url,
      features: row.features || [],
      bannerGradient: row.banner_gradient,
      themeColor: row.theme_color
    }));
  } catch {
    return EXHIBITS;
  }
}

export async function fetchArtworks(): Promise<MasterpieceArt[]> {
  if (!supabase) return ONLINE_MASTERPIECES;
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('is_active', true)
      .order('position_index', { ascending: true });

    if (error || !data || data.length === 0) {
      return ONLINE_MASTERPIECES;
    }

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      artist: row.artist,
      year: row.year,
      medium: row.medium,
      location: row.location,
      imageUrl: row.image_url,
      description: row.description
    }));
  } catch {
    return ONLINE_MASTERPIECES;
  }
}

export async function fetchMuseumConfig(): Promise<MuseumConfigData> {
  if (!supabase) return DEFAULT_MUSEUM_CONFIG;
  try {
    const { data, error } = await supabase
      .from('museum_config')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return DEFAULT_MUSEUM_CONFIG;
    }

    return {
      id: data.id,
      museum_name: data.museum_name,
      tagline: data.tagline,
      maintenance_mode: Boolean(data.maintenance_mode),
      maintenance_message: data.maintenance_message || DEFAULT_MUSEUM_CONFIG.maintenance_message,
      global_announcement: data.global_announcement || '',
      announcement_active: Boolean(data.announcement_active),
      spawn_x: Number(data.spawn_x),
      spawn_y: Number(data.spawn_y),
      spawn_z: Number(data.spawn_z),
      spawn_rotation: Number(data.spawn_rotation),
      fog_color: data.fog_color,
      fog_density: Number(data.fog_density),
      ambient_light_intensity: Number(data.ambient_light_intensity),
      max_concurrent_players: Number(data.max_concurrent_players)
    };
  } catch {
    return DEFAULT_MUSEUM_CONFIG;
  }
}
