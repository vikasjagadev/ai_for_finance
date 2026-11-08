import React from 'react';
import {
  LayoutDashboard,
  LineChart,
  Sparkles,
  PieChart,
  Newspaper,
  Settings,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'analysis', label: 'Stock Analysis', icon: LineChart },
    { id: 'prediction', label: 'AI Prediction', icon: Sparkles, badge: 'ML' },
    { id: 'portfolio', label: 'Portfolio Tracker', icon: PieChart },
    { id: 'news', label: 'News & Updates', icon: Newspaper },
    { id: 'landing', label: 'Landing Overview', icon: Home },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative hidden lg:flex flex-col border-r border-white/10 bg-[#090d16]/95 backdrop-blur-xl transition-all duration-300 z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-slate-800 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-50"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Nav items */}
      <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
              } py-2.5 rounded-xl font-medium text-xs transition-all group relative ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/20 to-violet-600/10 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </div>

              {!isCollapsed && item.badge && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.badge}
                </span>
              )}

              {/* Tooltip on collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-white/10 z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info Box */}
      {!isCollapsed && (
        <div className="p-4 m-3 rounded-xl bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 text-xs">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Models Live</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Random Forest & Gradient Boosting engines active with chronological validation.
          </p>
        </div>
      )}
    </aside>
  );
};

