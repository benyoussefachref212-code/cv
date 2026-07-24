'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
// 🔹 Adapte ces imports à ton projet (auth + DB)
// import { auth } from '@/lib/auth'
// import { db } from '@/lib/db'
// import { put } from '@vercel/blob' // ou ton service de storage (Supabase Storage, S3, Cloudinary...)

// ------------------------------------------------------------------
// Mise à jour du profil (nom + email)
// ------------------------------------------------------------------
export async function updateProfile(data: { name: string; email: string }) {
  // const session = await auth()
  // if (!session?.user?.id) {
  //   throw new Error('Non authentifié')
  // }

  if (!data.name?.trim()) {
    throw new Error('Le nom ne peut pas être vide')
  }
  if (!data.email?.trim() || !data.email.includes('@')) {
    throw new Error('Adresse e-mail invalide')
  }

  // await db.user.update({
  //   where: { id: session.user.id },
  //   data: { name: data.name.trim(), email: data.email.trim() },
  // })

  revalidatePath('/dashboard')
  return { success: true as const }
}

// ------------------------------------------------------------------
// Upload / mise à jour de l'avatar
// ------------------------------------------------------------------
export async function updateAvatar(formData: FormData) {
  // const session = await auth()
  // if (!session?.user?.id) {
  //   throw new Error('Non authentifié')
  // }

  const file = formData.get('avatar') as File | null
  if (!file || file.size === 0) {
    throw new Error('Aucun fichier fourni')
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Format non supporté (JPG, PNG, GIF ou WEBP uniquement)')
  }
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("L'image ne doit pas dépasser 2 Mo")
  }

  // 🔹 Exemple avec Vercel Blob (remplace par ton propre service de storage) :
  // const blob = await put(`avatars/${session.user.id}-${Date.now()}`, file, {
  //   access: 'public',
  // })
  // const avatarUrl = blob.url
  //
  // await db.user.update({
  //   where: { id: session.user.id },
  //   data: { image: avatarUrl },
  // })

  const avatarUrl = '/placeholder-avatar.png' // ⚠️ à remplacer par l'URL réelle uploadée

  revalidatePath('/dashboard')
  return { url: avatarUrl }
}

// ------------------------------------------------------------------
// Suppression du compte
// ------------------------------------------------------------------
export async function deleteAccount() {
  // const session = await auth()
  // if (!session?.user?.id) {
  //   throw new Error('Non authentifié')
  // }

  // await db.user.delete({ where: { id: session.user.id } })
  // await signOut() // ou la fonction de déconnexion de ton système d'auth

  redirect('/')
}