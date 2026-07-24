'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { CVData } from '@/hooks/useAICVGenerator'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface DownloadCVButtonProps {
  cvData: CVData
}

export function DownloadCVButton({ cvData }: DownloadCVButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadCVAsPDF = async () => {
    setIsDownloading(true)

    try {
      const element = document.getElementById('cv-content')
      if (!element) return

      // Apply template-specific adjustments before capture by injecting a temporary stylesheet
      const template = (cvData as any).template || (cvData as any).selectedTemplate || 'modern'
      const styleId = 'tmp-cv-template-style'
      // remove any existing temporary style
      const prev = document.getElementById(styleId)
      if (prev) prev.remove()

      // Inject local webfont @font-face and template CSS (expects fonts in /public/fonts)
      const css = `
        @font-face {
          font-family: 'MerriweatherLocal';
          src: url('/fonts/Merriweather-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        @font-face {
          font-family: 'MerriweatherLocal';
          src: url('/fonts/Merriweather-Bold.woff2') format('woff2');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }

        #cv-content[data-template="classic"] { font-family: 'MerriweatherLocal', Georgia, serif !important; }
        #cv-content[data-template="classic"] .h-1 { background: #0E1729 !important; }
        #cv-content[data-template="classic"] .md\\:col-span-1 { background: #ffffff !important; color: #0E1729 !important; border-right: 1px solid #E6E9EE !important; }
        #cv-content[data-template="classic"] .rounded-full { box-shadow: 0 6px 18px rgba(14,23,41,0.08) !important; }

        #cv-content[data-template="creative"] { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial !important; }
        #cv-content[data-template="creative"] .h-1 { background: linear-gradient(90deg,#ec4899,#f59e0b) !important; }
        #cv-content[data-template="creative"] .md\\:col-span-1 { background: linear-gradient(180deg,#fff1f2,#fffbeb) !important; color: #7F1D1D !important; }
        #cv-content[data-template="creative"] .rounded-full { box-shadow: 0 10px 30px rgba(236,72,153,0.12) !important; }

        /* Modern default accent */
        #cv-content[data-template="modern"] .h-1 { background: linear-gradient(90deg,#0E1729,#17B8A0,#0E1729) !important; }
        #cv-content[data-template="modern"] .md\\:col-span-1 { background: linear-gradient(180deg,#0E1729,#0E1729/95) !important; }
      `

      const styleEl = document.createElement('style')
      styleEl.id = styleId
      styleEl.appendChild(document.createTextNode(css))
      document.head.appendChild(styleEl)

      // mark the element with the template so CSS rules apply
      element.setAttribute('data-template', template)

      // Capture le CV en image haute qualité
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      // page layout and margins
      const pageWidth = 210
      const pageHeight = 297
      const marginLeft = 15
      const marginRight = 15
      const marginTop = 20
      const marginBottom = 20
      const headerHeight = 12
      const usableWidth = pageWidth - marginLeft - marginRight
      const usableHeight = pageHeight - marginTop - marginBottom - headerHeight

      // slice the canvas into page-sized chunks to preserve quality and layout
      const ratio = usableWidth / canvas.width
      const srcChunkHeight = Math.floor(usableHeight / ratio) // in source pixels
      const pageCount = Math.ceil(canvas.height / srcChunkHeight)

      const safeName = cvData.personal.name ? cvData.personal.name.replace(/\s+/g, '_') : 'CV'
      const filename = `CV_${safeName}_${template}.pdf`

      for (let i = 0; i < pageCount; i++) {
        const sY = i * srcChunkHeight
        const chunkHeight = i === pageCount - 1 ? canvas.height - sY : srcChunkHeight

        const pageCanvas = document.createElement('canvas')
        pageCanvas.width = canvas.width
        pageCanvas.height = chunkHeight
        const ctx = pageCanvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(canvas, 0, sY, canvas.width, chunkHeight, 0, 0, canvas.width, chunkHeight)
        }

        const pageImgData = pageCanvas.toDataURL('image/png')
        const pageImgHeight = (chunkHeight * ratio)

        if (i > 0) pdf.addPage()

        // draw header
        pdf.setFillColor(255, 255, 255)
        pdf.rect(0, 0, pageWidth, marginTop + headerHeight, 'F')
        pdf.setFontSize(10)
        pdf.setTextColor(14, 23, 41)
        pdf.text(`${cvData.personal.name || ''}`, marginLeft, marginTop - 6 + headerHeight / 2)
        pdf.text(template.charAt(0).toUpperCase() + template.slice(1), pageWidth - marginRight, marginTop - 6 + headerHeight / 2, { align: 'right' })

        pdf.addImage(pageImgData, 'PNG', marginLeft, marginTop + headerHeight, usableWidth, pageImgHeight)

        // footer: page number and small footer text
        const footerY = pageHeight - marginBottom / 2
        pdf.setFontSize(9)
        pdf.setTextColor(100)
        pdf.text(`Page ${i + 1} / ${pageCount}`, pageWidth / 2, footerY, { align: 'center' })
        pdf.text('Career Craft', marginLeft, footerY)
      }

      // Télécharge le PDF
      pdf.save(filename)
      // cleanup injected styles/attributes and font link
      element.removeAttribute('data-template')
      const tmp = document.getElementById(styleId)
      if (tmp) tmp.remove()
      // no font link to remove when using embedded @font-face
    } catch (error) {
      console.error('Erreur lors du téléchargement du PDF:', error)
      alert('Une erreur est survenue lors du téléchargement. Veuillez réessayer.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={downloadCVAsPDF}
      disabled={isDownloading}
      className="inline-flex items-center gap-2 rounded-lg bg-[#17B8A0] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#17B8A0]/90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isDownloading ? (
        <>
          <Loader2 className="size-4 animate-spin" /> Téléchargement...
        </>
      ) : (
        <>
          <Download className="size-4" /> Télécharger en PDF
        </>
      )}
    </button>
  )
}
