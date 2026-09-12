'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Heart,
  Plus,
  X,
  ArrowUp,
  ArrowDown,
  Upload,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  LayoutTemplate,
  Palette,
  Globe,
  Type,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { CVColors, DEFAULT_CV_COLORS } from '@/hooks/useAICVGenerator'
import { mapParsedCvToFormState, parseCvPdf } from '@/lib/cv-import'
import {
  TemplateGalleryPicker,
  type CvTemplateKey,
} from '@/components/cv-generator/template-gallery'
import { DownloadCVButton } from '@/components/cv-generator/download-cv-button'
import type { ElementStyles } from '@/components/cv-generator/cv-template'

const CVTemplate = dynamic(
  () => import('@/components/cv-generator/cv-template').then((mod) => mod.CVTemplate),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
          <p className="text-sm font-medium text-slate-800">Chargement du CV...</p>
          <p className="mt-1 text-xs text-slate-500">Préparation de l'aperçu</p>
        </div>
      </div>
    ),
  }
)

const SECTIONS = [
  { key: 'personal', label: 'Informations', icon: User, description: 'Nom, titre, contact' },
  { key: 'experience', label: 'Expériences', icon: Briefcase, description: 'Parcours professionnel' },
  { key: 'internships', label: 'Stages', icon: Building2, description: 'Stages et alternances' },
  { key: 'education', label: 'Formations', icon: GraduationCap, description: 'Diplômes et cursus' },
  { key: 'skills', label: 'Compétences', icon: Wrench, description: 'Savoir-faire techniques' },
  { key: 'extras', label: 'Langues & Intérêts', icon: Heart, description: 'Plus sur vous' },
]

const COLOR_ELEMENT_LABELS: Record<keyof CVColors, string> = {
  sidebarBackground: 'Fond sidebar',
  sidebarText: 'Texte sidebar',
  sidebarIcon: 'Icônes sidebar',
  contactBackground: 'Fond contact',
  contactTitle: 'Titre contact',
  contactText: 'Texte contact',
  name: 'Nom',
  jobTitle: 'Titre du poste',
  sectionTitle: 'Titre de section',
  sectionIcon: 'Icône de section',
  bodyText: 'Texte principal',
  secondaryText: 'Texte secondaire',
  dates: 'Dates',
  companyName: 'Nom entreprise',
  educationTitle: 'Titre formation',
  skillBackground: 'Fond compétence',
  skillText: 'Texte compétence',
  languageBackground: 'Fond langue',
  languageText: 'Texte langue',
  interestBackground: 'Fond intérêt',
  interestText: 'Texte intérêt',
  divider: 'Séparateurs',
  border: 'Bordures',
  icon: 'Icônes',
  accent: 'Couleur d\'accent',
}

const PRESET_COLORS = [
  '#0F172A', '#1E293B', '#334155', '#475569',
  '#059669', '#0D9488', '#0891B2', '#2563EB',
  '#7C3AED', '#DB2777', '#DC2626', '#F59E0B',
]

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48]

function normalizeHex(value: string) {
  const hex = value.trim().replace(/^#/, '')
  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return ''
  return `#${hex.toUpperCase()}`
}

function isValidHexColor(value: string) {
  return /^#[0-9A-F]{6}$/i.test(value)
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex)
  if (!normalized) return null
  const bigint = parseInt(normalized.slice(1), 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

function rgbToHsl(rgb: { r: number; g: number; b: number } | null) {
  if (!rgb) return null
  let { r, g, b } = rgb
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

type ExperienceEntry = {
  id: string
  position: string
  company: string
  start: string
  end: string
  description: string
}

type InternshipEntry = {
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

type CompetenceCategoryEntry = {
  id: string
  title: string
  skills: { id: string; name: string }[]
}

type LanguageEntryForm = {
  id: string
  name: string
  level?: string
}

function emptyExperience(): ExperienceEntry {
  return { id: crypto.randomUUID(), position: '', company: '', start: '', end: '', description: '' }
}

function emptyInternship(): InternshipEntry {
  return { id: crypto.randomUUID(), position: '', company: '', start: '', end: '', description: '' }
}

function emptyEducation(): EducationEntry {
  return { id: crypto.randomUUID(), degree: '', school: '', year: '', grade: '' }
}

function emptyCompetenceCategory(title = ''): CompetenceCategoryEntry {
  return { id: crypto.randomUUID(), title, skills: [] }
}

function emptyCompetenceSkill(name = '') {
  return { id: crypto.randomUUID(), name }
}

function emptyLanguageEntry(name = '', level = ''): LanguageEntryForm {
  return { id: crypto.randomUUID(), name, level: level || undefined }
}

function parseLanguageEntry(raw: string): LanguageEntryForm {
  const trimmed = raw.trim()
  if (!trimmed) return emptyLanguageEntry()

  const match = trimmed.match(/^(.+?)\s*(?:\(([^)]+)\)|[-–—:]\s*(.+))$/)
  if (match) {
    const name = match[1].trim()
    const level = (match[2] || match[3] || '').trim()
    return emptyLanguageEntry(name, level)
  }

  return emptyLanguageEntry(trimmed)
}

function parseLanguageEntries(rawLanguages: string[]): LanguageEntryForm[] {
  return rawLanguages
    .map((language) => parseLanguageEntry(language))
    .filter((entry) => entry.name.trim())
}

const TRANSLATION_DICTIONARY: Record<string, string> = {
  'à propos de moi': 'about me',
  'profil': 'profile',
  'expérience professionnelle': 'professional experience',
  'formation': 'education',
  'compétences': 'skills',
  'langues': 'languages',
  'intérêts': 'interests',
  'contact': 'contact',
  'niveau (optionnel)': 'level (optional)',
  'développement logiciel': 'software development',
  'développement web': 'web development',
  'ingénieur': 'software engineer',
  'spécialisé': 'specialized',
  'spécialisée': 'specialized',
  'informatique': 'technology',
  'application': 'application',
  'applications': 'applications',
  'gestion de projet': 'project management',
  'projet': 'project',
  'projets': 'projects',
  'équipe': 'team',
  'client': 'client',
  'clients': 'clients',
  'mention': 'mention',
  'préparé': 'prepared',
  'recherche': 'research',
  'électronique': 'electronics',
  'communication': 'communication',
  'optimisation': 'optimization',
}

const PRESERVE_TERMS = new Set([
  'javascript', 'react', 'vue', 'angular', 'python', 'spring', 'spring boot',
  'laravel', 'node.js', 'node', 'typescript', 'php', 'java', 'sql', 'aws',
  'docker', 'kubernetes', 'git', 'next.js', 'next', 'tailwind', 'figma',
  'adobe', 'mongodb', 'postgresql', 'mysql', 'android', 'ios', 'ux', 'ui',
  'seo', 'api', 'saas', 'ci/cd', 'crm',
])

function translateWord(word: string) {
  const normalized = word.toLowerCase()
  if (PRESERVE_TERMS.has(normalized)) return word
  if (TRANSLATION_DICTIONARY[normalized]) {
    const translated = TRANSLATION_DICTIONARY[normalized]
    return word[0] === word[0].toUpperCase() ? `${translated[0].toUpperCase()}${translated.slice(1)}` : translated
  }
  return word
}

function translateText(value: string, locale: 'fr' | 'en') {
  if (locale === 'fr' || !value) return value

  let translated = value
  const phrases: Array<[RegExp, string]> = [
    [/à propos de moi/gi, 'about me'],
    [/expérience professionnelle/gi, 'professional experience'],
    [/formation/gi, 'education'],
    [/compétences/gi, 'skills'],
    [/langues/gi, 'languages'],
    [/intérêts/gi, 'interests'],
    [/niveau \(optionnel\)/gi, 'level (optional)'],
    [/développement logiciel/gi, 'software development'],
    [/développement web/gi, 'web development'],
    [/gestion de projet/gi, 'project management'],
  ]

  for (const [pattern, replacement] of phrases) {
    translated = translated.replace(pattern, replacement)
  }

  translated = translated.replace(/\b[\p{L}0-9'’.-]+\b/gu, (match) => translateWord(match))
  return translated
}

interface CvBuilderViewProps {
  user?: {
    name?: string
    email?: string
  }
}

export function CvBuilderView({ user }: CvBuilderViewProps) {
  const [section, setSection] = useState('personal')
  const [selectedTemplate, setSelectedTemplate] = useState<CvTemplateKey>('modern')
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [locale, setLocale] = useState<'fr' | 'en'>('fr')
  const previewRef = useRef<HTMLDivElement | null>(null)

  // Element styles for click-based customization
  const [elementStyles, setElementStyles] = useState<ElementStyles>({})
  const [selectedElement, setSelectedElement] = useState<string | null>(null)

  // Determine selected element type for customization panel
  const getElementType = (elementId: string | null): 'text' | 'section' | 'skill' | 'divider' | 'sidebar' | 'unknown' => {
    if (!elementId) return 'unknown'
    if (elementId === 'sidebarBackground') return 'sidebar'
    if (elementId === 'name' || elementId === 'jobTitle' || 
        elementId.startsWith('exp-position-') || elementId.startsWith('exp-company-') || 
        elementId.startsWith('exp-desc-') || elementId.startsWith('intern-position-') ||
        elementId.startsWith('intern-company-') || elementId.startsWith('intern-desc-') ||
        elementId.startsWith('edu-degree-') || elementId.startsWith('edu-school-') ||
        elementId === 'aboutText' || elementId === 'contactEmail' || 
        elementId === 'contactPhone' || elementId === 'contactLocation') {
      return 'text'
    }
    if (elementId.startsWith('skill-') || elementId.startsWith('lang-') || elementId.startsWith('interest-') ||
        elementId.startsWith('skill-category-')) {
      return 'skill'
    }
    if (elementId.endsWith('Divider')) {
      return 'divider'
    }
    if (elementId === 'aboutTitle' || elementId === 'contactTitle' || 
        elementId === 'skillsTitle' || elementId === 'languagesTitle' || 
        elementId === 'interestsTitle' || elementId === 'experienceTitle' ||
        elementId === 'internshipTitle' || elementId === 'educationTitle') {
      return 'section'
    }
    return 'unknown'
  }

  const selectedElementType = getElementType(selectedElement)

  const showColorCustomization = [
    'modern', 'creative', 'professional', 'executive', 'sidebar',
    'simple', 'elegant', 'modern2', 'clean', 'corporate', 'tech',
    'student', 'professional2'
  ].includes(selectedTemplate)

  const [templateColors, setTemplateColors] = useState<
    Record<CvTemplateKey, CVColors>
  >({
    modern: DEFAULT_CV_COLORS,
    classic: DEFAULT_CV_COLORS,
    creative: DEFAULT_CV_COLORS,
    minimalist: DEFAULT_CV_COLORS,
    professional: DEFAULT_CV_COLORS,
    executive: DEFAULT_CV_COLORS,
    ats: DEFAULT_CV_COLORS,
    sidebar: DEFAULT_CV_COLORS,
    simple: DEFAULT_CV_COLORS,
    elegant: DEFAULT_CV_COLORS,
    modern2: DEFAULT_CV_COLORS,
    clean: DEFAULT_CV_COLORS,
    corporate: DEFAULT_CV_COLORS,
    tech: DEFAULT_CV_COLORS,
    compact: DEFAULT_CV_COLORS,
    student: DEFAULT_CV_COLORS,
    professional2: DEFAULT_CV_COLORS,
    minimal2: DEFAULT_CV_COLORS,
  })
  const [selectedColorElement, setSelectedColorElement] = useState<keyof CVColors>('accent')
  const [colorInput, setColorInput] = useState(DEFAULT_CV_COLORS.accent)
  const [recentColors, setRecentColors] = useState<string[]>([])

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
  const colors = templateColors[selectedTemplate] || DEFAULT_CV_COLORS
  const [competenceCategories, setCompetenceCategories] = useState<CompetenceCategoryEntry[]>([])
  const [categorySkillInputs, setCategorySkillInputs] = useState<Record<string, string>>({})
  const [newCategoryTitle, setNewCategoryTitle] = useState('')
  const [languageEntries, setLanguageEntries] = useState<LanguageEntryForm[]>([])
  const STORAGE_KEY = 'cc_cv_builder_draft'

  useEffect(() => {
    setColorInput(colors[selectedColorElement] || '')
  }, [selectedColorElement, colors])

  function addRecentColor(color: string) {
    setRecentColors((prev) => {
      const next = [color, ...prev.filter((c) => c !== color)]
      return next.slice(0, 8)
    })
  }

  function updateColorElement(key: keyof CVColors, value: string) {
    const color = normalizeHex(value)
    if (!color) return
    setTemplateColors((prev) => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        [key]: color,
      },
    }))
    addRecentColor(color)
  }

  function handleColorChange(value: string) {
    const color = normalizeHex(value)
    setColorInput(value)
    if (color) {
      updateColorElement(selectedColorElement, color)
    }
  }

  function handleColorPickerChange(value: string) {
    const color = normalizeHex(value)
    if (!color) return
    setColorInput(color)
    updateColorElement(selectedColorElement, color)
  }

  function handlePresetColor(value: string) {
    const color = normalizeHex(value)
    if (!color) return
    setColorInput(color)
    updateColorElement(selectedColorElement, color)
  }

  function resetSelectedColor() {
    const defaultColor = DEFAULT_CV_COLORS[selectedColorElement]
    setTemplateColors((prev) => ({
      ...prev,
      [selectedTemplate]: {
        ...prev[selectedTemplate],
        [selectedColorElement]: defaultColor,
      },
    }))
    setColorInput(defaultColor)
  }

  function resetAllColors() {
    const defaultColors: Record<CvTemplateKey, CVColors> = {
      modern: DEFAULT_CV_COLORS,
      classic: DEFAULT_CV_COLORS,
      creative: DEFAULT_CV_COLORS,
      minimalist: DEFAULT_CV_COLORS,
      professional: DEFAULT_CV_COLORS,
      executive: DEFAULT_CV_COLORS,
      ats: DEFAULT_CV_COLORS,
      sidebar: DEFAULT_CV_COLORS,
      simple: DEFAULT_CV_COLORS,
      elegant: DEFAULT_CV_COLORS,
      modern2: DEFAULT_CV_COLORS,
      clean: DEFAULT_CV_COLORS,
      corporate: DEFAULT_CV_COLORS,
      tech: DEFAULT_CV_COLORS,
      compact: DEFAULT_CV_COLORS,
      student: DEFAULT_CV_COLORS,
      professional2: DEFAULT_CV_COLORS,
      minimal2: DEFAULT_CV_COLORS,
    }
    setTemplateColors(defaultColors)
    setSelectedColorElement('accent')
    setColorInput(DEFAULT_CV_COLORS.accent)
    setRecentColors([])
  }

  // Element style handlers
  const handleElementStyleChange = (elementId: string, style: { color?: string; fontSize?: number; fontWeight?: string; barColor?: string; backgroundColor?: string; borderColor?: string; thickness?: number }) => {
    setElementStyles((prev) => ({
      ...prev,
      [elementId]: {
        ...prev[elementId],
        ...style,
      },
    }))
  }

  const [photo, setPhoto] = useState<string | null>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function addCategory() {
    const title = newCategoryTitle.trim() || 'Nouvelle catégorie'
    const category = emptyCompetenceCategory(title)
    setCompetenceCategories((prev) => [...prev, category])
    setCategorySkillInputs((prev) => ({ ...prev, [category.id]: '' }))
    setNewCategoryTitle('')
  }

  function updateCategoryTitle(categoryId: string, title: string) {
    setCompetenceCategories((prev) => prev.map((category) => (category.id === categoryId ? { ...category, title } : category)))
  }

  function deleteCategory(categoryId: string) {
    setCompetenceCategories((prev) => prev.filter((category) => category.id !== categoryId))
    setCategorySkillInputs((prev) => {
      const next = { ...prev }
      delete next[categoryId]
      return next
    })
  }

  function moveCategory(categoryId: string, direction: 'up' | 'down') {
    setCompetenceCategories((prev) => {
      const index = prev.findIndex((category) => category.id === categoryId)
      if (index === -1) return prev
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (nextIndex < 0 || nextIndex >= prev.length) return prev
      const next = [...prev]
      const [removed] = next.splice(index, 1)
      next.splice(nextIndex, 0, removed)
      return next
    })
  }

  function updateCategorySkillInput(categoryId: string, value: string) {
    setCategorySkillInputs((prev) => ({ ...prev, [categoryId]: value }))
  }

  function addSkillToCategory(categoryId: string) {
    const skillName = (categorySkillInputs[categoryId] || '').trim()
    if (!skillName) return
    setCompetenceCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              skills: [...category.skills, emptyCompetenceSkill(skillName)],
            }
          : category,
      ),
    )
    setCategorySkillInputs((prev) => ({ ...prev, [categoryId]: '' }))
  }

  function updateSkillName(categoryId: string, skillId: string, name: string) {
    setCompetenceCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              skills: category.skills.map((skill) => (skill.id === skillId ? { ...skill, name } : skill)),
            }
          : category,
      ),
    )
  }

  function deleteSkill(categoryId: string, skillId: string) {
    setCompetenceCategories((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? { ...category, skills: category.skills.filter((skill) => skill.id !== skillId) }
          : category,
      ),
    )
  }

  function moveSkill(categoryId: string, skillId: string, direction: 'up' | 'down') {
    setCompetenceCategories((prev) =>
      prev.map((category) => {
        if (category.id !== categoryId) return category
        const index = category.skills.findIndex((skill) => skill.id === skillId)
        if (index === -1) return category
        const nextIndex = direction === 'up' ? index - 1 : index + 1
        if (nextIndex < 0 || nextIndex >= category.skills.length) return category
        const nextSkills = [...category.skills]
        const [removed] = nextSkills.splice(index, 1)
        nextSkills.splice(nextIndex, 0, removed)
        return { ...category, skills: nextSkills }
      }),
    )
  }

  const LANGUAGE_LEVEL_OPTIONS = [
    'Débutant', 'Intermédiaire', 'Avancé', 'B1', 'B2', 'C1', 'C2', 'Natif'
  ]

  function addLanguageEntry() {
    setLanguageEntries((prev) => [...prev, emptyLanguageEntry('')])
  }

  function updateLanguageEntry(id: string, field: 'name' | 'level', value: string) {
    setLanguageEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? {
              ...entry,
              [field]: field === 'name' ? value.trimStart() : value || undefined,
            }
          : entry,
      ),
    )
  }

  function deleteLanguageEntry(id: string) {
    setLanguageEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  function moveLanguageEntry(id: string, direction: 'up' | 'down') {
    setLanguageEntries((prev) => {
      const index = prev.findIndex((entry) => entry.id === id)
      if (index === -1) return prev
      const nextIndex = direction === 'up' ? index - 1 : index + 1
      if (nextIndex < 0 || nextIndex >= prev.length) return prev
      const next = [...prev]
      const [removed] = next.splice(index, 1)
      next.splice(nextIndex, 0, removed)
      return next
    })
  }

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

  const [internships, setInternships] = useState<InternshipEntry[]>([])

  function updateInternship(id: string, field: keyof InternshipEntry, value: string) {
    setInternships((prev) => prev.map((intern) => (intern.id === id ? { ...intern, [field]: value } : intern)))
  }
  function addInternship() {
    setInternships((prev) => [...prev, emptyInternship()])
  }
  function removeInternship(id: string) {
    setInternships((prev) => prev.filter((intern) => intern.id !== id))
  }

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

  const [notes, setNotes] = useState('')
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (!saved) return

    try {
      const parsed = JSON.parse(saved) as {
        profile?: typeof profile
        competenceCategories?: CompetenceCategoryEntry[]
        categorySkillInputs?: Record<string, string>
        newCategoryTitle?: string
        languageEntries?: LanguageEntryForm[]
        experiences?: ExperienceEntry[]
        internships?: InternshipEntry[]
        educations?: EducationEntry[]
        notes?: string
        selectedTemplate?: CvTemplateKey
        templateColors?: Record<CvTemplateKey, CVColors>
        selectedColorElement?: keyof CVColors
        locale?: 'fr' | 'en'
        photo?: string | null
        elementStyles?: ElementStyles
        selectedElement?: string | null
      }

      if (parsed.profile) setProfile((current) => ({ ...current, ...parsed.profile }))
      if (parsed.competenceCategories) setCompetenceCategories(parsed.competenceCategories)
      if (parsed.categorySkillInputs) setCategorySkillInputs(parsed.categorySkillInputs)
      if (parsed.newCategoryTitle) setNewCategoryTitle(parsed.newCategoryTitle)
      if (parsed.languageEntries) {
        setLanguageEntries(parsed.languageEntries)
      } else if (parsed.profile?.languages) {
        const legacyLanguages = parsed.profile.languages
          .split(',')
          .map((lang) => lang.trim())
          .filter(Boolean)
        if (legacyLanguages.length > 0) {
          setLanguageEntries(parseLanguageEntries(legacyLanguages))
        }
      }
      if (parsed.experiences) setExperiences(parsed.experiences)
      if (parsed.internships) setInternships(parsed.internships)
      if (parsed.educations) setEducations(parsed.educations)
      if (parsed.notes) setNotes(parsed.notes)
      if (parsed.selectedTemplate) setSelectedTemplate(parsed.selectedTemplate)
      if (parsed.templateColors) setTemplateColors(parsed.templateColors)
      if (parsed.selectedColorElement) setSelectedColorElement(parsed.selectedColorElement)
      if (parsed.locale) setLocale(parsed.locale)
      if (parsed.photo) setPhoto(parsed.photo)
      if (parsed.elementStyles) setElementStyles(parsed.elementStyles)
      if (parsed.selectedElement) setSelectedElement(parsed.selectedElement)
    } catch (error) {
      console.error('Failed to restore CV draft from localStorage', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const draft = {
      profile,
      competenceCategories,
      categorySkillInputs,
      newCategoryTitle,
      languageEntries,
      experiences,
      internships,
      educations,
      notes,
      selectedTemplate,
      templateColors,
      selectedColorElement,
      locale,
      photo,
      elementStyles,
      selectedElement,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  }, [profile, competenceCategories, categorySkillInputs, newCategoryTitle, languageEntries, experiences, internships, educations, notes, selectedTemplate, templateColors, selectedColorElement, locale, photo, elementStyles, selectedElement])

  const visibleExperiences = experiences.filter((exp) =>
    [exp.position, exp.company, exp.start, exp.end, exp.description].some((value) => value.trim()),
  )
  const visibleInternships = internships.filter((intern) =>
    [intern.position, intern.company, intern.start, intern.end, intern.description].some((value) => value.trim()),
  )
  const visibleEducations = educations.filter((ed) => [ed.degree, ed.school, ed.year, ed.grade].some((value) => value.trim()))
  const flatSkills = competenceCategories
    .flatMap((category) => category.skills.map((skill) => skill.name.trim()))
    .filter(Boolean)

  const hasPersonalContent = Boolean(
    profile.name.trim() || profile.title.trim() || profile.email.trim() ||
    profile.phone.trim() || profile.location.trim() || profile.summary.trim(),
  )
  const isPersonalComplete = hasPersonalContent
  const isExperienceComplete = visibleExperiences.length > 0
  const isInternshipsComplete = visibleInternships.length > 0
  const isEducationComplete = visibleEducations.length > 0
  const isSkillsComplete = flatSkills.length > 0
  const visibleLanguages = languageEntries
    .map((entry) => ({ name: entry.name.trim(), level: entry.level?.trim() || '' }))
    .filter((entry) => entry.name)
  const visibleInterests = profile.interests
    .split(',')
    .map((interest) => interest.trim())
    .filter(Boolean)
  const isExtrasComplete = visibleLanguages.length > 0 || visibleInterests.length > 0

  const totalSections = SECTIONS.length
  const completedSections = [
    isPersonalComplete, isExperienceComplete, isInternshipsComplete,
    isEducationComplete, isSkillsComplete, isExtrasComplete
  ].filter(Boolean).length
  const progress = Math.round((completedSections / totalSections) * 100)

  async function handleQuickImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setImportStatus('Veuillez sélectionner un fichier PDF.')
      e.target.value = ''
      return
    }

    setIsImporting(true)
    setImportStatus('Analyse du CV en cours...')

    try {
      const parsed = await parseCvPdf(file)
      const mapped = mapParsedCvToFormState(parsed)

      const nextExperiences = mapped.experiences.length > 0
        ? mapped.experiences.map((exp, index) => ({
            id: `imported-exp-${index}`,
            position: exp.position,
            company: exp.company,
            start: exp.start,
            end: exp.end,
            description: exp.description,
          }))
        : [emptyExperience()]

      const nextEducations = mapped.education.length > 0
        ? mapped.education.map((edu, index) => ({
            id: `imported-edu-${index}`,
            degree: edu.degree,
            school: edu.school,
            year: edu.year,
            grade: edu.grade,
          }))
        : [emptyEducation()]

      setProfile((current) => ({
        ...current,
        name: mapped.profile.name || current.name,
        title: mapped.profile.title || current.title,
        email: mapped.profile.email || current.email,
        phone: mapped.profile.phone || current.phone,
        location: mapped.profile.location || current.location,
        summary: mapped.profile.summary || current.summary,
        languages: mapped.languages.join(', '),
        interests: mapped.interests.join(', '),
      }))
      setCompetenceCategories(
        mapped.skills.length > 0
          ? [{ id: 'imported-skills', title: 'Compétences', skills: mapped.skills.map((skill) => emptyCompetenceSkill(skill)) }]
          : [],
      )
      setExperiences(nextExperiences)
      setEducations(nextEducations)
      setImportStatus('CV importé avec succès.')
      setSection('personal')
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 250)
    } catch (error) {
      console.error('Failed to parse CV PDF', error)
      setImportStatus('L\'import du PDF a échoué.')
    } finally {
      setIsImporting(false)
      e.target.value = ''
    }
  }

  const cvData = {
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
    experiences: visibleExperiences.map((e) => ({
      id: e.id,
      position: e.position || '',
      company: e.company || '',
      startDate: e.start || '',
      endDate: e.end || '',
      description: e.description || '',
    })),
    internships: visibleInternships.map((i) => ({
      id: i.id,
      position: i.position || '',
      company: i.company || '',
      startDate: i.start || '',
      endDate: i.end || '',
      description: i.description || '',
    })),
    education: visibleEducations.map((ed) => ({
      id: ed.id,
      degree: ed.degree || '',
      school: ed.school || '',
      year: ed.year || '',
      mention: ed.grade || '',
    })),
    skills: flatSkills,
    competenceCategories,
    languages: visibleLanguages,
    interests: visibleInterests,
    colors: showColorCustomization ? colors : undefined,
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800">CV Builder</span>
              <span className="ml-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Pro</span>
            </div>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-3">
              <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600">{progress}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">
              <Upload className="h-3.5 w-3.5" />
              Importer
              <input type="file" accept=".pdf" className="hidden" onChange={handleQuickImport} disabled={isImporting} />
            </label>
            <button
              onClick={() => setLocale(locale === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <Globe className="h-3.5 w-3.5" />
              {locale === 'fr' ? 'EN' : 'FR'}
            </button>
            <DownloadCVButton cvData={cvData} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr]">
          {/* LEFT COLUMN - EDITOR */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-2 shadow-sm">
              <div className="grid grid-cols-3 gap-1">
                {SECTIONS.map((s) => {
                  const Icon = s.icon
                  const isActive = section === s.key
                  const isDone =
                    (s.key === 'personal' && isPersonalComplete) ||
                    (s.key === 'experience' && isExperienceComplete) ||
                    (s.key === 'internships' && isInternshipsComplete) ||
                    (s.key === 'education' && isEducationComplete) ||
                    (s.key === 'skills' && isSkillsComplete) ||
                    (s.key === 'extras' && isExtrasComplete)

                  return (
                    <button
                      key={s.key}
                      onClick={() => setSection(s.key)}
                      className={cn(
                        'group relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 text-center transition-all',
                        isActive
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      )}
                    >
                      <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-400')} />
                      <span className="text-[10px] font-medium leading-tight">{s.label}</span>
                      {isDone && !isActive && (
                        <CheckCircle2 className="absolute -right-0.5 -top-0.5 h-3 w-3 text-emerald-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
              {section === 'personal' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Informations personnelles</h3>
                    <p className="text-xs text-slate-500">Complétez vos coordonnées et votre présentation</p>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                      {photo ? (
                        <img src={photo} alt="Photo" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50">
                        <Upload className="h-4 w-4" />
                        {photo ? 'Changer' : 'Ajouter une photo'}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                      </label>
                      {photo && (
                        <button onClick={() => setPhoto(null)} className="text-xs text-red-400 hover:text-red-500">
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">Nom complet</Label>
                      <Input
                        placeholder="ex. Yassine Ben Salah"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">Intitulé du poste</Label>
                      <Input
                        placeholder="ex. Ingénieur Logiciel"
                        value={profile.title}
                        onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">Email</Label>
                      <Input
                        placeholder="ex. yassine@example.com"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-slate-600">Téléphone</Label>
                      <Input
                        placeholder="ex. +216 55 123 456"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="border-slate-200 focus:border-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">À propos de moi</Label>
                    <Textarea
                      placeholder="Présentez-vous en quelques phrases..."
                      value={profile.summary}
                      onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                      rows={4}
                      className="border-slate-200 focus:border-slate-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Localisation</Label>
                    <Input
                      placeholder="ex. Tunis, Tunisie"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="border-slate-200 focus:border-slate-400"
                    />
                  </div>
                </div>
              )}

              {section === 'experience' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Expériences professionnelles</h3>
                    <p className="text-xs text-slate-500">Ajoutez vos postes et missions</p>
                  </div>

                  {experiences.map((exp, idx) => (
                    <div key={exp.id} className="relative rounded-xl border border-slate-200/60 p-4">
                      {experiences.length > 1 && (
                        <button
                          onClick={() => removeExperience(exp.id)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        Expérience {idx + 1}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-600">Poste</Label>
                          <Input
                            placeholder="ex. Développeur Full Stack"
                            value={exp.position}
                            onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                            className="border-slate-200 focus:border-slate-400"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-600">Entreprise</Label>
                          <Input
                            placeholder="ex. Vermeg"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            className="border-slate-200 focus:border-slate-400"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-600">Début</Label>
                          <Input
                            placeholder="ex. Juin 2024"
                            value={exp.start}
                            onChange={(e) => updateExperience(exp.id, 'start', e.target.value)}
                            className="border-slate-200 focus:border-slate-400"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-600">Fin</Label>
                          <Input
                            placeholder="ex. Présent"
                            value={exp.end}
                            onChange={(e) => updateExperience(exp.id, 'end', e.target.value)}
                            className="border-slate-200 focus:border-slate-400"
                          />
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5">
                        <Label className="text-xs font-medium text-slate-600">Description</Label>
                        <Textarea
                          placeholder="Décrivez vos missions et réalisations..."
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          rows={3}
                          className="border-slate-200 focus:border-slate-400"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addExperience}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-500 transition-all hover:border-emerald-300 hover:text-emerald-600"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter une expérience
                  </button>
                </div>
              )}

              {section === 'internships' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Stages</h3>
                    <p className="text-xs text-slate-500">Ajoutez vos stages et alternances</p>
                  </div>

                  {internships.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
                      <Building2 className="h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-sm font-medium text-slate-600">Aucun stage ajouté</p>
                      <p className="text-xs text-slate-400">Ajoutez votre premier stage</p>
                      <button
                        onClick={addInternship}
                        className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter un stage
                      </button>
                    </div>
                  ) : (
                    <>
                      {internships.map((intern, idx) => (
                        <div key={intern.id} className="relative rounded-xl border border-slate-200/60 p-4">
                          <button
                            onClick={() => removeInternship(intern.id)}
                            className="absolute right-3 top-3 text-slate-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                            Stage {idx + 1}
                          </p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-slate-600">Poste</Label>
                              <Input
                                placeholder="ex. Stagiaire Développeur"
                                value={intern.position}
                                onChange={(e) => updateInternship(intern.id, 'position', e.target.value)}
                                className="border-slate-200 focus:border-slate-400"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-slate-600">Entreprise</Label>
                              <Input
                                placeholder="ex. Vermeg"
                                value={intern.company}
                                onChange={(e) => updateInternship(intern.id, 'company', e.target.value)}
                                className="border-slate-200 focus:border-slate-400"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-slate-600">Début</Label>
                              <Input
                                placeholder="ex. Juin 2024"
                                value={intern.start}
                                onChange={(e) => updateInternship(intern.id, 'start', e.target.value)}
                                className="border-slate-200 focus:border-slate-400"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-medium text-slate-600">Fin</Label>
                              <Input
                                placeholder="ex. Août 2024"
                                value={intern.end}
                                onChange={(e) => updateInternship(intern.id, 'end', e.target.value)}
                                className="border-slate-200 focus:border-slate-400"
                              />
                            </div>
                          </div>
                          <div className="mt-3 space-y-1.5">
                            <Label className="text-xs font-medium text-slate-600">Description</Label>
                            <Textarea
                              placeholder="Décrivez vos missions..."
                              value={intern.description}
                              onChange={(e) => updateInternship(intern.id, 'description', e.target.value)}
                              rows={3}
                              className="border-slate-200 focus:border-slate-400"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addInternship}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-500 transition-all hover:border-emerald-300 hover:text-emerald-600"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter un stage
                      </button>
                    </>
                  )}
                </div>
              )}

              {section === 'education' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Formations</h3>
                    <p className="text-xs text-slate-500">Ajoutez vos diplômes et cursus</p>
                  </div>

                  {educations.map((ed, idx) => (
                    <div key={ed.id} className="relative rounded-xl border border-slate-200/60 p-4">
                      {educations.length > 1 && (
                        <button
                          onClick={() => removeEducation(ed.id)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                        Formation {idx + 1}
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-600">Diplôme</Label>
                          <Input
                            placeholder="ex. Diplôme d'Ingénieur"
                            value={ed.degree}
                            onChange={(e) => updateEducation(ed.id, 'degree', e.target.value)}
                            className="border-slate-200 focus:border-slate-400"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-600">École</Label>
                          <Input
                            placeholder="ex. ENSI"
                            value={ed.school}
                            onChange={(e) => updateEducation(ed.id, 'school', e.target.value)}
                            className="border-slate-200 focus:border-slate-400"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-600">Année</Label>
                          <Input
                            placeholder="ex. 2021 - 2024"
                            value={ed.year}
                            onChange={(e) => updateEducation(ed.id, 'year', e.target.value)}
                            className="border-slate-200 focus:border-slate-400"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-600">Mention</Label>
                          <Input
                            placeholder="ex. Très Bien"
                            value={ed.grade}
                            onChange={(e) => updateEducation(ed.id, 'grade', e.target.value)}
                            className="border-slate-200 focus:border-slate-400"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addEducation}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-3 text-sm font-medium text-slate-500 transition-all hover:border-emerald-300 hover:text-emerald-600"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter une formation
                  </button>
                </div>
              )}

              {section === 'skills' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Compétences</h3>
                    <p className="text-xs text-slate-500">Organisez vos compétences par catégorie</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="Nouvelle catégorie..."
                      value={newCategoryTitle}
                      onChange={(e) => setNewCategoryTitle(e.target.value)}
                      className="border-slate-200 focus:border-slate-400"
                    />
                    <button
                      onClick={addCategory}
                      className="shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Ajouter
                    </button>
                  </div>

                  {competenceCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-8 text-center">
                      <Wrench className="h-10 w-10 text-slate-300" />
                      <p className="mt-3 text-sm font-medium text-slate-600">Aucune catégorie</p>
                      <p className="text-xs text-slate-400">Créez votre première catégorie de compétences</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {competenceCategories.map((category, categoryIndex) => (
                        <div key={category.id} className="rounded-xl border border-slate-200/60 p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <Input
                              value={category.title}
                              onChange={(e) => updateCategoryTitle(category.id, e.target.value)}
                              placeholder="Titre de la catégorie"
                              className="max-w-xs border-slate-200 focus:border-slate-400"
                            />
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => moveCategory(category.id, 'up')}
                                disabled={categoryIndex === 0}
                                className={cn(
                                  'rounded-lg p-1.5 text-slate-400 hover:bg-slate-100',
                                  categoryIndex === 0 && 'cursor-not-allowed opacity-40'
                                )}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => moveCategory(category.id, 'down')}
                                disabled={categoryIndex === competenceCategories.length - 1}
                                className={cn(
                                  'rounded-lg p-1.5 text-slate-400 hover:bg-slate-100',
                                  categoryIndex === competenceCategories.length - 1 && 'cursor-not-allowed opacity-40'
                                )}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteCategory(category.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {category.skills.map((skill) => (
                              <div key={skill.id} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5">
                                <span className="text-sm text-slate-700">{skill.name}</span>
                                <button
                                  onClick={() => deleteSkill(category.id, skill.id)}
                                  className="text-slate-400 hover:text-red-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <Input
                              value={categorySkillInputs[category.id] || ''}
                              onChange={(e) => updateCategorySkillInput(category.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                                  e.preventDefault()
                                  addSkillToCategory(category.id)
                                }
                              }}
                              placeholder="Nouvelle compétence..."
                              className="border-slate-200 focus:border-slate-400"
                            />
                            <button
                              onClick={() => addSkillToCategory(category.id)}
                              className="shrink-0 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                            >
                              Ajouter
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {section === 'extras' && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">Langues & Intérêts</h3>
                    <p className="text-xs text-slate-500">Ajoutez vos langues et centres d'intérêt</p>
                  </div>

                  <div className="space-y-3">
                    {languageEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-3">
                        <Input
                          placeholder="Langue"
                          value={entry.name}
                          onChange={(e) => updateLanguageEntry(entry.id, 'name', e.target.value)}
                          className="flex-1 border-slate-200 focus:border-slate-400"
                        />
                        <select
                          value={entry.level ?? ''}
                          onChange={(e) => updateLanguageEntry(entry.id, 'level', e.target.value)}
                          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                        >
                          <option value="">Niveau</option>
                          {LANGUAGE_LEVEL_OPTIONS.map((level) => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => deleteLanguageEntry(entry.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addLanguageEntry}
                      className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter une langue
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600">Centres d'intérêt</Label>
                    <Input
                      placeholder="ex. Open-source, Lecture, Sport"
                      value={profile.interests}
                      onChange={(e) => setProfile({ ...profile, interests: e.target.value })}
                      className="border-slate-200 focus:border-slate-400"
                    />
                    <p className="text-xs text-slate-400">Séparez par des virgules</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - PREVIEW */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-800">Choisissez un modèle</h3>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                  {selectedTemplate}
                </span>
              </div>
              <TemplateGalleryPicker
                selected={selectedTemplate}
                onSelect={(key) => setSelectedTemplate(key)}
              />
            </div>

            {showColorCustomization && (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-800">Personnalisation</h3>
                  </div>
                  <button
                    onClick={resetAllColors}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Réinitialiser
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePresetColor(preset)}
                      className="h-8 w-8 rounded-full border-2 border-slate-200 transition-all hover:scale-110 hover:border-slate-400"
                      style={{ background: preset }}
                      aria-label={preset}
                    />
                  ))}
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="color"
                    value={isValidHexColor(colorInput) ? colorInput : DEFAULT_CV_COLORS[selectedColorElement]}
                    onChange={(e) => handleColorPickerChange(e.target.value)}
                    className="h-10 w-10 cursor-pointer rounded-xl border border-slate-200 p-0"
                  />
                  <Input
                    value={colorInput}
                    onChange={(e) => handleColorChange(e.target.value)}
                    placeholder="#RRGGBB"
                    className="max-w-[140px] border-slate-200 font-mono text-sm focus:border-slate-400"
                  />
                  <span className="text-xs text-slate-400">
                    {selectedColorElement && COLOR_ELEMENT_LABELS[selectedColorElement]}
                  </span>
                </div>
              </div>
            )}

            {/* ELEMENT CUSTOMIZATION PANEL */}
            {selectedElement && selectedElementType !== 'unknown' && (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm animate-in slide-in-from-top-2 duration-200">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-800">
                      {selectedElementType === 'sidebar' ? 'Barre latérale' :
                       selectedElementType === 'text' ? 'Style du texte' :
                       selectedElementType === 'section' ? 'Style de section' :
                       selectedElementType === 'skill' ? 'Style de compétence' :
                       selectedElementType === 'divider' ? 'Séparateur' :
                       'Personnalisation'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedElement(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Color Picker */}
                  <div>
                    <Label className="text-xs font-medium text-slate-600">Couleur</Label>
                    <div className="mt-1 flex items-center gap-3">
                      <input
                        type="color"
                        value={elementStyles[selectedElement]?.color || 
                               (selectedElementType === 'divider' ? '#17B8A0' : 
                                selectedElementType === 'sidebar' ? '#0E1729' : '#000000')}
                        onChange={(e) => {
                          const color = normalizeHex(e.target.value)
                          if (color) {
                            handleElementStyleChange(selectedElement, { color })
                          }
                        }}
                        className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 p-0"
                      />
                      <Input
                        value={elementStyles[selectedElement]?.color || 
                               (selectedElementType === 'divider' ? '#17B8A0' : 
                                selectedElementType === 'sidebar' ? '#0E1729' : '#000000')}
                        onChange={(e) => {
                          const color = normalizeHex(e.target.value)
                          if (color) {
                            handleElementStyleChange(selectedElement, { color })
                          }
                        }}
                        className="max-w-[120px] border-slate-200 font-mono text-sm focus:border-slate-400"
                      />
                    </div>
                  </div>

                  {/* Font size for text and section elements */}
                  {(selectedElementType === 'text' || selectedElementType === 'section' || selectedElementType === 'skill') && (
                    <div>
                      <Label className="text-xs font-medium text-slate-600">Taille de police</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          onClick={() => {
                            const current = elementStyles[selectedElement]?.fontSize || 14
                            const prev = FONT_SIZES.filter(s => s < current).pop() || 10
                            handleElementStyleChange(selectedElement, { fontSize: prev })
                          }}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center text-sm font-medium">
                          {elementStyles[selectedElement]?.fontSize || 14}px
                        </span>
                        <button
                          onClick={() => {
                            const current = elementStyles[selectedElement]?.fontSize || 14
                            const next = FONT_SIZES.filter(s => s > current).shift() || 48
                            handleElementStyleChange(selectedElement, { fontSize: next })
                          }}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-sm hover:bg-slate-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={previewRef} className="rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-800">Aperçu du CV</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {visibleExperiences.length + visibleInternships.length + visibleEducations.length} entrées
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
                <CVTemplate
                  cvData={cvData}
                  selectedTemplate={selectedTemplate}
                  locale={locale}
                  selectedElement={selectedElement}
                  onSelectElement={setSelectedElement}
                  elementStyles={elementStyles}
                  onElementStyleChange={handleElementStyleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}