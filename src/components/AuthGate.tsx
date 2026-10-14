import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const VALID_PASSCODE = 'andreas';

export function getMagicLinkUrl(): string {
  if (typeof window === 'undefined') return `https://house.lefk.dev/?auth=${VALID_PASSCODE}`;
  return `${window.location.origin}${window.location.pathname}?auth=${VALID_PASSCODE}`;
}

export function useAuth() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('auth') || params.get('pass') || params.get('code') || params.get('key');
    if (code && code.trim().toLowerCase() === VALID_PASSCODE.toLowerCase()) {
      return true;
    }
    return localStorage.getItem('house_auth_unlocked') === 'true';
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('auth') || params.get('pass') || params.get('code') || params.get('key');

    if (code && code.trim().toLowerCase() === VALID_PASSCODE.toLowerCase()) {
      setIsUnlocked(true);
      localStorage.setItem('house_auth_unlocked', 'true');
      setToastMessage('Συνδεθήκατε αυτόματα μέσω Magic Link! ✨');

      // Clean the query parameter from URL bar
      params.delete('auth');
      params.delete('pass');
      params.delete('code');
      params.delete('key');
      const newQuery = params.toString() ? `?${params.toString()}` : '';
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + newQuery + window.location.hash
      );
    }
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const unlock = (code: string): boolean => {
    if (code.trim().toLowerCase() === VALID_PASSCODE.toLowerCase()) {
      setIsUnlocked(true);
      localStorage.setItem('house_auth_unlocked', 'true');
      setToastMessage('Επιτυχής είσοδος! Καλώς ήρθατε.');
      return true;
    }
    return false;
  };

  const lock = () => {
    localStorage.removeItem('house_auth_unlocked');
    setIsUnlocked(false);
    setToastMessage('Η εφαρμογή κλειδώθηκε.');
  };

  return {
    isUnlocked,
    unlock,
    lock,
    toastMessage,
    setToastMessage
  };
}

interface LockScreenProps {
  onUnlock: (code: string) => boolean;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUnlock(passcode)) {
      setError(false);
    } else {
      setError(true);
    }
  };

  const magicUrl = getMagicLinkUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(magicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-3 sm:p-4 font-sans select-none relative overflow-hidden transition-colors duration-200">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/5 relative z-10"
      >
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex p-3 bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 dark:from-indigo-400 to-cyan-600 dark:to-cyan-400">
              House
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-0.5">
              Έξυπνο Σύστημα Διαχείρισης & Παροχών
            </p>
          </div>
          <p className="text-neutral-600 dark:text-neutral-300 text-xs leading-relaxed max-w-xs mx-auto">
            Απαιτείται κωδικός πρόσβασης ή Magic Link για είσοδο στις μελέτες και στα σχέδια.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Κωδικός Πρόσβασης
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="π.χ. andreas"
                autoFocus
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-neutral-950/70 border ${
                  error 
                    ? 'border-rose-500 focus:ring-rose-500/30' 
                    : 'border-neutral-300 dark:border-neutral-700 focus:border-indigo-500 dark:focus:border-indigo-400'
                } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-neutral-900 dark:text-neutral-100 pr-10 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-600 dark:text-rose-400 font-semibold pt-0.5"
              >
                Λανθασμένος κωδικός πρόσβασης. Δοκιμάστε ξανά.
              </motion.p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            <Unlock size={16} className="group-hover:rotate-12 transition-transform" />
            <span>Ξεκλείδωμα Συστήματος</span>
          </button>
        </form>

        {/* Magic Link Hint Box */}
        <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800 text-center">
          <div className="bg-neutral-100/80 dark:bg-neutral-800/40 rounded-2xl p-3 border border-neutral-200 dark:border-neutral-800 text-left">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Sparkles size={13} />
                Magic Link (Άμεση Σύνδεση)
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[10px] font-semibold text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-xs"
              >
                {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                <span>{copied ? 'Αντιγράφηκε' : 'Αντιγραφή'}</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
              Μπορείτε να εισέλθετε αυτόματα χωρίς πληκτρολόγηση ανοίγοντας τον σύνδεσμο με <code className="px-1 py-0.5 rounded bg-neutral-200 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-mono text-[10px]">?auth=andreas</code>.
            </p>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

interface MagicLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MagicLinkModal: React.FC<MagicLinkModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const magicUrl = getMagicLinkUrl();

  const handleCopy = () => {
    navigator.clipboard.writeText(magicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <KeyRound size={22} />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
              Magic Link & Κωδικός
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Άμεση πρόσβαση χωρίς εισαγωγή κωδικού
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
              Σύνδεσμος Magic Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={magicUrl}
                className="w-full bg-transparent text-xs font-mono text-neutral-800 dark:text-neutral-200 outline-none truncate select-all"
              />
              <button
                onClick={handleCopy}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Αντιγράφηκε' : 'Αντιγραφή'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900/40 text-xs text-neutral-600 dark:text-neutral-300 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-500" />
              Πώς λειτουργεί:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400 pl-1">
              <li>
                Στείλτε αυτό το link σε συνεργάτες, μηχανικούς ή στην οικογένεια.
              </li>
              <li>
                Όποιος ανοίξει το link συνδέεται <strong>άμεσα και αυτόματα</strong> με τον κωδικό <code className="bg-white dark:bg-neutral-900 px-1 py-0.5 rounded font-mono font-bold text-neutral-800 dark:text-neutral-200">andreas</code>.
              </li>
              <li>
                Η συσκευή τους αποθηκεύει την εξουσιοδότηση ώστε να μην χρειάζεται να τον ξαναγράψουν.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Κλείσιμο
          </button>
          <a
            href={magicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition-colors flex items-center gap-1.5"
          >
            <span>Δοκιμή σε νέα καρτέλα</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>
    </div>
  );
};

interface AuthToolbarControlsProps {
  onOpenMagicModal: () => void;
  onLock: () => void;
}

export const AuthToolbarControls: React.FC<AuthToolbarControlsProps> = ({
  onOpenMagicModal,
  onLock
}) => {
  return (
    <div className="flex items-center bg-neutral-200/80 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-300 dark:border-neutral-800 text-xs gap-1">
      <button
        onClick={onOpenMagicModal}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white/60 dark:hover:bg-neutral-800/80 transition-colors font-medium"
        title="Magic Link & Διαμοιρασμός Κωδικού"
      >
        <KeyRound size={14} className="text-indigo-500" />
        <span className="hidden sm:inline text-[11px]">Magic Link</span>
      </button>

      <button
        onClick={onLock}
        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white/60 dark:hover:bg-neutral-800/80 transition-colors"
        title="Κλείδωμα Εφαρμογής"
      >
        <Lock size={14} />
      </button>
    </div>
  );
};

export const AuthToast: React.FC<{ message: string | null }> = ({ message }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="fixed bottom-4 right-4 z-50 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-neutral-700 dark:border-neutral-200"
        >
          <Sparkles size={14} className="text-amber-400 dark:text-amber-600 flex-shrink-0" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
