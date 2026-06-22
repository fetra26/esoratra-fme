export const APP = {
  name: 'eSoratra FME'
}

export const EVENT = {
  nom: 'Camporée des Juniors — Manompana',
  dates: '09 – 16 août 2026',
  lieu: 'Manompana'
}

export const CATEGORIES = ['Mpisavalalana', 'Mpisantatra', 'Encadreur', 'Hafa']

export const CAT_LABEL = {
  Mpisavalalana: 'Mpisavalalana (Explorateur)',
  Mpisantatra: 'Mpisantatra (Aventurier)',
  Encadreur: 'Encadreur',
  Hafa: 'Hafa (Responsable)'
}

export const FRAIS = { Mpisavalalana: 20000, Mpisantatra: 15000, Encadreur: 20000, Hafa: 20000 }

export const ANDRAIKITRA = [
  'Cuisine / Mpahandro (C)', 'Intendant / Mpiantsena (I)', 'Infirmerie (Inf)',
  'Équipe Évangélisation (Ev)', 'Facilitateur (Fc)', 'Formateur (Fr)',
  'Chef Guide', 'Équipe Site (Si)', 'Équipe Sécurité (Sc)'
]

export const PAY_TYPES = ['Orange Money', 'Airtel Money', "M'VOLA"]

export const RATIO = { Mpisavalalana: 4, Mpisantatra: 2 }

export const CAT_CLASS = {
  Mpisavalalana: 'c-mpisav', Mpisantatra: 'c-mpisan', Encadreur: 'c-enc', Hafa: 'c-hafa'
}

export function genCode() {
  const a = 'ABCDEFGHJKLMNPRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 5; i++) s += a[Math.floor(Math.random() * a.length)]
  return s
}

export const nf = (n) => new Intl.NumberFormat('fr-FR').format(n || 0)
export const fmt = (n) => nf(n) + ' Ar'

export function memberLine(m) {
  const d = []
  if (m.date_naissance) d.push(m.date_naissance)
  if (m.sexe) d.push(m.sexe)
  if (m.kilasy) d.push(m.kilasy)
  if (m.bapteme) d.push('☆ Batisa')
  if (m.contact) d.push('📞 ' + m.contact)
  if (m.marim_pandrosoana) d.push(m.marim_pandrosoana)
  if (m.andraikitra) d.push(m.andraikitra)
  if (m.chef_guide) d.push('CG: ' + m.chef_guide)
  return d.join(' · ')
}
