// Edge Function : gestion des comptes par l'admin (désactiver / réactiver / supprimer / mot de passe).
// Sécurité : vérifie que l'appelant est authentifié ET admin avant toute action.
// La clé secrète (service_role) reste côté serveur — jamais exposée au navigateur.
//
// Déploiement (dashboard) : Supabase > Edge Functions > Deploy a new function
//   nom = "admin-users", coller ce fichier. Les variables SUPABASE_URL,
//   SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY sont fournies automatiquement.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // 1) Identifier l'appelant à partir de son jeton
    const authHeader = req.headers.get('Authorization') ?? ''
    const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: uErr } = await caller.auth.getUser()
    if (uErr || !user) return json({ error: 'Non authentifié.' }, 401)

    // 2) Client admin (service_role) — vérifier que l'appelant est admin
    const admin = createClient(url, service)
    const { data: me } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (me?.role !== 'admin') return json({ error: 'Action réservée aux administrateurs.' }, 403)

    // 3) Exécuter l'action demandée
    const { action, userId, password } = await req.json()
    if (!userId) return json({ error: 'userId manquant.' }, 400)
    if (userId === user.id) return json({ error: 'Action impossible sur votre propre compte.' }, 400)

    if (action === 'delete') {
      const { error } = await admin.auth.admin.deleteUser(userId)
      if (error) throw error
      // le profil est supprimé en cascade (FK on delete cascade)
    } else if (action === 'disable') {
      const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' })
      if (error) throw error
      await admin.from('profiles').update({ disabled: true }).eq('id', userId)
    } else if (action === 'enable') {
      const { error } = await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' })
      if (error) throw error
      await admin.from('profiles').update({ disabled: false }).eq('id', userId)
    } else if (action === 'set-password') {
      if (!password || String(password).length < 6)
        return json({ error: 'Mot de passe trop court (min. 6 caractères).' }, 400)
      const { error } = await admin.auth.admin.updateUserById(userId, { password })
      if (error) throw error
    } else {
      return json({ error: 'Action inconnue.' }, 400)
    }

    return json({ ok: true })
  } catch (e) {
    return json({ error: (e as Error)?.message ?? String(e) }, 500)
  }
})
