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
  CheckCircle2,
  Clock,
  Upload,
  Lock,
  Users,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { CVTemplate } from '@/components/cv-generator/cv-template'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { UploadZone } from '../upload-zone'
import { AIGeneratorButton } from '@/components/cv-generator/ai-generator-button'

const SECTIONS = [
  { key: 'personal', label: 'Informations', icon: User },
  { key: 'experience', label: 'Expériences', icon: Briefcase },
  { key: 'education', label: 'Formations', icon: GraduationCap },
  { key: 'skills', label: 'Compétences', icon: Wrench },
  { key: 'extras', label: 'Intérêts & Langues', icon: Heart },
]

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
  const [section, setSection] = useState('personal')
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'creative'>('modern')

  const [profile, setProfile] = useState(() => ({
    name: user?.name || '',
    title: '',
    email: user?.email || '',
    phone: '',
    location: '',
    summary: '',
    languages: '',
    interests: '',
  }))

  // ============ Photo de profil, utilisée dans Personal Info & Live preview ============
  const [photo, setPhoto] = useState<string | null>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  function addSkill() {
    const v = skillInput.trim()
    if (v && !skills.includes(v)) setSkills([...skills, v])
    setSkillInput('')
  }

  // ============ Expériences — état contrôlé (ajout/édition/suppression) ============
  const [experiences, setExperiences] = useState<ExperienceEntry[]>([emptyExperience()])

  function updateExperience(id: string, field: keyof ExperienceEntry, value: string) {
    setExperiences((prev) => prev.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)))
  }
  function addExperience() {
    setExperiences((prev) => [...prev, emptyExperience()])
  }
  function removeExperience(id: string) {
    setExperiences((prev) => (prev.length > 1 ? prev.filter((exp) => exp.id !== id) : prev))
  }

  // ============ Formations — même principe ============
  const [educations, setEducations] = useState<EducationEntry[]>([emptyEducation()])

  function updateEducation(id: string, field: keyof EducationEntry, value: string) {
    setEducations((prev) => prev.map((ed) => (ed.id === id ? { ...ed, [field]: value } : ed)))
  }
  function addEducation() {
    setEducations((prev) => [...prev, emptyEducation()])
  }
  function removeEducation(id: string) {
    setEducations((prev) => (prev.length > 1 ? prev.filter((ed) => ed.id !== id) : prev))
  }

  // ============ Notes & documents optionnels (utiles surtout si on passe par "Demandé") ============
  const [notes, setNotes] = useState('')
  const [requested, setRequested] = useState(false)

  function handleRequest() {
    if (!profile.name.trim()) return
    setRequested(true)
    setTimeout(() => setRequested(false), 5000)
  }

  // ============ Complétude du formulaire — conditionne l'activation de la génération IA ============
  const isPersonalComplete =
    profile.name.trim() &&
    profile.title.trim() &&
    profile.email.trim() &&
    profile.phone.trim() &&
    profile.location.trim() &&
    profile.summary.trim()

  const isExperienceComplete = experiences.every(
    (e) => e.position.trim() && e.company.trim() && e.start.trim() && e.end.trim() && e.description.trim(),
  )

  const isEducationComplete = educations.every((e) => e.degree.trim() && e.school.trim() && e.year.trim())

  const isSkillsComplete = skills.length > 0
  const isExtrasComplete = profile.languages.trim() && profile.interests.trim()

  const missingSections = [
    !isPersonalComplete && 'Informations',
    !isExperienceComplete && 'Expériences',
    !isEducationComplete && 'Formations',
    !isSkillsComplete && 'Compétences',
    !isExtrasComplete && 'Intérêts & Langues',
  ].filter(Boolean) as string[]

  const isFormComplete = missingSections.length === 0

  return (
    <div className="cc-body space-y-6">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .cc-display { font-family: 'Space Grotesk', sans-serif; }
        .cc-body { font-family: 'Inter', sans-serif; }
        .cc-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-4">
          {/* Section tabs */}
          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const isActive = section === s.key
              const isDone =
                (s.key === 'personal' && isPersonalComplete) ||
                (s.key === 'experience' && isExperienceComplete) ||
                (s.key === 'education' && isEducationComplete) ||
                (s.key === 'skills' && isSkillsComplete) ||
                (s.key === 'extras' && isExtrasComplete)
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSection(s.key)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-[#0E1729] bg-[#0E1729] text-white'
                      : 'border-[#1E2530]/10 bg-white text-[#8B93A1] hover:bg-[#1E2530]/5',
                  )}
                >
                  <Icon className="size-4" />
                  {s.label}
                  {isDone && <CheckCircle2 className="size-3.5 text-[#17B8A0]" />}
                </button>
              )
            })}
          </div>

          <Card className="border-[#1E2530]/10">
            <CardContent className="space-y-4 p-5">
              {section === 'personal' && (
                <>
                  {/* ============ Photo de profil ============ */}
                  <div className="flex items-center gap-4 pb-2">
                    <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#1E2530]/10 bg-[#1E2530]/[0.03]">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo} alt="Photo de profil" className="h-full w-full object-cover" />
                      ) : (
                        <User className="size-8 text-[#8B93A1]" />
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-1.5">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#1E2530]/15 bg-white px-3 py-2 text-sm font-medium text-[#1E2530] transition-colors hover:bg-[#1E2530]/5">
                        <Upload className="size-3.5" />
                        {photo ? 'Changer la photo' : 'Ajouter une photo'}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      </label>
                      {photo && (
                        <button
                          type="button"
                          onClick={() => setPhoto(null)}
                          className="text-xs font-medium text-[#F2A93B] hover:underline"
                        >
                          Supprimer la photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="cv-name">Nom complet</Label>
                      <Input
                        id="cv-name"
                        placeholder="ex. Yassine Ben Salah"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cv-title">Intitulé du poste</Label>
                      <Input
                        id="cv-title"
                        placeholder="ex. Ingénieur Logiciel"
                        value={profile.title}
                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cv-email">Email</Label>
                      <Input
                        id="cv-email"
                        placeholder="ex. yassine@example.com"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cv-phone">Téléphone</Label>
                      <Input
                        id="cv-phone"
                        placeholder="ex. +216 55 123 456"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cv-location">Localisation</Label>
                    <Input
                      id="cv-location"
                      placeholder="ex. Tunis, Tunisie"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cv-summary">Résumé professionnel</Label>
                    <Textarea
                      id="cv-summary"
                      placeholder="ex. Développeur passionné avec expérience en applications web..."
                      value={profile.summary}
                      onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                    />
                  </div>
                </>
              )}

              {section === 'experience' && (
                <div className="space-y-4">
                  {experiences.map((exp, idx) => (
                    <div key={exp.id} className="relative rounded-xl border border-[#1E2530]/10 p-4">
                      {experiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExperience(exp.id)}
                          aria-label="Supprimer cette expérience"
                          className="absolute right-3 top-3 text-[#8B93A1] hover:text-[#F2A93B]"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                      <p className="cc-mono mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#8B93A1]">
                        Expérience {idx + 1}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Poste</Label>
                          <Input
                            placeholder="ex. Développeur Full Stack"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Entreprise</Label>
                          <Input
                            placeholder="ex. Vermeg"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Début</Label>
                          <Input
                            placeholder="ex. Juin 2024"
                            value={exp.start}
                            onChange={(e) => updateExperience(exp.id, 'start', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Fin</Label>
                          <Input
                            placeholder="ex. Présent"
                            value={exp.end}
                            onChange={(e) => updateExperience(exp.id, 'end', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <Label>Description</Label>
                        <Textarea
                          placeholder="ex. Développement d'applications web et optimisation..."
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addExperience}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#1E2530]/20 px-3 py-2 text-sm font-medium text-[#8B93A1] transition-colors hover:border-[#17B8A0]/40 hover:text-[#17B8A0]"
                  >
                    <Plus className="size-4" /> Ajouter une expérience
                  </button>
                </div>
              )}

              {section === 'education' && (
                <div className="space-y-4">
                  {educations.map((ed, idx) => (
                    <div key={ed.id} className="relative rounded-xl border border-[#1E2530]/10 p-4">
                      {educations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeEducation(ed.id)}
                          aria-label="Supprimer cette formation"
                          className="absolute right-3 top-3 text-[#8B93A1] hover:text-[#F2A93B]"
                        >
                          <X className="size-4" />
                        </button>
                      )}
                      <p className="cc-mono mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#8B93A1]">
                        Formation {idx + 1}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label>Diplôme</Label>
                          <Input
                            placeholder="ex. Diplôme d'Ingénieur"
                            value={ed.degree}
                            onChange={(e) => updateEducation(ed.id, 'degree', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>École</Label>
                          <Input
                            placeholder="ex. ENSI"
                            value={ed.school}
                            onChange={(e) => updateEducation(ed.id, 'school', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Année</Label>
                          <Input
                            placeholder="ex. 2021 - 2024"
                            value={ed.year}
                            onChange={(e) => updateEducation(ed.id, 'year', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Mention</Label>
                          <Input
                            placeholder="ex. Très Bien"
                            value={ed.grade}
                            onChange={(e) => updateEducation(ed.id, 'grade', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addEducation}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#1E2530]/20 px-3 py-2 text-sm font-medium text-[#8B93A1] transition-colors hover:border-[#17B8A0]/40 hover:text-[#17B8A0]"
                  >
                    <Plus className="size-4" /> Ajouter une formation
                  </button>
                </div>
              )}

              {section === 'skills' && (
                <div className="space-y-3">
                  <Label>Compétences (Entrée pour ajouter)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                          e.preventDefault()
                          addSkill()
                        }
                      }}
                      placeholder="ex. React, TypeScript, Node.js..."
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0E1729] px-3 text-sm font-medium text-white"
                    >
                      <Plus className="size-4" /> Ajouter
                    </button>
                  </div>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#17B8A0]/10 px-3 py-1 text-sm text-[#17B8A0]"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => setSkills(skills.filter((x) => x !== s))}
                            aria-label={`Retirer ${s}`}
                          >
                            <X className="size-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-[#8B93A1]">Aucune compétence ajoutée.</p>
                  )}
                </div>
              )}

              {section === 'extras' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cv-languages">Langues</Label>
                    <Input
                      id="cv-languages"
                      placeholder="ex. Arabe (Maternelle), Français (Courant), Anglais"
                      value={profile.languages}
                      onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cv-interests">Centres d&apos;intérêt</Label>
                    <Input
                      id="cv-interests"
                      placeholder="ex. Open-source, Lecture, Sport"
                      value={profile.interests}
                      onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#334155]">Aperçu en direct</p>
              <p className="text-xs text-[#64748B]">Sélectionnez un modèle pour prévisualiser</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="cc-mono rounded-full bg-[#E6F6F1] px-2.5 py-1 text-[10px] font-medium text-[#0E766F]">Sauvegardé auto.</span>
            </div>
          </div>

          {/* Template selector */}
          <div className="mb-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedTemplate('modern')}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm text-center',
                selectedTemplate === 'modern'
                  ? 'border-[#0F172A] bg-[#F8FAFC] text-[#0F172A]'
                  : 'border-[#E6E9EE] bg-white text-[#334155] hover:bg-[#F8FAFC]'
              )}
            >
              Modern Minimalist
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('classic')}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm text-center',
                selectedTemplate === 'classic'
                  ? 'border-[#0F172A] bg-[#F8FAFC] text-[#0F172A]'
                  : 'border-[#E6E9EE] bg-white text-[#334155] hover:bg-[#F8FAFC]'
              )}
            >
              Executive Classic
            </button>
            <button
              type="button"
              onClick={() => setSelectedTemplate('creative')}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm text-center',
                selectedTemplate === 'creative'
                  ? 'border-[#0F172A] bg-[#F8FAFC] text-[#0F172A]'
                  : 'border-[#E6E9EE] bg-white text-[#334155] hover:bg-[#F8FAFC]'
              )}
            >
              Creative Clean
            </button>
          </div>

          <Card className="overflow-hidden border-[#E6E9EE] shadow-sm">
            <CardContent className="space-y-4 p-4">
              {/* Build cvData from current form state (data-only, no placeholders) */}
              <CVTemplate
                cvData={{
                  personal: {
                    name: profile.name || '',
                    title: profile.title || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                    location: profile.location || '',
                    summary: profile.summary || '',
                    photo: photo || undefined,
                  },
                  template: selectedTemplate,
                  experiences: experiences.map((e) => ({
                    id: e.id,
                    position: e.position || '',
                    company: e.company || '',
                    startDate: e.start || '',
                    endDate: e.end || '',
                    description: e.description || '',
                  })),
                  education: educations.map((ed) => ({
                    id: ed.id,
                    degree: ed.degree || '',
                    school: ed.school || '',
                    year: ed.year || '',
                    mention: ed.grade || '',
                  })),
                  skills: skills || [],
                  languages: profile.languages ? profile.languages.split(',').map((l) => l.trim()) : [],
                  interests: profile.interests ? profile.interests.split(',').map((i) => i.trim()) : [],
                }}
                selectedTemplate={selectedTemplate}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ============ Finalisation — notes/documents optionnels + les 2 actions ============ */}
      <Card className="border-[#1E2530]/10">
        <CardContent className="space-y-5 p-6">
          <div>
            <h3 className="cc-display text-base font-semibold text-[#1E2530]">Finaliser votre CV</h3>
            <p className="mt-0.5 text-sm text-[#8B93A1]">
              Générez-le vous-même avec l&apos;IA, ou faites-le rédiger par un expert humain.
            </p>
            <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-[#1E2530]/10 bg-[#1E2530]/[0.02] px-3 py-2 text-xs text-[#8B93A1]">
              <Lock className="mt-0.5 size-3.5 shrink-0 text-[#17B8A0]" />
              L&apos;IA n&apos;invente rien : elle utilise uniquement les informations que vous avez saisies
              dans le formulaire ci-dessus et dans les notes complémentaires (optionnel). Tout champ que
              vous laissez vide restera vide dans le CV généré.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cv-notes">Notes complémentaires (optionnel)</Label>
            <Textarea
              id="cv-notes"
              className="min-h-24"
              placeholder="Style souhaité, poste visé, informations utiles pour l'IA ou pour l'expert qui traitera votre demande..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Documents à joindre (optionnel — ancien CV, diplômes, certificats...)</Label>
            <UploadZone label="Glissez-déposez vos documents ici" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* ============ Générer avec IA — désactivé tant que le formulaire n'est pas complet ============ */}
            <div className="relative flex-1">
              {!isFormComplete && (
                <div
                  className="absolute inset-0 z-10 cursor-not-allowed rounded-lg"
                  aria-hidden="true"
                  title="Complétez tout le formulaire pour activer la génération IA"
                />
              )}
              <div className={cn(!isFormComplete && 'pointer-events-none opacity-50 grayscale-[30%]')}>
                {(() => {
                  const profilePayload: any = {
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                    location: profile.location,
                    title: profile.title,
                    summary: profile.summary,
                    languages: profile.languages,
                    interests: profile.interests,
                    photo: photo || undefined,
                    skills,
                    experiences,
                    educations,
                    selectedTemplate,
                  }
                  return <AIGeneratorButton disabled={!isFormComplete} profileData={profilePayload} />
                })()}
              </div>
            </div>

            {/* ============ Demandé — envoie la demande à un expert humain ============ */}
            <button
              type="button"
              onClick={handleRequest}
              disabled={!profile.name.trim()}
              className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#F2A93B] text-sm font-medium text-[#0E1729] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-4" /> Demandé à l&apos;expert
            </button>
          </div>

          {!isFormComplete && (
            <p className="flex items-start gap-1.5 text-xs text-[#F2A93B]">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              Complétez d&apos;abord : {missingSections.join(', ')} — pour activer la génération du CV par IA.
            </p>
          )}

          {requested && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-[#17B8A0]">
              <Clock className="size-3.5" /> Demande envoyée — votre CV sera prêt sous 2 jours max.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
