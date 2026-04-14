import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { monthlyRevenue, expenseCategories } from '@/data/sampleData';
import {
  Download, FileText, TrendingUp, TrendingDown, Users, DollarSign,
  Calendar, BarChart3, PieChart as PieChartIcon, ArrowUpRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { toast } from '@/components/ui/use-toast';

const Reports: React.FC = () => {
  const { income, expenses, clients, weekAppts } = useAppContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'tax' | 'clients'>('overview');

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Build real revenue data grouped by month from actual income entries
  const revenueData = useMemo(() => {
    const monthMap: Record<string, { month: string, revenue: number, services: number, products: number, tips: number }> = {};
    income.forEach(i => {
      const date = new Date(i.date);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      if (!monthMap[month]) monthMap[month] = { month, revenue: 0, services: 0, products: 0, tips: 0 };
      monthMap[month].revenue += i.amount;
      if (i.category === 'services') monthMap[month].services += i.amount;
      if (i.category === 'products') monthMap[month].products += i.amount;
      if (i.category === 'tips') monthMap[month].tips += i.amount;
    });
    return Object.values(monthMap);
  }, [income]);

  // Build real profit trend from actual income and expenses
  const profitTrend = useMemo(() => {
    const monthMap: Record<string, { month: string, revenue: number, expenses: number, profit: number }> = {};
    income.forEach(i => {
      const month = new Date(i.date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthMap[month]) monthMap[month] = { month, revenue: 0, expenses: 0, profit: 0 };
      monthMap[month].revenue += i.amount;
    });
    expenses.forEach(e => {
      const month = new Date(e.date).toLocaleDateString('en-US', { month: 'short' });
      if (!monthMap[month]) monthMap[month] = { month, revenue: 0, expenses: 0, profit: 0 };
      monthMap[month].expenses += e.amount;
    });
    Object.values(monthMap).forEach(m => { m.profit = m.revenue - m.expenses; });
    return Object.values(monthMap);
  }, [income, expenses]);

  const taxCategories = useMemo(() => {
    const cats: Record<string, number> = {};
    expenses.forEach(e => { cats[e.category] = (cats[e.category] || 0) + e.amount; });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]);
  }, [expenses]);
  const clientRetention = useMemo(() => {
    const returning = clients.filter(c => c.sessionsCount > 3).length;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const newClients = clients.filter(c => new Date(c.joinDate) > threeMonthsAgo).length;
    const avgSpend = clients.length > 0 ? clients.reduce((s, c) => s + c.totalSpent, 0) / clients.length : 0;
    const avgSessions = clients.length > 0 ? clients.reduce((s, c) => s + c.sessionsCount, 0) / clients.length : 0;
    return { returning, newClients, total: clients.length, avgSpend, avgSessions };
  }, [clients]);


  const retentionData = [
    { month: 'Oct', clients: 12, newClients: 2 },
    { month: 'Nov', clients: 13, newClients: 1 },
    { month: 'Dec', clients: 14, newClients: 2 },
    { month: 'Jan', clients: 15, newClients: 3 },
    { month: 'Feb', clients: 16, newClients: 1 },
    { month: 'Mar', clients: 18, newClients: 2 },
  ];

  const handleExport = (reportType: string) => {
    let csvContent = '';
    
    if (reportType === 'Monthly Summary Report' || reportType === 'Income') {
      csvContent = 'Date,Category,Description,Client,Amount\n';
      income.forEach(i => {
        csvContent += `${i.date},${i.category},"${i.description}","${i.clientName || ''}",${i.amount}\n`;
      });
    } else if (reportType === 'Expenses') {
      csvContent = 'Date,Category,Description,Vendor,Amount,Receipt\n';
      expenses.forEach(e => {
        csvContent += `${e.date},${e.category},"${e.description}","${e.vendor}",${e.amount},${e.receipt ? 'Yes' : 'No'}\n`;
      });
    } else {
      // Tax report - combined
      csvContent = 'INCOME\nDate,Category,Description,Client,Amount\n';
      income.forEach(i => {
        csvContent += `${i.date},${i.category},"${i.description}","${i.clientName || ''}",${i.amount}\n`;
      });
      csvContent += '\nEXPENSES\nDate,Category,Description,Vendor,Amount,Receipt\n';
      expenses.forEach(e => {
        csvContent += `${e.date},${e.category},"${e.description}","${e.vendor}",${e.amount},${e.receipt ? 'Yes' : 'No'}\n`;
      });
      csvContent += `\nSUMMARY\nTotal Income,${totalIncome}\nTotal Expenses,${totalExpenses}\nNet Profit,${netProfit}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType.replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Report Exported! ✅', description: `${reportType} downloaded as CSV file.` });
  };

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'tax' as const, label: 'Tax Report', icon: FileText },
    { id: 'clients' as const, label: 'Client Metrics', icon: Users },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Financial summaries and business insights</p>
        </div>
        <button
          onClick={() => handleExport('Monthly Summary Report')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl p-1 flex gap-1 w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: `$${totalIncome.toLocaleString()}`, sub: 'This period', icon: DollarSign, color: 'from-emerald-500 to-teal-400', trend: '+12%', up: true },
              { label: 'Total Expenses', value: `$${totalExpenses.toLocaleString()}`, sub: 'This period', icon: TrendingDown, color: 'from-red-500 to-rose-400', trend: '+5%', up: false },
              { label: 'Net Profit', value: `$${netProfit.toLocaleString()}`, sub: `${profitMargin}% margin`, icon: TrendingUp, color: 'from-blue-500 to-cyan-400', trend: '+18%', up: true },
              { label: 'Active Clients', value: clients.length.toString(), sub: `${clientRetention.newClients} new`, icon: Users, color: 'from-purple-500 to-violet-400', trend: '+2', up: true },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-0.5 ${stat.up ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                      <ArrowUpRight className={`w-3 h-3 ${!stat.up ? 'rotate-90' : ''}`} />
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                </div>
              );
            })}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend (6 Months)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profit Trend */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Profit & Loss</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitTrend} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Revenue" />
                  <Bar dataKey="expenses" fill="#f87171" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tax Report Tab */}
      {activeTab === 'tax' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#2d4a3e] to-[#1a3028] rounded-2xl p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Tax Summary - Q1 2026</h3>
                <p className="text-emerald-300/70 text-sm mt-1">January - March 2026</p>
              </div>
              <button
                onClick={() => handleExport('Q1 Tax Report')}
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" /> Export for Tax Prep
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-6">
              <div>
                <p className="text-xs text-emerald-300/60 uppercase tracking-wider">Gross Income</p>
                <p className="text-3xl font-bold mt-1">${totalIncome.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-300/60 uppercase tracking-wider">Deductions</p>
                <p className="text-3xl font-bold mt-1">${totalExpenses.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-300/60 uppercase tracking-wider">Taxable Income</p>
                <p className="text-3xl font-bold mt-1 text-emerald-300">${netProfit.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Deductible Expenses by Category */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deductible Expenses by Category</h3>
            <div className="space-y-3">
              {taxCategories.map(([cat, amount]) => {
                const catConfig = expenseCategories.find(c => c.name === cat);
                const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={cat} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium text-gray-700 truncate">{cat}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div className={`h-3 rounded-full ${catConfig?.color || 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-24 text-right">${amount.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 w-12 text-right">{pct.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Total Deductions</span>
              <span className="text-lg font-bold text-gray-900">${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Tax Estimates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Est. Self-Employment Tax', rate: '15.3%', amount: (netProfit * 0.153).toFixed(2), note: 'Social Security + Medicare' },
              { label: 'Est. Federal Income Tax', rate: '22%', amount: (netProfit * 0.22).toFixed(2), note: 'Based on tax bracket' },
              { label: 'Est. State Tax', rate: '5%', amount: (netProfit * 0.05).toFixed(2), note: 'Varies by state' },
            ].map((tax, i) => (
              <div key={i} className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <p className="text-sm font-medium text-amber-800">{tax.label}</p>
                <p className="text-2xl font-bold text-amber-900 mt-2">${tax.amount}</p>
                <p className="text-xs text-amber-600 mt-1">{tax.rate} rate &middot; {tax.note}</p>
              </div>
            ))}
          </div>

          {/* Receipt Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Receipt Tracking</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Receipts attached</span>
                  <span className="font-medium text-gray-900">{expenses.filter(e => e.receipt).length}/{expenses.length}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${(expenses.filter(e => e.receipt).length / expenses.length) * 100}%` }} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Missing receipts</p>
                <p className="text-lg font-bold text-amber-600">{expenses.filter(e => !e.receipt).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Metrics Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          {/* Client Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Clients', value: clientRetention.total, color: 'bg-emerald-50 text-emerald-700' },
              { label: 'Returning', value: clientRetention.returning, color: 'bg-blue-50 text-blue-700' },
              { label: 'New (Q1)', value: clientRetention.newClients, color: 'bg-purple-50 text-purple-700' },
              { label: 'Avg Spend', value: `$${clientRetention.avgSpend.toFixed(0)}`, color: 'bg-amber-50 text-amber-700' },
              { label: 'Avg Sessions', value: clientRetention.avgSessions.toFixed(1), color: 'bg-pink-50 text-pink-700' },
            ].map((stat, i) => (
              <div key={i} className={`rounded-2xl p-5 ${stat.color}`}>
                <p className="text-xs font-medium opacity-70">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Client Growth Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Growth</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
                  <Line type="monotone" dataKey="clients" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Total Clients" />
                  <Line type="monotone" dataKey="newClients" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} name="New Clients" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Top Clients by Revenue</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {[...clients].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 10).map((client, i) => (
                <div key={client.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                  <span className="text-sm font-bold text-gray-300 w-6">#{i + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center text-xs font-semibold text-[#1a3028]">
                    {client.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{client.name}</p>
                    <p className="text-xs text-gray-400">{client.sessionsCount} sessions &middot; {client.preferredService}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">${client.totalSpent.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">${(client.totalSpent / client.sessionsCount).toFixed(0)}/session</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Popularity */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Popularity</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {(() => {
                const serviceCounts: Record<string, number> = {};
                clients.forEach(c => { serviceCounts[c.preferredService] = (serviceCounts[c.preferredService] || 0) + 1; });
                return Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).map(([service, count]) => (
                  <div key={service} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-700">{service}</p>
                    <div className="flex items-end justify-between mt-2">
                      <p className="text-xl font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-400">clients</p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
