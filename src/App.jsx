import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Pending from './pages/Pending'
import Structure from './pages/admin/Structure'
import Utilisateurs from './pages/admin/Utilisateurs'
import Membres from './pages/admin/Membres'
import ExportPage from './pages/admin/ExportPage'
import Badges from './pages/admin/Badges'
import Inscription from './pages/responsable/Inscription'
import Listes from './pages/responsable/Listes'
import Encadrement from './pages/responsable/Encadrement'

function Splash() {
  return <div className="splash">Chargement…</div>
}

function AuthErrorScreen({ message, onRetry, onSignOut }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">⚠️</div>
        <h1>Connexion interrompue</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '8px 0 20px' }}>
          Impossible de charger votre profil. Vérifiez votre connexion internet, puis réessayez.
        </p>
        {message && <div className="auth-err" style={{ marginBottom: 16 }}>{message}</div>}
        <button className="btn btn-green" onClick={onRetry}>Réessayer</button>
        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={onSignOut}>Se déconnecter</button>
      </div>
    </div>
  )
}

export default function App() {
  const { loading, session, role, authError, disabled, refreshProfile, signOut } = useAuth()
  if (loading) return <Splash />
  if (!session) return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
  // Session valide mais profil non chargé à cause d'une erreur (réseau/serveur) :
  // ne pas confondre avec « en attente ».
  if (authError) return <AuthErrorScreen message={authError} onRetry={refreshProfile} onSignOut={signOut} />
  if (disabled) return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">🚫</div>
        <h1>Compte désactivé</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '8px 0 20px' }}>
          Votre compte a été désactivé par un administrateur. Contactez le secrétariat de la Camporée.
        </p>
        <button className="btn btn-ghost" onClick={signOut}>Se déconnecter</button>
      </div>
    </div>
  )
  if (role === 'en_attente' || !role) return <Pending />

  return (
    <Layout>
      <Routes>
        {role === 'admin' && <>
          <Route path="/" element={<Navigate to="/structure" replace />} />
          <Route path="/structure" element={<Structure />} />
          <Route path="/utilisateurs" element={<Utilisateurs />} />
          <Route path="/membres" element={<Membres />} />
          <Route path="/export" element={<ExportPage />} />
          <Route path="/badges" element={<Badges />} />
        </>}
        {role === 'responsable' && <>
          <Route path="/" element={<Navigate to="/inscription" replace />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/listes" element={<Listes />} />
          <Route path="/encadrement" element={<Encadrement />} />
        </>}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
