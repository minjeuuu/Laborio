export interface PrescriptivePeriodItem {
  id: string;
  claimOrAction: string;
  category: 'money_claims' | 'dismissal' | 'appeals' | 'special_laws' | 'penal';
  correctPeriod: string;
  statutorySource: string;
  keyRule: string;
  trapAlert: string;
  landmarkCase?: string;
  choices: string[];
}

export const PRESCRIPTIVE_PERIODS_DATA: PrescriptivePeriodItem[] = [
  {
    id: 'money_claims_art306',
    claimOrAction: 'Money claims arising from employer-employee relations (unpaid overtime, holiday pay, 13th month pay, SIL)',
    category: 'money_claims',
    correctPeriod: '3 Years',
    statutorySource: 'Art. 306 (formerly Art. 291), Labor Code',
    keyRule: 'Must be filed within three (3) years from the time the cause of action accrued; otherwise, they shall be forever barred.',
    trapAlert: 'For Service Incentive Leave (SIL), prescription begins NOT from the end of the year earned, but only upon demand or termination of employment (Auto Bus Transport Systems v. Bautista).',
    landmarkCase: 'Auto Bus Transport Systems v. Bautista, G.R. No. 156367 (2005)',
    choices: ['1 Year', '3 Years', '4 Years', '10 Years'],
  },
  {
    id: 'illegal_dismissal_art1146',
    claimOrAction: 'Action for Illegal Dismissal (reinstatement, full backwages, and damages)',
    category: 'dismissal',
    correctPeriod: '4 Years',
    statutorySource: 'Art. 1146, Civil Code of the Philippines (Injury to Rights)',
    keyRule: 'An illegal dismissal action is an action for injury to the rights of the plaintiff, which prescribes in four (4) years from termination.',
    trapAlert: 'Do NOT confuse with Art. 306 3-year money claims. Backwages in illegal dismissal are mere legal consequences of the termination, not a pure money claim.',
    landmarkCase: 'Callanta v. Carnation Phils., G.R. No. 70615 (1986); Arriola v. Pilipino Star Ngayon (2014)',
    choices: ['1 Year', '3 Years', '4 Years', '5 Years'],
  },
  {
    id: 'ulp_art305',
    claimOrAction: 'Action for Unfair Labor Practice (ULP) civil/administrative aspect',
    category: 'special_laws',
    correctPeriod: '1 Year',
    statutorySource: 'Art. 305 (formerly Art. 290), Labor Code',
    keyRule: 'All unfair labor practice cases shall be filed within one (1) year from accrual; otherwise, they are forever barred.',
    trapAlert: 'Criminal prosecution for ULP requires a final administrative finding of ULP first, and the criminal action also prescribes in 1 year from finality of the administrative judgment.',
    landmarkCase: 'Art. 258 & Art. 305, Labor Code',
    choices: ['6 Months', '1 Year', '3 Years', '4 Years'],
  },
  {
    id: 'la_to_nlrc_appeal_art229',
    claimOrAction: 'Appeal from the Decision of the Labor Arbiter to the NLRC Commission',
    category: 'appeals',
    correctPeriod: '10 Calendar Days',
    statutorySource: 'Art. 229 (formerly Art. 223), Labor Code; 2011 NLRC Rules of Procedure',
    keyRule: 'Must be perfected within ten (10) calendar days from receipt of the decision, accompanied by memorandum of appeal and cash/surety appeal bond for monetary awards.',
    trapAlert: 'These are ten CALENDAR days, not working days. If the 10th day falls on a Saturday, Sunday, or legal holiday, it may be filed on the next business day.',
    landmarkCase: 'McBurnie v. Ganzon, G.R. Nos. 178034 & 186984 (2013)',
    choices: ['10 Calendar Days', '15 Days', '30 Days', '60 Days'],
  },
  {
    id: 'nlrc_mr_period',
    claimOrAction: 'Motion for Reconsideration of an adverse NLRC Commission Decision',
    category: 'appeals',
    correctPeriod: '10 Calendar Days',
    statutorySource: 'Rule VII, Sec. 15, 2011 NLRC Rules of Procedure',
    keyRule: 'Only one (1) Motion for Reconsideration is allowed, and it must be filed within ten (10) calendar days from receipt of the resolution.',
    trapAlert: 'Filing an MR with the NLRC is an indispensable condition precedent before filing a Rule 65 petition for certiorari with the Court of Appeals.',
    landmarkCase: 'Sim v. NLRC, G.R. No. 157376 (2007)',
    choices: ['5 Days', '10 Calendar Days', '15 Days', '30 Days'],
  },
  {
    id: 'ca_certiorari_rule65',
    claimOrAction: 'Petition for Certiorari from the NLRC to the Court of Appeals under Rule 65',
    category: 'appeals',
    correctPeriod: '60 Days',
    statutorySource: 'Rule 65, Sec. 4, Rules of Court; St. Martin Funeral Home doctrine',
    keyRule: 'Must be filed within sixty (60) days from notice of the denial of the Motion for Reconsideration by the NLRC.',
    trapAlert: 'Direct recourse to the Supreme Court from the NLRC violates the hierarchy of courts. One must strictly go to the CA first via Rule 65.',
    landmarkCase: 'St. Martin Funeral Home v. NLRC, G.R. No. 130866 (1998)',
    choices: ['15 Days', '30 Days', '45 Days', '60 Days'],
  },
  {
    id: 'sc_appeal_rule45',
    claimOrAction: 'Petition for Review on Certiorari from the Court of Appeals to the Supreme Court',
    category: 'appeals',
    correctPeriod: '15 Days',
    statutorySource: 'Rule 45, Sec. 2, 1997 Rules of Civil Procedure',
    keyRule: 'Must be filed within fifteen (15) days from notice of the judgment, final order, or denial of the motion for reconsideration in the CA.',
    trapAlert: 'Raises only pure questions of law. Factual findings of the Labor Arbiter affirmed by the NLRC and CA are accorded great respect and finality.',
    landmarkCase: 'Fuji Television Network, Inc. v. Espiritu, G.R. No. 204944 (2014)',
    choices: ['10 Days', '15 Days', '30 Days', '60 Days'],
  },
  {
    id: 'strike_bargaining_deadlock',
    claimOrAction: 'Cooling-off Period for Strike in cases of Collective Bargaining Deadlock',
    category: 'special_laws',
    correctPeriod: '30 Days',
    statutorySource: 'Art. 278 (formerly Art. 263), Labor Code',
    keyRule: 'In cases of bargaining deadlocks, the cooling-off period is 30 days from the filing of the Notice of Strike with the NCMB.',
    trapAlert: 'Cooling-off period for ULP is 15 days, except in cases of union-busting where the 15-day period is waived, but the 7-day strike ban after strike vote report remains mandatory.',
    landmarkCase: 'National Union of Workers in Hotels (NUWHRAIN) v. NLRC',
    choices: ['7 Days', '15 Days', '30 Days', '60 Days'],
  },
  {
    id: 'sena_mandatory_period',
    claimOrAction: 'Mandatory Single Entry Approach (SENA) Conciliation-Mediation period',
    category: 'special_laws',
    correctPeriod: '30 Days',
    statutorySource: 'R.A. 10396; D.O. 151-16 (SENA Rules)',
    keyRule: 'SENA conciliation-mediation period is 30 calendar days to assist parties in reaching an amicable settlement before formal arbitration.',
    trapAlert: 'SENA can be extended for another 30 days only upon mutual agreement of both parties.',
    landmarkCase: 'R.A. No. 10396 (Mandatory Conciliation Act)',
    choices: ['10 Days', '15 Days', '30 Days', '45 Days'],
  },
  {
    id: 'simple_illegal_recruitment',
    claimOrAction: 'Prescriptive period for Simple Illegal Recruitment under R.A. 8042',
    category: 'penal',
    correctPeriod: '5 Years',
    statutorySource: 'Sec. 12, R.A. 8042 as amended by R.A. 10022',
    keyRule: 'Simple illegal recruitment prescribes in five (5) years from commission or discovery.',
    trapAlert: 'Do NOT confuse with illegal recruitment constituting economic sabotage, which prescribes in 20 years.',
    landmarkCase: 'People v. Temporada, G.R. No. 173473 (2008)',
    choices: ['1 Year', '3 Years', '5 Years', '20 Years'],
  },
  {
    id: 'economic_sabotage_recruitment',
    claimOrAction: 'Prescriptive period for Illegal Recruitment involving Economic Sabotage (Syndicated / Large Scale)',
    category: 'penal',
    correctPeriod: '20 Years',
    statutorySource: 'Sec. 12, R.A. 8042 as amended by R.A. 10022',
    keyRule: 'Illegal recruitment involving economic sabotage (committed by a syndicate of 3+ persons or in large scale against 3+ victims) prescribes in twenty (20) years.',
    trapAlert: 'Punishable by life imprisonment and a fine of ₱2,000,000 to ₱5,000,000.',
    landmarkCase: 'People v. Bayker, G.R. No. 170192 (2016)',
    choices: ['5 Years', '10 Years', '15 Years', '20 Years'],
  },
  {
    id: 'ec_claims_art207',
    claimOrAction: 'Claims for Employees Compensation (ECC) benefits for work-connected disability or death',
    category: 'money_claims',
    correctPeriod: '3 Years',
    statutorySource: 'Art. 207 (formerly Art. 201), Labor Code; P.D. 626',
    keyRule: 'No claim for compensation shall be given due course unless filed with the System (SSS or GSIS) within three (3) years from the time the cause of action accrued.',
    trapAlert: 'Notice of injury, sickness, or death to employer must be given within 5 days.',
    landmarkCase: 'ECC Resolution No. 10-10-157',
    choices: ['1 Year', '2 Years', '3 Years', '5 Years'],
  },
  {
    id: 'labor_offenses_penal',
    claimOrAction: 'Penal offenses penalized under the Labor Code and its implementing rules',
    category: 'penal',
    correctPeriod: '3 Years',
    statutorySource: 'Art. 305 (formerly Art. 290), Labor Code',
    keyRule: 'Offenses penalized under the Labor Code and rules issued pursuant thereto prescribe in three (3) years.',
    trapAlert: 'Exception: unfair labor practice offenses prescribe in one (1) year. Union fund financial irregularities prescribe in five (5) years.',
    landmarkCase: 'Art. 305, Labor Code',
    choices: ['1 Year', '2 Years', '3 Years', '5 Years'],
  },
];

export function filterPrescriptivePeriods(
  items: PrescriptivePeriodItem[],
  categoryFilter: string,
  searchQuery: string
): PrescriptivePeriodItem[] {
  return items.filter((item) => {
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.claimOrAction.toLowerCase().includes(query) ||
      item.correctPeriod.toLowerCase().includes(query) ||
      item.statutorySource.toLowerCase().includes(query) ||
      item.keyRule.toLowerCase().includes(query) ||
      item.trapAlert.toLowerCase().includes(query) ||
      (item.landmarkCase ? item.landmarkCase.toLowerCase().includes(query) : false);
    return matchesCategory && matchesSearch;
  });
}
