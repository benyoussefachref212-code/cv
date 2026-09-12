'use client'

import { Mail, Phone, MapPin, Download, RotateCcw, Globe, User, Briefcase, GraduationCap, Wrench, Heart } from 'lucide-react'
import { CVData, CVColors, DEFAULT_CV_COLORS } from '@/hooks/useAICVGenerator'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { DownloadCVButton } from './download-cv-button'
import { useEffect, useRef, useState } from 'react'
import type { CvTemplateKey } from './template-gallery'

function darken(hex: string, amount: number) {
  let color = hex.replace('#', '')
  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2]
  }
  const num = parseInt(color, 16)
  const r = Math.max(0, Math.min(255, Math.floor(((num >> 16) & 255) * (1 - amount))))
  const g = Math.max(0, Math.min(255, Math.floor(((num >> 8) & 255) * (1 - amount))))
  const b = Math.max(0, Math.min(255, Math.floor((num & 255) * (1 - amount))))
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

// ============================================================
// MODERN TEMPLATE CONFIGURATIONS
// ============================================================

interface TemplateStyleConfig {
  id: string
  name: string
  
  // Layout
  sidebarWidth: number
  sidebarPosition: 'left' | 'right'
  useHeaderBand: boolean
  headerBandHeight?: number
  showSidebarPhoto: boolean
  photoSize: number
  photoShape: 'circle' | 'rounded-square' | 'soft-rounded' | 'portrait' | 'floating'
  sidebarPadding: string
  mainPadding: string
  
  // Typography
  nameFont: string
  nameSize: string
  nameWeight: string
  nameTransform: 'none' | 'uppercase'
  titleFont: string
  titleSize: string
  titleWeight: string
  bodyFont: string
  bodySize: string
  sectionFont: string
  sectionSize: string
  sectionWeight: string
  sectionTransform: 'uppercase' | 'capitalize' | 'none'
  sidebarTextSize: string
  sidebarTitleColor: string
  sidebarTextColor: string
  
  // Spacing
  sectionGap: string
  itemGap: string
  
  // Visual
  borderRadius: string
  cardShadow: string
  useGradient: boolean
  showIcons: boolean
  showDivider: boolean
  dividerStyle: 'solid' | 'dashed' | 'dotted' | 'double' | 'accent-line' | 'none'
  tagStyle: 'pill' | 'rounded' | 'square' | 'outline' | 'minimal'
  tagBorder: boolean
  useAccentBorders: boolean
  contactInSidebar: boolean
  accentColor: string
  sidebarBgColor: string
  sectionTitleColor: string
  bodyTextColor: string
  dividerColor: string
  headerBgColor: string
  headerTextColor: string
  sidebarAccentColor: string
  
  // Special features
  showDecorativeLine: boolean
  showInitialBadge: boolean
  useModernSpacing: boolean
  showSectionNumbers: boolean
  useFloatingCards: boolean
  useAccentCorner: boolean
  useSoftShapes: boolean
  headerStyle: 'clean' | 'bold' | 'minimal' | 'editorial'
  sectionStyle: 'line' | 'badge' | 'number' | 'minimal' | 'accent'
  photoBorder: boolean
  photoBorderColor: string
  useVerticalAccent: boolean
  useHorizontalAccent: boolean
  cardBackground: string
}

const TEMPLATE_STYLES: Record<CvTemplateKey, TemplateStyleConfig> = {
  // ============================================================
  // MODERN SPLIT — Elegant two-column with curved accent
  // ============================================================
  modern: {
    id: 'modern',
    name: 'Moderne',
    sidebarWidth: 240,
    sidebarPosition: 'left',
    useHeaderBand: false,
    showSidebarPhoto: true,
    photoSize: 32,
    photoShape: 'floating',
    sidebarPadding: 'p-7',
    mainPadding: 'p-8',
    nameFont: 'font-sans',
    nameSize: 'text-3xl',
    nameWeight: 'font-bold',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-base',
    titleWeight: 'font-medium',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-xs',
    sectionWeight: 'font-bold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#FFFFFF',
    sidebarTextColor: '#D1FAE5',
    sectionGap: 'space-y-6',
    itemGap: 'space-y-4',
    borderRadius: 'rounded-2xl',
    cardShadow: 'shadow-2xl',
    useGradient: true,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'accent-line',
    tagStyle: 'pill',
    tagBorder: false,
    useAccentBorders: true,
    contactInSidebar: true,
    accentColor: '#10B981',
    sidebarBgColor: '#0F172A',
    sectionTitleColor: '#0F172A',
    bodyTextColor: '#1E293B',
    dividerColor: '#10B981',
    headerBgColor: '#10B981',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#34D399',
    showDecorativeLine: true,
    showInitialBadge: false,
    useModernSpacing: true,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: true,
    headerStyle: 'clean',
    sectionStyle: 'line',
    photoBorder: true,
    photoBorderColor: '#10B981',
    useVerticalAccent: true,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // EDITORIAL — Magazine-style with large typography
  // ============================================================
  minimalist: {
    id: 'minimalist',
    name: 'Minimaliste',
    sidebarWidth: 0,
    sidebarPosition: 'left',
    useHeaderBand: false,
    showSidebarPhoto: false,
    photoSize: 0,
    photoShape: 'soft-rounded',
    sidebarPadding: 'p-0',
    mainPadding: 'p-10',
    nameFont: 'font-sans',
    nameSize: 'text-4xl',
    nameWeight: 'font-light',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-xl',
    titleWeight: 'font-light',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-xs',
    sectionWeight: 'font-medium',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#0F172A',
    sidebarTextColor: '#475569',
    sectionGap: 'space-y-8',
    itemGap: 'space-y-4',
    borderRadius: 'rounded-none',
    cardShadow: 'shadow-sm',
    useGradient: false,
    showIcons: false,
    showDivider: true,
    dividerStyle: 'solid',
    tagStyle: 'minimal',
    tagBorder: true,
    useAccentBorders: false,
    contactInSidebar: false,
    accentColor: '#64748B',
    sidebarBgColor: '#FFFFFF',
    sectionTitleColor: '#0F172A',
    bodyTextColor: '#1E293B',
    dividerColor: '#E2E8F0',
    headerBgColor: '#0F172A',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#64748B',
    showDecorativeLine: true,
    showInitialBadge: false,
    useModernSpacing: true,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'editorial',
    sectionStyle: 'minimal',
    photoBorder: false,
    photoBorderColor: '#64748B',
    useVerticalAccent: false,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // CREATIVE GEOMETRIC — Asymmetrical with shapes
  // ============================================================
  creative: {
    id: 'creative',
    name: 'Créatif',
    sidebarWidth: 0,
    sidebarPosition: 'left',
    useHeaderBand: false,
    showSidebarPhoto: true,
    photoSize: 36,
    photoShape: 'soft-rounded',
    sidebarPadding: 'p-0',
    mainPadding: 'p-8',
    nameFont: 'font-sans',
    nameSize: 'text-3xl',
    nameWeight: 'font-light',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-lg',
    titleWeight: 'font-light',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-xs',
    sectionWeight: 'font-bold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#831843',
    sidebarTextColor: '#4A1942',
    sectionGap: 'space-y-6',
    itemGap: 'space-y-4',
    borderRadius: 'rounded-2xl',
    cardShadow: 'shadow-2xl',
    useGradient: false,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'dashed',
    tagStyle: 'rounded',
    tagBorder: false,
    useAccentBorders: true,
    contactInSidebar: false,
    accentColor: '#DB2777',
    sidebarBgColor: '#FDF2F8',
    sectionTitleColor: '#831843',
    bodyTextColor: '#1E293B',
    dividerColor: '#DB2777',
    headerBgColor: '#DB2777',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#DB2777',
    showDecorativeLine: true,
    showInitialBadge: true,
    useModernSpacing: true,
    showSectionNumbers: true,
    useFloatingCards: true,
    useAccentCorner: true,
    useSoftShapes: true,
    headerStyle: 'bold',
    sectionStyle: 'number',
    photoBorder: true,
    photoBorderColor: '#DB2777',
    useVerticalAccent: false,
    useHorizontalAccent: true,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // EXECUTIVE — Premium dark with gold accents
  // ============================================================
  executive: {
    id: 'executive',
    name: 'Executive',
    sidebarWidth: 230,
    sidebarPosition: 'left',
    useHeaderBand: true,
    headerBandHeight: 5,
    showSidebarPhoto: true,
    photoSize: 28,
    photoShape: 'circle',
    sidebarPadding: 'p-7',
    mainPadding: 'p-8',
    nameFont: 'font-serif',
    nameSize: 'text-3xl',
    nameWeight: 'font-light tracking-wider',
    nameTransform: 'uppercase',
    titleFont: 'font-serif',
    titleSize: 'text-base',
    titleWeight: 'font-light tracking-wide',
    bodyFont: 'font-serif',
    bodySize: 'text-sm',
    sectionFont: 'font-serif',
    sectionSize: 'text-[10px]',
    sectionWeight: 'font-bold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#C9A227',
    sidebarTextColor: '#D4C8B8',
    sectionGap: 'space-y-6',
    itemGap: 'space-y-4',
    borderRadius: 'rounded-lg',
    cardShadow: 'shadow-2xl',
    useGradient: true,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'double',
    tagStyle: 'square',
    tagBorder: true,
    useAccentBorders: true,
    contactInSidebar: true,
    accentColor: '#C9A227',
    sidebarBgColor: '#0B1B33',
    sectionTitleColor: '#0B1B33',
    bodyTextColor: '#1A1A1A',
    dividerColor: '#C9A227',
    headerBgColor: '#0B1B33',
    headerTextColor: '#C9A227',
    sidebarAccentColor: '#C9A227',
    showDecorativeLine: true,
    showInitialBadge: false,
    useModernSpacing: true,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'bold',
    sectionStyle: 'line',
    photoBorder: true,
    photoBorderColor: '#C9A227',
    useVerticalAccent: true,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // MODERN CARD — Floating card design
  // ============================================================
  sidebar: {
    id: 'sidebar',
    name: 'Sidebar',
    sidebarWidth: 260,
    sidebarPosition: 'left',
    useHeaderBand: false,
    showSidebarPhoto: true,
    photoSize: 34,
    photoShape: 'floating',
    sidebarPadding: 'p-7',
    mainPadding: 'p-7',
    nameFont: 'font-sans',
    nameSize: 'text-2xl',
    nameWeight: 'font-bold',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-base',
    titleWeight: 'font-medium',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-[10px]',
    sectionWeight: 'font-semibold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#FFFFFF',
    sidebarTextColor: '#C4B5E3',
    sectionGap: 'space-y-6',
    itemGap: 'space-y-4',
    borderRadius: 'rounded-2xl',
    cardShadow: 'shadow-2xl',
    useGradient: true,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'accent-line',
    tagStyle: 'pill',
    tagBorder: false,
    useAccentBorders: true,
    contactInSidebar: true,
    accentColor: '#7C3AED',
    sidebarBgColor: '#1E1B4B',
    sectionTitleColor: '#1E1B4B',
    bodyTextColor: '#1E293B',
    dividerColor: '#7C3AED',
    headerBgColor: '#7C3AED',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#8B5CF6',
    showDecorativeLine: true,
    showInitialBadge: false,
    useModernSpacing: true,
    showSectionNumbers: false,
    useFloatingCards: true,
    useAccentCorner: false,
    useSoftShapes: true,
    headerStyle: 'clean',
    sectionStyle: 'badge',
    photoBorder: true,
    photoBorderColor: '#7C3AED',
    useVerticalAccent: true,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // BOLD PROFESSIONAL — Strong header with color blocks
  // ============================================================
  professional: {
    id: 'professional',
    name: 'Professionnel',
    sidebarWidth: 0,
    sidebarPosition: 'left',
    useHeaderBand: true,
    headerBandHeight: 8,
    showSidebarPhoto: true,
    photoSize: 30,
    photoShape: 'soft-rounded',
    sidebarPadding: 'p-0',
    mainPadding: 'p-8',
    nameFont: 'font-sans',
    nameSize: 'text-3xl',
    nameWeight: 'font-bold',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-lg',
    titleWeight: 'font-medium',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-xs',
    sectionWeight: 'font-bold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#1E293B',
    sidebarTextColor: '#475569',
    sectionGap: 'space-y-6',
    itemGap: 'space-y-4',
    borderRadius: 'rounded-xl',
    cardShadow: 'shadow-lg',
    useGradient: false,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'solid',
    tagStyle: 'rounded',
    tagBorder: true,
    useAccentBorders: true,
    contactInSidebar: false,
    accentColor: '#2563EB',
    sidebarBgColor: '#F1F5F9',
    sectionTitleColor: '#1E293B',
    bodyTextColor: '#1E293B',
    dividerColor: '#2563EB',
    headerBgColor: '#2563EB',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#2563EB',
    showDecorativeLine: true,
    showInitialBadge: true,
    useModernSpacing: true,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'bold',
    sectionStyle: 'line',
    photoBorder: true,
    photoBorderColor: '#2563EB',
    useVerticalAccent: false,
    useHorizontalAccent: true,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // CREATIVE CURVES — Soft flowing shapes
  // ============================================================
  tech: {
    id: 'tech',
    name: 'Tech',
    sidebarWidth: 0,
    sidebarPosition: 'left',
    useHeaderBand: false,
    showSidebarPhoto: true,
    photoSize: 32,
    photoShape: 'soft-rounded',
    sidebarPadding: 'p-0',
    mainPadding: 'p-8',
    nameFont: 'font-mono',
    nameSize: 'text-2xl',
    nameWeight: 'font-medium',
    nameTransform: 'none',
    titleFont: 'font-mono',
    titleSize: 'text-base',
    titleWeight: 'font-medium',
    bodyFont: 'font-mono',
    bodySize: 'text-sm',
    sectionFont: 'font-mono',
    sectionSize: 'text-[10px]',
    sectionWeight: 'font-bold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#38BDF8',
    sidebarTextColor: '#94A3B8',
    sectionGap: 'space-y-5',
    itemGap: 'space-y-3',
    borderRadius: 'rounded-xl',
    cardShadow: 'shadow-lg',
    useGradient: true,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'solid',
    tagStyle: 'square',
    tagBorder: true,
    useAccentBorders: true,
    contactInSidebar: false,
    accentColor: '#0EA5E9',
    sidebarBgColor: '#0F172A',
    sectionTitleColor: '#0F172A',
    bodyTextColor: '#1E293B',
    dividerColor: '#0EA5E9',
    headerBgColor: '#0EA5E9',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#38BDF8',
    showDecorativeLine: true,
    showInitialBadge: false,
    useModernSpacing: true,
    showSectionNumbers: false,
    useFloatingCards: true,
    useAccentCorner: true,
    useSoftShapes: true,
    headerStyle: 'clean',
    sectionStyle: 'badge',
    photoBorder: true,
    photoBorderColor: '#0EA5E9',
    useVerticalAccent: false,
    useHorizontalAccent: true,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // MINIMAL PREMIUM — Clean, sophisticated
  // ============================================================
  ats: {
    id: 'ats',
    name: 'ATS',
    sidebarWidth: 0,
    sidebarPosition: 'left',
    useHeaderBand: false,
    showSidebarPhoto: false,
    photoSize: 0,
    photoShape: 'circle',
    sidebarPadding: 'p-0',
    mainPadding: 'p-6',
    nameFont: 'font-sans',
    nameSize: 'text-2xl',
    nameWeight: 'font-bold',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-base',
    titleWeight: 'font-medium',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-xs',
    sectionWeight: 'font-bold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#0F172A',
    sidebarTextColor: '#475569',
    sectionGap: 'space-y-4',
    itemGap: 'space-y-2',
    borderRadius: 'rounded-none',
    cardShadow: 'shadow-none',
    useGradient: false,
    showIcons: false,
    showDivider: true,
    dividerStyle: 'solid',
    tagStyle: 'square',
    tagBorder: true,
    useAccentBorders: false,
    contactInSidebar: false,
    accentColor: '#0F172A',
    sidebarBgColor: '#FFFFFF',
    sectionTitleColor: '#0F172A',
    bodyTextColor: '#1E293B',
    dividerColor: '#0F172A',
    headerBgColor: '#0F172A',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#0F172A',
    showDecorativeLine: false,
    showInitialBadge: false,
    useModernSpacing: false,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'minimal',
    sectionStyle: 'minimal',
    photoBorder: false,
    photoBorderColor: '#0F172A',
    useVerticalAccent: false,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // CLASSIC — Traditional with modern touches
  // ============================================================
  classic: {
    id: 'classic',
    name: 'Classique',
    sidebarWidth: 200,
    sidebarPosition: 'left',
    useHeaderBand: false,
    showSidebarPhoto: true,
    photoSize: 28,
    photoShape: 'circle',
    sidebarPadding: 'p-6',
    mainPadding: 'p-8',
    nameFont: 'font-serif',
    nameSize: 'text-3xl',
    nameWeight: 'font-bold',
    nameTransform: 'none',
    titleFont: 'font-serif',
    titleSize: 'text-lg',
    titleWeight: 'italic',
    bodyFont: 'font-serif',
    bodySize: 'text-sm',
    sectionFont: 'font-serif',
    sectionSize: 'text-xs',
    sectionWeight: 'font-bold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#0F172A',
    sidebarTextColor: '#475569',
    sectionGap: 'space-y-5',
    itemGap: 'space-y-4',
    borderRadius: 'rounded-lg',
    cardShadow: 'shadow-md',
    useGradient: false,
    showIcons: false,
    showDivider: true,
    dividerStyle: 'solid',
    tagStyle: 'square',
    tagBorder: true,
    useAccentBorders: true,
    contactInSidebar: true,
    accentColor: '#1E293B',
    sidebarBgColor: '#F8FAFC',
    sectionTitleColor: '#0F172A',
    bodyTextColor: '#1E293B',
    dividerColor: '#1E293B',
    headerBgColor: '#1E293B',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#1E293B',
    showDecorativeLine: true,
    showInitialBadge: false,
    useModernSpacing: false,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'clean',
    sectionStyle: 'line',
    photoBorder: true,
    photoBorderColor: '#1E293B',
    useVerticalAccent: true,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // SIMPLE — Minimal sidebar
  // ============================================================
  simple: {
    id: 'simple',
    name: 'Simple',
    sidebarWidth: 160,
    sidebarPosition: 'left',
    useHeaderBand: false,
    showSidebarPhoto: false,
    photoSize: 0,
    photoShape: 'circle',
    sidebarPadding: 'p-4',
    mainPadding: 'p-6',
    nameFont: 'font-sans',
    nameSize: 'text-2xl',
    nameWeight: 'font-light',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-base',
    titleWeight: 'font-light',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-[10px]',
    sectionWeight: 'font-medium',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#0F172A',
    sidebarTextColor: '#475569',
    sectionGap: 'space-y-4',
    itemGap: 'space-y-3',
    borderRadius: 'rounded-lg',
    cardShadow: 'shadow-sm',
    useGradient: false,
    showIcons: false,
    showDivider: false,
    dividerStyle: 'none',
    tagStyle: 'square',
    tagBorder: true,
    useAccentBorders: false,
    contactInSidebar: true,
    accentColor: '#64748B',
    sidebarBgColor: '#F1F5F9',
    sectionTitleColor: '#0F172A',
    bodyTextColor: '#1E293B',
    dividerColor: '#E2E8F0',
    headerBgColor: '#64748B',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#64748B',
    showDecorativeLine: false,
    showInitialBadge: false,
    useModernSpacing: false,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'minimal',
    sectionStyle: 'minimal',
    photoBorder: false,
    photoBorderColor: '#64748B',
    useVerticalAccent: false,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // ELEGANT — Sophisticated serif design
  // ============================================================
  elegant: {
    id: 'elegant',
    name: 'Élégant',
    sidebarWidth: 210,
    sidebarPosition: 'left',
    useHeaderBand: true,
    headerBandHeight: 3,
    showSidebarPhoto: true,
    photoSize: 28,
    photoShape: 'circle',
    sidebarPadding: 'p-6',
    mainPadding: 'p-8',
    nameFont: 'font-serif',
    nameSize: 'text-3xl',
    nameWeight: 'font-bold',
    nameTransform: 'none',
    titleFont: 'font-serif',
    titleSize: 'text-lg',
    titleWeight: 'italic',
    bodyFont: 'font-serif',
    bodySize: 'text-sm',
    sectionFont: 'font-serif',
    sectionSize: 'text-xs',
    sectionWeight: 'font-bold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#FFFFFF',
    sidebarTextColor: '#E8E0D8',
    sectionGap: 'space-y-6',
    itemGap: 'space-y-4',
    borderRadius: 'rounded-lg',
    cardShadow: 'shadow-xl',
    useGradient: false,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'solid',
    tagStyle: 'outline',
    tagBorder: true,
    useAccentBorders: true,
    contactInSidebar: true,
    accentColor: '#8B7355',
    sidebarBgColor: '#1A1410',
    sectionTitleColor: '#2D1F14',
    bodyTextColor: '#2D1F14',
    dividerColor: '#8B7355',
    headerBgColor: '#8B7355',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#C9A87C',
    showDecorativeLine: true,
    showInitialBadge: false,
    useModernSpacing: true,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'clean',
    sectionStyle: 'line',
    photoBorder: true,
    photoBorderColor: '#8B7355',
    useVerticalAccent: true,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // MODERN2 — Alternative modern with teal
  // ============================================================
  modern2: {
    id: 'modern2',
    name: 'Moderne 2',
    sidebarWidth: 200,
    sidebarPosition: 'left',
    useHeaderBand: false,
    showSidebarPhoto: true,
    photoSize: 30,
    photoShape: 'floating',
    sidebarPadding: 'p-6',
    mainPadding: 'p-7',
    nameFont: 'font-sans',
    nameSize: 'text-3xl',
    nameWeight: 'font-bold',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-lg',
    titleWeight: 'font-medium',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-xs',
    sectionWeight: 'font-semibold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#FFFFFF',
    sidebarTextColor: '#CCFBF1',
    sectionGap: 'space-y-5',
    itemGap: 'space-y-4',
    borderRadius: 'rounded-xl',
    cardShadow: 'shadow-xl',
    useGradient: true,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'accent-line',
    tagStyle: 'pill',
    tagBorder: false,
    useAccentBorders: true,
    contactInSidebar: true,
    accentColor: '#0D9488',
    sidebarBgColor: '#042F2E',
    sectionTitleColor: '#0D9488',
    bodyTextColor: '#1E293B',
    dividerColor: '#0D9488',
    headerBgColor: '#0D9488',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#14B8A6',
    showDecorativeLine: true,
    showInitialBadge: false,
    useModernSpacing: true,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: true,
    headerStyle: 'clean',
    sectionStyle: 'badge',
    photoBorder: true,
    photoBorderColor: '#0D9488',
    useVerticalAccent: true,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // CLEAN — Very clean with light blue
  // ============================================================
  clean: {
    id: 'clean',
    name: 'Clean',
    sidebarWidth: 0,
    sidebarPosition: 'left',
    useHeaderBand: true,
    headerBandHeight: 4,
    showSidebarPhoto: true,
    photoSize: 28,
    photoShape: 'soft-rounded',
    sidebarPadding: 'p-0',
    mainPadding: 'p-7',
    nameFont: 'font-sans',
    nameSize: 'text-2xl',
    nameWeight: 'font-light',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-base',
    titleWeight: 'font-light',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-[10px]',
    sectionWeight: 'font-semibold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#0284C7',
    sidebarTextColor: '#475569',
    sectionGap: 'space-y-5',
    itemGap: 'space-y-3',
    borderRadius: 'rounded-xl',
    cardShadow: 'shadow-sm',
    useGradient: false,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'solid',
    tagStyle: 'rounded',
    tagBorder: true,
    useAccentBorders: true,
    contactInSidebar: false,
    accentColor: '#0284C7',
    sidebarBgColor: '#F0F9FF',
    sectionTitleColor: '#0F172A',
    bodyTextColor: '#1E293B',
    dividerColor: '#0284C7',
    headerBgColor: '#0284C7',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#38BDF8',
    showDecorativeLine: true,
    showInitialBadge: true,
    useModernSpacing: true,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'clean',
    sectionStyle: 'line',
    photoBorder: true,
    photoBorderColor: '#0284C7',
    useVerticalAccent: false,
    useHorizontalAccent: true,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // CORPORATE — Traditional corporate
  // ============================================================
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    sidebarWidth: 190,
    sidebarPosition: 'left',
    useHeaderBand: true,
    headerBandHeight: 5,
    showSidebarPhoto: true,
    photoSize: 24,
    photoShape: 'circle',
    sidebarPadding: 'p-5',
    mainPadding: 'p-7',
    nameFont: 'font-sans',
    nameSize: 'text-xl',
    nameWeight: 'font-bold',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-base',
    titleWeight: 'font-medium',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-[10px]',
    sectionWeight: 'font-bold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#1E293B',
    sidebarTextColor: '#64748B',
    sectionGap: 'space-y-4',
    itemGap: 'space-y-3',
    borderRadius: 'rounded-lg',
    cardShadow: 'shadow-md',
    useGradient: false,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'solid',
    tagStyle: 'square',
    tagBorder: true,
    useAccentBorders: true,
    contactInSidebar: true,
    accentColor: '#1E293B',
    sidebarBgColor: '#F8FAFC',
    sectionTitleColor: '#0F172A',
    bodyTextColor: '#1E293B',
    dividerColor: '#1E293B',
    headerBgColor: '#1E293B',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#1E293B',
    showDecorativeLine: true,
    showInitialBadge: false,
    useModernSpacing: false,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'bold',
    sectionStyle: 'line',
    photoBorder: true,
    photoBorderColor: '#1E293B',
    useVerticalAccent: true,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // COMPACT — Space-efficient
  // ============================================================
  compact: {
    id: 'compact',
    name: 'Compact',
    sidebarWidth: 0,
    sidebarPosition: 'left',
    useHeaderBand: false,
    showSidebarPhoto: false,
    photoSize: 0,
    photoShape: 'circle',
    sidebarPadding: 'p-0',
    mainPadding: 'p-4',
    nameFont: 'font-sans',
    nameSize: 'text-xl',
    nameWeight: 'font-bold',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-sm',
    titleWeight: 'font-medium',
    bodyFont: 'font-sans',
    bodySize: 'text-xs',
    sectionFont: 'font-sans',
    sectionSize: 'text-[9px]',
    sectionWeight: 'font-bold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-xs',
    sidebarTitleColor: '#0F172A',
    sidebarTextColor: '#64748B',
    sectionGap: 'space-y-3',
    itemGap: 'space-y-2',
    borderRadius: 'rounded-md',
    cardShadow: 'shadow-sm',
    useGradient: false,
    showIcons: false,
    showDivider: true,
    dividerStyle: 'solid',
    tagStyle: 'square',
    tagBorder: true,
    useAccentBorders: false,
    contactInSidebar: false,
    accentColor: '#64748B',
    sidebarBgColor: '#FFFFFF',
    sectionTitleColor: '#0F172A',
    bodyTextColor: '#1E293B',
    dividerColor: '#0F172A',
    headerBgColor: '#64748B',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#64748B',
    showDecorativeLine: false,
    showInitialBadge: false,
    useModernSpacing: false,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'minimal',
    sectionStyle: 'minimal',
    photoBorder: false,
    photoBorderColor: '#64748B',
    useVerticalAccent: false,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // STUDENT — Young, vibrant
  // ============================================================
  student: {
    id: 'student',
    name: 'Étudiant',
    sidebarWidth: 0,
    sidebarPosition: 'left',
    useHeaderBand: true,
    headerBandHeight: 6,
    showSidebarPhoto: true,
    photoSize: 32,
    photoShape: 'soft-rounded',
    sidebarPadding: 'p-0',
    mainPadding: 'p-7',
    nameFont: 'font-sans',
    nameSize: 'text-2xl',
    nameWeight: 'font-bold',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-base',
    titleWeight: 'font-medium',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-[10px]',
    sectionWeight: 'font-bold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#1E1B4B',
    sidebarTextColor: '#4A1942',
    sectionGap: 'space-y-5',
    itemGap: 'space-y-3',
    borderRadius: 'rounded-2xl',
    cardShadow: 'shadow-lg',
    useGradient: true,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'dashed',
    tagStyle: 'rounded',
    tagBorder: false,
    useAccentBorders: true,
    contactInSidebar: false,
    accentColor: '#8B5CF6',
    sidebarBgColor: '#F5F3FF',
    sectionTitleColor: '#1E1B4B',
    bodyTextColor: '#1E293B',
    dividerColor: '#8B5CF6',
    headerBgColor: '#8B5CF6',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#A78BFA',
    showDecorativeLine: true,
    showInitialBadge: true,
    useModernSpacing: true,
    showSectionNumbers: true,
    useFloatingCards: true,
    useAccentCorner: true,
    useSoftShapes: true,
    headerStyle: 'bold',
    sectionStyle: 'number',
    photoBorder: true,
    photoBorderColor: '#8B5CF6',
    useVerticalAccent: false,
    useHorizontalAccent: true,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // PROFESSIONAL2 — Alternative professional
  // ============================================================
  professional2: {
    id: 'professional2',
    name: 'Professionnel 2',
    sidebarWidth: 180,
    sidebarPosition: 'left',
    useHeaderBand: true,
    headerBandHeight: 3,
    showSidebarPhoto: true,
    photoSize: 24,
    photoShape: 'circle',
    sidebarPadding: 'p-5',
    mainPadding: 'p-7',
    nameFont: 'font-sans',
    nameSize: 'text-xl',
    nameWeight: 'font-bold',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-base',
    titleWeight: 'font-medium',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-[10px]',
    sectionWeight: 'font-semibold',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#0F172A',
    sidebarTextColor: '#475569',
    sectionGap: 'space-y-4',
    itemGap: 'space-y-3',
    borderRadius: 'rounded-lg',
    cardShadow: 'shadow-md',
    useGradient: false,
    showIcons: true,
    showDivider: true,
    dividerStyle: 'solid',
    tagStyle: 'rounded',
    tagBorder: true,
    useAccentBorders: true,
    contactInSidebar: true,
    accentColor: '#0F172A',
    sidebarBgColor: '#F8FAFC',
    sectionTitleColor: '#0F172A',
    bodyTextColor: '#1E293B',
    dividerColor: '#0F172A',
    headerBgColor: '#0F172A',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#0F172A',
    showDecorativeLine: true,
    showInitialBadge: false,
    useModernSpacing: false,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'clean',
    sectionStyle: 'line',
    photoBorder: true,
    photoBorderColor: '#0F172A',
    useVerticalAccent: true,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },

  // ============================================================
  // MINIMAL2 — Ultra minimal
  // ============================================================
  minimal2: {
    id: 'minimal2',
    name: 'Minimal 2',
    sidebarWidth: 0,
    sidebarPosition: 'left',
    useHeaderBand: false,
    showSidebarPhoto: false,
    photoSize: 0,
    photoShape: 'circle',
    sidebarPadding: 'p-0',
    mainPadding: 'p-8',
    nameFont: 'font-sans',
    nameSize: 'text-3xl',
    nameWeight: 'font-light',
    nameTransform: 'none',
    titleFont: 'font-sans',
    titleSize: 'text-lg',
    titleWeight: 'font-light',
    bodyFont: 'font-sans',
    bodySize: 'text-sm',
    sectionFont: 'font-sans',
    sectionSize: 'text-xs',
    sectionWeight: 'font-medium',
    sectionTransform: 'uppercase',
    sidebarTextSize: 'text-sm',
    sidebarTitleColor: '#0F172A',
    sidebarTextColor: '#64748B',
    sectionGap: 'space-y-6',
    itemGap: 'space-y-3',
    borderRadius: 'rounded-none',
    cardShadow: 'shadow-none',
    useGradient: false,
    showIcons: false,
    showDivider: false,
    dividerStyle: 'none',
    tagStyle: 'square',
    tagBorder: true,
    useAccentBorders: false,
    contactInSidebar: false,
    accentColor: '#0F172A',
    sidebarBgColor: '#FFFFFF',
    sectionTitleColor: '#0F172A',
    bodyTextColor: '#1E293B',
    dividerColor: '#E2E8F0',
    headerBgColor: '#0F172A',
    headerTextColor: '#FFFFFF',
    sidebarAccentColor: '#0F172A',
    showDecorativeLine: false,
    showInitialBadge: false,
    useModernSpacing: true,
    showSectionNumbers: false,
    useFloatingCards: false,
    useAccentCorner: false,
    useSoftShapes: false,
    headerStyle: 'minimal',
    sectionStyle: 'minimal',
    photoBorder: false,
    photoBorderColor: '#0F172A',
    useVerticalAccent: false,
    useHorizontalAccent: false,
    cardBackground: '#FFFFFF',
  },
}

function getTemplateColors(template: CvTemplateKey, customColors?: CVColors): CVColors {
  const style = TEMPLATE_STYLES[template]
  const baseColors = {
    ...DEFAULT_CV_COLORS,
    sidebarBackground: style?.sidebarBgColor || '#0F172A',
    accent: style?.accentColor || '#10B981',
    sectionTitle: style?.sectionTitleColor || '#0F172A',
    bodyText: style?.bodyTextColor || '#1E293B',
    divider: style?.dividerColor || '#E2E8F0',
  }
  return { ...baseColors, ...(customColors || {}) }
}

export interface ElementStyles {
  [elementId: string]: {
    color?: string
    fontSize?: number
    fontWeight?: string
    barColor?: string
    backgroundColor?: string
    borderColor?: string
    thickness?: number
  }
}

interface CVTemplateProps {
  cvData: CVData & { template?: CvTemplateKey }
  selectedTemplate?: string
  locale?: 'fr' | 'en'
  onReset?: () => void
  onToggleLocale?: () => void
  selectedElement?: string | null
  onSelectElement?: (elementId: string | null) => void
  elementStyles?: ElementStyles
  onElementStyleChange?: (elementId: string, style: { color?: string; fontSize?: number; fontWeight?: string; barColor?: string; backgroundColor?: string; borderColor?: string; thickness?: number }) => void
}

function translateText(value: string, locale: 'fr' | 'en') {
  if (locale === 'fr' || !value) return value
  const translations: Record<string, string> = {
    'à propos de moi': 'about me',
    'expérience professionnelle': 'professional experience',
    'formations': 'education',
    'compétences': 'skills',
    'langues': 'languages',
    'intérêts': 'interests',
    'contact': 'contact',
    'stage': 'internship',
    'stages': 'internships',
  }
  let result = value
  for (const [fr, en] of Object.entries(translations)) {
    result = result.replace(new RegExp(fr, 'gi'), en)
  }
  return result
}

export function CVTemplate({ 
  cvData, 
  selectedTemplate, 
  locale = 'fr', 
  onReset, 
  onToggleLocale, 
  selectedElement,
  onSelectElement,
  elementStyles = {},
  onElementStyleChange,
}: CVTemplateProps) {
  const template = (selectedTemplate || cvData.template || 'modern') as CvTemplateKey
  const style = TEMPLATE_STYLES[template] || TEMPLATE_STYLES.modern
  const colors = getTemplateColors(template, cvData.colors)
  const interactive = Boolean(onSelectElement)
  const isEnglish = locale === 'en'
  const t = (text: string) => isEnglish ? translateText(text, 'en') : text

  const cvRef = useRef<HTMLDivElement | null>(null)
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    const el = cvRef.current
    if (!el) return
    const compute = () => {
      const a4Px = 1122
      const pages = Math.max(1, Math.ceil(el.scrollHeight / a4Px))
      setPageCount(pages)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [cvData, template])

  const sidebarBgColor = elementStyles['sidebarBackground']?.color || style.sidebarBgColor || '#0F172A'
  const sidebarStyle = style.useGradient
    ? {
        background: `linear-gradient(180deg, ${sidebarBgColor} 0%, ${darken(sidebarBgColor, 0.18)} 100%)`,
      }
    : { background: sidebarBgColor }

  const sidebarClass = cn(
    style.sidebarPadding,
    'min-w-0 box-border h-full',
    style.sidebarWidth > 0 ? 'border-r border-[#E6E9EE]' : '',
    template === 'classic' ? 'font-serif' : '',
    template === 'tech' ? 'font-mono' : ''
  )

  const hasValue = (value: string | undefined) => value && value.trim().length > 0
  const safe = (value: string | undefined) => value || ''

  const getElementStyle = (elementId: string, defaultColor?: string, defaultFontSize?: number) => {
    const styles = elementStyles[elementId] || {}
    return {
      color: styles.color || defaultColor || '#000000',
      fontSize: styles.fontSize || defaultFontSize || 14,
      borderColor: styles.borderColor || undefined,
    }
  }

  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSelectElement) {
      onSelectElement(selectedElement === elementId ? null : elementId)
    }
  }

  const isSelected = (elementId: string) => selectedElement === elementId

  const sectionTitleStyle = (elementId: string) => {
    const style_ = getElementStyle(elementId, style.sectionTitleColor || '#0F172A', 12)
    return {
      color: style_.color,
      fontSize: style_.fontSize,
      letterSpacing: '0.08em',
      fontWeight: 600,
      textTransform: style.sectionTransform as 'uppercase' | 'capitalize' | 'none',
    }
  }

  const renderDivider = (elementId: string) => {
    const style_ = getElementStyle(elementId, style.dividerColor || style.accentColor || '#E2E8F0', undefined)
    
    if (style.dividerStyle === 'none') return null
    
    if (style.dividerStyle === 'accent-line') {
      return (
        <div className="mt-1.5 mb-3 flex items-center gap-2">
          <div 
            className="h-0.5 w-8 rounded-full"
            style={{ background: style_.color }}
          />
          <div 
            className="h-0.5 w-12 rounded-full opacity-30"
            style={{ background: style_.color }}
          />
        </div>
      )
    }
    
    if (style.dividerStyle === 'double') {
      return (
        <div className="mt-1.5 mb-3">
          <div 
            className="h-0.5 w-10"
            style={{ background: style_.color }}
          />
          <div 
            className="mt-0.5 h-0.5 w-10"
            style={{ background: style_.color }}
          />
        </div>
      )
    }
    
    if (style.dividerStyle === 'dashed') {
      return (
        <div 
          className="mt-1.5 mb-3 h-0.5 w-12"
          style={{ 
            background: style_.color,
            borderTop: `1px dashed ${style_.color}`,
            height: '0px',
          }}
        />
      )
    }
    
    return (
      <div 
        className="mt-1.5 mb-3 h-0.5 w-10"
        style={{ background: style_.color }}
      />
    )
  }

  const showSidebar = style.sidebarWidth > 0

  // Get first letter for initial badge
  const firstName = cvData.personal?.name?.trim()?.split(' ')?.[0] || ''
  const initial = firstName.charAt(0).toUpperCase()

  // Photo shape classes
  const getPhotoShapeClass = () => {
    switch (style.photoShape) {
      case 'circle': return 'rounded-full'
      case 'rounded-square': return 'rounded-xl'
      case 'soft-rounded': return 'rounded-2xl'
      case 'portrait': return 'rounded-lg'
      case 'floating': return 'rounded-2xl shadow-xl'
      default: return 'rounded-full'
    }
  }

  // Section style
  const renderSectionTitle = (title: string, elementId: string, index?: number) => {
    const style_ = sectionTitleStyle(elementId)
    
    if (style.sectionStyle === 'number' && index !== undefined) {
      return (
        <div className="flex items-center gap-3">
          <span 
            className="text-sm font-bold"
            style={{ color: style.accentColor }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>
          <p 
            className={cn(style.sectionFont, style.sectionSize, style.sectionWeight, style.sectionTransform, 'tracking-wider')}
            style={{ 
              color: style_.color,
              fontSize: style_.fontSize,
              letterSpacing: '0.08em',
            }}
          >
            {title}
          </p>
        </div>
      )
    }
    
    if (style.sectionStyle === 'badge') {
      return (
        <div>
          <span 
            className="inline-block px-3 py-0.5 text-xs font-medium tracking-wider uppercase rounded-full"
            style={{ 
              background: style.accentColor + '20',
              color: style.accentColor,
            }}
          >
            {title}
          </span>
        </div>
      )
    }
    
    return (
      <p 
        className={cn(style.sectionFont, style.sectionSize, style.sectionWeight, style.sectionTransform, 'tracking-wider')}
        style={{ 
          color: style_.color,
          fontSize: style_.fontSize,
          letterSpacing: '0.08em',
        }}
      >
        {title}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <DownloadCVButton cvData={cvData} />
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1E2530]/15 bg-white px-4 py-2 text-sm font-medium text-[#8B93A1] transition-colors hover:bg-[#1E2530]/5"
          >
            <RotateCcw className="size-4" /> Réinitialiser
          </button>
        )}
        {onToggleLocale && (
          <button
            onClick={onToggleLocale}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1E2530]/15 bg-white px-4 py-2 text-sm font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
          >
            <Globe className="size-4" /> {locale === 'fr' ? 'Traduire votre CV en anglais' : 'Switch CV to French'}
          </button>
        )}
      </div>

      <div id="cv-content" data-template={template} ref={cvRef} className="bg-white">
        <Card className={cn(
          style.borderRadius, 
          style.cardShadow, 
          style.useFloatingCards ? 'overflow-visible' : 'overflow-hidden',
          'shadow-lg'
        )}>
          {/* Header Band */}
          {style.useHeaderBand && (
            <div 
              className="w-full"
              style={{ 
                background: style.headerBgColor || style.accentColor,
                height: `${(style.headerBandHeight || 4) * 3}px`,
                borderTopLeftRadius: style.borderRadius === 'rounded-2xl' ? '1rem' : style.borderRadius === 'rounded-xl' ? '0.75rem' : style.borderRadius === 'rounded-lg' ? '0.5rem' : '0',
                borderTopRightRadius: style.borderRadius === 'rounded-2xl' ? '1rem' : style.borderRadius === 'rounded-xl' ? '0.75rem' : style.borderRadius === 'rounded-lg' ? '0.5rem' : '0',
              }} 
            />
          )}

          {/* Accent Corner for creative templates */}
          {style.useAccentCorner && !style.useHeaderBand && (
            <div 
              className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none"
              style={{
                background: `radial-gradient(circle at top right, ${style.accentColor} 0%, transparent 70%)`,
                borderTopRightRadius: style.borderRadius === 'rounded-2xl' ? '1rem' : '0.75rem',
              }}
            />
          )}

          <CardContent
            className={cn(
              'grid gap-0 p-0 relative',
              style.useFloatingCards ? 'bg-transparent' : ''
            )}
            style={{ 
              gridTemplateColumns: showSidebar ? `${style.sidebarWidth}px minmax(0, 1fr)` : '1fr',
              alignItems: 'start' 
            }}
          >
            {/* SIDEBAR */}
            {showSidebar && (
              <div
                className={cn(
                  sidebarClass, 
                  interactive && 'cv-selectable', 
                  isSelected('sidebarBackground') && 'cv-selected',
                  style.useSoftShapes ? 'rounded-r-3xl' : ''
                )}
                style={{ ...sidebarStyle, color: colors.sidebarText }}
                data-tooltip={interactive ? 'Barre latérale' : undefined}
                onClick={(e) => {
                  if (e.target === e.currentTarget || (e.target as HTMLElement).closest?.('.sidebar-child') === null) {
                    handleElementClick('sidebarBackground', e)
                  }
                }}
              >
                {/* Photo / Initial Badge */}
                {style.showSidebarPhoto && cvData.personal.photo && (
                  <div className="flex justify-center mb-5 sidebar-child">
                    <div 
                      className={cn(
                        'shrink-0 overflow-hidden',
                        getPhotoShapeClass(),
                        style.photoBorder ? `border-4` : '',
                        'shadow-lg'
                      )}
                      style={{ 
                        height: style.photoSize * 4, 
                        width: style.photoSize * 4,
                        borderColor: style.photoBorder ? style.photoBorderColor : 'transparent',
                      }}
                    >
                      <img
                        src={cvData.personal.photo}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {style.showInitialBadge && !cvData.personal.photo && hasValue(cvData.personal.name) && (
                  <div className="flex justify-center mb-5 sidebar-child">
                    <div 
                      className={cn(
                        'flex items-center justify-center shadow-lg',
                        getPhotoShapeClass()
                      )}
                      style={{ 
                        height: style.photoSize * 4, 
                        width: style.photoSize * 4,
                        background: style.accentColor || '#DB2777',
                        color: '#FFFFFF',
                        fontSize: `${style.photoSize * 1.8}px`,
                        fontWeight: 'bold',
                      }}
                    >
                      {initial}
                    </div>
                  </div>
                )}

                {/* ABOUT */}
                {hasValue(cvData.personal.summary) && (
                  <div className="mb-5 sidebar-child">
                    <div
                      className={cn('cv-selectable', isSelected('aboutTitle') && 'cv-selected')}
                      data-tooltip={interactive ? 'Titre de section' : undefined}
                      onClick={(e) => handleElementClick('aboutTitle', e)}
                    >
                      {renderSectionTitle(t('À propos de moi'), 'aboutTitle')}
                      {style.showDivider && style.dividerStyle !== 'none' && renderDivider('aboutDivider')}
                    </div>
                    <p
                      className={cn('leading-relaxed break-words', style.sidebarTextSize, interactive && 'cv-selectable', isSelected('aboutText') && 'cv-selected')}
                      style={{ 
                        color: getElementStyle('aboutText', style.sidebarTextColor || colors.sidebarText).color,
                        fontSize: getElementStyle('aboutText', 13).fontSize,
                      }}
                      data-tooltip={interactive ? 'Texte' : undefined}
                      onClick={(e) => handleElementClick('aboutText', e)}
                    >
                      {t(safe(cvData.personal.summary))}
                    </p>
                  </div>
                )}

                {/* CONTACT */}
                {style.contactInSidebar && (hasValue(cvData.personal.email) || hasValue(cvData.personal.phone) || hasValue(cvData.personal.location)) && (
                  <div className="mb-5 sidebar-child">
                    <div
                      className={cn('cv-selectable', isSelected('contactTitle') && 'cv-selected')}
                      data-tooltip={interactive ? 'Titre de section' : undefined}
                      onClick={(e) => handleElementClick('contactTitle', e)}
                    >
                      {renderSectionTitle(t('Contact'), 'contactTitle')}
                      {style.showDivider && style.dividerStyle !== 'none' && renderDivider('contactDivider')}
                    </div>
                    <div className="space-y-2.5">
                      {hasValue(cvData.personal.email) && (
                        <div 
                          className={cn('flex items-start gap-3 min-w-0 sidebar-child', interactive && 'cv-selectable', isSelected('contactEmail') && 'cv-selected')}
                          data-tooltip={interactive ? 'Email' : undefined}
                          onClick={(e) => handleElementClick('contactEmail', e)}
                        >
                          {style.showIcons && <Mail className="mt-0.5 size-4 shrink-0" style={{ color: style.sidebarAccentColor || colors.sidebarIcon }} />}
                          <span 
                            className="min-w-0 break-words"
                            style={{ 
                              color: getElementStyle('contactEmail', style.sidebarTextColor || colors.contactText).color,
                              fontSize: getElementStyle('contactEmail', 13).fontSize,
                            }}
                          >
                            {cvData.personal.email}
                          </span>
                        </div>
                      )}
                      {hasValue(cvData.personal.phone) && (
                        <div 
                          className={cn('flex items-start gap-3 min-w-0 sidebar-child', interactive && 'cv-selectable', isSelected('contactPhone') && 'cv-selected')}
                          data-tooltip={interactive ? 'Téléphone' : undefined}
                          onClick={(e) => handleElementClick('contactPhone', e)}
                        >
                          {style.showIcons && <Phone className="mt-0.5 size-4 shrink-0" style={{ color: style.sidebarAccentColor || colors.sidebarIcon }} />}
                          <span 
                            className="min-w-0 break-words"
                            style={{ 
                              color: getElementStyle('contactPhone', style.sidebarTextColor || colors.contactText).color,
                              fontSize: getElementStyle('contactPhone', 13).fontSize,
                            }}
                          >
                            {cvData.personal.phone}
                          </span>
                        </div>
                      )}
                      {hasValue(cvData.personal.location) && (
                        <div 
                          className={cn('flex items-start gap-3 min-w-0 sidebar-child', interactive && 'cv-selectable', isSelected('contactLocation') && 'cv-selected')}
                          data-tooltip={interactive ? 'Localisation' : undefined}
                          onClick={(e) => handleElementClick('contactLocation', e)}
                        >
                          {style.showIcons && <MapPin className="mt-0.5 size-4 shrink-0" style={{ color: style.sidebarAccentColor || colors.sidebarIcon }} />}
                          <span 
                            className="min-w-0 break-words"
                            style={{ 
                              color: getElementStyle('contactLocation', style.sidebarTextColor || colors.contactText).color,
                              fontSize: getElementStyle('contactLocation', 13).fontSize,
                            }}
                          >
                            {cvData.personal.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SKILLS */}
                {((cvData.competenceCategories?.length ?? 0) > 0 || (cvData.skills?.length ?? 0) > 0) && (
                  <div className="sidebar-child">
                    <div
                      className={cn('cv-selectable', isSelected('skillsTitle') && 'cv-selected')}
                      data-tooltip={interactive ? 'Titre de section' : undefined}
                      onClick={(e) => handleElementClick('skillsTitle', e)}
                    >
                      {renderSectionTitle(t('Compétences'), 'skillsTitle')}
                      {style.showDivider && style.dividerStyle !== 'none' && renderDivider('skillsDivider')}
                    </div>
                    {cvData.competenceCategories && cvData.competenceCategories.length > 0 ? (
                      <div className="space-y-4">
                        {cvData.competenceCategories.map((category) => {
                          const categoryId = `skill-category-${category.id}`
                          return (
                            <div key={category.id}>
                              <div
                                className={cn('cv-selectable sidebar-child', isSelected(categoryId) && 'cv-selected')}
                                data-tooltip={interactive ? 'Catégorie' : undefined}
                                onClick={(e) => handleElementClick(categoryId, e)}
                              >
                                <p 
                                  className="font-medium tracking-wide"
                                  style={{ 
                                    color: getElementStyle(categoryId, style.sidebarTextColor || '#FFFFFF').color,
                                    fontSize: getElementStyle(categoryId, 13).fontSize,
                                  }}
                                >
                                  {t(category.title)}
                                </p>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {category.skills.map((skill) => {
                                  const skillId = `skill-${skill.id}`
                                  const tagColor = getElementStyle(skillId, style.sidebarTextColor || '#FFFFFF', 12)
                                  
                                  if (style.tagStyle === 'minimal') {
                                    return (
                                      <span
                                        key={skill.id}
                                        className={cn(
                                          'text-xs font-medium sidebar-child',
                                          interactive && 'cv-selectable',
                                          isSelected(skillId) && 'cv-selected'
                                        )}
                                        style={{ 
                                          color: tagColor.color,
                                          fontSize: tagColor.fontSize,
                                        }}
                                        data-tooltip={interactive ? 'Compétence' : undefined}
                                        onClick={(e) => handleElementClick(skillId, e)}
                                      >
                                        {t(skill.name)}
                                      </span>
                                    )
                                  }
                                  
                                  return (
                                    <span
                                      key={skill.id}
                                      className={cn(
                                        'px-3 py-1.5 text-xs font-medium sidebar-child',
                                        style.tagStyle === 'pill' ? 'rounded-full' : 
                                        style.tagStyle === 'rounded' ? 'rounded-full' : 
                                        style.tagStyle === 'square' ? 'rounded' : 
                                        style.tagStyle === 'outline' ? 'rounded-full border-2' : 'rounded-full',
                                        style.tagBorder && style.tagStyle !== 'outline' && style.tagStyle !== 'minimal' ? 'border border-white/20' : '',
                                        interactive && 'cv-selectable',
                                        isSelected(skillId) && 'cv-selected'
                                      )}
                                      style={{ 
                                        background: style.tagStyle === 'outline' ? 'transparent' : 'rgba(255,255,255,0.10)',
                                        color: tagColor.color,
                                        fontSize: tagColor.fontSize,
                                        borderColor: style.tagStyle === 'outline' ? tagColor.color : (style.tagBorder ? 'rgba(255,255,255,0.2)' : undefined),
                                      }}
                                      data-tooltip={interactive ? 'Compétence' : undefined}
                                      onClick={(e) => handleElementClick(skillId, e)}
                                    >
                                      {t(skill.name)}
                                    </span>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {cvData.skills?.map((skill, idx) => {
                          const skillId = `skill-${idx}`
                          const tagColor = getElementStyle(skillId, style.sidebarTextColor || '#FFFFFF', 12)
                          
                          if (style.tagStyle === 'minimal') {
                            return (
                              <span
                                key={idx}
                                className={cn(
                                  'text-xs font-medium sidebar-child',
                                  interactive && 'cv-selectable',
                                  isSelected(skillId) && 'cv-selected'
                                )}
                                style={{ 
                                  color: tagColor.color,
                                  fontSize: tagColor.fontSize,
                                }}
                                data-tooltip={interactive ? 'Compétence' : undefined}
                                onClick={(e) => handleElementClick(skillId, e)}
                              >
                                {t(skill)}
                              </span>
                            )
                          }
                          
                          return (
                            <span                              key={idx}
                              className={cn(
                                'px-3 py-1.5 text-xs font-medium sidebar-child',
                                style.tagStyle === 'pill' ? 'rounded-full' : 
                                style.tagStyle === 'rounded' ? 'rounded-full' : 
                                style.tagStyle === 'square' ? 'rounded' : 
                                style.tagStyle === 'outline' ? 'rounded-full border-2' : 'rounded-full',
                                style.tagBorder && style.tagStyle !== 'outline' && style.tagStyle !== 'minimal' ? 'border border-white/20' : '',
                                interactive && 'cv-selectable',
                                isSelected(skillId) && 'cv-selected'
                              )}
                              style={{ 
                                background: style.tagStyle === 'outline' ? 'transparent' : 'rgba(255,255,255,0.10)',
                                color: tagColor.color,
                                fontSize: tagColor.fontSize,
                                borderColor: style.tagStyle === 'outline' ? tagColor.color : (style.tagBorder ? 'rgba(255,255,255,0.2)' : undefined),
                              }}
                              data-tooltip={interactive ? 'Compétence' : undefined}
                              onClick={(e) => handleElementClick(skillId, e)}
                            >
                              {t(skill)}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* LANGUAGES - in sidebar for templates with contactInSidebar */}
                {style.contactInSidebar && cvData.languages && cvData.languages.length > 0 && (
                  <div className="mt-5 sidebar-child">
                    <div
                      className={cn('cv-selectable', isSelected('languagesTitle') && 'cv-selected')}
                      data-tooltip={interactive ? 'Titre de section' : undefined}
                      onClick={(e) => handleElementClick('languagesTitle', e)}
                    >
                      {renderSectionTitle(t('Langues'), 'languagesTitle')}
                      {style.showDivider && style.dividerStyle !== 'none' && renderDivider('languagesDivider')}
                    </div>
                    <div className="space-y-1.5">
                      {cvData.languages.map((lang, idx) => {
                        const label = typeof lang === 'string' ? lang : lang.name
                        const level = typeof lang === 'string' ? undefined : lang.level
                        const key = typeof lang === 'string' ? `lang-${idx}` : lang.id
                        const displayLabel = level ? `${t(label)} (${t(level)})` : t(label)
                        const langId = `lang-${key}`
                        return (
                          <div
                            key={key}
                            className={cn('flex items-center justify-between sidebar-child', interactive && 'cv-selectable', isSelected(langId) && 'cv-selected')}
                            data-tooltip={interactive ? 'Langue' : undefined}
                            onClick={(e) => handleElementClick(langId, e)}
                          >
                            <span 
                              style={{ 
                                color: getElementStyle(langId, style.sidebarTextColor || '#FFFFFF').color,
                                fontSize: getElementStyle(langId, 13).fontSize,
                              }}
                            >
                              {displayLabel}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* INTERESTS - in sidebar for templates with contactInSidebar */}
                {style.contactInSidebar && cvData.interests && cvData.interests.length > 0 && (
                  <div className="mt-5 sidebar-child">
                    <div
                      className={cn('cv-selectable', isSelected('interestsTitle') && 'cv-selected')}
                      data-tooltip={interactive ? 'Titre de section' : undefined}
                      onClick={(e) => handleElementClick('interestsTitle', e)}
                    >
                      {renderSectionTitle(t('Intérêts'), 'interestsTitle')}
                      {style.showDivider && style.dividerStyle !== 'none' && renderDivider('interestsDivider')}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cvData.interests.map((interest, idx) => {
                        const interestId = `interest-${idx}`
                        const interestColor = getElementStyle(interestId, style.sidebarTextColor || '#FFFFFF', 12)
                        
                        if (style.tagStyle === 'minimal') {
                          return (
                            <span
                              key={idx}
                              className={cn(
                                'text-xs font-medium sidebar-child',
                                interactive && 'cv-selectable',
                                isSelected(interestId) && 'cv-selected'
                              )}
                              style={{ 
                                color: interestColor.color,
                                fontSize: interestColor.fontSize,
                              }}
                              data-tooltip={interactive ? 'Intérêt' : undefined}
                              onClick={(e) => handleElementClick(interestId, e)}
                            >
                              {t(interest)}
                            </span>
                          )
                        }
                        
                        return (
                          <span
                            key={idx}
                            className={cn(
                              'px-3 py-1.5 text-xs font-medium sidebar-child',
                              style.tagStyle === 'pill' ? 'rounded-full' : 
                              style.tagStyle === 'rounded' ? 'rounded-full' : 
                              style.tagStyle === 'square' ? 'rounded' : 
                              style.tagStyle === 'outline' ? 'rounded-full border-2' : 'rounded-full',
                              style.tagBorder && style.tagStyle !== 'outline' && style.tagStyle !== 'minimal' ? 'border border-white/20' : '',
                              interactive && 'cv-selectable',
                              isSelected(interestId) && 'cv-selected'
                            )}
                            style={{ 
                              background: style.tagStyle === 'outline' ? 'transparent' : 'rgba(255,255,255,0.08)',
                              color: interestColor.color,
                              fontSize: interestColor.fontSize,
                              borderColor: style.tagStyle === 'outline' ? interestColor.color : (style.tagBorder ? 'rgba(255,255,255,0.2)' : undefined),
                            }}
                            data-tooltip={interactive ? 'Intérêt' : undefined}
                            onClick={(e) => handleElementClick(interestId, e)}
                          >
                            {t(interest)}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MAIN CONTENT */}
            <div className={cn(
              'min-w-0 box-border', 
              style.mainPadding, 
              style.sectionGap,
              style.useFloatingCards ? 'bg-transparent' : ''
            )}>
              {/* NAME & TITLE */}
              {(hasValue(cvData.personal.name) || hasValue(cvData.personal.title)) && (
                <div className="mb-6">
                  {style.showDecorativeLine && !showSidebar && (
                    <div className="mb-4">
                      <div 
                        className="w-12 h-1 rounded-full"
                        style={{ background: style.accentColor || '#10B981' }}
                      />
                    </div>
                  )}
                  <h1
                    className={cn(
                      style.nameFont,
                      style.nameSize,
                      style.nameWeight,
                      style.nameTransform === 'uppercase' ? 'uppercase' : '',
                      'break-words tracking-tight',
                      style.forceDarkText ? 'text-[#0E1729]' : '',
                      interactive && 'cv-selectable',
                      selectedElement === 'name' && 'cv-selected'
                    )}
                    style={{ 
                      color: getElementStyle('name', colors.name).color,
                      fontSize: getElementStyle('name', 32).fontSize,
                    }}
                    data-tooltip={interactive ? 'Nom' : undefined}
                    onClick={(e) => handleElementClick('name', e)}
                  >
                    {safe(cvData.personal.name)}
                  </h1>
                  {hasValue(cvData.personal.title) && (
                    <p
                      className={cn(
                        style.titleFont,
                        style.titleSize,
                        style.titleWeight,
                        'break-words mt-1',
                        style.forceDarkText ? 'text-[#0E1729]' : '',
                        interactive && 'cv-selectable',
                        selectedElement === 'jobTitle' && 'cv-selected'
                      )}
                      style={{ 
                        color: getElementStyle('jobTitle', colors.jobTitle || style.accentColor).color,
                        fontSize: getElementStyle('jobTitle', 16).fontSize,
                      }}
                      data-tooltip={interactive ? 'Intitulé du poste' : undefined}
                      onClick={(e) => handleElementClick('jobTitle', e)}
                    >
                      {t(safe(cvData.personal.title))}
                    </p>
                  )}
                  {style.showDecorativeLine && showSidebar && (
                    <div className="mt-3">
                      <div 
                        className="w-12 h-1 rounded-full"
                        style={{ background: style.accentColor || '#10B981' }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* LANGUAGES - in main content for templates without sidebar */}
              {!style.contactInSidebar && cvData.languages && cvData.languages.length > 0 && (
                <div className="mb-5">
                  <div
                    className={cn('cv-selectable', isSelected('languagesTitle') && 'cv-selected')}
                    data-tooltip={interactive ? 'Titre de section' : undefined}
                    onClick={(e) => handleElementClick('languagesTitle', e)}
                  >
                    {renderSectionTitle(t('Langues'), 'languagesTitle')}
                    {style.showDivider && style.dividerStyle !== 'none' && renderDivider('languagesDivider')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cvData.languages.map((lang, idx) => {
                      const label = typeof lang === 'string' ? lang : lang.name
                      const level = typeof lang === 'string' ? undefined : lang.level
                      const key = typeof lang === 'string' ? `lang-${idx}` : lang.id
                      const displayLabel = level ? `${t(label)} (${t(level)})` : t(label)
                      const langId = `lang-${key}`
                      return (
                        <span
                          key={key}
                          className={cn(
                            'px-3 py-1.5 text-sm font-medium',
                            style.tagStyle === 'pill' ? 'rounded-full' : 
                            style.tagStyle === 'rounded' ? 'rounded-full' : 
                            style.tagStyle === 'square' ? 'rounded' : 
                            style.tagStyle === 'outline' ? 'rounded-full border-2' : 'rounded-full',
                            style.tagStyle === 'minimal' ? '' : '',
                            interactive && 'cv-selectable',
                            isSelected(langId) && 'cv-selected'
                          )}
                          style={{ 
                            background: style.tagStyle === 'outline' ? 'transparent' : (style.tagStyle === 'minimal' ? 'transparent' : '#F1F5F9'),
                            color: getElementStyle(langId, style.tagStyle === 'minimal' ? style.accentColor : '#1E293B').color,
                            borderColor: style.tagStyle === 'outline' ? getElementStyle(langId, style.accentColor).color : undefined,
                          }}
                          data-tooltip={interactive ? 'Langue' : undefined}
                          onClick={(e) => handleElementClick(langId, e)}
                        >
                          {displayLabel}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* INTERESTS - in main content for templates without sidebar */}
              {!style.contactInSidebar && cvData.interests && cvData.interests.length > 0 && (
                <div className="mb-5">
                  <div
                    className={cn('cv-selectable', isSelected('interestsTitle') && 'cv-selected')}
                    data-tooltip={interactive ? 'Titre de section' : undefined}
                    onClick={(e) => handleElementClick('interestsTitle', e)}
                  >
                    {renderSectionTitle(t('Intérêts'), 'interestsTitle')}
                    {style.showDivider && style.dividerStyle !== 'none' && renderDivider('interestsDivider')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cvData.interests.map((interest, idx) => {
                      const interestId = `interest-${idx}`
                      return (
                        <span
                          key={idx}
                          className={cn(
                            'px-3 py-1.5 text-sm font-medium',
                            style.tagStyle === 'pill' ? 'rounded-full' : 
                            style.tagStyle === 'rounded' ? 'rounded-full' : 
                            style.tagStyle === 'square' ? 'rounded' : 
                            style.tagStyle === 'outline' ? 'rounded-full border-2' : 'rounded-full',
                            style.tagStyle === 'minimal' ? '' : '',
                            interactive && 'cv-selectable',
                            isSelected(interestId) && 'cv-selected'
                          )}
                          style={{ 
                            background: style.tagStyle === 'outline' ? 'transparent' : (style.tagStyle === 'minimal' ? 'transparent' : '#F1F5F9'),
                            color: getElementStyle(interestId, style.tagStyle === 'minimal' ? style.accentColor : '#1E293B').color,
                            borderColor: style.tagStyle === 'outline' ? getElementStyle(interestId, style.accentColor).color : undefined,
                          }}
                          data-tooltip={interactive ? 'Intérêt' : undefined}
                          onClick={(e) => handleElementClick(interestId, e)}
                        >
                          {t(interest)}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* EXPERIENCE */}
              {cvData.experiences && cvData.experiences.length > 0 && (
                <div className="mb-6">
                  <div
                    className={cn('cv-selectable', isSelected('experienceTitle') && 'cv-selected')}
                    data-tooltip={interactive ? 'Titre de section' : undefined}
                    onClick={(e) => handleElementClick('experienceTitle', e)}
                  >
                    {renderSectionTitle(t('Expérience Professionnelle'), 'experienceTitle')}
                    {style.showDivider && style.dividerStyle !== 'none' && renderDivider('experienceDivider')}
                  </div>
                  <div className={cn(style.itemGap)}>
                    {cvData.experiences.map((exp, idx) => {
                      const expId = `exp-${exp.id}`
                      return (
                        <div
                          key={exp.id}
                          className={cn(
                            'pl-4',
                            style.useAccentBorders && 'border-l-2',
                            interactive && 'cv-selectable',
                            isSelected(expId) && 'cv-selected'
                          )}
                          style={{ borderColor: style.useAccentBorders ? style.accentColor : 'transparent' }}
                          data-tooltip={interactive ? 'Expérience' : undefined}
                          onClick={(e) => handleElementClick(expId, e)}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                            <div className="min-w-0">
                              <p
                                className={cn(style.bodyFont, 'font-bold break-words', interactive && 'cv-selectable', isSelected(`exp-position-${exp.id}`) && 'cv-selected')}
                                style={{ 
                                  color: getElementStyle(`exp-position-${exp.id}`, style.bodyTextColor).color,
                                  fontSize: getElementStyle(`exp-position-${exp.id}`, 15).fontSize,
                                }}
                                data-tooltip={interactive ? 'Poste' : undefined}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleElementClick(`exp-position-${exp.id}`, e)
                                }}
                              >
                                {t(exp.position)}
                              </p>
                              <p
                                className={cn(style.bodyFont, 'text-sm break-words', interactive && 'cv-selectable', isSelected(`exp-company-${exp.id}`) && 'cv-selected')}
                                style={{ 
                                  color: getElementStyle(`exp-company-${exp.id}`, colors.companyName || '#64748B').color,
                                  fontSize: getElementStyle(`exp-company-${exp.id}`, 13).fontSize,
                                }}
                                data-tooltip={interactive ? 'Entreprise' : undefined}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleElementClick(`exp-company-${exp.id}`, e)
                                }}
                              >
                                {t(exp.company)}
                              </p>
                            </div>
                            <span
                              className="whitespace-nowrap text-sm font-medium"
                              style={{ 
                                color: getElementStyle(`exp-date-${exp.id}`, colors.dates || '#94A3B8').color,
                                fontSize: getElementStyle(`exp-date-${exp.id}`, 12).fontSize,
                              }}
                              data-tooltip={interactive ? 'Dates' : undefined}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleElementClick(`exp-date-${exp.id}`, e)
                              }}
                            >
                              {exp.startDate} – {exp.endDate}
                            </span>
                          </div>
                          <p
                            className={cn('mt-2 leading-relaxed', style.bodySize, style.bodyFont, interactive && 'cv-selectable', isSelected(`exp-desc-${exp.id}`) && 'cv-selected')}
                            style={{ 
                              color: getElementStyle(`exp-desc-${exp.id}`, style.bodyTextColor).color,
                              fontSize: getElementStyle(`exp-desc-${exp.id}`, 13).fontSize,
                            }}
                            data-tooltip={interactive ? 'Description' : undefined}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleElementClick(`exp-desc-${exp.id}`, e)
                            }}
                          >
                            {t(exp.description)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* INTERNSHIPS */}
              {cvData.internships && cvData.internships.length > 0 && (
                <div className="mb-6">
                  <div
                    className={cn('cv-selectable', isSelected('internshipTitle') && 'cv-selected')}
                    data-tooltip={interactive ? 'Titre de section' : undefined}
                    onClick={(e) => handleElementClick('internshipTitle', e)}
                  >
                    {renderSectionTitle(t('Stages'), 'internshipTitle')}
                    {style.showDivider && style.dividerStyle !== 'none' && renderDivider('internshipDivider')}
                  </div>
                  <div className={cn(style.itemGap)}>
                    {cvData.internships.map((intern) => {
                      const internId = `intern-${intern.id}`
                      return (
                        <div
                          key={intern.id}
                          className={cn(
                            'pl-4',
                            style.useAccentBorders && 'border-l-2',
                            interactive && 'cv-selectable',
                            isSelected(internId) && 'cv-selected'
                          )}
                          style={{ borderColor: style.useAccentBorders ? style.accentColor : 'transparent' }}
                          data-tooltip={interactive ? 'Stage' : undefined}
                          onClick={(e) => handleElementClick(internId, e)}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                            <div className="min-w-0">
                              <p
                                className={cn(style.bodyFont, 'font-bold break-words', interactive && 'cv-selectable', isSelected(`intern-position-${intern.id}`) && 'cv-selected')}
                                style={{ 
                                  color: getElementStyle(`intern-position-${intern.id}`, style.bodyTextColor).color,
                                  fontSize: getElementStyle(`intern-position-${intern.id}`, 15).fontSize,
                                }}
                                data-tooltip={interactive ? 'Poste' : undefined}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleElementClick(`intern-position-${intern.id}`, e)
                                }}
                              >
                                {t(intern.position)}
                              </p>
                              <p
                                className={cn(style.bodyFont, 'text-sm break-words', interactive && 'cv-selectable', isSelected(`intern-company-${intern.id}`) && 'cv-selected')}
                                style={{ 
                                  color: getElementStyle(`intern-company-${intern.id}`, colors.companyName || '#64748B').color,
                                  fontSize: getElementStyle(`intern-company-${intern.id}`, 13).fontSize,
                                }}
                                data-tooltip={interactive ? 'Entreprise' : undefined}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleElementClick(`intern-company-${intern.id}`, e)
                                }}
                              >
                                {t(intern.company)}
                              </p>
                            </div>
                            <span
                              className="whitespace-nowrap text-sm font-medium"
                              style={{ 
                                color: getElementStyle(`intern-date-${intern.id}`, colors.dates || '#94A3B8').color,
                                fontSize: getElementStyle(`intern-date-${intern.id}`, 12).fontSize,
                              }}
                              data-tooltip={interactive ? 'Dates' : undefined}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleElementClick(`intern-date-${intern.id}`, e)
                              }}
                            >
                              {intern.startDate} – {intern.endDate}
                            </span>
                          </div>
                          <p
                            className={cn('mt-2 leading-relaxed', style.bodySize, style.bodyFont, interactive && 'cv-selectable', isSelected(`intern-desc-${intern.id}`) && 'cv-selected')}
                            style={{ 
                              color: getElementStyle(`intern-desc-${intern.id}`, style.bodyTextColor).color,
                              fontSize: getElementStyle(`intern-desc-${intern.id}`, 13).fontSize,
                            }}
                            data-tooltip={interactive ? 'Description' : undefined}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleElementClick(`intern-desc-${intern.id}`, e)
                            }}
                          >
                            {t(intern.description)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* EDUCATION */}
              {cvData.education && cvData.education.length > 0 && (
                <div>
                  <div
                    className={cn('cv-selectable', isSelected('educationTitle') && 'cv-selected')}
                    data-tooltip={interactive ? 'Titre de section' : undefined}
                    onClick={(e) => handleElementClick('educationTitle', e)}
                  >
                    {renderSectionTitle(t('Formations'), 'educationTitle')}
                    {style.showDivider && style.dividerStyle !== 'none' && renderDivider('educationDivider')}
                  </div>
                  <div className={cn(style.itemGap)}>
                    {cvData.education.map((edu) => {
                      const eduId = `edu-${edu.id}`
                      return (
                        <div
                          key={edu.id}
                          className={cn(
                            'pl-4',
                            style.useAccentBorders && 'border-l-2',
                            interactive && 'cv-selectable',
                            isSelected(eduId) && 'cv-selected'
                          )}
                          style={{ borderColor: style.useAccentBorders ? style.accentColor : 'transparent' }}
                          data-tooltip={interactive ? 'Formation' : undefined}
                          onClick={(e) => handleElementClick(eduId, e)}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                            <div className="min-w-0">
                              <p
                                className={cn(style.bodyFont, 'font-bold break-words', interactive && 'cv-selectable', isSelected(`edu-degree-${edu.id}`) && 'cv-selected')}
                                style={{ 
                                  color: getElementStyle(`edu-degree-${edu.id}`, colors.educationTitle || style.bodyTextColor).color,
                                  fontSize: getElementStyle(`edu-degree-${edu.id}`, 15).fontSize,
                                }}
                                data-tooltip={interactive ? 'Diplôme' : undefined}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleElementClick(`edu-degree-${edu.id}`, e)
                                }}
                              >
                                {t(edu.degree)}
                              </p>
                              <p
                                className={cn(style.bodyFont, 'text-sm break-words', interactive && 'cv-selectable', isSelected(`edu-school-${edu.id}`) && 'cv-selected')}
                                style={{ 
                                  color: getElementStyle(`edu-school-${edu.id}`, colors.companyName || '#64748B').color,
                                  fontSize: getElementStyle(`edu-school-${edu.id}`, 13).fontSize,
                                }}
                                data-tooltip={interactive ? 'École' : undefined}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleElementClick(`edu-school-${edu.id}`, e)
                                }}
                              >
                                {t(edu.school)}
                              </p>
                            </div>
                            <span
                              className="whitespace-nowrap text-sm font-medium"
                              style={{ 
                                color: getElementStyle(`edu-year-${edu.id}`, colors.dates || '#94A3B8').color,
                                fontSize: getElementStyle(`edu-year-${edu.id}`, 12).fontSize,
                              }}
                              data-tooltip={interactive ? 'Année' : undefined}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleElementClick(`edu-year-${edu.id}`, e)
                              }}
                            >
                              {edu.year}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="cv-footer" data-template={template}>
          <div className="cv-footer-left">Career Craft</div>
          <div className="cv-footer-center">Page 1 / {pageCount}</div>
          <div className="cv-footer-right">{template.charAt(0).toUpperCase() + template.slice(1)}</div>
        </div>
      </div>
      <style jsx global>{`
        .cv-selectable {
          position: relative;
          cursor: pointer;
          transition: outline 0.15s ease;
        }
        .cv-selectable:hover {
          outline: 1px solid rgba(23, 184, 160, 0.3);
          outline-offset: 3px;
        }
        .cv-selectable::after {
          content: attr(data-tooltip);
          position: absolute;
          top: -1.75rem;
          left: 0;
          white-space: nowrap;
          background: rgba(15, 23, 42, 0.9);
          color: #fff;
          padding: 3px 8px;
          border-radius: 9999px;
          font-size: 9px;
          opacity: 0;
          transform: translateY(-4px);
          pointer-events: none;
          transition: opacity 150ms ease, transform 150ms ease;
          z-index: 20;
          font-weight: 500;
          letter-spacing: 0.02em;
        }
        .cv-selectable:hover::after {
          opacity: 1;
          transform: translateY(-2px);
        }
        .cv-selected {
          outline: 2px solid #17B8A0;
          outline-offset: 3px;
          border-radius: 2px;
        }
        #cv-content[data-export="true"] .cv-selected,
        #cv-content[data-export="true"] .cv-selectable::after {
          display: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .cv-footer {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          font-size: 0.6rem;
          color: #94a3b8;
          border-top: 1px solid #e6e9ee;
          background: #fafbfc;
        }
        .cv-footer-center {
          color: #64748b;
        }
        .cv-footer-right {
          text-transform: capitalize;
        }
      `}</style>
    </div>
  )
}