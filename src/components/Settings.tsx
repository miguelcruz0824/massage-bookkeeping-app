import React, { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Plus, Trash2, Edit2, Check, X, Settings as SettingsIcon, Sparkles } from 'lucide-react';

const COLOR_OPTIONS = [
  '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ec4899',
  '#3b82f6', '#f43f5e', '#14b8a6', '#e879f9', '#f97316',
  '#22c55e', '#ef4444', '#a855f7', '#0ea5e9', '#84cc16',
];

const Settings: React.FC = () => {
  const {
    services, addons,
    addService, removeService, editService, addTier, removeTier,
    addAddOn, removeAddOn, editAddOn,
  } = useAppContext();

  // ── Service form state ─────────────────────────────────────────
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceColor, setNewServiceColor] = useState('#10b981');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editingServiceName, setEditingServiceName] = useState('');
  const [editingServiceColor, setEditingServiceColor] = useState('');

  // ── Tier form state ────────────────────────────────────────────
  const [tierInputs, setTierInputs] = useState<Record<string, { duration: string; price: string }>>({});

  // ── Add-on form state ──────────────────────────────────────────
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);
  const [editingAddonName, setEditingAddonName] = useState('');
  const [editingAddonPrice, setEditingAddonPrice] = useState('');

  const [saving, setSaving] = useState(false);

  // ── Service handlers ───────────────────────────────────────────
  const handleAddService = async () => {
    if (!newServiceName.trim()) return;
    setSaving(true);
    try {
      await addService(newServiceName.trim(), newServiceColor);
      setNewServiceName('');
      setNewServiceColor('#10b981');
    } finally {
      setSaving(false);
    }
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

  // ── Tier handlers ──────────────────────────────────────────────
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
    } finally {
      setSaving(false);
    }
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
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-500 mt-0.5">Manage your services, pricing tiers, and add-ons</p>
          </div>
        </div>
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
              <input
                value={newServiceName}
                onChange={e => setNewServiceName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddService()}
                placeholder="e.g. Deep Tissue Massage"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
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
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-200 transition-all">
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
                {/* Service header */}
                {editingServiceId === service.id ? (
                  <div className="flex flex-wrap gap-3 items-center mb-4">
                    <input
                      value={editingServiceName}
                      onChange={e => setEditingServiceName(e.target.value)}
                      className="flex-1 min-w-48 px-3 py-1.5 border border-emerald-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
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

                {/* Pricing tiers */}
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

                  {/* Add tier row */}
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Duration (min)"
                      value={tierInputs[service.id]?.duration || ''}
                      onChange={e => setTierInputs(prev => ({ ...prev, [service.id]: { ...prev[service.id], duration: e.target.value } }))}
                      className="w-36 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    />
                    <input
                      type="number"
                      placeholder="Price ($)"
                      value={tierInputs[service.id]?.price || ''}
                      onChange={e => setTierInputs(prev => ({ ...prev, [service.id]: { ...prev[service.id], price: e.target.value } }))}
                      className="w-28 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    />
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

        {/* Add new addon */}
        <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Add New Add-on</p>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="text-xs text-gray-500 mb-1 block">Add-on Name</label>
              <input
                value={newAddonName}
                onChange={e => setNewAddonName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddAddon()}
                placeholder="e.g. Hot Stones"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
            </div>
            <div className="w-32">
              <label className="text-xs text-gray-500 mb-1 block">Price ($)</label>
              <input
                type="number"
                value={newAddonPrice}
                onChange={e => setNewAddonPrice(e.target.value)}
                placeholder="15"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
              />
            </div>
            <button onClick={handleAddAddon} disabled={saving || !newAddonName.trim() || !newAddonPrice}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 hover:shadow-lg hover:shadow-emerald-200 transition-all">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Add-ons list */}
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
                    <input
                      value={editingAddonName}
                      onChange={e => setEditingAddonName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-emerald-300 rounded-xl text-sm focus:outline-none"
                    />
                    <input
                      type="number"
                      value={editingAddonPrice}
                      onChange={e => setEditingAddonPrice(e.target.value)}
                      className="w-24 px-3 py-1.5 border border-emerald-300 rounded-xl text-sm focus:outline-none"
                    />
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
    </div>
  );
};

export default Settings;