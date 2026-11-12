import { LawTopic } from '../types/laborLaw';

export type MarioSoundscapeId = 'overworld' | 'underground' | 'castle' | 'star_road';

export interface SoundscapeMeta {
  id: MarioSoundscapeId;
  name: string;
  shortName: string;
  subtitle: string;
  bpmLabel: string;
  accentClass: string;
}

export const MARIO_SOUNDSCAPES: SoundscapeMeta[] = [
  {
    id: 'overworld',
    name: 'Overworld Breeze',
    shortName: 'Overworld',
    subtitle: 'Upbeat Mushroom Kingdom study groove',
    bpmLabel: '124 BPM • Major',
    accentClass: 'bg-emerald-500 text-slate-950',
  },
  {
    id: 'underground',
    name: 'Underground Cavern',
    shortName: 'Underground',
    subtitle: 'Deep bassline focus loop for statutory reading',
    bpmLabel: '108 BPM • Bass',
    accentClass: 'bg-cyan-400 text-slate-950',
  },
  {
    id: 'castle',
    name: "Bowser's Castle",
    shortName: 'Castle',
    subtitle: 'Intense dramatic tension for Exam Prep & Boss runs',
    bpmLabel: '132 BPM • Minor',
    accentClass: 'bg-rose-500 text-white',
  },
  {
    id: 'star_road',
    name: 'Star Road Lullaby',
    shortName: 'Star Road',
    subtitle: 'Calm celestial arpeggios for long memorization blocks',
    bpmLabel: '92 BPM • Ambient',
    accentClass: 'bg-amber-400 text-slate-950',
  },
];

export const GROUP_MEMBERS: readonly string[] = [
  'CORPUZ, MATTHEW CESAR',
  'CRUZ, MARY LOUISE',
  'FANGED, TRACY FAE',
  'FERNANDEZ, JELYN',
  'GARCIA, AERON STEVEN',
  'GARVIDA, MHELBOURNE',
  'MAÑALAC, ABIGAIL',
  'UNTALAN, BEYONCE HELEIN',
  'VILA, HANNAH DANIELA',
] as const;

export const GROUP_MEMBER_FACEBOOK_URLS: Readonly<Record<string, string>> = Object.freeze({
  CORPUZ: 'https://www.facebook.com/anmnso',
  CRUZ: 'https://www.facebook.com/mary.louise.73997861',
  FANGED: 'https://www.facebook.com/tfl.fanged',
  FERNANDEZ: 'https://www.facebook.com/jelyn.fernandez.96',
  GARCIA: 'https://www.facebook.com/ronieeeegarcia',
  GARVIDA: 'https://www.facebook.com/mhelbourne.garvida.2024',
  MAÑALAC: 'https://www.facebook.com/abigail.manalac.3994',
  UNTALAN: 'https://www.facebook.com/beyonce.untalan',
  VILA: 'https://www.facebook.com/hannah.daniela.vila',
});

/**
 * Returns the verified Facebook profile link for a group member based on full name or surname.
 */
export function getMemberFacebookUrl(nameOrSurname: string): string | undefined {
  if (!nameOrSurname) return undefined;
  const upper = nameOrSurname.toUpperCase();
  for (const [key, url] of Object.entries(GROUP_MEMBER_FACEBOOK_URLS)) {
    if (upper.includes(key)) {
      return url;
    }
  }
  return undefined;
}

export interface GroupMemberDetail {
  name: string;
  role: string;
  specialization: string;
  marioRole: string;
  facebookUrl?: string;
}

export const GROUP_MEMBER_DETAILS: readonly GroupMemberDetail[] = [
  {
    name: 'CORPUZ, MATTHEW CESAR',
    role: 'Lead Creator, Full-Stack Developer & Chief Systems Architect (Executed All 9 Roles & Domains)',
    specialization: 'Full Labor Standards Architecture, Codification Engine, 17 Regions Multipliers Simulator, Bar Syllabus Integration & All System Engineering',
    marioRole: 'Mario (Lead Author & All-Roles Architect)',
  },
  {
    name: 'CRUZ, MARY LOUISE',
    role: 'Senior Legal Researcher',
    specialization: 'World 6 Statutory Leaves, Maternity & Paternity Law (R.A. 11210 / 8187)',
    marioRole: 'Princess Peach (Leaves & Protections)',
  },
  {
    name: 'FANGED, TRACY FAE',
    role: 'Statutory Auditor',
    specialization: 'Hours of Work, Compressed Workweek & Overtime Pay Premium Formulas',
    marioRole: 'Luigi (Hours & Operations)',
  },
  {
    name: 'FERNANDEZ, JELYN',
    role: 'Doctrine Researcher',
    specialization: 'Weekly Rest Periods, Regular vs Special Holidays & Double Holiday Pay',
    marioRole: 'Yoshi (Rest Days & Premium)',
  },
  {
    name: 'GARCIA, AERON STEVEN',
    role: 'Economic Wage Analyst',
    specialization: 'Regional Minimum Wage Board Orders (17 Regions) & Wage Distortion (R.A. 6727)',
    marioRole: 'Toad (Regional Wages Ledger)',
  },
  {
    name: 'GARVIDA, MHELBOURNE',
    role: 'Compliance & Regulatory Auditor',
    specialization: 'Contracting & Subcontracting Rules (DOLE D.O. 174-17) & Substantial Capital',
    marioRole: 'Bowser / Wario (Due Process & Capital Guard)',
  },
  {
    name: 'MAÑALAC, ABIGAIL',
    role: 'Special Classes Researcher',
    specialization: 'Kasambahay Law (R.A. 10361), Working Children (R.A. 9231) & PWDs (R.A. 7277)',
    marioRole: 'Rosalina (Protective Workplace Statutes)',
  },
  {
    name: 'UNTALAN, BEYONCE HELEIN',
    role: 'Due Process Scholar',
    specialization: 'Security of Tenure, Twin-Notice Procedural Due Process & Agabon/Jaka Doctrine',
    marioRole: 'Daisy (Tenure & Procedural Fairness)',
  },
  {
    name: 'VILA, HANNAH DANIELA',
    role: 'Statutory Standards Cross-Checker',
    specialization: 'Prescriptive Periods (Arts. 297-306) & DOLE Bureau of Working Conditions Rulings',
    marioRole: 'Donkey Kong (Prescription & Enforcement)',
    facebookUrl: 'https://www.facebook.com/hannah.daniela.vila',
  },
] as const;

// ==================== STUDY NOTES (PERSISTENT RIGHT DRAWER) ====================

export const STUDY_NOTES_STORAGE_KEY = 'mario_labor_study_notes_v1';

export type StudyNoteCategoryTag =
  | 'Bar Exam Review'
  | 'Quick Reference'
  | 'Complex Concept'
  | 'Statutory Text';

export const STUDY_NOTE_CATEGORY_TAGS: readonly StudyNoteCategoryTag[] = [
  'Bar Exam Review',
  'Quick Reference',
  'Complex Concept',
  'Statutory Text',
] as const;

export interface StudyNoteItem {
  id: string;
  title: string;
  content: string;
  worldTag: string; // e.g., 'all', 'world1'..'world5', 'holidays', 'wages_matrix'
  categoryTag?: StudyNoteCategoryTag;
  pinned: boolean;
  updatedAt: string;
  topicId?: string;
  createdAt?: string;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Universal Note Title Sanitizer:
 * Completely prevents and strips any combined scenario descriptions, prompt text,
 * and the word "Mnemonic" or "Mnemonic Rule" from a note title.
 * Guarantees a crisp, clean statutory or doctrine title matching the starter templates
 * (e.g. "Art. 82 & Auto Bus Transport Systems v. Bautista", "Brownout <= 20 Mins Rule").
 */
export function sanitizeNoteTitle(title?: string | null): string {
  if (!title) return 'Personal Study Note';
  let clean = title.trim();

  // 1. Iteratively strip leading descriptive category headers, game actions, character targets, and verdicts
  let prev = '';
  while (prev !== clean) {
    prev = clean;
    clean = clean
      .replace(
        /^(?:Controlling statutory doctrine|Controlling codal rule|Takeaway distinction|Problem Scenario|Legal Explanation|Ruling|Verdict|Result|Note|Key Rule|Statutory Rule|Summary):\s*/i,
        ''
      )
      .trim();

    // Strip bracketed/parenthesized verdicts e.g. "[LAWFUL]", "(UNLAWFUL)", "[VALID]", "[ILLEGAL]"
    clean = clean
      .replace(
        /^\[(?:LAWFUL|UNLAWFUL|VALID|ILLEGAL|PROHIBITED|COMPLIANT|NON-COMPLIANT)\]\s*/i,
        ''
      )
      .replace(
        /^\((?:LAWFUL|UNLAWFUL|VALID|ILLEGAL|PROHIBITED|COMPLIANT|NON-COMPLIANT)\)\s*/i,
        ''
      )
      .trim();

    // Strip combined game action + verdict prefixes e.g. "Shield: Lawful Statutory Right - ", "Smash: Illegal Shortcut - "
    clean = clean
      .replace(
        /^(?:Shield(?:ed)?(?:\s+as)?:\s*(?:Lawful\s+)?(?:Statutory\s+Right)?|Smash(?:ed)?(?:\s+as)?:\s*(?:Illegal\s+)?(?:Shortcut)?)[!.:\-—–•\s]*/i,
        ''
      )
      .trim();

    // Strip game action + character targets (e.g. "Smash Goomba!", "Spare Toad!", "Shield Mario", "LAWFUL • SPARE!", "Bust Boo!")
    clean = clean
      .replace(
        /^(?:Smash(?:\s+Goomba|\s+Bowser|\s+Koopa)?|Spare(?:\s+Toad|\s+Mario)?|Shield(?:\s+Mario|\s+Toad)?|Bust(?:\s+Goomba|\s+Boo)?|Certif(?:y|ied)(?:\s+Valid(?:\s+Contractor)?)?)[!.:\-—–•\s]+/i,
        ''
      )
      .trim();

    // Strip combined "LAWFUL • SPARE!", "SMASH GOOMBA!"
    clean = clean
      .replace(/^(?:LAWFUL\s*[•\-—–]\s*SPARE!?|SMASH\s+GOOMBA!?)[!.:\-—–•\s]*/i, '')
      .trim();

    // Strip lone character markers left over (e.g. "Goomba - ", "Toad - ")
    clean = clean
      .replace(/^(?:Goomba|Toad|Koopa|Bowser|Boo)[!.:\-—–•\s]+/i, '')
      .trim();

    // Strip leading words like "Strictly", "Totally", "Merely" before verdicts
    clean = clean.replace(/^(?:Strictly|Totally|Wholly|Clearly|Purely)\s+/i, '').trim();

    // Strip game verdicts like "LAWFUL!", "UNLAWFUL.", "VALID:", "ILLEGAL -", "LAWFUL STATUTORY RIGHT", etc.
    clean = clean
      .replace(
        /^(?:LAWFUL|UNLAWFUL|VALID|ILLEGAL|COMPLIANT|NON-COMPLIANT|PROHIBITED|NOTICE|WARNING)(?:\s+(?:STATUTORY\s+RIGHT|STATUTORY\s+MANDATE|STATUTORY\s+DEDUCTION|ILLEGAL\s+SHORTCUT|STATUTORY|DEDUCTION|RIGHT|PAYROLL|PRACTICE|RULE|VERDICT|SHORTCUT))?[!.:\-—–•\s]*\s*/i,
        ''
      )
      .trim();

    // Strip any inner shouting verdict words with punctuation
    clean = clean
      .replace(
        /\b(?:LAWFUL|UNLAWFUL|VALID|ILLEGAL|COMPLIANT|PROHIBITED)[!.:\-—–•]+\s*/gi,
        ''
      )
      .trim();
  }

  // Strip game action suffixes like "(Shield!)", "(Smash!)", "(Spare Toad!)", "(Smash Goomba!)"
  clean = clean
    .replace(
      /\s*\((?:Shield!?|Smash!?|Spare Toad!?|Smash Goomba!?|Spare!?)\)/gi,
      ''
    )
    .trim();

  // If title was formatted with em-dash, en-dash, double-hyphen, or hyphen separating title from scenario
  if (/\s+(?:[—–]|--)\s+/.test(clean)) {
    const parts = clean.split(/\s+(?:[—–]|--)\s+/);
    clean = parts[0].trim();
  } else if (/\s+-\s+(?:(?:When|If|Where|A|An|The|Worker|Employee|Employer|Under|In)\s+[a-zA-Z0-9]|Problem\s+Scenario|Factual\s+Scenario)/i.test(clean)) {
    const parts = clean.split(/\s+-\s+/);
    if (parts.length > 1 && parts[0].length >= 3) {
      clean = parts[0].trim();
    }
  }

  // Strip any lingering scenario labels or trailing descriptions
  clean = clean.replace(/\s*[-:]\s*(?:Problem Scenario|Factual Scenario|Scenario).*$/i, '').trim();

  // Strip "Mnemonic", "Mnemonic Rule", "Menemonic", and typos completely from the title
  clean = clean.replace(/\bM[en]{2,}monic(?:\s+Rule)?\b/gi, '').trim();

  // Strip trailing or leading punctuation, colons, or dashes
  clean = clean.replace(/[\s—–:-]+$/, '').trim();
  clean = clean.replace(/^[\s—–:-]+/, '').trim();

  // Normalize multiple spaces left by removal
  clean = clean.replace(/\s{2,}/g, ' ').trim();

  return clean || 'Personal Study Note';
}

export const sanitizeMnemonicNoteTitle = sanitizeNoteTitle;

/**
 * Robustly sanitizes and cleans study note content:
 * - Eliminates duplicate or stray chained colons (e.g. ':::', '::', ': : :')
 * - Strips leading or trailing colons on lines
 * - Heals legacy yelling action labels (e.g. 'Shield: Lawful Statutory Right')
 * - Cleans stacked redundant prefixes (e.g. 'Controlling statutory doctrine: Rule: :')
 */
export function cleanNoteContent(rawContent: string): string {
  if (!rawContent || typeof rawContent !== 'string') return '';

  const lines = rawContent.split('\n');
  const cleanedLines: string[] = [];

  for (const rawLine of lines) {
    let line = rawLine.trim();

    // Skip empty lines or lines consisting solely of colons, whitespace, dashes, or dots
    if (!line || /^[:\s—–\-.]+$/.test(line)) {
      continue;
    }

    // Collapse multi-colon sequences (e.g. ':::', '::', ': : :') into a single clean colon
    line = line.replace(/[:\s]*:[:\s]*:[:\s]*/g, ': ');
    line = line.replace(/::+/g, ': ');
    // Strip leading colons or hyphens from line start
    line = line.replace(/^[:\s—–\-]+/, '').trim();

    // Clean and normalize awkward "no; yes;" sequences into Supreme Court format
    line = line.replace(/(?:^|[;\s])no\s*;\s*yes;?/gi, ' General Rule: No. Exception: Yes.');
    line = line.replace(/(?:^|[;\s])yes\s*;\s*no;?/gi, ' General Rule: Yes. Exception: No.');

    // Normalize "No; under..." or "Yes; under..." into Supreme Court standard "No. Under..." or "Yes. Under..."
    line = line.replace(/(?:^|\n|:\s*)(No|Yes)\s*;\s*(?=[a-z])/gi, (_m, p1) => `${p1.toUpperCase()}. `);
    line = line.replace(/(?:^|\n|:\s*)(Void|Valid|Illegal|Lawful)\s*;\s*(?=[a-z])/gi, (_m, p1) => `${p1.toUpperCase()}. `);

    // Clean chained redundant prefixes (loop until settled)
    let prevLine = '';
    while (prevLine !== line) {
      prevLine = line;
      line = line.replace(
        /^(Controlling statutory doctrine|Controlling Rule|Doctrinal Rule):\s*(?:Controlling statutory doctrine|Rule|Doctrine|Controlling|Statutory Rule):\s*/i,
        'Controlling statutory doctrine: '
      );
      line = line.replace(
        /^(Takeaway distinction|Takeaway|Key Distinction):\s*(?:Takeaway distinction|Key distinction|Key rule|Key Takeaway|Rule|Distinction):\s*/i,
        'Takeaway distinction: '
      );
      line = line.replace(
        /^(Problem Scenario|Scenario):\s*(?:Problem Scenario|Fact Pattern|Scenario|Problem):\s*/i,
        'Problem Scenario: '
      );
    }

    // Clean legacy game verdicts inside controlling doctrines
    line = line.replace(
      /Controlling statutory doctrine:\s*Shield:\s*Lawful Statutory Right[!.:\-—–•\s]*/gi,
      'Controlling statutory doctrine: Valid statutory right under the Labor Code. '
    );
    line = line.replace(
      /Controlling statutory doctrine:\s*Smash:\s*Illegal Shortcut[!.:\-—–•\s]*/gi,
      'Controlling statutory doctrine: Prohibited wage deduction practice under the Labor Code. '
    );
    line = line.replace(
      /Controlling statutory doctrine:\s*(?:Strictly\s+)?(?:UNLAWFUL|LAWFUL|VALID|ILLEGAL)[!.:\-—–•\s]*\s*/gi,
      'Controlling statutory doctrine: '
    );

    // Clean legacy game action prefixes in Takeaway lines
    line = line.replace(
      /Key rule:\s*Shield:\s*Lawful Statutory Right[!.:\-—–•\s]*/gi,
      'Key rule: Valid statutory right under Philippine labor standards. '
    );
    line = line.replace(
      /Key rule:\s*Smash:\s*Illegal Shortcut[!.:\-—–•\s]*/gi,
      'Key rule: Prohibited deduction/practice under Philippine labor standards. '
    );

    // Self-heal legacy game notes with false missed choice
    line = line.replace(
      /Takeaway distinction:\s*Your Answer \(Missed\):\s*Correct Ruling\.\s*(?:Always apply the controlling codal rule above in practical statutory problems\.)?/gi,
      'Takeaway distinction: Mastered in Arcade Gameplay. Verified against controlling statutory doctrine.'
    );
    line = line.replace(/Your Answer \(Missed\):\s*Correct Ruling/gi, 'Mastered in Arcade Gameplay');

    // If line ended with a colon because value was stripped, skip if empty
    if (/^[A-Za-z0-9\s—–/()-]+:$/.test(line)) {
      continue;
    }

    // Strip any trailing raw colon
    line = line.replace(/:\s*$/, '').trim();

    if (line) {
      cleanedLines.push(line);
    }
  }

  return cleanedLines.join('\n');
}

export type StructuredNoteKind =
  | 'controlling'
  | 'takeaway'
  | 'scenario'
  | 'statutory'
  | 'case-law'
  | 'battle'
  | 'ref'
  | 'labeled'
  | 'general';

export interface StructuredNoteBlock {
  id: string;
  kind: StructuredNoteKind;
  label: string;
  value: string;
  rawLine: string;
  categoricalStance?: 'YES' | 'NO' | 'VALID' | 'VOID' | 'LAWFUL' | 'ILLEGAL' | 'GENERAL_RULE';
  examinedDistinction?: {
    priorChoice: string;
    isYesNo: boolean;
    stance?: 'YES' | 'NO' | 'VALID' | 'VOID';
  };
}

/**
 * Helper to detect categorical stance (Yes, No, Valid, Void, Lawful, Illegal) in any text
 */
export function detectBlockCategoricalStance(text: string): StructuredNoteBlock['categoricalStance'] {
  if (!text) return undefined;
  if (/\bgeneral\s+rule\b/i.test(text) && /\bexception\b/i.test(text)) {
    return 'GENERAL_RULE';
  }
  const match = text.match(
    /^(?:Categorical Stance|Categorical Resolution|Answer|Stance)?[:\s—–-]*(YES|NO|VALID|VOID|LAWFUL|ILLEGAL|UNLAWFUL|PROHIBITED)\b/i
  );
  if (match) {
    const word = match[1].toUpperCase();
    if (word === 'UNLAWFUL' || word === 'PROHIBITED') return 'ILLEGAL';
    return word as StructuredNoteBlock['categoricalStance'];
  }
  if (/\b(?:YES|LAWFUL|VALID)\b/i.test(text) && !/\b(?:NO|ILLEGAL|VOID)\b/i.test(text)) {
    return 'YES';
  }
  if (/\b(?:NO|ILLEGAL|VOID|PROHIBITED)\b/i.test(text) && !/\b(?:YES|LAWFUL|VALID)\b/i.test(text)) {
    return 'NO';
  }
  return undefined;
}

/**
 * Parses any note content into organized, colored blocks with zero stray colons.
 * Handles both standard codal format and any arcade game, user note, or custom field.
 */
export function parseStructuredNoteLines(content: string): StructuredNoteBlock[] {
  const cleaned = cleanNoteContent(content);
  if (!cleaned) return [];

  const rawLines = cleaned.split('\n');
  const blocks: StructuredNoteBlock[] = [];

  rawLines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) return;

    // 1. Controlling Statutory Doctrine
    if (/^(?:Controlling statutory doctrine|Controlling Rule|Controlling Doctrine|Doctrinal Rule|Key Doctrine):\s*/i.test(line)) {
      const val = line.replace(/^(?:Controlling statutory doctrine|Controlling Rule|Controlling Doctrine|Doctrinal Rule|Key Doctrine):\s*[:\s—–-]*/i, '').trim();
      if (val) {
        blocks.push({
          id: `block-${idx}-controlling`,
          kind: 'controlling',
          label: 'Controlling Statutory Doctrine',
          value: val,
          rawLine: line,
          categoricalStance: detectBlockCategoricalStance(val),
        });
        return;
      }
    }

    // 2. Takeaway Distinction & Exam Takeaway
    if (/^(?:Takeaway distinction|Takeaway|Key Distinction|Key Takeaway|Exam Takeaway|Distinction|Bar Tip):\s*/i.test(line)) {
      const rawVal = line.replace(/^(?:Takeaway distinction|Takeaway|Key Distinction|Key Takeaway|Exam Takeaway|Distinction|Bar Tip):\s*[:\s—–-]*/i, '').trim();
      if (rawVal) {
        // Detect and extract any tested/prior choice to eliminate ugly formatting
        let displayVal = rawVal;
        let examinedDistinction: StructuredNoteBlock['examinedDistinction'] = undefined;

        const missedMatch = rawVal.match(/Your Answer \(Missed\):\s*(.+?)(?:\.\s*Always apply|\.|$)/i);
        if (missedMatch) {
          const priorChoice = missedMatch[1].trim();
          const isYesNo = /^(?:yes|no|valid|void|lawful|illegal|unlawful)$/i.test(priorChoice);
          const stance = isYesNo ? (/^(?:yes|valid|lawful)$/i.test(priorChoice) ? 'YES' : 'NO') : undefined;
          examinedDistinction = { priorChoice, isYesNo, stance };
          // Transform ugly "Your Answer (Missed): X" into polished legal distinction
          displayVal = rawVal
            .replace(/Your Answer \(Missed\):\s*(.+?)(?:\.\s*Always apply.*)?$/i, (_m, p) => {
              const ch = p.trim();
              if (isYesNo) {
                return `Statutory Resolution & Stance: Contrast with prior choice "${ch.toUpperCase()}". The controlling codal standard above governs in Bar review.`;
              }
              return `Statutory Resolution & Analysis: Contrast against "${ch}". Always apply the controlling codal rule above in practical problems.`;
            })
            .trim();
        }

        blocks.push({
          id: `block-${idx}-takeaway`,
          kind: 'takeaway',
          label: 'Key Distinction & Exam Takeaway',
          value: displayVal,
          rawLine: line,
          categoricalStance: detectBlockCategoricalStance(rawVal),
          examinedDistinction,
        });
        return;
      }
    }

    // 3. Problem Scenario
    if (/^(?:Problem Scenario|Scenario|Factual Scenario|Bar Problem|Fact Pattern):\s*/i.test(line)) {
      const val = line.replace(/^(?:Problem Scenario|Scenario|Factual Scenario|Bar Problem|Fact Pattern):\s*[:\s—–-]*/i, '').trim();
      if (val) {
        blocks.push({
          id: `block-${idx}-scenario`,
          kind: 'scenario',
          label: 'Problem Scenario',
          value: val,
          rawLine: line,
          categoricalStance: detectBlockCategoricalStance(val),
        });
        return;
      }
    }

    // 4. Controlling Statutory Text / Codal
    if (/^(?:Controlling Statutory Text|Statutory Text|Verbatim Statutory Codal Text|Codal Text|Statutory Provision):\s*/i.test(line)) {
      const val = line.replace(/^(?:Controlling Statutory Text|Statutory Text|Verbatim Statutory Codal Text|Codal Text|Statutory Provision):\s*[:\s—–-]*/i, '').trim();
      if (val) {
        blocks.push({
          id: `block-${idx}-statutory`,
          kind: 'statutory',
          label: 'Controlling Statutory Text',
          value: val,
          rawLine: line,
        });
        return;
      }
    }

    // 5. Supreme Court Precedents & Case Law
    if (/^(?:Supreme Court Precedents|Supreme Court Landmark Case Law|Precedents|Landmark Case|Case Law|Case|Holding|G\.R\. No):\s*/i.test(line)) {
      const val = line.replace(/^(?:Supreme Court Precedents|Supreme Court Landmark Case Law|Precedents|Landmark Case|Case Law|Case|Holding|G\.R\. No):\s*[:\s—–-]*/i, '').trim();
      if (val) {
        blocks.push({
          id: `block-${idx}-case-law`,
          kind: 'case-law',
          label: 'Supreme Court Precedents',
          value: val,
          rawLine: line,
        });
        return;
      }
    }

    // 6. Battle Action / Gameplay Record
    if (/^(?:Battle Action Taken|Battle Action|Action Taken|Arcade Action|Missed Choice|Your Answer):\s*/i.test(line)) {
      const val = line.replace(/^(?:Battle Action Taken|Battle Action|Action Taken|Arcade Action|Missed Choice|Your Answer):\s*[:\s—–-]*/i, '').trim();
      if (val) {
        blocks.push({
          id: `block-${idx}-battle`,
          kind: 'battle',
          label: 'Battle Action Taken',
          value: val,
          rawLine: line,
        });
        return;
      }
    }

    // 7. Statutory Citation & Fingerprint Reference
    if (
      line.includes('Ref: qerr_') ||
      line.includes('Ref: statute_') ||
      line.includes('Ref: codal_') ||
      line.includes('· Ref:') ||
      line.startsWith('Ref:') ||
      line.startsWith('Citation:')
    ) {
      blocks.push({
        id: `block-${idx}-ref`,
        kind: 'ref',
        label: 'Statutory Reference',
        value: line.replace(/^Ref:\s*/i, '').trim(),
        rawLine: line,
      });
      return;
    }

    // 8. Any generic 'Label: Value' pattern (e.g. Formula: ..., Coverage: ..., Exceptions: ...)
    const colonMatch = line.match(/^([A-Za-z0-9\s—–/()]{2,30}):\s*(.+)$/);
    if (colonMatch) {
      const labelText = colonMatch[1].trim();
      const valText = colonMatch[2].replace(/^[:\s—–-]+/, '').trim();
      if (valText) {
        blocks.push({
          id: `block-${idx}-labeled`,
          kind: 'labeled',
          label: labelText,
          value: valText,
          rawLine: line,
        });
        return;
      }
    }

    // 9. General un-colonized substantive note text
    blocks.push({
      id: `block-${idx}-general`,
      kind: 'general',
      label: 'Core Doctrine Note',
      value: line,
      rawLine: line,
    });
  });

  return blocks;
}

export function loadStudyNotes(storage?: StorageLike | null): StudyNoteItem[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(STUDY_NOTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    let hasChanges = false;
    const sanitized: StudyNoteItem[] = parsed
      .filter(
        (item): item is StudyNoteItem =>
          Boolean(item) &&
          typeof item.id === 'string' &&
          typeof item.content === 'string'
      )
      .map((item) => {
        const cleanTitle = sanitizeMnemonicNoteTitle(item.title);
        let cleanContent = cleanNoteContent(item.content);

        // If the title had an attached scenario description that was missing from content, rescue it into content!
        if (item.title && /\s+(?:[—–]|--)\s+/.test(item.title)) {
          const parts = item.title.split(/\s+(?:[—–]|--)\s+/);
          const separatedDesc = (parts[1] || '')
            .replace(/^(?:Problem Scenario|Factual Scenario|Scenario):\s*/i, '')
            .trim();
          if (separatedDesc && !cleanContent.includes(separatedDesc)) {
            cleanContent = cleanContent.trim()
              ? `${cleanContent}\nProblem Scenario: ${separatedDesc}`
              : `Problem Scenario: ${separatedDesc}`;
          }
        }

        if (cleanTitle !== item.title || cleanContent !== item.content) {
          hasChanges = true;
          return {
            ...item,
            title: cleanTitle,
            content: cleanContent,
          };
        }
        return item;
      });

    // Automatically heal and persist cleaned notes back to storage
    if (hasChanges) {
      try {
        storage.setItem(STUDY_NOTES_STORAGE_KEY, JSON.stringify(sanitized));
      } catch {
        // ignore quota
      }
    }

    return sanitized;
  } catch {
    return [];
  }
}

export function saveStudyNotes(
  notes: StudyNoteItem[],
  storage?: StorageLike | null
): void {
  if (!storage) return;
  try {
    const sanitized = notes.map((n) => ({
      ...n,
      title: sanitizeMnemonicNoteTitle(n.title),
      content: cleanNoteContent(n.content),
    }));
    storage.setItem(STUDY_NOTES_STORAGE_KEY, JSON.stringify(sanitized));
  } catch {
    // ignore storage quota errors
  }
}

export function createStudyNote(
  notes: StudyNoteItem[],
  input: {
    title?: string;
    content: string;
    worldTag?: string;
    categoryTag?: StudyNoteCategoryTag;
  },
  nowIso: string = new Date().toISOString()
): StudyNoteItem[] {
  const trimmedContent = cleanNoteContent(input.content);
  if (!trimmedContent) return notes;
  const rawTitle = (input.title || '').trim() || deriveNoteTitle(trimmedContent);
  const trimmedTitle = sanitizeMnemonicNoteTitle(rawTitle);
  const newItem: StudyNoteItem = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: trimmedTitle,
    content: trimmedContent,
    worldTag: input.worldTag || 'all',
    categoryTag: input.categoryTag || 'Quick Reference',
    pinned: false,
    updatedAt: nowIso,
  };
  return sortStudyNotes([newItem, ...notes]);
}

export function updateStudyNote(
  notes: StudyNoteItem[],
  id: string,
  patch: Partial<
    Pick<StudyNoteItem, 'title' | 'content' | 'worldTag' | 'categoryTag' | 'pinned'>
  >,
  nowIso: string = new Date().toISOString()
): StudyNoteItem[] {
  const updated = notes.map((n) => {
    if (n.id !== id) return n;
    const nextContent =
      patch.content !== undefined ? cleanNoteContent(patch.content) : n.content;
    if (!nextContent) return n;
    const nextTitle =
      patch.title !== undefined
        ? sanitizeMnemonicNoteTitle(patch.title.trim() || deriveNoteTitle(nextContent))
        : sanitizeMnemonicNoteTitle(n.title);
    return {
      ...n,
      ...patch,
      title: nextTitle,
      content: nextContent,
      updatedAt: nowIso,
    };
  });
  return sortStudyNotes(updated);
}

export function deleteStudyNote(
  notes: StudyNoteItem[],
  id: string
): StudyNoteItem[] {
  return notes.filter((n) => n.id !== id);
}

export function filterStudyNotes(
  notes: StudyNoteItem[],
  worldFilter: string,
  query: string,
  categoryFilter: string = 'all'
): StudyNoteItem[] {
  const q = query.trim().toLowerCase();
  return sortStudyNotes(
    notes.filter((n) => {
      const worldMatches =
        worldFilter === 'all' || n.worldTag === worldFilter;
      if (!worldMatches) return false;
      const effectiveCategory = n.categoryTag || 'Quick Reference';
      const categoryMatches =
        categoryFilter === 'all' || effectiveCategory === categoryFilter;
      if (!categoryMatches) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.worldTag.toLowerCase().includes(q) ||
        effectiveCategory.toLowerCase().includes(q)
      );
    })
  );
}

function deriveNoteTitle(content: string): string {
  const firstLine = content.split('\n')[0].trim();
  const raw =
    firstLine.length <= 100
      ? firstLine
      : firstLine.lastIndexOf(' ', 95) > 30
      ? `${firstLine.slice(0, firstLine.lastIndexOf(' ', 95)).trim()}...`
      : firstLine.slice(0, 100);
  return sanitizeNoteTitle(raw);
}

function sortStudyNotes(notes: StudyNoteItem[]): StudyNoteItem[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

// ==================== WORLD PROGRESS & LEVEL-UP CELEBRATION ====================

export const CLAIMED_WORLD_LEVELUPS_KEY = 'mario_claimed_world_levelups_v1';
export const WORLD_LEVELUP_BONUS_COINS = 50;

export interface TopicUnlockStatus {
  id: string;
  title: string;
  badge: string;
  summary?: string;
  isCompleted: boolean;
  isUnlocked: boolean;
  stageOrder: number;
}

export interface WorldProgressSnapshot {
  worldId: string;
  completedCount: number;
  totalCount: number;
  percent: number;
  isWorldCleared: boolean;
  isWorldUnlocked: boolean;
  topics: TopicUnlockStatus[];
}

export const ORDERED_STUDY_WORLDS = [
  'world1',
  'world2',
  'world3',
  'world4',
  'world5',
  'world6',
] as const;

export const MAIN_CREATOR_AUTHOR = {
  shortBadge: 'Created by Matthew',
  fullCredit: 'Created by Matthew (Matthew Cesar Corpuz) — Main Creator of this Memory Aid',
  memberListing: 'CORPUZ, MATTHEW CESAR',
} as const;

export function computeWorldProgressMap(
  allTopics: Pick<LawTopic, 'id' | 'worldId' | 'title' | 'badge'>[],
  completedTopicIds: string[]
): Record<string, WorldProgressSnapshot> {
  const completedSet = new Set(completedTopicIds);
  const result: Record<string, WorldProgressSnapshot> = {};

  ORDERED_STUDY_WORLDS.forEach((worldId, worldIndex) => {
    const worldTopics = allTopics.filter((t) => t.worldId === worldId);
    const totalCount = worldTopics.length;
    const completedCount = worldTopics.filter((t) => completedSet.has(t.id)).length;
    const percent =
      totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;
    const isWorldCleared = totalCount > 0 && completedCount === totalCount;

    const prevWorldId = worldIndex > 0 ? ORDERED_STUDY_WORLDS[worldIndex - 1] : null;
    const prevProgress = prevWorldId ? result[prevWorldId] : null;
    const isWorldUnlocked =
      worldIndex === 0 ||
      completedCount > 0 ||
      Boolean(prevProgress && prevProgress.completedCount > 0);

    const topics: TopicUnlockStatus[] = worldTopics.map((topic, idx) => {
      const isCompleted = completedSet.has(topic.id);
      const prevTopicCompleted = idx === 0 ? true : completedSet.has(worldTopics[idx - 1].id);
      const isUnlocked = isCompleted || (idx === 0 && isWorldUnlocked) || prevTopicCompleted;
      const topicSummary = (topic as any).summary || '';
      return {
        id: topic.id,
        title: topic.title,
        badge: topic.badge,
        summary: topicSummary,
        isCompleted,
        isUnlocked,
        stageOrder: idx + 1,
      };
    });

    result[worldId] = {
      worldId,
      completedCount,
      totalCount,
      percent,
      isWorldCleared,
      isWorldUnlocked,
      topics,
    };
  });

  return result;
}

export interface WorldLevelUpCheckResult {
  triggered: boolean;
  worldId: string | null;
  bonusCoins: number;
  updatedClaimedWorlds: string[];
}

export function evaluateWorldLevelUp(params: {
  toggledTopicId: string;
  previousCompletedIds: string[];
  nextCompletedIds: string[];
  allTopics: Pick<LawTopic, 'id' | 'worldId'>[];
  claimedWorldIds: string[];
}): WorldLevelUpCheckResult {
  const {
    toggledTopicId,
    previousCompletedIds,
    nextCompletedIds,
    allTopics,
    claimedWorldIds,
  } = params;

  const topic = allTopics.find((t) => t.id === toggledTopicId);
  if (!topic) {
    return {
      triggered: false,
      worldId: null,
      bonusCoins: 0,
      updatedClaimedWorlds: claimedWorldIds,
    };
  }

  const worldTopics = allTopics.filter((t) => t.worldId === topic.worldId);
  if (worldTopics.length === 0) {
    return {
      triggered: false,
      worldId: null,
      bonusCoins: 0,
      updatedClaimedWorlds: claimedWorldIds,
    };
  }

  const prevSet = new Set(previousCompletedIds);
  const nextSet = new Set(nextCompletedIds);

  const wasClearedBefore = worldTopics.every((t) => prevSet.has(t.id));
  const isClearedNow = worldTopics.every((t) => nextSet.has(t.id));

  if (!wasClearedBefore && isClearedNow) {
    const alreadyClaimed = claimedWorldIds.includes(topic.worldId);
    const bonusCoins = alreadyClaimed ? 15 : WORLD_LEVELUP_BONUS_COINS;
    const updatedClaimedWorlds = alreadyClaimed
      ? claimedWorldIds
      : [...claimedWorldIds, topic.worldId];

    return {
      triggered: true,
      worldId: topic.worldId,
      bonusCoins,
      updatedClaimedWorlds,
    };
  }

  return {
    triggered: false,
    worldId: null,
    bonusCoins: 0,
    updatedClaimedWorlds: claimedWorldIds,
  };
}

// ==================== SUPER STAR POWER-UP (2X COINS FOR 10 MINUTES) ====================

export const SUPER_STAR_EXPIRY_STORAGE_KEY = 'mario_super_star_expiry_ms_v1';
export const SUPER_STAR_DEFAULT_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export function activateSuperStarBuff(
  currentExpiryMs: number,
  nowMs: number = Date.now(),
  durationMs: number = SUPER_STAR_DEFAULT_DURATION_MS
): number {
  const base = Math.max(nowMs, Number.isFinite(currentExpiryMs) ? currentExpiryMs : 0);
  return base + Math.max(1000, durationMs);
}

export function getSuperStarBuffStatus(
  expiryMs: number,
  nowMs: number = Date.now()
): {
  isActive: boolean;
  remainingSeconds: number;
  formattedRemaining: string;
} {
  if (!Number.isFinite(expiryMs) || expiryMs <= nowMs) {
    return { isActive: false, remainingSeconds: 0, formattedRemaining: '00:00' };
  }
  const remainingSeconds = Math.ceil((expiryMs - nowMs) / 1000);
  return {
    isActive: true,
    remainingSeconds,
    formattedRemaining: formatPomodoroSeconds(remainingSeconds),
  };
}

export function computeEffectiveCoinReward(
  baseCoins: number,
  options: { isSuperStarActive: boolean; hasMushroomCoinCharm?: boolean }
): number {
  const safeBase = Math.max(0, Math.round(baseCoins));
  if (safeBase === 0) return 0;
  const starMultiplier = options.isSuperStarActive ? 2 : 1;
  const charmBonus = options.hasMushroomCoinCharm ? 1 : 0;
  return safeBase * starMultiplier + charmBonus * starMultiplier;
}

// ==================== SHORTCUT MAPS (HIGH-YIELD BAR TOPIC HIGHLIGHTS) ====================

export const SHORTCUT_MAP_ACTIVE_STORAGE_KEY = 'mario_shortcut_map_active_v1';

export interface ShortcutTopicIntel {
  topicId: string;
  worldId: string;
  priorityLabel: string;
  barShortcutNote: string;
}

export const SHORTCUT_MAP_HIGHLIGHTS: Record<string, ShortcutTopicIntel> = {
  'm1-coverage': {
    topicId: 'm1-coverage',
    worldId: 'world1',
    priorityLabel: 'WARP SHORTCUT • ART. 82',
    barShortcutNote: 'Focus on Field Personnel ("actual hours cannot be determined with reasonable certainty") vs Supervised Piece-Rate Workers!',
  },
  'm1-hours-worked': {
    topicId: 'm1-hours-worked',
    worldId: 'world1',
    priorityLabel: 'WARP SHORTCUT • ART. 84',
    barShortcutNote: '20-Minute Brownout Rule + Rest breaks of 5–20 mins = Compensable! Waiting time when engaged to wait = Compensable!',
  },
  'm1-fwa-cww-meals-ot': {
    topicId: 'm1-fwa-cww-meals-ot',
    worldId: 'world1',
    priorityLabel: 'WARP SHORTCUT • ART. 87–88',
    barShortcutNote: 'Undertime on Monday can NEVER be offset by Overtime on Tuesday (Art. 88)! Ordinary OT = +25%; Rest/Holiday OT = +30%.',
  },
  'm2-holiday-pay': {
    topicId: 'm2-holiday-pay',
    worldId: 'world2',
    priorityLabel: 'WARP SHORTCUT • ART. 94',
    barShortcutNote: 'Master the Successive Regular Holidays rule (Maundy Thursday & Good Friday) and Double Regular Holiday + Rest Day = 390%!',
  },
  'm2-13th-month': {
    topicId: 'm2-13th-month',
    worldId: 'world2',
    priorityLabel: 'WARP SHORTCUT • R.A. 11360 & P.D. 851',
    barShortcutNote: '100% of service charges go to rank-and-file/non-managerial workers; 13th Month Pay = Total Basic Salary Earned / 12 on or before Dec 24!',
  },
  'm3-wage-principles': {
    topicId: 'm3-wage-principles',
    worldId: 'world3',
    priorityLabel: 'WARP SHORTCUT • FACILITIES VS SUPPLEMENTS',
    barShortcutNote: 'Purpose Test (Mabeza): Benefit of employee + voluntary written acceptance + fair value = Deductible Facility; Employer benefit = Non-deductible Supplement!',
  },
  'm3-payment-contracting-distortion': {
    topicId: 'm3-payment-contracting-distortion',
    worldId: 'world3',
    priorityLabel: 'WARP SHORTCUT • D.O. 174-17',
    barShortcutNote: '₱5,000,000 paid-up capital/net worth + control over means & methods = Legitimate Job Contracting; Labor-Only = Principal becomes direct employer!',
  },
  'm4-minors-kasambahay-homework': {
    topicId: 'm4-minors-kasambahay-homework',
    worldId: 'world4',
    priorityLabel: 'WARP SHORTCUT • R.A. 10361 KASAMBAHAY',
    barShortcutNote: 'Kasambahay SIL (5 days after 1 yr) is NON-cumulative & NON-convertible to cash! Wage < ₱5,000 = Employer pays 100% SSS/PhilHealth/Pag-IBIG.',
  },
  'm5-harassment-safe-spaces': {
    topicId: 'm5-harassment-safe-spaces',
    worldId: 'world5',
    priorityLabel: 'WARP SHORTCUT • R.A. 11313 SAFE SPACES',
    barShortcutNote: 'Safe Spaces Act penalizes peer-to-peer and subordinate-to-superior workplace harassment (no moral ascendancy needed)!',
  },
  'm6-service-incentive-leave': {
    topicId: 'm6-service-incentive-leave',
    worldId: 'world6',
    priorityLabel: 'WARP SHORTCUT • ART. 95 SIL',
    barShortcutNote: '5 days paid SIL after 1 year; commutable to cash; Auto Bus: 3-year prescription runs from demand/refusal or separation!',
  },
  'm6-maternity-leave': {
    topicId: 'm6-maternity-leave',
    worldId: 'world6',
    priorityLabel: 'WARP SHORTCUT • R.A. 11210',
    barShortcutNote: '105 days live birth (+15 solo parent = 120d) | 60 days miscarriage | Up to 7 days transferable to father (married or unmarried)!',
  },
  'm6-paternity-leave': {
    topicId: 'm6-paternity-leave',
    worldId: 'world6',
    priorityLabel: 'WARP SHORTCUT • R.A. 8187',
    barShortcutNote: '7 calendar days full pay for married male employee cohabiting with legitimate spouse for the first 4 deliveries/miscarriages!',
  },
  'm6-solo-parents-leave': {
    topicId: 'm6-solo-parents-leave',
    worldId: 'world6',
    priorityLabel: 'WARP SHORTCUT • R.A. 11861',
    barShortcutNote: '7 working days forfeitable parental leave after just 6 months service; dependent child age cap raised to <= 22 years old!',
  },
  'm6-gynecological-leave': {
    topicId: 'm6-gynecological-leave',
    worldId: 'world6',
    priorityLabel: 'WARP SHORTCUT • R.A. 9710',
    barShortcutNote: 'Up to 2 months special leave with full pay after gynecological surgery with 6 months aggregate employment in last 12 months!',
  },
  'm6-vawc-leave': {
    topicId: 'm6-vawc-leave',
    worldId: 'world6',
    priorityLabel: 'WARP SHORTCUT • R.A. 9262',
    barShortcutNote: 'Up to 10 paid days leave for women/children VAWC victims upon presenting a Barangay/Court Protection Order certification!',
  },
};

export function isShortcutKeyTopic(topicId: string, topicIndexInWorld?: number): boolean {
  if (SHORTCUT_MAP_HIGHLIGHTS[topicId]) return true;
  return topicIndexInWorld === 0 || topicIndexInWorld === 1;
}

// ==================== PRINT STUDY GUIDE FORMATTING HELPERS ====================

export interface PrintGuideFormatOptions {
  compactLayout: boolean;
  includeBarTips: boolean;
  includeLegalCitations: boolean;
  hideCompletedTopics: boolean;
  fontStyle:
    | 'editorial_serif'
    | 'modern_sans'
    | 'classic_monospace'
    | 'dyslexic_sans'
    | 'academic_times'
    | 'formal_georgia'
    | 'clean_inter'
    | 'condensed_narrow'
    | 'warm_charter'
    | 'retro_mario_mono'
    | 'playfair_royal'
    | 'space_grotesk'
    | 'libre_baskerville'
    | 'cormorant_chancery'
    | 'crimson_juris'
    | 'source_serif_codal'
    | 'dm_sans_clean'
    | 'outfit_geometric'
    | 'bricolage_editorial'
    | 'ibm_plex_docket';
  colorAccent:
    | 'executive_navy'
    | 'ink_saver_bw'
    | 'supreme_court_crimson'
    | 'forest_dole_emerald'
    | 'vintage_parchment'
    | 'mario_mushroom_red'
    | 'starlight_cobalt'
    | 'royal_amethyst'
    | 'yoshi_jade_lime'
    | 'teal_tribunal'
    | 'terracotta_codal'
    | 'bowser_obsidian_gold'
    | 'peach_blossom_rose'
    | 'luigi_mansion_jade'
    | 'rosalina_cosmic_ice'
    | 'golden_crown_ivory'
    | 'sakura_editorial'
    | 'midnight_espresso'
    | 'arctic_glacier'
    | 'solarized_amber'
    | 'mint_dole_ledger'
    | 'sunset_coral'
    | 'indigo_jurisprudence'
    | 'wario_royal_gold';
  pageBreakPerWorld: boolean;
  pageBreakPerModule: boolean;
  paperSize?: 'letter' | 'legal' | 'a4';
  blankNoteLinesCount?: 0 | 3 | 5;
  watermarkText?: string;
  lineSpacing?: 'tight' | 'normal' | 'relaxed';
  generateToc?: boolean;
}

export const DEFAULT_PRINT_FORMAT_OPTIONS: PrintGuideFormatOptions = {
  compactLayout: false,
  includeBarTips: true,
  includeLegalCitations: true,
  hideCompletedTopics: false,
  fontStyle: 'editorial_serif',
  colorAccent: 'executive_navy',
  pageBreakPerWorld: true,
  pageBreakPerModule: false,
  paperSize: 'letter',
  blankNoteLinesCount: 0,
  watermarkText: '',
  lineSpacing: 'normal',
  generateToc: true,
};

export function filterTopicsForPrintGuide<T extends Pick<LawTopic, 'id' | 'worldId'>>(
  topics: T[],
  selectedWorlds: string[],
  completedTopicIds: string[],
  hideCompletedTopics: boolean
): T[] {
  const selectedSet = new Set(selectedWorlds);
  const completedSet = new Set(completedTopicIds);
  return topics.filter((t) => {
    if (!selectedSet.has(t.worldId)) return false;
    if (hideCompletedTopics && completedSet.has(t.id)) return false;
    return true;
  });
}

// ==================== POMODORO TIMER HELPERS ====================

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak' | 'sprint';

export const POMODORO_PRESETS: Record<
  PomodoroMode,
  { label: string; shortLabel: string; minutes: number; coinReward: number }
> = {
  focus: { label: '25m Deep Study', shortLabel: '25m Focus', minutes: 25, coinReward: 15 },
  sprint: { label: '15m Quick Sprint', shortLabel: '15m Sprint', minutes: 15, coinReward: 10 },
  shortBreak: { label: '5m Mushroom Break', shortLabel: '5m Break', minutes: 5, coinReward: 0 },
  longBreak: { label: '15m Warp Rest', shortLabel: '15m Rest', minutes: 15, coinReward: 0 },
};

export function formatPomodoroSeconds(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getNextPomodoroModeAfterCompletion(
  completedMode: PomodoroMode,
  completedFocusSessionsCount: number
): PomodoroMode {
  if (completedMode === 'focus' || completedMode === 'sprint') {
    return completedFocusSessionsCount > 0 && completedFocusSessionsCount % 4 === 0
      ? 'longBreak'
      : 'shortBreak';
  }
  return 'focus';
}

export function getAutoScrollMobilePosition(pomodoroState: {
  active: boolean;
  hasNotice: boolean;
  isExpanded: boolean;
}): {
  hidden: boolean;
  bottomClass: string;
} {
  if (pomodoroState.isExpanded) {
    return { hidden: true, bottomClass: 'hidden' };
  }
  if (pomodoroState.active) {
    return {
      hidden: false,
      bottomClass: pomodoroState.hasNotice ? 'bottom-[19rem]' : 'bottom-[13rem]',
    };
  }
  return {
    hidden: false,
    bottomClass: 'bottom-20',
  };
}

// ==================== GLOBAL COIN LEADERBOARD ====================

export const GLOBAL_LEADERBOARD_PEERS_STORAGE_KEY = 'mario_global_coin_leaderboard_peers_v1';

export interface CoinLeaderboardEntry {
  id: string;
  studentName: string;
  schoolOrSection: string;
  avatar: string;
  totalCoins: number;
  streakDays: number;
  modulesCompleted: number;
  favoriteWorld: string;
  isCurrentUser?: boolean;
  isCreator?: boolean;
  rank?: number;
}

export const DEFAULT_STUDENT_LEADERBOARD_COHORT: readonly Omit<
  CoinLeaderboardEntry,
  'rank' | 'isCurrentUser'
>[] = [
  {
    id: 'peer-matthew',
    studentName: 'Matthew Cesar Corpuz',
    schoolOrSection: 'Main Creator • Labor Law Memory Aid',
    avatar: 'goldmario',
    totalCoins: 1480,
    streakDays: 25,
    modulesCompleted: 28,
    favoriteWorld: 'World 6 • Statutory Leaves',
    isCreator: true,
  },
  {
    id: 'peer-mary-louise',
    studentName: 'Mary Louise Cruz',
    schoolOrSection: 'Labor Standards Cohort • Block A',
    avatar: 'rosalina',
    totalCoins: 1120,
    streakDays: 18,
    modulesCompleted: 26,
    favoriteWorld: 'World 3 • Wages & D.O. 174',
  },
  {
    id: 'peer-tracy',
    studentName: 'Tracy Fae Fanged',
    schoolOrSection: 'Labor Standards Cohort • Block A',
    avatar: 'peach',
    totalCoins: 985,
    streakDays: 15,
    modulesCompleted: 24,
    favoriteWorld: 'World 2 • Rest & 13th Month',
  },
  {
    id: 'peer-jelyn',
    studentName: 'Jelyn Fernandez',
    schoolOrSection: 'Labor Standards Cohort • Block A',
    avatar: 'daisy',
    totalCoins: 890,
    streakDays: 14,
    modulesCompleted: 22,
    favoriteWorld: 'World 5 • Protective Laws',
  },
  {
    id: 'peer-aeron',
    studentName: 'Aeron Steven Garcia',
    schoolOrSection: 'Labor Standards Cohort • Block A',
    avatar: 'luigi',
    totalCoins: 810,
    streakDays: 11,
    modulesCompleted: 21,
    favoriteWorld: 'World 1 • Hours of Work',
  },
  {
    id: 'peer-mhelbourne',
    studentName: 'Mhelbourne Garvida',
    schoolOrSection: 'Labor Standards Cohort • Block A',
    avatar: 'yoshi',
    totalCoins: 745,
    streakDays: 10,
    modulesCompleted: 19,
    favoriteWorld: 'World 6 • Statutory Leaves',
  },
  {
    id: 'peer-abigail',
    studentName: 'Abigail Mañalac',
    schoolOrSection: 'Labor Standards Cohort • Block A',
    avatar: 'pauline',
    totalCoins: 680,
    streakDays: 9,
    modulesCompleted: 18,
    favoriteWorld: 'Holidays • Statutory Rules',
  },
  {
    id: 'peer-beyonce',
    studentName: 'Beyonce Helein Untalan',
    schoolOrSection: 'Labor Standards Cohort • Block A',
    avatar: 'toadette',
    totalCoins: 615,
    streakDays: 8,
    modulesCompleted: 17,
    favoriteWorld: 'World 4 • Special Groups',
  },
  {
    id: 'peer-hannah',
    studentName: 'Hannah Daniela Vila',
    schoolOrSection: 'Labor Standards Cohort • Block A',
    avatar: 'capttoad',
    totalCoins: 560,
    streakDays: 7,
    modulesCompleted: 16,
    favoriteWorld: 'World 3 • Wages & D.O. 174',
  },
  {
    id: 'peer-marco',
    studentName: 'Marco Antonio Reyes',
    schoolOrSection: 'Bar Reviewee • Evening Section',
    avatar: 'firemario',
    totalCoins: 430,
    streakDays: 6,
    modulesCompleted: 14,
    favoriteWorld: 'World 1 • Hours of Work',
  },
  {
    id: 'peer-sophia',
    studentName: 'Sophia Isabel Santos',
    schoolOrSection: 'JD 2L • Labor Law Review',
    avatar: 'catpeach',
    totalCoins: 315,
    streakDays: 5,
    modulesCompleted: 11,
    favoriteWorld: 'World 6 • Statutory Leaves',
  },
  {
    id: 'peer-gabriel',
    studentName: 'Gabriel Lorenzo Mendoza',
    schoolOrSection: 'JD 1L • Statutory Foundations',
    avatar: 'toad',
    totalCoins: 195,
    streakDays: 3,
    modulesCompleted: 8,
    favoriteWorld: 'World 2 • Rest & Holidays',
  },
] as const;

export function buildGlobalCoinLeaderboard(params: {
  currentUser: {
    studentName: string;
    avatar: string;
    totalCoins: number;
    streakDays: number;
    modulesCompleted: number;
    favoriteWorld?: string;
  };
  peerEntries?: readonly Omit<CoinLeaderboardEntry, 'rank' | 'isCurrentUser'>[];
}): CoinLeaderboardEntry[] {
  const { currentUser, peerEntries = DEFAULT_STUDENT_LEADERBOARD_COHORT } = params;
  const cleanName = (currentUser.studentName || 'Law Adventurer').trim() || 'Law Adventurer';
  const normalizedUserLower = cleanName.toLowerCase();

  // Avoid duplicate Matthew entry if Matthew himself sets his profile name to Matthew Cesar Corpuz
  const filteredPeers = peerEntries.filter(
    (peer) => peer.studentName.trim().toLowerCase() !== normalizedUserLower
  );

  const isMatthewCreator =
    normalizedUserLower.includes('matthew') && normalizedUserLower.includes('corpuz');

  const combined: CoinLeaderboardEntry[] = [
    ...filteredPeers.map((peer) => ({
      ...peer,
      totalCoins: Math.max(0, Math.floor(peer.totalCoins)),
      streakDays: Math.max(0, Math.floor(peer.streakDays)),
      modulesCompleted: Math.max(0, Math.floor(peer.modulesCompleted)),
      isCurrentUser: false,
    })),
    {
      id: 'current-player',
      studentName: cleanName,
      schoolOrSection: isMatthewCreator
        ? 'You • Main Creator of this Memory Aid'
        : 'You • Active Study Session',
      avatar: currentUser.avatar || 'mario',
      totalCoins: Math.max(0, Math.floor(currentUser.totalCoins)),
      streakDays: Math.max(1, Math.floor(currentUser.streakDays)),
      modulesCompleted: Math.max(0, Math.floor(currentUser.modulesCompleted)),
      favoriteWorld: currentUser.favoriteWorld || 'All 6 Worlds',
      isCurrentUser: true,
      isCreator: isMatthewCreator,
    },
  ];

  combined.sort((a, b) => {
    if (b.totalCoins !== a.totalCoins) return b.totalCoins - a.totalCoins;
    if (b.modulesCompleted !== a.modulesCompleted) {
      return b.modulesCompleted - a.modulesCompleted;
    }
    if (b.streakDays !== a.streakDays) return b.streakDays - a.streakDays;
    if (a.isCurrentUser !== b.isCurrentUser) return a.isCurrentUser ? -1 : 1;
    return a.studentName.localeCompare(b.studentName);
  });

  return combined.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));
}



