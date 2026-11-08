import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart2,
  Bookmark,
  Plus,
  Trash2,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import {
  IndexQuote,
  MarketStats,
  StockGainerLoser,
  HistoricalDataPoint,
  WatchlistItem
} from '../types';
import { StockChart } from '../components/StockChart';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onSelectStock: (symbol: string) => void;
  onNavigateToPrediction: (symbol: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectStock,
  onNavigateToPrediction,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [indices, setIndices] = useState<IndexQuote[]>([]);
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [gainers, setGainers] = useState<StockGainerLoser[]>([]);
  const [losers, setLosers] = useState<StockGainerLoser[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  
  // Featured chart state
  const [featuredSymbol, setFeaturedSymbol] = useState('RELIANCE.NS');
  const [chartData, setChartData] = useState<HistoricalDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState('1Y');
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Watchlist input
  const [newWatchlistSymbol, setNewWatchlistSymbol] = useState('');
  const [isAddingWatchlist, setIsAddingWatchlist] = useState(false);

  const loadMarketData = async () => {
    setIsRefreshing(true);
    try {
      const [overviewData, statsData, gainersData, losersData] = await Promise.all([
        api.getMarketOverview(),
        api.getMarketStats(),
        api.getTopGainers(),
        api.getTopLosers(),
      ]);
      setIndices(overviewData.indices);
      setStats(statsData);
      setGainers(gainersData);
      setLosers(losersData);
    } catch (err) {
      console.error('Failed to load market dashboard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadChartData = async (sym: string, tf: string) => {
    setIsChartLoading(true);
    try {
      const periodMap: Record<string, string> = {
        '1D': '1d',
        '1W': '5d',
        '1M': '1mo',
        '6M': '6mo',
        '1Y': '1y',
        '5Y': '5y',
      };
      const res = await api.getStockHistory(sym, periodMap[tf] || '1y');
      setChartData(res.data);
    } catch (err) {
      console.error('Failed to load chart history:', err);
    } finally {
      setIsChartLoading(false);
    }
  };

  const loadWatchlist = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await api.getWatchlist();
      setWatchlist(data);
    } catch (err) {
      console.error('Watchlist fetch error:', err);
    }
  };

  useEffect(() => {
    loadMarketData();
    const interval = setInterval(loadMarketData, 45000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadChartData(featuredSymbol, timeframe);
  }, [featuredSymbol, timeframe]);

  useEffect(() => {
    loadWatchlist();
  }, [isAuthenticated]);

  const handleAddWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!newWatchlistSymbol.trim()) return;

    setIsAddingWatchlist(true);
    try {
      const added = await api.addToWatchlist(newWatchlistSymbol.trim().toUpperCase());
      setWatchlist([added, ...watchlist]);
      setNewWatchlistSymbol('');
    } catch (err: any) {
      alert(err.message || 'Failed to add stock to watchlist');
    } finally {
      setIsAddingWatchlist(false);
    }
  };

  const handleRemoveWatchlist = async (id: number) => {
    try {
      await api.removeFromWatchlist(id);
      setWatchlist(watchlist.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <span>Market Intelligence Dashboard</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time multi-exchange surveillance across Indian NSE/BSE & US Markets.
          </p>
        </div>

        <button
          onClick={loadMarketData}
          disabled={isRefreshing}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Quotes'}</span>
        </button>
      </div>

      {/* 1. Market Overview Indices */}
      <div>
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Major Benchmark Indices
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {indices.map((idx) => {
            const isPos = idx.change_percent >= 0;
            return (
              <div
                key={idx.symbol}
                className="p-4 rounded-2xl bg-[#0f172a]/70 border border-white/10 hover:border-white/20 transition-all glass-panel"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white tracking-wide">{idx.name}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-white/5">
                    {idx.exchange}
                  </span>
                </div>

                <div className="text-xl font-bold font-mono text-white tracking-tight">
                  {idx.currency === 'INR' ? '₹' : '$'}
                  {idx.current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px]">
                  <span
                    className={`inline-flex items-center font-semibold ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPos ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    {isPos ? '+' : ''}
                    {idx.change_percent}%
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    H: {idx.high} L: {idx.low}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Market Statistics Summary Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900/80 via-[#0f172a] to-slate-900/80 border border-white/10 text-xs">
          <div>
            <div className="text-slate-400 text-[11px]">Tracked Equities</div>
            <div className="text-lg font-bold text-white mt-0.5 font-mono">
              {stats.tracked_stocks_count} Stocks
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Market Breadth</div>
            <div className="flex items-center space-x-2 mt-0.5 font-bold font-mono">
              <span className="text-emerald-400">{stats.gainers_count} Advancing</span>
              <span className="text-slate-500">/</span>
              <span className="text-rose-400">{stats.losers_count} Declining</span>
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Avg Daily Volatility</div>
            <div className="text-lg font-bold text-indigo-400 mt-0.5 font-mono">
              ±{stats.average_daily_movement_percent}%
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[11px]">Surveillance Status</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Full Precision</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Chart & Watchlist Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Stock Chart (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">Featured Chart:</span>
              {['RELIANCE.NS', 'TCS.NS', 'NVDA', 'AAPL', 'MSFT', 'TATAMOTORS.NS'].map((sym) => (
                <button
                  key={sym}
                  onClick={() => setFeaturedSymbol(sym)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                    featuredSymbol === sym
                      ? 'bg-indigo-600 text-white font-bold shadow'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSelectStock(featuredSymbol)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-semibold border border-indigo-500/30 transition-all"
              >
                <span>Deep Analysis</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateToPrediction(featuredSymbol)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Predict with AI</span>
              </button>
            </div>
          </div>

          <StockChart
            data={chartData}
            symbol={featuredSymbol}
            currency={featuredSymbol.includes('.NS') ? 'INR' : 'USD'}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            isLoading={isChartLoading}
          />
        </div>

        {/* Right: Watchlist Card (1 col) */}
        <div className="bg-[#0f172a]/70 border border-white/10 rounded-2xl p-5 glass-panel flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">My Watchlist</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {watchlist.length} pinned
            </span>
          </div>

          {/* Add quick symbol form */}
          <form onSubmit={handleAddWatchlist} className="mt-3 flex space-x-2">
            <input
              type="text"
              value={newWatchlistSymbol}
              onChange={(e) => setNewWatchlistSymbol(e.target.value)}
              placeholder="e.g. INFY.NS or TSLA"
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isAddingWatchlist}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Watchlist Items */}
          <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1">
            {!isAuthenticated ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Bookmark className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs text-slate-400 font-medium">Log in to save stocks to your private database watchlist.</p>
                <button
                  onClick={() => openAuthModal('login')}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-all"
                >
                  Sign In
                </button>
              </div>
            ) : watchlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 text-xs">
                <Bookmark className="w-8 h-8 text-slate-700 mb-2" />
                <p>Your watchlist is empty.</p>
                <p className="text-[11px] mt-1">Add symbols above to track prices in real time.</p>
              </div>
            ) : (
              watchlist.map((item) => {
                const quote = item.quote;
                const isPos = quote ? quote.change_percent >= 0 : true;
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between group"
                  >
                    <div
                      className="cursor-pointer flex-1"
                      onClick={() => onSelectStock(item.stock_symbol)}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors">
                          {item.stock_symbol}
                        </span>
                        <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400">
                          {item.exchange || 'NSE'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {item.company_name || item.stock_symbol}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {quote ? (
                        <div className="text-right">
                          <div className="font-mono font-bold text-xs text-white">
                            {quote.currency === 'INR' ? '₹' : '$'}{quote.current_price}
                          </div>
                          <div
                            className={`text-[10px] font-semibold flex items-center justify-end ${
                              isPos ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPos ? '+' : ''}{quote.change_percent}%
                          </div>
                        </div>
                      ) : null}

                      <button
                        onClick={() => handleRemoveWatchlist(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                        title="Remove from watchlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Top Gainers & Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/70 border border-white/10 glass-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Top Market Gainers</h3>
            </div>
            <span className="text-[11px] text-slate-500">Live Data</span>
          </div>

          <div className="space-y-2">
            {gainers.slice(0, 5).map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">
                      {stock.symbol}
                    </span>
                    <span className="text-[10px] text-slate-400">{stock.exchange}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {stock.name}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-white">
                    {stock.currency === 'INR' ? '₹' : '$'}{stock.current_price}
                  </div>
                  <div className="text-xs font-bold text-emerald-400 flex items-center justify-end">
                    +{stock.change_percent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/70 border border-white/10 glass-panel">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                <TrendingDown className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white">Top Market Losers</h3>
            </div>
            <span className="text-[11px] text-slate-500">Live Data</span>
          </div>

          <div className="space-y-2">
            {losers.slice(0, 5).map((stock) => (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="p-3 rounded-xl bg-slate-900/50 border border-white/5 hover:border-rose-500/30 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-white group-hover:text-rose-400 transition-colors">
                      {stock.symbol}
                    </span>
                    <span className="text-[10px] text-slate-400">{stock.exchange}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {stock.name}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-xs text-white">
                    {stock.currency === 'INR' ? '₹' : '$'}{stock.current_price}
                  </div>
                  <div className="text-xs font-bold text-rose-400 flex items-center justify-end">
                    {stock.change_percent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

