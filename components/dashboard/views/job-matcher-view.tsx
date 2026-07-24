'use client'

import { useState } from 'react'
import {
  Upload,
  MapPin,
  Building2,
  ExternalLink,
  Sparkles,
  Loader2,
  Bookmark,
  FileCheck2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Globe,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type UserProps = {
  id?: string
  name?: string | null
  email?: string | null
}

// Liste des gouvernorats / villes / pays
const LOCATIONS = [
  { id: 'remote', label: '🏠 Télétravail / Remote', keyword: 'Télétravail' },
  { id: 'tunis', label: 'Tunis', keyword: 'Tunis' },
  { id: 'ariana', label: 'Ariana', keyword: 'Ariana' },
  { id: 'ben-arous', label: 'Ben Arous', keyword: 'Ben Arous' },
  { id: 'sousse', label: 'Sousse', keyword: 'Sousse' },
  { id: 'sfax', label: 'Sfax', keyword: 'Sfax' },
  { id: 'monastir', label: 'Monastir', keyword: 'Monastir' },
  { id: 'bizerte', label: 'Bizerte', keyword: 'Bizerte' },
  { id: 'nabeul', label: 'Nabeul / Kelibia', keyword: 'Nabeul' },
  { id: 'kairouan', label: 'Kairouan', keyword: 'Kairouan' },
  { id: 'gabes', label: 'Gabès', keyword: 'Gabès' },
  { id: 'paris', label: '🇫🇷 Paris, France', keyword: 'Paris' },
  { id: 'allemagne', label: '🇩🇪 Allemagne', keyword: 'Allemagne' },
  { id: 'hongrie', label: '🇭🇺 Hongrie', keyword: 'Hongrie' },
  { id: 'oman', label: '🇴🇲 Mascate, Oman', keyword: 'Oman' },
]

// Plateformes d'emploi supportées (Zdna Indeed Hne 🔵)
const SOURCES = [
  { name: 'Indeed', color: 'bg-blue-600/10 text-blue-700 border-blue-300' },
  { name: 'Tanitjobs', color: 'bg-red-500/10 text-red-600 border-red-200' },
  { name: 'Keejob', color: 'bg-cyan-500/10 text-cyan-700 border-cyan-200' },
  { name: 'OptionCarriere', color: 'bg-orange-500/10 text-orange-600 border-orange-200' },
  { name: 'Free-Work', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  { name: 'Freelance-Info', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200' },
  { name: 'APEC', color: 'bg-sky-500/10 text-sky-600 border-sky-200' },
  { name: 'Tunisie Travail', color: 'bg-green-500/10 text-green-600 border-green-200' },
  { name: 'EmploiTunisie', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-200' },
]

type Job = {
  id: string
  title: string
  company: string
  location: string
  type: string
  match: number
  source: string
  sourceUrl: string
  tags: string[]
}

const MOCK_JOBS: Job[] = [
  { id: '1', title: 'Développeur Fullstack (Laravel / React)', company: 'Vermeg', location: 'Tunis, Tunisie', type: 'Temps plein', match: 95, source: 'Tanitjobs', sourceUrl: 'https://www.tanitjob.com', tags: ['Laravel', 'React', 'PHP'] },
  { id: '2', title: 'Ingénieur Full-Stack Node.js', company: 'Instadeep', location: 'Télétravail / Remote', type: 'Temps plein', match: 89, source: 'Indeed', sourceUrl: 'https://www.indeed.com', tags: ['Node.js', 'TypeScript', 'React Native'] },
  { id: '3', title: 'Consultant .NET / SQL Developer', company: 'Talan', location: 'Paris, France', type: 'Temps plein', match: 78, source: 'APEC', sourceUrl: 'https://www.apec.fr', tags: ['C#', '.NET', 'SQL Server'] },
  { id: '4', title: 'Développeur Web Junior (PHP / Symfony)', company: 'Digital Agency', location: 'Sousse, Tunisie', type: 'Temps plein', match: 64, source: 'Keejob', sourceUrl: 'https://www.keejob.com', tags: ['Symfony', 'MySQL', 'JavaScript'] },
  { id: '5', title: 'Développeur Frontend React / Mobile', company: 'Tech Hub', location: 'Ariana, Tunisie', type: 'Hybride', match: 52, source: 'OptionCarriere', sourceUrl: 'https://www.optioncarriere.tn', tags: ['React', 'Tailwind'] },
  { id: '6', title: 'Freelance Lead Developer', company: 'Startup EU', location: 'Télétravail / Remote', type: 'Freelance', match: 38, source: 'Freelance-Info', sourceUrl: 'https://www.freelance-informatique.fr', tags: ['Node.js', 'Docker'] },
  { id: '7', title: 'Administrateur Systèmes & DevOps', company: 'Sofrecom', location: 'Mascate, Oman', type: 'Contrat', match: 22, source: 'Indeed', sourceUrl: 'https://www.indeed.com', tags: ['Linux', 'Cloud'] },
  { id: '8', title: 'Integrateur Web HTML/CSS', company: 'Sfax Media', location: 'Sfax, Tunisie', type: 'Temps plein', match: 14, source: 'Tunisie Travail', sourceUrl: 'https://www.tunisietravail.net', tags: ['HTML', 'CSS', 'WordPress'] },
  { id: '9', title: 'Full Stack Engineer .NET', company: 'Sofrecom Tunis', location: 'Tunis, Tunisie', type: 'Temps plein', match: 81, source: 'Indeed', sourceUrl: 'https://www.indeed.com', tags: ['C#', '.NET Core', 'Angular'] },
]

function getMatchStyles(match: number) {
  if (match >= 80) return { color: 'text-emerald-600', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500' }
  if (match >= 50) return { color: 'text-primary', bg: 'bg-primary/10', bar: 'bg-primary' }
  if (match >= 30) return { color: 'text-amber-600', bg: 'bg-amber-500/10', bar: 'bg-amber-500' }
  return { color: 'text-slate-500', bg: 'bg-slate-500/10', bar: 'bg-slate-500' }
}

export function JobMatcherView({ user }: { user?: UserProps }) {
  const [selectedLocs, setSelectedLocs] = useState<string[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Job[]>([])
  const [searched, setSearched] = useState(false)

  const toggleLocation = (id: string) => {
    setSelectedLocs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // 🔄 Fonction Actualiser
  const handleReset = () => {
    setSelectedLocs([])
    setFileName(null)
    setResults([])
    setSearched(false)
    setLoading(false)
  }

  // 🎯 Search avec Filtre Strict 3la el Pays/Villes li khtarhom el User
  const handleSearch = async () => {
    if (!fileName || selectedLocs.length === 0) return

    setLoading(true)
    setSearched(true)

    await new Promise((r) => setTimeout(r, 1400))

    // Ntal3ou el keywords mta3 les zones li khtarhom l'utilisateur
    const activeKeywords = LOCATIONS
      .filter((loc) => selectedLocs.includes(loc.id))
      .map((loc) => loc.keyword.toLowerCase())

    // Filtre 1: Match > 10%
    // Filtre 2: Lezem el location mta3 el job faha wahda mel keywords li khtarhom l'utilisateur
    const filtered = MOCK_JOBS.filter((job) => {
      const isMatchValid = job.match >= 10
      const isLocationMatched = activeKeywords.some((kw) =>
        job.location.toLowerCase().includes(kw)
      )
      return isMatchValid && isLocationMatched
    })

    setResults(filtered.sort((a, b) => b.match - a.match))
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
      {/* SIDEBAR : FILTRES & CV */}
      <div className="space-y-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-5 space-y-5">
            {/* Header & Bouton Réinitialiser */}
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-primary" /> Configuration
              </h3>
              {searched && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
                  title="Réinitialiser tous les filtres"
                >
                  <RotateCcw className="size-3.5" /> Actualiser
                </button>
              )}
            </div>

            {/* Step 1: Upload CV */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                1. Votre CV
              </label>
              {!fileName ? (
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl bg-muted/20 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer group">
                  <Upload className="size-6 text-muted-foreground group-hover:text-primary mb-1 transition-colors" />
                  <span className="text-xs font-medium text-foreground">Importer un CV (PDF/DOCX)</span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => e.target.files?.[0] && setFileName(e.target.files[0].name)}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileCheck2 className="size-4 text-accent shrink-0" />
                    <span className="text-xs font-medium truncate">{fileName}</span>
                  </div>
                  <button onClick={() => setFileName(null)} className="text-muted-foreground hover:text-destructive">
                    <XCircle className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Sélection Multiple Villes & Pays */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  2. Zones ciblées ({selectedLocs.length})
                </label>
              </div>
              <div className="grid grid-cols-1 gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {LOCATIONS.map((loc) => {
                  const active = selectedLocs.includes(loc.id)
                  return (
                    <button
                      key={loc.id}
                      onClick={() => toggleLocation(loc.id)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left",
                        active
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background border-border/80 hover:border-primary/40 text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-3 shrink-0" /> {loc.label}
                      </span>
                      {active && <CheckCircle2 className="size-3.5" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sources incluses */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                Sources scannées
              </label>
              <div className="flex flex-wrap gap-1">
                {SOURCES.map((s) => (
                  <span
                    key={s.name}
                    className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border", s.color)}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Search */}
            <button
              onClick={handleSearch}
              disabled={loading || !fileName || selectedLocs.length === 0}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Lancer le Match
                </>
              )}
            </button>
          </CardContent>
        </Card>
      </div>

      {/* MAIN CONTENT : OFFRES */}
      <div className="space-y-4">
        {!searched ? (
          <div className="h-full min-h-[480px] flex flex-col items-center justify-center text-center p-8 bg-muted/10 rounded-2xl border-2 border-dashed border-border/60">
            <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Globe className="size-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Recherche multi-sources d'emploi</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Chargez votre CV et cochez vos destinations cibles pour filtrer les offres sur <b>Indeed, Tanitjobs, Keejob, Free-Work, APEC, OptionCarriere</b> et plus.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold text-foreground">
                {loading ? "Recherche en cours..." : `${results.length} offres trouvées pour vos zones`}
              </h3>
              {!loading && results.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  Scores &gt; 10%
                </Badge>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted/60 animate-pulse rounded-2xl border" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="p-8 text-center bg-muted/20 rounded-2xl border border-dashed">
                <p className="text-sm text-muted-foreground">
                  Aucune offre ne correspond exactement aux emplacements sélectionnés avec un score &gt; 10%. Essayez d'ajouter d'autres villes !
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5">
                {results.map((job) => {
                  const style = getMatchStyles(job.match)
                  return (
                    <Card key={job.id} className="hover:shadow-md transition-shadow border-border/80 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Match Score Badge */}
                          <div className={cn("sm:w-24 p-4 flex flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r shrink-0", style.bg)}>
                            <span className={cn("text-2xl font-extrabold", style.color)}>{job.match}%</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">Compatibilité</span>
                          </div>

                          {/* Infos Job */}
                          <div className="flex-1 p-4 flex flex-col justify-between relative">
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="text-base font-bold text-foreground">{job.title}</h4>
                                  <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
                                    <span className="font-semibold text-foreground flex items-center gap-1">
                                      <Building2 className="size-3.5" /> {job.company}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 font-medium text-primary">
                                      <MapPin className="size-3.5" /> {job.location}
                                    </span>
                                  </p>
                                </div>
                                <Badge variant="secondary" className="text-[10px] shrink-0 font-bold">
                                  {job.source}
                                </Badge>
                              </div>

                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {job.tags.map((t) => (
                                  <span key={t} className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-md">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Actions & Link */}
                            <div className="mt-4 pt-3 border-t flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">{job.type}</span>
                              <div className="flex items-center gap-2">
                                <button type="button" className="p-2 text-muted-foreground hover:text-foreground">
                                  <Bookmark className="size-4" />
                                </button>
                                <a
                                  href={job.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                                >
                                  Voir sur {job.source} <ExternalLink className="size-3" />
                                </a>
                              </div>
                            </div>

                            {/* Barre visuelle du score */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-muted">
                              <div className={cn("h-full transition-all duration-700", style.bar)} style={{ width: `${job.match}%` }} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}