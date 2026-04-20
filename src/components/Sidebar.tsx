import React from 'react';
import { useAppContext, PageView } from '@/contexts/AppContext';
import {
  LayoutDashboard, Users, DollarSign, Receipt, Calendar, BarChart3, Settings,
  ChevronLeft, ChevronRight, Leaf, X
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileAvatar from './ProfileAvatar';

const navItems: { id: PageView; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'income', label: 'Income', icon: DollarSign },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar, currentPage, setCurrentPage } = useAppContext();
  const isMobile = useIsMobile();

  if (isMobile && !sidebarOpen) return null;

  return (
    <>
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={toggleSidebar} />
      )}
      <aside className={`
        ${isMobile ? 'fixed left-0 top-0 z-50 h-full' : 'relative'}
        ${sidebarOpen ? 'w-64' : 'w-20'}
        bg-gradient-to-b from-[#2d4a3e] to-[#1a3028] text-white flex flex-col
        transition-all duration-300 ease-in-out min-h-screen
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-[#1a3028]" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-semibold tracking-tight">Serenity</h1>
              <p className="text-xs text-emerald-300/70">Bookkeeping</p>
            </div>
          )}
          {isMobile && (
            <button onClick={toggleSidebar} className="ml-auto p-1 hover:bg-white/10 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  if (isMobile) toggleSidebar();
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-white/15 text-emerald-300 shadow-lg shadow-black/10'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'}
                  ${!sidebarOpen ? 'justify-center' : ''}

                `}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-300' : ''}`} />
                {sidebarOpen && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        {!isMobile && (
          <div className="p-3 border-t border-white/10">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"

            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              {sidebarOpen && <span className="text-xs">Collapse</span>}
            </button>
          </div>
        )}

        {/* User profile */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <ProfileAvatar size="sm" showEditOnHover={true} onClick={() => { setCurrentPage('settings'); if (isMobile) toggleSidebar(); }} />
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">Allison Muniz</p>
                <p className="text-xs text-emerald-300/60 truncate">LMT #00000</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
