import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquantes (.env)')
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true }
})

// Client jetable pour créer un compte « au nom d'autrui » (admin) sans
// remplacer la session de l'admin courant : il ne persiste rien.
export function createSignupClient() {
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
