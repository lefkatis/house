import { useState, useMemo } from 'react';
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
  Check
} from 'lucide-react';
import { PROCUREMENT_CATEGORIES } from './data/procurementCategories';
import { PROCUREMENT_ITEMS, ProcurementItem } from './data/procurementItems';

export default function ProcurementView() {
  const [items, setItems] = useState<ProcurementItem[]>(PROCUREMENT_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'products' | 'tasks'>('all');

  const togglePurchased = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ));
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Mode filter (all / products / tasks)
      if (filterMode === 'tasks' && !item.isTask) return false;
      if (filterMode === 'products' && item.isTask) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q) ?? false;
        const matchModel = item.model?.toLowerCase().includes(q) ?? false;
        const matchNotes = item.notes.toLowerCase().includes(q);
        const matchRoom = item.rooms.some(r => r.toLowerCase().includes(q));
        if (!matchName && !matchBrand && !matchModel && !matchNotes && !matchRoom) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedCategory, searchQuery, filterMode]);

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
        <div className="bg-gradient-to-br from-indigo-950/60 to-neutral-900/90 border border-indigo-800/40 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Εκτιμώμενο Κόστος</span>
            <Euro size={16} />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            ~€{stats.totalEst.toLocaleString()}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Υπολογισμός για {items.length} είδη & υλικά
          </div>
        </div>

        {/* Products */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Συγκεκριμένα Προϊόντα</span>
            <ShoppingCart size={16} />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {stats.productsCount} <span className="text-sm font-normal text-neutral-400">μοντέλα</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Με μάρκα, τιμή & επίσημο σύνδεσμο
          </div>
        </div>

        {/* Tasks for user */}
        <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Εργασίες Έρευνας</span>
            <AlertCircle size={16} />
          </div>
          <div className="text-2xl font-black text-amber-200 tracking-tight">
            {stats.tasksCount} <span className="text-sm font-normal text-amber-400/70">προς επιλογή</span>
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1">
            Απαιτούν επιλογή / συνεννόηση
          </div>
        </div>

        {/* Progress */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Πρόοδος Αγορών</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-2xl font-black text-emerald-300 tracking-tight">
            {stats.purchasedCount} / {stats.totalItems}
            <span className="text-xs font-normal text-neutral-400 ml-2">({stats.progressPercent}%)</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-3 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between flex-shrink-0 backdrop-blur-md">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Αναζήτηση συσκευής, μάρκας (Aqara, Shelly, UniFi), δωματίου..."
            className="w-full pl-9 pr-3 py-1.5 bg-neutral-950/80 border border-neutral-800 rounded-lg text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Type Toggle: All vs Products vs Tasks */}
        <div className="flex items-center space-x-1 bg-neutral-950/80 p-1 rounded-lg border border-neutral-800 self-start md:self-auto text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              filterMode === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Όλα ({items.length})
          </button>
          <button
            onClick={() => setFilterMode('products')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              filterMode === 'products' ? 'bg-cyan-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Συσκευές ({stats.productsCount})
          </button>
          <button
            onClick={() => setFilterMode('tasks')}
            className={`px-2.5 py-1 rounded font-medium transition-all ${
              filterMode === 'tasks' ? 'bg-amber-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Εργασίες ({stats.tasksCount})
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-shrink-0 text-xs">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
            selectedCategory === 'ALL'
              ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
          }`}
        >
          Όλες οι Κατηγορίες
        </button>
        {PROCUREMENT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
              selectedCategory === cat
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pb-6">
        <AnimatePresence>
          {filteredItems.map(item => {
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
                    ? 'bg-emerald-950/20 border-emerald-900/50 opacity-75'
                    : item.isTask
                    ? 'bg-neutral-900/70 border-amber-800/40 hover:border-amber-600/60 shadow-sm'
                    : 'bg-neutral-900/70 border-neutral-800 hover:border-indigo-600/60 shadow-sm'
                }`}
              >
                <div>
                  {/* Card Header: Category & Status */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center flex-wrap gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                        {item.category}
                      </span>
                      {item.isTask ? (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-700/50 flex items-center gap-1">
                          <AlertCircle size={10} />
                          ΕΡΓΑΣΙΑ ΕΡΕΥΝΑΣ
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-700/50 flex items-center gap-1">
                          <Check size={10} />
                          ΕΞΟΠΛΙΣΜΟΣ
                        </span>
                      )}
                    </div>

                    {/* Purchased Toggle */}
                    <button
                      onClick={() => togglePurchased(item.id)}
                      className={`text-xs flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-colors flex-shrink-0 ${
                        item.purchased
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                          : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                      title={item.purchased ? 'Αγοράστηκε' : 'Εκκρεμεί'}
                    >
                      {item.purchased ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      <span className="text-[10px] font-medium hidden sm:inline">
                        {item.purchased ? 'Αγοράστηκε' : 'Εκκρεμεί'}
                      </span>
                    </button>
                  </div>

                  {/* Title & Brand */}
                  <h3 className={`text-sm font-bold leading-snug mb-1 ${
                    item.purchased ? 'line-through text-neutral-400' : 'text-neutral-100'
                  }`}>
                    {item.name}
                  </h3>

                  {item.brand && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold mb-2">
                      <span className="px-1.5 py-0.5 rounded bg-indigo-950/50 border border-indigo-800/40 text-[11px]">
                        Brand: {item.brand}
                      </span>
                      {item.model && (
                        <span className="text-neutral-400 text-[11px] font-normal truncate max-w-[200px]">
                          {item.model}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Task Description callout if isTask */}
                  {item.isTask && item.taskDescription && (
                    <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-2.5 my-2.5 text-xs text-amber-200/90 leading-relaxed">
                      <div className="font-semibold text-amber-300 mb-0.5 flex items-center gap-1">
                        <HelpCircle size={12} />
                        Τι απαιτείται να επιλέξεις / ερευνήσεις:
                      </div>
                      {item.taskDescription}
                    </div>
                  )}

                  {/* Technical Notes */}
                  <p className="text-xs text-neutral-400 leading-relaxed mb-3">
                    {item.notes}
                  </p>

                  {/* Related Rooms */}
                  {item.rooms.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider mb-1">
                        Χώροι Εγκατάστασης:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.rooms.map(room => (
                          <span
                            key={room}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800/60 text-neutral-300 border border-neutral-700/40"
                          >
                            {room}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Pricing & Action */}
                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2 mt-2">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-bold text-neutral-400">
                        {item.quantity} {item.unit}
                      </span>
                      {item.priceRange && (
                        <span className="text-xs text-neutral-400 font-medium">
                          ({item.priceRange})
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-black text-emerald-400">
                      {totalPrice ? (
                        <>~€{totalPrice} <span className="text-[10px] text-neutral-400 font-normal">σύνολο</span></>
                      ) : (
                        <span className="text-xs text-amber-400 font-medium">Εκκρεμεί τιμολόγηση</span>
                      )}
                    </div>
                  </div>

                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 hover:border-indigo-500 text-indigo-300 hover:text-white text-xs font-semibold transition-all duration-200"
                    >
                      <span>Προβολή</span>
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span className="text-[11px] text-neutral-500 italic">
                      Χωρίς link
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-neutral-500">
            <Layers size={36} className="mb-2 opacity-30" />
            <p className="text-sm font-medium">Δεν βρέθηκαν συσκευές ή εργασίες με αυτά τα κριτήρια.</p>
          </div>
        )}
      </div>

    </div>
  );
}
