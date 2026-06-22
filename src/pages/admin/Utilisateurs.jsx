import { useEffect, useState, useCallback } from 'react'
import { supabase, createSignupClient } from '../../lib/supabase'
import Toast from '../../components/Toast'

export default function Utilisateurs() {
  const [profiles, setProfiles] = useState([])
  const [districts, setDistricts] = useState([])
  const [toast, setToast] = useState('')

  // Formulaire « créer un compte »
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [newRole, setNewRole] = useState('responsable')
  const [newDistrict, setNewDistrict] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    const [{ data: p }, { data: d }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at'),
      supabase.from('districts').select('*').order('nom')
    ])
    setProfiles(p || []); setDistricts(d || [])
  }, [])
  useEffect(() => { load() }, [load])

  async function setRole(id, role) {
    const patch = { role }
    if (role !== 'responsable') patch.district_id = null
    const { error } = await supabase.from('profiles').update(patch).eq('id', id)
    if (error) return setToast('Erreur: ' + error.message)
    setToast('Rôle mis à jour'); load()
  }
  async function setDistrict(id, district_id) {
    const { error } = await supabase.from('profiles').update({ district_id: district_id || null }).eq('id', id)
    if (error) return setToast('Erreur: ' + error.message)
    load()
  }

  async function createAccount(e) {
    e.preventDefault()
    setErr('')
    if (newRole === 'responsable' && !newDistrict) { setErr('Choisissez un district pour le responsable.'); return }
    setBusy(true)
    try {
      // 1) Créer le compte sur un client jetable (la session admin reste intacte)
      const tmp = createSignupClient()
      const { data, error } = await tmp.auth.signUp({ email: email.trim(), password: pw })
      if (error) { setErr(traduire(error.message)); return }
      const uid = data.user?.id
      if (!uid) { setErr('Compte non créé. Réessayez.'); return }
      // Pas de session retournée => la confirmation par email est encore active dans Supabase :
      // le compte existe mais ne pourra pas se connecter tant qu'elle n'est pas désactivée.
      if (!data.session) {
        setErr("Compte créé, mais la confirmation par email est ENCORE ACTIVE dans Supabase : "
          + "le responsable ne pourra pas se connecter. Désactivez « Confirm email » "
          + "(Authentication → Sign In / Providers → Email), puis recréez le compte.")
        load()
        return
      }

      // 2) Le trigger a créé le profil (en_attente). On le promeut avec le client admin.
      const patch = { role: newRole, district_id: newRole === 'responsable' ? newDistrict : null }
      let updated = false
      for (let i = 0; i < 5 && !updated; i++) {
        const { data: rows, error: upErr } = await supabase
          .from('profiles').update(patch).eq('id', uid).select('id')
        if (upErr) { setErr('Compte créé mais rôle non appliqué : ' + upErr.message); break }
        if (rows && rows.length) updated = true
        else await new Promise(r => setTimeout(r, 400)) // attendre le trigger
      }

      setToast(updated ? 'Compte créé : ' + email.trim() : 'Compte créé, mais profil pas encore prêt — réglez le rôle ci-dessous.')
      setEmail(''); setPw(''); setNewRole('responsable'); setNewDistrict('')
      load()
    } finally { setBusy(false) }
  }

  const dname = (id) => districts.find(d => d.id === id)?.nom || ''

  return (
    <>
      <h1 className="page-h">Comptes utilisateurs</h1>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Créer un compte</h2>
        <p className="hint" style={{ marginTop: 0, marginBottom: 14 }}>
          Créez directement le compte d'un responsable (ou admin) et communiquez-lui ses identifiants.
          Aucune confirmation par email n'est requise.
        </p>
        <form onSubmit={createAccount}>
          {err && <div className="auth-err" style={{ marginBottom: 12 }}>{err}</div>}
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input type="text" value={pw} onChange={e => setPw(e.target.value)} required minLength={6}
              placeholder="min. 6 caractères" autoComplete="off" />
          </div>
          <div className="row" style={{ gap: 8 }}>
            <select value={newRole} onChange={e => setNewRole(e.target.value)}>
              <option value="responsable">Responsable district</option>
              <option value="admin">Admin fédération</option>
            </select>
            {newRole === 'responsable' && (
              <select value={newDistrict} onChange={e => setNewDistrict(e.target.value)}>
                <option value="">— district —</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
            )}
          </div>
          <button className="btn btn-primary" disabled={busy} style={{ marginTop: 12 }}>
            {busy ? '…' : 'Créer le compte'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Comptes existants</h2>
        <p className="hint" style={{ marginTop: 0, marginBottom: 14 }}>
          Attribuez un rôle à chaque compte. Un responsable doit aussi recevoir son district :
          il ne verra alors que les églises et membres de ce district.
        </p>
        {profiles.length ? profiles.map(p => (
          <div className="item" key={p.id} style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
            <div><div className="nm">{p.email}</div>
              <div className="sb">Statut : {labelRole(p.role)}{p.role === 'responsable' && p.district_id ? ' · ' + dname(p.district_id) : ''}</div>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <select value={p.role} onChange={e => setRole(p.id, e.target.value)}>
                <option value="en_attente">En attente</option>
                <option value="responsable">Responsable district</option>
                <option value="admin">Admin fédération</option>
              </select>
              {p.role === 'responsable' && (
                <select value={p.district_id || ''} onChange={e => setDistrict(p.id, e.target.value)}>
                  <option value="">— district —</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                </select>
              )}
            </div>
          </div>
        )) : <div className="empty">Aucun compte.</div>}
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </>
  )
}
function labelRole(r) {
  return { admin: 'Admin fédération', responsable: 'Responsable', en_attente: 'En attente' }[r] || r
}
function traduire(m) {
  if (/already registered/i.test(m)) return 'Cet email a déjà un compte.'
  if (/password should/i.test(m)) return 'Mot de passe trop court (min. 6 caractères).'
  if (/email/i.test(m) && /invalid/i.test(m)) return 'Email invalide.'
  return m
}
