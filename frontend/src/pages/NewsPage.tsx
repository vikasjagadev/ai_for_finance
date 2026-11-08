import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  ExternalLink,
  Search,
  RefreshCw,
  Clock,
  Building2,
  Globe,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { NewsArticle } from '../types';

export const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filterSymbol, setFilterSymbol] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchNews = async (sym?: string) => {
    setIsLoading(true);
    try {
      const data = await api.getNews(sym);
      setArticles(data);
    } catch (err) {
      console.error('Error fetching financial news:', err);
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(filterSymbol);
  }, [filterSymbol]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterSymbol(searchInput.trim().toUpperCase());
  };

  const handleClearFilter = () => {
    setSearchInput('');
    setFilterSymbol('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Verified Financial News & Wire
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live Feed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time market updates, corporate actions, and earnings announcements directly from financial providers.
          </p>
        </div>

        <button
          onClick={() => fetchNews(filterSymbol)}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh News</span>
        </button>
      </div>

      {/* Filter / Quick Ticker Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/70 border border-white/10 glass-panel flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filter by asset:</span>
          </span>
          <button
            onClick={handleClearFilter}
            className={`px-2.5 py-1 text-xs rounded-lg transition-all font-semibold ${
              filterSymbol === ''
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            All Market News
          </button>
          {['AAPL', 'NVDA', 'RELIANCE.NS', 'TCS.NS', 'MSFT', 'TSLA'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilterSymbol(s);
                setSearchInput(s);
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                filterSymbol === s
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <form onSubmit={handleFilterSubmit} className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Filter by custom symbol..."
            className="px-3 py-1.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-full md:w-56 font-mono"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
          >
            Filter
          </button>
        </form>
      </div>

      {/* News Feed Grid */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Fetching real-time financial wire headlines...</p>
        </div>
      ) : articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#0f172a]/70 border border-white/10 glass-panel hover:border-indigo-500/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5">
                  <span className="font-semibold text-indigo-400 flex items-center space-x-1">
                    <Globe className="w-3 h-3 mr-1" />
                    {item.source}
                  </span>
                  <span className="flex items-center space-x-1 font-mono text-[10px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{item.published_at.slice(0, 16)}</span>
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-3 leading-snug mb-2">
                  {item.title}
                </h3>

                {item.summary && (
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {item.summary}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {item.related_symbols.map((sym) => (
                    <span
                      key={sym}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300 border border-white/5"
                    >
                      {sym}
                    </span>
                  ))}
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  <span>Read Story</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-[#0f172a]/40 border border-white/10 text-center max-w-md mx-auto">
          <Newspaper className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No News Wire Dispatches</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            No live news feeds are currently registered for ticker {filterSymbol || 'this market segment'}.
          </p>
          {filterSymbol && (
            <button
              onClick={handleClearFilter}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500"
            >
              View General Market Wire
            </button>
          )}
        </div>
      )}
    </div>
  );
};

