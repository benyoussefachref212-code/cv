'use client'

import { Sparkles, X, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_ITEMS, type ViewKey } from './nav'

type SidebarProps = {
  active: ViewKey
  onNavigate: (key: ViewKey) => void
  mobileOpen: boolean
  onCloseMobile: () => void
  onLogout?: () => void // 👈 Zidna hal prop hne
}

export function Sidebar({ active, onNavigate, mobileOpen, onCloseMobile, onLogout }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-sidebar-accent-foreground">CareerCraft</p>
              <p className="text-xs text-sidebar-foreground/60">Suite carrière IA</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-1 text-sidebar-foreground/70 hover:bg-sidebar-accent lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2" aria-label="Primary">
          <p className="px-3 pb-2 pt-1 text-[0.7rem] font-medium uppercase tracking-wider text-sidebar-foreground/40">
            Menu
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = active === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>

       
      </aside>
    </>
  )
}