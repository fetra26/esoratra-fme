import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { CAT_CLASS, fmt, nf } from '../../lib/constants'

export default function Listes() {
  const [eglises, setEglises] = useState([])
  const [membres, setMembres] = useState([])
  const [paiements, setPaiements] = useState([])

  const load = useCallback(async () => {
    const [{ data: e }, { data: m }, { data: p }] = await Promise.all([
      supabase.from('eglises').select('*').order('nom'),
      supabase.from('membres').select('*'),
      supabase.from('paiements').select('*')
    ])
    setEglises(e || []); setMembres(m || []); setPaiements(p || [])
  }, [])
  useEffect(() => { load() }, [load])

  const memOf = (id) => membres.filter(m => m.eglise_id === id)
  const fraisOf = (id) => memOf(id).reduce((s, m) => s + (m.frais || 0), 0)
  const payOf = (id) => paiements.find(p => p.eglise_id === id)

  const attendu = eglises.reduce((s, e) => s + fraisOf(e.id), 0)
  const encaisse = eglises.reduce((s, e) => s + (payOf(e.id)?.paye ? fraisOf(e.id) : 0), 0)

  return (
    <>
      <h1 className="page-h">Listes</h1>
      <div className="stats">
        <div className="stat"><div className="n">{eglises.length}</div><div className="l">Églises</div></div>
        <div className="stat"><div className="n">{membres.length}</div><div className="l">Inscrits</div></div>
        <div className="stat"><div className="n">{nf(attendu)}</div><div className="l">Attendu (Ar)</div></div>
        <div className="stat"><div className="n">{nf(encaisse)}</div><div className="l">Encaissé (Ar)</div></div>
      </div>
      {eglises.length ? eglises.map(e => {
        const ms = memOf(e.id)
        const c = { Mpisavalalana: 0, Mpisantatra: 0, Encadreur: 0, Hafa: 0 }
        ms.forEach(m => c[m.categorie]++)
        const p = payOf(e.id)
        return (
          <div className="card" key={e.id}>
            <h2><span>{e.nom}</span>
              <span className={p?.paye ? 'badge-ok' : 'badge-warn'}>{p?.paye ? '✓ Payé' : 'À encaisser'}</span></h2>
            <div style={{ marginBottom: 10 }}>
              {Object.entries(c).filter(([, n]) => n > 0).map(([k, n]) =>
                <span key={k} className={'cat-pill ' + CAT_CLASS[k]} style={{ marginRight: 4 }}>{n} {k}</span>)}
              {!ms.length && <span className="hint">Aucun membre</span>}
            </div>
            <div className="total-bar">
              <span className="tl">{ms.length} inscrit(s) · {p?.type || 'paiement non saisi'}</span>
              <span className="tv">{fmt(fraisOf(e.id))}</span>
            </div>
          </div>
        )
      }) : <div className="empty">Aucune église dans votre district.</div>}
    </>
  )
}
