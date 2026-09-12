'use client'

import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export type CvTemplateKey =
  | 'modern'
  | 'classic'
  | 'creative'
  | 'minimalist'
  | 'professional'
  | 'executive'
  | 'ats'
  | 'sidebar'
  | 'simple'
  | 'elegant'
  | 'modern2'
  | 'clean'
  | 'corporate'
  | 'tech'
  | 'compact'
  | 'student'
  | 'professional2'
  | 'minimal2'

export interface TemplateMeta {
  key: CvTemplateKey
  label: string
  description: string
  accent: string
  sidebarColor: string
  hasHeaderBand?: boolean
  hasSidebar?: boolean
  squareTags?: boolean
  isNew?: boolean
  category: 'main' | 'extra'
  badge?: string
  layoutStyle?: 'split' | 'editorial' | 'geometric' | 'premium' | 'card' | 'minimal' | 'bold' | 'curves'
}

export const TEMPLATE_GALLERY: TemplateMeta[] = [
  {
    key: 'modern',
    label: 'Split Moderne',
    description: 'Deux colonnes élégantes, accents courbes.',
    accent: '#10B981',
    sidebarColor: '#0F172A',
    hasSidebar: true,
    category: 'main',
    badge: 'Populaire',
    layoutStyle: 'split',
  },
  {
    key: 'minimalist',
    label: 'Éditorial',
    description: 'Grande typographie, style magazine.',
    accent: '#64748B',
    sidebarColor: '#FFFFFF',
    hasSidebar: false,
    category: 'main',
    layoutStyle: 'editorial',
  },
  {
    key: 'creative',
    label: 'Géométrique',
    description: 'Formes asymétriques, design artistique.',
    accent: '#DB2777',
    sidebarColor: '#FDF2F8',
    hasSidebar: false,
    category: 'main',
    badge: 'Design',
    layoutStyle: 'geometric',
  },
  {
    key: 'executive',
    label: 'Executive',
    description: 'Premium, accents dorés, luxueux.',
    accent: '#C9A227',
    sidebarColor: '#0B1B33',
    hasHeaderBand: true,
    hasSidebar: true,
    squareTags: true,
    category: 'main',
    badge: 'Premium',
    layoutStyle: 'premium',
  },
  {
    key: 'sidebar',
    label: 'Card Moderne',
    description: 'Carte flottante, grande sidebar.',
    accent: '#7C3AED',
    sidebarColor: '#1E1B4B',
    hasSidebar: true,
    isNew: true,
    category: 'main',
    layoutStyle: 'card',
  },
  {
    key: 'professional',
    label: 'Bold Pro',
    description: 'En-tête fort, blocs de couleur.',
    accent: '#2563EB',
    sidebarColor: '#F1F5F9',
    hasHeaderBand: true,
    hasSidebar: false,
    category: 'main',
    layoutStyle: 'bold',
  },
  {
    key: 'tech',
    label: 'Courbes Tech',
    description: 'Formes fluides, style développeur.',
    accent: '#0EA5E9',
    sidebarColor: '#0F172A',
    hasSidebar: false,
    category: 'main',
    layoutStyle: 'curves',
  },
  {
    key: 'ats',
    label: 'Minimal Premium',
    description: 'Épuré, sophistiqué, sans fioritures.',
    accent: '#0F172A',
    sidebarColor: '#FFFFFF',
    hasSidebar: false,
    squareTags: true,
    isNew: true,
    category: 'main',
    layoutStyle: 'minimal',
  },

  // === EXTRA TEMPLATES ===
  {
    key: 'classic',
    label: 'Classique',
    description: 'Intemporel, traditionnel modernisé.',
    accent: '#1E293B',
    sidebarColor: '#F8FAFC',
    hasSidebar: true,
    category: 'extra',
  },
  {
    key: 'simple',
    label: 'Simple',
    description: 'Très épuré, sans fioritures.',
    accent: '#64748B',
    sidebarColor: '#F1F5F9',
    hasSidebar: true,
    category: 'extra',
  },
  {
    key: 'elegant',
    label: 'Élégant',
    description: 'Lignes fines, typographie serif.',
    accent: '#8B7355',
    sidebarColor: '#1A1410',
    hasHeaderBand: true,
    hasSidebar: true,
    category: 'extra',
  },
  {
    key: 'modern2',
    label: 'Moderne 2',
    description: 'Teal vibrant, design épuré.',
    accent: '#0D9488',
    sidebarColor: '#042F2E',
    hasSidebar: true,
    category: 'extra',
  },
  {
    key: 'clean',
    label: 'Clean',
    description: 'Aéré, lisible, bleu clair.',
    accent: '#0284C7',
    sidebarColor: '#F0F9FF',
    hasHeaderBand: true,
    hasSidebar: false,
    category: 'extra',
  },
  {
    key: 'corporate',
    label: 'Corporate',
    description: 'Style entreprise, sobre et sérieux.',
    accent: '#1E293B',
    sidebarColor: '#F8FAFC',
    hasHeaderBand: true,
    hasSidebar: true,
    squareTags: true,
    category: 'extra',
  },
  {
    key: 'compact',
    label: 'Compact',
    description: 'Gain de place, informations denses.',
    accent: '#64748B',
    sidebarColor: '#FFFFFF',
    hasSidebar: false,
    category: 'extra',
  },
  {
    key: 'student',
    label: 'Étudiant',
    description: 'Jeune, dynamique, coloré.',
    accent: '#8B5CF6',
    sidebarColor: '#F5F3FF',
    hasHeaderBand: true,
    hasSidebar: false,
    category: 'extra',
  },
  {
    key: 'professional2',
    label: 'Professionnel 2',
    description: 'Variante sobre avec bandeau.',
    accent: '#0F172A',
    sidebarColor: '#F8FAFC',
    hasHeaderBand: true,
    hasSidebar: true,
    category: 'extra',
  },
  {
    key: 'minimal2',
    label: 'Minimal 2',
    description: 'Ultra-minimaliste, noir et blanc.',
    accent: '#0F172A',
    sidebarColor: '#FFFFFF',
    hasSidebar: false,
    category: 'extra',
  },
]

function TemplateThumbnail({ tpl }: { tpl: TemplateMeta }) {
  const sidebarWidth = tpl.hasSidebar ? (tpl.key === 'sidebar' ? 40 : 26) : 0
  const headerH = tpl.hasHeaderBand ? 20 : 0
  const textColor = tpl.key === 'ats' || tpl.key === 'classic' || tpl.key === 'minimalist' || tpl.key === 'minimal2' || tpl.key === 'compact' ? '#111827' : tpl.accent
  const tagRadius = tpl.squareTags ? 1 : 4
  const isDarkSidebar = tpl.sidebarColor === '#0F172A' || tpl.sidebarColor === '#0B1B33' || tpl.sidebarColor === '#1E1B4B' || tpl.sidebarColor === '#042F2E' || tpl.sidebarColor === '#1A1410'

  // Layout style indicators
  const hasAccentCorner = tpl.layoutStyle === 'geometric' || tpl.layoutStyle === 'curves'
  const hasFloating = tpl.layoutStyle === 'card'
  const hasBoldHeader = tpl.layoutStyle === 'bold' || tpl.layoutStyle === 'premium'

  return (
    <svg viewBox="0 0 120 156" className="h-full w-full" aria-hidden="true">
      <rect x="0.5" y="0.5" width="119" height="155" rx="6" fill="#FFFFFF" stroke="#E6E9EE" />

      {/* Header band for bold templates */}
      {tpl.hasHeaderBand && <rect x="0" y="0" width="120" height={headerH} rx="6" fill={tpl.accent} opacity="0.9" />}
      
      {/* Accent line for templates without header */}
      {!tpl.hasHeaderBand && tpl.key !== 'ats' && tpl.key !== 'compact' && tpl.key !== 'minimal2' && !hasAccentCorner && <rect x="0" y="0" width="120" height="4" fill={tpl.accent} />}
      
      {/* Accent corner for geometric/curves */}
      {hasAccentCorner && !tpl.hasHeaderBand && (
        <path d="M80 0 L120 0 L120 40 Q100 30 80 0Z" fill={tpl.accent} opacity="0.15" />
      )}

      {/* Sidebar */}
      {tpl.hasSidebar && (
        <rect x="0" y={headerH} width={sidebarWidth} height={156 - headerH} fill={tpl.sidebarColor} />
      )}

      {/* Floating card indicator */}
      {hasFloating && (
        <rect x="8" y="8" width="104" height="140" rx="8" fill="#F8FAFC" stroke="#E6E9EE" strokeWidth="1" />
      )}

      {/* Photo */}
      {tpl.hasSidebar && (
        <circle
          cx={sidebarWidth / 2}
          cy={headerH + 18}
          r="8"
          fill={isDarkSidebar ? '#FFFFFF' : '#CBD5E1'}
          opacity={isDarkSidebar ? 0.6 : 0.7}
        />
      )}
      {!tpl.hasSidebar && (tpl.key === 'creative' || tpl.key === 'tech' || tpl.key === 'student' || tpl.key === 'professional') && (
        <rect x="44" y="12" width="32" height="32" rx="6" fill={tpl.accent} opacity="0.3" />
      )}

      {/* Sidebar lines */}
      {tpl.hasSidebar &&
        [0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={6}
            y={headerH + 34 + i * 13}
            width={sidebarWidth - 12}
            height="4"
            rx={tagRadius}
            fill={isDarkSidebar ? '#FFFFFF' : '#CBD5E1'}
            opacity={isDarkSidebar ? 0.4 : 0.8}
          />
        ))}

      {/* Name / Title */}
      {hasBoldHeader && !tpl.hasHeaderBand && (
        <rect x={sidebarWidth + 10} y={headerH + 30} width="58" height="8" rx="2" fill={tpl.accent} />
      )}
      <rect
        x={sidebarWidth + 10}
        y={headerH + (hasBoldHeader && !tpl.hasHeaderBand ? 12 : 12)}
        width="58"
        height="8"
        rx="2"
        fill={tpl.hasHeaderBand ? '#FFFFFF' : (tpl.key === 'simple' ? tpl.accent : textColor)}
      />
      <rect
        x={sidebarWidth + 10}
        y={headerH + (hasBoldHeader && !tpl.hasHeaderBand ? 44 : 24)}
        width="38"
        height="5"
        rx="2"
        fill={tpl.hasHeaderBand ? '#FFFFFF' : '#94A3B8'}
        opacity={tpl.hasHeaderBand ? 0.8 : 1}
      />

      {/* Body sections with layout variations */}
      {[0, 1, 2, 3, 4].map((i) => {
        // For editorial layout, use wider sections
        const isEditorial = tpl.layoutStyle === 'editorial'
        const width = isEditorial ? 80 : (i % 2 === 0 ? 76 - sidebarWidth * 0 : 58)
        const yOffset = isEditorial ? 8 : 0
        
        // For bold layout, use accent colored first section
        const isBold = tpl.layoutStyle === 'bold'
        const fillColor = i === 0 && isBold ? tpl.accent : (i === 0 ? tpl.accent : '#CBD5E1')
        const opacityVal = i === 0 && isBold ? 0.7 : (i === 0 ? 0.8 : 1)
        
        return (
          <rect
            key={i}
            x={sidebarWidth + 10}
            y={headerH + 40 + i * 16 + yOffset}
            width={width}
            height="5"
            rx="2"
            fill={fillColor}
            opacity={opacityVal}
          />
        )
      })}

      {/* Decorative element for geometric templates */}
      {hasAccentCorner && (
        <circle cx="100" cy="130" r="12" fill={tpl.accent} opacity="0.1" />
      )}
    </svg>
  )
}

interface TemplateGalleryPickerProps {
  selected: CvTemplateKey
  onSelect: (key: CvTemplateKey) => void
  className?: string
}

export function TemplateGalleryPicker({ selected, onSelect, className }: TemplateGalleryPickerProps) {
  const [showAll, setShowAll] = useState(false)

  const mainTemplates = TEMPLATE_GALLERY.filter(t => t.category === 'main')
  const extraTemplates = TEMPLATE_GALLERY.filter(t => t.category === 'extra')
  const visibleTemplates = showAll ? TEMPLATE_GALLERY : mainTemplates

  return (
    <div className="space-y-4">
      <div className={cn('grid grid-cols-2 gap-3 sm:grid-cols-4', className)}>
        {visibleTemplates.map((tpl) => {
          const isActive = selected === tpl.key
          return (
            <button
              key={tpl.key}
              type="button"
              onClick={() => onSelect(tpl.key)}
              aria-pressed={isActive}
              className={cn(
                'group relative flex flex-col items-center gap-2 rounded-xl border-2 p-2.5 text-left transition-all duration-200',
                isActive
                  ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                  : 'border-slate-200/60 bg-white hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-md'
              )}
            >
              {isActive && (
                <CheckCircle2 className="absolute -right-1.5 -top-1.5 z-10 h-5 w-5 rounded-full bg-white text-emerald-500 shadow-sm" />
              )}
              {tpl.isNew && !isActive && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wide text-white shadow-sm">
                  Nouveau
                </span>
              )}
              {tpl.badge && !isActive && (
                <span className="absolute right-2 top-2 z-10 rounded-full bg-amber-50 px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-wide text-amber-600 border border-amber-200">
                  {tpl.badge}
                </span>
              )}
              <div className="aspect-[120/156] w-full overflow-hidden rounded-lg border border-slate-200/60 bg-slate-50 transition-transform group-hover:scale-[1.02]">
                <TemplateThumbnail tpl={tpl} />
              </div>
              <div className="w-full">
                <p className="text-xs font-semibold text-slate-800">{tpl.label}</p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-slate-400">{tpl.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      {extraTemplates.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/60 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-800"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Voir moins de modèles
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Voir plus de modèles ({extraTemplates.length} supplémentaires)
            </>
          )}
        </button>
      )}
    </div>
  )
}