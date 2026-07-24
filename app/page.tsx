'use client'

import { useEffect, useState } from 'react'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { AdminDashboardShell } from '@/components/dashboard/AdminDashboardShell'
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  FileText,
  Briefcase,
  TrendingUp,
  Target,
  AlertCircle,
} from 'lucide-react'

type RegisteredUser = {
  email: string
  name: string
}

// 🔹 Identifiants admin (prototype uniquement — à remplacer par une vraie vérification backend)
const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD = 'adminproadmin'

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  // State lel message d'erreur
  const [errorMessage, setErrorMessage] = useState('')

  // Liste des utilisateurs enregistrés (chargée depuis localStorage)
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])

  // Gauge de compatibilité
  const [gaugeValue, setGaugeValue] = useState(0)
  const targetScore = 92

  // 1️⃣ Charger les utilisateurs enregistrés depuis localStorage au démarrage
  useEffect(() => {
    const savedUsers = localStorage.getItem('cc_registered_users')
    if (savedUsers) {
      try {
        setRegisteredUsers(JSON.parse(savedUsers))
      } catch (e) {
        console.error('Erreur chargement users:', e)
      }
    } else {
      // Utilisateur par défaut ken el storage feragh
      const defaultUsers: RegisteredUser[] = [
        { email: 'achref@example.com', name: 'Achref Ben Youssef' },
      ]
      setRegisteredUsers(defaultUsers)
      localStorage.setItem('cc_registered_users', JSON.stringify(defaultUsers))
    }
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setGaugeValue(targetScore), 300)
    return () => clearTimeout(timeout)
  }, [])

  // Nadhfu error message kif ybeddel l-mode (login <-> register)
  const handleModeChange = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setErrorMessage('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const cleanEmail = email.trim().toLowerCase()

    // 0️⃣ Check en priorité si c'est le compte admin
    if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setName('Admin')
      setIsAdmin(true)
      setIsLoggedIn(true)
      return
    }

    if (authMode === 'login') {
      // 2️⃣ Vérification ken l-email existe (f-registeredUsers elli fih el storage zeda)
      const userExists = registeredUsers.find((u) => u.email === cleanEmail)

      if (!userExists) {
        setErrorMessage(
          "Ce compte n'existe pas. Veuillez vous inscrire d'abord.",
        )
        return
      }

      // Ken moujoud -> Connexion réussie
      setName(userExists.name)
      setIsAdmin(false)
      setIsLoggedIn(true)
    } else {
      // Mode Inscription (Register)
      const userExists = registeredUsers.find((u) => u.email === cleanEmail)

      if (userExists) {
        setErrorMessage('Un compte existe déjà avec cette adresse email.')
        return
      }

      // 3️⃣ Enregistrement mta3 l-user njidid + Sauvegarde fel localStorage
      const newUserName = name.trim() || cleanEmail.split('@')[0]
      const updatedUsers = [...registeredUsers, { email: cleanEmail, name: newUserName }]

      setRegisteredUsers(updatedUsers)
      localStorage.setItem('cc_registered_users', JSON.stringify(updatedUsers))

      setName(newUserName)
      setIsAdmin(false)
      setIsLoggedIn(true)
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setIsAdmin(false)
  }

  if (!isLoggedIn) {
    const radius = 74
    const circumference = 2 * Math.PI * radius
    const offset = circumference * (1 - gaugeValue / 100)

    return (
      <div className="flex min-h-screen bg-[#FAF8F4]">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');

          .cc-display {
            font-family: 'Space Grotesk', sans-serif;
          }
          .cc-body {
            font-family: 'Inter', sans-serif;
          }
          .cc-mono {
            font-family: 'JetBrains Mono', monospace;
          }

          .cc-gauge-arc {
            transition: stroke-dashoffset 1400ms
              cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes cc-float {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-6px);
            }
          }
          .cc-chip-float {
            animation: cc-float 5s ease-in-out infinite;
          }
          .cc-chip-float-delay {
            animation: cc-float 5s ease-in-out infinite;
            animation-delay: 1.4s;
          }

          @media (prefers-reduced-motion: reduce) {
            .cc-gauge-arc {
              transition: none !important;
            }
            .cc-chip-float,
            .cc-chip-float-delay {
              animation: none !important;
            }
          }
        `}</style>

        {/* ================= PANEL SIGNATURE ================= */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#0E1729] p-10 text-white lg:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                'linear-gradient(#17B8A0 1px, transparent 1px), linear-gradient(90deg, #17B8A0 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#17B8A0]/20 blur-3xl" />

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-[#17B8A0] text-[#0E1729]">
              <Sparkles className="size-5" />
            </div>
            <span className="cc-display text-lg font-semibold tracking-tight">
              CareerCraft
            </span>
          </div>

          <div className="relative z-10 my-auto space-y-8">
            <div className="max-w-sm space-y-3">
              <h2 className="cc-display text-3xl font-semibold leading-[1.15] tracking-tight text-white">
                Votre profil, mesuré avec précision.
              </h2>
              <p className="cc-body text-sm leading-relaxed text-white/60">
                Rapports de stage, CV et offres d'emploi, analysés et notés pour
                chaque candidature.
              </p>
            </div>

            <div className="relative flex h-64 w-64 items-center justify-center">
              <svg viewBox="0 0 180 180" className="h-64 w-64 -rotate-90">
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity="0.08"
                  strokeWidth="10"
                />
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke="#17B8A0"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="cc-gauge-arc"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="cc-mono text-4xl font-semibold text-white">
                  {gaugeValue}%
                </span>
                <span className="cc-body mt-1 text-[11px] uppercase tracking-wider text-white/50">
                  Score de compatibilité
                </span>
              </div>

              <div className="cc-chip-float absolute -left-6 top-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 backdrop-blur-sm">
                <FileText className="size-3 text-[#F2A93B]" />
                <span className="cc-mono text-[11px] text-white/80">PFE</span>
              </div>
              <div className="cc-chip-float-delay absolute -right-4 top-1/3 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 backdrop-blur-sm">
                <Briefcase className="size-3 text-[#F2A93B]" />
                <span className="cc-mono text-[11px] text-white/80">
                  Offres
                </span>
              </div>
              <div className="cc-chip-float absolute -left-3 bottom-4 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 backdrop-blur-sm">
                <User className="size-3 text-[#F2A93B]" />
                <span className="cc-mono text-[11px] text-white/80">CV</span>
              </div>
              <div className="cc-chip-float-delay absolute -right-6 bottom-8 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 backdrop-blur-sm">
                <TrendingUp className="size-3 text-[#F2A93B]" />
                <span className="cc-mono text-[11px] text-white/80">Score</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 cc-body text-xs text-white/40">
            © 2026 CareerCraft. Suite carrière intelligente pour ingénieurs et
            étudiants.
          </div>
        </div>

        {/* ================= AUTH FORM ================= */}
        <div className="flex w-full flex-col justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-20">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 flex items-center gap-2.5 lg:hidden">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#0E1729] text-[#17B8A0]">
                <Sparkles className="size-5" />
              </div>
              <span className="cc-display text-lg font-semibold tracking-tight text-[#1E2530]">
                CareerCraft
              </span>
            </div>

            {/* Switcher Login / Register */}
            <div className="mb-8 inline-flex rounded-full border border-[#1E2530]/10 bg-[#1E2530]/[0.03] p-1">
              <button
                type="button"
                onClick={() => handleModeChange('login')}
                className={`cc-body rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  authMode === 'login'
                    ? 'bg-[#0E1729] text-white shadow-sm'
                    : 'text-[#1E2530]/50 hover:text-[#1E2530]'
                }`}
              >
                Connexion
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('register')}
                className={`cc-body rounded-full px-5 py-2 text-sm font-medium transition-all ${
                  authMode === 'register'
                    ? 'bg-[#0E1729] text-white shadow-sm'
                    : 'text-[#1E2530]/50 hover:text-[#1E2530]'
                }`}
              >
                Inscription
              </button>
            </div>

            <div className="mb-6 space-y-1.5">
              <h1 className="cc-display text-2xl font-semibold tracking-tight text-[#1E2530]">
                {authMode === 'login'
                  ? 'Content de vous revoir'
                  : 'Rejoignez CareerCraft'}
              </h1>
              <p className="cc-body text-sm text-[#8B93A1]">
                {authMode === 'login'
                  ? 'Accédez à vos rapports, CV et recommandations.'
                  : 'Créez votre compte pour démarrer votre suivi carrière.'}
              </p>
            </div>

            {/* Alert Message Erreur */}
            {errorMessage && (
              <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">{errorMessage}</p>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => handleModeChange('register')}
                      className="mt-1 font-semibold underline hover:opacity-80"
                    >
                      Cliquez ici pour vous inscrire
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {authMode === 'register' && (
                <div className="relative">
                  <input
                    id="cc-name"
                    type="text"
                    required
                    placeholder="ex: Achref Ben Youssef"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="peer w-full border-b-2 border-[#1E2530]/15 bg-transparent pb-2 pt-5 pl-7 text-sm text-[#1E2530] placeholder:text-[#8B93A1]/40 outline-none transition-colors focus:border-[#17B8A0]"
                  />
                  <User className="pointer-events-none absolute left-0 top-[1.55rem] size-4 text-[#8B93A1] peer-focus:text-[#17B8A0]" />
                  <label
                    htmlFor="cc-name"
                    className="cc-body pointer-events-none absolute left-7 top-0 text-xs text-[#8B93A1] transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#17B8A0]"
                  >
                    Nom complet
                  </label>
                </div>
              )}

              <div className="relative">
                <input
                  id="cc-email"
                  type="email"
                  required
                  placeholder="ex: nom@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full border-b-2 border-[#1E2530]/15 bg-transparent pb-2 pt-5 pl-7 text-sm text-[#1E2530] placeholder:text-[#8B93A1]/40 outline-none transition-colors focus:border-[#17B8A0]"
                />
                <Mail className="pointer-events-none absolute left-0 top-[1.55rem] size-4 text-[#8B93A1] peer-focus:text-[#17B8A0]" />
                <label
                  htmlFor="cc-email"
                  className="cc-body pointer-events-none absolute left-7 top-0 text-xs text-[#8B93A1] transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#17B8A0]"
                >
                  Adresse email
                </label>
              </div>

              <div className="relative">
                <input
                  id="cc-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full border-b-2 border-[#1E2530]/15 bg-transparent pb-2 pt-5 pl-7 text-sm text-[#1E2530] placeholder:text-[#8B93A1]/40 outline-none transition-colors focus:border-[#17B8A0]"
                />
                <Lock className="pointer-events-none absolute left-0 top-[1.55rem] size-4 text-[#8B93A1] peer-focus:text-[#17B8A0]" />
                <label
                  htmlFor="cc-password"
                  className="cc-body pointer-events-none absolute left-7 top-0 text-xs text-[#8B93A1] transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-sm peer-focus:top-0 peer-focus:text-xs peer-focus:text-[#17B8A0]"
                >
                  Mot de passe
                </label>
              </div>

              <button
                type="submit"
                className="cc-body mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E1729] py-3 text-sm font-semibold text-white shadow-lg shadow-[#0E1729]/10 transition-all hover:bg-[#17B8A0] hover:text-[#0E1729] active:scale-[0.98]"
              >
                {authMode === 'login' ? 'Se connecter' : 'Créer mon compte'}
                <ArrowRight className="size-4" />
              </button>
            </form>

            <div className="mt-8 flex items-center gap-2 text-[11px] text-[#8B93A1]">
              <Target className="size-3.5 text-[#F2A93B]" />
              <span className="cc-body">
                Rejoint par des centaines d'étudiants ingénieurs en Tunisie.
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 🔹 Redirection vers le dashboard admin
  if (isAdmin) {
    return (
      <AdminDashboardShell
        onLogout={handleLogout}
        user={{
          name: 'Admin',
          email: ADMIN_EMAIL,
        }}
      />
    )
  }

  return (
    <DashboardShell
      onLogout={handleLogout}
      user={{
        name: name || (email ? email.split('@')[0] : 'Utilisateur'),
        email: email || 'user@example.com',
      }}
    />
  )
}