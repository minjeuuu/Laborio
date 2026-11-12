import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialCoinRushState,
  stepCoinRushState,
  advanceCoinRushStage,
  saveCoinRushHighScore,
  loadCoinRushHighScore,
  CoinRushInput,
} from './coinRushGame';

test('initial coin rush state sets up stage 1 with 3 lives and target coins', () => {
  const state = createInitialCoinRushState(42);
  assert.equal(state.currentStage, 1);
  assert.equal(state.lives, 3);
  assert.equal(state.coinsCollected, 0);
  assert.equal(state.stageTargetCoins, 15);
  assert.equal(state.status, 'playing');
  assert.ok(state.collectibles.length >= 6);
  assert.ok(state.obstacles.length >= 2);
});

test('collecting coins advances toward stage target and activates flagpole', () => {
  let state = createInitialCoinRushState(1);
  state.coinsCollected = 14;

  // Move player directly onto a collectible at (75, 148)
  state.collectibles = [
    { id: 99, x: 100, y: 100, kind: 'coin', collected: false, doctrineTip: 'Art. 87 Overtime' },
  ];
  state.playerX = 90;
  state.playerY = 90;

  const noInput: CoinRushInput = { left: false, right: false, jump: false };
  state = stepCoinRushState(state, noInput, 0.016, 1);

  assert.equal(state.coinsCollected, 15);
  assert.equal(state.flagpoleActive, true);
  assert.ok(state.lastBannerText.includes('TARGET REACHED') || state.lastBannerText.includes('Flagpole'));
});

test('touching the flagpole triggers stage_clear and allows stage advance', () => {
  let state = createInitialCoinRushState(1);
  state.flagpoleActive = true;
  state.playerX = state.flagpoleX - 2;
  state.playerY = state.flagpoleY + 10;

  const noInput: CoinRushInput = { left: false, right: false, jump: false };
  state = stepCoinRushState(state, noInput, 0.016, 1);

  assert.equal(state.status, 'stage_clear');

  const stage2 = advanceCoinRushStage(state);
  assert.equal(stage2.currentStage, 2);
  assert.equal(stage2.status, 'playing');
  assert.ok(stage2.boss !== null);
  assert.equal(stage2.boss?.name, 'Sub-Min Goomba General');
});

test('stage 3 contains Employer Bowser and striking the Supreme Court Axe wins the game', () => {
  let state = createInitialCoinRushState(1);
  state.currentStage = 2;
  state = advanceCoinRushStage(state); // Advances to stage 3

  assert.equal(state.currentStage, 3);
  assert.equal(state.boss?.name, 'Employer Bowser');
  assert.equal(state.bridgeAxeActive, true);

  // Jump onto the axe
  state.playerX = state.bridgeAxeX;
  state.playerY = state.bridgeAxeY;

  const noInput: CoinRushInput = { left: false, right: false, jump: false };
  state = stepCoinRushState(state, noInput, 0.016, 1);

  assert.equal(state.status, 'game_victory');
  assert.ok(state.lastBannerText.includes('AXE') || state.lastBannerText.includes('Bowser'));
});

test('saving and loading high score correctly stores and retrieves', () => {
  const mockStorage: Record<string, string> = {};
  const fakeStorage = {
    getItem: (k: string) => mockStorage[k] || null,
    setItem: (k: string, v: string) => {
      mockStorage[k] = v;
    },
    removeItem: (k: string) => {
      delete mockStorage[k];
    },
  };

  assert.equal(loadCoinRushHighScore(fakeStorage), 0);
  saveCoinRushHighScore(1450, fakeStorage);
  assert.equal(loadCoinRushHighScore(fakeStorage), 1450);
});
