import test from 'node:test';
import assert from 'node:assert/strict';
import { speechService } from './speechNarrationService';

test('speechService: sanitizeStatuteText expands legal abbreviations and numbers', () => {
  const raw = 'ART. 83. Normal hours. Under R.A. 11210 and P.D. 442, daily wage is ₱610.00 with 10% premium — without delay (w/o notice).';
  const sanitized = speechService.sanitizeStatuteText(raw);

  assert.ok(sanitized.includes('Article 83'));
  assert.ok(sanitized.includes('Republic Act Number 11210'));
  assert.ok(sanitized.includes('Presidential Decree Number 442'));
  assert.ok(sanitized.includes('610.00 Philippine Pesos'));
  assert.ok(sanitized.includes('10 percent'));
  assert.ok(sanitized.includes('without notice'));
  assert.ok(!sanitized.includes('—'), 'Em-dash should be normalized to comma');
  assert.ok(!sanitized.includes('w/o'), 'w/o should be expanded');
});

test('speechService: splitIntoChunks ensures chunks do not exceed max length', () => {
  const longStatute =
    'ART. 82. Coverage. The provisions of this Title shall apply to employees in all establishments and undertakings whether for profit or not, but not to government employees, managerial employees, field personnel, members of the family of the employer who are dependent on him for support, domestic helpers, persons in the personal service of another, and workers who are paid by results as determined by the Secretary of Labor in appropriate regulations.';

  const chunks = speechService.splitIntoChunks(longStatute, 140);
  assert.ok(chunks.length >= 3, 'Long statute must be split into multiple chunks');

  for (const chunk of chunks) {
    assert.ok(
      chunk.length <= 150,
      `Chunk "${chunk}" exceeds expected bound (length=${chunk.length})`
    );
  }
});

test('speechService: rate bounds clamping', () => {
  speechService.setRate(0.2);
  assert.equal(speechService.getRate(), 0.6);

  speechService.setRate(3.5);
  assert.equal(speechService.getRate(), 2.0);

  speechService.setRate(1.25);
  assert.equal(speechService.getRate(), 1.25);
});
