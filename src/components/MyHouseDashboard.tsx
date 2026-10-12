import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid, 
  Workflow, 
  ShoppingCart, 
  FileText, 
  Settings, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Search, 
  Filter, 
  AlertTriangle, 
  Printer, 
  Database, 
  Euro, 
  X
} from 'lucide-react';
import { 
  CustomProjectData, 
  CustomProvision, 
  QuestionnaireAnswers 
} from '../types/questionnaire';
import { IECSymbol } from './IECSymbol';
import QuestionnaireView from './QuestionnaireView';
import Flow from '../Flow';

interface MyHouseDashboardProps {
  projectData: CustomProjectData;
  isSqliteConnected: boolean;
  onSaveQuestionnaire: (answers: QuestionnaireAnswers) => Promise<void>;
  onToggleProvision: (provisionId: string, completed: boolean) => Promise<void>;
  onToggleProcurement: (itemId: string, purchased: boolean) => Promise<void>;
  onAddProvision: (provision: Omit<CustomProvision, 'id'>) => Promise<void>;
  onDeleteProvision: (provisionId: string) => Promise<void>;
}

export default function MyHouseDashboard({
  projectData,
  isSqliteConnected,
  onSaveQuestionnaire,
  onToggleProvision,
  onToggleProcurement,
  onAddProvision,
  onDeleteProvision
}: MyHouseDashboardProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'flow' | 'buy' | 'rules' | 'config' | 'export'>('list');
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set(projectData.rooms));
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set([
    '💡 Φώτα', '🔌 Πρίζες', '🚰 Υδραυλικά', '🔒 Ασφάλεια', '🔧 Συντήρηση', '🖥️ Server Cabinet', '📡 Έξυπνο Σπίτι'
  ]));
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modal for adding a custom provision
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProvName, setNewProvName] = useState('');
  const [newProvRoom, setNewProvRoom] = useState(projectData.rooms[0] || '🛋️ Σαλόνι / Τραπεζαρία');
  const [newProvWall, setNewProvWall] = useState('');
  const [newProvType, setNewProvType] = useState('🔌 Πρίζες');
  const [newProvDetails, setNewProvDetails] = useState('');

  // Keep selected rooms in sync if rooms change
  React.useEffect(() => {
    setSelectedRooms(new Set(projectData.rooms));
  }, [projectData.rooms]);

  const categories = useMemo(() => [
    '💡 Φώτα', '🔌 Πρίζες', '🚰 Υδραυλικά', '🔒 Ασφάλεια', '🔧 Συντήρηση', '🖥️ Server Cabinet', '📡 Έξυπνο Σπίτι'
  ], []);

  // Filter provisions
  const filteredProvisions = useMemo(() => {
    return projectData.provisions.filter(p => {
      if (!selectedRooms.has(p.room)) return false;
      if (!selectedTypes.has(p.type)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchWall = p.wall.toLowerCase().includes(q);
        const matchRoom = p.room.toLowerCase().includes(q);
        const matchDetails = p.details?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchWall && !matchRoom && !matchDetails) return false;
      }
      return true;
    });
  }, [projectData.provisions, selectedRooms, selectedTypes, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = projectData.provisions.length;
    const completed = projectData.provisions.filter(p => p.completed).length;
    const pending = projectData.provisions.filter(p => p.pendingReview).length;
    const totalCost = projectData.procurement.reduce((acc, curr) => acc + (curr.estimatedPriceEur * curr.quantity), 0);
    const purchasedItems = projectData.procurement.filter(i => i.purchased).length;
    const totalItems = projectData.procurement.length;

    return {
      total,
      completed,
      pending,
      percentComplete: total > 0 ? Math.round((completed / total) * 100) : 0,
      totalCost,
      purchasedItems,
      totalItems
    };
  }, [projectData]);

  const handleSaveConfig = async (answers: QuestionnaireAnswers) => {
    setIsSaving(true);
    try {
      await onSaveQuestionnaire(answers);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName.trim()) return;

    await onAddProvision({
      name: newProvName.trim(),
      room: newProvRoom,
      wall: newProvWall.trim() || 'Κεντρικός Τοίχος',
      type: newProvType,
      completed: false,
      details: newProvDetails.trim()
    });

    setNewProvName('');
    setNewProvWall('');
    setNewProvDetails('');
    setShowAddModal(false);
  };

  const toggleRoom = (room: string) => {
    if (selectedRooms.size === projectData.rooms.length) {
      setSelectedRooms(new Set([room]));
    } else {
      const next = new Set(selectedRooms);
      if (next.has(room)) next.delete(room);
      else next.add(room);
      setSelectedRooms(next);
    }
  };

  const toggleType = (type: string) => {
    if (selectedTypes.size === categories.length) {
      setSelectedTypes(new Set([type]));
    } else {
      const next = new Set(selectedTypes);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      setSelectedTypes(next);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-4 overflow-hidden">
      
      {/* Top Banner with Project Summary & Controls */}
      <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 shadow-sm backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-extrabold text-neutral-900 dark:text-white">
              {projectData.answers.projectName || 'Το Σπίτι Μου'}
            </h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {projectData.answers.houseType === 'detached' ? 'Μονοκατοικία' : 
               projectData.answers.houseType === 'maisonette' ? 'Μεζονέτα' : 
               projectData.answers.houseType === 'apartment' ? 'Διαμέρισμα' : 'Ανακαίνιση'} ({projectData.answers.floors} Όροφοι)
            </span>
            <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${
              isSqliteConnected 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' 
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
            }`}>
              <Database size={11} className={isSqliteConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'} />
              <span>{isSqliteConnected ? 'SQLite Αποθηκευμένο' : 'Τοπική Προσωρινή Μνήμη'}</span>
            </div>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {projectData.rooms.length} Χώροι • {stats.total} Πρόνοιες • {stats.completed} Ολοκληρωμένες ({stats.percentComplete}%) • Εκτιμώμενος Εξοπλισμός: ~{stats.totalCost.toLocaleString('el-GR')}€
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center flex-wrap gap-1 bg-neutral-200/80 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-300 dark:border-neutral-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'list' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Grid size={13} />
            <span>Πρόνοιες ({filteredProvisions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'flow' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Workflow size={13} />
            <span>Διάγραμμα</span>
          </button>

          <button
            onClick={() => setActiveTab('buy')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'buy' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ShoppingCart size={13} />
            <span>Αγορές & Budget</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'rules' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>Κανόνες</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'config' 
                ? 'bg-cyan-600 text-white shadow-sm' 
                : 'text-cyan-700 dark:text-cyan-400 hover:text-cyan-900 dark:hover:text-white'
            }`}
          >
            <Settings size={13} />
            <span>Ερωτηματολόγιο</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'export' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Printer size={13} />
            <span>Εκτύπωση</span>
          </button>
        </div>

      </div>

      {/* VIEW: QUESTIONNAIRE CONFIG */}
      {activeTab === 'config' && (
        <QuestionnaireView
          answers={projectData.answers}
          onSave={handleSaveConfig}
          isSaving={isSaving}
          isSqliteConnected={isSqliteConnected}
          onViewProvisions={() => setActiveTab('list')}
        />
      )}

      {/* VIEW: PROVISIONS LIST */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-3 space-y-3">
            
            {/* Search and Add Provision Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Αναζήτηση πρόνοιας..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                title="Προσθήκη custom πρόνοιας"
              >
                <Plus size={14} />
                <span>Νέα</span>
              </button>
            </div>

            {/* Room Filter */}
            <div className="bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-sm">
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-300">
                  Χώροι ({projectData.rooms.length})
                </h3>
                <div className="space-x-2 text-[10px] font-medium text-neutral-500">
                  <button onClick={() => setSelectedRooms(new Set(projectData.rooms))} className="hover:text-indigo-500">Όλοι</button>
                  <button onClick={() => setSelectedRooms(new Set())} className="hover:text-indigo-500">Κανένας</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                {projectData.rooms.map(room => (
                  <button
                    key={room}
                    onClick={() => toggleRoom(room)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                      selectedRooms.has(room)
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-indigo-200'
                        : 'bg-neutral-100 dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="bg-white/80 dark:bg-neutral-900/50 backdrop-blur-xl p-3.5 rounded-xl border border-neutral-300 dark:border-neutral-800 shadow-sm">
              <div className="flex justify-between items-center mb-2.5">
                <h3 className="text-xs font-bold text-cyan-600 dark:text-cyan-300">Κατηγορίες</h3>
                <div className="space-x-2 text-[10px] font-medium text-neutral-500">
                  <button onClick={() => setSelectedTypes(new Set(categories))} className="hover:text-cyan-500">Όλες</button>
                  <button onClick={() => setSelectedTypes(new Set())} className="hover:text-cyan-500">Καμία</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => toggleType(cat)}
                    className={`px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                      selectedTypes.has(cat)
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-700 dark:text-cyan-200'
                        : 'bg-neutral-100 dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Provisions Cards Grid */}
          <div className="lg:col-span-9 bg-white/60 dark:bg-neutral-900/30 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 flex flex-col h-[75vh]">
            <div className="flex justify-between items-center mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  Εξατομικευμένες Πρόνοιες Κατοικίας
                </h3>
                <span className="text-xs text-neutral-500">
                  (Κάντε κλικ στο κουτάκι για να σημειώσετε ολοκλήρωση στη βάση SQLite)
                </span>
              </div>
              <div className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {filteredProvisions.length} Εμφανίζονται
              </div>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <AnimatePresence>
                  {filteredProvisions.map((provision) => {
                    return (
                      <motion.div
                        key={provision.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`rounded-xl p-3 border transition-all ${
                          provision.completed 
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60' 
                            : provision.pendingReview
                            ? 'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                            : 'bg-white dark:bg-neutral-850/50 border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Complete checkbox */}
                          <button
                            onClick={() => onToggleProvision(provision.id, !provision.completed)}
                            className="mt-0.5 text-neutral-400 hover:text-emerald-500 transition-colors shrink-0"
                            title={provision.completed ? 'Σημείωση ως εκκρεμές' : 'Σημείωση ως ολοκληρωμένο'}
                          >
                            {provision.completed ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                              <Circle size={18} />
                            )}
                          </button>

                          {/* IEC Symbol */}
                          <IECSymbol provisionName={provision.name} category={provision.type} size={22} />

                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 px-1.5 py-0.5 rounded">
                                {provision.room}
                              </span>
                              {provision.wall && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                                  {provision.wall}
                                </span>
                              )}
                              {provision.pendingReview && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700/60 flex items-center gap-1">
                                  <AlertTriangle size={10} />
                                  TBD
                                </span>
                              )}
                            </div>

                            <h4 className={`text-xs font-bold leading-tight ${
                              provision.completed 
                                ? 'line-through text-neutral-500 dark:text-neutral-400' 
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}>
                              {provision.name}
                            </h4>

                            {provision.details && (
                              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug">
                                {provision.details}
                              </p>
                            )}

                            <div className="pt-1 flex items-center justify-between">
                              <span className="text-[10px] font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded">
                                {provision.type}
                              </span>

                              {provision.id.startsWith('cust_manual') && (
                                <button
                                  onClick={() => onDeleteProvision(provision.id)}
                                  className="text-[10px] text-rose-500 hover:text-rose-400"
                                >
                                  Διαγραφή
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {filteredProvisions.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
                  <Filter size={28} className="mb-2 opacity-30" />
                  <p className="text-xs">Δεν βρέθηκαν πρόνοιες με τα επιλεγμένα φίλτρα.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW: FLOW DIAGRAM */}
      {activeTab === 'flow' && (
        <div className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-300 dark:border-neutral-800 rounded-2xl h-[75vh] relative overflow-hidden">
          <Flow 
            provisions={projectData.provisions} 
            rooms={Array.from(selectedRooms)} 
          />
        </div>
      )}

      {/* VIEW: PROCUREMENT & BUDGET */}
      {activeTab === 'buy' && (
        <div className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-5 flex flex-col h-[75vh] overflow-y-auto">
          
          {/* Procurement Metrics Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="bg-neutral-100 dark:bg-neutral-950/60 border border-neutral-300 dark:border-neutral-800 rounded-xl p-3">
              <span className="text-xs text-neutral-500">Εκτιμώμενος Συνολικός Προϋπολογισμός</span>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <Euro size={18} />
                <span>{stats.totalCost.toLocaleString('el-GR')} €</span>
              </div>
            </div>

            <div className="bg-neutral-100 dark:bg-neutral-950/60 border border-neutral-300 dark:border-neutral-800 rounded-xl p-3">
              <span className="text-xs text-neutral-500">Κατάσταση Αγορών</span>
              <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {stats.purchasedItems} / {stats.totalItems} Είδη
              </div>
            </div>

            <div className="bg-neutral-100 dark:bg-neutral-950/60 border border-neutral-300 dark:border-neutral-800 rounded-xl p-3">
              <span className="text-xs text-neutral-500">Αποθήκευση Δεδομένων</span>
              <div className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mt-1 flex items-center gap-2">
                <Database size={15} className="text-cyan-400" />
                <span>Αυτόματη καταχώρηση στη βάση SQLite</span>
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">
            Προτεινόμενος Εξοπλισμός Βάσει των Επιλογών σας
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-300 dark:border-neutral-800 text-neutral-500">
                  <th className="py-2 px-3">Αγοράστηκε;</th>
                  <th className="py-2 px-3">Εξοπλισμός / Είδος</th>
                  <th className="py-2 px-3">Κατηγορία</th>
                  <th className="py-2 px-3">Ποσότητα</th>
                  <th className="py-2 px-3">Εκτιμ. Τιμή / Μονάδα</th>
                  <th className="py-2 px-3">Σύνολο</th>
                  <th className="py-2 px-3">Προτεινόμενο Brand / Μοντέλο</th>
                  <th className="py-2 px-3">Σημειώσεις</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-850">
                {projectData.procurement.map((item) => (
                  <tr 
                    key={item.id}
                    className={`hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 transition-colors ${
                      item.purchased ? 'bg-emerald-50/40 dark:bg-emerald-950/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => onToggleProcurement(item.id, !item.purchased)}
                        className="text-neutral-400 hover:text-emerald-500 transition-colors"
                      >
                        {item.purchased ? (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        ) : (
                          <Circle size={16} />
                        )}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-neutral-100">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px] font-medium text-neutral-700 dark:text-neutral-300">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800 dark:text-neutral-200">
                      {item.quantity}x
                    </td>
                    <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400">
                      {item.estimatedPriceEur} €
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {(item.estimatedPriceEur * item.quantity).toLocaleString('el-GR')} €
                    </td>
                    <td className="py-2.5 px-3 text-indigo-600 dark:text-indigo-300">
                      {item.brand} {item.model ? `(${item.model})` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-neutral-500 text-[11px]">
                      {item.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* VIEW: ENGINEERING RULES */}
      {activeTab === 'rules' && (
        <div className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-5 flex flex-col h-[75vh] overflow-y-auto space-y-4">
          <div className="border-b border-neutral-300 dark:border-neutral-800 pb-3">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Γενικές Οδηγίες & Κανόνες Εφαρμογής για το Σπίτι σας
            </h3>
            <p className="text-xs text-neutral-500">
              Οι παρακάτω τεχνικοί κανόνες εφαρμόζονται οριζόντια σε όλες τις εργασίες ηλεκτρολόγου και υδραυλικού.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projectData.rules.map((rule) => (
              <div 
                key={rule.id}
                className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {rule.title}
                  </h4>
                  <span className="text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded">
                    {rule.category}
                  </span>
                </div>

                <div className="text-xs text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">Πεδίο Εφαρμογής: </span>
                  {rule.scope}
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-200 font-medium whitespace-pre-line">
                  ⚠️ <strong>Κρίσιμη Απαίτηση: </strong>{rule.criticalRequirement}
                </div>

                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  💡 {rule.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: EXPORT / PRINT */}
      {activeTab === 'export' && (
        <div className="bg-white/80 dark:bg-neutral-900/80 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-6 flex flex-col h-[75vh] overflow-y-auto space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-300 dark:border-neutral-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                Τεχνική Έκθεση Προνοιών Κατοικίας (Checklist για Ηλεκτρολόγο & Μηχανικό)
              </h3>
              <p className="text-xs text-neutral-500">
                {projectData.answers.projectName} • Ημερομηνία: {new Date().toLocaleDateString('el-GR')}
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Printer size={16} />
              <span>Εκτύπωση / Αποθήκευση PDF</span>
            </button>
          </div>

          {/* Grouped by Room */}
          <div className="space-y-5">
            {projectData.rooms.map(room => {
              const roomProvs = projectData.provisions.filter(p => p.room === room);
              if (roomProvs.length === 0) return null;

              return (
                <div key={room} className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 bg-neutral-50 dark:bg-neutral-950/40">
                  <h4 className="text-sm font-extrabold text-neutral-900 dark:text-white mb-2 pb-1 border-b border-neutral-200 dark:border-neutral-800">
                    {room} ({roomProvs.length} Πρόνοιες)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {roomProvs.map(p => (
                      <div key={p.id} className="flex items-start gap-2 py-1">
                        <span className="font-mono text-neutral-400">•</span>
                        <div>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{p.name}</span>
                          <span className="text-neutral-500 text-[11px] ml-1.5">[{p.wall}]</span>
                          {p.details && (
                            <p className="text-[10px] text-neutral-500">{p.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Custom Provision */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={16} className="text-indigo-400" />
                Προσθήκη Νέας Πρόνοιας
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProvision} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Όνομα Πρόνοιας</label>
                <input 
                  type="text" 
                  required
                  placeholder="π.χ. Αναμονή Cat6 για κάμερα οροφής"
                  value={newProvName}
                  onChange={e => setNewProvName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Χώρος</label>
                  <select
                    value={newProvRoom}
                    onChange={e => setNewProvRoom(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {projectData.rooms.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">Κατηγορία</label>
                  <select
                    value={newProvType}
                    onChange={e => setNewProvType(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Τοίχος / Σημείο Τοποθέτησης</label>
                <input 
                  type="text" 
                  placeholder="π.χ. Βόρειος Τοίχος / Οροφή"
                  value={newProvWall}
                  onChange={e => setNewProvWall(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1">Τεχνικές Λεπτομέρειες / Οδηγίες</label>
                <textarea 
                  rows={2}
                  placeholder="π.χ. Σωλήνα F20 χωνευτή, καλώδιο Cat6 UTP..."
                  value={newProvDetails}
                  onChange={e => setNewProvDetails(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white bg-neutral-800"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500"
                >
                  Αποθήκευση στη Βάση SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
