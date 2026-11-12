/**
 * Level Progression & XP System
 * 
 * Users earn Experience Points (XP) dynamically through:
 * - Quiz & Boss Showdown performance (correct answers, streaks, completion)
 * - Study time spent in sessions (active seconds logged)
 * - Arcade mini-game challenges and module mastery
 * 
 * Advancing through levels (Levels 1 to 33) unlocks new Mario character avatars,
 * titles, and exclusive rank badges.
 */

import { MarioAvatar } from '../types/laborLaw';

export interface LevelThreshold {
  level: number;
  xpRequired: number;
  title: string;
  unlockedAvatars: MarioAvatar[];
  perkDescription: string;
}

export const LEVEL_THRESHOLDS: readonly LevelThreshold[] = [
  {
    level: 1,
    xpRequired: 0,
    title: 'Novice Plumber (Labor Initiate)',
    unlockedAvatars: ['mario', 'luigi'],
    perkDescription: 'Standard Mushroom Kingdom labor rights credentials',
  },
  {
    level: 2,
    xpRequired: 120,
    title: 'Jurisdiction Apprentice',
    unlockedAvatars: ['toad'],
    perkDescription: 'Toad House advisory clearance',
  },
  {
    level: 3,
    xpRequired: 280,
    title: 'Mushroom Kingdom Clerk',
    unlockedAvatars: ['toadette'],
    perkDescription: 'DOLE docket filing permit',
  },
  {
    level: 4,
    xpRequired: 480,
    title: 'Dino Valley Paralegal',
    unlockedAvatars: ['yoshi'],
    perkDescription: 'Enhanced statutory digest speed',
  },
  {
    level: 5,
    xpRequired: 720,
    title: 'Mushroom Castle Counselor',
    unlockedAvatars: ['peach'],
    perkDescription: 'Royal decree statutory leaves analysis',
  },
  {
    level: 6,
    xpRequired: 1000,
    title: 'Subterranean Mine Explorer',
    unlockedAvatars: ['capttoad'],
    perkDescription: 'Unearths hidden labor jurisprudence gems',
  },
  {
    level: 7,
    xpRequired: 1320,
    title: 'Sarasaland Holiday Advocate',
    unlockedAvatars: ['daisy'],
    perkDescription: 'Regular and special holiday wage calculation mastery',
  },
  {
    level: 8,
    xpRequired: 1680,
    title: 'Comet Observatory Barrister',
    unlockedAvatars: ['rosalina'],
    perkDescription: 'Gravitational command of nighttime differential',
  },
  {
    level: 9,
    xpRequired: 2080,
    title: 'New Donk City Solicitor',
    unlockedAvatars: ['pauline'],
    perkDescription: 'Metropolitan wage order proficiency',
  },
  {
    level: 10,
    xpRequired: 2520,
    title: 'Jungle Arbiter of Work',
    unlockedAvatars: ['donkeykong'],
    perkDescription: 'Heavy-duty hazardous industry safety regulations',
  },
  {
    level: 11,
    xpRequired: 3000,
    title: 'Canopy Assistant Arbiter',
    unlockedAvatars: ['diddykong'],
    perkDescription: 'Agile apprentice and learnership oversight',
  },
  {
    level: 12,
    xpRequired: 3520,
    title: 'Egg Valley Statutory Jurist',
    unlockedAvatars: ['birdo'],
    perkDescription: 'Precision inspection of service charges distribution',
  },
  {
    level: 13,
    xpRequired: 4080,
    title: 'Koopa Shell Auditor',
    unlockedAvatars: ['koopatroopa'],
    perkDescription: 'Defensive audits against illegal wage deductions',
  },
  {
    level: 14,
    xpRequired: 4680,
    title: 'Subcon Subpoena Inspector',
    unlockedAvatars: ['shyguy'],
    perkDescription: 'Piercing legitimate contracting vs labor-only contracting',
  },
  {
    level: 15,
    xpRequired: 5320,
    title: 'Haunted Mansion Spectral Advocate',
    unlockedAvatars: ['boo'],
    perkDescription: 'Invisibility against procedural traps and prescription periods',
  },
  {
    level: 16,
    xpRequired: 6000,
    title: 'Crypt of Deadlines Master',
    unlockedAvatars: ['drybones'],
    perkDescription: 'Unbreakable command of the 3-year money claims prescription',
  },
  {
    level: 17,
    xpRequired: 6720,
    title: 'Koopa Magikoopa Jurist',
    unlockedAvatars: ['kamek'],
    perkDescription: 'Transmutes complex jurisprudence into crystal clarity',
  },
  {
    level: 18,
    xpRequired: 7480,
    title: 'Garlic Fortress Capitalist',
    unlockedAvatars: ['wario'],
    perkDescription: 'Relentless defense of 13th month pay computations',
  },
  {
    level: 19,
    xpRequired: 8280,
    title: 'Mischief Tennis Litigator',
    unlockedAvatars: ['waluigi'],
    perkDescription: 'Counter-serves unfair labor practice allegations',
  },
  {
    level: 20,
    xpRequired: 9120,
    title: 'Junior Castle Prosecutor',
    unlockedAvatars: ['bowserjr'],
    perkDescription: 'Fiery enforcement of managerial employee exemptions',
  },
  {
    level: 21,
    xpRequired: 10000,
    title: 'Molten Keep Chief Arbiter',
    unlockedAvatars: ['bowser'],
    perkDescription: 'Supreme solidary liability enforcement across contractors',
  },
  {
    level: 22,
    xpRequired: 10950,
    title: 'Heavy Alloy Jurisdict',
    unlockedAvatars: ['metalmario'],
    perkDescription: 'Indestructible shield against illegal dismissal suits',
  },
  {
    level: 23,
    xpRequired: 11950,
    title: 'Golden Treasury Chancellor',
    unlockedAvatars: ['goldmario'],
    perkDescription: 'Golden multiplier mastery across compressed workweeks',
  },
  {
    level: 24,
    xpRequired: 13000,
    title: 'Blazing Fireball Solicitor',
    unlockedAvatars: ['firemario'],
    perkDescription: 'Burning speed in resolving grievance machinery',
  },
  {
    level: 25,
    xpRequired: 14100,
    title: 'Frost Glaze Proceduralist',
    unlockedAvatars: ['iceluigi'],
    perkDescription: 'Freezes unlawful lockout orders in their tracks',
  },
  {
    level: 26,
    xpRequired: 15250,
    title: 'Super Leaf Flight Barrister',
    unlockedAvatars: ['tanookimario'],
    perkDescription: 'Glides over appellate jurisdictional obstacles',
  },
  {
    level: 27,
    xpRequired: 16450,
    title: 'Royal Feline Guardian',
    unlockedAvatars: ['catpeach'],
    perkDescription: 'Pounces on non-compliance with the Magna Carta for Women',
  },
  {
    level: 28,
    xpRequired: 17700,
    title: 'Cosmic Dimension Grand Scholar',
    unlockedAvatars: ['cosmicrosalina'],
    perkDescription: 'Universal synthesis of Supreme Court en banc rulings',
  },
  {
    level: 29,
    xpRequired: 19000,
    title: 'Undead Molten King Sovereign',
    unlockedAvatars: ['drybowser'],
    perkDescription: 'Resurrects valid claims despite procedural default',
  },
  {
    level: 30,
    xpRequired: 20400,
    title: 'Golden Dinosaur Legend',
    unlockedAvatars: ['goldenyoshi'],
    perkDescription: 'Golden clutch instincts on high-stakes statutory doctrines',
  },
  {
    level: 31,
    xpRequired: 21900,
    title: 'Toad Statutory Scholar Summa',
    unlockedAvatars: ['lawyertoad'],
    perkDescription: 'Top-tier statutory labor standards certificate honors',
  },
  {
    level: 32,
    xpRequired: 23500,
    title: 'Inverted Shadow Sovereign',
    unlockedAvatars: ['shadowmario'],
    perkDescription: 'Mastery over obscure special protective statutes',
  },
  {
    level: 33,
    xpRequired: 25200,
    title: 'Clinical Labor Diagnostics Doctor',
    unlockedAvatars: ['drpeach'],
    perkDescription: 'Flawless diagnosis of complex multi-tier employer-employee relationships',
  },
  {
    level: 34,
    xpRequired: 27000,
    title: 'Forensic Evidence Professor',
    unlockedAvatars: ['egadd'],
    perkDescription: 'Advanced electronic payroll logs and biometric attendance analysis',
  },
  {
    level: 35,
    xpRequired: 28900,
    title: 'Metropolitan Labor Tripartite Mayor',
    unlockedAvatars: ['paulinemetro'],
    perkDescription: 'Regional wage board diplomacy and city-wide dispute harmonization',
  },
  {
    level: 36,
    xpRequired: 30900,
    title: 'High-Speed Statutory Digest Runner',
    unlockedAvatars: ['diddyscholar'],
    perkDescription: 'Rapid digest citation sprints across Supreme Court landmark decisions',
  },
  {
    level: 37,
    xpRequired: 33000,
    title: 'Sarasaland Chief Arbitrator',
    unlockedAvatars: ['daisychamp'],
    perkDescription: 'Decisive voluntary arbitration awards resolving complex workplace deadlocks',
  },
  {
    level: 38,
    xpRequired: 35200,
    title: 'Heavy Mechanization OSH Inspector',
    unlockedAvatars: ['bowserjrmecha'],
    perkDescription: 'Rigorous enforcement of industrial machinery safety standards',
  },
  {
    level: 39,
    xpRequired: 37500,
    title: 'Supreme Court Roll Custodian',
    unlockedAvatars: ['toadettescholar'],
    perkDescription: 'Flawless archival retrieval of every Labor Code article and DOLE directive',
  },
  {
    level: 40,
    xpRequired: 39900,
    title: 'Crowned Sovereign of Due Process',
    unlockedAvatars: ['kingboo'],
    perkDescription: 'Banishment of unlawful summary dismissals via twin-notice requirements',
  },
  {
    level: 41,
    xpRequired: 42400,
    title: 'Agrarian & Plantation Labor Titan',
    unlockedAvatars: ['peteypiranha'],
    perkDescription: 'Protects piece-rate plantation wages and agricultural labor rights',
  },
  {
    level: 42,
    xpRequired: 45000,
    title: 'Forest Dispute Resolution Mediator',
    unlockedAvatars: ['wiggler'],
    perkDescription: 'Unshakeable patience in conciliation-mediation and collective bargaining',
  },
  {
    level: 43,
    xpRequired: 47700,
    title: 'Cloud Patrol Compliance Auditor',
    unlockedAvatars: ['lakitu'],
    perkDescription: 'High-altitude inspection of construction scaffolds and OSH conditions',
  },
  {
    level: 44,
    xpRequired: 50500,
    title: 'Construction Safety Heavy Sentinel',
    unlockedAvatars: ['hammerbro'],
    perkDescription: 'Upholds hard-hat PPE protocols and hazardous machinery safeguards',
  },
  {
    level: 45,
    xpRequired: 53400,
    title: 'Dean of Retirement Law & Senior Benefits',
    unlockedAvatars: ['crankykong'],
    perkDescription: 'Calculates R.A. 7641 retirement pay (22.5 days per year) with perfection',
  },
  {
    level: 46,
    xpRequired: 56400,
    title: 'Transport Logistics & Mobility Specialist',
    unlockedAvatars: ['funkykong'],
    perkDescription: 'Mastery over boundary system wage computation and transport driver rest periods',
  },
  {
    level: 47,
    xpRequired: 59500,
    title: 'Anti-Wage Theft Enforcement Agent',
    unlockedAvatars: ['nabbit'],
    perkDescription: 'Recovers withheld wages, unpaid overtime, and unremitted social insurance',
  },
  {
    level: 48,
    xpRequired: 62700,
    title: 'Workplace Sanitation & Hygiene Dean',
    unlockedAvatars: ['fluddmario'],
    perkDescription: 'Enforces pure drinking water, sanitary facilities, and clean working conditions',
  },
  {
    level: 49,
    xpRequired: 66000,
    title: 'Deep-Mine Hazardous Work Rights Warden',
    unlockedAvatars: ['chargetoad'],
    perkDescription: 'Protects underground mineworkers and guarantees hazardous work pay differentials',
  },
  {
    level: 50,
    xpRequired: 70000,
    title: 'Grand Master of Philippine Labor Standards',
    unlockedAvatars: ['goldmario', 'metalmario'],
    perkDescription: 'Absolute mastery across all Six Worlds of the Philippine Labor Code',
  },
  {
    level: 51,
    xpRequired: 74200,
    title: 'Seafarer Rights & Maritime Standards Dean',
    unlockedAvatars: ['blooper'],
    perkDescription: 'Upholds Magna Carta of Filipino Seafarers (R.A. 12021) and standard overseas contracts',
  },
  {
    level: 52,
    xpRequired: 78500,
    title: 'Subsurface Mining & Tunneling Safety Inspector',
    unlockedAvatars: ['montymole'],
    perkDescription: 'Rigorous inspection of underground tunnel ventilation and mineworker safety',
  },
  {
    level: 53,
    xpRequired: 82900,
    title: 'Heavy Materials Handling & OSH Guardian',
    unlockedAvatars: ['spike'],
    perkDescription: 'Safe lifting threshold enforcement, crane operations, and ergonomic safeguards',
  },
  {
    level: 54,
    xpRequired: 87400,
    title: 'Subpoena Service & Due Process Officer',
    unlockedAvatars: ['ninji'],
    perkDescription: 'Flawless service of formal notice-to-explain and hearing schedules with zero defects',
  },
  {
    level: 55,
    xpRequired: 92000,
    title: 'Statutory Harmonization High Sorcerer',
    unlockedAvatars: ['magikoopa'],
    perkDescription: 'Reconciles complex regional wage distortions and harmonizes collective bargaining agreements',
  },
  {
    level: 56,
    xpRequired: 96700,
    title: 'Article 306 Prescription Period Sovereign',
    unlockedAvatars: ['drybonesgold'],
    perkDescription: 'Defends against prescription default on 3-year statutory labor money claims',
  },
  {
    level: 57,
    xpRequired: 101500,
    title: 'Workplace Reasonable Accommodations Defender',
    unlockedAvatars: ['poochy'],
    perkDescription: 'Guarantees barrier-free workplaces and Magna Carta for PWDs (R.A. 7277) rights',
  },
  {
    level: 58,
    xpRequired: 106400,
    title: 'Anti-Retaliation & Whistleblower Shield',
    unlockedAvatars: ['chainchomp'],
    perkDescription: 'Enforces injunctions against employer discrimination and whistleblower retaliation',
  },
  {
    level: 59,
    xpRequired: 111400,
    title: 'Hazardous Explosives Safety Specialist',
    unlockedAvatars: ['bobomb'],
    perkDescription: 'Expert oversight on DOLE hazardous industry certifications and fast dispute conciliation',
  },
  {
    level: 60,
    xpRequired: 117000,
    title: 'Restaurant Tipping & Service Charge Grand Authority',
    unlockedAvatars: ['chefkinopio'],
    perkDescription: 'Enforces 100% equal distribution of hotel and restaurant service charges under R.A. 11360',
  },
  {
    level: 61,
    xpRequired: 120500,
    title: 'Equal Pay & Magna Carta Defender',
    unlockedAvatars: ['dixiekong'],
    perkDescription: 'Champions gender pay equity, childcare accommodations, and women empowerment under R.A. 9710',
  },
  {
    level: 62,
    xpRequired: 124100,
    title: 'Child Labor Prohibition & Working Youth Protector',
    unlockedAvatars: ['tinykong'],
    perkDescription: 'Protects child workers under R.A. 9231, regulates apprentice contracts, and enforces workplace youth safety',
  },
  {
    level: 63,
    xpRequired: 127800,
    title: 'Stevedoring & Heavy Equipment Safety Warden',
    unlockedAvatars: ['chunkykong'],
    perkDescription: 'Commands dock, warehouse, and crane safety standards, preventing workplace crush injuries with strict OSH enforcement',
  },
  {
    level: 64,
    xpRequired: 131600,
    title: 'Night Shift Differential Celestial Sentinel',
    unlockedAvatars: ['luma'],
    perkDescription: 'Guarantees 10% premium pay for all statutory work performed between 10:00 PM and 6:00 AM under Article 86',
  },
  {
    level: 65,
    xpRequired: 135500,
    title: 'POEA / DMW Standard Employment Contract Dean',
    unlockedAvatars: ['lubba'],
    perkDescription: 'Master of spacefaring vessel safety, seafarers disability grading, and overseas employment standard welfare protections',
  },
  {
    level: 66,
    xpRequired: 139500,
    title: 'Sole & Exclusive Bargaining Agent Representative',
    unlockedAvatars: ['cappy'],
    perkDescription: 'Facilitates union registration, certification elections, and collective bargaining agreements',
  },
  {
    level: 67,
    xpRequired: 143600,
    title: 'National Tripartite Industrial Peace Council Envoy',
    unlockedAvatars: ['tiara'],
    perkDescription: 'Promotes social dialogue between labor, management, and government to maintain industrial peace',
  },
  {
    level: 68,
    xpRequired: 147800,
    title: 'Aviation & Aerial Delivery OSH Officer',
    unlockedAvatars: ['flyguy'],
    perkDescription: 'Enforces flight crew flight time limitations and aerial transport labor regulations',
  },
  {
    level: 69,
    xpRequired: 152100,
    title: 'Statutory Minimum Wage & 13th Month Pay Advocate',
    unlockedAvatars: ['goomba'],
    perkDescription: 'Ensures zero unlawful wage deductions, prompt pay disbursement, and universal P.D. 851 compliance',
  },
  {
    level: 70,
    xpRequired: 156500,
    title: 'Gig Economy Delivery Rider Rights Champion',
    unlockedAvatars: ['paragoomba'],
    perkDescription: 'Upholds fair platform contracts, insurance coverage, and occupational protections for app riders',
  },
  {
    level: 71,
    xpRequired: 161000,
    title: 'Rapid Response DOLE Inspector',
    unlockedAvatars: ['paratroopa'],
    perkDescription: 'Executes swift spot inspections on hazardous construction sites and high-rise maintenance',
  },
  {
    level: 72,
    xpRequired: 165600,
    title: 'Mine Safety & Ceiling Cave-in Prevention Specialist',
    unlockedAvatars: ['buzzybeetle'],
    perkDescription: 'Ensures structural ventilation, gas detectors, and hardhat compliance in underground works',
  },
  {
    level: 73,
    xpRequired: 170300,
    title: 'Industrial Equipment Point-of-Operation Guard',
    unlockedAvatars: ['spiny'],
    perkDescription: 'Enforces physical safety shields, emergency shutoff switches, and mechanical hazard warnings',
  },
  {
    level: 74,
    xpRequired: 175100,
    title: 'Commercial Fishing Vessel Labor Standards Officer',
    unlockedAvatars: ['cheepcheep'],
    perkDescription: 'Ensures seaworthy living quarters, statutory food rations, and medical chests on all offshore fishing craft',
  },
  {
    level: 75,
    xpRequired: 180000,
    title: 'Plantation & Extreme Weather Workplace Protector',
    unlockedAvatars: ['pokey'],
    perkDescription: 'Oversees shaded rest breaks, hydration mandates, and heat stroke prevention in agribusiness',
  },
  {
    level: 76,
    xpRequired: 185000,
    title: 'Anti-Crush Interlock & Lockout/Tagout Authority',
    unlockedAvatars: ['thwomp'],
    perkDescription: 'Mandates dual-hand trigger controls and lockout-tagout procedures on heavy stamping machinery',
  },
  {
    level: 77,
    xpRequired: 190100,
    title: 'Civil Works & Scaffolding Fall-Arrest Sentinel',
    unlockedAvatars: ['whomp'],
    perkDescription: 'Verifies scaffolding load capacities, toe boards, safety netting, and full-body harness anchorage points',
  },
  {
    level: 78,
    xpRequired: 195300,
    title: 'High-Hazard Explosives & Fireworks Regulatory Chief',
    unlockedAvatars: ['kingbobomb'],
    perkDescription: 'Enforces strict safety distances, static grounding, and hazardous blast containment protocols in explosive plants',
  },
  {
    level: 79,
    xpRequired: 200600,
    title: 'Anti-Cabo & Labor-Only Contracting Abolitionist',
    unlockedAvatars: ['wart'],
    perkDescription: 'Prosecutes sham subcontractors, cabo intermediaries, and fly-by-night labor supply agencies',
  },
  {
    level: 80,
    xpRequired: 206000,
    title: 'Overseas Migrant Workers Act Supreme Dean',
    unlockedAvatars: ['tatanga'],
    perkDescription: 'Supreme protector of overseas Filipinos, enforcing joint and solidary liability against errant recruitment agencies under R.A. 8042 & 10022',
  },
  {
    level: 81,
    xpRequired: 211500,
    title: 'Hazardous Chemicals & High-Risk Works Inspector',
    unlockedAvatars: ['mouser'],
    perkDescription: 'Enforces strict OSH ventilation, static grounding, and hazardous storage blast shields',
  },
  {
    level: 82,
    xpRequired: 217100,
    title: 'Hours of Work & Compulsory Weekly Rest Warden',
    unlockedAvatars: ['boomboom'],
    perkDescription: 'Guarantees no employee is subjected to unbroken 7-day labor without statutory rest day premiums',
  },
  {
    level: 83,
    xpRequired: 222800,
    title: '100% Service Charge & Equal Distribution Commissioner',
    unlockedAvatars: ['pompom'],
    perkDescription: 'Monitors full 100% distribution of service charges under R.A. 11360 without management cuts',
  },
  {
    level: 84,
    xpRequired: 228600,
    title: 'Stare Decisis & Landmark SC Precedent Jurist',
    unlockedAvatars: ['rex'],
    perkDescription: 'Anchors legal reasoning in bedrock Supreme Court jurisprudence and constitutional social justice',
  },
  {
    level: 85,
    xpRequired: 234500,
    title: 'Construction Safety & Mandatory PPE Chief Inspector',
    unlockedAvatars: ['charginchuck'],
    perkDescription: 'Mandates zero compromises on heavy machinery safety and occupational health compliance under R.A. 11058',
  },
  {
    level: 86,
    xpRequired: 240500,
    title: 'Dual-Training System & Skills Development Officer',
    unlockedAvatars: ['koopakid'],
    perkDescription: 'Monitors DOLE apprenticeship agreements and guarantees the 75% wage floor',
  },
  {
    level: 87,
    xpRequired: 246600,
    title: 'Supreme Magister of Statutory Construction',
    unlockedAvatars: ['kamekclone'],
    perkDescription: 'Resolves all doubts in labor contracts strictly in favor of the safety and rights of the working class',
  },
  {
    level: 88,
    xpRequired: 252800,
    title: 'Severe Misconduct & Fraud Inquisitor General',
    unlockedAvatars: ['drybowserblue'],
    perkDescription: 'Incinerates bad faith wage theft, forged payroll records, and sham dismissals',
  },
  {
    level: 89,
    xpRequired: 259100,
    title: 'Labor Code Article 83-84 Worksite Specialist',
    unlockedAvatars: ['foremanspike'],
    perkDescription: 'Audits compressed work weeks, waiting time, and portal-to-portal travel compensation',
  },
  {
    level: 90,
    xpRequired: 265500,
    title: 'Codal Statesman Emeritus & P.D. 442 Historian',
    unlockedAvatars: ['toadsworth'],
    perkDescription: 'Master of complete Philippine labor standards codification, statutory history, and judicial review',
  },
  {
    level: 91,
    xpRequired: 272000,
    title: 'Rogueport Archaic Jurisprudence Dean',
    unlockedAvatars: ['professorfrankly'],
    perkDescription: 'Archaeological excavation of foundational statutory roots and constitutional labor rights',
  },
  {
    level: 92,
    xpRequired: 278600,
    title: 'Glitzville Heavyweight Arbitration Champion',
    unlockedAvatars: ['rawkhawk'],
    perkDescription: 'Unrelenting arena advocacy in high-stakes compulsory arbitration and union dispute resolution',
  },
  {
    level: 93,
    xpRequired: 285300,
    title: 'Workplace Inclusivity & Anti-Harassment Advocate',
    unlockedAvatars: ['vivian'],
    perkDescription: 'Fierce enforcement of the Safe Spaces Act (R.A. 11313) and workplace gender equity safeguards',
  },
  {
    level: 94,
    xpRequired: 292100,
    title: 'University of Goom Statutory Tattle Scholar',
    unlockedAvatars: ['goombella'],
    perkDescription: 'Instant tactical field digests and citation lookups for every Philippine labor standard',
  },
  {
    level: 95,
    xpRequired: 299000,
    title: 'Petal Meadows OSH Helmet & Hard-Shell Protector',
    unlockedAvatars: ['kooper'],
    perkDescription: 'Zero-compromise enforcement of structural PPE, safety harnesses, and industrial guards',
  },
  {
    level: 96,
    xpRequired: 306000,
    title: 'Boo Mansion Evidentiary Invisibility Mistress',
    unlockedAvatars: ['ladybow'],
    perkDescription: 'Penetrates corporate veils and exposes hidden alter-ego subcontracting schemes',
  },
  {
    level: 97,
    xpRequired: 313100,
    title: 'Dimensional Procedural Warp Specialist',
    unlockedAvatars: ['dimentio'],
    perkDescription: 'Navigates multi-jurisdictional appellate mazes from NLRC to the Court of Appeals',
  },
  {
    level: 98,
    xpRequired: 320300,
    title: 'Dark Prognosticus Void-Contract Annuler',
    unlockedAvatars: ['countbleck'],
    perkDescription: 'Strikes down unconscionable yellow-dog contracts, waivers, and quitclaims as null and void',
  },
  {
    level: 99,
    xpRequired: 327600,
    title: 'Star Road Celestial Justice Envoy',
    unlockedAvatars: ['geno'],
    perkDescription: 'Cosmic alignment of constitutional social justice and humanitarian worker safeguards',
  },
  {
    level: 100,
    xpRequired: 335000,
    title: 'Nimbus Cloud Rainfall Relief Dean',
    unlockedAvatars: ['mallow'],
    perkDescription: 'Guarantees disaster-relief emergency leaves and extreme weather work suspension safety',
  },
  {
    level: 101,
    xpRequired: 342500,
    title: 'Beanbean Fury Wage Compliance Chancellor',
    unlockedAvatars: ['fawful'],
    perkDescription: 'Zero tolerance for substandard wages, unpaid differentials, or delayed payroll releases',
  },
  {
    level: 102,
    xpRequired: 350100,
    title: 'Castle Defense Industrial Peace Fortress',
    unlockedAvatars: ['midbus'],
    perkDescription: 'Unmovable anchor ensuring picket-line peaceful coexistence and lawful strike decorum',
  },
  {
    level: 103,
    xpRequired: 357800,
    title: 'Wicked Wage Distortion Remediation Chancellor',
    unlockedAvatars: ['cackletta'],
    perkDescription: 'Eliminates structural wage distortions following regional minimum wage orders',
  },
  {
    level: 104,
    xpRequired: 365600,
    title: 'Mushroom Kingdom High Advisory Star',
    unlockedAvatars: ['starlow'],
    perkDescription: 'Divine guidance across the entire Labor Code of the Philippines and DOLE Department Orders',
  },
  {
    level: 105,
    xpRequired: 373500,
    title: 'Super Crown Supreme Sovereign of Labor Rights',
    unlockedAvatars: ['peachette'],
    perkDescription: 'Royal coronation embodying total mastery across all 105 Mushroom Kingdom Labor Scholars',
  },
];

export const LEVEL_PROGRESSION_STORAGE_KEY = 'mario_level_progression_v2';

export interface UserProgressionState {
  totalXp: number;
  level: number;
  lastAwardedReason?: string;
  lastAwardedXp?: number;
  unlockedAvatars: MarioAvatar[];
  newlyUnlockedAvatars?: MarioAvatar[];
}

export interface ProgressionStats {
  level: number;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpInCurrentLevel: number;
  xpRequiredForCurrentLevel: number;
  progressPercent: number;
  title: string;
  perkDescription: string;
  unlockedAvatars: MarioAvatar[];
  nextUnlockPreview: {
    level: number;
    title: string;
    avatars: MarioAvatar[];
  } | null;
}

/**
 * Resolves player level and unlocked avatars based on total XP
 */
export function getProgressionForXp(totalXp: number): ProgressionStats {
  const safeXp = Math.max(0, Math.round(totalXp || 0));
  
  let currentThreshold = LEVEL_THRESHOLDS[0];
  let nextThreshold: LevelThreshold | null = LEVEL_THRESHOLDS[1] || null;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXp >= LEVEL_THRESHOLDS[i].xpRequired) {
      currentThreshold = LEVEL_THRESHOLDS[i];
      nextThreshold = LEVEL_THRESHOLDS[i + 1] || null;
      break;
    }
  }

  // Aggregate all unlocked avatars up to current level
  const unlockedSet = new Set<MarioAvatar>();
  for (const t of LEVEL_THRESHOLDS) {
    if (t.level <= currentThreshold.level) {
      t.unlockedAvatars.forEach((a) => unlockedSet.add(a));
    }
  }

  const currentLevelXp = currentThreshold.xpRequired;
  const nextLevelXp = nextThreshold ? nextThreshold.xpRequired : currentLevelXp + 5000;
  const xpRequiredForCurrentLevel = Math.max(1, nextLevelXp - currentLevelXp);
  const xpInCurrentLevel = Math.min(xpRequiredForCurrentLevel, safeXp - currentLevelXp);
  const progressPercent = nextThreshold
    ? Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpRequiredForCurrentLevel) * 100)))
    : 100;

  return {
    level: currentThreshold.level,
    totalXp: safeXp,
    currentLevelXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpRequiredForCurrentLevel,
    progressPercent,
    title: currentThreshold.title,
    perkDescription: currentThreshold.perkDescription,
    unlockedAvatars: Array.from(unlockedSet),
    nextUnlockPreview: nextThreshold
      ? {
          level: nextThreshold.level,
          title: nextThreshold.title,
          avatars: [...nextThreshold.unlockedAvatars],
        }
      : null,
  };
}

/**
 * Checks if an avatar is unlocked at a given player level
 */
export function isAvatarUnlockedByLevel(avatar: MarioAvatar, currentLevel: number): boolean {
  for (const t of LEVEL_THRESHOLDS) {
    if (t.level <= currentLevel && t.unlockedAvatars.includes(avatar)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns the minimum required level to unlock an avatar
 */
export function getRequiredLevelForAvatar(avatar: MarioAvatar): number {
  for (const t of LEVEL_THRESHOLDS) {
    if (t.unlockedAvatars.includes(avatar)) {
      return t.level;
    }
  }
  return 1;
}


/**
 * Computes XP earned from quiz results
 */
export function calculateQuizXp(params: {
  correctCount: number;
  totalCount: number;
  isBossOrExam?: boolean;
  streakCount?: number;
}): number {
  const { correctCount, totalCount, isBossOrExam, streakCount = 0 } = params;
  if (totalCount <= 0 || correctCount <= 0) return 10; // Effort XP

  // Base: 30 XP per correct answer
  let xp = correctCount * 30;

  // Perfect run bonus
  if (correctCount === totalCount) {
    xp += 100;
  }

  // Streak bonus: +5 XP per consecutive streak point (max 50)
  xp += Math.min(50, streakCount * 5);

  // Boss / Final Exam multiplier
  if (isBossOrExam) {
    xp = Math.round(xp * 1.5);
  }

  return Math.max(15, xp);
}

/**
 * Computes XP earned from active study time
 * 1 XP per 15 seconds studied (4 XP per minute)
 */
export function calculateStudyTimeXp(studiedSeconds: number): number {
  if (studiedSeconds <= 0) return 0;
  return Math.floor(studiedSeconds / 15);
}

/**
 * Loads user progression from localStorage
 */
export function loadUserProgression(storage?: { getItem: (k: string) => string | null }): UserProgressionState {
  const store = storage || (typeof window !== 'undefined' ? window.localStorage : null);
  if (!store) {
    const defaultStats = getProgressionForXp(0);
    return {
      totalXp: 0,
      level: 1,
      unlockedAvatars: defaultStats.unlockedAvatars,
    };
  }

  try {
    const raw = store.getItem(LEVEL_PROGRESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const totalXp = Number(parsed.totalXp) || 0;
      const stats = getProgressionForXp(totalXp);
      return {
        totalXp,
        level: stats.level,
        lastAwardedReason: parsed.lastAwardedReason,
        lastAwardedXp: parsed.lastAwardedXp,
        unlockedAvatars: stats.unlockedAvatars,
      };
    }
  } catch {
    // fallback
  }

  const initialStats = getProgressionForXp(0);
  return {
    totalXp: 0,
    level: 1,
    unlockedAvatars: initialStats.unlockedAvatars,
  };
}

/**
 * Awards XP and saves to localStorage. Returns level-up event info if leveled up.
 */
export function awardUserXp(params: {
  amount: number;
  reason: string;
  storage?: { getItem: (k: string) => string | null; setItem: (k: string, v: string) => void };
}): {
  previousLevel: number;
  newLevel: number;
  didLevelUp: boolean;
  totalXp: number;
  xpAwarded: number;
  newlyUnlockedAvatars: MarioAvatar[];
  newTitle: string;
  updatedState: UserProgressionState;
} {
  const store = params.storage || (typeof window !== 'undefined' ? window.localStorage : null);
  const current = loadUserProgression(store || undefined);

  const safeAdd = Math.max(1, Math.round(params.amount));
  const newTotalXp = current.totalXp + safeAdd;

  const oldStats = getProgressionForXp(current.totalXp);
  const newStats = getProgressionForXp(newTotalXp);

  const didLevelUp = newStats.level > oldStats.level;
  
  // Find newly unlocked avatars
  const newlyUnlocked: MarioAvatar[] = [];
  if (didLevelUp) {
    const oldSet = new Set(oldStats.unlockedAvatars);
    for (const a of newStats.unlockedAvatars) {
      if (!oldSet.has(a)) {
        newlyUnlocked.push(a);
      }
    }
  }

  const nextState: UserProgressionState = {
    totalXp: newTotalXp,
    level: newStats.level,
    lastAwardedReason: params.reason,
    lastAwardedXp: safeAdd,
    unlockedAvatars: newStats.unlockedAvatars,
    newlyUnlockedAvatars: newlyUnlocked,
  };

  if (store) {
    try {
      store.setItem(LEVEL_PROGRESSION_STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // ignore quota errors
    }
  }

  return {
    previousLevel: oldStats.level,
    newLevel: newStats.level,
    didLevelUp,
    totalXp: newTotalXp,
    xpAwarded: safeAdd,
    newlyUnlockedAvatars: newlyUnlocked,
    newTitle: newStats.title,
    updatedState: nextState,
  };
}

/**
 * Resets user progression to Level 1 with 0 XP
 */
export function resetUserProgression(storage?: {
  removeItem?: (k: string) => void;
  setItem?: (k: string, v: string) => void;
}): UserProgressionState {
  const store = storage || (typeof window !== 'undefined' ? window.localStorage : null);
  const initial = getProgressionForXp(0);
  const resetState: UserProgressionState = {
    totalXp: 0,
    level: 1,
    unlockedAvatars: initial.unlockedAvatars,
  };
  if (store && store.setItem) {
    try {
      store.setItem(LEVEL_PROGRESSION_STORAGE_KEY, JSON.stringify(resetState));
    } catch {
      // ignore
    }
  }
  return resetState;
}

