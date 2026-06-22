import { useAuth } from '../context/AuthContext'

export default function Pending() {
  const { profile, signOut, refreshProfile } = useAuth()
  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">⏳</div>
        <h1>Compte en attente</h1>
        <p className="sub">{profile?.email}</p>
        <p style={{ fontSize: 14, color: 'var(--muted)', margin: '8px 0 20px' }}>
          Votre compte est créé. Un administrateur de la fédération doit vous attribuer
          un rôle et votre district avant que vous puissiez accéder à l'application.
        </p>
        <button className="btn btn-green" onClick={refreshProfile}>Vérifier à nouveau</button>
        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={signOut}>Se déconnecter</button>
      </div>
    </div>
  )
}
