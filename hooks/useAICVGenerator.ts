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
        name: baseProfile.name || 'Yassine Ben Salah',
        title: baseProfile.title || 'Ingénieur Logiciel Senior',
        email: baseProfile.email || 'contact@example.com',
        phone: baseProfile.phone || '+216 55 123 456',
        location: baseProfile.location || 'Tunis, Tunisie',
        summary:
          baseProfile.summary ||
          `Ingénieur logiciel passionné avec plus de 5 ans d'expérience dans le développement d'applications web modernes et performantes. Spécialisé dans les technologies JavaScript/TypeScript, React et Node.js. Fort de mes réalisations en entreprise, je suis capable de concevoir des solutions scalables et de mener des projets du concept à la mise en production.`,
        photo: baseProfile.photo,
      },
      experiences: [
        {
          id: '1',
          position: 'Développeur Full Stack Senior',
          company: 'Vermeg',
          startDate: 'Juin 2024',
          endDate: 'Présent',
          description:
            'Conception et développement d\'applications web performantes. Gestion d\'une équipe de 3 développeurs. Implémentation de solutions d\'optimisation qui ont réduit le temps de chargement de 40%.',
        },
        {
          id: '2',
          position: 'Développeur Frontend',
          company: 'Digital Solutions',
          startDate: 'Janvier 2022',
          endDate: 'Mai 2024',
          description:
            'Développement de composants React réutilisables. Intégration de designs Figma. Collaboration avec les équipes backend et design pour optimiser l\'expérience utilisateur.',
        },
        {
          id: '3',
          position: 'Développeur Junior',
          company: 'StartUp Tech',
          startDate: 'Juillet 2020',
          endDate: 'Décembre 2021',
          description:
            'Premiers pas dans le développement professionnel. Assistance sur des projets web et mobile. Apprentissage des bonnes pratiques et des méthodologies agiles.',
        },
      ],
      education: [
        {
          id: '1',
          degree: 'Diplôme d\'Ingénieur en Informatique',
          school: 'École Nationale Supérieure d\'Informatique (ENSI)',
          year: '2019 - 2022',
          mention: 'Très Bien',
        },
        {
          id: '2',
          degree: 'Licence Informatique',
          school: 'Université de Tunis El Manar',
          year: '2016 - 2019',
          mention: 'Bien',
        },
      ],
      skills: baseProfile.skills?.length > 0
        ? baseProfile.skills
        : [
            'React',
            'TypeScript',
            'Node.js',
            'NextJS',
            'JavaScript',
            'TailwindCSS',
            'PostgreSQL',
            'Docker',
            'Git',
            'REST APIs',
            'GraphQL',
            'Agile',
          ],
      languages: baseProfile.languages
        ? baseProfile.languages.split(',').map((l: string) => l.trim())
        : ['Arabe', 'Français', 'Anglais'],
      interests: baseProfile.interests
        ? baseProfile.interests.split(',').map((i: string) => i.trim())
        : ['Open Source', 'Tech Innovation', 'Mentoring', 'Gaming'],
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
