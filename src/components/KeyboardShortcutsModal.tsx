import React from 'react';
import { X, Command, Keyboard, Zap, Sparkles } from 'lucide-react';
import { MarioMushroomIcon, MarioStarIcon } from './MarioIcons';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  key: string;
  action: string;
  category: 'navigation' | 'study_tools' | 'audio_controls';
}

const SHORTCUTS: ShortcutItem[] = [
  // Navigation
  { key: '1', action: 'Overworld World Map', category: 'navigation' },
  { key: '2', action: '6 Labor Standard Modules', category: 'navigation' },
  { key: '3', action: 'Codal Citations & Verbatim Provisions', category: 'navigation' },
  { key: '4', action: 'Holidays Master Hub (12 Regular & Special)', category: 'navigation' },
  { key: '5', action: '17 Regions Minimum Wage Matrix', category: 'navigation' },
  { key: '6', action: 'Interactive Flashcards & Spaced Review', category: 'navigation' },
  { key: '7', action: 'Bar Quizzes & Boss Battles', category: 'navigation' },
  { key: '8', action: '8-Bit Labor Arcade Game Vault', category: 'navigation' },
  { key: '9', action: 'DOLE Pay Multiplier Calculator', category: 'navigation' },
  { key: '0', action: 'Toad Shop & Power-Up Inventory', category: 'navigation' },
  
  // Study Tools
  { key: 'Ctrl + K', action: 'Global Search across all statutes & doctrines', category: 'study_tools' },
  { key: 'D', action: 'Bar Landmark Supreme Court Decisions Decoder', category: 'study_tools' },
  { key: 'Q', action: 'Quick Pay Multiplier HUD & Rapid DOLE Calculator', category: 'study_tools' },
  { key: 'N', action: 'Toggle Study Notes Drawer (Voice Dictation)', category: 'study_tools' },
  { key: 'P', action: 'Launch Pomodoro 25-Min Study Sprint', category: 'study_tools' },
  { key: 'L', action: 'Open DOLE Formula Lab & Multiplier Auditor', category: 'study_tools' },
  { key: 'B', action: 'Launch Supreme Court Bar Issue Spotter', category: 'study_tools' },
  { key: 'J', action: 'Open Dispute Jurisdiction & SENA Navigator', category: 'study_tools' },
  { key: 'T', action: 'Open Prescriptive Periods Time-Warp Drill', category: 'study_tools' },
  { key: '?', action: 'Show this Keyboard Shortcuts Commander', category: 'study_tools' },
  
  // Audio & General
  { key: 'M', action: 'Toggle Mario Audio & Music (Mute/Unmute)', category: 'audio_controls' },
  { key: 'Esc', action: 'Close any active modal or dialog', category: 'audio_controls' },
];

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mario Labor Law Keyboard Shortcuts Commander"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto overscroll-contain animate-fadeIn"
    >
      <div className="bg-slate-900 border-4 border-amber-400 rounded-3xl w-full max-w-2xl shadow-[0_12px_40px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 px-5 py-3.5 border-b-4 border-black flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-amber-400 border-2 border-slate-900 flex items-center justify-center shadow-[2px_2px_0_#000]">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase font-mario px-1.5 py-0.5 bg-slate-950 text-amber-300 rounded">
                  POWER-UP CONTROLS
                </span>
                <span className="text-[11px] font-bold text-slate-900">
                  Instant Keyboard Shortcuts
                </span>
              </div>
              <h2 className="text-base font-black uppercase font-mario leading-tight">
                Keyboard Shortcuts Commander
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Shortcuts Modal"
            className="w-8 h-8 rounded-xl bg-red-600 hover:bg-red-500 text-white border-2 border-black flex items-center justify-center cursor-pointer shadow-[2px_2px_0_#000] active:translate-y-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Section 1: 1-9 Tab Navigation */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-amber-400 font-mario uppercase">
              <Zap className="w-3.5 h-3.5" />
              <span>Direct Tab Switching (Keys 1 – 9)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SHORTCUTS.filter((s) => s.category === 'navigation').map((s) => (
                <div
                  key={s.key}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2"
                >
                  <span className="text-xs text-slate-300 font-medium truncate">
                    {s.action}
                  </span>
                  <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-amber-300 font-mono text-xs font-black shadow-[1px_1px_0_#000] shrink-0">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Study Tools & Simulators */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-400 font-mario uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Study Tools &amp; Simulators</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SHORTCUTS.filter((s) => s.category === 'study_tools').map((s) => (
                <div
                  key={s.key}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2"
                >
                  <span className="text-xs text-slate-300 font-medium truncate">
                    {s.action}
                  </span>
                  <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-amber-300 font-mono text-xs font-black shadow-[1px_1px_0_#000] shrink-0">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Audio & General */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-black text-cyan-400 font-mario uppercase">
              <Command className="w-3.5 h-3.5" />
              <span>Audio &amp; Dialog Controls</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SHORTCUTS.filter((s) => s.category === 'audio_controls').map((s) => (
                <div
                  key={s.key}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2"
                >
                  <span className="text-xs text-slate-300 font-medium truncate">
                    {s.action}
                  </span>
                  <kbd className="px-2 py-1 bg-slate-800 border border-slate-600 rounded text-amber-300 font-mono text-xs font-black shadow-[1px_1px_0_#000] shrink-0">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t-2 border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            Tip: Press <kbd className="text-amber-300 font-bold">?</kbd> at any time to open this commander!
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg border border-black cursor-pointer shadow-[1px_1px_0_#000]"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
