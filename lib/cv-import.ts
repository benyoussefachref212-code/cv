'use client'

/**
 * PDF → CV data import.
 *
 * Best-effort heuristic parser: PDFs have no semantic structure, so this
 * extracts text line-by-line (grouped by vertical position via pdf.js),
 * then applies pattern-matching to guess section boundaries (Experience,
 * Education, Skills, Languages, Interests, Summary) and pull out contact
 * info.
 *
 * This is intentionally forgiving — on ambiguous input it prefers to return
 * *something* reasonable (e.g. dumping unparsed text into `description`)
 * rather than throwing, since the caller pre-fills a form the user reviews
 * and edits afterward. Only truly fatal errors (unreadable file, no text
 * layer at all) should reject the returned promise.
 *
 * The one place this is now strict is `mapParsedCvToCvData`: it is the
 * single, explicit boundary where parsed values get written into named
 * `cvData` fields, and it will drop a value (leave the field empty) rather
 * than guess when it isn't confident where something belongs.
 */

import { getDocument, GlobalWorkerOptions, version as pdfjsVersion } from 'pdfjs-dist'

// pdf.js needs a worker script. Loading it from a CDN pinned to the exact
// installed version avoids bundler-specific worker configuration. If you'd
// rather bundle the worker locally, replace this with:
//   GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
// (requires transpilePackages: ['pdfjs-dist'] in next.config.js)
if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.mjs`
}

export interface ParsedExperience {
  position: string
  company: string
  start: string
  end: string
  description: string
}

export interface ParsedEducation {
  degree: string
  school: string
  year: string

  grade: string
}

export interface ParsedCV {
  name: string
  title: string
  email: string
  phone: string
  location: string
  summary: string
  experiences: ParsedExperience[]
  education: ParsedEducation[]
  skills: string[]
  languages: string[]
  interests: string[]
}

/* ============================================================
   0. Cleanup helpers — applied at the boundary where text is
      about to be written into a field, so every field (summary,
      tag lists, descriptions, names) goes through the same
      normalization: strip bullet markers, collapse runs of
      whitespace/newlines, trim.
   ============================================================ */

const BULLET_PREFIX_RE = /^[\s\u2022\u25CF\u25AA\u2023\u2043\-*•·]+/

function cleanText(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(BULLET_PREFIX_RE, '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanList(values: string[]): string[] {
  return values.map(cleanText).filter(Boolean)
}

/* ============================================================
   1. Text extraction — turns the PDF into an ordered list of
      lines, reconstructed from pdf.js's flat text-item stream
      by grouping items that share roughly the same y position.
   ============================================================ */

async function extractPdfLines(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: new Uint8Array(arrayBuffer) }).promise

  const lines: string[] = []
  const Y_TOLERANCE = 2 // px — text items within this range are treated as one line

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    const rows = new Map<number, { x: number; str: string }[]>()

    for (const item of textContent.items as any[]) {
      const str: string | undefined = item?.str
      if (!str || !str.trim()) continue
      const x: number = item.transform[4]
      const y: number = item.transform[5]

      let bucketY = y
      for (const existingY of rows.keys()) {
        if (Math.abs(existingY - y) <= Y_TOLERANCE) {
          bucketY = existingY
          break
        }
      }
      const row = rows.get(bucketY) ?? []
      row.push({ x, str })
      rows.set(bucketY, row)
    }

    // pdf.js y-coordinates grow upward, so sort descending for top-to-bottom
    // reading order; within a row, sort left-to-right.
    const orderedRows = [...rows.entries()].sort((a, b) => b[0] - a[0])
    for (const [, row] of orderedRows) {
      const line = row
        .sort((a, b) => a.x - b.x)
        .map((r) => r.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (line) lines.push(line)
    }
  }

  return lines
}

/* ============================================================
   2. Section splitting — walks the lines once, classifying each
      as a heading (French/English aliases) or content under the
      most recently seen heading.
   ============================================================ */

type SectionKey = 'top' | 'summary' | 'experience' | 'education' | 'skills' | 'languages' | 'interests'

const SECTION_ALIASES: Record<Exclude<SectionKey, 'top'>, RegExp> = {
  summary: /^(profil|r[ée]sum[ée]( professionnel)?|objectif|[àa] propos|about( me)?|summary|profile)\s*:?$/i,
  experience: /^(exp[ée]riences?( professionnelles?)?|work experience|professional experience|employment)\s*:?$/i,
  education: /^(formations?|[ée]ducation|academic background|educational background)\s*:?$/i,
  skills: /^(comp[ée]tences?( techniques| cl[ée]s)?|skills|technical skills)\s*:?$/i,
  languages: /^(langues?|languages?)\s*:?$/i,
  // Covers "Interests", "Centres d'intérêt" (with or without the accent, and
  // with either straight or curly apostrophe), "Hobbies", "Loisirs".
  interests: /^(int[ée]r[eê]ts?|centres?\s*d['’]int[ée]r[eê]ts?|hobbies|loisirs)\s*:?$/i,
}

function splitIntoSections(lines: string[]): Record<SectionKey, string[]> {
  const sections: Record<SectionKey, string[]> = {
    top: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    languages: [],
    interests: [],
  }

  let current: SectionKey = 'top'

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    // Headings are short lines matching a known alias — long sentences that
    // happen to contain e.g. "compétences" mid-paragraph shouldn't flip
    // the current section.
    const matched =
      line.length <= 45
        ? (Object.keys(SECTION_ALIASES) as (keyof typeof SECTION_ALIASES)[]).find((key) =>
            SECTION_ALIASES[key].test(line),
          )
        : undefined

    if (matched) {
      current = matched
      continue
    }

    sections[current].push(line)
  }

  return sections
}

/* ============================================================
   3. Contact info + name/title
   ============================================================ */

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
const PHONE_REGEX = /(\+?\d[\d\s().-]{7,}\d)/
const KNOWN_LOCATION_HINTS = [
  'tunis', 'tunisie', 'sfax', 'sousse', 'ariana', 'nabeul', 'le kef', 'kef',
  'bizerte', 'gabès', 'gabes', 'gafsa', 'monastir', 'ben arous', 'manouba',
  'kairouan', 'medenine', 'tozeur', 'zaghouan',
  'paris', 'france', 'casablanca', 'maroc', 'morocco', 'alger', 'algérie', 'algeria',
]

function findFirst(lines: string[], regex: RegExp): string {
  for (const line of lines) {
    const match = line.match(regex)
    if (match) return match[0].trim()
  }
  return ''
}

function findLocation(lines: string[]): string {
  for (const line of lines) {
    const lower = line.toLowerCase()
    if (KNOWN_LOCATION_HINTS.some((hint) => lower.includes(hint))) return line.trim()
  }
  return ''
}

// Sanity checks used as the "leave it empty rather than wrong" gate. These
// don't try to be exhaustive validators — they only need to catch the
// common failure mode of a stray line drifting into a field it doesn't
// belong in (e.g. a sentence-length line ending up as someone's "name").
function isPlausibleEmail(value: string): boolean {
  return !!value && EMAIL_REGEX.test(value)
}

function isPlausiblePhone(value: string): boolean {
  if (!value) return false
  const digits = value.replace(/\D/g, '')
  return digits.length >= 8 && digits.length <= 15
}

function isPlausibleText(value: string): boolean {
  const normalized = cleanText(value)
  if (!normalized) return false
  if (normalized.length > 120) return false
  if (EMAIL_REGEX.test(normalized)) return false
  if (PHONE_REGEX.test(normalized)) return false
  if (/^\d[\d\s().-]{4,}$/.test(normalized)) return false
  if (/\b(19|20)\d{2}\b/.test(normalized) && !/[A-Za-zÀ-ÿ]/.test(normalized)) return false
  return true
}

function isPlausibleName(value: string): boolean {
  const normalized = cleanText(value)
  if (!normalized) return false
  if (normalized.length > 60) return false
  if (/\d/.test(normalized)) return false
  if (EMAIL_REGEX.test(normalized)) return false
  if (PHONE_REGEX.test(normalized)) return false
  if (/[.!?]$/.test(normalized)) return false // looks like a sentence, not a name
  return true
}

function isPlausibleTitle(value: string): boolean {
  const normalized = cleanText(value)
  if (!normalized) return false
  if (normalized.length > 80) return false
  if (EMAIL_REGEX.test(normalized)) return false
  if (PHONE_REGEX.test(normalized)) return false
  return true
}

function isPlausiblePosition(value: string): boolean {
  const normalized = cleanText(value)
  if (!normalized) return false
  if (!/[A-Za-zÀ-ÿ]/.test(normalized)) return false
  return isPlausibleText(normalized)
}

function isPlausibleCompany(value: string): boolean {
  const normalized = cleanText(value)
  if (!normalized) return false
  if (!/[A-Za-zÀ-ÿ]/.test(normalized)) return false
  return isPlausibleText(normalized)
}

function guessNameAndTitle(
  topLines: string[],
  email: string,
  phone: string,
): { name: string; title: string } {
  // Contact-info lines (and anything with a long digit run, likely a phone
  // or postal code) are excluded so they can't be mistaken for the name.
  const candidates = topLines.filter((line) => {
    if (email && line.includes(email)) return false
    if (phone && line.includes(phone)) return false
    if (EMAIL_REGEX.test(line)) return false
    if (/\d{4,}/.test(line)) return false
    return true
  })

  const nameCandidate = cleanText(candidates[0] || '')
  const titleCandidate = cleanText(candidates[1] || '')

  return {
    name: isPlausibleName(nameCandidate) ? nameCandidate : '',
    title: isPlausibleTitle(titleCandidate) ? titleCandidate : '',
  }
}

/* ============================================================
   4. Summary / skills / languages / interests
   ============================================================ */

function buildSummary(lines: string[]): string {
  return cleanText(lines.join('\n'))
}

function parseTagList(lines: string[]): string[] {
  const raw = lines
    .join(', ')
    .split(/[,•|/]|\n/)
    .map((s) => s.replace(BULLET_PREFIX_RE, '').trim())
    .filter(Boolean)
    .filter((s, idx, arr) => arr.indexOf(s) === idx) // de-dupe, keep first occurrence
    .slice(0, 20)
  return cleanList(raw)
}

/* ============================================================
   5. Experience — entries are anchored on lines that look like a
      date range (a year plus a range marker), since that's the
      one element almost every CV format includes per entry.
   ============================================================ */

function isDateRangeLine(line: string): boolean {
  const hasYear = /\b(19|20)\d{2}\b/.test(line)
  const hasRangeMarker = /[-–—]|pr[ée]sent|present|aujourd'?hui|current|now|[àa]\s/i.test(line)
  return hasYear && hasRangeMarker
}

function splitDateRange(line: string): { start: string; end: string; rest: string } {
  const rangeMatch = line.match(
    /((?:\d{1,2}[/.])?(?:19|20)\d{2}|[A-Za-zÀ-ÿ]+\.?\s+(?:19|20)\d{2})\s*[-–—àto]{1,3}\s*((?:\d{1,2}[/.])?(?:19|20)\d{2}|pr[ée]sent|present|aujourd'?hui|current|now)/i,
  )
  if (!rangeMatch) return { start: '', end: '', rest: line }

  const [full, start, end] = rangeMatch
  const rest = line.replace(full, '').replace(/[|,\-–—:]+$/, '').trim()
  return { start: start.trim(), end: end.trim(), rest }
}

function parseExperienceBlock(lines: string[]): ParsedExperience[] {
  if (lines.length === 0) return []

  const anchors = lines.reduce<number[]>((acc, line, idx) => {
    if (isDateRangeLine(line)) acc.push(idx)
    return acc
  }, [])

  // No recognizable dates anywhere — don't silently drop the content, keep
  // it as a single entry the user can split manually.
  if (anchors.length === 0) {
    return [
      {
        position: cleanText(lines[0] || ''),
        company: cleanText(lines[1] || ''),
        start: '',
        end: '',
        description: cleanText(lines.slice(2).join('\n')),
      },
    ]
  }

  return anchors.map((anchorIdx, i) => {
    const nextAnchorIdx = anchors[i + 1] ?? lines.length
    const { start, end, rest } = splitDateRange(lines[anchorIdx])
    const before = lines[anchorIdx - 1]?.trim() || ''
    const beforeIsAnotherAnchor = anchors.includes(anchorIdx - 1)

    let position = rest
    let company = ''

    if (rest && before && !beforeIsAnotherAnchor) {
      // "Position\nCompany — Dates" pattern
      position = before
      company = rest
    } else if (!rest && before && !beforeIsAnotherAnchor) {
      position = before
    }

    if (!company) {
      const after = lines[anchorIdx + 1]?.trim()
      if (after && !isDateRangeLine(after) && after.length < 60) {
        company = after
      }
    }

    const description = lines
      .slice(anchorIdx + 1, nextAnchorIdx)
      .filter((l) => l.trim() && l.trim() !== company)
      .join('\n')

    return {
      position: cleanText(position || ''),
      company: cleanText(company || ''),
      start: start || '',
      end: end || '',
      description: cleanText(description),
    }
  })
}

/* ============================================================
   6. Education — same anchor idea, simpler (year, not a range,
      is often enough to locate an entry).
   ============================================================ */

function parseEducationBlock(lines: string[]): ParsedEducation[] {
  if (lines.length === 0) return []

  const anchors = lines.reduce<number[]>((acc, line, idx) => {
    if (/\b(19|20)\d{2}\b/.test(line)) acc.push(idx)
    return acc
  }, [])

  if (anchors.length === 0) {
    return [{ degree: cleanText(lines[0] || ''), school: cleanText(lines[1] || ''), year: '', grade: '' }]
  }

  return anchors.map((anchorIdx, i) => {
    const nextAnchorIdx = anchors[i + 1] ?? lines.length
    const yearMatch = lines[anchorIdx].match(/(19|20)\d{2}(\s*[-–—]\s*(19|20)\d{2})?/)
    const year = yearMatch ? yearMatch[0] : ''
    const restOfAnchorLine = lines[anchorIdx].replace(year, '').replace(/[|,\-–—:]+$/, '').trim()
    const before = lines[anchorIdx - 1]?.trim() || ''

    const degree = restOfAnchorLine || before || ''
    const school = restOfAnchorLine ? before : lines[anchorIdx + 1]?.trim() || ''

    const mentionLine = lines
      .slice(anchorIdx + 1, nextAnchorIdx)
      .find((l) => /mention|honors|distinction/i.test(l))

    return {
      degree: cleanText(degree),
      school: cleanText(school === degree ? '' : school),
      year,
      grade: mentionLine ? cleanText(mentionLine.replace(/mention\s*:?/i, '')) : '',
    }
  })
}

/* ============================================================
   Orchestration — raw parse
   ============================================================ */

export async function parseCvPdf(file: File): Promise<ParsedCV> {
  const lines = await extractPdfLines(file)

  if (lines.length === 0) {
    throw new Error('Aucun texte lisible trouvé dans ce PDF (peut-être un scan sans OCR).')
  }

  const sections = splitIntoSections(lines)

  const emailRaw = findFirst(sections.top, EMAIL_REGEX) || findFirst(lines, EMAIL_REGEX)
  const phoneRaw = findFirst(sections.top, PHONE_REGEX) || findFirst(lines, PHONE_REGEX)
  const email = isPlausibleEmail(emailRaw) ? emailRaw : ''
  const phone = isPlausiblePhone(phoneRaw) ? phoneRaw : ''
  const location = cleanText(findLocation(sections.top) || findLocation(lines))
  const { name, title } = guessNameAndTitle(sections.top, email, phone)

  return {
    name,
    title,
    email,
    phone,
    location,
    summary: buildSummary(sections.summary),
    experiences: parseExperienceBlock(sections.experience),
    education: parseEducationBlock(sections.education),
    skills: parseTagList(sections.skills),
    languages: parseTagList(sections.languages),
    interests: parseTagList(sections.interests),
  }
}

/* ============================================================
   Strict mapping — the single place raw parsed values get
   written into named `cvData` fields. This is deliberately
   conservative: anything that doesn't clear the sanity checks
   above is left as an empty string / omitted from its list
   rather than assigned to the "closest guess" field.
   ============================================================ */

export interface MappedCvData {
  personal: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    summary: string
    // Not produced by the parser (a PDF import never carries a live photo
    // upload) — kept optional so callers can spread in whatever the user
    // already has selected without a type mismatch.
    photo?: string
  }
  // Not produced by the parser either; optional so callers can merge in the
  // user's currently selected template.
  template?: string
  languages: string[]
  skills: string[]
  interests: string[]
  experiences: {
    id: string
    position: string
    company: string
    startDate: string
    endDate: string
    description: string
  }[]
  education: {
    id: string
    degree: string
    school: string
    year: string
    mention: string
  }[]
}

function makeId(prefix: string, index: number): string {
  return `${prefix}-${index}-${Math.random().toString(36).slice(2, 8)}`
}

export interface MappedFormState {
  profile: {
    name: string
    title: string
    email: string
    phone: string
    location: string
    summary: string
  }
  languages: string[]
  skills: string[]
  interests: string[]
  experiences: {
    id: string
    position: string
    company: string
    start: string
    end: string
    description: string
  }[]
  education: {
    id: string
    degree: string
    school: string
    year: string
    grade: string
  }[]
}

/**
 * Maps a `ParsedCV` (raw parser output) onto a strict form-friendly state.
 *
 * The mapper is intentionally conservative: values that look like unrelated
 * content (for example a phone number or a date-only line) are left empty
 * rather than misassigned to fields such as title, company, or position.
 */
export function mapParsedCvToFormState(parsed: ParsedCV): MappedFormState {
  const profile = {
    name: isPlausibleName(parsed.name) ? cleanText(parsed.name) : '',
    title: isPlausibleTitle(parsed.title) ? cleanText(parsed.title) : '',
    email: isPlausibleEmail(parsed.email) ? cleanText(parsed.email) : '',
    phone: isPlausiblePhone(parsed.phone) ? cleanText(parsed.phone) : '',
    location: cleanText(parsed.location || ''),
    summary: cleanText(parsed.summary || ''),
  }

  return {
    profile,
    languages: cleanList(parsed.languages || []),
    skills: cleanList(parsed.skills || []),
    interests: cleanList(parsed.interests || []),
    experiences: (parsed.experiences || []).map((exp, i) => ({
      id: makeId('exp', i),
      position: isPlausiblePosition(exp.position) ? cleanText(exp.position) : '',
      company: isPlausibleCompany(exp.company) ? cleanText(exp.company) : '',
      start: cleanText(exp.start || ''),
      end: cleanText(exp.end || ''),
      description: cleanText(exp.description || ''),
    })),
    education: (parsed.education || []).map((edu, i) => ({
      id: makeId('edu', i),
      degree: cleanText(edu.degree || ''),
      school: cleanText(edu.school || ''),
      year: edu.year || '',
      grade: cleanText(edu.grade || ''),
    })),
  }
}

/**
 * Maps a `ParsedCV` (raw parser output) onto the strict `cvData` shape.
 *
 * Explicit rules:
 *  - Languages / Langues section content -> `languages` only.
 *  - Interests / Centres d'intérêt / Hobbies section content -> `interests` only.
 *  - Skills / Compétences section content -> `skills` only.
 *  - Email, phone, location -> `personal` fields, each independently
 *    validated; an invalid or missing value is left as `''` rather than
 *    being backfilled from an unrelated line.
 */
export function mapParsedCvToCvData(parsed: ParsedCV): MappedCvData {
  const mapped = mapParsedCvToFormState(parsed)

  return {
    personal: {
      name: mapped.profile.name,
      title: mapped.profile.title,
      email: mapped.profile.email,
      phone: mapped.profile.phone,
      location: mapped.profile.location,
      summary: mapped.profile.summary,
    },
    languages: mapped.languages,
    skills: mapped.skills,
    interests: mapped.interests,
    experiences: (mapped.experiences || []).map((exp, i) => ({
      id: makeId('exp', i),
      position: exp.position,
      company: exp.company,
      startDate: exp.start,
      endDate: exp.end,
      description: exp.description,
    })),
    education: (mapped.education || []).map((edu, i) => ({
      id: makeId('edu', i),
      degree: edu.degree,
      school: edu.school,
      year: edu.year,
      mention: edu.grade,
    })),
  }
}