import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Workflow, 
  Grid, 
  ShoppingCart, 
  FileText, 
  Sun, 
  Moon, 
  Monitor, 
  Home, 
  Briefcase, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck
} from 'lucide-react';
import { ROOMS } from './data/rooms';
import { CATEGORIES as TYPES } from './data/categories';
import Flow from './Flow';
import ProcurementView from './ProcurementView';
import GeneralRulesView from './GeneralRulesView';
import HousePlanView from './HousePlanView';
import OffersView from './OffersView';
import ProvisionsView from './ProvisionsView';
import AdminConsoleView from './AdminConsoleView';
import { useSqlite } from './services/sqliteDb';
import { SqliteToolbar } from './components/SqliteToolbar';
import { EditItemModal, EditableItem } from './components/EditItemModal';
import { 
  useAuth, 
  LockScreen, 
  MagicLinkModal, 
  AuthToolbarControls, 
  AuthToast 
} from './components/AuthGate';

export default function App() {
  const { isUnlocked, currentUser, unlock, lock, toastMessage } = useAuth();
  const [showMagicModal, setShowMagicModal] = useState<boolean>(false);
  const {
    provisions,
    procurementItems,
    generalRules,
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    lastAction,
    toggleProvisionCompleted,
    toggleProvisionPending,
    updateProvision,
    toggleProcurementPurchased,
    updateProcurementItem,
    updateGeneralRule,
    undo,
    redo,
    downloadDatabase,
    importDatabase,
    resetToDefaults
  } = useSqlite();

  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set(ROOMS));
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(TYPES));
  const [viewMode, setViewMode] = useState<'grid' | 'flow' | 'plan' | 'buy' | 'rules' | 'offers' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      if (path.includes('/admin') || params.get('view') === 'admin' || window.location.hash === '#/admin') {
        return 'admin';
      }
    }
    return 'grid';
  });
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(true);

  // Sync /admin URL query state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentPath = window.location.pathname;
    if (viewMode === 'admin') {
      if (!currentPath.includes('/admin')) {
        window.history.pushState({}, '', '?view=admin');
      }
    } else {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'admin' || currentPath.includes('/admin')) {
        params.delete('view');
        const clean = params.toString() ? `?${params.toString()}` : '';
        window.history.pushState({}, '', window.location.pathname.replace(/\/admin\/?$/, '/') + clean);
      }
    }
  }, [viewMode]);

  // Theme state: light (default) | dark | system
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    const saved = localStorage.getItem('house_theme');
    if (saved === 'dark' || saved === 'light' || saved === 'system') {
      return saved;
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('house_theme', theme);

    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const toggleRoom = (room: string) => {
    if (selectedRooms.size === ROOMS.length) {
      setSelectedRooms(new Set([room]));
    } else {
      const next = new Set(selectedRooms);
      if (next.has(room)) next.delete(room);
      else next.add(room);
      setSelectedRooms(next);
    }
  };

  const toggleType = (type: string) => {
    if (selectedTypes.size === TYPES.length) {
      setSelectedTypes(new Set([type]));
    } else {
      const next = new Set(selectedTypes);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      setSelectedTypes(next);
    }
  };

  const filteredProvisions = provisions.filter(p => selectedRooms.has(p.room) && selectedTypes.has(p.type));

  if (!isUnlocked) {
    return (
      <>
        <LockScreen onUnlock={unlock} />
        <AuthToast message={toastMessage} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans p-2 sm:p-3 md:p-4 overflow-x-hidden flex flex-col transition-colors duration-200">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col flex-1 gap-3 sm:gap-4">
        
        {/* Header */}
        <header className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-2.5 pb-3 border-b border-neutral-300 dark:border-neutral-800">
          
          {/* Top Row on mobile/Fold: Logo + Quick Toolbars */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="p-1.5 sm:p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20 flex-shrink-0"
              >
                <LayoutDashboard size={18} />
              </motion.div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 dark:from-indigo-400 to-cyan-500 dark:to-cyan-400 leading-tight">
                  House
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px] sm:text-xs tracking-wide">Έξυπνο Σύστημα Διαχείρισης</p>
              </div>
            </div>

            {/* Utility Controls visible on right side of top row on < xl */}
            <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 xl:hidden">
              <SqliteToolbar
                canUndo={canUndo}
                canRedo={canRedo}
                undoCount={undoCount}
                redoCount={redoCount}
                lastAction={lastAction}
                onUndo={undo}
                onRedo={redo}
                onDownload={downloadDatabase}
                onImport={importDatabase}
                onReset={resetToDefaults}
              />

              <div className="flex items-center bg-neutral-200/80 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-300 dark:border-neutral-800 text-xs">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded-lg transition-colors ${theme === 'light' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                  title="Φωτεινό Θέμα (Light)"
                >
                  <Sun size={14} />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white dark:bg-neutral-800 text-indigo-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                  title="Σκοτεινό Θέμα (Dark)"
                >
                  <Moon size={14} />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-1.5 rounded-lg transition-colors ${theme === 'system' ? 'bg-white dark:bg-neutral-800 text-cyan-500 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                  title="Θέμα Συστήματος (System)"
                >
                  <Monitor size={14} />
                </button>
              </div>

              <AuthToolbarControls
                onOpenMagicModal={() => setShowMagicModal(true)}
                onOpenAdmin={() => setViewMode('admin')}
                onLock={lock}
                currentUser={currentUser}
              />
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            
            {/* View Mode Navigation Tabs - Wraps cleanly with zero horizontal scroll on Fold 6 & phones */}
            <div className="flex flex-wrap items-center gap-1 bg-neutral-200/80 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-300 dark:border-neutral-800 w-full xl:w-auto">
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
              >
                <Grid size={13} />
                <span>Λίστα</span>
              </button>
              <button 
                onClick={() => setViewMode('flow')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${viewMode === 'flow' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
              >
                <Workflow size={13} />
                <span>Διάγραμμα</span>
              </button>
              <button 
                onClick={() => setViewMode('plan')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${viewMode === 'plan' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
              >
                <Home size={13} />
                <span>Κάτοψη</span>
              </button>
              <button 
                onClick={() => setViewMode('buy')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${viewMode === 'buy' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
              >
                <ShoppingCart size={13} />
                <span>Αγορές & Εξοπλισμός</span>
              </button>
              <button 
                onClick={() => setViewMode('rules')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${viewMode === 'rules' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
              >
                <FileText size={13} />
                <span>Γενικές Οδηγίες</span>
              </button>
              <button 
                onClick={() => setViewMode('offers')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${viewMode === 'offers' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
              >
                <Briefcase size={13} />
                <span>Προσφορές Μελετών</span>
              </button>
              <button 
                onClick={() => setViewMode('admin')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${viewMode === 'admin' ? 'bg-rose-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
                title="Κονσόλα Διαχείρισης Κωδικών & Magic Links"
              >
                <ShieldCheck size={13} className={viewMode === 'admin' ? 'text-white' : 'text-rose-500'} />
                <span>Διαχείριση</span>
              </button>
            </div>

            {/* Desktop xl+ Utility Controls */}
            <div className="hidden xl:flex items-center gap-2">
              <SqliteToolbar
                canUndo={canUndo}
                canRedo={canRedo}
                undoCount={undoCount}
                redoCount={redoCount}
                lastAction={lastAction}
                onUndo={undo}
                onRedo={redo}
                onDownload={downloadDatabase}
                onImport={importDatabase}
                onReset={resetToDefaults}
              />

              <div className="flex items-center bg-neutral-200/80 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-300 dark:border-neutral-800 text-xs">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-1.5 rounded-lg transition-colors ${theme === 'light' ? 'bg-white dark:bg-neutral-800 text-amber-500 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                  title="Φωτεινό Θέμα (Light)"
                >
                  <Sun size={15} />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-1.5 rounded-lg transition-colors ${theme === 'dark' ? 'bg-white dark:bg-neutral-800 text-indigo-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                  title="Σκοτεινό Θέμα (Dark)"
                >
                  <Moon size={15} />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-1.5 rounded-lg transition-colors ${theme === 'system' ? 'bg-white dark:bg-neutral-800 text-cyan-500 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
                  title="Θέμα Συστήματος (System)"
                >
                  <Monitor size={15} />
                </button>
              </div>

              <AuthToolbarControls
                onOpenMagicModal={() => setShowMagicModal(true)}
                onOpenAdmin={() => setViewMode('admin')}
                onLock={lock}
                currentUser={currentUser}
              />
            </div>

          </div>
        </header>

        {viewMode === 'admin' ? (
          <AdminConsoleView 
            onBackToApp={() => setViewMode('grid')}
            currentUser={currentUser}
          />
        ) : viewMode === 'plan' ? (
          <HousePlanView 
            provisions={provisions}
            onToggleCompleted={toggleProvisionCompleted}
            onTogglePending={toggleProvisionPending}
            onEditProvision={(p) => setEditingItem({ type: 'provision', data: p })}
          />
        ) : viewMode === 'buy' ? (
          <ProcurementView 
            items={procurementItems}
            onTogglePurchased={toggleProcurementPurchased}
            onEditItem={(item) => setEditingItem({ type: 'procurement', data: item })}
          />
        ) : viewMode === 'rules' ? (
          <GeneralRulesView 
            rules={generalRules}
            onEditRule={(rule) => setEditingItem({ type: 'rule', data: rule })}
          />
        ) : viewMode === 'offers' ? (
          <OffersView />
        ) : viewMode === 'flow' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 h-full">
            {/* Left Panel: Filters for Flow */}
            <div className="lg:col-span-3 flex flex-col gap-2.5 sm:gap-3">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden flex items-center justify-between w-full px-3.5 py-2 bg-white/90 dark:bg-neutral-900/80 border border-neutral-300 dark:border-neutral-800 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-200 shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Filter size={14} className="text-indigo-500" />
                  <span>Φίλτρα Δωματίων & Κατηγοριών</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {selectedRooms.size}/{ROOMS.length} • {selectedTypes.size}/{TYPES.length}
                  </span>
                </span>
                {showMobileFilters ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              <div className={`${showMobileFilters ? 'grid' : 'hidden'} lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3`}>
                {/* Rooms */}
                <div className="bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl p-3 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-sm">
                  <div className="flex justify-between items-center mb-2.5">
                    <h2 className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-300">Δωμάτια</h2>
                    <div className="space-x-2 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                      <button onClick={() => setSelectedRooms(new Set(ROOMS))} className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">Όλα</button>
                      <button onClick={() => setSelectedRooms(new Set())} className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">Κανένα</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ROOMS.map(room => (
                      <button
                        key={room}
                        onClick={() => toggleRoom(room)}
                        className={`px-2 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-colors border ${
                          selectedRooms.has(room) 
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-indigo-200' 
                            : 'bg-neutral-100 dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500'
                        }`}
                      >
                        {room}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Types */}
                <div className="bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl p-3 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-sm">
                  <div className="flex justify-between items-center mb-2.5">
                    <h2 className="text-xs sm:text-sm font-bold text-cyan-600 dark:text-cyan-300">Κατηγορίες</h2>
                    <div className="space-x-2 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                      <button onClick={() => setSelectedTypes(new Set(TYPES))} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">Όλες</button>
                      <button onClick={() => setSelectedTypes(new Set())} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">Καμία</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => toggleType(type)}
                        className={`px-2 py-1 rounded-md text-[11px] sm:text-xs font-medium transition-colors border ${
                          selectedTypes.has(type) 
                            ? 'bg-cyan-600/20 border-cyan-500 text-cyan-700 dark:text-cyan-200' 
                            : 'bg-neutral-100 dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-500'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel: Flow */}
            <div className="lg:col-span-9 bg-white/60 dark:bg-neutral-900/30 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-3 sm:p-4 relative overflow-hidden flex flex-col min-h-[500px] lg:h-[83vh]">
              <div className="flex justify-between items-center mb-3 sm:mb-4 flex-shrink-0">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-200">
                  Διάγραμμα Παροχών
                </h2>
                <div className="bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
                  {filteredProvisions.length} Ενεργές
                </div>
              </div>
              <div className="flex-1 w-full min-h-[480px] sm:min-h-[560px] lg:h-full relative -m-3 sm:-m-4 mt-0 border-t border-neutral-200 dark:border-neutral-800">
                <Flow provisions={filteredProvisions} rooms={Array.from(selectedRooms)} />
              </div>
            </div>
          </div>
        ) : (
          <ProvisionsView
            provisions={provisions}
            onToggleCompleted={toggleProvisionCompleted}
            onTogglePending={toggleProvisionPending}
            onEditProvision={(p) => setEditingItem({ type: 'provision', data: p })}
          />
        )}

        {/* Global SQLite Edit Modal */}
        <EditItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaveProvision={updateProvision}
          onSaveProcurement={updateProcurementItem}
          onSaveRule={updateGeneralRule}
        />

        {/* Magic Link Share Modal */}
        <MagicLinkModal
          isOpen={showMagicModal}
          onClose={() => setShowMagicModal(false)}
          onOpenAdmin={() => setViewMode('admin')}
          currentUser={currentUser}
        />

        {/* Floating Toast Notification */}
        <AuthToast message={toastMessage} />
      </div>
    </div>
  );
}
