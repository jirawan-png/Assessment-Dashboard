import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  WORKSHOP_QUESTIONS,
  QuestionDefinition,
} from '../types/survey';
import {
  hasDeviceSubmitted,
  submitSurveyResponse,
  clearDeviceSubmitted,
} from '../services/storageService';
import {
  CheckCircle2,
  Sparkles,
  Send,
  AlertCircle,
  RotateCcw,
  BookOpen,
  UserCheck,
  FileText,
  Clock,
  Award,
  Smartphone,
  Maximize2,
  ShieldCheck,
} from 'lucide-react';

interface SurveyViewProps {
  onSwitchToDashboard?: () => void;
}

const SCORE_LABELS: Record<number, { label: string; desc: string }> = {
  1: { label: 'น้อยที่สุด', desc: 'ต้องปรับปรุงเร่งด่วน' },
  2: { label: 'น้อย', desc: 'ควรพัฒนาเพิ่มเติม' },
  3: { label: 'ปานกลาง', desc: 'อยู่ในเกณฑ์พอใช้' },
  4: { label: 'มาก', desc: 'ดี ตรงตามเกณฑ์' },
  5: { label: 'มากที่สุด', desc: 'ดีเยี่ยม ประทับใจมาก' },
};

const getQuestionIcon = (iconName: string) => {
  switch (iconName) {
    case 'BookOpen':
      return <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    case 'UserCheck':
      return <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    case 'FileText':
      return <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    case 'Clock':
      return <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    case 'Award':
      return <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    default:
      return <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
  }
};

export const SurveyView: React.FC<SurveyViewProps> = ({ onSwitchToDashboard }) => {
  const [alreadySubmitted, setAlreadySubmitted] = useState<boolean>(false);
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [scores, setScores] = useState<Record<string, number>>({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
  });
  const [comment, setComment] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);

  useEffect(() => {
    setAlreadySubmitted(hasDeviceSubmitted());
  }, []);

  const answeredCount = Object.values(scores).filter((v) => v > 0).length;
  const progressPercent = Math.round((answeredCount / 5) * 100);

  const handleScoreSelect = (questionId: string, value: number) => {
    setScores((prev) => ({ ...prev, [questionId]: value }));
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check all questions answered
    const unanswered = WORKSHOP_QUESTIONS.find((q) => !scores[q.id]);
    if (unanswered) {
      setValidationError(`กรุณาให้คะแนนข้อที่ ${unanswered.index}: ${unanswered.title}`);
      // Scroll to question
      const el = document.getElementById(`question-card-${unanswered.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      await submitSurveyResponse(
        scores.q1,
        scores.q2,
        scores.q3,
        scores.q4,
        scores.q5,
        comment
      );

      // Trigger Confetti Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
      });

      setJustSubmitted(true);
      setAlreadySubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setValidationError('เกิดข้อผิดพลาดในการบันทึกผล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForTesting = () => {
    clearDeviceSubmitted();
    setAlreadySubmitted(false);
    setJustSubmitted(false);
    setScores({ q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 });
    setComment('');
    setValidationError(null);
  };

  return (
    <div className="py-6 px-4 flex flex-col items-center min-h-[calc(100vh-64px)] bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Top Device Preview Mode Toggle (Desktop only) */}
      <div className="w-full max-w-xl mb-4 hidden md:flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ระบบไม่เก็บชื่อผู้ตอบ (Anonymous &amp; Secure)
        </span>
        <button
          onClick={() => setIsPhoneFrame(!isPhoneFrame)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          {isPhoneFrame ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" /> มุมมองเต็มจอ
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" /> กรอบจำลองมือถือ
            </>
          )}
        </button>
      </div>

      {/* Main Container / Mobile Frame */}
      <div
        className={`w-full transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border-4 border-slate-800 dark:border-slate-700 p-5 overflow-hidden'
            : 'max-w-xl'
        }`}
      >
        {/* State 1: Submitted / Already Answered */}
        {alreadySubmitted && !justSubmitted && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              คุณได้ส่งแบบประเมินเรียบร้อยแล้ว
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              ระบบได้บันทึกความคิดเห็นของอุปกรณ์นี้แล้ว เพื่อป้องกันการส่งข้อมูลซ้ำ
              ขอขอบพระคุณสำหรับข้อเสนอแนะอันมีค่าในการพัฒนาหลักสูตรครับ/ค่ะ
            </p>

            <div className="space-y-3">
              {onSwitchToDashboard && (
                <button
                  onClick={onSwitchToDashboard}
                  className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition"
                >
                  ดูสรุปผลบนจอแดชบอร์ด →
                </button>
              )}
              <button
                onClick={handleResetForTesting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                รีเซ็ตเครื่องเพื่อทดสอบตอบใหม่ (สำหรับผู้จัดอบรม)
              </button>
            </div>
          </div>
        )}

        {/* State 2: Just Submitted Thank You */}
        {justSubmitted && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-slate-800 text-center animate-fade-in">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              ✨
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              ส่งแบบประเมินสำเร็จ!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
              คะแนนและข้อเสนอแนะของคุณถูกส่งไปยังหน้าจอแดชบอร์ดของผู้จัดอบรมในทันที
              ขอขอบคุณที่ร่วมเป็นส่วนสำคัญในการพัฒนาการอบรมครั้งนี้
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 dark:text-slate-400 mb-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              ข้อมูลถูกบันทึกแบบไม่ระบุตัวตน 100%
            </div>

            <div className="space-y-3">
              {onSwitchToDashboard && (
                <button
                  onClick={onSwitchToDashboard}
                  className="w-full py-3 px-4 rounded-xl font-medium text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition"
                >
                  ไปที่หน้าจอแสดงผลแดชบอร์ด →
                </button>
              )}
              <button
                onClick={handleResetForTesting}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              >
                รีเซ็ตเครื่องเพื่อลองตอบอีกครั้ง
              </button>
            </div>
          </div>
        )}

        {/* State 3: Active Form */}
        {!alreadySubmitted && !justSubmitted && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form Banner Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-200">
                  แบบประเมินผู้เข้าอบรม
                </span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-white/20 text-white">
                  {answeredCount} / 5 ข้อ
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                แบบประเมินความพึงพอใจการอบรม
              </h1>
              <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
                โปรดให้คะแนนระดับความพึงพอใจของท่านตามความเป็นจริง (สเกล 1-5) เพื่อประโยชน์ในการปรับปรุงการอบรม
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-indigo-900/40 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Validation Alert */}
            {validationError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Questions List */}
            {WORKSHOP_QUESTIONS.map((q: QuestionDefinition) => {
              const currentScore = scores[q.id];
              return (
                <div
                  key={q.id}
                  id={`question-card-${q.id}`}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border transition-all ${
                    currentScore > 0
                      ? 'border-indigo-200 dark:border-indigo-900/60'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 flex items-center justify-center shrink-0 mt-0.5">
                        {getQuestionIcon(q.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            ข้อ {q.index}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                          {q.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {q.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 1 - 5 Rating Buttons (Mobile First, large hitboxes >=48px) */}
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = currentScore === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleScoreSelect(q.id, val)}
                          className={`min-h-[52px] sm:min-h-[56px] rounded-xl font-bold text-base flex flex-col items-center justify-center transition-all select-none ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-[1.02] border-2 border-indigo-600 ring-2 ring-indigo-200 dark:ring-indigo-950'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95'
                          }`}
                        >
                          <span className="font-mono text-base sm:text-lg">{val}</span>
                          <span
                            className={`text-[9px] font-normal leading-none mt-0.5 ${
                              isSelected
                                ? 'text-indigo-100 font-medium'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {SCORE_LABELS[val].label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Rating Description Label */}
                  {currentScore > 0 && (
                    <div className="mt-2.5 text-right">
                      <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        {SCORE_LABELS[currentScore].label} ({SCORE_LABELS[currentScore].desc})
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Optional Comment Box */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800">
              <label
                htmlFor="survey-comment"
                className="block text-sm font-semibold text-slate-900 dark:text-white mb-1"
              >
                ข้อเสนอแนะเพิ่มเติมเพื่อการพัฒนาหลักสูตร (ไม่บังคับ)
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                ความคิดเห็น สิ่งที่ประทับใจ หรือหัวข้อที่ต้องการให้อบรมเพิ่มเติมในครั้งถัดไป
              </p>
              <textarea
                id="survey-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="พิมพ์ความคิดเห็นของท่านที่นี่..."
                className="w-full text-sm p-3 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 transition"
              ></textarea>
            </div>

            {/* Submit CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[50px] py-3.5 px-6 rounded-2xl font-semibold text-base text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span>กำลังบันทึกข้อมูล...</span>
                ) : (
                  <>
                    <span>ส่งแบบประเมิน</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                * ต้องเลือกคะแนนให้ครบทั้ง 5 ข้อจึงจะสามารถกดส่งได้
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
