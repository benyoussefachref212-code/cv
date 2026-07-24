'use client'

import { useState } from 'react'
import {
  Sparkles,
  Loader2,
  Presentation,
  Layers,
  Users,
  Clock,
  CheckCircle2,
  Send,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UploadZone } from '../upload-zone'
import { cn } from '@/lib/utils'

const TONES = [
  { key: 'formal', label: 'Formel', desc: 'Académique & Épuré' },
  { key: 'tech', label: 'Technique', desc: 'Axé sur le code' },
  { key: 'creative', label: 'Créatif', desc: 'Audacieux & Visuel' },
]

// ============ Les 2 parcours: IA / Expert humain ============
const MODES = [
  {
    key: 'ai' as const,
    label: 'Génération par IA',
    desc: "L'IA construit vos diapositives en quelques minutes.",
    icon: Sparkles,
    badge: 'Instantané',
    badgeTone: 'text-[#17B8A0] bg-[#17B8A0]/10 border-[#17B8A0]/25',
  },
  {
    key: 'expert' as const,
    label: 'Conception par un expert',
    desc: 'Un designer humain construit votre présentation de A à Z.',
    icon: Users,
    badge: '3 jours',
    badgeTone: 'text-[#F2A93B] bg-[#F2A93B]/10 border-[#F2A93B]/25',
  },
]

const SLIDE_PRESETS = [
  { label: 'Court', value: 8 },
  { label: 'Standard', value: 12 },
  { label: 'Complet', value: 18 },
  { label: 'Détaillé', value: 25 },
]

interface PresentationBuilderViewProps {
  user?: {
    id?: string
    name?: string
    email?: string
  }
}

export function PresentationBuilderView({ user }: PresentationBuilderViewProps) {
  const [mode, setMode] = useState<'ai' | 'expert'>('ai')
  const [title, setTitle] = useState('')
  const [tone, setTone] = useState('formal')
  const [slides, setSlides] = useState(12)
  const [loading, setLoading] = useState(false)
  const [expertSent, setExpertSent] = useState(false)
  const [presentations, setPresentations] = useState<
    Array<{ id: string; title: string; mode: 'ai' | 'expert' }>
  >([])

  const slidePct = ((slides - 5) / (30 - 5)) * 100

  function handleGenerateAI() {
    if (!title.trim()) return
    setLoading(true)
    setTimeout(() => {
      setPresentations((prev) => [{ id: Date.now().toString(), title, mode: 'ai' }, ...prev])
      setLoading(false)
      setTitle('')
    }, 2000)
  }

  function handleSendToExpert() {
    if (!title.trim()) return
    setPresentations((prev) => [{ id: Date.now().toString(), title, mode: 'expert' }, ...prev])
    setTitle('')
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

        .cc-range { -webkit-appearance: none; appearance: none; background: transparent; }
        .cc-range::-webkit-slider-runnable-track { height: 8px; background: transparent; }
        .cc-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          margin-top: -6px;
          border-radius: 9999px;
          background: #0E1729;
          border: 3px solid #17B8A0;
          box-shadow: 0 1px 4px rgba(14, 23, 41, 0.3);
          cursor: pointer;
        }
        .cc-range::-moz-range-track { height: 8px; background: transparent; }
        .cc-range::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 9999px;
          background: #0E1729;
          border: 3px solid #17B8A0;
          box-shadow: 0 1px 4px rgba(14, 23, 41, 0.3);
          cursor: pointer;
        }
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
              <div className="space-y-1.5">
                <Label htmlFor="pres-title">Titre de la présentation</Label>
                <Input
                  id="pres-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex. Soutenance PFE - Agriculture Intelligente"
                />
              </div>

              <div>
                <Label>Ton de la présentation</Label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {TONES.map((t) => {
                    const isActive = tone === t.key
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setTone(t.key)}
                        className={cn(
                          'rounded-xl border p-3 text-center transition-colors',
                          isActive
                            ? 'border-[#17B8A0] bg-[#17B8A0]/5 ring-1 ring-[#17B8A0]/30'
                            : 'border-[#1E2530]/10 hover:border-[#17B8A0]/40 hover:bg-[#1E2530]/[0.02]',
                        )}
                      >
                        <span className="block text-sm font-semibold text-[#1E2530]">{t.label}</span>
                        <span className="block text-xs text-[#8B93A1]">{t.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* ============ Sélecteur de diapositives — version "pro" ============ */}
              <div className="space-y-4 rounded-2xl border border-[#1E2530]/10 bg-[#1E2530]/[0.015] p-5">
                <div className="flex items-center justify-between">
                  <Label className="text-[#1E2530]">Nombre de diapositives</Label>
                  {mode === 'expert' && (
                    <span className="cc-mono text-[10px] uppercase tracking-wider text-[#8B93A1]">indicatif</span>
                  )}
                </div>

                <div className="flex items-center gap-5">
                  {/* Visuel pile de diapositives */}
                  <div className="relative flex h-16 w-24 shrink-0 items-center justify-center">
                    <div className="absolute h-12 w-[72px] -rotate-[7deg] rounded-lg border border-[#1E2530]/10 bg-white shadow-sm" />
                    <div className="absolute h-12 w-[72px] rotate-[5deg] rounded-lg border border-[#1E2530]/10 bg-white shadow-sm" />
                    <div className="relative z-10 flex h-12 w-[72px] flex-col items-center justify-center rounded-lg border border-[#17B8A0]/30 bg-[#0E1729] shadow-md">
                      <span className="cc-mono text-lg font-semibold leading-none text-white">{slides}</span>
                      <span className="mt-0.5 text-[8px] uppercase tracking-wider text-white/50">slides</span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-3">
                    {/* Presets rapides */}
                    <div className="flex flex-wrap gap-1.5">
                      {SLIDE_PRESETS.map((p) => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setSlides(p.value)}
                          className={cn(
                            'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                            slides === p.value
                              ? 'border-[#0E1729] bg-[#0E1729] text-white'
                              : 'border-[#1E2530]/15 text-[#1E2530]/70 hover:border-[#17B8A0]/40 hover:text-[#1E2530]',
                          )}
                        >
                          {p.label} · {p.value}
                        </button>
                      ))}
                    </div>

                    {/* Slider custom, remplissage dégradé */}
                    <div className="relative h-2 w-full rounded-full bg-[#1E2530]/10">
                      <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#17B8A0] to-[#0E1729]"
                        style={{ width: `${slidePct}%` }}
                      />
                      <input
                        id="slides"
                        type="range"
                        min={5}
                        max={30}
                        value={slides}
                        onChange={(e) => setSlides(Number(e.target.value))}
                        className="cc-range absolute inset-0 h-2 w-full cursor-pointer"
                      />
                    </div>
                    <div className="cc-mono flex justify-between text-[10px] text-[#8B93A1]">
                      <span>5</span>
                      <span>30</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="structure">Structure &amp; contenu</Label>
                <Textarea
                  id="structure"
                  className="min-h-36"
                  placeholder="Décrivez les sections clés : problématique, objectifs, architecture, démonstration, résultats, conclusion. Ajoutez des notes pour le présentateur ou des points importants..."
                />
              </div>

              <div className="space-y-2">
                <Label>Ressources visuelles pour les diapositives</Label>
                <UploadZone label="Glissez-déposez vos images ici pour les intégrez aux slides" />
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
                      <Loader2 className="size-4 animate-spin" /> Génération des diapositives...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" /> Générer la présentation avec l'IA
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
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {mode === 'ai' ? (
            <Card className="border-[#1E2530]/10">
              <CardContent className="p-5">
                <h3 className="cc-display flex items-center gap-2 text-base font-semibold text-[#1E2530]">
                  <Layers className="size-4 text-[#17B8A0]" /> Aperçu des diapositives
                </h3>
                <div className="mt-3 space-y-2.5">
                  {['Titre & Contexte', 'Problématique', 'Architecture', 'Démonstration', 'Conclusion'].map(
                    (s, i) => (
                      <div
                        key={s}
                        className="flex items-center gap-3 rounded-lg border border-[#1E2530]/10 bg-[#1E2530]/[0.02] p-3"
                      >
                        <span className="cc-mono flex size-8 shrink-0 items-center justify-center rounded-md bg-[#17B8A0]/10 text-xs font-semibold text-[#17B8A0]">
                          {i + 1}
                        </span>
                        <span className="flex items-center gap-2 text-sm text-[#1E2530]">
                          <Presentation className="size-3.5 text-[#8B93A1]" /> {s}
                        </span>
                      </div>
                    ),
                  )}
                </div>
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
                    'Un designer humain étudie votre contenu',
                    'Il choisit lui-même la meilleure structure et le meilleur visuel',
                    'Livraison de votre présentation complète sous 3 jours',
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
                  <Clock className="size-3.5" /> Délai garanti : 3 jours ouvrés
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-[#1E2530]/10">
            <CardContent className="p-5">
              <h3 className="cc-display text-base font-semibold text-[#1E2530]">Présentations récentes</h3>
              <ul className="mt-3 space-y-2">
                {presentations.length > 0 ? (
                  presentations.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-2.5 rounded-lg border border-[#1E2530]/10 p-2.5"
                    >
                      <Presentation className="size-4 text-[#8B93A1]" />
                      <span className="min-w-0 flex-1 truncate text-sm text-[#1E2530]">{p.title}</span>
                      <span
                        className={cn(
                          'cc-mono shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                          p.mode === 'ai'
                            ? 'bg-[#17B8A0]/10 text-[#17B8A0]'
                            : 'bg-[#F2A93B]/10 text-[#F2A93B]',
                        )}
                      >
                        {p.mode === 'ai' ? 'IA' : 'Expert'}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs italic text-[#8B93A1]">Aucune présentation récente.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}