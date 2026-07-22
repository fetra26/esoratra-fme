import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP } from '../lib/constants'

// Pages à large mise en page (tables côte à côte / tableau de bord)
const WIDE = ['/dashboard', '/structure', '/utilisateurs', '/membres']

const NAVS = {
  admin: [
    ['/dashboard', '📊', 'Tableau'],
    ['/structure', '🏛️', 'Structure'],
    ['/utilisateurs', '👤', 'Comptes'],
    ['/membres', '👥', 'Membres'],
    // ['/kilasy', '🎓', 'Kilasy'],  // désactivé : kilasy désormais fixe par catégorie
    ['/export', '⬇️', 'Export'],
    ['/badges', '🪪', 'Badges']
  ],
  responsable: [
    ['/dashboard', '📊', 'Tableau'],
    ['/inscription', '📝', 'Inscription'],
    ['/staff', '🛠️', 'Staff'],
    ['/listes', '📋', 'Listes'],
    // ['/kilasy', '🎓', 'Kilasy'],  // désactivé : kilasy désormais fixe par catégorie
    ['/encadrement', '🧭', 'Encadrement']
  ]
}

export default function Layout({ children }) {
  const { role, profile, signOut } = useAuth()
  const { pathname } = useLocation()
  const items = NAVS[role] || []
  const wide = WIDE.some(p => pathname.startsWith(p))
  return (
    <>
      <header className="topbar">
        <div className="mark">⛺</div>
        <div className="title">{APP.name}
          <small>{role === 'admin' ? 'Admin fédération' : 'Responsable district'} · {profile?.email}</small>
        </div>
        <button className="out" onClick={signOut}>Quitter</button>
      </header>
      <main className={'wrap' + (wide ? ' wrap-wide' : '')}>{children}</main>
      <nav className="nav">
        {items.map(([to, ico, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="ico">{ico}</span>{label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
