import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  X,
  Check,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { api } from '../services/api';
import { PortfolioSummary, PortfolioItem } from '../types';
import { useAuth } from '../context/AuthContext';

export const PortfolioPage: React.FC = () => {
  const { isAuthenticated, openAuthModal, demoLogin } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [symbol, setSymbol] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPortfolio = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getPortfolio();
      setPortfolio(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch portfolio holdings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolio();
    }
  }, [isAuthenticated]);

  const openAddModal = () => {
    setEditingId(null);
    setSymbol('');
    setPurchasePrice('');
    setQuantity('');
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: PortfolioItem) => {
    setEditingId(item.id);
    setSymbol(item.stock_symbol);
    setPurchasePrice(String(item.purchase_price));
    setQuantity(String(item.quantity));
    setPurchaseDate(item.purchase_date);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !purchasePrice || !quantity) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.updateHolding(editingId, {
          purchase_price: parseFloat(purchasePrice),
          quantity: parseFloat(quantity),
          purchase_date: purchaseDate,
          notes: notes,
        });
      } else {
        await api.addHolding(
          symbol.trim().toUpperCase(),
          parseFloat(purchasePrice),
          parseFloat(quantity),
          purchaseDate,
          notes
        );
      }
      setIsModalOpen(false);
      await fetchPortfolio();
    } catch (err: any) {
      alert(err.message || 'Error saving portfolio holding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this position from your portfolio?')) return;
    try {
      await api.deleteHolding(id);
      await fetchPortfolio();
    } catch (err: any) {
      alert(err.message || 'Error deleting holding');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
          <PieIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Institutional Portfolio Tracker</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto mb-6">
          Track multi-currency investment positions, calculate realized/unrealized profit & loss, and monitor asset concentration across Indian and global equities.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => openAuthModal('login')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all"
          >
            Sign In to My Portfolio
          </button>
          <button
            onClick={demoLogin}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-all flex items-center justify-center space-x-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Load Demo Portfolio</span>
          </button>
        </div>
      </div>
    );
  }

  const isPosTotal = portfolio ? portfolio.total_profit_loss >= 0 : true;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Investment Portfolio
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live Evaluation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time mark-to-market performance, cost basis tracking, and asset allocation breakdown.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Position</span>
        </button>
      </div>

      {portfolio && (
        <>
          {/* Summary Metric Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Current Portfolio Value
              </div>
              <div className="text-3xl font-extrabold font-mono text-white mt-1">
                ${portfolio.current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-white/5 font-mono">
                Total Invested: ${portfolio.total_invested.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Total Unrealized Return
              </div>
              <div
                className={`text-3xl font-extrabold font-mono mt-1 ${
                  isPosTotal ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPosTotal ? '+' : ''}${portfolio.total_profit_loss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-xs font-semibold mt-2 pt-2 border-t border-white/5 flex items-center">
                <span className={isPosTotal ? 'text-emerald-400' : 'text-rose-400'}>
                  {isPosTotal ? '+' : ''}{portfolio.profit_loss_percent}% overall return
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Top Performing Asset
              </div>
              <div className="text-xl font-bold font-mono text-white mt-1 truncate">
                {portfolio.top_performer?.symbol || '—'}
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-2 pt-2 border-t border-white/5 font-mono">
                {portfolio.top_performer ? `+${portfolio.top_performer.profit_loss_percent}%` : '—'}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Active Holdings
              </div>
              <div className="text-3xl font-extrabold font-mono text-indigo-400 mt-1">
                {portfolio.holdings_count} Assets
              </div>
              <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-white/5">
                Diversified across exchanges
              </div>
            </div>
          </div>

          {/* Allocation Breakdown Bar */}
          {portfolio.allocation.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-bold text-white flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Asset Concentration & Allocation</span>
                </span>
                <span className="text-slate-400">Total: 100%</span>
              </div>

              {/* Progress stack bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800">
                {portfolio.allocation.map((item, idx) => {
                  const colors = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
                  const c = colors[idx % colors.length];
                  return (
                    <div
                      key={item.symbol}
                      style={{ width: `${item.percent}%`, backgroundColor: c }}
                      title={`${item.symbol}: ${item.percent}%`}
                    />
                  );
                })}
              </div>

              {/* Legend pills */}
              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-white/5 text-[11px]">
                {portfolio.allocation.map((item, idx) => {
                  const colors = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
                  const c = colors[idx % colors.length];
                  return (
                    <div key={item.symbol} className="flex items-center space-x-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                      <span className="text-slate-300 font-mono font-medium">{item.symbol}</span>
                      <span className="text-slate-500 font-mono">({item.percent}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Holdings Table */}
          <div className="p-5 rounded-2xl bg-[#0f172a]/80 border border-white/10 glass-panel">
            <h3 className="font-bold text-sm text-white mb-4">Position Holdings Breakdown</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Asset Symbol</th>
                    <th className="py-3 px-3">Quantity</th>
                    <th className="py-3 px-3">Avg Cost</th>
                    <th className="py-3 px-3">Live Price</th>
                    <th className="py-3 px-3">Cost Basis</th>
                    <th className="py-3 px-3">Current Value</th>
                    <th className="py-3 px-3">P&L ($)</th>
                    <th className="py-3 px-3">P&L (%)</th>
                    <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {portfolio.items.map((item) => {
                    const isPos = item.total_profit_loss >= 0;
                    return (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 font-sans">
                          <div className="font-bold text-white font-mono">{item.stock_symbol}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                            {item.company_name}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-white">{item.quantity}</td>
                        <td className="py-3.5 px-3 text-slate-300">
                          {item.currency === 'INR' ? '₹' : '$'}{item.purchase_price}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-white">
                          {item.currency === 'INR' ? '₹' : '$'}{item.current_price}
                        </td>
                        <td className="py-3.5 px-3 text-slate-300">
                          {item.currency === 'INR' ? '₹' : '$'}{item.total_invested.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-white">
                          {item.currency === 'INR' ? '₹' : '$'}{item.current_value.toLocaleString()}
                        </td>
                        <td className={`py-3.5 px-3 font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? '+' : ''}{item.currency === 'INR' ? '₹' : '$'}{item.total_profit_loss.toLocaleString()}
                        </td>
                        <td className={`py-3.5 px-3 font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? '+' : ''}{item.profit_loss_percent}%
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                              title="Edit position"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                              title="Delete position"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Position Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl p-6 glass-panel relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">
              {editingId ? 'Edit Position' : 'Add New Portfolio Position'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Enter execution details for accurate mark-to-market calculations.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ticker Symbol
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g. RELIANCE.NS or AAPL"
                  disabled={!!editingId}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white uppercase focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Investment Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Core long term holding, thesis notes..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{editingId ? 'Update Position' : 'Save Position'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

