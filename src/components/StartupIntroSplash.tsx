import React, { useEffect, useState, useRef } from 'react';
import { Scale, Sparkles, SkipForward, ArrowRight } from 'lucide-react';
import { MarioMushroomIcon, MarioStarIcon } from './MarioIcons';
import { marioAudio } from '../utils/audio';

interface StartupIntroSplashProps {
  onDismiss: () => void;
  appName?: string;
}

export const StartupIntroSplash: React.FC<StartupIntroSplashProps> = ({
  onDismiss,
  appName = 'SUPER MARIO LABOR ADVENTURE',
}) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const hasTriggeredAudioRef = useRef(false);

  useEffect(() => {
    // Graceful stage emergence
    const readyTimer = window.setTimeout(() => {
      setIsReady(true);
      if (!hasTriggeredAudioRef.current) {
        hasTriggeredAudioRef.current = true;
        try {
          marioAudio.playPowerUp();
        } catch {}
      }
    }, 280);

    // Smooth cinematic progress line
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          window.clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 45);

    // Auto-transition into app after cinematic reveal
    const autoTimer = window.setTimeout(() => {
      handleClose();
    }, 2600);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(readyTimer);
      window.clearInterval(interval);
      window.clearTimeout(autoTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleClose = () => {
    if (isFadingOut) return;
    try {
      marioAudio.playCoin();
    } catch {}
    setIsFadingOut(true);
    window.setTimeout(() => {
      onDismiss();
    }, 320);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Application Startup Cinema Introduction"
      data-testid="startup-intro-splash"
      onClick={handleClose}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050813] text-white p-6 cursor-pointer select-none transition-all duration-300 ${
        isFadingOut
          ? 'opacity-0 scale-95 pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Top-Right Discreet Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        data-testid="startup-skip-btn"
        className="absolute top-5 right-5 z-20 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-mono text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-lg backdrop-blur-md"
      >
        <span>SKIP</span>
        <span className="text-[10px] text-slate-500 font-mono">[ESC]</span>
        <SkipForward className="w-3.5 h-3.5 text-amber-400" />
      </button>

      {/* Cinematic Golden Radial Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.22)_0%,rgba(15,23,42,0.6)_45%,#050813_85%)] pointer-events-none" />

      {/* Main Focus: Pure Iconic Symbol of the App */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-md w-full">
        {/* The Emblem of the App: Super Mushroom crowned with the Scales of Justice */}
        <div
          className={`relative transition-all duration-700 ease-out transform ${
            isReady
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-90 opacity-0 translate-y-4'
          }`}
        >
          {/* Outer Radiant Gold Halo */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-amber-500/25 via-yellow-400/35 to-amber-500/25 blur-xl animate-pulse pointer-events-none" />

          {/* Central Crest Medal */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-[#1e1b4b] via-[#0f172a] to-[#090d16] border-4 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.5),0_12px_36px_rgba(0,0,0,0.85)] flex items-center justify-center">
            {/* Inner Ring Glow */}
            <div className="absolute inset-1.5 rounded-full border border-amber-300/40 pointer-events-none" />

            {/* Super Mushroom Core */}
            <div className="relative flex flex-col items-center justify-center">
              <MarioMushroomIcon className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_8px_16px_rgba(220,38,38,0.6)]" />

              {/* Scales of Justice Medallion Overlaid atop the Base */}
              <div className="absolute -bottom-2 -right-1 w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 border-2 border-black flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                <Scale className="w-6 h-6 sm:w-7 sm:h-7 text-slate-950" />
              </div>

              {/* Sparkle Star Accents */}
              <div className="absolute -top-1 -left-1 w-8 h-8 rounded-full bg-amber-400/90 border border-black flex items-center justify-center shadow-md animate-pulse">
                <MarioStarIcon className="w-4 h-4 text-slate-950" />
              </div>
            </div>
          </div>
        </div>

        {/* Title & Authentic Subtitle */}
        <div
          className={`space-y-2 transition-all duration-700 delay-150 ease-out transform ${
            isReady
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-[10px] sm:text-xs font-mono font-black tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>PHILIPPINE LABOR STANDARDS</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black font-display tracking-tight text-white leading-tight drop-shadow-md">
            {appName}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Mushroom Kingdom Codal Guide &amp; Supreme Court Doctrines
          </p>
        </div>

        {/* Minimalist Golden Progress Line */}
        <div className="w-full max-w-xs space-y-2 pt-2">
          <div className="w-full h-1.5 bg-slate-900 rounded-full border border-slate-700/60 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Press Start / Tap Indicator */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 font-mario text-[10px] sm:text-xs tracking-wider animate-pulse transition-colors">
              <span>PRESS START OR TAP TO ENTER</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
