import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import { marioAudio } from '../utils/audio';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
  MarioFireFlowerIcon,
  MarioMushroomIcon,
  Mario1UpIcon,
  MarioPeachCrownIcon,
  MarioQuestionBlockIcon,
  MarioPipeIcon,
} from './MarioIcons';
import { ArcadeDoctrineCard } from './ArcadeDoctrineCard';
import {
  Coins,
  Sparkles,
  Shield,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  Stamp,
  FileText,
  Heart,
  Award,
  Clock,
  BadgeCheck,
  Cloud,
  Zap,
  Flame,
  Wind,
  HelpCircle,
  Play,
  Pause,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  drawSlotTriviaQuestion,
  drawWorld6LeaveCase,
  drawClimberTowerRun,
  SlotTriviaItem,
  LeaveClinicCaseItem,
  ClimberRungItem,
  WORLD6_LEAVE_CLINIC_BANK,
} from '../utils/gameQuestionDeck';

interface ExtraGameProps {
  equippedAvatar: MarioAvatar;
  coins: number;
  onAdjustCoins: (delta: number) => void;
}

// ============================================================================
// 1. TOAD'S STATUTORY COIN TREASURY SLOTS (Spend Coins & Double via Statutory Trivia!)
// ============================================================================
const SLOT_REELS = [
  { id: 'star', label: '390% Double Holiday + RD', payoutMult: 10, doctrine: 'Art. 93-94: 300% double holiday + 30% rest day premium' },
  { id: 'crown', label: '100% Service Charge Art. 96', payoutMult: 8, doctrine: 'RA 11360: 100% distributed completely among covered employees' },
  { id: 'flower', label: '105d Maternity Leave', payoutMult: 6, doctrine: 'RA 11210: 105 days paid leave with 15 days solo mother add-on' },
  { id: '1up', label: '13th Month Pay P.D. 851', payoutMult: 5, doctrine: 'PD 851: 1/12th basic annual salary for all >=1 month service' },
  { id: 'mushroom', label: '200% Regular Holiday Pay', payoutMult: 4, doctrine: 'Art. 94: Unworked=100%, Worked first 8h=200% basic rate' },
  { id: 'coin', label: 'Night Shift Diff +10%', payoutMult: 3, doctrine: 'Art. 86: +10% premium for work performed 10:00 PM to 6:00 AM' },
  { id: 'block', label: 'Overtime Pay +25%/+30%', payoutMult: 2, doctrine: 'Art. 87: Ordinary day +25%, holiday/rest day +30%' },
  { id: 'pipe', label: 'Weekly Rest 24h Art. 91', payoutMult: 2, doctrine: 'Art. 91: 24 consecutive hours rest after 6 workdays' },
] as const;

export const ToadHouseCoinSlots: React.FC<ExtraGameProps> = ({
  equippedAvatar,
  coins,
  onAdjustCoins,
}) => {
  const [wager, setWager] = useState<number>(25);
  const [reels, setReels] = useState<[number, number, number]>([0, 1, 2]);
  const [reelSpinning, setReelSpinning] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [lastResult, setLastResult] = useState<string>(
    'Select your coin wager, pull Toad’s Mechanical Lever, or tap STOP on each spinning reel!'
  );
  const [pendingTriviaWin, setPendingTriviaWin] = useState<number>(0);
  const [activeTrivia, setActiveTrivia] = useState<SlotTriviaItem>(() => drawSlotTriviaQuestion());
  const [nudgesLeft, setNudgesLeft] = useState(3);
  const [autoSpin, setAutoSpin] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);

  const [winningPaylines, setWinningPaylines] = useState<number[]>([]);
  const [pendingGambleWin, setPendingGambleWin] = useState<number>(0);

  const spinIntervalsRef = useRef<[number | null, number | null, number | null]>([null, null, null]);
  const spinTimeoutsRef = useRef<number[]>([]);
  const spinningReelsRef = useRef<[boolean, boolean, boolean]>([false, false, false]);
  const currentReelsRef = useRef<[number, number, number]>([0, 1, 2]);
  const hasActiveSpinRef = useRef<boolean>(false);
  const wagerRef = useRef<number>(25);
  wagerRef.current = wager;
  const autoSpinRef = useRef<boolean>(false);
  autoSpinRef.current = autoSpin;
  const coinsRef = useRef<number>(coins);
  coinsRef.current = coins;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      spinIntervalsRef.current.forEach((iv) => {
        if (iv !== null) window.clearInterval(iv);
      });
      spinTimeoutsRef.current.forEach((tm) => window.clearTimeout(tm));
    };
  }, []);

  const renderSymbol = (idx: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const item = SLOT_REELS[idx] ?? SLOT_REELS[0];
    const sizeCls = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
    switch (item.id) {
      case 'star':
        return <MarioStarIcon className={`${sizeCls} drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]`} />;
      case 'crown':
        return <MarioPeachCrownIcon className={`${sizeCls} drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]`} />;
      case 'flower':
        return <MarioFireFlowerIcon className={`${sizeCls} drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]`} />;
      case '1up':
        return <Mario1UpIcon className={`${sizeCls} drop-shadow-[0_0_6px_rgba(34,197,94,0.5)]`} />;
      case 'mushroom':
        return <MarioMushroomIcon className={sizeCls} />;
      case 'coin':
        return <MarioCoinIcon className={`${sizeCls} animate-pulse`} />;
      case 'block':
        return <MarioQuestionBlockIcon className={sizeCls} />;
      case 'pipe':
        return <MarioPipeIcon className={sizeCls} />;
      default:
        return <MarioCoinIcon className={sizeCls} />;
    }
  };

  const isAnySpinning = reelSpinning[0] || reelSpinning[1] || reelSpinning[2];

  const triggerNextAutoSpin = useCallback(() => {
    if (autoSpinRef.current && coinsRef.current >= wagerRef.current) {
      window.setTimeout(() => {
        if (autoSpinRef.current && !hasActiveSpinRef.current && coinsRef.current >= wagerRef.current) {
          handleStartSpin();
        }
      }, 1500);
    } else if (autoSpinRef.current) {
      setAutoSpin(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const evaluateSpinFinish = useCallback((finalReels: [number, number, number], currentWager: number) => {
    hasActiveSpinRef.current = false;
    const len = SLOT_REELS.length;
    const [r0, r1, r2] = finalReels;

    // 5 Paylines Definition
    // 1: Center Horizontal [r0, r1, r2]
    // 2: Top Horizontal [(r0-1+len)%len, (r1-1+len)%len, (r2-1+len)%len]
    // 3: Bottom Horizontal [(r0+1)%len, (r1+1)%len, (r2+1)%len]
    // 4: Diagonal 1 [(r0-1+len)%len, r1, (r2+1)%len]
    // 5: Diagonal 2 [(r0+1)%len, r1, (r2-1+len)%len]
    const lines: { id: number; name: string; symbols: [number, number, number] }[] = [
      { id: 1, name: 'Center Payline', symbols: [r0, r1, r2] },
      { id: 2, name: 'Top Payline', symbols: [(r0 - 1 + len) % len, (r1 - 1 + len) % len, (r2 - 1 + len) % len] },
      { id: 3, name: 'Bottom Payline', symbols: [(r0 + 1) % len, (r1 + 1) % len, (r2 + 1) % len] },
      { id: 4, name: 'Diagonal Down', symbols: [(r0 - 1 + len) % len, r1, (r2 + 1) % len] },
      { id: 5, name: 'Diagonal Up', symbols: [(r0 + 1) % len, r1, (r2 - 1 + len) % len] },
    ];

    let totalWin = 0;
    const wonLineIds: number[] = [];
    let jackpotHit = false;
    let hitMessage = '';

    for (const line of lines) {
      const [s0, s1, s2] = line.symbols;
      if (s0 === s1 && s1 === s2) {
        // 3 of a kind jackpot on this line!
        const mult = SLOT_REELS[s0].payoutMult;
        const lineWin = currentWager * mult;
        totalWin += lineWin;
        wonLineIds.push(line.id);
        jackpotHit = true;
        hitMessage = `JACKPOT on ${line.name}! 3x ${SLOT_REELS[s0].label} (${mult}x)`;
      } else if (s0 === s1 || s1 === s2 || s0 === s2) {
        // Pair match on this line
        const pairWin = Math.round(currentWager * 1.5);
        totalWin += pairWin;
        wonLineIds.push(line.id);
        if (!hitMessage) {
          hitMessage = `PAIR MATCH on ${line.name}! (+${pairWin}c)`;
        }
      }
    }

    setWinningPaylines(wonLineIds);

    if (totalWin > 0) {
      onAdjustCoins(totalWin);
      setPendingTriviaWin(Math.max(15, Math.round(totalWin * 0.5)));
      setPendingGambleWin(totalWin);
      setActiveTrivia(drawSlotTriviaQuestion());
      setLastResult(`${hitMessage} — Total Won +${totalWin} Coins! Gamble 2x or solve trivia!`);
      if (jackpotHit) {
        marioAudio.playOneUp();
        try {
          confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
        } catch {}
      } else {
        marioAudio.playPowerUp();
      }
    } else {
      setLastResult('No matching statutory lines on this spin. Nudge reels or pull lever to spin again!');
      marioAudio.playStomp();
    }

    if (autoSpinRef.current) {
      triggerNextAutoSpin();
    }
  }, [onAdjustCoins, triggerNextAutoSpin]);

  const stopReel = useCallback((reelIdx: 0 | 1 | 2) => {
    if (!spinningReelsRef.current[reelIdx]) return;
    spinningReelsRef.current[reelIdx] = false;

    if (spinIntervalsRef.current[reelIdx] !== null) {
      window.clearInterval(spinIntervalsRef.current[reelIdx]!);
      spinIntervalsRef.current[reelIdx] = null;
    }

    marioAudio.playClick();
    setReelSpinning((prev) => {
      const next: [boolean, boolean, boolean] = [...prev];
      next[reelIdx] = false;
      return next;
    });

    const allHalted = spinningReelsRef.current.every((s) => !s);
    if (allHalted && hasActiveSpinRef.current) {
      evaluateSpinFinish(currentReelsRef.current, wagerRef.current);
    }
  }, [evaluateSpinFinish]);

  const stopAllReels = useCallback(() => {
    [0, 1, 2].forEach((idx) => {
      if (spinningReelsRef.current[idx]) {
        spinningReelsRef.current[idx] = false;
        if (spinIntervalsRef.current[idx] !== null) {
          window.clearInterval(spinIntervalsRef.current[idx]!);
          spinIntervalsRef.current[idx] = null;
        }
      }
    });
    spinTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    spinTimeoutsRef.current = [];
    marioAudio.playClick();
    setReelSpinning([false, false, false]);
    if (hasActiveSpinRef.current) {
      evaluateSpinFinish(currentReelsRef.current, wagerRef.current);
    }
  }, [evaluateSpinFinish]);

  const handleStartSpin = () => {
    if (isAnySpinning || coinsRef.current < wagerRef.current) return;
    onAdjustCoins(-wagerRef.current);
    setPendingTriviaWin(0);
    setPendingGambleWin(0);
    setWinningPaylines([]);
    setNudgesLeft(3);

    hasActiveSpinRef.current = true;
    spinningReelsRef.current = [true, true, true];
    setReelSpinning([true, true, true]);
    marioAudio.playQuestionBlock();

    spinTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    spinTimeoutsRef.current = [];

    // Start 3 independent cycling reels
    [0, 1, 2].forEach((rIdx) => {
      if (spinIntervalsRef.current[rIdx] !== null) {
        window.clearInterval(spinIntervalsRef.current[rIdx]!);
      }
      spinIntervalsRef.current[rIdx] = window.setInterval(() => {
        setReels((prev) => {
          const next: [number, number, number] = [...prev];
          next[rIdx] = (next[rIdx] + 1) % SLOT_REELS.length;
          currentReelsRef.current = next;
          return next;
        });
      }, 65 + rIdx * 25);
    });

    // Auto-stop timers (sequential mechanical stop at 1.1s, 1.7s, 2.3s)
    const t0 = window.setTimeout(() => stopReel(0), 1100);
    const t1 = window.setTimeout(() => stopReel(1), 1700);
    const t2 = window.setTimeout(() => stopReel(2), 2300);
    spinTimeoutsRef.current.push(t0, t1, t2);
  };

  const handleNudge = (reelIdx: 0 | 1 | 2) => {
    if (isAnySpinning || nudgesLeft <= 0) return;
    setNudgesLeft((n) => n - 1);
    setReels((prev) => {
      const next: [number, number, number] = [...prev];
      next[reelIdx] = (next[reelIdx] + 1) % SLOT_REELS.length;
      currentReelsRef.current = next;

      // Check if manual nudge produced a winning line
      const [r1, r2, r3] = next;
      if (r1 === r2 && r2 === r3) {
        const mult = SLOT_REELS[r1].payoutMult;
        const win = Math.round(wager * mult * 0.8);
        onAdjustCoins(win);
        setLastResult(`NUDGE JACKPOT! 3x ${SLOT_REELS[r1].label} — Won +${win} Coins!`);
        marioAudio.playOneUp();
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        const win = Math.round(wager * 1.5);
        onAdjustCoins(win);
        setLastResult(`NUDGE PAIR MATCH! Won +${win} Coins!`);
        marioAudio.playPowerUp();
      }

      return next;
    });
    marioAudio.playJump();
  };

  const handleAnswerBonus = (choice: number) => {
    if (choice === activeTrivia.ans) {
      onAdjustCoins(pendingTriviaWin);
      marioAudio.playCoin();
      try {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      setLastResult(`CORRECT STATUTORY DOCTRINE! Bonus +${pendingTriviaWin} Coins added to your wallet!`);
    } else {
      marioAudio.playBowserHit();
      setLastResult(`Review Tip: Correct answer was "${activeTrivia.opts[activeTrivia.ans]}". Spin again!`);
    }
    setPendingTriviaWin(0);
  };

  const handleGamble = (guess: 'red' | 'green') => {
    if (pendingGambleWin <= 0) return;
    const isWinner = Math.random() >= 0.5;
    if (isWinner) {
      const added = pendingGambleWin;
      onAdjustCoins(added);
      setPendingGambleWin((prev) => prev * 2);
      marioAudio.playOneUp();
      setLastResult(`GAMBLE WON! You doubled your payout to +${pendingGambleWin * 2} Coins!`);
      try {
        confetti({ particleCount: 60, spread: 75, origin: { y: 0.6 } });
      } catch {}
    } else {
      marioAudio.playBowserHit();
      setLastResult(`GAMBLE LOST! Bowser claimed the pot. Pull the lever to spin again!`);
      setPendingGambleWin(0);
    }
  };

  return (
    <div className="bg-[#1e293b] text-white rounded-3xl p-5 sm:p-7 pb-12 sm:pb-16 border-4 border-slate-950 shadow-[6px_6px_0_#000] max-w-3xl mx-auto space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black font-mario text-amber-400 uppercase block">
              TOAD HOUSE COIN WAGER ARCADE
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              STATUTORY TREASURY SLOTS
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 px-3.5 py-2 rounded-xl border-2 border-amber-400 flex items-center gap-2 font-mario text-xs text-amber-300 tabular-nums">
            <MarioCoinIcon className="w-4 h-4" />
            <span>{coins} COINS</span>
          </div>
        </div>
      </div>

      {/* 5 Paylines Status Strip */}
      <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-[10px] font-mario text-amber-300 uppercase tracking-wider">
          5 ACTIVE PAYLINES:
        </span>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
          {[
            { id: 1, label: 'L1: Center ━' },
            { id: 2, label: 'L2: Top ━' },
            { id: 3, label: 'L3: Bottom ━' },
            { id: 4, label: 'L4: Diag Down' },
            { id: 5, label: 'L5: Diag Up' },
          ].map((line) => {
            const isWon = winningPaylines.includes(line.id);
            return (
              <span
                key={line.id}
                className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                  isWon
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse font-black'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                {line.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Wager Selector, Auto-Spin & Paytable HUD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border-2 border-slate-700 w-full max-w-full">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Wager:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[5, 10, 25, 50, 100].map((amt) => (
              <button
                key={amt}
                type="button"
                disabled={isAnySpinning}
                onClick={() => {
                  setWager(amt);
                  marioAudio.playClick();
                }}
                className={`min-h-[38px] px-2.5 py-1.5 rounded-xl font-mario text-[11px] border-2 cursor-pointer transition-colors whitespace-nowrap text-center flex items-center justify-center ${
                  wager === amt
                    ? 'bg-amber-400 text-slate-950 border-black font-black shadow-[0_2px_0_#000]'
                    : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700'
                }`}
              >
                {amt}c
              </button>
            ))}
            <button
              type="button"
              disabled={isAnySpinning || coins < 100}
              onClick={() => {
                const maxBet = Math.min(100, Math.max(5, Math.floor(coins / 10) * 10 || 5));
                setWager(maxBet);
                marioAudio.playPowerUp();
              }}
              className="min-h-[38px] px-2.5 py-1.5 rounded-xl font-mario text-[10px] bg-rose-600 hover:bg-rose-500 text-white border-2 border-black font-black shadow-[0_2px_0_#000] cursor-pointer"
            >
              MAX
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setAutoSpin((prev) => !prev);
              marioAudio.playClick();
            }}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl font-mario text-[10px] sm:text-xs border-2 flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000] transition-colors ${
              autoSpin
                ? 'bg-emerald-400 text-slate-950 border-black font-black animate-pulse'
                : 'bg-slate-800 text-slate-300 border-slate-600 hover:bg-slate-700'
            }`}
          >
            {autoSpin ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>AUTO-SPIN: {autoSpin ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPaytable((prev) => !prev);
              marioAudio.playClick();
            }}
            className="min-h-[38px] px-3 py-1.5 rounded-xl font-mario text-[10px] sm:text-xs bg-indigo-600 hover:bg-indigo-500 text-white border-2 border-black font-black flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000]"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>PAYTABLE</span>
          </button>
        </div>
      </div>

      {/* Paytable Doctrine Guide Drawer */}
      {showPaytable && (
        <div className="bg-slate-950 p-4 rounded-2xl border-2 border-indigo-400 shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-indigo-500/30 pb-2">
            <span className="text-xs font-mario text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              STATUTORY TREASURY PAYTABLE & LABOR DOCTRINES
            </span>
            <button
              type="button"
              onClick={() => setShowPaytable(false)}
              className="text-xs text-slate-400 hover:text-white font-mono cursor-pointer"
            >
              [CLOSE]
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {SLOT_REELS.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5"
              >
                <div className="shrink-0 p-1 bg-slate-950 rounded-lg border border-slate-700">
                  {renderSymbol(idx, 'sm')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-amber-200 text-[11px] truncate">{item.label}</span>
                    <span className="font-mario text-[10px] text-emerald-400 shrink-0">{item.payoutMult}x JACKPOT</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{item.doctrine}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 italic text-center pt-1">
            Hit 3 identical symbols along any of the 5 paylines for full JACKPOT! Pair matches pay 1.5x! Correct trivia answers win bonus coins!
          </p>
        </div>
      )}

      {/* Marquee Flashing Casino Lights & 3x3 Active Spinning Reels */}
      <div className="relative bg-slate-950 p-4 sm:p-6 rounded-2xl border-4 border-amber-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] space-y-3">
        {/* Flashing Retro Marquee Lights Header */}
        <div className="flex items-center justify-between px-2 pb-1">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((bulb) => (
              <span
                key={bulb}
                className={`w-2.5 h-2.5 rounded-full border border-black ${
                  isAnySpinning
                    ? bulb % 2 === 0
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-emerald-400 animate-pulse'
                    : bulb % 2 === 0
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mario text-amber-300 uppercase tracking-widest">
            {isAnySpinning ? 'REELS CYCLING...' : 'TOAD TREASURY 3X3 VAULT'}
          </span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3, 4].map((bulb) => (
              <span
                key={bulb}
                className={`w-2.5 h-2.5 rounded-full border border-black ${
                  isAnySpinning
                    ? bulb % 2 === 0
                      ? 'bg-rose-500 animate-pulse'
                      : 'bg-amber-400 animate-ping'
                    : bulb % 2 === 0
                    ? 'bg-emerald-400'
                    : 'bg-amber-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 3 Active Spinning Reels with 3x3 Cylinder Peek, Manual Stop & Nudge Paddles */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {reels.map((symbolIdx, i) => {
            const len = SLOT_REELS.length;
            const topIdx = (symbolIdx - 1 + len) % len;
            const botIdx = (symbolIdx + 1) % len;
            const isSpinning = reelSpinning[i as 0 | 1 | 2];
            const isCenterMatch = winningPaylines.includes(1);
            return (
              <div
                key={i}
                className={`bg-slate-900 border-2 rounded-2xl p-2.5 sm:p-3.5 flex flex-col items-center justify-between gap-1.5 text-center transition-all ${
                  isCenterMatch
                    ? 'border-amber-400 bg-amber-950/30 ring-2 ring-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                    : 'border-slate-700'
                }`}
              >
                <span className="text-[9px] font-mono font-bold text-amber-300 uppercase">
                  REEL #{i + 1}
                </span>

                {/* Top Peek Symbol */}
                <div className="opacity-40 scale-75 transform transition-transform pointer-events-none -my-1">
                  {renderSymbol(topIdx, 'sm')}
                </div>

                {/* Primary Center Reel Symbol */}
                <div
                  className={`p-2 rounded-xl transition-all ${
                    isSpinning
                      ? 'scale-125 animate-bounce blur-[0.5px]'
                      : isCenterMatch
                      ? 'scale-110'
                      : 'scale-100'
                  }`}
                >
                  {renderSymbol(symbolIdx, 'lg')}
                </div>

                <span className="text-[10px] sm:text-[11px] font-bold text-amber-200 leading-tight min-h-[24px] flex items-center justify-center">
                  {SLOT_REELS[symbolIdx].label}
                </span>

                {/* Bottom Peek Symbol */}
                <div className="opacity-40 scale-75 transform transition-transform pointer-events-none -my-1">
                  {renderSymbol(botIdx, 'sm')}
                </div>

                {/* Action Controls for Reel (STOP during spin, or NUDGE when stopped) */}
                {isSpinning ? (
                  <button
                    type="button"
                    onClick={() => stopReel(i as 0 | 1 | 2)}
                    className="w-full min-h-[36px] py-1 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl border-2 border-black font-mario text-[10px] cursor-pointer shadow-[0_2px_0_#000] active:translate-y-0.5 animate-pulse mt-1"
                  >
                    STOP!
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={nudgesLeft <= 0 || isAnySpinning}
                    onClick={() => handleNudge(i as 0 | 1 | 2)}
                    className="w-full min-h-[34px] py-1 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-40 text-slate-300 font-bold rounded-xl border border-slate-600 font-mono text-[9px] cursor-pointer mt-1"
                  >
                    NUDGE ({nudgesLeft})
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Stop All Button while spinning */}
        {isAnySpinning && (
          <button
            type="button"
            onClick={stopAllReels}
            className="w-full min-h-[40px] py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black font-mario text-xs cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5 flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <span>STOP ALL REELS NOW!</span>
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm font-bold text-amber-300 text-center">
        {lastResult}
      </div>

      {/* Double or Nothing Gamble Box */}
      {pendingGambleWin > 0 && (
        <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-emerald-950/80 border-3 border-amber-400 rounded-3xl p-4 sm:p-5 space-y-3 shadow-[0_6px_0_#000]">
          <div className="flex items-center justify-between gap-2 border-b border-amber-400/30 pb-2">
            <span className="text-xs font-mario text-amber-300 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              TOAD’S DOUBLE-OR-NOTHING GAMBLE
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-mono text-xs font-black">
              Pot: {pendingGambleWin} Coins
            </span>
          </div>
          <p className="text-xs text-slate-200">
            Guess the hidden Mario mystery card to <strong>DOUBLE</strong> your winnings to <strong>+{pendingGambleWin * 2} Coins</strong>, or collect your coins now!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleGamble('red')}
              className="min-h-[44px] px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl border-2 border-black cursor-pointer shadow-[0_2px_0_#000] flex items-center justify-center gap-2"
            >
              <MarioFireFlowerIcon className="w-4 h-4" />
              <span>RED (FIRE FLOWER)</span>
            </button>
            <button
              type="button"
              onClick={() => handleGamble('green')}
              className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl border-2 border-black cursor-pointer shadow-[0_2px_0_#000] flex items-center justify-center gap-2"
            >
              <Mario1UpIcon className="w-4 h-4" />
              <span>GREEN (1-UP MUSHROOM)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingGambleWin(0);
                marioAudio.playCoin();
                setLastResult(`Banked +${pendingGambleWin} Coins safely into your wallet!`);
              }}
              className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 cursor-pointer flex items-center justify-center"
            >
              <span>BANK / COLLECT COINS</span>
            </button>
          </div>
        </div>
      )}

      {pendingTriviaWin > 0 && (
        <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-indigo-950/90 border-3 border-amber-400 rounded-3xl p-4 sm:p-5 space-y-3.5 shadow-[0_6px_0_#000]">
          <div className="flex items-center justify-between gap-2 border-b border-amber-400/30 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-mario text-xs font-black flex items-center justify-center border-2 border-black shadow-[0_2px_0_#000]">
                ?
              </div>
              <div>
                <span className="text-[10px] font-mario text-amber-300 uppercase tracking-wide block">
                  TOAD&apos;S MYSTERY QUESTION BLOCK
                </span>
                <span className="text-[10px] font-mono text-emerald-300 font-bold">
                  Rescue Bonus: Win Back +{pendingTriviaWin} Mario Coins!
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-mono text-xs font-black shrink-0">
              +{pendingTriviaWin}c
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-white leading-relaxed break-words">
            {activeTrivia.q}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {activeTrivia.opts.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAnswerBonus(idx)}
                className="min-h-[48px] p-3 rounded-2xl bg-slate-950/90 hover:bg-amber-400 hover:text-slate-950 text-white font-bold text-xs border-2 border-slate-700 hover:border-black cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5 transition-all text-left flex items-start gap-2"
              >
                <span className="w-5 h-5 rounded-md bg-amber-400/20 text-amber-300 group-hover:bg-black group-hover:text-amber-400 border border-amber-400/40 text-[10px] font-mario flex items-center justify-center shrink-0 mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="break-words min-w-0 flex-1 leading-snug">
                  {opt}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Coin Relief if balance is lower than wager */}
      {coins < wager && (
        <button
          type="button"
          onClick={() => {
            onAdjustCoins(50);
            marioAudio.playOneUp();
            setLastResult('Toad granted you an emergency statutory stipend of +50 Coins! Pull the lever to spin!');
          }}
          className="w-full min-h-[48px] py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] active:translate-y-1 font-mario text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 uppercase animate-pulse"
        >
          <Sparkles className="w-5 h-5" />
          <span>REQUEST EMERGENCY STIPEND (+50 COINS FROM TOAD)</span>
        </button>
      )}

      {/* Primary Lever Action Button */}
      <button
        type="button"
        disabled={isAnySpinning || coins < wager}
        onClick={handleStartSpin}
        className="w-full min-h-[52px] py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 font-mario text-xs sm:text-sm cursor-pointer flex items-center justify-center gap-2 transition-transform uppercase tracking-wider"
      >
        <Coins className="w-5 h-5" />
        <span>
          {coins < wager
            ? `NEED ${wager} COINS TO SPIN (TAP TOAD STIPEND ABOVE)`
            : isAnySpinning
            ? 'REELS WHIRLING — TAP RED STOP BUTTONS!'
            : `PULL LEVER: SPIN TREASURY REELS (-${wager}c)`}
        </span>
      </button>
    </div>
  );
};

// ============================================================================
// 2. WORLD 6 STATUTORY LEAVE CLINIC (Dedicated Module 6 Mastery Arcade!)
// ============================================================================
export const World6LeaveMatcherGame: React.FC<ExtraGameProps> = ({
  equippedAvatar,
  coins,
  onAdjustCoins,
}) => {
  const [caseNumber, setCaseNumber] = useState(1);
  const [current, setCurrent] = useState<LeaveClinicCaseItem>(() => drawWorld6LeaveCase());
  const [streak, setStreak] = useState(0);
  const [caseStartTime, setCaseStartTime] = useState<number>(() => Date.now());
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string; selectedOpt: string } | null>(null);
  const [hintUnlocked, setHintUnlocked] = useState(false);
  const [stampedOpt, setStampedOpt] = useState<string | null>(null);

  const handleSelect = (opt: string) => {
    if (feedback) return;
    setStampedOpt(opt);

    const isCorrect = opt === current.correctLeave;
    const isFast = Date.now() - caseStartTime <= 8000;
    setTimeout(() => {
      if (isCorrect) {
        let reward = 6 + Math.min(10, streak * 2);
        if (isFast) {
          reward += 5;
          setSpeedBonusAwarded(true);
        }
        onAdjustCoins(reward);
        setStreak((s) => s + 1);
        setFeedback({
          ok: true,
          text: isFast
            ? `+5 SPEED BONUS! Officially Dispatched! +${reward} Coins · ${current.statute}`
            : `Officially Dispatched! +${reward} Coins · ${current.statute}`,
          selectedOpt: opt,
        });
        marioAudio.playCoin();
      } else {
        setStreak(0);
        setFeedback({ ok: false, text: `Statutory Mismatch! Correct: ${current.correctLeave} (${current.statute})`, selectedOpt: opt });
        marioAudio.playBowserHit();
      }
    }, 300);
  };

  const nextCase = () => {
    setCaseNumber((n) => n + 1);
    setCurrent(drawWorld6LeaveCase());
    setFeedback(null);
    setStampedOpt(null);
    setHintUnlocked(false);
    setCaseStartTime(Date.now());
    setSpeedBonusAwarded(false);
    marioAudio.playClick();
  };

  const buyHint = () => {
    if (coins < 5 || hintUnlocked) return;
    onAdjustCoins(-5);
    setHintUnlocked(true);
    marioAudio.playPowerUp();
  };

  // Color & Icon mapping for 4 Royal Wax Seals
  const STAMP_PALETTES = [
    { border: 'border-pink-400', bg: 'bg-pink-950/80', hover: 'hover:bg-pink-600', text: 'text-pink-300', wax: 'bg-pink-500' },
    { border: 'border-sky-400', bg: 'bg-sky-950/80', hover: 'hover:bg-sky-600', text: 'text-sky-300', wax: 'bg-sky-500' },
    { border: 'border-amber-400', bg: 'bg-amber-950/80', hover: 'hover:bg-amber-600', text: 'text-amber-300', wax: 'bg-amber-500' },
    { border: 'border-purple-400', bg: 'bg-purple-950/80', hover: 'hover:bg-purple-600', text: 'text-purple-300', wax: 'bg-purple-500' },
  ];

  return (
    <div className="bg-[#140f24] text-white rounded-3xl p-4 sm:p-7 border-4 border-slate-950 shadow-[6px_6px_0_#000] max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-pink-900/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-500 rounded-2xl border-3 border-black flex items-center justify-center shrink-0 shadow-[0_3px_0_#000]">
            <MarioCharacterAvatar character={equippedAvatar} className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black font-mario text-pink-300 uppercase block tracking-wider">
              WORLD 6 · PRINCESS PEACH STATUTORY CLINIC
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              PEACH&apos;S LEAVE BENEFIT DISPATCH DESK
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2 font-mario text-xs tabular-nums">
          <span className="bg-slate-950/90 px-3.5 py-2 rounded-xl border border-pink-500/40 text-emerald-400 shadow-inner">
            DISPATCH STREAK: x{streak}
          </span>
        </div>
      </div>

      {/* Royal Dispatch Counter & Applicant Petition Clipboard */}
      <div className="relative rounded-2xl border-3 border-pink-500/50 bg-gradient-to-b from-[#25153a] via-[#170c29] to-[#0c0617] p-4 sm:p-6 overflow-hidden space-y-3">
        {/* Ambient Top Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-pink-800/40 pb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-pink-950 border border-pink-400 text-[10px] font-mario text-pink-300 uppercase">
              APPLICANT #{caseNumber}
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">
              CITIZEN LEAVE PETITION
            </span>
          </div>
          <button
            type="button"
            disabled={coins < 5 || hintUnlocked}
            onClick={buyHint}
            className="min-h-[34px] px-3 py-1 rounded-xl bg-amber-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs border border-black cursor-pointer shadow-[0_2px_0_#000] active:translate-y-0.5"
          >
            {hintUnlocked ? 'Codal Clue Active' : 'Buy Codal Clue (-5 Coins)'}
          </button>
        </div>

        {/* Applicant Circumstances Scroll */}
        <div className="bg-slate-950/80 rounded-xl border border-pink-500/30 p-4 pb-9 sm:pb-10 space-y-2 relative">
          <div className="flex items-center gap-2 text-xs font-mono text-pink-300 uppercase">
            <FileText className="w-4 h-4 text-pink-400" />
            <span>SWORN STATEMENT OF STATUTORY CIRCUMSTANCES</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
            &ldquo;{current.scenario}&rdquo;
          </p>

          {hintUnlocked && (
            <div className="text-xs text-amber-300 bg-amber-950/80 p-2.5 rounded-xl border border-amber-400/60 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Controlling Statutory Law: {current.statute}</span>
            </div>
          )}

          {/* Stamped Royal Seal Overlay */}
          {stampedOpt && (
            <div className="absolute right-4 bottom-3 border-4 border-amber-400/90 rounded-2xl p-2 bg-black/60 rotate-[-8deg] pointer-events-none animate-pulse">
              <span className="text-xs font-mario text-amber-300 uppercase tracking-widest block font-black">
                {feedback?.ok ? 'DISPATCHED APPROVED' : 'DISPATCH REVIEW'}
              </span>
            </div>
          )}
        </div>

        <div className="text-center pt-1">
          <span className="text-[10px] font-mario text-pink-300 uppercase tracking-widest">
            SELECT ROYAL WAX SEAL TO DISPATCH STATUTORY LEAVE
          </span>
        </div>
      </div>

      {/* 4 Interactive Royal Wax Seal Stampers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.options.map((opt, i) => {
          const pal = STAMP_PALETTES[i % STAMP_PALETTES.length];
          const isSelected = stampedOpt === opt;
          return (
            <button
              key={opt}
              type="button"
              disabled={Boolean(feedback)}
              onClick={() => handleSelect(opt)}
              className={`min-h-[64px] p-3.5 rounded-2xl border-3 text-left transition-all cursor-pointer relative overflow-hidden group shadow-[0_4px_0_#000] active:translate-y-0.5 ${
                feedback === null
                  ? `${pal.bg} ${pal.border} ${pal.hover} hover:text-slate-950 text-white`
                  : isSelected && feedback.ok
                  ? 'bg-emerald-500 text-slate-950 border-black shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                  : isSelected && !feedback.ok
                  ? 'bg-rose-600 text-white border-black'
                  : 'bg-slate-900/40 text-slate-500 border-slate-800 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* 3D Wax Stamper Knob */}
                <div className={`w-10 h-10 rounded-xl ${pal.wax} border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]`}>
                  <Stamp className="w-5 h-5 text-slate-950" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                    ROYAL SEAL #{i + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-display font-extrabold block break-words leading-snug">
                    {opt}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback & High-Yield Statutory Leave Doctrine Takeaway */}
      {feedback && (
        <ArcadeDoctrineCard
          title={current.correctLeave}
          statute={current.statute}
          rule={current.scenario}
          takeaway={
            feedback.ok
              ? `Statutory Leave Benefit Dispatched! Controlling entitlement: "${current.correctLeave}". ${current.statute}. Employee receives full statutory compensation and leave credit without loss of seniority!`
              : `Statutory Leave Mismatch! The controlling entitlement under ${current.statute} is "${current.correctLeave}". Avoid confusing with "${feedback.selectedOpt}".`
          }
          isCorrect={feedback.ok}
          speedBonusAwarded={speedBonusAwarded}
          worldCode="w6"
          scenarioText={current.scenario}
          chosenAnswerText={feedback.selectedOpt}
          correctAnswerText={current.correctLeave}
          advanceLabel="Dispatch Next Applicant →"
          onAdvance={nextCase}
        />
      )}
    </div>
  );
};

// ============================================================================
// 3. LAKITU'S CLOUD CLIMBER TOWER (High-Stakes Coin Ladder + Cloud Shield!)
// ============================================================================
export const LakituCloudClimberGame: React.FC<ExtraGameProps> = ({
  equippedAvatar,
  coins,
  onAdjustCoins,
}) => {
  const [rungs, setRungs] = useState<ClimberRungItem[]>(() => drawClimberTowerRun());
  const [rungIdx, setRungIdx] = useState(0);
  const [bankedPot, setBankedPot] = useState(0);
  const [cloudShield, setCloudShield] = useState(false);
  const [status, setStatus] = useState<'climbing' | 'won' | 'fell'>('climbing');
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const [floorStartTime, setFloorStartTime] = useState<number>(() => Date.now());
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState<boolean>(false);
  const [actionBanner, setActionBanner] = useState<{ text: string; sub: string; isCorrect: boolean } | null>(null);

  const currentRung = rungs[rungIdx] ?? rungs[0];

  const buyShield = () => {
    if (coins < 12 || cloudShield) return;
    onAdjustCoins(-12);
    setCloudShield(true);
    marioAudio.playPowerUp();
  };

  const answerRung = (choice: number) => {
    if (status !== 'climbing' || pickedOption !== null) return;
    setPickedOption(choice);
    const isCorrect = choice === currentRung.ans;
    const isFast = Date.now() - floorStartTime <= 8000;

    if (isCorrect) {
      let nextPot = currentRung.reward;
      if (isFast) {
        nextPot += 5;
        setSpeedBonusAwarded(true);
      }
      setBankedPot(nextPot);
      setActionBanner({
        text: 'LAKITU CLOUD SURGE!',
        sub: isFast
          ? `+5 SPEED BONUS! Floor ${currentRung.rung} Conquered! Banked +${nextPot} Coins!`
          : `Floor ${currentRung.rung} Conquered! Banked +${nextPot} Coins!`,
        isCorrect: true,
      });
      marioAudio.playCoin();

      setTimeout(() => {
        setPickedOption(null);
        setActionBanner(null);
        setSpeedBonusAwarded(false);
        setFloorStartTime(Date.now());
        if (rungIdx + 1 >= rungs.length) {
          onAdjustCoins(nextPot);
          setStatus('won');
          marioAudio.playQuizComplete();
          try {
            confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
        } else {
          setRungIdx((r) => r + 1);
          marioAudio.playJump();
        }
      }, 750);
    } else if (cloudShield) {
      setCloudShield(false);
      setActionBanner({
        text: 'CLOUD SHIELD DEFLECTED SPINY!',
        sub: 'Your Cloud Shield absorbed the fall! Safe on this floor!',
        isCorrect: true,
      });
      marioAudio.playPipe();
      setTimeout(() => {
        setPickedOption(null);
        setActionBanner(null);
      }, 850);
    } else {
      setBankedPot(0);
      setActionBanner({
        text: 'THWOMP SMASH! FELL FROM TOWER!',
        sub: 'You took a wrong cloud platform! Pot was lost!',
        isCorrect: false,
      });
      marioAudio.playBowserHit();
      setTimeout(() => {
        setPickedOption(null);
        setActionBanner(null);
        setStatus('fell');
      }, 850);
    }
  };

  const cashOut = () => {
    if (bankedPot <= 0) return;
    onAdjustCoins(bankedPot);
    marioAudio.playOneUp();
    setStatus('won');
  };

  const resetClimb = () => {
    setRungs(drawClimberTowerRun());
    setRungIdx(0);
    setBankedPot(0);
    setStatus('climbing');
    setPickedOption(null);
    setActionBanner(null);
    setFloorStartTime(Date.now());
    setSpeedBonusAwarded(false);
    marioAudio.playClick();
  };

  return (
    <div className="bg-[#0f172a] text-white rounded-3xl p-4 sm:p-7 border-4 border-slate-950 shadow-[6px_6px_0_#000] max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-sky-800/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sky-400 rounded-2xl border-3 border-black flex items-center justify-center shrink-0 shadow-[0_3px_0_#000]">
            <MarioCharacterAvatar character={equippedAvatar} className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black font-mario text-sky-300 uppercase block tracking-wider">
              RISK-AND-REWARD SKY TOWER · HIGH-STAKES ASCENT
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              LAKITU&apos;S CLOUD JACKPOT CLIMBER
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={coins < 12 || cloudShield || status !== 'climbing'}
            onClick={buyShield}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl font-black text-xs border-2 border-black flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000] active:translate-y-0.5 transition-all ${
              cloudShield
                ? 'bg-sky-300 text-slate-950 ring-2 ring-sky-200 animate-pulse'
                : 'bg-sky-400 hover:bg-sky-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950'
            }`}
          >
            <Shield className="w-4 h-4 shrink-0" />
            <span>{cloudShield ? 'Cloud Shield ARMED' : 'Buy Cloud Shield (-12c)'}</span>
          </button>
        </div>
      </div>

      {/* Progress Rungs Ladder */}
      <div className="grid grid-cols-5 gap-2 tabular-nums">
        {rungs.map((r, i) => (
          <div
            key={r.rung}
            className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
              i === rungIdx && status === 'climbing'
                ? 'bg-amber-400 text-slate-950 border-black font-black scale-105 shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                : i < rungIdx || status === 'won'
                ? 'bg-emerald-600 text-white border-emerald-300'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            <span className="block text-[10px] font-mario">Floor {r.rung}</span>
            <span className="font-mono">+{r.reward}c</span>
          </div>
        ))}
      </div>

      {status === 'climbing' && (
        <div className="space-y-4">
          {/* Vertical Sky Tower Arena Stage */}
          <div className="relative rounded-2xl border-3 border-sky-400/60 bg-gradient-to-b from-sky-600 via-indigo-950 to-slate-950 p-4 sm:p-5 overflow-hidden shadow-inner space-y-3">
            {/* Ambient Altitude HUD */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-400/30 pb-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-sky-950 border border-sky-400 font-mario text-[10px] text-sky-200">
                  ALTITUDE: {1000 * currentRung.rung}M
                </span>
                <span className="text-amber-300 font-bold">
                  POT: +{bankedPot} COINS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-amber-400/90 text-slate-950 font-mario text-[9px] font-black">
                  +5 SPEED BONUS (≤8s)
                </span>
                {bankedPot > 0 && (
                  <button
                    type="button"
                    onClick={cashOut}
                    className="min-h-[32px] px-3 py-1 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs border border-black shadow-[0_2px_0_#000] cursor-pointer active:translate-y-0.5"
                  >
                    Cash Out +{bankedPot}c
                  </button>
                )}
              </div>
            </div>

            {/* Lakitu Floating Cloud & Hero Climber Stage */}
            <div className="relative py-4 flex items-center justify-between min-h-[90px]">
              {/* Left: Hero Climber */}
              <div className="flex items-center gap-2.5 z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center shadow-[0_3px_0_#000] animate-bounce">
                  <MarioCharacterAvatar character={equippedAvatar} className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-mario text-amber-300 uppercase block">
                    CLIMBING FLOOR #{currentRung.rung}
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    Step onto the lawful cloud platform!
                  </span>
                </div>
              </div>

              {/* Right: Lakitu Cloud with Spinning Gold Coin */}
              <div className="flex items-center gap-2 z-10">
                <div className="bg-black/60 px-3 py-1.5 rounded-xl border border-sky-400/40 text-right">
                  <span className="text-[9px] font-mario text-sky-300 block">LAKITU SUMMIT POT</span>
                  <span className="text-sm font-black font-mono text-amber-300">+{currentRung.reward}c</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-300 border-2 border-black flex items-center justify-center shadow-[0_3px_0_#000] animate-pulse">
                  <Cloud className="w-7 h-7 text-slate-950" />
                </div>
              </div>
            </div>

            {/* Question Directive */}
            <div className="bg-slate-950/85 rounded-xl border border-sky-400/40 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mario text-amber-300 uppercase">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>STATUTORY CLIMB CHALLENGE #{currentRung.rung}</span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-white leading-snug break-words">
                {currentRung.q}
              </p>
            </div>
          </div>

          {/* Action Blast Banner */}
          {actionBanner && (
            <div
              className={`p-3 rounded-2xl border-3 flex flex-wrap items-center justify-between gap-2.5 shadow-[0_4px_0_#000] animate-bounce max-w-full min-w-0 ${
                actionBanner.isCorrect
                  ? 'bg-emerald-500 border-black text-slate-950 font-black'
                  : 'bg-rose-600 border-black text-white font-bold'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-black text-amber-300 flex items-center justify-center font-mario text-xs border border-white/20 shrink-0">
                  {actionBanner.isCorrect ? '!' : 'X'}
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-mario uppercase tracking-wide block truncate">
                    {actionBanner.text}
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono font-bold block truncate opacity-90">
                    {actionBanner.sub}
                  </span>
                </div>
              </div>
              {speedBonusAwarded && (
                <span className="px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-mario text-[9px] font-black shrink-0 shadow">
                  +5 SPEED BONUS!
                </span>
              )}
            </div>
          )}

          {/* 2 Bouncy Interactive Cloud Platforms with Leaping Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentRung.opts.map((opt, idx) => {
              const isSelected = pickedOption === idx;
              const isAnswer = idx === currentRung.ans;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={pickedOption !== null}
                  onClick={() => answerRung(idx)}
                  className={`min-h-[72px] p-4 rounded-2xl border-3 text-left transition-all cursor-pointer relative overflow-hidden group shadow-[0_5px_0_#000] active:translate-y-1 flex items-center justify-between gap-3 ${
                    pickedOption === null
                      ? 'bg-sky-950/80 hover:bg-sky-500 hover:text-slate-950 border-sky-400 text-white'
                      : isAnswer
                      ? 'bg-emerald-500 text-slate-950 border-black shadow-[0_0_18px_rgba(52,211,153,0.7)] scale-[1.02]'
                      : isSelected
                      ? 'bg-rose-600 text-white border-black scale-95'
                      : 'bg-slate-900/40 text-slate-500 border-slate-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-black text-sky-300 border-2 border-sky-400 flex flex-col items-center justify-center shrink-0 shadow-[0_2px_0_#000] font-mario text-xs">
                      <span>{idx === 0 ? '← A' : 'B →'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider block opacity-75">
                        {idx === 0 ? 'LEFT CLOUD JUMP' : 'RIGHT CLOUD JUMP'}
                      </span>
                      <span className="text-xs sm:text-sm font-display font-black block break-words leading-snug">
                        {opt}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-sky-400/20 border border-sky-400/40 group-hover:scale-110 transition-transform">
                    <Cloud className="w-5 h-5 shrink-0 text-sky-200" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {status !== 'climbing' && (
        <div className="bg-slate-900 border-3 border-amber-400 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-[0_8px_0_#000]">
          <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 border-3 border-black flex items-center justify-center mx-auto shadow-[0_4px_0_#000]">
            <Trophy className="w-9 h-9 text-slate-950" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              {status === 'won'
                ? `SUMMIT CLAIMED! +${bankedPot} COINS BANKED!`
                : 'THWOMP KNOCKOUT! POT LOST!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              {status === 'won'
                ? 'Mastery demonstrated! Your Mario Coins have been deposited directly into your wallet for Toad’s Shop!'
                : 'Tip: Equip Lakitu’s Cloud Shield (-12c) to survive one wrong answer on high floors!'}
            </p>
          </div>
          <button
            type="button"
            onClick={resetClimb}
            className="min-h-[48px] px-7 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl border-3 border-black font-mario text-xs sm:text-sm inline-flex items-center gap-2 cursor-pointer shadow-[0_4px_0_#000] active:translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CLIMB SKY TOWER AGAIN</span>
          </button>
        </div>
      )}
    </div>
  );
};
