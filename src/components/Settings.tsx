import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Plus, Trash2, Edit2, Check, X, Settings as SettingsIcon, Sparkles, Clock } from 'lucide-react';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const COLOR_OPTIONS = [
  '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899',
  '#3b82f6', '#f43f5e', '#14b8a6', '#e879f9', '#f97316',
  '#22c55e', '#ef4444', '#a855f7', '#0ea5e9', '#84cc16',
];

const BLOCK_COLORS = [
  { label: 'Gray', value: '#6b7280' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#8b5cf6' },
];

const Settings: React.FC = () => {
  const {
    services, addons, bufferTime, timeBlocks, hours,
    addService, removeService, editService, addTier, removeTier,
    addAddOn, removeAddOn, editAddOn,
    updateBufferTime, addTimeBlock, removeTimeBlock,
    updateHours,
  } = useAppContext();

  // ── Service form state ─────────────────────────────────────────
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceColor, setNewServiceColor] = useState('#10b981');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServiceName, setEditingServiceName] = useState('');
  const [editingServiceColor, setEditingServiceColor] = useState('');
  const [tierInputs, setTierInputs] = useState<Record<string, { duration: string; price: string }>>({});

  // ── Add-on form state ──────────────────────────────────────────
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);
  const [editingAddonName, setEditingAddonName] = useState('');
  const [editingAddonPrice, setEditingAddonPrice] = useState('');

  // ── Buffer time state ──────────────────────────────────────────
  const [bufferInput, setBufferInput] = useState(String(bufferTime));
  const [savingBuffer, setSavingBuffer] = useState(false);

  // ── Time block form state ──────────────────────────────────────
  const [blockLabel, setBlockLabel] = useState('');
  const [blockDateStart, setBlockDateStart] = useState('');
  const [blockDateEnd, setBlockDateEnd] = useState('');
  const [blockTimeStart, setBlockTimeStart] = useState('');
  const [blockTimeEnd, setBlockTimeEnd] = useState('');
  const [blockAllDay, setBlockAllDay] = useState(true);
  const [blockColor, setBlockColor] = useState('#6b7280');

  const [saving, setSaving] = useState(false);

  // ── Service handlers ───────────────────────────────────────────
  const handleAddService = async () => {
    if (!newServiceName.trim()) return;
    setSaving(true);
    try {
      await addService(newServiceName.trim(), newServiceColor);
      setNewServiceName('');
      setNewServiceColor('#10b981');
    } finally { setSaving(false); }
  };

  const handleSaveServiceEdit = async (id: string) => {
    if (!editingServiceName.trim()) return;
    await editService(id, { name: editingServiceName.trim(), color: editingServiceColor });
    setEditingServiceId(null);
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Delete this service and all its pricing tiers?')) return;
    await removeService(id);
  };

  const handleAddTier = async (serviceId: string) => {
    const input = tierInputs[serviceId];
    if (!input?.duration || !input?.price) return;
    const duration = parseInt(input.duration);
    const price = parseFloat(input.price);
    if (isNaN(duration) || isNaN(price)) return;
    setSaving(true);
    try {
      await addTier(serviceId, duration, price);
      setTierInputs(prev => ({ ...prev, [serviceId]: { duration: '', price: '' } }));
    } finally { setSaving(false); }
  };

  // ── Add-on handlers ────────────────────────────────────────────
  const handleAddAddon = async () => {
    if (!newAddonName.trim() || !newAddonPrice) return;
    const price = parseFloat(newAddonPrice);
    if (isNaN(price)) return;
    setSaving(true);
    try {
      await addAddOn(newAddonName.trim(), price);
      setNewAddonName('');
      setNewAddonPrice('');
    } finally { setSaving(false); }
  };

  const handleSaveAddonEdit = async (id: string) => {
    if (!editingAddonName.trim()) return;
    await editAddOn(id, { name: editingAddonName.trim(), price: parseFloat(editingAddonPrice) });
    setEditingAddonId(null);
  };

  const handleDeleteAddon = async (id: string) => {
    if (!window.confirm('Delete this add-on?')) return;
    await removeAddOn(id);
  };

  // ── Buffer time handler ────────────────────────────────────────
  const handleSaveBuffer = async () => {
    const val = parseInt(bufferInput);
    if (isNaN(val) || val < 0) return;
    setSavingBuffer(true);
    try {
      await updateBufferTime(val);
    } finally { setSavingBuffer(false); }
  };

  // ── Time block handler ─────────────────────────────────────────
  const handleAddTimeBlock = async () => {
    if (!blockLabel.trim() || !blockDateStart || !blockDateEnd) return;
    setSaving(true);
    try {
      await addTimeBlock({
        label: blockLabel.trim(),
        dateStart: blockDateStart,
        dateEnd: blockDateEnd,
        timeStart: blockAllDay ? undefined : blockTimeStart,
        timeEnd: blockAllDay ? undefined : blockTimeEnd,
        allDay: blockAllDay,
        color: blockColor,
      });
      setBlockLabel('');
      setBlockDateStart('');
      setBlockDateEnd('');
      setBlockTimeStart('');
      setBlockTimeEnd('');
      setBlockAllDay(true);
      setBlockColor('#6b7280');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-0.5">Manage services, pricing, add-ons, and scheduling</p>
        </div>
      </div>

      {/* ── BUFFER TIME ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cleanup Buffer Time</h2>
              <p className="text-sm text-gray-400 mt-0.5">Time blocked after each session for room cleanup</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-5 flex items-center gap-4">
          <div className="flex items-center gap-3">
            {[0, 10, 15, 20, 30].map(min => (
              <button key={min} onClick={() => setBufferInput(String(min))}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  bufferInput === String(min)
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                }`}>
                {min === 0 ? 'None' : `${min} min`}
              </button>
            ))}
            <input
              type="number"
              value={bufferInput}
              onChange={e => setBufferInput(e.target.value)}
              placeholder="Custom"
              className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
          <button onClick={handleSaveBuffer} disabled={savingBuffer}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all">
            {savingBuffer ? 'Saving...' : 'Save'}
          </button>
        </div>
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-400">
            Currently set to <span className="font-semibold text-emerald-600">{bufferTime} minutes</span> buffer between appointments
          </p>
        </div>
      </div>

      {/* ── TIME BLOCKS ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Time Blocks</h2>
            <p className="text-sm text-gray-400 mt-0.5">Block off vacation, lunch breaks, or days off</p>
          </div>
          <span className="text-sm text-gray-400">{timeBlocks.length} block{timeBlocks.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Add time block form */}
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 space-y-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Add Time Block</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-48">
              <label className="text-xs text-gray-500 mb-1 block">Label</label>
              <input value={blockLabel} onChange={e => setBlockLabel(e.target.value)}
                placeholder="e.g. Vacation, Lunch, Day Off"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
              <input type="date" value={blockDateStart} onChange={e => setBlockDateStart(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">End Date</label>
              <input type="date" value={blockDateEnd} onChange={e => setBlockDateEnd(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="allday" checked={blockAllDay} onChange={e => setBlockAllDay(e.target.checked)}
                className="w-4 h-4 accent-emerald-600" />
              <label htmlFor="allday" className="text-sm text-gray-600">All day</label>
            </div>
            {!blockAllDay && (
              <>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                  <input type="time" value={blockTimeStart} onChange={e => setBlockTimeStart(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                  <input type="time" value={blockTimeEnd} onChange={e => setBlockTimeEnd(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              </>
            )}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Color</label>
              <div className="flex gap-1.5">
                {BLOCK_COLORS.map(c => (
                  <button key={c.value} onClick={() => setBlockColor(c.value)}
                    title={c.label}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${blockColor === c.value ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c.value }} />
                ))}
              </div>
            </div>
            <button onClick={handleAddTimeBlock}
              disabled={saving || !blockLabel.trim() || !blockDateStart || !blockDateEnd}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" /> Add Block
            </button>
          </div>
        </div>

        {/* Time blocks list */}
        {timeBlocks.length === 0 ? (
          <div className="py-10 text-center">
            <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No time blocks yet</p>
            <p className="text-sm text-gray-300 mt-1">Block off vacation, lunch, or days off above</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {timeBlocks.map(block => (
              <div key={block.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: block.color }} />
                  <div>
                    <p className="font-medium text-gray-900">{block.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {block.dateStart === block.dateEnd ? block.dateStart : `${block.dateStart} → ${block.dateEnd}`}
                      {!block.allDay && block.timeStart && ` · ${block.timeStart} - ${block.timeEnd}`}
                      {block.allDay && ' · All day'}
                    </p>
                  </div>
                </div>
                <button onClick={() => removeTimeBlock(block.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SERVICES SECTION ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Services & Pricing Tiers</h2>
            <p className="text-sm text-gray-400 mt-0.5">Add services with different durations and prices</p>
          </div>
          <span className="text-sm text-gray-400">{services.length} service{services.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Add new service */}
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Add New Service</p>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-48">
              <label className="text-xs text-gray-500 mb-1 block">Service Name</label>
              <input value={newServiceName} onChange={e => setNewServiceName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddService()}
                placeholder="e.g. Deep Tissue Massage"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Color</label>
              <div className="flex gap-1.5 flex-wrap">
                {COLOR_OPTIONS.map(c => (
                  <button key={c} onClick={() => setNewServiceColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${newServiceColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <button onClick={handleAddService} disabled={saving || !newServiceName.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>
        </div>

        {/* Services list */}
        {services.length === 0 ? (
          <div className="py-12 text-center">
            <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No services yet</p>
            <p className="text-sm text-gray-300 mt-1">Add your first service above</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {services.map(service => (
              <div key={service.id} className="px-6 py-5">
                {editingServiceId === service.id ? (
                  <div className="flex flex-wrap gap-3 items-center mb-4">
                    <input value={editingServiceName} onChange={e => setEditingServiceName(e.target.value)}
                      className="flex-1 min-w-48 px-3 py-1.5 border border-emerald-300 rounded-xl text-sm focus:outline-none" />
                    <div className="flex gap-1.5 flex-wrap">
                      {COLOR_OPTIONS.map(c => (
                        <button key={c} onClick={() => setEditingServiceColor(c)}
                          className={`w-5 h-5 rounded-full border-2 transition-all ${editingServiceColor === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveServiceEdit(service.id)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                        <Check className="w-4 h-4 text-emerald-600" />
                      </button>
                      <button onClick={() => setEditingServiceId(null)}
                        className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: service.color }} />
                      <span className="font-semibold text-gray-900">{service.name}</span>
                      <span className="text-xs text-gray-400">{service.tiers.length} tier{service.tiers.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setEditingServiceId(service.id);
                        setEditingServiceName(service.name);
                        setEditingServiceColor(service.color);
                      }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button onClick={() => handleDeleteService(service.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="ml-6 space-y-2">
                  {service.tiers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {service.tiers.map(tier => (
                        <div key={tier.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                          <span className="text-gray-600 font-medium">{tier.duration} min</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-emerald-600 font-semibold">${tier.price}</span>
                          <button onClick={() => removeTier(service.id, tier.id)}
                            className="ml-1 hover:text-red-400 text-gray-300 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <input type="number" placeholder="Duration (min)"
                      value={tierInputs[service.id]?.duration || ''}
                      onChange={e => setTierInputs(prev => ({ ...prev, [service.id]: { ...prev[service.id], duration: e.target.value } }))}
                      className="w-36 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                    <input type="number" placeholder="Price ($)"
                      value={tierInputs[service.id]?.price || ''}
                      onChange={e => setTierInputs(prev => ({ ...prev, [service.id]: { ...prev[service.id], price: e.target.value } }))}
                      className="w-28 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                    <button onClick={() => handleAddTier(service.id)}
                      disabled={!tierInputs[service.id]?.duration || !tierInputs[service.id]?.price}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-sm font-medium disabled:opacity-40 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Tier
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ADD-ONS SECTION ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Add-ons</h2>
            <p className="text-sm text-gray-400 mt-0.5">Extra services that can be added to any appointment</p>
          </div>
          <span className="text-sm text-gray-400">{addons.length} add-on{addons.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Add New Add-on</p>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="text-xs text-gray-500 mb-1 block">Add-on Name</label>
              <input value={newAddonName} onChange={e => setNewAddonName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddAddon()}
                placeholder="e.g. Hot Stones"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <div className="w-32">
              <label className="text-xs text-gray-500 mb-1 block">Price ($)</label>
              <input type="number" value={newAddonPrice} onChange={e => setNewAddonPrice(e.target.value)}
                placeholder="15"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
            </div>
            <button onClick={handleAddAddon} disabled={saving || !newAddonName.trim() || !newAddonPrice}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-lg transition-all">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
        {addons.length === 0 ? (
          <div className="py-12 text-center">
            <Sparkles className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No add-ons yet</p>
            <p className="text-sm text-gray-300 mt-1">Add things like Hot Stones, Cupping, Aromatherapy</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {addons.map(addon => (
              <div key={addon.id} className="px-6 py-4 flex items-center justify-between">
                {editingAddonId === addon.id ? (
                  <div className="flex gap-3 items-center flex-1">
                    <input value={editingAddonName} onChange={e => setEditingAddonName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-emerald-300 rounded-xl text-sm focus:outline-none" />
                    <input type="number" value={editingAddonPrice} onChange={e => setEditingAddonPrice(e.target.value)}
                      className="w-24 px-3 py-1.5 border border-emerald-300 rounded-xl text-sm focus:outline-none" />
                    <button onClick={() => handleSaveAddonEdit(addon.id)}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </button>
                    <button onClick={() => setEditingAddonId(null)}
                      className="p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg">
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="font-medium text-gray-900">{addon.name}</span>
                      <span className="text-emerald-600 font-semibold">+${addon.price}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setEditingAddonId(addon.id);
                        setEditingAddonName(addon.name);
                        setEditingAddonPrice(String(addon.price));
                      }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button onClick={() => handleDeleteAddon(addon.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* ── HOURS OF OPERATION ── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Hours of Operation</h2>
          <p className="text-sm text-gray-400 mt-0.5">Set which days and hours Allison is available</p>
        </div>
        <div className="divide-y divide-gray-50">
          {hours.sort((a, b) => a.dayOfWeek - b.dayOfWeek).map(day => (
            <div key={day.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
              <div className="w-24 flex-shrink-0">
                <span className="font-medium text-gray-900">{DAY_NAMES[day.dayOfWeek]}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateHours({ ...day, isOpen: !day.isOpen })}
                  className={`relative w-10 h-6 rounded-full transition-colors ${day.isOpen ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${day.isOpen ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
                <span className={`text-sm ${day.isOpen ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                  {day.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              {day.isOpen && (
                <div className="flex items-center gap-2">
                  <input type="time" value={day.openTime}
                    onChange={e => updateHours({ ...day, openTime: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                  <span className="text-gray-400 text-sm">to</span>
                  <input type="time" value={day.closeTime}
                    onChange={e => updateHours({ ...day, closeTime: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;