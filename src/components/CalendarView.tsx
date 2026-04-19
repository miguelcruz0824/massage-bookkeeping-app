import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Clock, CheckCircle2, CreditCard, User, Loader2, Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Ban } from 'lucide-react';
import type { Appointment } from '@/data/sampleData';

const getWeekDays = (baseDate: Date) => {
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((baseDate.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate().toString(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      full: d,
    };
  });
};

const blankForm = {
  clientId: '',
  clientName: '',
  service: '',
  date: '',
  time: '',
  duration: 60,
  price: 0,
  status: 'upcoming' as Appointment['status'],
  paid: false,
  tip: 0,
  color: '',
  selectedAddons: [] as string[],
};

const CalendarView: React.FC = () => {
  const {
    weekAppts, markAppointmentPaid, updatingAppointment,
    addAppointment, deleteAppointment, editAppointment,
    clients, services, addons, bufferTime, timeBlocks,
  } = useAppContext();

  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);
  const [weekBase, setWeekBase] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [form, setForm] = useState({ ...blankForm });
  const [saving, setSaving] = useState(false);

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // ── Service color helpers ──────────────────────────────────────
  const getServiceColor = (serviceName: string) => {
    const found = services.find(s => serviceName.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]));
    return found?.color || '#6b7280';
  };

  const getServiceColorClass = (serviceName: string) => {
    const colorMap: Record<string, string> = {
      '#10b981': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      '#8b5cf6': 'bg-purple-100 text-purple-700 border-purple-200',
      '#f59e0b': 'bg-amber-100 text-amber-700 border-amber-200',
      '#06b6d4': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      '#ec4899': 'bg-pink-100 text-pink-700 border-pink-200',
      '#3b82f6': 'bg-blue-100 text-blue-700 border-blue-200',
      '#f43f5e': 'bg-rose-100 text-rose-700 border-rose-200',
      '#14b8a6': 'bg-teal-100 text-teal-700 border-teal-200',
      '#e879f9': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
      '#f97316': 'bg-orange-100 text-orange-700 border-orange-200',
      '#22c55e': 'bg-green-100 text-green-700 border-green-200',
    };
    const color = getServiceColor(serviceName);
    return colorMap[color] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // ── Form handlers ──────────────────────────────────────────────
  const handleServiceChange = (serviceName: string) => {
    const service = services.find(s => s.name === serviceName);
    handleFormChange('service', serviceName);
    handleFormChange('color', getServiceColorClass(serviceName));
    if (service?.tiers.length === 1) {
      handleFormChange('duration', service.tiers[0].duration);
      handleFormChange('price', service.tiers[0].price);
    } else {
      handleFormChange('duration', 60);
      handleFormChange('price', 0);
    }
    handleFormChange('selectedAddons', []);
  };

  const handleDurationChange = (duration: number) => {
    const service = services.find(s => s.name === form.service);
    const tier = service?.tiers.find(t => t.duration === duration);
    handleFormChange('duration', duration);
    if (tier) {
      const addonTotal = form.selectedAddons.reduce((sum, addonId) => {
        const addon = addons.find(a => a.id === addonId);
        return sum + (addon?.price || 0);
      }, 0);
      handleFormChange('price', tier.price + addonTotal);
    }
  };

  const handleToggleAddon = (addonId: string) => {
    const service = services.find(s => s.name === form.service);
    const tier = service?.tiers.find(t => t.duration === form.duration);
    const basePrice = tier?.price || 0;
    const current = form.selectedAddons;
    const updated = current.includes(addonId)
      ? current.filter(id => id !== addonId)
      : [...current, addonId];
    const addonTotal = updated.reduce((sum, id) => {
      const addon = addons.find(a => a.id === id);
      return sum + (addon?.price || 0);
    }, 0);
    handleFormChange('selectedAddons', updated);
    handleFormChange('price', basePrice + addonTotal);
  };

  const selectedService = services.find(s => s.name === form.service);

  const weekDays = useMemo(() => getWeekDays(weekBase), [weekBase]);

  const prevWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); };
  const nextWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); };
  const goToday = () => { setWeekBase(new Date()); setSelectedDay(new Date().toISOString().split('T')[0]); };

  // ── Time blocks for selected day ───────────────────────────────
  const dayTimeBlocks = useMemo(() => {
    return timeBlocks.filter(b => b.dateStart <= selectedDay && b.dateEnd >= selectedDay);
  }, [timeBlocks, selectedDay]);

  const dayAppts = useMemo(() => {
    return weekAppts.filter(a => a.date === selectedDay).sort((a, b) => {
      const parse = (t: string) => {
        const [time, ampm] = t.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return h * 60 + m;
      };
      return parse(a.time) - parse(b.time);
    });
  }, [weekAppts, selectedDay]);

  const dayStats = useMemo(() => {
    const appts = weekAppts.filter(a => a.date === selectedDay);
    return {
      total: appts.length,
      revenue: appts.reduce((s, a) => s + a.price, 0),
      collected: appts.filter(a => a.paid).reduce((s, a) => s + a.price + a.tip, 0),
      hours: appts.reduce((s, a) => s + a.duration, 0) / 60,
    };
  }, [weekAppts, selectedDay]);

  const handleAdd = async () => {
    if (!form.clientId || !form.service || !form.date || !form.time) return;
    setSaving(true);
    const { selectedAddons, ...apptData } = form;
    await addAppointment({ ...apptData });
    setSaving(false);
    setShowAddModal(false);
    setForm({ ...blankForm });
  };

  const handleEdit = async () => {
    if (!selectedAppt || !form.clientId || !form.service || !form.date || !form.time) return;
    setSaving(true);
    const { selectedAddons, ...apptData } = form;
    await editAppointment(selectedAppt.id, { ...apptData });
    setSaving(false);
    setShowEditModal(false);
    setSelectedAppt(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this appointment?')) return;
    await deleteAppointment(id);
  };

  const openEdit = (appt: Appointment) => {
    setSelectedAppt(appt);
    setForm({
      clientId: appt.clientId,
      clientName: appt.clientName,
      service: appt.service,
      date: appt.date,
      time: appt.time,
      duration: appt.duration,
      price: appt.price,
      status: appt.status,
      paid: appt.paid,
      tip: appt.tip,
      color: appt.color,
      selectedAddons: [],
    });
    setShowEditModal(true);
  };

  const today = new Date().toISOString().split('T')[0];
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  // ── Appointment Form ───────────────────────────────────────────
  const ApptForm = () => (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-600">Client *</label>
        <select value={form.clientId} onChange={e => {
          const client = clients.find(c => c.id === e.target.value);
          handleFormChange('clientId', e.target.value);
          handleFormChange('clientName', client?.name || '');
        }} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white">
          <option value="">Select a client...</option>
          {clients.sort((a, b) => a.name.localeCompare(b.name)).map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">Service *</label>
        {services.length === 0 ? (
          <p className="mt-1 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">
            No services found. Add services in Settings first.
          </p>
        ) : (
          <select value={form.service} onChange={e => handleServiceChange(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white">
            <option value="">Select a service...</option>
            {services.filter(s => s.isActive).map(s => (
              <option key={s.id} value={s.name}>{s.name}</option>
            ))}
          </select>
        )}
      </div>

      {selectedService && selectedService.tiers.length > 1 && (
        <div>
          <label className="text-xs font-medium text-gray-600">Duration & Price</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedService.tiers.map(tier => (
              <button key={tier.id} onClick={() => handleDurationChange(tier.duration)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  form.duration === tier.duration
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                }`}>
                {tier.duration} min — ${tier.price}
              </button>
            ))}
          </div>
        </div>
      )}

      {addons.filter(a => a.isActive).length > 0 && form.service && (
        <div>
          <label className="text-xs font-medium text-gray-600">Add-ons</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {addons.filter(a => a.isActive).map(addon => (
              <button key={addon.id} onClick={() => handleToggleAddon(addon.id)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                  form.selectedAddons.includes(addon.id)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                }`}>
                {addon.name} +${addon.price}
              </button>
            ))}
          </div>
        </div>
      )}

      {form.service && (
        <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-xl">
          <span className="text-sm font-medium text-emerald-700">Total Price</span>
          <span className="text-xl font-bold text-emerald-700">${form.price}</span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Date *</label>
          <input type="date" value={form.date} onChange={e => handleFormChange('date', e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Time *</label>
          <div className="flex gap-1 mt-1">
            <select value={form.time ? form.time.split(':')[0] : ''}
              onChange={e => {
                const parts = (form.time || '12:00 AM').split(':');
                const minAmpm = parts[1] || '00 AM';
                handleFormChange('time', `${e.target.value}:${minAmpm}`);
              }}
              className="flex-1 px-2 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
              <option value="">Hr</option>
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <select value={form.time ? form.time.split(':')[1]?.split(' ')[0] : ''}
              onChange={e => {
                const hour = (form.time || '12:00 AM').split(':')[0];
                const ampm = (form.time || '12:00 AM').split(' ')[1] || 'AM';
                handleFormChange('time', `${hour}:${e.target.value} ${ampm}`);
              }}
              className="flex-1 px-2 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
              <option value="">Min</option>
              <option value="00">00</option>
              <option value="15">15</option>
              <option value="30">30</option>
              <option value="45">45</option>
            </select>
            <select value={form.time ? form.time.split(' ')[1] : ''}
              onChange={e => {
                const timePart = (form.time || '12:00 AM').split(' ')[0];
                handleFormChange('time', `${timePart} ${e.target.value}`);
              }}
              className="flex-1 px-2 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none bg-white">
              <option value="">AM/PM</option>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-600">Status</label>
        <select value={form.status} onChange={e => handleFormChange('status', e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white">
          <option value="upcoming">Upcoming</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">
            {weekStart.month} {weekStart.day} – {weekEnd.month} {weekEnd.day} &middot; {weekAppts.filter(a => weekDays.some(d => d.date === a.date)).length} appointments this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevWeek} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={goToday} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Today
          </button>
          <button onClick={nextWeek} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => { setForm({ ...blankForm, date: selectedDay }); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all">
            <Plus className="w-4 h-4" /> Add Appointment
          </button>
        </div>
      </div>

      {/* Week Day Selector */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const appts = weekAppts.filter(a => a.date === day.date);
          const hasBlock = timeBlocks.some(b => b.dateStart <= day.date && b.dateEnd >= day.date);
          const isToday = day.date === today;
          const isSelected = day.date === selectedDay;
          return (
            <button key={day.date} onClick={() => setSelectedDay(day.date)}
              className={`rounded-2xl p-3 text-center transition-all border ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white border-emerald-500 shadow-lg shadow-emerald-200'
                  : isToday
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : hasBlock
                      ? 'bg-red-50 border-red-100 text-gray-700'
                      : 'bg-white border-gray-100 text-gray-700 hover:border-emerald-200 hover:shadow-sm'
              }`}>
              <p className={`text-xs font-medium ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>{day.label}</p>
              <p className={`text-xl font-bold mt-1 ${isSelected ? 'text-white' : ''}`}>{day.day}</p>
              <p className={`text-xs mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>{day.month}</p>
              <div className="flex items-center justify-center gap-0.5 mt-1.5 flex-wrap">
                {appts.slice(0, 3).map((a, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getServiceColor(a.service) }} />
                ))}
                {hasBlock && !isSelected && <div className="w-1.5 h-1.5 rounded-full bg-red-400" />}
              </div>
              <p className={`text-xs mt-1 font-medium ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                {appts.length} appt{appts.length !== 1 ? 's' : ''}
              </p>
            </button>
          );
        })}
      </div>

      {/* Day Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Appointments', value: dayStats.total, color: 'text-gray-900' },
          { label: 'Expected Revenue', value: `$${dayStats.revenue}`, color: 'text-gray-900' },
          { label: 'Collected', value: `$${dayStats.collected}`, color: 'text-emerald-600' },
          { label: 'Working Hours', value: `${dayStats.hours.toFixed(1)}h`, color: 'text-gray-900' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Time Blocks for selected day */}
      {dayTimeBlocks.length > 0 && (
        <div className="space-y-2">
          {dayTimeBlocks.map(block => (
            <div key={block.id} className="flex items-center gap-3 px-5 py-3 rounded-xl border"
              style={{ backgroundColor: block.color + '15', borderColor: block.color + '40' }}>
              <Ban className="w-4 h-4 flex-shrink-0" style={{ color: block.color }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: block.color }}>{block.label}</p>
                <p className="text-xs text-gray-400">
                  {block.allDay ? 'All day' : `${block.timeStart} – ${block.timeEnd}`}
                </p>
              </div>
              <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: block.color + '20', color: block.color }}>
                Blocked
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Day Schedule */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <div className="flex items-center gap-3">
            {bufferTime > 0 && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {bufferTime}min buffer
              </span>
            )}
            <span className="text-sm text-gray-400">{dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {dayAppts.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {dayAppts.map((appt, index) => {
              const isUpdating = updatingAppointment === appt.id;
              const isLast = index === dayAppts.length - 1;
              return (
                <React.Fragment key={appt.id}>
                  <div className="px-6 py-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors group">
                    <div className="w-20 flex-shrink-0 pt-0.5">
                      <p className="text-sm font-semibold text-gray-900">{appt.time}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Clock className="w-3 h-3" /> {appt.duration}min
                      </div>
                    </div>
                    <div className="w-1 h-16 rounded-full flex-shrink-0" style={{ backgroundColor: getServiceColor(appt.service) }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <h4 className="text-sm font-semibold text-gray-900">{appt.clientName}</h4>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{appt.service}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${appt.color || getServiceColorClass(appt.service)}`}>
                              {appt.service.split(' ')[0]}
                            </span>
                            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${
                              appt.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                              appt.status === 'upcoming' ? 'bg-blue-50 text-blue-600' :
                              appt.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                              'bg-gray-50 text-gray-500'
                            }`}>
                              {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-bold text-gray-900">${appt.price}</p>
                          {appt.tip > 0 && <p className="text-xs text-emerald-600">+${appt.tip} tip</p>}
                          {appt.paid ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg mt-1">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          ) : (
                            <button onClick={() => markAppointmentPaid(appt.id)} disabled={isUpdating}
                              className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg mt-1 transition-colors disabled:opacity-50">
                              {isUpdating ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                              {isUpdating ? 'Saving...' : 'Collect'}
                            </button>
                          )}
                          <div className="flex gap-1 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(appt)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            <button onClick={() => handleDelete(appt.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Buffer time block after each appointment except the last */}
                  {bufferTime > 0 && !isLast && (
                    <div className="px-6 py-2 flex items-center gap-4 bg-gray-50/80">
                      <div className="w-20 flex-shrink-0">
                        <p className="text-xs text-gray-400">{bufferTime} min</p>
                      </div>
                      <div className="w-1 h-6 rounded-full bg-gray-200 flex-shrink-0" />
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-300" />
                        <p className="text-xs text-gray-400 italic">Cleanup / buffer time</p>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">
              {dayTimeBlocks.length > 0 ? 'Day is blocked off' : 'No appointments scheduled'}
            </p>
            <p className="text-sm text-gray-300 mt-1">
              {dayTimeBlocks.length > 0 ? dayTimeBlocks[0].label : 'Enjoy your day off!'}
            </p>
            {dayTimeBlocks.length === 0 && (
              <button onClick={() => { setForm({ ...blankForm, date: selectedDay }); setShowAddModal(true); }}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
                <Plus className="w-4 h-4" /> Add Appointment
              </button>
            )}
          </div>
        )}
      </div>

      {/* Service Legend */}
      {services.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Service Types</h3>
          <div className="flex flex-wrap gap-3">
            {services.filter(s => s.isActive).map(s => (
              <div key={s.id} className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span>{s.name}</span>
                {s.tiers.length > 0 && (
                  <span className="text-gray-400">
                    ${Math.min(...s.tiers.map(t => t.price))}
                    {s.tiers.length > 1 ? `–$${Math.max(...s.tiers.map(t => t.price))}` : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Add Appointment</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <ApptForm />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !form.clientId || !form.service || !form.date || !form.time}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Edit Appointment</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <ApptForm />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleEdit} disabled={saving || !form.clientId || !form.service || !form.date || !form.time}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;