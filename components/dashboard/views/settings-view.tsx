'use client'

import { useRef, useState, useTransition } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ShieldAlert, User as UserIcon, Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { updateProfile, updateAvatar, deleteAccount } from '@/app/actions/settings-actions'

// 🔹 Définition du type User pour TypeScript
type UserProps = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

type SettingsViewProps = {
  user?: UserProps
}

// 🔹 Vue principale des Paramètres
export function SettingsView({ user }: SettingsViewProps) {
  // ----- Profil -----
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, startSaveTransition] = useTransition()

  // ----- Avatar -----
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(user?.image || null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState('')
  const [isUploadingAvatar, startAvatarTransition] = useTransition()

  // ----- Suppression du compte -----
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [isDeleting, startDeleteTransition] = useTransition()

  const getInitials = (n?: string | null) => {
    if (!n) return 'U'
    return n
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  function handleSave() {
    setSaveStatus('idle')
    setSaveMessage('')
    startSaveTransition(async () => {
      try {
        await updateProfile({ name, email })
        setSaveStatus('success')
        setSaveMessage('Modifications enregistrées avec succès.')
      } catch (err) {
        setSaveStatus('error')
        setSaveMessage(err instanceof Error ? err.message : 'Une erreur est survenue.')
      } finally {
        setTimeout(() => setSaveStatus('idle'), 4000)
      }
    })
  }

  function handleAvatarClick() {
    fileInputRef.current?.click()
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarError('')

    // Aperçu instantané côté client
    const localPreview = URL.createObjectURL(file)
    setAvatarPreview(localPreview)

    const formData = new FormData()
    formData.append('avatar', file)

    startAvatarTransition(async () => {
      try {
        const result = await updateAvatar(formData)
        setAvatarUrl(result.url)
        setAvatarPreview(null)
      } catch (err) {
        setAvatarError(err instanceof Error ? err.message : "Échec de l'envoi de l'image")
        setAvatarPreview(null)
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    })
  }

  function handleDeleteAccount() {
    if (confirmText !== 'SUPPRIMER') return
    setDeleteError('')
    startDeleteTransition(async () => {
      try {
        await deleteAccount()
        // deleteAccount() fait un redirect() côté serveur, donc rien à faire ici
      } catch (err) {
        setDeleteError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      }
    })
  }

  const displayedAvatar = avatarPreview || avatarUrl

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Colonne principale : Profil */}
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="size-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">Profil Personnel</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Gérez vos informations publiques et privées.</p>

            <div className="flex items-center gap-6 mb-8">
              <div className="relative flex size-20 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-inner overflow-hidden">
                {displayedAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={displayedAvatar} alt={name || 'Avatar'} className="size-full object-cover" />
                ) : (
                  getInitials(name)
                )}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="size-6 animate-spin text-white" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/gif, image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isUploadingAvatar ? 'Envoi en cours...' : "Changer l'avatar"}
                </button>
                <p className="text-xs text-muted-foreground">JPG, GIF ou PNG. Max 2Mo.</p>
                {avatarError && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="size-3.5" /> {avatarError}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="set-name">Nom complet</Label>
                <Input
                  id="set-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="set-email">Adresse e-mail</Label>
                <Input
                  id="set-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            {saveStatus !== 'idle' && (
              <div
                className={cn(
                  'mt-4 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm',
                  saveStatus === 'success' && 'bg-emerald-500/10 text-emerald-600',
                  saveStatus === 'error' && 'bg-destructive/10 text-destructive',
                )}
              >
                {saveStatus === 'success' ? (
                  <CheckCircle2 className="size-4" />
                ) : (
                  <AlertCircle className="size-4" />
                )}
                {saveMessage}
              </div>
            )}

            <div className="mt-8 pt-6 border-t">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barre latérale : Zone de danger */}
      <div className="space-y-6">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="size-5 text-destructive" />
              <h3 className="text-base font-semibold text-destructive">Zone de danger</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Supprimer définitivement votre compte et toutes vos données associées (CV, rapports).
            </p>

            {!confirmOpen ? (
              <button
                onClick={() => setConfirmOpen(true)}
                className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors"
              >
                <Trash2 className="size-4" /> Supprimer mon compte
              </button>
            ) : (
              <div className="mt-6 space-y-3 rounded-lg border border-destructive/40 bg-card p-4">
                <p className="text-xs text-muted-foreground">
                  Cette action est irréversible. Tape{' '}
                  <span className="font-semibold text-destructive">SUPPRIMER</span> pour confirmer.
                </p>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SUPPRIMER"
                />
                {deleteError && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="size-3.5" /> {deleteError}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={confirmText !== 'SUPPRIMER' || isDeleting}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting && <Loader2 className="size-4 animate-spin" />}
                    {isDeleting ? 'Suppression...' : 'Confirmer'}
                  </button>
                  <button
                    onClick={() => {
                      setConfirmOpen(false)
                      setConfirmText('')
                      setDeleteError('')
                    }}
                    disabled={isDeleting}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}