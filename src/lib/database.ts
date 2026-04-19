import { supabase } from '@/lib/supabase';
import type { Client, Appointment, Expense, IncomeEntry, Service, ServiceTier, AddOn } from '@/data/sampleData';
import {
  clients as seedClients,
  weekAppointments as seedAppointments,
  expenses as seedExpenses,
  incomeEntries as seedIncome,
} from '@/data/sampleData';

// ── Mappers: DB row → Frontend type ──────────────────────────────

function mapClient(row: any): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    avatar: row.avatar,
    joinDate: row.join_date,
    totalSpent: Number(row.total_spent),
    sessionsCount: Number(row.sessions_count),
    lastVisit: row.last_visit,
    notes: row.notes,
    preferredService: row.preferred_service,
    balance: Number(row.balance),
  };
}

function mapAppointment(row: any): Appointment {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name,
    service: row.service,
    date: row.date,
    time: row.time,
    duration: Number(row.duration),
    price: Number(row.price),
    status: row.status,
    paid: row.paid,
    tip: Number(row.tip),
    color: row.color,
  };
}

function mapExpense(row: any): Expense {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    amount: Number(row.amount),
    date: row.date,
    receipt: row.receipt,
    vendor: row.vendor,
  };
}

function mapIncome(row: any): IncomeEntry {
  return {
    id: row.id,
    category: row.category,
    description: row.description,
    amount: Number(row.amount),
    date: row.date,
    clientName: row.client_name || undefined,
  };
}

function mapService(row: any, tiers: ServiceTier[]): Service {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    isActive: row.is_active,
    tiers,
  };
}

function mapTier(row: any): ServiceTier {
  return {
    id: row.id,
    serviceId: row.service_id,
    duration: Number(row.duration),
    price: Number(row.price),
  };
}

function mapAddOn(row: any): AddOn {
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    isActive: row.is_active,
  };
}

function mapTimeBlock(row: any): TimeBlock {
  return {
    id: row.id,
    label: row.label,
    dateStart: row.date_start,
    dateEnd: row.date_end,
    timeStart: row.time_start || undefined,
    timeEnd: row.time_end || undefined,
    allDay: row.all_day,
    color: row.color,
  };
}

// ── Time Block type ───────────────────────────────────────────────

export interface TimeBlock {
  id: string;
  label: string;
  dateStart: string;
  dateEnd: string;
  timeStart?: string;
  timeEnd?: string;
  allDay: boolean;
  color: string;
}

// ── Seed check & migration ────────────────────────────────────────

export async function checkAndSeedData(): Promise<void> {
  const { data: status } = await supabase
    .from('seed_status')
    .select('seeded')
    .eq('id', 'main')
    .single();

  if (status?.seeded) return;

  const clientRows = seedClients.map(c => ({
    id: c.id, name: c.name, email: c.email, phone: c.phone, avatar: c.avatar,
    join_date: c.joinDate, total_spent: c.totalSpent, sessions_count: c.sessionsCount,
    last_visit: c.lastVisit, notes: c.notes, preferred_service: c.preferredService, balance: c.balance,
  }));
  await supabase.from('clients').upsert(clientRows, { onConflict: 'id' });

  const apptRows = seedAppointments.map(a => ({
    id: a.id, client_id: a.clientId, client_name: a.clientName, service: a.service,
    date: a.date, time: a.time, duration: a.duration, price: a.price,
    status: a.status, paid: a.paid, tip: a.tip, color: a.color,
  }));
  await supabase.from('appointments').upsert(apptRows, { onConflict: 'id' });

  const expRows = seedExpenses.map(e => ({
    id: e.id, category: e.category, description: e.description,
    amount: e.amount, date: e.date, receipt: e.receipt, vendor: e.vendor,
  }));
  await supabase.from('expenses').upsert(expRows, { onConflict: 'id' });

  const incRows = seedIncome.map(i => ({
    id: i.id, category: i.category, description: i.description,
    amount: i.amount, date: i.date, client_name: i.clientName || null,
  }));
  await supabase.from('income_entries').upsert(incRows, { onConflict: 'id' });

  await supabase.from('seed_status').upsert({ id: 'main', seeded: true, seeded_at: new Date().toISOString() }, { onConflict: 'id' });
}

// ── Clients ───────────────────────────────────────────────────────

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('clients').select('*').order('name');
  if (error) throw error;
  return (data || []).map(mapClient);
}

export async function createClient(client: Omit<Client, 'id'>): Promise<Client> {
  const row = {
    id: `c${Date.now()}`,
    name: client.name, email: client.email, phone: client.phone, avatar: client.avatar,
    join_date: client.joinDate, total_spent: client.totalSpent, sessions_count: client.sessionsCount,
    last_visit: client.lastVisit, notes: client.notes, preferred_service: client.preferredService,
    balance: client.balance,
  };
  const { data, error } = await supabase.from('clients').insert(row).select().single();
  if (error) throw error;
  return mapClient(data);
}

export async function updateClient(id: string, updates: Partial<Record<string, any>>): Promise<Client> {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.email !== undefined) dbUpdates.email = updates.email;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.totalSpent !== undefined) dbUpdates.total_spent = updates.totalSpent;
  if (updates.sessionsCount !== undefined) dbUpdates.sessions_count = updates.sessionsCount;
  if (updates.lastVisit !== undefined) dbUpdates.last_visit = updates.lastVisit;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.preferredService !== undefined) dbUpdates.preferred_service = updates.preferredService;
  if (updates.balance !== undefined) dbUpdates.balance = updates.balance;
  const { data, error } = await supabase.from('clients').update(dbUpdates).eq('id', id).select().single();
  if (error) throw error;
  return mapClient(data);
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase.from('clients').delete().eq('id', id);
  if (error) throw error;
}

// ── Appointments ──────────────────────────────────────────────────

export async function fetchAppointments(dateFrom?: string, dateTo?: string): Promise<Appointment[]> {
  let query = supabase.from('appointments').select('*').order('date').order('time');
  if (dateFrom) query = query.gte('date', dateFrom);
  if (dateTo) query = query.lte('date', dateTo);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(mapAppointment);
}

export async function createAppointment(appt: Omit<Appointment, 'id'>): Promise<Appointment> {
  const row = {
    id: `a${Date.now()}`,
    client_id: appt.clientId, client_name: appt.clientName, service: appt.service,
    date: appt.date, time: appt.time, duration: appt.duration, price: appt.price,
    status: appt.status, paid: appt.paid, tip: appt.tip, color: appt.color,
  };
  const { data, error } = await supabase.from('appointments').insert(row).select().single();
  if (error) throw error;
  return mapAppointment(data);
}

export async function updateAppointment(id: string, updates: Partial<Record<string, any>>): Promise<Appointment> {
  const dbUpdates: any = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.paid !== undefined) dbUpdates.paid = updates.paid;
  if (updates.tip !== undefined) dbUpdates.tip = updates.tip;
  const { data, error } = await supabase.from('appointments').update(dbUpdates).eq('id', id).select().single();
  if (error) throw error;
  return mapAppointment(data);
}

export async function editAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
  const dbUpdates: any = {};
  if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
  if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
  if (updates.service !== undefined) dbUpdates.service = updates.service;
  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.time !== undefined) dbUpdates.time = updates.time;
  if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.paid !== undefined) dbUpdates.paid = updates.paid;
  if (updates.tip !== undefined) dbUpdates.tip = updates.tip;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  const { data, error } = await supabase.from('appointments').update(dbUpdates).eq('id', id).select().single();
  if (error) throw error;
  return mapAppointment(data);
}

export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from('appointments').delete().eq('id', id);
  if (error) throw error;
}

// ── Expenses ──────────────────────────────────────────────────────

export async function fetchExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapExpense);
}

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<Expense> {
  const row = {
    id: `e${Date.now()}`, category: expense.category, description: expense.description,
    amount: expense.amount, date: expense.date, receipt: expense.receipt, vendor: expense.vendor,
  };
  const { data, error } = await supabase.from('expenses').insert(row).select().single();
  if (error) throw error;
  return mapExpense(data);
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}

// ── Income ────────────────────────────────────────────────────────

export async function fetchIncome(): Promise<IncomeEntry[]> {
  const { data, error } = await supabase.from('income_entries').select('*').order('date', { ascending: false });
  if (error) throw error;
  return (data || []).map(mapIncome);
}

export async function createIncome(entry: Omit<IncomeEntry, 'id'>): Promise<IncomeEntry> {
  const row = {
    id: `i${Date.now()}`, category: entry.category, description: entry.description,
    amount: entry.amount, date: entry.date, client_name: entry.clientName || null,
  };
  const { data, error } = await supabase.from('income_entries').insert(row).select().single();
  if (error) throw error;
  return mapIncome(data);
}

export async function deleteIncome(id: string): Promise<void> {
  const { error } = await supabase.from('income_entries').delete().eq('id', id);
  if (error) throw error;
}

// ── Services ──────────────────────────────────────────────────────

export async function fetchServices(): Promise<Service[]> {
  const { data: serviceRows, error: sErr } = await supabase.from('services').select('*').order('name');
  if (sErr) throw sErr;
  const { data: tierRows, error: tErr } = await supabase.from('service_tiers').select('*').order('duration');
  if (tErr) throw tErr;
  return (serviceRows || []).map(s =>
    mapService(s, (tierRows || []).filter(t => t.service_id === s.id).map(mapTier))
  );
}

export async function createService(name: string, color: string): Promise<Service> {
  const id = `svc${Date.now()}`;
  const { data, error } = await supabase.from('services').insert({ id, name, color, is_active: true }).select().single();
  if (error) throw error;
  return mapService(data, []);
}

export async function updateService(id: string, updates: { name?: string; color?: string; isActive?: boolean }): Promise<void> {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.color !== undefined) dbUpdates.color = updates.color;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  const { error } = await supabase.from('services').update(dbUpdates).eq('id', id);
  if (error) throw error;
}

export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertServiceTier(tier: Omit<ServiceTier, 'id'> & { id?: string }): Promise<ServiceTier> {
  const row = {
    id: tier.id || `tier${Date.now()}`,
    service_id: tier.serviceId, duration: tier.duration, price: tier.price,
  };
  const { data, error } = await supabase.from('service_tiers').upsert(row, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return mapTier(data);
}

export async function deleteServiceTier(id: string): Promise<void> {
  const { error } = await supabase.from('service_tiers').delete().eq('id', id);
  if (error) throw error;
}

// ── Add-ons ───────────────────────────────────────────────────────

export async function fetchAddOns(): Promise<AddOn[]> {
  const { data, error } = await supabase.from('addons').select('*').order('name');
  if (error) throw error;
  return (data || []).map(mapAddOn);
}

export async function createAddOn(name: string, price: number): Promise<AddOn> {
  const row = { id: `addon${Date.now()}`, name, price, is_active: true };
  const { data, error } = await supabase.from('addons').insert(row).select().single();
  if (error) throw error;
  return mapAddOn(data);
}

export async function updateAddOn(id: string, updates: { name?: string; price?: number; isActive?: boolean }): Promise<void> {
  const dbUpdates: any = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.price !== undefined) dbUpdates.price = updates.price;
  if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
  const { error } = await supabase.from('addons').update(dbUpdates).eq('id', id);
  if (error) throw error;
}

export async function deleteAddOn(id: string): Promise<void> {
  const { error } = await supabase.from('addons').delete().eq('id', id);
  if (error) throw error;
}

// ── App Settings ──────────────────────────────────────────────────

export async function fetchBufferTime(): Promise<number> {
  const { data, error } = await supabase
    .from('app_settings').select('value').eq('key', 'buffer_time').single();
  if (error) return 15;
  return parseInt(data.value) || 15;
}

export async function saveBufferTime(minutes: number): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: 'buffer_time', value: String(minutes) }, { onConflict: 'key' });
  if (error) throw error;
}

// ── Time Blocks ───────────────────────────────────────────────────

export async function fetchTimeBlocks(): Promise<TimeBlock[]> {
  const { data, error } = await supabase.from('time_blocks').select('*').order('date_start');
  if (error) throw error;
  return (data || []).map(mapTimeBlock);
}

export async function createTimeBlock(block: Omit<TimeBlock, 'id'>): Promise<TimeBlock> {
  const row = {
    id: `tb${Date.now()}`,
    label: block.label, date_start: block.dateStart, date_end: block.dateEnd,
    time_start: block.timeStart || null, time_end: block.timeEnd || null,
    all_day: block.allDay, color: block.color,
  };
  const { data, error } = await supabase.from('time_blocks').insert(row).select().single();
  if (error) throw error;
  return mapTimeBlock(data);
}

export async function deleteTimeBlock(id: string): Promise<void> {
  const { error } = await supabase.from('time_blocks').delete().eq('id', id);
  if (error) throw error;
}
// ── Hours of Operation ────────────────────────────────────────────

export interface HoursOfOperation {
  id: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

function mapHours(row: any): HoursOfOperation {
  return {
    id: row.id,
    dayOfWeek: row.day_of_week,
    isOpen: row.is_open,
    openTime: row.open_time,
    closeTime: row.close_time,
  };
}

export async function fetchHours(): Promise<HoursOfOperation[]> {
  const { data, error } = await supabase
    .from('hours_of_operation')
    .select('*')
    .order('day_of_week');
  if (error) throw error;
  return (data || []).map(mapHours);
}

export async function saveHours(hours: HoursOfOperation): Promise<void> {
  const { error } = await supabase
    .from('hours_of_operation')
    .upsert({
      id: hours.id,
      day_of_week: hours.dayOfWeek,
      is_open: hours.isOpen,
      open_time: hours.openTime,
      close_time: hours.closeTime,
    }, { onConflict: 'id' });
  if (error) throw error;
}