import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { MarioAvatar } from '../types/laborLaw';
import { getHeroMeta } from '../data/heroesData';
import { marioAudio } from '../utils/audio';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
  MarioBowserIcon,
  MarioFireballIcon,
  MarioAxeIcon,
  MarioQuestionBlockIcon,
} from './MarioIcons';
import { ArcadeDoctrineCard } from './ArcadeDoctrineCard';
import {
  Play,
  RotateCcw,
  Hammer,
  Grid,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Trophy,
  Clock,
  Heart,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Search,
  Eye,
  Zap,
  Wind,
  FileText,
  Check,
  Activity,
} from 'lucide-react';
import {
  drawGoombaTargets,
  drawMultiplierMemoryPairs,
  drawContractorDockets,
  drawBridgePuzzle,
  drawPayrollCapsules,
  DeductionPipeTargetItem,
  ContractorDocketItem,
  BridgeDoctrineItem,
  PayrollCapsuleItem,
} from '../utils/gameQuestionDeck';
import { BowsersBridgeDoctrineDecoder } from './BowsersBridgeDoctrineDecoder';

interface MiniGameProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins: (amount: number) => void;
}

/* ============================================================================
   GAME 4: WHACK-A-GOOMBA: ILLEGAL DEDUCTION SMASHER (Art. 113-116)
   ============================================================================ */
export const WhackAGoombaGame: React.FC<MiniGameProps> = ({ equippedAvatar, onEarnCoins }) => {
  const hero = getHeroMeta(equippedAvatar);
  const [phase, setPhase] = useState<'title' | 'playing' | 'done'>('title');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(35);
  const [streak, setStreak] = useState(0);
  const [activePipes, setActivePipes] = useState<(DeductionPipeTargetItem | null)[]>(Array(9).fill(null));
  const [feedback, setFeedback] = useState<string>('Smash RED Goombas (Illegal Practices) — Spare GREEN Toads (Lawful Art. 113 Deductions)!');

  useEffect(() => {
    if (phase !== 'playing') return;

    const spawnInterval = setInterval(() => {
      setActivePipes(() => {
        const next: (DeductionPipeTargetItem | null)[] = Array(9).fill(null);
        const count = 2 + Math.floor(Math.random() * 2);
        const chosenIndices = new Set<number>();
        while (chosenIndices.size < count) {
          chosenIndices.add(Math.floor(Math.random() * 9));
        }
        const drawnTargets = drawGoombaTargets(count);
        Array.from(chosenIndices).forEach((pipeIdx, idx) => {
          next[pipeIdx] = drawnTargets[idx] ?? null;
        });
        return next;
      });
    }, 1450);

    const clockInterval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('done');
          marioAudio.playQuizComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(clockInterval);
    };
  }, [phase]);

  const startRound = () => {
    setScore(0);
    setLives(3);
    setStreak(0);
    setTimeLeft(35);
    setActivePipes(Array(9).fill(null));
    setFeedback('Smash Illegal Deductions! Do NOT hit Lawful Statutory Deductions!');
    setPhase('playing');
    marioAudio.playPowerUp();
  };

  const handleWhack = (idx: number) => {
    const target = activePipes[idx];
    if (!target || phase !== 'playing') return;

    const updated = [...activePipes];
    updated[idx] = null;
    setActivePipes(updated);

    if (target.isIllegal) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      let coins = 2;
      let bonusText = '';
      if (nextStreak >= 3) {
        coins += 5;
        bonusText = ' +5 SPEED BONUS!';
      }
      setScore((s) => s + 150 + nextStreak * 25);
      onEarnCoins(coins);
      setFeedback(`SMASHED!${bonusText} +${coins} Coins — ${target.ruleNote}`);
      marioAudio.playStomp();
      marioAudio.playCoin();
    } else {
      setStreak(0);
      setFeedback(`OOPS! That was LAWFUL: ${target.ruleNote}`);
      marioAudio.playBowserHit();
      setLives((l) => {
        const nextL = l - 1;
        if (nextL <= 0) setPhase('done');
        return nextL;
      });
    }
  };

  return (
    <div className="bg-[#1e293b] rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-6 text-white space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
              ARTICLES 102 & 112–116 • {hero.name.toUpperCase()}
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              WHACK-A-GOOMBA: DEDUCTION SMASHER
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 px-3.5 py-2 rounded-xl border-2 border-slate-700 tabular-nums">
          <span className="font-mario text-xs text-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {timeLeft}s
          </span>
          <span className="font-mario text-xs text-emerald-400">PTS: {score}</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map((h) => (
              <Heart
                key={h}
                className={`w-4 h-4 ${h <= lives ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-400 text-slate-950 px-3.5 py-2.5 rounded-xl border-2 border-black font-bold text-xs sm:text-sm flex items-center gap-2 max-w-full min-w-0">
        <Hammer className="w-4 h-4 shrink-0 text-red-700" />
        <span className="flex-1 min-w-0 break-words leading-tight">{feedback}</span>
      </div>

      {phase === 'title' && (
        <div className="bg-slate-900 rounded-2xl border-3 border-black p-8 text-center space-y-4">
          <Hammer className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-2xl sm:text-3xl font-black font-display">SMASH ILLEGAL WAGE DEDUCTIONS!</h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-semibold">
            Goombas pop out of 9 Warp Pipes carrying illegal wage deductions (cashier reserves without hearing, forced grocery cuts, undertime offsets). Smash them for +2 Coins, and spare green lawful Art. 113 deductions!
          </p>
          <button
            type="button"
            onClick={startRound}
            className="h-11 px-8 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer font-mario text-xs leading-none whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span>START SMASHING</span>
          </button>
        </div>
      )}

      {phase === 'playing' && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-slate-950 p-2.5 sm:p-4 rounded-2xl border-3 border-black">
          {activePipes.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleWhack(idx)}
              className={`min-h-[128px] sm:min-h-[160px] h-auto rounded-2xl border-3 border-black p-2 sm:p-3 flex flex-col items-center justify-between transition-all cursor-pointer ${
                item
                  ? item.isIllegal
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_0_#000] -translate-y-1'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_4px_0_#000] -translate-y-1'
                  : 'bg-slate-900 text-slate-500'
              }`}
            >
              {item ? (
                <>
                  <span className="text-[9px] font-black font-mario uppercase px-2 py-0.5 rounded bg-black/50 text-center leading-tight break-normal">
                    {item.isIllegal ? 'SMASH GOOMBA!' : 'LAWFUL • SPARE!'}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black leading-snug text-center my-auto break-normal [overflow-wrap:break-word] w-full px-1">
                    {item.label}
                  </span>
                  <div className="w-full h-3.5 mario-green-pipe rounded-md mt-1" />
                </>
              ) : (
                <>
                  <span className="text-[10px] font-mario text-slate-600 mt-3">PIPE {idx + 1}</span>
                  <div className="w-full h-6 mario-green-pipe rounded-lg" />
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {phase === 'done' && (
        <div className="bg-slate-900 rounded-2xl border-3 border-amber-400 p-8 text-center space-y-4">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-black font-display text-amber-300">SHIFT COMPLETE!</h3>
          <p className="text-sm font-bold text-slate-200">
            Final Deduction Audit Score: <span className="text-emerald-400 font-black">{score} PTS</span>
          </p>
          <button
            type="button"
            onClick={startRound}
            className="h-11 px-7 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer font-mario text-xs leading-none whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   GAME 5: MARIO PARTY: MULTIPLIER MEMORY MATCH (16 Flipping [?] Blocks)
   ============================================================================ */
interface MemoryCard {
  uid: string;
  pairId: string;
  text: string;
  kind: 'scenario' | 'rate';
}

const MEMORY_PAIR_COUNT = 8;

export const MultiplierMemoryGame: React.FC<MiniGameProps> = ({ equippedAvatar, onEarnCoins }) => {
  const [deck, setDeck] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const lockRef = useRef(false);

  const initDeck = () => {
    const selectedPairs = drawMultiplierMemoryPairs(MEMORY_PAIR_COUNT);
    const raw: MemoryCard[] = [];
    selectedPairs.forEach((p) => {
      raw.push({ uid: `${p.id}-s`, pairId: p.id, text: p.scenario, kind: 'scenario' });
      raw.push({ uid: `${p.id}-r`, pairId: p.id, text: p.rate, kind: 'rate' });
    });
    for (let i = raw.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [raw[i], raw[j]] = [raw[j], raw[i]];
    }
    setDeck(raw);
    setFlipped([]);
    setMatchedPairIds([]);
    setMoves(0);
    lockRef.current = false;
  };

  useEffect(() => {
    initDeck();
  }, []);

  const handleCardFlip = (idx: number) => {
    if (lockRef.current) return;
    if (flipped.includes(idx)) return;
    const card = deck[idx];
    if (!card || matchedPairIds.includes(card.pairId)) return;

    marioAudio.playJump();
    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      const first = deck[firstIdx];
      const second = deck[secondIdx];

      if (first.pairId === second.pairId) {
        const updatedMatches = [...matchedPairIds, first.pairId];
        setMatchedPairIds(updatedMatches);
        setFlipped([]);
        onEarnCoins(3);
        marioAudio.playCoin();
        if (updatedMatches.length === MEMORY_PAIR_COUNT) {
          onEarnCoins(20);
          marioAudio.playQuizComplete();
          try {
            confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
        }
      } else {
        lockRef.current = true;
        setTimeout(() => {
          setFlipped([]);
          lockRef.current = false;
        }, 780);
      }
    }
  };

  const allCleared = matchedPairIds.length === MEMORY_PAIR_COUNT && deck.length > 0;

  return (
    <div className="bg-[#1e293b] rounded-3xl mario-card border-4 border-slate-950 p-4 sm:p-6 text-white space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
              MARIO PARTY MEMORY TABLE • DOLE MULTIPLIERS
            </span>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white">
              MULTIPLIER MEMORY MATCH
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 px-3.5 py-2 rounded-xl border-2 border-slate-700 font-mario text-xs tabular-nums flex items-center gap-3">
            <span className="text-amber-300">PAIRS: {matchedPairIds.length}/8</span>
            <span className="text-cyan-300">MOVES: {moves}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              initDeck();
              marioAudio.playPowerUp();
            }}
            className="h-10 px-4 inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer text-xs leading-none whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {allCleared && (
        <div className="bg-emerald-900/90 border-3 border-amber-400 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <MarioStarIcon className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="font-black text-amber-300 font-display text-lg">ALL 8 STATUTORY MULTIPLIERS MATCHED!</h3>
              <p className="text-xs font-bold text-emerald-100">Completed in {moves} moves • +20 Bonus Mario Coins awarded!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={initDeck}
            className="h-10 px-5 inline-flex items-center justify-center gap-1.5 bg-amber-400 text-slate-950 font-black rounded-xl border-2 border-black cursor-pointer font-mario text-xs leading-none whitespace-nowrap"
          >
            NEW BOARD
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {deck.map((card, idx) => {
          const isRevealed = flipped.includes(idx) || matchedPairIds.includes(card.pairId);
          const isMatched = matchedPairIds.includes(card.pairId);
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleCardFlip(idx)}
              className={`min-h-[96px] sm:min-h-[112px] h-auto rounded-2xl border-3 border-black p-2 sm:p-2.5 flex flex-col items-center justify-center text-center transition-all cursor-pointer overflow-hidden break-normal [overflow-wrap:break-word] ${
                isMatched
                  ? 'bg-emerald-500 text-slate-950 shadow-[0_3px_0_#000]'
                  : isRevealed
                  ? card.kind === 'rate'
                    ? 'bg-amber-300 text-slate-950 shadow-[0_3px_0_#000]'
                    : 'bg-white text-slate-950 shadow-[0_3px_0_#000]'
                  : 'mario-question-block text-slate-950 hover:-translate-y-0.5'
              }`}
            >
              {isRevealed ? (
                <>
                  <span className="text-[9px] font-black font-mario uppercase opacity-75 mb-1 shrink-0">
                    {card.kind === 'rate' ? 'MULTIPLIER' : 'DAY SCENARIO'}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black leading-snug break-normal [overflow-wrap:break-word] min-w-0 px-0.5 w-full my-auto">{card.text}</span>
                </>
              ) : (
                <span className="font-mario text-2xl font-black text-slate-950">?</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   GAME 6: LUIGI'S MANSION: CONTRACTOR BUSTER (DOLE D.O. 174-17 Inspector)
   ============================================================================ */
export const ContractorBusterGame: React.FC<MiniGameProps> = ({ equippedAvatar, onEarnCoins }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onEarnCoinsRef = useRef(onEarnCoins);
  onEarnCoinsRef.current = onEarnCoins;

  const [cases, setCases] = useState<ContractorDocketItem[]>(() => drawContractorDockets(6));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [answered, setAnswered] = useState<null | { correct: boolean; message: string; action: 'bust' | 'certify' }>(null);
  const [completed, setCompleted] = useState(false);
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState<boolean>(false);

  const current = cases[idx] ?? cases[0];

  // Canvas simulation ref
  const simRef = useRef({
    luigiX: 180,
    luigiY: 280,
    ghostX: 520,
    ghostY: 180,
    ghostVx: 45,
    ghostVy: 25,
    ghostAlpha: 1.0,
    isSuctioning: false,
    isStamping: false,
    stampX: 0,
    stampY: 0,
    stampActive: false,
    shake: 0,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    keys: new Set<string>(),
    roundStartTime: Date.now(),
  });

  const resetRound = useCallback(() => {
    const sim = simRef.current;
    sim.luigiX = 180;
    sim.luigiY = 280;
    sim.ghostX = 520;
    sim.ghostY = 180;
    sim.ghostVx = (Math.random() > 0.5 ? 1 : -1) * 50;
    sim.ghostVy = (Math.random() > 0.5 ? 1 : -1) * 30;
    sim.ghostAlpha = 1.0;
    sim.isSuctioning = false;
    sim.isStamping = false;
    sim.stampActive = false;
    sim.shake = 0;
    sim.particles = [];
    sim.roundStartTime = Date.now();
    setAnswered(null);
    setSpeedBonusAwarded(false);
  }, []);

  const handleAction = useCallback((declareLaborOnly: boolean) => {
    if (answered || !current) return;
    const sim = simRef.current;
    const isCorrect = declareLaborOnly === current.isLaborOnly;
    const isFast = Date.now() - sim.roundStartTime <= 8000;

    if (declareLaborOnly) {
      sim.isSuctioning = true;
      marioAudio.playPowerUp();
      sim.ghostAlpha = 0.2;
    } else {
      sim.isStamping = true;
      sim.stampActive = true;
      sim.stampX = sim.ghostX;
      sim.stampY = sim.ghostY;
      marioAudio.playCoin();
    }

    if (isCorrect) {
      setScore((s) => s + 150);
      let coins = 5;
      if (isFast) {
        coins += 5;
        setSpeedBonusAwarded(true);
      }
      onEarnCoinsRef.current(coins);
      marioAudio.playCoin();
      sim.shake = 0.3;
    } else {
      marioAudio.playBowserHit();
      sim.shake = 0.6;
      setLives((l) => Math.max(0, l - 1));
    }

    setAnswered({
      correct: isCorrect,
      message: current.verdictNote,
      action: declareLaborOnly ? 'bust' : 'certify',
    });
  }, [answered, current]);

  // Key listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') simRef.current.keys.add('left');
      if (k === 'arrowright' || k === 'd') simRef.current.keys.add('right');
      if (k === 'arrowup' || k === 'w') simRef.current.keys.add('up');
      if (k === 'arrowdown' || k === 's') simRef.current.keys.add('down');
      if (k === ' ' || k === 'f') {
        e.preventDefault();
        handleAction(true); // Bust Labor Only
      } else if (k === 'e' || k === 'c') {
        e.preventDefault();
        handleAction(false); // Certify Legitimate
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') simRef.current.keys.delete('left');
      if (k === 'arrowright' || k === 'd') simRef.current.keys.delete('right');
      if (k === 'arrowup' || k === 'w') simRef.current.keys.delete('up');
      if (k === 'arrowdown' || k === 's') simRef.current.keys.delete('down');
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [handleAction]);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;
      const sim = simRef.current;

      if (sim.shake > 0) sim.shake = Math.max(0, sim.shake - dt * 2.5);

      // Player Movement
      const speed = 220;
      if (sim.keys.has('left')) sim.luigiX -= speed * dt;
      if (sim.keys.has('right')) sim.luigiX += speed * dt;
      if (sim.keys.has('up')) sim.luigiY -= speed * dt;
      if (sim.keys.has('down')) sim.luigiY += speed * dt;
      sim.luigiX = Math.max(60, Math.min(680, sim.luigiX));
      sim.luigiY = Math.max(120, Math.min(340, sim.luigiY));

      // Ghost Patrol & Floating
      sim.ghostX += sim.ghostVx * dt;
      sim.ghostY += sim.ghostVy * dt + Math.sin(now * 0.005) * 0.5;
      if (sim.ghostX < 360 || sim.ghostX > 680) sim.ghostVx = -sim.ghostVx;
      if (sim.ghostY < 100 || sim.ghostY > 300) sim.ghostVy = -sim.ghostVy;

      // Vacuum particles
      if (sim.isSuctioning) {
        sim.particles.push({
          x: sim.ghostX + (Math.random() - 0.5) * 30,
          y: sim.ghostY + (Math.random() - 0.5) * 30,
          vx: (sim.luigiX - sim.ghostX) * 2.2,
          vy: (sim.luigiY - sim.ghostY) * 2.2,
          life: 0.35,
          color: '#38bdf8',
        });
      }

      sim.particles = sim.particles.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        return p.life > 0;
      });

      // DRAW
      ctx.save();
      if (sim.shake > 0) {
        const off = sim.shake * 7;
        ctx.translate((Math.random() - 0.5) * off, (Math.random() - 0.5) * off);
      }

      // Dark Haunted Chamber Background
      ctx.fillStyle = '#060b18';
      ctx.fillRect(0, 0, 760, 380);

      // Grid
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 40; x < 760; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 380);
        ctx.stroke();
      }

      // Flashlight Cone from Luigi to Ghost
      const ang = Math.atan2(sim.ghostY - sim.luigiY, sim.ghostX - sim.luigiX);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(sim.luigiX, sim.luigiY);
      ctx.arc(sim.luigiX, sim.luigiY, 400, ang - 0.35, ang + 0.35);
      ctx.closePath();
      const grad = ctx.createRadialGradient(sim.luigiX, sim.luigiY, 20, sim.luigiX, sim.luigiY, 400);
      grad.addColorStop(0, 'rgba(52, 211, 153, 0.35)');
      grad.addColorStop(1, 'rgba(52, 211, 153, 0)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();

      // Ghost Entity
      ctx.save();
      ctx.globalAlpha = sim.ghostAlpha;
      ctx.translate(sim.ghostX, sim.ghostY);
      ctx.fillStyle = current.isLaborOnly ? 'rgba(168, 85, 247, 0.85)' : 'rgba(52, 211, 153, 0.85)';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyes
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(-8, -4, 4, 0, Math.PI * 2);
      ctx.arc(8, -4, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label tag
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.beginPath();
      ctx.roundRect(-70, -50, 140, 20, 6);
      ctx.fill();
      ctx.fillStyle = current.isLaborOnly ? '#e9d5ff' : '#a7f3d0';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(current.isLaborOnly ? 'LABOR-ONLY INTERMEDIARY' : 'LEGITIMATE CONTRACTOR', 0, -36);
      ctx.restore();

      // Luigi
      ctx.save();
      ctx.translate(sim.luigiX, sim.luigiY);
      ctx.fillStyle = '#16a34a';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Poltergust Nozzle
      ctx.rotate(ang);
      ctx.fillStyle = '#475569';
      ctx.fillRect(8, -5, 26, 10);
      ctx.fillStyle = sim.isSuctioning ? '#38bdf8' : '#e2e8f0';
      ctx.beginPath();
      ctx.arc(34, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Particles
      for (const p of sim.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
      ctx.globalAlpha = 1;

      ctx.restore();
      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, [current]);

  const nextCase = () => {
    if (idx < cases.length - 1) {
      setIdx((i) => i + 1);
      resetRound();
      marioAudio.playPipe();
    } else {
      setCompleted(true);
      onEarnCoinsRef.current(15);
      marioAudio.playQuizComplete();
    }
  };

  const resetCases = () => {
    setCases(drawContractorDockets(6));
    setIdx(0);
    setScore(0);
    setLives(3);
    setCompleted(false);
    resetRound();
    marioAudio.playPowerUp();
  };

  return (
    <div className="bg-[#0b1120] rounded-3xl border-4 border-slate-950 p-3 sm:p-5 text-white space-y-4 max-w-4xl mx-auto shadow-[0_12px_36px_rgba(0,0,0,0.8)] select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-emerald-900/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-emerald-400 rounded-2xl border-3 border-black flex items-center justify-center shrink-0 shadow-[0_3px_0_#000]">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 font-mario tracking-wider block">
              DOLE D.O. 174-17 · POLTERGUST ACTION ARENA
            </span>
            <h2 className="text-base sm:text-xl font-black font-display text-white">
              LUIGI&apos;S MANSION: CONTRACTOR BUSTER
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-emerald-500/40">
            DOCKET <strong className="text-amber-300">{idx + 1}</strong>/{cases.length}
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-emerald-500/40">
            SCORE <strong className="text-emerald-400">{score}</strong>
          </div>
          <div className="flex items-center gap-1" aria-label={`Lives: ${lives}`}>
            {[0, 1, 2].map((i) => (
              <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-800'}`} />
            ))}
          </div>
        </div>
      </div>

      {!completed ? (
        <div className="space-y-4">
          {/* Real-time Canvas Stage */}
          <div className="relative rounded-2xl border-3 border-emerald-500/50 overflow-hidden bg-slate-950">
            <canvas ref={canvasRef} width={760} height={380} className="w-full h-auto block cursor-crosshair" />

            {/* Tactical Factor Overlay Box at Top */}
            <div className="absolute top-2 inset-x-2 bg-slate-950/90 rounded-xl border border-emerald-500/40 p-2 sm:p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] sm:text-xs font-mono">
              <div>
                <span className="text-slate-400 block font-bold">1. Capital:</span>
                <strong className={current.capital.includes('₱5,') ? 'text-emerald-400' : 'text-rose-400'}>
                  {current.capital.split(' ')[0]}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">2. Registry:</span>
                <strong className={current.registration.toLowerCase().includes('unreg') ? 'text-rose-400' : 'text-emerald-400'}>
                  {current.registration.toLowerCase().includes('unreg') ? 'UNREGISTERED' : 'REGISTERED'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">3. Control:</span>
                <strong className="text-amber-300 truncate block">{current.controlHolder.split('·')[0].trim()}</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">4. Work:</span>
                <strong className="text-sky-300 truncate block">{current.workRelation.split('·')[0].trim()}</strong>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!answered ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleAction(true)}
                className="min-h-[52px] px-4 py-2.5 bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm font-mario active:translate-y-0.5"
              >
                <Wind className="w-5 h-5 text-cyan-300" />
                <span>[SPACE / F] POLTERGUST VACUUM BUST (Labor-Only)</span>
              </button>

              <button
                type="button"
                onClick={() => handleAction(false)}
                className="min-h-[52px] px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm font-mario active:translate-y-0.5"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
                <span>[E / C] STAMP ACCREDITATION (Legitimate D.O. 174)</span>
              </button>
            </div>
          ) : (
            <ArcadeDoctrineCard
              title={current.agencyName}
              statute="DOLE D.O. No. 174-17 · Arts. 106–109, Labor Code"
              rule={`Capital: ${current.capital} · Registry: ${current.registration} · Control: ${current.controlHolder}`}
              takeaway={`${answered.message} Controlling Doctrine: ${current.verdictNote}`}
              isCorrect={answered.correct}
              speedBonusAwarded={speedBonusAwarded}
              worldCode="w2"
              scenarioText={`Dossier: ${current.agencyName}`}
              chosenAnswerText={answered.action === 'bust' ? 'Poltergust Vacuum (Labor-Only)' : 'DOLE Accreditation (Legitimate)'}
              correctAnswerText={current.isLaborOnly ? 'Labor-Only Intermediary' : 'Legitimate Contractor'}
              advanceLabel={idx + 1 >= cases.length ? 'Finish Mansion Audit' : 'Next Contractor Dossier →'}
              onAdvance={nextCase}
            />
          )}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border-3 border-emerald-400 p-8 text-center space-y-4">
          <Trophy className="w-14 h-14 text-amber-400 mx-auto" />
          <h3 className="text-2xl font-black font-display text-emerald-300">MANSION AUDIT CLEARED!</h3>
          <p className="text-sm font-bold text-slate-200">Final Score: {score} · +15 Coins Earned!</p>
          <button
            type="button"
            onClick={resetCases}
            className="min-h-[46px] px-8 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-3 border-black font-mario text-xs cursor-pointer shadow-[0_3px_0_#000]"
          >
            INSPECT AGAIN
          </button>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
   GAME 7: BOWSER'S BRIDGE: STATUTORY DOCTRINE RESCUE (Word Decoder & Golden Axe)
   ============================================================================ */
export const BowsersBridgeGame: React.FC<MiniGameProps> = (props) => {
  return <BowsersBridgeDoctrineDecoder {...props} />;
};

const LegacyBowsersBridgeGame: React.FC<MiniGameProps> = ({ equippedAvatar, onEarnCoins }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onEarnCoinsRef = useRef(onEarnCoins);
  onEarnCoinsRef.current = onEarnCoins;

  const [puzzle, setPuzzle] = useState<BridgeDoctrineItem>(() => drawBridgePuzzle());
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [bridgeCollapsed, setBridgeCollapsed] = useState(false);
  const [victory, setVictory] = useState(false);
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState(false);

  // Mario and Bowser physics
  const simRef = useRef({
    marioX: 80,
    marioY: 280,
    marioVy: 0,
    marioOnGround: true,
    bowserX: 560,
    bowserY: 270,
    bowserVy: 0,
    bowserHp: 3,
    axeX: 710,
    axeY: 260,
    fireballs: [] as { x: number; y: number; vx: number }[],
    keys: new Set<string>(),
    shake: 0,
    bridgeCollapseT: 0,
    roundStartTime: Date.now(),
  });

  const resetRound = useCallback(() => {
    const sim = simRef.current;
    sim.marioX = 80;
    sim.marioY = 280;
    sim.marioVy = 0;
    sim.marioOnGround = true;
    sim.bowserX = 560;
    sim.bowserY = 270;
    sim.bowserVy = 0;
    sim.bowserHp = 3;
    sim.fireballs = [];
    sim.shake = 0;
    sim.bridgeCollapseT = 0;
    sim.roundStartTime = Date.now();
    setBridgeCollapsed(false);
    setVictory(false);
    setSpeedBonusAwarded(false);
  }, []);

  const jump = useCallback(() => {
    const sim = simRef.current;
    if (sim.marioOnGround && !bridgeCollapsed) {
      sim.marioVy = -480;
      sim.marioOnGround = false;
      marioAudio.playJump();
    }
  }, [bridgeCollapsed]);

  // Key listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') simRef.current.keys.add('left');
      if (k === 'arrowright' || k === 'd') simRef.current.keys.add('right');
      if (k === ' ' || k === 'arrowup' || k === 'w') {
        e.preventDefault();
        jump();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') simRef.current.keys.delete('left');
      if (k === 'arrowright' || k === 'd') simRef.current.keys.delete('right');
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [jump]);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();
    let fireballTimer = 0;

    const render = (now: number) => {
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;
      const sim = simRef.current;

      if (sim.shake > 0) sim.shake = Math.max(0, sim.shake - dt * 2.5);

      if (!bridgeCollapsed && !victory) {
        // Mario Movement
        const speed = 250;
        if (sim.keys.has('left')) sim.marioX -= speed * dt;
        if (sim.keys.has('right')) sim.marioX += speed * dt;
        sim.marioX = Math.max(30, Math.min(730, sim.marioX));

        // Gravity
        sim.marioY += sim.marioVy * dt;
        sim.marioVy += 1300 * dt;
        if (sim.marioY >= 280) {
          sim.marioY = 280;
          sim.marioVy = 0;
          sim.marioOnGround = true;
        }

        // Bowser Jump AI & Fireball breath
        fireballTimer += dt;
        if (fireballTimer > 1.8) {
          fireballTimer = 0;
          sim.fireballs.push({
            x: sim.bowserX - 20,
            y: sim.bowserY - 10,
            vx: -240,
          });
          marioAudio.playFireball();
          // Bowser leaps
          sim.bowserVy = -260;
        }

        sim.bowserY += sim.bowserVy * dt;
        sim.bowserVy += 900 * dt;
        if (sim.bowserY >= 270) {
          sim.bowserY = 270;
          sim.bowserVy = 0;
        }

        // Fireballs movement & collision with Mario
        sim.fireballs = sim.fireballs.filter((fb) => {
          fb.x += fb.vx * dt;
          const dist = Math.hypot(fb.x - sim.marioX, fb.y - sim.marioY);
          if (dist < 24) {
            sim.shake = 0.5;
            marioAudio.playBowserHit();
            setLives((l) => Math.max(0, l - 1));
            return false;
          }
          return fb.x > 0;
        });

        // Mario reaches the Golden Axe switch at x >= 700!
        if (sim.marioX >= 690 && sim.marioY <= 285) {
          setBridgeCollapsed(true);
          sim.shake = 0.8;
          marioAudio.playFanfare();
          const isFast = Date.now() - sim.roundStartTime <= 12000;
          let coins = 8;
          if (isFast) {
            coins += 5;
            setSpeedBonusAwarded(true);
          }
          setScore((s) => s + 250);
          onEarnCoinsRef.current(coins);
          setTimeout(() => setVictory(true), 1400);
        }
      } else if (bridgeCollapsed) {
        sim.bridgeCollapseT += dt * 3;
        sim.bowserY += 320 * dt; // Bowser plunges into lava!
      }

      // DRAW CANVAS
      ctx.save();
      if (sim.shake > 0) {
        const off = sim.shake * 8;
        ctx.translate((Math.random() - 0.5) * off, (Math.random() - 0.5) * off);
      }

      // Dark Castle Keep Background
      ctx.fillStyle = '#0f0714';
      ctx.fillRect(0, 0, 760, 380);

      // Bubbling Lava Pit at Bottom
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, 320, 760, 60);
      ctx.fillStyle = '#f97316';
      for (let bx = 10; bx < 760; bx += 30) {
        ctx.beginPath();
        ctx.arc(bx + Math.sin(now * 0.006 + bx) * 8, 324, 6 + Math.sin(now * 0.01 + bx) * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stone Castle Pillars on Left and Right
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 160, 60, 160);
      ctx.fillRect(700, 160, 60, 160);

      // Drawbridge Blocks (x: 60 to 700)
      if (!bridgeCollapsed) {
        ctx.fillStyle = '#78350f';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.5;
        for (let bx = 60; bx < 700; bx += 32) {
          ctx.beginPath();
          ctx.roundRect(bx, 300, 30, 20, 4);
          ctx.fill();
          ctx.stroke();
        }
      } else {
        // Collapsing Drawbridge falling into lava
        ctx.fillStyle = '#78350f';
        for (let bx = 60; bx < 700; bx += 32) {
          const fallDist = Math.max(0, (sim.bridgeCollapseT * 60) * Math.sin((bx - 60) * 0.008));
          ctx.beginPath();
          ctx.roundRect(bx, 300 + fallDist, 30, 20, 4);
          ctx.fill();
        }
      }

      // Golden Axe Switch at (710, 260)
      ctx.save();
      ctx.translate(sim.axeX, sim.axeY);
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-3, 14, 6, 24);
      ctx.restore();

      // Bowser Boss
      ctx.save();
      ctx.translate(sim.bowserX, sim.bowserY);
      ctx.fillStyle = '#15803d';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Bowser Shell Spikes
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(10, -10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Fireballs
      for (const fb of sim.fireballs) {
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(fb.x, fb.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(fb.x + 2, fb.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Mario Hero
      ctx.save();
      ctx.translate(sim.marioX, sim.marioY);
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Cap
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(0, -6, 11, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.restore();
      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, [bridgeCollapsed, victory]);

  const nextChallenge = () => {
    setPuzzle(drawBridgePuzzle());
    resetRound();
    marioAudio.playPowerUp();
  };

  return (
    <div className="bg-[#1e132b] rounded-3xl border-4 border-slate-950 p-3 sm:p-5 text-white space-y-4 max-w-4xl mx-auto shadow-[0_12px_36px_rgba(0,0,0,0.8)] select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-red-900/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-red-600 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
              CASTLE LAVA BRIDGE • AXE BATTLE ARENA
            </span>
            <h2 className="text-base sm:text-xl font-black font-display text-white">
              BOWSER&apos;S BRIDGE: DOCTRINE RESCUE
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-red-500/40">
            SCORE <strong className="text-amber-300">{score}</strong>
          </div>
          <div className="flex items-center gap-1" aria-label={`Lives: ${lives}`}>
            {[0, 1, 2].map((i) => (
              <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-800'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Statutory Clue Banner */}
      <div className="bg-red-950/80 border border-red-500/40 rounded-xl p-3 text-xs sm:text-sm font-bold text-amber-200">
        <span className="text-amber-400 font-mario text-[10px] uppercase block">STATUTORY DOCTRINE MISSION:</span>
        {puzzle.clue}
      </div>

      {/* Canvas Arena */}
      <div className="relative rounded-2xl border-3 border-red-500/50 overflow-hidden bg-slate-950 min-h-[300px] sm:min-h-[340px] flex items-center justify-center">
        <canvas ref={canvasRef} width={760} height={380} className="w-full h-auto max-h-[340px] block" />

        {/* Victory Modal */}
        {victory && (
          <div className="absolute inset-0 z-30 bg-slate-950/92 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-slate-900 border-3 border-amber-400 rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center space-y-3 shadow-[0_10px_0_#000] my-auto overflow-y-auto max-h-full">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce shrink-0" />
              <h3 className="text-lg sm:text-xl font-black font-display text-amber-300 leading-tight">
                BOWSER DROPPED! DOCTRINE RESCUED!
              </h3>
              <p className="text-xs font-mono text-slate-300">
                Term: <strong className="text-emerald-300 font-black">{puzzle.word}</strong>
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={nextChallenge}
                  className="min-h-[48px] w-full px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black font-mario text-xs cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5 transition-transform"
                >
                  NEXT CASTLE STAGE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          type="button"
          onPointerDown={() => simRef.current.keys.add('left')}
          onPointerUp={() => simRef.current.keys.delete('left')}
          className="min-h-[46px] rounded-xl bg-slate-800 text-white font-black border-2 border-slate-700 flex items-center justify-center gap-1 text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RUN LEFT</span>
        </button>

        <button
          type="button"
          onClick={jump}
          className="min-h-[46px] rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black border-2 border-black flex items-center justify-center gap-1 text-xs font-mario cursor-pointer shadow-[0_3px_0_#000]"
        >
          <ArrowUp className="w-4 h-4" />
          <span>JUMP OVER FIRE</span>
        </button>

        <button
          type="button"
          onPointerDown={() => simRef.current.keys.add('right')}
          onPointerUp={() => simRef.current.keys.delete('right')}
          className="min-h-[46px] rounded-xl bg-slate-800 text-white font-black border-2 border-slate-700 flex items-center justify-center gap-1 text-xs cursor-pointer"
        >
          <span>RUN TO AXE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
   GAME 8: DR. MARIO: HOLIDAY & WAGE PIPE SORTER (Active 3-Lane Conveyor Arena)
   ============================================================================ */
export const HolidayWageSorterGame: React.FC<MiniGameProps> = ({ equippedAvatar, onEarnCoins }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onEarnCoinsRef = useRef(onEarnCoins);
  onEarnCoinsRef.current = onEarnCoins;

  const [capsules, setCapsules] = useState<PayrollCapsuleItem[]>(() => drawPayrollCapsules(8));
  const [capsuleIdx, setCapsuleIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [completed, setCompleted] = useState(false);
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState(false);

  const currentCapsule = capsules[capsuleIdx] ?? capsules[0];

  // Physics simulation ref
  const simRef = useRef({
    laneIdx: 1, // 0: Left (100%), 1: Center (130-150%), 2: Right (200-390%)
    capsuleY: 60,
    capsuleSpeed: 130,
    capsuleRolling: true,
    shake: 0,
    particles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    roundStartTime: Date.now(),
  });

  const resetRound = useCallback(() => {
    const sim = simRef.current;
    sim.laneIdx = 1;
    sim.capsuleY = 60;
    sim.capsuleSpeed = 140;
    sim.capsuleRolling = true;
    sim.shake = 0;
    sim.particles = [];
    sim.roundStartTime = Date.now();
    setSpeedBonusAwarded(false);
  }, []);

  const routeToLane = useCallback((targetLane: number) => {
    const sim = simRef.current;
    if (!sim.capsuleRolling || completed) return;
    sim.laneIdx = targetLane;
    sim.capsuleRolling = false;

    // Check correctness
    // lane 0: base100, lane 1: special130, lane 2: regular200
    const laneBuckets = ['base100', 'special130', 'regular200'];
    const chosenBucket = laneBuckets[targetLane];
    const isCorrect = chosenBucket === currentCapsule.bucket;
    const isFast = Date.now() - sim.roundStartTime <= 8000;

    if (isCorrect) {
      setStreak((st) => {
        const next = st + 1;
        const pts = 100 + next * 25;
        setScore((s) => s + pts);
        return next;
      });
      let coins = 3;
      if (isFast) {
        coins += 5;
        setSpeedBonusAwarded(true);
      }
      onEarnCoinsRef.current(coins);
      marioAudio.playCoin();
      sim.shake = 0.25;
    } else {
      setStreak(0);
      marioAudio.playBowserHit();
      sim.shake = 0.6;
      setLives((l) => Math.max(0, l - 1));
    }

    if (capsuleIdx + 1 >= capsules.length) {
      setTimeout(() => {
        setCompleted(true);
        onEarnCoinsRef.current(15);
        marioAudio.playQuizComplete();
      }, 600);
    } else {
      setTimeout(() => {
        setCapsuleIdx((i) => i + 1);
        resetRound();
      }, 600);
    }
  }, [capsuleIdx, capsules.length, completed, currentCapsule.bucket, resetRound]);

  // Key listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === '1' || k === 'a' || k === 'arrowleft') routeToLane(0);
      else if (k === '2' || k === 'w' || k === 'arrowup') routeToLane(1);
      else if (k === '3' || k === 'd' || k === 'arrowright') routeToLane(2);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [routeToLane]);

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;
      const sim = simRef.current;

      if (sim.shake > 0) sim.shake = Math.max(0, sim.shake - dt * 2.5);

      if (sim.capsuleRolling && !completed) {
        sim.capsuleY += sim.capsuleSpeed * dt;
        if (sim.capsuleY >= 310) {
          // Auto route to current lane if not steered in time
          routeToLane(sim.laneIdx);
        }
      }

      // DRAW CANVAS
      ctx.save();
      if (sim.shake > 0) {
        const off = sim.shake * 7;
        ctx.translate((Math.random() - 0.5) * off, (Math.random() - 0.5) * off);
      }

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 760, 380);

      // 3 Conveyor Belts (Lanes)
      const laneCenters = [180, 380, 580];
      for (let l = 0; l < 3; l++) {
        const lx = laneCenters[l];
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(lx - 55, 40, 110, 270);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(lx - 55, 40, 110, 270);

        // Conveyor moving stripes
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        for (let sy = 40; sy < 310; sy += 25) {
          const moveY = (sy + (now * 0.06) % 25);
          if (moveY < 310) {
            ctx.beginPath();
            ctx.moveTo(lx - 50, moveY);
            ctx.lineTo(lx + 50, moveY);
            ctx.stroke();
          }
        }
      }

      // 3 Statutory Multiplier Pipes at bottom
      const PIPE_COLORS = ['#38bdf8', '#fbbf24', '#f43f5e'];
      const PIPE_LABELS = ['100% BASIC', '130%–150% REST/SD', '200%–390% HOLIDAY'];
      for (let l = 0; l < 3; l++) {
        const lx = laneCenters[l];
        ctx.fillStyle = PIPE_COLORS[l];
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(lx - 65, 310, 130, 65, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#020617';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(PIPE_LABELS[l], lx, 335);
        ctx.fillText(`[${l + 1}] PIPE ${String.fromCharCode(65 + l)}`, lx, 355);
      }

      // Active Rolling Capsule
      const capX = laneCenters[sim.laneIdx];
      ctx.save();
      ctx.translate(capX, sim.capsuleY);
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(-4, -4, 5, 0, Math.PI * 2);
      ctx.fill();

      // Title
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(-60, -38, 120, 20, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(currentCapsule.title.slice(0, 18), 0, -24);
      ctx.restore();

      ctx.restore();
      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, [completed, currentCapsule, routeToLane]);

  const restartSorter = () => {
    setCapsules(drawPayrollCapsules(8));
    setCapsuleIdx(0);
    setScore(0);
    setStreak(0);
    setLives(3);
    setCompleted(false);
    resetRound();
    marioAudio.playPowerUp();
  };

  return (
    <div className="bg-[#1e293b] rounded-3xl border-4 border-slate-950 p-3 sm:p-5 text-white space-y-4 max-w-4xl mx-auto shadow-[0_12px_36px_rgba(0,0,0,0.8)] select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-700 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-cyan-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-cyan-300 font-mario block">
              DR. MARIO PAYROLL CLINIC • 3-CONVEYOR ACTION ARENA
            </span>
            <h2 className="text-base sm:text-xl font-black font-display text-white">
              HOLIDAY & WAGE PIPE SORTER
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-cyan-500/40">
            CAPSULE <strong className="text-amber-300">{capsuleIdx + 1}</strong>/{capsules.length}
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-cyan-500/40">
            SCORE <strong className="text-emerald-400">{score}</strong>
          </div>
          <div className="flex items-center gap-1" aria-label={`Lives: ${lives}`}>
            {[0, 1, 2].map((i) => (
              <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-800'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Capsule Prompt Banner */}
      <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-3 text-xs sm:text-sm font-bold text-amber-200">
        <span className="text-[10px] font-mario text-amber-400 uppercase block">INCOMING PAYROLL CAPSULE:</span>
        {currentCapsule.title} · <span className="text-slate-300">{currentCapsule.note}</span>
      </div>

      {/* Canvas Arena */}
      <div className="relative rounded-2xl border-3 border-cyan-500/50 overflow-hidden bg-slate-950 min-h-[300px] sm:min-h-[340px] flex items-center justify-center">
        <canvas ref={canvasRef} width={760} height={380} className="w-full h-auto max-h-[340px] block" />

        {completed && (
          <div className="absolute inset-0 z-30 bg-slate-950/92 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-slate-900 border-3 border-cyan-400 rounded-3xl p-5 sm:p-6 max-w-sm w-full text-center space-y-3 shadow-[0_10px_0_#000] my-auto overflow-y-auto max-h-full">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto animate-bounce shrink-0" />
              <h3 className="text-lg sm:text-xl font-black font-display text-cyan-300">ALL CAPSULES SORTED!</h3>
              <p className="text-xs font-mono text-slate-300">Final Score: {score} · +15 Coins Won!</p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={restartSorter}
                  className="min-h-[48px] w-full px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black font-mario text-xs cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5 transition-transform"
                >
                  SORT AGAIN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Switcher Controls */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => routeToLane(0)}
          className="min-h-[50px] p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black border-2 border-black flex flex-col items-center justify-center cursor-pointer shadow-[0_3px_0_#000]"
        >
          <span className="text-xs font-mario">[1 / A] PIPE A</span>
          <span className="text-[9px] font-mono text-sky-200">100% Basic Day</span>
        </button>

        <button
          type="button"
          onClick={() => routeToLane(1)}
          className="min-h-[50px] p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black border-2 border-black flex flex-col items-center justify-center cursor-pointer shadow-[0_3px_0_#000]"
        >
          <span className="text-xs font-mario">[2 / W] PIPE B</span>
          <span className="text-[9px] font-mono text-slate-950 font-extrabold">130%–150% Rest/SD</span>
        </button>

        <button
          type="button"
          onClick={() => routeToLane(2)}
          className="min-h-[50px] p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black border-2 border-black flex flex-col items-center justify-center cursor-pointer shadow-[0_3px_0_#000]"
        >
          <span className="text-xs font-mario">[3 / D] PIPE C</span>
          <span className="text-[9px] font-mono text-rose-200">200%–390% Holiday</span>
        </button>
      </div>
    </div>
  );
};

