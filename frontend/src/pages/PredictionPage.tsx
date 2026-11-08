import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Cpu,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  Search,
  RefreshCw,
  Sliders,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { PredictionResponse } from '../types';
import { PredictionChart } from '../components/PredictionChart';

interface PredictionPageProps {
  initialSymbol?: string;
}

export const PredictionPage: React.FC<PredictionPageProps> = ({ initialSymbol = 'NVDA' }) => {
  const [symbol, setSymbol] = useState(initialSymbol);
  const [symbolInput, setSymbolInput] = useState('');
  const [period, setPeriod] = useState('2y');
  const [horizon, setHorizon] = useState('7d');
  const [modelType, setModelType] = useState('random_forest');

  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialSymbol) {
      setSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  const handleRunPrediction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!symbol.trim()) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await api.createPrediction(symbol.trim().toUpperCase(), period, horizon, modelType);
      setPrediction(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Prediction execution failed. Please verify the stock ticker and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial prediction once on mount or when symbol changes
  useEffect(() => {
    handleRunPrediction();
  }, [symbol]);

  const handleCustomSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (symbolInput.trim()) {
      setSymbol(symbolInput.trim().toUpperCase());
      setSymbolInput('');
    }
  };

  const isPos = prediction ? prediction.expected_change_percent >= 0 : true;
  const currency = symbol.includes('.NS') || symbol.includes('.BO') ? 'INR' : 'USD';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Empirical Machine Learning Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          AI Stock Prediction & Uncertainty Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Trained on real chronological market sequences without lookahead bias. Evaluated against naïve persistence benchmarks with empirical 95% confidence corridors.
        </p>
      </div>

      {/* Control Panel: Symbol, Training Period, Horizon, Algorithm */}
      <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel space-y-6">
        {/* Top: Preset tickers & Custom Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Target Stock:</span>
            {['NVDA', 'RELIANCE.NS', 'AAPL', 'TCS.NS', 'MSFT', 'INFY.NS', 'TSLA'].map((s) => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  symbol === s
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handleCustomSymbol} className="flex items-center space-x-2 w-full md:w-auto">
            <input
              type="text"
              value={symbolInput}
              onChange={(e) => setSymbolInput(e.target.value)}
              placeholder="Other symbol (e.g. TATAMOTORS.NS)..."
              className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full md:w-56"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-white/10"
            >
              Select
            </button>
          </form>
        </div>

        {/* Bottom Options: Horizon, History, Model, and Predict Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Prediction Horizon */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Forecast Horizon</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/5">
              {[
                { id: '1d', label: '1 Day' },
                { id: '7d', label: '7 Days' },
                { id: '30d', label: '30 Days' },
              ].map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setHorizon(h.id)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    horizon === h.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Historical Training Data Period */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-violet-400" />
              <span>Training History Sample</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/5">
              {[
                { id: '1y', label: '1 Year' },
                { id: '2y', label: '2 Years' },
                { id: '5y', label: '5 Years' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    period === p.id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Machine Learning Model Architecture */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>ML Algorithm</span>
            </label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full py-2 px-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="random_forest">Random Forest Regressor (Ensemble)</option>
              <option value="gradient_boosting">Gradient Boosting (XGBoost Architecture)</option>
              <option value="linear_baseline">Ridge Linear Benchmark</option>
            </select>
          </div>

          {/* Predict Action Button */}
          <div className="flex items-end">
            <button
              onClick={() => handleRunPrediction()}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Training & Predicting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Train & Predict Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error state if training failed */}
      {errorMsg && (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-white mb-1">Model Execution Issue</h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {/* Output Results Section */}
      {prediction && !isLoading && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Key Results Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Price vs Predicted Price */}
            <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Forecast Target ({prediction.prediction_horizon.toUpperCase()})
              </div>
              <div className="text-3xl font-extrabold font-mono text-white mt-1">
                {currency === 'INR' ? '₹' : '$'}{prediction.predicted_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 mt-2 pt-2 border-t border-white/5">
                <span>Current Price:</span>
                <span className="font-mono text-white font-semibold">
                  {currency === 'INR' ? '₹' : '$'}{prediction.current_price}
                </span>
              </div>
            </div>

            {/* Expected Movement % & Trend Badge */}
            <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Expected Trajectory
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    prediction.trend === 'Bullish'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : prediction.trend === 'Bearish'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {prediction.trend} Trend
                </span>
              </div>

              <div
                className={`text-3xl font-extrabold font-mono mt-1 ${
                  isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPos ? '+' : ''}{prediction.expected_change_percent}%
              </div>

              <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-white/5 font-mono">
                Nominal Delta: {isPos ? '+' : ''}{currency === 'INR' ? '₹' : '$'}{prediction.expected_change}
              </div>
            </div>

            {/* 95% Confidence Corridor */}
            <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                95% Empirical Uncertainty
              </div>
              <div className="text-lg font-bold font-mono text-indigo-300 mt-1">
                {currency === 'INR' ? '₹' : '$'}{prediction.confidence_interval.lower_bound} - {currency === 'INR' ? '₹' : '$'}{prediction.confidence_interval.upper_bound}
              </div>
              <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-white/5">
                Residual std dev: ±{prediction.confidence_interval.residual_std}
              </div>
            </div>

            {/* Directional Accuracy */}
            <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Out-of-Sample Accuracy
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-1">
                {prediction.metrics.directional_accuracy_percent}%
              </div>
              <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-white/5">
                Test Set MAE: {currency === 'INR' ? '₹' : '$'}{prediction.metrics.mae} (vs {prediction.metrics.baseline_mae} Baseline)
              </div>
            </div>
          </div>

          {/* Combined Visual Chart */}
          <PredictionChart
            historicalData={prediction.historical_chart}
            forecastData={prediction.forecast_points}
            currentPrice={prediction.current_price}
            currency={currency}
            trend={prediction.trend}
          />

          {/* Model Evaluation Metrics & Rigor Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rigorous Metrics Table (2 cols) */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Out-of-Sample Empirical Evaluation</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tested against chronological holdout test data to avoid lookahead leakage.
                  </p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {prediction.model_name}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3 rounded-l-lg">Metric Name</th>
                      <th className="py-2.5 px-3">StockMind Model</th>
                      <th className="py-2.5 px-3">Naïve Persistence Baseline</th>
                      <th className="py-2.5 px-3 rounded-r-lg">Mathematical Significance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    <tr>
                      <td className="py-3 px-3 text-slate-300 font-sans font-medium">MAE (Mean Absolute Error)</td>
                      <td className="py-3 px-3 font-bold text-white">{currency === 'INR' ? '₹' : '$'}{prediction.metrics.mae}</td>
                      <td className="py-3 px-3 text-slate-400">{currency === 'INR' ? '₹' : '$'}{prediction.metrics.baseline_mae}</td>
                      <td className="py-3 px-3 text-emerald-400 font-sans">
                        {prediction.metrics.mae <= prediction.metrics.baseline_mae ? '✓ Outperforms baseline' : 'Marginal deviation'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-slate-300 font-sans font-medium">RMSE (Root Mean Square Error)</td>
                      <td className="py-3 px-3 font-bold text-white">{currency === 'INR' ? '₹' : '$'}{prediction.metrics.rmse}</td>
                      <td className="py-3 px-3 text-slate-400">—</td>
                      <td className="py-3 px-3 text-slate-400 font-sans">Penalizes large forecast variance</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-slate-300 font-sans font-medium">MAPE (Mean Absolute % Error)</td>
                      <td className="py-3 px-3 font-bold text-indigo-400">{prediction.metrics.mape}%</td>
                      <td className="py-3 px-3 text-slate-400">{prediction.metrics.baseline_mape}%</td>
                      <td className="py-3 px-3 text-slate-400 font-sans">Relative percentage error</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-slate-300 font-sans font-medium">Directional Accuracy</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">{prediction.metrics.directional_accuracy_percent}%</td>
                      <td className="py-3 px-3 text-slate-400">50.0% (Random Coin)</td>
                      <td className="py-3 px-3 text-emerald-400 font-sans">Correct trajectory sign</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 text-slate-300 font-sans font-medium">R² Determination Score</td>
                      <td className="py-3 px-3 font-bold text-white">{prediction.metrics.r2_score}</td>
                      <td className="py-3 px-3 text-slate-400">0.00</td>
                      <td className="py-3 px-3 text-slate-400 font-sans">Variance explained</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Features Used & Transparency Card (1 col) */}
            <div className="p-6 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Feature Engineering Vector</span>
                </h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  17 engineered quantitative predictors fed into the ensemble trees:
                </p>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {prediction.features_used.map((feat) => (
                    <span
                      key={feat}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-white/5"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Timestamp: </span>
                <span>{prediction.generated_at}</span>
              </div>
            </div>
          </div>

          {/* Mandatory Prominent Financial Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3 text-xs text-amber-200">
            <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Official Disclaimer: </span>
              {prediction.disclaimer}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

