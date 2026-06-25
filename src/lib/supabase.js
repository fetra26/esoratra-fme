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

// Récupère TOUTES les lignes d'une table (PostgREST limite à 1000/requête).
// Pagine par paquets de 1000 jusqu'à tout avoir. modify(q) permet order/filter.
export async function fetchAllRows(table, columns = '*', modify) {
  const SIZE = 1000
  let from = 0
  const all = []
  for (;;) {
    let q = supabase.from(table).select(columns).range(from, from + SIZE - 1)
    if (modify) q = modify(q)
    const { data, error } = await q
    if (error) { console.error('fetchAllRows', table, error.message); break }
    all.push(...(data || []))
    if (!data || data.length < SIZE) break
    from += SIZE
  }
  return all
}
