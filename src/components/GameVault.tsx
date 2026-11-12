import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import { HERO_ROSTER, getHeroMeta } from '../data/heroesData';
import { LaborKart } from './LaborKart';
import { Game2D } from './Game2D';
import { Game3D } from './Game3D';
import { CourtroomBossBattle } from './CourtroomBossBattle';
import { WarpPipeSorter } from './WarpPipeSorter';
import { LawCatcherGame } from './LawCatcherGame';
import { CoinRushArcadeGame } from './CoinRushArcadeGame';
import {
  WhackAGoombaGame,
  MultiplierMemoryGame,
  ContractorBusterGame,
  BowsersBridgeGame,
  HolidayWageSorterGame,
} from './ArcadeMiniGames';
import {
  ToadHouseCoinSlots,
  World6LeaveMatcherGame,
  LakituCloudClimberGame,
} from './ExtraArcadeGames';
import {
  KoopaBrickBreakerGame,
  YoshiEggTossGame,
  BooBurdenMansionGame,
  ChronoPrescriptionBlitzGame,
} from './NewVaultGames';
import {
  HammerBrosPayrollBlitzGame,
  ToadetteDueProcessRelayGame,
  ShyGuyWageOrderFactoryGame,
  KamekDeadlineSpellbookGame,
} from './BonusVaultGames';
import {
  YoshiOvertimeExpressGame,
  LuigiNightShiftPoltergustGame,
  RosalinaWageObservatoryGame,
  PeachRoyalLeaveDispatchGame,
  WarioDeductionVaultGame,
  ToadsworthRetirementTribunalGame,
} from './MasterVaultGames';
import {
  CaptainToadMinecartGame,
  DaisyHolidayDerbyGame,
  DryBonesCryptGame,
  PaulineWageConcertGame,
} from './RoyalVaultGames';
import {
  LakituSkybridgeDashGame,
  DolePayrollStampDeskGame,
  MushroomUnionTowerDefenseGame,
  KoopaPinballBumperArenaGame,
  BarCodalWordHuntGame,
  LaborCommissionerBalanceSimGame,
} from './EngagingArcadeGames';
import {
  WarpPipeWhackAViolationGame,
  YoshiEggCatchDropGame,
  LuigiGhostClauseFlashlightGame,
  MarioKartWageOrderDriftGame,
  ToadConveyorWageSorterGame,
  BowserBridgeAxeTimingGame,
  PeachMysteryBlockPairMatchGame,
  ChainChompTugOfWarGame,
} from './MarioArcadeExpansion';
import {
  loadRound10VaultState,
  saveRound10VaultState,
  Round10VaultState,
} from '../utils/round10Features';
import {
  COIN_MAGNET_ACTIVE_KEY,
  ArcadeBestPlayEntry,
  loadArcadeBestPlays,
  recordArcadeBestPlay,
  dispatchDailyMissionEvent,
} from '../utils/round11Features';
import {
  MarioCharacterAvatar,
  MarioMushroomIcon,
  MarioQuestionBlockIcon,
  MarioStarIcon,
  MarioAxeIcon,
  MarioPipeIcon,
  MarioCoinIcon,
  MarioFireFlowerIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import {
  Gamepad2,
  Sparkles,
  ArrowRight,
  Hammer,
  ShieldCheck,
  Layers,
  Box,
  Users,
  Scale,
  Cloud,
  BookOpen,
  Crosshair,
  Eye,
  Timer,
  Disc,
  Factory,
  Wand2,
  ListOrdered,
  Clock,
  Moon,
  Stamp,
  Vault,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Shuffle,
  Compass,
  Sun,
  ShieldAlert,
  Music,
  Magnet,
  Trophy,
  RotateCcw,
  Star,
  Tv,
  Zap,
  Flame,
  Search,
  Filter,
  SlidersHorizontal,
  Bookmark,
  Volume2,
  VolumeX,
  X as CloseXIcon,
} from 'lucide-react';
import { GameDoctrinesModal } from './GameDoctrinesModal';
import { resolveUniversalCardFrame, CardFrameId } from '../utils/round12Features';
import {
  GAME_DECK_SETS,
  ARCADE_BOARD_LENGTHS,
  ARCADE_WORLD_FILTERS,
  GAME_WORLD_MAPPING,
  loadFavoriteGames,
  saveFavoriteGames,
  toggleFavoriteGame,
  GameDeckSetId,
  ArcadeBoardLengthId,
  ArcadeWorldCategory,
} from '../utils/gameDecksExpansion';

import { QuizCompletionPayload } from '../utils/profileAchievements';

interface GameVaultProps {
  equippedAvatar: MarioAvatar;
  equippedCardFrame?: CardFrameId | string;
  equippedRing?: string;
  setEquippedAvatar: (avatar: MarioAvatar) => void;
  coins: number;
  setCoins: React.Dispatch<React.SetStateAction<number>>;
  fontSize: 'normal' | 'large' | 'xlarge';
  onEarnCoins?: (amount: number) => void;
  onQuizCompleted?: (payload: QuizCompletionPayload) => void;
}

export type VaultGameId =
  | 'coin_rush'
  | 'pipe_whack_violation'
  | 'yoshi_egg_catch'
  | 'luigi_ghost_clause'
  | 'kart_wage_drift'
  | 'toad_conveyor_sorter'
  | 'bowser_axe_timing'
  | 'peach_block_match'
  | 'chomp_tug_of_war'
  | 'skybridge_dash'
  | 'payroll_stamp_desk'
  | 'union_tower_defense'
  | 'koopa_pinball'
  | 'codal_word_hunt'
  | 'commissioner_sim'
  | 'courtroom'
  | 'pipe_sorter'
  | 'catcher'
  | 'kart'
  | 'run2d'
  | 'island3d'
  | 'whack'
  | 'memory'
  | 'mansion'
  | 'bridge'
  | 'sorter'
  | 'toad_slots'
  | 'world6_clinic'
  | 'lakitu_climber'
  | 'koopa_breaker'
  | 'yoshi_toss'
  | 'boo_burden'
  | 'chrono_blitz'
  | 'hammer_blitz'
  | 'toadette_relay'
  | 'shy_conveyor'
  | 'kamek_duel'
  | 'yoshi_overtime'
  | 'luigi_nightshift'
  | 'rosalina_observatory'
  | 'peach_dispatch'
  | 'wario_vault'
  | 'toadsworth_tribunal'
  | 'captain_toad_minecart'
  | 'daisy_holiday_derby'
  | 'dry_bones_crypt'
  | 'pauline_wage_concert';

export const PURE_ACTION_GAME_IDS = new Set<VaultGameId>([
  'coin_rush',
  'pipe_whack_violation',
  'yoshi_egg_catch',
  'bowser_axe_timing',
  'chomp_tug_of_war',
  'catcher',
  'whack',
  'hammer_blitz',
  'chrono_blitz',
  'kamek_duel',
  'run2d',
  'island3d',
  'skybridge_dash',
  'kart',
  'kart_wage_drift',
  'koopa_pinball',
  'koopa_breaker',
  'yoshi_toss',
  'payroll_stamp_desk',
  'toad_conveyor_sorter',
  'pipe_sorter',
  'sorter',
  'shy_conveyor',
  'mansion',
  'luigi_ghost_clause',
  'union_tower_defense',
  'commissioner_sim',
  'codal_word_hunt',
  'peach_block_match',
  'memory',
  'bridge',
  'toad_slots',
  'lakitu_climber',
  'courtroom',
  'yoshi_overtime',
  'pauline_wage_concert',
  'daisy_holiday_derby',
  'world6_clinic',
  'peach_dispatch',
  'boo_burden',
  'toadette_relay',
  'luigi_nightshift',
  'rosalina_observatory',
  'wario_vault',
  'toadsworth_tribunal',
  'captain_toad_minecart',
  'dry_bones_crypt',
]);

export const GameVault: React.FC<GameVaultProps> = ({
  equippedAvatar,
  equippedCardFrame = 'frame_default',
  equippedRing,
  setEquippedAvatar,
  coins,
  setCoins,
  onEarnCoins,
  onQuizCompleted,
}) => {
  const resolvedUniversalFrame = resolveUniversalCardFrame(equippedCardFrame);
  const hasCustomFrame = Boolean(equippedCardFrame && equippedCardFrame !== 'frame_default');
  const [activeGame, setActiveGame] = useState<VaultGameId>(() => {
    if (typeof window !== 'undefined') {
      const g = new URLSearchParams(window.location.search).get('game') as VaultGameId;
      if (g) return g;
    }
    return 'pipe_whack_violation';
  });
  const [replayNonce, setReplayNonce] = useState<number>(0);
  const [genreFilter, setGenreFilter] = useState<
    | 'all'
    | 'pure_action'
    | 'action_reflex'
    | 'platformer_kart'
    | 'inspection_sim'
    | 'strategy_puzzle'
    | 'courtroom_tribunal'
  >('all');
  const [showHeroPicker, setShowHeroPicker] = useState(false);
  const [showDoctrineModal, setShowDoctrineModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [worldFilter, setWorldFilter] = useState<ArcadeWorldCategory>('world_all');
  const [activeDeckSet, setActiveDeckSet] = useState<GameDeckSetId>('set_all_complete');
  const [activeBoardLength, setActiveBoardLength] = useState<ArcadeBoardLengthId>('standard_10');
  const [sortBy, setSortBy] = useState<'default' | 'score' | 'plays' | 'stars' | 'alpha'>('default');
  const [favoriteGames, setFavoriteGames] = useState<string[]>(() => loadFavoriteGames());
  const [arcadeAudioMuted, setArcadeAudioMuted] = useState<boolean>(() => !marioAudio.settings.enabled);
  const [compactVaultHeader, setCompactVaultHeader] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [vaultTokens, setVaultTokens] = useState<Round10VaultState>(() =>
    loadRound10VaultState()
  );

  const handleToggleFavorite = (gId: string) => {
    const updated = toggleFavoriteGame(gId);
    setFavoriteGames(updated);
    marioAudio.playClick();
  };
  const [doublePayoutActive, setDoublePayoutActive] = useState(false);
  const [bonusShieldActive, setBonusShieldActive] = useState(false);
  const [coinMagnetActive, setCoinMagnetActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COIN_MAGNET_ACTIVE_KEY) === 'true';
  });
  const [bestPlays, setBestPlays] = useState<ArcadeBestPlayEntry[]>(() =>
    typeof window !== 'undefined' ? loadArcadeBestPlays(window.localStorage) : []
  );
  // Default to collapsed so Best Plays does not automatically open when entering games
  const [showBestPlays, setShowBestPlays] = useState<boolean>(false);
  const [boostNotice, setBoostNotice] = useState<string | null>(null);
  const [frenzyMeter, setFrenzyMeter] = useState<number>(0);
  const [frenzyActive, setFrenzyActive] = useState<boolean>(false);
  const [frenzySeconds, setFrenzySeconds] = useState<number>(0);
  const [crtScanlines, setCrtScanlines] = useState<boolean>(false);
  const [floatingPopups, setFloatingPopups] = useState<
    { id: number; text: string; subText?: string; color: string }[]
  >([]);

  const spawnFloatingPopup = (text: string, color: string = 'amber', subText?: string) => {
    const id = Date.now() + Math.random();
    setFloatingPopups((prev) => [...prev.slice(-3), { id, text, subText, color }]);
    setTimeout(() => {
      setFloatingPopups((prev) => prev.filter((p) => p.id !== id));
    }, 1300);
  };

  const triggerFrenzy = () => {
    setFrenzyActive(true);
    setFrenzySeconds(10);
    setFrenzyMeter(100);
    marioAudio.playPowerUp();
    spawnFloatingPopup('SUPER STAR FRENZY x3 ACTIVE!', 'rainbow', '10s Massive Multipliers!');
    setBoostNotice('Super Star Frenzy Active! 3x Coin Multiplier for 10s!');
  };

  useEffect(() => {
    if (!frenzyActive) return;
    const timer = setInterval(() => {
      setFrenzySeconds((sec) => {
        if (sec <= 1) {
          setFrenzyActive(false);
          setFrenzyMeter(0);
          setBoostNotice('Super Star Frenzy ended');
          return 0;
        }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [frenzyActive]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        setReplayNonce((n) => n + 1);
        marioAudio.playPipe();
        spawnFloatingPopup('QUICK RESTART!', 'amber', 'Ready!');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getGameStarRating = (gameId: string): number => {
    const bp = bestPlays.find((p) => p.gameId === gameId);
    if (!bp) return 0;
    if (bp.bestScore >= 800 || bp.bestCoins >= 16) return 3;
    if (bp.bestScore >= 400 || bp.bestCoins >= 8) return 2;
    if (bp.bestScore > 0 || bp.bestCoins > 0 || bp.playsCount > 0) return 1;
    return 0;
  };

  useEffect(() => {
    const syncMagnet = () => {
      if (typeof window !== 'undefined') {
        setCoinMagnetActive(localStorage.getItem(COIN_MAGNET_ACTIVE_KEY) === 'true');
      }
    };
    window.addEventListener('mario-coin-magnet-updated', syncMagnet);
    return () => window.removeEventListener('mario-coin-magnet-updated', syncMagnet);
  }, []);

  const heroMeta = getHeroMeta(equippedAvatar);

  const syncSaveTokens = (next: Round10VaultState) => {
    setVaultTokens(next);
    saveRound10VaultState(next);
  };

  const handleActivate2xBoost = () => {
    if (doublePayoutActive) return;
    if (vaultTokens.inventory.arcade2x > 0) {
      syncSaveTokens({
        ...vaultTokens,
        inventory: {
          ...vaultTokens.inventory,
          arcade2x: vaultTokens.inventory.arcade2x - 1,
        },
      });
      setDoublePayoutActive(true);
      setBoostNotice('2x Arcade Coin Payout Ticket Activated!');
      marioAudio.playPowerUp();
    } else if (coins >= 15) {
      setCoins((c) => Math.max(0, c - 15));
      setDoublePayoutActive(true);
      setBoostNotice('Spent 15 Coins · 2x Arcade Coin Multiplier Active!');
      marioAudio.playPowerUp();
    } else {
      marioAudio.playStomp();
    }
  };

  const handleActivateShieldBoost = () => {
    if (bonusShieldActive) return;
    if (vaultTokens.inventory.arcadeShield > 0) {
      syncSaveTokens({
        ...vaultTokens,
        inventory: {
          ...vaultTokens.inventory,
          arcadeShield: vaultTokens.inventory.arcadeShield - 1,
        },
      });
      setBonusShieldActive(true);
      setBoostNotice('Bonus Shield & Extra HP Activated!');
      marioAudio.playPowerUp();
    } else if (coins >= 15) {
      setCoins((c) => Math.max(0, c - 15));
      setBonusShieldActive(true);
      setBoostNotice('Spent 15 Coins · Bonus Shield & Extra HP Active!');
      marioAudio.playPowerUp();
    } else {
      marioAudio.playStomp();
    }
  };

  const handleBuyRadarCharge = () => {
    if (coins < 10) {
      marioAudio.playStomp();
      return;
    }
    setCoins((c) => Math.max(0, c - 10));
    syncSaveTokens({
      ...vaultTokens,
      inventory: {
        ...vaultTokens.inventory,
        arcadeRadar: vaultTokens.inventory.arcadeRadar + 2,
      },
    });
    setBoostNotice('Spent 10 Coins · Added +2 Inspector Radar Charges!');
    marioAudio.playCoin();
  };

  const handleConsumeRadar = () => {
    if (vaultTokens.inventory.arcadeRadar <= 0) return;
    syncSaveTokens({
      ...vaultTokens,
      inventory: {
        ...vaultTokens.inventory,
        arcadeRadar: Math.max(0, vaultTokens.inventory.arcadeRadar - 1),
      },
    });
  };

  const handleToggleOrBuyCoinMagnet = () => {
    let unlocked: string[] = [];
    try {
      unlocked = JSON.parse(localStorage.getItem('mario_unlocked_items') || '[]');
    } catch {
      unlocked = [];
    }
    const ownsMagnet = unlocked.includes('powerup_coin_magnet');
    if (ownsMagnet || coinMagnetActive) {
      const next = !coinMagnetActive;
      setCoinMagnetActive(next);
      try {
        localStorage.setItem(COIN_MAGNET_ACTIVE_KEY, String(next));
      } catch {
        // ignore
      }
      setBoostNotice(next ? 'Coin Magnet Field Activated!' : 'Coin Magnet Field Paused');
      marioAudio.playPowerUp();
      return;
    }
    if (coins < 20) {
      marioAudio.playStomp();
      return;
    }
    setCoins((c) => Math.max(0, c - 20));
    setCoinMagnetActive(true);
    try {
      const merged = Array.from(new Set([...unlocked, 'powerup_coin_magnet']));
      localStorage.setItem('mario_unlocked_items', JSON.stringify(merged));
      localStorage.setItem(COIN_MAGNET_ACTIVE_KEY, 'true');
    } catch {
      // ignore
    }
    setBoostNotice('Unlocked Coin Magnet! Nearby Coins & Eggs auto-pull in Arcade!');
    marioAudio.playPowerUp();
  };

  const handleChargeFrenzy = () => {
    if (coins < 10 || frenzyActive) {
      if (coins < 10) marioAudio.playStomp();
      return;
    }
    setCoins((c) => Math.max(0, c - 10));
    marioAudio.playPowerUp();
    setFrenzyMeter((prev) => {
      const next = Math.min(100, prev + 35);
      if (next >= 100) {
        triggerFrenzy();
        return 100;
      }
      return next;
    });
    setBoostNotice('Spent 10 Coins · +35% Frenzy Charge!');
  };

  const handleRecordBestPlay = (
    gameId: string,
    gameTitle: string,
    score: number,
    coinsEarned: number
  ) => {
    if (typeof window === 'undefined') return;
    const next = recordArcadeBestPlay(
      { gameId, gameTitle, score, coinsEarned },
      window.localStorage
    );
    setBestPlays(next);
  };

  const handleEarnCoins = (amount: number) => {
    const magnetBonus = coinMagnetActive && amount > 0 ? Math.max(1, Math.round(amount * 0.25)) : 0;
    const multiplier = (doublePayoutActive ? 2 : 1) * (frenzyActive ? 3 : 1);
    const finalAmount = amount * multiplier + magnetBonus;
    if (onEarnCoins && finalAmount > 0) {
      onEarnCoins(finalAmount);
    } else {
      setCoins((prev) => Math.max(0, prev + finalAmount));
    }
    if (finalAmount > 0) {
      marioAudio.playCoin();
      dispatchDailyMissionEvent('arcade_play', 1);

      const sub = frenzyActive
        ? '3x STAR FRENZY!'
        : doublePayoutActive
        ? '2x BOOST ACTIVE'
        : undefined;
      spawnFloatingPopup(`+${finalAmount} COINS!`, frenzyActive ? 'rainbow' : 'amber', sub);

      if (!frenzyActive) {
        setFrenzyMeter((prev) => {
          const charge = Math.max(15, amount * 10);
          const next = Math.min(100, prev + charge);
          if (next >= 100) {
            triggerFrenzy();
            return 100;
          }
          return next;
        });
      }

      const found = games.find((gm) => gm.id === activeGame);
      if (found && typeof window !== 'undefined') {
        const next = recordArcadeBestPlay(
          {
            gameId: found.id,
            gameTitle: found.title,
            score: finalAmount * 50,
            coinsEarned: finalAmount,
          },
          window.localStorage
        );
        setBestPlays(next);
      }
    }
  };

  // Keyboard shortcut listener: press 'P' to toggle Best Plays, '1'..'5' for powerups, 'R' to restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setShowBestPlays((prev) => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        handleActivate2xBoost();
      } else if (e.key === '2') {
        e.preventDefault();
        handleActivateShieldBoost();
      } else if (e.key === '3') {
        e.preventDefault();
        handleToggleOrBuyCoinMagnet();
      } else if (e.key === '4') {
        e.preventDefault();
        handleChargeFrenzy();
      } else if (e.key === '5') {
        e.preventDefault();
        handleBuyRadarCharge();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setReplayNonce((n) => n + 1);
        marioAudio.playPipe();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [coins, doublePayoutActive, bonusShieldActive, coinMagnetActive, frenzyActive, vaultTokens]);

  const handleAdjustCoins = (delta: number) => {
    if (delta > 0 && onEarnCoins) {
      onEarnCoins(doublePayoutActive ? delta * 2 : delta);
    } else {
      setCoins((prev) =>
        Math.max(0, prev + (delta > 0 && doublePayoutActive ? delta * 2 : delta))
      );
    }
    if (delta !== 0) {
      dispatchDailyMissionEvent('arcade_play', 1);
    }
  };

  type GameVaultCategory =
    | 'action_reflex'
    | 'platformer_kart'
    | 'inspection_sim'
    | 'strategy_puzzle'
    | 'courtroom_tribunal';

  const GAME_CATEGORY_META: {
    id: GameVaultCategory;
    label: string;
    shortLabel: string;
    subtitle: string;
  }[] = [
    {
      id: 'action_reflex',
      label: 'Action & Reflex Arcade',
      shortLabel: 'Action & Reflex',
      subtitle: 'Fast-paced pipe smashers, timing duels, basket catchers, and deadline defusals.',
    },
    {
      id: 'platformer_kart',
      label: 'Platformer, Kart & Physics',
      shortLabel: 'Platformer, Kart & Physics',
      subtitle: '2D & 3D Mario platformers, drift kart racers, pinball bumpers, and shell physics.',
    },
    {
      id: 'inspection_sim',
      label: 'Inspection, Factory & Desk Sims',
      shortLabel: 'Inspection & Sims',
      subtitle: 'Payroll stamp audits, factory conveyor belts, leave clinics, and UV contract sweeps.',
    },
    {
      id: 'strategy_puzzle',
      label: 'Strategy, Board & Coin Treasury',
      shortLabel: 'Strategy, Puzzle & Treasury',
      subtitle: 'Tactical lane defense, policy simulators, codal grids, memory blocks, and coin reels.',
    },
    {
      id: 'courtroom_tribunal',
      label: 'Courtroom & Statutory Tribunals',
      shortLabel: 'Courtroom & Tribunals',
      subtitle: 'Turn-based courtroom battles, evidentiary spotlights, due-process relays, and world tribunals.',
    },
  ];

  const games: {
    id: VaultGameId;
    title: string;
    genre: string;
    desc: string;
    badge: string;
    icon: React.ReactNode;
    category: GameVaultCategory;
  }[] = [
    {
      id: 'coin_rush',
      title: 'Mario Coin Rush: Labor Obstacle Run',
      genre: 'Interactive Platformer Runner',
      desc: 'Navigate your hero across floating brick platforms to collect statutory coins and Star Power while dodging Labor Violations and Thwomps! Features Race Against Your Ghost!',
      badge: 'COIN RUSH',
      icon: <MarioCoinIcon className="w-6 h-6 text-amber-400" />,
      category: 'action_reflex',
    },
    {
      id: 'pipe_whack_violation',
      title: 'Warp Pipe Whack-a-Violation',
      genre: '3×3 Reflex Pipe Smasher',
      desc: 'Smash Labor-Only Endo & Sub-Minimum Wage moles popping from 9 Warp Pipes while sparing Union Toad Allies!',
      badge: 'PIPE SMASH',
      icon: <Hammer className="w-6 h-6 text-emerald-500" />,
      category: 'action_reflex',
    },
    {
      id: 'yoshi_egg_catch',
      title: "Yoshi's Egg-Catch Statutory Drop",
      genre: 'Canvas2D Basket Catcher',
      desc: 'Slide Yoshi’s basket to catch 15 Benefit Eggs & Gold Coins while dodging red Wage-Cut Spinies! Supports Coin Magnet!',
      badge: 'EGG CATCH',
      icon: <MarioStarIcon className="w-6 h-6" />,
      category: 'action_reflex',
    },
    {
      id: 'bowser_axe_timing',
      title: "Bowser's Bridge Axe Timing Duel",
      genre: 'Oscillating Sweet-Spot Breaker',
      desc: 'Strike the Golden Axe at the exact emerald sweet-spot to sever 5 Fortress Chains and drop Employer Bowser!',
      badge: 'AXE TIMING',
      icon: <MarioAxeIcon className="w-6 h-6" />,
      category: 'action_reflex',
    },
    {
      id: 'chomp_tug_of_war',
      title: 'Chain Chomp Statutory Tug-of-War',
      genre: 'Momentum Rope + Power Surge',
      desc: 'Heave the courtroom rope to 100% and fire True/False Statutory Power Surges before Chain Chomp drags it to 0%!',
      badge: 'TUG OF WAR',
      icon: <Scale className="w-6 h-6 text-rose-500" />,
      category: 'action_reflex',
    },
    {
      id: 'catcher',
      title: 'Super Mario Law Catcher',
      genre: 'Sky Drop Arcade',
      desc: 'Catch 13th month coins, 105-day leave mushrooms, and service charge stars while dodging unfair labor Thwomps!',
      badge: 'SKY CATCH',
      icon: <MarioStarIcon className="w-6 h-6" />,
      category: 'action_reflex',
    },
    {
      id: 'whack',
      title: 'Whack-a-Goomba Audit',
      genre: 'Reflex Pipe Smasher',
      desc: 'Smash illegal wage deductions popping from 9 pipes while sparing lawful Art. 113 deductions!',
      badge: 'ART. 113–116',
      icon: <Hammer className="w-6 h-6 text-rose-600" />,
      category: 'action_reflex',
    },
    {
      id: 'hammer_blitz',
      title: 'Hammer Bros. Payroll Blitz',
      genre: '3-Lane Payroll Shield & Smash',
      desc: 'Guard the Castle Payroll Vault! Shield lawful statutory premiums and smash illegal undertime offsets & deductions!',
      badge: 'SHIELD BLITZ',
      icon: <Hammer className="w-6 h-6 text-amber-700" />,
      category: 'action_reflex',
    },
    {
      id: 'chrono_blitz',
      title: 'Bob-omb Prescription Blitz',
      genre: 'Statutory Deadlines Defusal',
      desc: 'Cut the right wire (1 Yr ULP, 3 Yrs Money, 4 Yrs Dismissal, 5d NTE, 10d Appeal, 30d Notice) before boom!',
      badge: 'WIRE DEFUSE',
      icon: <Timer className="w-6 h-6 text-amber-600" />,
      category: 'action_reflex',
    },
    {
      id: 'kamek_duel',
      title: "Kamek's Statutory Deadlines Duel",
      genre: 'Prescriptive Spell-Shield',
      desc: 'Reflect Kamek’s hexes by casting exact statutory prescriptive periods (1 Yr ULP, 3 Yrs Money, 4 Yrs Dismissal, 20 Yrs SSS)!',
      badge: 'SPELL DUEL',
      icon: <Wand2 className="w-6 h-6 text-indigo-600" />,
      category: 'action_reflex',
    },
    {
      id: 'yoshi_overtime',
      title: "Yoshi's Overtime Express",
      genre: 'World 1 OT & Undertime Rail',
      desc: 'Dispatch rapid overtime multipliers (125%, 169%, 260%) and block prohibited Art. 88 undertime offsets!',
      badge: 'ART. 87–88',
      icon: <Clock className="w-6 h-6 text-lime-600" />,
      category: 'action_reflex',
    },
    {
      id: 'pauline_wage_concert',
      title: "Pauline's Metro Wage Concert",
      genre: '13th Month, Service Charge & Wages',
      desc: 'Conduct Metro Kingdom’s brass band! Hit the right notes on P.D. 851 13th month pay, 100% service charges, and D.O. 174!',
      badge: 'P.D. 851 / R.A. 11360',
      icon: <Music className="w-6 h-6 text-rose-600" />,
      category: 'action_reflex',
    },
    {
      id: 'run2d',
      title: 'Super Mario Legal Run',
      genre: 'Variable-Jump 2D Platformer',
      desc: 'Tap Jump for crisp short hops or hold Jump for high Mario arcs! Hit [?] blocks for World 1–6 Labor Law doctrines!',
      badge: '2D PLATFORMER',
      icon: <MarioMushroomIcon className="w-6 h-6" />,
      category: 'platformer_kart',
    },
    {
      id: 'island3d',
      title: '3D Mario Coin Island',
      genre: '3D Spatial Platformer',
      desc: 'Explore the 3D Mushroom Kingdom island with smooth momentum physics, hold-jump arcs, and solid AABB collisions!',
      badge: '3D ISLAND',
      icon: <Box className="w-6 h-6 text-indigo-600" />,
      category: 'platformer_kart',
    },
    {
      id: 'skybridge_dash',
      title: 'Lakitu Skybridge Dash',
      genre: 'Canvas2D Action Dodger',
      desc: 'Jump Spinies, dash through Hex Orbs, and dodge telegraphed Chargers while collecting 15 Golden Statutory Tokens!',
      badge: 'SKY DODGER',
      icon: <Cloud className="w-6 h-6 text-sky-500" />,
      category: 'platformer_kart',
    },
    {
      id: 'kart',
      title: 'Labor Kart GP (Drift Edition)',
      genre: 'Drift-Boost Mode-7 Racer',
      desc: 'Hop into corners with Shift/E or DRIFT button to charge Blue, Orange & Purple Mini-Turbo sparks across 3 laps!',
      badge: 'DRIFT RACER',
      icon: <MarioStarIcon className="w-6 h-6" />,
      category: 'platformer_kart',
    },
    {
      id: 'kart_wage_drift',
      title: 'Mario Kart Wage-Order Drift',
      genre: '3-Lane Rainbow Highway Racer',
      desc: 'Drift across 3 Rainbow Lanes to reach 1,000m — collect 200% Holiday & 125% OT Boost Pads while dodging Endo Traps!',
      badge: '3-LANE DRIFT',
      icon: <Compass className="w-6 h-6 text-sky-500" />,
      category: 'platformer_kart',
    },
    {
      id: 'koopa_pinball',
      title: 'Koopa Shell Pinball Arena',
      genre: 'Canvas2D Bumper Physics',
      desc: 'Launch emerald Koopa Shells into 125% OT, 200% Holiday & 22.5d Retirement bumpers with twin arcade flippers!',
      badge: 'BUMPER PINBALL',
      icon: <Disc className="w-6 h-6 text-lime-600" />,
      category: 'platformer_kart',
    },
    {
      id: 'koopa_breaker',
      title: 'Koopa Shell Statutory Breaker',
      genre: 'Breakout Physics Arcade',
      desc: 'Rebound a spinning Koopa Shell off your Mushroom Paddle to smash 24 Labor Code [?] multiplier blocks!',
      badge: 'BRICK BREAKER',
      icon: <Disc className="w-6 h-6 text-emerald-600" />,
      category: 'platformer_kart',
    },
    {
      id: 'yoshi_toss',
      title: "Yoshi's Statutory Egg Toss",
      genre: 'Trajectory Aim Shooter',
      desc: 'Aim Yoshi’s dotted arc and launch spotted eggs at floating 100%–390% statutory payroll rate clouds!',
      badge: 'ARC AIMING',
      icon: <Crosshair className="w-6 h-6 text-lime-600" />,
      category: 'platformer_kart',
    },
    {
      id: 'daisy_holiday_derby',
      title: "Daisy's Sarasaland Holiday Derby",
      genre: 'Holiday & Rest Day Multipliers',
      desc: 'Sprint through Sarasaland checkpoints! Compute 200% Regular, 300% Double Holiday, and 260% Rest Day holiday rates!',
      badge: 'ART. 93–94',
      icon: <Sun className="w-6 h-6 text-orange-500" />,
      category: 'platformer_kart',
    },
    {
      id: 'payroll_stamp_desk',
      title: 'DOLE Payroll Stamp Desk',
      genre: 'Papers-Please Audit Sim',
      desc: 'Inspect real employer payslips against minimum wage, 125% OT & Art. 113 rules — then slam APPROVE or VIOLATION!',
      badge: 'AUDIT DESK',
      icon: <Stamp className="w-6 h-6 text-amber-600" />,
      category: 'inspection_sim',
    },
    {
      id: 'toad_conveyor_sorter',
      title: "Toad's Conveyor Wage Sorter",
      genre: '3-Chute Factory Belt Router',
      desc: 'Route rolling factory crates into Monetary Pay, Statutory Leave, or Prohibited Act chutes before they drop off the belt!',
      badge: 'BELT ROUTER',
      icon: <Factory className="w-6 h-6 text-amber-500" />,
      category: 'inspection_sim',
    },
    {
      id: 'pipe_sorter',
      title: 'Warp Pipe Labor Sorter',
      genre: 'Speed Classification Arcade',
      desc: 'Flick incoming employment tickets into Green Pipe (Covered / Mandatory) or Red Pipe (Exempt / Prohibited)!',
      badge: 'CLASSIFIER',
      icon: <MarioPipeIcon className="w-6 h-6" />,
      category: 'inspection_sim',
    },
    {
      id: 'sorter',
      title: 'Dr. Mario Wage Sorter',
      genre: 'Holiday & Payroll Clinic',
      desc: 'Sort incoming Holiday & Rest Day payroll capsules into 100%, 130%–150%, or 200%–390% pipes!',
      badge: 'HOLIDAY PIPES',
      icon: <Layers className="w-6 h-6 text-cyan-600" />,
      category: 'inspection_sim',
    },
    {
      id: 'shy_conveyor',
      title: "Shy Guy's Wage & D.O. 174 Belt",
      genre: 'Real-Time Factory Conveyor',
      desc: 'Inspect moving crates on Shy Guy’s factory belt: certify P5M contractors & Pineda formulas, and bust labor-only chits!',
      badge: 'CONVEYOR',
      icon: <Factory className="w-6 h-6 text-emerald-700" />,
      category: 'inspection_sim',
    },
    {
      id: 'mansion',
      title: 'Contractor Buster',
      genre: 'DOLE D.O. 174 Inspector',
      desc: 'Bust prohibited Labor-Only Ghost Agencies and certify valid ₱5M independent contractors!',
      badge: 'D.O. 174-17',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      category: 'inspection_sim',
    },
    {
      id: 'luigi_ghost_clause',
      title: "Luigi's Ghost-Clause Flashlight Sweep",
      genre: 'Haunted Contract UV Sweeper',
      desc: 'Shine your Poltergust UV beam on dark contract tiles to expose and vacuum void Yellow-Dog & Perpetual Probation ghosts!',
      badge: 'UV SWEEPER',
      icon: <Eye className="w-6 h-6 text-lime-500" />,
      category: 'inspection_sim',
    },
    {
      id: 'world6_clinic',
      title: "Peach's World 6 Leave Clinic",
      genre: 'Statutory Leaves Dispatch',
      desc: 'Master SIL (5d), 105-Day Maternity, Paternity (7d), Solo Parent (7d), Gynecological (2m) & VAWC (10d) cases!',
      badge: 'LEAVE CLINIC',
      icon: <MarioFireFlowerIcon className="w-6 h-6" />,
      category: 'inspection_sim',
    },
    {
      id: 'peach_dispatch',
      title: "Peach's Royal Leave Dispatch",
      genre: 'Special Statutory Leaves',
      desc: 'Grant exact paid days for 105-Day Maternity, 7-Day Paternity, Solo Parent, VAWC, and Magna Carta for Women!',
      badge: 'SPECIAL LEAVES',
      icon: <Stamp className="w-6 h-6 text-pink-600" />,
      category: 'inspection_sim',
    },
    {
      id: 'union_tower_defense',
      title: 'Mushroom Union Tower Defense',
      genre: '5×7 Tactical Lane Defense',
      desc: 'Spend Union Gold to deploy OT Turrets, D.O. 174 Barriers & Garnish Beacons against 20 Wage-Shaver waves!',
      badge: 'LANE DEFENSE',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'commissioner_sim',
      title: 'Labor Commissioner Balance Sim',
      genre: '4-Meter Policy Simulator',
      desc: 'Rule on national workplace crises while balancing Worker Welfare, Compliance, Enterprise Health & Public Trust!',
      badge: 'POLICY SIM',
      icon: <Scale className="w-6 h-6 text-purple-600" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'codal_word_hunt',
      title: 'Statutory Codal Word Hunt',
      genre: '10×10 Puzzle + 4-Tier Hints',
      desc: 'Search high-contrast letter grids for key Labor Code & Supreme Court doctrines using our 4-Tier Hint magnifier!',
      badge: 'WORD GRID',
      icon: <BookOpen className="w-6 h-6 text-indigo-600" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'peach_block_match',
      title: "Peach's Mystery Block Pair Match",
      genre: '12-Block [?] Memory Flip',
      desc: 'Flip randomized Royal Castle [?] Blocks to pair Philippine Labor Doctrines with their exact statutory multipliers!',
      badge: '12 [?] PAIRS',
      icon: <MarioQuestionBlockIcon className="w-6 h-6" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'memory',
      title: 'Multiplier Memory Match',
      genre: 'Mario Party Flip Board',
      desc: 'Flip 16 Mystery [?] Blocks to pair work scenarios with statutory rates (125% to 390%)!',
      badge: '16 [?] BLOCKS',
      icon: <MarioQuestionBlockIcon className="w-6 h-6" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'bridge',
      title: "Bowser's Bridge Rescue",
      genre: 'Statutory Term Decoder',
      desc: 'Decode Labor Code doctrines letter-by-letter to trigger the golden axe before the bridge falls!',
      badge: 'WORD AXE',
      icon: <MarioAxeIcon className="w-6 h-6" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'toad_slots',
      title: "Toad's Coin Treasury Slots",
      genre: 'Coin Wager & Multiplier Bonus',
      desc: 'Wager 5, 15, or 30 coins on statutory multiplier reels and answer instant Statutory Trivia to double your coin jackpot!',
      badge: 'SPEND COINS',
      icon: <MarioCoinIcon className="w-6 h-6" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'lakitu_climber',
      title: "Lakitu's Cloud Jackpot Climber",
      genre: 'Risk-Reward Sky Tower',
      desc: 'Buy Lakitu’s Cloud Shield (-12c) and climb 5 statutory floors to bank up to +120 coins per summit!',
      badge: 'CLOUD SHIELD',
      icon: <Cloud className="w-6 h-6 text-sky-600" />,
      category: 'strategy_puzzle',
    },
    {
      id: 'courtroom',
      title: 'Courtroom Boss Battle',
      genre: 'Turn-Based Mario RPG',
      desc: 'Battle Employer Bowser in court! Counter illegal overtime, pregnancy dismissals, and deductions with statutory legal motions!',
      badge: 'BOSS RPG',
      icon: <Scale className="w-6 h-6 text-red-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'boo_burden',
      title: "King Boo's Burden Mansion",
      genre: 'Evidentiary Spotlight',
      desc: 'Master Loon v. Power Master! Shine your Poltergust spotlight on Employer vs. Employee Burden of Proof!',
      badge: 'EVIDENCE',
      icon: <Eye className="w-6 h-6 text-purple-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'toadette_relay',
      title: "Toadette's Twin-Notice Relay",
      genre: 'Procedural Sequence Builder',
      desc: 'Assemble chronological Just Cause, Authorized Cause, Disease, and Abandonment due process steps without nominal damages!',
      badge: 'DUE PROCESS',
      icon: <ListOrdered className="w-6 h-6 text-pink-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'luigi_nightshift',
      title: "Luigi's Night Shift Poltergust",
      genre: 'Graveyard 10PM–6AM Audit',
      desc: 'Sweep graveyard shift scenarios! Compute stacked +10% NSD rates and spot the <=5 worker retail exemption!',
      badge: 'ART. 86 NSD',
      icon: <Moon className="w-6 h-6 text-emerald-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'rosalina_observatory',
      title: "Rosalina's Wage Observatory",
      genre: 'Regional Wage & Distortion',
      desc: 'Calibrate RTWPB wage orders, apply the Pineda distortion formula, and distinguish facilities from supplements!',
      badge: 'ART. 97–124',
      icon: <Sparkles className="w-6 h-6 text-sky-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'wario_vault',
      title: "Wario's Deduction Vault",
      genre: 'Wage Protection Tribunal',
      desc: 'Audit Wario’s payroll ledger! Approve lawful check-offs and block illegal loss deductions exceeding 20% weekly wage!',
      badge: 'ART. 113–116',
      icon: <Vault className="w-6 h-6 text-amber-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'toadsworth_tribunal',
      title: "Toadsworth's Retirement Tribunal",
      genre: 'R.A. 7641 & Separation Pay',
      desc: 'Adjudicate 22.5-day retirement pay, underground miner ages (50–60), and authorized cause separation multipliers!',
      badge: 'ART. 298–302',
      icon: <Scale className="w-6 h-6 text-purple-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'captain_toad_minecart',
      title: "Captain Toad's Kasambahay Minecart",
      genre: 'Special Groups & R.A. 10361',
      desc: 'Steer Captain Toad’s headlamp cart through Batas Kasambahay rest periods, child labor hours, and PWD 100% minimum wage!',
      badge: 'R.A. 10361 / 9231',
      icon: <Compass className="w-6 h-6 text-amber-600" />,
      category: 'courtroom_tribunal',
    },
    {
      id: 'dry_bones_crypt',
      title: "Dry Bones' Prescription Crypt",
      genre: 'Prescriptive Periods & Safe Spaces',
      desc: 'Unlock ancient statutory crypts! Master 3-year money claims, 4-year illegal dismissal, R.A. 7877, and R.A. 11313 deadlines!',
      badge: 'ART. 305–306',
      icon: <ShieldAlert className="w-6 h-6 text-slate-700" />,
      category: 'courtroom_tribunal',
    },
  ];

  const filteredAndSortedGames = useMemo(() => {
    let result = [...games];

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.genre.toLowerCase().includes(q) ||
          g.desc.toLowerCase().includes(q) ||
          g.badge.toLowerCase().includes(q)
      );
    }

    if (worldFilter === 'favorites') {
      result = result.filter((g) => favoriteGames.includes(g.id));
    } else if (worldFilter !== 'world_all') {
      result = result.filter((g) => GAME_WORLD_MAPPING[g.id] === worldFilter);
    }

    if (genreFilter === 'pure_action') {
      result = result.filter((g) => PURE_ACTION_GAME_IDS.has(g.id));
    } else if (genreFilter !== 'all') {
      result = result.filter((g) => g.category === genreFilter);
    }

    if (sortBy === 'score') {
      result.sort((a, b) => {
        const scoreA = bestPlays.find((bp) => bp.gameId === a.id)?.bestScore || 0;
        const scoreB = bestPlays.find((bp) => bp.gameId === b.id)?.bestScore || 0;
        return scoreB - scoreA;
      });
    } else if (sortBy === 'plays') {
      result.sort((a, b) => {
        const playsA = bestPlays.find((bp) => bp.gameId === a.id)?.playsCount || 0;
        const playsB = bestPlays.find((bp) => bp.gameId === b.id)?.playsCount || 0;
        return playsB - playsA;
      });
    } else if (sortBy === 'stars') {
      result.sort((a, b) => getGameStarRating(b.id) - getGameStarRating(a.id));
    } else if (sortBy === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [games, searchTerm, worldFilter, genreFilter, sortBy, favoriteGames, bestPlays]);

  const activeGameIndex = Math.max(0, games.findIndex((gm) => gm.id === activeGame));
  const activeGameMeta = games[activeGameIndex] || games[0];

  const handleStepGame = (delta: number) => {
    const pool = filteredAndSortedGames.length > 0 ? filteredAndSortedGames : games;
    const currentIdxInPool = pool.findIndex((gm) => gm.id === activeGame);
    const safeIdx = currentIdxInPool >= 0 ? currentIdxInPool : 0;
    const nextIdx = (safeIdx + delta + pool.length) % pool.length;
    setActiveGame(pool[nextIdx].id);
    marioAudio.playPipe();
  };

  const recentGamesHistoryRef = useRef<string[]>([]);
  const randomBagRef = useRef<string[]>([]);

  // High-entropy random integer using crypto API when available, falling back to Math.random
  const cryptoRandInt = (max: number): number => {
    if (max <= 0) return 0;
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const arr = new Uint32Array(1);
      crypto.getRandomValues(arr);
      return arr[0] % max;
    }
    return Math.floor(Math.random() * max);
  };

  const handleRandomGame = () => {
    if (games.length <= 1) return;

    // Filter current bag to only valid games in the active view, excluding currently active game
    let bag = randomBagRef.current.filter(
      (id) => games.some((g) => g.id === id) && id !== activeGame
    );

    if (bag.length === 0) {
      // Re-fill with crypto-grade Fisher-Yates shuffle, excluding active and recently played games
      const recentWindow = Math.min(Math.floor(games.length * 0.5), 15);
      const recentSet = new Set(recentGamesHistoryRef.current.slice(-recentWindow));
      const candidates = games
        .map((g) => g.id)
        .filter((id) => id !== activeGame && !recentSet.has(id));

      const pool =
        candidates.length >= 2
          ? candidates
          : games.map((g) => g.id).filter((id) => id !== activeGame);

      const copy = [...pool];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = cryptoRandInt(i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      bag = copy;
    }

    const chosenId =
      bag.shift() || games[(activeGameIndex + 1) % games.length].id;
    randomBagRef.current = bag;
    recentGamesHistoryRef.current = [
      ...recentGamesHistoryRef.current.slice(-40),
      chosenId,
    ];

    setActiveGame(chosenId as VaultGameId);
    marioAudio.playPowerUp();
  };

  return (
    <div className="space-y-2 sm:space-y-5 max-w-6xl mx-auto w-full min-w-0 px-1 sm:px-2 pb-28 sm:pb-12">
      {/* Game Vault Hero Banner (Single-row compact bar by default on phones so game fits screen immediately) */}
      <div className="bg-[#1e293b] text-white rounded-2xl sm:rounded-3xl p-2 sm:p-6 mario-card border-3 sm:border-4 border-slate-950 shadow-[4px_4px_0_#000] sm:shadow-[5px_5px_0_#000]">
        {compactVaultHeader ? (
          <div className="flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
                <MarioCharacterAvatar character={equippedAvatar} className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[8.5px] sm:text-[9px] font-black uppercase text-amber-400 font-mario block truncate leading-tight">
                  {games.length} GAMES
                </span>
                <span className="text-[11px] sm:text-xs font-black font-display text-white block truncate leading-tight">
                  {heroMeta.shortName || heroMeta.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <button
                type="button"
                data-testid="open-game-doctrines-btn"
                onClick={() => {
                  setShowDoctrineModal(true);
                  marioAudio.playPowerUp();
                }}
                className="min-h-[38px] sm:min-h-[40px] px-2 sm:px-2.5 inline-flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl border-2 border-black text-[10.5px] sm:text-[11px] cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">Rules</span>
                <span className="hidden sm:inline">Doctrines</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowHeroPicker((v) => !v);
                  marioAudio.playJump();
                }}
                className="min-h-[38px] sm:min-h-[40px] px-2 sm:px-2.5 inline-flex items-center justify-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black text-[10.5px] sm:text-[11px] cursor-pointer whitespace-nowrap"
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>{showHeroPicker ? 'Close' : 'Heroes'}</span>
              </button>
              <button
                type="button"
                aria-label="Expand Arcade Banner"
                onClick={() => setCompactVaultHeader(false)}
                className="min-h-[38px] sm:min-h-[40px] px-1.5 sm:px-2 inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-600 cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 bg-amber-400 rounded-2xl border-3 border-black flex items-center justify-center shadow-[0_3px_0_#000] shrink-0">
                <Gamepad2 className="w-7 h-7 text-slate-950" />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-600 text-white font-black rounded-lg border border-black text-[10px] uppercase font-mario leading-relaxed mb-1">
                  <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                  <span>{games.length} PLAYABLE ARCADE GAMES • {HERO_ROSTER.length} HEROES</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white font-display tracking-tight">
                  MARIO LABOR LAW GAME VAULT
                </h1>
                <p className="text-xs sm:text-sm font-bold text-slate-300 max-w-xl">
                  Play {games.length} interactive games covering Worlds 1–6, spend or multiply coins in Toad&apos;s Treasury, and equip any of the {HERO_ROSTER.length} Mushroom Kingdom heroes!
                </p>
              </div>
            </div>

            {/* Equipped Hero Quick Switcher & Read Doctrines Button */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full xl:w-auto shrink-0">
              <button
                type="button"
                data-testid="open-game-doctrines-btn"
                onClick={() => {
                  setShowDoctrineModal(true);
                  marioAudio.playPowerUp();
                }}
                className="min-h-[44px] px-4 inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl border-2 border-black text-xs cursor-pointer shadow-[0_3px_0_#000] font-mario active:translate-y-0.5"
              >
                <BookOpen className="w-4 h-4 text-slate-950 shrink-0" />
                <span>READ DOCTRINES &amp; Q&amp;A</span>
              </button>

              <div className="flex items-center justify-between sm:justify-start gap-2.5 bg-slate-900 border-2 border-amber-400 rounded-2xl p-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 bg-amber-400 rounded-xl border-2 border-black flex items-center justify-center shrink-0">
                    <MarioCharacterAvatar character={equippedAvatar} className="w-7 h-7" />
                  </div>
                  <div className="pr-1 min-w-0">
                    <span className="text-[9px] font-black font-mario text-amber-400 uppercase block">
                      ACTIVE HERO
                    </span>
                    <span className="text-xs font-black font-display text-white block truncate">
                      {heroMeta.name}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowHeroPicker((v) => !v);
                    marioAudio.playJump();
                  }}
                  className="min-h-[40px] px-3.5 inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl border-2 border-black text-xs cursor-pointer leading-none whitespace-nowrap shrink-0"
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>{showHeroPicker ? 'Close' : `${HERO_ROSTER.length} Heroes`}</span>
                </button>
                <button
                  type="button"
                  aria-label="Compact Arcade Banner"
                  title="Compact Header"
                  onClick={() => setCompactVaultHeader(true)}
                  className="min-h-[40px] px-2 inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-600 cursor-pointer shrink-0"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instant 34-Hero Picker Drawer */}
        {showHeroPicker && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-slate-700 grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2 max-h-[280px] overflow-y-auto pr-1">
            {HERO_ROSTER.map((h) => {
              const active = equippedAvatar === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    setEquippedAvatar(h.id);
                    try {
                      localStorage.setItem('mario_equipped_avatar', h.id);
                    } catch {
                      // ignore
                    }
                    marioAudio.playCoin();
                  }}
                  className={`min-h-[60px] p-1.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <MarioCharacterAvatar character={h.id} className="w-6 h-6 shrink-0" />
                  <span className="text-[10px] font-black truncate max-w-full">{h.shortName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Compact Top Dropdown Game Chooser + Prev / Next / Random Switcher */}
      <div
        data-testid="vault-quick-switcher"
        className="bg-[#0f172a] border-2 border-slate-800 rounded-2xl p-2 sm:p-4 space-y-1.5 sm:space-y-2.5 w-full max-w-full min-w-0"
      >
        <div className="flex items-center justify-between gap-2 min-w-0">
          <label
            htmlFor="arcade-game-chooser-select"
            className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400 font-mario tracking-wide shrink-0"
          >
            GAME {activeGameIndex + 1}/{games.length}
          </label>
          <div className="text-[11px] sm:text-xs font-bold text-slate-300 truncate min-w-0">
            {activeGameMeta.genre} · <span className="text-emerald-300">{activeGameMeta.badge}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full min-w-0">
          <div className="flex items-center gap-1.5 flex-1 min-w-0 w-full">
            <select
              id="arcade-game-chooser-select"
              data-testid="arcade-game-chooser-dropdown"
              aria-label="Choose Arcade Game"
              value={activeGame}
              onChange={(e) => {
                setActiveGame(e.target.value as VaultGameId);
                marioAudio.playPipe();
              }}
              className="w-full min-w-0 max-w-full truncate min-h-[42px] sm:min-h-[44px] px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm border-2 border-amber-400 shadow-[0_2px_0_#000] cursor-pointer focus:outline-hidden"
            >
              {GAME_CATEGORY_META.map((cat) => {
                const catGames = games.filter((gm) => gm.category === cat.id);
                return (
                  <optgroup key={cat.id} label={`${cat.label} (${catGames.length})`}>
                    {catGames.map((gm) => (
                      <option key={`opt-${gm.id}`} value={gm.id}>
                        {favoriteGames.includes(gm.id) ? '★ ' : ''}
                        {PURE_ACTION_GAME_IDS.has(gm.id) ? '[ACTION] ' : ''}{gm.title} — {gm.genre} [{gm.badge}]
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>

            <button
              type="button"
              data-testid="arcade-toggle-active-favorite-btn"
              onClick={() => handleToggleFavorite(activeGame)}
              title={favoriteGames.includes(activeGame) ? 'Remove from Starred Favorites' : 'Add to Starred Favorites'}
              className={`min-h-[42px] sm:min-h-[44px] min-w-[42px] sm:min-w-[44px] px-2.5 rounded-xl border-2 border-black inline-flex items-center justify-center cursor-pointer shadow-[0_2px_0_#000] transition-colors shrink-0 ${
                favoriteGames.includes(activeGame)
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300'
              }`}
            >
              <Star
                className={`w-4 h-4 ${favoriteGames.includes(activeGame) ? 'fill-current' : ''}`}
              />
            </button>
          </div>

          <div className="grid grid-cols-3 md:flex items-center gap-1.5 sm:gap-2 shrink-0 w-full md:w-auto">
            <button
              type="button"
              data-testid="arcade-prev-game-btn"
              onClick={() => handleStepGame(-1)}
              aria-label="Previous Arcade Game"
              className="flex-1 md:flex-initial min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-black text-xs border-2 border-black inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Prev</span>
            </button>
            <button
              type="button"
              data-testid="arcade-next-game-btn"
              onClick={() => handleStepGame(1)}
              aria-label="Next Arcade Game"
              className="flex-1 md:flex-initial min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-black text-xs border-2 border-black inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 text-amber-300 shrink-0" />
            </button>
            <button
              type="button"
              data-testid="arcade-random-game-btn"
              onClick={handleRandomGame}
              aria-label="Pick Random Arcade Game"
              className="flex-1 md:flex-initial min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border-2 border-black shadow-[0_2px_0_#000] inline-flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5 shrink-0" />
              <span>Random</span>
            </button>
          </div>
        </div>

        {/* Deck Set Selector & Board Configuration Sub-bar */}
        <div
          data-testid="arcade-match-config-bar"
          className="pt-2 border-t border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 text-xs w-full min-w-0"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2 flex-1 min-w-0 w-full">
            <div className="flex items-center gap-1.5 min-w-0 flex-1 w-full sm:w-auto">
              <span className="font-mario text-[10px] text-amber-300 uppercase shrink-0 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>PLAY SET:</span>
              </span>
              <select
                data-testid="arcade-deck-set-select"
                aria-label="Select Game Deck Set"
                value={activeDeckSet}
                onChange={(e) => {
                  setActiveDeckSet(e.target.value as GameDeckSetId);
                  marioAudio.playPipe();
                  const foundSet = GAME_DECK_SETS.find((s) => s.id === e.target.value);
                  if (foundSet) {
                    spawnFloatingPopup(foundSet.badge, 'amber', foundSet.tagline);
                  }
                }}
                className="w-full min-w-0 max-w-full truncate min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-300 font-bold text-xs cursor-pointer focus:outline-hidden"
              >
                {GAME_DECK_SETS.map((ds) => (
                  <option key={ds.id} value={ds.id}>
                    {ds.label} — [{ds.badge}]
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 min-w-0 w-full sm:w-auto">
              <span className="font-mario text-[10px] text-slate-400 uppercase shrink-0">
                ROUNDS:
              </span>
              <select
                data-testid="arcade-board-length-select"
                aria-label="Select Match Length"
                value={activeBoardLength}
                onChange={(e) => {
                  setActiveBoardLength(e.target.value as ArcadeBoardLengthId);
                  marioAudio.playClick();
                }}
                className="w-full sm:w-auto min-w-0 max-w-full truncate min-h-[34px] px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 font-bold text-xs cursor-pointer focus:outline-hidden"
              >
                {ARCADE_BOARD_LENGTHS.map((bl) => (
                  <option key={bl.id} value={bl.id}>
                    {bl.label} ({bl.badge})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              data-testid="arcade-sound-toggle-btn"
              onClick={() => {
                const isNowEnabled = marioAudio.toggleMute();
                setArcadeAudioMuted(!isNowEnabled);
              }}
              title={arcadeAudioMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="min-h-[34px] px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
            >
              {arcadeAudioMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                  <span>Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sound ON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Arcade Coin Boost Bar — Spend Coins or Shop Tokens Directly Inside Arcade */}
        <div
          data-testid="arcade-coin-boost-bar"
          className="pt-3 border-t-2 border-amber-400/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full min-w-0 bg-slate-950/70 p-3 rounded-2xl border border-slate-800"
        >
          <div className="flex items-center gap-2 text-xs font-black text-amber-300 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
              <Zap className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mario text-[11px] uppercase tracking-wider text-amber-300">
                  ARCADE POWER-UPS:
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-mono font-black inline-flex items-center gap-1">
                  <MarioCoinIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>x{coins}</span>
                </span>
              </div>
              {boostNotice ? (
                <span className="text-emerald-300 font-semibold text-[11px] block animate-pulse">
                  {boostNotice}
                </span>
              ) : (
                <span className="text-slate-400 text-[10px] hidden sm:block">
                  Click power-up or press keys <kbd className="px-1 py-0.5 bg-slate-800 rounded text-amber-200">[1]</kbd> to <kbd className="px-1 py-0.5 bg-slate-800 rounded text-amber-200">[5]</kbd> anytime!
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 max-w-full no-scrollbar flex-wrap">
            <button
              type="button"
              data-testid="arcade-boost-2x-btn"
              onClick={handleActivate2xBoost}
              disabled={doublePayoutActive || (vaultTokens.inventory.arcade2x <= 0 && coins < 15)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-black border-2 flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_2px_0_#000] active:translate-y-0.5 whitespace-nowrap shrink-0 ${
                doublePayoutActive
                  ? 'bg-emerald-400 text-slate-950 border-black shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-400/80 disabled:opacity-40'
              }`}
            >
              <MarioCoinIcon className="w-4 h-4 shrink-0" />
              <span>
                {doublePayoutActive
                  ? '2x Payout ON'
                  : vaultTokens.inventory.arcade2x > 0
                  ? `2x Ticket (${vaultTokens.inventory.arcade2x})`
                  : '2x Payout (15c)'}
              </span>
              <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-200 font-mono">1</kbd>
            </button>
            <button
              type="button"
              data-testid="arcade-boost-shield-btn"
              onClick={handleActivateShieldBoost}
              disabled={bonusShieldActive || (vaultTokens.inventory.arcadeShield <= 0 && coins < 15)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-black border-2 flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_2px_0_#000] active:translate-y-0.5 whitespace-nowrap shrink-0 ${
                bonusShieldActive
                  ? 'bg-sky-400 text-slate-950 border-black shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                  : 'bg-slate-900 hover:bg-slate-800 text-sky-300 border-sky-400/80 disabled:opacity-40'
              }`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                {bonusShieldActive
                  ? 'Extra Armor ON'
                  : vaultTokens.inventory.arcadeShield > 0
                  ? `Armor (${vaultTokens.inventory.arcadeShield})`
                  : 'Extra Armor (15c)'}
              </span>
              <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-black/40 text-sky-200 font-mono">2</kbd>
            </button>
            <button
              type="button"
              data-testid="arcade-boost-magnet-btn"
              onClick={handleToggleOrBuyCoinMagnet}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-black border-2 inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_2px_0_#000] active:translate-y-0.5 whitespace-nowrap shrink-0 ${
                coinMagnetActive
                  ? 'bg-amber-400 text-slate-950 border-black shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-200 border-amber-400/80'
              }`}
            >
              <Magnet className="w-4 h-4 shrink-0" />
              <span>{coinMagnetActive ? 'Coin Magnet ON' : 'Coin Magnet (20c)'}</span>
              <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-200 font-mono">3</kbd>
            </button>
            <button
              type="button"
              data-testid="arcade-boost-frenzy-btn"
              onClick={handleChargeFrenzy}
              disabled={coins < 10 || frenzyActive}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-black border-2 inline-flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_2px_0_#000] active:translate-y-0.5 whitespace-nowrap shrink-0 ${
                frenzyActive
                  ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300 text-slate-950 border-white animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-400/80 disabled:opacity-40'
              }`}
            >
              <Zap className="w-4 h-4 shrink-0" />
              <span>{frenzyActive ? `Frenzy 3x (${frenzySeconds}s)` : `Charge Frenzy (${frenzyMeter}% · 10c)`}</span>
              <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-200 font-mono">4</kbd>
            </button>
            <button
              type="button"
              data-testid="arcade-boost-radar-btn"
              onClick={handleBuyRadarCharge}
              disabled={coins < 10}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-black border-2 bg-slate-900 hover:bg-slate-800 text-emerald-300 border-emerald-400/80 disabled:opacity-40 cursor-pointer shadow-[0_2px_0_#000] active:translate-y-0.5 whitespace-nowrap shrink-0"
            >
              +2 Radars (10c · {vaultTokens.inventory.arcadeRadar})
              <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-black/40 text-emerald-200 font-mono ml-1">5</kbd>
            </button>
            <button
              type="button"
              data-testid="arcade-instant-replay-btn"
              onClick={() => {
                setReplayNonce((n) => n + 1);
                marioAudio.playPipe();
              }}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-black border-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-black inline-flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000] active:translate-y-0.5 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Restart</span>
              <kbd className="hidden lg:inline text-[9px] px-1 py-0.2 rounded bg-black/40 text-emerald-950 font-mono">R</kbd>
            </button>
          </div>
        </div>
      </div>

      {/* My Best Plays (Hall of Fame) Persistent High-Score & Instant 1-Click Replay Strip */}
      <div
        data-testid="arcade-best-plays-panel"
        className="bg-[#0f172a] border-2 border-amber-400/50 rounded-2xl p-3 sm:p-4 text-white transition-all shadow-[2px_2px_0_#000]"
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400 border border-black flex items-center justify-center text-slate-950 shrink-0 shadow-xs">
              <Trophy className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-amber-300 font-mario block leading-tight">
                MY BEST PLAYS ({bestPlays.length} RECORDED)
              </span>
              <span className="text-[11px] text-slate-400 font-semibold block">
                {showBestPlays
                  ? 'Your personal high-score records & 1-click replay shortcuts'
                  : 'High-score records are saved. Press P or click to show.'}
              </span>
            </div>
          </div>

          <button
            type="button"
            data-testid="toggle-best-plays-btn"
            onClick={() => {
              setShowBestPlays((v) => !v);
              marioAudio.playClick();
            }}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-black border-2 border-black cursor-pointer shadow-[0_2px_0_#000] inline-flex items-center gap-2 active:translate-y-0.5 transition-colors whitespace-nowrap ${
              showBestPlays
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span>{showBestPlays ? 'Hide Best Plays' : 'Show Best Plays'}</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold bg-black/20 rounded border border-black/30">
              P
            </kbd>
          </button>
        </div>

        {showBestPlays && (
          <div className="pt-3 border-t border-slate-800 mt-2.5 space-y-2">
            {bestPlays.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-1">
                Play any of the {games.length} Arcade Games above to record your personal high scores, coins won, and 1-click Replay shortcuts here!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 p-1 overflow-visible">
                {bestPlays.slice(0, 8).map((bp) => (
                  <div
                    key={bp.gameId}
                    className="bg-slate-900 border border-slate-700 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow-[2px_2px_0_#000]"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-white truncate">{bp.gameTitle}</div>
                      <div className="text-[11px] font-mono font-bold text-emerald-300 tabular-nums">
                        Best {bp.bestScore} pts · +{bp.bestCoins}c · {bp.playsCount}x
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGame(bp.gameId as VaultGameId);
                        setReplayNonce((n) => n + 1);
                        marioAudio.playPipe();
                      }}
                      className="min-h-[34px] px-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] border border-black shrink-0 cursor-pointer shadow-[0_2px_0_#000] active:translate-y-0.5"
                    >
                      Replay
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Retro Arcade Cabinet Frame & Active Game Stage */}
      <div
        data-testid="arcade-cabinet-frame"
        data-card-frame={equippedCardFrame}
        className={`relative rounded-2xl sm:rounded-3xl transition-all duration-300 ${
          frenzyActive
            ? 'border-3 sm:border-4 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)] bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950'
            : hasCustomFrame
            ? `${resolvedUniversalFrame.borderClasses} bg-slate-950`
            : 'border-3 sm:border-4 border-slate-950 shadow-[4px_4px_0_#000] bg-slate-950'
        } p-2.5 sm:p-4 pb-8 sm:pb-10 space-y-3 overflow-visible`}
      >
        {/* Arcade Cabinet Marquee Header Bar */}
        <div
          data-testid="arcade-cabinet-marquee"
          className="bg-slate-900 border-2 border-slate-800 rounded-xl sm:rounded-2xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2"
        >
          {/* Active Game Info & 3-Star Rating */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 border border-black shadow-[0_1px_0_#000]">
              {activeGameMeta.icon}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] sm:text-xs font-black font-display text-white truncate">
                  {activeGameMeta.title}
                </span>
                <span className="text-[8.5px] font-black font-mario px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 uppercase shrink-0">
                  {activeGameMeta.badge}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={starIdx}
                    className={`w-3 h-3 ${
                      getGameStarRating(activeGame) >= starIdx
                        ? 'fill-amber-400 text-amber-500'
                        : 'fill-slate-800 text-slate-700'
                    }`}
                  />
                ))}
                <span className="text-[9.5px] font-black font-mono text-amber-300 ml-0.5">
                  {getGameStarRating(activeGame)}/3 Stars
                </span>
              </div>
            </div>
          </div>

          {/* Super Star Frenzy Gauge & Quick Controls */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Frenzy Meter Gauge */}
            <div
              data-testid="arcade-frenzy-meter"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-colors ${
                frenzyActive
                  ? 'bg-amber-400/20 border-amber-400 text-amber-300 animate-pulse'
                  : 'bg-slate-950 border-slate-700 text-slate-300'
              }`}
            >
              <Flame
                className={`w-3.5 h-3.5 shrink-0 ${
                  frenzyActive ? 'text-amber-400 animate-bounce' : 'text-slate-500'
                }`}
              />
              <div className="flex flex-col">
                <div className="flex items-center justify-between gap-2 text-[9px] font-black font-mario">
                  <span>{frenzyActive ? `FRENZY x3 (${frenzySeconds}s)` : 'STAR FRENZY'}</span>
                  <span>{frenzyActive ? 'MAX' : `${Math.round(frenzyMeter)}%`}</span>
                </div>
                <div className="w-20 sm:w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 mt-0.5">
                  <div
                    className={`h-full transition-all duration-300 ${
                      frenzyActive
                        ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300'
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${frenzyActive ? 100 : frenzyMeter}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Retro CRT Toggle */}
            <button
              type="button"
              data-testid="arcade-crt-toggle-btn"
              onClick={() => {
                setCrtScanlines((v) => !v);
                marioAudio.playClick();
              }}
              title="Toggle Retro CRT Scanlines & Screen Glow"
              className={`min-h-[34px] px-2 rounded-xl text-[10.5px] font-black border inline-flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap ${
                crtScanlines
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Tv className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">CRT FX</span>
            </button>

            {/* Quick Restart [R] */}
            <button
              type="button"
              data-testid="arcade-quick-restart-btn"
              onClick={() => {
                setReplayNonce((n) => n + 1);
                marioAudio.playPipe();
                spawnFloatingPopup('QUICK RESTART!', 'amber', 'Ready!');
              }}
              title="Quick Restart (Hotkey: R)"
              className="min-h-[34px] px-2.5 rounded-xl text-[10.5px] font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-black inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Retry<span className="hidden sm:inline font-mono ml-1 text-xs">[R]</span></span>
            </button>

            {/* Random Game */}
            <button
              type="button"
              data-testid="arcade-marquee-random-btn"
              onClick={handleRandomGame}
              title="Shuffle Random Game"
              className="min-h-[34px] px-2 rounded-xl text-[10.5px] font-black bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <Shuffle className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>
          </div>
        </div>

        {/* Active Game Surface Inside Cabinet Frame */}
        <div
          id="active-vault-game-stage"
          key={`${activeGame}-${replayNonce}`}
          className="relative z-10 select-none w-full max-w-full min-w-0 overflow-visible rounded-xl sm:rounded-2xl p-1 sm:p-2 pb-5 sm:pb-7"
          onContextMenu={(e) => e.preventDefault()}
        >
          {/* Floating Popups Overlay - Positioned safely at top so questions and controls are never covered */}
          {floatingPopups.length > 0 && (
            <div
              data-testid="arcade-floating-popups"
              className="pointer-events-none absolute top-3 inset-x-0 z-50 flex flex-col items-center justify-start gap-2 overflow-visible"
            >
              {floatingPopups.map((p) => (
                <div
                  key={p.id}
                  className={`animate-bounce px-4 py-2 rounded-2xl border-2 border-black font-mario shadow-[0_4px_0_#000] text-center ${
                    p.color === 'rainbow'
                      ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-yellow-300 text-slate-950'
                      : 'bg-amber-400 text-slate-950'
                  }`}
                >
                  <div className="text-base sm:text-xl font-black tracking-wider uppercase drop-shadow-sm">
                    {p.text}
                  </div>
                  {p.subText && (
                    <div className="text-[10px] font-extrabold uppercase tracking-wide opacity-90">
                      {p.subText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Retro CRT Scanlines Overlay */}
          {crtScanlines && (
            <div
              data-testid="arcade-crt-overlay"
              className="pointer-events-none absolute inset-0 z-40 rounded-xl"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 1px, transparent 1px, transparent 3px)',
                boxShadow: 'inset 0 0 45px rgba(0,0,0,0.7)',
              }}
            />
          )}

          {/* Active Set, Rounds & Multiplier HUD Banner */}
          {(() => {
            const currentSetMeta =
              GAME_DECK_SETS.find((s) => s.id === activeDeckSet) || GAME_DECK_SETS[0];
            const currentBoardMeta =
              ARCADE_BOARD_LENGTHS.find((b) => b.id === activeBoardLength) ||
              ARCADE_BOARD_LENGTHS[1];
            return (
              <div
                data-testid="active-arcade-set-banner"
                className="bg-slate-950/95 border-b-2 border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs flex-wrap gap-2 z-20 select-none"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mario bg-gradient-to-r ${currentSetMeta.color} text-slate-950 shadow-xs shrink-0`}
                  >
                    {currentSetMeta.badge}
                  </span>
                  <span className="text-[11px] text-amber-200 font-bold truncate">
                    {currentSetMeta.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold font-mono">
                    {currentBoardMeta.badge} ({currentBoardMeta.bonusMultiplier}x REWARDS)
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Dedicated High-Visibility Pinned Power-Up Command Dock (Directly Above Active Game) */}
          <div
            data-testid="stage-pinned-powerup-dock"
            className="bg-slate-950/98 border-b-3 border-amber-400 px-3 py-2 flex items-center justify-between gap-2 flex-wrap z-20 shadow-lg select-none"
          >
            <div className="flex items-center gap-2">
              <span className="font-mario text-[10px] text-amber-300 font-black flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                POWER-UPS:
              </span>
              <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/40 inline-flex items-center gap-1">
                <MarioCoinIcon className="w-3.5 h-3.5 shrink-0" />
                <span>x{coins}</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* 2x Payout */}
              <button
                type="button"
                data-testid="stage-dock-2x-btn"
                onClick={handleActivate2xBoost}
                disabled={doublePayoutActive || (vaultTokens.inventory.arcade2x <= 0 && coins < 15)}
                title="Press [1] to activate 2x Coins"
                className={`min-h-[34px] px-2.5 py-1 rounded-xl text-[11px] font-black border-2 flex items-center gap-1 cursor-pointer transition-all active:translate-y-0.5 whitespace-nowrap shrink-0 shadow-xs ${
                  doublePayoutActive
                    ? 'bg-emerald-400 text-slate-950 border-black shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-400/80 disabled:opacity-30'
                }`}
              >
                <MarioCoinIcon className="w-3.5 h-3.5 shrink-0" />
                <span>{doublePayoutActive ? '2x ON' : vaultTokens.inventory.arcade2x > 0 ? `2x Ticket (${vaultTokens.inventory.arcade2x})` : '2x Coins (15c)'}</span>
                <kbd className="hidden sm:inline-block text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-200 font-mono">1</kbd>
              </button>

              {/* Extra Armor / Shield */}
              <button
                type="button"
                data-testid="stage-dock-shield-btn"
                onClick={handleActivateShieldBoost}
                disabled={bonusShieldActive || (vaultTokens.inventory.arcadeShield <= 0 && coins < 15)}
                title="Press [2] to activate Extra Armor"
                className={`min-h-[34px] px-2.5 py-1 rounded-xl text-[11px] font-black border-2 flex items-center gap-1 cursor-pointer transition-all active:translate-y-0.5 whitespace-nowrap shrink-0 shadow-xs ${
                  bonusShieldActive
                    ? 'bg-sky-400 text-slate-950 border-black shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                    : 'bg-slate-900 hover:bg-slate-800 text-sky-300 border-sky-400/80 disabled:opacity-30'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{bonusShieldActive ? 'Armor ON' : vaultTokens.inventory.arcadeShield > 0 ? `Armor (${vaultTokens.inventory.arcadeShield})` : 'Armor (15c)'}</span>
                <kbd className="hidden sm:inline-block text-[9px] px-1 py-0.2 rounded bg-black/40 text-sky-200 font-mono">2</kbd>
              </button>

              {/* Coin Magnet */}
              <button
                type="button"
                data-testid="stage-dock-magnet-btn"
                onClick={handleToggleOrBuyCoinMagnet}
                title="Press [3] to toggle Coin Magnet"
                className={`min-h-[34px] px-2.5 py-1 rounded-xl text-[11px] font-black border-2 inline-flex items-center gap-1 cursor-pointer transition-all active:translate-y-0.5 whitespace-nowrap shrink-0 shadow-xs ${
                  coinMagnetActive
                    ? 'bg-amber-400 text-slate-950 border-black shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-200 border-amber-400/80'
                }`}
              >
                <Magnet className="w-3.5 h-3.5 shrink-0" />
                <span>{coinMagnetActive ? 'Magnet ON' : 'Magnet (20c)'}</span>
                <kbd className="hidden sm:inline-block text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-200 font-mono">3</kbd>
              </button>

              {/* Star Frenzy */}
              <button
                type="button"
                data-testid="stage-dock-frenzy-btn"
                onClick={handleChargeFrenzy}
                disabled={coins < 10 || frenzyActive}
                title="Press [4] to charge Frenzy meter"
                className={`min-h-[34px] px-2.5 py-1 rounded-xl text-[11px] font-black border-2 inline-flex items-center gap-1 cursor-pointer transition-all active:translate-y-0.5 whitespace-nowrap shrink-0 shadow-xs ${
                  frenzyActive
                    ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-amber-300 text-slate-950 border-white animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-400/80 disabled:opacity-30'
                }`}
              >
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span>{frenzyActive ? `Frenzy (${frenzySeconds}s)` : `Frenzy (${frenzyMeter}% · 10c)`}</span>
                <kbd className="hidden sm:inline-block text-[9px] px-1 py-0.2 rounded bg-black/40 text-amber-200 font-mono">4</kbd>
              </button>

              {/* Instant Restart */}
              <button
                type="button"
                data-testid="stage-dock-restart-btn"
                onClick={() => {
                  setReplayNonce((n) => n + 1);
                  marioAudio.playPipe();
                }}
                title="Press [R] to restart active game"
                className="min-h-[34px] px-2.5 py-1 rounded-xl text-[11px] font-black border-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-black inline-flex items-center gap-1 cursor-pointer active:translate-y-0.5 whitespace-nowrap shrink-0 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>Restart</span>
                <kbd className="hidden sm:inline-block text-[9px] px-1 py-0.2 rounded bg-black/40 text-emerald-950 font-mono">R</kbd>
              </button>
            </div>
          </div>

        {activeGame === 'coin_rush' && (
          <CoinRushArcadeGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'pipe_whack_violation' && (
          <WarpPipeWhackAViolationGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'yoshi_egg_catch' && (
          <YoshiEggCatchDropGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'luigi_ghost_clause' && (
          <LuigiGhostClauseFlashlightGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'kart_wage_drift' && (
          <MarioKartWageOrderDriftGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'toad_conveyor_sorter' && (
          <ToadConveyorWageSorterGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'bowser_axe_timing' && (
          <BowserBridgeAxeTimingGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'peach_block_match' && (
          <PeachMysteryBlockPairMatchGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'chomp_tug_of_war' && (
          <ChainChompTugOfWarGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            coinMagnetActive={coinMagnetActive}
            onRecordBestPlay={handleRecordBestPlay}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'skybridge_dash' && (
          <LakituSkybridgeDashGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'payroll_stamp_desk' && (
          <DolePayrollStampDeskGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'union_tower_defense' && (
          <MushroomUnionTowerDefenseGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'koopa_pinball' && (
          <KoopaPinballBumperArenaGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'codal_word_hunt' && (
          <BarCodalWordHuntGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'commissioner_sim' && (
          <LaborCommissionerBalanceSimGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            boosts={{
              doublePayoutActive,
              bonusShieldActive,
              radarCharges: vaultTokens.inventory.arcadeRadar,
              onConsumeRadar: handleConsumeRadar,
            }}
          />
        )}
        {activeGame === 'courtroom' && (
          <CourtroomBossBattle
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'pipe_sorter' && (
          <WarpPipeSorter equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'catcher' && (
          <LawCatcherGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'kart' && (
          <LaborKart equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'run2d' && (
          <Game2D equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'island3d' && (
          <Game3D equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'whack' && (
          <WhackAGoombaGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'memory' && (
          <MultiplierMemoryGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'mansion' && (
          <ContractorBusterGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'bridge' && (
          <BowsersBridgeGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'sorter' && (
          <HolidayWageSorterGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'toad_slots' && (
          <ToadHouseCoinSlots
            equippedAvatar={equippedAvatar}
            coins={coins}
            onAdjustCoins={handleAdjustCoins}
          />
        )}
        {activeGame === 'world6_clinic' && (
          <World6LeaveMatcherGame
            equippedAvatar={equippedAvatar}
            coins={coins}
            onAdjustCoins={handleAdjustCoins}
          />
        )}
        {activeGame === 'lakitu_climber' && (
          <LakituCloudClimberGame
            equippedAvatar={equippedAvatar}
            coins={coins}
            onAdjustCoins={handleAdjustCoins}
          />
        )}
        {activeGame === 'koopa_breaker' && (
          <KoopaBrickBreakerGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'yoshi_toss' && (
          <YoshiEggTossGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'boo_burden' && (
          <BooBurdenMansionGame equippedAvatar={equippedAvatar} onEarnCoins={handleEarnCoins} />
        )}
        {activeGame === 'chrono_blitz' && (
          <ChronoPrescriptionBlitzGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'hammer_blitz' && (
          <HammerBrosPayrollBlitzGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'toadette_relay' && (
          <ToadetteDueProcessRelayGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'shy_conveyor' && (
          <ShyGuyWageOrderFactoryGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'kamek_duel' && (
          <KamekDeadlineSpellbookGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
          />
        )}
        {activeGame === 'yoshi_overtime' && (
          <YoshiOvertimeExpressGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'luigi_nightshift' && (
          <LuigiNightShiftPoltergustGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'rosalina_observatory' && (
          <RosalinaWageObservatoryGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'peach_dispatch' && (
          <PeachRoyalLeaveDispatchGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'wario_vault' && (
          <WarioDeductionVaultGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'toadsworth_tribunal' && (
          <ToadsworthRetirementTribunalGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'captain_toad_minecart' && (
          <CaptainToadMinecartGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'daisy_holiday_derby' && (
          <DaisyHolidayDerbyGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'dry_bones_crypt' && (
          <DryBonesCryptGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        {activeGame === 'pauline_wage_concert' && (
          <PaulineWageConcertGame
            equippedAvatar={equippedAvatar}
            onEarnCoins={handleEarnCoins}
            onQuizCompleted={onQuizCompleted}
          />
        )}
        </div>

        {/* Persistent Bottom Arcade Command Dock: Guarantees Replay, Reset, & Controls Are NEVER Covered or Clipped */}
        <div
          data-testid="arcade-cabinet-bottom-dock"
          className="bg-slate-900/95 border-2 border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5 mt-2 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="arcade-dock-replay-btn"
              onClick={() => {
                setReplayNonce((n) => n + 1);
                marioAudio.playPipe();
                spawnFloatingPopup('QUICK RESTART!', 'amber', 'Ready!');
              }}
              className="min-h-[44px] px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black rounded-xl border-2 border-black font-mario text-xs flex items-center gap-2 cursor-pointer shadow-[0_3px_0_#000] transition-all"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>REPLAY GAME<span className="hidden sm:inline font-mono ml-1 text-xs">[R]</span></span>
            </button>

            <button
              type="button"
              data-testid="arcade-dock-shuffle-btn"
              onClick={handleRandomGame}
              className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-black rounded-xl border border-slate-700 font-mario text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Shuffle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">NEXT RANDOM GAME</span>
              <span className="sm:hidden">SHUFFLE</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCrtScanlines((v) => !v);
                marioAudio.playClick();
              }}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer transition-colors ${
                crtScanlines
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Tv className="w-4 h-4 shrink-0" />
              <span>CRT {crtScanlines ? 'ON' : 'OFF'}</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Cabinet Dock: Controls, Replay &amp; Audio Always Accessible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Arcade Search, World Navigation & Filter Command Center */}
      <div
        data-testid="arcade-search-filter-command-center"
        className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3"
      >
        {/* Row 1: Search Input + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              aria-label="Search Arcade Games"
              placeholder="Search 47 games (e.g. Overtime, Maternity, Contractor, Bowser, Drift)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-[42px] pl-9 pr-8 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400 text-white placeholder-slate-400 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-amber-400 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Clear Search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <CloseXIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">SORT:</span>
            </div>
            <select
              aria-label="Sort Arcade Games"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="min-h-[42px] px-3 rounded-xl bg-slate-950 border border-slate-700 hover:border-amber-400 text-amber-300 font-bold text-xs cursor-pointer focus:outline-hidden"
            >
              <option value="default">Default Order</option>
              <option value="score">Highest Score First</option>
              <option value="plays">Most Played First</option>
              <option value="stars">3-Star Mastered First</option>
              <option value="alpha">A–Z Alphabetical</option>
            </select>
            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-950 px-2.5 py-2 rounded-xl border border-slate-800 whitespace-nowrap">
              {filteredAndSortedGames.length}/{games.length}
            </span>
          </div>
        </div>

        {/* Row 2: World Filter Strip */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800">
          <div className="flex items-center gap-1 text-[10px] font-black font-mario text-slate-400 uppercase mr-1">
            <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>WORLDS:</span>
          </div>
          {ARCADE_WORLD_FILTERS.map((wf) => {
            const count =
              wf.id === 'world_all'
                ? games.length
                : wf.id === 'favorites'
                ? favoriteGames.length
                : games.filter((gm) => GAME_WORLD_MAPPING[gm.id] === wf.id).length;
            const isActive = worldFilter === wf.id;
            return (
              <button
                key={wf.id}
                type="button"
                onClick={() => {
                  setWorldFilter(wf.id);
                  marioAudio.playClick();
                }}
                className={`min-h-[34px] px-2.5 sm:px-3 rounded-xl text-[11px] font-black transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 border-2 border-black shadow-[0_1px_0_#000]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {wf.id === 'favorites' && <Star className="w-3 h-3 inline-block mr-1 fill-current" />}
                {wf.shortLabel} ({count})
              </button>
            );
          })}
        </div>

        {/* Row 3: Genre Category Filter Strip */}
        <div
          data-testid="arcade-genre-filter-strip"
          className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800"
        >
          <div className="flex items-center gap-1 text-[10px] font-black font-mario text-slate-400 uppercase mr-1">
            <Filter className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>GENRES:</span>
          </div>
          {[
            { id: 'all' as const, label: `All Genres` },
            {
              id: 'pure_action' as const,
              label: `Action & Physics`,
            },
            ...GAME_CATEGORY_META.map((cat) => ({
              id: cat.id,
              label: cat.shortLabel,
            })),
          ].map((gf) => (
            <button
              key={gf.id}
              type="button"
              onClick={() => {
                setGenreFilter(gf.id);
                marioAudio.playClick();
              }}
              className={`min-h-[32px] px-2.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                genreFilter === gf.id
                  ? 'bg-sky-400 text-slate-950 border border-black font-black'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {gf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Starred Favorites Shelf (Visible when user has favorites and not searching) */}
      {!searchTerm.trim() && worldFilter !== 'favorites' && favoriteGames.length > 0 && (
        <section data-testid="arcade-pinned-favorites-shelf" className="space-y-3">
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-amber-950 via-slate-950 to-amber-950 text-white border-2 border-amber-400 rounded-2xl px-4 py-2.5 shadow-[3px_3px_0_#000]">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <h2 className="text-sm sm:text-base font-black font-display text-amber-300">
                STARRED FAVORITES SHELF
              </h2>
              <span className="text-xs font-bold text-amber-300 tabular-nums">
                · {favoriteGames.length} pinned games
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
              Your quick-launch bookmarks
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-1.5 sm:p-2.5 overflow-visible">
            {games
              .filter((gm) => favoriteGames.includes(gm.id))
              .map((g) => {
                const isSelected = activeGame === g.id;
                const starRating = getGameStarRating(g.id);
                const cardBest = bestPlays.find((bp) => bp.gameId === g.id);
                return (
                  <div
                    key={`fav-${g.id}`}
                    onClick={() => {
                      setActiveGame(g.id);
                      marioAudio.playPipe();
                      document
                        .getElementById('active-vault-game-stage')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }}
                    className={`h-full text-left p-4 rounded-2xl border-4 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-400 border-slate-950 text-slate-950 shadow-[4px_4px_0_#000]'
                        : 'bg-white border-slate-950 text-slate-900 hover:bg-amber-50 shadow-[3px_3px_0_#000]'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-black flex items-center justify-center shrink-0">
                          {g.icon}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(g.id);
                            }}
                            title="Remove from favorites"
                            className="p-1 rounded-lg text-amber-500 hover:text-amber-600 cursor-pointer"
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                          <span
                            className={`text-[9px] font-black font-mario px-2 py-1 rounded-lg uppercase leading-none whitespace-nowrap ${
                              isSelected
                                ? 'bg-slate-950 text-amber-300'
                                : 'bg-slate-900 text-amber-300'
                            }`}
                          >
                            {g.badge}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                          {g.genre}
                        </span>
                        <h3 className="font-black text-base font-display text-slate-950 leading-snug">
                          {g.title}
                        </h3>
                        <p className="text-xs font-semibold leading-relaxed mt-1 text-slate-700">
                          {g.desc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-900/10">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-3.5 h-3.5 ${
                                starRating >= starIdx
                                  ? 'fill-amber-400 text-amber-500'
                                  : isSelected
                                  ? 'fill-slate-900/20 text-slate-900/30'
                                  : 'fill-slate-200 text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        {cardBest && (
                          <span className="text-[10px] font-mono font-bold text-emerald-700">
                            {cardBest.bestScore} pts
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t-2 border-slate-950/15 flex items-center justify-between text-[11px] font-black font-mario">
                      <span>{isSelected ? 'ACTIVE' : 'LAUNCH'}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Empty State when no games match search or filters */}
      {filteredAndSortedGames.length === 0 && (
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-8 text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-black font-display text-white">
            No Arcade Games Found
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            No games match &quot;{searchTerm || 'your selected filters'}&quot;. Clear your search or filter to see all 47 games!
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setWorldFilter('world_all');
              setGenreFilter('all');
              setSortBy('default');
              marioAudio.playPipe();
            }}
            className="min-h-[42px] px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_#000]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Filters (Show All 47 Games)</span>
          </button>
        </div>
      )}

      {/* Organized Category Shelves */}
      <div className="space-y-6" data-testid="arcade-organized-shelves">
        {GAME_CATEGORY_META.map((cat) => {
          const shelfGames = filteredAndSortedGames.filter((gm) => gm.category === cat.id);
          if (shelfGames.length === 0) return null;
          return (
            <section
              key={cat.id}
              data-testid={`arcade-shelf-${cat.id}`}
              className="space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 bg-slate-950 text-white border-2 border-black rounded-2xl px-4 py-2.5 shadow-[3px_3px_0_#000]">
                <div className="flex items-center gap-2 min-w-0">
                  <h2 className="text-sm sm:text-base font-black font-display text-amber-300">
                    {cat.label}
                  </h2>
                  <span className="text-xs font-bold text-emerald-300 tabular-nums shrink-0">
                    · {shelfGames.length} games
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-300">
                  {cat.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-1.5 sm:p-2.5 overflow-visible">
                {shelfGames.map((g) => {
                  const isSelected = activeGame === g.id;
                  const isFav = favoriteGames.includes(g.id);
                  const starRating = getGameStarRating(g.id);
                  const cardBest = bestPlays.find((bp) => bp.gameId === g.id);
                  return (
                    <div
                      key={g.id}
                      onClick={() => {
                        setActiveGame(g.id);
                        marioAudio.playPipe();
                        document
                          .getElementById('active-vault-game-stage')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }}
                      className={`h-full text-left p-4 rounded-2xl border-4 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? hasCustomFrame
                            ? `bg-amber-400 text-slate-950 ${resolvedUniversalFrame.borderClasses}`
                            : 'bg-amber-400 border-slate-950 text-slate-950 shadow-[4px_4px_0_#000]'
                          : 'bg-white border-slate-950 text-slate-900 hover:bg-amber-50 shadow-[3px_3px_0_#000]'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-black flex items-center justify-center shrink-0">
                            {g.icon}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(g.id);
                              }}
                              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                              className="p-1 rounded-lg text-amber-500 hover:text-amber-600 cursor-pointer"
                            >
                              <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                            </button>
                            <span
                              className={`text-[9px] font-black font-mario px-2 py-1 rounded-lg uppercase leading-none whitespace-nowrap ${
                                isSelected
                                  ? 'bg-slate-950 text-amber-300'
                                  : 'bg-slate-900 text-amber-300'
                              }`}
                            >
                              {g.badge}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                            {g.genre}
                          </span>
                          <h3 className="font-black text-base font-display text-slate-950 leading-snug">
                            {g.title}
                          </h3>
                          <p className="text-xs font-semibold leading-relaxed mt-1 text-slate-700">
                            {g.desc}
                          </p>
                        </div>

                        {/* 3-Star Mastery Badge & High Score */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-900/10">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3.5 h-3.5 ${
                                  starRating >= starIdx
                                    ? 'fill-amber-400 text-amber-500'
                                    : isSelected
                                    ? 'fill-slate-900/20 text-slate-900/30'
                                    : 'fill-slate-200 text-slate-300'
                                }`}
                              />
                            ))}
                            <span
                              className={`text-[10px] font-black font-mono ml-1 ${
                                isSelected ? 'text-slate-900' : 'text-slate-600'
                              }`}
                            >
                              {starRating}/3 Stars
                            </span>
                          </div>
                          {cardBest ? (
                            <span
                              className={`text-[10px] font-mono font-bold ${
                                isSelected ? 'text-slate-950 font-black' : 'text-emerald-700'
                              }`}
                            >
                              Best: {cardBest.bestScore} pts
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-bold text-slate-400">
                              Unplayed
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t-2 border-slate-950/15 flex items-center justify-between text-[11px] font-black font-mario">
                        <span>{isSelected ? 'ACTIVE GAME' : 'PLAY GAME'}</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {/* Unabridged Game Legal Doctrines & Question Bank Modal */}
      <GameDoctrinesModal
        isOpen={showDoctrineModal}
        onClose={() => setShowDoctrineModal(false)}
        activeGameId={activeGame}
      />
    </div>
  );
};
