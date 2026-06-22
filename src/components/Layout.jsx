import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP } from '../lib/constants'

const NAVS = {
  admin: [
    ['/structure', '🏛️', 'Structure'],
    ['/utilisateurs', '👤', 'Comptes'],
    ['/membres', '👥', 'Membres'],
    ['/export', '⬇️', 'Export'],
    ['/badges', '🪪', 'Badges']
  ],
  responsable: [
    ['/inscription', '📝', 'Inscription'],
    ['/listes', '📋', 'Listes'],
    ['/encadrement', '🧭', 'Encadrement']
  ]
}

export default function Layout({ children }) {
  const { role, profile, signOut } = useAuth()
  const items = NAVS[role] || []
  return (
    <>
      <header className="topbar">
        <div className="mark">⛺</div>
        <div className="title">{APP.name}
          <small>{role === 'admin' ? 'Admin fédération' : 'Responsable district'} · {profile?.email}</small>
        </div>
        <button className="out" onClick={signOut}>Quitter</button>
      </header>
      <main className="wrap">{children}</main>
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
