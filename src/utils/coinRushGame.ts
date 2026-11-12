// Pure deterministic physics, stage progression & boss combat engine for 'Super Mario Coin Rush: Labor Standards Adventure'
import { StorageLike } from './round11Features';

export const COIN_RUSH_HIGH_SCORE_KEY = 'mario_coin_rush_high_score_v1';

export interface CoinRushPlatform {
  x: number;
  y: number;
  w: number;
  h: number;
  isMoving?: boolean;
  vx?: number;
  minX?: number;
  maxX?: number;
}

export interface CoinRushCollectible {
  id: number;
  x: number;
  y: number;
  kind: 'coin' | 'star' | 'mushroom' | 'flower' | 'crown';
  collected: boolean;
  doctrineTip: string;
}

export interface CoinRushObstacle {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  minX: number;
  maxX: number;
  violationTitle: string;
  articleRef: string;
  isDefeated?: boolean;
}

export interface CoinRushBoss {
  name: string;
  title: string;
  doctrineWeakness: string;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  minX: number;
  maxX: number;
  hp: number;
  maxHp: number;
  isDefeated: boolean;
  attackTimerSec: number;
}

export interface CoinRushFireball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface CoinRushGameState {
  width: number;
  height: number;
  groundY: number;
  playerX: number;
  playerY: number;
  playerW: number;
  playerH: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facing: 1 | -1;
  score: number;
  coinsCollected: number;
  stageTargetCoins: number;
  streakCombo: number;
  lives: number;
  shieldTimerSec: number;
  invulnTimerSec: number;
  timeRemainingSec: number;
  status: 'playing' | 'stage_clear' | 'game_victory' | 'game_over' | 'finished';
  currentStage: 1 | 2 | 3;
  stageTitle: string;
  stageDescription: string;
  lastBannerText: string;
  hasFireFlower: boolean;
  flagpoleActive: boolean;
  flagpoleX: number;
  flagpoleY: number;
  bridgeAxeActive: boolean;
  bridgeAxeX: number;
  bridgeAxeY: number;
  boss: CoinRushBoss | null;
  fireballs: CoinRushFireball[];
  platforms: CoinRushPlatform[];
  collectibles: CoinRushCollectible[];
  obstacles: CoinRushObstacle[];
  nextEntityId: number;
}

export interface CoinRushInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  fire?: boolean;
}

export const STAGE_CONFIGS = [
  {
    stage: 1 as const,
    title: 'WORLD 1: YOSHI ISLAND · HOURS OF WORK SPRINT',
    description: 'Collect 15 Statutory Coins. Master Art. 87 Overtime & Art. 86 Night Shift Diff. Stomp Unpaid OT Koopas!',
    targetCoins: 15,
    timeLimitSec: 45,
  },
  {
    stage: 2 as const,
    title: 'WORLD 2: DONUT PLAINS · HOLIDAY & WAGE FORTRESS',
    description: 'Collect 20 Coins & defeat Sub-Min Wage Goomba Boss! Claim RA 11360 100% Service Charge & Double Holiday crowns.',
    targetCoins: 20,
    timeLimitSec: 50,
  },
  {
    stage: 3 as const,
    title: "WORLD 3: BOWSER'S COURTROOM KEEP · THE SUPREME COURT CASTLE",
    description: 'Dodge Wage Theft Bowser’s flames! Retrieve Art. 297 Twin-Notice Fireballs or hit the Supreme Court Axe to drop him into lava!',
    targetCoins: 10,
    timeLimitSec: 60,
  },
];

const STAGE_1_DOCTRINES = [
  'Art. 87: Overtime work beyond 8 hours = Regular Wage + 25% Hourly Rate!',
  'Art. 86: Night Shift Differential between 10PM - 6AM = Additional 10% Hourly Rate!',
  'Art. 84: Compensable Waiting Time: 20-min brownout is paid if employee cannot leave freely!',
  'Art. 85: Meal Periods of 60 consecutive minutes are non-compensable rest periods!',
  'Art. 83: Normal hours of work shall not exceed eight (8) hours a day!',
  'Art. 89: Emergency Overtime is mandatory during public emergencies or urgent machinery work!',
  'Art. 88: Undertime on any workday CANNOT be offset by overtime on another day!',
  'Art. 84: Short rest periods of 5 to 20 minutes count as compensable working time!',
  'Art. 82: Field personnel with unmonitored hours outside the office are exempt from overtime.',
  'Art. 83: Hospital health personnel in cities >= 1M population have a 40-hour / 5-day regular week!',
  'DOLE CWW: Compressed workweek may extend work up to 12 hours/day without daily OT if total <= 48 hrs.',
  'Art. 84: On-call standby time is compensable when the employee is required to remain on premises.',
  'Art. 86: Night shift overtime on ordinary days earns 125% OT rate x 1.10 NSD multiplier = 137.5%!',
  'Art. 87: Overtime on scheduled Rest Days earns 130% Rest Day rate x 1.30 OT multiplier = 169%!',
  'Art. 87: Overtime on Regular Holidays earns 200% Holiday rate x 1.30 OT multiplier = 260%!',
  'R.A. 10028: Nursing mothers are entitled to at least 40 minutes of compensable lactation breaks per shift.',
  'R.A. 11165: Telecommuting remote employees are guaranteed equal pay, overtime, and leave parity.',
  'Art. 85: Meal breaks shorter than 60 minutes (down to 20 mins) remain fully compensable working time.',
  'Art. 83: Overtime rendered without employer objection is compensable even without prior written form.',
  'Art. 89: Unjustified refusal to render emergency overtime may constitute insubordination.',
];

const STAGE_2_DOCTRINES = [
  'Art. 94: Regular Holiday = 200% Daily Rate if worked, 100% even if unworked!',
  'Art. 91: Weekly Rest Day: 24 consecutive hours after every 6 consecutive workdays!',
  'R.A. 11360: 100% Service Charges collected in hotels & restaurants go directly to employees!',
  'P.D. 851: 13th-Month Pay is mandatory for all rank-and-file workers with at least 1 month service!',
  'Art. 100: Non-Diminution of Benefits: Employer cannot unilaterally retract established employee benefits!',
  'Art. 113: Prohibited Wage Deductions: Only insurance, union dues, and lawful withholding permitted!',
  'Art. 93: Work on a scheduled Rest Day or Special Non-Working Day pays 130% of basic daily rate.',
  'Art. 93(c): Work on a Special Non-Working Day falling on a Rest Day pays 150% of basic rate.',
  'Art. 94: Work on a Regular Holiday falling on a scheduled Rest Day pays 260% of basic daily rate.',
  'DOLE Handbook: Work on a Double Regular Holiday pays 300% (or 390% if falling on a Rest Day)!',
  'P.D. 851: 13th-Month Pay must be disbursed on or before December 24 of each calendar year.',
  'Art. 95: Service Incentive Leave gives 5 days paid leave after 1 year of continuous service.',
  'Art. 95: Unused statutory Service Incentive Leave is commutable to cash based on current wage rate.',
  'Art. 102: Wages must be paid strictly in legal tender; promissory notes and vouchers are void.',
  'Art. 103: Wages must be paid at intervals not exceeding 16 days at or near the job site.',
  'Art. 114: Tool loss deductions cannot exceed 20% of weekly wage and require due process hearing.',
  'Art. 124: Wage distortion must be resolved via grievance machinery or NCMB/NLRC arbitration.',
  'Art. 110: Unpaid employee wages enjoy first preference in employer insolvency or bankruptcy.',
  'R.A. 10361: Batas Kasambahay guarantees 13th month pay, 5 days SIL, and minimum wage floor.',
  'Mabeza Doctrine: Facilities require written employee authorization, custom, and fair value proof.',
];

const STAGE_3_DOCTRINES = [
  'Art. 297: Just Causes for Dismissal: Serious misconduct, willful disobedience, gross neglect, fraud, crimes.',
  'Art. 298: Authorized Causes for Dismissal: Redundancy (1 mo/yr), Retrenchment (1/2 mo/yr), Closure, Disease.',
  'King of Kings Doctrine: Twin-Notice Rule is mandatory (Notice to Explain + Notice of Decision)!',
  'Art. 294: Security of Tenure: An employee illegally dismissed is entitled to reinstatement + full backwages!',
  'D.O. 174: Labor-Only Contracting is strictly prohibited; principal employer deemed direct employer!',
  'Art. 4: In Dubio Pro Operario: All doubts in labor law shall be resolved in favor of the laborer!',
  'Agabon Doctrine: Dismissal for Just Cause without procedural twin-notice awards P30,000 nominal damages.',
  'Jaka Food Doctrine: Dismissal for Authorized Cause without 30-day notice awards P50,000 nominal damages.',
  'Art. 296: Probationary employment is capped at 6 months; standards must be disclosed on Day 1.',
  'Art. 301: Bona fide suspension of operations or floating status cannot exceed 6 months.',
  'Art. 302: Statutory retirement pay under R.A. 7641 provides at least 22.5 days per credited year.',
  'Art. 306: Pure money claims arising from employer-employee relations prescribe in 3 years.',
  'Art. 1146 Civil Code: Illegal dismissal complaints prescribe in 4 years from termination.',
  'R.A. 11210: 105 days paid Maternity Leave for live birth (+15d Solo Parent, 60d miscarriage).',
  'R.A. 8187: Paternity Leave grants 7 calendar days full pay for first 4 deliveries of lawful spouse.',
  'R.A. 11861: Expanded Solo Parent Leave grants 7 working days paid leave after 6 months of service.',
  'R.A. 9262: Anti-VAWC Leave grants 10 paid days for victim-survivors holding protection orders.',
  'R.A. 9710: Special Leave for Women grants up to 2 months full pay after gynecological surgery.',
  'R.A. 11313: Safe Spaces Act penalizes peer and subordinate workplace sexual harassment.',
  'Auto Bus Doctrine: SIL 3-year prescription runs only from demand/refusal or employment separation.',
];

export function buildStageLevel(stageNumber: 1 | 2 | 3, seed = Date.now()): Pick<
  CoinRushGameState,
  | 'currentStage'
  | 'stageTitle'
  | 'stageDescription'
  | 'stageTargetCoins'
  | 'timeRemainingSec'
  | 'platforms'
  | 'collectibles'
  | 'obstacles'
  | 'boss'
  | 'flagpoleActive'
  | 'bridgeAxeActive'
> {
  const cfg = STAGE_CONFIGS[stageNumber - 1];
  const width = 560;
  const groundY = 232;

  if (stageNumber === 1) {
    const platforms: CoinRushPlatform[] = [
      { x: 48, y: 175, w: 120, h: 12 },
      { x: 220, y: 142, w: 125, h: 12 },
      { x: 392, y: 175, w: 120, h: 12 },
    ];

    const collectibles: CoinRushCollectible[] = [
      { id: 101, x: 75, y: 148, kind: 'coin', collected: false, doctrineTip: STAGE_1_DOCTRINES[0] },
      { id: 102, x: 115, y: 148, kind: 'coin', collected: false, doctrineTip: STAGE_1_DOCTRINES[1] },
      { id: 103, x: 255, y: 114, kind: 'star', collected: false, doctrineTip: 'Art. 87 Overtime Star: 25% Premium Invincibility!' },
      { id: 104, x: 300, y: 114, kind: 'coin', collected: false, doctrineTip: STAGE_1_DOCTRINES[2] },
      { id: 105, x: 425, y: 148, kind: 'coin', collected: false, doctrineTip: STAGE_1_DOCTRINES[3] },
      { id: 106, x: 468, y: 148, kind: 'coin', collected: false, doctrineTip: STAGE_1_DOCTRINES[4] },
      { id: 107, x: 165, y: 205, kind: 'mushroom', collected: false, doctrineTip: 'Art. 86 Night Shift Diff Mushroom: +1 Life Heart!' },
      { id: 108, x: 345, y: 205, kind: 'coin', collected: false, doctrineTip: STAGE_1_DOCTRINES[5] },
    ];

    const obstacles: CoinRushObstacle[] = [
      {
        id: 201,
        x: 130,
        y: groundY - 26,
        w: 28,
        h: 26,
        vx: 65,
        minX: 40,
        maxX: 245,
        violationTitle: 'Unpaid OT Koopa',
        articleRef: 'Art. 87',
      },
      {
        id: 202,
        x: 410,
        y: groundY - 26,
        w: 28,
        h: 26,
        vx: -75,
        minX: 290,
        maxX: 510,
        violationTitle: '20-min Unpaid Brownout Spike',
        articleRef: 'Art. 84',
      },
    ];

    return {
      currentStage: 1,
      stageTitle: cfg.title,
      stageDescription: cfg.description,
      stageTargetCoins: cfg.targetCoins,
      timeRemainingSec: cfg.timeLimitSec,
      platforms,
      collectibles,
      obstacles,
      boss: null,
      flagpoleActive: false,
      bridgeAxeActive: false,
    };
  }

  if (stageNumber === 2) {
    const platforms: CoinRushPlatform[] = [
      { x: 35, y: 172, w: 100, h: 12 },
      { x: 180, y: 135, w: 110, h: 12, isMoving: true, vx: 45, minX: 160, maxX: 330 },
      { x: 390, y: 165, w: 110, h: 12 },
    ];

    const collectibles: CoinRushCollectible[] = [
      { id: 301, x: 60, y: 144, kind: 'coin', collected: false, doctrineTip: STAGE_2_DOCTRINES[0] },
      { id: 302, x: 220, y: 105, kind: 'crown', collected: false, doctrineTip: 'Double Holiday 300% Crown: Triple Points!' },
      { id: 303, x: 420, y: 138, kind: 'coin', collected: false, doctrineTip: STAGE_2_DOCTRINES[1] },
      { id: 304, x: 130, y: 205, kind: 'coin', collected: false, doctrineTip: STAGE_2_DOCTRINES[2] },
      { id: 305, x: 320, y: 205, kind: 'mushroom', collected: false, doctrineTip: '100% Service Charge Mushroom!' },
      { id: 306, x: 470, y: 205, kind: 'star', collected: false, doctrineTip: STAGE_2_DOCTRINES[3] },
    ];

    const obstacles: CoinRushObstacle[] = [
      {
        id: 401,
        x: 100,
        y: groundY - 26,
        w: 28,
        h: 26,
        vx: 80,
        minX: 30,
        maxX: 220,
        violationTitle: 'Illegal Deduction Shy Guy',
        articleRef: 'Art. 113',
      },
    ];

    const boss: CoinRushBoss = {
      name: 'Sub-Min Goomba General',
      title: 'Illicit Wage Diminution Overseer',
      doctrineWeakness: 'Jump on head 3 times to enforce Art. 99 Minimum Wage & Art. 100 Non-Diminution!',
      x: 380,
      y: groundY - 34,
      w: 36,
      h: 34,
      vx: -60,
      minX: 280,
      maxX: 510,
      hp: 3,
      maxHp: 3,
      isDefeated: false,
      attackTimerSec: 2.5,
    };

    return {
      currentStage: 2,
      stageTitle: cfg.title,
      stageDescription: cfg.description,
      stageTargetCoins: cfg.targetCoins,
      timeRemainingSec: cfg.timeLimitSec,
      platforms,
      collectibles,
      obstacles,
      boss,
      flagpoleActive: false,
      bridgeAxeActive: false,
    };
  }

  // Stage 3: Bowser's Courtroom Keep
  const platforms: CoinRushPlatform[] = [
    { x: 50, y: 170, w: 90, h: 12 },
    { x: 190, y: 135, w: 85, h: 12 },
    { x: 320, y: 165, w: 90, h: 12 },
  ];

  const collectibles: CoinRushCollectible[] = [
    { id: 501, x: 80, y: 140, kind: 'flower', collected: false, doctrineTip: 'Art. 297 Twin-Notice Fire Flower! Shoot fireballs to defeat violations!' },
    { id: 502, x: 230, y: 105, kind: 'star', collected: false, doctrineTip: 'Supreme Court Social Justice Star!' },
    { id: 503, x: 360, y: 135, kind: 'coin', collected: false, doctrineTip: STAGE_3_DOCTRINES[0] },
    { id: 504, x: 150, y: 205, kind: 'coin', collected: false, doctrineTip: STAGE_3_DOCTRINES[1] },
  ];

  const obstacles: CoinRushObstacle[] = [
    {
      id: 601,
      x: 100,
      y: groundY - 26,
      w: 28,
      h: 26,
      vx: 85,
      minX: 20,
      maxX: 200,
      violationTitle: 'Endo 5-5-5 Magikoopa',
      articleRef: 'Art. 295 / D.O. 174',
    },
  ];

  const boss: CoinRushBoss = {
    name: 'Employer Bowser',
    title: 'The Wage Theft & Sham Endo Monarch',
    doctrineWeakness: 'Shoot with Twin-Notice Fireballs or jump across to strike the Supreme Court Axe!',
    x: 410,
    y: groundY - 48,
    w: 52,
    h: 48,
    vx: -50,
    minX: 300,
    maxX: 490,
    hp: 5,
    maxHp: 5,
    isDefeated: false,
    attackTimerSec: 2.0,
  };

  return {
    currentStage: 3,
    stageTitle: cfg.title,
    stageDescription: cfg.description,
    stageTargetCoins: cfg.targetCoins,
    timeRemainingSec: cfg.timeLimitSec,
    platforms,
    collectibles,
    obstacles,
    boss,
    flagpoleActive: false,
    bridgeAxeActive: true,
  };
}

export function createInitialCoinRushState(seed = 1): CoinRushGameState {
  const width = 560;
  const height = 270;
  const groundY = 232;

  const stageData = buildStageLevel(1, seed);

  return {
    width,
    height,
    groundY,
    playerX: 60,
    playerY: groundY - 30,
    playerW: 24,
    playerH: 30,
    vx: 0,
    vy: 0,
    onGround: true,
    facing: 1,
    score: 0,
    coinsCollected: 0,
    streakCombo: 0,
    lives: 3,
    shieldTimerSec: 0,
    invulnTimerSec: 0,
    status: 'playing',
    lastBannerText: 'Stage 1: Yoshi Island — Run, jump and collect 15 statutory coins!',
    hasFireFlower: false,
    flagpoleX: 510,
    flagpoleY: groundY - 110,
    bridgeAxeX: 515,
    bridgeAxeY: groundY - 24,
    fireballs: [],
    nextEntityId: 700,
    ...stageData,
  };
}

export function advanceCoinRushStage(state: CoinRushGameState): CoinRushGameState {
  const nextStageNum = (state.currentStage + 1) as 2 | 3;
  if (state.currentStage >= 3) {
    return {
      ...state,
      status: 'game_victory',
      lastBannerText: 'VICTORY! All 3 Labor Standards Worlds Cleared! Chief Justice Toadstool Salutes You!',
    };
  }

  const nextStageData = buildStageLevel(nextStageNum);
  return {
    ...state,
    ...nextStageData,
    playerX: 50,
    playerY: state.groundY - state.playerH,
    vx: 0,
    vy: 0,
    onGround: true,
    coinsCollected: 0,
    hasFireFlower: nextStageNum === 3 ? true : state.hasFireFlower,
    fireballs: [],
    status: 'playing',
    lastBannerText: `Cleared Stage ${state.currentStage}! Welcome to ${nextStageData.stageTitle}!`,
  };
}

export function stepCoinRushState(
  state: CoinRushGameState,
  input: CoinRushInput,
  rawDt: number,
  entropy = Date.now()
): CoinRushGameState {
  if (state.status !== 'playing') return state;

  const dt = Math.min(0.05, Math.max(0.004, rawDt));
  const nextTime = Math.max(0, state.timeRemainingSec - dt);
  if (nextTime <= 0) {
    return {
      ...state,
      timeRemainingSec: 0,
      status: 'game_over',
      lastBannerText: 'Time Expired! The Statutory Audit deadline passed. Try again!',
    };
  }

  let vx = 0;
  let facing = state.facing;
  const moveSpeed = state.shieldTimerSec > 0 ? 275 : 230;
  if (input.left && !input.right) {
    vx = -moveSpeed;
    facing = -1;
  } else if (input.right && !input.left) {
    vx = moveSpeed;
    facing = 1;
  }

  let vy = state.vy;
  let onGround = state.onGround;
  if (input.jump && onGround) {
    vy = -455;
    onGround = false;
  }

  vy += 1220 * dt; // Gravity
  let nextX = Math.max(8, Math.min(state.width - state.playerW - 8, state.playerX + vx * dt));
  let nextY = state.playerY + vy * dt;

  // Move dynamic platforms
  const updatedPlatforms = state.platforms.map((plat) => {
    if (!plat.isMoving || !plat.vx || plat.minX === undefined || plat.maxX === undefined) {
      return plat;
    }
    let px = plat.x + plat.vx * dt;
    let pvx = plat.vx;
    if (px <= plat.minX) {
      px = plat.minX;
      pvx = Math.abs(pvx);
    } else if (px >= plat.maxX) {
      px = plat.maxX;
      pvx = -Math.abs(pvx);
    }
    return { ...plat, x: px, vx: pvx };
  });

  // Platform top landings
  onGround = false;
  if (vy >= 0) {
    for (const plat of updatedPlatforms) {
      const horizOverlap = nextX + state.playerW > plat.x + 4 && nextX < plat.x + plat.w - 4;
      const prevBottom = state.playerY + state.playerH;
      const nextBottom = nextY + state.playerH;
      if (horizOverlap && prevBottom <= plat.y + 6 && nextBottom >= plat.y) {
        nextY = plat.y - state.playerH;
        vy = 0;
        onGround = true;
        break;
      }
    }
  }

  // Floor collision
  if (nextY + state.playerH >= state.groundY) {
    nextY = state.groundY - state.playerH;
    vy = 0;
    onGround = true;
  }

  let score = state.score;
  let coinsCollected = state.coinsCollected;
  let streakCombo = state.streakCombo;
  let lives = state.lives;
  let shieldTimerSec = Math.max(0, state.shieldTimerSec - dt);
  let invulnTimerSec = Math.max(0, state.invulnTimerSec - dt);
  let lastBannerText = state.lastBannerText;
  let nextEntityId = state.nextEntityId;
  let hasFireFlower = state.hasFireFlower;
  let flagpoleActive = state.flagpoleActive;
  let status: CoinRushGameState['status'] = 'playing';

  // Flagpole touch detection
  if (flagpoleActive) {
    const touchesFlag =
      nextX + state.playerW > state.flagpoleX - 8 &&
      nextX < state.flagpoleX + 24 &&
      nextY + state.playerH > state.flagpoleY;
    if (touchesFlag) {
      score += 250;
      if (state.currentStage < 3) {
        status = 'stage_clear';
        lastBannerText = `COURSE CLEAR! Stage ${state.currentStage} Mastered! +250 Bonus Points!`;
      } else {
        status = 'game_victory';
        lastBannerText = 'GRAND VICTORY! Supreme Court Hall Reached! Labor Standards Champion!';
      }
    }
  }

  // Bridge Axe trigger (Stage 3)
  if (state.bridgeAxeActive && state.currentStage === 3) {
    const touchesAxe =
      nextX + state.playerW > state.bridgeAxeX - 6 &&
      nextX < state.bridgeAxeX + 20 &&
      nextY + state.playerH >= state.bridgeAxeY - 10;
    if (touchesAxe) {
      score += 500;
      status = 'game_victory';
      lastBannerText = 'SUPREME COURT AXE STRUCK! Employer Bowser fallen into NLRC arbitration! You win!';
    }
  }

  // Collectibles pickup check
  const pCenterX = nextX + state.playerW / 2;
  const pCenterY = nextY + state.playerH / 2;

  const updatedCollectibles = state.collectibles.map((item) => {
    if (item.collected) return item;
    const dist = Math.hypot(pCenterX - item.x, pCenterY - item.y);
    if (dist <= 26) {
      streakCombo += 1;
      let coinVal = 1;
      let pts = 35;
      if (item.kind === 'star') {
        coinVal = 3;
        pts = 150;
        shieldTimerSec = 6.0;
        lastBannerText = `SUPER STAR! Invincibility Active! ${item.doctrineTip}`;
      } else if (item.kind === 'crown') {
        coinVal = 5;
        pts = 200;
        shieldTimerSec = 8.0;
        lastBannerText = `DOUBLE HOLIDAY 300% CROWN! +${pts} pts! ${item.doctrineTip}`;
      } else if (item.kind === 'mushroom') {
        coinVal = 2;
        pts = 90;
        lives = Math.min(5, lives + 1);
        lastBannerText = `1-UP RESTORED! Hearts: ${lives} · ${item.doctrineTip}`;
      } else if (item.kind === 'flower') {
        coinVal = 2;
        pts = 100;
        hasFireFlower = true;
        lastBannerText = `TWIN-NOTICE FIRE FLOWER! Shoot fireballs to clear obstacles!`;
      } else {
        lastBannerText = `+${pts} pts · ${item.doctrineTip}`;
      }
      coinsCollected += coinVal;
      score += pts + Math.min(60, streakCombo * 5);
      return { ...item, collected: true };
    }
    return item;
  });

  // Check coin target to activate flagpole / victory flag
  if (coinsCollected >= state.stageTargetCoins && !flagpoleActive) {
    flagpoleActive = true;
    lastBannerText = 'TARGET REACHED! The DOLE Flagpole has appeared! Leap onto it to clear the stage!';
  }

  // Spawn additional coin waves if items cleared
  let finalCollectibles = updatedCollectibles;
  const remaining = updatedCollectibles.filter((c) => !c.collected);
  if (remaining.length <= 1) {
    const waveSpots = [
      { x: 80 + ((entropy * 17) % 60), y: 145 },
      { x: 230 + ((entropy * 23) % 80), y: 110 },
      { x: 410 + ((entropy * 31) % 60), y: 145 },
      { x: 160 + ((entropy * 43) % 200), y: 205 },
    ];
    waveSpots.forEach((spot, i) => {
      finalCollectibles.push({
        id: nextEntityId++,
        x: Math.round(spot.x),
        y: spot.y,
        kind: i === 1 ? 'star' : i === 2 && state.currentStage === 3 ? 'flower' : 'coin',
        collected: false,
        doctrineTip:
          state.currentStage === 1
            ? STAGE_1_DOCTRINES[(entropy + i) % STAGE_1_DOCTRINES.length]
            : state.currentStage === 2
            ? STAGE_2_DOCTRINES[(entropy + i) % STAGE_2_DOCTRINES.length]
            : STAGE_3_DOCTRINES[(entropy + i) % STAGE_3_DOCTRINES.length],
      });
    });
  }

  // Fireball shooting (Stage 3 or if Fire Flower equipped)
  let fireballs = state.fireballs;
  if (input.fire && hasFireFlower && fireballs.length < 4) {
    fireballs = [
      ...fireballs,
      {
        id: nextEntityId++,
        x: facing === 1 ? nextX + state.playerW + 2 : nextX - 10,
        y: nextY + 10,
        vx: facing * 340,
        vy: 40,
      },
    ];
    lastBannerText = 'Art. 297 Notice to Explain Fireball launched!';
  }

  // Move fireballs and detect hits on obstacles or boss
  let boss = state.boss ? { ...state.boss } : null;
  fireballs = fireballs
    .map((fb) => ({ ...fb, x: fb.x + fb.vx * dt, y: fb.y + fb.vy * dt }))
    .filter((fb) => fb.x > 0 && fb.x < state.width && fb.y < state.groundY);

  if (boss && !boss.isDefeated) {
    fireballs.forEach((fb) => {
      if (
        fb.x > boss.x &&
        fb.x < boss.x + boss.w &&
        fb.y > boss.y &&
        fb.y < boss.y + boss.h
      ) {
        boss.hp = Math.max(0, boss.hp - 1);
        score += 150;
        lastBannerText = `Direct Hit on ${boss.name}! Remaining HP: ${boss.hp}/${boss.maxHp}!`;
        if (boss.hp <= 0) {
          boss.isDefeated = true;
          score += 600;
          if (state.currentStage === 3) {
            status = 'game_victory';
            lastBannerText = 'VICTORY! Bowser defeated by Twin-Notice Due Process! Supreme Court Reached!';
          } else {
            flagpoleActive = true;
            lastBannerText = `Boss Defeated! The Fortress Flagpole is open!`;
          }
        }
      }
    });
  }

  // Obstacles patrol & AABB collision
  const updatedObstacles = state.obstacles.map((obs) => {
    if (obs.isDefeated) return obs;
    let ox = obs.x + obs.vx * dt;
    let ovx = obs.vx;
    if (ox <= obs.minX) {
      ox = obs.minX;
      ovx = Math.abs(ovx);
    } else if (ox >= obs.maxX) {
      ox = obs.maxX;
      ovx = -Math.abs(ovx);
    }

    const overlaps =
      nextX + state.playerW - 4 > ox &&
      nextX + 4 < ox + obs.w &&
      nextY + state.playerH - 2 > obs.y &&
      nextY + 4 < obs.y + obs.h;

    if (overlaps) {
      const isStomp = vy > 0 && state.playerY + state.playerH <= obs.y + 14;
      if (shieldTimerSec > 0 || isStomp) {
        score += 120;
        if (isStomp) {
          vy = -330;
        }
        lastBannerText = `STOMP! Struck down ${obs.violationTitle} (${obs.articleRef})! +120 Bonus Points!`;
        return { ...obs, isDefeated: true };
      } else if (invulnTimerSec <= 0) {
        lives = Math.max(0, lives - 1);
        streakCombo = 0;
        invulnTimerSec = 1.6;
        lastBannerText = `Ouch! Collision with ${obs.violationTitle} (${obs.articleRef})! -1 Heart!`;
        if (lives <= 0) {
          status = 'game_over';
        }
      }
    }

    return { ...obs, x: ox, vx: ovx };
  });

  // Boss patrol & collision
  if (boss && !boss.isDefeated) {
    boss.x += boss.vx * dt;
    if (boss.x <= boss.minX) {
      boss.x = boss.minX;
      boss.vx = Math.abs(boss.vx);
    } else if (boss.x >= boss.maxX) {
      boss.x = boss.maxX;
      boss.vx = -Math.abs(boss.vx);
    }

    // Boss vs Player collision
    const bossOverlap =
      nextX + state.playerW - 4 > boss.x &&
      nextX + 4 < boss.x + boss.w &&
      nextY + state.playerH - 2 > boss.y &&
      nextY + 4 < boss.y + boss.h;

    if (bossOverlap) {
      const isBossStomp = vy > 0 && state.playerY + state.playerH <= boss.y + 16;
      if (shieldTimerSec > 0 || isBossStomp) {
        boss.hp = Math.max(0, boss.hp - 1);
        vy = -360;
        score += 180;
        lastBannerText = `CRITICAL STOMP! ${boss.name} took damage! HP: ${boss.hp}/${boss.maxHp}!`;
        if (boss.hp <= 0) {
          boss.isDefeated = true;
          score += 600;
          if (state.currentStage === 3) {
            status = 'game_victory';
            lastBannerText = 'VICTORY! Bowser defeated by Twin-Notice Due Process! Supreme Court Reached!';
          } else {
            flagpoleActive = true;
            lastBannerText = `Boss Defeated! Leap on the Fortress Flagpole!`;
          }
        }
      } else if (invulnTimerSec <= 0) {
        lives = Math.max(0, lives - 1);
        invulnTimerSec = 1.8;
        lastBannerText = `Struck by ${boss.name} (${boss.title})! -1 Heart!`;
        if (lives <= 0) {
          status = 'game_over';
        }
      }
    }
  }

  return {
    ...state,
    playerX: nextX,
    playerY: nextY,
    vx,
    vy,
    onGround,
    facing,
    score,
    coinsCollected,
    streakCombo,
    lives,
    shieldTimerSec,
    invulnTimerSec,
    timeRemainingSec: nextTime,
    status,
    lastBannerText,
    hasFireFlower,
    flagpoleActive,
    platforms: updatedPlatforms,
    collectibles: finalCollectibles,
    obstacles: updatedObstacles.filter((o) => !o.isDefeated),
    boss,
    fireballs,
    nextEntityId,
  };
}

export function loadCoinRushHighScore(storage?: StorageLike): number {
  if (!storage) return 0;
  try {
    const raw = storage.getItem(COIN_RUSH_HIGH_SCORE_KEY);
    const val = Number(raw);
    return Number.isFinite(val) && val > 0 ? Math.round(val) : 0;
  } catch {
    return 0;
  }
}

export function saveCoinRushHighScore(score: number, storage?: StorageLike): number {
  const prev = loadCoinRushHighScore(storage);
  const best = Math.max(prev, Math.max(0, Math.round(score)));
  if (storage) {
    try {
      storage.setItem(COIN_RUSH_HIGH_SCORE_KEY, String(best));
    } catch {
      // ignore
    }
  }
  return best;
}

/**
 * Triggers lightweight celebratory coin particle burst
 */
export function triggerCoinParticles(particleCount = 15): void {
  if (typeof window === 'undefined') return;
  try {
    import('canvas-confetti').then((mod) => {
      const confetti = mod.default || mod;
      confetti({
        particleCount,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#fbbf24', '#fde047', '#ffffff'],
        shapes: ['circle'],
        scalar: 1.1,
      });
    }).catch(() => {});
  } catch {
    // fallback
  }
}
