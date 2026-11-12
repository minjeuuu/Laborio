import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRESCRIPTIVE_PERIODS_DATA,
  filterPrescriptivePeriods,
} from './prescriptivePeriods';

test('PRESCRIPTIVE_PERIODS_DATA contains core statutory deadlines', () => {
  assert.ok(PRESCRIPTIVE_PERIODS_DATA.length >= 10);
  
  // Key provisions must exist
  const ids = PRESCRIPTIVE_PERIODS_DATA.map((p) => p.id);
  assert.ok(ids.includes('money_claims_art306'));
  assert.ok(ids.includes('illegal_dismissal_art1146'));
  assert.ok(ids.includes('ulp_art305'));
  assert.ok(ids.includes('la_to_nlrc_appeal_art229'));
  assert.ok(ids.includes('ca_certiorari_rule65'));
  assert.ok(ids.includes('economic_sabotage_recruitment'));
});

test('PRESCRIPTIVE_PERIODS_DATA periods match statutory law', () => {
  const moneyClaims = PRESCRIPTIVE_PERIODS_DATA.find((p) => p.id === 'money_claims_art306');
  assert.ok(moneyClaims);
  assert.equal(moneyClaims.correctPeriod, '3 Years');
  assert.ok(moneyClaims.choices.includes('3 Years'));

  const illegalDismissal = PRESCRIPTIVE_PERIODS_DATA.find((p) => p.id === 'illegal_dismissal_art1146');
  assert.ok(illegalDismissal);
  assert.equal(illegalDismissal.correctPeriod, '4 Years');
  assert.ok(illegalDismissal.choices.includes('4 Years'));

  const ulp = PRESCRIPTIVE_PERIODS_DATA.find((p) => p.id === 'ulp_art305');
  assert.ok(ulp);
  assert.equal(ulp.correctPeriod, '1 Year');

  const nlrcAppeal = PRESCRIPTIVE_PERIODS_DATA.find((p) => p.id === 'la_to_nlrc_appeal_art229');
  assert.ok(nlrcAppeal);
  assert.equal(nlrcAppeal.correctPeriod, '10 Calendar Days');

  const econSabotage = PRESCRIPTIVE_PERIODS_DATA.find((p) => p.id === 'economic_sabotage_recruitment');
  assert.ok(econSabotage);
  assert.equal(econSabotage.correctPeriod, '20 Years');
});

test('filterPrescriptivePeriods filters by category and search queries', () => {
  const allItems = filterPrescriptivePeriods(PRESCRIPTIVE_PERIODS_DATA, 'all', '');
  assert.equal(allItems.length, PRESCRIPTIVE_PERIODS_DATA.length);

  const appealsOnly = filterPrescriptivePeriods(PRESCRIPTIVE_PERIODS_DATA, 'appeals', '');
  assert.ok(appealsOnly.length >= 3);
  appealsOnly.forEach((item) => assert.equal(item.category, 'appeals'));

  const searchResults = filterPrescriptivePeriods(PRESCRIPTIVE_PERIODS_DATA, 'all', 'Auto Bus');
  assert.ok(searchResults.length >= 1);
  assert.ok(searchResults.some((item) => item.id === 'money_claims_art306'));
});
