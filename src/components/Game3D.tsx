import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { marioAudio } from '../utils/audio';
import { MarioAvatar } from '../types/laborLaw';
import { getHeroMeta } from '../data/heroesData';
import {
  AABB3D,
  WorldBounds3D,
  createBoxCollider,
  resolveCharacterStep3D,
} from '../utils/collision3d';
import { stepIsland3DMomentum } from '../utils/gamePhysics';
import { MarioCharacterAvatar, MarioCoinIcon } from './MarioIcons';
import {
  Play,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Trophy,
  Scale,
  BookOpen,
  Sparkles,
  CheckCircle2,
  X,
  Compass,
  Bookmark,
  Check,
  Zap,
  Heart,
  Flag,
  Maximize2,
  Eye,
  Camera,
} from 'lucide-react';
import {
  loadStudyNotes,
  createStudyNote,
  saveStudyNotes,
} from '../utils/engagementFeatures';

interface Game3DProps {
  fontSize?: 'normal' | 'large' | 'xlarge';
  equippedAvatar?: MarioAvatar;
  onEarnCoins: (amount: number) => void;
}

export interface IslandLaborDoctrine {
  id: string;
  title: string;
  legalCitation: string;
  shortRule: string;
  fullPrinciple: string;
  barTip: string;
  category: 'Hours' | 'Wages' | 'Rest & Holidays' | 'Leaves' | 'Tenure';
}

export const ISLAND_LABOR_DOCTRINES: Record<string, IslandLaborDoctrine> = {
  'q-art83': {
    id: 'q-art83',
    title: 'Normal Hours of Work & Compensable Waiting Time',
    legalCitation: 'Labor Code, Article 83 & 84',
    shortRule: 'Normal work shall not exceed 8 hours per day.',
    fullPrinciple:
      'Hours worked includes all time during which an employee is required to be on duty or to be at a prescribed workplace, and all time during which an employee is suffered or permitted to work. Waiting time is compensable if waiting is an integral part of the work (engaged to wait).',
    barTip:
      'Health personnel in cities/hospitals with >= 100 bed capacity work 40 hours over 5 days (Art. 83).',
    category: 'Hours',
  },
  'q-art85': {
    id: 'q-art85',
    title: 'Statutory Meal Period & Short Rest Breaks',
    legalCitation: 'Labor Code, Article 85',
    shortRule: 'Not less than 60 minutes time-off for regular meals.',
    fullPrinciple:
      'Regular meal periods of at least 60 minutes are non-compensable unless the employee is required to remain on stand-by or perform duties during the break. Short rest periods or coffee breaks of 5 to 20 minutes are considered compensable working time.',
    barTip:
      'A shortened meal break of not less than 20 minutes may be non-compensable only when requested by employees under DOLE guidelines with no loss of pay.',
    category: 'Hours',
  },
  'q-art87': {
    id: 'q-art87',
    title: 'Overtime Work & Computation Multipliers',
    legalCitation: 'Labor Code, Article 87 & 93',
    shortRule: 'Overtime rate is +25% on regular days; +30% on rest days/holidays.',
    fullPrinciple:
      'Work performed beyond 8 hours a day entitles the worker to additional compensation equivalent to regular wage plus at least 25% thereof. On rest days or special days, OT is hourly rate x 130% x 130% (+69% total). Undertime cannot be offset by overtime on another day.',
    barTip:
      'Compressed Workweek (CWW) requires DOLE notice, daily hours capped at 12 hours, and total weekly hours capped at 48 hours without OT pay.',
    category: 'Hours',
  },
  'q-art93': {
    id: 'q-art93',
    title: 'Weekly Rest Day Schedule & Premium Rates',
    legalCitation: 'Labor Code, Articles 91-93',
    shortRule: 'Consecutive 24 consecutive hours of rest after 6 work days.',
    fullPrinciple:
      'Every employer must provide a rest period of not less than 24 consecutive hours after every 6 consecutive normal work days. Work performed on a scheduled rest day receives an additional 30% premium (130% total daily rate).',
    barTip:
      'Employer may schedule rest day but must respect the religious preference of the employee based on sacred worship days (Art. 91).',
    category: 'Rest & Holidays',
  },
  'q-art94': {
    id: 'q-art94',
    title: 'Regular Holiday Pay & Double Pay Principle',
    legalCitation: 'Labor Code, Article 94',
    shortRule: '100% wage if unworked; 200% double pay if worked on Regular Holiday.',
    fullPrinciple:
      'Every worker is paid regular daily wage during regular holidays even if unworked, provided the employee was present or on paid leave on the workday immediately preceding the holiday. If required to work, the employee receives 200% of regular wage.',
    barTip:
      'Successive regular holidays (e.g. Maundy Thursday & Good Friday): To receive pay for both, must be present or on leave on Wednesday.',
    category: 'Rest & Holidays',
  },
  'q-pd851': {
    id: 'q-pd851',
    title: 'Mandatory 13th Month Pay Mandate',
    legalCitation: 'Presidential Decree No. 851',
    shortRule: '1/12th of total basic salary earned, payable not later than Dec 24.',
    fullPrinciple:
      'All rank-and-file employees who have worked for at least 1 month during the calendar year are entitled to 13th month pay regardless of civil status or mode of wage payment. It is computed as Total Basic Salary earned within calendar year divided by 12.',
    barTip:
      'Basic salary excludes allowances, overtime, premium pay, night shift differential, and unused leaves, unless stipulated in CBA/contract.',
    category: 'Wages',
  },
  'q-art99': {
    id: 'q-art99',
    title: 'Regional Minimum Wage & Non-Diminution Rule',
    legalCitation: 'Labor Code, Article 99 & 100; R.A. 6727',
    shortRule: 'Wages prescribed by RTWPBs; existing benefits cannot be withdrawn.',
    fullPrinciple:
      'Regional Tripartite Wages and Productivity Boards (RTWPBs) determine minimum wage rates based on regional cost of living. Under the Non-Diminution of Benefits rule, benefits voluntarily and consistently given by employer cannot be unilaterally withdrawn.',
    barTip:
      'Facility vs Supplement: Facilities are deductible from wages if customarily furnished and accepted in writing; Supplements are extra perks given for employer convenience and not deductible.',
    category: 'Wages',
  },
  'q-do174': {
    id: 'q-do174',
    title: 'D.O. 174-17: Legitimate vs Labor-Only Contracting',
    legalCitation: 'DOLE Department Order No. 174, Series of 2017',
    shortRule: 'Requires >= P5M substantial capital & independent control of performance.',
    fullPrinciple:
      'Labor-only contracting is prohibited by law. Contracting is legitimate only if contractor has substantial capital (minimum P5,000,000 paid-up capital/net worth) OR investment in tools, equipment, machinery, and contractor exercises right of control over performance.',
    barTip:
      'If labor-only contracting exists, principal is deemed the direct employer of the contractor employees and jointly and severally liable.',
    category: 'Tenure',
  },
  'q-ra11210': {
    id: 'q-ra11210',
    title: '105-Day Expanded Maternity Leave Law',
    legalCitation: 'Republic Act No. 11210',
    shortRule: '105 days fully paid maternity leave regardless of civil status or delivery mode.',
    fullPrinciple:
      'Female workers in public and private sectors are entitled to 105 days paid maternity leave for live birth, with an optional 30 days unpaid extension. Solo mothers receive an additional 15 days paid leave (120 days total). 60 days paid leave for miscarriage or emergency termination.',
    barTip:
      'Female worker may allocate up to 7 days of maternity leave to the child father (over and above his 7-day Paternity Leave under R.A. 8187).',
    category: 'Leaves',
  },
  'q-art297': {
    id: 'q-art297',
    title: 'Security of Tenure: Twin-Notice Rule & Due Process',
    legalCitation: 'Labor Code, Articles 297-299; King of Kings Transport v. Mamac',
    shortRule: 'Two written notices and hearing required for valid just-cause dismissal.',
    fullPrinciple:
      'Dismissal requires substantive grounds (Just Causes: serious misconduct, willful disobedience, gross neglect, fraud, crimes; Authorized Causes: installation of labor-saving devices, redundancy, retrenchment, closure, disease) PLUS procedural due process: 1st notice of charges with >= 5 calendar days to explain, opportunity to be heard, and 2nd notice of decision.',
    barTip:
      'Agabon Doctrine: Dismissal for just cause without procedural due process is VALID, but employer must pay P30,000 nominal damages.',
    category: 'Tenure',
  },
  'q-sky-bonus': {
    id: 'q-sky-bonus',
    title: 'Sky Doctrine: Labor Standards Primacy',
    legalCitation: '1987 Constitution, Article XIII, Section 3',
    shortRule: 'The State shall afford full protection to labor and guarantee rights.',
    fullPrinciple:
      'The Constitution guarantees the rights of all workers to self-organization, collective bargaining and negotiations, peaceful concerted activities including the right to strike, security of tenure, humane conditions of work, and a living wage.',
    barTip: 'Constitutional Labor Rights override contrary contractual stipulations.',
    category: 'Tenure',
  },
  'q-art298': {
    id: 'q-art298',
    title: 'Authorized Causes & Separation Pay Formula',
    legalCitation: 'Labor Code, Article 298 [283]',
    shortRule: 'Installation of labor-saving devices, redundancy, retrenchment, and closure.',
    fullPrinciple:
      'Separation pay for Redundancy / Labor-Saving Devices is at least 1 month salary per year of service. Separation pay for Retrenchment / Closure not due to serious financial losses is at least 1/2 month salary per year of service. Written 30-day notice to DOLE and worker is mandatory.',
    barTip: 'A fraction of at least 6 months is considered one (1) whole year.',
    category: 'Tenure',
  },
  'q-art278': {
    id: 'q-art278',
    title: 'Valid Strike Requisites & Peaceful Concerted Activities',
    legalCitation: 'Labor Code, Article 278 [263]',
    shortRule: 'Valid grounds: Collective Bargaining Deadlock (CBD) or Unfair Labor Practice (ULP).',
    fullPrinciple:
      'Mandatory procedural requirements for strike: (1) Notice of strike filed with NCMB; (2) Cooling-off period (30 days for CBD, 15 days for ULP); (3) Strike vote by secret ballot obtaining majority; (4) 7-day strike ban (waiting period) before walkout.',
    barTip: 'Failure to comply with ANY of the 4 requisites renders the strike illegal.',
    category: 'Rest & Holidays',
  },
  'q-ra10361': {
    id: 'q-ra10361',
    title: 'Batas Kasambahay: Domestic Workers Rights',
    legalCitation: 'Republic Act No. 10361',
    shortRule: 'Statutory minimum wage, SSS/PhilHealth/Pag-IBIG, and 24-hr weekly rest.',
    fullPrinciple:
      'Domestic workers are entitled to written contracts in understood language, standard minimum wage set by RTWPB, mandatory social security coverage, 5 days paid SIL after 1 year, and humane treatment without physical/verbal abuse.',
    barTip: 'Employers cannot demand wage deductions or deposits for tools/equipment.',
    category: 'Wages',
  },
};

export interface LandmarkCaseScroll {
  id: string;
  caseTitle: string;
  grNumber: string;
  landmarkDoctrine: string;
  position: [number, number, number];
}

export const LANDMARK_CASE_SCROLLS: LandmarkCaseScroll[] = [
  {
    id: 'case-autobus',
    caseTitle: 'Auto Bus Transport Systems, Inc. v. Bautista',
    grNumber: 'G.R. No. 156367 (2005)',
    landmarkDoctrine:
      'The 3-year prescriptive period for claiming Service Incentive Leave (SIL) commences only from the time the employer refuses to pay upon demand or upon termination of employment, not on a year-to-year basis.',
    position: [-56, 1.8, 54],
  },
  {
    id: 'case-agabon',
    caseTitle: 'Agabon v. National Labor Relations Commission',
    grNumber: 'G.R. No. 158693 (2004)',
    landmarkDoctrine:
      'Dismissals for just cause where employer violated procedural due process remain legally VALID, but employer is liable for nominal damages of P30,000 for due process infringement.',
    position: [0, 8.8, -62],
  },
  {
    id: 'case-fuji',
    caseTitle: 'Fuji Television Network, Inc. v. Espiritu',
    grNumber: 'G.R. No. 204944 (2014)',
    landmarkDoctrine:
      'Application of the Four-Fold Test: The power of control over the means and methods of performance distinguishes an employee from an independent contractor, regardless of contract titles.',
    position: [56, 1.8, 48],
  },
  {
    id: 'case-brent',
    caseTitle: 'Brent School, Inc. v. Zamora',
    grNumber: 'G.R. No. 48494 (1990)',
    landmarkDoctrine:
      'Fixed-term employment contracts are valid only if entered into knowingly and voluntarily without moral dominance or economic duress by the employer.',
    position: [-74, 3.6, -24],
  },
  {
    id: 'case-serrano',
    caseTitle: 'Serrano v. Gallant Maritime Services, Inc.',
    grNumber: 'G.R. No. 167614 (2009)',
    landmarkDoctrine:
      'The clause limiting OFW illegal dismissal backwages to 3 months for every year of unexpired term violates equal protection and substantive due process; full unexpired term is compensable.',
    position: [74, 3.6, -24],
  },
];

interface Enemy3D {
  id: string;
  type: 'goomba' | 'koopa';
  mesh: THREE.Group;
  x: number;
  y: number;
  z: number;
  vx: number;
  vz: number;
  minBound: number;
  maxBound: number;
  axis: 'x' | 'z';
  alive: boolean;
  respawnTimer: number;
}

interface Springboard3D {
  mesh: THREE.Group;
  padMesh: THREE.Mesh;
  x: number;
  y: number;
  z: number;
  squashTime: number;
}

interface WarpPipePortal3D {
  id: string;
  name: string;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
}

export const Game3D: React.FC<Game3DProps> = ({ equippedAvatar = 'mario', onEarnCoins }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const initialAutoStart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [gameState, setGameState] = useState<'start' | 'playing' | 'victory'>(
    initialAutoStart ? 'playing' : 'start'
  );
  const gameStateRef = useRef<'start' | 'playing' | 'victory'>(
    initialAutoStart ? 'playing' : 'start'
  );
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentZoneName, setCurrentZoneName] = useState('Zone 1: Hours of Work Plaza');
  const [discoveredDoctrinesCount, setDiscoveredDoctrinesCount] = useState(0);
  const [discoveredScrollsCount, setDiscoveredScrollsCount] = useState(0);
  const [flagpoleMastered, setFlagpoleMastered] = useState(false);
  const [activeDoctrineModal, setActiveDoctrineModal] = useState<IslandLaborDoctrine | null>(null);
  const [activeCaseModal, setActiveCaseModal] = useState<LandmarkCaseScroll | null>(null);
  const [doctrineToast, setDoctrineToast] = useState<{
    title: string;
    cite: string;
    rule: string;
  } | null>(null);
  const [savedNoteKeys, setSavedNoteKeys] = useState<Record<string, boolean>>({});
  const [cameraMode, setCameraMode] = useState<'follow' | 'bird' | 'action'>('follow');
  const [isDashing, setIsDashing] = useState(false);
  const [playerRadarPos, setPlayerRadarPos] = useState({ x: 0, z: 44, rot: Math.PI });

  const onEarnCoinsRef = useRef(onEarnCoins);
  useEffect(() => {
    onEarnCoinsRef.current = onEarnCoins;
  }, [onEarnCoins]);

  useEffect(() => {
    gameStateRef.current = gameState;
    if (typeof document !== 'undefined') {
      document.body.dataset.state =
        gameState === 'start' ? 'title' : gameState === 'victory' ? 'gameover' : 'playing';
    }
  }, [gameState]);

  const heroMeta = getHeroMeta(equippedAvatar);
  const avatarRef = useRef(equippedAvatar);
  const shirtMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const bodyMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const resetRunRef = useRef<(() => void) | null>(null);
  const warpPlayerRef = useRef<((tx: number, tz: number) => void) | null>(null);

  useEffect(() => {
    avatarRef.current = equippedAvatar;
    const meta = getHeroMeta(equippedAvatar);
    if (shirtMatRef.current) shirtMatRef.current.color.setHex(meta.primaryHex);
    if (bodyMatRef.current) bodyMatRef.current.color.setHex(meta.secondaryHex);
  }, [equippedAvatar]);

  // Unified input state
  const keysRef = useRef<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    jumpHeld: boolean;
    jumpQueued: boolean;
    dash: boolean;
  }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jumpHeld: false,
    jumpQueued: false,
    dash: false,
  });

  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  const startGame = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    keysRef.current = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      jumpHeld: false,
      jumpQueued: false,
      dash: false,
    };
    if (resetRunRef.current) {
      resetRunRef.current();
    }
    setCoins(0);
    setScore(0);
    setLives(3);
    setFlagpoleMastered(false);
    setDiscoveredDoctrinesCount(0);
    setDiscoveredScrollsCount(0);
    setActiveDoctrineModal(null);
    setActiveCaseModal(null);
    setDoctrineToast(null);
    setGameState('playing');
    marioAudio.playPowerUp();
  };

  useEffect(() => {
    const clearKeys = () => {
      keysRef.current = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jumpHeld: false,
        jumpQueued: false,
        dash: false,
      };
      setIsDashing(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current === 'start' && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        startGame();
        return;
      }
      if (['ArrowUp', 'KeyW'].includes(e.code)) keysRef.current.forward = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keysRef.current.backward = true;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
      if (['ShiftLeft', 'ShiftRight', 'KeyZ'].includes(e.code)) {
        keysRef.current.dash = true;
        setIsDashing(true);
      }
      if (e.code === 'Space') {
        if (!keysRef.current.jumpHeld) {
          keysRef.current.jumpQueued = true;
        }
        keysRef.current.jumpHeld = true;
        e.preventDefault();
      }
      // Camera mode switch
      if (e.code === 'KeyC') {
        setCameraMode((prev) => (prev === 'follow' ? 'bird' : prev === 'bird' ? 'action' : 'follow'));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) keysRef.current.forward = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keysRef.current.backward = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
      if (['ShiftLeft', 'ShiftRight', 'KeyZ'].includes(e.code)) {
        keysRef.current.dash = false;
        setIsDashing(false);
      }
      if (e.code === 'Space') keysRef.current.jumpHeld = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', clearKeys);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', clearKeys);
    };
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 760;
    const height = container.clientHeight || 420;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8);
    scene.fog = new THREE.Fog(0x38bdf8, 70, 220);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 350);
    camera.position.set(0, 14, 30);
    camera.lookAt(0, 2, -6);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm Key + Cool Sky/Ground Hemisphere Fill
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x15803d, 1.05);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.55);
    dirLight.position.set(35, 48, 28);
    scene.add(dirLight);

    // Solid AABB Colliders Registry + Mesh map
    const colliders: AABB3D[] = [];
    const blockMeshes = new Map<string, { mesh: THREE.Mesh; baseY: number; doctrineId?: string }>();
    const scrollMeshesList: { mesh: THREE.Group; scrollData: LandmarkCaseScroll; collected: boolean }[] = [];
    const springboardsList: Springboard3D[] = [];
    const enemiesList: Enemy3D[] = [];
    let oceanWaterMesh: THREE.Mesh | null = null;
    let castleFlagMesh: THREE.Mesh | null = null;
    let flagpoleCollider: AABB3D | null = null;

    // 1. MASSIVELY EXPANDED ISLAND TERRAIN (240 x 200 units!) + Coastal Sand + Azure Ocean
    // Surrounding Ocean Water Plane
    const oceanGeo = new THREE.PlaneGeometry(420, 380, 24, 24);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.18,
      metalness: 0.15,
      transparent: true,
      opacity: 0.88,
    });
    oceanWaterMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanWaterMesh.rotation.x = -Math.PI / 2;
    oceanWaterMesh.position.y = -2.8;
    scene.add(oceanWaterMesh);

    // Golden Beach Sand Perimeter Ring
    const sandGeo = new THREE.BoxGeometry(252, 2.2, 212);
    const sandMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.88 });
    const sandCoast = new THREE.Mesh(sandGeo, sandMat);
    sandCoast.position.y = -1.8;
    scene.add(sandCoast);

    // Primary Lush Grass Island Ground (240 x 200)
    const groundGeo = new THREE.BoxGeometry(240, 2, 200);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.78 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1;
    scene.add(ground);

    // Primary island floor AABB
    colliders.push(createBoxCollider('island-floor', 0, 0, -2, 0, 120, 100, 'ground'));

    // Soil Cliff Base
    const soilGeo = new THREE.BoxGeometry(238, 14, 198);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.92 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = -9.0;
    scene.add(soil);

    // 2. Zone Plaza Pathways (Walkways connecting the 5 Labor Law Districts)
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.75 });
    const stonePavingMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.68 });

    // Central Grand Avenue (Z: -76 to 84)
    const mainAvenue = new THREE.Mesh(new THREE.BoxGeometry(10, 0.05, 160), pathMat);
    mainAvenue.position.set(0, 0.025, 4);
    scene.add(mainAvenue);

    // East Cross-Avenue (to Rest Day & Holidays Citadel)
    const eastAvenue = new THREE.Mesh(new THREE.BoxGeometry(104, 0.05, 8), pathMat);
    eastAvenue.position.set(56, 0.025, 6);
    scene.add(eastAvenue);

    // West Cross-Avenue (to Wages & Subcontracting Valley)
    const westAvenue = new THREE.Mesh(new THREE.BoxGeometry(104, 0.05, 8), pathMat);
    westAvenue.position.set(-56, 0.025, 6);
    scene.add(westAvenue);

    // North Judicial Plaza in front of Supreme Citadel
    const northPlaza = new THREE.Mesh(new THREE.BoxGeometry(64, 0.05, 34), stonePavingMat);
    northPlaza.position.set(0, 0.025, -52);
    scene.add(northPlaza);

    // South Hours Marina Boardwalk Promenade
    const southBoardwalk = new THREE.Mesh(new THREE.BoxGeometry(160, 0.05, 20), stonePavingMat);
    southBoardwalk.position.set(0, 0.025, 74);
    scene.add(southBoardwalk);

    // 3. Perimeter Protective Fences (Bounds 240 x 200)
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const fenceRailMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.65 });
    const addPerimeterFence = (id: string, x: number, z: number, w: number, d: number) => {
      const fenceGroup = new THREE.Group();
      const baseWall = new THREE.Mesh(new THREE.BoxGeometry(w, 1.8, d), fenceMat);
      baseWall.position.y = 0.9;
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.35, d + 0.1), fenceRailMat);
      topRail.position.y = 1.95;
      fenceGroup.add(baseWall, topRail);
      fenceGroup.position.set(x, 0, z);
      scene.add(fenceGroup);

      colliders.push(createBoxCollider(id, x, z, 0, 3.2, w / 2, d / 2, 'fence'));
    };
    addPerimeterFence('fence-south', 0, 98.5, 240, 1.4);
    addPerimeterFence('fence-north', 0, -98.5, 240, 1.4);
    addPerimeterFence('fence-east', 118.5, 0, 1.4, 200);
    addPerimeterFence('fence-west', -118.5, 0, 1.4, 200);

    // 4. Scenic Gazebos and Pine Trees on the 4 Corners
    const gazeboMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
    const pineMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });

    const createTree = (tx: number, tz: number, scale = 1) => {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 2.5 * scale, 8), trunkMat);
      trunk.position.y = (2.5 * scale) / 2;
      const f1 = new THREE.Mesh(new THREE.ConeGeometry(2.2 * scale, 2.8 * scale, 8), pineMat);
      f1.position.y = 2.4 * scale;
      const f2 = new THREE.Mesh(new THREE.ConeGeometry(1.6 * scale, 2.4 * scale, 8), pineMat);
      f2.position.y = 3.8 * scale;
      g.add(trunk, f1, f2);
      g.position.set(tx, 0, tz);
      scene.add(g);
    };

    [
      [-88, 70], [-70, 80], [70, 80], [88, 70],
      [-95, -70], [-75, -82], [75, -82], [95, -70],
      [-25, 28], [25, 28], [-35, -28], [35, -28],
    ].forEach(([tx, tz]) => createTree(tx, tz, 1.15));

    // 5. ZONE 5: Supreme Court Labor Citadel / Mushroom Castle at (0, 0, -72)
    const castleGroup = new THREE.Group();
    const castleStoneMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.72 });
    const castleTrimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
    const castleRoofMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.38 });
    const castleDoorMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.82 });
    const castleGoldMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.35, roughness: 0.25 });

    // Main Keep
    const mainKeep = new THREE.Mesh(new THREE.BoxGeometry(18, 10.5, 9.5), castleStoneMat);
    mainKeep.position.y = 5.25;
    castleGroup.add(mainKeep);

    // Central High Tower
    const centerTower = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 8.5, 16), castleTrimMat);
    centerTower.position.set(0, 13.5, 0);
    const centerSpire = new THREE.Mesh(new THREE.ConeGeometry(4.4, 5.8, 16), castleRoofMat);
    centerSpire.position.set(0, 20.4, 0);
    castleGroup.add(centerTower, centerSpire);

    // Flanking Twin Due-Process Turrets
    [-10.2, 10.2].forEach((tx) => {
      const turret = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.0, 12.5, 14), castleStoneMat);
      turret.position.set(tx, 6.25, 0.5);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(3.6, 4.4, 14), castleRoofMat);
      roof.position.set(tx, 14.5, 0.5);
      castleGroup.add(turret, roof);
    });

    // Castle Grand Arch Doorway + Supreme Star Emblem
    const doorArch = new THREE.Mesh(new THREE.BoxGeometry(4.4, 5.5, 0.5), castleDoorMat);
    doorArch.position.set(0, 2.75, 4.9);
    const emblem = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.35, 14), castleGoldMat);
    emblem.rotation.x = Math.PI / 2;
    emblem.position.set(0, 8.2, 4.95);
    castleGroup.add(doorArch, emblem);

    castleGroup.position.set(0, 0, -72);
    scene.add(castleGroup);

    colliders.push(createBoxCollider('castle-main', 0, -72, 0, 18.0, 13.5, 7.5, 'castle'));

    // 6. Interactive Supreme Court Flagpole at (0, 0, -52)
    const flagpoleGroup = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 });
    const poleSphereMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.5, roughness: 0.2 });
    const flagMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });

    const poleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 18, 16), poleMat);
    poleMesh.position.y = 9;
    const topSphere = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), poleSphereMat);
    topSphere.position.y = 18;

    castleFlagMesh = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 0.12), flagMat);
    castleFlagMesh.position.set(1.7, 16.5, 0);

    flagpoleGroup.add(poleMesh, topSphere, castleFlagMesh);
    flagpoleGroup.position.set(0, 0, -52);
    scene.add(flagpoleGroup);

    flagpoleCollider = createBoxCollider('flagpole-goal', 0, -52, 0, 18, 1.2, 1.2, 'flagpole');
    colliders.push(flagpoleCollider);

    // 7. Interactive Springboards / Bounce Pads (4 Locations)
    const springMetalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3 });
    const springPadMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });

    const createSpringboard = (id: string, sx: number, sz: number) => {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.3, 16), springMetalMat);
      base.position.y = 0.15;
      const coil = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.8, 12), springMetalMat);
      coil.position.y = 0.55;
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.35, 16), springPadMat);
      pad.position.y = 1.05;
      g.add(base, coil, pad);
      g.position.set(sx, 0, sz);
      scene.add(g);

      colliders.push(createBoxCollider(id, sx, sz, 0, 1.2, 1.7, 1.7, 'springboard'));
      springboardsList.push({ mesh: g, padMesh: pad, x: sx, y: 0, z: sz, squashTime: 0 });
    };

    createSpringboard('spring-marina', -10, 48);
    createSpringboard('spring-wages', -52, 6);
    createSpringboard('spring-rest', 52, 6);
    createSpringboard('spring-garden', 0, -22);

    // 8. Sky Cloud Platforms with Star Coins (High altitude: Y = 13)
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9, transparent: true, opacity: 0.95 });
    const createCloudPlatform = (id: string, cx: number, cy: number, cz: number, w = 9, d = 6) => {
      const g = new THREE.Group();
      const main = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, d), cloudMat);
      main.position.y = 0.6;
      // Add puffy spheres
      [-w / 3, 0, w / 3].forEach((ox) => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(1.5, 12, 12), cloudMat);
        puff.position.set(ox, 0.8, 0);
        g.add(puff);
      });
      g.add(main);
      g.position.set(cx, cy, cz);
      scene.add(g);

      colliders.push(createBoxCollider(id, cx, cz, cy, cy + 1.2, w / 2, d / 2, 'cloud'));
    };

    createCloudPlatform('cloud-south', 0, 13, 36, 12, 7);
    createCloudPlatform('cloud-west', -48, 13.5, 6, 10, 6);
    createCloudPlatform('cloud-east', 48, 13.5, 6, 10, 6);
    createCloudPlatform('cloud-north', 0, 14, -28, 12, 7);

    // 9. Procedural Warp Pipes with Solid Colliders
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.32 });
    const pipeLipMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.28 });
    const pipeHoleMat = new THREE.MeshStandardMaterial({ color: 0x052e16, roughness: 0.9 });
    const warpPortals: WarpPipePortal3D[] = [
      { id: 'pipe-marina', name: 'Marina Portal', x: -16, z: 28, targetX: 42, targetZ: 14 },
      { id: 'pipe-wages', name: 'Wages Valley Portal', x: -42, z: 14, targetX: -16, targetZ: 28 },
      { id: 'pipe-holidays', name: 'Holidays Citadel Portal', x: 42, z: 14, targetX: 0, targetZ: -42 },
      { id: 'pipe-garden', name: 'Protective Garden Portal', x: 0, z: -18, targetX: -42, targetZ: 14 },
      { id: 'pipe-citadel', name: 'Citadel Portal', x: 0, z: -42, targetX: 0, targetZ: 50 },
    ];

    warpPortals.forEach((p) => {
      const g = new THREE.Group();
      const pHeight = 3.6;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, pHeight, 18), pipeMat);
      col.position.y = pHeight / 2;
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 0.9, 18), pipeLipMat);
      rim.position.y = pHeight;
      const bore = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.12, 16), pipeHoleMat);
      bore.position.y = pHeight + 0.45;
      g.add(col, rim, bore);
      g.position.set(p.x, 0, p.z);
      scene.add(g);

      colliders.push(createBoxCollider(p.id, p.x, p.z, 0, pHeight + 0.45, 1.95, 1.95, 'pipe'));
    });

    // 10. Stepping Stone Terraces & Elevated Observation Bridges
    const stepMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 });
    const stepTopMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.45 });
    const createPlatform = (id: string, sx: number, sz: number, height: number, w = 4.2, d = 4.2) => {
      const grp = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(w, height, d), stepMat);
      base.position.y = height / 2;
      const cap = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, 0.3, d + 0.2), stepTopMat);
      cap.position.y = height + 0.15;
      grp.add(base, cap);
      grp.position.set(sx, 0, sz);
      scene.add(grp);

      colliders.push(createBoxCollider(id, sx, sz, 0, height + 0.3, w / 2, d / 2, 'platform'));
    };

    createPlatform('plat-plaza-mid', 0, 20, 2.2, 5.0, 5.0);
    createPlatform('plat-wages-step1', -28, 8, 2.4, 4.4, 4.4);
    createPlatform('plat-wages-step2', -36, -6, 3.8, 4.6, 4.6);
    createPlatform('plat-holidays-step1', 28, 8, 2.4, 4.4, 4.4);
    createPlatform('plat-holidays-step2', 36, -6, 3.8, 4.6, 4.6);
    createPlatform('plat-garden-center', 0, -8, 2.8, 5.5, 5.5);
    createPlatform('plat-castle-gateway', 0, -28, 2.2, 7.0, 4.0);

    // 11. Interactive 3D Question Blocks with Labor Law Doctrines
    const qMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.32, emissive: 0x78350f, emissiveIntensity: 0.18 });
    const brickMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.72 });

    const createDoctrineQuestionBlock = (
      id: string,
      doctrineKey: keyof typeof ISLAND_LABOR_DOCTRINES,
      bx: number,
      by: number,
      bz: number
    ) => {
      [-1, 0, 1].forEach((offset) => {
        const isQ = offset === 0;
        const block = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.2, 2.2), isQ ? qMat.clone() : brickMat);
        const posX = bx + offset * 2.4;
        block.position.set(posX, by, bz);
        scene.add(block);

        const blockId = isQ ? id : `${id}-brick-${offset}`;
        colliders.push(
          createBoxCollider(
            blockId,
            posX,
            bz,
            by - 1.1,
            by + 1.1,
            1.15,
            1.15,
            isQ ? 'question_block' : 'block',
            isQ
          )
        );
        blockMeshes.set(blockId, { mesh: block, baseY: by, doctrineId: isQ ? doctrineKey : undefined });
      });
    };

    createDoctrineQuestionBlock('q-art83', 'q-art83', 0, 4.8, 44);
    createDoctrineQuestionBlock('q-art85', 'q-art85', -24, 5.0, 56);
    createDoctrineQuestionBlock('q-art87', 'q-art87', 24, 5.0, 56);
    createDoctrineQuestionBlock('q-art99', 'q-art99', -56, 5.4, 20);
    createDoctrineQuestionBlock('q-do174', 'q-do174', -68, 5.6, -8);
    createDoctrineQuestionBlock('q-art93', 'q-art93', 56, 5.4, 20);
    createDoctrineQuestionBlock('q-art94', 'q-art94', 68, 5.6, -8);
    createDoctrineQuestionBlock('q-pd851', 'q-pd851', 48, 5.2, -30);
    createDoctrineQuestionBlock('q-ra11210', 'q-ra11210', -30, 5.2, -22);
    createDoctrineQuestionBlock('q-art297', 'q-art297', 0, 5.8, -42);
    createDoctrineQuestionBlock('q-art298', 'q-art298', -18, 5.2, -34);
    createDoctrineQuestionBlock('q-art278', 'q-art278', 18, 5.2, -34);
    createDoctrineQuestionBlock('q-ra10361', 'q-ra10361', -46, 5.0, 38);
    // Sky Doctrine block
    createDoctrineQuestionBlock('q-sky-bonus', 'q-sky-bonus', 0, 16.5, 36);

    // 12. Landmark Case Scrolls with Spinning Golden Stars
    const scrollCylinderMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.45 });
    const scrollRibbonMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const scrollCapMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.6 });

    LANDMARK_CASE_SCROLLS.forEach((caseItem) => {
      const scrollGroup = new THREE.Group();
      const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.6, 16), scrollCylinderMat);
      roll.rotation.z = Math.PI / 4;
      const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.35, 16), scrollRibbonMat);
      ribbon.rotation.z = Math.PI / 4;
      const dowelL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.9, 12), scrollCapMat);
      dowelL.rotation.z = Math.PI / 4;

      const starGeo = new THREE.OctahedronGeometry(0.5, 0);
      const starMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.45 });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.y = 1.1;

      scrollGroup.add(roll, ribbon, dowelL, star);
      scrollGroup.position.set(...caseItem.position);
      scene.add(scrollGroup);

      scrollMeshesList.push({
        mesh: scrollGroup,
        scrollData: caseItem,
        collected: false,
      });
    });

    // 13. Patrolling 3D Enemies (3 Goombas, 3 Koopas) with Stomp Physics!
    const goombaCapMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
    const goombaStemMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.5 });
    const koopaShellMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 });
    const koopaBodyMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5 });

    const create3DEnemy = (
      id: string,
      type: 'goomba' | 'koopa',
      startX: number,
      startZ: number,
      minB: number,
      maxB: number,
      axis: 'x' | 'z',
      speed: number
    ) => {
      const g = new THREE.Group();
      if (type === 'goomba') {
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.6, 0.7, 12), goombaStemMat);
        stem.position.y = 0.35;
        const cap = new THREE.Mesh(new THREE.ConeGeometry(1.05, 0.9, 14), goombaCapMat);
        cap.position.y = 1.05;
        const footL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.5), goombaCapMat);
        footL.position.set(-0.35, 0.1, 0);
        const footR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.5), goombaCapMat);
        footR.position.set(0.35, 0.1, 0);
        g.add(stem, cap, footL, footR);
      } else {
        const shell = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 12), koopaShellMat);
        shell.position.y = 0.85;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10), koopaBodyMat);
        head.position.set(0, 1.25, 0.5);
        const feet = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.6), koopaBodyMat);
        feet.position.set(0, 0.12, 0);
        g.add(shell, head, feet);
      }
      g.position.set(startX, 0, startZ);
      scene.add(g);

      enemiesList.push({
        id,
        type,
        mesh: g,
        x: startX,
        y: 0,
        z: startZ,
        vx: axis === 'x' ? speed : 0,
        vz: axis === 'z' ? speed : 0,
        minBound: minB,
        maxBound: maxB,
        axis,
        alive: true,
        respawnTimer: 0,
      });
    };

    // Spawn 6 Patrolling Enemies across zones
    create3DEnemy('goomba-marina', 'goomba', -18, 62, -35, 35, 'x', 0.12);
    create3DEnemy('koopa-marina', 'koopa', 20, 62, -35, 35, 'x', -0.14);
    create3DEnemy('goomba-wages', 'goomba', -60, 20, -10, 35, 'z', 0.13);
    create3DEnemy('koopa-holidays', 'koopa', 60, -15, -30, 20, 'z', -0.13);
    create3DEnemy('goomba-garden', 'goomba', -14, -12, -26, 26, 'x', 0.11);
    create3DEnemy('koopa-citadel', 'koopa', 0, -46, -22, 22, 'x', -0.15);

    // 14. 8-Part 3D Hero Character + Shadow Disc
    const playerGroup = new THREE.Group();
    const initialHero = getHeroMeta(avatarRef.current);

    const bodyMat = new THREE.MeshStandardMaterial({ color: initialHero.secondaryHex, roughness: 0.55 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: initialHero.primaryHex, roughness: 0.35 });
    bodyMatRef.current = bodyMat;
    shirtMatRef.current = shirtMat;

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.5, 0.95), bodyMat);
    body.position.y = 1.25;
    playerGroup.add(body);

    const sleeves = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.65, 0.85), shirtMat);
    sleeves.position.y = 1.55;
    playerGroup.add(sleeves);

    const faceMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.6 });
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.98, 0.98), faceMat);
    head.position.y = 2.52;
    playerGroup.add(head);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.48, 1.32), shirtMat);
    cap.position.set(0, 3.12, 0.08);
    playerGroup.add(cap);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.18, 0.55), shirtMat);
    visor.position.set(0, 2.92, 0.82);
    playerGroup.add(visor);

    const stacheMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.8 });
    const stache = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.22, 0.28), stacheMat);
    stache.position.set(0, 2.3, 0.52);
    playerGroup.add(stache);

    const shoeMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 0.88), shoeMat);
    leftShoe.position.set(-0.38, 0.24, 0.08);
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.48, 0.88), shoeMat);
    rightShoe.position.set(0.38, 0.24, 0.08);
    playerGroup.add(leftShoe, rightShoe);

    playerGroup.position.set(0, 0, 52);
    playerGroup.rotation.y = Math.PI;
    scene.add(playerGroup);

    // Contact Shadow Disc
    const shadowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(1.1, 20),
      new THREE.MeshBasicMaterial({
        color: 0x0f172a,
        transparent: true,
        opacity: 0.38,
        depthWrite: false,
      })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.set(0, 0.03, 52);
    scene.add(shadowDisc);

    // 15. Collectible Coins (64 Coins Across Entire 240x200 Island!)
    const coinGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.22, 16);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.24,
      metalness: 0.3,
      roughness: 0.25,
    });
    const coinsList: { mesh: THREE.Mesh; collected: boolean; origY: number; isStarCoin?: boolean }[] = [];

    const coinPositions: [number, number, number, boolean?][] = [
      // Zone 1: Hours Plaza & Marina (South)
      [0, 6.6, 44], [-2.4, 6.6, 44], [2.4, 6.6, 44],
      [-24, 6.8, 56], [24, 6.8, 56],
      [-32, 5.0, 50], [32, 5.0, 50],
      [0, 3.8, 38], [-14, 1.8, 74], [14, 1.8, 74],
      [-40, 1.8, 74], [40, 1.8, 74], [-70, 1.8, 74], [70, 1.8, 74],
      // Zone 2: Wages Valley (West)
      [-56, 7.2, 20], [-68, 7.4, -8],
      [-60, 5.6, 8], [-60, 5.3, -24],
      [-48, 4.0, 8], [-54, 5.2, -6],
      [-38, 1.8, 4], [-72, 1.8, 14], [-84, 1.8, -12], [-92, 1.8, 0],
      // Zone 3: Rest & Holidays Citadel (East)
      [56, 7.2, 20], [68, 7.4, -8], [48, 7.0, -30],
      [60, 5.6, 8], [60, 5.3, -24],
      [48, 4.0, 8], [54, 5.2, -6],
      [38, 1.8, 4], [72, 1.8, 14], [84, 1.8, -12], [92, 1.8, 0],
      // Zone 4: Protective Garden (Central)
      [-30, 7.0, -22], [0, 4.5, -14], [0, 1.8, 4],
      [-16, 1.8, -10], [16, 1.8, -10],
      // Zone 5: Security of Tenure & Supreme Citadel (North)
      [0, 7.6, -42], [-22, 6.4, -50], [22, 6.4, -50],
      [0, 4.0, -38], [-12, 1.8, -58], [12, 1.8, -58],
      [-34, 1.8, -66], [34, 1.8, -66], [0, 12.0, -60],
      // Sky Cloud Star Coins (Worth 5 Coins Each!)
      [0, 15.0, 36, true], [-3, 15.0, 36, true], [3, 15.0, 36, true],
      [-48, 15.5, 6, true], [-51, 15.5, 6, true], [-45, 15.5, 6, true],
      [48, 15.5, 6, true], [51, 15.5, 6, true], [45, 15.5, 6, true],
      [0, 16.0, -28, true], [-3, 16.0, -28, true], [3, 16.0, -28, true],
    ];

    coinPositions.forEach(([cx, cy, cz, isStar]) => {
      const coin = new THREE.Mesh(coinGeo, coinMat);
      if (isStar) {
        coin.scale.set(1.4, 1.4, 1.4);
      }
      coin.position.set(cx, cy, cz);
      coin.rotation.x = Math.PI / 2;
      scene.add(coin);
      coinsList.push({ mesh: coin, collected: false, origY: cy, isStarCoin: Boolean(isStar) });
    });

    const worldBounds: WorldBounds3D = {
      minX: -116,
      maxX: 116,
      minY: 0,
      maxY: 45,
      minZ: -96,
      maxZ: 96,
    };

    const pState = {
      x: 0,
      y: 0,
      z: 52,
      vx: 0,
      vy: 0,
      vz: 0,
      halfWidth: 0.68,
      height: 3.3,
      halfDepth: 0.68,
      normalSpeed: 0.34,
      dashSpeed: 0.56,
      jumpImpulse: 0.54,
      grounded: true,
      rotY: Math.PI,
      coyoteFrames: 0,
      invulnTimer: 0,
    };

    let localCoins = 0;
    let localScore = 0;
    let localDoctrines = 0;
    let localScrolls = 0;
    let localLives = 3;
    let orbitAngle = 0.35;
    let gaitDist = 0;
    let jumpCutApplied3D = false;
    let slidingOnFlagpole = false;
    let flagSlideProgress = 0;

    warpPlayerRef.current = (tx: number, tz: number) => {
      pState.x = tx;
      pState.z = tz;
      pState.y = 0.5;
      pState.vx = 0;
      pState.vz = 0;
      marioAudio.playPipe();
    };

    resetRunRef.current = () => {
      pState.x = 0;
      pState.y = 0;
      pState.z = 52;
      pState.vx = 0;
      pState.vy = 0;
      pState.vz = 0;
      pState.grounded = true;
      pState.rotY = Math.PI;
      pState.coyoteFrames = 0;
      pState.invulnTimer = 0;
      jumpCutApplied3D = false;
      slidingOnFlagpole = false;
      flagSlideProgress = 0;
      localCoins = 0;
      localScore = 0;
      localDoctrines = 0;
      localScrolls = 0;
      localLives = 3;
      setLives(3);

      if (castleFlagMesh) castleFlagMesh.position.y = 16.5;

      colliders.forEach((c) => {
        if (c.isQuestionBlock) {
          c.hit = false;
          const entry = blockMeshes.get(c.id);
          if (entry) {
            entry.mesh.position.y = entry.baseY;
            (entry.mesh.material as THREE.MeshStandardMaterial).color.setHex(0xf59e0b);
          }
        }
      });

      coinsList.forEach((c) => {
        if (c.collected) {
          c.collected = false;
          scene.add(c.mesh);
        }
      });

      scrollMeshesList.forEach((s) => {
        if (s.collected) {
          s.collected = false;
          scene.add(s.mesh);
        }
      });

      enemiesList.forEach((e) => {
        e.alive = true;
        e.mesh.scale.set(1, 1, 1);
        if (!scene.children.includes(e.mesh)) scene.add(e.mesh);
      });
    };

    // Camera Orbit Mouse / Touch Drag Support
    let isDragging = false;
    let lastPointerX = 0;

    const onPointerDownCanvas = (e: PointerEvent) => {
      isDragging = true;
      lastPointerX = e.clientX;
    };
    const onPointerMoveCanvas = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPointerX;
      lastPointerX = e.clientX;
      orbitAngle -= dx * 0.007;
    };
    const onPointerUpCanvas = () => {
      isDragging = false;
    };

    const domCanvas = renderer.domElement;
    domCanvas.addEventListener('pointerdown', onPointerDownCanvas);
    window.addEventListener('pointermove', onPointerMoveCanvas);
    window.addEventListener('pointerup', onPointerUpCanvas);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(300, Math.floor(entry.contentRect.width));
        const h = Math.max(260, Math.floor(entry.contentRect.height));
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    let frameId = 0;
    let paceTimer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;
    const gl = renderer.getContext();
    const fencePixel = new Uint8Array(4);

    const scheduleNextFrame = () => {
      if (disposed) return;
      if (!isSoftwareGl) {
        frameId = requestAnimationFrame(tick);
        return;
      }
      paceTimer = setTimeout(() => {
        paceTimer = null;
        if (disposed) return;
        try {
          gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, fencePixel);
        } catch {
          // ignore context loss
        }
        if (!disposed) {
          frameId = requestAnimationFrame(tick);
        }
      }, 16);
    };

    let lastTime = performance.now();

    const tick = (now: number) => {
      if (disposed) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const stepScale = Math.max(0.6, Math.min(1.6, dt * 60));

      const animTime = now * 0.003;

      // Animate ocean waves
      if (oceanWaterMesh) {
        oceanWaterMesh.position.y = -2.8 + Math.sin(animTime * 1.2) * 0.18;
      }

      // Animate coins
      coinsList.forEach((c) => {
        if (c.collected) return;
        c.mesh.rotation.z += (c.isStarCoin ? 0.065 : 0.045) * stepScale;
        c.mesh.position.y = c.origY + Math.sin(animTime * 1.5 + c.mesh.position.x) * 0.18;
      });

      // Animate Landmark Case Scrolls
      scrollMeshesList.forEach((s) => {
        if (s.collected) return;
        s.mesh.rotation.y += 0.035 * stepScale;
        s.mesh.position.y = s.scrollData.position[1] + Math.sin(animTime * 1.5 + s.mesh.position.x) * 0.22;
      });

      // Animate Springboards
      springboardsList.forEach((sb) => {
        if (sb.squashTime > 0) {
          sb.squashTime -= dt;
          sb.padMesh.position.y = 0.45;
        } else {
          sb.padMesh.position.y = 1.05;
        }
      });

      // Update Enemies & Stomp Logic
      enemiesList.forEach((enemy) => {
        if (!enemy.alive) {
          enemy.respawnTimer -= dt;
          if (enemy.respawnTimer <= 0) {
            enemy.alive = true;
            enemy.mesh.scale.set(1, 1, 1);
          }
          return;
        }

        // Move enemy along patrol axis
        if (enemy.axis === 'x') {
          enemy.x += enemy.vx * stepScale;
          if (enemy.x > enemy.maxBound || enemy.x < enemy.minBound) {
            enemy.vx *= -1;
            enemy.mesh.rotation.y = enemy.vx > 0 ? 0 : Math.PI;
          }
        } else {
          enemy.z += enemy.vz * stepScale;
          if (enemy.z > enemy.maxBound || enemy.z < enemy.minBound) {
            enemy.vz *= -1;
            enemy.mesh.rotation.y = enemy.vz > 0 ? Math.PI / 2 : -Math.PI / 2;
          }
        }
        enemy.mesh.position.set(enemy.x, 0, enemy.z);

        // Player vs Enemy Collision
        const dx = pState.x - enemy.x;
        const dz = pState.z - enemy.z;
        const horizDist = Math.hypot(dx, dz);

        if (horizDist < 1.35) {
          if (pState.vy < -0.05 && pState.y >= 0.7) {
            // STOMP SUCCESS!
            enemy.alive = false;
            enemy.respawnTimer = 18; // Respawns after 18 seconds
            enemy.mesh.scale.set(1.4, 0.2, 1.4);
            pState.vy = 0.52; // Bounce Mario up!
            marioAudio.playStomp();
            localCoins += 2;
            localScore += 350;
            setCoins(localCoins);
            setScore(localScore);
            onEarnCoinsRef.current(2);
          } else if (pState.invulnTimer <= 0 && !slidingOnFlagpole) {
            // Mario gets hurt!
            pState.invulnTimer = 2.0;
            localLives -= 1;
            setLives(localLives);
            marioAudio.playBowserHit();
            // Knockback
            pState.vx = (dx / (horizDist || 1)) * 0.4;
            pState.vz = (dz / (horizDist || 1)) * 0.4;
            pState.vy = 0.3;

            if (localLives <= 0) {
              // Reset to Marina plaza start
              pState.x = 0;
              pState.y = 1;
              pState.z = 52;
              pState.vx = 0;
              pState.vz = 0;
              localLives = 3;
              setLives(3);
            }
          }
        }
      });

      if (pState.invulnTimer > 0) {
        pState.invulnTimer -= dt;
        playerGroup.visible = Math.floor(now / 80) % 2 === 0;
      } else {
        playerGroup.visible = true;
      }

      if (gameStateRef.current === 'start') {
        orbitAngle += 0.007 * stepScale;
        camera.position.set(Math.sin(orbitAngle) * 44, 22.0, Math.cos(orbitAngle) * 44);
        camera.lookAt(0, 4.0, 0);
        renderer.render(scene, camera);
        scheduleNextFrame();
        return;
      }

      if (gameStateRef.current === 'victory') {
        orbitAngle += 0.012 * stepScale;
        camera.position.set(
          pState.x + Math.sin(orbitAngle) * 18,
          pState.y + 11,
          pState.z + Math.cos(orbitAngle) * 18
        );
        camera.lookAt(pState.x, pState.y + 2.0, pState.z);
        renderer.render(scene, camera);
        scheduleNextFrame();
        return;
      }

      // Ocean water dynamic wave ripple and castle flag flutter
      if (oceanWaterMesh) {
        oceanWaterMesh.position.y = -2.8 + Math.sin(now * 1.5) * 0.16;
      }
      if (castleFlagMesh) {
        castleFlagMesh.rotation.y = Math.sin(now * 3.2) * 0.28;
      }

      // Flagpole slide animation handling
      if (slidingOnFlagpole) {
        flagSlideProgress = Math.min(1, flagSlideProgress + dt * 0.8);
        pState.y = Math.max(0, 16 * (1 - flagSlideProgress));
        if (castleFlagMesh) {
          castleFlagMesh.position.y = 16.5 - flagSlideProgress * 13.5;
        }
        if (flagSlideProgress >= 1) {
          slidingOnFlagpole = false;
          setFlagpoleMastered(true);
        }
        playerGroup.position.set(0, pState.y, -52);
        renderer.render(scene, camera);
        scheduleNextFrame();
        return;
      }

      // Movement inputs
      let moveX = 0;
      let moveZ = 0;
      if (keysRef.current.forward) moveZ -= 1;
      if (keysRef.current.backward) moveZ += 1;
      if (keysRef.current.left) moveX -= 1;
      if (keysRef.current.right) moveX += 1;

      if (pState.grounded) {
        pState.coyoteFrames = 8;
        jumpCutApplied3D = false;
      } else if (pState.coyoteFrames > 0) {
        pState.coyoteFrames -= 1;
      }

      if (keysRef.current.jumpQueued && (pState.grounded || pState.coyoteFrames > 0)) {
        pState.vy = pState.jumpImpulse;
        pState.grounded = false;
        pState.coyoteFrames = 0;
        jumpCutApplied3D = false;
        keysRef.current.jumpQueued = false;
        marioAudio.playJump();
      } else {
        keysRef.current.jumpQueued = false;
      }

      const currentMaxSpeed = keysRef.current.dash ? pState.dashSpeed : pState.normalSpeed;

      const mom = stepIsland3DMomentum({
        vx: pState.vx,
        vz: pState.vz,
        vy: pState.vy,
        rotY: pState.rotY,
        moveX,
        moveZ,
        maxSpeed: currentMaxSpeed,
        grounded: pState.grounded,
        jumpHeld: keysRef.current.jumpHeld,
        jumpCutApplied: jumpCutApplied3D,
        stepScale,
      });
      pState.vx = mom.vx;
      pState.vz = mom.vz;
      pState.vy = mom.vy;
      pState.rotY = mom.rotY;
      jumpCutApplied3D = mom.jumpCutApplied;

      const resolved = resolveCharacterStep3D(pState, colliders, worldBounds, 0.022 * stepScale);
      pState.x = resolved.x;
      pState.y = resolved.y;
      pState.z = resolved.z;
      pState.vx = resolved.vx;
      pState.vy = resolved.vy;
      pState.vz = resolved.vz;
      pState.grounded = resolved.grounded;

      // Update mini-map radar
      setPlayerRadarPos({ x: pState.x, z: pState.z, rot: pState.rotY });

      // Springboard bounce detection!
      springboardsList.forEach((sb) => {
        if (Math.hypot(pState.x - sb.x, pState.z - sb.z) < 1.9 && pState.y <= 1.4 && pState.vy <= 0.1) {
          pState.vy = 1.05; // MEGA HIGH SPRING BOUNCE!
          pState.grounded = false;
          sb.squashTime = 0.25;
          marioAudio.playPowerUp();
          localScore += 150;
          setScore(localScore);
        }
      });

      // Flagpole grab detection!
      if (!flagpoleMastered && !slidingOnFlagpole) {
        if (Math.hypot(pState.x, pState.z - (-52)) < 1.6 && pState.y > 2) {
          slidingOnFlagpole = true;
          flagSlideProgress = 0;
          pState.vx = 0;
          pState.vz = 0;
          localScore += 2500;
          localCoins += 20;
          setScore(localScore);
          setCoins(localCoins);
          onEarnCoinsRef.current(20);
          marioAudio.playFlagpole();
        }
      }

      // Update current zone name based on coordinates across 240x200 island
      if (pState.z < -44) {
        setCurrentZoneName('Zone 5: Security of Tenure & Supreme Citadel');
      } else if (pState.x < -30) {
        setCurrentZoneName('Zone 2: Wages & Subcontracting Valley');
      } else if (pState.x > 30) {
        setCurrentZoneName('Zone 3: Rest Day & Holiday Citadel');
      } else if (pState.z < 16) {
        setCurrentZoneName('Zone 4: Protective Laws & Leaves Garden');
      } else {
        setCurrentZoneName('Zone 1: Hours of Work Plaza & Marina');
      }

      // Question block head-bonk handling
      if (resolved.bumpedColliderIds.length > 0) {
        for (const bumpedId of resolved.bumpedColliderIds) {
          const hitCol = colliders.find((c) => c.id === bumpedId);
          const meshEntry = blockMeshes.get(bumpedId);
          if (hitCol && hitCol.isQuestionBlock && !hitCol.hit) {
            hitCol.hit = true;
            if (meshEntry) {
              meshEntry.mesh.position.y = meshEntry.baseY + 0.42;
              (meshEntry.mesh.material as THREE.MeshStandardMaterial).color.setHex(0x94a3b8);
              setTimeout(() => {
                if (meshEntry) meshEntry.mesh.position.y = meshEntry.baseY;
              }, 140);
            }
            marioAudio.playQuestionBlock();
            onEarnCoinsRef.current(10);
            localCoins += 10;
            localScore += 1000;
            localDoctrines += 1;
            setCoins(localCoins);
            setScore(localScore);
            setDiscoveredDoctrinesCount(localDoctrines);

            // Display active Labor Law doctrine!
            if (meshEntry?.doctrineId && ISLAND_LABOR_DOCTRINES[meshEntry.doctrineId]) {
              const doc = ISLAND_LABOR_DOCTRINES[meshEntry.doctrineId];
              setDoctrineToast({
                title: doc.title,
                cite: doc.legalCitation,
                rule: doc.shortRule,
              });
              setActiveDoctrineModal(doc);
            }
          } else {
            marioAudio.playJump();
          }
        }
      }

      // Landmark Case Scroll proximity pickup
      scrollMeshesList.forEach((s) => {
        if (s.collected) return;
        const dx = pState.x - s.mesh.position.x;
        const dy = pState.y + 1.2 - s.mesh.position.y;
        const dz = pState.z - s.mesh.position.z;
        if (dx * dx + dy * dy + dz * dz < 5.8) {
          s.collected = true;
          scene.remove(s.mesh);
          marioAudio.playPowerUp();
          onEarnCoinsRef.current(25);
          localCoins += 25;
          localScore += 2500;
          localScrolls += 1;
          setCoins(localCoins);
          setScore(localScore);
          setDiscoveredScrollsCount(localScrolls);
          setActiveCaseModal(s.scrollData);
          setDoctrineToast({
            title: `Landmark Case: ${s.scrollData.caseTitle}`,
            cite: s.scrollData.grNumber,
            rule: s.scrollData.landmarkDoctrine,
          });
        }
      });

      // Update player walk cycle
      const stepHoriz = Math.hypot(pState.vx, pState.vz);
      if (stepHoriz > 0.01 && pState.grounded) {
        gaitDist += stepHoriz * 2.6;
        leftShoe.position.z = 0.08 + Math.sin(gaitDist) * 0.28;
        rightShoe.position.z = 0.08 - Math.sin(gaitDist) * 0.28;
      } else {
        leftShoe.position.z = 0.08;
        rightShoe.position.z = 0.08;
      }

      playerGroup.position.set(pState.x, pState.y, pState.z);
      playerGroup.rotation.y = pState.rotY;

      // Contact shadow update
      let surfaceBelowY = 0;
      for (const obs of colliders) {
        if (obs.kind === 'ground' || obs.kind === 'fence') continue;
        if (
          pState.x >= obs.minX &&
          pState.x <= obs.maxX &&
          pState.z >= obs.minZ &&
          pState.z <= obs.maxZ &&
          obs.maxY <= pState.y + 0.1 &&
          obs.maxY > surfaceBelowY
        ) {
          surfaceBelowY = obs.maxY;
        }
      }
      shadowDisc.position.set(pState.x, surfaceBelowY + 0.03, pState.z);
      const heightAboveFloor = Math.max(0, pState.y - surfaceBelowY);
      const shadowScale = Math.max(0.4, 1 - heightAboveFloor * 0.07);
      shadowDisc.scale.set(shadowScale, shadowScale, 1);

      // Coin pickup (Regular & Star Coins)
      let remainingUncollected = 0;
      coinsList.forEach((c) => {
        if (c.collected) return;
        const dx = pState.x - c.mesh.position.x;
        const dy = pState.y + 1.5 - c.mesh.position.y;
        const dz = pState.z - c.mesh.position.z;
        if (dx * dx + dy * dy + dz * dz < 5.2) {
          c.collected = true;
          scene.remove(c.mesh);
          const earnVal = c.isStarCoin ? 5 : 1;
          const scoreVal = c.isStarCoin ? 1000 : 250;
          localCoins += earnVal;
          localScore += scoreVal;
          setCoins(localCoins);
          setScore(localScore);
          onEarnCoinsRef.current(earnVal);
          if (c.isStarCoin) {
            marioAudio.playPowerUp();
          } else {
            marioAudio.playCoin();
          }
        } else {
          remainingUncollected += 1;
        }
      });

      if (
        remainingUncollected === 0 &&
        localDoctrines >= 6 &&
        gameStateRef.current === 'playing'
      ) {
        onEarnCoinsRef.current(50);
        setScore((s) => s + 5000);
        setGameState('victory');
        marioAudio.playQuizComplete();
      }

      // Smooth camera follow with multi-mode presets!
      const camLerp = 1 - Math.exp(-6.0 * dt);
      const mode = cameraModeRef.current;

      if (mode === 'bird') {
        // High overhead strategic bird's eye view
        camera.position.x += (pState.x - camera.position.x) * camLerp;
        camera.position.z += (pState.z + 18 - camera.position.z) * camLerp;
        camera.position.y += (pState.y + 38 - camera.position.y) * camLerp;
        camera.lookAt(pState.x, pState.y + 1, pState.z);
      } else if (mode === 'action') {
        // Dramatic low-angle action cam
        const targetCamX = pState.x + Math.sin(pState.rotY) * 11;
        const targetCamZ = pState.z + Math.cos(pState.rotY) * 11;
        camera.position.x += (targetCamX - camera.position.x) * camLerp;
        camera.position.z += (targetCamZ - camera.position.z) * camLerp;
        camera.position.y += (pState.y + 4.8 - camera.position.y) * camLerp;
        camera.lookAt(pState.x, pState.y + 2.2, pState.z);
      } else {
        // Standard Follow Cam with orbit rotation support
        const targetCamX = pState.x + Math.sin(orbitAngle) * 20;
        const targetCamZ = pState.z + Math.cos(orbitAngle) * 20;
        camera.position.x += (targetCamX - camera.position.x) * camLerp;
        camera.position.z += (targetCamZ - camera.position.z) * camLerp;
        camera.position.y += (pState.y + 10.5 - camera.position.y) * camLerp;
        camera.lookAt(pState.x, pState.y + 2.2, pState.z - 2.5);
      }

      renderer.render(scene, camera);
      scheduleNextFrame();
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      if (paceTimer) clearTimeout(paceTimer);
      resizeObserver.disconnect();
      domCanvas.removeEventListener('pointerdown', onPointerDownCanvas);
      window.removeEventListener('pointermove', onPointerMoveCanvas);
      window.removeEventListener('pointerup', onPointerUpCanvas);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

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
                EXTENDED 3D SPATIAL ARENA (240x200m) • {heroMeta.name.toUpperCase()}
              </span>
              <h2 className="text-lg sm:text-2xl font-black font-display text-white">
                3D PHILIPPINE LABOR LAW ISLAND
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 bg-slate-900 px-3 py-2 rounded-xl border-2 border-slate-700 w-full sm:w-auto tabular-nums">
            <div className="flex items-center gap-3">
              {/* Lives */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3].map((h) => (
                  <Heart
                    key={h}
                    className={`w-4 h-4 ${h <= lives ? 'text-rose-500 fill-rose-500' : 'text-slate-600'}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5 font-mario text-xs text-amber-300">
                <MarioCoinIcon className="w-4 h-4 shrink-0" />
                <span>x{coins.toString().padStart(2, '0')}</span>
              </div>
              <div className="font-mario text-xs text-white">
                SCORE: <span className="text-emerald-400">{score.toString().padStart(5, '0')}</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-2 border-l border-slate-700 pl-2 text-[10px] font-bold text-amber-300">
              <span>Doctrines: {discoveredDoctrinesCount}/11</span>
              <span>·</span>
              <span>Scrolls: {discoveredScrollsCount}/5</span>
            </div>
            <button
              type="button"
              aria-label="Restart 3D Island"
              onClick={startGame}
              className="min-h-[34px] px-2.5 inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] rounded-lg border border-slate-600 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Zone Badge + Active Toast Bar + Camera & Dash Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-slate-950/80 rounded-xl border border-slate-700 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-black text-cyan-300 truncate">{currentZoneName}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Camera View Switcher */}
            <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 text-[10px] font-bold">
              <Camera className="w-3 h-3 text-amber-400" />
              <button
                type="button"
                onClick={() => setCameraMode('follow')}
                className={`px-1.5 py-0.5 rounded ${cameraMode === 'follow' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'}`}
              >
                Follow
              </button>
              <button
                type="button"
                onClick={() => setCameraMode('bird')}
                className={`px-1.5 py-0.5 rounded ${cameraMode === 'bird' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'}`}
              >
                Bird&apos;s Eye
              </button>
              <button
                type="button"
                onClick={() => setCameraMode('action')}
                className={`px-1.5 py-0.5 rounded ${cameraMode === 'action' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'}`}
              >
                Action
              </button>
            </div>

            {/* Fast Warp Pipe Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 text-[10px]">
              <span className="text-slate-400 font-bold">Warp:</span>
              <button
                type="button"
                onClick={() => warpPlayerRef.current?.(-60, 20)}
                className="hover:text-amber-300 text-slate-200 cursor-pointer font-bold"
              >
                Wages
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => warpPlayerRef.current?.(60, 20)}
                className="hover:text-amber-300 text-slate-200 cursor-pointer font-bold"
              >
                Holidays
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => warpPlayerRef.current?.(0, -60)}
                className="hover:text-amber-300 text-slate-200 cursor-pointer font-bold"
              >
                Citadel
              </button>
            </div>
          </div>
        </div>

        {/* 3D Viewport Frame */}
        <div
          data-testid="game3d-viewport"
          className="relative rounded-2xl border-4 border-slate-950 overflow-hidden bg-slate-950 shadow-2xl w-full max-w-full h-[290px] min-[400px]:h-[350px] sm:h-[480px] md:h-[550px] flex items-center justify-center arcade-viewport-scaled select-none"
        >
          <div ref={mountRef} className="w-full h-full block object-contain arcade-canvas-scaled cursor-grab active:cursor-grabbing" />

          {/* Mini-Map Radar Overlay */}
          {gameState === 'playing' && (
            <div className="absolute top-3 right-3 z-10 w-28 h-24 sm:w-36 sm:h-30 bg-slate-950/85 rounded-xl border-2 border-slate-700/80 p-1 pointer-events-none shadow-lg">
              <div className="relative w-full h-full border border-slate-800 rounded-lg overflow-hidden bg-slate-900/90">
                {/* 5 Zones indicator outlines */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-purple-900/20 border-b border-purple-500/30 flex items-center justify-center text-[7px] font-mono text-purple-300 font-bold">
                  CITADEL
                </div>
                <div className="absolute top-1/3 left-0 w-1/2 h-1/3 bg-amber-900/20 border-r border-amber-500/30 flex items-center justify-center text-[7px] font-mono text-amber-300 font-bold">
                  WAGES
                </div>
                <div className="absolute top-1/3 right-0 w-1/2 h-1/3 bg-rose-900/20 flex items-center justify-center text-[7px] font-mono text-rose-300 font-bold">
                  REST/HOL
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-sky-900/20 border-t border-sky-500/30 flex items-center justify-center text-[7px] font-mono text-sky-300 font-bold">
                  MARINA
                </div>
                {/* Player Indicator Dot */}
                <div
                  className="absolute w-2.5 h-2.5 rounded-full bg-amber-400 border border-black shadow-[0_0_6px_#fbbf24] -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${((playerRadarPos.x + 116) / 232) * 100}%`,
                    top: `${((playerRadarPos.z + 96) / 192) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Start Screen Overlay */}
          {gameState === 'start' && (
            <div className="absolute inset-0 z-20 bg-slate-950/90 flex flex-col items-center justify-center text-center p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto text-white">
              <div className="max-w-md space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400 text-amber-300 text-xs font-bold font-mario">
                  <Scale className="w-4 h-4 text-amber-400" />
                  <span>PHILIPPINE LABOR CODE 3D WORLD (240x200m)</span>
                </div>
                <h3 className="text-2xl sm:text-4xl font-black font-display text-white">
                  3D LABOR LAW ISLAND
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Explore 5 wide Labor Law Districts! Stomp patrolling Goombas &amp; Koopas, hit Springboard Bounce Pads to reach Sky Clouds, bonk [?] Blocks to unlock Article 83-298 provisions, and slide down the Supreme Flagpole!
                </p>
              </div>

              <button
                type="button"
                data-start="true"
                onClick={startGame}
                className="min-h-[46px] sm:min-h-[52px] px-7 sm:px-9 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black rounded-2xl border-3 border-black shadow-[0_4px_0_#000] text-xs sm:text-base cursor-pointer font-mario whitespace-nowrap z-30 shrink-0"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
                <span>START 3D EXPLORATION</span>
              </button>

              <div className="hidden sm:flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
                <span>WASD / Arrow Keys Move</span>
                <span>·</span>
                <span>Space Jump (Hold for high jump)</span>
                <span>·</span>
                <span>Shift to Turbo Dash</span>
                <span>·</span>
                <span>Drag Mouse to Orbit Camera</span>
              </div>
            </div>
          )}

          {/* Island Cleared Victory Modal */}
          {gameState === 'victory' && (
            <div className="absolute inset-0 z-20 bg-slate-950/92 flex flex-col items-center justify-center text-center p-3 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto text-white">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 border-3 border-black flex items-center justify-center text-slate-950 shadow-[0_4px_0_#000] shrink-0">
                <Trophy className="w-8 h-8 sm:w-9 sm:h-9" />
              </div>
              <h3 className="text-xl sm:text-3xl font-black font-display text-amber-300">
                3D LABOR LAW ISLAND MASTERED!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm">
                You successfully navigated all 5 Labor Districts, stomped the enemies, grabbed the Star Coins, and conquered the Supreme Court Citadel!
              </p>
              <div className="grid grid-cols-3 gap-2 w-full max-w-sm tabular-nums text-center">
                <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-2.5">
                  <span className="text-[9px] font-mario text-slate-400 block">FINAL SCORE</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400">{score}</span>
                </div>
                <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-2.5">
                  <span className="text-[9px] font-mario text-slate-400 block">COINS EARNED</span>
                  <span className="text-base sm:text-lg font-black text-amber-300">{coins}</span>
                </div>
                <div className="bg-slate-900 border-2 border-slate-700 rounded-xl p-2.5">
                  <span className="text-[9px] font-mario text-slate-400 block">DOCTRINES</span>
                  <span className="text-base sm:text-lg font-black text-cyan-400">{discoveredDoctrinesCount}/11</span>
                </div>
              </div>
              <button
                type="button"
                data-start="true"
                onClick={startGame}
                className="min-h-[44px] px-6 inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_4px_0_#000] cursor-pointer font-mario text-xs whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>EXPLORE AGAIN</span>
              </button>
            </div>
          )}
        </div>

        {/* Interactive Doctrine Card (Active when bonking a question block) */}
        {activeDoctrineModal && (
          <div
            data-testid="3d-doctrine-card"
            className="p-3.5 bg-slate-900 border-2 border-amber-400 rounded-2xl space-y-2.5 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block truncate">
                    {activeDoctrineModal.legalCitation} · {activeDoctrineModal.category}
                  </span>
                  <h4 className="text-sm font-black text-white font-display break-words">
                    {activeDoctrineModal.title}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDoctrineModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 break-words">
              {activeDoctrineModal.fullPrinciple}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 min-w-0">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span className="font-semibold truncate">{activeDoctrineModal.barTip}</span>
              </div>
              <button
                type="button"
                disabled={Boolean(savedNoteKeys[activeDoctrineModal.id])}
                onClick={() => {
                  if (typeof window === 'undefined') return;
                  try {
                    const notes = loadStudyNotes(window.localStorage);
                    const noteLines = [
                      `Controlling statutory doctrine: ${activeDoctrineModal.legalCitation} — ${activeDoctrineModal.title}`,
                      `Takeaway distinction: ${activeDoctrineModal.barTip}`,
                      `Problem Scenario: ${activeDoctrineModal.category} exploration doctrine.`,
                      `Controlling Statutory Text: ${activeDoctrineModal.fullPrinciple}`,
                      `${activeDoctrineModal.legalCitation} · Ref: 3d_doctrine_${activeDoctrineModal.id}`,
                    ];
                    const updated = createStudyNote(notes, {
                      title: activeDoctrineModal.title,
                      content: noteLines.join('\n'),
                      worldTag: 'world1',
                      categoryTag: 'Quick Reference',
                    });
                    saveStudyNotes(updated, window.localStorage);
                    setSavedNoteKeys((prev) => ({ ...prev, [activeDoctrineModal.id]: true }));
                    window.dispatchEvent(new CustomEvent('mario-study-notes-updated'));
                    marioAudio.playCoin();
                  } catch {
                    setSavedNoteKeys((prev) => ({ ...prev, [activeDoctrineModal.id]: true }));
                  }
                }}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                  savedNoteKeys[activeDoctrineModal.id]
                    ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500 cursor-default'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-600 cursor-pointer active:translate-y-0.5'
                }`}
              >
                {savedNoteKeys[activeDoctrineModal.id] ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Saved to Notes</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Save to Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Interactive Landmark Case Card */}
        {activeCaseModal && !activeDoctrineModal && (
          <div
            data-testid="3d-case-scroll-card"
            className="p-3.5 bg-slate-900 border-2 border-cyan-400 rounded-2xl space-y-2.5 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block truncate">
                    SUPREME COURT LANDMARK CASE · {activeCaseModal.grNumber}
                  </span>
                  <h4 className="text-sm font-black text-white font-display break-words">
                    {activeCaseModal.caseTitle}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCaseModal(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 break-words">
              {activeCaseModal.landmarkDoctrine}
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-bold min-w-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">+25 Coins Awarded!</span>
              </div>
              <button
                type="button"
                disabled={Boolean(savedNoteKeys[activeCaseModal.caseTitle])}
                onClick={() => {
                  if (typeof window === 'undefined') return;
                  try {
                    const notes = loadStudyNotes(window.localStorage);
                    const updated = createStudyNote(notes, {
                      title: `Landmark Case: ${activeCaseModal.caseTitle}`,
                      content: `[Supreme Court Landmark Case Law]\n\nCase: ${activeCaseModal.caseTitle} (${activeCaseModal.grNumber})\n\nDoctrine: ${activeCaseModal.landmarkDoctrine}`,
                      worldTag: 'world1',
                      categoryTag: 'Quick Reference',
                    });
                    saveStudyNotes(updated, window.localStorage);
                    setSavedNoteKeys((prev) => ({ ...prev, [activeCaseModal.caseTitle]: true }));
                    window.dispatchEvent(new CustomEvent('mario-study-notes-updated'));
                    marioAudio.playCoin();
                  } catch {
                    setSavedNoteKeys((prev) => ({ ...prev, [activeCaseModal.caseTitle]: true }));
                  }
                }}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 transition-colors ${
                  savedNoteKeys[activeCaseModal.caseTitle]
                    ? 'bg-emerald-900/80 text-emerald-300 border-emerald-500 cursor-default'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-600 cursor-pointer active:translate-y-0.5'
                }`}
              >
                {savedNoteKeys[activeCaseModal.caseTitle] ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Saved Case to Notes</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Save Case to Notes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* On-Screen Virtual Controls */}
        <div className="pt-2 w-full max-w-full box-border">
          <div className="bg-slate-900/90 border-2 border-slate-700/80 rounded-2xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5 shadow-inner">
            {/* 4-Way D-Pad Directional Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
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
                aria-label="Move Forward"
                onPointerDown={(e) => {
                  e.preventDefault();
                  keysRef.current.forward = true;
                }}
                onPointerUp={() => (keysRef.current.forward = false)}
                onPointerLeave={() => (keysRef.current.forward = false)}
                onPointerCancel={() => (keysRef.current.forward = false)}
                className="h-10 w-10 sm:h-11 sm:w-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-black rounded-xl border-2 border-slate-600 inline-flex items-center justify-center cursor-pointer shrink-0 touch-none select-none transition-colors"
              >
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              </button>
              <button
                type="button"
                aria-label="Move Backward"
                onPointerDown={(e) => {
                  e.preventDefault();
                  keysRef.current.backward = true;
                }}
                onPointerUp={() => (keysRef.current.backward = false)}
                onPointerLeave={() => (keysRef.current.backward = false)}
                onPointerCancel={() => (keysRef.current.backward = false)}
                className="h-10 w-10 sm:h-11 sm:w-11 bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-black rounded-xl border-2 border-slate-600 inline-flex items-center justify-center cursor-pointer shrink-0 touch-none select-none transition-colors"
              >
                <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
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

            {/* Desktop Helper Prompt */}
            <div className="text-[11px] text-slate-300 font-semibold hidden md:block">
              WASD/Arrows to Move · Shift to Turbo Dash · Space to Jump · Stomp Enemies!
            </div>

            {/* Action Buttons: Turbo Dash & Jump */}
            <div className="w-full min-[480px]:w-auto flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                aria-label="Turbo Dash"
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
                className={`min-h-[44px] sm:min-h-[48px] px-3.5 sm:px-4 inline-flex items-center justify-center gap-1 rounded-xl border-2 font-mario text-[10px] sm:text-xs cursor-pointer transition-colors ${
                  isDashing
                    ? 'bg-rose-500 text-white border-white shadow-[0_0_12px_#f43f5e]'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-600'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>DASH</span>
              </button>

              <button
                type="button"
                data-testid="game3d-jump-btn"
                aria-label="Jump (Hold for High Jump)"
                onPointerDown={(e) => {
                  e.preventDefault();
                  keysRef.current.jumpQueued = true;
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
                className="flex-1 min-[480px]:flex-initial min-h-[44px] sm:min-h-[48px] px-5 sm:px-6 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 active:scale-95 text-slate-950 font-black rounded-xl border-3 border-black shadow-[0_3px_0_#000] cursor-pointer font-mario text-[10px] sm:text-xs leading-none whitespace-nowrap touch-none select-none transition-transform"
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
