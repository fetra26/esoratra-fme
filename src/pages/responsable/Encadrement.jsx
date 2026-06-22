import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { RATIO } from '../../lib/constants'

export default function Encadrement() {
  const [eglises, setEglises] = useState([])
  const [membres, setMembres] = useState([])

  const load = useCallback(async () => {
    const [{ data: e }, { data: m }] = await Promise.all([
      supabase.from('eglises').select('*').order('nom'),
      supabase.from('membres').select('*')
    ])
    setEglises(e || []); setMembres(m || [])
  }, [])
  useEffect(() => { load() }, [load])

  return (
    <>
      <h1 className="page-h">Encadrement</h1>
      <div className="card" style={{ marginBottom: 14 }}>
        <p className="hint" style={{ margin: 0 }}>
          Règle : <b>1 encadreur pour {RATIO.Mpisavalalana} Mpisavalalana</b> et
          <b> 1 encadreur pour {RATIO.Mpisantatra} Mpisantatra</b>.
        </p>
      </div>
      {eglises.length ? eglises.map(e => {
        const ms = membres.filter(m => m.eglise_id === e.id)
        const nMpisav = ms.filter(m => m.categorie === 'Mpisavalalana').length
        const nMpisan = ms.filter(m => m.categorie === 'Mpisantatra').length
        const nEnc = ms.filter(m => m.categorie === 'Encadreur').length
        const requis = Math.ceil(nMpisav / RATIO.Mpisavalalana) + Math.ceil(nMpisan / RATIO.Mpisantatra)
        const ok = nEnc >= requis
        return (
          <div className="ratio" key={e.id}>
            <div className="rh"><span className="re">{e.nom}</span>
              <span className={ok ? 'badge-ok' : 'badge-warn'}>
                {ok ? '✓ Suffisant' : 'Manque ' + (requis - nEnc)}</span></div>
            <div className="grid">
              <div className="g"><div className="v">{nMpisav}</div><div className="k">Mpisavalalana (÷{RATIO.Mpisavalalana})</div></div>
              <div className="g"><div className="v">{nMpisan}</div><div className="k">Mpisantatra (÷{RATIO.Mpisantatra})</div></div>
              <div className="g"><div className="v" style={{ color: ok ? 'var(--ok)' : 'var(--accent)' }}>{nEnc} / {requis}</div><div className="k">Encadreurs</div></div>
            </div>
          </div>
        )
      }) : <div className="empty">Aucune église dans votre district.</div>}
    </>
  )
}
