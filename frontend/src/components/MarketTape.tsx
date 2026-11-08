import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../services/api';
import { IndexQuote } from '../types';

export const MarketTape: React.FC = () => {
  const [indices, setIndices] = useState<IndexQuote[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchTape = async () => {
      try {
        const res = await api.getMarketOverview();
        if (isMounted) setIndices(res.indices);
      } catch (err) {
        console.error('Ticker tape fetch error:', err);
      }
    };

    fetchTape();
    const interval = setInterval(fetchTape, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (indices.length === 0) return null;

  return (
    <div className="w-full bg-[#0d1322] border-b border-white/5 py-1.5 px-4 overflow-hidden text-xs select-none">
      <div className="flex items-center space-x-8 animate-marquee whitespace-nowrap">
        {indices.map((idx) => {
          const isPos = idx.change_percent >= 0;
          return (
            <div key={idx.symbol} className="inline-flex items-center space-x-2">
              <span className="font-semibold text-slate-300">{idx.name}</span>
              <span className="text-slate-100 font-mono">
                {idx.currency === 'INR' ? '₹' : '$'}
                {idx.current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`inline-flex items-center text-[11px] font-medium ${
                  isPos ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPos ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                {isPos ? '+' : ''}
                {idx.change_percent}%
              </span>
              <span className="text-slate-600">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

