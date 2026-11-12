import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LEVEL_THRESHOLDS,
  calculateQuizXp,
  calculateStudyTimeXp,
  getProgressionForXp,
  isAvatarUnlockedByLevel,
  getRequiredLevelForAvatar,
  awardUserXp,
  resetUserProgression,
} from './levelProgressionService';

test('Level-Up Progression System: Thresholds and Bounds', () => {
  assert.equal(LEVEL_THRESHOLDS.length, 105, 'Must have 105 total progression levels');
  assert.equal(LEVEL_THRESHOLDS[0].level, 1);
  assert.equal(LEVEL_THRESHOLDS[0].xpRequired, 0);
  assert.ok(LEVEL_THRESHOLDS[0].unlockedAvatars.includes('mario'));
  assert.ok(LEVEL_THRESHOLDS[0].unlockedAvatars.includes('luigi'));

  // Monotonically increasing XP requirements
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    assert.ok(
      LEVEL_THRESHOLDS[i].xpRequired > LEVEL_THRESHOLDS[i - 1].xpRequired,
      `Level ${LEVEL_THRESHOLDS[i].level} XP (${LEVEL_THRESHOLDS[i].xpRequired}) must exceed Level ${LEVEL_THRESHOLDS[i - 1].level} XP (${LEVEL_THRESHOLDS[i - 1].xpRequired})`
    );
  }
});

test('calculateQuizXp computes accurate XP based on performance and game mode', () => {
  // 5 out of 5 correct standard quiz
  const perfectStandard = calculateQuizXp({ correctCount: 5, totalCount: 5, isBossOrExam: false });
  // 5*30 + 100 (perfect) = 250
  assert.equal(perfectStandard, 250);

  // 3 out of 5 correct standard quiz
  const partial = calculateQuizXp({ correctCount: 3, totalCount: 5, isBossOrExam: false });
  // 3*30 = 90
  assert.equal(partial, 90);

  // 10 out of 10 Boss showdown
  const perfectBoss = calculateQuizXp({ correctCount: 10, totalCount: 10, isBossOrExam: true });
  // (10*30 + 100) * 1.5 = 400 * 1.5 = 600
  assert.equal(perfectBoss, 600);

  // 0 answers gives minimum effort XP
  assert.equal(calculateQuizXp({ correctCount: 0, totalCount: 0 }), 10);
});

test('calculateStudyTimeXp awards XP based on active study seconds', () => {
  assert.equal(calculateStudyTimeXp(0), 0);
  // 60 seconds / 15 = 4 XP
  assert.equal(calculateStudyTimeXp(60), 4);
  // 300 seconds / 15 = 20 XP
  assert.equal(calculateStudyTimeXp(300), 20);
  // Negative or small fraction rounds cleanly
  assert.equal(calculateStudyTimeXp(-10), 0);
});

test('getProgressionForXp accurately calculates current level, next level, and progress percent', () => {
  const atZero = getProgressionForXp(0);
  assert.equal(atZero.level, 1);
  assert.equal(atZero.nextUnlockPreview?.level, 2);
  assert.equal(atZero.xpInCurrentLevel, 0);
  assert.equal(atZero.progressPercent, 0);

  // At Level 2 exactly (120 XP)
  const at120 = getProgressionForXp(120);
  assert.equal(at120.level, 2);
  assert.equal(at120.nextUnlockPreview?.level, 3);
  assert.equal(at120.progressPercent, 0);

  // Halfway through Level 2 (120 to 280 = 160 range, 120 + 80 = 200)
  const at200 = getProgressionForXp(200);
  assert.equal(at200.level, 2);
  assert.equal(at200.progressPercent, 50);

  // At max level (Level 105 requires 373,500 XP)
  const maxLvl = getProgressionForXp(400000);
  assert.equal(maxLvl.level, 105);
  assert.equal(maxLvl.nextUnlockPreview, null);
  assert.equal(maxLvl.progressPercent, 100);
});

test('Avatar Level Unlock verification', () => {
  // Mario and Luigi are unlocked at Level 1
  assert.equal(isAvatarUnlockedByLevel('mario', 1), true);
  assert.equal(isAvatarUnlockedByLevel('luigi', 1), true);

  // Toad unlocks at Level 2
  assert.equal(isAvatarUnlockedByLevel('toad', 1), false);
  assert.equal(isAvatarUnlockedByLevel('toad', 2), true);
  assert.equal(getRequiredLevelForAvatar('toad'), 2);

  // Peach unlocks at Level 5
  assert.equal(getRequiredLevelForAvatar('peach'), 5);

  // Rosalina unlocks at Level 8
  assert.equal(getRequiredLevelForAvatar('rosalina'), 8);

  // Shadow Mario requires Level 32
  assert.equal(getRequiredLevelForAvatar('shadowmario'), 32);

  // Dr. Peach requires Level 33
  assert.equal(getRequiredLevelForAvatar('drpeach'), 33);
  assert.equal(isAvatarUnlockedByLevel('drpeach', 32), false);
  assert.equal(isAvatarUnlockedByLevel('drpeach', 33), true);

  // New Characters
  assert.equal(getRequiredLevelForAvatar('kingboo'), 40);
  assert.equal(getRequiredLevelForAvatar('peteypiranha'), 41);
  assert.equal(getRequiredLevelForAvatar('wiggler'), 42);
  assert.equal(getRequiredLevelForAvatar('lakitu'), 43);
  assert.equal(getRequiredLevelForAvatar('hammerbro'), 44);
  assert.equal(getRequiredLevelForAvatar('crankykong'), 45);
  assert.equal(getRequiredLevelForAvatar('funkykong'), 46);
  assert.equal(getRequiredLevelForAvatar('nabbit'), 47);
  assert.equal(getRequiredLevelForAvatar('fluddmario'), 48);
  assert.equal(getRequiredLevelForAvatar('chargetoad'), 49);
  assert.equal(isAvatarUnlockedByLevel('chargetoad', 48), false);
  assert.equal(isAvatarUnlockedByLevel('chargetoad', 49), true);

  // Additional Roster Additions (Levels 51 to 80)
  assert.equal(getRequiredLevelForAvatar('blooper'), 51);
  assert.equal(getRequiredLevelForAvatar('montymole'), 52);
  assert.equal(getRequiredLevelForAvatar('spike'), 53);
  assert.equal(getRequiredLevelForAvatar('ninji'), 54);
  assert.equal(getRequiredLevelForAvatar('magikoopa'), 55);
  assert.equal(getRequiredLevelForAvatar('drybonesgold'), 56);
  assert.equal(getRequiredLevelForAvatar('poochy'), 57);
  assert.equal(getRequiredLevelForAvatar('chainchomp'), 58);
  assert.equal(getRequiredLevelForAvatar('bobomb'), 59);
  assert.equal(getRequiredLevelForAvatar('chefkinopio'), 60);

  // Levels 61 to 80
  assert.equal(getRequiredLevelForAvatar('dixiekong'), 61);
  assert.equal(getRequiredLevelForAvatar('tinykong'), 62);
  assert.equal(getRequiredLevelForAvatar('chunkykong'), 63);
  assert.equal(getRequiredLevelForAvatar('luma'), 64);
  assert.equal(getRequiredLevelForAvatar('lubba'), 65);
  assert.equal(getRequiredLevelForAvatar('cappy'), 66);
  assert.equal(getRequiredLevelForAvatar('tiara'), 67);
  assert.equal(getRequiredLevelForAvatar('flyguy'), 68);
  assert.equal(getRequiredLevelForAvatar('goomba'), 69);
  assert.equal(getRequiredLevelForAvatar('paragoomba'), 70);
  assert.equal(getRequiredLevelForAvatar('paratroopa'), 71);
  assert.equal(getRequiredLevelForAvatar('buzzybeetle'), 72);
  assert.equal(getRequiredLevelForAvatar('spiny'), 73);
  assert.equal(getRequiredLevelForAvatar('cheepcheep'), 74);
  assert.equal(getRequiredLevelForAvatar('pokey'), 75);
  assert.equal(getRequiredLevelForAvatar('thwomp'), 76);
  assert.equal(getRequiredLevelForAvatar('whomp'), 77);
  assert.equal(getRequiredLevelForAvatar('kingbobomb'), 78);
  assert.equal(getRequiredLevelForAvatar('wart'), 79);
  assert.equal(getRequiredLevelForAvatar('tatanga'), 80);
  assert.equal(isAvatarUnlockedByLevel('tatanga', 79), false);
  assert.equal(isAvatarUnlockedByLevel('tatanga', 80), true);

  // Levels 81 to 90
  assert.equal(getRequiredLevelForAvatar('mouser'), 81);
  assert.equal(getRequiredLevelForAvatar('boomboom'), 82);
  assert.equal(getRequiredLevelForAvatar('pompom'), 83);
  assert.equal(getRequiredLevelForAvatar('rex'), 84);
  assert.equal(getRequiredLevelForAvatar('charginchuck'), 85);
  assert.equal(getRequiredLevelForAvatar('koopakid'), 86);
  assert.equal(getRequiredLevelForAvatar('kamekclone'), 87);
  assert.equal(getRequiredLevelForAvatar('drybowserblue'), 88);
  assert.equal(getRequiredLevelForAvatar('foremanspike'), 89);
  assert.equal(getRequiredLevelForAvatar('toadsworth'), 90);
  assert.equal(isAvatarUnlockedByLevel('toadsworth', 89), false);
  assert.equal(isAvatarUnlockedByLevel('toadsworth', 90), true);
});

test('awardUserXp updates state and triggers didLevelUp flag correctly', () => {
  // Mock localStorage
  const store: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, val: string) => {
      store[key] = val;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
  };

  const initial = resetUserProgression(mockStorage);
  assert.equal(initial.totalXp, 0);
  assert.equal(initial.level, 1);

  // Award 50 XP (still level 1)
  const step1 = awardUserXp({ amount: 50, reason: 'Test 1', storage: mockStorage });
  assert.equal(step1.updatedState.totalXp, 50);
  assert.equal(step1.updatedState.level, 1);
  assert.equal(step1.didLevelUp, false);

  // Award another 80 XP (Total 130 XP -> crossed 120 threshold for Level 2)
  const step2 = awardUserXp({ amount: 80, reason: 'Test 2', storage: mockStorage });
  assert.equal(step2.updatedState.totalXp, 130);
  assert.equal(step2.updatedState.level, 2);
  assert.equal(step2.didLevelUp, true);
  assert.equal(step2.newLevel, 2);
  assert.ok(step2.newlyUnlockedAvatars.includes('toad'));
});
