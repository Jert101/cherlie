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
  time_lock_enabled: boolean
  unlock_date: string | null
  music_url: string | null
  rocket_delay: number
  planet_rotation_speed: number
  final_message: string
}
