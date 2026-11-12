import { PRACTICE_QUESTIONS } from '../data/quizQuestionsData';

export interface KartQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  boostReward: string;
}

export interface SlotTriviaItem {
  id: string;
  q: string;
  opts: string[];
  ans: number;
}

export interface LeaveClinicCaseItem {
  id: string;
  scenario: string;
  correctLeave: string;
  options: string[];
  statute: string;
}

export interface ClimberRungItem {
  id: string;
  rung: number;
  reward: number;
  q: string;
  opts: string[];
  ans: number;
}

export interface DeductionPipeTargetItem {
  id: string;
  label: string;
  isIllegal: boolean;
  ruleNote: string;
}

export interface MultiplierMemoryPairItem {
  id: string;
  scenario: string;
  rate: string;
}

export interface ContractorDocketItem {
  id: string;
  agencyName: string;
  capital: string;
  controlHolder: string;
  workRelation: string;
  registration: string;
  isLaborOnly: boolean;
  verdictNote: string;
}

export interface BridgeDoctrineItem {
  id: string;
  word: string;
  clue: string;
}

export interface PayrollCapsuleItem {
  id: string;
  title: string;
  bucket: 'base100' | 'special130' | 'regular200';
  note: string;
}

export interface CourtroomBowserAttackItem {
  id: string;
  title: string;
  dialogue: string;
  damage: number;
  weakness: 'fireball_8hr' | 'maternity_hammer' | 'star_shield' | 'dole_stomp';
}

export interface WarpSorterItem {
  id: string;
  label: string;
  detail: string;
  targetPipe: 'covered' | 'exempt';
}

export interface LawCatcherTemplateItem {
  id: string;
  type: 'coin' | 'mushroom' | 'star' | 'thwomp' | 'poison';
  label: string;
  isBenefit: boolean;
}

interface DeckCursorState {
  queue: number[];
  lastIndex: number | null;
  poolLength: number;
}

const sessionDecks = new Map<string, DeckCursorState>();

function buildShuffledIndices(
  length: number,
  avoidFirstIndex: number | null,
  rng: () => number
): number[] {
  const indices = Array.from({ length }, (_, idx) => idx);
  // Use crypto.getRandomValues when available for truly random shuffles
  if (typeof crypto !== 'undefined' && crypto.getRandomValues && length > 1) {
    const buf = new Uint32Array(length);
    crypto.getRandomValues(buf);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = buf[i] % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  } else {
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  }
  if (length > 1 && avoidFirstIndex !== null && indices[0] === avoidFirstIndex) {
    const swapIdx = 1 + Math.floor(rng() * (length - 1));
    [indices[0], indices[swapIdx]] = [indices[swapIdx], indices[0]];
  }
  return indices;
}

/**
 * Stateful Fisher-Yates Session Deck Drawer:
 * Deals `count` unique items from `pool` without repeating ANY item across consecutive
 * calls or game restarts until all `pool.length` items have been seen.
 * Also guards cycle boundaries so the last item of Cycle N is never the first item of Cycle N+1.
 */
export function drawUniqueFromDeck<T>(
  deckKey: string,
  pool: readonly T[],
  count: number,
  rng: () => number = Math.random
): T[] {
  if (pool.length === 0 || count <= 0) return [];
  const targetCount = Math.min(count, pool.length);

  let cursor = sessionDecks.get(deckKey);
  if (!cursor || cursor.poolLength !== pool.length) {
    cursor = {
      queue: buildShuffledIndices(pool.length, null, rng),
      lastIndex: null,
      poolLength: pool.length,
    };
    sessionDecks.set(deckKey, cursor);
  }

  const pickedIndices: number[] = [];
  const pickedSet = new Set<number>();

  while (pickedIndices.length < targetCount) {
    if (cursor.queue.length === 0) {
      cursor.queue = buildShuffledIndices(pool.length, cursor.lastIndex, rng);
    }

    // Find the first queued index not already in this current batch
    const nextPos = cursor.queue.findIndex((idx) => !pickedSet.has(idx));
    if (nextPos === -1) {
      // Refill fresh shuffled queue excluding already picked items if needed
      const fresh = buildShuffledIndices(pool.length, cursor.lastIndex, rng).filter(
        (idx) => !pickedSet.has(idx)
      );
      if (fresh.length === 0) break;
      const chosen = fresh[0];
      pickedIndices.push(chosen);
      pickedSet.add(chosen);
      cursor.lastIndex = chosen;
    } else {
      const [chosen] = cursor.queue.splice(nextPos, 1);
      pickedIndices.push(chosen);
      pickedSet.add(chosen);
      cursor.lastIndex = chosen;
    }
  }

  return pickedIndices.map((idx) => pool[idx]);
}

export function drawOneFromDeck<T>(
  deckKey: string,
  pool: readonly T[],
  rng: () => number = Math.random
): T {
  const [item] = drawUniqueFromDeck(deckKey, pool, 1, rng);
  return item;
}

export function resetSessionDecks(prefix?: string): void {
  if (!prefix) {
    sessionDecks.clear();
    return;
  }
  for (const key of Array.from(sessionDecks.keys())) {
    if (key.startsWith(prefix)) {
      sessionDecks.delete(key);
    }
  }
}

/**
 * Shuffles multiple-choice options while accurately tracking the updated `correctIndex`
 * so repeated mastery cycles never keep answers in memorized button slots.
 */
export function shuffleChoiceOptions(
  options: readonly string[],
  correctIndex: number,
  rng: () => number = Math.random
): { options: string[]; correctIndex: number } {
  const tagged = options.map((text, idx) => ({
    text,
    isCorrect: idx === correctIndex,
  }));
  for (let i = tagged.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [tagged[i], tagged[j]] = [tagged[j], tagged[i]];
  }
  return {
    options: tagged.map((t) => t.text),
    correctIndex: Math.max(
      0,
      tagged.findIndex((t) => t.isCorrect)
    ),
  };
}

// ============================================================================
// 1. LABOR KART EXPANDED QUESTION BANK (Curated + Full Practice Integration)
// ============================================================================
const KART_BOOST_REWARDS = [
  'SUPER MUSHROOM TURBO BOOST!',
  'PURPLE ULTRA MINI-TURBO!',
  'INVINCIBILITY STAR HYPERSPEED!',
  'GOLDEN DASH MUSHROOM!',
  'RED SHELL TARGET LOCK!',
  'LIGHTNING BOLT OVERTAKE!',
  'TRIPLE GREEN SHELLS!',
  'FIRE FLOWER SPEED SURGE!',
] as const;

const CURATED_KART_QUESTIONS: KartQuestionItem[] = [
  {
    id: 'kart-1',
    question: 'What is the minimum overtime pay rate for work rendered on an ordinary working day?',
    options: ['125% of hourly rate', '130% of hourly rate', '150% of hourly rate', '200% of hourly rate'],
    correctIndex: 0,
    boostReward: 'SUPER MUSHROOM TURBO BOOST!',
  },
  {
    id: 'kart-2',
    question: 'Between what hours does the statutory 10% Night Shift Differential apply?',
    options: ['8:00 PM to 4:00 AM', '10:00 PM to 6:00 AM', '12:00 MN to 8:00 AM', '9:00 PM to 5:00 AM'],
    correctIndex: 1,
    boostReward: 'RED SHELL TARGET LOCK!',
  },
  {
    id: 'kart-3',
    question: 'Under R.A. 11360, what percentage of collected service charges goes to covered employees?',
    options: ['85%', '90%', '100%', '75%'],
    correctIndex: 2,
    boostReward: 'INVINCIBILITY STAR HYPERSPEED!',
  },
  {
    id: 'kart-4',
    question: 'Under R.A. 11210 (World 6), how many paid days of Maternity Leave apply to a live childbirth?',
    options: ['60 calendar days with pay', '78 calendar days with pay', '105 calendar days with pay', '120 calendar days with pay'],
    correctIndex: 2,
    boostReward: 'PURPLE ULTRA MINI-TURBO!',
  },
  {
    id: 'kart-5',
    question: 'How many days of paid Service Incentive Leave (SIL) accrue after 1 year of service under Art. 95?',
    options: ['3 days with full pay', '5 days with full pay', '7 days with full pay', '10 days with full pay'],
    correctIndex: 1,
    boostReward: 'TRIPLE GREEN SHELLS!',
  },
  {
    id: 'kart-6',
    question: 'Can an employer offset Monday’s undertime with Tuesday’s overtime work?',
    options: [
      'Yes, if agreed upon in writing by the parties',
      'No, strictly prohibited by Labor Code Art. 88',
      'Yes, provided offset occurs in same workweek',
      'Yes, under valid management prerogative rules',
    ],
    correctIndex: 1,
    boostReward: 'GOLDEN DASH MUSHROOM!',
  },
  {
    id: 'kart-7',
    question: 'What is the daily rate for work rendered on a Regular Holiday that falls on a Rest Day?',
    options: ['200% of daily wage', '230% of daily wage', '260% of daily wage', '300% of daily wage'],
    correctIndex: 2,
    boostReward: 'LIGHTNING BOLT OVERTAKE!',
  },
  {
    id: 'kart-8',
    question: 'Under R.A. 11861, what is the minimum service requirement for 7-day Solo Parent Leave?',
    options: ['At least 12 months of service', 'At least 6 months of service', 'At least 3 months of service', 'At least 24 months of service'],
    correctIndex: 1,
    boostReward: 'FIRE FLOWER SPEED SURGE!',
  },
  {
    id: 'kart-9',
    question: 'Power interruptions (brownouts) not exceeding how many minutes are compensable hours worked?',
    options: ['Not exceeding 15 minutes', 'Not exceeding 20 minutes', 'Not exceeding 30 minutes', 'Not exceeding 60 minutes'],
    correctIndex: 1,
    boostReward: 'SUPER MUSHROOM TURBO BOOST!',
  },
  {
    id: 'kart-10',
    question: 'What is the daily wage multiplier when working on a Double Regular Holiday falling on a Rest Day?',
    options: ['300% of regular wage', '330% of regular wage', '390% of regular wage', '400% of regular wage'],
    correctIndex: 2,
    boostReward: 'INVINCIBILITY STAR HYPERSPEED!',
  },
  {
    id: 'kart-11',
    question: 'Under R.A. 8187, Paternity Leave of 7 calendar days applies up to how many deliveries of the lawful spouse?',
    options: ['First 2 spouse deliveries', 'First 3 spouse deliveries', 'First 4 spouse deliveries', 'Unlimited spouse deliveries'],
    correctIndex: 2,
    boostReward: 'PURPLE ULTRA MINI-TURBO!',
  },
  {
    id: 'kart-12',
    question: 'Under R.A. 9710 (Magna Carta of Women), what is the maximum paid Special Leave for gynecological surgery?',
    options: ['Up to 15 days of paid leave', 'Up to 30 days of paid leave', 'Up to 2 months of paid leave', 'Up to 3 months of paid leave'],
    correctIndex: 2,
    boostReward: 'GOLDEN DASH MUSHROOM!',
  },
  {
    id: 'kart-13',
    question: 'Under R.A. 9262 (Anti-VAWC), how many paid leave days are granted upon presenting a Protection Order certification?',
    options: ['Up to 5 paid days under protection order', 'Up to 7 paid days under protection order', 'Up to 10 paid days under protection order', 'Up to 15 paid days under protection order'],
    correctIndex: 2,
    boostReward: 'LIGHTNING BOLT OVERTAKE!',
  },
  {
    id: 'kart-14',
    question: 'Under DOLE D.O. 174-17, what is the minimum substantial capital required for legitimate contracting?',
    options: ['₱1,000,000 paid-up capital', '₱3,000,000 paid-up capital', '₱5,000,000 paid-up capital', '₱10,000,000 paid-up capital'],
    correctIndex: 2,
    boostReward: 'RED SHELL TARGET LOCK!',
  },
  {
    id: 'kart-15',
    question: 'Under P.D. 851, 13th Month Pay must be paid to rank-and-file employees not later than:',
    options: ['December 15 of every year', 'December 24 of every year', 'December 30 of every year', 'December 31 of every year'],
    correctIndex: 1,
    boostReward: 'FIRE FLOWER SPEED SURGE!',
  },
  {
    id: 'kart-16',
    question: 'Under R.A. 10028, compensable lactation breaks for nursing employees must be at least:',
    options: ['At least 15 mins per 8-hr shift', 'At least 25 mins per 8-hr shift', 'At least 40 mins per 8-hr shift', 'At least 60 mins per 8-hr shift'],
    correctIndex: 2,
    boostReward: 'SUPER MUSHROOM TURBO BOOST!',
  },
];

export const KART_QUESTION_BANK: KartQuestionItem[] = [
  ...CURATED_KART_QUESTIONS,
  ...PRACTICE_QUESTIONS.map((pq, idx) => ({
    id: `kart-pq-${pq.id}`,
    question: pq.scenario,
    options: pq.options,
    correctIndex: pq.correctIndex,
    boostReward: KART_BOOST_REWARDS[idx % KART_BOOST_REWARDS.length],
  })),
];

export function drawKartQuestion(rng: () => number = Math.random): KartQuestionItem {
  const raw = drawOneFromDeck('labor_kart_questions', KART_QUESTION_BANK, rng);
  const shuffled = shuffleChoiceOptions(raw.options, raw.correctIndex, rng);
  return {
    ...raw,
    options: shuffled.options,
    correctIndex: shuffled.correctIndex,
  };
}

// ============================================================================
// 2. TOAD HOUSE TREASURY SLOTS TRIVIA BANK (20 Distinct Questions)
// ============================================================================
export const SLOTS_TRIVIA_BANK: SlotTriviaItem[] = [
  {
    id: 'slot-1',
    q: 'Under R.A. 11210, how many additional paid days does a qualified Solo Parent mother get on top of 105 days?',
    opts: ['7 days', '15 days', '30 days'],
    ans: 1,
  },
  {
    id: 'slot-2',
    q: 'Under Art. 95 (Auto Bus), when does the 3-year prescriptive period for unpaid SIL start to run?',
    opts: [
      'Upon annual fiscal closing on Dec 31',
      'Upon employer refusal or separation',
      'Upon initial date of hiring in company',
    ],
    ans: 1,
  },
  {
    id: 'slot-3',
    q: 'Under R.A. 11861, what is the dependent child age threshold for Solo Parents Welfare coverage?',
    opts: ['Below 18 years old', '22 years old or below', '25 years old or below'],
    ans: 1,
  },
  {
    id: 'slot-4',
    q: 'Under D.O. 174-17, what is the minimum paid-up capital or net worth for legitimate job contracting?',
    opts: ['₱1,000,000 paid-up capital', '₱3,000,000 paid-up capital', '₱5,000,000 paid-up capital'],
    ans: 2,
  },
  {
    id: 'slot-5',
    q: 'Up to how many days of R.A. 11210 Maternity Leave can a mother allocate to the child’s father?',
    opts: ['Up to 5 calendar days', 'Up to 7 calendar days', 'Up to 15 calendar days'],
    ans: 1,
  },
  {
    id: 'slot-6',
    q: 'How many paid days of Maternity Leave apply to miscarriage or emergency termination of pregnancy?',
    opts: ['45 calendar days with pay', '60 calendar days with pay', '78 calendar days with pay'],
    ans: 1,
  },
  {
    id: 'slot-7',
    q: 'What is the minimum regular meal-off period mandated under Article 85 of the Labor Code?',
    opts: ['Not less than 30 mins', 'Not less than 60 mins', 'Not less than 45 mins'],
    ans: 1,
  },
  {
    id: 'slot-8',
    q: 'After 24 consecutive hours of normal workdays, what is the minimum weekly rest period under Art. 91?',
    opts: ['At least 12 consecutive hrs', 'At least 24 consecutive hrs', 'At least 36 consecutive hrs'],
    ans: 1,
  },
  {
    id: 'slot-9',
    q: 'Retail & service establishments regularly employing fewer than how many workers are exempt from Holiday Pay?',
    opts: ['Fewer than 5 workers', 'Fewer than 10 workers', 'Fewer than 20 workers'],
    ans: 1,
  },
  {
    id: 'slot-10',
    q: 'Retail & service establishments employing NOT MORE than how many workers are exempt from Night Shift Differential?',
    opts: ['5 workers or fewer', '10 workers or fewer', '15 workers or fewer'],
    ans: 0,
  },
  {
    id: 'slot-11',
    q: 'What is the daily pay rate for working 8 hours on a Special Non-Working Day falling on a Rest Day?',
    opts: ['130% daily rate', '150% daily rate', '200% daily rate'],
    ans: 1,
  },
  {
    id: 'slot-12',
    q: 'Under R.A. 9231, a working child below 15 years old may work at most how many hours per day?',
    opts: ['4 hours per working day', '6 hours per working day', '8 hours per working day'],
    ans: 0,
  },
  {
    id: 'slot-13',
    q: 'Under Batas Kasambahay (R.A. 10361), what is the minimum aggregate daily rest period of a domestic worker?',
    opts: ['6 hours aggregate daily rest', '8 hours aggregate daily rest', '10 hours aggregate daily rest'],
    ans: 1,
  },
  {
    id: 'slot-14',
    q: 'Which harassment law punishes peer-to-peer and subordinate-to-superior workplace harassment without requiring moral ascendancy?',
    opts: ['R.A. 7877 (Anti-Sexual Harassment)', 'R.A. 11313 (Safe Spaces Legislation)', 'P.D. 851 (Standard Labor Regulation)'],
    ans: 1,
  },
  {
    id: 'slot-15',
    q: 'Under Art. 114, weekly deductions for proven employee loss/damage cannot exceed what share of weekly wage?',
    opts: ['10% of weekly wage', '20% of weekly wage', '50% of weekly wage'],
    ans: 1,
  },
  {
    id: 'slot-16',
    q: 'In the Four-Fold Test of employment relationship, which element is the most decisive?',
    opts: [
      'Power of Selection & Engagement',
      'Power of Control over Means & Methods',
      'Payment of Wages and Regular Pay',
    ],
    ans: 1,
  },
  {
    id: 'slot-17',
    q: 'Is unused Paternity Leave (R.A. 8187) convertible to cash if the father does not avail of it?',
    opts: [
      'Yes, fully commutable to cash at year end',
      'No, strictly non-convertible to cash benefits',
      'Yes, convertible at fifty percent cash value',
    ],
    ans: 1,
  },
  {
    id: 'slot-18',
    q: 'Under R.A. 11165 (Telecommuting Act), work-from-home employees are entitled to what statutory standard?',
    opts: [
      'Entitled to reduced basic pay scales',
      'Guaranteed equal parity with on-site staff',
      'Statutorily exempt from standard benefits',
    ],
    ans: 1,
  },
  {
    id: 'slot-19',
    q: 'Under R.A. 9710 Sec. 18, how much aggregate employment service in the past 12 months qualifies for Special Gynecological Leave?',
    opts: ['At least 3 months', 'At least 6 months', 'At least 12 months'],
    ans: 1,
  },
  {
    id: 'slot-20',
    q: 'Under R.A. 10911 (Anti-Age Discrimination), can job ads specify an arbitrary age ceiling without a BFOQ?',
    opts: ['Yes, employer prerogative', 'No, strictly prohibited', 'Allowed for offices'],
    ans: 1,
  },
  {
    id: 'slot-21',
    q: 'Under R.A. 7641, how many days per year of service make up the statutory minimum retirement pay?',
    opts: ['15 days per year', '22.5 days per year', '30 days per year'],
    ans: 1,
  },
  {
    id: 'slot-22',
    q: 'Under Art. 87, what is the overtime multiplier for hours beyond 8 on a Rest Day or Special Day?',
    opts: ['+25% of hourly rate', '+30% of hourly rate on said day', '+50% of hourly rate'],
    ans: 1,
  },
  {
    id: 'slot-23',
    q: 'Under Art. 306, money claims arising from employer-employee relations prescribe in how many years?',
    opts: ['1 year from accrual', '3 years from accrual', '4 years from accrual'],
    ans: 1,
  },
  {
    id: 'slot-24',
    q: 'Under Art. 1146 of the Civil Code, illegal dismissal complaints prescribe within how many years?',
    opts: ['2 years from dismissal', '3 years from dismissal', '4 years from dismissal'],
    ans: 2,
  },
  {
    id: 'slot-25',
    q: 'Under King of Kings Transport, what is the minimum reasonable period to submit a written explanation?',
    opts: ['24 hours from notice', '5 calendar days from notice', '15 working days from notice'],
    ans: 1,
  },
  {
    id: 'slot-26',
    q: 'Under Art. 298, authorized cause termination requires advance written notice to DOLE and workers at least:',
    opts: ['15 days before effectivity', '30 days before effectivity', '60 days before effectivity'],
    ans: 1,
  },
  {
    id: 'slot-27',
    q: 'Under R.A. 11360, managerial employees receive what share of collected hotel/restaurant service charges?',
    opts: ['0% (excluded by law)', '15% management share', '50% equal split'],
    ans: 0,
  },
  {
    id: 'slot-28',
    q: 'Under Art. 103, wages must be paid at least once every two weeks or twice a month at intervals not exceeding:',
    opts: ['10 calendar days', '16 calendar days', '30 calendar days'],
    ans: 1,
  },
  {
    id: 'slot-29',
    q: 'Under Art. 83, health personnel in cities of 1M+ population or 100+ bed hospitals work a regular week of:',
    opts: ['5 days / 40 hours', '6 days / 48 hours', '7 days / 56 hours'],
    ans: 0,
  },
  {
    id: 'slot-30',
    q: 'If a health worker covered by the 5-day / 40-hour rule is suffered to work on the 6th day, they earn:',
    opts: ['Regular 100% pay only', '+30% Rest Day premium pay', '+10% Night Shift pay'],
    ans: 1,
  },
  {
    id: 'slot-31',
    q: 'Under Art. 296, what is the general statutory cap on probationary employment unless covered by apprenticeship?',
    opts: ['3 months from Day 1', '6 months from Day 1', '12 months from Day 1'],
    ans: 1,
  },
  {
    id: 'slot-32',
    q: 'Under Art. 301, bona fide suspension of business operations ("floating status") must not exceed:',
    opts: ['3 months maximum', '6 months maximum', '12 months maximum'],
    ans: 1,
  },
  {
    id: 'slot-33',
    q: 'Under R.A. 9262 (Anti-VAWC), how many paid leave days are granted upon presenting a Protection Order certification?',
    opts: ['Up to 5 paid days', 'Up to 10 paid days', 'Up to 15 paid days'],
    ans: 1,
  },
  {
    id: 'slot-34',
    q: 'Under Agabon v. NLRC, valid Just Cause dismissal with defective procedural notice warrants nominal damages of:',
    opts: ['₱10,000 nominal damages', '₱30,000 nominal damages', '₱50,000 nominal damages'],
    ans: 1,
  },
  {
    id: 'slot-35',
    q: 'Under Jaka Food Processing, valid Authorized Cause dismissal with defective 30-day notice warrants nominal damages of:',
    opts: ['₱20,000 nominal damages', '₱30,000 nominal damages', '₱50,000 nominal damages'],
    ans: 2,
  },
  {
    id: 'slot-36',
    q: 'Under R.A. 10361, at what minimum age may a person be lawfully employed as a Kasambahay?',
    opts: ['15 years old and above', '18 years old and above', '21 years old and above'],
    ans: 1,
  },
];

export function drawSlotTriviaQuestion(rng: () => number = Math.random): SlotTriviaItem {
  const raw = drawOneFromDeck('slots_trivia', SLOTS_TRIVIA_BANK, rng);
  const shuffled = shuffleChoiceOptions(raw.opts, raw.ans, rng);
  return {
    ...raw,
    opts: shuffled.options,
    ans: shuffled.correctIndex,
  };
}

// ============================================================================
// 3. WORLD 6 STATUTORY LEAVE CLINIC BANK (18 Distinct Cases)
// ============================================================================
export const WORLD6_LEAVE_CLINIC_BANK: LeaveClinicCaseItem[] = [
  {
    id: 'w6c-1',
    scenario: 'Rank-and-file employee completes 12 months of service (including authorized absences) and wants unused leave converted to cash at year-end.',
    correctLeave: '5 Days SIL (Art. 95)',
    options: ['5 Days SIL (Art. 95)', '7 Days Paternity Leave', '10 Days VAWC Leave', '60 Days Magna Carta'],
    statute: 'Labor Code Art. 95 — Commutable to cash at year-end based on current wage rate!',
  },
  {
    id: 'w6c-2',
    scenario: 'Female private-sector worker gives live childbirth and is a qualified Solo Parent with a valid Solo Parent ID.',
    correctLeave: '120 Days Paid Maternity (R.A. 11210)',
    options: [
      '60 Days Miscarriage Leave (R.A. 11210)',
      '105 Days Standard Maternity (R.A. 11210)',
      '120 Days Paid Maternity (R.A. 11210)',
      '7 Days Parental Leave (R.A. 11861)',
    ],
    statute: 'R.A. 11210 — 105 days live childbirth + 15 additional paid days for solo parents!',
  },
  {
    id: 'w6c-3',
    scenario: 'Married male employee cohabiting with his legitimate spouse attends her 3rd delivery.',
    correctLeave: '7 Calendar Days Paternity (R.A. 8187)',
    options: [
      '5 Working Days Service Leave (Art. 95)',
      '7 Calendar Days Paternity (R.A. 8187)',
      '15 Days Solo Parent Leave (R.A. 11861)',
      '10 Days Protection Leave (R.A. 9262)',
    ],
    statute: 'R.A. 8187 — Covers the first 4 deliveries or miscarriages of the legitimate cohabiting spouse!',
  },
  {
    id: 'w6c-4',
    scenario: 'Solo parent employee with 6 months of service needs paid time off to attend parental duties for a 19-year-old dependent child.',
    correctLeave: '7 Working Days Solo Parent (R.A. 11861)',
    options: [
      '5 Days Service Leave (Labor Code Art. 95)',
      '7 Working Days Solo Parent (R.A. 11861)',
      '15 Days Solo Maternity (R.A. 11210 Act)',
      'Unpaid Personal Leave (Management Rights)',
    ],
    statute: 'R.A. 11861 — Minimum service lowered from 1 year to 6 months; dependent child age raised to <= 22 years!',
  },
  {
    id: 'w6c-5',
    scenario: 'Female employee undergoes major surgery caused by a gynecological disorder after 8 months aggregate service in the past year.',
    correctLeave: 'Up to 2 Months Special Leave (R.A. 9710)',
    options: [
      'Up to 2 Months Special Leave (R.A. 9710)',
      '60 Days Miscarriage Leave (R.A. 11210)',
      'Up to 10 Days VAWC Leave (R.A. 9262)',
      '5 Days Standard SIL (Article 95 Code)',
    ],
    statute: 'R.A. 9710 Sec. 18 — Full pay based on gross monthly compensation; non-convertible to cash!',
  },
  {
    id: 'w6c-6',
    scenario: 'Female employee presents a Barangay Protection Order certification to attend medical and legal proceedings for violence against her and her child.',
    correctLeave: 'Up to 10 Paid Days VAWC Leave (R.A. 9262)',
    options: [
      '5 Days Standard SIL (Article 95 Code)',
      '7 Days Solo Parent Leave (R.A. 11861)',
      'Up to 10 Paid Days VAWC Leave (R.A. 9262)',
      '30 Days Unpaid Leave (Management Rules)',
    ],
    statute: 'R.A. 9262 Sec. 43 — Paid leave up to 10 days, extendible as specified in the BPO/TPO/PPO!',
  },
  {
    id: 'w6c-7',
    scenario: 'Unmarried female worker suffers an emergency termination of pregnancy (miscarriage) on her 5th pregnancy.',
    correctLeave: '60 Days Paid Maternity Leave (R.A. 11210)',
    options: [
      '60 Days Paid Maternity Leave (R.A. 11210)',
      'No Paid Leave Due To 4-Delivery Statutory Limit',
      '105 Days Standard Maternity Leave Benefit',
      '7 Days Parental Leave Under Solo Parent Rules',
    ],
    statute: 'R.A. 11210 — 60 days full pay for miscarriage/ETP in EVERY pregnancy regardless of civil status or frequency!',
  },
  {
    id: 'w6c-8',
    scenario: 'Married father receives 7 allocated maternity leave days from his wife in addition to his own Paternity Leave.',
    correctLeave: '14 Total Paid Days (7d RA 8187 + 7d RA 11210)',
    options: [
      '7 Calendar Days Maximum Under Paternity Law',
      '14 Total Paid Days (7d RA 8187 + 7d RA 11210)',
      '21 Paid Days Combined With Accrued SIL Days',
      '10 Paid Days Under Expanded Welfare Standards',
    ],
    statute: 'R.A. 11210 Sec. 6 — Up to 7 allocated days stack ON TOP of 7-day Paternity Leave!',
  },
  {
    id: 'w6c-9',
    scenario: 'Unmarried partner of a mother giving live birth is allocated 7 days from her 105-day maternity leave.',
    correctLeave: '7 Allocated Days (R.A. 11210 Transfer)',
    options: [
      '0 Days Due To Bar On Unmarried Biological Fathers',
      '7 Allocated Days (R.A. 11210 Transfer)',
      '7 Days Standard Paternity Leave Under R.A. 8187',
      '14 Total Days Under Accumulated Welfare Benefits',
    ],
    statute: 'R.A. 11210 — Mother may allocate up to 7 days to the child’s father WHETHER OR NOT married to her!',
  },
  {
    id: 'w6c-10',
    scenario: 'Domestic worker (Kasambahay) completes 1 full year of household service with the same employer and asks about leave.',
    correctLeave: '5 Days Kasambahay SIL (Non-Convertible)',
    options: [
      '5 Days Kasambahay SIL (Non-Convertible)',
      '5 Days Cash-Commutable SIL (Labor Code Art. 95)',
      '7 Days Solo Parental Leave Under Republic Act',
      'No Mandatory Leave Entitlement For Kasambahay',
    ],
    statute: 'R.A. 10361 Sec. 29 — Kasambahay gets 5 days paid SIL, but unlike Art. 95 it is non-cumulative & non-convertible to cash!',
  },
  {
    id: 'w6c-11',
    scenario: 'Bus driver paid purely by commission retires after 10 years without ever receiving Service Incentive Leave and files a claim.',
    correctLeave: 'All 10 Years Accrued SIL (Auto Bus Rule)',
    options: [
      'Only The Last 3 Years Accrued SIL Under Prescription',
      'All 10 Years Accrued SIL (Auto Bus Rule)',
      'Exempt Commission Worker Under Article 82 Exclusions',
      'Forfeited Annually Pursuant To Standard Year-End Policy',
    ],
    statute: 'Auto Bus Transport v. Bautista — 3-year prescription runs from demand/refusal or retirement, not each year-end!',
  },
  {
    id: 'w6c-12',
    scenario: 'Company already grants 10 days of paid Vacation Leave per year to all rank-and-file workers; worker demands +5 days statutory SIL.',
    correctLeave: 'Exempt from Extra SIL (Already >= 5 VL Days)',
    options: [
      'Must Mandatorily Grant +5 Extra SIL Days On Top',
      'Exempt from Extra SIL (Already >= 5 VL Days)',
      'Must Convert All 10 VL Days Automatically To Cash',
      'Must Pay Double Cash Compensation At Year Closing',
    ],
    statute: 'Art. 95 Implementing Rules — Establishments already granting at least 5 days paid vacation leave are exempt!',
  },
  {
    id: 'w6c-13',
    scenario: 'Female worker delivers via Caesarean section (CS) in a private hospital and asks whether CS increases her 105-day maternity leave.',
    correctLeave: '105 Days Uniform Live-Birth Benefit',
    options: ['120 Days Because of CS', '78 Days CS Rate', '105 Days Uniform Live-Birth Benefit', '60 Days CS Rate'],
    statute: 'R.A. 11210 — 105 days applies uniformly to both normal and Caesarean deliveries (+15d only if Solo Parent)!',
  },
  {
    id: 'w6c-14',
    scenario: 'Legal guardian bearing sole parental responsibility for a 10-year-old nephew for 8 months applies for 7-day Solo Parent Leave.',
    correctLeave: 'Qualified for 7 Working Days (R.A. 11861)',
    options: ['Disqualified (Biological Parents Only)', 'Qualified for 7 Working Days (R.A. 11861)', 'Needs 12 Months Service First', 'Entitled to 5 Days Only'],
    statute: 'R.A. 11861 — Legal guardians/foster parents solely providing parental care with a Solo Parent ID and >=6 mos service qualify!',
  },
  {
    id: 'w6c-15',
    scenario: 'Employee of a sari-sari retail store regularly employing 6 workers demands 5-day statutory Service Incentive Leave.',
    correctLeave: 'Exempt (<10 Workers Retail/Service Exemption)',
    options: ['Entitled to 5 Days SIL', 'Exempt (<10 Workers Retail/Service Exemption)', 'Entitled to 3 Days SIL', 'Entitled to 7 Days SIL'],
    statute: 'Art. 95 — Retail and service establishments regularly employing fewer than 10 workers are exempt from SIL!',
  },
  {
    id: 'w6c-16',
    scenario: 'Private employer pays SSS maternity reimbursement to a female worker on live-birth leave but refuses to pay the gap between SSS ceiling and her full pay.',
    correctLeave: 'Employer Must Pay Full Salary Differential',
    options: ['SSS Benefit Alone Suffices', 'Employer Must Pay Full Salary Differential', 'Half Differential Only', 'Optional Bonus Only'],
    statute: 'R.A. 11210 Sec. 5 — Private employers must pay the salary differential unless specifically qualified as an exempt distressed/micro enterprise!',
  },
  {
    id: 'w6c-17',
    scenario: 'Married male worker’s lawful wife suffers a sad miscarriage on their 2nd pregnancy; he applies for Paternity Leave.',
    correctLeave: '7 Calendar Days Paternity Leave Applies',
    options: ['Denied (Live Birth Only)', '7 Calendar Days Paternity Leave Applies', '3 Days Bereavement Only', '60 Days Leave'],
    statute: 'R.A. 8187 Sec. 3 — Paternity Leave covers childbirth OR miscarriage for the first 4 deliveries/miscarriages!',
  },
  {
    id: 'w6c-18',
    scenario: 'Solo parent marries a partner and ceases to hold sole parental responsibility after notifying HR.',
    correctLeave: '7-Day Solo Parent Leave Terminates Upon Status Change',
    options: ['Continues Permanently Forever', '7-Day Solo Parent Leave Terminates Upon Status Change', 'Converts to Cash Bonus', 'Doubles to 14 Days'],
    statute: 'R.A. 8972 / R.A. 11861 — A change in status ceasing solo parenthood terminates future Solo Parent Leave eligibility!',
  },
];

export function drawWorld6LeaveCase(rng: () => number = Math.random): LeaveClinicCaseItem {
  const raw = drawOneFromDeck('world6_leave_clinic', WORLD6_LEAVE_CLINIC_BANK, rng);
  const shuffled = shuffleChoiceOptions(raw.options, raw.options.indexOf(raw.correctLeave), rng);
  return {
    ...raw,
    options: shuffled.options,
  };
}

// ============================================================================
// 4. LAKITU CLOUD CLIMBER TIERED BANKS (5 Rungs x 5 Questions = 25 Items)
// ============================================================================
export const CLIMBER_TIER_BANKS: Record<number, Omit<ClimberRungItem, 'rung' | 'reward'>[]> = {
  1: [
    { id: 'c1-1', q: 'Rest period of short duration (5 to 20 mins) is:', opts: ['Compensable hours worked', 'Deductible from pay'], ans: 0 },
    { id: 'c1-2', q: 'Normal hours of work of an employee per day under Art. 83:', opts: ['Shall not exceed 8 hours', 'Shall not exceed 10 hours'], ans: 0 },
    { id: 'c1-3', q: 'Minimum statutory non-compensable regular meal break under Art. 85:', opts: ['Not less than 60 minutes', 'Not less than 20 minutes'], ans: 0 },
    { id: 'c1-4', q: 'Statutory Night Shift Differential window under Art. 86:', opts: ['10:00 PM to 6:00 AM', '8:00 PM to 4:00 AM'], ans: 0 },
    { id: 'c1-5', q: 'Deadline for paying mandatory 13th Month Pay under P.D. 851:', opts: ['Not later than December 24', 'January 15 of next year'], ans: 0 },
  ],
  2: [
    { id: 'c2-1', q: 'Ordinary working day Overtime multiplier under Art. 87 is:', opts: ['125% hourly rate', '130% hourly rate'], ans: 0 },
    { id: 'c2-2', q: 'Work rendered on a scheduled Weekly Rest Day (first 8 hours) pays:', opts: ['130% daily rate', '150% daily rate'], ans: 0 },
    { id: 'c2-3', q: 'Unworked Regular Holiday when employee was present the workday prior pays:', opts: ['100% daily wage', '0% no work no pay'], ans: 0 },
    { id: 'c2-4', q: 'Can undertime on Monday be offset by overtime rendered on Tuesday?', opts: ['No, prohibited by Art. 88', 'Yes, within same week'], ans: 0 },
    { id: 'c2-5', q: 'Service Incentive Leave (Art. 95) after 1 year of service grants:', opts: ['5 commutable days', '7 non-commutable days'], ans: 0 },
  ],
  3: [
    { id: 'c3-1', q: 'Service Charge distribution to covered employees under R.A. 11360:', opts: ['85% employees / 15% management', '100% covered employees'], ans: 1 },
    { id: 'c3-2', q: 'Minimum substantial capital / net worth for legitimate contracting (D.O. 174):', opts: ['At least ₱5,000,000', 'At least ₱1,000,000'], ans: 0 },
    { id: 'c3-3', q: 'Paid Maternity Leave for live childbirth under R.A. 11210 (non-solo parent):', opts: ['105 days with full pay', '60 days with full pay'], ans: 0 },
    { id: 'c3-4', q: 'Minimum service required for 7-day Solo Parent Leave under R.A. 11861:', opts: ['At least 6 months', 'At least 12 months'], ans: 0 },
    { id: 'c3-5', q: 'Maximum daily hours for a working child below 15 years old (R.A. 9231):', opts: ['4 hours/day (20 hrs/wk)', '8 hours/day (40 hrs/wk)'], ans: 0 },
  ],
  4: [
    { id: 'c4-1', q: 'Can Kasambahay unused 5-day SIL (R.A. 10361) be converted to cash?', opts: ['No, non-cumulative & non-convertible', 'Yes, commutable every Dec'], ans: 0 },
    { id: 'c4-2', q: 'Are Facilities (meals/lodging) deductible without written employee authorization?', opts: ['Never — written consent is mandatory', 'Yes, if fair value'], ans: 0 },
    { id: 'c4-3', q: 'Does the Safe Spaces Act (R.A. 11313) require moral ascendancy in workplace harassment?', opts: ['No — covers peers & subordinates too', 'Yes — superiors only'], ans: 0 },
    { id: 'c4-4', q: 'When does the 3-year prescription for unpaid SIL begin (Auto Bus doctrine)?', opts: ['From employer refusal upon demand / separation', 'Automatically every Dec 31'], ans: 0 },
    { id: 'c4-5', q: 'How many Maternity Leave days may a mother allocate to an unmarried father (R.A. 11210)?', opts: ['Up to 7 days', '0 days if unmarried'], ans: 0 },
  ],
  5: [
    { id: 'c5-1', q: 'Double Regular Holiday worked on a scheduled Rest Day pays:', opts: ['300% daily wage', '390% daily wage'], ans: 1 },
    { id: 'c5-2', q: 'Overtime hourly multiplier on a Regular Holiday falling on a Rest Day:', opts: ['260% × 130% = 338% hourly', '200% × 125% = 250% hourly'], ans: 0 },
    { id: 'c5-3', q: 'Two successive Regular Holidays: absent WITHOUT pay day before, did not work either holiday:', opts: ['Disentitled to BOTH holidays', 'Paid 100% for 2nd holiday'], ans: 0 },
    { id: 'c5-4', q: 'Special Leave for Women after gynecological surgery (R.A. 9710 Sec. 18):', opts: ['Up to 2 months full pay (6 mos service in last 12m)', 'Up to 10 days commutable'], ans: 0 },
    { id: 'c5-5', q: 'Liability of Principal in prohibited Labor-Only Contracting under Art. 106 / D.O. 174:', opts: ['Direct Employer for ALL purposes', 'Solidary for unpaid wages only'], ans: 0 },
  ],
};

const CLIMBER_REWARDS = [10, 22, 40, 70, 120] as const;

export function drawClimberTowerRun(rng: () => number = Math.random): ClimberRungItem[] {
  return ([1, 2, 3, 4, 5] as const).map((rungNum, idx) => {
    const raw = drawOneFromDeck(`climber_rung_${rungNum}`, CLIMBER_TIER_BANKS[rungNum], rng);
    const shuffled = shuffleChoiceOptions(raw.opts, raw.ans, rng);
    return {
      id: raw.id,
      rung: rungNum,
      reward: CLIMBER_REWARDS[idx],
      q: raw.q,
      opts: shuffled.options,
      ans: shuffled.correctIndex,
    };
  });
}

// ============================================================================
// 5. WHACK-A-GOOMBA DEDUCTION TARGETS (44 Distinct Items)
// ============================================================================
export const GOOMBA_DEDUCTION_BANK: DeductionPipeTargetItem[] = [
  { id: 'gd-1', label: '5% Cash Shortage Reserve (No Hearing)', isIllegal: true, ruleNote: 'Illegal under Art. 114 without proving fault & due process!' },
  { id: 'gd-2', label: 'Forced Company Store Grocery Cut', isIllegal: true, ruleNote: 'Prohibited by Art. 112 (Non-Interference in Disposal of Wages)!' },
  { id: 'gd-3', label: 'Promissory Chits / Bowser Tokens', isIllegal: true, ruleNote: 'Void under Art. 102 — wages must be paid in legal tender!' },
  { id: 'gd-4', label: 'Rice & Ham Deducted from 13th Month', isIllegal: true, ruleNote: 'Substitute payment for 13th Month Pay is void under P.D. 851!' },
  { id: 'gd-5', label: '15% Management Cut from Service Charge', isIllegal: true, ruleNote: 'Illegal! R.A. 11360 mandates 100% distribution to covered workers!' },
  { id: 'gd-6', label: 'Deducting 15-Min Coffee Rest Break', isIllegal: true, ruleNote: 'Short breaks (5–20 mins) are compensable hours worked!' },
  { id: 'gd-7', label: 'Offsetting Undertime Against Overtime', isIllegal: true, ruleNote: 'Strictly prohibited by Article 88 of the Labor Code!' },
  { id: 'gd-8', label: '50% Weekly Deduction for Lost Tool', isIllegal: true, ruleNote: 'Exceeds the 20% weekly wage deduction ceiling under Art. 114!' },
  { id: 'gd-9', label: 'Meal Deduction Without Written Consent', isIllegal: true, ruleNote: 'Facilities cannot be deducted without written employee consent!' },
  { id: 'gd-10', label: 'Deducting Company Safety Helmet Cost', isIllegal: true, ruleNote: 'PPE & work tools are employer Supplements — never deductible!' },
  { id: 'gd-11', label: 'Kickback Fee for Job Retention', isIllegal: true, ruleNote: 'Wage kickbacks are unlawful under Article 115 / 116!' },
  { id: 'gd-12', label: 'Withholding Final Pay as Retaliation', isIllegal: true, ruleNote: 'Unlawful withholding of wages violates Article 116!' },
  { id: 'gd-13', label: 'Deducting 40-Min Nursing Break (RA 10028)', isIllegal: true, ruleNote: 'Lactation breaks are compensable working time under R.A. 10028!' },
  { id: 'gd-14', label: 'Placement Fee Deducted from Kasambahay', isIllegal: true, ruleNote: 'R.A. 10361 forbids charging recruitment fees to a Kasambahay!' },
  { id: 'gd-15', label: 'SSS, PhilHealth & Pag-IBIG Contributions', isIllegal: false, ruleNote: 'Lawful statutory deduction mandated by social legislation!' },
  { id: 'gd-16', label: 'Union Dues with Written Check-Off', isIllegal: false, ruleNote: 'Lawful deduction expressly authorized under Art. 113(b)!' },
  { id: 'gd-17', label: 'Insurance Premium (Employee Written Consent)', isIllegal: false, ruleNote: 'Lawful deduction authorized under Art. 113(a)!' },
  { id: 'gd-18', label: 'BIR Withholding Income Tax', isIllegal: false, ruleNote: 'Lawful statutory tax withholding mandated by NIRC!' },
  { id: 'gd-19', label: 'Co-op Loan Payment (Written Authorization)', isIllegal: false, ruleNote: 'Valid third-party payment authorized in writing with zero employer fee!' },
  { id: 'gd-20', label: 'Agency Fee Assessed on Non-Union Beneficiaries', isIllegal: false, ruleNote: 'Lawful CBA agency fee recognized under the Labor Code!' },
  { id: 'gd-21', label: 'Fair-Value Meals with Written Voluntary Consent', isIllegal: false, ruleNote: 'Lawful Facility deduction when customary, fair-value & authorized!' },
  { id: 'gd-22', label: '15% Weekly Cut for Proven Fault After Hearing', isIllegal: false, ruleNote: 'Valid under Art. 114 (proven fault + due process + <=20% weekly wage)!' },
  { id: 'gd-23', label: 'Cash Register Variance Cut (No Investigation)', isIllegal: true, ruleNote: 'Illegal under Art. 114 without proving gross negligence & due process!' },
  { id: 'gd-24', label: 'Charging Company Uniform at 400% Cost', isIllegal: true, ruleNote: 'Uniform required for business is an employer Supplement — non-deductible!' },
  { id: 'gd-25', label: 'Withholding Pay for Refusing Quitclaim', isIllegal: true, ruleNote: 'Coercive withholding of earned wages violates Article 116!' },
  { id: 'gd-26', label: 'Deducting Electricity for Remote Telework', isIllegal: true, ruleNote: 'R.A. 11165 forbids shifting essential operational costs to reduce wages!' },
  { id: 'gd-27', label: 'Customer Dine-and-Dash Deducted from Waiter', isIllegal: true, ruleNote: 'Illegal! Losses from third-party crimes cannot be passed to servers!' },
  { id: 'gd-28', label: 'Deducting Medical Exam for Food Handler Permit', isIllegal: true, ruleNote: 'Mandatory pre-employment OSH health exams are employer obligations!' },
  { id: 'gd-29', label: 'Deducting Employer SSS Share from Employee', isIllegal: true, ruleNote: 'Unlawful under Social Security Act — employer must pay its own counterpart!' },
  { id: 'gd-30', label: 'Forced Ticket Cut for Company Christmas Party', isIllegal: true, ruleNote: 'Unauthorized wage deduction for social events violates Article 113!' },
  { id: 'gd-31', label: 'Deducting Company Shuttle Cost to Cut Wages', isIllegal: true, ruleNote: 'Supplements furnished for employer convenience are strictly non-deductible!' },
  { id: 'gd-32', label: 'Salary Cut for Late Arrival (Over 15 Mins Pay)', isIllegal: true, ruleNote: 'Tardiness penalty exceeding actual lost time is an illegal fine!' },
  { id: 'gd-33', label: 'Forfeiting Earned SIL Cash Conversion on Exit', isIllegal: true, ruleNote: 'Article 95 guarantees full commutation of unused SIL upon separation!' },
  { id: 'gd-34', label: 'OFW Placement Fee Deducted from Seafarer', isIllegal: true, ruleNote: 'R.A. 10022 strictly bars charging placement fees to seafarers!' },
  { id: 'gd-35', label: 'Court-Ordered Child Support Garnishment', isIllegal: false, ruleNote: 'Lawful judicial execution for family support under Family Code Art. 201!' },
  { id: 'gd-36', label: 'Pag-IBIG Calamity Loan Amortization Cut', isIllegal: false, ruleNote: 'Lawful loan deduction pursuant to written salary deduction agreement!' },
  { id: 'gd-37', label: 'SSS Salary Loan Monthly Amortization', isIllegal: false, ruleNote: 'Mandatory statutory loan remittance authorized by employee in writing!' },
  { id: 'gd-38', label: 'Employee Share in PhilHealth Premium', isIllegal: false, ruleNote: 'Statutory social health insurance contribution mandated by R.A. 11223!' },
  { id: 'gd-39', label: 'Voluntary Co-op Capital Build-Up (Written Order)', isIllegal: false, ruleNote: 'Valid third-party savings authorized voluntarily in writing by member!' },
  { id: 'gd-40', label: 'Unliquidated Travel Cash Advance Reimbursement', isIllegal: false, ruleNote: 'Lawful payroll offset for unliquidated company funds per signed contract!' },
  { id: 'gd-41', label: 'CBA Welfare Fund Contribution (Signed Check-Off)', isIllegal: false, ruleNote: 'Valid union welfare deduction authorized by individual written check-off!' },
  { id: 'gd-42', label: 'Company Housing Rental (Customary Written Facility)', isIllegal: false, ruleNote: 'Lawful Facility deduction when customary, fair-value, and voluntary!' },
  { id: 'gd-43', label: 'Bereavement Mutual Aid Fund (Written Consent)', isIllegal: false, ruleNote: 'Valid voluntary employee mutual aid contribution authorized in writing!' },
  { id: 'gd-44', label: 'Judicial Attachment from Final Execution Writ', isIllegal: false, ruleNote: 'Lawful judicial garnishment pursuant to a final court writ of execution!' },
];

export function drawGoombaTargets(
  count: number,
  rng: () => number = Math.random
): DeductionPipeTargetItem[] {
  return drawUniqueFromDeck('whack_a_goomba', GOOMBA_DEDUCTION_BANK, count, rng);
}

// ============================================================================
// 6. MULTIPLIER MEMORY MATCH BANK (32 Distinct Pairs -> Deal 8 Per Board)
// ============================================================================
export const MULTIPLIER_MEMORY_BANK: MultiplierMemoryPairItem[] = [
  { id: 'mp-1', scenario: 'Ordinary Day Overtime', rate: '125% Hourly' },
  { id: 'mp-2', scenario: 'Worked Special Non-Working Day', rate: '130% Daily' },
  { id: 'mp-3', scenario: 'Special Day + Rest Day', rate: '150% Daily' },
  { id: 'mp-4', scenario: 'Worked Regular Holiday', rate: '200% Daily' },
  { id: 'mp-5', scenario: 'Regular Holiday + Rest Day', rate: '260% Daily' },
  { id: 'mp-6', scenario: 'Worked Double Regular Holiday', rate: '300% Daily' },
  { id: 'mp-7', scenario: 'Double Holiday + Rest Day', rate: '390% Daily' },
  { id: 'mp-8', scenario: 'Night Shift Differential (10PM–6AM)', rate: '+10% Hourly' },
  { id: 'mp-9', scenario: 'Expanded Maternity (Live Birth)', rate: '105 Paid Days' },
  { id: 'mp-10', scenario: 'Solo Parent Maternity Total', rate: '120 Paid Days' },
  { id: 'mp-11', scenario: 'Miscarriage / ETP Maternity', rate: '60 Paid Days' },
  { id: 'mp-12', scenario: 'Service Incentive Leave (Art. 95)', rate: '5 Commutable Days' },
  { id: 'mp-13', scenario: 'Solo Parent Leave (R.A. 11861)', rate: '7 Working Days' },
  { id: 'mp-14', scenario: 'Anti-VAWC Victim Leave (R.A. 9262)', rate: '10 Paid Days' },
  { id: 'mp-15', scenario: 'Service Charge Share (R.A. 11360)', rate: '100% Employees' },
  { id: 'mp-16', scenario: 'Rest Day Overtime Hourly Rate', rate: '169% Hourly' },
  { id: 'mp-17', scenario: 'Special Day Overtime (Art. 93)', rate: '169% Hourly' },
  { id: 'mp-18', scenario: 'Special Day on Rest Day OT', rate: '195% Hourly' },
  { id: 'mp-19', scenario: 'Regular Holiday Overtime (Art. 87)', rate: '260% Hourly' },
  { id: 'mp-20', scenario: 'Holiday Rest Day Overtime (Art. 87)', rate: '338% Hourly' },
  { id: 'mp-21', scenario: 'Unworked Regular Holiday', rate: '100% Daily' },
  { id: 'mp-22', scenario: 'Unworked Double Regular Holiday', rate: '200% Daily' },
  { id: 'mp-23', scenario: 'Paternity Leave (R.A. 8187)', rate: '7 Calendar Days' },
  { id: 'mp-24', scenario: 'Gynecological Surgery (R.A. 9710)', rate: '2 Months Full Pay' },
  { id: 'mp-25', scenario: 'Art. 302 Retirement Half-Month', rate: '22.5 Days Per Year' },
  { id: 'mp-26', scenario: 'Hospital Health Personnel Week', rate: '40 Hours Normal' },
  { id: 'mp-27', scenario: 'Health Personnel 6th Day Overtime', rate: '30% Premium' },
  { id: 'mp-28', scenario: 'Job Contractor Capital Floor', rate: '₱5,000,000 Net Worth' },
  { id: 'mp-29', scenario: 'Tool Loss Deduction Weekly Ceiling', rate: 'Max 20% Wage' },
  { id: 'mp-30', scenario: 'Compensable Short Power Outage', rate: '20 Mins or Less' },
  { id: 'mp-31', scenario: 'Paid Lactation Nursing Interval', rate: '40 Mins / 8-Hr Shift' },
  { id: 'mp-32', scenario: 'Kasambahay Unjust Dismissal Indemnity', rate: '15 Days Compensation' },
];

export function drawMultiplierMemoryPairs(
  pairCount = 8,
  rng: () => number = Math.random
): MultiplierMemoryPairItem[] {
  return drawUniqueFromDeck('multiplier_memory_pairs', MULTIPLIER_MEMORY_BANK, pairCount, rng);
}

// ============================================================================
// 7. CONTRACTOR BUSTER DOCKETS (14 Distinct D.O. 174 Cases -> Deal 6 Per Run)
// ============================================================================
export const CONTRACTOR_DOCKET_BANK: ContractorDocketItem[] = [
  {
    id: 'cd-1',
    agencyName: 'Boo Ghost Manpower Services',
    capital: '₱850,000 Paid-Up Capital',
    controlHolder: 'Principal factory supervisor dictates assembly methods & discipline',
    workRelation: 'Directly related to principal assembly line',
    registration: 'Unregistered with DOLE',
    isLaborOnly: true,
    verdictNote: 'LABOR-ONLY CONTRACTING! Capital is below ₱5M, unregistered, and principal exercises direct control.',
  },
  {
    id: 'cd-2',
    agencyName: 'Toadstool Tech IT Solutions Inc.',
    capital: '₱12,000,000 Paid-Up Capital + Own Servers & Laptops',
    controlHolder: 'Toadstool IT Project Lead supervises methods; Principal checks final deliverables only',
    workRelation: 'Specialized cloud software maintenance',
    registration: 'Valid DOLE D.O. 174 Certificate of Registration',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE JOB CONTRACTING! Exceeds ₱5M substantial capital, registered, and retains free control over means & methods.',
  },
  {
    id: 'cd-3',
    agencyName: 'Koopa Shell Merchandising Co.',
    capital: '₱1,500,000 Net Worth (No tools or equipment)',
    controlHolder: 'Department store manager assigns schedules and store rules',
    workRelation: 'Cashiers & sales clerks performing core retail operations',
    registration: 'Expired DOLE Registration',
    isLaborOnly: true,
    verdictNote: 'LABOR-ONLY CONTRACTING! Lacks ₱5M substantial capital/investment and workers perform core business under principal control.',
  },
  {
    id: 'cd-4',
    agencyName: 'Starlight Shield Security Agency',
    capital: '₱8,500,000 Paid-Up Capital + Licensed Firearms & Radios',
    controlHolder: 'Agency Detachment Commander controls guard deployment & SOPs',
    workRelation: 'Perimeter facility security services',
    registration: 'Active DOLE D.O. 174 & SOSIA Registration',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE CONTRACTING! Substantial capital >= ₱5M, distinct equipment, and independent control.',
  },
  {
    id: 'cd-5',
    agencyName: 'Shy Guy In-House Placement Corp.',
    capital: '₱6,000,000 Capital (In-House Agency created by Principal)',
    controlHolder: 'Managed by Principal HR Director exclusively for Principal’s own plant',
    workRelation: 'Plant machine operators',
    registration: 'Registered, but operates as an In-House Agency',
    isLaborOnly: true,
    verdictNote: 'ILLEGAL UNDER D.O. 174 Sec. 6! In-house agencies operating exclusively for the principal are strictly prohibited!',
  },
  {
    id: 'cd-6',
    agencyName: 'Yoshi Express Logistics & Fleet Corp.',
    capital: '₱18,000,000 Paid-Up Capital + 24 Refrigerated Trucks',
    controlHolder: 'Yoshi Fleet Dispatchers control driver routes & safety protocols',
    workRelation: 'Multi-client cold-chain delivery across Luzon',
    registration: 'Active DOLE D.O. 174 Registration',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE JOB CONTRACTING! Independent business, >= ₱5M capital, owns fleet, serves multiple clients.',
  },
  {
    id: 'cd-7',
    agencyName: 'Kamek Cabo Labor Cooperative',
    capital: '₱300,000 Subscribed Share Capital (Zero tools)',
    controlHolder: 'Port stevedoring boss ("Cabo") supplies gang under Principal Wharf Supervisor',
    workRelation: 'Core cargo loading & stevedoring',
    registration: 'Unregistered Cabo Group',
    isLaborOnly: true,
    verdictNote: 'PROHIBITED CABO SYSTEM! Supplying workers under the guise of a labor group without capital or independent control is illegal.',
  },
  {
    id: 'cd-8',
    agencyName: 'Rosalina CleanRoom Facilities Corp.',
    capital: '₱9,200,000 Paid-Up Capital + Industrial Scrubbers & HEPA Gear',
    controlHolder: 'Rosalina Site Engineers supervise sanitation SOPs across 14 hospitals',
    workRelation: 'Specialized hospital bio-sanitation maintenance',
    registration: 'Valid DOLE D.O. 174 Registration',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE JOB CONTRACTING! Owns specialized tools, >= ₱5M paid-up capital, and exercises independent control.',
  },
  {
    id: 'cd-9',
    agencyName: 'Dry Bones 5-5-5 Endo Staffing',
    capital: '₱5,200,000 Capital, but forces 5-month repeated resignations',
    controlHolder: 'Agency & Principal collude to re-hire same line cooks every 5 months to block regularization',
    workRelation: 'Core restaurant kitchen operations',
    registration: 'DOLE Registered (Violating Sec. 6)',
    isLaborOnly: true,
    verdictNote: 'PROHIBITED CONTRACTING (D.O. 174 Sec. 6)! Repeatedly hiring workers under short 5-5-5 contracts to circumvent security of tenure is illegal!',
  },
  {
    id: 'cd-10',
    agencyName: 'Peach Culinary Canteen Concessions Inc.',
    capital: '₱7,500,000 Net Worth + Industrial Ovens & Commissary',
    controlHolder: 'Peach Executive Chef hires, pays, and directs all canteen staff independently',
    workRelation: 'Employee cafeteria concession for BPO tower',
    registration: 'Valid DOLE D.O. 174 Registration',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE CONTRACTING! Distinct catering business with own commissary equipment, >= ₱5M net worth, and full control.',
  },
  {
    id: 'cd-11',
    agencyName: 'Waluigi Blank-Waiver Temp Agency',
    capital: '₱2,100,000 Paid-Up Capital',
    controlHolder: 'Requires recruits to sign undated resignation letters & quitclaims before deployment',
    workRelation: 'Warehouse packers supervised by Principal',
    registration: 'Unregistered',
    isLaborOnly: true,
    verdictNote: 'ILLEGAL & LABOR-ONLY! Below ₱5M capital AND requiring ante-dated resignation letters violates D.O. 174 Sec. 6!',
  },
  {
    id: 'cd-12',
    agencyName: 'Captain Toad Elevator Engineering Corp.',
    capital: '₱25,000,000 Paid-Up Capital + Diagnostic Rigs & Crane Trucks',
    controlHolder: 'Licensed Captain Toad Mechanical Engineers control all lift repairs',
    workRelation: 'High-rise elevator overhaul & certification',
    registration: 'Valid DOLE D.O. 174 & PCAB License',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE SPECIALIZED CONTRACTING! High capital, specialized engineering equipment, and independent technical control.',
  },
  {
    id: 'cd-13',
    agencyName: 'Mushroom Kingdom Custodial Pros Inc.',
    capital: '₱8,500,000 Paid-Up Capital + Industrial Floor Buffers & Sanitizers',
    controlHolder: 'Agency custodial supervisors issue task routes and inspect cleanliness; Client logs building access',
    workRelation: 'Premises commercial sanitation',
    registration: 'Valid DOLE D.O. 174 Registration',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE JOB CONTRACTING! Substantial capital exceeding ₱5M, registered, and contractor exercises direct supervision over methods.',
  },
  {
    id: 'cd-14',
    agencyName: 'Shadow Koopa Labor Agency',
    capital: '₱1,200,000 Paid-Up Capital',
    controlHolder: 'Principal warehouse manager directs packaging sequence, work schedule, and signs attendance',
    workRelation: 'Core sorting and dispatching of principal retail merchandise',
    registration: 'Unregistered with DOLE',
    isLaborOnly: true,
    verdictNote: 'LABOR-ONLY CONTRACTING! Insufficient capital under ₱5M, no DOLE registration, and principal retains right of control.',
  },
  {
    id: 'cd-15',
    agencyName: 'Wario Gold Security Services Corp.',
    capital: '₱15,000,000 Paid-Up Capital + Vault, Sidearms & Patrol Fleet',
    controlHolder: 'Security Detachment Commander dictates posts and protocol; Principal specifies perimeter perimeter requirements',
    workRelation: 'Perimeter armed physical security',
    registration: 'Valid DOLE D.O. 174 & PNP-SOSIA License',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE CONTRACTING! High capitalization, specialized PNP license, and independent military-style detachment command.',
  },
  {
    id: 'cd-16',
    agencyName: 'Fawful Quick Hands Logistics',
    capital: '₱750,000 Stated Capital',
    controlHolder: 'Principal logistics division supervises parcel scanning and issues daily quota memos',
    workRelation: 'Directly related to principal courier core delivery system',
    registration: 'DOLE Certificate expired 2 years ago',
    isLaborOnly: true,
    verdictNote: 'LABOR-ONLY CONTRACTING! Expired registration, below ₱5M capital threshold, and principal exercises day-to-day supervision.',
  },
  {
    id: 'cd-17',
    agencyName: 'Yoshi Express Refrigerated Hauling',
    capital: '₱30,000,000 Assets + 20 Temperature-Controlled Reefers',
    controlHolder: 'Yoshi fleet dispatcher controls routes and fleet mechanics; Principal only verifies arrival temps',
    workRelation: 'Cold-chain interstate pharmaceutical transport',
    registration: 'Valid DOLE D.O. 174 & LTFRB Franchise',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE CONTRACTOR! Substantial specialized refrigerated capital investment and autonomous control over transport execution.',
  },
  {
    id: 'cd-18',
    agencyName: 'Chain Chomp Construction Supply Sub',
    capital: '₱2,800,000 Capital',
    controlHolder: 'General contractor site foreman directs masonry tools and imposes disciplinary sanctions',
    workRelation: 'Core structural masonry and cement pouring',
    registration: 'Unregistered',
    isLaborOnly: true,
    verdictNote: 'PROHIBITED LABOR CONTRACTING! Fails the ₱5M threshold, unregistered, and principal foreman holds complete disciplinary control.',
  },
  {
    id: 'cd-19',
    agencyName: 'Princess Peach Legal & Compliance Advisory',
    capital: '₱10,000,000 Professional Capital + Law Library & Digital Systems',
    controlHolder: 'Managing Partner assigns legal briefs; Corporate client provides facts and reviews output',
    workRelation: 'Corporate tax compliance and arbitration representation',
    registration: 'Exempt professional firm registered with SEC / IBP',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE INDEPENDENT SERVICE! High capitalization, independent professional expertise, and client controls results only.',
  },
  {
    id: 'cd-20',
    agencyName: 'Goomba Staffing Solutions',
    capital: '₱600,000 Capital',
    controlHolder: 'Supermarket floor head supervises cash registers and cashier balancing sheets directly',
    workRelation: 'Grocery cashiering and register tallying',
    registration: 'Unregistered',
    isLaborOnly: true,
    verdictNote: 'LABOR-ONLY CONTRACTING! Grossly undercapitalized, no D.O. 174 license, and cashiers are directly controlled by the grocery store.',
  },
  {
    id: 'cd-21',
    agencyName: 'Donkey Kong Industrial Rigging Corp.',
    capital: '₱18,000,000 Capital + 3 Hydraulic Cranes & Certified Riggers',
    controlHolder: 'Master Rigger supervises crane load balancing; Client factory specifies placement pad',
    workRelation: 'Heavy machinery installation and structural rigging',
    registration: 'Valid DOLE D.O. 174 & DOLE-OSHC Accreditations',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE SPECIALIZED CONTRACTOR! Substantial heavy equipment, safety certification, and complete technical autonomy.',
  },
  {
    id: 'cd-22',
    agencyName: 'Kamek Illusionist Merchandising Agency',
    capital: '₱1,500,000 Capital',
    controlHolder: 'Department store visual merchandiser inspects shelf displays and grades personnel daily',
    workRelation: 'In-store shelf stocking and product replenishment',
    registration: 'Application pending with DOLE (no issued certificate)',
    isLaborOnly: true,
    verdictNote: 'LABOR-ONLY CONTRACTING! A pending application confers no license, capital is below ₱5M, and store controls work methods.',
  },
  {
    id: 'cd-23',
    agencyName: 'Daisy Floral Catering & Hospitality Services',
    capital: '₱7,000,000 Capital + Commercial Kitchen & Chafing Rigs',
    controlHolder: 'Executive Chef dictates menu preparation and plating; Hotel banquet manager inspects banquet room only',
    workRelation: 'Convention catering and banquet banquet service',
    registration: 'Valid DOLE D.O. 174 Certificate of Registration',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE CONTRACTOR! Capital exceeds ₱5M, independent culinary expertise, and retains authority over cooking methods.',
  },
  {
    id: 'cd-24',
    agencyName: 'Piranha Plant Staff Pool',
    capital: '₱2,000,000 Capital',
    controlHolder: 'Requires deployed staff to sign blank promissory notes and indemnity waivers',
    workRelation: 'Assembly line operators at semiconductor plant',
    registration: 'Registered with DOLE but violated D.O. 174 Sec. 6 prohibited practices',
    isLaborOnly: true,
    verdictNote: 'ILLEGAL CONTRACTING! Requiring employees to sign promissory notes or indemnity bonds is an express illicit practice under D.O. 174!',
  },
  {
    id: 'cd-25',
    agencyName: 'Rosalina Observatory Data Analytics Group',
    capital: '₱22,000,000 Capital + Proprietary Machine Learning Cluster',
    controlHolder: 'Lead Data Scientist determines algorithmic modeling; Principal bank sets business target KPIs',
    workRelation: 'Credit scoring model development and fraud detection',
    registration: 'Valid DOLE D.O. 174 & DICT Accreditation',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE CONTRACTING! High proprietary investment, specialized intellectual work, and contractor controls algorithmic execution.',
  },
  {
    id: 'cd-26',
    agencyName: 'Spike Shell Janitorial Outsource',
    capital: '₱3,200,000 Capital',
    controlHolder: 'Hospital infection control team directs cleaning chemicals, mop schedules, and evaluates janitors',
    workRelation: 'Hospital ward sanitization',
    registration: 'Unregistered with DOLE',
    isLaborOnly: true,
    verdictNote: 'LABOR-ONLY CONTRACTING! Fails the ₱5M capital rule and hospital exercises total control over sanitation protocol and staff.',
  },
  {
    id: 'cd-27',
    agencyName: 'Luigi Ghostbusters HVAC Overhaul Inc.',
    capital: '₱14,000,000 Capital + Specialized Chiller Testing Rigs',
    controlHolder: 'Luigi Mechanical Master controls duct fabrication and pressure testing; Building manager provides room access',
    workRelation: 'Central air conditioning overhaul and chiller retrofitting',
    registration: 'Valid DOLE D.O. 174 & PCAB Mechanical License',
    isLaborOnly: false,
    verdictNote: 'LEGITIMATE CONTRACTOR! Well exceeds ₱5M, specialized PCAB licensure, and contractor directs all technical mechanical steps.',
  },
  {
    id: 'cd-28',
    agencyName: 'Blooper Ink Printing Helpers Agency',
    capital: '₱900,000 Capital',
    controlHolder: 'Publishing house head pressman controls roller speeds, paper feed, and fines late helpers',
    workRelation: 'Directly related to printing press core publishing',
    registration: 'Unregistered',
    isLaborOnly: true,
    verdictNote: 'LABOR-ONLY CONTRACTING! Low capital, unregistered, and principal pressman directly manages work speed and discipline.',
  },
];

export function drawContractorDockets(
  count = 6,
  rng: () => number = Math.random
): ContractorDocketItem[] {
  return drawUniqueFromDeck('contractor_buster_dockets', CONTRACTOR_DOCKET_BANK, count, rng);
}

// ============================================================================
// 8. BOWSER'S BRIDGE STATUTORY DECODER (40 Distinct Terms)
// ============================================================================
export const BRIDGE_DOCTRINE_BANK: BridgeDoctrineItem[] = [
  { id: 'bb-1', word: 'KASAMBAHAY', clue: 'Domestic worker entitled to 5 days non-commutable SIL after 1 year under R.A. 10361' },
  { id: 'bb-2', word: 'DISTORTION', clue: 'Severe contraction of intentional quantitative wage differences between pay groups (Art. 124)' },
  { id: 'bb-3', word: 'FACILITIES', clue: 'Articles/services for worker & family subsistence deductible only with written consent' },
  { id: 'bb-4', word: 'SUPPLEMENTS', clue: 'Extra conveniences furnished for employer benefit — NEVER deductible from wages' },
  { id: 'bb-5', word: 'LACTATION', clue: 'Compensable nursing break of not less than 40 minutes per 8-hour shift (R.A. 10028)' },
  { id: 'bb-6', word: 'PATERNITY', clue: 'Seven calendar days full-pay leave for first 4 deliveries of lawful cohabiting spouse' },
  { id: 'bb-7', word: 'TELECOMMUTING', clue: 'Work-from-home arrangement governed by Fair Treatment parity under R.A. 11165' },
  { id: 'bb-8', word: 'UNDERTIME', clue: 'Cannot be offset by overtime rendered on another day under Article 88' },
  { id: 'bb-9', word: 'MATERNITY', clue: '105 days paid childbirth leave (+15 days for solo parents) under R.A. 11210' },
  { id: 'bb-10', word: 'COMMUTABLE', clue: 'Feature of unused Art. 95 Service Incentive Leave allowing cash conversion at year-end' },
  { id: 'bb-11', word: 'CONTROL', clue: 'Most decisive element of the Four-Fold Test examining means and methods of work' },
  { id: 'bb-12', word: 'SOLIDARY', clue: 'Joint liability of Principal and Legitimate Contractor strictly for unpaid wages (Art. 106)' },
  { id: 'bb-13', word: 'BROWNOUT', clue: 'Power interruption compensable as hours worked when not exceeding 20 minutes' },
  { id: 'bb-14', word: 'GYNECOLOGICAL', clue: 'Disorder surgery granting up to 2 months special full-pay leave under R.A. 9710 Sec. 18' },
  { id: 'bb-15', word: 'DIMINUTION', clue: 'Unilateral reduction or withdrawal of long-established employee benefits barred by Art. 100' },
  { id: 'bb-16', word: 'MANAGERIAL', clue: 'Employees vested with powers to lay down management policies, exempt from Art. 82–90' },
  { id: 'bb-17', word: 'MISCARRIAGE', clue: 'Emergency pregnancy termination entitled to 60 days full-pay leave under R.A. 11210' },
  { id: 'bb-18', word: 'CHECKOFF', clue: 'Lawful deduction of union dues from wages authorized under Article 113(b)' },
  { id: 'bb-19', word: 'PROTECTION', clue: 'Barangay or Court Order certifying eligibility for 10-day paid Anti-VAWC leave (R.A. 9262)' },
  { id: 'bb-20', word: 'APPRENTICE', clue: 'Trainee in an apprenticeable trade whose wage starts at not less than 75% of minimum wage' },
  { id: 'bb-21', word: 'RETRENCHMENT', clue: 'Authorized termination to prevent serious business losses requiring audited proof (Art. 298)' },
  { id: 'bb-22', word: 'REDUNDANCY', clue: 'Superfluous or duplicate position abolished in good faith with 1 mo/yr pay (Art. 298)' },
  { id: 'bb-23', word: 'SEPARATION', clue: 'Statutory indemnity paid to employee upon authorized cause termination under Art. 298' },
  { id: 'bb-24', word: 'BACKWAGES', clue: 'Full monetary restitution granted to an illegally dismissed employee from dismissal to reinstatement' },
  { id: 'bb-25', word: 'REINSTATEMENT', clue: 'Restoration of an unjustly dismissed worker to their former position without loss of seniority' },
  { id: 'bb-26', word: 'PROBATIONARY', clue: 'Trial period capped at 6 months where standards must be made known on Day 1 (Art. 296)' },
  { id: 'bb-27', word: 'SUSPENSION', clue: 'Preventive measure during serious threat investigation capped at 30 days without pay' },
  { id: 'bb-28', word: 'ABANDONMENT', clue: 'Ground for just cause dismissal requiring unjustified absence plus deliberate intent to sever' },
  { id: 'bb-29', word: 'INDEPENDENT', clue: 'Legitimate job contractor possessing at least P5,000,000 capital and control over methods' },
  { id: 'bb-30', word: 'KICKBACK', clue: 'Unlawful fee or wage deduction demanded by employer for retaining a job under Art. 116' },
  { id: 'bb-31', word: 'OVERTIME', clue: 'Work rendered beyond 8 hours a day compensated with at least 25% hourly premium' },
  { id: 'bb-32', word: 'COMPENSATION', clue: 'Statutory benefits under EC State Insurance Fund for work-connected sickness or death' },
  { id: 'bb-33', word: 'GARNISHMENT', clue: 'Judicial seizure from which minimum wages are strictly exempt under Civil Code Art. 1708' },
  { id: 'bb-34', word: 'CONSTRUCTIVE', clue: 'Illegal dismissal where employer creates unbearable conditions forcing employee resignation' },
  { id: 'bb-35', word: 'PRESCRIPTION', clue: 'Statutory deadline extinguishing legal claims — 3 years for money claims, 4 years for dismissal' },
  { id: 'bb-36', word: 'NOMINAL', clue: 'Vindication damages awarded under Agabon (P30,000) or Jaka Food (P50,000) for lack of due process' },
  { id: 'bb-37', word: 'CONCILIATION', clue: 'Mandatory 30-day amicable settlement process under the Single Entry Approach (SEnA)' },
  { id: 'bb-38', word: 'VISITORIAL', clue: 'Enforcement power of DOLE Secretary under Art. 128 to inspect premises and issue compliance orders' },
  { id: 'bb-39', word: 'DIFFERENTIAL', clue: 'Gap between SSS maternity benefit and employee full salary payable by private employer' },
  { id: 'bb-40', word: 'SUBSTANTIAL', clue: 'Evidence required in administrative labor cases — such relevant evidence a reasonable mind accepts' },
];

export function drawBridgePuzzle(rng: () => number = Math.random): BridgeDoctrineItem {
  return drawOneFromDeck('bowsers_bridge_puzzles', BRIDGE_DOCTRINE_BANK, rng);
}

// ============================================================================
// 9. DR. MARIO HOLIDAY & WAGE PIPE SORTER (36 Distinct Capsules -> Deal 8)
// ============================================================================
export const PAYROLL_CAPSULE_BANK: PayrollCapsuleItem[] = [
  { id: 'pc-1', title: 'Worked Special Working Day (e.g., EDSA Regular Working Day)', bucket: 'base100', note: 'Special Working Days are paid 100% regular daily wage!' },
  { id: 'pc-2', title: 'Unworked Regular Holiday (Present Last Workday Before)', bucket: 'base100', note: 'Unworked Regular Holiday pays 100% daily wage under Art. 94!' },
  { id: 'pc-3', title: 'Ordinary Tuesday 8-Hour Shift (6AM–2PM)', bucket: 'base100', note: 'Ordinary 8-hour shift pays 100% basic daily wage!' },
  { id: 'pc-4', title: 'Paid Service Incentive Leave Day Taken (Art. 95)', bucket: 'base100', note: 'Each availed SIL day pays 100% full basic daily wage!' },
  { id: 'pc-5', title: 'Unworked Special Non-Working Day (Monthly-Paid Worker)', bucket: 'base100', note: 'Monthly-paid employees receive 100% uninterrupted monthly salary!' },
  { id: 'pc-6', title: 'Paid Solo Parent Leave Day Taken (R.A. 11861)', bucket: 'base100', note: 'Solo Parent Leave pays 100% full daily wage including allowances!' },
  { id: 'pc-7', title: 'Worked Scheduled Weekly Rest Day (First 8 Hours)', bucket: 'special130', note: 'Worked Rest Day pays 130% of basic daily rate!' },
  { id: 'pc-8', title: 'Worked Ninoy Aquino Day (Special Non-Working)', bucket: 'special130', note: 'Worked Special Non-Working Day pays 130%!' },
  { id: 'pc-9', title: 'Worked Special Non-Working Day Falling on Rest Day', bucket: 'special130', note: 'Special Non-Working Day + Rest Day pays 150%!' },
  { id: 'pc-10', title: 'Worked All Saints’ Day (Nov 1 Special Non-Working)', bucket: 'special130', note: 'Worked Nov 1 Special Non-Working Day pays 130%!' },
  { id: 'pc-11', title: 'Worked Feast of Immaculate Conception (Dec 8)', bucket: 'special130', note: 'Dec 8 (R.A. 10966) is a Special Non-Working Day paying 130% if worked!' },
  { id: 'pc-12', title: 'Worked Sunday Rest Day Where Nature of Work Has No Regular Schedule', bucket: 'special130', note: 'Work on Sunday/Rest Day pays 130% premium rate under Art. 93!' },
  { id: 'pc-13', title: 'Worked Bonifacio Day (Nov 30 Regular Holiday)', bucket: 'regular200', note: 'Worked Regular Holiday pays 200% for the first 8 hours!' },
  { id: 'pc-14', title: 'Worked Rizal Day Falling on Scheduled Rest Day', bucket: 'regular200', note: 'Worked Regular Holiday + Rest Day pays 260%!' },
  { id: 'pc-15', title: 'Worked Double Regular Holiday (Araw ng Kagitingan + Good Friday)', bucket: 'regular200', note: 'Worked Double Regular Holiday pays 300% daily wage!' },
  { id: 'pc-16', title: 'Worked Double Regular Holiday Falling on Rest Day', bucket: 'regular200', note: 'Double Regular Holiday + Rest Day pays 390% daily wage!' },
  { id: 'pc-17', title: 'Unworked Double Regular Holiday (Qualified Employee)', bucket: 'regular200', note: 'Unworked Double Regular Holiday pays 200% daily wage!' },
  { id: 'pc-18', title: 'Worked National Heroes Day (Last Monday of August)', bucket: 'regular200', note: 'National Heroes Day is a Regular Holiday paying 200% when worked!' },
  { id: 'pc-19', title: 'Ordinary Thursday 8-Hour Day Shift', bucket: 'base100', note: 'Standard ordinary day shift pays 100% regular daily wage.' },
  { id: 'pc-20', title: 'Paid VAWC Protective Leave Day Taken (R.A. 9262)', bucket: 'base100', note: 'VAWC leave pays 100% daily wage under Section 43.' },
  { id: 'pc-21', title: 'Paid Paternity Leave Day Taken (R.A. 8187)', bucket: 'base100', note: 'Paternity leave provides 100% full daily pay for up to 7 calendar days.' },
  { id: 'pc-22', title: 'Paid Gynecological Surgery Leave Day (R.A. 9710)', bucket: 'base100', note: 'Magna Carta of Women leave pays 100% full salary up to 2 months.' },
  { id: 'pc-23', title: 'Unworked Maundy Thursday (Regular Holiday)', bucket: 'base100', note: 'Regular holiday unworked pays 100% daily wage if present prior.' },
  { id: 'pc-24', title: 'Unworked Christmas Day (Dec 25 Regular Holiday)', bucket: 'base100', note: 'Unworked regular holiday pays 100% basic daily rate.' },
  { id: 'pc-25', title: 'Worked Special Non-Working Day (Black Saturday)', bucket: 'special130', note: 'Worked Special Non-Working Day pays 130% of daily wage.' },
  { id: 'pc-26', title: 'Worked Ninoy Aquino Day on Scheduled Rest Day', bucket: 'special130', note: 'Special Non-Working Day + Rest Day pays 150% daily wage.' },
  { id: 'pc-27', title: 'Worked Chinese New Year (Special Non-Working Day)', bucket: 'special130', note: 'Special non-working holiday pays 130% if worked.' },
  { id: 'pc-28', title: 'Worked Scheduled Sunday Rest Day (Regular Day)', bucket: 'special130', note: 'Work on weekly rest day pays 130% premium under Art. 93.' },
  { id: 'pc-29', title: 'Worked All Souls’ Day Special Non-Working Day', bucket: 'special130', note: 'Special day worked pays 130% daily rate.' },
  { id: 'pc-30', title: 'Worked Christmas Eve Special Non-Working Day', bucket: 'special130', note: 'Special non-working day pays 130% daily rate.' },
  { id: 'pc-31', title: 'Worked New Year’s Day (Jan 1 Regular Holiday)', bucket: 'regular200', note: 'Regular holiday worked pays 200% for first 8 hours.' },
  { id: 'pc-32', title: 'Worked Labor Day (May 1 Regular Holiday)', bucket: 'regular200', note: 'Labor Day worked pays 200% for first 8 hours under Art. 94.' },
  { id: 'pc-33', title: 'Worked Independence Day Falling on Rest Day', bucket: 'regular200', note: 'Regular holiday falling on Rest Day pays 260% daily wage.' },
  { id: 'pc-34', title: 'Worked Christmas Day Falling on Scheduled Rest Day', bucket: 'regular200', note: 'Regular holiday + Rest Day pays 260% daily rate.' },
  { id: 'pc-35', title: 'Worked Good Friday and Araw ng Kagitingan Coinciding', bucket: 'regular200', note: 'Double regular holiday pays 300% daily wage.' },
  { id: 'pc-36', title: 'Worked Double Regular Holiday on Rest Day', bucket: 'regular200', note: 'Double regular holiday on Rest Day pays 390% daily wage.' },
];

export function drawPayrollCapsules(
  count = 8,
  rng: () => number = Math.random
): PayrollCapsuleItem[] {
  return drawUniqueFromDeck('payroll_capsules', PAYROLL_CAPSULE_BANK, count, rng);
}

// ============================================================================
// 10. COURTROOM BOSS BATTLE BOWSER ATTACKS (24 Distinct Employer Violations)
// ============================================================================
export const COURTROOM_BOWSER_ATTACK_BANK: CourtroomBowserAttackItem[] = [
  {
    id: 'ba-1',
    title: 'FORCED 16-HOUR SHIFT WITHOUT OVERTIME!',
    dialogue: 'Bwahaha! Overtime is a privilege, counsel! Work all night for free!',
    damage: 22,
    weakness: 'fireball_8hr',
  },
  {
    id: 'ba-2',
    title: 'UNDERTIME OFFSET AGAINST TUESDAY OVERTIME!',
    dialogue: 'You were 1 hour late Monday, so your Tuesday overtime is ERASED!',
    damage: 20,
    weakness: 'fireball_8hr',
  },
  {
    id: 'ba-3',
    title: 'UNPAID 18-MINUTE CASTLE BROWNOUT!',
    dialogue: 'The torches flickered out for 18 minutes — I am docking your hourly pay!',
    damage: 19,
    weakness: 'fireball_8hr',
  },
  {
    id: 'ba-4',
    title: 'ILLEGAL PREGNANCY DISMISSAL!',
    dialogue: 'You requested 105-day maternity leave?! You are FIRED from Bowser Keep!',
    damage: 26,
    weakness: 'maternity_hammer',
  },
  {
    id: 'ba-5',
    title: 'REFUSAL TO PAY MATERNITY SALARY DIFFERENTIAL!',
    dialogue: 'Take your SSS check and scram — zero salary differential from my treasury!',
    damage: 24,
    weakness: 'maternity_hammer',
  },
  {
    id: 'ba-6',
    title: 'DENIAL OF 15-DAY SOLO PARENT MATERNITY EXTENSION!',
    dialogue: 'Solo Parent ID?! Never heard of R.A. 11210! Back to work on Day 105!',
    damage: 23,
    weakness: 'maternity_hammer',
  },
  {
    id: 'ba-7',
    title: 'UNAUTHORIZED UNIFORM & BREAKAGE DEDUCTION!',
    dialogue: 'I am deducting 50% of your wage for broken castle bricks and lava boots!',
    damage: 18,
    weakness: 'star_shield',
  },
  {
    id: 'ba-8',
    title: 'UNILATERAL WITHDRAWAL OF ANNUAL RICE ALLOWANCE!',
    dialogue: 'After 8 years of customary benefits, I am cancelling everything today!',
    damage: 21,
    weakness: 'star_shield',
  },
  {
    id: 'ba-9',
    title: 'MANAGEMENT POCKETS 15% OF SERVICE CHARGES!',
    dialogue: 'Your restaurant service charges belong to my royal throne now!',
    damage: 20,
    weakness: 'star_shield',
  },
  {
    id: 'ba-10',
    title: 'SHAM LABOR-ONLY GHOST CONTRACTING!',
    dialogue: 'My shell agency has ₱500 capital and zero tools! You have NO tenure here!',
    damage: 28,
    weakness: 'dole_stomp',
  },
  {
    id: 'ba-11',
    title: 'IN-HOUSE CABO PLACEMENT AGENCY SCHEME!',
    dialogue: 'My HR chief runs a fake manpower coop exclusively for my own lava factory!',
    damage: 26,
    weakness: 'dole_stomp',
  },
  {
    id: 'ba-12',
    title: 'REPEATED 5-5-5 ENDO CONTRACT CYCLING!',
    dialogue: 'Sign another 5-month waiver so you NEVER become a regular Koopa worker!',
    damage: 25,
    weakness: 'dole_stomp',
  },
  {
    id: 'ba-13',
    title: 'UNPAID 24-HOUR WEEKLY REST DAY VIOLATION!',
    dialogue: 'Rest days are for the weak! You work 365 days a year in my lava pits!',
    damage: 22,
    weakness: 'fireball_8hr',
  },
  {
    id: 'ba-14',
    title: 'SUB-MINIMUM WAGE EXPLOITATION!',
    dialogue: '₱200 a day is more than enough for your toil! Take it or be banished!',
    damage: 25,
    weakness: 'star_shield',
  },
  {
    id: 'ba-15',
    title: 'NO-MARRIAGE CLAUSE IN EMPLOYMENT CONTRACT!',
    dialogue: 'Sign here promising to NEVER marry or get pregnant while working for Koopa Corp!',
    damage: 24,
    weakness: 'maternity_hammer',
  },
  {
    id: 'ba-16',
    title: 'UNILATERAL BONUS RETRACTION CLAUSE!',
    dialogue: 'I gave you a 14th-month bonus for 10 straight years, but today I am wiping it out!',
    damage: 22,
    weakness: 'star_shield',
  },
  {
    id: 'ba-17',
    title: 'ZERO SAFETY GEAR / HAZARDOUS MINING ORDER!',
    dialogue: 'Harnesses cost coins! Descend into the toxic spike cavern with bare hands!',
    damage: 26,
    weakness: 'dole_stomp',
  },
  {
    id: 'ba-18',
    title: 'FORCED RESIGNATION UNDER THREAT OF PRISON!',
    dialogue: 'Sign this voluntary resignation right now or I will lock you in the dungeon forever!',
    damage: 27,
    weakness: 'dole_stomp',
  },
  {
    id: 'ba-19',
    title: 'OVERTIME UNDERTIME FORCED SWAP FRAUD!',
    dialogue: 'You rendered 4 hours OT on Friday, but took 4 hours off Monday — ZERO pay for you!',
    damage: 21,
    weakness: 'fireball_8hr',
  },
  {
    id: 'ba-20',
    title: 'WITHHOLDING FINAL PAY AND RETIREMENT CHECK!',
    dialogue: 'You resigned? Your final pay and 22.5-day retirement pay remain in my treasure chest!',
    damage: 25,
    weakness: 'star_shield',
  },
  {
    id: 'ba-21',
    title: 'DENIAL OF 7-DAY VAWC ABUSE LEAVE!',
    dialogue: 'A court protection order means nothing in Bowser Castle! Report to duty or get fired!',
    damage: 24,
    weakness: 'maternity_hammer',
  },
  {
    id: 'ba-22',
    title: 'FLOATING STATUS PROLONGED PAST 6 MONTHS!',
    dialogue: 'Stay on off-detail for 18 months without pay while I hire new Goombas!',
    damage: 26,
    weakness: 'dole_stomp',
  },
  {
    id: 'ba-23',
    title: 'FORCED RECRUITMENT PLACEMENT FEE DEDUCTION!',
    dialogue: 'I am deducting 50% of your Kasambahay wage to pay your recruitment placement fee!',
    damage: 23,
    weakness: 'star_shield',
  },
  {
    id: 'ba-24',
    title: 'DEFECTIVE KING OF KINGS VERBAL FIRING!',
    dialogue: 'No written charge! No hearing! No explanation! You are summarily fired right now!',
    damage: 27,
    weakness: 'dole_stomp',
  },
];

export function drawBowserCourtroomAttack(
  rng: () => number = Math.random
): CourtroomBowserAttackItem {
  return drawOneFromDeck('courtroom_bowser_attacks', COURTROOM_BOWSER_ATTACK_BANK, rng);
}

// ============================================================================
// 11. WARP PIPE SORTER BANK (60 Distinct Items -> Deal 12 Per Round)
// ============================================================================
export const WARP_PIPE_SORTER_BANK: WarpSorterItem[] = [
  { id: 'ws-1', label: '18-Minute Power Outage', detail: 'Short brownouts <= 20 minutes are compensable hours worked.', targetPipe: 'covered' },
  { id: 'ws-2', label: 'Managerial Staff (Power to Hire & Fire)', detail: 'Officers of managerial staff are exempt from Articles 82–90.', targetPipe: 'exempt' },
  { id: 'ws-3', label: 'Offsetting Monday Undertime with Tuesday OT', detail: 'Article 88 strictly prohibits offsetting undertime with overtime.', targetPipe: 'exempt' },
  { id: 'ws-4', label: '100% Service Charge to Covered Workers', detail: 'Mandatory 100% distribution under Republic Act No. 11360.', targetPipe: 'covered' },
  { id: 'ws-5', label: 'Mandatory Pregnancy Testing of Applicants', detail: 'Strictly prohibited under R.A. 11210 and Magna Carta of Women.', targetPipe: 'exempt' },
  { id: 'ws-6', label: '105-Day Paid Maternity Leave', detail: 'Mandatory benefit for covered female workers regardless of civil status.', targetPipe: 'covered' },
  { id: 'ws-7', label: 'Substituting 13th Month Pay with Ham / Rice', detail: 'Non-cash substitute payments for 13th Month Pay are void under P.D. 851.', targetPipe: 'exempt' },
  { id: 'ws-8', label: 'Kasambahay 5-Day Paid Service Incentive Leave', detail: 'Mandatory statutory entitlement after 1 year under R.A. 10361.', targetPipe: 'covered' },
  { id: 'ws-9', label: 'Field Personnel (Unsupervised Field Hours)', detail: 'Exempt from Title I hours-of-work & SIL when hours cannot be determined with certainty.', targetPipe: 'exempt' },
  { id: 'ws-10', label: '10 Days Paid VAWC Protective Leave', detail: 'Mandatory paid leave for victim-survivors under R.A. 9262 Sec. 43.', targetPipe: 'covered' },
  { id: 'ws-11', label: 'Unworked Regular Holiday 100% Daily Pay', detail: 'Mandatory holiday pay under Article 94 when present or on paid leave prior.', targetPipe: 'covered' },
  { id: 'ws-12', label: '₱500 Agency Without ₱5M Capital', detail: 'Prohibited Labor-Only Contracting under DOLE D.O. 174-17.', targetPipe: 'exempt' },
  { id: 'ws-13', label: '40-Minute Paid Lactation Break (R.A. 10028)', detail: 'Compensable nursing interval counted as hours worked per 8-hour shift.', targetPipe: 'covered' },
  { id: 'ws-14', label: '7 Working Days Solo Parent Leave (6 Mos Service)', detail: 'Mandatory parental leave under R.A. 11861 with valid Solo Parent ID.', targetPipe: 'covered' },
  { id: 'ws-15', label: 'Up to 2 Months Gynecological Surgery Leave', detail: 'Special full-pay benefit under R.A. 9710 Sec. 18 after 6 mos aggregate service.', targetPipe: 'covered' },
  { id: 'ws-16', label: '7 Calendar Days Paternity Leave (First 4 Deliveries)', detail: 'Mandatory full-pay leave for married male cohabiting with legitimate spouse (R.A. 8187).', targetPipe: 'covered' },
  { id: 'ws-17', label: 'Retail Store with 4 Workers (NSD Claim)', detail: 'Retail/service establishments regularly employing <= 5 workers are exempt from NSD.', targetPipe: 'exempt' },
  { id: 'ws-18', label: 'Paying Wages in Promissory Notes / Coupons', detail: 'Prohibited under Article 102 — wages must be paid in legal tender.', targetPipe: 'exempt' },
  { id: 'ws-19', label: 'Age Ceiling in Job Ad Without BFOQ', detail: 'Prohibited under R.A. 10911 (Anti-Age Discrimination in Employment Act).', targetPipe: 'exempt' },
  { id: 'ws-20', label: 'Child Under 18 Assigned to Hazardous Mining', detail: 'Strictly prohibited worst/hazardous child labor under R.A. 9231.', targetPipe: 'exempt' },
  { id: 'ws-21', label: '15-Minute Short Coffee Rest Period', detail: 'Rest periods of 5 to 20 minutes are compensable hours worked.', targetPipe: 'covered' },
  { id: 'ws-22', label: '13th Month Pay for Resigned Worker (Served 2 Mos)', detail: 'Entitled to proportionate 13th Month Pay after working at least 1 month.', targetPipe: 'covered' },
  { id: 'ws-23', label: 'Government Civil Service Employees (Labor Code Title I)', detail: 'Governed by Civil Service rules and exempt from Labor Code Art. 82.', targetPipe: 'exempt' },
  { id: 'ws-24', label: 'Telecommuting Worker Overtime & Leave Parity', detail: 'Protected by Fair Treatment parity under R.A. 11165.', targetPipe: 'covered' },
  { id: 'ws-25', label: 'Compulsory On-Site Waiting Time Required by Employer', detail: 'Waiting time spent on duty where worker cannot leave is compensable under Art. 84.', targetPipe: 'covered' },
  { id: 'ws-26', label: 'Wage Deduction for Loss Without Hearing or Negligence Proof', detail: 'Strictly prohibited under Art. 113–115; deductions require proof and due process.', targetPipe: 'exempt' },
  { id: 'ws-27', label: 'Batas Kasambahay 13th Month Pay After 1 Month Service', detail: 'Mandatory statutory benefit under Republic Act No. 10361 Sec. 25.', targetPipe: 'covered' },
  { id: 'ws-28', label: 'Mandatory Prior Written Notice in Retrenchment (30 Days)', detail: 'Compulsory twin notice to worker and DOLE Regional Office under Art. 298.', targetPipe: 'covered' },
  { id: 'ws-29', label: 'Contract Stipulation Barring Female Employee Marriage', detail: 'Void and prohibited stipulation against marriage under Labor Code Art. 134.', targetPipe: 'exempt' },
  { id: 'ws-30', label: 'Retail Establishment Regularly Employing 8 Workers (SIL)', detail: 'Establishments with fewer than 10 employees are exempt from Service Incentive Leave.', targetPipe: 'exempt' },
  { id: 'ws-31', label: 'Pregnant Employee Transferred from Night Shift (10pm-6am)', detail: 'Mandatory safety accommodation without pay reduction under R.A. 10151.', targetPipe: 'covered' },
  { id: 'ws-32', label: 'Advance Contractual Waiver of Statutory Overtime Pay', detail: 'Null and void as contrary to public policy under Article 6 of the Civil Code.', targetPipe: 'exempt' },
  { id: 'ws-33', label: '60-Minute Complete Meal Break Freed from All Duties', detail: 'Non-compensable bona fide meal break where worker is completely relieved of work.', targetPipe: 'exempt' },
  { id: 'ws-34', label: 'Full Backwages and Reinstatement for Illegal Dismissal', detail: 'Twin statutory remedies guaranteed to unjustly dismissed regular employees under Art. 294.', targetPipe: 'covered' },
  { id: 'ws-35', label: 'Piece-Rate Worker Minimum Wage Floor Guarantee', detail: 'Piece-rate and pakyaw workers are entitled to minimum daily wage under Art. 101.', targetPipe: 'covered' },
  { id: 'ws-36', label: 'Subcontractor Bond and ₱5 Million Net Worth Certificate', detail: 'Mandatory capitalization for legitimate job contracting under DOLE D.O. 174-17.', targetPipe: 'covered' },
  { id: 'ws-37', label: 'Retrenchment Separation Pay (1/2 Month/Yr)', detail: 'Statutory minimum separation pay for business retrenchment under Art. 298.', targetPipe: 'covered' },
  { id: 'ws-38', label: 'Personal Secretary to Corporate President', detail: 'Managerial staff/confidential employee exempt from Title I hours of work.', targetPipe: 'exempt' },
  { id: 'ws-39', label: 'Expanded Solo Parent 7-Day Paid Leave (RA 11861)', detail: 'Mandatory parental leave after 6 months continuous service.', targetPipe: 'covered' },
  { id: 'ws-40', label: 'Deducting Meal Cost Without Signed Consent', detail: 'Facilities require voluntary written authorization under Mabeza rule.', targetPipe: 'exempt' },
  { id: 'ws-41', label: 'Night Shift Differential from 10PM to 6AM (+10%)', detail: 'Mandatory NSD premium under Article 86 of the Labor Code.', targetPipe: 'covered' },
  { id: 'ws-42', label: 'Members of Employer Immediate Family Dependent for Support', detail: 'Expressly exempt from Labor Code Title I hours-of-work under Art. 82.', targetPipe: 'exempt' },
  { id: 'ws-43', label: '100% SSS Maternity Pay Advanced Within 30 Days', detail: 'Compulsory employer advance of maternity pay under R.A. 11210.', targetPipe: 'covered' },
  { id: 'ws-44', label: 'Dismissal for Union Organizing Activities', detail: 'Gross Unfair Labor Practice prohibited under Article 259 of the Labor Code.', targetPipe: 'exempt' },
  { id: 'ws-45', label: 'Overtime Work on Scheduled Weekly Rest Day (169%)', detail: '130% Rest Day base rate x 1.30 overtime multiplier under Art. 87.', targetPipe: 'covered' },
  { id: 'ws-46', label: 'Floating Status Exceeding 6 Months Without Recall', detail: 'Ripens into constructive illegal dismissal under Article 301.', targetPipe: 'exempt' },
  { id: 'ws-47', label: 'Service Incentive Leave Cash Commutation Upon Exit', detail: 'Mandatory commutation of all unused SIL days upon separation.', targetPipe: 'covered' },
  { id: 'ws-48', label: 'Forced Overtime Waiver in Pre-Printed Contract', detail: 'Null and void as contrary to law, morals, and public policy.', targetPipe: 'exempt' },
  { id: 'ws-49', label: 'Double Regular Holiday Pay (300% Daily Rate)', detail: 'Compulsory holiday rate for 8 hours on coinciding regular holidays.', targetPipe: 'covered' },
  { id: 'ws-50', label: 'Worker Deducted for Third-Party Theft Losses', detail: 'Prohibited deduction where employee was not proven grossly negligent.', targetPipe: 'exempt' },
  { id: 'ws-51', label: 'Hospital Nurse 40-Hour / 5-Day Workweek (Art. 83)', detail: 'Statutory workweek for hospital staff in cities with 1M+ population.', targetPipe: 'covered' },
  { id: 'ws-52', label: 'Sub-Minimum Wage Paid Under Verbal Agreement', detail: 'Void agreement; statutory minimum wage cannot be waived or compromised.', targetPipe: 'exempt' },
  { id: 'ws-53', label: '22.5-Day Minimum Retirement Pay per Year of Service', detail: 'Mandatory retirement floor under R.A. 7641 for employees reaching age 60/65.', targetPipe: 'covered' },
  { id: 'ws-54', label: 'Unregistered Labor Contractor with ₱800k Capital', detail: 'Prohibited Labor-Only Contracting under DOLE D.O. 174-17.', targetPipe: 'exempt' },
  { id: 'ws-55', label: 'Telecommuting Employee Overtime & Rest Day Parity', detail: 'Guaranteed equal treatment with on-site peers under R.A. 11165.', targetPipe: 'covered' },
  { id: 'ws-56', label: 'Withholding Final Pay Beyond 30 Calendar Days', detail: 'Unlawful under DOLE Labor Advisory No. 06-20.', targetPipe: 'exempt' },
  { id: 'ws-57', label: 'Lactation Station with Refrigeration in Workplace', detail: 'Compulsory workplace health accommodation under R.A. 10028.', targetPipe: 'covered' },
  { id: 'ws-58', label: 'Summary Dismissal Without Written Notice of Decision', detail: 'Violates King of Kings second written notice requirement.', targetPipe: 'exempt' },
  { id: 'ws-59', label: 'First Preference of Unpaid Wages in Bankruptcy (Art. 110)', detail: 'Statutory priority of unpaid employee compensation in employer insolvency.', targetPipe: 'covered' },
  { id: 'ws-60', label: 'Replacing 13th Month Cash Pay with Grocery Coupons', detail: 'Void substitute payment under Presidential Decree No. 851.', targetPipe: 'exempt' },
];

export function drawWarpPipeSorterDeck(
  count = 12,
  rng: () => number = Math.random
): WarpSorterItem[] {
  return drawUniqueFromDeck('warp_pipe_sorter', WARP_PIPE_SORTER_BANK, count, rng);
}

// ============================================================================
// 12. LAW CATCHER BENEFITS & HAZARDS BANKS (36 Benefits + 36 Hazards)
// ============================================================================
export const LAW_CATCHER_BENEFITS_BANK: LawCatcherTemplateItem[] = [
  { id: 'lcb-1', type: 'coin', label: '13th Month Pay (PD 851)', isBenefit: true },
  { id: 'lcb-2', type: 'mushroom', label: '105-Day Maternity (RA 11210)', isBenefit: true },
  { id: 'lcb-3', type: 'mushroom', label: '5-Day Commutable SIL (Art. 95)', isBenefit: true },
  { id: 'lcb-4', type: 'star', label: '100% Service Charge (RA 11360)', isBenefit: true },
  { id: 'lcb-5', type: 'coin', label: '+10% Night Shift Diff', isBenefit: true },
  { id: 'lcb-6', type: 'star', label: '200% Regular Holiday Pay', isBenefit: true },
  { id: 'lcb-7', type: 'mushroom', label: '7-Day Solo Parent Leave', isBenefit: true },
  { id: 'lcb-8', type: 'mushroom', label: '10-Day VAWC Paid Leave', isBenefit: true },
  { id: 'lcb-9', type: 'star', label: '2-Mo Gynecological Leave', isBenefit: true },
  { id: 'lcb-10', type: 'coin', label: '7-Day Paternity Leave', isBenefit: true },
  { id: 'lcb-11', type: 'coin', label: '40-Min Paid Lactation Break', isBenefit: true },
  { id: 'lcb-12', type: 'star', label: '390% Double Holiday + RD', isBenefit: true },
  { id: 'lcb-13', type: 'coin', label: '125% Ordinary Overtime', isBenefit: true },
  { id: 'lcb-14', type: 'mushroom', label: '24-Hr Weekly Rest Day', isBenefit: true },
  { id: 'lcb-15', type: 'star', label: 'Telecommuting Fair Parity', isBenefit: true },
  { id: 'lcb-16', type: 'coin', label: '15-Day Cash Conversion SIL', isBenefit: true },
  { id: 'lcb-17', type: 'mushroom', label: '150% Special Day + RD Pay', isBenefit: true },
  { id: 'lcb-18', type: 'star', label: 'Full Reinstatement & Backwages', isBenefit: true },
  { id: 'lcb-19', type: 'coin', label: 'Batas Kasambahay 13th Month', isBenefit: true },
  { id: 'lcb-20', type: 'mushroom', label: 'Mandatory OSH PPE (RA 11058)', isBenefit: true },
  { id: 'lcb-21', type: 'star', label: '22.5d Retirement Floor', isBenefit: true },
  { id: 'lcb-22', type: 'coin', label: '169% Rest Day Overtime', isBenefit: true },
  { id: 'lcb-23', type: 'mushroom', label: '15-Day Kasambahay Indemnity', isBenefit: true },
  { id: 'lcb-24', type: 'star', label: 'Twin-Notice Due Process', isBenefit: true },
  { id: 'lcb-25', type: 'coin', label: '260% Holiday Rest Day Pay', isBenefit: true },
  { id: 'lcb-26', type: 'mushroom', label: 'P5M Contractor Net Worth', isBenefit: true },
  { id: 'lcb-27', type: 'star', label: 'First Preference in Bankruptcy', isBenefit: true },
  { id: 'lcb-28', type: 'coin', label: '300% Double Regular Holiday', isBenefit: true },
  { id: 'lcb-29', type: 'mushroom', label: '60-Day Miscarriage Leave', isBenefit: true },
  { id: 'lcb-30', type: 'star', label: '7-Day Maternity Father Transfer', isBenefit: true },
  { id: 'lcb-31', type: 'coin', label: 'Bi-Monthly Service Charge Release', isBenefit: true },
  { id: 'lcb-32', type: 'mushroom', label: '60-Minute Bona Fide Meal Break', isBenefit: true },
  { id: 'lcb-33', type: 'star', label: 'P30k Agabon Nominal Award', isBenefit: true },
  { id: 'lcb-34', type: 'coin', label: 'P50k Jaka Food Nominal Award', isBenefit: true },
  { id: 'lcb-35', type: 'mushroom', label: '1 Month/Yr Redundancy Pay', isBenefit: true },
  { id: 'lcb-36', type: 'star', label: 'Compensable 20-Min Brownout', isBenefit: true },
];

export const LAW_CATCHER_HAZARDS_BANK: LawCatcherTemplateItem[] = [
  { id: 'lch-1', type: 'thwomp', label: 'Mandatory Pregnancy Test', isBenefit: false },
  { id: 'lch-2', type: 'poison', label: 'Diminution of Benefits', isBenefit: false },
  { id: 'lch-3', type: 'thwomp', label: 'Offsetting Undertime w/ OT', isBenefit: false },
  { id: 'lch-4', type: 'poison', label: 'Labor-Only Ghost Agency', isBenefit: false },
  { id: 'lch-5', type: 'thwomp', label: 'Promissory Chit Wages', isBenefit: false },
  { id: 'lch-6', type: 'poison', label: 'Forced Grocery Deduction', isBenefit: false },
  { id: 'lch-7', type: 'thwomp', label: 'Hazardous Minor Night Work', isBenefit: false },
  { id: 'lch-8', type: 'poison', label: 'Kasambahay Placement Fee', isBenefit: false },
  { id: 'lch-9', type: 'thwomp', label: 'Arbitrary Age Ad Ceiling', isBenefit: false },
  { id: 'lch-10', type: 'poison', label: 'Unconsented Meal Deduction', isBenefit: false },
  { id: 'lch-11', type: 'thwomp', label: '5-5-5 Endo Waiver Scheme', isBenefit: false },
  { id: 'lch-12', type: 'poison', label: '15% Mgmt Service Charge Cut', isBenefit: false },
  { id: 'lch-13', type: 'thwomp', label: 'No-Marriage Employment Clause', isBenefit: false },
  { id: 'lch-14', type: 'poison', label: 'Sub-Minimum Apprentice Wages', isBenefit: false },
  { id: 'lch-15', type: 'thwomp', label: 'Verbal Summary Dismissal', isBenefit: false },
  { id: 'lch-16', type: 'poison', label: 'Unpaid 4-Hour On-Call Duty', isBenefit: false },
  { id: 'lch-17', type: 'thwomp', label: 'Zero-Safety Harness Order', isBenefit: false },
  { id: 'lch-18', type: 'poison', label: 'Advance Overtime Waiver', isBenefit: false },
  { id: 'lch-19', type: 'thwomp', label: '30-Day Floating Status Overstay', isBenefit: false },
  { id: 'lch-20', type: 'poison', label: 'Withholding Final Pay Past 30d', isBenefit: false },
  { id: 'lch-21', type: 'thwomp', label: 'Cabo Labor Recruiter Gang', isBenefit: false },
  { id: 'lch-22', type: 'poison', label: 'Unregistered P500k Agency', isBenefit: false },
  { id: 'lch-23', type: 'thwomp', label: 'Garnishment of Minimum Wage', isBenefit: false },
  { id: 'lch-24', type: 'poison', label: 'Deducting Safety Boots Cost', isBenefit: false },
  { id: 'lch-25', type: 'thwomp', label: 'Retaliatory Shift Demotion', isBenefit: false },
  { id: 'lch-26', type: 'poison', label: 'Bypassing 1st Notice to Explain', isBenefit: false },
  { id: 'lch-27', type: 'thwomp', label: 'Denial of SSS Salary Gap', isBenefit: false },
  { id: 'lch-28', type: 'poison', label: 'Deducting Customer Walkout Bills', isBenefit: false },
  { id: 'lch-29', type: 'thwomp', label: 'Forced Undated Resignation Chit', isBenefit: false },
  { id: 'lch-30', type: 'poison', label: 'Unilateral Rice Subsidy Scrap', isBenefit: false },
  { id: 'lch-31', type: 'thwomp', label: '15-Year Non-Commuted SIL Loss', isBenefit: false },
  { id: 'lch-32', type: 'poison', label: '16-Hour Shift Zero Overtime', isBenefit: false },
  { id: 'lch-33', type: 'thwomp', label: 'Denial of 120d Solo Mom Leave', isBenefit: false },
  { id: 'lch-34', type: 'poison', label: 'Refusal to Issue 3-Day COE', isBenefit: false },
  { id: 'lch-35', type: 'thwomp', label: 'Holding Employee ATM Card', isBenefit: false },
  { id: 'lch-36', type: 'poison', label: 'Pre-Employment HIV Test Order', isBenefit: false },
];

export function drawLawCatcherItem(
  isHazard: boolean,
  rng: () => number = Math.random
): LawCatcherTemplateItem {
  return isHazard
    ? drawOneFromDeck('law_catcher_hazards', LAW_CATCHER_HAZARDS_BANK, rng)
    : drawOneFromDeck('law_catcher_benefits', LAW_CATCHER_BENEFITS_BANK, rng);
}

// ============================================================================
// 13. 2D PLATFORMER [?] QUESTION BLOCK DOCTRINES (28 Distinct Doctrines)
// ============================================================================
export const PLATFORMER_2D_DOCTRINES_BANK: string[] = [
  'World 1: Coverage for statutory labor standards starts on Day 1 of employment!',
  'World 1: Field personnel test — actual hours in the field cannot be determined with reasonable certainty.',
  'World 1: Power brownouts of 20 minutes or less are compensable working hours!',
  'World 1: Short rest breaks of 5 to 20 minutes count as compensable hours worked.',
  'World 1: Undertime on one day can NEVER be offset by overtime on another day (Art. 88).',
  'World 1: Night Shift Differential (+10%) applies between 10:00 PM and 6:00 AM (Art. 86).',
  'World 1: Compressed Workweek (CWW) waives daily OT up to 12h/day if voluntary & <=48h/week!',
  'World 2: Worked Regular Holiday = 200% daily wage for the first 8 hours (Art. 94).',
  'World 2: Worked Regular Holiday falling on a Rest Day = 260% daily wage!',
  'World 2: Double Regular Holiday worked on a Rest Day = 390% daily wage!',
  'World 2: Special Non-Working Day follows "No Work, No Pay" unless worked (130% or 150% on RD).',
  'World 2: 13th Month Pay (P.D. 851) = Total Basic Salary Earned / 12, payable on or before Dec 24!',
  'World 3: 100% of collected service charges go to rank-and-file & supervisory workers (R.A. 11360).',
  'World 3: Facilities require 3 requisites to deduct: customary, voluntary written consent, and fair value.',
  'World 3: Supplements (tools, uniforms for employer convenience) are NEVER deductible from wages!',
  'World 3: DOLE D.O. 174 requires at least ₱5,000,000 paid-up capital/net worth for legitimate contracting.',
  'World 3: Labor-only contracting makes the Principal the DIRECT EMPLOYER for all legal purposes!',
  'World 4: Working child below 15 yrs: max 4h/day, 20h/week, no work 8PM–6AM (R.A. 9231).',
  'World 4: Kasambahay (R.A. 10361): 5 days paid SIL after 1 year is non-cumulative & non-convertible to cash.',
  'World 4: Telecommuting employees enjoy full Fair Treatment parity with on-site peers (R.A. 11165).',
  'World 5: Safe Spaces Act (R.A. 11313) penalizes peer-to-peer & subordinate-to-superior harassment!',
  'World 5: Nursing employees get >= 40 mins paid lactation breaks per 8-hour shift (R.A. 10028).',
  'World 6: SIL (Art. 95) 3-year prescription runs from demand/refusal or separation (Auto Bus v. Bautista)!',
  'World 6: Expanded Maternity Leave (R.A. 11210): 105 days live birth (+15 solo parent) or 60d miscarriage!',
  'World 6: Mother may allocate up to 7 Maternity Leave days to the father — married or unmarried!',
  'World 6: Paternity Leave (R.A. 8187): 7 calendar days full pay for first 4 deliveries of legitimate spouse.',
  'World 6: Expanded Solo Parent Leave (R.A. 11861): 7 working days after just 6 months of service!',
  'World 6: Magna Carta Sec. 18 grants up to 2 months full-pay leave after gynecological surgery; RA 9262 grants 10d VAWC leave!',
  'World 1: Waiting time is compensable if waiting is an integral part of work or worker is engaged to wait!',
  'World 1: Health workers in 100+ bed hospitals have a 40-hour / 5-day workweek with +30% pay on Day 6 (Art. 83).',
  'World 2: Successive regular holidays — absent without pay before Holiday 1 forfeits both unless Holiday 1 is worked!',
  'World 2: Retail & service establishments with fewer than 10 regular workers are exempt from Holiday Pay and SIL.',
  'World 3: Wages must be paid in legal tender — promissory notes, vouchers, or chits are strictly prohibited (Art. 102)!',
  'World 3: Wage distortion occurs when a wage order obliterates intentional quantitative pay distinctions between grades.',
  'World 3: Under Art. 110, unpaid workers enjoy first statutory preference in case of employer bankruptcy or liquidation!',
  'World 4: Night workers are entitled to free health assessment and transfer if certified unfit for night work (R.A. 10151).',
  'World 4: Apprentices must be at least 15 years old in an approved apprenticeable trade under TESDA.',
  'World 5: Employers cannot require HIV testing (R.A. 11166) or Hepatitis B negative status as a hiring condition!',
  'World 5: Mental Health Act (R.A. 11036) mandates workplace mental health policies and zero stigma.',
  'World 6: Unused Paternity Leave, Solo Parent Leave, and VAWC Leave are NOT convertible to cash.',
  'World 6: Optional retirement starts at age 60 and compulsory retirement at age 65 with >= 5 years service (R.A. 7641).',
];

export function drawPlatformer2DDoctrine(rng: () => number = Math.random): string {
  return drawOneFromDeck('platformer_2d_doctrines', PLATFORMER_2D_DOCTRINES_BANK, rng);
}

// ============================================================================
// 14. KOOPA SHELL BRICK BREAKER QUESTION BANK (20 Distinct Items + Shuffled Choices)
// ============================================================================
export interface BrickBreakerQuestionItem {
  id: string;
  q: string;
  opts: string[];
  correct: number;
  cite: string;
}

export const BRICK_BREAKER_QUESTION_BANK: BrickBreakerQuestionItem[] = [
  {
    id: 'bb-1',
    q: 'Normal hours of work of any covered employee shall NOT exceed:',
    opts: ['6 hours a day', '8 hours a day', '10 hours a day', '12 hours a day'],
    correct: 1,
    cite: 'Art. 83, Labor Code',
  },
  {
    id: 'bb-2',
    q: 'Night Shift Differential of at least +10% applies to work between:',
    opts: ['8:00 PM – 4:00 AM', '9:00 PM – 5:00 AM', '10:00 PM – 6:00 AM', '11:00 PM – 7:00 AM'],
    correct: 2,
    cite: 'Art. 86, Labor Code',
  },
  {
    id: 'bb-3',
    q: 'Regular meal period under Article 85 shall NOT be less than:',
    opts: ['15 minutes time-off', '30 minutes time-off', '45 minutes time-off', '60 minutes time-off'],
    correct: 3,
    cite: 'Art. 85, Labor Code',
  },
  {
    id: 'bb-4',
    q: 'Overtime work on an ordinary working day is paid an additional:',
    opts: ['+10% of hourly rate', '+20% of hourly rate', '+25% of hourly rate', '+30% of hourly rate'],
    correct: 2,
    cite: 'Art. 87, Labor Code',
  },
  {
    id: 'bb-5',
    q: 'Minimum weekly rest day after 6 consecutive normal workdays is at least:',
    opts: ['12 consecutive hours', '18 consecutive hours', '24 consecutive hours', '36 consecutive hours'],
    correct: 2,
    cite: 'Art. 91, Labor Code',
  },
  {
    id: 'bb-6',
    q: 'Service Incentive Leave after 1 year of service under Article 95 is:',
    opts: ['3 days with pay', '5 days with pay', '7 days with pay', '10 days with pay'],
    correct: 1,
    cite: 'Art. 95, Labor Code',
  },
  {
    id: 'bb-7',
    q: 'Expanded Maternity Leave for live childbirth (non-solo parent) is:',
    opts: ['60 days full pay', '78 days full pay', '105 days full pay', '120 days full pay'],
    correct: 2,
    cite: 'R.A. 11210 Sec. 3',
  },
  {
    id: 'bb-8',
    q: 'Collected service charges distributed to covered workers under R.A. 11360:',
    opts: ['75% to workers', '85% to workers', '90% to workers', '100% to workers'],
    correct: 3,
    cite: 'Art. 96 as amended by R.A. 11360',
  },
  {
    id: 'bb-9',
    q: 'Paternity Leave for legitimate spouse’s delivery covers up to:',
    opts: ['7 days (first 4 deliveries)', '7 days (unlimited)', '14 days (first 2 deliveries)', '5 days (first 4 deliveries)'],
    correct: 0,
    cite: 'R.A. 8187 Sec. 2',
  },
  {
    id: 'bb-10',
    q: 'Substantial capital threshold for legitimate contracting under DO 174-17:',
    opts: ['₱1,000,000 capital', '₱3,000,000 capital', '₱5,000,000 capital', '₱10,000,000 capital'],
    correct: 2,
    cite: 'DOLE D.O. 174-17 Sec. 3(l)',
  },
  {
    id: 'bb-11',
    q: '13th Month Pay under P.D. 851 must be paid to rank-and-file workers not later than:',
    opts: ['November 30', 'December 15', 'December 24', 'December 31'],
    correct: 2,
    cite: 'P.D. No. 851',
  },
  {
    id: 'bb-12',
    q: 'Paid lactation breaks for nursing employees per 8-hour shift must total at least:',
    opts: ['15 minutes paid', '20 minutes paid', '40 minutes paid', '60 minutes paid'],
    correct: 2,
    cite: 'R.A. 10028 Sec. 12',
  },
  {
    id: 'bb-13',
    q: 'Power brownouts / interruptions are compensable hours worked if NOT exceeding:',
    opts: ['10 minutes', '20 minutes', '30 minutes', '45 minutes'],
    correct: 1,
    cite: 'Omnibus Rules Book III',
  },
  {
    id: 'bb-14',
    q: 'Special Leave Benefit following gynecological surgery under R.A. 9710 is up to:',
    opts: ['15 calendar days', '30 calendar days', '2 months full pay', '3 months half pay'],
    correct: 2,
    cite: 'R.A. 9710 Sec. 18',
  },
  {
    id: 'bb-15',
    q: 'Anti-VAWC paid leave under R.A. 9262 with a Protection Order certification is:',
    opts: ['Up to 5 paid days', 'Up to 7 paid days', 'Up to 10 paid days', 'Up to 15 paid days'],
    correct: 2,
    cite: 'R.A. 9262 Sec. 43',
  },
  {
    id: 'bb-16',
    q: 'Expanded Solo Parent Leave of 7 working days requires minimum service of:',
    opts: ['3 months service', '6 months service', '12 months service', '24 months service'],
    correct: 1,
    cite: 'R.A. 11861 Sec. 8',
  },
  {
    id: 'bb-17',
    q: 'Daily pay rate for 8 hours worked on a Regular Holiday falling on a Rest Day:',
    opts: ['200% daily wage', '230% daily wage', '260% daily wage', '300% daily wage'],
    correct: 2,
    cite: 'Art. 94, Labor Code',
  },
  {
    id: 'bb-18',
    q: 'Daily pay rate for 8 hours worked on a Special Non-Working Day:',
    opts: ['100% daily wage', '125% daily wage', '130% daily wage', '150% daily wage'],
    correct: 2,
    cite: 'Art. 93, Labor Code',
  },
  {
    id: 'bb-19',
    q: 'Statutory minimum retirement pay factor per year of service under R.A. 7641:',
    opts: ['15 days / year', '20 days / year', '22.5 days / year', '30 days / year'],
    correct: 2,
    cite: 'Art. 302 (R.A. 7641)',
  },
  {
    id: 'bb-20',
    q: 'Minimum employable age for a domestic worker (Kasambahay) under R.A. 10361:',
    opts: ['15 years old', '16 years old', '18 years old', '21 years old'],
    correct: 0,
    cite: 'R.A. 10361 Sec. 16',
  },
  {
    id: 'bb-21',
    q: 'Maximum daily hours under an approved Compressed Workweek (CWW) scheme without statutory overtime liability:',
    opts: ['10 hours / day', '12 hours / day', '14 hours / day', '16 hours / day'],
    correct: 1,
    cite: 'DOLE Advisory No. 02-04',
  },
  {
    id: 'bb-22',
    q: 'Mandatory distribution interval of collected Service Charges to covered rank-and-file workers under R.A. 11360:',
    opts: ['Once every week', 'Once every 2 weeks (twice a month)', 'Once every month', 'Once every quarter'],
    correct: 1,
    cite: 'R.A. 11360 (Art. 96)',
  },
  {
    id: 'bb-23',
    q: 'Paid paternity leave benefit granted to married male employees under R.A. 8187:',
    opts: ['5 working days', '7 calendar days', '10 working days', '14 calendar days'],
    correct: 1,
    cite: 'R.A. 8187 Sec. 3',
  },
  {
    id: 'bb-24',
    q: 'Minimum continuous service required for a solo parent to avail 7 days paid parental leave under R.A. 11861:',
    opts: ['3 months', '6 months', '12 months', '24 months'],
    correct: 1,
    cite: 'R.A. 11861 Sec. 8',
  },
  {
    id: 'bb-25',
    q: 'Statutory paid leave granted to female employees who are victims of Violence Against Women & Children under R.A. 9262:',
    opts: ['5 days', '7 days', '10 days (extendible per TPO/PPO)', '15 days'],
    correct: 2,
    cite: 'R.A. 9262 Sec. 43',
  },
  {
    id: 'bb-26',
    q: 'Maximum paid leave benefit granted under the Magna Carta of Women following surgery for gynecological disorders:',
    opts: ['1 month with full pay', 'Up to 2 months (60 days) with full pay', '75 days with half pay', '90 days with SSS benefits'],
    correct: 1,
    cite: 'R.A. 9710 Sec. 18',
  },
  {
    id: 'bb-27',
    q: 'Minimum service period required before an employee becomes entitled to 5 days Service Incentive Leave (SIL):',
    opts: ['6 months of service', '1 year of service (at least 12 months)', '18 months of service', '2 years of service'],
    correct: 1,
    cite: 'Art. 95, Labor Code',
  },
  {
    id: 'bb-28',
    q: 'Statutory overtime multiplier for work performed in excess of 8 hours on a Special Non-Working Day:',
    opts: ['130% of hourly wage', '150% of hourly wage', '169% of regular hourly wage (130% × 1.30)', '200% of hourly wage'],
    correct: 2,
    cite: 'Art. 87 + Art. 93',
  },
  {
    id: 'bb-29',
    q: 'Statutory overtime multiplier for work rendered in excess of 8 hours on a regular holiday:',
    opts: ['200% of hourly wage', '230% of hourly wage', '260% of regular hourly wage (200% × 1.30)', '300% of hourly wage'],
    correct: 2,
    cite: 'Art. 87 + Art. 94',
  },
  {
    id: 'bb-30',
    q: 'Total compensation multiplier for work performed on a Double Regular Holiday falling on a scheduled Rest Day:',
    opts: ['300% of daily rate', '330% of daily rate', '360% of daily rate', '390% of basic daily rate (300% × 1.30)'],
    correct: 3,
    cite: 'DOLE Handbook on Benefits',
  },
  {
    id: 'bb-31',
    q: 'Statutory deadline for employers to release mandatory 13th Month Pay under Presidential Decree No. 851:',
    opts: ['December 15', 'December 20', 'On or before December 24', 'December 31'],
    correct: 2,
    cite: 'P.D. 851 Sec. 1',
  },
  {
    id: 'bb-32',
    q: 'Substantial capital threshold required of legitimate independent contractors under DOLE Department Order No. 174-17:',
    opts: ['P1,000,000 paid-up capital', 'P3,000,000 paid-up capital', 'At least P5,000,000 paid-up capital or net worth', 'P10,000,000 paid-up capital'],
    correct: 2,
    cite: 'D.O. 174-17 Sec. 3(l)',
  },
  {
    id: 'bb-33',
    q: 'Statutory prescriptive period for pure money claims arising from employer-employee relations under Art. 306:',
    opts: ['1 year from accrual', '2 years from demand', '3 years from accrual of cause of action', '4 years from separation'],
    correct: 2,
    cite: 'Art. 306, Labor Code',
  },
  {
    id: 'bb-34',
    q: 'Controlling prescriptive period for filing an Illegal Dismissal complaint under Art. 1146 of the Civil Code:',
    opts: ['1 year from termination', '2 years from termination', '3 years from termination', '4 years from dismissal (injury to rights)'],
    correct: 3,
    cite: 'Callanta v. Carnation (Art. 1146)',
  },
  {
    id: 'bb-35',
    q: 'Prescriptive period for filing an administrative or civil unfair labor practice (ULP) complaint under Art. 305:',
    opts: ['1 year from accrual of the alleged ULP offense', '2 years from occurrence', '3 years from notice', '4 years from separation'],
    correct: 0,
    cite: 'Art. 305, Labor Code',
  },
  {
    id: 'bb-36',
    q: 'Controlling nominal damages awarded to an employee dismissed for just cause but denied statutory procedural due process:',
    opts: ['P10,000 nominal damages', 'P30,000 nominal damages (Agabon doctrine)', 'P50,000 nominal damages', 'Full backwages without reinstatement'],
    correct: 1,
    cite: 'Agabon v. NLRC (2004)',
  },
  {
    id: 'bb-37',
    q: 'Controlling nominal damages awarded to an employee dismissed for authorized cause without the 30-day statutory notice:',
    opts: ['P10,000 nominal damages', 'P30,000 nominal damages', 'P50,000 nominal damages (Jaka Food doctrine)', 'P100,000 punitive damages'],
    correct: 2,
    cite: 'Jaka Food v. Pacot (2005)',
  },
  {
    id: 'bb-38',
    q: 'Statutory minimum separation pay for authorized termination due to retrenchment to prevent serious losses under Art. 298:',
    opts: ['1/4 month per year of service', '1/2 month per year of service (or 1 month, whichever higher)', '1 full month per year of service', '2 months per year of service'],
    correct: 1,
    cite: 'Art. 298, Labor Code',
  },
  {
    id: 'bb-39',
    q: 'Statutory minimum separation pay for authorized termination due to installation of labor-saving devices or redundancy:',
    opts: ['1/2 month per year of service', '1 month pay or 1 month per year of service (whichever is higher)', '1.5 months per year of service', '2 months per year of service'],
    correct: 1,
    cite: 'Art. 298, Labor Code',
  },
  {
    id: 'bb-40',
    q: 'Maximum statutory interval allowed between wage payments under Article 103 of the Philippine Labor Code:',
    opts: ['7 days', '10 days', '15 days', 'Not exceeding 16 days'],
    correct: 3,
    cite: 'Art. 103, Labor Code',
  },
];

export function drawBrickBreakerQuestions(
  count: number,
  rng: () => number = Math.random
): BrickBreakerQuestionItem[] {
  return drawUniqueFromDeck('brick_breaker_questions', BRICK_BREAKER_QUESTION_BANK, count, rng).map(
    (item) => {
      const shuffled = shuffleChoiceOptions(item.opts, item.correct, rng);
      return {
        ...item,
        opts: shuffled.options,
        correct: shuffled.correctIndex,
      };
    }
  );
}

// ============================================================================
// 15. YOSHI'S STATUTORY EGG TOSS BANK (24 Distinct Rounds + Shuffled 4-Cloud Choices)
// ============================================================================
export interface YoshiEggRoundItem {
  id: string;
  prompt: string;
  options: [string, string, string, string];
  correctIdx: number;
  note: string;
}

export const YOSHI_EGG_ROUNDS_BANK: YoshiEggRoundItem[] = [
  {
    id: 'yoshi-1',
    prompt: 'Regular Holiday Worked (First 8 Hours)',
    options: ['130% Pay', '150% Pay', '200% Pay', '260% Pay'],
    correctIdx: 2,
    note: 'Art. 94: Working on a Regular Holiday pays 200% for the first 8 hours.',
  },
  {
    id: 'yoshi-2',
    prompt: 'Regular Holiday Worked ON A REST DAY',
    options: ['200% Pay', '230% Pay', '260% Pay', '300% Pay'],
    correctIdx: 2,
    note: '200% Holiday rate × 1.30 Rest Day premium = 260%!',
  },
  {
    id: 'yoshi-3',
    prompt: 'Special Non-Working Day Worked (Ordinary Day)',
    options: ['100% Pay', '125% Pay', '130% Pay', '150% Pay'],
    correctIdx: 2,
    note: 'Art. 93: Special Non-Working Day worked pays +30% premium (130%).',
  },
  {
    id: 'yoshi-4',
    prompt: 'Special Non-Working Day Worked ON A REST DAY',
    options: ['130% Pay', '150% Pay', '195% Pay', '200% Pay'],
    correctIdx: 1,
    note: 'Art. 93(c): Special Day falling on Rest Day pays +50% premium (150%).',
  },
  {
    id: 'yoshi-5',
    prompt: 'Double Regular Holiday Worked (Ordinary Day)',
    options: ['200% Pay', '260% Pay', '300% Pay', '390% Pay'],
    correctIdx: 2,
    note: 'DOLE Handbook: Working on a Double Regular Holiday pays 300%!',
  },
  {
    id: 'yoshi-6',
    prompt: 'Double Regular Holiday Worked ON A REST DAY',
    options: ['300% Pay', '330% Pay', '360% Pay', '390% Pay'],
    correctIdx: 3,
    note: '300% Double Holiday × 1.30 Rest Day = 390%!',
  },
  {
    id: 'yoshi-7',
    prompt: 'VAWC Paid Leave Entitlement (R.A. 9262)',
    options: ['5 Days', '7 Days', '10 Days', '15 Days'],
    correctIdx: 2,
    note: 'Sec. 43, R.A. 9262 grants up to 10 paid VAWC leave days (extendible per Protection Order).',
  },
  {
    id: 'yoshi-8',
    prompt: 'Expanded Solo Parent Leave Service Requirement',
    options: ['3 Months', '6 Months', '12 Months', '24 Months'],
    correctIdx: 1,
    note: 'R.A. 11861 reduced the service requirement from 1 year down to 6 months!',
  },
  {
    id: 'yoshi-9',
    prompt: 'Gynecological Surgery Special Leave (R.A. 9710)',
    options: ['15 Days', '30 Days', '2 Months', '105 Days'],
    correctIdx: 2,
    note: 'Sec. 18, Magna Carta of Women grants up to 2 months leave with full pay.',
  },
  {
    id: 'yoshi-10',
    prompt: 'Miscarriage / Emergency Termination Leave',
    options: ['30 Days', '45 Days', '60 Days', '105 Days'],
    correctIdx: 2,
    note: 'R.A. 11210 grants 60 calendar days with full pay for miscarriage or ETP.',
  },
  {
    id: 'yoshi-11',
    prompt: 'Ordinary Day Overtime Rate (Beyond 8 Hours)',
    options: ['110% Hrly', '125% Hrly', '130% Hrly', '150% Hrly'],
    correctIdx: 1,
    note: 'Art. 87: Ordinary workday overtime pays +25% (125% of basic hourly rate).',
  },
  {
    id: 'yoshi-12',
    prompt: 'Rest Day Overtime Rate (Beyond 8 Hours)',
    options: ['130% Hrly', '150% Hrly', '169% Hrly', '200% Hrly'],
    correctIdx: 2,
    note: '130% Rest Day rate × 1.30 Overtime multiplier = 169% of basic hourly rate!',
  },
  {
    id: 'yoshi-13',
    prompt: 'Regular Holiday Overtime Rate (Beyond 8 Hours)',
    options: ['200% Hrly', '230% Hrly', '250% Hrly', '260% Hrly'],
    correctIdx: 3,
    note: '200% Holiday rate × 1.30 Overtime multiplier = 260% of basic hourly rate!',
  },
  {
    id: 'yoshi-14',
    prompt: 'Night Shift Differential Window (Art. 86)',
    options: ['8PM–4AM', '9PM–5AM', '10PM–6AM', '11PM–7AM'],
    correctIdx: 2,
    note: 'Art. 86 mandates at least +10% Night Shift Differential from 10:00 PM to 6:00 AM.',
  },
  {
    id: 'yoshi-15',
    prompt: 'Service Incentive Leave After 1 Year (Art. 95)',
    options: ['3 Days', '5 Days', '7 Days', '10 Days'],
    correctIdx: 1,
    note: 'Art. 95 grants 5 days paid SIL per year, commutable to cash if unused.',
  },
  {
    id: 'yoshi-16',
    prompt: 'Live Childbirth Maternity Leave (Solo Parent)',
    options: ['90 Days', '105 Days', '120 Days', '135 Days'],
    correctIdx: 2,
    note: 'R.A. 11210: 105 days standard + 15 days solo parent = 120 paid calendar days!',
  },
  {
    id: 'yoshi-17',
    prompt: 'Transferable Maternity Days to Child’s Father',
    options: ['Up to 3d', 'Up to 5d', 'Up to 7d', 'Up to 14d'],
    correctIdx: 2,
    note: 'R.A. 11210 lets the mother allocate up to 7 paid days to the father (married or not).',
  },
  {
    id: 'yoshi-18',
    prompt: 'Service Charge Share for Workers (R.A. 11360)',
    options: ['75% Share', '85% Share', '90% Share', '100% Share'],
    correctIdx: 3,
    note: 'R.A. 11360 mandates 100% distribution of service charges to covered workers!',
  },
  {
    id: 'yoshi-19',
    prompt: 'Substantial Capital under D.O. 174-17',
    options: ['₱1M Cap', '₱3M Cap', '₱5M Cap', '₱10M Cap'],
    correctIdx: 2,
    note: 'DOLE D.O. 174-17 requires at least ₱5,000,000 paid-up capital or net worth.',
  },
  {
    id: 'yoshi-20',
    prompt: '13th Month Pay Statutory Deadline (P.D. 851)',
    options: ['Nov 30', 'Dec 15', 'Dec 24', 'Dec 31'],
    correctIdx: 2,
    note: 'P.D. 851 requires payment of 13th Month Pay on or before December 24.',
  },
  {
    id: 'yoshi-21',
    prompt: 'Paid Lactation Break per 8-Hr Shift (R.A. 10028)',
    options: ['15 Mins', '25 Mins', '40 Mins', '60 Mins'],
    correctIdx: 2,
    note: 'R.A. 10028 mandates at least 40 compensable minutes per 8-hour shift.',
  },
  {
    id: 'yoshi-22',
    prompt: 'Compensable Power Brownout Threshold',
    options: ['<=10 Mins', '<=20 Mins', '<=30 Mins', '<=45 Mins'],
    correctIdx: 1,
    note: 'Power interruptions not exceeding 20 minutes are treated as compensable hours worked.',
  },
  {
    id: 'yoshi-23',
    prompt: 'Retirement Pay Days per Year of Service',
    options: ['15 Days', '20 Days', '22.5 Days', '30 Days'],
    correctIdx: 2,
    note: 'R.A. 7641: 15 days + 5 days SIL + 2.5 days (1/12 of 13th month) = 22.5 days!',
  },
  {
    id: 'yoshi-24',
    prompt: 'Unworked Regular Holiday Pay (Eligible Worker)',
    options: ['0% Pay', '50% Pay', '100% Pay', '200% Pay'],
    correctIdx: 2,
    note: 'Art. 94: Eligible employees earn 100% daily wage even on an unworked Regular Holiday.',
  },
  {
    id: 'yoshi-25',
    prompt: 'Overtime Rate on Ordinary Working Day',
    options: ['110% Rate', '125% Rate', '130% Rate', '150% Rate'],
    correctIdx: 1,
    note: 'Art. 87: Ordinary day overtime pays regular hourly rate plus 25% (125%).',
  },
  {
    id: 'yoshi-26',
    prompt: 'Night Shift Differential Minimum Rate',
    options: ['+5% Rate', '+10% Rate', '+15% Rate', '+25% Rate'],
    correctIdx: 1,
    note: 'Art. 86: NSD pays at least +10% per hour for work rendered between 10:00 PM and 6:00 AM.',
  },
  {
    id: 'yoshi-27',
    prompt: 'Overtime on a Scheduled Rest Day',
    options: ['130% Rate', '150% Rate', '169% Rate', '200% Rate'],
    correctIdx: 2,
    note: 'Art. 87 + Art. 93: 130% rest day rate × 1.30 overtime multiplier = 169% hourly rate!',
  },
  {
    id: 'yoshi-28',
    prompt: 'Overtime on a Regular Holiday',
    options: ['200% Rate', '230% Rate', '260% Rate', '300% Rate'],
    correctIdx: 2,
    note: 'Art. 87 + Art. 94: 200% holiday base × 1.30 overtime multiplier = 260% hourly rate!',
  },
  {
    id: 'yoshi-29',
    prompt: 'Special Non-Working Day on Rest Day OVERTIME',
    options: ['150% Rate', '180% Rate', '195% Rate', '225% Rate'],
    correctIdx: 2,
    note: 'Art. 93(c): 150% base × 1.30 overtime multiplier = 195% hourly wage!',
  },
  {
    id: 'yoshi-30',
    prompt: 'Double Regular Holiday Overtime (Ordinary Day)',
    options: ['300% Rate', '330% Rate', '360% Rate', '390% Rate'],
    correctIdx: 3,
    note: 'DOLE Handbook: 300% double holiday base × 1.30 overtime multiplier = 390%!',
  },
  {
    id: 'yoshi-31',
    prompt: 'Double Regular Holiday Worked on Rest Day',
    options: ['300% Rate', '330% Rate', '360% Rate', '390% Rate'],
    correctIdx: 3,
    note: 'DOLE Handbook: 300% double holiday rate × 1.30 rest day premium = 390% daily wage!',
  },
  {
    id: 'yoshi-32',
    prompt: 'Double Regular Holiday on Rest Day OVERTIME',
    options: ['390% Rate', '450% Rate', '507% Rate', '520% Rate'],
    correctIdx: 2,
    note: '390% base rate × 1.30 overtime multiplier = 507% of regular hourly wage!',
  },
  {
    id: 'yoshi-33',
    prompt: 'Service Incentive Leave Annual Entitlement',
    options: ['3 Days Pay', '5 Days Pay', '7 Days Pay', '10 Days Pay'],
    correctIdx: 1,
    note: 'Art. 95: At least 5 days paid leave after 1 full year of continuous service.',
  },
  {
    id: 'yoshi-34',
    prompt: 'Maternity Leave Paid Days (Normal/CS Delivery)',
    options: ['60 Days Pay', '78 Days Pay', '105 Days Pay', '120 Days Pay'],
    correctIdx: 2,
    note: 'R.A. 11210: 105 days paid maternity leave regardless of delivery mode (+15d for solo parents).',
  },
  {
    id: 'yoshi-35',
    prompt: 'Paternity Leave Benefit for Married Male Employee',
    options: ['3 Days Pay', '5 Days Pay', '7 Days Pay', '10 Days Pay'],
    correctIdx: 2,
    note: 'R.A. 8187: 7 days full pay for first 4 deliveries or miscarriages of cohabiting spouse.',
  },
  {
    id: 'yoshi-36',
    prompt: 'Battered Woman Paid Leave Benefit (R.A. 9262)',
    options: ['5 Days Pay', '7 Days Pay', '10 Days Pay', '15 Days Pay'],
    correctIdx: 2,
    note: 'Sec. 43, R.A. 9262: 10 days with full pay, extendible as specified in protection order.',
  },
];

export function drawYoshiEggRounds(
  count: number,
  rng: () => number = Math.random
): YoshiEggRoundItem[] {
  return drawUniqueFromDeck('yoshi_egg_rounds', YOSHI_EGG_ROUNDS_BANK, count, rng).map((item) => {
    const shuffled = shuffleChoiceOptions(item.options, item.correctIdx, rng);
    return {
      ...item,
      options: [
        shuffled.options[0],
        shuffled.options[1],
        shuffled.options[2],
        shuffled.options[3],
      ],
      correctIdx: shuffled.correctIndex,
    };
  });
}

// ============================================================================
// 16. BOO'S BURDEN OF PROOF MANSION BANK (20 Distinct Cases)
// ============================================================================
export interface BooBurdenCaseItem {
  id: string;
  dispute: string;
  detail: string;
  burden: 'employer' | 'employee';
  explanation: string;
}

export const BOO_BURDEN_CASES_BANK: BooBurdenCaseItem[] = [
  {
    id: 'boo-1',
    dispute: 'Payment of Basic Wages, Holiday Pay & SIL',
    detail: 'Worker alleges non-payment of regular minimum wages, holiday pay, and 5-day Service Incentive Leave.',
    burden: 'employer',
    explanation: 'EMPLOYER bears the burden! Payrolls, vouchers, and daily time records are in the employer’s custody (Minsola v. New City Builders).',
  },
  {
    id: 'boo-2',
    dispute: 'Fact of Rendering Overtime Work',
    detail: 'Worker claims unpaid overtime pay for allegedly working 2 extra hours every night for 2 years.',
    burden: 'employee',
    explanation: 'EMPLOYEE bears the burden! Overtime is never presumed; the worker must first prove overtime was actually rendered.',
  },
  {
    id: 'boo-3',
    dispute: 'Validity of Dismissal (Just / Authorized Cause)',
    detail: 'Terminated worker files an illegal dismissal complaint; company claims serious misconduct.',
    burden: 'employer',
    explanation: 'EMPLOYER bears the burden to prove by substantial evidence that dismissal was for a valid cause and with due process!',
  },
  {
    id: 'boo-4',
    dispute: 'Fact of Dismissal Before Validity Is Questioned',
    detail: 'Company denies firing the worker and shows a return-to-work order; worker claims verbal firing.',
    burden: 'employee',
    explanation: 'EMPLOYEE must first establish the fact of dismissal by positive and overt acts before the employer proves valid cause (Brown Madonna Press).',
  },
  {
    id: 'boo-5',
    dispute: 'Payment of 13th Month Pay (P.D. 851)',
    detail: 'Rank-and-file employee alleges non-payment of statutory 13th Month Pay for the calendar year.',
    burden: 'employer',
    explanation: 'EMPLOYER bears the burden of proving payment of mandatory statutory benefits like 13th Month Pay.',
  },
  {
    id: 'boo-6',
    dispute: 'Existence of Employer-Employee Relationship',
    detail: 'Claimant asserts they were an employee of ABC Corp., which denies ever hiring or controlling them.',
    burden: 'employee',
    explanation: 'EMPLOYEE/CLAIMANT asserting the existence of an employment relationship bears the initial burden of proving it via substantial evidence.',
  },
  {
    id: 'boo-7',
    dispute: 'Legitimacy of Independent Job Contractor (D.O. 174)',
    detail: 'Principal claims deployed workers belong to an independent contractor, not the principal.',
    burden: 'employer',
    explanation: 'EMPLOYER/PRINCIPAL bears the burden! Contractors are presumed labor-only unless substantial capital/investment and control are proven.',
  },
  {
    id: 'boo-8',
    dispute: 'Entitlement to Discretionary Performance Bonus',
    detail: 'Worker demands a management productivity bonus claiming it is due over and above statutory pay.',
    burden: 'employee',
    explanation: 'EMPLOYEE bears the burden of proving a non-statutory bonus ripened into an enforceable company practice or CBA obligation.',
  },
  {
    id: 'boo-9',
    dispute: 'Voluntariness of Resignation Letter',
    detail: 'Employer invokes a signed resignation letter as defense against an illegal dismissal complaint.',
    burden: 'employer',
    explanation: 'EMPLOYER invoking resignation bears the burden of proving the employee voluntarily and knowingly resigned ( Paredes v. Feed the Children ).',
  },
  {
    id: 'boo-10',
    dispute: 'Abandonment of Work as Ground for Dismissal',
    detail: 'Company claims worker abandoned their job after 4 days of absence without official leave (AWOL).',
    burden: 'employer',
    explanation: 'EMPLOYER must prove BOTH unjustified absence AND overt acts showing clear intent to sever the employment relationship!',
  },
  {
    id: 'boo-11',
    dispute: 'Actual Rendition of Night Shift Hours',
    detail: 'Day-shift clerk claims Night Shift Differential for allegedly staying past 10:00 PM on unrecorded dates.',
    burden: 'employee',
    explanation: 'EMPLOYEE must first prove that work was actually performed between 10:00 PM and 6:00 AM before differential pay attaches.',
  },
  {
    id: 'boo-12',
    dispute: 'Valid Project Employment Status',
    detail: 'Construction firm claims terminated carpenter was hired for a specific project only, not as a regular worker.',
    burden: 'employer',
    explanation: 'EMPLOYER bears the burden of proving project scope and duration were clearly communicated at the time of engagement!',
  },
  {
    id: 'boo-13',
    dispute: 'Communication of Probationary Standards on Day 1',
    detail: 'Company terminates a probationary staffer at Month 5 for failing to meet company standards.',
    burden: 'employer',
    explanation: 'EMPLOYER must prove reasonable regularization standards were made known at the time of engagement; otherwise, worker is regular!',
  },
  {
    id: 'boo-14',
    dispute: 'Lawfulness of Facility Deduction from Wages',
    detail: 'Employer deducted ₱2,500/month for staff meals and lodging from minimum-wage workers.',
    burden: 'employer',
    explanation: 'EMPLOYER must prove all 3 Mabeza requisites: customary benefit, voluntary written acceptance, and fair reasonable value!',
  },
  {
    id: 'boo-15',
    dispute: 'Claim for Moral & Exemplary Damages',
    detail: 'Dismissed worker seeks ₱200,000 moral damages alleging bad faith and public humiliation.',
    burden: 'employee',
    explanation: 'EMPLOYEE must prove by clear and convincing evidence that dismissal was attended by bad faith, fraud, or oppressive conduct.',
  },
  {
    id: 'boo-16',
    dispute: 'Serious Business Losses in Retrenchment (Art. 298)',
    detail: 'Company retrenches 30 workers citing financial downturn and declining revenues.',
    burden: 'employer',
    explanation: 'EMPLOYER must prove substantial actual or imminent losses via independently audited financial statements!',
  },
  {
    id: 'boo-17',
    dispute: 'Good Faith in Abolishing Redundant Positions',
    detail: 'Employer abolishes 4 supervisor posts due to reorganization and staffing duplication.',
    burden: 'employer',
    explanation: 'EMPLOYER bears the burden of proving good faith and fair, reasonable criteria (efficiency, seniority, status) in redundancy.',
  },
  {
    id: 'boo-18',
    dispute: 'Entitlement to Unpaid Sales Commissions',
    detail: 'Sales agent demands 5% override commission on accounts allegedly closed personally.',
    burden: 'employee',
    explanation: 'EMPLOYEE claiming non-statutory sales commissions must first prove the governing agreement and actual closing of qualifying sales.',
  },
  {
    id: 'boo-19',
    dispute: 'Remittance of SSS, PhilHealth & Pag-IBIG Contributions',
    detail: 'Employee complains that statutory social welfare contributions were not remitted.',
    burden: 'employer',
    explanation: 'EMPLOYER has the statutory duty and custody of official remittance receipts to prove timely SSS/PhilHealth/Pag-IBIG payment!',
  },
  {
    id: 'boo-20',
    dispute: 'Constructive Dismissal via Coerced Quitclaim',
    detail: 'Employee already signed a notarized quitclaim but claims the consideration was unconscionably low.',
    burden: 'employer',
    explanation: 'EMPLOYER relying on a quitclaim bears the burden of proving it was voluntary, without fraud, and for reasonable consideration!',
  },
  {
    id: 'boo-21',
    dispute: 'Just Cause for Serious Misconduct (Art. 297)',
    detail: 'Employer dismisses warehouse worker for alleged altercations on company premises.',
    burden: 'employer',
    explanation: 'EMPLOYER must prove by substantial evidence that the misconduct was serious and directly related to employee duties.',
  },
  {
    id: 'boo-22',
    dispute: 'Rendering Actual Overtime Hours Worked',
    detail: 'Factory technician claims 120 uncompensated overtime hours rendered over the last 6 months.',
    burden: 'employee',
    explanation: 'EMPLOYEE claiming unpaid overtime must first prove with substantial evidence that excess work was actually rendered!',
  },
  {
    id: 'boo-23',
    dispute: 'Full Payment of Statutory Daily Basic Wages',
    detail: 'Cashier claims basic wages were unpaid for two payroll cycles.',
    burden: 'employer',
    explanation: 'EMPLOYER has custody of all payroll records and must present signed payslips to prove payment of basic wages!',
  },
  {
    id: 'boo-24',
    dispute: 'Work Performed on Scheduled Rest Day',
    detail: 'Security guard claims premium compensation for working 4 scheduled rest days in March.',
    burden: 'employee',
    explanation: 'EMPLOYEE must substantiate actual shift rendering and performance of duties on the designated rest day.',
  },
  {
    id: 'boo-25',
    dispute: 'Voluntariness of Employee Resignation',
    detail: 'Staff files constructive dismissal after signing resignation under alleged threat of criminal prosecution.',
    burden: 'employer',
    explanation: 'EMPLOYER must prove that the resignation was voluntary, informed, and free from coercion, intimidation, or duress!',
  },
  {
    id: 'boo-26',
    dispute: 'Existence of Four-Fold Employment Relationship',
    detail: 'Delivery courier files money claims against logistics platform claiming regular employee status.',
    burden: 'employee',
    explanation: 'EMPLOYEE who asserts employment status has the initial burden to establish the Four-Fold Test by substantial evidence!',
  },
  {
    id: 'boo-27',
    dispute: 'Legitimacy of Independent Contracting (D.O. 174)',
    detail: 'Labor union charges principal and agency with prohibited labor-only contracting.',
    burden: 'employer',
    explanation: 'EMPLOYER (principal and contractor) bears the burden of proving substantial capital and absence of control over means.',
  },
  {
    id: 'boo-28',
    dispute: 'Compliance with Two-Notice Due Process Rule',
    detail: 'Dismissed teller asserts failure to receive initial Notice of Charge before termination.',
    burden: 'employer',
    explanation: 'EMPLOYER must present proof of actual service of Notice of Charge with 5-day rebuttal window and Notice of Dismissal!',
  },
  {
    id: 'boo-29',
    dispute: 'Valid Abandonment of Employment',
    detail: 'Company defends dismissal claiming employee deserted workstation without leave.',
    burden: 'employer',
    explanation: 'EMPLOYER must prove both elements of abandonment: failure to report without justifiable reason AND overt intent to sever relations.',
  },
  {
    id: 'boo-30',
    dispute: 'Payment of Mandatory 13th Month Pay',
    detail: 'Office encoder claims 13th month pay was omitted from annual compensation.',
    burden: 'employer',
    explanation: 'EMPLOYER holds custody of official financial disbursements and must prove full statutory 13th month distribution!',
  },
  {
    id: 'boo-31',
    dispute: 'Commission of Sexual Harassment (R.A. 7877)',
    detail: 'Intern claims supervisor demanded romantic companionship as condition for training sign-off.',
    burden: 'employee',
    explanation: 'EMPLOYEE (complainant) bears the burden of establishing the sexual demand or hostile work environment by substantial evidence.',
  },
  {
    id: 'boo-32',
    dispute: 'Bona Fide Occupational Qualification (BFOQ)',
    detail: 'Airline defends height and visual acuity criteria against discrimination complaints.',
    burden: 'employer',
    explanation: 'EMPLOYER defending discriminatory hiring criteria must prove the qualification is reasonably necessary to business essence!',
  },
  {
    id: 'boo-33',
    dispute: 'Validity of Disease Termination (Art. 299)',
    detail: 'Worker terminated for pulmonary disease challenges medical justification.',
    burden: 'employer',
    explanation: 'EMPLOYER must present certification by a competent public health authority that disease cannot be cured within 6 months!',
  },
  {
    id: 'boo-34',
    dispute: 'Cash Commutation of Service Incentive Leave',
    detail: 'Resigned staff claims 15 accumulated SIL days were never liquidated in final pay.',
    burden: 'employer',
    explanation: 'EMPLOYER has the burden of presenting final pay vouchers proving monetary conversion of all earned unused SIL days!',
  },
  {
    id: 'boo-35',
    dispute: 'Performance of Work on Regular Holiday',
    detail: 'Call center agent claims 200% holiday compensation for shift falling on New Year Day.',
    burden: 'employee',
    explanation: 'EMPLOYEE must substantiate actual shift rendering on the regular holiday to claim worked holiday rate!',
  },
  {
    id: 'boo-36',
    dispute: 'Fair and Reasonable Value of Deductible Facilities',
    detail: 'Hotel deducts ₱3,500 monthly from minimum wage for shared dormitory quarters.',
    burden: 'employer',
    explanation: 'EMPLOYER must prove the deduction is customary in trade, accepted in writing, and does not exceed fair reasonable value!',
  },
];

export function drawBooBurdenCases(
  count: number,
  rng: () => number = Math.random
): BooBurdenCaseItem[] {
  return drawUniqueFromDeck('boo_burden_cases', BOO_BURDEN_CASES_BANK, count, rng);
}

// ============================================================================
// 17. CHRONO PRESCRIPTION BLITZ BANK (20 Distinct Claims + Shuffled Choices)
// ============================================================================
export interface ChronoPrescriptionClaimItem {
  id: string;
  claim: string;
  options: [string, string, string, string];
  correctIdx: number;
  basis: string;
}

export const CHRONO_PRESCRIPTION_CLAIMS_BANK: ChronoPrescriptionClaimItem[] = [
  {
    id: 'cp-1',
    claim: 'Unfair Labor Practice (ULP) Complaints',
    options: ['1 Year', '3 Years', '4 Years', '5 Years'],
    correctIdx: 0,
    basis: 'Art. 305, Labor Code: All ULP offenses prescribe after 1 year from accrual!',
  },
  {
    id: 'cp-2',
    claim: 'Pure Money Claims (Unpaid OT, Holiday Pay, 13th Month)',
    options: ['1 Year', '3 Years', '4 Years', '10 Years'],
    correctIdx: 1,
    basis: 'Art. 306, Labor Code: Money claims arising from employer-employee relations prescribe in 3 years.',
  },
  {
    id: 'cp-3',
    claim: 'Illegal Dismissal & Reinstatement Complaint',
    options: ['1 Year', '2 Years', '3 Years', '4 Years'],
    correctIdx: 3,
    basis: 'Art. 1146, Civil Code (Callanta v. Carnation): Injury to employee rights prescribes in 4 years!',
  },
  {
    id: 'cp-4',
    claim: 'Unremitted SSS Contributions Liability',
    options: ['3 Years', '4 Years', '10 Years', '20 Years'],
    correctIdx: 3,
    basis: 'R.A. 11199 (Social Security Act): Action against employers for SSS remittance prescribes in 20 years!',
  },
  {
    id: 'cp-5',
    claim: 'Anti-Sexual Harassment Administrative / Independent Action (R.A. 7877)',
    options: ['1 Year', '3 Years', '4 Years', '5 Years'],
    correctIdx: 1,
    basis: 'Sec. 7, R.A. 7877: Any action arising from workplace sexual harassment prescribes in 3 years.',
  },
  {
    id: 'cp-6',
    claim: 'Criminal Offenses Penalized Under the Labor Code',
    options: ['1 Year', '3 Years', '4 Years', '5 Years'],
    correctIdx: 1,
    basis: 'Art. 305, Labor Code: Offenses penalized under the Labor Code generally prescribe in 3 years.',
  },
  {
    id: 'cp-7',
    claim: 'Unused Service Incentive Leave (SIL) Cash Commutation',
    options: ['1 Year from Year-End', '3 Years from Refusal/Separation', '4 Years from Hiring', '5 Years from Accrual'],
    correctIdx: 1,
    basis: 'Auto Bus Transport v. Bautista: 3-year prescription runs from employer refusal upon demand or upon separation!',
  },
  {
    id: 'cp-8',
    claim: 'Employees’ Compensation (EC) Disability / Sickness Claim',
    options: ['1 Year', '3 Years', '4 Years', '10 Years'],
    correctIdx: 1,
    basis: 'Art. 207, Labor Code: Employees’ Compensation claims prescribe in 3 years from accrual of cause of action.',
  },
  {
    id: 'cp-9',
    claim: 'Illegal Recruitment (Simple / Non-Syndicated) Criminal Action',
    options: ['3 Years', '5 Years', '10 Years', '20 Years'],
    correctIdx: 1,
    basis: 'R.A. 8042 as amended: Simple illegal recruitment cases prescribe in 5 years!',
  },
  {
    id: 'cp-10',
    claim: 'Illegal Recruitment Involving Economic Sabotage (Syndicated / Large Scale)',
    options: ['5 Years', '10 Years', '15 Years', '20 Years'],
    correctIdx: 3,
    basis: 'R.A. 8042 Sec. 12: Illegal recruitment involving economic sabotage prescribes in 20 years!',
  },
  {
    id: 'cp-11',
    claim: 'Appeal from Labor Arbiter Decision to NLRC Commission',
    options: ['5 Calendar Days', '10 Calendar Days', '15 Calendar Days', '30 Calendar Days'],
    correctIdx: 1,
    basis: 'Art. 229, Labor Code: Decisions of the Labor Arbiter are appealable within 10 calendar days from receipt!',
  },
  {
    id: 'cp-12',
    claim: 'Minimum Reasonable Period to Answer First Written Notice (Twin-Notice)',
    options: ['24 Hours', '3 Calendar Days', '5 Calendar Days', '10 Working Days'],
    correctIdx: 2,
    basis: 'King of Kings Transport v. Mamac: "Ample opportunity to be heard" means at least 5 calendar days!',
  },
  {
    id: 'cp-13',
    claim: 'Advance Written Notice to DOLE & Worker for Authorized Causes',
    options: ['10 Days Before', '15 Days Before', '30 Days Before', '60 Days Before'],
    correctIdx: 2,
    basis: 'Art. 298, Labor Code: Written notice must be served on both worker and DOLE at least 30 days ahead!',
  },
  {
    id: 'cp-14',
    claim: 'Maximum Preventive Suspension Period (Non-Construction)',
    options: ['15 Days', '30 Days', '45 Days', '60 Days'],
    correctIdx: 1,
    basis: 'Omnibus Rules: Preventive suspension cannot exceed 30 days; extension requires reinstatement on payroll!',
  },
  {
    id: 'cp-15',
    claim: 'Maximum Bona Fide Suspension of Operations ("Floating Status")',
    options: ['3 Months', '6 Months', '9 Months', '12 Months'],
    correctIdx: 1,
    basis: 'Art. 301, Labor Code: Bona fide suspension of business or security off-detail must not exceed 6 months!',
  },
  {
    id: 'cp-16',
    claim: 'Release of Final Pay & Clearance After Separation (DOLE LA 06-20)',
    options: ['Within 7 Days', 'Within 15 Days', 'Within 30 Days', 'Within 60 Days'],
    correctIdx: 2,
    basis: 'DOLE Labor Advisory No. 06-20: Final pay must be released within 30 days from date of separation!',
  },
  {
    id: 'cp-17',
    claim: 'Issuance of Certificate of Employment Upon Worker Request',
    options: ['Within 3 Days', 'Within 7 Days', 'Within 15 Days', 'Within 30 Days'],
    correctIdx: 0,
    basis: 'DOLE Labor Advisory No. 06-20: Certificate of Employment (COE) must be issued within 3 days from request!',
  },
  {
    id: 'cp-18',
    claim: 'Backpay / Money Claims Joined with Illegal Dismissal Suit',
    options: ['1 Year', '2 Years', '3 Years', '4 Years'],
    correctIdx: 3,
    basis: 'Accessory backwages in an illegal dismissal complaint follow the 4-year prescriptive period of the principal action (Arriola v. Pilipino Star)!',
  },
  {
    id: 'cp-19',
    claim: 'Distribution Cycle of Collected Service Charges (R.A. 11360)',
    options: ['Once a Month', 'Every 2 Weeks / Twice a Month', 'Quarterly', 'Every December 24'],
    correctIdx: 1,
    basis: 'IRR of R.A. 11360: Distributed completely and equally at least once every 2 weeks or twice a month!',
  },
  {
    id: 'cp-20',
    claim: 'Employer Reimbursement by SSS of Advanced Maternity Benefit',
    options: ['Within 30 Days', 'Within 60 Days', 'Within 1 Year', 'Within 10 Years'],
    correctIdx: 3,
    basis: 'R.A. 11210 / SSS Rules: Employer advances full maternity pay within 30 days of filing; SSS reimburses 100%.',
  },
  {
    id: 'cp-21',
    claim: 'NLRC Labor Arbiter Decision Appeal Period',
    options: ['5 Calendar Days', '10 Calendar Days', '15 Calendar Days', '30 Calendar Days'],
    correctIdx: 1,
    basis: 'Art. 229, Labor Code: Decisions of the Labor Arbiter become final and executory within 10 calendar days from receipt!',
  },
  {
    id: 'cp-22',
    claim: 'Petition for Certiorari to the Court of Appeals (Rule 65)',
    options: ['15 Days', '30 Days', '60 Calendar Days', '90 Days'],
    correctIdx: 2,
    basis: 'Rule 65, Rules of Court / St. Martin Funeral Home: Certiorari from denial of NLRC MR must be filed within 60 calendar days!',
  },
  {
    id: 'cp-23',
    claim: 'NLRC Motion for Reconsideration Filing Window',
    options: ['5 Calendar Days', '10 Calendar Days', '15 Calendar Days', '20 Calendar Days'],
    correctIdx: 1,
    basis: '2011 NLRC Rules of Procedure: Only 1 Motion for Reconsideration is allowed within 10 calendar days from receipt of NLRC decision.',
  },
  {
    id: 'cp-24',
    claim: 'Prescriptive Period for Pure Money Claims (Art. 306)',
    options: ['1 Year', '2 Years', '3 Years', '4 Years'],
    correctIdx: 2,
    basis: 'Art. 306, Labor Code: All money claims arising from employer-employee relations prescribe in 3 years from cause of action!',
  },
  {
    id: 'cp-25',
    claim: 'Prescriptive Period for Action Founded Upon Injury to Rights',
    options: ['1 Year', '2 Years', '3 Years', '4 Years'],
    correctIdx: 3,
    basis: 'Art. 1146, Civil Code (Callanta v. Carnation): Illegal dismissal complaints prescribe in 4 years as injury to statutory rights.',
  },
  {
    id: 'cp-26',
    claim: 'Mandatory Written Notice Period for Authorized Cause Dismissal',
    options: ['15 Calendar Days', '30 Calendar Days', '45 Calendar Days', '60 Calendar Days'],
    correctIdx: 1,
    basis: 'Art. 298, Labor Code: Employer must serve written notice to both the employee and DOLE at least 30 calendar days before effectivity!',
  },
  {
    id: 'cp-27',
    claim: 'Procedural Due Process Minimum Rebuttal Window for Notice of Charge',
    options: ['48 Hours', '3 Calendar Days', 'At least 5 Calendar Days', '10 Calendar Days'],
    correctIdx: 2,
    basis: 'King of Kings v. Mamac: Employee facing dismissal must be given ample opportunity to be heard of at least 5 calendar days to explain.',
  },
  {
    id: 'cp-28',
    claim: 'Action for Damages Under Anti-Sexual Harassment Act (R.A. 7877)',
    options: ['1 Year', '2 Years', '3 Years', '5 Years'],
    correctIdx: 2,
    basis: 'Sec. 7, R.A. 7877: Any action arising from the Anti-Sexual Harassment Act prescribes in 3 years from occurrence.',
  },
  {
    id: 'cp-29',
    claim: 'Mandatory 13th Month Pay Release Statutory Deadline',
    options: ['December 15', 'December 20', 'On or before December 24', 'December 31'],
    correctIdx: 2,
    basis: 'P.D. 851: Mandatory 13th Month Pay must be paid by employers on or before December 24 of each calendar year!',
  },
  {
    id: 'cp-30',
    claim: 'Prescriptive Period for General Penal Offenses Under the Labor Code',
    options: ['1 Year', '2 Years', '3 Years', '5 Years'],
    correctIdx: 2,
    basis: 'Art. 305, Labor Code: Penal offenses under this Code prescribe in 3 years (except ULP which prescribes in 1 year).',
  },
  {
    id: 'cp-31',
    claim: 'Prescriptive Period for Simple Illegal Recruitment (R.A. 8042)',
    options: ['3 Years', '5 Years', '10 Years', '20 Years'],
    correctIdx: 1,
    basis: 'Sec. 12, R.A. 8042 / R.A. 10022: Illegal recruitment cases prescribe in 5 years; syndicated/large scale in 20 years!',
  },
  {
    id: 'cp-32',
    claim: 'Prescriptive Period for Illegal Recruitment as Economic Sabotage',
    options: ['5 Years', '10 Years', '15 Years', '20 Years'],
    correctIdx: 3,
    basis: 'Sec. 12, R.A. 8042: Syndicated or Large Scale Illegal Recruitment prescribes in 20 years from discovery!',
  },
  {
    id: 'cp-33',
    claim: 'Maximum Statutory Floating Status / Suspension of Operations',
    options: ['30 Days', '3 Months', 'Not Exceeding 6 Months', '1 Full Year'],
    correctIdx: 2,
    basis: 'Art. 301, Labor Code: Bona fide suspension of business operations cannot exceed 6 months, after which separation pay is due.',
  },
  {
    id: 'cp-34',
    claim: 'Maximum Permissible Interval Between Wage Payments (Art. 103)',
    options: ['7 Days', '10 Days', '15 Days', 'Not Exceeding 16 Days'],
    correctIdx: 3,
    basis: 'Art. 103, Labor Code: Wages must be paid at least twice a month at intervals not exceeding 16 days!',
  },
  {
    id: 'cp-35',
    claim: 'Mandatory Strike Notice Cooling-Off Period for Collective Bargaining Deadlock',
    options: ['7 Days', '15 Days', '30 Days', '60 Days'],
    correctIdx: 2,
    basis: 'Art. 278(c), Labor Code: In case of collective bargaining deadlocks, the cooling-off period is 30 days before strike.',
  },
  {
    id: 'cp-36',
    claim: 'Mandatory Strike Notice Cooling-Off Period for Unfair Labor Practice',
    options: ['7 Days', '15 Days', '30 Days', '45 Days'],
    correctIdx: 1,
    basis: 'Art. 278(c), Labor Code: In case of unfair labor practices, the cooling-off period is 15 days before conducting a strike.',
  },
];

export function drawChronoPrescriptionClaims(
  count: number,
  rng: () => number = Math.random
): ChronoPrescriptionClaimItem[] {
  return drawUniqueFromDeck(
    'chrono_prescription_claims',
    CHRONO_PRESCRIPTION_CLAIMS_BANK,
    count,
    rng
  ).map((item) => {
    const shuffled = shuffleChoiceOptions(item.options, item.correctIdx, rng);
    return {
      ...item,
      options: [
        shuffled.options[0],
        shuffled.options[1],
        shuffled.options[2],
        shuffled.options[3],
      ],
      correctIdx: shuffled.correctIndex,
    };
  });
}

// ============================================================================
// 18. HAMMER BROS. PAYROLL BLITZ BANK (16 Distinct Shifts + Shuffled Choices)
// ============================================================================
export interface HammerBrosShiftItem {
  id: string;
  worker: string;
  scenario: string;
  equation: string;
  options: [string, string, string, string];
  correctIdx: number;
  cite: string;
}

export const HAMMER_BROS_SHIFTS_BANK: HammerBrosShiftItem[] = [
  {
    id: 'hb-1',
    worker: 'Toad (Warehouse Clerk)',
    scenario: 'Daily Rate = ₱800 (₱100/hr). Worked 10 hours on an Ordinary Workday (8 hrs regular + 2 hrs Overtime).',
    equation: '₱800 + (2 hrs × ₱100 × 1.25) = ₱800 + ₱250',
    options: ['₱1,000', '₱1,050', '₱1,060', '₱1,100'],
    correctIdx: 1,
    cite: 'Art. 87: Ordinary Day Overtime = +25% of hourly rate.',
  },
  {
    id: 'hb-2',
    worker: 'Luigi (Hotel Barista)',
    scenario: 'Daily Rate = ₱645. Worked 8 hours on a Regular Holiday (Independence Day).',
    equation: '₱645 × 200%',
    options: ['₱838.50', '₱967.50', '₱1,290.00', '₱1,677.00'],
    correctIdx: 2,
    cite: 'Art. 94: Worked Regular Holiday = 200% daily wage for first 8 hours.',
  },
  {
    id: 'hb-3',
    worker: 'Peach (Hospital Nurse)',
    scenario: 'Daily Rate = ₱1,000. Worked 8 hours on a Regular Holiday that ALSO fell on her Rest Day.',
    equation: '₱1,000 × 200% × 1.30 (260%)',
    options: ['₱2,000', '₱2,300', '₱2,600', '₱3,000'],
    correctIdx: 2,
    cite: 'Art. 94(c): Regular Holiday on Rest Day = 260% of regular wage.',
  },
  {
    id: 'hb-4',
    worker: 'Yoshi (Call Center Agent)',
    scenario: 'Daily Rate = ₱800 (₱100/hr). Worked an 8-hour shift entirely from 10:00 PM to 6:00 AM on an Ordinary Day.',
    equation: '₱800 + (8 hrs × ₱100 × 10% NSD)',
    options: ['₱840', '₱880', '₱960', '₱1,000'],
    correctIdx: 1,
    cite: 'Art. 86: Night Shift Differential adds +10% per hour from 10PM to 6AM.',
  },
  {
    id: 'hb-5',
    worker: 'Daisy (Retail Cashier)',
    scenario: 'Daily Rate = ₱600. Worked 8 hours on Ninoy Aquino Day (Special Non-Working Day, not a rest day).',
    equation: '₱600 × 130%',
    options: ['₱600', '₱750', '₱780', '₱900'],
    correctIdx: 2,
    cite: 'Art. 93: Special Non-Working Day worked = 130% of basic pay.',
  },
  {
    id: 'hb-6',
    worker: 'Rosalina (Accounting Staff)',
    scenario: 'Earned ₱24,000/month basic salary for 6 months (₱144,000 total basic salary earned) before resigning.',
    equation: '₱144,000 Total Basic Salary Earned ÷ 12',
    options: ['₱6,000', '₱12,000', '₱18,000', '₱24,000'],
    correctIdx: 1,
    cite: 'P.D. 851: Pro-rated 13th Month Pay = Total Basic Salary Earned ÷ 12.',
  },
  {
    id: 'hb-7',
    worker: 'Mario (Plant Technician)',
    scenario: 'Daily Rate = ₱1,000. Worked 8 hours on Araw ng Kagitingan coinciding with Maundy Thursday (Double Regular Holiday).',
    equation: '₱1,000 × 300%',
    options: ['₱2,000', '₱2,600', '₱3,000', '₱3,900'],
    correctIdx: 2,
    cite: 'DOLE Handbook: Double Regular Holiday worked = 300% of basic daily wage.',
  },
  {
    id: 'hb-8',
    worker: 'Wario (Senior Mechanic)',
    scenario: 'Daily Rate = ₱1,000. Retires at age 60 after 10 years of service under R.A. 7641 (no company retirement plan).',
    equation: '₱1,000 × 22.5 days × 10 years',
    options: ['₱150,000', '₱200,000', '₱225,000', '₱300,000'],
    correctIdx: 2,
    cite: 'R.A. 7641 (Elegir v. PAL): Minimum retirement pay = 22.5 days per year of service.',
  },
  {
    id: 'hb-9',
    worker: 'Bowser Jr. (Delivery Rider)',
    scenario: 'Daily Rate = ₱700. Worked 8 hours on his scheduled Weekly Rest Day (ordinary non-holiday Sunday).',
    equation: '₱700 × 130%',
    options: ['₱770', '₱875', '₱910', '₱1,050'],
    correctIdx: 2,
    cite: 'Art. 93(a): Work performed on a scheduled Rest Day pays 130% of regular wage.',
  },
  {
    id: 'hb-10',
    worker: 'Pauline (Bakery Supervisor)',
    scenario: 'Daily Rate = ₱800. Worked 8 hours on a Special Non-Working Day that ALSO fell on her scheduled Rest Day.',
    equation: '₱800 × 150%',
    options: ['₱1,040', '₱1,120', '₱1,200', '₱1,600'],
    correctIdx: 2,
    cite: 'Art. 93(c): Special Non-Working Day falling on a Rest Day pays 150%!',
  },
  {
    id: 'hb-11',
    worker: 'Toadette (Office Clerk)',
    scenario: 'Daily Rate = ₱650. Completed 1 full year of service and did not use any of her 5-day Service Incentive Leave.',
    equation: '5 unused SIL days × ₱650 current daily wage',
    options: ['₱1,950', '₱3,250', '₱4,550', '₱6,500'],
    correctIdx: 1,
    cite: 'Art. 95: Unused 5-day SIL is commutable to cash based on the salary rate at date of commutation.',
  },
  {
    id: 'hb-12',
    worker: 'Waluigi (Resort Waitstaff)',
    scenario: 'Hotel collected ₱90,000 in net service charges over two weeks with 10 covered employees and 2 managers.',
    equation: '100% × ₱90,000 ÷ 10 covered workers (managers excluded)',
    options: ['₱6,375 each', '₱7,500 each', '₱7,650 each', '₱9,000 each'],
    correctIdx: 3,
    cite: 'R.A. 11360: 100% of service charges go equally to covered rank-and-file & supervisory staff; managers get 0%.',
  },
  {
    id: 'hb-13',
    worker: 'Birdo (Factory Operator)',
    scenario: 'Daily Rate = ₱1,000. Worked 8 hours on a Double Regular Holiday that ALSO fell on her Rest Day.',
    equation: '₱1,000 × 300% × 1.30 (390%)',
    options: ['₱3,000', '₱3,300', '₱3,600', '₱3,900'],
    correctIdx: 3,
    cite: 'DOLE Handbook: Double Regular Holiday on Rest Day pays 390% for the first 8 hours!',
  },
  {
    id: 'hb-14',
    worker: 'Diddy Kong (Encoder)',
    scenario: 'Daily Rate = ₱800 (₱100/hr). Did NOT work on Bonifacio Day (Regular Holiday), and was present on the workday before.',
    equation: '₱800 × 100% unworked Regular Holiday pay',
    options: ['₱0 (No Work No Pay)', '₱400', '₱800', '₱1,600'],
    correctIdx: 2,
    cite: 'Art. 94: Eligible employees receive 100% daily wage even if unworked on a Regular Holiday.',
  },
  {
    id: 'hb-15',
    worker: 'Dixie Kong (Store Assistant)',
    scenario: 'Daily Rate = ₱620. Did NOT work on All Saints’ Day (Special Non-Working Day); no CBA grant.',
    equation: 'Special Non-Working Day unworked = No Work, No Pay',
    options: ['₱0', '₱186', '₱310', '₱620'],
    correctIdx: 0,
    cite: 'DOLE Handbook: Unworked Special Non-Working Days follow "No Work, No Pay" unless granted by policy/CBA.',
  },
  {
    id: 'hb-16',
    worker: 'Donkey Kong (Logistics Lead)',
    scenario: 'Monthly Basic = ₱30,000. Position abolished due to Redundancy after 4 years of service.',
    equation: 'At least 1 month pay per year of service = ₱30,000 × 4 years',
    options: ['₱60,000', '₱90,000', '₱120,000', '₱150,000'],
    correctIdx: 2,
    cite: 'Art. 298: Redundancy or labor-saving device separation pay = 1 month pay or 1 month per year of service, whichever is higher.',
  },
];

export function drawHammerBrosShifts(
  count: number,
  rng: () => number = Math.random
): HammerBrosShiftItem[] {
  return drawUniqueFromDeck('hammer_bros_shifts', HAMMER_BROS_SHIFTS_BANK, count, rng).map(
    (item) => {
      const shuffled = shuffleChoiceOptions(item.options, item.correctIdx, rng);
      return {
        ...item,
        options: [
          shuffled.options[0],
          shuffled.options[1],
          shuffled.options[2],
          shuffled.options[3],
        ],
        correctIdx: shuffled.correctIndex,
      };
    }
  );
}

// ============================================================================
// 19. TOADETTE'S DUE PROCESS RELAY BANK (16 Distinct Cases + Shuffled Choices)
// ============================================================================
export interface DueProcessRelayCaseItem {
  id: string;
  stageLabel: string;
  title: string;
  facts: string;
  question: string;
  options: [string, string, string, string];
  correctIdx: number;
  doctrine: string;
}

export const DUE_PROCESS_RELAY_BANK: DueProcessRelayCaseItem[] = [
  {
    id: 'dp-1',
    stageLabel: 'STEP 1 · FIRST WRITTEN NOTICE',
    title: 'Notice to Explain (NTE) Specificity',
    facts: 'Employer hands Koopa a memo stating only: "Explain within 24 hours why you should not be fired for violating company rules."',
    question: 'Why is this First Written Notice legally defective under King of Kings Transport?',
    options: [
      'It lacks specific acts/facts AND gives less than 5 calendar days to explain',
      'It was not notarized by a Barangay Captain',
      'It should have given 30 working days to reply',
      'First notices can be purely verbal if witnessed by HR',
    ],
    correctIdx: 0,
    doctrine: 'King of Kings Transport v. Mamac: First notice must detail specific acts, cite the rule, and grant at least 5 calendar days!',
  },
  {
    id: 'dp-2',
    stageLabel: 'STEP 2 · PREVENTIVE SUSPENSION',
    title: 'Preventive Suspension Duration Cap',
    facts: 'Cashier Goomba is placed under preventive suspension while an audit of missing vault funds is ongoing.',
    question: 'What is the maximum lawful duration of preventive suspension (non-construction) without pay?',
    options: ['15 calendar days', '30 days maximum', '60 calendar days', '90 working days'],
    correctIdx: 1,
    doctrine: 'Omnibus Rules Book V: Preventive suspension cannot exceed 30 days; extension requires payroll reinstatement!',
  },
  {
    id: 'dp-3',
    stageLabel: 'STEP 3 · OPPORTUNITY TO BE HEARD',
    title: 'When Is a Formal Trial-Type Hearing Mandatory?',
    facts: 'Shy Guy submits a detailed written explanation with affidavits, but demands a courtroom-style cross-examination.',
    question: 'Under Perez v. PT&T, when is a formal hearing strictly REQUIRED?',
    options: [
      'In every termination case without exception',
      'Only when requested in writing, substantial evidentiary disputes exist, or company rules require it',
      'Never under any circumstance',
      'Only when DOLE sends an arbiter to the office',
    ],
    correctIdx: 1,
    doctrine: 'Perez v. PT&T: Ample opportunity to be heard does not always mean a formal hearing unless requested in writing or needed for disputed facts.',
  },
  {
    id: 'dp-4',
    stageLabel: 'STEP 4 ·AUTHORIZED CAUSE NOTICE',
    title: 'Redundancy & Retrenchment Dual Notice',
    facts: 'Mushroom Corp. abolishes 5 redundant IT posts effective tomorrow, offering full separation pay today.',
    question: 'What procedural requirement under Article 298 was violated?',
    options: [
      'Advance written notice to BOTH workers and DOLE at least 30 days before effectivity',
      'Twin-notice and 5-day NTE hearing',
      'Prior approval from the NLRC Chairman',
      'Publication in a newspaper for 3 weeks',
    ],
    correctIdx: 0,
    doctrine: 'Art. 298: Authorized causes require written notice to BOTH the employee and DOLE at least 1 month (30 days) prior!',
  },
  {
    id: 'dp-5',
    stageLabel: 'STEP 5 · NOMINAL DAMAGES (JUST CAUSE)',
    title: 'Agabon v. NLRC Doctrine',
    facts: 'Employee committed proven theft (valid Just Cause), but employer fired him on the spot without Twin Notices.',
    question: 'What is the legal status of the dismissal and employer liability under Agabon?',
    options: [
      'Dismissal is illegal; full reinstatement + backwages',
      'Dismissal stands as valid, but employer pays ₱30,000 nominal damages',
      'Dismissal stands with ₱50,000 nominal damages',
      'No liability at all since theft was proven',
    ],
    correctIdx: 1,
    doctrine: 'Agabon v. NLRC: Valid Just Cause + defective due process = valid dismissal + ₱30,000 nominal damages!',
  },
  {
    id: 'dp-6',
    stageLabel: 'STEP 6 · NOMINAL DAMAGES (AUTHORIZED)',
    title: 'Jaka Food Processing Doctrine',
    facts: 'Company suffered proven severe audited losses (valid Retrenchment), but failed to give the 30-day advance notice.',
    question: 'Under Jaka Food Processing, how much nominal damages apply to defective Authorized Cause notice?',
    options: ['₱10,000 nominal damages', '₱30,000 nominal damages', '₱50,000 nominal damages', '₱100,000 nominal damages'],
    correctIdx: 2,
    doctrine: 'Jaka Food Processing v. Pacot: Valid Authorized Cause + defective 30-day notice = ₱50,000 nominal damages!',
  },
  {
    id: 'dp-7',
    stageLabel: 'STEP 7 · SECOND WRITTEN NOTICE',
    title: 'Notice of Decision / Termination',
    facts: 'After reviewing the employee’s written explanation and holding a conference, management decides to dismiss for willful disobedience.',
    question: 'What must the Second Written Notice contain to complete Twin-Notice due process?',
    options: [
      'Clear statement that all circumstances were considered and grounds for termination are established',
      'Only the final paycheck amount without stating reasons',
      'A blank quitclaim form for compulsory signature',
      'A verbal exit interview summary',
    ],
    correctIdx: 0,
    doctrine: 'Omnibus Rules: The Second Notice must inform the worker in writing that all circumstances were considered and grounds were established.',
  },
  {
    id: 'dp-8',
    stageLabel: 'STEP 8 · DISEASE AS AUTHORIZED CAUSE',
    title: 'Termination Due to Disease (Art. 299)',
    facts: 'Employer wants to terminate an employee suffering from a contagious illness.',
    question: 'What mandatory medical document is indispensable under Article 299?',
    options: [
      'Certification by a competent public health authority that the disease cannot be cured within 6 months',
      'Note from the company HR nurse',
      'Self-declaration by the employee’s supervisor',
      'Barangay health clearance',
    ],
    correctIdx: 0,
    doctrine: 'Art. 299 (Deoferio v. Intel): Requires certification from a competent public health authority that disease is incurable within 6 months!',
  },
  {
    id: 'dp-9',
    stageLabel: 'STEP 9 · ABANDONMENT DEFENSES',
    title: 'Twin Elements of Abandonment',
    facts: 'Lakitu was absent for 6 days without leave, then immediately filed an illegal dismissal complaint on Day 7.',
    question: 'Does Lakitu’s immediate filing of a complaint support or negate abandonment?',
    options: [
      'Proves abandonment automatically after 3 days AWOL',
      'Negates intent to sever employment — immediate protest for reinstatement disproves animus revertendi loss',
      'Waives all backwages automatically',
      'Converts dismissal into voluntary resignation',
    ],
    correctIdx: 1,
    doctrine: 'Jurisprudence: Immediate filing of an illegal dismissal complaint asking for reinstatement negates intent to abandon work!',
  },
  {
    id: 'dp-10',
    stageLabel: 'STEP 10 · PROBATIONARY TERMINATION',
    title: 'Failure to Qualify as Regular Employee',
    facts: 'Toadstool Tech hires a designer on 6-month probation without explaining evaluation metrics upon hiring, then fires her at Month 5.',
    question: 'Is the termination for failure to meet probationary standards valid?',
    options: [
      'No — failure to communicate reasonable standards at hiring makes the worker regular from Day 1',
      'Yes — employers have absolute discretion during the first 6 months',
      'Yes — standards can be disclosed on the day of dismissal',
      'Only if approved by TESDA',
    ],
    correctIdx: 0,
    doctrine: 'Art. 296 (Abbott Laboratories v. Alcaraz): Reasonable standards must be made known at the time of engagement!',
  },
  {
    id: 'dp-11',
    stageLabel: 'STEP 11 · LOSS OF TRUST & CONFIDENCE',
    title: 'Fiduciary Rank-and-File vs. Managerial Staff',
    facts: 'Employer invokes "loss of trust and confidence" to dismiss a regular janitor who does not handle money or property.',
    question: 'Why does loss of trust and confidence fail here?',
    options: [
      'It applies only to managerial personnel or fiduciary rank-and-file who routinely handle money/property',
      'It requires criminal conviction beyond reasonable doubt first',
      'It applies only to government officials',
      'It requires 10 years of tenure',
    ],
    correctIdx: 0,
    doctrine: 'Art. 297(c): Loss of trust applies only to employees holding positions of trust and confidence (managers or fiduciary cash/property custodians)!',
  },
  {
    id: 'dp-12',
    stageLabel: 'STEP 12 · FLOATING STATUS LIMIT',
    title: 'Security Guard Off-Detail Past 6 Months',
    facts: 'A security agency places Guard Hammer Bro on "floating status" for 8 months without assigning a new client post.',
    question: 'What happens legally once floating status exceeds 6 months under Article 301?',
    options: [
      'It ripens into illegal constructive dismissal entitling the guard to reinstatement/separation pay + backwages',
      'Agency can extend floating status up to 2 years unpaid',
      'Guard automatically forfeits tenure',
      'Guard becomes an independent contractor',
    ],
    correctIdx: 0,
    doctrine: 'Art. 301 (Exocet Security): Off-detail / floating status beyond 6 months amounts to constructive dismissal!',
  },
];

export function drawDueProcessRelayCases(
  count: number,
  rng: () => number = Math.random
): DueProcessRelayCaseItem[] {
  return drawUniqueFromDeck('due_process_relay', DUE_PROCESS_RELAY_BANK, count, rng).map((item) => {
    const shuffled = shuffleChoiceOptions(item.options, item.correctIdx, rng);
    return {
      ...item,
      options: [
        shuffled.options[0],
        shuffled.options[1],
        shuffled.options[2],
        shuffled.options[3],
      ],
      correctIdx: shuffled.correctIndex,
    };
  });
}

// ============================================================================
// 20. SHY GUY'S WAGE ORDER FACTORY BANK (20 Distinct Packages)
// ============================================================================
export interface WageFactoryPackageItem {
  id: string;
  label: string;
  detail: string;
  verdict: 'lawful' | 'unlawful';
  statute: string;
  ruleNote: string;
}

export const WAGE_FACTORY_PACKAGES_BANK: WageFactoryPackageItem[] = [
  {
    id: 'wf-1',
    label: 'Company Promissory Vouchers',
    detail: 'Factory pays 50% cash and 50% store vouchers redeemable only at the boss’s canteen.',
    verdict: 'unlawful',
    statute: 'Art. 102, Labor Code',
    ruleNote: 'Art. 102 strictly prohibits paying wages in promissory notes, vouchers, coupons, tokens, or chits.',
  },
  {
    id: 'wf-2',
    label: 'ATM Payroll w/ Written Consent',
    detail: 'Bank ATM payroll within 1 km of workplace with paid time to withdraw and zero ATM fees.',
    verdict: 'lawful',
    statute: 'Art. 104, Labor Code · DOLE Advisory',
    ruleNote: 'DOLE Labor Advisory allows ATM wage payment with employee consent and accessible fee-free withdrawal.',
  },
  {
    id: 'wf-3',
    label: 'Safety Helmet & Uniform Deduction',
    detail: 'Construction company deducts ₱1,200 from minimum wage for required hardhats and vests.',
    verdict: 'unlawful',
    statute: 'Art. 113, Labor Code · D.O. 198-18',
    ruleNote: 'PPE and uniforms worn for the employer’s protection/business are SUPPLEMENTS — never deductible!',
  },
  {
    id: 'wf-4',
    label: 'SSS, PhilHealth & Pag-IBIG Share',
    detail: 'Payroll deducts mandatory statutory employee contributions and remits them in full.',
    verdict: 'lawful',
    statute: 'Art. 113(a), Labor Code · Statutory Mandates',
    ruleNote: 'Statutory deductions mandated by law (SSS, PhilHealth, Pag-IBIG, withholding tax) require no extra consent.',
  },
  {
    id: 'wf-5',
    label: '15% Management Cut on Service Charge',
    detail: 'Hotel retains 15% of collected service charges for breakage and executive bonuses.',
    verdict: 'unlawful',
    statute: 'Art. 96, Labor Code · R.A. 11360',
    ruleNote: 'Under R.A. 11360, 100% of collected service charges belong to covered rank-and-file and supervisory staff.',
  },
  {
    id: 'wf-6',
    label: 'Subsidized Dormitory w/ Written Consent',
    detail: 'Customary staff dorm at fair cost (30% subsidized) with voluntary signed authorization.',
    verdict: 'lawful',
    statute: 'Art. 97(f), Labor Code · Mabeza v. NLRC',
    ruleNote: 'Meets all 3 Mabeza requisites for deductible facilities: customary, written consent, and fair value.',
  },
  {
    id: 'wf-7',
    label: 'Automatic Cash Bond Deduction (No Practice)',
    detail: 'Retail shop deducts ₱500/week "security deposit" though not a recognized trade practice or DOLE-approved.',
    verdict: 'unlawful',
    statute: 'Art. 114, Labor Code',
    ruleNote: 'Art. 114 prohibits deposits for loss/damage unless DOLE-authorized or a recognized desirable trade practice.',
  },
  {
    id: 'wf-8',
    label: 'Union Agency Fee Check-Off',
    detail: 'Non-union members who accept CBA benefits have equal union dues checked off for the bargaining agent.',
    verdict: 'lawful',
    statute: 'Art. 259(e), Labor Code',
    ruleNote: 'Art. 259(e) expressly allows check-off of reasonable agency fees from non-union CBA beneficiaries without individual consent.',
  },
  {
    id: 'wf-9',
    label: 'Offsetting Monday Undertime w/ Tuesday OT',
    detail: 'Payroll cancels 2 hours of Tuesday overtime pay because worker arrived 2 hours late on Monday.',
    verdict: 'unlawful',
    statute: 'Art. 88, Labor Code',
    ruleNote: 'Art. 88 strictly prohibits offsetting undertime on one day by overtime work on another day.',
  },
  {
    id: 'wf-10',
    label: 'Twice-Monthly Payday (15th & 30th)',
    detail: 'Company pays full legal tender wages every 15th and 30th of the month (interval <= 16 days).',
    verdict: 'lawful',
    statute: 'Art. 103, Labor Code',
    ruleNote: 'Art. 103 requires payment at least once every 2 weeks or twice a month at intervals not exceeding 16 days.',
  },
  {
    id: 'wf-11',
    label: 'Kasambahay Recruitment Fee Deduction',
    detail: 'Employer deducts agency finder’s fee from the domestic worker’s first 3 monthly salaries.',
    verdict: 'unlawful',
    statute: 'Sec. 13, R.A. 10361 (Kasambahay Law)',
    ruleNote: 'Sec. 13, R.A. 10361 forbids charging any recruitment or finder’s fee against the Kasambahay.',
  },
  {
    id: 'wf-12',
    label: 'Voluntary Co-op Loan Check-Off',
    detail: 'Employee signs a written authorization to remit ₱1,000/month to the accredited employees’ credit cooperative (employer gets 0% kickback).',
    verdict: 'lawful',
    statute: 'Art. 113(b), Labor Code',
    ruleNote: 'Art. 113(b) allows third-party payment deductions with individual written authorization when employer receives no pecuniary benefit.',
  },
  {
    id: 'wf-13',
    label: 'Withholding Final Pay to Force Quitclaim Away Claims',
    detail: 'HR refuses to release earned last salary unless worker waives unpaid overtime claims.',
    verdict: 'unlawful',
    statute: 'Art. 116, Labor Code',
    ruleNote: 'Art. 116 prohibits withholding wages through force, stealth, intimidation, or threat.',
  },
  {
    id: 'wf-14',
    label: 'P.I. Manufacturing Wage Distortion Formula',
    detail: 'After an RTWPB wage order compresses pay brackets, company restores partial pay gap via (Min Wage / Actual Salary) × Increase.',
    verdict: 'lawful',
    statute: 'Art. 124, Labor Code · P.I. Manufacturing',
    ruleNote: 'Supreme Court approved the P.I. Manufacturing formula to equitably correct statutory wage distortion (Art. 124).',
  },
  {
    id: 'wf-15',
    label: 'Paying Wages Inside a Casino / Nightclub Bar',
    detail: 'Construction contractor distributes cash envelopes to masons inside a neighborhood beerhouse.',
    verdict: 'unlawful',
    statute: 'Art. 104, Labor Code',
    ruleNote: 'Art. 104 / Labor Code rules prohibit paying wages in bars, nightclubs, casinos, or massage clinics except for staff employed therein.',
  },
  {
    id: 'wf-16',
    label: '40-Minute Paid Lactation Break Included in Basic Pay',
    detail: 'Payroll credits nursing mother’s two 20-minute lactation breaks as full paid working hours.',
    verdict: 'lawful',
    statute: 'R.A. 10028 (Expanded Breastfeeding Act)',
    ruleNote: 'R.A. 10028 mandates that lactation periods of >= 40 minutes per 8-hour shift are compensable working time.',
  },
];

export function drawWageFactoryPackages(
  count: number,
  rng: () => number = Math.random
): WageFactoryPackageItem[] {
  return drawUniqueFromDeck('wage_factory_packages', WAGE_FACTORY_PACKAGES_BANK, count, rng);
}

// ============================================================================
// 21. KAMEK'S DEADLINE SPELLBOOK BANK (18 Distinct Spells + Shuffled Choices)
// ============================================================================
export interface KamekSpellItem {
  id: string;
  spellName: string;
  prompt: string;
  options: [string, string, string, string];
  correctIdx: number;
  citation: string;
}

export const KAMEK_SPELLS_BANK: KamekSpellItem[] = [
  {
    id: 'km-1',
    spellName: 'HEX OF MANDATORY BONUS',
    prompt: 'Latest calendar date every year to pay mandatory 13th Month Pay:',
    options: ['November 15', 'November 30', 'December 24', 'December 31'],
    correctIdx: 2,
    citation: 'P.D. No. 851 — Payable not later than December 24 of every year!',
  },
  {
    id: 'km-2',
    spellName: 'CURSE OF FINAL CLEARANCE',
    prompt: 'DOLE deadline to release Final Pay after employee separation (LA 06-20):',
    options: ['Within 7 days', 'Within 15 days', 'Within 30 days', 'Within 60 days'],
    correctIdx: 2,
    citation: 'DOLE Labor Advisory No. 06-20 — Within 30 days from separation (unless more favorable company policy).',
  },
  {
    id: 'km-3',
    spellName: 'SIGIL OF EMPLOYMENT PROOF',
    prompt: 'Deadline for employer to issue a Certificate of Employment (COE) upon request:',
    options: ['Within 24 hours', 'Within 3 days', 'Within 10 days', 'Within 30 days'],
    correctIdx: 1,
    citation: 'DOLE Labor Advisory No. 06-20 — COE must be issued within 3 days from employee request!',
  },
  {
    id: 'km-4',
    spellName: 'WARD OF MATERNITY ADVANCE',
    prompt: 'Employer must advance full R.A. 11210 Maternity Benefit within how many days from filing?',
    options: ['Within 7 days', 'Within 15 days', 'Within 30 days', 'Within 60 days'],
    correctIdx: 2,
    citation: 'R.A. 11210 Sec. 5 — Full payment advanced by employer within 30 days from filing leave application!',
  },
  {
    id: 'km-5',
    spellName: 'RUNE OF RETRENCHMENT',
    prompt: 'Advance written notice to DOLE and workers before Authorized Cause dismissal:',
    options: ['At least 5 days', 'At least 15 days', 'At least 30 days', 'At least 45 days'],
    correctIdx: 2,
    citation: 'Art. 298, Labor Code — Written notice at least 1 month (30 days) before intended date!',
  },
  {
    id: 'km-6',
    spellName: 'SEAL OF PROBATIONARY CAP',
    prompt: 'General maximum period of Probationary Employment from first day of work:',
    options: ['3 months', '6 months', '9 months', '12 months'],
    correctIdx: 1,
    citation: 'Art. 296, Labor Code — Shall not exceed 6 months from date employee started working!',
  },
  {
    id: 'km-7',
    spellName: 'CHARM OF COMPULSORY RETIREMENT',
    prompt: 'Optional and Compulsory Retirement ages for general workers under R.A. 7641:',
    options: ['50 Optional / 60 Compulsory', '55 Optional / 60 Compulsory', '60 Optional / 65 Compulsory', '62 Optional / 70 Compulsory'],
    correctIdx: 2,
    citation: 'Art. 302 (R.A. 7641) — Optional at 60, Compulsory at 65 (with at least 5 years of service)!',
  },
  {
    id: 'km-8',
    spellName: 'ORB OF FLOATING STATUS',
    prompt: 'Maximum lawful period of bona fide business suspension / security off-detail:',
    options: ['30 days', '3 months', '6 months', '1 year'],
    correctIdx: 2,
    citation: 'Art. 301, Labor Code — Suspension of operations or off-detail must not exceed 6 months!',
  },
  {
    id: 'km-9',
    spellName: 'SCROLL OF ARBITER APPEAL',
    prompt: 'Reglementary period to appeal a Labor Arbiter decision to the NLRC:',
    options: ['5 calendar days', '10 calendar days', '15 working days', '30 calendar days'],
    correctIdx: 1,
    citation: 'Art. 229, Labor Code — Non-extendible 10 calendar days from receipt of decision!',
  },
  {
    id: 'km-10',
    spellName: 'GLYPH OF FIRST NOTICE',
    prompt: 'Minimum period given to an employee to submit a written explanation to an NTE:',
    options: ['24 hours', '48 hours', '5 calendar days', '15 calendar days'],
    correctIdx: 2,
    citation: 'King of Kings Transport v. Mamac — Reasonable opportunity means at least 5 calendar days!',
  },
  {
    id: 'km-11',
    spellName: 'AEGIS OF PAYDAY INTERVAL',
    prompt: 'Maximum interval between twice-monthly wage paydays under Article 103:',
    options: ['7 calendar days', '14 calendar days', '16 calendar days', '30 calendar days'],
    correctIdx: 2,
    citation: 'Art. 103, Labor Code — Paid at least once every 2 weeks or twice a month at intervals <= 16 days!',
  },
  {
    id: 'km-12',
    spellName: 'VORTEX OF SERVICE CHARGES',
    prompt: 'Frequency of distributing 100% of collected service charges to workers:',
    options: ['Once every 2 weeks / twice a month', 'Once every quarter', 'Only on December 24', 'Upon resignation only'],
    correctIdx: 0,
    citation: 'R.A. 11360 IRR — Distributed completely and equally at least once every 2 weeks or twice a month!',
  },
  {
    id: 'km-13',
    spellName: 'TONIC OF PREVENTIVE SUSPENSION',
    prompt: 'Maximum preventive suspension period before mandatory payroll reinstatement:',
    options: ['10 days', '15 days', '30 days', '60 days'],
    correctIdx: 2,
    citation: 'Omnibus Rules Book V — Preventive suspension shall not last longer than 30 days!',
  },
  {
    id: 'km-14',
    spellName: 'CREST OF UNDERGROUND MINERS',
    prompt: 'Optional and Compulsory Retirement ages for underground/surface mine workers:',
    options: ['45 Optional / 55 Compulsory', '50 Optional / 60 Compulsory', '55 Optional / 65 Compulsory', '60 Optional / 65 Compulsory'],
    correctIdx: 1,
    citation: 'R.A. 8558 & R.A. 10757 — Underground and surface mine workers retire at 50 (optional) and 60 (compulsory)!',
  },
  {
    id: 'km-15',
    spellName: 'TALISMAN OF ULP PRESCRIPTION',
    prompt: 'Prescriptive period for filing Unfair Labor Practice (ULP) complaints:',
    options: ['6 months', '1 year', '3 years', '4 years'],
    correctIdx: 1,
    citation: 'Art. 305, Labor Code — All ULP complaints must be filed within 1 year from accrual!',
  },
  {
    id: 'km-16',
    spellName: 'PRISM OF MONEY CLAIMS',
    prompt: 'Prescriptive period for pure statutory money claims (OT, Holiday, Wage Differentials):',
    options: ['1 year', '2 years', '3 years', '4 years'],
    correctIdx: 2,
    citation: 'Art. 306, Labor Code — Money claims prescribe within 3 years from accrual of cause of action!',
  },
];

export function drawKamekSpells(
  count: number,
  rng: () => number = Math.random
): KamekSpellItem[] {
  return drawUniqueFromDeck('kamek_spells', KAMEK_SPELLS_BANK, count, rng).map((item) => {
    const shuffled = shuffleChoiceOptions(item.options, item.correctIdx, rng);
    return {
      ...item,
      options: [
        shuffled.options[0],
        shuffled.options[1],
        shuffled.options[2],
        shuffled.options[3],
      ],
      correctIdx: shuffled.correctIndex,
    };
  });
}
