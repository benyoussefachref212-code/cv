'use client'

import { useEffect, useState } from 'react'
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Trash2,
  Search,
  UserCog,
} from 'lucide-react'

type AdminUser = {
  name?: string
  email?: string
}

type RegisteredUser = {
  email: string
  name: string
}

type AdminDashboardShellProps = {
  onLogout?: () => void
  user?: AdminUser
}

type AdminView = 'overview' | 'users' | 'settings'

const NAV_ITEMS: { key: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: 'Vue d\u2019ensemble', icon: LayoutDashboard },
  { key: 'users', label: 'Utilisateurs', icon: Users },
  { key: 'settings', label: 'Param\u00e8tres', icon: Settings },
]

export function AdminDashboardShell({ onLogout, user }: AdminDashboardShellProps) {
  const [active, setActive] = useState<AdminView>('overview')
  const [users, setUsers] = useState<RegisteredUser[]>([])
  const [search, setSearch] = useState('')

  // Charge les utilisateurs enregistrés (m\u00eame source que l'app principale pour l'instant)
  useEffect(() => {
    const saved = localStorage.getItem('cc_registered_users')
    if (saved) {
      try {
        setUsers(JSON.parse(saved))
      } catch {
        setUsers([])
      }
    }
  }, [])

  function handleDeleteUser(email: string) {
    const updated = users.filter((u) => u.email !== email)
    setUsers(updated)
    localStorage.setItem('cc_registered_users', JSON.stringify(updated))
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const stats = [
    { label: 'Utilisateurs inscrits', value: users.length, accent: '#17B8A0' },
    { label: 'CV g\u00e9n\u00e9r\u00e9s', value: '\u2014', accent: '#F2A93B' },
    { label: 'Rapports analys\u00e9s', value: '\u2014', accent: '#6C7CE0' },
    { label: 'Offres matched', value: '\u2014', accent: '#E0648C' },
  ]

  return (
    <div className="flex min-h-svh bg-[#F5F6F8]">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-black/5 bg-[#0E1729] text-white lg:flex">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#17B8A0] text-[#0E1729]">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">CareerCraft</p>
            <p className="text-[11px] text-white/50">Panneau Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = active === item.key
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#17B8A0]/15 text-[#17B8A0]'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="size-4" />
            D\u00e9connexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-semibold text-[#1E2530]">
              {NAV_ITEMS.find((n) => n.key === active)?.label}
            </h1>
            <p className="text-xs text-[#8B93A1]">Acc\u00e8s administrateur</p>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-full bg-[#0E1729] text-xs font-semibold text-white">
              <UserCog className="size-4" />
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-[#1E2530]">{user?.name || 'Admin'}</p>
              <p className="text-xs text-[#8B93A1]">{user?.email}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl space-y-6">
            {active === 'overview' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-xl border border-black/5 bg-white p-5 shadow-sm">
                    <p className="text-xs font-medium text-[#8B93A1]">{s.label}</p>
                    <p className="mt-2 text-2xl font-semibold" style={{ color: s.accent }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {active === 'users' && (
              <div className="rounded-xl border border-black/5 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-4 border-b border-black/5 p-5">
                  <h2 className="text-sm font-semibold text-[#1E2530]">
                    Utilisateurs ({filteredUsers.length})
                  </h2>
                  <div className="relative w-full max-w-xs">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8B93A1]" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Rechercher..."
                      className="w-full rounded-lg border border-black/10 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#17B8A0]"
                    />
                  </div>
                </div>
                <div className="divide-y divide-black/5">
                  {filteredUsers.length === 0 && (
                    <p className="p-5 text-sm text-[#8B93A1]">Aucun utilisateur trouv\u00e9.</p>
                  )}
                  {filteredUsers.map((u) => (
                    <div key={u.email} className="flex items-center justify-between gap-4 p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-[#0E1729]/5 text-xs font-semibold text-[#0E1729]">
                          {u.name
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .toUpperCase()
                            .substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#1E2530]">{u.name}</p>
                          <p className="text-xs text-[#8B93A1]">{u.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteUser(u.email)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" /> Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {active === 'settings' && (
              <div className="rounded-xl border border-black/5 bg-white p-6 shadow-sm">
                <h2 className="mb-2 text-sm font-semibold text-[#1E2530]">Param\u00e8tres syst\u00e8me</h2>
                <p className="text-sm text-[#8B93A1]">
                  Espace r\u00e9serv\u00e9 pour la configuration de la plateforme (\u00e0 brancher sur ton backend :
                  gestion des r\u00f4les, quotas, logs, etc.).
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}