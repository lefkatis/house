import { useState, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Search, 
  AlertCircle, 
  Euro, 
  Layers,
  HelpCircle,
  Check,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Pencil
} from 'lucide-react';
import { PROCUREMENT_CATEGORIES } from './data/procurementCategories';
import { PROCUREMENT_ITEMS, ProcurementItem } from './data/procurementItems';

export interface ProcurementViewProps {
  items?: ProcurementItem[];
  onTogglePurchased?: (id: string, purchased: boolean) => void;
  onEditItem?: (item: ProcurementItem) => void;
}

export default function ProcurementView({
  items: itemsProp,
  onTogglePurchased,
  onEditItem
}: ProcurementViewProps = {}) {
  const [localItems, setLocalItems] = useState<ProcurementItem[]>(PROCUREMENT_ITEMS);
  const items = itemsProp || localItems;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'products' | 'tasks'>('all');
  const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'category' | 'name' | 'priceDesc' | 'priceAsc' | 'status'>('category');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const togglePurchased = (id: string) => {
    if (onTogglePurchased) {
      const target = items.find(i => i.id === id);
      if (target) {
        onTogglePurchased(id, !target.purchased);
        return;
      }
    }
    setLocalItems(prev => prev.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (selectedCategory !== 'ALL') {
        if (selectedCategory.includes('Εργασίες Έρευνας')) {
          if (!item.isTask) return false;
        } else {
          if (item.category !== selectedCategory) return false;
          // Mode filter (all / products / tasks) only applies within normal categories
          if (filterMode === 'tasks' && !item.isTask) return false;
          if (filterMode === 'products' && item.isTask) return false;
        }
      } else {
        // Mode filter (all / products / tasks)
        if (filterMode === 'tasks' && !item.isTask) return false;
        if (filterMode === 'products' && item.isTask) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q) ?? false;
        const matchModel = item.model?.toLowerCase().includes(q) ?? false;
        const matchNotes = item.notes.toLowerCase().includes(q);
        const matchDesc = item.taskDescription?.toLowerCase().includes(q) ?? false;
        const matchRoom = item.rooms.some(r => r.toLowerCase().includes(q));
        if (!matchName && !matchBrand && !matchModel && !matchNotes && !matchDesc && !matchRoom) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedCategory, searchQuery, filterMode]);

  const sortedAndFilteredItems = useMemo(() => {
    const list = [...filteredItems];
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'el'));
    } else if (sortBy === 'priceAsc') {
      list.sort((a, b) => (a.estimatedPriceEur ?? 0) - (b.estimatedPriceEur ?? 0));
    } else if (sortBy === 'priceDesc') {
      list.sort((a, b) => (b.estimatedPriceEur ?? 0) - (a.estimatedPriceEur ?? 0));
    } else if (sortBy === 'status') {
      list.sort((a, b) => Number(a.purchased) - Number(b.purchased));
    } else if (sortBy === 'category') {
      list.sort((a, b) => a.category.localeCompare(b.category, 'el'));
    }
    return list;
  }, [filteredItems, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    let totalEst = 0;
    let productsCount = 0;
    let tasksCount = 0;
    let purchasedCount = 0;

    items.forEach(item => {
      if (item.isTask) {
        tasksCount += 1;
      } else {
        productsCount += 1;
      }
      if (item.purchased) {
        purchasedCount += 1;
      }
      if (item.estimatedPriceEur) {
        totalEst += item.estimatedPriceEur * item.quantity;
      }
    });

    return {
      totalEst,
      productsCount,
      tasksCount,
      totalItems: items.length,
      purchasedCount,
      progressPercent: Math.round((purchasedCount / items.length) * 100)
    };
  }, [items]);

  return (
    <div className="flex-1 w-full flex flex-col gap-4 overflow-y-auto max-h-[85vh] pr-1">
      
      {/* Top Banner / Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        
        {/* Total Cost */}
        <div 
          onClick={() => { setSelectedCategory('ALL'); setFilterMode('all'); }}
          className="bg-gradient-to-br from-indigo-50 via-white to-indigo-50/50 dark:from-indigo-950/60 dark:to-neutral-900/90 border border-indigo-200 dark:border-indigo-800/40 hover:border-indigo-400 dark:hover:border-indigo-500/70 cursor-pointer rounded-xl p-3 shadow-sm dark:shadow-lg transition-all"
          title="Προβολή όλων"
        >
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Εκτιμώμενο Κόστος</span>
            <Euro size={16} />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            ~€{stats.totalEst.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            Υπολογισμός για {items.length} είδη & υλικά
          </div>
        </div>

        {/* Products */}
        <div 
          onClick={() => { setSelectedCategory('ALL'); setFilterMode('products'); }}
          className="bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 hover:border-cyan-400 dark:hover:border-cyan-500/70 cursor-pointer rounded-xl p-3 shadow-sm dark:shadow-lg transition-all"
          title="Φιλτράρισμα μόνο συγκεκριμένων συσκευών"
        >
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Συγκεκριμένα Προϊόντα</span>
            <ShoppingCart size={16} />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {stats.productsCount} <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">μοντέλα</span>
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            Με μάρκα, τιμή & επίσημο σύνδεσμο
          </div>
        </div>

        {/* Tasks for user */}
        <div 
          onClick={() => { setSelectedCategory('Εργασίες Έρευνας (Tasks to Find)'); setFilterMode('all'); }}
          className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer rounded-xl p-3 shadow-sm dark:shadow-lg transition-all"
          title="Φιλτράρισμα εργασιών έρευνας"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Εργασίες Έρευνας</span>
            <AlertCircle size={16} />
          </div>
          <div className="text-2xl font-black text-amber-900 dark:text-amber-200 tracking-tight">
            {stats.tasksCount} <span className="text-sm font-normal text-amber-600 dark:text-amber-400/70">προς επιλογή</span>
          </div>
          <div className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1">
            Απαιτούν επιλογή / συνεννόηση
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Πρόοδος Αγορών</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-300 tracking-tight">
            {stats.purchasedCount} / {stats.totalItems}
            <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400 ml-2">({stats.progressPercent}%)</span>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/80 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between flex-shrink-0 backdrop-blur-md shadow-sm">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Αναζήτηση συσκευής, μάρκας (Aqara, Shelly, UniFi), δωματίου..."
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Type Toggle: All vs Products vs Tasks */}
          <div className="flex items-center space-x-1 bg-neutral-100 dark:bg-neutral-950/80 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterMode === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Όλα ({items.length})
            </button>
            <button
              onClick={() => setFilterMode('products')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterMode === 'products' ? 'bg-cyan-600 text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Συσκευές ({stats.productsCount})
            </button>
            <button
              onClick={() => setFilterMode('tasks')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                filterMode === 'tasks' ? 'bg-amber-600 text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Εργασίες ({stats.tasksCount})
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-950/80 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
            <ArrowUpDown size={12} className="text-neutral-400 ml-1.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-0 text-xs text-neutral-700 dark:text-neutral-300 pr-2 py-0.5 focus:outline-none cursor-pointer"
            >
              <option value="category">Κατηγορία</option>
              <option value="name">Όνομα (Α-Ω)</option>
              <option value="priceDesc">Τιμή (Υψηλότερη)</option>
              <option value="priceAsc">Τιμή (Χαμηλότερη)</option>
              <option value="status">Κατάσταση (Εκκρεμή)</option>
            </select>
          </div>

          {/* View Mode Switcher: Grid vs List */}
          <div className="flex items-center space-x-1 bg-neutral-100 dark:bg-neutral-950/80 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setDisplayMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition-all ${
                displayMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="Προβολή Πλέγματος (Cards Grid)"
            >
              <LayoutGrid size={13} />
              <span className="hidden sm:inline">Πλέγμα</span>
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition-all ${
                displayMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
              title="Προβολή Λίστας / Πίνακα (Table View)"
            >
              <List size={13} />
              <span className="hidden sm:inline">Λίστα</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
            selectedCategory === 'ALL'
              ? 'bg-indigo-600 text-white dark:bg-indigo-600/30 dark:border-indigo-500 dark:text-indigo-200 border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
          }`}
        >
          <span>Όλες οι Κατηγορίες</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            selectedCategory === 'ALL'
              ? 'bg-white/20 dark:bg-indigo-500/30 text-white dark:text-indigo-200'
              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
          }`}>
            {items.length}
          </span>
        </button>
        {PROCUREMENT_CATEGORIES.map(cat => {
          const count = cat.includes('Εργασίες Έρευνας')
            ? items.filter(i => i.isTask).length
            : items.filter(i => i.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                if (cat.includes('Εργασίες Έρευνας')) {
                  setFilterMode('all');
                }
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white dark:bg-indigo-600/30 dark:border-indigo-500 dark:text-indigo-200 border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat
                  ? 'bg-white/20 dark:bg-indigo-500/30 text-white dark:text-indigo-200'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Items View: List or Grid */}
      {displayMode === 'list' ? (
        <div className="bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm backdrop-blur-md pb-1 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-950/60 text-neutral-500 dark:text-neutral-400 font-semibold select-none">
                  <th className="py-2.5 px-3 w-10 text-center">Κατάσταση</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Είδος / Συσκευή</th>
                  <th className="py-2.5 px-3 min-w-[140px] hidden md:table-cell">Κατηγορία</th>
                  <th className="py-2.5 px-3 min-w-[140px] hidden lg:table-cell">Χώροι</th>
                  <th className="py-2.5 px-3 text-center whitespace-nowrap">Ποσότητα</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap hidden sm:table-cell">Τιμή Μον.</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">Σύνολο</th>
                  <th className="py-2.5 px-3 text-center w-24">Ενέργειες</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {sortedAndFilteredItems.map(item => {
                  const totalPrice = item.estimatedPriceEur 
                    ? item.estimatedPriceEur * item.quantity 
                    : null;
                  const isExpanded = expandedItemId === item.id;

                  return (
                    <Fragment key={item.id}>
                      <tr 
                        className={`transition-colors duration-150 ${
                          item.purchased 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 text-neutral-500 dark:text-neutral-400' 
                            : 'hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30'
                        }`}
                      >
                        {/* Status Checkbox */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => togglePurchased(item.id)}
                            className={`p-1 rounded-full transition-colors inline-flex items-center justify-center ${
                              item.purchased
                                ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                                : 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-300'
                            }`}
                            title={item.purchased ? 'Ολοκληρώθηκε' : 'Εκκρεμεί'}
                          >
                            {item.purchased ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                          </button>
                        </td>

                        {/* Item Name & Details */}
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-semibold ${
                                item.purchased 
                                  ? 'line-through text-neutral-400 dark:text-neutral-500' 
                                  : 'text-neutral-900 dark:text-neutral-100'
                              }`}>
                                {item.name}
                              </span>
                              {item.isTask ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                                  ΕΡΓΑΣΙΑ
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50">
                                  ΥΛΙΚΟ
                                </span>
                              )}
                            </div>
                            {(item.brand || item.model) && (
                              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                                {item.brand && <span className="font-medium text-indigo-600 dark:text-indigo-400">{item.brand}</span>}
                                {item.brand && item.model && <span>•</span>}
                                {item.model && <span className="truncate max-w-[200px]">{item.model}</span>}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-3 hidden md:table-cell">
                          <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/50">
                            {item.category}
                          </span>
                        </td>

                        {/* Rooms */}
                        <td className="py-2.5 px-3 hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {item.rooms.slice(0, 2).map(r => (
                              <span key={r} className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400">
                                {r}
                              </span>
                            ))}
                            {item.rooms.length > 2 && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800/80 text-neutral-500" title={item.rooms.slice(2).join(', ')}>
                                +{item.rooms.length - 2}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Quantity */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-medium text-neutral-700 dark:text-neutral-300">
                          {item.quantity} <span className="text-[10px] text-neutral-400">{item.unit}</span>
                        </td>

                        {/* Unit Price */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap hidden sm:table-cell text-neutral-600 dark:text-neutral-400 font-medium">
                          {item.estimatedPriceEur ? (
                            `€${item.estimatedPriceEur}`
                          ) : item.priceRange ? (
                            <span className="text-[10px] text-neutral-400">{item.priceRange}</span>
                          ) : (
                            <span className="text-[10px] text-amber-500 italic">-</span>
                          )}
                        </td>

                        {/* Total Price */}
                        <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold">
                          {totalPrice ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                              ~€{totalPrice}
                            </span>
                          ) : (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400/80 font-normal italic">
                              Εκκρεμεί
                            </span>
                          )}
                        </td>

                        {/* Actions: Link, Edit & Expand Toggle */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {onEditItem && (
                              <button
                                onClick={() => onEditItem(item)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                title="Επεξεργασία είδους"
                              >
                                <Pencil size={13} />
                              </button>
                            )}
                            {item.link ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                                title="Άνοιγμα εξωτερικού συνδέσμου"
                              >
                                <ExternalLink size={13} />
                              </a>
                            ) : null}
                            <button
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isExpanded
                                  ? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
                                  : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                              }`}
                              title={isExpanded ? 'Σύμπτυξη λεπτομερειών' : 'Προβολή λεπτομερειών & οδηγιών'}
                            >
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable row for notes & tasks */}
                      {isExpanded && (
                        <tr className="bg-neutral-50/60 dark:bg-neutral-950/40 border-b border-neutral-100 dark:border-neutral-800/60">
                          <td colSpan={8} className="p-3 pl-12 text-xs">
                            <div className="space-y-2 max-w-4xl">
                              {item.isTask && item.taskDescription && (
                                <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-lg p-2.5 text-amber-900 dark:text-amber-200">
                                  <div className="font-semibold text-amber-800 dark:text-amber-300 mb-0.5 flex items-center gap-1">
                                    <HelpCircle size={12} />
                                    Οδηγίες Έρευνας & Επιλογής:
                                  </div>
                                  <div className="leading-relaxed">{item.taskDescription}</div>
                                </div>
                              )}
                              
                              <div className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                                <span className="font-semibold text-neutral-700 dark:text-neutral-200">Τεχνική Σημείωση: </span>
                                {item.notes}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                                <div>
                                  <span className="font-semibold text-neutral-600 dark:text-neutral-300">Όλοι οι Χώροι: </span>
                                  {item.rooms.join(', ')}
                                </div>
                                {item.priceRange && (
                                  <div>
                                    <span className="font-semibold text-neutral-600 dark:text-neutral-300">Εύρος Τιμής: </span>
                                    {item.priceRange}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table summary footer */}
          <div className="px-4 py-2.5 bg-neutral-50/90 dark:bg-neutral-950/80 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <div className="flex items-center gap-3">
              <span>Εμφάνιση <strong>{sortedAndFilteredItems.length}</strong> ειδών</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                <strong>{sortedAndFilteredItems.filter(i => i.purchased).length}</strong> ολοκληρωμένα
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Συνολική Εκτίμηση Φίλτρου:</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ~€{sortedAndFilteredItems.reduce((acc, i) => acc + (i.estimatedPriceEur ? i.estimatedPriceEur * i.quantity : 0), 0).toLocaleString()}
              </span>
            </div>
          </div>

          {sortedAndFilteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-neutral-400 dark:text-neutral-500">
              <Layers size={36} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">Δεν βρέθηκαν συσκευές ή εργασίες με αυτά τα κριτήρια.</p>
            </div>
          )}
        </div>
      ) : (
        /* Items Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-6">
          <AnimatePresence>
            {sortedAndFilteredItems.map(item => {
              const totalPrice = item.estimatedPriceEur 
                ? item.estimatedPriceEur * item.quantity 
                : null;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-xl border p-4 backdrop-blur-md flex flex-col justify-between transition-all duration-200 ${
                    item.purchased
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 opacity-80'
                      : item.isTask
                      ? 'bg-white dark:bg-neutral-900/70 border-amber-200 dark:border-amber-800/40 hover:border-amber-400 dark:hover:border-amber-600/60 shadow-sm'
                      : 'bg-white dark:bg-neutral-900/70 border-neutral-200 dark:border-neutral-800 hover:border-indigo-400 dark:hover:border-indigo-600/60 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Card Header: Category & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center flex-wrap gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/50">
                          {item.category}
                        </span>
                        {item.isTask ? (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 flex items-center gap-1">
                            <AlertCircle size={10} />
                            ΕΡΓΑΣΙΑ ΕΡΕΥΝΑΣ
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700/50 flex items-center gap-1">
                            <Check size={10} />
                            ΕΞΟΠΛΙΣΜΟΣ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {onEditItem && (
                          <button
                            onClick={() => onEditItem(item)}
                            className="p-1 rounded-md text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Επεξεργασία είδους"
                          >
                            <Pencil size={12} />
                          </button>
                        )}
                        {/* Purchased Toggle */}
                        <button
                          onClick={() => togglePurchased(item.id)}
                          className={`text-xs flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-colors ${
                            item.purchased
                              ? 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                              : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300'
                          }`}
                          title={item.purchased ? 'Αγοράστηκε' : 'Εκκρεμεί'}
                        >
                          {item.purchased ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                          <span className="text-[10px] font-medium hidden sm:inline">
                            {item.purchased ? 'Αγοράστηκε' : 'Εκκρεμεί'}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Title & Brand */}
                    <h3 className={`text-sm font-bold leading-snug mb-1 ${
                      item.purchased ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-neutral-100'
                    }`}>
                      {item.name}
                    </h3>

                    {item.brand && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-semibold mb-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/40 text-[11px]">
                          Brand: {item.brand}
                        </span>
                        {item.model && (
                          <span className="text-neutral-500 dark:text-neutral-400 text-[11px] font-normal truncate max-w-[200px]">
                            {item.model}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Task Description callout if isTask */}
                    {item.isTask && item.taskDescription && (
                      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-lg p-2.5 my-2.5 text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                        <div className="font-semibold text-amber-800 dark:text-amber-300 mb-0.5 flex items-center gap-1">
                          <HelpCircle size={12} />
                          Τι απαιτείται να επιλέξεις / ερευνήσεις:
                        </div>
                        {item.taskDescription}
                      </div>
                    )}

                    {/* Technical Notes */}
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-3">
                      {item.notes}
                    </p>

                    {/* Related Rooms */}
                    {item.rooms.length > 0 && (
                      <div className="mb-3">
                        <div className="text-[10px] uppercase font-bold text-neutral-500 dark:text-neutral-500 tracking-wider mb-1">
                          Χώροι Εγκατάστασης:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.rooms.map(room => (
                            <span
                              key={room}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/40"
                            >
                              {room}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Pricing & Action */}
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2 mt-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                          {item.quantity} {item.unit}
                        </span>
                        {item.priceRange && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                            ({item.priceRange})
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {totalPrice ? (
                          <>~€{totalPrice} <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-normal">σύνολο</span></>
                        ) : (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Εκκρεμεί τιμολόγηση</span>
                        )}
                      </div>
                    </div>

                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-200 dark:border-indigo-500/40 hover:border-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white dark:hover:text-white text-xs font-semibold transition-all duration-200"
                      >
                        <span>Προβολή</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-[11px] text-neutral-400 dark:text-neutral-500 italic">
                        Χωρίς link
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {sortedAndFilteredItems.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-neutral-400 dark:text-neutral-500">
              <Layers size={36} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">Δεν βρέθηκαν συσκευές ή εργασίες με αυτά τα κριτήρια.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
