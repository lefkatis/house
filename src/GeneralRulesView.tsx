import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Zap, 
  Pencil
} from 'lucide-react';
import { GENERAL_RULES, GeneralRule } from './data/generalRules';

interface GeneralRulesViewProps {
  rules?: GeneralRule[];
  onEditRule?: (rule: GeneralRule) => void;
}

export default function GeneralRulesView({ rules: rulesProp, onEditRule }: GeneralRulesViewProps = {}) {
  const rules = rulesProp || GENERAL_RULES;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', '🔌 Πρίζες & Διακόπτες', '📡 Smart Home & Δίκτυο', '🔒 Ασφάλεια', '🚰 Υδραυλικά & HVAC', '🌿 Κήπος, Deck & Δάπεδα'] as const;

  const filteredRules = selectedCategory === 'ALL'
    ? rules
    : rules.filter(r => r.category === selectedCategory);

  return (
    <div className="flex-1 w-full flex flex-col gap-3 sm:gap-4 lg:overflow-y-auto lg:max-h-[85vh] pr-1">

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pb-1 flex-shrink-0 text-xs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors border ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white dark:bg-indigo-600/30 dark:border-indigo-500 dark:text-indigo-200 border-indigo-600 shadow-sm'
                : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
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
              className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 p-4 backdrop-blur-md flex flex-col justify-between hover:border-indigo-400 dark:hover:border-indigo-600/50 shadow-sm dark:shadow-md transition-all duration-200"
            >
              <div>
                {/* Header: Category, Scope & Edit */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/50">
                      {rule.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                      {rule.scope}
                    </span>
                  </div>
                  {onEditRule && (
                    <button
                      onClick={() => onEditRule(rule)}
                      className="p-1 rounded text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Επεξεργασία κανόνα"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 mb-2 leading-snug">
                  {rule.title}
                </h3>

                {/* Main Rule Summary */}
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-3">
                  {rule.rule}
                </p>

                {/* Critical Requirement Callout */}
                <div className="bg-amber-50/70 dark:bg-indigo-950/40 border border-amber-200/80 dark:border-indigo-800/40 rounded-lg p-3 my-2.5 text-xs text-amber-950 dark:text-indigo-200 leading-relaxed">
                  <div className="font-bold text-amber-800 dark:text-indigo-300 mb-1 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                    <Zap size={13} className="text-amber-500 dark:text-amber-400" />
                    Κρίσιμη Τεχνική Προδιαγραφή:
                  </div>
                  <div className="whitespace-pre-line text-neutral-800 dark:text-neutral-200 font-medium">
                    {rule.criticalRequirement}
                  </div>
                </div>

                {/* Notes */}
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-2 italic">
                  💡 {rule.notes}
                </p>
              </div>

              {/* Card Footer Badge */}
              <div className="pt-3 mt-3 border-t border-neutral-100 dark:border-neutral-800/70 flex items-center justify-between text-[11px] text-neutral-500">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle size={12} />
                  Υποχρεωτικό για Ηλεκτρολόγο
                </span>
                <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-600 uppercase">
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
