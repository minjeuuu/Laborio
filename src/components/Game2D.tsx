import React, { useRef, useEffect, useState } from 'react';
import { marioAudio } from '../utils/audio';
import { MarioAvatar } from '../types/laborLaw';
import { getHeroMeta } from '../data/heroesData';
import { stepPlatformer2DPhysics, Platformer2DState } from '../utils/gamePhysics';
import { MarioCharacterAvatar, MarioCoinIcon, MarioFireFlowerIcon, MarioStarIcon } from './MarioIcons';
import {
  Play,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Heart,
  Compass,
  Scale,
  Sparkles,
  Flame,
  Zap,
  Shield,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { drawPlatformer2DDoctrine } from '../utils/gameQuestionDeck';

interface Game2DProps {
  fontSize?: 'normal' | 'large' | 'xlarge';
  equippedAvatar?: MarioAvatar;
  onEarnCoins: (amount: number) => void;
}

export interface PlatformerDoctrineBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'q' | 'brick' | 'flower' | 'star';
  hit: boolean;
  bumpY: number;
  doctrineId?: string;
  doctrineTitle?: string;
  doctrineRule?: string;
}

interface Fireball2D {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alive: boolean;
}

interface Enemy2D {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  alive: boolean;
  type: 'goomba' | 'koopa';
}

interface BowserBoss2D {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  hp: number;
  alive: boolean;
  jumpTimer: number;
  breathTimer: number;
  bridgeCollapsed: boolean;
}

export const Game2D: React.FC<Game2DProps> = ({ equippedAvatar = 'mario', onEarnCoins }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const initialAutoStart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'victory'>(
    initialAutoStart ? 'playing' : 'start'
  );
  const gameStateRef = useRef(gameState);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [powerUpState, setPowerUpState] = useState<'small' | 'super' | 'fire'>('small');
  const [isStarInvincible, setIsStarInvincible] = useState(false);
  const [isDashing, setIsDashing] = useState(false);
  const [courseProgressPct, setCourseProgressPct] = useState(0);
  const [activeZone, setActiveZone] = useState('World 1-1: Overworld Labor Plain');
  const [latestFact, setLatestFact] = useState<string>(
    'Hold JUMP longer for higher arcs! Press F or FIRE button to shoot Fireballs once powered up!'
  );
  const [activeDoctrineCard, setActiveDoctrineCard] = useState<{
    title: string;
    rule: string;
  } | null>(null);

  const onEarnCoinsRef = useRef(onEarnCoins);
  useEffect(() => {
    onEarnCoinsRef.current = onEarnCoins;
  }, [onEarnCoins]);

  useEffect(() => {
    gameStateRef.current = gameState;
    if (typeof document !== 'undefined') {
      document.body.dataset.state =
        gameState === 'start'
          ? 'title'
          : gameState === 'playing'
          ? 'playing'
          : 'gameover';
    }
  }, [gameState]);

  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    jumpHeld: boolean;
    jumpJustPressed: boolean;
    dash: boolean;
    fireJustPressed: boolean;
  }>({
    left: false,
    right: false,
    jumpHeld: false,
    jumpJustPressed: false,
    dash: false,
    fireJustPressed: false,
  });

  const resetWorldRef = useRef<(() => void) | null>(null);

  const startGame = () => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    keysRef.current = {
      left: false,
      right: false,
      jumpHeld: false,
      jumpJustPressed: false,
      dash: false,
      fireJustPressed: false,
    };
    if (resetWorldRef.current) resetWorldRef.current();
    setGameState('playing');
    setLives(3);
    setScore(0);
    setCoins(0);
    setPowerUpState('small');
    setIsStarInvincible(false);
    setActiveDoctrineCard(null);
    setLatestFact('Explore all 4 Worlds: Overworld, Underground, Castle, and Bowser Throne Bridge!');
    marioAudio.playPowerUp();
  };

  useEffect(() => {
    const clearKeys = () => {
      keysRef.current = {
        left: false,
        right: false,
        jumpHeld: false,
        jumpJustPressed: false,
        dash: false,
        fireJustPressed: false,
      };
      setIsDashing(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current === 'start' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        startGame();
        return;
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
      if (['ShiftLeft', 'ShiftRight', 'KeyZ'].includes(e.code)) {
        keysRef.current.dash = true;
        setIsDashing(true);
      }
      if (['KeyF', 'KeyX'].includes(e.code)) {
        keysRef.current.fireJustPressed = true;
        e.preventDefault();
      }
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
        if (!keysRef.current.jumpHeld) {
          keysRef.current.jumpJustPressed = true;
        }
        keysRef.current.jumpHeld = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
      if (['ShiftLeft', 'ShiftRight', 'KeyZ'].includes(e.code)) {
        keysRef.current.dash = false;
        setIsDashing(false);
      }
      if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) keysRef.current.jumpHeld = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearKeys);
    document.addEventListener('visibilitychange', clearKeys);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearKeys);
      document.removeEventListener('visibilitychange', clearKeys);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastTime = performance.now();

    const groundY = 330;
    const flagpoleX = 8650; // Massively extended to 8650px across 4 full worlds!

    let checkpointX = 60;

    let player: Platformer2DState = {
      x: 60,
      y: groundY - 38,
      width: 28,
      height: 38,
      vx: 0,
      vy: 0,
      grounded: true,
      direction: 1,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      jumpCutApplied: false,
    };

    let scaleX = 1;
    let scaleY = 1;
    let cameraX = 0;
    let localScore = 0;
    let localCoins = 0;
    let localPowerUp: 'small' | 'super' | 'fire' = 'small';
    let starTimer = 0;
    let invulnTimer = 0;

    const fireballs: Fireball2D[] = [];
    const bowserFireballs: Fireball2D[] = [];

    const bowser: BowserBoss2D = {
      x: 8350,
      y: groundY - 56,
      w: 52,
      h: 56,
      vy: 0,
      hp: 5,
      alive: true,
      jumpTimer: 2.5,
      breathTimer: 1.8,
      bridgeCollapsed: false,
    };

    // Extended 4-World Course Blocks
    const createBlocks = (): PlatformerDoctrineBlock[] => [
      // ========== WORLD 1-1: OVERWORLD LABOR PLAINS (Hours & Overtime) ==========
      { x: 180, y: 230, w: 36, h: 36, type: 'flower', hit: false, bumpY: 0, doctrineTitle: 'Art. 83: Normal Hours of Work', doctrineRule: 'Normal work shall not exceed 8 hours per day.' },
      { x: 216, y: 230, w: 36, h: 36, type: 'brick', hit: false, bumpY: 0 },
      { x: 252, y: 230, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 84: Compensable Work Hours', doctrineRule: 'Waiting time is compensable if employee is engaged to wait.' },
      { x: 420, y: 196, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 85: Meal Period', doctrineRule: 'Not less than 60 minutes off for regular meals; non-compensable unless on duty.' },
      { x: 456, y: 196, w: 36, h: 36, type: 'brick', hit: false, bumpY: 0 },
      { x: 620, y: 230, w: 36, h: 36, type: 'brick', hit: false, bumpY: 0 },
      { x: 656, y: 230, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 86: Night Shift Differential', doctrineRule: 'Additional 10% of regular wage for work between 10:00 PM and 6:00 AM.' },
      { x: 860, y: 190, w: 36, h: 36, type: 'star', hit: false, bumpY: 0, doctrineTitle: 'Art. 87: Overtime Work (+25%)', doctrineRule: 'Work beyond 8 hours receives regular hourly rate + at least 25% premium.' },
      { x: 896, y: 190, w: 36, h: 36, type: 'brick', hit: false, bumpY: 0 },
      { x: 932, y: 190, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 88: Undertime Offset Ban', doctrineRule: 'Undertime work cannot be offset by overtime on another day.' },
      { x: 1150, y: 215, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 89: Emergency Overtime', doctrineRule: 'Compulsory overtime permitted only in war, disaster, or urgent repairs.' },
      { x: 1350, y: 185, w: 36, h: 36, type: 'flower', hit: false, bumpY: 0, doctrineTitle: 'Art. 91: Weekly Rest Period', doctrineRule: 'At least 24 consecutive hours of rest after every 6 consecutive work days.' },
      { x: 1580, y: 220, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 93: Rest Day Premium (+30%)', doctrineRule: 'Work on scheduled rest day receives an additional 30% of regular daily rate.' },
      { x: 1800, y: 185, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 94: Regular Holiday Pay', doctrineRule: '100% pay unworked; 200% double-pay if required to work on Regular Holiday.' },

      // ========== WORLD 1-2: UNDERGROUND WAGE & SUBCONTRACTING CAVERN ==========
      { x: 2320, y: 225, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 95: Service Incentive Leave', doctrineRule: '5 days paid leave per year after 1 year of service; commutable to cash.' },
      { x: 2356, y: 225, w: 36, h: 36, type: 'brick', hit: false, bumpY: 0 },
      { x: 2550, y: 190, w: 36, h: 36, type: 'flower', hit: false, bumpY: 0, doctrineTitle: 'Art. 96: Service Charges (100%)', doctrineRule: '100% distributed equally to all rank-and-file & supervisory staff.' },
      { x: 2780, y: 230, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 99: Regional Minimum Wages', doctrineRule: 'Minimum wage rates determined by regional RTWPBs; cannot be diminished.' },
      { x: 2816, y: 230, w: 36, h: 36, type: 'brick', hit: false, bumpY: 0 },
      { x: 3050, y: 185, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 100: Non-Diminution of Benefits', doctrineRule: 'Benefits voluntarily and consistently granted cannot be unilaterally removed.' },
      { x: 3280, y: 220, w: 36, h: 36, type: 'star', hit: false, bumpY: 0, doctrineTitle: 'P.D. 851: Mandatory 13th Month Pay', doctrineRule: '1/12th of basic annual salary to rank-and-file workers by Dec 24.' },
      { x: 3500, y: 190, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'D.O. 174: Subcontracting Rules', doctrineRule: 'Requires >= P5M substantial capital & independent control of performance.' },
      { x: 3750, y: 225, w: 36, h: 36, type: 'flower', hit: false, bumpY: 0, doctrineTitle: 'Art. 113: Wage Deductions', doctrineRule: 'Deductions illegal except SSS/PhilHealth/tax, union dues, or written authority.' },
      { x: 4000, y: 185, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'R.A. 10361: Kasambahay Act', doctrineRule: 'Domestic workers entitled to 13th month, 5 days SIL, SSS, and minimum wage.' },

      // ========== WORLD 1-3: CASTLE OF PROTECTIVE LAWS & SPECIAL GROUPS ==========
      { x: 4450, y: 225, w: 36, h: 36, type: 'flower', hit: false, bumpY: 0, doctrineTitle: 'R.A. 11210: 105-Day Maternity Leave', doctrineRule: '105 days fully paid maternity leave with option to extend 30 days.' },
      { x: 4486, y: 225, w: 36, h: 36, type: 'brick', hit: false, bumpY: 0 },
      { x: 4700, y: 190, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'R.A. 8187: Paternity Leave', doctrineRule: '7 days paid paternity leave for married male employee for first 4 deliveries.' },
      { x: 4950, y: 225, w: 36, h: 36, type: 'star', hit: false, bumpY: 0, doctrineTitle: 'R.A. 8972: Solo Parents Leave', doctrineRule: '7 days parental leave with pay for certified solo parent after 1 year service.' },
      { x: 5200, y: 185, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 297: Just Causes for Dismissal', doctrineRule: 'Serious misconduct, willful disobedience, gross neglect, fraud, crime against employer.' },
      { x: 5450, y: 220, w: 36, h: 36, type: 'flower', hit: false, bumpY: 0, doctrineTitle: 'Art. 298: Authorized Causes', doctrineRule: 'Redundancy (1 mo/yr), Retrenchment (1/2 mo/yr), Closure, Disease (1/2 mo/yr).' },
      { x: 5700, y: 185, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Twin-Notice Rule Due Process', doctrineRule: '1st notice of cause with >=5 days to explain; hearing; 2nd notice of decision.' },
      { x: 5950, y: 220, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Agabon Doctrine (G.R. 158693)', doctrineRule: 'Just cause dismissal without due process is valid, but employer pays P30K damages.' },
      { x: 6150, y: 180, w: 36, h: 36, type: 'star', hit: false, bumpY: 0, doctrineTitle: 'Four-Fold Control Test', doctrineRule: '1) Selection, 2) Wages, 3) Dismissal, 4) Power of CONTROL (decisive).' },

      // ========== WORLD 1-4: BOWSER LAVA THRONE & DUE PROCESS BRIDGE ==========
      { x: 6700, y: 225, w: 36, h: 36, type: 'flower', hit: false, bumpY: 0, doctrineTitle: 'Art. 299: Disease as Authorized Cause', doctrineRule: 'Requires medical certificate issued by competent public health authority.' },
      { x: 6950, y: 190, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Preventive Suspension Rule', doctrineRule: 'Capped at 30 days; employer must reinstate or pay wages thereafter.' },
      { x: 7200, y: 220, w: 36, h: 36, type: 'star', hit: false, bumpY: 0, doctrineTitle: 'Labor Standards Primacy', doctrineRule: 'Statutory minimum benefits cannot be compromised below legal floor.' },
      { x: 7500, y: 190, w: 36, h: 36, type: 'flower', hit: false, bumpY: 0, doctrineTitle: 'Article 4: In Dubio Pro Operario', doctrineRule: 'All doubts in labor law construed in favor of the safety and living of worker.' },
      { x: 7800, y: 215, w: 36, h: 36, type: 'q', hit: false, bumpY: 0, doctrineTitle: 'Art. 302: Retirement Pay Formula', doctrineRule: '15 days pay + 5 days SIL + 1/12 13th month = 22.5 days per year of service.' },
    ];

    const pipes = [
      // Overworld Pipes
      { x: 320, y: 270, w: 46, h: 60 },
      { x: 740, y: 250, w: 46, h: 80 },
      { x: 1220, y: 260, w: 46, h: 70 },
      { x: 1650, y: 250, w: 46, h: 80 },
      { x: 2120, y: 240, w: 48, h: 90 }, // Warp Pipe to Underground
      // Underground Pipes
      { x: 2460, y: 260, w: 46, h: 70 },
      { x: 2900, y: 245, w: 46, h: 85 },
      { x: 3380, y: 255, w: 46, h: 75 },
      { x: 3850, y: 245, w: 46, h: 85 },
      { x: 4240, y: 235, w: 48, h: 95 }, // Warp Pipe to Castle
      // Castle Pipes
      { x: 4600, y: 255, w: 46, h: 75 },
      { x: 5100, y: 245, w: 46, h: 85 },
      { x: 5600, y: 250, w: 46, h: 80 },
      { x: 6050, y: 240, w: 46, h: 90 },
      { x: 6480, y: 235, w: 48, h: 95 }, // Warp Pipe to Bowser's Throne
      // Bowser Throne Lair Pipes
      { x: 6850, y: 250, w: 46, h: 80 },
      { x: 7350, y: 245, w: 46, h: 85 },
      { x: 7950, y: 240, w: 46, h: 90 },
    ];

    const createAirCoins = () => [
      { x: 140, y: 280, collected: false },
      { x: 500, y: 260, collected: false },
      { x: 535, y: 245, collected: false },
      { x: 790, y: 265, collected: false },
      { x: 1000, y: 265, collected: false },
      { x: 1450, y: 260, collected: false },
      { x: 1920, y: 265, collected: false },
      { x: 2400, y: 265, collected: false },
      { x: 2650, y: 250, collected: false },
      { x: 2980, y: 260, collected: false },
      { x: 3180, y: 240, collected: false },
      { x: 3450, y: 255, collected: false },
      { x: 3620, y: 245, collected: false },
      { x: 3920, y: 260, collected: false },
      { x: 4120, y: 250, collected: false },
      { x: 4550, y: 260, collected: false },
      { x: 4800, y: 250, collected: false },
      { x: 5050, y: 255, collected: false },
      { x: 5300, y: 240, collected: false },
      { x: 5550, y: 255, collected: false },
      { x: 5800, y: 245, collected: false },
      { x: 6100, y: 250, collected: false },
      { x: 6250, y: 235, collected: false },
      // World 1-4 Coins
      { x: 6750, y: 260, collected: false },
      { x: 7050, y: 250, collected: false },
      { x: 7400, y: 245, collected: false },
      { x: 7700, y: 255, collected: false },
      { x: 8050, y: 240, collected: false },
      { x: 8250, y: 240, collected: false },
    ];

    const createEnemies = (): Enemy2D[] => [
      { x: 480, y: 304, w: 26, h: 26, vx: -1.2, alive: true, type: 'goomba' },
      { x: 920, y: 304, w: 26, h: 26, vx: -1.2, alive: true, type: 'goomba' },
      { x: 1380, y: 304, w: 26, h: 26, vx: -1.2, alive: true, type: 'koopa' },
      { x: 1750, y: 304, w: 26, h: 26, vx: -1.2, alive: true, type: 'goomba' },
      { x: 2550, y: 304, w: 26, h: 26, vx: -1.3, alive: true, type: 'goomba' },
      { x: 2950, y: 304, w: 26, h: 26, vx: -1.3, alive: true, type: 'koopa' },
      { x: 3450, y: 304, w: 26, h: 26, vx: -1.3, alive: true, type: 'goomba' },
      { x: 3950, y: 304, w: 26, h: 26, vx: -1.3, alive: true, type: 'koopa' },
      { x: 4650, y: 304, w: 26, h: 26, vx: -1.4, alive: true, type: 'goomba' },
      { x: 5150, y: 304, w: 26, h: 26, vx: -1.4, alive: true, type: 'koopa' },
      { x: 5650, y: 304, w: 26, h: 26, vx: -1.4, alive: true, type: 'goomba' },
      { x: 6100, y: 304, w: 26, h: 26, vx: -1.4, alive: true, type: 'koopa' },
      // World 1-4 Patrols
      { x: 6800, y: 304, w: 26, h: 26, vx: -1.5, alive: true, type: 'koopa' },
      { x: 7300, y: 304, w: 26, h: 26, vx: -1.5, alive: true, type: 'goomba' },
      { x: 7750, y: 304, w: 26, h: 26, vx: -1.5, alive: true, type: 'koopa' },
      { x: 8100, y: 304, w: 26, h: 26, vx: -1.5, alive: true, type: 'goomba' },
    ];

    let blocks = createBlocks();
    let airCoins = createAirCoins();
    let enemies = createEnemies();

    resetWorldRef.current = () => {
      player = {
        x: checkpointX,
        y: groundY - 38,
        width: 28,
        height: 38,
        vx: 0,
        vy: 0,
        grounded: true,
        direction: 1,
        coyoteTimer: 0,
        jumpBufferTimer: 0,
        jumpCutApplied: false,
      };
      scaleX = 1;
      scaleY = 1;
      cameraX = Math.max(0, checkpointX - 100);
      localScore = 0;
      localCoins = 0;
      localPowerUp = 'small';
      starTimer = 0;
      invulnTimer = 0;
      setPowerUpState('small');
      setIsStarInvincible(false);
      fireballs.length = 0;
      bowserFireballs.length = 0;
      bowser.hp = 5;
      bowser.alive = true;
      bowser.bridgeCollapsed = false;
      blocks = createBlocks();
      airCoins = createAirCoins();
      enemies = createEnemies();
    };

    const shootFireball = () => {
      if (localPowerUp !== 'fire' || gameStateRef.current !== 'playing') return;
      if (fireballs.filter((f) => f.alive).length >= 4) return;
      fireballs.push({
        x: player.x + (player.direction > 0 ? player.width + 2 : -8),
        y: player.y + 16,
        vx: player.direction * 6.5,
        vy: 2.0,
        alive: true,
      });
      marioAudio.playFireball();
    };

    const gameLoop = (currentTime: number) => {
      const dtMs = Math.min(40, Math.max(8, currentTime - lastTime));
      const dtSec = dtMs / 1000;
      lastTime = currentTime;
      const stepScale = dtMs / 16.6667;

      if (gameStateRef.current === 'playing') {
        const wasGrounded = player.grounded;
        const prevY = player.y;

        // Player Dash speed boost
        const speedMultiplier = keysRef.current.dash ? 1.55 : 1.0;

        // Fireball input check
        if (keysRef.current.fireJustPressed) {
          keysRef.current.fireJustPressed = false;
          shootFireball();
        }

        const stepRes = stepPlatformer2DPhysics(
          player,
          {
            left: keysRef.current.left,
            right: keysRef.current.right,
            jumpHeld: keysRef.current.jumpHeld,
            jumpJustPressed: keysRef.current.jumpJustPressed,
          },
          stepScale * speedMultiplier
        );
        keysRef.current.jumpJustPressed = false;
        player = stepRes.state;

        if (stepRes.didTriggerJump) {
          scaleX = 0.84;
          scaleY = 1.18;
          marioAudio.playJump();
        }

        // Camera scroll clamp
        if (player.x < cameraX) {
          player.x = cameraX;
          if (player.vx < 0) player.vx = 0;
        }

        player.grounded = false;

        // Ground landing (except over collapsed bridge)
        const isOverCollapsedLava =
          bowser.bridgeCollapsed && player.x >= 8280 && player.x <= 8580;

        if (!isOverCollapsedLava && player.y + player.height >= groundY) {
          player.y = groundY - player.height;
          if (!wasGrounded && player.vy > 2.5) {
            scaleX = 1.2;
            scaleY = 0.82;
          }
          player.vy = 0;
          player.grounded = true;
        } else if (isOverCollapsedLava && player.y > groundY + 80) {
          // Fell into Bowser's lava pit!
          player.y = groundY - player.height;
          player.x = 8150;
          player.vx = 0;
          player.vy = 0;
          setLives((l) => Math.max(1, l - 1));
          marioAudio.playBowserHit();
        }

        // Checkpoints detection
        if (player.x >= 2150 && checkpointX < 2150) {
          checkpointX = 2150;
          marioAudio.playFlagpole();
          setLatestFact('CHECKPOINT REACHED! Entering World 1-2: Underground Wage & Subcontracting Cavern!');
        } else if (player.x >= 4250 && checkpointX < 4250) {
          checkpointX = 4250;
          marioAudio.playFlagpole();
          setLatestFact('CHECKPOINT REACHED! Entering World 1-3: Castle of Protective Laws & Due Process!');
        } else if (player.x >= 6480 && checkpointX < 6480) {
          checkpointX = 6480;
          marioAudio.playFlagpole();
          setLatestFact('CHECKPOINT REACHED! Entering World 1-4: Bowser Throne Bridge & Security of Tenure!');
        }

        // Update active zone in HUD
        if (player.x >= 6480) {
          setActiveZone('World 1-4: Bowser Throne Bridge');
        } else if (player.x >= 4250) {
          setActiveZone('World 1-3: Castle of Protective Laws');
        } else if (player.x >= 2150) {
          setActiveZone('World 1-2: Underground Wage Caverns');
        } else {
          setActiveZone('World 1-1: Overworld Labor Plain');
        }

        // Update course progress pct
        setCourseProgressPct(Math.min(100, Math.round((player.x / flagpoleX) * 100)));

        // Star power timer
        if (starTimer > 0) {
          starTimer -= dtSec;
          if (starTimer <= 0) {
            setIsStarInvincible(false);
          }
        }

        if (invulnTimer > 0) {
          invulnTimer -= dtSec;
        }

        // Update Fireballs
        fireballs.forEach((fb) => {
          if (!fb.alive) return;
          fb.x += fb.vx * stepScale;
          fb.y += fb.vy * stepScale;
          fb.vy += 0.35 * stepScale;

          // Bounce on ground
          if (fb.y >= groundY - 6) {
            fb.y = groundY - 6;
            fb.vy = -3.8;
          }

          // Offscreen
          if (fb.x > cameraX + 800 || fb.x < cameraX - 50) {
            fb.alive = false;
          }

          // Hit enemies
          enemies.forEach((e) => {
            if (e.alive && Math.hypot(fb.x - (e.x + 13), fb.y - (e.y + 13)) < 18) {
              e.alive = false;
              fb.alive = false;
              localScore += 300;
              setScore(localScore);
              marioAudio.playStomp();
            }
          });

          // Hit Bowser
          if (
            bowser.alive &&
            fb.x >= bowser.x &&
            fb.x <= bowser.x + bowser.w &&
            fb.y >= bowser.y &&
            fb.y <= bowser.y + bowser.h
          ) {
            fb.alive = false;
            bowser.hp -= 1;
            marioAudio.playBowserHit();
            if (bowser.hp <= 0) {
              bowser.alive = false;
              localScore += 5000;
              localCoins += 25;
              setScore(localScore);
              setCoins(localCoins);
              onEarnCoinsRef.current(25);
            }
          }
        });

        // Update Bowser Boss AI & Fireballs
        if (bowser.alive && player.x > 7900) {
          bowser.breathTimer -= dtSec;
          bowser.jumpTimer -= dtSec;

          if (bowser.breathTimer <= 0) {
            bowser.breathTimer = 2.4;
            bowserFireballs.push({
              x: bowser.x - 10,
              y: bowser.y + 20,
              vx: -4.5,
              vy: Math.sin(currentTime * 0.005) * 1.5,
              alive: true,
            });
            marioAudio.playFireball();
          }

          if (bowser.jumpTimer <= 0) {
            bowser.jumpTimer = 3.5;
            bowser.vy = -6.5;
          }

          bowser.y += bowser.vy * stepScale;
          bowser.vy += 0.35 * stepScale;
          if (bowser.y >= groundY - bowser.h) {
            bowser.y = groundY - bowser.h;
            bowser.vy = 0;
          }
        }

        // Update Bowser fireballs
        bowserFireballs.forEach((bfb) => {
          if (!bfb.alive) return;
          bfb.x += bfb.vx * stepScale;
          bfb.y += bfb.vy * stepScale;
          if (bfb.x < cameraX - 100) bfb.alive = false;

          // Hit player
          if (
            bfb.alive &&
            invulnTimer <= 0 &&
            starTimer <= 0 &&
            Math.hypot(bfb.x - (player.x + 14), bfb.y - (player.y + 19)) < 18
          ) {
            bfb.alive = false;
            invulnTimer = 2.0;
            if (localPowerUp !== 'small') {
              localPowerUp = 'small';
              setPowerUpState('small');
              marioAudio.playTryAgain();
            } else {
              setLives((l) => {
                const next = l - 1;
                if (next <= 0) setGameState('gameover');
                return next;
              });
              marioAudio.playBowserHit();
            }
          }
        });

        // Golden Axe bridge collapse trigger at x = 8620
        if (!bowser.bridgeCollapsed && player.x >= 8620) {
          bowser.bridgeCollapsed = true;
          bowser.alive = false;
          marioAudio.playBowserHit();
          localScore += 5000;
          localCoins += 30;
          setScore(localScore);
          setCoins(localCoins);
          onEarnCoinsRef.current(30);
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
        }

        // Block collisions
        blocks.forEach((block) => {
          if (block.bumpY < 0) {
            block.bumpY = Math.min(0, block.bumpY + 1.2 * stepScale);
          }

          // Head bump from underneath
          if (
            player.x + player.width > block.x + 3 &&
            player.x < block.x + block.w - 3 &&
            player.y <= block.y + block.h &&
            prevY >= block.y + block.h - 10 &&
            player.vy < 0
          ) {
            player.y = block.y + block.h;
            player.vy = 0.5;
            block.bumpY = -8;

            if (!block.hit) {
              block.hit = true;
              block.bumpY = -12;

              if (block.type === 'flower') {
                localPowerUp = 'fire';
                setPowerUpState('fire');
                localCoins += 5;
                localScore += 1000;
                setCoins(localCoins);
                setScore(localScore);
                onEarnCoinsRef.current(5);
                marioAudio.playPowerUp();
                setLatestFact('FIRE FLOWER ACTIVATED! Tap FIRE button to blast fireballs!');
              } else if (block.type === 'star') {
                starTimer = 14;
                setIsStarInvincible(true);
                localCoins += 10;
                localScore += 2000;
                setCoins(localCoins);
                setScore(localScore);
                onEarnCoinsRef.current(10);
                marioAudio.playPowerUp();
                setLatestFact('SUPER STAR INVINCIBILITY! Rush through all statutory hazards invulnerable!');
              } else if (block.type === 'q') {
                localCoins += 2;
                localScore += 500;
                setCoins(localCoins);
                setScore(localScore);
                onEarnCoinsRef.current(2);
                marioAudio.playQuestionBlock();
              }

              if (block.doctrineTitle && block.doctrineRule) {
                setLatestFact(`${block.doctrineTitle}: ${block.doctrineRule}`);
                setActiveDoctrineCard({
                  title: block.doctrineTitle,
                  rule: block.doctrineRule,
                });
              } else {
                setLatestFact(drawPlatformer2DDoctrine());
              }
            } else {
              marioAudio.playJump();
            }
          }

          // Top landing
          if (
            player.x + player.width > block.x + 4 &&
            player.x < block.x + block.w - 4 &&
            player.y + player.height >= block.y &&
            prevY + player.height <= block.y + 12 &&
            player.vy >= 0
          ) {
            player.y = block.y - player.height;
            if (!wasGrounded && player.vy > 2.5) {
              scaleX = 1.18;
              scaleY = 0.84;
            }
            player.vy = 0;
            player.grounded = true;
          }
        });

        // Pipe collisions
        pipes.forEach((pipe) => {
          if (
            player.x + player.width > pipe.x &&
            player.x < pipe.x + pipe.w &&
            player.y + player.height > pipe.y
          ) {
            if (prevY + player.height <= pipe.y + 12 && player.vy >= 0) {
              player.y = pipe.y - player.height;
              player.vy = 0;
              player.grounded = true;
            } else {
              if (player.x + player.width / 2 < pipe.x + pipe.w / 2) {
                player.x = pipe.x - player.width;
              } else {
                player.x = pipe.x + pipe.w;
              }
              player.vx = 0;
            }
          }
        });

        // Air coins
        airCoins.forEach((c) => {
          if (c.collected) return;
          if (
            player.x + player.width > c.x - 12 &&
            player.x < c.x + 12 &&
            player.y + player.height > c.y - 14 &&
            player.y < c.y + 14
          ) {
            c.collected = true;
            localCoins += 1;
            localScore += 200;
            setCoins(localCoins);
            setScore(localScore);
            onEarnCoinsRef.current(1);
            marioAudio.playCoin();
          }
        });

        // Enemy collision & stomp
        enemies.forEach((enemy) => {
          if (!enemy.alive) return;
          enemy.x += enemy.vx * stepScale;

          // Turn at pipes
          pipes.forEach((p) => {
            if (enemy.x + enemy.w > p.x && enemy.x < p.x + p.w) {
              enemy.vx *= -1;
            }
          });

          // Player collision with enemy
          if (
            player.x + player.width > enemy.x + 4 &&
            player.x < enemy.x + enemy.w - 4 &&
            player.y + player.height > enemy.y &&
            player.y < enemy.y + enemy.h
          ) {
            if (starTimer > 0) {
              // Star invincibility run-through!
              enemy.alive = false;
              localScore += 500;
              setScore(localScore);
              marioAudio.playStomp();
            } else if (prevY + player.height <= enemy.y + 14 && player.vy > 0) {
              // Stomp success!
              enemy.alive = false;
              player.vy = -7.8;
              localScore += 450;
              setScore(localScore);
              marioAudio.playStomp();
            } else if (invulnTimer <= 0) {
              // Hurt!
              invulnTimer = 2.0;
              if (localPowerUp !== 'small') {
                localPowerUp = 'small';
                setPowerUpState('small');
                marioAudio.playTryAgain();
              } else {
                marioAudio.playTryAgain();
                setLives((l) => {
                  const next = l - 1;
                  if (next <= 0) {
                    setGameState('gameover');
                  } else {
                    player.x = checkpointX;
                    player.y = groundY - player.height;
                    player.vx = 0;
                    player.vy = 0;
                    cameraX = Math.max(0, checkpointX - 100);
                  }
                  return next;
                });
              }
            }
          }
        });

        // Flagpole victory
        if (player.x >= flagpoleX && gameStateRef.current === 'playing') {
          setGameState('victory');
          onEarnCoinsRef.current(50);
          marioAudio.playFlagpole();
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.6 },
          });
        }

        // Camera smooth follow
        const targetCamX = player.x - 240;
        if (targetCamX > cameraX) {
          cameraX += (targetCamX - cameraX) * 0.14 * stepScale;
        }

        scaleX += (1 - scaleX) * Math.min(1, 0.22 * stepScale);
        scaleY += (1 - scaleY) * Math.min(1, 0.22 * stepScale);
      }

      // Render Stage
      const W = canvas.width;
      const H = canvas.height;

      // 1. Sky / Background Theme based on player position
      if (player.x >= 6480) {
        // World 1-4 Bowser Throne: Dark obsidian & bubbling lava glow
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#1c1917');
        grad.addColorStop(0.7, '#450a0a');
        grad.addColorStop(1, '#991b1b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      } else if (player.x >= 4250) {
        // World 1-3 Castle Theme: Deep crimson red
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#450a0a');
        grad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      } else if (player.x >= 2150) {
        // World 1-2 Underground Theme: Midnight obsidian
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#020617');
        grad.addColorStop(1, '#0f172a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      } else {
        // World 1-1 Overworld Theme: Classic Super Mario Sky Blue
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#38bdf8');
        grad.addColorStop(0.6, '#60a5fa');
        grad.addColorStop(1, '#93c5fd');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#ffffff';
        const cloudOffsets = [150, 480, 820, 1200, 1600, 1950];
        cloudOffsets.forEach((cx) => {
          const drawCloudX = cx - cameraX * 0.3;
          if (drawCloudX > -120 && drawCloudX < W + 120) {
            ctx.beginPath();
            ctx.arc(drawCloudX, 70, 24, 0, Math.PI * 2);
            ctx.arc(drawCloudX + 26, 60, 32, 0, Math.PI * 2);
            ctx.arc(drawCloudX + 54, 70, 24, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      ctx.save();
      ctx.translate(-cameraX, 0);

      // 2. Ground Terrain
      if (player.x >= 6480) {
        // Bowser Lava Throne Ground + Drawbridge
        ctx.fillStyle = '#1c1917';
        ctx.fillRect(-200, groundY, 9500, H - groundY);
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(-200, groundY, 9500, 10);

        // Drawbridge Section (Collapses if activated)
        if (bowser.bridgeCollapsed) {
          ctx.fillStyle = '#7f1d1d';
          ctx.fillRect(8280, groundY, 300, H - groundY);
          // Molten bubbling lava
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(8280, groundY + 12, 300, H - groundY);
        } else {
          ctx.fillStyle = '#78350f';
          ctx.fillRect(8280, groundY, 300, 16);
          ctx.fillStyle = '#451a03';
          for (let bx = 8280; bx < 8580; bx += 20) {
            ctx.fillRect(bx, groundY, 2, 16);
          }
        }
      } else if (player.x >= 4250) {
        ctx.fillStyle = '#292524';
        ctx.fillRect(-200, groundY, 9500, H - groundY);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-200, groundY, 9500, 10);
      } else if (player.x >= 2150) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-200, groundY, 9500, H - groundY);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-200, groundY, 9500, 8);
      } else {
        ctx.fillStyle = '#9a3412';
        ctx.fillRect(-200, groundY, 9500, H - groundY);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(-200, groundY, 9500, 16);
      }

      // Checkpoint Flags
      [
        { x: 2150, label: 'W1-2' },
        { x: 4250, label: 'W1-3' },
        { x: 6480, label: 'W1-4' },
      ].forEach((cp) => {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(cp.x, 230, 4, 100);
        ctx.fillStyle = checkpointX >= cp.x ? '#22c55e' : '#64748b';
        ctx.beginPath();
        ctx.moveTo(cp.x + 4, 235);
        ctx.lineTo(cp.x + 32, 248);
        ctx.lineTo(cp.x + 4, 260);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.fillText(cp.label, cp.x + 6, 250);
      });

      // Pipes
      pipes.forEach((p) => {
        const isUnderground = p.x >= 2150 && p.x < 4250;
        const isCastle = p.x >= 4250;
        ctx.fillStyle = isCastle ? '#450a0a' : isUnderground ? '#0369a1' : '#15803d';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = isCastle ? '#dc2626' : isUnderground ? '#38bdf8' : '#22c55e';
        ctx.fillRect(p.x + 6, p.y, 6, p.h);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.fillStyle = isCastle ? '#991b1b' : isUnderground ? '#0284c7' : '#16a34a';
        ctx.fillRect(p.x - 4, p.y, p.w + 8, 14);
        ctx.strokeRect(p.x - 4, p.y, p.w + 8, 14);
      });

      // Blocks
      blocks.forEach((b) => {
        const drawY = b.y + b.bumpY;
        if (b.type === 'flower') {
          ctx.fillStyle = b.hit ? '#94a3b8' : '#ef4444';
          ctx.fillRect(b.x, drawY, b.w, b.h);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.strokeRect(b.x, drawY, b.w, b.h);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(b.hit ? '•' : '❀', b.x + 10, drawY + 25);
        } else if (b.type === 'star') {
          ctx.fillStyle = b.hit ? '#94a3b8' : '#eab308';
          ctx.fillRect(b.x, drawY, b.w, b.h);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.strokeRect(b.x, drawY, b.w, b.h);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText(b.hit ? '•' : '★', b.x + 9, drawY + 25);
        } else if (b.type === 'q') {
          ctx.fillStyle = b.hit ? '#94a3b8' : '#f59e0b';
          ctx.fillRect(b.x, drawY, b.w, b.h);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.strokeRect(b.x, drawY, b.w, b.h);
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 20px monospace';
          ctx.fillText(b.hit ? '•' : '?', b.x + 11, drawY + 26);
        } else {
          ctx.fillStyle = '#9a3412';
          ctx.fillRect(b.x, drawY, b.w, b.h);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.strokeRect(b.x, drawY, b.w, b.h);
        }
      });

      // Air Coins
      airCoins.forEach((c) => {
        if (c.collected) return;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Fireballs
      fireballs.forEach((fb) => {
        if (!fb.alive) return;
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.arc(fb.x, fb.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(fb.x, fb.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Bowser Fireballs
      bowserFireballs.forEach((bfb) => {
        if (!bfb.alive) return;
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(bfb.x, bfb.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(bfb.x, bfb.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Enemies
      enemies.forEach((e) => {
        if (!e.alive) return;
        if (e.type === 'goomba') {
          ctx.fillStyle = '#854d0e';
          ctx.beginPath();
          ctx.arc(e.x + 13, e.y + 13, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.arc(e.x + 13, e.y + 13, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });

      // Bowser Boss at x = 8350
      if (bowser.alive) {
        ctx.fillStyle = '#15803d'; // Green spiky shell
        ctx.fillRect(bowser.x, bowser.y, bowser.w, bowser.h);
        ctx.fillStyle = '#eab308'; // Belly
        ctx.fillRect(bowser.x + 4, bowser.y + 12, bowser.w - 8, bowser.h - 16);
        ctx.fillStyle = '#dc2626'; // Red hair crest
        ctx.fillRect(bowser.x + 12, bowser.y - 10, 24, 12);
        // Horns
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bowser.x + 6, bowser.y - 8, 6, 8);
        ctx.fillRect(bowser.x + 38, bowser.y - 8, 6, 8);
        // HP meter
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(bowser.x, bowser.y - 20, (bowser.hp / 5) * bowser.w, 5);
      }

      // Golden Axe switch at x = 8620
      if (!bowser.bridgeCollapsed) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(8620, groundY - 32, 6, 32);
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(8626, groundY - 32);
        ctx.lineTo(8642, groundY - 24);
        ctx.lineTo(8626, groundY - 16);
        ctx.fill();
      }

      // Grand Supreme Court Flagpole at x = 8650
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(flagpoleX + 12, 100, 6, 230);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(flagpoleX + 15, 100, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(flagpoleX + 12, 108);
      ctx.lineTo(flagpoleX - 45, 125);
      ctx.lineTo(flagpoleX + 12, 142);
      ctx.fill();

      // Final Victory Castle with Princess Peach at x = 8740
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(8740, 170, 160, 160);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(8795, 120, 50, 50);

      // Draw Player Character
      ctx.save();
      const centerX = player.x + player.width / 2;
      const bottomY = player.y + player.height;
      ctx.translate(centerX, bottomY);
      ctx.scale(player.direction * scaleX, scaleY);
      ctx.translate(-player.width / 2, -player.height);

      const meta = getHeroMeta(equippedAvatar);
      const isFire = localPowerUp === 'fire';
      const primaryColor = isFire ? '#ffffff' : '#' + meta.primaryHex.toString(16).padStart(6, '0');
      const secondaryColor = isFire ? '#dc2626' : '#' + meta.secondaryHex.toString(16).padStart(6, '0');

      // Flashing rainbow star effect
      if (starTimer > 0) {
        const rainbowTones = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];
        ctx.fillStyle = rainbowTones[Math.floor(currentTime / 80) % rainbowTones.length];
      } else {
        ctx.fillStyle = secondaryColor;
      }

      ctx.fillRect(4, 14, player.width - 8, player.height - 18);

      ctx.fillStyle = starTimer > 0 ? '#fef08a' : primaryColor;
      ctx.fillRect(2, 12, player.width - 4, 10);

      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(6, 4, player.width - 12, 12);

      ctx.fillStyle = primaryColor;
      ctx.fillRect(4, 0, player.width - 6, 6);
      ctx.fillRect(player.width - 6, 4, 6, 3);

      ctx.fillStyle = '#451a03';
      ctx.fillRect(player.width - 12, 10, 8, 3);

      ctx.fillStyle = '#78350f';
      ctx.fillRect(2, player.height - 5, 10, 5);
      ctx.fillRect(player.width - 12, player.height - 5, 10, 5);

      ctx.restore();
      ctx.restore();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [equippedAvatar]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="bg-[#1e293b] rounded-3xl mario-card border-4 border-slate-950 p-3 sm:p-5 text-white space-y-3.5">
        {/* Header HUD */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-slate-700 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
              <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider font-mario block">
                EXTENDED 4-WORLD ADVENTURE • 8,800PX COURSE WITH BOSS
              </span>
              <h2 className="text-lg sm:text-2xl font-black font-display text-white">
                2D MARIO LABOR RUN
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 bg-slate-900 px-3 py-2 rounded-xl border-2 border-slate-700 w-full sm:w-auto tabular-nums">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${
                    i < lives ? 'text-red-500 fill-red-500' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            {powerUpState === 'fire' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold font-mario">
                <Flame className="w-3 h-3" /> FIRE
              </span>
            )}
            {isStarInvincible && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-bold font-mario animate-pulse">
                <Sparkles className="w-3 h-3" /> STAR
              </span>
            )}
            <div className="flex items-center gap-1.5 font-mario text-xs text-amber-300">
              <MarioCoinIcon className="w-4 h-4 shrink-0" />
              <span>x{coins.toString().padStart(2, '0')}</span>
            </div>
            <div className="font-mario text-xs text-white">
              SCORE: <span className="text-emerald-400">{score.toString().padStart(5, '0')}</span>
            </div>
            <button
              type="button"
              aria-label="Restart 2D Run"
              onClick={startGame}
              className="min-h-[34px] px-2.5 inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg border border-slate-600 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Course Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1">
            <span>W1-1 Overworld</span>
            <span>W1-2 Cavern</span>
            <span>W1-3 Castle</span>
            <span className="text-rose-400">W1-4 Bowser Lair</span>
          </div>
          <div className="w-full h-2.5 bg-slate-900 rounded-full border border-slate-700 overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-emerald-400 to-rose-500 transition-all duration-100"
              style={{ width: `${courseProgressPct}%` }}
            />
          </div>
        </div>

        {/* Zone Badge Bar */}
        <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-700 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-black text-amber-300 truncate">{activeZone}</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate hidden sm:block">
            {latestFact}
          </div>
        </div>

        {/* 2D Canvas Viewport */}
        <div
          data-testid="game2d-viewport"
          className={`relative rounded-2xl border-4 border-slate-950 overflow-hidden bg-slate-950 shadow-2xl w-full max-w-full ${
            gameState === 'gameover' || gameState === 'victory'
              ? 'min-h-[380px] sm:min-h-[460px] md:min-h-[500px]'
              : 'h-[270px] min-[400px]:h-[320px] sm:h-[450px] md:h-[500px]'
          } flex items-center justify-center arcade-viewport-scaled select-none transition-all duration-200`}
        >
          <canvas
            ref={canvasRef}
            width={760}
            height={420}
            className="w-full h-full block object-contain arcade-canvas-scaled"
          />

          {/* Title Screen Overlay */}
          {gameState === 'start' && (
            <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center text-center p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto text-white">
              <div className="max-w-md space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-xs font-bold font-mario">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>8,800PX EXTENDED ACTION COURSE</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black font-display text-white">
                  2D MARIO LABOR RUN
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Run, jump, and blast fireballs across 4 complete statutory worlds! Stomp Goombas and Koopas, trigger Fire Flowers and Super Stars, and defeat Bowser on the Security of Tenure Bridge!
                </p>
              </div>

              <button
                type="button"
                data-start="true"
                onClick={startGame}
                className="min-h-[46px] sm:min-h-[52px] px-7 sm:px-9 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] text-xs sm:text-base cursor-pointer font-mario whitespace-nowrap z-30 shrink-0"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
                <span>START 2D ADVENTURE</span>
              </button>

              <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
                <span>A / D / Arrows: Move</span>
                <span>·</span>
                <span>Shift / Z: Sprint</span>
                <span>·</span>
                <span>Space / W: Jump</span>
                <span>·</span>
                <span>F / X: Shoot Fireballs</span>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === 'gameover' && (
            <div className="absolute inset-0 z-20 bg-slate-950/95 flex flex-col items-center justify-center text-center p-4 sm:p-6 pb-8 space-y-3 sm:space-y-4 text-white overflow-y-auto">
              <h3 className="text-2xl sm:text-3xl font-black font-display text-rose-500">
                GAME OVER
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
                You ran out of lives! Review the labor standards and try the run again.
              </p>
              <button
                type="button"
                data-start="true"
                onClick={startGame}
                className="min-h-[46px] px-8 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer font-mario text-xs whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>TRY AGAIN</span>
              </button>
            </div>
          )}

          {/* Victory Screen */}
          {gameState === 'victory' && (
            <div className="absolute inset-0 z-20 bg-slate-950/92 flex flex-col items-center justify-center text-center p-4 sm:p-6 pb-8 space-y-3 sm:space-y-4 text-white overflow-y-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-400 border-3 border-black flex items-center justify-center text-slate-950 shadow-[0_4px_0_#000] shrink-0">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-display text-amber-300">
                COURSE CLEARED! BOWSER DEFEATED!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
                You successfully crossed all 4 worlds, conquered the Security of Tenure Bridge, and rescued the labor standards!
              </p>
              <div className="flex items-center gap-4 text-sm font-mario">
                <span className="text-emerald-400">SCORE: {score}</span>
                <span className="text-amber-300">COINS: {coins}</span>
              </div>
              <button
                type="button"
                data-start="true"
                onClick={startGame}
                className="min-h-[46px] px-8 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer font-mario text-xs whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>PLAY AGAIN</span>
              </button>
            </div>
          )}
        </div>

        {/* Active Doctrine Card */}
        {activeDoctrineCard && (
          <div className="p-3 bg-slate-900 border-2 border-amber-400 rounded-xl space-y-1 animate-in fade-in">
            <div className="flex items-center justify-between text-amber-300 text-xs font-black">
              <span>{activeDoctrineCard.title}</span>
              <button
                type="button"
                onClick={() => setActiveDoctrineCard(null)}
                className="text-slate-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-slate-200">{activeDoctrineCard.rule}</p>
          </div>
        )}

        {/* Ergonomic On-Screen Controls */}
        <div className="pt-2 w-full max-w-full box-border">
          <div className="bg-slate-900/90 border-2 border-slate-700/80 rounded-2xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-inner">
            {/* D-Pad */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                aria-label="Move Left"
                onPointerDown={(e) => {
                  e.preventDefault();
                  keysRef.current.left = true;
                }}
                onPointerUp={() => (keysRef.current.left = false)}
                onPointerLeave={() => (keysRef.current.left = false)}
                onPointerCancel={() => (keysRef.current.left = false)}
                className="h-10 w-10 sm:h-11 sm:w-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-black rounded-xl border-2 border-slate-600 inline-flex items-center justify-center cursor-pointer shrink-0 touch-none select-none transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              </button>
              <button
                type="button"
                aria-label="Move Right"
                onPointerDown={(e) => {
                  e.preventDefault();
                  keysRef.current.right = true;
                }}
                onPointerUp={() => (keysRef.current.right = false)}
                onPointerLeave={() => (keysRef.current.right = false)}
                onPointerCancel={() => (keysRef.current.right = false)}
                className="h-10 w-10 sm:h-11 sm:w-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-black rounded-xl border-2 border-slate-600 inline-flex items-center justify-center cursor-pointer shrink-0 touch-none select-none transition-colors"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              </button>
            </div>

            {/* Action Buttons: Run, Fireball, Jump */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                aria-label="Sprint / Run"
                onPointerDown={(e) => {
                  e.preventDefault();
                  keysRef.current.dash = true;
                  setIsDashing(true);
                }}
                onPointerUp={() => {
                  keysRef.current.dash = false;
                  setIsDashing(false);
                }}
                onPointerLeave={() => {
                  keysRef.current.dash = false;
                  setIsDashing(false);
                }}
                onPointerCancel={() => {
                  keysRef.current.dash = false;
                  setIsDashing(false);
                }}
                className={`min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 inline-flex items-center justify-center gap-1 rounded-xl border-2 font-mario text-[10px] sm:text-xs cursor-pointer transition-colors ${
                  isDashing
                    ? 'bg-rose-500 text-white border-white shadow-[0_0_10px_#f43f5e]'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-600'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>RUN</span>
              </button>

              <button
                type="button"
                aria-label="Shoot Fireball"
                onClick={() => {
                  keysRef.current.fireJustPressed = true;
                }}
                className={`min-h-[44px] sm:min-h-[48px] px-3 sm:px-4 inline-flex items-center justify-center gap-1 rounded-xl border-2 font-mario text-[10px] sm:text-xs cursor-pointer transition-colors ${
                  powerUpState === 'fire'
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white border-black shadow-[0_2px_0_#000]'
                    : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>FIRE<span className="hidden sm:inline font-mono ml-1 text-[10px]">[F]</span></span>
              </button>

              <button
                type="button"
                aria-label="Jump (Hold for High Jump)"
                onPointerDown={(e) => {
                  e.preventDefault();
                  keysRef.current.jumpJustPressed = true;
                  keysRef.current.jumpHeld = true;
                }}
                onPointerUp={() => {
                  keysRef.current.jumpHeld = false;
                }}
                onPointerLeave={() => {
                  keysRef.current.jumpHeld = false;
                }}
                onPointerCancel={() => {
                  keysRef.current.jumpHeld = false;
                }}
                className="min-h-[44px] sm:min-h-[48px] px-5 sm:px-6 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 active:scale-95 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_3px_0_#000] cursor-pointer font-mario text-[10px] sm:text-xs leading-none whitespace-nowrap touch-none select-none transition-transform"
              >
                <ArrowUp className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                <span>JUMP<span className="hidden sm:inline font-mono ml-1 text-[10px]">[SPACE]</span></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
