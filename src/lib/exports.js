const COLS = ['Code', 'Catégorie', 'Nom & prénoms', 'Date naiss.', 'L/V',
  'Kilasim-pandrosoana', 'À baptiser', 'Contact', 'Marim-pandrosoana',
  'Andraikitra', 'Chef Guide/Totem', 'Date CG/Totem', 'Frais (Ar)']

const xa = (s) => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function row(m, egliseNom) {
  const r = [m.code || '', m.categorie, m.nom, m.date_naissance || '', m.sexe || '',
    m.kilasy || '', m.bapteme ? 'Oui' : '', m.contact || '', m.marim_pandrosoana || '',
    m.andraikitra || '', m.chef_guide || '', m.date_cg || '', m.frais || 0]
  return egliseNom != null ? [egliseNom, ...r] : r
}

function buildXLS(sheets) {
  const used = {}
  let body = ''
  for (const s of sheets) {
    let name = (s.name || 'Feuille').replace(/[:\\/?*[\]]/g, ' ').slice(0, 31).trim() || 'Feuille'
    let base = name, i = 1
    while (used[name]) name = (base.slice(0, 27) + ' ' + (++i)).trim()
    used[name] = 1
    body += `<Worksheet ss:Name="${xa(name)}"><Table>`
    for (const [ri, r] of [s.headers, ...s.rows].entries()) {
      body += '<Row>'
      for (const c of r) {
        const num = ri > 0 && typeof c === 'number'
        body += `<Cell><Data ss:Type="${num ? 'Number' : 'String'}">${xa(String(c ?? ''))}</Data></Cell>`
      }
      body += '</Row>'
    }
    body += '</Table></Worksheet>'
  }
  return '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>' +
    '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
    'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
    'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">' + body + '</Workbook>'
}

function download(content, filename, type) {
  const blob = new Blob(['\uFEFF' + content], { type })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

export function exportParEglise(membres, eglises) {
  const sheets = eglises.map(e => ({
    name: e.nom, headers: COLS,
    rows: membres.filter(m => m.eglise_id === e.id).map(m => row(m, null))
  })).filter(s => s.rows.length)
  if (!sheets.length) return false
  download(buildXLS(sheets), 'camporee_par_eglise.xls', 'application/vnd.ms-excel')
  return true
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
  if (!sheets.length) return false
  download(buildXLS(sheets), 'camporee_par_district.xls', 'application/vnd.ms-excel')
  return true
}
