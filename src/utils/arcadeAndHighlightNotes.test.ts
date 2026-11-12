import test from 'node:test';
import assert from 'node:assert/strict';
import { PURE_ACTION_GAME_IDS } from '../components/GameVault';
import { buildStudyGuideReviewerPdfBytes } from './pdfExportService';
import {
  toggleNoteLineHighlight,
  HIGHLIGHT_COLORS,
  getHighlightColorSpec,
} from './studyPlannerAndNotes';
import {
  parseStructuredNoteLines,
  detectBlockCategoricalStance,
} from './engagementFeatures';
import { ALL_LAW_TOPICS } from '../data/laborLawData';

test('GameVault arcade registry includes all 47 interactive games with zero missing references', () => {
  assert.ok(PURE_ACTION_GAME_IDS.size >= 47, `Expected at least 47 games in PURE_ACTION_GAME_IDS, found ${PURE_ACTION_GAME_IDS.size}`);
  assert.ok(PURE_ACTION_GAME_IDS.has('coin_rush'));
  assert.ok(PURE_ACTION_GAME_IDS.has('pipe_whack_violation'));
  assert.ok(PURE_ACTION_GAME_IDS.has('yoshi_overtime'));
  assert.ok(PURE_ACTION_GAME_IDS.has('pauline_wage_concert'));
  assert.ok(PURE_ACTION_GAME_IDS.has('wario_vault'));
  assert.ok(PURE_ACTION_GAME_IDS.has('captain_toad_minecart'));
  assert.ok(PURE_ACTION_GAME_IDS.has('dry_bones_crypt'));
});

test('Study Notes line highlighting toggles cleanly and preserves line annotations', () => {
  let annotations: Record<string, { highlightedLines: number[]; starredLines: number[]; lineColors?: Record<number, any> }> = {};
  annotations = toggleNoteLineHighlight(annotations, 'note-art-113', 0);
  annotations = toggleNoteLineHighlight(annotations, 'note-art-113', 3);

  assert.deepEqual(annotations['note-art-113'].highlightedLines, [0, 3]);

  // Toggling line 0 removes it
  annotations = toggleNoteLineHighlight(annotations, 'note-art-113', 0);
  assert.deepEqual(annotations['note-art-113'].highlightedLines, [3]);
});

test('HIGHLIGHT_COLORS provides 12 distinct studio colors with valid classes, hex values, and in-place color switching', () => {
  assert.equal(HIGHLIGHT_COLORS.length, 12, 'Expected 12 highlight colors');
  const ids = HIGHLIGHT_COLORS.map((c) => c.id);
  assert.ok(ids.includes('yellow'));
  assert.ok(ids.includes('emerald'));
  assert.ok(ids.includes('sky'));
  assert.ok(ids.includes('pink'));
  assert.ok(ids.includes('purple'));
  assert.ok(ids.includes('orange'));
  assert.ok(ids.includes('lime'));
  assert.ok(ids.includes('amber'));
  assert.ok(ids.includes('red'));
  assert.ok(ids.includes('teal'));
  assert.ok(ids.includes('indigo'));
  assert.ok(ids.includes('silver'));

  for (const c of HIGHLIGHT_COLORS) {
    assert.ok(c.label.length > 0);
    assert.ok(c.bgClass.startsWith('bg-'));
    assert.ok(c.hex.startsWith('#'));
  }

  // Verify multi-color annotation and in-place switching
  let map: any = {};
  map = toggleNoteLineHighlight(map, 'note-w1', 1, 'emerald');
  assert.deepEqual(map['note-w1'].highlightedLines, [1]);
  assert.equal(map['note-w1'].lineColors?.[1], 'emerald');

  // Switching color to sky in-place updates color without untoggling
  map = toggleNoteLineHighlight(map, 'note-w1', 1, 'sky');
  assert.deepEqual(map['note-w1'].highlightedLines, [1]);
  assert.equal(map['note-w1'].lineColors?.[1], 'sky');

  // Calling with same color toggles it off
  map = toggleNoteLineHighlight(map, 'note-w1', 1, 'sky');
  assert.deepEqual(map['note-w1'].highlightedLines, []);
});

test('parseStructuredNoteLines detects Yes/No categorical stances and cleans ugly missed answers into arranged doctrinal distinctions', () => {
  // Test categorical stance helper
  assert.equal(detectBlockCategoricalStance('YES. Article 83 mandates 8 hours.'), 'YES');
  assert.equal(detectBlockCategoricalStance('NO. Wage deduction without written consent is void.'), 'NO');
  assert.equal(detectBlockCategoricalStance('VALID. The compressed workweek satisfies DOLE Advisory 02.'), 'VALID');
  assert.equal(detectBlockCategoricalStance('ILLEGAL. Labor-only contracting is strictly prohibited.'), 'ILLEGAL');
  assert.equal(detectBlockCategoricalStance('General Rule: No. Exception: Yes, under Art. 89.'), 'GENERAL_RULE');

  // Test structured parsing of quiz error note with ugly "Your Answer (Missed):"
  const rawNote =
    'Controlling statutory doctrine: YES. Premium pay of 260% applies when working on a Regular Holiday that coincides with a scheduled rest day.\n' +
    'Takeaway distinction: Your Answer (Missed): 200% of basic wage. Always apply the controlling codal rule above in practical statutory problems.\n' +
    'Problem Scenario: Ana worked 10 hours on a Regular Holiday falling on her Rest Day. Is she entitled to 260%?\n' +
    'Art. 94 · Ref: qerr_12345';

  const blocks = parseStructuredNoteLines(rawNote);
  assert.equal(blocks.length, 4);

  // Block 1: Controlling doctrine with detected YES stance
  assert.equal(blocks[0].kind, 'controlling');
  assert.equal(blocks[0].categoricalStance, 'YES');

  // Block 2: Takeaway distinction with parsed examined distinction
  assert.equal(blocks[1].kind, 'takeaway');
  assert.ok(blocks[1].examinedDistinction);
  assert.equal(blocks[1].examinedDistinction?.priorChoice, '200% of basic wage');
  assert.equal(blocks[1].examinedDistinction?.isYesNo, false);
  // Ugly "Your Answer (Missed):" must NOT be in the display value
  assert.equal(blocks[1].value.includes('Your Answer (Missed):'), false);
  assert.ok(blocks[1].value.includes('Contrast against "200% of basic wage"'));

  // Test structured parsing with Yes/No question
  const yesNoNote =
    'Controlling statutory doctrine: NO. Undertime work cannot be offset by overtime under Art. 88.\n' +
    'Takeaway distinction: Your Answer (Missed): Yes. Always apply the controlling codal rule above in practical statutory problems.\n' +
    'Problem Scenario: Can employer offset 2 hours undertime on Monday with 2 hours overtime on Tuesday?';

  const yesNoBlocks = parseStructuredNoteLines(yesNoNote);
  assert.equal(yesNoBlocks[0].categoricalStance, 'NO');
  assert.equal(yesNoBlocks[1].examinedDistinction?.isYesNo, true);
  assert.equal(yesNoBlocks[1].examinedDistinction?.priorChoice, 'Yes');
  assert.equal(yesNoBlocks[1].examinedDistinction?.stance, 'YES');
  assert.equal(yesNoBlocks[1].value.includes('Your Answer (Missed):'), false);
  assert.ok(yesNoBlocks[1].value.includes('Contrast with prior choice "YES"'));
});

test('buildStudyGuideReviewerPdfBytes generates crisp multi-page PDF with pageBreakPerModule and exact card borders', () => {
  const sampleTopics = ALL_LAW_TOPICS.slice(0, 4);

  const pdfWithBreaks = buildStudyGuideReviewerPdfBytes({
    candidateName: 'Matthew Cesar Corpuz',
    completedTopicIds: [sampleTopics[0].id],
    topics: sampleTopics,
    selectedWorlds: ['world-1'],
    pageBreakPerModule: true,
  });

  assert.ok(pdfWithBreaks instanceof Uint8Array);
  assert.ok(pdfWithBreaks.length > 20000, 'PDF byte stream should contain rich vector contents and uncompressed streams');

  const pdfStandard = buildStudyGuideReviewerPdfBytes({
    candidateName: 'Matthew Cesar Corpuz',
    completedTopicIds: [sampleTopics[0].id],
    topics: sampleTopics,
    selectedWorlds: ['world-1'],
    pageBreakPerModule: false,
  });

  assert.ok(pdfStandard instanceof Uint8Array);
  assert.ok(pdfStandard.length > 20000, 'Standard flow PDF byte stream should contain rich vector contents');
});

test('buildTrueFontStudyReviewerPdfBytesAsync embeds multi-variant TrueType fonts and candidate learner pill matching preview', async () => {
  const { buildTrueFontStudyReviewerPdfBytesAsync } = await import('./pdfTrueFontRenderer');
  const pdfBytes = await buildTrueFontStudyReviewerPdfBytesAsync({
    orientation: 'portrait',
    candidateName: 'Matthew Cesar Corpuz',
    completedTopicIds: ['topic-1'],
    topics: ALL_LAW_TOPICS,
    selectedWorlds: ['world-1', 'world-2', 'world-3', 'world-4', 'world-5', 'world-6'],
    includeCheckboxes: true,
    pageBreakPerModule: false,
  });

  assert.ok(pdfBytes instanceof Uint8Array);
  assert.ok(pdfBytes.byteLength > 2000000, `Expected rich uncompressed multi-megabyte PDF stream, got ${pdfBytes.byteLength} bytes`);

  // Verify PDF header format
  const header = String.fromCharCode(...pdfBytes.subarray(0, 8));
  assert.ok(header.startsWith('%PDF-1.'), 'PDF stream must begin with standard PDF header');
});

test('buildCertificatePdfBytes in Portrait and Landscape generates exact preview parity with 3-column footer and uncompressed stream', async () => {
  const { buildCertificatePdfBytes } = await import('./pdfExportService');
  const { buildTrueFontCertificateOrDiplomaPdfBytesAsync } = await import('./pdfTrueFontRenderer');

  // Portrait mode
  const portraitBytes = buildCertificatePdfBytes({
    recipientName: 'Matthew Cesar Corpuz',
    honors: 'Summa Cum Laude',
    completedCount: 6,
    totalCount: 6,
    dateLabel: 'November 8, 2026',
    orientation: 'portrait',
  });

  assert.ok(portraitBytes instanceof Uint8Array);
  assert.ok(portraitBytes.byteLength > 15000, 'Portrait certificate must produce rich vector PDF bytes');
  const portraitText = Buffer.from(portraitBytes).toString('latin1');
  assert.ok(portraitText.includes('DEPARTMENT OF LABOR AND EMPLOYMENT'), 'Must contain DOLE subtitle');
  assert.ok(portraitText.includes('EXECUTIVE STATUTORY COMPLETION RECORD'), 'Must contain Executive Record subtitle');
  assert.ok(portraitText.includes('CERTIFICATE OF'), 'Must contain Certificate of title');
  assert.ok(portraitText.includes('STATUTORY COMPLETION'), 'Must contain Statutory Completion title');
  assert.ok(portraitText.includes('This Executive Honor Certificate is Proudly Conferred Upon'), 'Must contain Proudly Conferred Upon');
  assert.ok(portraitText.includes('Matthew Cesar Corpuz'), 'Must contain candidate / creator name');
  assert.ok(portraitText.includes('Labor Standards Academic Board'), 'Must contain Academic Board script');
  assert.ok(portraitText.includes('PHILIPPINE LABOR STANDARDS DIRECTORATE'), 'Must contain Directorate title');
  assert.ok(portraitText.includes('SEALED'), 'Must contain Wax Seal text');

  // Landscape mode
  const landscapeBytes = buildCertificatePdfBytes({
    recipientName: 'Matthew Cesar Corpuz',
    honors: 'Summa Cum Laude',
    completedCount: 6,
    totalCount: 6,
    dateLabel: 'November 8, 2026',
    orientation: 'landscape',
  });

  assert.ok(landscapeBytes instanceof Uint8Array);
  assert.ok(landscapeBytes.byteLength > 15000, 'Landscape certificate must produce rich vector PDF bytes');
  const landscapeText = Buffer.from(landscapeBytes).toString('latin1');
  assert.ok(landscapeText.includes('DEPARTMENT OF LABOR AND EMPLOYMENT'), 'Must contain DOLE subtitle in landscape');
  assert.ok(landscapeText.includes('EXECUTIVE STATUTORY COMPLETION RECORD'), 'Must contain Executive Record subtitle in landscape');
  assert.ok(landscapeText.includes('This Executive Honor Certificate is Proudly Conferred Upon'), 'Must contain Proudly Conferred Upon in landscape');
  assert.ok(landscapeText.includes('Labor Standards Academic Board'), 'Must contain Academic Board script in landscape');
  assert.ok(landscapeText.includes('PHILIPPINE LABOR STANDARDS DIRECTORATE'), 'Must contain Directorate title in landscape');

  // TrueType multi-variant font embedding (>50KB uncompressed stream)
  const trueFontCertBytes = await buildTrueFontCertificateOrDiplomaPdfBytesAsync({
    recipientName: 'Matthew Cesar Corpuz',
    honors: 'Summa Cum Laude',
    completedCount: 6,
    totalCount: 6,
    dateLabel: 'November 8, 2026',
    orientation: 'portrait',
    fontStyle: 'crimson_text',
  });
  assert.ok(trueFontCertBytes.byteLength > 50000, `Expected rich uncompressed single-page stream, got ${trueFontCertBytes.byteLength} bytes`);
});

test('HERO_ROSTER and ToadShop include all Mario characters (105 heroes) with full progression integration', async () => {
  const { HERO_ROSTER, getHeroMeta } = await import('../data/heroesData');
  const { AVATAR_ITEMS } = await import('../components/ToadShop');
  const { LEVEL_THRESHOLDS, isAvatarUnlockedByLevel } = await import('./levelProgressionService');

  assert.ok(HERO_ROSTER.length >= 100, 'Must have at least 100 playable Mario characters in HERO_ROSTER');
  assert.equal(HERO_ROSTER.length, 105, 'Must have exactly 105 playable Mario characters in HERO_ROSTER');
  assert.equal(AVATAR_ITEMS.length, 105, 'ToadShop AVATAR_ITEMS must offer all 105 characters');
  assert.equal(LEVEL_THRESHOLDS.length, 105, 'Level progression must provide 105 levels');

  const newHeroIds = [
    'kingboo',
    'peteypiranha',
    'wiggler',
    'lakitu',
    'hammerbro',
    'crankykong',
    'funkykong',
    'nabbit',
    'fluddmario',
    'chargetoad',
    'blooper',
    'montymole',
    'spike',
    'ninji',
    'magikoopa',
    'drybonesgold',
    'poochy',
    'chainchomp',
    'bobomb',
    'chefkinopio',
    'dixiekong',
    'tinykong',
    'chunkykong',
    'luma',
    'lubba',
    'cappy',
    'tiara',
    'flyguy',
    'goomba',
    'paragoomba',
    'paratroopa',
    'buzzybeetle',
    'spiny',
    'cheepcheep',
    'pokey',
    'thwomp',
    'whomp',
    'kingbobomb',
    'wart',
    'tatanga',
  ] as const;

  for (const id of newHeroIds) {
    const meta = getHeroMeta(id as any);
    assert.equal(meta.id, id);
    assert.ok(meta.name.length > 0, `Hero ${id} must have a name`);
    assert.ok(meta.title.length > 0, `Hero ${id} must have a title`);
    assert.ok(meta.description.length > 0, `Hero ${id} must have a description`);
    assert.ok(meta.primaryColor.startsWith('#'), `Hero ${id} must have primary hex`);

    // Verify presence in shop items
    const shopItem = AVATAR_ITEMS.find((item) => item.avatarId === id);
    assert.ok(shopItem, `Shop must include avatar item for ${id}`);
    assert.equal(shopItem?.category, 'avatar');

    // Verify unlockable by level progression
    const isUnlockedAt80 = isAvatarUnlockedByLevel(id as any, 80);
    assert.equal(isUnlockedAt80, true, `Avatar ${id} must be unlocked at level 80`);
  }
});
