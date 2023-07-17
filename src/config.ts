import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient('https://tajllccgqcblogdfsmgr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhamxsY2NncWNibG9nZGZzbWdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY5NzE4NDIsImV4cCI6MjAwMjU0Nzg0Mn0.W32PE62gK5fZjcHrWoGscHkphUHMQVXaLAr3aCR2xw4')

export const db = supabase;
