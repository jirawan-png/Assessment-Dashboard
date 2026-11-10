import { useState, useEffect } from 'react';
import {
  SurveyResponse,
  SurveyAnalytics,
} from './types/survey';
import {
  subscribeToResponses,
  computeAnalytics,
  downloadCSV,
} from './services/storageService';
import { SurveyView } from './components/SurveyView';
import { DashboardView } from './components/DashboardView';
import { QRCodeModal } from './components/QRCodeModal';
import { FirebaseGuideAndCodeModal } from './components/FirebaseGuideAndCodeModal';
import {
  Smartphone,
  LayoutDashboard,
  QrCode,
  BookOpen,
  Download,
} from 'lucide-react';

type AppView = 'survey' | 'dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [analytics, setAnalytics] = useState<SurveyAnalytics>(() => computeAnalytics([]));
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [showFirebaseModal, setShowFirebaseModal] = useState<boolean>(false);
  const [firebaseModalTab, setFirebaseModalTab] = useState<'sync-deploy' | 'code-survey' | 'code-dashboard' | 'guide' | 'settings'>('sync-deploy');

  // Listen to responses in real-time (cross-tab sync + localStorage + Firebase)
  useEffect(() => {
    const unsubscribe = subscribeToResponses((updated) => {
      setResponses(updated);
      setAnalytics(computeAnalytics(updated));
    });

    // Check URL parameters for direct view routing (?view=survey or ?view=dashboard)
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam === 'survey') {
      setCurrentView('survey');
    } else if (viewParam === 'dashboard') {
      setCurrentView('dashboard');
    }

    return () => unsubscribe();
  }, []);

  const openFirebaseWithTab = (tab: 'sync-deploy' | 'code-survey' | 'code-dashboard' | 'guide' | 'settings') => {
    setFirebaseModalTab(tab);
    setShowFirebaseModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Contract: 3 zones separated by gap-8 (Brand Wordmark — Nav Links — 1 Primary Action) */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
            LW
          </div>
          <span className="text-base sm:text-lg font-bold text-white tracking-tight whitespace-nowrap shrink-0">
            LiveWorkshop <span className="text-indigo-400 font-normal text-xs sm:text-sm">· ประเมินผลสด</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links / Segmented Tabs */}
        <nav className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 shrink-0 overflow-x-auto max-w-full">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition flex items-center gap-1.5 ${
              currentView === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>จอแดชบอร์ด ({responses.length})</span>
          </button>

          <button
            onClick={() => setCurrentView('survey')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition flex items-center gap-1.5 ${
              currentView === 'survey'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>หน้าตอบแบบสอบถาม</span>
          </button>

          <button
            onClick={() => setShowQRModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white whitespace-nowrap shrink-0 transition flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>

          <button
            onClick={() => openFirebaseWithTab('sync-deploy')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/50 border border-emerald-800/80 whitespace-nowrap shrink-0 transition flex items-center gap-1.5"
          >
            <span>🚀 Sync Netlify &amp; GitHub</span>
          </button>

          <button
            onClick={() => openFirebaseWithTab('guide')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white whitespace-nowrap shrink-0 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>โค้ด &amp; คู่มือ Firebase</span>
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => downloadCSV(responses)}
            disabled={responses.length === 0}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-sm transition whitespace-nowrap shrink-0 flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ส่งออก</span> CSV
          </button>
        </div>
      </header>

      {/* Main View Port */}
      <main className="flex-1">
        {currentView === 'dashboard' ? (
          <DashboardView
            analytics={analytics}
            responses={responses}
            onOpenQR={() => setShowQRModal(true)}
            onOpenFirebaseGuide={() => openFirebaseWithTab('guide')}
            onOpenConfig={() => openFirebaseWithTab('settings')}
          />
        ) : (
          <SurveyView onSwitchToDashboard={() => setCurrentView('dashboard')} />
        )}
      </main>

      {/* QR Code Presentation Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        onSwitchToSurvey={() => setCurrentView('survey')}
      />

      {/* Standalone Code & Firebase Setup Guide Modal */}
      <FirebaseGuideAndCodeModal
        isOpen={showFirebaseModal}
        onClose={() => setShowFirebaseModal(false)}
        initialTab={firebaseModalTab}
      />
    </div>
  );
}
