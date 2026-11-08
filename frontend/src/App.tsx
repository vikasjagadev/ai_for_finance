import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MarketTape } from './components/MarketTape';
import { StockSearchModal } from './components/StockSearchModal';
import { AuthModal } from './pages/AuthModal';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { PredictionPage } from './pages/PredictionPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { NewsPage } from './pages/NewsPage';
import { SettingsPage } from './pages/SettingsPage';

import { LayoutDashboard, LineChart, Sparkles, PieChart, Newspaper } from 'lucide-react';

export const MainApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [selectedStock, setSelectedStock] = useState<string>('NVDA');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol);
    setCurrentPage('analysis');
  };

  const handleNavigateToPrediction = (symbol: string) => {
    setSelectedStock(symbol);
    setCurrentPage('prediction');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Real-time Market Ticker Tape */}
      <MarketTape />

      {/* Primary Header */}
      <Navbar
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />

      {/* Main Container Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Persistent Desktop Sidebar (Hidden on landing page if desired, or accessible everywhere) */}
        {currentPage !== 'landing' && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={setCurrentPage}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
          {currentPage === 'landing' && (
            <LandingPage
              onExploreDashboard={() => setCurrentPage('dashboard')}
              onStartAnalyzing={() => setCurrentPage('analysis')}
              onSelectStock={handleSelectStock}
            />
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage
              onSelectStock={handleSelectStock}
              onNavigateToPrediction={handleNavigateToPrediction}
            />
          )}

          {currentPage === 'analysis' && (
            <AnalysisPage
              initialSymbol={selectedStock}
              onNavigateToPrediction={handleNavigateToPrediction}
              onOpenSearch={() => setIsSearchOpen(true)}
            />
          )}

          {currentPage === 'prediction' && (
            <PredictionPage initialSymbol={selectedStock} />
          )}

          {currentPage === 'portfolio' && <PortfolioPage />}

          {currentPage === 'news' && <NewsPage />}

          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {currentPage !== 'landing' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around text-[10px]">
          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`flex flex-col items-center space-y-1 ${
              currentPage === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentPage('analysis')}
            className={`flex flex-col items-center space-y-1 ${
              currentPage === 'analysis' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>Analysis</span>
          </button>
          <button
            onClick={() => setCurrentPage('prediction')}
            className={`flex flex-col items-center space-y-1 ${
              currentPage === 'prediction' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Prediction</span>
          </button>
          <button
            onClick={() => setCurrentPage('portfolio')}
            className={`flex flex-col items-center space-y-1 ${
              currentPage === 'portfolio' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Portfolio</span>
          </button>
          <button
            onClick={() => setCurrentPage('news')}
            className={`flex flex-col items-center space-y-1 ${
              currentPage === 'news' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>News</span>
          </button>
        </div>
      )}

      {/* Global Quick Search Modal */}
      <StockSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectStock={handleSelectStock}
      />

      {/* Authentication Modal */}
      <AuthModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
