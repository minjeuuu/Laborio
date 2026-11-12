import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MarioAvatar } from '../types/laborLaw';
import {
  MarioCharacterAvatar,
  MarioCoinIcon,
  MarioStarIcon,
  MarioBooIcon,
  MarioThwompIcon,
  MarioMushroomIcon,
  MarioFlagIcon,
} from './MarioIcons';
import { marioAudio } from '../utils/audio';
import { drawUniqueFromDeck } from '../utils/gameQuestionDeck';
import { shuffleChoiceOptionsSafely } from '../utils/round14Improvements';
import {
  Clock,
  Moon,
  Sparkles,
  Stamp,
  Vault,
  Scale,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Heart,
  Play,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Train,
  Crown,
  Scroll,
  Coins,
  Compass,
  Zap,
  X,
  Flame,
  Gauge,
  Crosshair,
  Activity,
} from 'lucide-react';
import { awardUserXp } from '../utils/levelProgressionService';
import { ArcadeDoctrineCard } from './ArcadeDoctrineCard';

export interface MasterArcadeScenario {
  id: string;
  worldCode: string;
  headline: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  statute: string;
  explanation: string;
}

export const YOSHI_OVERTIME_EXPRESS_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'yo1',
    worldCode: 'w1',
    headline: '10 Hours on Ordinary Working Day',
    prompt: 'Yoshi worked 10 hours on an ordinary Tuesday (8 regular + 2 overtime hours). What is the statutory overtime rate for the 2 excess hours?',
    options: [
      '125% of regular hourly rate (100% regular wage + 25% statutory overtime premium)',
      '130% of regular hourly rate (100% regular wage + 30% statutory rest day premium)',
      '150% of regular hourly rate (100% regular wage + 50% special holiday premium)',
      '200% of regular hourly rate (100% regular wage + 100% regular holiday premium)',
    ],
    correctIndex: 0,
    statute: 'Art. 87, Labor Code',
    explanation: 'Work performed beyond 8 hours on an ordinary working day earns an additional 25% (125% hourly rate).',
  },
  {
    id: 'yo2',
    worldCode: 'w1',
    headline: 'Monday Undertime vs Tuesday Overtime',
    prompt: 'Toad left 2 hours early on Monday (undertime) and worked 2 hours overtime on Tuesday. Can the employer offset Monday undertime with Tuesday overtime?',
    options: [
      'No — offsetting undertime by overtime on other days is strictly prohibited by Art. 88',
      'Yes — undertime and overtime can be offset if both occur within the same payroll workweek',
      'Yes — offsetting is permitted provided there is prior verbal approval from the supervisor',
      'Only rank-and-file workers may have undertime offset if authorized by an internal policy',
    ],
    correctIndex: 0,
    statute: 'Art. 88, Labor Code',
    explanation: 'Art. 88 prohibits offsetting undertime on one day with overtime worked on another day; the worker must still receive overtime premium.',
  },
  {
    id: 'yo3',
    worldCode: 'holidays',
    headline: 'Overtime on a Regular Holiday',
    prompt: 'Mario worked 9 hours on Independence Day (Regular Holiday). What multiplier applies to the 9th (overtime) hour?',
    options: [
      '260% of hourly rate (200% holiday base multiplied by 1.30 statutory overtime factor)',
      '200% of hourly rate (100% regular daily wage base plus 100% regular holiday premium)',
      '169% of hourly rate (130% rest day base multiplied by 1.30 statutory overtime factor)',
      '300% of hourly rate (200% holiday rate plus 100% additional holiday overtime bonus)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 94, Labor Code',
    explanation: 'Regular Holiday first 8 hours = 200%, and overtime adds +30% of the holiday hourly rate: 200% x 1.30 = 260%.',
  },
  {
    id: 'yo4',
    worldCode: 'w2',
    headline: 'Overtime on Scheduled Rest Day',
    prompt: 'Peach worked 10 hours on her scheduled Sunday Rest Day (not a holiday). What hourly multiplier applies to hours 9 and 10?',
    options: [
      '169% of hourly rate (130% rest day base multiplied by 1.30 statutory overtime factor)',
      '130% of hourly rate (100% regular daily wage base plus 30% rest day premium pay)',
      '150% of hourly rate (100% regular wage plus 50% special non-working day premium)',
      '195% of hourly rate (150% special rest day rate multiplied by 1.30 overtime factor)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 93(a), Labor Code',
    explanation: 'Rest day rate is 130%, and overtime beyond 8 hours on a rest day adds 30% of 130% = 169%.',
  },
  {
    id: 'yo5',
    worldCode: 'w1',
    headline: '15-Minute Coffee Break Check',
    prompt: 'Workers get a 15-minute morning rest break and a 15-minute afternoon rest break. Are these short breaks counted as compensable hours worked?',
    options: [
      'Yes — rest periods of 5 to 20 minutes are compensable working hours under Art. 84',
      'No — any rest intervals shorter than one full hour are strictly unpaid non-working time',
      'Only if the worker remains seated at their desk without moving to the pantry or lounge',
      'Half the break is paid as working time while the remaining half is unpaid personal time',
    ],
    correctIndex: 0,
    statute: 'Art. 84 & Omnibus Rules',
    explanation: 'Short rest periods of 5 to 20 minutes are compensable working hours; only full meal periods of at least 60 minutes are non-compensable.',
  },
  {
    id: 'yo6',
    worldCode: 'w1',
    headline: 'Work During Power Outage (Brownout)',
    prompt: 'A power brownout halts factory machines for 45 minutes, but workers are told to wait at their stations until power returns. Is this time paid?',
    options: [
      'Yes — waiting time where workers must remain on premises is compensable under DOLE rules',
      'No — brownouts and power outages are force majeure and strictly unpaid non-working hours',
      'Only 50% of the waiting time is paid unless the employer has an active backup generator',
      'The employer may compulsorily charge the brownout against the worker\'s vacation leave',
    ],
    correctIndex: 0,
    statute: 'DOLE Policy Instructions No. 36',
    explanation: 'Waiting time spent by an employee on duty or where the worker is required to remain at the workplace is compensable hours worked.',
  },
  {
    id: 'yo7',
    worldCode: 'holidays',
    headline: 'Overtime on Special Day on Rest Day',
    prompt: 'Luigi works 9 hours on Ninoy Aquino Day (Special Non-Working Day) which also falls on his scheduled Rest Day. What rate applies to the 9th hour?',
    options: [
      '195% of hourly rate (150% special rest day base rate multiplied by 1.30 overtime factor)',
      '150% of hourly rate (100% regular wage plus 50% special day rest day combined premium)',
      '169% of hourly rate (130% ordinary rest day rate multiplied by 1.30 overtime factor)',
      '260% of hourly rate (200% regular holiday rate multiplied by 1.30 overtime factor)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 93(c), Labor Code',
    explanation: 'Special Day on Rest Day is 150%, and overtime adds 30% of 150%: 150% x 1.30 = 195%.',
  },
  {
    id: 'yo8',
    worldCode: 'holidays',
    headline: 'Regular Holiday on Rest Day Overtime',
    prompt: 'A security guard works 10 hours on Christmas Day (Regular Holiday) which happens to be their scheduled Rest Day. What hourly rate applies to the 2 overtime hours?',
    options: [
      '338% of hourly rate (260% holiday rest day rate multiplied by 1.30 overtime factor)',
      '260% of hourly rate (200% regular holiday base plus 60% rest day statutory premium)',
      '200% of hourly rate (100% regular wage plus 100% regular holiday unworked compensation)',
      '300% of hourly rate (200% regular holiday rate plus 100% straight overtime surcharge)',
    ],
    correctIndex: 0,
    statute: 'DOLE Handbook on Statutory Monetary Benefits',
    explanation: 'Regular Holiday on Rest Day is 260% for first 8 hours, and overtime adds +30% of 260%: 260% x 1.30 = 338%!',
  },
  {
    id: 'yo9',
    worldCode: 'w1',
    headline: 'Compressed Workweek Daily Limit',
    prompt: 'Under DOLE Advisory No. 02-04, what is the maximum daily work duration permitted without overtime in an authorized Compressed Workweek (CWW)?',
    options: [
      'Up to 12 hours/day without overtime, provided total weekly hours do not exceed 48 hours',
      'Up to 10 hours/day without overtime, but any work beyond 40 weekly hours requires OT pay',
      'Up to 14 hours/day without overtime, provided workers are given two consecutive rest days',
      'Up to 8 hours/day strictly, as the Labor Code prohibits extending daily hours without OT',
    ],
    correctIndex: 0,
    statute: 'DOLE Advisory No. 02-04',
    explanation: 'CWW allows daily hours up to 12 hours without overtime premium, as long as 48 normal weekly hours are not exceeded and operations are not hazardous.',
  },
  {
    id: 'yo10',
    worldCode: 'w1',
    headline: 'Meal Period Shortened Below 60 Minutes',
    prompt: 'Management shortens the daily lunch period from 60 minutes to 30 minutes to let workers leave earlier. How must the 30-minute period be treated?',
    options: [
      'Compensable working time, because meal periods shorter than 60 minutes must be paid',
      'Unpaid personal time, as long as workers are allowed to leave 30 minutes earlier at dismissal',
      'Fifty percent paid and fifty percent unpaid, depending on whether workers remain on premises',
      'Discretionary non-working time, provided it is authorized by a majority vote of employees',
    ],
    correctIndex: 0,
    statute: 'Art. 85, Labor Code',
    explanation: 'Under Article 85, meal periods must be at least 60 minutes. A shortened meal break of less than 60 minutes constitutes compensable hours worked.',
  },
  {
    id: 'yo11',
    worldCode: 'w1',
    headline: 'Compulsory Emergency Overtime Grounds',
    prompt: 'Under Article 89 of the Labor Code, in which of the following circumstances can an employer legally compel employees to perform overtime work?',
    options: [
      'When urgent work must be performed on machinery or equipment to prevent serious loss or damage',
      'Whenever the employer experiences an unexpected seasonal surge in standard customer orders',
      'When an employee has incurred undertime earlier in the week and must balance company hours',
      'Whenever managerial staff determine that company profits for the fiscal quarter are below target',
    ],
    correctIndex: 0,
    statute: 'Art. 89, Labor Code',
    explanation: 'Art. 89 lists statutory emergency overtime exceptions, including disasters, urgent repairs on machinery to prevent serious loss, and preventing loss of perishable goods.',
  },
  {
    id: 'yo12',
    worldCode: 'w1',
    headline: 'Telecommuting Work-From-Home Overtime',
    prompt: 'Under R.A. 11165 (Telecommuting Act), do telecommuting home-based employees enjoy the same statutory rights to overtime and rest periods as on-site workers?',
    options: [
      'Yes — telecommuting workers must receive equal treatment and statutory overtime benefits',
      'No — remote home-based workers are classified as field personnel excluded from overtime pay',
      'Only if the telecommuting arrangement is registered with the DOLE National Office beforehand',
      'Overtime pay is replaced by a flat monthly internet stipend negotiated under the contract',
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 11165',
    explanation: 'R.A. 11165 mandates that telecommuting employees receive fair and equal treatment comparable to on-site employees, including statutory overtime and rest day rates.',
  },
  {
    id: 'yo13',
    worldCode: 'w2',
    headline: 'Mandatory Weekly Rest Period Duration',
    prompt: 'Under Article 91 of the Labor Code, what is the mandatory minimum rest period an employer must provide after every 6 consecutive normal work days?',
    options: [
      'At least 24 consecutive hours of rest after every 6 consecutive normal working days',
      'At least 48 consecutive hours of rest after every 5 consecutive normal working days',
      'At least 12 consecutive hours of rest after every 6 consecutive normal working days',
      'At least 36 consecutive hours of rest after every 7 consecutive normal working days',
    ],
    correctIndex: 0,
    statute: 'Art. 91, Labor Code',
    explanation: 'Every employer shall provide each of his employees a weekly rest period of not less than twenty-four (24) consecutive hours after every six (6) consecutive normal work days.',
  },
  {
    id: 'yo14',
    worldCode: 'holidays',
    headline: 'Overtime on Ordinary Special Non-Working Day',
    prompt: 'Daisy works 10 hours on All Saints\' Day (Special Non-Working Day, not falling on a rest day). What rate applies to the 2 overtime hours (hours 9 and 10)?',
    options: [
      '169% of regular hourly rate (130% special day base multiplied by 1.30 overtime factor)',
      '150% of regular hourly rate (100% regular wage plus 50% premium for working on special days)',
      '195% of regular hourly rate (150% special day rest day rate multiplied by 1.30 overtime factor)',
      '260% of regular hourly rate (200% regular holiday base multiplied by 1.30 overtime factor)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 & Art. 93(a), Labor Code',
    explanation: 'Special Non-Working Day first 8 hours = 130%. Overtime adds 30% of that base hourly rate: 130% x 1.30 = 169%.',
  },
  {
    id: 'yo15',
    worldCode: 'w1',
    headline: 'On-Call Duty Confinement to Quarters',
    prompt: 'An IT technician is placed on-call over the weekend but is strictly forbidden from leaving company quarters so they can respond within 5 minutes. Is this time compensable?',
    options: [
      'Yes — on-call time where the worker\'s movement is confined to company premises is compensable',
      'No — on-call duty is never compensable unless an active emergency call is actually received',
      'Only 25% of the on-call hours are paid as standby allowance without regular hourly wages',
      'Compensable only if the technician logs into the server and executes code for over 4 hours',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule I Sec. 5',
    explanation: 'An employee who is required to remain on call in the employer\'s premises, or so close thereto that he cannot use the time effectively for his own purposes, is working while on call.',
  },
  {
    id: 'yo16',
    worldCode: 'w1',
    headline: 'Interrupted Meal Break Due to Work Calls',
    prompt: 'During a 1-hour lunch break, a customer service agent is frequently required by management to answer incoming client phone calls. How is this period graded?',
    options: [
      'Compensable working hours in full, because the worker was not completely freed from duties',
      'Non-compensable lunch period, provided the total phone call duration did not exceed 15 minutes',
      'Fifty percent compensable, with the remainder treated as non-compensable personal break time',
      'Compensable only if the agent submits an overtime requisition slip signed by the client',
    ],
    correctIndex: 0,
    statute: 'Art. 85, Labor Code; Pan American World Airways v. Pan American',
    explanation: 'To be non-compensable, meal time must be completely free from work. If the employee is required to perform duties or answer calls, the entire period is compensable.',
  },
  {
    id: 'yo17',
    worldCode: 'w1',
    headline: 'Overtime on Rest Day falling on Special Non-Working Day',
    prompt: 'Mario renders 2 hours overtime on a Special Non-Working Day that also happens to be his scheduled Rest Day. What multiplier applies to the excess hours?',
    options: [
      '195% of regular hourly rate (150% base rate multiplied by 1.30 statutory overtime factor)',
      '150% of regular hourly rate (standard special day rate without separate overtime premium)',
      '169% of regular hourly rate (130% rest day rate multiplied by 1.30 overtime factor)',
      '200% of regular hourly rate (equivalent to regular holiday pay)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 + Art. 93(c), Labor Code',
    explanation: 'Work on a Special Day falling on a Rest Day pays 150%; excess overtime hours earn an additional 30% of that base, yielding 195% (1.50 × 1.30).',
  },
  {
    id: 'yo18',
    worldCode: 'w1',
    headline: 'Broken Hours / Split Shift Within 24-Hour Day',
    prompt: 'Peach works from 8:00 AM to 12:00 PM, has a 4-hour afternoon break, and resumes from 4:00 PM to 8:00 PM. Total hours worked = 8 hours. Is overtime pay due?',
    options: [
      'No overtime pay is due because actual hours rendered do not exceed 8 hours in the workday',
      'Yes — 4 hours overtime pay is due because the overall span of the workday exceeded 8 hours',
      'Yes — broken hours are automatically penalized with 125% premium for all afternoon hours',
      'Overtime is due only if the worker was prevented from leaving the business premises',
    ],
    correctIndex: 0,
    statute: 'Art. 83 & Art. 84, Labor Code',
    explanation: 'Statutory overtime is based on hours actually worked in excess of 8 hours within a 24-hour workday, not the total spread of time spanning split shifts.',
  },
  {
    id: 'yo19',
    worldCode: 'w1',
    headline: 'Travel Time Away from Home During Working Hours',
    prompt: 'Luigi travels by ferry for 7 hours on an ordinary Tuesday during his regular 8:00 AM to 5:00 PM schedule to deliver legal equipment. Is this travel time compensable?',
    options: [
      'Yes — travel that keeps an employee away from home during regular working hours is compensable',
      'No — travel time is purely preparatory and non-compensable unless active physical labor is done',
      'Only 50% of travel time is compensable under standard industrial transportation guidelines',
      'Travel time is compensable only if the employee was operating the transportation vessel',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule I Sec. 7(c)',
    explanation: 'Travel that keeps an employee away from home is compensable work time when it cuts across the employee\'s regular working hours, including corresponding hours on non-working days.',
  },
  {
    id: 'yo20',
    worldCode: 'w1',
    headline: 'Sleeping Time on Duty Subject to Emergency Call',
    prompt: 'A power station engineer is provided a bunkhouse at a remote substation and told to sleep, but must wake up immediately if system alarms trip. Are night hours compensable?',
    options: [
      'Yes — sleeping time on duty is compensable hours worked when the worker cannot leave or use time for own purposes',
      'No — sleeping time is strictly personal rest and never compensable regardless of standby rules',
      'Compensable only for the exact minutes the engineer spent waking up and turning valve switches',
      'Compensable only if approved by DOLE Bureau of Working Conditions in a prior formal waiver',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule I Sec. 5; National Development Co. v. CIR',
    explanation: 'Where an employee is required to remain on the employer\'s premises or so close thereto that he cannot use the time effectively for his own purposes, he is working while on duty.',
  },
  {
    id: 'yo21',
    worldCode: 'w1',
    headline: 'Compressed Workweek Maximum Daily Hours',
    prompt: 'Under DOLE Advisory No. 02-04, what is the maximum permissible daily work duration under an approved Compressed Workweek (CWW) scheme without daily overtime pay?',
    options: [
      'Up to 12 hours per day, provided total weekly hours do not exceed 48 hours',
      'Up to 10 hours per day, with any hours beyond 10 earning statutory overtime rates',
      'Up to 14 hours per day, provided workers receive double meal allowances and hazard pay',
      'Up to 16 hours per day, if supported by a 100% majority vote of the unionized workforce',
    ],
    correctIndex: 0,
    statute: 'DOLE Advisory No. 02-04 (Compressed Workweek Scheme)',
    explanation: 'Under an approved CWW scheme, daily work hours may be extended up to a maximum of 12 hours per day without statutory overtime, so long as the normal 48-hour workweek is observed.',
  },
  {
    id: 'yo22',
    worldCode: 'w1',
    headline: 'Emergency Overtime Under Article 89',
    prompt: 'An employer directs Toad to render 2 hours overtime to prevent imminent spoilage of 50 crates of perishable fresh mushrooms. Can Toad lawfully refuse?',
    options: [
      'No — emergency overtime is compulsory under Art. 89(d) to prevent serious loss of perishable goods',
      'Yes — all overtime work in the Philippines is strictly voluntary and refusal can never be penalized',
      'Yes — Toad can refuse if the employer did not obtain prior written approval from the DOLE Secretary',
      'No — but only if Toad is paid 300% overtime premium instead of the statutory 125% rate',
    ],
    correctIndex: 0,
    statute: 'Art. 89(d), Labor Code',
    explanation: 'Under Art. 89, an employee may be required to perform overtime work in cases of urgent work to machinery, disaster prevention, or to prevent serious loss of perishable goods.',
  },
  {
    id: 'yo23',
    worldCode: 'holidays',
    headline: 'Regular Holiday on Rest Day with Overtime',
    prompt: 'Yoshi works 10 hours on Independence Day (Regular Holiday) which also falls on his scheduled Rest Day. What multiplier applies to the 2 overtime hours?',
    options: [
      '338% of regular hourly rate (260% holiday rest day base multiplied by 1.30 overtime factor)',
      '260% of regular hourly rate (standard holiday rest day base rate without overtime multiplier)',
      '300% of regular hourly rate (double regular holiday statutory base multiplier)',
      '390% of regular hourly rate (double regular holiday rest day multiplier)',
    ],
    correctIndex: 0,
    statute: 'Art. 87 + Art. 94, Labor Code; DOLE Handbook',
    explanation: 'Work on a Regular Holiday on a Rest Day pays 260% (200% × 1.30). Overtime beyond 8 hours adds 30% of that base: 260% × 1.30 = 338% per overtime hour.',
  },
  {
    id: 'yo24',
    worldCode: 'w1',
    headline: 'Compensatory Time-Off (CTO) vs Overtime Pay',
    prompt: 'Company HR issues a memorandum stating that 2 hours of overtime worked today will be compensated by granting 2 hours of paid time-off next Friday instead of cash. Is this valid?',
    options: [
      'Invalid — Art. 88 explicitly prohibits offsetting undertime or time-off against overtime work',
      'Valid — employers possess management prerogative to substitute leave credits for overtime cash',
      'Valid — provided the compensatory time-off is credited at a 1.5x multiplier ratio',
      'Invalid only if the employee is a managerial personnel earning above the minimum wage',
    ],
    correctIndex: 0,
    statute: 'Art. 88, Labor Code',
    explanation: 'Art. 88 mandates: Undertime work on any particular day shall not be offset by overtime work on any other day. Permission to leave early does not exempt employer from paying OT premium.',
  },
  {
    id: 'yo25',
    worldCode: 'w1',
    headline: 'Two 15-Minute Short Rest Periods (Coffee Breaks)',
    prompt: 'Mario is provided two 15-minute coffee breaks during his 8-hour shift. Can management deduct 30 minutes from his compensable workday?',
    options: [
      'No — short rest periods of 5 to 20 minutes duration are compensable hours worked under the law',
      'Yes — any time an employee is not actively operating tools is non-compensable break time',
      'Management may deduct the time if coffee breaks were requested in writing by the employee',
      'Only one 15-minute break is compensable; the second break is automatically deductible',
    ],
    correctIndex: 0,
    statute: 'Art. 84, Labor Code; Omnibus Rules Book III Rule I Sec. 7(b)',
    explanation: 'Rest periods of short duration, running from 5 to 20 minutes, must be counted as hours worked under the Omnibus Rules implementing the Labor Code.',
  },
  {
    id: 'yo26',
    worldCode: 'w1',
    headline: 'Mandatory Saturday Compliance Training',
    prompt: 'The employer orders all accounting staff to attend a mandatory 4-hour anti-fraud training on Saturday outside normal hours. Is this period compensable?',
    options: [
      'Yes — attendance at lectures/meetings is compensable if mandatory and related to employee work',
      'No — educational seminars outside normal working hours are always non-compensable benefits',
      'Compensable only if the training ends with a passing grade on the certification exam',
      'Compensable at 50% rate because no active commercial revenue was generated during lecture',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule I Sec. 6',
    explanation: 'Attendance at lectures and training is NOT hours worked only if all 4 conditions are met: outside hours, voluntary, not directly related to job, and no productive work performed.',
  },
  {
    id: 'yo27',
    worldCode: 'w1',
    headline: 'Overtime Rendered Without Written Supervisor Approval',
    prompt: 'A machine operator renders 2 hours overtime with the knowledge and tacit acquiescence of the floor supervisor, but without a written OT slip. Must overtime pay be paid?',
    options: [
      'Yes — work suffered or permitted to be performed is compensable hours worked under Art. 84',
      'No — written pre-approval is an absolute condition precedent before overtime liability attaches',
      'Overtime pay is forfeited but the operator earns 1 hour of non-cash compensatory time-off',
      'Only 50% of the overtime rate is due because of administrative non-compliance',
    ],
    correctIndex: 0,
    statute: 'Art. 84(b), Labor Code; Manila Railroad Co. v. CIR',
    explanation: 'Hours worked includes all time during which an employee is suffered or permitted to work. When management knows and tolerates excess work, overtime pay cannot be avoided.',
  },
  {
    id: 'yo28',
    worldCode: 'holidays',
    headline: 'Double Regular Holiday Overtime on Ordinary Day',
    prompt: 'Mario works 10 hours on a Double Regular Holiday (e.g., Araw ng Kagitingan + Maundy Thursday). What multiplier applies to the 2 overtime hours?',
    options: [
      '390% of regular hourly rate (300% double holiday base multiplied by 1.30 overtime factor)',
      '300% of regular hourly rate (standard double holiday base rate without overtime multiplier)',
      '260% of regular hourly rate (regular holiday rest day rate)',
      '507% of regular hourly rate (double holiday rest day overtime rate)',
    ],
    correctIndex: 0,
    statute: 'DOLE Handbook on Workers\' Statutory Monetary Benefits',
    explanation: 'Work on a Double Regular Holiday earns 300% for the first 8 hours. Overtime beyond 8 hours pays an additional 30% of that base: 300% × 1.30 = 390% per overtime hour.',
  },
  {
    id: 'yo29',
    worldCode: 'w1',
    headline: 'Managerial Staff Overtime Exemption',
    prompt: 'A Logistics Director earning P120,000/month whose primary duty is managing the department and directing staff files a claim for 80 hours unpaid overtime. Will the claim prosper?',
    options: [
      'No — managerial employees whose primary duty is enterprise management are exempt under Art. 82',
      'Yes — all employees in the Philippines are entitled to overtime pay regardless of rank or salary',
      'Yes — provided the executive logs biometric time-in and time-out on the company terminal',
      'No — but the company is legally required to convert all overtime hours into additional vacation leaves',
    ],
    correctIndex: 0,
    statute: 'Art. 82, Labor Code; National Sugar Refineries Corp. v. NLRC',
    explanation: 'Art. 82 explicitly exempts managerial employees, field personnel, family members dependent on employer, domestic helpers, and workers paid by result from Title I (Working Hours).',
  },
  {
    id: 'yo30',
    worldCode: 'w1',
    headline: 'Overtime Calculation Base: Basic Wage vs Allowances',
    prompt: 'Under Article 90 of the Labor Code, what components constitute the \'regular wage\' used as the baseline for calculating overtime pay?',
    options: [
      'The regular basic wage rate, excluding statutory cost-of-living allowances (COLA)',
      'Total gross compensation inclusive of all year-end bonuses and profit-sharing dividends',
      'Minimum wage plus all reimbursable meal vouchers and travel allowances',
      'Basic wage multiplied by the consumer price index published by the Philippine Statistics Authority',
    ],
    correctIndex: 0,
    statute: 'Art. 90, Labor Code',
    explanation: 'Art. 90 provides that the regular wage for computing overtime shall include the basic wage rate, and excludes cost-of-living allowances unless stipulated otherwise in a CBA.',
  },
  {
    id: 'yo31',
    worldCode: 'w1',
    headline: '24-Hour Workday Cycle and Early Tuesday Call-In',
    prompt: 'Mario\'s regular workday begins at 8:00 AM Monday. On Tuesday, he is called in early to work at 6:00 AM (2 hours before 8:00 AM). How are those 2 hours classified?',
    options: [
      'Overtime work rendered within the 24-hour workday commencing at 8:00 AM Monday',
      'Regular straight-time hours belonging to Tuesday\'s scheduled 8-hour shift',
      'Night shift differential work only, with zero overtime premium entitlement',
      'Non-compensable voluntary early arrival, compensated only by a free breakfast meal',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule I Sec. 3; National Shipyards v. CIR',
    explanation: 'A \'workday\' is the 24-hour period commencing from the time the employee starts work. Hours worked between 6:00 AM and 8:00 AM Tuesday fall within Monday\'s 24-hour cycle and constitute OT.',
  },
  {
    id: 'yo32',
    worldCode: 'w1',
    headline: 'Working Through Lunch to Offset Tardiness',
    prompt: 'Toad arrives 45 minutes late in the morning and proposes to work through his 1-hour lunch break to avoid salary deduction. Can management approve this proposal?',
    options: [
      'No — the statutory 60-minute meal break is mandatory for worker health and cannot offset tardiness',
      'Yes — workers may freely waive statutory meal breaks in exchange for offsetting morning undertime',
      'Yes — provided Toad signs a written waiver attested by two co-workers and the floor supervisor',
      'Only if the employer pays Toad double time for the sacrificed lunch period under Art. 85',
    ],
    correctIndex: 0,
    statute: 'Art. 85 & Art. 88, Labor Code',
    explanation: 'Art. 85 mandates a 60-minute meal interval, while Art. 88 explicitly prohibits offsetting undertime on one day with overtime or work on other periods.',
  },
];

export const LUIGI_NIGHTSHIFT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'ln1',
    worldCode: 'w1',
    headline: 'Statutory Night Shift Window',
    prompt: 'Under Article 86 of the Labor Code, between what specific hours is the statutory Night Shift Differential (NSD) mandatory?',
    options: [
      'Between 10:00 PM and 6:00 AM (inclusive of all qualifying graveyard work intervals)',
      'Between 11:00 PM and 7:00 AM (aligning with conventional industrial evening rotations)',
      'Between 8:00 PM and 4:00 AM (covering sunset to early dawn shift operational cycles)',
      'Between 12:00 Midnight and 8:00 AM (encompassing post-midnight manufacturing hours)',
    ],
    correctIndex: 0,
    statute: 'Art. 86, Labor Code',
    explanation: 'Article 86 explicitly defines the night shift interval as work performed between 10:00 o’clock in the evening and 6:00 o’clock in the morning.',
  },
  {
    id: 'ln2',
    worldCode: 'w1',
    headline: 'Night Shift Differential Base Rate',
    prompt: 'What is the minimum statutory rate of additional compensation for each hour of night work performed between 10:00 PM and 6:00 AM?',
    options: [
      'Not less than 10% of the employee\'s regular hourly wage for each qualifying night hour',
      'Not less than 15% of the employee\'s regular hourly wage for each qualifying night hour',
      'Not less than 20% of the employee\'s regular hourly wage for each qualifying night hour',
      'Not less than 25% of the employee\'s regular hourly wage for each qualifying night hour',
    ],
    correctIndex: 0,
    statute: 'Art. 86, Labor Code',
    explanation: 'Every employee shall be paid a night shift differential of not less than ten percent (10%) of their regular wage for each hour of work between 10PM and 6AM.',
  },
  {
    id: 'ln3',
    worldCode: 'w1',
    headline: 'Retail / Service Small Business Exemption',
    prompt: 'Which retail and service establishments are legally exempted from the mandatory payment of Night Shift Differential under Article 86?',
    options: [
      'Retail and service establishments regularly employing not more than five (5) workers',
      'Retail and service establishments regularly employing not more than ten (10) workers',
      'Manufacturing and logistics enterprises regularly employing fewer than twenty (20) workers',
      'Export-oriented call center hubs regardless of total employee headcount or business size',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Omnibus Rules Book III Rule II',
    explanation: 'Retail and service establishments regularly employing not more than five (5) employees are exempted from mandatory NSD.',
  },
  {
    id: 'ln4',
    worldCode: 'w1',
    headline: 'Ordinary Day Overtime + Night Shift',
    prompt: 'Daisy’s shift is 2:00 PM to 10:00 PM, and she works overtime from 10:00 PM to 12:00 MN on an ordinary day. What combined multiplier applies to 10PM–12MN?',
    options: [
      '137.5% of regular hourly rate (125% overtime base multiplied by 1.10 night shift factor)',
      '135.0% of regular hourly rate (125% overtime base plus 10% straight additive differential)',
      '125.0% of regular hourly rate (overtime rate alone without separate night shift differential)',
      '150.0% of regular hourly rate (standard special non-working holiday premium equivalent)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 87, DOLE Handbook',
    explanation: 'Night Shift Differential stacks multiplicatively on top of the overtime hourly rate: 125% x 1.10 = 137.5%.',
  },
  {
    id: 'ln5',
    worldCode: 'holidays',
    headline: 'Regular Holiday Night Shift (First 8 Hours)',
    prompt: 'Bowser Jr. works an 8-hour graveyard shift (10:00 PM to 6:00 AM) on New Year’s Day (Regular Holiday). What multiplier applies?',
    options: [
      '220% of hourly rate (200% regular holiday base multiplied by 1.10 night differential)',
      '210% of hourly rate (200% regular holiday base plus 10% flat additive night differential)',
      '200% of hourly rate (standard unadjusted regular holiday rate without night differential)',
      '260% of hourly rate (holiday overtime rate computed with full statutory overtime factor)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 94, DOLE Handbook',
    explanation: 'Regular Holiday hourly rate is 200%, multiplied by 1.10 for night shift work = 220%.',
  },
  {
    id: 'ln6',
    worldCode: 'w1',
    headline: 'Managerial Staff Member at 11:30 PM',
    prompt: 'A bona fide Plant Manager (Art. 82 managerial employee) stays until midnight reviewing budgets. Can they demand statutory NSD?',
    options: [
      'No — managerial employees are excluded from Book III Title I coverage under Art. 82',
      'Yes — any worker performing duties past 10:00 PM is entitled to 10% night differential',
      'Yes — managerial staff receive an enhanced 20% night differential under executive policy',
      'Only if the managerial night work was approved in writing by the collective bargaining unit',
    ],
    correctIndex: 0,
    statute: 'Art. 82, Labor Code',
    explanation: 'Managerial employees and officers/members of the managerial staff are excluded from Title I (Hours of Work, OT, NSD).',
  },
  {
    id: 'ln7',
    worldCode: 'w2',
    headline: 'Rest Day Night Shift (First 8 Hours)',
    prompt: 'Toadette works 10:00 PM to 6:00 AM on her scheduled Rest Day (not a holiday). What hourly multiplier applies?',
    options: [
      '143% of regular hourly rate (130% scheduled rest day base multiplied by 1.10 factor)',
      '140% of regular hourly rate (130% rest day base plus 10% flat additive night differential)',
      '130% of regular hourly rate (ordinary rest day premium alone without night differential)',
      '169% of regular hourly rate (rest day overtime rate applied to all regular working hours)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 93(a)',
    explanation: 'Scheduled Rest Day rate is 130%, and working between 10:00 PM and 6:00 AM multiplies it by 1.10 = 143%.',
  },
  {
    id: 'ln8',
    worldCode: 'w4',
    headline: 'Night Worker Health Assessment',
    prompt: 'Under R.A. 10151 (Night Workers Law), can a night worker request a free health assessment before and during their night assignment?',
    options: [
      'Yes — night workers have statutory right to health assessments at no cost to themselves',
      'No — medical checkups are voluntary personal expenses deducted from monthly paychecks',
      'Only after completing at least five consecutive years on graveyard shift assignments',
      'Only workers in underground mining and hazardous chemical refineries enjoy this right',
    ],
    correctIndex: 0,
    statute: 'R.A. 10151 (Art. 154–156)',
    explanation: 'R.A. 10151 grants night workers the right to free health assessments and mandatory transfer to day work if certified unfit due to health or pregnancy.',
  },
  {
    id: 'ln9',
    worldCode: 'w4',
    headline: 'Pregnant Night Worker Mandatory Transfer',
    prompt: 'A pregnant employee on night shift presents a medical certificate that night work poses health risks to her unborn child. What is the employer\'s obligation?',
    options: [
      'Transfer her to suitable day work without loss of tenure, pay grade, or accrued seniority',
      'Grant mandatory immediate unpaid leave until delivery without guaranteeing job return',
      'Require her to sign a waiver absolving the employer of all health liabilities during shift',
      'Dismiss her with thirty days nominal separation pay under authorized operational closure',
    ],
    correctIndex: 0,
    statute: 'Art. 157, Labor Code (R.A. 10151)',
    explanation: 'Measures shall be taken to ensure an alternative to night work is available to women workers who would otherwise be called upon to perform such work during pregnancy or nursing.',
  },
  {
    id: 'ln10',
    worldCode: 'w4',
    headline: 'Safe Transportation for Night Workers',
    prompt: 'Under R.A. 10151 and DOLE guidelines, what duty exists regarding safe transportation for graveyard shift employees?',
    options: [
      'Employers must ensure suitable and safe transportation facilities during unholy hours',
      'Employees are strictly responsible for their own commute regardless of transit dangers',
      'Transportation duty applies only if workers reside more than twenty-five kilometers away',
      'The local city government alone bears complete responsibility for providing shuttle vans',
    ],
    correctIndex: 0,
    statute: 'R.A. 10151 & DOLE D.O. 119-12',
    explanation: 'Safe, comfortable, and suitable transport facilities shall be provided by employers for night workers from specified pickup/drop-off points to the workplace and vice versa.',
  },
  {
    id: 'ln11',
    worldCode: 'holidays',
    headline: 'Night Shift on Special Non-Working Day',
    prompt: 'Mario works from 10:00 PM to 6:00 AM on a Special Non-Working Day (ordinary day, not a rest day). What multiplier applies to the shift?',
    options: [
      '143% of regular hourly rate (130% special holiday base multiplied by 1.10 night factor)',
      '140% of regular hourly rate (130% special holiday base plus 10% straight night addition)',
      '130% of regular hourly rate (standard special holiday wage without night differential)',
      '195% of regular hourly rate (special day rest day overtime rate applied to night hours)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 93(c), DOLE Handbook',
    explanation: 'Special Non-Working Day is 130%, and working during the 10PM–6AM window adds 10% multiplicatively: 130% x 1.10 = 143%.',
  },
  {
    id: 'ln12',
    worldCode: 'w2',
    headline: 'Rest Day Overtime on Graveyard Shift',
    prompt: 'An employee works an overtime hour between 11:00 PM and 12:00 Midnight on their scheduled Rest Day. What hourly multiplier applies?',
    options: [
      '185.9% of hourly rate (169% rest day overtime base multiplied by 1.10 night differential)',
      '179.0% of hourly rate (169% rest day overtime base plus 10% flat additive night differential)',
      '169.0% of hourly rate (rest day overtime rate alone without night shift differential)',
      '220.0% of hourly rate (regular holiday graveyard rate applied to rest day overtime hours)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 87, DOLE Handbook',
    explanation: 'Rest day overtime is 169% (130% x 1.30). Night differential adds 10% of that total: 169% x 1.10 = 185.9%!',
  },
  {
    id: 'ln13',
    worldCode: 'holidays',
    headline: 'Regular Holiday Overtime at 2:00 AM',
    prompt: 'A worker renders overtime between 1:00 AM and 3:00 AM on a Regular Holiday. What multiplier applies to these overtime hours?',
    options: [
      '286% of hourly rate (260% holiday overtime base multiplied by 1.10 night differential)',
      '270% of hourly rate (260% holiday overtime base plus 10% flat additive night differential)',
      '260% of hourly rate (holiday overtime rate alone without night shift differential)',
      '338% of hourly rate (holiday rest day overtime rate applied to ordinary working days)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 & Art. 94, DOLE Handbook',
    explanation: 'Regular holiday overtime is 260% (200% x 1.30). Applying the 1.10 night shift differential yields: 260% x 1.10 = 286%!',
  },
  {
    id: 'ln14',
    worldCode: 'w4',
    headline: 'Lactation Breaks for Nursing Night Workers',
    prompt: 'Under R.A. 10028 (Expanded Breastfeeding Promotion Act), what lactation break intervals must be provided to nursing mothers during work?',
    options: [
      'At least 40 minutes of paid lactation periods for every eight-hour working shift',
      'At least 15 minutes of unpaid lactation intervals during standard lunch periods only',
      'At least 60 minutes of lactation leave deducted from annual service incentive credits',
      'Lactation breaks apply exclusively to daytime employees and never during night shifts',
    ],
    correctIndex: 0,
    statute: 'Sec. 12, R.A. 10028',
    explanation: 'Lactation periods shall not be less than a total of forty (40) minutes for every eight-hour working period, and are counted as compensable working hours.',
  },
  {
    id: 'ln15',
    worldCode: 'w1',
    headline: 'Piece-Rate Workers Night Shift Differential',
    prompt: 'Are piece-rate (takay) workers who render work between 10:00 PM and 6:00 AM entitled to Night Shift Differential under the Labor Code?',
    options: [
      'Yes — piece-rate workers are covered employees entitled to 10% night differential pay',
      'No — workers paid on piece-rate basis are strictly excluded from all Title I benefits',
      'Only if their daily output exceeds the statutory minimum output rate set by the DOLE',
      'Night differential applies only if piece-rate work is performed on a regular holiday',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule II Sec. 1',
    explanation: 'Piece-rate workers whose output rates are compliant with DOLE standards are employees entitled to statutory night shift differential for work between 10PM and 6AM.',
  },
  {
    id: 'ln16',
    worldCode: 'w1',
    headline: 'Field Personnel Night Shift Differential',
    prompt: 'A traveling medical sales representative whose actual working hours in the field cannot be determined works late at night. Do they get NSD?',
    options: [
      'No — bona fide field personnel whose hours cannot be determined are excluded under Art. 82',
      'Yes — anyone who sends an email after 10:00 PM is legally entitled to 10% night differential',
      'Yes — field representatives receive a mandatory flat 25% nighttime travel allowance',
      'Only if their quarterly sales targets are met within ninety percent of company forecast',
    ],
    correctIndex: 0,
    statute: 'Art. 82, Labor Code',
    explanation: 'Field personnel whose actual hours of work in the field cannot be determined with reasonable certainty are excluded from Article 86 Night Shift Differential.',
  },
  {
    id: 'ln17',
    worldCode: 'w1',
    headline: 'NSD on Ordinary Day Overtime',
    prompt: 'Mario renders 2 hours of overtime on an ordinary Tuesday from 10:00 PM to 12:00 Midnight. What is his total hourly rate for those 2 hours?',
    options: [
      '137.5% of regular hourly wage (125% ordinary overtime rate × 1.10 statutory night differential)',
      '125% of regular hourly wage (standard overtime rate without night differential compound)',
      '135% of regular hourly wage (simple addition of 25% overtime plus 10% night differential)',
      '150% of regular hourly wage (special day base rate applied to night overtime)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 + Art. 87, Labor Code',
    explanation: 'Overtime rendered between 10:00 PM and 6:00 AM on an ordinary day compounds: 125% overtime base multiplied by 1.10 NSD yields 137.5% per hour.',
  },
  {
    id: 'ln18',
    worldCode: 'w1',
    headline: 'NSD on Scheduled Rest Day (First 8 Hours)',
    prompt: 'Luigi is scheduled to work the graveyard shift from 10:00 PM to 6:00 AM on his designated weekly Rest Day. What multiplier applies to the 8 hours?',
    options: [
      '143% of regular hourly wage (130% rest day base multiplied by 1.10 night shift differential)',
      '130% of regular hourly wage (standard rest day multiplier without night differential addition)',
      '140% of regular hourly wage (simple arithmetic sum of 30% rest day plus 10% night premium)',
      '150% of regular hourly wage (special holiday rest day multiplier)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 + Art. 93, Labor Code',
    explanation: 'Work on a scheduled Rest Day earns 130% of basic wage. Night Shift Differential adds 10% of that rest day rate: 130% × 1.10 = 143% of regular hourly wage.',
  },
  {
    id: 'ln19',
    worldCode: 'w1',
    headline: 'NSD on Special Non-Working Day (First 8 Hours)',
    prompt: 'Toad works a full graveyard shift from 10:00 PM to 6:00 AM on Ninoy Aquino Day (Special Non-Working Day). What multiplier applies to the shift?',
    options: [
      '143% of regular hourly wage (130% special day base multiplied by 1.10 night shift differential)',
      '130% of regular hourly wage (standard special non-working day rate)',
      '150% of regular hourly wage (special day on rest day rate)',
      '165% of regular hourly wage (special day on rest day with night differential)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 + Art. 93, Labor Code',
    explanation: 'Work performed on a Special Non-Working Day pays 130%. Night hours between 10:00 PM and 6:00 AM earn an extra 10% of that rate: 130% × 1.10 = 143%.',
  },
  {
    id: 'ln20',
    worldCode: 'w1',
    headline: 'NSD on Special Day Falling on Rest Day',
    prompt: 'Yoshi works from 10:00 PM to 6:00 AM on All Saints\' Day (Special Day) which also falls on his scheduled Rest Day. What hourly multiplier applies?',
    options: [
      '165% of regular hourly wage (150% special rest day base multiplied by 1.10 night differential)',
      '150% of regular hourly wage (special day on rest day base without night differential)',
      '160% of regular hourly wage (arithmetic sum of 50% premium plus 10% night differential)',
      '195% of regular hourly wage (special day rest day overtime multiplier)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 + Art. 93(c), Labor Code',
    explanation: 'Work on a Special Non-Working Day falling on a Rest Day pays 150%. Night shift differential adds 10% of that base: 150% × 1.10 = 165% of regular hourly wage.',
  },
  {
    id: 'ln21',
    worldCode: 'holidays',
    headline: 'NSD on Regular Holiday (First 8 Hours)',
    prompt: 'Peach works a graveyard shift from 10:00 PM to 6:00 AM on Labor Day (Regular Holiday). What is the total hourly multiplier for the 8 hours?',
    options: [
      '220% of regular hourly wage (200% regular holiday base multiplied by 1.10 night differential)',
      '200% of regular hourly wage (standard regular holiday base without night differential)',
      '210% of regular hourly wage (arithmetic sum of 100% premium plus 10% night differential)',
      '260% of regular hourly wage (regular holiday on rest day multiplier)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 + Art. 94, Labor Code',
    explanation: 'Work on a Regular Holiday pays 200%. Night shift differential between 10:00 PM and 6:00 AM adds 10% of the holiday rate: 200% × 1.10 = 220% of regular hourly wage.',
  },
  {
    id: 'ln22',
    worldCode: 'holidays',
    headline: 'NSD on Regular Holiday Falling on Rest Day',
    prompt: 'Donkey Kong works from 10:00 PM to 6:00 AM on Christmas Day (Regular Holiday) which coincides with his scheduled Rest Day. What multiplier applies?',
    options: [
      '286% of regular hourly wage (260% holiday rest day base multiplied by 1.10 night differential)',
      '260% of regular hourly wage (holiday rest day base without night differential)',
      '270% of regular hourly wage (arithmetic sum of 260% plus 10% flat differential)',
      '300% of regular hourly wage (double regular holiday base multiplier)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 + Art. 94, Labor Code; DOLE Handbook',
    explanation: 'Work on a Regular Holiday on a Rest Day pays 260% (200% × 1.30). Night differential compounds at 10% of that rate: 260% × 1.10 = 286% per hour.',
  },
  {
    id: 'ln23',
    worldCode: 'holidays',
    headline: 'NSD on Overtime on a Regular Holiday',
    prompt: 'Mario renders 2 hours overtime from 10:00 PM to 12:00 Midnight on Independence Day (Regular Holiday). What is the total hourly rate?',
    options: [
      '286% of regular hourly wage (200% holiday base × 1.30 overtime factor × 1.10 night differential)',
      '260% of regular hourly wage (holiday overtime rate without night differential)',
      '270% of regular hourly wage (holiday base plus flat 70% overtime and night additions)',
      '338% of regular hourly wage (holiday rest day overtime multiplier)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 + Art. 87 + Art. 94, Labor Code',
    explanation: 'Overtime on a Regular Holiday is 260% (200% × 1.30). Working that overtime between 10:00 PM and 6:00 AM adds 10% NSD: 260% × 1.10 = 286% per hour.',
  },
  {
    id: 'ln24',
    worldCode: 'holidays',
    headline: 'NSD on Overtime on Regular Holiday on Rest Day',
    prompt: 'Luigi renders 2 hours overtime from 10:00 PM to 12:00 Midnight on a Regular Holiday on his scheduled Rest Day. What is the multiplier for those 2 hours?',
    options: [
      '371.8% of regular hourly wage (260% base × 1.30 overtime factor × 1.10 night differential)',
      '338% of regular hourly wage (holiday rest day overtime rate without night differential)',
      '390% of regular hourly wage (double holiday rest day multiplier)',
      '507% of regular hourly wage (double holiday rest day overtime rate)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 + Art. 87 + Art. 94, Labor Code',
    explanation: 'Holiday on Rest Day is 260%. Overtime adds 30% (260% × 1.30 = 338%). Night shift differential adds 10% to that overtime rate: 338% × 1.10 = 371.8%.',
  },
  {
    id: 'ln25',
    worldCode: 'holidays',
    headline: 'Double Regular Holiday with Night Shift Differential',
    prompt: 'Toad works the graveyard shift from 10:00 PM to 6:00 AM on a Double Regular Holiday. What is the total hourly multiplier for the first 8 hours?',
    options: [
      '330% of regular hourly wage (300% double holiday base multiplied by 1.10 night differential)',
      '300% of regular hourly wage (double holiday base rate without night differential)',
      '310% of regular hourly wage (arithmetic sum of 300% base plus 10% flat differential)',
      '390% of regular hourly wage (double holiday on rest day multiplier)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 + Art. 94, Labor Code; DOLE Handbook',
    explanation: 'Work on a Double Regular Holiday pays 300% for the first 8 hours. The 10% Night Shift Differential applies to this rate: 300% × 1.10 = 330% of regular hourly wage.',
  },
  {
    id: 'ln26',
    worldCode: 'holidays',
    headline: 'Double Regular Holiday on Rest Day with NSD',
    prompt: 'Yoshi works from 10:00 PM to 6:00 AM on a Double Regular Holiday falling on his scheduled Rest Day. What is his total hourly rate?',
    options: [
      '429% of regular hourly wage (390% double holiday rest day rate multiplied by 1.10 NSD)',
      '390% of regular hourly wage (double holiday rest day rate without night differential)',
      '400% of regular hourly wage (arithmetic sum of 390% plus 10% flat differential)',
      '507% of regular hourly wage (double holiday rest day overtime rate)',
    ],
    correctIndex: 0,
    statute: 'Art. 86 + Art. 94, Labor Code; DOLE Handbook',
    explanation: 'A Double Regular Holiday on a Rest Day earns 390% (300% × 1.30). Graveyard hours earn 10% Night Shift Differential: 390% × 1.10 = 429% of regular hourly wage.',
  },
  {
    id: 'ln27',
    worldCode: 'w1',
    headline: 'Mandatory Night Worker Health Assessment (R.A. 10151)',
    prompt: 'Under Republic Act No. 10151, who is legally obligated to bear the cost of required medical health assessments for employees assigned to night work?',
    options: [
      'The employer bears the cost of all mandatory medical examinations at no expense to the worker',
      'The employee pays for the medical exam but may claim PhilHealth reimbursement within 1 year',
      'The cost is split 50/50 between the employer and employee under DOLE standard wellness rules',
      'The local city health office covers all costs through national social healthcare subsidies',
    ],
    correctIndex: 0,
    statute: 'R.A. 10151 (Employment of Night Workers Act)',
    explanation: 'Under R.A. 10151, night workers have the right to undergo a health assessment without charge and to receive advice on reducing health problems associated with night work.',
  },
  {
    id: 'ln28',
    worldCode: 'w1',
    headline: 'Pregnant Night Worker Protection (R.A. 10151)',
    prompt: 'A female IT support technician submits a medical certificate showing pregnancy and requests reassignment from the 10:00 PM to 6:00 AM shift. How must the employer respond?',
    options: [
      'Must transfer her to day work or grant maternity-related leave without loss of tenure or benefits',
      'May deny the request if the night shift is critically understaffed and cannot find a replacement',
      'May terminate her employment under Art. 299 as an authorized medical separation with severance',
      'May require her to sign a waiver absolving the company of liability if she stays on graveyard',
    ],
    correctIndex: 0,
    statute: 'R.A. 10151 (Night Work for Pregnant / Nursing Workers)',
    explanation: 'R.A. 10151 mandates that measures shall be taken to ensure an alternative to night work is available to women workers before and after childbirth for at least 16 weeks.',
  },
  {
    id: 'ln29',
    worldCode: 'w5',
    headline: 'Domestic Worker (Kasambahay) Night Shift Entitlement',
    prompt: 'A live-in Kasambahay is asked to attend to a newborn baby between 11:00 PM and 3:00 AM. Does she have a statutory claim for 10% Night Shift Differential?',
    options: [
      'No — domestic workers under R.A. 10361 are governed by their special law and excluded from Art. 86',
      'Yes — all workers in private homes are entitled to 10% night differential under the Constitution',
      'Yes — provided the baby is older than 6 months of age and requires active feeding preparation',
      'Only if the domestic worker earns less than the NCR statutory minimum wage of ₱610/day',
    ],
    correctIndex: 0,
    statute: 'Art. 82, Labor Code; R.A. 10361 (Batas Kasambahay)',
    explanation: 'Art. 82 expressly excludes domestic workers from Title I (Working Conditions and Rest Periods), including Art. 86 Night Shift Differential. Their rights are governed by R.A. 10361.',
  },
  {
    id: 'ln30',
    worldCode: 'w1',
    headline: 'Shift Spanning Daytime and Nighttime Hours',
    prompt: 'Mario works an 8-hour shift from 3:00 PM to 12:00 Midnight, with a 1-hour unpaid meal break from 7:00 PM to 8:00 PM. How many hours qualify for 10% NSD?',
    options: [
      '2 hours (only hours worked between 10:00 PM and 12:00 Midnight fall in the statutory night window)',
      '4 hours (all hours worked after sunset from 8:00 PM to 12:00 Midnight earn night differential)',
      '8 hours (if any part of an employee\'s shift touches nighttime, the entire shift earns NSD)',
      '1 hour (only the final hour approaching midnight qualifies under DOLE standard rules)',
    ],
    correctIndex: 0,
    statute: 'Art. 86, Labor Code',
    explanation: 'Night Shift Differential applies strictly to hours actually worked within the statutory window of 10:00 PM to 6:00 AM. From 10:00 PM to 12:00 Midnight equals 2 hours of NSD.',
  },
  {
    id: 'ln31',
    worldCode: 'w1',
    headline: 'Graveyard Shift 1-Hour Meal Break and NSD',
    prompt: 'A call center agent on a 10:00 PM to 7:00 AM schedule takes a 1-hour meal break from 2:00 AM to 3:00 AM completely free from work. Does the meal hour earn NSD?',
    options: [
      'No — a bona fide 60-minute meal break is non-compensable and does not earn wages or NSD',
      'Yes — because the meal break occurred between 10:00 PM and 6:00 AM, NSD must be paid',
      'Yes — but only at a 50% discounted night rate of 5% instead of the standard 10%',
      'Compensable only if the company cafeteria was closed during the graveyard shift',
    ],
    correctIndex: 0,
    statute: 'Art. 85 & Art. 86, Labor Code',
    explanation: 'Under Art. 85, a regular 60-minute meal interval free from duties is not hours worked. Since NSD is an additional percentage of regular wages, unpaid non-work meal time earns no NSD.',
  },
  {
    id: 'ln32',
    worldCode: 'w1',
    headline: 'Contractual Waiver of Night Shift Differential',
    prompt: 'A hotel night auditor signs an employment agreement stipulating: \'Employee agrees to waive statutory 10% NSD in exchange for free company van shuttle service.\' Is this valid?',
    options: [
      'Void — statutory night shift differential is mandated by public law and cannot be waived by contract',
      'Valid — employee freely agreed to the contract term with valuable shuttle consideration',
      'Valid — provided the monetary market value of the shuttle service exceeds the 10% differential',
      'Void only if the night auditor is a union officer or shop steward covered by an active CBA',
    ],
    correctIndex: 0,
    statute: 'Art. 86, Labor Code; Pampanga Bus Co. v. Pambusco Employees Union',
    explanation: 'Labor standards laws are imbued with public interest. Provisions waiving statutory benefits like overtime, NSD, or minimum wages are contrary to public policy and void ab initio.',
  },
];

export const ROSALINA_WAGE_MATRIX_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'rw1',
    worldCode: 'w3',
    headline: 'Facilities vs Supplements Test',
    prompt: 'What is the controlling Supreme Court test to determine if an item is a deductible \'Facility\' or a non-deductible \'Supplement\'?',
    options: [
      'Purpose Test — whether primarily for employee benefit or necessary for employer trade',
      'Cost Test — whether the monetary cost of the benefit exceeds one thousand pesos',
      'Location Test — whether the item or service is utilized inside or outside the workplace',
      'Seniority Test — whether the benefit is reserved exclusively for tenured regular workers',
    ],
    correctIndex: 0,
    statute: 'Mabeza v. NLRC & Art. 97(f)',
    explanation: 'Under the Purpose Test, independent of designation, if an item benefits the employer\'s trade (like specialized uniforms/meals on overtime), it is a non-deductible Supplement.',
  },
  {
    id: 'rw2',
    worldCode: 'w3',
    headline: '3 Requisites to Deduct a Facility',
    prompt: 'Even if meals/lodging qualify as a Facility, what 3 strict requirements must an employer prove before deducting their cost from minimum wage?',
    options: [
      'Customary in trade + Voluntary written employee acceptance + Fair and reasonable value',
      'Verbal notice + Supervisor endorsement memo + Prevailing local commercial market price',
      'Collective bargaining agreement clause alone without individual employee authorizations',
      'Board of Directors resolution approved by majority stockholders plus thirty days notice',
    ],
    correctIndex: 0,
    statute: 'Our Haus Realty v. Parian',
    explanation: 'Without proof of customariness, voluntary written authorization by the employee, and fair/reasonable valuation, facility deductions are illegal.',
  },
  {
    id: 'rw3',
    worldCode: 'w3',
    headline: 'D.O. 174-17 Substantial Capital Threshold',
    prompt: 'Under DOLE Department Order No. 174-17, what minimum paid-up capital / net worth defines \'Substantial Capital\' for contractor entities?',
    options: [
      'At least PHP 5,000,000 paid-up capital or net worth (raised from old threshold)',
      'At least PHP 3,000,000 paid-up capital or net worth for corporate entities only',
      'At least PHP 1,000,000 paid-up capital or net worth for all business partnerships',
      'At least PHP 500,000 paid-up capital or net worth for single sole proprietorships',
    ],
    correctIndex: 0,
    statute: 'DOLE D.O. No. 174-17 Sec. 3(l)',
    explanation: 'D.O. 174-17 raised the minimum substantial capital requirement to PHP 5,000,000 paid-up capital stocks/shares or net worth.',
  },
  {
    id: 'rw4',
    worldCode: 'w3',
    headline: 'Wage Distortion Definition',
    prompt: 'A new RTWPB Wage Order raises minimum wage from PHP 570 to PHP 610, wiping out the intentional pay gap with supervisors earning PHP 615. What is this called?',
    options: [
      'Wage Distortion — statutory elimination or severe contraction of wage differences',
      'Non-Diminution Violation — illegal reduction of long-standing voluntary company benefits',
      'Constructive Dismissal — creating intolerable working conditions forcing staff exit',
      'Unfair Labor Practice — anti-union discrimination or interference with collective bargaining',
    ],
    correctIndex: 0,
    statute: 'Art. 124, Labor Code (R.A. 6727)',
    explanation: 'Wage distortion occurs when a prescribed wage increase eliminates or severely contracts intentional quantitative differences between wage groups.',
  },
  {
    id: 'rw5',
    worldCode: 'w3',
    headline: 'Resolving Wage Distortion in Unorganized Firm',
    prompt: 'In an unorganized establishment (no union), if employer and workers fail to settle a wage distortion within 10 days, where is it referred?',
    options: [
      'NCMB for conciliation (10 days), then NLRC Labor Arbiter for compulsory arbitration',
      'Regular Regional Trial Court for immediate declaratory relief and preliminary injunction',
      'Barangay Lupon Tagapamayapa under the Katarungang Pambarangay conciliation framework',
      'The employees are legally authorized to stage an immediate wildcat industrial strike',
    ],
    correctIndex: 0,
    statute: 'Art. 124, Labor Code',
    explanation: 'Wage distortion is non-strikeable! Unorganized disputes go to NCMB conciliation first, then to the NLRC Labor Arbiter.',
  },
  {
    id: 'rw6',
    worldCode: 'w3',
    headline: 'Double Indemnity Penalty',
    prompt: 'Under R.A. 8188, an employer who refuses or fails to pay a prescribed RTWPB minimum wage increase is liable for:',
    options: [
      'Double indemnity — twice the unpaid wage increase plus potential criminal liability',
      'Half of the unpaid wage differential provided the employer settles within ninety days',
      'Nominal damages of ten thousand pesos without liability for back wage differentials',
      'A formal warning letter issued by the Regional Director with no financial penalties',
    ],
    correctIndex: 0,
    statute: 'R.A. 8188 (amending R.A. 6727 Sec. 12)',
    explanation: 'R.A. 8188 imposes double indemnity (twice the unpaid prescribed wage increase) plus potential criminal liability.',
  },
  {
    id: 'rw7',
    worldCode: 'w3',
    headline: 'Non-Diminution of Benefits (Art. 100)',
    prompt: 'For 8 years, a company deliberately and unconditionally paid a Mid-Year Rice Grant even without a legal mandate. Can management unilaterally revoke it?',
    options: [
      'No — it has ripened into a company practice protected by Art. 100 Non-Diminution',
      'Yes — management prerogative permits unilateral withdrawal of voluntary bonuses at will',
      'Yes — provided the employer serves thirty days advance notice to the Department of Labor',
      'Only if the company\'s external certified public accountant certifies operational losses',
    ],
    correctIndex: 0,
    statute: 'Art. 100, Labor Code',
    explanation: 'Consistent, deliberate, long-standing, unconditional grants ripen into demandable benefits that cannot be unilaterally withdrawn.',
  },
  {
    id: 'rw8',
    worldCode: 'w2',
    headline: '100% Service Charge Distribution',
    prompt: 'Under R.A. 11360 amending Art. 96, what share of service charges collected by hotels and restaurants belongs to covered employees?',
    options: [
      '100% distributed completely and equally among covered non-managerial employees',
      '85% distributed to rank-and-file workers and 15% retained by hotel management',
      '90% distributed to covered workers and 10% reserved for glassware and dish breakages',
      '50% distributed to kitchen personnel and 50% retained by establishment owners',
    ],
    correctIndex: 0,
    statute: 'R.A. 11360 (Art. 96)',
    explanation: 'R.A. 11360 abolished the old 85%-15% split; 100% of collected service charges must go to covered rank-and-file/non-managerial workers.',
  },
  {
    id: 'rw9',
    worldCode: 'w2',
    headline: '13th Month Pay Proportionate Share for Resignees',
    prompt: 'An employee resigns effective July 1 after working exactly 6 months in the calendar year. Are they entitled to 13th Month Pay?',
    options: [
      'Yes — entitled to a proportionate 13th month pay equal to 6/12 of total basic earnings',
      'No — 13th month pay is strictly forfeited if an employee resigns prior to December 24',
      'Only if the employee rendered at least five continuous years of service prior to exit',
      'Only if the resignation was approved by management with an explicit waiver of claims',
    ],
    correctIndex: 0,
    statute: 'P.D. 851 & Revised Guidelines Sec. 6',
    explanation: 'An employee who has resigned or whose services were terminated at any time before payment of the 13th month pay is entitled to this benefit in proportion to length of service.',
  },
  {
    id: 'rw10',
    worldCode: 'w3',
    headline: 'Uniform Cost Deduction from Minimum Wage',
    prompt: 'A security agency deducts PHP 800/month for required duty uniforms, dropping the guard\'s take-home pay below minimum wage. Lawful or Illegal?',
    options: [
      'Illegal — uniforms required for company business are supplements that cannot cut wage',
      'Lawful — employers have full managerial discretion to deduct company gear expenses',
      'Lawful provided the security guard is given two complete sets of uniforms per year',
      'Illegal only if the security guard resigns within ninety days of initial employment',
    ],
    correctIndex: 0,
    statute: 'Art. 97(f) & Mabeza v. NLRC',
    explanation: 'Specialized uniforms required by the employer are Supplements for the employer\'s benefit, not Facilities, and cannot be deducted from wages.',
  },
  {
    id: 'rw11',
    worldCode: 'w3',
    headline: 'Retail and Service Minimum Wage Exemption',
    prompt: 'Under Republic Act No. 6727 (Wage Rationalization Act), which establishments may apply for exemption from RTWPB Wage Orders?',
    options: [
      'Retail and service establishments regularly employing not more than 10 workers',
      'All registered export processing zone corporations employing fewer than 100 workers',
      'Information technology business process outsourcing firms operating on night shifts',
      'Establishments where over fifty percent of equity is owned by foreign investors',
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 6727 & NWPC Guidelines',
    explanation: 'Retail/service establishments regularly employing not more than ten (10) workers and distressed establishments may apply for statutory exemption from Wage Orders.',
  },
  {
    id: 'rw12',
    worldCode: 'w3',
    headline: 'Legitimate Job Contracting Elements',
    prompt: 'What two core elements must co-exist to establish legitimate independent contracting under D.O. No. 174-17?',
    options: [
      'Substantial capital / equipment AND right of control over the manner of doing work',
      'Registration with the Securities and Exchange Commission AND an office lease contract',
      'At least fifty regular employees AND a certified collective bargaining agreement',
      'ISO 9001 corporate certification AND five years continuous business registration',
    ],
    correctIndex: 0,
    statute: 'D.O. 174-17 Sec. 8',
    explanation: 'Legitimate contracting requires distinct capital/equipment and freedom from the principal\'s control as to the manner and methods of performing the work.',
  },
  {
    id: 'rw13',
    worldCode: 'w3',
    headline: 'Labor-Only Contracting Legal Consequence',
    prompt: 'When a contractor is declared a \'Labor-Only Contractor\' by the DOLE or NLRC, what is the statutory legal consequence?',
    options: [
      'The principal is declared the direct employer of the workers as if directly hired',
      'The contractor alone pays a nominal administrative fine with no impact on employment',
      'The workers are immediately separated from service with thirty days separation pay',
      'The workers are transferred to civil service government status under the Labor Code',
    ],
    correctIndex: 0,
    statute: 'Art. 106, Labor Code & D.O. 174-17 Sec. 12',
    explanation: 'In labor-only contracting, the contractor is treated merely as an agent of the principal, and the principal is deemed the direct employer of the deployed workers.',
  },
  {
    id: 'rw14',
    worldCode: 'w3',
    headline: 'Wage Distortion Non-Strikeable Doctrine',
    prompt: 'A union stages a strike over a wage distortion resulting from a newly issued Wage Order. Is this strike legal or illegal?',
    options: [
      'Illegal — Article 124 mandates settlement through grievance machinery or arbitration',
      'Legal — wage distortion is an economic issue that constitutes a valid strike ground',
      'Legal provided the union filed a thirty-day strike notice with the NCMB beforehand',
      'Legal if approved by two-thirds of all union members during a secret balloting',
    ],
    correctIndex: 0,
    statute: 'Art. 124, Labor Code; Ilaw at Buklod v. NLRC',
    explanation: 'Wage distortion is non-strikeable under Article 124. Any strike staged on the ground of wage distortion is illegal and exposes union officers to dismissal.',
  },
  {
    id: 'rw15',
    worldCode: 'w2',
    headline: '13th Month Pay Mandatory Deadline',
    prompt: 'Under Presidential Decree No. 851, what is the absolute latest deadline for employers to disburse the mandatory 13th Month Pay?',
    options: [
      'On or before December 24 of each calendar year (statutory mandatory deadline)',
      'On or before December 31 coinciding with the end of the corporate fiscal year',
      'On or before January 15 of the following calendar year along with annual tax forms',
      'On or before November 30 to coincide with the standard national holiday bonus',
    ],
    correctIndex: 0,
    statute: 'P.D. 851 Sec. 1',
    explanation: 'P.D. 851 mandates that 13th month pay shall be paid not later than December 24 of each year.',
  },
  {
    id: 'rw16',
    worldCode: 'w2',
    headline: 'Exclusions from Basic Salary for 13th Month',
    prompt: 'Under P.D. 851 revised guidelines, which payments are excluded from the \'Basic Salary\' used to compute 13th Month Pay?',
    options: [
      'Overtime pay, night differential, holiday pay, and cost-of-living allowances (COLA)',
      'Regular basic hourly wages earned during ordinary daytime working schedules',
      'Paid sick leaves and vacation leaves commuted to cash during regular payroll runs',
      'Statutory daily minimum wage rates mandated by the regional wage boards',
    ],
    correctIndex: 0,
    statute: 'Revised Guidelines on P.D. 851',
    explanation: 'Basic salary includes all remunerations paid for services rendered but excludes overtime, night shift differential, holiday pay, unused leave cash conversions, and COLA unless treated as basic pay by company practice.',
  },
  {
    id: 'rw17',
    worldCode: 'w2',
    headline: 'Commission-Based Workers 13th Month Pay',
    prompt: 'Are sales representatives whose compensation consists of basic salary plus sales commission entitled to have commission included in 13th month pay?',
    options: [
      'Yes — productivity/sales commissions based on actual quota achievements form part of basic salary',
      'No — all forms of commission are legally classified as profit-sharing bonuses exempt from 13th month',
      'Only if the sales commission exceeds fifty percent of the worker\'s gross annual take-home pay',
      'Commissions are included only if approved by unanimous resolution of the board of directors',
    ],
    correctIndex: 0,
    statute: 'Philippine Duplicators v. NLRC; Boie-Takeda v. Dela Serna',
    explanation: 'Under Philippine Duplicators, commissions earned through direct sales efforts form part of the basic salary for 13th month computation, distinguishing them from pure profit-sharing bonuses.',
  },
  {
    id: 'rw18',
    worldCode: 'w2',
    headline: 'Piece-Rate Workers (Pakyao) Minimum Wage Entitlement',
    prompt: 'Are piece-rate workers (paid per basket, shoe, or piece manufactured) entitled to the statutory minimum wage?',
    options: [
      'Yes — under Art. 101, piece-rate workers must receive wages not less than the statutory minimum for 8 hours',
      'No — piece-rate compensation is strictly output-based and exempt from regional wage orders',
      'Only if the piece-rate worker renders more than twelve hours of continuous labor per day',
      'Only if the employer is an agricultural plantation enterprise with over one hundred workers',
    ],
    correctIndex: 0,
    statute: 'Art. 101, Labor Code; DOLE Rules on Piece-Rate Workers',
    explanation: 'Article 101 guarantees that workers paid by results (piece-rate or pakyao) shall receive not less than the applicable statutory minimum wage rate for normal 8 hours work.',
  },
  {
    id: 'rw19',
    worldCode: 'w2',
    headline: 'Wage Order Effectivity Under R.A. 6727',
    prompt: 'Under Republic Act No. 6727 (Wage Rationalization Act), when does a Wage Order issued by an RTWPB take legal effect?',
    options: [
      'Fifteen (15) days after complete publication in at least one regional newspaper of general circulation',
      'Immediately upon signing by the regional wage board members without publication requirement',
      'On the first day of the following calendar year after endorsement by the DOLE Secretary',
      'Thirty (30) days after approval by the National Wages and Productivity Commission (NWPC)',
    ],
    correctIndex: 0,
    statute: 'R.A. 6727 Sec. 9(d); Art. 122, Labor Code',
    explanation: 'A Wage Order issued by an RTWPB takes effect 15 days following its complete publication in at least one newspaper of general circulation in the region.',
  },
  {
    id: 'rw20',
    worldCode: 'w2',
    headline: 'Wage Distortion in Organized (Unionized) Establishments',
    prompt: 'How must an employer and a certified union resolve a wage distortion arising from a new statutory minimum wage order?',
    options: [
      'Through the CBA grievance procedure, and if unresolved, through voluntary arbitration under Art. 124',
      'By immediate unilateral decree of the plant general manager without consulting the union',
      'By filing a direct petition for declaratory relief with the regional trial court',
      'By automatic strike vote filed before the National Conciliation and Mediation Board',
    ],
    correctIndex: 0,
    statute: 'Art. 124, Labor Code; Ilaw at Buklod ng Manggagawa v. NLRC',
    explanation: 'Art. 124 mandates that wage distortions in organized establishments be resolved through the grievance machinery in the CBA, and if unresolved, submitted to voluntary arbitration.',
  },
  {
    id: 'rw21',
    worldCode: 'w2',
    headline: 'Wage Distortion in Unorganized (Non-Union) Establishments',
    prompt: 'In a company without a labor union, how does the Labor Code mandate the resolution of an unsettled wage distortion?',
    options: [
      'Employer and workers confer; if unsettled, conciliation by NCMB, then compulsory arbitration by Labor Arbiter',
      'The regional wage board immediately revokes the company\'s business permit until settled',
      'Employees must stage a walkout to compel the employer to execute a wage adjustment contract',
      'The dispute is automatically referred to the Securities and Exchange Commission for mediation',
    ],
    correctIndex: 0,
    statute: 'Art. 124, Labor Code',
    explanation: 'In unorganized firms, employers and workers shall endeavor to settle. If unresolved, it is submitted to the NCMB for conciliation, and if failing, to the Labor Arbiter for compulsory arbitration within 10 days.',
  },
  {
    id: 'rw22',
    worldCode: 'w3',
    headline: 'Deductions for Company-Branded Uniforms',
    prompt: 'A security agency deducts ₱600 monthly from a guard\'s minimum wage to cover the cost of company-required uniforms. Is this deduction lawful?',
    options: [
      'Unlawful — uniforms required by the employer\'s business are operating expenses and cannot be deducted',
      'Lawful — provided the security agency issues an official receipt for the clothing acquisition',
      'Lawful — as long as the total uniform deduction does not exceed twenty percent of monthly wage',
      'Unlawful only if the guard resigns before completing six months of probationary service',
    ],
    correctIndex: 0,
    statute: 'Art. 113, Labor Code; DOLE Labor Advisory No. 11-14',
    explanation: 'Under Art. 113 and DOLE advisories, clothing or uniforms required for the company\'s business or branding are Supplements and cannot be deducted from wages.',
  },
  {
    id: 'rw23',
    worldCode: 'w3',
    headline: 'Cash Deposit for Tool / Cashier Bonds (Art. 114)',
    prompt: 'A retail mart requires newly hired cashiers to post a ₱5,000 cash bond via salary deduction to answer for register shortages. Is this permissible?',
    options: [
      'Unlawful — wage deductions for deposits are prohibited unless authorized by law or DOLE recognition',
      'Lawful — retail employers have absolute prerogative to secure monetary holdings against loss',
      'Lawful — provided the deposit is placed in an interest-bearing escrow account in the worker\'s name',
      'Permissible if the cashier signed a job application acknowledging the security deposit clause',
    ],
    correctIndex: 0,
    statute: 'Art. 114, Labor Code; Duka v. Far East Bank',
    explanation: 'Art. 114 prohibits employers from requiring workers to make cash deposits for loss of tools or materials, unless the employer is engaged in an industry where the practice is recognized by DOLE.',
  },
  {
    id: 'rw24',
    worldCode: 'w2',
    headline: 'Payment of Wages via Automated Teller Machines (ATM)',
    prompt: 'Under DOLE Labor Advisory rules, what conditions must be satisfied before an employer may disburse wages through bank ATM cards?',
    options: [
      'ATM within 1km radius + Free withdrawals during paydays + Timely credit + Advance worker consent',
      'Payment through ATM is strictly prohibited and wages must always be handed over in cash envelopes',
      'Employer may impose ATM payroll unilaterally even if workers incur ₱50 withdrawal fees per payout',
      'ATM payroll requires prior presidential executive order approval and union ratification',
    ],
    correctIndex: 0,
    statute: 'Labor Advisory on Payment of Wages through ATM; Art. 104',
    explanation: 'ATM payroll is valid when agreed by majority of workers, the bank is within 1 km or easy transport, withdrawals on payday are without cost, and funds are credited on time.',
  },
  {
    id: 'rw25',
    worldCode: 'w2',
    headline: 'Non-Diminution of Benefits Four Strict Requisites',
    prompt: 'What 4 elements must concur before an employer\'s unilateral withdrawal of a benefit violates Article 100 (Non-Diminution)?',
    options: [
      'Ripe benefit + Long uninterrupted practice + Voluntary employer grant + Not based on legal error',
      'Union contract + High company profits + Ministerial approval + Written board resolution',
      'Two years duration + Cash compensation format + Supervisory rank + Government endorsement',
      'Employee formal demand + DOLE compliance audit + Lack of CBA negotiation + Profitability',
    ],
    correctIndex: 0,
    statute: 'Art. 100, Labor Code; Vergara v. Coca-Cola Bottlers Philippines',
    explanation: 'Non-diminution requires: (1) benefit is founded on policy/practice; (2) given continuously over a long period; (3) done voluntarily; and (4) not given through error in the construction of a doubtful law.',
  },
  {
    id: 'rw26',
    worldCode: 'w2',
    headline: 'Bonus as a Demandable Statutory Obligation',
    prompt: 'When does a voluntary year-end performance bonus transform into a legally enforceable obligation demandable as a matter of right?',
    options: [
      'When promised in an employment contract, CBA, or granted unconditionally as consistent company practice',
      'Only when the company\'s net income exceeds fifty million pesos in the audited fiscal year',
      'Never — a bonus is always an act of pure generosity and can never become legally demandable',
      'Only if the worker was never late or absent throughout the twelve months of the calendar year',
    ],
    correctIndex: 0,
    statute: 'Producers Bank of the Philippines v. NLRC; Eastern Telecommunications v. Diamse',
    explanation: 'A bonus becomes demandable when it is made part of the wage contract, stipulated in a CBA, or when it has ripened into company practice through consistent, unconditional grants over time.',
  },
  {
    id: 'rw27',
    worldCode: 'w2',
    headline: 'Attorney\'s Fees Limit in Wage Recovery (Art. 111)',
    prompt: 'In judicial or administrative proceedings for the recovery of unpaid wages, what is the maximum attorney\'s fees recoverable under Article 111?',
    options: [
      'Ten percent (10%) of the total amount of wages recovered',
      'Twenty-five percent (25%) of the total award including moral damages',
      'A flat fee of five thousand pesos determined by the Labor Arbiter',
      'Zero — attorney\'s fees are completely barred in all Philippine labor litigation',
    ],
    correctIndex: 0,
    statute: 'Art. 111, Labor Code; Taganas v. NLRC',
    explanation: 'Article 111(a) provides that in cases of unlawful withholding of wages, the culpable party may be assessed attorney’s fees equivalent to ten percent (10%) of the amount of wages recovered.',
  },
  {
    id: 'rw28',
    worldCode: 'w2',
    headline: 'Garnishment Exemption of Minimum Wages',
    prompt: 'A commercial lending company obtains a trial court writ of execution garnishing a factory worker\'s minimum wage for unpaid credit debt. Is this valid?',
    options: [
      'Void — laborer\'s wages are exempt from execution, garnishment, and attachment under Art. 1708 of Civil Code',
      'Valid — any civil court writ of execution automatically overrides labor standards exemptions',
      'Valid — up to fifty percent of minimum wage may be seized to satisfy consumer credit claims',
      'Valid only if the employee failed to file an answer within fifteen days of court summons',
    ],
    correctIndex: 0,
    statute: 'Art. 1708, Civil Code; Pacific Products v. Ong',
    explanation: 'Art. 1708 of the Civil Code explicitly exempts the laborer’s wages from execution or attachment, except for debts incurred for food, shelter, clothing and medical attendance.',
  },
  {
    id: 'rw29',
    worldCode: 'w2',
    headline: 'Service Charge 100% Equal Distribution (R.A. 11360)',
    prompt: 'Under R.A. 11360 amending Article 96, how must hotels and restaurants distribute collected service charges?',
    options: [
      '100% distributed completely and equally among all covered rank-and-file and supervisory workers',
      '85% to rank-and-file workers and 15% retained by management for breakages and losses',
      '90% to kitchen staff and 10% to dining service personnel based on seniority ranking',
      '70% to covered workers and 30% allocated to the employer\'s reserve capital fund',
    ],
    correctIndex: 0,
    statute: 'R.A. 11360 (Art. 96, Labor Code)',
    explanation: 'R.A. 11360 abolished the old 85-15 sharing scheme and mandates that 100% of service charges collected must be distributed completely and equally among all covered employees.',
  },
  {
    id: 'rw30',
    worldCode: 'w2',
    headline: 'Managerial Exemption from Service Charges (R.A. 11360)',
    prompt: 'Does a General Hotel Manager who exercises managerial authority have a legal claim to share in the 100% service charge collection?',
    options: [
      'No — managerial employees are expressly excluded from the distribution under Art. 96',
      'Yes — R.A. 11360 mandates 100% distribution across all payroll recipients without exception',
      'Yes — provided the general manager receives a share equal to the lowest-paid dishwasher',
      'Only if the hotel achieves a five-star customer rating on international booking platforms',
    ],
    correctIndex: 0,
    statute: 'Art. 96, Labor Code (as amended by R.A. 11360)',
    explanation: 'The law expressly excludes managerial employees from receiving shares in the service charge distribution; it is reserved for covered rank-and-file and supervisory employees.',
  },
  {
    id: 'rw31',
    worldCode: 'w2',
    headline: 'Pro-Rated 13th Month Pay for Resigned Workers',
    prompt: 'An administrative assistant resigns on May 31 after 5 months of service. Is the employer legally required to pay 13th month pay?',
    options: [
      'Yes — resigned employees are entitled to pro-rated 13th month pay in proportion to months worked',
      'No — 13th month pay is strictly forfeited if an employee resigns before December 24',
      'Only if the employee worked at least six months to complete probationary tenure',
      'Only if the resignation was prompted by an authorized cause under Article 298',
    ],
    correctIndex: 0,
    statute: 'Revised Guidelines on P.D. 851 Sec. 6',
    explanation: 'An employee who resigned or was separated before the time for payment of 13th month pay is entitled to this monetary benefit in proportion to the length of time worked during the calendar year.',
  },
  {
    id: 'rw32',
    worldCode: 'w2',
    headline: 'DOLE Two-Tiered Wage System Structure',
    prompt: 'What are the two structural tiers of the DOLE National Wages and Productivity Commission Two-Tiered Wage System?',
    options: [
      'Mandatory Tier 1 (Floor Minimum Wage) + Voluntary Tier 2 (Productivity-based incentive schemes)',
      'Tier 1 (Cash Wage) + Tier 2 (Mandatory food vouchers and supermarket discounts)',
      'Tier 1 (Metro Manila rate) + Tier 2 (All provincial rates discounted by 40%)',
      'Tier 1 (Rank-and-file pay) + Tier 2 (Executive stock option programs)',
    ],
    correctIndex: 0,
    statute: 'NWPC Guidelines on Two-Tiered Wage System',
    explanation: 'The Two-Tiered Wage System consists of Tier 1: mandatory regional floor minimum wages to protect vulnerable workers; and Tier 2: voluntary performance/productivity-based gainsharing.',
  },
];

export const PEACH_ROYAL_LEAVES_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'pl1',
    worldCode: 'w6',
    headline: 'Expanded Maternity Leave — Live Birth',
    prompt: 'Princess Peach (married private-sector worker) delivers a healthy baby. How many paid maternity leave days does R.A. 11210 grant?',
    options: [
      '105 days with full pay regardless of whether delivery is normal or caesarean section',
      '60 days with full pay for normal delivery and 78 days for caesarean section delivery',
      '90 days with full pay provided the female worker has rendered two years of service',
      '120 days with full pay for all married female workers in the private economic sector',
    ],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 3',
    explanation: 'R.A. 11210 grants 105 days paid maternity leave for live childbirth regardless of whether delivery is normal or caesarean.',
  },
  {
    id: 'pl2',
    worldCode: 'w6',
    headline: 'Solo Parent Maternity Extension',
    prompt: 'If a female worker qualifies as a Solo Parent under R.A. 8972 / R.A. 11861, how many total paid maternity days apply for live childbirth?',
    options: [
      '120 days with full pay (105 standard days plus 15 additional solo parent days)',
      '112 days with full pay (105 standard days plus 7 statutory paternity leave days)',
      '135 days with full pay (105 standard days plus 30 optional unpaid leave days)',
      '105 days with full pay, as solo parent status does not increase maternity duration',
    ],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 3',
    explanation: 'Solo parent mothers receive an additional 15 days with full pay on top of 105 days, totaling 120 paid days.',
  },
  {
    id: 'pl3',
    worldCode: 'w6',
    headline: 'Paternity Leave Cap & Civil Status',
    prompt: 'Under R.A. 8187, who qualifies for 7-day Paternity Leave and up to how many deliveries of the legitimate spouse?',
    options: [
      'Married male employee cohabiting with legitimate spouse, for the first 4 deliveries',
      'Any male employee regardless of marital status, for unlimited biological deliveries',
      'Married male employee cohabiting with legitimate spouse, for the first 2 deliveries only',
      'Male employee who has rendered at least three continuous years of company service',
    ],
    correctIndex: 0,
    statute: 'R.A. 8187 Sec. 2–3',
    explanation: 'Statutory 7-day Paternity Leave requires valid marriage and cohabitation with the legitimate spouse, capped at the first 4 deliveries.',
  },
  {
    id: 'pl4',
    worldCode: 'w6',
    headline: 'Expanded Solo Parents Welfare Act Tenure',
    prompt: 'Under R.A. 11861 (Expanded Solo Parents Welfare Act), how many months of service are required to earn the 7-day paid Parental Leave?',
    options: [
      'At least 6 months of service (reduced from the previous 1-year tenure requirement)',
      'At least 12 months of continuous service with the same employer at time of filing',
      'At least 24 months of aggregate service across any registered private establishments',
      'Zero tenure required, as parental leave applies immediately on the first day of hire',
    ],
    correctIndex: 0,
    statute: 'R.A. 11861',
    explanation: 'R.A. 11861 lowered the service requirement from 1 year down to 6 months and raised the dependent child age threshold up to 22 years old.',
  },
  {
    id: 'pl5',
    worldCode: 'w6',
    headline: 'VAWC 10-Day Paid Leave',
    prompt: 'What document must a woman employee present to avail of the 10-day paid leave under R.A. 9262 (Anti-VAWC Act)?',
    options: [
      'Certification from Barangay, Prosecutor, or Clerk of Court that an action is pending',
      'Final Supreme Court judgment convicting the perpetrator of violence against women',
      'Hospital surgical bill indicating serious physical injuries requiring hospitalization',
      'Formal resolution approved by the company\'s internal Committee on Decency and Safety',
    ],
    correctIndex: 0,
    statute: 'R.A. 9262 Sec. 43',
    explanation: 'Only a certification of pending VAWC action / protection order from the Barangay, Prosecutor, or Clerk of Court is required.',
  },
  {
    id: 'pl6',
    worldCode: 'w6',
    headline: 'Magna Carta of Women Surgery Leave',
    prompt: 'Under R.A. 9710 Sec. 18, a female employee with 6 months aggregate service in the last 12 months who undergoes gynecological surgery gets:',
    options: [
      'Special leave of up to 2 months with full pay based on gross monthly compensation',
      'Special leave of 15 days unpaid leave with continuation of health insurance coverage',
      'Special leave of 60 days paid solely through SSS sickness benefit cash disbursements',
      'Special leave of 7 days commutable to cash if unused at the end of the calendar year',
    ],
    correctIndex: 0,
    statute: 'R.A. 9710 Sec. 18',
    explanation: 'Magna Carta of Women grants up to 2 months paid special leave following surgery caused by gynecological disorders.',
  },
  {
    id: 'pl7',
    worldCode: 'w6',
    headline: 'Service Incentive Leave vs Kasambahay Leave',
    prompt: 'Compare ordinary Art. 95 SIL (5 days) with R.A. 10361 Kasambahay SIL (5 days) when unused at year-end:',
    options: [
      'Art. 95 SIL is commutable to cash; Kasambahay 5-day leave is non-cumulative and non-cashable',
      'Both leave credits are automatically convertible to cash at the close of every calendar year',
      'Neither leave credit is convertible to cash, but both accumulate indefinitely across years',
      'Kasambahay leave carries a 10-day statutory cash bonus while Art. 95 carries five days',
    ],
    correctIndex: 0,
    statute: 'Art. 95 Labor Code vs R.A. 10361 Sec. 29',
    explanation: 'Ordinary rank-and-file unused SIL converts to cash, whereas Kasambahay 5-day leave is forfeited if unused and not cash-convertible.',
  },
  {
    id: 'pl8',
    worldCode: 'w6',
    headline: 'Miscarriage or Emergency Termination',
    prompt: 'How many paid days of maternity leave are granted under R.A. 11210 for miscarriage or emergency termination of pregnancy?',
    options: [
      '60 days with full pay (statutory paid leave for non-live deliveries under R.A. 11210)',
      '105 days with full pay (the same duration granted for ordinary live childbirth deliveries)',
      '45 days with full pay (standard medical recovery duration set by social security rules)',
      '30 days with full pay (half the duration granted under old Social Security legislation)',
    ],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 3',
    explanation: 'Miscarriage or emergency termination of pregnancy entitles the female worker to 60 days maternity leave with full pay.',
  },
  {
    id: 'pl9',
    worldCode: 'w6',
    headline: 'Allocation of Maternity Leave to Unmarried Father',
    prompt: 'Under R.A. 11210, can a mother allocate up to seven (7) days of her 105-day maternity leave to the child\'s father if they are not married?',
    options: [
      'Yes — R.A. 11210 allows allocation to the child\'s father whether or not married to him',
      'No — allocation is strictly limited to legitimate husbands under valid civil marriage',
      'Only if the unmarried father proves cohabitation for a minimum of ten continuous years',
      'Only if the child\'s grandmother signs a sworn concurrence filed with the barangay',
    ],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 6',
    explanation: 'A female worker entitled to maternity leave benefits may allocate up to seven (7) days of said benefits to the child\'s father, whether or not the same is married to the female worker.',
  },
  {
    id: 'pl10',
    worldCode: 'w6',
    headline: 'Optional Unpaid Maternity Leave Extension',
    prompt: 'In addition to the 105 days of paid maternity leave, what optional additional leave may a female worker take under R.A. 11210?',
    options: [
      'An additional thirty (30) days without pay, provided written notice is given 45 days prior',
      'An additional sixty (60) days with half pay, provided the employer consents in writing',
      'An additional fifteen (15) days with full pay, deductible from future vacation leave',
      'No additional leave is permitted beyond the mandatory 105-day statutory period',
    ],
    correctIndex: 0,
    statute: 'R.A. 11210 Sec. 3',
    explanation: 'A worker may opt to extend maternity leave for an additional thirty (30) days without pay, upon due written notice to the employer at least 45 days before the end of maternity leave.',
  },
  {
    id: 'pl11',
    worldCode: 'w6',
    headline: 'Paternity Leave Cash Conversion Rule',
    prompt: 'A married male employee never uses his 7-day Paternity Leave upon his wife\'s delivery. Can he demand its cash conversion at year-end?',
    options: [
      'No — statutory Paternity Leave under R.A. 8187 is non-cumulative and non-convertible to cash',
      'Yes — all statutory leaves under Philippine labor law convert to cash if unused at year-end',
      'Yes — convertible to cash provided he submits a certified true copy of the child\'s birth certificate',
      'Half of the unused days convert to cash while the other half are carried over to the next child',
    ],
    correctIndex: 0,
    statute: 'R.A. 8187 & Implementing Rules Sec. 7',
    explanation: 'If paternity leave is not availed of, it shall not be convertible to cash and cannot be accumulated from year to year.',
  },
  {
    id: 'pl12',
    worldCode: 'w6',
    headline: 'Solo Parent Leave Forfeiture Rule',
    prompt: 'Does unused 7-day Parental Leave for Solo Parents under R.A. 8972 / R.A. 11861 carry over to the next year or convert to cash?',
    options: [
      'No — solo parent leave is non-cumulative and cannot be converted to cash if unused',
      'Yes — unused solo parent leave automatically converts to cash on the employee\'s birthday',
      'Yes — unused days accumulate up to a statutory ceiling of thirty-five working days',
      'Convertible to cash only if the solo parent has more than three dependent children',
    ],
    correctIndex: 0,
    statute: 'R.A. 8972 / R.A. 11861',
    explanation: 'Parental leave for solo parents is not convertible to cash and cannot be accumulated from year to year.',
  },
  {
    id: 'pl13',
    worldCode: 'w6',
    headline: 'Adoption Leave Under Domestic Administrative Adoption Act',
    prompt: 'Under R.A. 11642, how many paid leave days does an adoptive mother receive upon placement of a child below seven (7) years old?',
    options: [
      'Sixty (60) days of paid adoption leave with full pay from the date of child placement',
      'One hundred five (105) days of paid leave equivalent to natural live childbirth',
      'Thirty (30) days of paid leave provided the adopted child is below one year of age',
      'Seven (7) days of paid parental leave identical to standard solo parent leave benefits',
    ],
    correctIndex: 0,
    statute: 'Sec. 34, R.A. 11642',
    explanation: 'The adoptive mother shall be entitled to maternity leave benefits of sixty (60) days with full pay if the adoptee is below seven (7) years of age on placement.',
  },
  {
    id: 'pl14',
    worldCode: 'w6',
    headline: 'Service Incentive Leave Tenure Requirement',
    prompt: 'Under Article 95 of the Labor Code, after what tenure does an employee become entitled to five (5) days of paid Service Incentive Leave?',
    options: [
      'After at least one (1) year of service (inclusive of authorized absences and regular holidays)',
      'After at least six (6) months of service (matching probationary employment duration)',
      'After at least three (3) years of continuous tenure with the same establishment',
      'Immediately upon regularization after passing the six-month performance appraisal',
    ],
    correctIndex: 0,
    statute: 'Art. 95, Labor Code',
    explanation: 'Every employee who has rendered at least one year of service shall be entitled to a yearly service incentive leave of five days with pay.',
  },
  {
    id: 'pl15',
    worldCode: 'w6',
    headline: 'Maternity Leave Differential in Private Sector',
    prompt: 'Under R.A. 11210, what is the private employer\'s duty regarding the difference between SSS maternity benefit and actual monthly wage?',
    options: [
      'The private employer must pay the salary differential between SSS benefit and full wage',
      'The private employer pays nothing because SSS benefits constitute full satisfaction of law',
      'The employee must file a claim with the NLRC to recover the unpaid salary differential',
      'The salary differential is refunded to the employer by the Department of Finance yearly',
    ],
    correctIndex: 0,
    statute: 'Sec. 5, R.A. 11210 & DOLE D.O. 208-19',
    explanation: 'Employers in the private sector shall pay the salary differential between the full salary and actual SSS maternity benefit received, subject to statutory exceptions for micro-enterprises.',
  },
  {
    id: 'pl16',
    worldCode: 'w6',
    headline: 'VAWC Leave Protection from Disciplinary Action',
    prompt: 'Can an employer issue a disciplinary warning or sanction to a female employee for absences covered by a valid 10-day VAWC leave?',
    options: [
      'No — taking VAWC leave shall not be a ground for prejudice in employment or evaluation',
      'Yes — excessive absences even with VAWC certification may be sanctioned under company rules',
      'Yes — provided the employer issues a written notice of explanation within twenty-four hours',
      'Disciplinary sanctions are permitted if the employee fails to obtain a permanent protection order',
    ],
    correctIndex: 0,
    statute: 'Sec. 43, R.A. 9262',
    explanation: 'The availing of VAWC leave shall not be a ground for termination, prejudice in employment or performance evaluation, or demotion under Republic Act No. 9262.',
  },
  {
    id: 'pl17',
    worldCode: 'w6',
    headline: 'Maternity Leave for Miscarriage / Emergency Termination',
    prompt: 'How many days of paid maternity leave does R.A. 11210 grant for miscarriage or emergency termination of pregnancy (ETP)?',
    options: [
      'Sixty (60) calendar days with full pay',
      'Forty-five (45) calendar days with half pay',
      'One hundred five (105) calendar days with full pay',
      'Thirty (30) calendar days with hospital allowance',
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 11210',
    explanation: 'R.A. 11210 provides sixty (60) days paid maternity leave with full pay in cases of miscarriage or emergency termination of pregnancy.',
  },
  {
    id: 'pl18',
    worldCode: 'w6',
    headline: 'Allocation of Maternity Leave Credits (7 Days)',
    prompt: 'Under R.A. 11210, how many days of her paid maternity leave may a female employee allocate to the child\'s father or alternate caregiver?',
    options: [
      'Up to seven (7) calendar days of paid leave',
      'Up to fourteen (14) calendar days of paid leave',
      'Up to thirty (30) calendar days of unpaid leave',
      'Allocation of maternity leave to the father is strictly prohibited by law',
    ],
    correctIndex: 0,
    statute: 'Sec. 6, R.A. 11210',
    explanation: 'A female worker entitled to maternity leave benefits may allocate up to seven (7) days of said benefits to the child\'s father, whether married or not, or to an alternate caregiver.',
  },
  {
    id: 'pl19',
    worldCode: 'w6',
    headline: 'Abolition of 4-Delivery Cap for Maternity Leave',
    prompt: 'Under Republic Act No. 11210, is maternity leave still subject to the old statutory limitation capping coverage at the first 4 deliveries?',
    options: [
      'No — R.A. 11210 abolished the 4-delivery cap; maternity leave is granted in every instance of pregnancy',
      'Yes — private sector workers are strictly limited to benefits for their first 4 deliveries only',
      'The 4-delivery cap remains for normal births, but is lifted for caesarean deliveries',
      'Maternity benefits beyond the 4th delivery are paid at a fifty percent discounted rate',
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 11210',
    explanation: 'R.A. 11210 repealed the 4-delivery limit under the old SSS law; maternity leave is now granted in every instance of pregnancy, miscarriage, or emergency termination regardless of frequency.',
  },
  {
    id: 'pl20',
    worldCode: 'w6',
    headline: 'Maternity Leave Civil Status Non-Discrimination',
    prompt: 'Is an unmarried pregnant employee required to be legally married before she can claim full statutory maternity leave benefits under R.A. 11210?',
    options: [
      'No — maternity leave is granted to all female employees regardless of civil status or child legitimacy',
      'Yes — only married female workers with registered marriage certificates are covered by R.A. 11210',
      'Unmarried mothers receive only 60 days maternity leave instead of the statutory 105 days',
      'Unmarried employees must first secure an affidavit of acknowledgment from the biological father',
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 11210',
    explanation: 'R.A. 11210 explicitly provides that maternity leave with full pay is granted to a female worker in every instance of pregnancy regardless of her civil status.',
  },
  {
    id: 'pl21',
    worldCode: 'w6',
    headline: 'Paternity Leave Cohabitation Requirement (R.A. 8187)',
    prompt: 'What are the two mandatory requisites for a married male employee to avail of the 7-day paid Paternity Leave under R.A. 8187?',
    options: [
      'Legitimate marriage to the spouse AND cohabiting with her at the time of delivery or miscarriage',
      'At least three years of continuous company service AND proof of church wedding ceremony',
      'Approval of the local civil registrar AND presentation of certified hospital billing receipts',
      'Male employee must have rendered overtime hours during the wife\'s trimester period',
    ],
    correctIndex: 0,
    statute: 'Sec. 2, R.A. 8187 & its IRR',
    explanation: 'Paternity leave requires that the male employee is lawfully married to the woman and cohabiting with her (living together under one roof) at the time of childbirth or miscarriage.',
  },
  {
    id: 'pl22',
    worldCode: 'w6',
    headline: 'Paternity Leave Delivery Cap Limitation',
    prompt: 'Unlike maternity leave, what is the maximum number of deliveries or miscarriages covered by paid Paternity Leave under R.A. 8187?',
    options: [
      'First four (4) deliveries or miscarriages of the legitimate spouse',
      'First two (2) deliveries or miscarriages only',
      'Unlimited deliveries as long as the marriage remains subsisting',
      'First six (6) deliveries provided the employee has ten years of service',
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 8187',
    explanation: 'Republic Act No. 8187 explicitly caps paid paternity leave at the first four (4) deliveries or miscarriages of the male employee’s lawful spouse with whom he is cohabiting.',
  },
  {
    id: 'pl23',
    worldCode: 'w6',
    headline: 'Paternity Leave Non-Commutability to Cash',
    prompt: 'If a male employee does not utilize his 7 days of paternity leave following his wife\'s delivery, can he demand cash conversion at year-end?',
    options: [
      'No — paternity leave is non-cumulative and non-commutable to cash unless agreed in CBA or company policy',
      'Yes — all statutory leave credits automatically convert to cash on December 31 under Art. 95',
      'Yes — fifty percent of the unutilized paternity days must be converted to cash wages',
      'Cash conversion is mandatory if the child is delivered by caesarean section surgery',
    ],
    correctIndex: 0,
    statute: 'IRR of R.A. 8187 Sec. 7',
    explanation: 'Under the IRR of R.A. 8187, in the event the paternity leave is not availed of, it shall not be cumulative and cannot be commuted to its money equivalent.',
  },
  {
    id: 'pl24',
    worldCode: 'w6',
    headline: 'Expanded Solo Parent Leave Benefit (R.A. 11861)',
    prompt: 'Under Republic Act No. 11861 (Expanded Solo Parents Welfare Act), how many days of paid parental leave are granted to eligible solo parents annually?',
    options: [
      'Seven (7) working days with full pay',
      'Five (5) working days with full pay',
      'Ten (10) calendar days with half pay',
      'Fifteen (15) working days with full pay',
    ],
    correctIndex: 0,
    statute: 'Sec. 8, R.A. 11861',
    explanation: 'R.A. 11861 provides that a solo parent employee who has rendered service of at least 6 months shall be granted a parental leave of not more than seven (7) working days with pay every year.',
  },
  {
    id: 'pl25',
    worldCode: 'w6',
    headline: 'Solo Parent Leave Non-Commutability Rule',
    prompt: 'Can an employee who holds an active Solo Parent ID convert unused 7-day parental leave credits into cash at the end of the year?',
    options: [
      'No — solo parent leave is non-cumulative and not convertible to cash unless more favorable company policy exists',
      'Yes — solo parent leave carries the same cash commutation rights as Service Incentive Leave',
      'Yes — convertible to cash only if the solo parent has three or more dependent children',
      'Convertible to cash provided the local social welfare development officer issues a clearance',
    ],
    correctIndex: 0,
    statute: 'IRR of R.A. 11861 Sec. 18',
    explanation: 'Solo parent leave is intended for attending to parental duties. Unused days are non-cumulative and not convertible to cash unless explicitly granted in a company policy or CBA.',
  },
  {
    id: 'pl26',
    worldCode: 'w6',
    headline: 'Special Leave Benefit for Women Gynecological Surgery',
    prompt: 'Under the Magna Carta of Women (R.A. 9710), what is the maximum paid leave granted to a female worker who undergoes surgery for gynecological disorders?',
    options: [
      'Up to two (2) months with full pay based on gross monthly compensation',
      'Thirty (30) calendar days with half pay provided by SSS medical disability',
      'Ninety (90) calendar days with full pay for all types of inpatient hospitalizations',
      'Fifteen (15) working days subject to prior approval by company physician',
    ],
    correctIndex: 0,
    statute: 'Sec. 18, R.A. 9710 & DOLE D.O. 112-11',
    explanation: 'A female employee who has rendered at least 6 months continuous aggregate service for the last 12 months is entitled to a special leave of up to two (2) months with full pay following gynecological surgery.',
  },
  {
    id: 'pl27',
    worldCode: 'w6',
    headline: 'Gynecological Special Leave Non-Commutability',
    prompt: 'Can a female worker who had no gynecological surgery during the calendar year claim cash commutation for the 2 months Special Leave Benefit?',
    options: [
      'No — the special leave is contingent on undergoing surgery and is non-cumulative and non-convertible to cash',
      'Yes — all female employees are entitled to convert 2 months pay every year under Magna Carta of Women',
      'Only twenty-five percent of the benefit can be liquidated into cash at the end of every fiscal year',
      'Yes — provided the worker signs an affidavit declaring she was free from reproductive illnesses',
    ],
    correctIndex: 0,
    statute: 'DOLE D.O. 112-11 Sec. 5',
    explanation: 'The special leave benefit under R.A. 9710 is strictly non-cumulative and non-convertible to cash; it is granted exclusively when surgery for gynecological disorders is medically required and performed.',
  },
  {
    id: 'pl28',
    worldCode: 'w6',
    headline: 'VAWC Leave Documentation Requisites (R.A. 9262)',
    prompt: 'To avail of 10 days paid VAWC leave under R.A. 9262, what document must the female employee present to the employer?',
    options: [
      'A certification from the Punong Barangay, Kagawad, Prosecutor, or Clerk of Court that an action was filed',
      'A final conviction judgment issued by a Regional Trial Court finding the abuser guilty',
      'A notarized admission of physical violence executed by the abusive domestic partner',
      'A medical certificate issued exclusively by the Philippine General Hospital medico-legal division',
    ],
    correctIndex: 0,
    statute: 'Sec. 43, R.A. 9262 & its IRR',
    explanation: 'To avail of the 10-day paid leave, the employee need only submit a certification from the Punong Barangay, Kagawad, Prosecutor, or Clerk of Court that a protection order application was filed.',
  },
  {
    id: 'pl29',
    worldCode: 'w6',
    headline: 'Service Incentive Leave (SIL) 5-Day Mandatory Commutation',
    prompt: 'Under Article 95 of the Labor Code, what is the mandatory statutory rule regarding unused Service Incentive Leave (SIL) at year-end?',
    options: [
      'Unused SIL days are mandatorily commutable to cash at the end of the year based on salary at conversion',
      'Unused SIL days are strictly forfeited unless used within the immediate thirty days of January',
      'SIL days cannot be converted to cash and must be accumulated until mandatory retirement at age 65',
      'Only two of the five days may be converted to cash, with the remaining three days forfeited',
    ],
    correctIndex: 0,
    statute: 'Art. 95(b), Labor Code; Auto Bus Transport v. Bautista',
    explanation: 'Under Art. 95 and Auto Bus Transport, the service incentive leave of 5 days is commutable to its money equivalent if not used or exhausted at the end of the year.',
  },
  {
    id: 'pl30',
    worldCode: 'w5',
    headline: 'Kasambahay SIL Non-Commutability Rule (R.A. 10361)',
    prompt: 'Unlike industrial workers under Article 95, does a Kasambahay\'s statutory 5-day annual incentive leave convert to cash under R.A. 10361?',
    options: [
      'No — under R.A. 10361 Sec. 24, unused annual leave of a domestic worker is non-cumulative and non-commutable to cash',
      'Yes — domestic workers enjoy identical cash commutation rights as commercial factory employees',
      'Convertible to cash only if the employer terminates the employment contract before one full year',
      'Cash conversion is mandatory for domestic workers earning above ten thousand pesos per month',
    ],
    correctIndex: 0,
    statute: 'Sec. 24, R.A. 10361 (Batas Kasambahay)',
    explanation: 'Section 24 of Batas Kasambahay explicitly provides that unused annual service leave of a domestic worker shall not be cumulative and cannot be commuted to cash.',
  },
  {
    id: 'pl31',
    worldCode: 'w6',
    headline: 'SSS Maternity Benefit for Separated Female Workers',
    prompt: 'A female employee resigns while 4 months pregnant. Can she still receive statutory SSS maternity benefits upon delivery?',
    options: [
      'Yes — provided she has paid at least 3 monthly contributions in the 12-month period preceding the semester of birth',
      'No — resignation automatically extinguishes all statutory social security maternity entitlements',
      'Only if her employer agrees in writing to advance the benefit without seeking SSS reimbursement',
      'Yes — but only at a reduced twenty-five percent statutory rate paid directly by DOLE',
    ],
    correctIndex: 0,
    statute: 'R.A. 11210 & R.A. 11199 (Social Security Act)',
    explanation: 'A female member who is separated from employment is still entitled to maternity benefits if she has paid at least 3 monthly contributions in the 12-month period preceding the semester of childbirth.',
  },
  {
    id: 'pl32',
    worldCode: 'w6',
    headline: 'Maternity Leave 30-Day Unpaid Extension Option',
    prompt: 'Under Section 3 of R.A. 11210, can a female worker extend her maternity leave beyond the initial 105 days?',
    options: [
      'Yes — option to extend for an additional thirty (30) days without pay, upon 45-day prior written notice',
      'No — maternity leave duration is strictly capped at 105 days with zero allowable extensions',
      'Extension is permitted up to ninety days with full salary subsidized by the employer',
      'Extension is allowed only if the child is diagnosed with a congenital heart ailment',
    ],
    correctIndex: 0,
    statute: 'Sec. 3, R.A. 11210',
    explanation: 'R.A. 11210 gives the female worker the option to extend her maternity leave for an additional thirty (30) days without pay, provided she gives written notice to the employer at least 45 days before.',
  },
];

export const WARIO_DEDUCTION_AUDIT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'wd1',
    worldCode: 'w3',
    headline: 'Mandatory Statutory Contributions',
    prompt: 'Wario deducts the employee\'s statutory share of SSS, PhilHealth, Pag-IBIG, and BIR withholding tax without separate written consent. Lawful or Illegal?',
    options: [
      'Lawful — deductions mandated by express provisions of law require no separate consent',
      'Illegal — every statutory deduction requires a notarized waiver signed by the employee',
      'Illegal — the employer is legally mandated to shoulder one hundred percent of all taxes',
      'Lawful only if the employee belongs to managerial staff earning above minimum wage',
    ],
    correctIndex: 0,
    statute: 'Art. 113, Labor Code',
    explanation: 'Statutory deductions (SSS, PhilHealth, Pag-IBIG, withholding tax) are expressly authorized by law.',
  },
  {
    id: 'wd2',
    worldCode: 'w3',
    headline: 'Unilateral Tool Breakage Deduction (50% of Pay)',
    prompt: 'A worker accidentally drops a wrench. Without a hearing and deducting 50% of weekly pay at once, Wario slashes the worker\'s paycheck. Lawful or Illegal?',
    options: [
      'Illegal — loss/damage deductions require proven fault, hearing, and max 20% weekly cap',
      'Lawful — management prerogative to protect company tools and assets is absolute in nature',
      'Lawful provided the replacement purchase cost of the tool is below ten thousand pesos',
      'Lawful provided the deduction is itemized on the computerized payslip given to the worker',
    ],
    correctIndex: 0,
    statute: 'Art. 114–115 & Omnibus Rules Book III Rule VIII Sec. 11',
    explanation: 'Loss/damage deductions require proof of clear employee responsibility, opportunity to be heard, fair value, and a strict 20% weekly wage deduction cap!',
  },
  {
    id: 'wd3',
    worldCode: 'w3',
    headline: 'Union Agency Fee for Non-Union Beneficiaries',
    prompt: 'Rank-and-file non-union employees accept benefits under the certified Union\'s CBA. Can agency fees be checked off from their wages without individual authorization?',
    options: [
      'Lawful — Art. 259(e) authorizes agency fee check-off for non-members who accept CBA benefits',
      'Illegal — checking off fees without signed consent violates the constitutional freedom of association',
      'Lawful only if the check-off was approved in an executive resolution by the DOLE Regional Director',
      'Illegal unless the non-union employee executes a formal sworn application to join the labor union',
    ],
    correctIndex: 0,
    statute: 'Art. 113 & Art. 259(e), Labor Code',
    explanation: 'Non-union members of the bargaining unit who accept CBA benefits may be assessed a reasonable agency fee without individual written authorization.',
  },
  {
    id: 'wd4',
    worldCode: 'w3',
    headline: 'Written Authorization to Pay 3rd-Party Cooperative',
    prompt: 'An employee signs a free, written authorization directing payroll to remit PHP 500/month to their credit cooperative, and the employer receives zero kickback. Lawful or Illegal?',
    options: [
      'Lawful — Art. 113(b) permits third-party deductions with written consent and zero kickback',
      'Illegal — direct payment to any third person or entity is strictly prohibited by labor standards',
      'Lawful only if approved in a formal administrative resolution by the Supreme Court En Banc',
      'Illegal if the deducted monthly remittance exceeds two hundred pesos per payroll cut-off',
    ],
    correctIndex: 0,
    statute: 'Art. 113(b), Labor Code',
    explanation: 'Written employee authorization for payment to a third person is valid under Art. 113(b) provided the employer receives neither direct nor indirect kickback/pecuniary benefit.',
  },
  {
    id: 'wd5',
    worldCode: 'w3',
    headline: 'Forced Cash Deposit in Manufacturing',
    prompt: 'A standard shoe factory (no recognized custom or DOLE authorization) forces every new hire to post a PHP 5,000 cash bond via payroll deductions. Lawful or Illegal?',
    options: [
      'Illegal — Art. 114 bans cash deposits unless recognized by DOLE as customary in that trade',
      'Lawful — employers may mandate cash security bonds for all newly hired probationary staff',
      'Lawful provided the deposit is returned with six percent legal interest upon five years tenure',
      'Lawful provided the cash deposit is deposited inside an escrow account in the company vault',
    ],
    correctIndex: 0,
    statute: 'Art. 114, Labor Code',
    explanation: 'Employers cannot compel loss/damage deposits unless engaged in a trade recognized by the DOLE Secretary where deposits are necessary or desirable.',
  },
  {
    id: 'wd6',
    worldCode: 'w3',
    headline: 'Withholding Final Wages as Retaliation',
    prompt: 'An employee files a labor standards complaint, so Wario freezes their already-earned salary until they withdraw the complaint. Lawful or Illegal?',
    options: [
      'Illegal — Art. 116 bars withholding wages and Art. 118 prohibits retaliatory acts',
      'Lawful — management clearance holds are permitted while legal disputes remain pending',
      'Lawful for up to six months while the parties undergo mandatory NCMB conciliation',
      'Permitted provided the employer\'s company employee handbook contains an explicit hold rule',
    ],
    correctIndex: 0,
    statute: 'Art. 116 & Art. 118, Labor Code',
    explanation: 'Withholding earned wages by force, stealth, intimidation, or in retaliation for a labor complaint violates Articles 116 and 118.',
  },
  {
    id: 'wd7',
    worldCode: 'w4',
    headline: 'Kasambahay SSS Deduction at PHP 4,500 Wage',
    prompt: 'A Kasambahay earns PHP 4,500/month. The household employer deducts the employee share of SSS, PhilHealth, and Pag-IBIG from the PHP 4,500 wage. Lawful or Illegal?',
    options: [
      'Illegal — under R.A. 10361, if wage is below PHP 5,000, employer pays 100% of premiums',
      'Lawful — social security statutory contributions are always divided equally fifty-fifty',
      'Lawful provided the Kasambahay has completed at least six months of household employment',
      'Illegal only within the National Capital Region and fully lawful in provincial areas',
    ],
    correctIndex: 0,
    statute: 'R.A. 10361 Sec. 30',
    explanation: 'When a Kasambahay earns less than PHP 5,000/month, the employer shoulders the entire statutory premium without deducting from the worker\'s pay.',
  },
  {
    id: 'wd8',
    worldCode: 'w3',
    headline: 'Payment of Wages via Promissory Chits / Tokens',
    prompt: 'Instead of legal tender or compliant ATM payroll, Wario pays factory workers in redeemable Wario-Mart store coupons. Lawful or Illegal?',
    options: [
      'Illegal — Art. 102 strictly prohibits paying wages in vouchers, tokens, or chits',
      'Lawful provided the store coupons include a five percent bonus markup on groceries',
      'Lawful provided the grocery store is located within five hundred meters of the plant',
      'Lawful provided the coupon payment was ratified by fifty-one percent of union members',
    ],
    correctIndex: 0,
    statute: 'Art. 102, Labor Code',
    explanation: 'Art. 102 mandates payment in legal tender (or compliant bank/ATM payroll) and penalizes payment via chits, vouchers, or store tokens.',
  },
  {
    id: 'wd9',
    worldCode: 'w3',
    headline: 'Payroll Deduction for Group Insurance Premiums',
    prompt: 'Can an employer deduct insurance premiums from an employee\'s wage for an employer-negotiated group health plan?',
    options: [
      'Lawful — provided the employee voluntarily gave prior written authorization under Art. 113',
      'Illegal — all non-tax insurance deductions are void ab initio under Philippine labor standards',
      'Lawful without employee consent provided the company pays twenty percent of the premium',
      'Lawful only if the group insurance provider is a government-owned financial institution',
    ],
    correctIndex: 0,
    statute: 'Art. 113(a), Labor Code',
    explanation: 'Deductions for insurance premiums with written employee authorization are valid under Art. 113 where the employer is authorized in writing by the individual employee.',
  },
  {
    id: 'wd10',
    worldCode: 'w3',
    headline: 'Garnishment of Minimum Wages for Personal Civil Debts',
    prompt: 'A bank secures a writ of execution from a trial court garnishing a factory worker\'s minimum wage for unpaid credit card debt. Is minimum wage garnishable?',
    options: [
      'Illegal — Art. 1708 of the Civil Code explicitly exempts laborers\' wages from execution',
      'Lawful — any final trial court writ of execution overrides statutory minimum wage laws',
      'Lawful provided the garnishment does not exceed fifty percent of the monthly wage',
      'Lawful only if the laborer executed a promissory note with an acceleration clause',
    ],
    correctIndex: 0,
    statute: 'Art. 1708, Civil Code; Gaa v. Court of Appeals',
    explanation: 'Article 1708 of the Civil Code provides that the laborer\'s wages shall not be subject to execution or attachment, except for debts incurred for food, shelter, clothing and medical attendance.',
  },
  {
    id: 'wd11',
    worldCode: 'w3',
    headline: 'Direct Payment of Wages Requirement',
    prompt: 'Under Article 105 of the Labor Code, to whom must an employee\'s wages be directly paid on scheduled payroll paydays?',
    options: [
      'Directly to the worker, except in force majeure or with written authorization to an immediate relative',
      'Directly to the employee\'s spouse regardless of whether written authority was executed',
      'Directly to the department supervisor who is authorized to disburse cash at their discretion',
      'Directly to the certified collective bargaining union treasurer for distribution to workers',
    ],
    correctIndex: 0,
    statute: 'Art. 105, Labor Code',
    explanation: 'Wages shall be paid directly to the workers, except when the employer is authorized to pay through an immediate member of the family upon written authority, or in case of death.',
  },
  {
    id: 'wd12',
    worldCode: 'w3',
    headline: "Attorney's Fees Ceiling in Labor Cases",
    prompt: 'Under Article 111 of the Labor Code, what is the maximum statutory attorney\'s fees that may be assessed in unlawful wage withholding cases?',
    options: [
      'Not exceeding ten percent (10%) of the total amount of wages recovered by the worker',
      'Not exceeding twenty-five percent (25%) of the total amount of wages recovered by the worker',
      'A flat ceiling of fifty thousand pesos without regard to the amount of unpaid wages',
      'Attorney\'s fees are completely prohibited in proceedings before the NLRC Labor Arbiter',
    ],
    correctIndex: 0,
    statute: 'Art. 111, Labor Code',
    explanation: 'In cases of unlawful withholding of wages, the culpable party may be assessed attorney\'s fees equivalent to ten percent of the amount of wages recovered.',
  },
  {
    id: 'wd13',
    worldCode: 'w3',
    headline: 'Wage Rebates and Kickbacks Prohibition',
    prompt: 'A supervisor demands a monthly PHP 1,000 cash kickback from workers in exchange for keeping them on preferred shifts. What provision is violated?',
    options: [
      'Article 116 — prohibiting any rebate or deduction from wages as consideration for employment',
      'Article 124 — prohibiting wage distortion across different quantitative skill categories',
      'Article 95 — prohibiting unauthorized commutation of annual service incentive leaves',
      'Article 83 — establishing eight hours as the normal working hours of company employees',
    ],
    correctIndex: 0,
    statute: 'Art. 116, Labor Code',
    explanation: 'It shall be unlawful for any person to withhold any amount from the wages of an employee or induce him to give up any part of the wages by force, stealth, intimidation, threat or by any other means whatsoever.',
  },
  {
    id: 'wd14',
    worldCode: 'w3',
    headline: 'Requisites for a Valid Labor Quitclaim',
    prompt: 'Under established Supreme Court jurisprudence, when is an employee\'s signed waiver and quitclaim legally valid and binding?',
    options: [
      'Voluntary execution + Fair and reasonable consideration + No fraud or deceit + Full understanding',
      'Notarization before a notary public alone, regardless of the financial consideration paid',
      'Signing inside HR office in the presence of two co-workers without financial compensation',
      'Approval by the certified bargaining union president within thirty days of separation',
    ],
    correctIndex: 0,
    statute: 'EDI Staffbuilders v. NLRC',
    explanation: 'A quitclaim is valid if executed voluntarily, with full understanding, without fraud or duress, for a fair and reasonable consideration, and not contrary to law or public policy.',
  },
  {
    id: 'wd15',
    worldCode: 'w3',
    headline: 'Deductions for Company Salary Loans',
    prompt: 'Can management deduct monthly amortizations for a company emergency loan from a worker\'s paycheck?',
    options: [
      'Lawful — provided the employee executed a written loan agreement authorizing payroll deduction',
      'Illegal — employers can never deduct loan amortizations even with written employee agreement',
      'Lawful without written consent as long as the loan was disbursed directly to the worker\'s bank',
      'Lawful only if the loan carries a statutory interest rate of at least twelve percent per annum',
    ],
    correctIndex: 0,
    statute: 'Art. 113(c), Labor Code',
    explanation: 'Deductions are lawful in cases where the employer is authorized by law or regulations, including debts owing to the employer with written employee authorization.',
  },
  {
    id: 'wd16',
    worldCode: 'w3',
    headline: 'Prohibited Place of Wage Payment',
    prompt: 'Under Article 104 of the Labor Code, in which of the following places is the payment of wages strictly prohibited?',
    options: [
      'Inside bars, night clubs, drinking places, massage clinics, or gambling houses',
      'Inside the registered principal office or manufacturing plant of the employer',
      'Through automated teller machines (ATMs) of accredited universal commercial banks',
      'Inside company dining halls or auditoriums during designated off-duty break hours',
    ],
    correctIndex: 0,
    statute: 'Art. 104, Labor Code',
    explanation: 'Payment of wages shall be made at or near the place of undertaking, except in bars, night clubs, drinking places, massage clinics, or gambling establishments where payment is banned.',
  },
  {
    id: 'wd17',
    worldCode: 'w3',
    headline: 'Deductions for Loss of Merchandise or Breakages (Art. 115)',
    prompt: 'What strict requirements must an employer satisfy before deducting wages for lost tools or damaged company equipment?',
    options: [
      'Worker clearly culpable + Opportunity to show cause + Deduction capped at 20% of weekly wage',
      'Verbal accusation by supervisor + Immediate 50% salary withholding without hearing',
      'Filing a criminal complaint before the city prosecutor + Total forfeiture of final wages',
      'Deductions for damaged tools are strictly barred in all Philippine manufacturing operations',
    ],
    correctIndex: 0,
    statute: 'Art. 115, Labor Code; D.O. 195-18',
    explanation: 'Deductions for loss require: (1) worker clearly shown responsible; (2) ample opportunity to show cause; (3) deduction does not exceed fair value; and (4) does not exceed 20% of weekly wage.',
  },
  {
    id: 'wd18',
    worldCode: 'w3',
    headline: '20% Weekly Wage Cap on Loss Deductions',
    prompt: 'Under Article 115, what is the maximum percentage of an employee\'s weekly wage that can be deducted for damaged company tools?',
    options: [
      'Not exceeding twenty percent (20%) of the employee\'s wages in a single week',
      'Not exceeding ten percent (10%) of the employee\'s basic daily wage rate',
      'Up to fifty percent (50%) of net take-home pay if the equipment value is substantial',
      'One hundred percent (100%) of wages until the total replacement cost is fully recovered',
    ],
    correctIndex: 0,
    statute: 'Art. 115, Labor Code',
    explanation: 'Article 115 provides that deductions for loss or damage shall be fair and reasonable and shall not exceed the amount actually necessary, capped at 20% of the employee’s wages in a week.',
  },
  {
    id: 'wd19',
    worldCode: 'w3',
    headline: 'Withholding Wages to Force Quitclaim (Art. 116)',
    prompt: 'Management withholds a resigned employee\'s last salary until the worker agrees to sign an absolute waiver and quitclaim. Lawful or Illegal?',
    options: [
      'Illegal — Art. 116 makes it unlawful to withhold wages or force an employee to give up legal claims',
      'Lawful — employers possess an absolute right to demand complete liability release before final pay',
      'Lawful provided the employer releases the wages within ninety days of receiving the signed quitclaim',
      'Illegal only if the worker was terminated for an authorized cause under Article 298',
    ],
    correctIndex: 0,
    statute: 'Art. 116, Labor Code',
    explanation: 'Art. 116 penalizes the unlawful withholding of wages. Employers cannot condition the release of earned compensation on the signing of quitclaims or surrender of statutory rights.',
  },
  {
    id: 'wd20',
    worldCode: 'w3',
    headline: 'Kickbacks and Rebates of Wages (Art. 116)',
    prompt: 'An employer demands that employees kick back ₱1,000 from each bi-weekly paycheck as an \'administrative processing fee\'. Lawful or Illegal?',
    options: [
      'Illegal — Art. 116 strictly prohibits employers from demanding or accepting any wage rebate or kickback',
      'Lawful — employers may charge administrative fees to offset internal payroll accounting costs',
      'Lawful — provided the rebate fee was disclosed in the original newspaper recruitment posting',
      'Permissible if the funds are deposited into an employee social welfare recreation fund',
    ],
    correctIndex: 0,
    statute: 'Art. 116, Labor Code',
    explanation: 'Article 116 explicitly provides that it shall be unlawful for any person, directly or indirectly, to demand or accept any rebate or kickback from wages.',
  },
  {
    id: 'wd21',
    worldCode: 'w3',
    headline: 'Retaliatory Wage Cuts for Filing DOLE Complaints (Art. 118)',
    prompt: 'After an employee testifies in a DOLE labor standards inspection hearing, the employer slashes the worker\'s salary by 30%. Lawful or Illegal?',
    options: [
      'Illegal — Art. 118 punishes retaliatory wage cuts against employees who file complaints or testify',
      'Lawful — employers have full prerogative to restructure wages based on management assessment',
      'Lawful — provided the employer gave fifteen days prior written notice of the salary reduction',
      'Illegal only if the employee was testifying under a formal subpoena duces tecum from a judge',
    ],
    correctIndex: 0,
    statute: 'Art. 118, Labor Code',
    explanation: 'Art. 118 makes it unlawful for an employer to refuse to pay or reduce wages, discharge, or discriminate against an employee who has filed a complaint or instituted proceedings under the Code.',
  },
  {
    id: 'wd22',
    worldCode: 'w3',
    headline: 'Mandatory Direct Payment of Wages (Art. 105)',
    prompt: 'An employer disburses a worker\'s salary envelope to the employee\'s adult sibling without written authorization. Lawful or Illegal?',
    options: [
      'Illegal — Art. 105 mandates that wages must be paid directly to the worker except with written authority',
      'Lawful — immediate family members possess automatic authority to receive relatives\' paychecks',
      'Lawful — provided the sibling presents a valid government ID and signs the payroll ledger',
      'Illegal only if the sibling spends the money on personal items instead of household food',
    ],
    correctIndex: 0,
    statute: 'Art. 105, Labor Code',
    explanation: 'Article 105 requires wages to be paid directly to the workers entitled thereto, except in cases of force majeure, or where the worker authorized in writing another person to receive the pay.',
  },
  {
    id: 'wd23',
    worldCode: 'w3',
    headline: 'Payment of Wages to Heirs of Deceased Employee',
    prompt: 'An employee dies with ₱45,000 in accrued unpaid wages. How may the employer lawfully disburse the wages without formal judicial court administration?',
    options: [
      'Pay directly to heirs upon execution of an affidavit without need of formal court administration',
      'Retain the funds indefinitely until a Regional Trial Court issues letters of administration',
      'Escheat the funds immediately to the National Treasury under the Rules of Court',
      'Pay fifty percent to the surviving spouse and deposit fifty percent in a DOLE trust account',
    ],
    correctIndex: 0,
    statute: 'Art. 105(b), Labor Code',
    explanation: 'Art. 105(b) allows payment of a deceased worker\'s unpaid wages directly to the heirs upon execution of an affidavit of heirship without necessity of formal court intestate proceedings.',
  },
  {
    id: 'wd24',
    worldCode: 'w3',
    headline: 'Union Agency Fees Check-Off Without Consent (Art. 259)',
    prompt: 'Can an employer deduct union agency fees from a non-union employee who benefits from the CBA without individual written authorization?',
    options: [
      'Lawful — non-union members who accept CBA benefits are legally bound to pay agency fees without consent',
      'Illegal — every single wage deduction in the Philippines requires an individual notarized authorization',
      'Illegal — non-union members are completely exempt from all financial obligations under a CBA',
      'Lawful only if the non-union member voted affirmatively in the union representation election',
    ],
    correctIndex: 0,
    statute: 'Art. 259(e), Labor Code; Holy Cross of Davao College v. Joaquin',
    explanation: 'Under Art. 259(e), individual check-off authorizations are NOT required for union agency fees assessed against non-members who accept the benefits of the collective bargaining agreement.',
  },
  {
    id: 'wd25',
    worldCode: 'w3',
    headline: 'Individual Written Consent for Regular Union Dues',
    prompt: 'Unlike agency fees, can an employer deduct standard union membership dues from union members without individual written check-off authorizations?',
    options: [
      'Illegal — regular union dues check-off strictly requires signed individual written authorizations',
      'Lawful — a majority board resolution of the union automatically replaces individual check-off forms',
      'Lawful — ratification of the CBA by workers dispenses with individual written consent requirements',
      'Illegal only if the union membership dues exceed two percent of the worker\'s monthly basic pay',
    ],
    correctIndex: 0,
    statute: 'Art. 113(b) & Art. 250(o), Labor Code; Palacol v. Ferrer-Calleja',
    explanation: 'Art. 250(o) provides that no special assessment or regular dues shall be checked off without an individual written authorization duly signed by the employee.',
  },
  {
    id: 'wd26',
    worldCode: 'w3',
    headline: 'Unilateral Deductions for Calamity Charity Drives',
    prompt: 'Company HR deducts ₱300 from all employees for a typhoon relief donation drive without asking for individual consent. Lawful or Illegal?',
    options: [
      'Illegal — charity deductions require individual voluntary written authorization from each employee',
      'Lawful — management has moral prerogative to organize disaster relief on behalf of personnel',
      'Lawful — provided the employer remits the collected donation to the Philippine Red Cross',
      'Illegal only if the typhoon occurred outside the territorial boundaries of the Philippines',
    ],
    correctIndex: 0,
    statute: 'Art. 113, Labor Code',
    explanation: 'Under Art. 113, no employer may make deductions from the wages of employees except in cases authorized by law or with written authorization for payments to third parties.',
  },
  {
    id: 'wd27',
    worldCode: 'w3',
    headline: 'Deductions for SSS & Pag-IBIG Salary Loans',
    prompt: 'An employer deducts monthly loan amortizations from an employee\'s salary based on official billing statements from SSS and Pag-IBIG. Lawful or Illegal?',
    options: [
      'Lawful — deductions authorized by statutory regulations or employee loan agreements are valid',
      'Illegal — government loan repayments must always be paid over-the-counter by the worker in person',
      'Illegal — employers are prohibited from acting as collection agents for government corporations',
      'Lawful only if the employee pays a five percent convenience surcharge to the company accountant',
    ],
    correctIndex: 0,
    statute: 'Art. 113, Labor Code; SSS Law (R.A. 11199); HDMF Law (R.A. 9679)',
    explanation: 'Deductions for SSS, GSIS, and Pag-IBIG salary loans are lawful under Art. 113 as they are authorized by law and the member\'s loan agreement with the government financing institution.',
  },
  {
    id: 'wd28',
    worldCode: 'w3',
    headline: 'Deductions for Group Insurance Premiums',
    prompt: 'Can an employer deduct premiums for an employee life insurance policy contracted by the company?',
    options: [
      'Lawful — provided the worker authorized it in writing and the employer receives no financial reward',
      'Illegal — private life insurance deductions are strictly prohibited under the Labor Code',
      'Lawful only if the employer is designated as the sole irrevocable beneficiary of the policy',
      'Permissible provided the monthly insurance premium does not exceed one percent of the basic wage',
    ],
    correctIndex: 0,
    statute: 'Art. 113(a), Labor Code',
    explanation: 'Art. 113(a) allows deductions for insurance premiums where the worker is insured with his consent by the employer, and the employer receives no amount for the service directly or indirectly.',
  },
  {
    id: 'wd29',
    worldCode: 'w3',
    headline: 'Payment of Wages via Promissory Notes or IOUs (Art. 102)',
    prompt: 'Citing temporary cash-flow shortages, a manufacturing firm pays 50% of monthly salaries in 90-day company promissory notes. Lawful or Illegal?',
    options: [
      'Illegal — Art. 102 requires payment strictly in legal tender; promissory notes and IOUs are banned',
      'Lawful — promissory notes are recognized commercial instruments under the Negotiable Instruments Law',
      'Lawful — provided the promissory note bears interest at six percent per annum until fully cashed',
      'Illegal only if the employer fails to redeem the promissory notes within one hundred eighty days',
    ],
    correctIndex: 0,
    statute: 'Art. 102, Labor Code',
    explanation: 'Article 102 mandates that no employer shall pay the wages of an employee by means of promissory notes, vouchers, coupons, tokens, tickets, chits, or any object other than legal tender.',
  },
  {
    id: 'wd30',
    worldCode: 'w3',
    headline: 'Mandatory Itemized Payslip Issuance',
    prompt: 'Under DOLE labor standards rules, is an employer legally required to issue an itemized payslip to employees on paydays?',
    options: [
      'Yes — employers must provide itemized payslips detailing gross wage, deductions, and net compensation',
      'No — payslips are purely optional courtesies and not mandated by any statutory rule',
      'Payslips are mandatory only for multinational corporations with more than five hundred staff',
      'Employers need only verbally communicate the net salary without providing printed or digital slips',
    ],
    correctIndex: 0,
    statute: 'DOLE Labor Advisory on Issuance of Payslips; Omnibus Rules Book III',
    explanation: 'Employers are required to issue an itemized pay slip to employees every payday showing basic wage, overtime, allowances, all statutory and authorized deductions, and net pay.',
  },
  {
    id: 'wd31',
    worldCode: 'w3',
    headline: 'Three-Year Mandatory Payroll Record-Keeping',
    prompt: 'Under the Omnibus Rules implementing the Labor Code, how long must an employer retain employee payrolls, time cards, and deduction slips?',
    options: [
      'At least three (3) years from the date of the last entry',
      'At least one (1) year following the annual BIR corporate tax filing',
      'At least ten (10) years in accordance with general civil contract prescription',
      'Payrolls may be discarded immediately after the expiration of thirty days from payout',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book III Rule X Sec. 11',
    explanation: 'Employers must retain employee payroll records, time cards, and deduction vouchers for at least three (3) years from the date of the last entry to facilitate DOLE visitorial inspection.',
  },
  {
    id: 'wd32',
    worldCode: 'w3',
    headline: 'DOLE Visitorial Power to Order Wage Refund (Art. 128)',
    prompt: 'During an inspection, a DOLE inspector finds unlawful uniform deductions totaling ₱300,000. Can the DOLE Regional Director order an immediate refund?',
    options: [
      'Yes — under Art. 128(b), the Regional Director has visitorial power to issue compliance orders for wage refunds',
      'No — only the Labor Arbiter of the NLRC has jurisdiction to order refunds through formal trial proceedings',
      'No — the inspector can only issue a non-binding moral recommendation with zero enforcement teeth',
      'Yes — but only if one hundred percent of the affected workers file formal verified complaints',
    ],
    correctIndex: 0,
    statute: 'Art. 128(b), Labor Code (as amended by R.A. 7730)',
    explanation: 'Under Art. 128(b), the DOLE Secretary or Regional Director has visitorial power to issue compliance orders directing the employer to immediately pay or refund unpaid labor standards benefits.',
  },
];

export const TOADSWORTH_RETIREMENT_BANK: readonly MasterArcadeScenario[] = [
  {
    id: 'tr1',
    worldCode: 'w5',
    headline: 'Statutory 22.5-Day Retirement Breakdown',
    prompt: 'Under R.A. 7641 (Art. 302), \'one-half month salary\' per year of service equals 22.5 days. How is 22.5 days composed?',
    options: [
      '15 days basic pay + 5 days Service Incentive Leave + 2.5 days (1/12 of 13th Month Pay)',
      '20 days basic pay + 2.5 days hazard allowance without service incentive leave credits',
      '22.5 calendar days straight basic pay without considering 13th month pay or incentives',
      '15 days basic pay + 7.5 days loyalty service bonus established under company practice',
    ],
    correctIndex: 0,
    statute: 'Art. 302 (R.A. 7641) & Elegir v. PAL',
    explanation: 'Unless excluded by nature of employment, one-half month retirement salary = 15 days + 5 days SIL + 1/12 of 13th month pay (2.5 days) = 22.5 days.',
  },
  {
    id: 'tr2',
    worldCode: 'w5',
    headline: 'General Optional vs Compulsory Retirement Age',
    prompt: 'In the absence of a retirement plan or CBA, what are the optional and compulsory retirement ages for ordinary private-sector workers with >= 5 years service?',
    options: [
      'Optional at 60 years old; Compulsory at 65 years old (with >= 5 years of service)',
      'Optional at 55 years old; Compulsory at 60 years old (matching civil service standards)',
      'Optional at 62 years old; Compulsory at 67 years old (under international labor conventions)',
      'Compulsory at 60 years old for all employees regardless of total years of company service',
    ],
    correctIndex: 0,
    statute: 'Art. 302, Labor Code',
    explanation: 'Under R.A. 7641, general optional retirement starts at age 60 (with at least 5 years of service) and compulsory retirement is at age 65.',
  },
  {
    id: 'tr3',
    worldCode: 'w5',
    headline: 'Underground & Surface Mine Workers Age',
    prompt: 'Under R.A. 8558 and R.A. 10757, what are the optional and compulsory retirement ages for underground and surface mine workers?',
    options: [
      'Optional at 50 years old; Compulsory at 60 years old (with >= 5 years of mining tenure)',
      'Optional at 55 years old; Compulsory at 65 years old (identical to general commercial workers)',
      'Optional at 45 years old; Compulsory at 55 years old (reserved for hazardous military service)',
      'Compulsory at 50 years old with no optional retirement category provided under mining law',
    ],
    correctIndex: 0,
    statute: 'R.A. 8558 & R.A. 10757',
    explanation: 'Both underground and surface mine workers may optionally retire at 50 and compulsorily retire at 60 (with at least 5 years of service).',
  },
  {
    id: 'tr4',
    worldCode: 'w5',
    headline: 'Redundancy / Labor-Saving Device Separation Pay',
    prompt: 'Under Article 298, what separation pay rate applies to Redundancy or Installation of Labor-Saving Devices?',
    options: [
      '1 month pay OR 1 month pay per year of service, whichever is higher (higher statutory tier)',
      '1 month pay OR 1/2 month pay per year of service, whichever is higher (retrenchment tier)',
      '22.5 days per year of service matching the standard statutory retirement pay formula',
      'No separation pay required if the employer provides sixty days advance termination notice',
    ],
    correctIndex: 0,
    statute: 'Art. 298, Labor Code',
    explanation: 'Redundancy and Installation of Labor-Saving Devices carry the higher tier: 1 month pay or 1 month pay for every year of service, whichever is higher.',
  },
  {
    id: 'tr5',
    worldCode: 'w5',
    headline: 'Retrenchment to Prevent Losses Separation Pay',
    prompt: 'What statutory separation pay rate applies to valid Retrenchment to Prevent Losses or Closure NOT due to serious business losses?',
    options: [
      '1 month pay OR 1/2 month pay per year of service, whichever is higher (half-month tier)',
      '1 month pay per year of service matching redundancy and labor-saving machinery tiers',
      'Zero separation pay, because economic losses completely exempt employers from payouts',
      '2 months pay per year of service as mandated by the Omnibus Rules for retrenched staff',
    ],
    correctIndex: 0,
    statute: 'Art. 298, Labor Code',
    explanation: 'Retrenchment and Closure not due to serious business losses entitle workers to 1 month pay or 1/2 month pay per year of service, whichever is higher (a fraction of >= 6 months counts as 1 whole year).',
  },
  {
    id: 'tr6',
    worldCode: 'w5',
    headline: 'Disease Ground Under Article 299',
    prompt: 'To validly terminate employment due to Disease (Art. 299), whose certification is strictly required in addition to separation pay?',
    options: [
      'Competent public health authority certifying disease cannot be cured within six months',
      'Company retained physician or private clinic doctor issuing an internal health memo',
      'Human Resources General Manager certifying the employee exceeded sick leave credits',
      'Social Security System regional claims processor confirming sickness benefit disbursement',
    ],
    correctIndex: 0,
    statute: 'Art. 299, Labor Code',
    explanation: 'A certification by a competent public health authority (not merely a company doctor) is an indispensable substantive requirement under Art. 299.',
  },
  {
    id: 'tr7',
    worldCode: 'w5',
    headline: 'Small Establishment Exemption in R.A. 7641',
    prompt: 'Which establishments are exempt from mandatory retirement pay under R.A. 7641?',
    options: [
      'Retail, service, and agricultural establishments employing not more than ten (10) workers',
      'Corporate manufacturing establishments employing fewer than fifty (50) regular employees',
      'All family-owned holding corporations registered under the Philippine Corporation Code',
      'Foreign business process outsourcing firms operating inside PEZA registered ecozones',
    ],
    correctIndex: 0,
    statute: 'Art. 302 (R.A. 7641)',
    explanation: 'Retail, service, and agricultural establishments employing not more than 10 employees or workers are exempted from R.A. 7641 coverage.',
  },
  {
    id: 'tr8',
    worldCode: 'w5',
    headline: '30-Day Dual Notice for Authorized Causes',
    prompt: 'Before implementing Redundancy or Retrenchment, whom must the employer serve written notice upon, and how far in advance?',
    options: [
      'Both the affected employee AND the DOLE Regional Office at least 30 days before termination',
      'Only the affected employee at least five calendar days before the effective date of exit',
      'Only the certified bargaining union president on the exact date of employee severance',
      'The NLRC Labor Arbiter within fifteen days following implementation of the reduction',
    ],
    correctIndex: 0,
    statute: 'Art. 298, Labor Code',
    explanation: 'Authorized causes require separate written notices to BOTH the worker and DOLE at least 1 month (30 days) prior to the intended date of termination.',
  },
  {
    id: 'tr9',
    worldCode: 'w5',
    headline: 'Serious Business Losses Exemption from Separation Pay',
    prompt: 'When an enterprise shuts down completely due to audited, catastrophic, serious business losses, what is its separation pay obligation?',
    options: [
      'Exempt from separation pay under Art. 298, provided serious audited losses are proven',
      'Mandated to pay one full month salary per year of service regardless of bankruptcy',
      'Mandated to pay one-half month salary per year of service subsidized by the DOLE',
      'Exempt from separation pay only if all company corporate assets are assigned to workers',
    ],
    correctIndex: 0,
    statute: 'Art. 298, Labor Code; North Davao Mining v. NLRC',
    explanation: 'Closure or cessation of operations of establishment or undertaking resulting from serious business losses or financial reverses does not require separation pay under Art. 298.',
  },
  {
    id: 'tr10',
    worldCode: 'w5',
    headline: 'Two-Notice Rule for Just Causes (King of Kings)',
    prompt: 'Under the King of Kings doctrine, what two separate written notices must an employer serve to dismiss a worker for a Just Cause (Art. 297)?',
    options: [
      'First Notice detailing specific charges with 5 days to explain, and Second Notice of decision',
      'First Notice of immediate thirty-day suspension, and Second Notice demanding voluntary quitclaim',
      'Verbal reprimand during an HR conference, followed by a written termination certificate',
      'Single written letter of dismissal served on the employee on their last day of reporting',
    ],
    correctIndex: 0,
    statute: 'King of Kings Transport v. Mamac',
    explanation: 'King of Kings sets forth the Two-Notice Rule: (1) First written notice specifying grounds with ample opportunity to explain (at least 5 calendar days), and (2) Second written notice of decision.',
  },
  {
    id: 'tr11',
    worldCode: 'w5',
    headline: 'Hearing Requirement for Just Cause Dismissal',
    prompt: 'Under Perez v. PT&T, is a formal trial-type courtroom hearing mandatory before dismissing an employee for just cause?',
    options: [
      'No — \'ample opportunity to be heard\' does not require a formal courtroom-style trial',
      'Yes — failure to conduct a full trial with stenographic cross-examination voids dismissal',
      'A formal hearing is mandatory only if the employee is represented by private legal counsel',
      'A formal hearing is mandatory only for managerial staff and optional for rank-and-file',
    ],
    correctIndex: 0,
    statute: 'Perez v. Philippine Telegraph and Telephone Co.',
    explanation: 'In Perez v. PT&T, the Supreme Court clarified that a formal hearing or conference is not mandatory unless requested by the employee or required by company rules.',
  },
  {
    id: 'tr12',
    worldCode: 'w5',
    headline: 'Six-Month Fraction Rule for Separation Pay',
    prompt: 'An employee worked for 3 years and 7 months before being retrenched under Article 298. How many years of service are credited for separation pay?',
    options: [
      'Four (4) credited years, because a fraction of at least six (6) months counts as one whole year',
      'Three (3) credited years, because fractions of a year are disregarded in authorized causes',
      'Three and a half (3.5) credited years computed on a strict pro-rata daily mathematical basis',
      'Five (5) credited years under the automatic statutory rounding rule for retrenched personnel',
    ],
    correctIndex: 0,
    statute: 'Art. 298, Labor Code',
    explanation: 'Under Article 298, a fraction of at least six (6) months shall be considered as one (1) whole year in computing statutory separation pay.',
  },
  {
    id: 'tr13',
    worldCode: 'w5',
    headline: 'Strained Relations Doctrine Remedy',
    prompt: 'When an illegally dismissed employee\'s position is fraught with deep, irreconcilable personal antagonism with management, what remedy is awarded?',
    options: [
      'Separation pay in lieu of reinstatement, plus full statutory backwages from dismissal',
      'Reinstatement to the same position without backwages or monetary moral damages',
      'Immediate transfer to another company branch with forfeiture of accrued back salaries',
      'Nominal damages of five thousand pesos with no separation pay or backwages awarded',
    ],
    correctIndex: 0,
    statute: 'Bani Rural Bank v. De Guzman',
    explanation: 'Under the Doctrine of Strained Relations, where reinstatement is no longer feasible due to severe antagonism, separation pay is awarded in lieu of reinstatement, plus full backwages.',
  },
  {
    id: 'tr14',
    worldCode: 'w5',
    headline: 'Constructive Dismissal Supreme Court Test',
    prompt: 'What is the standard test to determine if an employer\'s transfer or demotion of an employee constitutes illegal \'Constructive Dismissal\'?',
    options: [
      'Whether continued employment is rendered impossible, unreasonable, or unbearable',
      'Whether the employee experienced subjective hurt feelings or discomfort in the new role',
      'Whether the employer gave thirty days advance notice before effecting the department transfer',
      'Whether the employee\'s salary remained identical regardless of severe demotion in rank',
    ],
    correctIndex: 0,
    statute: 'Tan v. NLRC & Duldulao v. CA',
    explanation: 'Constructive dismissal exists where there is a cessation of work because continued employment is rendered impossible, unreasonable, or unlikely, as an offer involving a demotion in rank or a diminution in pay.',
  },
  {
    id: 'tr15',
    worldCode: 'w5',
    headline: '30-Day Limit on Preventive Suspension',
    prompt: 'During an internal misconduct investigation, what is the maximum duration an employee may be placed on preventive suspension without pay?',
    options: [
      'Maximum 30 days without pay; after 30 days, the employer must reinstate or pay salary',
      'Maximum 60 days without pay while the company legal department gathers evidence',
      'Maximum 90 days without pay matching standard ninety-day criminal investigation periods',
      'Unlimited duration without pay provided the worker is notified weekly of inquiry status',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book V Rule XXIII Sec. 8–9',
    explanation: 'No preventive suspension shall last longer than thirty (30) days. The employer must thereafter reinstate the worker or pay wages during any extension.',
  },
  {
    id: 'tr16',
    worldCode: 'w5',
    headline: 'Agabon Doctrine Nominal Damages for Procedural Defect',
    prompt: 'When an employee is dismissed for a valid Just Cause (theft) but the employer failed to observe statutory procedural due process, what is the ruling?',
    options: [
      'Dismissal is upheld as valid, but the employer must pay nominal damages (Agabon doctrine)',
      'Dismissal is declared void ab initio, requiring full reinstatement and backwages',
      'The employee is awarded separation pay in lieu of reinstatement without nominal damages',
      'The employer is criminally prosecuted while the employee is acquitted of all wrongdoing',
    ],
    correctIndex: 0,
    statute: 'Agabon v. NLRC (G.R. No. 158693)',
    explanation: 'Under the Agabon doctrine, if the dismissal is for just cause but lacks statutory procedural due process, the dismissal is upheld but the employer is liable for nominal damages (typically PHP 30,000 for just cause).',
  },
  {
    id: 'tr17',
    worldCode: 'w5',
    headline: 'Jaka Food Doctrine for Authorized Cause Defect',
    prompt: 'When an employee is dismissed for a valid Authorized Cause (retrenchment) but the employer failed to give 30-day notice to DOLE, what is the ruling?',
    options: [
      'Dismissal is upheld as valid, but employer pays ₱50,000 nominal damages (Jaka Food doctrine)',
      'Dismissal is declared illegal, requiring full backwages and physical reinstatement',
      'The retrenchment is automatically voided and the employer must pay triple separation pay',
      'The company business permit is suspended until the 30-day notice period is completed',
    ],
    correctIndex: 0,
    statute: 'Jaka Food Processing v. Pacot (G.R. No. 151378)',
    explanation: 'Under the Jaka Food doctrine, dismissal for authorized cause without the statutory 30-day notice is valid, but entitles the worker to stiffer nominal damages (₱50,000) than just cause.',
  },
  {
    id: 'tr18',
    worldCode: 'w5',
    headline: 'Optional Retirement Age and Service Threshold (Art. 302)',
    prompt: 'Under R.A. 7641, what are the statutory age and service thresholds for an employee to qualify for optional retirement?',
    options: [
      'At least sixty (60) years old and at least five (5) years of service in the establishment',
      'At least fifty-five (55) years old and at least ten (10) years of continuous service',
      'At least fifty (50) years old regardless of the total length of employment service',
      'At least sixty-two (62) years old with at least three (3) years of company service',
    ],
    correctIndex: 0,
    statute: 'Art. 302, Labor Code (R.A. 7641)',
    explanation: 'Art. 302 provides that an employee upon reaching the age of 60 years or more, but not beyond 65 years which is hereby declared the compulsory retirement age, who has served at least 5 years may retire.',
  },
  {
    id: 'tr19',
    worldCode: 'w5',
    headline: 'Compulsory Retirement Age Under Article 302',
    prompt: 'Under Article 302 of the Labor Code, what is the statutory compulsory retirement age for general private-sector workers?',
    options: [
      'Sixty-five (65) years of age, regardless of total years of service',
      'Sixty (60) years of age, provided the employee rendered at least five years',
      'Seventy (70) years of age matching judicial retirement statutory standards',
      'Fifty-five (55) years of age for female employees and sixty (60) for male employees',
    ],
    correctIndex: 0,
    statute: 'Art. 302, Labor Code (R.A. 7641)',
    explanation: 'Article 302 explicitly declares sixty-five (65) years of age as the compulsory retirement age for covered employees in the private sector.',
  },
  {
    id: 'tr20',
    worldCode: 'w5',
    headline: 'Mine Workers Retirement Age (R.A. 8558 / R.A. 10757)',
    prompt: 'What are the optional and compulsory retirement ages for underground or surface mine workers under Republic Act No. 10757?',
    options: [
      'Optional at fifty (50) years old with 5 years service; Compulsory at sixty (60) years old',
      'Optional at forty-five (45) years old; Compulsory at fifty-five (55) years old',
      'Optional at fifty-five (55) years old; Compulsory at sixty-five (65) years old',
      'Mine workers follow the identical 60/65 age standards as general commercial office employees',
    ],
    correctIndex: 0,
    statute: 'R.A. 10757 (Amending Art. 302 for Mine Workers)',
    explanation: 'Due to severe occupational hazards, R.A. 10757 sets the retirement age for underground and surface mine workers at optional 50 years (with 5 years service) and compulsory at 60 years.',
  },
  {
    id: 'tr21',
    worldCode: 'w5',
    headline: 'Domestic Workers (Kasambahay) Retirement Coverage',
    prompt: 'Does a Kasambahay who reaches 60 years of age with 8 years of continuous domestic service have a statutory claim for retirement pay?',
    options: [
      'Yes — domestic workers are covered employees entitled to retirement pay under R.A. 7641',
      'No — domestic workers are excluded from all statutory retirement benefits under the Civil Code',
      'Retirement pay applies only if the domestic worker was employed by a diplomatic foreign household',
      'Only if the domestic employer voluntarily registered a private pension plan with the SSS',
    ],
    correctIndex: 0,
    statute: 'R.A. 7641 & R.A. 10361; DOLE Advisory on Kasambahay Retirement',
    explanation: 'Under R.A. 7641 and DOLE guidelines, domestic workers who meet the statutory age (at least 60) and service (at least 5 years) are entitled to retirement pay.',
  },
  {
    id: 'tr22',
    worldCode: 'w5',
    headline: 'Mandatory Nature of Retirement Pay Despite Losses',
    prompt: 'Can an employer deny an employee\'s statutory retirement pay on the ground that the company suffered severe financial deficits that year?',
    options: [
      'No — retirement pay under R.A. 7641 is a statutory obligation that cannot be defeated by business losses',
      'Yes — financial distress automatically suspends all retirement and separation pay obligations',
      'The employer may pay only twenty-five percent of the statutory retirement benefit during deficits',
      'Retirement pay is waived if the company files a petition for corporate rehabilitation',
    ],
    correctIndex: 0,
    statute: 'Art. 302, Labor Code; De La Salle Araneta University v. Bernardo',
    explanation: 'Retirement pay under R.A. 7641 is a statutory benefit earned through years of faithful service; financial reverses or deficit do not excuse an employer from full retirement pay compliance.',
  },
  {
    id: 'tr23',
    worldCode: 'w5',
    headline: 'Fractional Year Rounding in Retirement Pay',
    prompt: 'Mario retires after ten (10) years and seven (7) months of continuous employment. For computing his 22.5-day retirement pay, how many years are credited?',
    options: [
      'Eleven (11) years — a fraction of at least six (6) months is credited as one whole year',
      'Ten (10) years — only fully completed twelve-month calendar years are counted',
      'Ten and a half (10.5) years — prorated down to the exact decimal half-year equivalent',
      'Twelve (12) years — any service exceeding ten years is rounded up to the nearest even number',
    ],
    correctIndex: 0,
    statute: 'Art. 302, Labor Code (R.A. 7641)',
    explanation: 'Art. 302 explicitly provides that a fraction of at least six (6) months shall be considered as one (1) whole year for the purpose of computing retirement pay.',
  },
  {
    id: 'tr24',
    worldCode: 'w5',
    headline: 'Company Retirement Plan vs Statutory 22.5-Day Minimum',
    prompt: 'A company pension plan grants 15 days basic wage per year of service with zero components for 13th month pay or SIL. Which standard governs?',
    options: [
      'The statutory floor of 22.5 days per year under R.A. 7641 prevails as the mandatory minimum',
      'The private company pension plan prevails because parties freely executed the employment contract',
      'The employee receives both the company 15-day pension plan AND the full statutory 22.5 days',
      'The dispute must be submitted to the Insurance Commission for binding actuarial valuation',
    ],
    correctIndex: 0,
    statute: 'Art. 302, Labor Code; Elegir v. Philippine Airlines',
    explanation: 'Any collective bargaining agreement or company retirement plan providing benefits less than the statutory 22.5-day half-month salary under R.A. 7641 is superseded by the statutory minimum.',
  },
  {
    id: 'tr25',
    worldCode: 'w5',
    headline: 'Probationary Employee Performance Standards Notice',
    prompt: 'When must reasonable standards for regularization be communicated to a newly hired probationary worker for termination to be lawful?',
    options: [
      'At the time of engagement (commencement of employment)',
      'Any time within the first five months of the probationary period',
      'Only upon the issuance of the final performance appraisal memorandum',
      'Standards need not be communicated if they conform to general industry practices',
    ],
    correctIndex: 0,
    statute: 'Omnibus Rules Book VI Rule I Sec. 6(d); Abbott Laboratories v. Alcaraz',
    explanation: 'In all cases of probationary employment, the employer must make known to the employee the reasonable standards under which he will qualify as a regular employee at the time of his engagement.',
  },
  {
    id: 'tr26',
    worldCode: 'w5',
    headline: 'Two-Notice Rule for Just Cause Dismissal',
    prompt: 'Under King of Kings v. Mamac, what are the two distinct written notices required to satisfy procedural due process in a Just Cause termination?',
    options: [
      '1st Notice: Notice of Charge with 5-day rebuttal + 2nd Notice: Notice of Dismissal after hearing',
      '1st Notice: Verbal warning + 2nd Notice: Final demand letter from the company lawyer',
      '1st Notice: Preventive suspension order + 2nd Notice: Withholding of final salary envelope',
      '1st Notice: Notice to DOLE Regional Office + 2nd Notice: Internal office memorandum',
    ],
    correctIndex: 0,
    statute: 'King of Kings Transport v. Mamac (G.R. No. 166208)',
    explanation: 'Due process requires: (1) a first written notice stating the particular acts/omissions with at least 5 days to explain; and (2) a second written notice of dismissal after evaluation.',
  },
  {
    id: 'tr27',
    worldCode: 'w5',
    headline: 'Right to Counsel in Corporate Administrative Hearings',
    prompt: 'Is an employee facing potential dismissal for serious misconduct entitled to have legal counsel present during the administrative conference?',
    options: [
      'The employee has the right to be assisted by counsel if requested, but actual lawyer presence is not mandatory',
      'The employer is legally obligated to hire and pay for a private defense lawyer for the worker',
      'Lawyers are strictly barred from participating in all internal private corporate disciplinary meetings',
      'Counsel presence is required only if the potential financial penalty exceeds one hundred thousand pesos',
    ],
    correctIndex: 0,
    statute: 'Perez v. Medical City (G.R. No. 130353)',
    explanation: 'The Supreme Court ruled that the right to counsel in administrative hearings means the employee must be afforded the opportunity to be assisted by counsel if he so desires.',
  },
  {
    id: 'tr28',
    worldCode: 'w5',
    headline: 'Statutory Remedies for Illegal Dismissal (Art. 294)',
    prompt: 'Under Article 294 of the Labor Code, what are the two core statutory remedies awarded to an illegally dismissed employee?',
    options: [
      'Reinstatement without loss of seniority rights + Full backwages inclusive of regular benefits',
      'Promissory note for future rehire + Six months of paid health insurance coverage',
      'Nominal damages of ten thousand pesos + Immediate release of the employee\'s tax refund',
      'Automatic transfer to a government civil service agency with identical salary grade',
    ],
    correctIndex: 0,
    statute: 'Art. 294, Labor Code (as amended by R.A. 6715)',
    explanation: 'Article 294 guarantees that an employee unjustly dismissed shall be entitled to reinstatement without loss of seniority rights and other privileges, and to his full backwages.',
  },
  {
    id: 'tr29',
    worldCode: 'w5',
    headline: 'Separation Pay in Lieu of Reinstatement (Strained Relations)',
    prompt: 'When may a Labor Arbiter award separation pay instead of actual physical reinstatement to an illegally dismissed worker?',
    options: [
      'When reinstatement is no longer viable due to severely strained relations, closure, or abolished post',
      'Whenever the employer simply expresses a preference not to see the employee on premises',
      'Separation pay in lieu of reinstatement is strictly illegal under the Philippine Constitution',
      'Only if the employee has completed less than six months of continuous service',
    ],
    correctIndex: 0,
    statute: 'Golden Ace Builders v. Talde; Art. 294, Labor Code',
    explanation: 'Under the Doctrine of Strained Relations, where reinstatement is no longer feasible due to antagonism or position abolition, separation pay of 1 month per year of service is awarded instead.',
  },
  {
    id: 'tr30',
    worldCode: 'w5',
    headline: 'Separation Pay Rate in Lieu of Reinstatement',
    prompt: 'How is separation pay calculated when awarded in lieu of physical reinstatement due to strained relations?',
    options: [
      'One (1) month salary for every year of service, with a fraction of at least 6 months counted as a whole year',
      'One-half (1/2) month salary per year of service matching retrenchment standards',
      'A flat lump sum of three months basic wages regardless of the total length of service',
      'One full year of salary regardless of the actual employment duration',
    ],
    correctIndex: 0,
    statute: 'Bani Rural Bank v. De Guzman (G.R. No. 170904)',
    explanation: 'Separation pay awarded in lieu of reinstatement is computed at the rate of one (1) month salary for every year of service, a fraction of at least six (6) months being considered as one whole year.',
  },
  {
    id: 'tr31',
    worldCode: 'w5',
    headline: 'Immediate Executory Nature of Labor Arbiter Reinstatement',
    prompt: 'Under Article 229 of the Labor Code, is the reinstatement order of a Labor Arbiter immediately executory pending the employer\'s appeal to the NLRC?',
    options: [
      'Yes — reinstatement is immediately executory even pending appeal, either physically or in payroll',
      'No — the filing of an appeal bond automatically stays and freezes the reinstatement directive',
      'Reinstatement is stayed until the Court of Appeals affirms the Labor Arbiter decision',
      'Immediately executory only if the employee posts a counter-bond equal to one year of salary',
    ],
    correctIndex: 0,
    statute: 'Art. 229, Labor Code; Pioneer Texturizing v. NLRC',
    explanation: 'Article 229 explicitly provides: In any event, the decision of the Labor Arbiter reinstating a dismissed or separated employee, insofar as the reinstatement aspect is concerned, shall immediately be executory.',
  },
  {
    id: 'tr32',
    worldCode: 'w5',
    headline: 'Payroll Reinstatement Option During Employer Appeal',
    prompt: 'If an employer appeals a Labor Arbiter reinstatement order and chooses not to admit the worker back to the workplace, how must the employer comply?',
    options: [
      'By placing the employee on payroll reinstatement and paying salaries during the appeal',
      'By depositing one year of salary with the clerk of court of the Regional Trial Court',
      'The employer can refuse to pay anything until the Supreme Court issues a final entry of judgment',
      'By issuing an unpaid sabbatical clearance until the NLRC Commissioners render a decision',
    ],
    correctIndex: 0,
    statute: 'Art. 229, Labor Code; Garcia v. Philippine Airlines',
    explanation: 'The employer has two options to comply with an immediate reinstatement order: actual physical reinstatement or payroll reinstatement (paying salaries without requiring physical reporting).',
  },
];
interface MasterVaultGameCommonProps {
  equippedAvatar: MarioAvatar;
  onEarnCoins: (amount: number) => void;
  onQuizCompleted?: (payload: {
    worldCode: string;
    correctCount: number;
    totalCount: number;
    isBossVictory?: boolean;
    topicTitle?: string;
  }) => void;
}

/**
 * Bespoke Interactive Game Stage for each Master Arcade Title
 * Features genuine real playable action arcade mechanics:
 * railway track switching, ghost vacuuming, telescope constellation alignment,
 * royal wax stamping, safe-combination dial cracking, and courtroom scale balancing.
 */
/**
 * Bespoke Interactive Game Stage for each Master Arcade Title
 * Features genuine real playable action arcade mechanics:
 * railway track switching, ghost vacuuming, telescope constellation alignment,
 * royal wax stamping, safe-combination dial cracking, and courtroom scale balancing.
 */
const InteractiveMasterArcadeStage: React.FC<{
  gameTitle: string;
  stageNum: number;
  totalStages: number;
  options: string[];
  pickedOption: number | null;
  correctIndex: number;
  onPickOption: (idx: number) => void;
  streak: number;
  eliminatedIndices?: Set<number>;
}> = ({
  gameTitle,
  stageNum,
  totalStages,
  options,
  pickedOption,
  correctIndex,
  onPickOption,
  eliminatedIndices,
}) => {
  const [trainWhistleActive, setTrainWhistleActive] = useState(false);
  const [yoshiTrackLever, setYoshiTrackLever] = useState<number>(0);
  const [luigiGhostTarget, setLuigiGhostTarget] = useState<number>(0);
  const [uvChannelIdx, setUvChannelIdx] = useState<number>(0);
  const [rosalinaTarget, setRosalinaTarget] = useState<number>(0);
  const [aimAngle, setAimAngle] = useState(45);
  const [flashlightPos, setFlashlightPos] = useState({ x: 50, y: 50 });
  const [peachScrollIdx, setPeachScrollIdx] = useState<number>(0);
  const [peachSealLocked, setPeachSealLocked] = useState(false);
  const [warioTumblerIdx, setWarioTumblerIdx] = useState<number>(0);
  const [vaultDialDeg, setVaultDialDeg] = useState(90);
  const [toadsworthWeightIdx, setToadsworthWeightIdx] = useState<number>(0);
  const [tribunalCounterweight, setTribunalCounterweight] = useState<'22.5d' | 'mine' | 'exempt'>('22.5d');
  const [actionPulse, setActionPulse] = useState(false);

  // 1. Yoshi Overtime Express — Live Railway Switcher Simulator
  if (gameTitle.includes('Yoshi')) {
    const trackLabels = ['Track A', 'Track B', 'Track C', 'Track D'];
    const handleWhistle = () => {
      setTrainWhistleActive(true);
      marioAudio.playPowerUp();
      setTimeout(() => setTrainWhistleActive(false), 800);
    };

    const handleEngageTrack = (trackIdx: number) => {
      setYoshiTrackLever(trackIdx);
      setActionPulse(true);
      handleWhistle();
      setTimeout(() => setActionPulse(false), 900);
      onPickOption(trackIdx);
    };

    return (
      <div className="bg-slate-900 border-3 border-emerald-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        {/* Railway Locomotive Cockpit HUD */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-500 border-2 border-black shadow-[0_3px_0_#000]">
              <Train className="w-5 h-5 text-slate-950 shrink-0" />
            </div>
            <div>
              <span className="font-mario text-[11px] text-emerald-300 uppercase block">
                Yoshi Overtime Locomotive · Station #{stageNum}/{totalStages}
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Mainline Junction Rails · Steam Pressure: {trainWhistleActive ? '100% MAXIMUM BOOST' : '88% ACTIVE'}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-full justify-start sm:justify-end">
            {trackLabels.map((lbl, idx) => (
              <button
                key={lbl}
                type="button"
                onClick={() => {
                  setYoshiTrackLever(idx);
                  marioAudio.playClick();
                }}
                className={`min-h-[30px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg font-mono text-[10px] font-black border cursor-pointer transition-all shrink-0 ${
                  yoshiTrackLever === idx
                    ? 'bg-emerald-400 text-slate-950 border-black shadow-[0_0_8px_rgba(52,211,153,0.7)] scale-105'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">Track </span>{String.fromCharCode(65 + idx)}
              </button>
            ))}
            <button
              type="button"
              onClick={handleWhistle}
              title="Switch Track & Blow Whistle"
              className="min-h-[30px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] border border-black shadow-[0_2px_0_#000] cursor-pointer flex items-center gap-1 active:translate-y-0.5 shrink-0"
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>WHISTLE</span>
            </button>
          </div>
        </div>

        {/* Action Railway Arcade Playfield Arena */}
        <div className="relative bg-gradient-to-b from-sky-950 via-slate-950 to-emerald-950 rounded-2xl border-2 border-emerald-600/60 p-3.5 flex flex-col justify-between gap-3 overflow-hidden">
          {/* Animated Speed Lines & Background Steam */}
          <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
            <div className="absolute top-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse" />
            <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`p-2 rounded-2xl bg-emerald-500 border-2 border-black shadow-[0_3px_0_#000] transition-all duration-300 ${
                  trainWhistleActive ? 'animate-bounce scale-110 rotate-3' : actionPulse ? 'scale-105' : ''
                }`}
              >
                <MarioCharacterAvatar character="yoshi" className="w-8 h-8" />
              </div>
              <div className="bg-black/75 px-3 py-1.5 rounded-xl border border-emerald-400/50 text-xs font-bold text-emerald-200">
                <span>
                  Switch Yoshi&apos;s train to the lawful statutory overtime multiplier track below!
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/80 px-2 py-1 rounded-lg border border-slate-700">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-amber-300 font-mono text-xs font-black tabular-nums">
                  {trainWhistleActive ? '120 MPH · HYPER' : `${65 + stageNum * 5} MPH · CRUISE`}
                </span>
              </div>
            </div>
          </div>

          {/* Animated 4-Track Railroad Switcher Rail Yard with Animated Train Sprites */}
          <div className="relative z-10 bg-slate-950/90 border border-emerald-500/40 rounded-xl p-2.5 space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300 px-1">
              <span className="uppercase tracking-wider font-bold">
                Overtime Rail Yard · Active Switch: Track {String.fromCharCode(65 + yoshiTrackLever)}
              </span>
              <span className="text-amber-300 font-bold flex items-center gap-1">
                {trainWhistleActive ? (
                  <>
                    <Flame className="w-3 h-3 text-amber-400 animate-bounce" />
                    <span>STEAM BOOST ACTIVE</span>
                  </>
                ) : (
                  <span>Signal: GREEN READY</span>
                )}
              </span>
            </div>
            <div className="space-y-1.5 py-1">
              {trackLabels.map((lbl, tIdx) => {
                const isTrainHere = yoshiTrackLever === tIdx;
                const isCorrectTrack = tIdx === correctIndex;
                const isPickedTrack = pickedOption === tIdx;
                return (
                  <div
                    key={lbl}
                    onClick={() => {
                      if (pickedOption === null && !eliminatedIndices?.has(tIdx)) {
                        setYoshiTrackLever(tIdx);
                        marioAudio.playClick();
                      }
                    }}
                    className={`min-h-[36px] h-auto rounded-xl border-2 flex items-center justify-between px-3 py-1.5 transition-all relative overflow-hidden cursor-pointer ${
                      isTrainHere
                        ? 'bg-emerald-950/90 border-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.4)] scale-[1.01]'
                        : 'bg-black/70 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {/* Animated Railroad Track Sleepers & Ties */}
                    <div
                      className="absolute inset-0 opacity-25 pointer-events-none"
                      style={{
                        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, #10b981 10px, #10b981 12px)',
                      }}
                    />

                    <div className="flex items-center gap-2.5 relative z-10">
                      <span className={`w-5 h-5 rounded-md text-[10px] font-mono font-black flex items-center justify-center border shadow-sm ${
                        isTrainHere ? 'bg-emerald-400 text-slate-950 border-black' : 'bg-slate-900 text-slate-400 border-slate-700'
                      }`}>
                        {String.fromCharCode(65 + tIdx)}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-200">
                        {lbl}
                      </span>
                      {/* Signal Lantern Indicator */}
                      <span className={`w-2 h-2 rounded-full border border-black shadow-sm ${
                        isTrainHere ? 'bg-emerald-400 animate-ping' : 'bg-slate-700'
                      }`} />
                    </div>

                    <div className="flex items-center gap-2 relative z-10">
                      {isTrainHere && (
                        <div className="flex items-center gap-1.5 bg-emerald-500/30 px-2.5 py-1 rounded-lg border border-emerald-400/60 animate-pulse">
                          <Train className="w-4 h-4 text-emerald-300 animate-bounce" />
                          <span className="text-[9px] font-mario text-emerald-200">
                            {trainWhistleActive ? 'FULL STEAM!' : 'LOCOMOTIVE ARMED'}
                          </span>
                        </div>
                      )}
                      {pickedOption !== null && isCorrectTrack && (
                        <span className="text-[9px] font-mario text-amber-300 bg-black/80 px-2 py-0.5 rounded border border-emerald-400 whitespace-nowrap shadow-sm">
                          CLEARED!
                        </span>
                      )}
                      {pickedOption !== null && isPickedTrack && !isCorrectTrack && (
                        <span className="text-[9px] font-mario text-rose-300 bg-black/80 px-2 py-0.5 rounded border border-rose-500 whitespace-nowrap shadow-sm">
                          DERAILED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Arcade Primary Controller: Full Steam Throttle */}
          <div className="pt-1">
            <button
              type="button"
              disabled={pickedOption !== null || eliminatedIndices?.has(yoshiTrackLever)}
              onClick={() => handleEngageTrack(yoshiTrackLever)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer font-mario text-xs sm:text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Train className="w-5 h-5 fill-current animate-bounce shrink-0" />
              <span className="break-normal">PULL THROTTLE: DISPATCH YOSHI ON TRACK {String.fromCharCode(65 + yoshiTrackLever)}</span>
            </button>
          </div>

          {/* 4 Interactive Full-Width Cargo Track Choices */}
          <div className="space-y-2.5">
            {options.map((opt, i) => {
              const isEliminated = eliminatedIndices?.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              const isCurrentTrack = yoshiTrackLever === i;
              let trackColor =
                'bg-slate-950/95 hover:bg-emerald-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                trackColor =
                  'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
                if (isRight) {
                  trackColor =
                    'bg-emerald-600 text-white border-black ring-2 ring-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.8)]';
                } else if (isSelected) {
                  trackColor = 'bg-rose-600 text-white border-black';
                } else {
                  trackColor = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              } else if (isCurrentTrack) {
                trackColor =
                  'bg-emerald-950/80 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => !isEliminated && handleEngageTrack(i)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer block ${trackColor}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1 max-w-full">
                      <span className="w-7 h-7 rounded-lg bg-black text-amber-300 font-mario text-xs flex items-center justify-center shrink-0 border border-slate-700">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wide break-words [overflow-wrap:anywhere]">
                        Overtime Track {String.fromCharCode(65 + i)} {isCurrentTrack ? '· [ACTIVE SWITCH]' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEliminated && (
                        <span className="text-[9px] font-mario text-rose-400 bg-black/80 px-2 py-0.5 rounded border border-rose-600 whitespace-nowrap">ZAPPED!</span>
                      )}
                      {pickedOption !== null && isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-amber-300 bg-black/90 px-2.5 py-1 rounded border border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] whitespace-nowrap">
                          CLEARED!
                        </span>
                      )}
                      {pickedOption !== null && isSelected && !isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-rose-300 bg-black/90 px-2.5 py-1 rounded border border-rose-500 whitespace-nowrap">
                          DERAILED
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

  // 2. Luigi Night-Shift Poltergust — Ghost Vacuum Arena
  if (gameTitle.includes('Luigi')) {
    const uvChannels = ['+10% NSD', '137.5% OT-NSD', '220% RegHol-NSD'];
    const handleVacuumGhost = (ghostIdx: number) => {
      setLuigiGhostTarget(ghostIdx);
      marioAudio.playPowerUp();
      setActionPulse(true);
      setTimeout(() => setActionPulse(false), 800);
      onPickOption(ghostIdx);
    };

    return (
      <div className="bg-slate-900 border-3 border-indigo-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-indigo-500 border-2 border-black shadow-[0_3px_0_#000]">
              <Moon className="w-5 h-5 text-slate-950 shrink-0" />
            </div>
            <div>
              <span className="font-mario text-[11px] text-indigo-300 uppercase block">
                Graveyard Shift Vacuum · 10:00 PM – 6:00 AM Window
              </span>
              <span className="text-[10px] font-mono text-cyan-300">
                Poltergust 3000 Suction Armed · Haunted Vault #{stageNum}/{totalStages}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {uvChannels.map((ch, idx) => (
              <button
                key={ch}
                type="button"
                onClick={() => {
                  setUvChannelIdx(idx);
                  marioAudio.playClick();
                }}
                className={`px-2 py-1 rounded-lg font-mono text-[10px] font-black border cursor-pointer transition-all ${
                  uvChannelIdx === idx
                    ? 'bg-indigo-400 text-slate-950 border-black shadow-[0_0_8px_rgba(99,102,241,0.8)] scale-105'
                    : 'bg-slate-950 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setFlashlightPos({
              x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
              y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
            });
          }}
          className="relative bg-gradient-to-b from-slate-950 via-indigo-950/80 to-black rounded-2xl border-2 border-indigo-600/60 p-3.5 overflow-hidden flex flex-col justify-between gap-3"
        >
          {/* Dynamic Interactive Flashlight Spotlight */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-75"
            style={{
              background: `radial-gradient(circle 140px at ${flashlightPos.x}% ${flashlightPos.y}%, rgba(254, 240, 138, 0.28) 0%, rgba(15, 23, 42, 0.92) 80%)`,
            }}
          />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-indigo-500 border-2 border-black shadow-[0_3px_0_#000]">
                <MarioCharacterAvatar character="luigi" className="w-8 h-8" />
              </div>
              <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-indigo-400/50 text-xs font-bold text-indigo-200">
                <span>UV Filter: {uvChannels[uvChannelIdx]} · Aim beam &amp; vacuum the lawful night-shift ruling!</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300 font-mono bg-black/70 px-2.5 py-1 rounded-lg border border-slate-700 tabular-nums">
                02:45 AM Graveyard
              </span>
            </div>
          </div>

          {/* Poltergust 3000 Ghost-Vacuum Radar Chamber */}
          <div className="relative z-10 bg-black/70 border border-indigo-500/40 rounded-xl p-3 space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300 px-1">
              <span className="uppercase tracking-wider font-bold">
                Haunted Graveyard Chamber · Suction Channel: {uvChannels[uvChannelIdx]}
              </span>
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Target: Ghost #{String.fromCharCode(65 + luigiGhostTarget)}</span>
              </span>
            </div>
            <div className="grid grid-cols-2 min-[440px]:grid-cols-4 gap-2.5 py-1 w-full max-w-full">
              {options.map((_, gIdx) => {
                const isTargetBoo = gIdx === correctIndex;
                const isGhostPicked = pickedOption === gIdx;
                const isCurrentTarget = luigiGhostTarget === gIdx;
                return (
                  <div
                    key={gIdx}
                    onClick={() => {
                      if (pickedOption === null && !eliminatedIndices?.has(gIdx)) {
                        setLuigiGhostTarget(gIdx);
                        marioAudio.playClick();
                      }
                    }}
                    className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all relative overflow-hidden cursor-pointer ${
                      isGhostPicked
                        ? isTargetBoo
                          ? 'bg-indigo-600/90 border-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.8)] scale-105'
                          : 'bg-rose-950/90 border-rose-500'
                        : isCurrentTarget
                        ? 'bg-indigo-950 border-cyan-400 ring-2 ring-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] scale-105'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <MarioBooIcon className={`w-6 h-6 transition-transform ${isGhostPicked && isTargetBoo ? 'scale-125 animate-spin' : isCurrentTarget ? 'scale-110 animate-bounce' : 'animate-pulse'}`} />
                    <span className="text-[10px] font-mono font-black text-slate-200">
                      <span className="hidden sm:inline">Ghost #</span>{String.fromCharCode(65 + gIdx)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Arcade Primary Controller: Vacuum Suction Blast */}
          <div className="relative z-10 pt-1">
            <button
              type="button"
              disabled={pickedOption !== null || eliminatedIndices?.has(luigiGhostTarget)}
              onClick={() => handleVacuumGhost(luigiGhostTarget)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 hover:from-indigo-400 hover:to-cyan-300 text-slate-950 font-black border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer font-mario text-xs sm:text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Moon className="w-5 h-5 fill-current animate-pulse shrink-0" />
              <span className="break-normal">FIRE POLTERGUST 3000 NOZZLE AT GHOST {String.fromCharCode(65 + luigiGhostTarget)}</span>
            </button>
          </div>

          {/* 4 Interactive Full-Width Ghost Target Cards */}
          <div className="space-y-2.5 relative z-10">
            {options.map((opt, i) => {
              const isEliminated = eliminatedIndices?.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              const isCurrentTarget = luigiGhostTarget === i;
              let ghostBox = 'bg-slate-950/95 hover:bg-indigo-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                ghostBox = 'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
                if (isRight) {
                  ghostBox = 'bg-indigo-600 text-white border-black ring-2 ring-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.8)]';
                } else if (isSelected) {
                  ghostBox = 'bg-rose-600 text-white border-black';
                } else {
                  ghostBox = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              } else if (isCurrentTarget) {
                ghostBox = 'bg-indigo-950/90 border-cyan-400 text-cyan-100 ring-2 ring-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]';
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => !isEliminated && handleVacuumGhost(i)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer block ${ghostBox}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1 max-w-full">
                      <MarioBooIcon className="w-5 h-5 shrink-0" />
                      <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wide break-words [overflow-wrap:anywhere]">
                        Ghost Target #{String.fromCharCode(65 + i)} {isCurrentTarget ? '· [TARGET LOCKED]' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEliminated && (
                        <span className="text-[9px] font-mario text-rose-400 bg-black/80 px-2 py-0.5 rounded border border-rose-600 whitespace-nowrap">ZAPPED!</span>
                      )}
                      {pickedOption !== null && isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-emerald-300 bg-black/90 px-2.5 py-1 rounded border border-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)] whitespace-nowrap">
                          VACUUMED!
                        </span>
                      )}
                      {pickedOption !== null && isSelected && !isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-rose-300 bg-black/90 px-2.5 py-1 rounded border border-rose-500 whitespace-nowrap">
                          SPOOKED!
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

  // 3. Rosalina's Wage Observatory — Celestial Alignment Simulator
  if (gameTitle.includes('Rosalina')) {
    const constellationLabels = ['Constellation α', 'Constellation β', 'Constellation γ', 'Constellation δ'];
    const handleFireAlignmentBeam = (targetIdx: number) => {
      setRosalinaTarget(targetIdx);
      setAimAngle(30 + targetIdx * 60);
      marioAudio.playPowerUp();
      setActionPulse(true);
      setTimeout(() => setActionPulse(false), 800);
      onPickOption(targetIdx);
    };

    return (
      <div className="bg-slate-900 border-3 border-sky-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-sky-500 border-2 border-black shadow-[0_3px_0_#000]">
              <Sparkles className="w-5 h-5 text-slate-950 shrink-0" />
            </div>
            <div>
              <span className="font-mario text-[11px] text-sky-300 uppercase block">
                Rosalina Wage Observatory · Celestial Sector #{stageNum}/{totalStages}
              </span>
              <span className="text-[10px] font-mono text-cyan-300">
                Starlight Alignment Turret: {aimAngle}° · Quantum Reticle Locked
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setAimAngle((a) => (a + 315) % 360);
                marioAudio.playClick();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 text-sky-300 border border-sky-500/60 hover:bg-sky-950 cursor-pointer font-black"
            >
              Rotate ◄
            </button>
            <span className="text-cyan-300 bg-black px-2.5 py-1 rounded-lg border border-slate-700 tabular-nums">
              {aimAngle}°
            </span>
            <button
              type="button"
              onClick={() => {
                setAimAngle((a) => (a + 45) % 360);
                marioAudio.playClick();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 text-sky-300 border border-sky-500/60 hover:bg-sky-950 cursor-pointer font-black"
            >
              Rotate ►
            </button>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-sky-950 via-slate-950 to-indigo-950 rounded-2xl border-2 border-sky-600/60 p-3.5 flex flex-col justify-between gap-3 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-2xl bg-sky-500 border-2 border-black shadow-[0_3px_0_#000] shrink-0">
                <MarioCharacterAvatar character="rosalina" className="w-8 h-8" />
              </div>
              <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-sky-400/50 text-xs font-bold text-sky-200 min-w-0">
                <span className="break-words">Align observatory crosshairs onto the lawful wage standard constellation!</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-full justify-start sm:justify-end">
              {constellationLabels.map((lbl, cIdx) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => {
                    setRosalinaTarget(cIdx);
                    setAimAngle(30 + cIdx * 60);
                    marioAudio.playClick();
                  }}
                  className={`min-h-[30px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer shrink-0 transition-all ${
                    rosalinaTarget === cIdx
                      ? 'bg-sky-400 text-slate-950 border-black shadow-[0_0_8px_rgba(56,189,248,0.8)] scale-105'
                      : 'bg-black/70 text-sky-300 border-sky-600/40 hover:text-white'
                  }`}
                >
                  {String.fromCharCode(65 + cIdx)}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Celestial Telescope Reticle Viewport */}
          <div className="relative h-32 sm:h-36 bg-black rounded-xl border border-sky-500/50 flex items-center justify-center overflow-hidden shadow-inner">
            <div
              className="absolute inset-0 opacity-40 transition-transform duration-500 pointer-events-none"
              style={{ transform: `rotate(${aimAngle}deg)` }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-sky-400/50" />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-sky-400/50" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-1.5">
              <MarioStarIcon className={`w-10 h-10 text-yellow-300 drop-shadow-[0_0_16px_rgba(253,224,71,0.9)] transition-transform duration-300 ${actionPulse ? 'scale-125 rotate-180' : 'animate-pulse'}`} />
              <span className="text-[10px] font-mono font-black text-sky-300 uppercase bg-black/80 px-2.5 py-0.5 rounded border border-sky-500/60">
                {constellationLabels[rosalinaTarget]} · Angle: {aimAngle}°
              </span>
            </div>
          </div>

          {/* Action Arcade Primary Controller: Fire Alignment Beam */}
          <div className="pt-1">
            <button
              type="button"
              disabled={pickedOption !== null || eliminatedIndices?.has(rosalinaTarget)}
              onClick={() => handleFireAlignmentBeam(rosalinaTarget)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-black border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer font-mario text-xs sm:text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Crosshair className="w-5 h-5 animate-spin shrink-0" />
              <span className="break-normal">FIRE OBSERVATORY LASER AT CONSTELLATION {String.fromCharCode(65 + rosalinaTarget)}</span>
            </button>
          </div>

          {/* 4 Interactive Full-Width Constellation Star Cards */}
          <div className="space-y-2.5">
            {options.map((opt, i) => {
              const isEliminated = eliminatedIndices?.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              const isCurrentConstellation = rosalinaTarget === i;
              let starStyle = 'bg-slate-950/95 hover:bg-sky-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                starStyle = 'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
                if (isRight) {
                  starStyle = 'bg-sky-500 text-slate-950 border-black ring-2 ring-sky-200 font-black shadow-[0_0_12px_rgba(56,189,248,0.8)]';
                } else if (isSelected) {
                  starStyle = 'bg-rose-600 text-white border-black';
                } else {
                  starStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              } else if (isCurrentConstellation) {
                starStyle = 'bg-sky-950/90 border-sky-400 text-sky-100 ring-2 ring-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)]';
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => !isEliminated && handleFireAlignmentBeam(i)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer block ${starStyle}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1 max-w-full">
                      <MarioStarIcon className="w-5 h-5 shrink-0" />
                      <span className="text-[11px] font-mono font-bold text-sky-300 uppercase tracking-wide break-words [overflow-wrap:anywhere]">
                        Constellation #{String.fromCharCode(65 + i)} ({30 + i * 60}°) {isCurrentConstellation ? '· [RETICLE AIMED]' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEliminated && (
                        <span className="text-[9px] font-mario text-rose-400 bg-black/80 px-2 py-0.5 rounded border border-rose-600 whitespace-nowrap">ZAPPED!</span>
                      )}
                      {pickedOption !== null && isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-slate-950 bg-sky-300 px-2.5 py-1 rounded border border-sky-100 shadow-[0_0_8px_rgba(56,189,248,0.8)] whitespace-nowrap">
                          ALIGNED!
                        </span>
                      )}
                      {pickedOption !== null && isSelected && !isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-rose-300 bg-black/90 px-2.5 py-1 rounded border border-rose-500 whitespace-nowrap">
                          MISALIGNED
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

  // 4. Peach's Royal Leave Dispatch — Royal Mail Sorting
  if (gameTitle.includes('Peach')) {
    const handleSlamRoyalStamp = (petitionIdx: number) => {
      setPeachScrollIdx(petitionIdx);
      setPeachSealLocked(true);
      marioAudio.playPowerUp();
      setActionPulse(true);
      setTimeout(() => setActionPulse(false), 800);
      onPickOption(petitionIdx);
    };

    return (
      <div className="bg-slate-900 border-3 border-pink-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pink-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-pink-500 border-2 border-black shadow-[0_3px_0_#000]">
              <Crown className="w-5 h-5 text-slate-950 shrink-0" />
            </div>
            <div>
              <span className="font-mario text-[11px] text-pink-300 uppercase block">
                Princess Peach Royal Leave Dispatch Desk #{stageNum}/{totalStages}
              </span>
              <span className="text-[10px] font-mono text-pink-300">
                Statutory Leave Petitions · Royal Seal: {peachSealLocked ? 'ARMED' : 'READY'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setPeachSealLocked((v) => !v);
              marioAudio.playCoin();
            }}
            className={`px-3 py-1.5 rounded-xl border font-black text-[10px] cursor-pointer transition-all ${
              peachSealLocked
                ? 'bg-pink-400 text-slate-950 border-black shadow-[0_0_8px_rgba(244,114,182,0.8)]'
                : 'bg-black/60 text-pink-300 border-pink-500/60 hover:text-white'
            }`}
          >
            {peachSealLocked ? 'ROYAL SEAL ARMED' : 'ARM ROYAL WAX SEAL'}
          </button>
        </div>

        <div className="relative bg-gradient-to-b from-pink-950 via-slate-950 to-purple-950 rounded-2xl border-2 border-pink-600/60 p-3.5 flex flex-col justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-2xl bg-pink-500 border-2 border-black shadow-[0_3px_0_#000] shrink-0">
                <MarioCharacterAvatar character="peach" className="w-8 h-8" />
              </div>
              <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-pink-400/50 text-xs font-bold text-pink-200 flex items-center gap-2 min-w-0">
                <Scroll className="w-4 h-4 text-pink-300 shrink-0" />
                <span className="break-words">Review statutory leave petitions and stamp the official royal wax seal!</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-full justify-start sm:justify-end">
              {options.map((_, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    setPeachScrollIdx(pIdx);
                    marioAudio.playClick();
                  }}
                  className={`min-h-[30px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer shrink-0 transition-all ${
                    peachScrollIdx === pIdx
                      ? 'bg-pink-400 text-slate-950 border-black shadow-[0_0_8px_rgba(244,114,182,0.8)] scale-105'
                      : 'bg-black/70 text-pink-300 border-pink-600/40 hover:text-white'
                  }`}
                >
                  {String.fromCharCode(65 + pIdx)}
                </button>
              ))}
            </div>
          </div>

          {/* Action Arcade Primary Controller: Slam Royal Wax Stamp */}
          <div className="pt-1">
            <button
              type="button"
              disabled={pickedOption !== null || eliminatedIndices?.has(peachScrollIdx)}
              onClick={() => handleSlamRoyalStamp(peachScrollIdx)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-pink-500 via-pink-400 to-rose-400 hover:from-pink-400 hover:to-rose-300 text-slate-950 font-black border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer font-mario text-xs sm:text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Stamp className={`w-5 h-5 fill-current shrink-0 ${actionPulse ? 'animate-ping' : 'animate-bounce'}`} />
              <span className="break-normal">PRESS ROYAL CROWN GOLD WAX STAMP ON PETITION #{String.fromCharCode(65 + peachScrollIdx)}</span>
            </button>
          </div>

          {/* 4 Interactive Full-Width Petition Chute Cards */}
          <div className="space-y-2.5">
            {options.map((opt, i) => {
              const isEliminated = eliminatedIndices?.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              const isCurrentScroll = peachScrollIdx === i;
              let chuteStyle = 'bg-slate-950/95 hover:bg-pink-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                chuteStyle = 'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
                if (isRight) {
                  chuteStyle = 'bg-pink-400 text-slate-950 border-black ring-2 ring-pink-200 font-black shadow-[0_0_12px_rgba(236,72,153,0.8)]';
                } else if (isSelected) {
                  chuteStyle = 'bg-rose-600 text-white border-black';
                } else {
                  chuteStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              } else if (isCurrentScroll) {
                chuteStyle = 'bg-pink-950/90 border-pink-400 text-pink-100 ring-2 ring-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.5)]';
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => !isEliminated && handleSlamRoyalStamp(i)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer block ${chuteStyle}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1 max-w-full">
                      <Stamp className="w-5 h-5 shrink-0" />
                      <span className="text-[11px] font-mono font-bold text-pink-300 uppercase tracking-wide break-words [overflow-wrap:anywhere]">
                        Royal Leave Petition #{String.fromCharCode(65 + i)} {isCurrentScroll ? '· [CHUTE LOADED]' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEliminated && (
                        <span className="text-[9px] font-mario text-rose-400 bg-black/80 px-2 py-0.5 rounded border border-rose-600 whitespace-nowrap">ZAPPED!</span>
                      )}
                      {pickedOption !== null && isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-slate-950 bg-pink-300 px-2.5 py-1 rounded border border-pink-100 shadow-[0_0_8px_rgba(236,72,153,0.8)] whitespace-nowrap">
                          STAMPED!
                        </span>
                      )}
                      {pickedOption !== null && isSelected && !isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-rose-300 bg-black/90 px-2.5 py-1 rounded border border-rose-500 whitespace-nowrap">
                          REJECTED
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

  // 5. Wario's Payroll Deduction Vault — Mechanical Safe Cracker
  if (gameTitle.includes('Wario')) {
    const handleCrackVault = (tumblerIdx: number) => {
      setWarioTumblerIdx(tumblerIdx);
      marioAudio.playPowerUp();
      setActionPulse(true);
      setTimeout(() => setActionPulse(false), 800);
      onPickOption(tumblerIdx);
    };

    return (
      <div className="bg-slate-900 border-3 border-amber-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/40 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-amber-500 border-2 border-black shadow-[0_3px_0_#000]">
              <Vault className="w-5 h-5 text-slate-950 shrink-0" />
            </div>
            <div>
              <span className="font-mario text-[11px] text-amber-300 uppercase block">
                Wario Treasury · Safe Combination Tumbler #{stageNum}/{totalStages}
              </span>
              <span className="text-[10px] font-mono text-amber-300">
                Payroll Safe Dial: {vaultDialDeg}° · Tumbler Pins Set
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              type="button"
              data-testid="wario-dial-left-btn"
              onClick={() => {
                setVaultDialDeg((d) => (d + 315) % 360);
                marioAudio.playClick();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 border border-amber-500/60 hover:bg-amber-950 cursor-pointer font-black"
            >
              Dial -45°
            </button>
            <span className="text-amber-300 bg-black px-2.5 py-1 rounded-lg border border-amber-600/50 tabular-nums">
              {vaultDialDeg}°
            </span>
            <button
              type="button"
              data-testid="wario-dial-right-btn"
              onClick={() => {
                setVaultDialDeg((d) => (d + 45) % 360);
                marioAudio.playClick();
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 text-amber-300 border border-amber-500/60 hover:bg-amber-950 cursor-pointer font-black"
            >
              Dial +45°
            </button>
          </div>
        </div>

        <div className="relative bg-gradient-to-b from-amber-950 via-slate-950 to-yellow-950 rounded-2xl border-2 border-amber-600/60 p-3.5 flex flex-col justify-between gap-3 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-2 rounded-2xl bg-amber-500 border-2 border-black shadow-[0_3px_0_#000] shrink-0">
                <MarioCharacterAvatar character="wario" className="w-8 h-8" />
              </div>
              <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-amber-400/50 text-xs font-bold text-amber-200 min-w-0">
                <span className="break-words">Align vault tumbler to crack lawful Art. 113 wage deduction exceptions!</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-full justify-start sm:justify-end">
              {options.map((_, tIdx) => (
                <button
                  key={tIdx}
                  type="button"
                  onClick={() => {
                    setWarioTumblerIdx(tIdx);
                    setVaultDialDeg(45 + tIdx * 90);
                    marioAudio.playClick();
                  }}
                  className={`min-h-[30px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer shrink-0 transition-all ${
                    warioTumblerIdx === tIdx
                      ? 'bg-amber-400 text-slate-950 border-black shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-105'
                      : 'bg-black/70 text-amber-300 border-amber-600/40 hover:text-white'
                  }`}
                >
                  {String.fromCharCode(65 + tIdx)}
                </button>
              ))}
            </div>
          </div>

          {/* Action Arcade Primary Controller: Pull Vault Cracking Lever */}
          <div className="pt-1">
            <button
              type="button"
              disabled={pickedOption !== null || eliminatedIndices?.has(warioTumblerIdx)}
              onClick={() => handleCrackVault(warioTumblerIdx)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer font-mario text-xs sm:text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Vault className={`w-5 h-5 fill-current shrink-0 ${actionPulse ? 'animate-spin' : ''}`} />
              <span className="break-normal">PULL MECHANICAL VAULT LEVER ON TUMBLER {String.fromCharCode(65 + warioTumblerIdx)}</span>
            </button>
          </div>

          {/* 4 Interactive Full-Width Vault Tumbler Cards */}
          <div className="space-y-2.5">
            {options.map((opt, i) => {
              const isEliminated = eliminatedIndices?.has(i);
              const isSelected = pickedOption === i;
              const isRight = i === correctIndex;
              const isCurrentTumbler = warioTumblerIdx === i;
              let vaultStyle = 'bg-slate-950/95 hover:bg-amber-950/80 border-slate-700 text-slate-100';
              if (isEliminated) {
                vaultStyle = 'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
              } else if (pickedOption !== null) {
                if (isRight) {
                  vaultStyle = 'bg-amber-400 text-slate-950 border-black ring-2 ring-amber-200 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)]';
                } else if (isSelected) {
                  vaultStyle = 'bg-rose-600 text-white border-black';
                } else {
                  vaultStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
                }
              } else if (isCurrentTumbler) {
                vaultStyle = 'bg-amber-950/90 border-amber-400 text-amber-100 ring-2 ring-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
              }

              return (
                <button
                  key={i}
                  type="button"
                  disabled={pickedOption !== null || isEliminated}
                  onClick={() => !isEliminated && handleCrackVault(i)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer block ${vaultStyle}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1 max-w-full">
                      <Vault className="w-5 h-5 shrink-0" />
                      <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wide break-words [overflow-wrap:anywhere]">
                        Vault Tumbler #{String.fromCharCode(65 + i)} ({i * 90}°) {isCurrentTumbler ? '· [DIAL ALIGNED]' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isEliminated && (
                        <span className="text-[9px] font-mario text-rose-400 bg-black/80 px-2 py-0.5 rounded border border-rose-600 whitespace-nowrap">ZAPPED!</span>
                      )}
                      {pickedOption !== null && isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-slate-950 bg-amber-300 px-2.5 py-1 rounded border border-amber-100 shadow-[0_0_8px_rgba(245,158,11,0.8)] whitespace-nowrap">
                          CRACKED!
                        </span>
                      )}
                      {pickedOption !== null && isSelected && !isRight && !isEliminated && (
                        <span className="text-[10px] font-mario text-rose-300 bg-black/90 px-2.5 py-1 rounded border border-rose-500 whitespace-nowrap">
                          JAMMED
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

  // 6. Toadsworth's Retirement Pay Tribunal — Supreme Court Gavel
  const handleStrikeGavel = (weightIdx: number) => {
    setToadsworthWeightIdx(weightIdx);
    marioAudio.playPowerUp();
    setActionPulse(true);
    setTimeout(() => setActionPulse(false), 800);
    onPickOption(weightIdx);
  };

  return (
    <div className="bg-slate-900 border-3 border-amber-500 rounded-3xl p-4 sm:p-5 text-white shadow-[0_6px_0_#000] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/40 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-amber-500 border-2 border-black shadow-[0_3px_0_#000]">
            <Scale className="w-5 h-5 text-slate-950 shrink-0" />
          </div>
          <div>
            <span className="font-mario text-[11px] text-amber-300 uppercase block">
              Toadsworth Retirement Tribunal · Bench #{stageNum}/{totalStages}
            </span>
            <span className="text-[10px] font-mono text-amber-300">
              Art. 302 Statutory Balance Scales · Counterweight Equilibrium: 22.5d
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setTribunalCounterweight('22.5d');
              marioAudio.playClick();
            }}
            className={`px-2.5 py-1 rounded-lg border font-black cursor-pointer transition-all ${
              tribunalCounterweight === '22.5d'
                ? 'bg-amber-400 text-slate-950 border-black shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                : 'bg-black/60 text-amber-300 border-amber-500/40 hover:text-white'
            }`}
          >
            22.5-Day Standard
          </button>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-amber-950 via-slate-950 to-orange-950 rounded-2xl border-2 border-amber-600/60 p-3.5 flex flex-col justify-between gap-3 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-2xl bg-amber-500 border-2 border-black shadow-[0_3px_0_#000] shrink-0">
              <MarioCharacterAvatar character="toad" className="w-8 h-8" />
            </div>
            <div className="bg-black/80 px-3 py-1.5 rounded-xl border border-amber-400/50 text-xs font-bold text-amber-200 min-w-0">
              <span className="break-words">Balance the scales of statutory retirement pay (15d + 2.5d SIL + 5d 13th)!</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 max-w-full justify-start sm:justify-end">
            {options.map((_, wIdx) => (
              <button
                key={wIdx}
                type="button"
                onClick={() => {
                  setToadsworthWeightIdx(wIdx);
                  marioAudio.playClick();
                }}
                className={`min-h-[30px] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer shrink-0 transition-all ${
                  toadsworthWeightIdx === wIdx
                    ? 'bg-amber-400 text-slate-950 border-black shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-105'
                    : 'bg-black/70 text-amber-300 border-amber-600/40 hover:text-white'
                }`}
              >
                {String.fromCharCode(65 + wIdx)}
              </button>
            ))}
          </div>
        </div>

        {/* Action Arcade Primary Controller: Strike Judicial Gavel */}
        <div className="pt-1">
          <button
            type="button"
            disabled={pickedOption !== null || eliminatedIndices?.has(toadsworthWeightIdx)}
            onClick={() => handleStrikeGavel(toadsworthWeightIdx)}
            className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black border-3 border-black shadow-[0_5px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer font-mario text-xs sm:text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Scale className={`w-5 h-5 fill-current shrink-0 ${actionPulse ? 'animate-bounce' : ''}`} />
            <span className="break-normal">STRIKE JUDICIAL GAVEL ON WEIGHT #{String.fromCharCode(65 + toadsworthWeightIdx)}</span>
          </button>
        </div>

        {/* 4 Interactive Full-Width Scales of Justice Factor Cards */}
        <div className="space-y-2.5">
          {options.map((opt, i) => {
            const isEliminated = eliminatedIndices?.has(i);
            const isSelected = pickedOption === i;
            const isRight = i === correctIndex;
            const isCurrentWeight = toadsworthWeightIdx === i;
            let scaleStyle = 'bg-slate-950/95 hover:bg-amber-950/80 border-slate-700 text-slate-100';
            if (isEliminated) {
              scaleStyle = 'opacity-30 line-through bg-slate-950/50 border-slate-800 text-slate-600 cursor-not-allowed';
            } else if (pickedOption !== null) {
              if (isRight) {
                scaleStyle = 'bg-amber-400 text-slate-950 border-black ring-2 ring-amber-200 font-black shadow-[0_0_12px_rgba(245,158,11,0.8)]';
              } else if (isSelected) {
                scaleStyle = 'bg-rose-600 text-white border-black';
              } else {
                scaleStyle = 'bg-slate-950/50 text-slate-500 border-slate-800';
              }
            } else if (isCurrentWeight) {
              scaleStyle = 'bg-amber-950/90 border-amber-400 text-amber-100 ring-2 ring-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
            }

            return (
              <button
                key={i}
                type="button"
                disabled={pickedOption !== null || isEliminated}
                onClick={() => !isEliminated && handleStrikeGavel(i)}
                className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 text-left transition-all cursor-pointer block ${scaleStyle}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1 max-w-full">
                    <Scale className="w-5 h-5 shrink-0" />
                    <span className="text-[11px] font-mono font-bold text-amber-300 uppercase tracking-wide break-words [overflow-wrap:anywhere]">
                      Tribunal Statutory Weight #{String.fromCharCode(65 + i)} {isCurrentWeight ? '· [FACTOR ARMED]' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isEliminated && (
                      <span className="text-[10px] font-mario text-rose-400/80 bg-black/80 px-2 py-0.5 rounded border border-rose-600 whitespace-nowrap">ZAPPED!</span>
                    )}
                    {pickedOption !== null && isRight && (
                      <span className="text-[10px] font-mario text-slate-950 bg-amber-300 px-2.5 py-1 rounded border border-amber-100 shadow-[0_0_8px_rgba(245,158,11,0.8)] whitespace-nowrap">
                        BALANCED!
                      </span>
                    )}
                    {pickedOption !== null && isSelected && !isRight && !isEliminated && (
                      <span className="text-[10px] font-mario text-rose-300 bg-black/90 px-2.5 py-1 rounded border border-rose-500 whitespace-nowrap">
                        UNBALANCED
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
};

interface ThemedMasterArcadeEngineProps extends MasterVaultGameCommonProps {
  gameTitle: string;
  kickerBadge: string;
  description: string;
  bannerGradientClass: string;
  accentButtonClass: string;
  icon: React.ReactNode;
  bank: readonly MasterArcadeScenario[];
  deckCount?: number;
  victoryCoins: number;
  reportWorldCode: string;
}

const ThemedMasterArcadeEngine: React.FC<ThemedMasterArcadeEngineProps> = ({
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
  deckCount = 6,
  victoryCoins,
  reportWorldCode,
}) => {
  const [phase, setPhase] = useState<'TITLE' | 'PLAYING' | 'VICTORY' | 'GAME_OVER'>('TITLE');
  const [deck, setDeck] = useState<MasterArcadeScenario[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pickedOption, setPickedOption] = useState<number | null>(null);

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
    const fresh = drawUniqueFromDeck(
      `master_vault_${gameTitle}`,
      bank,
      Math.min(deckCount, bank.length)
    ).map((item) => {
      const shuf = shuffleChoiceOptionsSafely(item.options, item.correctIndex);
      return {
        ...item,
        options: shuf.options,
        correctIndex: shuf.correctIndex,
      };
    });
    setDeck(fresh);
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
    setPhase('PLAYING');
    marioAudio.playPowerUp();
  }, [bank, deckCount, gameTitle]);

  const currentItem = deck[currentIdx];

  // Speedrunner 15s Countdown Clock
  useEffect(() => {
    if (phase !== 'PLAYING' || pickedOption !== null) return;
    if (secondsLeft <= 0) {
      handleChooseOption(-1);
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
      // Ignore if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      if (pickedOption === null) {
        if (key === '1' || key === 'a') {
          e.preventDefault();
          handleChooseOption(0);
        } else if (key === '2' || key === 'b') {
          e.preventDefault();
          handleChooseOption(1);
        } else if (key === '3' || key === 'c') {
          e.preventDefault();
          handleChooseOption(2);
        } else if (key === '4' || key === 'd') {
          e.preventDefault();
          handleChooseOption(3);
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

  const handleChooseOption = (idx: number) => {
    if (pickedOption !== null || !currentItem) return;
    setPickedOption(idx);
    const isCorrect = idx === currentItem.correctIndex;
    const isFast = secondsLeft >= 8;

    if (isCorrect) {
      const nextScore = score + 1;
      const nextStreak = streak + 1;
      setScore(nextScore);
      setStreak(nextStreak);

      let coinReward = nextStreak >= 3 ? 5 : 3;
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

      onEarnCoins(coinReward);
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
        const nextHearts = hearts - 1;
        setHearts(nextHearts);
        marioAudio.playWrongAnswer();
        if (nextHearts <= 0) {
          awardUserXp({ amount: 15, reason: `${gameTitle} Effort` });
          onQuizCompleted?.({
            worldCode: reportWorldCode,
            correctCount: score,
            totalCount: deck.length,
            topicTitle: gameTitle,
          });
        }
      }
    }
  };

  const handleAdvance = () => {
    if (hearts <= 0) {
      setPhase('GAME_OVER');
      marioAudio.playGameOver();
      return;
    }
    if (currentIdx + 1 >= deck.length) {
      onEarnCoins(victoryCoins);
      awardUserXp({ amount: 100, reason: `${gameTitle} Grand Master Clear` });
      marioAudio.playFanfare();
      onQuizCompleted?.({
        worldCode: reportWorldCode,
        correctCount: score,
        totalCount: deck.length,
        topicTitle: gameTitle,
      });
      setPhase('VICTORY');
      return;
    }
    setCurrentIdx((i) => i + 1);
    setPickedOption(null);
    setEliminatedIndices(new Set());
    setShowRadarClue(false);
    setSecondsLeft(15);
    setSpeedBonusAwarded(false);
    setShieldAbsorbedHit(false);
    marioAudio.playJump();
  };

  return (
    <div className="bg-slate-950 rounded-3xl border-4 border-black shadow-[6px_6px_0_#000] overflow-hidden text-white">
      {/* Arcade Header HUD */}
      <div className={`p-4 sm:p-6 border-b-4 border-black ${bannerGradientClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 border-3 border-black flex items-center justify-center shadow-[0_3px_0_#000] shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase text-amber-300 font-mario block break-words">
                {kickerBadge}
              </span>
              <h3 className="text-lg sm:text-2xl font-black font-display text-white break-words">
                {gameTitle}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <div className="flex items-center gap-1 bg-black/50 px-2.5 py-1.5 rounded-xl border border-white/15">
              {[0, 1, 2].map((h) => (
                <Heart
                  key={h}
                  className={`w-4 h-4 ${
                    h < hearts ? 'text-rose-500 fill-rose-500' : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <div className="bg-black/50 px-3 py-1.5 rounded-xl border border-white/15 text-xs font-black tabular-nums text-amber-300">
              {phase === 'PLAYING' ? `Stage ${currentIdx + 1}/${deck.length}` : `${deckCount} Stages`}
            </div>
          </div>
        </div>
      </div>

      {/* Stage Body */}
      <div className="p-4 sm:p-7">
        {phase === 'TITLE' && (
          <div className="text-center py-6 space-y-5 max-w-xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border-2 border-amber-400">
              <MarioCharacterAvatar character={equippedAvatar} className="w-11 h-11" />
            </div>
            <p className="text-sm sm:text-base text-slate-200 font-semibold leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-300">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{deckCount} Non-Repeating Scenarios</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 inline-flex items-center gap-1.5 text-amber-300">
                <MarioCoinIcon className="w-4 h-4" />
                <span>+{victoryCoins} Clear Bounty</span>
              </span>
            </div>
            <button
              type="button"
              onClick={startRun}
              className={`min-h-[48px] max-w-full px-5 sm:px-7 py-2.5 rounded-2xl border-3 border-black shadow-[0_4px_0_#000] font-black text-xs sm:text-base leading-tight text-center inline-flex items-center justify-center gap-2 cursor-pointer ${accentButtonClass}`}
            >
              <Play className="w-5 h-5 fill-current shrink-0" />
              <span>Start {gameTitle}</span>
            </button>
          </div>
        )}

        {phase === 'PLAYING' && currentItem && (
          <div className="space-y-4">
            {/* Mini-Mario Interactive Stage Map Track */}
            <div className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                  <Train className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-[10px] font-black uppercase text-amber-300 font-mario hidden sm:inline">
                  Track:
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

            {/* Arcade Action Bar: 15s Speedrunner Timer, Star Fever Rush, 50/50 Mushroom Zap, Radar Clue */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border-2 border-slate-800 rounded-2xl p-2.5 sm:p-3">
              {/* Speedrunner Clock & Star Fever Meter */}
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

              {/* Powerup Lifelines */}
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

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 max-w-full break-words">
                Case #{currentIdx + 1}: {currentItem.headline}
              </span>
              {streak >= 2 && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-black">
                  {streak}x Streak Active!
                </span>
              )}
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
                    <span>{streak >= 5 ? 'BARRISTER SUPREME 5X COMBO (+10c)' : streak >= 3 ? 'SUPER STAR 3X FEVER (+5c)' : 'FIRE MARIO 2X STREAK'}</span>
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
                <span className="px-1.5 py-0.5 rounded bg-black/60 border border-slate-700 text-amber-300 font-bold">[1-4 / A-D] Fire</span>
                <span className="px-1.5 py-0.5 rounded bg-black/60 border border-slate-700 text-emerald-300 font-bold">[Z] Zap</span>
                <span className="px-1.5 py-0.5 rounded bg-black/60 border border-slate-700 text-cyan-300 font-bold">[R] Radar</span>
              </div>
            </div>

            {/* Bespoke Interactive Game Stage for this game */}
            <InteractiveMasterArcadeStage
              gameTitle={gameTitle}
              stageNum={currentIdx + 1}
              totalStages={deck.length}
              options={currentItem.options}
              pickedOption={pickedOption}
              correctIndex={currentItem.correctIndex}
              onPickOption={handleChooseOption}
              streak={streak}
              eliminatedIndices={eliminatedIndices}
            />

            {/* Dynamic Arcade Action Blast Banner */}
            {pickedOption !== null && (
              <div
                className={`p-3 rounded-2xl border-3 flex flex-wrap items-center justify-between gap-2.5 shadow-[0_4px_0_#000] animate-bounce max-w-full min-w-0 ${
                  pickedOption === currentItem.correctIndex
                    ? 'bg-emerald-500 border-black text-slate-950 font-black'
                    : 'bg-rose-600 border-black text-white font-bold'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-black text-amber-300 flex items-center justify-center font-mario text-sm border border-white/20 shrink-0">
                    !
                  </div>
                  <span className="text-xs sm:text-sm uppercase font-mario tracking-wide break-words">
                    {pickedOption === currentItem.correctIndex
                      ? gameTitle.includes('Yoshi')
                        ? 'TRAIN STEAM CHUG! 125% OVERTIME PUNCHED!'
                        : gameTitle.includes('Luigi')
                        ? 'POLTERGUST HYPER-VACUUM! NIGHT SHIFT GHOST DISPELLED!'
                        : gameTitle.includes('Rosalina')
                        ? 'STELLAR ALIGNMENT! GRAVITATIONAL WAGE BEAM LOCKED!'
                        : gameTitle.includes('Peach')
                        ? 'ROYAL WAX SEAL SLAMMED! STATUTORY LEAVE GRANTED!'
                        : gameTitle.includes('Wario')
                        ? 'HEAVY VAULT CRACKED! DEDUCTION RECOVERED!'
                        : 'GAVEL SLAMMED! 22.5-DAY RETIREMENT RATIFIED!'
                      : 'WRONG ANGLE! HAZARD HIT ABSORBED! REVIEW DOCTRINE BELOW!'}
                  </span>
                </div>
                {speedBonusAwarded && (
                  <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-950 border-2 border-black font-mario text-[10px] shrink-0 font-black shadow-xs">
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
                    ? `Controlling Codal Rule: "${currentItem.options[currentItem.correctIndex]}". Excellent adjudication under Philippine Labor Standards!`
                    : `Statutory Distinction: The controlling doctrine is "${currentItem.options[currentItem.correctIndex]}". Avoid the trap of selecting "${pickedOption >= 0 ? currentItem.options[pickedOption] : 'unanswered'}" in practical problems.`
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
                    ? 'Claim Victory Coins'
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
            <h4 className="text-2xl sm:text-3xl font-black font-display text-white">
              STAGE CLEARED! ({score}/{deck.length})
            </h4>
            <p className="text-xs sm:text-sm font-bold text-emerald-300 inline-flex items-center gap-1.5">
              <MarioCoinIcon className="w-4 h-4" />
              <span>+{victoryCoins} Bonus Gold Coins &amp; +100 XP Added!</span>
            </p>
            <div>
              <button
                type="button"
                onClick={startRun}
                className="min-h-[46px] px-6 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span>Play Fresh Deck</span>
              </button>
            </div>
          </div>
        )}

        {phase === 'GAME_OVER' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 border-3 border-black mx-auto flex items-center justify-center text-white">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-black font-display text-white">
              OUT OF HEARTS ({score}/{deck.length} CLEARED)
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Every retry deals a freshly shuffled statutory scenario order so you keep sharpening new angles!
            </p>
            <button
              type="button"
              onClick={startRun}
              className="min-h-[46px] px-6 py-2 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black text-sm border-3 border-black shadow-[0_3px_0_#000] inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>Retry With Shuffled Deck</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const YoshiOvertimeExpressGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Yoshi's Overtime Ledger Express"
    kickerBadge="WORLD 1-2 • HOURS, BREAKS &amp; OT MULTIPLIERS"
    description="Inspect timecards aboard Yoshi's Express! Rule on ordinary overtime (125%), rest/holiday overtime (169% / 260% / 338%), short breaks, brownouts, and the strict Art. 88 non-offsetting rule."
    bannerGradientClass="bg-gradient-to-r from-emerald-800 via-green-800 to-slate-900"
    accentButtonClass="bg-lime-400 hover:bg-lime-300 text-slate-950"
    icon={<Clock className="w-6 h-6" />}
    bank={YOSHI_OVERTIME_EXPRESS_BANK}
    victoryCoins={25}
    reportWorldCode="w1"
  />
);

export const LuigiNightShiftPoltergustGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Luigi's Night-Shift Poltergust"
    kickerBadge="10:00 PM – 6:00 AM • ART. 86 &amp; R.A. 10151"
    description="Patrol the graveyard shift from 10:00 PM to 6:00 AM! Master the +10% Night Shift Differential, multiplicative OT/Holiday stacking (137.5%, 143%, 220%), &lt;=5 retail exemptions, and Night Worker health rights."
    bannerGradientClass="bg-gradient-to-r from-indigo-900 via-emerald-950 to-slate-950"
    accentButtonClass="bg-emerald-400 hover:bg-emerald-300 text-slate-950"
    icon={<Moon className="w-6 h-6" />}
    bank={LUIGI_NIGHTSHIFT_BANK}
    victoryCoins={25}
    reportWorldCode="w1"
  />
);

export const RosalinaWageObservatoryGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Rosalina's Star Wage Observatory"
    kickerBadge="WORLD 3 • WAGES, DISTORTION &amp; D.O. 174"
    description="Chart cosmic payroll constellations! Distinguish Facilities vs. Supplements (Purpose Test), PHP 5M D.O. 174 capital, Art. 124 Wage Distortion, R.A. 8188 Double Indemnity, and 100% Service Charges."
    bannerGradientClass="bg-gradient-to-r from-sky-900 via-blue-950 to-indigo-950"
    accentButtonClass="bg-sky-400 hover:bg-sky-300 text-slate-950"
    icon={<Sparkles className="w-6 h-6" />}
    bank={ROSALINA_WAGE_MATRIX_BANK}
    victoryCoins={30}
    reportWorldCode="w3"
  />
);

export const PeachRoyalLeaveDispatchGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Peach's Royal Leave Dispatch"
    kickerBadge="WORLD 6 • STATUTORY LEAVES &amp; SPECIAL LAWS"
    description="Stamp Royal HR leave applications with precision! Verify exact day caps and eligibility across 105d/120d/60d Maternity, 7d Paternity, 7d Solo Parent (6-mo tenure), 10d VAWC, 2-mo Gynecological, and SIL."
    bannerGradientClass="bg-gradient-to-r from-pink-800 via-rose-900 to-purple-950"
    accentButtonClass="bg-pink-300 hover:bg-pink-200 text-slate-950"
    icon={<Stamp className="w-6 h-6" />}
    bank={PEACH_ROYAL_LEAVES_BANK}
    victoryCoins={30}
    reportWorldCode="w6"
  />
);

export const WarioDeductionVaultGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Wario's Payroll Deduction Vault"
    kickerBadge="ARTS. 102 &amp; 113–118 • LAWFUL VS ILLEGAL"
    description="Audit Wario's treasury chests! Approve lawful tax/SSS/agency-fee/consented 3rd-party deductions and reject illegal chits, unconsented breakage cuts (>20% weekly cap), and retaliatory wage holds."
    bannerGradientClass="bg-gradient-to-r from-amber-800 via-yellow-900 to-purple-950"
    accentButtonClass="bg-amber-400 hover:bg-amber-300 text-slate-950"
    icon={<Vault className="w-6 h-6" />}
    bank={WARIO_DEDUCTION_AUDIT_BANK}
    victoryCoins={25}
    reportWorldCode="w3"
  />
);

export const ToadsworthRetirementTribunalGame: React.FC<MasterVaultGameCommonProps> = (props) => (
  <ThemedMasterArcadeEngine
    {...props}
    gameTitle="Toadsworth's Retirement &amp; Separation Tribunal"
    kickerBadge="ARTS. 298–302 • R.A. 7641 &amp; SEPARATION PAY"
    description="Preside with Chancellor Toadsworth over R.A. 7641 22.5-day retirement formulas, 50–60 mine worker retirement ages, &lt;=10 retail exemptions, and Art. 298/299 separation pay tiers."
    bannerGradientClass="bg-gradient-to-r from-amber-900 via-stone-900 to-slate-950"
    accentButtonClass="bg-amber-300 hover:bg-amber-200 text-slate-950"
    icon={<Scale className="w-6 h-6" />}
    bank={TOADSWORTH_RETIREMENT_BANK}
    victoryCoins={30}
    reportWorldCode="w5"
  />
);
