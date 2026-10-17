import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Phone, 
  Plus, 
  Trash2, 
  Pencil, 
  Copy, 
  Check, 
  MessageSquare, 
  X, 
  AlertTriangle,
  RotateCcw,
  DoorClosed
} from 'lucide-react';
import { Subcontractor, INITIAL_SUBCONTRACTORS } from '../data/partnersData';

const STORAGE_KEY = 'house_subcontractors_v1';

export const SubcontractorsSection: React.FC = () => {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load subcontractors from localStorage', e);
    }
    return INITIAL_SUBCONTRACTORS;
  });

  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('Σιδεράς / Μεταλλικές Κατασκευές');
  const [workScope, setWorkScope] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Subcontractor['status']>('contacted');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subcontractors));
    } catch (e) {
      console.error('Failed to save subcontractors', e);
    }
  }, [subcontractors]);

  const handleCopyPhone = (ph: string) => {
    navigator.clipboard.writeText(ph.replace(/\s+/g, ''));
    setCopiedPhone(ph);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setSpecialty('Σιδεράς / Μεταλλικές Κατασκευές');
    setWorkScope('');
    setPhone('');
    setAltPhone('');
    setEmail('');
    setStatus('contacted');
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (sub: Subcontractor) => {
    setEditingId(sub.id);
    setName(sub.name);
    setSpecialty(sub.specialty);
    setWorkScope(sub.workScope);
    setPhone(sub.phone);
    setAltPhone(sub.altPhone || '');
    setEmail(sub.email || '');
    setStatus(sub.status);
    setNotes(sub.notes);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, subName: string) => {
    if (confirm(`Είστε βέβαιοι ότι θέλετε να διαγράψετε τον υπεργολάβο "${subName}";`)) {
      setSubcontractors(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: Subcontractor['status']) => {
    let label = 'Σε Επικοινωνία';
    if (newStatus === 'pending_quote') label = 'Αναμονή Προσφοράς';
    if (newStatus === 'selected') label = 'Επιλεγμένος';
    if (newStatus === 'completed') label = 'Ολοκληρώθηκε';

    setSubcontractors(prev => prev.map(s => s.id === id ? { ...s, status: newStatus, statusLabel: label } : s));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Παρακαλώ εισάγετε όνομα τεχνικού / υπεργολάβου.');
      return;
    }
    if (!workScope.trim()) {
      setFormError('Παρακαλώ εισάγετε εργασία ανάθεσης (π.χ. Πόρτες έξω του μικρού parking).');
      return;
    }
    if (!phone.trim()) {
      setFormError('Παρακαλώ εισάγετε τηλέφωνο επικοινωνίας.');
      return;
    }

    let statusLabel = 'Σε Επικοινωνία';
    if (status === 'pending_quote') statusLabel = 'Αναμονή Προσφοράς';
    if (status === 'selected') statusLabel = 'Επιλεγμένος';
    if (status === 'completed') statusLabel = 'Ολοκληρώθηκε';

    if (editingId) {
      setSubcontractors(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name: name.trim(),
            specialty: specialty.trim(),
            workScope: workScope.trim(),
            phone: phone.trim(),
            altPhone: altPhone.trim() || undefined,
            email: email.trim() || undefined,
            status,
            statusLabel,
            notes: notes.trim()
          };
        }
        return item;
      }));
    } else {
      const newSub: Subcontractor = {
        id: `sub_${Date.now()}`,
        name: name.trim(),
        specialty: specialty.trim(),
        workScope: workScope.trim(),
        phone: phone.trim(),
        altPhone: altPhone.trim() || undefined,
        email: email.trim() || undefined,
        status,
        statusLabel,
        notes: notes.trim()
      };
      setSubcontractors(prev => [...prev, newSub]);
    }

    setIsModalOpen(false);
  };

  const handleResetToDefaults = () => {
    if (confirm('Επαναφορά του αρχικού υπεργολάβου (Σταύρος Χαραλάμπους - Σιδεράς);')) {
      setSubcontractors(INITIAL_SUBCONTRACTORS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SUBCONTRACTORS));
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-200 dark:border-amber-900/40">
              <Wrench size={20} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
              Υπεργολάβοι & Συνεργεία Κατασκευής (Subcontractors)
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-900/60">
              {subcontractors.length} Συνεργεία
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Ειδικοί τεχνικοί και υπεργολάβοι για μεταλλικές κατασκευές, σιδηρουργικά, πόρτες parking, αλουμίνια, γυψοσανίδες και εξειδικευμένες εγκαταστάσεις.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleResetToDefaults}
            className="p-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Επαναφορά αρχικών στοιχείων"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all active:scale-98"
          >
            <Plus size={15} />
            <span>+ Νέος Υπεργολάβος</span>
          </button>
        </div>
      </div>

      {/* Subcontractor Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {subcontractors.map(sub => {
          const rawCleanPhone = sub.phone.replace(/[^0-9+]/g, '');
          const waPhone = rawCleanPhone.startsWith('+') ? rawCleanPhone.replace('+', '') : rawCleanPhone.length === 8 ? `357${rawCleanPhone}` : rawCleanPhone;

          return (
            <div
              key={sub.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                {/* Header Row: Name & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                        {sub.name}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">
                        {sub.specialty}
                      </span>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={sub.status}
                    onChange={(e) => handleStatusChange(sub.id, e.target.value as any)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                      sub.status === 'selected'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : sub.status === 'completed'
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
                        : sub.status === 'pending_quote'
                        ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    <option value="contacted">Σε Επικοινωνία</option>
                    <option value="pending_quote">Αναμονή Προσφοράς</option>
                    <option value="selected">Επιλεγμένος</option>
                    <option value="completed">Ολοκληρώθηκε</option>
                  </select>
                </div>

                {/* Scope of Work Highlight Box */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 dark:border-amber-500/20">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider flex items-center gap-1 mb-1">
                    <DoorClosed size={12} />
                    <span>Εργασία Ανάθεσης:</span>
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white leading-snug">
                    {sub.workScope}
                  </p>
                </div>

                {/* Contact Quick Action Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {/* Primary Phone */}
                  <a
                    href={`tel:${rawCleanPhone}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 font-bold transition-all shadow-2xs"
                    title={`Κλήση: ${sub.phone}`}
                  >
                    <Phone size={13} />
                    <span className="truncate">{sub.phone}</span>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${waPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-2xs"
                    title="Άνοιγμα συνομιλίας WhatsApp"
                  >
                    <MessageSquare size={13} />
                    <span>WhatsApp</span>
                  </a>

                  {/* Copy Phone */}
                  <button
                    onClick={() => handleCopyPhone(sub.phone)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold transition-all border border-neutral-200 dark:border-neutral-700 col-span-2 sm:col-span-1"
                    title="Αντιγραφή αριθμού τηλεφώνου"
                  >
                    {copiedPhone === sub.phone ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedPhone === sub.phone ? 'Αντιγράφηκε' : 'Αντιγραφή'}</span>
                  </button>
                </div>

                {/* Notes box */}
                {sub.notes && (
                  <div className="p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800/80 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    <p className="text-[11px]">{sub.notes}</p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">
                  ID: <code className="font-mono">{sub.id}</code>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(sub)}
                    className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-indigo-600 dark:text-indigo-400 transition-colors"
                    title="Επεξεργασία στοιχείων"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(sub.id, sub.name)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Διαγραφή υπεργολάβου"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Subcontractor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-lg w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 rounded-xl">
                <Wrench size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                  {editingId ? 'Επεξεργασία Υπεργολάβου' : 'Προσθήκη Νέου Υπεργολάβου'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Στοιχεία επικοινωνίας, ειδικότητα και εργασία ανάθεσης.
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-300 font-semibold flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Όνομα Τεχνικού / Υπεργολάβου *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="π.χ. Σταύρος Χαραλάμπους"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Ειδικότητα / Συνεργείο *
                </label>
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Σιδεράς / Μεταλλικές Κατασκευές">Σιδεράς / Μεταλλικές Κατασκευές</option>
                  <option value="Αλουμινάς / Κουφώματα">Αλουμινάς / Κουφώματα</option>
                  <option value="Ηλεκτρολόγος Εγκαταστάτης">Ηλεκτρολόγος Εγκαταστάτης</option>
                  <option value="Υδραυλικός Εγκαταστάτης">Υδραυλικός Εγκαταστάτης</option>
                  <option value="Μονώσεις / Στεγανοποιήσεις">Μονώσεις / Στεγανοποιήσεις</option>
                  <option value="Γυψοσανίδες / Ψευδοροφές">Γυψοσανίδες / Ψευδοροφές</option>
                  <option value="Μπογιατζής / Βαφές">Μπογιατζής / Βαφές</option>
                  <option value="Ξυλουργός / Έπιπλα">Ξυλουργός / Έπιπλα</option>
                  <option value="Άλλο Συνεργείο">Άλλο Συνεργείο</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Εργασία Ανάθεσης (Work Scope) *
                </label>
                <input
                  type="text"
                  value={workScope}
                  onChange={(e) => {
                    setWorkScope(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="π.χ. Σιδεράς για πόρτες έξω του μικρού parking"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Τηλέφωνο Επικοινωνίας *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="π.χ. 99 643282"
                    className="w-full px-3 py-2 rounded-xl font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Κατάσταση
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="contacted">Σε Επικοινωνία</option>
                    <option value="pending_quote">Αναμονή Προσφοράς</option>
                    <option value="selected">Επιλεγμένος</option>
                    <option value="completed">Ολοκληρώθηκε</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Σημειώσεις
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Σημειώσεις, διαστάσεις, τιμές ή παρατηρήσεις..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

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
                  className="px-4 py-2 rounded-xl font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Αποθήκευση</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
