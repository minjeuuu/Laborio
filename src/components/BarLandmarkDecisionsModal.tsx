import React, { useState, useMemo } from 'react';
import {
  X,
  Scale,
  Search,
  BookOpen,
  ArrowRight,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  Filter,
  Flame,
  RotateCcw,
  ExternalLink,
  GraduationCap,
  Gavel,
  HelpCircle,
} from 'lucide-react';
import {
  LANDMARK_DECISIONS_DATA,
  LandmarkDecision,
} from '../data/landmarkDecisionsData';
import { marioAudio } from '../utils/audio';
import { speechService } from '../utils/speechNarrationService';
import { MarioCoinIcon, MarioStarIcon, MarioPeachCrownIcon } from './MarioIcons';
import { triggerCoinParticles } from '../utils/coinRushGame';

interface BarLandmarkDecisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic?: (worldId: string, topicId: string) => void;
  onEarnCoins?: (amount: number) => void;
}

export const BarLandmarkDecisionsModal: React.FC<BarLandmarkDecisionsModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
  onEarnCoins,
}) => {
  const [activeTab, setActiveTab] = useState<'library' | 'drill'>('library');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [narratingId, setNarratingId] = useState<string | null>(null);

  // Drill Mode State
  const [drillIndex, setDrillIndex] = useState<number>(0);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [drillScore, setDrillScore] = useState<number>(0);
  const [drillStreak, setDrillStreak] = useState<number>(0);

  // Filtered decisions list
  const filteredDecisions = useMemo(() => {
    return LANDMARK_DECISIONS_DATA.filter((item) => {
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.caseTitle.toLowerCase().includes(query) ||
        item.grNumber.toLowerCase().includes(query) ||
        item.doctrinalHolding.toLowerCase().includes(query) ||
        item.statutoryBasis.toLowerCase().includes(query) ||
        item.topicTitle.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, searchQuery]);

  // Current drill item
  const currentDrillItem: LandmarkDecision =
    LANDMARK_DECISIONS_DATA[drillIndex % LANDMARK_DECISIONS_DATA.length];

  // Distractor options for drill
  const drillOptions = useMemo(() => {
    const distractors = LANDMARK_DECISIONS_DATA.filter(
      (d) => d.id !== currentDrillItem.id
    )
      .sort(() => 0.5 - Math.sin(drillIndex * 13 + 7))
      .slice(0, 3);
    const combined = [currentDrillItem, ...distractors];
    // Deterministic shuffle based on drill index
    return combined.sort((a, b) => a.caseTitle.localeCompare(b.caseTitle));
  }, [drillIndex, currentDrillItem]);

  React.useEffect(() => {
    const unsubscribe = speechService.subscribe((state) => {
      if (!state.isSpeaking) {
        setNarratingId(null);
      }
    });
    return () => {
      unsubscribe();
      speechService.stop();
    };
  }, []);

  if (!isOpen) return null;

  const handleCopyCitation = (decision: LandmarkDecision) => {
    const text = `${decision.caseTitle} (${decision.grNumber}, ${decision.promulgationDate})\nDoctrine: ${decision.doctrinalHolding}\nStatutory Basis: ${decision.statutoryBasis}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(decision.id);
      marioAudio.playCoin();
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleToggleNarrate = (decision: LandmarkDecision) => {
    if (narratingId === decision.id) {
      speechService.stop();
      setNarratingId(null);
    } else {
      speechService.stop();
      setNarratingId(decision.id);
      speechService.speak(
        `${decision.caseTitle}. Supreme Court Doctrine: ${decision.doctrinalHolding}. Bar Exam Application: ${decision.barExamTip}`,
        decision.id
      );
    }
  };

  const handleSelectDrillChoice = (caseId: string) => {
    if (isAnswered) return;
    setSelectedCaseId(caseId);
    setIsAnswered(true);

    const isCorrect = caseId === currentDrillItem.id;
    if (isCorrect) {
      marioAudio.playSuccess();
      setDrillScore((s) => s + 1);
      setDrillStreak((st) => st + 1);
      onEarnCoins?.(currentDrillItem.marioRewardCoins);
      triggerCoinParticles(16);
    } else {
      marioAudio.playBump();
      setDrillStreak(0);
    }
  };

  const handleNextDrill = () => {
    setSelectedCaseId(null);
    setIsAnswered(false);
    setDrillIndex((prev) => (prev + 1) % LANDMARK_DECISIONS_DATA.length);
  };

  const handleResetDrill = () => {
    setSelectedCaseId(null);
    setIsAnswered(false);
    setDrillIndex(0);
    setDrillScore(0);
    setDrillStreak(0);
    marioAudio.playPipe();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Philippine Supreme Court Landmark Decisions & Bar Doctrine Decoder"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto overscroll-contain animate-fadeIn"
    >
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl w-full max-w-5xl shadow-[0_16px_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 px-4 sm:px-6 py-4 border-b-4 border-black flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-950 text-amber-300 border-2 border-black flex items-center justify-center shadow-[3px_3px_0_#000] shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] sm:text-xs font-black uppercase font-mario px-2 py-0.5 bg-slate-950 text-amber-300 rounded border border-amber-400/50">
                  SUPREME COURT EN BANC
                </span>
                <span className="text-[11px] font-bold text-amber-100 hidden sm:inline">
                  Philippine Labor Standards Jurisprudence
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black uppercase font-mario tracking-wide text-white drop-shadow-[0_2px_0_#000] break-words [overflow-wrap:break-word] [word-break:normal]">
                Bar Landmark Decisions & Doctrine Decoder
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              speechService.stop();
              onClose();
            }}
            aria-label="Close Landmark Decisions Modal"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-950 hover:bg-red-700 text-white border-2 border-black flex items-center justify-center cursor-pointer shadow-[2px_2px_0_#000] active:translate-y-0.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-4 sm:px-6 py-2.5 border-b-2 border-slate-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveTab('library');
                marioAudio.playTabSwitch();
              }}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black font-display transition-all cursor-pointer border-2 flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'bg-amber-400 text-slate-950 border-black shadow-[2px_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Landmark Library ({filteredDecisions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('drill');
                marioAudio.playTabSwitch();
              }}
              className={`px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black font-display transition-all cursor-pointer border-2 flex items-center gap-1.5 ${
                activeTab === 'drill'
                  ? 'bg-amber-400 text-slate-950 border-black shadow-[2px_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span>Bar Doctrine Spotter Drill</span>
            </button>
          </div>

          {activeTab === 'drill' && (
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-300">
                <MarioCoinIcon className="w-4 h-4" />
                Score: {drillScore}
              </span>
              <span className="flex items-center gap-1 font-bold text-orange-400">
                <Flame className="w-4 h-4" />
                Streak: {drillStreak}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        {activeTab === 'library' ? (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search and Category Filters */}
            <div className="p-3 sm:p-4 bg-slate-900/95 border-b border-slate-800 space-y-2.5 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search case title, G.R. number, holding keyword (e.g. 'Asian Transmission', '200%', 'Twin-Notice', 'SIL')..."
                  className="w-full bg-slate-950 text-white pl-10 pr-4 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {[
                  { id: 'all', label: 'All Topics' },
                  { id: 'hours_of_work', label: 'Hours of Work' },
                  { id: 'rest_and_holidays', label: 'Rest & Holidays' },
                  { id: 'wages_and_13th', label: 'Wages & 13th Month' },
                  { id: 'leaves_and_sil', label: 'Leaves & SIL' },
                  { id: 'special_groups', label: 'Special Groups' },
                  { id: 'dismissals_due_process', label: 'Due Process' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(chip.id);
                      marioAudio.playClick();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all border ${
                      categoryFilter === chip.id
                        ? 'bg-amber-400 text-slate-950 border-black font-extrabold'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Decisions List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
              {filteredDecisions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Scale className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                  <p className="text-base font-bold text-slate-300">
                    No landmark cases matched your filter
                  </p>
                  <p className="text-xs">
                    Try clearing your search query or switching topic categories.
                  </p>
                </div>
              ) : (
                filteredDecisions.map((decision) => (
                  <div
                    key={decision.id}
                    className="bg-slate-950 border-2 border-slate-800 hover:border-amber-400/80 rounded-2xl p-4 sm:p-5 transition-all shadow-md space-y-3"
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-black font-mario uppercase">
                            {decision.categoryLabel}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {decision.grNumber} · {decision.promulgationDate}
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white hover:text-amber-300 transition-colors break-words [overflow-wrap:break-word] [word-break:normal]">
                          {decision.caseTitle}
                        </h3>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleNarrate(decision)}
                          title="Recite Doctrine (Text-to-Speech)"
                          aria-label={`Recite doctrine for ${decision.caseTitle}`}
                          className={`p-2 rounded-xl border text-xs flex items-center gap-1 cursor-pointer transition-all ${
                            narratingId === decision.id
                              ? 'bg-amber-400 text-slate-950 border-black animate-pulse'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                          }`}
                        >
                          {narratingId === decision.id ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyCitation(decision)}
                          title="Copy Case Citation & Doctrine"
                          aria-label={`Copy citation for ${decision.caseTitle}`}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                        >
                          {copiedId === decision.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {onSelectTopic && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTopic(decision.worldId, decision.topicId);
                              onClose();
                            }}
                            title="Jump to Codal Module"
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs border border-black flex items-center gap-1 cursor-pointer"
                          >
                            <span>Module</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Doctrinal Holding Banner */}
                    <div className="bg-amber-950/30 border-l-4 border-amber-400 p-3 rounded-r-xl">
                      <div className="text-[11px] font-black uppercase text-amber-300 font-mario mb-1 flex items-center gap-1.5">
                        <Gavel className="w-3.5 h-3.5" />
                        <span>SUPREME COURT DOCTRINE</span>
                      </div>
                      <p className="text-sm font-bold text-amber-100 leading-relaxed break-words [overflow-wrap:break-word] [word-break:normal]">
                        "{decision.doctrinalHolding}"
                      </p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                        <span className="font-bold text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px]">
                          Facts Summary:
                        </span>
                        <p className="text-slate-200 leading-normal break-words [overflow-wrap:break-word] [word-break:normal]">
                          {decision.factsSummary}
                        </p>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                        <span className="font-bold text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px]">
                          Legal Issue:
                        </span>
                        <p className="text-slate-200 leading-normal break-words [overflow-wrap:break-word] [word-break:normal]">
                          {decision.legalIssue}
                        </p>
                      </div>
                    </div>

                    {/* Bar Exam Tip */}
                    <div className="bg-blue-950/40 border border-blue-800/60 p-3 rounded-xl flex items-start gap-2 text-xs">
                      <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black text-blue-300 uppercase tracking-wider text-[10px] block">
                          BAR EXAM APPLICATION TIP:
                        </span>
                        <p className="text-blue-100 font-medium break-words [overflow-wrap:break-word] [word-break:normal]">
                          {decision.barExamTip}
                        </p>
                      </div>
                    </div>

                    {/* Statutory Basis Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Statutory Basis: <strong className="text-slate-300">{decision.statutoryBasis}</strong></span>
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <MarioCoinIcon className="w-3.5 h-3.5" />
                        +{decision.marioRewardCoins} Coins
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Drill Mode */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-between">
            <div className="space-y-4 max-w-3xl mx-auto w-full">
              {/* Question Card */}
              <div className="bg-slate-950 border-3 border-amber-400 rounded-2xl p-5 shadow-[4px_4px_0_#000]">
                <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black font-mario text-[10px]">
                    CASE SPOTTER #{((drillIndex % LANDMARK_DECISIONS_DATA.length) + 1)}
                  </span>
                  <span className="text-slate-400 font-semibold">
                    Category: {currentDrillItem.categoryLabel}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-amber-300 mb-2">
                  Which landmark Philippine Supreme Court decision established this doctrine?
                </h3>

                <blockquote className="bg-slate-900 border-l-4 border-amber-400 p-3.5 rounded-r-xl my-3 text-sm font-bold text-slate-100 italic break-words [overflow-wrap:break-word] [word-break:normal]">
                  "{currentDrillItem.doctrinalHolding}"
                </blockquote>

                <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <strong className="text-slate-400 block mb-0.5 uppercase tracking-wider text-[10px]">
                    Case Facts Context:
                  </strong>
                  <p className="break-words [overflow-wrap:break-word] [word-break:normal] leading-relaxed">
                    {currentDrillItem.factsSummary}
                  </p>
                </div>
              </div>

              {/* Choices */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {drillOptions.map((option) => {
                  const isSelected = selectedCaseId === option.id;
                  const isCorrect = option.id === currentDrillItem.id;

                  let btnStyle =
                    'bg-slate-950 border-2 border-slate-700 hover:border-amber-400 text-white';
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle =
                        'bg-emerald-950/90 border-3 border-emerald-400 text-emerald-100 shadow-[0_0_15px_rgba(52,211,153,0.3)]';
                    } else if (isSelected) {
                      btnStyle =
                        'bg-red-950/90 border-3 border-red-500 text-red-100';
                    } else {
                      btnStyle = 'bg-slate-950/50 border border-slate-800 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectDrillChoice(option.id)}
                      className={`p-3.5 rounded-2xl text-left font-bold transition-all cursor-pointer flex items-center justify-between gap-2 ${btnStyle}`}
                    >
                      <div>
                        <div className="text-xs font-black text-amber-300">
                          {option.caseTitle}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {option.grNumber} · {option.statutoryBasis}
                        </div>
                      </div>
                      {isAnswered && isCorrect && (
                        <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <X className="w-5 h-5 text-red-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback Banner */}
              {isAnswered && (
                <div
                  className={`p-4 rounded-2xl border-2 animate-in fade-in duration-200 ${
                    selectedCaseId === currentDrillItem.id
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-100'
                      : 'bg-red-950/80 border-red-400 text-red-100'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black font-mario text-xs mb-1">
                    {selectedCaseId === currentDrillItem.id ? (
                      <>
                        <MarioStarIcon className="w-5 h-5 animate-spin" />
                        <span>CORRECT! +{currentDrillItem.marioRewardCoins} COINS EARNED!</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-400" />
                        <span>INCORRECT — STUDY THE DOCTRINE:</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs font-semibold mt-1 break-words [overflow-wrap:break-word] [word-break:normal] leading-relaxed">
                    <strong>{currentDrillItem.caseTitle}</strong> ({currentDrillItem.grNumber}): {currentDrillItem.supremeCourtRuling}
                  </p>
                  <div className="mt-2 text-xs text-amber-300 font-bold flex items-start gap-1.5 break-words [overflow-wrap:break-word] [word-break:normal]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5" />
                    <span>Bar Tip: {currentDrillItem.barExamTip}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Drill Footer Controls */}
            <div className="mt-6 pt-3 border-t border-slate-800 flex items-center justify-between gap-3 max-w-3xl mx-auto w-full">
              <button
                type="button"
                onClick={handleResetDrill}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Drill</span>
              </button>

              <button
                type="button"
                onClick={handleNextDrill}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black font-mario text-xs border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0_#000] cursor-pointer"
              >
                <span>{isAnswered ? 'Next Case Challenge' : 'Skip Case'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
