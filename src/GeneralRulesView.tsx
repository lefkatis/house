import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Zap, 
  Info 
} from 'lucide-react';
import { GENERAL_RULES } from './data/generalRules';

export default function GeneralRulesView() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', '🔌 Πρίζες & Διακόπτες', '📡 Smart Home & Δίκτυο', '🔒 Ασφάλεια', '🚰 Υδραυλικά & HVAC'] as const;

  const filteredRules = selectedCategory === 'ALL'
    ? GENERAL_RULES
    : GENERAL_RULES.filter(r => r.category === selectedCategory);

  return (
    <div className="flex-1 w-full flex flex-col gap-4 overflow-y-auto max-h-[85vh] pr-1">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-indigo-950/40 to-neutral-900 border border-indigo-900/40 rounded-2xl p-4 shadow-xl flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-950 border border-indigo-800/60 text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-2">
              <Info size={12} />
              Καθολικοί Κανόνες Σπιτιού
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Γενικές Προδιαγραφές για Όλες τις Πρίζες & Διακόπτες
            </h2>
            <p className="text-xs text-neutral-300 mt-1 max-w-3xl leading-relaxed">
              Αυτοί οι κανόνες εφαρμόζονται <strong className="text-white">οριζόντια σε κάθε δωμάτιο</strong> και πρέπει να δοθούν στον ηλεκτρολόγο, μηχανολόγο και εργολάβο ως δεσμευτικές τεχνικές οδηγίες.
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end justify-center bg-indigo-950/40 border border-indigo-800/30 rounded-xl p-3 text-right">
            <span className="text-2xl font-black text-indigo-300">{GENERAL_RULES.length}</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">Κανόνες Μελέτης</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-shrink-0 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
              selectedCategory === cat
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            {cat === 'ALL' ? 'Όλοι οι Κανόνες' : cat}
          </button>
        ))}
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-6">
        <AnimatePresence>
          {filteredRules.map(rule => (
            <motion.div
              key={rule.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4 backdrop-blur-md flex flex-col justify-between hover:border-indigo-600/50 shadow-md transition-all duration-200"
            >
              <div>
                {/* Header: Category & Scope */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700/50">
                    {rule.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                    {rule.scope}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-black text-neutral-100 mb-2 leading-snug">
                  {rule.title}
                </h3>

                {/* Main Rule Summary */}
                <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                  {rule.rule}
                </p>

                {/* Critical Requirement Callout */}
                <div className="bg-indigo-950/40 border border-indigo-800/40 rounded-lg p-3 my-2.5 text-xs text-indigo-200 leading-relaxed">
                  <div className="font-bold text-indigo-300 mb-1 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                    <Zap size={13} className="text-amber-400" />
                    Κρίσιμη Τεχνική Προδιαγραφή:
                  </div>
                  <div className="whitespace-pre-line text-neutral-200 font-medium">
                    {rule.criticalRequirement}
                  </div>
                </div>

                {/* Notes */}
                <p className="text-xs text-neutral-400 leading-relaxed mt-2 italic">
                  💡 {rule.notes}
                </p>
              </div>

              {/* Card Footer Badge */}
              <div className="pt-3 mt-3 border-t border-neutral-800/70 flex items-center justify-between text-[11px] text-neutral-500">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle size={12} />
                  Υποχρεωτικό για Ηλεκτρολόγο
                </span>
                <span className="font-mono text-[10px] text-neutral-600 uppercase">
                  HOUSE 2021 SPEC
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
