import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { CATEGORIES, CAT_LABEL, CAT_CLASS, FRAIS, ANDRAIKITRA, PAY_TYPES, KILASY, genCode, fmt, memberLine } from '../../lib/constants'
import Toast from '../../components/Toast'

const empty = { categorie: 'Mpisavalalana', nom: '', sexe: 'L', date_naissance: '', kilasy: '', bapteme: false, contact: '', marim_pandrosoana: '', andraikitra: ANDRAIKITRA[0], chef_guide: '', date_cg: '' }

export default function Inscription() {
  const [eglises, setEglises] = useState([])
  const [egId, setEgId] = useState('')
  const [membres, setMembres] = useState([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [selected, setSelected] = useState(() => new Set())
  const [pay, setPay] = useState({ type: '', numero_recu: '', date_envoi: '', reference: '' })
  const [toast, setToast] = useState('')

  const loadEglises = useCallback(async () => {
    const { data } = await supabase.from('eglises').select('*').order('nom')
    setEglises(data || [])
    if ((data || []).length && !egId) setEgId(data[0].id)
  }, [egId])
  useEffect(() => { loadEglises() }, [loadEglises])

  const loadMembres = useCallback(async () => {
    if (!egId) { setMembres([]); return }
    const { data } = await supabase.from('membres').select('*').eq('eglise_id', egId).order('created_at')
    setMembres(data || [])
    const { data: p } = await supabase.from('paiements').select('*').eq('eglise_id', egId).maybeSingle()
    setPay(p ? { type: p.type || '', numero_recu: p.numero_recu || '', date_envoi: p.date_envoi || '', reference: p.reference || '' }
      : { type: '', numero_recu: '', date_envoi: '', reference: '' })
  }, [egId])
  useEffect(() => { loadMembres() }, [loadMembres])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const cat = form.categorie

  // Construit l'objet membre en ne gardant que les champs pertinents à la catégorie
  // (les autres sont remis à null/false — utile en modification).
  function buildPayload() {
    const p = {
      eglise_id: egId, categorie: cat, nom: form.nom.trim(), sexe: form.sexe, frais: FRAIS[cat],
      date_naissance: null, kilasy: null, bapteme: false, contact: null,
      marim_pandrosoana: null, andraikitra: null, chef_guide: null, date_cg: null
    }
    if (cat === 'Mpisavalalana' || cat === 'Mpisantatra') { p.date_naissance = form.date_naissance || null; p.kilasy = form.kilasy || null }
    if (cat === 'Mpisavalalana') p.bapteme = form.bapteme
    if (cat === 'Encadreur') { p.date_naissance = form.date_naissance || null; p.contact = form.contact || null; p.marim_pandrosoana = form.marim_pandrosoana || null }
    if (cat === 'Hafa') { p.contact = form.contact || null; p.andraikitra = form.andraikitra || null; p.chef_guide = form.chef_guide || null; p.date_cg = form.date_cg || null }
    return p
  }

  async function saveMember() {
    if (!egId) return setToast('Sélectionnez une église')
    if (!form.nom.trim()) return setToast("Saisissez l'anarana")
    const p = buildPayload()

    if (editingId) {
      const { error } = await supabase.from('membres').update(p).eq('id', editingId)
      if (error) return setToast('Erreur: ' + error.message)
      setEditingId(null); setForm({ ...empty, categorie: cat })
      setToast('Membre modifié'); loadMembres()
      return
    }
    // Ajout : code unique, on retente si collision (code 23505)
    let error = null
    for (let i = 0; i < 8; i++) {
      const res = await supabase.from('membres').insert({ ...p, code: genCode() })
      error = res.error
      if (!error) break
      if (error.code !== '23505') break
    }
    if (error) return setToast('Erreur: ' + error.message)
    setForm({ ...empty, categorie: cat })
    setToast(p.nom + ' ajouté'); loadMembres()
  }

  function startEdit(m) {
    setEditingId(m.id)
    setForm({
      categorie: m.categorie, nom: m.nom, sexe: m.sexe || 'L',
      date_naissance: m.date_naissance || '', kilasy: m.kilasy || '', bapteme: !!m.bapteme,
      contact: m.contact || '', marim_pandrosoana: m.marim_pandrosoana || '',
      andraikitra: m.andraikitra || ANDRAIKITRA[0], chef_guide: m.chef_guide || '', date_cg: m.date_cg || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function cancelEdit() {
    setEditingId(null); setForm({ ...empty, categorie: cat })
  }

  async function delMember(id, nom) {
    if (!confirm(`Supprimer « ${nom} » de la liste ? Cette action est définitive.`)) return
    const { error } = await supabase.from('membres').delete().eq('id', id)
    if (error) return setToast('Erreur: ' + error.message)
    if (editingId === id) cancelEdit()
    setToast('Membre supprimé'); loadMembres()
  }
  function toggleSel(id) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAll() {
    setSelected(s => s.size === membres.length ? new Set() : new Set(membres.map(m => m.id)))
  }
  async function delSelected() {
    const ids = [...selected]
    if (!ids.length) return
    if (!confirm(`Supprimer ${ids.length} membre(s) sélectionné(s) ? Action définitive.`)) return
    const { error } = await supabase.from('membres').delete().in('id', ids)
    if (error) return setToast('Erreur: ' + error.message)
    setSelected(new Set()); setToast(ids.length + ' membre(s) supprimé(s)'); loadMembres()
  }
  async function savePayment() {
    if (!egId) return
    const montant = membres.reduce((s, m) => s + (m.frais || 0), 0)
    const paye = !!(pay.type && pay.reference)
    const { error } = await supabase.from('paiements').upsert({
      eglise_id: egId, ...pay, date_envoi: pay.date_envoi || null, montant, paye, updated_at: new Date().toISOString()
    })
    if (error) return setToast('Erreur: ' + error.message)
    setToast('Paiement enregistré')
  }

  const total = membres.reduce((s, m) => s + (m.frais || 0), 0)
  const show = (cats) => cats.includes(cat)

  return (
    <>
      <h1 className="page-h">Inscription</h1>

      <div className="card">
        <h2>Église de la délégation</h2>
        {eglises.length ? (
          <select value={egId} onChange={e => setEgId(e.target.value)}>
            {eglises.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
        ) : <div className="hint">Aucune église dans votre district. Demandez à l'admin fédération de l'ajouter.</div>}
      </div>

      {egId && <>
        <div className="card">
          <h2>{editingId ? '✎ Modifier le membre' : 'Ajouter un membre'}</h2>
          <div className="field"><label>Catégorie <span className="req">*</span></label>
            <select value={cat} onChange={e => setForm(f => ({ ...f, categorie: e.target.value, kilasy: '' }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
            </select>
          </div>
          <div className="field"><label>Anarana sy fanampin'anarana <span className="req">*</span></label>
            <input value={form.nom} onChange={e => set('nom', e.target.value)} placeholder="ANARANA Fanampin'anarana" />
          </div>
          <div className="row">
            {show(['Mpisavalalana', 'Mpisantatra', 'Encadreur']) &&
              <div className="field"><label>Daty nahaterahana</label>
                <input type="date" value={form.date_naissance} onChange={e => set('date_naissance', e.target.value)} /></div>}
            <div className="field"><label>L/V</label>
              <select value={form.sexe} onChange={e => set('sexe', e.target.value)}>
                <option value="L">Lahy (M)</option><option value="V">Vavy (F)</option>
              </select></div>
          </div>
          {show(['Mpisavalalana', 'Mpisantatra']) &&
            <div className="field"><label>Kilasim-pandrosoana</label>
              <select value={form.kilasy} onChange={e => set('kilasy', e.target.value)}>
                <option value="">— choisir —</option>
                {(KILASY[cat] || []).map(k =>
                  <option key={k.nom} value={k.nom}>{k.nom}{k.age ? ` — ${k.age} taona` : ''}</option>)}
              </select>
            </div>}
          {show(['Mpisavalalana']) &&
            <div className="field"><label className="check">
              <input type="checkbox" checked={form.bapteme} onChange={e => set('bapteme', e.target.checked)} />
              <span>Atao Batisa any @ Camporée</span></label></div>}
          {show(['Encadreur', 'Hafa']) &&
            <div className="field"><label>Contact</label>
              <input type="tel" value={form.contact} onChange={e => set('contact', e.target.value)} placeholder="034 00 000 00" /></div>}
          {show(['Encadreur']) &&
            <div className="field"><label>Marim-pandrosoana azo farany</label>
              <input value={form.marim_pandrosoana} onChange={e => set('marim_pandrosoana', e.target.value)} placeholder="Ex : Guide, Voyageur…" /></div>}
          {show(['Hafa']) &&
            <div className="field"><label>Andraikitra</label>
              <select value={form.andraikitra} onChange={e => set('andraikitra', e.target.value)}>
                {ANDRAIKITRA.map(a => <option key={a} value={a}>{a}</option>)}
              </select></div>}
          {show(['Hafa']) &&
            <div className="row">
              <div className="field"><label>Chef Guide / Totem</label>
                <input value={form.chef_guide} onChange={e => set('chef_guide', e.target.value)} placeholder="Niveau" /></div>
              <div className="field"><label>Daty CG / Totem</label>
                <input type="date" value={form.date_cg} onChange={e => set('date_cg', e.target.value)} /></div>
            </div>}
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-green" onClick={saveMember} style={{ flex: 1 }}>
              {editingId ? '✓ Enregistrer les modifications' : "＋ Ajouter à l'église"}
            </button>
            {editingId && <button className="btn btn-ghost" onClick={cancelEdit}>Annuler</button>}
          </div>
        </div>

        <div className="card">
          <h2><span>Membres</span><span className="hint" style={{ margin: 0 }}>{membres.length ? membres.length + ' membre(s)' : ''}</span></h2>
          {membres.length > 0 && (
            <div className="bulk-bar">
              <label className="bulk-all">
                <input type="checkbox" checked={selected.size === membres.length && membres.length > 0}
                  onChange={toggleAll} /> Tout sélectionner
              </label>
              {selected.size > 0 && (
                <button className="btn btn-danger btn-sm" onClick={delSelected}>🗑 Supprimer ({selected.size})</button>
              )}
            </div>
          )}
          {membres.length ? membres.map(m => (
            <div className={'item' + (editingId === m.id ? ' item-edit' : '')} key={m.id}>
              <input type="checkbox" className="m-check" checked={selected.has(m.id)} onChange={() => toggleSel(m.id)} />
              <div style={{ flex: 1 }}><span className={'cat-pill ' + CAT_CLASS[m.categorie]}>{m.categorie}</span>
                <div className="nm">{m.nom}</div><div className="sb">{memberLine(m)}</div></div>
              <div className="rt"><span className="sb">{fmt(m.frais)}</span>
                <button className="ic" title="Modifier" onClick={() => startEdit(m)}>✎</button>
                <button className="x" title="Supprimer" onClick={() => delMember(m.id, m.nom)}>×</button></div>
            </div>
          )) : <div className="empty">Aucun membre pour cette église.</div>}
          <div className="total-bar"><span className="tl">Frais généraux</span><span className="tv">{fmt(total)}</span></div>
        </div>

        <div className="card">
          <h2>Paiement Mobile Money</h2>
          <div className="pay-types">
            {PAY_TYPES.map(t => (
              <label key={t} className={pay.type === t ? 'on' : ''}>
                <input type="radio" name="paytype" checked={pay.type === t} onChange={() => setPay(p => ({ ...p, type: t }))} />
                {t.split(' ')[0]}
              </label>
            ))}
          </div>
          <div className="row">
            <div className="field"><label>Numéro reçu</label>
              <input value={pay.numero_recu} onChange={e => setPay(p => ({ ...p, numero_recu: e.target.value }))} /></div>
            <div className="field"><label>Date d'envoi</label>
              <input type="date" value={pay.date_envoi} onChange={e => setPay(p => ({ ...p, date_envoi: e.target.value }))} /></div>
          </div>
          <div className="field"><label>Référence Mobile Money</label>
            <input value={pay.reference} onChange={e => setPay(p => ({ ...p, reference: e.target.value }))} placeholder="Référence transaction" /></div>
          <button className="btn btn-primary" onClick={savePayment}>Enregistrer le paiement</button>
        </div>
      </>}
      <Toast msg={toast} onDone={() => setToast('')} />
    </>
  )
}
