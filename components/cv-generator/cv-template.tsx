 'use client'

import { Mail, Phone, MapPin, Download, RotateCcw } from 'lucide-react'
import { CVData } from '@/hooks/useAICVGenerator'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { DownloadCVButton } from './download-cv-button'
import { useEffect, useRef, useState } from 'react'

interface CVTemplateProps {
  cvData: CVData
  selectedTemplate?: string
  onReset?: () => void
}
export function CVTemplate({ cvData, selectedTemplate, onReset }: CVTemplateProps) {
  const template = selectedTemplate || cvData.template || 'modern'

  const cvRef = useRef<HTMLDivElement | null>(null)
  const [pageCount, setPageCount] = useState(1)

  useEffect(() => {
    const el = cvRef.current
    if (!el) return
    const compute = () => {
      // approximate A4 height in CSS pixels (96dpi * 11.69in)
      const a4Px = 1122
      const pages = Math.max(1, Math.ceil(el.scrollHeight / a4Px))
      setPageCount(pages)
    }
    compute()
    const ro = new ResizeObserver(compute)
    ro.observe(el)
    window.addEventListener('resize', compute)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [cvData, template])

  const headerBarClass =
    template === 'modern'
      ? 'h-1 w-full bg-gradient-to-r from-[#0E1729] via-[#17B8A0] to-[#0E1729]'
      : template === 'classic'
      ? 'h-1 w-full bg-[#0E1729]'
      : 'h-1 w-full bg-gradient-to-r from-pink-500 to-yellow-400'

  const sidebarClass =
    template === 'modern'
      ? 'space-y-6 bg-gradient-to-b from-[#0E1729] to-[#0E1729]/95 p-6 text-white md:col-span-1'
      : template === 'classic'
      ? 'space-y-6 bg-white p-8 text-[#0E1729] md:col-span-1 border-r border-[#E6E9EE] font-serif'
      : 'space-y-6 bg-gradient-to-b from-pink-50 to-yellow-50 p-6 text-[#0E1729] md:col-span-1'

  const nameClass = template === 'classic' ? 'text-3xl font-serif font-bold tracking-tight' : 'text-3xl font-bold tracking-tight'
  const titleClass = template === 'classic' ? 'text-lg italic text-[#0E1729] mt-1' : 'text-lg font-semibold text-[#17B8A0] mt-1'

  const containerCardClass = template === 'creative' ? 'overflow-hidden border-[#1E2530]/10 shadow-2xl' : 'overflow-hidden border-[#1E2530]/10 shadow-lg'

  const mainPadding = template === 'classic' ? 'p-8' : 'p-6'

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <div className="flex gap-2">
        <DownloadCVButton cvData={cvData} />
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1E2530]/15 bg-white px-4 py-2 text-sm font-medium text-[#8B93A1] transition-colors hover:bg-[#1E2530]/5"
          >
            <RotateCcw className="size-4" /> Réinitialiser
          </button>
        )}
      </div>

      {/* CV Container */}
      <div id="cv-content" data-template={template} ref={cvRef} className="bg-white">
        <Card className={containerCardClass}>
          {/* Header Bar */}
          <div className={headerBarClass} />

          <CardContent className={`grid grid-cols-1 gap-0 p-0 md:grid-cols-3 ${mainPadding}`}>
            {/* LEFT SIDEBAR - Contact & Skills */}
            <div className={sidebarClass}>
              {/* Profile Picture */}
              {cvData.personal.photo && (
                <div className="flex justify-center">
                  <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white/20 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cvData.personal.photo}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Personal Info */}
              <div className={`space-y-3 border-t ${template === 'modern' ? 'border-white/15' : 'border-[#E6E9EE]'} pt-4`}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#17B8A0]">Contact</p>
                  <div className="mt-3 space-y-2 text-xs">
                    {cvData.personal.email && (
                      <div className="flex items-start gap-2 break-words">
                        <Mail className="mt-0.5 size-3 shrink-0" />
                        <span>{cvData.personal.email}</span>
                      </div>
                    )}
                    {cvData.personal.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="mt-0.5 size-3 shrink-0" />
                        <span>{cvData.personal.phone}</span>
                      </div>
                    )}
                    {cvData.personal.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-3 shrink-0" />
                        <span>{cvData.personal.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Languages */}
              {cvData.languages && cvData.languages.length > 0 && (
                <div className="border-t border-white/15 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#17B8A0]">Langues</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cvData.languages.map((lang) => (
                      <span
                        key={lang}
                        className={
                          template === 'modern'
                            ? 'rounded-full bg-white/15 px-2.5 py-1 text-[11px]'
                            : template === 'classic'
                            ? 'rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] text-[#0E1729]'
                            : 'rounded-full bg-[#FFF1F2] px-2.5 py-1 text-[11px] text-[#7F1D1D]'
                        }
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {cvData.skills && cvData.skills.length > 0 && (
                <div className="border-t border-white/15 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#17B8A0]">Compétences</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {cvData.skills.map((skill) => (
                      <span
                        key={skill}
                        className={
                          template === 'modern'
                            ? 'rounded-full bg-[#17B8A0]/20 px-2.5 py-1 text-[11px] font-medium text-white'
                            : template === 'classic'
                            ? 'rounded-full bg-[#F2F4F7] px-2.5 py-1 text-[11px] text-[#0E1729]'
                            : 'rounded-full bg-[#FFE4E6] px-2.5 py-1 text-[11px] font-medium text-[#7F1D1D]'
                        }
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {cvData.interests && cvData.interests.length > 0 && (
                <div className={`border-t pt-4 ${template === 'modern' ? 'border-white/15' : 'border-[#E6E9EE]'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-widest ${template === 'modern' ? 'text-[#17B8A0]' : 'text-[#0E1729]'}`}>Intérêts</p>
                  <p className={`${template === 'modern' ? 'mt-2 text-xs leading-relaxed text-white/80' : 'mt-2 text-xs leading-relaxed text-[#1E2530]'}`}>
                    {cvData.interests.join(' • ')}
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT CONTENT - Main Info */}
            <div className="space-y-5 md:col-span-2">
              <div className={mainPadding}>
              {/* Name & Title */}
              <div>
                <h1 className={nameClass + ' text-[#0E1729]'}>{cvData.personal.name}</h1>
                <p className={titleClass}>{cvData.personal.title}</p>
              </div>
              </div>

              {/* Summary */}
              {cvData.personal.summary && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0E1729]">
                    Profil
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#1E2530]">
                    {cvData.personal.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {cvData.experiences && cvData.experiences.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0E1729]">
                    Expérience Professionnelle
                  </h2>
                  <div className="mt-3 space-y-4">
                    {cvData.experiences.map((exp) => (
                      <div key={exp.id} className="border-l-2 border-[#17B8A0] pl-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-[#0E1729]">
                              {exp.position}
                            </p>
                            <p className="text-xs text-[#8B93A1]">
                              {exp.company}
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-xs font-medium text-[#8B93A1]">
                            {exp.startDate} – {exp.endDate}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#1E2530]">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {cvData.education && cvData.education.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#0E1729]">
                    Formation
                  </h2>
                  <div className="mt-3 space-y-3">
                    {cvData.education.map((edu) => (
                      <div key={edu.id} className="border-l-2 border-[#F2A93B] pl-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-[#0E1729]">
                              {edu.degree}
                            </p>
                            <p className="text-xs text-[#8B93A1]">
                              {edu.school}
                            </p>
                          </div>
                          <span className="whitespace-nowrap text-xs font-medium text-[#F2A93B]">
                            {edu.year}
                          </span>
                        </div>
                        {edu.mention && (
                          <p className="mt-1 text-xs text-[#17B8A0]">
                            Mention: <strong>{edu.mention}</strong>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Preview footer matching exported footer style (visual aid) */}
        <div className="cv-footer" data-template={template}>
          <div className="cv-footer-left">Career Craft</div>
          <div className="cv-footer-center">Page 1 / {pageCount}</div>
          <div className="cv-footer-right">{template.charAt(0).toUpperCase() + template.slice(1)}</div>
        </div>
      </div>
    </div>
  )
}
