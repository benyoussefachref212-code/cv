'use client'

import { Menu, Search, Bell, LogOut } from 'lucide-react'
import { VIEW_TITLES, type ViewKey } from './nav'

type UserInfo = {
  name?: string
  email?: string
}

type TopbarProps = {
  active: ViewKey
  onOpenMobile: () => void
  user?: UserInfo
  onLogout?: () => void // 👈 Zidna onLogout hne
}

export function Topbar({ active, onOpenMobile, user, onLogout }: TopbarProps) {
  const { title, subtitle } = VIEW_TITLES[active]

  const userName = user?.name || 'Utilisateur'
  const userEmail = user?.email || 'user@example.com'

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-border bg-background/80 px-4 py-3.5 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onOpenMobile}
        className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="relative hidden md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Rechercher..."
          className="h-10 w-56 rounded-lg border border-input bg-card pl-9 pr-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 focus-visible:outline-none"
        />
      </div>

      <button
        type="button"
        className="relative rounded-lg border border-border bg-card p-2.5 text-muted-foreground shadow-sm hover:text-foreground"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
      </button>

      {/* Dynamic User Profile + Bouton Déconnexion */}
      <div className="flex items-center gap-3 border-l border-border pl-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
            {getInitials(userName)}
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-medium text-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        {/* 👇 Bouton Se déconnecter hne fel Topbar */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive transition-colors"
          title="Se déconnecter"
        >
          <LogOut className="size-3.5" />
          <span className="hidden md:inline">Se déconnecter</span>
        </button>
      </div>
    </header>
  )
}