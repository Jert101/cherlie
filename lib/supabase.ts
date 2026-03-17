import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Memory {
  id: string
  title: string
  description: string
  image_url: string
  date: string
  location: string
  visible: boolean
  created_at?: string
}

export interface Letter {
  id: string
  title: string
  content: string
  date?: string | null
  order_index: number
  visible: boolean
  created_at?: string
}

export interface Poem {
  id: string
  title: string
  body: string
  date?: string | null
  order_index: number
  visible: boolean
  created_at?: string
}

export interface Surprise {
  id: string
  type: 'message' | 'audio' | 'image'
  title: string
  content: string
  position: string
  visible: boolean
  created_at?: string
}

export interface Game {
  id: string
  game_name: string
  success_message: string
  enabled: boolean
  created_at?: string
}

export interface SiteSettings {
  site_name: string
  gf_name: string
  gf_code: string
  admin_code: string
  bf_code?: string
  special_star_enabled?: boolean
  special_star_date?: string | null
  special_star_message?: string | null
  time_lock_enabled: boolean
  unlock_date: string | null
  music_url: string | null
  rocket_delay: number
  planet_rotation_speed: number
  final_message: string
}

export interface Wish {
  id: string
  message: string
  created_at: string
  visible: boolean
}

export interface Prayer {
  id: string
  message: string
  author_role: 'gf' | 'bf' | string
  created_at: string
  visible: boolean
}

export interface DailyMessage {
  id: string
  message: string
  order_index: number
  visible: boolean
}

export interface VisitStats {
  id: string
  visit_count: number
  last_visit: string
}

export interface ChatPortal {
  id: string
  closed_by_gf: boolean
  closed_by_bf: boolean
  delete_at: string | null
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  portal_id: string
  sender_role: 'gf' | 'bf'
  message: string
  is_unsent?: boolean
  unsent_at?: string | null
  unsent_by?: string | null
  created_at: string
}

export interface ChatReaction {
  id: string
  portal_id: string
  message_id: string
  reactor_role: 'gf' | 'bf'
  emoji: string
  created_at: string
}

