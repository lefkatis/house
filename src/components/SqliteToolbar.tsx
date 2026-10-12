import React, { useRef, useState, useEffect } from 'react';
import { 
  Undo2, 
  Redo2, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  ChevronDown
} from 'lucide-react';

interface SqliteToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  lastAction: string | null;
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
  onImport: (buffer: ArrayBuffer) => void;
  onReset: () => void;
}

export const SqliteToolbar: React.FC<SqliteToolbarProps> = ({
  canUndo,
  canRedo,
  undoCount,
  redoCount,
  lastAction,
  onUndo,
  onRedo,
  onDownload,
  onImport,
  onReset
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        onImport(reader.result);
        setToastMessage('Η βάση δεδομένων εισήχθη επιτυχώς!');
        setTimeout(() => setToastMessage(null), 3000);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
    setDropdownOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Hidden file input for .sqlite import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".sqlite,.db,.sqlite3"
        className="hidden"
      />

      {/* Undo Button */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold border transition-all ${
          canUndo
            ? 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-neutral-800 shadow-sm'
            : 'bg-neutral-100 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800/80 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-60'
        }`}
        title="Αναίρεση προηγούμενης αλλαγής (Ctrl+Z / Cmd+Z)"
      >
        <Undo2 size={13} />
        <span>Αναίρεση</span>
        {undoCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-extrabold">
            {undoCount}
          </span>
        )}
      </button>

      {/* Redo Button */}
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-bold border transition-all ${
          canRedo
            ? 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-100 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-neutral-800 shadow-sm'
            : 'bg-neutral-100 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800/80 text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-60'
        }`}
        title="Επανάληψη αναιρεμένης αλλαγής (Ctrl+Y / Cmd+Shift+Z)"
      >
        <Redo2 size={13} />
        <span>Επανάληψη</span>
        {redoCount > 0 && (
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-extrabold">
            {redoCount}
          </span>
        )}
      </button>

      {/* SQLite Management Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-200 font-semibold transition-colors"
          title="Διαχείριση SQLite & Αρχείων Βάσης"
        >
          <Database size={13} className="text-indigo-500" />
          <span className="hidden sm:inline">SQLite Βάση</span>
          <ChevronDown size={12} className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
            
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 mb-1">
              SQLite Storage &middot; WASM
            </div>

            <button
              onClick={() => {
                onDownload();
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-indigo-50 dark:hover:bg-neutral-800 hover:text-indigo-600 transition-colors text-left"
            >
              <Download size={14} className="text-indigo-500" />
              <div>
                <div className="font-semibold">Εξαγωγή (.sqlite)</div>
                <div className="text-[10px] text-neutral-400">Λήψη αρχείου βάσης δεδομένων</div>
              </div>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-cyan-50 dark:hover:bg-neutral-800 hover:text-cyan-600 transition-colors text-left"
            >
              <Upload size={14} className="text-cyan-500" />
              <div>
                <div className="font-semibold">Εισαγωγή (.sqlite)</div>
                <div className="text-[10px] text-neutral-400">Φόρτωση αρχείου SQLite</div>
              </div>
            </button>

            <div className="border-t border-neutral-100 dark:border-neutral-800 my-1"></div>

            <button
              onClick={() => {
                if (window.confirm('Είστε βέβαιοι ότι θέλετε επαναφορά στα αρχικά πρότυπα δεδομένα; Όλες οι τοπικές τροποποιήσεις θα χαθούν.')) {
                  onReset();
                  setToastMessage('Έγινε επαναφορά αρχικών δεδομένων.');
                  setTimeout(() => setToastMessage(null), 3000);
                }
                setDropdownOpen(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
            >
              <RotateCcw size={14} />
              <div>
                <div className="font-semibold">Επαναφορά Αρχικών</div>
                <div className="text-[10px] text-rose-400/80">Καθαρισμός αλλαγών</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Toast Notice */}
      {toastMessage && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold animate-in fade-in">
          <Check size={12} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Last action notification */}
      {lastAction && (
        <span className="hidden xl:inline text-[11px] text-neutral-500 dark:text-neutral-400 truncate max-w-xs italic" title={lastAction}>
          {lastAction}
        </span>
      )}
    </div>
  );
};
