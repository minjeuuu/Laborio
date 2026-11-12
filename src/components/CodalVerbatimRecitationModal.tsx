import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  BookOpen,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Scale,
  Compass,
} from 'lucide-react';
import {
  CODAL_CLOZE_ARTICLES,
  CodalClozeArticle,
} from '../utils/gameDecksExpansion';
import { marioAudio } from '../utils/audio';
import { MarioCoinIcon, MarioStarIcon, MarioPipeIcon } from './MarioIcons';

interface CodalVerbatimRecitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnCoins?: (amount: number) => void;
  onAwardXp?: (amount: number, reason: string) => void;
}

type ClozeDifficulty = 'numeric_rates' | 'key_phrases' | 'verbatim_master';

export const CodalVerbatimRecitationModal: React.FC<CodalVerbatimRecitationModalProps> = ({
  isOpen,
  onClose,
  onEarnCoins,
  onAwardXp,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>('art_83');
  const [difficulty, setDifficulty] = useState<ClozeDifficulty>('numeric_rates');
  const [userInputs, setUserInputs] = useState<Record<number, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [copiedNotice, setCopiedNotice] = useState<boolean>(false);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const activeArticle = useMemo<CodalClozeArticle>(() => {
    return (
      CODAL_CLOZE_ARTICLES.find((a) => a.id === selectedArticleId) ||
      CODAL_CLOZE_ARTICLES[0]
    );
  }, [selectedArticleId]);

  // Active blanks filtered by difficulty
  const activeBlanks = useMemo(() => {
    if (difficulty === 'numeric_rates') {
      const numOnly = activeArticle.blanks.filter((b) => b.isNumericOrPercentage);
      return numOnly.length > 0 ? numOnly : activeArticle.blanks.slice(0, 3);
    }
    if (difficulty === 'key_phrases') {
      return activeArticle.blanks;
    }
    // verbatim_master
    return activeArticle.blanks;
  }, [activeArticle, difficulty]);

  // Reset inputs when switching article or difficulty
  useEffect(() => {
    setUserInputs({});
    setRevealedHints({});
    setIsChecked(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
    }
  }, [selectedArticleId, difficulty]);

  if (!isOpen) return null;

  const handleInputChange = (idx: number, val: string) => {
    setUserInputs((prev) => ({ ...prev, [idx]: val }));
    if (isChecked) setIsChecked(false);
  };

  const handleRevealHint = (idx: number) => {
    setRevealedHints((prev) => ({ ...prev, [idx]: true }));
    marioAudio.playClick();
  };

  const cleanVal = (s?: string) => (s || '').trim().toLowerCase().replace(/[\(\),.]/g, '');

  const checkResults = () => {
    let correctCount = 0;
    activeBlanks.forEach((b) => {
      const u = cleanVal(userInputs[b.index]);
      const expected = cleanVal(b.word);
      if (u === expected || (expected.includes(u) && u.length >= 3)) {
        correctCount++;
      }
    });

    const isPerfect = correctCount === activeBlanks.length && activeBlanks.length > 0;
    setIsChecked(true);

    if (isPerfect) {
      marioAudio.playPowerUp();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
      if (onEarnCoins) onEarnCoins(20);
      if (onAwardXp) onAwardXp(120, `Mastered Verbatim Codal: ${activeArticle.articleNumber}`);
    } else if (correctCount > 0) {
      marioAudio.playCoin();
      if (onEarnCoins) onEarnCoins(Math.max(5, correctCount * 3));
    } else {
      marioAudio.playStomp();
    }
  };

  const handleCopyVerbatim = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `${activeArticle.articleNumber} - ${activeArticle.title}\n(${activeArticle.sourceStatute})\n\n${activeArticle.fullVerbatimText}`
      );
      setCopiedNotice(true);
      marioAudio.playCoin();
      setTimeout(() => setCopiedNotice(false), 2000);
    }
  };

  const handleToggleNarration = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(
      `${activeArticle.articleNumber}. ${activeArticle.title}. ${activeArticle.fullVerbatimText}`
    );
    utt.rate = 0.95;
    utt.pitch = 1.0;
    utt.onend = () => setIsNarrating(false);
    utt.onerror = () => setIsNarrating(false);
    speechRef.current = utt;
    window.speechSynthesis.speak(utt);
    setIsNarrating(true);
  };

  const handleStepArticle = (delta: number) => {
    const currentIndex = CODAL_CLOZE_ARTICLES.findIndex((a) => a.id === selectedArticleId);
    const nextIdx = (currentIndex + delta + CODAL_CLOZE_ARTICLES.length) % CODAL_CLOZE_ARTICLES.length;
    setSelectedArticleId(CODAL_CLOZE_ARTICLES[nextIdx].id);
    marioAudio.playPipe();
  };

  // Compute live match score
  const computedCorrectCount = activeBlanks.filter((b) => {
    const u = cleanVal(userInputs[b.index]);
    const expected = cleanVal(b.word);
    return u === expected || (expected.includes(u) && u.length >= 3);
  }).length;
  const accuracyPercent =
    activeBlanks.length > 0 ? Math.round((computedCorrectCount / activeBlanks.length) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Codal Cloze Verbatim Recitation Drill"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div className="bg-slate-900 border-3 sm:border-4 border-black text-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-[0_8px_24px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[calc(100dvh-1rem)] sm:max-h-[92vh] flex flex-col min-w-0">
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 p-2.5 sm:p-4 border-b-3 sm:border-b-4 border-black flex items-center justify-between gap-2 shrink-0 min-w-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[8px] sm:text-[10px] font-black font-mario px-1.5 sm:px-2 py-0.5 rounded-md bg-black/40 text-amber-300 uppercase tracking-tight">
                  CODAL VERBATIM RECITATION
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-white/90 hidden min-[400px]:inline">
                  {CODAL_CLOZE_ARTICLES.length} Articles
                </span>
              </div>
              <h2 className="text-xs min-[380px]:text-sm sm:text-lg font-black font-display text-white truncate">
                Fill-in-the-Blank Codal Memorizer
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleNarration}
              title={isNarrating ? 'Stop Voice Narration' : 'Listen to Verbatim Codal'}
              className={`min-h-[36px] sm:min-h-[40px] px-2 sm:px-3 rounded-xl border-2 border-black font-black text-xs inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-[0_2px_0_#000] transition-colors ${
                isNarrating
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
              }`}
            >
              {isNarrating ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
              <span className="hidden md:inline">{isNarrating ? 'Stop Voice' : 'Read Aloud'}</span>
            </button>
            <button
              type="button"
              onClick={handleCopyVerbatim}
              title="Copy Full Verbatim Codal"
              className="min-h-[36px] sm:min-h-[40px] px-2 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-black font-black text-xs inline-flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-[0_2px_0_#000] transition-colors"
            >
              {copiedNotice ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
              <span className="hidden md:inline">{copiedNotice ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                onClose();
              }}
              aria-label="Close Codal Recitation Modal"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white border-2 border-black flex items-center justify-center cursor-pointer shadow-[0_2px_0_#000] transition-colors shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-2.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 flex-1 min-w-0">
          {/* Article & Difficulty Controls Header */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-2.5 sm:p-4 space-y-2.5 sm:space-y-3 shadow-inner min-w-0">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 min-w-0">
              {/* Article Selector Dropdown with Prev/Next */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleStepArticle(-1)}
                  aria-label="Previous Article"
                  className="min-h-[38px] sm:min-h-[42px] px-2 sm:px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-black cursor-pointer shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  aria-label="Select Codal Article"
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="flex-1 min-w-0 min-h-[38px] sm:min-h-[42px] px-2 sm:px-3 rounded-xl bg-slate-900 border-2 border-amber-400 text-amber-300 font-black text-xs sm:text-sm cursor-pointer focus:outline-hidden truncate"
                >
                  {CODAL_CLOZE_ARTICLES.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.articleNumber}: {art.title} (World {art.worldNumber})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleStepArticle(1)}
                  aria-label="Next Article"
                  className="min-h-[38px] sm:min-h-[42px] px-2 sm:px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-black cursor-pointer shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Difficulty Tiers */}
              <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0 min-w-0">
                {[
                  { id: 'numeric_rates' as const, label: 'Rates' },
                  { id: 'key_phrases' as const, label: 'Phrases' },
                  { id: 'verbatim_master' as const, label: 'Verbatim' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => {
                      setDifficulty(tier.id);
                      marioAudio.playClick();
                    }}
                    className={`min-h-[32px] sm:min-h-[34px] px-2 sm:px-3 rounded-lg text-[10px] sm:text-xs font-black transition-colors cursor-pointer text-center truncate ${
                      difficulty === tier.id
                        ? 'bg-amber-400 text-slate-950 shadow-[0_1px_0_#000]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Article Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mario text-[9px] sm:text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  WORLD {activeArticle.worldNumber}
                </span>
                <span className="text-slate-400 font-medium truncate text-[11px] sm:text-xs">
                  {activeArticle.sourceStatute}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono font-bold text-amber-300 text-[11px] sm:text-xs shrink-0">
                <span>{activeBlanks.length} Blanks</span>
                <span>·</span>
                <span className={isChecked && accuracyPercent === 100 ? 'text-emerald-400' : 'text-slate-300'}>
                  {isChecked ? `Score: ${accuracyPercent}%` : 'Not checked'}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Cloze Passage Stage */}
          <div className="bg-slate-950 border-2 sm:border-3 border-amber-400/40 rounded-2xl p-3 sm:p-6 space-y-3 sm:space-y-4 shadow-lg min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-black font-mario text-amber-400 uppercase tracking-wider truncate">
                {activeArticle.articleNumber} — {activeArticle.title}
              </span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden sm:inline shrink-0">
                Type exact terms or numbers into blanks
              </span>
            </div>

            {/* Rendered Text with Interactive Inline Blanks */}
            <div className="leading-relaxed sm:leading-loose text-sm sm:text-base md:text-lg text-slate-200 font-serif break-words [overflow-wrap:anywhere] max-w-full">
              {(() => {
                let text = activeArticle.fullVerbatimText;
                const segments: React.ReactNode[] = [];
                let lastPos = 0;

                const sortedBlanks = [...activeBlanks].sort((a, b) => {
                  const posA = text.toLowerCase().indexOf(a.word.toLowerCase());
                  const posB = text.toLowerCase().indexOf(b.word.toLowerCase());
                  return posA - posB;
                });

                sortedBlanks.forEach((b, bIdx) => {
                  const wordPos = text.toLowerCase().indexOf(b.word.toLowerCase(), lastPos);
                  if (wordPos !== -1) {
                    if (wordPos > lastPos) {
                      segments.push(
                        <span key={`text-${lastPos}`}>{text.substring(lastPos, wordPos)}</span>
                      );
                    }

                    const val = userInputs[b.index] || '';
                    const isHinted = revealedHints[b.index];
                    const isRight =
                      isChecked &&
                      (cleanVal(val) === cleanVal(b.word) ||
                        (cleanVal(b.word).includes(cleanVal(val)) && cleanVal(val).length >= 3));
                    const isWrong = isChecked && !isRight;

                    segments.push(
                      <span
                        key={`blank-${b.index}`}
                        className="inline-flex items-center align-middle relative my-0.5 mx-0.5 sm:mx-1 max-w-full"
                      >
                        <input
                          type="text"
                          aria-label={`Blank ${bIdx + 1}: ${b.hint}`}
                          value={val}
                          placeholder={isHinted ? b.word.substring(0, 3) + '...' : `[ #${bIdx + 1} ]`}
                          onChange={(e) => handleInputChange(b.index, e.target.value)}
                          className={`font-mono font-bold text-xs sm:text-sm pl-2 pr-6 py-1 rounded-lg border-2 transition-all text-center w-24 sm:w-36 max-w-full focus:outline-hidden ${
                            isRight
                              ? 'bg-emerald-950 border-emerald-400 text-emerald-300'
                              : isWrong
                              ? 'bg-rose-950 border-rose-400 text-rose-300 animate-shake'
                              : isHinted
                              ? 'bg-amber-950/60 border-amber-400 text-amber-200'
                              : 'bg-slate-900 border-amber-400/80 text-white hover:border-amber-400'
                          }`}
                        />
                        {!isChecked && (
                          <button
                            type="button"
                            onClick={() => handleRevealHint(b.index)}
                            title={`Hint: ${b.hint}`}
                            className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 border border-slate-600 flex items-center justify-center text-[9px] cursor-pointer"
                          >
                            ?
                          </button>
                        )}
                      </span>
                    );

                    lastPos = wordPos + b.word.length;
                  }
                });

                if (lastPos < text.length) {
                  segments.push(<span key={`text-end`}>{text.substring(lastPos)}</span>);
                }

                return segments;
              })()}
            </div>
          </div>

          {/* Word Hints / Word Bank Drawer */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-2.5 sm:p-4 space-y-2 sm:space-y-2.5 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 font-mario">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>CLOZE WORD BANK &amp; HINTS</span>
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400">Click word chip to auto-fill blank</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {activeBlanks.map((b, idx) => {
                const isHinted = revealedHints[b.index];
                return (
                  <button
                    key={`hint-chip-${b.index}`}
                    type="button"
                    onClick={() => {
                      handleInputChange(b.index, b.word);
                      marioAudio.playCoin();
                    }}
                    className="min-h-[34px] sm:min-h-[36px] px-2.5 sm:px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors max-w-full"
                  >
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="truncate">{isHinted || isChecked ? b.word : b.hint}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doctrinal Summary & Practical Application */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] font-black font-mario text-emerald-400 uppercase block">
                DOCTRINAL SUMMARY
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {activeArticle.doctrinalSummary}
              </p>
            </div>
            <div className="bg-sky-950/40 border border-sky-500/40 rounded-2xl p-3.5 space-y-1">
              <span className="text-[10px] font-black font-mario text-sky-400 uppercase block">
                PRACTICAL BAR APPLICATION
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {activeArticle.practicalApplication}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Dock */}
        <div className="bg-slate-950 p-3 sm:p-4 border-t-4 border-black flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setUserInputs({});
                setIsChecked(false);
                setRevealedHints({});
                marioAudio.playPipe();
              }}
              className="flex-1 sm:flex-initial min-h-[44px] px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-black font-black text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000] active:translate-y-0.5"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Reset Blanks</span>
            </button>

            <button
              type="button"
              onClick={() => {
                // Reveal all answers
                const all: Record<number, string> = {};
                activeBlanks.forEach((b) => {
                  all[b.index] = b.word;
                });
                setUserInputs(all);
                setIsChecked(true);
                marioAudio.playPowerUp();
              }}
              className="flex-1 sm:flex-initial min-h-[44px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs inline-flex items-center justify-center gap-1 cursor-pointer"
            >
              <Lightbulb className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Show Full Answer</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={checkResults}
              className="w-full sm:w-auto min-h-[46px] px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 border-3 border-black font-display text-xs sm:text-sm font-black uppercase tracking-wide inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Check Recitation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
