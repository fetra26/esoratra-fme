import { useEffect, useState, useCallback } from 'react'
import { supabase, fetchAllRows } from '../../lib/supabase'
import { printStaffBadges } from '../../lib/badges'
import Toast from '../../components/Toast'

const empty = { nom: '', totem: '', andraikitra: '', eglise: '', district: '', region: '' }
const uniqSorted = (arr) => [...new Set(arr.map(x => (x || '').trim()).filter(Boolean))]
  .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))

export default function Staff() {
  const [list, setList] = useState([])
  const [districts, setDistricts] = useState([])
  const [eglises, setEglises] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    const [{ data: s }, d, e] = await Promise.all([
      supabase.from('staff').select('*').order('created_at'),
      fetchAllRows('districts', '*', q => q.order('nom')),
      fetchAllRows('eglises', '*', q => q.order('nom'))
    ])
    setList(s || []); setDistricts(d); setEglises(e)
  }, [])
  useEffect(() => { load() }, [load])

  // Options des listes déroulantes : base + valeurs déjà saisies dans le staff
  const districtOpts = uniqSorted([...districts.map(d => d.nom), ...list.map(s => s.district)])
  const egliseOpts = uniqSorted([...eglises.map(e => e.nom), ...list.map(s => s.eglise)])
  const regionOpts = uniqSorted(list.map(s => s.region))

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.nom.trim()) return setToast("Saisissez l'anarana")
    const payload = {
      nom: form.nom.trim(),
      totem: form.totem.trim() || null,
      andraikitra: form.andraikitra.trim() || null,
      eglise: form.eglise.trim() || null,
      district: form.district.trim() || null,
      region: form.region.trim() || null
    }
    if (editingId) {
      const { error } = await supabase.from('staff').update(payload).eq('id', editingId)
      if (error) return setToast('Erreur: ' + error.message)
      setEditingId(null); setForm(empty); setToast('Staff modifié'); load()
    } else {
      const { error } = await supabase.from('staff').insert(payload)
      if (error) return setToast('Erreur: ' + error.message)
      setForm(empty); setToast(payload.nom + ' ajouté'); load()
    }
  }
  function startEdit(s) {
    setEditingId(s.id)
    setForm({
      nom: s.nom, totem: s.totem || '', andraikitra: s.andraikitra || '',
      eglise: s.eglise || '', district: s.district || '', region: s.region || ''
    })
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
        <div className="field"><label>Totem</label>
          <input value={form.totem} onChange={e => set('totem', e.target.value)} placeholder="Totem" />
        </div>
        <div className="field"><label>Andraikitra @ lasy</label>
          <input value={form.andraikitra} onChange={e => set('andraikitra', e.target.value)} placeholder="Ex : Sakafo, Fandriampahalemana, Fitsaboana…" />
        </div>
        <div className="field"><label>Église</label>
          <input value={form.eglise} list="dl-eglise" onChange={e => set('eglise', e.target.value)} placeholder="Choisir ou saisir…" />
          <datalist id="dl-eglise">{egliseOpts.map(o => <option key={o} value={o} />)}</datalist>
        </div>
        <div className="row">
          <div className="field"><label>District</label>
            <input value={form.district} list="dl-district" onChange={e => set('district', e.target.value)} placeholder="Choisir ou saisir…" />
            <datalist id="dl-district">{districtOpts.map(o => <option key={o} value={o} />)}</datalist>
          </div>
          <div className="field"><label>Région</label>
            <input value={form.region} list="dl-region" onChange={e => set('region', e.target.value)} placeholder="Choisir ou saisir…" />
            <datalist id="dl-region">{regionOpts.map(o => <option key={o} value={o} />)}</datalist>
          </div>
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
              <div className="nm">{s.nom}{s.totem ? ' · ' + s.totem : ''}</div>
              <div className="sb">{[s.andraikitra, s.eglise, s.district, s.region].filter(Boolean).join(' · ') || '—'}</div>
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
