import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectNotePerfection,
  perfectifyNoteContent,
  isProblemScenarioText,
  isCodalOrFormulaText,
  detectCategoricalStance,
  detectStatutoryCitation,
} from './notePerfectionDetector';

test('detectNotePerfection accurately scores high-yield problem note and detects Yes/No necessity', () => {
  const note = {
    title: 'Compensable Meal Periods',
    content:
      'Can an employer deduct a 1-hour meal period if workers are on-call during lunch?\n' +
      'No. Under Article 85 of the Labor Code, meal periods are compensable hours worked if the employee is required to remain on stand-by or is not completely freed from duties.',
  };

  const report = detectNotePerfection(note);
  assert.equal(report.isCategoricalNecessary, true);
  assert.equal(report.hasCategoricalStance, true);
  assert.equal(report.hasStatutoryCitation, true);
  assert.equal(report.hasCleanPunctuation, true);
  assert.equal(report.score, 100);
  assert.equal(report.grade, 'Supreme Court Ready (100%)');
});

test('detectNotePerfection identifies when Yes/No is NOT necessary for objective codal definition/formula', () => {
  const note = {
    title: 'Night Shift Differential Rate',
    content:
      'Controlling codal rule: Art. 86 requires an additional ten percent (10%) of the regular wage for each hour of work performed between 10:00 PM and 6:00 AM of the following day.',
  };

  const report = detectNotePerfection(note);
  assert.equal(report.isCategoricalNecessary, false);
  assert.match(report.categoricalAdvice, /NOT necessary/i);
  assert.equal(report.hasStatutoryCitation, true);
  assert.equal(report.score, 100);
});

test('perfectifyNoteContent heals awkward "no; yes;" sequences into Supreme Court format', () => {
  const raw =
    'Travel Time Doctrine: Is travel compensable? no; yes; under Boie-Takeda and Auto Bus Transport, travel from home to work is not compensable, but travel between job sites during the day is compensable.';

  const perfected = perfectifyNoteContent('Travel Time', raw);
  assert.doesNotMatch(perfected.content, /no;\s*yes;/i);
  assert.match(perfected.content, /General Rule: No\. Exception: Yes/i);
});

test('perfectifyNoteContent normalizes "No; under" and "Yes; under" to clean periods', () => {
  const raw = 'No; under Art. 91, the employer cannot unilaterally violate religious rest preference.';
  const perfected = perfectifyNoteContent('Rest Day Preference', raw);
  assert.match(perfected.content, /^NO\. Under Art\. 91/i);
});

test('detectCategoricalStance flags awkward semicolons in notes', () => {
  const awkward = 'Rule: no; yes; depends on the CBA.';
  const res = detectCategoricalStance(awkward);
  assert.equal(res.isAwkwardSemicolon, true);
});

test('detectStatutoryCitation detects Arts, RAs, PDs, DOs, and Landmark SC doctrines', () => {
  assert.equal(detectStatutoryCitation('Under Art. 83 normal hours').hasCitation, true);
  assert.equal(detectStatutoryCitation('Pursuant to R.A. 11210 105 days').hasCitation, true);
  assert.equal(detectStatutoryCitation('Boie-Takeda Chemicals v. Dela Serna').hasCitation, true);
  assert.equal(detectStatutoryCitation('D.O. 174-17 capitalization rule').hasCitation, true);
  assert.equal(detectStatutoryCitation('No citation here at all').hasCitation, false);
});
