import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, Redo2, X, CheckCircle2, RotateCcw } from 'lucide-react';

interface FloatingUndoToastProps {
  lastAction: string | null;
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  onUndo: () => void;
  onRedo: () => void;
  isAdmin: boolean;
}

export const FloatingUndoToast: React.FC<FloatingUndoToastProps> = ({
  lastAction,
  canUndo,
  canRedo,
  undoCount,
  redoCount,
  onUndo,
  onRedo,
  isAdmin
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const prevActionRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger toast visibility whenever lastAction changes to a valid string
  useEffect(() => {
    if (!lastAction) return;

    // Show toast
    setIsVisible(true);
    prevActionRef.current = lastAction;

    // Reset timer
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [lastAction]);

  // Pause timer on hover
  useEffect(() => {
    if (isHovered && timerRef.current) {
      clearTimeout(timerRef.current);
    } else if (!isHovered && isVisible) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }
  }, [isHovered, isVisible]);

  if (!isAdmin) return null;

  const isLastActionUndo = Boolean(lastAction && lastAction.startsWith('Αναίρεση:'));

  const handleUndo = () => {
    onUndo();
  };

  const handleRedo = () => {
    onRedo();
  };

  return (
    <>
      {/* 1. Main Action Notification Toast */}
      <AnimatePresence>
        {isVisible && lastAction && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-lg z-50 bg-neutral-900/95 dark:bg-neutral-900/95 text-white border border-neutral-700/80 rounded-2xl shadow-2xl backdrop-blur-md p-3 sm:p-3.5 flex items-center justify-between gap-3 select-none"
          >
            {/* Status Icon & Description */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400 flex-shrink-0">
                {isLastActionUndo ? <RotateCcw size={16} /> : <CheckCircle2 size={16} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  {isLastActionUndo ? 'Έγινε αναίρεση' : 'Αποθηκεύτηκε αλλαγή'}
                </p>
                <p className="text-xs sm:text-sm font-bold text-neutral-100 truncate" title={lastAction}>
                  {lastAction}
                </p>
              </div>
            </div>

            {/* Action Buttons: Undo / Redo */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isLastActionUndo ? (
                canRedo && (
                  <button
                    onClick={handleRedo}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                    title="Επανάληψη της αλλαγής (Ctrl+Y)"
                  >
                    <Redo2 size={13} className="stroke-[2.5]" />
                    <span>Επανάληψη</span>
                    {redoCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-cyan-900/60 text-cyan-200 text-[10px] font-black">
                        {redoCount}
                      </span>
                    )}
                  </button>
                )
              ) : (
                canUndo && (
                  <button
                    onClick={handleUndo}
                    className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                    title="Αναίρεση αυτής της αλλαγής (Ctrl+Z)"
                  >
                    <Undo2 size={14} className="stroke-[2.8]" />
                    <span>Αναίρεση</span>
                  </button>
                )
              )}

              {/* Dismiss button */}
              <button
                onClick={() => setIsVisible(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-0.5 cursor-pointer"
                title="Κλείσιμο"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Persistent Floating Mini Undo Pill (Visible when toast is dismissed and canUndo is true) */}
      <AnimatePresence>
        {!isVisible && canUndo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
          >
            <button
              onClick={onUndo}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-900/90 dark:bg-neutral-800/90 hover:bg-neutral-900 text-white border border-neutral-700/80 shadow-2xl backdrop-blur-md text-xs font-bold transition-all cursor-pointer hover:border-amber-400/60 active:scale-95 group"
              title={`Αναίρεση προηγούμενης αλλαγής (Ctrl+Z) - ${undoCount} ενέργειες`}
            >
              <Undo2 size={14} className="text-amber-400 group-hover:-rotate-45 transition-transform stroke-[2.5]" />
              <span className="font-extrabold tracking-wide">Αναίρεση</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-black">
                {undoCount}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
