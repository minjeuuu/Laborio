import { MarioAvatar } from '../types/laborLaw';

export type GameDeckSetId =
  | 'set_a_foundations'
  | 'set_b_jurisprudence'
  | 'set_c_calculations'
  | 'set_d_bar_traps'
  | 'set_e_special_laws'
  | 'set_f_mock_bar_sprint'
  | 'set_g_leaves_mastery'
  | 'set_all_complete';

export interface GameDeckSetMeta {
  id: GameDeckSetId;
  label: string;
  badge: string;
  tagline: string;
  desc: string;
  color: string;
  focusTopics: string[];
}

export const GAME_DECK_SETS: GameDeckSetMeta[] = [
  {
    id: 'set_all_complete',
    label: 'All Sets Mixed (Grand Master)',
    badge: 'GRAND MASTER',
    tagline: 'Unrestricted random draw from all statutory & jurisprudential pools',
    desc: 'Combines statutory foundations, landmark cases, mathematical calculations, and bar exam traps into one comprehensive deck.',
    color: 'from-amber-500 to-yellow-400',
    focusTopics: ['Worlds 1–6 Complete', 'All Articles & Special Laws'],
  },
  {
    id: 'set_a_foundations',
    label: 'Set A: Core Codal Standards',
    badge: 'CODAL BASICS',
    tagline: 'Mandatory statutory minimums, normal hours, meal periods, and leaves',
    desc: 'Essential provisions of the Labor Code: Art. 82-85 hours, Art. 91 rest periods, Art. 94 regular holidays, Art. 97 wages, and statutory leaves.',
    color: 'from-emerald-600 to-teal-500',
    focusTopics: ['Art. 82–85 Hours & Meals', 'Art. 91–94 Rest & Holidays', 'R.A. 11210 Maternity'],
  },
  {
    id: 'set_b_jurisprudence',
    label: 'Set B: Landmark Jurisprudence',
    badge: 'SUPREME COURT',
    tagline: 'Leading Supreme Court doctrines, 4-fold test, and D.O. 174 rules',
    desc: 'Seminal Philippine labor doctrines: Songco wage definition, Mabeza non-diminution, Auto Bus SIL prescription, Loon burden of proof, and San Miguel retrenchment.',
    color: 'from-indigo-600 to-violet-500',
    focusTopics: ['Songco Doctrine', 'Mabeza Rule', 'Auto Bus Transport', 'Loon v. Power Master'],
  },
  {
    id: 'set_c_calculations',
    label: 'Set C: Multipliers & Payroll Math',
    badge: 'PAYROLL MATH',
    tagline: '125% OT, 130% Rest Day, 200% Holiday, 260% Stacked, and 13th Month',
    desc: 'Intensive mathematical and formula drills: daily-to-monthly conversions (365/313/261), night differential stacking (+10%), Pineda wage distortion, and 22.5d retirement pay.',
    color: 'from-sky-600 to-cyan-500',
    focusTopics: ['Art. 87 Overtime 125%', 'Art. 93 Rest Day 130%', 'Art. 94 Holiday 200%', 'P.D. 851 13th Month'],
  },
  {
    id: 'set_d_bar_traps',
    label: 'Set D: Bar Exam Traps & Tricky Exceptions',
    badge: 'BAR HIGH-YIELD',
    tagline: 'Prescriptive deadlines, twin-notice procedural rules, and coverage exceptions',
    desc: 'High-yield Bar Exam stumbling blocks: 1-year ULP vs 3-year money claims vs 4-year illegal dismissal; managerial staff vs supervisory unions; and P5M contracting requirements.',
    color: 'from-rose-600 to-red-500',
    focusTopics: ['3-Year vs 4-Year Prescription', 'Art. 82 Exclusions', 'Twin-Notice Procedure', 'D.O. 174 Substantial Capital'],
  },
  {
    id: 'set_e_special_laws',
    label: 'Set E: Special Protective Laws & Vulnerable Sectors',
    badge: 'SPECIAL LAWS',
    tagline: 'Batas Kasambahay, Telecommuting, Safe Spaces, Anti-Age & Child Labor',
    desc: 'Deep focus on special welfare statutes: R.A. 10361 domestic workers, R.A. 11165 telecommuting fair treatment, R.A. 11313 Safe Spaces, R.A. 10911 anti-age discrimination, and R.A. 9231 child labor hours.',
    color: 'from-purple-600 to-fuchsia-500',
    focusTopics: ['R.A. 10361 Kasambahay', 'R.A. 11165 Telecommuting', 'R.A. 11313 Safe Spaces', 'R.A. 9231 Child Labor'],
  },
  {
    id: 'set_f_mock_bar_sprint',
    label: 'Set F: Mock Bar Speed Blitz & Supreme Court Precedents',
    badge: 'BAR MOCK SPRINT',
    tagline: 'High-speed doctrine application, burden of proof shifts, and legal presumptions',
    desc: 'Fast-paced mock bar gauntlet testing instant doctrinal recognition: Fujitsu, Brent School, Sonza control test, and employer burden of proving payment.',
    color: 'from-amber-600 to-orange-500',
    focusTopics: ['Burden of Proof (Loon)', 'Fixed-Term Tests (Brent)', 'Independent Contractor Tests', 'ALAC Application'],
  },
  {
    id: 'set_g_leaves_mastery',
    label: 'Set G: Statutory Leaves & Special Welfare Benefits',
    badge: 'LEAVES MASTER',
    tagline: 'SIL, 105-day Maternity, Paternity, Solo Parent, VAWC, and Gynecological Leaves',
    desc: 'Exhaustive statutory leaves mastery: commutation rules, service qualification, salary coverage, and civil status conditions across all Philippine leave laws.',
    color: 'from-pink-600 to-rose-500',
    focusTopics: ['Art. 95 SIL 5 Days', 'R.A. 11210 Maternity 105d', 'R.A. 8187 Paternity 7d', 'R.A. 11861 Solo Parent 7d'],
  },
];

export type ArcadeBoardLengthId =
  | 'lightning_3'
  | 'quick_5'
  | 'standard_10'
  | 'championship_20'
  | 'supreme_gauntlet_30';

export interface ArcadeBoardLengthMeta {
  id: ArcadeBoardLengthId;
  label: string;
  roundsCount: number;
  badge: string;
  bonusMultiplier: number;
}

export const ARCADE_BOARD_LENGTHS: ArcadeBoardLengthMeta[] = [
  {
    id: 'lightning_3',
    label: 'Lightning Blitz',
    roundsCount: 3,
    badge: '3 ROUNDS',
    bonusMultiplier: 0.85,
  },
  {
    id: 'quick_5',
    label: 'Quick Blitz',
    roundsCount: 5,
    badge: '5 ROUNDS',
    bonusMultiplier: 1.0,
  },
  {
    id: 'standard_10',
    label: 'Standard Tournament',
    roundsCount: 10,
    badge: '10 ROUNDS',
    bonusMultiplier: 1.25,
  },
  {
    id: 'championship_20',
    label: 'Championship Marathon',
    roundsCount: 20,
    badge: '20 ROUNDS',
    bonusMultiplier: 1.6,
  },
  {
    id: 'supreme_gauntlet_30',
    label: 'Supreme Court Gauntlet',
    roundsCount: 30,
    badge: '30 ROUNDS',
    bonusMultiplier: 2.2,
  },
];

export type ArcadeWorldCategory =
  | 'world_all'
  | 'world_1'
  | 'world_2'
  | 'world_3'
  | 'world_4'
  | 'world_5'
  | 'world_6'
  | 'world_grand_classics'
  | 'favorites';

export interface ArcadeWorldFilterMeta {
  id: ArcadeWorldCategory;
  label: string;
  shortLabel: string;
  worldNumber?: number;
  color: string;
}

export const ARCADE_WORLD_FILTERS: ArcadeWorldFilterMeta[] = [
  { id: 'world_all', label: 'All Worlds (All 47 Games)', shortLabel: 'All Worlds', color: 'bg-slate-800' },
  { id: 'favorites', label: 'Starred Favorites', shortLabel: 'Favorites', color: 'bg-amber-500 text-slate-950' },
  { id: 'world_1', label: 'World 1: Hours of Work, Overtime & NSD', shortLabel: 'W1: Hours & OT', worldNumber: 1, color: 'bg-emerald-600' },
  { id: 'world_2', label: 'World 2: Rest Periods, Holidays & 13th Month', shortLabel: 'W2: Rest & Holidays', worldNumber: 2, color: 'bg-sky-600' },
  { id: 'world_3', label: 'World 3: Wages, Deductions & Contracting', shortLabel: 'W3: Wages & D.O. 174', worldNumber: 3, color: 'bg-indigo-600' },
  { id: 'world_4', label: 'World 4: Special Groups & Batas Kasambahay', shortLabel: 'W4: Special Groups', worldNumber: 4, color: 'bg-purple-600' },
  { id: 'world_5', label: 'World 5: Protective Laws, Safe Spaces & Anti-Age', shortLabel: 'W5: Protective Laws', worldNumber: 5, color: 'bg-rose-600' },
  { id: 'world_6', label: 'World 6: Statutory Leaves (Maternity, VAWC, Paternity)', shortLabel: 'W6: Statutory Leaves', worldNumber: 6, color: 'bg-pink-600' },
  { id: 'world_grand_classics', label: 'Grand Bar Arcade Classics (Courtroom, Kart & Platformer)', shortLabel: 'Grand Classics', color: 'bg-amber-600' },
];

export const GAME_WORLD_MAPPING: Record<string, ArcadeWorldCategory> = {
  // World 1
  yoshi_overtime: 'world_1',
  luigi_nightshift: 'world_1',
  hammer_blitz: 'world_1',
  payroll_stamp_desk: 'world_1',
  
  // World 2
  sorter: 'world_2',
  daisy_holiday_derby: 'world_2',
  pauline_wage_concert: 'world_2',
  memory: 'world_2',
  peach_block_match: 'world_2',
  toad_conveyor_sorter: 'world_2',
  
  // World 3
  whack: 'world_3',
  pipe_whack_violation: 'world_3',
  mansion: 'world_3',
  shy_conveyor: 'world_3',
  rosalina_observatory: 'world_3',
  wario_vault: 'world_3',
  kart_wage_drift: 'world_3',
  union_tower_defense: 'world_3',
  
  // World 4
  captain_toad_minecart: 'world_4',
  pipe_sorter: 'world_4',
  commissioner_sim: 'world_4',
  
  // World 5
  dry_bones_crypt: 'world_5',
  luigi_ghost_clause: 'world_5',
  chrono_blitz: 'world_5',
  kamek_duel: 'world_5',
  boo_burden: 'world_5',
  
  // World 6
  world6_clinic: 'world_6',
  peach_dispatch: 'world_6',
  yoshi_egg_catch: 'world_6',
  catcher: 'world_6',
  
  // Grand Classics
  courtroom: 'world_grand_classics',
  run2d: 'world_grand_classics',
  island3d: 'world_grand_classics',
  kart: 'world_grand_classics',
  coin_rush: 'world_grand_classics',
  bowser_axe_timing: 'world_grand_classics',
  chomp_tug_of_war: 'world_grand_classics',
  skybridge_dash: 'world_grand_classics',
  koopa_pinball: 'world_grand_classics',
  koopa_breaker: 'world_grand_classics',
  yoshi_toss: 'world_grand_classics',
  toad_slots: 'world_grand_classics',
  lakitu_climber: 'world_grand_classics',
  codal_word_hunt: 'world_grand_classics',
  bridge: 'world_grand_classics',
  toadette_relay: 'world_grand_classics',
  toadsworth_tribunal: 'world_grand_classics',
};

export const FAVORITE_GAMES_STORAGE_KEY = 'mario_vault_favorite_games_v1';

export function loadFavoriteGames(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FAVORITE_GAMES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : ['coin_rush', 'courtroom', 'pipe_whack_violation', 'kart_wage_drift'];
  } catch {
    return ['coin_rush', 'courtroom', 'pipe_whack_violation'];
  }
}

export function saveFavoriteGames(gameIds: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITE_GAMES_STORAGE_KEY, JSON.stringify(gameIds));
  } catch {
    // ignore
  }
}

export function toggleFavoriteGame(gameId: string): string[] {
  const current = loadFavoriteGames();
  const next = current.includes(gameId)
    ? current.filter((id) => id !== gameId)
    : [...current, gameId];
  saveFavoriteGames(next);
  return next;
}

/* ============================================================================
   CODAL CLOZE / VERBATIM RECITATION DRILL DATA
   ============================================================================ */

export interface CodalClozeArticle {
  id: string;
  articleNumber: string;
  title: string;
  worldNumber: number;
  fullVerbatimText: string;
  sourceStatute: string;
  keyPhrases: string[];
  blanks: {
    index: number;
    word: string;
    hint: string;
    isNumericOrPercentage: boolean;
  }[];
  doctrinalSummary: string;
  practicalApplication: string;
}

export const CODAL_CLOZE_ARTICLES: CodalClozeArticle[] = [
  {
    id: 'art_83',
    articleNumber: 'Art. 83',
    title: 'Normal Hours of Work',
    worldNumber: 1,
    sourceStatute: 'Labor Code of the Philippines, Presidential Decree No. 442',
    fullVerbatimText:
      'The normal hours of work of any employee shall not exceed eight (8) hours a day. Health personnel in cities and municipalities with a population of at least one million (1,000,000) or in hospitals and clinics with a bed capacity of at least one hundred (100) shall hold regular office hours for eight (8) hours a day, for five (5) days a week, or a total of forty (40) hours a week, exclusive of time for meals, except where the exigencies of the service require that such personnel work for six (6) days or forty-eight (48) hours, in which case, they shall be entitled to an additional compensation of at least thirty percent (30%) of their regular wage for work on the sixth day.',
    keyPhrases: ['eight (8) hours a day', 'one million', 'one hundred', 'forty (40) hours', 'thirty percent (30%)'],
    blanks: [
      { index: 0, word: 'eight', hint: 'Maximum standard daily normal hours', isNumericOrPercentage: true },
      { index: 1, word: 'one million', hint: 'City population threshold for health personnel 40-hr week', isNumericOrPercentage: true },
      { index: 2, word: 'one hundred', hint: 'Hospital bed capacity threshold', isNumericOrPercentage: true },
      { index: 3, word: 'forty', hint: 'Standard weekly total hours for covered health personnel', isNumericOrPercentage: true },
      { index: 4, word: 'thirty percent', hint: 'Mandatory premium for working on the 6th day', isNumericOrPercentage: true },
    ],
    doctrinalSummary:
      'Normal hours are strictly capped at 8 hours per workday. Covered health workers enjoy a 40-hour 5-day week; work on the 6th day demands a 30% premium.',
    practicalApplication:
      'Any time worked beyond 8 hours constitutes overtime and cannot be waived or converted to non-compensable rest without full premium pay.',
  },
  {
    id: 'art_86',
    articleNumber: 'Art. 86',
    title: 'Night Shift Differential',
    worldNumber: 1,
    sourceStatute: 'Labor Code of the Philippines, Presidential Decree No. 442',
    fullVerbatimText:
      'Every employee shall be paid a night shift differential of not less than ten percent (10%) of his regular wage for each hour of work performed between ten o’clock in the evening and six o’clock in the morning.',
    keyPhrases: ['ten percent (10%)', 'ten o’clock in the evening', 'six o’clock in the morning'],
    blanks: [
      { index: 0, word: 'ten percent', hint: 'Statutory minimum night shift differential percentage', isNumericOrPercentage: true },
      { index: 1, word: 'ten', hint: 'Start of statutory graveyard window (PM)', isNumericOrPercentage: true },
      { index: 2, word: 'six', hint: 'End of statutory graveyard window (AM)', isNumericOrPercentage: true },
    ],
    doctrinalSummary:
      'Night shift differential requires a minimum 10% premium for every hour worked between 10:00 PM and 6:00 AM.',
    practicalApplication:
      'NSD stacks on top of overtime and rest day rates. An employee working overtime during the graveyard shift receives base wage + OT premium + 10% NSD.',
  },
  {
    id: 'art_87',
    articleNumber: 'Art. 87',
    title: 'Overtime Work',
    worldNumber: 1,
    sourceStatute: 'Labor Code of the Philippines, Presidential Decree No. 442',
    fullVerbatimText:
      'Work may be performed beyond eight (8) hours a day provided that the employee is paid for the overtime work, an additional compensation equivalent to his regular wage plus at least twenty-five percent (25%) thereof. Work performed beyond eight hours on a holiday or rest day shall be paid an additional compensation equivalent to the rate of the first eight hours on a holiday or rest day plus at least thirty percent (30%) thereof.',
    keyPhrases: ['twenty-five percent (25%)', 'thirty percent (30%)', 'beyond eight (8) hours'],
    blanks: [
      { index: 0, word: 'eight', hint: 'Normal daily hour ceiling', isNumericOrPercentage: true },
      { index: 1, word: 'twenty-five percent', hint: 'Ordinary day overtime premium rate', isNumericOrPercentage: true },
      { index: 2, word: 'thirty percent', hint: 'Overtime premium rate on a holiday or rest day', isNumericOrPercentage: true },
    ],
    doctrinalSummary:
      'Overtime requires at least 125% total pay on an ordinary day and at least 130% of the first 8-hour rate on a holiday or rest day.',
    practicalApplication:
      'Overtime on a scheduled rest day yields 130% x 130% = 169% of the regular hourly rate.',
  },
  {
    id: 'art_88',
    articleNumber: 'Art. 88',
    title: 'Undertime Not Offset by Overtime',
    worldNumber: 1,
    sourceStatute: 'Labor Code of the Philippines, Presidential Decree No. 442',
    fullVerbatimText:
      'Undertime work on any particular day shall not be offset by overtime work on any other day. Permission given to the employee to go on leave on some other day of the week shall not exempt the employer from paying the additional compensation required in this Chapter.',
    keyPhrases: ['shall not be offset', 'on any other day', 'additional compensation'],
    blanks: [
      { index: 0, word: 'offset', hint: 'Prohibited action of compensating undertime with overtime', isNumericOrPercentage: false },
      { index: 1, word: 'overtime', hint: 'Work performed beyond 8 hours', isNumericOrPercentage: false },
      { index: 2, word: 'leave', hint: 'Permission granted by employer on another day', isNumericOrPercentage: false },
    ],
    doctrinalSummary:
      'Undertime on one day can never be offset against overtime on another day because overtime has a higher statutory premium value.',
    practicalApplication:
      'If an employee works 6 hours on Monday (2 hours undertime) and 10 hours on Tuesday (2 hours overtime), the employer must pay 2 hours OT on Tuesday and cannot simply net them to zero.',
  },
  {
    id: 'art_91',
    articleNumber: 'Art. 91',
    title: 'Weekly Rest Day',
    worldNumber: 2,
    sourceStatute: 'Labor Code of the Philippines, Presidential Decree No. 442',
    fullVerbatimText:
      'It shall be the duty of every employer, whether operating for profit or not, to provide each of his employees a rest period of not less than twenty-four (24) consecutive hours after every six (6) consecutive normal work days.',
    keyPhrases: ['twenty-four (24) consecutive hours', 'six (6) consecutive normal work days'],
    blanks: [
      { index: 0, word: 'twenty-four', hint: 'Minimum mandatory rest period hours', isNumericOrPercentage: true },
      { index: 1, word: 'consecutive', hint: 'Unbroken sequence of hours and workdays', isNumericOrPercentage: false },
      { index: 2, word: 'six', hint: 'Maximum consecutive workdays before rest is due', isNumericOrPercentage: true },
    ],
    doctrinalSummary:
      'Every employee is legally guaranteed at least 24 consecutive hours of rest after every 6 consecutive normal workdays.',
    practicalApplication:
      'The employer may schedule the rest day, but must respect the religious preference of the employee when founded on recognized religious grounds.',
  },
  {
    id: 'art_93',
    articleNumber: 'Art. 93',
    title: 'Compensation for Rest Day, Sunday or Holiday Work',
    worldNumber: 2,
    sourceStatute: 'Labor Code of the Philippines, Presidential Decree No. 442',
    fullVerbatimText:
      'Where an employee is made or permitted to work on his scheduled rest day, he shall be paid an additional compensation of at least thirty percent (30%) of his regular wage. An employee shall be entitled to such additional compensation for work performed on Sundays only when it is his established rest day. When the nature of the work of the employee is such that he has no regular workdays and no scheduled rest days, he shall be paid an additional compensation of at least thirty percent (30%) of his regular wage for work performed on Sundays and holidays. Work performed on any special holiday shall be paid an additional compensation of at least thirty percent (30%) of the regular wage of the employee. Where such holiday work falls on the employee’s scheduled rest day, he shall be entitled to an additional compensation of at least fifty percent (50%) of his regular wage.',
    keyPhrases: ['thirty percent (30%)', 'fifty percent (50%)', 'scheduled rest day'],
    blanks: [
      { index: 0, word: 'thirty percent', hint: 'Standard rest day work premium', isNumericOrPercentage: true },
      { index: 1, word: 'thirty percent', hint: 'Special non-working holiday rate premium', isNumericOrPercentage: true },
      { index: 2, word: 'fifty percent', hint: 'Special non-working holiday falling on rest day premium', isNumericOrPercentage: true },
    ],
    doctrinalSummary:
      'Work on a scheduled rest day = 130%. Work on a special holiday = 130%. Work on a special holiday on a scheduled rest day = 150%.',
    practicalApplication:
      'A daily worker with ₱610 daily wage who works 8 hours on a Special Non-Working Day that coincides with their rest day earns ₱610 x 1.50 = ₱915.',
  },
  {
    id: 'art_94',
    articleNumber: 'Art. 94',
    title: 'Right to Holiday Pay',
    worldNumber: 2,
    sourceStatute: 'Labor Code of the Philippines, Presidential Decree No. 442',
    fullVerbatimText:
      'Every worker shall be paid his regular daily wage during regular holidays, except in retail and service establishments regularly employing less than ten (10) workers. The employer may require an employee to work on any regular holiday but such employee shall be compensated for such work an amount equivalent to twice his regular rate.',
    keyPhrases: ['regular daily wage', 'less than ten (10) workers', 'twice his regular rate'],
    blanks: [
      { index: 0, word: 'regular', hint: 'Type of statutory holiday requiring 100% pay even if unworked', isNumericOrPercentage: false },
      { index: 1, word: 'ten', hint: 'Exemption threshold for retail/service establishments (less than)', isNumericOrPercentage: true },
      { index: 2, word: 'twice', hint: 'Compensation multiplier when required to work (200%)', isNumericOrPercentage: true },
    ],
    doctrinalSummary:
      'Employees receive 100% regular wage on regular holidays even if unworked, and 200% if required to work. Retail/service with <10 workers are exempt.',
    practicalApplication:
      'If an unworked regular holiday is preceded by an unauthorized absence, holiday pay may be withheld unless the day immediately preceding was a non-working day.',
  },
  {
    id: 'art_106',
    articleNumber: 'Art. 106',
    title: 'Contractor or Subcontractor',
    worldNumber: 3,
    sourceStatute: 'Labor Code of the Philippines as amended by D.O. 174-17',
    fullVerbatimText:
      'There is "labor-only" contracting where the person supplying workers to an employer does not have substantial capital or investment in the form of tools, equipment, machineries, work premises, among others, and the workers recruited and placed by such person are performing activities which are directly related to the principal business of such employer. In such cases, the person or intermediary shall be considered merely as an agent of the employer who shall be responsible to the workers in the same manner and extent as if the latter were directly employed by him.',
    keyPhrases: ['labor-only contracting', 'substantial capital', 'directly related', 'agent of the employer'],
    blanks: [
      { index: 0, word: 'labor-only', hint: 'Prohibited form of subcontracting under Philippine law', isNumericOrPercentage: false },
      { index: 1, word: 'substantial capital', hint: 'Statutory threshold (₱5,000,000 under D.O. 174)', isNumericOrPercentage: false },
      { index: 2, word: 'directly related', hint: 'Relationship of performed work to principal business', isNumericOrPercentage: false },
      { index: 3, word: 'agent', hint: 'Legal status of contractor when labor-only contracting is found', isNumericOrPercentage: false },
    ],
    doctrinalSummary:
      'Labor-only contracting is prohibited by law. If the contractor lacks substantial capital or tools, or lacks control, the principal is deemed the direct employer.',
    practicalApplication:
      'Under DOLE D.O. 174-17, legitimate contractors must have at least ₱5,000,000 paid-up capital/net worth and maintain the sole right of control.',
  },
  {
    id: 'art_113',
    articleNumber: 'Art. 113',
    title: 'Wage Deductions',
    worldNumber: 3,
    sourceStatute: 'Labor Code of the Philippines, Presidential Decree No. 442',
    fullVerbatimText:
      'No employer, in his own behalf or in behalf of any person, shall make any deduction from the wages of his employees, except: (a) In cases where the worker is insured with his consent by the employer, and the deduction is to recompense the employer for the amount paid him as premium on the insurance; (b) For union dues, in cases where the right of the worker or his union to check-off has been recognized by the employer or authorized in writing by the individual worker concerned; and (c) In cases where the employer is authorized by law or regulations issued by the Secretary of Labor.',
    keyPhrases: ['No employer', 'deduction from the wages', 'insured with his consent', 'union dues', 'authorized by law'],
    blanks: [
      { index: 0, word: 'deduction', hint: 'Withholding money from employee earnings', isNumericOrPercentage: false },
      { index: 1, word: 'consent', hint: 'Required agreement of employee for insurance recompense', isNumericOrPercentage: false },
      { index: 2, word: 'union dues', hint: 'Recognized check-off authorized in writing', isNumericOrPercentage: false },
      { index: 3, word: 'Secretary of Labor', hint: 'Official authorized to issue wage deduction regulations', isNumericOrPercentage: false },
    ],
    doctrinalSummary:
      'Wage deductions are strictly prohibited with only 3 statutory exceptions: consented insurance, union check-off, and explicit authorization by law or DOLE Secretary.',
    practicalApplication:
      'Deductions for cash bonds, company uniforms, or broken dishes are void unless the employee is proven at fault and deduction does not exceed 20% of weekly wage under Art. 114-115.',
  },
  {
    id: 'ra_11210',
    articleNumber: 'R.A. 11210',
    title: '105-Day Expanded Maternity Leave Law',
    worldNumber: 6,
    sourceStatute: 'Republic Act No. 11210 & DOLE Department Order No. 208-20',
    fullVerbatimText:
      'All female workers in the government and the private sector shall be granted one hundred five (105) days maternity leave with full pay and the option to extend for an additional thirty (30) days without pay. An additional fifteen (15) days paid leave shall be granted to female workers qualifying as a solo parent under Republic Act No. 8972. In cases of miscarriage or emergency termination of pregnancy, maternity leave of sixty (60) days with full pay shall be granted.',
    keyPhrases: ['one hundred five (105) days', 'thirty (30) days without pay', 'fifteen (15) days', 'sixty (60) days'],
    blanks: [
      { index: 0, word: 'one hundred five', hint: 'Total paid days for live childbirth', isNumericOrPercentage: true },
      { index: 1, word: 'thirty', hint: 'Optional unpaid extension days', isNumericOrPercentage: true },
      { index: 2, word: 'fifteen', hint: 'Additional paid days for qualified solo parents', isNumericOrPercentage: true },
      { index: 3, word: 'sixty', hint: 'Paid days granted for miscarriage or emergency pregnancy termination', isNumericOrPercentage: true },
    ],
    doctrinalSummary:
      'R.A. 11210 grants 105 paid days for live birth (+15 for solo parents = 120 days), 60 paid days for miscarriage, and allows 7 days allocation to the father.',
    practicalApplication:
      'Maternity leave applies to all instances of pregnancy regardless of frequency, civil status, or legitimacy of the child.',
  },
  {
    id: 'pd_851',
    articleNumber: 'P.D. 851',
    title: '13th Month Pay Law',
    worldNumber: 2,
    sourceStatute: 'Presidential Decree No. 851 as amended by Memorandum Order No. 28',
    fullVerbatimText:
      'All employers are hereby required to pay all their rank-and-file employees a 13th month pay not later than December 24 of every year. The 13th month pay shall not be less than one-twelfth (1/12) of the total basic salary earned by an employee within a calendar year, provided that the employee has worked for at least one (1) month during the calendar year.',
    keyPhrases: ['December 24', 'one-twelfth (1/12)', 'total basic salary', 'at least one (1) month'],
    blanks: [
      { index: 0, word: 'December 24', hint: 'Statutory deadline date for 13th month payment', isNumericOrPercentage: false },
      { index: 1, word: 'one-twelfth', hint: 'Fractional proportion of annual basic earnings', isNumericOrPercentage: true },
      { index: 2, word: 'basic salary', hint: 'Earnings component included in calculation (excludes OT and allowances)', isNumericOrPercentage: false },
      { index: 3, word: 'one', hint: 'Minimum months worked during calendar year to qualify', isNumericOrPercentage: true },
    ],
    doctrinalSummary:
      'All rank-and-file employees who rendered at least 1 month of service are entitled to 1/12 of their total basic salary earned in the calendar year by Dec 24.',
    practicalApplication:
      'Resigned or terminated employees are entitled to proportionate 13th month pay computed from the beginning of the year up to the time of their cessation.',
  },
];

/* ============================================================================
   BAR EXAM ISSUE SPOTTER & SCENARIO SOLVER DATA
   ============================================================================ */

export interface BarScenarioCase {
  id: string;
  caseTitle: string;
  worldNumber: number;
  barYearTag: string;
  difficulty: 'intermediate' | 'advanced' | 'bar_expert';
  facts: string;
  issuesList: {
    id: string;
    label: string;
    isGenuineIssue: boolean;
    explanation: string;
  }[];
  controllingArticles: {
    id: string;
    citation: string;
    title: string;
    isControlling: boolean;
  }[];
  computationQuestion: {
    prompt: string;
    options: {
      label: string;
      isCorrect: boolean;
      feedback: string;
    }[];
  };
  modelBarAnswer: {
    answer: string;
    legalBasis: string;
    application: string;
    conclusion: string;
  };
}

export const BAR_SCENARIO_CASES: BarScenarioCase[] = [
  {
    id: 'case_bpo_holiday_ot',
    caseTitle: 'The BPO Graveyard Holiday Shift',
    worldNumber: 1,
    barYearTag: 'Bar 2023 / 2019 Adapted',
    difficulty: 'advanced',
    facts:
      'Mario is a customer service representative at Koopa Global Solutions, earning a basic daily wage of ₱800.00 for an 8-hour day (₱100/hr). His scheduled rest day is Sunday. On December 25 (Christmas Day, a Regular Holiday), Mario was required to work from 8:00 PM Sunday until 6:00 AM Monday (a total of 10 hours, including 2 hours of overtime). No meal period deduction was made as he had a paid on-duty working snack. Koopa Global refuses to pay him night shift differential for the overtime hours, arguing that night differential does not apply to work done on a holiday rest day.',
    issuesList: [
      {
        id: 'iss_1',
        label: 'Whether Mario is entitled to Regular Holiday Pay on his scheduled rest day (260% rate).',
        isGenuineIssue: true,
        explanation: 'Work on a regular holiday falling on an employee’s scheduled rest day requires a 260% multiplier under Art. 94 in rel. to Art. 93.',
      },
      {
        id: 'iss_2',
        label: 'Whether Night Shift Differential applies concurrently during holiday rest day overtime (10PM to 6AM).',
        isGenuineIssue: true,
        explanation: 'NSD under Art. 86 applies to ALL hours worked between 10PM and 6AM regardless of day type or overtime status.',
      },
      {
        id: 'iss_3',
        label: 'Whether Mario can be dismissed for refusing to work overtime on a religious holiday.',
        isGenuineIssue: false,
        explanation: 'The facts state Mario did in fact work the hours; no dismissal issue arose.',
      },
      {
        id: 'iss_4',
        label: 'Whether overtime pay rate on a regular holiday rest day is 130% of the holiday rest day rate.',
        isGenuineIssue: true,
        explanation: 'Under Art. 87, overtime on a holiday/rest day is compensated at the first 8-hour rate plus at least 30% thereof (260% x 1.30 = 338%).',
      },
    ],
    controllingArticles: [
      { id: 'art_86_cite', citation: 'Art. 86, Labor Code', title: 'Night Shift Differential (10%)', isControlling: true },
      { id: 'art_87_cite', citation: 'Art. 87, Labor Code', title: 'Overtime Work on Holiday/Rest Day (30% premium)', isControlling: true },
      { id: 'art_93_cite', citation: 'Art. 93(c), Labor Code', title: 'Regular Holiday Falling on Rest Day (260%)', isControlling: true },
      { id: 'art_138_cite', citation: 'Art. 138, Labor Code', title: 'Child Labor Limitations', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'What is Mario’s hourly rate for overtime work rendered between 4:00 AM and 6:00 AM on this Regular Holiday Rest Day (inclusive of 10% NSD)?',
      options: [
        { label: '₱250.00 / hr', isCorrect: false, feedback: 'Incorrect. This only accounts for standard 125% OT + ordinary rates.' },
        { label: '₱338.00 / hr', isCorrect: false, feedback: 'Close! ₱338 is the OT rate (260% x 1.30 = 338%), but it excludes the mandatory 10% NSD.' },
        { label: '₱371.80 / hr', isCorrect: true, feedback: 'Correct! Base ₱100 x 260% = ₱260/hr. OT = ₱260 x 1.30 = ₱338/hr. Graveyard NSD adds +10%: ₱338 x 1.10 = ₱371.80/hr.' },
        { label: '₱420.00 / hr', isCorrect: false, feedback: 'Incorrect. Overcalculated.' },
      ],
    },
    modelBarAnswer: {
      answer: 'YES. Mario is entitled to 260% regular holiday rest day pay, 338% for the 2 overtime hours, and 10% Night Shift Differential stacked upon all hours between 10:00 PM and 6:00 AM.',
      legalBasis:
        'Under Article 94 in relation to Article 93(c) of the Labor Code, work performed on a regular holiday that coincides with an employee’s scheduled rest day entitles the worker to at least 260% of their regular rate for the first 8 hours. Under Article 87, overtime performed on such day demands an additional 30% of the applicable holiday rest day rate (260% × 1.30 = 338%). Furthermore, Article 86 mandates a night shift differential of not less than 10% of the applicable wage for each hour worked between 10:00 PM and 6:00 AM, without exception for holidays or overtime.',
      application:
        'Here, Mario worked from 8:00 PM Sunday to 6:00 AM Monday. The first 8 hours (8:00 PM to 4:00 AM) are compensable at the 260% regular holiday rest day rate, with hours between 10:00 PM and 4:00 AM earning an additional 10% NSD. The 2 overtime hours from 4:00 AM to 6:00 AM fall entirely within the night window and must be compensated at 338% plus 10% NSD (₱371.80/hr). Employer Koopa’s contention that NSD is inapplicable during holiday overtime is contrary to law.',
      conclusion:
        'WHEREFORE, Koopa Global Solutions is legally bound to pay Mario his full holiday rest day premium, overtime premiums, and stacked night shift differentials.',
    },
  },
  {
    id: 'case_contractor_capital',
    caseTitle: 'The ₱4M Janitorial Subcontractor',
    worldNumber: 3,
    barYearTag: 'Bar 2022 / 2018 Adapted',
    difficulty: 'advanced',
    facts:
      'Toad Hospital entered into a Service Agreement with Lakitu Cleaning Services to supply 30 janitors to maintain hospital hygiene and sterilize operating theaters. Lakitu Cleaning is registered with DOLE and has a paid-up capitalization of ₱4,000,000.00. Lakitu assigned a roving supervisor, but Toad Hospital’s Chief Nurse directly dictates the daily disinfection checklists, issues disciplinary warnings to janitors, and monitors their attendance. The janitors filed a complaint for regularization against Toad Hospital.',
    issuesList: [
      {
        id: 'iss_c1',
        label: 'Whether Lakitu Cleaning Services satisfies the substantial capital requirement under D.O. 174-17.',
        isGenuineIssue: true,
        explanation: 'D.O. 174-17 strictly mandates a minimum paid-up capitalization or net worth of at least ₱5,000,000.00.',
      },
      {
        id: 'iss_c2',
        label: 'Whether Toad Hospital exercised the right of control over the means and methods of the janitors’ work.',
        isGenuineIssue: true,
        explanation: 'Directly dictating disinfection checklists, supervising performance, and issuing disciplinary warnings establishes control.',
      },
      {
        id: 'iss_c3',
        label: 'Whether janitorial services in a hospital are directly related to the principal’s main business.',
        isGenuineIssue: true,
        explanation: 'Maintaining sterile operating rooms is integral and indispensable to hospital healthcare operations.',
      },
      {
        id: 'iss_c4',
        label: 'Whether the janitors are entitled to immediate treble damages against the Chief Nurse personally.',
        isGenuineIssue: false,
        explanation: 'Corporate officers acting within scope are not personally liable for treble damages absent bad faith or malice.',
      },
    ],
    controllingArticles: [
      { id: 'art_106_cite', citation: 'Art. 106, Labor Code', title: 'Contractor or Subcontractor', isControlling: true },
      { id: 'do_174_cite', citation: 'DOLE D.O. 174-17', title: 'Substantial Capital (₱5,000,000) & Control Test', isControlling: true },
      { id: 'art_295_cite', citation: 'Art. 295, Labor Code', title: 'Regular Employment', isControlling: true },
      { id: 'art_116_cite', citation: 'Art. 116, Labor Code', title: 'Withholding of Wages', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'Under D.O. 174-17, what is the legal consequence when a contractor has only ₱4,000,000 capital and the principal exercises control?',
      options: [
        { label: 'The contractor is granted a 6-month grace period to infuse ₱1,000,000 capital.', isCorrect: false, feedback: 'Incorrect. There is no grace period when workers file for regularization.' },
        { label: 'The arrangement is Labor-Only Contracting, and Toad Hospital is deemed the direct employer of the janitors.', isCorrect: true, feedback: 'Correct! Lacking ₱5M capital and failing the control test renders the contractor a mere agent; the principal becomes the direct employer.' },
        { label: 'The janitors must be dismissed immediately without separation pay.', isCorrect: false, feedback: 'Completely incorrect.' },
        { label: 'Toad Hospital is only solidarily liable for minimum wage, not regularization.', isCorrect: false, feedback: 'Incorrect. In labor-only contracting, the workers become regular employees of the principal.' },
      ],
    },
    modelBarAnswer: {
      answer: 'The complaint for regularization will PROSPER. Toad Hospital is deemed the direct employer of the 30 janitors because Lakitu Cleaning Services is engaged in prohibited labor-only contracting.',
      legalBasis:
        'Under Article 106 of the Labor Code and DOLE Department Order No. 174-17, Section 5, labor-only contracting exists where: (1) the contractor does not have substantial capital (defined as at least ₱5,000,000.00 paid-up capital or net worth), OR does not have substantial investments in tools and equipment; AND (2) the contractor’s workers perform activities directly related to the principal’s main business, OR the contractor does not exercise the right to control the performance of the work. When labor-only contracting is present, the contractor is considered merely an agent, and the principal is deemed the direct employer.',
      application:
        'In this case, Lakitu Cleaning Services possesses only ₱4,000,000.00 in paid-up capital, which fails the mandatory ₱5,000,000.00 statutory threshold. Moreover, Toad Hospital exercised control over the means and methods of work through its Chief Nurse, who directly issued daily disinfection checklists and disciplinary sanctions. Hospital sanitation and surgical sterilization are indispensable to healthcare operations.',
      conclusion:
        'ACCORDINGLY, the janitors are regular employees of Toad Hospital entitled to security of tenure and all standard benefits of regular hospital staff.',
    },
  },
  {
    id: 'case_maternity_retrenchment',
    caseTitle: 'The Disguised Maternity Retrenchment',
    worldNumber: 6,
    barYearTag: 'Bar 2024 / 2020 Adapted',
    difficulty: 'bar_expert',
    facts:
      'Princess Peach had been working as an executive accountant at Bowser Logistics for 3 years. Upon notifying her employer that she was 4 months pregnant and intending to avail herself of her 105-day expanded maternity leave under R.A. 11210, management placed her on a "redundancy and retrenchment shortlist." One month before her expected delivery date, she was served a 30-day notice of termination citing "business losses due to inflation," although the company posted ₱12,000,000 in net profit for the preceding fiscal quarter and hired two junior accountants during the same month.',
    issuesList: [
      {
        id: 'iss_m1',
        label: 'Whether Princess Peach’s dismissal is a prohibited termination by reason of pregnancy under Art. 135 and R.A. 11210.',
        isGenuineIssue: true,
        explanation: 'Terminating a female worker on account of pregnancy or intended maternity leave is unlawful and void under Art. 135.',
      },
      {
        id: 'iss_m2',
        label: 'Whether Bowser Logistics proved valid retrenchment with audited financial statements showing substantial losses.',
        isGenuineIssue: true,
        explanation: 'Retrenchment requires proof of actual, substantial, and imminent losses; posting ₱12M net profit refutes retrenchment.',
      },
      {
        id: 'iss_m3',
        label: 'Whether hiring new junior accountants while retrenching senior staff violates the fair and reasonable criteria rule.',
        isGenuineIssue: true,
        explanation: 'Hiring replacements immediately negates redundancy and bona fide retrenchment.',
      },
      {
        id: 'iss_m4',
        label: 'Whether Peach loses her maternity benefit upon receiving 30 days termination pay.',
        isGenuineIssue: false,
        explanation: 'Maternity leave benefits are guaranteed by law and cannot be extinguished by an illegal termination.',
      },
    ],
    controllingArticles: [
      { id: 'art_135_cite', citation: 'Art. 135, Labor Code', title: 'Prohibited Acts of Discrimination Against Women', isControlling: true },
      { id: 'ra_11210_sec14', citation: 'R.A. 11210, Sec. 14', title: 'Security of Tenure & Non-Dismissal on Account of Pregnancy', isControlling: true },
      { id: 'art_298_cite', citation: 'Art. 298, Labor Code', title: 'Authorized Causes (Retrenchment to Prevent Losses)', isControlling: true },
      { id: 'art_297_cite', citation: 'Art. 297, Labor Code', title: 'Just Causes (Misconduct)', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'If Princess Peach is adjudged illegally dismissed, what remedies and damages is she entitled to receive under Philippine labor jurisprudence?',
      options: [
        { label: 'Separation pay of 1/2 month per year of service only.', isCorrect: false, feedback: 'Incorrect. That is the rate for valid retrenchment, not illegal discriminatory dismissal.' },
        { label: 'Reinstatement without loss of seniority, full backwages from termination to actual reinstatement, full maternity benefits (105 days), plus moral and exemplary damages.', isCorrect: true, feedback: 'Correct! Under Art. 294 and R.A. 11210, illegal dismissal entitles the employee to reinstatement, full backwages, statutory maternity pay, and moral/exemplary damages for bad faith.' },
        { label: 'Only 30 days notice pay with no backwages.', isCorrect: false, feedback: 'Incorrect. Illegal dismissal awards full backwages.' },
        { label: 'A refund of her SSS contributions only.', isCorrect: false, feedback: 'Completely incorrect.' },
      ],
    },
    modelBarAnswer: {
      answer: 'Princess Peach was ILLEGALLY DISMISSED. The purported retrenchment was a sham designed to evade mandatory maternity leave under R.A. 11210.',
      legalBasis:
        'Under Article 135(2) of the Labor Code and Section 14 of R.A. 11210 (Expanded Maternity Leave Law), it is unlawful for an employer to discharge or discriminate against any woman employee on account of her pregnancy or while on maternity leave. Furthermore, under Article 298 of the Labor Code, retrenchment to prevent losses requires proof by clear and convincing evidence (audited financial statements) that the losses are substantial, actual, and imminent. The employer must also utilize fair and reasonable criteria in selecting employees for retrenchment.',
      application:
        'Here, Bowser Logistics failed to prove business losses; to the contrary, it recorded ₱12,000,000.00 in net profit. The hiring of two junior accountants during the same month demolishes any claim of redundancy or retrenchment. The timing of the dismissal—shortly after Peach declared her pregnancy and scheduled maternity leave—demonstrates evident bad faith and direct retaliation.',
      conclusion:
        'WHEREFORE, the dismissal is declared void. Princess Peach is entitled to immediate reinstatement, full backwages, her full 105-day maternity benefit, and moral and exemplary damages.',
    },
  },
  {
    id: 'case_service_charge_100',
    caseTitle: 'The 100% Restaurant Service Charge Squeeze',
    worldNumber: 2,
    barYearTag: 'Bar 2023 / 2021 Adapted',
    difficulty: 'advanced',
    facts:
      'Daisy Bistro operates a fine-dining establishment in Makati City and collects a mandatory 10% service charge on all guest checks, amounting to ₱500,000.00 for the month of December. Daisy Bistro management withheld 15% (₱75,000) for a "breakages, loss and pilferage reserve," distributed 25% (₱125,000) to its 5 managerial floor supervisors, and disbursed the remaining 60% (₱300,000) equally among its 20 rank-and-file waitstaff and cooks (₱15,000 each). The 20 servers filed a complaint before the DOLE Regional Director demanding 100% distribution.',
    issuesList: [
      {
        id: 'iss_sc1',
        label: 'Whether Daisy Bistro can lawfully retain 15% of service charge collections for breakages and losses.',
        isGenuineIssue: true,
        explanation: 'R.A. 11360 amended Art. 96 to mandate 100% equal distribution with zero employer retainage for losses or breakages.',
      },
      {
        id: 'iss_sc2',
        label: 'Whether managerial employees can lawfully share in service charge collections.',
        isGenuineIssue: true,
        explanation: 'Under R.A. 11360 and D.O. 206-19, managerial employees are explicitly barred from sharing in service charge collections.',
      },
      {
        id: 'iss_sc3',
        label: 'Whether Daisy Bistro is liable for double indemnity for minimum wage under-declaration.',
        isGenuineIssue: false,
        explanation: 'Service charges are supplementary hospitality proceeds under Art. 96, not basic regional minimum wage violations.',
      },
      {
        id: 'iss_sc4',
        label: 'Whether all 20 rank-and-file employees are entitled to divide 100% of the ₱500,000 collection equally.',
        isGenuineIssue: true,
        explanation: 'All collected service charges must be distributed completely and equally to all covered non-managerial staff.',
      },
    ],
    controllingArticles: [
      { id: 'art_96_cite', citation: 'Art. 96, Labor Code (as amended by R.A. 11360)', title: 'Service Charges (100% Distribution Rule)', isControlling: true },
      { id: 'do_206_19', citation: 'DOLE D.O. No. 206-19', title: 'Implementing Rules of R.A. 11360', isControlling: true },
      { id: 'art_114_cite', citation: 'Art. 114, Labor Code', title: 'Deposits for Loss or Damage', isControlling: true },
      { id: 'art_87_cite', citation: 'Art. 87, Labor Code', title: 'Overtime Work', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'Under R.A. 11360, how much should EACH of the 20 covered rank-and-file employees receive from the ₱500,000 service charge pool, and what deficiency is owed to each worker?',
      options: [
        { label: '₱15,000.00 each (₱0 deficiency)', isCorrect: false, feedback: 'Incorrect. This reflects the unlawful 60% distribution.' },
        { label: '₱20,000.00 each (₱5,000 deficiency)', isCorrect: false, feedback: 'Incorrect. ₱20,000 accounts for 80% distribution.' },
        { label: '₱25,000.00 each (₱10,000 deficiency per worker)', isCorrect: true, feedback: 'Correct! 100% of ₱500,000 divided by 20 covered workers = ₱25,000 each. Having received ₱15,000, Daisy Bistro owes each worker ₱10,000 deficiency!' },
        { label: '₱30,000.00 each (₱15,000 deficiency)', isCorrect: false, feedback: 'Incorrect. Overcalculated.' },
      ],
    },
    modelBarAnswer: {
      answer: 'NO. Daisy Bistro’s distribution scheme is unlawful. Under R.A. 11360, 100% of all service charges must be distributed completely and equally among covered employees, to the exclusion of managerial staff.',
      legalBasis:
        'Article 96 of the Labor Code, as amended by Republic Act No. 11360 and its Implementing Rules (DOLE D.O. 206-19), explicitly mandates that all service charges collected by hotels, restaurants, and similar establishments shall be distributed completely and equally among covered employees. The law entirely abolished the previous 85%-15% sharing ratio. Furthermore, managerial employees—those vested with powers to lay down and execute management policies or effectively recommend hiring, transfer, suspension, or discharge—are strictly barred from receiving any portion of the service charge.',
      application:
        'Here, management’s withholding of 15% for breakages and pilferage directly violates the 100% statutory mandate. Likewise, diverting 25% to managerial floor supervisors violates Section 2 of D.O. 206-19. The entire ₱500,000.00 collection must be divided equally among the 20 covered rank-and-file workers (₱25,000.00 per worker). Having disbursed only ₱15,000.00 each, the employer owes each worker a ₱10,000.00 deficiency.',
      conclusion:
        'WHEREFORE, Daisy Bistro must immediately disburse the withheld ₱200,000.00 to the 20 covered employees at ₱10,000.00 each, plus statutory legal interest.',
    },
  },
  {
    id: 'case_cww_health_personnel',
    caseTitle: 'Hospital Health Personnel 40-Hour Week vs Compressed Work Week',
    worldNumber: 1,
    barYearTag: 'Bar 2022 / 2017 Adapted',
    difficulty: 'advanced',
    facts:
      'Luigi is a registered staff nurse at Koopa Medical Center, a private tertiary hospital in Manila with a 200-bed capacity. To minimize shift turnovers, hospital management adopted a Compressed Work Week (CWW) requiring nurses to work four 12-hour shifts per week (totaling 48 hours). The hospital paid standard hourly rates without any overtime premium, citing a voluntary waiver signed by Luigi and the nurses’ association agreeing to the 48-hour schedule. Luigi demanded overtime pay for the 8 hours worked in excess of 40 hours per week under Article 83.',
    issuesList: [
      {
        id: 'iss_h1',
        label: 'Whether staff nurses in hospitals with at least 100-bed capacity have a statutory normal work week of 40 hours.',
        isGenuineIssue: true,
        explanation: 'Article 83 explicitly limits regular work hours of health personnel in >=100-bed hospitals to 8 hours/day for 5 days (40 hours/week).',
      },
      {
        id: 'iss_h2',
        label: 'Whether health personnel can validly waive overtime pay for the 6th workday (or excess over 40 hours) through a CWW agreement.',
        isGenuineIssue: true,
        explanation: 'Labor standards governing health personnel work hours are protective social legislation that cannot be waived by private contract.',
      },
      {
        id: 'iss_h3',
        label: 'Whether work rendered on the 6th day or in excess of 40 hours requires an additional 30% overtime premium under Art. 83.',
        isGenuineIssue: true,
        explanation: 'Article 83 mandates an additional compensation of at least thirty percent (30%) of the regular rate for work on the 6th day.',
      },
      {
        id: 'iss_h4',
        label: 'Whether Luigi is exempt from Title I as a managerial employee.',
        isGenuineIssue: false,
        explanation: 'Staff nurses performing bedside clinical patient care are rank-and-file healthcare workers, not managerial employees.',
      },
    ],
    controllingArticles: [
      { id: 'art_83_cite', citation: 'Art. 83, Labor Code', title: 'Normal Hours of Work (Health Personnel 40-Hour Rule)', isControlling: true },
      { id: 'art_87_cite', citation: 'Art. 87, Labor Code', title: 'Overtime Work (Premium Rates)', isControlling: true },
      { id: 'policy_inst_54', citation: 'DOLE Policy Instruction No. 54', title: 'Hospital Health Personnel Working Hours', isControlling: true },
      { id: 'art_91_cite', citation: 'Art. 91, Labor Code', title: 'Right to Weekly Rest Day', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'If Luigi earns a basic wage of ₱150.00/hour and worked 48 hours in a week at this 200-bed hospital, how much statutory overtime premium is he owed for the 8 hours rendered in excess of 40 hours?',
      options: [
        { label: '₱0.00 (waived under the valid CWW agreement)', isCorrect: false, feedback: 'Incorrect. Statutory labor standards cannot be waived by private contract.' },
        { label: '₱1,200.00 (straight basic pay without premium)', isCorrect: false, feedback: 'Incorrect. Article 83 requires an additional 30% premium.' },
        { label: '₱1,560.00 (8 hours × ₱150 × 130%)', isCorrect: true, feedback: 'Correct! Under Art. 83, health personnel required to render 48 hours must receive regular wage + at least 30% premium: 8 hrs × ₱150/hr × 1.30 = ₱1,560.00.' },
        { label: '₱1,800.00 (8 hours × ₱150 × 150%)', isCorrect: false, feedback: 'Incorrect. Overcalculated.' },
      ],
    },
    modelBarAnswer: {
      answer: 'YES. Nurse Luigi is entitled to overtime pay with an additional 30% premium for the 8 hours worked in excess of the statutory 40-hour weekly ceiling.',
      legalBasis:
        'Under Article 83, paragraph 2 of the Labor Code, the regular hours of work of health personnel in hospitals and clinics with a bed capacity of at least one hundred (100) beds shall be eight (8) hours a day, for five (5) days a week, or a total of forty (40) hours a week. Where the exigencies of the service require work on a sixth day (or in excess of 40 hours), such personnel shall be entitled to an additional compensation of not less than thirty percent (30%) of their regular rate for work performed on that day.',
      application:
        'Koopa Medical Center has a 200-bed capacity, making Article 83 squarely applicable. The CWW scheme requiring 48 weekly hours without overtime pay is void as contrary to law and public policy. Rights conferred by protective labor legislation cannot be defeated by waivers or collective agreements.',
      conclusion:
        'WHEREFORE, Koopa Medical Center is ordered to pay Luigi his accrued 30% overtime premiums (₱1,560.00 weekly) and conform his future shift schedules to the statutory 40-hour limit.',
    },
  },
  {
    id: 'case_telecommuting_parity',
    caseTitle: 'The Remote Telecommuting Fair Treatment Parity Claim',
    worldNumber: 4,
    barYearTag: 'Bar 2024 / 2021 Adapted',
    difficulty: 'advanced',
    facts:
      'Toad is an enterprise software engineer for Mushroom Cloud Systems under a formal telecommuting contract pursuant to R.A. 11165. He works from home from 9:00 PM to 5:00 AM (an 8-hour graveyard shift). The company monitors his keystrokes and webcam live via tracking software. Mushroom Cloud paid on-site night programmers a 10% Night Shift Differential, 5 days Service Incentive Leave (SIL), and 13th Month Pay, but denied NSD and SIL to Toad, asserting that remote workers "manage their own time" and therefore constitute exempt "field personnel" under Article 82.',
    issuesList: [
      {
        id: 'iss_t1',
        label: 'Whether a telecommuting employee whose actual work hours and performance are actively monitored qualifies as exempt field personnel.',
        isGenuineIssue: true,
        explanation: 'An employee whose hours are logged and constantly supervised is NOT field personnel under settled doctrine.',
      },
      {
        id: 'iss_t2',
        label: 'Whether the Fair Treatment Clause of R.A. 11165 mandates equal pay, leave, and night differential parity with on-site staff.',
        isGenuineIssue: true,
        explanation: 'R.A. 11165 Sec. 5 strictly guarantees that telecommuting employees receive terms not less than on-site counterparts.',
      },
      {
        id: 'iss_t3',
        label: 'Whether Toad is entitled to 10% Night Shift Differential for his 9PM–5AM remote schedule.',
        isGenuineIssue: true,
        explanation: 'Work rendered between 10:00 PM and 5:00 AM falls within the mandatory Art. 86 night window.',
      },
      {
        id: 'iss_t4',
        label: 'Whether telecommuting contracts require approval by the DOLE Secretary to be enforceable.',
        isGenuineIssue: false,
        explanation: 'Telecommuting agreements are voluntary between employer and employee; submission of notification to DOLE suffices.',
      },
    ],
    controllingArticles: [
      { id: 'ra_11165_sec5', citation: 'R.A. 11165, Sec. 5', title: 'Fair Treatment of Telecommuting Employees', isControlling: true },
      { id: 'art_82_cite', citation: 'Art. 82, Labor Code', title: 'Coverage & Field Personnel Exclusion', isControlling: true },
      { id: 'art_86_cite', citation: 'Art. 86, Labor Code', title: 'Night Shift Differential (10PM to 6AM)', isControlling: true },
      { id: 'art_95_cite', citation: 'Art. 95, Labor Code', title: 'Service Incentive Leave', isControlling: true },
    ],
    computationQuestion: {
      prompt: 'If Toad earns ₱200.00 per hour on his 9:00 PM to 5:00 AM shift, how many hours per day entitle him to statutory Night Shift Differential, and what is his daily NSD pay?',
      options: [
        { label: '8 hours = ₱160.00 daily', isCorrect: false, feedback: 'Incorrect. The hour from 9:00 PM to 10:00 PM is daytime work under Art. 86.' },
        { label: '7 hours (10:00 PM to 5:00 AM) = ₱140.00 daily', isCorrect: true, feedback: 'Correct! Art. 86 covers 10:00 PM to 6:00 AM. Between 10PM and 5AM are 7 hours: 7 hrs × ₱200/hr × 10% = ₱140.00 daily NSD.' },
        { label: '6 hours = ₱120.00 daily', isCorrect: false, feedback: 'Incorrect. Undercalculated.' },
        { label: '0 hours (remote workers are exempt from NSD)', isCorrect: false, feedback: 'Incorrect. Telecommuting workers enjoy full NSD rights.' },
      ],
    },
    modelBarAnswer: {
      answer: 'YES. Toad is entitled to full Night Shift Differential (Art. 86) and Service Incentive Leave (Art. 95) pursuant to the Fair Treatment guarantee of R.A. 11165.',
      legalBasis:
        'Under Section 5 of Republic Act No. 11165 (Telecommuting Act), the employer shall ensure that telecommuting employees receive fair treatment, including equal pay, overtime, night shift differential, leave benefits, and career development opportunities comparable to on-site employees. Furthermore, under Article 82 of the Labor Code and Auto Bus Transport Systems v. Bautista, the field personnel exemption applies only when the actual hours of work in the field cannot be determined with reasonable certainty. An employee whose keystrokes, webcam, and login hours are logged electronically is strictly non-exempt.',
      application:
        'Mushroom Cloud exercised constant electronic supervision over Toad’s entire shift. Consequently, Toad is not field personnel. Work performed between 10:00 PM and 5:00 AM (7 hours daily) commands a mandatory 10% Night Shift Differential. Depriving him of SIL and NSD while granting them to on-site peers directly breaches R.A. 11165.',
      conclusion:
        'WHEREFORE, Mushroom Cloud Systems must pay Toad all back Night Shift Differentials, credit his 5 days SIL, and maintain terms of parity with on-site staff.',
    },
  },
  {
    id: 'case_retirement_22_5_days',
    caseTitle: 'The 22.5-Day Retirement Pay Formula & 6-Month Fraction Rule',
    worldNumber: 2,
    barYearTag: 'Bar 2023 / 2018 Adapted',
    difficulty: 'advanced',
    facts:
      'Yoshi retired from Bowser Heavy Industries upon reaching the compulsory retirement age of 65, after rendering 14 years, 7 months, and 12 days of continuous service. His latest basic daily salary was ₱1,000.00 (monthly basic salary of ₱26,000.00). In computing his retirement pay, Bowser Heavy calculated 15 days basic salary for 14 years only (₱210,000.00), discarding the 7-month fraction and refusing to integrate his Service Incentive Leave and 13th Month Pay. Yoshi filed an Art. 302 claim demanding full statutory retirement benefits.',
    issuesList: [
      {
        id: 'iss_r1',
        label: 'Whether a fraction of at least six (6) months of service must be credited as one (1) whole year of service under Art. 302.',
        isGenuineIssue: true,
        explanation: 'Article 302 expressly provides that a fraction of at least 6 months shall be considered as one whole year (14 yrs 7 mos = 15 years).',
      },
      {
        id: 'iss_r2',
        label: 'Whether statutory "one-half month salary" means 22.5 days (15 days basic + 5 days SIL + 2.5 days 13th month).',
        isGenuineIssue: true,
        explanation: 'Under Capitol Wireless and Art. 302, one-half month salary is legally defined as 22.5 days.',
      },
      {
        id: 'iss_r3',
        label: 'Whether Bowser Heavy can validly exclude 13th month pay from the retirement computation.',
        isGenuineIssue: true,
        explanation: 'Article 302 explicitly includes 1/12 of the 13th month pay in the statutory one-half month retirement salary.',
      },
      {
        id: 'iss_r4',
        label: 'Whether Yoshi forfeits retirement pay because the company has no registered CBA or retirement plan.',
        isGenuineIssue: false,
        explanation: 'In the absence of a retirement plan or CBA, the statutory minimum under Art. 302 automatically governs.',
      },
    ],
    controllingArticles: [
      { id: 'art_302_cite', citation: 'Art. 302 [formerly 287], Labor Code', title: 'Retirement Pay (R.A. 7641)', isControlling: true },
      { id: 'capitol_wireless', citation: 'Capitol Wireless, Inc. v. Confesor (G.R. No. 117174)', title: 'The 22.5-Day Statutory Formula', isControlling: true },
      { id: 'grace_christian', citation: 'Grace Christian High School v. Lavandera', title: 'Component Elements of Retirement Pay', isControlling: true },
      { id: 'art_94_cite', citation: 'Art. 94, Labor Code', title: 'Right to Holiday Pay', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'Applying the 22.5-day formula and 6-month fraction rule, what is Yoshi’s total statutory retirement pay, and what balance does Bowser Heavy owe him?',
      options: [
        { label: 'Total: ₱210,000.00 (Bowser Heavy paid in full)', isCorrect: false, feedback: 'Incorrect. This ignores the 7.5 days/yr components and the 7-month fraction.' },
        { label: 'Total: ₱315,000.00 (balance owed: ₱105,000.00)', isCorrect: false, feedback: 'Incorrect. 14 years × 22.5 days = 315 days, but misses the 15th year fraction.' },
        { label: 'Total: ₱337,500.00 (balance owed: ₱127,500.00)', isCorrect: true, feedback: 'Correct! 14 yrs 7 mos rounds up to 15 years. 15 yrs × 22.5 days × ₱1,000 = ₱337,500.00. Minus ₱210,000 paid = ₱127,500.00 deficiency owed!' },
        { label: 'Total: ₱390,000.00 (balance owed: ₱180,000.00)', isCorrect: false, feedback: 'Incorrect. Overcalculated.' },
      ],
    },
    modelBarAnswer: {
      answer: 'Yoshi is entitled to a total retirement pay of ₱337,500.00 based on fifteen (15) creditable years of service at 22.5 days per year.',
      legalBasis:
        'Under Article 302 of the Labor Code (as amended by R.A. 7641) and settled jurisprudence (Capitol Wireless, Inc. v. Confesor), in the absence of a retirement plan, an employee retiring at age 60 or 65 is entitled to retirement pay equivalent to at least one-half (1/2) month salary for every year of service, a fraction of at least six (6) months being considered as one whole year. The statutory term "one-half month salary" encompasses: (1) fifteen (15) days salary based on the latest basic wage; (2) five (5) days of Service Incentive Leave; and (3) one-twelfth (1/12) of the 13th Month Pay, which equals 2.5 days (15 + 5 + 2.5 = 22.5 days per year).',
      application:
        'Here, Yoshi completed 14 years and 7 months; the 7-month fraction must be counted as 1 full year, yielding 15 creditable years. Multiplying 15 years by 22.5 days gives 337.5 days. At Yoshi’s latest daily wage of ₱1,000.00, his total retirement entitlement is ₱337,500.00. Bowser Heavy’s exclusion of the 7-month fraction, SIL, and 13th-month components violates the plain text of the law.',
      conclusion:
        'WHEREFORE, Bowser Heavy Industries is ordered to pay Yoshi the remaining balance of ₱127,500.00, plus legal interest of 6% per annum until full satisfaction.',
    },
  },
  {
    id: 'case_two_notice_agabon',
    caseTitle: 'The Agabon Twin Notice Rule & Just Cause Nominal Damages',
    worldNumber: 5,
    barYearTag: 'Bar 2022 / 2019 Adapted',
    difficulty: 'advanced',
    facts:
      'Wario, a warehouse supervisor at Koopa Storage, was caught on security CCTV stealing 5 boxes of industrial copper wires worth ₱150,000.00. Upon discovering the footage, the general manager confronted Wario orally, immediately confiscated his company ID, and handed him a termination letter stating: "You are fired effective immediately for theft and serious misconduct." No written notice to explain was issued, and no hearing was conducted. Wario admitted the theft before the Labor Arbiter but claimed his dismissal was illegal for utter lack of statutory due process.',
    issuesList: [
      {
        id: 'iss_a1',
        label: 'Whether the existence of a just cause (serious misconduct / theft) renders the dismissal valid despite the absence of procedural due process.',
        isGenuineIssue: true,
        explanation: 'Under the landmark Agabon doctrine, a dismissal based on a just cause is UPHELD as valid, but procedural lapse warrants nominal damages.',
      },
      {
        id: 'iss_a2',
        label: 'Whether Wario is entitled to reinstatement and full backwages.',
        isGenuineIssue: true,
        explanation: 'An employee dismissed for a proven just cause is NOT entitled to reinstatement or backwages.',
      },
      {
        id: 'iss_a3',
        label: 'Whether Koopa Storage is liable for statutory nominal damages for violating the Twin-Notice Rule.',
        isGenuineIssue: true,
        explanation: 'Under Agabon v. NLRC, an employer who dismisses for just cause without procedural due process must pay ₱30,000 nominal damages.',
      },
      {
        id: 'iss_a4',
        label: 'Whether oral confrontation satisfies the constitutional right to notice and hearing.',
        isGenuineIssue: false,
        explanation: 'King of Kings strictly requires written notice specifying the ground and giving at least 5 calendar days to explain.',
      },
    ],
    controllingArticles: [
      { id: 'art_297_cite', citation: 'Art. 297 [282], Labor Code', title: 'Termination by Employer (Serious Misconduct / Fraud)', isControlling: true },
      { id: 'art_292b_cite', citation: 'Art. 292(b) [277], Labor Code', title: 'Statutory Due Process (Twin-Notice Rule)', isControlling: true },
      { id: 'agabon_doctrine', citation: 'Agabon v. NLRC (G.R. No. 158693)', title: 'The Agabon Doctrine (Valid Dismissal + Nominal Damages)', isControlling: true },
      { id: 'king_of_kings', citation: 'King of Kings Transport v. Mamac', title: 'Twin-Notice Minimum Standards (5 Calendar Days Rule)', isControlling: true },
    ],
    computationQuestion: {
      prompt: 'Under the prevailing Agabon / Jaka doctrines, what is the controlling statutory liability of an employer who proves a JUST cause under Art. 297 but completely omitted the Twin-Notice Rule?',
      options: [
        { label: 'Reinstatement + Full Backwages from dismissal to finality.', isCorrect: false, feedback: 'Incorrect. Reinstatement and backwages apply only to illegal dismissal (no just/authorized cause).' },
        { label: 'Separation pay of 1 month per year of service.', isCorrect: false, feedback: 'Incorrect. Dismissal for serious misconduct bars separation pay.' },
        { label: 'Dismissal is SUSTAINED, but employer must pay ₱30,000.00 nominal damages to the employee for violation of statutory due process.', isCorrect: true, feedback: 'Correct! Under Agabon v. NLRC, dismissal for just cause without due process is valid, but the employer is penalized ₱30,000.00 in nominal damages.' },
        { label: 'Dismissal is void and the employee must be promoted.', isCorrect: false, feedback: 'Completely absurd.' },
      ],
    },
    modelBarAnswer: {
      answer: 'The dismissal of Wario is SUSTAINED as valid because there was a proven just cause (theft/serious misconduct). However, Koopa Storage is liable to pay Wario ₱30,000.00 in nominal damages for violating statutory procedural due process.',
      legalBasis:
        'In the landmark ruling of Agabon v. NLRC (G.R. No. 158693), the Supreme Court en banc abandoned the previous Serrano doctrine and held that if the dismissal is for a just cause under Article 297 of the Labor Code, but the employer fails to comply with the statutory two-notice rule, the dismissal is not illegal; the dismissal remains valid and effective, but the employer must pay indemnity in the form of nominal damages (tempered at ₱30,000.00 for just cause, and ₱50,000.00 under Jaka for authorized cause).',
      application:
        'Here, Wario committed theft of company property, which constitutes serious misconduct and breach of trust under Art. 297, disqualifying him from reinstatement and backwages. However, Koopa Storage violated the Twin-Notice Rule by executing an on-the-spot verbal termination without giving Wario a written notice to explain with at least 5 calendar days to respond, nor a formal notice of decision.',
      conclusion:
        'WHEREFORE, the complaint for illegal dismissal is DISMISSED, but Koopa Storage is ordered to pay Wario the sum of ₱30,000.00 as nominal damages for failure to observe statutory procedural due process.',
    },
  },
  {
    id: 'case_vawc_bpo_leave',
    caseTitle: 'The 10-Day Anti-VAWC Paid Leave & Barangay Protection Order',
    worldNumber: 6,
    barYearTag: 'Bar 2024 / 2020 Adapted',
    difficulty: 'advanced',
    facts:
      'Birdo is a customer service associate at Bowser Teleperformance. She suffered severe physical abuse and threats from her live-in common-law partner of 3 years, with whom she has a 1-year-old child. Birdo applied for and secured a Barangay Protection Order (BPO) from her Punong Barangay. She immediately submitted the BPO to HR and requested 10 days of paid Anti-VAWC Leave under R.A. 9262 to attend court hearings and relocate her child. Bowser Teleperformance denied the leave with pay, contending that R.A. 9262 applies exclusively to legally married spouses and that domestic partners can only use unpaid personal time.',
    issuesList: [
      {
        id: 'iss_v1',
        label: 'Whether R.A. 9262 (Anti-VAWC Act) applies to dating and common-law relationships without formal marriage.',
        isGenuineIssue: true,
        explanation: 'Section 3 of R.A. 9262 explicitly covers women in dating, sexual, or live-in relationships or with whom the offender has a common child.',
      },
      {
        id: 'iss_v2',
        label: 'Whether presentation of a Barangay Protection Order (BPO) or certification from the Barangay Captain entitles the woman worker to 10 days paid leave.',
        isGenuineIssue: true,
        explanation: 'Under Section 43 of R.A. 9262, submitting a BPO, TPO, or Barangay certification compels employer compliance with full pay.',
      },
      {
        id: 'iss_v3',
        label: 'Whether an employer who denies paid VAWC leave commits an unlawful discriminatory practice punishable by criminal and civil sanctions.',
        isGenuineIssue: true,
        explanation: 'Refusal to grant paid VAWC leave violates Section 43 of R.A. 9262 and gives rise to damages and administrative sanctions.',
      },
      {
        id: 'iss_v4',
        label: 'Whether Birdo must exhaust her company vacation and sick leaves before availing of the 10-day VAWC leave.',
        isGenuineIssue: false,
        explanation: 'VAWC leave is a separate, non-cumulative statutory benefit that can be availed of without exhausting other leave credits.',
      },
    ],
    controllingArticles: [
      { id: 'ra_9262_sec43', citation: 'R.A. 9262, Sec. 43', title: 'Entitlement to 10 Days Paid Leave of Absence', isControlling: true },
      { id: 'ra_9262_sec3', citation: 'R.A. 9262, Sec. 3', title: 'Definition of VAWC & Covered Relationships', isControlling: true },
      { id: 'dole_dept_circ_1', citation: 'DOLE Department Circular No. 01-04', title: 'Guidelines on Administration of R.A. 9262 Leave', isControlling: true },
      { id: 'art_87_cite', citation: 'Art. 87, Labor Code', title: 'Overtime Work', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'If Birdo earns ₱1,200.00 daily basic wage and Bowser Teleperformance unlawfully deducted 10 days of salary when she availed of the BPO leave, what total statutory compensation must HR restore to Birdo?',
      options: [
        { label: '₱0.00 (leave was unpaid due to absence of marriage)', isCorrect: false, feedback: 'Incorrect. R.A. 9262 expressly covers dating and live-in relationships.' },
        { label: '₱6,000.00 (half-pay benefit)', isCorrect: false, feedback: 'Incorrect. VAWC leave is a full-pay statutory benefit.' },
        { label: '₱12,000.00 (10 days × ₱1,200.00 basic pay with full benefits)', isCorrect: true, feedback: 'Correct! R.A. 9262 Sec. 43 mandates 10 days of paid leave with full pay (basic wage + mandatory allowances): 10 days × ₱1,200.00 = ₱12,000.00 restored!' },
        { label: '₱15,000.00', isCorrect: false, feedback: 'Incorrect. Overcalculated.' },
      ],
    },
    modelBarAnswer: {
      answer: 'YES. Birdo is entitled to ten (10) days of fully paid Anti-VAWC leave under Section 43 of R.A. 9262. Bowser Teleperformance’s refusal violates the law.',
      legalBasis:
        'Under Section 3 and Section 43 of Republic Act No. 9262 (Anti-Violence Against Women and Their Children Act of 2004) and DOLE Department Circular No. 01 (Series of 2004), a female employee who is a victim of violence is entitled to a paid leave of absence up to ten (10) days, in addition to other paid leaves under the Labor Code and company policy. The law expressly applies not only to married spouses but also to women who have a dating, sexual, or cohabiting relationship with the offender, or with whom the offender has a child. The only prerequisite is the submission of a Barangay Protection Order (BPO), Temporary Protection Order (TPO), or certification from the Punong Barangay or court.',
      application:
        'Here, Birdo shared a 3-year common-law relationship with the abuser and has a child with him. She duly presented an authentic BPO from her barangay. Management’s assertion that R.A. 9262 applies exclusively to married women is legally bankrupt. Withholding pay for the 10 days constitutes an unlawful wage deduction under Article 113 and a violation of R.A. 9262.',
      conclusion:
        'WHEREFORE, Bowser Teleperformance is ordered to credit Birdo 10 days of full paid leave, refund the ₱12,000.00 deducted from her wages, and cease and desist from discriminating against VAWC beneficiaries.',
    },
  },
  {
    id: 'case_field_personnel_sil',
    caseTitle: 'The Bus Driver Field Personnel Test & Accrued SIL Claim',
    worldNumber: 1,
    barYearTag: 'Bar 2023 / 2019 Adapted',
    difficulty: 'advanced',
    facts:
      'Mario worked for 5 continuous years as a provincial passenger bus driver for Koopa Transit Corp. plying the Manila-Tuguegarao route. His compensation was fixed at ₱900.00 per trip. Throughout his employment, Koopa Transit enforced fixed dispatch schedules, assigned ticket inspectors at highway checkpoints, and tracked bus speed and stops via an onboard GPS telemetry box. Upon resigning after 5 years, Mario demanded cash conversion of his accrued Service Incentive Leave (SIL) under Art. 95 (5 days per year = 25 days). Koopa Transit denied the claim, asserting that bus drivers are "field personnel" exempt from SIL under Article 82.',
    issuesList: [
      {
        id: 'iss_f1',
        label: 'Whether a provincial bus driver subject to GPS tracking, dispatch schedules, and highway inspectors is an exempt field personnel under Art. 82.',
        isGenuineIssue: true,
        explanation: 'Under Auto Bus Transport Systems v. Bautista, drivers whose time and performance are monitored are NOT field personnel.',
      },
      {
        id: 'iss_f2',
        label: 'Whether commission/trip-rate workers are entitled to Service Incentive Leave.',
        isGenuineIssue: true,
        explanation: 'Payment by trip, commission, or boundary does not automatically exclude an employee from SIL if they are not genuine field personnel.',
      },
      {
        id: 'iss_f3',
        label: 'Whether Mario’s claim for all 5 years of accumulated SIL has prescribed under the 3-year prescriptive period of Art. 306.',
        isGenuineIssue: true,
        explanation: 'Under Auto Bus v. Bautista, the 3-year prescriptive period for SIL begins only upon termination of employment or demand.',
      },
      {
        id: 'iss_f4',
        label: 'Whether Koopa Transit must pay treble damages for non-payment of SIL.',
        isGenuineIssue: false,
        explanation: 'Treble damages apply to specific statutory violations (e.g., child labor / anti-trust), not standard SIL money claims.',
      },
    ],
    controllingArticles: [
      { id: 'art_82_cite', citation: 'Art. 82, Labor Code', title: 'Coverage & Field Personnel Definition', isControlling: true },
      { id: 'art_95_cite', citation: 'Art. 95, Labor Code', title: 'Right to Service Incentive Leave', isControlling: true },
      { id: 'autobus_case', citation: 'Auto Bus Transport Systems v. Bautista (G.R. No. 156367)', title: 'Controlling Precedent on Bus Drivers & SIL Prescription', isControlling: true },
      { id: 'art_306_cite', citation: 'Art. 306 [291], Labor Code', title: 'Money Claims 3-Year Prescriptive Period', isControlling: true },
    ],
    computationQuestion: {
      prompt: 'If Mario earned ₱900.00 daily equivalent and rendered 5 years of service with zero SIL days availed, what is his total commutable SIL cash award, and did any portion prescribe?',
      options: [
        { label: '₱0.00 (all 5 years prescribed under the 3-year statute of limitations)', isCorrect: false, feedback: 'Incorrect. Under Auto Bus, SIL prescription does not commence until demand or termination.' },
        { label: '₱13,500.00 (only the last 3 years: 15 days × ₱900)', isCorrect: false, feedback: 'Incorrect. The 3-year prescriptive period runs from dismissal, allowing recovery of all 5 cumulative years.' },
        { label: '₱22,500.00 (5 years × 5 days = 25 days × ₱900.00; zero prescription)', isCorrect: true, feedback: 'Correct! Under Auto Bus Transport Systems v. Bautista, unused SIL accumulates indefinitely during employment. Prescription begins only upon resignation/termination. 25 days × ₱900.00 = ₱22,500.00!' },
        { label: '₱27,000.00 (30 days total)', isCorrect: false, feedback: 'Incorrect. Overcalculated.' },
      ],
    },
    modelBarAnswer: {
      answer: 'YES. Mario is entitled to the full cash conversion of his 25 days of accrued Service Incentive Leave (₱22,500.00). None of his SIL claims have prescribed.',
      legalBasis:
        'In the landmark case of Auto Bus Transport Systems, Inc. v. Bautista (G.R. No. 156367), the Supreme Court ruled that bus drivers and conductors are not field personnel if their work is supervised through dispatchers, highway checkpoints, or electronic systems that ascertain their working hours. Consequently, they are covered by Article 95 on Service Incentive Leave. Crucially, the Court held that unused SIL is commutable to cash at the end of each year or may be accumulated until retirement or separation. The three-year prescriptive period under Article 306 (formerly 291) begins to run only upon the employer’s refusal to pay following a demand, or from the date of the employee’s separation from service.',
      application:
        'Here, Koopa Transit enforced dispatch schedules, checkpoints, and GPS telemetry, proving Mario was not an exempt field personnel. Because Mario filed his claim immediately upon resigning, the 3-year prescriptive clock began only upon separation, entitling him to recover the full accumulated SIL for all 5 years of service (5 days × 5 years = 25 days × ₱900 = ₱22,500.00).',
      conclusion:
        'WHEREFORE, Koopa Transit is ordered to pay Mario ₱22,500.00 representing accrued commutable SIL, plus legal interest of 6% per annum.',
    },
  },
  {
    id: 'case_kasambahay_dismissal',
    caseTitle: 'The Batas Kasambahay 15-Day Indemnity & 13th Month Pay',
    worldNumber: 4,
    barYearTag: 'Bar 2022 / 2018 Adapted',
    difficulty: 'advanced',
    facts:
      'Toadette was engaged as a stay-in domestic worker (Kasambahay) by Bowser in Quezon City under a signed 1-year employment contract with a monthly wage of ₱6,500.00 (the prevailing NCR Kasambahay minimum). After 4 months of faithful service, Bowser dismissed Toadette on 2 hours notice, stating: "I lost money in the stock market; I can no longer afford a maid." Bowser paid her earned salary for the 4th month but refused to pay separation indemnity or 13th Month Pay, claiming that 13th Month Pay applies only to private commercial businesses and that domestic employment can be terminated at the master’s will.',
    issuesList: [
      {
        id: 'iss_k1',
        label: 'Whether an unjustly terminated Kasambahay is entitled to indemnity of fifteen (15) days compensation under R.A. 10361 Sec. 32.',
        isGenuineIssue: true,
        explanation: 'Section 32 of R.A. 10361 explicitly mandates indemnity of 15 days compensation if dismissed without just cause before contract expiry.',
      },
      {
        id: 'iss_k2',
        label: 'Whether domestic workers (Kasambahay) are entitled to 13th Month Pay under R.A. 10361.',
        isGenuineIssue: true,
        explanation: 'Section 25 of Batas Kasambahay guarantees 13th Month Pay to all domestic workers who have rendered at least 1 month of service.',
      },
      {
        id: 'iss_k3',
        label: 'Whether Toadette is entitled to 5 days Service Incentive Leave after 4 months of service.',
        isGenuineIssue: false,
        explanation: 'Service Incentive Leave under R.A. 10361 Sec. 29 requires at least one (1) full year of service; 4 months does not qualify for SIL.',
      },
      {
        id: 'iss_k4',
        label: 'Whether domestic contracts can be terminated at will without statutory liability.',
        isGenuineIssue: true,
        explanation: 'R.A. 10361 granted security of tenure during the contract term; termination without just cause demands statutory indemnity.',
      },
    ],
    controllingArticles: [
      { id: 'ra_10361_sec32', citation: 'R.A. 10361, Sec. 32', title: 'Indemnity for Unjust Termination of Kasambahay', isControlling: true },
      { id: 'ra_10361_sec25', citation: 'R.A. 10361, Sec. 25', title: '13th Month Pay of Domestic Workers', isControlling: true },
      { id: 'ra_10361_sec29', citation: 'R.A. 10361, Sec. 29', title: 'Service Incentive Leave (1 Year Requirement)', isControlling: true },
      { id: 'pd_851_cite', citation: 'P.D. 851', title: '13th Month Pay Decree', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'If Toadette earned ₱6,500.00 monthly and was dismissed after exactly 4 months of service, what is her total statutory financial award (15-day indemnity + proportionate 13th Month Pay)?',
      options: [
        { label: '₱0.00 (domestic workers have no statutory severance)', isCorrect: false, feedback: 'Incorrect. R.A. 10361 provides express statutory remedies.' },
        { label: '₱3,250.00 (15-day indemnity only)', isCorrect: false, feedback: 'Close, but misses her proportionate 13th Month Pay.' },
        { label: '₱5,416.67 (₱3,250.00 indemnity + ₱2,166.67 proportionate 13th month)', isCorrect: true, feedback: 'Correct! 15-day indemnity = ₱6,500 × (15/30) = ₱3,250.00. Proportionate 13th month = ₱6,500 × (4/12) = ₱2,166.67. Total = ₱5,416.67!' },
        { label: '₱6,500.00 (1 full month pay)', isCorrect: false, feedback: 'Incorrect calculation.' },
      ],
    },
    modelBarAnswer: {
      answer: 'YES. Toadette was unjustly dismissed and is entitled to 15 days compensation as statutory indemnity (₱3,250.00) plus proportionate 13th Month Pay for 4 months (₱2,166.67), totaling ₱5,416.67.',
      legalBasis:
        'Under Section 32 of Republic Act No. 10361 (Domestic Workers Act or Batas Kasambahay), if the domestic worker is dismissed without just cause before the expiration of the employment contract, the employer shall pay the domestic worker the compensation earned plus an indemnity equivalent to fifteen (15) days work. Furthermore, under Section 25 of the same Act, a domestic worker who has rendered at least one (1) month of service is entitled to a 13th Month Pay, which shall be computed proportionately if separated before year-end.',
      application:
        'Bowser terminated Toadette’s 1-year contract after only 4 months due to personal financial losses, which does not constitute a valid just cause under Section 34 of R.A. 10361. Bowser must pay Toadette 15 days indemnity (₱3,250.00) and her proportionate 13th Month Pay for 4 months of service (₱6,500.00 × 4/12 = ₱2,166.67). However, she is not entitled to SIL because Section 29 requires at least 1 year of continuous service.',
      conclusion:
        'WHEREFORE, Bowser is ordered to pay Toadette the aggregate sum of ₱5,416.67, with legal interest, and provide her a certificate of employment pursuant to Section 35.',
    },
  },
  {
    id: 'case_non_diminution_midyear',
    caseTitle: 'The Non-Diminution of Mid-Year Bonus as Vested Company Practice',
    worldNumber: 3,
    barYearTag: 'Bar 2024 / 2021 Adapted',
    difficulty: 'bar_expert',
    facts:
      'For eight (8) consecutive years, Koopa Industrial Corporation consistently and unconditionally paid all regular employees an annual "Mid-Year Performance Bonus" equivalent to one (1) month basic salary every June 15, regardless of whether the company turned a profit or suffered a loss. In Year 9, a new management committee assumed office and unilaterally revoked the bonus, announcing that "a bonus is a gift of management and not a demandable right." The union filed a grievance claiming a violation of the Principle of Non-Diminution of Benefits under Article 100.',
    issuesList: [
      {
        id: 'iss_nd1',
        label: 'Whether a voluntary bonus can ripen into a demandable contractual benefit protected by Article 100.',
        isGenuineIssue: true,
        explanation: 'Under settled jurisprudence, a bonus consistently granted over a long period becomes a demandable company practice.',
      },
      {
        id: 'iss_nd2',
        label: 'What requisites must be established for a benefit to be protected against unilateral diminution or withdrawal.',
        isGenuineIssue: true,
        explanation: 'Requisites: (1) consistent and deliberate over a considerable period; (2) unconditional; (3) not born of error of law.',
      },
      {
        id: 'iss_nd3',
        label: 'Whether management can unilaterally cancel an established company practice citing general corporate reorganization.',
        isGenuineIssue: true,
        explanation: 'Article 100 bars unilateral withdrawal once the benefit has ripened into a vested company practice.',
      },
      {
        id: 'iss_nd4',
        label: 'Whether the union president can be dismissed for declaring a strike vote over the bonus cancellation.',
        isGenuineIssue: false,
        explanation: 'The facts present a grievance regarding bonus entitlement, not a union strike legality dispute.',
      },
    ],
    controllingArticles: [
      { id: 'art_100_cite', citation: 'Art. 100, Labor Code', title: 'Prohibition Against Elimination or Diminution of Benefits', isControlling: true },
      { id: 'arco_metal', citation: 'Arco Metal Products v. SAMAHAN (G.R. No. 170734)', title: 'Ripening of Benefit into Company Practice', isControlling: true },
      { id: 'eastern_telecoms', citation: 'Eastern Telecommunications v. ETEU (G.R. No. 185665)', title: 'Unconditional Bonus as Demandable Right', isControlling: true },
      { id: 'art_102_cite', citation: 'Art. 102, Labor Code', title: 'Forms of Payment', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'If a regular employee earns ₱30,000.00 basic monthly salary, what is the controlling legal award under Article 100 for the unlawfully cancelled Mid-Year Bonus?',
      options: [
        { label: '₱0.00 (the bonus is an act of pure liberality)', isCorrect: false, feedback: 'Incorrect. 8 years of unconditional payment ripened into a vested right.' },
        { label: '₱15,000.00 (half of the bonus)', isCorrect: false, feedback: 'Incorrect. Partial payment is an unauthorized diminution.' },
        { label: '₱30,000.00 full bonus + 6% per annum legal interest from June 15', isCorrect: true, feedback: 'Correct! Under Art. 100 and Arco Metal, the full 1-month bonus (₱30,000.00) must be restored with 6% legal interest for unlawful unilateral withdrawal.' },
        { label: '₱60,000.00 (double damages penalty)', isCorrect: false, feedback: 'Incorrect. Not provided by law.' },
      ],
    },
    modelBarAnswer: {
      answer: 'YES. The unilateral cancellation of the Mid-Year Performance Bonus violates the Principle of Non-Diminution of Benefits under Article 100 of the Labor Code. The bonus has ripened into a vested company practice.',
      legalBasis:
        'Under Article 100 of the Labor Code and settled Supreme Court jurisprudence (Arco Metal Products Co., Inc. v. SAMAHAN; Eastern Telecommunications Phils., Inc. v. Eastern Telecoms Employees Union), while a bonus is generally not demandable, it becomes a demandable right and an established company practice when the following requisites concur: (1) the benefit is offered consistently and deliberately over a long or considerable period of time; (2) the grant is unconditional and not tied to any contingency such as company profit; and (3) it was not founded on an error in statutory construction.',
      application:
        'Here, Koopa Industrial Corporation granted the 1-month Mid-Year Bonus for eight (8) consecutive years unconditionally, regardless of profit or loss. This 8-year duration exhibits deliberate and consistent employer intent. The bonus ceased to be a mere gratuity and became a vested term of employment that cannot be unilaterally eliminated or diminished without violating Article 100.',
      conclusion:
        'WHEREFORE, Koopa Industrial Corporation is ordered to pay all regular employees their full 1-month Mid-Year Performance Bonus, with 6% legal interest from June 15 until paid.',
    },
  },
  {
    id: 'case_probationary_standards_day1',
    caseTitle: 'The Day 1 Undisclosed Probationary Metrics',
    worldNumber: 1,
    barYearTag: 'Bar 2024 / 2022 Adapted',
    difficulty: 'advanced',
    facts:
      'Bowser Software hired Luigi as a senior systems engineer on a 6-month probationary contract with a basic salary of ₱60,000.00/month. The contract stated: "The employee must satisfactorily meet the standards of the company to achieve regular status." No specific performance indicators, code output targets, or evaluation rubrics were given to Luigi. At the end of the 5th month, management served him a Notice of Termination for "failing to meet proprietary internal sprint velocity metrics." Luigi filed an illegal dismissal complaint claiming he attained regular employment status on Day 1.',
    issuesList: [
      {
        id: 'iss_pb1',
        label: 'Whether reasonable standards for regularization must be communicated to the employee on Day 1 of engagement.',
        isGenuineIssue: true,
        explanation: 'Under Art. 296 and Abbott Labs v. Alcaraz, reasonable standards must be made known to the employee at the time of engagement.',
      },
      {
        id: 'iss_pb2',
        label: 'What is the legal status of a probationary employee if the employer fails to disclose regularization standards upon hiring.',
        isGenuineIssue: true,
        explanation: 'Failure to inform the employee of regularization standards on Day 1 legally makes the worker a REGULAR employee from the very start.',
      },
      {
        id: 'iss_pb3',
        label: 'Whether Luigi is entitled to reinstatement and full backwages under Article 294.',
        isGenuineIssue: true,
        explanation: 'As a regular employee, Luigi cannot be dismissed without a statutory Just or Authorized cause and procedural due process.',
      },
      {
        id: 'iss_pb4',
        label: 'Whether Luigi can be deported for disputing technical coding metrics.',
        isGenuineIssue: false,
        explanation: 'No immigration or deportation issue is present in this domestic labor employment controversy.',
      },
    ],
    controllingArticles: [
      { id: 'art_296_cite', citation: 'Art. 296, Labor Code', title: 'Probationary Employment', isControlling: true },
      { id: 'abbott_alcaraz', citation: 'Abbott Laboratories v. Alcaraz (G.R. No. 192571)', title: 'Mandatory Communication of Regularization Standards', isControlling: true },
      { id: 'art_294_cite', citation: 'Art. 294, Labor Code', title: 'Security of Tenure (Reinstatement & Full Backwages)', isControlling: true },
      { id: 'art_83_cite', citation: 'Art. 83, Labor Code', title: 'Normal Hours of Work', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'Under controlling jurisprudence (Abbott Laboratories v. Alcaraz), what is the legal status of Luigi when dismissed on Month 5 without Day 1 metrics?',
      options: [
        { label: 'He remains a probationary employee who can be dismissed at management’s pleasure.', isCorrect: false, feedback: 'Incorrect. Probationary dismissal requires either just cause or failure to qualify under known standards.' },
        { label: 'He is deemed a regular employee from Day 1 because standards were never made known to him at engagement.', isCorrect: true, feedback: 'Correct! Under Art. 296 and Abbott v. Alcaraz, an employee not informed of reasonable regularization standards at engagement is deemed a regular employee from inception.' },
        { label: 'His contract is automatically converted into a fixed-term 1-year contract.', isCorrect: false, feedback: 'Incorrect. Fixed-term conversion does not apply.' },
        { label: 'He is entitled to 15 days separation pay only.', isCorrect: false, feedback: 'Incorrect. Illegal dismissal entitles regular employees to reinstatement + full backwages.' },
      ],
    },
    modelBarAnswer: {
      answer: 'Luigi was ILLEGALLY DISMISSED. By operation of law, Luigi became a REGULAR EMPLOYEE from Day 1 because the employer failed to inform him of reasonable regularization standards at the time of his engagement.',
      legalBasis:
        'Under Article 296 of the Labor Code in relation to Section 6(d), Rule I, Book VI of the Omnibus Rules Implementing the Labor Code, in all cases of probationary employment, the employer must make known to the employee the reasonable standards under which he will qualify as a regular employee at the time of his engagement. Where no standards are made known to the employee at the time of engagement, the employee is deemed a regular employee from inception (Abbott Laboratories, Phils. v. Alcaraz, G.R. No. 192571; Tamson’s Enterprises, Inc. v. Court of Appeals).',
      application:
        'Here, Bowser Software included only a vague, generic statement in Luigi’s contract and never furnished specific sprint velocity metrics or performance rubrics during onboarding. Consequently, Luigi was already a regular employee from his first day on the job. His termination on the 5th month for failing to satisfy secret, undisclosed metrics constitutes illegal dismissal without just cause.',
      conclusion:
        'WHEREFORE, Luigi is entitled to immediate reinstatement to his former position as Senior Systems Engineer without loss of seniority, plus full backwages from the date of illegal dismissal until actual reinstatement.',
    },
  },
  {
    id: 'case_wage_distortion_pineda',
    caseTitle: 'The Wage Order Compression & Pineda Formula',
    worldNumber: 3,
    barYearTag: 'Bar 2023 / 2020 Adapted',
    difficulty: 'bar_expert',
    facts:
      'Regional Tripartite Wages and Productivity Board (RTWPB) issued Wage Order No. RB-NCR-24 granting a ₱35.00 across-the-board daily wage increase to all minimum wage earners, raising the daily minimum from ₱610.00 to ₱645.00. Prior to the Order, Toad Logistics employed Junior Clerks at the minimum wage of ₱610.00 and Senior Clerks at ₱640.00 (a ₱30.00 quantitative differential reflecting tenure and experience). Upon implementing the Wage Order, Toad Logistics raised Junior Clerks to ₱645.00 and gave Senior Clerks a ₱5.00 token adjustment to ₱645.00, completely wiping out the ₱30.00 pay gap. Senior Clerks filed a grievance asserting a statutory Wage Distortion under Article 124.',
    issuesList: [
      {
        id: 'iss_wd1',
        label: 'Whether the compression of wages between Junior and Senior Clerks constitutes a statutory Wage Distortion under Art. 124.',
        isGenuineIssue: true,
        explanation: 'Wage distortion occurs when a statutory wage increase results in severe contraction or elimination of intentional pay differences.',
      },
      {
        id: 'iss_wd2',
        label: 'Whether the employer can unilaterally extinguish intentional wage differentials by leveling all staff to the new minimum.',
        isGenuineIssue: true,
        explanation: 'Article 124 mandates correction of wage distortions to preserve historical job hierarchy and worker morale.',
      },
      {
        id: 'iss_wd3',
        label: 'How the statutory wage distortion adjustment is computed under the Supreme Court-endorsed Pineda Formula.',
        isGenuineIssue: true,
        explanation: 'Pineda Formula: (Minimum Wage / Actual Salary) × Mandated Increase = Corrective Wage Adjustment.',
      },
      {
        id: 'iss_wd4',
        label: 'Whether the Senior Clerks can immediately shut down the warehouse without filing a Notice of Strike.',
        isGenuineIssue: false,
        explanation: 'Wage distortion is not a valid ground for an immediate wildcat strike; it must undergo grievance or NCMB conciliation.',
      },
    ],
    controllingArticles: [
      { id: 'art_124_cite', citation: 'Art. 124, Labor Code', title: 'Standards/Criteria for Minimum Wage Fixing & Wage Distortion', isControlling: true },
      { id: 'prubankers_cite', citation: 'Prubankers Association v. Prudential Bank (G.R. No. 131247)', title: 'Concept and Requisites of Wage Distortion', isControlling: true },
      { id: 'pineda_doctrine', citation: 'Pineda Formula / Metro Transit v. NLRC', title: 'Mathematical Re-Alignment Formula for Wage Distortion', isControlling: true },
      { id: 'art_94_cite', citation: 'Art. 94, Labor Code', title: 'Holiday Pay', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'Applying the Pineda Formula: [(Old Min Wage / Actual Salary) × Mandated Increase], what is the daily wage adjustment for a Senior Clerk who was earning ₱640.00 prior to the ₱35.00 increase (Old Min = ₱610.00)?',
      options: [
        { label: '₱5.00 / day', isCorrect: false, feedback: 'Incorrect. ₱5 only levels the senior clerk to ₱645, which created the distortion.' },
        { label: '₱17.50 / day', isCorrect: false, feedback: 'Incorrect. Half adjustment is arbitrary.' },
        { label: '₱33.36 / day (new rate = ₱673.36)', isCorrect: true, feedback: 'Correct! (₱610 / ₱640) × ₱35.00 = 0.953125 × ₱35 = ₱33.36. Senior Clerk’s new daily wage is ₱640 + ₱33.36 = ₱673.36, preserving the pay distinction!' },
        { label: '₱70.00 / day', isCorrect: false, feedback: 'Incorrect. Double adjustment.' },
      ],
    },
    modelBarAnswer: {
      answer: 'YES. A statutory Wage Distortion exists under Article 124 of the Labor Code. Toad Logistics must adjust the Senior Clerks’ daily wages in accordance with the Pineda Formula to restore an equitable quantitative pay hierarchy.',
      legalBasis:
        'Under Article 124 of the Labor Code and Prubankers Association v. Prudential Bank & Trust Co. (302 SCRA 74), a wage distortion arises when: (1) an existing hierarchy of positions with intentional quantitative wage differences exists; (2) a significant change or increase in the wage structure is mandated by a wage order; (3) the quantitative difference between positions is obliterated or severely contracted; and (4) the distortion occurs within the same establishment. To rectify distortions where no CBA formula exists, the Supreme Court in Metro Transit Organization v. NLRC recognized the Pineda Formula: Wage Adjustment = (Previous Minimum Wage ÷ Actual Salary) × Mandated Wage Increase.',
      application:
        'Here, all four requisites concur. Prior to the Order, Senior Clerks earned ₱640.00 while Junior Clerks earned ₱610.00 (a ₱30.00 intentional gap). Increasing Junior Clerks by ₱35.00 while giving Senior Clerks only ₱5.00 completely erased the pay difference, resulting in both groups receiving ₱645.00. Applying the Pineda Formula: (₱610 ÷ ₱640) × ₱35 = ₱33.36. Senior Clerks are entitled to a ₱33.36 wage increase, adjusting their daily wage to ₱673.36.',
      conclusion:
        'WHEREFORE, Toad Logistics is legally ordered to adjust the daily wage of all Senior Clerks to ₱673.36, retroactive to the effective date of Wage Order No. RB-NCR-24, with accrued wage differentials.',
    },
  },
  {
    id: 'case_floating_status_overstay',
    caseTitle: 'The 8-Month Security Guard Off-Detail',
    worldNumber: 5,
    barYearTag: 'Bar 2023 / 2019 Adapted',
    difficulty: 'advanced',
    facts:
      'Wario Security Agency deployed Mario as an armed security guard at Castle Bank for 4 years. On January 10, Castle Bank terminated its security contract with Wario Security. Wario Security placed Mario on "temporary off-detail / floating status," promising reassignment. For eight (8) consecutive months, Mario repeatedly reported to the agency office to request assignment, but Wario Security failed to deploy him to any client post while hiring and deploying 15 newly recruited security guards to other commercial accounts. In September, Mario filed a complaint for illegal constructive dismissal, separation pay, and full backwages.',
    issuesList: [
      {
        id: 'iss_fs1',
        label: 'Whether placing an employee on temporary off-detail or floating status for more than six (6) months constitutes constructive dismissal.',
        isGenuineIssue: true,
        explanation: 'Under Article 301 and settled case law, floating status exceeding 6 months without valid reassignment ripens into constructive dismissal.',
      },
      {
        id: 'iss_fs2',
        label: 'Whether hiring new security guards while keeping senior guards on floating status establishes bad faith.',
        isGenuineIssue: true,
        explanation: 'Hiring new guards while leaving senior guards unassigned proves bad faith and constructive discharge.',
      },
      {
        id: 'iss_fs3',
        label: 'Whether Mario is entitled to full backwages and separation pay in lieu of reinstatement.',
        isGenuineIssue: true,
        explanation: 'Constructive dismissal awards full backwages from the end of the 6-month period, plus reinstatement or separation pay.',
      },
      {
        id: 'iss_fs4',
        label: 'Whether Mario forfeited his claim by failing to surrender his licensed company sidearm within 24 hours.',
        isGenuineIssue: false,
        explanation: 'Company property return does not defeat statutory security of tenure rights.',
      },
    ],
    controllingArticles: [
      { id: 'art_301_cite', citation: 'Art. 301, Labor Code', title: 'When Employment Not Deemed Terminated (Floating Status)', isControlling: true },
      { id: 'exocet_security', citation: 'Exocet Security and Allied Services v. Serrano (G.R. No. 198538)', title: 'Six-Month Cap on Floating Status', isControlling: true },
      { id: 'art_294_cite', citation: 'Art. 294, Labor Code', title: 'Security of Tenure (Backwages & Separation Pay)', isControlling: true },
      { id: 'art_87_cite', citation: 'Art. 87, Labor Code', title: 'Overtime Work', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'If Mario earned ₱610.00/day (₱15,860.00 monthly) and had 4 full years of credited service, what is his statutory separation pay in lieu of reinstatement for constructive dismissal?',
      options: [
        { label: '₱15,860.00 (1 month pay)', isCorrect: false, feedback: 'Incorrect. 1 month is only the statutory minimum floor.' },
        { label: '₱31,720.00 (1/2 month per year)', isCorrect: false, feedback: 'Incorrect. Separation pay in lieu of reinstatement for illegal dismissal is at least 1 month pay per year of service.' },
        { label: '₱63,440.00 (1 month pay per year of service: ₱15,860 × 4 years)', isCorrect: true, feedback: 'Correct! When separation pay is awarded in lieu of reinstatement in illegal/constructive dismissal, the rate is 1 month pay per year of service (₱15,860 × 4 = ₱63,440.00).' },
        { label: '₱100,000.00 (flat arbitrary estimate)', isCorrect: false, feedback: 'Incorrect. Not based on statutory rate.' },
      ],
    },
    modelBarAnswer: {
      answer: 'Mario was CONSTRUCTIVELY ILLEGALLY DISMISSED. Placing an employee on temporary off-detail or floating status beyond six (6) months without redeployment ripens into illegal dismissal by operation of law.',
      legalBasis:
        'Under Article 301 of the Labor Code, the bona fide suspension of the operation of a business undertaking or fulfillment by the employee of a military or civic duty shall not terminate employment, provided that the employer reinstates the employee within not more than six (6) months. In Exocet Security and Allied Services Corp. v. Serrano (G.R. No. 198538) and Mobile Protective & JTF Investigation Agency v. Ompoc (G.R. No. 170969), the Supreme Court ruled that a security guard placed on off-detail or floating status for more than six months without reassignment to an equivalent post is constructively dismissed, entitling the worker to reinstatement and full backwages.',
      application:
        'Here, Wario Security kept Mario on off-detail for eight (8) consecutive months, exceeding the maximum statutory 6-month threshold. Wario Security’s bad faith is underscored by its recruitment of 15 new security guards who were actively deployed to other accounts while ignoring Mario’s repeated requests for post assignment.',
      conclusion:
        'WHEREFORE, Wario Security Agency is guilty of constructive illegal dismissal. Due to strained relations, Wario Security is ordered to pay Mario separation pay of one (1) month salary per year of service (₱63,440.00), plus full backwages computed from the expiration of the 6-month floating status until finality of judgment.',
    },
  },
  {
    id: 'case_facilities_vs_supplements_mabeza',
    caseTitle: 'The Hotel Dormitory & Uniform Wage Squeeze',
    worldNumber: 3,
    barYearTag: 'Bar 2024 / 2018 Adapted',
    difficulty: 'advanced',
    facts:
      'Hotel Koopa Palace hired Princess Daisy as a hotel chambermaid in Cebu City where the statutory daily minimum wage was ₱468.00. Hotel Koopa Palace paid Daisy a cash wage of only ₱320.00 per day. When Daisy filed a claim for minimum wage differentials, the hotel defended the payment by asserting that it provided Daisy with: (1) shared bunkbed lodging in the hotel basement valued at ₱100.00/day; and (2) daily commercial dry cleaning of her hotel chambermaid uniforms valued at ₱48.00/day. The hotel claimed these items were deductible "Facilities" that brought her total daily compensation to ₱468.00. Daisy never signed any written authorization allowing wage deductions.',
    issuesList: [
      {
        id: 'iss_fc1',
        label: 'What is the controlling distinction between deductible "Facilities" and non-deductible "Supplements" under Mabeza v. NLRC.',
        isGenuineIssue: true,
        explanation: 'Facilities are articles for worker subsistence for personal benefit; Supplements are extra conveniences furnished for employer benefit.',
      },
      {
        id: 'iss_fc2',
        label: 'What three (3) requisites must concur before the cost of Facilities may be lawfully deducted from an employee’s wage.',
        isGenuineIssue: true,
        explanation: 'Requisites: (1) customary in trade; (2) voluntarily accepted in writing; (3) charged at fair reasonable value.',
      },
      {
        id: 'iss_fc3',
        label: 'Whether uniform dry cleaning is an employer Supplement that can never be deducted from wages.',
        isGenuineIssue: true,
        explanation: 'Uniforms required by hotel management for its corporate brand image are Supplements furnished for the employer’s convenience.',
      },
      {
        id: 'iss_fc4',
        label: 'Whether Daisy can be fined ₱50,000 for refusing to wear hotel-provided shoes.',
        isGenuineIssue: false,
        explanation: 'Fining workers arbitrarily without legal basis violates Article 114; no fine issue was litigated in the main wage dispute.',
      },
    ],
    controllingArticles: [
      { id: 'art_97_cite', citation: 'Art. 97(f), Labor Code', title: 'Definition of Wage & Facilities', isControlling: true },
      { id: 'mabeza_nlrc', citation: 'Mabeza v. NLRC (G.R. No. 118506)', title: 'Facilities vs. Supplements Requisites Test', isControlling: true },
      { id: 'art_113_cite', citation: 'Art. 113, Labor Code', title: 'Permissible Wage Deductions', isControlling: true },
      { id: 'art_102_cite', citation: 'Art. 102, Labor Code', title: 'Forms of Payment', isControlling: false },
    ],
    computationQuestion: {
      prompt: 'If Daisy worked 26 days a month for 12 months, what is Hotel Koopa Palace’s total statutory wage differential liability (₱468 min - ₱320 cash paid = ₱148/day underpayment)?',
      options: [
        { label: '₱0.00 (the lodging offset is valid)', isCorrect: false, feedback: 'Incorrect. The deduction is void without written consent and custom proof.' },
        { label: '₱23,088.00 (half year differential)', isCorrect: false, feedback: 'Incorrect. Covers only 6 months.' },
        { label: '₱46,176.00 (₱148.00/day × 26 days × 12 months)', isCorrect: true, feedback: 'Correct! ₱148 underpayment per day × 26 days/mo = ₱3,848.00/month. For 12 months: ₱3,848 × 12 = ₱46,176.00 in statutory wage differentials!' },
        { label: '₱92,352.00 (double damages penalty)', isCorrect: false, feedback: 'Incorrect. Double indemnity under RA 8188 requires criminal conviction or separate order.' },
      ],
    },
    modelBarAnswer: {
      answer: 'Daisy is entitled to full payment of minimum wage differentials. Hotel Koopa Palace cannot lawfully deduct the cost of lodging and uniform dry cleaning from Daisy’s wages.',
      legalBasis:
        'In Mabeza v. NLRC (G.R. No. 118506) and Our Haus Realty v. Parian (G.R. No. 204651), the Supreme Court established the definitive distinction between Facilities and Supplements: Facilities are items of expense necessary for the subsistence of the employee and their family (food, housing) which form part of wage; Supplements are extra conveniences furnished by the employer for its own benefit or the conduct of its business. Before the value of facilities can be deducted from wage, three (3) requisites must concur: (1) proof that the facility is customary in the trade; (2) the provision of deductible facilities is voluntarily accepted in writing by the employee; and (3) the facility is charged at fair and reasonable value. Uniforms required by hotel management are Supplements furnished for the employer’s branding and can NEVER be deducted from wages.',
      application:
        'Here, Daisy never signed any written authorization allowing lodging deductions. Moreover, the hotel failed to prove that basement lodging deductions are customary in the local hotel industry. The dry cleaning of uniforms is an indisputable Supplement furnished exclusively for the hotel’s commercial presentation. Consequently, Daisy was paid a cash wage of only ₱320.00 against the ₱468.00 statutory minimum wage, creating a daily wage underpayment of ₱148.00.',
      conclusion:
        'ACCORDINGLY, Hotel Koopa Palace is ordered to pay Daisy ₱46,176.00 in statutory wage differentials for the 12-month period, plus 10% attorney’s fees under Article 111 of the Labor Code.',
    },
  },
];
