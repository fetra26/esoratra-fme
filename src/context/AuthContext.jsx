import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null) // erreur réseau au chargement du profil
  const mounted = useRef(true)

  // Charge le profil. Distingue 3 cas : profil trouvé / pas encore de profil / erreur réseau.
  const loadProfile = useCallback(async (uid) => {
    if (!uid) { setProfile(null); setAuthError(null); return }
    // maybeSingle() : 0 ligne => data null SANS erreur (profil pas encore créé par le trigger)
    const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
    if (!mounted.current) return
    if (error) {
      // Vraie erreur (réseau, RLS…) : on ne déduit PAS « en attente », on la remonte.
      setAuthError(error.message || 'Erreur de connexion au serveur.')
      return
    }
    setAuthError(null)
    setProfile(data || null)
  }, [])

  useEffect(() => {
    mounted.current = true
    let done = false

    supabase.auth.getSession()
      .then(async ({ data }) => {
        if (!mounted.current) return
        setSession(data.session)
        await loadProfile(data.session?.user?.id)
      })
      .catch(() => { if (mounted.current) setAuthError('Impossible de joindre le serveur.') })
      .finally(() => { if (mounted.current) { done = true; setLoading(false) } })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      if (!mounted.current) return
      setSession(s)
      await loadProfile(s?.user?.id)
      if (done && mounted.current) setLoading(false)
    })

    return () => { mounted.current = false; sub.subscription.unsubscribe() }
  }, [loadProfile])

  const value = {
    session, profile, loading, authError,
    role: profile?.role,
    districtId: profile?.district_id,
    refreshProfile: () => loadProfile(session?.user?.id),
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut()
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
