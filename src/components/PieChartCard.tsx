import React, { useState } from 'react';
import {
  SurveyResponse,
  WORKSHOP_QUESTIONS,
  getLikertInterpretation,
} from '../types/survey';
import { PieChart as PieIcon, HelpCircle } from 'lucide-react';

interface PieChartCardProps {
  responses: SurveyResponse[];
}

interface SliceData {
  score: number;
  label: string;
  count: number;
  percentage: number;
  color: string;
  textColor: string;
  bgLight: string;
}

export interface SliceMeta {
  label: string;
  colorName: string;
  color: string;
  textColor: string;
  bgLight: string;
}

export const STAR_META: Record<number, SliceMeta> = {
  5: {
    label: '5 ดาว (มากที่สุด)',
    colorName: 'Soft Blue',
    color: '#85B8F9', // Soft Blue
    textColor: 'text-sky-300',
    bgLight: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
  },
  4: {
    label: '4 ดาว (มาก)',
    colorName: 'Soft Pink',
    color: '#F4A8C8', // Soft Pink
    textColor: 'text-pink-300',
    bgLight: 'bg-pink-500/20 text-pink-200 border-pink-400/30',
  },
  3: {
    label: '3 ดาว (ปานกลาง)',
    colorName: 'Butter Yellow',
    color: '#FDE482', // Butter Yellow
    textColor: 'text-amber-200',
    bgLight: 'bg-amber-400/20 text-amber-200 border-amber-300/30',
  },
  2: {
    label: '2 ดาว (น้อย)',
    colorName: 'Sage Green',
    color: '#98C9A3', // Sage
    textColor: 'text-emerald-300',
    bgLight: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
  },
  1: {
    label: '1 ดาว (น้อยที่สุด)',
    colorName: 'Choco Brown',
    color: '#8E6553', // Choco Brown
    textColor: 'text-stone-300',
    bgLight: 'bg-stone-500/20 text-stone-200 border-stone-400/30',
  },
};

export const PieChartCard: React.FC<PieChartCardProps> = ({ responses }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<string>('all');
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);

  const totalRespondents = responses.length;

  // Calculate slice data based on selected filter
  const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalDataPoints = 0;
  let scoreSum = 0;

  if (totalRespondents > 0) {
    responses.forEach((r) => {
      if (selectedQuestion === 'all') {
        // Count all 5 answers
        const arr = [r.q1, r.q2, r.q3, r.q4, r.q5];
        arr.forEach((val) => {
          const s = Math.min(5, Math.max(1, Number(val) || 3));
          counts[s] = (counts[s] || 0) + 1;
          scoreSum += s;
          totalDataPoints++;
        });
      } else {
        // Specific question
        const qKey = selectedQuestion as keyof Pick<SurveyResponse, 'q1' | 'q2' | 'q3' | 'q4' | 'q5'>;
        const s = Math.min(5, Math.max(1, Number(r[qKey]) || 3));
        counts[s] = (counts[s] || 0) + 1;
        scoreSum += s;
        totalDataPoints++;
      }
    });
  }

  const averageScore = totalDataPoints > 0 ? Number((scoreSum / totalDataPoints).toFixed(2)) : 0;
  const avgInterpretation = getLikertInterpretation(averageScore);

  const slices: SliceData[] = [5, 4, 3, 2, 1].map((score) => {
    const count = counts[score] || 0;
    const percentage = totalDataPoints > 0 ? Math.round((count / totalDataPoints) * 100) : 0;
    return {
      score,
      label: STAR_META[score].label,
      count,
      percentage,
      color: STAR_META[score].color,
      textColor: STAR_META[score].textColor,
      bgLight: STAR_META[score].bgLight,
    };
  });

  // SVG Geometry Constants
  const size = 300;
  const center = size / 2;
  const outerRadius = 120;
  const innerRadius = 72; // Donut hole

  // Generate SVG arcs
  let accumulatedAngle = -90; // Start at 12 o'clock

  const arcElements = slices.map((slice) => {
    const sliceAngle = totalDataPoints > 0 ? (slice.count / totalDataPoints) * 360 : 0;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + sliceAngle;
    accumulatedAngle += sliceAngle;

    if (slice.count === 0 || totalDataPoints === 0) return null;

    // Full 360 circle special case
    if (sliceAngle >= 359.99) {
      return (
        <path
          key={slice.score}
          d={`M ${center} ${center - outerRadius}
              A ${outerRadius} ${outerRadius} 0 1 1 ${center - 0.01} ${center - outerRadius}
              L ${center - 0.01} ${center - innerRadius}
              A ${innerRadius} ${innerRadius} 0 1 0 ${center} ${center - innerRadius}
              Z`}
          fill={slice.color}
          className="transition-all duration-300 cursor-pointer hover:opacity-90"
          onMouseEnter={() => setHoveredSlice(slice.score)}
          onMouseLeave={() => setHoveredSlice(null)}
        />
      );
    }

    // Convert polar to cartesian coordinates
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const isHovered = hoveredSlice === slice.score;
    const currentOuterRadius = isHovered ? outerRadius + 6 : outerRadius;

    const x1 = center + currentOuterRadius * Math.cos(toRad(startAngle));
    const y1 = center + currentOuterRadius * Math.sin(toRad(startAngle));
    const x2 = center + currentOuterRadius * Math.cos(toRad(endAngle));
    const y2 = center + currentOuterRadius * Math.sin(toRad(endAngle));

    const x3 = center + innerRadius * Math.cos(toRad(endAngle));
    const y3 = center + innerRadius * Math.sin(toRad(endAngle));
    const x4 = center + innerRadius * Math.cos(toRad(startAngle));
    const y4 = center + innerRadius * Math.sin(toRad(startAngle));

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${currentOuterRadius} ${currentOuterRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return (
      <path
        key={slice.score}
        d={pathData}
        fill={slice.color}
        stroke="#0f172a"
        strokeWidth="2.5"
        className="transition-all duration-200 cursor-pointer filter drop-shadow-sm hover:brightness-110"
        onMouseEnter={() => setHoveredSlice(slice.score)}
        onMouseLeave={() => setHoveredSlice(null)}
      />
    );
  });

  return (
    <div className="bg-slate-800/80 rounded-2xl p-5 sm:p-6 border border-slate-700/80 shadow-sm space-y-6">
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              สัดส่วนความพึงพอใจ (Pie / Donut Chart)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            แสดงสัดส่วนเปอร์เซ็นต์ของผู้ให้คะแนน 1–5 ดาว พร้อมค่าเฉลี่ย
          </p>
        </div>

        {/* Filter Question Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <button
            onClick={() => setSelectedQuestion('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedQuestion === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700/60'
            }`}
          >
            ภาพรวมทั้งหมด
          </button>
          {WORKSHOP_QUESTIONS.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedQuestion(q.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedQuestion === q.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              ข้อ {q.index}
            </button>
          ))}
        </div>
      </div>

      {totalRespondents === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <PieIcon className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">ยังไม่มีข้อมูลสำหรับสร้างกราฟวงกลม</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            กดปุ่ม &quot;+ จำลองข้อมูล 5 คน&quot; เพื่อทดสอบการเรนเดอร์กราฟวงกลม
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left: SVG Pie / Donut Chart (7 cols) */}
          <div className="md:col-span-7 flex flex-col items-center justify-center relative">
            <div className="relative w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] flex items-center justify-center">
              <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="overflow-visible"
              >
                {arcElements}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {selectedQuestion === 'all'
                    ? 'เฉลี่ยภาพรวม'
                    : `เฉลี่ยข้อ ${WORKSHOP_QUESTIONS.find((q) => q.id === selectedQuestion)?.index}`}
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono tabular-nums leading-none my-1">
                  {averageScore.toFixed(2)}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${avgInterpretation.badgeBg}`}
                >
                  ระดับ{avgInterpretation.label}
                </span>
              </div>
            </div>

            {hoveredSlice !== null && (
              <div className="mt-2 text-xs font-medium text-slate-300 animate-fade-in">
                ชี้อยู่ที่:{' '}
                <span className="font-bold text-white">
                  {STAR_META[hoveredSlice].label} ({counts[hoveredSlice]} คำตอบ ·{' '}
                  {totalDataPoints > 0 ? Math.round((counts[hoveredSlice] / totalDataPoints) * 100) : 0}%)
                </span>
              </div>
            )}
          </div>

          {/* Right: Legend & Percentage Breakdown (5 cols) */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>สัดส่วนคะแนน</span>
              <span className="font-mono">
                รวม {totalDataPoints} คำตอบ
              </span>
            </div>

            {slices.map((slice) => {
              const isHovered = hoveredSlice === slice.score;
              return (
                <div
                  key={slice.score}
                  onMouseEnter={() => setHoveredSlice(slice.score)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isHovered
                      ? 'bg-slate-900 border-indigo-500 scale-[1.02] shadow-md'
                      : 'bg-slate-900/50 border-slate-700/60 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm border border-white/20"
                      style={{ backgroundColor: slice.color }}
                    ></span>
                    <span className="text-xs font-medium text-slate-200">
                      {slice.label}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 hidden sm:inline-block">
                      {STAR_META[slice.score].colorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-white tabular-nums">
                      {slice.percentage}%
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      ({slice.count} คน)
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Active Question Info Note */}
            <div className="pt-2 text-[11px] text-slate-400 flex items-start gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
              <span>
                {selectedQuestion === 'all'
                  ? 'ข้อมูลรวบรวมจากการประเมินทั้ง 5 ด้านของผู้เข้าอบรมทุกคน'
                  : WORKSHOP_QUESTIONS.find((q) => q.id === selectedQuestion)?.title}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
