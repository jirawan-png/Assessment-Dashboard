/**
 * Survey Types and Likert Scale Definitions
 */

export interface SurveyResponse {
  id: string;
  timestamp: number;
  q1: number; // ความชัดเจนและประโยชน์ของเนื้อหา
  q2: number; // ความรู้และความสามารถในการถ่ายทอดของวิทยากร
  q3: number; // เอกสาร สไลด์ และสื่อการสอน
  q4: number; // การบริหารเวลา สถานที่ และอุปกรณ์/ระบบ
  q5: number; // ความพึงพอใจในภาพรวมของหลักสูตร
  comment: string; // ข้อเสนอแนะเพิ่มเติม (ไม่บังคับ)
  deviceId: string;
}

export interface QuestionDefinition {
  id: keyof Pick<SurveyResponse, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>;
  index: number;
  title: string;
  subtitle: string;
  iconName: string;
}

export const WORKSHOP_QUESTIONS: QuestionDefinition[] = [
  {
    id: 'q1',
    index: 1,
    title: 'ความชัดเจนและประโยชน์ของเนื้อหา',
    subtitle: 'เนื้อหาตรงตามวัตถุประสงค์ เข้าใจง่าย และสามารถนำไปประยุกต์ใช้ได้จริง',
    iconName: 'BookOpen',
  },
  {
    id: 'q2',
    index: 2,
    title: 'ความรู้และความสามารถของวิทยากร',
    subtitle: 'วิทยากรอธิบายชัดเจน ตอบคำถามได้ตรงประเด็น และมีเทคนิคการถ่ายทอดที่ดี',
    iconName: 'UserCheck',
  },
  {
    id: 'q3',
    index: 3,
    title: 'เอกสาร สไลด์ และสื่อประกอบการอบรม',
    subtitle: 'สไลด์อ่านง่าย ชัดเจน ตัวอย่างประกอบช่วยให้เข้าใจเนื้อหาได้ดียิ่งขึ้น',
    iconName: 'FileText',
  },
  {
    id: 'q4',
    index: 4,
    title: 'การบริหารเวลาและสิ่งอำนวยความสะดวก',
    subtitle: 'ความเหมาะสมของระยะเวลา สถานที่ อุปกรณ์ และการอำนวยความสะดวก',
    iconName: 'Clock',
  },
  {
    id: 'q5',
    index: 5,
    title: 'ความพึงพอใจในภาพรวมของการอบรม',
    subtitle: 'ความคุ้มค่าและภาพรวมความประทับใจตลอดการเข้าร่วมอบรมในครั้งนี้',
    iconName: 'Award',
  },
];

export interface LikertRating {
  min: number;
  max: number;
  label: string;
  enLabel: string;
  color: string; // Tailwind text color class
  bgLight: string;
  badgeBg: string;
  badgeText: string;
  level: number;
}

/**
 * เกณฑ์การแปลผลคะแนนเฉลี่ย Likert 5 ระดับ (Best practice สำหรับการประเมินการฝึกอบรม)
 * 4.51 - 5.00: ระดับความพึงพอใจมากที่สุด
 * 3.51 - 4.50: ระดับความพึงพอใจมาก
 * 2.51 - 3.50: ระดับความพึงพอใจปานกลาง
 * 1.51 - 2.50: ระดับความพึงพอใจน้อย
 * 1.00 - 1.50: ระดับความพึงพอใจน้อยที่สุด
 */
export const LIKERT_CRITERIA: LikertRating[] = [
  {
    min: 4.51,
    max: 5.00,
    label: 'มากที่สุด',
    enLabel: 'Highest',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    level: 5,
  },
  {
    min: 3.51,
    max: 4.50,
    label: 'มาก',
    enLabel: 'High',
    color: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-500',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800',
    badgeText: 'text-blue-700 dark:text-blue-300',
    level: 4,
  },
  {
    min: 2.51,
    max: 3.50,
    label: 'ปานกลาง',
    enLabel: 'Moderate',
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-500',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800',
    badgeText: 'text-amber-700 dark:text-amber-300',
    level: 3,
  },
  {
    min: 1.51,
    max: 2.50,
    label: 'น้อย',
    enLabel: 'Low',
    color: 'text-orange-600 dark:text-orange-400',
    bgLight: 'bg-orange-500',
    badgeBg: 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-800',
    badgeText: 'text-orange-700 dark:text-orange-300',
    level: 2,
  },
  {
    min: 1.00,
    max: 1.50,
    label: 'น้อยที่สุด',
    enLabel: 'Lowest',
    color: 'text-rose-600 dark:text-rose-400',
    bgLight: 'bg-rose-500',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800',
    badgeText: 'text-rose-700 dark:text-rose-300',
    level: 1,
  },
];

export function getLikertInterpretation(score: number): LikertRating {
  if (score <= 0) {
    return {
      min: 0,
      max: 0,
      label: 'ยังไม่มีข้อมูล',
      enLabel: 'No Data',
      color: 'text-slate-500 dark:text-slate-400',
      bgLight: 'bg-slate-400',
      badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      badgeText: 'text-slate-600 dark:text-slate-400',
      level: 0,
    };
  }

  for (const rating of LIKERT_CRITERIA) {
    if (score >= rating.min - 0.009 && score <= rating.max + 0.009) {
      return rating;
    }
  }

  if (score > 5.0) return LIKERT_CRITERIA[0];
  return LIKERT_CRITERIA[LIKERT_CRITERIA.length - 1];
}

export interface QuestionSummary {
  id: keyof Pick<SurveyResponse, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>;
  index: number;
  title: string;
  mean: number;
  interpretation: LikertRating;
  distribution: { [key: number]: number }; // count of 1s, 2s, 3s, 4s, 5s
  percentages: { [key: number]: number };
}

export interface SurveyAnalytics {
  totalResponses: number;
  overallMean: number;
  overallInterpretation: LikertRating;
  questionsSummary: QuestionSummary[];
  recentComments: { text: string; timestamp: number; overallRating: number }[];
}
