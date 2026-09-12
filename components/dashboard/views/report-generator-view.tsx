'use client'

import { useState } from 'react'
import {
  Sparkles,
  Loader2,
  GraduationCap,
  Briefcase,
  FileText,
  CheckCircle2,
  Circle,
  Building2,
  Users2,
  CalendarDays,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableOfContents,
  TableRow,
  TabStopType,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'
import { saveAs } from 'file-saver'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UploadZone, type UploadedFileData } from '../upload-zone'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TYPES = [
  {
    key: 'pfe',
    label: 'PFE',
    desc: "Projet de Fin d'Études",
    icon: GraduationCap,
  },
  {
    key: 'stage',
    label: 'Stage',
    desc: 'Obligatoire / Optionnel',
    icon: Briefcase,
  },
]

const BODY_FONT = 'Times New Roman'
const BODY_SIZE = 24 // 12pt (half-points)
const CAPTION_SIZE = 20 // 10pt
const TITLE_COLOR = '1E2530'
const ACCENT_COLOR = '17B8A0'

type ChapterStatus = 'pending' | 'active' | 'done'
type ImageType = 'jpg' | 'png' | 'gif' | 'bmp'

interface TechItem {
  id: string
  name: string
  description: string
}

interface ReportGeneratorViewProps {
  user?: {
    id?: string
    name?: string
    email?: string
    recentReports?: { id: string; title: string; date?: string }[]
  }
}

/* ------------------------------------------------------------------ */
/*  Small utilities                                                     */
/* ------------------------------------------------------------------ */

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function sanitizeFilename(name: string) {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '').trim() || 'rapport'
}

function makeId() {
  return Math.random().toString(36).slice(2, 10)
}

function cleanBaseName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim()
}

/** Turns free text into an array of non-empty trimmed lines/paragraphs. */
function splitParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
}

/**
 * Expands short user input with generic, contextual academic boilerplate so
 * that each section still reads as complete prose even when the user only
 * provided a sentence or two. Real user content is always kept and always
 * comes first; the filler is only appended when needed.
 *
 * NOTE: this is a template-based fallback. For richer, truly bespoke
 * expansion, wire this function (or its call sites) to a text-generation
 * backend/LLM call — the structure below (topic + minimum paragraph count)
 * is designed to make that swap straightforward later.
 */
function expandContent(
  userText: string,
  fallback: string[],
  minParagraphs = 3,
): string[] {
  const provided = splitParagraphs(userText)
  if (provided.length >= minParagraphs) return provided
  const needed = minParagraphs - provided.length
  return [...provided, ...fallback.slice(0, Math.max(needed, 0))]
}

function getImageType(file: File): ImageType | null {
  const mime = file.type.toLowerCase()
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
  if (mime.includes('png')) return 'png'
  if (mime.includes('gif')) return 'gif'
  if (mime.includes('bmp')) return 'bmp'

  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg'
  if (ext === 'png') return 'png'
  if (ext === 'gif') return 'gif'
  if (ext === 'bmp') return 'bmp'

  return null
}

async function getImageDimensions(
  file: File,
  maxWidth = 460,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const ratio = img.height / img.width
      const width = Math.min(img.width, maxWidth)
      const height = Math.round(width * ratio)
      URL.revokeObjectURL(url)
      resolve({ width: Math.max(width, 120), height: Math.max(height, 80) })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ width: 400, height: 300 })
    }
    img.src = url
  })
}

/* ------------------------------------------------------------------ */
/*  Figure / Table numbering helpers                                    */
/* ------------------------------------------------------------------ */

interface CaptionEntry {
  number: number
  title: string
}

interface DocCounters {
  figure: number
  table: number
  figuresList: CaptionEntry[]
  tablesList: CaptionEntry[]
}

function newCounters(): DocCounters {
  return { figure: 0, table: 0, figuresList: [], tablesList: [] }
}

/** Builds the image + italic "Figure X : ..." caption paragraphs below it. */
async function buildFigure(
  file: UploadedFileData,
  counters: DocCounters,
  captionHint?: string,
): Promise<Paragraph[]> {
  const imageType = getImageType(file.file)
  counters.figure += 1
  const num = counters.figure
  const caption = captionHint || cleanBaseName(file.name) || 'Illustration'
  counters.figuresList.push({ number: num, title: caption })

  if (!imageType) {
    return [
      new Paragraph({
        children: [
          new TextRun({
            text: `Figure ${num} : ${caption} (format non pris en charge pour l'export Word)`,
            italics: true,
            size: CAPTION_SIZE,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    ]
  }

  const data = await file.file.arrayBuffer()
  const transformation = await getImageDimensions(file.file)

  return [
    new Paragraph({
      children: [
        new ImageRun({
          type: imageType,
          data,
          transformation,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Figure ${num} : ${caption}`,
          italics: true,
          size: CAPTION_SIZE,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 260 },
    }),
  ]
}

/** Builds the bold "Table X : ..." title paragraph placed above a table. */
function buildTableTitle(title: string, counters: DocCounters): Paragraph {
  counters.table += 1
  counters.tablesList.push({ number: counters.table, title })
  return new Paragraph({
    children: [
      new TextRun({ text: `Table ${counters.table} : ${title}`, bold: true }),
    ],
    spacing: { before: 240, after: 100 },
  })
}

/* ------------------------------------------------------------------ */
/*  Generic table builder                                              */
/* ------------------------------------------------------------------ */

function simpleTable(header: string[], rows: string[][]): Table {
  const borders = {
    top: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
    bottom: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
    left: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
    right: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'CBD5E1' },
  }

  const headerRow = new TableRow({
    tableHeader: true,
    children: header.map(
      (h) =>
        new TableCell({
          shading: { fill: '17B8A0' },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          children: [
            new Paragraph({
              children: [new TextRun({ text: h, bold: true, color: 'FFFFFF' })],
            }),
          ],
        }),
    ),
  })

  const bodyRows = rows.map(
    (r) =>
      new TableRow({
        children: r.map(
          (c) =>
            new TableCell({
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 80, bottom: 80, left: 100, right: 100 },
              children: splitParagraphs(c).length
                ? splitParagraphs(c).map((line) => new Paragraph({ children: [new TextRun(line)] }))
                : [new Paragraph({ children: [new TextRun(c)] })],
            }),
        ),
      }),
  )

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders,
    rows: [headerRow, ...bodyRows],
  })
}

/* ------------------------------------------------------------------ */
/*  Heading helper with manual numbering (visible in the Sommaire)      */
/* ------------------------------------------------------------------ */

function heading1(numberedText: string, pageBreakBefore = true): Paragraph {
  return new Paragraph({
    text: numberedText,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 420, after: 200 },
    pageBreakBefore,
  })
}

function heading2(numberedText: string): Paragraph {
  return new Paragraph({
    text: numberedText,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
  })
}

function heading3(numberedText: string): Paragraph {
  return new Paragraph({
    text: numberedText,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
  })
}

function bodyParagraphs(lines: string[]): Paragraph[] {
  return lines.map(
    (line) =>
      new Paragraph({
        children: [new TextRun(line)],
        spacing: { after: 160, line: 300 },
        alignment: AlignmentType.JUSTIFIED,
      }),
  )
}

/* ------------------------------------------------------------------ */
/*  Content expansion fallbacks (generic, contextual academic filler)   */
/* ------------------------------------------------------------------ */

function fallbackFor(topic: string, ctx: { title: string; company: string; typeLabel: string }): string[] {
  const { title, company, typeLabel } = ctx
  const companyName = company || "l'entreprise d'accueil"
  const bank: Record<string, string[]> = {
    contexteGeneral: [
      `Ce ${typeLabel.toLowerCase()} s'inscrit dans le cadre de la formation universitaire et vise à mettre en application, sur un cas concret, les compétences théoriques et pratiques acquises durant le cursus.`,
      `Le sujet traité, intitulé « ${title} », répond à un besoin identifié au sein de ${companyName} et illustre les enjeux actuels du secteur d'activité concerné.`,
      `La réalisation d'un tel projet permet de confronter les connaissances académiques à la réalité du terrain professionnel, tout en développant une méthodologie de travail rigoureuse.`,
    ],
    etudeExistant: [
      `Une étude de l'existant a été menée afin d'identifier les solutions déjà en place, qu'elles soient internes à ${companyName} ou disponibles sur le marché.`,
      `Cette analyse a permis de dégager les forces et les limites des approches actuelles, et de justifier l'intérêt d'une nouvelle solution adaptée au contexte étudié.`,
      `Les insuffisances constatées concernent notamment l'ergonomie, la couverture fonctionnelle, la performance ou encore la capacité d'évolution des outils existants.`,
    ],
    problematique: [
      `La problématique centrale de ce travail peut être formulée ainsi : comment répondre efficacement aux besoins identifiés tout en respectant les contraintes de temps, de coût et de qualité imposées par le projet ?`,
      `Cette problématique soulève plusieurs questions sous-jacentes relatives à l'architecture technique à adopter, aux choix technologiques pertinents et à l'expérience utilisateur visée.`,
    ],
    objectifs: [
      `Le projet poursuit plusieurs objectifs, à la fois fonctionnels et techniques, définis en concertation avec les encadrants académique et professionnel.`,
      `Ces objectifs visent à garantir une solution robuste, maintenable, sécurisée et conforme aux attentes exprimées par les parties prenantes.`,
    ],
    methodologie: [
      `Une méthodologie de conception structurée a été adoptée afin d'assurer la cohérence entre les besoins exprimés et la solution technique proposée.`,
      `Cette démarche s'appuie sur une modélisation orientée objet, favorisant la réutilisabilité, la clarté et l'évolutivité du système conçu.`,
      `Chaque étape de la conception a fait l'objet de validations intermédiaires afin de limiter les risques de dérive par rapport au cahier des charges.`,
    ],
    environnementDev: [
      `L'environnement de développement a été choisi en tenant compte des standards du marché, de la disponibilité de la documentation et de la compatibilité avec les technologies retenues.`,
      `Un soin particulier a été apporté à la configuration de l'environnement afin de garantir la reproductibilité du projet et de faciliter le travail collaboratif.`,
    ],
    tests: [
      `La phase de tests a permis de vérifier la conformité fonctionnelle de la solution par rapport au cahier des charges, ainsi que sa stabilité dans différents scénarios d'utilisation.`,
      `Des tests unitaires, d'intégration et fonctionnels ont été réalisés afin de détecter et corriger les anomalies avant la mise en production.`,
    ],
    securite: [
      `Les aspects liés à la sécurité ont été pris en compte dès la phase de conception, notamment la gestion des accès, la protection des données sensibles et la prévention des failles courantes.`,
      `Des bonnes pratiques reconnues ont été appliquées afin de limiter les risques liés aux vulnérabilités classiques des applications modernes.`,
    ],
    difficultes: [
      `La réalisation de ce projet a été l'occasion de rencontrer certaines difficultés, tant sur le plan technique qu'organisationnel, qui ont nécessité des recherches complémentaires et des ajustements successifs.`,
      `Ces difficultés ont néanmoins constitué une source d'apprentissage importante, renforçant l'autonomie et la capacité à résoudre des problèmes complexes.`,
    ],
    conclusionGenerale: [
      `Ce travail a permis d'apporter une réponse concrète à la problématique posée, tout en respectant les contraintes fixées initialement.`,
      `Il a également été l'occasion de renforcer des compétences techniques et transversales, précieuses pour la suite du parcours académique et professionnel.`,
      `Plusieurs perspectives d'évolution sont envisageables afin d'enrichir la solution proposée et d'en élargir le champ d'application.`,
    ],
  }
  return bank[topic] ?? []
}

/* ------------------------------------------------------------------ */
/*  Main document builder                                              */
/* ------------------------------------------------------------------ */

interface BuildOptions {
  typeLabel: string
  title: string
  projectName: string
  university: string
  licenseType: string
  academicYear: string
  studentNames: string
  academicSupervisor: string
  companySupervisor: string
  companyName: string
  companyPresentation: string
  description: string
  dedicace: string
  remerciements: string
  techItems: TechItem[]
  techLogoData: UploadedFileData[]
  companyLogoData: UploadedFileData[]
  diagramFiles: UploadedFileData[]
  screenshotFiles: UploadedFileData[]
}

async function buildReportDocument(options: BuildOptions): Promise<Document> {
  const {
    typeLabel,
    title,
    projectName,
    university,
    licenseType,
    academicYear,
    studentNames,
    academicSupervisor,
    companySupervisor,
    companyName,
    companyPresentation,
    description,
    dedicace,
    remerciements,
    techItems,
    techLogoData,
    companyLogoData,
    diagramFiles,
    screenshotFiles,
  } = options

  const counters = newCounters()
  const ctx = { title, company: companyName, typeLabel }

  // Split diagram figures roughly between Chapitre 2 (use cases) and
  // Chapitre 3 (conception); screenshots are reserved for Chapitre 4.
  const midpoint = Math.ceil(diagramFiles.length / 2)
  const useCaseDiagrams = diagramFiles.slice(0, midpoint)
  const conceptionDiagrams = diagramFiles.slice(midpoint)

  /* ---------------------------- Cover page ---------------------------- */

  const coverChildren: Paragraph[] = []

  if (companyLogoData[0]) {
    const data = await companyLogoData[0].file.arrayBuffer()
    const type = getImageType(companyLogoData[0].file) ?? 'png'
    const transformation = await getImageDimensions(companyLogoData[0].file, 180)
    coverChildren.push(
      new Paragraph({
        children: [new ImageRun({ type, data, transformation })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
    )
  }

  coverChildren.push(
    new Paragraph({
      children: [
        new TextRun({ text: university || 'Université', bold: true, size: 26 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: licenseType || "Rapport de Projet de Fin d'Études", size: 24 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [new TextRun({ text: typeLabel.toUpperCase(), bold: true, color: ACCENT_COLOR, size: 24 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 40, color: TITLE_COLOR })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
    }),
    new Paragraph({
      children: [new TextRun({ text: projectName || title, bold: true, size: 30 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 500 },
    }),
  )

  const namesLines = splitParagraphs(studentNames)
  coverChildren.push(
    new Paragraph({
      children: [new TextRun({ text: 'Réalisé par :', bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
    ...(namesLines.length ? namesLines : ['—']).map(
      (n) =>
        new Paragraph({
          children: [new TextRun(n)],
          alignment: AlignmentType.CENTER,
          spacing: { after: 40 },
        }),
    ),
    new Paragraph({
      children: [new TextRun({ text: 'Encadré par :', bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 60 },
    }),
    new Paragraph({
      children: [
        new TextRun(
          academicSupervisor
            ? `Encadrant académique : ${academicSupervisor}`
            : 'Encadrant académique : —',
        ),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
    }),
  )
  if (companySupervisor.trim()) {
    coverChildren.push(
      new Paragraph({
        children: [new TextRun(`Encadrant professionnel : ${companySupervisor}`)],
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
      }),
    )
  }

  coverChildren.push(
    new Paragraph({
      children: [new TextRun({ text: academicYear || '2025 / 2026', bold: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 700 },
    }),
  )

  /* --------------------------- Front matter --------------------------- */

  const frontMatter: (Paragraph | TableOfContents)[] = []

  frontMatter.push(
    new Paragraph({ text: 'Dédicace', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
    ...bodyParagraphs(
      splitParagraphs(dedicace).length
        ? splitParagraphs(dedicace)
        : ['À nos chères familles, pour leur soutien indéfectible tout au long de ce parcours.'],
    ),
  )

  frontMatter.push(
    new Paragraph({ text: 'Remerciements', heading: HeadingLevel.HEADING_1, pageBreakBefore: true, spacing: { after: 200 } }),
    ...bodyParagraphs(
      splitParagraphs(remerciements).length
        ? splitParagraphs(remerciements)
        : [
            `Nous tenons à exprimer nos sincères remerciements à toutes les personnes qui ont contribué, de près ou de loin, à la réussite de ce ${typeLabel.toLowerCase()}.`,
            `Nos remerciements vont particulièrement à notre encadrant académique${academicSupervisor ? `, ${academicSupervisor},` : ''} pour ses précieux conseils et sa disponibilité tout au long de ce travail.`,
            companyName
              ? `Nous remercions également l'ensemble du personnel de ${companyName} pour leur accueil chaleureux et leur accompagnement durant cette expérience.`
              : `Nous remercions également l'ensemble des personnes ayant participé à l'encadrement professionnel de ce travail.`,
          ],
    ),
  )

  // Sommaire (numbered headings are baked into the heading text itself,
  // so they appear correctly once Word regenerates the field).
  frontMatter.push(
    new Paragraph({ text: 'Sommaire', heading: HeadingLevel.HEADING_1, pageBreakBefore: true, spacing: { after: 160 } }),
    new Paragraph({
      children: [
        new TextRun({
          text: '(Clic droit sur la table ci-dessous puis « Mettre à jour les champs » pour actualiser la pagination après ouverture dans Word.)',
          italics: true,
          size: CAPTION_SIZE,
        }),
      ],
      spacing: { after: 200 },
    }),
    new TableOfContents('Sommaire', {
      hyperlink: true,
      headingStyleRange: '1-3',
    }),
  )

  // Placeholders for List of Figures / Tables — the real numbers/titles are
  // only known once the whole body has been generated, so these paragraphs
  // are inserted now and the final document is re-assembled with the
  // completed lists at the very end (see below).
  const figuresListHeading = new Paragraph({
    text: 'Liste des figures',
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    spacing: { after: 200 },
  })
  const tablesListHeading = new Paragraph({
    text: 'Liste des tableaux',
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: true,
    spacing: { after: 200 },
  })

  /* ------------------------------ Body -------------------------------- */

  const body: (Paragraph | Table)[] = []

  // Introduction Générale
  body.push(
    heading1('Introduction Générale', false),
    ...bodyParagraphs(
      expandContent(
        description,
        fallbackFor('contexteGeneral', ctx),
        3,
      ),
    ),
  )

  // Chapitre 1 : Présentation du cadre du projet
  body.push(heading1('Chapitre 1 : Présentation du cadre du projet'))
  body.push(heading2('1.1 Introduction'))
  body.push(
    ...bodyParagraphs([
      `Ce chapitre présente le cadre général dans lequel s'inscrit ce ${typeLabel.toLowerCase()}, à savoir l'organisme d'accueil, le contexte du projet ainsi qu'une étude de l'existant.`,
    ]),
  )
  body.push(heading2('1.2 Présentation de la société'))
  body.push(
    ...bodyParagraphs(
      expandContent(
        companyPresentation,
        [
          `${companyName || "L'entreprise d'accueil"} évolue dans un secteur d'activité exigeant, où l'innovation technologique constitue un levier de compétitivité majeur.`,
          `Structurée autour de plusieurs pôles métiers, l'entreprise met à disposition les ressources humaines et matérielles nécessaires à la bonne conduite du projet.`,
          `Le cadre de travail offert a permis une immersion complète dans un environnement professionnel réel, propice à l'application des connaissances théoriques.`,
        ],
        3,
      ),
    ),
  )
  body.push(heading2('1.3 Contexte du projet'))
  body.push(...bodyParagraphs(fallbackFor('contexteGeneral', ctx)))
  body.push(heading2("1.4 Étude de l'existant"))
  body.push(...bodyParagraphs(fallbackFor('etudeExistant', ctx)))
  body.push(heading2('1.5 Conclusion'))
  body.push(
    ...bodyParagraphs([
      'Ce premier chapitre a permis de poser le cadre général du projet. Le chapitre suivant sera consacré à l\'analyse et à la spécification des besoins.',
    ]),
  )

  // Chapitre 2 : Analyse et spécification des besoins
  body.push(heading1('Chapitre 2 : Analyse et spécification des besoins'))
  body.push(heading2('2.1 Introduction'))
  body.push(
    ...bodyParagraphs([
      'Ce chapitre a pour objectif de définir précisément les besoins fonctionnels et non fonctionnels du système, ainsi que les acteurs qui interviendront dans son utilisation.',
    ]),
  )
  body.push(heading2('2.2 Problématique'))
  body.push(...bodyParagraphs(fallbackFor('problematique', ctx)))
  body.push(heading2('2.3 Solution proposée'))
  body.push(
    ...bodyParagraphs([
      `La solution proposée répond directement à la problématique énoncée, en s'appuyant sur une architecture technique adaptée et sur les technologies présentées au chapitre 4.`,
    ]),
  )
  body.push(heading2('2.4 Objectifs'))
  body.push(...bodyParagraphs(fallbackFor('objectifs', ctx)))

  body.push(heading2('2.5 Cahier des charges'))
  body.push(heading3('2.5.1 Besoins fonctionnels'))
  body.push(buildTableTitle('Besoins fonctionnels', counters))
  body.push(
    simpleTable(
      ['Identifiant', 'Besoin fonctionnel', 'Description'],
      [
        ['BF-01', 'Gestion des utilisateurs', "Permettre l'authentification, la gestion des rôles et des profils."],
        ['BF-02', 'Fonctionnalité principale', "Assurer le cœur métier de l'application décrit dans ce rapport."],
        ['BF-03', 'Suivi et reporting', "Générer des tableaux de bord et des rapports d'activité."],
      ],
    ),
  )
  body.push(heading3('2.5.2 Besoins non fonctionnels'))
  body.push(buildTableTitle('Besoins non fonctionnels', counters))
  body.push(
    simpleTable(
      ['Critère', 'Description'],
      [
        ['Performance', "Garantir des temps de réponse courts même en charge."],
        ['Sécurité', "Protéger les données et les accès selon les bonnes pratiques en vigueur."],
        ['Ergonomie', "Offrir une interface intuitive et accessible."],
        ['Évolutivité', "Permettre l'ajout futur de nouvelles fonctionnalités sans refonte majeure."],
      ],
    ),
  )

  body.push(heading2('2.6 Identification des acteurs'))
  body.push(buildTableTitle('Acteurs du système', counters))
  body.push(
    simpleTable(
      ['Acteur', 'Rôle'],
      [
        ['Utilisateur', "Interagit avec les fonctionnalités principales de l'application."],
        ['Administrateur', "Gère les utilisateurs, les paramètres et la supervision du système."],
      ],
    ),
  )

  body.push(heading2('2.7 Diagrammes de cas d\'utilisation'))
  if (useCaseDiagrams.length) {
    for (const file of useCaseDiagrams) {
      body.push(...(await buildFigure(file, counters, `Diagramme de cas d'utilisation — ${cleanBaseName(file.name)}`)))
      body.push(buildTableTitle(`Description du cas d'utilisation — ${cleanBaseName(file.name)}`, counters))
      body.push(
        simpleTable(
          ['Élément', 'Description'],
          [
            ['Acteurs', 'Utilisateur, Administrateur'],
            ['Pré-condition', "L'acteur est authentifié sur le système."],
            ['Scénario nominal', "Décrire ici les étapes principales du cas d'utilisation."],
            ['Post-condition', "L'action demandée est effectuée avec succès."],
          ],
        ),
      )
    }
  } else {
    body.push(
      ...bodyParagraphs([
        "Les diagrammes de cas d'utilisation détaillant les interactions entre les acteurs et le système peuvent être ajoutés en important les images correspondantes dans la zone « Diagrammes » du générateur.",
      ]),
    )
  }
  body.push(heading2('2.8 Conclusion'))
  body.push(
    ...bodyParagraphs([
      'Ce chapitre a permis de spécifier clairement les besoins du système. Le chapitre suivant présente la conception détaillée de la solution.',
    ]),
  )

  // Chapitre 3 : Conception
  body.push(heading1('Chapitre 3 : Conception'))
  body.push(heading2('3.1 Introduction'))
  body.push(
    ...bodyParagraphs([
      'Ce chapitre décrit la démarche de conception adoptée ainsi que les différents diagrammes qui modélisent la solution proposée.',
    ]),
  )
  body.push(heading2('3.2 Méthodologie adoptée'))
  body.push(...bodyParagraphs(fallbackFor('methodologie', ctx)))
  body.push(heading2('3.3 Diagrammes de conception'))
  if (conceptionDiagrams.length) {
    for (const file of conceptionDiagrams) {
      body.push(...(await buildFigure(file, counters, cleanBaseName(file.name) || 'Diagramme de conception')))
    }
  } else {
    body.push(
      ...bodyParagraphs([
        'Les diagrammes de conception (diagrammes de classes, de séquence, d\'activités, etc.) peuvent être ajoutés via la zone « Diagrammes » du générateur.',
      ]),
    )
  }
  body.push(heading2('3.4 Modèle de données'))
  body.push(buildTableTitle('Principales entités du modèle de données', counters))
  body.push(
    simpleTable(
      ['Entité', 'Description', 'Attributs principaux'],
      [
        ['Utilisateur', 'Représente un utilisateur du système', 'id, nom, email, rôle'],
        ['Ressource principale', "Objet métier central de l'application", 'id, statut, dates de création/mise à jour'],
      ],
    ),
  )
  body.push(heading2('3.5 Conclusion'))
  body.push(
    ...bodyParagraphs([
      'La conception présentée dans ce chapitre constitue la base sur laquelle repose la réalisation détaillée au chapitre suivant.',
    ]),
  )

  // Chapitre 4 : Réalisation
  body.push(heading1('Chapitre 4 : Réalisation'))
  body.push(heading2('4.1 Introduction'))
  body.push(
    ...bodyParagraphs([
      'Ce dernier chapitre décrit l\'environnement de développement, les technologies utilisées, l\'architecture applicative, ainsi que les principaux résultats obtenus.',
    ]),
  )
  body.push(heading2('4.2 Environnement de développement'))
  body.push(...bodyParagraphs(fallbackFor('environnementDev', ctx)))

  body.push(heading2('4.3 Technologies utilisées'))
  if (techItems.length) {
    for (const tech of techItems) {
      const logo = techLogoData.find(
        (f) => cleanBaseName(f.name).toLowerCase() === tech.name.trim().toLowerCase(),
      )
      body.push(heading3(tech.name))
      if (logo) {
        body.push(...(await buildFigure(logo, counters, `Logo ${tech.name}`)))
      }
      body.push(
        ...bodyParagraphs([
          tech.description.trim() ||
            `${tech.name} a été retenu pour ce projet en raison de sa robustesse, de la richesse de son écosystème et de son adéquation avec les besoins techniques identifiés.`,
        ]),
      )
    }
  } else {
    body.push(
      ...bodyParagraphs([
        'La liste des technologies utilisées (langages, frameworks, bases de données, outils) peut être renseignée dans la section « Technologies utilisées » du générateur.',
      ]),
    )
  }

  body.push(heading2('4.4 Justification des choix technologiques'))
  body.push(
    ...bodyParagraphs([
      'Les choix technologiques présentés précédemment ont été motivés par des critères objectifs : maturité de la technologie, performance, sécurité, disponibilité de la documentation et compatibilité avec les compétences de l\'équipe.',
    ]),
  )

  body.push(heading2('4.5 Architecture applicative'))
  body.push(
    ...bodyParagraphs([
      'L\'architecture applicative retenue permet une séparation claire des responsabilités entre les différentes couches du système (présentation, logique métier, accès aux données), facilitant ainsi la maintenance et l\'évolution de la solution.',
    ]),
  )

  body.push(heading2('4.6 Captures d\'écran de la réalisation'))
  if (screenshotFiles.length) {
    for (const file of screenshotFiles) {
      body.push(...(await buildFigure(file, counters, cleanBaseName(file.name) || 'Capture d\'écran de l\'application')))
    }
  } else {
    body.push(
      ...bodyParagraphs([
        'Les captures d\'écran illustrant les principales interfaces réalisées peuvent être ajoutées via la zone « Captures d\'écran » du générateur.',
      ]),
    )
  }

  body.push(heading2('4.7 Tests et validation'))
  body.push(...bodyParagraphs(fallbackFor('tests', ctx)))
  body.push(heading2('4.8 Sécurité'))
  body.push(...bodyParagraphs(fallbackFor('securite', ctx)))
  body.push(heading2('4.9 Difficultés rencontrées'))
  body.push(...bodyParagraphs(fallbackFor('difficultes', ctx)))
  body.push(heading2('4.10 Conclusion'))
  body.push(
    ...bodyParagraphs([
      'La réalisation présentée dans ce chapitre concrétise l\'ensemble des travaux d\'analyse et de conception menés précédemment.',
    ]),
  )

  // Conclusion Générale
  body.push(heading1('Conclusion Générale et Perspectives'))
  body.push(...bodyParagraphs(fallbackFor('conclusionGenerale', ctx)))

  /* --------------------- Assemble Liste des figures/tableaux ---------- */

  const figuresListParagraphs: Paragraph[] = counters.figuresList.length
    ? counters.figuresList.map(
        (f) =>
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
            children: [new TextRun(`Figure ${f.number} : ${f.title}`)],
            spacing: { after: 100 },
          }),
      )
    : [new Paragraph({ children: [new TextRun({ text: 'Aucune figure insérée.', italics: true })] })]

  const tablesListParagraphs: Paragraph[] = counters.tablesList.length
    ? counters.tablesList.map(
        (t) =>
          new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: 9000 }],
            children: [new TextRun(`Table ${t.number} : ${t.title}`)],
            spacing: { after: 100 },
          }),
      )
    : [new Paragraph({ children: [new TextRun({ text: 'Aucun tableau inséré.', italics: true })] })]

  /* ------------------------------ Sections ----------------------------- */

  const footerText = (label: string) =>
    new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ children: [PageNumber.CURRENT] }),
          ],
        }),
      ],
    })

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: BODY_FONT, size: BODY_SIZE },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: BODY_FONT, size: 32, bold: true, color: TITLE_COLOR },
          paragraph: { spacing: { before: 400, after: 200 } },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: BODY_FONT, size: 27, bold: true, color: TITLE_COLOR },
          paragraph: { spacing: { before: 280, after: 140 } },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: { font: BODY_FONT, size: 25, bold: true, italics: true, color: TITLE_COLOR },
          paragraph: { spacing: { before: 200, after: 120 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          titlePage: true,
        },
        children: [...coverChildren],
      },
      {
        properties: {},
        footers: { default: footerText('front') },
        children: [
          ...frontMatter,
          figuresListHeading,
          ...figuresListParagraphs,
          tablesListHeading,
          ...tablesListParagraphs,
        ],
      },
      {
        properties: {
          page: { pageNumbers: { start: 1 } },
        },
        footers: { default: footerText('body') },
        children: [...body],
      },
    ],
  })

  return doc
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

const CHAPTER_PROGRESS = [
  { label: 'Introduction Générale', preview: 'Contexte général et annonce du plan.' },
  { label: 'Chapitre 1 : Cadre du projet', preview: 'Société, contexte, étude de l\'existant.' },
  { label: 'Chapitre 2 : Analyse des besoins', preview: 'Problématique, cahier des charges, acteurs.' },
  { label: 'Chapitre 3 : Conception', preview: 'Méthodologie, diagrammes, modèle de données.' },
  { label: 'Chapitre 4 : Réalisation', preview: 'Technologies, architecture, captures, tests.' },
  { label: 'Conclusion Générale', preview: 'Bilan et perspectives.' },
]

export function ReportGeneratorView({ user }: ReportGeneratorViewProps) {
  const [type, setType] = useState('pfe')
  const [title, setTitle] = useState('')
  const [projectName, setProjectName] = useState('')

  const [university, setUniversity] = useState('')
  const [licenseType, setLicenseType] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [studentNames, setStudentNames] = useState('')
  const [academicSupervisor, setAcademicSupervisor] = useState('')
  const [companySupervisor, setCompanySupervisor] = useState('')

  const [companyName, setCompanyName] = useState('')
  const [companyPresentation, setCompanyPresentation] = useState('')
  const [description, setDescription] = useState('')

  const [dedicace, setDedicace] = useState('')
  const [remerciements, setRemerciements] = useState('')

  const [techItems, setTechItems] = useState<TechItem[]>([
    { id: makeId(), name: '', description: '' },
  ])
  const [techLogoFiles, setTechLogoFiles] = useState<string[]>([])
  const [techLogoData, setTechLogoData] = useState<UploadedFileData[]>([])

  const [companyLogoFiles, setCompanyLogoFiles] = useState<string[]>([])
  const [companyLogoData, setCompanyLogoData] = useState<UploadedFileData[]>([])

  const [diagramFileNames, setDiagramFileNames] = useState<string[]>([])
  const [diagramFileData, setDiagramFileData] = useState<UploadedFileData[]>([])

  const [screenshotFileNames, setScreenshotFileNames] = useState<string[]>([])
  const [screenshotFileData, setScreenshotFileData] = useState<UploadedFileData[]>([])

  const [loading, setLoading] = useState(false)
  const [chapterStatus, setChapterStatus] = useState<ChapterStatus[]>(
    CHAPTER_PROGRESS.map(() => 'pending'),
  )

  const [reports, setReports] = useState<Array<{ id: string; title: string }>>(
    () => user?.recentReports || [],
  )

  function addTechItem() {
    setTechItems((prev) => [...prev, { id: makeId(), name: '', description: '' }])
  }

  function removeTechItem(id: string) {
    setTechItems((prev) => (prev.length > 1 ? prev.filter((t) => t.id !== id) : prev))
  }

  function updateTechItem(id: string, patch: Partial<TechItem>) {
    setTechItems((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  const isStage = type === 'stage'

  async function handleGenerateAI() {
    if (!title.trim()) return

    setLoading(true)
    setChapterStatus(CHAPTER_PROGRESS.map(() => 'pending'))

    const typeLabel = TYPES.find((t) => t.key === type)?.label ?? type

    try {
      for (let i = 0; i < CHAPTER_PROGRESS.length; i++) {
        setChapterStatus((prev) => prev.map((s, idx) => (idx === i ? 'active' : s)))
        await delay(450)
        setChapterStatus((prev) => prev.map((s, idx) => (idx === i ? 'done' : s)))
      }

      const document = await buildReportDocument({
        typeLabel,
        title: title.trim(),
        projectName: projectName.trim(),
        university: university.trim(),
        licenseType: licenseType.trim(),
        academicYear: academicYear.trim(),
        studentNames,
        academicSupervisor: academicSupervisor.trim(),
        companySupervisor: isStage ? companySupervisor.trim() : '',
        companyName: companyName.trim(),
        companyPresentation,
        description,
        dedicace,
        remerciements,
        techItems: techItems.filter((t) => t.name.trim()),
        techLogoData,
        companyLogoData,
        diagramFiles: diagramFileData,
        screenshotFiles: screenshotFileData,
      })

      const blob = await Packer.toBlob(document)
      saveAs(blob, `${sanitizeFilename(title.trim())}.docx`)

      const newReport = { id: Date.now().toString(), title: title.trim() }
      setReports((prev) => [newReport, ...prev])
      setChapterStatus(CHAPTER_PROGRESS.map(() => 'pending'))
    } catch (error) {
      console.error('Erreur lors de la génération du rapport Word:', error)
    } finally {
      setLoading(false)
    }
  }

  const missingRequired = !title.trim() || !university.trim() || !academicSupervisor.trim()

  return (
    <div className="cc-body space-y-6">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;600&display=swap');
        .cc-display { font-family: 'Space Grotesk', sans-serif; }
        .cc-body { font-family: 'Inter', sans-serif; }
        .cc-mono { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Type + titles */}
          <Card className="border-[#1E2530]/10">
            <CardContent className="space-y-6 p-6">
              <div>
                <Label>Type de rapport</Label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {TYPES.map((t) => {
                    const Icon = t.icon
                    const isActive = type === t.key
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => setType(t.key)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-4 text-left transition-colors',
                          isActive
                            ? 'border-[#17B8A0] bg-[#17B8A0]/5 ring-1 ring-[#17B8A0]/30'
                            : 'border-[#1E2530]/10 hover:border-[#17B8A0]/40 hover:bg-[#1E2530]/[0.02]',
                        )}
                      >
                        <span
                          className={cn(
                            'flex size-10 items-center justify-center rounded-lg',
                            isActive ? 'bg-[#17B8A0] text-[#0E1729]' : 'bg-[#1E2530]/6 text-[#8B93A1]',
                          )}
                        >
                          <Icon className="size-5" />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#1E2530]">{t.label}</span>
                          <span className="block text-xs text-[#8B93A1]">{t.desc}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="report-title">Titre du rapport *</Label>
                  <Input
                    id="report-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ex. Conception d'une plateforme IoT"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="project-name">Nom du projet</Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="ex. SmartTrack"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic identity */}
          <Card className="border-[#1E2530]/10">
            <CardContent className="space-y-4 p-6">
              <h3 className="cc-display flex items-center gap-2 text-sm font-semibold text-[#1E2530]">
                <Users2 className="size-4 text-[#17B8A0]" /> Identité académique
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="university">Université / Établissement *</Label>
                  <Input
                    id="university"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="ex. Université de Tunis El Manar"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="license-type">Diplôme / Licence</Label>
                  <Input
                    id="license-type"
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    placeholder="ex. Licence Appliquée en Informatique"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="academic-year">Année universitaire</Label>
                  <Input
                    id="academic-year"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="ex. 2025 / 2026"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="academic-supervisor">Encadrant académique *</Label>
                  <Input
                    id="academic-supervisor"
                    value={academicSupervisor}
                    onChange={(e) => setAcademicSupervisor(e.target.value)}
                    placeholder="ex. Pr. Amine Belhadj"
                  />
                </div>
                {isStage && (
                  <div className="space-y-1.5">
                    <Label htmlFor="company-supervisor">Encadrant professionnel</Label>
                    <Input
                      id="company-supervisor"
                      value={companySupervisor}
                      onChange={(e) => setCompanySupervisor(e.target.value)}
                      placeholder="ex. Mme Sarra Ben Ahmed"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="student-names">Réalisé par (un nom par ligne)</Label>
                <Textarea
                  id="student-names"
                  className="min-h-20"
                  value={studentNames}
                  onChange={(e) => setStudentNames(e.target.value)}
                  placeholder={'Ex: Prénom Nom'}
                />
              </div>
            </CardContent>
          </Card>

          {/* Company */}
          <Card className="border-[#1E2530]/10">
            <CardContent className="space-y-4 p-6">
              <h3 className="cc-display flex items-center gap-2 text-sm font-semibold text-[#1E2530]">
                <Building2 className="size-4 text-[#17B8A0]" /> Société d'accueil
              </h3>
              <div className="space-y-1.5">
                <Label htmlFor="report-company">Nom de la société</Label>
                <Input
                  id="report-company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ex. TechCorp Solutions"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="report-company-presentation">Présentation de la société</Label>
                <Textarea
                  id="report-company-presentation"
                  className="min-h-28"
                  value={companyPresentation}
                  onChange={(e) => setCompanyPresentation(e.target.value)}
                  placeholder="Décrivez l'activité, la mission et le contexte de l'entreprise d'accueil..."
                />
              </div>
              <div className="space-y-2">
                <Label>Logo de la société</Label>
                <UploadZone
                  label="Glissez-déposez le logo (page de garde)"
                  files={companyLogoFiles}
                  onFilesChange={setCompanyLogoFiles}
                  fileData={companyLogoData}
                  onFileDataChange={setCompanyLogoData}
                />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="border-[#1E2530]/10">
            <CardContent className="space-y-4 p-6">
              <div className="space-y-1.5">
                <Label htmlFor="report-desc">Description &amp; directives du projet</Label>
                <Textarea
                  id="report-desc"
                  className="min-h-32"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Expliquez le sujet, la problématique, les objectifs, les technologies envisagées... (plus vous détaillez, plus le rapport généré sera fidèle à votre projet)"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="dedicace">Dédicace</Label>
                  <Textarea
                    id="dedicace"
                    className="min-h-24"
                    value={dedicace}
                    onChange={(e) => setDedicace(e.target.value)}
                    placeholder="Laissez vide pour un texte par défaut."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="remerciements">Remerciements</Label>
                  <Textarea
                    id="remerciements"
                    className="min-h-24"
                    value={remerciements}
                    onChange={(e) => setRemerciements(e.target.value)}
                    placeholder="Laissez vide pour un texte par défaut."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technologies */}
          <Card className="border-[#1E2530]/10">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h3 className="cc-display flex items-center gap-2 text-sm font-semibold text-[#1E2530]">
                  <Layers className="size-4 text-[#17B8A0]" /> Technologies utilisées
                </h3>
                <button
                  type="button"
                  onClick={addTechItem}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#1E2530]/10 px-2.5 py-1.5 text-xs font-medium text-[#1E2530] hover:bg-[#1E2530]/[0.03]"
                >
                  <Plus className="size-3.5" /> Ajouter
                </button>
              </div>
              <div className="space-y-3">
                {techItems.map((tech) => (
                  <div key={tech.id} className="flex gap-2 rounded-lg border border-[#1E2530]/10 p-3">
                    <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                      <Input
                        value={tech.name}
                        onChange={(e) => updateTechItem(tech.id, { name: e.target.value })}
                        placeholder="ex. React"
                      />
                      <Input
                        value={tech.description}
                        onChange={(e) => updateTechItem(tech.id, { description: e.target.value })}
                        placeholder="Justification (optionnel)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTechItem(tech.id)}
                      className="shrink-0 self-start rounded-md p-1.5 text-[#8B93A1] hover:bg-[#1E2530]/[0.05] hover:text-red-500"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Logos des technologies (optionnel)</Label>
                <p className="text-xs text-[#8B93A1]">
                  Nommez chaque fichier comme la technologie correspondante (ex. « react.png ») pour un
                  rattachement automatique.
                </p>
                <UploadZone
                  label="Glissez-déposez les logos des technologies"
                  files={techLogoFiles}
                  onFilesChange={setTechLogoFiles}
                  fileData={techLogoData}
                  onFileDataChange={setTechLogoData}
                />
              </div>
            </CardContent>
          </Card>

          {/* Diagrams & screenshots */}
          <Card className="border-[#1E2530]/10">
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label>Diagrammes (cas d'utilisation &amp; conception)</Label>
                <UploadZone
                  label="Glissez-déposez vos diagrammes UML"
                  files={diagramFileNames}
                  onFilesChange={setDiagramFileNames}
                  fileData={diagramFileData}
                  onFileDataChange={setDiagramFileData}
                />
              </div>
              <div className="space-y-2">
                <Label>Captures d'écran de la réalisation</Label>
                <UploadZone
                  label="Glissez-déposez vos captures d'écran"
                  files={screenshotFileNames}
                  onFilesChange={setScreenshotFileNames}
                  fileData={screenshotFileData}
                  onFileDataChange={setScreenshotFileData}
                />
              </div>
            </CardContent>
          </Card>

          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={loading || missingRequired}
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#0E1729] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Génération du rapport...
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Générer le rapport
              </>
            )}
          </button>
          {missingRequired && !loading && (
            <p className="-mt-2 text-xs text-[#8B93A1]">
              Merci de renseigner au minimum le titre, l'université et l'encadrant académique.
            </p>
          )}

          {loading && (
            <div className="rounded-xl border border-[#1E2530]/10 bg-[#1E2530]/[0.02] p-4">
              <p className="cc-display mb-3 text-xs font-semibold uppercase tracking-wider text-[#8B93A1]">
                Rédaction en cours
              </p>
              <ul className="space-y-3">
                {CHAPTER_PROGRESS.map((c, idx) => {
                  const status = chapterStatus[idx]
                  return (
                    <li key={c.label} className="flex items-start gap-3">
                      <span className="mt-0.5 shrink-0">
                        {status === 'done' ? (
                          <CheckCircle2 className="size-4 text-[#17B8A0]" />
                        ) : status === 'active' ? (
                          <Loader2 className="size-4 animate-spin text-[#F2A93B]" />
                        ) : (
                          <Circle className="size-4 text-[#1E2530]/15" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            'block text-sm font-medium',
                            status === 'pending' ? 'text-[#8B93A1]' : 'text-[#1E2530]',
                          )}
                        >
                          {c.label}
                        </span>
                        {status !== 'pending' && (
                          <span className="cc-mono mt-0.5 block text-xs text-[#8B93A1]">{c.preview}</span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-[#1E2530]/10">
            <CardContent className="p-5">
              <h3 className="cc-display flex items-center gap-2 text-base font-semibold text-[#1E2530]">
                <FileText className="size-4 text-[#17B8A0]" /> Ce que vous obtiendrez
              </h3>
              <ul className="mt-3 space-y-3 text-sm text-[#8B93A1]">
                {[
                  'Page de garde complète (logo, université, encadrants, année)',
                  'Dédicace, remerciements, sommaire, listes des figures et tableaux',
                  '4 chapitres numérotés avec sous-sections détaillées',
                  'Figures et tableaux numérotés automatiquement, avec légendes',
                  'Section Technologies utilisées avec logos',
                  'Police Times New Roman 12, export Word (.docx)',
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#17B8A0]" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-[#1E2530]/10">
            <CardContent className="p-5">
              <h3 className="cc-display text-base font-semibold text-[#1E2530]">Rapports récents</h3>
              <ul className="mt-3 space-y-2">
                {reports.length > 0 ? (
                  reports.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center gap-2.5 rounded-lg border border-[#1E2530]/10 p-2.5"
                    >
                      <FileText className="size-4 text-[#8B93A1]" />
                      <span className="min-w-0 flex-1 truncate text-sm text-[#1E2530]">{r.title}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs italic text-[#8B93A1]">Aucun rapport récent.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}