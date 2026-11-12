import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import { MarioCharacterAvatar, MarioCoinIcon, MarioPipeIcon, MarioStarIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { RotateCcw, Trophy, Check, X, ArrowLeft, ArrowRight, Zap, Play, Heart, Sparkles } from 'lucide-react';
import { drawWarpPipeSorterDeck, WarpSorterItem } from '../utils/gameQuestionDeck';

interface WarpPipeSorterProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins: (amount: number) => void;
}

export const WarpPipeSorter: React.FC<WarpPipeSorterProps> = ({
  equippedAvatar,
  onEarnCoins,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onEarnCoinsRef = useRef(onEarnCoins);
  onEarnCoinsRef.current = onEarnCoins;

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover'>('start');
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [coinsWon, setCoinsWon] = useState<number>(0);
  const [activeItem, setActiveItem] = useState<WarpSorterItem | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string>('Steer the diverter paddle left or right to route capsules into the correct statutory pipe!');

  const deckRef = useRef<WarpSorterItem[]>([]);
  const deckIdxRef = useRef<number>(0);

  // Physics simulation state
  const simRef = useRef({
    paddleAngle: 0, // -0.55 rad (left) to +0.55 rad (right)
    capsuleX: 380,
    capsuleY: 80,
    capsuleVx: 0,
    capsuleVy: 140,
    capsuleRadius: 22,
    capsuleRolling: true,
    shake: 0,
    steamParticles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[],
    keys: new Set<string>(),
  });

  const getNextItem = useCallback(() => {
    if (deckIdxRef.current >= deckRef.current.length) {
      deckRef.current = drawWarpPipeSorterDeck(16);
      deckIdxRef.current = 0;
    }
    const item = deckRef.current[deckIdxRef.current++];
    setActiveItem(item);
    // Reset capsule physics at top chute
    const sim = simRef.current;
    sim.capsuleX = 380;
    sim.capsuleY = 70;
    sim.capsuleVx = 0;
    sim.capsuleVy = 160;
    sim.capsuleRolling = true;
    return item;
  }, []);

  const startNewGame = useCallback(() => {
    deckRef.current = drawWarpPipeSorterDeck(16);
    deckIdxRef.current = 0;
    setScore(0);
    setStreak(0);
    setLives(3);
    setTimeLeft(45);
    setCoinsWon(0);
    simRef.current.shake = 0;
    simRef.current.steamParticles = [];
    simRef.current.paddleAngle = 0;
    simRef.current.keys.clear();
    setLastFeedback('Warp Pipes energized! Divert Covered practices to GREEN (Left) and Exempt to RED (Right)!');
    setGameState('playing');
    getNextItem();
    marioAudio.playPowerUp();
  }, [getNextItem]);

  // Clock countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setGameState('gameover');
          marioAudio.playQuizComplete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (gameState === 'start' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        startNewGame();
        return;
      }
      if (gameState !== 'playing') return;

      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') simRef.current.keys.add('left');
      if (k === 'arrowright' || k === 'd') simRef.current.keys.add('right');
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') simRef.current.keys.delete('left');
      if (k === 'arrowright' || k === 'd') simRef.current.keys.delete('right');
    };

    const clearHeld = () => simRef.current.keys.clear();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearHeld);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearHeld);
    };
  }, [gameState, startNewGame]);

  const steerPaddle = (dir: 'left' | 'right' | 'center') => {
    if (dir === 'left') simRef.current.paddleAngle = -0.65;
    else if (dir === 'right') simRef.current.paddleAngle = 0.65;
    else simRef.current.paddleAngle = 0;
  };

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();

    const spawnSteam = (x: number, y: number, color: string, count: number) => {
      for (let i = 0; i < count; i++) {
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
        const spd = 60 + Math.random() * 120;
        simRef.current.steamParticles.push({
          x,
          y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0.5 + Math.random() * 0.3,
          color,
        });
      }
    };

    const handleSortResult = (chosenPipe: 'covered' | 'exempt') => {
      const current = activeItem;
      if (!current) return;
      const isCorrect = current.targetPipe === chosenPipe;

      if (isCorrect) {
        setStreak((st) => {
          const next = st + 1;
          const pts = 100 + next * 25;
          setScore((s) => s + pts);
          return next;
        });
        setCoinsWon((c) => c + 3);
        onEarnCoinsRef.current(3);
        marioAudio.playCoin();
        simRef.current.shake = 0.25;
        const pipeX = chosenPipe === 'covered' ? 140 : 620;
        spawnSteam(pipeX, 360, chosenPipe === 'covered' ? '#34d399' : '#f87171', 20);
        setLastFeedback(`CORRECT! ${current.label} → ${chosenPipe.toUpperCase()}! ${current.detail}`);
      } else {
        setStreak(0);
        marioAudio.playWrongAnswer();
        simRef.current.shake = 0.6;
        setLives((l) => {
          const next = l - 1;
          if (next <= 0) {
            setGameState('gameover');
          }
          return next;
        });
        setLastFeedback(`INCORRECT PIPE! ${current.label} is ${current.targetPipe.toUpperCase()}! ${current.detail}`);
      }

      getNextItem();
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTs) / 1000, 0.05);
      lastTs = now;
      const sim = simRef.current;

      if (sim.shake > 0) sim.shake = Math.max(0, sim.shake - dt * 2.5);
      sim.steamParticles = sim.steamParticles.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        return p.life > 0;
      });

      if (gameState === 'playing' && sim.capsuleRolling) {
        // Paddle angle input smoothly
        if (sim.keys.has('left')) {
          sim.paddleAngle = Math.max(-0.65, sim.paddleAngle - dt * 4.5);
        } else if (sim.keys.has('right')) {
          sim.paddleAngle = Math.min(0.65, sim.paddleAngle + dt * 4.5);
        } else {
          // Return toward neutral slowly if no key held
          sim.paddleAngle *= 0.88;
        }

        // Capsule motion down chute
        sim.capsuleY += sim.capsuleVy * dt;
        sim.capsuleX += sim.capsuleVx * dt;

        // Collision with central diverter paddle at Y = 240
        const paddleY = 240;
        if (sim.capsuleY + sim.capsuleRadius >= paddleY && sim.capsuleY - sim.capsuleRadius <= paddleY + 16) {
          if (Math.abs(sim.capsuleX - 380) < 65) {
            // Deflect capsule left or right based on paddleAngle
            sim.capsuleVy = 180;
            sim.capsuleVx = sim.paddleAngle * 340;
            marioAudio.playClick();
          }
        }

        // Check pipe entry at bottom (Y >= 350)
        if (sim.capsuleY >= 350) {
          sim.capsuleRolling = false;
          if (sim.capsuleX < 380) {
            handleSortResult('covered');
          } else {
            handleSortResult('exempt');
          }
        }
      }

      // DRAW CANVAS
      ctx.save();
      if (sim.shake > 0) {
        const off = sim.shake * 7;
        ctx.translate((Math.random() - 0.5) * off, (Math.random() - 0.5) * off);
      }

      // Dark background
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, 760, 440);

      // Industrial metal grid
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 40; x < 760; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 440);
        ctx.stroke();
      }

      // Top Intake Chute
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(310, 8, 140, 55, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('INTAKE CHUTE', 380, 26);
      ctx.font = '9px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('Labor Practice Drop', 380, 42);

      // Chute Guide Rails
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(330, 64);
      ctx.lineTo(330, 220);
      ctx.moveTo(430, 64);
      ctx.lineTo(430, 220);
      ctx.stroke();

      // Mechanical Diverter Paddle (Pivot at 380, 250)
      ctx.save();
      ctx.translate(380, 250);
      ctx.rotate(sim.paddleAngle);
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-60, -8, 120, 16, 8);
      ctx.fill();
      ctx.stroke();

      // Pivot gear center
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Left Pipe: GREEN PIPE (COVERED / MANDATORY)
      ctx.fillStyle = '#15803d';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(80, 340, 120, 90, 8);
      ctx.fill();
      ctx.stroke();
      // Lip
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.roundRect(70, 325, 140, 20, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GREEN PIPE', 140, 375);
      ctx.font = '9px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#bbf7d0';
      ctx.fillText('COVERED / MANDATORY', 140, 395);

      // Right Pipe: RED PIPE (EXEMPT / PROHIBITED)
      ctx.fillStyle = '#b91c1c';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(560, 340, 120, 90, 8);
      ctx.fill();
      ctx.stroke();
      // Lip
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(550, 325, 140, 20, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RED PIPE', 620, 375);
      ctx.font = '9px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#fecaca';
      ctx.fillText('EXEMPT / PROHIBITED', 620, 395);

      // Falling Statutory Capsule
      if (sim.capsuleRolling && activeItem) {
        ctx.save();
        ctx.translate(sim.capsuleX, sim.capsuleY);

        // Outer glow
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();

        // Capsule Body
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(-4, -4, 6, 0, Math.PI * 2);
        ctx.fill();

        // Capsule Title Tag
        const tagText = activeItem.label;
        ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
        const tw = ctx.measureText(tagText).width;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-tw / 2 - 8, -42, tw + 16, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(tagText, 0, -27);

        ctx.restore();
      }

      // Steam Particles
      for (const p of sim.steamParticles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      }
      ctx.globalAlpha = 1;

      ctx.restore();
      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, [activeItem, gameState, getNextItem]);

  return (
    <div
      data-testid="game-warp-pipe-sorter"
      onContextMenu={(e) => e.preventDefault()}
      className="bg-slate-950 text-white rounded-3xl border-4 border-slate-950 shadow-[6px_6px_0_#000] overflow-hidden select-none max-w-4xl mx-auto"
    >
      {/* Top Arcade HUD */}
      <div className="bg-slate-900 px-3 sm:px-4 py-2 sm:py-3 border-b-2 border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl border-2 border-black flex items-center justify-center shadow-[0_2px_0_#000]">
            <MarioPipeIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-400 font-mario block">
              SPEED WARP PIPE PHYSICS SORTER
            </span>
            <span className="text-xs font-bold text-slate-300 block">
              Steer Paddle · Covered (Left) vs. Exempt (Right)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 font-mono tabular-nums">
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase block leading-none">TIME</span>
            <span className={`text-sm sm:text-base font-black ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-300'}`}>
              {timeLeft}s
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase block leading-none">SCORE</span>
            <span className="text-sm sm:text-base font-black text-emerald-300">{score}</span>
          </div>
          <div className="flex items-center gap-1" aria-label={`Lives: ${lives}`}>
            {[0, 1, 2].map((i) => (
              <Heart
                key={i}
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Live Feedback Banner */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="leading-snug line-clamp-1">{lastFeedback}</span>
      </div>

      {/* Main Canvas Viewport */}
      <div className="relative bg-[#0b0f19] min-h-[250px] sm:min-h-0 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={760}
          height={440}
          onPointerDown={(e) => {
            const canvas = canvasRef.current;
            if (!canvas || gameState !== 'playing') return;
            const rect = canvas.getBoundingClientRect();
            const worldX = ((e.clientX - rect.left) / rect.width) * 760;
            steerPaddle(worldX < 380 ? 'left' : 'right');
          }}
          className="w-full h-auto block cursor-crosshair touch-none select-none"
        />

        {/* Start Title Screen Overlay */}
        {gameState === 'start' && (
          <div className="absolute inset-0 bg-slate-950/92 flex flex-col items-center justify-center p-4 text-center overflow-y-auto">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 border-3 border-black mx-auto flex items-center justify-center shadow-[0_4px_0_#000] mb-3">
              <MarioPipeIcon className="w-10 h-10" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black font-display text-white">
              WARP PIPE LABOR DEFLECTOR ARENA
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mt-1.5 mb-4">
              Statutory capsules roll down the chute! Steer the mechanical diverter paddle to launch <strong>COVERED</strong> practices into the Green Pipe (Left) and <strong>EXEMPT</strong> practices into the Red Pipe (Right)!
            </p>
            <button
              type="button"
              data-start="true"
              onClick={startNewGame}
              className="min-h-[46px] px-8 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] text-xs sm:text-sm font-mario inline-flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START DEFLECTOR ARENA</span>
            </button>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              A / D or Left / Right to Steer · Tap Screen Sides to Deflect
            </p>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/92 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-3 border-amber-400 rounded-2xl p-6 max-w-sm w-full text-center space-y-3">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-lg sm:text-xl font-black font-display text-white">
                DEFLECTION SHIFT COMPLETE!
              </h3>
              <p className="text-xs font-mono text-slate-300">
                Final Score: <strong className="text-amber-300">{score}</strong> · Coins Won: <strong className="text-emerald-300">+{coinsWon}</strong>
              </p>
              <button
                type="button"
                data-start="true"
                onClick={startNewGame}
                className="min-h-[44px] w-full px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black font-mario text-xs cursor-pointer"
              >
                PLAY AGAIN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ergonomic Mobile Action Controls */}
      <div className="p-2.5 sm:p-3 bg-slate-950 border-t-2 border-slate-800 grid grid-cols-2 gap-3">
        <button
          type="button"
          onPointerDown={() => steerPaddle('left')}
          onPointerUp={() => steerPaddle('center')}
          className="min-h-[50px] p-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-500 text-white font-black border-2 border-black flex items-center justify-center gap-2 cursor-pointer shadow-[0_3px_0_#000]"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          <div className="text-left leading-tight">
            <div className="text-xs font-black font-display">STEER LEFT</div>
            <div className="text-[9px] font-mono text-emerald-200">GREEN PIPE (COVERED)</div>
          </div>
        </button>

        <button
          type="button"
          onPointerDown={() => steerPaddle('right')}
          onPointerUp={() => steerPaddle('center')}
          className="min-h-[50px] p-2 rounded-xl bg-red-700 hover:bg-red-600 active:bg-red-500 text-white font-black border-2 border-black flex items-center justify-center gap-2 cursor-pointer shadow-[0_3px_0_#000]"
        >
          <div className="text-right leading-tight">
            <div className="text-xs font-black font-display">STEER RIGHT</div>
            <div className="text-[9px] font-mono text-red-200">RED PIPE (EXEMPT)</div>
          </div>
          <ArrowRight className="w-5 h-5 shrink-0" />
        </button>
      </div>
    </div>
  );
};
