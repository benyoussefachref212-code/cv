'use client'

import { useState } from 'react'
import {
  Sparkles,
  Loader2,
  GraduationCap,
  Briefcase,
  FileText,
  Users,
  Clock,
  CheckCircle2,
  Circle,
  Send,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UploadZone } from '../upload-zone'
import { cn } from '@/lib/utils'

const TYPES = [
  {
    key: 'pfe',
    label: 'PFE',
    desc: "Projet de Fin d'Études",
    icon: GraduationCap,
  },
  {
    key: 'stage',
    label: 'Stage',
    desc: 'Obligatoire / Optionnel',
    icon: Briefcase,
  },
]

// ============ Les 2 parcours: IA chapitre par chapitre / Expert humain ============
const MODES = [
  {
    key: 'ai' as const,
    label: 'Génération par IA',
    desc: "L'IA rédige votre rapport chapitre par chapitre, avec le texte complet.",
    icon: Sparkles,
    badge: 'Instantané',
    badgeTone: 'text-[#17B8A0] bg-[#17B8A0]/10 border-[#17B8A0]/25',
  },
  {
    key: 'expert' as const,
    label: 'Rédaction par un expert',
    desc: "Un rédacteur humain prend votre rapport en charge de A à Z.",
    icon: Users,
    badge: '4-5 jours',
    badgeTone: 'text-[#F2A93B] bg-[#F2A93B]/10 border-[#F2A93B]/25',
  },
]

const CHAPTERS = [
  { label: 'Introduction', preview: 'Présentation du contexte, des objectifs et de la problématique.' },
  { label: 'Contexte & problématique', preview: "Étude de l'existant et enjeux identifiés." },
  { label: 'Conception', preview: 'Architecture proposée et choix technologiques.' },
  { label: 'Réalisation', preview: 'Étapes de mise en œuvre et résultats obtenus.' },
  { label: 'Conclusion', preview: 'Bilan du travail réalisé et perspectives.' },
]

type ChapterStatus = 'pending' | 'active' | 'done'

interface ReportGeneratorViewProps {
  user?: {
    id?: string
    name?: string
    email?: string
    recentReports?: { id: string; title: string; date?: string }[]
  }
}

export function ReportGeneratorView({ user }: ReportGeneratorViewProps) {
  const [mode, setMode] = useState<'ai' | 'expert'>('ai')
  const [type, setType] = useState('pfe')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [expertSent, setExpertSent] = useState(false)

  // Noms des fichiers uploadés pour l'utilisateur
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

  // Progression chapitre par chapitre (mode IA)
  const [chapterStatus, setChapterStatus] = useState<ChapterStatus[]>(
    CHAPTERS.map(() => 'pending'),
  )

  // Rapports / demandes récents, dynamiques
  const [reports, setReports] = useState<Array<{ id: string; title: string; mode: 'ai' | 'expert' }>>(
    () => (user?.recentReports || []).map((r) => ({ ...r, mode: 'ai' as const })),
  )

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async function handleGenerateAI() {
    if (!title.trim()) return
    setLoading(true)
    setChapterStatus(CHAPTERS.map(() => 'pending'))

    for (let i = 0; i < CHAPTERS.length; i++) {
      setChapterStatus((prev) => prev.map((s, idx) => (idx === i ? 'active' : s)))
      await delay(700)
      setChapterStatus((prev) => prev.map((s, idx) => (idx === i ? 'done' : s)))
    }

    await delay(300)
    const newReport = { id: Date.now().toString(), title, mode: 'ai' as const }
    setReports((prev) => [newReport, ...prev])
    setLoading(false)
    setTitle('')
    setDescription('')
    setUploadedFiles([])
    setChapterStatus(CHAPTERS.map(() => 'pending'))
  }

  function handleSendToExpert() {
    if (!title.trim()) return
    const newReport = { id: Date.now().toString(), title, mode: 'expert' as const }
    setReports((prev) => [newReport, ...prev])
    setTitle('')
    setDescription('')
    setUploadedFiles([])
    setExpertSent(true)
    setTimeout(() => setExpertSent(false), 4000)
  }

  return (
    <div className="cc-body space-y-6">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .cc-display { font-family: 'Space Grotesk', sans-serif; }
        .cc-body { font-family: 'Inter', sans-serif; }
        .cc-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* ============ Choix du parcours: IA vs Expert ============ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODES.map((m) => {
          const Icon = m.icon
          const isActive = mode === m.key
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              className={cn(
                'relative flex items-start gap-4 rounded-2xl border p-5 text-left transition-all',
                isActive
                  ? 'border-[#0E1729] bg-[#0E1729] text-white shadow-lg'
                  : 'border-[#1E2530]/10 bg-white hover:border-[#17B8A0]/40 hover:bg-[#17B8A0]/5',
              )}
            >
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-xl',
                  isActive ? 'bg-[#17B8A0] text-[#0E1729]' : 'bg-[#0E1729]/6 text-[#0E1729]',
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className={cn('cc-display block text-sm font-semibold', isActive ? 'text-white' : 'text-[#1E2530]')}>
                    {m.label}
                  </span>
                  <span
                    className={cn(
                      'cc-mono shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                      isActive ? 'border-white/25 bg-white/10 text-white' : m.badgeTone,
                    )}
                  >
                    {m.badge}
                  </span>
                </span>
                <span className={cn('mt-1 block text-xs leading-relaxed', isActive ? 'text-white/60' : 'text-[#8B93A1]')}>
                  {m.desc}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-[#1E2530]/10">
            <CardContent className="space-y-6 p-6">
              <div>
                <Label>Type de rapport</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {TYPES.map((t) => {
                    const Icon = t.icon
                    const isActive = type === t.key
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setType(t.key)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-4 text-left transition-colors',
                          isActive
                            ? 'border-[#17B8A0] bg-[#17B8A0]/5 ring-1 ring-[#17B8A0]/30'
                            : 'border-[#1E2530]/10 hover:border-[#17B8A0]/40 hover:bg-[#1E2530]/[0.02]',
                        )}
                      >
                        <span
                          className={cn(
                            'flex size-10 items-center justify-center rounded-lg',
                            isActive ? 'bg-[#17B8A0] text-[#0E1729]' : 'bg-[#1E2530]/6 text-[#8B93A1]',
                          )}
                        >
                          <Icon className="size-5" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#1E2530]">{t.label}</span>
                          <span className="block text-xs text-[#8B93A1]">{t.desc}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-title">Titre du rapport</Label>
                <Input
                  id="report-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex. Conception d'une plateforme IoT"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="report-desc">Description &amp; directives</Label>
                <Textarea
                  id="report-desc"
                  className="min-h-40"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Expliquez le sujet du rapport, les objectifs, les technologies utilisées, le contexte de l'entreprise et les exigences de structure de votre université..."
                />
                <p className="text-xs text-[#8B93A1]">
                  {mode === 'ai'
                    ? "Plus vous fournissez de détails, plus le rapport généré par l'IA sera précis."
                    : "Ces informations seront transmises à l'expert qui choisira lui-même la meilleure méthode pour rédiger votre rapport."}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Images &amp; diagrammes</Label>
                <UploadZone
                  label="Glissez-déposez vos figures pour les intégrer"
                  files={uploadedFiles}
                  onFilesChange={setUploadedFiles}
                />
              </div>

              {mode === 'ai' ? (
                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={loading || !title.trim()}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0E1729] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Génération du rapport...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Générer le rapport avec l'IA
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSendToExpert}
                    disabled={!title.trim()}
                    className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#F2A93B] text-sm font-medium text-[#0E1729] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="size-4" /> Envoyer ma demande à un expert
                  </button>
                  {expertSent && (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-[#17B8A0]">
                      <CheckCircle2 className="size-3.5" /> Demande envoyée — un expert vous contactera sous peu.
                    </p>
                  )}
                </>
              )}

              {/* ============ Progression chapitre par chapitre (mode IA) ============ */}
              {mode === 'ai' && loading && (
                <div className="rounded-xl border border-[#1E2530]/10 bg-[#1E2530]/[0.02] p-4">
                  <p className="cc-display mb-3 text-xs font-semibold uppercase tracking-wider text-[#8B93A1]">
                    Rédaction en cours
                  </p>
                  <ul className="space-y-3">
                    {CHAPTERS.map((c, idx) => {
                      const status = chapterStatus[idx]
                      return (
                        <li key={c.label} className="flex items-start gap-3">
                          <span className="mt-0.5 shrink-0">
                            {status === 'done' ? (
                              <CheckCircle2 className="size-4 text-[#17B8A0]" />
                            ) : status === 'active' ? (
                              <Loader2 className="size-4 animate-spin text-[#F2A93B]" />
                            ) : (
                              <Circle className="size-4 text-[#1E2530]/15" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                'block text-sm font-medium',
                                status === 'pending' ? 'text-[#8B93A1]' : 'text-[#1E2530]',
                              )}
                            >
                              {c.label}
                            </span>
                            {status !== 'pending' && (
                              <span className="cc-mono mt-0.5 block text-xs text-[#8B93A1]">{c.preview}</span>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {mode === 'ai' ? (
            <Card className="border-[#1E2530]/10">
              <CardContent className="p-5">
                <h3 className="cc-display flex items-center gap-2 text-base font-semibold text-[#1E2530]">
                  <FileText className="size-4 text-[#17B8A0]" /> Ce que vous obtiendrez
                </h3>
                <ul className="mt-3 space-y-3 text-sm text-[#8B93A1]">
                  {[
                    'Chapitres structurés (intro, contexte, conception, réalisation, conclusion)',
                    'Table des matières & liste des figures auto-générées',
                    'Ton académique avec citations appropriées',
                    'Exportation vers Word & PDF',
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#17B8A0]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-[#1E2530]/10">
              <CardContent className="p-5">
                <h3 className="cc-display flex items-center gap-2 text-base font-semibold text-[#1E2530]">
                  <Users className="size-4 text-[#F2A93B]" /> Comment ça marche
                </h3>
                <ul className="mt-3 space-y-3 text-sm text-[#8B93A1]">
                  {[
                    'Vous décrivez votre sujet et joignez vos documents',
                    "Un expert humain étudie votre projet",
                    "Il choisit lui-même la meilleure méthode pour rédiger votre rapport",
                    'Livraison de votre rapport complet sous 4 à 5 jours',
                  ].map((item, i) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="cc-mono mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#F2A93B]/15 text-[9px] font-semibold text-[#F2A93B]">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-1.5 rounded-lg border border-[#F2A93B]/25 bg-[#F2A93B]/8 px-3 py-2 text-xs font-medium text-[#F2A93B]">
                  <Clock className="size-3.5" /> Délai garanti : 4 à 5 jours ouvrés
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-[#1E2530]/10">
            <CardContent className="p-5">
              <h3 className="cc-display text-base font-semibold text-[#1E2530]">Rapports récents</h3>
              <ul className="mt-3 space-y-2">
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center gap-2.5 rounded-lg border border-[#1E2530]/10 p-2.5"
                    >
                      <FileText className="size-4 text-[#8B93A1]" />
                      <span className="min-w-0 flex-1 truncate text-sm text-[#1E2530]">{r.title}</span>
                      <span
                        className={cn(
                          'cc-mono shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                          r.mode === 'ai'
                            ? 'bg-[#17B8A0]/10 text-[#17B8A0]'
                            : 'bg-[#F2A93B]/10 text-[#F2A93B]',
                        )}
                      >
                        {r.mode === 'ai' ? 'IA' : 'Expert'}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs italic text-[#8B93A1]">Aucun rapport récent.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}