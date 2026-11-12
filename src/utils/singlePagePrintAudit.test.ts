import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildDynamicPrintPageCss } from './printHelper';

test('Single-page print containers have unconstrained height and overflow visible in CSS', () => {
  const cssContent = readFileSync(join(process.cwd(), 'src/index.css'), 'utf-8');

  // Verify passport rules
  assert.ok(
    cssContent.includes('#labor-jurist-passport-sheet') &&
    cssContent.includes('max-height: none !important') &&
    cssContent.includes('overflow: visible !important'),
    'index.css must provide unconstrained height and visible overflow for passport'
  );

  // Verify certificate, diploma, and bowser victory
  assert.ok(
    cssContent.includes('#official-labor-certificate') &&
    cssContent.includes('#royal-juris-diploma-sheet') &&
    cssContent.includes('#bowser-victory-sheet'),
    'index.css must have print rules for all major single page documents'
  );

  // Ensure no restrictive 198mm max-height remains on single page sheets
  assert.ok(
    !cssContent.includes('#labor-jurist-passport-sheet {\n    max-height: 198mm !important'),
    'Passport sheet must not have 198mm max-height limitation'
  );
  assert.ok(
    !cssContent.includes('#royal-juris-diploma-sheet {\n    max-height: 198mm !important'),
    'Diploma sheet must not have 198mm max-height limitation'
  );
});

test('buildDynamicPrintPageCss provides auto sizing and unconstrained height for preview_exact and single page documents', () => {
  const css = buildDynamicPrintPageCss('landscape', '0', 'sans-serif', 'preview_exact');

  assert.ok(
    css.includes('size: auto;'),
    'preview_exact must set page size to auto for exact preview matching'
  );

  assert.ok(
    css.includes('#labor-jurist-passport-sheet') &&
    css.includes('max-height: none !important') &&
    css.includes('overflow: visible !important'),
    'buildDynamicPrintPageCss must ensure max-height: none and overflow: visible on single page sheets'
  );
});

test('PrintStudyGuideModal source guarantees 1:1 preview visual capture on single page documents', () => {
  const modalCode = readFileSync(join(process.cwd(), 'src/components/PrintStudyGuideModal.tsx'), 'utf-8');

  // Verify isSinglePageMode triggers exact preview capture
  assert.ok(
    modalCode.includes('const isSinglePageMode = documentMode !== \'guide\';') &&
    modalCode.includes('downloadExactPreviewVisualPdfAsync'),
    'Modal must direct all single page documents to exact visual preview engine'
  );

  // Verify passport sheet element has unconstrained height and overflow classes
  assert.ok(
    modalCode.includes('id="labor-jurist-passport-sheet"') &&
    modalCode.includes('print:max-h-none') &&
    modalCode.includes('print:h-auto') &&
    modalCode.includes('print:overflow-visible'),
    'Passport element in modal must have print:max-h-none, print:h-auto, and print:overflow-visible'
  );

  // Verify summary sheet class contains printing-summary-only handling
  assert.ok(
    modalCode.includes('printing-summary-only'),
    'Modal must support printing-summary-only class in print lifecycle'
  );
});
