'use client'

import { useState } from 'react'
import {
  FileUser,
  FileText,
  Briefcase,
  TrendingUp,
  Plus,
  ArrowRight,
  Presentation,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { type ViewKey } from '../nav'

type UserInfo = {
  name?: string
  email?: string
}

type OverviewViewProps = {
  onNavigate: (key: ViewKey) => void
  user?: UserInfo
}

const QUICK_ACTIONS: {
  label: string
  desc: string
  icon: typeof FileUser
  view: ViewKey
}[] = [
  { label: 'Nouveau CV', desc: 'Rédiger un nouveau CV', icon: FileUser, view: 'cv-builder' },
  {
    label: 'Nouveau rapport',
    desc: 'Rapport de stage / PFE',
    icon: FileText,
    view: 'report-generator',
  },
  {
    label: 'Nouvelle présentation',
    desc: 'Slides pour soutenance',
    icon: Presentation,
    view: 'presentation-builder',
  },
  { label: 'Trouver un emploi', desc: 'Des offres qui vous correspondent', icon: Briefcase, view: 'job-matcher' },
]

export function OverviewView({ onNavigate, user }: OverviewViewProps) {
  const fullName = user?.name || 'Utilisateur'
  const firstName = fullName.trim().split(' ')[0]

  // 📊 States réels (Tawwa 0 par défaut, tnejjem t-connectihom b backend walla localStorage mba3d)
  const [cvCompletion, setCvCompletion] = useState(0) // 0% au début
  const [generatedReports, setGeneratedReports] = useState<any[]>([]) // Liste vide
  const [trackedJobs, setTrackedJobs] = useState<any[]>([]) // Liste vide
  const [matchScore, setMatchScore] = useState(0) // 0% au début
  const [activities, setActivities] = useState<any[]>([])

  // 📈 Calcul dynamique mta3 l-metrics 3la 7sab l-les tableaux real-time
  const dynamicMetrics = [
    {
      label: 'CV complété',
      value: cvCompletion > 0 ? `${cvCompletion}%` : '0%',
      hint: cvCompletion > 0 ? 'Mise à jour récente' : 'Aucun CV enregistré',
      icon: FileUser,
      tone: 'text-[#17B8A0]',
      bg: 'bg-[#17B8A0]/10',
    },
    {
      label: 'Rapports générés',
      value: `${generatedReports.length}`,
      hint: '0 en cours',
      icon: FileText,
      tone: 'text-[#F2A93B]',
      bg: 'bg-[#F2A93B]/12',
    },
    {
      label: 'Candidatures suivies',
      value: `${trackedJobs.length}`,
      hint: '0 réponse',
      icon: Briefcase,
      tone: 'text-[#0E1729]',
      bg: 'bg-[#0E1729]/8',
    },
    {
      label: 'Score de match moyen',
      value: matchScore > 0 ? `${matchScore}%` : '--',
      hint: trackedJobs.length > 0 ? `Sur ${trackedJobs.length} offres` : 'Aucune offre analysée',
      icon: TrendingUp,
      tone: 'text-[#17B8A0]',
      bg: 'bg-[#17B8A0]/10',
    },
  ]

  return (
    <div className="cc-body space-y-6">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .cc-display { font-family: 'Space Grotesk', sans-serif; }
        .cc-body { font-family: 'Inter', sans-serif; }
        .cc-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* ============ Welcome banner — même identité que la page de connexion ============ */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0E1729] px-6 py-7 text-white sm:px-8 sm:py-9">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#17B8A0 1px, transparent 1px), linear-gradient(90deg, #17B8A0 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
        <div className="pointer-events-none absolute -right-10 -top-10 size-56 rounded-full bg-[#17B8A0]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 size-56 rounded-full bg-[#F2A93B]/10 blur-3xl" />

        <div className="relative z-10 max-w-xl">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#17B8A0]/30 bg-[#17B8A0]/15 px-3 py-1 text-xs font-medium text-[#17B8A0]">
            <Sparkles className="size-3" />
            IA prête
          </span>
          <h2 className="cc-display text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Bon retour, {firstName}
          </h2>
          <p className="mt-2 text-sm text-white/60 text-pretty">
            {cvCompletion > 0
              ? `Votre CV est complété à ${cvCompletion}%. Saisissez votre prochaine opportunité.`
              : 'Commencez par créer votre CV pour que notre IA puisse vous proposer des offres adaptées.'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('job-matcher')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#17B8A0] px-4 py-2.5 text-sm font-semibold text-[#0E1729] transition-opacity hover:opacity-90"
            >
              Voir les offres <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('cv-builder')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {cvCompletion > 0 ? 'Modifier mon CV' : 'Créer mon CV'}
            </button>
          </div>
        </div>
      </div>

      {/* ============ Metrics dynamiques ============ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dynamicMetrics.map((m) => {
          const Icon = m.icon
          return (
            <div
              key={m.label}
              className="rounded-2xl border border-[#1E2530]/10 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className={`inline-flex rounded-xl p-2.5 ${m.bg}`}>
                <Icon className={`size-5 ${m.tone}`} />
              </div>
              <p className="cc-mono mt-4 text-2xl font-semibold tracking-tight text-[#1E2530]">
                {m.value}
              </p>
              <p className="text-sm font-medium text-[#1E2530]">{m.label}</p>
              <p className="mt-1 text-xs text-[#8B93A1]">{m.hint}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ============ Activité récente ============ */}
        <div className="rounded-2xl border border-[#1E2530]/10 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="cc-display text-base font-semibold text-[#1E2530]">Activité récente</h3>
            {activities.length > 0 && (
              <button className="text-sm font-medium text-[#17B8A0] hover:underline">Tout voir</button>
            )}
          </div>

          {activities.length > 0 ? (
            <ul className="mt-4 space-y-1">
              {activities.map((a, idx) => (
                <li
                  key={idx}
                  className="flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-[#1E2530]/[0.03]"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                      a.done ? 'bg-[#17B8A0]/12 text-[#17B8A0]' : 'bg-[#F2A93B]/15 text-[#F2A93B]'
                    }`}
                  >
                    {a.done ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#1E2530]">{a.title}</p>
                    <p className="cc-mono text-xs text-[#8B93A1]">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1E2530]/15 bg-[#1E2530]/[0.02] py-10 text-center">
              <Clock className="mb-2 size-8 text-[#8B93A1]/50" />
              <p className="text-sm font-medium text-[#1E2530]">Aucune activité récente</p>
              <p className="mt-1 max-w-xs px-4 text-xs text-[#8B93A1]">
                Vos actions réelles s'afficheront ici automatiquement dès que vous commencerez à utiliser l'application.
              </p>
            </div>
          )}
        </div>

        {/* ============ Démarrage rapide ============ */}
        <div className="rounded-2xl border border-[#1E2530]/10 bg-white p-5">
          <h3 className="cc-display text-base font-semibold text-[#1E2530]">Démarrage rapide</h3>
          <p className="mt-1 text-sm text-[#8B93A1]">Lancez quelque chose de nouveau</p>
          <div className="mt-4 space-y-2.5">
            {QUICK_ACTIONS.map((q) => {
              const Icon = q.icon
              return (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => onNavigate(q.view)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-[#1E2530]/10 bg-white p-3 text-left transition-colors hover:border-[#17B8A0]/40 hover:bg-[#17B8A0]/5"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#0E1729]/6 text-[#0E1729] transition-colors group-hover:bg-[#17B8A0]/15 group-hover:text-[#17B8A0]">
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-[#1E2530]">{q.label}</span>
                    <span className="block text-xs text-[#8B93A1]">{q.desc}</span>
                  </span>
                  <Plus className="size-4 text-[#8B93A1] transition-colors group-hover:text-[#17B8A0]" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}