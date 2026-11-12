import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDynamicPrintPageCss, PrintIsolationMode } from './printHelper';
import { STATUTORY_LEAVES_DATA } from '../components/StatutoryLeavesComparativeModal';
import { BAR_ESSAY_SCENARIOS } from '../components/BarIssueSpotterModal';
import { GAME_DECK_SETS, ARCADE_BOARD_LENGTHS } from './gameDecksExpansion';

test('buildDynamicPrintPageCss generates valid print CSS for all orientations and paper sizes', () => {
  const landscapeCss = buildDynamicPrintPageCss('landscape', '5mm 6mm', 'Inter, sans-serif', 'a4');
  assert.ok(landscapeCss.includes('@media print'));
  assert.ok(landscapeCss.includes('A4 landscape'));
  assert.ok(landscapeCss.includes('margin: 5mm 6mm'));
  assert.ok(landscapeCss.includes('#royal-juris-diploma-sheet'));
  assert.ok(landscapeCss.includes('#statutory-cheatsheet-sheet'));
  assert.ok(landscapeCss.includes('#bowser-victory-sheet'));
  assert.ok(landscapeCss.includes('#labor-jurist-passport-sheet'));

  const portraitCss = buildDynamicPrintPageCss('portrait', undefined, 'Fredoka', 'legal');
  assert.ok(portraitCss.includes('legal portrait'));
  assert.ok(portraitCss.includes('--print-active-font: Fredoka'));
});

test('STATUTORY_LEAVES_DATA covers all 8 statutory leave laws with accurate commutability rules', () => {
  assert.equal(STATUTORY_LEAVES_DATA.length, 8);
  const ids = STATUTORY_LEAVES_DATA.map((l) => l.id);
  assert.ok(ids.includes('sil'));
  assert.ok(ids.includes('maternity'));
  assert.ok(ids.includes('paternity'));
  assert.ok(ids.includes('solo_parent'));
  assert.ok(ids.includes('vawc'));
  assert.ok(ids.includes('gynecological'));
  assert.ok(ids.includes('adoption'));
  assert.ok(ids.includes('rehabilitation'));

  // SIL (Art. 95) is uniquely commutable to cash under mandatory statutory rule
  const sil = STATUTORY_LEAVES_DATA.find((l) => l.id === 'sil');
  assert.ok(sil && sil.commutableToCash === true);

  // Maternity leave (RA 11210) provides 105 days base, non-commutable to cash
  const maternity = STATUTORY_LEAVES_DATA.find((l) => l.id === 'maternity');
  assert.ok(maternity && maternity.commutableToCash === false);
  assert.ok(maternity.duration.includes('105 days'));

  // Solo parent leave (RA 11861) provides 7 days after 6 months tenure
  const soloParent = STATUTORY_LEAVES_DATA.find((l) => l.id === 'solo_parent');
  assert.ok(soloParent && soloParent.duration.includes('7 working days'));
  assert.ok(soloParent.qualifyingTenure.includes('6'));

  // Paternity leave (RA 8187) provides 7 days, first 4 deliveries
  const paternity = STATUTORY_LEAVES_DATA.find((l) => l.id === 'paternity');
  assert.ok(paternity && paternity.duration.includes('7 calendar days'));
  assert.ok(paternity.keyBarExceptions.includes('first four'));
});

test('BAR_ESSAY_SCENARIOS contains structured bar problems with full ALAC answers and 100% rubrics', () => {
  assert.ok(BAR_ESSAY_SCENARIOS.length >= 3);
  BAR_ESSAY_SCENARIOS.forEach((sc) => {
    assert.ok(sc.title.length > 0);
    assert.ok(sc.factPattern.length > 50);
    assert.ok(sc.callOfTheQuestion.length > 10);
    assert.ok(sc.issuesToSpot.length >= 3);
    assert.ok(sc.keyDoctrines.length >= 2);

    // Verify ALAC components
    assert.ok(sc.modelALACAnswer.answer.length > 10);
    assert.ok(sc.modelALACAnswer.legalBasis.length > 30);
    assert.ok(sc.modelALACAnswer.application.length > 30);
    assert.ok(sc.modelALACAnswer.conclusion.length > 10);

    // Examiner rubric sums to 100%
    const rubricSum =
      sc.barExaminerRubric.issueSpotting +
      sc.barExaminerRubric.legalBasisCitation +
      sc.barExaminerRubric.logicalApplication +
      sc.barExaminerRubric.clarityAndALACFormat;
    assert.equal(rubricSum, 100);
  });
});

test('Expanded GAME_DECK_SETS includes new special laws, mock bar sprint, and leaves mastery sets', () => {
  assert.equal(GAME_DECK_SETS.length, 8);
  const setE = GAME_DECK_SETS.find((s) => s.id === 'set_e_special_laws');
  const setF = GAME_DECK_SETS.find((s) => s.id === 'set_f_mock_bar_sprint');
  const setG = GAME_DECK_SETS.find((s) => s.id === 'set_g_leaves_mastery');

  assert.ok(setE && setE.badge === 'SPECIAL LAWS');
  assert.ok(setF && setF.badge === 'BAR MOCK SPRINT');
  assert.ok(setG && setG.badge === 'LEAVES MASTER');
});

test('Expanded ARCADE_BOARD_LENGTHS includes lightning blitz (3) and supreme gauntlet (30)', () => {
  assert.equal(ARCADE_BOARD_LENGTHS.length, 5);
  const lightning = ARCADE_BOARD_LENGTHS.find((b) => b.id === 'lightning_3');
  const supreme = ARCADE_BOARD_LENGTHS.find((b) => b.id === 'supreme_gauntlet_30');

  assert.ok(lightning && lightning.roundsCount === 3);
  assert.ok(supreme && supreme.roundsCount === 30);
});
