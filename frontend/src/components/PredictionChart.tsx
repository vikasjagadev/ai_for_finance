import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { HistoricalDataPoint, PredictedPoint } from '../types';

interface PredictionChartProps {
  historicalData: HistoricalDataPoint[];
  forecastData: PredictedPoint[];
  currentPrice: number;
  currency?: string;
  trend: 'Bullish' | 'Bearish' | 'Neutral';
}

export const PredictionChart: React.FC<PredictionChartProps> = ({
  historicalData,
  forecastData,
  currentPrice,
  currency = 'USD',
  trend,
}) => {
  // Combine historical and forecast into a unified chronological series
  // We take the last 45 bars of history for visual context
  const recentHistory = historicalData.slice(-45);

  const combined = [
    ...recentHistory.map((h) => ({
      date: h.date,
      type: 'historical' as const,
      historicalPrice: h.close,
      predictedPrice: null as number | null,
      confidenceLower: null as number | null,
      confidenceUpper: null as number | null,
    })),
    // Connect point: today's latest close serves as the bridge
    ...(recentHistory.length > 0 && forecastData.length > 0
      ? [
          {
            date: recentHistory[recentHistory.length - 1].date,
            type: 'bridge' as const,
            historicalPrice: recentHistory[recentHistory.length - 1].close,
            predictedPrice: recentHistory[recentHistory.length - 1].close,
            confidenceLower: recentHistory[recentHistory.length - 1].close,
            confidenceUpper: recentHistory[recentHistory.length - 1].close,
          },
        ]
      : []),
    ...forecastData.map((f) => ({
      date: f.date,
      type: 'forecast' as const,
      historicalPrice: null as number | null,
      predictedPrice: f.price,
      confidenceLower: f.confidence_lower,
      confidenceUpper: f.confidence_upper,
    })),
  ];

  const trendColor = trend === 'Bullish' ? '#10B981' : trend === 'Bearish' ? '#EF4444' : '#60A5FA';
  const splitDate = recentHistory.length ? recentHistory[recentHistory.length - 1].date : '';

  // Min and max for domain
  const allPrices = [
    ...recentHistory.map((h) => h.close),
    ...forecastData.flatMap((f) => [f.price, f.confidence_lower, f.confidence_upper]),
  ].filter((p) => p !== null && !isNaN(p));

  const minVal = allPrices.length ? Math.min(...allPrices) * 0.95 : 0;
  const maxVal = allPrices.length ? Math.max(...allPrices) * 1.05 : 100;

  return (
    <div className="w-full bg-[#111726]/90 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            Machine Learning Trajectory
          </div>
          <h3 className="text-lg font-bold text-white">Historical Path vs. Out-of-Sample Forecast</h3>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 bg-slate-400 inline-block" />
            <span className="text-slate-300">Historical Price</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-0.5 border-t border-dashed inline-block" style={{ borderColor: trendColor }} />
            <span className="text-slate-300">AI Expected Target</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded bg-indigo-500/20 border border-indigo-500/30 inline-block" />
            <span className="text-slate-300">95% Uncertainty Corridor</span>
          </div>
        </div>
      </div>

      <div className="h-88 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={combined} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="forecastBandGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis
              domain={[minVal, maxVal]}
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${currency === 'INR' ? '₹' : '$'}${v.toFixed(0)}`}
            />
            {splitDate && (
              <ReferenceLine
                x={splitDate}
                stroke="#818CF8"
                strokeDasharray="3 3"
                label={{
                  value: 'TODAY / FORECAST CUTOFF',
                  position: 'top',
                  fill: '#818CF8',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload;
                  const isHistorical = dataPoint.historicalPrice !== null && dataPoint.predictedPrice === null;
                  return (
                    <div className="bg-slate-900/95 border border-white/10 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs">
                      <div className="flex items-center justify-between mb-1 text-slate-400">
                        <span>{label}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            isHistorical ? 'bg-slate-800 text-slate-300' : 'bg-indigo-500/20 text-indigo-300'
                          }`}
                        >
                          {isHistorical ? 'Historical Bar' : 'AI Forecast'}
                        </span>
                      </div>

                      {isHistorical ? (
                        <div className="text-white font-mono font-bold text-sm">
                          {currency === 'INR' ? '₹' : '$'}{dataPoint.historicalPrice?.toFixed(2)}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between space-x-4">
                            <span className="text-slate-300">Predicted Price:</span>
                            <span className="font-bold text-indigo-400 font-mono text-sm">
                              {currency === 'INR' ? '₹' : '$'}{dataPoint.predictedPrice?.toFixed(2)}
                            </span>
                          </div>
                          {dataPoint.confidenceUpper !== null && (
                            <div className="text-[11px] text-slate-400 flex items-center justify-between space-x-3">
                              <span>95% High:</span>
                              <span className="font-mono text-emerald-400">
                                {currency === 'INR' ? '₹' : '$'}{dataPoint.confidenceUpper?.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {dataPoint.confidenceLower !== null && (
                            <div className="text-[11px] text-slate-400 flex items-center justify-between space-x-3">
                              <span>95% Low:</span>
                              <span className="font-mono text-rose-400">
                                {currency === 'INR' ? '₹' : '$'}{dataPoint.confidenceLower?.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Shaded Upper Uncertainty Band */}
            <Area
              type="monotone"
              dataKey="confidenceUpper"
              stroke="none"
              fill="url(#forecastBandGradient)"
              connectNulls
            />
            {/* Historical line */}
            <Line
              type="monotone"
              dataKey="historicalPrice"
              stroke="#94A3B8"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            {/* Forecast dashed line */}
            <Line
              type="monotone"
              dataKey="predictedPrice"
              stroke={trendColor}
              strokeWidth={2.5}
              strokeDasharray="4 3"
              dot={{ r: 3, fill: trendColor }}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

