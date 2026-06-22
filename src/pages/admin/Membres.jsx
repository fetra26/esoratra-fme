import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { CAT_CLASS, memberLine, fmt, nf } from '../../lib/constants'

export default function Membres() {
  const [districts, setDistricts] = useState([])
  const [eglises, setEglises] = useState([])
  const [membres, setMembres] = useState([])
  const [fd, setFd] = useState('')
  const [fe, setFe] = useState('')
  const [q, setQ] = useState('')

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
  if (q) list = list.filter(m => m.nom.toLowerCase().includes(q.toLowerCase()))

  const attendu = membres.reduce((s, m) => s + (m.frais || 0), 0)

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
            <select value={fd} onChange={e => { setFd(e.target.value); setFe('') }}>
              <option value="">Tous</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Église</label>
            <select value={fe} onChange={e => setFe(e.target.value)}>
              <option value="">Toutes</option>
              {eglisesOfDist.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </div>
        </div>
        <input placeholder="🔍 Rechercher un nom…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      {list.length ? list.map(m => (
        <div className="item" key={m.id}>
          <div>
            <span className={'cat-pill ' + CAT_CLASS[m.categorie]}>{m.categorie}</span>
            <div className="nm">{m.nom}</div>
            <div className="sb">{egName(m.eglise_id)} · {memberLine(m)}</div>
          </div>
          <div className="rt"><span className="sb">{fmt(m.frais)}</span></div>
        </div>
      )) : <div className="empty">Aucun membre.</div>}
    </>
  )
}
