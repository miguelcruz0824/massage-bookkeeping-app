import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import type { Client, Appointment, Expense, IncomeEntry, Service, AddOn } from '@/data/sampleData';
import * as db from '@/lib/database';

export type PageView = 'dashboard' | 'clients' | 'income' | 'expenses' | 'calendar' | 'reports' | 'settings';

interface AppContextType {
  // Navigation
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Loading & Error
  loading: boolean;
  error: string | null;
  retryLoad: () => void;

  // Data
  clients: Client[];
  expenses: Expense[];
  income: IncomeEntry[];
  todayAppts: Appointment[];
  weekAppts: Appointment[];
  services: Service[];
  addons: AddOn[];

  // Actions
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  addIncome: (entry: Omit<IncomeEntry, 'id'>) => Promise<void>;
  markAppointmentPaid: (id: string) => Promise<void>;
  deleteExpenseItem: (id: string) => Promise<void>;
  deleteIncomeItem: (id: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  updateClientItem: (id: string, updates: Partial<Client>) => Promise<void>;
  addAppointment: (appt: Omit<Appointment, 'id'>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  editAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;

  // Service actions
  addService: (name: string, color: string) => Promise<Service>;
  removeService: (id: string) => Promise<void>;
  editService: (id: string, updates: { name?: string; color?: string; isActive?: boolean }) => Promise<void>;
  addTier: (serviceId: string, duration: number, price: number) => Promise<void>;
  removeTier: (serviceId: string, tierId: string) => Promise<void>;

  // Add-on actions
  addAddOn: (name: string, price: number) => Promise<void>;
  removeAddOn: (id: string) => Promise<void>;
  editAddOn: (id: string, updates: { name?: string; price?: number; isActive?: boolean }) => Promise<void>;

  // Client detail
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;

  // Per-operation loading
  savingExpense: boolean;
  savingIncome: boolean;
  updatingAppointment: string | null;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Loading & Error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data
  const [clients, setClients] = useState<Client[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<IncomeEntry[]>([]);
  const [allAppts, setAllAppts] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [addons, setAddons] = useState<AddOn[]>([]);

  // Client detail
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Per-operation loading
  const [savingExpense, setSavingExpense] = useState(false);
  const [savingIncome, setSavingIncome] = useState(false);
  const [updatingAppointment, setUpdatingAppointment] = useState<string | null>(null);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  // Derived: today & week appointments
  const todayAppts = allAppts.filter(a => a.date === '2026-04-01');
  const weekAppts = allAppts;

  // ── Load all data ──────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await db.checkAndSeedData();
      const [clientsData, apptsData, expensesData, incomeData, servicesData, addonsData] = await Promise.all([
        db.fetchClients(),
        db.fetchAppointments('2026-03-29', '2026-04-03'),
        db.fetchExpenses(),
        db.fetchIncome(),
        db.fetchServices(),
        db.fetchAddOns(),
      ]);
      setClients(clientsData);
      setAllAppts(apptsData);
      setExpenses(expensesData);
      setIncome(incomeData);
      setServices(servicesData);
      setAddons(addonsData);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message || 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ── Expense actions ────────────────────────────────────────────
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    setSavingExpense(true);
    try {
      const created = await db.createExpense(expense);
      setExpenses(prev => [created, ...prev]);
      toast({ title: 'Expense Added', description: `$${expense.amount.toFixed(2)} for ${expense.description}` });
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to save expense.', variant: 'destructive' });
    } finally {
      setSavingExpense(false);
    }
  };

  const addIncome = async (entry: Omit<IncomeEntry, 'id'>) => {
    setSavingIncome(true);
    try {
      const created = await db.createIncome(entry);
      setIncome(prev => [created, ...prev]);
      toast({ title: 'Income Recorded', description: `$${entry.amount.toFixed(2)} - ${entry.description}` });
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to save income.', variant: 'destructive' });
    } finally {
      setSavingIncome(false);
    }
  };

  const markAppointmentPaid = async (id: string) => {
    setUpdatingAppointment(id);
    try {
      const updated = await db.updateAppointment(id, { paid: true, status: 'completed' });
      setAllAppts(prev => prev.map(a => a.id === id ? updated : a));
      toast({ title: 'Payment Recorded', description: 'Appointment marked as paid.' });
    } catch (err: any) {
      toast({ title: 'Error', description: 'Failed to record payment.', variant: 'destructive' });
    } finally {
      setUpdatingAppointment(null);
    }
  };

  const deleteExpenseItem = async (id: string) => {
    try {
      await db.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast({ title: 'Expense Deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete expense.', variant: 'destructive' });
    }
  };

  const deleteIncomeItem = async (id: string) => {
    try {
      await db.deleteIncome(id);
      setIncome(prev => prev.filter(i => i.id !== id));
      toast({ title: 'Income Deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete income entry.', variant: 'destructive' });
    }
  };

  // ── Client actions ─────────────────────────────────────────────
  const addClient = async (client: Omit<Client, 'id'>) => {
    try {
      const created = await db.createClient(client);
      setClients(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      toast({ title: 'Client Added', description: `${client.name} has been added.` });
    } catch {
      toast({ title: 'Error', description: 'Failed to add client.', variant: 'destructive' });
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await db.deleteClient(id);
      setClients(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Client Deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete client.', variant: 'destructive' });
    }
  };

  const updateClientItem = async (id: string, updates: Partial<Client>) => {
    try {
      const updated = await db.updateClient(id, updates);
      setClients(prev => prev.map(c => c.id === id ? updated : c));
      toast({ title: 'Client Updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update client.', variant: 'destructive' });
    }
  };

  // ── Appointment actions ────────────────────────────────────────
  const addAppointment = async (appt: Omit<Appointment, 'id'>) => {
    try {
      const created = await db.createAppointment(appt);
      setAllAppts(prev => [...prev, created]);
      toast({ title: 'Appointment Added', description: `${appt.clientName} on ${appt.date} at ${appt.time}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to add appointment.', variant: 'destructive' });
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await db.deleteAppointment(id);
      setAllAppts(prev => prev.filter(a => a.id !== id));
      toast({ title: 'Appointment Deleted' });
    } catch {
      toast({ title: 'Error', description: 'Failed to delete appointment.', variant: 'destructive' });
    }
  };

  const editAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const updated = await db.editAppointment(id, updates);
      setAllAppts(prev => prev.map(a => a.id === id ? updated : a));
      toast({ title: 'Appointment Updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update appointment.', variant: 'destructive' });
    }
  };

  // ── Service actions ────────────────────────────────────────────
  const addService = async (name: string, color: string): Promise<Service> => {
    const created = await db.createService(name, color);
    setServices(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    toast({ title: 'Service Added', description: `${name} has been added.` });
    return created;
  };

  const removeService = async (id: string) => {
    await db.deleteService(id);
    setServices(prev => prev.filter(s => s.id !== id));
    toast({ title: 'Service Deleted' });
  };

  const editService = async (id: string, updates: { name?: string; color?: string; isActive?: boolean }) => {
    await db.updateService(id, updates);
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const addTier = async (serviceId: string, duration: number, price: number) => {
    const tier = await db.upsertServiceTier({ serviceId, duration, price });
    setServices(prev => prev.map(s =>
      s.id === serviceId ? { ...s, tiers: [...s.tiers.filter(t => t.duration !== duration), tier].sort((a, b) => a.duration - b.duration) } : s
    ));
  };

  const removeTier = async (serviceId: string, tierId: string) => {
    await db.deleteServiceTier(tierId);
    setServices(prev => prev.map(s =>
      s.id === serviceId ? { ...s, tiers: s.tiers.filter(t => t.id !== tierId) } : s
    ));
  };

  // ── Add-on actions ─────────────────────────────────────────────
  const addAddOn = async (name: string, price: number) => {
    const created = await db.createAddOn(name, price);
    setAddons(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    toast({ title: 'Add-on Created', description: `${name} added.` });
  };

  const removeAddOn = async (id: string) => {
    await db.deleteAddOn(id);
    setAddons(prev => prev.filter(a => a.id !== id));
    toast({ title: 'Add-on Deleted' });
  };

  const editAddOn = async (id: string, updates: { name?: string; price?: number; isActive?: boolean }) => {
    await db.updateAddOn(id, updates);
    setAddons(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  return (
    <AppContext.Provider value={{
      sidebarOpen, toggleSidebar, currentPage, setCurrentPage,
      searchQuery, setSearchQuery,
      loading, error, retryLoad: loadAllData,
      clients, expenses, income, todayAppts, weekAppts,
      services, addons,
      addExpense, addIncome, markAppointmentPaid,
      deleteExpenseItem, deleteIncomeItem,
      addClient, deleteClient, updateClientItem,
      addAppointment, deleteAppointment, editAppointment,
      addService, removeService, editService, addTier, removeTier,
      addAddOn, removeAddOn, editAddOn,
      selectedClient, setSelectedClient,
      savingExpense, savingIncome, updatingAppointment,
    }}>
      {children}
    </AppContext.Provider>
  );
};