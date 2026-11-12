import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Award,
  NotebookPen,
  Users,
  Calendar,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  BookOpenCheck,
  Table as TableIcon,
  Scale,
  Layout,
  Columns,
  FileText,
  FileDown,
  CheckCircle2,
  Clock,
  Palette,
  Type,
  Trophy,
  ZoomIn,
  ChevronDown,
  ChevronUp,
  Eye,
  Calculator,
  Star,
  Printer,
  TableOfContents,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { MarioAvatar } from '../types/laborLaw';
import { ALL_LAW_TOPICS, WORLDS_METADATA, STATUTORY_LEAVES_MASTER_ROWS } from '../data/laborLawData';
import { LABOR_BENEFITS_MULTIPLIER_LIST } from '../data/multiplierTable';
import {
  REGIONAL_MINIMUM_WAGES,
  KASAMBAHAY_MINIMUM_WAGES,
} from '../data/regionalWages';
import {
  GROUP_MEMBERS,
  StudyNoteItem,
  loadStudyNotes,
  sanitizeMnemonicNoteTitle,
  parseStructuredNoteLines,
  DEFAULT_PRINT_FORMAT_OPTIONS,
  PrintGuideFormatOptions,
  filterTopicsForPrintGuide,
  getMemberFacebookUrl,
} from '../utils/engagementFeatures';
import { cleanRuleText, parseListEntry } from '../utils/moduleFormatter';
import { marioAudio } from '../utils/audio';
import {
  applyPrintPageRule,
  clearPrintPageRule,
  ensurePrintFontsReady,
  triggerPrintWithDocumentFont,
  type PrintIsolationMode,
} from '../utils/printHelper';
import { getPrintFontCssStack } from '../utils/round11Features';
import {
  ONE_PAGE_LEGAL_FORMULAS,
  ONE_PAGE_LEGAL_DEADLINES,
  ONE_PAGE_STATUTORY_LEAVE_CAPS,
} from '../utils/onePageSummaryData';
import {
  downloadOnePageSummaryA4Pdf,
  downloadCertificatePdf,
  downloadStudyGuideReviewerPdf,
  downloadScoreCardLandscapePdf,
  buildOnePageSummaryPdfBytes,
  buildCertificatePdfBytes,
  buildStudyGuideReviewerPdfBytes,
  buildScoreCardLandscapePdfBytes,
  countPdfPagesFromBytes,
  ScoreCardPdfParams,
  PrintPaperSize,
  PRINT_PAPER_SPECS,
  downloadExactPreviewVisualPdfAsync,
} from '../utils/pdfExportService';
import {
  PRINT_COLOR_THEMES,
  PRINT_FONT_STYLES,
  PreviewZoomPreset,
  computeA4PreviewStageMetrics,
  getPrintThemeCatalogItem,
  getPrintFontCatalogItem,
} from '../utils/round8Features';
import {
  EXTENDED_PRINT_COLOR_THEMES,
  EXTENDED_PRINT_FONT_CATALOG,
  resolveExtendedPrintTheme,
  resolveExtendedPrintFont,
  getContrastingTextColor,
} from '../utils/round12Features';
import {
  buildTrueFontOnePageSummaryPdfBytesAsync,
  buildTrueFontCertificateOrDiplomaPdfBytesAsync,
  buildTrueFontScoreCardPdfBytesAsync,
  buildTrueFontStudyReviewerPdfBytesAsync,
  downloadTrueFontOnePageSummaryPdfAsync,
  downloadTrueFontCertificatePdfAsync,
  downloadTrueFontMasterDiplomaPdfAsync,
  downloadTrueFontScoreCardPdfAsync,
  downloadTrueFontStudyReviewerPdfAsync,
} from '../utils/pdfTrueFontRenderer';
import {
  MarioSuperStarIcon,
  MarioCoinBlockIcon,
  MarioWarpPipeIcon,
  MarioMushroomIcon,
  MarioFireFlowerIcon,
  MarioCoinIcon,
  MarioBrickStrip,
} from './MarioPrintIcons';
import { MarioCharacterAvatar } from './MarioIcons';
import {
  PassportProfileData,
  loadPassportProfile,
  savePassportProfile,
  generatePassportMrz,
  formatPassportDate,
  splitCandidateName,
  PHILIPPINE_BIRTHPLACE_SUGGESTIONS,
} from '../utils/passportData';

export type PrintModalDocumentMode =
  | 'summary'
  | 'guide'
  | 'certificate'
  | 'diploma'
  | 'scorecard'
  | 'cheatsheet'
  | 'bowser_victory'
  | 'passport';

interface PrintStudyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedTopicIds: string[];
  coins: number;
  studyNotes?: StudyNoteItem[];
  initialMode?: PrintModalDocumentMode;
  playerName?: string;
  equippedAvatar?: string;
  loginStreak?: number;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
  quizRunsCompleted?: number;
  studiedSeconds?: number;
  appStudyFont?: string;
  activeAppTheme?: string;
}

function stripInlineLegalCitations(text: string, includeCitations: boolean): string {
  const cleaned = cleanRuleText(text);
  if (includeCitations) return cleaned;
  return cleaned
    .replace(/\s*\((?:Art\.|Arts\.|R\.A\.|P\.D\.|D\.O\.|G\.R\.|Sec\.|Labor Code)[^)]*\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Editorial typography parser for print preview:
 * - Landmark case names & GR citations formatted with bold italics (e.g. "Auto Bus Transport Systems v. Bautista")
 * - Latin maxims formatted with italics (e.g. "In dubio pro operario", "Salus populi est suprema lex")
 * - Controlling statutory headers formatted with crisp bold weights
 */
function renderFormattedLegalText(text: string): React.ReactNode {
  if (!text) return null;

  // 1. Case Citation Header before a colon:
  // e.g. "Auto Bus Transport Systems, Inc. v. Bautista (G.R. No. 156367): The 3-year prescriptive..."
  const caseHeaderMatch = text.match(/^([A-Z][\w\s.,'&()-]+?\s+(?:v\.|vs\.)\s+[A-Z][\w\s.,'&()-]+?(?:\s*\([^\)]+\))?):\s*(.*)$/);
  if (caseHeaderMatch) {
    const caseCite = caseHeaderMatch[1].trim();
    const rest = caseHeaderMatch[2].trim();
    return (
      <span>
        <strong className="font-black text-slate-950 font-display">
          <em className="italic">{caseCite}</em>
        </strong>
        {': '}
        <span>{renderFormattedLegalText(rest)}</span>
      </span>
    );
  }

  // 2. Parenthetical Case Citations e.g. "(Auto Bus Transport Systems v. Bautista)" or "(Callanta v. Carnation)"
  const parenCaseRegex = /\(([A-Z][\w\s.,'&()-]+?\s+(?:v\.|vs\.)\s+[A-Z][\w\s.,'&()-]+?)\)/g;
  if (parenCaseRegex.test(text)) {
    const parts = text.split(parenCaseRegex);
    return (
      <span>
        {parts.map((part, i) => {
          if (i % 2 === 1) {
            return (
              <span key={i}>
                (<em className="italic font-bold text-slate-900">{part}</em>)
              </span>
            );
          }
          return <span key={i}>{renderFormattedLegalText(part)}</span>;
        })}
      </span>
    );
  }

  // 3. Latin Maxims (e.g. In dubio pro operario, Salus populi est suprema lex)
  const latinRegex = /\b(in dubio pro operario|salus populi est suprema lex|stare decisis|pacta sunt servanda|quantum meruit|nemo tenetur se ipsum accusare|volenti non fit injuria|damnum absque injuria)\b/gi;
  if (latinRegex.test(text)) {
    const parts = text.split(latinRegex);
    return (
      <span>
        {parts.map((part, i) => {
          if (latinRegex.test(part)) {
            return (
              <em key={i} className="italic font-bold text-slate-950">
                {part}
              </em>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  }

  return text;
}

function getPrintColumnWidths(colCount: number): string[] {
  if (colCount <= 2) return ['34%', '66%'];
  if (colCount === 3) return ['26%', '37%', '37%'];
  if (colCount === 4) return ['28%', '24%', '22%', '26%'];
  if (colCount === 5) return ['24%', '17%', '17%', '26%', '16%'];
  const equal = `${(100 / colCount).toFixed(2)}%`;
  return Array.from({ length: colCount }, () => equal);
}

export interface PaperSizeUxDetail {
  id: PrintPaperSize;
  name: string;
  shortLabel: string;
  badge: string;
  badgeColor: string;
  dimensionsMm: string;
  dimensionsInches: string;
  ratioWidth: number;
  ratioHeight: number;
  useCase: string;
  description: string;
}

export const PAPER_SIZE_UX_METADATA: Record<PrintPaperSize, PaperSizeUxDetail> = {
  a4: {
    id: 'a4',
    name: 'A4 Standard',
    shortLabel: 'A4',
    badge: 'PH DOLE / Bar Exam',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dimensionsMm: '210 × 297 mm',
    dimensionsInches: '8.27 × 11.69 in',
    ratioWidth: 21,
    ratioHeight: 29.7,
    useCase: 'International standard for DOLE syllabi, university law reviews, and Bar exam materials.',
    description: 'Crisp A4 standard page with balanced margins. Best for general Philippine labor study guides.',
  },
  letter: {
    id: 'letter',
    name: 'US Letter (Short Bond)',
    shortLabel: 'Short Bond',
    badge: 'PH Short Bond (SC)',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    dimensionsMm: '216 × 279 mm',
    dimensionsInches: '8.5 × 11.0 in',
    ratioWidth: 21.6,
    ratioHeight: 27.9,
    useCase: 'Philippine short bond paper mandated by Supreme Court En Banc rules for case digests.',
    description: 'Supreme Court standard format. Slightly wider and shorter than A4; fits common desktop printers.',
  },
  legal: {
    id: 'legal',
    name: 'US Legal (Long Bond)',
    shortLabel: 'Long Bond',
    badge: 'PH Long Bond (NLRC)',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    dimensionsMm: '216 × 356 mm',
    dimensionsInches: '8.5 × 14.0 in',
    ratioWidth: 21.6,
    ratioHeight: 35.6,
    useCase: 'Philippine long bond paper standard for formal pleadings, appeals, and NLRC position papers.',
    description: 'Extended long bond page. Provides maximum vertical space for large tables and procedural timelines.',
  },
  a3: {
    id: 'a3',
    name: 'A3 Master Poster',
    shortLabel: 'A3 Poster',
    badge: 'Wall Chart',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    dimensionsMm: '297 × 420 mm',
    dimensionsInches: '11.69 × 16.54 in',
    ratioWidth: 29.7,
    ratioHeight: 42.0,
    useCase: 'Double-sheet large format for war rooms, study desk walls, and classroom poster boards.',
    description: 'High-visibility master layout. Fits extensive statutory formulas and full regional matrices.',
  },
  a5: {
    id: 'a5',
    name: 'A5 Pocket Booklet',
    shortLabel: 'A5 Pocket',
    badge: 'Pocket Deck',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    dimensionsMm: '148 × 210 mm',
    dimensionsInches: '5.83 × 8.27 in',
    ratioWidth: 14.8,
    ratioHeight: 21.0,
    useCase: 'Compact portable booklet format for daily commute study, MRT/LRT reading, and quick recitations.',
    description: 'Half-letter pocket size. Great for reading on the go or printing as handy folded study cards.',
  },
  preview_exact: {
    id: 'preview_exact',
    name: '1:1 Screen Exact Canvas',
    shortLabel: 'Exact Screen',
    badge: 'Pixel Parity · Zero Cuts',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    dimensionsMm: 'Exact Canvas Height',
    dimensionsInches: 'Pixel-to-Pixel Mirror',
    ratioWidth: 21,
    ratioHeight: 38,
    useCase: 'Continuous uncompressed digital export that exactly mirrors the on-screen live preview canvas.',
    description: 'No page splits or forced header cuts. Captures all formulas, tables, and notes in one seamless flow.',
  },
};

const PaperSizeVisualGallery: React.FC<{
  selectedSize: PrintPaperSize;
  onSelect: (size: PrintPaperSize) => void;
  testIdPrefix?: string;
}> = ({ selectedSize, onSelect, testIdPrefix = 'drawer-paper-size' }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
      {(['a4', 'letter', 'legal', 'a3', 'a5', 'preview_exact'] as const).map((ps) => {
        const spec = PAPER_SIZE_UX_METADATA[ps];
        const isSelected = selectedSize === ps;
        return (
          <button
            key={ps}
            type="button"
            data-testid={`${testIdPrefix}-${ps}-btn`}
            onClick={() => onSelect(ps)}
            className={`group text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative ${
              isSelected
                ? 'bg-amber-400/15 border-amber-400 ring-2 ring-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.25)] text-white'
                : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-700 hover:border-slate-500 text-slate-200'
            }`}
          >
            {/* Miniature Visual Sheet Icon with proportional aspect ratio */}
            <div className="relative shrink-0 flex items-center justify-center w-10 h-14 bg-slate-950 rounded-lg border border-slate-700/80 p-1">
              <div
                className={`relative rounded-xs shadow-sm transition-all border ${
                  isSelected
                    ? 'bg-white text-slate-900 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-slate-300 text-slate-700 border-slate-400 group-hover:bg-white'
                }`}
                style={{
                  width: `${Math.round((spec.ratioWidth / 30) * 24)}px`,
                  height: `${Math.round((spec.ratioHeight / 42) * 34)}px`,
                  maxHeight: '34px',
                  maxWidth: '26px',
                }}
              >
                <div className="p-0.5 space-y-0.5 w-full h-full flex flex-col justify-between overflow-hidden opacity-70">
                  <div className={`h-0.5 rounded-xs ${isSelected ? 'bg-amber-500' : 'bg-slate-600'}`} />
                  <div className="h-0.5 bg-slate-400 rounded-xs w-3/4" />
                  <div className="h-0.5 bg-slate-400 rounded-xs w-5/6" />
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-1.5">
                <span className={`text-xs font-black ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                  {spec.name}
                </span>
                {isSelected ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded-full border border-amber-400/40">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">Select</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${spec.badgeColor}`}>
                  {spec.badge}
                </span>
                <span className="text-[10px] font-mono text-emerald-300 font-semibold">
                  {spec.dimensionsMm}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  ({spec.dimensionsInches})
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug pt-0.5">
                {spec.useCase}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export const PrintStudyGuideModal: React.FC<PrintStudyGuideModalProps> = ({
  isOpen,
  onClose,
  completedTopicIds,
  coins,
  studyNotes,
  initialMode,
  playerName = 'Labor Scholar Hero',
  equippedAvatar = 'mario',
  loginStreak = 1,
  unlockedAchievementsCount = 0,
  totalAchievementsCount = 12,
  quizRunsCompleted = 0,
  studiedSeconds = 0,
  appStudyFont,
  activeAppTheme,
}) => {
  const [includeGroupMembers, setIncludeGroupMembers] = useState(true);
  const [includeProgress, setIncludeProgress] = useState(true);
  const [includeMultipliers, setIncludeMultipliers] = useState(true);
  const [includeRegionalWages, setIncludeRegionalWages] = useState(true);
  const [includeLeavesMatrix, setIncludeLeavesMatrix] = useState(true);
  const [includePersonalNotes, setIncludePersonalNotes] = useState(true);
  const [matricesOnlyMode, setMatricesOnlyMode] = useState(false);
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [isLivePreviewMode] = useState(true);
  const [layoutPreset, setLayoutPreset] = useState<
    'custom_builder' | 'compact_cheatsheet' | 'comprehensive_syllabus'
  >('custom_builder');
  const [paperMargins, setPaperMargins] = useState<'compact' | 'standard' | 'spacious'>('standard');
  const [paperSize, setPaperSize] = useState<PrintPaperSize>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mario_print_paper_size_v1');
      if (saved && saved in PRINT_PAPER_SPECS && saved !== 'preview_exact') {
        return saved as PrintPaperSize;
      }
    }
    return 'a4';
  });

  const [showPaperSizePopover, setShowPaperSizePopover] = useState<boolean>(false);
  const paperSizeMenuRef = useRef<HTMLDivElement | null>(null);

  const handlePaperSizeChange = (newSize: PrintPaperSize) => {
    marioAudio.playClick();
    setPaperSize(newSize);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mario_print_paper_size_v1', newSize);
      } catch {}
    }
  };
  const [includeCheckboxes, setIncludeCheckboxes] = useState(true);
  const [includeHypotheticals, setIncludeHypotheticals] = useState(true);
  const [fontSizeScale, setFontSizeScale] = useState<'small' | 'normal' | 'large'>('normal');
  const [zoomPreset, setZoomPreset] = useState<PreviewZoomPreset>('fit');
  const [showVisualSwatches, setShowVisualSwatches] = useState<boolean>(false);
  const [swatchViewMode, setSwatchViewMode] = useState<'themes' | 'fonts'>('themes');
  const [themeCategoryFilter, setThemeCategoryFilter] = useState<string>('All');
  const [fontCategoryFilter, setFontCategoryFilter] = useState<string>('All');
  const [twoColumnLayout, setTwoColumnLayout] = useState(false);
  const [includeWatermark, setIncludeWatermark] = useState(false);
  const [includeFormulasCheatSheet, setIncludeFormulasCheatSheet] = useState(true);
  const [includeExecutiveMarioSummary, setIncludeExecutiveMarioSummary] = useState(true);
  const [includeTwoNoticeChecklist, setIncludeTwoNoticeChecklist] = useState(true);
  const [includeFourFoldControlTest, setIncludeFourFoldControlTest] = useState(true);
  const [includeRetirementFormulaBox, setIncludeRetirementFormulaBox] = useState(true);
  const [includeLatinMaxims, setIncludeLatinMaxims] = useState(true);
  const [includeHonorPledge, setIncludeHonorPledge] = useState(true);
  const [pageOrientation, setPageOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [certOrientation, setCertOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [documentMode, setDocumentMode] = useState<PrintModalDocumentMode>(
    initialMode || 'summary'
  );
  const [certificateHonors, setCertificateHonors] = useState<string>(
    'Summa Cum Laude · Super Star Rank'
  );
  const [candidateName, setCandidateName] = useState('');
  const [passportProfile, setPassportProfile] = useState<PassportProfileData>(() =>
    loadPassportProfile(candidateName || playerName)
  );

  // Synchronize passport bearer names if candidateName is modified
  useEffect(() => {
    if (candidateName && candidateName.trim()) {
      setPassportProfile((prev) => {
        const { givenNames, surname } = splitCandidateName(candidateName);
        const updated: PassportProfileData = {
          ...prev,
          fullName: candidateName.trim(),
          surname: prev.surname && prev.surname !== 'CORPUZ' && prev.surname !== 'CRUZ' ? prev.surname : surname,
          givenNames: prev.givenNames && prev.givenNames !== 'MATTHEW CESAR' && prev.givenNames !== 'JUAN' ? prev.givenNames : givenNames,
        };
        savePassportProfile(updated);
        return updated;
      });
    }
  }, [candidateName]);

  const handleUpdatePassport = (field: keyof PassportProfileData, value: string) => {
    setPassportProfile((prev) => {
      const updated: PassportProfileData = { ...prev, [field]: value } as PassportProfileData;
      if (field === 'fullName') {
        const { givenNames, surname } = splitCandidateName(value);
        updated.givenNames = givenNames;
        updated.surname = surname;
      }
      savePassportProfile(updated);
      return updated;
    });
  };
  const [simDailyWage, setSimDailyWage] = useState<number>(645);
  const [showMultiplierSim, setShowMultiplierSim] = useState<boolean>(false);
  const [pdfDownloadedNotice, setPdfDownloadedNotice] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [downloadModeLabel, setDownloadModeLabel] = useState<string>('');
  const [mobileStyleBarOpen, setMobileStyleBarOpen] = useState(false);
  const [isMobilePreviewFullscreen, setIsMobilePreviewFullscreen] = useState(false);
  const [formatOptions, setFormatOptions] = useState<PrintGuideFormatOptions>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('mario_print_format_options_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...DEFAULT_PRINT_FORMAT_OPTIONS, ...parsed };
        }
      } catch {}
    }
    return DEFAULT_PRINT_FORMAT_OPTIONS;
  });
  const [selectedWorlds, setSelectedWorlds] = useState<string[]>(() =>
    WORLDS_METADATA.map((w) => w.id)
  );

  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const sheetContentRef = useRef<HTMLDivElement | null>(null);
  const [stageWidthPx, setStageWidthPx] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.min(1100, window.innerWidth - 24) : 960
  );
  const [stageHeightPx, setStageHeightPx] = useState<number>(() =>
    typeof window !== 'undefined' ? Math.max(320, window.innerHeight - 190) : 640
  );
  const [sheetNaturalHeightPx, setSheetNaturalHeightPx] = useState<number>(0);
  useEffect(() => {
    if (isOpen && initialMode) {
      setDocumentMode(initialMode);
      if (initialMode === 'passport' && activeAppTheme) {
        const mapped = resolveExtendedPrintTheme(activeAppTheme);
        if (mapped) {
          setFormatOptions((prev) => ({
            ...prev,
            colorAccent: mapped.id as PrintGuideFormatOptions['colorAccent'],
          }));
        }
      }
    }
  }, [isOpen, initialMode, activeAppTheme]);

  // Reset scroll container to top whenever opening or switching document modes
  useEffect(() => {
    if (!isOpen) return;
    if (previewScrollRef.current) {
      previewScrollRef.current.scrollTop = 0;
      previewScrollRef.current.scrollLeft = 0;
    }
  }, [isOpen, documentMode]);

  // Allow Escape key to close Print Studio cleanly and Ctrl+P / Cmd+P to invoke clean print
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handleDownloadPdf(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, documentMode, certOrientation, pageOrientation, formatOptions.fontStyle]);

  useEffect(() => {
    if (!showPaperSizePopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (paperSizeMenuRef.current && !paperSizeMenuRef.current.contains(e.target as Node)) {
        setShowPaperSizePopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPaperSizePopover]);

  useEffect(() => {
    if (!isOpen) return;
    const scrollEl = previewScrollRef.current;
    if (!scrollEl) return;
    const measureStage = () => {
      if (scrollEl.clientWidth > 0) {
        setStageWidthPx(scrollEl.clientWidth);
      }
      if (scrollEl.clientHeight > 0) {
        setStageHeightPx(scrollEl.clientHeight);
      }
    };
    measureStage();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measureStage);
      ro.observe(scrollEl);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', measureStage);
    return () => window.removeEventListener('resize', measureStage);
  }, [isOpen, showControlPanel, showVisualSwatches, mobileStyleBarOpen, isMobilePreviewFullscreen, documentMode]);

  useEffect(() => {
    if (!isOpen) return;
    const sheetEl = sheetContentRef.current;
    if (!sheetEl) return;
    const measureSheet = () => {
      const childEl = sheetEl.firstElementChild as HTMLElement | null;
      const h = Math.max(
        sheetEl.offsetHeight,
        sheetEl.scrollHeight,
        childEl?.offsetHeight || 0,
        childEl?.scrollHeight || 0
      );
      if (h > 0) {
        setSheetNaturalHeightPx(h);
      }
    };
    measureSheet();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measureSheet);
      ro.observe(sheetEl);
      return () => ro.disconnect();
    }
  }, [
    isOpen,
    documentMode,
    pageOrientation,
    formatOptions,
    selectedWorlds,
    matricesOnlyMode,
    paperMargins,
    fontSizeScale,
    twoColumnLayout,
    includeGroupMembers,
    includeProgress,
    includeMultipliers,
    includeRegionalWages,
    includeLeavesMatrix,
    includePersonalNotes,
    includeFormulasCheatSheet,
    includeFourFoldControlTest,
    includeTwoNoticeChecklist,
    includeRetirementFormulaBox,
    includeLatinMaxims,
    includeHonorPledge,
    candidateName,
    certificateHonors,
  ]);

  useEffect(() => {
    if (!isOpen) {
      clearPrintPageRule();
      return;
    }
    const resolvedExtFont = resolveExtendedPrintFont(formatOptions.fontStyle);
    const fontStack = resolvedExtFont.cssFontFamily;
    if (documentMode === 'certificate') {
      applyPrintPageRule(certOrientation, '6mm', fontStack, paperSize);
    } else if (
      documentMode === 'scorecard' ||
      documentMode === 'diploma' ||
      documentMode === 'bowser_victory' ||
      documentMode === 'passport'
    ) {
      applyPrintPageRule('landscape', '5mm 6mm', fontStack, paperSize);
    } else if (documentMode === 'summary' || documentMode === 'cheatsheet') {
      applyPrintPageRule('portrait', '4mm 6mm', fontStack, paperSize);
    } else {
      applyPrintPageRule(
        pageOrientation,
        pageOrientation === 'landscape' ? '8mm 10mm' : '10mm 12mm',
        fontStack,
        paperSize
      );
    }
    return () => {
      clearPrintPageRule();
    };
  }, [isOpen, documentMode, pageOrientation, certOrientation, formatOptions.fontStyle, paperSize]);

  useEffect(() => {
    const handleBeforePrint = () => {
      const isLandscape =
        (documentMode === 'certificate' && certOrientation === 'landscape') ||
        documentMode === 'scorecard' ||
        documentMode === 'diploma' ||
        documentMode === 'bowser_victory' ||
        documentMode === 'passport' ||
        ((documentMode === 'guide' || documentMode === 'summary') && pageOrientation === 'landscape');
      const resolvedExtFont = resolveExtendedPrintFont(formatOptions.fontStyle);
      const fontStack = resolvedExtFont.cssFontFamily || getPrintFontCssStack(formatOptions.fontStyle);
      applyPrintPageRule(
        isLandscape ? 'landscape' : 'portrait',
        isLandscape ? '5mm 6mm' : '6mm 8mm',
        fontStack,
        paperSize
      );
      document.body.setAttribute('data-print-orientation', isLandscape ? 'landscape' : 'portrait');
      document.body.classList.add('mario-printing-preview');
      if (documentMode === 'certificate') {
        document.body.classList.add('printing-certificate-only');
      } else if (documentMode === 'scorecard') {
        document.body.classList.add('printing-scorecard-only');
      } else if (documentMode === 'diploma') {
        document.body.classList.add('printing-diploma-only');
      } else if (documentMode === 'cheatsheet') {
        document.body.classList.add('printing-cheatsheet-only');
      } else if (documentMode === 'bowser_victory') {
        document.body.classList.add('printing-bowser-victory-only');
      } else if (documentMode === 'passport') {
        document.body.classList.add('printing-passport-only');
      } else if (documentMode === 'summary') {
        document.body.classList.add('printing-summary-only');
      } else {
        document.body.classList.add('printing-study-guide-only');
      }
    };
    const handleAfterPrint = () => {
      document.body.removeAttribute('data-print-orientation');
      document.body.classList.remove(
        'mario-printing-preview',
        'printing-certificate-only',
        'printing-scorecard-only',
        'printing-diploma-only',
        'printing-cheatsheet-only',
        'printing-bowser-victory-only',
        'printing-passport-only',
        'printing-summary-only',
        'printing-study-guide-only'
      );
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      document.body.removeAttribute('data-print-orientation');
      document.body.classList.remove(
        'mario-printing-preview',
        'printing-certificate-only',
        'printing-scorecard-only',
        'printing-diploma-only',
        'printing-cheatsheet-only',
        'printing-bowser-victory-only',
        'printing-passport-only',
        'printing-summary-only',
        'printing-study-guide-only'
      );
    };
  }, [documentMode, certOrientation, pageOrientation, formatOptions.fontStyle, paperSize]);

  // Set root CSS variable for print and force browser font rasterization
  useEffect(() => {
    if (!isOpen) return;
    if (typeof document !== 'undefined') {
      const activeExtFont = resolveExtendedPrintFont(formatOptions.fontStyle);
      const fontStack = activeExtFont.cssFontFamily;
      document.documentElement.style.setProperty('--print-active-font', fontStack);
      document.body.style.setProperty('--print-active-font', fontStack);
      if (document.fonts && activeExtFont.primaryFamily) {
        try {
          const quoted = `"${activeExtFont.primaryFamily.replace(/"/g, '')}"`;
          document.fonts.load(`400 16px ${quoted}`);
          document.fonts.load(`600 16px ${quoted}`);
          document.fonts.load(`700 16px ${quoted}`);
          document.fonts.load(`800 16px ${quoted}`);
        } catch {}
      }
    }
  }, [isOpen, formatOptions.fontStyle]);

  const resolvedNotes =
    studyNotes ??
    (typeof window !== 'undefined' ? loadStudyNotes(window.localStorage) : []);

  const totalTopics = ALL_LAW_TOPICS.length;
  const completedCount = completedTopicIds.length;
  const overallPercent = Math.min(
    100,
    Math.round((completedCount / Math.max(1, totalTopics)) * 100)
  );

  const filteredTopics = filterTopicsForPrintGuide(
    ALL_LAW_TOPICS,
    selectedWorlds,
    completedTopicIds,
    formatOptions.hideCompletedTopics
  );

  const currentDate = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const studiedMinutes = Math.max(1, Math.round(studiedSeconds / 60));
  const studyDurationFormatted =
    studiedMinutes >= 60
      ? `${Math.floor(studiedMinutes / 60)}h ${studiedMinutes % 60}m`
      : `${studiedMinutes} min`;
  const heroDisplayName =
    equippedAvatar.charAt(0).toUpperCase() + equippedAvatar.slice(1).replace(/_/g, ' ');
  const heroRankLabel =
    overallPercent >= 90
      ? 'Super Star Labor Grandmaster'
      : overallPercent >= 65
      ? 'Fire Flower Statutory Counsel'
      : overallPercent >= 35
      ? 'Super Mushroom Workplace Advocate'
      : 'Rising Mushroom Kingdom Scholar';

  const scoreCardWorldBreakdown = WORLDS_METADATA.map((w) => {
    const wt = ALL_LAW_TOPICS.filter((t) => t.worldId === w.id);
    const done = wt.filter((t) => completedTopicIds.includes(t.id)).length;
    const pct = Math.round((done / Math.max(1, wt.length)) * 100);
    return {
      worldNumber: w.worldNumber,
      shortTitle: w.shortTitle,
      completed: done,
      total: wt.length,
      percent: pct,
    };
  });

  const buildCurrentScoreCardParams = (): ScoreCardPdfParams => ({
    playerName: candidateName.trim() || playerName || 'Labor Scholar Hero',
    heroName: heroDisplayName,
    heroRank: heroRankLabel,
    completedCount,
    totalTopics,
    coins,
    loginStreak,
    unlockedAchievementsCount,
    totalAchievementsCount,
    quizRunsCompleted,
    studyDurationFormatted,
    colorAccent: formatOptions.colorAccent,
    fontStyle: formatOptions.fontStyle,
    worldBreakdown: scoreCardWorldBreakdown,
  });

  if (!isOpen) return null;

  const toggleWorld = (worldId: string) => {
    marioAudio.playClick();
    setSelectedWorlds((prev) =>
      prev.includes(worldId) ? prev.filter((id) => id !== worldId) : [...prev, worldId]
    );
  };

  const updateFormat = <K extends keyof PrintGuideFormatOptions>(
    key: K,
    value: PrintGuideFormatOptions[K]
  ) => {
    marioAudio.playClick();
    setFormatOptions((prev) => {
      const next = { ...prev, [key]: value };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('mario_print_format_options_v1', JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  const getRenderedPreviewDimensionsMm = (): [number, number] | undefined => {
    if (!sheetContentRef.current) return undefined;
    const el = sheetContentRef.current;
    const pxToMm = 0.26458333;
    const wMm = Number((Math.max(el.scrollWidth, el.offsetWidth, 794) * pxToMm).toFixed(2));
    const hMm = Number((Math.max(el.scrollHeight, el.offsetHeight, 1123) * pxToMm).toFixed(2));
    return [wMm, hMm];
  };

  const handlePrintPage = async () => {
    marioAudio.playCoin();
    if (typeof window !== 'undefined') {
      const isLandscape =
        (documentMode === 'certificate' && certOrientation === 'landscape') ||
        documentMode === 'scorecard' ||
        documentMode === 'diploma' ||
        documentMode === 'bowser_victory' ||
        documentMode === 'passport' ||
        ((documentMode === 'guide' || documentMode === 'summary') && pageOrientation === 'landscape');
      const resolvedExtFont = resolveExtendedPrintFont(formatOptions.fontStyle);
      const activeFont = resolvedExtFont.cssFontFamily || getPrintFontCssStack(formatOptions.fontStyle);

      let targetMode: PrintIsolationMode = 'study-guide';
      if (documentMode === 'certificate') targetMode = 'certificate';
      else if (documentMode === 'scorecard') targetMode = 'scorecard';
      else if (documentMode === 'diploma') targetMode = 'diploma';
      else if (documentMode === 'cheatsheet') targetMode = 'cheatsheet';
      else if (documentMode === 'bowser_victory') targetMode = 'bowser-victory';
      else if (documentMode === 'passport') targetMode = 'passport';
      else if (documentMode === 'summary') targetMode = 'summary';
      else targetMode = 'study-guide';

      await triggerPrintWithDocumentFont({
        orientation: isLandscape ? 'landscape' : 'portrait',
        margin: isLandscape ? '5mm 6mm' : '6mm 8mm',
        fontStack: activeFont,
        paperSize,
        mode: targetMode,
      });
    }
  };

  const handleDownloadPdf = async (forceVector: boolean = false) => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setDownloadModeLabel(forceVector ? 'Vector TrueFont' : 'Exact Visual');

    const previewElement =
      (sheetContentRef.current?.firstElementChild as HTMLElement) ||
      sheetContentRef.current;

    let filename = 'Super-Mario-Labor-Law-Reviewer-Master.pdf';
    let docTitle = 'Philippine Labor Standards Master Reviewer';
    const safePlayerName = (candidateName.trim() || playerName || 'Scholar').replace(/\s+/g, '_');

    if (documentMode === 'summary') {
      filename = 'Labor-Standards-One-Page-Master-Summary.pdf';
      docTitle = 'One-Page Philippine Labor Standards Master Sheet';
      marioAudio.playCoin();
    } else if (documentMode === 'certificate') {
      filename = `Official-Labor-Certificate-${safePlayerName}-${certOrientation.toUpperCase()}.pdf`;
      docTitle = 'Official Philippine Labor Law Certificate of Mastery';
      marioAudio.playQuizComplete();
    } else if (documentMode === 'diploma') {
      filename = `Royal-Grand-Master-Juris-Diploma-${safePlayerName}.pdf`;
      docTitle = 'Royal Grand Master Juris Diploma in Philippine Labor Standards';
      marioAudio.playQuizComplete();
    } else if (documentMode === 'scorecard') {
      filename = `Labor-Standards-Hero-ScoreCard-${safePlayerName}.pdf`;
      docTitle = 'Super Mario Labor Law Official Hero Score Card';
      marioAudio.playQuizComplete();
    } else if (documentMode === 'cheatsheet') {
      filename = 'Labor-Standards-Wage-Overtime-Multipliers-Table.pdf';
      docTitle = 'Philippine Labor Standards Statutory Multipliers Cheatsheet';
      marioAudio.playCoin();
    } else if (documentMode === 'bowser_victory') {
      filename = `Bowser-Courtroom-Victory-Commendation-${safePlayerName}.pdf`;
      docTitle = 'Bowser Courtroom Victory Order of Labor Advocacy Excellence';
      marioAudio.playOneUp();
    } else if (documentMode === 'passport') {
      filename = `Philippine-Labor-Jurist-Passport-${safePlayerName}.pdf`;
      docTitle = 'Republic of the Philippines Official Labor Jurist Passport';
      marioAudio.playOneUp();
    } else {
      filename = `Philippine-Labor-Standards-Reviewer-${pageOrientation.toUpperCase()}.pdf`;
      docTitle = 'Philippine Labor Standards Complete Reviewer Compendium';
      marioAudio.playCoin();
    }

    try {
      const targetElementId =
        documentMode === 'summary'
          ? 'one-page-summary-sheet'
          : documentMode === 'certificate'
          ? 'official-labor-certificate'
          : documentMode === 'diploma'
          ? 'royal-juris-diploma-sheet'
          : documentMode === 'scorecard'
          ? 'official-scorecard-sheet'
          : documentMode === 'cheatsheet'
          ? 'statutory-cheatsheet-sheet'
          : documentMode === 'bowser_victory'
          ? 'bowser-victory-sheet'
          : documentMode === 'passport'
          ? 'labor-jurist-passport-sheet'
          : 'printable-study-guide';

      let exactTarget: HTMLElement | null =
        document.getElementById(targetElementId) ||
        (sheetContentRef.current?.querySelector(`#${targetElementId}`) as HTMLElement) ||
        previewElement ||
        sheetContentRef.current;

      // Single-page documents (passport, diploma, certificate, scorecard, summary, cheatsheet, bowser_victory)
      // ALWAYS use the 1:1 live preview visual capture engine to print the exact preview with zero cropping!
      // Multi-page Reviewer (documentMode === 'guide') uses downloadTrueFontStudyReviewerPdfAsync for the 40+ page book.
      const isSinglePageMode = documentMode !== 'guide';

      if (isSinglePageMode) {
        if (!exactTarget) {
          throw new Error('Preview sheet element could not be found for export.');
        }

        const isLandscapeDoc =
          (documentMode === 'certificate' && certOrientation === 'landscape') ||
          documentMode === 'scorecard' ||
          documentMode === 'diploma' ||
          documentMode === 'bowser_victory' ||
          documentMode === 'passport' ||
          (documentMode === 'summary' && pageOrientation === 'landscape');

        const bytes = await downloadExactPreviewVisualPdfAsync(
          exactTarget,
          filename,
          docTitle,
          {
            orientation:
              isLandscapeDoc
                ? 'landscape'
                : documentMode === 'cheatsheet'
                ? 'portrait'
                : pageOrientation,
            paperSize: paperSize,
            fontStyle: formatOptions.fontStyle,
            colorAccent: formatOptions.colorAccent,
          }
        );
        if (bytes) {
          setPdfDownloadedNotice(true);
          window.setTimeout(() => setPdfDownloadedNotice(false), 2600);
        }
        return;
      }

      // Multi-Page Comprehensive Study Reviewer Compendium
      await downloadTrueFontStudyReviewerPdfAsync({
        orientation: pageOrientation,
        candidateName: candidateName.trim() || undefined,
        completedTopicIds,
        topics: filteredTopics,
        allTopics: ALL_LAW_TOPICS,
        selectedWorlds,
        includeGroupMembers,
        includeProgress,
        includeMultipliers,
        includeRegionalWages,
        includeLeavesMatrix,
        includePersonalNotes,
        includeBarTips: formatOptions.includeBarTips,
        includeLegalCitations: formatOptions.includeLegalCitations,
        generateToc: formatOptions.generateToc ?? true,
        matricesOnlyMode,
        studyNotes: resolvedNotes,
        colorAccent: formatOptions.colorAccent,
          fontStyle: formatOptions.fontStyle,
          paperMargins,
          fontSizeScale,
          paperSize: paperSize === 'preview_exact' ? 'a4' : paperSize,
          includeWatermark,
          watermarkText: formatOptions.watermarkText,
          includeFormulasCheatSheet,
          includeFourFoldControlTest,
          includeTwoNoticeChecklist,
          includeRetirementFormulaBox,
          includeHonorPledge,
          includeExecutiveMarioSummary,
          includeLatinMaxims,
          pageBreakPerModule: formatOptions.pageBreakPerModule,
        });
        setPdfDownloadedNotice(true);
        window.setTimeout(() => setPdfDownloadedNotice(false), 2600);
      } finally {
      setIsGeneratingPdf(false);
    }
  };

  const isCompact = formatOptions.compactLayout;
  const activeThemeCatalog = getPrintThemeCatalogItem(formatOptions.colorAccent);
  const activeFontCatalog = getPrintFontCatalogItem(formatOptions.fontStyle);
  const activeExtendedTheme = resolveExtendedPrintTheme(formatOptions.colorAccent);
  const activeExtendedFont = resolveExtendedPrintFont(formatOptions.fontStyle);
  const activeCssFontStack = activeExtendedFont.cssFontFamily;

  // Mathematically guaranteed text contrast (eliminates white-on-white / light-on-light in all themes like Lavender)
  const guaranteedHeaderTextColor = getContrastingTextColor(
    activeExtendedTheme.headerBgHex,
    activeExtendedTheme.headerTextHex
  );
  const guaranteedTableHeadTextColor = getContrastingTextColor(
    activeExtendedTheme.tableHeadBgHex,
    activeExtendedTheme.headerTextHex
  );

  const activeSheetDynamicStyle: React.CSSProperties = {
    '--print-active-font': activeCssFontStack,
    fontFamily: activeCssFontStack,
    backgroundColor:
      activeExtendedTheme.id === 'ink_saver_bw'
        ? '#FFFFFF'
        : activeExtendedTheme.tableStripeBgHex || '#FFFFFF',
    borderColor: activeExtendedTheme.borderHex,
    color: activeExtendedTheme.bodyTextHex,
  } as React.CSSProperties;

  const bodyFontClass = activeFontCatalog.previewClass;
  const headingBorderClass = activeThemeCatalog.headingBorderClass;
  const subtleBoxClass = activeThemeCatalog.subtleBoxClass;
  const tableHeaderClass = activeThemeCatalog.tableHeaderClass;
  const summaryBannerHeaderClass = activeThemeCatalog.summaryBannerHeaderClass;
  const summaryPaperBgClass = activeThemeCatalog.summaryPaperBgClass;
  const worldBannerClass = activeThemeCatalog.worldBannerClass;
  const zebraRowClass = activeThemeCatalog.zebraRowClass;
  const tipBoxClass = activeThemeCatalog.tipBoxClass;
  const certThemeClasses = activeThemeCatalog.certClasses;

  const isLandscapeDocument =
    (documentMode === 'certificate' && certOrientation === 'landscape') ||
    documentMode === 'scorecard' ||
    documentMode === 'diploma' ||
    documentMode === 'bowser_victory' ||
    documentMode === 'passport' ||
    (documentMode === 'guide' && pageOrientation === 'landscape');

  const stageMetrics = computeA4PreviewStageMetrics({
    containerWidthPx: Math.max(260, stageWidthPx - 16),
    containerHeightPx: stageHeightPx,
    fitWholePageVertically: false,
    isLandscape: isLandscapeDocument,
    zoomPreset,
  });

  const estimatedPageCount =
    documentMode === 'summary' ||
    documentMode === 'certificate' ||
    documentMode === 'diploma' ||
    documentMode === 'scorecard' ||
    documentMode === 'cheatsheet' ||
    documentMode === 'bowser_victory' ||
    documentMode === 'passport'
      ? 1
      : Math.max(
          2,
          (includeMultipliers ? 1 : 0) +
            (includeRegionalWages ? 1 : 0) +
            (includeLeavesMatrix ? 1 : 0) +
            Math.ceil((matricesOnlyMode ? filteredTopics.length * 0.45 : filteredTopics.length * 0.85))
        );

  const handleJumpToSection = (sectionId: string) => {
    marioAudio.playClick();
    window.requestAnimationFrame(() => {
      const target = document.getElementById(sectionId);
      const container = previewScrollRef.current;
      if (target && container) {
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const nextTop = container.scrollTop + (targetRect.top - containerRect.top) - 12;
        container.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' });
      }
    });
  };

  const handleSelectPreset = (
    preset: 'custom_builder' | 'compact_cheatsheet' | 'comprehensive_syllabus'
  ) => {
    setLayoutPreset(preset);
    marioAudio.playCoin();
    if (preset === 'compact_cheatsheet') {
      setFormatOptions((prev) => ({
        ...prev,
        compactLayout: true,
        includeBarTips: true,
        includeLegalCitations: false,
        pageBreakPerWorld: true,
        pageBreakPerModule: false,
      }));
      setPaperMargins('compact');
      setFontSizeScale('small');
      setMatricesOnlyMode(false);
    } else if (preset === 'comprehensive_syllabus') {
      setFormatOptions((prev) => ({
        ...prev,
        compactLayout: false,
        includeBarTips: true,
        includeLegalCitations: true,
        pageBreakPerWorld: true,
        pageBreakPerModule: true,
      }));
      setPaperMargins('standard');
      setFontSizeScale('normal');
      setMatricesOnlyMode(false);
    } else {
      setPaperMargins('standard');
      setFontSizeScale('normal');
    }
  };

  const marginPaddingClass =
    paperMargins === 'spacious'
      ? 'p-12'
      : paperMargins === 'compact'
      ? 'p-6'
      : isCompact
      ? 'p-7'
      : 'p-9';

  const fontScaleClass =
    fontSizeScale === 'large'
      ? 'text-lg leading-relaxed'
      : fontSizeScale === 'small'
      ? 'text-[13px] leading-relaxed'
      : isCompact
      ? 'text-sm leading-relaxed'
      : 'text-[15px] leading-relaxed';

  return (
    <div
      id="print-guide-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Print Study Guide and PDF Generator"
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/85 overflow-y-auto print:static print:p-0 print:bg-white print:overflow-visible print:select-text"
    >
      <div className="bg-slate-900 text-white w-full h-[100dvh] max-h-[100dvh] rounded-none sm:h-auto sm:max-h-[94vh] max-w-6xl sm:rounded-3xl border-0 sm:border-4 border-slate-950 shadow-[0_16px_40px_rgba(0,0,0,0.9)] overflow-hidden my-auto flex flex-col pt-[max(0.4rem,env(safe-area-inset-top))] pb-[max(0.4rem,env(safe-area-inset-bottom))] sm:pt-0 sm:pb-0 print:max-h-none print:h-auto print:max-w-full print:rounded-none print:border-0 print:shadow-none print:bg-white print:text-black print:overflow-visible">
        {/* Modal Top Bar — Direct PDF Export & Whole-Document Preview Studio */}
        {/* Modal Top Bar — Direct PDF Export & Whole-Document Preview Studio */}
        <div className={`bg-[#0f172a] px-3 sm:px-5 py-2 sm:py-3 border-b-2 border-slate-700 space-y-2 flex-shrink-0 print:hidden ${isMobilePreviewFullscreen ? 'hidden sm:block' : ''}`}>
          {/* Header Row: Document Title + Mobile Fullscreen Toggle + Dedicated Close Button */}
          <div className="flex items-center justify-between gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center text-slate-950 shadow-[0_2px_0_#000] shrink-0">
                <FileDown className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[8.5px] sm:text-[10px] font-black uppercase text-amber-400 font-mario block leading-tight truncate">
                  PDF &amp; PRINT STUDIO
                </span>
                <h2 className="text-xs sm:text-base font-black text-white font-display truncate leading-tight">
                  {documentMode === 'summary'
                    ? '1-PAGE MASTER SUMMARY'
                    : documentMode === 'certificate'
                    ? certOrientation === 'portrait'
                      ? 'PORTRAIT CERTIFICATE'
                      : 'LANDSCAPE CERTIFICATE'
                    : documentMode === 'scorecard'
                    ? 'HERO SCORE CARD'
                    : documentMode === 'diploma'
                    ? 'GRAND JURIS DIPLOMA'
                    : documentMode === 'cheatsheet'
                    ? 'STATUTORY MULTIPLIERS'
                    : documentMode === 'bowser_victory'
                    ? 'BOSS VICTORY ORDER'
                    : documentMode === 'passport'
                    ? 'PHILIPPINE JURIST PASSPORT'
                    : 'COMPREHENSIVE LABOR REVIEWER'}
                </h2>
                <div className="hidden sm:flex flex-wrap items-center gap-1.5 mt-0.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/60 text-[9px] font-mono text-emerald-300 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Lossless 1:1 Preview · Uncompressed Master Quality · Zero Layout Cuts</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Fullscreen Preview Toggle Button */}
              <button
                type="button"
                data-testid="toggle-mobile-fullscreen-preview-btn"
                onClick={() => {
                  marioAudio.playClick();
                  setIsMobilePreviewFullscreen((prev) => !prev);
                }}
                className="min-h-[36px] px-2 sm:px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border border-black inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs active:translate-y-0.5"
                title={isMobilePreviewFullscreen ? "Exit full preview mode" : "Expand preview without toolbar cover"}
              >
                {isMobilePreviewFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="hidden sm:inline">{isMobilePreviewFullscreen ? "Exit Preview" : "Full Preview"}</span>
                <span className="sm:hidden">{isMobilePreviewFullscreen ? "Exit" : "Preview"}</span>
              </button>

              <button
                type="button"
                data-testid="close-print-studio-top-btn"
                onClick={onClose}
                aria-label="Close Print Study Guide"
                className="min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-slate-200 hover:text-white cursor-pointer shrink-0 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Action Row: Mode Switcher Ribbon (Responsive Grid, Zero Left-Right Scrolling) */}
          <div className="flex flex-col gap-2">
            {/* 8-Mode Clean Grid Ribbon (4 cols on mobile, 8 cols on desktop) */}
            <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-1 p-1 bg-slate-800/95 rounded-xl border border-slate-700 text-xs w-full">
              <button
                type="button"
                data-testid="toggle-summary-mode-btn"
                title="1-Page Master Summary"
                onClick={() => {
                  setDocumentMode('summary');
                  marioAudio.playCoin();
                }}
                className={`min-h-[32px] sm:min-h-[34px] w-full min-w-0 overflow-hidden px-1 sm:px-2 py-1 rounded-lg font-black cursor-pointer transition-colors inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs ${
                  documentMode === 'summary'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">1-Page</span>
              </button>
              <button
                type="button"
                data-testid="toggle-guide-mode-btn"
                title="Comprehensive Labor Reviewer"
                onClick={() => {
                  setDocumentMode('guide');
                  marioAudio.playClick();
                }}
                className={`min-h-[32px] sm:min-h-[34px] w-full min-w-0 overflow-hidden px-1 sm:px-2 py-1 rounded-lg font-black cursor-pointer transition-colors inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs ${
                  documentMode === 'guide'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <BookOpenCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">Reviewer</span>
              </button>
              <button
                type="button"
                data-testid="toggle-certificate-mode-btn"
                title="Juris Master Certificate"
                onClick={() => {
                  setDocumentMode('certificate');
                  marioAudio.playQuizComplete();
                }}
                className={`min-h-[32px] sm:min-h-[34px] w-full min-w-0 overflow-hidden px-1 sm:px-2 py-1 rounded-lg font-black cursor-pointer transition-colors inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs ${
                  documentMode === 'certificate'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline truncate">Certificate</span>
                <span className="sm:hidden truncate">Cert</span>
              </button>
              <button
                type="button"
                data-testid="toggle-diploma-mode-btn"
                title="Royal Grand Master Juris Diploma"
                onClick={() => {
                  setDocumentMode('diploma');
                  marioAudio.playQuizComplete();
                }}
                className={`min-h-[32px] sm:min-h-[34px] w-full min-w-0 overflow-hidden px-1 sm:px-2 py-1 rounded-lg font-black cursor-pointer transition-colors inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs ${
                  documentMode === 'diploma'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline truncate">Grand Diploma</span>
                <span className="sm:hidden truncate">Diploma</span>
              </button>
              <button
                type="button"
                data-testid="toggle-scorecard-mode-btn"
                title="Labor Hero Score Card"
                onClick={() => {
                  setDocumentMode('scorecard');
                  marioAudio.playCoin();
                }}
                className={`min-h-[32px] sm:min-h-[34px] w-full min-w-0 overflow-hidden px-1 sm:px-2 py-1 rounded-lg font-black cursor-pointer transition-colors inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs ${
                  documentMode === 'scorecard'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline truncate">Score Card</span>
                <span className="sm:hidden truncate">Score</span>
              </button>
              <button
                type="button"
                data-testid="toggle-cheatsheet-mode-btn"
                title="Statutory Multipliers & DOLE Rates"
                onClick={() => {
                  setDocumentMode('cheatsheet');
                  marioAudio.playCoin();
                }}
                className={`min-h-[32px] sm:min-h-[34px] w-full min-w-0 overflow-hidden px-1 sm:px-2 py-1 rounded-lg font-black cursor-pointer transition-colors inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs ${
                  documentMode === 'cheatsheet'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Calculator className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline truncate">Multipliers</span>
                <span className="sm:hidden truncate">Rates</span>
              </button>
              <button
                type="button"
                data-testid="toggle-bowser-victory-mode-btn"
                title="Boss Victory Order of Dismissal"
                onClick={() => {
                  setDocumentMode('bowser_victory');
                  marioAudio.playOneUp();
                }}
                className={`min-h-[32px] sm:min-h-[34px] w-full min-w-0 overflow-hidden px-1 sm:px-2 py-1 rounded-lg font-black cursor-pointer transition-colors inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs ${
                  documentMode === 'bowser_victory'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="hidden sm:inline truncate">Boss Victory</span>
                <span className="sm:hidden truncate">Victory</span>
              </button>
              <button
                type="button"
                data-testid="toggle-passport-mode-btn"
                title="Philippine Jurist Passport"
                onClick={() => {
                  setDocumentMode('passport');
                  marioAudio.playOneUp();
                }}
                className={`min-h-[32px] sm:min-h-[34px] w-full min-w-0 overflow-hidden px-1 sm:px-2 py-1 rounded-lg font-black cursor-pointer transition-colors inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs ${
                  documentMode === 'passport'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <MarioMushroomIcon size={12} variant="super" />
                <span className="truncate">Passport</span>
              </button>
            </div>

            {/* Quick Action Buttons: Clean 4-column balanced layout on mobile, flex row on sm+ */}
            <div className="grid grid-cols-4 sm:flex sm:flex-wrap items-center gap-1 sm:gap-1.5 w-full sm:w-auto sm:justify-end">
              <button
                type="button"
                data-testid="toggle-print-options-btn"
                onClick={() => {
                  setShowControlPanel((prev) => !prev);
                  setMobileStyleBarOpen((prev) => !prev);
                }}
                aria-expanded={showControlPanel || mobileStyleBarOpen}
                className={`min-h-[36px] sm:min-h-[38px] w-full sm:w-auto min-w-0 justify-center px-1.5 sm:px-3 py-1.5 rounded-xl border-2 font-bold text-xs inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors shadow-xs ${
                  showControlPanel || mobileStyleBarOpen
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                }`}
              >
                <SlidersHorizontal className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${showControlPanel || mobileStyleBarOpen ? 'text-slate-950' : 'text-amber-400'}`} />
                <span className="hidden sm:inline truncate">{showControlPanel || mobileStyleBarOpen ? 'Hide Style' : 'Style & Options'}</span>
                <span className="sm:hidden truncate">{showControlPanel || mobileStyleBarOpen ? 'Hide' : 'Options'}</span>
              </button>

              <button
                type="button"
                data-testid="print-browser-dialog-btn"
                onClick={handlePrintPage}
                className="min-h-[36px] sm:min-h-[38px] w-full sm:w-auto min-w-0 justify-center px-1.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl border-2 border-slate-600 inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-transform active:translate-y-0.5 shadow-xs"
                title="Open browser print dialog for vector paper printing or Save as PDF"
              >
                <Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                <span className="hidden sm:inline truncate">Print Page</span>
                <span className="sm:hidden truncate">Print</span>
              </button>

              <button
                type="button"
                data-testid="download-vector-pdf-btn"
                onClick={() => handleDownloadPdf(true)}
                disabled={isGeneratingPdf}
                className="min-h-[36px] sm:min-h-[38px] w-full sm:w-auto min-w-0 justify-center px-1.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs sm:text-sm rounded-xl border-2 border-slate-600 inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-transform active:translate-y-0.5 disabled:opacity-50 shadow-xs"
                title="Download 100% Vector TrueType PDF (Infinite sharpness, embedded Google fonts)"
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
                <span className="hidden md:inline truncate">Vector PDF</span>
                <span className="md:hidden truncate">Vector</span>
              </button>

              <button
                type="button"
                data-testid="download-active-pdf-btn"
                onClick={() => handleDownloadPdf(false)}
                disabled={isGeneratingPdf}
                className="min-h-[36px] sm:min-h-[38px] w-full sm:w-auto min-w-0 justify-center flex-1 sm:flex-initial inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl border-2 border-black shadow-[0_3px_0_#000] active:translate-y-0.5 cursor-pointer transition-all disabled:opacity-50"
                title={
                  documentMode === 'guide'
                    ? 'Download Ultra-HD 1200 DPI Vector Reviewer (Zero Blur, Crisp Selectable Text, Embedded Fonts)'
                    : 'Download 100% Exact 1:1 Live Preview Master PDF (Uncompressed Publication Clarity)'
                }
              >
                {isGeneratingPdf ? (
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-950 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-slate-950" />
                )}
                <span className="hidden sm:inline truncate">
                  {isGeneratingPdf
                    ? 'Generating Master PDF...'
                    : pdfDownloadedNotice
                    ? 'Downloaded (.pdf)'
                    : documentMode === 'guide'
                    ? 'Download Ultra-HD Reviewer (Zero Blur)'
                    : 'Download Master PDF (Exact)'}
                </span>
                <span className="sm:hidden font-black truncate">
                  {isGeneratingPdf ? 'Exporting...' : 'PDF'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Compact 24 Themes & 20 Fonts Studio + Zoom/Page/Section Inspector Bar (Collapsible on Mobile) */}
        <div
          data-testid="print-quick-style-bar"
          className={`bg-slate-950 px-3 sm:px-5 py-2 border-b border-slate-800 space-y-2 text-xs print:hidden flex-shrink-0 ${
            isMobilePreviewFullscreen ? 'hidden' : mobileStyleBarOpen ? 'block' : 'hidden sm:block'
          }`}
        >
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-2 items-center">
            <div className="flex items-center gap-1.5 min-w-0 lg:col-span-4">
              <label
                htmlFor="print-quick-theme-select"
                className="text-[11px] font-black text-amber-300 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
              >
                <Palette className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Themes ({EXTENDED_PRINT_COLOR_THEMES.length}):</span>
                <span className="sm:hidden">Theme:</span>
              </label>
              <select
                id="print-quick-theme-select"
                data-testid="print-quick-theme-select"
                value={activeExtendedTheme.id}
                onChange={(e) =>
                  updateFormat(
                    'colorAccent',
                    e.target.value as PrintGuideFormatOptions['colorAccent']
                  )
                }
                className="min-h-[38px] flex-1 min-w-0 bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs font-bold rounded-xl px-2 py-1 cursor-pointer focus:outline-none focus:border-amber-400 truncate"
              >
                {(['Legal & Classic', 'Mario Kingdom', 'Editorial & Luxury', 'Pastel & Ink-Saver'] as const).map((cat) => (
                  <optgroup key={cat} label={cat} className="bg-slate-950 text-amber-300 font-bold">
                    {EXTENDED_PRINT_COLOR_THEMES.filter((t) => t.category === cat).map((themeItem) => (
                      <option
                        key={themeItem.id}
                        value={themeItem.id}
                        className="bg-slate-900 text-white font-semibold"
                      >
                        {themeItem.name} ({themeItem.badge})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 min-w-0 lg:col-span-4">
              <label
                htmlFor="print-quick-font-select"
                className="text-[11px] font-black text-amber-300 whitespace-nowrap shrink-0 inline-flex items-center gap-1"
              >
                <Type className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Fonts ({EXTENDED_PRINT_FONT_CATALOG.length}):</span>
                <span className="sm:hidden">Font:</span>
              </label>
              <select
                id="print-quick-font-select"
                data-testid="print-quick-font-select"
                value={activeExtendedFont.id}
                onChange={(e) =>
                  updateFormat(
                    'fontStyle',
                    e.target.value as PrintGuideFormatOptions['fontStyle']
                  )
                }
                className="min-h-[38px] flex-1 min-w-0 bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs font-bold rounded-xl px-2 py-1 cursor-pointer focus:outline-none focus:border-amber-400 truncate"
              >
                {(['Sans-Serif', 'Legal Serif', 'Display & Mario', 'Tabular Mono'] as const).map((fCat) => (
                  <optgroup key={fCat} label={fCat} className="bg-slate-950 text-emerald-300 font-bold">
                    {EXTENDED_PRINT_FONT_CATALOG.filter((f) => f.category === fCat).map((fontItem) => (
                      <option
                        key={fontItem.id}
                        value={fontItem.id}
                        className="bg-slate-900 text-white font-semibold"
                      >
                        {fontItem.name} ({fontItem.badge})
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="col-span-2 lg:col-span-4 flex items-center gap-1.5 min-w-0">
              <label
                htmlFor="print-quick-name-input"
                className="text-[11px] font-black text-emerald-300 whitespace-nowrap shrink-0"
              >
                Name:
              </label>
              <input
                id="print-quick-name-input"
                data-testid="print-quick-name-input"
                type="text"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder={playerName || 'Learner / Recipient name...'}
                className="min-h-[38px] flex-1 min-w-0 bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                data-testid="toggle-visual-swatches-btn"
                onClick={() => setShowVisualSwatches((prev) => !prev)}
                aria-expanded={showVisualSwatches}
                className="min-h-[38px] px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
                title="Show or hide visual color swatches and font pills"
              >
                <span>Swatches</span>
                {showVisualSwatches ? (
                  <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                )}
              </button>
            </div>
          </div>

          {/* Preview Zoom, Render Mode (Live Sheet vs PDF File), Page Estimate & Section Jumpers */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Zoom Switcher */}
              <div className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 gap-0.5">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-0.5 shrink-0" />
                {(['fit', '50', '75', '100', '125'] as const).map((zp) => (
                  <button
                    key={zp}
                    type="button"
                    data-testid={`print-zoom-${zp}-btn`}
                    title={
                      zp === 'fit'
                        ? 'Fit Width: Proportionally scale the document to fit available screen width without horizontal overflow'
                        : zp === '100'
                        ? '100% True Scale: Render at exact 1:1 physical sheet dimensions (794px portrait / 1122px landscape)'
                        : `${zp}% Scale Zoom`
                    }
                    onClick={() => {
                      marioAudio.playClick();
                      setZoomPreset(zp);
                    }}
                    className={`min-h-[30px] px-2 py-0.5 rounded-md text-[11px] font-black cursor-pointer transition-colors whitespace-nowrap ${
                      zoomPreset === zp
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {zp === 'fit' ? (
                      <>
                        <span className="hidden sm:inline">{`Fit Width (${Math.round(stageMetrics.fitScale * 100)}%)`}</span>
                        <span className="sm:hidden">{`Fit (${Math.round(stageMetrics.fitScale * 100)}%)`}</span>
                      </>
                    ) : (
                      `${zp}%`
                    )}
                  </button>
                ))}
              </div>

              {documentMode === 'certificate' && (
                <div
                  data-testid="print-cert-orientation-toolbar-toggle"
                  className="inline-flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 gap-0.5"
                >
                  <button
                    type="button"
                    data-testid="cert-orientation-landscape-btn"
                    onClick={() => {
                      marioAudio.playClick();
                      setCertOrientation('landscape');
                    }}
                    className={`min-h-[30px] px-2.5 py-0.5 rounded-md text-[11px] font-black cursor-pointer whitespace-nowrap ${
                      certOrientation === 'landscape'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Landscape
                  </button>
                  <button
                    type="button"
                    data-testid="cert-orientation-portrait-btn"
                    onClick={() => {
                      marioAudio.playClick();
                      setCertOrientation('portrait');
                    }}
                    className={`min-h-[30px] px-2.5 py-0.5 rounded-md text-[11px] font-black cursor-pointer whitespace-nowrap ${
                      certOrientation === 'portrait'
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Portrait
                  </button>
                </div>
              )}

              <span
                data-testid="print-page-estimate-label"
                className="text-[11px] text-slate-300 font-mono tabular-nums whitespace-nowrap px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-bold"
              >
                {isLandscapeDocument ? 'Landscape' : 'Portrait'} · {estimatedPageCount === 1 ? '1 Page (Full Master)' : `${estimatedPageCount} Pages`}
              </span>

              <button
                type="button"
                onClick={async () => {
                  try {
                    if ('serviceWorker' in navigator) {
                      const registrations = await navigator.serviceWorker.getRegistrations();
                      for (const reg of registrations) await reg.unregister();
                    }
                    if ('caches' in window) {
                      const keys = await caches.keys();
                      for (const key of keys) await caches.delete(key);
                    }
                  } catch {}
                  window.location.reload();
                }}
                className="text-[10px] text-slate-400 hover:text-amber-300 underline cursor-pointer px-1 whitespace-nowrap"
                title="Bypass Service Worker cache and fetch fresh app"
              >
                Clear Cache
              </button>
            </div>

            {/* Whole-Reviewer Quick Section Jump Bar & TOC Quick Toggle */}
            {documentMode === 'guide' && (
              <div
                data-testid="print-reviewer-section-jumpers"
                className="flex flex-wrap items-center gap-1.5"
              >
                <button
                  type="button"
                  data-testid="quick-toggle-toc-btn"
                  onClick={() => {
                    marioAudio.playClick();
                    updateFormat('generateToc', !(formatOptions.generateToc ?? true));
                  }}
                  className={`min-h-[28px] px-2.5 py-0.5 rounded-lg border text-[10px] font-black cursor-pointer transition-colors inline-flex items-center gap-1 ${
                    (formatOptions.generateToc ?? true)
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                      : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Toggle dynamic Table of Contents at document start"
                >
                  <TableOfContents className="w-3 h-3 shrink-0" />
                  <span>TOC: {(formatOptions.generateToc ?? true) ? 'ON' : 'OFF'}</span>
                </button>

                <span className="text-[10px] font-bold text-amber-300 ml-1 mr-0.5">Jump:</span>
                {[
                  { id: 'print-sec-masthead', label: 'Cover' },
                  ...((formatOptions.generateToc ?? true)
                    ? [{ id: 'doc-table-of-contents', label: 'TOC' }]
                    : []),
                  { id: 'print-sec-matrices', label: 'Matrices' },
                  ...WORLDS_METADATA.filter((w) => selectedWorlds.includes(w.id)).map((w) => ({
                    id: `doc-world-${w.id}`,
                    label: `W${w.worldNumber}`,
                  })),
                  ...(includeHonorPledge
                    ? [{ id: 'print-sec-pledge', label: 'Pledge' }]
                    : []),
                ].map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    data-testid={`jump-${sec.id}`}
                    onClick={() => handleJumpToSection(sec.id)}
                    className="min-h-[28px] px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-200 hover:text-amber-300 cursor-pointer whitespace-nowrap"
                  >
                    {sec.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Themes & Fonts Swatches Studio — Super UI/UX Friendly */}
          {showVisualSwatches && (
            <div
              data-testid="print-visual-themes-fonts-strip"
              className="pt-2.5 pb-1 border-t border-slate-800 space-y-2.5"
            >
              {/* Header Controls: Tab Switcher + Category Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Segmented Switcher: Themes vs Fonts */}
                <div className="inline-flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    data-testid="swatch-tab-themes-btn"
                    onClick={() => {
                      marioAudio.playClick();
                      setSwatchViewMode('themes');
                    }}
                    className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      swatchViewMode === 'themes'
                        ? 'bg-amber-400 text-slate-950 shadow-[0_2px_0_#000]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 shrink-0" />
                    <span>Color Themes ({EXTENDED_PRINT_COLOR_THEMES.length})</span>
                  </button>
                  <button
                    type="button"
                    data-testid="swatch-tab-fonts-btn"
                    onClick={() => {
                      marioAudio.playClick();
                      setSwatchViewMode('fonts');
                    }}
                    className={`min-h-[32px] px-3 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                      swatchViewMode === 'fonts'
                        ? 'bg-emerald-400 text-slate-950 shadow-[0_2px_0_#000]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <Type className="w-3.5 h-3.5 shrink-0" />
                    <span>Typography Fonts ({EXTENDED_PRINT_FONT_CATALOG.length})</span>
                  </button>
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                  {swatchViewMode === 'themes' ? (
                    (['All', 'Mario Kingdom', 'Legal & Classic', 'Editorial & Luxury', 'Pastel & Ink-Saver'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          marioAudio.playClick();
                          setThemeCategoryFilter(cat);
                        }}
                        className={`min-h-[26px] px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors border ${
                          themeCategoryFilter === cat
                            ? 'bg-slate-800 text-amber-300 border-amber-400 font-black'
                            : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))
                  ) : (
                    (['All', 'Sans-Serif', 'Legal Serif', 'Display & Mario', 'Tabular Mono'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          marioAudio.playClick();
                          setFontCategoryFilter(cat);
                        }}
                        className={`min-h-[26px] px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap cursor-pointer transition-colors border ${
                          fontCategoryFilter === cat
                            ? 'bg-slate-800 text-emerald-300 border-emerald-400 font-black'
                            : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Swatches Grid */}
              <div className="max-h-[30vh] sm:max-h-[34vh] overflow-y-auto pr-1">
                {swatchViewMode === 'themes' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {EXTENDED_PRINT_COLOR_THEMES.filter(
                      (t) => themeCategoryFilter === 'All' || t.category === themeCategoryFilter
                    ).map((themeItem) => {
                      const isSelected = activeExtendedTheme.id === themeItem.id;
                      return (
                        <button
                          key={themeItem.id}
                          type="button"
                          data-testid={`print-theme-swatch-${themeItem.id}`}
                          onClick={() => {
                            marioAudio.playCoin();
                            updateFormat(
                              'colorAccent',
                              themeItem.id as PrintGuideFormatOptions['colorAccent']
                            );
                          }}
                          className={`min-h-[58px] p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1.5 relative overflow-hidden group ${
                            isSelected
                              ? 'bg-amber-400/15 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_4px_12px_rgba(251,191,36,0.25)]'
                              : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Palette Multi-Bar Swatch */}
                          <div className="flex items-center justify-between gap-1.5 w-full">
                            <div className="flex items-center h-3.5 rounded-md overflow-hidden border border-white/20 flex-1 shadow-xs">
                              {themeItem.swatchHexes.map((hex, idx) => (
                                <span
                                  key={idx}
                                  className="h-full flex-1"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                          </div>

                          {/* Theme Name & Badge */}
                          <div className="min-w-0">
                            <span
                              className={`text-[11px] font-black block truncate leading-tight ${
                                isSelected ? 'text-amber-300' : 'text-slate-100 group-hover:text-white'
                              }`}
                            >
                              {themeItem.name}
                            </span>
                            <span className="text-[9px] font-medium text-slate-400 block truncate">
                              {themeItem.badge} · {themeItem.category.replace(' & ', '/')}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {EXTENDED_PRINT_FONT_CATALOG.filter(
                      (f) => fontCategoryFilter === 'All' || f.category === fontCategoryFilter
                    ).map((fontItem) => {
                      const isSelected = activeExtendedFont.id === fontItem.id;
                      return (
                        <button
                          key={fontItem.id}
                          type="button"
                          data-testid={`print-font-pill-${fontItem.id}`}
                          onClick={() => {
                            marioAudio.playClick();
                            updateFormat(
                              'fontStyle',
                              fontItem.id as PrintGuideFormatOptions['fontStyle']
                            );
                          }}
                          className={`min-h-[62px] p-2 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-1 relative overflow-hidden group ${
                            isSelected
                              ? 'bg-emerald-400/15 border-emerald-400 ring-2 ring-emerald-400/60 shadow-[0_4px_12px_rgba(52,211,153,0.25)]'
                              : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 w-full">
                            <span
                              style={{ fontFamily: fontItem.cssFontFamily }}
                              className="text-lg font-bold text-white leading-none tracking-normal"
                            >
                              Aa
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <span
                              className={`text-[11px] font-black block truncate leading-tight ${
                                isSelected ? 'text-emerald-300' : 'text-slate-100 group-hover:text-white'
                              }`}
                            >
                              {fontItem.name}
                            </span>
                            <span
                              style={{ fontFamily: fontItem.cssFontFamily }}
                              className="text-[9.5px] text-slate-400 block truncate leading-tight mt-0.5"
                            >
                              {fontItem.sampleText}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Control Panel for PDF Aesthetics & Content Toggles */}
        {showControlPanel && (
          <div
            data-testid="print-guide-control-panel"
            className="bg-slate-900/95 px-4 py-3.5 border-b border-slate-700 space-y-3 text-xs font-bold print:hidden flex-shrink-0 max-h-[38vh] overflow-y-auto"
          >
            {documentMode === 'summary' ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="space-y-1 flex-1 max-w-md">
                    <label
                      htmlFor="summary-candidate-name"
                      className="text-[11px] text-amber-300 font-bold block"
                    >
                      Optional Learner / Header Name on Sheet:
                    </label>
                    <input
                      id="summary-candidate-name"
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g., Juan Dela Cruz · Labor Standards Scholar"
                      className="min-h-[42px] w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    <p className="text-emerald-300 font-bold">
                      Format: Single-Page Master Formula Sheet (High-Resolution Vector PDF)
                    </p>
                    <p className="text-slate-400">
                      Includes {ONE_PAGE_LEGAL_FORMULAS.length} statutory pay formulas,{' '}
                      {ONE_PAGE_LEGAL_DEADLINES.length} prescriptive &amp; procedural deadlines, and{' '}
                      {ONE_PAGE_STATUTORY_LEAVE_CAPS.length} World 6 leave caps.
                    </p>
                  </div>
                </div>
              </div>
            ) : documentMode === 'certificate' ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-amber-300 text-xs font-black uppercase font-mario">
                    EXECUTIVE CERTIFICATE CUSTOMIZER (PORTRAIT OR LANDSCAPE)
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Exports directly as an Executive {certOrientation === 'portrait' ? 'Portrait' : 'Landscape'} Certificate PDF (.pdf)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-600 space-y-1">
                    <label className="text-[11px] text-amber-300 font-bold block">
                      Learner Name on Certificate:
                    </label>
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g., Juan Dela Cruz · Labor Standards Scholar"
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>

                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-600 space-y-1">
                    <label className="text-[11px] text-amber-300 font-bold block">
                      Conferred Honors / Distinction:
                    </label>
                    <select
                      value={certificateHonors}
                      onChange={(e) => setCertificateHonors(e.target.value)}
                      className="w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                    >
                      <option value="Summa Cum Laude · Super Star Rank" className="bg-slate-900 text-white">Summa Cum Laude · Super Star Rank</option>
                      <option value="Magna Cum Laude · Fire Flower Mastery" className="bg-slate-900 text-white">Magna Cum Laude · Fire Flower Mastery</option>
                      <option value="Cum Laude · Super Mushroom Advocate" className="bg-slate-900 text-white">Cum Laude · Super Mushroom Advocate</option>
                      <option value="Highest Distinction in Philippine Labor Standards" className="bg-slate-900 text-white">Highest Distinction in Philippine Labor Standards</option>
                    </select>
                  </div>

                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-600 space-y-1">
                    <span className="text-[11px] text-amber-300 font-bold block">
                      Page Orientation:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          marioAudio.playClick();
                          setCertOrientation('landscape');
                        }}
                        className={`min-h-[34px] rounded-lg text-xs font-black border cursor-pointer ${
                          certOrientation === 'landscape'
                            ? 'bg-amber-400 text-slate-950 border-black'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        Landscape
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          marioAudio.playClick();
                          setCertOrientation('portrait');
                        }}
                        className={`min-h-[34px] rounded-lg text-xs font-black border cursor-pointer ${
                          certOrientation === 'portrait'
                            ? 'bg-amber-400 text-slate-950 border-black'
                            : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        Portrait
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-600 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-white text-xs font-bold block truncate">
                        {certOrientation === 'portrait' ? 'Portrait Edition' : 'Landscape Edition'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">Direct .pdf download</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(false)}
                      className="min-h-[40px] px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl border border-black cursor-pointer inline-flex items-center gap-1.5 shadow-[0_2px_0_#000] whitespace-nowrap shrink-0"
                    >
                      <FileDown className="w-3.5 h-3.5 shrink-0" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : documentMode === 'scorecard' ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-amber-300 text-xs font-black uppercase font-mario block">
                    OFFICIAL HERO SCORE CARD &amp; MASTERY DOSSIER
                  </span>
                  <p className="text-[11px] text-slate-300">
                    Exports your live 6-World completion breakdown, study streak, coins, and earned badges as a Landscape PDF styled in any of the {PRINT_COLOR_THEMES.length} themes &amp; {PRINT_FONT_STYLES.length} fonts.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(false)}
                  className="min-h-[42px] px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl border-2 border-black cursor-pointer inline-flex items-center gap-1.5 shadow-[0_2px_0_#000] whitespace-nowrap shrink-0"
                >
                  <FileDown className="w-4 h-4 shrink-0" />
                  <span>Download Score Card PDF</span>
                </button>
              </div>
            ) : documentMode === 'passport' ? (
              <div className="space-y-3" data-testid="passport-customizer-controls">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/60 pb-2">
                  <div className="space-y-0.5">
                    <span className="text-amber-300 text-xs font-black uppercase font-mario block">
                      OFFICIAL JURIST PASSPORT IDENTITY CUSTOMIZER
                    </span>
                    <span className="text-[11px] text-slate-300">
                      Personalize your Philippine Labor Jurist Passport credentials, Date of Birth, Birthplace &amp; ICAO MRZ machine code.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      data-testid="passport-reset-defaults-btn"
                      onClick={() => {
                        marioAudio.playClick();
                        const fallback = splitCandidateName(playerName || 'Juan Dela Cruz');
                        const def: PassportProfileData = {
                          fullName: playerName || 'Juan Dela Cruz',
                          surname: fallback.surname,
                          givenNames: fallback.givenNames,
                          dateOfBirth: '2000-01-01',
                          placeOfBirth: 'MANILA, PHILIPPINES',
                          nationality: 'FILIPINO / JURIST',
                          sex: 'M',
                          passportNumber: 'PH-L442-2026-MC',
                          issuingAuthority: 'DOLE & PHILIPPINE LABOR STANDARDS BAR',
                          dateOfIssuance: new Date().toISOString().slice(0, 10),
                        };
                        setPassportProfile(def);
                        savePassportProfile(def);
                      }}
                      className="min-h-[36px] px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 font-bold text-xs rounded-lg cursor-pointer transition-colors"
                    >
                      Reset Defaults
                    </button>
                    <button
                      type="button"
                      data-testid="download-passport-direct-btn"
                      onClick={() => handleDownloadPdf(false)}
                      className="min-h-[38px] px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl border border-black cursor-pointer inline-flex items-center gap-1.5 shadow-[0_2px_0_#000]"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Download Passport PDF</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {/* Full Name & Auto Split */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 space-y-1">
                    <label htmlFor="passport-full-name-input" className="text-[10.5px] text-amber-300 font-bold block">
                      Full Name (Bearer):
                    </label>
                    <input
                      id="passport-full-name-input"
                      data-testid="passport-full-name-input"
                      type="text"
                      value={passportProfile.fullName}
                      onChange={(e) => handleUpdatePassport('fullName', e.target.value)}
                      placeholder="e.g. Juan Dela Cruz"
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold"
                    />
                  </div>

                  {/* Given Names & Surname overrides */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 space-y-1">
                    <label htmlFor="passport-surname-input" className="text-[10.5px] text-amber-300 font-bold block">
                      Surname / Apelyido:
                    </label>
                    <input
                      id="passport-surname-input"
                      data-testid="passport-surname-input"
                      type="text"
                      value={passportProfile.surname}
                      onChange={(e) => handleUpdatePassport('surname', e.target.value)}
                      placeholder="e.g. DELA CRUZ"
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold uppercase"
                    />
                  </div>

                  {/* Date of Birth Picker & Quick Format */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="passport-dob-input" className="text-[10.5px] text-amber-300 font-bold block">
                        Date of Birth:
                      </label>
                      <span className="text-[10px] font-mono text-emerald-300 font-bold">
                        {formatPassportDate(passportProfile.dateOfBirth)}
                      </span>
                    </div>
                    <input
                      id="passport-dob-input"
                      data-testid="passport-dob-input"
                      type="date"
                      value={passportProfile.dateOfBirth.length === 10 ? passportProfile.dateOfBirth : '2000-01-01'}
                      onChange={(e) => handleUpdatePassport('dateOfBirth', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                    />
                  </div>

                  {/* Place of Birth with Suggestions */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 space-y-1">
                    <label htmlFor="passport-pob-input" className="text-[10.5px] text-amber-300 font-bold block">
                      Place of Birth:
                    </label>
                    <input
                      id="passport-pob-input"
                      data-testid="passport-pob-input"
                      list="philippine-pob-datalist"
                      type="text"
                      value={passportProfile.placeOfBirth}
                      onChange={(e) => handleUpdatePassport('placeOfBirth', e.target.value)}
                      placeholder="e.g. QUEZON CITY, PHILIPPINES"
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold uppercase"
                    />
                    <datalist id="philippine-pob-datalist">
                      {PHILIPPINE_BIRTHPLACE_SUGGESTIONS.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Second row: Date of Issuance, Sex, Nationality, Passport No., Issuing Authority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700 space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="passport-doi-input" className="text-[10px] text-amber-300 font-bold block">
                        Date of Issuance:
                      </label>
                      <span className="text-[10px] font-mono text-emerald-300 font-bold">
                        {formatPassportDate(passportProfile.dateOfIssuance || new Date().toISOString())}
                      </span>
                    </div>
                    <input
                      id="passport-doi-input"
                      data-testid="passport-doi-input"
                      type="date"
                      value={
                        passportProfile.dateOfIssuance && passportProfile.dateOfIssuance.length === 10
                          ? passportProfile.dateOfIssuance
                          : new Date().toISOString().slice(0, 10)
                      }
                      onChange={(e) => handleUpdatePassport('dateOfIssuance', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                    />
                  </div>

                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-700 space-y-1">
                    <label htmlFor="passport-sex-select" className="text-[10px] text-amber-300 font-bold block">
                      Sex / Kasarian:
                    </label>
                    <select
                      id="passport-sex-select"
                      data-testid="passport-sex-select"
                      value={passportProfile.sex}
                      onChange={(e) => handleUpdatePassport('sex', e.target.value as 'M' | 'F' | 'X')}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                    >
                      <option value="M">M - Male (Lalaki)</option>
                      <option value="F">F - Female (Babae)</option>
                      <option value="X">X - Unspecified</option>
                    </select>
                  </div>

                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-700 space-y-1">
                    <label htmlFor="passport-nationality-input" className="text-[10px] text-amber-300 font-bold block">
                      Nationality:
                    </label>
                    <input
                      id="passport-nationality-input"
                      data-testid="passport-nationality-input"
                      type="text"
                      value={passportProfile.nationality}
                      onChange={(e) => handleUpdatePassport('nationality', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold uppercase"
                    />
                  </div>

                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-700 space-y-1">
                    <label htmlFor="passport-number-input" className="text-[10px] text-amber-300 font-bold block">
                      Passport No.:
                    </label>
                    <input
                      id="passport-number-input"
                      data-testid="passport-number-input"
                      type="text"
                      value={passportProfile.passportNumber}
                      onChange={(e) => handleUpdatePassport('passportNumber', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold uppercase"
                    />
                  </div>

                  <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-700 space-y-1">
                    <label htmlFor="passport-authority-input" className="text-[10px] text-amber-300 font-bold block">
                      Issuing Authority:
                    </label>
                    <input
                      id="passport-authority-input"
                      data-testid="passport-authority-input"
                      type="text"
                      value={passportProfile.issuingAuthority}
                      onChange={(e) => handleUpdatePassport('issuingAuthority', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold text-[11px]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Quick Layout Presets */}
                <div className="space-y-1">
                  <span className="text-amber-300 text-[11px] font-semibold block">
                    Layout Preset:
                  </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('custom_builder')}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg border text-xs cursor-pointer flex items-center gap-1.5 transition-all ${
                    layoutPreset === 'custom_builder'
                      ? 'bg-amber-400 text-slate-950 font-black border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:text-white'
                  }`}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Custom Checklist</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('compact_cheatsheet')}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg border text-xs cursor-pointer flex items-center gap-1.5 transition-all ${
                    layoutPreset === 'compact_cheatsheet'
                      ? 'bg-amber-400 text-slate-950 font-black border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:text-white'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Compact Cheat Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPreset('comprehensive_syllabus')}
                  className={`min-h-[36px] px-3 py-1.5 rounded-lg border text-xs cursor-pointer flex items-center gap-1.5 transition-all ${
                    layoutPreset === 'comprehensive_syllabus'
                      ? 'bg-amber-400 text-slate-950 font-black border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-300 border-slate-600 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Comprehensive Syllabus</span>
                </button>
              </div>
            </div>

            {/* Margins & Font Sizing Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-300 text-[10px] uppercase font-bold block">Page Margins:</span>
                <div className="flex items-center gap-1">
                  {(['compact', 'standard', 'spacious'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        marioAudio.playClick();
                        setPaperMargins(m);
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs capitalize cursor-pointer transition-all ${
                        paperMargins === m
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-300 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-slate-300 text-[10px] uppercase font-bold block">Font Sizing:</span>
                <div className="flex items-center gap-1">
                  {(['small', 'normal', 'large'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        marioAudio.playClick();
                        setFontSizeScale(s);
                      }}
                      className={`flex-1 py-1 px-2 rounded-lg text-xs capitalize cursor-pointer transition-all ${
                        fontSizeScale === s
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-300 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Primary Print Aesthetics & Content Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Compact Layout</span>
                <input
                  type="checkbox"
                  checked={formatOptions.compactLayout}
                  onChange={(e) => updateFormat('compactLayout', e.target.checked)}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <TableOfContents className="w-4 h-4 text-amber-400" />
                  Generate Table of Contents (TOC)
                </span>
                <input
                  type="checkbox"
                  data-testid="toggle-generate-toc"
                  checked={formatOptions.generateToc ?? true}
                  onChange={(e) => {
                    marioAudio.playClick();
                    updateFormat('generateToc', e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Include Key Study Tips</span>
                <input
                  type="checkbox"
                  checked={formatOptions.includeBarTips}
                  onChange={(e) => updateFormat('includeBarTips', e.target.checked)}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Include Legal Citations</span>
                <input
                  type="checkbox"
                  checked={formatOptions.includeLegalCitations}
                  onChange={(e) => updateFormat('includeLegalCitations', e.target.checked)}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Review Checkboxes [ ]</span>
                <input
                  type="checkbox"
                  checked={includeCheckboxes}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeCheckboxes(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Include Practical Scenarios</span>
                <input
                  type="checkbox"
                  checked={includeHypotheticals}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeHypotheticals(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Hide Completed Topics</span>
                <input
                  type="checkbox"
                  checked={formatOptions.hideCompletedTopics}
                  onChange={(e) => updateFormat('hideCompletedTopics', e.target.checked)}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">2-Column Digest Mode</span>
                <input
                  type="checkbox"
                  checked={twoColumnLayout}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setTwoColumnLayout(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Watermark Stamp</span>
                <input
                  type="checkbox"
                  checked={includeWatermark}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeWatermark(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Formulas Cheat Sheet</span>
                <input
                  type="checkbox"
                  checked={includeFormulasCheatSheet}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeFormulasCheatSheet(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Mario Executive Summaries</span>
                <input
                  type="checkbox"
                  checked={includeExecutiveMarioSummary}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeExecutiveMarioSummary(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">2-Notice Due Process Flow</span>
                <input
                  type="checkbox"
                  checked={includeTwoNoticeChecklist}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeTwoNoticeChecklist(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">4-Fold Control Test Box</span>
                <input
                  type="checkbox"
                  checked={includeFourFoldControlTest}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeFourFoldControlTest(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Art. 302 Retirement (22.5d)</span>
                <input
                  type="checkbox"
                  checked={includeRetirementFormulaBox}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeRetirementFormulaBox(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Latin Jurisprudence Maxims</span>
                <input
                  type="checkbox"
                  checked={includeLatinMaxims}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeLatinMaxims(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <label className="min-h-[44px] flex items-center justify-between gap-2 cursor-pointer bg-slate-800/90 hover:bg-slate-800 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white">Learner Commitment &amp; Honor Pledge</span>
                <input
                  type="checkbox"
                  checked={includeHonorPledge}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setIncludeHonorPledge(e.target.checked);
                  }}
                  className="w-4 h-4 accent-amber-400"
                />
              </label>

              <div className="min-h-[44px] flex items-center justify-between gap-2 bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-600">
                <span className="text-white text-xs font-bold">Page Orientation:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      marioAudio.playClick();
                      setPageOrientation('portrait');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      pageOrientation === 'portrait'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      marioAudio.playClick();
                      setPageOrientation('landscape');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      pageOrientation === 'landscape'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Landscape
                  </button>
                </div>
              </div>

              <div className="min-h-[44px] flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-600 sm:col-span-2 lg:col-span-3">
                <span className="text-amber-300 text-xs shrink-0 font-bold">Learner Name on Cover:</span>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="e.g., Juan Dela Cruz (Labor Law Scholar)"
                  className="bg-slate-900 border border-slate-700 text-white text-xs px-2.5 py-1.5 rounded-lg flex-1 min-w-0 font-normal focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Aesthetic Typography, Ink Palette & Pagination Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-0.5">
              {/* Typography Font Family */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Typography Font ({EXTENDED_PRINT_FONT_CATALOG.length}):
                </span>
                <select
                  value={activeExtendedFont.id}
                  onChange={(e) =>
                    updateFormat(
                      'fontStyle',
                      e.target.value as PrintGuideFormatOptions['fontStyle']
                    )
                  }
                  className="w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  {EXTENDED_PRINT_FONT_CATALOG.map((fontItem) => (
                    <option key={fontItem.id} value={fontItem.id} className="bg-slate-900 text-white">
                      {fontItem.name} ({fontItem.badge})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ink & Color Palette */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Color Accent Palette ({EXTENDED_PRINT_COLOR_THEMES.length}):
                </span>
                <select
                  value={activeExtendedTheme.id}
                  onChange={(e) =>
                    updateFormat(
                      'colorAccent',
                      e.target.value as PrintGuideFormatOptions['colorAccent']
                    )
                  }
                  className="w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  {EXTENDED_PRINT_COLOR_THEMES.map((themeItem) => (
                    <option key={themeItem.id} value={themeItem.id} className="bg-slate-900 text-white">
                      {themeItem.name} ({themeItem.badge})
                    </option>
                  ))}
                </select>
              </div>

              {/* Blank Hand-Written Note Lines */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Blank Note Lines:
                </span>
                <select
                  value={formatOptions.blankNoteLinesCount ?? 0}
                  onChange={(e) =>
                    updateFormat('blankNoteLinesCount', Number(e.target.value) as 0 | 3 | 5)
                  }
                  className="w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  <option value={0} className="bg-slate-900 text-white">0 Lines (Clean Reading)</option>
                  <option value={3} className="bg-slate-900 text-white">3 Blank Lines (For Quick Margin Notes)</option>
                  <option value={5} className="bg-slate-900 text-white">5 Blank Lines (For Exhaustive Case Notes)</option>
                </select>
              </div>

              {/* Watermark Selector */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-700 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">
                  Watermark Stamp:
                </span>
                <select
                  value={
                    !includeWatermark
                      ? 'none'
                      : formatOptions.watermarkText || 'CONFIDENTIAL STUDY REVIEW'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'none') {
                      setIncludeWatermark(false);
                      updateFormat('watermarkText', '');
                    } else {
                      setIncludeWatermark(true);
                      updateFormat('watermarkText', val);
                    }
                  }}
                  className="w-full bg-slate-900 [color-scheme:dark] border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none focus:border-amber-400 font-bold cursor-pointer"
                >
                  <option value="none" className="bg-slate-900 text-white">No Watermark</option>
                  <option value="CONFIDENTIAL STUDY REVIEW" className="bg-slate-900 text-white">CONFIDENTIAL STUDY REVIEW</option>
                  <option value="OFFICIAL STUDY GUIDE" className="bg-slate-900 text-white">OFFICIAL STUDY GUIDE</option>
                  <option value="FOR ACADEMIC USE ONLY" className="bg-slate-900 text-white">FOR ACADEMIC USE ONLY</option>
                  <option value="DO NOT REPRODUCE" className="bg-slate-900 text-white">DO NOT REPRODUCE</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="min-h-[38px] inline-flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200">
                <input
                  type="checkbox"
                  checked={formatOptions.pageBreakPerWorld}
                  onChange={(e) => updateFormat('pageBreakPerWorld', e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Page Break Per World</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-2 cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200">
                <input
                  type="checkbox"
                  checked={formatOptions.pageBreakPerModule}
                  onChange={(e) => updateFormat('pageBreakPerModule', e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Page Break Per Module</span>
              </label>

              <label
                data-testid="toggle-matrices-only-mode"
                className="min-h-[38px] inline-flex items-center gap-2 cursor-pointer bg-emerald-950/90 hover:bg-emerald-900/80 px-3 py-1.5 rounded-xl border border-emerald-500/70 text-emerald-200"
              >
                <input
                  type="checkbox"
                  checked={matricesOnlyMode}
                  onChange={(e) => {
                    marioAudio.playClick();
                    setMatricesOnlyMode(e.target.checked);
                  }}
                  className="accent-emerald-400"
                />
                <TableIcon className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Matrices Cheat Sheet Only</span>
              </label>
            </div>

            {/* Supplemental Reference Sections */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-amber-300 text-[11px] font-semibold mr-1">
                Reference Appendices:
              </span>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includeGroupMembers}
                  onChange={(e) => setIncludeGroupMembers(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Author &amp; Group Credits</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includeProgress}
                  onChange={(e) => setIncludeProgress(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>6-World Checklist</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includeMultipliers}
                  onChange={(e) => setIncludeMultipliers(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Statutory Multipliers</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includeRegionalWages}
                  onChange={(e) => setIncludeRegionalWages(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>17 Regions Minimum Wages</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includeLeavesMatrix}
                  onChange={(e) => setIncludeLeavesMatrix(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>World 6 Leaves Matrix</span>
              </label>

              <label className="min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  checked={includePersonalNotes}
                  onChange={(e) => setIncludePersonalNotes(e.target.checked)}
                  className="accent-amber-400"
                />
                <span>Study Notes ({resolvedNotes.length})</span>
              </label>
            </div>

            {/* All 6 Worlds Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-amber-300 text-[11px] font-semibold mr-1">
                Modules ({filteredTopics.length} topics queued):
              </span>
              {WORLDS_METADATA.map((w) => {
                const active = selectedWorlds.includes(w.id);
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => toggleWorld(w.id)}
                    className={`min-h-[38px] inline-flex items-center gap-1.5 cursor-pointer px-3 py-1 rounded-lg border text-[11px] transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-amber-400 text-slate-950 border-black font-black'
                        : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>
                      W{w.worldNumber}: {w.shortTitle}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedWorlds(WORLDS_METADATA.map((w) => w.id))}
                className="min-h-[38px] px-2.5 py-1 rounded-lg border border-slate-600 text-[11px] text-emerald-300 hover:bg-slate-800 cursor-pointer whitespace-nowrap"
              >
                All 6 Worlds
              </button>
            </div>
            </>
            )}
          </div>
        )}

        {/* Printable Whole-Document Stage & Direct PDF File Inspector */}
        <div
          id="print-preview-scroll-stage"
          ref={previewScrollRef}
          data-testid="print-preview-scroll-stage"
          className={`overflow-y-auto overflow-x-hidden flex-1 min-h-0 w-full select-text print:overflow-visible print:p-0 print:bg-white touch-pan-y relative ${
            isLivePreviewMode
              ? 'p-2 sm:p-4 bg-neutral-900/95'
              : 'p-2 sm:p-4 bg-slate-950/60'
          }`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {isMobilePreviewFullscreen && (
            <div className="sticky top-2 z-40 flex justify-center pb-2 pointer-events-none print:hidden">
              <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-md border-2 border-amber-400 text-white rounded-full px-3.5 py-1.5 shadow-2xl flex items-center gap-2 sm:gap-2.5">
                <span className="text-[10px] sm:text-xs font-black text-amber-300 font-mario uppercase tracking-wide">
                  Full Preview
                </span>
                <button
                  type="button"
                  onClick={handlePrintPage}
                  className="text-[10px] sm:text-xs bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-full font-bold cursor-pointer border border-slate-600 shadow-xs inline-flex items-center gap-1 active:translate-y-0.5"
                  title="Print paper or system dialog"
                >
                  <Printer className="w-3 h-3 text-emerald-400" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(false)}
                  className="text-[10px] sm:text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1 rounded-full font-black cursor-pointer shadow-xs inline-flex items-center gap-1 active:translate-y-0.5"
                  title="Download Master PDF"
                >
                  <FileDown className="w-3 h-3 text-slate-950" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobilePreviewFullscreen(false)}
                  className="text-[10px] sm:text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-full font-bold cursor-pointer border border-slate-600 inline-flex items-center gap-1 active:translate-y-0.5"
                >
                  <Minimize2 className="w-3 h-3" />
                  <span>Exit</span>
                </button>
              </div>
            </div>
          )}
          {/* Scoped CSS font inheritance style so all headings, bodies, badges, and numbers use chosen font stack */}
          <style>{`
            :root {
              --print-active-font: ${activeCssFontStack} !important;
            }
            #one-page-summary-sheet,
            #one-page-summary-sheet *:not(.preserve-system-font):not(.font-preserve),
            #official-labor-certificate,
            #official-labor-certificate *:not(.preserve-system-font):not(.font-preserve),
            #official-scorecard-sheet,
            #official-scorecard-sheet *:not(.preserve-system-font):not(.font-preserve),
            #official-player-scorecard,
            #official-player-scorecard *:not(.preserve-system-font):not(.font-preserve),
            #master-diploma-printable,
            #master-diploma-printable *:not(.preserve-system-font):not(.font-preserve),
            #royal-juris-diploma-sheet,
            #royal-juris-diploma-sheet *:not(.preserve-system-font):not(.font-preserve),
            #statutory-cheatsheet-sheet,
            #statutory-cheatsheet-sheet *:not(.preserve-system-font):not(.font-preserve),
            #bowser-victory-sheet,
            #bowser-victory-sheet *:not(.preserve-system-font):not(.font-preserve),
            #labor-jurist-passport-sheet,
            #labor-jurist-passport-sheet *:not(.preserve-system-font):not(.font-preserve),
            #printable-study-guide,
            #printable-study-guide *:not(.preserve-system-font):not(.font-preserve),
            .dynamic-print-font-target,
            .dynamic-print-font-target *:not(.preserve-system-font):not(.font-preserve) {
              font-family: ${activeCssFontStack} !important;
              word-break: normal;
              overflow-wrap: break-word;
              box-sizing: border-box;
            }
          `}</style>

          <div
            data-testid="print-scaled-stage-outer"
            style={{
              width: `${stageMetrics.scaledWidthPx}px`,
              maxWidth: '100%',
              minHeight: `${Math.ceil(
                (sheetNaturalHeightPx > 0
                  ? sheetNaturalHeightPx
                  : stageMetrics.logicalMinHeightPx) * stageMetrics.effectiveScale
              )}px`,
              height: 'auto',
              position: 'relative',
              overflow: documentMode === 'guide' ? 'visible' : 'hidden',
              margin: '0 auto',
            }}
            className="mx-auto transition-[width] duration-150 print:!w-full print:!h-auto print:!min-h-0"
          >
              <div
                ref={sheetContentRef}
                data-testid="print-scaled-stage-inner"
                style={{
                  width: `${stageMetrics.logicalWidthPx}px`,
                  minHeight: `${stageMetrics.logicalMinHeightPx}px`,
                  transform:
                    stageMetrics.effectiveScale !== 1
                      ? `scale(${stageMetrics.effectiveScale})`
                      : undefined,
                  transformOrigin: 'top left',
                  position: stageMetrics.effectiveScale !== 1 ? 'absolute' : 'relative',
                  top: 0,
                  left: 0,
                }}
                className="print:!w-full print:!min-h-0 print:!transform-none print:!static select-text"
              >
                {documentMode === 'summary' ? (
                  /* ==================== ONE-PAGE A4 LEGAL FORMULAS & STATUTORY DEADLINES SUMMARY ==================== */
                  <div
                    id="one-page-summary-sheet"
                    data-testid="one-page-summary-sheet"
                    data-theme={activeExtendedTheme.id}
                    data-font={activeExtendedFont.id}
                    data-single-page="true"
                    style={activeSheetDynamicStyle}
                    className={`${summaryPaperBgClass} ${bodyFontClass} p-4 rounded-2xl border-2 shadow-2xl w-full min-h-[1122px] h-auto flex flex-col justify-between overflow-visible box-border select-text print:p-3.5 print:border-2 print:rounded-2xl print:shadow-none print:box-border print:max-h-none print:h-auto print:overflow-visible`}
                  >
                    {/* A4 Sheet Header */}
                    <div
                      style={{
                        backgroundColor: activeExtendedTheme.headerBgHex,
                        color: guaranteedHeaderTextColor,
                        borderColor: activeExtendedTheme.borderHex,
                      }}
                      className={`border-b-2 ${headingBorderClass} px-3.5 py-2.5 rounded-xl flex items-end justify-between gap-3`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-400 border-2 border-black flex items-center justify-center shrink-0 shadow-xs">
                          <MarioSuperStarIcon size={20} />
                        </div>
                        <div className="min-w-0">
                          <span
                            style={{ color: guaranteedHeaderTextColor }}
                            className="text-[9px] font-black uppercase tracking-wider opacity-90 block truncate"
                          >
                            PHILIPPINE LABOR STANDARDS · ONE-PAGE MASTER SUMMARY · {activeExtendedTheme.name.toUpperCase()}
                          </span>
                          <h2
                            style={{ color: guaranteedHeaderTextColor }}
                            className="text-lg font-black tracking-tight leading-snug"
                          >
                            KEY LEGAL FORMULAS, MULTIPLIERS &amp; STATUTORY DEADLINES
                          </h2>
                          <p
                            style={{ color: guaranteedHeaderTextColor }}
                            className="text-[10px] opacity-90 font-medium leading-tight"
                          >
                            P.D. No. 442 (Labor Code, as amended), DOLE D.O. 174-17, R.A. 10361, R.A. 11210, R.A. 11360 &amp; R.A. 11861
                          </p>
                        </div>
                      </div>
                      <div
                        style={{ color: guaranteedHeaderTextColor }}
                        className="text-right text-[10px] font-mono opacity-95 shrink-0"
                      >
                        {candidateName.trim() && (
                          <div className="font-bold">{candidateName.trim()}</div>
                        )}
                        <div>Format: Single-Page Master Reference · {activeExtendedFont.name}</div>
                        <div>Updated: {currentDate}</div>
                      </div>
                    </div>

                    {/* Two-Column A4 Core Grid: Left = Formulas, Right = Deadlines */}
                    <div className="grid grid-cols-2 gap-3 items-start">
                      {/* Column 1: Key Legal Formulas */}
                      <div
                        style={{
                          borderColor: activeExtendedTheme.borderHex,
                          backgroundColor: '#FFFFFF',
                        }}
                        className={`border-2 ${subtleBoxClass} rounded-xl overflow-hidden bg-white`}
                      >
                        <div
                          style={{
                            backgroundColor: activeExtendedTheme.tableHeadBgHex,
                            color: guaranteedTableHeadTextColor,
                            borderColor: activeExtendedTheme.borderHex,
                          }}
                          className="px-3 py-1.5 flex items-center justify-between gap-2 border-b-2"
                        >
                          <span className="text-[11px] font-black uppercase tracking-wide flex items-center gap-1.5">
                            <MarioCoinBlockIcon size={14} />
                            <span>I. Key Statutory Pay Formulas ({ONE_PAGE_LEGAL_FORMULAS.length})</span>
                          </span>
                          <span className="text-[9.5px] font-mono opacity-85">Arts. 87–97 · 302</span>
                        </div>
                        <div className="divide-y divide-slate-200">
                          {ONE_PAGE_LEGAL_FORMULAS.map((f, idx) => (
                            <div
                              key={f.id}
                              style={
                                idx % 2 === 1
                                  ? { backgroundColor: activeExtendedTheme.tableStripeBgHex }
                                  : { backgroundColor: '#FFFFFF' }
                              }
                              className="px-2.5 py-1 text-[10.5px] leading-snug space-y-0.5"
                            >
                              <div className="flex items-baseline justify-between gap-2">
                                <span
                                  style={{ color: activeExtendedTheme.bodyTextHex }}
                                  className="font-bold break-words min-w-0 flex-1"
                                >
                                  {f.title}
                                </span>
                                <span
                                  style={{ color: activeExtendedTheme.mutedTextHex }}
                                  className="font-mono text-[9px] shrink-0"
                                >
                                  {f.citation}
                                </span>
                              </div>
                              <div
                                style={{ color: activeExtendedTheme.accentHex }}
                                className="font-mono font-black text-[11px] break-words"
                              >
                                {f.formula}
                              </div>
                              <p
                                style={{ color: activeExtendedTheme.mutedTextHex }}
                                className="text-[10px] break-words"
                              >
                                {f.note}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Column 2: Statutory Deadlines & Prescriptive Periods */}
                      <div
                        style={{
                          borderColor: activeExtendedTheme.borderHex,
                          backgroundColor: '#FFFFFF',
                        }}
                        className={`border-2 ${subtleBoxClass} rounded-xl overflow-hidden bg-white`}
                      >
                        <div
                          style={{
                            backgroundColor: activeExtendedTheme.tableHeadBgHex,
                            color: guaranteedTableHeadTextColor,
                            borderColor: activeExtendedTheme.borderHex,
                          }}
                          className="px-3 py-1.5 flex items-center justify-between gap-2 border-b-2"
                        >
                          <span className="text-[11px] font-black uppercase tracking-wide flex items-center gap-1.5">
                            <MarioWarpPipeIcon size={14} />
                            <span>II. Prescriptive &amp; Procedural Deadlines ({ONE_PAGE_LEGAL_DEADLINES.length})</span>
                          </span>
                          <span className="text-[9.5px] font-mono opacity-85">Arts. 297–306</span>
                        </div>
                        <div className="divide-y divide-slate-200">
                          {ONE_PAGE_LEGAL_DEADLINES.map((d, idx) => (
                            <div
                              key={d.id}
                              style={
                                idx % 2 === 1
                                  ? { backgroundColor: activeExtendedTheme.tableStripeBgHex }
                                  : { backgroundColor: '#FFFFFF' }
                              }
                              className="px-2.5 py-1 text-[10.5px] leading-snug space-y-0.5"
                            >
                              <div className="flex items-baseline justify-between gap-2">
                                <span
                                  style={{ color: activeExtendedTheme.bodyTextHex }}
                                  className="font-bold break-words min-w-0 flex-1"
                                >
                                  {d.claimOrAction}
                                </span>
                                <span
                                  style={{ color: activeExtendedTheme.accentHex }}
                                  className="font-mono font-black shrink-0 tabular-nums text-[10.5px]"
                                >
                                  {d.deadline}
                                </span>
                              </div>
                              <p
                                style={{ color: activeExtendedTheme.mutedTextHex }}
                                className="text-[10px] break-words"
                              >
                                <span className="font-semibold">{d.citation}:</span> {d.reckoningRule}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mario 8-Bit Brick Divider Strip */}
                    <MarioBrickStrip className="w-full h-1.5 rounded my-0.5 shadow-2xs" />

                    {/* Bottom A4 Strip: World 6 Statutory Leave Caps & Core Doctrines */}
                    <div
                      style={{
                        backgroundColor: activeExtendedTheme.accentSoftBgHex,
                        borderColor: activeExtendedTheme.borderHex,
                      }}
                      className={`border-2 rounded-xl p-2.5 space-y-1.5 ${subtleBoxClass}`}
                    >
                      <div
                        style={{ borderColor: activeExtendedTheme.borderHex }}
                        className="flex flex-wrap items-center justify-between gap-1 border-b pb-1"
                      >
                        <span
                          style={{ color: activeExtendedTheme.bodyTextHex }}
                          className="text-[11px] font-black uppercase flex items-center gap-1.5"
                        >
                          <MarioMushroomIcon size={14} variant="1up" />
                          <span>III. World 6 Statutory Leave Caps &amp; Core Tests</span>
                        </span>
                        <span
                          style={{ color: activeExtendedTheme.mutedTextHex }}
                          className="text-[9.5px] font-mono"
                        >
                          Comprehensive Statutory Reference · Bar Reviewer Edition
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10.5px]">
                        {ONE_PAGE_STATUTORY_LEAVE_CAPS.map((lv) => (
                          <div
                            key={lv.leaveName}
                            className="bg-white border border-slate-200 rounded-lg p-2 space-y-0.5"
                          >
                            <div className="font-bold text-slate-900 break-words text-[10px] leading-tight">{lv.leaveName}</div>
                            <div className="flex items-baseline justify-between gap-1 text-[9.5px]">
                              <span className="font-mono font-black text-amber-800 tabular-nums">{lv.cap}</span>
                              <span className="font-mono text-[8.5px] text-slate-500 shrink-0 font-semibold">{lv.citation}</span>
                            </div>
                            <p className="text-[9px] text-slate-600 block break-words leading-tight">{lv.rule}</p>
                          </div>
                        ))}
                      </div>

                      {/* Core Workplace Checkpoints matching PDF (2x2 Grid) */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] leading-snug">
                        <div
                          style={{
                            backgroundColor: activeExtendedTheme.tableStripeBgHex || '#FFFFFF',
                            borderColor: activeExtendedTheme.borderHex,
                          }}
                          className="rounded-lg border p-1.5 space-y-0.5"
                        >
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-amber-800 uppercase font-black font-mono text-[9.5px] min-w-0 flex-1 break-words">Four-Fold Control Test</span>
                            <span className="text-[8.5px] font-mono text-slate-500 shrink-0">Arts. 280, 295</span>
                          </div>
                          <p style={{ color: activeExtendedTheme.bodyTextHex }} className="font-medium text-[9.5px] leading-tight">
                            (1) Selection/Engagement, (2) Wage Payment, (3) Dismissal Power, (4) Control over means &amp; methods (Most Crucial).
                          </p>
                        </div>
                        <div
                          style={{
                            backgroundColor: activeExtendedTheme.tableStripeBgHex || '#FFFFFF',
                            borderColor: activeExtendedTheme.borderHex,
                          }}
                          className="rounded-lg border p-1.5 space-y-0.5"
                        >
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-emerald-800 uppercase font-black font-mono text-[9.5px] min-w-0 flex-1 break-words">Nominal Damages (Agabon/Jaka)</span>
                            <span className="text-[8.5px] font-mono text-slate-500 shrink-0">Due Process</span>
                          </div>
                          <p style={{ color: activeExtendedTheme.bodyTextHex }} className="font-medium text-[9.5px] leading-tight">
                            Valid Just Cause + defective Twin-Notice = P30,000 | Valid Authorized Cause + defective 30d Notice = P50,000.
                          </p>
                        </div>
                        <div
                          style={{
                            backgroundColor: activeExtendedTheme.tableStripeBgHex || '#FFFFFF',
                            borderColor: activeExtendedTheme.borderHex,
                          }}
                          className="rounded-lg border p-1.5 space-y-0.5"
                        >
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-blue-800 uppercase font-black font-mono text-[9.5px] min-w-0 flex-1 break-words">In Dubio Pro Operario</span>
                            <span className="text-[8.5px] font-mono text-slate-500 shrink-0">Art. 4, Labor Code</span>
                          </div>
                          <p style={{ color: activeExtendedTheme.bodyTextHex }} className="font-medium italic text-[9.5px] leading-tight">
                            All doubts in statutory interpretation &amp; implementation are resolved in favor of the working class.
                          </p>
                        </div>
                        <div
                          style={{
                            backgroundColor: activeExtendedTheme.tableStripeBgHex || '#FFFFFF',
                            borderColor: activeExtendedTheme.borderHex,
                          }}
                          className="rounded-lg border p-1.5 space-y-0.5"
                        >
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-purple-800 uppercase font-black font-mono text-[9.5px] min-w-0 flex-1 break-words">Burden of Proof in Dismissal</span>
                            <span className="text-[8.5px] font-mono text-slate-500 shrink-0">Art. 292 [277]</span>
                          </div>
                          <p style={{ color: activeExtendedTheme.bodyTextHex }} className="font-medium text-[9.5px] leading-tight">
                            The employer bears the burden of proving that employee dismissal was for valid cause and due process.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* IV. Research & Development Cohort Attribution Bar */}
                    <div
                      style={{
                        backgroundColor: activeExtendedTheme.tableStripeBgHex || '#F8FAFC',
                        borderColor: activeExtendedTheme.borderHex,
                        color: activeExtendedTheme.bodyTextHex,
                      }}
                      className={`border-2 rounded-xl px-3 py-2 space-y-1 text-[10px] ${subtleBoxClass}`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-1">
                        <span className="font-black uppercase tracking-wider text-[9px] text-amber-900 bg-amber-400 border border-amber-600 px-1.5 py-0.5 rounded shadow-xs inline-flex items-center gap-1">
                          <MarioSuperStarIcon size={12} />
                          <span>Research Cohort · 9 Members</span>
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono shrink-0">
                          P.D. No. 442 Master Summary · {activeExtendedFont.name}
                        </span>
                      </div>
                      <div className="text-[9.5px] font-semibold text-slate-900 tracking-tight leading-snug flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <a
                          href="https://www.facebook.com/anmnso"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-black text-amber-800 hover:underline hover:text-amber-950 transition-colors inline-flex items-center gap-0.5"
                          title="Open Matthew Cesar Corpuz Facebook Profile"
                        >
                          <span>CORPUZ (Main Creator · Executed All Roles)</span>
                        </a>
                        <span className="text-slate-400">·</span>
                        <a href="https://www.facebook.com/mary.louise.73997861" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-700 text-slate-900 transition-colors" title="Open Mary Louise Cruz Facebook Profile">CRUZ</a>
                        <span className="text-slate-400">·</span>
                        <a href="https://www.facebook.com/tfl.fanged" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-700 text-slate-900 transition-colors" title="Open Tracy Fae Fanged Facebook Profile">FANGED</a>
                        <span className="text-slate-400">·</span>
                        <a href="https://www.facebook.com/jelyn.fernandez.96" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-700 text-slate-900 transition-colors" title="Open Jelyn Fernandez Facebook Profile">FERNANDEZ</a>
                        <span className="text-slate-400">·</span>
                        <a href="https://www.facebook.com/ronieeeegarcia" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-700 text-slate-900 transition-colors" title="Open Aeron Steven Garcia Facebook Profile">GARCIA</a>
                        <span className="text-slate-400">·</span>
                        <a href="https://www.facebook.com/mhelbourne.garvida.2024" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-700 text-slate-900 transition-colors" title="Open Mhelbourne Garvida Facebook Profile">GARVIDA</a>
                        <span className="text-slate-400">·</span>
                        <a href="https://www.facebook.com/abigail.manalac.3994" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-700 text-slate-900 transition-colors" title="Open Abigail Mañalac Facebook Profile">MAÑALAC</a>
                        <span className="text-slate-400">·</span>
                        <a href="https://www.facebook.com/beyonce.untalan" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-700 text-slate-900 transition-colors" title="Open Beyonce Helein Untalan Facebook Profile">UNTALAN</a>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-900">VILA</span>
                      </div>
                    </div>
                  </div>
                ) : documentMode === 'certificate' ? (
                  /* ==================== EXECUTIVE CERTIFICATE OF STATUTORY COMPLETION (PORTRAIT 794x1122 OR LANDSCAPE 1122x794) ==================== */
                  <div
                    id="official-labor-certificate"
                    data-testid="official-labor-certificate"
                    data-theme={activeExtendedTheme.id}
                    data-font={activeExtendedFont.id}
                    data-orientation={certOrientation}
                    data-single-page="true"
                    style={activeSheetDynamicStyle}
                    className={`${certThemeClasses.paper} ${bodyFontClass} text-slate-950 ${
                      certOrientation === 'portrait'
                        ? 'px-12 py-10 min-h-[1122px] h-auto'
                        : 'px-14 py-9 min-h-[794px] h-auto'
                    } border-[14px] rounded-3xl shadow-2xl w-full relative select-text flex flex-col justify-between overflow-visible box-border outline outline-2 outline-amber-700/50 print:p-6 print:border-8 print:min-h-0 print:max-h-none print:h-auto print:overflow-visible print:shadow-none print:outline-none`}
                  >
                    {/* Corner Ornaments */}
                    <div className={`absolute top-3 left-3 w-9 h-9 border-t-3 border-l-3 ${certThemeClasses.corner} flex items-center justify-center`}>
                      <MarioSuperStarIcon size={20} />
                    </div>
                    <div className={`absolute top-3 right-3 w-9 h-9 border-t-3 border-r-3 ${certThemeClasses.corner} flex items-center justify-center`}>
                      <MarioSuperStarIcon size={20} />
                    </div>
                    <div className={`absolute bottom-3 left-3 w-9 h-9 border-b-3 border-l-3 ${certThemeClasses.corner} flex items-center justify-center`}>
                      <MarioSuperStarIcon size={20} />
                    </div>
                    <div className={`absolute bottom-3 right-3 w-9 h-9 border-r-3 border-b-3 ${certThemeClasses.corner} flex items-center justify-center`}>
                      <MarioSuperStarIcon size={20} />
                    </div>

                    {/* Header Seal & Title */}
                    <div className="text-center space-y-2 shrink-0">
                      <div className="flex items-center justify-center gap-4">
                        <div className={`w-14 h-14 rounded-full border-2 ${certThemeClasses.sealCircle} flex items-center justify-center shrink-0 shadow-md`}>
                          <MarioCoinBlockIcon size={28} />
                        </div>
                        <div>
                          <p className="text-base font-extrabold uppercase tracking-[0.2em] text-slate-800">
                            REPUBLIC OF THE PHILIPPINES · PHILIPPINE LABOR STANDARDS GUIDE
                          </p>
                          <p className="text-sm font-bold tracking-wider text-slate-700 uppercase">
                            Department of Labor and Employment · Executive Statutory Completion Record
                          </p>
                        </div>
                      </div>

                      <div className="pt-1.5">
                        <h2
                          style={{
                            borderColor: activeExtendedTheme.borderHex,
                            color: activeExtendedTheme.accentHex,
                          }}
                          className={`${
                            certOrientation === 'portrait' ? 'text-5xl' : 'text-5xl lg:text-6xl'
                          } font-black tracking-wide uppercase border-y-2 py-2.5 my-2.5 ${certThemeClasses.title}`}
                        >
                          Certificate of Statutory Completion
                        </h2>
                        <p className="text-lg font-serif italic text-slate-700">
                          This Executive Honor Certificate is Proudly Conferred Upon
                        </p>
                      </div>
                    </div>

                    {/* Recipient */}
                    <div className="text-center py-2 shrink-0">
                      <h3
                        className={`${
                          certOrientation === 'portrait' ? 'text-5xl' : 'text-5xl lg:text-6xl'
                        } font-black text-slate-950 tracking-tight border-b-2 border-slate-900 pb-2.5 max-w-3xl mx-auto break-words leading-tight`}
                      >
                        {candidateName.trim() || playerName || 'Distinguished Labor Standards Scholar'}
                      </h3>
                      <p className={`text-lg font-black tracking-widest uppercase mt-3 ${certThemeClasses.honors}`}>
                        {certificateHonors}
                      </p>
                    </div>

                    {/* Body Certification text */}
                    <div className="text-center space-y-3.5 max-w-4xl mx-auto flex-1 flex flex-col justify-center my-2">
                      <p className="text-lg text-slate-800 leading-relaxed max-w-3xl mx-auto">
                        for demonstrating comprehensive statutory mastery and practical command across all Six Worlds of the <strong className="font-bold text-slate-950">Labor Code of the Philippines (Presidential Decree No. 442, as amended)</strong>, encompassing Hours of Work &amp; Overtime Rules, Wages &amp; D.O. 174 Subcontracting, Kasambahay Rights, Security of Tenure, and all Statutory Leaves.
                      </p>

                      {/* 6 World Badges Strip */}
                      <div
                        className={`grid ${
                          certOrientation === 'portrait' ? 'grid-cols-2 gap-3' : 'grid-cols-6 gap-3'
                        } pt-2.5 text-sm font-bold`}
                      >
                        {WORLDS_METADATA.map((w) => (
                          <div key={w.id} className={`border px-3 py-2.5 rounded-xl text-center min-w-0 shadow-xs ${certThemeClasses.badge}`}>
                            <span className="block font-black font-mono text-sm">WORLD {w.worldNumber}</span>
                            <span className="block leading-snug truncate mt-0.5 text-[13px]">{w.shortTitle}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Signatures & Seal Footer */}
                    <div className="pt-4 border-t-2 border-amber-600/60 grid grid-cols-3 items-end gap-6 text-center shrink-0">
                      <div className="space-y-1.5 min-w-0 px-2 flex flex-col items-center">
                        <div className="border-b-2 border-slate-900 mx-auto max-w-[260px] pb-1 flex flex-col items-center">
                          <svg viewBox="0 0 240 50" className="w-56 h-12 overflow-visible text-slate-950 font-preserve select-none" fill="none">
                            <path
                              d="M10 38 C15 15, 25 10, 32 35 C35 22, 42 20, 48 34 C54 22, 60 20, 66 36 C70 16, 78 12, 75 38 M30 22 L76 20 M88 30 C94 20, 102 20, 100 34 C104 24, 112 22, 118 32 C122 24, 130 26, 128 36 M138 34 C146 14, 160 12, 154 36 C158 25, 168 24, 172 34 C178 24, 186 26, 184 36 C190 26, 198 28, 196 38 C202 28, 212 30, 208 40 M145 44 C110 46, 50 47, 12 45 C45 44, 130 45, 218 42"
                              stroke="currentColor"
                              strokeWidth="2.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-base font-black text-slate-800 uppercase leading-tight truncate">
                          Matthew Cesar Corpuz
                        </p>
                        <p className="text-sm text-slate-600 leading-tight">
                          Main Creator &amp; Lead Author (Executed All Roles)
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center shrink-0">
                        <div className="relative flex flex-col items-center">
                          <div className="w-22 h-22 rounded-full border-4 border-amber-500 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex flex-col items-center justify-center text-slate-950 shadow-md z-10">
                            <MarioSuperStarIcon size={28} />
                            <span className="text-[10px] font-black tracking-wider uppercase leading-none mt-1">
                              SEALED
                            </span>
                          </div>
                          <div className="flex items-center gap-2 -mt-2.5 z-0">
                            <div className="w-4 h-6 bg-amber-600 border border-amber-800 -rotate-12 rounded-b-xs shadow-xs" />
                            <div className="w-4 h-6 bg-amber-600 border border-amber-800 rotate-12 rounded-b-xs shadow-xs" />
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-700 font-bold mt-1">
                          VERIFIED {currentDate}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 font-semibold">
                          ID: PH-LAW-{Math.abs(completedCount * 137 + 442).toString(16).toUpperCase()}
                        </span>
                      </div>

                      <div className="space-y-1.5 min-w-0 px-2 flex flex-col items-center">
                        <div className="border-b-2 border-slate-900 mx-auto max-w-[260px] pb-1 flex flex-col items-center">
                          <svg viewBox="0 0 240 50" className="w-56 h-12 overflow-visible text-slate-950 font-preserve select-none" fill="none">
                            <path
                              d="M12 36 C22 14, 38 12, 46 32 C52 18, 64 16, 72 32 C78 20, 92 18, 102 34 C108 16, 126 14, 122 36 M38 24 L118 22 M134 30 C142 16, 158 14, 154 34 C160 22, 174 20, 182 32 C188 22, 202 24, 198 38 M140 42 C105 44, 45 45, 14 43 C50 42, 135 43, 222 40"
                              stroke="currentColor"
                              strokeWidth="2.7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="italic font-bold text-base text-slate-900 leading-tight">
                          Labor Standards Academic Board
                        </p>
                        <p className="text-sm font-black text-slate-800 uppercase leading-tight truncate">
                          Philippine Labor Standards Directorate
                        </p>
                        <p className="text-xs text-slate-600 leading-tight">
                          Academic Registrar &amp; Statutory Counsel
                        </p>
                      </div>
                    </div>
                  </div>
                ) : documentMode === 'scorecard' ? (
                  /* ==================== OFFICIAL HERO SCORE CARD & MASTERY DOSSIER (A4 LANDSCAPE 1122x794) ==================== */
                  <div
                    id="official-scorecard-sheet"
                    data-testid="official-scorecard-sheet"
                    data-theme={activeExtendedTheme.id}
                    data-font={activeExtendedFont.id}
                    data-single-page="true"
                    style={activeSheetDynamicStyle}
                    className={`${certThemeClasses.paper} ${bodyFontClass} text-slate-950 px-9 py-8 border-[10px] rounded-3xl shadow-2xl w-full min-h-[794px] h-auto select-text flex flex-col justify-between overflow-visible box-border outline outline-2 outline-amber-700/50 print:px-5 print:py-4 print:border-4 print:min-h-0 print:max-h-none print:h-auto print:overflow-visible print:shadow-none print:outline-none`}
                  >
                    {/* Top Banner */}
                    <div
                      style={{
                        backgroundColor: activeExtendedTheme.headerBgHex,
                        color: guaranteedHeaderTextColor,
                        borderColor: activeExtendedTheme.borderHex,
                      }}
                      className="rounded-2xl p-5 flex items-center justify-between gap-5 border-2 shrink-0 shadow-sm"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shrink-0 shadow-sm">
                          <MarioSuperStarIcon size={32} />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <span
                            style={{ color: guaranteedHeaderTextColor }}
                            className="text-sm font-mono font-black uppercase tracking-widest opacity-95 block truncate"
                          >
                            SUPER MARIO LABOR ADVENTURE · OFFICIAL HERO SCORE CARD · {activeExtendedTheme.name.toUpperCase()}
                          </span>
                          <h2
                            style={{ color: guaranteedHeaderTextColor }}
                            className="text-4xl font-black tracking-tight truncate leading-tight"
                          >
                            {candidateName.trim() || playerName || 'Labor Scholar Hero'}
                          </h2>
                          <p
                            style={{ color: guaranteedHeaderTextColor }}
                            className="text-base font-bold opacity-95 truncate"
                          >
                            {heroRankLabel} · Hero: {heroDisplayName} · Font: {activeExtendedFont.name}
                          </p>
                        </div>
                      </div>
                      <div
                        style={{
                          backgroundColor: activeExtendedTheme.accentSoftBgHex,
                          borderColor: activeExtendedTheme.borderHex,
                          color: activeExtendedTheme.bodyTextHex,
                        }}
                        className={`px-5 py-3 rounded-2xl border-2 text-center shrink-0 shadow-xs ${certThemeClasses.badge}`}
                      >
                        <span className="text-5xl font-black font-mono tabular-nums block leading-tight">
                          {overallPercent}%
                        </span>
                        <span className="text-sm font-bold block whitespace-nowrap mt-0.5">
                          {completedCount} / {totalTopics} Mastered
                        </span>
                      </div>
                    </div>

                    {/* 5 KPI Stat Tiles */}
                    <div className="grid grid-cols-5 gap-3 shrink-0 my-1.5">
                      {[
                        {
                          label: 'STUDY TIME',
                          val: studyDurationFormatted,
                          icon: <Clock className="w-4 h-4 text-slate-500 inline mr-1" />,
                        },
                        {
                          label: 'GOLD COINS',
                          val: `x${coins}`,
                          icon: <MarioCoinIcon size={16} className="inline mr-1" />,
                        },
                        {
                          label: 'LOGIN STREAK',
                          val: `${loginStreak} Days`,
                          icon: <MarioFireFlowerIcon size={16} className="inline mr-1" />,
                        },
                        {
                          label: 'BADGES EARNED',
                          val: `${unlockedAchievementsCount}/${totalAchievementsCount}`,
                          icon: <MarioSuperStarIcon size={16} className="inline mr-1" />,
                        },
                        {
                          label: 'QUIZ RUNS',
                          val: `${quizRunsCompleted} Cleared`,
                          icon: <MarioMushroomIcon size={16} variant="super" className="inline mr-1" />,
                        },
                      ].map((tile) => (
                        <div
                          key={tile.label}
                          className={`rounded-2xl border-2 ${headingBorderClass} ${subtleBoxClass} p-3 space-y-1 shadow-2xs`}
                        >
                          <span className="text-xs font-mono font-black text-slate-700 flex items-center truncate">
                            {tile.icon}
                            <span className="truncate">{tile.label}</span>
                          </span>
                          <span className="text-2xl font-black font-mono text-slate-950 tabular-nums block truncate">
                            {tile.val}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Six-World Breakdown Grid */}
                    <div className="space-y-2 flex-1 min-h-0 flex flex-col justify-center my-1.5">
                      <div className={`border-b-2 ${headingBorderClass} pb-1.5 flex items-center justify-between shrink-0`}>
                        <h3 className="text-base font-black uppercase tracking-wide text-slate-950 flex items-center gap-2">
                          <MarioCoinBlockIcon size={20} />
                          <span>Six-World Philippine Labor Standards Mastery Breakdown</span>
                        </h3>
                        <span className="text-xs font-mono text-slate-700 font-bold">Issued: {currentDate}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3.5">
                        {scoreCardWorldBreakdown.map((wb) => (
                          <div
                            key={wb.worldNumber}
                            className="bg-white border border-slate-300 rounded-2xl p-3.5 space-y-2 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2 text-base">
                              <span className="font-black text-slate-950 flex items-center gap-1.5 truncate">
                                <MarioWarpPipeIcon size={16} className="shrink-0" />
                                <span className="truncate">W{wb.worldNumber}: {wb.shortTitle}</span>
                              </span>
                              <span className="font-mono font-black text-slate-800 tabular-nums shrink-0">
                                {wb.percent}% ({wb.completed}/{wb.total})
                              </span>
                            </div>
                            <div className="h-3.5 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                              <div
                                style={{ width: `${Math.max(wb.percent > 0 ? 4 : 0, wb.percent)}%` }}
                                className={`h-full rounded-full transition-all duration-300 ${
                                  wb.percent === 100 ? 'bg-emerald-600' : 'bg-amber-500'
                                }`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mario 8-Bit Brick Divider Strip */}
                    <MarioBrickStrip className="w-full h-2 rounded my-1 shadow-2xs shrink-0" />

                    {/* Official Authentication & Signature Footer */}
                    <div className={`border-t-2 ${headingBorderClass} pt-2.5 grid grid-cols-3 items-center gap-4 text-xs font-mono text-slate-700 shrink-0`}>
                      <div className="flex items-center gap-2 min-w-0">
                        <MarioSuperStarIcon size={20} className="shrink-0 text-amber-500" />
                        <span className="truncate font-bold text-slate-800">Philippine Labor Standards Board Verified</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <svg viewBox="0 0 240 50" className="w-44 sm:w-52 h-11 overflow-visible text-slate-950 font-preserve select-none" fill="none">
                          <path
                            d="M10 38 C15 15, 25 10, 32 35 C35 22, 42 20, 48 34 C54 22, 60 20, 66 36 C70 16, 78 12, 75 38 M30 22 L76 20 M88 30 C94 20, 102 20, 100 34 C104 24, 112 22, 118 32 C122 24, 130 26, 128 36 M138 34 C146 14, 160 12, 154 36 C158 25, 168 24, 172 34 C178 24, 186 26, 184 36 C190 26, 198 28, 196 38 C202 28, 212 30, 208 40 M145 44 C110 46, 50 47, 12 45 C45 44, 130 45, 218 42"
                            stroke="currentColor"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-xs font-black uppercase text-slate-900 border-t border-slate-900 px-3 truncate">
                          Matthew Cesar Corpuz (Main Creator)
                        </span>
                      </div>
                      <div className="text-right truncate font-bold text-slate-900">
                        <span>Official ID: PH-SCORE-{Math.abs(completedCount * 313 + 442).toString(16).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ) : documentMode === 'diploma' ? (
                  /* ==================== ROYAL GRAND MASTER JURIS DIPLOMA (A4 LANDSCAPE 1122x794) ==================== */
                  <div
                    id="royal-juris-diploma-sheet"
                    data-testid="royal-juris-diploma-sheet"
                    data-theme={activeExtendedTheme.id}
                    data-font={activeExtendedFont.id}
                    data-orientation="landscape"
                    data-single-page="true"
                    style={activeSheetDynamicStyle}
                    className={`${certThemeClasses.paper} ${bodyFontClass} text-slate-950 p-11 border-[16px] rounded-3xl shadow-2xl w-full min-h-[794px] h-auto select-text flex flex-col justify-between overflow-visible box-border outline outline-3 outline-amber-600/70 relative print:p-6 print:border-8 print:min-h-0 print:max-h-none print:h-auto print:overflow-visible print:shadow-none print:outline-none`}
                  >
                    {/* Filigree Corner Accents */}
                    <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-amber-600/80 flex items-center justify-center">
                      <MarioSuperStarIcon size={24} />
                    </div>
                    <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-amber-600/80 flex items-center justify-center">
                      <MarioSuperStarIcon size={24} />
                    </div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-amber-600/80 flex items-center justify-center">
                      <MarioSuperStarIcon size={24} />
                    </div>
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-amber-600/80 flex items-center justify-center">
                      <MarioSuperStarIcon size={24} />
                    </div>

                    {/* Grand Latin Header */}
                    <div className="text-center space-y-2 shrink-0 pt-2">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-sm font-mono font-black uppercase tracking-[0.3em] text-amber-900">
                          ACADEMIA DE JURE LABORIS PHILIPPINARUM
                        </span>
                      </div>
                      <h2
                        style={{
                          borderColor: activeExtendedTheme.borderHex,
                          color: activeExtendedTheme.accentHex,
                        }}
                        className="text-4xl lg:text-5xl font-black uppercase tracking-wider py-1 border-y-2 max-w-4xl mx-auto"
                      >
                        Royal Grand Master Juris Diploma
                      </h2>
                      <p className="text-base font-serif italic text-slate-700">
                        In Omnibus Articulis Codicis Laboris Philippinarum Laureatus
                      </p>
                    </div>

                    {/* Candidate Name & Conferral */}
                    <div className="text-center py-2 space-y-2 shrink-0">
                      <p className="text-sm uppercase tracking-widest font-bold text-slate-600">
                        Hoc Diplomate Sollemniter Testamur
                      </p>
                      <h3 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tight border-b-2 border-slate-900 pb-2 max-w-3xl mx-auto truncate">
                        {candidateName.trim() || playerName || 'Grand Master Labor Jurist'}
                      </h3>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-400 text-amber-950 font-black text-sm uppercase tracking-wider shadow-xs">
                        <MarioSuperStarIcon size={18} />
                        <span>{certificateHonors} · SUMMA JURIS DOCTRINA</span>
                        <MarioSuperStarIcon size={18} />
                      </div>
                    </div>

                    {/* Statement of Mastery */}
                    <div className="text-center max-w-4xl mx-auto space-y-2 px-4">
                      <p className="text-base text-slate-800 leading-relaxed">
                        For demonstrating consummate legal acumen, flawless doctrinal command, and practical mastery of the entire codal architecture of <strong className="font-bold text-slate-950">Presidential Decree No. 442 (The Labor Code of the Philippines)</strong>, including Hours of Work (Arts. 83-90), Rest &amp; Holiday Wages (Arts. 91-95), 13th Month Pay (P.D. 851), D.O. 174 Subcontracting, Kasambahay Protections (R.A. 10361), and all Statutory Leaves.
                      </p>
                      <div className="grid grid-cols-6 gap-2 pt-2">
                        {WORLDS_METADATA.map((w) => (
                          <div key={w.id} className="bg-white/80 border border-amber-300 rounded-xl p-2 text-center shadow-2xs">
                            <span className="block text-[11px] font-mono font-black text-amber-950">WORLD {w.worldNumber}</span>
                            <span className="block text-[10px] font-bold text-slate-700 truncate">{w.shortTitle}</span>
                            <span className="block text-[9px] font-mono text-emerald-700 font-bold">100% MASTERED</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Signatures & Seal */}
                    <div className="pt-3 border-t-2 border-amber-700/60 grid grid-cols-3 items-end gap-6 text-center shrink-0">
                      <div className="space-y-1 flex flex-col items-center">
                        <div className="border-b-2 border-slate-900 mx-auto max-w-[240px] pb-1 flex flex-col items-center">
                          <svg viewBox="0 0 240 50" className="w-52 h-11 overflow-visible text-slate-950 font-preserve select-none" fill="none">
                            <path
                              d="M10 38 C15 15, 25 10, 32 35 C35 22, 42 20, 48 34 C54 22, 60 20, 66 36 C70 16, 78 12, 75 38 M30 22 L76 20 M88 30 C94 20, 102 20, 100 34 C104 24, 112 22, 118 32 C122 24, 130 26, 128 36 M138 34 C146 14, 160 12, 154 36 C158 25, 168 24, 172 34 C178 24, 186 26, 184 36 C190 26, 198 28, 196 38 C202 28, 212 30, 208 40 M145 44 C110 46, 50 47, 12 45 C45 44, 130 45, 218 42"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-black text-slate-800 uppercase">
                          Matthew Cesar Corpuz
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Main Creator · Lead Author · Full-Stack Architect
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <div className="relative flex flex-col items-center">
                          <div className="w-22 h-22 rounded-full border-4 border-amber-600 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 flex flex-col items-center justify-center text-slate-950 shadow-md z-10">
                            <MarioSuperStarIcon size={28} />
                            <span className="text-[10px] font-black tracking-widest uppercase mt-0.5">SOLEMNIS</span>
                            <span className="text-[8px] font-mono font-bold">A.D. {new Date().getFullYear()}</span>
                          </div>
                          <div className="flex items-center gap-2 -mt-2.5 z-0">
                            <div className="w-4 h-6 bg-amber-700 border border-amber-900 -rotate-12 rounded-b-xs shadow-xs" />
                            <div className="w-4 h-6 bg-amber-700 border border-amber-900 rotate-12 rounded-b-xs shadow-xs" />
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-800 font-bold mt-1">Conferred: {currentDate}</span>
                      </div>

                      <div className="space-y-1 flex flex-col items-center">
                        <div className="border-b-2 border-slate-900 mx-auto max-w-[240px] pb-1 flex flex-col items-center">
                          <svg viewBox="0 0 240 50" className="w-52 h-11 overflow-visible text-slate-950 font-preserve select-none" fill="none">
                            <path
                              d="M14 34 C24 16, 42 14, 52 32 C60 18, 74 16, 84 32 C92 18, 110 16, 120 34 M36 24 L122 22 M136 30 C146 16, 164 14, 160 34 C168 22, 184 20, 192 32 M144 42 C108 44, 46 45, 14 43 C52 42, 138 43, 224 40"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="italic font-bold text-sm text-slate-900 leading-tight">
                          High Chancellor of Labor Jurisprudence
                        </p>
                        <p className="text-xs font-black text-slate-800 uppercase">
                          Philippine Labor Law Directorate
                        </p>
                        <p className="text-[10px] text-slate-600">
                          Supreme Board of Statutory Certification
                        </p>
                      </div>
                    </div>
                  </div>
                ) : documentMode === 'cheatsheet' ? (
                  /* ==================== STATUTORY MULTIPLIERS & WAGE MATRIX CHEATSHEET (A4 PORTRAIT 794x1122) ==================== */
                  <div
                    id="statutory-cheatsheet-sheet"
                    data-testid="statutory-cheatsheet-sheet"
                    data-theme={activeExtendedTheme.id}
                    data-font={activeExtendedFont.id}
                    data-orientation="portrait"
                    data-single-page="true"
                    style={activeSheetDynamicStyle}
                    className={`${summaryPaperBgClass} ${bodyFontClass} text-slate-950 p-8 rounded-2xl border-2 shadow-2xl w-full min-h-[1122px] h-auto select-text flex flex-col justify-between overflow-visible box-border print:p-4 print:border-2 print:min-h-0 print:max-h-none print:h-auto print:overflow-visible print:shadow-none`}
                  >
                    {/* Header */}
                    <div
                      style={{
                        backgroundColor: activeExtendedTheme.headerBgHex,
                        color: guaranteedHeaderTextColor,
                        borderColor: activeExtendedTheme.borderHex,
                      }}
                      className="rounded-2xl p-4 border-2 flex items-center justify-between gap-4 shadow-sm shrink-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center shadow-xs shrink-0">
                          <MarioCoinBlockIcon size={26} />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest block opacity-90">
                            P.D. 442 · OFFICIAL STATUTORY COMPUTATIONS MATRIX
                          </span>
                          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                            Philippine Labor Pay Multipliers Cheatsheet
                          </h2>
                          <p className="text-xs opacity-90">
                            Articles 83–94 Labor Code, P.D. 851, R.A. 10361, and DOLE Handbook
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs hidden sm:block">
                        <span className="block font-bold">DOLE COMPLIANT</span>
                        <span className="opacity-80">Issued: {currentDate}</span>
                      </div>
                    </div>

                    {/* Section 1: Statutory Multipliers Table */}
                    <div className="my-2 space-y-2">
                      <div className="flex items-center justify-between border-b pb-1 border-slate-300">
                        <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-1.5">
                          <MarioCoinIcon size={16} />
                          <span>1. Statutory Holiday, Rest Day &amp; Overtime Multipliers Matrix</span>
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">Arts. 87, 93, 94 Labor Code</span>
                      </div>
                      <table className="w-full text-xs border border-slate-300 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 border-b border-slate-300 font-black text-slate-900">
                          <tr>
                            <th className="p-2 text-left">Work Schedule / Day Type</th>
                            <th className="p-2 text-center">Unworked Pay</th>
                            <th className="p-2 text-center">Worked (First 8h)</th>
                            <th className="p-2 text-center">Overtime (&gt; 8h)</th>
                            <th className="p-2 text-center">Worked on Rest Day</th>
                            <th className="p-2 text-center">OT on Rest Day</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr className="bg-white">
                            <td className="p-2 font-bold">Ordinary Regular Day</td>
                            <td className="p-2 text-center font-mono text-slate-500">—</td>
                            <td className="p-2 text-center font-mono font-bold">100%</td>
                            <td className="p-2 text-center font-mono font-black text-indigo-700 bg-indigo-50/50">125%</td>
                            <td className="p-2 text-center font-mono text-slate-500">—</td>
                            <td className="p-2 text-center font-mono text-slate-500">—</td>
                          </tr>
                          <tr className="bg-slate-50/70">
                            <td className="p-2 font-bold">Scheduled Rest Day</td>
                            <td className="p-2 text-center font-mono text-slate-500">—</td>
                            <td className="p-2 text-center font-mono font-bold text-emerald-700">130%</td>
                            <td className="p-2 text-center font-mono font-black text-indigo-700 bg-indigo-50/50">169%</td>
                            <td className="p-2 text-center font-mono font-bold text-emerald-700">130%</td>
                            <td className="p-2 text-center font-mono font-black text-indigo-700 bg-indigo-50/50">169%</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="p-2 font-bold">Special Non-Working Day</td>
                            <td className="p-2 text-center font-mono text-slate-500">No Pay (Unless policy)</td>
                            <td className="p-2 text-center font-mono font-bold text-emerald-700">130%</td>
                            <td className="p-2 text-center font-mono font-black text-indigo-700 bg-indigo-50/50">169%</td>
                            <td className="p-2 text-center font-mono font-bold text-amber-700">150%</td>
                            <td className="p-2 text-center font-mono font-black text-amber-800 bg-amber-50">195%</td>
                          </tr>
                          <tr className="bg-amber-50/40">
                            <td className="p-2 font-bold">Regular Holiday</td>
                            <td className="p-2 text-center font-mono font-black text-emerald-800">100%</td>
                            <td className="p-2 text-center font-mono font-black text-blue-700">200%</td>
                            <td className="p-2 text-center font-mono font-black text-blue-800 bg-blue-50/50">260%</td>
                            <td className="p-2 text-center font-mono font-black text-purple-700">260%</td>
                            <td className="p-2 text-center font-mono font-black text-purple-800 bg-purple-50">338%</td>
                          </tr>
                          <tr className="bg-red-50/40">
                            <td className="p-2 font-bold">Double Regular Holiday</td>
                            <td className="p-2 text-center font-mono font-black text-emerald-800">200%</td>
                            <td className="p-2 text-center font-mono font-black text-red-700">300%</td>
                            <td className="p-2 text-center font-mono font-black text-red-800 bg-red-50">390%</td>
                            <td className="p-2 text-center font-mono font-black text-red-800">390%</td>
                            <td className="p-2 text-center font-mono font-black text-red-900 bg-red-100/60">507%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Section 2: Statutory Formulas & Night Differential */}
                    <div className="grid grid-cols-2 gap-3 my-2">
                      <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-1.5 shadow-2xs">
                        <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1">
                          <MarioFireFlowerIcon size={14} />
                          <span>Night Shift Differential (NSD)</span>
                        </h4>
                        <p className="text-xs text-slate-700">
                          <strong className="font-bold">Article 86:</strong> Additional <span className="font-bold text-indigo-700">10%</span> of regular wage for each hour worked between <strong className="font-mono">10:00 PM and 6:00 AM</strong>.
                        </p>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] font-mono">
                          NSD Rate = Hourly Rate x 1.10 x Hours Worked (10PM-6AM)
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-1.5 shadow-2xs">
                        <h4 className="text-xs font-black uppercase text-slate-900 flex items-center gap-1">
                          <MarioSuperStarIcon size={14} />
                          <span>13th Month Pay (P.D. 851)</span>
                        </h4>
                        <p className="text-xs text-slate-700">
                          Mandatory benefit for all rank-and-file employees who worked at least 1 month in the calendar year. Due on or before <strong className="font-bold">December 24</strong>.
                        </p>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200 text-[11px] font-mono">
                          13th Month = Total Basic Salary Earned in Year / 12
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Statutory Leaves Directory */}
                    <div className="my-2 space-y-2">
                      <div className="flex items-center justify-between border-b pb-1 border-slate-300">
                        <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-1.5">
                          <MarioMushroomIcon size={16} variant="super" />
                          <span>2. Complete Philippine Statutory Leaves Directory</span>
                        </h3>
                        <span className="text-[10px] font-mono text-slate-500 font-bold">DOLE Standards</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="border border-slate-300 rounded-xl p-2.5 bg-white space-y-1 shadow-2xs">
                          <span className="font-black text-slate-950 block">Service Incentive Leave (SIL)</span>
                          <span className="font-mono text-emerald-700 font-black block">5 Days Full Pay</span>
                          <p className="text-[11px] text-slate-600">Art. 95: After 1 year of service. Commutable to cash if unused.</p>
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2.5 bg-white space-y-1 shadow-2xs">
                          <span className="font-black text-slate-950 block">Maternity Leave (R.A. 11210)</span>
                          <span className="font-mono text-pink-700 font-black block">105 Days (120 Solo)</span>
                          <p className="text-[11px] text-slate-600">Full pay with SSS benefits; 60 days for miscarriage/emergency.</p>
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2.5 bg-white space-y-1 shadow-2xs">
                          <span className="font-black text-slate-950 block">Paternity Leave (R.A. 8187)</span>
                          <span className="font-mono text-blue-700 font-black block">7 Days Full Pay</span>
                          <p className="text-[11px] text-slate-600">First 4 deliveries of legitimate spouse cohabiting with husband.</p>
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2.5 bg-white space-y-1 shadow-2xs">
                          <span className="font-black text-slate-950 block">Solo Parent Leave (R.A. 11861)</span>
                          <span className="font-mono text-indigo-700 font-black block">7 Days Full Pay</span>
                          <p className="text-[11px] text-slate-600">For qualified solo parents after 6 months of continuous service.</p>
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2.5 bg-white space-y-1 shadow-2xs">
                          <span className="font-black text-slate-950 block">VAWC Leave (R.A. 9262)</span>
                          <span className="font-mono text-purple-700 font-black block">10 Days Full Pay</span>
                          <p className="text-[11px] text-slate-600">For female victims of violence; requires Barangay/Court cert.</p>
                        </div>
                        <div className="border border-slate-300 rounded-xl p-2.5 bg-white space-y-1 shadow-2xs">
                          <span className="font-black text-slate-950 block">Magna Carta Leave (R.A. 9710)</span>
                          <span className="font-mono text-rose-700 font-black block">Up to 2 Months Full Pay</span>
                          <p className="text-[11px] text-slate-600">For female employees recovering from gynecological surgeries.</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Retirement Pay & Subcontracting Rules */}
                    <div className="grid grid-cols-2 gap-3 my-2 text-xs">
                      <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-1.5 shadow-2xs">
                        <h4 className="font-black uppercase text-slate-900 flex items-center gap-1">
                          <MarioCoinBlockIcon size={14} />
                          <span>Retirement Pay Formula (Art. 302 / R.A. 7641)</span>
                        </h4>
                        <p className="text-slate-700 leading-snug">
                          Minimum 1/2 month salary per year of service (at least 60 yrs old, 5 yrs service):
                        </p>
                        <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[11px]">
                          1/2 month = 15 days basic + 5 days SIL + 1/12 of 13th month = <strong>22.5 days salary per year</strong>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-300 rounded-xl p-3 space-y-1.5 shadow-2xs">
                        <h4 className="font-black uppercase text-slate-900 flex items-center gap-1">
                          <MarioWarpPipeIcon size={14} />
                          <span>D.O. 174-17 Legitimate Contracting Test</span>
                        </h4>
                        <ul className="text-slate-700 list-disc list-inside space-y-0.5 text-[11px]">
                          <li>Substantial capital: paid-up capital of at least <strong>₱5,000,000</strong>.</li>
                          <li>Distinct and independent business; holds DOLE registration.</li>
                          <li>Principal exercises NO right of control over contractor's workers.</li>
                        </ul>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t-2 border-slate-300 pt-2 flex items-center justify-between text-xs font-mono text-slate-600 shrink-0">
                      <span>Super Mario Labor Standards Guide · Philippine Labor Code Compendium</span>
                      <span>Created by Matthew Cesar Corpuz (Lead Author)</span>
                    </div>
                  </div>
                ) : documentMode === 'bowser_victory' ? (
                  /* ==================== BOWSER COURTROOM VICTORY COMMENDATION (A4 LANDSCAPE 1122x794) ==================== */
                  <div
                    id="bowser-victory-sheet"
                    data-testid="bowser-victory-sheet"
                    data-theme={activeExtendedTheme.id}
                    data-font={activeExtendedFont.id}
                    data-orientation="landscape"
                    data-single-page="true"
                    style={activeSheetDynamicStyle}
                    className={`${certThemeClasses.paper} ${bodyFontClass} text-slate-950 p-11 border-[16px] rounded-3xl shadow-2xl w-full min-h-[794px] h-auto select-text flex flex-col justify-between overflow-visible box-border outline outline-3 outline-red-700/60 relative print:p-6 print:border-8 print:min-h-0 print:max-h-none print:h-auto print:overflow-visible print:shadow-none print:outline-none`}
                  >
                    {/* Header */}
                    <div className="text-center space-y-2 shrink-0 pt-2">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-sm font-mono font-black uppercase tracking-[0.3em] text-red-900">
                          SUPREME MOOT COURT OF THE MUSHROOM KINGDOM · EN BANC
                        </span>
                      </div>
                      <h2
                        style={{
                          borderColor: activeExtendedTheme.borderHex,
                          color: '#b91c1c',
                        }}
                        className="text-4xl lg:text-5xl font-black uppercase tracking-wider py-1 border-y-2 max-w-4xl mx-auto text-red-700"
                      >
                        Order of Supreme Courtroom Excellence
                      </h2>
                      <p className="text-base font-serif italic text-slate-700">
                        In Re: Complete Vanquishing of Bowser's Unfair Labor Practices &amp; Illegal Subcontracting
                      </p>
                    </div>

                    {/* Recipient */}
                    <div className="text-center py-2 space-y-2 shrink-0">
                      <p className="text-sm uppercase tracking-widest font-bold text-slate-600">
                        This High Judicial Commendation is Formally Awarded To
                      </p>
                      <h3 className="text-4xl lg:text-5xl font-black text-slate-950 tracking-tight border-b-2 border-slate-900 pb-2 max-w-3xl mx-auto truncate">
                        {candidateName.trim() || playerName || 'Supreme Labor Advocate'}
                      </h3>
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 border border-red-400 text-red-950 font-black text-sm uppercase tracking-wider shadow-xs">
                        <MarioSuperStarIcon size={18} />
                        <span>CHAMPION OF WORKPLACE JUSTICE · BOWSER DEFEATED</span>
                        <MarioSuperStarIcon size={18} />
                      </div>
                    </div>

                    {/* Verdict Citation Details */}
                    <div className="text-center max-w-4xl mx-auto space-y-2 px-4">
                      <p className="text-base text-slate-800 leading-relaxed">
                        Having successfully prosecuted and dismantled King Bowser's exploitative sweatshop schemes before the High Judicial Bar. The Court hereby affirms with finality that respondent Bowser violated <strong className="font-bold text-slate-950">Article 259 (Unfair Labor Practices)</strong>, <strong className="font-bold text-slate-950">D.O. 174-17 (Labor-Only Contracting)</strong>, and <strong className="font-bold text-slate-950">Article 87 (Unpaid Overtime)</strong>. Full backwages, moral damages, and immediate reinstatement are granted in favor of all Goombas and Toads.
                      </p>
                      <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
                        <div className="bg-white border border-red-200 rounded-xl p-2.5 shadow-2xs text-left">
                          <span className="font-bold text-red-800 block font-mono">DOCKET G.R. NO. 442-2026</span>
                          <span className="text-slate-600 block mt-0.5">Courtroom Boss Battle En Banc Resolution</span>
                        </div>
                        <div className="bg-white border border-red-200 rounded-xl p-2.5 shadow-2xs text-center">
                          <span className="font-bold text-emerald-800 block font-mono">VERDICT: UNANIMOUS AFFIRMANCE</span>
                          <span className="text-slate-600 block mt-0.5">Bowser Injunction Permanently Granted</span>
                        </div>
                        <div className="bg-white border border-red-200 rounded-xl p-2.5 shadow-2xs text-right">
                          <span className="font-bold text-amber-800 block font-mono">TOTAL DAMAGES: 1,000,000 COINS</span>
                          <span className="text-slate-600 block mt-0.5">Remitted to Mushroom Workers Fund</span>
                        </div>
                      </div>
                    </div>

                    {/* Signatures & Seal */}
                    <div className="pt-3 border-t-2 border-red-700/60 grid grid-cols-3 items-end gap-6 text-center shrink-0">
                      <div className="space-y-1 flex flex-col items-center">
                        <div className="border-b-2 border-slate-900 mx-auto max-w-[240px] pb-1 flex flex-col items-center">
                          <svg viewBox="0 0 240 50" className="w-52 h-11 overflow-visible text-slate-950 font-preserve select-none" fill="none">
                            <path
                              d="M10 38 C15 15, 25 10, 32 35 C35 22, 42 20, 48 34 C54 22, 60 20, 66 36 C70 16, 78 12, 75 38 M30 22 L76 20 M88 30 C94 20, 102 20, 100 34 C104 24, 112 22, 118 32 C122 24, 130 26, 128 36 M138 34 C146 14, 160 12, 154 36 C158 25, 168 24, 172 34 C178 24, 186 26, 184 36 C190 26, 198 28, 196 38 C202 28, 212 30, 208 40 M145 44 C110 46, 50 47, 12 45 C45 44, 130 45, 218 42"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="text-sm font-black text-slate-800 uppercase">
                          Matthew Cesar Corpuz
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Main Creator · Chief Moot Court Magistrate
                        </p>
                      </div>

                      <div className="flex flex-col items-center justify-center">
                        <div className="relative flex flex-col items-center">
                          <div className="w-22 h-22 rounded-full border-4 border-red-600 bg-gradient-to-tr from-red-500 via-amber-300 to-red-600 flex flex-col items-center justify-center text-white shadow-md z-10">
                            <MarioSuperStarIcon size={28} />
                            <span className="text-[9px] font-black tracking-widest uppercase mt-0.5">JUSTITIA</span>
                            <span className="text-[8px] font-mono font-bold">COURT SEAL</span>
                          </div>
                          <div className="flex items-center gap-2 -mt-2.5 z-0">
                            <div className="w-4 h-6 bg-red-700 border border-red-900 -rotate-12 rounded-b-xs shadow-xs" />
                            <div className="w-4 h-6 bg-red-700 border border-red-900 rotate-12 rounded-b-xs shadow-xs" />
                          </div>
                        </div>
                        <span className="text-xs font-mono text-slate-800 font-bold mt-1">Rendered: {currentDate}</span>
                      </div>

                      <div className="space-y-1 flex flex-col items-center">
                        <div className="border-b-2 border-slate-900 mx-auto max-w-[240px] pb-1 flex flex-col items-center">
                          <svg viewBox="0 0 240 50" className="w-52 h-11 overflow-visible text-slate-950 font-preserve select-none" fill="none">
                            <path
                              d="M16 35 C28 14, 44 12, 54 30 C62 16, 78 14, 88 30 C96 16, 114 14, 126 32 M38 22 L128 20 M140 28 C150 14, 170 12, 166 32 C174 20, 192 18, 200 30 M148 40 C112 42, 50 43, 16 41 C54 40, 142 41, 226 38"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <p className="italic font-bold text-sm text-slate-900 leading-tight">
                          Presiding Supreme Justice
                        </p>
                        <p className="text-xs font-black text-slate-800 uppercase">
                          High Court of Labor Standards
                        </p>
                        <p className="text-[10px] text-slate-600">
                          Philippine Labor Code Jurisprudence
                        </p>
                      </div>
                    </div>
                  </div>
                ) : documentMode === 'passport' ? (
                  /* ==================== REPUBLIC OF THE PHILIPPINES LABOR JURIST PASSPORT (A4 LANDSCAPE 1122x794) ==================== */
                  (() => {
                    const isPassportInkSaver = activeExtendedTheme.id === 'ink_saver_bw';
                    const rawCoverBg = isPassportInkSaver ? '#FFFFFF' : (activeExtendedTheme.headerBgHex || '#0b1b36');
                    const rawInnerBg = isPassportInkSaver
                      ? '#FFFFFF'
                      : (activeExtendedTheme.tableHeadBgHex || activeExtendedTheme.headerBgHex || '#0f2444');

                    const getHexLum = (hex: string | undefined): number => {
                      if (!hex || typeof hex !== 'string') return 0.2;
                      const clean = hex.trim().replace(/^#/, '');
                      if (!/^[0-9a-fA-F]{6}$/.test(clean)) return 0.2;
                      const r = parseInt(clean.slice(0, 2), 16);
                      const g = parseInt(clean.slice(2, 4), 16);
                      const b = parseInt(clean.slice(4, 6), 16);
                      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    };

                    const isThemeLight =
                      isPassportInkSaver ||
                      activeExtendedTheme.category === 'Pastel & Ink-Saver' ||
                      getHexLum(rawCoverBg) > 0.55 ||
                      getHexLum(rawInnerBg) > 0.55;

                    const passportCoverBg = rawCoverBg;
                    const passportInnerBg = rawInnerBg;

                    const passportGoldBorder = isPassportInkSaver
                      ? '#111827'
                      : isThemeLight
                      ? (activeExtendedTheme.headerTextHex && getHexLum(activeExtendedTheme.headerTextHex) < 0.45
                          ? activeExtendedTheme.headerTextHex
                          : activeExtendedTheme.borderHex && getHexLum(activeExtendedTheme.borderHex) < 0.45
                          ? activeExtendedTheme.borderHex
                          : '#881337')
                      : (activeExtendedTheme.headerTextHex || activeExtendedTheme.accentHex || '#cda243');

                    const passportAccentText = isPassportInkSaver
                      ? '#000000'
                      : isThemeLight
                      ? (activeExtendedTheme.headerTextHex && getHexLum(activeExtendedTheme.headerTextHex) < 0.45
                          ? activeExtendedTheme.headerTextHex
                          : '#881337')
                      : (activeExtendedTheme.headerTextHex && getHexLum(activeExtendedTheme.headerTextHex) > 0.55
                          ? activeExtendedTheme.headerTextHex
                          : '#fde047');

                    // Guaranteed high contrast: Never white on light/bright pastel backgrounds
                    const passportPageText = isThemeLight ? '#0F172A' : '#FFFFFF';

                    const passportMutedText = isPassportInkSaver
                      ? '#374151'
                      : isThemeLight
                      ? (activeExtendedTheme.mutedTextHex && getHexLum(activeExtendedTheme.mutedTextHex) < 0.45
                          ? activeExtendedTheme.mutedTextHex
                          : '#475569')
                      : '#CBD5E1';

                    const passportDivider = isPassportInkSaver
                      ? '#E5E7EB'
                      : isThemeLight
                      ? 'rgba(0, 0, 0, 0.12)'
                      : 'rgba(255, 255, 255, 0.18)';

                    const passportMrzBg = isPassportInkSaver
                      ? '#F3F4F6'
                      : isThemeLight
                      ? '#FFFFFF'
                      : '#030712';

                    const passportMrzBorder = isPassportInkSaver
                      ? '#D1D5DB'
                      : isThemeLight
                      ? `${passportGoldBorder}50`
                      : `${passportGoldBorder}80`;

                    const passportMrzText = isPassportInkSaver
                      ? '#000000'
                      : isThemeLight
                      ? '#0F172A'
                      : passportAccentText;

                    const formattedIssuanceDate = formatPassportDate(
                      passportProfile.dateOfIssuance || new Date().toISOString()
                    );

                    return (
                      <div
                        id="labor-jurist-passport-sheet"
                        data-testid="labor-jurist-passport-sheet"
                        data-theme={activeExtendedTheme.id}
                        data-font={activeExtendedFont.id}
                        data-orientation="landscape"
                        data-single-page="true"
                        style={{
                          ...activeSheetDynamicStyle,
                          backgroundColor: passportCoverBg,
                          borderColor: passportGoldBorder,
                          outlineColor: `${passportGoldBorder}99`,
                          color: passportPageText,
                        }}
                        className="w-full min-h-[794px] h-auto p-8 rounded-3xl border-[14px] shadow-2xl relative select-text flex flex-col justify-between overflow-visible box-border outline outline-2 transition-colors duration-200 print:p-4 print:border-6 print:min-h-0 print:max-h-none print:h-auto print:overflow-visible print:shadow-none print:outline-none"
                      >
                        {/* Passport Booklet Spread: Two Pages Side-by-Side */}
                        <div className="grid grid-cols-2 gap-5 flex-1 min-h-0">
                          {/* LEFT PAGE: BIOMETRIC PASSPORT IDENTITY PAGE */}
                          <div
                            style={{
                              backgroundColor: passportInnerBg,
                              borderColor: `${passportGoldBorder}B3`,
                            }}
                            className="rounded-2xl p-5 sm:p-6 border-2 flex flex-col justify-between shadow-inner space-y-3.5 relative overflow-hidden print:overflow-visible print:max-h-none print:h-auto"
                          >
                            {/* Guilloche Security Background watermark */}
                            <div
                              style={{ color: passportGoldBorder }}
                              className="absolute inset-0 pointer-events-none opacity-[0.06] flex items-center justify-center"
                            >
                              <MarioSuperStarIcon size={340} />
                            </div>

                            {/* Top Passport Header */}
                            <div className="text-center space-y-0.5 relative z-10 shrink-0">
                              <div className="flex items-center justify-center gap-1.5 min-w-0">
                                <span style={{ color: passportGoldBorder }} className="shrink-0">
                                  <MarioSuperStarIcon size={16} />
                                </span>
                                <span
                                  style={{ color: passportAccentText }}
                                  className="text-[9px] sm:text-[10px] font-mono font-black tracking-wider uppercase truncate whitespace-nowrap max-w-[340px] font-preserve preserve-system-font"
                                >
                                  REPUBLIKA NG PILIPINAS · REPUBLIC OF THE PHILIPPINES
                                </span>
                                {/* International Biometric Chip Symbol */}
                                <svg className="w-5 h-3.5 sm:w-6 sm:h-4 shrink-0 inline-block align-middle ml-0.5" viewBox="0 0 28 20" fill="none">
                                  <rect x="1.5" y="1.5" width="25" height="17" rx="3.5" stroke={passportGoldBorder} strokeWidth="1.8" />
                                  <line x1="1.5" y1="10" x2="8.5" y2="10" stroke={passportGoldBorder} strokeWidth="1.8" />
                                  <circle cx="14" cy="10" r="3.8" stroke={passportGoldBorder} strokeWidth="1.8" />
                                  <line x1="19.5" y1="10" x2="26.5" y2="10" stroke={passportGoldBorder} strokeWidth="1.8" />
                                </svg>
                                <span style={{ color: passportGoldBorder }} className="shrink-0">
                                  <MarioSuperStarIcon size={16} />
                                </span>
                              </div>
                              <h3
                                style={{ color: passportAccentText }}
                                className="text-[11px] sm:text-xs font-black uppercase tracking-wide font-display pt-0.5 truncate whitespace-nowrap"
                              >
                                PASAPORTE NG HURISTANG MANGGAGAWA · LABOR JURIST PASSPORT
                              </h3>
                              <div
                                style={{ borderColor: passportDivider, color: passportAccentText }}
                                className="flex items-center justify-between text-[9.5px] sm:text-[10.5px] font-mono border-y py-0.5 font-black gap-2 whitespace-nowrap overflow-hidden font-preserve preserve-system-font"
                              >
                                <span className="shrink-0 font-preserve preserve-system-font">TYPE: P</span>
                                <span className="shrink-0 font-preserve preserve-system-font">CODE: PHL</span>
                                <span className="font-mono truncate font-preserve preserve-system-font">PASSPORT NO: {passportProfile.passportNumber.toUpperCase()}</span>
                              </div>
                            </div>

                            {/* Biometric Data Grid & Photo Box */}
                            <div className="grid grid-cols-12 gap-3 relative z-10 my-0.5 items-center">
                              {/* Photo Box with Holographic Seal */}
                              <div className="col-span-4 flex flex-col items-center shrink-0">
                                <div
                                  style={{
                                    borderColor: passportGoldBorder,
                                    backgroundColor: isThemeLight ? '#FFFFFF' : '#0B132B',
                                  }}
                                  className="w-28 sm:w-32 h-36 sm:h-40 rounded-2xl border-2 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shrink-0"
                                >
                                  <MarioCharacterAvatar character={(equippedAvatar as MarioAvatar) || 'mario'} className="w-20 h-20 sm:w-22 sm:h-22 drop-shadow-md" />
                                  <div
                                    style={{
                                      backgroundColor: passportGoldBorder,
                                      color: isThemeLight ? '#FFFFFF' : '#020617',
                                    }}
                                    className="absolute bottom-1 inset-x-1 py-0.5 rounded-md font-black font-mario text-[8px] sm:text-[8.5px] text-center uppercase tracking-wider shadow-xs truncate whitespace-nowrap font-preserve preserve-system-font"
                                  >
                                    ACCREDITED JURIST
                                  </div>
                                  <div
                                    style={{ borderColor: passportGoldBorder }}
                                    className={
                                      isThemeLight
                                        ? "absolute top-1 right-1 w-6 h-6 rounded-full bg-amber-400/40 border flex items-center justify-center shadow-xs"
                                        : "absolute top-1 right-1 w-6 h-6 rounded-full bg-amber-400/25 border flex items-center justify-center shadow-xs"
                                    }
                                  >
                                    <MarioCoinIcon size={14} />
                                  </div>
                                </div>
                                <span style={{ color: passportAccentText }} className="text-[8.5px] sm:text-[9px] font-mono font-black mt-1 uppercase tracking-wider truncate whitespace-nowrap font-preserve preserve-system-font">
                                  BEARER PHOTO
                                </span>
                              </div>

                              {/* Data Fields */}
                              <div className="col-span-8 space-y-1 text-xs min-w-0 overflow-hidden">
                                <div style={{ borderColor: passportDivider }} className="border-b pb-0.5 min-w-0 overflow-hidden">
                                  <span style={{ color: passportAccentText }} className="text-[7.5px] sm:text-[8px] font-mono uppercase block font-bold tracking-tight truncate whitespace-nowrap font-preserve preserve-system-font">
                                    1. SURNAME / APELYIDO
                                  </span>
                                  <span
                                    style={{ color: passportPageText }}
                                    className="font-mono font-black text-sm sm:text-base tracking-wide uppercase truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font"
                                    data-testid="passport-rendered-surname"
                                  >
                                    {passportProfile.surname.toUpperCase() || 'DELA CRUZ'}
                                  </span>
                                </div>
                                <div style={{ borderColor: passportDivider }} className="border-b pb-0.5 min-w-0 overflow-hidden">
                                  <span style={{ color: passportAccentText }} className="text-[7.5px] sm:text-[8px] font-mono uppercase block font-bold tracking-tight truncate whitespace-nowrap font-preserve preserve-system-font">
                                    2. GIVEN NAMES / MGA PANGALAN
                                  </span>
                                  <span
                                    style={{ color: passportPageText }}
                                    className="font-mono font-black text-xs sm:text-sm tracking-wide uppercase truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font"
                                    data-testid="passport-rendered-given-names"
                                  >
                                    {passportProfile.givenNames.toUpperCase() || 'JUAN'}
                                  </span>
                                </div>
                                <div style={{ borderColor: passportDivider }} className="grid grid-cols-2 gap-2 border-b pb-0.5 min-w-0 overflow-hidden">
                                  <div className="min-w-0 overflow-hidden">
                                    <span style={{ color: passportAccentText }} className="text-[7.5px] sm:text-[8px] font-mono uppercase block font-bold tracking-tight truncate whitespace-nowrap font-preserve preserve-system-font">
                                      3. NATIONALITY / LAHI
                                    </span>
                                    <span
                                      style={{ color: passportPageText }}
                                      className="font-mono font-black text-[11px] sm:text-xs uppercase truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font"
                                      data-testid="passport-rendered-nationality"
                                    >
                                      {passportProfile.nationality.toUpperCase() || 'FILIPINO / JURIST'}
                                    </span>
                                  </div>
                                  <div className="min-w-0 overflow-hidden">
                                    <span style={{ color: passportAccentText }} className="text-[7.5px] sm:text-[8px] font-mono uppercase block font-bold tracking-tight truncate whitespace-nowrap font-preserve preserve-system-font">
                                      4. DATE OF BIRTH / KAPANGANAKAN
                                    </span>
                                    <span
                                      style={{ color: passportPageText }}
                                      className="font-mono font-black text-[11px] sm:text-xs uppercase truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font"
                                      data-testid="passport-rendered-dob"
                                    >
                                      {formatPassportDate(passportProfile.dateOfBirth)}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ borderColor: passportDivider }} className="grid grid-cols-2 gap-2 border-b pb-0.5 min-w-0 overflow-hidden">
                                  <div className="min-w-0 overflow-hidden">
                                    <span style={{ color: passportAccentText }} className="text-[7.5px] sm:text-[8px] font-mono uppercase block font-bold tracking-tight truncate whitespace-nowrap font-preserve preserve-system-font">
                                      5. PLACE OF BIRTH / POOK
                                    </span>
                                    <span
                                      style={{ color: passportPageText }}
                                      className="font-mono font-black text-[11px] sm:text-xs uppercase truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font"
                                      data-testid="passport-rendered-pob"
                                    >
                                      {passportProfile.placeOfBirth.toUpperCase() || 'MANILA, PHILIPPINES'}
                                    </span>
                                  </div>
                                  <div className="min-w-0 overflow-hidden">
                                    <span style={{ color: passportAccentText }} className="text-[7.5px] sm:text-[8px] font-mono uppercase block font-bold tracking-tight truncate whitespace-nowrap font-preserve preserve-system-font">
                                      6. DATE OF ISSUANCE / PAG-ISYU
                                    </span>
                                    <span
                                      style={{ color: passportPageText }}
                                      className="font-mono font-black text-[11px] sm:text-xs block truncate whitespace-nowrap leading-tight font-preserve preserve-system-font"
                                      data-testid="passport-rendered-doi"
                                    >
                                      {formattedIssuanceDate}
                                    </span>
                                  </div>
                                </div>
                                <div className="min-w-0 overflow-hidden">
                                  <span style={{ color: passportAccentText }} className="text-[7.5px] sm:text-[8px] font-mono uppercase block font-bold tracking-tight truncate whitespace-nowrap font-preserve preserve-system-font">
                                    7. ISSUING AUTHORITY / MAY-KAPANGYARIHAN
                                  </span>
                                  <span
                                    style={{
                                      color: isPassportInkSaver ? '#000000' : isThemeLight ? '#065F46' : '#34D399',
                                    }}
                                    className="font-mono font-black text-[10px] sm:text-[11px] block truncate whitespace-nowrap uppercase leading-tight font-preserve preserve-system-font"
                                    data-testid="passport-rendered-authority"
                                  >
                                    {passportProfile.issuingAuthority.toUpperCase() || 'DOLE & PHILIPPINE LABOR STANDARDS BAR'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Bearer's Signature Box */}
                            <div style={{ borderColor: passportDivider }} className="relative z-10 border-t pt-1 flex items-center justify-between gap-2 shrink-0">
                              <div className="min-w-0 flex-1">
                                <span style={{ color: passportAccentText }} className="text-[8px] sm:text-[8.5px] font-mono font-bold uppercase block tracking-tight truncate">
                                  LAGDA NG MAY-ARI / BEARER SIGNATURE
                                </span>
                                <div className="flex items-center pt-0.5 min-w-0">
                                  <span
                                    style={{ color: passportAccentText }}
                                    className="italic font-serif text-base sm:text-lg font-bold select-none tracking-wide truncate max-w-[200px] block"
                                  >
                                    {passportProfile.fullName || candidateName || playerName || 'Juan Dela Cruz'}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span style={{ color: passportMutedText }} className="text-[8px] font-mono block font-bold">
                                  RECORD HASH
                                </span>
                                <span style={{ color: passportAccentText }} className="text-[10px] sm:text-[11px] font-mono font-black whitespace-nowrap">
                                  #PHL-{Math.abs(completedCount * 73 + 442).toString(16).toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {/* Machine Readable Zone (MRZ) - 2 Lines OCR-B */}
                            {(() => {
                              const mrz = generatePassportMrz(
                                passportProfile,
                                passportProfile.dateOfIssuance || new Date().toISOString()
                              );
                              return (
                                <div
                                  style={{
                                    backgroundColor: passportMrzBg,
                                    borderColor: passportMrzBorder,
                                    color: passportMrzText,
                                  }}
                                  className="p-1.5 sm:p-2 rounded-xl border font-mono text-[9px] sm:text-[10.5px] leading-tight tracking-[0.08em] select-all font-preserve preserve-system-font shadow-inner font-bold text-left overflow-hidden print:overflow-visible"
                                >
                                  <div
                                    data-testid="passport-mrz-line-1"
                                    className="font-preserve preserve-system-font font-mono whitespace-nowrap truncate tracking-[0.08em] text-left uppercase"
                                  >
                                    {mrz.line1}
                                  </div>
                                  <div
                                    data-testid="passport-mrz-line-2"
                                    className="font-preserve preserve-system-font font-mono whitespace-nowrap truncate tracking-[0.08em] text-left uppercase"
                                  >
                                    {mrz.line2}
                                  </div>
                                </div>
                              );
                            })()}
                          </div>

                          {/* RIGHT PAGE: OFFICIAL SIX-WORLD VISAS & ENTRY ENDORSEMENTS */}
                          <div
                            style={{
                              backgroundColor: passportInnerBg,
                              borderColor: `${passportGoldBorder}B3`,
                            }}
                            className="rounded-2xl p-5 sm:p-6 border-2 flex flex-col justify-between shadow-inner space-y-2 relative overflow-hidden print:overflow-visible print:max-h-none print:h-auto"
                          >
                            {/* Header */}
                            <div style={{ borderColor: passportDivider }} className="text-center border-b pb-1.5 shrink-0">
                              <span
                                style={{ color: passportAccentText }}
                                className="text-[10px] sm:text-xs font-mono font-black tracking-wider uppercase block truncate"
                              >
                                MGA BISA / VISAS · STATUTORY JURISPRUDENCE ENDORSEMENTS
                              </span>
                              <span style={{ color: passportMutedText }} className="text-[9px] sm:text-[10px] font-semibold truncate block">
                                Bureau of Working Conditions &amp; Labor Standards Border Clearance
                              </span>
                            </div>

                            {/* 6 Large Official Octagonal & Oval Visa Stamps */}
                            <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
                              {/* Visa 1 */}
                              <div
                                className={
                                  isPassportInkSaver
                                    ? 'border-2 border-slate-900 bg-slate-50 text-slate-900 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[-1deg]'
                                    : isThemeLight
                                    ? 'border-2 border-emerald-600 bg-emerald-50/90 text-emerald-950 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[-1deg] shadow-xs'
                                    : 'border-2 border-emerald-500/80 bg-emerald-950/30 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[-1deg] shadow-xs'
                                }
                              >
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black uppercase text-slate-900 truncate whitespace-nowrap block font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-emerald-700 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-emerald-400 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font'}>
                                  ★ DOLE NCR IMMIGRATION ★
                                </span>
                                <span className={isPassportInkSaver ? 'text-[9.5px] sm:text-[10.5px] font-black uppercase text-slate-950 truncate whitespace-nowrap block leading-tight my-0.5' : isThemeLight ? 'text-[9.5px] sm:text-[10.5px] font-black text-emerald-950 uppercase truncate whitespace-nowrap block leading-tight my-0.5' : 'text-[9.5px] sm:text-[10.5px] font-black text-emerald-300 uppercase truncate whitespace-nowrap block leading-tight my-0.5'}>
                                  WORLD 1: HOURS OF WORK
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-slate-700 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-emerald-800 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-emerald-200 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font'}>
                                  ART. 83-90 · OT 125% · NSD 10%
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-slate-900 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-emerald-700 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-emerald-400 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font'}>
                                  STATUS: CLEARED &amp; ADMITTED
                                </span>
                              </div>

                              {/* Visa 2 */}
                              <div
                                className={
                                  isPassportInkSaver
                                    ? 'border-2 border-slate-900 bg-slate-50 text-slate-900 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[1deg]'
                                    : isThemeLight
                                    ? 'border-2 border-amber-600 bg-amber-50/90 text-amber-950 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[1deg] shadow-xs'
                                    : 'border-2 border-amber-500/80 bg-amber-950/30 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[1deg] shadow-xs'
                                }
                              >
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black uppercase text-slate-900 truncate whitespace-nowrap block font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-amber-700 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-amber-400 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font'}>
                                  ★ STATUTORY AUDIT STAMP ★
                                </span>
                                <span className={isPassportInkSaver ? 'text-[9.5px] sm:text-[10.5px] font-black uppercase text-slate-950 truncate whitespace-nowrap block leading-tight my-0.5' : isThemeLight ? 'text-[9.5px] sm:text-[10.5px] font-black text-amber-950 uppercase truncate whitespace-nowrap block leading-tight my-0.5' : 'text-[9.5px] sm:text-[10.5px] font-black text-amber-300 uppercase truncate whitespace-nowrap block leading-tight my-0.5'}>
                                  WORLD 2: REST &amp; HOLIDAYS
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-slate-700 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-amber-800 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-amber-200 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font'}>
                                  ART. 91-95 · 200% REG · 13TH MO
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-slate-900 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-amber-700 uppercase tracking-wider truncate block mt-0.5 font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-amber-400 uppercase tracking-wider truncate block mt-0.5 font-preserve preserve-system-font'}>
                                  STATUS: VALIDATED &amp; CREDITED
                                </span>
                              </div>

                              {/* Visa 3 */}
                              <div
                                className={
                                  isPassportInkSaver
                                    ? 'border-2 border-slate-900 bg-slate-50 text-slate-900 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[-1.5deg]'
                                    : isThemeLight
                                    ? 'border-2 border-indigo-600 bg-indigo-50/90 text-indigo-950 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[-1.5deg] shadow-xs'
                                    : 'border-2 border-indigo-500/80 bg-indigo-950/30 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[-1.5deg] shadow-xs'
                                }
                              >
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black uppercase text-slate-900 truncate whitespace-nowrap block font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-indigo-700 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-indigo-400 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font'}>
                                  ★ D.O. 174 REGISTRATION ★
                                </span>
                                <span className={isPassportInkSaver ? 'text-[9.5px] sm:text-[10.5px] font-black uppercase text-slate-950 truncate whitespace-nowrap block leading-tight my-0.5' : isThemeLight ? 'text-[9.5px] sm:text-[10.5px] font-black text-indigo-950 uppercase truncate whitespace-nowrap block leading-tight my-0.5' : 'text-[9.5px] sm:text-[10.5px] font-black text-indigo-300 uppercase truncate whitespace-nowrap block leading-tight my-0.5'}>
                                  WORLD 3: WAGES &amp; DO 174
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-slate-700 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-indigo-800 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-indigo-200 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font'}>
                                  ART. 97-129 · CAPITAL ₱5,000,000
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-slate-900 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-indigo-700 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-indigo-400 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font'}>
                                  STATUS: LEGITIMATE CONTRACTOR
                                </span>
                              </div>

                              {/* Visa 4 */}
                              <div
                                className={
                                  isPassportInkSaver
                                    ? 'border-2 border-slate-900 bg-slate-50 text-slate-900 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[1.5deg]'
                                    : isThemeLight
                                    ? 'border-2 border-rose-600 bg-rose-50/90 text-rose-950 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[1.5deg] shadow-xs'
                                    : 'border-2 border-pink-500/80 bg-pink-950/30 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[1.5deg] shadow-xs'
                                }
                              >
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black uppercase text-slate-900 truncate whitespace-nowrap block font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-rose-700 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-pink-400 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font'}>
                                  ★ SPECIAL GROUPS ENTRY ★
                                </span>
                                <span className={isPassportInkSaver ? 'text-[9.5px] sm:text-[10.5px] font-black uppercase text-slate-950 truncate whitespace-nowrap block leading-tight my-0.5' : isThemeLight ? 'text-[9.5px] sm:text-[10.5px] font-black text-rose-950 uppercase truncate whitespace-nowrap block leading-tight my-0.5' : 'text-[9.5px] sm:text-[10.5px] font-black text-pink-300 uppercase truncate whitespace-nowrap block leading-tight my-0.5'}>
                                  WORLD 4: SPECIAL WORKERS
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-slate-700 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-rose-800 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-pink-200 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font'}>
                                  R.A. 10361 KASAMBAHAY · WOMEN
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-slate-900 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-rose-700 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-pink-400 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font'}>
                                  STATUS: PROTECTED RIGHTS SEAL
                                </span>
                              </div>

                              {/* Visa 5 */}
                              <div
                                className={
                                  isPassportInkSaver
                                    ? 'border-2 border-slate-900 bg-slate-50 text-slate-900 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[-1deg]'
                                    : isThemeLight
                                    ? 'border-2 border-cyan-700 bg-cyan-50/90 text-cyan-950 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[-1deg] shadow-xs'
                                    : 'border-2 border-cyan-500/80 bg-cyan-950/30 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[-1deg] shadow-xs'
                                }
                              >
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black uppercase text-slate-900 truncate whitespace-nowrap block font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-cyan-800 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-cyan-400 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font'}>
                                  ★ OSH CLEARANCE ACCORD ★
                                </span>
                                <span className={isPassportInkSaver ? 'text-[9.5px] sm:text-[10.5px] font-black uppercase text-slate-950 truncate whitespace-nowrap block leading-tight my-0.5' : isThemeLight ? 'text-[9.5px] sm:text-[10.5px] font-black text-cyan-950 uppercase truncate whitespace-nowrap block leading-tight my-0.5' : 'text-[9.5px] sm:text-[10.5px] font-black text-cyan-300 uppercase truncate whitespace-nowrap block leading-tight my-0.5'}>
                                  WORLD 5: PROTECTIVE LAWS
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-slate-700 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-cyan-800 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-cyan-200 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font'}>
                                  R.A. 11058 SAFETY · APPRENTICES
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-slate-900 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-cyan-800 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-cyan-400 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font'}>
                                  STATUS: ZERO ACCIDENT SEAL
                                </span>
                              </div>

                              {/* Visa 6 */}
                              <div
                                className={
                                  isPassportInkSaver
                                    ? 'border-2 border-slate-900 bg-slate-50 text-slate-900 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[1deg]'
                                    : isThemeLight
                                    ? 'border-2 border-purple-600 bg-purple-50/90 text-purple-950 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[1deg] shadow-xs'
                                    : 'border-2 border-purple-500/80 bg-purple-950/30 rounded-xl p-2 flex flex-col justify-between text-center overflow-hidden min-w-0 rotate-[1deg] shadow-xs'
                                }
                              >
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black uppercase text-slate-900 truncate whitespace-nowrap block font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-purple-700 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-purple-400 uppercase tracking-wider truncate whitespace-nowrap block font-preserve preserve-system-font'}>
                                  ★ STATUTORY LEAVE VISA ★
                                </span>
                                <span className={isPassportInkSaver ? 'text-[9.5px] sm:text-[10.5px] font-black uppercase text-slate-950 truncate whitespace-nowrap block leading-tight my-0.5' : isThemeLight ? 'text-[9.5px] sm:text-[10.5px] font-black text-purple-950 uppercase truncate whitespace-nowrap block leading-tight my-0.5' : 'text-[9.5px] sm:text-[10.5px] font-black text-purple-300 uppercase truncate whitespace-nowrap block leading-tight my-0.5'}>
                                  WORLD 6: STATUTORY LEAVES
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-slate-700 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-purple-800 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8.5px] font-mono font-bold text-purple-200 truncate whitespace-nowrap block leading-tight font-preserve preserve-system-font'}>
                                  MATERNITY 105D · SIL 5D · VAWC
                                </span>
                                <span className={isPassportInkSaver ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-slate-900 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font' : isThemeLight ? 'text-[7.5px] sm:text-[8px] font-mono font-black text-purple-700 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font' : 'text-[7.5px] sm:text-[8px] font-mono font-black text-purple-400 uppercase tracking-wider truncate whitespace-nowrap block mt-0.5 font-preserve preserve-system-font'}>
                                  STATUS: UNCONDITIONAL LEAVE SEAL
                                </span>
                              </div>
                            </div>

                            {/* Verification & Border Inspector Signature */}
                            <div style={{ borderColor: passportDivider }} className="border-t pt-1.5 flex items-center justify-between text-xs shrink-0 gap-2">
                              <div className="min-w-0 flex-1">
                                <span style={{ color: passportAccentText }} className="text-[8px] sm:text-[8.5px] font-mono uppercase block font-bold truncate whitespace-nowrap font-preserve preserve-system-font">
                                  CHIEF STATUTORY VISA COMMISSIONER
                                </span>
                                <span style={{ color: passportPageText }} className="font-bold text-xs sm:text-[13px] block truncate whitespace-nowrap">Matthew Cesar Corpuz</span>
                                <span style={{ color: passportMutedText }} className="text-[8px] sm:text-[8.5px] font-mono font-bold truncate whitespace-nowrap block font-preserve preserve-system-font">
                                  Philippine Labor Standards Directorate
                                </span>
                              </div>
                              <div
                                style={{
                                  borderColor: passportGoldBorder,
                                  backgroundColor: isPassportInkSaver ? '#F3F4F6' : isThemeLight ? '#FFFFFF' : `${passportGoldBorder}25`,
                                  color: passportGoldBorder,
                                }}
                                className="w-11 h-11 rounded-full border-2 flex flex-col items-center justify-center shadow-md shrink-0"
                              >
                                <MarioSuperStarIcon size={15} />
                                <span className="text-[7px] font-black uppercase tracking-wider font-preserve preserve-system-font">PASSED</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Passport Legend */}
                        <div
                          style={{ borderColor: isThemeLight ? `${passportGoldBorder}40` : `${passportGoldBorder}80`, color: passportAccentText }}
                          className="border-t pt-2 flex items-center justify-between text-[8.5px] sm:text-[9.5px] font-mono font-bold shrink-0 gap-2 whitespace-nowrap overflow-hidden font-preserve preserve-system-font"
                        >
                          <span className="truncate whitespace-nowrap font-preserve preserve-system-font">SUPER MARIO LABOR STANDARDS · OFFICIAL PHILIPPINE JURIST PASSPORT</span>
                          <span className="shrink-0 whitespace-nowrap font-preserve preserve-system-font">CREATED &amp; ARCHITECTED BY MATTHEW CESAR CORPUZ</span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div
                    id="printable-study-guide"
                    data-compact={isCompact ? 'true' : 'false'}
                    data-orientation={pageOrientation}
                    data-theme={activeExtendedTheme.id}
                    data-font={activeExtendedFont.id}
                    style={activeSheetDynamicStyle}
                    className={`${summaryPaperBgClass} text-slate-950 ${marginPaddingClass} ${fontScaleClass} ${
                      isCompact ? 'space-y-4' : 'space-y-7'
                    } w-full ${bodyFontClass} relative overflow-visible box-border select-text allow-text-select ${
                      isLivePreviewMode
                        ? 'rounded-md border-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                        : 'rounded-2xl shadow-2xl'
                    } print:p-0 print:shadow-none print:max-w-full print:rounded-none print:border-0 print:ring-0 print:overflow-visible`}
                  >
                  {/* Watermark Stamp Overlay (Scoped inside document sheet so it never breaks pagination) */}
                  {includeWatermark && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-10 overflow-hidden flex items-center justify-center opacity-[0.045] select-none print:opacity-[0.05]"
                    >
                      <span className="rotate-[-28deg] uppercase font-black text-4xl sm:text-6xl tracking-widest text-slate-950 text-center px-6">
                        {formatOptions.watermarkText || 'CONFIDENTIAL STUDY REVIEW'}
                      </span>
                    </div>
                  )}

                  {/* Editorial Law Journal Masthead */}
                  <header
                    id="print-sec-masthead"
                    style={{
                      backgroundColor: activeExtendedTheme.headerBgHex,
                      color: guaranteedHeaderTextColor,
                      borderColor: activeExtendedTheme.borderHex,
                    }}
                    className={`border-b-2 ${headingBorderClass} rounded-xl px-4 ${
                      isCompact ? 'py-3 space-y-1' : 'py-5 space-y-2'
                    } text-center break-inside-avoid`}
                  >
              <div
                style={{ color: guaranteedHeaderTextColor }}
                className="text-[10px] font-bold tracking-[0.14em] uppercase opacity-90 font-mono"
              >
                PHILIPPINE LABOR CODE • P.D. NO. 442 • {activeExtendedTheme.name.toUpperCase()} • {activeExtendedFont.name.toUpperCase()}
              </div>
              <h1
                style={{ color: guaranteedHeaderTextColor }}
                className={`${
                  isCompact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'
                } font-black tracking-tight leading-tight flex items-center justify-center gap-2 flex-wrap`}
              >
                <MarioSuperStarIcon size={24} />
                <span>Philippine Labor Standards &amp; Statutory Welfare Reviewer</span>
                <MarioCoinBlockIcon size={24} />
              </h1>
              <p
                style={{ color: guaranteedHeaderTextColor }}
                className="text-xs opacity-90 max-w-2xl mx-auto leading-relaxed"
              >
                Complete Six-World Philippine Labor Standards &amp; Workplace Rights Memory Aid covering Hours of Work, Rest &amp; Holidays, 13th Month Pay, Wages &amp; D.O. 174, Special Groups, Protective Statutes, and Statutory Leaves (World 6)
              </p>
              {candidateName && (
                <div className="pt-1">
                  <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-300 rounded-lg text-xs font-bold text-slate-900">
                    Prepared for Learner: <span className="font-black text-slate-950">{candidateName}</span>
                  </span>
                </div>
              )}
              <div
                style={{ color: guaranteedHeaderTextColor }}
                className="pt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] opacity-90"
              >
                <span className="inline-flex items-center gap-1 font-semibold">
                  Created by Matthew (Matthew Cesar Corpuz — Main Creator · Executed All Roles)
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {currentDate}
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {filteredTopics.length} Active Modules Printed
                </span>
              </div>
            </header>

            {/* Creator & Group Members Attribution Block */}
            {includeGroupMembers && (
              <section
                className={`border ${headingBorderClass} rounded-xl ${
                  isCompact ? 'p-3 space-y-1.5' : 'p-4 space-y-2.5'
                } ${subtleBoxClass} break-inside-avoid`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                  <div className="flex items-center gap-2">
                    <MarioSuperStarIcon size={16} />
                    <h2 className="font-black text-xs uppercase tracking-wide text-slate-950">
                      Memory Aid Attribution &amp; Research Cohort
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">
                    Main Creator &amp; Architect (Executed All Roles): Matthew Cesar Corpuz
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-x-3 gap-y-2 text-[11px] text-slate-900">
                  {GROUP_MEMBERS.map((member, idx) => {
                    const fbUrl = getMemberFacebookUrl(member);
                    const itemContent = (
                      <>
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0 border border-amber-600 shadow-xs tabular-nums">
                          {idx + 1}
                        </span>
                        <span className={idx === 0 ? 'font-black text-slate-950 flex-1 break-words leading-snug min-w-0 group-hover:underline' : 'font-semibold text-slate-900 flex-1 break-words leading-snug min-w-0 group-hover:underline'}>
                          {member}
                        </span>
                        {fbUrl && (
                          <span className="text-[9px] text-blue-600 group-hover:text-blue-800 font-mono font-bold shrink-0 print:hidden">
                            FB
                          </span>
                        )}
                        {idx === 0 && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 inline-flex items-center gap-0.5">
                            <MarioSuperStarIcon size={11} />
                            <span>All Roles</span>
                          </span>
                        )}
                      </>
                    );
                    if (fbUrl) {
                      return (
                        <a
                          key={member}
                          href={fbUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-1.5 rounded-lg bg-white/85 hover:bg-white border border-slate-300 hover:border-blue-400 shadow-2xs group transition-colors cursor-pointer"
                          title={`Open ${member}'s Facebook Profile`}
                        >
                          {itemContent}
                        </a>
                      );
                    }
                    return (
                      <div
                        key={member}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-white/85 border border-slate-300 shadow-2xs"
                      >
                        {itemContent}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 6-World Mastery Progress Checklist */}
            {includeProgress && (
              <section
                className={`border ${headingBorderClass} rounded-xl ${
                  isCompact ? 'p-3 space-y-2' : 'p-4 space-y-3'
                } bg-white break-inside-avoid`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-1.5">
                  <div className="flex items-center gap-2">
                    <MarioCoinBlockIcon size={16} />
                    <h2 className="font-black text-xs uppercase tracking-wide text-slate-950">
                      Six-World Mastery Checklist
                    </h2>
                  </div>
                  <span className="font-bold text-[11px] text-slate-900 tabular-nums">
                    Mastered: {completedCount} / {totalTopics} Modules ({overallPercent}%)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                  {WORLDS_METADATA.map((w) => {
                    const worldTopics = ALL_LAW_TOPICS.filter((t) => t.worldId === w.id);
                    const done = worldTopics.filter((t) => completedTopicIds.includes(t.id)).length;
                    return (
                      <div key={w.id} className={`p-2 border rounded-lg ${subtleBoxClass}`}>
                        <span className="font-bold block text-slate-950 break-words leading-tight">
                          W{w.worldNumber}: {w.shortTitle}
                        </span>
                        <span className="text-slate-700 tabular-nums">
                          {done}/{worldTopics.length} mastered
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Personal Study Notes */}
            {includePersonalNotes && resolvedNotes.length > 0 && (
              <section className="space-y-2.5 break-inside-avoid">
                <div className={`border-b-2 ${headingBorderClass} pb-1 flex items-center gap-2`}>
                  <NotebookPen className="w-4 h-4 text-slate-900" />
                  <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                    Personal Study Notes &amp; Codal Digests ({resolvedNotes.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {resolvedNotes.map((note) => {
                    const rawLines = note.content.split('\n').map((l) => l.trim()).filter(Boolean);
                    const isErrorDigest = note.content.includes('Ref: qerr_') || note.content.includes('Controlling statutory doctrine:');
                    return (
                      <div
                        key={note.id}
                        className={`border rounded-lg p-3 break-inside-avoid space-y-1.5 ${
                          isErrorDigest
                            ? 'border-amber-400 bg-amber-50/40'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-baseline justify-between gap-2 text-[11px] border-b border-slate-200/80 pb-1">
                          <span className="font-black text-slate-950 break-words min-w-0 flex-1">
                            {sanitizeMnemonicNoteTitle(note.title)}
                          </span>
                          <span className="font-mono text-[9.5px] text-slate-600 shrink-0 font-bold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300">
                            {note.worldTag}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-[11px]">
                          {parseStructuredNoteLines(note.content).map((block, lIdx) => {
                            if (block.kind === 'controlling') {
                              return (
                                <div
                                  key={lIdx}
                                  className="text-[10.5px] leading-relaxed text-emerald-950 bg-emerald-50/90 border-l-3 border-emerald-600 p-2 rounded-r my-1"
                                >
                                  <strong className="text-emerald-800 font-bold uppercase text-[9.5px] font-mono block">
                                    Controlling Statutory Doctrine:
                                  </strong>
                                  <span className="font-semibold text-slate-900">{block.value}</span>
                                </div>
                              );
                            }
                            if (block.kind === 'takeaway') {
                              return (
                                <div
                                  key={lIdx}
                                  className="text-[10.5px] leading-relaxed text-amber-950 bg-amber-50/90 border-l-3 border-amber-600 p-2 rounded-r my-1"
                                >
                                  <strong className="text-amber-800 font-bold uppercase text-[9.5px] font-mono block">
                                    Key Distinction &amp; Exam Takeaway:
                                  </strong>
                                  <span className="text-slate-900">{block.value}</span>
                                </div>
                              );
                            }
                            if (block.kind === 'scenario') {
                              return (
                                <div
                                  key={lIdx}
                                  className="text-[10.5px] leading-relaxed text-sky-950 bg-sky-50/90 border-l-3 border-sky-600 p-2 rounded-r my-1 italic"
                                >
                                  <strong className="text-sky-800 font-bold uppercase text-[9.5px] font-mono block not-italic">
                                    Bar Problem Scenario:
                                  </strong>
                                  <span className="text-slate-800">{block.value}</span>
                                </div>
                              );
                            }
                            if (block.kind === 'statutory') {
                              return (
                                <div
                                  key={lIdx}
                                  className="text-[10px] leading-relaxed text-purple-950 bg-purple-50/90 border-l-3 border-purple-600 p-2 rounded-r my-1 font-mono"
                                >
                                  <strong className="text-purple-800 font-bold uppercase text-[9.5px] block font-sans">
                                    Controlling Statutory Text:
                                  </strong>
                                  <span className="text-slate-900 whitespace-pre-wrap">{block.value}</span>
                                </div>
                              );
                            }
                            if (block.kind === 'case-law') {
                              return (
                                <div
                                  key={lIdx}
                                  className="text-[10.5px] leading-relaxed text-teal-950 bg-teal-50/90 border-l-3 border-teal-600 p-2 rounded-r my-1"
                                >
                                  <strong className="text-teal-800 font-bold uppercase text-[9.5px] font-mono block">
                                    Supreme Court Precedents:
                                  </strong>
                                  <span className="text-slate-900">{block.value}</span>
                                </div>
                              );
                            }
                            if (block.kind === 'ref') {
                              return (
                                <div key={lIdx} className="text-[9.5px] font-mono text-slate-500 pt-0.5">
                                  {block.value}
                                </div>
                              );
                            }
                            return (
                              <div
                                key={lIdx}
                                className="text-[10.5px] leading-relaxed text-slate-800 bg-slate-50 border-l-3 border-slate-400 p-1.5 rounded-r"
                              >
                                <strong className="text-slate-700 font-bold uppercase text-[9px] font-mono block">
                                  {block.label}:
                                </strong>
                                <span>{block.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Dynamic Clickable Table of Contents (TOC) Page */}
            {(formatOptions.generateToc ?? true) && (
              <section
                id="doc-table-of-contents"
                data-testid="print-table-of-contents"
                className={`border-2 ${headingBorderClass} rounded-2xl ${
                  isCompact ? 'p-3.5 sm:p-5 space-y-3' : 'p-4 sm:p-6 space-y-4'
                } bg-white break-inside-avoid print:break-after-page`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-slate-300 pb-2">
                  <div className="flex items-center gap-2">
                    <MarioSuperStarIcon size={18} />
                    <h2 className="font-black text-xs sm:text-sm uppercase tracking-wider text-slate-950 font-display">
                      Table of Contents (Statutory Syllabus &amp; Topic Anchors)
                    </h2>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-300">
                    {filteredTopics.length} Active Modules · Click to Jump
                  </span>
                </div>

                {/* TOC Part I: Reference Matrices & Formulas */}
                {(includeMultipliers || includeRegionalWages || includeLeavesMatrix || includeFormulasCheatSheet) && (
                  <div className="space-y-1.5 pt-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono block">
                      PART I: STATUTORY MATRICES &amp; FORMULAS
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      {includeMultipliers && (
                        <a
                          href="#print-matrix-multipliers"
                          onClick={(e) => {
                            e.preventDefault();
                            handleJumpToSection('print-matrix-multipliers');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 transition-colors group cursor-pointer"
                        >
                          <span className="font-bold text-slate-900 group-hover:text-amber-800 text-[11px]">
                            I. Statutory Pay Multiplier Matrix
                          </span>
                          <span className="font-mono text-[9.5px] text-slate-500">Arts. 87, 93–94 &rarr;</span>
                        </a>
                      )}
                      {includeRegionalWages && (
                        <a
                          href="#print-matrix-regional-wages"
                          onClick={(e) => {
                            e.preventDefault();
                            handleJumpToSection('print-matrix-regional-wages');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 transition-colors group cursor-pointer"
                        >
                          <span className="font-bold text-slate-900 group-hover:text-amber-800 text-[11px]">
                            II. 17 Regions Minimum Wage &amp; Kasambahay
                          </span>
                          <span className="font-mono text-[9.5px] text-slate-500">R.A. 6727 / 10361 &rarr;</span>
                        </a>
                      )}
                      {includeLeavesMatrix && (
                        <a
                          href="#print-matrix-statutory-leaves"
                          onClick={(e) => {
                            e.preventDefault();
                            handleJumpToSection('print-matrix-statutory-leaves');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 transition-colors group cursor-pointer"
                        >
                          <span className="font-bold text-slate-900 group-hover:text-amber-800 text-[11px]">
                            III. Statutory Leaves Master Ledger
                          </span>
                          <span className="font-mono text-[9.5px] text-slate-500">World 6 Leave Laws &rarr;</span>
                        </a>
                      )}
                      {includeFormulasCheatSheet && (
                        <a
                          href="#print-matrix-formulas-cheatsheet"
                          onClick={(e) => {
                            e.preventDefault();
                            handleJumpToSection('print-matrix-formulas-cheatsheet');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-400 transition-colors group cursor-pointer"
                        >
                          <span className="font-bold text-slate-900 group-hover:text-amber-800 text-[11px]">
                            IV. Mathematical Wage &amp; Overtime Cheat Sheet
                          </span>
                          <span className="font-mono text-[9.5px] text-slate-500">Cheat Sheet &rarr;</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* TOC Part II: Substantive Worlds & Topic Modules */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono block">
                    PART II: SUBSTANTIVE &amp; PROCEDURAL MODULES (CLICK TO JUMP)
                  </span>
                  <div className="space-y-2">
                    {WORLDS_METADATA.filter((w) => selectedWorlds.includes(w.id)).map((world) => {
                      const worldTopics = filteredTopics.filter((t) => t.worldId === world.id);
                      if (worldTopics.length === 0) return null;

                      return (
                        <div
                          key={world.id}
                          className={`p-2.5 rounded-xl border border-slate-200 ${subtleBoxClass} space-y-1.5`}
                        >
                          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
                            <a
                              href={`#doc-world-${world.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleJumpToSection(`doc-world-${world.id}`);
                              }}
                              className="font-black text-xs text-slate-950 uppercase tracking-wide hover:underline hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
                            >
                              <MarioCoinIcon size={12} />
                              <span>World {world.worldNumber}: {world.title.replace(/^WORLD \d+:\s*/i, '')}</span>
                            </a>
                            <span className="text-[9.5px] font-mono font-bold text-slate-600 tabular-nums">
                              {worldTopics.length} {worldTopics.length === 1 ? 'Topic' : 'Topics'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-xs">
                            {worldTopics.map((topic) => (
                              <a
                                key={topic.id}
                                href={`#doc-topic-${topic.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleJumpToSection(`doc-topic-${topic.id}`);
                                }}
                                className="flex items-center justify-between py-0.5 px-1 rounded hover:bg-amber-100/60 transition-colors group cursor-pointer"
                              >
                                <span className="text-slate-900 group-hover:text-amber-950 font-medium break-words leading-tight flex-1 min-w-0 pr-1 text-[11px]">
                                  <span className="font-bold text-slate-700 mr-1 font-mono text-[9.5px]">{topic.badge}</span>
                                  {topic.title}
                                </span>
                                <span className="text-[9px] text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity font-mono shrink-0">
                                  &rarr;
                                </span>
                              </a>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* I. Statutory Multipliers Reference Matrix */}
            <div id="print-sec-matrices" className="space-y-6">
            {includeMultipliers && (
              <section className="space-y-2" data-testid="print-matrix-multipliers">
                <div className={`border-b-2 ${headingBorderClass} pb-1 flex flex-wrap items-center justify-between gap-2`}>
                  <div className="flex items-center gap-2">
                    <MarioCoinIcon size={18} />
                    <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                      I. Statutory Pay Multiplier Matrix (DOLE BWC)
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowMultiplierSim((prev) => !prev);
                        marioAudio.playCoin();
                      }}
                      className="print:hidden px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] inline-flex items-center gap-1 border border-black shadow-xs cursor-pointer"
                      title="Open interactive DOLE pay multiplier simulator"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{showMultiplierSim ? 'Close Calculator' : 'Live Pay Calculator'}</span>
                    </button>
                    <span className="text-[10px] font-mono text-slate-600">Arts. 87, 93–94 Labor Code</span>
                  </div>
                </div>

                {/* Interactive Multiplier Live Simulator (Print Hidden) */}
                {showMultiplierSim && (
                  <div className="print:hidden p-3 rounded-xl bg-slate-900 text-white border-2 border-amber-400 shadow-lg space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center font-mario">
                          ?
                        </span>
                        <span className="font-black text-xs uppercase tracking-wide text-amber-300">
                          DOLE Statutory Pay Multiplier Simulator
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <label htmlFor="sim-wage-input" className="text-slate-300 font-bold">
                          Daily Wage: ₱
                        </label>
                        <input
                          id="sim-wage-input"
                          type="number"
                          min="100"
                          max="50000"
                          step="1"
                          value={simDailyWage}
                          onChange={(e) => setSimDailyWage(Math.max(1, Number(e.target.value) || 0))}
                          className="w-24 px-2 py-0.5 rounded bg-slate-800 border border-slate-600 text-amber-300 font-mono font-bold text-xs"
                        />
                        <span className="text-slate-400 text-[11px] font-mono">
                          (₱{(simDailyWage / 8).toFixed(2)}/hr)
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                        <span className="text-slate-400 text-[10px] block font-bold">Ordinary OT (+2h @ 125%)</span>
                        <span className="font-mono font-black text-amber-300 text-sm">
                          ₱{((simDailyWage / 8) * 1.25 * 2).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">Total: ₱{(simDailyWage + (simDailyWage / 8) * 1.25 * 2).toFixed(2)}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                        <span className="text-slate-400 text-[10px] block font-bold">Rest Day / Special (130%)</span>
                        <span className="font-mono font-black text-emerald-300 text-sm">
                          ₱{(simDailyWage * 1.3).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">+₱{(simDailyWage * 0.3).toFixed(2)} premium</span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                        <span className="text-slate-400 text-[10px] block font-bold">Regular Holiday (200%)</span>
                        <span className="font-mono font-black text-yellow-300 text-sm">
                          ₱{(simDailyWage * 2.0).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">200% double pay</span>
                      </div>
                      <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
                        <span className="text-slate-400 text-[10px] block font-bold">Holiday on Rest Day (260%)</span>
                        <span className="font-mono font-black text-sky-300 text-sm">
                          ₱{(simDailyWage * 2.6).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">+60% combined</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full overflow-x-auto print:overflow-visible">
                  <table className="print-friendly-matrix w-full table-fixed text-left text-xs sm:text-[13px] border border-slate-500 border-collapse tabular-nums box-border">
                    <colgroup>
                      <col style={{ width: '22%' }} />
                      <col style={{ width: '33%' }} />
                      <col style={{ width: '13%' }} />
                      <col style={{ width: '32%' }} />
                    </colgroup>
                    <thead>
                      <tr className={tableHeaderClass}>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black break-words">Benefit Category</th>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black break-words">Scenario / Day Type</th>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black text-right break-words">Rate</th>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black break-words">Statutory Formula</th>
                      </tr>
                    </thead>
                    <tbody>
                      {LABOR_BENEFITS_MULTIPLIER_LIST.map((row, idx) => (
                        <tr
                          key={idx}
                          className={`break-inside-avoid ${
                            idx % 2 === 1 ? zebraRowClass : 'bg-white'
                          }`}
                        >
                          <td className="p-2 sm:p-2.5 border border-slate-400 font-bold text-slate-950 align-top break-words leading-snug">
                            {row.benefit}
                          </td>
                          <td className="p-2 sm:p-2.5 border border-slate-400 text-slate-900 align-top break-words leading-snug">
                            {row.scenario}
                          </td>
                          <td className="p-2 sm:p-2.5 border border-slate-400 font-mono font-black text-slate-950 text-right align-top break-words leading-snug">
                            {(row.multiplierDecimal * 100).toFixed(1).replace(/\.0$/, '')}%
                          </td>
                          <td className="p-2 sm:p-2.5 border border-slate-400 font-mono text-xs sm:text-[12px] text-slate-900 align-top break-words leading-snug">
                            {row.formula}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* II. 17 Regions Minimum Wage & Kasambahay Matrix */}
            {includeRegionalWages && (
              <section className="space-y-2" data-testid="print-matrix-regional-wages">
                <div className={`border-b-2 ${headingBorderClass} pb-1 flex items-center justify-between gap-2`}>
                  <div className="flex items-center gap-2">
                    <MarioWarpPipeIcon size={18} />
                    <h2 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-wide">
                      II. 17 Regions Daily Minimum Wage &amp; Kasambahay Matrix
                    </h2>
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono text-slate-600">R.A. 6727 · R.A. 10361</span>
                </div>
                <div className="w-full overflow-x-auto print:overflow-visible">
                  <table className="print-friendly-matrix w-full table-fixed text-left text-xs sm:text-[13px] border border-slate-500 border-collapse tabular-nums box-border">
                    <colgroup>
                      <col style={{ width: '26%' }} />
                      <col style={{ width: '18%' }} />
                      <col style={{ width: '19%' }} />
                      <col style={{ width: '19%' }} />
                      <col style={{ width: '18%' }} />
                    </colgroup>
                    <thead>
                      <tr className={tableHeaderClass}>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black break-words">Region</th>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black break-words">Effectivity</th>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black text-right break-words">Non-Agriculture</th>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black text-right break-words">Agriculture</th>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black text-right break-words">Kasambahay / Mo.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {REGIONAL_MINIMUM_WAGES.map((rw, idx) => {
                        const kas = KASAMBAHAY_MINIMUM_WAGES[idx];
                        return (
                          <tr
                            key={rw.region}
                            className={`break-inside-avoid ${
                              idx % 2 === 1 ? zebraRowClass : 'bg-white'
                            }`}
                          >
                            <td className="p-2 sm:p-2.5 border border-slate-400 font-bold text-slate-950 align-top break-words leading-snug">
                              {rw.region}
                            </td>
                            <td className="p-2 sm:p-2.5 border border-slate-400 font-mono text-xs sm:text-[12px] text-slate-800 align-top break-words leading-snug">
                              {rw.effectivity}
                            </td>
                            <td className="p-2 sm:p-2.5 border border-slate-400 font-mono font-bold text-slate-950 text-right align-top break-words leading-snug">
                              {rw.nonAgri}
                            </td>
                            <td className="p-2 sm:p-2.5 border border-slate-400 font-mono text-slate-900 text-right align-top break-words leading-snug">
                              {rw.agri}
                            </td>
                            <td className="p-2 sm:p-2.5 border border-slate-400 font-mono text-slate-900 text-right align-top break-words leading-snug">
                              {kas ? kas.minimumWage : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* III. World 6 Statutory Leaves Master Matrix */}
            {includeLeavesMatrix && (
              <section className="space-y-2" data-testid="print-matrix-statutory-leaves">
                <div className={`border-b-2 ${headingBorderClass} pb-1 flex items-center justify-between gap-2`}>
                  <div className="flex items-center gap-2">
                    <MarioMushroomIcon size={18} variant="1up" />
                    <h2 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-wide">
                      III. World 6 Statutory Leaves Master Comparison Matrix
                    </h2>
                  </div>
                  <span className="text-[10px] sm:text-xs font-mono text-slate-600">Art. 95 &amp; Special Leave Statutes</span>
                </div>
                <div className="w-full overflow-x-auto print:overflow-visible">
                  <table className="print-friendly-matrix w-full table-fixed text-left text-xs sm:text-[13px] border border-slate-500 border-collapse tabular-nums box-border">
                    <colgroup>
                      <col style={{ width: '20%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '19%' }} />
                      <col style={{ width: '24%' }} />
                      <col style={{ width: '22%' }} />
                    </colgroup>
                    <thead>
                      <tr className={tableHeaderClass}>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black break-words">Statutory Leave</th>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black break-words">Legal Basis</th>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black break-words">Paid Duration</th>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black break-words">Key Eligibility</th>
                        <th className="p-2 sm:p-2.5 border border-slate-500 font-black break-words">Cash Commutation &amp; Payor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {STATUTORY_LEAVES_MASTER_ROWS.map((row, idx) => (
                        <tr
                          key={row.leave}
                          className={`break-inside-avoid ${
                            idx % 2 === 1 ? zebraRowClass : 'bg-white'
                          }`}
                        >
                          <td className="p-2 sm:p-2.5 border border-slate-400 font-bold text-slate-950 align-top break-words leading-snug">
                            {row.leave}
                          </td>
                          <td className="p-2 sm:p-2.5 border border-slate-400 font-mono text-xs sm:text-[12px] text-slate-800 align-top break-words leading-snug">
                            {formatOptions.includeLegalCitations ? row.basis : 'Statutory'}
                          </td>
                          <td className="p-2 sm:p-2.5 border border-slate-400 font-bold text-slate-950 align-top break-words leading-snug">
                            {row.duration}
                          </td>
                          <td className="p-2 sm:p-2.5 border border-slate-400 text-slate-900 align-top break-words leading-snug">
                            {row.eligibility}
                          </td>
                          <td className="p-2 sm:p-2.5 border border-slate-400 text-slate-900 align-top break-words leading-snug">
                            {row.conversion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
            </div>

            {/* IV. Unabridged Modules Breakdown (or Embedded Module Matrices in Matrices-Only Mode) */}
            <section className={isCompact ? 'space-y-4' : 'space-y-6'}>
              <div className={`border-b-2 ${headingBorderClass} pb-1 flex items-center justify-between gap-2`}>
                <h2 className="text-sm font-black text-slate-950 uppercase tracking-wide">
                  {matricesOnlyMode
                    ? 'IV. Embedded Module Comparative Matrices (Worlds 1–6)'
                    : 'IV. Codified Provisions, Doctrines, Exceptions & High-Yield Study Tips'}
                </h2>
                <span className="text-[10.5px] text-slate-600">
                  {matricesOnlyMode
                    ? 'Matrices-Only Cheat Sheet'
                    : formatOptions.hideCompletedTopics
                    ? 'Unmastered Focus Deck'
                    : 'Complete Unabridged Syllabus'}
                </span>
              </div>

              {/* Statutory Wage Multipliers & Formulas Cheat Sheet */}
              {includeFormulasCheatSheet && (
                <section className={`border ${headingBorderClass} rounded-xl p-3.5 ${subtleBoxClass} break-inside-avoid space-y-2`}>
                  <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                    <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                      Statutory Wage Multipliers &amp; Overtime Computation Cheat Sheet
                    </h3>
                    <span className="text-[10px] font-mono text-slate-600 font-bold">Labor Code Arts. 86, 87, 93, 94 &amp; P.D. 851</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="bg-white p-2 rounded-lg border border-slate-300">
                      <strong className="block text-slate-950 font-bold">Normal Overtime (Art. 87)</strong>
                      <span className="text-slate-700 font-mono font-bold text-xs">+25%</span>
                      <span className="block text-slate-500 text-[9px]">(125% of regular hourly rate)</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-300">
                      <strong className="block text-slate-950 font-bold">Night Shift Diff. (Art. 86)</strong>
                      <span className="text-slate-700 font-mono font-bold text-xs">+10%</span>
                      <span className="block text-slate-500 text-[9px]">(10:00 PM to 6:00 AM)</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-300">
                      <strong className="block text-slate-950 font-bold">Rest Day / Special Day (Art. 93)</strong>
                      <span className="text-slate-700 font-mono font-bold text-xs">130%</span>
                      <span className="block text-slate-500 text-[9px]">(Special Day on Rest Day = 150%)</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-300">
                      <strong className="block text-slate-950 font-bold">Regular Holiday (Art. 94)</strong>
                      <span className="text-slate-700 font-mono font-bold text-xs">200%</span>
                      <span className="block text-slate-500 text-[9px]">(Holiday on Rest Day = 260%)</span>
                    </div>
                  </div>
                </section>
              )}

              {/* High-Yield Labor Law Jurisprudence Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Four-Fold ER-EE Test Panel */}
                {includeFourFoldControlTest && (
                  <section className={`border ${headingBorderClass} rounded-xl p-3 ${subtleBoxClass} break-inside-avoid space-y-1.5`}>
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                      <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                        Four-Fold Employer-Employee Test
                      </h3>
                      <span className="text-[9.5px] font-mono font-bold text-slate-700">
                        <em className="italic">Calamba Medical v. CIR</em>
                      </span>
                    </div>
                    <ol className="list-decimal pl-4 text-[10.5px] text-slate-900 space-y-0.5">
                      <li><strong className="font-bold text-slate-950">Selection and Engagement</strong> of the worker or contractor.</li>
                      <li><strong className="font-bold text-slate-950">Payment of Wages</strong> or statutory remuneration.</li>
                      <li><strong className="font-bold text-slate-950">Power of Dismissal</strong> or disciplinary sanction.</li>
                      <li><strong className="font-bold text-slate-950">Power of Control</strong> over means and methods of work (The most critical test!).</li>
                    </ol>
                  </section>
                )}

                {/* Two-Notice Rule Due Process Dismissal Flowchart */}
                {includeTwoNoticeChecklist && (
                  <section className={`border ${headingBorderClass} rounded-xl p-3 ${subtleBoxClass} break-inside-avoid space-y-1.5`}>
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                      <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                        Two-Notice Rule Statutory Due Process
                      </h3>
                      <span className="text-[9.5px] font-mono font-bold text-slate-700">
                        <em className="italic">King of Kings</em> / <em className="italic">Agabon</em> Doctrine
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-900 space-y-1">
                      <p><strong className="font-bold text-slate-950">1st Notice:</strong> Specific charges + at least 5 calendar days to explain.</p>
                      <p><strong className="font-bold text-slate-950">Hearing / Conference:</strong> Ample opportunity to defend with assistance.</p>
                      <p><strong className="font-bold text-slate-950">2nd Notice:</strong> Decision stating specific grounds proven for termination.</p>
                      <p className="text-[9px] text-slate-600 italic"><strong className="font-bold not-italic text-slate-700">Statutory Sanction:</strong> P30,000 nominal damages (just cause) / P50,000 (authorized cause).</p>
                    </div>
                  </section>
                )}

                {/* Art. 302 Retirement Pay 22.5-Day Formula Box */}
                {includeRetirementFormulaBox && (
                  <section className={`border ${headingBorderClass} rounded-xl p-3 ${subtleBoxClass} break-inside-avoid space-y-1.5`}>
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                      <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                        Art. 302 Retirement One-Half Month Salary (22.5 Days)
                      </h3>
                      <span className="text-[9.5px] font-mono font-bold text-slate-700">
                        <em className="italic">Capitol Wireless</em> Doctrine
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-900 font-semibold leading-relaxed">
                      Statutory 1/2 month = <strong>15 days basic</strong> + <strong>5 days SIL</strong> + <strong>2.5 days (1/12th of 13th month pay)</strong> = <strong>22.5 days per year of service</strong> (fraction of at least 6 months considered 1 whole year).
                    </p>
                  </section>
                )}

                {/* Latin Jurisprudence Maxims */}
                {includeLatinMaxims && (
                  <section className={`border ${headingBorderClass} rounded-xl p-3 ${subtleBoxClass} break-inside-avoid space-y-1.5`}>
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                      <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                        Constitutional Doctrines &amp; Latin Maxims
                      </h3>
                      <span className="text-[9px] font-mono font-bold text-slate-600">Art. 4, Labor Code</span>
                    </div>
                    <ul className="list-disc pl-4 text-[10px] text-slate-900 space-y-1">
                      <li><strong className="font-black text-slate-950 font-display"><em className="italic">In dubio pro operario</em>:</strong> Doubts in statutory interpretation are resolved in favor of labor.</li>
                      <li><strong className="font-black text-slate-950 font-display">Principle of Non-Diminution:</strong> Vested employer benefits cannot be unilaterally reduced (Art. 100).</li>
                      <li><strong className="font-black text-slate-950 font-display"><em className="italic">Salus populi est suprema lex</em>:</strong> Labor standards are police power social justice protections.</li>
                    </ul>
                  </section>
                )}
              </div>

              {filteredTopics.length === 0 ? (
                <div className="border border-slate-300 rounded-xl p-6 text-center space-y-1.5 bg-slate-50">
                  <BookOpenCheck className="w-6 h-6 text-slate-700 mx-auto" />
                  <p className="font-bold text-xs text-slate-900">
                    All topics in your selected worlds are already marked Mastered!
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Uncheck &ldquo;Hide Completed Topics&rdquo; or enable more Worlds above to include mastered modules in your print packet.
                  </p>
                </div>
              ) : (
                WORLDS_METADATA.filter((w) => selectedWorlds.includes(w.id)).map((world, worldIdx) => {
                  const worldTopics = filteredTopics
                    .filter((t) => t.worldId === world.id)
                    .filter((t) => !matricesOnlyMode || t.rules.some((r) => Boolean(r.tableData)));
                  if (worldTopics.length === 0) return null;

                  return (
                    <div
                      key={world.id}
                      id={`doc-world-${world.id}`}
                      className={`${isCompact ? 'space-y-3' : 'space-y-4'} ${
                        formatOptions.pageBreakPerWorld && worldIdx > 0 ? 'print-page-break-before' : ''
                      }`}
                    >
                      {/* Clean Theme-Matched Editorial World Banner */}
                      <div
                        style={{
                          backgroundColor: activeExtendedTheme.accentSoftBgHex,
                          borderColor: activeExtendedTheme.borderHex,
                          color: activeExtendedTheme.bodyTextHex,
                        }}
                        className={`border-2 rounded-xl ${
                          isCompact ? 'px-3 py-2' : 'px-4 py-2.5'
                        } break-inside-avoid`}
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3
                            style={{ color: activeExtendedTheme.accentHex }}
                            className="font-black text-xs sm:text-sm uppercase tracking-wide flex items-center gap-1.5"
                          >
                            <MarioSuperStarIcon size={14} />
                            <span>World {world.worldNumber}: {world.title.replace(/^WORLD \d+:\s*/i, '')}</span>
                          </h3>
                          <span
                            style={{ color: activeExtendedTheme.mutedTextHex }}
                            className="text-[10px] font-mono tabular-nums font-bold"
                          >
                            {worldTopics.length} {worldTopics.length === 1 ? 'Module' : 'Modules'}
                          </span>
                        </div>
                        {!matricesOnlyMode && (
                          <p
                            style={{ color: activeExtendedTheme.mutedTextHex }}
                            className="text-[11px] mt-0.5"
                          >
                            {world.description}
                          </p>
                        )}
                      </div>

                      <div className={twoColumnLayout ? 'columns-1 md:columns-2 gap-5 print:columns-2 [column-fill:_balance]' : isCompact ? 'space-y-3' : 'space-y-4'}>
                        {worldTopics.map((topic, topicIdx) => {
                          const isDone = completedTopicIds.includes(topic.id);
                          const combinedTips = [
                            ...(topic.barTips ?? []),
                            ...(topic.keyTips ?? []),
                          ];
                          const rulesToRender = matricesOnlyMode
                            ? topic.rules.filter((r) => Boolean(r.tableData))
                            : topic.rules;
                          const hasTable = rulesToRender.some((r) => Boolean(r.tableData));

                          return (
                            <article
                              key={topic.id}
                              id={`doc-topic-${topic.id}`}
                              className={`border-2 border-slate-300 rounded-2xl bg-white shadow-xs ${
                                isCompact ? 'p-3 sm:p-4 space-y-2.5' : 'p-4 sm:p-5 space-y-3.5'
                              } ${
                                twoColumnLayout
                                  ? `mb-5 inline-block w-full break-inside-avoid [break-inside:_avoid] [page-break-inside:_avoid] ${hasTable ? 'md:[column-span:_all]' : ''}`
                                  : 'my-3.5 break-inside-avoid [break-inside:_avoid] [page-break-inside:_avoid]'
                              } ${
                                formatOptions.pageBreakPerModule && topicIdx > 0
                                  ? 'print-module-break'
                                  : ''
                              } max-w-full overflow-hidden box-border [overflow-wrap:_anywhere]`}
                            >
                              {/* Module Header Strip */}
                              <div className={`${
                                isCompact ? '-mx-3 -mt-3 px-3 py-2 sm:-mx-4 sm:-mt-4 sm:px-4 sm:py-2.5' : '-mx-4 -mt-4 px-4 py-2.5 sm:-mx-5 sm:-mt-5 sm:px-5 sm:py-3'
                              } rounded-t-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b-2 border-slate-200 flex items-start justify-between gap-3 break-inside-avoid`}>
                                <div className="space-y-1 min-w-0">
                                  {formatOptions.includeLegalCitations && (
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 text-amber-300 font-mono text-[9.5px] font-black uppercase tracking-wider shadow-2xs">
                                        <MarioCoinIcon size={11} />
                                        <span>Statutory Basis: {topic.badge}</span>
                                      </span>
                                    </div>
                                  )}
                                  <h4
                                    className={`font-black ${
                                      isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                                    } text-slate-950 leading-snug font-display`}
                                  >
                                    {topic.title}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {(formatOptions.generateToc ?? true) && (
                                    <a
                                      href="#doc-table-of-contents"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleJumpToSection('doc-table-of-contents');
                                      }}
                                      className="print:hidden text-[9px] font-mono font-bold text-slate-500 hover:text-amber-600 bg-white/80 hover:bg-amber-50 px-1.5 py-1 rounded border border-slate-200 transition-colors cursor-pointer"
                                      title="Jump to Table of Contents"
                                    >
                                      ↑ TOC
                                    </a>
                                  )}
                                  <span className={`text-[11px] font-mono font-black tabular-nums px-2.5 py-1 rounded-lg border flex items-center gap-1 ${
                                    isDone
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}>
                                    {isDone && <MarioSuperStarIcon size={12} />}
                                    <span>{isDone ? '[MASTERED]' : '[TO REVIEW]'}</span>
                                  </span>
                                </div>
                              </div>

                              {/* Mario Executive Takeaway */}
                              {!matricesOnlyMode && includeExecutiveMarioSummary && topic.beginnerSummary && (
                                <div className="bg-gradient-to-r from-amber-50 via-amber-100/70 to-amber-50 border-2 border-amber-300/90 rounded-xl p-3 text-xs sm:text-sm text-amber-950 font-medium break-inside-avoid shadow-2xs flex items-start gap-2.5">
                                  <MarioSuperStarIcon size={16} className="shrink-0 mt-0.5 text-amber-600" />
                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <strong className="font-black text-amber-900 uppercase text-[11px] font-mono tracking-wide block">
                                      Mario Executive Takeaway:
                                    </strong>
                                    <p className="leading-relaxed">{topic.beginnerSummary}</p>
                                  </div>
                                </div>
                              )}

                              {/* Core Codal Rule Box */}
                              {!matricesOnlyMode && (
                                <div className="bg-slate-50/80 border-l-4 border-amber-500 rounded-r-xl p-3 text-slate-900 leading-relaxed text-xs sm:text-sm space-y-0.5 shadow-2xs break-inside-avoid">
                                  <strong className="font-black text-amber-900 uppercase text-[10.5px] font-mono tracking-wider block">
                                    Core Statutory Rule:
                                  </strong>
                                  <p className="text-slate-900 leading-relaxed">
                                    {stripInlineLegalCitations(
                                      topic.summary,
                                      formatOptions.includeLegalCitations
                                    )}
                                  </p>
                                </div>
                              )}

                              {/* Key Doctrines & Jurisprudence */}
                              {!matricesOnlyMode &&
                                formatOptions.includeLegalCitations &&
                                topic.keyDoctrines &&
                                topic.keyDoctrines.length > 0 && (
                                  <div
                                    className="bg-slate-50/90 border-l-4 border-slate-700 rounded-r-xl p-3 space-y-1.5 shadow-2xs break-inside-avoid"
                                  >
                                    <span className="font-black text-slate-950 block text-xs sm:text-[13px] uppercase tracking-wide font-display">
                                      Controlling Jurisprudence &amp; Legal Precedents
                                    </span>
                                    <ul className="list-disc pl-4 space-y-1.5 text-slate-900 text-xs sm:text-sm">
                                      {topic.keyDoctrines.map((d, dIdx) => (
                                        <li key={dIdx} className="leading-relaxed break-words">
                                          {renderFormattedLegalText(cleanRuleText(d))}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                              {/* Codified Rules, Subsections & Embedded Statutory Tables */}
                              <div
                                className={
                                  isCompact && !matricesOnlyMode
                                    ? 'grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5'
                                    : 'space-y-3'
                                }
                              >
                                {rulesToRender.map((rule, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className={`space-y-1.5 ${
                                      rule.tableData ? '' : 'break-inside-avoid'
                                    } ${rule.tableData && isCompact ? 'md:col-span-2' : ''}`}
                                  >
                                    <span className="font-black text-slate-950 flex items-start gap-2 break-after-avoid text-sm sm:text-base font-display">
                                      {includeCheckboxes && (
                                        <span className="inline-block w-4 h-4 border-2 border-slate-700 rounded-xs mt-0.5 shrink-0" />
                                      )}
                                      <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center shrink-0 border border-amber-600 shadow-2xs tabular-nums font-mono mt-0.5">
                                        {rIdx + 1}
                                      </span>
                                      <span className="flex-1 min-w-0">
                                        {stripInlineLegalCitations(
                                          rule.heading,
                                          formatOptions.includeLegalCitations
                                        )}
                                      </span>
                                    </span>
                                    {!matricesOnlyMode && rule.description && (
                                      <p className="text-slate-800 pl-3 leading-relaxed text-xs sm:text-sm">
                                        {stripInlineLegalCitations(
                                          rule.description,
                                          formatOptions.includeLegalCitations
                                        )}
                                      </p>
                                    )}
                                    {!matricesOnlyMode && rule.items && rule.items.length > 0 && (
                                      <div className="pl-3 sm:pl-4 space-y-1.5 text-slate-800 leading-relaxed text-xs sm:text-sm">
                                        {rule.items.map((item, iIdx) => {
                                          const rawCleaned = stripInlineLegalCitations(
                                            item,
                                            formatOptions.includeLegalCitations
                                          );
                                          const entry = parseListEntry(rawCleaned);
                                          return (
                                            <div key={iIdx} className="flex items-start gap-2">
                                              <span
                                                className={`shrink-0 font-bold ${
                                                  entry.isNumbered
                                                    ? 'font-mono text-slate-900 min-w-[1.3rem]'
                                                    : 'text-amber-500 text-xs'
                                                }`}
                                              >
                                                {entry.marker}
                                              </span>
                                              <span className="flex-1 min-w-0">{entry.text}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {!matricesOnlyMode &&
                                      rule.subSections &&
                                      rule.subSections.map((sub, sIdx) => (
                                        <div key={sIdx} className="pl-3 sm:pl-5 pt-1 space-y-1">
                                          <span className="font-bold text-slate-950 block text-xs sm:text-sm">
                                            {stripInlineLegalCitations(
                                              sub.title,
                                              formatOptions.includeLegalCitations
                                            )}
                                          </span>
                                          <div className="pl-2 sm:pl-3 space-y-1 text-slate-800 leading-relaxed text-xs sm:text-sm">
                                            {sub.items.map((si, siIdx) => {
                                              const rawCleaned = stripInlineLegalCitations(
                                                si,
                                                formatOptions.includeLegalCitations
                                              );
                                              const entry = parseListEntry(rawCleaned);
                                              return (
                                                <div key={siIdx} className="flex items-start gap-2">
                                                  <span
                                                    className={`shrink-0 font-bold ${
                                                      entry.isNumbered
                                                        ? 'font-mono text-slate-900 min-w-[1.3rem]'
                                                        : 'text-slate-400 text-xs'
                                                    }`}
                                                  >
                                                    {entry.marker}
                                                  </span>
                                                  <span className="flex-1 min-w-0">{entry.text}</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ))}
                                    {rule.tableData && (
                                      <div className="w-full overflow-x-auto print:overflow-visible pt-0.5">
                                        <table className="print-friendly-matrix w-full table-fixed text-left text-[10.5px] border border-slate-500 border-collapse tabular-nums box-border">
                                          <colgroup>
                                            {getPrintColumnWidths(rule.tableData.headers.length).map(
                                              (widthPct, colIdx) => (
                                                <col key={colIdx} style={{ width: widthPct }} />
                                              )
                                            )}
                                          </colgroup>
                                          <thead>
                                            <tr className={tableHeaderClass}>
                                              {rule.tableData.headers.map((h, hIdx) => (
                                                <th
                                                  key={hIdx}
                                                  style={{
                                                    backgroundColor: activeExtendedTheme.tableHeadBgHex,
                                                    color: guaranteedTableHeadTextColor,
                                                    borderColor: activeExtendedTheme.borderHex,
                                                  }}
                                                  className="p-1.5 border font-black break-words"
                                                >
                                                  {stripInlineLegalCitations(
                                                    h,
                                                    formatOptions.includeLegalCitations
                                                  )}
                                                </th>
                                              ))}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {rule.tableData.rows.map((rRow, rrIdx) => (
                                              <tr
                                                key={rrIdx}
                                                className={`break-inside-avoid ${
                                                  rrIdx % 2 === 1 ? zebraRowClass : 'bg-white'
                                                }`}
                                              >
                                                {rRow.map((cell, cIdx) => (
                                                  <td
                                                    key={cIdx}
                                                    className={`p-1.5 border border-slate-400 align-top break-words leading-snug ${
                                                      cIdx === 0
                                                        ? 'font-bold text-slate-950'
                                                        : 'text-slate-900'
                                                    }`}
                                                  >
                                                    {stripInlineLegalCitations(
                                                      cell,
                                                      formatOptions.includeLegalCitations
                                                    )}
                                                  </td>
                                                ))}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              {/* Statutory Exceptions */}
                              {!matricesOnlyMode && topic.exceptions && topic.exceptions.length > 0 && (
                                <div
                                  className={`${subtleBoxClass} border rounded-lg ${
                                    isCompact ? 'p-2 space-y-1' : 'p-3 space-y-1.5'
                                  } break-inside-avoid`}
                                >
                                  <span className="font-bold text-slate-950 block text-xs sm:text-[13px] uppercase tracking-wide">
                                    General Rule &amp; Statutory Exceptions
                                  </span>
                                  {topic.exceptions.map((ex, exIdx) => (
                                    <div key={exIdx} className="space-y-1 text-xs sm:text-sm">
                                      <p className="font-semibold text-slate-900">
                                        General Rule:{' '}
                                        {stripInlineLegalCitations(
                                          ex.generalRule,
                                          formatOptions.includeLegalCitations
                                        )}
                                      </p>
                                      <div className="pl-4 space-y-1 text-slate-800">
                                        {ex.exceptions.map((eItem, eiIdx) => {
                                          const rawCleaned = stripInlineLegalCitations(
                                            eItem,
                                            formatOptions.includeLegalCitations
                                          );
                                          const entry = parseListEntry(rawCleaned);
                                          return (
                                            <div key={eiIdx} className="flex items-start gap-2">
                                              <span className="shrink-0 font-bold text-rose-600 text-xs">
                                                {entry.isNumbered ? entry.marker : '•'}
                                              </span>
                                              <span className="flex-1 min-w-0">{entry.text}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* High-Yield Study Tips & Practical Takeaway */}
                              {!matricesOnlyMode &&
                                formatOptions.includeBarTips &&
                                (combinedTips.length > 0 || topic.practicalTakeaway) && (
                                  <div
                                    className={`border ${tipBoxClass} rounded-lg ${
                                      isCompact ? 'p-2 space-y-0.5' : 'p-3 space-y-1.5'
                                    } break-inside-avoid`}
                                  >
                                    <span className="font-bold text-slate-950 flex items-center gap-1.5 text-xs sm:text-[13px] uppercase tracking-wide">
                                      <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                      Memory Traps &amp; High-Yield Takeaways
                                    </span>
                                    {combinedTips.length > 0 && (
                                      <div className="pl-2 space-y-1 text-slate-900 text-xs sm:text-sm">
                                        {combinedTips.map((tip, tIdx) => {
                                          const rawCleaned = stripInlineLegalCitations(
                                            tip,
                                            formatOptions.includeLegalCitations
                                          );
                                          const entry = parseListEntry(rawCleaned);
                                          return (
                                            <div key={tIdx} className="flex items-start gap-2">
                                              <span className="shrink-0 font-bold text-amber-600 text-xs">
                                                {entry.isNumbered ? entry.marker : '•'}
                                              </span>
                                              <span className="flex-1 min-w-0">{entry.text}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {topic.practicalTakeaway && (
                                      <p className="text-slate-800 pt-1 text-xs sm:text-sm">
                                        <strong>Practical Application:</strong>{' '}
                                        {stripInlineLegalCitations(
                                          topic.practicalTakeaway,
                                          formatOptions.includeLegalCitations
                                        )}
                                      </p>
                                    )}
                                  </div>
                                )}

                              {/* Optional Hand-Written Note Lines */}
                              {formatOptions.blankNoteLinesCount !== undefined &&
                                formatOptions.blankNoteLinesCount > 0 && (
                                  <div className="pt-2 space-y-1.5 break-inside-avoid print:block">
                                    <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">
                                      Learner Notes &amp; Statutory Annotations:
                                    </span>
                                    {Array.from({ length: formatOptions.blankNoteLinesCount }).map(
                                      (_, lineIdx) => (
                                        <div
                                          key={lineIdx}
                                          className="w-full border-b border-dashed border-slate-400 h-3.5"
                                        />
                                      )
                                    )}
                                  </div>
                                )}
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </section>

            {/* Learner Honor Pledge & Attestation */}
            {includeHonorPledge && (
              <section
                id="print-sec-pledge"
                className={`border ${headingBorderClass} rounded-xl p-4 ${subtleBoxClass} break-inside-avoid space-y-2 mt-4`}
              >
                <div className="flex items-center justify-between border-b border-slate-300 pb-1">
                  <h3 className="font-black text-xs uppercase tracking-wide text-slate-950">
                    Learner&apos;s Workplace Justice Pledge &amp; Attestation
                  </h3>
                  <span className="text-[10px] font-mono text-slate-600 font-bold">Labor Standards Mastery</span>
                </div>
                <p className="text-[11px] text-slate-800 italic leading-relaxed">
                  &ldquo;I hereby affirm that I have studied and committed to understanding the provisions, exceptions, wage computations, and Supreme Court doctrines of Philippine Labor Standards codified herein, with integrity and respect for fair workplace rights.&rdquo;
                </p>
                <div className="pt-4 flex flex-wrap items-end justify-between gap-4 text-[11px] text-slate-900">
                  <div className="space-y-1">
                    <div className="border-b-2 border-slate-950 w-64 pb-1">
                      <span className="font-bold text-xs">{candidateName || playerName || 'Learner Full Name & Signature'}</span>
                    </div>
                    <span className="text-[10px] text-slate-600">Learner Signature</span>
                  </div>
                  <div className="space-y-1">
                    <div className="border-b-2 border-slate-950 w-36 pb-1">
                      <span className="font-mono text-xs">{currentDate}</span>
                    </div>
                    <span className="text-[10px] text-slate-600">Date Completed</span>
                  </div>
                </div>
              </section>
            )}

            {/* Editorial Print Footer */}
            <footer
              className={`border-t-2 ${headingBorderClass} pt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600 font-mono break-inside-avoid`}
            >
              <span>Created by Matthew (Main Creator · Executed All Roles) · Super Mario Labor Standards Guide (Worlds 1–6)</span>
              <span>Complete Six-World Reviewer</span>
            </footer>
          </div>
          )}
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};
