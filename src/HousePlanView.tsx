import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Upload, 
  Trash2, 
  Filter, 
  AlertTriangle 
} from 'lucide-react';
import { PROVISIONS } from './data/provisions';
import { CATEGORIES } from './data/categories';
import { IECSymbol } from './components/IECSymbol';

type PlacedPin = {
  id: string;
  provisionId: string;
  xPercent: number; // 0 to 100%
  yPercent: number; // 0 to 100%
};

export default function HousePlanView() {
  const [activeTab, setActiveTab] = useState<'schematic' | 'custom'>('schematic');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showOnlyPending, setShowOnlyPending] = useState<boolean>(false);
  
  // Custom blueprint upload & pins state
  const [customBlueprintUrl, setCustomBlueprintUrl] = useState<string | null>(() => {
    return localStorage.getItem('pronies_custom_blueprint') || null;
  });
  const [pins, setPins] = useState<PlacedPin[]>(() => {
    try {
      const saved = localStorage.getItem('pronies_blueprint_pins');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedProvisionToPlace, setSelectedProvisionToPlace] = useState<string | null>(null);
  const blueprintContainerRef = useRef<HTMLDivElement>(null);

  // Filter provisions
  const filteredProvisions = useMemo(() => {
    return PROVISIONS.filter(p => {
      if (selectedRoom && p.room !== selectedRoom) return false;
      if (selectedCategory !== 'ALL' && p.type !== selectedCategory) return false;
      if (showOnlyPending && !p.pendingReview) return false;
      return true;
    });
  }, [selectedRoom, selectedCategory, showOnlyPending]);

  // Handle custom blueprint file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCustomBlueprintUrl(result);
        localStorage.setItem('pronies_custom_blueprint', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Click on custom blueprint to place pin
  const handleBlueprintClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedProvisionToPlace || !blueprintContainerRef.current) return;
    const rect = blueprintContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newPin: PlacedPin = {
      id: `pin_${Date.now()}`,
      provisionId: selectedProvisionToPlace,
      xPercent: Math.max(1, Math.min(99, x)),
      yPercent: Math.max(1, Math.min(99, y))
    };

    const updated = [...pins, newPin];
    setPins(updated);
    localStorage.setItem('pronies_blueprint_pins', JSON.stringify(updated));
    setSelectedProvisionToPlace(null);
  };

  const removePin = (pinId: string) => {
    const updated = pins.filter(p => p.id !== pinId);
    setPins(updated);
    localStorage.setItem('pronies_blueprint_pins', JSON.stringify(updated));
  };

  const clearAllPins = () => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να καθαρίσετε όλες τις καρφίτσες από την κάτοψη;')) {
      setPins([]);
      localStorage.removeItem('pronies_blueprint_pins');
    }
  };

  // Rooms layout geometry for the interactive architectural SVG schematic
  const roomsLayout = [
    // Top Row: Outdoor / Parking / Veranda
    { id: '🚗 Parking', name: '🚗 Parking', x: 20, y: 20, w: 220, h: 140, color: 'emerald' },
    { id: '🪑 Βεράντα / BBQ', name: '🪑 Βεράντα / BBQ', x: 260, y: 20, w: 320, h: 140, color: 'amber' },
    { id: '🌳 Κήπος / Πισίνα', name: '🌳 Κήπος / Πισίνα', x: 600, y: 20, w: 380, h: 140, color: 'teal' },

    // Middle Row Left & Center: Living / Kitchen / Entry / Office
    { id: '🚪 Χώρος Εισόδου', name: '🚪 Χώρος Εισόδου', x: 20, y: 180, w: 120, h: 130, color: 'indigo' },
    { id: '🛋️ Σαλόνι / Τραπεζαρία', name: '🛋️ Σαλόνι / Τραπεζαρία', x: 160, y: 180, w: 420, h: 220, color: 'indigo' },
    { id: '🍳 Κουζίνα', name: '🍳 Κουζίνα', x: 600, y: 180, w: 260, h: 220, color: 'cyan' },
    { id: '🥫 Pantry', name: '🥫 Pantry', x: 880, y: 180, w: 100, h: 100, color: 'cyan' },
    { id: '🧺 Πλυσταριό', name: '🧺 Πλυσταριό', x: 880, y: 300, w: 100, h: 100, color: 'purple' },

    // Central Corridor & Office
    { id: '🖥️ Γραφείο', name: '🖥️ Γραφείο', x: 20, y: 330, w: 120, h: 170, color: 'blue' },
    { id: '🛤️ Διάδρομος', name: '🛤️ Διάδρομος', x: 160, y: 420, w: 420, h: 80, color: 'slate' },
    { id: '🚽 WC Ξένων', name: '🚽 WC Ξένων', x: 600, y: 420, w: 120, h: 80, color: 'rose' },
    { id: '⚙️ Μηχανοστάσιο', name: '⚙️ Μηχανοστάσιο', x: 740, y: 420, w: 240, h: 80, color: 'orange' },

    // Bottom Row: Bedrooms & Bathrooms
    { id: '🛏️ Bedroom 1', name: '🛏️ Bedroom 1', x: 20, y: 520, w: 200, h: 180, color: 'violet' },
    { id: '🛏️ Bedroom 2', name: '🛏️ Bedroom 2', x: 240, y: 520, w: 200, h: 180, color: 'violet' },
    { id: '🚽 WC - Main', name: '🚽 WC - Main', x: 460, y: 520, w: 120, h: 180, color: 'pink' },
    { id: '🛏️ Master Bedroom', name: '🛏️ Master Bedroom', x: 600, y: 520, w: 260, h: 180, color: 'indigo' },
    { id: '🚽 Ensuite Bathroom', name: '🚽 Ensuite', x: 880, y: 520, w: 100, h: 180, color: 'pink' },

    // Auxiliary House (Detached)
    { id: '🏠 Βοηθητικό Σπίτι', name: '🏠 Βοηθητικό Σπίτι', x: 20, y: 720, w: 960, h: 90, color: 'sky' }
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-4 overflow-y-auto max-h-[85vh] pr-1">
      
      {/* Top Controls Banner */}
      <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm backdrop-blur-md flex flex-col md:flex-row gap-4 items-start md:items-center justify-between flex-shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <Home size={12} />
            Αρχιτεκτονική Κάτοψη & Σήμανση IEC 60617
          </div>
          <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
            Κάτοψη Σπιτιού & Χωροθέτηση Παροχών
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Επιλέξτε δωμάτιο για προβολή των παροχών του με τυποποιημένα ηλεκτρολογικά σύμβολα <strong>IEC 60617</strong> ή ανεβάστε την αρχιτεκτονική σας κάτοψη για custom καρφίτσωμα.
          </p>
        </div>

        {/* View Mode Toggle: Interactive SVG vs Custom Blueprint */}
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-950 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <button
            onClick={() => setActiveTab('schematic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'schematic'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Διαδραστική Κάτοψη
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Upload size={13} />
            <span>Ανέβασμα Σχεδίου</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-neutral-100/80 dark:bg-neutral-900/40 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs flex-shrink-0">
        <div className="flex items-center gap-1 text-neutral-500 font-semibold text-[11px] uppercase mr-1">
          <Filter size={13} />
          Φίλτρα:
        </div>

        {/* Category Pills */}
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-2.5 py-1 rounded-md font-medium transition-colors border ${
            selectedCategory === 'ALL'
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
          }`}
        >
          Όλες
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors border ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
            }`}
          >
            {cat}
          </button>
        ))}

        {/* TBD Filter */}
        <button
          onClick={() => setShowOnlyPending(!showOnlyPending)}
          className={`ml-auto px-2.5 py-1 rounded-md font-bold transition-colors border flex items-center gap-1.5 ${
            showOnlyPending
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-white dark:bg-neutral-900 border-amber-700/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <AlertTriangle size={12} />
          <span>Μόνο Εκκρεμή (TBD)</span>
        </button>
      </div>

      {/* Content Area */}
      {activeTab === 'schematic' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          
          {/* Left/Center Column: Interactive SVG Floor Plan */}
          <div className="lg:col-span-8 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Αρχιτεκτονικό Σχεδιάγραμμα Χώρων (HOUSE 2021)
              </span>
              <span className="text-[11px] text-neutral-400 italic">
                Κάντε κλικ σε οποιοδήποτε δωμάτιο για προβολή των παροχών
              </span>
            </div>

            <div className="w-full flex-1 overflow-auto bg-neutral-50 dark:bg-neutral-950/80 rounded-xl p-2 border border-neutral-200 dark:border-neutral-800/80">
              <svg 
                viewBox="0 0 1000 830" 
                className="w-full h-auto max-h-[620px] select-none"
              >
                {/* Background grid markings */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeOpacity="0.04" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="1000" height="830" fill="url(#grid)" />

                {/* Rooms */}
                {roomsLayout.map(room => {
                  const isSelected = selectedRoom === room.id;
                  const roomProvisions = PROVISIONS.filter(p => p.room === room.id);
                  const pendingCount = roomProvisions.filter(p => p.pendingReview).length;
                  const count = roomProvisions.length;

                  return (
                    <g 
                      key={room.id}
                      onClick={() => setSelectedRoom(isSelected ? null : room.id)}
                      className="cursor-pointer group transition-all"
                    >
                      {/* Room Area */}
                      <rect
                        x={room.x}
                        y={room.y}
                        width={room.w}
                        height={room.h}
                        rx="8"
                        className={`transition-all duration-200 ${
                          isSelected
                            ? 'fill-indigo-600/20 stroke-indigo-500 stroke-[3]'
                            : 'fill-white dark:fill-neutral-900/80 stroke-neutral-300 dark:stroke-neutral-700/80 hover:stroke-indigo-400 hover:fill-indigo-500/10 stroke-[1.5]'
                        }`}
                      />

                      {/* Room Label */}
                      <text
                        x={room.x + 12}
                        y={room.y + 26}
                        className={`text-xs font-bold transition-colors ${
                          isSelected 
                            ? 'fill-indigo-600 dark:fill-indigo-300' 
                            : 'fill-neutral-900 dark:fill-neutral-100 group-hover:fill-indigo-500'
                        }`}
                        fontSize="13"
                        fontWeight="700"
                      >
                        {room.name}
                      </text>

                      {/* Provisions Count Badge */}
                      <g transform={`translate(${room.x + 12}, ${room.y + 36})`}>
                        <rect 
                          width="52" 
                          height="18" 
                          rx="4" 
                          className="fill-neutral-200 dark:fill-neutral-800 stroke-neutral-300 dark:stroke-neutral-700 stroke-[0.8]"
                        />
                        <text 
                          x="26" 
                          y="13" 
                          textAnchor="middle" 
                          fontSize="10" 
                          fontWeight="600"
                          className="fill-neutral-700 dark:fill-neutral-300"
                        >
                          {count} παροχές
                        </text>
                      </g>

                      {/* TBD / Pending Badge if applicable */}
                      {pendingCount > 0 && (
                        <g transform={`translate(${room.x + room.w - 56}, ${room.y + 12})`}>
                          <rect 
                            width="46" 
                            height="18" 
                            rx="4" 
                            className="fill-amber-500/20 stroke-amber-500 stroke-[1]"
                          />
                          <text 
                            x="23" 
                            y="13" 
                            textAnchor="middle" 
                            fontSize="9" 
                            fontWeight="800"
                            className="fill-amber-600 dark:fill-amber-300"
                          >
                            ⚠️ {pendingCount} TBD
                          </text>
                        </g>
                      )}

                      {/* Architectural wall details for specific rooms */}
                      {room.id === '🍳 Κουζίνα' && (
                        <>
                          {/* Island graphic in kitchen */}
                          <rect 
                            x={room.x + 40} 
                            y={room.y + 80} 
                            width="140" 
                            height="55" 
                            rx="4" 
                            className="fill-cyan-500/10 stroke-cyan-500/60 stroke-dasharray-[3,2] stroke-[1.5]"
                          />
                          <text 
                            x={room.x + 110} 
                            y={room.y + 112} 
                            textAnchor="middle" 
                            fontSize="10" 
                            fontWeight="bold"
                            className="fill-cyan-600 dark:fill-cyan-300"
                          >
                            Νησίδα (Πάγκος)
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Right Column: Selected Room / Filtered Provisions Drawer */}
          <div className="lg:col-span-4 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm flex flex-col max-h-[700px] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-3 flex-shrink-0">
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100">
                  {selectedRoom ? selectedRoom : 'Όλες οι Παροχές'}
                </h3>
                <span className="text-[11px] text-neutral-500">
                  {filteredProvisions.length} ενεργά στοιχεία
                </span>
              </div>
              {selectedRoom && (
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                >
                  Προβολή Όλων
                </button>
              )}
            </div>

            {/* List of provisions with IEC 60617 Symbols */}
            <div className="overflow-y-auto flex-1 space-y-2.5 pr-1">
              <AnimatePresence>
                {filteredProvisions.map(p => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3 rounded-xl border transition-all ${
                      p.pendingReview
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60'
                        : 'bg-neutral-50/80 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/70 hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* IEC 60617 Symbol */}
                      <IECSymbol provisionName={p.name} category={p.type} size={24} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                            {p.room}
                          </span>
                          {p.wall && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                              {p.wall}
                            </span>
                          )}
                          {p.pendingReview && (
                            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center gap-1">
                              <AlertTriangle size={9} />
                              TBD
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                          {p.name}
                        </h4>

                        {p.details && (
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                            {p.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredProvisions.length === 0 && (
                <div className="text-center py-10 text-neutral-400 text-xs">
                  Δεν βρέθηκαν παροχές με αυτά τα κριτήρια.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Custom Blueprint Upload & Pin Marking Mode */
        <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          
          {/* Upload & Pin Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors">
                <Upload size={14} />
                <span>Επιλογή Αρχείου Κάτοψης (PNG/JPG/SVG)</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>

              {pins.length > 0 && (
                <button
                  onClick={clearAllPins}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold transition-colors"
                >
                  <Trash2 size={13} />
                  <span>Καθαρισμός ({pins.length} καρφίτσες)</span>
                </button>
              )}
            </div>

            {/* Step instruction to place pins */}
            <div className="flex items-center gap-2">
              <select
                value={selectedProvisionToPlace || ''}
                onChange={(e) => setSelectedProvisionToPlace(e.target.value || null)}
                className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 dark:text-neutral-100 font-medium max-w-[280px]"
              >
                <option value="">-- Επιλέξτε παροχή για καρφίτσωμα --</option>
                {PROVISIONS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.room} - {p.name}
                  </option>
                ))}
              </select>
              {selectedProvisionToPlace && (
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold animate-pulse">
                  Κάντε κλικ στην κάτοψη!
                </span>
              )}
            </div>
          </div>

          {/* Blueprint Canvas Container */}
          <div 
            ref={blueprintContainerRef}
            onClick={handleBlueprintClick}
            className={`w-full min-h-[480px] max-h-[700px] overflow-auto bg-neutral-100 dark:bg-neutral-950 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 relative flex items-center justify-center select-none ${
              selectedProvisionToPlace ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            {customBlueprintUrl ? (
              <div className="relative inline-block max-w-full">
                <img 
                  src={customBlueprintUrl} 
                  alt="House Architectural Blueprint" 
                  className="max-w-full h-auto rounded-lg shadow-md pointer-events-none"
                />

                {/* Render Placed Pins with IEC Symbols */}
                {pins.map(pin => {
                  const provision = PROVISIONS.find(p => p.id === pin.provisionId);
                  if (!provision) return null;

                  return (
                    <div
                      key={pin.id}
                      style={{ 
                        left: `${pin.xPercent}%`, 
                        top: `${pin.yPercent}%` 
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePin(pin.id);
                      }}
                      title={`${provision.room}: ${provision.name} (Κλικ για διαγραφή)`}
                    >
                      <div className="p-1 rounded-full bg-indigo-600 text-white shadow-lg border-2 border-white dark:border-neutral-900 hover:scale-125 transition-transform flex items-center justify-center">
                        <IECSymbol 
                          provisionName={provision.name} 
                          category={provision.type} 
                          size={18} 
                          showTooltip={false} 
                        />
                      </div>
                      <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 whitespace-nowrap bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xl pointer-events-none">
                        {provision.room} - {provision.name} ✕
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 text-neutral-400">
                <Home size={48} className="mb-3 opacity-30" />
                <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Δεν έχει ανέβει ακόμη αρχείο κάτοψης
                </h4>
                <p className="text-xs text-neutral-500 max-w-md mb-4">
                  Ανεβάστε το αρχιτεκτονικό σας σχέδιο (PNG, JPG, ή SVG) για να μπορείτε να τοποθετείτε τα επίσημα ηλεκτρολογικά σύμβολα ακριβώς επάνω στους τοίχους.
                </p>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-colors">
                  <Upload size={14} />
                  <span>Ανέβασμα Εικόνας Κάτοψης</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
