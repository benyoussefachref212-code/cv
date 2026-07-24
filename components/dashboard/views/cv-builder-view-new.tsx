'use client'

import { useState } from 'react'
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Heart,
  Plus,
  X,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Send,
  Upload,
  Lock,
  Users,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { UploadZone } from '../upload-zone'
import { AIGeneratorButton } from '@/components/cv-generator/ai-generator-button'

type ExperienceEntry = {
  id: string
  position: string
  company: string
  start: string
  end: string
  description: string
}

type EducationEntry = {
  id: string
  degree: string
  school: string
  year: string
  grade: string
}

function emptyExperience(): ExperienceEntry {
  return { id: crypto.randomUUID(), position: '', company: '', start: '', end: '', description: '' }
}

function emptyEducation(): EducationEntry {
  return { id: crypto.randomUUID(), degree: '', school: '', year: '', grade: '' }
}

interface CvBuilderViewProps {
  user?: {
    name?: string
    email?: string
  }
}

export function CvBuilderView({ user }: CvBuilderViewProps) {
  const [mode, setMode] = useState<'ai' | 'expert' | null>(null)

  // ==================== MODE IA ====================
  const [aiProfile, setAiProfile] = useState(() => ({
    name: user?.name || '',
    title: '',
    email: user?.email || '',
    phone: '',
    location: '',
    summary: '',
    languages: '',
    interests: '',
  }))

  const [aiPhoto, setAiPhoto] = useState<string | null>(null)
  const [aiSkills, setAiSkills] = useState<string[]>([])
  const [aiSkillInput, setAiSkillInput] = useState('')
  const [aiExperiences, setAiExperiences] = useState<ExperienceEntry[]>([emptyExperience()])
  const [aiEducations, setAiEducations] = useState<EducationEntry[]>([emptyEducation()])

  const handleAiPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAiPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const addAiSkill = () => {
    const v = aiSkillInput.trim()
    if (v && !aiSkills.includes(v)) setAiSkills([...aiSkills, v])
    setAiSkillInput('')
  }

  const updateAiExperience = (id: string, field: keyof ExperienceEntry, value: string) => {
    setAiExperiences((prev) => prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }

  const addAiExperience = () => {
    setAiExperiences((prev) => [...prev, emptyExperience()])
  }

  const removeAiExperience = (id: string) => {
    setAiExperiences((prev) => (prev.length > 1 ? prev.filter((exp) => exp.id !== id) : prev))
  }

  const updateAiEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setAiEducations((prev) => prev.map((ed) => (ed.id === id ? { ...ed, [field]: value } : ed)))
  }

  const addAiEducation = () => {
    setAiEducations((prev) => [...prev, emptyEducation()])
  }

  const removeAiEducation = (id: string) => {
    setAiEducations((prev) => (prev.length > 1 ? prev.filter((ed) => ed.id !== id) : prev))
  }

  // ==================== MODE EXPERT ====================
  const [expertProfile, setExpertProfile] = useState(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    title: '',
  }))

  const [expertNotes, setExpertNotes] = useState('')
  const [expertRequested, setExpertRequested] = useState(false)

  const handleExpertRequest = () => {
    if (!expertProfile.name.trim()) return
    setExpertRequested(true)
    setTimeout(() => setExpertRequested(false), 5000)
  }

  // ==================== RENDER ====================
  return (
    <div className="cc-body space-y-6">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .cc-display { font-family: 'Space Grotesk', sans-serif; }
        .cc-body { font-family: 'Inter', sans-serif; }
        .cc-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      {/* ========== SÉLECTION DU MODE ========== */}
      {mode === null && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              key: 'ai' as const,
              label: 'Génération par IA',
              desc: "L'IA construit votre CV en quelques minutes.",
              icon: Sparkles,
              badge: 'Instantané',
            },
            {
              key: 'expert' as const,
              label: 'Conception par un expert',
              desc: 'Un expert humain rédige votre CV de A à Z.',
              icon: Users,
              badge: '2 jours',
            },
          ].map((m) => {
            const Icon = m.icon
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                className="flex items-start gap-4 rounded-2xl border border-[#1E2530]/10 bg-white p-5 text-left transition-all hover:border-[#17B8A0]/40 hover:bg-[#17B8A0]/5"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0E1729]/6">
                  <Icon className="size-5 text-[#0E1729]" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2">
                    <span className="cc-display text-sm font-semibold text-[#1E2530]">{m.label}</span>
                    <span className="cc-mono rounded-full border border-[#17B8A0]/25 bg-[#17B8A0]/10 px-2 py-0.5 text-[10px] font-medium text-[#17B8A0]">
                      {m.badge}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs text-[#8B93A1]">{m.desc}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* ========== MODE IA: FORMULAIRE COMPLET ========== */}
      {mode === 'ai' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode(null)}
              className="text-sm text-[#8B93A1] hover:text-[#1E2530]"
            >
              ← Retour
            </button>
            <h2 className="cc-display text-lg font-bold text-[#1E2530]">Génération par IA</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Informations Personnelles */}
            <Card className="border-[#1E2530]/10">
              <CardContent className="space-y-4 p-6">
                <h3 className="cc-display text-base font-semibold text-[#1E2530]">Informations Personnelles</h3>

                <div className="flex items-center gap-4 pb-2">
                  <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#1E2530]/10 bg-[#1E2530]/[0.03]">
                    {aiPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={aiPhoto} alt="Photo" className="h-full w-full object-cover" />
                    ) : (
                      <User className="size-8 text-[#8B93A1]" />
                    )}
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#1E2530]/15 bg-white px-3 py-2 text-sm font-medium text-[#1E2530] transition-colors hover:bg-[#1E2530]/5">
                    <Upload className="size-3.5" />
                    {aiPhoto ? 'Changer' : 'Ajouter photo'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleAiPhotoChange} />
                  </label>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Nom complet</Label>
                    <Input
                      placeholder="ex. Yassine Ben Salah"
                      value={aiProfile.name}
                      onChange={(e) => setAiProfile({ ...aiProfile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Intitulé du poste</Label>
                    <Input
                      placeholder="ex. Ingénieur Logiciel"
                      value={aiProfile.title}
                      onChange={(e) => setAiProfile({ ...aiProfile, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      placeholder="ex. email@example.com"
                      value={aiProfile.email}
                      onChange={(e) => setAiProfile({ ...aiProfile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Téléphone</Label>
                    <Input
                      placeholder="ex. +216 55 123 456"
                      value={aiProfile.phone}
                      onChange={(e) => setAiProfile({ ...aiProfile, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Localisation</Label>
                  <Input
                    placeholder="ex. Tunis, Tunisie"
                    value={aiProfile.location}
                    onChange={(e) => setAiProfile({ ...aiProfile, location: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Résumé professionnel</Label>
                  <Textarea
                    placeholder="ex. Développeur passionné avec expérience..."
                    value={aiProfile.summary}
                    onChange={(e) => setAiProfile({ ...aiProfile, summary: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Expériences */}
            <Card className="border-[#1E2530]/10">
              <CardContent className="space-y-4 p-6">
                <h3 className="cc-display text-base font-semibold text-[#1E2530]">Expérience Professionnelle</h3>

                <div className="space-y-4">
                  {aiExperiences.map((exp, idx) => (
                    <div key={exp.id} className="relative rounded-xl border border-[#1E2530]/10 p-4">
                      {aiExperiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAiExperience(exp.id)}
                          className="absolute right-3 top-3 text-[#8B93A1] hover:text-[#F2A93B]"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                      <p className="cc-mono mb-3 text-[10px] font-semibold uppercase text-[#8B93A1]">
                        Expérience {idx + 1}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Poste</Label>
                          <Input
                            placeholder="ex. Développeur Full Stack"
                            value={exp.position}
                            onChange={(e) => updateAiExperience(exp.id, 'position', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Entreprise</Label>
                          <Input
                            placeholder="ex. Vermeg"
                            value={exp.company}
                            onChange={(e) => updateAiExperience(exp.id, 'company', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Début</Label>
                          <Input
                            placeholder="ex. Juin 2024"
                            value={exp.start}
                            onChange={(e) => updateAiExperience(exp.id, 'start', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Fin</Label>
                          <Input
                            placeholder="ex. Présent"
                            value={exp.end}
                            onChange={(e) => updateAiExperience(exp.id, 'end', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <Label>Description des missions</Label>
                        <Textarea
                          placeholder="ex. Développement, optimisation, gestion d'équipe..."
                          value={exp.description}
                          onChange={(e) => updateAiExperience(exp.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAiExperience}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#1E2530]/20 px-3 py-2 text-sm font-medium text-[#8B93A1] transition-colors hover:border-[#17B8A0]/40 hover:text-[#17B8A0]"
                  >
                    <Plus className="size-4" /> Ajouter une expérience
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Formations */}
            <Card className="border-[#1E2530]/10">
              <CardContent className="space-y-4 p-6">
                <h3 className="cc-display text-base font-semibold text-[#1E2530]">Formation</h3>

                <div className="space-y-4">
                  {aiEducations.map((ed, idx) => (
                    <div key={ed.id} className="relative rounded-xl border border-[#1E2530]/10 p-4">
                      {aiEducations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAiEducation(ed.id)}
                          className="absolute right-3 top-3 text-[#8B93A1] hover:text-[#F2A93B]"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                      <p className="cc-mono mb-3 text-[10px] font-semibold uppercase text-[#8B93A1]">
                        Formation {idx + 1}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Diplôme</Label>
                          <Input
                            placeholder="ex. Diplôme d'Ingénieur"
                            value={ed.degree}
                            onChange={(e) => updateAiEducation(ed.id, 'degree', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>École</Label>
                          <Input
                            placeholder="ex. ENSI"
                            value={ed.school}
                            onChange={(e) => updateAiEducation(ed.id, 'school', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Année</Label>
                          <Input
                            placeholder="ex. 2021 - 2024"
                            value={ed.year}
                            onChange={(e) => updateAiEducation(ed.id, 'year', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Mention</Label>
                          <Input
                            placeholder="ex. Très Bien"
                            value={ed.grade}
                            onChange={(e) => updateAiEducation(ed.id, 'grade', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAiEducation}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#1E2530]/20 px-3 py-2 text-sm font-medium text-[#8B93A1] transition-colors hover:border-[#17B8A0]/40 hover:text-[#17B8A0]"
                  >
                    <Plus className="size-4" /> Ajouter une formation
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Compétences */}
            <Card className="border-[#1E2530]/10">
              <CardContent className="space-y-4 p-6">
                <h3 className="cc-display text-base font-semibold text-[#1E2530]">Compétences</h3>

                <div className="flex gap-2">
                  <Input
                    value={aiSkillInput}
                    onChange={(e) => setAiSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                        e.preventDefault()
                        addAiSkill()
                      }
                    }}
                    placeholder="ex. React, TypeScript, Node.js..."
                  />
                  <button
                    type="button"
                    onClick={addAiSkill}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0E1729] px-3 text-sm font-medium text-white"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                {aiSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {aiSkills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#17B8A0]/10 px-3 py-1 text-sm text-[#17B8A0]"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => setAiSkills(aiSkills.filter((x) => x !== s))}
                        >
                          <X className="size-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs italic text-[#8B93A1]">Aucune compétence ajoutée</p>
                )}
              </CardContent>
            </Card>

            {/* Langues & Intérêts */}
            <Card className="border-[#1E2530]/10">
              <CardContent className="space-y-4 p-6">
                <h3 className="cc-display text-base font-semibold text-[#1E2530]">Langues & Intérêts</h3>

                <div className="space-y-1.5">
                  <Label>Langues</Label>
                  <Input
                    placeholder="ex. Arabe (Maternelle), Français (Courant), Anglais"
                    value={aiProfile.languages}
                    onChange={(e) => setAiProfile({ ...aiProfile, languages: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Centres d'intérêt</Label>
                  <Input
                    placeholder="ex. Open-source, Lecture, Sport"
                    value={aiProfile.interests}
                    onChange={(e) => setAiProfile({ ...aiProfile, interests: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Bouton Générer */}
            <AIGeneratorButton
              profileData={{
                name: aiProfile.name,
                email: aiProfile.email,
                phone: aiProfile.phone,
                location: aiProfile.location,
                title: aiProfile.title,
                summary: aiProfile.summary,
                languages: aiProfile.languages,
                interests: aiProfile.interests,
                photo: aiPhoto || undefined,
                skills: aiSkills,
                experiences: aiExperiences,
                educations: aiEducations,
              }}
            />
          </div>
        </div>
      )}

      {/* ========== MODE EXPERT: FORMULAIRE SIMPLE ========== */}
      {mode === 'expert' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMode(null)}
              className="text-sm text-[#8B93A1] hover:text-[#1E2530]"
            >
              ← Retour
            </button>
            <h2 className="cc-display text-lg font-bold text-[#1E2530]">Conception par un expert</h2>
          </div>

          <Card className="border-[#1E2530]/10">
            <CardContent className="space-y-6 p-6">
              <div>
                <h3 className="cc-display mb-2 text-base font-semibold text-[#1E2530]">Votre Profil</h3>
                <p className="mb-4 text-sm text-[#8B93A1]">
                  Donnez-nous quelques informations pour que notre expert puisse rédiger votre CV
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Nom complet *</Label>
                    <Input
                      placeholder="ex. Yassine Ben Salah"
                      value={expertProfile.name}
                      onChange={(e) => setExpertProfile({ ...expertProfile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Poste visé</Label>
                    <Input
                      placeholder="ex. Ingénieur Logiciel"
                      value={expertProfile.title}
                      onChange={(e) => setExpertProfile({ ...expertProfile, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input
                      placeholder="ex. email@example.com"
                      value={expertProfile.email}
                      onChange={(e) => setExpertProfile({ ...expertProfile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Téléphone</Label>
                    <Input
                      placeholder="ex. +216 55 123 456"
                      value={expertProfile.phone}
                      onChange={(e) => setExpertProfile({ ...expertProfile, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-[#1E2530]/10 pt-6">
                <h3 className="cc-display mb-2 text-base font-semibold text-[#1E2530]">Notes pour l'expert</h3>
                <Textarea
                  className="min-h-32"
                  placeholder="Décrivez votre parcours, votre expérience, le type de poste visé, le style de CV souhaité (moderne, sobre, créatif...), et toute information utile pour la rédaction de votre CV..."
                  value={expertNotes}
                  onChange={(e) => setExpertNotes(e.target.value)}
                />
              </div>

              <div className="border-t border-[#1E2530]/10 pt-6">
                <h3 className="cc-display mb-2 text-base font-semibold text-[#1E2530]">Documents</h3>
                <p className="mb-3 text-sm text-[#8B93A1]">
                  Joignez votre ancien CV, diplômes, certificats... (optionnel)
                </p>
                <UploadZone label="Glissez-déposez vos documents ici" />
              </div>

              <button
                type="button"
                onClick={handleExpertRequest}
                disabled={!expertProfile.name.trim()}
                className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#F2A93B] text-sm font-medium text-[#0E1729] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-4" /> Envoyer ma demande à l'expert
              </button>

              {expertRequested && (
                <p className="flex items-center gap-2 rounded-lg border border-[#17B8A0]/20 bg-[#17B8A0]/5 px-3 py-2 text-sm font-medium text-[#17B8A0]">
                  ✓ Demande envoyée ! Votre CV sera prêt sous 2 jours max.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="border-[#F2A93B]/20 bg-[#F2A93B]/5">
            <CardContent className="p-5">
              <h4 className="cc-display flex items-center gap-2 text-sm font-semibold text-[#F2A93B]">
                <Clock className="size-4" /> Comment ça marche
              </h4>
              <ul className="mt-3 space-y-2 text-xs text-[#8B93A1]">
                <li>1. Vous nous donnez vos informations et documents</li>
                <li>2. Un expert analyse votre profil</li>
                <li>3. Il rédige votre CV avec une belle mise en forme</li>
                <li>4. Livraison en 2 jours max</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
