import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Require a real URL (https://) and a real JWT key (all Supabase anon keys start with eyJ)
const isReal = supabaseUrl?.startsWith('https://') && supabaseKey?.startsWith('eyJ')

export const supabase = isReal ? createClient(supabaseUrl, supabaseKey) : null
export const isSupabaseConfigured = Boolean(isReal)
