'use client'

import { cn } from '@/lib/utils'
import { Check, Palette } from 'lucide-react'
import { useState } from 'react'

export interface ColorPaletteProps {
  value: string
  onChange: (color: string) => void
  className?: string
  label?: string
  showCustom?: boolean
}

// Professional color palette organized by category
export const COLOR_PALETTE = {
  neutral: {
    label: 'Neutres',
    colors: [
      { name: 'Noir', value: '#0F172A' },
      { name: 'Gris foncé', value: '#1E293B' },
      { name: 'Gris', value: '#475569' },
      { name: 'Gris clair', value: '#94A3B8' },
      { name: 'Blanc', value: '#FFFFFF' },
    ]
  },
  blue: {
    label: 'Bleus',
    colors: [
      { name: 'Marine', value: '#0A1628' },
      { name: 'Bleu nuit', value: '#1A365D' },
      { name: 'Bleu', value: '#2563EB' },
      { name: 'Bleu clair', value: '#60A5FA' },
      { name: 'Bleu glacier', value: '#E0F2FE' },
    ]
  },
  elegant: {
    label: 'Élégants',
    colors: [
      { name: 'Bordeaux', value: '#5C1A1A' },
      { name: 'Pourpre', value: '#7C3AED' },
      { name: 'Violet profond', value: '#4C1D95' },
      { name: 'Rose', value: '#DB2777' },
      { name: 'Lavande', value: '#E9D5FF' },
    ]
  },
  warm: {
    label: 'Chauds',
    colors: [
      { name: 'Rouge', value: '#DC2626' },
      { name: 'Orange', value: '#F59E0B' },
      { name: 'Or', value: '#C9A227' },
      { name: 'Ambre', value: '#D97706' },
      { name: 'Sable', value: '#FDE68A' },
    ]
  },
  green: {
    label: 'Verts',
    colors: [
      { name: 'Vert forêt', value: '#065F46' },
      { name: 'Vert émeraude', value: '#059669' },
      { name: 'Vert', value: '#22C55E' },
      { name: 'Teal', value: '#0D9488' },
      { name: 'Vert clair', value: '#D1FAE5' },
    ]
  }
}

export function ColorPalette({ 
  value, 
  onChange, 
  className,
  label = 'Couleur',
  showCustom = true 
}: ColorPaletteProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const allColors = Object.values(COLOR_PALETTE).flatMap(category => category.colors)

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        {showCustom && (
          <button
            type="button"
            onClick={() => setShowCustomPicker(!showCustomPicker)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-500 transition-colors hover:bg-slate-50"
          >
            <Palette className="h-3 w-3" />
            Personnalisé
          </button>
        )}
      </div>

      {/* Palette grid - organized by category */}
      <div className="space-y-2">
        {Object.entries(COLOR_PALETTE).map(([key, category]) => (
          <div key={key}>
            <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
              {category.label}
            </span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {category.colors.map((color) => {
                const isSelected = value.toLowerCase() === color.value.toLowerCase()
                const isWhite = color.value.toLowerCase() === '#ffffff'
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => onChange(color.value)}
                    className={cn(
                      'relative h-7 w-7 rounded-full border-2 transition-all duration-150 hover:scale-110 hover:shadow-md',
                      isSelected 
                        ? 'border-slate-800 shadow-md ring-2 ring-slate-800/10 ring-offset-1' 
                        : 'border-slate-200 hover:border-slate-300',
                      isWhite && 'border-slate-300'
                    )}
                    style={{ background: color.value }}
                    aria-label={color.name}
                    title={color.name}
                  >
                    {isSelected && (
                      <Check className={cn(
                        'absolute inset-0 m-auto h-3.5 w-3.5',
                        isWhite ? 'text-slate-800' : 'text-white'
                      )} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Custom color picker */}
      {showCustomPicker && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 p-0"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-sm text-slate-700 outline-none focus:border-slate-400"
            placeholder="#RRGGBB"
          />
        </div>
      )}

      {/* Selected color indicator */}
      <div className="flex items-center gap-3">
        <div 
          className="h-5 w-5 rounded-full border border-slate-200"
          style={{ background: value }}
        />
        <span className="text-[10px] font-mono text-slate-500">{value.toUpperCase()}</span>
      </div>
    </div>
  )
}