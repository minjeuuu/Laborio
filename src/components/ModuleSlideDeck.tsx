import React, { useState, useMemo, useEffect } from 'react';
import { LawTopic } from '../types/laborLaw';
import { TOPIC_DIFFICULTY_MAP } from '../data/laborLawData';
import { getTopicQuickCheck, getFriendlyDifficultyLabel } from '../utils/moduleSorting';
import {
  Presentation,
  Sparkles,
  BookOpen,
  Scale,
  Gavel,
  Award,
  Lightbulb,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Star,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  FileText,
  AlertCircle,
} from 'lucide-react';
import {
  MarioQuestionBlockIcon,
  MarioCoinIcon,
  MarioStarIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';

export interface ModuleSlideDeckProps {
  displayedTopics: LawTopic[];
  focusTopicIdx: number;
  setFocusTopicIdx: (idx: number) => void;
  slideStepIdx: number;
  setSlideStepIdx: React.Dispatch<React.SetStateAction<number>>;
  slideQuizChoice: number | null;
  setSlideQuizChoice: (choice: number | null) => void;
  slideDeckFullscreen: boolean;
  setSlideDeckFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  complexityMode: 'beginner' | 'standard' | 'advanced' | string;
  handleEarnCoins: (coins: number) => void;
  handleToggleTopicComplete: (topicId: string) => void;
  completedTopicIds: string[];
  onResetFilters?: () => void;
}

export const ModuleSlideDeck: React.FC<ModuleSlideDeckProps> = ({
  displayedTopics,
  focusTopicIdx,
  setFocusTopicIdx,
  slideStepIdx,
  setSlideStepIdx,
  slideQuizChoice,
  setSlideQuizChoice,
  slideDeckFullscreen,
  setSlideDeckFullscreen,
  complexityMode,
  handleEarnCoins,
  handleToggleTopicComplete,
  completedTopicIds,
  onResetFilters,
}) => {
  const [copiedDoctrineIdx, setCopiedDoctrineIdx] = useState<number | null>(null);

  // Fallback / empty state when no topics match current filters
  if (!displayedTopics || displayedTopics.length === 0) {
    return (
      <div
        data-testid="module-slides-empty-state"
        className="bg-slate-900 text-white rounded-3xl border-4 border-slate-950 p-8 sm:p-12 text-center space-y-4 shadow-[8px_8px_0_#000]"
      >
        <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
          <Presentation className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-xl font-black font-display text-white">
            No Modules Match Current Filter
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            No labor law modules match your active search keyword, world filter, or status criteria.
          </p>
        </div>
        {onResetFilters && (
          <button
            type="button"
            onClick={() => {
              onResetFilters();
              marioAudio.playPipe();
            }}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mario border-2 border-black shadow-[0_3px_0_#000] cursor-pointer inline-flex items-center gap-2 transition-transform active:translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESET FILTERS &amp; VIEW ALL MODULES</span>
          </button>
        )}
      </div>
    );
  }

  const clampedIdx = Math.min(
    Math.max(0, focusTopicIdx),
    displayedTopics.length - 1
  );
  const slideTopic = displayedTopics[clampedIdx];
  const isMastered = completedTopicIds.includes(slideTopic.id);
  const slideDiff =
    slideTopic.difficulty ||
    TOPIC_DIFFICULTY_MAP[slideTopic.id] ||
    'Intermediate';
  const slideCheck = getTopicQuickCheck(slideTopic);
  const totalSlides = 5;
  const safeStep = Math.min(Math.max(0, slideStepIdx), totalSlides - 1);

  const slideStepMeta = [
    { num: '01', title: 'Overview', icon: BookOpen },
    { num: '02', title: 'Precepts', icon: Gavel },
    { num: '03', title: 'Rules', icon: Scale },
    { num: '04', title: 'Checkpoints', icon: Award },
    { num: '05', title: 'Quiz Check', icon: Sparkles },
  ];

  // Guaranteed balanced examination checkpoints (prevents lopsided 1-card / blank spaces)
  const balancedCheckpoints = useMemo(() => {
    const list: { title: string; text: string; category: string }[] = [];
    const rawTips =
      slideTopic.barTips && slideTopic.barTips.length > 0
        ? slideTopic.barTips
        : slideTopic.keyTips && slideTopic.keyTips.length > 0
        ? slideTopic.keyTips
        : [];

    if (rawTips.length > 0) {
      list.push({
        title: 'BAR EXAM PRE-WEEK TIP & EXAMINER TRAP',
        text: rawTips[0],
        category: 'Statutory Core',
      });
      if (rawTips.length > 1) {
        list.push({
          title: 'DOCTRINAL DISTINCTION & REBUTTAL',
          text: rawTips[1],
          category: 'Jurisprudence',
        });
      }
    }

    // Always ensure at least 2 balanced, high-yield cards
    if (list.length < 2) {
      list.push({
        title: 'EVIDENTIARY BURDEN & ARBITRATION RULE',
        text: `Under ${slideTopic.badge}, the employer maintains the affirmative burden of proving full compliance with statutory wage floors, premium computations, and procedural notice. Failure to produce signed pay-slips, logbooks, or verified registries creates a legal presumption of non-payment.`,
        category: 'Burden of Proof',
      });
    }

    // Add 3rd and 4th practical cards if space allows for a full 2x2 grid
    if (list.length === 2 && (slideTopic.keyDoctrines?.length || 0) > 0) {
      list.push({
        title: 'WORKPLACE RECITATION CHECKLIST',
        text: `Always identify: (1) Covered employee category; (2) Statutory minimum threshold; (3) Authorized exceptions under Art. 82/97; and (4) Proper calculation formula before rendering legal advice or solving Bar essay questions.`,
        category: 'Recitation Formula',
      });
      list.push({
        title: 'NON-DIMINUTION & STATUTORY MANDATE',
        text: `Article 100 of the Labor Code prohibits the unilateral withdrawal or reduction by the employer of any existing benefits or privileges enjoyed by employees prior to or beyond statutory minimums.`,
        category: 'Non-Diminution',
      });
    }

    return list;
  }, [slideTopic]);

  const handleCopyDoctrine = (text: string, idx: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedDoctrineIdx(idx);
      marioAudio.playCoin();
      window.setTimeout(() => setCopiedDoctrineIdx(null), 1800);
    }
  };

  // Full presentation keyboard navigation (Left/Right/Space for slides, F for fullscreen, 1-5 for quick jump)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setSlideStepIdx((prev) => {
          if (prev < totalSlides - 1) {
            marioAudio.playClick();
            return prev + 1;
          } else {
            // Jump to next module when at final slide
            if (clampedIdx < displayedTopics.length - 1) {
              setFocusTopicIdx(clampedIdx + 1);
              marioAudio.playPipe();
              return 0;
            }
            return prev;
          }
        });
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSlideStepIdx((prev) => {
          if (prev > 0) {
            marioAudio.playClick();
            return prev - 1;
          } else {
            // Jump to previous module when at first slide
            if (clampedIdx > 0) {
              setFocusTopicIdx(clampedIdx - 1);
              marioAudio.playPipe();
              return totalSlides - 1;
            }
            return prev;
          }
        });
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setSlideDeckFullscreen((f) => !f);
        marioAudio.playClick();
      } else if (e.key === 'Escape' && slideDeckFullscreen) {
        e.preventDefault();
        setSlideDeckFullscreen(false);
      } else if (e.key >= '1' && e.key <= '5') {
        const targetStep = parseInt(e.key, 10) - 1;
        setSlideStepIdx(targetStep);
        marioAudio.playClick();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    clampedIdx,
    displayedTopics.length,
    totalSlides,
    slideDeckFullscreen,
    setFocusTopicIdx,
    setSlideStepIdx,
    setSlideDeckFullscreen,
  ]);

  return (
    <div
      data-testid="module-slides-deck"
      className={
        slideDeckFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-2 sm:p-5 backdrop-blur-2xl overflow-hidden animate-in fade-in duration-200'
          : 'bg-slate-900 text-white rounded-3xl border-4 border-slate-950 shadow-[8px_8px_0_#000] overflow-hidden flex flex-col relative w-full'
      }
    >
      {/* Top Slide Progress Bar */}
      <div className="w-full bg-slate-950 h-1.5 overflow-hidden border-b border-slate-800 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 transition-all duration-300"
          style={{ width: `${((safeStep + 1) / totalSlides) * 100}%` }}
        />
      </div>

      {/* Responsive Sticky Header (Zero Overlaps) */}
      <div className="bg-slate-950 px-3.5 sm:px-5 py-3 border-b-2 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
        {/* Module Picker */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400/10 border border-amber-400/40 flex items-center justify-center shrink-0">
            <Presentation className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <select
              aria-label="Select presentation module"
              value={clampedIdx}
              onChange={(e) => {
                setFocusTopicIdx(Number(e.target.value) || 0);
                setSlideStepIdx(0);
                setSlideQuizChoice(null);
                marioAudio.playClick();
              }}
              className="w-full sm:max-w-md rounded-xl bg-slate-900 border border-slate-700 px-3 py-1.5 text-xs sm:text-sm font-bold text-white cursor-pointer focus:border-amber-400 outline-none truncate"
            >
              {displayedTopics.map((item, idx) => (
                <option key={item.id} value={idx}>
                  {idx + 1}. {item.title}
                </option>
              ))}
            </select>
          </div>
          {isMastered && (
            <span
              title="Module Mastered!"
              className="px-2 py-0.5 rounded-lg bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono font-black text-[10px] hidden md:inline-flex items-center gap-1 shrink-0"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>MASTERED</span>
            </span>
          )}
        </div>

        {/* Status Indicators & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold text-slate-300 w-full sm:w-auto">
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
            <span>Keys:</span>
            <kbd className="bg-slate-800 px-1 py-0.2 rounded border border-slate-700 text-amber-300">←</kbd>
            <kbd className="bg-slate-800 px-1 py-0.2 rounded border border-slate-700 text-amber-300">→</kbd>
          </div>

          <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 text-[10px] sm:text-[11px] font-black uppercase shrink-0">
            {getFriendlyDifficultyLabel(slideDiff)}
          </span>

          <span className="px-2 sm:px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-mono font-black text-[10px] sm:text-[11px] shrink-0">
            Slide {safeStep + 1} / {totalSlides}
          </span>

          <button
            type="button"
            onClick={() => {
              marioAudio.playClick();
              setSlideDeckFullscreen((prev) => !prev);
            }}
            className="min-h-[34px] px-2.5 sm:px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-colors shrink-0"
            title={slideDeckFullscreen ? 'Exit Theater Mode (Esc)' : 'Keynote Fullscreen Presentation Mode'}
            aria-label={slideDeckFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {slideDeckFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Exit</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden sm:inline">Theater</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Slide Canvas (Overflow Controlled, Zero Overlaps, Zero Blanks) */}
      <div
        className={`p-4 sm:p-7 overflow-y-auto overscroll-contain space-y-6 text-white flex-1 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 ${
          slideDeckFullscreen ? 'min-h-0' : 'min-h-[420px] max-h-[74vh]'
        }`}
      >
        {/* SLIDE 1: PRACTICAL OVERVIEW */}
        {safeStep === 0 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>01. Practical Overview</span>
              </span>
              <span className="text-xs font-bold text-slate-300 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                {slideTopic.badge}
              </span>
              {(slideTopic as any).article && (
                <span className="text-xs font-mono font-bold text-sky-400 px-2.5 py-1 rounded-lg bg-sky-950/70 border border-sky-600/40">
                  {(slideTopic as any).article}
                </span>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white leading-tight break-words tracking-tight">
                {slideTopic.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Philippine Labor Standards &amp; Jurisprudence Keynote Deck
              </p>
            </div>

            <div className="bg-slate-800/90 border-2 border-slate-700/80 rounded-2xl p-4 sm:p-6 space-y-3.5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
                <h4 className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-widest flex items-center gap-2 font-mario">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Executive Statutory Summary</span>
                </h4>
                <span className="text-[11px] font-mono text-emerald-300 font-bold">
                  Bar Syllabus Verified
                </span>
              </div>
              <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed break-words whitespace-normal">
                {complexityMode === 'beginner' && slideTopic.beginnerSummary
                  ? slideTopic.beginnerSummary
                  : slideTopic.summary}
              </p>
            </div>

            {/* Statutory Context Metric Tiles (Symmetrical 3-Column) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="bg-slate-800/80 border border-amber-500/30 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-amber-300/80 block uppercase tracking-wider">
                  World Stage
                </span>
                <span className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{slideTopic.worldId.toUpperCase()}</span>
                </span>
              </div>
              <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-emerald-300/80 block uppercase tracking-wider">
                  Key Provisions
                </span>
                <span className="text-sm sm:text-base font-black text-emerald-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <span>{slideTopic.rules?.length || 0} Core Rules Defined</span>
                </span>
              </div>
              <div className="bg-slate-800/80 border border-cyan-500/30 rounded-2xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-cyan-300/80 block uppercase tracking-wider">
                  Examination Doctrines
                </span>
                <span className="text-sm sm:text-base font-black text-cyan-300 flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-cyan-400" />
                  <span>{slideTopic.keyDoctrines?.length || 0} Jurisprudential Precepts</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: CORE WORKPLACE PRECEPTS */}
        {safeStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400 px-3 py-1 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center gap-1.5">
                <Gavel className="w-3.5 h-3.5" />
                <span>02. Core Workplace Precepts &amp; Jurisprudence</span>
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-white">
                Controlling Supreme Court Doctrines
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Enforceable rules and landmark principles established under the Labor Code:
              </p>
            </div>

            <ul className="space-y-3.5">
              {(slideTopic.keyDoctrines && slideTopic.keyDoctrines.length > 0
                ? slideTopic.keyDoctrines
                : [slideTopic.summary]
              ).map((doc, dIdx) => (
                <li
                  key={dIdx}
                  className="bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 text-sm font-medium text-slate-100 leading-relaxed flex items-start gap-4 break-words whitespace-normal shadow-sm transition-all"
                >
                  <span className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-mono font-black text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {dIdx + 1}
                  </span>
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block font-mario">
                        LANDMARK PRECEPT #{dIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyDoctrine(doc, dIdx)}
                        className="text-[10px] text-slate-400 hover:text-emerald-300 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 transition-colors cursor-pointer"
                        title="Copy doctrine citation"
                      >
                        {copiedDoctrineIdx === dIdx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-300">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="break-words leading-relaxed text-slate-100 text-sm sm:text-base">
                      {doc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Supplementary Context Card if topic has few doctrines */}
            {(!slideTopic.keyDoctrines || slideTopic.keyDoctrines.length <= 2) && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-slate-200">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-emerald-300 block font-mario text-[10px] uppercase">
                    LABOR ARBITRATION APPLICATION NOTE
                  </span>
                  <p className="leading-relaxed text-slate-300">
                    These statutory doctrines govern all workplace proceedings before DOLE Regional Directors, NLRC Labor Arbiters, and the Supreme Court. Management prerogative cannot supersede these statutory rights.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SLIDE 3: STATUTORY RULES & EXCEPTIONS */}
        {safeStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-sky-400 px-3 py-1 rounded-lg bg-sky-400/10 border border-sky-400/30 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                <span>03. Statutory Rules &amp; Operational Exceptions</span>
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-white">
                Detailed Statutory Breakdown
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Provisions, qualifiers, and legal standards governing workplace rights:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slideTopic.rules && slideTopic.rules.length > 0 ? (
                slideTopic.rules.map((rule, rIdx) => (
                  <div
                    key={rIdx}
                    className="bg-slate-800/90 border-2 border-slate-700/80 hover:border-sky-400/50 rounded-2xl p-4 sm:p-5 space-y-3 flex flex-col justify-between break-words whitespace-normal shadow-sm transition-all h-full"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
                        <h4 className="text-sm sm:text-base font-black text-amber-300 leading-snug break-words">
                          {rule.heading}
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-slate-300 shrink-0 font-bold">
                          Rule #{rIdx + 1}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words whitespace-normal font-normal">
                          {rule.description}
                        </p>
                      )}
                    </div>

                    {rule.items && rule.items.length > 0 ? (
                      <ul className="pt-2 border-t border-slate-700/60 space-y-2">
                        {rule.items.map((it, itIdx) => (
                          <li
                            key={itIdx}
                            className="text-xs sm:text-sm text-slate-300 flex items-start gap-2.5 break-words leading-relaxed"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="flex-1 break-words whitespace-normal">{it}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="pt-2 border-t border-slate-700/60 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>Mandatory Statutory Compliance Rule</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-2 bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-6 text-center space-y-2">
                  <h4 className="text-base font-bold text-amber-300">
                    Governing Provisions
                  </h4>
                  <p className="text-sm text-slate-300">
                    {slideTopic.summary}
                  </p>
                </div>
              )}

              {/* Symmetrical pairing card if rule count is odd (ensures zero empty gaps in 2-col grid) */}
              {slideTopic.rules && slideTopic.rules.length % 2 === 1 && (
                <div className="bg-slate-800/60 border-2 border-dashed border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 h-full">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
                      <h4 className="text-sm sm:text-base font-black text-emerald-300 leading-snug break-words">
                        DOLE Compliance &amp; Record-Keeping
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-700 text-emerald-400 shrink-0 font-bold">
                        DOLE Audit
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words whitespace-normal font-normal">
                      Employers must maintain employment payrolls, time records, and statutory proof of benefits for at least 3 years under the DOLE Inspection Framework.
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-700/60 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Statutory Prescriptive Defense Anchor</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SLIDE 4: HIGH-YIELD EXAMINATION CHECKPOINTS (Zero Blanks Guaranteed) */}
        {safeStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                <span>04. High-Yield Examination Checkpoints</span>
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-white">
                Key Takeaways &amp; Common Bar Pitfalls
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Master these practical insights to avoid common examiner traps:
              </p>
            </div>

            {/* Symmetrical Grid: 2 or 4 balanced cards (No Blank Holes) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {balancedCheckpoints.map((tip, tIdx) => (
                <div
                  key={tIdx}
                  className="bg-slate-800/90 border-2 border-amber-400/30 hover:border-amber-400/60 rounded-2xl p-4 sm:p-6 flex items-start gap-4 break-words whitespace-normal shadow-sm transition-all h-full"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/50 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    {tIdx % 2 === 0 ? (
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Award className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider block font-mario">
                        CHECKPOINT #{tIdx + 1}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 uppercase">
                        {tip.category}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black text-white leading-snug">
                      {tip.title}
                    </h4>
                    <p className="text-xs sm:text-sm font-medium text-slate-200 leading-relaxed break-words whitespace-normal">
                      {tip.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SLIDE 5: INTERACTIVE SLIDE MASTERY */}
        {safeStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-lime-400 px-3 py-1 rounded-lg bg-lime-400/10 border border-lime-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>05. Interactive Slide Mastery (+3 Mario Coins)</span>
              </span>
            </div>

            <div className="bg-slate-800/95 border-2 border-amber-400 rounded-2xl p-4 sm:p-6 shadow-lg space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-2">
                <span className="text-xs font-black text-amber-300 uppercase tracking-widest font-mario flex items-center gap-2">
                  <MarioQuestionBlockIcon className="w-4 h-4 text-amber-400" />
                  <span>Knowledge Mastery Check</span>
                </span>
                <span className="text-xs font-bold text-amber-400 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/40 inline-flex items-center gap-1">
                  <MarioCoinIcon className="w-3.5 h-3.5" />
                  <span>+3 Coins</span>
                </span>
              </div>
              <p className="text-base sm:text-lg font-extrabold text-white leading-relaxed break-words whitespace-normal">
                {slideCheck.question}
              </p>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              {slideCheck.options.map((opt, oIdx) => {
                const picked = slideQuizChoice === oIdx;
                const isRight = oIdx === slideCheck.correctIndex;
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => {
                      setSlideQuizChoice(oIdx);
                      if (isRight) {
                        handleEarnCoins(3);
                        marioAudio.playCoin();
                      } else {
                        marioAudio.playWrongAnswer();
                      }
                    }}
                    className={`w-full min-h-[52px] p-3.5 sm:p-4 rounded-2xl border-2 text-left text-xs sm:text-sm font-bold cursor-pointer flex items-center gap-3.5 break-words whitespace-normal leading-relaxed transition-all ${
                      slideQuizChoice !== null
                        ? isRight
                          ? 'bg-emerald-500 text-slate-950 border-black font-black shadow-[0_4px_0_#000]'
                          : picked
                          ? 'bg-rose-500 text-white border-black font-black shadow-[0_4px_0_#000]'
                          : 'bg-slate-950/60 text-slate-400 border-slate-800 opacity-60'
                        : 'bg-slate-800/90 hover:bg-slate-700 text-white border-slate-700 hover:border-amber-400 shadow-sm'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-xl bg-black/60 border border-slate-700 text-amber-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="min-w-0 break-words whitespace-normal leading-relaxed flex-1">
                      {opt}
                    </span>
                    {slideQuizChoice !== null && isRight && (
                      <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Feedback / Rationale */}
            {slideQuizChoice !== null && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500 text-xs sm:text-sm font-semibold text-emerald-200 leading-relaxed break-words whitespace-normal shadow-xl space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between gap-2 border-b border-emerald-500/40 pb-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-300 block font-mario">
                    STATUTORY RATIONALE &amp; JURISPRUDENCE
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSlideQuizChoice(null);
                      marioAudio.playClick();
                    }}
                    className="text-[10px] text-emerald-300 hover:text-white underline cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
                <p className="break-words whitespace-normal leading-relaxed text-emerald-100">
                  {slideCheck.explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Responsive Slide Navigation Footer (Zero Overlaps) */}
      <div className="bg-slate-950 px-3.5 sm:px-5 py-3 border-t-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        {/* Step jump pills */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 w-full sm:w-auto order-1 sm:order-2">
          {slideStepMeta.map((sMeta, sIdx) => (
            <button
              key={sIdx}
              type="button"
              aria-label={`Go to slide ${sIdx + 1}: ${sMeta.title}`}
              onClick={() => {
                setSlideStepIdx(sIdx);
                marioAudio.playClick();
              }}
              className={`min-h-[38px] px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                safeStep === sIdx
                  ? 'bg-amber-400 text-slate-950 font-black shadow-[0_2px_0_#000]'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span className="font-mono font-black">{sIdx + 1}</span>
              <span className="hidden lg:inline">{sMeta.title}</span>
            </button>
          ))}
        </div>

        {/* Prev & Next / Master Buttons */}
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto order-2 sm:order-1 sm:flex-initial">
          <button
            type="button"
            disabled={safeStep === 0}
            onClick={() => {
              setSlideStepIdx((s) => Math.max(0, s - 1));
              marioAudio.playClick();
            }}
            className="min-h-[40px] px-3.5 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-black text-xs border border-slate-600 inline-flex items-center gap-1.5 cursor-pointer transition-all disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {safeStep < totalSlides - 1 ? (
            <button
              type="button"
              onClick={() => {
                setSlideStepIdx((s) => Math.min(totalSlides - 1, s + 1));
                marioAudio.playClick();
              }}
              className="min-h-[40px] px-4 sm:px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center gap-1.5 cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5 transition-transform font-mario"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                handleToggleTopicComplete(slideTopic.id);
                if (clampedIdx < displayedTopics.length - 1) {
                  setFocusTopicIdx(clampedIdx + 1);
                  setSlideStepIdx(0);
                  setSlideQuizChoice(null);
                }
              }}
              className="min-h-[40px] px-4 sm:px-5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs border-2 border-black inline-flex items-center gap-1.5 cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5 transition-transform font-mario"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Master Topic</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
