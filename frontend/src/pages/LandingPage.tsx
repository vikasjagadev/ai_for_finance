import React, { useState } from 'react';
import {
  Brain,
  TrendingUp,
  LineChart,
  ShieldCheck,
  Cpu,
  ChevronRight,
  Sparkles,
  BarChart3,
  Search,
  CheckCircle2,
  HelpCircle,
  ArrowUpRight,
  Database,
  Lock,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface LandingPageProps {
  onExploreDashboard: () => void;
  onStartAnalyzing: () => void;
  onSelectStock: (symbol: string) => void;
}

const DEMO_HERO_DATA = [
  { time: '09:30', price: 182.4, forecast: null },
  { time: '10:30', price: 184.2, forecast: null },
  { time: '11:30', price: 183.8, forecast: null },
  { time: '12:30', price: 186.5, forecast: null },
  { time: '13:30', price: 188.1, forecast: null },
  { time: '14:30', price: 187.9, forecast: null },
  { time: '15:30', price: 191.2, forecast: 191.2 },
  { time: 'Day +1', price: null, forecast: 194.5 },
  { time: 'Day +3', price: null, forecast: 198.8 },
  { time: 'Day +7', price: null, forecast: 204.2 },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onExploreDashboard,
  onStartAnalyzing,
  onSelectStock,
}) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does StockMind AI generate stock predictions?',
      a: 'We ingest real historical OHLCV data from market providers, compute 17+ technical and quantitative features (lags, momentum, rolling moving averages, RSI, MACD, volatility), perform chronological train/test splitting to prevent temporal data leakage, and train ensemble models (Random Forest and Gradient Boosting) to forecast future price trajectories with empirical confidence intervals.'
    },
    {
      q: 'Does StockMind AI support Indian and US stock markets?',
      a: 'Yes! We support Indian NSE and BSE equities (e.g. RELIANCE.NS, TCS.NS, INFY.NS, HDFCBANK.NS, TATAMOTORS.NS) as well as US equities listed on NASDAQ and NYSE (e.g. AAPL, NVDA, MSFT, TSLA, GOOGL).'
    },
    {
      q: 'Are the predictions guaranteed profits?',
      a: 'No. StockMind AI operates with strict financial integrity. Financial markets are subject to macroeconomic shocks, earnings surprises, and geopolitical dynamics. Our predictions are probabilistic estimates derived from historical price action and technical indicators, accompanied by transparent confidence intervals, out-of-sample evaluation metrics (MAE, RMSE, MAPE), and baseline comparisons.'
    },
    {
      q: 'Do I need an API key to test the platform?',
      a: 'No API key is required to explore! The system connects to public market data out-of-the-box, features a pre-seeded Demo Investor account, and works without any external registration.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Glow Backdrops */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-violet-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Next-Gen Financial Intelligence Engine 2.0</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Make Smarter Investment Decisions with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
            AI
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Analyze stock market trends, understand market movements, and explore AI-powered stock predictions.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onExploreDashboard}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Explore Dashboard</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onStartAnalyzing}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 hover:border-indigo-500/40 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center space-x-2"
          >
            <LineChart className="w-4 h-4 text-indigo-400" />
            <span>Start Analyzing</span>
          </button>
        </div>

        {/* Quick Tickers Carousel Bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-500 mr-2">Popular quick picks:</span>
          {['RELIANCE.NS', 'TCS.NS', 'NVDA', 'AAPL', 'MSFT', 'INFY.NS'].map((sym) => (
            <button
              key={sym}
              onClick={() => onSelectStock(sym)}
              className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-white/5 hover:border-indigo-500/30 text-slate-300 hover:text-white transition-all font-mono"
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Hero Interactive Chart Demo Card */}
        <div className="mt-14 max-w-4xl mx-auto rounded-2xl bg-[#0f172a]/80 border border-white/10 shadow-2xl p-6 glass-panel text-left">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-white">NVDA • NVIDIA Corporation</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI Bullish Horizon
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                NASDAQ • Currency: USD • Model: Random Forest Regressor
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold font-mono text-emerald-400">$191.20</div>
              <div className="text-xs text-emerald-400 font-semibold">+6.8% Expected Target: $204.20</div>
            </div>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DEMO_HERO_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const val = item.price || item.forecast;
                      return (
                        <div className="bg-slate-900 border border-white/10 p-2.5 rounded-lg text-xs shadow-xl">
                          <span className="text-slate-400">{label}: </span>
                          <span className="font-bold font-mono text-white">${val}</span>
                          {item.forecast && <span className="ml-1 text-emerald-400 font-medium">(AI Forecast)</span>}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} fill="url(#heroGradient)" connectNulls />
                <Area type="monotone" dataKey="forecast" stroke="#818CF8" strokeWidth={2.5} strokeDasharray="4 3" fill="transparent" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5">
            <span>Historical bars: Solid Green</span>
            <span className="text-indigo-400 font-semibold">AI Predictive Horizon: Dashed Purple</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
            Engine Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Built for Quantitative Precision & Rigor
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Unlike superficial charting widgets, StockMind AI applies full-stack algorithmic modeling and machine learning pipelines to live financial data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-white/10 hover:border-indigo-500/40 transition-all glass-card">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-5">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Machine Learning Regressors</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trained on actual historical stock price sequences using chronological train/test splitting. Out-of-sample evaluated with MAE, RMSE, MAPE, and baseline persistence models.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-white/10 hover:border-indigo-500/40 transition-all glass-card">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Deep Technical Synthesis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instant calculation of SMA 20/50/200, EMA 12/26, 14-period RSI, MACD histograms, Bollinger volatility channels, and automated support/resistance pivot levels.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-white/10 hover:border-indigo-500/40 transition-all glass-card">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Portfolio Analytics & Watchlist</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track multi-asset portfolios across Indian & US equities with real-time profit & loss calculations, cost basis tracking, and asset allocation breakdown.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-2">
            The Pipeline
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">How It Works in 3 Steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 relative">
            <div className="text-4xl font-extrabold text-indigo-500/20 mb-3">01</div>
            <h4 className="text-base font-bold text-white mb-2">Data Ingestion & Cleaning</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live quote feeds and multi-year historical bars are ingested for NSE, BSE, and US tickers with strict time-series integrity checks and zero-imputation safeguards.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 relative">
            <div className="text-4xl font-extrabold text-violet-500/20 mb-3">02</div>
            <h4 className="text-base font-bold text-white mb-2">Feature Engineering</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              17+ quantitative parameters (lags, momentum returns, rolling volatility, spreads, RSI, MACD) are generated without future data leakage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/5 relative">
            <div className="text-4xl font-extrabold text-emerald-500/20 mb-3">03</div>
            <h4 className="text-base font-bold text-white mb-2">AI Forecast & Uncertainty</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Predictive models forecast 1-day, 7-day, or 30-day target trajectories accompanied by 95% uncertainty corridors and directional accuracy benchmarks.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400 mt-2">Everything you need to know about StockMind AI</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl bg-slate-900/60 border border-white/10 overflow-hidden transition-all"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left font-medium text-sm text-white hover:text-indigo-400"
              >
                <span>{faq.q}</span>
                <HelpCircle className="w-4 h-4 text-slate-500 flex-shrink-0 ml-4" />
              </button>
              {activeFaq === i && (
                <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-white/10 bg-[#070a12] py-12 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <Brain className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-white text-sm">StockMind AI</span>
            <span>• Quantitative Machine Learning Market Analytics</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <button onClick={onExploreDashboard} className="hover:text-white transition-colors">
              Dashboard
            </button>
            <button onClick={onStartAnalyzing} className="hover:text-white transition-colors">
              Analysis
            </button>
            <span>v1.0.0 Production Ready</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 text-[11px] text-slate-600 border-t border-white/5 pt-4 text-center md:text-left">
          Disclaimer: StockMind AI provides statistical analysis and mathematical predictive models based on historical financial records. Financial investments carry substantial risk. None of the materials or predictions generated constitute financial or investment advice.
        </div>
      </footer>
    </div>
  );
};

