import React, { useEffect } from 'react';
import { 
  Undo2, 
  Redo2
} from 'lucide-react';

interface SqliteToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  lastAction: string | null;
  onUndo: () => void;
  onRedo: () => void;
  onDownload?: () => void;
  onImport?: (buffer: ArrayBuffer) => void;
  onReset?: () => void;
}

export const SqliteToolbar: React.FC<SqliteToolbarProps> = ({
  canUndo,
  canRedo,
  undoCount,
  redoCount,
  lastAction,
  onUndo,
  onRedo
}) => {
  // Keyboard shortcut listener for Ctrl+Z / Cmd+Z and Ctrl+Y / Cmd+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          // Redo
          e.preventDefault();
          if (canRedo) onRedo();
        } else {
          // Undo
          e.preventDefault();
          if (canUndo) onUndo();
        }
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'y') {
        // Redo on Windows/Linux
        e.preventDefault();
        if (canRedo) onRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, onUndo, onRedo]);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold border transition-all ${
          canUndo
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/70 text-amber-950 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60 shadow-xs active:scale-95 cursor-pointer ring-1 ring-amber-400/30'
            : 'bg-neutral-100 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800/80 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-50'
        }`}
        title="Αναίρεση προηγούμενης αλλαγής (Ctrl+Z / Cmd+Z)"
      >
        <Undo2 size={13} className={canUndo ? 'stroke-[2.5]' : ''} />
        <span className="inline">Αναίρεση</span>
        {undoCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-black">
            {undoCount}
          </span>
        )}
      </button>

      {/* Redo Button */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl font-bold border transition-all ${
          canRedo
            ? 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-neutral-800 shadow-xs active:scale-95 cursor-pointer'
            : 'bg-neutral-100 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800/80 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-50'
        }`}
        title="Επανάληψη αναιρεμένης αλλαγής (Ctrl+Y / Cmd+Shift+Z)"
      >
        <Redo2 size={13} />
        <span className="hidden min-[480px]:inline">Επανάληψη</span>
        {redoCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-extrabold">
            {redoCount}
          </span>
        )}
      </button>

      {/* Last action notification */}
      {lastAction && (
        <span className="hidden 2xl:inline text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-xs italic" title={lastAction}>
          {lastAction}
        </span>
      )}
    </div>
  );
};
