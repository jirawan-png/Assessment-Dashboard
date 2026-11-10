import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  FileCode,
  BookOpen,
  Database,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  syncFromFirebase,
  FirebaseConfig,
} from '../services/storageService';

interface FirebaseGuideAndCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'sync-deploy' | 'code-survey' | 'code-dashboard' | 'guide' | 'settings';
}

export const FirebaseGuideAndCodeModal: React.FC<FirebaseGuideAndCodeModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'sync-deploy',
}) => {
  const [activeTab, setActiveTab] = useState<'sync-deploy' | 'code-survey' | 'code-dashboard' | 'guide' | 'settings'>(initialTab);
  const [copiedSurvey, setCopiedSurvey] = useState(false);
  const [copiedDashboard, setCopiedDashboard] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [fbConfig, setFbConfig] = useState<FirebaseConfig>(getFirebaseConfig());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const downloadFile = (filename: string, path: string) => {
    const a = document.createElement('a');
    a.href = path;
    a.download = filename;
    a.click();
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleSaveFirebaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(fbConfig);
    setSaveStatus('บันทึกการตั้งค่าแล้ว กำลังทดสอบเชื่อมต่อ...');
    if (fbConfig.enabled && fbConfig.databaseURL) {
      const count = await syncFromFirebase();
      setSaveStatus(`เชื่อมต่อสำเร็จ ดึงข้อมูลแล้ว ${count} รายการ`);
    } else {
      setSaveStatus('บันทึกเรียบร้อย');
    }
    setTimeout(() => setSaveStatus(null), 3500);
  };

  const rulesCode = `{
  "rules": {
    "responses": {
      ".read": true,
      ".write": true,
      ".indexOn": ["timestamp"]
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full text-slate-100 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">
              FB
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                โค้ดแยก 2 ไฟล์ &amp; คู่มือการตั้งค่า Firebase Realtime Database
              </h2>
              <p className="text-xs text-slate-400">
                HTML + JavaScript + Firebase (แพ็กเกจฟรี Spark Plan ไม่ต้องล็อกอิน)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sync-deploy')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sync-deploy'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🚀 Sync Netlify &amp; GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'guide'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>วิธีตั้งค่า Firebase (ทีละขั้น)</span>
          </button>

          <button
            onClick={() => setActiveTab('code-survey')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'code-survey'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>ไฟล์ที่ 1: survey.html</span>
          </button>

          <button
            onClick={() => setActiveTab('code-dashboard')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'code-dashboard'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>ไฟล์ที่ 2: dashboard.html</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>ทดสอบ Firebase Config</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB: SYNC NETLIFY & GITHUB */}
          {activeTab === 'sync-deploy' && (
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <span>โปรเจกต์พร้อมเชื่อมต่อ Netlify และ GitHub เรียบร้อยแล้ว</span>
                </div>
                <p className="text-xs text-slate-300">
                  ระบบได้คอมมิตโค้ดทั้งหมดลงใน Git และสร้างไฟล์ <code className="bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded font-mono">netlify.toml</code> พร้อมบิลด์แพ็กเกจ Production (<code className="bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded font-mono">dist</code>) ให้เรียบร้อยแล้ว
                </p>
              </div>

              {/* Netlify Section */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-teal-500 text-white font-bold text-xs flex items-center justify-center">N</span>
                    <h3 className="text-base font-bold text-white">วิธี Deploy ขึ้น Netlify (เสร็จใน 10 วินาที)</h3>
                  </div>
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition flex items-center gap-1.5"
                  >
                    <span>ไปที่ Netlify Drop</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs text-slate-300 font-medium">1. ดาวน์โหลดแพ็กเกจ Production ที่บิลด์แล้ว:</span>
                    <a
                      href="/netlify-deploy.zip"
                      download="netlify-deploy.zip"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ดาวน์โหลด netlify-deploy.zip</span>
                    </a>
                  </div>
                  <p className="text-xs text-slate-400">
                    2. เปิดหน้าเว็บ <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-teal-400 underline">app.netlify.com/drop</a> แล้วลากไฟล์ <code className="text-indigo-300 font-mono">netlify-deploy.zip</code> ไปวางในกรอบสี่เหลี่ยม
                  </p>
                  <p className="text-xs text-emerald-400 font-medium">
                    ✓ Netlify จะออก URL ให้คุณทันที เช่น <code className="bg-slate-900 px-1 py-0.5 rounded text-white font-mono">https://your-workshop-app.netlify.app</code> ใช้งานได้ฟรีตลอดชีพ!
                  </p>
                </div>
              </div>

              {/* GitHub Section */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-950 text-white font-bold text-xs flex items-center justify-center border border-slate-700">GH</span>
                    <h3 className="text-base font-bold text-white">วิธี Push ขึ้น GitHub Repository ของคุณ</h3>
                  </div>
                  <a
                    href="https://github.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white transition flex items-center gap-1.5"
                  >
                    <span>สร้าง Repo บน GitHub</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-slate-300">
                  เนื่องจากเพื่อความปลอดภัยของบัญชีผู้ใช้ ระบบจะไม่เก็บรหัสผ่านหรือ GitHub Token ส่วนตัวของคุณไว้ ให้คุณเปิด Terminal หรือ Git Bash ในเครื่องแล้วรันคำสั่ง 3 บรรทัดนี้เพื่อ Push ได้ทันที:
                </p>

                <div className="relative">
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800 leading-relaxed">
{`# 1. เชื่อมต่อไปยัง GitHub Repo ของคุณ (เปลี่ยน YOUR_USERNAME และ YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 2. ตั้งชื่อกิ่งเป็น main
git branch -M main

# 3. Push โค้ดขึ้น GitHub
git push -u origin main`}
                  </pre>
                  <button
                    onClick={() => {
                      const text = `git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git\ngit branch -M main\ngit push -u origin main`;
                      navigator.clipboard.writeText(text);
                      alert('คัดลอกคำสั่ง Git เรียบร้อยแล้ว!');
                    }}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1 mt-2"
                  >
                    <Copy className="w-3 h-3" />
                    <span>คัดลอกคำสั่ง Git</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                  💡 <strong>Tip เชื่อม Netlify อัตโนมัติ:</strong> เมื่อคุณ Push ขึ้น GitHub แล้ว คุณสามารถกด <strong>&quot;Import from Git&quot;</strong> บน Netlify เพื่อให้ Netlify ดีพลอยแอปเวอร์ชันใหม่ให้อัตโนมัติทุกครั้งที่คุณอัปเดตโค้ด!
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
              {/* Step 1 */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                    1
                  </span>
                  <h3 className="text-base font-bold text-white">
                    สร้าง Firebase Project (ฟรี 100% Spark Plan)
                  </h3>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pl-1">
                  <li>เข้าเว็บไซต์ <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-indigo-400 underline inline-flex items-center gap-1">Firebase Console <ExternalLink className="w-3 h-3" /></a> แล้วลงชื่อเข้าใช้ด้วยบัญชี Google</li>
                  <li>คลิกปุ่ม <strong>&quot;Add project&quot;</strong> (เพิ่มโปรเจกต์)</li>
                  <li>ตั้งชื่อโปรเจกต์ เช่น <code className="bg-slate-900 text-indigo-300 px-1.5 py-0.5 rounded font-mono">workshop-survey-2026</code> แล้วกด <strong>Continue</strong></li>
                  <li>Google Analytics: จะเปิดหรือไม่เปิดก็ได้ (แนะนำปิดเพื่อความรวดเร็ว) แล้วกด <strong>Create project</strong></li>
                </ol>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                    2
                  </span>
                  <h3 className="text-base font-bold text-white">
                    เปิดใช้งาน Realtime Database &amp; ตั้งค่า Rules
                  </h3>
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 pl-1">
                  <li>ในเมนูด้านซ้าย เลือก <strong>Build</strong> → <strong>Realtime Database</strong></li>
                  <li>คลิกปุ่ม <strong>&quot;Create Database&quot;</strong></li>
                  <li>เลือกตำแหน่งเซิร์ฟเวอร์ (เลือก <strong>Singapore (asia-southeast1)</strong> หรือ <strong>United States</strong>) แล้วกด <strong>Next</strong></li>
                  <li>เลือก <strong>&quot;Start in test mode&quot;</strong> หรือ Locked mode แล้วกด <strong>Enable</strong></li>
                  <li>ไปที่แท็บ <strong>&quot;Rules&quot;</strong> วางโค้ดความปลอดภัยด้านล่างนี้เพื่อให้ผู้เข้าอบรมส่งคะแนนได้โดยไม่ต้องล็อกอิน แล้วกด <strong>Publish</strong>:</li>
                </ol>

                <div className="relative mt-2">
                  <pre className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto border border-slate-800">
                    {rulesCode}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(rulesCode, setCopiedRules)}
                    className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1"
                  >
                    {copiedRules ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedRules ? 'คัดลอกแล้ว' : 'คัดลอก Rules'}</span>
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                    3
                  </span>
                  <h3 className="text-base font-bold text-white">
                    คัดลอก Firebase Config ไปใส่ใน survey.html และ dashboard.html
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  ไปที่รูปฟันเฟือง ⚙️ (Project settings) ด้านบนซ้าย → เลื่อนลงมาที่หัวข้อ <strong>&quot;Your apps&quot;</strong> → คลิกไอคอนเว็บ <strong>&lt;/&gt;</strong> → ตั้งชื่อแอปแล้วกด Register app จากนั้นคัดลอก <code className="bg-slate-900 text-indigo-300 px-1 rounded font-mono">firebaseConfig</code> มาวางแทนที่ในทั้ง 2 ไฟล์:
                </p>
                <div className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-indigo-300 border border-slate-800">
                  const firebaseConfig = &#123;<br />
                  &nbsp;&nbsp;apiKey: &quot;AIzaSy...&quot;,<br />
                  &nbsp;&nbsp;databaseURL: &quot;https://your-project-id-default-rtdb.firebaseio.com&quot;,<br />
                  &nbsp;&nbsp;projectId: &quot;your-project-id&quot;,<br />
                  &nbsp;&nbsp;...<br />
                  &#125;;
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold flex items-center justify-center text-xs">
                    4
                  </span>
                  <h3 className="text-base font-bold text-white">
                    วิธี Deploy ขึ้นอินเทอร์เน็ตฟรี 100% (เลือกวิธีที่สะดวก)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Option A */}
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="font-bold text-xs text-indigo-400">วิธีที่ 1: GitHub Pages (แนะนำที่สุด)</div>
                    <p className="text-[11px] text-slate-400">
                      สร้าง Repository ใน GitHub แล้วอัปโหลดไฟล์ <code className="text-slate-300 font-mono">survey.html</code> (หรือเปลี่ยนชื่อเป็น index.html) และ <code className="text-slate-300 font-mono">dashboard.html</code> ขึ้นไป จากนั้นเปิด Pages ใน Settings
                    </p>
                    <span className="text-[10px] text-emerald-400 font-semibold block">✓ ฟรีตลอดชีพ ไม่มีวันหมดอายุ</span>
                  </div>

                  {/* Option B */}
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="font-bold text-xs text-indigo-400">วิธีที่ 2: Firebase Hosting</div>
                    <p className="text-[11px] text-slate-400">
                      อยู่ในโปรเจกต์ Firebase เดียวกัน รันคำสั่ง <code className="text-slate-300 font-mono">firebase init hosting</code> แล้ววาง 2 ไฟล์ในโฟลเดอร์ public จากนั้นสั่ง <code className="text-slate-300 font-mono">firebase deploy</code>
                    </p>
                    <span className="text-[10px] text-emerald-400 font-semibold block">✓ เร็วและเสถียรที่สุด</span>
                  </div>

                  {/* Option C */}
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 space-y-2">
                    <div className="font-bold text-xs text-indigo-400">วิธีที่ 3: Vercel / Netlify</div>
                    <p className="text-[11px] text-slate-400">
                      ลากโฟลเดอร์ที่มี 2 ไฟล์วางใน dashboard ของ Netlify หรือ Vercel ได้ทันที ได้ URL เป็น https พร้อมใช้งานภายใน 1 นาที
                    </p>
                    <span className="text-[10px] text-emerald-400 font-semibold block">✓ ไม่ต้องพิมพ์คำสั่งในคอมพิวเตอร์</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE SURVEY */}
          {activeTab === 'code-survey' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">ไฟล์ survey.html (หน้าแบบสอบถามสำหรับมือถือ)</h3>
                  <p className="text-xs text-slate-400">ปุ่มสเกล 1-5 ขนาดใหญ่ กดง่าย มีระบบป้องกันการตอบซ้ำในเครื่องเดียวกัน</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadFile('survey.html', '/survey.html')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด survey.html</span>
                  </button>
                  <button
                    onClick={async () => {
                      const res = await fetch('/survey.html');
                      const text = await res.text();
                      copyToClipboard(text, setCopiedSurvey);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
                  >
                    {copiedSurvey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSurvey ? 'คัดลอกโค้ดทั้งหมดแล้ว!' : 'คัดลอกโค้ดทั้งหมด'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-[480px] overflow-y-auto">
                <p className="text-slate-500 mb-2">// ดูและดาวน์โหลดไฟล์ฉบับเต็มได้ที่ปุ่ม &quot;ดาวน์โหลด survey.html&quot; ด้านบน</p>
                <p className="text-indigo-400">&lt;!DOCTYPE html&gt;</p>
                <p className="text-indigo-400">&lt;html lang=&quot;th&quot;&gt;</p>
                <p className="text-slate-400">&lt;head&gt;</p>
                <p className="pl-4 text-slate-300">&lt;title&gt;แบบประเมินความพึงพอใจการอบรม&lt;/title&gt;</p>
                <p className="pl-4 text-slate-400">&lt;script src=&quot;https://cdn.tailwindcss.com&quot;&gt;&lt;/script&gt;</p>
                <p className="pl-4 text-slate-400">&lt;script src=&quot;https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js&quot;&gt;&lt;/script&gt;</p>
                <p className="pl-4 text-slate-400">&lt;script src=&quot;https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js&quot;&gt;&lt;/script&gt;</p>
                <p className="text-slate-400">&lt;/head&gt; ...</p>
                <p className="text-emerald-400 mt-2">// จุดใส่ Firebase Config:</p>
                <p className="text-slate-200 pl-4">const firebaseConfig = &#123;</p>
                <p className="text-amber-300 pl-8">apiKey: &quot;YOUR_API_KEY&quot;,</p>
                <p className="text-amber-300 pl-8">databaseURL: &quot;https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com&quot;,</p>
                <p className="text-amber-300 pl-8">projectId: &quot;YOUR_PROJECT_ID&quot;</p>
                <p className="text-slate-200 pl-4">&#125;;</p>
              </div>
            </div>
          )}

          {/* TAB 3: CODE DASHBOARD */}
          {activeTab === 'code-dashboard' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">ไฟล์ dashboard.html (หน้าแดชบอร์ดขึ้นจอโปรเจกเตอร์)</h3>
                  <p className="text-xs text-slate-400">กราฟแท่ง Chart.js, คะแนนเฉลี่ย Likert 5 ระดับ, สแกน QR Code และส่งออก CSV</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadFile('dashboard.html', '/dashboard.html')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด dashboard.html</span>
                  </button>
                  <button
                    onClick={async () => {
                      const res = await fetch('/dashboard.html');
                      const text = await res.text();
                      copyToClipboard(text, setCopiedDashboard);
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5"
                  >
                    {copiedDashboard ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDashboard ? 'คัดลอกโค้ดทั้งหมดแล้ว!' : 'คัดลอกโค้ดทั้งหมด'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-[480px] overflow-y-auto">
                <p className="text-slate-500 mb-2">// ดูและดาวน์โหลดไฟล์ฉบับเต็มได้ที่ปุ่ม &quot;ดาวน์โหลด dashboard.html&quot; ด้านบน</p>
                <p className="text-indigo-400">&lt;!DOCTYPE html&gt;</p>
                <p className="text-indigo-400">&lt;html lang=&quot;th&quot;&gt;</p>
                <p className="text-slate-400">&lt;head&gt;</p>
                <p className="pl-4 text-slate-300">&lt;title&gt;แดชบอร์ดผลการประเมินการอบรม (Live Dashboard)&lt;/title&gt;</p>
                <p className="pl-4 text-slate-400">&lt;script src=&quot;https://cdn.tailwindcss.com&quot;&gt;&lt;/script&gt;</p>
                <p className="pl-4 text-slate-400">&lt;script src=&quot;https://cdn.jsdelivr.net/npm/chart.js&quot;&gt;&lt;/script&gt;</p>
                <p className="pl-4 text-slate-400">&lt;script src=&quot;https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js&quot;&gt;&lt;/script&gt;</p>
                <p className="text-slate-400">&lt;/head&gt; ...</p>
                <p className="text-emerald-400 mt-2">// ฟังก์ชัน Realtime ดึงข้อมูล:</p>
                <p className="text-slate-200 pl-4">db.ref(&apos;responses&apos;).on(&apos;value&apos;, snapshot =&gt; &#123;</p>
                <p className="text-slate-400 pl-8">const data = snapshot.val();</p>
                <p className="text-slate-400 pl-8">updateDashboard(data ? Object.values(data) : []);</p>
                <p className="text-slate-200 pl-4">&#125;);</p>
              </div>
            </div>
          )}

          {/* TAB 4: SETTINGS */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveFirebaseConfig} className="space-y-4 max-w-xl mx-auto">
              <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Database className="w-4 h-4" />
                  <span>เชื่อมต่อ Firebase Realtime Database เข้ากับแอปนี้โดยตรง</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  หากคุณมี Firebase Realtime Database อยู่แล้ว สามารถนำ URL มาใส่ที่นี่เพื่อให้อุปกรณ์อื่นๆ ทั่วโลกสามารถตอบและซิงก์ผลขึ้นจอแดชบอร์ดนี้ได้ทันทีแบบข้ามเครือข่าย!
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="fb-enabled"
                      checked={fbConfig.enabled}
                      onChange={(e) => setFbConfig({ ...fbConfig, enabled: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                    />
                    <label htmlFor="fb-enabled" className="text-xs font-semibold text-white select-none">
                      เปิดใช้งานการเชื่อมต่อ Firebase Realtime Database
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Firebase Database URL:
                    </label>
                    <input
                      type="url"
                      placeholder="https://my-workshop-project-default-rtdb.firebaseio.com"
                      value={fbConfig.databaseURL}
                      onChange={(e) => setFbConfig({ ...fbConfig, databaseURL: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      ดูได้จากหน้า Realtime Database ใน Firebase Console
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      API Key (ไม่บังคับ หากตั้ง Rules เป็น Public):
                    </label>
                    <input
                      type="text"
                      placeholder="AIzaSy..."
                      value={fbConfig.apiKey || ''}
                      onChange={(e) => setFbConfig({ ...fbConfig, apiKey: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {saveStatus && (
                  <div className="p-3 bg-indigo-950/80 border border-indigo-700 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{saveStatus}</span>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
                  >
                    บันทึกการเชื่อมต่อ
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  หมายเหตุ: หากไม่ใส่ Firebase Config ตัวแอปจะใช้ระบบ BroadcastChannel และ LocalStorage ในการซิงก์แบบเรียลไทม์ระหว่างแท็บ/หน้าต่างได้ทันทีโดยไม่ต้องตั้งค่าใดๆ
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Live Workshop Satisfaction System</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
