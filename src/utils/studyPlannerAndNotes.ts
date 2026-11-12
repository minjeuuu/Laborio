// Pure, deterministic state helpers for Note Line Highlighting & Starring + Weekly Study Planner (Mon-Sun)
import { StorageLike } from './round11Features';

export const NOTE_LINE_ANNOTATIONS_KEY = 'mario_note_line_annotations_v1';
export const WEEKLY_STUDY_PLANNER_KEY = 'mario_weekly_study_planner_v1';

export type PlannerDayKey = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export const PLANNER_DAYS: readonly PlannerDayKey[] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];

export type HighlightColorKey =
  | 'yellow'
  | 'emerald'
  | 'sky'
  | 'pink'
  | 'purple'
  | 'orange'
  | 'lime'
  | 'amber'
  | 'red'
  | 'teal'
  | 'indigo'
  | 'silver';

export interface HighlightColorSpec {
  id: HighlightColorKey;
  label: string;
  categoryHint: string;
  bgClass: string;
  textClass: string;
  ringClass: string;
  badgeClass: string;
  hex: string;
  swatchBg: string;
}

export const HIGHLIGHT_COLORS: readonly HighlightColorSpec[] = [
  {
    id: 'yellow',
    label: 'Neon Canary',
    categoryHint: 'Core Rules & Codal Standard',
    bgClass: 'bg-amber-300',
    textClass: 'text-slate-950 font-bold',
    ringClass: 'ring-2 ring-amber-400 shadow-md',
    badgeClass: 'bg-amber-400 text-slate-950 border border-black',
    hex: '#fde047',
    swatchBg: '#fde047',
  },
  {
    id: 'emerald',
    label: 'Mint Emerald',
    categoryHint: 'Statutory Exceptions & Rights',
    bgClass: 'bg-emerald-300',
    textClass: 'text-emerald-950 font-bold',
    ringClass: 'ring-2 ring-emerald-400 shadow-md',
    badgeClass: 'bg-emerald-400 text-emerald-950 border border-emerald-800',
    hex: '#6ee7b7',
    swatchBg: '#6ee7b7',
  },
  {
    id: 'sky',
    label: 'Azure Sky',
    categoryHint: 'Bar Problem Scenarios',
    bgClass: 'bg-sky-300',
    textClass: 'text-sky-950 font-bold',
    ringClass: 'ring-2 ring-sky-400 shadow-md',
    badgeClass: 'bg-sky-400 text-sky-950 border border-sky-800',
    hex: '#7dd3fc',
    swatchBg: '#7dd3fc',
  },
  {
    id: 'pink',
    label: 'Sakura Rose',
    categoryHint: 'Statutory Prohibitions & Traps',
    bgClass: 'bg-pink-300',
    textClass: 'text-pink-950 font-bold',
    ringClass: 'ring-2 ring-pink-400 shadow-md',
    badgeClass: 'bg-pink-400 text-pink-950 border border-pink-800',
    hex: '#f472b6',
    swatchBg: '#f472b6',
  },
  {
    id: 'purple',
    label: 'Electric Violet',
    categoryHint: 'Landmark SC Doctrines',
    bgClass: 'bg-purple-300',
    textClass: 'text-purple-950 font-bold',
    ringClass: 'ring-2 ring-purple-400 shadow-md',
    badgeClass: 'bg-purple-400 text-purple-950 border border-purple-800',
    hex: '#c084fc',
    swatchBg: '#c084fc',
  },
  {
    id: 'orange',
    label: 'Sunset Tangerine',
    categoryHint: 'Prescriptive Deadlines & Dates',
    bgClass: 'bg-orange-300',
    textClass: 'text-orange-950 font-bold',
    ringClass: 'ring-2 ring-orange-400 shadow-md',
    badgeClass: 'bg-orange-400 text-orange-950 border border-orange-800',
    hex: '#fb923c',
    swatchBg: '#fb923c',
  },
  {
    id: 'lime',
    label: 'Radiant Lime',
    categoryHint: 'Formula Multipliers & Rates',
    bgClass: 'bg-lime-300',
    textClass: 'text-lime-950 font-bold',
    ringClass: 'ring-2 ring-lime-400 shadow-md',
    badgeClass: 'bg-lime-400 text-lime-950 border border-lime-800',
    hex: '#a3e635',
    swatchBg: '#a3e635',
  },
  {
    id: 'amber',
    label: 'Golden Amber',
    categoryHint: '13th Month & Service Charges',
    bgClass: 'bg-amber-400',
    textClass: 'text-amber-950 font-bold',
    ringClass: 'ring-2 ring-amber-500 shadow-md',
    badgeClass: 'bg-amber-500 text-amber-950 border border-amber-800',
    hex: '#f59e0b',
    swatchBg: '#f59e0b',
  },
  {
    id: 'red',
    label: 'Coral Ruby',
    categoryHint: 'Dismissal Grounds & Penalties',
    bgClass: 'bg-rose-300',
    textClass: 'text-rose-950 font-bold',
    ringClass: 'ring-2 ring-rose-400 shadow-md',
    badgeClass: 'bg-rose-400 text-rose-950 border border-rose-800',
    hex: '#f87171',
    swatchBg: '#f87171',
  },
  {
    id: 'teal',
    label: 'Turquoise Lagoon',
    categoryHint: 'Special Leave Statutory Caps',
    bgClass: 'bg-teal-300',
    textClass: 'text-teal-950 font-bold',
    ringClass: 'ring-2 ring-teal-400 shadow-md',
    badgeClass: 'bg-teal-400 text-teal-950 border border-teal-800',
    hex: '#2dd4bf',
    swatchBg: '#2dd4bf',
  },
  {
    id: 'indigo',
    label: 'Royal Lavender',
    categoryHint: 'Procedural Twin-Notice Rule',
    bgClass: 'bg-indigo-300',
    textClass: 'text-indigo-950 font-bold',
    ringClass: 'ring-2 ring-indigo-400 shadow-md',
    badgeClass: 'bg-indigo-400 text-indigo-950 border border-indigo-800',
    hex: '#818cf8',
    swatchBg: '#818cf8',
  },
  {
    id: 'silver',
    label: 'Pearl White Chalk',
    categoryHint: 'Clean High-Contrast Neutral',
    bgClass: 'bg-slate-200',
    textClass: 'text-slate-950 font-bold',
    ringClass: 'ring-2 ring-slate-400 shadow-md',
    badgeClass: 'bg-slate-300 text-slate-950 border border-slate-700',
    hex: '#e2e8f0',
    swatchBg: '#e2e8f0',
  },
];

export const DEFAULT_HIGHLIGHT_COLOR: HighlightColorKey = 'yellow';

export function getHighlightColorSpec(colorId?: string): HighlightColorSpec {
  return (
    HIGHLIGHT_COLORS.find((c) => c.id === colorId) ||
    HIGHLIGHT_COLORS[0]
  );
}

export interface NoteLineAnnotation {
  highlightedLines: number[];
  starredLines: number[];
  lineColors?: Record<number, HighlightColorKey>;
}

export type NoteLineAnnotationsMap = Record<string, NoteLineAnnotation>;

export interface PlannerScheduledModule {
  topicId: string;
  title: string;
  worldId: string;
  badge: string;
  addedAtIso: string;
}

export type WeeklyStudyPlannerSchedule = Record<PlannerDayKey, PlannerScheduledModule[]>;

export function loadNoteLineAnnotations(storage?: StorageLike): NoteLineAnnotationsMap {
  if (!storage) return {};
  try {
    const raw = storage.getItem(NOTE_LINE_ANNOTATIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as NoteLineAnnotationsMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveNoteLineAnnotations(
  map: NoteLineAnnotationsMap,
  storage?: StorageLike
): void {
  if (!storage) return;
  try {
    storage.setItem(NOTE_LINE_ANNOTATIONS_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function toggleNoteLineHighlight(
  map: NoteLineAnnotationsMap,
  noteId: string,
  lineIndex: number,
  color?: HighlightColorKey
): NoteLineAnnotationsMap {
  const existing = map[noteId] || { highlightedLines: [], starredLines: [] };
  const has = existing.highlightedLines.includes(lineIndex);
  const currentColor = existing.lineColors?.[lineIndex] || DEFAULT_HIGHLIGHT_COLOR;

  // If already highlighted with the exact same color and no new color specified (or same color passed), toggle off
  if (has && (!color || color === currentColor)) {
    const nextHighlighted = existing.highlightedLines.filter((i) => i !== lineIndex);
    const nextColors = { ...(existing.lineColors || {}) };
    delete nextColors[lineIndex];
    return {
      ...map,
      [noteId]: {
        highlightedLines: nextHighlighted,
        starredLines: existing.starredLines,
        lineColors: nextColors,
      },
    };
  }

  // If line was already highlighted with another color, update color in-place
  const chosenColor = color || currentColor || DEFAULT_HIGHLIGHT_COLOR;
  const nextHighlighted = has
    ? existing.highlightedLines
    : [...existing.highlightedLines, lineIndex].sort((a, b) => a - b);
  const nextColors = {
    ...(existing.lineColors || {}),
    [lineIndex]: chosenColor,
  };

  return {
    ...map,
    [noteId]: {
      highlightedLines: nextHighlighted,
      starredLines: existing.starredLines,
      lineColors: nextColors,
    },
  };
}

export function toggleNoteLineStar(
  map: NoteLineAnnotationsMap,
  noteId: string,
  lineIndex: number
): NoteLineAnnotationsMap {
  const existing = map[noteId] || { highlightedLines: [], starredLines: [] };
  const has = existing.starredLines.includes(lineIndex);
  const nextStarred = has
    ? existing.starredLines.filter((i) => i !== lineIndex)
    : [...existing.starredLines, lineIndex].sort((a, b) => a - b);
  return {
    ...map,
    [noteId]: {
      highlightedLines: existing.highlightedLines,
      starredLines: nextStarred,
    },
  };
}

export function createEmptyWeeklySchedule(): WeeklyStudyPlannerSchedule {
  return {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
    Sat: [],
    Sun: [],
  };
}

export function loadWeeklyStudyPlanner(storage?: StorageLike): WeeklyStudyPlannerSchedule {
  const base = createEmptyWeeklySchedule();
  if (!storage) return base;
  try {
    const raw = storage.getItem(WEEKLY_STUDY_PLANNER_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<WeeklyStudyPlannerSchedule>;
    for (const day of PLANNER_DAYS) {
      if (Array.isArray(parsed?.[day])) {
        base[day] = parsed[day] as PlannerScheduledModule[];
      }
    }
    return base;
  } catch {
    return base;
  }
}

export function saveWeeklyStudyPlanner(
  schedule: WeeklyStudyPlannerSchedule,
  storage?: StorageLike
): void {
  if (!storage) return;
  try {
    storage.setItem(WEEKLY_STUDY_PLANNER_KEY, JSON.stringify(schedule));
  } catch {
    // ignore
  }
}

export function assignModuleToPlannerDay(
  schedule: WeeklyStudyPlannerSchedule,
  day: PlannerDayKey,
  mod: Omit<PlannerScheduledModule, 'addedAtIso'>,
  fromDay?: PlannerDayKey
): WeeklyStudyPlannerSchedule {
  const next: WeeklyStudyPlannerSchedule = {
    Mon: [...schedule.Mon],
    Tue: [...schedule.Tue],
    Wed: [...schedule.Wed],
    Thu: [...schedule.Thu],
    Fri: [...schedule.Fri],
    Sat: [...schedule.Sat],
    Sun: [...schedule.Sun],
  };

  if (fromDay && PLANNER_DAYS.includes(fromDay)) {
    next[fromDay] = next[fromDay].filter((item) => item.topicId !== mod.topicId);
  }

  const alreadyOnDay = next[day].some((item) => item.topicId === mod.topicId);
  if (!alreadyOnDay) {
    next[day] = [
      ...next[day],
      {
        ...mod,
        addedAtIso: new Date().toISOString(),
      },
    ];
  }
  return next;
}

export function removeModuleFromPlannerDay(
  schedule: WeeklyStudyPlannerSchedule,
  day: PlannerDayKey,
  topicId: string
): WeeklyStudyPlannerSchedule {
  return {
    ...schedule,
    [day]: schedule[day].filter((item) => item.topicId !== topicId),
  };
}
