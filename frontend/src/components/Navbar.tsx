import React, { useState, useEffect } from 'react';
import {
  Brain,
  Search,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  Sparkles,
  Menu,
  X,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenSearch: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch, onNavigate, currentPage }) => {
  const { user, isAuthenticated, logout, openAuthModal, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090d16]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                StockMind
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI
              </span>
            </div>
            <div className="text-[10px] text-slate-400 -mt-1 hidden sm:block">
              Institutional Intelligence
            </div>
          </div>
        </div>

        {/* Center: Global Quick Stock Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all group"
          >
            <div className="flex items-center space-x-2 text-xs">
              <Search className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              <span>Search stocks (e.g. RELIANCE, TCS, AAPL, NVDA)...</span>
            </div>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-white/10 rounded">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center space-x-3">
          {/* Live Clock Badge */}
          <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{currentTime}</span>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Quick Search on Mobile */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white md:hidden"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* User Auth / Demo Button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1.5 pr-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/40 transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white text-xs">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium text-slate-200 hidden sm:inline truncate max-w-[100px]">
                  {user?.name}
                </span>
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0f172a] border border-white/10 shadow-2xl py-2 z-50 glass-panel"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-white/5">
                    <div className="text-xs font-bold text-white">{user?.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-indigo-400 flex items-center space-x-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </button>
                  <button
                    onClick={() => onNavigate('settings')}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-indigo-400 flex items-center space-x-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Profile & Settings</span>
                  </button>
                  <div className="my-1 border-t border-white/5" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={demoLogin}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Demo Mode</span>
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

