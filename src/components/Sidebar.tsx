import { Home, BookOpen, Layers, CheckSquare, BarChart2, X, LogOut, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../store/authStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const allNavItems = [
  { id: 'dashboard', label: 'Tổng Quan', icon: Home, roles: ['admin', 'staff'] },
  { id: 'subjects', label: 'Môn Học', icon: BookOpen, roles: ['admin', 'staff'] },
  { id: 'matrix', label: 'Ma Trận Kiến Thức', icon: Layers, roles: ['admin', 'staff'] },
  { id: 'generator', label: 'Tạo Đề Thi', icon: CheckSquare, roles: ['admin', 'staff', 'customer'] },
  { id: 'statistics', label: 'Thống Kê', icon: BarChart2, roles: ['admin', 'staff', 'customer'] },
];

export default function Sidebar({ isOpen, onClose, activeTab, setActiveTab }: SidebarProps) {
  const { profile, signOut, user } = useAuthStore();
  
  const userRole = profile?.role || 'customer';
  const supabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

  // Filter nav items based on role (show all if Supabase not configured)
  const navItems = supabaseConfigured 
    ? allNavItems.filter(item => item.roles.includes(userRole))
    : allNavItems;

  const roleLabels: Record<string, string> = {
    admin: 'Quản trị viên',
    staff: 'Nhân viên',
    customer: 'Giáo viên',
  };

  const roleBadgeColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    staff: 'bg-blue-100 text-blue-700',
    customer: 'bg-green-100 text-green-700',
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform lg:transform-none lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100 lg:hidden">
            <span className="font-bold text-xl gradient-text">EduGen AI</span>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User info & signout (only when Supabase is configured and user is logged in) */}
          {supabaseConfigured && user ? (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {(profile?.full_name || user.email || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profile?.full_name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${roleBadgeColors[userRole] || 'bg-gray-100 text-gray-600'}`}>
                    <Shield className="w-2.5 h-2.5" />
                    {roleLabels[userRole] || userRole}
                  </span>
                </div>
              </div>
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-gray-100">
              <div className="bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl p-4 border border-blue-100/50">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">Gemini AI Powered</h4>
                <p className="text-xs text-gray-500">Hệ thống tự động sinh đề thi thông minh.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
