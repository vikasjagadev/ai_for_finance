import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Line,
  ComposedChart
} from 'recharts';
import { HistoricalDataPoint } from '../types';

interface StockChartProps {
  data: HistoricalDataPoint[];
  symbol: string;
  currency?: string;
  currentPrice?: number;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  isLoading?: boolean;
}

export const StockChart: React.FC<StockChartProps> = ({
  data,
  symbol,
  currency = 'USD',
  currentPrice,
  timeframe,
  onTimeframeChange,
  isLoading = false,
}) => {
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [showSMA20, setShowSMA20] = useState(false);
  const [showSMA50, setShowSMA50] = useState(false);

  // Calculate moving averages if enabled
  const enrichedData = data.map((d, idx) => {
    let sma20 = null;
    let sma50 = null;

    if (showSMA20 && idx >= 19) {
      const slice = data.slice(idx - 19, idx + 1);
      sma20 = slice.reduce((acc, curr) => acc + curr.close, 0) / 20;
    }
    if (showSMA50 && idx >= 49) {
      const slice = data.slice(idx - 49, idx + 1);
      sma50 = slice.reduce((acc, curr) => acc + curr.close, 0) / 50;
    }

    return {
      ...d,
      sma20: sma20 ? Number(sma20.toFixed(2)) : null,
      sma50: sma50 ? Number(sma50.toFixed(2)) : null,
    };
  });

  const isPositive = data.length > 1 ? data[data.length - 1].close >= data[0].close : true;
  const strokeColor = isPositive ? '#10B981' : '#EF4444';
  const fillColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';

  const minPrice = data.length ? Math.min(...data.map((d) => d.low || d.close)) * 0.98 : 0;
  const maxPrice = data.length ? Math.max(...data.map((d) => d.high || d.close)) * 1.02 : 100;

  const timeframes = ['1D', '1W', '1M', '6M', '1Y', '5Y'];

  return (
    <div className="w-full bg-[#111726]/80 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          {/* Chart type toggle */}
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-white/5 text-xs">
            <button
              onClick={() => setChartType('area')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                chartType === 'area' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                chartType === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Line
            </button>
          </div>

          {/* Indicator toggles */}
          <button
            onClick={() => setShowSMA20(!showSMA20)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
              showSMA20
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'text-slate-400 border-white/5 hover:bg-slate-800'
            }`}
          >
            SMA 20
          </button>
          <button
            onClick={() => setShowSMA50(!showSMA50)}
            className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
              showSMA50
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'text-slate-400 border-white/5 hover:bg-slate-800'
            }`}
          >
            SMA 50
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="relative h-80 w-full">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs z-10 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs text-slate-400">Loading market feeds...</span>
            </div>
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={enrichedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="stockAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickFormatter={(val) => val.slice(5)}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${currency === 'INR' ? '₹' : '$'}${v.toFixed(0)}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as HistoricalDataPoint & { sma20?: number; sma50?: number };
                  return (
                    <div className="bg-slate-900/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs">
                      <div className="text-slate-400 font-medium mb-1">{label}</div>
                      <div className="flex items-center justify-between space-x-4">
                        <span className="text-slate-300">Close:</span>
                        <span className="font-bold text-white font-mono">
                          {currency === 'INR' ? '₹' : '$'}{item.close.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between space-x-4 text-[11px] text-slate-400 mt-1">
                        <span>High: {currency === 'INR' ? '₹' : '$'}{item.high?.toFixed(2)}</span>
                        <span>Low: {currency === 'INR' ? '₹' : '$'}{item.low?.toFixed(2)}</span>
                      </div>
                      {item.volume ? (
                        <div className="text-[11px] text-slate-400 mt-1">
                          Vol: {item.volume.toLocaleString()}
                        </div>
                      ) : null}
                      {item.sma20 ? (
                        <div className="text-[11px] text-amber-400 mt-0.5">
                          SMA 20: {currency === 'INR' ? '₹' : '$'}{item.sma20.toFixed(2)}
                        </div>
                      ) : null}
                      {item.sma50 ? (
                        <div className="text-[11px] text-purple-400 mt-0.5">
                          SMA 50: {currency === 'INR' ? '₹' : '$'}{item.sma50.toFixed(2)}
                        </div>
                      ) : null}
                    </div>
                  );
                }
                return null;
              }}
            />
            {chartType === 'area' ? (
              <Area
                type="monotone"
                dataKey="close"
                stroke={strokeColor}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#stockAreaGradient)"
              />
            ) : (
              <Line
                type="monotone"
                dataKey="close"
                stroke={strokeColor}
                strokeWidth={2}
                dot={false}
              />
            )}
            {showSMA20 && (
              <Line
                type="monotone"
                dataKey="sma20"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
              />
            )}
            {showSMA50 && (
              <Line
                type="monotone"
                dataKey="sma50"
                stroke="#A855F7"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Sub-Bar */}
      <div className="h-16 w-full mt-2 pt-2 border-t border-white/5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={enrichedData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <XAxis dataKey="date" hide />
            <YAxis hide />
            <Bar dataKey="volume" fill="#3B82F6" opacity={0.35} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

