import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import SettingsPage from './Settings';
import ClientManagement from './ClientManagement';
import IncomeTracking from './IncomeTracking';
import ExpenseTracker from './ExpenseTracker';
import CalendarView from './CalendarView';
import Reports from './Reports';
import { Menu, Search, Bell, Settings, Leaf, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar, currentPage, searchQuery, setSearchQuery, loading, error, retryLoad } = useAppContext();
  const isMobile = useIsMobile();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'clients': return <ClientManagement />;
      case 'income': return <IncomeTracking />;
      case 'expenses': return <ExpenseTracker />;
      case 'calendar': return <CalendarView />;
      case 'reports': return <Reports />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  // ── Full-screen loading state ──────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8faf9] items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Leaf className="w-8 h-8 text-[#1a3028]" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-3">
            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
            <h2 className="text-lg font-semibold text-gray-700">Loading Serenity</h2>
          </div>
          <p className="text-sm text-gray-400">Connecting to your bookkeeping data...</p>
          {/* Skeleton preview */}
          <div className="mt-8 max-w-md mx-auto space-y-3">
            <div className="h-3 bg-gray-200 rounded-full animate-pulse w-3/4 mx-auto" />
            <div className="h-3 bg-gray-200 rounded-full animate-pulse w-1/2 mx-auto" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 bg-white rounded-xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Full-screen error state ────────────────────────────────────
  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f8faf9] items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={retryLoad}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-200 transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <p className="text-xs text-gray-400 mt-4">
            If the problem persists, check your internet connection and refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8faf9]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button onClick={toggleSidebar} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}
            {!isMobile && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-64 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={retryLoad}
              title="Refresh data"
              className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
            <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-300 flex items-center justify-center text-xs font-semibold text-[#1a3028] ml-2">
              AM
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-100 px-4 lg:px-8 py-3 text-center">
          <p className="text-xs text-gray-400">Serenity Bookkeeping &copy; 2026 &middot; Data synced with cloud database</p>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
