'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useAICVGenerator } from '@/hooks/useAICVGenerator'
import type { Experience, Education } from '@/hooks/useAICVGenerator'
import { Card, CardContent } from '@/components/ui/card'
import { CVTemplate } from './cv-template'

interface AIGeneratorButtonProps {
  profileData: {
    name: string
    email: string
    phone: string
    location: string
    title: string
    summary: string
    languages: string
    interests: string
    photo?: string
    skills?: string[]
    experiences?: Experience[]
    educations?: Education[]
    selectedTemplate?: string
    sidebarColor?: 'navy' | 'charcoal' | 'forest' | 'purple'
  }
  disabled?: boolean
  onCVGenerated?: () => void
}
export function AIGeneratorButton({ profileData, disabled: externalDisabled, onCVGenerated }: AIGeneratorButtonProps) {
  const { isGenerating, generatedCV, generateCVWithAI, resetCV } = useAICVGenerator()
  const [showPreview, setShowPreview] = useState(false)

  const handleGenerateCV = async () => {
    try {
      await generateCVWithAI(profileData)
      setShowPreview(true)
      onCVGenerated?.()
    } catch (error) {
      console.error('Erreur lors de la génération du CV:', error)
      alert('Une erreur est survenue lors de la génération du CV. Veuillez réessayer.')
    }
  }

  const handleReset = () => {
    resetCV()
    setShowPreview(false)
  }

  if (generatedCV && showPreview) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-[#17B8A0]/20 bg-[#17B8A0]/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#17B8A0]/20">
              <Sparkles className="size-4 text-[#17B8A0]" />
            </div>
            <div>
              <p className="font-medium text-[#17B8A0]">CV généré avec succès par l'IA ! 🎉</p>
              <p className="mt-1 text-xs text-[#8B93A1]">
                Votre CV a été généré automatiquement avec des expériences et compétences adaptées. Vous pouvez maintenant le télécharger en PDF ou réinitialiser pour recommencer.
              </p>
            </div>
          </div>
        </div>

        <CVTemplate cvData={generatedCV} onReset={handleReset} />
      </div>
    )
  }

  return (
    <Card className="border-[#1E2530]/10">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#17B8A0] to-[#0E1729]">
              <Sparkles className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="cc-display text-lg font-bold text-[#1E2530]">Générer un CV avec l'IA</h3>
              <p className="mt-1 text-sm text-[#8B93A1]">
                Laissez notre IA créer automatiquement un CV professionnel et optimisé basé sur vos informations. C'est rapide, facile et complètement personnalisable.
              </p>
            </div>
          </div>

          <div className="space-y-2 rounded-lg bg-[#1E2530]/5 p-4 text-xs text-[#8B93A1]">
            <p className="font-medium text-[#1E2530]">✨ Fonctionnalités incluses :</p>
            <ul className="mt-2 space-y-1 ml-2">
              <li>• Génération d'expériences professionnelles pertinentes</li>
              <li>• Organisation automatique des compétences par domaine</li>
              <li>• Mise en forme premium et moderne</li>
              <li>• Export instantané en PDF</li>
            </ul>
          </div>

          <button
            onClick={handleGenerateCV}
            disabled={isGenerating || externalDisabled || !profileData.name}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#17B8A0] to-[#0E1729] px-6 py-3 font-medium text-white transition-all hover:shadow-lg hover:shadow-[#17B8A0]/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Génération en cours... (30s max)
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                Générer mon CV avec l'IA
              </>
            )}
          </button>

          {!profileData.name && (
            <p className="text-center text-xs text-[#F2A93B]">
              ⚠️ Veuillez remplir au minimum votre nom pour générer un CV
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
