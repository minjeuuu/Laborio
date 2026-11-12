import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  Printer,
  X,
  FileText,
  ChevronRight,
  ChevronLeft,
  Award,
  Zap,
  RotateCcw,
  Check,
  FileDown,
} from 'lucide-react';
import { marioAudio } from '../utils/audio';
import { MarioCoinIcon, MarioStarIcon, MarioPeachCrownIcon } from './MarioIcons';
import { triggerPrintWithDocumentFont } from '../utils/printHelper';
import { downloadExactPreviewVisualPdfAsync } from '../utils/pdfExportService';

interface BarIssueSpotterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnCoins?: (amount: number) => void;
}

export interface BarEssayScenario {
  id: string;
  worldTag: string;
  title: string;
  yearBenchmark: string;
  factPattern: string;
  callOfTheQuestion: string;
  issuesToSpot: string[];
  keyDoctrines: string[];
  modelALACAnswer: {
    answer: string;
    legalBasis: string;
    application: string;
    conclusion: string;
  };
  barExaminerRubric: {
    issueSpotting: number; // 25%
    legalBasisCitation: number; // 35%
    logicalApplication: number; // 30%
    clarityAndALACFormat: number; // 10%
  };
}

export const BAR_ESSAY_SCENARIOS: BarEssayScenario[] = [
  {
    id: 'contracting_food_rider',
    worldTag: 'World 3: Wages & Contracting',
    title: 'The Food App Delivery Rider & Disciplinary Fines',
    yearBenchmark: '2024–2025 Hernando / Caguioa Bar Format',
    factPattern:
      'SpeedyBite is an online food-delivery application. Rico registered as a delivery rider using his own motorcycle and smartphone. SpeedyBite required Rico to wear a company-branded helmet and jacket, follow algorithmic delivery routes, and maintain a minimum customer satisfaction rating of 95%. When Rico declined three consecutive orders during heavy rain, SpeedyBite imposed a 30-day suspension and deducted ₱2,500 from his digital wallet as "administrative non-compliance penalties." Rico filed a complaint for illegal deduction and illegal suspension before the Labor Arbiter. SpeedyBite moved to dismiss, claiming Rico is an independent contractor, pointing to a service agreement declaring "no employer-employee relationship exists."',
    callOfTheQuestion:
      'Is Rico an employee or an independent contractor? Are the wage deductions and suspension legally valid under the Labor Code and DOLE regulations? Decide with reasons.',
    issuesToSpot: [
      'Four-Fold Test vs Economic Reality Test',
      'Control Test over Means and Methods (Algorithmic Control)',
      'Substantial Capital vs Tools of the Trade (Motorcycle & Phone)',
      'Prohibition on Unlawful Deductions (Art. 113)',
      'DOLE D.O. 174 & Labor-Only Contracting Prohibitions',
    ],
    keyDoctrines: [
      'Control Test (Sonza v. ABS-CBN; Fuji Television v. Espiritu)',
      'Economic Dependence Test (Francisco v. NLRC)',
      'Art. 113 Prohibited Wage Deductions',
      'Art. 106 Labor-Only Contracting',
    ],
    modelALACAnswer: {
      answer:
        'Rico is a regular employee of SpeedyBite, and both the wage deductions and 30-day suspension are legally void.',
      legalBasis:
        'Under Philippine jurisprudence, the existence of an employer-employee relationship is determined primarily by the Four-Fold Test, where the Control Test is paramount (Sonza v. ABS-CBN; Fuji TV v. Espiritu). Furthermore, the Two-Tiered Test combines the control test with the Economic Reality Test (Francisco v. NLRC). Under Article 113 of the Labor Code, no employer may make any deduction from the wages of an employee except for statutory deductions (SSS/PhilHealth/tax) or with explicit written employee authorization for mutual death benefits. Under Article 106 and DOLE D.O. No. 174-17, contracting out without substantial capital and control results in a finding of direct employment.',
      application:
        'Here, SpeedyBite exercised pervasive algorithmic control by dictating delivery routes, customer satisfaction quotas, and imposing disciplinary suspensions. A standard contract clause disclaiming employment is void as employment status is determined by law, not contract stipulations. Furthermore, Rico merely provided a motorcycle and smartphone, which do not constitute substantial capital under DOLE D.O. 174. Lastly, deducting ₱2,500 unilaterally violates Article 113 because it does not fall under any recognized statutory exception.',
      conclusion:
        'Therefore, Rico is an employee of SpeedyBite entitled to full labor standards protection, the refund of the ₱2,500 illegal deduction with legal interest, and backwages for the period of illegal suspension.',
    },
    barExaminerRubric: {
      issueSpotting: 25,
      legalBasisCitation: 35,
      logicalApplication: 30,
      clarityAndALACFormat: 10,
    },
  },
  {
    id: 'compressed_workweek_holiday',
    worldTag: 'World 1: Hours of Work & Overtime',
    title: 'The 4-Day Compressed Workweek & Holiday Coincidence',
    yearBenchmark: '2023–2024 Bar Standards',
    factPattern:
      'A software engineering company in Taguig implemented a 4-day Compressed Workweek (CWW) schedule of 10 hours daily (Monday through Thursday) pursuant to a mutual agreement between management and employees and submitted to DOLE. On a Monday that coincided with National Heroes Day (a Regular Holiday), Mario was required to work his full 10-hour shift. The company paid him 200% of his daily wage for the entire 10 hours, arguing that under a CWW, the daily wage covers 10 hours of work without overtime.',
    callOfTheQuestion:
      'Did the company correctly compensate Mario for his 10-hour shift on the Regular Holiday? Explain the applicable statutory formula under Articles 83, 87, and 94 of the Labor Code.',
    issuesToSpot: [
      'Validity of Compressed Workweek (Art. 83 DOLE Advisory No. 2, Series of 2004)',
      'Daily 8-Hour Threshold vs 10-Hour CWW Agreement',
      'Regular Holiday 200% Multiplier (Art. 94)',
      'Overtime Compensation on Holiday (260% after 8 hours vs after 10 hours)',
    ],
    keyDoctrines: [
      'DOLE Advisory No. 2, Series of 2004 (Compressed Workweek Scheme)',
      'Article 87 (Overtime Work)',
      'Article 94 (Right to Holiday Pay)',
    ],
    modelALACAnswer: {
      answer:
        'No, the company failed to fully compensate Mario. While the 10-hour daily schedule is valid under a DOLE-approved CWW, the excess 2 hours on a worked Regular Holiday must be compensated with statutory overtime premiums.',
      legalBasis:
        'Under DOLE Department Advisory No. 2 (Series of 2004), a valid CWW waives the daily 8-hour overtime premium up to 12 hours per day only for normal working days. However, under Article 94 of the Labor Code and DOLE holiday pay rules, when an employee works on a Regular Holiday, the first 8 hours are paid at 200% of the hourly rate, and work in excess of the normal daily shift must be paid with an additional 30% overtime premium (i.e. 260% of regular hourly rate).',
      application:
        'In this case, Mario was entitled to 200% for the first 10 hours if the CWW base is applied, but any statutory overtime computation requires that excess hours bear the full holiday premium multiplier of 260%. Paying a flat daily rate without breaking down the hourly holiday premium violates mandatory labor standards.',
      conclusion:
        'The company must pay Mario 200% of his hourly rate for the first 8 hours, and 260% of his hourly rate for the 9th and 10th hours, plus applicable night shift differential if any portion fell between 10 PM and 6 AM.',
    },
    barExaminerRubric: {
      issueSpotting: 25,
      legalBasisCitation: 35,
      logicalApplication: 30,
      clarityAndALACFormat: 10,
    },
  },
  {
    id: 'solo_parent_maternity_leaves',
    worldTag: 'World 6: Statutory Leaves',
    title: 'The Solo Mother Maternity & SIL Stacking Dispute',
    yearBenchmark: '2024 Bar High-Yield Leaves',
    factPattern:
      'Princess Peach, an unmarried senior graphic designer with 3 years of service at Koopa Media, gave live birth to a child. As a solo parent certified under R.A. No. 11861, she applied for 120 days of paid maternity leave. Management approved 105 days under R.A. No. 11210 but denied the additional 15 days, asserting that the 15-day solo parent extension applies only to minimum wage earners. Furthermore, management forfeited her 5-day accrued Service Incentive Leave (SIL) for the year, claiming that taking 105 days off work disqualified her from SIL for failure to render "one year of service."',
    callOfTheQuestion:
      'Are the management actions valid? Discuss the statutory leave entitlements under R.A. No. 11210, R.A. No. 11861, and Article 95 of the Labor Code.',
    issuesToSpot: [
      '105-day Base Maternity Leave under R.A. 11210',
      '15-day Mandatory Extension for Solo Parents (R.A. 11861) regardless of wage bracket',
      'Service Incentive Leave (Art. 95) "One Year of Service" Definition',
      'Authorized Leaves count toward cumulative 1-year service (Auto Bus Transport doctrine)',
    ],
    keyDoctrines: [
      'R.A. No. 11210 (105-Day Expanded Maternity Leave Law)',
      'R.A. No. 11861 (Expanded Solo Parents Welfare Act)',
      'Art. 95, Labor Code & Omnibus Rules (Service Incentive Leave)',
      'Auto Bus Transport Systems v. Bautista (G.R. No. 156367)',
    ],
    modelALACAnswer: {
      answer:
        'Both management actions are unlawful. Princess Peach is entitled to 120 days of paid maternity leave, and her 5-day Service Incentive Leave (SIL) was unlawfully forfeited.',
      legalBasis:
        'Under Section 3 of R.A. No. 11210 in relation to Section 7 of R.A. No. 11861 (Expanded Solo Parents Welfare Act), female workers who qualify as solo parents are entitled to an additional 15 days of paid maternity leave, yielding a total of 120 days for live birth, regardless of their wage bracket or rank. Furthermore, under Article 95 of the Labor Code and the landmark doctrine in Auto Bus Transport Systems v. Bautista, "one year of service" includes authorized paid and unpaid absences. SIL is a mandatory annual statutory benefit that commutes to cash if unused.',
      application:
        'Management erred in restricting the 15-day solo parent leave to minimum wage earners, as R.A. 11210 grants the extension universally to all certified solo parents. Additionally, Peach’s approved maternity leave constitutes authorized statutory leave, which cannot be penalized by stripping her accrued SIL.',
      conclusion:
        'Management must grant Peach the full 120 days of paid maternity leave and reinstate or commute into cash her 5 days of Service Incentive Leave.',
    },
    barExaminerRubric: {
      issueSpotting: 25,
      legalBasisCitation: 35,
      logicalApplication: 30,
      clarityAndALACFormat: 10,
    },
  },
];

export const BarIssueSpotterModal: React.FC<BarIssueSpotterModalProps> = ({
  isOpen,
  onClose,
  onEarnCoins,
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(180); // 3 minutes default
  const [timerRunning, setTimerRunning] = useState(false);
  const [studentAnswerText, setStudentAnswerText] = useState('');
  const [spottedIssues, setSpottedIssues] = useState<Record<string, boolean>>({});
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const scenario = BAR_ESSAY_SCENARIOS[selectedScenarioIndex];

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      marioAudio.playQuizTimeout();
      setFeedbackToast('Time is UP for this Bar Question! Review your answer!');
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Keyword spotter in student text
  const detectedKeywords = useMemo(() => {
    if (!studentAnswerText.trim()) return [];
    const lower = studentAnswerText.toLowerCase();
    const hits: string[] = [];
    scenario.keyDoctrines.forEach((doc) => {
      const matchWord = doc.toLowerCase().split(/[\s,()]+/)[0];
      if (lower.includes(matchWord) && matchWord.length > 3) {
        hits.push(doc);
      }
    });
    return hits;
  }, [studentAnswerText, scenario.keyDoctrines]);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!isOpen) return null;

  const handleToggleIssue = (issue: string) => {
    const nextState = !spottedIssues[issue];
    setSpottedIssues((prev) => ({ ...prev, [issue]: nextState }));
    if (nextState) {
      marioAudio.playCoin();
      onEarnCoins?.(5);
    }
  };

  const handleRevealAnswer = () => {
    setShowModelAnswer(true);
    marioAudio.playPowerUp();
    onEarnCoins?.(15);
  };

  const handlePrintMockBar = () => {
    setShowModelAnswer(true);
    marioAudio.playCoin();
    setTimeout(() => {
      triggerPrintWithDocumentFont({
        orientation: 'portrait',
        mode: 'bar-essay',
        paperSize: 'a4',
        margin: '8mm 10mm',
      });
    }, 50);
  };

  const handleDownloadPdf = async () => {
    setShowModelAnswer(true);
    marioAudio.playCoin();
    setTimeout(async () => {
      const el = document.getElementById('bar-essay-solution-sheet');
      if (!el || isDownloadingPdf) return;
      setIsDownloadingPdf(true);
      try {
        await downloadExactPreviewVisualPdfAsync(
          el,
          `Bar-Mock-Solution-${scenario.id}.pdf`,
          `Philippine Bar Exam Mock Solution - ${scenario.title}`,
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
    }, 50);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Philippine Bar Exam Issue Spotter & Essay Simulator"
      data-testid="bar-issue-spotter-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs overflow-y-auto safe-top-nav safe-bottom-dock print:static print:p-0 print:bg-white print:overflow-visible"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border-4 border-amber-400 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-slate-100 flex flex-col max-h-[92vh] overflow-hidden print:border-none print:shadow-none print:rounded-none print:bg-white print:text-black print:max-h-none print:overflow-visible">
        {/* Header */}
        <div className="print:hidden bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 p-4 sm:p-5 border-b-4 border-black text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border-2 border-white flex items-center justify-center text-amber-400 shadow-[0_3px_0_#000]">
              <BookOpen className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mario text-xs sm:text-sm font-black uppercase tracking-wider">
                  BAR ESSAY SIMULATOR
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-amber-300 font-mono text-[10px] font-bold border border-white">
                  ALAC FORMAT
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200 mt-0.5">
                Supreme Court Bar Examination Timed Issue Spotter & Answer Pad
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Bar Essay Simulator"
            className="w-10 h-10 rounded-xl bg-slate-950 text-white hover:bg-red-600 flex items-center justify-center border-2 border-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Question Selector & Timer Bar */}
        <div className="print:hidden bg-slate-950 p-3 px-4 border-b-2 border-slate-800 flex items-center justify-between gap-3 flex-wrap text-xs">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={selectedScenarioIndex === 0}
              onClick={() => {
                setSelectedScenarioIndex((i) => Math.max(0, i - 1));
                setShowModelAnswer(false);
                setStudentAnswerText('');
                setTimerSeconds(180);
                setTimerRunning(false);
                marioAudio.playClick();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mario text-[11px] text-amber-400 font-bold">
              PROBLEM {selectedScenarioIndex + 1} OF {BAR_ESSAY_SCENARIOS.length}
            </span>
            <button
              type="button"
              disabled={selectedScenarioIndex === BAR_ESSAY_SCENARIOS.length - 1}
              onClick={() => {
                setSelectedScenarioIndex((i) =>
                  Math.min(BAR_ESSAY_SCENARIOS.length - 1, i + 1)
                );
                setShowModelAnswer(false);
                setStudentAnswerText('');
                setTimerSeconds(180);
                setTimerRunning(false);
                marioAudio.playClick();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 cursor-pointer text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Bar Timer */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1 rounded-xl">
              <Clock className="w-4 h-4 text-amber-400" />
              <span
                className={`font-mono text-xs font-black ${
                  timerSeconds < 30 ? 'text-red-400 animate-pulse' : 'text-amber-300'
                }`}
              >
                {formatTimer(timerSeconds)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setTimerRunning(!timerRunning);
                marioAudio.playClick();
              }}
              className={`px-3 py-1 rounded-xl font-bold text-xs cursor-pointer ${
                timerRunning
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {timerRunning ? 'Pause' : 'Start Timer'}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 print:p-0 print:overflow-visible">
          {/* Interactive Problem Header (Screen Only) */}
          <div className="print:hidden bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <span className="text-xs font-black text-amber-400 font-mario uppercase">
                {scenario.worldTag}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                {scenario.yearBenchmark}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mb-2 break-words [overflow-wrap:break-word] [word-break:normal]">{scenario.title}</h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-700 font-serif break-words [overflow-wrap:break-word] [word-break:normal]">
              {scenario.factPattern}
            </p>
            <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-bold break-words [overflow-wrap:break-word] [word-break:normal]">
              <span className="text-amber-400 font-mario text-[10px] block mb-1">
                CALL OF THE QUESTION:
              </span>
              {scenario.callOfTheQuestion}
            </div>
          </div>

          {/* Interactive Issue Spotter Checklist (Screen Only) */}
          <div className="print:hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase text-amber-300 font-mario flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SPOT THE CONTROLLING ISSUES (Click to Check):</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold">
                +{Object.values(spottedIssues).filter(Boolean).length * 5} Coins Earned
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scenario.issuesToSpot.map((issue) => {
                const isChecked = Boolean(spottedIssues[issue]);
                return (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => handleToggleIssue(issue)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer break-words [overflow-wrap:break-word] [word-break:normal] ${
                      isChecked
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-sm'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="break-words [overflow-wrap:break-word] [word-break:normal]">{issue}</span>
                    {isChecked ? (
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-slate-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Student Answer Scratchpad (Screen Only) */}
          <div className="print:hidden">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black uppercase text-slate-200 font-mario flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>YOUR TRIAL ANSWER (ALAC DRAFT):</span>
              </label>
              {detectedKeywords.length > 0 && (
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{detectedKeywords.length} Precedent(s) Detected!</span>
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={studentAnswerText}
              onChange={(e) => setStudentAnswerText(e.target.value)}
              placeholder="Draft your answer using ALAC: 1. Categorical Answer -> 2. Legal Basis -> 3. Application of Facts -> 4. Conclusion..."
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden"
            />
          </div>

          {/* Reveal Button for Screen (if not yet revealed) */}
          {!showModelAnswer && (
            <div className="print:hidden text-center py-4 bg-slate-950/60 rounded-2xl border-2 border-dashed border-slate-700">
              <p className="text-xs text-slate-400 mb-2 font-semibold">
                Finished drafting your answer? Reveal the official Supreme Court Bar solution!
              </p>
              <button
                type="button"
                onClick={handleRevealAnswer}
                className="w-full sm:w-auto max-w-full px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm font-display uppercase tracking-wide border-2 border-black shadow-[0_3px_0_#000] cursor-pointer active:translate-y-0.5 inline-flex items-center justify-center gap-2"
              >
                <span>Reveal Suggested ALAC Answer (+15 Coins)</span>
              </button>
            </div>
          )}

          {/* Model ALAC Answer & Comprehensive Printable Sheet (Always in DOM for print) */}
          <div
            id="bar-essay-solution-sheet"
            data-testid="bar-essay-solution-sheet"
            data-printable-sheet="true"
            data-single-page="true"
            className={`printable-standalone-sheet bg-slate-950 border-3 border-amber-400 rounded-3xl p-5 space-y-4 text-slate-100 shadow-[0_8px_0_#000] print:border-none print:shadow-none print:rounded-none print:bg-white print:text-black print:p-0 ${
              showModelAnswer ? 'block' : 'hidden print:block'
            }`}
          >
            {/* Printable Official Header */}
            <div className="hidden print:block border-b-2 border-black pb-3 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-black uppercase tracking-tight text-slate-950 font-display">
                    SUPREME COURT BAR EXAMINATION MOCK SOLUTION
                  </h1>
                  <p className="text-xs font-semibold text-slate-700">
                    Philippine Labor Standards &amp; Social Legislation · {scenario.worldTag} · {scenario.yearBenchmark}
                  </p>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className="font-bold text-slate-900">SUPER MARIO LABOR AID</div>
                  <div className="text-slate-600">OFFICIAL ALAC BENCHMARK</div>
                </div>
              </div>
            </div>

            {/* Printable Problem Fact Pattern & Call */}
            <div className="hidden print:block bg-slate-50 p-3.5 rounded-xl border border-slate-300 mb-3 text-slate-900 text-xs">
              <div className="font-black text-sm uppercase mb-1 text-slate-950 font-display">{scenario.title}</div>
              <p className="font-serif italic mb-2 leading-relaxed text-slate-800">{scenario.factPattern}</p>
              <div className="p-2 rounded-lg bg-amber-100 border border-amber-300 text-amber-950 font-bold text-xs">
                <span className="font-black">CALL OF THE QUESTION: </span>{scenario.callOfTheQuestion}
              </div>
            </div>

            {/* If Student Drafted an Answer, show it on print */}
            {studentAnswerText.trim() && (
              <div className="hidden print:block p-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-xs mb-3">
                <span className="font-black text-[11px] uppercase tracking-wider text-slate-700 block mb-1">
                  EXAMINEE DRAFT ANSWER SUBMISSION:
                </span>
                <p className="font-serif whitespace-pre-wrap leading-relaxed text-slate-800 italic">
                  {studentAnswerText}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between border-b-2 border-slate-800 print:border-black pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400 print:text-amber-600" />
                <span className="font-mario text-xs sm:text-sm font-black text-amber-300 print:text-black">
                  OFFICIAL SUGGESTED BAR ANSWER (ALAC)
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 print:text-emerald-800 font-bold bg-slate-900 print:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-500/40 print:border-emerald-300">
                100% BENCHMARK SOLUTION
              </span>
            </div>

            {/* 1. Answer */}
            <div className="bg-slate-900/90 print:bg-slate-50 p-3 rounded-xl border border-slate-800 print:border-slate-300">
              <span className="text-[10px] font-black text-amber-400 print:text-amber-800 font-mario block mb-1">
                [A] ANSWER (CATEGORICAL DIRECT RESPONSE):
              </span>
              <p className="text-xs text-slate-200 print:text-slate-900 font-bold leading-relaxed">
                {scenario.modelALACAnswer.answer}
              </p>
            </div>

            {/* 2. Legal Basis */}
            <div className="bg-slate-900/90 print:bg-slate-50 p-3 rounded-xl border border-slate-800 print:border-slate-300">
              <span className="text-[10px] font-black text-sky-400 print:text-sky-800 font-mario block mb-1">
                [L] LEGAL BASIS (STATUTE, DOLE ORDER & PRECEDENTS):
              </span>
              <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed font-serif">
                {scenario.modelALACAnswer.legalBasis}
              </p>
            </div>

            {/* 3. Application */}
            <div className="bg-slate-900/90 print:bg-slate-50 p-3 rounded-xl border border-slate-800 print:border-slate-300">
              <span className="text-[10px] font-black text-purple-400 print:text-purple-800 font-mario block mb-1">
                [A] APPLICATION (FACTUAL SUBSUMPTION):
              </span>
              <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed font-serif">
                {scenario.modelALACAnswer.application}
              </p>
            </div>

            {/* 4. Conclusion */}
            <div className="bg-slate-900/90 print:bg-slate-50 p-3 rounded-xl border border-slate-800 print:border-slate-300">
              <span className="text-[10px] font-black text-emerald-400 print:text-emerald-800 font-mario block mb-1">
                [C] CONCLUSION (DISPOSITION):
              </span>
              <p className="text-xs text-emerald-200 print:text-slate-900 font-bold leading-relaxed">
                {scenario.modelALACAnswer.conclusion}
              </p>
            </div>

            {/* Bar Examiner Rubric */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 print:border-slate-300 text-[10px] text-center font-mono">
              <div className="bg-slate-900 print:bg-slate-100 p-2 rounded-lg border border-slate-800 print:border-slate-300">
                <span className="text-slate-400 print:text-slate-600 block">Issue Spotting:</span>
                <span className="text-amber-400 print:text-amber-700 font-bold">25%</span>
              </div>
              <div className="bg-slate-900 print:bg-slate-100 p-2 rounded-lg border border-slate-800 print:border-slate-300">
                <span className="text-slate-400 print:text-slate-600 block">Legal Basis:</span>
                <span className="text-sky-400 print:text-sky-700 font-bold">35%</span>
              </div>
              <div className="bg-slate-900 print:bg-slate-100 p-2 rounded-lg border border-slate-800 print:border-slate-300">
                <span className="text-slate-400 print:text-slate-600 block">Application:</span>
                <span className="text-purple-400 print:text-purple-700 font-bold">30%</span>
              </div>
              <div className="bg-slate-900 print:bg-slate-100 p-2 rounded-lg border border-slate-800 print:border-slate-300">
                <span className="text-slate-400 print:text-slate-600 block">Clarity & ALAC:</span>
                <span className="text-emerald-400 print:text-emerald-700 font-bold">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="print:hidden bg-slate-950 p-3.5 sm:p-4 border-t-4 border-black flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {feedbackToast && (
              <span className="text-xs font-bold text-amber-300 animate-pulse truncate">
                {feedbackToast}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="w-full sm:w-auto px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] flex items-center justify-center gap-1.5 cursor-pointer text-center active:translate-y-0.5 transition-transform"
            >
              <FileDown className="w-4 h-4 shrink-0" />
              <span className="truncate">{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrintMockBar}
              className="w-full sm:w-auto px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm border-2 border-black shadow-[0_3px_0_#000] flex items-center justify-center gap-1.5 cursor-pointer text-center active:translate-y-0.5"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span className="truncate">Print Bar Mock Solution</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 cursor-pointer text-center active:translate-y-0.5"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
