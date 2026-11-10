/**
 * Storage Service for Survey Responses
 * Supports:
 * 1. Zero-config instant local real-time synchronization (BroadcastChannel + storage event)
 * 2. Device Fingerprint & LocalStorage duplicate prevention
 * 3. Optional direct Firebase Realtime Database REST/EventSource sync
 * 4. UTF-8 CSV Export for Thai language
 * 5. Mock demo data generator for training organizers
 */

import {
  SurveyResponse,
  SurveyAnalytics,
  WORKSHOP_QUESTIONS,
  getLikertInterpretation,
  QuestionSummary,
} from '../types/survey';

const STORAGE_KEY = 'live_workshop_survey_responses_v1';
const DEVICE_KEY = 'live_workshop_survey_device_id';
const SUBMITTED_KEY = 'live_workshop_survey_submitted_flag';
const FIREBASE_CONFIG_KEY = 'live_workshop_firebase_config';
const BROADCAST_CHANNEL_NAME = 'live_workshop_survey_sync_channel';

export interface FirebaseConfig {
  databaseURL: string; // e.g. https://my-project-default-rtdb.firebaseio.com
  apiKey?: string;
  enabled: boolean;
}

// Generate or retrieve persistent unique device ID
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_KEY);
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, deviceId);
  }
  return deviceId;
}

// Check if current device has already submitted
export function hasDeviceSubmitted(): boolean {
  return localStorage.getItem(SUBMITTED_KEY) === 'true';
}

// Mark device as submitted
export function markDeviceSubmitted(): void {
  localStorage.setItem(SUBMITTED_KEY, 'true');
}

// Clear submission status for testing
export function clearDeviceSubmitted(): void {
  localStorage.removeItem(SUBMITTED_KEY);
}

// Load saved Firebase config
export function getFirebaseConfig(): FirebaseConfig {
  const saved = localStorage.getItem(FIREBASE_CONFIG_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return {
    databaseURL: '',
    apiKey: '',
    enabled: false,
  };
}

// Save Firebase config
export function saveFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
}

export const DEFAULT_FIVE_RESPONSES: SurveyResponse[] = [
  {
    id: 'resp_user_01',
    timestamp: Date.now() - 1000 * 60 * 42,
    q1: 5,
    q2: 5,
    q3: 5,
    q4: 4,
    q5: 5,
    comment: 'วิทยากรอธิบายเนื้อหาได้เข้าใจง่าย มีตัวอย่างประกอบชัดเจนมาก สามารถนำไปปรับใช้ในงานได้จริงทันทีครับ',
    deviceId: 'device_participant_1',
  },
  {
    id: 'resp_user_02',
    timestamp: Date.now() - 1000 * 60 * 30,
    q1: 4,
    q2: 5,
    q3: 4,
    q4: 4,
    q5: 4,
    comment: 'สไลด์สวยงามและทันสมัย สื่อการสอนดีมาก การบริหารเวลาและการจัดลำดับหัวข้อเหมาะสมดีค่ะ',
    deviceId: 'device_participant_2',
  },
  {
    id: 'resp_user_03',
    timestamp: Date.now() - 1000 * 60 * 21,
    q1: 5,
    q2: 4,
    q3: 4,
    q4: 3,
    q5: 4,
    comment: 'เนื้อหาเข้มข้นและตรงประเด็น อยากให้เพิ่มเวลาสำหรับการถาม-ตอบ (Q&A) เพิ่มอีกสัก 15 นาทีครับ',
    deviceId: 'device_participant_3',
  },
  {
    id: 'resp_user_04',
    timestamp: Date.now() - 1000 * 60 * 12,
    q1: 4,
    q2: 4,
    q3: 3,
    q4: 2,
    q5: 3,
    comment: 'ห้องอบรมช่วงบ่ายแอร์ค่อนข้างเย็นเกินไปนิดหนึ่ง และสัญญาณ Wi-Fi หลุดช่วงท้าย แต่ภาพรวมวิทยากรสอนดีมาก',
    deviceId: 'device_participant_4',
  },
  {
    id: 'resp_user_05',
    timestamp: Date.now() - 1000 * 60 * 4,
    q1: 3,
    q2: 3,
    q3: 2,
    q4: 1,
    q5: 3,
    comment: 'อยากให้มีเอกสารสรุปพิมพ์แจกเพิ่มเติม สำหรับผู้ที่ตามโปรแกรมไม่ทันช่วงต้นครับ',
    deviceId: 'device_participant_5',
  },
];

// Load local responses
export function getLocalResponses(): SurveyResponse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FIVE_RESPONSES));
      return DEFAULT_FIVE_RESPONSES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FIVE_RESPONSES));
      return DEFAULT_FIVE_RESPONSES;
    }
    return parsed;
  } catch {
    return DEFAULT_FIVE_RESPONSES;
  }
}

// Reset to exactly the 5 sample respondents
export function resetToFiveRespondents(): void {
  saveLocalResponses(DEFAULT_FIVE_RESPONSES);
}

// Save responses locally and broadcast to other tabs/windows
export function saveLocalResponses(responses: SurveyResponse[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
  notifySubscribers(responses);
}

// Cross-tab real-time sync with BroadcastChannel
type Listener = (responses: SurveyResponse[]) => void;
const listeners = new Set<Listener>();

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof BroadcastChannel !== 'undefined') {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'SYNC_RESPONSES' && Array.isArray(event.data.responses)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(event.data.responses));
        listeners.forEach((fn) => fn(event.data.responses));
      }
    };
  }
} catch {
  // BroadcastChannel not available, fallback to window storage event
}

// Window storage listener fallback
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        listeners.forEach((fn) => fn(parsed));
      } catch {
        // ignore
      }
    }
  });
}

function notifySubscribers(responses: SurveyResponse[]): void {
  listeners.forEach((fn) => fn(responses));
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'SYNC_RESPONSES',
      responses,
    });
  }
}

// Subscribe to response changes
export function subscribeToResponses(callback: Listener): () => void {
  listeners.add(callback);
  // initial callback
  callback(getLocalResponses());

  return () => {
    listeners.delete(callback);
  };
}

// Add a new survey response
export async function submitSurveyResponse(
  q1: number,
  q2: number,
  q3: number,
  q4: number,
  q5: number,
  comment: string
): Promise<{ success: boolean; error?: string }> {
  const deviceId = getOrCreateDeviceId();

  const newResponse: SurveyResponse = {
    id: 'resp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
    q1,
    q2,
    q3,
    q4,
    q5,
    comment: comment.trim(),
    deviceId,
  };

  // Save to local storage & broadcast
  const current = getLocalResponses();
  const updated = [newResponse, ...current];
  saveLocalResponses(updated);
  markDeviceSubmitted();

  // If Firebase Realtime Database is configured, push to Firebase REST endpoint
  const fbConfig = getFirebaseConfig();
  if (fbConfig.enabled && fbConfig.databaseURL) {
    try {
      const cleanUrl = fbConfig.databaseURL.replace(/\/+$/, '');
      const targetUrl = `${cleanUrl}/responses.json${fbConfig.apiKey ? `?auth=${fbConfig.apiKey}` : ''}`;
      
      await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newResponse),
      });
    } catch (err) {
      console.warn('Firebase RTDB push error (local copy is preserved):', err);
    }
  }

  return { success: true };
}

// Sync from Firebase Realtime Database if configured
export async function syncFromFirebase(): Promise<number> {
  const fbConfig = getFirebaseConfig();
  if (!fbConfig.enabled || !fbConfig.databaseURL) return 0;

  try {
    const cleanUrl = fbConfig.databaseURL.replace(/\/+$/, '');
    const targetUrl = `${cleanUrl}/responses.json${fbConfig.apiKey ? `?auth=${fbConfig.apiKey}` : ''}`;

    const res = await fetch(targetUrl);
    if (!res.ok) return 0;
    const data = await res.json();
    if (!data) return 0;

    // Firebase stores object with push keys: { "-Oabc...": { ... } }
    const fbResponses: SurveyResponse[] = Object.keys(data).map((key) => ({
      ...data[key],
      id: data[key].id || key,
    }));

    // Merge with local avoiding duplicates by ID or timestamp+deviceId
    const local = getLocalResponses();
    const map = new Map<string, SurveyResponse>();
    local.forEach((r) => map.set(r.id, r));
    fbResponses.forEach((r) => map.set(r.id, r));

    const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
    saveLocalResponses(merged);
    return merged.length;
  } catch (err) {
    console.warn('Firebase fetch error:', err);
    return 0;
  }
}

// Compute real-time analytics
export function computeAnalytics(responses: SurveyResponse[]): SurveyAnalytics {
  const totalResponses = responses.length;

  if (totalResponses === 0) {
    const emptySummaries: QuestionSummary[] = WORKSHOP_QUESTIONS.map((q) => ({
      id: q.id,
      index: q.index,
      title: q.title,
      mean: 0,
      interpretation: getLikertInterpretation(0),
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }));

    return {
      totalResponses: 0,
      overallMean: 0,
      overallInterpretation: getLikertInterpretation(0),
      questionsSummary: emptySummaries,
      recentComments: [],
    };
  }

  // Calculate sum for each question
  const questionSums: Record<string, number> = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
  const questionDists: Record<string, Record<number, number>> = {
    q1: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    q2: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    q3: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    q4: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    q5: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  responses.forEach((resp) => {
    (['q1', 'q2', 'q3', 'q4', 'q5'] as const).forEach((key) => {
      const score = Math.min(5, Math.max(1, Number(resp[key]) || 3));
      questionSums[key] += score;
      if (questionDists[key][score] !== undefined) {
        questionDists[key][score]++;
      } else {
        questionDists[key][score] = 1;
      }
    });
  });

  const questionsSummary: QuestionSummary[] = WORKSHOP_QUESTIONS.map((q) => {
    const sum = questionSums[q.id];
    const mean = Number((sum / totalResponses).toFixed(2));
    const dist = questionDists[q.id];
    const percentages: Record<number, number> = {
      1: Math.round((dist[1] / totalResponses) * 100),
      2: Math.round((dist[2] / totalResponses) * 100),
      3: Math.round((dist[3] / totalResponses) * 100),
      4: Math.round((dist[4] / totalResponses) * 100),
      5: Math.round((dist[5] / totalResponses) * 100),
    };

    return {
      id: q.id,
      index: q.index,
      title: q.title,
      mean,
      interpretation: getLikertInterpretation(mean),
      distribution: dist,
      percentages,
    };
  });

  const allSums =
    questionSums.q1 + questionSums.q2 + questionSums.q3 + questionSums.q4 + questionSums.q5;
  const overallMean = Number((allSums / (totalResponses * 5)).toFixed(2));

  // Extract recent non-empty comments
  const recentComments = responses
    .filter((r) => r.comment && r.comment.trim().length > 0)
    .slice(0, 20)
    .map((r) => {
      const avg = (r.q1 + r.q2 + r.q3 + r.q4 + r.q5) / 5;
      return {
        text: r.comment,
        timestamp: r.timestamp,
        overallRating: Number(avg.toFixed(1)),
      };
    });

  return {
    totalResponses,
    overallMean,
    overallInterpretation: getLikertInterpretation(overallMean),
    questionsSummary,
    recentComments,
  };
}

// Generate CSV string with UTF-8 BOM for Thai language compatibility
export function generateResponsesCSV(responses: SurveyResponse[]): string {
  const headers = [
    'ลำดับ',
    'วัน-เวลาที่ตอบ',
    'ข้อ 1 (เนื้อหา)',
    'ข้อ 2 (วิทยากร)',
    'ข้อ 3 (สื่อ/เอกสาร)',
    'ข้อ 4 (สถานที่/เวลา)',
    'ข้อ 5 (ภาพรวม)',
    'คะแนนเฉลี่ย',
    'การแปลผล',
    'ข้อเสนอแนะเพิ่มเติม',
    'รหัสเครื่อง (Device ID)',
  ];

  const escapeCSV = (str: string | number) => {
    const s = String(str ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = responses.map((r, i) => {
    const avg = ((r.q1 + r.q2 + r.q3 + r.q4 + r.q5) / 5).toFixed(2);
    const interp = getLikertInterpretation(Number(avg)).label;
    const dateStr = new Date(r.timestamp).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return [
      i + 1,
      escapeCSV(dateStr),
      r.q1,
      r.q2,
      r.q3,
      r.q4,
      r.q5,
      avg,
      escapeCSV(interp),
      escapeCSV(r.comment || '-'),
      escapeCSV(r.deviceId || '-'),
    ].join(',');
  });

  // \uFEFF is UTF-8 Byte Order Mark (BOM) needed so Microsoft Excel displays Thai text correctly
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

// Download CSV file directly
export function downloadCSV(responses: SurveyResponse[], filename = 'ผลการประเมินความพึงพอใจ.csv'): void {
  const csvContent = generateResponsesCSV(responses);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Clear all data
export function clearAllResponses(): void {
  localStorage.removeItem(STORAGE_KEY);
  notifySubscribers([]);
}

// Seed realistic demo responses for testing
export function seedSampleResponses(count = 12): void {
  const sampleComments = [
    'วิทยากรถ่ายทอดได้เข้าใจง่ายมาก มีการยกตัวอย่างเคสจริงที่นำไปใช้ได้ทันทีครับ',
    'เนื้อหาครอบคลุมและแน่นมาก แต่ช่วงบ่ายเวลาน้อยไปนิดหนึ่ง อยากให้มีภาคปฏิบัติเพิ่มครับ',
    'สไลด์สวยงาม อ่านง่าย และตัวอย่างโค้ดพร้อมใช้งาน ขอบคุณทีมงานมากค่ะ',
    'จัดสถานที่และระบบออนไลน์ได้เสถียรมาก เสียงชัดเจน สัญญาณไม่สะดุดเลย',
    'ชอบช่วง Q&A มาก วิทยากรตอบคำถามได้ลึกและตรงประเด็นมากครับ ประทับใจมาก',
    'อยากให้มีหลักสูตรขั้นสูง (Advanced Level) ต่อในเดือนถัดไปครับ สนใจลงทะเบียนแน่นอน',
    'ยอดเยี่ยมมากครับ เป็น 1 วันที่คุ้มค่ามาก',
    'อาหารว่างอร่อย และทีมงานคอยช่วยเหลือตลอดเวลา ขอบคุณค่ะ',
  ];

  const now = Date.now();
  const demoList: SurveyResponse[] = [];

  for (let i = 0; i < count; i++) {
    // Bias towards positive realistic training scores (4-5)
    const pickScore = () => {
      const rand = Math.random();
      if (rand < 0.6) return 5;
      if (rand < 0.88) return 4;
      if (rand < 0.96) return 3;
      return 2;
    };

    const hasComment = Math.random() > 0.35;
    const comment = hasComment ? sampleComments[Math.floor(Math.random() * sampleComments.length)] : '';

    demoList.push({
      id: 'demo_' + (now - i * 180000).toString(36) + '_' + i,
      timestamp: now - i * (Math.floor(Math.random() * 240000) + 60000), // staggered past 1 hour
      q1: pickScore(),
      q2: pickScore(),
      q3: pickScore(),
      q4: pickScore(),
      q5: pickScore(),
      comment,
      deviceId: 'demo_device_' + i,
    });
  }

  const current = getLocalResponses();
  const updated = [...demoList, ...current];
  saveLocalResponses(updated);
}
