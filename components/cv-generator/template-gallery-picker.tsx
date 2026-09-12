'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { TemplateGallery, TEMPLATE_GALLERY, type CvTemplateKey } from './template-gallery'
import { cn } from '@/lib/utils'

/**
 * ============================================================================
 * TemplateGalleryPicker — wrapper with "voir plus" logic
 * Responsibilities:
 * - Manages showAll state
 * - Delegates actual rendering to TemplateGallery
 * - Single source of truth for selected template via props
 * - No duplicated TEMPLATE_GALLERY data
 * ============================================================================
 */

export type { CvTemplateKey } from './template-gallery'
export { TEMPLATE_GALLERY } from './template-gallery'

interface TemplateGalleryPickerProps {
  selected: CvTemplateKey
  onSelect: (key: CvTemplateKey) => void
  className?: string
}

export function TemplateGalleryPicker({ selected, onSelect, className }: TemplateGalleryPickerProps) {
  const [showAll, setShowAll] = useState(false)

  const mainTemplates = TEMPLATE_GALLERY.filter((t) => t.category === 'main')
  const extraTemplates = TEMPLATE_GALLERY.filter((t) => t.category === 'extra')
  const visibleTemplates = showAll? TEMPLATE_GALLERY : mainTemplates

  // Auto-expand if selected is in extra category
  const isSelectedInExtra = extraTemplates.some((t) => t.key === selected)
  const shouldShowAll = showAll || isSelectedInExtra
  const finalVisible = shouldShowAll? TEMPLATE_GALLERY : mainTemplates

  return (
    <div className={cn('space-y-4', className)}>
      <TemplateGallery selected={selected} onSelect={onSelect} templates={finalVisible} />

      {extraTemplates.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E6E9EE] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
        >
          {shouldShowAll? (
            <>
              <ChevronUp className="size-4" />
              Voir moins de modèles
            </>
          ) : (
            <>
              <ChevronDown className="size-4" />
              Voir plus de modèles ({extraTemplates.length} supplémentaires)
            </>
          )}
        </button>
      )}
    </div>
  )
}