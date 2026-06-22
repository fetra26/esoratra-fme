import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { EVENT } from '../lib/constants'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [remember, setRemember] = useState(true)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      const { error } = await signIn(email.trim(), pw)
      if (error) setErr(traduire(error.message))
    } finally { setBusy(false) }
  }

  return (
    <div className="login-bg">
      <div className="login-card">
        <form className="login-form" onSubmit={submit}>
          <div className="login-mark">⛺</div>
          <h2>Connexion</h2>
          <p className="login-formsub">Accédez à l'espace d'inscription de la Camporée.</p>
          {err && <div className="auth-err">{err}</div>}
          <div className="line-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" />
          </div>
          <div className="line-field">
            <label>Mot de passe</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)}
              required minLength={6} autoComplete="current-password" />
          </div>
          <div className="login-row">
            <label className="login-check">
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
              Rester connecté
            </label>
          </div>
          <button className="login-btn" disabled={busy}>
            {busy ? '…' : <>Se connecter <span aria-hidden>→</span></>}
          </button>
          <p className="login-contact">
            Pour obtenir votre identifiant, appelez le secrétariat de la Camporée :<br />
            <a href="tel:+261344538163">034 45 381 63</a> · <a href="tel:+261341696658">034 16 966 58</a>
          </p>
        </form>

        <div className="login-welcome">
          <p className="welcome-kicker">Bienvenue sur</p>
          <h3 className="welcome-title">eSoratra FME</h3>
          <img src="/image.png" alt="Camporée des Juniors — Champions du Christ" />
          <p className="welcome-sub">{EVENT.dates} · {EVENT.lieu}</p>
          <p className="welcome-credit">created by ByNyCrea 2K26</p>
        </div>
      </div>
    </div>
  )
}

function traduire(m) {
  if (/invalid login/i.test(m)) return 'Email ou mot de passe incorrect.'
  if (/email not confirmed/i.test(m)) return 'Compte non confirmé — contactez l\'administrateur.'
  if (/password should/i.test(m)) return 'Mot de passe trop court (min. 6 caractères).'
  return m
}
