import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, 
  List, 
  Table as TableIcon, 
  Layers, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  X, 
  Filter, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Pencil, 
  RotateCcw, 
  ChevronDown, 
  ChevronRight,
  SlidersHorizontal,
  CheckCheck
} from 'lucide-react';
import { Provision } from './data/provisions';
import { ROOMS } from './data/rooms';
import { CATEGORIES as TYPES } from './data/categories';
import { IECSymbol } from './components/IECSymbol';

export type DisplayMode = 'cards' | 'list' | 'table';
export type GroupByMode = 'none' | 'room' | 'category';
export type SortByField = 'default' | 'name' | 'room' | 'type' | 'status' | 'pending';
export type StatusFilter = 'all' | 'incomplete' | 'completed' | 'tbd';

export interface ProvisionsViewProps {
  provisions: Provision[];
  onToggleCompleted?: (id: string, completed?: boolean) => void;
  onTogglePending?: (id: string, pendingReview?: boolean) => void;
  onEditProvision?: (provision: Provision) => void;
  isAdmin?: boolean;
}

export default function ProvisionsView({
  provisions,
  onToggleCompleted,
  onTogglePending,
  onEditProvision,
  isAdmin = false
}: ProvisionsViewProps) {
  // Persistent View Settings - defaults to 'table'
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    const saved = localStorage.getItem('house_provisions_view_mode_v2');
    if (saved === 'table' || saved === 'cards' || saved === 'list') {
      return saved as DisplayMode;
    }
    return 'table';
  });

  const [groupBy, setGroupBy] = useState<GroupByMode>(() => {
    return (localStorage.getItem('house_provisions_group_by') as GroupByMode) || 'none';
  });

  const [sortBy, setSortBy] = useState<SortByField>(() => {
    return (localStorage.getItem('house_provisions_sort_by') as SortByField) || 'default';
  });

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => {
    return (localStorage.getItem('house_provisions_sort_order') as 'asc' | 'desc') || 'asc';
  });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(() => {
    return (localStorage.getItem('house_provisions_status_filter') as StatusFilter) || 'all';
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set(ROOMS));
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(TYPES));
  const [onlyWithNotes, setOnlyWithNotes] = useState<boolean>(false);
  const [showFiltersDrawer, setShowFiltersDrawer] = useState<boolean>(() => {
    const saved = localStorage.getItem('house_provisions_show_filters');
    if (saved !== null) {
      return saved === 'true';
    }
    return true; // Enabled by default
  });

  // Group Collapsing State
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('house_provisions_view_mode_v2', displayMode);
  }, [displayMode]);

  useEffect(() => {
    localStorage.setItem('house_provisions_group_by', groupBy);
  }, [groupBy]);

  useEffect(() => {
    localStorage.setItem('house_provisions_sort_by', sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem('house_provisions_sort_order', sortOrder);
  }, [sortOrder]);

  useEffect(() => {
    localStorage.setItem('house_provisions_status_filter', statusFilter);
  }, [statusFilter]);

  useEffect(() => {
    localStorage.setItem('house_provisions_show_filters', String(showFiltersDrawer));
  }, [showFiltersDrawer]);

  // Overall Statistics
  const totalCount = provisions.length;
  const completedCount = useMemo(() => provisions.filter(p => p.completed).length, [provisions]);
  const tbdCount = useMemo(() => provisions.filter(p => p.pendingReview).length, [provisions]);
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Toggle Filters
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

  const toggleGroupCollapse = (groupName: string) => {
    const next = new Set(collapsedGroups);
    if (next.has(groupName)) next.delete(groupName);
    else next.add(groupName);
    setCollapsedGroups(next);
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedRooms(new Set(ROOMS));
    setSelectedTypes(new Set(TYPES));
    setStatusFilter('all');
    setOnlyWithNotes(false);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedRooms.size < ROOMS.length) count++;
    if (selectedTypes.size < TYPES.length) count++;
    if (statusFilter !== 'all') count++;
    if (onlyWithNotes) count++;
    return count;
  }, [searchQuery, selectedRooms, selectedTypes, statusFilter, onlyWithNotes]);

  // Filter provisions
  const filteredProvisions = useMemo(() => {
    return provisions.filter(item => {
      // Room filter
      if (!selectedRooms.has(item.room)) return false;

      // Category filter
      if (!selectedTypes.has(item.type)) return false;

      // Status filter
      if (statusFilter === 'incomplete' && item.completed) return false;
      if (statusFilter === 'completed' && !item.completed) return false;
      if (statusFilter === 'tbd' && !item.pendingReview) return false;

      // Notes filter
      if (onlyWithNotes && (!item.details || item.details.trim().length === 0)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchRoom = item.room.toLowerCase().includes(q);
        const matchType = item.type.toLowerCase().includes(q);
        const matchWall = item.wall ? item.wall.toLowerCase().includes(q) : false;
        const matchDetails = item.details ? item.details.toLowerCase().includes(q) : false;
        const matchId = item.id.toLowerCase().includes(q);
        if (!matchName && !matchRoom && !matchType && !matchWall && !matchDetails && !matchId) {
          return false;
        }
      }

      return true;
    });
  }, [provisions, selectedRooms, selectedTypes, statusFilter, onlyWithNotes, searchQuery]);

  // Sort provisions
  const sortedProvisions = useMemo(() => {
    const list = [...filteredProvisions];

    list.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'el', { numeric: true });
          break;
        case 'room':
          comparison = a.room.localeCompare(b.room, 'el');
          if (comparison === 0) comparison = a.name.localeCompare(b.name, 'el');
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type, 'el');
          if (comparison === 0) comparison = a.name.localeCompare(b.name, 'el');
          break;
        case 'status':
          // incomplete (0) first in asc, completed (1) in desc
          comparison = (a.completed ? 1 : 0) - (b.completed ? 1 : 0);
          break;
        case 'pending':
          // tbd first in asc
          comparison = (b.pendingReview ? 1 : 0) - (a.pendingReview ? 1 : 0);
          break;
        case 'default':
        default:
          comparison = a.id.localeCompare(b.id, 'en', { numeric: true });
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [filteredProvisions, sortBy, sortOrder]);

  // Group provisions
  const groupedData = useMemo(() => {
    if (groupBy === 'none') {
      return [{ groupKey: 'all', title: 'Όλες οι Παροχές', items: sortedProvisions }];
    }

    const map = new Map<string, Provision[]>();

    sortedProvisions.forEach(item => {
      const key = groupBy === 'room' ? item.room : item.type;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    });

    // Sort group keys
    const sortedKeys = Array.from(map.keys()).sort((a, b) => a.localeCompare(b, 'el'));

    return sortedKeys.map(key => ({
      groupKey: key,
      title: key,
      items: map.get(key) || []
    }));
  }, [sortedProvisions, groupBy]);

  // Bulk complete action for filtered items
  const handleBulkComplete = () => {
    if (!isAdmin || !onToggleCompleted) return;
    const allFilteredAreCompleted = filteredProvisions.every(p => p.completed);
    const targetStatus = !allFilteredAreCompleted;
    if (
      confirm(
        `Θέλετε να ${
          targetStatus ? 'σημειώσετε ως ολοκληρωμένες' : 'επαναφέρετε ως εκκρεμείς'
        } και τις ${filteredProvisions.length} εμφανιζόμενες παροχές;`
      )
    ) {
      filteredProvisions.forEach(p => {
        if (p.completed !== targetStatus) {
          onToggleCompleted(p.id, targetStatus);
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      
      {/* Top Header & Summary Widget */}
      <div className="bg-white/80 dark:bg-neutral-900/60 backdrop-blur-md border border-neutral-300 dark:border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white leading-tight">
              Λίστα & Διαχείριση Παροχών
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
              {filteredProvisions.length} από {totalCount}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Προβολή, ταξινόμηση και έλεγχος όλων των ηλεκτρολογικών, μηχανολογικών και smart home παροχών.
          </p>
        </div>

        {/* Progress Bar & Quick Stats */}
        <div className="flex items-center gap-3 bg-neutral-100 dark:bg-neutral-950/60 p-2 sm:px-3 sm:py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 self-stretch md:self-auto justify-between md:justify-end">
          <div className="flex items-center gap-2">
            <div className="w-24 sm:w-32 bg-neutral-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <div className="text-right">
              <div className="text-xs font-black text-neutral-900 dark:text-neutral-100 leading-none">
                {completedCount}/{totalCount}
              </div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-semibold leading-none mt-0.5">
                {completionPercent}% έτοιμο
              </div>
            </div>
          </div>

          {tbdCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 rounded-lg text-xs font-bold">
              <AlertTriangle size={13} />
              <span>{tbdCount} TBD</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Toolbar */}
      <div className="bg-white/90 dark:bg-neutral-900/70 backdrop-blur-md border border-neutral-300 dark:border-neutral-800 rounded-2xl p-3 shadow-sm flex flex-col gap-2.5">
        
        {/* Row 1: Search + View Mode Controls + Grouping + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Αναζήτηση παροχής (π.χ. πρίζα, ethernet, touch panel, ύψος, σαλόνι)..."
              className="w-full pl-8 pr-8 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Controls Cluster */}
          <div className="flex flex-wrap items-center gap-1.5">
            
            {/* View Mode Segmented Switcher */}
            <div className="flex items-center bg-neutral-200/80 dark:bg-neutral-950/80 p-0.5 rounded-xl border border-neutral-300 dark:border-neutral-800 text-xs">
              <button
                onClick={() => setDisplayMode('cards')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  displayMode === 'cards'
                    ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Προβολή Καρτών (Cards)"
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">Κάρτες</span>
              </button>

              <button
                onClick={() => setDisplayMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  displayMode === 'list'
                    ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Συμπαγής Λίστα (Compact List)"
              >
                <List size={13} />
                <span className="hidden sm:inline">Λίστα</span>
              </button>

              <button
                onClick={() => setDisplayMode('table')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  displayMode === 'table'
                    ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title="Αναλυτικός Πίνακας (Table View)"
              >
                <TableIcon size={13} />
                <span className="hidden sm:inline">Πίνακας</span>
              </button>
            </div>

            {/* Group By Selector */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-1 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs">
              <Layers size={13} className="text-neutral-400 flex-shrink-0" />
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as GroupByMode)}
                className="bg-transparent text-neutral-800 dark:text-neutral-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                title="Ομαδοποίηση"
              >
                <option value="none">Χωρίς Ομαδοποίηση</option>
                <option value="room">Ανά Δωμάτιο</option>
                <option value="category">Ανά Κατηγορία</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 px-2 py-1 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs">
              <ArrowUpDown size={13} className="text-neutral-400 flex-shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortByField)}
                className="bg-transparent text-neutral-800 dark:text-neutral-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                title="Ταξινόμηση κατά"
              >
                <option value="default">Αρχική Σειρά (ID)</option>
                <option value="name">Όνομα Παροχής (Α-Ω)</option>
                <option value="room">Δωμάτιο (Α-Ω)</option>
                <option value="type">Κατηγορία</option>
                <option value="status">Κατάσταση (Εκκρεμή)</option>
                <option value="pending">Εκκρεμότητες TBD</option>
              </select>

              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-0.5 text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title={sortOrder === 'asc' ? 'Αύξουσα Σειρά' : 'Φθίνουσα Σειρά'}
              >
                {sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              </button>
            </div>

            {/* Filter Drawer Toggle */}
            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                showFiltersDrawer || activeFiltersCount > 0
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-400'
              }`}
            >
              <Filter size={13} />
              <span>Φίλτρα</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-indigo-700 text-[10px] font-black flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Status Filter Tabs & Quick Action Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-800/80">
          
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Όλες ({totalCount})
            </button>

            <button
              onClick={() => setStatusFilter('incomplete')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'incomplete'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              Εκκρεμείς ({totalCount - completedCount})
            </button>

            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'completed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
            >
              Ολοκληρωμένες ({completedCount})
            </button>

            <button
              onClick={() => setStatusFilter('tbd')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'tbd'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <AlertTriangle size={11} />
              <span>TBD ({tbdCount})</span>
            </button>

            <button
              onClick={() => setOnlyWithNotes(!onlyWithNotes)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-all border ${
                onlyWithNotes
                  ? 'bg-cyan-100 dark:bg-cyan-950/80 border-cyan-400 text-cyan-800 dark:text-cyan-300 font-bold'
                  : 'bg-neutral-100 dark:bg-neutral-800/40 border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
              title="Φιλτράρισμα παροχών με τεχνικές σημειώσεις/ύψη"
            >
              Με Σημειώσεις
            </button>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold flex items-center gap-1"
                title="Καθαρισμός όλων των ενεργών φίλτρων"
              >
                <RotateCcw size={11} />
                <span>Καθαρισμός Φίλτρων</span>
              </button>
            )}

            {isAdmin && filteredProvisions.length > 0 && (
              <button
                onClick={handleBulkComplete}
                className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 transition-colors"
                title="Σήμανση / αποεπιλογή όλων των εμφανιζόμενων"
              >
                <CheckCheck size={12} />
                <span className="hidden sm:inline">Μαζική Σήμανση</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filter Panel (Rooms & Categories) */}
        {showFiltersDrawer && (
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-3 animate-fadeIn">
            
            {/* Rooms Selector */}
            <div className="bg-neutral-50 dark:bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Δωμάτια ({selectedRooms.size}/{ROOMS.length})
                </span>
                <div className="space-x-2 text-[10px] font-medium text-neutral-500">
                  <button onClick={() => setSelectedRooms(new Set(ROOMS))} className="hover:text-indigo-600">Όλα</button>
                  <button onClick={() => setSelectedRooms(new Set())} className="hover:text-indigo-600">Κανένα</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto pr-1">
                {ROOMS.map(room => {
                  const count = provisions.filter(p => p.room === room).length;
                  const isSel = selectedRooms.has(room);
                  return (
                    <button
                      key={room}
                      onClick={() => toggleRoom(room)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors border ${
                        isSel
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-indigo-200 font-semibold'
                          : 'bg-white dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {room} <span className="opacity-60 text-[10px]">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories Selector */}
            <div className="bg-neutral-50 dark:bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  Κατηγορίες ({selectedTypes.size}/{TYPES.length})
                </span>
                <div className="space-x-2 text-[10px] font-medium text-neutral-500">
                  <button onClick={() => setSelectedTypes(new Set(TYPES))} className="hover:text-cyan-600">Όλες</button>
                  <button onClick={() => setSelectedTypes(new Set())} className="hover:text-cyan-600">Καμία</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto pr-1">
                {TYPES.map(type => {
                  const count = provisions.filter(p => p.type === type).length;
                  const isSel = selectedTypes.has(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors border ${
                        isSel
                          ? 'bg-cyan-600/20 border-cyan-500 text-cyan-700 dark:text-cyan-200 font-semibold'
                          : 'bg-white dark:bg-neutral-800/50 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {type} <span className="opacity-60 text-[10px]">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Main Content Area (Cards, List, or Table) */}
      <div className="flex-1 overflow-y-auto pr-0.5 sm:pr-1 pb-6">
        
        {groupedData.length === 0 || sortedProvisions.length === 0 ? (
          <div className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center">
            <SlidersHorizontal size={36} className="text-neutral-300 dark:text-neutral-700 mb-2" />
            <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Δεν βρέθηκαν παροχές</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
              Δεν υπάρχουν παροχές που να ικανοποιούν τα επιλεγμένα φίλτρα αναζήτησης ή κατηγοριών.
            </p>
            <button
              onClick={resetAllFilters}
              className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-sm hover:bg-indigo-500 transition-colors"
            >
              Επαναφορά όλων των φίλτρων
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedData.map(group => {
              const isCollapsed = collapsedGroups.has(group.groupKey);
              const groupCompleted = group.items.filter(p => p.completed).length;
              const groupTotal = group.items.length;
              const groupPercent = groupTotal > 0 ? Math.round((groupCompleted / groupTotal) * 100) : 0;

              return (
                <div key={group.groupKey} className="space-y-2">
                  
                  {/* Group Header (if grouped) */}
                  {groupBy !== 'none' && (
                    <div 
                      onClick={() => toggleGroupCollapse(group.groupKey)}
                      className="flex items-center justify-between p-2.5 bg-neutral-200/70 dark:bg-neutral-900/90 hover:bg-neutral-200 dark:hover:bg-neutral-850 rounded-xl border border-neutral-300 dark:border-neutral-800 cursor-pointer select-none transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isCollapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                        <h3 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                          {group.title}
                        </h3>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-300 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {groupTotal} {groupTotal === 1 ? 'παροχή' : 'παροχές'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-neutral-500">
                          <span>{groupCompleted}/{groupTotal}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">({groupPercent}%)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Group Body: Render according to DisplayMode */}
                  {!isCollapsed && (
                    <>
                      {/* 1. CARDS VIEW */}
                      {displayMode === 'cards' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                          <AnimatePresence>
                            {group.items.map(provision => (
                              <motion.div
                                key={provision.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                                className={`rounded-xl p-3 border backdrop-blur-md transition-all duration-200 relative flex flex-col justify-between ${
                                  provision.completed
                                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/40 opacity-75'
                                    : provision.pendingReview
                                    ? 'bg-amber-50/90 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-sm'
                                    : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-indigo-500/50 shadow-sm'
                                }`}
                              >
                                <div className="flex items-start gap-2.5">
                                  {/* Checkbox */}
                                  <button
                                    disabled={!isAdmin || !onToggleCompleted}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isAdmin && onToggleCompleted) {
                                        onToggleCompleted(provision.id);
                                      }
                                    }}
                                    className={`p-0.5 rounded transition-colors flex-shrink-0 mt-0.5 ${
                                      !isAdmin ? 'cursor-default opacity-85' : 'cursor-pointer'
                                    } ${
                                      provision.completed
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-300'
                                    }`}
                                    title={
                                      !isAdmin
                                        ? (provision.completed ? 'Ολοκληρωμένο (Μόνο Προβολή)' : 'Εκκρεμές (Μόνο Προβολή)')
                                        : (provision.completed ? 'Σημειώθηκε ως ολοκληρωμένο' : 'Σήμανση ως ολοκληρωμένο')
                                    }
                                  >
                                    {provision.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                  </button>

                                  {/* IEC Symbol */}
                                  <IECSymbol provisionName={provision.name} category={provision.type} size={24} />

                                  <div className="space-y-1 flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <div className="flex items-center flex-wrap gap-1">
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 px-1.5 py-0.5 rounded">
                                          {provision.room}
                                        </span>
                                        {provision.wall && (
                                          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30">
                                            {provision.wall}
                                          </span>
                                        )}
                                      </div>

                                      {/* Edit Button */}
                                      {isAdmin && onEditProvision && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onEditProvision(provision);
                                          }}
                                          className="p-1 rounded text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                          title="Επεξεργασία παροχής"
                                        >
                                          <Pencil size={12} />
                                        </button>
                                      )}
                                    </div>

                                    <h4 className={`text-xs font-bold leading-tight ${
                                      provision.completed 
                                        ? 'line-through text-neutral-400 dark:text-neutral-500' 
                                        : 'text-neutral-900 dark:text-neutral-100'
                                    }`}>
                                      {provision.name}
                                    </h4>

                                    {provision.details && (
                                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-snug pt-0.5">
                                        {provision.details}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-between gap-1 pt-1.5 mt-1 border-t border-neutral-100 dark:border-neutral-800/60">
                                      <span className="text-[10px] font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-900/50">
                                        {provision.type}
                                      </span>

                                      {provision.pendingReview && (
                                        <button
                                          type="button"
                                          disabled={!isAdmin || !onTogglePending}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (isAdmin && onTogglePending) {
                                              onTogglePending(provision.id);
                                            }
                                          }}
                                          className={`text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700/60 flex items-center gap-1 transition-colors ${
                                            isAdmin ? 'hover:bg-amber-200 dark:hover:bg-amber-900 cursor-pointer' : 'cursor-default'
                                          }`}
                                          title={isAdmin ? "Εκκρεμεί έλεγχος (TBD) - Κλικ για αφαίρεση" : "Εκκρεμεί έλεγχος (TBD)"}
                                        >
                                          <AlertTriangle size={10} />
                                          <span>TBD</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* 2. COMPACT LIST VIEW */}
                      {displayMode === 'list' && (
                        <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-xl divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden shadow-sm">
                          {group.items.map(provision => (
                            <div
                              key={provision.id}
                              onClick={isAdmin && onToggleCompleted ? () => onToggleCompleted(provision.id) : undefined}
                              className={`p-2.5 sm:px-3 sm:py-2.5 flex items-center justify-between gap-2.5 transition-colors select-none ${
                                isAdmin ? 'cursor-pointer' : 'cursor-default'
                              } ${
                                provision.completed
                                  ? 'bg-emerald-50/30 dark:bg-emerald-950/10 opacity-75'
                                  : provision.pendingReview
                                  ? 'bg-amber-50/60 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-850/60'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <button
                                  disabled={!isAdmin || !onToggleCompleted}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isAdmin && onToggleCompleted) onToggleCompleted(provision.id);
                                  }}
                                  className={`p-0.5 rounded transition-colors flex-shrink-0 ${
                                    !isAdmin ? 'cursor-default' : 'cursor-pointer'
                                  } ${
                                    provision.completed
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500'
                                  }`}
                                  title={
                                    !isAdmin
                                      ? (provision.completed ? 'Ολοκληρωμένο (Μόνο Προβολή)' : 'Εκκρεμές (Μόνο Προβολή)')
                                      : (provision.completed ? 'Σημειώθηκε ως ολοκληρωμένο' : 'Σήμανση ως ολοκληρωμένο')
                                  }
                                >
                                  {provision.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                </button>

                                <IECSymbol provisionName={provision.name} category={provision.type} size={20} />

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className={`text-xs font-bold ${
                                      provision.completed 
                                        ? 'line-through text-neutral-400 dark:text-neutral-500' 
                                        : 'text-neutral-900 dark:text-neutral-100'
                                    }`}>
                                      {provision.name}
                                    </span>

                                    {provision.pendingReview && (
                                      <button
                                        type="button"
                                        disabled={!isAdmin || !onTogglePending}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isAdmin && onTogglePending) onTogglePending(provision.id);
                                        }}
                                        className={`text-[9px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1 py-0.5 rounded border border-amber-300 dark:border-amber-700/60 flex items-center gap-0.5 transition-colors ${
                                          isAdmin ? 'hover:bg-amber-200 dark:hover:bg-amber-900 cursor-pointer' : 'cursor-default'
                                        }`}
                                        title={isAdmin ? "Εκκρεμεί έλεγχος (TBD) - Κλικ για αφαίρεση" : "Εκκρεμεί έλεγχος (TBD)"}
                                      >
                                        <AlertTriangle size={9} />
                                        <span>TBD</span>
                                      </button>
                                    )}
                                  </div>

                                  {provision.details && (
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-xl">
                                      {provision.details}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Badges & Actions */}
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="hidden sm:inline-block text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded">
                                  {provision.room}
                                </span>

                                {provision.wall && (
                                  <span className="hidden md:inline-block text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/40">
                                    {provision.wall}
                                  </span>
                                )}

                                <span className="text-[10px] font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40">
                                  {provision.type}
                                </span>

                                {isAdmin && onEditProvision && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditProvision(provision);
                                    }}
                                    className="p-1 rounded text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    title="Επεξεργασία"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 3. STRUCTURED TABLE VIEW */}
                      {displayMode === 'table' && (
                        <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-x-auto shadow-sm">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/60 text-neutral-500 dark:text-neutral-400 uppercase text-[10px] tracking-wider">
                                <th className="py-2.5 px-3 w-8 text-center">Κατάσταση</th>
                                <th className="py-2.5 px-2 w-8 text-center">IEC</th>
                                <th className="py-2.5 px-3">Όνομα Παροχής</th>
                                <th className="py-2.5 px-3">Χώρος</th>
                                <th className="py-2.5 px-3">Τοίχος</th>
                                <th className="py-2.5 px-3">Κατηγορία</th>
                                <th className="py-2.5 px-3 min-w-[200px]">Σημειώσεις / Ύψος</th>
                                <th className="py-2.5 px-2 text-center">TBD</th>
                                {isAdmin && onEditProvision && <th className="py-2.5 px-3 text-right">Ενέργειες</th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                              {group.items.map(provision => (
                                <tr
                                  key={provision.id}
                                  className={`transition-colors ${
                                    provision.completed
                                      ? 'bg-emerald-50/30 dark:bg-emerald-950/10 opacity-75'
                                      : provision.pendingReview
                                      ? 'bg-amber-50/50 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20'
                                      : 'hover:bg-neutral-50 dark:hover:bg-neutral-850/60'
                                  }`}
                                >
                                  {/* Checkbox */}
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      disabled={!isAdmin || !onToggleCompleted}
                                      onClick={() => {
                                        if (isAdmin && onToggleCompleted) onToggleCompleted(provision.id);
                                      }}
                                      className={`p-0.5 rounded transition-colors ${
                                        !isAdmin ? 'cursor-default' : 'cursor-pointer'
                                      } ${
                                        provision.completed
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500'
                                      }`}
                                      title={
                                        !isAdmin
                                          ? (provision.completed ? 'Ολοκληρωμένο (Μόνο Προβολή)' : 'Εκκρεμές (Μόνο Προβολή)')
                                          : (provision.completed ? 'Σημειώθηκε ως ολοκληρωμένο' : 'Σήμανση ως ολοκληρωμένο')
                                      }
                                    >
                                      {provision.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                    </button>
                                  </td>

                                  {/* Symbol */}
                                  <td className="py-2.5 px-2 text-center">
                                    <div className="flex justify-center">
                                      <IECSymbol provisionName={provision.name} category={provision.type} size={20} />
                                    </div>
                                  </td>

                                  {/* Name */}
                                  <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-neutral-100">
                                    <span className={provision.completed ? 'line-through text-neutral-400' : ''}>
                                      {provision.name}
                                    </span>
                                  </td>

                                  {/* Room */}
                                  <td className="py-2.5 px-3 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                                    {provision.room}
                                  </td>

                                  {/* Wall */}
                                  <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                                    {provision.wall || '-'}
                                  </td>

                                  {/* Category */}
                                  <td className="py-2.5 px-3 whitespace-nowrap">
                                    <span className="text-[10px] font-medium text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/40">
                                      {provision.type}
                                    </span>
                                  </td>

                                  {/* Details */}
                                  <td className="py-2.5 px-3 text-neutral-600 dark:text-neutral-400 text-[11px]">
                                    {provision.details || <span className="text-neutral-400 italic">-</span>}
                                  </td>

                                  {/* TBD */}
                                  <td className="py-2.5 px-2 text-center">
                                    {isAdmin ? (
                                      <button
                                        type="button"
                                        disabled={!onTogglePending}
                                        onClick={() => onTogglePending && onTogglePending(provision.id)}
                                        className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                          provision.pendingReview
                                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 border-amber-300 dark:border-amber-700/60'
                                            : 'text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-amber-400'
                                        }`}
                                        title={provision.pendingReview ? 'Εκκρεμεί έλεγχος (TBD) - Κλικ για αφαίρεση' : 'Ορισμός ως TBD'}
                                      >
                                        <AlertTriangle size={10} />
                                        <span>{provision.pendingReview ? 'TBD' : '-'}</span>
                                      </button>
                                    ) : (
                                      provision.pendingReview ? (
                                        <span
                                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold border bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60"
                                          title="Εκκρεμεί έλεγχος (TBD)"
                                        >
                                          <AlertTriangle size={10} />
                                          <span>TBD</span>
                                        </span>
                                      ) : (
                                        <span className="text-neutral-400 text-[10px]">-</span>
                                      )
                                    )}
                                  </td>

                                  {/* Actions */}
                                  {isAdmin && onEditProvision && (
                                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                      <button
                                        onClick={() => onEditProvision(provision)}
                                        className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-indigo-600 hover:text-white text-neutral-600 dark:text-neutral-400 transition-colors inline-flex items-center gap-1 text-[11px]"
                                        title="Επεξεργασία"
                                      >
                                        <Pencil size={11} />
                                        <span className="hidden sm:inline">Επεξεργασία</span>
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
