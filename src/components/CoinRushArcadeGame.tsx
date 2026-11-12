import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CoinRushGameState,
  CoinRushInput,
  createInitialCoinRushState,
  stepCoinRushState,
  advanceCoinRushStage,
  loadCoinRushHighScore,
  saveCoinRushHighScore,
} from '../utils/coinRushGame';
import {
  loadArcadeGhostSeries,
  recordArcadeGhostRun,
  ArcadeGhostSeries,
} from '../utils/ghostRaceAndKnowledgeGraph';
import { MarioAvatar } from '../types/laborLaw';
import { MarioCharacterAvatar, MarioCoinIcon, MarioStarIcon, MarioFireFlowerIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { awardUserXp } from '../utils/levelProgressionService';
import { dispatchDailyMissionEvent } from '../utils/round11Features';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Play,
  RotateCcw,
  Sparkles,
  Shield,
  Heart,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Flame,
  Volume2,
  VolumeX,
  Target,
  Zap,
  CheckCircle2,
  ShieldAlert,
  Award,
  Crown,
  Scale,
} from 'lucide-react';

interface CoinRushArcadeGameProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins?: (amount: number) => void;
  onExitGame?: () => void;
}

export const CoinRushArcadeGame: React.FC<CoinRushArcadeGameProps> = ({
  equippedAvatar,
  onEarnCoins,
  onExitGame,
}) => {
  const [gameState, setGameState] = useState<CoinRushGameState>(() =>
    createInitialCoinRushState(Date.now())
  );
  const [highScore, setHighScore] = useState<number>(() => {
    return typeof window !== 'undefined'
      ? loadCoinRushHighScore(window.localStorage)
      : loadCoinRushHighScore();
  });
  const [ghostSeries, setGhostSeries] = useState<ArcadeGhostSeries | null>(() => {
    if (typeof window === 'undefined') return null;
    const all = loadArcadeGhostSeries(window.localStorage);
    return all['coin_rush'] || null;
  });
  const [showGhostOverlay, setShowGhostOverlay] = useState<boolean>(true);
  const [keysDown, setKeysDown] = useState<CoinRushInput>({
    left: false,
    right: false,
    jump: false,
    fire: false,
  });

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const gameContainerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        setKeysDown((prev) => ({ ...prev, left: true }));
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        setKeysDown((prev) => ({ ...prev, right: true }));
      } else if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        setKeysDown((prev) => ({ ...prev, jump: true }));
      } else if (['Space', 'KeyF', 'Enter'].includes(e.code)) {
        e.preventDefault();
        setKeysDown((prev) => ({ ...prev, fire: true, jump: prev.jump || e.code === 'Space' }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        setKeysDown((prev) => ({ ...prev, left: false }));
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        setKeysDown((prev) => ({ ...prev, right: false }));
      } else if (['ArrowUp', 'KeyW'].includes(e.code)) {
        setKeysDown((prev) => ({ ...prev, jump: false }));
      } else if (['Space', 'KeyF', 'Enter'].includes(e.code)) {
        setKeysDown((prev) => ({ ...prev, fire: false, jump: e.code === 'Space' ? false : prev.jump }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Physics / Game Loop
  useEffect(() => {
    if (gameState.status !== 'playing') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      setGameState((prev) => {
        if (prev.status !== 'playing') return prev;
        const next = stepCoinRushState(prev, keysDown, dt);

        // Sound effect triggers on state changes
        if (next.coinsCollected > prev.coinsCollected) {
          marioAudio.playCoin();
        }
        if (next.shieldTimerSec > 0 && prev.shieldTimerSec <= 0) {
          marioAudio.playStarTheme();
        }
        if (next.lives < prev.lives) {
          marioAudio.playWrongAnswer();
        }
        if (next.status === 'stage_clear' && prev.status === 'playing') {
          marioAudio.playFanfare();
          try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
        }
        if (next.status === 'game_victory' && prev.status === 'playing') {
          marioAudio.playLevelUp();
          const victoryBonus = 250;
          onEarnCoins?.(victoryBonus);
          awardUserXp({ amount: 120, reason: 'Super Mario Coin Rush: Labor Standards Grand Victory' });
          dispatchDailyMissionEvent('arcade_play', 1);

          try {
            confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 } });
          } catch {
            // ignore
          }

          if (typeof window !== 'undefined') {
            const nextBest = saveCoinRushHighScore(next.score, window.localStorage);
            setHighScore(nextBest);
            const updatedGhost = recordArcadeGhostRun({
              gameId: 'coin_rush',
              gameTitle: 'Super Mario Coin Rush',
              finalScore: next.score,
              storage: window.localStorage,
            });
            setGhostSeries(updatedGhost['coin_rush'] || null);
          }
        }
        if (next.status === 'game_over' && prev.status === 'playing') {
          marioAudio.playGameOver();
          if (typeof window !== 'undefined') {
            const nextBest = saveCoinRushHighScore(next.score, window.localStorage);
            setHighScore(nextBest);
          }
        }

        return next;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState.status, keysDown, onEarnCoins]);

  const handleStartGame = () => {
    marioAudio.playPowerUp();
    lastTimeRef.current = 0;
    const initial = createInitialCoinRushState(Date.now());
    initial.status = 'playing';
    setGameState(initial);
  };

  const handleNextStage = () => {
    marioAudio.playPipe();
    lastTimeRef.current = 0;
    setGameState((prev) => advanceCoinRushStage(prev));
  };

  const isStarActive = gameState.shieldTimerSec > 0;
  const ghostScoreTarget = ghostSeries ? ghostSeries.finalScore : highScore;
  const ghostLeadRatio =
    ghostScoreTarget > 0 ? Math.min(1.2, gameState.score / ghostScoreTarget) : 1;

  return (
    <div
      ref={gameContainerRef}
      data-testid="coin-rush-game-root"
      className="bg-slate-950 border-4 border-amber-400 rounded-3xl p-3 sm:p-5 text-white shadow-[8px_8px_0_#000] space-y-3 max-w-4xl mx-auto w-full select-none"
    >
      {/* Header HUD */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b-2 border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            <MarioStarIcon className="w-6 h-6 animate-spin" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-amber-400 font-mario block truncate">
              {gameState.stageTitle}
            </span>
            <h2 className="text-sm sm:text-lg font-black font-display text-white truncate">
              SUPER MARIO COIN RUSH: LABOR STANDARDS ADVENTURE
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowGhostOverlay(!showGhostOverlay)}
            data-testid="toggle-ghost-overlay-btn"
            className={`min-h-[34px] px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 cursor-pointer transition-colors ${
              showGhostOverlay
                ? 'bg-purple-950/80 text-purple-200 border-purple-500'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Ghost Race</span>
          </button>

          {onExitGame && (
            <button
              type="button"
              onClick={onExitGame}
              className="min-h-[34px] px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Stage Mission & Goal Tracker */}
      <div className="bg-slate-900/90 border border-amber-400/50 rounded-2xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black font-mario text-[10px]">
            STAGE {gameState.currentStage}/3
          </span>
          <span className="text-slate-200 font-semibold truncate">
            {gameState.stageDescription}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-mono font-bold">
          <span className="text-amber-300">
            Target: {gameState.coinsCollected}/{gameState.stageTargetCoins} Coins
          </span>
          <span className="text-cyan-300 tabular-nums">
            Time: {Math.ceil(gameState.timeRemainingSec)}s
          </span>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
          <span className="text-slate-400 font-bold">Score:</span>
          <span className="font-mario text-amber-300 tabular-nums">{gameState.score}</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <MarioCoinIcon className="w-3.5 h-3.5" />
            Coins:
          </span>
          <span className="font-mono font-black text-amber-400 tabular-nums">
            {gameState.coinsCollected}
          </span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
          <span className="text-slate-400 font-bold flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            Best:
          </span>
          <span className="font-mono font-black text-white tabular-nums">{highScore}</span>
        </div>
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2 flex items-center justify-between">
          <span className="text-slate-400 font-bold">Lives:</span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((heart) => (
              <Heart
                key={heart}
                className={`w-3.5 h-3.5 ${
                  heart <= gameState.lives
                    ? 'text-rose-500 fill-rose-500'
                    : 'text-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Ghost Race Track HUD Indicator */}
      {showGhostOverlay && ghostSeries && (
        <div
          data-testid="coin-rush-ghost-hud"
          className="bg-purple-950/40 border border-purple-500/50 rounded-2xl p-2 text-xs flex flex-wrap items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400 animate-pulse shrink-0" />
            <span className="text-purple-200 font-bold">
              Ghost Rival: <strong className="text-white">{ghostSeries.finalScore} pts</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span>
              {ghostLeadRatio >= 1 ? (
                <span className="text-emerald-300 font-black">
                  Ahead of Rival (+{Math.round((ghostLeadRatio - 1) * 100)}%)
                </span>
              ) : (
                <span className="text-amber-300 font-black">
                  Chasing Rival ({Math.round(ghostLeadRatio * 100)}%)
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Main Game Surface Canvas */}
      <div
        data-testid="coin-rush-viewport"
        className={`relative w-full ${
          gameState.status !== 'playing'
            ? 'min-h-[380px] sm:min-h-[440px]'
            : 'aspect-[560/270] min-h-[280px] sm:min-h-[340px] max-h-[460px]'
        } bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-950 border-3 border-black rounded-2xl overflow-hidden shadow-inner flex flex-col justify-end transition-all duration-200`}
      >
        {/* Background Clouds & Atmosphere */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-6 left-12 w-20 h-8 bg-white/40 rounded-full blur-xs" />
          <div className="absolute top-14 right-20 w-32 h-10 bg-white/40 rounded-full blur-xs" />
          {gameState.currentStage === 3 && (
            <div className="absolute inset-x-0 bottom-0 h-10 bg-rose-600/30 animate-pulse" />
          )}
        </div>

        {/* Solid Ground Platform */}
        <div
          data-testid="coin-rush-ground"
          style={{
            top: `${(gameState.groundY / gameState.height) * 100}%`,
            height: `${((gameState.height - gameState.groundY) / gameState.height) * 100}%`,
          }}
          className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 border-t-4 border-amber-400 shadow-[0_-3px_8px_rgba(0,0,0,0.6)] z-10 pointer-events-none"
        >
          <div
            className="w-full h-full opacity-35"
            style={{
              backgroundImage: `linear-gradient(90deg, #000 2px, transparent 2px), linear-gradient(0deg, #000 2px, transparent 2px)`,
              backgroundSize: '24px 14px',
            }}
          />
        </div>

        {/* Platforms */}
        {gameState.platforms.map((p, idx) => (
          <div
            key={idx}
            style={{
              left: `${(p.x / gameState.width) * 100}%`,
              top: `${(p.y / gameState.height) * 100}%`,
              width: `${(p.w / gameState.width) * 100}%`,
              height: `${(p.h / gameState.height) * 100}%`,
            }}
            className="absolute bg-gradient-to-b from-amber-600 to-amber-900 border-t-3 border-amber-400 shadow-[0_4px_0_#000] rounded-sm z-10"
          />
        ))}

        {/* Flagpole when Target Reached */}
        {gameState.flagpoleActive && (
          <div
            data-testid="coin-rush-flagpole"
            style={{
              left: `${(gameState.flagpoleX / gameState.width) * 100}%`,
              top: `${(gameState.flagpoleY / gameState.height) * 100}%`,
            }}
            className="absolute z-20 flex flex-col items-center pointer-events-none animate-bounce -translate-x-1/2"
          >
            <div className="w-3 h-3 rounded-full bg-amber-400 border border-black shadow" />
            <div className="w-1.5 h-24 bg-gradient-to-b from-amber-200 to-amber-400 border-x border-black" />
            <div className="absolute top-2 left-1.5 bg-emerald-500 text-slate-950 font-black font-mario text-[8px] px-1.5 py-0.5 rounded border border-black shadow">
              GOAL
            </div>
          </div>
        )}

        {/* Supreme Court Axe (Stage 3 Castle) */}
        {gameState.bridgeAxeActive && gameState.currentStage === 3 && (
          <div
            data-testid="coin-rush-bridge-axe"
            style={{
              left: `${(gameState.bridgeAxeX / gameState.width) * 100}%`,
              top: `${(gameState.bridgeAxeY / gameState.height) * 100}%`,
            }}
            className="absolute z-20 flex flex-col items-center pointer-events-none animate-pulse -translate-x-1/2"
          >
            <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center shadow-lg">
              <Scale className="w-4 h-4 text-slate-950" />
            </div>
            <span className="text-[7px] font-black text-amber-300 font-mario mt-0.5 bg-black/80 px-1 rounded">
              AXE
            </span>
          </div>
        )}

        {/* Collectibles (Coins, Stars, Mushrooms, Fire Flowers, Crowns) */}
        {gameState.collectibles
          .filter((c) => !c.collected)
          .map((item) => (
            <div
              key={item.id}
              style={{
                left: `${(item.x / gameState.width) * 100}%`,
                top: `${(item.y / gameState.height) * 100}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform animate-bounce"
            >
              {item.kind === 'star' ? (
                <div className="w-7 h-7 rounded-full bg-amber-300 border-2 border-black flex items-center justify-center shadow-lg animate-spin">
                  <MarioStarIcon className="w-5 h-5 text-slate-950" />
                </div>
              ) : item.kind === 'crown' ? (
                <div className="w-7 h-7 rounded-full bg-pink-500 border-2 border-black flex items-center justify-center shadow-lg animate-pulse">
                  <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                </div>
              ) : item.kind === 'flower' ? (
                <div className="w-7 h-7 rounded-full bg-rose-500 border-2 border-black flex items-center justify-center shadow-lg">
                  <Flame className="w-4 h-4 text-amber-200 fill-amber-200" />
                </div>
              ) : item.kind === 'mushroom' ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 border border-black flex items-center justify-center shadow-md">
                  <Heart className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-400 border border-black flex items-center justify-center shadow-md">
                  <MarioCoinIcon className="w-4 h-4 text-slate-950" />
                </div>
              )}
            </div>
          ))}

        {/* Fireballs launched by Player */}
        {gameState.fireballs.map((fb) => (
          <div
            key={fb.id}
            style={{
              left: `${(fb.x / gameState.width) * 100}%`,
              top: `${(fb.y / gameState.height) * 100}%`,
            }}
            className="absolute w-4 h-4 rounded-full bg-amber-400 border border-black shadow-[0_0_8px_#f59e0b] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          >
            <Flame className="w-2.5 h-2.5 text-rose-600 fill-rose-600" />
          </div>
        ))}

        {/* Moving Obstacles: Labor Code Violations */}
        {gameState.obstacles.map((obs) => (
          <div
            key={obs.id}
            style={{
              left: `${(obs.x / gameState.width) * 100}%`,
              top: `${(obs.y / gameState.height) * 100}%`,
              width: `${(obs.w / gameState.width) * 100}%`,
              height: `${(obs.h / gameState.height) * 100}%`,
            }}
            className={`absolute rounded-xl border-2 border-black flex flex-col items-center justify-center px-1 shadow-[0_2px_0_#000] transition-transform ${
              isStarActive
                ? 'bg-rose-950/60 border-rose-500 opacity-70'
                : 'bg-rose-600 text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
            <span className="text-[7.5px] font-black font-mario text-center leading-none truncate max-w-full">
              {obs.violationTitle}
            </span>
          </div>
        ))}

        {/* Boss Encounter (Stage 2 & Stage 3) */}
        {gameState.boss && !gameState.boss.isDefeated && (
          <div
            data-testid="coin-rush-boss"
            style={{
              left: `${(gameState.boss.x / gameState.width) * 100}%`,
              top: `${(gameState.boss.y / gameState.height) * 100}%`,
              width: `${(gameState.boss.w / gameState.width) * 100}%`,
              height: `${(gameState.boss.h / gameState.height) * 100}%`,
            }}
            className="absolute rounded-2xl border-3 border-black bg-gradient-to-b from-rose-700 to-rose-950 text-white shadow-2xl flex flex-col items-center justify-center p-1"
          >
            {/* Boss Health Bar */}
            <div className="absolute -top-4 inset-x-0 flex flex-col items-center">
              <div className="w-full h-2 bg-slate-950 rounded-full border border-black overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-150"
                  style={{ width: `${(gameState.boss.hp / gameState.boss.maxHp) * 100}%` }}
                />
              </div>
            </div>
            <div className="text-[8px] font-black font-mario text-amber-300 text-center truncate max-w-full">
              {gameState.boss.name}
            </div>
            <span className="text-[7px] font-bold text-rose-200">
              HP: {gameState.boss.hp}/{gameState.boss.maxHp}
            </span>
          </div>
        )}

        {/* Player Avatar */}
        <div
          data-testid="coin-rush-player"
          style={{
            left: `${(gameState.playerX / gameState.width) * 100}%`,
            top: `${(gameState.playerY / gameState.height) * 100}%`,
            width: `${(gameState.playerW / gameState.width) * 100}%`,
            height: `${(gameState.playerH / gameState.height) * 100}%`,
            transform: `scaleX(${gameState.facing})`,
          }}
          className={`absolute rounded-xl flex items-center justify-center transition-all ${
            isStarActive
              ? 'ring-4 ring-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.9)] animate-pulse'
              : ''
          }`}
        >
          <MarioCharacterAvatar character={equippedAvatar} className="w-full h-full" />
        </div>

        {/* Active Doctrine Tip Toast when collecting Coins */}
        {gameState.lastBannerText && (
          <div
            data-testid="coin-rush-active-doctrine"
            className="absolute top-3 left-3 right-3 bg-slate-950/95 border-2 border-amber-400 rounded-xl px-3 py-1.5 text-xs text-amber-200 font-semibold shadow-md flex items-center gap-2 truncate"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">{gameState.lastBannerText}</span>
          </div>
        )}

        {/* Star Power Countdown HUD */}
        {isStarActive && (
          <div className="absolute top-12 right-3 bg-amber-400 text-slate-950 font-black font-mario text-[9px] px-2.5 py-1 rounded-full border-2 border-black shadow-md flex items-center gap-1 animate-pulse">
            <MarioStarIcon className="w-3.5 h-3.5" />
            <span>INVINCIBLE: {Math.ceil(gameState.shieldTimerSec)}s</span>
          </div>
        )}

        {/* Stage Clear Dialog */}
        {gameState.status === 'stage_clear' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 sm:p-6 pb-8 text-center space-y-3 z-30 overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shadow-lg animate-bounce shrink-0">
              <Trophy className="w-7 h-7" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-white">
              STAGE {gameState.currentStage} CLEARED!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
              Target achieved! Flagpole reached with <strong className="text-amber-300">{gameState.coinsCollected} coins</strong>. Ready for Stage {gameState.currentStage + 1}?
            </p>
            <button
              type="button"
              onClick={handleNextStage}
              data-testid="next-stage-btn"
              className="min-h-[46px] px-7 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black font-mario text-xs sm:text-sm rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer active:translate-y-0.5 shrink-0"
            >
              ADVANCE TO STAGE {gameState.currentStage + 1}
            </button>
          </div>
        )}

        {/* Grand Victory Finale Screen */}
        {gameState.status === 'game_victory' && (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/95 via-purple-950/95 to-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 sm:p-6 pb-8 text-center space-y-3 z-30 overflow-y-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 border-3 border-black flex items-center justify-center shadow-[0_4px_0_#000] animate-bounce shrink-0">
              <Crown className="w-8 h-8 fill-current" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-400 font-mario">
                COURSE COMPLETE · ALL 3 WORLDS MASTERED
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                LABOR STANDARDS CHAMPION!
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              You overcame Hours of Work, Holiday &amp; Wage Fortresses, and defeated Employer Bowser with Twin-Notice Due Process!
            </p>
            <div className="flex items-center gap-4 bg-slate-900/90 border border-amber-400/60 rounded-xl px-4 py-2 font-mono text-xs">
              <span className="text-slate-300">Final Score: <strong className="text-amber-300">{gameState.score}</strong></span>
              <span className="text-emerald-400 font-bold">+250 Gold Coins Awarded!</span>
            </div>
            <button
              type="button"
              onClick={handleStartGame}
              className="min-h-[46px] px-7 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black font-mario text-xs sm:text-sm rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer shrink-0"
            >
              PLAY VICTORY RUN AGAIN
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState.status === 'game_over' && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 sm:p-6 pb-8 text-center space-y-3 z-30 overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white border-2 border-black flex items-center justify-center shadow-lg shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-rose-400">AUDIT FAILED!</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
              You ran out of lives or time! Remember: Stomp on violation hazards from above or grab Star Shields!
            </p>
            <button
              type="button"
              onClick={handleStartGame}
              className="min-h-[46px] px-7 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black font-mario text-xs sm:text-sm rounded-xl border-2 border-black shadow-[0_3px_0_#000] cursor-pointer shrink-0"
            >
              RETRY CAMPAIGN
            </button>
          </div>
        )}
      </div>

      {/* On-Screen Touch Arcade Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={() => setKeysDown((prev) => ({ ...prev, left: true }))}
            onPointerUp={() => setKeysDown((prev) => ({ ...prev, left: false }))}
            onPointerLeave={() => setKeysDown((prev) => ({ ...prev, left: false }))}
            data-testid="touch-btn-left"
            className="w-14 h-12 rounded-2xl bg-slate-900 active:bg-amber-400 text-white active:text-slate-950 border-2 border-slate-700 flex items-center justify-center cursor-pointer select-none active:translate-y-0.5 shadow-md touch-manipulation"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onPointerDown={() => setKeysDown((prev) => ({ ...prev, right: true }))}
            onPointerUp={() => setKeysDown((prev) => ({ ...prev, right: false }))}
            onPointerLeave={() => setKeysDown((prev) => ({ ...prev, right: false }))}
            data-testid="touch-btn-right"
            className="w-14 h-12 rounded-2xl bg-slate-900 active:bg-amber-400 text-white active:text-slate-950 border-2 border-slate-700 flex items-center justify-center cursor-pointer select-none active:translate-y-0.5 shadow-md touch-manipulation"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {gameState.hasFireFlower && (
            <button
              type="button"
              onPointerDown={() => setKeysDown((prev) => ({ ...prev, fire: true }))}
              onPointerUp={() => setKeysDown((prev) => ({ ...prev, fire: false }))}
              data-testid="touch-btn-fire"
              className="min-w-[85px] h-12 px-3 rounded-2xl bg-rose-600 active:bg-rose-500 text-white font-black font-mario text-xs border-2 border-black flex items-center justify-center gap-1 cursor-pointer select-none active:translate-y-0.5 shadow-[0_3px_0_#000]"
            >
              <Flame className="w-4 h-4 fill-current" />
              <span>FIRE</span>
            </button>
          )}

          <button
            type="button"
            onPointerDown={() => setKeysDown((prev) => ({ ...prev, jump: true }))}
            onPointerUp={() => setKeysDown((prev) => ({ ...prev, jump: false }))}
            onPointerLeave={() => setKeysDown((prev) => ({ ...prev, jump: false }))}
            data-testid="touch-btn-jump"
            className="min-w-[95px] h-12 px-4 rounded-2xl bg-amber-400 active:bg-amber-300 text-slate-950 font-black font-mario text-xs border-2 border-black flex items-center justify-center gap-1.5 cursor-pointer select-none active:translate-y-0.5 shadow-[0_3px_0_#000]"
          >
            <ArrowUp className="w-5 h-5 stroke-[3]" />
            <span>JUMP</span>
          </button>
        </div>
      </div>
    </div>
  );
};
