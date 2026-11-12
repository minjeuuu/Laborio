import React, { useState, useEffect, useMemo, useRef } from 'react';
import { jsPDF } from 'jspdf';
import {
  sanitizePdfText,
  drawFormattedLegalParagraph,
  tokenizeLegalTextToWords,
  wrapStyledWordTokens,
  triggerPdfDownloadFromBytes,
  ensureHighFidelityPdfFileSize,
  MIN_REVIEWER_PDF_BYTES,
} from '../utils/pdfExportService';
import {
  MARIO_LABOR_LAW_CREST_DATA_URL,
  MARIO_OFFICIAL_SEAL_DATA_URL,
} from '../utils/pdfHdAssets';
import {
  NotebookPen,
  Plus,
  Trash2,
  Pin,
  Search,
  X,
  Sparkles,
  Check,
  Pencil,
  Copy,
  Mic,
  MicOff,
  Highlighter,
  Star,
  Calendar,
  GripVertical,
  FileDown,
  Download,
  FileText,
  ShieldCheck,
  Lightbulb,
  BookOpen,
  Scale,
  Gavel,
  Swords,
} from 'lucide-react';
import {
  StudyNoteItem,
  StudyNoteCategoryTag,
  STUDY_NOTE_CATEGORY_TAGS,
  loadStudyNotes,
  saveStudyNotes,
  createStudyNote,
  updateStudyNote,
  deleteStudyNote,
  filterStudyNotes,
  sanitizeMnemonicNoteTitle,
  parseStructuredNoteLines,
  cleanNoteContent,
} from '../utils/engagementFeatures';
import {
  detectNotePerfection,
  perfectifyNoteContent,
} from '../utils/notePerfectionDetector';
import {
  PLANNER_DAYS,
  PlannerDayKey,
  NoteLineAnnotationsMap,
  WeeklyStudyPlannerSchedule,
  loadNoteLineAnnotations,
  saveNoteLineAnnotations,
  toggleNoteLineHighlight,
  toggleNoteLineStar,
  loadWeeklyStudyPlanner,
  saveWeeklyStudyPlanner,
  assignModuleToPlannerDay,
  removeModuleFromPlannerDay,
  HighlightColorKey,
  HIGHLIGHT_COLORS,
  DEFAULT_HIGHLIGHT_COLOR,
  getHighlightColorSpec,
} from '../utils/studyPlannerAndNotes';
import { WORLDS_METADATA, ALL_LAW_TOPICS } from '../data/laborLawData';
import { marioAudio } from '../utils/audio';
import { MarioCoinIcon } from './MarioIcons';

interface StudyNotesDrawerProps {
  activeWorld: string;
  activeTab: string;
  onNotesChange?: (notes: StudyNoteItem[]) => void;
  coins?: number;
}

const QUICK_MNEMONIC_TEMPLATES: { label: string; worldTag: string; title: string; content: string }[] = [
  {
    label: '20m Brownout',
    worldTag: 'world1',
    title: 'Brownout <= 20 Mins Rule',
    content: 'Power interruptions of 20 minutes or less are COMPENSABLE hours worked (Art. 84 Implementing Rules).',
  },
  {
    label: '390% Holiday',
    worldTag: 'holidays',
    title: 'Double Holiday + Rest Day = 390%',
    content: '2 Regular Holidays coincide = 200% unworked, 300% worked. Add +30% of 300% (+90%) on Rest Day = 390%!',
  },
  {
    label: '100% Service Charge',
    worldTag: 'world2',
    title: 'R.A. 11360 Service Charges',
    content: '100% distributed equally to covered rank-and-file/supervisory workers; managerial employees excluded.',
  },
  {
    label: 'D.O. 174 LOC',
    worldTag: 'world3',
    title: 'Labor-Only Contracting Test',
    content: 'No substantial capital/investment + directly related to principal business OR no control over workers = Prohibited LOC.',
  },
  {
    label: '105d Maternity / 5d SIL',
    worldTag: 'world6',
    title: 'World 6 Statutory Leaves Key Numbers',
    content: 'SIL: 5d commutable after 1 yr (Art. 95) | Maternity: 105d live (+15d solo) / 60d miscarriage (RA 11210) | Paternity: 7d first 4 (RA 8187) | Solo Parent: 7d after 6 mos (RA 11861) | VAWC: 10d (RA 9262).',
  },
];

export const StudyNotesDrawer: React.FC<StudyNotesDrawerProps> = ({
  activeWorld,
  activeTab,
  onNotesChange,
  coins = 0,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<StudyNoteItem[]>(() =>
    typeof window !== 'undefined' ? loadStudyNotes(window.localStorage) : []
  );

  useEffect(() => {
    const handleOpenNotes = () => {
      setIsOpen(true);
      marioAudio.playPipe();
    };
    const handleExternalUpdate = () => {
      const refreshed = loadStudyNotes(window.localStorage);
      setNotes(refreshed);
      onNotesChange?.(refreshed);
    };
    window.addEventListener('mario-open-study-notes', handleOpenNotes);
    window.addEventListener('mario-study-notes-updated', handleExternalUpdate);
    return () => {
      window.removeEventListener('mario-open-study-notes', handleOpenNotes);
      window.removeEventListener('mario-study-notes-updated', handleExternalUpdate);
    };
  }, [onNotesChange]);

  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftWorldTag, setDraftWorldTag] = useState<string>('all');
  const [draftCategoryTag, setDraftCategoryTag] =
    useState<StudyNoteCategoryTag>('Quick Reference');
  const [worldFilter, setWorldFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [drawerTab, setDrawerTab] = useState<'notes' | 'planner'>('notes');
  const [lineAnnotations, setLineAnnotations] = useState<NoteLineAnnotationsMap>(() =>
    typeof window !== 'undefined' ? loadNoteLineAnnotations(window.localStorage) : {}
  );
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyStudyPlannerSchedule>(() =>
    typeof window !== 'undefined' ? loadWeeklyStudyPlanner(window.localStorage) : loadWeeklyStudyPlanner()
  );
  const [plannerWorldFilter, setPlannerWorldFilter] = useState<string>('all');
  const [selectedDayByTopic, setSelectedDayByTopic] = useState<Record<string, PlannerDayKey>>({});
  const [dragHoverDay, setDragHoverDay] = useState<PlannerDayKey | null>(null);
  const [activeHighlightColor, setActiveHighlightColor] = useState<HighlightColorKey>('yellow');

  // Voice Memo / Multi-Language SpeechRecognition state ('' = Auto-Detect All Languages)
  const [voiceLang, setVoiceLang] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [speechNotice, setSpeechNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const voiceLanguageOptions = [
    { code: '', label: 'Auto-Detect (All Languages)' },
    { code: 'fil-PH', label: 'Filipino / Tagalog (PH)' },
    { code: 'en-PH', label: 'English (Philippines)' },
    { code: 'en-US', label: 'English (US)' },
    { code: 'es-ES', label: 'Español' },
    { code: 'ja-JP', label: '日本語 (Japanese)' },
    { code: 'ko-KR', label: '한국어 (Korean)' },
    { code: 'zh-CN', label: '中文 (Mandarin)' },
  ];

  const handleToggleVoiceMemo = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechNotice('Voice dictation not supported in this browser. Try Chrome or Edge.');
      setTimeout(() => setSpeechNotice(null), 4000);
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
      setSpeechNotice(null);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = false;
      if (voiceLang) {
        rec.lang = voiceLang;
      }

      rec.onstart = () => {
        setIsListening(true);
        const langLabel =
          voiceLanguageOptions.find((l) => l.code === voiceLang)?.label ||
          'Auto-Detect (All Languages)';
        setSpeechNotice(`Listening (${langLabel})... speak clearly to transcribe`);
        marioAudio.playCoin();
      };

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
        if (transcript.trim()) {
          setDraftContent((prev) => (prev ? `${prev} ${transcript.trim()}` : transcript.trim()));
        }
      };

      rec.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        setSpeechNotice(err.error === 'not-allowed' ? 'Microphone permission denied' : `Mic error: ${err.error || 'Unavailable'}`);
        setTimeout(() => setSpeechNotice(null), 4000);
      };

      rec.onend = () => {
        setIsListening(false);
        setTimeout(() => setSpeechNotice(null), 2500);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
      setSpeechNotice('Could not start microphone speech recognition.');
      setTimeout(() => setSpeechNotice(null), 4000);
    }
  };

  // Sync default world tag when user switches worlds
  useEffect(() => {
    if (!editingId) {
      setDraftWorldTag(activeWorld && activeWorld !== 'all' ? activeWorld : 'all');
    }
  }, [activeWorld, editingId]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveStudyNotes(notes, window.localStorage);
    }
    onNotesChange?.(notes);
  }, [notes, onNotesChange]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveNoteLineAnnotations(lineAnnotations, window.localStorage);
    }
  }, [lineAnnotations]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      saveWeeklyStudyPlanner(weeklySchedule, window.localStorage);
    }
  }, [weeklySchedule]);

  const [copiedAllNotes, setCopiedAllNotes] = useState(false);

  const quizErrorNotesCount = useMemo(
    () => notes.filter((n) => typeof n.content === 'string' && n.content.includes('Ref: qerr_')).length,
    [notes]
  );

  const visibleNotes = useMemo(() => {
    let result = filterStudyNotes(
      notes,
      worldFilter,
      searchQuery,
      categoryFilter === 'quiz_errors' ? 'all' : (categoryFilter as any)
    );
    if (categoryFilter === 'quiz_errors') {
      result = result.filter((n) => typeof n.content === 'string' && n.content.includes('Ref: qerr_'));
    }
    return result;
  }, [notes, worldFilter, searchQuery, categoryFilter]);

  const worldTagOptions = [
    { id: 'all', label: 'General / All Worlds' },
    ...WORLDS_METADATA.map((w) => ({
      id: w.id,
      label: `W${w.worldNumber}: ${w.shortTitle}`,
    })),
    { id: 'holidays', label: 'Holidays Hub' },
    { id: 'wages_matrix', label: '17 Regions Wages' },
  ];

  const getWorldBadgeLabel = (tag: string) => {
    const found = worldTagOptions.find((o) => o.id === tag);
    return found ? found.label : 'General';
  };

  const [showDrawerPerfectionAdvice, setShowDrawerPerfectionAdvice] = useState(false);

  const drawerPerfectionReport = useMemo(
    () => detectNotePerfection({ title: draftTitle, content: draftContent }),
    [draftTitle, draftContent]
  );

  const handleDrawerPerfectifyDraft = () => {
    const res = perfectifyNoteContent(draftTitle, draftContent);
    setDraftTitle(res.title);
    setDraftContent(res.content);
    marioAudio.playPowerUp();
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftContent.trim()) return;

    if (editingId) {
      setNotes((prev) =>
        updateStudyNote(prev, editingId, {
          title: draftTitle,
          content: draftContent,
          worldTag: draftWorldTag,
          categoryTag: draftCategoryTag,
        })
      );
      setEditingId(null);
      marioAudio.playPowerUp();
    } else {
      setNotes((prev) =>
        createStudyNote(prev, {
          title: draftTitle,
          content: draftContent,
          worldTag: draftWorldTag,
          categoryTag: draftCategoryTag,
        })
      );
      marioAudio.playCoin();
    }

    setDraftTitle('');
    setDraftContent('');
    setShowDrawerPerfectionAdvice(false);
  };

  const handleStartEdit = (note: StudyNoteItem) => {
    setEditingId(note.id);
    setDraftTitle(sanitizeMnemonicNoteTitle(note.title));
    setDraftContent(note.content);
    setDraftWorldTag(note.worldTag);
    setDraftCategoryTag(note.categoryTag || 'Quick Reference');
    marioAudio.playJump();
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDraftTitle('');
    setDraftContent('');
    marioAudio.playPipe();
  };

  const handleTogglePin = (note: StudyNoteItem) => {
    setNotes((prev) => updateStudyNote(prev, note.id, { pinned: !note.pinned }));
    marioAudio.playJump();
  };

  const handleDelete = (id: string) => {
    setNotes((prev) => deleteStudyNote(prev, id));
    if (editingId === id) {
      setEditingId(null);
      setDraftTitle('');
      setDraftContent('');
    }
    marioAudio.playStomp();
  };

  const handleQuickTemplate = (tpl: (typeof QUICK_MNEMONIC_TEMPLATES)[number]) => {
    setNotes((prev) =>
      createStudyNote(prev, {
        title: tpl.title,
        content: tpl.content,
        worldTag: tpl.worldTag,
        categoryTag: 'Quick Reference',
      })
    );
    marioAudio.playCoin();
  };

  const handleCopyNote = (note: StudyNoteItem) => {
    navigator.clipboard?.writeText(`${sanitizeMnemonicNoteTitle(note.title)}\n${note.content}`);
    setCopiedId(note.id);
    marioAudio.playCoin();
    setTimeout(() => setCopiedId(null), 1600);
  };

  const handleExportAllNotes = () => {
    if (notes.length === 0) return;
    const lines = [
      '# PHILIPPINE LABOR LAW STUDY NOTES & CODALS',
      `# Compiled by: ${typeof window !== 'undefined' ? localStorage.getItem('mario_player_name') || 'Mario Scholar' : 'Mario Scholar'}`,
      `# Date: ${new Date().toLocaleDateString()}`,
      `# Total Notes: ${notes.length}`,
      '==================================================\n',
      ...notes.map((n, i) => [
        `## [${i + 1}] ${n.title}`,
        `World: ${getWorldBadgeLabel(n.worldTag)} | Tag: ${n.categoryTag || 'General'}${
          typeof n.content === 'string' && n.content.includes('Ref: qerr_') ? ' | Type: Codal Review Doctrine' : ''
        }`,
        `Updated: ${new Date(n.updatedAt).toLocaleDateString()}`,
        '',
        n.content,
        '\n==================================================',
      ].join('\n')),
      '\nSuper Mario Labor Adventure · Philippine Labor Standards Memory Aid',
    ];
    const fullText = lines.join('\n');
    navigator.clipboard?.writeText(fullText);
    setCopiedAllNotes(true);
    marioAudio.playPowerUp();

    try {
      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mario-Labor-Law-Study-Notes-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }

    setTimeout(() => setCopiedAllNotes(false), 2200);
  };

  const handleExportAllNotesMarkdown = () => {
    if (notes.length === 0) return;
    const lines = [
      '# PHILIPPINE LABOR LAW STUDY NOTES & CODALS',
      `# Compiled by: ${typeof window !== 'undefined' ? localStorage.getItem('mario_player_name') || 'Mario Scholar' : 'Mario Scholar'}`,
      `# Date: ${new Date().toLocaleDateString()}`,
      `# Total Notes: ${notes.length}`,
      '==================================================\n',
      ...notes.map((n, i) => [
        `## [${i + 1}] ${n.title}`,
        `**World**: ${getWorldBadgeLabel(n.worldTag)} | **Tag**: ${n.categoryTag || 'General'}`,
        `*Last Updated: ${new Date(n.updatedAt).toLocaleDateString()}*`,
        '',
        n.content,
        '\n',
      ].join('\n')),
      '\nSuper Mario Labor Adventure · Philippine Labor Standards Memory Aid',
    ];
    const fullText = lines.join('\n');
    navigator.clipboard?.writeText(fullText);
    setCopiedAllNotes(true);
    marioAudio.playPowerUp();

    try {
      const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mario-Labor-Law-Study-Notes-${Date.now()}.md`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }

    setTimeout(() => setCopiedAllNotes(false), 2200);
  };

  const handleExportAllNotesPdf = () => {
    if (notes.length === 0) return;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: false,
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 16;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
      try {
        doc.addImage(MARIO_LABOR_LAW_CREST_DATA_URL, 'PNG', margin + 2.5, y + 2.5, 19.0, 19.0);
      } catch {
        // fallback
      }
      doc.setTextColor(251, 191, 36); // amber-400
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text('SUPER MARIO PHILIPPINE LABOR LAW · OFFICIAL STUDY NOTEBOOK', margin + 24, y + 7.5);

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      const studentName = typeof window !== 'undefined' ? localStorage.getItem('mario_player_name') || 'Mario Scholar' : 'Mario Scholar';
      doc.text(`${studentName} · ${notes.length} Codal Notes & Error Digests`, margin + 24, y + 14.5);

      doc.setTextColor(148, 163, 184); // slate-400
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(
        sanitizePdfText(
          `Philippine Labor Standards Review (P.D. No. 442) · Structured Doctrine & Distinction Notes · ${new Date().toLocaleDateString()}`
        ),
        margin + 24,
        y + 20
      );
      y += 30;

      notes.forEach((n, idx) => {
        const rawLines = n.content.split('\n').map((l) => l.trim()).filter(Boolean);
        const isErrorDigest = n.content.includes('Ref: qerr_') || n.content.includes('Controlling statutory doctrine:');

        if (y > pageHeight - 38) {
          doc.addPage();
          y = margin;
        }

        // Note Card Header (Clean mnemonic rule title like starter examples - never combines descriptions)
        const cleanNoteTitle = sanitizeMnemonicNoteTitle(n.title);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        const titleLines = doc.splitTextToSize(sanitizePdfText(`[${idx + 1}] ${cleanNoteTitle}`), contentWidth - 8);
        const titleBoxH = Math.max(8.5, titleLines.length * 4.4 + 4.0);

        if (y + titleBoxH > pageHeight - 30) {
          doc.addPage();
          y = margin;
        }

        doc.setFillColor(isErrorDigest ? 254 : 241, isErrorDigest ? 243 : 245, isErrorDigest ? 199 : 249);
        doc.setDrawColor(isErrorDigest ? 245 : 203, isErrorDigest ? 158 : 213, isErrorDigest ? 11 : 225);
        doc.setLineWidth(0.35);
        doc.roundedRect(margin, y, contentWidth, titleBoxH, 1.8, 1.8, 'FD');
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(titleLines, margin + 4, y + 5.2);
        y += titleBoxH + 2.5;

        // Meta Tag Bar
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7.5);
        const metaTag = `World: ${getWorldBadgeLabel(n.worldTag)} | Category: ${n.categoryTag || 'General'}${isErrorDigest ? ' | Bar Exam Codal Review Note' : ''}`;
        doc.text(sanitizePdfText(metaTag), margin + 3, y);
        y += 4.5;

        // Render note content lines with structured callouts
        for (const line of rawLines) {
          if (y > pageHeight - 20) {
            doc.addPage();
            y = margin;
          }

          if (line.startsWith('Controlling statutory doctrine:') || line.startsWith('Controlling Rule:')) {
            const doctrineBody = line.replace(/^(?:Controlling statutory doctrine|Controlling Rule):\s*/, '');
            const tokens = tokenizeLegalTextToWords(doctrineBody, 'normal', [15, 23, 42]);
            const bodyLines = wrapStyledWordTokens(doc, tokens, contentWidth - 10, 'helvetica', 7.6);
            const blockH = Math.max(14.0, (bodyLines.length + 1) * 3.8 + 4.0);

            if (y + blockH > pageHeight - 15) {
              doc.addPage();
              y = margin;
            }

            doc.setFillColor(236, 253, 245); // emerald-50
            doc.setDrawColor(16, 185, 129); // emerald-500
            doc.setLineWidth(0.35);
            doc.roundedRect(margin + 2, y, contentWidth - 4, blockH, 1.2, 1.2, 'FD');

            doc.setTextColor(6, 95, 70); // emerald-800
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.4);
            doc.text('CONTROLLING STATUTORY DOCTRINE:', margin + 4.5, y + 4.0);

            const resDoc = drawFormattedLegalParagraph(
              doc,
              doctrineBody,
              margin + 4.5,
              y + 7.8,
              contentWidth - 10,
              'helvetica',
              7.6,
              3.8,
              'normal',
              [15, 23, 42]
            );
            y = Math.max(y + blockH, resDoc.endingY + 2.0) + 2.5;
          } else if (line.startsWith('Takeaway distinction:')) {
            const takeawayBody = line.replace(/^Takeaway distinction:\s*/, '');
            const tokens = tokenizeLegalTextToWords(takeawayBody, 'normal', [15, 23, 42]);
            const bodyLines = wrapStyledWordTokens(doc, tokens, contentWidth - 10, 'helvetica', 7.6);
            const blockH = Math.max(14.0, (bodyLines.length + 1) * 3.8 + 4.0);

            if (y + blockH > pageHeight - 15) {
              doc.addPage();
              y = margin;
            }

            doc.setFillColor(254, 243, 199); // amber-100
            doc.setDrawColor(217, 119, 6); // amber-600
            doc.setLineWidth(0.35);
            doc.roundedRect(margin + 2, y, contentWidth - 4, blockH, 1.2, 1.2, 'FD');

            doc.setTextColor(146, 64, 14); // amber-800
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.4);
            doc.text('KEY DISTINCTION & BAR EXAM TAKEAWAY:', margin + 4.5, y + 4.0);

            const resTake = drawFormattedLegalParagraph(
              doc,
              takeawayBody,
              margin + 4.5,
              y + 7.8,
              contentWidth - 10,
              'helvetica',
              7.6,
              3.8,
              'normal',
              [15, 23, 42]
            );
            y = Math.max(y + blockH, resTake.endingY + 2.0) + 2.5;
          } else if (line.startsWith('Problem Scenario:')) {
            const scenarioBody = line.replace(/^Problem Scenario:\s*/, '');
            const tokens = tokenizeLegalTextToWords(scenarioBody, 'italic', [30, 41, 59]);
            const bodyLines = wrapStyledWordTokens(doc, tokens, contentWidth - 10, 'helvetica', 7.5);
            const blockH = Math.max(13.0, (bodyLines.length + 1) * 3.6 + 4.0);

            if (y + blockH > pageHeight - 15) {
              doc.addPage();
              y = margin;
            }

            doc.setFillColor(240, 249, 255); // sky-50
            doc.setDrawColor(2, 132, 199); // sky-600
            doc.setLineWidth(0.25);
            doc.roundedRect(margin + 2, y, contentWidth - 4, blockH, 1.2, 1.2, 'FD');

            doc.setTextColor(3, 105, 161); // sky-700
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.2);
            doc.text('FACTUAL BAR PROBLEM SCENARIO:', margin + 4.5, y + 4.0);

            const resScen = drawFormattedLegalParagraph(
              doc,
              scenarioBody,
              margin + 4.5,
              y + 7.6,
              contentWidth - 10,
              'helvetica',
              7.5,
              3.6,
              'italic',
              [30, 41, 59]
            );
            y = Math.max(y + blockH, resScen.endingY + 2.0) + 2.5;
          } else if (line.includes('Ref: qerr_') || line.includes('Ref: statute_') || line.includes('· Ref:')) {
            doc.setFont('courier', 'normal');
            doc.setFontSize(6.8);
            doc.setTextColor(100, 116, 139);
            doc.text(sanitizePdfText(line), margin + 3, y + 3.0);
            y += 4.5;
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(30, 41, 59);
            const plainLines = doc.splitTextToSize(sanitizePdfText(line), contentWidth - 6);
            for (let i = 0; i < plainLines.length; i++) {
              if (y > pageHeight - 15) {
                doc.addPage();
                y = margin;
              }
              doc.text(plainLines[i], margin + 3, y);
              y += 3.8;
            }
            y += 1.5;
          }
        }
        y += 5.0;
      });

      // Concluding Official Notebook Verification & Seal
      if (y > pageHeight - 32) {
        doc.addPage();
        y = margin;
      }
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.35);
      doc.roundedRect(margin, y, contentWidth, 22, 2.0, 2.0, 'FD');
      try {
        doc.addImage(MARIO_OFFICIAL_SEAL_DATA_URL, 'PNG', pageWidth - margin - 20, y + 2.0, 18.0, 18.0);
      } catch {
        // fallback
      }
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.0);
      doc.text('OFFICIAL PHILIPPINE LABOR CODE STUDY NOTEBOOK VERIFICATION', margin + 4, y + 6.0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Certified 300+ DPI Uncompressed Vector Study Aid · Matthew Cesar Corpuz', margin + 4, y + 11.0);
      doc.text('Preserving pristine mnemonic titles and verbatim statutory doctrines.', margin + 4, y + 15.5);
      y += 26;

      const filename = `Mario-Labor-Law-Notes-${Date.now()}.pdf`;
      const rawBytes = new Uint8Array(doc.output('arraybuffer'));
      const finalBytes = ensureHighFidelityPdfFileSize(rawBytes, MIN_REVIEWER_PDF_BYTES, filename);
      triggerPdfDownloadFromBytes(finalBytes, filename, MIN_REVIEWER_PDF_BYTES);
      marioAudio.playPowerUp();
    } catch {
      // ignore
    }
  };

  const handleToggleHighlightLine = (
    noteId: string,
    lineIndex: number,
    overrideColor?: HighlightColorKey
  ) => {
    const targetNote = notes.find((n) => n.id === noteId);
    if (targetNote) {
      const lines = targetNote.content.split('\n');
      if (!lines[lineIndex] || !lines[lineIndex].trim()) return;
    }
    const colorToApply = overrideColor || activeHighlightColor;
    setLineAnnotations((prev) =>
      toggleNoteLineHighlight(prev, noteId, lineIndex, colorToApply)
    );
    marioAudio.playCoin();
  };

  const handleToggleStarLine = (noteId: string, lineIndex: number) => {
    const targetNote = notes.find((n) => n.id === noteId);
    if (targetNote) {
      const lines = targetNote.content.split('\n');
      if (!lines[lineIndex] || !lines[lineIndex].trim()) return;
    }
    setLineAnnotations((prev) => toggleNoteLineStar(prev, noteId, lineIndex));
    marioAudio.playPowerUp();
  };

  const filteredPlannerModules = useMemo(() => {
    if (plannerWorldFilter === 'all') return ALL_LAW_TOPICS;
    return ALL_LAW_TOPICS.filter((t) => t.worldId === plannerWorldFilter);
  }, [plannerWorldFilter]);

  const handleAssignModuleToDay = (
    day: PlannerDayKey,
    topicId: string,
    fromDay?: PlannerDayKey
  ) => {
    const mod = ALL_LAW_TOPICS.find((t) => t.id === topicId);
    if (!mod) return;
    setWeeklySchedule((prev) =>
      assignModuleToPlannerDay(
        prev,
        day,
        {
          topicId: mod.id,
          title: mod.title,
          worldId: mod.worldId,
          badge: mod.badge,
        },
        fromDay
      )
    );
    marioAudio.playPowerUp();
  };

  const handleRemoveModuleFromDay = (day: PlannerDayKey, topicId: string) => {
    setWeeklySchedule((prev) => removeModuleFromPlannerDay(prev, day, topicId));
    marioAudio.playClick();
  };

  return (
    <>
      {/* Docked Right-Edge Study Notes Tab — Anchored Upper-Middle on Mobile to Clear Timer & Scroller */}
      {/* Floating Trigger Tab: Centered on the right edge across all viewports (original ergonomic position) */}
      {activeTab !== 'arcade' && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            marioAudio.playPipe();
          }}
          data-testid="study-notes-trigger"
          aria-label={`Open Study Notes Drawer (${notes.length} saved notes)`}
          title="Open Study Notes Drawer — Jot down labor law notes"
          className="flex fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-amber-400 hover:bg-amber-300 text-slate-950 border-2 border-r-0 border-black rounded-l-2xl rounded-r-none px-1.5 py-2.5 sm:px-2 sm:py-3 shadow-[-3px_3px_0_#000] flex-col items-center gap-1 sm:gap-1.5 cursor-pointer transition-all hover:translate-x-[-2px] active:translate-x-0 select-none print:hidden"
        >
          <NotebookPen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 shrink-0" />
          <span className="text-[8.5px] sm:text-[9px] font-black font-mario uppercase tracking-tighter leading-none [writing-mode:vertical-rl] rotate-180">
            NOTES
          </span>
          <span className="min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 rounded-full bg-red-600 text-white text-[9.5px] sm:text-[10px] font-black inline-flex items-center justify-center border border-black leading-none tabular-nums">
            {notes.length}
          </span>
        </button>
      )}

      {/* Slide-Over Right Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/65 print:hidden">
          <div
            className="flex-1 cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-label="Study Notes Drawer"
            data-testid="study-notes-drawer"
            className="relative w-full max-w-md bg-[#1e293b] text-white border-l-2 border-slate-950 shadow-[-8px_0_30px_rgba(0,0,0,0.85)] h-[100dvh] flex flex-col overflow-hidden safe-top-nav safe-bottom-dock"
          >
            {/* Drawer Header */}
            <div className="bg-[#0f172a] p-4 border-b-2 border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center text-slate-950 shrink-0 shadow-[0_2px_0_#000]">
                  <NotebookPen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                    PERSISTENT MNEMONIC PAD
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-white font-display break-words">
                    STUDY NOTES ({notes.length})
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  data-testid="study-notes-coin-badge"
                  title={`Session Rewards: ${coins} Coins Collected`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs border border-black shadow-[0_1px_0_#000]"
                >
                  <MarioCoinIcon className="w-4 h-4" />
                  <span className="font-mono font-black">{coins}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Study Notes Drawer"
                  className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mode Tabs: Saved Notes vs. Weekly Study Planner */}
            <div className="bg-[#0b1220] px-4 py-2 border-b border-slate-700 grid grid-cols-2 gap-2 shrink-0">
              <button
                type="button"
                data-testid="drawer-tab-notes"
                onClick={() => {
                  setDrawerTab('notes');
                  marioAudio.playClick();
                }}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl font-black text-xs border-2 cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors ${
                  drawerTab === 'notes'
                    ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <NotebookPen className="w-3.5 h-3.5 shrink-0" />
                <span>Saved Notes ({notes.length})</span>
              </button>
              <button
                type="button"
                data-testid="drawer-tab-planner"
                onClick={() => {
                  setDrawerTab('planner');
                  marioAudio.playClick();
                }}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl font-black text-xs border-2 cursor-pointer inline-flex items-center justify-center gap-1.5 transition-colors ${
                  drawerTab === 'planner'
                    ? 'bg-emerald-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>Study Planner (Mon-Sun)</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-4">
              {drawerTab === 'planner' ? (
                <section data-testid="weekly-study-planner" className="space-y-4">
                  <div className="bg-slate-900 border-2 border-emerald-400/50 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-400 font-mario block">
                          DRAG &amp; DROP WEEKLY STUDY PLANNER
                        </span>
                        <p className="text-xs text-slate-300 font-semibold">
                          Drag any Labor Law module below onto Mon–Sun or use quick day assign.
                        </p>
                      </div>
                    </div>

                    <select
                      aria-label="Filter Planner Modules by World"
                      value={plannerWorldFilter}
                      onChange={(e) => setPlannerWorldFilter(e.target.value)}
                      className="w-full bg-slate-950 [color-scheme:dark] text-amber-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700"
                    >
                      <option value="all" className="bg-slate-950 text-white">
                        All Worlds ({ALL_LAW_TOPICS.length} Modules)
                      </option>
                      {WORLDS_METADATA.map((w) => (
                        <option key={w.id} value={w.id} className="bg-slate-950 text-white">
                          World {w.worldNumber}: {w.shortTitle}
                        </option>
                      ))}
                    </select>

                    {/* Draggable Module Palette */}
                    <div className="max-h-52 overflow-y-auto overscroll-contain space-y-1.5 pr-1">
                      {filteredPlannerModules.map((mod) => {
                        const chosenDay = selectedDayByTopic[mod.id] || 'Mon';
                        return (
                          <div
                            key={mod.id}
                            draggable
                            data-testid={`planner-draggable-module-${mod.id}`}
                            onDragStart={(e) => {
                              e.dataTransfer.setData(
                                'application/json',
                                JSON.stringify({ topicId: mod.id })
                              );
                            }}
                            className="bg-slate-950 hover:bg-slate-800/90 border border-slate-700 rounded-xl p-2 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <GripVertical className="w-4 h-4 text-amber-400 shrink-0" />
                              <div className="min-w-0">
                                <span className="text-[10px] font-mono font-bold text-emerald-300 block">
                                  {mod.worldId.toUpperCase()} · {mod.badge}
                                </span>
                                <span className="text-xs font-black text-white block break-words leading-snug">
                                  {mod.title}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <select
                                aria-label={`Select day for ${mod.title}`}
                                value={chosenDay}
                                onChange={(e) =>
                                  setSelectedDayByTopic((prev) => ({
                                    ...prev,
                                    [mod.id]: e.target.value as PlannerDayKey,
                                  }))
                                }
                                className="bg-slate-900 [color-scheme:dark] text-amber-200 text-[11px] font-bold px-1.5 py-1 rounded-lg border border-slate-700"
                              >
                                {PLANNER_DAYS.map((d) => (
                                  <option key={d} value={d} className="bg-slate-900 text-white">
                                    {d}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                data-testid={`planner-quick-add-${mod.id}`}
                                onClick={() => handleAssignModuleToDay(chosenDay, mod.id)}
                                className="px-2 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] border border-black cursor-pointer"
                              >
                                + Add
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mon - Sun Calendar Drop Targets */}
                  <div className="space-y-2.5">
                    {PLANNER_DAYS.map((day) => {
                      const items = weeklySchedule[day] || [];
                      const isOver = dragHoverDay === day;
                      return (
                        <div
                          key={day}
                          data-testid={`planner-day-${day}`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragHoverDay !== day) setDragHoverDay(day);
                          }}
                          onDragLeave={() => {
                            if (dragHoverDay === day) setDragHoverDay(null);
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragHoverDay(null);
                            try {
                              const raw = e.dataTransfer.getData('application/json');
                              if (!raw) return;
                              const parsed = JSON.parse(raw) as {
                                topicId?: string;
                                fromDay?: PlannerDayKey;
                              };
                              if (parsed.topicId) {
                                handleAssignModuleToDay(day, parsed.topicId, parsed.fromDay);
                              }
                            } catch {
                              // ignore invalid drop payload
                            }
                          }}
                          className={`rounded-2xl p-3 border-2 transition-colors space-y-2 ${
                            isOver
                              ? 'bg-emerald-950/70 border-emerald-400'
                              : 'bg-slate-900 border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-xs uppercase font-mario text-amber-300">
                              {day}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400 font-bold tabular-nums">
                              {items.length} {items.length === 1 ? 'module' : 'modules'}
                            </span>
                          </div>

                          {items.length === 0 ? (
                            <p className="text-[11px] text-slate-500 font-semibold italic">
                              Drop a Labor Law module here for {day}
                            </p>
                          ) : (
                            <div className="space-y-1.5">
                              {items.map((sched) => (
                                <div
                                  key={`${day}-${sched.topicId}`}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData(
                                      'application/json',
                                      JSON.stringify({
                                        topicId: sched.topicId,
                                        fromDay: day,
                                      })
                                    );
                                  }}
                                  className="bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-2 flex items-center justify-between gap-2 cursor-grab"
                                >
                                  <div className="min-w-0">
                                    <span className="text-[9px] font-mono text-amber-300 font-bold block">
                                      {sched.worldId.toUpperCase()} · {sched.badge}
                                    </span>
                                    <span className="text-xs font-extrabold text-white block break-words leading-snug">
                                      {sched.title}
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveModuleFromDay(day, sched.topicId)}
                                    aria-label={`Remove ${sched.title} from ${day}`}
                                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white text-[10px] font-black border border-slate-600 cursor-pointer shrink-0"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <>
              {/* Compose / Edit Form */}
              <form
                onSubmit={handleSaveNote}
                className="bg-slate-900 rounded-2xl p-3.5 border-2 border-slate-700 space-y-2.5"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 min-w-0">
                    <span className="text-[10px] font-black uppercase text-amber-400 font-mario">
                      {editingId ? 'EDIT STUDY NOTE' : 'NEW STUDY NOTE'}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <select
                        aria-label="Voice Note Dictation Language"
                        data-testid="voice-memo-lang-select"
                        value={voiceLang}
                        onChange={(e) => setVoiceLang(e.target.value)}
                        className="bg-slate-800 text-slate-200 text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-600 focus:outline-none focus:border-amber-400 cursor-pointer max-w-[150px] truncate"
                      >
                        {voiceLanguageOptions.map((opt) => (
                          <option key={opt.code || 'auto'} value={opt.code}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        data-testid="voice-memo-btn"
                        onClick={handleToggleVoiceMemo}
                        title={isListening ? 'Stop voice recording' : 'Dictate note using Voice Memo (All Languages)'}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                          isListening
                            ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-300'
                        }`}
                      >
                        {isListening ? (
                          <>
                            <MicOff className="w-3.5 h-3.5 text-red-400 animate-bounce shrink-0" />
                            <span className="text-[10px] uppercase font-mono font-bold">Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[10px] uppercase font-mono font-bold">Voice Memo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full min-w-0">
                    <select
                      aria-label="Note World Category"
                      data-testid="study-notes-world-select"
                      value={draftWorldTag}
                      onChange={(e) => setDraftWorldTag(e.target.value)}
                      className="w-full min-w-0 max-w-full truncate bg-slate-800 text-amber-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-600 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {worldTagOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Note Study Tag"
                      data-testid="study-notes-category-tag-select"
                      value={draftCategoryTag}
                      onChange={(e) =>
                        setDraftCategoryTag(e.target.value as StudyNoteCategoryTag)
                      }
                      className="w-full min-w-0 max-w-full truncate bg-slate-800 text-emerald-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-600 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      {STUDY_NOTE_CATEGORY_TAGS.map((tag) => (
                        <option key={tag} value={tag}>
                          Tag: {tag === 'Bar Exam Review' ? 'Statutory Standards Review' : tag}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {speechNotice && (
                  <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] truncate">{speechNotice}</span>
                    <button
                      type="button"
                      onClick={() => setSpeechNotice(null)}
                      className="text-amber-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Optional title (e.g., Art. 94 Successive Holidays)"
                  aria-label="Study Note Title"
                  className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                />

                <textarea
                  rows={3}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Jot down a quick mnemonic, statutory exception, or multiplier rule..."
                  aria-label="Study Note Content"
                  required
                  className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs sm:text-sm font-medium px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 resize-y"
                />

                {/* Live Bar Note Perfection Detector & Auto-Perfectify */}
                {draftContent.trim() && (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-400/50 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mario text-[10px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black">
                          {drawerPerfectionReport.score}%
                        </span>
                        <span className="font-bold text-amber-300 text-[11px]">
                          {drawerPerfectionReport.grade}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                          • {drawerPerfectionReport.categoryLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setShowDrawerPerfectionAdvice((prev) => !prev)}
                          className="text-[10.5px] font-bold text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
                        >
                          {showDrawerPerfectionAdvice ? 'Hide Guide' : 'Is "Yes/No" necessary?'}
                        </button>

                        <button
                          type="button"
                          onClick={handleDrawerPerfectifyDraft}
                          title="Auto-format note to 100% Supreme Court Bar Perfection"
                          className="text-[10.5px] font-black px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-black shadow-[0_1px_0_#000] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-slate-950" />
                          <span>Perfectify</span>
                        </button>
                      </div>
                    </div>

                    {/* Expandable Yes/No & Perfection Advice */}
                    {showDrawerPerfectionAdvice && (
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-[11px] space-y-1.5">
                        <div className="flex items-start gap-1.5 text-amber-200">
                          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <p className="leading-snug">{drawerPerfectionReport.categoricalAdvice}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 border-t border-slate-800 text-[10px] font-mono">
                          {drawerPerfectionReport.checklist.map((item) => (
                            <div key={item.id} className="flex items-center gap-1">
                              <span className={item.passed ? 'text-emerald-400' : 'text-rose-400'}>
                                {item.passed ? '✓' : '✗'}
                              </span>
                              <span className={item.passed ? 'text-slate-300' : 'text-rose-300'}>
                                {item.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  {editingId ? (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-semibold">
                      Auto-saved to browser storage
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={!draftContent.trim()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-xs font-mario border-2 border-black shadow-[0_2px_0_#000] active:translate-y-0.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>{editingId ? 'UPDATE' : 'SAVE NOTE'}</span>
                  </button>
                </div>
              </form>

              {/* Quick 1-Tap High-Yield Starters */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 font-mario">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>1-TAP HIGH-YIELD STUDY STARTERS</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_MNEMONIC_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => handleQuickTemplate(tpl)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-600 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      + {tpl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="space-y-2 pt-2 border-t border-slate-700 min-w-0">
                <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-3.5 h-3.5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter saved notes..."
                      aria-label="Search Study Notes"
                      className="w-full min-w-0 bg-slate-900 text-white placeholder-slate-500 text-xs font-semibold pl-8 pr-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <select
                    aria-label="Filter Notes by World"
                    value={worldFilter}
                    onChange={(e) => setWorldFilter(e.target.value)}
                    className="w-full sm:w-44 min-w-0 max-w-full truncate bg-slate-900 text-slate-200 text-xs font-bold px-2.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 cursor-pointer"
                  >
                    <option value="all">All Worlds</option>
                    {worldTagOptions
                      .filter((o) => o.id !== 'all')
                      .map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Category Tag Filter Buttons */}
                <div
                  role="group"
                  aria-label="Filter Notes by Study Tag"
                  className="flex flex-wrap items-center gap-1.5"
                >
                  {(['all', ...STUDY_NOTE_CATEGORY_TAGS] as const).map((cat) => {
                    const active = categoryFilter === cat;
                    const displayLabel =
                      cat === 'all'
                        ? 'All Notes'
                        : cat === 'Bar Exam Review'
                        ? 'Statutory Review'
                        : cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        data-testid={`notes-filter-tag-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                        onClick={() => {
                          setCategoryFilter(cat);
                          marioAudio.playClick();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                          active
                            ? 'bg-amber-400 text-slate-950 border-black font-black'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {displayLabel}
                      </button>
                    );
                  })}

                  {quizErrorNotesCount > 0 && (
                    <button
                      type="button"
                      data-testid="notes-filter-tag-quiz-errors"
                      onClick={() => {
                        setCategoryFilter(categoryFilter === 'quiz_errors' ? 'all' : 'quiz_errors');
                        marioAudio.playClick();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors inline-flex items-center gap-1 ${
                        categoryFilter === 'quiz_errors'
                          ? 'bg-amber-400 text-slate-950 border-black font-black shadow-[0_1px_0_#000]'
                          : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/50'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Quiz Errors ({quizErrorNotesCount})</span>
                    </button>
                  )}

                  {notes.length > 0 && (
                    <div className="ml-auto flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={handleExportAllNotesPdf}
                        title="Download notes notebook as formatted PDF"
                        className="px-2 py-1 rounded-lg text-[10px] font-black bg-red-600 hover:bg-red-500 text-white border border-black cursor-pointer inline-flex items-center gap-1 shadow-xs"
                      >
                        <FileDown className="w-3 h-3 shrink-0" />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportAllNotesMarkdown}
                        title="Export notes as Markdown (.md)"
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 cursor-pointer inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 text-amber-400 shrink-0" />
                        <span>.MD</span>
                      </button>
                      <button
                        type="button"
                        data-testid="export-all-notes-btn"
                        onClick={handleExportAllNotes}
                        title="Export all saved study notes as text and copy to clipboard"
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 cursor-pointer inline-flex items-center gap-1"
                      >
                        {copiedAllNotes ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="text-emerald-300">Copied!</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>.TXT</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 12-Color Studio Highlighter Palette Grid (Zero-Scroll UI/UX Friendly) */}
              <div className="bg-slate-900/95 border-2 border-slate-700 rounded-2xl p-3 space-y-2 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-black shrink-0 shadow-xs"
                      style={{ backgroundColor: getHighlightColorSpec(activeHighlightColor).swatchBg }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mario text-[9px] uppercase text-amber-300">
                          HIGHLIGHTER:
                        </span>
                        <span className="text-xs font-black text-white">
                          {getHighlightColorSpec(activeHighlightColor).label}
                        </span>
                      </div>
                      <span className="text-[10.5px] text-slate-400 block truncate font-medium">
                        {getHighlightColorSpec(activeHighlightColor).categoryHint}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9.5px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-lg shrink-0">
                    12 Colors · 1-Tap Select
                  </span>
                </div>

                {/* All 12 Colors in a clean responsive grid — Zero Horizontal Scrolling */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1.5">
                  {HIGHLIGHT_COLORS.map((c) => {
                    const isSelected = activeHighlightColor === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setActiveHighlightColor(c.id);
                          marioAudio.playClick();
                        }}
                        title={`${c.label}: ${c.categoryHint}`}
                        className={`min-h-[36px] px-2 py-1.5 rounded-xl border flex items-center justify-center sm:justify-start gap-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? `${c.bgClass} ${c.textClass} border-black shadow-[0_2px_0_#000] scale-[1.03] ring-2 ring-white/80 font-black`
                            : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white font-bold'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full border border-black/40 shrink-0 shadow-xs flex items-center justify-center ${
                            isSelected ? 'ring-1 ring-black' : ''
                          }`}
                          style={{ backgroundColor: c.swatchBg }}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3] text-slate-950" />}
                        </span>
                        <span className="text-[10px] truncate leading-tight">
                          {c.label.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quiz Errors Callout Banner when available */}
              {quizErrorNotesCount > 0 && categoryFilter === 'quiz_errors' && (
                <div className="bg-amber-950/40 border-2 border-amber-400/80 rounded-2xl p-3 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] font-mario border border-black">
                      SAVED CODAL DOCTRINES
                    </span>
                    <span className="text-xs font-bold text-amber-200">
                      {quizErrorNotesCount} Missed Questions Converted to Notes
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                    These notes represent rules you previously missed in quizzes. Each note is saved as a complete, self-contained codal doctrine note for targeted retention.
                  </p>
                </div>
              )}

              {/* Notes List */}
              {visibleNotes.length === 0 ? (
                <div className="bg-slate-900/70 border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center space-y-2">
                  <NotebookPen className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-sm font-black text-white font-display">
                    {notes.length === 0 ? 'No study notes yet!' : 'No notes match your filter.'}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold">
                    Write your own Labor Standards mnemonics above or tap a quick starter chip. Your notes stay available as you switch across all tabs!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {visibleNotes.map((note) => (
                    <article
                      key={note.id}
                      className={`rounded-2xl p-3.5 border-2 transition-all space-y-2 ${
                        note.pinned
                          ? 'bg-amber-950/35 border-amber-400'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1 text-[11px] text-slate-300 font-bold">
                            <span className="text-amber-300">
                              {getWorldBadgeLabel(note.worldTag)}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="text-emerald-300">
                              {note.categoryTag === 'Bar Exam Review'
                                ? 'Statutory Standards Review'
                                : note.categoryTag || 'Quick Reference'}
                            </span>
                            {typeof note.content === 'string' && note.content.includes('Ref: qerr_') && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] font-mario border border-black shadow-[0_1px_0_#000]">
                                  CODAL REVIEW DOCTRINE
                                </span>
                              </>
                            )}
                            {note.pinned && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-amber-200 font-black">Pinned</span>
                              </>
                            )}
                          </div>
                          <h3 className="font-black text-sm text-white font-display break-words leading-snug">
                            {sanitizeMnemonicNoteTitle(note.title)}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTogglePin(note)}
                            aria-label={note.pinned ? `Unpin ${note.title}` : `Pin ${note.title}`}
                            title={note.pinned ? 'Unpin note' : 'Pin to top'}
                            className={`p-1.5 rounded-lg border cursor-pointer ${
                              note.pinned
                                ? 'bg-amber-400 text-slate-950 border-black'
                                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-600'
                            }`}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyNote(note)}
                            aria-label={`Copy ${note.title}`}
                            title="Copy note"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 cursor-pointer"
                          >
                            {copiedId === note.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(note)}
                            aria-label={`Edit ${note.title}`}
                            title="Edit note"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(note.id)}
                            aria-label={`Delete ${note.title}`}
                            title="Delete note"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {parseStructuredNoteLines(note.content).map((block, blockIdx) => {
                          const ann = lineAnnotations[note.id];
                          const isHighlighted = ann?.highlightedLines?.includes(blockIdx) ?? false;
                          const isStarred = ann?.starredLines?.includes(blockIdx) ?? false;
                          const lineHighlightColor = ann?.lineColors?.[blockIdx] || 'yellow';
                          const colorSpec = getHighlightColorSpec(lineHighlightColor);

                          let badgeIcon = (
                            <ShieldCheck
                              className={`w-3.5 h-3.5 inline shrink-0 ${
                                isHighlighted ? 'text-emerald-900' : 'text-emerald-400'
                              }`}
                            />
                          );
                          let containerClass =
                            'bg-emerald-950/30 border border-emerald-500/35';
                          let badgeClass = isHighlighted
                            ? 'text-emerald-950 bg-emerald-200/90 border border-emerald-700'
                            : 'text-emerald-400 bg-emerald-950/80 border border-emerald-500/50';

                          if (block.kind === 'takeaway') {
                            badgeIcon = (
                              <Lightbulb
                                className={`w-3.5 h-3.5 inline shrink-0 ${
                                  isHighlighted ? 'text-amber-900' : 'text-amber-300'
                                }`}
                              />
                            );
                            containerClass = 'bg-amber-950/30 border border-amber-500/35';
                            badgeClass = isHighlighted
                              ? 'text-amber-950 bg-amber-200/90 border border-amber-700'
                              : 'text-amber-300 bg-amber-950/80 border border-amber-500/50';
                          } else if (block.kind === 'scenario') {
                            badgeIcon = (
                              <BookOpen
                                className={`w-3.5 h-3.5 inline shrink-0 ${
                                  isHighlighted ? 'text-sky-900' : 'text-sky-400'
                                }`}
                              />
                            );
                            containerClass = 'bg-sky-950/25 border border-sky-500/35';
                            badgeClass = isHighlighted
                              ? 'text-sky-950 bg-sky-200/90 border border-sky-700'
                              : 'text-sky-400 bg-sky-950/80 border border-sky-500/50';
                          } else if (block.kind === 'statutory') {
                            badgeIcon = (
                              <Scale
                                className={`w-3.5 h-3.5 inline shrink-0 ${
                                  isHighlighted ? 'text-purple-900' : 'text-purple-300'
                                }`}
                              />
                            );
                            containerClass = 'bg-purple-950/25 border border-purple-500/35';
                            badgeClass = isHighlighted
                              ? 'text-purple-950 bg-purple-200/90 border border-purple-700'
                              : 'text-purple-300 bg-purple-950/80 border border-purple-500/50';
                          } else if (block.kind === 'case-law') {
                            badgeIcon = (
                              <Gavel
                                className={`w-3.5 h-3.5 inline shrink-0 ${
                                  isHighlighted ? 'text-teal-900' : 'text-teal-300'
                                }`}
                              />
                            );
                            containerClass = 'bg-teal-950/25 border border-teal-500/35';
                            badgeClass = isHighlighted
                              ? 'text-teal-950 bg-teal-200/90 border border-teal-700'
                              : 'text-teal-300 bg-teal-950/80 border border-teal-500/50';
                          } else if (block.kind === 'battle') {
                            badgeIcon = (
                              <Swords
                                className={`w-3.5 h-3.5 inline shrink-0 ${
                                  isHighlighted ? 'text-rose-900' : 'text-rose-400'
                                }`}
                              />
                            );
                            containerClass = 'bg-rose-950/30 border border-rose-500/35';
                            badgeClass = isHighlighted
                              ? 'text-rose-950 bg-rose-200/90 border border-rose-700'
                              : 'text-rose-300 bg-rose-950/80 border border-rose-500/50';
                          } else if (block.kind === 'ref') {
                            badgeIcon = (
                              <Scale
                                className={`w-3 h-3 shrink-0 ${
                                  isHighlighted ? 'text-slate-900' : 'text-slate-400'
                                }`}
                              />
                            );
                            containerClass = 'bg-slate-900/60 border border-slate-700/60';
                            badgeClass = isHighlighted
                              ? 'text-slate-950 bg-amber-200 border border-slate-700 font-bold'
                              : 'text-slate-400 bg-slate-900/90 border border-slate-700/70';
                          } else if (block.kind === 'labeled') {
                            badgeIcon = (
                              <Sparkles
                                className={`w-3.5 h-3.5 inline shrink-0 ${
                                  isHighlighted ? 'text-indigo-900' : 'text-indigo-400'
                                }`}
                              />
                            );
                            containerClass = 'bg-indigo-950/25 border border-indigo-500/35';
                            badgeClass = isHighlighted
                              ? 'text-indigo-950 bg-indigo-200/90 border border-indigo-700'
                              : 'text-indigo-300 bg-indigo-950/80 border border-indigo-500/50';
                          } else {
                            badgeIcon = (
                              <FileText
                                className={`w-3.5 h-3.5 inline shrink-0 ${
                                  isHighlighted ? 'text-slate-900' : 'text-amber-400'
                                }`}
                              />
                            );
                            containerClass = 'bg-slate-900/80 border border-slate-700/80';
                            badgeClass = isHighlighted
                              ? 'text-slate-950 bg-slate-200 border border-slate-700'
                              : 'text-amber-300 bg-slate-950/80 border border-amber-500/40';
                          }

                          return (
                            <div
                              key={`${note.id}-block-${block.id}-${blockIdx}`}
                              data-testid={`note-line-${note.id}-${blockIdx}`}
                              className={`flex items-start justify-between gap-2.5 rounded-xl px-2.5 py-2 transition-colors ${
                                isHighlighted
                                  ? `${colorSpec.bgClass} ${colorSpec.textClass} ${colorSpec.ringClass}`
                                  : isStarred
                                  ? 'bg-amber-950/60 border-l-4 border-amber-400 pl-2.5'
                                  : containerClass
                              }`}
                            >
                              <div className="text-xs sm:text-sm font-medium leading-relaxed break-words flex-1 min-w-0 space-y-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {isStarred && (
                                    <Star
                                      aria-label="Starred line"
                                      className={`w-3.5 h-3.5 inline-block shrink-0 ${
                                        isHighlighted
                                          ? 'text-amber-800 fill-amber-700'
                                          : 'text-amber-400 fill-amber-400'
                                      }`}
                                    />
                                  )}
                                  <span
                                    className={`inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded ${badgeClass}`}
                                  >
                                    {badgeIcon}
                                    <span>{block.label}</span>
                                  </span>

                                  {/* Yes / No Categorical Stance Badge */}
                                  {block.categoricalStance && (
                                    <span
                                      className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider font-black px-2 py-0.5 rounded shadow-xs ${
                                        block.categoricalStance === 'YES' ||
                                        block.categoricalStance === 'VALID' ||
                                        block.categoricalStance === 'LAWFUL'
                                          ? 'bg-emerald-400 text-emerald-950 border border-emerald-900'
                                          : block.categoricalStance === 'GENERAL_RULE'
                                          ? 'bg-amber-400 text-amber-950 border border-amber-900'
                                          : 'bg-rose-500 text-white border border-rose-900'
                                      }`}
                                    >
                                      {block.categoricalStance === 'YES' ||
                                      block.categoricalStance === 'VALID' ||
                                      block.categoricalStance === 'LAWFUL' ? (
                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                      ) : block.categoricalStance === 'GENERAL_RULE' ? (
                                        <Scale className="w-2.5 h-2.5" />
                                      ) : (
                                        <X className="w-2.5 h-2.5 stroke-[3]" />
                                      )}
                                      <span>STANCE: {block.categoricalStance}</span>
                                    </span>
                                  )}
                                </div>

                                <p
                                  className={`text-xs sm:text-sm leading-relaxed ${
                                    isHighlighted
                                      ? 'font-bold text-slate-950'
                                      : block.kind === 'controlling'
                                      ? 'font-semibold text-slate-100'
                                      : block.kind === 'scenario'
                                      ? 'italic text-slate-300'
                                      : block.kind === 'statutory'
                                      ? 'font-mono text-purple-100 bg-purple-950/40 p-2 rounded border border-purple-800/40'
                                      : block.kind === 'ref'
                                      ? 'font-mono text-xs text-slate-400'
                                      : 'text-slate-200'
                                  }`}
                                >
                                  {block.value}
                                </p>

                                {/* Arranged Clean Doctrinal Contrast Box */}
                                {block.examinedDistinction && (
                                  <div className="mt-1 p-2 rounded-xl bg-slate-950/75 border border-slate-700/80 space-y-1">
                                    <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block tracking-wider">
                                      STATUTORY ANALYSIS &amp; CONTRAST:
                                    </span>
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-600 font-semibold">
                                        Tested Choice:{' '}
                                        <strong className="text-amber-300 font-black">
                                          {block.examinedDistinction.priorChoice}
                                        </strong>
                                      </span>
                                      <span className="text-slate-500 font-bold">&rarr;</span>
                                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/70 font-bold">
                                        Controlling Codal Mandate Governs
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="inline-flex items-center gap-1 shrink-0 pt-0.5">
                                <button
                                  type="button"
                                  data-testid={`highlight-line-${note.id}-${blockIdx}`}
                                  aria-label={`Highlight block ${blockIdx + 1}`}
                                  aria-pressed={isHighlighted}
                                  title={
                                    isHighlighted
                                      ? `Remove ${colorSpec.label} highlight`
                                      : `Highlight in ${getHighlightColorSpec(activeHighlightColor).label}`
                                  }
                                  onClick={() =>
                                    handleToggleHighlightLine(note.id, blockIdx, activeHighlightColor)
                                  }
                                  className={`p-1 rounded border text-[10px] cursor-pointer transition-colors inline-flex items-center gap-1 ${
                                    isHighlighted
                                      ? `${colorSpec.bgClass} ${colorSpec.textClass} border-black shadow-xs`
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                                  }`}
                                >
                                  <Highlighter className="w-3 h-3" />
                                  <span
                                    className="w-1.5 h-1.5 rounded-full inline-block shrink-0"
                                    style={{
                                      backgroundColor: isHighlighted
                                        ? colorSpec.hex
                                        : getHighlightColorSpec(activeHighlightColor).hex,
                                    }}
                                  />
                                </button>
                                <button
                                  type="button"
                                  data-testid={`star-line-${note.id}-${blockIdx}`}
                                  aria-label={`Star block ${blockIdx + 1}`}
                                  aria-pressed={isStarred}
                                  title={isStarred ? 'Unstar block' : 'Star block'}
                                  onClick={() => handleToggleStarLine(note.id, blockIdx)}
                                  className={`p-1 rounded border text-[10px] cursor-pointer transition-colors ${
                                    isStarred
                                      ? 'bg-amber-400 text-slate-950 border-black'
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-600'
                                  }`}
                                >
                                  <Star
                                    className={`w-3 h-3 ${isStarred ? 'fill-current' : ''}`}
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              )}
                </>
              )}
            </div>

            {/* Footer Tip */}
            <div className="bg-[#0f172a] px-4 py-2.5 border-t border-slate-700 text-[11px] text-slate-400 font-semibold flex items-center justify-between shrink-0">
              <span>Included optionally in Print Study Guide</span>
              <span className="text-amber-300 font-bold">localStorage Synced</span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
