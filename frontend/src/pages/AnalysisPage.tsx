import React, { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Bookmark,
  Share2,
  AlertCircle,
  HelpCircle,
  Info,
  ShieldAlert,
  ArrowRight,
  Layers,
  Activity,
  Plus
} from 'lucide-react';
import { api } from '../services/api';
import {
  StockQuote,
  StockHistoryResponse,
  TechnicalIndicatorsResponse,
  HistoricalDataPoint
} from '../types';
import { StockChart } from '../components/StockChart';
import { useAuth } from '../context/AuthContext';

interface AnalysisPageProps {
  initialSymbol?: string;
  onNavigateToPrediction: (symbol: string) => void;
  onOpenSearch: () => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  initialSymbol = 'RELIANCE.NS',
  onNavigateToPrediction,
  onOpenSearch,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [symbol, setSymbol] = useState(initialSymbol);
  const [searchInput, setSearchInput] = useState('');
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [indicators, setIndicators] = useState<TechnicalIndicatorsResponse | null>(null);
  const [historyData, setHistoryData] = useState<HistoricalDataPoint[]>([]);
  const [timeframe, setTimeframe] = useState('1Y');
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [watchlistSuccess, setWatchlistSuccess] = useState(false);

  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  const fetchStockData = async (targetSymbol: string, tf: string) => {
    setIsLoading(true);
    setErrorMsg('');
    setWatchlistSuccess(false);

    const periodMap: Record<string, string> = {
      '1D': '1d',
      '1W': '5d',
      '1M': '1mo',
      '6M': '6mo',
      '1Y': '1y',
      '5Y': '5y',
    };

    try {
      const [quoteRes, historyRes, indRes] = await Promise.all([
        api.getStockQuote(targetSymbol),
        api.getStockHistory(targetSymbol, periodMap[tf] || '1y'),
        api.getTechnicalIndicators(targetSymbol),
      ]);
      setQuote(quoteRes);
      setHistoryData(historyRes.data);
      setIndicators(indRes);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to retrieve financial metrics for this asset.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(symbol, timeframe);
  }, [symbol, timeframe]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSymbol(searchInput.trim().toUpperCase());
      setSearchInput('');
    }
  };

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (!quote) return;
    try {
      await api.addToWatchlist(quote.symbol, quote.name, quote.exchange);
      setWatchlistSuccess(true);
      setTimeout(() => setWatchlistSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error adding to watchlist');
    }
  };

  const isPos = quote ? quote.change >= 0 : true;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional Technical Analysis
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Algorithmic indicators, volatility metrics, and support & resistance mapping.
          </p>
        </div>

        {/* Symbol Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter ticker (e.g. TCS.NS, NVDA)..."
              className="pl-9 pr-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-60"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all"
          >
            Load
          </button>
        </form>
      </div>

      {errorMsg ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">Asset Data Unavailable</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">{errorMsg}</p>
          <div className="mt-4 flex justify-center gap-2">
            {['RELIANCE.NS', 'TCS.NS', 'AAPL', 'NVDA', 'MSFT'].map((s) => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg font-mono"
              >
                Try {s}
              </button>
            ))}
          </div>
        </div>
      ) : quote ? (
        <>
          {/* Stock Header & Key Metrics Bar */}
          <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
              {/* Asset Identity */}
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {quote.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-800 text-slate-300 border border-white/10">
                    {quote.symbol}
                  </span>
                  <span className="px-2 py-0.5 rounded font-semibold text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {quote.exchange}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1.5">
                  <span>Last updated: {quote.last_updated}</span>
                  <span className="text-slate-600">•</span>
                  <span className="inline-flex items-center space-x-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Feed: {quote.provider || 'Market Engine'}</span>
                  </span>
                </div>
              </div>

              {/* Price & Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-left md:text-right">
                  <div className="text-3xl font-extrabold font-mono text-white">
                    {quote.currency === 'INR' ? '₹' : '$'}{quote.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`inline-flex items-center text-sm font-bold ${
                      isPos ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPos ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {isPos ? '+' : ''}{quote.change} ({isPos ? '+' : ''}{quote.change_percent}%)
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAddToWatchlist}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 ${
                      watchlistSuccess
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-300 hover:text-white border-white/10'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{watchlistSuccess ? 'Saved' : 'Watchlist'}</span>
                  </button>

                  <button
                    onClick={() => onNavigateToPrediction(quote.symbol)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Launch AI Prediction</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 text-xs">
              <div>
                <span className="text-slate-400 text-[11px]">Open Price</span>
                <div className="text-white font-mono font-bold mt-0.5">
                  {quote.currency === 'INR' ? '₹' : '$'}{quote.open}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Day High / Low</span>
                <div className="text-white font-mono font-bold mt-0.5">
                  {quote.high} / {quote.low}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Previous Close</span>
                <div className="text-white font-mono font-bold mt-0.5">
                  {quote.currency === 'INR' ? '₹' : '$'}{quote.previous_close}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">52-Week Range</span>
                <div className="text-white font-mono font-bold mt-0.5">
                  {quote.fifty_two_week_low || '—'} - {quote.fifty_two_week_high || '—'}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Trading Volume</span>
                <div className="text-white font-mono font-bold mt-0.5">
                  {quote.volume.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Market Cap</span>
                <div className="text-white font-mono font-bold mt-0.5">
                  {quote.market_cap ? `${(quote.market_cap / 1e9).toFixed(2)}B` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <StockChart
            data={historyData}
            symbol={quote.symbol}
            currency={quote.currency}
            currentPrice={quote.current_price}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            isLoading={isLoading}
          />

          {/* Technical Indicators Deep Dive */}
          {indicators && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    Technical Indicators & Signals
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Calculated in real-time from daily bar series.
                  </p>
                </div>
              </div>

              {/* 4 Primary Indicator Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. RSI (14) Card */}
                <div className="p-5 rounded-2xl bg-[#0f172a]/70 border border-white/10 glass-panel">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white">Relative Strength (RSI 14)</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        indicators.explanations.rsi.signal === 'Overbought'
                          ? 'bg-rose-500/20 text-rose-400'
                          : indicators.explanations.rsi.signal === 'Oversold'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-indigo-500/20 text-indigo-400'
                      }`}
                    >
                      {indicators.explanations.rsi.signal}
                    </span>
                  </div>

                  <div className="text-3xl font-extrabold font-mono text-white mb-2">
                    {indicators.indicators.rsi_14}
                  </div>

                  {/* RSI Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full transition-all duration-500 ${
                        indicators.indicators.rsi_14 >= 70
                          ? 'bg-rose-500'
                          : indicators.indicators.rsi_14 <= 30
                          ? 'bg-emerald-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(indicators.indicators.rsi_14, 100)}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {indicators.explanations.rsi.description}
                  </p>
                </div>

                {/* 2. Moving Averages Card */}
                <div className="p-5 rounded-2xl bg-[#0f172a]/70 border border-white/10 glass-panel">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white">Moving Average Trend</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">
                      {indicators.explanations.moving_averages.signal}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">SMA 20:</span>
                      <span className="font-bold text-amber-400">{indicators.indicators.sma_20}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SMA 50:</span>
                      <span className="font-bold text-purple-400">{indicators.indicators.sma_50}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">SMA 200:</span>
                      <span className="font-bold text-blue-400">{indicators.indicators.sma_200}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {indicators.explanations.moving_averages.description}
                  </p>
                </div>

                {/* 3. MACD Card */}
                <div className="p-5 rounded-2xl bg-[#0f172a]/70 border border-white/10 glass-panel">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white">MACD Momentum</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        indicators.explanations.macd.signal === 'Bullish'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {indicators.explanations.macd.signal}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">MACD Line:</span>
                      <span className="font-bold text-white">{indicators.indicators.macd_line}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Signal Line:</span>
                      <span className="font-bold text-slate-300">{indicators.indicators.macd_signal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Histogram:</span>
                      <span
                        className={`font-bold ${
                          indicators.indicators.macd_histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {indicators.indicators.macd_histogram}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {indicators.explanations.macd.description}
                  </p>
                </div>

                {/* 4. Bollinger Bands Card */}
                <div className="p-5 rounded-2xl bg-[#0f172a]/70 border border-white/10 glass-panel">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white">Bollinger Volatility</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      Bandwidth: {indicators.indicators.bollinger_width_percent}%
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono mb-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Upper Band:</span>
                      <span className="font-bold text-rose-400">{indicators.indicators.bollinger_upper}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Middle (20 SMA):</span>
                      <span className="font-bold text-slate-300">{indicators.indicators.bollinger_middle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lower Band:</span>
                      <span className="font-bold text-emerald-400">{indicators.indicators.bollinger_lower}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {indicators.explanations.bollinger.description}
                  </p>
                </div>
              </div>

              {/* Support & Resistance + AI Algorithmic Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Support & Resistance Key Price Levels */}
                <div className="p-5 rounded-2xl bg-[#0f172a]/70 border border-white/10 glass-panel">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <span>Important Price Inflection Levels</span>
                  </h4>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-rose-500/20 flex justify-between items-center">
                      <span className="text-slate-300">Resistance (60D High)</span>
                      <span className="font-bold text-rose-400">
                        {quote.currency === 'INR' ? '₹' : '$'}{indicators.support_resistance.resistance_swing_high}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex justify-between items-center">
                      <span className="text-slate-300">Resistance 1 (R1)</span>
                      <span className="font-bold text-slate-200">
                        {quote.currency === 'INR' ? '₹' : '$'}{indicators.support_resistance.resistance_1}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex justify-between items-center">
                      <span className="text-indigo-300 font-semibold">Dynamic Pivot Point</span>
                      <span className="font-bold text-indigo-300">
                        {quote.currency === 'INR' ? '₹' : '$'}{indicators.support_resistance.pivot}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex justify-between items-center">
                      <span className="text-slate-300">Support 1 (S1)</span>
                      <span className="font-bold text-slate-200">
                        {quote.currency === 'INR' ? '₹' : '$'}{indicators.support_resistance.support_1}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-emerald-500/20 flex justify-between items-center">
                      <span className="text-slate-300">Support (60D Low)</span>
                      <span className="font-bold text-emerald-400">
                        {quote.currency === 'INR' ? '₹' : '$'}{indicators.support_resistance.support_swing_low}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Algorithmic Market Synthesis (2 cols) */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-[#0f172a]/70 border border-white/10 glass-panel">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Algorithmic Quantitative Synthesis</span>
                  </h4>

                  <div className="space-y-2.5">
                    {indicators.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-900/50 border border-white/5 text-xs text-slate-300 leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                    <span>Generated from mathematical indicator logic without synthetic fabrication.</span>
                    <button
                      onClick={() => onNavigateToPrediction(quote.symbol)}
                      className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                    >
                      <span>Simulate Machine Learning Forecast</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

