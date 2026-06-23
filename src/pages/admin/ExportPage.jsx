import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { exportParEglise, exportParDistrict } from '../../lib/exports'
import Toast from '../../components/Toast'

export default function ExportPage() {
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)

  async function fetchAll() {
    const [{ data: d }, { data: e }, { data: m }] = await Promise.all([
      supabase.from('districts').select('*').order('nom'),
      supabase.from('eglises').select('*').order('nom'),
      supabase.from('membres').select('*').order('nom')
    ])
    return { districts: d || [], eglises: e || [], membres: m || [] }
  }
  async function run(mode) {
    setBusy(true)
    try {
      const { districts, eglises, membres } = await fetchAll()
      const ok = mode === 'eglise'
        ? exportParEglise(membres, eglises)
        : exportParDistrict(membres, eglises, districts)
      setToast(ok ? 'Export Excel téléchargé' : 'Aucune donnée à exporter')
    } finally { setBusy(false) }
  }

  return (
    <>
      <h1 className="page-h">Export Excel</h1>
      <div className="card">
        <p className="hint" style={{ marginTop: 0, marginBottom: 14 }}>
          Génère un vrai classeur Excel <b>.xlsx</b> avec une feuille séparée par église ou par district.
          S'ouvre dans Excel, LibreOffice ou Google Sheets.
        </p>
        <button className="btn btn-green" disabled={busy} onClick={() => run('eglise')}>⬇ Une feuille par église</button>
        <button className="btn btn-green" style={{ marginTop: 10 }} disabled={busy} onClick={() => run('district')}>⬇ Une feuille par district</button>
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </>
  )
}
