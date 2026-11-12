import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Scale,
  Award,
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Copy,
  Check,
  Calculator,
  Compass,
  ArrowRight,
  FileText,
  Trophy,
} from 'lucide-react';
import {
  BAR_SCENARIO_CASES,
  BarScenarioCase,
} from '../utils/gameDecksExpansion';
import { marioAudio } from '../utils/audio';
import { MarioCoinIcon, MarioStarIcon } from './MarioIcons';

interface BarScenarioSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnCoins?: (amount: number) => void;
  onAwardXp?: (amount: number, reason: string) => void;
}

export const BarScenarioSolverModal: React.FC<BarScenarioSolverModalProps> = ({
  isOpen,
  onClose,
  onEarnCoins,
  onAwardXp,
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case_bpo_holiday_ot');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  const [selectedCompOption, setSelectedCompOption] = useState<number | null>(null);
  const [evaluated, setEvaluated] = useState<boolean>(false);
  const [copiedAnswer, setCopiedAnswer] = useState<boolean>(false);

  const activeCase = useMemo<BarScenarioCase>(() => {
    return (
      BAR_SCENARIO_CASES.find((c) => c.id === selectedCaseId) ||
      BAR_SCENARIO_CASES[0]
    );
  }, [selectedCaseId]);

  // Reset stage state when switching cases
  useEffect(() => {
    setCurrentStep(1);
    setSelectedIssues([]);
    setSelectedArticles([]);
    setSelectedCompOption(null);
    setEvaluated(false);
  }, [selectedCaseId]);

  if (!isOpen) return null;

  const handleToggleIssue = (issueId: string) => {
    setSelectedIssues((prev) =>
      prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]
    );
    marioAudio.playClick();
  };

  const handleToggleArticle = (artId: string) => {
    setSelectedArticles((prev) =>
      prev.includes(artId) ? prev.filter((id) => id !== artId) : [...prev, artId]
    );
    marioAudio.playClick();
  };

  const handleSelectCompOption = (idx: number) => {
    setSelectedCompOption(idx);
    const opt = activeCase.computationQuestion.options[idx];
    if (opt.isCorrect) {
      marioAudio.playCoin();
    } else {
      marioAudio.playStomp();
    }
  };

  const handleCopyModelAnswer = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const full = `[QUESTION FACTS]\n${activeCase.facts}\n\n[MODEL BAR EXAM ANSWER (ALAC)]\n\nANSWER:\n${activeCase.modelBarAnswer.answer}\n\nLEGAL BASIS:\n${activeCase.modelBarAnswer.legalBasis}\n\nAPPLICATION:\n${activeCase.modelBarAnswer.application}\n\nCONCLUSION:\n${activeCase.modelBarAnswer.conclusion}`;
      navigator.clipboard.writeText(full);
      setCopiedAnswer(true);
      marioAudio.playCoin();
      setTimeout(() => setCopiedAnswer(false), 2000);
    }
  };

  const handleCompleteCase = () => {
    setEvaluated(true);
    setCurrentStep(4);
    marioAudio.playPowerUp();
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899'],
    });
    if (onEarnCoins) onEarnCoins(30);
    if (onAwardXp) onAwardXp(150, `Solved Bar Scenario: ${activeCase.caseTitle}`);
  };

  const handleStepCase = (delta: number) => {
    const currentIndex = BAR_SCENARIO_CASES.findIndex((c) => c.id === selectedCaseId);
    const nextIdx = (currentIndex + delta + BAR_SCENARIO_CASES.length) % BAR_SCENARIO_CASES.length;
    setSelectedCaseId(BAR_SCENARIO_CASES[nextIdx].id);
    marioAudio.playPipe();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bar Exam Scenario Case Solver"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border-4 border-black text-white w-full max-w-4xl rounded-3xl shadow-[6px_6px_0_#000] overflow-hidden my-auto max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-3 sm:p-4 border-b-4 border-black flex items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
              <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] sm:text-[10px] font-black font-mario px-2 py-0.5 rounded-md bg-black/40 text-amber-300 uppercase">
                  BAR EXAM CASE SOLVER
                </span>
                <span className="text-xs font-bold text-white/90">
                  {activeCase.barYearTag}
                </span>
              </div>
              <h2 className="text-sm sm:text-lg md:text-xl font-black font-display text-white truncate">
                Interactive Bar Issue Spotter &amp; ALAC Lab
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyModelAnswer}
              title="Copy Full Model Bar Answer"
              className="min-h-[38px] sm:min-h-[40px] px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-black font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000] transition-colors shrink-0"
            >
              {copiedAnswer ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
              <span className="hidden sm:inline">{copiedAnswer ? 'Copied ALAC!' : 'Copy Answer'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Bar Scenario Modal"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white border-2 border-black flex items-center justify-center cursor-pointer shadow-[0_2px_0_#000] transition-colors shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Case Navigation & Stage Stepper */}
          <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleStepCase(-1)}
                  aria-label="Previous Case"
                  className="min-h-[42px] px-2 sm:px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-black cursor-pointer shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <select
                  aria-label="Choose Bar Exam Scenario"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                  className="flex-1 min-w-0 min-h-[42px] px-2 sm:px-3 rounded-xl bg-slate-900 border-2 border-amber-400 text-amber-300 font-black text-xs sm:text-sm cursor-pointer focus:outline-hidden truncate"
                >
                  {BAR_SCENARIO_CASES.map((cs) => (
                    <option key={cs.id} value={cs.id}>
                      {cs.caseTitle} ({cs.barYearTag} · World {cs.worldNumber})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleStepCase(1)}
                  aria-label="Next Case"
                  className="min-h-[42px] px-2 sm:px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border-2 border-black cursor-pointer shrink-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Step Navigation Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full lg:w-auto shrink-0 min-w-0">
                {[
                  { step: 1 as const, label: '1. Spot Issues' },
                  { step: 2 as const, label: '2. Codal Basis' },
                  { step: 3 as const, label: '3. Math/Remedy' },
                  { step: 4 as const, label: '4. Model ALAC' },
                ].map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      setCurrentStep(s.step);
                      marioAudio.playClick();
                    }}
                    className={`min-h-[36px] px-2 rounded-lg text-[11px] font-black transition-colors cursor-pointer text-center truncate min-w-0 ${
                      currentStep === s.step
                        ? 'bg-amber-400 text-slate-950 shadow-[0_1px_0_#000]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Facts Box */}
          <div className="bg-slate-950 border-3 border-amber-400/40 rounded-2xl p-4 sm:p-5 space-y-2 shadow-lg">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-black font-mario text-amber-400 uppercase tracking-wider">
                BAR FACT PATTERN: {activeCase.caseTitle}
              </span>
              <span className="text-[10px] font-black font-mario px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase shrink-0">
                {activeCase.difficulty.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-serif italic border-l-4 border-amber-400 pl-3">
              &quot;{activeCase.facts}&quot;
            </p>
          </div>

          {/* Interactive Step Content */}
          {currentStep === 1 && (
            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black font-display text-amber-300 uppercase">
                    Step 1: Spot the Genuine Legal Issues
                  </h3>
                  <p className="text-xs text-slate-400">
                    Select all operative legal issues raised by the facts of this problem.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {selectedIssues.length} Selected
                </span>
              </div>

              <div className="space-y-2 pt-1">
                {activeCase.issuesList.map((iss) => {
                  const isSelected = selectedIssues.includes(iss.id);
                  return (
                    <button
                      key={iss.id}
                      type="button"
                      onClick={() => handleToggleIssue(iss.id)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400/15 border-amber-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-amber-400 border-black text-slate-950' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs sm:text-sm font-bold block">{iss.label}</span>
                        {evaluated && (
                          <span
                            className={`text-[11px] font-semibold mt-1 block ${
                              iss.isGenuineIssue ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {iss.isGenuineIssue ? '✓ Genuine Issue: ' : '✗ Irrelevant: '}
                            {iss.explanation}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto min-h-[40px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000]"
                >
                  <span>Proceed to Codal Basis</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-sm font-black font-display text-sky-300 uppercase">
                    Step 2: Identify Governing Codal Articles
                  </h3>
                  <p className="text-xs text-slate-400">
                    Which statutory provisions control the resolution of this case?
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400 shrink-0">
                  {selectedArticles.length} Selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {activeCase.controllingArticles.map((art) => {
                  const isSelected = selectedArticles.includes(art.id);
                  return (
                    <button
                      key={art.id}
                      type="button"
                      onClick={() => handleToggleArticle(art.id)}
                      className={`text-left p-3 rounded-xl border-2 transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-sky-400/15 border-sky-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-sky-400 border-black text-slate-950' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <span className="text-xs font-black font-mario text-sky-300 block">{art.citation}</span>
                        <span className="text-xs font-medium text-slate-200 mt-0.5 block">{art.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full sm:w-auto min-h-[40px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer text-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="w-full sm:w-auto min-h-[40px] px-4 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000]"
                >
                  <span>Proceed to Computation / Remedy</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <div>
                <h3 className="text-sm font-black font-display text-emerald-300 uppercase">
                  Step 3: Solve Practical Computation &amp; Legal Remedy
                </h3>
                <p className="text-xs text-slate-300 font-bold mt-1">
                  {activeCase.computationQuestion.prompt}
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {activeCase.computationQuestion.options.map((opt, idx) => {
                  const isSelected = selectedCompOption === idx;
                  return (
                    <button
                      key={`comp-opt-${idx}`}
                      type="button"
                      onClick={() => handleSelectCompOption(idx)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? opt.isCorrect
                            ? 'bg-emerald-950 border-emerald-400 text-white'
                            : 'bg-rose-950 border-rose-400 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? (opt.isCorrect ? 'bg-emerald-400 border-black text-slate-950' : 'bg-rose-500 border-black text-white') : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs sm:text-sm font-bold block break-words">{opt.label}</span>
                        {isSelected && (
                          <span
                            className={`text-xs font-semibold mt-1 block break-words ${
                              opt.isCorrect ? 'text-emerald-300' : 'text-rose-300'
                            }`}
                          >
                            {opt.feedback}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full sm:w-auto min-h-[40px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer text-center"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteCase}
                  className="w-full sm:w-auto min-h-[42px] px-4 sm:px-6 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-display text-xs sm:text-sm font-black uppercase tracking-wide inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5"
                >
                  <Trophy className="w-4 h-4 shrink-0" />
                  <span className="truncate">View Model ALAC Bar Answer</span>
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="bg-slate-950 border-2 border-amber-400/50 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Award className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-xs sm:text-sm font-black font-display text-amber-300 uppercase tracking-tight truncate">
                    Canonical ALAC Model Bar Exam Answer
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyModelAnswer}
                  className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedAnswer ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* ALAC Breakdown */}
              <div className="space-y-3 text-xs sm:text-sm leading-relaxed">
                <div className="bg-slate-900 border-l-4 border-emerald-400 p-3 rounded-r-xl">
                  <span className="font-mario text-[10px] text-emerald-400 uppercase block mb-1">
                    A — ANSWER (Direct Categorical Response)
                  </span>
                  <p className="font-semibold text-slate-100">{activeCase.modelBarAnswer.answer}</p>
                </div>

                <div className="bg-slate-900 border-l-4 border-sky-400 p-3 rounded-r-xl">
                  <span className="font-mario text-[10px] text-sky-400 uppercase block mb-1">
                    L — LEGAL BASIS (Statutory Codals &amp; Precedents)
                  </span>
                  <p className="font-medium text-slate-200">{activeCase.modelBarAnswer.legalBasis}</p>
                </div>

                <div className="bg-slate-900 border-l-4 border-amber-400 p-3 rounded-r-xl">
                  <span className="font-mario text-[10px] text-amber-400 uppercase block mb-1">
                    A — APPLICATION (Applying the Law to Specific Facts)
                  </span>
                  <p className="font-medium text-slate-200">{activeCase.modelBarAnswer.application}</p>
                </div>

                <div className="bg-slate-900 border-l-4 border-purple-400 p-3 rounded-r-xl">
                  <span className="font-mario text-[10px] text-purple-400 uppercase block mb-1">
                    C — CONCLUSION (Final Legal Result &amp; Ruling)
                  </span>
                  <p className="font-semibold text-slate-100">{activeCase.modelBarAnswer.conclusion}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full sm:w-auto min-h-[40px] px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer text-center"
                >
                  Review Steps 1–3
                </button>
                <button
                  type="button"
                  onClick={() => handleStepCase(1)}
                  className="w-full sm:w-auto min-h-[42px] px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000]"
                >
                  <span>Next Bar Scenario</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
