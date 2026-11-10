import React, { useState } from 'react';
import {
  SurveyAnalytics,
  SurveyResponse,
  LIKERT_CRITERIA,
} from '../types/survey';
import {
  downloadCSV,
  seedSampleResponses,
  clearAllResponses,
  resetToFiveRespondents,
} from '../services/storageService';
import {
  Download,
  Maximize2,
  Minimize2,
  QrCode,
  Sparkles,
  Trash2,
  MessageSquare,
  TrendingUp,
  Users,
  Sun,
  Moon,
  Info,
} from 'lucide-react';
import { PieChartCard } from './PieChartCard';

interface DashboardViewProps {
  analytics: SurveyAnalytics;
  responses: SurveyResponse[];
  onOpenQR: () => void;
  onOpenFirebaseGuide: () => void;
  onOpenConfig: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  responses,
  onOpenQR,
  onOpenFirebaseGuide,
  onOpenConfig,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [projectorHighContrast, setProjectorHighContrast] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleClear = () => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างข้อมูลคำตอบทั้งหมด? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      clearAllResponses();
    }
  };

  const handleSeed = () => {
    seedSampleResponses(5);
  };

  return (
    <div
      className={`min-h-[calc(100vh-64px)] p-4 sm:p-6 transition-colors ${
        projectorHighContrast
          ? 'bg-black text-white'
          : 'bg-slate-900 text-slate-100'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Projector Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                แดชบอร์ดผลการประเมินความพึงพอใจ
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                LIVE REALTIME
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              ประมวลผลข้อมูลอัตโนมัติทันทีที่มีผู้ตอบแบบสอบถาม · สเกลลิเคิร์ต 5 ระดับ (Likert Scale)
            </p>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onOpenQR}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              <QrCode className="w-3.5 h-3.5 text-indigo-400" />
              <span>QR Code ผู้เข้าอบรม</span>
            </button>

            <button
              onClick={() => downloadCSV(responses)}
              disabled={responses.length === 0}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด CSV ({responses.length})</span>
            </button>

            <button
              onClick={() => resetToFiveRespondents()}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
              title="ตั้งค่าให้มีผู้ตอบ 5 คนพอดี เพื่อดูกราฟวงกลมสีพาสเทล Soft pastel"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>ข้อมูลตัวอย่าง 5 คน</span>
            </button>

            <button
              onClick={() => setProjectorHighContrast(!projectorHighContrast)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title={projectorHighContrast ? 'เปลี่ยนเป็นธีมปกติ' : 'โหมดคอนทราสต์สูงสำหรับห้องสว่าง'}
            >
              {projectorHighContrast ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="สลับโหมดเต็มจอสำหรับโปรเจกเตอร์"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handleClear}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-slate-700 transition"
              title="ล้างข้อมูลทั้งหมด"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Attendees Responded */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">ผู้ตอบแบบประเมิน</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white font-mono tabular-nums">
                {analytics.totalResponses}
              </span>
              <span className="text-sm text-slate-400">คน</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span>อัปเดตแบบเรียลไทม์</span>
            </div>
          </div>

          {/* Card 2: Overall Satisfaction Score */}
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">คะแนนเฉลี่ยรวม</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-3 flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-indigo-400 font-mono tabular-nums">
                {analytics.totalResponses > 0 ? analytics.overallMean.toFixed(2) : '0.00'}
              </span>
              <span className="text-sm text-slate-400 font-mono">/ 5.00</span>
            </div>
            <div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${analytics.overallInterpretation.badgeBg}`}
              >
                ระดับ {analytics.overallInterpretation.label}
              </span>
            </div>
          </div>

          {/* Card 3: Likert Scale Reference Benchmark */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">เกณฑ์แปลผล 5 ระดับ</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="space-y-1 text-[11px]">
              {LIKERT_CRITERIA.slice(0, 3).map((crit) => (
                <div key={crit.label} className="flex items-center justify-between">
                  <span className="text-slate-300">{crit.min.toFixed(2)} - {crit.max.toFixed(2)}</span>
                  <span className={`font-medium ${crit.color}`}>{crit.label}</span>
                </div>
              ))}
              <div className="text-[10px] text-slate-500 pt-1">
                2.50 ลงไป: ปานกลาง / น้อย / น้อยที่สุด
              </div>
            </div>
          </div>

          {/* Card 4: Quick Scan & Response Gateway */}
          <div
            onClick={onOpenQR}
            className="bg-gradient-to-br from-indigo-950/80 to-slate-800/90 rounded-2xl p-4 border border-indigo-500/40 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-400 transition group"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">
                <QrCode className="w-3.5 h-3.5" />
                <span>QR Code สแกนตอบ</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                คลิกเพื่อขยาย QR Code ขึ้นจอใหญ่ให้ผู้เข้าอบรมสแกน
              </p>
              <span className="inline-block mt-2 text-[11px] font-semibold text-indigo-400 group-hover:underline">
                เปิดหน้าต่าง QR Code →
              </span>
            </div>
          </div>
        </div>

        {/* Middle Main Section: 2 Columns Split (8 cols chart + 4 cols comments) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Real-time Pastel Pie Chart */}
          <div className="lg:col-span-8 space-y-6">
            <PieChartCard responses={responses} />
          </div>

          {/* Right Column (4 cols): Live Feedback / Comments Feed */}
          <div className="lg:col-span-4 bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 shadow-sm flex flex-col h-[680px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm sm:text-base font-bold text-white">
                  ข้อเสนอแนะล่าสุด (Live Feedback)
                </h2>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                {analytics.recentComments.length} ข้อความ
              </span>
            </div>

            {/* Scrollable Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {analytics.recentComments.length === 0 ? (
                <div className="text-center py-24 text-slate-500 text-xs">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  ยังไม่มีข้อเสนอแนะเพิ่มเติม
                </div>
              ) : (
                analytics.recentComments.map((comment, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700/70 text-xs text-slate-200 leading-relaxed space-y-2 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-medium text-indigo-300">
                        ผู้เข้าอบรม #{analytics.recentComments.length - idx}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 font-semibold">
                          เฉลี่ย {comment.overallRating.toFixed(1)} ★
                        </span>
                        <span>
                          {new Date(comment.timestamp).toLocaleTimeString('th-TH', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-100 text-xs sm:text-sm font-normal">
                      &ldquo;{comment.text}&rdquo;
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Footer Notice */}
            <div className="pt-3 border-t border-slate-700/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>จัดเก็บแบบ Anonymous</span>
              <button
                onClick={onOpenFirebaseGuide}
                className="text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                ดูโค้ด &amp; คู่มือ Firebase →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
