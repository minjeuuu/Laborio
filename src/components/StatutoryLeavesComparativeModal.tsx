import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Sparkles,
  Filter,
  X,
  Award,
  Calendar,
  Layers,
  FileDown,
} from 'lucide-react';
import { marioAudio } from '../utils/audio';
import { MarioCoinIcon, MarioPeachCrownIcon } from './MarioIcons';
import { triggerPrintWithDocumentFont } from '../utils/printHelper';
import { downloadExactPreviewVisualPdfAsync } from '../utils/pdfExportService';

interface StatutoryLeavesComparativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnCoins?: (amount: number) => void;
}

export interface StatutoryLeaveRule {
  id: string;
  name: string;
  statute: string;
  duration: string;
  beneficiary: string;
  qualifyingTenure: string;
  commutableToCash: boolean;
  commutationNotes: string;
  cumulativeCarryOver: boolean;
  salaryCoverage: string;
  keyBarExceptions: string;
  category: 'maternal_paternal' | 'health_special' | 'general';
}

export const STATUTORY_LEAVES_DATA: StatutoryLeaveRule[] = [
  {
    id: 'sil',
    name: 'Service Incentive Leave (SIL)',
    statute: 'Article 95, Labor Code & Omnibus Rules',
    duration: '5 working days per year',
    beneficiary: 'All employees who have rendered at least one (1) year of service',
    qualifyingTenure: 'At least 1 year of continuous or broken service (12 months)',
    commutableToCash: true,
    commutationNotes: 'Mandatory cash conversion at end of year if unused (Auto Bus Transport doctrine).',
    cumulativeCarryOver: true,
    salaryCoverage: '100% of regular daily basic wage',
    keyBarExceptions:
      'Excludes managerial employees, field personnel, establishments regularly employing less than 10 workers, and those already enjoying at least 5 days vacation leave with pay.',
    category: 'general',
  },
  {
    id: 'maternity',
    name: '105-Day Expanded Maternity Leave',
    statute: 'R.A. No. 11210 & DOLE-CSC-SSS Joint Circular 1-2019',
    duration: '105 days (live birth) / 120 days (solo parent) / 60 days (miscarriage or emergency termination)',
    beneficiary: 'All female workers regardless of civil status, legitimacy of child, or frequency of delivery',
    qualifyingTenure: 'At least 3 monthly SSS contributions in the 12-month period preceding delivery',
    commutableToCash: false,
    commutationNotes: 'Non-commutable to cash. Unused days cannot be converted to money.',
    cumulativeCarryOver: false,
    salaryCoverage: '100% of daily salary credit (paid by SSS, with employer salary differential if applicable)',
    keyBarExceptions:
      'Available for all pregnancies without limitation on number of deliveries (repealed the old 4-delivery cap under Art. 133). 7 days may be allocated to child’s father or alternate caregiver.',
    category: 'maternal_paternal',
  },
  {
    id: 'paternity',
    name: 'Paternity Leave Act',
    statute: 'R.A. No. 8187',
    duration: '7 calendar days with full pay',
    beneficiary: 'Married male employee cohabiting with legitimate spouse who delivers or miscarries',
    qualifyingTenure: 'Employed at the time of delivery; no minimum tenure required',
    commutableToCash: false,
    commutationNotes: 'Non-commutable to cash if unused, unless stipulated in CBA.',
    cumulativeCarryOver: false,
    salaryCoverage: '100% basic wage plus mandatory allowances',
    keyBarExceptions:
      'Capped strictly at the first four (4) deliveries of the legitimate spouse. Cohabitation is a mandatory prerequisite.',
    category: 'maternal_paternal',
  },
  {
    id: 'solo_parent',
    name: 'Solo Parent Parental Leave',
    statute: 'R.A. No. 11861 (Amending R.A. No. 8972)',
    duration: '7 working days per year',
    beneficiary: 'Qualified solo parent performing parental duties with valid Solo Parent ID',
    qualifyingTenure: 'Rendered at least six (6) months of service with employer (reduced from 1 year by RA 11861)',
    commutableToCash: false,
    commutationNotes: 'Non-convertible to cash if unused at end of year.',
    cumulativeCarryOver: false,
    salaryCoverage: '100% of daily wage',
    keyBarExceptions:
      'Forfeited if change of status causes the parent to no longer qualify as a solo parent. Granted in addition to leaves under existing laws or CBA.',
    category: 'maternal_paternal',
  },
  {
    id: 'vawc',
    name: 'Battered Woman Leave (VAWC)',
    statute: 'R.A. No. 9262 (Anti-VAWC Act)',
    duration: 'Up to 10 days with full pay',
    beneficiary: 'Female employee who is a victim of physical, sexual, or psychological violence under RA 9262',
    qualifyingTenure: 'No minimum service requirement; immediate upon occurrence',
    commutableToCash: false,
    commutationNotes: 'Non-cumulative and not convertible to cash.',
    cumulativeCarryOver: false,
    salaryCoverage: '100% basic salary and mandatory allowances',
    keyBarExceptions:
      'Conditioned upon presentation of a Barangay Protection Order (BPO), Temporary Protection Order (TPO), or certification of pending court/prosecutor action. Extendible if need arises.',
    category: 'health_special',
  },
  {
    id: 'gynecological',
    name: 'Special Leave for Women (Gynecological Surgery)',
    statute: 'R.A. No. 9710 (Magna Carta of Women)',
    duration: 'Up to 2 continuous months (60 calendar days) with full pay',
    beneficiary: 'Female employee undergoing surgery caused by gynecological disorders',
    qualifyingTenure: 'Rendered at least six (6) months continuous aggregate employment for the last 12 months',
    commutableToCash: false,
    commutationNotes: 'Non-commutable to cash.',
    cumulativeCarryOver: false,
    salaryCoverage: '100% of gross monthly compensation',
    keyBarExceptions:
      'Covers surgical operations involving female reproductive organs (uterus, ovaries, fallopian tubes, cervix, vagina). Paid directly by employer (not SSS).',
    category: 'health_special',
  },
  {
    id: 'adoption',
    name: 'Adoption Leave',
    statute: 'R.A. No. 8552 in rel. to R.A. No. 11210 & R.A. No. 11642',
    duration: '60 calendar days with full pay',
    beneficiary: 'Female adoptive parent upon placement of a child below 7 years of age',
    qualifyingTenure: 'Standard employer/SSS adoption notification compliance',
    commutableToCash: false,
    commutationNotes: 'Non-commutable to cash.',
    cumulativeCarryOver: false,
    salaryCoverage: '100% of daily salary benefit',
    keyBarExceptions:
      'Applies only where the adopted child is under seven (7) years old at the date of turnover/placement.',
    category: 'maternal_paternal',
  },
  {
    id: 'rehabilitation',
    name: 'Rehabilitation Leave (Work-Connected Injury)',
    statute: 'P.D. No. 626 & Employees Compensation Commission (ECC)',
    duration: 'Up to six (6) months for medical recuperation',
    beneficiary: 'Employee who suffered work-connected sickness or disability',
    qualifyingTenure: 'Immediate upon occurrence of compensable work injury',
    commutableToCash: false,
    commutationNotes: 'Non-commutable to cash.',
    cumulativeCarryOver: false,
    salaryCoverage: 'ECC statutory temporary total disability (TTD) income benefit',
    keyBarExceptions:
      'Distinct from ordinary sick leaves. Replaced by permanent disability benefits if recovery extends past statutory maximum.',
    category: 'health_special',
  },
];

export const StatutoryLeavesComparativeModal: React.FC<StatutoryLeavesComparativeModalProps> = ({
  isOpen,
  onClose,
  onEarnCoins,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'maternal_paternal' | 'health_special' | 'general'>('all');
  const [commutableOnly, setCommutableOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredLeaves = useMemo(() => {
    return STATUTORY_LEAVES_DATA.filter((item) => {
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (commutableOnly && !item.commutableToCash) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.statute.toLowerCase().includes(q) ||
          item.beneficiary.toLowerCase().includes(q) ||
          item.duration.toLowerCase().includes(q) ||
          item.keyBarExceptions.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [categoryFilter, commutableOnly, searchTerm]);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!isOpen) return null;

  const handlePrintMatrix = () => {
    marioAudio.playCoin();
    onEarnCoins?.(10);
    triggerPrintWithDocumentFont({
      orientation: 'landscape',
      mode: 'leaves-matrix',
      paperSize: 'a4',
      margin: '6mm 8mm',
    });
  };

  const handleDownloadPdf = async () => {
    const el = document.getElementById('statutory-leaves-matrix-sheet');
    if (!el || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    marioAudio.playCoin();
    try {
      await downloadExactPreviewVisualPdfAsync(
        el,
        'Philippine-Statutory-Leaves-Comparative-Matrix.pdf',
        'Philippine Statutory Leaves Comparative Master Matrix',
        {
          orientation: 'landscape',
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
      aria-label="Philippine Statutory Leaves Comparative Master Matrix"
      data-testid="statutory-leaves-comparative-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto safe-top-nav safe-bottom-dock animate-in fade-in duration-200 print:static print:p-0 print:bg-white print:overflow-visible"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border-4 border-amber-400 rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.9)] text-slate-100 flex flex-col max-h-[92vh] overflow-hidden my-auto print:border-none print:shadow-none print:rounded-none print:bg-white print:text-black print:max-h-none print:overflow-visible">
        {/* Header */}
        <div className="print:hidden bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 p-3.5 sm:p-5 border-b-4 border-black text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-950 border-2 border-white flex items-center justify-center text-pink-400 shadow-[0_3px_0_#000] shrink-0">
              <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mario text-xs sm:text-sm font-black uppercase tracking-wider text-amber-200">
                  STATUTORY LEAVES MATRIX
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-mono text-[10px] font-bold border border-white">
                  WORLD 6 JURISPRUDENCE
                </span>
              </div>
              <p className="text-xs font-semibold text-pink-100 mt-0.5 truncate hidden sm:block">
                Complete Side-by-Side Comparison of all 8 Philippine Labor Standards Leave Laws
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Leaves Comparative Matrix"
            className="w-10 h-10 rounded-xl bg-slate-950 text-white hover:bg-red-600 flex items-center justify-center border-2 border-white cursor-pointer transition-colors shrink-0 shadow-[0_2px_0_#000]"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="print:hidden bg-slate-950 p-3 sm:p-4 border-b-2 border-slate-800 flex items-center justify-between gap-2.5 flex-wrap text-xs shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by law, days, beneficiary, or doctrine..."
              className="w-full bg-slate-900 border border-slate-700 pl-9 pr-3 py-1.5 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-pink-400 text-xs"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('all');
                marioAudio.playClick();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors text-[11px] sm:text-xs ${
                categoryFilter === 'all'
                  ? 'bg-pink-600 text-white shadow-[0_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All 8 Leaves
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('maternal_paternal');
                marioAudio.playClick();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors text-[11px] sm:text-xs ${
                categoryFilter === 'maternal_paternal'
                  ? 'bg-pink-600 text-white shadow-[0_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Parental & Family
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('health_special');
                marioAudio.playClick();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-colors text-[11px] sm:text-xs ${
                categoryFilter === 'health_special'
                  ? 'bg-pink-600 text-white shadow-[0_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Medical & VAWC
            </button>

            <label className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1.5 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={commutableOnly}
                onChange={(e) => {
                  setCommutableOnly(e.target.checked);
                  marioAudio.playClick();
                }}
                className="w-3.5 h-3.5 accent-pink-500 cursor-pointer"
              />
              <span className="text-[11px] font-bold text-amber-300">Cash Only</span>
            </label>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => {
                  setViewMode('table');
                  marioAudio.playClick();
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                  viewMode === 'table' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Table View
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('cards');
                  marioAudio.playClick();
                }}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-colors ${
                  viewMode === 'cards' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cards View
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div
          id="statutory-leaves-matrix-sheet"
          data-testid="statutory-leaves-matrix-sheet"
          data-printable-sheet="true"
          className="printable-standalone-sheet p-3 sm:p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain print:p-0 print:overflow-visible"
        >
          {/* Printable Official Slip Header */}
          <div className="hidden print:block border-b-2 border-black pb-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-950 font-display">
                  PHILIPPINE STATUTORY LEAVES COMPARATIVE MATRIX
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  Republic of the Philippines · Labor Code Book III, Title I &amp; Special Protective Statutes
                </p>
              </div>
              <div className="text-right text-xs font-mono">
                <div className="font-bold text-slate-900">SUPER MARIO LABOR AID</div>
                <div className="text-slate-600">OFFICIAL BAR REVIEW SLIP</div>
              </div>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="overflow-x-auto rounded-2xl border-2 border-slate-800 bg-slate-950 shadow-inner">
              <table className="w-full min-w-[960px] text-left border-collapse text-xs table-auto">
                <thead>
                  <tr className="bg-slate-950 text-amber-300 font-mario text-[10px] uppercase border-b-2 border-slate-800">
                    <th className="p-3.5 border-r border-slate-800 w-[24%] min-w-[210px]">
                      LEAVE STATUTE
                    </th>
                    <th className="p-3.5 border-r border-slate-800 w-[14%] min-w-[130px]">
                      DURATION
                    </th>
                    <th className="p-3.5 border-r border-slate-800 w-[18%] min-w-[160px]">
                      QUALIFYING TENURE
                    </th>
                    <th className="p-3.5 border-r border-slate-800 w-[14%] min-w-[130px] text-center">
                      CASH CONVERTIBLE?
                    </th>
                    <th className="p-3.5 border-r border-slate-800 w-[15%] min-w-[140px]">
                      PAY COVERAGE
                    </th>
                    <th className="p-3.5 w-[25%] min-w-[220px]">
                      KEY BAR TRAPS / EXCLUSIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLeaves.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-slate-800/60 transition-colors ${
                        idx % 2 === 0 ? 'bg-slate-900/70' : 'bg-slate-900/30'
                      }`}
                    >
                      {/* Law & Name */}
                      <td className="p-3.5 border-r border-slate-800 align-top break-words [overflow-wrap:break-word] [word-break:normal]">
                        <span className="font-black text-white text-xs block mb-1">
                          {row.name}
                        </span>
                        <span className="text-[10px] text-pink-400 font-mono font-bold block mb-1">
                          {row.statute}
                        </span>
                        <span className="text-[11px] text-slate-300 leading-relaxed block">
                          {row.beneficiary}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="p-3.5 border-r border-slate-800 align-top font-bold text-amber-300 font-mono text-xs break-words [overflow-wrap:break-word] [word-break:normal]">
                        {row.duration}
                      </td>

                      {/* Tenure */}
                      <td className="p-3.5 border-r border-slate-800 align-top text-slate-200 text-xs leading-relaxed break-words [overflow-wrap:break-word] [word-break:normal]">
                        {row.qualifyingTenure}
                      </td>

                      {/* Cash Commutability */}
                      <td className="p-3.5 border-r border-slate-800 align-top text-center break-words [overflow-wrap:break-word] [word-break:normal]">
                        {row.commutableToCash ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500 font-black text-[10px] flex items-center gap-1 shadow-sm">
                              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                              <span>YES (COMMUTABLE)</span>
                            </span>
                            <span className="text-[10px] text-slate-300 mt-1.5 max-w-[130px] leading-snug">
                              {row.commutationNotes}
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[10px] inline-flex items-center gap-1 shadow-sm">
                              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span>NO (FORFEITED)</span>
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1 max-w-[130px] leading-tight">
                              Non-commutable
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Pay Coverage */}
                      <td className="p-3.5 border-r border-slate-800 align-top text-slate-200 font-medium text-xs leading-relaxed break-words [overflow-wrap:break-word] [word-break:normal]">
                        {row.salaryCoverage}
                      </td>

                      {/* Bar Exceptions */}
                      <td className="p-3.5 align-top text-slate-300 text-xs leading-relaxed break-words [overflow-wrap:break-word] [word-break:normal]">
                        {row.keyBarExceptions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Cards View for Mobile & Compact Screens */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredLeaves.map((row) => (
                <div
                  key={row.id}
                  className="bg-slate-950 border-2 border-slate-800 hover:border-pink-500/70 rounded-2xl p-4 space-y-3 transition-colors shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-white text-sm break-words [overflow-wrap:break-word]">
                        {row.name}
                      </h4>
                      <p className="text-[11px] font-mono text-pink-400 font-bold mt-0.5 break-words">
                        {row.statute}
                      </p>
                    </div>
                    {row.commutableToCash ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500 text-[10px] font-black shrink-0">
                        CASH COMMUTABLE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[10px] font-bold shrink-0">
                        NON-CASHABLE
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                      <span className="font-bold text-amber-300 font-mono mt-0.5 block break-words">
                        {row.duration}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Pay Coverage</span>
                      <span className="font-semibold text-slate-200 mt-0.5 block break-words">
                        {row.salaryCoverage}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Beneficiary &amp; Tenure</span>
                    <p className="text-slate-300 leading-relaxed break-words [overflow-wrap:break-word]">
                      {row.beneficiary} — <span className="text-amber-200 font-semibold">{row.qualifyingTenure}</span>
                    </p>
                  </div>

                  <div className="bg-amber-950/25 border-l-3 border-amber-400 p-2.5 rounded-r-xl text-xs">
                    <span className="text-[10px] uppercase font-black text-amber-400 block">Bar Traps &amp; Key Exceptions</span>
                    <p className="text-slate-200 mt-0.5 leading-relaxed break-words [overflow-wrap:break-word]">
                      {row.keyBarExceptions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredLeaves.length === 0 && (
            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-xs">
                No leave laws match your search criteria. Try a different query or reset filters.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="print:hidden bg-slate-950 p-3.5 sm:p-4 border-t-4 border-black flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-pink-400 shrink-0" />
            <span className="hidden sm:inline">
              Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-white text-[10px]">Ctrl+P</kbd> to print this comprehensive reference table!
            </span>
            <span className="sm:hidden text-[11px]">All 8 Philippine Leave Statutes</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-transform"
            >
              <FileDown className="w-4 h-4" />
              <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrintMatrix}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Matrix</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
