import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import Toast from '../../components/Toast'

export default function Structure() {
  const [districts, setDistricts] = useState([])
  const [eglises, setEglises] = useState([])
  const [nd, setNd] = useState('')
  const [ne, setNe] = useState('')
  const [ed, setEd] = useState('')
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    const [{ data: d }, { data: e }] = await Promise.all([
      supabase.from('districts').select('*').order('nom'),
      supabase.from('eglises').select('*').order('nom')
    ])
    setDistricts(d || []); setEglises(e || [])
    if ((d || []).length && !ed) setEd(d[0].id)
  }, [ed])
  useEffect(() => { load() }, [load])

  const count = (did) => eglises.filter(e => e.district_id === did).length
  const mcount = () => 0

  async function addDistrict() {
    if (!nd.trim()) return
    const { error } = await supabase.from('districts').insert({ nom: nd.trim() })
    if (error) return setToast('Erreur: ' + error.message)
    setNd(''); setToast('District ajouté'); load()
  }
  async function delDistrict(id) {
    if (!confirm('Supprimer ce district et ses églises ?')) return
    await supabase.from('districts').delete().eq('id', id); setToast('Supprimé'); load()
  }
  async function renameDistrict(id, cur) {
    const n = prompt('Nom du district :', cur); if (!n?.trim()) return
    await supabase.from('districts').update({ nom: n.trim() }).eq('id', id); load()
  }
  async function addEglise() {
    if (!ed) return setToast("Créez d'abord un district")
    if (!ne.trim()) return
    const { error } = await supabase.from('eglises').insert({ nom: ne.trim(), district_id: ed })
    if (error) return setToast('Erreur: ' + error.message)
    setNe(''); setToast('Église ajoutée'); load()
  }
  async function delEglise(id) {
    if (!confirm('Supprimer cette église et ses membres ?')) return
    await supabase.from('eglises').delete().eq('id', id); setToast('Supprimée'); load()
  }
  async function renameEglise(id, cur) {
    const n = prompt("Nom de l'église :", cur); if (!n?.trim()) return
    await supabase.from('eglises').update({ nom: n.trim() }).eq('id', id); load()
  }
  const dname = (id) => districts.find(d => d.id === id)?.nom || '—'

  return (
    <>
      <h1 className="page-h">Structure</h1>
      <div className="card">
        <h2>Districts</h2>
        <div className="row">
          <div className="field" style={{ marginBottom: 0 }}>
            <input value={nd} onChange={e => setNd(e.target.value)} placeholder="Nom du district" />
          </div>
          <button className="btn btn-green btn-sm" onClick={addDistrict}>＋</button>
        </div>
        <div style={{ marginTop: 12 }}>
          {districts.length ? districts.map(d => (
            <div className="item" key={d.id}>
              <div><div className="nm">{d.nom}</div><div className="sb">{count(d.id)} église(s)</div></div>
              <div className="rt">
                <button className="edit" onClick={() => renameDistrict(d.id, d.nom)}>✎</button>
                <button className="x" onClick={() => delDistrict(d.id)}>×</button>
              </div>
            </div>
          )) : <div className="empty">Aucun district.</div>}
        </div>
      </div>

      <div className="card">
        <h2>Églises</h2>
        <div className="field">
          <label>District</label>
          <select value={ed} onChange={e => setEd(e.target.value)}>
            {districts.length ? districts.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)
              : <option value="">— créez un district —</option>}
          </select>
        </div>
        <div className="row">
          <div className="field" style={{ marginBottom: 0 }}>
            <input value={ne} onChange={e => setNe(e.target.value)} placeholder="Nom de l'église (Fiangonana)" />
          </div>
          <button className="btn btn-green btn-sm" onClick={addEglise}>＋</button>
        </div>
        <div style={{ marginTop: 12 }}>
          {eglises.length ? eglises.map(e => (
            <div className="item" key={e.id}>
              <div><div className="nm">{e.nom}</div><div className="sb">{dname(e.district_id)}</div></div>
              <div className="rt">
                <button className="edit" onClick={() => renameEglise(e.id, e.nom)}>✎</button>
                <button className="x" onClick={() => delEglise(e.id)}>×</button>
              </div>
            </div>
          )) : <div className="empty">Aucune église.</div>}
        </div>
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </>
  )
}
