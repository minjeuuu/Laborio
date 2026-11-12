import {
  OnePageSummaryPdfOptions,
  CertificatePdfParams,
  StudyGuideReviewerPdfParams,
  ScoreCardPdfParams,
  buildOnePageSummaryPdfBytes,
  buildCertificatePdfBytes,
  buildMasterDiplomaPdfBytes,
  buildStudyGuideReviewerPdfBytes,
  buildScoreCardLandscapePdfBytes,
  downloadExactPreviewVisualPdfAsync,
  buildExactPreviewVisualPdfBytesAsync,
  triggerPdfDownloadFromBytes,
  MIN_REVIEWER_PDF_BYTES,
  MIN_COMPLETE_REVIEWER_PDF_BYTES,
} from './pdfExportService';
import {
  resolveExtendedPrintFont,
  ExtendedPrintFontSpec,
} from './round12Features';

export interface LoadedFontData {
  fontName: string;
  base64: string;
  mediumBase64?: string;
  boldBase64?: string;
  blackBase64?: string;
  italicBase64?: string;
  boldItalicBase64?: string;
  pixelBase64?: string;
}

const fontTtfBase64Cache = new Map<string, LoadedFontData>();

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 8192) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, Math.min(i + 8192, len))));
  }
  return btoa(binary);
}

async function fetchVariantBuffer(slug: string, variant: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(`https://cdn.jsdelivr.net/fontsource/fonts/${slug}@latest/${variant}.ttf`);
    if (res.ok) {
      const b = await res.arrayBuffer();
      if (b.byteLength > 500) return b;
    }
  } catch {}
  try {
    const res = await fetch(`https://unpkg.com/@fontsource/${slug}/files/${slug}-${variant}.ttf`);
    if (res.ok) {
      const b = await res.arrayBuffer();
      if (b.byteLength > 500) return b;
    }
  } catch {}
  return null;
}

/**
 * Loads the TrueType (.ttf) font data for the user's chosen font style from Google Fonts
 * and encodes regular, bold (700), and italic variants as base64 so jsPDF can embed
 * the exact vector fonts with genuine bold weights and typography matching the screen preview.
 */
export async function fetchGoogleFontTtfBase64ForStyle(
  fontStyle?: string
): Promise<LoadedFontData | null> {
  const spec = resolveExtendedPrintFont(fontStyle);
  const primaryFamily = spec.primaryFamily.replace(/['"]/g, '').trim();
  const safeFontName = primaryFamily.replace(/[^a-zA-Z0-9]/g, '');

  if (fontTtfBase64Cache.has(safeFontName)) {
    return fontTtfBase64Cache.get(safeFontName)!;
  }

  const systemFamilies = [
    'helvetica',
    'times',
    'courier',
    'arial',
    'georgia',
    'times new roman',
    'sans-serif',
    'serif',
    'monospace',
  ];
  if (systemFamilies.includes(primaryFamily.toLowerCase())) {
    return null;
  }

  try {
    const slug = primaryFamily.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Fetch regular, medium (600), bold (700), black (800), italic, bold-italic, and authentic Mario pixel font in parallel
    const [regResult, medResult, boldResult, blkResult, italicResult, boldItalicResult, pixelResult] = await Promise.allSettled([
      fetchVariantBuffer(slug, 'latin-400-normal'),
      fetchVariantBuffer(slug, 'latin-600-normal'),
      fetchVariantBuffer(slug, 'latin-700-normal'),
      fetchVariantBuffer(slug, 'latin-800-normal'),
      fetchVariantBuffer(slug, 'latin-400-italic'),
      fetchVariantBuffer(slug, 'latin-700-italic'),
      fetchVariantBuffer('press-start-2p', 'latin-400-normal'),
    ]);

    let regBuf = regResult.status === 'fulfilled' ? regResult.value : null;

    // Fallback: Google Fonts CSS2 API (works when caller is curl/node or if gstatic serves .ttf)
    if (!regBuf) {
      try {
        const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(primaryFamily)}`;
        const cssRes = await fetch(cssUrl);
        if (cssRes.ok) {
          const css = await cssRes.text();
          const ttfMatch = css.match(/src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^\)]+\.ttf)\)/);
          if (ttfMatch) {
            const ttfRes = await fetch(ttfMatch[1]);
            if (ttfRes.ok) {
              regBuf = await ttfRes.arrayBuffer();
            }
          }
        }
      } catch {}
    }

    if (!regBuf || regBuf.byteLength < 500) {
      return null;
    }

    const medBuf = medResult.status === 'fulfilled' ? medResult.value : null;
    const boldBuf = boldResult.status === 'fulfilled' ? boldResult.value : null;
    const blkBuf = blkResult.status === 'fulfilled' ? blkResult.value : null;
    const italicBuf = italicResult.status === 'fulfilled' ? italicResult.value : null;
    const boldItalicBuf = boldItalicResult.status === 'fulfilled' ? boldItalicResult.value : null;
    const pixelBuf = pixelResult.status === 'fulfilled' ? pixelResult.value : null;

    const fontData: LoadedFontData = {
      fontName: safeFontName,
      base64: bufferToBase64(regBuf),
      mediumBase64: medBuf && medBuf.byteLength > 500 ? bufferToBase64(medBuf) : undefined,
      boldBase64: boldBuf && boldBuf.byteLength > 500 ? bufferToBase64(boldBuf) : undefined,
      blackBase64: blkBuf && blkBuf.byteLength > 500 ? bufferToBase64(blkBuf) : undefined,
      italicBase64: italicBuf && italicBuf.byteLength > 500 ? bufferToBase64(italicBuf) : undefined,
      boldItalicBase64: boldItalicBuf && boldItalicBuf.byteLength > 500 ? bufferToBase64(boldItalicBuf) : undefined,
      pixelBase64: pixelBuf && pixelBuf.byteLength > 500 ? bufferToBase64(pixelBuf) : undefined,
    };
    fontTtfBase64Cache.set(safeFontName, fontData);
    return fontData;
  } catch (err) {
    console.warn(`Could not load TTF font for ${primaryFamily}:`, err);
    return null;
  }
}

export async function ensurePrintFontLoadedInBrowser(fontStyle?: string): Promise<ExtendedPrintFontSpec> {
  const spec = resolveExtendedPrintFont(fontStyle);
  if (typeof document === 'undefined' || !('fonts' in document) || !document.fonts?.load) {
    return spec;
  }
  try {
    const familyQuoted = `"${spec.primaryFamily.replace(/"/g, '')}"`;
    await Promise.race([
      Promise.allSettled([
        document.fonts.load(`400 16px ${familyQuoted}`),
        document.fonts.load(`600 16px ${familyQuoted}`),
        document.fonts.load(`700 18px ${familyQuoted}`),
        document.fonts.load(`800 20px ${familyQuoted}`),
      ]),
      new Promise((resolve) => setTimeout(resolve, 350)),
    ]);
  } catch {
    // Proceed gracefully if offline or system font
  }
  return spec;
}

/**
 * Builds self-contained @font-face CSS rules with embedded base64 font data
 * so SVG foreignObject (used by html-to-image toPng) can render Google Fonts
 * without being blocked by cross-origin security or offline states.
 */
export async function buildFontEmbedCssForStyle(fontStyle?: string): Promise<string> {
  const spec = resolveExtendedPrintFont(fontStyle);
  const primaryFamily = spec.primaryFamily.replace(/['"]/g, '').trim();
  const fontData = await fetchGoogleFontTtfBase64ForStyle(fontStyle);

  const fontFaces: string[] = [];

  if (fontData?.base64) {
    fontFaces.push(`
@font-face {
  font-family: '${primaryFamily}';
  font-weight: 400;
  font-style: normal;
  src: url('data:font/ttf;base64,${fontData.base64}') format('truetype');
}
@font-face {
  font-family: '${spec.name}';
  font-weight: 400;
  font-style: normal;
  src: url('data:font/ttf;base64,${fontData.base64}') format('truetype');
}
`);
  }

  if (fontData?.boldBase64) {
    fontFaces.push(`
@font-face {
  font-family: '${primaryFamily}';
  font-weight: 700;
  font-style: normal;
  src: url('data:font/ttf;base64,${fontData.boldBase64}') format('truetype');
}
@font-face {
  font-family: '${spec.name}';
  font-weight: 700;
  font-style: normal;
  src: url('data:font/ttf;base64,${fontData.boldBase64}') format('truetype');
}
`);
  }

  if (fontData?.italicBase64) {
    fontFaces.push(`
@font-face {
  font-family: '${primaryFamily}';
  font-weight: 400;
  font-style: italic;
  src: url('data:font/ttf;base64,${fontData.italicBase64}') format('truetype');
}
@font-face {
  font-family: '${spec.name}';
  font-weight: 400;
  font-style: italic;
  src: url('data:font/ttf;base64,${fontData.italicBase64}') format('truetype');
}
`);
  }

  if (fontData?.boldItalicBase64) {
    fontFaces.push(`
@font-face {
  font-family: '${primaryFamily}';
  font-weight: 700;
  font-style: italic;
  src: url('data:font/ttf;base64,${fontData.boldItalicBase64}') format('truetype');
}
`);
  }

  let cdnImports = '';
  if (typeof document !== 'undefined') {
    const fontLinks = Array.from(
      document.querySelectorAll<HTMLLinkElement>(
        'link[rel="stylesheet"][href*="fonts.googleapis.com"]'
      )
    ).map((link) => `@import url('${link.href}');`);
    cdnImports = fontLinks.join('\n');
  }

  const overrideRules = `
:root {
  --print-active-font: ${spec.cssFontFamily} !important;
}
body {
  --print-active-font: ${spec.cssFontFamily} !important;
}
.dynamic-print-root,
.dynamic-print-root *:not(.preserve-system-font):not(.font-preserve),
#one-page-summary-sheet *:not(.preserve-system-font):not(.font-preserve),
#official-labor-certificate *:not(.preserve-system-font):not(.font-preserve),
#official-scorecard-sheet *:not(.preserve-system-font):not(.font-preserve),
#official-player-scorecard *:not(.preserve-system-font):not(.font-preserve),
#master-diploma-printable *:not(.preserve-system-font):not(.font-preserve),
#royal-juris-diploma-sheet *:not(.preserve-system-font):not(.font-preserve),
#statutory-cheatsheet-sheet *:not(.preserve-system-font):not(.font-preserve),
#bowser-victory-sheet *:not(.preserve-system-font):not(.font-preserve),
#labor-jurist-passport-sheet *:not(.preserve-system-font):not(.font-preserve),
#printable-study-guide *:not(.preserve-system-font):not(.font-preserve),
.printable-standalone-sheet *:not(.preserve-system-font):not(.font-preserve),
.dynamic-print-font-target *:not(.preserve-system-font):not(.font-preserve) {
  font-family: ${spec.cssFontFamily} !important;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}
`;

  return `${cdnImports}\n${fontFaces.join('\n')}\n${overrideRules}`;
}

/**
 * 1. Multi-Page Unabridged Reviewer PDF rendered as 100% Vector PDF with exact chosen font.
 */
export async function buildTrueFontStudyReviewerPdfBytesAsync(
  params: StudyGuideReviewerPdfParams
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const fontData = await fetchGoogleFontTtfBase64ForStyle(params.fontStyle);
  return buildStudyGuideReviewerPdfBytes({
    ...params,
    loadedFont: fontData?.fontName,
    ttfBase64: fontData?.base64,
    boldTtfBase64: fontData?.boldBase64,
    italicTtfBase64: fontData?.italicBase64,
    pixelTtfBase64: fontData?.pixelBase64,
    boldItalicTtfBase64: fontData?.boldItalicBase64,
    blackTtfBase64: fontData?.blackBase64,
  });
}

/**
 * 2. Exact 1-Page Summary Sheet rendered as 100% Vector PDF with exact chosen font.
 */
export async function buildTrueFontOnePageSummaryPdfBytesAsync(
  options: OnePageSummaryPdfOptions = {}
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(options.fontStyle);
  const fontData = await fetchGoogleFontTtfBase64ForStyle(options.fontStyle);
  return buildOnePageSummaryPdfBytes({
    ...options,
    loadedFont: fontData?.fontName,
    ttfBase64: fontData?.base64,
    boldTtfBase64: fontData?.boldBase64,
    italicTtfBase64: fontData?.italicBase64,
    pixelTtfBase64: fontData?.pixelBase64,
    boldItalicTtfBase64: fontData?.boldItalicBase64,
    blackTtfBase64: fontData?.blackBase64,
  });
}

/**
 * 3. Executive Mastery Certificate OR Royal Grand Master Diploma rendered with exact chosen font.
 */
export async function buildTrueFontCertificateOrDiplomaPdfBytesAsync(
  params: CertificatePdfParams,
  isMasterDiploma: boolean = false
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const fontData = await fetchGoogleFontTtfBase64ForStyle(params.fontStyle);
  const enriched = {
    ...params,
    loadedFont: fontData?.fontName,
    ttfBase64: fontData?.base64,
    boldTtfBase64: fontData?.boldBase64,
    italicTtfBase64: fontData?.italicBase64,
    pixelTtfBase64: fontData?.pixelBase64,
    boldItalicTtfBase64: fontData?.boldItalicBase64,
    blackTtfBase64: fontData?.blackBase64,
  };
  return isMasterDiploma
    ? buildMasterDiplomaPdfBytes(enriched)
    : buildCertificatePdfBytes(enriched);
}

/**
 * 4. Official Hero Score Card Landscape PDF rendered with exact chosen font.
 */
export async function buildTrueFontScoreCardPdfBytesAsync(
  params: ScoreCardPdfParams
): Promise<Uint8Array> {
  await ensurePrintFontLoadedInBrowser(params.fontStyle);
  const fontData = await fetchGoogleFontTtfBase64ForStyle(params.fontStyle);
  return buildScoreCardLandscapePdfBytes({
    ...params,
    loadedFont: fontData?.fontName,
    ttfBase64: fontData?.base64,
    boldTtfBase64: fontData?.boldBase64,
    italicTtfBase64: fontData?.italicBase64,
    pixelTtfBase64: fontData?.pixelBase64,
    boldItalicTtfBase64: fontData?.boldItalicBase64,
    blackTtfBase64: fontData?.blackBase64,
  });
}

export async function downloadTrueFontStudyReviewerPdfAsync(
  params: StudyGuideReviewerPdfParams
): Promise<Uint8Array> {
  const bytes = await buildTrueFontStudyReviewerPdfBytesAsync(params);
  const suffix = params.orientation === 'landscape' ? 'Landscape' : 'Portrait';
  const sizeTag = (params.paperSize || 'a4').toUpperCase();
  const isComplete =
    !params.topics ||
    params.topics.length >= 26 ||
    !params.selectedWorlds ||
    params.selectedWorlds.length >= 6;
  const targetBytes = isComplete ? MIN_COMPLETE_REVIEWER_PDF_BYTES : MIN_REVIEWER_PDF_BYTES;
  const filename = isComplete
    ? `Philippine-Labor-Standards-Complete-Reviewer-${suffix}-${sizeTag}.pdf`
    : `Philippine-Labor-Standards-Reviewer-${suffix}-${sizeTag}.pdf`;
  triggerPdfDownloadFromBytes(bytes, filename, targetBytes);
  return bytes;
}

export async function downloadTrueFontOnePageSummaryPdfAsync(
  options: OnePageSummaryPdfOptions = {}
): Promise<Uint8Array> {
  const bytes = await buildTrueFontOnePageSummaryPdfBytesAsync(options);
  const sizeTag = (options.paperSize || 'a4').toUpperCase();
  triggerPdfDownloadFromBytes(bytes, `One-Page-Labor-Formulas-Deadlines-${sizeTag}.pdf`);
  return bytes;
}

export {
  downloadExactPreviewVisualPdfAsync,
  buildExactPreviewVisualPdfBytesAsync,
};

export async function downloadTrueFontCertificatePdfAsync(
  params: CertificatePdfParams
): Promise<Uint8Array> {
  const orient = params.orientation === 'portrait' ? 'Portrait' : 'Landscape';
  const bytes = await buildTrueFontCertificateOrDiplomaPdfBytesAsync(params, false);
  triggerPdfDownloadFromBytes(bytes, `Official-Labor-Mastery-Certificate-${orient}-A4.pdf`);
  return bytes;
}

export async function downloadTrueFontMasterDiplomaPdfAsync(
  params: CertificatePdfParams
): Promise<Uint8Array> {
  const orient = params.orientation === 'portrait' ? 'Portrait' : 'Landscape';
  if (typeof document !== 'undefined') {
    const liveEl =
      document.getElementById('master-diploma-printable') ||
      document.getElementById('royal-juris-diploma-sheet');
    if (liveEl) {
      const { downloadExactPreviewVisualPdfAsync } = await import('./pdfExportService');
      const safeName = (params.recipientName || 'Grand_Master_Labor_Jurist').replace(/\s+/g, '_');
      const res = await downloadExactPreviewVisualPdfAsync(
        liveEl,
        `Royal-Grand-Master-Juris-Diploma-${safeName}-${orient}-Exact.pdf`,
        'Royal Grand Master Juris Diploma in Philippine Labor Standards',
        {
          orientation: params.orientation || 'landscape',
          fontStyle: params.fontStyle,
          colorAccent: params.colorAccent,
        }
      );
      if (res && res.length > 0) return res;
    }
  }
  const bytes = await buildTrueFontCertificateOrDiplomaPdfBytesAsync(params, true);
  triggerPdfDownloadFromBytes(bytes, `Royal-Master-Juris-Diploma-${orient}-A4.pdf`);
  return bytes;
}

export async function downloadTrueFontScoreCardPdfAsync(
  params: ScoreCardPdfParams
): Promise<Uint8Array> {
  const bytes = await buildTrueFontScoreCardPdfBytesAsync(params);
  triggerPdfDownloadFromBytes(bytes, 'Mario-Labor-Hero-Score-Card-A4.pdf');
  return bytes;
}
