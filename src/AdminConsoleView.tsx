import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  KeyRound, 
  UserPlus, 
  Copy, 
  Check, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  Search, 
  Clock, 
  X,
  AlertTriangle,
  Unlock,
  Users,
  Wrench,
  Compass,
  Home,
  Database,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { 
  PasscodeEntry, 
  getAllPasscodes, 
  addPasscode, 
  deletePasscode, 
  togglePasscodeActive, 
  buildMagicLink, 
  MASTER_PASSCODE 
} from './services/passcodeService';

interface AdminConsoleViewProps {
  onBackToApp: () => void;
  currentUser?: PasscodeEntry | null;
  onSelectPasscode?: (code: string) => void;
  onDownloadDatabase?: () => void;
  onImportDatabase?: (buffer: ArrayBuffer) => void;
  onResetDatabase?: () => void;
  totalProvisions?: number;
  totalProcurement?: number;
  totalRules?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export default function AdminConsoleView({
  onBackToApp,
  currentUser,
  onDownloadDatabase,
  onImportDatabase,
  onResetDatabase,
  totalProvisions,
  totalProcurement,
  totalRules,
  theme,
  onToggleTheme
}: AdminConsoleViewProps) {
  // Master auth check state
  const [isMasterVerified, setIsMasterVerified] = useState<boolean>(() => {
    if (currentUser?.isMaster) return true;
    return localStorage.getItem('house_admin_verified') === 'true';
  });

  const [masterInput, setMasterInput] = useState('');
  const [masterError, setMasterError] = useState(false);

  // Passcodes list state
  const [passcodes, setPasscodes] = useState<PasscodeEntry[]>(() => getAllPasscodes());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Passcode Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newRole, setNewRole] = useState<'full' | 'readonly'>('full');
  const [newCategory, setNewCategory] = useState<'family' | 'engineers' | 'contractors' | 'guests'>('contractors');
  const [newDuration, setNewDuration] = useState<'never' | '7days' | '30days' | '90days'>('never');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // SQLite Database Management state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dbToastMessage, setDbToastMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImportDatabase) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        onImportDatabase(reader.result);
        setDbToastMessage('Η βάση δεδομένων SQLite εισήχθη και φορτώθηκε επιτυχώς!');
        setTimeout(() => setDbToastMessage(null), 3500);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleResetDatabase = () => {
    if (!onResetDatabase) return;
    if (window.confirm('ΠΡΟΣΟΧΗ: Είστε βέβαιοι ότι θέλετε πλήρη επαναφορά στα αρχικά εργοστασιακά δεδομένα; Όλες οι τοπικές τροποποιήσεις θα διαγραφούν οριστικά.')) {
      onResetDatabase();
      setDbToastMessage('Έγινε επιτυχής επαναφορά των αρχικών δεδομένων.');
      setTimeout(() => setDbToastMessage(null), 3500);
    }
  };

  // Master passcode gate check
  const handleMasterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterInput.trim().toLowerCase() === MASTER_PASSCODE.toLowerCase()) {
      setIsMasterVerified(true);
      localStorage.setItem('house_admin_verified', 'true');
      setMasterError(false);
    } else {
      setMasterError(true);
    }
  };

  const refreshPasscodes = () => {
    setPasscodes(getAllPasscodes());
  };

  const toggleCodeVisibility = (id: string) => {
    const next = new Set(visibleCodes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setVisibleCodes(next);
  };

  const handleCopyLink = (code: string, id: string) => {
    const url = buildMagicLink(code);
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleShareLink = async (item: PasscodeEntry) => {
    const url = buildMagicLink(item.code);
    const text = `Σύνδεσμος πρόσβασης για την εφαρμογή House (${item.name}):\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'House - Magic Link Πρόσβασης',
          text,
          url
        });
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2500);
      }
    } else {
      navigator.clipboard.writeText(url);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleToggleActive = (id: string) => {
    togglePasscodeActive(id);
    refreshPasscodes();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε τον κωδικό για "${name}";`)) {
      deletePasscode(id);
      refreshPasscodes();
    }
  };

  const generateRandomCode = () => {
    const adjectives = ['alpha', 'star', 'pro', 'mep', 'house', 'build', 'smart'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    setNewCode(`${randomAdj}${randomNum}`);
  };

  const handleCreatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('Παρακαλώ εισάγετε όνομα χρήστη / συνεργάτη.');
      return;
    }
    if (!newCode.trim()) {
      setFormError('Παρακαλώ εισάγετε κωδικό πρόσβασης.');
      return;
    }

    const cleanCode = newCode.trim().toLowerCase();
    const existing = passcodes.find(p => p.code.toLowerCase() === cleanCode);
    if (existing) {
      setFormError(`Ο κωδικός "${cleanCode}" χρησιμοποιείται ήδη (${existing.name}).`);
      return;
    }

    // Calculate expiry
    let expiresAt: string | null = null;
    const now = Date.now();
    if (newDuration === '7days') {
      expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (newDuration === '30days') {
      expiresAt = new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (newDuration === '90days') {
      expiresAt = new Date(now + 90 * 24 * 60 * 60 * 1000).toISOString();
    }

    addPasscode({
      code: cleanCode,
      name: newName.trim(),
      role: newRole,
      category: newCategory,
      expiresAt,
      isActive: true,
      notes: newNotes.trim() || undefined
    });

    // Reset and close
    setNewName('');
    setNewCode('');
    setNewNotes('');
    setNewDuration('never');
    setFormError(null);
    setIsModalOpen(false);
    refreshPasscodes();
  };

  // Filter passcodes
  const filteredPasscodes = useMemo(() => {
    return passcodes.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCode = p.code.toLowerCase().includes(q);
        const matchNotes = p.notes ? p.notes.toLowerCase().includes(q) : false;
        if (!matchName && !matchCode && !matchNotes) return false;
      }

      return true;
    });
  }, [passcodes, selectedCategory, searchQuery]);

  // Master Authentication Screen (if not verified)
  if (!isMasterVerified) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative"
        >
          <div className="text-center space-y-3 mb-6">
            <div className="inline-flex p-3 bg-rose-600/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-200 dark:border-rose-900/40">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
              Κονσόλα Διαχείρισης (/admin)
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
              Απαιτείται ο κωδικός Master Admin (<code className="font-mono font-bold">andreas</code>) για πρόσβαση στη διαχείριση κωδικών και Magic Links.
            </p>
          </div>

          <form onSubmit={handleMasterSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={masterInput}
                onChange={(e) => {
                  setMasterInput(e.target.value);
                  if (masterError) setMasterError(false);
                }}
                placeholder="Εισάγετε τον Master Κωδικό..."
                autoFocus
                className={`w-full px-4 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-950 border ${
                  masterError ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-neutral-300 dark:border-neutral-700'
                } focus:outline-none focus:border-indigo-500 text-neutral-900 dark:text-white`}
              />
              {masterError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mt-1">
                  Λανθασμένος κωδικός διαχειριστή.
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onBackToApp}
                className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Επιστροφή στην Κεντρική Σελίδα
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Unlock size={14} />
                <span>Είσοδος</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Active Master Admin Console UI
  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      
      {/* Top Banner / Navigation */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onBackToApp}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            title="Επιστροφή στην Κεντρική Σελίδα"
          >
            <ArrowLeft size={16} />
            <span>Επιστροφή στην Κεντρική Σελίδα</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white">
                Κονσόλα Διαχείρισης Κωδικών & Magic Links
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-900/60">
                /admin
              </span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Διαχειριστείτε τους κωδικούς πρόσβασης, τα δικαιώματα και στείλτε Magic Links σε συνεργάτες.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 sm:p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 transition-all shadow-xs flex items-center justify-center active:scale-95"
              title={theme === 'light' ? 'Αλλαγή σε Σκοτεινό Θέμα (Dark)' : 'Αλλαγή σε Φωτεινό Θέμα (Light)'}
              aria-label="Εναλλαγή θέματος"
            >
              {theme === 'light' ? (
                <Moon size={16} className="text-indigo-600" />
              ) : (
                <Sun size={16} className="text-amber-400" />
              )}
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-98"
          >
            <UserPlus size={15} />
            <span>+ Νέος Κωδικός</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-medium text-neutral-500">Συνολικοί Κωδικοί</span>
          <div className="text-xl font-black text-neutral-900 dark:text-white mt-0.5">
            {passcodes.length}
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Ενεργοί Κωδικοί</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
            {passcodes.filter(p => p.isActive).length}
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Μηχανικοί & Μελετητές</span>
          <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
            {passcodes.filter(p => p.category === 'engineers').length}
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-xs">
          <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400">Εργολάβοι & Τεχνικοί</span>
          <div className="text-xl font-black text-cyan-600 dark:text-cyan-400 mt-0.5">
            {passcodes.filter(p => p.category === 'contractors').length}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {[
            { id: 'all', label: 'Όλοι', icon: Users },
            { id: 'owner', label: 'Ιδιοκτήτης', icon: ShieldCheck },
            { id: 'family', label: 'Οικογένεια', icon: Home },
            { id: 'engineers', label: 'Μηχανικοί', icon: Compass },
            { id: 'contractors', label: 'Εργολάβοι', icon: Wrench },
            { id: 'guests', label: 'Επισκέπτες', icon: KeyRound }
          ].map(tab => {
            const Icon = tab.icon;
            const isSel = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-colors border ${
                  isSel
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Αναζήτηση κωδικού ή ονόματος..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Passcodes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPasscodes.map(item => {
          const isVisible = visibleCodes.has(item.id);
          const isCopied = copiedId === item.id;
          const magicUrl = buildMagicLink(item.code);

          return (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                item.isMaster
                  ? 'bg-gradient-to-br from-rose-50/50 to-indigo-50/30 dark:from-rose-950/20 dark:to-indigo-950/20 border-rose-200 dark:border-rose-900/60 shadow-sm'
                  : !item.isActive
                  ? 'bg-neutral-100/60 dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-800 opacity-60'
                  : 'bg-white dark:bg-neutral-900/80 border-neutral-200 dark:border-neutral-800 shadow-sm hover:border-indigo-500/40'
              }`}
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      {item.isMaster && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white px-1.5 py-0.2 rounded-full">
                          MASTER
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Active / Inactive Toggle (disabled for master) */}
                  {!item.isMaster && (
                    <button
                      onClick={() => handleToggleActive(item.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                        item.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-neutral-700'
                      }`}
                      title={item.isActive ? 'Ενεργός (Κλικ για απενεργοποίηση)' : 'Ανενεργός (Κλικ για ενεργοποίηση)'}
                    >
                      {item.isActive ? 'Ενεργός' : 'Ανενεργός'}
                    </button>
                  )}
                </div>

                {/* Code display card */}
                <div className="bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 my-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-neutral-400">
                      Κωδικός:
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {isVisible ? item.code : '••••••••'}
                      </span>
                      <button
                        onClick={() => toggleCodeVisibility(item.id)}
                        className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-0.5 transition-colors"
                        title={isVisible ? 'Απόκρυψη κωδικού' : 'Προβολή κωδικού'}
                      >
                        {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Expiration badge if set */}
                  {item.expiresAt && (
                    <div className="mt-1.5 pt-1.5 border-t border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between text-[10px] text-neutral-400">
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <Clock size={10} />
                        <span>Λήξη:</span>
                      </span>
                      <span>{new Date(item.expiresAt).toLocaleDateString('el-GR')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/60">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyLink(item.code, item.id)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    title="Αντιγραφή Magic Link στο πρόχειρο"
                  >
                    {isCopied ? <Check size={12} className="text-emerald-300" /> : <Copy size={12} />}
                    <span>{isCopied ? 'Αντιγράφηκε!' : 'Magic Link'}</span>
                  </button>

                  <button
                    onClick={() => handleShareLink(item)}
                    className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                    title="Κοινοποίηση σε WhatsApp / Viber / SMS"
                  >
                    <Share2 size={13} />
                  </button>

                  <a
                    href={magicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                    title="Άνοιγμα συνδέσμου σε νέα καρτέλα"
                  >
                    <ExternalLink size={13} />
                  </a>

                  {!item.isMaster && (
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors"
                      title="Διαγραφή κωδικού"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <div className="text-[10px] text-neutral-400 font-mono truncate select-all bg-neutral-50 dark:bg-neutral-950/50 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800/60">
                  {magicUrl}
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>

      {/* Hidden file input for .sqlite import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".sqlite,.db,.sqlite3"
        className="hidden"
      />

      {/* SQLite WASM Database Management Section */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-900/40">
              <Database size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
                  Διαχείριση Βάσης Δεδομένων (SQLite WASM)
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800/60">
                  Online &bull; Local WASM
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Τα δεδομένα της κατοικίας αποθηκεύονται τοπικά στον φυλλομετρητή (In-Browser SQLite WebAssembly). Δημιουργήστε αντίγραφο ασφαλείας ή επαναφέρετε δεδομένα.
              </p>
            </div>
          </div>

          {/* Quick Database Stats */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {typeof totalProvisions === 'number' && (
              <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-neutral-700">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{totalProvisions}</span> Παροχές
              </span>
            )}
            {typeof totalProcurement === 'number' && (
              <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-neutral-700">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">{totalProcurement}</span> Αγορές
              </span>
            )}
            {typeof totalRules === 'number' && (
              <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold border border-neutral-200 dark:border-neutral-700">
                <span className="font-bold text-amber-600 dark:text-amber-400">{totalRules}</span> Οδηγίες
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Download Backup */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                <Download size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>Εξαγωγή (.sqlite)</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Κατεβάστε πλήρες αντίγραφο ασφαλείας της τοπικής SQLite βάσης για αρχειοθέτηση ή μεταφορά σε άλλη συσκευή.
              </p>
            </div>
            <button
              type="button"
              onClick={onDownloadDatabase}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/20 transition-all active:scale-98"
            >
              <Download size={14} />
              <span>Λήψη Αρχείου .sqlite</span>
            </button>
          </div>

          {/* Import / Restore */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-neutral-900 dark:text-white">
                <Upload size={16} className="text-cyan-600 dark:text-cyan-400" />
                <span>Εισαγωγή (.sqlite)</span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Φορτώστε προηγούμενο αρχείο .sqlite για άμεση ενημέρωση και συγχρονισμό των δεδομένων.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-600/20 transition-all active:scale-98"
            >
              <Upload size={14} />
              <span>Φόρτωση από Αρχείο</span>
            </button>
          </div>

          {/* Factory Reset */}
          <div className="p-3.5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 flex flex-col justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-400">
                <RotateCcw size={16} />
                <span>Επαναφορά Αρχικών</span>
              </div>
              <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 leading-relaxed">
                Επαναφέρει όλες τις παροχές, τις αγορές και τους κανόνες στα εργοστασιακά πρότυπα δεδομένα.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDatabase}
              className="w-full py-2 px-3 rounded-lg bg-white dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
            >
              <RotateCcw size={14} />
              <span>Επαναφορά Προτύπων</span>
            </button>
          </div>
        </div>

        {/* Database Feedback Toast */}
        {dbToastMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check size={15} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{dbToastMessage}</span>
          </div>
        )}
      </div>

      {/* Modal: Create New Passcode */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <UserPlus size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                    Δημιουργία Νέου Κωδικού & Magic Link
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Ορίστε όνομα συνεργάτη, κωδικό και διάρκεια ισχύος.
                  </p>
                </div>
              </div>

              {formError && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-300 font-semibold flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreatePasscode} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Όνομα Συνεργάτη / Χρήστη *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="π.χ. Κώστας Ηλεκτρολόγος, ή Μιχάλης Αλουμινάς"
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Κωδικός Πρόσβασης *
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <Sparkles size={11} />
                      <span>Αυτόματη Παραγωγή</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => {
                      setNewCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                      if (formError) setFormError(null);
                    }}
                    placeholder="π.χ. kostas, mikis2026 (μόνο λατινικά πεζά)"
                    className="w-full px-3 py-2 rounded-xl font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                      Κατηγορία
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs"
                    >
                      <option value="contractors">Εργολάβος</option>
                      <option value="engineers">Μηχανικός</option>
                      <option value="family">Οικογένεια</option>
                      <option value="guests">Επισκέπτης</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                      Δικαιώματα
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs"
                    >
                      <option value="full">Πλήρης Πρόσβαση</option>
                      <option value="readonly">Μόνο Προβολή</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                      Διάρκεια Ισχύος
                    </label>
                    <select
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value as any)}
                      className="w-full px-2.5 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500 text-xs"
                    >
                      <option value="never">Μόνιμο (Χωρίς Λήξη)</option>
                      <option value="7days">7 Ημέρες</option>
                      <option value="30days">30 Ημέρες</option>
                      <option value="90days">90 Ημέρες</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Σημειώσεις / Ρόλος (Προαιρετικό)
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="π.χ. Υπεύθυνος για καλωδιώσεις και φωτισμό σαλονιού"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Live Preview Box */}
                {newCode && (
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-0.5">
                      Προεπισκόπηση Magic Link:
                    </span>
                    <span className="font-mono text-[11px] text-neutral-700 dark:text-neutral-300 break-all select-all">
                      {buildMagicLink(newCode)}
                    </span>
                  </div>
                )}

                <div className="pt-3 flex justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    Ακύρωση
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Δημιουργία & Αποθήκευση</span>
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
