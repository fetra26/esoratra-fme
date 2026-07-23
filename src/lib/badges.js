import { EVENT } from './constants'

const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// Couleur par catégorie (tri visuel rapide au camp)
const CATCOLOR = {
  Mpisavalalana: '#0e7c66', // vert
  Mpisantatra: '#2563eb',   // bleu
  Encadreur: '#b45309',     // ambre
  Hafa: '#7c3aed',          // violet
  Staff: '#334155'          // ardoise
}

const BADGE_CSS = `
  *{box-sizing:border-box;margin:0;font-family:'Segoe UI',Arial,Helvetica,sans-serif;
    -webkit-print-color-adjust:exact;print-color-adjust:exact}
  body{padding:8mm;background:#e9edeb}
  .sheet{display:grid;grid-template-columns:repeat(2,1fr);gap:6mm;justify-items:center}
  .badge{width:92mm;height:86mm;border-radius:3mm;overflow:hidden;background:#fff;
    box-shadow:0 0 0 .25mm #cdd6d2;page-break-inside:avoid}
  .b-content{height:100%;display:flex;flex-direction:column;padding:4.5mm 5mm}
  .b-top{display:flex;justify-content:space-between;align-items:flex-start;gap:3mm}
  .b-brand{font-size:11pt;font-weight:800;color:#0a5e4d;line-height:1.1}
  .b-ev{display:block;font-size:7.5pt;font-weight:600;color:#8a948f;letter-spacing:.3px;margin-top:1px}
  .b-logo{height:13mm;width:auto;flex:none;object-fit:contain}
  .b-cat{align-self:flex-start;background:#fff;font-weight:800;font-size:9pt;text-transform:uppercase;
    letter-spacing:.6px;padding:1.1mm 3.2mm;border:1.3pt solid;border-radius:99mm;margin-top:2mm}
  .b-plabel{font-size:7.5pt;text-transform:uppercase;letter-spacing:1.2px;color:#9aa4a0;margin-top:3mm}
  .b-name{font-size:18pt;font-weight:800;color:#15201c;line-height:1.05;margin-top:.5mm}
  .b-rows{margin-top:3mm;display:flex;flex-direction:column;gap:2mm}
  .b-row{display:flex;align-items:baseline;gap:2.5mm;font-size:10.5pt}
  .b-row .k{flex:none;width:24mm;color:#5a6963;font-weight:700;text-transform:uppercase;
    font-size:7.5pt;letter-spacing:.5px}
  .b-row .v{color:#1f2b27;font-weight:600}
  .b-foot{margin-top:auto;padding-top:2.5mm;border-top:.3mm solid #e3e8e5;display:flex;
    justify-content:space-between;align-items:center;font-size:7.5pt;color:#8a948f}
  .b-code{font-family:'Courier New',monospace;font-weight:700;font-size:9.5pt;color:#0a5e4d;letter-spacing:1px}
  @media print{body{padding:0;background:#fff}.sheet{gap:4mm}@page{size:A4;margin:8mm}}`

function renderAndPrint(cards) {
  const w = window.open('', '_blank')
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Badges eSoratra FME</title>
  <style>${BADGE_CSS}</style></head><body><div class="sheet">${cards}</div>
  <script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`)
  w.document.close()
}

const logoUrl = () => location.origin + '/logo-badge.png'
const eventName = () => EVENT.nom.split('—')[0].trim()

function badgeCard(color, catLabel, plabel, nom, rows, code) {
  const rowsHtml = rows.map(([k, v]) =>
    `<div class="b-row"><span class="k">${esc(k)}</span><span class="v">${esc(v || '—')}</span></div>`).join('')
  return `<div class="badge" style="border-left:5mm solid ${color}">
    <div class="b-content">
      <div class="b-top">
        <div class="b-brand">⛺ eSoratra FME<span class="b-ev">${esc(eventName())}</span></div>
        <img class="b-logo" src="${logoUrl()}" alt="">
      </div>
      <div class="b-cat" style="border-color:${color};color:${color}">${esc(catLabel)}</div>
      <div class="b-plabel">${esc(plabel)}</div>
      <div class="b-name">${esc(nom)}</div>
      <div class="b-rows">${rowsHtml}</div>
      <div class="b-foot"><span>${esc(EVENT.dates)} · ${esc(EVENT.lieu)}</span><span class="b-code">${esc(code)}</span></div>
    </div>
  </div>`
}

export function printBadges(membres, { egById = {}, distByEglise = {} } = {}) {
  if (!membres.length) return false
  const cards = membres.map(m => badgeCard(
    CATCOLOR[m.categorie] || '#0e7c66', m.categorie, 'Participant', m.nom,
    [['Distrika', distByEglise[m.eglise_id]], ['Fiangonana', egById[m.eglise_id]], ['K.P', m.kilasy]],
    m.code || ''
  )).join('')
  renderAndPrint(cards)
  return true
}

export function printStaffBadges(staff) {
  if (!staff.length) return false
  const cards = staff.map(s => badgeCard(
    CATCOLOR.Staff, 'Staff', 'Ekipan\'ny Lasy', s.nom,
    [['Andraikitra', s.andraikitra], ['Finday', s.contact]],
    'STAFF'
  )).join('')
  renderAndPrint(cards)
  return true
}
