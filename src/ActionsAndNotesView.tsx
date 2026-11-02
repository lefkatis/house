import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Bookmark, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Search, 
  Tag, 
  ChevronDown,
  ChevronUp,
  X,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { ActionItem, INITIAL_ACTION_ITEMS } from './data/actionsData';
import { RememberItem, INITIAL_REMEMBER_ITEMS } from './data/thingsToRememberData';

const ACTIONS_STORAGE_KEY = 'house_actions_list_v1';
const REMEMBER_STORAGE_KEY = 'house_remember_list_v1';

export interface ActionsAndNotesViewProps {
  isAdmin?: boolean;
}

export default function ActionsAndNotesView({ isAdmin = false }: ActionsAndNotesViewProps) {
  const [activeTab, setActiveTab] = useState<'actions' | 'remember'>('actions');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionStatusFilter, setActionStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>('action_nabu_casa');

  // Actions State with persistence
  const [actions, setActions] = useState<ActionItem[]>(() => {
    try {
      const saved = localStorage.getItem(ACTIONS_STORAGE_KEY);
      if (saved) {
        const parsed: ActionItem[] = JSON.parse(saved);
        // Ensure default initial items exist
        const existingIds = new Set(parsed.map(a => a.id));
        const missing = INITIAL_ACTION_ITEMS.filter(init => !existingIds.has(init.id));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
    } catch (e) {
      console.error('Failed to load actions', e);
    }
    return INITIAL_ACTION_ITEMS;
  });

  // Reminders State with persistence
  const [rememberItems, setRememberItems] = useState<RememberItem[]>(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_STORAGE_KEY);
      if (saved) {
        const parsed: RememberItem[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(r => r.id));
        const missing = INITIAL_REMEMBER_ITEMS.filter(init => !existingIds.has(init.id));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
    } catch (e) {
      console.error('Failed to load remember items', e);
    }
    return INITIAL_REMEMBER_ITEMS;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIONS_STORAGE_KEY, JSON.stringify(actions));
    } catch (e) {
      console.error(e);
    }
  }, [actions]);

  useEffect(() => {
    try {
      localStorage.setItem(REMEMBER_STORAGE_KEY, JSON.stringify(rememberItems));
    } catch (e) {
      console.error(e);
    }
  }, [rememberItems]);

  // Modal states for adding items
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionCategory, setNewActionCategory] = useState('📡 Smart Home & Cloud');
  const [newActionPriority, setNewActionPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newActionDesc, setNewActionDesc] = useState('');
  const [newActionSteps, setNewActionSteps] = useState('');

  const [showAddRememberModal, setShowAddRememberModal] = useState(false);
  const [newRememberTitle, setNewRememberTitle] = useState('');
  const [newRememberCategory, setNewRememberCategory] = useState('🔒 Συναγερμός & Ασφάλεια');
  const [newRememberImportance, setNewRememberImportance] = useState<'critical' | 'high' | 'medium'>('critical');
  const [newRememberSummary, setNewRememberSummary] = useState('');
  const [newRememberDetails, setNewRememberDetails] = useState('');
  const [newRememberPoints, setNewRememberPoints] = useState('');

  // Toggle Action Status
  const toggleActionStatus = (id: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'completed' ? 'pending' : 'completed';
        return {
          ...a,
          status: nextStatus,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return a;
    }));
  };

  // Add Action Handler
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionTitle.trim()) return;

    const steps = newActionSteps
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const newItem: ActionItem = {
      id: `action_${Date.now()}`,
      title: newActionTitle.trim(),
      category: newActionCategory,
      priority: newActionPriority,
      status: 'pending',
      description: newActionDesc.trim(),
      checklist: steps.length > 0 ? steps : undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setActions(prev => [newItem, ...prev]);
    setNewActionTitle('');
    setNewActionDesc('');
    setNewActionSteps('');
    setShowAddActionModal(false);
    setExpandedItemId(newItem.id);
  };

  // Add Remember Item Handler
  const handleAddRemember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRememberTitle.trim()) return;

    const points = newRememberPoints
      .split('\n')
      .map(p => p.trim())
      .filter(Boolean);

    const newItem: RememberItem = {
      id: `remember_${Date.now()}`,
      title: newRememberTitle.trim(),
      category: newRememberCategory,
      importance: newRememberImportance,
      summary: newRememberSummary.trim(),
      details: newRememberDetails.trim(),
      points: points.length > 0 ? points : undefined,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setRememberItems(prev => [newItem, ...prev]);
    setNewRememberTitle('');
    setNewRememberSummary('');
    setNewRememberDetails('');
    setNewRememberPoints('');
    setShowAddRememberModal(false);
    setExpandedItemId(newItem.id);
  };

  // Delete Handlers
  const handleDeleteAction = (id: string) => {
    if (confirm('Διαγραφή αυτής της ενέργειας;')) {
      setActions(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleDeleteRemember = (id: string) => {
    if (confirm('Διαγραφή αυτής της υπενθύμισης;')) {
      setRememberItems(prev => prev.filter(r => r.id !== id));
    }
  };

  // Filtered Actions
  const filteredActions = useMemo(() => {
    return actions.filter(item => {
      if (actionStatusFilter === 'pending' && item.status === 'completed') return false;
      if (actionStatusFilter === 'completed' && item.status !== 'completed') return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesTags = item.tags?.some(t => t.toLowerCase().includes(query));
        return matchesTitle || matchesDesc || matchesCategory || matchesTags;
      }
      return true;
    });
  }, [actions, actionStatusFilter, searchQuery]);

  // Filtered Remember Items
  const filteredRemember = useMemo(() => {
    return rememberItems.filter(item => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSummary = item.summary.toLowerCase().includes(query);
        const matchesDetails = item.details.toLowerCase().includes(query);
        const matchesCategory = item.category.toLowerCase().includes(query);
        const matchesTags = item.tags?.some(t => t.toLowerCase().includes(query));
        return matchesTitle || matchesSummary || matchesDetails || matchesCategory || matchesTags;
      }
      return true;
    });
  }, [rememberItems, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalActions = actions.length;
    const completedActions = actions.filter(a => a.status === 'completed').length;
    const pendingActions = totalActions - completedActions;
    const totalRemember = rememberItems.length;
    const criticalRemember = rememberItems.filter(r => r.importance === 'critical').length;

    return {
      totalActions,
      completedActions,
      pendingActions,
      totalRemember,
      criticalRemember
    };
  }, [actions, rememberItems]);

  return (
    <div className="flex-1 w-full flex flex-col gap-3 sm:gap-4 lg:overflow-y-auto lg:max-h-[85vh] pr-1">
      
      {/* Top Banner / Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 flex-shrink-0">
        
        {/* Actions Card */}
        <div 
          onClick={() => setActiveTab('actions')}
          className={`cursor-pointer rounded-xl p-2.5 sm:p-3 transition-all border ${
            activeTab === 'actions'
              ? 'bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
              : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Ενέργειες (Actions)</span>
            <Zap size={15} />
          </div>
          <div className="text-lg sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {stats.pendingActions} <span className="text-xs sm:text-sm font-normal text-neutral-500">εκκρεμείς</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            {stats.completedActions} ολοκληρωμένες από {stats.totalActions} σύνολο
          </div>
        </div>

        {/* Things to Remember Card */}
        <div 
          onClick={() => setActiveTab('remember')}
          className={`cursor-pointer rounded-xl p-2.5 sm:p-3 transition-all border ${
            activeTab === 'remember'
              ? 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
              : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Υπενθυμίσεις (Remember)</span>
            <Bookmark size={15} />
          </div>
          <div className="text-lg sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {stats.totalRemember} <span className="text-xs sm:text-sm font-normal text-neutral-500">σημεία</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            {stats.criticalRemember} κρίσιμης σημασίας
          </div>
        </div>

        {/* Nabu Casa Quick Status */}
        <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2.5 sm:p-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Home Assistant Cloud</span>
            <Sparkles size={15} />
          </div>
          <div className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white tracking-tight truncate">
            Nabu Casa Account
          </div>
          <div className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 truncate">
            Remote Access & TTS Integration
          </div>
        </div>

        {/* Konnected Quick Status */}
        <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2.5 sm:p-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Alarm Integration</span>
            <Shield size={15} />
          </div>
          <div className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white tracking-tight truncate">
            Konnected Alarm Panel Pro
          </div>
          <div className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 truncate">
            Wired Sensors & Beepers
          </div>
        </div>

      </div>

      {/* Main Section Navigation Tabs & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-1 flex-shrink-0">
        
        {/* Toggle Switch between Actions & Things to Remember */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-200/60 dark:bg-neutral-900 border border-neutral-300/80 dark:border-neutral-800 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'actions'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Zap size={15} className={activeTab === 'actions' ? 'text-amber-300' : 'text-indigo-500'} />
            <span>Ενέργειες (Actions)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'actions' ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}>
              {stats.pendingActions}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('remember')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'remember'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-neutral-800/60'
            }`}
          >
            <Bookmark size={15} className={activeTab === 'remember' ? 'text-yellow-200' : 'text-amber-500'} />
            <span>Things to Remember</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'remember' ? 'bg-white/20 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            }`}>
              {stats.totalRemember}
            </span>
          </button>
        </div>

        {/* Right side: Search & Add button */}
        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'actions' ? 'Αναζήτηση ενεργειών...' : 'Αναζήτηση σημειώσεων...'}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Add button */}
          {activeTab === 'actions' ? (
            <button
              onClick={() => setShowAddActionModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Νέα Ενέργεια</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAddRememberModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-sm whitespace-nowrap"
            >
              <Plus size={14} />
              <span>Νέα Υπενθύμιση</span>
            </button>
          )}
        </div>

      </div>

      {/* --- TAB 1: ACTIONS SECTION --- */}
      {activeTab === 'actions' && (
        <div className="space-y-3">
          
          {/* Filter Pills for Actions */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-400 text-[11px] font-medium mr-1">Φίλτρο:</span>
            <button
              onClick={() => setActionStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                actionStatusFilter === 'all'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold'
                  : 'bg-white dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              Όλες ({actions.length})
            </button>
            <button
              onClick={() => setActionStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                actionStatusFilter === 'pending'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'bg-white dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              Εκκρεμείς ({stats.pendingActions})
            </button>
            <button
              onClick={() => setActionStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                actionStatusFilter === 'completed'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'bg-white dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              Ολοκληρωμένες ({stats.completedActions})
            </button>
          </div>

          {/* Actions List */}
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {filteredActions.map(action => {
                const isCompleted = action.status === 'completed';
                const isExpanded = expandedItemId === action.id;

                return (
                  <motion.div
                    key={action.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                      isCompleted 
                        ? 'bg-neutral-50/70 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800/60 opacity-80'
                        : 'bg-white dark:bg-neutral-900/80 border-indigo-200/70 dark:border-indigo-800/40 hover:border-indigo-400 dark:hover:border-indigo-600/60 shadow-md'
                    }`}
                  >
                    <div className="p-3.5 sm:p-4">
                      <div className="flex items-start justify-between gap-3">
                        
                        {/* Checkbox & Title */}
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => toggleActionStatus(action.id)}
                            className="mt-0.5 text-neutral-400 hover:text-emerald-600 transition-colors flex-shrink-0"
                            title={isCompleted ? 'Σήμανση ως εκκρεμές' : 'Σήμανση ως ολοκληρωμένο'}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={22} className="text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                            ) : (
                              <Circle size={22} className="hover:stroke-indigo-500" />
                            )}
                          </button>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                                {action.category}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                action.priority === 'high'
                                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                              }`}>
                                {action.priority === 'high' ? 'Υψηλή Προτεραιότητα' : 'Κανονική'}
                              </span>
                              {isCompleted && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                                  ✓ Ολοκληρώθηκε
                                </span>
                              )}
                            </div>

                            <h3 className={`text-base font-extrabold text-neutral-900 dark:text-white leading-tight ${
                              isCompleted ? 'line-through text-neutral-400 dark:text-neutral-500' : ''
                            }`}>
                              {action.title}
                            </h3>

                            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                        </div>

                        {/* Controls on Right */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => setExpandedItemId(isExpanded ? null : action.id)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title={isExpanded ? 'Σύμπτυξη' : 'Ανάπτυξη βημάτων'}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteAction(action.id)}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Διαγραφή ενέργειας"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                      </div>

                      {/* Expandable Checklist Section */}
                      {isExpanded && action.checklist && action.checklist.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800/80">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                            <Layers size={13} />
                            <span>Βήματα Υλοποίησης / Checklist:</span>
                          </div>
                          <ul className="space-y-1.5">
                            {action.checklist.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300 leading-snug">
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold mt-0.5 flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tags Footer */}
                      {action.tags && action.tags.length > 0 && (
                        <div className="mt-2.5 pt-2 flex items-center gap-1.5 flex-wrap">
                          {action.tags.map(t => (
                            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                              <Tag size={9} />
                              <span>{t}</span>
                            </span>
                          ))}
                        </div>
                      )}

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      )}

      {/* --- TAB 2: THINGS TO REMEMBER SECTION --- */}
      {activeTab === 'remember' && (
        <div className="space-y-3">
          
          {/* Header Banner */}
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span>
                <strong>Λίστα Σημαντικών Υπενθυμίσεων:</strong> Κρίσιμες τεχνικές σημειώσεις, συμβατότητες hardware και σημεία προσοχής κατά την ανέγερση.
              </span>
            </div>
          </div>

          {/* Remember Items Cards */}
          <div className="grid grid-cols-1 gap-3.5">
            <AnimatePresence>
              {filteredRemember.map(item => {
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-2xl border border-amber-200/80 dark:border-amber-800/50 bg-white dark:bg-neutral-900/80 p-4 shadow-md hover:border-amber-400 dark:hover:border-amber-600/70 transition-all duration-200"
                  >
                    <div>
                      {/* Header Badges */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                            {item.importance === 'critical' ? '⚡ ΚΡΙΣΙΜΟ ΣΗΜΕΙΟ' : 'ΣΗΜΑΝΤΙΚΟ'}
                          </span>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteRemember(item.id)}
                            className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Διαγραφή υπενθύμισης"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white leading-tight mb-1.5 flex items-center gap-2">
                        <Bookmark size={18} className="text-amber-500 flex-shrink-0" />
                        <span>{item.title}</span>
                      </h3>

                      {/* Summary */}
                      <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-medium mb-3 leading-relaxed">
                        {item.summary}
                      </p>

                      {/* Details Box */}
                      <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3">
                        {item.details}
                      </div>

                      {/* Key Points Bullet List */}
                      {item.points && item.points.length > 0 && (
                        <div className="space-y-1.5 my-3">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                            <AlertTriangle size={13} />
                            <span>Σημεία Προσοχής & Τεχνικές Οδηγίες:</span>
                          </div>
                          {item.points.map((pt, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed">
                              <span className="text-amber-500 font-bold flex-shrink-0">•</span>
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center gap-1.5 flex-wrap">
                          {item.tags.map(t => (
                            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                              <Tag size={9} />
                              <span>{t}</span>
                            </span>
                          ))}
                        </div>
                      )}

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      )}

      {/* --- MODAL 1: ADD ACTION --- */}
      {showAddActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Zap size={16} className="text-indigo-600" />
                <span>Προσθήκη Νέας Ενέργειας (Action)</span>
              </h3>
              <button onClick={() => setShowAddActionModal(false)} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddAction} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Τίτλος Ενέργειας *</label>
                <input
                  type="text"
                  required
                  value={newActionTitle}
                  onChange={(e) => setNewActionTitle(e.target.value)}
                  placeholder="π.χ. Δημιουργία και διασύνδεση Nabu Casa"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Κατηγορία</label>
                  <select
                    value={newActionCategory}
                    onChange={(e) => setNewActionCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="📡 Smart Home & Cloud">📡 Smart Home & Cloud</option>
                    <option value="🔒 Συναγερμός & Ασφάλεια">🔒 Συναγερμός & Ασφάλεια</option>
                    <option value="🔌 Ηλεκτρολογικά">🔌 Ηλεκτρολογικά</option>
                    <option value="🚰 Υδραυλικά & HVAC">🚰 Υδραυλικά & HVAC</option>
                    <option value="🌿 Εξωτερικοί Χώροι">🌿 Εξωτερικοί Χώροι</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Προτεραιότητα</label>
                  <select
                    value={newActionPriority}
                    onChange={(e) => setNewActionPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="high">Υψηλή</option>
                    <option value="medium">Κανονική</option>
                    <option value="low">Χαμηλή</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Περιγραφή</label>
                <textarea
                  rows={2}
                  value={newActionDesc}
                  onChange={(e) => setNewActionDesc(e.target.value)}
                  placeholder="Σύντομη περιγραφή του τι πρέπει να γίνει..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Βήματα Υλοποίησης (ένα ανά γραμμή)</label>
                <textarea
                  rows={3}
                  value={newActionSteps}
                  onChange={(e) => setNewActionSteps(e.target.value)}
                  placeholder="Βήμα 1&#10;Βήμα 2&#10;Βήμα 3"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddActionModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold text-neutral-600 dark:text-neutral-300"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 shadow-sm"
                >
                  Αποθήκευση
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: ADD REMEMBER ITEM --- */}
      {showAddRememberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
              <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                <Bookmark size={16} className="text-amber-600" />
                <span>Προσθήκη Νέας Υπενθύμισης (Things to Remember)</span>
              </h3>
              <button onClick={() => setShowAddRememberModal(false)} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddRemember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Τίτλος Υπενθύμισης *</label>
                <input
                  type="text"
                  required
                  value={newRememberTitle}
                  onChange={(e) => setNewRememberTitle(e.target.value)}
                  placeholder="π.χ. Konnected Alarm Panel Integration"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Κατηγορία</label>
                  <select
                    value={newRememberCategory}
                    onChange={(e) => setNewRememberCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="🔒 Συναγερμός & Ασφάλεια">🔒 Συναγερμός & Ασφάλεια</option>
                    <option value="📡 Smart Home & Server">📡 Smart Home & Server</option>
                    <option value="🔌 Ηλεκτρολογικά">🔌 Ηλεκτρολογικά</option>
                    <option value="🚰 Υδραυλικά & HVAC">🚰 Υδραυλικά & HVAC</option>
                    <option value="🌿 Κήπος, Deck & Εξωτερικά">🌿 Κήπος, Deck & Εξωτερικά</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Σημασία</label>
                  <select
                    value={newRememberImportance}
                    onChange={(e) => setNewRememberImportance(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="critical">Κρίσιμο</option>
                    <option value="high">Υψηλό</option>
                    <option value="medium">Μεσαίο</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Σύνοψη / Lead</label>
                <input
                  type="text"
                  value={newRememberSummary}
                  onChange={(e) => setNewRememberSummary(e.target.value)}
                  placeholder="Μία πρόταση για το τι αφορά..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Αναλυτικές Σημειώσεις</label>
                <textarea
                  rows={2}
                  value={newRememberDetails}
                  onChange={(e) => setNewRememberDetails(e.target.value)}
                  placeholder="Τεχνικές λεπτομέρειες, συνδεσμολογία, απαιτήσεις..."
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">Κρίσιμα Σημεία / Bullet Points (ένα ανά γραμμή)</label>
                <textarea
                  rows={3}
                  value={newRememberPoints}
                  onChange={(e) => setNewRememberPoints(e.target.value)}
                  placeholder="Σημείο 1&#10;Σημείο 2&#10;Σημείο 3"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddRememberModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 font-semibold text-neutral-600 dark:text-neutral-300"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-500 shadow-sm"
                >
                  Αποθήκευση
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
