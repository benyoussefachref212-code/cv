'use client'

import { useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadedFileData {
  name: string
  file: File
}

interface UploadZoneProps {
  label?: string
  files?: string[]
  onFilesChange?: (files: string[]) => void
  fileData?: UploadedFileData[]
  onFileDataChange?: (files: UploadedFileData[]) => void
}

export function UploadZone({
  label = 'Glissez-déposez vos images ici',
  files: externalFiles,
  onFilesChange,
  fileData: externalFileData,
  onFileDataChange,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [internalFiles, setInternalFiles] = useState<string[]>([])
  const [internalFileData, setInternalFileData] = useState<UploadedFileData[]>([])

  // Utiliser les fichiers externes s'ils sont fournis, sinon l'état interne (vide par défaut)
  const files = externalFiles !== undefined ? externalFiles : internalFiles
  const fileData = externalFileData !== undefined ? externalFileData : internalFileData

  function updateFiles(newFiles: string[], newFileData: UploadedFileData[]) {
    if (onFilesChange) {
      onFilesChange(newFiles)
    } else {
      setInternalFiles(newFiles)
    }

    if (onFileDataChange) {
      onFileDataChange(newFileData)
    } else if (externalFileData === undefined) {
      setInternalFileData(newFileData)
    }
  }

  function addFiles(list: FileList | null) {
    if (!list) return
    const incoming = Array.from(list)
    const newFileData = incoming.map((file) => ({ name: file.name, file }))
    updateFiles(
      [...files, ...newFileData.map((item) => item.name)],
      [...fileData, ...newFileData],
    )
  }

  function removeFile(index: number) {
    updateFiles(
      files.filter((_, idx) => idx !== index),
      fileData.filter((_, idx) => idx !== index),
    )
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          dragging
            ? 'border-primary bg-primary/10'
            : 'border-border bg-muted/40 hover:border-primary/40 hover:bg-primary/5',
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ImagePlus className="size-5" />
        </span>
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">
          ou <span className="text-primary underline">parcourir les fichiers</span> · PNG, JPG, SVG
        </span>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {files.map((f, i) => (
            <li
              key={`${f}-${i}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-2"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <ImagePlus className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-foreground">{f}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-muted-foreground hover:text-destructive"
                aria-label={`Supprimer ${f}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}