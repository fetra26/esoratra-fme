import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import Toast from '../components/Toast'
import Pager from '../components/Pager'

const PAGE = 8
const norm = (s) => s.trim().toLowerCase()

export default function Kilasy() {
  const [list, setList] = useState([])
  const [nv, setNv] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [edit, setEdit] = useState(null)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('kilasy').select('*')
    setList((data || []).sort((a, b) => a.nom.localeCompare(b.nom, 'fr', { numeric: true })))
  }, [])
  useEffect(() => { load() }, [load])

  const filtered = list.filter(k => k.nom.toLowerCase().includes(q.trim().toLowerCase()))
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const cur = Math.min(page, pages)
  const pageList = filtered.slice((cur - 1) * PAGE, cur * PAGE)

  async function add() {
    const v = nv.trim(); if (!v) return
    if (list.some(k => norm(k.nom) === norm(v))) return setToast('Ce kilasy existe déjà.')
    const { error } = await supabase.from('kilasy').insert({ nom: v })
    if (error) return setToast('Erreur: ' + error.message)
    setNv(''); setToast('Kilasy ajouté'); load()
  }
  async function save() {
    const v = edit.val.trim(); if (!v) return setEdit(null)
    if (list.some(k => k.id !== edit.id && norm(k.nom) === norm(v))) return setToast('Ce nom existe déjà.')
    const { error } = await supabase.from('kilasy').update({ nom: v }).eq('id', edit.id)
    if (error) return setToast('Erreur: ' + error.message)
    setEdit(null); load()
  }
  async function del(id, nom) {
    if (!confirm(`Supprimer « ${nom} » ?`)) return
    await supabase.from('kilasy').delete().eq('id', id); setToast('Supprimé'); load()
  }

  return (
    <>
      <h1 className="page-h">Kilasim-pandrosoana</h1>
      <div className="card">
        <p className="hint" style={{ marginTop: 0 }}>
          Liste utilisée dans le menu déroulant du formulaire d'inscription (Mpisavalalana / Mpisantatra).
        </p>
        <div className="row">
          <div className="field" style={{ marginBottom: 0 }}>
            <input value={nv} onChange={e => setNv(e.target.value)} placeholder="Nom du kilasy"
              onKeyDown={e => e.key === 'Enter' && add()} />
          </div>
          <button className="btn btn-green btn-sm" onClick={add}>＋ Ajouter</button>
        </div>
        {list.length > PAGE && (
          <input className="tbl-search" value={q}
            onChange={e => { setQ(e.target.value); setPage(1) }} placeholder="🔎 Rechercher…" />
        )}
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Kilasim-pandrosoana <span className="count-badge">{list.length}</span></th><th className="act"></th></tr></thead>
            <tbody>
              {pageList.map(k => (
                <tr key={k.id}>
                  <td>
                    {edit?.id === k.id ? (
                      <input className="tbl-inp" autoFocus value={edit.val}
                        onChange={e => setEdit({ ...edit, val: e.target.value })}
                        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEdit(null) }} />
                    ) : k.nom}
                  </td>
                  <td className="act">
                    {edit?.id === k.id ? (
                      <>
                        <button className="ic ok" title="Enregistrer" onClick={save}>✓</button>
                        <button className="ic" title="Annuler" onClick={() => setEdit(null)}>✕</button>
                      </>
                    ) : (
                      <>
                        <button className="ic" title="Renommer" onClick={() => setEdit({ id: k.id, val: k.nom })}>✎</button>
                        <button className="ic del" title="Supprimer" onClick={() => del(k.id, k.nom)}>🗑</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={2} className="tbl-empty">Aucun kilasy.</td></tr>}
            </tbody>
          </table>
        </div>
        <Pager page={cur} pages={pages} total={filtered.length} label="kilasy" onPage={setPage} />
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </>
  )
}
