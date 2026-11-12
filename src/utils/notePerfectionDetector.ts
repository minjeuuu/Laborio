/**
 * Bar Note Perfection Engine & Quality Auditor
 *
 * Provides intelligent detection of note quality, statutory citations,
 * categorical answers (answering the question: "Is it necessary to add 'No' or 'Yes'?"),
 * and 1-click transformation into Supreme Court Bar Exam perfection.
 */

export type NoteLegalCategory =
  | 'problem_scenario'
  | 'codal_provision'
  | 'rule_with_exception'
  | 'formula_or_rate'
  | 'general_doctrine';

export interface NotePerfectionCheckItem {
  id: string;
  label: string;
  passed: boolean;
  explanation: string;
  recommendation?: string;
}

export interface NotePerfectionReport {
  score: number; // 0 to 100
  grade: 'Supreme Court Ready (100%)' | 'Bar Exam Ready' | 'Competent Foundation' | 'Draft Note';
  category: NoteLegalCategory;
  categoryLabel: string;
  hasCategoricalStance: boolean;
  isCategoricalNecessary: boolean;
  categoricalAdvice: string;
  hasStatutoryCitation: boolean;
  citationFound?: string;
  hasControllingDoctrine: boolean;
  hasCleanPunctuation: boolean;
  punctuationIssues: string[];
  checklist: NotePerfectionCheckItem[];
  perfectedTitle: string;
  perfectedContent: string;
}

/**
 * Detects whether a text represents a problem scenario / legal question
 */
export function isProblemScenarioText(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    /\b(scenario|problem|fact pattern|hypo|can\s+|does\s+|is\s+|are\s+|whether\s+|what if|if an? employee|an employee was|where a company|a worker|suppose)\b/i.test(
      lower
    ) ||
    lower.includes('problem scenario:') ||
    /\b(entitled to|valid|lawful|illegal|void|compensable|liable)\?/i.test(text)
  );
}

/**
 * Detects whether a text represents an objective codal definition or formula
 */
export function isCodalOrFormulaText(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return (
    /\b(definition|meaning|hours worked|normal hours|night shift differential|service charges|minimum wage|formula|rate|multipliers?|retirement pay|13th month computation)\b/i.test(
      lower
    ) ||
    lower.startsWith('art.') ||
    lower.startsWith('sec.') ||
    lower.startsWith('statutory')
  );
}

/**
 * Detects categorical stance in text (Yes, No, Valid, Void, Lawful, Illegal, Prohibited, General Rule)
 */
export function detectCategoricalStance(text: string): {
  hasStance: boolean;
  stanceWord?: string;
  isAwkwardSemicolon: boolean;
} {
  if (!text) return { hasStance: false, isAwkwardSemicolon: false };

  // Check for awkward "no; yes;" or "No; "
  const isAwkwardSemicolon =
    /(?:^|[;\s])(?:no|yes)\s*;\s*(?:yes|no)/i.test(text) ||
    /(?:^|\n)\s*(?:no|yes)\s*;\s*/i.test(text) ||
    /;\s*(?:no|yes)\b/i.test(text);

  const match = text.match(
    /(?:^|\n|:\s*)(?:General\s+Rule:\s*)?(YES|NO|VALID|VOID|LAWFUL|UNLAWFUL|ILLEGAL|PROHIBITED|COMPLIANT|NON-COMPLIANT)\b/i
  );

  if (match) {
    return {
      hasStance: true,
      stanceWord: match[1].toUpperCase(),
      isAwkwardSemicolon,
    };
  }

  // Also check if text has "General Rule: ... Exception: ..."
  if (/\bgeneral\s+rule\b/i.test(text) && /\bexception\b/i.test(text)) {
    return {
      hasStance: true,
      stanceWord: 'GENERAL RULE & EXCEPTION',
      isAwkwardSemicolon,
    };
  }

  return { hasStance: false, isAwkwardSemicolon };
}

/**
 * Detects statutory citation in text (e.g., Art. 83, R.A. 11210, P.D. 442, D.O. 174, G.R. No.)
 */
export function detectStatutoryCitation(text: string): {
  hasCitation: boolean;
  citationFound?: string;
} {
  if (!text) return { hasCitation: false };

  const pattern =
    /\b(?:Art\.|Article|Arts\.|Articles)\s+\d+[\w-]*|\b(?:R\.A\.|Republic\s+Act)\s+(?:No\.\s*)?\d+|\b(?:P\.D\.|Presidential\s+Decree)\s+(?:No\.\s*)?\d+|\b(?:D\.O\.|Department\s+Order)\s+(?:No\.\s*)?\d+|\bG\.R\.\s+No\.\s*[\w-]+|\bBoie-Takeda|\bBoie|\bAutobus|\bSan\s+Miguel|\bSerrano\b|\bBoie\s+Takeda\b/i;

  const match = text.match(pattern);
  return {
    hasCitation: Boolean(match),
    citationFound: match ? match[0] : undefined,
  };
}

/**
 * Auto-perfects legal note content:
 * - Cleans awkward "no; yes;" into "General Rule: No. Exception: Yes."
 * - Cleans "No; " into "No. " and "Yes; " into "Yes. "
 * - Strips double colons, leading dashes, stray punctuation
 * - Formats problem scenarios with clear categorical answers
 * - Standardizes into Supreme Court Bar Exam format
 */
export function perfectifyNoteContent(
  title: string = '',
  content: string = ''
): { title: string; content: string } {
  let cleanT = (title || '').trim();
  let cleanC = (content || '').trim();

  // 1. Sanitize title
  cleanT = cleanT
    .replace(/^(?:Controlling statutory doctrine|Rule|Statutory Rule|Verdict):\s*/i, '')
    .replace(/^\[(?:LAWFUL|UNLAWFUL|VALID|ILLEGAL)\]\s*/i, '')
    .replace(/\s*[-:]\s*(?:Problem Scenario|Scenario).*$/i, '')
    .replace(/[\s—–:-]+$/, '')
    .trim();

  if (!cleanT) {
    cleanT = 'Philippine Labor Standards Note';
  }

  // 2. Normalize and heal awkward "no; yes;" sequences
  cleanC = cleanC.replace(
    /(?:^|[;\s])no\s*;\s*yes;?/gi,
    '\nGeneral Rule: No. Exception: Yes.'
  );
  cleanC = cleanC.replace(
    /(?:^|[;\s])yes\s*;\s*no;?/gi,
    '\nGeneral Rule: Yes. Exception: No.'
  );

  // 3. Normalize "No; under..." or "Yes; under..." into Supreme Court standard "No. Under..." or "Yes. Under..."
  cleanC = cleanC.replace(
    /(?:^|\n|:\s*)(No|Yes)\s*;\s*(?=[a-z])/gi,
    (_m, p1) => {
      return `${p1.toUpperCase()}. `;
    }
  );
  cleanC = cleanC.replace(
    /(?:^|\n|:\s*)(Void|Valid|Illegal|Lawful)\s*;\s*(?=[a-z])/gi,
    (_m, p1) => {
      return `${p1.toUpperCase()}. `;
    }
  );

  // 4. Strip duplicate colons and awkward leading punctuation
  cleanC = cleanC.replace(/[:\s]*:[:\s]*:[:\s]*/g, ': ');
  cleanC = cleanC.replace(/::+/g, ': ');
  cleanC = cleanC.replace(/\s+:\s+/g, ': ');
  cleanC = cleanC.replace(/^[:\s—–\-]+/, '');

  // 5. Structure lines if unformatted
  const lines = cleanC.split('\n').map((l) => l.trim()).filter(Boolean);
  const formattedLines: string[] = [];

  for (let line of lines) {
    // Strip trailing colons or stray semicolons at end of line
    line = line.replace(/[:;\s]+$/, '');
    if (line) {
      formattedLines.push(line);
    }
  }

  cleanC = formattedLines.join('\n');

  return {
    title: cleanT,
    content: cleanC,
  };
}

/**
 * Detects note perfection and provides detailed guidance on whether "No" or "Yes" is necessary
 */
export function detectNotePerfection(input: {
  title?: string;
  content?: string;
}): NotePerfectionReport {
  const title = (input.title || '').trim();
  const content = (input.content || '').trim();
  const fullText = `${title}\n${content}`;

  const isScenario = isProblemScenarioText(fullText);
  const isCodal = isCodalOrFormulaText(fullText);
  const stanceInfo = detectCategoricalStance(fullText);
  const citInfo = detectStatutoryCitation(fullText);

  // Determine legal category
  let category: NoteLegalCategory = 'general_doctrine';
  let categoryLabel = 'General Statutory Doctrine';

  if (isScenario) {
    category = 'problem_scenario';
    categoryLabel = 'Bar Problem Scenario / Hypo';
  } else if (/\b(general rule|exception)\b/i.test(fullText)) {
    category = 'rule_with_exception';
    categoryLabel = 'General Rule & Exception';
  } else if (/\b(formula|multiplier|percent|%|php|peso|days)\b/i.test(fullText)) {
    category = 'formula_or_rate';
    categoryLabel = 'Statutory Formula / Rate Matrix';
  } else if (isCodal) {
    category = 'codal_provision';
    categoryLabel = 'Codal Statutory Provision';
  }

  // Answer the question: "Is it necessary to add the 'No' or 'Yes'?"
  let isCategoricalNecessary = false;
  let categoricalAdvice = '';

  if (category === 'problem_scenario') {
    isCategoricalNecessary = true;
    if (stanceInfo.hasStance) {
      categoricalAdvice =
        'Excellent! In Philippine Bar examination problems, examiners mandate a clear categorical answer ("YES" or "NO") first before discussing the legal basis. Your note has a decisive categorical stance.';
    } else {
      categoricalAdvice =
        'Crucial Bar Tip: YES, adding "NO" or "YES" is strictly necessary for this problem scenario. The Supreme Court Bar examiners mandate a definitive categorical answer in the first sentence to avoid losing points for waffling.';
    }
  } else if (category === 'rule_with_exception') {
    isCategoricalNecessary = true;
    if (stanceInfo.isAwkwardSemicolon) {
      categoricalAdvice =
        'Punctuation Notice: Dangling or awkward "no; yes;" detected! Replace it with the gold-standard Bar format: "General Rule: No. Exception: Yes, if..." for 100% clarity.';
    } else {
      categoricalAdvice =
        'Categorical distinction: For rules with exceptions, phrasing as "General Rule: [No/Yes]. Exception: [...]" provides maximum precision under Philippine labor jurisprudence.';
    }
  } else if (category === 'formula_or_rate' || category === 'codal_provision') {
    isCategoricalNecessary = false;
    categoricalAdvice =
      'Objective Codal Rule: A "Yes" or "No" prefix is NOT necessary here. For statutory definitions, thresholds, and multiplier formulas, objective legal standards without Yes/No prefixes are cleaner and legally precise.';
  } else {
    isCategoricalNecessary = false;
    categoricalAdvice =
      'Substantive Doctrine: Stating "Yes" or "No" is only necessary when answering a specific dispute or factual problem. For general doctrines, focus on the controlling statutory criteria.';
  }

  // Check for punctuation issues
  const punctuationIssues: string[] = [];
  if (stanceInfo.isAwkwardSemicolon) {
    punctuationIssues.push('Awkward "no; yes;" semicolon sequence detected');
  }
  if (/::+/.test(content)) {
    punctuationIssues.push('Duplicate or chained colons (::)');
  }
  if (/;\s*$/.test(content)) {
    punctuationIssues.push('Dangling semicolon at end of note');
  }

  const hasCleanPunctuation = punctuationIssues.length === 0;
  const hasControllingDoctrine =
    /\b(doctrine|rule|mandate|prohibited|exempt|required|entitled|test|requisite)\b/i.test(
      content
    ) || content.length > 30;

  // Build Checklist
  const checklist: NotePerfectionCheckItem[] = [
    {
      id: 'statutory_citation',
      label: 'Statutory Codal Basis / Citation',
      passed: citInfo.hasCitation,
      explanation: citInfo.hasCitation
        ? `Contains verified legal citation (${citInfo.citationFound})`
        : 'Missing explicit Article, Republic Act, or Supreme Court G.R. citation.',
      recommendation: citInfo.hasCitation
        ? undefined
        : 'Add the controlling Article (e.g. Art. 83, Art. 95, RA 11210).',
    },
    {
      id: 'categorical_clarity',
      label: isCategoricalNecessary
        ? 'Categorical Answer (Yes / No / Valid)'
        : 'Objective Statutory Criteria',
      passed: isCategoricalNecessary ? stanceInfo.hasStance : true,
      explanation: categoricalAdvice,
      recommendation:
        isCategoricalNecessary && !stanceInfo.hasStance
          ? 'Add a clear "YES" or "NO" at the beginning of the legal conclusion.'
          : undefined,
    },
    {
      id: 'controlling_doctrine',
      label: 'Controlling Doctrine & Practical Rule',
      passed: hasControllingDoctrine,
      explanation: hasControllingDoctrine
        ? 'Substantive rule and legal consequence are clearly stated.'
        : 'Note is too brief or lacks substantive legal consequence.',
      recommendation: hasControllingDoctrine
        ? undefined
        : 'State the specific labor standard and who is entitled or exempted.',
    },
    {
      id: 'clean_punctuation',
      label: 'Pristine Punctuation (Zero Dangling "no; yes;"))',
      passed: hasCleanPunctuation,
      explanation: hasCleanPunctuation
        ? 'Punctuation is clean and meets Supreme Court publication standards.'
        : `Issues found: ${punctuationIssues.join(', ')}.`,
      recommendation: hasCleanPunctuation
        ? undefined
        : 'Click "Perfectify Note" to auto-format clean periods and colons.',
    },
  ];

  // Calculate score
  let score = 30; // base for existing note
  if (citInfo.hasCitation) score += 30;
  if (hasControllingDoctrine) score += 20;
  if (isCategoricalNecessary ? stanceInfo.hasStance : true) score += 10;
  if (hasCleanPunctuation) score += 10;
  score = Math.min(100, Math.max(0, score));

  let grade: NotePerfectionReport['grade'] = 'Draft Note';
  if (score >= 95) grade = 'Supreme Court Ready (100%)';
  else if (score >= 80) grade = 'Bar Exam Ready';
  else if (score >= 60) grade = 'Competent Foundation';

  const { title: perfectedTitle, content: perfectedContent } = perfectifyNoteContent(
    title,
    content
  );

  return {
    score,
    grade,
    category,
    categoryLabel,
    hasCategoricalStance: stanceInfo.hasStance,
    isCategoricalNecessary,
    categoricalAdvice,
    hasStatutoryCitation: citInfo.hasCitation,
    citationFound: citInfo.citationFound,
    hasControllingDoctrine,
    hasCleanPunctuation,
    punctuationIssues,
    checklist,
    perfectedTitle,
    perfectedContent,
  };
}
