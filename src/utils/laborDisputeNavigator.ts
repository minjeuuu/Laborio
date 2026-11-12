export type ForumJurisdictionId =
  | 'sena'
  | 'nlrc_labor_arbiter'
  | 'nlrc_commission'
  | 'dole_regional_director_128'
  | 'dole_regional_director_129'
  | 'voluntary_arbitrator'
  | 'court_of_appeals'
  | 'supreme_court';

export interface ForumJurisdictionMeta {
  id: ForumJurisdictionId;
  name: string;
  badge: string;
  controllingStatute: string;
  scopeOfAuthority: string[];
  keyThresholds: string;
  appealRoute: string;
  color: string;
}

export const FORUM_JURISDICTIONS: Record<ForumJurisdictionId, ForumJurisdictionMeta> = {
  sena: {
    id: 'sena',
    name: 'SENA (Single Entry Approach)',
    badge: '30-DAY CONCILIATION',
    controllingStatute: 'R.A. 10396; D.O. 151-16',
    scopeOfAuthority: [
      'Mandatory 30-day conciliation-mediation for all labor and employment issues',
      'Non-litigious, speedy, impartial dispute settlement before SEADO officer',
      'Assists parties to arrive at a voluntary compromise agreement',
    ],
    keyThresholds: 'Mandatory first step before filing complaints with DOLE or NLRC (except urgent matters or notices of strike)',
    appealRoute: 'Non-binding recommendation. If unresolved after 30 days, SEADO issues Referral to proper forum (NLRC, DOLE, or VA).',
    color: 'from-amber-600 to-yellow-500',
  },
  nlrc_labor_arbiter: {
    id: 'nlrc_labor_arbiter',
    name: 'NLRC Labor Arbiter',
    badge: 'EXCLUSIVE & ORIGINAL',
    controllingStatute: 'Art. 224 [formerly Art. 217], Labor Code',
    scopeOfAuthority: [
      'Unfair labor practices (ULP)',
      'Termination disputes (Illegal Dismissal / Constructive Dismissal)',
      'Money claims accompanied by claim for reinstatement',
      'Worker money claims EXCEEDING ₱5,000, regardless of reinstatement',
      'Claims for actual, moral, and exemplary damages arising from E-ER',
      'Legality of strikes and lockouts',
    ],
    keyThresholds: 'Money claims > ₱5,000 OR any illegal dismissal dispute regardless of amount',
    appealRoute: '10 Calendar Days to NLRC Commission (Art. 229) with mandatory Cash or Surety Appeal Bond for monetary award',
    color: 'from-rose-600 to-red-600',
  },
  nlrc_commission: {
    id: 'nlrc_commission',
    name: 'NLRC Commission (Divisions)',
    badge: 'APPELLATE REVIEW',
    controllingStatute: 'Art. 225 & 229, Labor Code',
    scopeOfAuthority: [
      'Exclusive appellate jurisdiction over all cases decided by Labor Arbiters',
      'Injunction power in labor disputes (Art. 225[e])',
      'Certified cases involving national interest strikes (Art. 278[g])',
    ],
    keyThresholds: 'Appeal perfected within 10 calendar days with appeal bond',
    appealRoute: '10 Calendar Days Motion for Reconsideration -> 60 Days Rule 65 Certiorari to Court of Appeals (St. Martin doctrine)',
    color: 'from-purple-600 to-indigo-600',
  },
  dole_regional_director_128: {
    id: 'dole_regional_director_128',
    name: 'DOLE Regional Director (Art. 128 Visitorial)',
    badge: 'VISITORIAL & ENFORCEMENT',
    controllingStatute: 'Art. 128, Labor Code; D.O. 183-17 / D.O. 238-23',
    scopeOfAuthority: [
      'Routine and complaint-based inspection of establishments',
      'Order compliance with statutory minimum wages, wage orders, and labor standards',
      'Issue Compliance Orders with immediate execution (Art. 128[b])',
      'Order work stoppage in imminent danger to employee safety/health',
    ],
    keyThresholds: 'NO monetary ceiling (can award millions), BUT employer-employee relationship must still exist and employer did not contest findings with substantial evidence',
    appealRoute: '10 Calendar Days to DOLE Secretary (Art. 128[b]) with cash/surety bond equivalent to monetary order',
    color: 'from-emerald-600 to-teal-600',
  },
  dole_regional_director_129: {
    id: 'dole_regional_director_129',
    name: 'DOLE Regional Director (Art. 129 Summary Claims)',
    badge: 'SUMMARY MONEY CLAIMS (≤ ₱5,000)',
    controllingStatute: 'Art. 129, Labor Code',
    scopeOfAuthority: [
      'Adjudication of simple money claims arising from employer-employee relationship',
      'Summary proceeding resolved within 30 calendar days from filing',
    ],
    keyThresholds: 'Must meet 3 CUMULATIVE elements: (1) Arises from E-ER, (2) Aggregate claim does NOT exceed ₱5,000 per employee, (3) NO prayer for reinstatement',
    appealRoute: '5 Calendar Days to NLRC Commission (Art. 129)',
    color: 'from-sky-600 to-blue-600',
  },
  voluntary_arbitrator: {
    id: 'voluntary_arbitrator',
    name: 'Voluntary Arbitrator / Panel of Arbitrators',
    badge: 'CBA & GRIEVANCE MACHINERY',
    controllingStatute: 'Arts. 274–275 [formerly Arts. 261–262], Labor Code',
    scopeOfAuthority: [
      'Unresolved grievances arising from interpretation or implementation of CBA',
      'Violations or enforcement of company personnel policies',
      'All other labor disputes voluntarily submitted by mutual agreement of parties',
    ],
    keyThresholds: 'Requires CBA grievance clause or joint submission agreement',
    appealRoute: '10 Calendar Days Motion for Reconsideration / 15 Days Rule 43 Petition for Review to Court of Appeals',
    color: 'from-cyan-600 to-teal-500',
  },
  court_of_appeals: {
    id: 'court_of_appeals',
    name: 'Court of Appeals (Special Labor Division)',
    badge: 'RULE 65 CERTIORARI',
    controllingStatute: 'Rule 65, Rules of Court; St. Martin Funeral Home v. NLRC',
    scopeOfAuthority: [
      'Petitions for Certiorari alleging grave abuse of discretion amounting to lack or excess of jurisdiction by NLRC or DOLE Secretary',
      'Rule 43 appeals from decisions of Voluntary Arbitrators',
    ],
    keyThresholds: 'Filed within 60 days from denial of Motion for Reconsideration',
    appealRoute: '15 Days Rule 45 Petition for Review on Certiorari to Supreme Court',
    color: 'from-violet-600 to-purple-500',
  },
  supreme_court: {
    id: 'supreme_court',
    name: 'Supreme Court of the Philippines',
    badge: 'FINAL COURT OF LAST RESORT',
    controllingStatute: 'Rule 45, 1997 Rules of Civil Procedure; Art. VIII, 1987 Constitution',
    scopeOfAuthority: [
      'Petitions for Review on Certiorari on pure questions of law',
      'En banc or divisional review of decisions of the Court of Appeals',
      'Sets binding jurisprudence and interpretations of Philippine labor laws',
    ],
    keyThresholds: 'Strictly questions of law; factual findings of labor tribunals affirmed by CA are binding',
    appealRoute: 'Final and executory; entry of judgment',
    color: 'from-amber-500 to-rose-600',
  },
};

export interface DisputeScenario {
  id: string;
  title: string;
  summary: string;
  claimAmount: string;
  hasReinstatement: boolean;
  parties: string;
  facts: string;
  correctForumId: ForumJurisdictionId;
  distractorForumIds: ForumJurisdictionId[];
  statutoryBasis: string;
  governingDoctrine: string;
  supremeCourtPrecedent: string;
  criticalAnalysis: string;
}

export const DISPUTE_SCENARIOS: DisputeScenario[] = [
  {
    id: 'ds_exec_termination',
    title: 'Senior BPO Project Director Illegal Dismissal & ₱1,850,000 Unpaid Separation Pay',
    summary: 'A project director with 12 years of service is abruptly locked out without written notice or administrative hearing.',
    claimAmount: '₱1,850,000 backwages + ₱500,000 damages',
    hasReinstatement: true,
    parties: 'Executive Worker vs. Multinational IT-BPO Corp.',
    facts: 'Rafael, a Senior Project Director earning ₱180,000 monthly, was locked out of company servers on Monday morning. HR informed him that his position was declared redundant due to automated AI workflows. No 30-day written notice was submitted to DOLE, no separation pay was tendered, and no objective selection criteria were shown. Rafael demands reinstatement, ₱1,850,000 full backwages, and ₱500,000 moral damages for bad faith.',
    correctForumId: 'nlrc_labor_arbiter',
    distractorForumIds: ['dole_regional_director_128', 'dole_regional_director_129', 'voluntary_arbitrator'],
    statutoryBasis: 'Art. 224(a)(2) & (4), Labor Code (termination disputes and claims for damages with money claims)',
    governingDoctrine: 'Under Article 224 (formerly 217), Labor Arbiters possess exclusive and original jurisdiction over termination disputes and money claims accompanied with a prayer for reinstatement. Although mandatory 30-day SENA conciliation is conducted first, if unresolved, jurisdiction vests solely with the Labor Arbiter.',
    supremeCourtPrecedent: 'San Miguel Corp. v. Del Rosario, G.R. No. 168194 (2005); Fuji Television Network v. Espiritu (2014)',
    criticalAnalysis: 'Even if the worker is a corporate manager or executive, as long as he is a regular employee and not a corporate officer appointed by the Board of Directors under the By-Laws, the NLRC Labor Arbiter has exclusive jurisdiction, not the RTC or DOLE Regional Director.',
  },
  {
    id: 'ds_visitorial_subminimum',
    title: 'DOLE Factory Routine Audit Uncovers 45 Unpaid Workers Totalling ₱840,000 Underpayment',
    summary: 'Routine DOLE inspection detects underpayment of regional minimum wages for 45 warehouse packers.',
    claimAmount: '₱840,000 wage differentials',
    hasReinstatement: false,
    parties: 'DOLE Labor Inspector vs. Logistics Hub Inc.',
    facts: 'During a routine inspection under D.O. 238-23, a DOLE Labor Inspector discovered that 45 warehouse logistics packers were receiving ₱450/day instead of the mandated ₱645 NCR minimum wage. The company records confirmed the underpayment. The total back-pay across all 45 workers is ₱840,000. All 45 workers remain currently employed at the warehouse and the employer did not contest the employment records.',
    correctForumId: 'dole_regional_director_128',
    distractorForumIds: ['nlrc_labor_arbiter', 'dole_regional_director_129', 'voluntary_arbitrator'],
    statutoryBasis: 'Art. 128(b), Labor Code (Visitorial and Enforcement Power of the DOLE Secretary/Regional Director)',
    governingDoctrine: 'Under Article 128(b), the DOLE Regional Director has visitorial power to issue compliance orders directing the employer to pay statutory wage differentials, even if the total amount exceeds ₱5,000. As long as employer-employee relationship exists and the employer did not dispute the inspector findings with substantial documentary proof, Art. 128 controls without any monetary ceiling.',
    supremeCourtPrecedent: "People's Broadcasting Service (Bombo Radyo Phils.) v. DOLE Secretary, G.R. No. 179652 (2012)",
    criticalAnalysis: 'The ₱5,000 limitation in Art. 129 does NOT apply to the visitorial power under Art. 128(b). The DOLE Secretary or Regional Director may order compliance regardless of whether the total sum is ₱50,000 or ₱5,000,000, provided employment still subsists.',
  },
  {
    id: 'ds_cba_wage_distortion',
    title: 'Labor Union Grievance Over CBA Wage Distortion & Allowance Clause Interpretation',
    summary: 'Union files grievance when company refuses to adjust negotiated CBA wage brackets following a new Wage Order.',
    claimAmount: 'Re-indexing of all CBA job classifications',
    hasReinstatement: false,
    parties: 'Certified Collective Bargaining Agent vs. Beverage Bottling Plant',
    facts: 'The certified collective bargaining union and the management executed a 5-year CBA with a specialized Wage Distortion Matrix. Following Regional Wage Board Order No. 24, management granted the ₱35 increase only to Level 1 helpers, collapsing the pay differential with Level 2 operators. The union invoked the grievance machinery. The grievance committee deadlocked after 7 days.',
    correctForumId: 'voluntary_arbitrator',
    distractorForumIds: ['nlrc_labor_arbiter', 'dole_regional_director_128', 'dole_regional_director_129'],
    statutoryBasis: 'Art. 274 & Art. 275 (formerly Art. 261 & 262), Labor Code; Art. 124 (Wage Distortion)',
    governingDoctrine: 'Unresolved grievances arising from the interpretation or implementation of the Collective Bargaining Agreement (CBA) or company personnel policies fall under the original and exclusive jurisdiction of the Voluntary Arbitrator or Panel of Voluntary Arbitrators designated in the CBA, NOT the Labor Arbiter.',
    supremeCourtPrecedent: 'San Miguel Corp. v. NLRC, G.R. No. 108001 (1996); Tabigue v. International Copra Export Corp. (2009)',
    criticalAnalysis: 'Even if money claims or wage differentials result from resolving the dispute, if the core origin is the interpretation or implementation of the CBA, the Labor Arbiter must dismiss for lack of jurisdiction in favor of the Voluntary Arbitrator.',
  },
  {
    id: 'ds_kasambahay_summary_claim',
    title: 'Separated Domestic Worker Claiming ₱4,200 Unpaid 13th Month Pay (No Reinstatement Claimed)',
    summary: 'A helper resigned amicably and seeks her unpaid 13th month pay under Batas Kasambahay.',
    claimAmount: '₱4,200 total money claim',
    hasReinstatement: false,
    parties: 'Kasambahay Maria vs. Former Household Employer',
    facts: 'Maria served as a household kasambahay for 9 months earning ₱5,500/month. She voluntarily resigned to return to her province to care for her mother. The employer withheld her pro-rated 13th month pay of ₱4,125. Maria does not seek reinstatement or damages, but only recovery of the ₱4,125 pro-rated statutory bonus under R.A. 10361.',
    correctForumId: 'dole_regional_director_129',
    distractorForumIds: ['nlrc_labor_arbiter', 'dole_regional_director_128', 'voluntary_arbitrator'],
    statutoryBasis: 'Art. 129, Labor Code (Recovery of wages, simple money claims and other benefits not exceeding ₱5,000)',
    governingDoctrine: 'Under Article 129, the DOLE Regional Director has summary adjudicative jurisdiction when all 3 elements concur: (1) claim arises from employer-employee relationship, (2) aggregate claim does NOT exceed ₱5,000 per employee, and (3) there is NO claim or prayer for reinstatement.',
    supremeCourtPrecedent: 'Brokenshire Memorial Hospital v. Minister of Labor, G.R. No. 74621 (1990)',
    criticalAnalysis: 'If Maria had claimed ₱5,001, or if she claimed illegal dismissal with reinstatement, jurisdiction would immediately shift to the NLRC Labor Arbiter under Art. 224.',
  },
];
