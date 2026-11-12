import React, { useState, useCallback, useEffect } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
  MarioMushroomIcon,
  MarioFlagIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { drawUniqueFromDeck, shuffleChoiceOptions } from '../utils/gameQuestionDeck';
import { QuizCompletionPayload } from '../utils/profileAchievements';
import { MasterArcadeScenario } from './MasterVaultGames';
import {
  Compass,
  Sun,
  ShieldAlert,
  Music,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Heart,
  Play,
  ArrowRight,
  AlertTriangle,
  Pickaxe,
  Flag,
  Skull,
  Flame,
  Lock,
  Unlock,
  Zap,
  Gauge,
  Sparkles,
  Trophy,
  Clock,
  ShieldCheck,
  X,
} from 'lucide-react';
import { awardUserXp } from '../utils/levelProgressionService';
import { ArcadeDoctrineCard } from './ArcadeDoctrineCard';

export interface RoyalVaultGameProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins?: (amount: number) => void;
  onQuizCompleted?: (payload: QuizCompletionPayload) => void;
}

export const CAPTAIN_TOAD_MINECART_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'ct1',
    worldCode: 'w4',
    headline: 'Kasambahay Minimum Rest Period',
    prompt: 'Under R.A. 10361 (Batas Kasambahay), what is the mandatory daily aggregate rest period for a domestic worker?',
    options: [
      'At least 8 hours per day',
      'At least 6 hours per day',
      'At least 10 hours per day',
      'At least 12 hours per day',
    ],
    correctIndex: 0,
    statute: 'Sec. 20, R.A. 10361',
    explanation: 'Every domestic worker is entitled to an aggregate daily rest period of at least eight (8) hours per day, plus at least 24 consecutive hours of weekly rest.',
  },
  {
    id: 'ct2',
    worldCode: 'w4',
    headline: 'Kasambahay 5-Day Service Incentive Leave',
    prompt: 'After rendering 1 year of service, is a Kasambahay’s unused 5-day Service Incentive Leave (SIL) convertible to cash?',
    options: [
      'No — Kasambahay SIL is non-cumulative and strictly non-convertible to cash under Sec. 29',
      'Yes — Kasambahay SIL is convertible to cash on December 24 together with 13th month pay',
      'Yes — Kasambahay SIL accumulates indefinitely up to a statutory ceiling of fifteen (15) days',
      'Kasambahays enjoy no statutory incentive leave entitlement under Republic Act No. 10361'
    ],
    correctIndex: 0,
    statute: 'Sec. 29, R.A. 10361',
    explanation: 'Unlike ordinary Book III workers whose unused SIL is commutable to cash, a Kasambahay’s 5-day SIL shall not be accumulated nor carried over and is not convertible to cash.',
  },
  {
    id: 'ct3',
    worldCode: 'w4',
    headline: 'Child Labor Below 15 Years Old',
    prompt: 'Under R.A. 9231, what is the maximum work schedule allowed for a child below 15 years old working under a valid DOLE permit in public entertainment?',
    options: [
      'Not more than 4 hours/day and 20 hours/week; strictly no work between 8:00 PM and 6:00 AM',
      'Not more than 8 hours/day and 40 hours/week; strictly no work between 10:00 PM and 6:00 AM',
      'Not more than 6 hours/day and 30 hours/week; strictly no work between 9:00 PM and 5:00 AM',
      'Unlimited hours permitted provided the child is accompanied on set by a biological parent'
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 9231',
    explanation: 'A child below 15 may work max 4 hours/day and max 20 hours/week, and never between 8:00 PM and 6:00 AM.',
  },
  {
    id: 'ct4',
    worldCode: 'w4',
    headline: 'PWD Tax Incentive vs Wage Rate',
    prompt: 'Under R.A. 7277 (Magna Carta for Persons with Disability), how much minimum wage must a qualified PWD employee receive compared to an able-bodied worker?',
    options: [
      '100% of the applicable statutory minimum wage under the Equal Opportunity principle',
      '75% of the applicable minimum wage matching the statutory learner and apprentice rate',
      '80% of the applicable minimum wage under specialized vocational rehabilitation rules',
      '50% of the applicable minimum wage with the remaining half directly subsidized by DSWD'
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 7277',
    explanation: 'A qualified disabled employee shall be subject to the same terms and conditions of employment and the same 100% compensation, privileges, and benefits as a qualified able-bodied person.',
  },
  {
    id: 'ct5',
    worldCode: 'w4',
    headline: 'Telecommuting Parity Principle',
    prompt: 'Under R.A. 11165 (Telecommuting Act), are work-from-home employees entitled to Overtime Pay and Night Shift Differential?',
    options: [
      'Yes — under Fair Treatment standard, telecommuters enjoy full statutory OT and NSD parity',
      'No — telecommuters are classified as field personnel excluded from Title I under Art. 82',
      'Only if their registered home office address is located within five kilometers of headquarters',
      'Entitled only to statutory Overtime pay and strictly excluded from Night Shift Differential'
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 11165 & D.O. 237-22',
    explanation: 'Telecommuting employees are not field personnel; their hours are verifiable via digital logs and they receive full parity in OT, NSD, and holiday pay.',
  },
  {
    id: 'ct6',
    worldCode: 'w4',
    headline: 'Apprenticeship vs Learnership Duration',
    prompt: 'What is the maximum statutory duration of a Learnership agreement compared to a standard Apprenticeship?',
    options: [
      'Learnership: max 3 months; Apprenticeship: more than 3 months (typically up to 6 months)',
      'Learnership: max 12 months; Apprenticeship: up to 24 months for all technical engineering lines',
      'Both training arrangements are capped at a strict uniform statutory duration of sixty (60) days',
      'Learnership: max 6 months; Apprenticeship: max 3 months for semi-skilled industrial trades'
    ],
    correctIndex: 0,
    statute: 'Arts. 58 & 75, Labor Code',
    explanation: 'Learnership covers semi-skilled non-apprenticeable occupations for not more than 3 months (75% min wage), with mandatory regularization commitment if retained.',
  },
  {
    id: 'ct7',
    worldCode: 'w4',
    headline: 'Youth Employment (15–17 Years Old) Schedule Cap',
    prompt: 'Under R.A. 9231, what is the statutory maximum working schedule and nighttime window for adolescents aged 15 to below 18 years old?',
    options: [
      'Not more than 8 hours/day and 40 hours/week; prohibited from working between 10:00 PM and 6:00 AM',
      'Not more than 6 hours/day and 30 hours/week; prohibited from working between 8:00 PM and 6:00 AM',
      'Standard 48 hours/week with zero nighttime restrictions if paid applicable night differential',
      'Maximum 4 hours/day and 20 hours/week matching the statutory ceiling for children below 15'
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 9231',
    explanation: 'Youth aged 15 to below 18 may work not more than 8 hours/day and 40 hours/week, and are strictly prohibited from working between 10:00 PM and 6:00 AM, in non-hazardous work only.',
  },
  {
    id: 'ct8',
    worldCode: 'w4',
    headline: 'Night Worker Mandatory Health Assessment',
    prompt: 'Under R.A. 10151 (Nightworkers Act), when is an employer required to provide night workers with a free health assessment without cost?',
    options: [
      'Before taking up assignment as a night worker and at regular intervals during employment',
      'Only after the employee files a formal social security medical claim for chronic sickness',
      'Only if formally requested in writing by the certified collective bargaining representative',
      'Only once during pre-employment medical examinations and never required during assignment'
    ],
    correctIndex: 0,
    statute: 'Art. 156 [154], Labor Code (R.A. 10151)',
    explanation: 'At their request, workers have the right to undergo a free health assessment without charge prior to assignment and at regular intervals to verify fitness for night work.',
  },
  {
    id: 'ct9',
    worldCode: 'w4',
    headline: 'Kasambahay Mandatory SSS, PhilHealth & Pag-IBIG',
    prompt: 'Under R.A. 10361, who pays the SSS, PhilHealth, and Pag-IBIG monthly contributions of a Kasambahay receiving less than PHP 5,000 per month?',
    options: [
      'The employer shoulders 100% of all contributions without any salary deduction from wage',
      'Split fifty-fifty between Kasambahay and household employer under standard SSS schedules',
      'Subsidized one hundred percent by the local barangay government through social funds',
      'Kasambahays receiving under five thousand pesos are completely exempt from SSS coverage'
    ],
    correctIndex: 0,
    statute: 'Sec. 30, R.A. 10361',
    explanation: 'If a Kasambahay receives less than PHP 5,000/month, the employer must pay 100% of SSS, PhilHealth, and Pag-IBIG contributions with zero deduction from the worker’s wage.',
  },
  {
    id: 'ct10',
    worldCode: 'w4',
    headline: 'Women Night Work Repeal by R.A. 10151',
    prompt: 'Did R.A. 10151 retain the old blanket prohibition against women working at night in industrial and commercial undertakings?',
    options: [
      'No — R.A. 10151 repealed the blanket ban; women can work night shifts with proper safeguards',
      'Yes — women remain completely barred from night work in commercial and industrial trades',
      'Only women who secure a written notarized marital consent waiver may work graveyard hours',
      'Night work is prohibited only for unmarried female employees residing outside city limits'
    ],
    correctIndex: 0,
    statute: 'R.A. 10151 (repealing Arts. 130–131)',
    explanation: 'R.A. 10151 repealed the discriminatory blanket prohibition against night work for women, replacing it with universal health, safety, transport, and maternity protections for all nightworkers.',
  },
  {
    id: 'ct11',
    worldCode: 'w4',
    headline: 'Learnership Mandatory Regularization Ratio',
    prompt: 'Under Art. 75 of the Labor Code, what hiring obligation rests upon an employer who trains learners upon completion of the 3-month program?',
    options: [
      'Obligation to hire at least 50% of the learners as regular employees upon completion',
      'No obligation to hire any learners, as learnerships are strictly vocational training programs',
      'Obligation to hire 100% of all enrolled learners or face immediate revocation of business license',
      'Obligation to renew the learnership contract for another six months at seventy-five percent wage'
    ],
    correctIndex: 0,
    statute: 'Art. 75(c), Labor Code',
    explanation: 'Learnership agreements must include a commitment to employ the learners if they so desire, as regular employees upon completion of learnership, with at least 50% retained.',
  },
  {
    id: 'ct12',
    worldCode: 'w4',
    headline: 'Industrial Homeworker Subcontractor Liability',
    prompt: 'Under D.O. No. 05 (Series of 1992), if a subcontractor fails to pay wages to homeworkers, what is the statutory liability of the principal employer?',
    options: [
      'Solidarily liable with the subcontractor for payment of wages to the industrial homeworkers',
      'Subsidiarily liable only up to twenty-five percent of the unpaid wages claimed by homeworkers',
      'Zero legal liability because industrial homework represents an independent civil contractor setup',
      'Liable only for administrative regulatory fines, without obligation for unpaid wage claims',
    ],
    correctIndex: 0,
    statute: 'Book III, Rule XIV Sec. 7 & Art. 106',
    explanation: 'The employer is solidarily liable with the contractor/subcontractor for any unpaid wage claims of homeworkers.',
  },
  {
    id: 'ct13',
    worldCode: 'w4',
    headline: 'Apprentice Minimum Wage Rate (Art. 61)',
    prompt: 'Under Article 61 of the Labor Code, what is the minimum wage rate payable to an apprentice in an approved enterprise apprenticeship program?',
    options: [
      'At least seventy-five percent (75%) of the applicable statutory minimum wage',
      'At least fifty percent (50%) of the regional minimum wage with free lodging',
      'One hundred percent (100%) of the statutory minimum wage from the first day',
      'Apprentices may be engaged with zero wage compensation during the training period',
    ],
    correctIndex: 0,
    statute: 'Art. 61, Labor Code; D.O. 68-04',
    explanation: 'Article 61 provides that apprentice wage rates shall start at not less than 75% of the statutory minimum wage rate.',
  },
  {
    id: 'ct14',
    worldCode: 'w4',
    headline: 'Learnership Wage Rate and Max Duration (Art. 75)',
    prompt: 'Under Article 75, what is the minimum wage rate and maximum permissible duration of a learnership agreement in semi-skilled occupations?',
    options: [
      'At least 75% of minimum wage, with a maximum learnership duration of three (3) months',
      'At least 50% of minimum wage, with a maximum learnership duration of six (6) months',
      'At least 80% of minimum wage, with a maximum duration of twelve (12) months',
      'Full 100% minimum wage, with a learnership term not exceeding thirty (30) days',
    ],
    correctIndex: 0,
    statute: 'Art. 75, Labor Code',
    explanation: 'Article 75 provides that learnerships shall not exceed 3 months in semi-skilled occupations, with wages starting at not less than 75% of the statutory minimum wage.',
  },
  {
    id: 'ct15',
    worldCode: 'w4',
    headline: 'PWD Wage Non-Discrimination (R.A. 10524 / R.A. 7277)',
    prompt: 'Under the Magna Carta for Persons with Disability (R.A. 7277, as amended), what wage is a qualified PWD employee entitled to receive?',
    options: [
      '100% of the statutory minimum wage, with identical terms and benefits as an able-bodied worker',
      'Seventy-five percent (75%) of the minimum wage based on an approved special learner rate',
      'Fifty percent (50%) of the minimum wage subsidized by government social welfare funds',
      'Eighty percent (80%) of the standard wage until completing two years of service',
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 7277 (as amended by R.A. 10524)',
    explanation: 'R.A. 10524 explicitly guarantees that qualified persons with disability shall receive the full statutory minimum wage (100%) and all standard statutory employment benefits.',
  },
  {
    id: 'ct16',
    worldCode: 'w4',
    headline: 'General Minimum Employable Age (R.A. 9231)',
    prompt: 'Under Republic Act No. 9231, what is the general statutory minimum employable age in the Philippines?',
    options: [
      'Fifteen (15) years of age, subject to child protection conditions and parent supervision',
      'Sixteen (16) years of age for all commercial and industrial factory operations',
      'Eighteen (18) years of age across all types of employment without exception',
      'Fourteen (14) years of age provided the child is enrolled in secondary night school',
    ],
    correctIndex: 0,
    statute: 'Sec. 2, R.A. 9231; Art. 138, Labor Code',
    explanation: 'Children below 15 years of age shall not be employed, except when under the sole responsibility of parents where only family members are employed, or in public entertainment.',
  },
  {
    id: 'ct17',
    worldCode: 'w4',
    headline: 'Night Work Prohibition for Minors 15 to 17 (R.A. 9231)',
    prompt: 'Under R.A. 9231, during what nighttime interval are working minors between 15 and 17 years old prohibited from working?',
    options: [
      'Between 10:00 PM and 6:00 AM of the following day',
      'Between 8:00 PM and 4:00 AM of the following day',
      'Between 12:00 Midnight and 8:00 AM of the following day',
      'Minors between 15 and 17 have zero nighttime work restrictions under Philippine law',
    ],
    correctIndex: 0,
    statute: 'Sec. 6, R.A. 9231',
    explanation: 'R.A. 9231 prohibits any child between 15 and 17 years of age from working between 10:00 PM and 6:00 AM the following day.',
  },
  {
    id: 'ct18',
    worldCode: 'w4',
    headline: 'Maximum Work Hours for Children Below 15',
    prompt: 'For children below 15 years old working under exceptional DOLE permits (e.g., child actors), what are the maximum permissible working hours?',
    options: [
      'Not more than four (4) hours a day and not more than twenty (20) hours a week',
      'Not more than six (6) hours a day and not more than thirty (30) hours a week',
      'Not more than eight (8) hours a day matching regular adult statutory shifts',
      'Not more than two (2) hours a day and strictly on weekend mornings only',
    ],
    correctIndex: 0,
    statute: 'Sec. 6, R.A. 9231',
    explanation: 'A child below 15 years of age may be allowed to work for not more than 4 hours in any given day and not more than 20 hours a week, and never between 8:00 PM and 6:00 AM.',
  },
  {
    id: 'ct19',
    worldCode: 'w4',
    headline: 'Work Hours for Youths Aged 15 to Below 18',
    prompt: 'Under R.A. 9231, what are the maximum permissible daily and weekly working hours for youth employees aged 15 to 17?',
    options: [
      'Not more than eight (8) hours a day and not more than forty (40) hours a week',
      'Not more than six (6) hours a day and not more than thirty (30) hours a week',
      'Up to twelve (12) hours a day provided they receive one hundred fifty percent pay',
      'Not more than five (5) hours a day during school days and eight hours on weekends',
    ],
    correctIndex: 0,
    statute: 'Sec. 6, R.A. 9231',
    explanation: 'Children 15 to below 18 years old shall not be allowed to work for more than 8 hours in any given day, nor more than 40 hours a week, and never in hazardous undertakings.',
  },
  {
    id: 'ct20',
    worldCode: 'w4',
    headline: 'Kasambahay 13th Month Pay Mandate (R.A. 10361)',
    prompt: 'Is a domestic worker (Kasambahay) entitled to mandatory 13th Month Pay under Republic Act No. 10361?',
    options: [
      'Yes — mandatory for all domestic workers who rendered at least 1 month of service, due by Dec 24',
      'No — domestic workers are excluded from 13th month pay under Presidential Decree No. 851',
      'Only if the domestic worker is employed in Metro Manila earning above five thousand pesos',
      'Thirteenth month pay is purely optional and discretionary for household employers',
    ],
    correctIndex: 0,
    statute: 'Sec. 25, R.A. 10361 (Batas Kasambahay)',
    explanation: 'Section 25 of Batas Kasambahay explicitly mandates that a domestic worker is entitled to a 13th month pay as provided for by law, due on or before December 24.',
  },
  {
    id: 'ct21',
    worldCode: 'w4',
    headline: 'Kasambahay Daily Rest Period (R.A. 10361)',
    prompt: 'Under Batas Kasambahay, what is the mandatory minimum aggregate daily rest period that an employer must provide to a domestic worker?',
    options: [
      'At least eight (8) hours of rest per day',
      'At least six (6) hours of rest per day',
      'At least ten (10) hours of continuous rest per day',
      'At least four (4) hours of daytime rest with unlimited night on-call duty',
    ],
    correctIndex: 0,
    statute: 'Sec. 20, R.A. 10361',
    explanation: 'The domestic worker shall be entitled to an aggregate daily rest period of eight (8) hours per day under Section 20 of R.A. 10361.',
  },
  {
    id: 'ct22',
    worldCode: 'w4',
    headline: 'Kasambahay Weekly Rest Day (R.A. 10361)',
    prompt: 'Under Section 21 of Batas Kasambahay, what is the weekly rest period guaranteed to a domestic worker?',
    options: [
      'At least twenty-four (24) consecutive hours of rest in a week',
      'At least twelve (12) consecutive hours of rest every Sunday afternoon',
      'Forty-eight (48) consecutive hours of weekend rest every month',
      'Weekly rest is not mandatory for live-in domestic workers',
    ],
    correctIndex: 0,
    statute: 'Sec. 21, R.A. 10361',
    explanation: 'Section 21 of R.A. 10361 guarantees the domestic worker at least twenty-four (24) consecutive hours of rest in a week, scheduled by mutual agreement.',
  },
  {
    id: 'ct23',
    worldCode: 'w4',
    headline: 'Telecommuting Act Fair Treatment (R.A. 11165)',
    prompt: 'Under the Telecommuting Act (R.A. 11165), what core statutory protection is guaranteed to work-from-home telecommuting employees?',
    options: [
      'Equal pay and identical terms of employment as comparable on-site workers in the company',
      'Telecommuting workers may be paid twenty percent less than on-site staff due to zero commute',
      'Telecommuting employees are automatically stripped of overtime and holiday pay entitlements',
      'Employers can deduct thirty percent of monthly salary to offset home computer wear-and-tear',
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 11165 (Telecommuting Act)',
    explanation: 'R.A. 11165 mandates that telecommuting workers shall receive fair treatment and be provided with the same terms, conditions, and benefits as comparable employees working at the company premises.',
  },
  {
    id: 'ct24',
    worldCode: 'w4',
    headline: 'Night Worker Safe Transportation Mandate (R.A. 10151)',
    prompt: 'Under R.A. 10151, when is an employer legally required to provide transport facilities for employees assigned to night work?',
    options: [
      'When public transport is unavailable or when the employee lives in an inaccessible or unsafe area',
      'In all instances, regardless of whether commercial buses or trains are actively running',
      'Only if the night worker is a managerial executive earning above fifty thousand pesos',
      'Transportation is never an employer responsibility under Philippine labor statutes',
    ],
    correctIndex: 0,
    statute: 'R.A. 10151 Sec. 7',
    explanation: 'Under R.A. 10151, safe and suitable transport facilities must be provided for night workers between their residence and workplace when public transport is not available.',
  },
  {
    id: 'ct25',
    worldCode: 'w4',
    headline: 'Compensable Lactation Period (R.A. 10028)',
    prompt: 'Under the Expanded Breastfeeding Promotion Act (R.A. 10028), what lactation break period is guaranteed to nursing mothers during working hours?',
    options: [
      'Not less than forty (40) minutes for every eight-hour working period, counted as compensable time',
      'Twenty (20) minutes of unpaid time-off at the end of the scheduled workday',
      'One (1) hour of time-off deductible from the female employee\'s service incentive leave credits',
      'Lactation breaks are permitted only during the standard sixty-minute unpaid meal interval',
    ],
    correctIndex: 0,
    statute: 'Sec. 12, R.A. 10028',
    explanation: 'R.A. 10028 grants nursing employees lactation periods of not less than 40 minutes for every 8-hour shift, which shall be counted as compensable hours worked.',
  },
  {
    id: 'ct26',
    worldCode: 'w4',
    headline: 'Anti-Age Discrimination in Employment (R.A. 10911)',
    prompt: 'Can a retail department store advertise: \'Hiring Cashiers: Applicants must be between 20 and 25 years old\'?',
    options: [
      'Unlawful — R.A. 10911 prohibits setting age limitations in recruitment ads without bona fide occupational justification',
      'Lawful — employers possess unfettered management prerogative to select youthful brand ambassadors',
      'Lawful — provided the company pays the hired cashiers above the regional minimum wage rate',
      'Unlawful only if the rejected applicant was a senior citizen over sixty years of age',
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 10911 (Anti-Age Discrimination in Employment Act)',
    explanation: 'Section 5 of R.A. 10911 makes it unlawful for an employer to publish in any form of advertisement any preference, limitation, or specification based on age.',
  },
  {
    id: 'ct27',
    worldCode: 'w4',
    headline: 'PWD 1% Employment Mandate in Government (R.A. 10524)',
    prompt: 'Under Republic Act No. 10524, what percentage of all positions in all government agencies and GOCCs are reserved for PWDs?',
    options: [
      'At least one percent (1%) of all positions in government agencies, offices, or corporations',
      'At least five percent (5%) of all positions in public hospital administrations',
      'At least ten percent (10%) of all supervisory ranks across the civil service',
      'There is no statutory quota for PWD employment in Philippine government agencies',
    ],
    correctIndex: 0,
    statute: 'Sec. 1, R.A. 10524',
    explanation: 'R.A. 10524 mandates that at least one percent (1%) of all positions in all government agencies, offices, or corporations shall be reserved for persons with disability.',
  },
  {
    id: 'ct28',
    worldCode: 'w4',
    headline: 'Solo Parent Flexible Work Schedule (R.A. 11861)',
    prompt: 'Under R.A. 11861, what right is afforded to a solo parent worker regarding work hours arrangement?',
    options: [
      'Right to a flexible work schedule, provided it does not adversely affect core company productivity',
      'Right to work only four hours a day while receiving full eight hours basic daily wages',
      'Automatic right to permanent remote work without permission from the employer',
      'Exemption from all weekend emergency overtime regardless of disaster declarations',
    ],
    correctIndex: 0,
    statute: 'Sec. 6, R.A. 11861',
    explanation: 'Section 6 of R.A. 11861 gives solo parent employees the right to a flexible work schedule, allowing them to adjust work arrival and departure times without affecting core enterprise productivity.',
  },
];

export const DAISY_HOLIDAY_DERBY_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'dh1',
    worldCode: 'holidays',
    headline: 'Unworked Regular Holiday Rate',
    prompt: 'Daisy did not report for work on National Heroes Day (Regular Holiday), and she was present on the workday immediately preceding it. What pay does she receive?',
    options: [
      '100% of her regular daily wage',
      'No work, no pay (0%)',
      '200% of her regular daily wage',
      '130% of her regular daily wage',
    ],
    correctIndex: 0,
    statute: 'Art. 94, Labor Code',
    explanation: 'Covered employees receive 100% of their regular daily wage even if unworked on a Regular Holiday, subject to the preceding-day presence/paid-leave rule.',
  },
  {
    id: 'dh2',
    worldCode: 'holidays',
    headline: 'Double Regular Holiday (Worked)',
    prompt: 'Araw ng Kagitingan and Maundy Thursday fell on the exact same calendar day, and Luigi worked 8 hours. What is his statutory pay rate?',
    options: [
      '300% of his regular daily wage',
      '200% of his regular daily wage',
      '400% of his regular daily wage',
      '260% of his regular daily wage',
    ],
    correctIndex: 0,
    statute: 'DOLE Handbook on Workers’ Statutory Monetary Benefits',
    explanation: 'On a Double Regular Holiday, an unworked employee receives 200%, and if worked for the first 8 hours, the employee receives 300% (390% if also on Rest Day!).',
  },
  {
    id: 'dh3',
    worldCode: 'holidays',
    headline: 'Special Non-Working Day (Unworked)',
    prompt: 'Unless there is a favorable company practice or CBA, what rule governs an unworked Special (Non-Working) Day like Ninoy Aquino Day?',
    options: [
      '“No work, no pay” principle applies (0% extra pay if unworked)',
      'Full 100% daily basic wage is paid even when unworked',
      'Half-day 50% guaranteed standby wage credited automatically',
      'Premium 130% holiday rate credited without actual reporting',
    ],
    correctIndex: 0,
    statute: 'Art. 93 & DOLE Handbook',
    explanation: 'Special Non-Working Days follow the “no work, no pay” rule unless a company policy, practice, or CBA grants payment.',
  },
  {
    id: 'dh4',
    worldCode: 'holidays',
    headline: 'Special Non-Working Day Falling on Rest Day',
    prompt: 'Peach worked 8 hours on All Saints’ Day (Special Non-Working Day), which also happened to be her scheduled Sunday Rest Day. What rate applies?',
    options: [
      '150% of regular daily wage',
      '130% of regular daily wage',
      '200% of regular daily wage',
      '260% of regular daily wage',
    ],
    correctIndex: 0,
    statute: 'Art. 93(c), Labor Code',
    explanation: 'Work performed on a Special Non-Working Day = 130%, and when it also falls on the employee’s scheduled Rest Day, the rate rises to 150%.',
  },
  {
    id: 'dh5',
    worldCode: 'holidays',
    headline: 'Successive Regular Holidays Absence Trap',
    prompt: 'Maundy Thursday and Good Friday are successive Regular Holidays. Toad was absent WITHOUT pay on Wednesday, did not work Thursday, but WORKED on Good Friday. Which holiday pay does he get?',
    options: [
      'Entitled to holiday pay for Good Friday because he worked, though disqualified for Thursday',
      'Forfeits holiday pay for BOTH Thursday and Friday due to unexcused absence on Wednesday',
      'Gets 100% holiday pay for both Thursday and Friday under the automatic statutory grant',
      'Gets 50% penalty rate on Friday because he failed to report for work on Maundy Thursday'
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule IV Sec. 10',
    explanation: 'Where there are two successive regular holidays, an employee absent without pay on the preceding day is not paid if absent on both holidays, EXCEPT if they work on the first holiday or actually work on the second holiday (earning holiday pay for the worked holiday).',
  },
  {
    id: 'dh6',
    worldCode: 'holidays',
    headline: 'Retail Store With 8 Regular Workers',
    prompt: 'A bakery regularly employs 8 workers in total. Are its bakers statutorily entitled to Art. 94 Regular Holiday Pay?',
    options: [
      'No — retail and service establishments employing less than 10 workers are exempt from Holiday Pay',
      'Yes — only retail and service establishments employing five or fewer workers are exempt from Holiday Pay',
      'Yes — commercial bakeries are classified as heavy industrial manufacturing enterprises under DOLE rules',
      'Exempt from all national holidays except Christmas Day and New Year\'s Day under regional wage rules'
    ],
    correctIndex: 0,
    statute: 'Art. 94(a), Labor Code',
    explanation: 'Art. 94 explicitly exempts retail and service establishments regularly employing less than ten (10) workers from statutory Holiday Pay.',
  },
  {
    id: 'dh7',
    worldCode: 'holidays',
    headline: 'Regular Holiday Falling on Scheduled Rest Day',
    prompt: 'Mario worked 8 hours on Labor Day (Regular Holiday), which also coincided with his scheduled Rest Day. What total rate does he receive?',
    options: [
      '260% of regular daily wage (200% holiday base + 30% rest day premium on 200%)',
      '200% of regular daily wage (standard regular holiday rate without rest day addition)',
      '230% of regular daily wage (200% holiday rate plus 30% additive regular rest day rate)',
      '300% of regular daily wage (double holiday rate applied to rest day work schedules)'
    ],
    correctIndex: 0,
    statute: 'Art. 93(d) & DOLE Handbook',
    explanation: 'Work performed on a Regular Holiday that falls on the employee’s scheduled Rest Day is compensated at 200% + 30% of 200% = 260% of daily wage for the first 8 hours.',
  },
  {
    id: 'dh8',
    worldCode: 'holidays',
    headline: 'Overtime Beyond 8 Hours on Regular Holiday',
    prompt: 'Peach worked 10 hours on Independence Day (Regular Holiday, ordinary work day). What hourly multiplier applies to the 2 overtime hours?',
    options: [
      '260% of basic hourly rate (200% regular holiday rate × 1.30 OT rate)',
      '200% of basic hourly rate (standard unextended regular holiday rate)',
      '169% of basic hourly rate (130% special holiday rate × 1.30 OT rate)',
      '300% of basic hourly rate (300% double regular holiday base rate)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 94, Labor Code',
    explanation: 'Holiday hourly rate is 200% of basic; overtime adds +30% of the holiday rate, yielding 200% × 1.30 = 260% for excess hours.',
  },
  {
    id: 'dh9',
    worldCode: 'holidays',
    headline: 'Night Shift Differential on Special Holiday Rest Day',
    prompt: 'Luigi worked from 10:00 PM to 6:00 AM on All Saints’ Day (Special Holiday) which was also his Rest Day. How is his Night Shift Differential (NSD) computed?',
    options: [
      'Additional 10% on top of his Special Holiday Rest Day rate (150% × 1.10 = 165%)',
      'Flat 10% premium computed solely from basic hourly wage rate (100% × 1.10 = 110%)',
      'No night shift differential is legally mandated for special non-working days',
      'Flat 200% holiday rate replaces and extinguishes all night differential claims',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Omnibus Rules Book III Rule II',
    explanation: 'Night Shift Differential is at least 10% of the regular wage for each hour worked between 10:00 PM and 6:00 AM, calculated on top of the applicable day rate (150% × 1.10 = 165%).',
  },
  {
    id: 'dh10',
    worldCode: 'holidays',
    headline: 'Faculty and Academic Holiday Pay in Semestral Breaks',
    prompt: 'Are regular full-time university professors paid holiday pay during semestral and Christmas academic breaks?',
    options: [
      'Yes — regular full-time faculty on monthly salaries receive holiday pay during breaks',
      'No — academic semestral breaks are automatically treated as unpaid no-work off-periods',
      'Only if make-up remedial lectures or online classes are conducted during the holiday',
      'Entitled strictly to 50% half-pay unless university CBA mandates full disbursement',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule IV Sec. 8',
    explanation: 'Regular faculty members who are paid monthly or on annual contract are entitled to holiday pay during semestral and Christmas breaks when no classes are scheduled.',
  },
  {
    id: 'dh11',
    worldCode: 'holidays',
    headline: 'Special Non-Working Day Overtime Multiplier',
    prompt: 'Toad worked 10 hours on Ninoy Aquino Day (Special Non-Working Day, ordinary work day). What rate applies to hours 9 and 10?',
    options: [
      '169% of hourly rate (130% special day base rate × 1.30 overtime multiplier)',
      '130% of hourly rate (standard special day rate without overtime multiplier)',
      '150% of hourly rate (special holiday falling on scheduled weekly rest day)',
      '200% of hourly rate (unworked or standard regular national legal holiday)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 93, Labor Code',
    explanation: 'First 8 hours on a Special Day = 130%; overtime beyond 8 hours adds 30% of that day’s hourly rate: 130% × 1.30 = 169%.',
  },
  {
    id: 'dh12',
    worldCode: 'holidays',
    headline: 'Field Personnel Exclusion from Holiday Standards',
    prompt: 'A pharmaceutical medical representative travels independently across rural provinces without supervision or fixed hours. Is he entitled to statutory Holiday Pay?',
    options: [
      'No — true field personnel whose actual hours cannot be determined are exempt from Art. 94',
      'Yes — pharmaceutical sales representatives are classified as regular factory work staff',
      'Yes — all private sector employees receive holiday pay irrespective of task supervision',
      'Entitled strictly to 50% prorated holiday compensation under DOLE commercial standards',
    ],
    correctIndex: 0,
    statute: 'Art. 82 & Auto Bus Transport Systems v. Bautista',
    explanation: 'Employees whose time and performance are unsupervised and who work away from the employer’s premises are field personnel exempt from statutory holiday pay.',
  },
  {
    id: 'dh13',
    worldCode: 'holidays',
    headline: 'Successive Regular Holidays Rule (Holy Week)',
    prompt: 'Maundy Thursday and Good Friday are consecutive regular holidays. An employee is absent without pay on Holy Wednesday. How are the two holidays compensated?',
    options: [
      'Forfeits Thursday pay, but if present on Thursday, receives full pay for Good Friday',
      'Both Thursday and Friday holiday pays are automatically forfeited due to Wednesday absence',
      'Both holidays are paid at 100% regardless of absence on the preceding working day',
      'Receives fifty percent pay for both holidays under DOLE administrative compromise rules',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule IV Sec. 10',
    explanation: 'Where there are two successive regular holidays, the worker is not entitled to pay for the first holiday if absent without pay on the day before, but is entitled to pay for the second holiday if he works on the first holiday.',
  },
  {
    id: 'dh14',
    worldCode: 'holidays',
    headline: 'Work on a Special Working Day Compensation',
    prompt: 'The President proclaims a Special Working Day. An employee reports for work and renders 8 regular hours. What rate of compensation is due?',
    options: [
      '100% of regular daily wage (treated as an ordinary working day with no premium)',
      '130% of regular daily wage (same as a special non-working day)',
      '150% of regular daily wage (special day premium rate)',
      '200% of regular daily wage (regular holiday rate)',
    ],
    correctIndex: 0,
    statute: 'DOLE Handbook on Statutory Monetary Benefits',
    explanation: 'On a declared Special Working Day, work performed is considered rendered on an ordinary working day; the employee is entitled only to his basic daily wage (100%) with no premium.',
  },
  {
    id: 'dh15',
    worldCode: 'holidays',
    headline: 'Retail / Service Establishment Holiday Pay Exemption',
    prompt: 'A retail grocery store regularly employing eight (8) workers does not pay holiday pay on Independence Day. Is this lawful?',
    options: [
      'Lawful — retail and service establishments regularly employing less than 10 workers are exempt under Art. 94',
      'Illegal — all commercial establishments in the Philippines must pay statutory holiday pay',
      'Illegal — the small business exemption applies only to agricultural farm operations',
      'Lawful only if the grocery store is located in a fourth-class municipal local government unit',
    ],
    correctIndex: 0,
    statute: 'Art. 94, Labor Code; Omnibus Rules Book III Rule IV Sec. 1',
    explanation: 'Article 94 expressly exempts retail and service establishments regularly employing less than ten (10) workers from the mandatory payment of holiday pay.',
  },
  {
    id: 'dh16',
    worldCode: 'holidays',
    headline: 'Double Regular Holiday on Scheduled Rest Day',
    prompt: 'Mario works 8 hours on a Double Regular Holiday (e.g., Araw ng Kagitingan + Maundy Thursday) that falls on his Rest Day. What compensation is due?',
    options: [
      '390% of his basic daily rate (300% double holiday base multiplied by 1.30 rest day premium)',
      '300% of his basic daily rate (standard double regular holiday base rate)',
      '260% of his basic daily rate (single regular holiday on rest day rate)',
      '507% of his basic daily rate (double holiday rest day overtime rate)',
    ],
    correctIndex: 0,
    statute: 'DOLE Handbook; Memorandum on Double Regular Holidays',
    explanation: 'Work on a Double Regular Holiday pays 300%. When it falls on an employee’s scheduled rest day, the 30% rest day premium applies: 300% × 1.30 = 390% of basic daily rate.',
  },
  {
    id: 'dh17',
    worldCode: 'holidays',
    headline: 'Double Regular Holiday on Rest Day Overtime',
    prompt: 'Toad works 10 hours on a Double Regular Holiday on his scheduled Rest Day. What hourly multiplier applies to the 2 excess hours?',
    options: [
      '507% of regular hourly rate (390% base rate multiplied by 1.30 overtime factor)',
      '390% of regular hourly rate (straight double holiday rest day rate without overtime multiplier)',
      '300% of regular hourly rate (standard double holiday base multiplier)',
      '600% of regular hourly rate (double regular holiday statutory maximum ceiling)',
    ],
    correctIndex: 0,
    statute: 'DOLE Handbook on Statutory Monetary Benefits',
    explanation: 'Base rate for Double Holiday on Rest Day is 390%. Overtime adds 30% of that base: 390% × 1.30 = 507% per overtime hour.',
  },
  {
    id: 'dh18',
    worldCode: 'holidays',
    headline: 'Work on Special Non-Working Day (Ordinary Day)',
    prompt: 'Luigi renders 8 hours work on Ninoy Aquino Day (Special Non-Working Day) on an ordinary working day. What compensation is due?',
    options: [
      '130% of regular daily wage (100% basic wage plus 30% special holiday premium)',
      '100% of regular daily wage (standard ordinary day straight time)',
      '150% of regular daily wage (special day on rest day multiplier)',
      '200% of regular daily wage (equivalent to regular holiday pay)',
    ],
    correctIndex: 0,
    statute: 'Art. 93, Labor Code',
    explanation: 'Work performed on a Special Non-Working Day that does not fall on a rest day entitles the worker to plus 30% of his basic wage (130% total).',
  },
  {
    id: 'dh19',
    worldCode: 'holidays',
    headline: 'Work on Special Non-Working Day on Scheduled Rest Day',
    prompt: 'Yoshi works 8 hours on All Saints\' Day (Special Non-Working Day) which falls on his scheduled weekly Rest Day. What compensation is due?',
    options: [
      '150% of his regular daily wage (100% basic wage plus 50% rest day holiday premium)',
      '130% of his regular daily wage (standard special holiday multiplier)',
      '169% of his regular daily wage (special holiday rest day overtime multiplier)',
      '200% of his regular daily wage (regular holiday base rate)',
    ],
    correctIndex: 0,
    statute: 'Art. 93(c), Labor Code',
    explanation: 'Article 93(c) explicitly provides that work performed on a special non-working day falling on a scheduled rest day pays an additional 50% over the basic wage (150% total).',
  },
  {
    id: 'dh20',
    worldCode: 'holidays',
    headline: 'Overtime on Special Non-Working Day',
    prompt: 'Peach works 2 hours overtime on a Special Non-Working Day (ordinary day). What multiplier applies to the 2 overtime hours?',
    options: [
      '169% of regular hourly rate (130% special day base multiplied by 1.30 overtime factor)',
      '130% of regular hourly rate (standard special day rate without overtime multiplier)',
      '150% of regular hourly rate (special day rest day multiplier)',
      '195% of regular hourly rate (special day rest day overtime multiplier)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 + Art. 93, Labor Code',
    explanation: 'Work on a Special Day pays 130%. Overtime hours beyond 8 hours earn an additional 30% of that base: 130% × 1.30 = 169% per overtime hour.',
  },
  {
    id: 'dh21',
    worldCode: 'holidays',
    headline: 'Overtime on Special Day Falling on Rest Day',
    prompt: 'Donkey Kong works 2 hours overtime on a Special Non-Working Day that is also his scheduled Rest Day. What multiplier applies?',
    options: [
      '195% of regular hourly rate (150% base rate multiplied by 1.30 overtime factor)',
      '150% of regular hourly rate (straight special rest day rate without overtime multiplier)',
      '169% of regular hourly rate (special day ordinary overtime rate)',
      '260% of regular hourly rate (regular holiday on rest day multiplier)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 + Art. 93(c), Labor Code',
    explanation: 'Special Day on Rest Day base is 150%. Overtime beyond 8 hours adds 30% of that rate: 150% × 1.30 = 195% per overtime hour.',
  },
  {
    id: 'dh22',
    worldCode: 'holidays',
    headline: 'Regular Holiday on Rest Day Overtime Multiplier',
    prompt: 'Mario renders 2 hours overtime on Bonifacio Day (Regular Holiday) on his scheduled Rest Day. What is the multiplier for the 2 overtime hours?',
    options: [
      '338% of regular hourly rate (260% holiday rest day base multiplied by 1.30 overtime factor)',
      '260% of regular hourly rate (standard holiday rest day base without overtime factor)',
      '300% of regular hourly rate (double regular holiday base multiplier)',
      '390% of regular hourly rate (double holiday on rest day multiplier)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 + Art. 94, Labor Code; DOLE Handbook',
    explanation: 'Work on a Regular Holiday on Rest Day earns 260% (200% × 1.30). Overtime beyond 8 hours adds 30% of that base: 260% × 1.30 = 338% per overtime hour.',
  },
  {
    id: 'dh23',
    worldCode: 'holidays',
    headline: 'Shift Crossing Over Midnight into a Regular Holiday',
    prompt: 'An employee works from 8:00 PM on an ordinary day to 4:00 AM on a Regular Holiday. How is holiday pay allocated for the shift?',
    options: [
      'Hours worked from 12:00 MN to 4:00 AM earn regular holiday rates; 8:00 PM to 12:00 MN earn ordinary rates',
      'The entire 8-hour shift is paid at 200% holiday rate because it ended on a holiday',
      'The entire shift is paid at ordinary rates because it commenced on an ordinary working day',
      'Holiday rates apply only if more than six hours of the shift touch the holiday calendar date',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule IV; DOLE Labor Advisory',
    explanation: 'Holiday pay applies strictly to hours rendered on the actual calendar holiday date (12:00 Midnight to 4:00 AM earns holiday rates + NSD; 8:00 PM to 12:00 MN earns ordinary rate + NSD).',
  },
  {
    id: 'dh24',
    worldCode: 'holidays',
    headline: 'Mandatory Rest Day Religious Preference (Art. 91)',
    prompt: 'Under Article 91 of the Labor Code, what is the employer\'s obligation when an employee requests a specific rest day based on religion?',
    options: [
      'Employer must respect the employee\'s choice of rest day when based on religion, with 7 days advance notice',
      'Management has absolute authority to ignore religious rest day requests without explanation',
      'The employee must pay a statutory fee to the company to swap scheduled rest day rotations',
      'Religious rest day requests are valid only for employees in certified monastic vocations',
    ],
    correctIndex: 0,
    statute: 'Art. 91(b), Labor Code',
    explanation: 'Art. 91(b) provides that the employer shall respect the preference of employees as to their weekly rest day when such preference is based on religious grounds with at least 7 days notice.',
  },
  {
    id: 'dh25',
    worldCode: 'holidays',
    headline: 'Compulsory Work on a Scheduled Rest Day (Art. 92)',
    prompt: 'Under Article 92 of the Labor Code, in which of the following circumstances may an employer require employees to work on their rest day?',
    options: [
      'In case of actual or impending emergencies, disaster prevention, or urgent work to machinery',
      'Whenever the employer wants to increase quarterly company stock valuation dividends',
      'Whenever an employee arrives late on the Friday shift preceding the weekend',
      'Compulsory work on a rest day is strictly unconstitutional and never permitted under any condition',
    ],
    correctIndex: 0,
    statute: 'Art. 92, Labor Code',
    explanation: 'Article 92 allows an employer to require employees to work on their rest day in cases of emergency, disaster, urgent repairs to machinery to prevent loss, or abnormal pressure of work.',
  },
  {
    id: 'dh26',
    worldCode: 'holidays',
    headline: 'Work on Sunday When Not Scheduled Rest Day',
    prompt: 'An employee\'s assigned rest day is Wednesday. He works an ordinary 8-hour shift on Sunday. What compensation is due?',
    options: [
      '100% of his regular daily wage (Sunday is treated as an ordinary working day when not a rest day)',
      '130% of his regular daily wage (Sunday is always penalized with 30% premium under the Blue Sunday law)',
      '150% of his regular daily wage (special weekend holiday multiplier)',
      '200% of his regular daily wage (equivalent to a regular holiday)',
    ],
    correctIndex: 0,
    statute: 'Art. 93, Labor Code; Repeal of Republic Act No. 946 (Blue Sunday Law)',
    explanation: 'The Blue Sunday Law was repealed by the Labor Code. Sunday is treated as an ordinary working day if it is not the employee’s scheduled weekly rest day, earning standard 100% wage.',
  },
  {
    id: 'dh27',
    worldCode: 'holidays',
    headline: 'National Holidays Falling on a Sunday',
    prompt: 'When a Regular Holiday falls on a Sunday, does Monday automatically become a paid holiday in the absence of a presidential proclamation?',
    options: [
      'No — Sunday remains the official holiday; Monday is not a holiday unless declared by proclamation',
      'Yes — holiday economics automatically shifts all Sunday holidays to the immediate Monday',
      'Yes — workers receive double holiday pay for both Sunday and Monday automatically',
      'Private employers are required to close operations on Monday with full compensation',
    ],
    correctIndex: 0,
    statute: 'Administrative Code of 1987 (E.O. 292, as amended by R.A. 9492)',
    explanation: 'Under R.A. 9492 and Proclamation guidelines, a holiday falling on a Sunday is celebrated on Sunday unless a specific Presidential Proclamation expressly moves the holiday to Monday.',
  },
  {
    id: 'dh28',
    worldCode: 'holidays',
    headline: 'Paid Leave on Workday Preceding Holiday Rule',
    prompt: 'An employee is on authorized paid vacation leave on the workday immediately preceding a Regular Holiday. Does she receive holiday pay?',
    options: [
      'Yes — an employee on authorized leave of absence with pay on the eve is entitled to holiday pay',
      'No — being absent on the day before a holiday forfeits holiday pay even if the leave was paid',
      'She receives only fifty percent of the holiday pay under DOLE administrative rules',
      'Holiday pay is converted into an additional vacation leave credit for next year',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule IV Sec. 6(a)',
    explanation: 'All covered employees on authorized leave of absence with pay on the workday immediately preceding a regular holiday are entitled to regular holiday pay under the Omnibus Rules.',
  },
];

export const DRY_BONES_CRYPT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'db1',
    worldCode: 'w5',
    headline: 'Money Claims Prescriptive Period',
    prompt: 'Within how many years from accrual of the cause of action must pure money claims arising from employer-employee relations be filed?',
    options: [
      'Three (3) years from accrual under Article 306',
      'Four (4) years from breach under Article 1146',
      'One (1) year from incident under Article 305',
      'Ten (10) years from breach under Article 1144',
    ],
    correctIndex: 0,
    statute: 'Art. 306 [291], Labor Code',
    explanation: 'All money claims arising from employer-employee relations accruing during the effectivity of the Labor Code shall be filed within three (3) years from the time the cause of action accrued.',
  },
  {
    id: 'db2',
    worldCode: 'w5',
    headline: 'Illegal Dismissal Prescriptive Period',
    prompt: 'Under Art. 1146 of the Civil Code and Supreme Court jurisprudence (Callanta v. Carnation), what is the prescriptive period to file an Illegal Dismissal complaint?',
    options: [
      'Four (4) years as an injury to plaintiff’s security of tenure rights',
      'Three (3) years under Article 306 general labor code money provisions',
      'One (1) year analogous to Article 305 unfair labor practice actions',
      'Ten (10) years based on breach of a written bilateral labor contract',
    ],
    correctIndex: 0,
    statute: 'Art. 1146, Civil Code',
    explanation: 'Illegal dismissal is an injury to one’s constitutional/statutory right to security of tenure and prescribes in four (4) years.',
  },
  {
    id: 'db3',
    worldCode: 'w5',
    headline: 'Unfair Labor Practice (ULP) Prescription',
    prompt: 'Within what period must an Unfair Labor Practice (ULP) complaint be filed?',
    options: [
      'One (1) year from the date of accrual under Article 305',
      'Three (3) years from accrual under Article 306 standards',
      'Six (6) months from issuance of the management directive',
      'Thirty (30) days from exhaustion of grievance machinery',
    ],
    correctIndex: 0,
    statute: 'Art. 305 [290], Labor Code',
    explanation: 'All unfair labor practices arising from Book V shall be filed within one (1) year from accrual; otherwise they shall be forever barred.',
  },
  {
    id: 'db4',
    worldCode: 'w5',
    headline: 'King of Kings Transport 5-Day NTE Rule',
    prompt: 'Under the Twin-Notice Rule for Just Cause termination, how many calendar days must an employee be given to submit a written explanation after the First Notice (NTE)?',
    options: [
      'At least five (5) calendar days',
      '24 hours is always sufficient',
      'At least thirty (30) calendar days',
      'At least fifteen (15) working days',
    ],
    correctIndex: 0,
    statute: 'King of Kings Transport v. Mamac & D.O. 147-15',
    explanation: '“Reasonable opportunity” in the First Notice means a period of at least five (5) calendar days from receipt of notice to prepare a written defense.',
  },
  {
    id: 'db5',
    worldCode: 'w5',
    headline: 'Authorized Cause 30-Day Dual Notice',
    prompt: 'When terminating employees due to Redundancy or Retrenchment (Art. 298), whom must the employer serve written notice upon, and when?',
    options: [
      'Both the affected workers AND DOLE at least 30 days (1 month) before intended date',
      'Only the certified Union President at least five calendar days before termination date',
      'Only the DOLE Regional Office within fifteen calendar days after employee separation',
      'Verbal townhall announcement is legally sufficient provided separation pay is disbursed'
    ],
    correctIndex: 0,
    statute: 'Art. 298 [283], Labor Code',
    explanation: 'Authorized cause termination requires written notice to BOTH the employee and the DOLE Regional Office at least one (1) month prior to the effective date.',
  },
  {
    id: 'db6',
    worldCode: 'w5',
    headline: 'Bona Fide Suspension / Floating Status Cap',
    prompt: 'Under Art. 301 [286], what is the maximum period of bona fide suspension of operations or security guard “floating status” before constructive dismissal sets in?',
    options: [
      'Period not exceeding six (6) months',
      'Period not exceeding three (3) months',
      'Period not exceeding one (1) year',
      'Period not exceeding ninety (90) days',
    ],
    correctIndex: 0,
    statute: 'Art. 301 [286], Labor Code',
    explanation: 'Bona fide suspension of business operations or off-detail status shall not exceed six (6) months; beyond 6 months without recall or valid separation, constructive dismissal attaches.',
  },
  {
    id: 'db7',
    worldCode: 'w5',
    headline: 'Agabon Doctrine: Just Cause Dismissal Without Procedural Due Process',
    prompt: 'Under the landmark Agabon v. NLRC doctrine, if an employee was dismissed for a valid Just Cause (e.g. serious misconduct) but the employer failed to observe the twin-notice procedure, what is the legal consequence?',
    options: [
      'Dismissal is upheld as valid, but employer pays nominal damages (standard PHP 30,000)',
      'Dismissal is voided as illegal, ordering full reinstatement with backwages from dismissal',
      'Employee receives full separation pay plus one year guaranteed backwages compensation',
      'Employer faces automatic criminal prosecution and permanent revocation of DOLE license',
    ],
    correctIndex: 0,
    statute: 'Agabon v. NLRC, G.R. No. 158693 (2004)',
    explanation: 'Where dismissal is for just cause but lacks procedural due process, dismissal remains valid, but employer is liable for nominal damages (traditionally PHP 30,000 for just cause).',
  },
  {
    id: 'db8',
    worldCode: 'w5',
    headline: 'Jaka Investments Doctrine: Authorized Cause Without 30-Day Notice',
    prompt: 'Under Jaka Investments Corp. v. Paco, if an employee is retrenched for a valid Authorized Cause but without written notice to DOLE or the employee, how much nominal damages attach?',
    options: [
      'PHP 50,000 nominal damages (higher sanction because authorized cause is employer-driven)',
      'PHP 30,000 nominal damages (identical sanction to just cause violations under Agabon)',
      'PHP 100,000 exemplary damages (penal sanction for wilful violation of labor standards)',
      'Zero damages provided statutory retrenchment separation pay is tendered within 30 days',
    ],
    correctIndex: 0,
    statute: 'Jaka Investments Corp. v. Paco, G.R. No. 141322 (2005)',
    explanation: 'Authorized causes without statutory 30-day notice warrant a higher nominal damage sanction of PHP 50,000 because dismissal is initiated for business convenience rather than employee fault.',
  },
  {
    id: 'db9',
    worldCode: 'w5',
    headline: 'Preventive Suspension 30-Day Statutory Cap',
    prompt: 'What is the absolute maximum duration an employee may be placed under preventive suspension during investigation before the employer must reinstate them to actual work or payroll?',
    options: [
      'Not more than thirty (30) calendar days; thereafter mandatory payroll reinstatement applies',
      'Up to sixty (60) calendar days provided formal extension is approved by DOLE Regional Director',
      'Up to ninety (90) calendar days if complex independent forensic accounting audits are pending',
      'Ten (10) working days maximum with automatic entitlement to immediate emergency separation pay',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book V Rule XXIII Sec. 8–9',
    explanation: 'Preventive suspension cannot exceed 30 days. If extended beyond 30 days, the employer must reinstate the employee to their former position or in payroll reinstatement.',
  },
  {
    id: 'db10',
    worldCode: 'w5',
    headline: 'Employee Resignation 30-Day Written Notice Requirement',
    prompt: 'Under Art. 300 [285], how much advance written notice must an employee serve upon the employer when resigning without just cause?',
    options: [
      'At least one (1) month (30 days) written notice in advance; otherwise liable for damages',
      'At least fifteen (15) working days with written clearance from direct unit supervisor',
      'Zero notice — Philippine Constitution guarantees absolute freedom against forced labor',
      'Forty-five (45) calendar days for supervisory and confidential managerial personnel',
    ],
    correctIndex: 0,
    statute: 'Art. 300 [285], Labor Code',
    explanation: 'An employee may terminate without just cause the employee-employer relationship by serving written notice on the employer at least one (1) month in advance.',
  },
  {
    id: 'db11',
    worldCode: 'w5',
    headline: 'Elements of Valid Retrenchment (SGS Doctrine)',
    prompt: 'Which of the following is an indispensable substantive requirement for a valid Retrenchment to Prevent Losses under Art. 298?',
    options: [
      'Substantial losses proven by independent audited financial statements, reasonably preventing harm',
      'Anticipated financial losses merely alleged by human resource executives in internal memos',
      'Sworn affidavit of in-house company accountant without audited comparative balance sheets',
      'Prior written clearance certificate obtained from the DOLE Regional Director upon notice',
    ],
    correctIndex: 0,
    statute: 'Art. 298 & Manatad v. Philippine Telegraph and Telephone Co.',
    explanation: 'Retrenchment losses must be substantial, serious, actual or reasonably imminent, and proven by independent audited financial statements, not mere self-serving declarations.',
  },
  {
    id: 'db12',
    worldCode: 'w5',
    headline: 'Totality of Infractions Doctrine',
    prompt: 'Can previous offenses for which an employee was already reprimanded or suspended be considered in determining the penalty for a new infraction?',
    options: [
      'Yes — under Totality of Infractions doctrine, entire record is examined when imposing penalty',
      'No — constitutional double jeopardy strictly bars employer review of previously closed infractions',
      'Only if all past offenses occurred within the preceding thirty (30) consecutive calendar days',
      'Only for managerial confidential staff with fiduciary trust, never rank-and-file workers',
    ],
    correctIndex: 0,
    statute: 'Villanueva v. NLRC & Sy v. Neat, Inc.',
    explanation: 'The Totality of Infractions doctrine allows the employer to consider previous offenses in determining the penalty for subsequent infractions, as habitual disregard of rules justifies termination.',
  },
  {
    id: 'db13',
    worldCode: 'w5',
    headline: 'Labor Arbiter Exclusive Jurisdiction (Art. 224 [217])',
    prompt: 'Under Article 224 [217] of the Labor Code, which forum has original and exclusive jurisdiction over unfair labor practices and illegal dismissal suits?',
    options: [
      'Labor Arbiters of the National Labor Relations Commission (NLRC)',
      'Regional Trial Courts exercising general civil and commercial jurisdiction',
      'The Secretary of Labor and Employment through administrative visitorial summons',
      'The Bureau of Working Conditions of the Department of Labor and Employment',
    ],
    correctIndex: 0,
    statute: 'Art. 224 [217], Labor Code',
    explanation: 'Art. 224 provides that Labor Arbiters have original and exclusive jurisdiction to hear and decide unfair labor practices, termination disputes, and money claims exceeding ₱5,000.',
  },
  {
    id: 'db14',
    worldCode: 'w5',
    headline: 'Visitorial Power Limitation (Art. 128)',
    prompt: 'During a DOLE routine inspection, the employer contests the existence of employment with prima facie documentary evidence. What happens to the case?',
    options: [
      'The Regional Director must endorse the case to the NLRC Labor Arbiter for full trial on the merits',
      'The DOLE inspector immediately issues a closure order padlocking the manufacturing plant',
      'The Regional Director summarily enters default judgment declaring employment fully established',
      'The employer is arrested without warrant for contempt of labor standards inspection authority',
    ],
    correctIndex: 0,
    statute: 'Art. 128(b), Labor Code; People\'s Broadcasting Service v. Secretary of DOLE',
    explanation: 'Under the Bombo Radyo doctrine, if the employer presents prima facie evidence contesting the employer-employee relationship, the visitorial jurisdiction of DOLE ceases and the matter goes to the NLRC.',
  },
  {
    id: 'db15',
    worldCode: 'w5',
    headline: 'Mandatory Appeal Bond for Monetary Awards (Art. 229)',
    prompt: 'When an employer appeals a Labor Arbiter decision awarding ₱500,000 backwages to the NLRC Commission, what is an absolute jurisdictional requisite?',
    options: [
      'Posting a cash or surety bond in the equivalent monetary amount of the backwage award',
      'Executing a promissory note guaranteed by the employer\'s corporate board of directors',
      'Filing a formal motion to reduce bond with zero monetary escrow deposit attached',
      'Securing a letter of endorsement from the local municipal chamber of commerce',
    ],
    correctIndex: 0,
    statute: 'Art. 229, Labor Code; McBurnie v. Ganzon',
    explanation: 'Article 229 provides that in case of a judgment involving a monetary award, an appeal by the employer may be perfected only upon the posting of a cash or surety bond equal to the monetary award.',
  },
  {
    id: 'db16',
    worldCode: 'w5',
    headline: 'Prohibited Motion for Reconsideration Before Labor Arbiter',
    prompt: 'Can an employer file a Motion for Reconsideration against an adverse final decision rendered by a Labor Arbiter?',
    options: [
      'No — a Motion for Reconsideration is a prohibited pleading before the Labor Arbiter; remedy is direct appeal',
      'Yes — an MR must be filed within fifteen days before an appeal can be perfected to the NLRC',
      'Yes — but only if accompanied by an affidavit of merit signed by three corporate executives',
      'Permissible provided the filing fee of ten thousand pesos is paid to the NLRC cashier',
    ],
    correctIndex: 0,
    statute: '2011 NLRC Rules of Procedure Rule V Sec. 5 & Rule VI Sec. 1',
    explanation: 'Under the 2011 NLRC Rules of Procedure, a Motion for Reconsideration of any order or decision of a Labor Arbiter is a prohibited pleading; the exclusive remedy is an appeal to the Commission within 10 days.',
  },
  {
    id: 'db17',
    worldCode: 'w5',
    headline: 'St. Martin Funeral Home Doctrine (Appeal to Court of Appeals)',
    prompt: 'Under the landmark St. Martin Funeral Home doctrine, how are final resolutions of the NLRC reviewed by the judicial system?',
    options: [
      'Via Special Civil Action for Certiorari under Rule 65 filed before the Court of Appeals',
      'Via Notice of Appeal filed directly before the Supreme Court en banc',
      'Via Petition for Review under Rule 43 filed before the Regional Trial Court',
      'Via Petition for Declaratory Relief filed before the Court of Tax Appeals',
    ],
    correctIndex: 0,
    statute: 'St. Martin Funeral Home v. NLRC (G.R. No. 130866)',
    explanation: 'In St. Martin Funeral Home, the Supreme Court held that all petitions for certiorari challenging decisions and resolutions of the NLRC must be filed initially with the Court of Appeals under Rule 65.',
  },
  {
    id: 'db18',
    worldCode: 'w5',
    headline: 'Rule 45 Appeal to Supreme Court Deadline',
    prompt: 'Within what period must a party appeal an adverse decision of the Court of Appeals in a labor case to the Supreme Court under Rule 45?',
    options: [
      'Within fifteen (15) days from notice of the CA judgment or denial of the motion for reconsideration',
      'Within thirty (30) days from the rendition of the Court of Appeals decision',
      'Within sixty (60) days matching standard Rule 65 extraordinary certiorari windows',
      'Within ten (10) calendar days from receipt of the Court of Appeals resolution',
    ],
    correctIndex: 0,
    statute: 'Rule 45 Sec. 2, Rules of Court',
    explanation: 'A petition for review on certiorari under Rule 45 must be filed within fifteen (15) days from notice of the judgment or final order or resolution appealed from, or of the denial of the motion for reconsideration.',
  },
  {
    id: 'db19',
    worldCode: 'w5',
    headline: 'Single Entry Approach (SEnA) Mandatory Conciliation (R.A. 10396)',
    prompt: 'Under Republic Act No. 10396, what is the mandatory 30-day preliminary procedure required before any labor case can be filed?',
    options: [
      'Mandatory 30-day conciliation-mediation under the Single Entry Approach (SEnA)',
      'Mandatory preliminary injunction hearing before a Regional Trial Court branch judge',
      'Mandatory 30-day cooling-off strike vote supervised by the Armed Forces of the Philippines',
      'Mandatory submission of corporate books to the Securities and Exchange Commission',
    ],
    correctIndex: 0,
    statute: 'Art. 234 [228], Labor Code (as amended by R.A. 10396)',
    explanation: 'Under R.A. 10396, all issues arising from labor and employment shall be subject to mandatory conciliation-mediation through the Single Entry Approach (SEnA) for a period of 30 days.',
  },
  {
    id: 'db20',
    worldCode: 'w5',
    headline: 'Voluntary Arbitrator Original & Exclusive Jurisdiction',
    prompt: 'Under Article 274 [261] of the Labor Code, what disputes fall within the original and exclusive jurisdiction of Voluntary Arbitrators?',
    options: [
      'All unresolved grievances arising from the interpretation or implementation of the CBA and company policies',
      'Pure criminal prosecutions for physical injuries occurring during factory wildcat strikes',
      'Corporate dissolution proceedings of registered private stock entities',
      'Tax evasion charges filed by the Bureau of Internal Revenue against employer payroll officers',
    ],
    correctIndex: 0,
    statute: 'Art. 274 [261], Labor Code; San Miguel Corp. v. NLRC',
    explanation: 'Article 274 confers original and exclusive jurisdiction upon Voluntary Arbitrators to hear and decide all unresolved grievances arising from the interpretation or implementation of the CBA and personnel policies.',
  },
  {
    id: 'db21',
    worldCode: 'w5',
    headline: 'Bureau of Labor Relations (BLR) Exclusive Jurisdiction',
    prompt: 'Which of the following disputes falls within the original jurisdiction of the Bureau of Labor Relations (BLR) and Med-Arbiters?',
    options: [
      'Inter-union disputes, intra-union disputes, and union registration / election contests',
      'Money claims for unpaid overtime pay exceeding five thousand pesos',
      'Illegal dismissal complaints filed by probationary managerial personnel',
      'Claims for statutory death and funeral benefits under the Social Security System',
    ],
    correctIndex: 0,
    statute: 'Art. 232 [226], Labor Code',
    explanation: 'Article 232 vests the Bureau of Labor Relations and the Med-Arbiters with original and exclusive authority to decide all inter-union and intra-union conflicts and union representation issues.',
  },
  {
    id: 'db22',
    worldCode: 'w5',
    headline: 'Abolition of Direct Certification of Bargaining Agent',
    prompt: 'Can an employer voluntarily recognize a labor union as the exclusive bargaining agent without following DOLE certification rules?',
    options: [
      'No — direct certification is abolished; exclusive representation requires SEBA request or certification election',
      'Yes — employers possess absolute authority to choose whichever union offers the most favorable terms',
      'Yes — provided the chosen union executive officers sign a non-strike covenant for ten years',
      'Direct certification is allowed for employers with fewer than fifty total employees',
    ],
    correctIndex: 0,
    statute: 'D.O. 40-03 & D.O. 40-I-15; Heritage Hotel v. NUHWHRAIN',
    explanation: 'Direct certification by the employer has long been abolished. A union acquires exclusive bargaining agent status either through voluntary recognition / SEBA certification or through a certification election.',
  },
  {
    id: 'db23',
    worldCode: 'w5',
    headline: 'Requisites of a Lawful Strike (Art. 278 [263])',
    prompt: 'Which of the following sets forth the complete mandatory procedural requirements for conducting a lawful strike in the Philippines?',
    options: [
      'Valid ground + Notice of Strike + 30/15-day cooling-off + 24-hr strike vote notice + Strike vote + 7-day strike ban',
      'Simple verbal notice to floor supervisor + Walkout of workers within two hours of announcement',
      'Publication in a national newspaper + Approval of the local municipal chief of police',
      'Filing a civil complaint in trial court + Posting an injunction counter-bond of fifty thousand pesos',
    ],
    correctIndex: 0,
    statute: 'Art. 278 [263], Labor Code; National Union of Workers v. NLRC',
    explanation: 'A lawful strike strictly requires: (1) valid statutory ground (ULP or deadlock); (2) notice of strike; (3) cooling-off period (15d ULP / 30d deadlock); (4) strike vote notice; (5) majority vote; and (6) 7-day strike ban.',
  },
  {
    id: 'db24',
    worldCode: 'w5',
    headline: 'Assumption of Jurisdiction by DOLE Secretary (Art. 278(g))',
    prompt: 'When a labor strike occurs in an industry indispensable to the national interest (e.g., hospitals, power grid), what power may the DOLE Secretary exercise?',
    options: [
      'Assume jurisdiction over the dispute or certify it to the NLRC for compulsory arbitration (Art. 278(g))',
      'Order the immediate criminal imprisonment of all striking workers without bail',
      'Declare the permanent closure and bankruptcy of the corporate utility enterprise',
      'Direct the Philippine National Police to seize corporate shares of stock',
    ],
    correctIndex: 0,
    statute: 'Art. 278(g) [263(g)], Labor Code; Philcom v. Palma',
    explanation: 'Under Art. 278(g), when a labor dispute involves an industry indispensable to the national interest, the Secretary of Labor may assume jurisdiction and order all striking employees to immediately return to work.',
  },
  {
    id: 'db25',
    worldCode: 'w5',
    headline: 'Prohibition on Injunctions Against Peaceful Picketing (Art. 266)',
    prompt: 'Under Article 266 [254] of the Labor Code, can regular Regional Trial Courts issue injunctions or restraining orders to break up a peaceful strike?',
    options: [
      'No — no court or entity shall enjoin or restrain any strike or peaceful picketing, except NLRC under Art. 225',
      'Yes — any municipal or regional trial court judge may issue an ex parte injunction against a strike',
      'Yes — provided the employer files a property damage bond of twenty-five thousand pesos',
      'Injunctions are permitted if the strike causes heavy traffic on provincial national highways',
    ],
    correctIndex: 0,
    statute: 'Art. 266 [254], Labor Code; San Miguel Corp. v. NLRC',
    explanation: 'Article 266 provides that no court or entity shall have jurisdiction to issue any temporary or permanent injunction or restraining order in any case involving or growing out of a labor dispute.',
  },
  {
    id: 'db26',
    worldCode: 'w5',
    headline: 'Union Security Clause (Closed Shop Agreement)',
    prompt: 'Under a valid closed-shop agreement in a CBA, what is the employer\'s duty when an employee is expelled from the union for disloyalty?',
    options: [
      'The employer is legally obligated to dismiss the employee upon formal demand by the union',
      'The employer has absolute discretion to retain the worker and disregard the closed-shop stipulation',
      'The employer must promote the expelled employee to a supervisory position to avoid union rules',
      'The employer must pay the union a fine of fifty thousand pesos while keeping the employee',
    ],
    correctIndex: 0,
    statute: 'Art. 259(e) [248(e)], Labor Code; Alabang Country Club v. NLRC',
    explanation: 'Under a valid union security clause (closed shop), the employer is bound to dismiss an employee who ceases to be a union member in good standing, provided due process is observed.',
  },
  {
    id: 'db27',
    worldCode: 'w5',
    headline: 'Certification Election 25% Substantial Support Rule',
    prompt: 'In an organized establishment with an existing CBA, what percentage of bargaining unit signatures must accompany a petition for certification election during the freedom period?',
    options: [
      'At least twenty-five percent (25%) of all employees in the bargaining unit',
      'At least fifty percent plus one (50% + 1) of all employees in the enterprise',
      'At least ten percent (10%) of rank-and-file workers in the night shift',
      'No signatures are required; any individual worker may file a petition alone',
    ],
    correctIndex: 0,
    statute: 'Art. 268 [256], Labor Code',
    explanation: 'In an organized establishment, a petition for certification election during the 60-day freedom period must be supported by the written consent of at least 25% of all employees in the bargaining unit.',
  },
  {
    id: 'db28',
    worldCode: 'w5',
    headline: 'Double Majority Rule in Certification Elections',
    prompt: 'What are the two majorities required under the Double Majority Rule for a union to be certified as exclusive bargaining agent?',
    options: [
      'Majority of eligible voters must vote + Winning union must receive majority of valid votes cast',
      'Majority of supervisors must approve + Majority of corporate board members must consent',
      'Majority of night workers must attend + Majority of union dues must be fully paid',
      '100% of employees must register + Winning union must receive at least 75% of votes',
    ],
    correctIndex: 0,
    statute: 'Art. 268 [256], Labor Code; D.O. 40-03',
    explanation: 'The Double Majority Rule requires: (1) at least 50% + 1 of all eligible voters in the bargaining unit must cast ballots; and (2) the candidate union must obtain a majority of the valid votes cast.',
  },
];

export const PAULINE_WAGE_CONCERT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'pw1',
    worldCode: 'w3',
    headline: '100% Service Charges Distribution',
    prompt: 'Under R.A. 11360 (amending Art. 96), what percentage of collected service charges in hotels and restaurants belongs to covered employees?',
    options: [
      '100% distributed completely and equally among covered rank-and-file and supervisory workers',
      '85% distributed to rank-and-file employees and 15% retained by management for breakages',
      '90% distributed to covered service employees and 10% retained for administrative expenses',
      '50% divided equally between operational floor staff and restaurant management executives'
    ],
    correctIndex: 0,
    statute: 'R.A. 11360 (Art. 96, Labor Code)',
    explanation: 'R.A. 11360 abolished management’s old 15% share; 100% of service charges must be distributed completely and equally among covered employees (excluding managerial employees).',
  },
  {
    id: 'pw2',
    worldCode: 'w3',
    headline: '13th Month Pay Deadline & Formula',
    prompt: 'Under P.D. 851, what is the statutory formula and mandatory payout deadline for 13th Month Pay?',
    options: [
      'At least 1/12 of total basic salary earned in calendar year, paid on or before December 24',
      'One full gross monthly salary including overtime and allowances, paid on or before Dec 31',
      '1/12 of gross earnings restricted strictly to regular workers having full one-year tenure',
      'Discretionary Christmas bonus subject to employer profitability and executive approval',
    ],
    correctIndex: 0,
    statute: 'P.D. 851 & Revised Guidelines',
    explanation: 'Rank-and-file employees who worked at least 1 month during the calendar year are entitled to 1/12 of total basic salary earned, payable on or before December 24.',
  },
  {
    id: 'pw3',
    worldCode: 'w3',
    headline: 'Prohibition Against Payment by Chits or Coupons',
    prompt: 'A plantation pays workers 70% in Philippine Pesos and 30% in company store grocery vouchers, claiming workers requested it. Is this valid?',
    options: [
      'Void and criminal — wages must be paid strictly in legal tender even if requested',
      'Valid because seventy percent was paid in lawful Philippine currency through regular payroll',
      'Valid provided the employees executed individual notarized requests witnessed by the union',
      'Valid for registered agricultural plantations under specialized agrarian reform exemptions'
    ],
    correctIndex: 0,
    statute: 'Art. 102, Labor Code',
    explanation: 'Art. 102 strictly prohibits paying wages via promissory notes, vouchers, coupons, tokens, or chits, even when expressly requested by the employee!',
  },
  {
    id: 'pw4',
    worldCode: 'w3',
    headline: 'Facilities vs. Supplements (Mabeza / SLL Doctrine)',
    prompt: 'What is the controlling legal test used by the Supreme Court to determine whether board/lodging is a deductible “Facility” or a non-deductible “Supplement”?',
    options: [
      'Purpose Test — whether primarily for employee benefit (Facility) or employer convenience',
      'Monetary Value Test — any benefit exceeding five hundred pesos is classified as a Facility',
      'Location Test — whether the benefit or lodging is utilized inside or outside company premises',
      'Tenure Test — whether the benefit is granted exclusively to regularized tenured employees'
    ],
    correctIndex: 0,
    statute: 'SLL International Cables Specialist v. NLRC',
    explanation: 'Under the Purpose Test, distinction rests not on kind but on purpose: Facilities benefit the worker/family (requiring Voluntary Acceptance + Fair Value + Customary proof to deduct), whereas Supplements benefit employer convenience and are never deductible.',
  },
  {
    id: 'pw5',
    worldCode: 'w3',
    headline: 'D.O. 174 Substantial Capital Threshold',
    prompt: 'Under DOLE D.O. No. 174-17, what is the minimum paid-up capital / net financial contracting capacity required for corporations/partnerships to qualify as having “substantial capital”?',
    options: [
      'At least PHP 5,000,000.00',
      'At least PHP 3,000,000.00',
      'At least PHP 1,000,000.00',
      'At least PHP 500,000.00',
    ],
    correctIndex: 0,
    statute: 'Sec. 3(l), DOLE D.O. 174-17',
    explanation: 'D.O. 174-17 raised the substantial capital requirement to at least PHP 5,000,000 paid-up capital for corporations/partnerships/cooperatives or net worth for single proprietorships.',
  },
  {
    id: 'pw6',
    worldCode: 'w3',
    headline: 'R.A. 8188 Double Indemnity Penalty',
    prompt: 'If an employer refuses or fails to pay the prescribed statutory wage increase under an RTWPB Wage Order, what special monetary sanction attaches under R.A. 8188?',
    options: [
      'Double Indemnity: payment of double (2x) the unpaid benefits and wage increments owed',
      'Triple damages accompanied by immediate automatic cancellation of DOLE operating permit',
      'Nominal damages capped strictly at PHP 10,000 per violation regardless of unpaid workers',
      'Simple statutory six percent (6%) legal interest without any punitive indemnity multiplier',
    ],
    correctIndex: 0,
    statute: 'Sec. 4, R.A. 8188',
    explanation: 'R.A. 8188 imposes Double Indemnity (2x the unpaid prescribed wage adjustment) against employers who refuse or fail to pay RTWPB-mandated minimum wage increases.',
  },
  {
    id: 'pw7',
    worldCode: 'w3',
    headline: 'Wage Distortion Resolution in Unionized Establishments',
    prompt: 'When an RTWPB wage increase obliterates the pay differences between job classifications in an organized establishment with a recognized CBA, how must the wage distortion be resolved?',
    options: [
      'Grievance machinery under CBA, and if unresolved within 10 days, to voluntary arbitration',
      'Immediate notice of strike filed before NCMB with mandatory twenty-four (24) hour cooling',
      'Direct petition for certiorari filed before Court of Appeals within sixty (60) days',
      'Employer unilaterally promulgates new wage matrix without consultation or arbitration',
    ],
    correctIndex: 0,
    statute: 'Art. 124, Labor Code',
    explanation: 'In organized establishments, wage distortions must be processed through the grievance machinery of the CBA, and if unresolved, referred to voluntary arbitration within 10 days.',
  },
  {
    id: 'pw8',
    worldCode: 'w3',
    headline: 'Non-Diminution of Benefits Principle',
    prompt: 'Under Art. 100, what are the requisite conditions before a benefit or grant ripens into a company practice that cannot be unilaterally eliminated by the employer?',
    options: [
      'Given voluntarily, consistently, and deliberately over considerable time without legal error',
      'Granted at least twice during annual Christmas celebrations or company anniversary parties',
      'Stipulated in an unsigned preliminary draft employee handbook circulated for evaluation',
      'Practiced continuously for thirty (30) calendar days during initial probationary trial',
    ],
    correctIndex: 0,
    statute: 'Art. 100 & Vergara v. Coca-Cola Bottlers Philippines',
    explanation: 'To ripen into a non-diminution practice, the grant must be voluntary, consistent over a long period, deliberate, and not founded on an erroneous interpretation of legal provisions.',
  },
  {
    id: 'pw9',
    worldCode: 'w3',
    headline: 'Permissible Salary Deductions Without Court Order',
    prompt: 'Under Art. 113, in which of the following cases is an employer legally allowed to deduct amounts from an employee’s wage without a court judgment?',
    options: [
      'For worker insurance with consent, union check-off dues, or when authorized by statutory law',
      'Whenever management suspects inventory shrinkage or store shortages without written hearing',
      'For repair costs of damaged tools and uniforms automatically assessed against monthly salary',
      'For company banquet catering expenses and optional recreational team-building contributions',
    ],
    correctIndex: 0,
    statute: 'Art. 113, Labor Code',
    explanation: 'Art. 113 strictly limits lawful deductions to: (a) insurance premiums with employee consent, (b) union check-off dues, and (c) cases where employer is authorized by law or DOLE regulations.',
  },
  {
    id: 'pw10',
    worldCode: 'w3',
    headline: 'Service Charges Payout Frequency Under R.A. 11360',
    prompt: 'Under the Implementing Rules of R.A. 11360, how often must the 100% service charges collected by restaurants and hotels be distributed to covered employees?',
    options: [
      'Completely and equally at least once every two (2) weeks or twice monthly (interval <= 16 days)',
      'Annually every December together with statutory 13th month pay and year-end performance bonus',
      'Quarterly following formal reconciliation and submission of BIR quarterly tax return sheets',
      'Daily in cash at shift conclusion minus five percent administrative credit card surcharge',
    ],
    correctIndex: 0,
    statute: 'DOLE D.O. 206-19 Sec. 3',
    explanation: 'Service charges must be distributed completely and equally at least once every two (2) weeks or twice a month at intervals not exceeding 16 days.',
  },
  {
    id: 'pw11',
    worldCode: 'w3',
    headline: '13th Month Pay Coverage: Resigned & Terminated Workers',
    prompt: 'An employee resigned on August 31 after working 8 months of the calendar year. Is she entitled to receive 13th Month Pay?',
    options: [
      'Yes — entitled to proportionate 13th month pay (1/12 of basic salary earned in the 8 months)',
      'No — voluntary resignation forfeits all statutory 13th month pay benefits for calendar year',
      'Only if she rendered at least ten (10) active consecutive months of service in calendar year',
      'Only if termination was involuntary retrenchment or closure rather than voluntary departure',
    ],
    correctIndex: 0,
    statute: 'P.D. 851 Revised Guidelines Sec. 6',
    explanation: 'An employee who resigned or whose services were terminated at any time before the time of payment of 13th month pay is entitled to proportionate 13th month pay (1/12 of basic salary earned).',
  },
  {
    id: 'pw12',
    worldCode: 'w3',
    headline: 'Prohibition Against Attorney’s Fees in Wage Recovery (Art. 111)',
    prompt: 'Under Art. 111 of the Labor Code, what is the statutory ceiling on attorney’s fees in cases of unlawful withholding of wages?',
    options: [
      'Maximum ten percent (10%) of the total amount of wages recovered in the labor proceedings',
      'Maximum twenty-five percent (25%) of the cumulative monetary award assessed by arbiter',
      'Maximum thirty-three percent (33%) contingency fee as stipulated in retainer agreement',
      'No statutory ceiling; determined solely by market negotiation between lawyer and client',
    ],
    correctIndex: 0,
    statute: 'Art. 111, Labor Code',
    explanation: 'In cases of unlawful withholding of wages, culpable attorney’s fees assessed against the employer shall not exceed ten percent (10%) of the total amount of wages recovered.',
  },
  {
    id: 'pw13',
    worldCode: 'w3',
    headline: 'BMBE Minimum Wage Exemption (R.A. 9178)',
    prompt: 'Under Republic Act No. 9178 (Barangay Micro Business Enterprises Act), what exemption is granted to registered BMBEs with assets under ₱3M?',
    options: [
      'Exemption from the statutory minimum wage, while remaining bound to provide SSS, PhilHealth & Pag-IBIG',
      'Exemption from all labor standards laws, including mandatory safety and overtime standards',
      'Exemption from payment of 13th month pay and maternity leave benefits',
      'Registered BMBEs are not exempt from any minimum wage orders under Philippine law',
    ],
    correctIndex: 0,
    statute: 'Sec. 8, R.A. 9178 (BMBE Act of 2002)',
    explanation: 'R.A. 9178 exempts registered BMBEs from the coverage of the Minimum Wage Law, but workers remain entitled to standard social security, health, and other statutory welfare benefits.',
  },
  {
    id: 'pw14',
    worldCode: 'w4',
    headline: 'Kasambahay Free Food and Lodging Mandate (R.A. 10361)',
    prompt: 'Can an employer deduct ₱2,000 monthly from a domestic worker\'s minimum wage for lodging and meals provided inside the household?',
    options: [
      'Illegal — Sec. 14 of R.A. 10361 requires employers to provide basic necessities (food, lodging) free of charge',
      'Lawful — employers may deduct up to thirty percent of minimum wage for residential room and board',
      'Lawful — provided the domestic worker signed a written agreement acknowledging the food charges',
      'Illegal only if the domestic worker is employed in a chartered city outside Metro Manila',
    ],
    correctIndex: 0,
    statute: 'Sec. 14, R.A. 10361 (Batas Kasambahay)',
    explanation: 'Section 14 of Batas Kasambahay explicitly provides that the employer shall provide for the basic necessities of the domestic worker, including at least 3 meals a day and humane sleeping quarters, at zero charge.',
  },
  {
    id: 'pw15',
    worldCode: 'w4',
    headline: 'Kasambahay SSS / PhilHealth Premium Burden Under ₱5,000',
    prompt: 'If a Kasambahay earns less than ₱5,000 per month, who is legally obligated to shoulder the statutory SSS, PhilHealth, and Pag-IBIG contributions?',
    options: [
      'The household employer shoulders one hundred percent (100%) of all contributions without salary deduction',
      'The contributions are split fifty-fifty (50/50) between the household employer and domestic worker',
      'The domestic worker pays one hundred percent of contributions through voluntary individual billing',
      'Domestic workers earning below ₱5,000 are completely exempt from social security registration',
    ],
    correctIndex: 0,
    statute: 'Sec. 30, R.A. 10361',
    explanation: 'Under Batas Kasambahay Sec. 30, if the domestic worker is paid less than ₱5,000 per month, all SSS, PhilHealth, and Pag-IBIG contributions shall be paid entirely by the household employer.',
  },
  {
    id: 'pw16',
    worldCode: 'w3',
    headline: 'Facilities vs Supplements Purpose Test (Mabeza Doctrine)',
    prompt: 'Under the Purpose Test in Mabeza v. NLRC, how do we distinguish deductible Facilities from non-deductible Supplements?',
    options: [
      'If primarily for employee benefit, it is a Facility; if for employer business convenience, it is a Supplement',
      'If given in cash, it is a Supplement; if given in goods or lodging, it is a Facility',
      'If valued above five hundred pesos, it is a Supplement; below five hundred, it is a Facility',
      'The distinction depends entirely on the designation written by the company accountant on the voucher',
    ],
    correctIndex: 0,
    statute: 'Mabeza v. NLRC (G.R. No. 118506)',
    explanation: 'The Supreme Court ruled that under the Purpose Test, items necessary for the business of the employer (like uniforms or meals during overtime) are Supplements and cannot be deducted from wages.',
  },
  {
    id: 'pw17',
    worldCode: 'w3',
    headline: 'Three Requisites to Deduct Facilities from Minimum Wage',
    prompt: 'What three strict requirements must concur before an employer may lawfully deduct the cost of meals or lodging from wages as a Facility?',
    options: [
      'Customary in trade + Voluntary written acceptance by employee + Fair and reasonable valuation',
      'Verbal notification + Supervisor approval + Market price calculation from local supermarkets',
      'Filing a notice with DOLE + Withholding fifty percent of wages + Sworn employer affidavit',
      'Corporate board resolution + Audited loss statement + Minimum two years company service',
    ],
    correctIndex: 0,
    statute: 'Art. 97(f), Labor Code; SLL International Cables v. NLRC',
    explanation: 'Before the value of facilities can be deducted from minimum wage: (1) proof that it is customary in trade; (2) voluntary written acceptance; and (3) fair and reasonable valuation proven by records.',
  },
  {
    id: 'pw18',
    worldCode: 'w3',
    headline: 'Payment of Wages in Supermarket Tokens (Art. 102)',
    prompt: 'A factory pays 30% of workers\' weekly wages in supermarket vouchers redeemable only at the owner\'s grocery store. Lawful or Illegal?',
    options: [
      'Illegal — Art. 102 strictly mandates payment in legal tender; chits, tokens, and vouchers are banned',
      'Lawful — vouchers for basic foodstuffs satisfy the statutory purpose of nutritional subsistence',
      'Lawful — provided the supermarket prices are discounted by at least ten percent below market',
      'Illegal only if the grocery store runs out of inventory on payday afternoon',
    ],
    correctIndex: 0,
    statute: 'Art. 102, Labor Code',
    explanation: 'Article 102 explicitly penalizes payment of wages via chits, vouchers, tokens, or tickets. All wages must be paid in legal tender under penalty of law.',
  },
  {
    id: 'pw19',
    worldCode: 'w3',
    headline: 'Direct Payment Exception for Force Majeure (Art. 105)',
    prompt: 'Under what specific circumstances may an employer disburse an employee\'s wages to another person without written authority?',
    options: [
      'In cases of force majeure rendering personal payment impossible, or where worker authorized family',
      'Whenever the employee is assigned to an offshore fishing vessel for more than thirty days',
      'Whenever the employee\'s spouse presents an original marriage contract and family photo',
      'Direct payment exceptions never exist under any circumstance under Philippine jurisprudence',
    ],
    correctIndex: 0,
    statute: 'Art. 105, Labor Code',
    explanation: 'Under Art. 105, wages must be paid directly to the worker, except in cases of force majeure where the worker cannot report, or where payment to family members is authorized under DOLE rules.',
  },
  {
    id: 'pw20',
    worldCode: 'w3',
    headline: 'Statutory Minimum Wage Tax Exemption (R.A. 9504)',
    prompt: 'Under Republic Act No. 9504, what tax exemption is guaranteed to statutory minimum wage earners in the Philippines?',
    options: [
      '100% exempt from income tax on basic minimum wage, holiday pay, overtime pay, and night differential',
      'Exempt from basic wage tax, but fully taxed on overtime and night shift differential earnings',
      'Exempt from income tax only if the minimum wage earner has three or more dependent children',
      'Subject to a flat five percent simplified withholding tax collected by the employer monthly',
    ],
    correctIndex: 0,
    statute: 'R.A. 9504 (Tax Exemption of Minimum Wage Earners)',
    explanation: 'R.A. 9504 exempts statutory minimum wage earners from income tax not only on their basic minimum wage, but also on their overtime pay, holiday pay, night shift differential, and hazard pay.',
  },
  {
    id: 'pw21',
    worldCode: 'w3',
    headline: '₱90,000 Tax-Exempt Ceiling on 13th Month Pay (TRAIN Law)',
    prompt: 'Under the TRAIN Law (Republic Act No. 10963), what is the statutory ceiling on tax-exempt 13th Month Pay and other benefits?',
    options: [
      'Up to ninety thousand pesos (₱90,000) total per calendar year',
      'Up to eighty-two thousand pesos (₱82,000) total per calendar year',
      'Up to fifty thousand pesos (₱50,000) total per calendar year',
      'One hundred thousand pesos (₱100,000) total per fiscal year',
    ],
    correctIndex: 0,
    statute: 'R.A. 10963 (TRAIN Law amending Sec. 32(B)(7)(e) of Tax Code)',
    explanation: 'The TRAIN Law raised the tax-exempt threshold for 13th month pay and other productivity bonuses from ₱82,000 to ninety thousand pesos (₱90,000).',
  },
  {
    id: 'pw22',
    worldCode: 'w2',
    headline: 'Standard Pineda Formula for Wage Distortion',
    prompt: 'What is the mathematically recognized Pineda / NWPC formula used to resolve wage distortion across salary grades?',
    options: [
      'Adjusted Wage = (Previous Minimum Wage ÷ Present Wage) × Mandated Statutory Increase',
      'Adjusted Wage = Present Wage + Flat ₱500 company across-the-board bonus adjustment',
      'Adjusted Wage = Gross Salary multiplied by the prevailing regional inflation index',
      'Adjusted Wage = Minimum Wage multiplied by the total number of tenured years rendered',
    ],
    correctIndex: 0,
    statute: 'NWPC Guidelines; Pineda Wage Distortion Formula',
    explanation: 'The Pineda Formula restores the wage hierarchy: (Previous Minimum Wage / Present Wage) × Mandated Increase. This preserves proportional wage differences between grades.',
  },
  {
    id: 'pw23',
    worldCode: 'w2',
    headline: 'Non-Diminution Benefit Ripening Standard',
    prompt: 'Under Supreme Court jurisprudence, how long must an employer grant a discretionary benefit before it ripens into an unalterable company practice under Art. 100?',
    options: [
      'A considerable period of time (typically 2 to 3 years or more), given voluntarily and consistently',
      'Exactly six (6) months of continuous disbursement matching probationary employment cycles',
      'A minimum of ten (10) consecutive years regardless of whether granted through legal error',
      'Any benefit given even once automatically becomes an irreversible statutory right forever',
    ],
    correctIndex: 0,
    statute: 'Art. 100, Labor Code; Sevilla Trading Co. v. A.V.A. Semana',
    explanation: 'To ripen into company practice, the benefit must be shown by substantial evidence to have been granted on more than one occasion over a significant period of time (usually 2-3 years) voluntarily.',
  },
  {
    id: 'pw24',
    worldCode: 'w2',
    headline: 'Correction of Legal Error in Benefits (Hinatuan Mining)',
    prompt: 'An employer erroneously computed holiday pay using 250% instead of 200% for 3 years due to an accounting oversight. Can the employer correct the error?',
    options: [
      'Yes — non-diminution does not apply to benefits given through an error in the construction of a doubtful law',
      'No — once paid for three years, even computational errors become unalterable permanent benefits',
      'The employer can correct the error only if authorized by a unanimous vote of the labor union',
      'Correction is allowed only if the employer refunds fifty percent of all previous overpayments',
    ],
    correctIndex: 0,
    statute: 'Hinatuan Mining Corp. v. NLRC; Globe Mackay Cable v. NLRC',
    explanation: 'The rule on non-diminution does not apply where the grant was founded on an error or mistake in the construction or application of a doubtful or difficult question of law.',
  },
  {
    id: 'pw25',
    worldCode: 'w3',
    headline: 'Service Charge 85/15 Sharing Abolition (R.A. 11360)',
    prompt: 'What was the legal distribution formula for collected service charges under Article 96 prior to its amendment by Republic Act No. 11360?',
    options: [
      '85% to rank-and-file employees and 15% retained by management for breakages and losses',
      '50% to kitchen employees and 50% retained by restaurant management executives',
      '75% to all floor staff and 25% paid as municipal commercial hospitality tax',
      '100% was retained by the employer with zero mandatory distribution to workers',
    ],
    correctIndex: 0,
    statute: 'Art. 96 (Prior to R.A. 11360 amendment)',
    explanation: 'Before R.A. 11360 mandated 100% equal distribution to workers, Article 96 allocated 85% to rank-and-file workers and 15% to management to answer for losses, breakages, and distribution to managers.',
  },
  {
    id: 'pw26',
    worldCode: 'w3',
    headline: 'Frequency of Service Charge Distribution (R.A. 11360)',
    prompt: 'Under the implementing rules of R.A. 11360, how frequently must hotels and dining establishments distribute collected service charges?',
    options: [
      'Completely and equally at least once every two (2) weeks or twice a month',
      'Once every calendar quarter matching national corporate tax filing deadlines',
      'Once a year on or before December 24 bundled together with 13th month pay',
      'Within forty-eight hours of collection at the close of every business banking day',
    ],
    correctIndex: 0,
    statute: 'DOLE D.O. 206-19 Sec. 3',
    explanation: 'The implementing rules of R.A. 11360 provide that collected service charges shall be distributed completely and equally at least once every two (2) weeks or twice a month to covered employees.',
  },
  {
    id: 'pw27',
    worldCode: 'w3',
    headline: '30-Day Mandatory Release of Final Pay (DOLE L.A. 06-20)',
    prompt: 'Under DOLE Labor Advisory No. 06-20, within what statutory timeframe must an employer release the final pay of a resigned or separated employee?',
    options: [
      'Within thirty (30) calendar days from the date of separation or termination of employment',
      'Within fifteen (15) working days from the date the worker submits a draft clearance form',
      'Within sixty (60) days matching standard corporate financial audit reporting windows',
      'Employers have unlimited time until an ongoing DOLE compliance inspection concludes',
    ],
    correctIndex: 0,
    statute: 'DOLE Labor Advisory No. 06-20',
    explanation: 'Labor Advisory No. 06-20 mandates that final pay shall be released within 30 days from the date of separation, unless there is a more favorable company policy, individual contract, or CBA.',
  },
  {
    id: 'pw28',
    worldCode: 'w3',
    headline: 'Barter and In-Kind Wage Prohibition (Art. 102)',
    prompt: 'An agricultural employer pays banana plantation harvesters in bunches of export bananas instead of cash wages. Is this practice valid?',
    options: [
      'Illegal — Article 102 strictly prohibits payment of wages in kind or barter; all wages must be legal tender',
      'Lawful — agricultural workers may be compensated in harvest produce if authorized by barangay captain',
      'Lawful — provided the retail market price of the bananas exceeds the regional minimum wage rate',
      'Illegal only if the bananas are damaged or bruised during harvesting and transport',
    ],
    correctIndex: 0,
    statute: 'Art. 102, Labor Code; Congson v. NLRC',
    explanation: 'Article 102 explicitly prohibits paying wages by means of chits, vouchers, or any object other than legal tender. Paying agricultural workers in agricultural produce or barter is strictly illegal.',
  },
];

interface ThematicRoyalGameVisualizerProps {
  gameTitle: string;
  stageNum: number;
  totalStages: number;
  options: string[];
  pickedOption: number | null;
  correctIndex: number;
  onPickOption: (idx: number) => void;
  streak: number;
  eliminatedIndices: Set<number>;
}

const ThematicRoyalGameVisualizer: React.FC<ThematicRoyalGameVisualizerProps> = ({
  gameTitle,
  stageNum,
  totalStages,
  options,
  pickedOption,
  correctIndex,
  onPickOption,
  streak,
  eliminatedIndices,
}) => {
  const [mineRailTrack, setMineRailTrack] = useState<number>(0);
  const [derbyLane, setDerbyLane] = useState<number>(0);
  const [derbyGear, setDerbyGear] = useState<'1st' | '2nd' | '3rd' | '4th Turbo'>('2nd');
  const [activeRuneSocket, setActiveRuneSocket] = useState<number>(0);
  const [concertLane, setConcertLane] = useState<number>(0);
  const [actionPulse, setActionPulse] = useState(false);

  // 1. Captain Toad's Kasambahay Subterranean Minecart Runner
  if (gameTitle.includes('Toad') || gameTitle.includes('Minecart')) {
    const handleSwitchTrack = (trackIdx: number) => {
      setMineRailTrack(trackIdx);
      marioAudio.playClick();
      setActionPulse(true);
      setTimeout(() => setActionPulse(false), 500);
    };

    const handleEngageMinecart = (trackIdx: number) => {
      setMineRailTrack(trackIdx);
      marioAudio.playPowerUp();
      onPickOption(trackIdx);
    };

    return (
      <div className="bg-slate-900 border-3 border-amber-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        {/* Minecart Cockpit HUD */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-500 border-2 border-black shadow-[0_3px_0_#000]">
              <Pickaxe className="w-5 h-5 text-slate-950 shrink-0" />
            </div>
            <div>
              <span className="font-mario text-[11px] text-amber-300 uppercase block">
                Captain Toad Kasambahay Minecart · Tunnel #{stageNum + 1}/{totalStages}
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Depth: {stageNum * 85 + 150}m · Cavern Rails Active
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-full justify-start sm:justify-end">
            {options.map((_, tIdx) => (
              <button
                key={tIdx}
                type="button"
                onClick={() => handleSwitchTrack(tIdx)}
                className={`min-h-[30px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-mono text-[10px] font-black border cursor-pointer transition-all shrink-0 ${
                  mineRailTrack === tIdx
                    ? 'bg-amber-400 text-slate-950 border-black shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">Track </span>{String.fromCharCode(65 + tIdx)}
              </button>
            ))}
          </div>
        </div>

        {/* 3D-styled Cavern Runner Rail Visualizer */}
        <div className="relative bg-gradient-to-b from-amber-950 via-slate-950 to-stone-950 rounded-2xl border-2 border-amber-600/60 p-3.5 overflow-hidden flex flex-col justify-between gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-2xl bg-amber-400 border-2 border-black shadow-[0_3px_0_#000] transition-transform ${
                  actionPulse ? 'scale-110 -rotate-6' : ''
                }`}
              >
                <MarioCharacterAvatar character="capttoad" className="w-8 h-8" />
              </div>
              <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-amber-400/50 text-xs font-bold text-amber-200">
                <span>Steer Captain Toad into the lawful Kasambahay statutory gem track below!</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-black/80 px-2.5 py-1 rounded-lg border border-slate-700 text-xs font-mono text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
              <span>GEM RADAR ONLINE</span>
            </div>
          </div>

          {/* Animated 4-Lane Minecart Cavern Rail Yard */}
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-2.5 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-amber-300 px-1">
              <span className="uppercase tracking-wider font-bold">Minecart Rail Shaft · Active Switch: Track {String.fromCharCode(65 + mineRailTrack)}</span>
              <span className="text-cyan-300 font-bold">{actionPulse ? '>>> MINE TURBO ACTIVE' : 'Shaft Ready'}</span>
            </div>
            <div className="space-y-1.5 py-1">
              {options.map((_, rIdx) => {
                const isCartHere = mineRailTrack === rIdx;
                const isGemTrack = rIdx === correctIndex;
                const isPicked = pickedOption === rIdx;
                return (
                  <div
                    key={rIdx}
                    onClick={() => {
                      if (pickedOption === null && !eliminatedIndices.has(rIdx)) {
                        handleSwitchTrack(rIdx);
                      }
                    }}
                    className={`min-h-[32px] h-auto rounded-lg border flex items-center justify-between px-2.5 py-1 transition-all relative overflow-hidden cursor-pointer ${
                      isCartHere
                        ? 'bg-amber-950/90 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                        : 'bg-black/60 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {/* Trestle Rails & Sleepers */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none bg-[repeating-linear-gradient(90deg,transparent,transparent_8px,#f59e0b_8px,#f59e0b_10px)]" />

                    <div className="flex items-center gap-2 relative z-10">
                      <span className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center border ${
                        isCartHere ? 'bg-amber-400 text-slate-950 border-black' : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}>
                        {String.fromCharCode(65 + rIdx)}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-slate-300">
                        Shaft Track {String.fromCharCode(65 + rIdx)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                      {isCartHere && (
                        <div className="flex items-center gap-1.5 bg-amber-500/30 px-2 py-0.5 rounded border border-amber-400/60 animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                          <span className="text-[9px] font-mario text-amber-200">
                            {actionPulse ? 'TURBO SPEED!' : 'MINECART ROLLING'}
                          </span>
                        </div>
                      )}
                      {pickedOption !== null && isGemTrack && (
                        <span className="text-[9px] font-mario text-slate-950 bg-amber-300 px-2 py-0.5 rounded whitespace-nowrap">
                          GEM!
                        </span>
                      )}
                      {pickedOption !== null && isPicked && !isGemTrack && (
                        <span className="text-[9px] font-mario text-rose-300 bg-black/80 px-2 py-0.5 rounded border border-rose-500 whitespace-nowrap">
                          DEAD END
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Arcade Primary Controller: Accelerate Minecart */}
          <div className="pt-1">
            <button
              type="button"
              disabled={pickedOption !== null || eliminatedIndices.has(mineRailTrack)}
              onClick={() => handleEngageMinecart(mineRailTrack)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer font-mario text-xs sm:text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pickaxe className="w-5 h-5 fill-current animate-bounce shrink-0" />
              <span className="break-normal">ACCELERATE NITRO MINECART ON SHAFT TRACK {String.fromCharCode(65 + mineRailTrack)}</span>
            </button>
          </div>

          {/* 4 Interactive Full-Width Mine Rail Choices (Zero letter cutting or horizontal badge squeezing) */}
          <div className="space-y-2.5">
            {options.map((opt, i) => {
              const isEliminated = eliminatedIndices.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              const isFocused = mineRailTrack === i;
              let trackStyle =
                'bg-slate-950/95 hover:bg-amber-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                trackStyle =
                  'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
                if (isRight) {
                  trackStyle =
                    'bg-amber-400 text-slate-950 border-black ring-2 ring-amber-200 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)]';
                } else if (isSelected) {
                  trackStyle = 'bg-rose-600 text-white border-black';
                } else {
                  trackStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              } else if (isFocused) {
                trackStyle =
                  'bg-amber-950/90 border-amber-400 text-amber-100 ring-2 ring-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => !isEliminated && handleEngageMinecart(i)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer block ${trackStyle}`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-black text-amber-300 font-mario text-xs flex items-center justify-center shrink-0 border border-slate-700">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wide break-words [overflow-wrap:anywhere]">
                        Shaft Track #{String.fromCharCode(65 + i)} {isFocused ? '· [JUNCTION ARMED]' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEliminated && (
                        <span className="text-[9px] font-mario text-rose-400 bg-black/80 px-2 py-0.5 rounded border border-rose-600 whitespace-nowrap">ZAPPED!</span>
                      )}
                      {pickedOption !== null && isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-slate-950 bg-amber-300 px-2.5 py-1 rounded border border-amber-100 shadow-[0_0_8px_rgba(245,158,11,0.8)] whitespace-nowrap">
                          GEM COLLECTED!
                        </span>
                      )}
                      {pickedOption !== null && isSelected && !isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-rose-300 bg-black/90 px-2.5 py-1 rounded border border-rose-500 whitespace-nowrap">
                          CRASHED!
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full">
                    <p className="text-xs sm:text-sm font-bold leading-relaxed break-normal [overflow-wrap:break-word] text-slate-100 text-left">
                      {opt}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 2. Princess Daisy's Grand Prix Holiday Derby
  if (gameTitle.includes('Daisy') || gameTitle.includes('Derby')) {
    const derbyGears = ['1st', '2nd', '3rd', '4th Turbo'] as const;
    const handleSprintGate = (gateIdx: number) => {
      setDerbyLane(gateIdx);
      marioAudio.playPowerUp();
      onPickOption(gateIdx);
    };

    return (
      <div className="bg-slate-900 border-3 border-rose-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-orange-400 border-2 border-black shadow-[0_3px_0_#000]">
              <Flag className="w-5 h-5 text-slate-950 shrink-0" />
            </div>
            <div>
              <span className="font-mario text-[11px] text-rose-300 uppercase block">
                Daisy Sarasaland Holiday Derby · Hurdle Lap #{stageNum + 1}/{totalStages}
              </span>
              <span className="text-[10px] font-mono text-orange-300">
                Holiday Multiplier Sprint Track · Speed: {derbyGear}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {derbyGears.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setDerbyGear(g);
                  marioAudio.playClick();
                }}
                className={`px-2 py-0.5 rounded font-mono text-[10px] font-black border cursor-pointer ${
                  derbyGear === g
                    ? 'bg-orange-400 text-slate-950 border-black'
                    : 'bg-slate-950 text-rose-200 border-rose-500/50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-rose-950 via-slate-950 to-orange-950 rounded-2xl border-2 border-rose-600/60 p-3.5 overflow-hidden flex flex-col justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-2xl bg-orange-400 border-2 border-black shadow-[0_3px_0_#000] shrink-0">
                <MarioCharacterAvatar character="daisy" className="w-8 h-8" />
              </div>
              <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-rose-400/50 text-xs font-bold text-rose-200 min-w-0">
                <span className="break-words">Select and clear the lawful statutory holiday multiplier hurdle gate!</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-full justify-start sm:justify-end">
              {options.map((_, gIdx) => (
                <button
                  key={gIdx}
                  type="button"
                  onClick={() => {
                    setDerbyLane(gIdx);
                    marioAudio.playClick();
                  }}
                  className={`min-h-[30px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer shrink-0 ${
                    derbyLane === gIdx
                      ? 'bg-orange-400 text-slate-950 border-black'
                      : 'bg-black/70 text-rose-300 border-rose-600/40 hover:text-white'
                  }`}
                >
                  <span className="hidden sm:inline">Gate </span>{String.fromCharCode(65 + gIdx)}
                </button>
              ))}
            </div>
          </div>

          {/* Live Racing Tachometer & Speedometer Cockpit HUD */}
          <div className="bg-black/80 rounded-xl p-2.5 border border-rose-500/40 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-orange-400" />
              <span className="font-mono text-xs font-black text-amber-300">
                {derbyGear === '4th Turbo' ? '185 KPH · NITRO BOOST' : `${80 + stageNum * 15} KPH · SPRINT`}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] font-mono font-bold text-rose-300 uppercase mr-1">RPM:</span>
              {[1, 2, 3, 4, 5, 6].map((bar) => (
                <div
                  key={bar}
                  className={`w-2 h-3.5 rounded-xs transition-all ${
                    bar <= (derbyGear === '4th Turbo' ? 6 : 4)
                      ? bar >= 5
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-orange-400'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Action Arcade Primary Controller: Hit Turbo Accelerator */}
          <div className="pt-1">
            <button
              type="button"
              disabled={pickedOption !== null || eliminatedIndices.has(derbyLane)}
              onClick={() => handleSprintGate(derbyLane)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-black border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer font-mario text-xs sm:text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-5 h-5 fill-current animate-bounce shrink-0" />
              <span className="break-normal">HIT TURBO BOOST &amp; SPRINT THROUGH GATE {String.fromCharCode(65 + derbyLane)}</span>
            </button>
          </div>

          {/* 4 Interactive Full-Width Derby Hurdle Lanes (Zero letter cutting or horizontal badge squeezing) */}
          <div className="space-y-2.5">
            {options.map((opt, i) => {
              const isEliminated = eliminatedIndices.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              const isFocused = derbyLane === i;
              let hurdleStyle =
                'bg-slate-950/95 hover:bg-rose-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                hurdleStyle =
                  'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
                if (isRight) {
                  hurdleStyle =
                    'bg-orange-500 text-slate-950 border-black ring-2 ring-orange-300 font-black shadow-[0_0_12px_rgba(249,115,22,0.8)]';
                } else if (isSelected) {
                  hurdleStyle = 'bg-rose-600 text-white border-black';
                } else {
                  hurdleStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              } else if (isFocused) {
                hurdleStyle =
                  'bg-rose-950/90 border-orange-400 text-orange-100 ring-2 ring-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.5)]';
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => !isEliminated && handleSprintGate(i)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer block ${hurdleStyle}`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-black text-rose-300 font-mario text-xs flex items-center justify-center shrink-0 border border-slate-700">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-rose-300 uppercase tracking-wide break-words [overflow-wrap:anywhere]">
                        Sarasaland Hurdle Lane #{String.fromCharCode(65 + i)} {isFocused ? '· [SPRINT LANE]' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEliminated && (
                        <span className="text-[9px] font-mario text-rose-400 bg-black/80 px-2 py-0.5 rounded border border-rose-600 whitespace-nowrap">ZAPPED!</span>
                      )}
                      {pickedOption !== null && isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-slate-950 bg-orange-300 px-2.5 py-1 rounded border border-orange-100 shadow-[0_0_8px_rgba(249,115,22,0.8)] whitespace-nowrap">
                          HURDLE CLEARED!
                        </span>
                      )}
                      {pickedOption !== null && isSelected && !isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-rose-300 bg-black/90 px-2.5 py-1 rounded border border-rose-500 whitespace-nowrap">
                          TRIPPED!
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full">
                    <p className="text-xs sm:text-sm font-bold leading-relaxed break-normal [overflow-wrap:break-word] text-slate-100 text-left">
                      {opt}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 3. Dry Bones Crypt of Twin-Notice & Deadlines
  if (gameTitle.includes('Dry Bones') || gameTitle.includes('Crypt')) {
    const handleSocketRune = (socketIdx: number) => {
      setActiveRuneSocket(socketIdx);
      marioAudio.playPowerUp();
      onPickOption(socketIdx);
    };

    return (
      <div className="bg-slate-900 border-3 border-purple-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-purple-600 border-2 border-black shadow-[0_3px_0_#000]">
              <Skull className="w-5 h-5 text-white shrink-0" />
            </div>
            <div>
              <span className="font-mario text-[11px] text-purple-300 uppercase block">
                Dry Bones Crypt · Prescriptive Sarcophagus Chamber #{stageNum + 1}/{totalStages}
              </span>
              <span className="text-[10px] font-mono text-cyan-300">
                Statutory Runestones &amp; Portcullis Wards Active
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-purple-500/50 text-xs font-mono text-purple-300">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>WARD ONLINE</span>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-purple-950 via-slate-950 to-indigo-950 rounded-2xl border-2 border-purple-600/60 p-3.5 overflow-hidden flex flex-col justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-2xl bg-purple-500 border-2 border-black shadow-[0_3px_0_#000] shrink-0">
                <Skull className="w-8 h-8 text-white" />
              </div>
              <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-purple-400/50 text-xs font-bold text-purple-200 min-w-0">
                <span className="break-words">Socket the controlling prescriptive runestone to raise the crypt portcullis!</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-full justify-start sm:justify-end">
              {options.map((_, sIdx) => (
                <button
                  key={sIdx}
                  type="button"
                  onClick={() => {
                    setActiveRuneSocket(sIdx);
                    marioAudio.playClick();
                  }}
                  className={`min-h-[30px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer shrink-0 ${
                    activeRuneSocket === sIdx
                      ? 'bg-purple-400 text-slate-950 border-black'
                      : 'bg-black/70 text-purple-300 border-purple-600/40 hover:text-white'
                  }`}
                >
                  <span className="hidden sm:inline">Socket </span>{String.fromCharCode(65 + sIdx)}
                </button>
              ))}
            </div>
          </div>

          {/* Ancient Crypt Altar & Torchlight Visualizer */}
          <div className="bg-black/80 rounded-xl p-2.5 border border-purple-500/40 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-purple-400 animate-pulse" />
              <span className="font-mono text-xs font-black text-purple-300">
                ACTIVE STATUTORY WARD #{String.fromCharCode(65 + activeRuneSocket)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
              <span className="text-[10px] font-mario text-amber-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-600/50">
                SEAL ALIGNED
              </span>
            </div>
          </div>

          {/* Action Arcade Primary Controller: Socket Runestone */}
          <div className="pt-1">
            <button
              type="button"
              disabled={pickedOption !== null || eliminatedIndices.has(activeRuneSocket)}
              onClick={() => handleSocketRune(activeRuneSocket)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-500 to-purple-400 hover:from-purple-500 hover:to-indigo-400 text-white font-black border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer font-mario text-xs sm:text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Skull className="w-5 h-5 fill-current animate-bounce shrink-0" />
              <span className="break-normal">CRANK CRYPT KEY &amp; SOCKET RUNESTONE ON ALTAR {String.fromCharCode(65 + activeRuneSocket)}</span>
            </button>
          </div>

          {/* 4 Interactive Full-Width Crypt Stone Sockets (Zero letter cutting or horizontal badge squeezing) */}
          <div className="space-y-2.5">
            {options.map((opt, i) => {
              const isEliminated = eliminatedIndices.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              const isFocused = activeRuneSocket === i;
              let cryptStyle =
                'bg-slate-950/95 hover:bg-purple-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                cryptStyle =
                  'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
                if (isRight) {
                  cryptStyle =
                    'bg-purple-600 text-white border-black ring-2 ring-purple-300 font-black shadow-[0_0_12px_rgba(168,85,247,0.8)]';
                } else if (isSelected) {
                  cryptStyle = 'bg-rose-600 text-white border-black';
                } else {
                  cryptStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              } else if (isFocused) {
                cryptStyle =
                  'bg-purple-950/90 border-purple-400 text-purple-100 ring-2 ring-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.5)]';
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => !isEliminated && handleSocketRune(i)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer block ${cryptStyle}`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-black text-purple-300 font-mario text-xs flex items-center justify-center shrink-0 border border-slate-700">
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-purple-300 uppercase tracking-wide break-words [overflow-wrap:anywhere]">
                        Prescriptive Crypt Socket #{String.fromCharCode(65 + i)} {isFocused ? '· [ALTAR ARMED]' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEliminated && (
                        <span className="text-[9px] font-mario text-rose-400 bg-black/80 px-2 py-0.5 rounded border border-rose-600 whitespace-nowrap">ZAPPED!</span>
                      )}
                      {pickedOption !== null && isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-emerald-300 bg-black/90 px-2.5 py-1 rounded border border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] whitespace-nowrap">
                          SOCKETED!
                        </span>
                      )}
                      {pickedOption !== null && isSelected && !isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-rose-300 bg-black/90 px-2.5 py-1 rounded border border-rose-500 whitespace-nowrap">
                          HAUNTED!
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-full">
                    <p className="text-xs sm:text-sm font-bold leading-relaxed break-normal [overflow-wrap:break-word] text-slate-100 text-left">
                      {opt}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 4. Mayor Pauline's Metro Wage Concert
  const handleHitBeatPad = (padIdx: number) => {
    setConcertLane(padIdx);
    marioAudio.playPowerUp();
    onPickOption(padIdx);
  };

  return (
    <div className="bg-slate-900 border-3 border-pink-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-500/40 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-pink-500 border-2 border-black shadow-[0_3px_0_#000]">
            <Music className="w-5 h-5 text-slate-950 shrink-0" />
          </div>
          <div>
            <span className="font-mario text-[11px] text-pink-300 uppercase block">
              Pauline Big Band Concert · Track #{stageNum + 1}/{totalStages}
            </span>
            <span className="text-[10px] font-mono text-pink-300">
              New Donk City Rooftop Rhythm Highway · {85 + stageNum * 5} dB
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-lg border border-pink-500/50 text-xs font-mono text-pink-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>RHYTHM HIGHWAY</span>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-pink-950 via-slate-950 to-amber-950 rounded-2xl border-2 border-pink-600/60 p-3.5 overflow-hidden flex flex-col justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-2xl bg-pink-500 border-2 border-black shadow-[0_3px_0_#000] shrink-0">
              <MarioCharacterAvatar character="pauline" className="w-8 h-8" />
            </div>
            <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-pink-400/50 text-xs font-bold text-pink-200 min-w-0">
              <span className="break-words">Strike the rhythm highway pad with the controlling wage doctrine on beat!</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-full justify-start sm:justify-end">
            {options.map((_, bIdx) => (
              <button
                key={bIdx}
                type="button"
                onClick={() => {
                  setConcertLane(bIdx);
                  marioAudio.playClick();
                }}
                className={`min-h-[30px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer shrink-0 ${
                  concertLane === bIdx
                    ? 'bg-pink-400 text-slate-950 border-black'
                    : 'bg-black/70 text-pink-300 border-pink-600/40 hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">Pad </span>{String.fromCharCode(65 + bIdx)}
              </button>
            ))}
          </div>
        </div>

        {/* Dancing 8-Band Neon Audio Equalizer Visualizer */}
        <div className="bg-black/85 rounded-xl p-2.5 border border-pink-500/40 flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 text-pink-400 animate-bounce" />
            <span className="font-mono text-xs font-black text-pink-300">
              BIG BAND FREQUENCY EQUALIZER
            </span>
          </div>
          <div className="flex items-end gap-1 h-5">
            {[45, 80, 60, 100, 75, 90, 50, 85].map((lvl, bIdx) => (
              <div
                key={bIdx}
                className="w-2 rounded-t bg-gradient-to-t from-pink-500 via-rose-400 to-amber-300 animate-pulse"
                style={{ height: `${lvl}%`, animationDelay: `${bIdx * 120}ms` }}
              />
            ))}
          </div>
        </div>

        {/* Action Arcade Primary Controller: Slam Beat Pad */}
        <div className="pt-1">
          <button
            type="button"
            disabled={pickedOption !== null || eliminatedIndices.has(concertLane)}
            onClick={() => handleHitBeatPad(concertLane)}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 text-slate-950 font-black border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer font-mario text-xs sm:text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Music className="w-5 h-5 fill-current animate-bounce" />
            <span>SLAM RHYTHM BEAT PAD: HIT NOTE ON PAD {String.fromCharCode(65 + concertLane)}</span>
          </button>
        </div>

        {/* 4 Interactive Concert Rhythm Pads - Full-Width Stacked Cards (Zero Vertical Letter Breaking) */}
        <div className="space-y-2.5">
          {options.map((opt, i) => {
            const isEliminated = eliminatedIndices.has(i);
            const isSelected = pickedOption === i;
            const isRight = i === correctIndex;
            const isFocused = concertLane === i;
            let concertStyle =
              'bg-slate-950/95 hover:bg-pink-950/80 border-slate-700 text-slate-100';
            if (isEliminated) {
              concertStyle =
                'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
            } else if (pickedOption !== null) {
              if (isRight) {
                concertStyle =
                  'bg-pink-500 text-slate-950 border-black ring-2 ring-pink-300 font-black shadow-[0_0_12px_rgba(236,72,153,0.8)]';
              } else if (isSelected) {
                concertStyle = 'bg-rose-600 text-white border-black';
              } else {
                concertStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
              }
            } else if (isFocused) {
              concertStyle =
                'bg-pink-950/90 border-pink-400 text-pink-100 ring-2 ring-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.5)]';
            }

            return (
              <button
                key={i}
                type="button"
                disabled={pickedOption !== null || isEliminated}
                onClick={() => !isEliminated && handleHitBeatPad(i)}
                className={`w-full p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer block ${concertStyle}`}
              >
                {/* Header Row: Pad Indicator + Result Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/10">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-black text-pink-300 font-mario text-xs flex items-center justify-center shrink-0 border border-slate-700">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-[10px] font-mario text-pink-300 uppercase tracking-wide truncate">
                      BEAT PAD #{String.fromCharCode(65 + i)}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    {isEliminated && (
                      <span className="text-[9px] font-mario text-rose-400 bg-black/60 px-2 py-0.5 rounded border border-rose-600/40">ZAPPED!</span>
                    )}
                    {pickedOption !== null && isRight && !isEliminated && (
                      <span className="text-[10px] font-mario text-slate-950 bg-pink-300 px-2.5 py-0.5 rounded shadow-sm">
                        PERFECT BEAT!
                      </span>
                    )}
                    {pickedOption !== null && isSelected && !isRight && !isEliminated && (
                      <span className="text-[10px] font-mario text-rose-300 bg-black/80 px-2 py-0.5 rounded border border-rose-500">
                        OFF-BEAT!
                      </span>
                    )}
                  </div>
                </div>

                {/* Option text given 100% full width to prevent any vertical letter breaking */}
                <div className="w-full">
                  <span className={`block text-xs sm:text-sm font-bold leading-relaxed break-normal [overflow-wrap:break-word] ${pickedOption !== null && isRight ? 'text-slate-950' : 'text-slate-100'}`}>
                    {opt}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
interface RoyalArcadeEngineProps extends RoyalVaultGameProps {
  deckKey: string;
  gameTitle: string;
  kickerBadge: string;
  description: string;
  bannerGradientClass: string;
  accentButtonClass: string;
  icon: React.ReactNode;
  bank: readonly MasterArcadeScenario[];
  victoryCoins: number;
  reportWorldCode: string;
}

const RoyalArcadeEngine: React.FC<RoyalArcadeEngineProps> = ({
  deckKey,
  equippedAvatar,
  onEarnCoins,
  onQuizCompleted,
  gameTitle,
  kickerBadge,
  description,
  bannerGradientClass,
  accentButtonClass,
  icon,
  bank,
  victoryCoins,
  reportWorldCode,
}) => {
  const [phase, setPhase] = useState<'READY' | 'PLAYING' | 'VICTORY' | 'GAME_OVER'>('READY');
  const [deck, setDeck] = useState<MasterArcadeScenario[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pickedOption, setPickedOption] = useState<number | null>(null);
  const [startedAtMs, setStartedAtMs] = useState<number>(() => Date.now());

  // Arcade Power-Ups & Speedrunner Engine
  const [mushroomUsesLeft, setMushroomUsesLeft] = useState(2);
  const [eliminatedIndices, setEliminatedIndices] = useState<Set<number>>(new Set());
  const [feverStars, setFeverStars] = useState(0);
  const [isFeverActive, setIsFeverActive] = useState(false);
  const [showRadarClue, setShowRadarClue] = useState(false);
  const [radarUsesLeft, setRadarUsesLeft] = useState(2);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [speedBonusAwarded, setSpeedBonusAwarded] = useState(false);
  const [shieldAbsorbedHit, setShieldAbsorbedHit] = useState(false);

  const startRun = useCallback(() => {
    const drawn = drawUniqueFromDeck(deckKey, bank, Math.min(5, bank.length)).map((item) => {
      const shuf = shuffleChoiceOptions(item.options, item.correctIndex);
      return {
        ...item,
        options: shuf.options,
        correctIndex: shuf.correctIndex,
      };
    });
    setDeck(drawn);
    setCurrentIdx(0);
    setHearts(3);
    setScore(0);
    setStreak(0);
    setPickedOption(null);
    setMushroomUsesLeft(2);
    setEliminatedIndices(new Set());
    setFeverStars(0);
    setIsFeverActive(false);
    setShowRadarClue(false);
    setRadarUsesLeft(2);
    setSecondsLeft(15);
    setSpeedBonusAwarded(false);
    setShieldAbsorbedHit(false);
    setStartedAtMs(Date.now());
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  }, [deckKey, bank]);

  const currentItem = deck[currentIdx];

  // Speedrunner 15s Countdown Clock
  useEffect(() => {
    if (phase !== 'PLAYING' || pickedOption !== null) return;
    if (secondsLeft <= 0) {
      handleChoose(-1);
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, pickedOption, secondsLeft]);

  // Global Arcade Cabinet Keyboard Action Controls (1-4, A-D, Z for Zap, R for Radar, Space for Next)
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      if (pickedOption === null) {
        if (key === '1' || key === 'a') {
          e.preventDefault();
          handleChoose(0);
        } else if (key === '2' || key === 'b') {
          e.preventDefault();
          handleChoose(1);
        } else if (key === '3' || key === 'c') {
          e.preventDefault();
          handleChoose(2);
        } else if (key === '4' || key === 'd') {
          e.preventDefault();
          handleChoose(3);
        } else if (key === 'z') {
          e.preventDefault();
          handleMushroomZap();
        } else if (key === 'r') {
          e.preventDefault();
          handleRadarClue();
        }
      } else {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleAdvance();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, pickedOption, currentItem, mushroomUsesLeft, eliminatedIndices, radarUsesLeft, showRadarClue, hearts, currentIdx, deck.length]);

  const handleMushroomZap = () => {
    if (mushroomUsesLeft <= 0 || !currentItem || pickedOption !== null || eliminatedIndices.size > 0) return;
    const wrongIndices = currentItem.options
      .map((_, i) => i)
      .filter((i) => i !== currentItem.correctIndex && !eliminatedIndices.has(i));
    if (wrongIndices.length === 0) return;
    const toZap = wrongIndices.slice(0, 2);
    setEliminatedIndices(new Set([...eliminatedIndices, ...toZap]));
    setMushroomUsesLeft((m) => Math.max(0, m - 1));
    marioAudio.playPowerUp();
  };

  const handleRadarClue = () => {
    if (radarUsesLeft <= 0 && !showRadarClue) return;
    if (pickedOption !== null) return;
    const next = !showRadarClue;
    setShowRadarClue(next);
    if (next) {
      setRadarUsesLeft((r) => Math.max(0, r - 1));
      marioAudio.playCoin();
    }
  };

  const handleChoose = (idx: number) => {
    if (pickedOption !== null || !currentItem) return;
    setPickedOption(idx);
    const isCorrect = idx === currentItem.correctIndex;
    const isFast = secondsLeft >= 8;

    if (isCorrect) {
      const nextStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(nextStreak);

      let coinReward = nextStreak >= 2 ? 4 : 3;
      if (isFast) {
        coinReward += 5;
        setSpeedBonusAwarded(true);
      }
      if (isFeverActive) {
        coinReward *= 2;
        setIsFeverActive(false);
        setFeverStars(0);
      } else {
        const nextStars = feverStars + 1;
        if (nextStars >= 3) {
          setIsFeverActive(true);
          setFeverStars(3);
          marioAudio.playPowerUp();
        } else {
          setFeverStars(nextStars);
        }
      }

      onEarnCoins?.(coinReward);
      awardUserXp({ amount: 25 + nextStreak * 5, reason: `${gameTitle} Stage Cleared` });
      if (nextStreak === 2) {
        marioAudio.playFireball();
      } else if (nextStreak >= 3) {
        marioAudio.playStarTheme();
      } else {
        marioAudio.playCoin();
      }
    } else {
      setStreak(0);
      if (isFeverActive) {
        setShieldAbsorbedHit(true);
        setIsFeverActive(false);
        setFeverStars(0);
        marioAudio.playPowerUp();
      } else {
        setHearts((h) => Math.max(0, h - 1));
        marioAudio.playWrongAnswer();
      }
    }
  };

  const handleAdvance = () => {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startedAtMs) / 1000));
    if (hearts <= 0) {
      setPhase('GAME_OVER');
      marioAudio.playGameOver();
      awardUserXp({ amount: 20, reason: `${gameTitle} Run Effort` });
      onQuizCompleted?.({
        mode: 'arcade_vault',
        correctCount: score,
        totalCount: deck.length,
        elapsedSeconds: elapsedSec,
        worldCode: reportWorldCode,
      });
      return;
    }

    if (currentIdx + 1 >= deck.length) {
      setPhase('VICTORY');
      onEarnCoins?.(victoryCoins);
      marioAudio.playFanfare();
      awardUserXp({ amount: 100, reason: `${gameTitle} Grand Championship Clear` });
      onQuizCompleted?.({
        mode: 'arcade_vault',
        correctCount: score,
        totalCount: deck.length,
        elapsedSeconds: elapsedSec,
        worldCode: reportWorldCode,
      });
      return;
    }

    setCurrentIdx((i) => i + 1);
    setPickedOption(null);
    setEliminatedIndices(new Set());
    setShowRadarClue(false);
    setSecondsLeft(15);
    setSpeedBonusAwarded(false);
    setShieldAbsorbedHit(false);
    marioAudio.playClick();
  };

  return (
    <div className="bg-slate-950 text-white rounded-3xl border-4 border-black shadow-[6px_6px_0_#000] overflow-hidden w-full max-w-full min-w-0">
      {/* Compact Responsive HUD Header */}
      <div className={`${bannerGradientClass} p-3.5 sm:p-5 border-b-3 border-black flex flex-wrap items-center justify-between gap-3`}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 border-2 border-black flex items-center justify-center shrink-0 shadow-[0_2px_0_#000]">
            {icon}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-amber-300 font-mario block break-words [overflow-wrap:anywhere]">
              {kickerBadge}
            </span>
            <h3 className="text-base sm:text-xl font-black font-display text-white break-words [overflow-wrap:anywhere]">
              {gameTitle}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black/60 border border-slate-700" aria-label={`${hearts} hearts remaining`}>
            {Array.from({ length: 3 }, (_, idx) => (
              <Heart
                key={idx}
                className={`w-4 h-4 ${
                  idx < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
                }`}
              />
            ))}
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center">
            <MarioCharacterAvatar character={equippedAvatar} className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Playable Stage */}
      <div className="p-4 sm:p-6">
        {phase === 'READY' && (
          <div className="text-center py-6 sm:py-8 space-y-4 max-w-xl mx-auto">
            <p className="text-xs sm:text-sm font-semibold text-slate-300 leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                data-start="true"
                onClick={startRun}
                className={`min-h-[48px] px-6 py-2.5 rounded-2xl font-black text-sm border-3 border-black shadow-[0_4px_0_#000] inline-flex items-center gap-2 cursor-pointer active:translate-y-0.5 ${accentButtonClass}`}
              >
                <Play className="w-4 h-4 fill-current shrink-0" />
                <span>Start 5-Stage Arcade Run (+{victoryCoins}c Clear Bonus)</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'PLAYING' && currentItem && (
          <div className="space-y-4">
            {/* Mini-Mario Interactive Stage Map Track */}
            <div className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-black uppercase text-amber-300 font-mario hidden sm:inline">
                  Course:
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-center min-w-0 px-1">
                {deck.map((_, idx) => {
                  const isPast = idx < currentIdx;
                  const isCurr = idx === currentIdx;
                  return (
                    <div key={idx} className="flex items-center gap-1 shrink-0">
                      <div
                        className={`flex items-center justify-center rounded-xl font-mario text-[10px] transition-all ${
                          isCurr
                            ? 'w-8 h-8 bg-amber-400 text-slate-950 font-black border-2 border-black scale-110 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                            : isPast
                            ? 'w-6 h-6 bg-emerald-600/60 text-emerald-100 border border-emerald-400 font-bold'
                            : 'w-6 h-6 bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {isCurr ? (
                          <MarioCharacterAvatar character={equippedAvatar} className="w-5 h-5" />
                        ) : isPast ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      {idx < deck.length - 1 && (
                        <div
                          className={`h-0.5 w-2 sm:w-3 ${
                            isPast ? 'bg-emerald-400' : 'bg-slate-700'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center gap-1 shrink-0 pl-1">
                  <div className="w-6 h-6 rounded-xl bg-amber-500/30 border border-amber-400 flex items-center justify-center">
                    <MarioFlagIcon className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Arcade Action Bar: 15s Speedrunner Timer, Star Fever, 50/50 Mushroom Zap, Radar Clue */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border-2 border-slate-800 rounded-2xl p-2.5 sm:p-3">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 font-mono font-black text-xs tabular-nums ${
                    secondsLeft <= 5
                      ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                      : secondsLeft <= 8
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-700 text-slate-200'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${secondsLeft <= 5 ? 'text-rose-400' : 'text-amber-400'}`} />
                  <span>{secondsLeft}s</span>
                  {secondsLeft >= 8 && pickedOption === null && (
                    <span className="text-[9px] font-mario text-emerald-400 uppercase inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50">
                      +5 Speed
                    </span>
                  )}
                </div>

                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-xl border-2 transition-all ${
                    isFeverActive
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <MarioStarIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] font-mario font-black">
                    {isFeverActive ? 'FEVER 2X SHIELD' : `STAR ${feverStars}/3`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={mushroomUsesLeft <= 0 || pickedOption !== null || eliminatedIndices.size > 0}
                  onClick={handleMushroomZap}
                  className={`min-h-[34px] px-2.5 py-1 rounded-xl border-2 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                    mushroomUsesLeft > 0 && pickedOption === null && eliminatedIndices.size === 0
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed'
                  }`}
                  title="50/50 Mushroom Zap: Strike out 2 incorrect choices"
                >
                  <MarioMushroomIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>50/50 Zap ({mushroomUsesLeft})</span>
                </button>

                <button
                  type="button"
                  disabled={radarUsesLeft <= 0 && !showRadarClue}
                  onClick={handleRadarClue}
                  className={`min-h-[34px] px-2.5 py-1 rounded-xl border-2 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer transition-all ${
                    showRadarClue
                      ? 'bg-emerald-400 text-slate-950 border-black font-black'
                      : radarUsesLeft > 0
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-black shadow-[0_2px_0_#000]'
                      : 'bg-slate-800 text-slate-500 border-slate-700 opacity-50 cursor-not-allowed'
                  }`}
                  title="Statutory Radar Clue: Reveal controlling provision hint"
                >
                  <Compass className="w-3.5 h-3.5 shrink-0" />
                  <span>Radar ({radarUsesLeft})</span>
                </button>
              </div>
            </div>

            {/* Radar Clue Panel */}
            {showRadarClue && currentItem && (
              <div className="bg-indigo-950/95 border-2 border-indigo-400 rounded-2xl p-3 text-indigo-100 flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  <Compass className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-mario text-cyan-300 uppercase block">STATUTORY RADAR CLUE</span>
                    <p className="text-xs font-bold leading-snug break-words">
                      Controlling Legal Basis: <span className="font-mono text-amber-300">{currentItem.statute}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRadarClue(false)}
                  className="p-1 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-900/50 cursor-pointer shrink-0"
                  aria-label="Dismiss Radar Clue"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
              <span className="text-amber-300 font-mono tabular-nums">
                Stage {currentIdx + 1}/{deck.length} · {currentItem.headline}
              </span>
              <span className="text-emerald-300 tabular-nums">
                Score: {score} {streak >= 2 ? `· ${streak}x Streak!` : ''}
              </span>
            </div>

            {/* Arcade Mission Directive Card */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-3 border-amber-400/80 rounded-2xl p-4 sm:p-5 shadow-[0_4px_0_#000] space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-amber-400/30 pb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-mario text-[10px] font-black flex items-center justify-center shrink-0">
                    !
                  </div>
                  <span className="text-[10px] sm:text-xs font-mario text-amber-300 uppercase tracking-wider break-words [overflow-wrap:anywhere]">
                    MISSION DIRECTIVE · {currentItem.headline}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-bold text-emerald-300 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/40 shrink-0 max-w-full truncate">
                  {currentItem.statute}
                </span>
              </div>
              <p className="text-sm sm:text-base font-extrabold text-white leading-relaxed break-words">
                {currentItem.prompt}
              </p>
            </div>

            {/* Action Arcade Streak & Keyboard Hotkey Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs">
              <div className="flex items-center gap-2">
                {streak >= 2 ? (
                  <span className={`px-2.5 py-1 rounded-lg font-mario text-[10px] font-black inline-flex items-center gap-1.5 animate-pulse ${
                    streak >= 5
                      ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                      : streak >= 3
                      ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.7)]'
                      : 'bg-emerald-500 text-slate-950'
                  }`}>
                    <Sparkles className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>{streak >= 5 ? 'BARRISTER SUPREME 5X COMBO (+10c)' : streak >= 3 ? 'SUPER STAR 3X FEVER (+5c)' : 'SARASALAND 2X SPRINT'}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-400 inline-flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Action Streak: {streak} Hits</span>
                  </span>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span>Arcade Hotkeys:</span>
                <span className="px-1.5 py-0.5 rounded bg-black/60 border border-slate-700 text-amber-300 font-bold">[1-4 / A-D] Select</span>
                <span className="px-1.5 py-0.5 rounded bg-black/60 border border-slate-700 text-emerald-300 font-bold">[Z] Zap</span>
                <span className="px-1.5 py-0.5 rounded bg-black/60 border border-slate-700 text-cyan-300 font-bold">[R] Radar</span>
              </div>
            </div>

            <ThematicRoyalGameVisualizer
              gameTitle={gameTitle}
              stageNum={currentIdx}
              totalStages={deck.length}
              options={currentItem.options}
              pickedOption={pickedOption}
              correctIndex={currentItem.correctIndex}
              onPickOption={handleChoose}
              streak={streak}
              eliminatedIndices={eliminatedIndices}
            />

            {/* Dynamic Arcade Action Blast Banner */}
            {pickedOption !== null && (
              <div
                className={`p-3 rounded-2xl border-3 flex flex-wrap items-center justify-between gap-2.5 shadow-[0_4px_0_#000] animate-bounce max-w-full min-w-0 ${
                  pickedOption === currentItem.correctIndex
                    ? 'bg-amber-400 border-black text-slate-950 font-black'
                    : 'bg-rose-600 border-black text-white font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-black text-amber-300 flex items-center justify-center font-mario text-sm border border-white/20 shrink-0">
                    !
                  </div>
                  <span className="text-xs sm:text-sm uppercase font-mario tracking-wide break-words">
                    {pickedOption === currentItem.correctIndex
                      ? gameTitle.includes('Toad')
                        ? 'TURBO DRIFT! MINECART BARRELS DOWN STATUTORY TRACK!'
                        : gameTitle.includes('Daisy')
                        ? 'NITRO DASH! SARASALAND DERBY HURDLE CLEARED!'
                        : gameTitle.includes('Dry Bones')
                        ? 'CRYPT QUAKE! BONES REASSEMBLED! PRESCRIPTION RATIFIED!'
                        : 'DOUBLE ENCORE! METRO JAZZ SOLO WAGE PARITY ACHIEVED!'
                      : 'TRACK COLLAPSE! SHIELD PENALTY ABSORBED! REVIEW DOCTRINE BELOW!'}
                  </span>
                </div>
                {speedBonusAwarded && (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-950 text-amber-300 border-2 border-amber-400 font-mario text-[10px] shrink-0 font-black shadow-xs">
                    +5 SPEED BONUS!
                  </span>
                )}
              </div>
            )}

            {/* High-Yield Statutory Learning & Takeaway Card */}
            {pickedOption !== null && (
              <ArcadeDoctrineCard
                title={currentItem.headline}
                statute={currentItem.statute}
                rule={currentItem.explanation}
                takeaway={
                  pickedOption === currentItem.correctIndex
                    ? `Controlling Codal Rule: "${currentItem.options[currentItem.correctIndex]}". Locked into memory with zero omissions!`
                    : `Statutory Distinction: The controlling doctrine is "${currentItem.options[currentItem.correctIndex]}". Note the statutory exception under ${currentItem.statute}.`
                }
                isCorrect={pickedOption === currentItem.correctIndex}
                shieldAbsorbedHit={shieldAbsorbedHit}
                speedBonusAwarded={speedBonusAwarded}
                worldCode={reportWorldCode}
                scenarioText={currentItem.prompt}
                chosenAnswerText={pickedOption >= 0 ? currentItem.options[pickedOption] : 'Time Expired'}
                correctAnswerText={currentItem.options[currentItem.correctIndex]}
                advanceLabel={
                  hearts <= 0
                    ? 'View Run Summary'
                    : currentIdx + 1 >= deck.length
                    ? 'Claim Clear Bonus'
                    : 'Next Stage'
                }
                onAdvance={handleAdvance}
              />
            )}
          </div>
        )}

        {phase === 'VICTORY' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 border-3 border-black mx-auto flex items-center justify-center shadow-[0_4px_0_#000]">
              <MarioStarIcon className="w-9 h-9" />
            </div>
            <h4 className="text-2xl sm:text-3xl font-black font-display text-white tabular-nums">
              STAGE CLEARED! ({score}/{deck.length})
            </h4>
            <p className="text-xs sm:text-sm font-bold text-emerald-300 inline-flex items-center gap-1.5">
              <MarioCoinIcon className="w-4 h-4" />
              <span>+{victoryCoins} Bonus Gold Coins Banked!</span>
            </p>
            <div>
              <button
                type="button"
                data-start="true"
                onClick={startRun}
                className="min-h-[46px] px-6 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Play Fresh Shuffled Deck</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'GAME_OVER' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 border-3 border-black mx-auto flex items-center justify-center text-white">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black font-display text-white tabular-nums">
              OUT OF HEARTS ({score}/{deck.length} CLEARED)
            </h4>
            <button
              type="button"
              data-start="true"
              onClick={startRun}
              className="min-h-[46px] px-6 py-2 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Retry Shuffled Run</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const CaptainToadMinecartGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_captain_toad_minecart"
    gameTitle="Captain Toad's Special-Workers Minecart"
    kickerBadge="WORLD 4 • KASAMBAHAY, CHILD LABOR, PWD & TELECOMMUTING"
    description="Ride Captain Toad's headlamp minecart through World 4 statutory protections! Master R.A. 10361 Kasambahay SIL/rest rules, R.A. 9231 Child Labor caps, R.A. 7277 100% PWD parity, and R.A. 11165 Telecommuting."
    bannerGradientClass="bg-gradient-to-r from-amber-800 via-red-900 to-slate-900"
    accentButtonClass="bg-amber-400 hover:bg-amber-300 text-slate-950"
    icon={<Compass className="w-6 h-6" />}
    bank={CAPTAIN_TOAD_MINECART_BANK}
    victoryCoins={30}
    reportWorldCode="w4"
  />
);

export const DaisyHolidayDerbyGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_daisy_holiday_derby"
    gameTitle="Princess Daisy's Sarasaland Holiday Derby"
    kickerBadge="HOLIDAYS • REGULAR, DOUBLE & PRECEDING-DAY TRAPS"
    description="Sprint across Sarasaland's Holiday Matrix! Conquer Regular vs. Special Non-Working Day multipliers (100%, 150%, 200%, 300%), Double Holidays, <10 retail exemptions, and successive-holiday absence traps."
    bannerGradientClass="bg-gradient-to-r from-orange-800 via-amber-800 to-slate-900"
    accentButtonClass="bg-orange-300 hover:bg-orange-200 text-slate-950"
    icon={<Sun className="w-6 h-6" />}
    bank={DAISY_HOLIDAY_DERBY_BANK}
    victoryCoins={30}
    reportWorldCode="holidays"
  />
);

export const DryBonesCryptGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_dry_bones_crypt"
    gameTitle="Dry Bones' Prescriptive & Due Process Crypt"
    kickerBadge="DEADLINES • 1-YR ULP, 3-YR MONEY, 4-YR DISMISSAL & NTE"
    description="Unlock the castle crypt before statutory claims prescribe! Distinguish 1-Year ULP, 3-Year Money Claims, 4-Year Illegal Dismissal, 5-Day NTE, 30-Day DOLE Notice, and the 6-Month Floating Status cap."
    bannerGradientClass="bg-gradient-to-r from-slate-800 via-zinc-900 to-indigo-950"
    accentButtonClass="bg-cyan-400 hover:bg-cyan-300 text-slate-950"
    icon={<ShieldAlert className="w-6 h-6" />}
    bank={DRY_BONES_CRYPT_BANK}
    victoryCoins={30}
    reportWorldCode="w5"
  />
);

export const PaulineWageConcertGame: React.FC<RoyalVaultGameProps> = (props) => (
  <RoyalArcadeEngine
    {...props}
    deckKey="royal_pauline_wage_concert"
    gameTitle="Mayor Pauline's Metro Wage Festival"
    kickerBadge="WORLD 3 • R.A. 11360, P.D. 851, FACILITIES & R.A. 8188"
    description="Headline Metro Kingdom's Wage Festival! Hit every statutory note on 100% Service Charges, P.D. 851 13th Month Pay, Art. 102 Legal Tender, Purpose Test (Facilities vs. Supplements), and R.A. 8188 Double Indemnity."
    bannerGradientClass="bg-gradient-to-r from-rose-900 via-red-900 to-purple-950"
    accentButtonClass="bg-rose-300 hover:bg-rose-200 text-slate-950"
    icon={<Music className="w-6 h-6" />}
    bank={PAULINE_WAGE_CONCERT_BANK}
    victoryCoins={35}
    reportWorldCode="w3"
  />
);
