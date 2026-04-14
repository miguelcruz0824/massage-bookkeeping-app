export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinDate: string;
  totalSpent: number;
  sessionsCount: number;
  lastVisit: string;
  notes: string;
  preferredService: string;
  balance: number;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'completed' | 'upcoming' | 'cancelled' | 'no-show';
  paid: boolean;
  tip: number;
  color: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  receipt: boolean;
  vendor: string;
}

export interface IncomeEntry {
  id: string;
  category: 'services' | 'products' | 'tips' | 'gift-cards';
  description: string;
  amount: number;
  date: string;
  clientName?: string;
}

export const clients: Client[] = [
  { id: 'c1', name: 'Sarah Mitchell', email: 'sarah.m@email.com', phone: '(555) 234-5678', avatar: 'SM', joinDate: '2024-03-15', totalSpent: 2840, sessionsCount: 24, lastVisit: '2026-03-28', notes: 'Prefers deep tissue on lower back. Uses lavender oil.', preferredService: 'Deep Tissue', balance: 0 },
  { id: 'c2', name: 'James Rodriguez', email: 'james.r@email.com', phone: '(555) 345-6789', avatar: 'JR', joinDate: '2024-06-20', totalSpent: 1960, sessionsCount: 16, lastVisit: '2026-03-30', notes: 'Athletic recovery focus. Marathon runner.', preferredService: 'Sports Massage', balance: 120 },
  { id: 'c3', name: 'Emily Chen', email: 'emily.c@email.com', phone: '(555) 456-7890', avatar: 'EC', joinDate: '2024-01-10', totalSpent: 3520, sessionsCount: 32, lastVisit: '2026-04-01', notes: 'Chronic tension in shoulders. Weekly appointments.', preferredService: 'Swedish', balance: 0 },
  { id: 'c4', name: 'Michael Thompson', email: 'michael.t@email.com', phone: '(555) 567-8901', avatar: 'MT', joinDate: '2025-01-05', totalSpent: 840, sessionsCount: 7, lastVisit: '2026-03-25', notes: 'New client. Stress relief focus.', preferredService: 'Relaxation', balance: 0 },
  { id: 'c5', name: 'Lisa Park', email: 'lisa.p@email.com', phone: '(555) 678-9012', avatar: 'LP', joinDate: '2024-09-12', totalSpent: 1680, sessionsCount: 14, lastVisit: '2026-03-29', notes: 'Prenatal massage specialist request. Due in June.', preferredService: 'Prenatal', balance: 90 },
  { id: 'c6', name: 'David Wilson', email: 'david.w@email.com', phone: '(555) 789-0123', avatar: 'DW', joinDate: '2024-04-22', totalSpent: 2200, sessionsCount: 20, lastVisit: '2026-03-27', notes: 'Desk worker. Focus on neck and upper back.', preferredService: 'Deep Tissue', balance: 0 },
  { id: 'c7', name: 'Amanda Foster', email: 'amanda.f@email.com', phone: '(555) 890-1234', avatar: 'AF', joinDate: '2025-02-14', totalSpent: 600, sessionsCount: 5, lastVisit: '2026-03-20', notes: 'Couples massage with partner. Monthly visits.', preferredService: 'Couples', balance: 0 },
  { id: 'c8', name: 'Robert Kim', email: 'robert.k@email.com', phone: '(555) 901-2345', avatar: 'RK', joinDate: '2024-07-08', totalSpent: 1440, sessionsCount: 12, lastVisit: '2026-03-31', notes: 'Hot stone preference. Tip generously.', preferredService: 'Hot Stone', balance: 0 },
  { id: 'c9', name: 'Jennifer Adams', email: 'jennifer.a@email.com', phone: '(555) 012-3456', avatar: 'JA', joinDate: '2024-11-30', totalSpent: 960, sessionsCount: 8, lastVisit: '2026-03-22', notes: 'Aromatherapy add-on always. Eucalyptus preferred.', preferredService: 'Aromatherapy', balance: 150 },
  { id: 'c10', name: 'Chris Martinez', email: 'chris.m@email.com', phone: '(555) 123-4567', avatar: 'CM', joinDate: '2024-05-18', totalSpent: 2080, sessionsCount: 18, lastVisit: '2026-03-26', notes: 'Referred by Sarah Mitchell. Bi-weekly schedule.', preferredService: 'Swedish', balance: 0 },
  { id: 'c11', name: 'Rachel Green', email: 'rachel.g@email.com', phone: '(555) 234-5679', avatar: 'RG', joinDate: '2025-03-01', totalSpent: 360, sessionsCount: 3, lastVisit: '2026-03-18', notes: 'Gift card recipient. Exploring different services.', preferredService: 'Swedish', balance: 0 },
  { id: 'c12', name: 'Thomas Lee', email: 'thomas.l@email.com', phone: '(555) 345-6780', avatar: 'TL', joinDate: '2024-08-25', totalSpent: 1800, sessionsCount: 15, lastVisit: '2026-03-24', notes: 'Post-surgery rehab. Doctor referral on file.', preferredService: 'Therapeutic', balance: 0 },
  { id: 'c13', name: 'Nicole Brown', email: 'nicole.b@email.com', phone: '(555) 456-7891', avatar: 'NB', joinDate: '2024-02-28', totalSpent: 2640, sessionsCount: 22, lastVisit: '2026-03-30', notes: 'VIP client. Always books 90-min sessions.', preferredService: 'Deep Tissue', balance: 0 },
  { id: 'c14', name: 'Kevin O\'Brien', email: 'kevin.o@email.com', phone: '(555) 567-8902', avatar: 'KO', joinDate: '2025-01-20', totalSpent: 720, sessionsCount: 6, lastVisit: '2026-03-15', notes: 'Firefighter. Needs flexible scheduling.', preferredService: 'Sports Massage', balance: 120 },
  { id: 'c15', name: 'Sophia Patel', email: 'sophia.p@email.com', phone: '(555) 678-9013', avatar: 'SP', joinDate: '2024-10-05', totalSpent: 1320, sessionsCount: 11, lastVisit: '2026-03-29', notes: 'Reflexology enthusiast. Brings own essential oils.', preferredService: 'Reflexology', balance: 0 },
  { id: 'c16', name: 'Daniel Wright', email: 'daniel.w@email.com', phone: '(555) 789-0124', avatar: 'DWr', joinDate: '2024-12-10', totalSpent: 480, sessionsCount: 4, lastVisit: '2026-03-10', notes: 'Irregular schedule. Prefers evening appointments.', preferredService: 'Relaxation', balance: 0 },
  { id: 'c17', name: 'Maria Garcia', email: 'maria.g@email.com', phone: '(555) 890-1235', avatar: 'MG', joinDate: '2024-06-15', totalSpent: 2400, sessionsCount: 20, lastVisit: '2026-04-01', notes: 'Chronic pain management. Insurance claims on file.', preferredService: 'Therapeutic', balance: 0 },
  { id: 'c18', name: 'Andrew Taylor', email: 'andrew.t@email.com', phone: '(555) 901-2346', avatar: 'AT', joinDate: '2025-02-01', totalSpent: 540, sessionsCount: 5, lastVisit: '2026-03-21', notes: 'Yoga instructor. Interested in Thai massage.', preferredService: 'Thai Massage', balance: 0 },
];

export const todayAppointments: Appointment[] = [
  { id: 'a1', clientId: 'c3', clientName: 'Emily Chen', service: 'Swedish Massage', date: '2026-04-01', time: '9:00 AM', duration: 60, price: 110, status: 'completed', paid: true, tip: 20, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'a2', clientId: 'c17', clientName: 'Maria Garcia', service: 'Therapeutic Massage', date: '2026-04-01', time: '10:30 AM', duration: 90, price: 150, status: 'completed', paid: true, tip: 30, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'a3', clientId: 'c8', clientName: 'Robert Kim', service: 'Hot Stone Massage', date: '2026-04-01', time: '12:30 PM', duration: 75, price: 140, status: 'completed', paid: true, tip: 25, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'a4', clientId: 'c13', clientName: 'Nicole Brown', service: 'Deep Tissue Massage', date: '2026-04-01', time: '2:30 PM', duration: 90, price: 160, status: 'upcoming', paid: false, tip: 0, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'a5', clientId: 'c5', clientName: 'Lisa Park', service: 'Prenatal Massage', date: '2026-04-01', time: '4:00 PM', duration: 60, price: 120, status: 'upcoming', paid: false, tip: 0, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'a6', clientId: 'c10', clientName: 'Chris Martinez', service: 'Swedish Massage', date: '2026-04-01', time: '5:30 PM', duration: 60, price: 110, status: 'upcoming', paid: false, tip: 0, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'a7', clientId: 'c2', clientName: 'James Rodriguez', service: 'Sports Massage', date: '2026-04-01', time: '7:00 PM', duration: 60, price: 130, status: 'upcoming', paid: false, tip: 0, color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
];

export const weekAppointments: Appointment[] = [
  ...todayAppointments,
  // Monday Mar 30
  { id: 'a8', clientId: 'c1', clientName: 'Sarah Mitchell', service: 'Deep Tissue', date: '2026-03-30', time: '9:00 AM', duration: 60, price: 120, status: 'completed', paid: true, tip: 20, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'a9', clientId: 'c6', clientName: 'David Wilson', service: 'Deep Tissue', date: '2026-03-30', time: '11:00 AM', duration: 60, price: 120, status: 'completed', paid: true, tip: 15, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'a10', clientId: 'c15', clientName: 'Sophia Patel', service: 'Reflexology', date: '2026-03-30', time: '1:00 PM', duration: 45, price: 85, status: 'completed', paid: true, tip: 15, color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { id: 'a11', clientId: 'c12', clientName: 'Thomas Lee', service: 'Therapeutic', date: '2026-03-30', time: '3:00 PM', duration: 90, price: 150, status: 'completed', paid: true, tip: 25, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  // Tuesday Mar 31
  { id: 'a12', clientId: 'c4', clientName: 'Michael Thompson', service: 'Relaxation', date: '2026-03-31', time: '10:00 AM', duration: 60, price: 100, status: 'completed', paid: true, tip: 15, color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'a13', clientId: 'c9', clientName: 'Jennifer Adams', service: 'Aromatherapy', date: '2026-03-31', time: '12:00 PM', duration: 75, price: 130, status: 'completed', paid: false, tip: 0, color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { id: 'a14', clientId: 'c7', clientName: 'Amanda Foster', service: 'Couples Massage', date: '2026-03-31', time: '2:00 PM', duration: 90, price: 240, status: 'completed', paid: true, tip: 40, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  // Thursday Apr 2
  { id: 'a15', clientId: 'c11', clientName: 'Rachel Green', service: 'Swedish', date: '2026-04-02', time: '9:30 AM', duration: 60, price: 110, status: 'upcoming', paid: false, tip: 0, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'a16', clientId: 'c14', clientName: "Kevin O'Brien", service: 'Sports Massage', date: '2026-04-02', time: '11:30 AM', duration: 60, price: 130, status: 'upcoming', paid: false, tip: 0, color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
  { id: 'a17', clientId: 'c18', clientName: 'Andrew Taylor', service: 'Thai Massage', date: '2026-04-02', time: '2:00 PM', duration: 90, price: 145, status: 'upcoming', paid: false, tip: 0, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  // Friday Apr 3
  { id: 'a18', clientId: 'c3', clientName: 'Emily Chen', service: 'Swedish', date: '2026-04-03', time: '9:00 AM', duration: 60, price: 110, status: 'upcoming', paid: false, tip: 0, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'a19', clientId: 'c1', clientName: 'Sarah Mitchell', service: 'Deep Tissue', date: '2026-04-03', time: '11:00 AM', duration: 60, price: 120, status: 'upcoming', paid: false, tip: 0, color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'a20', clientId: 'c16', clientName: 'Daniel Wright', service: 'Relaxation', date: '2026-04-03', time: '5:00 PM', duration: 60, price: 100, status: 'upcoming', paid: false, tip: 0, color: 'bg-green-100 text-green-700 border-green-200' },
];

export const expenses: Expense[] = [
  { id: 'e1', category: 'Supplies', description: 'Massage oils & lotions (bulk)', amount: 185.50, date: '2026-03-28', receipt: true, vendor: 'Massage Warehouse' },
  { id: 'e2', category: 'Rent', description: 'Studio rent - April', amount: 1200.00, date: '2026-04-01', receipt: true, vendor: 'Serenity Plaza' },
  { id: 'e3', category: 'Insurance', description: 'Professional liability insurance', amount: 125.00, date: '2026-03-15', receipt: true, vendor: 'ABMP Insurance' },
  { id: 'e4', category: 'Marketing', description: 'Instagram & Facebook ads', amount: 150.00, date: '2026-03-20', receipt: true, vendor: 'Meta Ads' },
  { id: 'e5', category: 'Education', description: 'Advanced myofascial release course', amount: 350.00, date: '2026-03-10', receipt: true, vendor: 'CE Institute' },
  { id: 'e6', category: 'Supplies', description: 'Fresh linens & towels', amount: 220.00, date: '2026-03-22', receipt: true, vendor: 'Spa Linens Co.' },
  { id: 'e7', category: 'Utilities', description: 'Electric & water bill', amount: 145.00, date: '2026-03-25', receipt: true, vendor: 'City Utilities' },
  { id: 'e8', category: 'Equipment', description: 'Heated massage table pad', amount: 189.99, date: '2026-03-05', receipt: true, vendor: 'Amazon' },
  { id: 'e9', category: 'Marketing', description: 'Business cards reprint', amount: 45.00, date: '2026-03-18', receipt: false, vendor: 'Vistaprint' },
  { id: 'e10', category: 'Supplies', description: 'Essential oils set', amount: 78.50, date: '2026-03-30', receipt: true, vendor: 'doTERRA' },
  { id: 'e11', category: 'Software', description: 'Scheduling software subscription', amount: 49.99, date: '2026-04-01', receipt: true, vendor: 'MindBody' },
  { id: 'e12', category: 'Insurance', description: 'Health insurance premium', amount: 380.00, date: '2026-03-01', receipt: true, vendor: 'Blue Cross' },
  { id: 'e13', category: 'Education', description: 'Anatomy webinar series', amount: 75.00, date: '2026-03-12', receipt: true, vendor: 'AMTA' },
  { id: 'e14', category: 'Supplies', description: 'Disposable face rest covers', amount: 32.00, date: '2026-03-26', receipt: false, vendor: 'Massage Warehouse' },
  { id: 'e15', category: 'Rent', description: 'Parking space rental', amount: 75.00, date: '2026-04-01', receipt: true, vendor: 'Serenity Plaza' },
];

export const incomeEntries: IncomeEntry[] = [
  { id: 'i1', category: 'services', description: 'Swedish Massage - 60min', amount: 110, date: '2026-04-01', clientName: 'Emily Chen' },
  { id: 'i2', category: 'services', description: 'Therapeutic Massage - 90min', amount: 150, date: '2026-04-01', clientName: 'Maria Garcia' },
  { id: 'i3', category: 'services', description: 'Hot Stone Massage - 75min', amount: 140, date: '2026-04-01', clientName: 'Robert Kim' },
  { id: 'i4', category: 'tips', description: 'Tips from today', amount: 75, date: '2026-04-01' },
  { id: 'i5', category: 'products', description: 'Lavender essential oil', amount: 28, date: '2026-04-01', clientName: 'Emily Chen' },
  { id: 'i6', category: 'services', description: 'Deep Tissue - 60min', amount: 120, date: '2026-03-30', clientName: 'Sarah Mitchell' },
  { id: 'i7', category: 'services', description: 'Deep Tissue - 60min', amount: 120, date: '2026-03-30', clientName: 'David Wilson' },
  { id: 'i8', category: 'services', description: 'Reflexology - 45min', amount: 85, date: '2026-03-30', clientName: 'Sophia Patel' },
  { id: 'i9', category: 'services', description: 'Therapeutic - 90min', amount: 150, date: '2026-03-30', clientName: 'Thomas Lee' },
  { id: 'i10', category: 'tips', description: 'Tips', amount: 75, date: '2026-03-30' },
  { id: 'i11', category: 'products', description: 'Muscle relief cream', amount: 35, date: '2026-03-30' },
  { id: 'i12', category: 'services', description: 'Relaxation - 60min', amount: 100, date: '2026-03-31', clientName: 'Michael Thompson' },
  { id: 'i13', category: 'services', description: 'Aromatherapy - 75min', amount: 130, date: '2026-03-31', clientName: 'Jennifer Adams' },
  { id: 'i14', category: 'services', description: 'Couples Massage - 90min', amount: 240, date: '2026-03-31', clientName: 'Amanda Foster' },
  { id: 'i15', category: 'tips', description: 'Tips', amount: 55, date: '2026-03-31' },
  { id: 'i16', category: 'gift-cards', description: 'Gift card sold', amount: 120, date: '2026-03-31' },
  { id: 'i17', category: 'products', description: 'Aromatherapy diffuser', amount: 45, date: '2026-03-29' },
  { id: 'i18', category: 'services', description: 'Swedish - 60min', amount: 110, date: '2026-03-29', clientName: 'Chris Martinez' },
  { id: 'i19', category: 'services', description: 'Prenatal - 60min', amount: 120, date: '2026-03-29', clientName: 'Lisa Park' },
  { id: 'i20', category: 'tips', description: 'Tips', amount: 40, date: '2026-03-29' },
];

export const monthlyRevenue = [
  { month: 'Oct', services: 4200, products: 320, tips: 580, giftCards: 240 },
  { month: 'Nov', services: 4800, products: 410, tips: 650, giftCards: 360 },
  { month: 'Dec', services: 5200, products: 580, tips: 720, giftCards: 600 },
  { month: 'Jan', services: 3800, products: 280, tips: 480, giftCards: 120 },
  { month: 'Feb', services: 4400, products: 350, tips: 560, giftCards: 240 },
  { month: 'Mar', services: 5100, products: 420, tips: 680, giftCards: 360 },
];

export const expenseCategories = [
  { name: 'Supplies', icon: 'Package', color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-700' },
  { name: 'Rent', icon: 'Home', color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700' },
  { name: 'Insurance', icon: 'Shield', color: 'bg-purple-500', lightColor: 'bg-purple-50 text-purple-700' },
  { name: 'Marketing', icon: 'Megaphone', color: 'bg-pink-500', lightColor: 'bg-pink-50 text-pink-700' },
  { name: 'Education', icon: 'GraduationCap', color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-700' },
  { name: 'Utilities', icon: 'Zap', color: 'bg-cyan-500', lightColor: 'bg-cyan-50 text-cyan-700' },
  { name: 'Equipment', icon: 'Wrench', color: 'bg-orange-500', lightColor: 'bg-orange-50 text-orange-700' },
  { name: 'Software', icon: 'Monitor', color: 'bg-indigo-500', lightColor: 'bg-indigo-50 text-indigo-700' },
];

export const serviceTypes = [
  { name: 'Swedish Massage', duration: 60, price: 110, color: '#10b981' },
  { name: 'Deep Tissue', duration: 60, price: 120, color: '#8b5cf6' },
  { name: 'Hot Stone', duration: 75, price: 140, color: '#f59e0b' },
  { name: 'Sports Massage', duration: 60, price: 130, color: '#06b6d4' },
  { name: 'Prenatal', duration: 60, price: 120, color: '#ec4899' },
  { name: 'Therapeutic', duration: 90, price: 150, color: '#3b82f6' },
  { name: 'Aromatherapy', duration: 75, price: 130, color: '#f43f5e' },
  { name: 'Reflexology', duration: 45, price: 85, color: '#14b8a6' },
  { name: 'Couples Massage', duration: 90, price: 240, color: '#e879f9' },
  { name: 'Thai Massage', duration: 90, price: 145, color: '#f97316' },
  { name: 'Relaxation', duration: 60, price: 100, color: '#22c55e' },
];
// ── Service Builder Types ──────────────────────────────────────────────────

export interface ServiceTier {
  id: string;
  serviceId: string;
  duration: number;
  price: number;
}

export interface Service {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  tiers: ServiceTier[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}