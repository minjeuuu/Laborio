import test from 'node:test';
import assert from 'node:assert/strict';
import {
  EXTENDED_PRINT_COLOR_THEMES,
  EXTENDED_PRINT_FONT_CATALOG,
  resolveExtendedPrintFont,
  resolveExtendedPrintTheme,
} from './round12Features';
import { generatePassportMrz } from './passportData';

test('EXTENDED_PRINT_FONT_CATALOG contains all 44 authentic fonts', () => {
  assert.strictEqual(EXTENDED_PRINT_FONT_CATALOG.length, 44);
  const font = resolveExtendedPrintFont('jakarta_sans');
  assert.ok(font);
  assert.strictEqual(font.id, 'jakarta_sans');
  assert.ok(font.primaryFamily.length > 0);
});

test('EXTENDED_PRINT_COLOR_THEMES contains all 52 themes', () => {
  assert.strictEqual(EXTENDED_PRINT_COLOR_THEMES.length, 52);
  const theme = resolveExtendedPrintTheme('classic_navy');
  assert.ok(theme);
  assert.strictEqual(theme.id, 'classic_navy');
});

test('generatePassportMrz outputs strictly 44 characters per line adhering to ICAO 9303 specs', () => {
  const mrz = generatePassportMrz({
    surname: 'CORPUZ',
    givenNames: 'MATTHEW CESAR',
    fullName: 'CORPUZ, MATTHEW CESAR',
    passportNumber: 'PH-2025-BAR-9988',
    nationality: 'PHL',
    dateOfBirth: '1998-05-14',
    placeOfBirth: 'MANILA, PHILIPPINES',
    sex: 'M',
    issuingAuthority: 'SUPREME COURT OF THE PHILIPPINES',
  });

  assert.strictEqual(mrz.line1.length, 44, 'MRZ Line 1 must be strictly 44 characters');
  assert.strictEqual(mrz.line2.length, 44, 'MRZ Line 2 must be strictly 44 characters');
  assert.ok(mrz.line1.startsWith('P<PHL'), 'MRZ Line 1 must begin with standard passport code P<PHL');
});

test('buildDynamicPrintPageCss contains all print isolation modes and break avoidance rules', async () => {
  const { buildDynamicPrintPageCss, MODE_BODY_CLASS } = await import('./printHelper');
  
  const expectedModes = [
    'study-guide',
    'summary',
    'certificate',
    'diploma',
    'scorecard',
    'hero-scorecard',
    'cheatsheet',
    'bowser-victory',
    'passport',
    'leaves-matrix',
    'prescriptive',
    'dispute-flowchart',
    'formula-audit',
    'bar-essay',
    'weak-flashcards',
  ];

  for (const mode of expectedModes) {
    assert.ok(
      (MODE_BODY_CLASS as Record<string, string>)[mode],
      `MODE_BODY_CLASS must contain mapping for mode: ${mode}`
    );
  }

  const cssLandscape = buildDynamicPrintPageCss('landscape', '6mm', undefined, 'a4');
  assert.ok(cssLandscape.includes('landscape'));
  assert.ok(cssLandscape.includes('#statutory-leaves-matrix-sheet'));

  const cssPortrait = buildDynamicPrintPageCss('portrait', '8mm', undefined, 'a4');
  assert.ok(cssPortrait.includes('portrait'));
  assert.ok(cssPortrait.includes('#bar-essay-solution-sheet'));
  assert.ok(cssPortrait.includes('#hero-score-card-sheet'));
  assert.ok(cssPortrait.includes('#labor-formula-audit-sheet'));
});

