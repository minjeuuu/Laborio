import test from 'node:test';
import assert from 'node:assert/strict';
import {
  FORUM_JURISDICTIONS,
  DISPUTE_SCENARIOS,
  ForumJurisdictionId,
} from './laborDisputeNavigator';

test('FORUM_JURISDICTIONS contains all key labor fora', () => {
  const forumKeys: ForumJurisdictionId[] = [
    'sena',
    'nlrc_labor_arbiter',
    'nlrc_commission',
    'dole_regional_director_128',
    'dole_regional_director_129',
    'voluntary_arbitrator',
    'court_of_appeals',
    'supreme_court',
  ];

  forumKeys.forEach((key) => {
    const forum = FORUM_JURISDICTIONS[key];
    assert.ok(forum, `Forum ${key} must exist`);
    assert.ok(forum.name.length > 0);
    assert.ok(forum.controllingStatute.length > 0);
    assert.ok(forum.scopeOfAuthority.length > 0);
    assert.ok(forum.keyThresholds.length > 0);
    assert.ok(forum.appealRoute.length > 0);
  });
});

test('DISPUTE_SCENARIOS contains realistic bar exam scenarios with valid fora', () => {
  assert.ok(DISPUTE_SCENARIOS.length >= 4);

  DISPUTE_SCENARIOS.forEach((scenario) => {
    assert.ok(scenario.title.length > 0);
    assert.ok(scenario.facts.length > 50);
    assert.ok(scenario.statutoryBasis.length > 0);
    assert.ok(scenario.governingDoctrine.length > 0);
    assert.ok(FORUM_JURISDICTIONS[scenario.correctForumId], `Correct forum ${scenario.correctForumId} must exist`);
    
    // Distractors must not include the correct forum
    assert.ok(!scenario.distractorForumIds.includes(scenario.correctForumId));
    assert.ok(scenario.distractorForumIds.length >= 2);
  });

  // Check specific legal mappings
  const execTermination = DISPUTE_SCENARIOS.find((s) => s.id === 'ds_exec_termination');
  assert.equal(execTermination?.correctForumId, 'nlrc_labor_arbiter');

  const visitorial = DISPUTE_SCENARIOS.find((s) => s.id === 'ds_visitorial_subminimum');
  assert.equal(visitorial?.correctForumId, 'dole_regional_director_128');

  const cbaGrievance = DISPUTE_SCENARIOS.find((s) => s.id === 'ds_cba_wage_distortion');
  assert.equal(cbaGrievance?.correctForumId, 'voluntary_arbitrator');

  const smallClaim = DISPUTE_SCENARIOS.find((s) => s.id === 'ds_kasambahay_summary_claim');
  assert.equal(smallClaim?.correctForumId, 'dole_regional_director_129');
});
