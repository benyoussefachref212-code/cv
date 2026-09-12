import { useState } from 'react'

export type SidebarColor = 'navy' | 'charcoal' | 'forest' | 'purple'

export interface CVColors {
  sidebarBackground: string
  sidebarText: string
  sidebarIcon: string
  contactBackground: string
  contactTitle: string
  contactText: string
  name: string
  jobTitle: string
  sectionTitle: string
  sectionIcon: string
  bodyText: string
  secondaryText: string
  dates: string
  companyName: string
  educationTitle: string
  skillBackground: string
  skillText: string
  languageBackground: string
  languageText: string
  interestBackground: string
  interestText: string
  divider: string
  border: string
  icon: string
  accent: string
}

export const DEFAULT_CV_COLORS: CVColors = {
  sidebarBackground: '#0E1729',
  sidebarText: '#FFFFFF',
  sidebarIcon: '#FFFFFF',
  contactBackground: 'transparent',
  contactTitle: '#17B8A0',
  contactText: '#F8FAFC',
  name: '#0E1729',
  jobTitle: '#17B8A0',
  sectionTitle: '#0E1729',
  sectionIcon: '#17B8A0',
  bodyText: '#1E2530',
  secondaryText: '#8B93A1',
  dates: '#8B93A1',
  companyName: '#0E1729',
  educationTitle: '#0E1729',
  skillBackground: '#17B8A0',
  skillText: '#FFFFFF',
  languageBackground: 'rgba(255,255,255,0.15)',
  languageText: '#FFFFFF',
  interestBackground: 'rgba(255,255,255,0.15)',
  interestText: '#FFFFFF',
  divider: 'rgba(255,255,255,0.15)',
  border: 'rgba(30,37,48,0.1)',
  icon: '#FFFFFF',
  accent: '#17B8A0',
}

export interface Competence {
  id: string
  name: string
}

export interface CompetenceCategory {
  id: string
  title: string
  skills: Competence[]
}

export interface LanguageEntry {
  id: string
  name: string
  level?: string
}

export interface CVData {
  personal: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    summary: string
    photo?: string
  }
  template?: string
  experiences: Experience[]
  education: Education[]
  skills?: string[]
  competenceCategories?: CompetenceCategory[]
  languages: Array<string | LanguageEntry>
  interests: string[]
  sidebarColor?: SidebarColor
  colors?: CVColors
}

export interface Experience {
  id: string
  position: string
  company: string
  startDate: string
  endDate: string
  description: string
}

export interface Education {
  id: string
  degree: string
  school: string
  year: string
  mention: string
}

export const useAICVGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCV, setGeneratedCV] = useState<CVData | null>(null)

  // Simulation d'une IA qui génère un CV basé sur le profil utilisateur
  const generateCVWithAI = async (baseProfile: any) => {
    setIsGenerating(true)

    // Simulation du délai de traitement IA (3-5 secondes)
    await new Promise((resolve) => setTimeout(resolve, 3500))

    // Données générées par "l'IA" - basées sur le profil de l'utilisateur
    const generatedData: CVData = {
      template: baseProfile?.selectedTemplate || 'modern',
      personal: {
        name: baseProfile.name || '',
        title: baseProfile.title || '',
        email: baseProfile.email || '',
        phone: baseProfile.phone || '',
        location: baseProfile.location || '',
        summary: baseProfile.summary || '',
        photo: baseProfile.photo,
      },
      experiences: Array.isArray(baseProfile.experiences) ? baseProfile.experiences.map((e: any) => ({
        id: e.id || crypto.randomUUID(),
        position: e.position || '',
        company: e.company || '',
        startDate: e.start || e.startDate || '',
        endDate: e.end || e.endDate || '',
        description: e.description || '',
      })) : [],
      education: Array.isArray(baseProfile.educations) ? baseProfile.educations.map((ed: any) => ({
        id: ed.id || crypto.randomUUID(),
        degree: ed.degree || '',
        school: ed.school || '',
        year: ed.year || '',
        mention: ed.grade || ed.mention || '',
      })) : [],
      skills: Array.isArray(baseProfile.skills) ? baseProfile.skills : (baseProfile.skills ? baseProfile.skills.split(',').map((s:string)=>s.trim()) : []),
      languages: baseProfile.languages ? baseProfile.languages.split(',').map((l: string) => l.trim()) : [],
      interests: baseProfile.interests ? baseProfile.interests.split(',').map((i: string) => i.trim()) : [],
      sidebarColor: baseProfile.sidebarColor,
      colors: baseProfile.colors || DEFAULT_CV_COLORS,
    }

    setGeneratedCV(generatedData)
    setIsGenerating(false)

    return generatedData
  }

  const resetCV = () => {
    setGeneratedCV(null)
  }

  return {
    isGenerating,
    generatedCV,
    generateCVWithAI,
    resetCV,
  }
}
