import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Home, 
  MapPin, 
  FileText, 
  Layers, 
  ExternalLink, 
  Download, 
  RefreshCw, 
  Filter, 
  AlertTriangle
} from 'lucide-react';
import { PROVISIONS, Provision } from './data/provisions';
import { CATEGORIES } from './data/categories';
import { IECSymbol } from './components/IECSymbol';
import { 
  BLUEPRINT_ROOMS, 
  DEFAULT_PROVISION_PINS, 
  DefaultProvisionPin 
} from './data/blueprintRoomMappings';

type PlanTab = 'ground' | 'site' | 'roof' | 'full_pdf';

const PINS_STORAGE_KEY = 'pronies_architectural_pins_v1';

export default function HousePlanView() {
  const [activeTab, setActiveTab] = useState<PlanTab>('ground');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showOnlyPending, setShowOnlyPending] = useState<boolean>(false);
  const [hoveredProvisionId, setHoveredProvisionId] = useState<string | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);

  // Placed pins state (initialized with default architectural mapped coordinates)
  const [pins, setPins] = useState<DefaultProvisionPin[]>(() => {
    try {
      const saved = localStorage.getItem(PINS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved pins', e);
    }
    return DEFAULT_PROVISION_PINS;
  });

  const [selectedProvisionToPlace, setSelectedProvisionToPlace] = useState<string | null>(null);
  const planContainerRef = useRef<HTMLDivElement>(null);

  // Save pins to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(PINS_STORAGE_KEY, JSON.stringify(pins));
    } catch (e) {
      console.error('Failed to save pins', e);
    }
  }, [pins]);

  // Reset pins to default
  const resetToDefaultPins = () => {
    if (confirm('Επαναφορά όλων των καρφιτσών στις προκαθορισμένες αρχιτεκτονικές θέσεις;')) {
      setPins(DEFAULT_PROVISION_PINS);
      localStorage.removeItem(PINS_STORAGE_KEY);
    }
  };

  // Filter provisions for the side list
  const filteredProvisions = useMemo(() => {
    return PROVISIONS.filter(p => {
      if (selectedRoom && p.room !== selectedRoom) return false;
      if (selectedCategory !== 'ALL' && p.type !== selectedCategory) return false;
      if (showOnlyPending && !p.pendingReview) return false;
      return true;
    });
  }, [selectedRoom, selectedCategory, showOnlyPending]);

  // Click on architectural blueprint to place / move pin
  const handleBlueprintClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedProvisionToPlace || !planContainerRef.current) return;
    const rect = planContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.round(Math.max(2, Math.min(98, x)) * 10) / 10;
    const clampedY = Math.round(Math.max(2, Math.min(98, y)) * 10) / 10;

    // Check if this provision already has a pin
    const existingIndex = pins.findIndex(p => p.provisionId === selectedProvisionToPlace);
    if (existingIndex >= 0) {
      const updated = [...pins];
      updated[existingIndex] = { provisionId: selectedProvisionToPlace, xPercent: clampedX, yPercent: clampedY };
      setPins(updated);
    } else {
      setPins([...pins, { provisionId: selectedProvisionToPlace, xPercent: clampedX, yPercent: clampedY }]);
    }

    setSelectedProvisionToPlace(null);
  };

  // Pin lookup
  const pinsMap = useMemo(() => {
    const map = new Map<string, DefaultProvisionPin>();
    pins.forEach(p => map.set(p.provisionId, p));
    return map;
  }, [pins]);

  // Visible pins filtered by room/category/pending
  const visiblePins = useMemo(() => {
    return filteredProvisions
      .map(provision => {
        const pin = pinsMap.get(provision.id);
        return pin ? { provision, pin } : null;
      })
      .filter((item): item is { provision: Provision; pin: DefaultProvisionPin } => item !== null);
  }, [filteredProvisions, pinsMap]);

  return (
    <div className="flex-1 w-full flex flex-col gap-3 overflow-y-auto max-h-[85vh] pr-1">
      
      {/* Top Banner: Drawing Selector & Controls */}
      <div className="bg-white/90 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 shadow-md backdrop-blur-md flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between flex-shrink-0">
        
        {/* Title & Metadata */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1">
            <Home size={12} />
            Αρχιτεκτονικά Σχέδια & Παροχές (HOUSE 2021)
          </div>
          <h2 className="text-base font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Αρχιτεκτονική Κάτοψη & Χαρτογράφηση Δωματίων</span>
            <span className="text-xs px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono font-normal">
              A1.2 • 1:100 @ A2
            </span>
          </h2>
        </div>

        {/* Plan Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('ground')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ground'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Home size={13} />
            <span>Κάτοψη Ισογείου (A1.2)</span>
          </button>

          <button
            onClick={() => setActiveTab('site')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'site'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers size={13} />
            <span>Χωροταξικό (A1.1)</span>
          </button>

          <button
            onClick={() => setActiveTab('roof')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'roof'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Οροφή (A1.3)</span>
          </button>

          <button
            onClick={() => setActiveTab('full_pdf')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'full_pdf'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <FileText size={13} />
            <span>Πλήρες PDF (11 Σελίδες)</span>
          </button>
        </div>

      </div>

      {/* FILTER & ROOM QUICK SELECT BAR */}
      <div className="bg-neutral-100/80 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2.5 flex flex-wrap items-center gap-2 text-xs flex-shrink-0">
        
        {/* Room selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
            <Filter size={12} />
            Δωμάτιο:
          </span>
          <button
            onClick={() => setSelectedRoom(null)}
            className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
              selectedRoom === null
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
            }`}
          >
            Όλα ({PROVISIONS.length})
          </button>
        </div>

        {/* Room Pills */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-0.5">
          {BLUEPRINT_ROOMS.map(room => {
            const isSelected = selectedRoom === room.id;
            const count = PROVISIONS.filter(p => p.room === room.id).length;
            return (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(isSelected ? null : room.id)}
                className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap border text-[11px] transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
                }`}
              >
                <span>{room.id}</span>
                <span className={`text-[9px] px-1 rounded-full ${isSelected ? 'bg-indigo-700 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-0.5 border-l border-neutral-300 dark:border-neutral-800 pl-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap border text-[11px] transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                : 'bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
            }`}
          >
            Όλες οι Κατηγορίες
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat)}
              className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap border text-[11px] transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-white dark:bg-neutral-950 border-neutral-300 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* TBD Filter */}
        <button
          onClick={() => setShowOnlyPending(!showOnlyPending)}
          className={`ml-auto px-2.5 py-1 rounded-lg font-bold border transition-all flex items-center gap-1 text-[11px] ${
            showOnlyPending
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white dark:bg-neutral-950 border-amber-600/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
          }`}
        >
          <AlertTriangle size={12} />
          <span>Μόνο Εκκρεμή (TBD)</span>
        </button>

      </div>

      {/* MAIN VIEW AREA */}
      {activeTab === 'full_pdf' ? (
        /* FULL ARCHITECTURAL PDF EMBED */
        <div className="flex-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col min-h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-3 flex-shrink-0">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText size={16} className="text-purple-500" />
                Αρχιτεκτονικά Σχέδια & Εμβαδογράμματα (Αναθεωρημένα 20.03.26)
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Πλήρες επίσημο αρχείο πολεοδομικής άδειας 11 σελίδων (Χωροταξικό, Κατόψεις, Όψεις, Τομές, Περιτειχίσματα).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="/house_plans.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all inline-flex items-center gap-1.5"
              >
                <span>Άνοιγμα σε Νέα Καρτέλα</span>
                <ExternalLink size={13} />
              </a>
              <a
                href="/house_plans.pdf"
                download="ΑΡΧΙΤΕΚΤΟΝΙΚΑ_ΣΧΕΔΙΑ_HOUSE_2021.pdf"
                className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Λήψη PDF</span>
              </a>
            </div>
          </div>

          <div className="flex-1 w-full bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden min-h-[550px]">
            <iframe
              src="/house_plans.pdf#toolbar=1&navpanes=1"
              className="w-full h-full min-h-[550px] border-0"
              title="Αρχιτεκτονικά Σχέδια PDF"
            />
          </div>
        </div>
      ) : activeTab === 'site' || activeTab === 'roof' ? (
        /* SITE OR ROOF PLAN PREVIEW */
        <div className="flex-1 bg-white dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xl flex flex-col items-center min-h-[550px] overflow-auto">
          <div className="w-full flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800 mb-3">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {activeTab === 'site' ? 'Χωροταξικό Σχέδιο Οικοπέδου (A1.1)' : 'Κάτοψη Οροφής & Ηλιακά (A1.3)'}
            </span>
            <a
              href={activeTab === 'site' ? '/plan_site.pdf' : '/plan_roof.pdf'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-400 text-xs font-semibold flex items-center gap-1"
            >
              <span>Άνοιγμα High-Res PDF</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex-1 flex items-center justify-center max-w-full overflow-auto">
            <img 
              src={activeTab === 'site' ? '/plan_site.png' : '/plan_roof.png'} 
              alt="Αρχιτεκτονικό Σχέδιο"
              className="max-w-full h-auto rounded-xl shadow-lg border border-neutral-300 dark:border-neutral-800"
            />
          </div>
        </div>
      ) : (
        /* INTERACTIVE GROUND FLOOR PLAN (A1.2) - MAIN FEATURE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-[600px]">
          
          {/* Central Architectural Blueprint Viewer */}
          <div className="lg:col-span-8 xl:col-span-9 bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 shadow-md flex flex-col relative overflow-hidden">
            
            {/* Viewer Header & Actions */}
            <div className="flex items-center justify-between mb-2 flex-shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Home size={14} className="text-indigo-500" />
                  Κάτοψη Ισογείου με Σήμανση Παροχών
                </span>
                <span className="text-[11px] text-neutral-500 font-normal">
                  ({visiblePins.length} ενεργές καρφίτσες στο σχέδιο)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Reset button */}
                <button
                  onClick={resetToDefaultPins}
                  className="px-2 py-1 rounded-md text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
                  title="Επαναφορά καρφιτσών στις εργοστασιακές θέσεις της μελέτης"
                >
                  <RefreshCw size={11} />
                  <span>Επαναφορά Θέσεων</span>
                </button>

                {/* Direct High-Res PDF */}
                <a
                  href="/plan_ground_floor.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:text-white text-neutral-700 dark:text-neutral-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>PDF Ισογείου</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            {/* Instruction Callout if placing pin */}
            {selectedProvisionToPlace && (
              <div className="bg-indigo-600/20 border border-indigo-500 rounded-xl p-2 mb-2 text-xs text-indigo-300 flex items-center justify-between animate-pulse">
                <span>
                  📍 Κάντε κλικ οπουδήποτε πάνω στην αρχιτεκτονική κάτοψη για να τοποθετήσετε την παροχή: <strong>{PROVISIONS.find(p => p.id === selectedProvisionToPlace)?.name}</strong>
                </span>
                <button 
                  onClick={() => setSelectedProvisionToPlace(null)}
                  className="text-xs font-bold underline ml-2"
                >
                  Ακύρωση
                </button>
              </div>
            )}

            {/* The Blueprint Canvas & Hotspot Overlay */}
            <div 
              ref={planContainerRef}
              onClick={handleBlueprintClick}
              className={`flex-1 relative overflow-auto rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-1 select-none ${
                selectedProvisionToPlace ? 'cursor-crosshair' : 'cursor-default'
              }`}
            >
              <div className="relative inline-block max-w-full">
                
                {/* The Real Architectural Blueprint Image */}
                <img 
                  src="/plan_ground_floor.png" 
                  alt="Αρχιτεκτονική Κάτοψη Ισογείου"
                  className="w-full h-auto max-h-[640px] block rounded-lg shadow-sm"
                />

                {/* SVG Overlay for Room Highlighting & Hotspots */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {BLUEPRINT_ROOMS.map(room => {
                    const isSelected = selectedRoom === room.id;
                    const isHovered = hoveredRoomId === room.id;

                    return (
                      <g key={room.id}>
                        {/* Room boundary highlight */}
                        {(isSelected || isHovered) && (
                          <rect
                            x={room.x}
                            y={room.y}
                            width={room.w}
                            height={room.h}
                            rx="1"
                            fill={room.color}
                            fillOpacity={isSelected ? 0.25 : 0.15}
                            stroke={room.color}
                            strokeWidth={isSelected ? '0.6' : '0.4'}
                            strokeDasharray={isSelected ? 'none' : '1,1'}
                            className="transition-all duration-200"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Room Clickable Hotspot Zones */}
                {BLUEPRINT_ROOMS.map(room => (
                  <div
                    key={`zone_${room.id}`}
                    onClick={(e) => {
                      if (!selectedProvisionToPlace) {
                        e.stopPropagation();
                        setSelectedRoom(selectedRoom === room.id ? null : room.id);
                      }
                    }}
                    onMouseEnter={() => setHoveredRoomId(room.id)}
                    onMouseLeave={() => setHoveredRoomId(null)}
                    style={{
                      left: `${room.x}%`,
                      top: `${room.y}%`,
                      width: `${room.w}%`,
                      height: `${room.h}%`
                    }}
                    className={`absolute z-10 cursor-pointer rounded transition-all ${
                      selectedRoom === room.id 
                        ? 'border-2 border-indigo-500 shadow-md ring-2 ring-indigo-500/30' 
                        : 'hover:border border-indigo-400/60 hover:bg-indigo-500/10'
                    }`}
                    title={`Κάντε κλικ για φιλτράρισμα παροχών: ${room.name}`}
                  />
                ))}

                {/* Pinned Provision Markers on the Blueprint */}
                {visiblePins.map(({ provision, pin }) => {
                  const isHovered = hoveredProvisionId === provision.id;

                  return (
                    <div
                      key={provision.id}
                      style={{
                        left: `${pin.xPercent}%`,
                        top: `${pin.yPercent}%`
                      }}
                      onMouseEnter={() => setHoveredProvisionId(provision.id)}
                      onMouseLeave={() => setHoveredProvisionId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRoom(provision.room);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer transition-transform duration-200 ${
                        isHovered ? 'scale-150 z-30' : 'hover:scale-125'
                      }`}
                    >
                      {/* Pin Circle with IEC 60617 Symbol */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 transition-all ${
                        provision.pendingReview
                          ? 'bg-amber-500 border-white text-neutral-900 ring-2 ring-amber-500/40 animate-pulse'
                          : isHovered
                          ? 'bg-indigo-600 border-white text-white ring-4 ring-indigo-500/50'
                          : 'bg-indigo-700/90 border-white text-white'
                      }`}>
                        <div className="w-3.5 h-3.5 flex items-center justify-center">
                          <IECSymbol provisionName={provision.name} category={provision.type} size={13} showTooltip={false} />
                        </div>
                      </div>

                      {/* Tooltip on Hover */}
                      <div className="absolute left-1/2 bottom-full mb-1.5 -translate-x-1/2 hidden group-hover:flex flex-col bg-neutral-900/95 border border-neutral-700 text-white rounded-lg p-2.5 shadow-2xl z-40 min-w-[200px] max-w-[260px] pointer-events-none backdrop-blur-md">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-300">
                            {provision.type}
                          </span>
                          {provision.pendingReview && (
                            <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-amber-900 text-amber-300">
                              TBD
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold leading-tight mb-1 text-white">
                          {provision.name}
                        </div>
                        <div className="text-[10px] text-neutral-300 leading-snug">
                          {provision.details || `Τοποθέτηση: ${provision.wall}`}
                        </div>
                        <div className="text-[9px] text-neutral-500 mt-1 font-mono">
                          Χώρος: {provision.room}
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Blueprint Legend Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
                  Παροχή / Εξοπλισμός (IEC 60617)
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Εκκρεμές προς επιλογή (TBD)
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <span className="w-2.5 h-2.5 rounded border border-indigo-400 bg-indigo-500/20 inline-block"></span>
                  Όριο Δωματίου
                </span>
              </div>
              <span className="italic">
                Κάντε κλικ σε οποιοδήποτε δωμάτιο για εστίαση στις παροχές του.
              </span>
            </div>

          </div>

          {/* Right Sidebar: Provisions List mapped to the selected room */}
          <div className="lg:col-span-4 xl:col-span-3 bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-3 shadow-md flex flex-col min-h-[500px]">
            
            {/* List Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
              <div>
                <h3 className="text-xs font-black text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-indigo-500" />
                  {selectedRoom ? selectedRoom : 'Όλες οι Παροχές'}
                </h3>
                <span className="text-[10px] text-neutral-500">
                  {filteredProvisions.length} στοιχεία {selectedRoom ? 'στον χώρο' : 'στην κατοικία'}
                </span>
              </div>

              {selectedRoom && (
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-[10px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-semibold text-neutral-600 dark:text-neutral-300 transition-colors"
                >
                  Καθαρισμός
                </button>
              )}
            </div>

            {/* Scrollable Provisions List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredProvisions.map(provision => {
                const hasPin = pinsMap.has(provision.id);
                const isHovered = hoveredProvisionId === provision.id;
                const isPlacing = selectedProvisionToPlace === provision.id;

                return (
                  <div
                    key={provision.id}
                    onMouseEnter={() => setHoveredProvisionId(provision.id)}
                    onMouseLeave={() => setHoveredProvisionId(null)}
                    className={`p-2.5 rounded-xl border transition-all text-xs ${
                      isHovered
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-400 shadow-sm'
                        : provision.pendingReview
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/40'
                        : 'bg-neutral-50/60 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800/80 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-2">
                        {/* IEC Symbol badge */}
                        <div className="w-5 h-5 rounded-md bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 p-0.5 flex-shrink-0">
                          <IECSymbol provisionName={provision.name} category={provision.type} size={15} showTooltip={false} />
                        </div>
                        <span className="font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                          {provision.name}
                        </span>
                      </div>

                      {/* Reposition / Pin button */}
                      <button
                        onClick={() => setSelectedProvisionToPlace(isPlacing ? null : provision.id)}
                        className={`p-1 rounded transition-colors text-[10px] flex-shrink-0 ${
                          isPlacing
                            ? 'bg-indigo-600 text-white'
                            : hasPin
                            ? 'text-neutral-400 hover:text-indigo-500'
                            : 'text-amber-500 hover:bg-amber-500/10'
                        }`}
                        title={hasPin ? 'Αλλαγή θέσης καρφίτσας στο σχέδιο' : 'Τοποθέτηση καρφίτσας στο σχέδιο'}
                      >
                        <MapPin size={12} className={hasPin ? 'fill-current' : ''} />
                      </button>
                    </div>

                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed mb-1.5">
                      {provision.details || `Τοποθέτηση: ${provision.wall}`}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-200/60 dark:border-neutral-800/60">
                      <span className="font-medium text-neutral-600 dark:text-neutral-400">
                        {provision.room}
                      </span>
                      {provision.pendingReview && (
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                          <AlertTriangle size={10} />
                          TBD
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredProvisions.length === 0 && (
                <div className="text-center py-10 text-neutral-400 text-xs">
                  Δεν βρέθηκαν παροχές για αυτό το δωμάτιο ή φίλτρο.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
