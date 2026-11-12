import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GAME_DECK_SETS,
  ARCADE_BOARD_LENGTHS,
  ARCADE_WORLD_FILTERS,
  GAME_WORLD_MAPPING,
  CODAL_CLOZE_ARTICLES,
  BAR_SCENARIO_CASES,
  toggleFavoriteGame,
  loadFavoriteGames,
  saveFavoriteGames,
} from './gameDecksExpansion';

test('GAME_DECK_SETS contains all 8 structured sets with complete metadata', () => {
  assert.equal(GAME_DECK_SETS.length, 8);
  const setIds = GAME_DECK_SETS.map((s) => s.id);
  assert.ok(setIds.includes('set_all_complete'));
  assert.ok(setIds.includes('set_a_foundations'));
  assert.ok(setIds.includes('set_b_jurisprudence'));
  assert.ok(setIds.includes('set_c_calculations'));
  assert.ok(setIds.includes('set_d_bar_traps'));
  assert.ok(setIds.includes('set_e_special_laws'));
  assert.ok(setIds.includes('set_f_mock_bar_sprint'));
  assert.ok(setIds.includes('set_g_leaves_mastery'));

  GAME_DECK_SETS.forEach((s) => {
    assert.ok(s.label.length > 0, `${s.id} must have a label`);
    assert.ok(s.badge.length > 0, `${s.id} must have a badge`);
    assert.ok(s.tagline.length > 0, `${s.id} must have a tagline`);
    assert.ok(s.desc.length > 0, `${s.id} must have a description`);
    assert.ok(s.focusTopics.length > 0, `${s.id} must have focus topics`);
  });
});

test('ARCADE_BOARD_LENGTHS defines lightning, quick, standard, championship, and supreme gauntlet round lengths', () => {
  assert.equal(ARCADE_BOARD_LENGTHS.length, 5);
  const lightning = ARCADE_BOARD_LENGTHS.find((b) => b.id === 'lightning_3');
  const quick = ARCADE_BOARD_LENGTHS.find((b) => b.id === 'quick_5');
  const standard = ARCADE_BOARD_LENGTHS.find((b) => b.id === 'standard_10');
  const championship = ARCADE_BOARD_LENGTHS.find((b) => b.id === 'championship_20');
  const supreme = ARCADE_BOARD_LENGTHS.find((b) => b.id === 'supreme_gauntlet_30');

  assert.ok(lightning && lightning.roundsCount === 3);
  assert.ok(quick && quick.roundsCount === 5);
  assert.ok(standard && standard.roundsCount === 10);
  assert.ok(championship && championship.roundsCount === 20);
  assert.ok(supreme && supreme.roundsCount === 30);
});

test('ARCADE_WORLD_FILTERS covers all 6 Worlds plus favorites and grand classics', () => {
  const ids = ARCADE_WORLD_FILTERS.map((w) => w.id);
  assert.ok(ids.includes('world_all'));
  assert.ok(ids.includes('favorites'));
  assert.ok(ids.includes('world_1'));
  assert.ok(ids.includes('world_2'));
  assert.ok(ids.includes('world_3'));
  assert.ok(ids.includes('world_4'));
  assert.ok(ids.includes('world_5'));
  assert.ok(ids.includes('world_6'));
  assert.ok(ids.includes('world_grand_classics'));
});

test('GAME_WORLD_MAPPING correctly categorizes key games into their governing worlds', () => {
  assert.equal(GAME_WORLD_MAPPING.yoshi_overtime, 'world_1');
  assert.equal(GAME_WORLD_MAPPING.luigi_nightshift, 'world_1');
  assert.equal(GAME_WORLD_MAPPING.daisy_holiday_derby, 'world_2');
  assert.equal(GAME_WORLD_MAPPING.whack, 'world_3');
  assert.equal(GAME_WORLD_MAPPING.mansion, 'world_3');
  assert.equal(GAME_WORLD_MAPPING.captain_toad_minecart, 'world_4');
  assert.equal(GAME_WORLD_MAPPING.dry_bones_crypt, 'world_5');
  assert.equal(GAME_WORLD_MAPPING.world6_clinic, 'world_6');
  assert.equal(GAME_WORLD_MAPPING.courtroom, 'world_grand_classics');
});

test('CODAL_CLOZE_ARTICLES contains comprehensive codal provisions with valid blanks', () => {
  assert.ok(CODAL_CLOZE_ARTICLES.length >= 10);
  CODAL_CLOZE_ARTICLES.forEach((art) => {
    assert.ok(art.id.length > 0);
    assert.ok(art.articleNumber.length > 0);
    assert.ok(art.title.length > 0);
    assert.ok(art.fullVerbatimText.length > 40, `${art.id} text must be substantial`);
    assert.ok(art.blanks.length > 0, `${art.id} must have blanks to fill`);
    assert.ok(art.doctrinalSummary.length > 0);
    assert.ok(art.practicalApplication.length > 0);

    // Each blank word must appear in the verbatim text
    art.blanks.forEach((b) => {
      assert.ok(
        art.fullVerbatimText.toLowerCase().includes(b.word.toLowerCase()),
        `Blank "${b.word}" must exist inside verbatim text of ${art.articleNumber}`
      );
      assert.ok(b.hint.length > 0, `Blank ${b.word} must have a hint`);
    });
  });
});

test('BAR_SCENARIO_CASES contains structured ALAC cases with genuine issues and model answers', () => {
  assert.ok(BAR_SCENARIO_CASES.length >= 3);
  BAR_SCENARIO_CASES.forEach((cs) => {
    assert.ok(cs.caseTitle.length > 0);
    assert.ok(cs.facts.length > 50, `${cs.id} facts must be comprehensive`);
    assert.ok(cs.issuesList.length >= 3, `${cs.id} must have multiple issues to spot`);
    assert.ok(cs.controllingArticles.length >= 2, `${cs.id} must have controlling articles`);
    assert.ok(cs.computationQuestion.prompt.length > 0);
    assert.ok(cs.computationQuestion.options.some((o) => o.isCorrect), `${cs.id} must have a correct option`);

    // Model ALAC answer structure
    assert.ok(cs.modelBarAnswer.answer.length > 0, `${cs.id} Answer component required`);
    assert.ok(cs.modelBarAnswer.legalBasis.length > 0, `${cs.id} Legal Basis component required`);
    assert.ok(cs.modelBarAnswer.application.length > 0, `${cs.id} Application component required`);
    assert.ok(cs.modelBarAnswer.conclusion.length > 0, `${cs.id} Conclusion component required`);
  });
});
