import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Clock, CheckCircle2, CreditCard, User, Loader2, Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { serviceTypes } from '@/data/sampleData';
import type { Appointment } from '@/data/sampleData';

const SERVICES = serviceTypes.map(s => s.name);

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

const getServiceColor = (service: string) => {
  const found = serviceTypes.find(s => service.toLowerCase().includes(s.name.toLowerCase().split(' ')[0].toLowerCase()));
  return found?.color || '#6b7280';
};

const getServicePrice = (service: string) => {
  const found = serviceTypes.find(s => s.name === service);
  return found?.price || 0;
};

const getServiceDuration = (service: string) => {
  const found = serviceTypes.find(s => s.name === service);
  return found?.duration || 60;
};

const getServiceColor2 = (service: string) => {
  const colorMap: Record<string, string> = {
    'Swedish Massage': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Deep Tissue': 'bg-purple-100 text-purple-700 border-purple-200',
    'Hot Stone': 'bg-amber-100 text-amber-700 border-amber-200',
    'Sports Massage': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Prenatal': 'bg-pink-100 text-pink-700 border-pink-200',
    'Therapeutic': 'bg-blue-100 text-blue-700 border-blue-200',
    'Aromatherapy': 'bg-rose-100 text-rose-700 border-rose-200',
    'Reflexology': 'bg-teal-100 text-teal-700 border-teal-200',
    'Couples Massage': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    'Thai Massage': 'bg-orange-100 text-orange-700 border-orange-200',
    'Relaxation': 'bg-green-100 text-green-700 border-green-200',
  };
  return colorMap[service] || 'bg-gray-100 text-gray-700 border-gray-200';
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
};

interface ApptFormProps {
  form: typeof blankForm;
  onChange: (field: string, value: any) => void;
  clients: any[];
}

const ApptForm: React.FC<ApptFormProps> = ({ form, onChange, clients }) => (
  <div className="space-y-3">
    <div>
      <label className="text-xs font-medium text-gray-600">Client *</label>
      <select value={form.clientId} onChange={e => {
        const client = clients.find(c => c.id === e.target.value);
        onChange('clientId', e.target.value);
        onChange('clientName', client?.name || '');
      }} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white">
        <option value="">Select a client...</option>
        {clients.sort((a, b) => a.name.localeCompare(b.name)).map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-gray-600">Service *</label>
      <select value={form.service} onChange={e => {
        onChange('service', e.target.value);
        onChange('price', getServicePrice(e.target.value));
        onChange('duration', getServiceDuration(e.target.value));
        onChange('color', getServiceColor2(e.target.value));
      }} className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white">
        <option value="">Select a service...</option>
        {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-medium text-gray-600">Date *</label>
        <input type="date" value={form.date} onChange={e => onChange('date', e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Time *</label>
        <div className="flex gap-2 mt-1">
          <select
            value={form.time ? form.time.split(':')[0] : ''}
            onChange={e => {
              const current = form.time || '12:00 AM';
              const parts = current.split(':');
              const minAmpm = parts[1] || '00 AM';
              onChange('time', `${e.target.value}:${minAmpm}`);
            }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
          >
            <option value="">Hour</option>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <select
            value={form.time ? form.time.split(':')[1]?.split(' ')[0] : ''}
            onChange={e => {
              const current = form.time || '12:00 AM';
              const hour = current.split(':')[0];
              const ampm = current.split(' ')[1] || 'AM';
              onChange('time', `${hour}:${e.target.value} ${ampm}`);
            }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
          >
            <option value="">Min</option>
            <option value="00">00</option>
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="45">45</option>
          </select>
          <select
            value={form.time ? form.time.split(' ')[1] : ''}
            onChange={e => {
              const current = form.time || '12:00 AM';
              const timePart = current.split(' ')[0];
              onChange('time', `${timePart} ${e.target.value}`);
            }}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
          >
            <option value="">AM/PM</option>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-medium text-gray-600">Duration (min)</label>
        <input type="number" value={form.duration} onChange={e => onChange('duration', parseInt(e.target.value))}
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Price ($)</label>
        <input type="number" value={form.price} onChange={e => onChange('price', parseFloat(e.target.value))}
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
      </div>
    </div>
    <div>
      <label className="text-xs font-medium text-gray-600">Status</label>
      <select value={form.status} onChange={e => onChange('status', e.target.value)}
        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white">
        <option value="upcoming">Upcoming</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="no-show">No Show</option>
      </select>
    </div>
  </div>
);

const CalendarView: React.FC = () => {
  const { weekAppts, markAppointmentPaid, updatingAppointment, addAppointment, deleteAppointment, editAppointment, clients } = useAppContext();
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

  const weekDays = useMemo(() => getWeekDays(weekBase), [weekBase]);

  const prevWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() - 7);
    setWeekBase(d);
  };

  const nextWeek = () => {
    const d = new Date(weekBase);
    d.setDate(d.getDate() + 7);
    setWeekBase(d);
  };

  const goToday = () => {
    setWeekBase(new Date());
    setSelectedDay(new Date().toISOString().split('T')[0]);
  };

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
    await addAppointment({ ...form });
    setSaving(false);
    setShowAddModal(false);
    setForm({ ...blankForm });
  };

  const handleEdit = async () => {
    if (!selectedAppt || !form.clientId || !form.service || !form.date || !form.time) return;
    setSaving(true);
    await editAppointment(selectedAppt.id, { ...form });
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
    });
    setShowEditModal(true);
  };

  const today = new Date().toISOString().split('T')[0];
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">
            {weekStart.month} {weekStart.day} - {weekEnd.month} {weekEnd.day} &middot; {weekAppts.filter(a => weekDays.some(d => d.date === a.date)).length} appointments this week
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
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Appointment
          </button>
        </div>
      </div>

      {/* Week Day Selector */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const appts = weekAppts.filter(a => a.date === day.date);
          const isToday = day.date === today;
          const isSelected = day.date === selectedDay;
          return (
            <button key={day.date} onClick={() => setSelectedDay(day.date)}
              className={`rounded-2xl p-3 text-center transition-all border ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white border-emerald-500 shadow-lg shadow-emerald-200'
                  : isToday
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-gray-100 text-gray-700 hover:border-emerald-200 hover:shadow-sm'
              }`}>
              <p className={`text-xs font-medium ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>{day.label}</p>
              <p className={`text-xl font-bold mt-1 ${isSelected ? 'text-white' : ''}`}>{day.day}</p>
              <p className={`text-xs mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>{day.month}</p>
              <div className="flex items-center justify-center gap-0.5 mt-1.5 flex-wrap">
                {appts.slice(0, 3).map((a, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getServiceColor(a.service) }} />
                ))}
                {appts.length > 3 && <span className={`text-xs ${isSelected ? 'text-emerald-100' : 'text-gray-400'}`}>+{appts.length - 3}</span>}
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

      {/* Day Schedule */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <span className="text-sm text-gray-400">{dayAppts.length} appointment{dayAppts.length !== 1 ? 's' : ''}</span>
        </div>
        {dayAppts.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {dayAppts.map(appt => {
              const isUpdating = updatingAppointment === appt.id;
              return (
                <div key={appt.id} className="px-6 py-5 flex items-start gap-4 hover:bg-gray-50/50 transition-colors group">
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
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${appt.color || getServiceColor2(appt.service)}`}>
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
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No appointments scheduled</p>
            <p className="text-sm text-gray-300 mt-1">Enjoy your day off!</p>
            <button onClick={() => { setForm({ ...blankForm, date: selectedDay }); setShowAddModal(true); }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors">
              <Plus className="w-4 h-4" /> Add Appointment
            </button>
          </div>
        )}
      </div>

      {/* Service Legend */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Service Types</h3>
        <div className="flex flex-wrap gap-3">
          {serviceTypes.map(s => (
            <div key={s.name} className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
              <span>{s.name}</span>
              <span className="text-gray-400">${s.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Add Appointment</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <ApptForm form={form} onChange={handleFormChange} clients={clients} />
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

      {/* Edit Appointment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Edit Appointment</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <ApptForm form={form} onChange={handleFormChange} clients={clients} />
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