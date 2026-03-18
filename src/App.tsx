import { useState, useEffect } from 'react';
import { getAppData, saveAppData } from './data/mockData';
import { AppData } from './types';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import SubjectsView from './components/SubjectsView';
import MatrixView from './components/MatrixView';
import GeneratorView from './components/GeneratorView';
import StatisticsView from './components/StatisticsView';
import SettingsModal from './components/SettingsModal';
import AITutorPanel from './components/AITutorPanel';
import AuthPage from './components/AuthPage';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [activeTab, setActiveTab] = useState('generator');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auth state
  const { user, setUser, fetchProfile, setProfile } = useAuthStore();
  const [authInitialized, setAuthInitialized] = useState(false);

  // Check if Supabase is configured
  const supabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  // Auth listener
  useEffect(() => {
    if (!supabaseConfigured) {
      // Skip auth if Supabase is not configured - allow app to work without it
      setAuthInitialized(true);
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id).finally(() => setAuthInitialized(true));
      } else {
        setAuthInitialized(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await fetchProfile(u.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load app data
  useEffect(() => {
    const loadedData = getAppData();
    setData(loadedData);
  }, []);

  const handleSaveData = (newData: AppData) => {
    setData(newData);
    saveAppData(newData);
  };

  // Loading state
  if (!authInitialized || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Auth gate: if Supabase is configured and user is not logged in, show auth page
  if (supabaseConfigured && !user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView data={data} />;
      case 'subjects':
        return <SubjectsView data={data} onSaveData={handleSaveData} />;
      case 'matrix':
        return <MatrixView data={data} />;
      case 'generator':
        return <GeneratorView data={data} onSaveData={handleSaveData} />;
      case 'statistics':
        return <StatisticsView data={data} />;
      default:
        return <DashboardView data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
      <AITutorPanel />
    </div>
  );
}
