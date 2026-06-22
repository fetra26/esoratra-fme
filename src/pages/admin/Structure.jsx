import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import Toast from '../../components/Toast'
import Pager from '../../components/Pager'

const PAGE = 8
const norm = (s) => s.trim().toLowerCase()
const byNat = (a, b) => a.nom.localeCompare(b.nom, 'fr', { numeric: true })

export default function Structure() {
  const [districts, setDistricts] = useState([])
  const [eglises, setEglises] = useState([])
  const [nd, setNd] = useState('')
  const [ne, setNe] = useState('')
  const [ed, setEd] = useState('')          // district cible pour l'ajout d'église
  const [q, setQ] = useState('')            // recherche districts
  const [qe, setQe] = useState('')          // recherche églises
  const [fe, setFe] = useState('')          // filtre églises par district ('' = tous)
  const [pageD, setPageD] = useState(1)
  const [pageE, setPageE] = useState(1)
  const [editD, setEditD] = useState(null)  // { id, val }
  const [editE, setEditE] = useState(null)  // { id, val, district_id }
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    const [{ data: d }, { data: e }] = await Promise.all([
      supabase.from('districts').select('*').order('nom'),
      supabase.from('eglises').select('*').order('nom')
    ])
    setDistricts((d || []).sort(byNat)); setEglises((e || []).sort(byNat))
    if ((d || []).length && !ed) setEd(d[0].id)
  }, [ed])
  useEffect(() => { load() }, [load])

  const count = (did) => eglises.filter(e => e.district_id === did).length
  const dname = (id) => districts.find(d => d.id === id)?.nom || '—'

  const districtsF = districts.filter(d => d.nom.toLowerCase().includes(q.trim().toLowerCase()))
  const eglisesF = eglises.filter(e =>
    (!fe || e.district_id === fe) && e.nom.toLowerCase().includes(qe.trim().toLowerCase()))

  const pagesD = Math.max(1, Math.ceil(districtsF.length / PAGE))
  const pagesE = Math.max(1, Math.ceil(eglisesF.length / PAGE))
  const curD = Math.min(pageD, pagesD)
  const curE = Math.min(pageE, pagesE)
  const districtsP = districtsF.slice((curD - 1) * PAGE, curD * PAGE)
  const eglisesP = eglisesF.slice((curE - 1) * PAGE, curE * PAGE)

  async function addDistrict() {
    const v = nd.trim(); if (!v) return
    if (districts.some(d => norm(d.nom) === norm(v))) return setToast('Ce district existe déjà.')
    const { error } = await supabase.from('districts').insert({ nom: v })
    if (error) return setToast('Erreur: ' + error.message)
    setNd(''); setToast('District ajouté'); load()
  }
  async function saveDistrict() {
    const v = editD.val.trim(); if (!v) return setEditD(null)
    if (districts.some(d => d.id !== editD.id && norm(d.nom) === norm(v)))
      return setToast('Un district porte déjà ce nom.')
    const { error } = await supabase.from('districts').update({ nom: v }).eq('id', editD.id)
    if (error) return setToast('Erreur: ' + error.message)
    setEditD(null); load()
  }
  async function delDistrict(id, nom) {
    if (!confirm(`Supprimer le district « ${nom} » et toutes ses églises ?`)) return
    await supabase.from('districts').delete().eq('id', id); setToast('District supprimé'); load()
  }

  async function addEglise() {
    if (!ed) return setToast("Créez d'abord un district")
    const v = ne.trim(); if (!v) return
    if (eglises.some(e => e.district_id === ed && norm(e.nom) === norm(v)))
      return setToast('Cette église existe déjà dans ce district.')
    const { error } = await supabase.from('eglises').insert({ nom: v, district_id: ed })
    if (error) return setToast('Erreur: ' + error.message)
    setNe(''); setToast('Église ajoutée'); load()
  }
  async function saveEglise() {
    const v = editE.val.trim(); if (!v) return setEditE(null)
    if (eglises.some(e => e.id !== editE.id && e.district_id === editE.district_id && norm(e.nom) === norm(v)))
      return setToast('Une église porte déjà ce nom dans ce district.')
    const { error } = await supabase.from('eglises')
      .update({ nom: v, district_id: editE.district_id }).eq('id', editE.id)
    if (error) return setToast('Erreur: ' + error.message)
    setEditE(null); load()
  }
  async function delEglise(id, nom) {
    if (!confirm(`Supprimer l'église « ${nom} » et ses membres ?`)) return
    await supabase.from('eglises').delete().eq('id', id); setToast('Église supprimée'); load()
  }

  return (
    <>
      <h1 className="page-h">Structure</h1>

      <div className="cols-2">
        {/* ---------- DISTRICTS ---------- */}
        <div className="card">
          <h2>Districts <span className="count-badge">{districts.length}</span></h2>
          <div className="row">
            <div className="field" style={{ marginBottom: 0 }}>
              <input value={nd} onChange={e => setNd(e.target.value)} placeholder="Nom du district"
                onKeyDown={e => e.key === 'Enter' && addDistrict()} />
            </div>
            <button className="btn btn-green btn-sm" onClick={addDistrict}>＋</button>
          </div>
          {districts.length > PAGE && (
            <input className="tbl-search" value={q}
              onChange={e => { setQ(e.target.value); setPageD(1) }}
              placeholder="🔎 Rechercher un district…" />
          )}
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Nom</th><th className="num">Égl.</th><th className="act"></th></tr></thead>
              <tbody>
                {districtsP.map(d => (
                  <tr key={d.id}>
                    <td>
                      {editD?.id === d.id ? (
                        <input className="tbl-inp" autoFocus value={editD.val}
                          onChange={e => setEditD({ ...editD, val: e.target.value })}
                          onKeyDown={e => { if (e.key === 'Enter') saveDistrict(); if (e.key === 'Escape') setEditD(null) }} />
                      ) : d.nom}
                    </td>
                    <td className="num">{count(d.id)}</td>
                    <td className="act">
                      {editD?.id === d.id ? (
                        <>
                          <button className="ic ok" title="Enregistrer" onClick={saveDistrict}>✓</button>
                          <button className="ic" title="Annuler" onClick={() => setEditD(null)}>✕</button>
                        </>
                      ) : (
                        <>
                          <button className="ic" title="Renommer" onClick={() => setEditD({ id: d.id, val: d.nom })}>✎</button>
                          <button className="ic del" title="Supprimer" onClick={() => delDistrict(d.id, d.nom)}>🗑</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {!districtsF.length && <tr><td colSpan={3} className="tbl-empty">Aucun district.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pager page={curD} pages={pagesD} total={districtsF.length} label="district(s)" onPage={setPageD} />
        </div>

        {/* ---------- ÉGLISES ---------- */}
        <div className="card">
          <h2>Églises <span className="count-badge">{eglises.length}</span></h2>
          <div className="field" style={{ marginBottom: 8 }}>
            <select value={ed} onChange={e => setEd(e.target.value)}>
              {districts.length ? districts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)
                : <option value="">— créez un district —</option>}
            </select>
          </div>
          <div className="row">
            <div className="field" style={{ marginBottom: 0 }}>
              <input value={ne} onChange={e => setNe(e.target.value)} placeholder="Nom de l'église"
                onKeyDown={e => e.key === 'Enter' && addEglise()} />
            </div>
            <button className="btn btn-green btn-sm" onClick={addEglise}>＋</button>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <select value={fe} onChange={e => { setFe(e.target.value); setPageE(1) }}>
                <option value="">Tous districts</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
              </select>
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <input value={qe} onChange={e => { setQe(e.target.value); setPageE(1) }} placeholder="🔎 Église…" />
            </div>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Église</th><th>District</th><th className="act"></th></tr></thead>
              <tbody>
                {eglisesP.map(e => (
                  <tr key={e.id}>
                    <td>
                      {editE?.id === e.id ? (
                        <input className="tbl-inp" autoFocus value={editE.val}
                          onChange={ev => setEditE({ ...editE, val: ev.target.value })}
                          onKeyDown={ev => { if (ev.key === 'Enter') saveEglise(); if (ev.key === 'Escape') setEditE(null) }} />
                      ) : e.nom}
                    </td>
                    <td>
                      {editE?.id === e.id ? (
                        <select value={editE.district_id}
                          onChange={ev => setEditE({ ...editE, district_id: ev.target.value })}>
                          {districts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                        </select>
                      ) : <span className="muted">{dname(e.district_id)}</span>}
                    </td>
                    <td className="act">
                      {editE?.id === e.id ? (
                        <>
                          <button className="ic ok" title="Enregistrer" onClick={saveEglise}>✓</button>
                          <button className="ic" title="Annuler" onClick={() => setEditE(null)}>✕</button>
                        </>
                      ) : (
                        <>
                          <button className="ic" title="Modifier" onClick={() => setEditE({ id: e.id, val: e.nom, district_id: e.district_id })}>✎</button>
                          <button className="ic del" title="Supprimer" onClick={() => delEglise(e.id, e.nom)}>🗑</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {!eglisesF.length && <tr><td colSpan={3} className="tbl-empty">Aucune église.</td></tr>}
              </tbody>
            </table>
          </div>
          <Pager page={curE} pages={pagesE} total={eglisesF.length} label="église(s)" onPage={setPageE} />
        </div>
      </div>

      <Toast msg={toast} onDone={() => setToast('')} />
    </>
  )
}
