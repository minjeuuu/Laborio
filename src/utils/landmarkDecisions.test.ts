import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LANDMARK_DECISIONS_DATA,
  LandmarkDecision,
  getLandmarkDecisionByTopicId,
  getLandmarkDecisionsByWorldId,
  searchLandmarkDecisions,
} from '../data/landmarkDecisionsData';

test('LANDMARK_DECISIONS_DATA contains 17 major Philippine Supreme Court landmark cases', () => {
  assert.equal(LANDMARK_DECISIONS_DATA.length >= 17, true);
});

test('Every landmark decision has valid G.R. number, holding, facts, and statutory basis', () => {
  LANDMARK_DECISIONS_DATA.forEach((decision) => {
    assert.ok(decision.id, `Decision must have id`);
    assert.ok(decision.caseTitle.length > 5, `Case title must be descriptive`);
    assert.ok(decision.grNumber.startsWith('G.R.') || decision.grNumber.includes('Phil.'), `Valid GR number required`);
    assert.ok(decision.doctrinalHolding.length > 20, `Doctrinal holding must be thorough`);
    assert.ok(decision.factsSummary.length > 20, `Facts summary required`);
    assert.ok(decision.legalIssue.length > 10, `Legal issue required`);
    assert.ok(decision.supremeCourtRuling.length > 20, `Supreme court ruling required`);
    assert.ok(decision.barExamTip.length > 10, `Bar tip required`);
  });
});

test('Coverage spans across all Labor Standards Worlds', () => {
  const worldIds = new Set(LANDMARK_DECISIONS_DATA.map((d) => d.worldId));
  assert.equal(worldIds.has('world1'), true); // Hours of Work & Coverage
  assert.equal(worldIds.has('world2'), true); // Rest & Holidays & 13th Month
  assert.equal(worldIds.has('world3'), true); // Wages & Dismissals
  assert.equal(worldIds.has('world4'), true); // Special Groups
  assert.equal(worldIds.has('world5'), true); // Protective Laws
  assert.equal(worldIds.has('world6'), true); // Leaves
});

test('Core landmark cases are correctly represented', () => {
  const autobus = LANDMARK_DECISIONS_DATA.find((d) => d.id === 'sc-autobus');
  assert.ok(autobus);
  assert.ok(autobus.doctrinalHolding.includes('Service Incentive Leave'));
  assert.ok(autobus.doctrinalHolding.includes('commences only upon demand'));

  const asian = LANDMARK_DECISIONS_DATA.find((d) => d.id === 'sc-asian-transmission');
  assert.ok(asian);
  assert.ok(asian.doctrinalHolding.includes('200% if unworked'));
  assert.ok(asian.doctrinalHolding.includes('300% if worked'));

  const kingOfKings = LANDMARK_DECISIONS_DATA.find((d) => d.id === 'sc-king-of-kings');
  assert.ok(kingOfKings);
  assert.ok(kingOfKings.doctrinalHolding.includes('Twin-Notice Rule'));
  assert.ok(kingOfKings.barExamTip.includes('5 calendar-day'));

  const serrano = LANDMARK_DECISIONS_DATA.find((d) => d.id === 'sc-serrano');
  assert.ok(serrano);
  assert.ok(serrano.doctrinalHolding.includes('unconstitutional'));
});

test('Lookup and search helpers query landmark cases accurately', () => {
  const leaveCase = getLandmarkDecisionByTopicId('m6-service-incentive-leave');
  assert.ok(leaveCase);
  assert.equal(leaveCase.id, 'sc-autobus');

  const w2Cases = getLandmarkDecisionsByWorldId('world2');
  assert.ok(w2Cases.length >= 3);

  const searchResults = searchLandmarkDecisions('Twin-Notice');
  assert.ok(searchResults.some((r) => r.id === 'sc-king-of-kings'));

  const emptySearch = searchLandmarkDecisions('');
  assert.equal(emptySearch.length, LANDMARK_DECISIONS_DATA.length);
});
