import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Post {
  id: string;
  nickname: string;
  avatar_seed: string;
  content: string;
  created_at: string;
  expires_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  nickname: string;
  avatar_seed: string;
  content: string;
  created_at: string;
}
