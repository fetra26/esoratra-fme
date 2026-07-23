import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { printStaffBadges } from '../../lib/badges'
import Toast from '../../components/Toast'

const empty = { nom: '', andraikitra: '', contact: '' }

export default function Staff() {
  const { districtId } = useAuth()
  const [list, setList] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('staff').select('*').order('created_at')
    setList(data || [])
  }, [])
  useEffect(() => { load() }, [load])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.nom.trim()) return setToast("Saisissez l'anarana")
    const payload = {
      nom: form.nom.trim(),
      andraikitra: form.andraikitra.trim() || null,
      contact: form.contact.trim() || null
    }
    if (editingId) {
      const { error } = await supabase.from('staff').update(payload).eq('id', editingId)
      if (error) return setToast('Erreur: ' + error.message)
      setEditingId(null); setForm(empty); setToast('Staff modifié'); load()
    } else {
      const { error } = await supabase.from('staff').insert({ ...payload, district_id: districtId })
      if (error) return setToast('Erreur: ' + error.message)
      setForm(empty); setToast(payload.nom + ' ajouté'); load()
    }
  }
  function startEdit(s) {
    setEditingId(s.id)
    setForm({ nom: s.nom, andraikitra: s.andraikitra || '', contact: s.contact || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function cancelEdit() { setEditingId(null); setForm(empty) }
  async function del(id, nom) {
    if (!confirm(`Supprimer « ${nom} » du staff ? Action définitive.`)) return
    const { error } = await supabase.from('staff').delete().eq('id', id)
    if (error) return setToast('Erreur: ' + error.message)
    if (editingId === id) cancelEdit()
    setToast('Staff supprimé'); load()
  }

  return (
    <>
      <h1 className="page-h">Staff Camporée</h1>

      <div className="card">
        <h2>{editingId ? '✎ Modifier le staff' : 'Ajouter un staff'}</h2>
        <div className="field"><label>Anarana sy fanampin'anarana <span className="req">*</span></label>
          <input value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="ANARANA Fanampin'anarana" />
        </div>
        <div className="field"><label>Andraikitra anatin'ny Lasy</label>
          <input value={form.andraikitra} onChange={e => set('andraikitra', e.target.value)} placeholder="Ex : Sakafo, Fandriampahalemana, Fitsaboana…" />
        </div>
        <div className="field"><label>Laharan'ny Finday</label>
          <input type="tel" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="034 00 000 00" />
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-green" onClick={save} style={{ flex: 1 }}>
            {editingId ? '✓ Enregistrer les modifications' : '＋ Ajouter au staff'}
          </button>
          {editingId && <button className="btn btn-ghost" onClick={cancelEdit}>Annuler</button>}
        </div>
      </div>

      <div className="card">
        <h2><span>Liste du staff</span><span className="hint" style={{ margin: 0 }}>{list.length ? list.length + ' personne(s)' : ''}</span></h2>
        {list.length > 0 && (
          <div className="btn-row" style={{ marginBottom: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={() => { if (!printStaffBadges(list)) setToast('Aucun staff à imprimer') }}>
              🖨 Imprimer les badges (A4)
            </button>
          </div>
        )}
        {list.length ? list.map(s => (
          <div className={'item' + (editingId === s.id ? ' item-edit' : '')} key={s.id}>
            <div style={{ flex: 1 }}>
              <div className="nm">{s.nom}</div>
              <div className="sb">{[s.andraikitra, s.contact && '📞 ' + s.contact].filter(Boolean).join(' · ') || '—'}</div>
            </div>
            <div className="rt">
              <button className="ic" title="Modifier" onClick={() => startEdit(s)}>✎</button>
              <button className="x" title="Supprimer" onClick={() => del(s.id, s.nom)}>×</button>
            </div>
          </div>
        )) : <div className="empty">Aucun staff enregistré.</div>}
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </>
  )
}
