import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Clock, CheckCircle2, CreditCard, User, Loader2, Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Ban, Calendar, LayoutGrid, List, AlertTriangle } from 'lucide-react';
import type { Appointment } from '@/data/sampleData';

// ── Helpers ────────────────────────────────────────────────────────────────

const toMinutes = (time: string): number => {
  const [timePart, ampm] = time.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

const getCenteredWeekDays = (baseDate: Date) => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - 3 + i);
    return {
      date: d.toISOString().split('T')[0],
      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate().toString(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      full: d,
    };
  });
};

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

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

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

// ── Main Component ─────────────────────────────────────────────────────────

type ViewMode = 'day' | 'week' | 'month';

const CalendarView: React.FC = () => {
  const {
    weekAppts, markAppointmentPaid, updatingAppointment,
    addAppointment, deleteAppointment, editAppointment,
    clients, services, addons, bufferTime, timeBlocks, hours,
  } = useAppContext();

  const today = new Date().toISOString().split('T')[0];
  const [selectedDay, setSelectedDay] = useState(today);
  const [weekBase, setWeekBase] = useState(new Date());
  const [monthBase, setMonthBase] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [form, setForm] = useState({ ...blankForm });
  const [saving, setSaving] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (field === 'time' || field === 'date' || field === 'duration') {
      setConflictWarning(null);
    }
  };

  // ── Service helpers ────────────────────────────────────────────
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

  // ── Conflict detection ─────────────────────────────────────────
  const checkConflict = (date: string, time: string, duration: number, excludeId?: string): string | null => {
    if (!date || !time || !duration) return null;

    const newStart = toMinutes(time);
    const newEnd = newStart + duration;

    // Check time blocks
    const blocked = timeBlocks.find(b => b.dateStart <= date && b.dateEnd >= date);
    if (blocked) {
      if (blocked.allDay) return `This day is blocked off: ${blocked.label}`;
      if (blocked.timeStart && blocked.timeEnd) {
        const bStart = parseInt(blocked.timeStart.replace(':', ''));
        const bEnd = parseInt(blocked.timeEnd.replace(':', ''));
        const nStart = parseInt(time.replace(':', ''));
        if (nStart >= bStart && nStart < bEnd) return `Time blocked: ${blocked.label}`;
      }
    }

    // Check hours of operation
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay();
    const dayHours = hours.find(h => h.dayOfWeek === dayOfWeek);
    if (dayHours && !dayHours.isOpen) {
      return `Closed on ${DAY_NAMES[dayOfWeek]}s`;
    }
    if (dayHours && dayHours.isOpen) {
      const openMin = parseInt(dayHours.openTime.split(':')[0]) * 60 + parseInt(dayHours.openTime.split(':')[1]);
      const closeMin = parseInt(dayHours.closeTime.split(':')[0]) * 60 + parseInt(dayHours.closeTime.split(':')[1]);
      if (newStart < openMin) return `Before opening time (${dayHours.openTime})`;
      if (newEnd > closeMin) return `Appointment ends after closing time (${dayHours.closeTime})`;
    }

    // Check existing appointments
    const sameDay = weekAppts.filter(a => a.date === date && a.id !== excludeId && a.status !== 'cancelled');
    for (const appt of sameDay) {
      const apptStart = toMinutes(appt.time);
      const apptEnd = apptStart + appt.duration + bufferTime;
      if (newStart < apptEnd && newEnd > apptStart) {
        return `Conflicts with ${appt.clientName}'s appointment at ${appt.time} (includes ${bufferTime}min buffer)`;
      }
    }

    return null;
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
    const updated = current.includes(addonId) ? current.filter(id => id !== addonId) : [...current, addonId];
    const addonTotal = updated.reduce((sum, id) => {
      const addon = addons.find(a => a.id === id);
      return sum + (addon?.price || 0);
    }, 0);
    handleFormChange('selectedAddons', updated);
    handleFormChange('price', basePrice + addonTotal);
  };

  const selectedService = services.find(s => s.name === form.service);

  // ── Navigation ─────────────────────────────────────────────────
  const centeredDays = useMemo(() => getCenteredWeekDays(new Date(selectedDay + 'T12:00:00')), [selectedDay]);
  const weekDays = useMemo(() => getWeekDays(weekBase), [weekBase]);

  const prevWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); };
  const nextWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); };
  const goToday = () => {
    setSelectedDay(today);
    setWeekBase(new Date());
    setMonthBase(new Date());
    setViewMode('day');
  };

  // ── Day view data ──────────────────────────────────────────────
  const dayTimeBlocks = useMemo(() => {
    return timeBlocks.filter(b => b.dateStart <= selectedDay && b.dateEnd >= selectedDay);
  }, [timeBlocks, selectedDay]);

  const dayAppts = useMemo(() => {
    return weekAppts.filter(a => a.date === selectedDay).sort((a, b) => toMinutes(a.time) - toMinutes(b.time));
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

  // ── CRUD ──────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!form.clientId || !form.service || !form.date || !form.time) return;
    const conflict = checkConflict(form.date, form.time, form.duration);
    if (conflict) { setConflictWarning(conflict); return; }
    setSaving(true);
    const { selectedAddons, ...apptData } = form;
    await addAppointment({ ...apptData });
    setSaving(false);
    setShowAddModal(false);
    setForm({ ...blankForm });
    setConflictWarning(null);
  };

  const handleEdit = async () => {
    if (!selectedAppt || !form.clientId || !form.service || !form.date || !form.time) return;
    const conflict = checkConflict(form.date, form.time, form.duration, selectedAppt.id);
    if (conflict) { setConflictWarning(conflict); return; }
    setSaving(true);
    const { selectedAddons, ...apptData } = form;
    await editAppointment(selectedAppt.id, { ...apptData });
    setSaving(false);
    setShowEditModal(false);
    setSelectedAppt(null);
    setConflictWarning(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this appointment?')) return;
    await deleteAppointment(id);
  };

  const openEdit = (appt: Appointment) => {
    setSelectedAppt(appt);
    setForm({
      clientId: appt.clientId, clientName: appt.clientName,
      service: appt.service, date: appt.date, time: appt.time,
      duration: appt.duration, price: appt.price, status: appt.status,
      paid: appt.paid, tip: appt.tip, color: appt.color, selectedAddons: [],
    });
    setConflictWarning(null);
    setShowEditModal(true);
  };

  // ── Appointment Form ───────────────────────────────────────────
  const ApptForm = () => (
    <div className="space-y-4">
      {conflictWarning && (
        <div className="flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{conflictWarning}</p>
        </div>
      )}
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
          <p className="mt-1 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-xl">No services found. Add services in Settings first.</p>
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

  // ── MONTH VIEW ─────────────────────────────────────────────────
  const MonthView = () => {
    const year = monthBase.getFullYear();
    const month = monthBase.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <button onClick={() => { const d = new Date(monthBase); d.setMonth(d.getMonth() - 1); setMonthBase(d); }}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">{MONTH_NAMES[month]} {year}</h3>
          <button onClick={() => { const d = new Date(monthBase); d.setMonth(d.getMonth() + 1); setMonthBase(d); }}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-gray-50">
          {DAY_NAMES.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-400">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="h-24 border-b border-r border-gray-50 bg-gray-50/30" />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayApptList = weekAppts.filter(a => a.date === dateStr);
            const isBlocked = timeBlocks.some(b => b.dateStart <= dateStr && b.dateEnd >= dateStr);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDay;
            const dateObj = new Date(dateStr + 'T12:00:00');
            const dow = dateObj.getDay();
            const dayHours = hours.find(h => h.dayOfWeek === dow);
            const isClosed = dayHours && !dayHours.isOpen;

            return (
              <div key={dateStr}
                onClick={() => { setSelectedDay(dateStr); setViewMode('day'); }}
                className={`h-24 border-b border-r border-gray-50 p-1 cursor-pointer transition-all hover:bg-emerald-50/50 ${
                  isSelected ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-400' :
                  isBlocked ? 'bg-red-50' :
                  isClosed ? 'bg-gray-50' : 'bg-white'
                }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                  isToday ? 'bg-emerald-600 text-white' :
                  isSelected ? 'text-emerald-700' : 'text-gray-700'
                }`}>{day}</div>
                {isBlocked && <div className="text-xs text-red-500 truncate">{timeBlocks.find(b => b.dateStart <= dateStr && b.dateEnd >= dateStr)?.label}</div>}
                {isClosed && !isBlocked && <div className="text-xs text-gray-400">Closed</div>}
                <div className="space-y-0.5">
                  {dayApptList.slice(0, 2).map(a => (
                    <div key={a.id} className="text-xs px-1 py-0.5 rounded truncate text-white"
                      style={{ backgroundColor: getServiceColor(a.service) }}>
                      {a.time} {a.clientName.split(' ')[0]}
                    </div>
                  ))}
                  {dayApptList.length > 2 && <div className="text-xs text-gray-400">+{dayApptList.length - 2} more</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── WEEK VIEW ──────────────────────────────────────────────────
  const WeekView = () => {
    const HOUR_HEIGHT = 60;
    const START_HOUR = 7;
    const END_HOUR = 21;
    const totalHours = END_HOUR - START_HOUR;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
          <h3 className="text-lg font-semibold text-gray-900">
            {weekDays[0].month} {weekDays[0].day} – {weekDays[6].month} {weekDays[6].day}
          </h3>
          <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
        </div>

        {/* Day headers */}
        <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: '60px repeat(7, 1fr)' }}>
          <div className="py-2" />
          {weekDays.map(day => {
            const isToday = day.date === today;
            const isSelected = day.date === selectedDay;
            return (
              <div key={day.date} onClick={() => { setSelectedDay(day.date); setViewMode('day'); }}
                className="py-2 text-center cursor-pointer hover:bg-gray-50 border-l border-gray-100">
                <p className="text-xs text-gray-400">{day.label}</p>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mx-auto mt-0.5 ${
                  isToday ? 'bg-emerald-600 text-white' :
                  isSelected ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700'
                }`}>{day.day}</div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
          <div className="relative" style={{ height: `${totalHours * HOUR_HEIGHT}px` }}>
            {/* Hour lines */}
            {Array.from({ length: totalHours }, (_, i) => {
              const hour = START_HOUR + i;
              const label = hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
              return (
                <div key={hour} className="absolute w-full flex" style={{ top: `${i * HOUR_HEIGHT}px` }}>
                  <div className="w-14 flex-shrink-0 text-right pr-2 text-xs text-gray-400 -mt-2">{label}</div>
                  <div className="flex-1 border-t border-gray-100" />
                </div>
              );
            })}

            {/* Appointments */}
            {weekDays.map((day, dayIndex) => {
              const dayApptList = weekAppts.filter(a => a.date === day.date);
              const isBlocked = timeBlocks.some(b => b.dateStart <= day.date && b.dateEnd >= day.date);
              const dateObj = new Date(day.date + 'T12:00:00');
              const dow = dateObj.getDay();
              const dayHours = hours.find(h => h.dayOfWeek === dow);
              const colWidth = `calc((100% - 60px) / 7)`;
              const colLeft = `calc(60px + ${dayIndex} * (100% - 60px) / 7)`;

              return (
                <div key={day.date} className="absolute top-0 bottom-0 border-l border-gray-100"
                  style={{ left: colLeft, width: colWidth }}>
                  {/* Closed/blocked overlay */}
                  {(isBlocked || (dayHours && !dayHours.isOpen)) && (
                    <div className="absolute inset-0 bg-gray-100/70 z-10 flex items-center justify-center">
                      <span className="text-xs text-gray-400 font-medium rotate-0">
                        {isBlocked ? timeBlocks.find(b => b.dateStart <= day.date && b.dateEnd >= day.date)?.label : 'Closed'}
                      </span>
                    </div>
                  )}

                  {/* Outside hours overlay */}
                  {dayHours && dayHours.isOpen && (() => {
                    const openHour = parseInt(dayHours.openTime.split(':')[0]);
                    const closeHour = parseInt(dayHours.closeTime.split(':')[0]);
                    const beforeTop = 0;
                    const beforeHeight = Math.max(0, (openHour - START_HOUR) * HOUR_HEIGHT);
                    const afterTop = (closeHour - START_HOUR) * HOUR_HEIGHT;
                    const afterHeight = Math.max(0, (END_HOUR - closeHour) * HOUR_HEIGHT);
                    return (
                      <>
                        {beforeHeight > 0 && <div className="absolute bg-gray-100/50" style={{ top: beforeTop, height: beforeHeight, left: 0, right: 0 }} />}
                        {afterHeight > 0 && <div className="absolute bg-gray-100/50" style={{ top: afterTop, height: afterHeight, left: 0, right: 0 }} />}
                      </>
                    );
                  })()}

                  {/* Appointment blocks */}
                  {dayApptList.map(appt => {
                    const startMin = toMinutes(appt.time);
                    const topPx = ((startMin / 60) - START_HOUR) * HOUR_HEIGHT;
                    const heightPx = (appt.duration / 60) * HOUR_HEIGHT;
                    const bufferPx = (bufferTime / 60) * HOUR_HEIGHT;
                    return (
                      <div key={appt.id}>
                        <div className="absolute left-0.5 right-0.5 rounded-lg px-1 py-0.5 text-white text-xs overflow-hidden cursor-pointer hover:opacity-90 z-20"
                          style={{ top: `${topPx}px`, height: `${heightPx}px`, backgroundColor: getServiceColor(appt.service) }}
                          onClick={() => { setSelectedDay(day.date); openEdit(appt); }}>
                          <p className="font-semibold truncate">{appt.clientName.split(' ')[0]}</p>
                          <p className="opacity-80 truncate">{appt.service.split(' ')[0]}</p>
                        </div>
                        {bufferTime > 0 && (
                          <div className="absolute left-0.5 right-0.5 rounded-b-lg z-10"
                            style={{ top: `${topPx + heightPx}px`, height: `${bufferPx}px`, backgroundColor: '#e5e7eb' }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── DAY VIEW ───────────────────────────────────────────────────
  const DayView = () => (
    <div className="space-y-4">
      {/* Centered 7-day strip */}
      <div className="grid grid-cols-7 gap-2">
        {centeredDays.map((day, idx) => {
          const appts = weekAppts.filter(a => a.date === day.date);
          const hasBlock = timeBlocks.some(b => b.dateStart <= day.date && b.dateEnd >= day.date);
          const isToday = day.date === today;
          const isSelected = day.date === selectedDay;
          const isCenter = idx === 3;
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
              <p className={`text-xl font-bold mt-1 ${isSelected ? 'text-white' : isCenter && isToday ? 'text-emerald-600' : ''}`}>{day.day}</p>
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

      {/* Time Blocks */}
      {dayTimeBlocks.length > 0 && (
        <div className="space-y-2">
          {dayTimeBlocks.map(block => (
            <div key={block.id} className="flex items-center gap-3 px-5 py-3 rounded-xl border"
              style={{ backgroundColor: block.color + '15', borderColor: block.color + '40' }}>
              <Ban className="w-4 h-4 flex-shrink-0" style={{ color: block.color }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: block.color }}>{block.label}</p>
                <p className="text-xs text-gray-400">{block.allDay ? 'All day' : `${block.timeStart} – ${block.timeEnd}`}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{ backgroundColor: block.color + '20', color: block.color }}>Blocked</span>
            </div>
          ))}
        </div>
      )}

      {/* Schedule */}
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
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <List className="w-3.5 h-3.5" /> Day
            </button>
            <button onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <LayoutGrid className="w-3.5 h-3.5" /> Week
            </button>
            <button onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Calendar className="w-3.5 h-3.5" /> Month
            </button>
          </div>

          <button onClick={goToday} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Today
          </button>

          {viewMode === 'week' && (
            <>
              <button onClick={prevWeek} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={nextWeek} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </>
          )}

          <button
            onClick={() => { setForm({ ...blankForm, date: selectedDay }); setConflictWarning(null); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all">
            <Plus className="w-4 h-4" /> Add Appointment
          </button>
        </div>
      </div>

      {/* View content */}
      {viewMode === 'day' && <DayView />}
      {viewMode === 'week' && <WeekView />}
      {viewMode === 'month' && <MonthView />}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Add Appointment</h2>
              <button onClick={() => { setShowAddModal(false); setConflictWarning(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <ApptForm />
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setConflictWarning(null); }} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
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
              <button onClick={() => { setShowEditModal(false); setConflictWarning(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <ApptForm />
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowEditModal(false); setConflictWarning(null); }} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
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