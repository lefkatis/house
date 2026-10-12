import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  LayoutDashboard, 
  Workflow, 
  Grid, 
  ShoppingCart, 
  FileText, 
  AlertTriangle,
  Sun,
  Moon,
  Monitor,
  Home,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { PROVISIONS, Provision } from './data/provisions';
import { ROOMS } from './data/rooms';
import { CATEGORIES as TYPES } from './data/categories';
import Flow from './Flow';
import ProcurementView from './ProcurementView';
import GeneralRulesView from './GeneralRulesView';
import HousePlanView from './HousePlanView';
import OffersView from './OffersView';
import { IECSymbol } from './components/IECSymbol';
import MyHouseDashboard from './components/MyHouseDashboard';
import { 
  CustomProjectData, 
  QuestionnaireAnswers, 
  CustomProvision 
} from './types/questionnaire';
import { 
  loadProjectData, 
  checkBackendHealth, 
  saveQuestionnaire, 
  updateProvision, 
  updateProcurement, 
  addCustomProvision, 
  deleteProvision,
  getLocalFallbackData 
} from './services/api';

export default function App() {
  const [provisions] = useState<Provision[]>(PROVISIONS);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set(ROOMS));
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(TYPES));
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'flow' | 'plan' | 'buy' | 'rules' | 'offers'>('grid');
  
  // App Mode: 'my_house' (custom home configured via questionnaire & saved in SQLite) vs 'reference' (demo villa)
  const [appMode, setAppMode] = useState<'my_house' | 'reference'>('my_house');
  const [projectData, setProjectData] = useState<CustomProjectData>(() => getLocalFallbackData());
  const [isSqliteConnected, setIsSqliteConnected] = useState<boolean>(false);

  // Theme state: dark | light | system
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(() => {
    return (localStorage.getItem('pronies_theme') as 'dark' | 'light' | 'system') || 'dark';
  });

  // Load project from SQLite backend on mount
  useEffect(() => {
    checkBackendHealth().then(res => setIsSqliteConnected(res.isOnline));
    loadProjectData().then(({ data, isFromSqlite }) => {
      setProjectData(data);
      setIsSqliteConnected(isFromSqlite);
    });
  }, []);

  const handleSaveQuestionnaire = async (answers: QuestionnaireAnswers) => {
    const { data, isSavedToSqlite } = await saveQuestionnaire(answers);
    setProjectData(data);
    setIsSqliteConnected(isSavedToSqlite);
  };

  const handleToggleProvision = async (provisionId: string, completed: boolean) => {
    await updateProvision('project_default', provisionId, { completed });
    setProjectData(prev => ({
      ...prev,
      provisions: prev.provisions.map(p => p.id === provisionId ? { ...p, completed } : p)
    }));
  };

  const handleToggleProcurement = async (itemId: string, purchased: boolean) => {
    await updateProcurement('project_default', itemId, { purchased });
    setProjectData(prev => ({
      ...prev,
      procurement: prev.procurement.map(i => i.id === itemId ? { ...i, purchased } : i)
    }));
  };

  const handleAddProvision = async (provision: Omit<CustomProvision, 'id'>) => {
    const created = await addCustomProvision('project_default', provision);
    setProjectData(prev => ({
      ...prev,
      provisions: [...prev.provisions, created]
    }));
  };

  const handleDeleteProvision = async (provisionId: string) => {
    await deleteProvision('project_default', provisionId);
    setProjectData(prev => ({
      ...prev,
      provisions: prev.provisions.filter(p => p.id !== provisionId)
    }));
  };

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
    localStorage.setItem('pronies_theme', theme);

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

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans p-2 md:p-4 overflow-hidden flex flex-col transition-colors duration-200">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col flex-1 gap-4">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-neutral-300 dark:border-neutral-800">
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20"
            >
              <LayoutDashboard size={20} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 dark:from-indigo-400 to-cyan-500 dark:to-cyan-400">
                LefkPronies
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs tracking-wide">Έξυπνο Σύστημα Διαχείρισης</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            
            {/* Primary Mode Selector: Custom Home (with Questionnaire & SQLite) vs Reference Plan */}
            <div className="flex items-center space-x-1 bg-neutral-200/80 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-300 dark:border-neutral-800">
              <button 
                onClick={() => setAppMode('my_house')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  appMode === 'my_house' 
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Sparkles size={13} className={appMode === 'my_house' ? 'text-cyan-200' : 'text-indigo-400'} />
                <span>Το Δικό Μου Σπίτι</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-semibold">SQLite</span>
              </button>
              <button 
                onClick={() => setAppMode('reference')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  appMode === 'reference' 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <LayoutDashboard size={13} />
                <span>Πρότυπο Σπίτι (Demo)</span>
              </button>
            </div>

            {/* View Mode Navigation Tabs (for Reference Mode) */}
            {appMode === 'reference' && (
              <div className="flex items-center space-x-1 bg-neutral-200/80 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-300 dark:border-neutral-800">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
                >
                  <Grid size={14} />
                  <span>Λίστα</span>
                </button>
                <button 
                  onClick={() => setViewMode('flow')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'flow' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
                >
                  <Workflow size={14} />
                  <span>Διάγραμμα</span>
                </button>
                <button 
                  onClick={() => setViewMode('plan')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'plan' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
                >
                  <Home size={14} />
                  <span>Κάτοψη</span>
                </button>
                <button 
                  onClick={() => setViewMode('buy')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'buy' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
                >
                  <ShoppingCart size={14} />
                  <span>Αγορές & Εξοπλισμός</span>
                </button>
                <button 
                  onClick={() => setViewMode('rules')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'rules' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
                >
                  <FileText size={14} />
                  <span>Γενικές Οδηγίες</span>
                </button>
                <button 
                  onClick={() => setViewMode('offers')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${viewMode === 'offers' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'}`}
                >
                  <Briefcase size={14} />
                  <span>Προσφορές Μελετών</span>
                </button>
              </div>
            )}

            {/* Dark / Light / System Theme Switcher */}
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

          </div>
        </header>

        {appMode === 'my_house' ? (
          <MyHouseDashboard
            projectData={projectData}
            isSqliteConnected={isSqliteConnected}
            onSaveQuestionnaire={handleSaveQuestionnaire}
            onToggleProvision={handleToggleProvision}
            onToggleProcurement={handleToggleProcurement}
            onAddProvision={handleAddProvision}
            onDeleteProvision={handleDeleteProvision}
          />
        ) : viewMode === 'plan' ? (
          <HousePlanView />
        ) : viewMode === 'buy' ? (
          <ProcurementView />
        ) : viewMode === 'rules' ? (
          <GeneralRulesView />
        ) : viewMode === 'offers' ? (
          <OffersView />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            
          {/* Left Panel: Filters */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Rooms */}
            <div className="bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-indigo-600 dark:text-indigo-300">Δωμάτια</h2>
                <div className="space-x-2 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                  <button onClick={() => setSelectedRooms(new Set(ROOMS))} className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">Όλα</button>
                  <button onClick={() => setSelectedRooms(new Set())} className="hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">Κανένα</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ROOMS.map(room => (
                  <button
                    key={room}
                    onMouseEnter={() => setHoveredRoom(room)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => toggleRoom(room)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
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
            <div className="bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-cyan-600 dark:text-cyan-300">Κατηγορίες</h2>
                <div className="space-x-2 text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                  <button onClick={() => setSelectedTypes(new Set(TYPES))} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">Όλες</button>
                  <button onClick={() => setSelectedTypes(new Set())} className="hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">Καμία</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map(type => (
                  <button
                    key={type}
                    onMouseEnter={() => setHoveredType(type)}
                    onMouseLeave={() => setHoveredType(null)}
                    onClick={() => toggleType(type)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
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

          {/* Right Panel: Interactive Grid or Flow */}
          <div className="lg:col-span-9 bg-white/60 dark:bg-neutral-900/30 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 relative overflow-hidden flex flex-col h-[85vh]">
            
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-200">
                {viewMode === 'grid' ? 'Λίστα Παροχών' : 'Διάγραμμα Παροχών'}
              </h2>
              <div className="bg-indigo-100 dark:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
                {filteredProvisions.length} Ενεργές
              </div>
            </div>

            {viewMode === 'flow' ? (
              <div className="flex-1 w-full h-full relative -m-4 mt-0 border-t border-neutral-200 dark:border-neutral-800">
                <Flow provisions={filteredProvisions} rooms={Array.from(selectedRooms)} />
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 w-full h-full pr-2 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  <AnimatePresence>
                    {filteredProvisions.map((provision) => {
                      
                      const isHighlighted = hoveredRoom === provision.room || hoveredType === provision.type;
                      const isFaded = (hoveredRoom || hoveredType) && !isHighlighted;

                      return (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ 
                            opacity: isFaded ? 0.3 : 1, 
                            scale: isHighlighted ? 1.02 : 1,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          key={provision.id}
                          className={`rounded-xl p-3 border backdrop-blur-md transition-all duration-300 ${
                            provision.pendingReview 
                              ? 'bg-amber-50/90 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-sm' 
                              : 'bg-white dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {/* Standardized IEC 60617 Symbol */}
                            <IECSymbol provisionName={provision.name} category={provision.type} size={24} />

                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 px-1.5 py-0.5 rounded">
                                  {provision.room}
                                </span>
                                {provision.wall && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">
                                    {provision.wall}
                                  </span>
                                )}
                                {provision.pendingReview && (
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700/60 flex items-center gap-1">
                                    <AlertTriangle size={10} />
                                    TBD (Εκκρεμεί)
                                  </span>
                                )}
                              </div>
                              <h3 className="text-sm font-bold leading-tight text-neutral-900 dark:text-neutral-100">
                                {provision.name}
                              </h3>
                              {provision.details && (
                                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug pt-0.5">
                                  {provision.details}
                                </p>
                              )}
                              <div className="flex items-center space-x-1 mt-1">
                                <span className="text-[10px] font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-900/50">
                                  {provision.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>

                {filteredProvisions.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="flex flex-col items-center justify-center h-40 text-neutral-400 dark:text-neutral-500"
                  >
                    <Settings size={32} className="mb-3 opacity-20 animate-spin-slow" />
                    <p className="text-sm">Δεν βρέθηκαν παροχές.</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Background glow effects */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-screen" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10 mix-blend-screen" />
            
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
