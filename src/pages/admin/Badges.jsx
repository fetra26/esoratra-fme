import { useEffect, useState, useCallback } from 'react'
import { fetchAllRows } from '../../lib/supabase'
import { printBadges } from '../../lib/badges'
import { CAT_CLASS } from '../../lib/constants'
import Toast from '../../components/Toast'

export default function Badges() {
  const [districts, setDistricts] = useState([])
  const [eglises, setEglises] = useState([])
  const [membres, setMembres] = useState([])
  const [fd, setFd] = useState('')
  const [fe, setFe] = useState('')
  const [preview, setPreview] = useState([])
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

  const egById = Object.fromEntries(eglises.map(e => [e.id, e.nom]))
  const distById = Object.fromEntries(districts.map(d => [d.id, d.nom]))
  const distByEglise = Object.fromEntries(eglises.map(e => [e.id, distById[e.district_id] || '']))
  const eglisesOfDist = fd ? eglises.filter(e => e.district_id === fd) : eglises

  function scope() {
    let list = membres
    if (fe) list = list.filter(m => m.eglise_id === fe)
    else if (fd) { const ids = eglisesOfDist.map(e => e.id); list = list.filter(m => ids.includes(m.eglise_id)) }
    return list
  }

  function doPreview() {
    const list = scope().slice(0, 24)
    setPreview(list)
    if (!list.length) setToast('Aucun membre dans cette sélection')
  }
  async function doPrint() {
    const list = scope()
    if (!list.length) return setToast('Aucun membre à imprimer')
    await printBadges(list, { egById, distByEglise })
  }

  return (
    <>
      <h1 className="page-h">Badges</h1>
      <div className="card">
        <div className="row">
          <div className="field"><label>District</label>
            <select value={fd} onChange={e => { setFd(e.target.value); setFe('') }}>
              <option value="">Tous</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
            </select>
          </div>
          <div className="field"><label>Église</label>
            <select value={fe} onChange={e => setFe(e.target.value)}>
              <option value="">Toutes</option>
              {eglisesOfDist.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn-green btn-sm" onClick={doPreview}>Aperçu</button>
          <button className="btn btn-primary btn-sm" onClick={doPrint}>🖨 Imprimer (A4)</button>
        </div>
      </div>
      {preview.length > 0 && (
        <div className="card">
          <h2>Aperçu ({preview.length})</h2>
          {preview.map(m => (
            <div className="bdg" key={m.id}>
              <div>
                <span className={'cat-pill ' + CAT_CLASS[m.categorie]}>{m.categorie}</span>
                <div className="bn">{m.nom}</div>
                <div className="be">
                  Distrika : {distByEglise[m.eglise_id] || '—'} · Fiangonana : {egById[m.eglise_id] || '—'}
                  {m.kilasy ? ' · K.P : ' + m.kilasy : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Toast msg={toast} onDone={() => setToast('')} />
    </>
  )
}
