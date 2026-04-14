import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Search, Phone, Mail, Calendar, DollarSign, Clock, ChevronRight, X, User, Star, FileText, Plus, Trash2, Edit2 } from 'lucide-react';
import type { Client } from '@/data/sampleData';

const blank = {
  name: '', email: '', phone: '', avatar: '', 
  joinDate: new Date().toISOString().split('T')[0],
  totalSpent: 0, sessionsCount: 0, 
  lastVisit: new Date().toISOString().split('T')[0],
  notes: '', preferredService: '', balance: 0,
};

const avatarColors = [
  'from-emerald-400 to-teal-300', 'from-blue-400 to-cyan-300', 'from-purple-400 to-violet-300',
  'from-pink-400 to-rose-300', 'from-amber-400 to-orange-300', 'from-indigo-400 to-blue-300',
];

const getInitials = (name: string) => 
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

interface FormFieldsProps {
  form: typeof blank;
  onChange: (field: string, value: string) => void;
}

const FormFields: React.FC<FormFieldsProps> = ({ form, onChange }) => (
  <div className="space-y-3">
    <div>
      <label className="text-xs font-medium text-gray-600">Full Name *</label>
      <input 
        value={form.name} 
        onChange={e => onChange('name', e.target.value)}
        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" 
        placeholder="Jane Smith" 
      />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs font-medium text-gray-600">Email</label>
        <input 
          value={form.email} 
          onChange={e => onChange('email', e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" 
          placeholder="jane@email.com" 
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600">Phone</label>
        <input 
          value={form.phone} 
          onChange={e => onChange('phone', e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" 
          placeholder="(555) 000-0000" 
        />
      </div>
    </div>
    <div>
      <label className="text-xs font-medium text-gray-600">Preferred Service</label>
      <select
        value={form.preferredService}
        onChange={e => onChange('preferredService', e.target.value)}
        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
      >
        <option value="">Select a service...</option>
        <option value="Aromatherapy">Aromatherapy</option>
        <option value="Couples">Couples</option>
        <option value="Deep Tissue">Deep Tissue</option>
        <option value="Hot Stone">Hot Stone</option>
        <option value="Prenatal">Prenatal</option>
        <option value="Reflexology">Reflexology</option>
        <option value="Relaxation">Relaxation</option>
        <option value="Sports Massage">Sports Massage</option>
        <option value="Swedish">Swedish</option>
        <option value="Thai Massage">Thai Massage</option>
        <option value="Therapeutic">Therapeutic</option>
      </select>
    </div>
    <div>
      <label className="text-xs font-medium text-gray-600">Notes</label>
      <textarea 
        value={form.notes} 
        onChange={e => onChange('notes', e.target.value)}
        rows={3} 
        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" 
        placeholder="Session notes, preferences..." 
      />
    </div>
  </div>
);

const ClientManagement: React.FC = () => {
  const { clients, searchQuery, setSearchQuery, weekAppts, addClient, deleteClient, updateClientItem } = useAppContext();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'lastVisit'>('name');
  const [filterService, setFilterService] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ ...blank });
  const [saving, setSaving] = useState(false);

  const handleFormChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const services = useMemo(() => {
    const s = new Set(clients.map(c => c.preferredService));
    return ['all', ...Array.from(s).sort()];
  }, [clients]);

  const filteredClients = useMemo(() => {
    let result = clients.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.preferredService.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filterService !== 'all') result = result.filter(c => c.preferredService === filterService);
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'totalSpent') return b.totalSpent - a.totalSpent;
      return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
    });
    return result;
  }, [clients, searchQuery, sortBy, filterService]);

  const getClientAppts = (clientId: string) => weekAppts.filter(a => a.clientId === clientId);

  const handleAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await addClient({ ...form, avatar: getInitials(form.name) });
    setSaving(false);
    setShowAddModal(false);
    setForm({ ...blank });
  };

  const handleEdit = async () => {
    if (!selectedClient || !form.name.trim()) return;
    setSaving(true);
    await updateClientItem(selectedClient.id, { ...form, avatar: getInitials(form.name) });
    setSaving(false);
    setShowEditModal(false);
    setSelectedClient(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;
    await deleteClient(id);
    setSelectedClient(null);
  };

  const openEdit = (client: Client) => {
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      avatar: client.avatar,
      joinDate: client.joinDate,
      totalSpent: client.totalSpent,
      sessionsCount: client.sessionsCount,
      lastVisit: client.lastVisit,
      notes: client.notes,
      preferredService: client.preferredService,
      balance: client.balance,
    });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-500 mt-1">{clients.length} active clients</p>
        </div>
        <button
          onClick={() => { setForm({ ...blank }); setShowAddModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Client
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search clients by name, email, or service..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all" />
        </div>
        <select value={filterService} onChange={e => setFilterService(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none">
          {services.map(s => <option key={s} value={s}>{s === 'all' ? 'All Services' : s}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none">
          <option value="name">Sort by Name</option>
          <option value="totalSpent">Sort by Spending</option>
          <option value="lastVisit">Sort by Last Visit</option>
        </select>
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map((client, idx) => (
          <div key={client.id} onClick={() => setSelectedClient(client)}
            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                {client.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 truncate">{client.name}</h3>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors flex-shrink-0" />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{client.preferredService}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />${client.totalSpent.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />{client.sessionsCount} sessions
                  </span>
                </div>
                {client.balance > 0 && (
                  <span className="inline-block mt-2 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                    ${client.balance} outstanding
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No clients found.</p>
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && !showEditModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setSelectedClient(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative bg-gradient-to-br from-[#2d4a3e] to-[#1a3028] rounded-t-2xl p-6 text-white">
              <button onClick={() => setSelectedClient(null)} className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center text-[#1a3028] font-bold text-lg">
                  {selectedClient.avatar}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{selectedClient.name}</h2>
                  <p className="text-emerald-300/70 text-sm">Client since {new Date(selectedClient.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(selectedClient)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(selectedClient.id)} className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-red-300" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <a href={`mailto:${selectedClient.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 bg-gray-50 rounded-xl px-3 py-2.5">
                  <Mail className="w-4 h-4" /> {selectedClient.email}
                </a>
                <a href={`tel:${selectedClient.phone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 bg-gray-50 rounded-xl px-3 py-2.5">
                  <Phone className="w-4 h-4" /> {selectedClient.phone}
                </a>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-emerald-700">${selectedClient.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600">Total Spent</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-blue-700">{selectedClient.sessionsCount}</p>
                  <p className="text-xs text-blue-600">Sessions</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-purple-700">${selectedClient.sessionsCount > 0 ? (selectedClient.totalSpent / selectedClient.sessionsCount).toFixed(0) : 0}</p>
                  <p className="text-xs text-purple-600">Avg/Session</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-gray-600">Preferred: <strong>{selectedClient.preferredService}</strong></span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Session Notes</span>
                </div>
                <p className="text-sm text-gray-600">{selectedClient.notes || 'No notes yet.'}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Appointments</h4>
                <div className="space-y-2">
                  {getClientAppts(selectedClient.id).length > 0 ? getClientAppts(selectedClient.id).map(appt => (
                    <div key={appt.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{appt.service}</p>
                        <p className="text-xs text-gray-400">{appt.date} at {appt.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">${appt.price}</p>
                        <span className={`text-xs ${appt.paid ? 'text-emerald-600' : 'text-amber-600'}`}>{appt.paid ? 'Paid' : 'Pending'}</span>
                      </div>
                    </div>
                  )) : <p className="text-sm text-gray-400 text-center py-3">No appointments this week</p>}
                </div>
              </div>
              {selectedClient.balance > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-800">Outstanding Balance</p>
                    <p className="text-xs text-amber-600">Payment reminder needed</p>
                  </div>
                  <p className="text-xl font-bold text-amber-700">${selectedClient.balance}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                Last visit: {new Date(selectedClient.lastVisit).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Add New Client</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <FormFields form={form} onChange={handleFormChange} />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAdd} disabled={saving || !form.name.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Edit Client</h2>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <FormFields form={form} onChange={handleFormChange} />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleEdit} disabled={saving || !form.name.trim()}
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

export default ClientManagement;