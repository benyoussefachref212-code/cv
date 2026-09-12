'use client'

import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { CVData } from '@/hooks/useAICVGenerator'

interface DownloadCVButtonProps {
  cvData: CVData & { template?: string }
  className?: string
}

export function DownloadCVButton({ cvData, className }: DownloadCVButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      // Find the CV content element
      const cvElement = document.getElementById('cv-content')
      if (!cvElement) {
        throw new Error('Contenu du CV introuvable. Veuillez réessayer.')
      }

      // Get the template name for the filename
      const name = cvData.personal?.name?.trim() || 'curriculum-vitae'
      const fileName = `CV_${name.replace(/\s+/g, '_')}.pdf`

      // Make sure custom fonts are actually loaded before we rasterize,
      // otherwise the first export can render with fallback fonts / shifted layout
      if (typeof document !== 'undefined' && 'fonts' in document) {
        try {
          await document.fonts.ready
        } catch {
          // ignore font-loading errors, proceed with capture anyway
        }
      }

      // Clone the element to avoid modifying the original
      const clone = cvElement.cloneNode(true) as HTMLElement

      // Remove selection indicators for export
      clone.setAttribute('data-export', 'true')

      // Remove all interactive classes and attributes
      clone.querySelectorAll('.cv-selectable, .cv-selected, .cv-footer').forEach((el) => {
        el.classList.remove('cv-selectable', 'cv-selected')
        el.removeAttribute('data-tooltip')
      })

      clone.querySelectorAll('[data-tooltip]').forEach((el) => {
        el.removeAttribute('data-tooltip')
      })

      // Safety net: strip any modern CSS color functions from *inline* styles.
      // html2canvas-pro (used below) already understands oklch/oklab/lab/lch,
      // so this is just a belt-and-braces cleanup for edge cases / inline styles
      // that slipped through, not the primary fix.
      const PROBLEMATIC_COLOR_FN = /(lab\(|lch\(|oklab\(|oklch\(|color-mix\()/i
      const allElements = clone.querySelectorAll('*')
      allElements.forEach((el) => {
        const htmlEl = el as HTMLElement
        const style = htmlEl.style

        const propNames: string[] = []
        for (let i = 0; i < style.length; i++) {
          propNames.push(style[i])
        }

        for (const prop of propNames) {
          const value = style.getPropertyValue(prop)
          if (value && PROBLEMATIC_COLOR_FN.test(value)) {
            style.setProperty(prop, '')
          }
        }

        const styleText = style.cssText || ''
        if (PROBLEMATIC_COLOR_FN.test(styleText)) {
          const safeStyles: Record<string, string> = {}
          const safeProps = [
            'color', 'background', 'background-color', 'background-image',
            'font-size', 'font-weight', 'font-family', 'font-style',
            'width', 'height', 'padding', 'margin', 'border', 'border-color',
            'display', 'flex', 'grid', 'gap', 'position', 'top', 'left', 'right', 'bottom',
            'transform', 'opacity', 'z-index', 'overflow', 'text-align', 'text-decoration',
            'letter-spacing', 'line-height', 'text-transform', 'border-radius',
            'box-shadow', 'outline', 'grid-template-columns', 'align-items', 'justify-content'
          ]

          for (const prop of safeProps) {
            const value = style.getPropertyValue(prop)
            if (value && !PROBLEMATIC_COLOR_FN.test(value)) {
              safeStyles[prop] = value
            }
          }

          style.cssText = ''
          for (const [prop, value] of Object.entries(safeStyles)) {
            if (value) {
              style.setProperty(prop, value)
            }
          }
        }
      })

      // Hide selection indicators during export
      const styleTag = document.createElement('style')
      styleTag.textContent = `
        .cv-selectable { cursor: default !important; outline: none !important; }
        .cv-selectable::after { display: none !important; }
        .cv-selected { outline: none !important; }
        .cv-footer { display: none !important; }
        #cv-content[data-export="true"] .cv-selectable::after { display: none !important; }
        #cv-content[data-export="true"] .cv-selected { outline: none !important; }
      `
      clone.appendChild(styleTag)

      // Create a temporary container for rendering (A4 width @ 96dpi)
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = '794px'
      container.style.background = '#ffffff'
      container.style.padding = '0'
      container.style.overflow = 'hidden'
      container.style.zIndex = '-1'
      container.appendChild(clone)
      document.body.appendChild(container)

      // Wait for images to load
      const images = clone.querySelectorAll('img')
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) {
                resolve()
              } else {
                img.onload = () => resolve()
                img.onerror = () => resolve()
              }
            })
        )
      )

      // html2canvas-pro is a drop-in replacement for html2canvas that natively
      // supports modern CSS color functions (oklch, oklab, lab, lch, color-mix),
      // which is what Tailwind's default palette compiles to. Using the regular
      // html2canvas package here would throw on those colors.
      const html2canvas = (await import('html2canvas-pro')).default
      const jsPDF = (await import('jspdf')).default

      // Render the CV to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: container.scrollHeight,
        windowWidth: 794,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById('cv-content')
          if (clonedEl) {
            clonedEl.style.transform = 'none'
          }
        },
      })

      document.body.removeChild(container)

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      const pageHeight = pdf.internal.pageSize.getHeight()

      let heightLeft = pdfHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight)
      heightLeft -= pageHeight
      position -= pageHeight

      // Add additional pages if needed
      while (heightLeft > 0) {
        pdf.addPage()
        const yOffset = position * -1
        pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, pdfHeight)
        heightLeft -= pageHeight
        position -= pageHeight
      }

      // Save the PDF
      pdf.save(fileName)
    } catch (err) {
      console.error('PDF generation failed:', err)
      setError(
        err instanceof Error
          ? `Erreur: ${err.message}`
          : 'Une erreur est survenue lors de la génération du PDF. Veuillez réessayer.'
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className={cn(
          'inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed',
          className
        )}
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Génération...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Télécharger PDF
          </>
        )}
      </button>
      {error && (
        <span className="text-xs text-red-500 max-w-[220px] text-right">{error}</span>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}