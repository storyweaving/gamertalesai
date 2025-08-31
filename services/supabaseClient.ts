import { createClient } from '@supabase/supabase-js';
import { Database } from '../types';

const supabaseUrl = 'https://vuuxvrpcgrttgpvmpizk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dXh2cnBjZ3J0dGdwdm1waXprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTAwMTMsImV4cCI6MjA3MTc4NjAxM30.qLEgWHjzOevjDDPfw0rvgynMXYKZV7AoOydFQpVcsQM';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Key are missing. Please provide them in services/supabaseClient.ts');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);