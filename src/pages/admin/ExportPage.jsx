import { useState } from 'react'
import { fetchAllRows } from '../../lib/supabase'
import { exportParEglise, exportParDistrict, exportStaff } from '../../lib/exports'
import Toast from '../../components/Toast'

export default function ExportPage() {
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)

  async function fetchAll() {
    const [d, e, m] = await Promise.all([
      fetchAllRows('districts', '*', q => q.order('nom')),
      fetchAllRows('eglises', '*', q => q.order('nom')),
      fetchAllRows('membres', '*', q => q.order('nom'))
    ])
    return { districts: d, eglises: e, membres: m }
  }
  async function run(mode) {
    setBusy(true)
    try {
      let ok
      if (mode === 'staff') {
        const [staff, districts] = await Promise.all([
          fetchAllRows('staff', '*', q => q.order('nom')),
          fetchAllRows('districts', '*', q => q.order('nom'))
        ])
        ok = exportStaff(staff, districts)
      } else {
        const { districts, eglises, membres } = await fetchAll()
        ok = mode === 'eglise'
          ? exportParEglise(membres, eglises)
          : exportParDistrict(membres, eglises, districts)
      }
      setToast(ok ? 'Export Excel téléchargé' : 'Aucune donnée à exporter')
    } finally { setBusy(false) }
  }

  return (
    <>
      <h1 className="page-h">Export Excel</h1>
      <div className="card">
        <p className="hint" style={{ marginTop: 0, marginBottom: 14 }}>
          Génère un vrai classeur Excel <b>.xlsx</b> — inscrits (par église ou par district) ou staff.
          S'ouvre dans Excel, LibreOffice ou Google Sheets.
        </p>
        <button className="btn btn-green" disabled={busy} onClick={() => run('eglise')}>⬇ Inscrits — une feuille par église</button>
        <button className="btn btn-green" style={{ marginTop: 10 }} disabled={busy} onClick={() => run('district')}>⬇ Inscrits — une feuille par district</button>
        <button className="btn btn-primary" style={{ marginTop: 10 }} disabled={busy} onClick={() => run('staff')}>⬇ Staff Camporée</button>
      </div>
      <Toast msg={toast} onDone={() => setToast('')} />
    </>
  )
}
