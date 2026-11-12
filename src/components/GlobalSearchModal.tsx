import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  BookOpen,
  Calculator,
  Grid,
  HelpCircle,
  Trophy,
  Gamepad2,
  ShoppingBag,
  Printer,
  ChevronRight,
  X,
  Sparkles,
  Command,
  Calendar,
  Clock,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Users,
  Volume2,
  VolumeX,
  Award,
  Bookmark,
  Compass,
  FileDown,
  Scale,
  Flame,
  FileText,
  Share2,
  RotateCcw,
  Coffee,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { ALL_LAW_TOPICS, WORLDS_METADATA } from '../data/laborLawData';
import { marioAudio } from '../utils/audio';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Topic' | 'Statute' | 'Coffee' | 'Calculator' | 'Quiz' | 'Game' | 'Tool' | 'Shortcut' | 'Button';
  tab: string;
  targetId?: string;
  actionId?: string;
  badge?: string;
  worldCode?: string;
  icon: React.ReactNode;
  keywords: string[];
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (tab: string, targetId?: string) => void;
  onOpenPrintGuide?: () => void;
  onOpenShop?: () => void;
  onOpenLeaderboard?: () => void;
  onStartQuickStudy?: () => void;
  onOpenDoleCalculator?: () => void;
  onOpenResearchCohort?: () => void;
  onOpenPomodoro?: () => void;
  onOpenProfile?: () => void;
  onOpenNotes?: () => void;
  onOpenStatuteLookup?: () => void;
  onOpenGlossary?: () => void;
  onOpenWalkthrough?: () => void;
  onOpenKnowledgeGraph?: () => void;
  onOpenCertificate?: () => void;
  onOpenTrainingLog?: () => void;
  onOpenExport?: () => void;
  onOpenAudioSettings?: () => void;
  activeWorld?: string;
}

// Levenshtein distance implementation for typo tolerance
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const v0 = new Int32Array(b.length + 1);
  const v1 = new Int32Array(b.length + 1);
  for (let i = 0; i <= b.length; i++) v0[i] = i;
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= b.length; j++) v0[j] = v1[j];
  }
  return v1[b.length];
}

// Typo tolerance matching: checks exact contains, subsequence, or edit distance <= 1-2
export function isFuzzyTokenMatch(queryTok: string, targetTok: string): boolean {
  if (targetTok.includes(queryTok) || queryTok.includes(targetTok)) return true;
  if (queryTok.length <= 2 || targetTok.length <= 2) return false;
  const maxDistance = queryTok.length <= 4 ? 1 : queryTok.length <= 7 ? 2 : 3;
  return levenshteinDistance(queryTok, targetTok) <= maxDistance;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectResult,
  onOpenPrintGuide,
  onOpenShop,
  onOpenLeaderboard,
  onStartQuickStudy,
  onOpenDoleCalculator,
  onOpenResearchCohort,
  onOpenPomodoro,
  onOpenProfile,
  onOpenNotes,
  onOpenStatuteLookup,
  onOpenGlossary,
  onOpenWalkthrough,
  onOpenKnowledgeGraph,
  onOpenCertificate,
  onOpenTrainingLog,
  onOpenExport,
  onOpenAudioSettings,
  activeWorld = 'all',
}) => {
  const [query, setQuery] = useState('');
  const [selectedWorldFilter, setSelectedWorldFilter] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const RECENT_SEARCHES_KEY = 'mario_recent_searches';
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved).slice(0, 5) : [];
    } catch {
      return [];
    }
  });

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const updated = [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // ignore
    }
  };

  // Pre-compiled comprehensive search registry
  const allItems: SearchResultItem[] = useMemo(() => {
    const list: SearchResultItem[] = [];

    // 1. Labor Law Topics
    ALL_LAW_TOPICS.forEach((t) => {
      list.push({
        id: `topic-${t.id}`,
        title: `${t.badge}: ${t.title}`,
        subtitle: t.summary.slice(0, 110) + '...',
        category: 'Topic',
        tab: 'modules',
        targetId: t.id,
        badge: t.badge,
        worldCode: t.worldId,
        icon: <BookOpen className="w-4 h-4 text-amber-400" />,
        keywords: [
          t.title.toLowerCase(),
          t.badge.toLowerCase(),
          t.worldId.toLowerCase(),
          t.summary.toLowerCase(),
          ...(t.keyDoctrines || []).map((d) => d.toLowerCase()),
          ...(t.rules || []).flatMap((r) => [r.heading.toLowerCase(), ...(r.items || []).map((it) => it.toLowerCase())]),
        ],
      });
    });

    // 2. Specific High-Yield Statutory Search Items (Including Coffee, Rest, Meals, Maternity, etc.)
    list.push(
      {
        id: 'coffee-breaks-art84',
        title: 'Art. 84: Compensable Short Rest Periods & Coffee Breaks',
        subtitle: 'Omnibus Rules Book III, Rule I, Sec. 7: Coffee breaks and short rest periods of 5 to 20 minutes shall be counted as compensable hours worked',
        category: 'Coffee',
        tab: 'modules',
        targetId: 'hours_general_rule',
        badge: 'Art. 84 · Coffee Breaks',
        worldCode: 'world1',
        icon: <Coffee className="w-4 h-4 text-amber-400" />,
        keywords: [
          'coffee', 'kape', 'coffee break', 'snack', 'merienda', 'rest', 'short rest',
          'art 84', 'article 84', 'compensable rest', 'break time', '5 minutes', '20 minutes',
          'hours of work', 'omnibus rules', 'compensable hours'
        ],
      },
      {
        id: 'meals-art85',
        title: 'Art. 85: Meal Periods & 20-Minute Shortened Meal Exception',
        subtitle: '60-minute non-compensable meal interval vs 20-minute shortened compensable meal break during non-continuous or emergency work',
        category: 'Topic',
        tab: 'modules',
        targetId: 'meal_periods',
        badge: 'Art. 85 · Meal Periods',
        worldCode: 'world1',
        icon: <Clock className="w-4 h-4 text-amber-300" />,
        keywords: [
          'meal', 'lunch', 'tanghalian', 'food', 'eating', 'merienda', 'art 85', 'article 85',
          'shortened meal', '60 minutes', '20 minutes', 'non-compensable', 'compensable meal'
        ],
      },
      {
        id: 'overtime-art87',
        title: 'Art. 87: Overtime Work Multipliers & Premium Pay',
        subtitle: 'Ordinary OT (+25% / 125%), Rest Day/Special Holiday OT (+30% / 169%), Regular Holiday OT (+30% / 260%), Double Holiday OT (+30% / 390%)',
        category: 'Calculator',
        tab: 'calculator',
        badge: 'Art. 87 · OT Multipliers',
        worldCode: 'world1',
        icon: <Calculator className="w-4 h-4 text-cyan-400" />,
        keywords: [
          'ot', 'overtime', 'over-time', 'over time', 'extra work', 'art 87', 'article 87',
          '125%', '130%', '169%', '200%', '260%', '300%', '390%', 'emergency overtime'
        ],
      },
      {
        id: 'undertime-art88',
        title: 'Art. 88: Undertime Not Offset by Overtime Doctrine',
        subtitle: 'Undertime work on any particular day shall not be offset by overtime work on any other day. Permission to leave does not waive OT pay',
        category: 'Topic',
        tab: 'modules',
        targetId: 'undertime_offset',
        badge: 'Art. 88 · Offset Ban',
        worldCode: 'world1',
        icon: <Scale className="w-4 h-4 text-amber-400" />,
        keywords: ['undertime', 'offset', 'late', 'tardiness', 'offsetting ban', 'art 88', 'article 88', 'absent']
      },
      {
        id: 'night-diff-art86',
        title: 'Art. 86: Night Shift Differential (10:00 PM to 6:00 AM)',
        subtitle: 'Mandatory additional 10% premium for every hour performed between 10:00 PM and 6:00 AM',
        category: 'Calculator',
        tab: 'calculator',
        badge: 'Art. 86 · Night Shift',
        worldCode: 'world1',
        icon: <Clock className="w-4 h-4 text-indigo-400" />,
        keywords: ['night', 'night diff', 'nsd', 'gabi', 'graveyard', '10pm', '6am', 'art 86', 'article 86', 'night shift', 'panggabi']
      },
      {
        id: '13th-month-pd851',
        title: 'P.D. 851: Mandatory 13th Month Pay Law',
        subtitle: 'Computed as 1/12 of the total basic salary earned by an employee within a calendar year, payable not later than December 24',
        category: 'Calculator',
        tab: 'calculator',
        badge: 'P.D. 851 · 13th Month',
        worldCode: 'world2',
        icon: <Calculator className="w-4 h-4 text-cyan-400" />,
        keywords: ['13th', '13th month', 'thirteenth month', 'pd 851', 'p.d. 851', 'bonus', 'xmas bonus', 'pasko', 'december 24', 'prorated 13th']
      },
      {
        id: 'maternity-ra11210',
        title: 'R.A. 11210: 105-Day Expanded Maternity Leave Law',
        subtitle: '105 days fully paid maternity leave with option for 30 days unpaid extension and 15 days additional for solo parents',
        category: 'Topic',
        tab: 'modules',
        targetId: 'leaves_maternity',
        badge: 'R.A. 11210 · Maternity',
        worldCode: 'world5',
        icon: <Sparkles className="w-4 h-4 text-pink-400" />,
        keywords: ['buntis', 'pregnancy', 'maternity', 'ra 11210', '105 days', 'panganganak', 'baby', 'miscarriage', 'solo parent maternity']
      },
      {
        id: 'paternity-ra8187',
        title: 'R.A. 8187: Paternity Leave Act (7 Days Fully Paid)',
        subtitle: '7 days paid leave for married male employees cohabiting with legitimate spouse for first 4 deliveries or miscarriages',
        category: 'Topic',
        tab: 'modules',
        targetId: 'leaves_paternity',
        badge: 'R.A. 8187 · Paternity',
        worldCode: 'world5',
        icon: <Users className="w-4 h-4 text-blue-400" />,
        keywords: ['tatay', 'paternity', 'father', 'ama', 'husband', 'asawa', 'ra 8187', '7 days', 'paternity leave']
      },
      {
        id: 'kasambahay-ra10361',
        title: 'R.A. 10361: Batas Kasambahay (Domestic Workers Act)',
        subtitle: 'Comprehensive labor protection, 13th month pay, 5 days SIL, SSS/PhilHealth/Pag-IBIG coverage, and minimum wage for domestic workers',
        category: 'Topic',
        tab: 'modules',
        targetId: 'special_domestic_workers',
        badge: 'R.A. 10361 · Kasambahay',
        worldCode: 'world4',
        icon: <Users className="w-4 h-4 text-emerald-400" />,
        keywords: ['kasambahay', 'katulong', 'maid', 'helper', 'domestic worker', 'yaya', 'ra 10361', 'batas kasambahay', 'sweldo kasambahay']
      },
      {
        id: 'wage-distortion-art124',
        title: 'Art. 124: Wage Distortion Doctrine & Pineda Formula',
        subtitle: 'Severe contraction or elimination of the quantitative gap between wage rates caused by statutory wage orders',
        category: 'Calculator',
        tab: 'calculator',
        badge: 'Art. 124 · Distortion',
        worldCode: 'world3',
        icon: <Calculator className="w-4 h-4 text-cyan-400" />,
        keywords: ['distortion', 'wage distortion', 'pineda formula', 'art 124', 'article 124', 'hierarchy', 'rtwpb', 'sweldo distortion']
      },
      {
        id: 'retirement-pay-art302',
        title: 'Art. 302: Statutory Retirement Pay Law (R.A. 7641)',
        subtitle: 'Retirement pay equal to at least 1/2 month salary for every year of service (22.5 days salary per year of service)',
        category: 'Topic',
        tab: 'modules',
        targetId: 'retirement_pay',
        badge: 'Art. 302 · Retirement',
        worldCode: 'world6',
        icon: <Scale className="w-4 h-4 text-purple-400" />,
        keywords: ['retirement', 'retire', 'pension', '60 years', '65 years', '22.5 days', 'ra 7641', 'art 302', 'art 287', 'senior']
      },
      {
        id: 'service-charge-art96',
        title: 'Art. 96: 100% Service Charge Distribution Law (R.A. 11360)',
        subtitle: 'All service charges collected by hotels, restaurants, and similar establishments shall be distributed completely and equally (100%) to all covered employees',
        category: 'Topic',
        tab: 'modules',
        targetId: 'service_charge',
        badge: 'Art. 96 · 100% Service Charge',
        worldCode: 'world2',
        icon: <Sparkles className="w-4 h-4 text-amber-400" />,
        keywords: ['service charge', 'tip', 'restaurant', 'hotel', 'waiter', '100%', 'ra 11360', 'art 96', 'article 96']
      }
    );

    // 3. Shortcuts
    list.push(
      {
        id: 'shortcut-ctrl-k',
        title: 'Shortcut: Ctrl + K (or Cmd + K)',
        subtitle: 'Open the Global Search Spotlight anywhere in the app to find doctrines, tools, shortcuts, buttons, and topics',
        category: 'Shortcut',
        tab: 'search',
        actionId: 'search',
        badge: 'Ctrl+K / Cmd+K',
        icon: <Command className="w-4 h-4 text-amber-400" />,
        keywords: ['ctrl+k', 'ctrl k', 'cmd+k', 'cmd k', 'shortcut', 'search', 'spotlight', 'quick find', 'hotkey', 'keys']
      },
      {
        id: 'shortcut-esc',
        title: 'Shortcut: ESC (Escape Key)',
        subtitle: 'Dismiss any open modal, dialog, slide deck, or popover and return immediately to the main screen',
        category: 'Shortcut',
        tab: 'close',
        actionId: 'close',
        badge: 'ESC Key',
        icon: <Command className="w-4 h-4 text-rose-400" />,
        keywords: ['esc', 'escape', 'cancel', 'dismiss', 'exit', 'close modal', 'shortcut', 'hotkey']
      },
      {
        id: 'shortcut-question-mark',
        title: 'Shortcut: ? (Question Mark Key)',
        subtitle: 'Quick shortcut to open the Mystery Block Flashcards deck with 245+ active recall cards',
        category: 'Shortcut',
        tab: 'flashcards',
        badge: '? Key',
        icon: <HelpCircle className="w-4 h-4 text-yellow-400" />,
        keywords: ['?', 'question mark', 'flashcards', 'cards', 'shortcut', 'mystery block', 'hotkey']
      },
      {
        id: 'shortcut-m-mute',
        title: 'Shortcut: M (Mute / Unmute Audio)',
        subtitle: 'Toggle retro Super Mario BGM and interactive soundscapes on or off with a single keystroke',
        category: 'Shortcut',
        tab: 'audio_toggle',
        actionId: 'audio_toggle',
        badge: 'M Key',
        icon: <Volume2 className="w-4 h-4 text-emerald-400" />,
        keywords: ['m', 'mute', 'unmute', 'sound', 'music', 'audio toggle', 'shortcut', 'hotkey']
      },
      {
        id: 'shortcut-1-6-worlds',
        title: 'Shortcut: Number Keys 1 to 6',
        subtitle: 'Jump directly to Worlds 1 through 6: W1 (Hours), W2 (Rest/Holidays), W3 (Wages), W4 (Special Groups), W5 (Protective Laws), W6 (Post-Employment)',
        category: 'Shortcut',
        tab: 'world_jump',
        badge: 'Keys 1-6',
        icon: <Command className="w-4 h-4 text-cyan-400" />,
        keywords: ['1', '2', '3', '4', '5', '6', 'number keys', 'world jump', 'shortcut', 'hotkey']
      },
      {
        id: 'shortcut-arrows-wasd',
        title: 'Shortcut: Arrow Keys & WASD',
        subtitle: 'Steer Labor Kart GP, jump in 2D Legal Platformer, navigate 3D Mario Island, and flip flashcards',
        category: 'Shortcut',
        tab: 'vault',
        badge: 'WASD / Arrows',
        icon: <Gamepad2 className="w-4 h-4 text-purple-400" />,
        keywords: ['arrows', 'wasd', 'controls', 'keys', 'game controls', 'jump', 'move', 'shortcut', 'hotkey']
      }
    );

    // 4. Buttons & Icons in UI
    list.push(
      {
        id: 'btn-audio-settings',
        title: 'Audio Settings Button (Sound Icon in Navbar)',
        subtitle: 'Click to open Audio Settings: configure volume sliders, toggle background chiptunes, and switch Toad Shop era audio packs',
        category: 'Button',
        tab: 'audio_settings',
        actionId: 'audio_settings',
        badge: 'Audio Icon',
        icon: <Volume2 className="w-4 h-4 text-emerald-400" />,
        keywords: ['audio button', 'sound button', 'volume icon', 'music icon', 'bgm', 'speaker', 'audio settings', 'button', 'icon']
      },
      {
        id: 'btn-toad-shop',
        title: "Toad's Item Shop Button (Shopping Bag Icon)",
        subtitle: 'Click to open Toad Item Shop: spend coins on 34 Hero Avatars, Super Star 2x buffs, Shortcut Maps, and retro Audio Packs',
        category: 'Button',
        tab: 'shop',
        actionId: 'shop',
        badge: 'Shop Icon',
        icon: <ShoppingBag className="w-4 h-4 text-pink-400" />,
        keywords: ['toad shop button', 'shop button', 'shopping bag icon', 'store', 'buy', 'hero', 'items', 'button', 'icon']
      },
      {
        id: 'btn-leaderboard',
        title: 'Global Coin Leaderboard Button (Trophy Icon)',
        subtitle: 'Click to view the Coin Leaderboard: track your rank, Fire Flower streak records, and coin totals across scholars',
        category: 'Button',
        tab: 'leaderboard',
        actionId: 'leaderboard',
        badge: 'Trophy Icon',
        icon: <Trophy className="w-4 h-4 text-amber-400" />,
        keywords: ['leaderboard button', 'trophy button', 'trophy icon', 'rankings', 'top scholars', 'leader board', 'button', 'icon']
      },
      {
        id: 'btn-print-guide',
        title: 'Print Study Guide Button (Printer Icon)',
        subtitle: 'Click to open Print Studio & PDF Generator: export high-res publication guides, one-page summaries, and codal slips',
        category: 'Button',
        tab: 'print_guide',
        actionId: 'print_guide',
        badge: 'Printer Icon',
        icon: <Printer className="w-4 h-4 text-purple-400" />,
        keywords: ['print button', 'printer button', 'printer icon', 'pdf button', 'print guide', 'export pdf', 'button', 'icon']
      },
      {
        id: 'btn-certificate',
        title: 'Official Certificate of Completion Button (Award Icon)',
        subtitle: 'Click to open and print your official signed Philippine Labor Law Certificate of Mastery with gold seal',
        category: 'Button',
        tab: 'certificate',
        actionId: 'certificate',
        badge: 'Award Icon',
        icon: <Award className="w-4 h-4 text-amber-400" />,
        keywords: ['certificate button', 'cert button', 'award icon', 'diploma', 'completion certificate', 'graduation', 'button', 'icon']
      },
      {
        id: 'btn-pomodoro',
        title: 'Pomodoro Sprint Focus Timer Button (Clock Icon)',
        subtitle: 'Click to launch 25-minute Pomodoro focus study timer with coin rewards and audio chimes',
        category: 'Button',
        tab: 'pomodoro',
        actionId: 'pomodoro',
        badge: 'Clock Icon',
        icon: <Clock className="w-4 h-4 text-emerald-400" />,
        keywords: ['pomodoro button', 'timer button', 'clock button', 'clock icon', 'focus timer', 'sprint timer', 'study timer', 'button', 'icon']
      },
      {
        id: 'btn-study-notes',
        title: 'Study Notes Drawer Button (Bookmark / Notes Icon)',
        subtitle: 'Click to open floating Study Notes Drawer with Speech-to-Text Voice Memo, markdown formatting, and PDF export',
        category: 'Button',
        tab: 'notes',
        actionId: 'notes',
        badge: 'Bookmark Icon',
        icon: <Bookmark className="w-4 h-4 text-amber-400" />,
        keywords: ['notes button', 'notes icon', 'bookmark button', 'bookmark icon', 'study notes', 'drawer', 'voice memo', 'dictation', 'button', 'icon']
      },
      {
        id: 'btn-profile',
        title: 'Scholar Profile & Achievements Button (Avatar Icon)',
        subtitle: 'Click to open your Scholar Profile: inspect Level XP progression, equipped avatar, unlocked badges, and stats',
        category: 'Button',
        tab: 'profile',
        actionId: 'profile',
        badge: 'Profile Icon',
        icon: <Users className="w-4 h-4 text-blue-400" />,
        keywords: ['profile button', 'avatar button', 'avatar icon', 'user icon', 'stats button', 'achievements', 'level', 'button', 'icon']
      },
      {
        id: 'btn-knowledge-graph',
        title: 'Labor Law Knowledge Graph Button (Network Icon)',
        subtitle: 'Click to open dynamic D3 interactive network graph visualizing connected Labor Code articles, leaves, and case doctrines',
        category: 'Button',
        tab: 'knowledge_graph',
        actionId: 'knowledge_graph',
        badge: 'Graph Icon',
        icon: <Grid className="w-4 h-4 text-purple-400" />,
        keywords: ['knowledge graph button', 'graph icon', 'network icon', 'interactive graph', 'nodes', 'connections', 'button', 'icon']
      },
      {
        id: 'btn-training-log',
        title: "Toad's Training Log Button (Scroll Icon)",
        subtitle: 'Click to inspect comprehensive study logs, quiz session history, error tracking, and mastery charts',
        category: 'Button',
        tab: 'training_log',
        actionId: 'training_log',
        badge: 'Scroll Icon',
        icon: <FileText className="w-4 h-4 text-amber-400" />,
        keywords: ['training log button', 'scroll icon', 'training log', 'history button', 'study log', 'log icon', 'button', 'icon']
      },
      {
        id: 'btn-statute-lookup',
        title: 'Republic Act & Labor Code Statute Lookup Button (Book Icon)',
        subtitle: 'Click to open verbatim statutory viewer and search any Article or Republic Act in full unabridged text',
        category: 'Button',
        tab: 'statute_lookup',
        actionId: 'statute_lookup',
        badge: 'Scale / Book Icon',
        icon: <Scale className="w-4 h-4 text-amber-400" />,
        keywords: ['statute button', 'statute lookup button', 'codal button', 'codex button', 'scale icon', 'book icon', 'verbatim lookup', 'button', 'icon']
      },
      {
        id: 'btn-walkthrough',
        title: 'App Walkthrough Tour Button (Compass Icon)',
        subtitle: 'Click to launch interactive guided walkthrough of the Super Mario Labor Adventure app',
        category: 'Button',
        tab: 'walkthrough',
        actionId: 'walkthrough',
        badge: 'Compass Icon',
        icon: <Compass className="w-4 h-4 text-sky-400" />,
        keywords: ['walkthrough button', 'tour button', 'compass icon', 'guide button', 'help button', 'tutorial', 'button', 'icon']
      },
      {
        id: 'btn-research-cohort',
        title: 'Research Cohort Directory Button (Users Icon)',
        subtitle: 'Click to view the 9 Official Research Authors led by Matthew Cesar Corpuz (Main Creator · Executed All Roles)',
        category: 'Button',
        tab: 'research_cohort',
        actionId: 'research_cohort',
        badge: 'Authors Icon',
        icon: <Users className="w-4 h-4 text-amber-400" />,
        keywords: ['research cohort button', 'authors button', 'users icon', 'creators button', 'credits', 'matthew cesar corpuz', 'button', 'icon']
      },
      {
        id: 'btn-export-backup',
        title: 'Backup & Export Progress Button (Download Icon)',
        subtitle: 'Click to export or import your progress, achievements, coin count, and completed modules as a JSON backup',
        category: 'Button',
        tab: 'export_progress',
        actionId: 'export_progress',
        badge: 'File Down Icon',
        icon: <FileDown className="w-4 h-4 text-emerald-400" />,
        keywords: ['export button', 'backup button', 'download icon', 'save progress button', 'import progress', 'button', 'icon']
      }
    );

    // 5. Calculators & Tools
    list.push(
      {
        id: 'calc-ot',
        title: 'Overtime & Premium Calculator',
        subtitle: 'Compute exact pesos for 125%, 130%, 150%, 169%, 200%, 260%, 300% rates',
        category: 'Calculator',
        tab: 'calculator',
        badge: 'Formula',
        icon: <Calculator className="w-4 h-4 text-cyan-400" />,
        keywords: ['calculator', 'overtime', 'ot', 'multiplier', 'premium pay', 'wage computation', 'hourly rate']
      },
      {
        id: 'tool-dole-calc',
        title: 'DOLE Statutory Pay & Overtime Multiplier Calculator',
        subtitle: 'Interactive wage simulator for ordinary OT (125%), night shift (110%), holidays (200%/260%/300%), 13th month & retirement (Art. 302)',
        category: 'Calculator',
        tab: 'dole_calc',
        actionId: 'dole_calc',
        badge: 'DOLE BWC',
        icon: <Calculator className="w-4 h-4 text-emerald-400" />,
        keywords: ['dole calculator', 'simulator', 'wages', 'sweldo', 'pay calculation', 'annual factor 313', 'night diff']
      },
      {
        id: 'tool-holidays',
        title: 'Philippine Holidays Hub (12 Regular & Special Days)',
        subtitle: 'Complete Regular Holidays, Special Non-Working/Working Days, Double Holidays (300%/390%), Pay Simulator & Quiz',
        category: 'Topic',
        tab: 'holidays',
        badge: 'Holidays Tab',
        icon: <Calendar className="w-4 h-4 text-rose-400" />,
        keywords: ['holidays', 'regular holidays', 'special non-working', 'double holiday', 'christmas', 'new year', 'holy week', 'holiday pay']
      },
      {
        id: 'tool-wages',
        title: '17 Regions Minimum Wage Matrix',
        subtitle: 'Official RTWPB wage rates across NCR (₱645), Region IV-A, Region VII, BARMM, etc.',
        category: 'Tool',
        tab: 'wages_matrix',
        badge: '17 Regions',
        icon: <Grid className="w-4 h-4 text-blue-400" />,
        keywords: ['minimum wage', 'rtwpb', 'regional wage', 'ncr 645', 'wages matrix', '17 regions', 'sweldo rate']
      },
      {
        id: 'tool-quick-study',
        title: '5-Minute Quick Study Mode (Need Improvement Deck)',
        subtitle: 'Generates a curated 5-minute flashcard sprint from topics flagged Need Improvement in your profile',
        category: 'Quiz',
        tab: 'quick_study',
        actionId: 'quick_study',
        badge: '5-Min Blitz',
        icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
        keywords: ['quick study', 'sprint', 'flashcard blitz', 'needs improvement', '5 minutes', 'study sprint']
      },
      {
        id: 'tool-flashcards',
        title: '[ ? ] Mystery Block Flashcards (245+ Cards)',
        subtitle: 'Rapid active-recall memory cards across all 6 Worlds (including Statutory Leaves) + Holidays Deck',
        category: 'Quiz',
        tab: 'flashcards',
        badge: '245+ Cards',
        icon: <HelpCircle className="w-4 h-4 text-yellow-400" />,
        keywords: ['flashcards', 'cards', 'active recall', 'mystery block', 'memory cards', 'study cards', 'question mark']
      },
      {
        id: 'tool-quiz',
        title: 'Castle Quest & Bowser Boss Battle (189+ Scenarios)',
        subtitle: '189+ Bar-exam scenario questions across Worlds 1–6 with topic filters and Mega Bowser boss mode',
        category: 'Quiz',
        tab: 'quiz',
        badge: '189+ Scenarios',
        icon: <Trophy className="w-4 h-4 text-amber-400" />,
        keywords: ['quiz', 'bowser', 'boss battle', 'castle quest', 'practice arena', 'bar questions', 'scenarios', 'mega bowser']
      }
    );

    // 6. Game Vault (17 Total Playable Games)
    list.push(
      {
        id: 'game-kart',
        title: 'Labor Kart GP (Arcade Racer)',
        subtitle: 'Race Mushroom Circuit and hit [?] item boxes for quiz turbo boosts',
        category: 'Game',
        tab: 'vault',
        badge: 'Kart GP',
        icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />,
        keywords: ['kart', 'labor kart', 'racing', 'game', 'gp', 'mushroom circuit']
      },
      {
        id: 'game-3d',
        title: '3D Mario Coin Island (Three.js 3D Arena)',
        subtitle: 'Full 3D Mushroom Kingdom island with momentum physics, variable jump height & Castle keep',
        category: 'Game',
        tab: 'vault',
        badge: '3D Island',
        icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />,
        keywords: ['3d', 'threejs', '3d island', 'coin island', 'mario 3d', 'open world', 'game']
      },
      {
        id: 'game-2d',
        title: 'Super Mario Legal Run (2D Platformer)',
        subtitle: 'Jump, stomp Goombas, and smash [?] blocks to reveal Labor Doctrines',
        category: 'Game',
        tab: 'vault',
        badge: '2D Run',
        icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />,
        keywords: ['2d', 'platformer', '2d run', 'legal run', 'goomba', 'stomp', 'game']
      },
      {
        id: 'game-whack',
        title: 'Whack-a-Goomba: Illegal Deduction Smasher',
        subtitle: 'Smash unlawful wage deductions across 9 warp pipes while sparing Art. 113 deductions',
        category: 'Game',
        tab: 'vault',
        badge: 'Arcade',
        icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />,
        keywords: ['whack', 'goomba', 'deductions', 'art 113', 'illegal deductions', 'pipes', 'game']
      },
      {
        id: 'game-memory',
        title: 'Mario Party: Multiplier Memory Match',
        subtitle: 'Flip 16 [?] blocks to match work scenarios with 125%–390% statutory multipliers',
        category: 'Game',
        tab: 'vault',
        badge: 'Memory',
        icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />,
        keywords: ['memory', 'match', 'multiplier match', 'pairs', 'mario party', 'game']
      },
      {
        id: 'game-mansion',
        title: "Luigi's Mansion: Contractor Buster (D.O. 174)",
        subtitle: 'Bust prohibited Labor-Only Ghost Agencies and certify valid ₱5M contractors',
        category: 'Game',
        tab: 'vault',
        badge: 'D.O. 174',
        icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />,
        keywords: ['luigi', 'mansion', 'contractor', 'labor only contracting', 'do 174', 'ghost', 'subcontracting', 'game']
      },
      {
        id: 'game-bridge',
        title: "Bowser's Bridge: Doctrine Rescue",
        subtitle: 'Decode statutory terms letter-by-letter before Bowser drops the bridge',
        category: 'Game',
        tab: 'vault',
        badge: 'Decoder',
        icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />,
        keywords: ['bridge', 'decoder', 'hangman', 'rescue', 'bowser bridge', 'doctrine', 'game']
      },
      {
        id: 'game-sorter',
        title: 'Dr. Mario: Holiday & Wage Pipe Sorter (+ Bonus Vault Games)',
        subtitle: 'Play Yoshi Leave Egg Toss, Koopa Brick Breaker, Boo Burden Spotlight, Toad Payroll Express & more',
        category: 'Game',
        tab: 'vault',
        badge: '17 Games',
        icon: <Gamepad2 className="w-4 h-4 text-emerald-400" />,
        keywords: ['sorter', 'dr mario', 'pipe sorter', 'vault', 'mini games', '17 games', 'bonus vault']
      }
    );

    return list;
  }, []);

  // Filter items with world filter and typo-tolerant search
  const filteredItems = useMemo(() => {
    let list = allItems;
    if (selectedWorldFilter !== 'all') {
      list = list.filter((item) => !item.worldCode || item.worldCode === selectedWorldFilter);
    }
    const rawQ = query.trim().toLowerCase();
    if (!rawQ) return list.slice(0, 20);

    // Split query into tokens for multi-word and typo-tolerant matching
    const queryTokens = rawQ.split(/\s+/).filter(Boolean);

    // Score and rank matches
    const scored = list
      .map((item) => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const subtitleLower = item.subtitle.toLowerCase();
        const badgeLower = (item.badge || '').toLowerCase();
        const categoryLower = item.category.toLowerCase();
        const allItemWords = [
          ...titleLower.split(/[\s,.:;()/-]+/),
          ...subtitleLower.split(/[\s,.:;()/-]+/),
          ...badgeLower.split(/[\s,.:;()/-]+/),
          ...categoryLower.split(/[\s,.:;()/-]+/),
          ...item.keywords.flatMap((k) => k.split(/[\s,.:;()/-]+/)),
        ].filter(Boolean);

        // Exact match boost
        if (titleLower === rawQ) score += 200;
        if (badgeLower === rawQ) score += 180;
        if (titleLower.startsWith(rawQ)) score += 120;
        if (titleLower.includes(rawQ)) score += 80;
        if (badgeLower.includes(rawQ)) score += 75;
        if (subtitleLower.includes(rawQ)) score += 50;

        // Check if any keyword matches exact
        if (item.keywords.some((k) => k === rawQ || k.includes(rawQ))) {
          score += 90;
        }

        // Token-by-token fuzzy matching with typo tolerance
        let matchedTokensCount = 0;
        for (const qTok of queryTokens) {
          let tokenMatched = false;
          // Exact or substring match in any field
          if (
            titleLower.includes(qTok) ||
            subtitleLower.includes(qTok) ||
            badgeLower.includes(qTok) ||
            item.keywords.some((k) => k.includes(qTok))
          ) {
            tokenMatched = true;
            score += 40;
          } else {
            // Check typo distance against individual target words
            for (const targetWord of allItemWords) {
              if (isFuzzyTokenMatch(qTok, targetWord)) {
                tokenMatched = true;
                score += 25;
                break;
              }
            }
          }
          if (tokenMatched) matchedTokensCount++;
        }

        // If all query tokens matched (either exact or typo), huge bonus
        if (matchedTokensCount === queryTokens.length) {
          score += 60;
        }

        return { item, score, matched: matchedTokensCount > 0 || score > 0 };
      })
      .filter((res) => res.matched && res.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((res) => res.item);

    return scored.slice(0, 25);
  }, [allItems, query, selectedWorldFilter]);

  // Focus input on open and set initial world filter
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      if (activeWorld && activeWorld !== 'all') {
        setSelectedWorldFilter(activeWorld);
      } else {
        setSelectedWorldFilter('all');
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, activeWorld]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          executeSelection(filteredItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const executeSelection = (item: SearchResultItem) => {
    marioAudio.playPipe();
    saveRecentSearch(query.trim() || item.title);
    onClose();

    // Check specific action mappings
    if (item.actionId === 'print_guide') {
      if (onOpenPrintGuide) onOpenPrintGuide();
    } else if (item.actionId === 'certificate') {
      if (onOpenCertificate) onOpenCertificate();
      else if (onOpenPrintGuide) onOpenPrintGuide();
    } else if (item.actionId === 'leaderboard') {
      if (onOpenLeaderboard) onOpenLeaderboard();
    } else if (item.actionId === 'quick_study') {
      if (onStartQuickStudy) onStartQuickStudy();
      else onSelectResult('flashcards');
    } else if (item.actionId === 'shop') {
      if (onOpenShop) onOpenShop();
      else onSelectResult('shop');
    } else if (item.actionId === 'dole_calc') {
      if (onOpenDoleCalculator) onOpenDoleCalculator();
      else onSelectResult('calculator');
    } else if (item.actionId === 'research_cohort') {
      if (onOpenResearchCohort) onOpenResearchCohort();
    } else if (item.actionId === 'pomodoro') {
      if (onOpenPomodoro) onOpenPomodoro();
    } else if (item.actionId === 'profile') {
      if (onOpenProfile) onOpenProfile();
    } else if (item.actionId === 'notes') {
      if (onOpenNotes) onOpenNotes();
      else window.dispatchEvent(new CustomEvent('mario-open-study-notes'));
    } else if (item.actionId === 'statute_lookup') {
      if (onOpenStatuteLookup) onOpenStatuteLookup();
    } else if (item.actionId === 'walkthrough') {
      if (onOpenWalkthrough) onOpenWalkthrough();
    } else if (item.actionId === 'knowledge_graph') {
      if (onOpenKnowledgeGraph) onOpenKnowledgeGraph();
    } else if (item.actionId === 'training_log') {
      if (onOpenTrainingLog) onOpenTrainingLog();
    } else if (item.actionId === 'export_progress') {
      if (onOpenExport) onOpenExport();
    } else if (item.actionId === 'audio_settings') {
      if (onOpenAudioSettings) {
        onOpenAudioSettings();
      } else {
        document.querySelector<HTMLElement>('[data-testid="navbar-audio-sliders-btn"]')?.click();
      }
    } else if (item.actionId === 'audio_toggle') {
      marioAudio.toggleMute();
    } else if (item.actionId === 'close') {
      // already closed
    } else {
      onSelectResult(item.tab, item.targetId);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Search"
      data-testid="global-search-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center p-0 sm:pt-14 sm:px-4 bg-black/80 select-none print:hidden overscroll-contain"
    >
      <div className="bg-[#1e293b] text-white w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[84vh] rounded-none sm:rounded-3xl border-0 sm:border-4 border-slate-950 shadow-[0_16px_48px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col safe-top-nav safe-bottom-dock">
        {/* Search Header Bar */}
        <div className="p-3 sm:p-4 bg-[#0f172a] border-b-2 border-slate-700 flex items-center gap-2.5 shrink-0">
          <Search className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            aria-label="Search labor doctrines, coffee breaks, shortcuts, calculators, buttons, or games"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search all: coffee, shortcuts, buttons, typo, articles... (Ctrl+K)"
            className="w-full bg-transparent text-white placeholder-slate-400 font-bold text-sm sm:text-base outline-none min-w-0"
          />
          {/* World Filter Dropdown */}
          <select
            data-testid="global-search-world-filter"
            aria-label="Filter results by World"
            value={selectedWorldFilter}
            onChange={(e) => {
              setSelectedWorldFilter(e.target.value);
              setSelectedIndex(0);
            }}
            className="bg-slate-800 text-amber-300 font-bold text-xs px-2 py-1.5 rounded-lg border border-slate-700 outline-none hover:border-amber-400 focus:border-amber-400 cursor-pointer shrink-0 max-w-[120px] sm:max-w-[160px] truncate"
          >
            <option value="all">All Worlds</option>
            {WORLDS_METADATA.map((w) => (
              <option key={w.id} value={w.id}>
                {w.id.toUpperCase()}: {w.title.split(':')[0] || w.title}
              </option>
            ))}
          </select>

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search query"
              className="text-slate-400 hover:text-white min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Global Search"
            className="min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 sm:px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between gap-2 overflow-x-auto text-xs shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase text-slate-400 font-mono flex items-center gap-1 shrink-0">
              <Sparkles className="w-3 h-3 text-amber-400" /> Instant Find:
            </span>
            {[
              { label: 'Coffee Breaks (Art. 84)', q: 'coffee' },
              { label: 'Shortcuts (Ctrl+K)', q: 'shortcuts' },
              { label: 'UI Buttons & Icons', q: 'button' },
              { label: 'Overtime (125%)', q: 'overtime' },
              { label: '13th Month Pay', q: '13th month' },
              { label: 'Maternity Leave (105d)', q: 'maternity' },
              { label: 'Bowser Boss Battle', q: 'bowser' },
            ].map((chip) => (
              <button
                key={chip.q}
                type="button"
                onClick={() => {
                  setQuery(chip.q);
                  setSelectedIndex(0);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>
          {recentSearches.length > 0 && (
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-[10px] text-slate-500 hover:text-red-400 font-semibold cursor-pointer shrink-0"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="overflow-y-auto p-2 sm:p-3 space-y-1.5 flex-1"
        >
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center text-slate-400 space-y-3 px-4">
              <Search className="w-10 h-10 mx-auto text-slate-500 opacity-60" />
              <p className="font-bold text-sm text-slate-200">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Typo tolerance is active! Try searching for <span className="text-amber-300 font-mono">&quot;coffee&quot;</span>, <span className="text-amber-300 font-mono">&quot;shortcuts&quot;</span>, <span className="text-amber-300 font-mono">&quot;buttons&quot;</span>, <span className="text-amber-300 font-mono">&quot;maternity&quot;</span>, or <span className="text-amber-300 font-mono">&quot;calculator&quot;</span>.
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => executeSelection(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000] scale-[1.01]'
                      : 'bg-slate-900/80 hover:bg-slate-800/90 text-white border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2 flex-1">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                        isSelected ? 'bg-slate-950 text-amber-400 border-black' : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-black text-xs sm:text-sm break-words ${
                            isSelected ? 'text-slate-950 font-display' : 'text-slate-100 font-display'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[9.5px] font-black uppercase px-1.5 py-0.2 rounded font-mario flex-shrink-0 leading-tight ${
                              isSelected
                                ? 'bg-black text-amber-300'
                                : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs font-medium line-clamp-1 mt-0.5 break-words ${
                          isSelected ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span
                      className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-slate-950/10 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.category}
                    </span>
                    <ChevronRight
                      className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-slate-500'}`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="p-2.5 sm:p-3 bg-[#0f172a] border-t border-slate-700 flex items-center justify-between text-[11px] font-semibold text-slate-400 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Navigate:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono inline-flex items-center">
              <ArrowUp className="w-2.5 h-2.5" />
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono inline-flex items-center">
              <ArrowDown className="w-2.5 h-2.5" />
            </kbd>
            <span className="ml-1">Select:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono inline-flex items-center gap-1">
              <CornerDownLeft className="w-2.5 h-2.5" />
              <span>Enter</span>
            </kbd>
          </div>
          <span className="hidden sm:inline font-mario text-[10px] text-amber-400">
            FUZZY TYPO-TOLERANT SPOTLIGHT
          </span>
        </div>
      </div>
    </div>
  );
};
