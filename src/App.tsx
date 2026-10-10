import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, LayoutDashboard, CheckCircle2, Circle, Workflow, Grid } from 'lucide-react';
import { PROVISIONS, Provision } from './data/provisions';
import { ROOMS } from './data/rooms';
import { CATEGORIES as TYPES } from './data/categories';
import Flow from './Flow';

export default function App() {
  const [provisions, setProvisions] = useState<Provision[]>(PROVISIONS);
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set(ROOMS));
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set(TYPES));
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'flow'>('grid');

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

  const toggleProvision = (id: string) => {
    setProvisions(provisions.map(p => p.id === id ? { ...p, completed: !p.completed } : p));
  };

  const filteredProvisions = provisions.filter(p => selectedRooms.has(p.room) && selectedTypes.has(p.type));

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-2 md:p-4 overflow-hidden flex flex-col">
      <div className="max-w-[1600px] w-full mx-auto flex flex-col flex-1 gap-4">
        
        {/* Header */}
        <header className="flex justify-between items-center pb-2 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20"
            >
              <LayoutDashboard size={20} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                Pronies HQ
              </h1>
              <p className="text-neutral-400 text-xs tracking-wide">Έξυπνο Σύστημα Διαχείρισης</p>
            </div>
          </div>

          <div className="flex items-center space-x-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <button 
              onClick={() => setViewMode('flow')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === 'flow' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              <Workflow size={14} />
              <span>Διάγραμμα</span>
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-neutral-400 hover:text-neutral-200'}`}
            >
              <Grid size={14} />
              <span>Λίστα</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full">
            
          {/* Left Panel: Filters */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Rooms */}
            <div className="bg-neutral-900/50 backdrop-blur-xl p-3 rounded-xl border border-neutral-800 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-indigo-300">Δωμάτια</h2>
                <div className="space-x-2 text-[10px] font-medium text-neutral-400">
                  <button onClick={() => setSelectedRooms(new Set(ROOMS))} className="hover:text-indigo-300 transition-colors">Όλα</button>
                  <button onClick={() => setSelectedRooms(new Set())} className="hover:text-indigo-300 transition-colors">Κανένα</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ROOMS.map(room => (
                  <button
                    key={room}
                    onMouseEnter={() => setHoveredRoom(room)}
                    onMouseLeave={() => setHoveredRoom(null)}
                    onClick={() => toggleRoom(room)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      selectedRooms.has(room) 
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200' 
                        : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    {room}
                  </button>
                ))}
              </div>
            </div>

            {/* Types */}
            <div className="bg-neutral-900/50 backdrop-blur-xl p-3 rounded-xl border border-neutral-800 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-bold text-cyan-300">Κατηγορίες</h2>
                <div className="space-x-2 text-[10px] font-medium text-neutral-400">
                  <button onClick={() => setSelectedTypes(new Set(TYPES))} className="hover:text-cyan-300 transition-colors">Όλες</button>
                  <button onClick={() => setSelectedTypes(new Set())} className="hover:text-cyan-300 transition-colors">Καμία</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map(type => (
                  <button
                    key={type}
                    onMouseEnter={() => setHoveredType(type)}
                    onMouseLeave={() => setHoveredType(null)}
                    onClick={() => toggleType(type)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${
                      selectedTypes.has(type) 
                        ? 'bg-cyan-600/20 border-cyan-500 text-cyan-200' 
                        : 'bg-neutral-800/50 border-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Interactive Grid or Flow */}
          <div className="lg:col-span-9 bg-neutral-900/30 border border-neutral-800 rounded-2xl p-4 relative overflow-hidden flex flex-col h-[85vh]">
            
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <h2 className="text-lg font-bold text-neutral-200">
                {viewMode === 'grid' ? 'Λίστα Παροχών' : 'Διάγραμμα Παροχών'}
              </h2>
              <div className="bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold">
                {filteredProvisions.length} Ενεργές
              </div>
            </div>

            {viewMode === 'flow' ? (
              <div className="flex-1 w-full h-full relative -m-4 mt-0 border-t border-neutral-800">
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
                          onClick={() => toggleProvision(provision.id)}
                          className={`cursor-pointer rounded-xl p-3 border backdrop-blur-md transition-all duration-300 ${
                            provision.completed 
                              ? 'bg-emerald-950/20 border-emerald-900/50' 
                              : 'bg-neutral-800/40 border-neutral-700 hover:border-indigo-500/50 hover:bg-neutral-800/80 shadow-sm'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1.5 flex-1 pr-2">
                              <div className="flex items-center flex-wrap gap-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                                  {provision.room}
                                </span>
                                {provision.wall && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                                    {provision.wall}
                                  </span>
                                )}
                              </div>
                              <h3 className={`text-sm font-bold leading-tight ${provision.completed ? 'text-neutral-500 line-through decoration-emerald-900' : 'text-neutral-100'}`}>
                                {provision.name}
                              </h3>
                              <div className="flex items-center space-x-1 mt-1">
                                <span className="text-[10px] font-medium text-cyan-400 bg-cyan-950/30 px-1.5 py-0.5 rounded border border-cyan-900/50">
                                  {provision.type}
                                </span>
                              </div>
                            </div>

                            <button className={`mt-0.5 flex-shrink-0 ${provision.completed ? 'text-emerald-500' : 'text-neutral-600 hover:text-indigo-400'}`}>
                              {provision.completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                            </button>
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
                    className="flex flex-col items-center justify-center h-40 text-neutral-500"
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
      </div>
    </div>
  );
}
