import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { CAT_CLASS, memberLine, fmt, nf } from '../../lib/constants'
import Pager from '../../components/Pager'

const PAGE = 15

export default function Membres() {
  const [districts, setDistricts] = useState([])
  const [eglises, setEglises] = useState([])
  const [membres, setMembres] = useState([])
  const [fd, setFd] = useState('')
  const [fe, setFe] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)

  const load = useCallback(async () => {
    const [{ data: d }, { data: e }, { data: m }] = await Promise.all([
      supabase.from('districts').select('*').order('nom'),
      supabase.from('eglises').select('*').order('nom'),
      supabase.from('membres').select('*').order('nom')
    ])
    setDistricts(d || []); setEglises(e || []); setMembres(m || [])
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

        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Nom</th><th>Catégorie</th><th>Église</th><th className="money">Frais</th></tr></thead>
            <tbody>
              {pageList.map(m => {
                const det = memberLine(m)
                return (
                  <tr key={m.id}>
                    <td><div className="nm">{m.nom}</div>{det && <div className="sb">{det}</div>}</td>
                    <td><span className={'cat-pill ' + CAT_CLASS[m.categorie]}>{m.categorie}</span></td>
                    <td><span className="muted">{egName(m.eglise_id)}</span></td>
                    <td className="money">{fmt(m.frais)}</td>
                  </tr>
                )
              })}
              {!list.length && <tr><td colSpan={4} className="tbl-empty">Aucun membre.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pager page={cur} pages={pages} total={list.length} label="inscrit(s)" onPage={setPage} />
      </div>
    </>
  )
}
