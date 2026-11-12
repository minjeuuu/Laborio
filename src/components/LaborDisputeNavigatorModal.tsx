import React, { useState } from 'react';
import {
  X,
  Compass,
  Printer,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  Layers,
  FileText,
  Clock,
  Sparkles,
  FileDown,
} from 'lucide-react';
import {
  FORUM_JURISDICTIONS,
  DISPUTE_SCENARIOS,
  ForumJurisdictionId,
  DisputeScenario,
} from '../utils/laborDisputeNavigator';
import { marioAudio } from '../utils/marioAudio';
import { triggerCoinParticles } from '../utils/coinRushGame';
import { triggerPrintWithDocumentFont } from '../utils/printHelper';
import { downloadExactPreviewVisualPdfAsync } from '../utils/pdfExportService';

interface LaborDisputeNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEarnCoins?: (amount: number) => void;
}

export function LaborDisputeNavigatorModal({
  isOpen,
  onClose,
  onEarnCoins,
}: LaborDisputeNavigatorModalProps) {
  const [activeTab, setActiveTab] = useState<'case_routing' | 'decision_tree' | 'forums_matrix'>('case_routing');
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedForum, setSelectedForum] = useState<ForumJurisdictionId | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [activeDetailForum, setActiveDetailForum] = useState<ForumJurisdictionId>('nlrc_labor_arbiter');

  if (!isOpen) return null;

  const currentScenario: DisputeScenario = DISPUTE_SCENARIOS[currentScenarioIndex % DISPUTE_SCENARIOS.length];

  // Options: Correct forum + distractor fora
  const availableChoices: ForumJurisdictionId[] = [
    currentScenario.correctForumId,
    ...currentScenario.distractorForumIds,
  ].sort();

  const handleSelectForum = (forumId: ForumJurisdictionId) => {
    if (isAnswered) return;
    setSelectedForum(forumId);
    setIsAnswered(true);

    const isCorrect = forumId === currentScenario.correctForumId;
    if (isCorrect) {
      marioAudio.playStageClear();
      setScore((s) => s + 1);
      onEarnCoins?.(15);
      triggerCoinParticles(16);
    } else {
      marioAudio.playBowserFall();
    }
  };

  const handleNextScenario = () => {
    setSelectedForum(null);
    setIsAnswered(false);
    setCurrentScenarioIndex((prev) => (prev + 1) % DISPUTE_SCENARIOS.length);
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handlePrint = () => {
    marioAudio.playPowerUp();
    triggerPrintWithDocumentFont({
      orientation: 'landscape',
      mode: 'dispute-flowchart',
      paperSize: 'a4',
      margin: '6mm 8mm',
    });
  };

  const handleDownloadPdf = async () => {
    const el = document.getElementById('labor-dispute-flowchart-sheet');
    if (!el || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    marioAudio.playPowerUp();
    try {
      await downloadExactPreviewVisualPdfAsync(
        el,
        'Philippine-Labor-Dispute-Jurisdiction-Flowchart.pdf',
        'Philippine Labor Dispute Jurisdiction & Procedure Flowchart',
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
      aria-label="Philippine Labor Dispute & Jurisdiction Navigator"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain animate-fadeIn print:static print:p-0 print:bg-white print:overflow-visible"
    >
      <div className="print:hidden bg-slate-900 border-4 border-amber-400 rounded-3xl w-full max-w-4xl max-h-[92vh] my-auto flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-4 sm:px-6 py-3.5 border-b-4 border-black flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0_#000]">
              <Scale className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-xs font-black uppercase font-mario px-2 py-0.5 bg-slate-950 text-amber-300 rounded-md">
                  JURISDICTION NAVIGATOR
                </span>
                <span className="text-[11px] font-bold text-amber-200 hidden sm:inline">
                  SENA · DOLE Art. 128/129 · NLRC · VA
                </span>
              </div>
              <h2 className="text-sm sm:text-lg font-black tracking-tight leading-tight uppercase font-display truncate max-w-[200px] sm:max-w-md">
                Labor Dispute Jurisdiction &amp; Procedure
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              title="Download Labor Dispute Flowchart PDF"
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-transform"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">{isDownloadingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              title="Print Labor Dispute Flowchart"
              className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-slate-950 hover:bg-slate-900 text-amber-300 font-bold text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_#000] inline-flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Flowchart</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Jurisdiction Navigator"
              className="w-9 h-9 rounded-xl bg-red-700 hover:bg-red-600 text-white border-2 border-black flex items-center justify-center cursor-pointer shadow-[2px_2px_0_#000] active:translate-y-0.5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-950/80 px-3 sm:px-4 py-2 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setActiveTab('case_routing');
                marioAudio.playCoin();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'case_routing'
                  ? 'bg-amber-400 text-slate-950 border-black shadow-[2px_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>Interactive Case Routing Lab</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('decision_tree');
                marioAudio.playCoin();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'decision_tree'
                  ? 'bg-amber-400 text-slate-950 border-black shadow-[2px_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 shrink-0" />
              <span>Procedural Decision Tree</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('forums_matrix');
                marioAudio.playCoin();
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'forums_matrix'
                  ? 'bg-amber-400 text-slate-950 border-black shadow-[2px_2px_0_#000]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>Forum Master Catalog</span>
            </button>
          </div>

          {activeTab === 'case_routing' && (
            <span className="text-xs font-bold text-amber-300 bg-slate-900 border border-amber-400/40 px-2.5 py-1 rounded-lg shrink-0">
              Score: {score}
            </span>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'case_routing' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Scenario Facts Card */}
              <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-4 sm:p-6 space-y-3.5 shadow-md">
                <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                  <span>DISPUTE CASE #{currentScenarioIndex + 1} OF {DISPUTE_SCENARIOS.length}</span>
                  <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    {currentScenario.parties}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                  {currentScenario.title}
                </h3>

                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-700 text-xs text-slate-200 leading-relaxed space-y-2">
                  <p>{currentScenario.facts}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-amber-300 border-t border-slate-800">
                    <span>Claim: {currentScenario.claimAmount}</span>
                    <span>·</span>
                    <span>Reinstatement Prayed For: {currentScenario.hasReinstatement ? 'YES' : 'NO'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-bold">
                  Which tribunal or administrative body has primary original jurisdiction to adjudicate this dispute?
                </p>

                {/* Forum Choice Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {availableChoices.map((forumId) => {
                    const forum = FORUM_JURISDICTIONS[forumId];
                    const isSelected = selectedForum === forumId;
                    const isCorrect = forumId === currentScenario.correctForumId;

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
                        key={forumId}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectForum(forumId)}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${btnClass}`}
                      >
                        <div className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                          {forum.badge}
                        </div>
                        <div className="font-bold text-xs sm:text-sm">
                          {forum.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Legal Explanation & Doctrine Reveal */}
              {isAnswered && (
                <div className="bg-slate-950 border-2 border-amber-400/80 rounded-2xl p-4 sm:p-5 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    {selectedForum === currentScenario.correctForumId ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span>CORRECT TRIBUNAL! +15 Coins Awarded!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        <span>INCORRECT FORUM! Proper Forum: {FORUM_JURISDICTIONS[currentScenario.correctForumId].name}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl space-y-1">
                      <div className="font-mono text-amber-300 font-semibold">
                        Controlling Statute: {currentScenario.statutoryBasis}
                      </div>
                      <p className="text-slate-200 leading-relaxed">
                        {currentScenario.governingDoctrine}
                      </p>
                    </div>

                    <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200">
                      <span className="font-bold text-amber-300">Critical Bar Exam Distinction: </span>
                      {currentScenario.criticalAnalysis}
                    </div>

                    <div className="text-[11px] font-mono text-cyan-300">
                      Landmark Precedent: {currentScenario.supremeCourtPrecedent}
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end">
                    <button
                      type="button"
                      onClick={handleNextScenario}
                      className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0_#000] inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Next Case Scenario</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'decision_tree' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-black text-amber-300 font-mario uppercase">
                  PHILIPPINE LABOR DISPUTE PROCEDURAL DECISION TREE
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Step-by-step statutory routing algorithm tested on the Philippine Bar Examinations:
                </p>

                <div className="space-y-3 pt-2">
                  {/* Step 1: SENA */}
                  <div className="bg-slate-900 border-l-4 border-amber-400 p-3 rounded-r-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-mono">
                        STEP 1
                      </span>
                      <span className="font-bold text-xs text-white">
                        Mandatory Single Entry Approach (SENA) Conciliation
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      All labor disputes must undergo 30 calendar days of conciliation-mediation before a SEADO (R.A. 10396). If a voluntary compromise agreement is reached, it is final and binding. If unresolved, SEADO issues a Referral Notice to the appropriate tribunal below.
                    </p>
                  </div>

                  {/* Step 2: Branching */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                    <div className="bg-slate-900 border-l-4 border-rose-500 p-3 rounded-r-xl space-y-1">
                      <span className="text-[10px] font-mono text-rose-400 font-bold block">BRANCH A · NLRC LABOR ARBITER</span>
                      <h4 className="font-bold text-xs text-white">Art. 224 [formerly Art. 217]</h4>
                      <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                        <li>Illegal Dismissal (termination disputes)</li>
                        <li>Money claims &gt; ₱5,000</li>
                        <li>Any claim with prayer for reinstatement</li>
                        <li>Unfair Labor Practices (ULP)</li>
                        <li>Damages arising from E-ER</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900 border-l-4 border-emerald-500 p-3 rounded-r-xl space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold block">BRANCH B · DOLE REGIONAL DIRECTOR</span>
                      <h4 className="font-bold text-xs text-white">Arts. 128 &amp; 129</h4>
                      <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                        <li><strong>Art. 128 Visitorial:</strong> No monetary limit; routine/complaint inspection where E-ER subsists</li>
                        <li><strong>Art. 129 Summary:</strong> Money claims ≤ ₱5,000, no reinstatement claim</li>
                      </ul>
                    </div>

                    <div className="bg-slate-900 border-l-4 border-cyan-500 p-3 rounded-r-xl space-y-1">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold block">BRANCH C · VOLUNTARY ARBITRATOR</span>
                      <h4 className="font-bold text-xs text-white">Arts. 274–275</h4>
                      <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                        <li>Grievances from CBA interpretation</li>
                        <li>Violations of company personnel policies</li>
                        <li>Excludes gross ULP (strikeable)</li>
                        <li>Appealed via Rule 43 to CA (15 days)</li>
                      </ul>
                    </div>
                  </div>

                  {/* Step 3: Appellate Hierarchy */}
                  <div className="bg-slate-900 border-l-4 border-purple-500 p-3 rounded-r-xl space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-purple-500 text-white px-1.5 py-0.5 rounded font-mono">
                        APPELLATE ROUTE
                      </span>
                      <span className="font-bold text-xs text-white">
                        NLRC Commission → Court of Appeals → Supreme Court
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div>1. <strong>Labor Arbiter to NLRC Commission:</strong> 10 calendar days appeal with cash/surety appeal bond for monetary awards (Art. 229).</div>
                      <div>2. <strong>Motion for Reconsideration:</strong> 10 calendar days (strictly mandatory condition precedent).</div>
                      <div>3. <strong>CA Rule 65 Certiorari:</strong> 60 days under St. Martin Funeral Home doctrine.</div>
                      <div>4. <strong>SC Rule 45 Petition for Review:</strong> 15 days on pure questions of law.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'forums_matrix' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(FORUM_JURISDICTIONS) as ForumJurisdictionId[]).map((key) => {
                const forum = FORUM_JURISDICTIONS[key];
                return (
                  <div
                    key={key}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 hover:border-amber-400/60 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                        {forum.badge}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {forum.controllingStatute}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white">
                      {forum.name}
                    </h4>

                    <div className="text-xs text-slate-300 space-y-1">
                      <span className="font-semibold text-slate-200 block text-[11px]">Scope of Authority:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-300">
                        {forum.scopeOfAuthority.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300">
                      <span className="font-bold text-amber-300">Jurisdictional Threshold: </span>
                      {forum.keyThresholds}
                    </div>

                    <div className="text-[10px] font-mono text-cyan-300">
                      Appeal: {forum.appealRoute}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px] text-center sm:text-left">
            Labor Dispute Jurisdiction Navigator · Arts. 128, 129, 224, 229, 274–275 &amp; R.A. 10396
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

      {/* Standalone Printable Flowchart Sheet */}
      <div
        id="labor-dispute-flowchart-sheet"
        data-testid="labor-dispute-flowchart-sheet"
        data-printable-sheet="true"
        className="hidden print:block print:w-full print:p-8 bg-white text-black font-sans"
      >
        <div className="border-b-2 border-black pb-4 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">
              PHILIPPINE LABOR DISPUTE RESOLUTION &amp; JURISDICTION FLOWCHART
            </h1>
            <p className="text-xs font-semibold text-slate-700">
              Bar Exam Standard Reference · SENA (R.A. 10396), Arts. 128, 129, 224, 229, 274 &amp; Rule 65 Certiorari
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <div>SUPER MARIO LABOR AID</div>
            <div>VERIFIED COMPLIANCE</div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="border border-black p-3 bg-slate-100">
            <h3 className="font-black text-xs uppercase mb-1">STAGE 1: MANDATORY SENA CONCILIATION (R.A. 10396)</h3>
            <p className="text-xs">
              All labor cases begin with 30-day mandatory conciliation before a SEADO. If settlement fails, referral is issued to the appropriate forum.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="border border-black p-3 text-xs">
              <h4 className="font-black uppercase mb-1">NLRC LABOR ARBITER (Art. 224)</h4>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Illegal dismissal / termination</li>
                <li>Money claims &gt; ₱5,000</li>
                <li>Claims with reinstatement prayer</li>
                <li>Unfair Labor Practices (ULP)</li>
                <li>Damages arising from E-ER</li>
              </ul>
              <div className="mt-2 font-mono text-[10px]">Appeal: 10 calendar days to NLRC with Appeal Bond</div>
            </div>

            <div className="border border-black p-3 text-xs">
              <h4 className="font-black uppercase mb-1">DOLE REGIONAL DIRECTOR (Arts. 128 &amp; 129)</h4>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li><strong>Art. 128 Visitorial:</strong> No monetary ceiling; routine inspection while E-ER exists</li>
                <li><strong>Art. 129 Summary:</strong> Claims ≤ ₱5,000; NO reinstatement prayer</li>
              </ul>
              <div className="mt-2 font-mono text-[10px]">Appeal: 10 days to DOLE Sec (128) / 5 days to NLRC (129)</div>
            </div>

            <div className="border border-black p-3 text-xs">
              <h4 className="font-black uppercase mb-1">VOLUNTARY ARBITRATOR (Arts. 274–275)</h4>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Grievances from CBA interpretation</li>
                <li>Violations of company personnel policies</li>
                <li>Mutually submitted disputes</li>
              </ul>
              <div className="mt-2 font-mono text-[10px]">Appeal: 15 days Rule 43 Petition to Court of Appeals</div>
            </div>
          </div>

          <div className="border border-black p-3 bg-slate-50 text-xs">
            <h4 className="font-black uppercase mb-1">APPELLATE SUPER-HIGHWAY (St. Martin Funeral Home Doctrine)</h4>
            <p className="text-[11px] leading-relaxed">
              Decisions of the NLRC Commission are reviewable only by the <strong>Court of Appeals via Rule 65 Certiorari within 60 days</strong>, after the denial of a mandatory Motion for Reconsideration within 10 days. Direct recourse to the Supreme Court is prohibited. From the CA, recourse is to the <strong>Supreme Court via Rule 45 within 15 days</strong> on pure questions of law.
            </p>
          </div>
        </div>

        <div className="text-xs border-t border-black pt-2 flex justify-between text-slate-600 font-mono">
          <span>Super Mario Labor Standards Guide · Created by Matthew</span>
          <span>SENA · DOLE · NLRC · CA · SC</span>
        </div>
      </div>
    </div>
  );
}
