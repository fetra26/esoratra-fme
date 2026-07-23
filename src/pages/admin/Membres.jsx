import { useEffect, useState, useCallback } from 'react'
import { fetchAllRows, supabase } from '../../lib/supabase'
import { CAT_CLASS, CATEGORIES, CAT_LABEL, KILASY, ANDRAIKITRA, FRAIS, memberLine, fmt, nf } from '../../lib/constants'
import Pager from '../../components/Pager'
import Toast from '../../components/Toast'

const PAGE = 8

function buildPayload(f) {
  const cat = f.categorie
  const p = {
    eglise_id: f.eglise_id, categorie: cat, nom: f.nom.trim(), sexe: f.sexe, frais: FRAIS[cat],
    date_naissance: null, kilasy: null, bapteme: false, contact: null,
    marim_pandrosoana: null, andraikitra: null, chef_guide: null, date_cg: null
  }
  if (cat === 'Mpisavalalana' || cat === 'Mpisantatra') { p.date_naissance = f.date_naissance || null; p.kilasy = f.kilasy || null }
  if (cat === 'Mpisavalalana') p.bapteme = f.bapteme
  if (cat === 'Encadreur') { p.date_naissance = f.date_naissance || null; p.contact = f.contact || null; p.marim_pandrosoana = f.marim_pandrosoana || null }
  if (cat === 'Hafa') { p.contact = f.contact || null; p.andraikitra = f.andraikitra || null; p.chef_guide = f.chef_guide || null; p.date_cg = f.date_cg || null }
  return p
}

export default function Membres() {
  const [districts, setDistricts] = useState([])
  const [eglises, setEglises] = useState([])
  const [membres, setMembres] = useState([])
  const [fd, setFd] = useState('')
  const [fe, setFe] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(() => new Set())
  const [edit, setEdit] = useState(null)   // membre en cours d'édition (modale)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    const [d, e, m] = await Promise.all([
      fetchAllRows('districts', '*', q => q.order('nom')),
      fetchAllRows('eglises', '*', q => q.order('nom')),
      fetchAllRows('membres', '*', q => q.order('nom'))
    ])
    setDistricts(d); setEglises(e); setMembres(m)
  }, [])
  useEffect(() => { load() }, [load])

  const egName = (id) => eglises.find(e => e.id === id)?.nom || '—'
  const eglisesOfDist = fd ? eglises.filter(e => e.district_id === fd) : eglises

  let list = membres
  if (fe) list = list.filter(m => m.eglise_id === fe)
  else if (fd) { const ids = eglisesOfDist.map(e => e.id); list = list.filter(m => ids.includes(m.eglise_id)) }
  if (q) list = list.filter(m => m.nom.toLowerCase().includes(q.trim().toLowerCase()))

  const pages = Math.max(1, Math.ceil(list.length / PAGE))
  const cur = Math.min(page, pages)
  const pageList = list.slice((cur - 1) * PAGE, cur * PAGE)

  const attendu = membres.reduce((s, m) => s + (m.frais || 0), 0)
  const reset = (fn) => (v) => { fn(v); setPage(1) }

  function toggleSel(id) {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function togglePage() {
    const ids = pageList.map(m => m.id)
    setSelected(s => {
      const allOn = ids.every(id => s.has(id))
      const n = new Set(s)
      ids.forEach(id => allOn ? n.delete(id) : n.add(id))
      return n
    })
  }
  async function delOne(m) {
    if (!confirm(`Supprimer « ${m.nom} » ? Action définitive.`)) return
    const { error } = await supabase.from('membres').delete().eq('id', m.id)
    if (error) return setToast('Erreur: ' + error.message)
    setToast('Membre supprimé'); load()
  }
  async function delSelected() {
    const ids = [...selected]
    if (!ids.length) return
    if (!confirm(`Supprimer ${ids.length} membre(s) sélectionné(s) ? Action définitive.`)) return
    const { error } = await supabase.from('membres').delete().in('id', ids)
    if (error) return setToast('Erreur: ' + error.message)
    setSelected(new Set()); setToast(ids.length + ' membre(s) supprimé(s)'); load()
  }
  function startEdit(m) {
    setEdit({
      id: m.id, eglise_id: m.eglise_id, categorie: m.categorie, nom: m.nom, sexe: m.sexe || 'L',
      date_naissance: m.date_naissance || '', kilasy: m.kilasy || '', bapteme: !!m.bapteme,
      contact: m.contact || '', marim_pandrosoana: m.marim_pandrosoana || '',
      andraikitra: m.andraikitra || ANDRAIKITRA[0], chef_guide: m.chef_guide || '', date_cg: m.date_cg || ''
    })
  }
  const eset = (k, v) => setEdit(f => ({ ...f, [k]: v }))
  async function saveEdit() {
    if (!edit.nom.trim()) return setToast("Saisissez l'anarana")
    const { error } = await supabase.from('membres').update(buildPayload(edit)).eq('id', edit.id)
    if (error) return setToast('Erreur: ' + error.message)
    setEdit(null); setToast('Membre modifié'); load()
  }

  const allPageSel = pageList.length > 0 && pageList.every(m => selected.has(m.id))

  return (
    <>
      <h1 className="page-h">Membres</h1>
      <div className="stats">
        <div className="stat"><div className="n">{districts.length}</div><div className="l">Districts</div></div>
        <div className="stat"><div className="n">{eglises.length}</div><div className="l">Églises</div></div>
        <div className="stat"><div className="n">{membres.length}</div><div className="l">Inscrits</div></div>
        <div className="stat"><div className="n">{nf(attendu)}</div><div className="l">Frais (Ar)</div></div>
      </div>
      <div className="card">
        <div className="row">
          <div className="field">
            <label>District</label>
            <select value={fd} onChange={e => { setFd(e.target.value); setFe(''); setPage(1) }}>
              <option value="">Tous</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Église</label>
            <select value={fe} onChange={e => reset(setFe)(e.target.value)}>
              <option value="">Toutes</option>
              {eglisesOfDist.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </div>
        </div>
        <input placeholder="🔍 Rechercher un nom…" value={q} onChange={e => reset(setQ)(e.target.value)} />

        {selected.size > 0 && (
          <div className="bulk-bar" style={{ marginTop: 12 }}>
            <span className="pager-info">{selected.size} sélectionné(s)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>Désélectionner</button>
              <button className="btn btn-danger btn-sm" onClick={delSelected}>🗑 Supprimer ({selected.size})</button>
            </div>
          </div>
        )}

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr>
              <th className="chk"><input type="checkbox" checked={allPageSel} onChange={togglePage} title="Sélectionner la page" /></th>
              <th>Nom</th><th>Catégorie</th><th>Église</th><th className="money">Frais</th><th className="act">Actions</th>
            </tr></thead>
            <tbody>
              {pageList.map(m => {
                const det = memberLine(m)
                return (
                  <tr key={m.id} className={selected.has(m.id) ? 'row-sel' : ''}>
                    <td className="chk"><input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSel(m.id)} /></td>
                    <td><div className="nm">{m.nom}</div>{det && <div className="sb">{det}</div>}</td>
                    <td><span className={'cat-pill ' + CAT_CLASS[m.categorie]}>{m.categorie}</span></td>
                    <td><span className="muted">{egName(m.eglise_id)}</span></td>
                    <td className="money">{fmt(m.frais)}</td>
                    <td className="act">
                      <button className="ic" title="Modifier" onClick={() => startEdit(m)}>✎</button>
                      <button className="ic del" title="Supprimer" onClick={() => delOne(m)}>🗑</button>
                    </td>
                  </tr>
                )
              })}
              {!list.length && <tr><td colSpan={6} className="tbl-empty">Aucun membre.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pager page={cur} pages={pages} total={list.length} label="inscrit(s)" onPage={setPage} />
      </div>

      {edit && (
        <div className="modal-bg" onClick={e => { if (e.target.classList.contains('modal-bg')) setEdit(null) }}>
          <div className="modal">
            <h2 style={{ marginTop: 0 }}>✎ Modifier le membre</h2>
            <div className="field"><label>Église</label>
              <select value={edit.eglise_id} onChange={e => eset('eglise_id', e.target.value)}>
                {eglises.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </div>
            <div className="field"><label>Catégorie</label>
              <select value={edit.categorie} onChange={e => setEdit(f => ({ ...f, categorie: e.target.value, kilasy: '' }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
              </select>
            </div>
            <div className="field"><label>Anarana sy fanampin'anarana</label>
              <input value={edit.nom} onChange={e => eset('nom', e.target.value)} />
            </div>
            <div className="row">
              {['Mpisavalalana', 'Mpisantatra', 'Encadreur'].includes(edit.categorie) &&
                <div className="field"><label>Daty nahaterahana</label>
                  <input type="date" value={edit.date_naissance} onChange={e => eset('date_naissance', e.target.value)} /></div>}
              <div className="field"><label>L/V</label>
                <select value={edit.sexe} onChange={e => eset('sexe', e.target.value)}>
                  <option value="L">Lahy (M)</option><option value="V">Vavy (F)</option>
                </select></div>
            </div>
            {['Mpisavalalana', 'Mpisantatra'].includes(edit.categorie) &&
              <div className="field"><label>Kilasim-pandrosoana</label>
                <select value={edit.kilasy} onChange={e => eset('kilasy', e.target.value)}>
                  <option value="">— choisir —</option>
                  {(KILASY[edit.categorie] || []).map(k => <option key={k.nom} value={k.nom}>{k.nom}{k.age ? ` — ${k.age} taona` : ''}</option>)}
                </select></div>}
            {edit.categorie === 'Mpisavalalana' &&
              <div className="field"><label className="check">
                <input type="checkbox" checked={edit.bapteme} onChange={e => eset('bapteme', e.target.checked)} />
                <span>Atao Batisa any @ Camporée</span></label></div>}
            {['Encadreur', 'Hafa'].includes(edit.categorie) &&
              <div className="field"><label>Contact</label>
                <input type="tel" value={edit.contact} onChange={e => eset('contact', e.target.value)} /></div>}
            {edit.categorie === 'Encadreur' &&
              <div className="field"><label>Marim-pandrosoana azo farany</label>
                <input value={edit.marim_pandrosoana} onChange={e => eset('marim_pandrosoana', e.target.value)} /></div>}
            {edit.categorie === 'Hafa' && <>
              <div className="field"><label>Andraikitra</label>
                <select value={edit.andraikitra} onChange={e => eset('andraikitra', e.target.value)}>
                  {ANDRAIKITRA.map(a => <option key={a} value={a}>{a}</option>)}
                </select></div>
              <div className="row">
                <div className="field"><label>Chef Guide / Totem</label>
                  <input value={edit.chef_guide} onChange={e => eset('chef_guide', e.target.value)} /></div>
                <div className="field"><label>Daty CG / Totem</label>
                  <input type="date" value={edit.date_cg} onChange={e => eset('date_cg', e.target.value)} /></div>
              </div>
            </>}
            <div className="row" style={{ gap: 8, marginTop: 6 }}>
              <button className="btn btn-green" onClick={saveEdit} style={{ flex: 1 }}>✓ Enregistrer</button>
              <button className="btn btn-ghost" onClick={() => setEdit(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
      <Toast msg={toast} onDone={() => setToast('')} />
    </>
  )
}
