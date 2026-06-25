// Liste officielle des districts de la Camporée (FME).
export const DISTRICTS = [
  'Beryl Rose', 'Salazamay', 'Magarano', 'Brickaville', 'Mahanoro', 'Vatomandry',
  'Moramanga 1', 'Moramanga 2', 'Amboasary', "Anosibe an'Ala", 'Ambohimasina',
  'Antsahatanteraka', 'Tsinjoarivo', 'Ambodirano', 'Amparafa', 'Tanambe',
  'Andilamena', 'Fénérive-Est', 'Soanierana Ivongo', 'Sainte-Marie', 'Vavatenina',
  'Mananara I', 'Mananara II', 'Mananara III', 'Mananara IV',
  'Maroantsetra 1', 'Maroantsetra 2', 'Maroantsetra 3', 'Maroantsetra 4'
]

// Identifiant simplifié (sans accents/espaces) pour email & mot de passe.
export const slug = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')

export const emailForDistrict = (name) => `${slug(name)}.resp@esoratra.mg`
export const passwordForDistrict = (name) => `${slug(name)}FME2026`
