import test from 'node:test';
import assert from 'node:assert/strict';
import { WORD_HUNT_PUZZLE_SETS } from './round10Features';
import { KOOPA_BREAKER_DOCTRINES } from '../components/NewVaultGames';
import {
  BRICK_BREAKER_QUESTION_BANK,
  YOSHI_EGG_ROUNDS_BANK,
  BOO_BURDEN_CASES_BANK,
  CHRONO_PRESCRIPTION_CLAIMS_BANK,
  CONTRACTOR_DOCKET_BANK,
  drawUniqueFromDeck,
} from './gameQuestionDeck';
import {
  YOSHI_OVERTIME_EXPRESS_BANK,
  LUIGI_NIGHTSHIFT_BANK,
  ROSALINA_WAGE_MATRIX_BANK,
  PEACH_ROYAL_LEAVES_BANK,
  WARIO_DEDUCTION_AUDIT_BANK,
  TOADSWORTH_RETIREMENT_BANK,
} from '../components/MasterVaultGames';
import {
  CAPTAIN_TOAD_MINECART_BANK,
  DAISY_HOLIDAY_DERBY_BANK,
  DRY_BONES_CRYPT_BANK,
  PAULINE_WAGE_CONCERT_BANK,
} from '../components/RoyalVaultGames';
import {
  HAMMER_BROS_PAYROLL_BANK,
  SHY_GUY_CONVEYOR_BANK,
  TOADETTE_DUE_PROCESS_CASES,
  KAMEK_DEADLINE_SPELLS,
} from '../components/BonusVaultGames';
import { generateExamSimulationDeck } from './studyModes';

test('WORD_HUNT_PUZZLE_SETS provides at least 20 comprehensive statutory boards', () => {
  assert.ok(WORD_HUNT_PUZZLE_SETS.length >= 20, `Expected at least 20 boards, got ${WORD_HUNT_PUZZLE_SETS.length}`);
  WORD_HUNT_PUZZLE_SETS.forEach((set, idx) => {
    assert.ok(set.title, `Board ${idx} must have a title`);
    assert.ok(set.entries.length >= 6, `Board ${idx} must have at least 6 target words, got ${set.entries.length}`);
    set.entries.forEach((e, eIdx) => {
      assert.ok(e.word, `Board ${idx} entry ${eIdx} must have a word`);
      assert.ok(e.clue, `Board ${idx} entry ${eIdx} must have a clue`);
      assert.ok(e.articleRef, `Board ${idx} entry ${eIdx} must have an articleRef`);
      assert.ok(typeof e.r === 'number' && typeof e.c === 'number');
      assert.ok(typeof e.dr === 'number' && typeof e.dc === 'number');
    });
  });
});

test('NewVaultGames question and doctrine banks are expanded', () => {
  assert.ok(
    KOOPA_BREAKER_DOCTRINES.length >= 36,
    `KOOPA_BREAKER_DOCTRINES should have at least 36 items, got ${KOOPA_BREAKER_DOCTRINES.length}`
  );
  assert.ok(
    BRICK_BREAKER_QUESTION_BANK.length >= 40,
    `BRICK_BREAKER_QUESTION_BANK should have at least 40 items, got ${BRICK_BREAKER_QUESTION_BANK.length}`
  );
  assert.ok(
    YOSHI_EGG_ROUNDS_BANK.length >= 36,
    `YOSHI_EGG_ROUNDS_BANK should have at least 36 items, got ${YOSHI_EGG_ROUNDS_BANK.length}`
  );
  assert.ok(
    BOO_BURDEN_CASES_BANK.length >= 36,
    `BOO_BURDEN_CASES_BANK should have at least 36 items, got ${BOO_BURDEN_CASES_BANK.length}`
  );
  assert.ok(
    CHRONO_PRESCRIPTION_CLAIMS_BANK.length >= 36,
    `CHRONO_PRESCRIPTION_CLAIMS_BANK should have at least 36 items, got ${CHRONO_PRESCRIPTION_CLAIMS_BANK.length}`
  );
  assert.ok(
    CONTRACTOR_DOCKET_BANK.length >= 28,
    `CONTRACTOR_DOCKET_BANK should have at least 28 items, got ${CONTRACTOR_DOCKET_BANK.length}`
  );
});

test('MasterVaultGames scenarios are expanded to at least 32 each', () => {
  assert.ok(
    YOSHI_OVERTIME_EXPRESS_BANK.length >= 32,
    `YOSHI_OVERTIME_EXPRESS_BANK expected >= 32, got ${YOSHI_OVERTIME_EXPRESS_BANK.length}`
  );
  assert.ok(
    LUIGI_NIGHTSHIFT_BANK.length >= 32,
    `LUIGI_NIGHTSHIFT_BANK expected >= 32, got ${LUIGI_NIGHTSHIFT_BANK.length}`
  );
  assert.ok(
    ROSALINA_WAGE_MATRIX_BANK.length >= 32,
    `ROSALINA_WAGE_MATRIX_BANK expected >= 32, got ${ROSALINA_WAGE_MATRIX_BANK.length}`
  );
  assert.ok(
    PEACH_ROYAL_LEAVES_BANK.length >= 32,
    `PEACH_ROYAL_LEAVES_BANK expected >= 32, got ${PEACH_ROYAL_LEAVES_BANK.length}`
  );
  assert.ok(
    WARIO_DEDUCTION_AUDIT_BANK.length >= 32,
    `WARIO_DEDUCTION_AUDIT_BANK expected >= 32, got ${WARIO_DEDUCTION_AUDIT_BANK.length}`
  );
  assert.ok(
    TOADSWORTH_RETIREMENT_BANK.length >= 32,
    `TOADSWORTH_RETIREMENT_BANK expected >= 32, got ${TOADSWORTH_RETIREMENT_BANK.length}`
  );
});

test('RoyalVaultGames scenarios are expanded to at least 28 each', () => {
  assert.ok(
    CAPTAIN_TOAD_MINECART_BANK.length >= 28,
    `CAPTAIN_TOAD_MINECART_BANK expected >= 28, got ${CAPTAIN_TOAD_MINECART_BANK.length}`
  );
  assert.ok(
    DAISY_HOLIDAY_DERBY_BANK.length >= 28,
    `DAISY_HOLIDAY_DERBY_BANK expected >= 28, got ${DAISY_HOLIDAY_DERBY_BANK.length}`
  );
  assert.ok(
    DRY_BONES_CRYPT_BANK.length >= 28,
    `DRY_BONES_CRYPT_BANK expected >= 28, got ${DRY_BONES_CRYPT_BANK.length}`
  );
  assert.ok(
    PAULINE_WAGE_CONCERT_BANK.length >= 28,
    `PAULINE_WAGE_CONCERT_BANK expected >= 28, got ${PAULINE_WAGE_CONCERT_BANK.length}`
  );
});

test('BonusVaultGames banks are expanded', () => {
  assert.ok(
    HAMMER_BROS_PAYROLL_BANK.length >= 36,
    `HAMMER_BROS_PAYROLL_BANK expected >= 36, got ${HAMMER_BROS_PAYROLL_BANK.length}`
  );
  assert.ok(
    SHY_GUY_CONVEYOR_BANK.length >= 28,
    `SHY_GUY_CONVEYOR_BANK expected >= 28, got ${SHY_GUY_CONVEYOR_BANK.length}`
  );
  assert.ok(
    TOADETTE_DUE_PROCESS_CASES.length >= 20,
    `TOADETTE_DUE_PROCESS_CASES expected >= 20, got ${TOADETTE_DUE_PROCESS_CASES.length}`
  );
  assert.ok(
    KAMEK_DEADLINE_SPELLS.length >= 24,
    `KAMEK_DEADLINE_SPELLS expected >= 24, got ${KAMEK_DEADLINE_SPELLS.length}`
  );
});

test('drawUniqueFromDeck draws non-repeating items across consecutive runs', () => {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const run1 = drawUniqueFromDeck('test_pool_no_repeat', pool, 5);
  const run2 = drawUniqueFromDeck('test_pool_no_repeat', pool, 5);

  assert.equal(run1.length, 5);
  assert.equal(run2.length, 5);

  // In a pool of 10, drawing 5 then 5 should leave 0 intersection between run1 and run2
  const set1 = new Set(run1);
  const intersection = run2.filter((x) => set1.has(x));
  assert.equal(intersection.length, 0, 'Run 2 must not repeat any items from Run 1 until pool cycles');
});

test('generateExamSimulationDeck produces multi-world deck and draws without immediate repeats', () => {
  const deck1 = generateExamSimulationDeck('exam_prep', 10);
  assert.equal(deck1.length, 10);
  const worldsInDeck1 = new Set(deck1.map((q) => q.worldCode));
  assert.ok(worldsInDeck1.size >= 6, 'Must span at least 6 distinct worlds');

  const deck2 = generateExamSimulationDeck('exam_prep', 10);
  assert.equal(deck2.length, 10);

  const ids1 = new Set(deck1.map((q) => q.id));
  const duplicates = deck2.filter((q) => ids1.has(q.id));
  assert.ok(
    duplicates.length <= 2,
    `Expected at most 2 overlapping questions across consecutive 10-Q simulations, got ${duplicates.length}`
  );
});
