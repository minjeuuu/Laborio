import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { MarioAvatar } from '../types/laborLaw';
import { marioAudio } from '../utils/audio';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
} from './MarioIcons';
import {
  Trophy,
  Flame,
  Sparkles,
} from 'lucide-react';
import {
  drawBridgePuzzle,
  BridgeDoctrineItem,
} from '../utils/gameQuestionDeck';

interface MiniGameProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins: (amount: number) => void;
}

/* ============================================================================
   BOWSER'S BRIDGE STATUTORY DOCTRINE RESCUE (Original Style Word Decoder & Golden Axe)
   ============================================================================ */
export const BowsersBridgeDoctrineDecoder: React.FC<MiniGameProps> = ({
  equippedAvatar,
  onEarnCoins,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onEarnCoinsRef = useRef(onEarnCoins);
  onEarnCoinsRef.current = onEarnCoins;

  const [puzzle, setPuzzle] = useState<BridgeDoctrineItem>(() => drawBridgePuzzle());
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [lastActionMsg, setLastActionMsg] = useState(
    'Guess statutory letters to reveal the doctrine and drop Bowser into the lava!'
  );

  const MAX_WRONG = 6;

  // Normalized word letters
  const wordLetters = useMemo(() => {
    return puzzle.word.toUpperCase().split('');
  }, [puzzle.word]);

  const uniqueLetters = useMemo(() => {
    return Array.from(new Set(wordLetters.filter((ch) => /[A-Z]/.test(ch))));
  }, [wordLetters]);

  // Wrong guesses calculation
  const wrongGuesses = useMemo(() => {
    return Array.from(guessedLetters).filter((ch) => !uniqueLetters.includes(ch));
  }, [guessedLetters, uniqueLetters]);

  const remainingPlanks = Math.max(0, MAX_WRONG - wrongGuesses.length);

  // Canvas animation state
  const animRef = useRef({
    axeDropProgress: 0,
    bowserFallY: 0,
    fireAnim: 0,
  });

  // Handle letter guess (both click & physical keyboard)
  const handleGuess = useCallback(
    (letter: string) => {
      const l = letter.toUpperCase();
      if (!/^[A-Z]$/.test(l) || guessedLetters.has(l) || gameOver || victory) return;

      const nextGuessed = new Set(guessedLetters);
      nextGuessed.add(l);
      setGuessedLetters(nextGuessed);

      if (uniqueLetters.includes(l)) {
        marioAudio.playCoin();
        setLastActionMsg(`Letter '${l}' is correct! Mario advances toward the Golden Axe!`);

        // Check if this guess completed the word
        const completeNow = uniqueLetters.every((ch) => nextGuessed.has(ch));
        if (completeNow) {
          setVictory(true);
          const reward = 30 + streak * 5;
          onEarnCoinsRef.current(reward);
          setScore((s) => s + 500);
          setStreak((st) => st + 1);
          setLastActionMsg(`DOCTRINE DECODED! Mario triggered the Golden Axe! +${reward} Coins!`);
          marioAudio.playOneUp();
          try {
            confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
          } catch {}
        }
      } else {
        marioAudio.playBowserHit();
        animRef.current.fireAnim = 1.0;
        const nextWrongCount = wrongGuesses.length + 1;
        if (nextWrongCount >= MAX_WRONG) {
          setGameOver(true);
          setStreak(0);
          setLastActionMsg(
            `Bridge collapsed! The statutory term was "${puzzle.word}". Study the doctrine below!`
          );
        } else {
          setLastActionMsg(
            `Wrong letter '${l}'! Bowser exhales flame — ${MAX_WRONG - nextWrongCount} planks remain!`
          );
        }
      }
    },
    [guessedLetters, uniqueLetters, gameOver, victory, streak, wrongGuesses.length, puzzle.word]
  );

  // Physical keyboard listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key >= 'a' && e.key <= 'z') {
        e.preventDefault();
        handleGuess(e.key);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleGuess]);

  // Canvas visual rendering for the castle drawbridge & characters
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const render = () => {
      const anim = animRef.current;
      if (anim.fireAnim > 0) anim.fireAnim = Math.max(0, anim.fireAnim - 0.04);
      if (victory) {
        anim.axeDropProgress = Math.min(1, anim.axeDropProgress + 0.05);
        if (anim.axeDropProgress > 0.4) {
          anim.bowserFallY += 6;
        }
      }

      const w = canvas.width;
      const h = canvas.height;

      // Dark dungeon background
      ctx.fillStyle = '#0f0a1c';
      ctx.fillRect(0, 0, w, h);

      // Bubbling lava pool at bottom
      const lavaY = h - 60;
      const grad = ctx.createLinearGradient(0, lavaY, 0, h);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#dc2626');
      grad.addColorStop(1, '#7f1d1d');
      ctx.fillStyle = grad;
      ctx.fillRect(0, lavaY, w, 60);

      // Castle brick ledges
      ctx.fillStyle = '#475569';
      // Left ledge (Mario's side)
      ctx.fillRect(0, 190, 110, 90);
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.strokeRect(0, 190, 110, 90);

      // Right ledge (Axe & Doorway)
      ctx.fillRect(w - 110, 190, 110, 90);
      ctx.strokeRect(w - 110, 190, 110, 90);

      // Drawbridge planks (between 110 and w - 110 = 540px wide)
      const bridgeStart = 110;
      const bridgeEnd = w - 110;
      const totalPlankSlots = MAX_WRONG;
      const plankWidth = (bridgeEnd - bridgeStart) / totalPlankSlots;

      for (let i = 0; i < totalPlankSlots; i++) {
        const px = bridgeStart + i * plankWidth;
        const isPlankIntact = i < remainingPlanks;

        if (isPlankIntact && !victory) {
          // Intact wooden drawbridge plank
          ctx.fillStyle = '#b45309';
          ctx.fillRect(px + 3, 230, plankWidth - 6, 16);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.strokeRect(px + 3, 230, plankWidth - 6, 16);
          // Plank rivets
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(px + 8, 238, 2, 0, Math.PI * 2);
          ctx.arc(px + plankWidth - 8, 238, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (!isPlankIntact) {
          // Plank has fallen into the lava with embers
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.fillRect(px + 6, lavaY - 10, plankWidth - 12, 8);
        }
      }

      // Golden Axe on right pedestal
      const axeX = w - 60;
      const axeY = 210 + (victory ? anim.axeDropProgress * 30 : 0);
      ctx.save();
      ctx.translate(axeX, axeY);
      if (victory) {
        ctx.rotate(-0.6 * anim.axeDropProgress);
      }
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-3, 0, 6, 28);
      ctx.strokeRect(-3, 0, 6, 28);
      ctx.restore();

      // Bowser on bridge
      const bowserBaseX = 420;
      const bowserBaseY = 195 + anim.bowserFallY;
      ctx.save();
      ctx.translate(bowserBaseX, bowserBaseY);
      // Bowser Body
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 3;
      ctx.stroke();
      // Spiky Shell
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.arc(10, -4, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Horns
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(-10, -20);
      ctx.lineTo(-18, -36);
      ctx.lineTo(-6, -24);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Bowser Fireball breath on wrong guess
      if (anim.fireAnim > 0) {
        ctx.save();
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(380 - (1 - anim.fireAnim) * 160, 205, 14 * anim.fireAnim, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(380 - (1 - anim.fireAnim) * 160, 205, 7 * anim.fireAnim, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Mario Hero walking across bridge as letters are solved
      const solvedFraction =
        uniqueLetters.length > 0
          ? (guessedLetters.size - wrongGuesses.length) / uniqueLetters.length
          : 0;
      const targetMarioX = 60 + solvedFraction * (bridgeEnd - 80);
      const marioY = victory ? 210 : 212;

      ctx.save();
      ctx.translate(targetMarioX, marioY);
      // Mario Red Cap & Body
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, -10, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Blue Overalls
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-8, 0, 16, 16);
      ctx.strokeRect(-8, 0, 16, 16);
      ctx.restore();

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, [remainingPlanks, victory, uniqueLetters, guessedLetters, wrongGuesses.length]);

  const nextChallenge = () => {
    setPuzzle(drawBridgePuzzle());
    setGuessedLetters(new Set());
    setGameOver(false);
    setVictory(false);
    animRef.current = { axeDropProgress: 0, bowserFallY: 0, fireAnim: 0 };
    setLastActionMsg(
      'New statutory term loaded! Guess letters or use your physical keyboard (A-Z)!'
    );
    marioAudio.playPowerUp();
  };

  const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ];

  return (
    <div className="bg-[#1e132b] rounded-3xl border-4 border-slate-950 p-4 sm:p-6 text-white space-y-4 max-w-4xl mx-auto shadow-[0_12px_36px_rgba(0,0,0,0.8)] select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-red-900/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-red-600 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
            <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block">
              CASTLE LAVA BRIDGE • STATUTORY WORD DECODER
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
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-500/40 flex items-center gap-1.5">
            <span className="text-[10px] text-amber-400 font-bold uppercase">PLANKS:</span>
            <span
              className={`font-black text-sm ${
                remainingPlanks <= 2 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'
              }`}
            >
              {remainingPlanks} / {MAX_WRONG}
            </span>
          </div>
        </div>
      </div>

      {/* Statutory Clue Banner */}
      <div className="bg-red-950/90 border-2 border-red-500/60 rounded-2xl p-4 text-xs sm:text-sm font-bold text-amber-200 space-y-2 shadow-[0_4px_0_#000]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-red-500/30 pb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-mario text-[10px] uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>STATUTORY DOCTRINE MISSION</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black font-mario text-[9px] uppercase">
              STATUTORY DOCTRINE
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={gameOver || victory}
              onClick={() => {
                const unguessed = uniqueLetters.filter((ch) => !guessedLetters.has(ch));
                if (unguessed.length === 0) return;
                const vowels = ['A', 'E', 'I', 'O', 'U'];
                const hintChar = unguessed.find((c) => vowels.includes(c)) || unguessed[0];
                onEarnCoinsRef.current(-5);
                handleGuess(hintChar);
                setLastActionMsg(`TOAD HINT USED (-5 Coins): Revealed letter '${hintChar}'!`);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-black text-[10px] font-mario cursor-pointer shadow-xs active:translate-y-0.5 flex items-center gap-1"
            >
              <MarioCoinIcon className="w-3.5 h-3.5" />
              <span>HINT (-5c)</span>
            </button>
            <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
              Physical Keyboard A-Z Active
            </span>
          </div>
        </div>
        <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
          {puzzle.clue}
        </p>
      </div>

      {/* Canvas Arena: Drawbridge, Bowser, Mario, and Golden Axe */}
      <div className="relative rounded-2xl border-3 border-red-500/50 overflow-hidden bg-slate-950 shadow-inner min-h-[300px] sm:min-h-[340px] flex items-center justify-center">
        <canvas ref={canvasRef} width={760} height={280} className="w-full h-auto max-h-[320px] block" />

        {/* Victory Overlay Modal — Fully scrollable, prominent repeat button, never cut off */}
        {victory && (
          <div className="absolute inset-0 z-30 bg-slate-950/92 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-slate-900 border-3 border-amber-400 rounded-3xl p-5 sm:p-6 max-w-md w-full text-center space-y-3 shadow-[0_10px_0_#000] my-auto overflow-y-auto max-h-full">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 mx-auto animate-bounce shrink-0" />
              <h3 className="text-base sm:text-xl font-black font-display text-amber-300 leading-tight">
                BOWSER DROPPED! DOCTRINE RESCUED!
              </h3>
              <p className="text-xs font-mono text-slate-300">
                Decoded Term:{' '}
                <strong className="text-emerald-300 font-black text-sm tracking-wider">
                  {puzzle.word}
                </strong>
              </p>
              <p className="text-xs text-amber-200/90 italic leading-relaxed px-1">{puzzle.clue}</p>
              <div className="pt-1">
                <button
                  type="button"
                  data-testid="bridge-next-challenge-btn"
                  onClick={nextChallenge}
                  className="min-h-[48px] w-full px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black font-mario text-xs sm:text-sm cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5 transition-transform"
                >
                  NEXT CASTLE DOCTRINE (+30 COINS)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over / Bridge Fall Overlay Modal — Fully scrollable, prominent repeat button, never cut off */}
        {gameOver && (
          <div className="absolute inset-0 z-30 bg-slate-950/92 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-slate-900 border-3 border-rose-500 rounded-3xl p-5 sm:p-6 max-w-md w-full text-center space-y-3 shadow-[0_10px_0_#000] my-auto overflow-y-auto max-h-full">
              <Flame className="w-10 h-10 sm:w-12 sm:h-12 text-rose-500 mx-auto animate-pulse shrink-0" />
              <h3 className="text-base sm:text-xl font-black font-display text-rose-400 leading-tight">
                BRIDGE PLUNGED! DOCTRINE REVIEW:
              </h3>
              <p className="text-xs font-mono text-slate-300">
                Target Statutory Term was:{' '}
                <strong className="text-white font-black text-sm tracking-wider">
                  {puzzle.word}
                </strong>
              </p>
              <p className="text-xs text-slate-300 italic leading-relaxed px-1">{puzzle.clue}</p>
              <div className="pt-1">
                <button
                  type="button"
                  data-testid="bridge-retry-btn"
                  onClick={nextChallenge}
                  className="min-h-[48px] w-full px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl border-2 border-black font-mario text-xs sm:text-sm cursor-pointer shadow-[0_3px_0_#000] active:translate-y-0.5 transition-transform"
                >
                  RETRY NEXT CASTLE BRIDGE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Secret Word Tiles Display */}
      <div className="bg-slate-950 p-4 rounded-2xl border-2 border-slate-800 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 min-h-[64px]">
        {wordLetters.map((char, idx) => {
          const isLetter = /[A-Z]/.test(char);
          const isRevealed = !isLetter || guessedLetters.has(char) || gameOver || victory;

          return (
            <div
              key={idx}
              className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl border-2 flex items-center justify-center font-mario text-base sm:text-lg font-black transition-all ${
                !isLetter
                  ? 'border-transparent text-slate-500'
                  : isRevealed
                  ? guessedLetters.has(char)
                    ? 'bg-amber-400 text-slate-950 border-black shadow-[0_3px_0_#000]'
                    : 'bg-rose-950/80 text-rose-300 border-rose-500'
                  : 'bg-slate-900 border-slate-700 text-transparent shadow-inner'
              }`}
            >
              {isRevealed ? char : '_'}
            </div>
          );
        })}
      </div>

      {/* Action / Feedback Status Banner */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-amber-300 text-center">
        {lastActionMsg}
      </div>

      {/* Interactive On-Screen Alphabet Keyboard (Zero pill buttons) */}
      <div className="space-y-1.5 pt-1">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((char) => {
              const isGuessed = guessedLetters.has(char);
              const isCorrect = isGuessed && uniqueLetters.includes(char);
              const isWrong = isGuessed && !uniqueLetters.includes(char);

              return (
                <button
                  key={char}
                  type="button"
                  disabled={isGuessed || gameOver || victory}
                  onClick={() => handleGuess(char)}
                  className={`min-h-[44px] min-w-[32px] sm:min-w-[42px] px-2 py-2 rounded-xl font-mario text-xs sm:text-sm font-black border-2 transition-all cursor-pointer ${
                    isCorrect
                      ? 'bg-emerald-600 text-white border-black opacity-90'
                      : isWrong
                      ? 'bg-slate-950 text-slate-600 border-slate-800 line-through opacity-50 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-white border-slate-700 hover:border-black shadow-[0_2px_0_#000] active:translate-y-0.5'
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
