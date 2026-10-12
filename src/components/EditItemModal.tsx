import React, { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { Provision } from '../data/provisions';
import { ProcurementItem } from '../data/procurementItems';
import { GeneralRule } from '../data/generalRules';
import { ROOMS } from '../data/rooms';
import { CATEGORIES } from '../data/categories';
import { PROCUREMENT_CATEGORIES } from '../data/procurementCategories';

export type EditableItem = 
  | { type: 'provision'; data: Provision }
  | { type: 'procurement'; data: ProcurementItem }
  | { type: 'rule'; data: GeneralRule };

interface EditItemModalProps {
  item: EditableItem | null;
  onClose: () => void;
  onSaveProvision: (id: string, updates: Partial<Provision>) => void;
  onSaveProcurement: (id: string, updates: Partial<ProcurementItem>) => void;
  onSaveRule: (id: string, updates: Partial<GeneralRule>) => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  item,
  onClose,
  onSaveProvision,
  onSaveProcurement,
  onSaveRule
}) => {
  if (!item) return null;

  // Local state for provision
  const [pName, setPName] = useState('');
  const [pRoom, setPRoom] = useState('');
  const [pWall, setPWall] = useState('');
  const [pType, setPType] = useState('');
  const [pDetails, setPDetails] = useState('');
  const [pCompleted, setPCompleted] = useState(false);
  const [pPendingReview, setPPendingReview] = useState(false);

  // Local state for procurement item
  const [prName, setPrName] = useState('');
  const [prCategory, setPrCategory] = useState('');
  const [prBrand, setPrBrand] = useState('');
  const [prModel, setPrModel] = useState('');
  const [prPrice, setPrPrice] = useState<string>('');
  const [prPriceRange, setPrPriceRange] = useState('');
  const [prQuantity, setPrQuantity] = useState(1);
  const [prUnit, setPrUnit] = useState('τεμ.');
  const [prRooms, setPrRooms] = useState('');
  const [prIsTask, setPrIsTask] = useState(false);
  const [prTaskDesc, setPrTaskDesc] = useState('');
  const [prNotes, setPrNotes] = useState('');
  const [prLink, setPrLink] = useState('');
  const [prPurchased, setPrPurchased] = useState(false);

  // Local state for general rule
  const [rTitle, setRTitle] = useState('');
  const [rCategory, setRCategory] = useState<GeneralRule['category']>('🔌 Πρίζες & Διακόπτες');
  const [rScope, setRScope] = useState('');
  const [rRule, setRRule] = useState('');
  const [rCritical, setRCritical] = useState('');
  const [rNotes, setRNotes] = useState('');

  useEffect(() => {
    if (item.type === 'provision') {
      setPName(item.data.name);
      setPRoom(item.data.room);
      setPWall(item.data.wall || '');
      setPType(item.data.type);
      setPDetails(item.data.details || '');
      setPCompleted(item.data.completed);
      setPPendingReview(Boolean(item.data.pendingReview));
    } else if (item.type === 'procurement') {
      setPrName(item.data.name);
      setPrCategory(item.data.category);
      setPrBrand(item.data.brand || '');
      setPrModel(item.data.model || '');
      setPrPrice(item.data.estimatedPriceEur !== null && item.data.estimatedPriceEur !== undefined ? String(item.data.estimatedPriceEur) : '');
      setPrPriceRange(item.data.priceRange || '');
      setPrQuantity(item.data.quantity);
      setPrUnit(item.data.unit);
      setPrRooms(item.data.rooms.join(', '));
      setPrIsTask(item.data.isTask);
      setPrTaskDesc(item.data.taskDescription || '');
      setPrNotes(item.data.notes);
      setPrLink(item.data.link || '');
      setPrPurchased(item.data.purchased);
    } else if (item.type === 'rule') {
      setRTitle(item.data.title);
      setRCategory(item.data.category);
      setRScope(item.data.scope);
      setRRule(item.data.rule);
      setRCritical(item.data.criticalRequirement);
      setRNotes(item.data.notes);
    }
  }, [item]);

  const handleSave = () => {
    if (item.type === 'provision') {
      onSaveProvision(item.data.id, {
        name: pName.trim(),
        room: pRoom,
        wall: pWall.trim(),
        type: pType,
        details: pDetails.trim() || undefined,
        completed: pCompleted,
        pendingReview: pPendingReview
      });
    } else if (item.type === 'procurement') {
      const parsedPrice = prPrice.trim() ? parseFloat(prPrice.trim()) : null;
      const roomsArr = prRooms
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      onSaveProcurement(item.data.id, {
        name: prName.trim(),
        category: prCategory,
        brand: prBrand.trim() || undefined,
        model: prModel.trim() || undefined,
        estimatedPriceEur: isNaN(parsedPrice as number) ? null : parsedPrice,
        priceRange: prPriceRange.trim() || undefined,
        quantity: prQuantity,
        unit: prUnit.trim() || 'τεμ.',
        rooms: roomsArr,
        isTask: prIsTask,
        taskDescription: prTaskDesc.trim() || undefined,
        notes: prNotes.trim(),
        link: prLink.trim() || undefined,
        purchased: prPurchased
      });
    } else if (item.type === 'rule') {
      onSaveRule(item.data.id, {
        title: rTitle.trim(),
        category: rCategory,
        scope: rScope.trim(),
        rule: rRule.trim(),
        criticalRequirement: rCritical.trim(),
        notes: rNotes.trim()
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/40">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              SQLite Επεξεργασία &middot; {item.type === 'provision' ? 'Πρόνοια' : item.type === 'procurement' ? 'Εξοπλισμός / Αγορά' : 'Κανόνας'}
            </span>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {item.type === 'provision' ? pName || 'Επεξεργασία Πρόνοιας' : item.type === 'procurement' ? prName || 'Επεξεργασία Εξοπλισμού' : rTitle || 'Επεξεργασία Κανόνα'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* PROVISION FORM */}
          {item.type === 'provision' && (
            <>
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Όνομα Πρόνοιας *
                </label>
                <input
                  type="text"
                  value={pName}
                  onChange={e => setPName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Δωμάτιο / Χώρος *
                  </label>
                  <select
                    value={pRoom}
                    onChange={e => setPRoom(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  >
                    {ROOMS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Τοίχος / Θέση Τοποθέτησης
                  </label>
                  <input
                    type="text"
                    value={pWall}
                    onChange={e => setPWall(e.target.value)}
                    placeholder="π.χ. Τοίχος Νιπτήρα, Οροφή..."
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Κατηγορία *
                </label>
                <select
                  value={pType}
                  onChange={e => setPType(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Λεπτομέρειες / Τεχνικές Οδηγίες
                </label>
                <textarea
                  rows={3}
                  value={pDetails}
                  onChange={e => setPDetails(e.target.value)}
                  placeholder="Επιπλέον οδηγίες, προδιαγραφές, ή απαιτήσεις..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Status Toggles in SQLite */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pCompleted}
                    onChange={e => setPCompleted(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`p-1 rounded-full ${pCompleted ? 'text-emerald-500' : 'text-neutral-400'}`}>
                    {pCompleted ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Ολοκληρωμένη Πρόνοια (Completed)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pPendingReview}
                    onChange={e => setPPendingReview(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`p-1 rounded-full ${pPendingReview ? 'text-amber-500' : 'text-neutral-400'}`}>
                    <AlertTriangle size={18} />
                  </div>
                  <span className="font-semibold text-amber-700 dark:text-amber-400">
                    Εκκρεμεί / Σε Αναμονή (TBD)
                  </span>
                </label>
              </div>
            </>
          )}

          {/* PROCUREMENT FORM */}
          {item.type === 'procurement' && (
            <>
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Τίτλος Συσκευής / Υλικού / Εργασίας *
                </label>
                <input
                  type="text"
                  value={prName}
                  onChange={e => setPrName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Κατηγορία *
                  </label>
                  <select
                    value={prCategory}
                    onChange={e => setPrCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  >
                    {PROCUREMENT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Μάρκα (Brand)
                  </label>
                  <input
                    type="text"
                    value={prBrand}
                    onChange={e => setPrBrand(e.target.value)}
                    placeholder="π.χ. Aqara, Shelly, UniFi..."
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Μοντέλο (Model)
                  </label>
                  <input
                    type="text"
                    value={prModel}
                    onChange={e => setPrModel(e.target.value)}
                    placeholder="π.χ. FP2 Presence..."
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Τιμή Μονάδας (€)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={prPrice}
                    onChange={e => setPrPrice(e.target.value)}
                    placeholder="π.χ. 85"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Εύρος Τιμής
                  </label>
                  <input
                    type="text"
                    value={prPriceRange}
                    onChange={e => setPrPriceRange(e.target.value)}
                    placeholder="π.χ. €75 - €95"
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Ποσότητα
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prQuantity}
                    onChange={e => setPrQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Μονάδα Μέτρησης
                  </label>
                  <input
                    type="text"
                    value={prUnit}
                    onChange={e => setPrUnit(e.target.value)}
                    placeholder="τεμ., μέτρα, σετ..."
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Χώροι Τοποθέτησης (χωρισμένοι με κόμμα)
                </label>
                <input
                  type="text"
                  value={prRooms}
                  onChange={e => setPrRooms(e.target.value)}
                  placeholder="π.χ. Σαλόνι, Κουζίνα, Γραφείο..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Σύνδεσμος Προϊόντος (URL)
                </label>
                <input
                  type="url"
                  value={prLink}
                  onChange={e => setPrLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Τεχνικές Σημειώσεις
                </label>
                <textarea
                  rows={2}
                  value={prNotes}
                  onChange={e => setPrNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Task check */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-950/60 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={prIsTask}
                    onChange={e => setPrIsTask(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="font-bold text-amber-700 dark:text-amber-400">
                    Είναι Εργασία Έρευνας (Task to Find);
                  </span>
                </label>

                {prIsTask && (
                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Οδηγίες / Τι απαιτείται να ερευνηθεί:
                    </label>
                    <textarea
                      rows={2}
                      value={prTaskDesc}
                      onChange={e => setPrTaskDesc(e.target.value)}
                      placeholder="Συνεννόηση με τεχνικό, διαστάσεις, επιλογή..."
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Purchased checkbox */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={prPurchased}
                    onChange={e => setPrPurchased(e.target.checked)}
                    className="hidden"
                  />
                  <div className={`p-1 rounded-full ${prPurchased ? 'text-emerald-500' : 'text-neutral-400'}`}>
                    {prPurchased ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Κατάσταση: {prPurchased ? 'Αγοράστηκε (Purchased)' : 'Εκκρεμεί Αγορά'}
                  </span>
                </label>
              </div>
            </>
          )}

          {/* GENERAL RULE FORM */}
          {item.type === 'rule' && (
            <>
              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Τίτλος Κανόνα *
                </label>
                <input
                  type="text"
                  value={rTitle}
                  onChange={e => setRTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Κατηγορία *
                  </label>
                  <select
                    value={rCategory}
                    onChange={e => setRCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="🔌 Πρίζες & Διακόπτες">🔌 Πρίζες & Διακόπτες</option>
                    <option value="📡 Smart Home & Δίκτυο">📡 Smart Home & Δίκτυο</option>
                    <option value="🔒 Ασφάλεια">🔒 Ασφάλεια</option>
                    <option value="🚰 Υδραυλικά & HVAC">🚰 Υδραυλικά & HVAC</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Πεδίο Εφαρμογής (Scope)
                  </label>
                  <input
                    type="text"
                    value={rScope}
                    onChange={e => setRScope(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Κανόνας
                </label>
                <textarea
                  rows={2}
                  value={rRule}
                  onChange={e => setRRule(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Κρίσιμη Απαίτηση
                </label>
                <textarea
                  rows={2}
                  value={rCritical}
                  onChange={e => setRCritical(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Σημειώσεις
                </label>
                <textarea
                  rows={2}
                  value={rNotes}
                  onChange={e => setRNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>
          )}

        </div>

        {/* Footer actions */}
        <div className="px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/40">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
            Οι αλλαγές καταγράφονται στο ιστορικό SQLite και επιτρέπουν άμεση αναίρεση (Undo).
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Ακύρωση
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Save size={14} />
              <span>Αποθήκευση στη Βάση</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
