import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, Building2, Globe, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { StockSearchResult } from '../types';

interface StockSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStock: (symbol: string) => void;
}

export const StockSearchModal: React.FC<StockSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectStock,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      search('');
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const search = async (q: string) => {
    setIsLoading(true);
    try {
      const data = await api.searchStocks(q);
      setResults(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isOpen) search(query);
    }, 250);
    return () => clearTimeout(handler);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-slate-900/60">
          <Search className="w-5 h-5 text-indigo-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol (e.g. RELIANCE, TCS, AAPL, NVDA) or company name..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white rounded-lg mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded border border-white/5"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p>Searching global equity databases...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                {query ? 'Search Results' : 'Trending & Popular Equities'}
              </div>
              {results.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => {
                    onSelectStock(stock.symbol);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group text-left border border-transparent hover:border-white/5"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xs">
                      {stock.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                          {stock.symbol}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-slate-800 text-slate-300 border border-white/5">
                          {stock.exchange}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {stock.currency}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-sm">
                        {stock.name} {stock.sector ? `• ${stock.sector}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-400 group-hover:text-indigo-400 transition-colors">
                    <span className="text-xs font-medium hidden sm:inline">Analyze</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>No stocks found matching "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching by NSE symbol (e.g. INFY.NS), US ticker (e.g. MSFT), or company name.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

