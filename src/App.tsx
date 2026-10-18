import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Grid, 
  ShoppingCart, 
  FileText, 
  Sun, 
  Moon, 
  Home, 
  Briefcase, 
  ExternalLink,
  Download,
  X
} from 'lucide-react';
import ProcurementView from './ProcurementView';
import GeneralRulesView from './GeneralRulesView';
import HousePlanView from './HousePlanView';
import OffersView from './OffersView';
import ProvisionsView from './ProvisionsView';
import AdminConsoleView from './AdminConsoleView';
import { useSqlite } from './services/sqliteDb';
import { SqliteToolbar } from './components/SqliteToolbar';
import { FloatingUndoToast } from './components/FloatingUndoToast';
import { EditItemModal, EditableItem } from './components/EditItemModal';
import { useAuth, AuthToast, LockScreen, AuthToolbarControls, MagicLinkModal } from './components/AuthGate';
import { getAssetUrl } from './utils/assets';

export default function App() {
  const { currentUser, isUnlocked, unlock, lock, toastMessage } = useAuth();
  const isAdmin = Boolean(currentUser?.isMaster || currentUser?.role === 'admin');
  const [isMagicModalOpen, setIsMagicModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
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
  const [viewMode, setViewMode] = useState<'grid' | 'plan' | 'buy' | 'rules' | 'offers' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.startsWith('admin.') || hostname === 'admin.house.lefk.dev') {
        return 'admin';
      }
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      if (path.includes('/admin')) {
        return 'admin';
      }
      if (params.get('view') === 'admin' || window.location.hash === '#/admin') {
        if ((hostname === 'house.lefk.dev' || hostname.endsWith('.lefk.dev')) && !sessionStorage.getItem('cf_admin_authed')) {
          window.location.replace('/admin');
          return 'grid';
        }
        return 'admin';
      }
    }
    return 'grid';
  });

  const handleOpenAdmin = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'house.lefk.dev' || hostname.endsWith('.lefk.dev')) {
        // ALWAYS navigate via /admin to force Cloudflare Access to authenticate
        window.location.href = '/admin';
        return;
      }
    }
    setViewMode('admin');
  };

  const handleBackToMainApp = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cf_admin_authed');
      localStorage.removeItem('house_admin_verified');
      const hostname = window.location.hostname;
      if (hostname.startsWith('admin.') || hostname === 'admin.house.lefk.dev') {
        window.location.href = 'https://house.lefk.dev';
        return;
      }
    }
    setViewMode('grid');
  };

  // Sync /admin URL query state (when not on dedicated admin subdomain)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hostname = window.location.hostname;
    if (hostname.startsWith('admin.') || hostname === 'admin.house.lefk.dev') {
      return; // URL path sync not needed on dedicated admin subdomain
    }
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

  // Theme state: light (default) | dark
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('house_theme');
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('house_theme', theme);
  }, [theme]);
  // Lock screen protection for normal views (passcode or magic link required)
  if (viewMode !== 'admin' && !isUnlocked) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans transition-colors duration-200">
        <LockScreen onUnlock={unlock} />
        <AuthToast message={toastMessage} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans p-2 sm:p-3 md:p-4 overflow-x-hidden flex flex-col transition-colors duration-200">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col flex-1 gap-3 sm:gap-4">
        
        {/* Main Application Header & Full-Width Menu (Hidden in Admin Console) */}
        {viewMode !== 'admin' && (
          <header className="flex flex-col gap-3 pb-3 border-b border-neutral-300 dark:border-neutral-800">
            
            {/* Top Row: Logo & Title (Left) + Undo/Redo & Single Theme Toggle (Right) */}
            <div className="flex items-center justify-between gap-3">
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
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px] sm:text-xs tracking-wide">
                    Έξυπνο Σύστημα Διαχείρισης
                  </p>
                </div>
              </div>

              {/* Utility Controls (Full PDF Button, Undo, Redo, Light/Dark Toggle) */}
              <div className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
                {/* Full Architectural PDF (11 Pages) Button */}
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="Προβολή & Λήψη Πλήρους Αρχιτεκτονικού Σχεδίου (PDF 11 Σελίδων)"
                >
                  <FileText size={14} className="text-purple-600 dark:text-purple-400" />
                  <span className="hidden xs:inline sm:inline">Πλήρες PDF</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-200/80 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-black">
                    11 Σελ.
                  </span>
                  <ExternalLink size={12} className="opacity-70 hidden md:inline" />
                </button>

                {isAdmin && (
                  <SqliteToolbar
                    canUndo={canUndo}
                    canRedo={canRedo}
                    undoCount={undoCount}
                    redoCount={redoCount}
                    lastAction={lastAction}
                    onUndo={undo}
                    onRedo={redo}
                  />
                )}

                {/* Auth Controls (Current User, Magic Link, Lock) */}
                <AuthToolbarControls
                  onOpenMagicModal={() => setIsMagicModalOpen(true)}
                  onOpenAdmin={currentUser?.isMaster ? handleOpenAdmin : undefined}
                  onLock={lock}
                  currentUser={currentUser}
                />

                {/* Theme Single Toggle Button */}
                <button
                  onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                  className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-200 transition-all shadow-xs flex items-center justify-center active:scale-95"
                  title={theme === 'light' ? 'Αλλαγή σε Σκοτεινό Θέμα (Dark)' : 'Αλλαγή σε Φωτεινό Θέμα (Light)'}
                  aria-label="Εναλλαγή θέματος"
                >
                  {theme === 'light' ? (
                    <Moon size={16} className="text-indigo-600" />
                  ) : (
                    <Sun size={16} className="text-amber-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Full Width Navigation Menu */}
            <nav className="w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2 w-full p-1 sm:p-1.5 bg-neutral-200/60 dark:bg-neutral-900 border border-neutral-300/80 dark:border-neutral-800 rounded-2xl shadow-xs">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Grid size={16} />
                  <span>Λίστα</span>
                </button>
                <button 
                  onClick={() => setViewMode('plan')}
                  className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    viewMode === 'plan' 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Home size={16} />
                  <span>Κάτοψη</span>
                </button>
                <button 
                  onClick={() => setViewMode('buy')}
                  className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    viewMode === 'buy' 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <ShoppingCart size={16} />
                  <span>Αγορές</span>
                </button>
                <button 
                  onClick={() => setViewMode('rules')}
                  className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    viewMode === 'rules' 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <FileText size={16} />
                  <span>Γενικές Οδηγίες</span>
                </button>
                <button 
                  onClick={() => setViewMode('offers')}
                  className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    viewMode === 'offers' 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  <Briefcase size={16} />
                  <span>Μελετητές & Συνεργάτες</span>
                </button>
              </div>
            </nav>
          </header>
        )}

        {viewMode === 'admin' ? (
          <AdminConsoleView 
            onBackToApp={handleBackToMainApp}
            currentUser={currentUser}
            onDownloadDatabase={downloadDatabase}
            onImportDatabase={importDatabase}
            onResetDatabase={resetToDefaults}
            totalProvisions={provisions.length}
            totalProcurement={procurementItems.length}
            totalRules={generalRules.length}
            theme={theme}
            onToggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          />
        ) : viewMode === 'plan' ? (
          <HousePlanView 
            provisions={provisions}
            isAdmin={isAdmin}
            onToggleCompleted={isAdmin ? toggleProvisionCompleted : undefined}
            onTogglePending={isAdmin ? toggleProvisionPending : undefined}
            onEditProvision={isAdmin ? (p) => setEditingItem({ type: 'provision', data: p }) : undefined}
          />
        ) : viewMode === 'buy' ? (
          <ProcurementView 
            items={procurementItems}
            isAdmin={isAdmin}
            onTogglePurchased={isAdmin ? toggleProcurementPurchased : undefined}
            onEditItem={isAdmin ? (item) => setEditingItem({ type: 'procurement', data: item }) : undefined}
          />
        ) : viewMode === 'rules' ? (
          <GeneralRulesView 
            rules={generalRules}
            onEditRule={isAdmin ? (rule) => setEditingItem({ type: 'rule', data: rule }) : undefined}
          />
        ) : viewMode === 'offers' ? (
          <OffersView isAdmin={isAdmin} />
        ) : (
          <ProvisionsView
            provisions={provisions}
            isAdmin={isAdmin}
            onToggleCompleted={isAdmin ? toggleProvisionCompleted : undefined}
            onTogglePending={isAdmin ? toggleProvisionPending : undefined}
            onEditProvision={isAdmin ? (p) => setEditingItem({ type: 'provision', data: p }) : undefined}
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
          isOpen={isMagicModalOpen}
          onClose={() => setIsMagicModalOpen(false)}
          currentUser={currentUser}
          onOpenAdmin={currentUser?.isMaster ? handleOpenAdmin : undefined}
        />

        {/* Full PDF Viewer Modal */}
        {isPdfModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-neutral-300 dark:border-neutral-800 flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/90 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 rounded-xl flex-shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2 truncate">
                      <span>Πλήρες Αρχιτεκτονικό Σχέδιο</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-extrabold flex-shrink-0">
                        11 Σελίδες • 12.6 MB
                      </span>
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate hidden xs:block">
                      Κατόψεις, τομές, όψεις και σχέδια χωροθέτησης οικοδομής
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <a
                    href={getAssetUrl('/house_plans.pdf')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
                    title="Άνοιγμα σε νέα καρτέλα του browser"
                  >
                    <span>Νέα Καρτέλα</span>
                    <ExternalLink size={13} />
                  </a>

                  <a
                    href={getAssetUrl('/house_plans.pdf')}
                    download="house_plans.pdf"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white font-bold text-xs transition-all active:scale-95"
                    title="Απευθείας λήψη του PDF στη συσκευή"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">Λήψη PDF</span>
                  </a>

                  <button
                    onClick={() => setIsPdfModalOpen(false)}
                    className="p-1.5 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors ml-1"
                    title="Κλείσιμο"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Body: Embedded PDF with fallback */}
              <div className="flex-1 w-full bg-neutral-100 dark:bg-neutral-950 relative overflow-hidden flex flex-col">
                <object
                  data={getAssetUrl('/house_plans.pdf')}
                  type="application/pdf"
                  className="w-full h-full border-0"
                >
                  <iframe
                    src={getAssetUrl('/house_plans.pdf')}
                    className="w-full h-full border-0"
                    title="Πλήρες Αρχιτεκτονικό Σχέδιο"
                  >
                    <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                      <FileText size={48} className="text-purple-500 mb-3" />
                      <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-2">
                        Πλήρες Αρχιτεκτονικό Σχέδιο (PDF 11 Σελίδων)
                      </p>
                      <p className="text-xs text-neutral-500 mb-4 max-w-md">
                        Εάν το πρόγραμμα περιήγησής σας δεν υποστηρίζει ενσωματωμένη προβολή, πατήστε παρακάτω για άνοιγμα ή λήψη:
                      </p>
                      <div className="flex items-center gap-2">
                        <a
                          href={getAssetUrl('/house_plans.pdf')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                        >
                          Άνοιγμα σε νέα καρτέλα
                        </a>
                        <a
                          href={getAssetUrl('/house_plans.pdf')}
                          download="house_plans.pdf"
                          className="px-4 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-white font-bold text-xs"
                        >
                          Λήψη PDF
                        </a>
                      </div>
                    </div>
                  </iframe>
                </object>
              </div>
            </div>
          </div>
        )}

        {/* Floating Toast Notification */}
        <AuthToast message={toastMessage} />

        {/* Floating Undo/Redo Action Toast & Persistent Bottom Pill */}
        <FloatingUndoToast
          lastAction={lastAction}
          canUndo={canUndo}
          canRedo={canRedo}
          undoCount={undoCount}
          redoCount={redoCount}
          onUndo={undo}
          onRedo={redo}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
