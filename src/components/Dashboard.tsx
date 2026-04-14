import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import {
  DollarSign, TrendingUp, Users, Clock, CheckCircle2, AlertCircle,
  ArrowUpRight, ArrowDownRight, CreditCard, Banknote, ChevronRight, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { monthlyRevenue } from '@/data/sampleData';

const Dashboard: React.FC = () => {
  const { todayAppts, weekAppts, income, expenses, markAppointmentPaid, setCurrentPage, updatingAppointment } = useAppContext();

  const todayRevenue = todayAppts.filter(a => a.paid).reduce((s, a) => s + a.price + a.tip, 0);
  const weekRevenue = weekAppts.filter(a => a.paid).reduce((s, a) => s + a.price + a.tip, 0);
  const weekServices = weekAppts.filter(a => a.status === 'completed').length;
  const outstandingPayments = weekAppts.filter(a => !a.paid && a.status !== 'cancelled').reduce((s, a) => s + a.price, 0);
  const monthExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const completedToday = todayAppts.filter(a => a.status === 'completed').length;
  const upcomingToday = todayAppts.filter(a => a.status === 'upcoming').length;

  const chartData = monthlyRevenue.map(m => ({
    month: m.month,
    total: m.services + m.products + m.tips + m.giftCards,
    services: m.services,
    other: m.products + m.tips + m.giftCards,
  }));

  const stats = [
    { label: "Today's Revenue", value: `$${todayRevenue.toLocaleString()}`, change: '+12%', up: true, icon: DollarSign, color: 'from-emerald-500 to-teal-400' },
    { label: 'Week Revenue', value: `$${weekRevenue.toLocaleString()}`, change: '+8%', up: true, icon: TrendingUp, color: 'from-blue-500 to-cyan-400' },
    { label: 'Sessions This Week', value: weekServices.toString(), change: '+3', up: true, icon: Users, color: 'from-purple-500 to-violet-400' },
    { label: 'Outstanding', value: `$${outstandingPayments.toLocaleString()}`, change: `${weekAppts.filter(a => !a.paid).length} unpaid`, up: false, icon: AlertCircle, color: 'from-amber-500 to-orange-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Good afternoon, Allison</h1>
          <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — {completedToday} completed, {upcomingToday} upcoming</p>
        </div>
        <button
          onClick={() => setCurrentPage('calendar')}
          className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all"
        >
          View Full Calendar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full ${stat.up ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-3">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <span className="text-xs font-medium text-gray-400">{todayAppts.length} appointments</span>
          </div>
          {todayAppts.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="w-10 h-10 text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No appointments today</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {todayAppts.map(appt => {
                const isUpdating = updatingAppointment === appt.id;
                return (
                  <div key={appt.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                    <div className="text-center w-16 flex-shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{appt.time}</p>
                      <p className="text-xs text-gray-400">{appt.duration}min</p>
                    </div>
                    <div className={`w-1 h-12 rounded-full flex-shrink-0 ${appt.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{appt.clientName}</p>
                      <p className="text-xs text-gray-500">{appt.service}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${appt.color}`}>
                      {appt.service.split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-900">${appt.price}</span>
                      {appt.paid ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      ) : (
                        <button
                          onClick={() => markAppointmentPaid(appt.id)}
                          disabled={isUpdating}
                          className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                          {isUpdating ? 'Saving...' : 'Collect'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions & Revenue Breakdown */}
        <div className="space-y-6">
          {/* Revenue Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Services', amount: todayAppts.filter(a => a.paid).reduce((s, a) => s + a.price, 0), icon: Banknote, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Tips', amount: todayAppts.filter(a => a.paid).reduce((s, a) => s + a.tip, 0), icon: DollarSign, color: 'text-blue-600 bg-blue-50' },
                { label: 'Products', amount: income.filter(i => i.category === 'products' && i.date === '2026-04-01').reduce((s, i) => s + i.amount, 0), icon: CreditCard, color: 'text-purple-600 bg-purple-50' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">${item.amount}</span>
                  </div>
                );
              })}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total</span>
                <span className="text-lg font-bold text-emerald-600">
                  ${todayAppts.filter(a => a.paid).reduce((s, a) => s + a.price + a.tip, 0) + income.filter(i => i.category === 'products' && i.date === '2026-04-01').reduce((s, i) => s + i.amount, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Income', page: 'income' as const, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
                { label: 'Add Expense', page: 'expenses' as const, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { label: 'View Clients', page: 'clients' as const, color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
                { label: 'Reports', page: 'reports' as const, color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(action.page)}
                  className={`px-3 py-3 rounded-xl text-sm font-medium transition-colors ${action.color}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Outstanding Payments */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6">
            <h3 className="text-sm font-semibold text-amber-800 mb-3">Outstanding Payments</h3>
            <div className="space-y-2">
              {weekAppts.filter(a => !a.paid && a.status !== 'cancelled').slice(0, 4).map(a => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 truncate">{a.clientName}</span>
                  <span className="font-semibold text-amber-900">${a.price}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage('income')}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <p className="text-sm text-gray-500 mt-0.5">Last 6 months performance</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> Services</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-teal-300" /> Other</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
              />
              <Bar dataKey="services" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="other" fill="#5eead4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Summary Bar */}
      <div className="bg-gradient-to-r from-[#2d4a3e] to-[#1a3028] rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">March 2026 Summary</h3>
            <p className="text-emerald-300/70 text-sm mt-1">Your best month yet!</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs text-emerald-300/60 uppercase tracking-wider">Gross Income</p>
              <p className="text-2xl font-bold">${income.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-300/60 uppercase tracking-wider">Expenses</p>
              <p className="text-2xl font-bold">${monthExpenses.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-emerald-300/60 uppercase tracking-wider">Net Profit</p>
              <p className="text-2xl font-bold text-emerald-300">${(income.reduce((s, i) => s + i.amount, 0) - monthExpenses).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-emerald-300/60 mb-1.5">
            <span>Monthly goal progress</span>
            <span>${income.reduce((s, i) => s + i.amount, 0).toLocaleString()} / $7,000</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-300 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((income.reduce((s, i) => s + i.amount, 0) / 7000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
