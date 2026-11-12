import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  BookOpen,
  Filter,
  Flame,
  ArrowRight,
  FileDown,
} from 'lucide-react';
import {
  PRESCRIPTIVE_PERIODS_DATA,
  filterPrescriptivePeriods,
  PrescriptivePeriodItem,
} from '../utils/prescriptivePeriods';
import { marioAudio } from '../utils/marioAudio';
import { triggerCoinParticles } from '../utils/coinRushGame';
import { triggerPrintWithDocumentFont } from '../utils/printHelper';
import { downloadExactPreviewVisualPdfAsync } from '../utils/pdfExportService';

interface PrescriptivePeriodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnCoins?: (amount: number) => void;
}

export function PrescriptivePeriodsModal({
  isOpen,
  onClose,
  onEarnCoins,
}: PrescriptivePeriodsModalProps) {
  const [activeTab, setActiveTab] = useState<'drill' | 'library'>('drill');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentItem: PrescriptivePeriodItem = PRESCRIPTIVE_PERIODS_DATA[currentIndex % PRESCRIPTIVE_PERIODS_DATA.length];

  const filteredLibrary = useMemo(() => {
    return filterPrescriptivePeriods(PRESCRIPTIVE_PERIODS_DATA, categoryFilter, searchQuery);
  }, [categoryFilter, searchQuery]);

  if (!isOpen) return null;

  const handleSelectChoice = (choice: string) => {
    if (isAnswered) return;
    setSelectedChoice(choice);
    setIsAnswered(true);

    const isCorrect = choice === currentItem.correctPeriod;
    if (isCorrect) {
      marioAudio.playCoin();
      setScore((s) => s + 1);
      setStreak((st) => st + 1);
      onEarnCoins?.(5);
      triggerCoinParticles(12);
    } else {
      marioAudio.playBump();
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedChoice(null);
    setIsAnswered(false);
    setCurrentIndex((prev) => (prev + 1) % PRESCRIPTIVE_PERIODS_DATA.length);
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePrint = () => {
    marioAudio.playPowerUp();
    triggerPrintWithDocumentFont({
      orientation: 'portrait',
      mode: 'prescriptive',
      paperSize: 'a4',
      margin: '8mm 10mm',
    });
  };

  const handleDownloadPdf = async () => {
    const el = document.getElementById('prescriptive-periods-cheatsheet-sheet');
    if (!el || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    marioAudio.playPowerUp();
    try {
      await downloadExactPreviewVisualPdfAsync(
        el,
        'Philippine-Labor-Standards-Prescriptive-Periods-Cheatsheet.pdf',
        'Philippine Labor Standards Statutory Prescriptive Periods & Deadlines',
        {
          orientation: 'portrait',
          paperSize: 'a4',
        }
      );
    } catch {
      // fallback
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Philippine Labor Standards Prescriptive Periods & Statutory Deadlines"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain animate-fadeIn print:static print:p-0 print:bg-white print:overflow-visible"
    >
      <div className="print:hidden bg-slate-900 border-4 border-amber-400 rounded-3xl w-full max-w-4xl max-h-[92vh] my-auto flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 px-4 sm:px-6 py-3.5 border-b-4 border-black flex items-center justify-between text-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0_#000]">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase font-mario px-2 py-0.5 bg-slate-950 text-amber-300 rounded-md">
                  STATUTORY TIME WARP
                </span>
                <span className="text-[11px] font-bold text-slate-900 hidden sm:inline">
                  Arts. 305–307 &amp; Civil Code
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight leading-tight uppercase font-display truncate max-w-[200px] sm:max-w-md">
                Prescriptive Periods &amp; Appeal Deadlines
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              title="Download Prescriptive Periods Cheatsheet PDF"
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-transform"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              title="Print Statutory Prescriptive Periods Reference Card"
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Card</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Prescriptive Periods Modal"
              className="w-9 h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white border-2 border-black flex items-center justify-center cursor-pointer shadow-[2px_2px_0_#000] active:translate-y-0.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-slate-950/80 px-3 sm:px-4 py-2 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveTab('drill');
                marioAudio.playCoin();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'drill'
                  ? 'bg-amber-400 text-slate-950 border-black shadow-[2px_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Time-Warp Drill</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('library');
                marioAudio.playCoin();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'bg-amber-400 text-slate-950 border-black shadow-[2px_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Master Codal Reference ({PRESCRIPTIVE_PERIODS_DATA.length})</span>
            </button>
          </div>

          {activeTab === 'drill' && (
            <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold text-amber-300 shrink-0">
              <span className="flex items-center gap-1 bg-slate-900 border border-amber-400/40 px-2 py-0.5 rounded-lg">
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Streak: {streak}
              </span>
              <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-slate-200">
                Score: {score}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'drill' ? (
            <div className="space-y-4 max-w-2xl mx-auto">
              {/* Question Card */}
              <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-4 sm:p-6 space-y-3 shadow-md relative">
                <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                  <span>SCENARIO #{currentIndex + 1} OF {PRESCRIPTIVE_PERIODS_DATA.length}</span>
                  <span className="uppercase px-2 py-0.5 bg-slate-900 rounded border border-slate-700 text-slate-300">
                    {currentItem.category.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {currentItem.claimOrAction}
                </h3>

                <p className="text-xs text-slate-400 italic">
                  Select the exact statutory prescriptive period or procedural deadline under Philippine labor jurisprudence:
                </p>

                {/* Multiple Choices */}
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  {currentItem.choices.map((choice) => {
                    const isSelected = selectedChoice === choice;
                    const isCorrect = choice === currentItem.correctPeriod;
                    let btnClass = 'bg-slate-900 text-slate-100 border-slate-700 hover:border-amber-400 hover:bg-slate-800';

                    if (isAnswered) {
                      if (isCorrect) {
                        btnClass = 'bg-emerald-600 text-white border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)] font-black';
                      } else if (isSelected) {
                        btnClass = 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]';
                      } else {
                        btnClass = 'bg-slate-900/50 text-slate-500 border-slate-800';
                      }
                    }

                    return (
                      <button
                        key={choice}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectChoice(choice)}
                        className={`p-3 rounded-xl border-2 font-bold text-xs sm:text-sm transition-all cursor-pointer text-center ${btnClass}`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Result & Statutory Reveal */}
              {isAnswered && (
                <div className="bg-slate-950 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    {selectedChoice === currentItem.correctPeriod ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>CORRECT! +5 Gold Coins Earned!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        <span>INCORRECT! Correct Answer: {currentItem.correctPeriod}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="font-mono text-amber-300 font-semibold">
                      Statutory Basis: {currentItem.statutorySource}
                    </div>
                    <p className="text-slate-200 leading-relaxed font-sans">
                      {currentItem.keyRule}
                    </p>
                    <div className="p-2.5 bg-amber-950/60 border border-amber-500/50 rounded-xl text-amber-200 text-xs">
                      <span className="font-bold text-amber-400">Bar Exam Trap: </span>
                      {currentItem.trapAlert}
                    </div>
                    {currentItem.landmarkCase && (
                      <div className="text-[11px] font-mono text-cyan-300">
                        Citation: {currentItem.landmarkCase}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Next Statutory Period</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Reference Library Tab */
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search prescriptive periods, articles, or cases..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {['all', 'money_claims', 'dismissal', 'appeals', 'special_laws', 'penal'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        categoryFilter === cat
                          ? 'bg-amber-400 text-slate-950 border border-black'
                          : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                      }`}
                    >
                      {cat.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredLibrary.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-amber-400/60 rounded-2xl p-3.5 space-y-2 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 rounded">
                        {item.correctPeriod}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                      {item.claimOrAction}
                    </h4>

                    <div className="text-[11px] font-mono text-amber-300">
                      {item.statutorySource}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {item.keyRule}
                    </p>

                    <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] text-amber-200">
                      <span className="font-bold text-amber-400">Trap: </span>
                      {item.trapAlert}
                    </div>

                    {item.landmarkCase && (
                      <div className="text-[10px] font-mono text-cyan-300 truncate">
                        SC: {item.landmarkCase}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px] text-center sm:text-left">
            Philippine Labor Standards Memory Aid · Matched against 2024–2026 Bar Syllabus
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold border border-slate-700 cursor-pointer text-center"
          >
            Close
          </button>
        </div>
      </div>

      {/* Standalone Printable Cheatsheet (Hidden on Screen, Visible on Print) */}
      <div
        id="prescriptive-periods-cheatsheet-sheet"
        data-testid="prescriptive-periods-cheatsheet-sheet"
        data-printable-sheet="true"
        className="hidden print:block print:w-full print:p-8 bg-white text-black font-sans"
      >
        <div className="border-b-2 border-black pb-4 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">
              PHILIPPINE LABOR STANDARDS: STATUTORY PRESCRIPTIVE PERIODS &amp; DEADLINES
            </h1>
            <p className="text-xs font-semibold text-slate-700">
              Complete Bar Exam Reference Guide · Arts. 305–307, Civil Code, Rules of Court &amp; Special Statutes
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <div>SUPER MARIO LABOR AID</div>
            <div>VERIFIED SYLLABUS</div>
          </div>
        </div>

        <table className="w-full text-xs border-collapse border border-slate-900 mb-6">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="border border-slate-900 p-2 font-black">Action / Cause of Action</th>
              <th className="border border-slate-900 p-2 font-black w-28">Prescriptive Period</th>
              <th className="border border-slate-900 p-2 font-black">Statutory Source</th>
              <th className="border border-slate-900 p-2 font-black">Key Rule &amp; Landmark Jurisprudence</th>
            </tr>
          </thead>
          <tbody>
            {PRESCRIPTIVE_PERIODS_DATA.map((item) => (
              <tr key={item.id} className="border-t border-slate-400">
                <td className="border border-slate-900 p-2 font-semibold">{item.claimOrAction}</td>
                <td className="border border-slate-900 p-2 font-bold font-mono">{item.correctPeriod}</td>
                <td className="border border-slate-900 p-2 font-mono text-[11px]">{item.statutorySource}</td>
                <td className="border border-slate-900 p-2 text-[11px]">
                  <div>{item.keyRule}</div>
                  <div className="font-bold mt-0.5 text-slate-800">Trap: {item.trapAlert}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-xs border-t border-black pt-2 flex justify-between text-slate-600 font-mono">
          <span>Super Mario Labor Standards Guide · Created by Matthew</span>
          <span>Article 305–307 / Rule 65 / Rule 45</span>
        </div>
      </div>
    </div>
  );
}
