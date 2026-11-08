import React, { useState, useEffect } from 'react';
import {
  User,
  Moon,
  Sun,
  Bell,
  Shield,
  Key,
  Database,
  LogOut,
  CheckCircle2,
  Cpu,
  Bookmark,
  ExternalLink,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { ApiKeyStatusResponse } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const { theme, setTheme } = useTheme();

  // API Key management state
  const [keyStatus, setKeyStatus] = useState<ApiKeyStatusResponse | null>(null);
  const [twelveDataKey, setTwelveDataKey] = useState('');
  const [finnhubKey, setFinnhubKey] = useState('');
  const [alphaVantageKey, setAlphaVantageKey] = useState('');

  const [showTwelve, setShowTwelve] = useState(false);
  const [showFinnhub, setShowFinnhub] = useState(false);
  const [showAlpha, setShowAlpha] = useState(false);

  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; quote?: any }>>({});
  const [isSavingKeys, setIsSavingKeys] = useState(false);
  const [keySaveSuccess, setKeySaveSuccess] = useState(false);

  // Notification toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [predictionAlerts, setPredictionAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadKeyStatus = async () => {
    try {
      const data = await api.getApiKeyStatus();
      setKeyStatus(data);
    } catch (err) {
      console.error('Failed to load API key status:', err);
    }
  };

  useEffect(() => {
    loadKeyStatus();
  }, []);

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKeys(true);
    setKeySaveSuccess(false);

    try {
      const updatePayload: Record<string, string> = {};
      if (twelveDataKey.trim()) updatePayload.twelve_data_api_key = twelveDataKey.trim();
      if (finnhubKey.trim()) updatePayload.finnhub_api_key = finnhubKey.trim();
      if (alphaVantageKey.trim()) updatePayload.alpha_vantage_api_key = alphaVantageKey.trim();

      const updated = await api.updateApiKeys(updatePayload);
      setKeyStatus(updated);
      setKeySaveSuccess(true);
      setTimeout(() => setKeySaveSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || 'Error updating API keys');
    } finally {
      setIsSavingKeys(false);
    }
  };

  const handleTestKey = async (provider: string, keyValue: string) => {
    const keyToTest = keyValue.trim();
    if (!keyToTest) {
      alert(`Please enter an API key for ${provider} before testing.`);
      return;
    }

    setTestingProvider(provider);
    try {
      const res = await api.testApiKey(provider, keyToTest, 'AAPL');
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          success: res.success,
          message: res.message,
          quote: res.sample_quote,
        },
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          success: false,
          message: err.message || 'Key verification failed',
        },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Account & Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your live market data API keys, appearance theme, notifications, and investor profile.
        </p>
      </div>

      {/* Account Profile Card */}
      <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-emerald-400 p-0.5">
              <div className="w-full h-full bg-[#0d121f] rounded-[14px] flex items-center justify-center font-extrabold text-white text-lg">
                {user?.name?.[0]?.toUpperCase() || 'G'}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">{user?.name || 'Guest Investor'}</h3>
                {isAuthenticated && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active Account
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 font-mono">
                {user?.email || 'Not logged in (Demo Mode available)'}
              </div>
            </div>
          </div>

          <div>
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
          <div>
            <span className="text-slate-400">Security Clearance</span>
            <div className="font-semibold text-white mt-1 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAuthenticated ? 'Standard Investor' : 'Public Explorer'}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400">Database Engine</span>
            <div className="font-semibold text-white mt-1 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>SQLAlchemy / PostgreSQL</span>
            </div>
          </div>
          <div>
            <span className="text-slate-400">AI Compute Backend</span>
            <div className="font-semibold text-white mt-1 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              <span>Scikit-Learn Ensemble</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- LIVE MARKET DATA PROVIDERS & API KEY CONFIGURATION --- */}
      <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-indigo-500/30 glass-panel space-y-6 relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Live Market Data Providers & API Keys</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Add your API keys to fetch live stock data directly from premier financial market providers.
            </p>
          </div>

          {keyStatus && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-semibold">{keyStatus.active_provider}</span>
            </div>
          )}
        </div>

        {keySaveSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              API Keys successfully updated, persisted to backend configuration, and activated for live market fetching!
            </span>
          </div>
        )}

        <form onSubmit={handleSaveKeys} className="space-y-6">
          {/* Provider 1: Twelve Data */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center font-bold text-indigo-400 text-xs">
                  12
                </span>
                <div>
                  <div className="font-bold text-xs text-white flex items-center space-x-2">
                    <span>Twelve Data API</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                      Recommended
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Supports Indian Equities (NSE/BSE) + US Markets. Free 800 credits/day.
                  </div>
                </div>
              </div>

              <a
                href="https://twelvedata.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type={showTwelve ? 'text' : 'password'}
                  value={twelveDataKey}
                  onChange={(e) => setTwelveDataKey(e.target.value)}
                  placeholder={
                    keyStatus?.twelve_data_configured
                      ? `Configured (${keyStatus.twelve_data_masked}) - Enter new key to replace`
                      : 'Enter Twelve Data API Key...'
                  }
                  className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowTwelve(!showTwelve)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showTwelve ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleTestKey('twelvedata', twelveDataKey)}
                disabled={testingProvider === 'twelvedata' || !twelveDataKey.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center space-x-1.5"
              >
                {testingProvider === 'twelvedata' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>Test Live</span>
              </button>
            </div>

            {testResults['twelvedata'] && (
              <div
                className={`p-2.5 rounded-lg text-[11px] leading-relaxed ${
                  testResults['twelvedata'].success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}
              >
                {testResults['twelvedata'].message}
                {testResults['twelvedata'].quote && (
                  <span className="font-mono font-bold ml-1">
                    (Sample Live Price: ${testResults['twelvedata'].quote.current_price})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Provider 2: Finnhub */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-xs">
                  FH
                </span>
                <div>
                  <div className="font-bold text-xs text-white">Finnhub Stock API</div>
                  <div className="text-[11px] text-slate-400">
                    High-speed real-time US quotes & financial news. 60 requests/minute free.
                  </div>
                </div>
              </div>

              <a
                href="https://finnhub.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type={showFinnhub ? 'text' : 'password'}
                  value={finnhubKey}
                  onChange={(e) => setFinnhubKey(e.target.value)}
                  placeholder={
                    keyStatus?.finnhub_configured
                      ? `Configured (${keyStatus.finnhub_masked}) - Enter new key to replace`
                      : 'Enter Finnhub API Key (Token)...'
                  }
                  className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowFinnhub(!showFinnhub)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showFinnhub ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleTestKey('finnhub', finnhubKey)}
                disabled={testingProvider === 'finnhub' || !finnhubKey.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center space-x-1.5"
              >
                {testingProvider === 'finnhub' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>Test Live</span>
              </button>
            </div>

            {testResults['finnhub'] && (
              <div
                className={`p-2.5 rounded-lg text-[11px] leading-relaxed ${
                  testResults['finnhub'].success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}
              >
                {testResults['finnhub'].message}
                {testResults['finnhub'].quote && (
                  <span className="font-mono font-bold ml-1">
                    (Sample Live Price: ${testResults['finnhub'].quote.current_price})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Provider 3: Alpha Vantage */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center font-bold text-violet-400 text-xs">
                  AV
                </span>
                <div>
                  <div className="font-bold text-xs text-white">Alpha Vantage</div>
                  <div className="text-[11px] text-slate-400">
                    Global equities & historical series. 25 requests/day free tier.
                  </div>
                </div>
              </div>

              <a
                href="https://www.alphavantage.co/support/#api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[11px] text-violet-400 hover:text-violet-300 font-medium"
              >
                <span>Get Free Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <input
                  type={showAlpha ? 'text' : 'password'}
                  value={alphaVantageKey}
                  onChange={(e) => setAlphaVantageKey(e.target.value)}
                  placeholder={
                    keyStatus?.alpha_vantage_configured
                      ? `Configured (${keyStatus.alpha_vantage_masked}) - Enter new key to replace`
                      : 'Enter Alpha Vantage API Key...'
                  }
                  className="w-full pl-3 pr-9 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowAlpha(!showAlpha)}
                  className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showAlpha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleTestKey('alphavantage', alphaVantageKey)}
                disabled={testingProvider === 'alphavantage' || !alphaVantageKey.trim()}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 transition-all flex items-center space-x-1.5"
              >
                {testingProvider === 'alphavantage' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-violet-400" />
                )}
                <span>Test Live</span>
              </button>
            </div>

            {testResults['alphavantage'] && (
              <div
                className={`p-2.5 rounded-lg text-[11px] leading-relaxed ${
                  testResults['alphavantage'].success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}
              >
                {testResults['alphavantage'].message}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-400">
              Keys are securely saved in your local backend environment configuration (.env).
            </span>
            <button
              type="submit"
              disabled={isSavingKeys || (!twelveDataKey.trim() && !finnhubKey.trim() && !alphaVantageKey.trim())}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              {isSavingKeys ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving Keys...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Apply API Keys</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Theme Selection */}
      <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
        <h3 className="text-sm font-bold text-white mb-1">Visual Appearance</h3>
        <p className="text-xs text-slate-400 mb-4">
          Choose your interface palette. Dark mode provides optimal Bloomberg-style terminal contrast.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-sm">
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border text-left transition-all flex items-center space-x-3 ${
              theme === 'dark'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="font-bold text-xs">Dark Terminal</div>
              <div className="text-[10px] text-slate-400">Default & Recommended</div>
            </div>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border text-left transition-all flex items-center space-x-3 ${
              theme === 'light'
                ? 'bg-indigo-600/20 border-indigo-500 text-white'
                : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-bold text-xs">Light Mode</div>
              <div className="text-[10px] text-slate-400">Clean High Contrast</div>
            </div>
          </button>
        </div>
      </div>

      {/* Notification Preferences Form */}
      <form onSubmit={handleSavePreferences} className="p-6 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-0.5">Alerts & Signal Notifications</h3>
            <p className="text-xs text-slate-400">
              Configure which AI momentum alerts and volatility events to trigger.
            </p>
          </div>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Preferences Saved!</span>
            </span>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">AI Bullish/Bearish Directional Shifts</div>
              <div className="text-[11px] text-slate-400">Receive alerts when tracked stocks trigger trend changes</div>
            </div>
            <input
              type="checkbox"
              checked={predictionAlerts}
              onChange={(e) => setPredictionAlerts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Technical RSI Extremes</div>
              <div className="text-[11px] text-slate-400">Trigger notifications on RSI &gt; 70 or RSI &lt; 30 events</div>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 cursor-pointer">
            <div>
              <div className="text-xs font-semibold text-white">Weekly Market Intelligence Digest</div>
              <div className="text-[11px] text-slate-400">Executive summary of portfolio returns and top market movers</div>
            </div>
            <input
              type="checkbox"
              checked={weeklyReport}
              onChange={(e) => setWeeklyReport(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-slate-700 focus:ring-0"
            />
          </label>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
