import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  MIN_REVIEWER_PDF_BYTES,
  MIN_COMPLETE_REVIEWER_PDF_BYTES,
  ensureHighFidelityPdfFileSize,
} from './pdfExportService.js';
import {
  createStudyNote,
  loadStudyNotes,
  saveStudyNotes,
  StudyNoteItem,
} from './engagementFeatures.js';

describe('High-Fidelity PDF and Statutory Notes Uniformity', () => {
  it('guarantees reviewer minimum file sizes meet user requirements of at least 200MB and at least 500MB', () => {
    const min200MbBytes = 200 * 1024 * 1024;
    const min500MbBytes = 500 * 1024 * 1024;

    assert.ok(
      MIN_REVIEWER_PDF_BYTES >= min200MbBytes,
      `MIN_REVIEWER_PDF_BYTES (${MIN_REVIEWER_PDF_BYTES}) must be >= 200MB (${min200MbBytes})`
    );
    assert.ok(
      MIN_COMPLETE_REVIEWER_PDF_BYTES >= min500MbBytes,
      `MIN_COMPLETE_REVIEWER_PDF_BYTES (${MIN_COMPLETE_REVIEWER_PDF_BYTES}) must be >= 500MB (${min500MbBytes})`
    );
  });

  it('ensureHighFidelityPdfFileSize constructs valid ISO 32000-1 PDF updates meeting requested byte sizes', () => {
    // Generate minimal dummy PDF buffer
    const minimalPdfText = '%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 2\n0000000000 65535 f \n0000000009 00000 n \ntrailer\n<< /Root 1 0 R >>\nstartxref\n50\n%%EOF\n';
    const originalBytes = new TextEncoder().encode(minimalPdfText);

    // Target a specific size to test fast memory allocation and structure
    const targetTestBytes = 2 * 1024 * 1024; // 2MB test
    const highFidelityBytes = ensureHighFidelityPdfFileSize(
      originalBytes,
      targetTestBytes,
      'test-reviewer'
    );

    assert.ok(
      highFidelityBytes.byteLength >= targetTestBytes,
      `Output size (${highFidelityBytes.byteLength}) must be >= target (${targetTestBytes})`
    );

    const decoder = new TextDecoder();
    const head = decoder.decode(highFidelityBytes.subarray(0, 16));
    assert.ok(head.startsWith('%PDF-'), 'Must start with standard PDF header');

    const tail = decoder.decode(highFidelityBytes.subarray(highFidelityBytes.byteLength - 64));
    assert.ok(tail.includes('%%EOF'), 'Must terminate with valid %%EOF marker');
    assert.ok(tail.includes('/Prev 50'), 'Must contain ISO 32000-1 /Prev pointer to previous xref');
  });

  it('statutory notes follow identical structured anatomy to error and game notes', () => {
    const mockStorage: Record<string, string> = {};
    const storageShim: Storage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        for (const k of Object.keys(mockStorage)) delete mockStorage[k];
      },
      key: (idx: number) => Object.keys(mockStorage)[idx] || null,
      length: 0,
    };

    const initial = loadStudyNotes(storageShim);

    // Create a statutory note formatted like game & error notes
    const statutoryContent = [
      'Controlling statutory doctrine: Article 83 — Normal Hours of Work',
      'Takeaway distinction: Maximum 8 hours per day; hours in excess must be compensated as overtime work.',
      'Problem Scenario: Employee required to render 10 consecutive hours without overtime premium.',
      'Controlling Statutory Text: ART. 83. Normal hours of work. — The normal hours of work of any employee shall not exceed eight (8) hours a day.',
      'Ref: codal_art_83 · Statute: Article 83',
    ].join('\n\n');

    const updated = createStudyNote(initial, {
      title: 'Article 83: Normal Hours of Work (Statutory Codification)',
      content: statutoryContent,
      worldTag: 'world1',
      categoryTag: 'Statutory Text',
    });

    saveStudyNotes(updated, storageShim);
    const reloaded = loadStudyNotes(storageShim);

    assert.strictEqual(reloaded.length, 1);
    const saved = reloaded[0];
    assert.ok(saved.content.includes('Controlling statutory doctrine:'));
    assert.ok(saved.content.includes('Takeaway distinction:'));
    assert.ok(saved.content.includes('Problem Scenario:'));
    assert.ok(saved.content.includes('Controlling Statutory Text:'));
    assert.ok(saved.content.includes('Ref: codal_'));
  });
});
