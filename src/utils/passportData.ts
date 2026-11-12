/**
 * Official Philippine Labor Jurist Passport Data & ICAO Doc 9303 Compliant MRZ Formatter
 */

export interface PassportProfileData {
  surname: string;
  givenNames: string;
  fullName: string;
  dateOfBirth: string; // ISO date 'YYYY-MM-DD' or formatted date string
  placeOfBirth: string;
  nationality: string;
  sex: 'M' | 'F' | 'X';
  passportNumber: string;
  issuingAuthority: string;
  dateOfIssuance?: string; // ISO date 'YYYY-MM-DD' or formatted date string
}

export const PASSPORT_STORAGE_KEY = 'mario_passport_profile_v2';

export const PHILIPPINE_BIRTHPLACE_SUGGESTIONS: readonly string[] = [
  'MANILA, PHILIPPINES',
  'QUEZON CITY, PHILIPPINES',
  'CEBU CITY, PHILIPPINES',
  'DAVAO CITY, PHILIPPINES',
  'MAKATI CITY, PHILIPPINES',
  'PASIG CITY, PHILIPPINES',
  'TAGUIG CITY, PHILIPPINES',
  'BAGUIO CITY, PHILIPPINES',
  'ILOILO CITY, PHILIPPINES',
  'CAGAYAN DE ORO, PHILIPPINES',
  'CALOOCAN CITY, PHILIPPINES',
  'BACOLOD CITY, PHILIPPINES',
  'ANGELES CITY, PHILIPPINES',
  'ZAMBOANGA CITY, PHILIPPINES',
  'GENERAL SANTOS, PHILIPPINES',
];

const MONTH_ABBRS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

/**
 * Splits a full candidate/player name into Given Names and Surname.
 * e.g., "Juan Dela Cruz" -> { givenNames: "JUAN DELA", surname: "CRUZ" }
 * e.g., "Matthew Cesar Corpuz" -> { givenNames: "MATTHEW CESAR", surname: "CORPUZ" }
 */
export function splitCandidateName(fullName: string): { givenNames: string; surname: string } {
  const trimmed = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    return { givenNames: 'JUAN', surname: 'DELA CRUZ' };
  }
  const parts = trimmed.split(' ');
  if (parts.length === 1) {
    return { givenNames: parts[0].toUpperCase(), surname: parts[0].toUpperCase() };
  }
  const surname = parts[parts.length - 1].toUpperCase();
  const givenNames = parts.slice(0, -1).join(' ').toUpperCase();
  return { givenNames, surname };
}

/**
 * Formats a date string (ISO 'YYYY-MM-DD' or other parseable date) into official passport format:
 * e.g. '1998-05-15' -> '15 MAY 1998'
 */
export function formatPassportDate(rawDate: string): string {
  if (!rawDate || typeof rawDate !== 'string') return '01 JAN 2000';
  const trimmed = rawDate.trim();

  // If already formatted like '15 MAY 1998' or '08 FEB 2000'
  const alreadyMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (alreadyMatch) {
    const day = alreadyMatch[1].padStart(2, '0');
    const month = alreadyMatch[2].toUpperCase();
    const year = alreadyMatch[3];
    return `${day} ${month} ${year}`;
  }

  // Parse ISO YYYY-MM-DD
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const monthIndex = parseInt(isoMatch[2], 10) - 1;
    const day = isoMatch[3].padStart(2, '0');
    const month = MONTH_ABBRS[monthIndex] || 'JAN';
    return `${day} ${month} ${year}`;
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const day = String(parsed.getDate()).padStart(2, '0');
    const month = MONTH_ABBRS[parsed.getMonth()] || 'JAN';
    const year = parsed.getFullYear();
    return `${day} ${month} ${year}`;
  }

  return trimmed.toUpperCase();
}

/**
 * Extracts a 6-digit YYMMDD string for ICAO machine-readable zone
 */
export function extractMrzDate(rawDate: string): string {
  if (!rawDate) return '000101';
  const trimmed = rawDate.trim();

  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    const yy = isoMatch[1].slice(-2);
    const mm = isoMatch[2].padStart(2, '0');
    const dd = isoMatch[3].padStart(2, '0');
    return `${yy}${mm}${dd}`;
  }

  const wordMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (wordMatch) {
    const dd = wordMatch[1].padStart(2, '0');
    const monthStr = wordMatch[2].toUpperCase();
    const mmIdx = MONTH_ABBRS.indexOf(monthStr);
    const mm = String(mmIdx >= 0 ? mmIdx + 1 : 1).padStart(2, '0');
    const yy = wordMatch[3].slice(-2);
    return `${yy}${mm}${dd}`;
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const yy = String(parsed.getFullYear()).slice(-2);
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yy}${mm}${dd}`;
  }

  return '000101';
}

/**
 * Computes ICAO 7-3-1 check digit
 */
export function computeIcaoCheckDigit(input: string): number {
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charAt(i).toUpperCase();
    let val = 0;
    if (ch >= '0' && ch <= '9') {
      val = parseInt(ch, 10);
    } else if (ch >= 'A' && ch <= 'Z') {
      val = ch.charCodeAt(0) - 55;
    } else {
      val = 0;
    }
    sum += val * weights[i % 3];
  }
  return sum % 10;
}

/**
 * Generates official 2-line ICAO Doc 9303 compliant Machine Readable Zone (MRZ)
 * Line 1: 44 chars - P<PHL<SURNAME><<GIVEN<NAMES<<<<<<<<<<<<
 * Line 2: 44 chars - <PASSPORT><CHECK>PHL<DOB><CHECK><SEX><EXP><CHECK><OPT><CHECK>
 */
export function generatePassportMrz(
  data: Partial<PassportProfileData>,
  issuanceDate?: string
): { line1: string; line2: string } {
  const sanitize = (str: string) =>
    (str || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '<')
      .replace(/<+/g, '<');

  const rawSurname = (data.surname || '').trim();
  const rawGiven = (data.givenNames || '').trim();
  const { givenNames: autoGiven, surname: autoSurname } = splitCandidateName(data.fullName || '');

  const surname = sanitize(rawSurname || autoSurname || 'CRUZ');
  const given = sanitize(rawGiven || autoGiven || 'JUAN').replace(/\s+/g, '<');

  // Line 1: P<PHL{SURNAME}<<{GIVEN_NAMES}
  let line1 = `P<PHL${surname}<<${given}`;
  line1 = line1.padEnd(44, '<').slice(0, 44);

  // Line 2: Document Number, Country, DOB, Sex, Expiry, Check Digits
  const passNum = (data.passportNumber || 'PH-L442-2026-MC')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .padEnd(9, '<')
    .slice(0, 9);
  const passCheck = computeIcaoCheckDigit(passNum.replace(/</g, '0'));

  const dobDigits = extractMrzDate(data.dateOfBirth || '2000-01-01');
  const dobCheck = computeIcaoCheckDigit(dobDigits);

  const sexChar = (data.sex || 'M').toUpperCase().charAt(0);
  const validSex = sexChar === 'F' ? 'F' : sexChar === 'X' ? '<' : 'M';

  // Expiry date: 10 years from issuance or default
  const effectiveIssuance = data.dateOfIssuance || issuanceDate;
  const baseYear = effectiveIssuance ? new Date(effectiveIssuance).getFullYear() : 2026;
  const expYear = (isNaN(baseYear) ? 2026 : baseYear) + 10;
  const expDigits = `${String(expYear).slice(-2)}1231`;
  const expCheck = computeIcaoCheckDigit(expDigits);

  const optionalData = 'L442JURIST01'.padEnd(14, '<').slice(0, 14);
  const compositeSource = `${passNum}${passCheck}${dobDigits}${dobCheck}${expDigits}${expCheck}${optionalData}`;
  const compositeCheck = computeIcaoCheckDigit(compositeSource.replace(/</g, '0'));

  let line2 = `${passNum}${passCheck}PHL${dobDigits}${dobCheck}${validSex}${expDigits}${expCheck}${optionalData}${compositeCheck}`;
  line2 = line2.padEnd(44, '<').slice(0, 44);

  return { line1, line2 };
}

/**
 * Loads stored passport profile data or derives initial state from candidate/player name
 */
export function loadPassportProfile(
  candidateOrPlayerName?: string
): PassportProfileData {
  const fallback = splitCandidateName(candidateOrPlayerName || '');
  const todayIso = new Date().toISOString().slice(0, 10);
  const defaultData: PassportProfileData = {
    fullName: candidateOrPlayerName?.trim() || 'Juan Dela Cruz',
    surname: fallback.surname,
    givenNames: fallback.givenNames,
    dateOfBirth: '2000-01-01',
    placeOfBirth: 'MANILA, PHILIPPINES',
    nationality: 'FILIPINO / JURIST',
    sex: 'M',
    passportNumber: 'PH-L442-2026-MC',
    issuingAuthority: 'DOLE & PHILIPPINE LABOR STANDARDS BAR',
    dateOfIssuance: todayIso,
  };

  if (typeof window === 'undefined') return defaultData;

  try {
    const raw = window.localStorage.getItem(PASSPORT_STORAGE_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw);
    return {
      fullName: parsed.fullName || defaultData.fullName,
      surname: parsed.surname || defaultData.surname,
      givenNames: parsed.givenNames || defaultData.givenNames,
      dateOfBirth: parsed.dateOfBirth || defaultData.dateOfBirth,
      placeOfBirth: parsed.placeOfBirth || defaultData.placeOfBirth,
      nationality: parsed.nationality || defaultData.nationality,
      sex: parsed.sex === 'F' || parsed.sex === 'X' ? parsed.sex : 'M',
      passportNumber: parsed.passportNumber || defaultData.passportNumber,
      issuingAuthority: parsed.issuingAuthority || defaultData.issuingAuthority,
      dateOfIssuance: parsed.dateOfIssuance || defaultData.dateOfIssuance,
    };
  } catch {
    return defaultData;
  }
}

/**
 * Saves passport profile data to localStorage
 */
export function savePassportProfile(data: PassportProfileData): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PASSPORT_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}
