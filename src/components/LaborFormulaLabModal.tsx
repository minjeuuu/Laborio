import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Moon,
  Calendar,
  X,
  FileText,
  DollarSign,
  Flame,
  Award,
  RotateCcw,
  FileDown,
} from 'lucide-react';
import { marioAudio } from '../utils/audio';
import { MarioCoinIcon, MarioMushroomIcon, MarioStarIcon } from './MarioIcons';
import { triggerPrintWithDocumentFont } from '../utils/printHelper';
import { downloadExactPreviewVisualPdfAsync } from '../utils/pdfExportService';

interface LaborFormulaLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnCoins?: (amount: number) => void;
}

export type DayClassification =
  | 'ordinary'
  | 'rest_day'
  | 'special_day'
  | 'special_day_rest_day'
  | 'regular_holiday'
  | 'regular_holiday_rest_day'
  | 'double_holiday'
  | 'double_holiday_rest_day';

interface DayConfig {
  id: DayClassification;
  label: string;
  badge: string;
  premiumMultiplier: number;
  otMultiplier: number;
  statutoryBasis: string;
  description: string;
}

const DAY_CONFIGS: Record<DayClassification, DayConfig> = {
  ordinary: {
    id: 'ordinary',
    label: 'Ordinary Working Day',
    badge: '100% BASE',
    premiumMultiplier: 1.0,
    otMultiplier: 1.25,
    statutoryBasis: 'Art. 83 & Art. 87, Labor Code',
    description: 'Regular 8-hour shift. Overtime paid at +25% (125% of regular hourly rate).',
  },
  rest_day: {
    id: 'rest_day',
    label: 'Scheduled Rest Day',
    badge: '130% BASE',
    premiumMultiplier: 1.3,
    otMultiplier: 1.69, // 1.3 * 1.3 = 1.69
    statutoryBasis: 'Art. 91 & Art. 93, Labor Code',
    description: 'Work performed on designated weekly rest day earns 130%. OT on rest day is 169% (130% × 130%).',
  },
  special_day: {
    id: 'special_day',
    label: 'Special Non-Working Holiday',
    badge: '130% BASE',
    premiumMultiplier: 1.3,
    otMultiplier: 1.69,
    statutoryBasis: 'Art. 93, Labor Code & DOLE DO 184',
    description: 'Work on Special Non-Working Day earns 130%. "No work, no pay" applies unless company policy grants pay.',
  },
  special_day_rest_day: {
    id: 'special_day_rest_day',
    label: 'Special Non-Working Day fallen on Rest Day',
    badge: '150% BASE',
    premiumMultiplier: 1.5,
    otMultiplier: 1.95, // 1.5 * 1.3 = 1.95
    statutoryBasis: 'Art. 93, Labor Code',
    description: 'Stacked premium: First 8 hours paid at 150%. Excess hours paid at 195% (150% × 130%).',
  },
  regular_holiday: {
    id: 'regular_holiday',
    label: 'Regular Holiday',
    badge: '200% BASE',
    premiumMultiplier: 2.0,
    otMultiplier: 2.6, // 2.0 * 1.3 = 2.6
    statutoryBasis: 'Art. 94, Labor Code',
    description: 'Unworked earns 100% daily wage. Worked earns 200% for first 8 hours; OT earns 260% (200% × 130%).',
  },
  regular_holiday_rest_day: {
    id: 'regular_holiday_rest_day',
    label: 'Regular Holiday fallen on Scheduled Rest Day',
    badge: '260% BASE',
    premiumMultiplier: 2.6, // 200% + 30% of 200% = 260%
    otMultiplier: 3.38, // 2.6 * 1.3 = 3.38
    statutoryBasis: 'Art. 94 & Art. 93, Labor Code',
    description: 'Premium on premium: First 8 hours paid at 260%. Excess OT hours paid at 338% (260% × 130%).',
  },
  double_holiday: {
    id: 'double_holiday',
    label: 'Double Regular Holiday (e.g. Maundy Thursday & Araw ng Kagitingan)',
    badge: '300% BASE',
    premiumMultiplier: 3.0,
    otMultiplier: 3.9, // 3.0 * 1.3 = 3.9
    statutoryBasis: 'Asian Transmission Corp. v. CA (G.R. No. 144664)',
    description: 'Worker is entitled to 200% unworked, or 300% if worked (100% basic + 100% holiday 1 + 100% holiday 2). OT earns 390%.',
  },
  double_holiday_rest_day: {
    id: 'double_holiday_rest_day',
    label: 'Double Regular Holiday on Scheduled Rest Day',
    badge: '390% BASE',
    premiumMultiplier: 3.9, // 300% + 30% of 300% = 390%
    otMultiplier: 5.07, // 3.9 * 1.3 = 5.07
    statutoryBasis: 'DOLE Advisory on Coinciding Regular Holidays',
    description: 'Maximum statutory multiplier: 390% for first 8 hours; OT paid at 507% of base hourly rate!',
  },
};

export const LaborFormulaLabModal: React.FC<LaborFormulaLabModalProps> = ({
  isOpen,
  onClose,
  onEarnCoins,
}) => {
  // Simulator inputs
  const [dailyWage, setDailyWage] = useState<number>(645); // NCR minimum wage benchmark
  const [regularHoursWorked, setRegularHoursWorked] = useState<number>(8);
  const [otHoursWorked, setOtHoursWorked] = useState<number>(2);
  const [nsdRegularHours, setNsdRegularHours] = useState<number>(3); // 10 PM - 6 AM within regular 8h
  const [nsdOtHours, setNsdOtHours] = useState<number>(1); // 10 PM - 6 AM within OT hours
  const [dayType, setDayType] = useState<DayClassification>('ordinary');
  const [unworkedRegularHoliday, setUnworkedRegularHoliday] = useState<boolean>(false);
  const [auditSuccessToast, setAuditSuccessToast] = useState<string | null>(null);

  const selectedDay = DAY_CONFIGS[dayType];
  const hourlyRate = dailyWage / 8;

  // Step-by-Step Arithmetic Computation
  const breakdown = useMemo(() => {
    if (
      unworkedRegularHoliday &&
      (dayType === 'regular_holiday' ||
        dayType === 'regular_holiday_rest_day' ||
        dayType === 'double_holiday' ||
        dayType === 'double_holiday_rest_day')
    ) {
      const holidayUnworkedMultiplier =
        dayType === 'double_holiday' || dayType === 'double_holiday_rest_day' ? 2.0 : 1.0;
      const unworkedPay = dailyWage * holidayUnworkedMultiplier;
      return {
        hourlyRate,
        regularHoursPay: unworkedPay,
        overtimePay: 0,
        regularNsdPay: 0,
        otNsdPay: 0,
        totalNsdPay: 0,
        grossShiftPay: unworkedPay,
        effectiveMultiplier: holidayUnworkedMultiplier,
        isUnworked: true,
      };
    }

    // 1. Regular 8-hour shift pay:
    // Regular Rate = hourlyRate * regularHoursWorked * premiumMultiplier
    const regularHoursPay = hourlyRate * regularHoursWorked * selectedDay.premiumMultiplier;

    // 2. Overtime Pay:
    // OT Rate = hourlyRate * otHoursWorked * otMultiplier
    const overtimePay = hourlyRate * otHoursWorked * selectedDay.otMultiplier;

    // 3. Night Shift Differential (+10% on top of governing rate):
    // Regular NSD = (hourlyRate * selectedDay.premiumMultiplier) * 0.10 * nsdRegularHours
    const regularNsdPay =
      hourlyRate * selectedDay.premiumMultiplier * 0.1 * Math.min(regularHoursWorked, nsdRegularHours);

    // OT NSD = (hourlyRate * selectedDay.otMultiplier) * 0.10 * Math.min(otHoursWorked, nsdOtHours);
    const otNsdPay =
      hourlyRate * selectedDay.otMultiplier * 0.1 * Math.min(otHoursWorked, nsdOtHours);

    const totalNsdPay = regularNsdPay + otNsdPay;
    const grossShiftPay = regularHoursPay + overtimePay + totalNsdPay;

    const base8hStandard = dailyWage;
    const effectiveMultiplier = grossShiftPay / (base8hStandard || 1);

    return {
      hourlyRate,
      regularHoursPay,
      overtimePay,
      regularNsdPay,
      otNsdPay,
      totalNsdPay,
      grossShiftPay,
      effectiveMultiplier,
      isUnworked: false,
    };
  }, [
    dailyWage,
    hourlyRate,
    regularHoursWorked,
    otHoursWorked,
    nsdRegularHours,
    nsdOtHours,
    selectedDay,
    unworkedRegularHoliday,
    dayType,
  ]);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!isOpen) return null;

  const handlePrintAuditSheet = () => {
    marioAudio.playCoin();
    onEarnCoins?.(10);
    setAuditSuccessToast('Printing DOLE Wage Audit Sheet...');
    setTimeout(() => setAuditSuccessToast(null), 3000);
    triggerPrintWithDocumentFont({
      orientation: 'portrait',
      mode: 'formula-audit',
      paperSize: 'a4',
      margin: '8mm 10mm',
    });
  };

  const handleDownloadPdf = async () => {
    const el = document.getElementById('labor-formula-audit-sheet');
    if (!el || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    marioAudio.playCoin();
    try {
      await downloadExactPreviewVisualPdfAsync(
        el,
        `DOLE-Labor-Formula-Audit-${selectedDay.id}.pdf`,
        `DOLE Labor Standards Statutory Wage & Overtime Audit Computation`,
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

  const handleResetToNCR = () => {
    marioAudio.playPipe();
    setDailyWage(645);
    setRegularHoursWorked(8);
    setOtHoursWorked(2);
    setNsdRegularHours(2);
    setNsdOtHours(0);
    setDayType('ordinary');
    setUnworkedRegularHoliday(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Interactive Labor Standards Formula Lab"
      data-testid="labor-formula-lab-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto safe-top-nav safe-bottom-dock print:static print:p-0 print:bg-white print:overflow-visible"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border-4 border-amber-400 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-slate-100 flex flex-col max-h-[92vh] overflow-hidden print:border-none print:shadow-none print:rounded-none print:bg-white print:text-black print:max-h-none print:overflow-visible">
        {/* Header */}
        <div className="print:hidden bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 p-4 sm:p-5 border-b-4 border-black text-slate-950 flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border-2 border-white flex items-center justify-center text-amber-400 shadow-[0_3px_0_#000]">
              <Calculator className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mario text-xs sm:text-sm font-black uppercase tracking-wider">
                  DOLE FORMULA LAB
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-mono text-[10px] font-bold border border-white">
                  BOOK III SIMULATOR
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 mt-0.5">
                Real-Time Step-by-Step Statutory Arithmetic & Overtime Proof Engine
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close DOLE Formula Lab"
            className="w-10 h-10 rounded-xl bg-slate-950 text-white hover:bg-red-600 flex items-center justify-center border-2 border-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 print:p-0 print:overflow-visible">
          {/* Inputs Section (Screen Only) */}
          <div className="print:hidden space-y-6">
            {/* Day Type Selector */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-amber-400 font-mario mb-2 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
              <span>1. SELECT DAY CLASSIFICATION:</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {Object.values(DAY_CONFIGS).map((cfg) => {
                const isSelected = dayType === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => {
                      setDayType(cfg.id);
                      marioAudio.playClick();
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-white shadow-[0_4px_0_#000]'
                        : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:border-amber-400/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-black font-mario uppercase px-1.5 py-0.5 rounded-md bg-slate-950/20 text-current">
                          {cfg.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />}
                      </div>
                      <span className="text-xs font-black block leading-tight">{cfg.label}</span>
                    </div>
                    <span className="text-[10px] font-semibold opacity-75 mt-2 block">
                      {cfg.statutoryBasis}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unworked Regular Holiday Checkbox (Only if Holiday) */}
          {(dayType === 'regular_holiday' ||
            dayType === 'regular_holiday_rest_day' ||
            dayType === 'double_holiday' ||
            dayType === 'double_holiday_rest_day') && (
            <div className="bg-sky-950/70 border-2 border-sky-400 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <Info className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <span className="text-xs font-black text-sky-200 block">
                    Unworked Holiday Rule (Art. 94, Labor Code)
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Did the employee take the day off with zero hours worked?
                  </span>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-sky-400/60">
                <input
                  type="checkbox"
                  checked={unworkedRegularHoliday}
                  onChange={(e) => {
                    setUnworkedRegularHoliday(e.target.checked);
                    marioAudio.playClick();
                  }}
                  className="w-4 h-4 accent-amber-400 rounded-sm cursor-pointer"
                />
                <span className="text-xs font-black text-amber-300">Unworked (100% Pay)</span>
              </label>
            </div>
          )}

          {/* Interactive Sliders & Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Wage & Base Rate */}
            <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black font-mario text-amber-300 uppercase flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>DAILY STATUTORY WAGE</span>
                </span>
                <span className="text-xs font-mono font-black text-emerald-400 bg-slate-900 px-2 py-0.5 rounded-md border border-emerald-500/40">
                  ₱{dailyWage.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="300"
                max="1500"
                step="5"
                value={dailyWage}
                onChange={(e) => setDailyWage(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>BARMM ₱361</span>
                <span>NCR Min ₱645</span>
                <span>Pro ₱1,200+</span>
              </div>

              {/* Base Derived Metrics */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 block font-bold">HOURLY RATE (÷ 8)</span>
                  <span className="text-sm font-mono font-black text-amber-300">
                    ₱{hourlyRate.toFixed(2)}/hr
                  </span>
                </div>
                <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-700/80">
                  <span className="text-[10px] text-slate-400 block font-bold">BASE MULTIPLIER</span>
                  <span className="text-sm font-mono font-black text-sky-300">
                    {(selectedDay.premiumMultiplier * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Hours, Overtime, & NSD */}
            <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-4 space-y-4">
              {/* Regular Hours */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-200 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Regular Hours Worked:</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {regularHoursWorked} hrs
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={regularHoursWorked}
                  onChange={(e) => setRegularHoursWorked(Number(e.target.value))}
                  disabled={breakdown.isUnworked}
                  className="w-full accent-amber-400 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Overtime Hours */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-200 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>Overtime Hours (Exceeding 8h):</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-rose-400">
                    +{otHoursWorked} hrs OT ({((selectedDay.otMultiplier) * 100).toFixed(0)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={otHoursWorked}
                  onChange={(e) => setOtHoursWorked(Number(e.target.value))}
                  disabled={breakdown.isUnworked}
                  className="w-full accent-rose-500 cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Night Shift Differential (10PM - 6AM) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-slate-200 flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Night Shift Differential (10PM–6AM):</span>
                  </span>
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {nsdRegularHours + nsdOtHours} hrs total (+10% NSD)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Reg Shift NSD:</span>
                    <input
                      type="number"
                      min="0"
                      max={regularHoursWorked}
                      value={nsdRegularHours}
                      onChange={(e) =>
                        setNsdRegularHours(
                          Math.max(0, Math.min(regularHoursWorked, Number(e.target.value)))
                        )
                      }
                      disabled={breakdown.isUnworked}
                      className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 block">OT Shift NSD:</span>
                    <input
                      type="number"
                      min="0"
                      max={otHoursWorked}
                      value={nsdOtHours}
                      onChange={(e) =>
                        setNsdOtHours(
                          Math.max(0, Math.min(otHoursWorked, Number(e.target.value)))
                        )
                      }
                      disabled={breakdown.isUnworked}
                      className="w-full bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DOLE Audit Computation Breakdown Card */}
        <div
            id="labor-formula-audit-sheet"
            data-testid="labor-formula-audit-sheet"
            data-printable-sheet="true"
            data-single-page="true"
            className="printable-standalone-sheet bg-slate-950 border-3 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-[0_8px_0_#000] text-slate-100 print:border-none print:shadow-none print:rounded-none print:bg-white print:text-black print:p-0"
          >
            {/* Printable Official Slip Header */}
            <div className="hidden print:block border-b-2 border-black pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-950 font-display">
                    DOLE STATUTORY WAGE &amp; OVERTIME AUDIT COMPUTATION
                  </h1>
                  <p className="text-xs font-semibold text-slate-700">
                    Republic of the Philippines · DOLE Labor Standards Audit Slip · Articles 83, 86, 87, 93 &amp; 94
                  </p>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className="font-bold text-slate-900">SUPER MARIO LABOR AID</div>
                  <div className="text-slate-600">OFFICIAL AUDIT SLIP</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-b-2 border-slate-800 print:border-black pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-400 print:text-amber-600" />
                <div>
                  <span className="text-xs font-black uppercase font-mario text-amber-300 print:text-black block">
                    STATUTORY AUDIT BREAKDOWN RECEIPT
                  </span>
                  <span className="text-[11px] text-slate-400 print:text-slate-600">
                    Republic of the Philippines · DOLE Labor Standards Audit Format
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 print:text-slate-600 block">GOVERNING BASIS:</span>
                <span className="text-xs font-black text-sky-400 print:text-sky-800">{selectedDay.statutoryBasis}</span>
              </div>
            </div>

            {/* Arithmetic Table */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">1. Regular Hours Pay</span>
                  <span className="text-[10px] text-slate-400">
                    ₱{hourlyRate.toFixed(2)} × {regularHoursWorked} hrs ×{' '}
                    {(selectedDay.premiumMultiplier * 100).toFixed(0)}%
                  </span>
                </div>
                <span className="font-black text-amber-300">
                  ₱{breakdown.regularHoursPay.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">2. Overtime Pay</span>
                  <span className="text-[10px] text-slate-400">
                    ₱{hourlyRate.toFixed(2)} × {otHoursWorked} hrs ×{' '}
                    {(selectedDay.otMultiplier * 100).toFixed(0)}%
                  </span>
                </div>
                <span className="font-black text-rose-400">
                  ₱{breakdown.overtimePay.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">
                    3. Night Shift Differential (+10% NSD)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Reg NSD: ₱{breakdown.regularNsdPay.toFixed(2)} + OT NSD: ₱
                    {breakdown.otNsdPay.toFixed(2)}
                  </span>
                </div>
                <span className="font-black text-indigo-300">
                  ₱{breakdown.totalNsdPay.toFixed(2)}
                </span>
              </div>

              {/* Total Take-Home Pay */}
              <div className="pt-3 border-t-2 border-amber-400/60 flex items-center justify-between text-sm sm:text-base">
                <div>
                  <span className="font-mario text-xs sm:text-sm font-black text-amber-400 block">
                    TOTAL SHIFT EARNINGS:
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    Effective Yield: {breakdown.effectiveMultiplier.toFixed(2)}x Base Daily Wage
                  </span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  ₱{breakdown.grossShiftPay.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Statutory Reference Quote */}
            <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-amber-400/40 text-[11px] text-slate-300">
              <span className="font-bold text-amber-400 block mb-0.5">
                Statutory DOLE Rule / Supreme Court Doctrine:
              </span>
              <p className="italic">{selectedDay.description}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="print:hidden bg-slate-950 p-3.5 sm:p-4 border-t-4 border-black flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleResetToNCR}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Reset to NCR Default</span>
            </button>
            {auditSuccessToast && (
              <span className="text-xs font-bold text-emerald-400 animate-pulse">
                {auditSuccessToast}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex-1 sm:flex-initial px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5 text-center transition-transform"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              <span className="truncate">{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrintAuditSheet}
              className="flex-1 sm:flex-initial px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] flex items-center justify-center gap-1.5 cursor-pointer active:translate-y-0.5 text-center"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span className="truncate">Print DOLE Audit Sheet</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 cursor-pointer text-center"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
