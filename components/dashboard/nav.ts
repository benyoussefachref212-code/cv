import {
  LayoutDashboard,
  FileUser,
  FileText,
  Presentation,
  Briefcase,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export type ViewKey =
  | 'dashboard'
  | 'cv-builder'
  | 'report-generator'
  | 'presentation-builder'
  | 'job-matcher'
  | 'settings'

export type NavItem = {
  key: ViewKey
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { key: 'cv-builder', label: 'Créateur de CV', icon: FileUser },
  { key: 'report-generator', label: 'Générateur de rapports', icon: FileText },
  { key: 'presentation-builder', label: 'Créateur de présentations', icon: Presentation },
  { key: 'job-matcher', label: 'Recherche d\'emploi', icon: Briefcase },
  { key: 'settings', label: 'Paramètres', icon: Settings },
]

export const VIEW_TITLES: Record<ViewKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Tableau de bord', subtitle: 'Votre centre de pilotage de carrière' },
  'cv-builder': { title: 'Créateur de CV', subtitle: 'Rédigez un CV qui se démarque en quelques minutes' },
  'report-generator': {
    title: 'Générateur de rapports',
    subtitle: 'Rapport de stage & PFE, propulsé par l\'IA',
  },
  'presentation-builder': {
    title: 'Créateur de présentations',
    subtitle: 'Des soutenances et des slides qui impressionnent',
  },
  'job-matcher': { title: 'Recherche d\'emploi par IA', subtitle: 'Trouvez des offres adaptées à votre profil' },
  settings: { title: 'Paramètres', subtitle: 'Gérez votre compte et vos préférences' },
}
