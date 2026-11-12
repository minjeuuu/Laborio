import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENARIO_PRESETS } from '../components/QuickPayMultiplierHUD';

test('SCENARIO_PRESETS contains all standard Philippine Labor Code day types', () => {
  const ids = SCENARIO_PRESETS.map((s) => s.id);
  assert.ok(ids.includes('ordinary'));
  assert.ok(ids.includes('rest_day'));
  assert.ok(ids.includes('special_holiday'));
  assert.ok(ids.includes('special_holiday_rest_day'));
  assert.ok(ids.includes('regular_holiday_unworked'));
  assert.ok(ids.includes('regular_holiday_worked'));
  assert.ok(ids.includes('regular_holiday_rest_day'));
  assert.ok(ids.includes('double_holiday_unworked'));
  assert.ok(ids.includes('double_holiday_worked'));
  assert.ok(ids.includes('double_holiday_rest_day'));
});

test('Ordinary Workday multipliers match Art. 83 & 87 (100% regular, 125% OT)', () => {
  const ordinary = SCENARIO_PRESETS.find((s) => s.id === 'ordinary')!;
  assert.equal(ordinary.multiplier, 1.0);
  assert.equal(ordinary.otMultiplier, 1.25);
});

test('Rest Day multipliers match Art. 93 (130% regular, 169% OT)', () => {
  const restDay = SCENARIO_PRESETS.find((s) => s.id === 'rest_day')!;
  assert.equal(restDay.multiplier, 1.3);
  // 130% * 130% = 169%
  assert.equal(restDay.otMultiplier, 1.69);
});

test('Special Holiday on Rest Day matches Art. 93(c) (150% regular, 195% OT)', () => {
  const specialRest = SCENARIO_PRESETS.find((s) => s.id === 'special_holiday_rest_day')!;
  assert.equal(specialRest.multiplier, 1.5);
  // 150% * 130% = 195%
  assert.equal(specialRest.otMultiplier, 1.95);
});

test('Regular Holiday matches Art. 94 (200% worked, 260% OT, 100% unworked)', () => {
  const regWorked = SCENARIO_PRESETS.find((s) => s.id === 'regular_holiday_worked')!;
  assert.equal(regWorked.multiplier, 2.0);
  // 200% * 130% = 260%
  assert.equal(regWorked.otMultiplier, 2.6);

  const regUnworked = SCENARIO_PRESETS.find((s) => s.id === 'regular_holiday_unworked')!;
  assert.equal(regUnworked.multiplier, 1.0);
  assert.equal(regUnworked.isUnworked, true);
});

test('Double Holiday matches Asian Transmission v. CA (300% worked, 390% OT, 200% unworked, 507% on Rest Day OT)', () => {
  const doubleWorked = SCENARIO_PRESETS.find((s) => s.id === 'double_holiday_worked')!;
  assert.equal(doubleWorked.multiplier, 3.0);
  assert.equal(doubleWorked.otMultiplier, 3.9);

  const doubleUnworked = SCENARIO_PRESETS.find((s) => s.id === 'double_holiday_unworked')!;
  assert.equal(doubleUnworked.multiplier, 2.0);

  const doubleRest = SCENARIO_PRESETS.find((s) => s.id === 'double_holiday_rest_day')!;
  assert.equal(doubleRest.multiplier, 3.9);
  // 390% * 130% = 507%
  assert.equal(doubleRest.otMultiplier, 5.07);
});
