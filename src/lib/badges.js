const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// Charge un fichier (le logo) en data URL pour une impression fiable (image garantie chargée).
async function toDataUrl(url) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return await new Promise((r) => {
      const fr = new FileReader()
      fr.onload = () => r(fr.result)
      fr.onerror = () => r('')
      fr.readAsDataURL(blob)
    })
  } catch { return '' }
}

export async function printBadges(membres, { egById = {}, distByEglise = {} } = {}) {
  if (!membres.length) return false
  const logo = await toDataUrl(location.origin + '/image.png')

  const cards = membres.map(m => `<div class="badge">
    <div class="b-top" style="background-image:linear-gradient(180deg,rgba(8,40,32,.15),rgba(8,40,32,.92)),url('${logo}')">
      <div class="b-brand"><span class="b-mark">⛺</span> eSoratra FME</div>
      <div class="b-cat">${esc(m.categorie)}</div>
    </div>
    <div class="b-body">
      <div class="b-name">${esc(m.nom)}</div>
      <div class="b-rows">
        <div class="b-row"><span class="k">Distrika</span><span class="v">${esc(distByEglise[m.eglise_id] || '—')}</span></div>
        <div class="b-row"><span class="k">Fiangonana</span><span class="v">${esc(egById[m.eglise_id] || '—')}</span></div>
        <div class="b-row"><span class="k">K.P</span><span class="v">${esc(m.kilasy || '—')}</span></div>
      </div>
    </div>
  </div>`).join('')

  const w = window.open('', '_blank')
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Badges eSoratra FME</title><style>
    *{box-sizing:border-box;margin:0;font-family:Arial,Helvetica,sans-serif}
    body{padding:8mm;background:#eee}
    /* 6 badges par page A4 : 2 colonnes x 3 lignes */
    .sheet{display:grid;grid-template-columns:repeat(2,1fr);gap:6mm;justify-items:center}
    .badge{width:92mm;height:86mm;border-radius:4mm;overflow:hidden;background:#fff;
      box-shadow:0 0 0 .3mm #0a5e4d;display:flex;flex-direction:column;page-break-inside:avoid}
    .b-top{height:34mm;background-size:cover;background-position:center;
      color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:4mm}
    .b-brand{font-size:10pt;font-weight:bold;letter-spacing:.5px;text-shadow:0 1px 3px rgba(0,0,0,.6)}
    .b-mark{font-size:12pt}
    .b-cat{align-self:flex-start;background:#c79a3c;color:#3a2c08;font-weight:bold;font-size:10pt;
      text-transform:uppercase;letter-spacing:.5px;padding:1.5mm 3.5mm;border-radius:2mm;
      box-shadow:0 1mm 2mm rgba(0,0,0,.3)}
    .b-body{flex:1;padding:5mm;display:flex;flex-direction:column}
    .b-name{font-size:19pt;font-weight:bold;color:#16241f;line-height:1.1;margin-bottom:3.5mm;
      border-bottom:.4mm solid #e3e8e5;padding-bottom:3mm}
    .b-rows{display:flex;flex-direction:column;gap:2.5mm}
    .b-row{display:flex;align-items:baseline;gap:3mm;font-size:11pt}
    .b-row .k{flex:none;width:26mm;color:#0e7c66;font-weight:bold;text-transform:uppercase;font-size:8.5pt;letter-spacing:.5px}
    .b-row .v{color:#26332e;font-weight:600}
    @media print{body{padding:0;background:#fff}.sheet{gap:4mm}@page{size:A4;margin:8mm}}
  </style></head><body><div class="sheet">${cards}</div>
  <script>window.onload=function(){setTimeout(function(){window.print()},400)}<\/script></body></html>`)
  w.document.close()
  return true
}
