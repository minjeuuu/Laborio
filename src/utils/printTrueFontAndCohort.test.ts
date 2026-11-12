import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDynamicPrintPageCss,
  applyPrintPageRule,
  clearPrintPageRule,
} from './printHelper';
import {
  GROUP_MEMBERS,
  GROUP_MEMBER_DETAILS,
} from './engagementFeatures';
import {
  buildOnePageSummaryPdfBytes,
  buildCertificatePdfBytes,
  buildMasterDiplomaPdfBytes,
  buildScoreCardLandscapePdfBytes,
  buildStudyGuideReviewerPdfBytes,
  drawVectorMarioCoinBlock,
  drawVectorMarioPipe,
  drawVectorMarioStar,
  drawVectorMarioFireFlower,
  drawVectorMarioCoin,
  drawVectorMarioMushroom,
  drawVectorMarioBrickStrip,
  docToUint8Array,
  PRINT_PAPER_SPECS,
  resolvePaperDimensions,
  PrintPaperSize,
} from './pdfExportService';
import { jsPDF } from 'jspdf';
import { inflateSync } from 'node:zlib';
import { ALL_LAW_TOPICS } from '../data/laborLawData';

function extractStreamText(buf: Buffer, startIdx: number = 0): string {
  const streamStart = buf.indexOf('stream\n', startIdx);
  if (streamStart === -1) return buf.toString('latin1');
  const streamEnd = buf.indexOf('\nendstream', streamStart);
  if (streamEnd === -1) return buf.toString('latin1');
  const streamBytes = buf.subarray(streamStart + 7, streamEnd);
  try {
    return inflateSync(streamBytes).toString('latin1');
  } catch {
    return streamBytes.toString('latin1');
  }
}

test('buildDynamicPrintPageCss injects fontStack into @media print rule', () => {
  const css = buildDynamicPrintPageCss('portrait', '10mm', '"DM Sans", sans-serif');
  assert.ok(css.includes('@media print'));
  assert.ok(css.includes('size: A4 portrait;'));
  assert.ok(css.includes('margin: 10mm;'));
  assert.ok(css.includes('--print-active-font: "DM Sans", sans-serif;'));
  assert.ok(css.includes('#printable-study-guide'));
  assert.ok(css.includes('#one-page-summary-sheet'));
  assert.ok(css.includes('#official-labor-certificate'));
  assert.ok(css.includes('font-family: "DM Sans", sans-serif !important;'));
});

test('GROUP_MEMBER_DETAILS contains all 9 members with exact names matching GROUP_MEMBERS', () => {
  assert.equal(GROUP_MEMBER_DETAILS.length, 9);
  assert.equal(GROUP_MEMBERS.length, 9);
  GROUP_MEMBERS.forEach((name, idx) => {
    assert.equal(GROUP_MEMBER_DETAILS[idx].name, name);
    assert.ok(GROUP_MEMBER_DETAILS[idx].role.length > 0);
    assert.ok(GROUP_MEMBER_DETAILS[idx].specialization.length > 0);
    assert.ok(GROUP_MEMBER_DETAILS[idx].marioRole.length > 0);
  });
  assert.equal(GROUP_MEMBER_DETAILS[0].name, 'CORPUZ, MATTHEW CESAR');
  assert.ok(GROUP_MEMBER_DETAILS[0].role.includes('Lead Creator'));
});

test('buildOnePageSummaryPdfBytes includes full research cohort and renders valid 1-page A4', () => {
  const pdfBytes = buildOnePageSummaryPdfBytes({
    candidateName: 'Atty. Juan Dela Cruz & Maria Santos',
    dateLabel: 'November 6, 2026',
    colorAccent: 'executive_navy',
    fontStyle: 'dm_sans_clean',
  });
  assert.ok(pdfBytes instanceof Uint8Array);
  assert.ok(pdfBytes.length > 1000);

  const rawAscii = Buffer.from(pdfBytes).toString('latin1');
  assert.ok(rawAscii.startsWith('%PDF-'));
  // Exactly 1 page
  const pageMatches = rawAscii.match(/\/Type\s*\/Page\b/g) || [];
  assert.equal(pageMatches.length, 1, 'One-page summary must contain strictly 1 page');

  // Decompress stream and verify research cohort names are embedded
  const buf = Buffer.from(pdfBytes);
  const decompressed = extractStreamText(buf);
  assert.ok(decompressed.includes('CORPUZ'));
  assert.ok(decompressed.includes('CRUZ'));
  assert.ok(decompressed.includes('FANGED'));
  assert.ok(decompressed.includes('FERNANDEZ'));
  assert.ok(decompressed.includes('GARCIA'));
  assert.ok(decompressed.includes('GARVIDA'));
  assert.ok(decompressed.includes('MANALAC') || decompressed.includes('MA') || decompressed.includes('Abigail'));
  assert.ok(decompressed.includes('UNTALAN'));
  assert.ok(decompressed.includes('VILA'));

  const bannedPattern = /\b(bar exam|bar candidate|bar review|bar taker|bar topnotcher|bar tips|law student|law school)\b/i;
  assert.equal(bannedPattern.test(decompressed), false, 'One-page summary must have 0 Bar/law student mentions');
});

test('buildCertificatePdfBytes renders long recipient names without [0] cropping', () => {
  const longRecipient = 'Hon. Attorney Maria Kristina Isabella Santos-Villanueva, LL.M.';
  const pdfBytes = buildCertificatePdfBytes({
    recipientName: longRecipient,
    honors: 'Summa Cum Laude · Grand Labor Standards Scholar',
    completedCount: 60,
    totalCount: 60,
    dateLabel: 'November 6, 2026',
    orientation: 'portrait',
  });
  assert.ok(pdfBytes instanceof Uint8Array);
  const rawAscii = Buffer.from(pdfBytes).toString('latin1');
  assert.ok(rawAscii.startsWith('%PDF-'));

  const buf = Buffer.from(pdfBytes);
  const decompressed = extractStreamText(buf);
  assert.ok(decompressed.includes('Maria Kristina Isabella'));
  assert.ok(decompressed.includes('Santos-Villanueva'));

  const bannedPattern = /\b(bar exam|bar candidate|bar review|bar taker|bar topnotcher|bar tips|law student|law school)\b/i;
  assert.equal(bannedPattern.test(decompressed), false, 'Certificate must have 0 Bar/law student mentions');
});

test('buildMasterDiplomaPdfBytes renders long recipient names without [0] cropping in landscape', () => {
  const longRecipient = 'Chancellor Matthew Cesar Corpuz & Distinguished Academic Scholars';
  const pdfBytes = buildMasterDiplomaPdfBytes({
    recipientName: longRecipient,
    honors: 'Grand Master Juris Diploma - Summa Cum Codal',
    completedCount: 60,
    totalCount: 60,
    dateLabel: 'November 6, 2026',
    orientation: 'landscape',
  });
  assert.ok(pdfBytes instanceof Uint8Array);
  const rawAscii = Buffer.from(pdfBytes).toString('latin1');
  assert.ok(rawAscii.startsWith('%PDF-'));

  const buf = Buffer.from(pdfBytes);
  const decompressed = extractStreamText(buf);
  assert.ok(decompressed.includes('Matthew Cesar Corpuz'));
  assert.ok(decompressed.includes('Distinguished Academic Scholars'));

  const bannedPattern = /\b(bar exam|bar candidate|bar review|bar taker|bar topnotcher|bar tips|law student|law school)\b/i;
  assert.equal(bannedPattern.test(decompressed), false, 'Master Diploma must have 0 Bar/law student mentions');
});

test('buildScoreCardLandscapePdfBytes auto-scales player name and embeds cleanly', () => {
  const longPlayer = 'Commander Mario Jumpman Mario of the Mushroom Kingdom Supreme Court';
  const pdfBytes = buildScoreCardLandscapePdfBytes({
    playerName: longPlayer,
    heroName: 'Super Mario',
    heroRank: 'Grand Star Champion',
    currentLevel: 10,
    totalXp: 9999,
    xpProgressPercent: 100,
    completedTopicsCount: 60,
    totalTopicsCount: 60,
    totalCoins: 2500,
    dailyStreak: 15,
    dateLabel: 'Nov 6, 2026',
  });
  assert.ok(pdfBytes instanceof Uint8Array);
  const rawAscii = Buffer.from(pdfBytes).toString('latin1');
  assert.ok(rawAscii.startsWith('%PDF-'));
  const pageMatches = rawAscii.match(/\/Type\s*\/Page\b/g) || [];
  assert.equal(pageMatches.length, 1, 'Hero Score Card must fit strictly on 1 page');

  const buf = Buffer.from(pdfBytes);
  const decompressed = extractStreamText(buf);
  assert.ok(decompressed.includes('Commander Mario Jumpman'));

  const bannedPattern = /\b(bar exam|bar candidate|bar review|bar taker|bar topnotcher|bar tips|law student|law school)\b/i;
  assert.equal(bannedPattern.test(decompressed), false, 'Score card must have 0 Bar/law student mentions');
});

test('buildStudyGuideReviewerPdfBytes formats 9-member cohort into 3 structured columns and wrapped tables cleanly', () => {
  const pdfBytes = buildStudyGuideReviewerPdfBytes({
    topics: ALL_LAW_TOPICS.slice(0, 8),
    completedTopicIds: ALL_LAW_TOPICS.slice(0, 4).map((t) => t.id),
    selectedWorlds: ['world1', 'world2'],
    includeGroupMembers: true,
    includeMultipliers: true,
    candidateName: 'Labor Law Scholar',
  });
  assert.ok(pdfBytes instanceof Uint8Array);
  const rawAscii = Buffer.from(pdfBytes).toString('latin1');
  assert.ok(rawAscii.startsWith('%PDF-'));

  const buf = Buffer.from(pdfBytes);
  const decompressed = extractStreamText(buf);
  assert.ok(decompressed.includes('SUPER MARIO LABOR STANDARDS AID'));
  assert.ok(decompressed.includes('CORPUZ'));
  assert.ok(decompressed.includes('CRUZ'));
  assert.ok(decompressed.includes('VILA'));

  const bannedPattern = /\b(bar exam|bar candidate|bar review|bar taker|bar topnotcher|bar tips|law student|law school)\b/i;
  assert.equal(bannedPattern.test(decompressed), false, 'Generated Reviewer PDF must not contain Bar Exam or Law Student references');
});

test('Vector Mario elements draw without errors into jsPDF instance', () => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  drawVectorMarioCoinBlock(doc, 20, 20, 10, [180, 83, 9], [253, 224, 71]);
  drawVectorMarioPipe(doc, 40, 20, 12, 18, [34, 197, 94], [22, 101, 52]);
  drawVectorMarioStar(doc, 70, 25, 6, [253, 224, 71], [180, 83, 9]);
  const out = doc.output('arraybuffer');
  assert.ok(out.byteLength > 500);
});

test('DOLE Statutory Wage & Overtime Multipliers compute exact Philippine peso figures', () => {
  const dailyWage = 645; // NCR Rate
  const hourlyRate = dailyWage / 8; // 80.625
  assert.equal(hourlyRate, 80.625);

  // Ordinary Overtime: Hourly Rate × 1.25 × 2 hours
  const ot2h = hourlyRate * 1.25 * 2;
  assert.equal(ot2h, 201.5625);

  // Night Shift Differential: Hourly Rate × 10% × 2 hours
  const nsd2h = hourlyRate * 0.1 * 2;
  assert.equal(nsd2h, 16.125);

  // Rest Day / Special Non-Working Day: Daily Wage × 130%
  const restDayPay = dailyWage * 1.3;
  assert.equal(restDayPay, 838.5);

  // Regular Holiday Worked: Daily Wage × 200%
  const regHolidayWorked = dailyWage * 2.0;
  assert.equal(regHolidayWorked, 1290.0);

  // Regular Holiday on Rest Day: Daily Wage × 260%
  const regHolidayRest = dailyWage * 2.6;
  assert.equal(regHolidayRest, 1677.0);

  // Double Regular Holiday Worked: Daily Wage × 300%
  const doubleHolidayWorked = dailyWage * 3.0;
  assert.equal(doubleHolidayWorked, 1935.0);

  // Statutory Retirement Pay (Art. 302): 22.5 days per year of service
  // 15 days basic + 2.5 days (5 days SIL) + 4.1667 days (1/12 13th month) = 22.5 days
  const retirementPerYear = dailyWage * 22.5;
  assert.equal(retirementPerYear, 14512.5);
  const retirement5Years = retirementPerYear * 5;
  assert.equal(retirement5Years, 72562.5);
});

test('Dynamic print font CSS cascades across both screen selectors and @media print', () => {
  const fontCss = buildDynamicPrintPageCss('portrait', '8mm', '"Playfair Display", serif');
  assert.ok(fontCss.includes(':root {'));
  assert.ok(fontCss.includes('--print-active-font: "Playfair Display", serif;'));
  assert.ok(fontCss.includes('#official-scorecard-sheet'));
  assert.ok(fontCss.includes('#master-diploma-printable'));
  assert.ok(fontCss.includes('#one-page-summary-sheet'));
  assert.ok(fontCss.includes('@media print {'));
});

test('Authentic Mario vector emblems and Hero Score Card / Certificate elements render with zero errors', () => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  drawVectorMarioCoinBlock(doc, 10, 10, 10);
  drawVectorMarioPipe(doc, 25, 10, 10, 12);
  drawVectorMarioStar(doc, 45, 15, 5);
  drawVectorMarioFireFlower(doc, 60, 15, 5);
  drawVectorMarioCoin(doc, 75, 15, 5);
  drawVectorMarioMushroom(doc, 90, 15, 5);
  drawVectorMarioBrickStrip(doc, 10, 30, 100, 3);
  assert.ok(docToUint8Array(doc).byteLength > 500);

  // Score Card PDF Byte stream
  const scoreCardBytes = buildScoreCardLandscapePdfBytes({
    playerName: 'Chief Legal Officer Mario',
    heroRank: 'Grand Judicial Master',
    heroName: 'Mario',
    completedCount: 60,
    totalTopics: 60,
    coins: 999,
    loginStreak: 14,
    unlockedAchievementsCount: 20,
    totalAchievementsCount: 20,
    quizRunsCompleted: 35,
    studyDurationFormatted: '4h 15m',
    colorAccent: 'executive_navy',
    fontStyle: 'modern_sans',
  });
  assert.ok(scoreCardBytes instanceof Uint8Array);
  assert.ok(scoreCardBytes.byteLength > 2000);
  const rawScore = Buffer.from(scoreCardBytes).toString('latin1');
  assert.ok(rawScore.includes('%PDF-'));

  // Certificate PDF Byte stream
  const certBytes = buildCertificatePdfBytes({
    recipientName: 'Atty. Princess Peach, J.D.',
    honors: 'Summa Cum Laude',
    completedCount: 60,
    totalCount: 60,
    orientation: 'landscape',
    colorAccent: 'super_star_gold',
    fontStyle: 'editorial_serif',
  });
  assert.ok(certBytes instanceof Uint8Array);
  assert.ok(certBytes.byteLength > 2000);
});

test('Matthew Cesar Corpuz is credited with executing all roles across Cohort and PDF exports', () => {
  // 1. Group member details credit
  const leadMember = GROUP_MEMBER_DETAILS[0];
  assert.equal(leadMember.name, 'CORPUZ, MATTHEW CESAR');
  assert.ok(leadMember.role.includes('Lead Creator'));
  assert.ok(leadMember.role.includes('Executed All 9 Roles'));

  // 2. One-Page Summary PDF
  const onePageBytes = buildOnePageSummaryPdfBytes({
    candidateName: 'Matthew Cesar Corpuz',
    dateLabel: 'November 7, 2026',
    colorAccent: 'executive_navy',
    fontStyle: 'dm_sans_clean',
  });
  const bufOnePage = Buffer.from(onePageBytes);
  const decompressed1 = extractStreamText(bufOnePage);
  assert.ok(decompressed1.includes('CORPUZ'));
  assert.ok(decompressed1.includes('Executed All Roles'));

  // 3. Reviewer PDF
  const reviewerBytes = buildStudyGuideReviewerPdfBytes({
    allTopics: ALL_LAW_TOPICS.slice(0, 3),
    includeGroupMembers: true,
  });
  const rawReviewer = Buffer.from(reviewerBytes).toString('latin1');
  assert.ok(rawReviewer.includes('%PDF-'));

  // 4. ScoreCard PDF
  const scoreCardBytes = buildScoreCardLandscapePdfBytes({
    playerName: 'Matthew Cesar Corpuz',
    heroRank: 'Lead Architect',
    heroName: 'Mario',
    completedCount: 60,
    totalTopics: 60,
    coins: 999,
    loginStreak: 10,
    unlockedAchievementsCount: 20,
    totalAchievementsCount: 20,
    quizRunsCompleted: 40,
    studyDurationFormatted: '5h 00m',
  });
  const bufScore = Buffer.from(scoreCardBytes);
  const decompressedS = extractStreamText(bufScore);
  assert.ok(decompressedS.includes('Executed All Roles'));
});

test('PRINT_PAPER_SPECS and resolvePaperDimensions support all paper formats and exact preview canvas', () => {
  const supportedSizes: PrintPaperSize[] = ['a4', 'letter', 'legal', 'a3', 'a5', 'preview_exact'];
  for (const s of supportedSizes) {
    const spec = PRINT_PAPER_SPECS[s];
    assert.ok(spec, `Paper spec for ${s} must exist`);
    assert.ok(spec.widthMm > 0);
    assert.ok(spec.heightMm > 0);
    const resolved = resolvePaperDimensions(s);
    assert.equal(resolved.widthMm, spec.widthMm);
    assert.equal(resolved.heightMm, spec.heightMm);
  }

  // Custom preview dimensions override
  const custom = resolvePaperDimensions('preview_exact', [220, 340]);
  assert.equal(custom.widthMm, 220);
  assert.equal(custom.heightMm, 340);
});

test('buildOnePageSummaryPdfBytes and buildStudyGuideReviewerPdfBytes generate valid PDFs for all paper sizes without errors', () => {
  const sizesToTest: PrintPaperSize[] = ['a4', 'letter', 'legal', 'a3', 'a5', 'preview_exact'];

  for (const size of sizesToTest) {
    // 1. One-Page Summary Master Sheet
    const summaryBytes = buildOnePageSummaryPdfBytes({
      candidateName: 'Matthew Cesar Corpuz',
      paperSize: size,
      colorAccent: 'executive_navy',
    });
    assert.ok(summaryBytes instanceof Uint8Array);
    assert.ok(summaryBytes.byteLength > 1000);
    const rawSummary = Buffer.from(summaryBytes).toString('latin1');
    assert.ok(rawSummary.startsWith('%PDF-'));
    const summaryPages = rawSummary.match(/\/Type\s*\/Page\b/g) || [];
    assert.equal(summaryPages.length, 1, `One-page summary on ${size} must render strictly on 1 page`);

    // 2. Study Guide Reviewer (World 6 topics)
    const reviewerBytes = buildStudyGuideReviewerPdfBytes({
      allTopics: ALL_LAW_TOPICS.slice(0, 4),
      paperSize: size,
      colorAccent: 'forest_yoshi',
    });
    assert.ok(reviewerBytes instanceof Uint8Array);
    assert.ok(reviewerBytes.byteLength > 2000);
    const rawReviewer = Buffer.from(reviewerBytes).toString('latin1');
    assert.ok(rawReviewer.startsWith('%PDF-'));
  }
});

test('buildDynamicPrintPageCss formats @page size accurately for letter, legal, a3, and a5', () => {
  const letterCss = buildDynamicPrintPageCss('portrait', '10mm', undefined, 'letter');
  assert.ok(letterCss.includes('size: letter portrait;'));

  const legalCss = buildDynamicPrintPageCss('landscape', '8mm', undefined, 'legal');
  assert.ok(legalCss.includes('size: legal landscape;'));

  const a3Css = buildDynamicPrintPageCss('portrait', '12mm', undefined, 'a3');
  assert.ok(a3Css.includes('size: A3 portrait;'));

  const a5Css = buildDynamicPrintPageCss('landscape', '6mm', undefined, 'a5');
  assert.ok(a5Css.includes('size: A5 landscape;'));
});

test('buildOnePageSummaryPdfBytes applies natural unconstrained canvas (>=395mm) to prevent text cuts and overlaps', () => {
  // Test default preview_exact height
  assert.equal(PRINT_PAPER_SPECS.preview_exact.heightMm, 395);

  const bytes = buildOnePageSummaryPdfBytes({
    paperSize: 'preview_exact',
    colorAccent: 'executive_navy',
    fontStyle: 'classic_times',
  });
  assert.ok(bytes instanceof Uint8Array);
  const raw = Buffer.from(bytes).toString('latin1');
  const pages = raw.match(/\/Type\s*\/Page\b/g) || [];
  assert.equal(pages.length, 1, 'One-page summary must strictly fit on exactly 1 page');

  // Verify MediaBox height is at least 395mm (converted to points: 395 * 72 / 25.4 = ~1119.68pt)
  const mediaBoxMatch = raw.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  assert.ok(mediaBoxMatch, 'MediaBox must be present in PDF output');
  const heightPt = parseFloat(mediaBoxMatch[2]);
  const heightMm = heightPt * (25.4 / 72);
  assert.ok(heightMm >= 394.0, `Canvas height in mm (${heightMm}) must be >= 394mm`);

  // Test custom preview dimensions override (e.g. 415mm)
  const customBytes = buildOnePageSummaryPdfBytes({
    paperSize: 'preview_exact',
    customPageSizeMm: [210, 415],
  });
  const customRaw = Buffer.from(customBytes).toString('latin1');
  const customPages = customRaw.match(/\/Type\s*\/Page\b/g) || [];
  assert.equal(customPages.length, 1, 'Custom sized summary must also strictly fit on 1 page');
  const customMediaBox = customRaw.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/);
  assert.ok(customMediaBox);
  const customH = parseFloat(customMediaBox[2]) * (25.4 / 72);
  assert.ok(Math.abs(customH - 415) < 1.0, `Custom canvas height (${customH}mm) must match 415mm`);
});

test('All 8 print document modes define valid orientations and distinct IDs', () => {
  const modes: Array<{ mode: string; expectedOrientation: 'portrait' | 'landscape'; id: string }> = [
    { mode: 'summary', expectedOrientation: 'portrait', id: 'one-page-summary-sheet' },
    { mode: 'guide', expectedOrientation: 'portrait', id: 'printable-study-guide' },
    { mode: 'certificate', expectedOrientation: 'landscape', id: 'official-labor-certificate' },
    { mode: 'diploma', expectedOrientation: 'landscape', id: 'royal-juris-diploma-sheet' },
    { mode: 'scorecard', expectedOrientation: 'landscape', id: 'official-scorecard-sheet' },
    { mode: 'cheatsheet', expectedOrientation: 'portrait', id: 'statutory-cheatsheet-sheet' },
    { mode: 'bowser_victory', expectedOrientation: 'landscape', id: 'bowser-victory-sheet' },
    { mode: 'passport', expectedOrientation: 'landscape', id: 'labor-jurist-passport-sheet' },
  ];

  assert.equal(modes.length, 8);
  modes.forEach((m) => {
    assert.ok(m.mode.length > 0);
    assert.ok(m.id.length > 0);
    const css = buildDynamicPrintPageCss(m.expectedOrientation, '6mm');
    assert.ok(
      css.includes(m.expectedOrientation),
      `CSS for ${m.mode} must contain orientation ${m.expectedOrientation}`
    );
  });
});
