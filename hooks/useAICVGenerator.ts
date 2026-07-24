import { useState } from 'react'

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
  skills: string[]
  languages: string[]
  interests: string[]
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
