import * as XLSX from 'xlsx'

const COLS = ['Code', 'Catégorie', 'Nom & prénoms', 'Date naiss.', 'L/V',
  'Kilasim-pandrosoana', 'À baptiser', 'Contact', 'Marim-pandrosoana',
  'Andraikitra', 'Chef Guide/Totem', 'Date CG/Totem', 'Frais (Ar)']

function row(m, egliseNom) {
  const r = [m.code || '', m.categorie, m.nom, m.date_naissance || '', m.sexe || '',
    m.kilasy || '', m.bapteme ? 'Oui' : '', m.contact || '', m.marim_pandrosoana || '',
    m.andraikitra || '', m.chef_guide || '', m.date_cg || '', m.frais || 0]
  return egliseNom != null ? [egliseNom, ...r] : r
}

// Noms de feuilles uniques et valides (Excel : max 31 car., pas de : \ / ? * [ ])
function sheetName(name, used) {
  let n = (name || 'Feuille').replace(/[:\\/?*[\]]/g, ' ').slice(0, 31).trim() || 'Feuille'
  const base = n
  let i = 1
  while (used.has(n)) n = (base.slice(0, 27) + ' ' + (++i)).trim()
  used.add(n)
  return n
}

function buildAndSave(sheets, filename) {
  if (!sheets.length) return false
  const wb = XLSX.utils.book_new()
  const used = new Set()
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([s.headers, ...s.rows])
    XLSX.utils.book_append_sheet(wb, ws, sheetName(s.name, used))
  }
  XLSX.writeFile(wb, filename)
  return true
}

export function exportParEglise(membres, eglises) {
  const sheets = eglises.map(e => ({
    name: e.nom, headers: COLS,
    rows: membres.filter(m => m.eglise_id === e.id).map(m => row(m, null))
  })).filter(s => s.rows.length)
  return buildAndSave(sheets, 'camporee_par_eglise.xlsx')
}

export function exportParDistrict(membres, eglises, districts) {
  const egById = Object.fromEntries(eglises.map(e => [e.id, e]))
  const sheets = districts.map(d => {
    const eids = eglises.filter(e => e.district_id === d.id).map(e => e.id)
    const ms = membres.filter(m => eids.includes(m.eglise_id))
    return {
      name: d.nom, headers: ['Église', ...COLS],
      rows: ms.map(m => row(m, egById[m.eglise_id]?.nom || ''))
    }
  }).filter(s => s.rows.length)
  return buildAndSave(sheets, 'camporee_par_district.xlsx')
}
