'use client'

import { useState } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { type ViewKey } from './nav'
import { OverviewView } from './views/overview-view'
import { CvBuilderView } from './views/cv-builder-view'
import { ReportGeneratorView } from './views/report-generator-view'
import { PresentationBuilderView } from './views/presentation-builder-view'
import { JobMatcherView } from './views/job-matcher-view'
import { SettingsView } from './views/settings-view'

type DashboardShellProps = {
  onLogout?: () => void
  user?: {
    id?: string
    name?: string
    email?: string
  }
}

export function DashboardShell({ onLogout, user }: DashboardShellProps) {
  const [active, setActive] = useState<ViewKey>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)

  function navigate(key: ViewKey) {
    setActive(key)
    setMobileOpen(false)
  }

  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar
        active={active}
        onNavigate={navigate}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar m3ah user w onLogout */}
        <Topbar
          active={active}
          onOpenMobile={() => setMobileOpen(true)}
          user={user}
          onLogout={onLogout}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            {/* Tous les composants reçoivent désormais le prop `user` */}
            {active === 'dashboard' && <OverviewView onNavigate={navigate} user={user} />}
            {active === 'cv-builder' && <CvBuilderView user={user} />}
            {active === 'report-generator' && <ReportGeneratorView user={user} />}
            {active === 'presentation-builder' && <PresentationBuilderView user={user} />}
            {active === 'job-matcher' && <JobMatcherView user={user} />}
            {active === 'settings' && <SettingsView user={user} />}
          </div>
        </main>
      </div>
    </div>
  )
}