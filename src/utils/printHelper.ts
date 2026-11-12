export type PrintIsolationMode =
  | 'certificate'
  | 'scorecard'
  | 'diploma'
  | 'toadshop-diploma'
  | 'cheatsheet'
  | 'bowser-victory'
  | 'passport'
  | 'weak-flashcards'
  | 'study-guide'
  | 'summary'
  | 'formula-audit'
  | 'bar-essay'
  | 'leaves-matrix'
  | 'prescriptive'
  | 'dispute-flowchart'
  | 'hero-scorecard';

export type PrintOrientation = 'landscape' | 'portrait';

const DYNAMIC_PRINT_STYLE_ID = 'mario-dynamic-print-page';

export const MODE_BODY_CLASS: Record<PrintIsolationMode, string> = {
  certificate: 'printing-certificate-only',
  scorecard: 'printing-scorecard-only',
  diploma: 'printing-diploma-only',
  'toadshop-diploma': 'printing-toadshop-diploma-only',
  cheatsheet: 'printing-cheatsheet-only',
  'bowser-victory': 'printing-bowser-victory-only',
  passport: 'printing-passport-only',
  'weak-flashcards': 'printing-weak-flashcards-only',
  'study-guide': 'printing-study-guide-only',
  summary: 'printing-summary-only',
  'formula-audit': 'printing-formula-audit-only',
  'bar-essay': 'printing-bar-essay-only',
  'leaves-matrix': 'printing-leaves-matrix-only',
  prescriptive: 'printing-prescriptive-only',
  'dispute-flowchart': 'printing-dispute-flowchart-only',
  'hero-scorecard': 'printing-hero-scorecard-only',
};

const ALL_PRINT_BODY_CLASSES = Object.values(MODE_BODY_CLASS);

/**
 * Pure helper generating an unnamed @page rule inside @media print.
 * Overriding the unnamed @page rule ensures Chromium/Firefox/Safari apply the
 * exact orientation (especially A4 landscape for Certificates) even to fixed/portaled blocks.
 * Also injects the user's selected font-family stack so paper and PDF print dialogs
 * apply the exact typeface cleanly with 100% cascade fidelity across all sheets.
 */
export function buildDynamicPrintPageCss(
  orientation: PrintOrientation,
  marginCss?: string,
  fontStack?: string,
  paperSize?: string
): string {
  const resolvedMargin =
    marginCss ?? (orientation === 'landscape' ? '6mm' : '10mm 12mm');
  const sizeName =
    paperSize === 'letter'
      ? 'letter'
      : paperSize === 'legal'
      ? 'legal'
      : paperSize === 'a3'
      ? 'A3'
      : paperSize === 'a5'
      ? 'A5'
      : paperSize === 'preview_exact'
      ? 'auto'
      : 'A4';
  const pageSize =
    sizeName === 'auto'
      ? 'auto'
      : orientation === 'landscape'
      ? `${sizeName} landscape`
      : `${sizeName} portrait`;
  const cleanFont = fontStack ? fontStack.trim() : '';
  const fontOverride = cleanFont
    ? `
:root {
  --print-active-font: ${cleanFont};
}
html, body, #root {
  --print-active-font: ${cleanFont};
}
#printable-study-guide,
#printable-study-guide *:not(.font-preserve):not(.preserve-system-font),
#one-page-summary-sheet,
#one-page-summary-sheet *:not(.font-preserve):not(.preserve-system-font),
#official-labor-certificate,
#official-labor-certificate *:not(.font-preserve):not(.preserve-system-font),
#official-scorecard-sheet,
#official-scorecard-sheet *:not(.font-preserve):not(.preserve-system-font),
#official-player-scorecard,
#official-player-scorecard *:not(.font-preserve):not(.preserve-system-font),
#master-diploma-printable,
#master-diploma-printable *:not(.font-preserve):not(.preserve-system-font),
#royal-juris-diploma-sheet,
#royal-juris-diploma-sheet *:not(.font-preserve):not(.preserve-system-font),
#statutory-cheatsheet-sheet,
#statutory-cheatsheet-sheet *:not(.font-preserve):not(.preserve-system-font),
#bowser-victory-sheet,
#bowser-victory-sheet *:not(.font-preserve):not(.preserve-system-font),
#labor-jurist-passport-sheet,
#labor-jurist-passport-sheet *:not(.font-preserve):not(.preserve-system-font),
#printable-weak-flashcards-sheet,
#printable-weak-flashcards-sheet *:not(.font-preserve):not(.preserve-system-font),
#labor-formula-audit-sheet,
#labor-formula-audit-sheet *:not(.font-preserve):not(.preserve-system-font),
#bar-essay-solution-sheet,
#bar-essay-solution-sheet *:not(.font-preserve):not(.preserve-system-font),
#statutory-leaves-matrix-sheet,
#statutory-leaves-matrix-sheet *:not(.font-preserve):not(.preserve-system-font),
#prescriptive-periods-cheatsheet-sheet,
#prescriptive-periods-cheatsheet-sheet *:not(.font-preserve):not(.preserve-system-font),
#labor-dispute-flowchart-sheet,
#labor-dispute-flowchart-sheet *:not(.font-preserve):not(.preserve-system-font),
#hero-score-card-sheet,
#hero-score-card-sheet *:not(.font-preserve):not(.preserve-system-font),
.printable-standalone-sheet,
.printable-standalone-sheet *:not(.font-preserve):not(.preserve-system-font),
.dynamic-print-font-target,
.dynamic-print-font-target *:not(.font-preserve):not(.preserve-system-font),
[data-printable-sheet="true"],
[data-printable-sheet="true"] *:not(.font-preserve):not(.preserve-system-font),
[data-testid="print-scaled-stage-inner"],
[data-testid="print-scaled-stage-inner"] *:not(.font-preserve):not(.preserve-system-font) {
  font-family: ${cleanFont} !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
`
    : '';

  return `${fontOverride}
@media print {
  @page {
    size: ${pageSize};
    margin: ${resolvedMargin};
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }
  :is(
    #one-page-summary-sheet,
    #official-labor-certificate,
    #master-diploma-printable,
    #royal-juris-diploma-sheet,
    #official-scorecard-sheet,
    #official-player-scorecard,
    #hero-score-card-sheet,
    #statutory-cheatsheet-sheet,
    #bowser-victory-sheet,
    #labor-jurist-passport-sheet,
    #labor-formula-audit-sheet,
    #bar-essay-solution-sheet,
    #statutory-leaves-matrix-sheet,
    #prescriptive-periods-cheatsheet-sheet,
    #labor-dispute-flowchart-sheet,
    [data-single-page="true"]
  ) {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    page-break-after: avoid !important;
    break-after: avoid !important;
    page-break-before: avoid !important;
    break-before: avoid !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    max-height: none !important;
    height: auto !important;
  }
${fontOverride}}`;
}

/**
 * Ensures web fonts are fully fetched and rasterized in the browser FontFaceSet
 * before window.print() or canvas capture begins, avoiding fallback to Times/Arial.
 */
export async function ensurePrintFontsReady(fontStack?: string): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    if (fontStack) {
      const match = fontStack.match(/^['"]?([^,'"]+)['"]?/);
      const primary = match ? match[1].trim() : '';
      if (
        primary &&
        !['helvetica', 'times', 'courier', 'arial', 'sans-serif', 'serif', 'monospace'].includes(
          primary.toLowerCase()
        )
      ) {
        await Promise.allSettled([
          document.fonts.load(`400 16px "${primary}"`),
          document.fonts.load(`500 16px "${primary}"`),
          document.fonts.load(`600 16px "${primary}"`),
          document.fonts.load(`700 16px "${primary}"`),
          document.fonts.load(`800 16px "${primary}"`),
          document.fonts.load(`bold 16px "${primary}"`),
          document.fonts.load(`italic 16px "${primary}"`),
        ]);
      }
    }
    await document.fonts.ready;
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Injects or updates the <style id="mario-dynamic-print-page"> tag at the end of document.head
 * so both button-triggered prints, screen previews, html2canvas, and keyboard Ctrl+P / Cmd+P
 * use the right page orientation and the user's selected typography with 100% cascade fidelity.
 */
export function applyPrintPageRule(
  orientation: PrintOrientation,
  marginCss?: string,
  fontStack?: string,
  paperSize?: string
): void {
  if (typeof document === 'undefined') return;
  let styleEl = document.getElementById(DYNAMIC_PRINT_STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = DYNAMIC_PRINT_STYLE_ID;
  }
  styleEl.textContent = buildDynamicPrintPageCss(orientation, marginCss, fontStack, paperSize);
  document.head.appendChild(styleEl);
  document.body.setAttribute('data-print-orientation', orientation);
  if (fontStack) {
    document.documentElement.style.setProperty('--print-active-font', fontStack);
    document.body.style.setProperty('--print-active-font', fontStack);
    ensurePrintFontsReady(fontStack);
  }
}

export function clearPrintPageRule(): void {
  if (typeof document === 'undefined') return;
  const styleEl = document.getElementById(DYNAMIC_PRINT_STYLE_ID);
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }
  document.body.removeAttribute('data-print-orientation');
  document.body.style.removeProperty('--print-active-font');
  document.documentElement.style.removeProperty('--print-active-font');
}

export interface TriggerCleanPrintOptions {
  mode: PrintIsolationMode;
  orientation: PrintOrientation;
  marginCss?: string;
  fontStack?: string;
  restoreOrientationOnFinish?: {
    orientation: PrintOrientation;
    marginCss?: string;
    fontStack?: string;
  } | null;
}

/**
 * Applies print page orientation rule without invoking window.print(),
 * ensuring mobile/desktop buttons never redirect to the native phone print dialog.
 */
export function triggerCleanPrint(options: TriggerCleanPrintOptions): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const { mode, orientation, marginCss, fontStack, restoreOrientationOnFinish = null } = options;
  const targetBodyClass = MODE_BODY_CLASS[mode];

  ALL_PRINT_BODY_CLASSES.forEach((cls) => document.body.classList.remove(cls));
  document.body.classList.add(targetBodyClass);
  applyPrintPageRule(orientation, marginCss, fontStack);

  window.setTimeout(() => {
    document.body.classList.remove(targetBodyClass);
    if (restoreOrientationOnFinish) {
      applyPrintPageRule(
        restoreOrientationOnFinish.orientation,
        restoreOrientationOnFinish.marginCss,
        restoreOrientationOnFinish.fontStack
      );
    } else {
      clearPrintPageRule();
    }
  }, 400);
}

/**
 * Triggers native system browser printing (Ctrl+P / Cmd+P) while strictly applying
 * the document's selected orientation and active font stack.
 */
export function invokeBrowserPrint(options?: {
  orientation?: PrintOrientation;
  marginCss?: string;
  margin?: string;
  fontStack?: string;
  paperSize?: string;
  beforePrint?: () => void;
  afterPrint?: () => void;
}): void {
  if (typeof window === 'undefined') return;
  if (options?.orientation) {
    applyPrintPageRule(options.orientation, options.marginCss || options.margin, options.fontStack, options.paperSize);
  }
  if (options?.beforePrint) {
    options.beforePrint();
  }
  window.setTimeout(() => {
    window.print();
    if (options?.afterPrint) {
      options.afterPrint();
    }
  }, 60);
}

/**
 * Universal publication-grade printing pipeline with guaranteed FontFaceSet resolution,
 * document isolation, orientation enforcement, and seamless 1:1 preview matching.
 */
export async function triggerPrintWithDocumentFont(options: {
  orientation?: PrintOrientation;
  marginCss?: string;
  margin?: string;
  fontStack?: string;
  paperSize?: string;
  mode?: PrintIsolationMode;
  beforePrint?: () => void;
  afterPrint?: () => void;
}): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const orientation = options.orientation || 'portrait';
  const marginCss = options.marginCss || options.margin || (orientation === 'landscape' ? '5mm 6mm' : '6mm 8mm');
  const fontStack = options.fontStack;

  // Apply isolation class to hide non-printing elements
  if (options.mode) {
    const targetClass = MODE_BODY_CLASS[options.mode];
    ALL_PRINT_BODY_CLASSES.forEach((cls) => document.body.classList.remove(cls));
    if (targetClass) {
      document.body.classList.add(targetClass);
    }
  }
  document.body.classList.add('mario-printing-preview');

  applyPrintPageRule(orientation, marginCss, fontStack, options.paperSize);

  // Guarantee web fonts are parsed and ready before invoking native print
  if (fontStack) {
    await ensurePrintFontsReady(fontStack);
  }

  if (options.beforePrint) {
    options.beforePrint();
  }

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    ALL_PRINT_BODY_CLASSES.forEach((cls) => document.body.classList.remove(cls));
    document.body.classList.remove('mario-printing-preview');
    if (options.afterPrint) {
      options.afterPrint();
    }
  };

  window.addEventListener('afterprint', cleanup, { once: true });

  window.setTimeout(() => {
    window.print();
    // Safety fallback timeout in case browser does not trigger afterprint
    window.setTimeout(cleanup, 2200);
  }, 100);
}



