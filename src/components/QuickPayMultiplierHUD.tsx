import React, { useState, useMemo } from 'react';
import {
  Calculator,
  X,
  Copy,
  Check,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Moon,
  Clock,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { marioAudio } from '../utils/audio';
import { MarioCoinIcon, MarioStarIcon } from './MarioIcons';

interface QuickPayMultiplierHUDProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDailyWage?: number;
}

export type DayScenario =
  | 'ordinary'
  | 'rest_day'
  | 'special_holiday'
  | 'special_holiday_rest_day'
  | 'regular_holiday_unworked'
  | 'regular_holiday_worked'
  | 'regular_holiday_rest_day'
  | 'double_holiday_unworked'
  | 'double_holiday_worked'
  | 'double_holiday_rest_day';

interface ScenarioMeta {
  id: DayScenario;
  label: string;
  multiplier: number;
  otMultiplier: number;
  isUnworked?: boolean;
  citation: string;
  ruleSummary: string;
}

export const SCENARIO_PRESETS: ScenarioMeta[] = [
  {
    id: 'ordinary',
    label: 'Ordinary Workday',
    multiplier: 1.0,
    otMultiplier: 1.25,
    citation: 'Art. 83 & 87 Labor Code',
    ruleSummary: 'First 8 hrs = 100%. Overtime hours = Regular hourly rate + 25%.',
  },
  {
    id: 'rest_day',
    label: 'Scheduled Rest Day',
    multiplier: 1.3,
    otMultiplier: 1.69, // 130% * 130% = 169%
    citation: 'Art. 93(a) Labor Code',
    ruleSummary: 'First 8 hrs = 130%. Overtime hours on rest day = Hourly rate on rest day + 30% (169%).',
  },
  {
    id: 'special_holiday',
    label: 'Special Non-Working Day',
    multiplier: 1.3,
    otMultiplier: 1.69,
    citation: 'Art. 93(c) & DOLE Handbook',
    ruleSummary: 'Unworked = No work, no pay. Worked first 8 hrs = 130%. OT = 169%.',
  },
  {
    id: 'special_holiday_rest_day',
    label: 'Special Day on Scheduled Rest Day',
    multiplier: 1.5,
    otMultiplier: 1.95, // 150% * 130% = 195%
    citation: 'Art. 93(c) Labor Code',
    ruleSummary: 'First 8 hrs = 150%. Overtime hours = 195%.',
  },
  {
    id: 'regular_holiday_unworked',
    label: 'Regular Holiday (Unworked)',
    multiplier: 1.0,
    otMultiplier: 0,
    isUnworked: true,
    citation: 'Art. 94(a) Labor Code',
    ruleSummary: '100% of basic daily rate provided employee is present or on paid leave on prior day.',
  },
  {
    id: 'regular_holiday_worked',
    label: 'Regular Holiday (Worked)',
    multiplier: 2.0,
    otMultiplier: 2.6, // 200% * 130% = 260%
    citation: 'Art. 94(b) Labor Code',
    ruleSummary: 'First 8 hrs = 200%. Overtime hours = 260% of regular hourly rate.',
  },
  {
    id: 'regular_holiday_rest_day',
    label: 'Regular Holiday on Scheduled Rest Day',
    multiplier: 2.6,
    otMultiplier: 3.38, // 260% * 130% = 338%
    citation: 'Art. 94 & DOLE Handbook',
    ruleSummary: 'First 8 hrs = 260%. Overtime hours = 338% of regular hourly rate.',
  },
  {
    id: 'double_holiday_unworked',
    label: 'Double Holiday (Unworked)',
    multiplier: 2.0,
    otMultiplier: 0,
    isUnworked: true,
    citation: 'Asian Transmission v. CA (G.R. 152308)',
    ruleSummary: '200% basic wage (100% per regular holiday falling on the same date).',
  },
  {
    id: 'double_holiday_worked',
    label: 'Double Holiday (Worked)',
    multiplier: 3.0,
    otMultiplier: 3.9, // 300% * 130% = 390%
    citation: 'Asian Transmission v. CA',
    ruleSummary: 'First 8 hrs = 300% (200% for first + 100% for second). OT = 390%.',
  },
  {
    id: 'double_holiday_rest_day',
    label: 'Double Holiday on Rest Day (Worked)',
    multiplier: 3.9,
    otMultiplier: 5.07, // 390% * 130% = 507%
    citation: 'Asian Transmission & DOLE Guidelines',
    ruleSummary: 'First 8 hrs = 390%. Overtime hours = 507% of regular hourly rate.',
  },
];

export const QuickPayMultiplierHUD: React.FC<QuickPayMultiplierHUDProps> = ({
  isOpen,
  onClose,
  defaultDailyWage = 645,
}) => {
  const [dailyWage, setDailyWage] = useState<number>(defaultDailyWage);
  const [selectedScenarioId, setSelectedScenarioId] = useState<DayScenario>('ordinary');
  const [otHours, setOtHours] = useState<number>(2);
  const [nightDiffHours, setNightDiffHours] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentScenario =
    SCENARIO_PRESETS.find((s) => s.id === selectedScenarioId) || SCENARIO_PRESETS[0];

  const hourlyRate = dailyWage / 8;

  // Compute breakdown
  const regularWorkPay = currentScenario.isUnworked
    ? dailyWage * currentScenario.multiplier
    : hourlyRate * 8 * currentScenario.multiplier;

  const otRate = hourlyRate * currentScenario.otMultiplier;
  const overtimePay = currentScenario.isUnworked ? 0 : otRate * otHours;

  // Night Shift Differential (10% premium on applicable rate during 10pm-6am)
  const nsdRate = hourlyRate * currentScenario.multiplier * 0.1;
  const nightDiffPay = nsdRate * nightDiffHours;

  const totalCalculatedPay = regularWorkPay + overtimePay + nightDiffPay;

  const handleCopyFormula = () => {
    const text = `DOLE Statutory Pay Computation:
Scenario: ${currentScenario.label} (${currentScenario.citation})
Base Daily Wage: ₱${dailyWage.toFixed(2)} (Hourly: ₱${hourlyRate.toFixed(2)})
• Regular (8 hrs × ${Math.round(currentScenario.multiplier * 100)}%): ₱${regularWorkPay.toFixed(2)}
• Overtime (${otHours} hrs × ${Math.round(currentScenario.otMultiplier * 100)}%): ₱${overtimePay.toFixed(2)}
• Night Diff (${nightDiffHours} hrs × 10%): ₱${nightDiffPay.toFixed(2)}
TOTAL EARNED: ₱${totalCalculatedPay.toFixed(2)}`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      marioAudio.playCoin();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="DOLE Quick Pay Multiplier Auditor"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto overscroll-contain animate-fadeIn"
    >
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl w-full max-w-2xl shadow-[0_16px_50px_rgba(0,0,0,0.9)] overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 px-4 sm:px-5 py-3 sm:py-4 border-b-4 border-black flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-emerald-400 border-2 border-black flex items-center justify-center shadow-[2px_2px_0_#000] shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase font-mario px-1.5 py-0.5 bg-slate-950 text-emerald-300 rounded">
                  RAPID MULTIPLIER AUDITOR
                </span>
                <span className="text-[11px] font-bold text-emerald-100 hidden sm:inline">
                  DOLE Handbook Standards
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase font-mario leading-tight truncate">
                Quick Pay Multiplier HUD
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Multiplier HUD"
            className="w-8 h-8 rounded-xl bg-slate-950 hover:bg-red-700 text-white border-2 border-black flex items-center justify-center cursor-pointer shadow-[2px_2px_0_#000] shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3.5 sm:p-5 space-y-3.5 flex-1 overflow-y-auto overscroll-contain min-h-0">
          {/* Base Daily Wage Input */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border-2 border-slate-800 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div>
              <label htmlFor="daily-wage-input" className="text-xs font-bold text-slate-400 block uppercase">
                Daily Basic Wage (PHP):
              </label>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-lg font-bold text-amber-400 font-mario">₱</span>
                <input
                  id="daily-wage-input"
                  type="number"
                  min="100"
                  max="10000"
                  step="5"
                  value={dailyWage}
                  onChange={(e) => setDailyWage(Math.max(0, Number(e.target.value)))}
                  className="w-28 bg-slate-900 text-white font-black text-base px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 space-y-0.5">
              <div>Hourly Rate (Wage / 8): <strong className="text-white">₱{hourlyRate.toFixed(2)}</strong></div>
              <div>Estimated Monthly (Factor 313): <strong className="text-white">₱{((dailyWage * 313) / 12).toFixed(2)}</strong></div>
            </div>
          </div>

          {/* Scenario Selector Grid */}
          <div>
            <label className="text-xs font-black text-amber-400 font-mario block mb-2 uppercase">
              Select Statutory Day Type:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SCENARIO_PRESETS.map((sc) => {
                const isSelected = sc.id === selectedScenarioId;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      setSelectedScenarioId(sc.id);
                      marioAudio.playClick();
                    }}
                    className={`p-2.5 rounded-xl text-left border-2 transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-black font-black shadow-[2px_2px_0_#000]'
                        : 'bg-slate-950 text-slate-200 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold leading-tight">{sc.label}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                        {sc.citation}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-slate-950 text-amber-300'
                          : 'bg-slate-800 text-amber-400'
                      }`}
                    >
                      {Math.round(sc.multiplier * 100)}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overtime & Night Differential Sliders */}
          {!currentScenario.isUnworked && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    Overtime Hours:
                  </span>
                  <span className="font-black text-blue-400 font-mario">{otHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={otHours}
                  onChange={(e) => setOtHours(Number(e.target.value))}
                  className="w-full accent-blue-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Rate: {Math.round(currentScenario.otMultiplier * 100)}% (₱{otRate.toFixed(2)}/hr)
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    Night Diff Hours (10PM-6AM):
                  </span>
                  <span className="font-black text-indigo-400 font-mario">{nightDiffHours} hrs</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={nightDiffHours}
                  onChange={(e) => setNightDiffHours(Number(e.target.value))}
                  className="w-full accent-indigo-400 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  +10% Premium = +₱{nsdRate.toFixed(2)}/hr
                </span>
              </div>
            </div>
          )}

          {/* Calculation Result Summary Card */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/30 border-3 border-amber-400 rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0_#000] space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
              <span className="font-black font-mario text-amber-300">
                {currentScenario.label} Breakdown
              </span>
              <span className="text-slate-400 font-bold">{currentScenario.citation}</span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                <span className="break-words [overflow-wrap:break-word] [word-break:normal]">Regular Work Pay ({currentScenario.isUnworked ? 'Unworked' : '8 hrs'} @ {Math.round(currentScenario.multiplier * 100)}%):</span>
                <span className="font-bold text-white shrink-0">₱{regularWorkPay.toFixed(2)}</span>
              </div>

              {!currentScenario.isUnworked && (
                <>
                  <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <span className="break-words [overflow-wrap:break-word] [word-break:normal]">Overtime Pay ({otHours} hrs @ {Math.round(currentScenario.otMultiplier * 100)}%):</span>
                    <span className="font-bold text-blue-300 shrink-0">₱{overtimePay.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                    <span className="break-words [overflow-wrap:break-word] [word-break:normal]">Night Shift Differential ({nightDiffHours} hrs @ +10%):</span>
                    <span className="font-bold text-indigo-300 shrink-0">₱{nightDiffPay.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
                  TOTAL STATUTORY COMPENSATION:
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 font-mario">
                  ₱{totalCalculatedPay.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyFormula}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs font-mario border-2 border-black flex items-center gap-1.5 shadow-[2px_2px_0_#000] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY FORMULA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
