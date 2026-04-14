import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { DollarSign, TrendingUp, CreditCard, Gift, Plus, X, Filter, Loader2, Trash2, Edit2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const categoryConfig = {
  services: { label: 'Services', color: '#10b981', icon: DollarSign, bg: 'bg-emerald-50 text-emerald-700' },
  products: { label: 'Products', color: '#8b5cf6', icon: CreditCard, bg: 'bg-purple-50 text-purple-700' },
  tips: { label: 'Tips', color: '#3b82f6', icon: TrendingUp, bg: 'bg-blue-50 text-blue-700' },
  'gift-cards': { label: 'Gift Cards', color: '#f59e0b', icon: Gift, bg: 'bg-amber-50 text-amber-700' },
};

const IncomeTracking: React.FC = () => {
  const { income, addIncome, deleteIncomeItem, savingIncome, clients } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: 'services' as any,
    description: '',
    amount: '',
    clientName: '',
    date: new Date().toISOString().split('T')[0]
  });

  const filteredIncome = useMemo(() => {
    if (filterCat === 'all') return income;
    return income.filter(i => i.category === filterCat);
  }, [income, filterCat]);

  const totals = useMemo(() => {
    const t = { services: 0, products: 0, tips: 0, 'gift-cards': 0 };
    income.forEach(i => { t[i.category] += i.amount; });
    return t;
  }, [income]);

  const grandTotal = Object.values(totals).reduce((s, v) => s + v, 0);

  const pieData = Object.entries(totals).map(([key, value]) => ({
    name: categoryConfig[key as keyof typeof categoryConfig].label,
    value,
    color: categoryConfig[key as keyof typeof categoryConfig].color,
  })).filter(d => d.value > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    if (editingId) {
      await deleteIncomeItem(editingId);
    }
    await addIncome({
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      clientName: formData.clientName || undefined,
    });
    setFormData({ category: 'services', description: '', amount: '', clientName: '', date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (entry: any) => {
    setFormData({
      category: entry.category,
      description: entry.description,
      amount: entry.amount.toString(),
      clientName: entry.clientName || '',
      date: entry.date,
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteIncomeItem(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Income Tracking</h1>
          <p className="text-gray-500 mt-1">Track all revenue streams &middot; {income.length} entries</p>
        </div>
        <button
          onClick={() => { setFormData({ category: 'services', description: '', amount: '', clientName: '', date: new Date().toISOString().split('T')[0] }); setEditingId(null); setShowForm(true); }}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all"
        >
          <Plus className="w-4 h-4" /> Record Income
        </button>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const Icon = config.icon;
          const amount = totals[key as keyof typeof totals];
          const pct = grandTotal > 0 ? ((amount / grandTotal) * 100).toFixed(1) : '0';
          return (
            <div key={key} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-gray-600">{config.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">${amount.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{pct}% of total</p>
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: config.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-gray-600">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-2">
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-emerald-600">${grandTotal.toLocaleString()}</p>
          </div>
        </div>

        {/* Income List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterCat}
                onChange={e => setFilterCat(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">All Categories</option>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
            {filteredIncome.map(entry => {
              const config = categoryConfig[entry.category];
              const Icon = config.icon;
              const isDeleting = deletingId === entry.id;
              return (
                <div key={entry.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{entry.description}</p>
                    <p className="text-xs text-gray-400">{entry.clientName || config.label} &middot; {entry.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">+${entry.amount.toLocaleString()}</span>
                  <button
                    onClick={() => handleEdit(entry)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit entry"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={isDeleting}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                    title="Delete entry"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
                  </button>
                </div>
              );
            })}
            {filteredIncome.length === 0 && (
              <div className="py-12 text-center">
                <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No income entries found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Income Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Income' : 'Record Income'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData(p => ({ ...p, category: e.target.value as any }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
                >
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="e.g., Swedish Massage - 60min" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Amount ($)</label>
                  <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Date</label>
                  <input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Client (optional)</label>
                <select
                  value={formData.clientName}
                  onChange={e => setFormData(p => ({ ...p, clientName: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
                >
                  <option value="">No client / Walk-in</option>
                  {clients.sort((a, b) => a.name.localeCompare(b.name)).map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={savingIncome} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                  {savingIncome && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingIncome ? 'Saving...' : editingId ? 'Save Changes' : 'Save Income'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeTracking;