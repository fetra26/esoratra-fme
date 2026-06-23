import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { CATEGORIES, CAT_LABEL, CAT_CLASS, FRAIS, ANDRAIKITRA, PAY_TYPES, genCode, fmt, memberLine } from '../../lib/constants'
import Toast from '../../components/Toast'

const empty = { categorie: 'Mpisavalalana', nom: '', sexe: 'L', date_naissance: '', kilasy: '', bapteme: false, contact: '', marim_pandrosoana: '', andraikitra: ANDRAIKITRA[0], chef_guide: '', date_cg: '' }

export default function Inscription() {
  const [eglises, setEglises] = useState([])
  const [egId, setEgId] = useState('')
  const [membres, setMembres] = useState([])
  const [form, setForm] = useState(empty)
  const [pay, setPay] = useState({ type: '', numero_recu: '', date_envoi: '', reference: '' })
  const [kilasyList, setKilasyList] = useState([])
  const [toast, setToast] = useState('')

  useEffect(() => {
    supabase.from('kilasy').select('*').order('nom').then(({ data }) =>
      setKilasyList((data || []).sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { numeric: true }))))
  }, [])

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

  async function addMember() {
    if (!egId) return setToast('Sélectionnez une église')
    if (!form.nom.trim()) return setToast("Saisissez l'anarana")
    const m = {
      eglise_id: egId, categorie: cat, nom: form.nom.trim(), sexe: form.sexe,
      code: genCode(), frais: FRAIS[cat]
    }
    if (cat === 'Mpisavalalana' || cat === 'Mpisantatra') { m.date_naissance = form.date_naissance || null; m.kilasy = form.kilasy }
    if (cat === 'Mpisavalalana') m.bapteme = form.bapteme
    if (cat === 'Encadreur') { m.date_naissance = form.date_naissance || null; m.contact = form.contact; m.marim_pandrosoana = form.marim_pandrosoana }
    if (cat === 'Hafa') { m.contact = form.contact; m.andraikitra = form.andraikitra; m.chef_guide = form.chef_guide; m.date_cg = form.date_cg || null }
    const { error } = await supabase.from('membres').insert(m)
    if (error) return setToast('Erreur: ' + error.message)
    setForm({ ...empty, categorie: cat })
    setToast(m.nom + ' ajouté'); loadMembres()
  }
  async function delMember(id) {
    await supabase.from('membres').delete().eq('id', id); loadMembres()
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
          <h2>Ajouter un membre</h2>
          <div className="field"><label>Catégorie <span className="req">*</span></label>
            <select value={cat} onChange={e => set('categorie', e.target.value)}>
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
                {kilasyList.map(k => <option key={k.id} value={k.nom}>{k.nom}</option>)}
              </select>
              {!kilasyList.length && <span className="hint">Aucun kilasy défini — ajoutez-en dans l'onglet « Kilasy ».</span>}
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
          <button className="btn btn-green" onClick={addMember}>＋ Ajouter à l'église</button>
        </div>

        <div className="card">
          <h2><span>Membres</span><span className="hint" style={{ margin: 0 }}>{membres.length ? membres.length + ' membre(s)' : ''}</span></h2>
          {membres.length ? membres.map(m => (
            <div className="item" key={m.id}>
              <div><span className={'cat-pill ' + CAT_CLASS[m.categorie]}>{m.categorie}</span>
                <div className="nm">{m.nom}</div><div className="sb">{memberLine(m)}</div></div>
              <div className="rt"><span className="sb">{fmt(m.frais)}</span>
                <button className="x" onClick={() => delMember(m.id)}>×</button></div>
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
