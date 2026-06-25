import { useEffect, useState, useCallback } from 'react'
import { fetchAllRows } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, CAT_CLASS, nf, fmt } from '../lib/constants'

export default function Dashboard() {
  const { role, districtId } = useAuth()
  const [districts, setDistricts] = useState([])
  const [eglises, setEglises] = useState([])
  const [membres, setMembres] = useState([])
  const [paiements, setPaiements] = useState([])

  const load = useCallback(async () => {
    // Les politiques RLS limitent déjà un responsable à son district.
    const [d, e, m, p] = await Promise.all([
      fetchAllRows('districts'),
      fetchAllRows('eglises'),
      fetchAllRows('membres'),
      fetchAllRows('paiements')
    ])
    setDistricts(d); setEglises(e); setMembres(m); setPaiements(p)
  }, [])
  useEffect(() => { load() }, [load])

  const byCat = Object.fromEntries(CATEGORIES.map(c => [c, membres.filter(m => m.categorie === c).length]))
  const totalFrais = membres.reduce((s, m) => s + (m.frais || 0), 0)
  const totalPaye = paiements.filter(p => p.paye).reduce((s, p) => s + (p.montant || 0), 0)
  const reste = Math.max(0, totalFrais - totalPaye)
  const nbEnc = byCat['Encadreur'] || 0
  const besoinEnc = Math.ceil((byCat['Mpisavalalana'] || 0) / 4) + Math.ceil((byCat['Mpisantatra'] || 0) / 2)
  const encOk = nbEnc >= besoinEnc
  const maxCat = Math.max(1, ...CATEGORIES.map(c => byCat[c]))

  const myDistrict = districts.find(d => d.id === districtId)?.nom
  const titre = role === 'admin' ? 'Tableau de bord — Fédération' : `Tableau de bord — ${myDistrict || 'Mon district'}`

  const distRows = districts.map(d => {
    const egIds = eglises.filter(e => e.district_id === d.id).map(e => e.id)
    const ms = membres.filter(m => egIds.includes(m.eglise_id))
    return { id: d.id, nom: d.nom, eglises: egIds.length, inscrits: ms.length, frais: ms.reduce((s, m) => s + (m.frais || 0), 0) }
  }).filter(r => role === 'admin' || r.inscrits > 0 || r.eglises > 0)
    .sort((a, b) => b.inscrits - a.inscrits)

  return (
    <>
      <h1 className="page-h">{titre}</h1>

      <div className="stats">
        {role === 'admin' && <div className="stat"><div className="n">{districts.length}</div><div className="l">Districts</div></div>}
        <div className="stat"><div className="n">{eglises.length}</div><div className="l">Églises</div></div>
        <div className="stat"><div className="n">{membres.length}</div><div className="l">Inscrits</div></div>
        <div className="stat"><div className="n">{nf(totalFrais)}</div><div className="l">Frais (Ar)</div></div>
        <div className="stat"><div className="n">{nf(totalPaye)}</div><div className="l">Payé (Ar)</div></div>
        <div className="stat"><div className="n">{nf(reste)}</div><div className="l">Reste (Ar)</div></div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Par catégorie</h2>
          {membres.length ? CATEGORIES.map(c => (
            <div className="bar-row" key={c}>
              <span className={'cat-pill ' + CAT_CLASS[c]}>{c}</span>
              <div className="bar"><div className="bar-fill" style={{ width: (byCat[c] / maxCat * 100) + '%' }} /></div>
              <span className="bar-n">{byCat[c]}</span>
            </div>
          )) : <div className="empty">Aucun inscrit.</div>}
          <p className="hint" style={{ marginBottom: 0 }} title="Mpisavalalana / Mpisantatra (Encadreur + Hafa exclus)">
            {byCat['Mpisavalalana']} Mpisavalalana · {byCat['Mpisantatra']} Mpisantatra
          </p>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Encadrement</h2>
          <div className={'dash-ratio ' + (encOk ? 'ok' : 'ko')}>
            <div className="dash-ratio-n">{nbEnc} / {besoinEnc}</div>
            <div className="dash-ratio-l">Encadreurs présents / requis</div>
          </div>
          <p className="hint" style={{ marginBottom: 0 }}>
            Règle : 1 encadreur pour 4 Mpisavalalana et 1 pour 2 Mpisantatra.
            {encOk ? ' ✅ Quota atteint.' : ` ⚠️ Il manque ${besoinEnc - nbEnc} encadreur(s).`}
          </p>
        </div>
      </div>

      {role === 'admin' && (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Par district</h2>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>District</th><th className="num">Églises</th><th className="num">Inscrits</th><th className="money">Frais</th></tr></thead>
              <tbody>
                {distRows.map(r => (
                  <tr key={r.id}>
                    <td>{r.nom}</td>
                    <td className="num">{r.eglises}</td>
                    <td className="num">{r.inscrits}</td>
                    <td className="money">{fmt(r.frais)}</td>
                  </tr>
                ))}
                {!distRows.length && <tr><td colSpan={4} className="tbl-empty">Aucune donnée.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
