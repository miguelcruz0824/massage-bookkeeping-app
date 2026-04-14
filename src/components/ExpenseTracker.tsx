import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { expenseCategories } from '@/data/sampleData';
import {
  Plus, X, Package, Home, Shield, Megaphone, GraduationCap, Zap, Wrench, Monitor,
  Receipt, Upload, ArrowUpDown, FileCheck, FileX, Loader2, Trash2
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Package, Home, Shield, Megaphone, GraduationCap, Zap, Wrench, Monitor,
};

const ExpenseTracker: React.FC = () => {
  const { expenses, addExpense, deleteExpenseItem, savingExpense } = useAppContext();
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: 'Supplies', description: '', amount: '', date: new Date().toISOString().split('T')[0], vendor: '', receipt: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredExpenses = useMemo(() => {
    let result = filterCat === 'all' ? expenses : expenses.filter(e => e.category === filterCat);
    result = [...result].sort((a, b) => {
      if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
      return b.amount - a.amount;
    });
    return result;
  }, [expenses, filterCat, sortBy]);

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    return totals;
  }, [expenses]);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;
    if (editingId) {
      await deleteExpenseItem(editingId);
    }
    await addExpense({
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      vendor: formData.vendor,
      receipt: formData.receipt,
    });
    setFormData({ category: 'Supplies', description: '', amount: '', date: new Date().toISOString().split('T')[0], vendor: '', receipt: false });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (expense: any) => {
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
      vendor: expense.vendor,
      receipt: expense.receipt,
    });
    setEditingId(expense.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteExpenseItem(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="text-gray-500 mt-1">Manage and categorize your business expenses &middot; {expenses.length} entries</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Total & Category Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Receipt className="w-4 h-4" />
            {expenses.filter(e => e.receipt).length}/{expenses.length} receipts attached
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {expenseCategories.map(cat => {
            const Icon = iconMap[cat.icon] || Package;
            const amount = categoryTotals[cat.name] || 0;
            const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
            return (
              <button
                key={cat.name}
                onClick={() => setFilterCat(filterCat === cat.name ? 'all' : cat.name)}
                className={`rounded-xl p-3 text-left transition-all border ${
                  filterCat === cat.name ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg ${cat.lightColor} flex items-center justify-center`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 truncate">{cat.name}</span>
                </div>
                <p className="text-sm font-bold text-gray-900">${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1">
                  <div className={`h-1 rounded-full ${cat.color}`} style={{ width: `${pct}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            {filterCat === 'all' ? 'All Expenses' : filterCat}
            <span className="text-sm font-normal text-gray-400 ml-2">({filteredExpenses.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowUpDown className="w-3 h-3" /> {sortBy === 'date' ? 'By Date' : 'By Amount'}
            </button>
            {filterCat !== 'all' && (
              <button onClick={() => setFilterCat('all')} className="text-xs text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors">
                Clear filter
              </button>
            )}
          </div>
        </div>
        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
          {filteredExpenses.map(expense => {
            const catConfig = expenseCategories.find(c => c.name === expense.category);
            const Icon = iconMap[catConfig?.icon || 'Package'] || Package;
            const isDeleting = deletingId === expense.id;
            return (
              <div key={expense.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${catConfig?.lightColor || 'bg-gray-50 text-gray-600'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
                  <p className="text-xs text-gray-400">{expense.vendor} &middot; {expense.date}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {expense.receipt ? (
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <FileX className="w-4 h-4 text-gray-300" />
                  )}
                  <span className="text-sm font-semibold text-red-600">-${expense.amount.toFixed(2)}</span>
                  <button
                    onClick={() => handleEdit(expense)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-50 rounded-lg transition-all"
                    title="Edit expense"
                  >
                    <Receipt className="w-3.5 h-3.5 text-blue-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    disabled={isDeleting}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                    title="Delete expense"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 text-red-400" />}
                  </button>
                </div>
              </div>
            );
          })}
          {filteredExpenses.length === 0 && (
            <div className="py-12 text-center">
              <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No expenses found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
                <select value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400">
                  {expenseCategories.map(c => (<option key={c.name} value={c.name}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="e.g., Massage oils bulk order" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" required />
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
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Vendor</label>
                <input type="text" value={formData.vendor} onChange={e => setFormData(p => ({ ...p, vendor: e.target.value }))} placeholder="e.g., Massage Warehouse" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <Upload className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Attach Receipt</p>
                  <p className="text-xs text-gray-400">Mark as having receipt</p>
                </div>
                <label className="relative cursor-pointer">
                  <input type="checkbox" checked={formData.receipt} onChange={e => setFormData(p => ({ ...p, receipt: e.target.checked }))} className="sr-only peer" />
                  <div className="w-10 h-6 bg-gray-200 peer-checked:bg-emerald-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4 after:shadow-sm" />
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={savingExpense} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                  {savingExpense && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingExpense ? 'Saving...' : editingId ? 'Save Changes' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;
