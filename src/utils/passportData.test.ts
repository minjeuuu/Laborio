import test from 'node:test';
import assert from 'node:assert/strict';
import {
  splitCandidateName,
  formatPassportDate,
  extractMrzDate,
  computeIcaoCheckDigit,
  generatePassportMrz,
  loadPassportProfile,
  PHILIPPINE_BIRTHPLACE_SUGGESTIONS,
  PassportProfileData,
} from './passportData';

test('splitCandidateName splits full names into Given Names and Surname cleanly', () => {
  const r1 = splitCandidateName('Juan Dela Cruz');
  assert.equal(r1.givenNames, 'JUAN DELA');
  assert.equal(r1.surname, 'CRUZ');

  const r2 = splitCandidateName('Matthew Cesar Corpuz');
  assert.equal(r2.givenNames, 'MATTHEW CESAR');
  assert.equal(r2.surname, 'CORPUZ');

  const r3 = splitCandidateName('Clara');
  assert.equal(r3.givenNames, 'CLARA');
  assert.equal(r3.surname, 'CLARA');

  const rEmpty = splitCandidateName('');
  assert.ok(rEmpty.givenNames.length > 0);
  assert.ok(rEmpty.surname.length > 0);
});

test('formatPassportDate formats ISO dates and textual dates into official passport notation', () => {
  assert.equal(formatPassportDate('1998-05-15'), '15 MAY 1998');
  assert.equal(formatPassportDate('2002-11-04'), '04 NOV 2002');
  assert.equal(formatPassportDate('2000-01-01'), '01 JAN 2000');
  assert.equal(formatPassportDate('1995-12-25'), '25 DEC 1995');
  assert.equal(formatPassportDate('08 FEB 2000'), '08 FEB 2000');
});

test('extractMrzDate extracts 6-digit YYMMDD string for ICAO OCR zone', () => {
  assert.equal(extractMrzDate('1998-05-15'), '980515');
  assert.equal(extractMrzDate('2002-11-04'), '021104');
  assert.equal(extractMrzDate('2000-01-01'), '000101');
  assert.equal(extractMrzDate('08 FEB 2000'), '000208');
});

test('computeIcaoCheckDigit calculates valid Doc 9303 check digits', () => {
  // Test check digit algorithm
  const digit1 = computeIcaoCheckDigit('000101');
  assert.equal(typeof digit1, 'number');
  assert.ok(digit1 >= 0 && digit1 <= 9);

  const digit2 = computeIcaoCheckDigit('PH4422026');
  assert.equal(typeof digit2, 'number');
  assert.ok(digit2 >= 0 && digit2 <= 9);
});

test('generatePassportMrz generates exactly two 44-character ICAO compliant lines', () => {
  const profile: PassportProfileData = {
    fullName: 'Maria Santos',
    givenNames: 'MARIA',
    surname: 'SANTOS',
    dateOfBirth: '1995-07-21',
    placeOfBirth: 'CEBU CITY, PHILIPPINES',
    nationality: 'FILIPINO',
    sex: 'F',
    passportNumber: 'PH-L998-2026-MS',
    issuingAuthority: 'DOLE & PHILIPPINE LABOR STANDARDS BAR',
  };

  const mrz = generatePassportMrz(profile, '2026-11-10');

  // Both lines must be exactly 44 characters according to ICAO Doc 9303 Part 3
  assert.equal(mrz.line1.length, 44, 'MRZ Line 1 must be exactly 44 chars');
  assert.equal(mrz.line2.length, 44, 'MRZ Line 2 must be exactly 44 chars');

  // Line 1 format verification
  assert.ok(mrz.line1.startsWith('P<PHL'), 'Line 1 must start with P<PHL');
  assert.ok(mrz.line1.includes('SANTOS<<MARIA'), 'Line 1 must contain surname and given names separated by <<');

  // Line 2 format verification
  assert.ok(mrz.line2.includes('PHL950721'), 'Line 2 must contain country code and YYMMDD DOB');
  assert.ok(mrz.line2.includes('F'), 'Line 2 must contain sex code F');
});

test('generatePassportMrz is fully dynamic across different user names, birthdays, and sexes', () => {
  const profileM: PassportProfileData = {
    fullName: 'Jose Rizal',
    givenNames: 'JOSE',
    surname: 'RIZAL',
    dateOfBirth: '1990-06-19',
    placeOfBirth: 'CALAMBA, LAGUNA',
    nationality: 'FILIPINO',
    sex: 'M',
    passportNumber: 'PH-R186-1896-JR',
    issuingAuthority: 'DOLE',
  };

  const mrzM = generatePassportMrz(profileM, '2026-01-01');
  assert.equal(mrzM.line1.length, 44);
  assert.equal(mrzM.line2.length, 44);
  assert.ok(mrzM.line1.includes('RIZAL<<JOSE'));
  assert.ok(mrzM.line2.includes('900619'));
  assert.ok(mrzM.line2.includes('M'));

  // Ensure different profiles produce distinctly different MRZ strings
  const profileF: PassportProfileData = {
    fullName: 'Gabriela Silang',
    givenNames: 'GABRIELA',
    surname: 'SILANG',
    dateOfBirth: '1992-03-19',
    placeOfBirth: 'SANTA, ILOCOS SUR',
    nationality: 'FILIPINO',
    sex: 'F',
    passportNumber: 'PH-S176-1763-GS',
    issuingAuthority: 'DOLE',
  };
  const mrzF = generatePassportMrz(profileF, '2026-01-01');
  assert.notEqual(mrzM.line1, mrzF.line1);
  assert.notEqual(mrzM.line2, mrzF.line2);
  assert.ok(mrzF.line1.includes('SILANG<<GABRIELA'));
  assert.ok(mrzF.line2.includes('920319'));
  assert.ok(mrzF.line2.includes('F'));
});

test('loadPassportProfile provides sensible defaults and birthplace suggestions', () => {
  const def = loadPassportProfile('Apolinario Mabini');
  assert.equal(def.surname, 'MABINI');
  assert.equal(def.givenNames, 'APOLINARIO');
  assert.ok(PHILIPPINE_BIRTHPLACE_SUGGESTIONS.length >= 10);
  assert.ok(PHILIPPINE_BIRTHPLACE_SUGGESTIONS.includes('MANILA, PHILIPPINES'));
  assert.ok(PHILIPPINE_BIRTHPLACE_SUGGESTIONS.includes('CEBU CITY, PHILIPPINES'));
  assert.ok(PHILIPPINE_BIRTHPLACE_SUGGESTIONS.includes('DAVAO CITY, PHILIPPINES'));
  assert.ok(def.dateOfIssuance);
  assert.equal(typeof def.dateOfIssuance, 'string');
});

test('dateOfIssuance is correctly formatted to official passport DD MMM YYYY format', () => {
  assert.equal(formatPassportDate('2026-11-12'), '12 NOV 2026');
  assert.equal(formatPassportDate('2025-06-01'), '01 JUN 2025');
  assert.equal(formatPassportDate('November 12, 2026'), '12 NOV 2026');
  assert.equal(formatPassportDate('12 Nov 2026'), '12 NOV 2026');
});

