import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone, 
  Globe, 
  Mail, 
  MapPin, 
  Plus, 
  Trash2, 
  Pencil, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageSquare, 
  X, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { CivilEngineer, INITIAL_CIVIL_ENGINEERS } from '../data/partnersData';

const STORAGE_KEY = 'house_civil_engineers_v1';

export interface CivilEngineersSectionProps {
  isAdmin?: boolean;
}

export const CivilEngineersSection: React.FC<CivilEngineersSectionProps> = ({ isAdmin = false }) => {
  const [engineers, setEngineers] = useState<CivilEngineer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load civil engineers from localStorage', e);
    }
    return INITIAL_CIVIL_ENGINEERS;
  });

  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [firmName, setFirmName] = useState('');
  const [role, setRole] = useState('Πολιτικός / Δομοστατικός Μηχανικός');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [principalsStr, setPrincipalsStr] = useState('');
  const [specialtiesStr, setSpecialtiesStr] = useState('');
  const [status, setStatus] = useState<CivilEngineer['status']>('pending_offer');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(engineers));
    } catch (e) {
      console.error('Failed to save civil engineers', e);
    }
  }, [engineers]);

  const handleCopyPhone = (ph: string) => {
    navigator.clipboard.writeText(ph.replace(/\s+/g, ''));
    setCopiedPhone(ph);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setFirmName('');
    setRole('Πολιτικός / Δομοστατικός Μηχανικός');
    setPhone('');
    setAltPhone('');
    setEmail('');
    setWebsite('');
    setAddress('');
    setPrincipalsStr('');
    setSpecialtiesStr('Στατική & Δυναμική Μελέτη, Αντισεισμικός Σχεδιασμός, Επιβλέψεις');
    setStatus('pending_offer');
    setNotes('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (eng: CivilEngineer) => {
    setEditingId(eng.id);
    setName(eng.name);
    setFirmName(eng.firmName || '');
    setRole(eng.role);
    setPhone(eng.phone);
    setAltPhone(eng.altPhone || '');
    setEmail(eng.email || '');
    setWebsite(eng.website || '');
    setAddress(eng.address || '');
    setPrincipalsStr(eng.principals ? eng.principals.join(', ') : '');
    setSpecialtiesStr(eng.specialties.join(', '));
    setStatus(eng.status);
    setNotes(eng.notes);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, engName: string) => {
    if (confirm(`Είστε βέβαιοι ότι θέλετε να διαγράψετε την εγγραφή για "${engName}";`)) {
      setEngineers(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleStatusChange = (id: string, newStatus: CivilEngineer['status']) => {
    let label = 'Υπό Επικοινωνία / Προσφορά';
    if (newStatus === 'contacted') label = 'Σε Επικοινωνία';
    if (newStatus === 'reviewing') label = 'Υπό Αξιολόγηση';
    if (newStatus === 'selected') label = 'Επιλεγμένος Μελετητής';

    setEngineers(prev => prev.map(e => e.id === id ? { ...e, status: newStatus, statusLabel: label } : e));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Παρακαλώ εισάγετε όνομα μηχανικού ή γραφείου.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Παρακαλώ εισάγετε τηλέφωνο επικοινωνίας.');
      return;
    }

    let statusLabel = 'Υπό Επικοινωνία / Προσφορά';
    if (status === 'contacted') statusLabel = 'Σε Επικοινωνία';
    if (status === 'reviewing') statusLabel = 'Υπό Αξιολόγηση';
    if (status === 'selected') statusLabel = 'Επιλεγμένος Μελετητής';

    const cleanPrincipals = principalsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const cleanSpecialties = specialtiesStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingId) {
      setEngineers(prev => prev.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            name: name.trim(),
            firmName: firmName.trim() || undefined,
            role: role.trim(),
            phone: phone.trim(),
            altPhone: altPhone.trim() || undefined,
            email: email.trim() || undefined,
            website: website.trim() || undefined,
            address: address.trim() || undefined,
            principals: cleanPrincipals.length > 0 ? cleanPrincipals : undefined,
            specialties: cleanSpecialties.length > 0 ? cleanSpecialties : item.specialties,
            status,
            statusLabel,
            notes: notes.trim()
          };
        }
        return item;
      }));
    } else {
      const newEng: CivilEngineer = {
        id: `civil_${Date.now()}`,
        name: name.trim(),
        firmName: firmName.trim() || undefined,
        role: role.trim(),
        phone: phone.trim(),
        altPhone: altPhone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        address: address.trim() || undefined,
        principals: cleanPrincipals.length > 0 ? cleanPrincipals : undefined,
        specialties: cleanSpecialties.length > 0 ? cleanSpecialties : ['Στατική Μελέτη', 'Αντισεισμικός Σχεδιασμός'],
        status,
        statusLabel,
        notes: notes.trim()
      };
      setEngineers(prev => [...prev, newEng]);
    }

    setIsModalOpen(false);
  };

  const handleResetToDefaults = () => {
    if (confirm('Επαναφορά των αρχικών στοιχείων Πολιτικών Μηχανικών (Πόλυς Παπαχριστοφόρου & D&K EPS);')) {
      setEngineers(INITIAL_CIVIL_ENGINEERS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CIVIL_ENGINEERS));
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-900/40">
              <Building2 size={20} />
            </div>
            <h2 className="text-base sm:text-lg font-black text-neutral-900 dark:text-white">
              Πολιτικοί & Δομοστατικοί Μηχανικοί (Civil / Structural)
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-300 dark:border-indigo-900/60">
              {engineers.length} Γραφεία
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
            Στατική και δυναμική ανάλυση, αντισεισμικός σχεδιασμός φέροντος οργανισμού (οπλισμένο σκυρόδεμα / χάλυβας), γεωτεχνικός έλεγχος θεμελίωσης και επιβλέψεις κατασκευής.
          </p>
        </div>

        {isAdmin && (
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-98"
            >
              <Plus size={15} />
              <span>+ Νέος Πολιτικός Μηχανικός</span>
            </button>
          </div>
        )}
      </div>

      {/* Engineer Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {engineers.map(eng => {
          const rawCleanPhone = eng.phone.replace(/[^0-9+]/g, '');
          const waPhone = rawCleanPhone.startsWith('+') ? rawCleanPhone.replace('+', '') : rawCleanPhone.length === 8 ? `357${rawCleanPhone}` : rawCleanPhone;

          return (
            <div
              key={eng.id}
              className="bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                {/* Header Row: Title & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-sm sm:text-base text-neutral-900 dark:text-white truncate">
                        {eng.name}
                      </h3>
                      {eng.firmName && (
                        <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                          ({eng.firmName})
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                      {eng.role}
                    </p>
                  </div>

                  {/* Status Dropdown / Badge */}
                  {isAdmin ? (
                    <select
                      value={eng.status}
                      onChange={(e) => handleStatusChange(eng.id, e.target.value as any)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${
                        eng.status === 'selected'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : eng.status === 'reviewing'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      <option value="pending_offer">Υπό Επικοινωνία / Προσφορά</option>
                      <option value="contacted">Σε Επικοινωνία</option>
                      <option value="reviewing">Υπό Αξιολόγηση</option>
                      <option value="selected">Επιλεγμένος Μελετητής</option>
                    </select>
                  ) : (
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                        eng.status === 'selected'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : eng.status === 'reviewing'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {eng.status === 'selected'
                        ? 'Επιλεγμένος Μελετητής'
                        : eng.status === 'reviewing'
                        ? 'Υπό Αξιολόγηση'
                        : eng.status === 'contacted'
                        ? 'Σε Επικοινωνία'
                        : 'Υπό Επικοινωνία / Προσφορά'}
                    </span>
                  )}
                </div>

                {/* Key Principals / Directors if available */}
                {eng.principals && eng.principals.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950/60 border border-neutral-200 dark:border-neutral-800 text-xs">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                      Διευθυντές / Κύριοι Μελετητές:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {eng.principals.map((pr, idx) => (
                        <span key={idx} className="font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 text-[11px]">
                          {pr}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Quick Action Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {/* Primary Phone */}
                  <a
                    href={`tel:${rawCleanPhone}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 font-bold transition-all shadow-2xs"
                    title={`Κλήση: ${eng.phone}`}
                  >
                    <Phone size={13} />
                    <span className="truncate">{eng.phone}</span>
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
                    onClick={() => handleCopyPhone(eng.phone)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold transition-all border border-neutral-200 dark:border-neutral-700"
                    title="Αντιγραφή αριθμού τηλεφώνου"
                  >
                    {copiedPhone === eng.phone ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedPhone === eng.phone ? 'Αντιγράφηκε' : 'Αντιγραφή'}</span>
                  </button>

                  {/* Website if present */}
                  {eng.website ? (
                    <a
                      href={eng.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold transition-all"
                      title={eng.website}
                    >
                      <Globe size={13} />
                      <span className="truncate">Ιστοσελίδα</span>
                      <ExternalLink size={10} className="opacity-70" />
                    </a>
                  ) : (
                    <div className="flex items-center justify-center text-[11px] text-neutral-400 py-2 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                      -
                    </div>
                  )}
                </div>

                {/* Secondary details (Alt phone, Email, Address) */}
                <div className="space-y-1.5 pt-1 text-xs">
                  {eng.altPhone && (
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <Phone size={12} className="text-neutral-400 flex-shrink-0" />
                      <span className="font-semibold text-neutral-500">Δευτερεύον Τηλ:</span>
                      <a href={`tel:${eng.altPhone.replace(/[^0-9+]/g, '')}`} className="font-mono text-neutral-800 dark:text-neutral-200 hover:underline">
                        {eng.altPhone}
                      </a>
                    </div>
                  )}
                  {eng.email && (
                    <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <Mail size={12} className="text-neutral-400 flex-shrink-0" />
                      <span className="font-semibold text-neutral-500">Email:</span>
                      <a href={`mailto:${eng.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline truncate">
                        {eng.email}
                      </a>
                    </div>
                  )}
                  {eng.address && (
                    <div className="flex items-start gap-1.5 text-neutral-600 dark:text-neutral-400">
                      <MapPin size={12} className="text-neutral-400 flex-shrink-0 mt-0.5" />
                      <span className="font-semibold text-neutral-500">Διεύθυνση:</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eng.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-neutral-700 dark:text-neutral-300"
                      >
                        {eng.address} ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* Specialties tags */}
                {eng.specialties && eng.specialties.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block mb-1">
                      Τομείς Μελέτης & Εξειδίκευση:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {eng.specialties.map((spec, sidx) => (
                        <span
                          key={sidx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/80"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes box */}
                {eng.notes && (
                  <div className="p-3 rounded-xl bg-neutral-50/80 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800/80 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    <p className="text-[11px]">{eng.notes}</p>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">
                  ID: <code className="font-mono">{eng.id}</code>
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(eng)}
                      className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-indigo-600 dark:text-indigo-400 transition-colors"
                      title="Επεξεργασία στοιχείων"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(eng.id, eng.name)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Διαγραφή εγγραφής"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create or Edit Civil Engineer */}
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
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Building2 size={22} />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-white">
                  {editingId ? 'Επεξεργασία Πολιτικού Μηχανικού' : 'Προσθήκη Νέου Πολιτικού Μηχανικού'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Στοιχεία επικοινωνίας, γραφείο, τομείς μελέτης και σημειώσεις.
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
                  Όνομα Μηχανικού / Γραφείου *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder="π.χ. Πόλυς Παπαχριστοφόρου ή D&K E.P.S. L.L.C."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Επωνυμία Εταιρείας (Προαιρετικό)
                  </label>
                  <input
                    type="text"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="π.χ. D&K Earthquake Protected Structures"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Ρόλος / Ειδικότητα
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Πολιτικός / Δομοστατικός Μηχανικός"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Κύριο Τηλέφωνο *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="π.χ. 99 533660 ή 22 495133"
                    className="w-full px-3 py-2 rounded-xl font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Δευτερεύον Τηλ / Άλλο Γραφείο
                  </label>
                  <input
                    type="text"
                    value={altPhone}
                    onChange={(e) => setAltPhone(e.target.value)}
                    placeholder="π.χ. 25 770978"
                    className="w-full px-3 py-2 rounded-xl font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="earth@spidernet.com.cy"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                    Ιστοσελίδα (URL)
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://dkeps.com/"
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Διεύθυνση Γραφείου
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="π.χ. Οδός Αθηνών 111, 2035 Στρόβολος, Λευκωσία"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Υπεύθυνοι / Διευθυντές (χωρισμένοι με κόμμα)
                </label>
                <input
                  type="text"
                  value={principalsStr}
                  onChange={(e) => setPrincipalsStr(e.target.value)}
                  placeholder="π.χ. Νίκος Καλαθάς, Γεώργιος Δημητριάδης"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Τομείς Μελέτης / Εξειδίκευση (χωρισμένοι με κόμμα)
                </label>
                <input
                  type="text"
                  value={specialtiesStr}
                  onChange={(e) => setSpecialtiesStr(e.target.value)}
                  placeholder="Στατική Μελέτη, Αντισεισμικός Σχεδιασμός, Επιβλέψεις"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Κατάσταση
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="pending_offer">Υπό Επικοινωνία / Προσφορά</option>
                  <option value="contacted">Σε Επικοινωνία</option>
                  <option value="reviewing">Υπό Αξιολόγηση</option>
                  <option value="selected">Επιλεγμένος Μελετητής</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                  Σημειώσεις
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Σημειώσεις σχετικά με την προσφορά ή τις συναντήσεις..."
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-indigo-500"
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
                  className="px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
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
