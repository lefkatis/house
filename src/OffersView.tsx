import { useState, useEffect } from 'react';
import { 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Eye, 
  FolderOpen, 
  Edit3, 
  Check, 
  Scale,
  Receipt,
  Download,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { INITIAL_VENDOR_OFFERS, VendorOffer, OfferDocument } from './data/offersData';
import { getAssetUrl } from './utils/assets';

const STORAGE_KEY = 'pronies_vendor_offers_v2';

export default function OffersView() {
  const [offers, setOffers] = useState<VendorOffer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load offers from localStorage', e);
    }
    return INITIAL_VENDOR_OFFERS;
  });

  const [selectedVendorId, setSelectedVendorId] = useState<string>('vendor_2');
  const [activeDocId, setActiveDocId] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showAddDocModal, setShowAddDocModal] = useState<boolean>(false);
  const [viewMode, setSubViewMode] = useState<'details' | 'compare'>('details');

  // Form state for adding document
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<'mechanical' | 'electrical' | 'combined' | 'other'>('mechanical');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocNotes, setNewDocNotes] = useState('');

  // Persist offers
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
    } catch (e) {
      console.error('Failed to persist offers', e);
    }
  }, [offers]);

  const currentVendor = offers.find(o => o.id === selectedVendorId) || offers[0];

  // If activeDocId doesn't belong to current vendor, select the first doc
  useEffect(() => {
    if (currentVendor.documents.length > 0) {
      if (!currentVendor.documents.some(d => d.id === activeDocId)) {
        setActiveDocId(currentVendor.documents[0].id);
      }
    } else {
      setActiveDocId('');
    }
  }, [selectedVendorId, currentVendor, activeDocId]);

  const currentDoc = currentVendor.documents.find(d => d.id === activeDocId) || currentVendor.documents[0];

  // Helper to update vendor field
  const updateCurrentVendor = (updates: Partial<VendorOffer>) => {
    setOffers(prev => prev.map(o => o.id === currentVendor.id ? { ...o, ...updates } : o));
  };

  // Handle local PDF upload
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileUrl = URL.createObjectURL(file);
    const newDoc: OfferDocument = {
      id: `doc_local_${Date.now()}`,
      title: file.name.replace(/\.pdf$/i, ''),
      type: newDocType,
      fileName: file.name,
      driveViewUrl: fileUrl,
      drivePreviewUrl: fileUrl,
      localFileUrl: fileUrl,
      uploadDate: new Date().toLocaleDateString('el-GR'),
      notes: newDocNotes || 'Τοπικό αρχείο PDF που ανέβηκε από τη συσκευή.'
    };

    updateCurrentVendor({
      documents: [...currentVendor.documents, newDoc]
    });
    setActiveDocId(newDoc.id);
    setShowAddDocModal(false);
    resetNewDocForm();
  };

  // Handle adding doc via Drive Link
  const handleAddDriveDoc = () => {
    if (!newDocTitle.trim() || !newDocUrl.trim()) return;

    let previewUrl = newDocUrl.trim();
    if (previewUrl.includes('/view')) {
      previewUrl = previewUrl.replace(/\/view.*/, '/preview');
    }

    const newDoc: OfferDocument = {
      id: `doc_link_${Date.now()}`,
      title: newDocTitle.trim(),
      type: newDocType,
      fileName: `${newDocTitle.trim()}.pdf`,
      driveViewUrl: newDocUrl.trim(),
      drivePreviewUrl: previewUrl,
      uploadDate: new Date().toLocaleDateString('el-GR'),
      notes: newDocNotes.trim()
    };

    updateCurrentVendor({
      documents: [...currentVendor.documents, newDoc]
    });
    setActiveDocId(newDoc.id);
    setShowAddDocModal(false);
    resetNewDocForm();
  };

  const resetNewDocForm = () => {
    setNewDocTitle('');
    setNewDocUrl('');
    setNewDocNotes('');
  };

  const removeDocument = (docId: string) => {
    if (confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το έγγραφο;')) {
      const remaining = currentVendor.documents.filter(d => d.id !== docId);
      updateCurrentVendor({ documents: remaining });
      if (remaining.length > 0) {
        setActiveDocId(remaining[0].id);
      } else {
        setActiveDocId('');
      }
    }
  };

  // Stats calculation
  const totalOffersCount = offers.length;
  const receivedOffersCount = offers.filter(o => o.status === 'received' || o.documents.length > 0).length;
  const totalPdfsCount = offers.reduce((acc, curr) => acc + curr.documents.length, 0);

  return (
    <div className="flex-1 w-full flex flex-col gap-4 overflow-y-auto max-h-[85vh] pr-1">
      
      {/* Top Banner / Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        
        {/* Total Vendors */}
        <div className="bg-white/80 dark:bg-gradient-to-br dark:from-indigo-950/60 dark:to-neutral-900/90 border border-neutral-200 dark:border-indigo-800/40 rounded-xl p-3 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Προσφορές Μελετών</span>
            <FolderOpen size={16} />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {totalOffersCount} <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">Γραφεία</span>
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            {receivedOffersCount} διαθέσιμες προσφορές
          </div>
        </div>

        {/* Total PDFs */}
        <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Συνημμένα Τεύχη PDF</span>
            <FileText size={16} />
          </div>
          <div className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            {totalPdfsCount} <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">έγγραφα</span>
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
            Μηχανολογικά, Ηλεκτρολογικά & ΠΕΑ
          </div>
        </div>

        {/* Current Active Vendor */}
        <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-md backdrop-blur-md">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Επιλεγμένος Μελετητής</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-base font-bold text-neutral-900 dark:text-emerald-300 tracking-tight truncate">
            {currentVendor.vendorName}
          </div>
          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 truncate">
            {currentVendor.referenceCode ? `Κωδ: ${currentVendor.referenceCode}` : 'Χωρίς κωδικό'} • {currentVendor.statusLabel}
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-white/80 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 shadow-md backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Προβολή</span>
            <Scale size={16} />
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-950/80 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => setSubViewMode('details')}
              className={`flex-1 py-1 px-2 rounded text-xs font-semibold transition-all ${
                viewMode === 'details' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              PDF & Τιμές
            </button>
            <button
              onClick={() => setSubViewMode('compare')}
              className={`flex-1 py-1 px-2 rounded text-xs font-semibold transition-all ${
                viewMode === 'compare' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Σύγκριση Μελετητών
            </button>
          </div>
        </div>

      </div>

      {/* Main Vendor Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2 overflow-x-auto flex-shrink-0">
        {offers.map(vendor => {
          const isSelected = selectedVendorId === vendor.id;
          const hasDocs = vendor.documents.length > 0;
          return (
            <button
              key={vendor.id}
              onClick={() => {
                setSelectedVendorId(vendor.id);
                setSubViewMode('details');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                isSelected && viewMode === 'details'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <span>{vendor.vendorName}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isSelected && viewMode === 'details'
                  ? 'bg-white/20 text-white'
                  : hasDocs 
                  ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40' 
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
              }`}>
                {hasDocs ? `${vendor.documents.length} PDF` : 'Αναμονή'}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setSubViewMode('compare')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ml-auto ${
            viewMode === 'compare'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-white dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Scale size={14} />
          <span>Συγκριτικός Πίνακας</span>
        </button>
      </div>

      {/* View Content: Details with PDF vs Compare Table */}
      {viewMode === 'compare' ? (
        /* COMPARISON TABLE */
        <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Scale size={18} className="text-purple-500" />
                Συγκριτικός Πίνακας Προσφορών Μελετών
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Σύγκριση παραδοτέων, κόστους και τεχνικών προδιαγραφών μεταξύ των 3 γραφείων μελετών.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Κριτήριο / Πεδίο</th>
                  {offers.map(v => (
                    <th key={v.id} className="py-3 px-4 min-w-[220px]">
                      <div className="font-bold text-neutral-900 dark:text-neutral-100 text-xs">{v.vendorName}</div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 normal-case">{v.referenceCode || '-'}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                {/* Status */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-700 dark:text-neutral-300">Κατάσταση Προσφοράς</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        v.status === 'received' || v.documents.length > 0
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40'
                      }`}>
                        {v.status === 'received' || v.documents.length > 0 ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {v.statusLabel}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Electrical Cost */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-700 dark:text-neutral-300">Ηλεκτρολογική Μελέτη (€)</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                      {v.electricalCostEur ? `€${v.electricalCostEur.toLocaleString()}` : <span className="text-neutral-400 italic">Εκκρεμεί</span>}
                    </td>
                  ))}
                </tr>

                {/* Mechanical Cost */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-700 dark:text-neutral-300">Μηχανολογική Μελέτη (€)</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                      {v.mechanicalCostEur ? `€${v.mechanicalCostEur.toLocaleString()}` : <span className="text-neutral-400 italic">Εκκρεμεί</span>}
                    </td>
                  ))}
                </tr>

                {/* Energy Performance Certificate */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-700 dark:text-neutral-300">Πιστοποιητικό Ενέργειας (ΠΕΑ)</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4 font-semibold text-neutral-800 dark:text-neutral-200">
                      {v.energyCertCostEur ? `€${v.energyCertCostEur.toLocaleString()}` : <span className="text-neutral-400 italic">Εκκρεμεί</span>}
                    </td>
                  ))}
                </tr>

                {/* Total Cost */}
                <tr className="bg-neutral-50 dark:bg-neutral-950/60">
                  <td className="py-3.5 px-3 font-bold text-neutral-900 dark:text-white">Συνολικό Κόστος (χωρίς ΦΠΑ)</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3.5 px-4 font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {v.totalCostEur ? `€${v.totalCostEur.toLocaleString()}` : <span className="text-xs text-neutral-400 font-normal italic">Υπό διαμόρφωση</span>}
                    </td>
                  ))}
                </tr>

                {/* Scope */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-700 dark:text-neutral-300">Αντικείμενο Μελετών</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {v.scope.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* PDFs count & links */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-700 dark:text-neutral-300">Έγγραφα & PDFs</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4">
                      {v.documents.length > 0 ? (
                        <div className="space-y-1">
                          {v.documents.map(d => (
                            <a
                              key={d.id}
                              href={d.driveViewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                            >
                              <FileText size={12} />
                              <span className="truncate max-w-[180px]">{d.title}</span>
                              <ExternalLink size={10} />
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Δεν έχουν επισυναφθεί</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Delivery Time */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-700 dark:text-neutral-300">Χρόνος Παράδοσης</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                      {v.deliveryTimeWeeks || 'Εκκρεμεί'}
                    </td>
                  ))}
                </tr>

                {/* Action */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-700 dark:text-neutral-300">Ενέργειες</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedVendorId(v.id);
                          setSubViewMode('details');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white font-semibold transition-all inline-flex items-center gap-1.5 border border-indigo-500/30"
                      >
                        <Eye size={12} />
                        <span>Προβολή Προσφοράς</span>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VENDOR DETAILS & PDF VIEWER */
        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[500px]">
          
          {/* Left Panel: Vendor Info, Sub-Tabs & Detailed Pricing */}
          <div className="w-full lg:w-96 flex flex-col gap-3 flex-shrink-0">
            
            {/* Vendor Profile Card */}
            <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-md backdrop-blur-md">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-black text-neutral-900 dark:text-white leading-tight">
                    {currentVendor.vendorName}
                  </h3>
                  {currentVendor.referenceCode && (
                    <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                      Ref: {currentVendor.referenceCode}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    isEditing 
                      ? 'bg-emerald-600 text-white border-emerald-500' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                  title={isEditing ? 'Αποθήκευση' : 'Επεξεργασία Στοιχείων'}
                >
                  {isEditing ? <Check size={14} /> : <Edit3 size={14} />}
                </button>
              </div>

              {/* Editable or View Mode Details */}
              {isEditing ? (
                <div className="space-y-2 mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase">Όνομα Μελετητή</label>
                    <input 
                      type="text" 
                      value={currentVendor.vendorName} 
                      onChange={(e) => updateCurrentVendor({ vendorName: e.target.value })}
                      className="w-full mt-0.5 px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase">Κωδικός Προσφοράς</label>
                    <input 
                      type="text" 
                      value={currentVendor.referenceCode || ''} 
                      onChange={(e) => updateCurrentVendor({ referenceCode: e.target.value })}
                      className="w-full mt-0.5 px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase">Ηλεκτρ. (€)</label>
                      <input 
                        type="number" 
                        value={currentVendor.electricalCostEur || ''} 
                        onChange={(e) => updateCurrentVendor({ electricalCostEur: Number(e.target.value) || null })}
                        className="w-full mt-0.5 px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase">Μηχαν. (€)</label>
                      <input 
                        type="number" 
                        value={currentVendor.mechanicalCostEur || ''} 
                        onChange={(e) => updateCurrentVendor({ mechanicalCostEur: Number(e.target.value) || null })}
                        className="w-full mt-0.5 px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 mt-2.5 pt-2.5 border-t border-neutral-200 dark:border-neutral-800 text-xs">
                  <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                    <span className="text-neutral-500 dark:text-neutral-400">Κατάσταση:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentVendor.statusLabel}</span>
                  </div>

                  {currentVendor.phone && (
                    <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                      <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                        <Phone size={11} /> Τηλέφωνο:
                      </span>
                      <a href={`tel:${currentVendor.phone}`} className="font-semibold hover:underline">
                        {currentVendor.phone}
                      </a>
                    </div>
                  )}

                  {currentVendor.email && (
                    <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                      <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                        <Mail size={11} /> Email:
                      </span>
                      <a href={`mailto:${currentVendor.email}`} className="font-mono text-[11px] truncate max-w-[180px] hover:underline">
                        {currentVendor.email}
                      </a>
                    </div>
                  )}

                  {currentVendor.address && (
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 flex items-start gap-1">
                      <MapPin size={12} className="flex-shrink-0 mt-0.5" />
                      <span>{currentVendor.address}</span>
                    </div>
                  )}

                  <p className="text-neutral-600 dark:text-neutral-400 text-[11px] leading-relaxed pt-2 border-t border-neutral-200 dark:border-neutral-800/60">
                    {currentVendor.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Documents List & Sub-Tabs */}
            <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-md backdrop-blur-md flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-600 dark:text-indigo-400" />
                  Τεύχη & Έγγραφα ({currentVendor.documents.length})
                </span>
                <button
                  onClick={() => setShowAddDocModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-700 dark:text-indigo-200 hover:text-white text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Προσθήκη PDF</span>
                </button>
              </div>

              {currentVendor.documents.length > 0 ? (
                <div className="space-y-2">
                  {currentVendor.documents.map(doc => {
                    const isActive = activeDocId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setActiveDocId(doc.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isActive
                            ? 'bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-neutral-900 dark:text-white shadow-md'
                            : 'bg-neutral-50/80 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <div className="font-bold text-xs flex items-center gap-1.5 truncate text-neutral-900 dark:text-white">
                            <FileText size={14} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'} />
                            <span className="truncate">{doc.title}</span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                            doc.type === 'mechanical' 
                              ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40' 
                              : doc.type === 'electrical'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                              : 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                          }`}>
                            {doc.type === 'mechanical' ? 'Μηχανολογικά' : doc.type === 'electrical' ? 'Ηλεκτρολογικά' : 'Πλήρης Μελέτη'}
                          </span>
                        </div>

                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                          {doc.notes}
                        </p>

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-800/60 text-[10px]">
                          <a
                            href={doc.driveViewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                          >
                            <span>Άνοιγμα PDF</span>
                            <ExternalLink size={10} />
                          </a>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDocument(doc.id);
                            }}
                            className="text-neutral-400 hover:text-red-500 transition-colors p-1"
                            title="Διαγραφή εγγράφου"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-500 text-xs">
                  Δεν έχουν προστεθεί PDFs ακόμα.
                </div>
              )}
            </div>

            {/* DETAILED PRICING BREAKDOWN CARD */}
            {currentVendor.pricingBreakdown && (
              <div className="bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-md backdrop-blur-md">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Receipt size={14} className="text-emerald-600 dark:text-emerald-400" />
                    Ανάλυση Τιμών Προσφοράς
                  </span>
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                    {currentVendor.pricingBreakdown.vatNote}
                  </span>
                </div>

                {/* Stages & Line Items */}
                <div className="space-y-3 my-2">
                  {currentVendor.pricingBreakdown.stages.map((stage, idx) => (
                    <div key={idx} className="bg-neutral-50/80 dark:bg-neutral-950/60 rounded-xl p-2.5 border border-neutral-200 dark:border-neutral-800/80">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1.5">
                        <span className="text-[11px]">{stage.stageTitle}</span>
                        {stage.subtotalEur > 0 && (
                          <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                            €{stage.subtotalEur.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-1 border-t border-neutral-200 dark:border-neutral-800/60 text-xs">
                        {stage.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="flex flex-col gap-0.5">
                            <div className="flex items-start justify-between gap-1 text-[11px]">
                              <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                                {item.description}
                              </span>
                              <span className="font-bold text-neutral-900 dark:text-white font-mono flex-shrink-0">
                                {item.amountEur > 0 ? `€${item.amountEur.toLocaleString()}` : 'Εκκρεμεί'}
                              </span>
                            </div>
                            {item.notes && (
                              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 leading-tight">
                                {item.notes}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Optional Items if any */}
                  {currentVendor.pricingBreakdown.optionalItems && currentVendor.pricingBreakdown.optionalItems.length > 0 && (
                    <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl p-2.5 border border-amber-200 dark:border-amber-900/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                        Προαιρετικές Υπηρεσίες:
                      </span>
                      <div className="space-y-1 text-[11px]">
                        {currentVendor.pricingBreakdown.optionalItems.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                            <span>{opt.description}</span>
                            <span className="font-semibold text-amber-800 dark:text-amber-300 font-mono">
                              {opt.percentageOrUnit || `€${opt.amountEur}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Cost Highlight */}
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-emerald-50/80 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 block">
                      Τελικό Ολικό Σύνολο
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                      Χωρίς ΦΠΑ
                    </span>
                  </div>
                  <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono tracking-tight">
                    {currentVendor.totalCostEur ? `€${currentVendor.totalCostEur.toLocaleString()}` : 'Υπό Διαμόρφωση'}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Right Panel: Interactive PDF Preview / Embed */}
          <div className="flex-1 bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col min-h-[600px]">
            
            {currentDoc ? (
              <>
                {/* PDF Viewer Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-3 flex-shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                        <FileText size={16} className="text-indigo-600 dark:text-indigo-400" />
                        {currentDoc.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        currentDoc.type === 'mechanical' 
                          ? 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40' 
                          : currentDoc.type === 'electrical'
                          ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                          : 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                      }`}>
                        {currentDoc.type === 'mechanical' ? 'Μηχανολογική Μελέτη' : currentDoc.type === 'electrical' ? 'Ηλεκτρολογική Μελέτη' : 'Πλήρες Τεύχος'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate max-w-lg mt-0.5">
                      {currentDoc.fileName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={getAssetUrl(currentDoc.driveViewUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all inline-flex items-center gap-1.5"
                    >
                      <span>Άνοιγμα PDF</span>
                      <ExternalLink size={13} />
                    </a>
                    {currentDoc.localFileUrl && (
                      <a
                        href={getAssetUrl(currentDoc.localFileUrl)}
                        download={currentDoc.fileName}
                        className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-white text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                      >
                        <Download size={13} />
                        <span>Λήψη</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* PDF Embed iFrame */}
                <div className="flex-1 w-full bg-neutral-100 dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden relative min-h-[500px]">
                  <iframe
                    key={currentDoc.id}
                    src={getAssetUrl(currentDoc.drivePreviewUrl)}
                    className="w-full h-full min-h-[500px] border-0"
                    title={currentDoc.title}
                    allow="autoplay"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-neutral-500">
                <FileText size={48} className="mb-3 opacity-20" />
                <h4 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Αναμονή Προσφοράς & Εγγράφων</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mt-1 mb-4 leading-relaxed">
                  Δεν υπάρχουν ακόμη συνημμένα αρχεία PDF για τον <strong>{currentVendor.vendorName}</strong>.
                </p>
                <button
                  onClick={() => setShowAddDocModal(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition-all inline-flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>Προσθήκη Πρώτου Εγγράφου</span>
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Add Document Modal */}
      {showAddDocModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Plus size={16} className="text-indigo-600 dark:text-indigo-400" />
                Προσθήκη Εγγράφου PDF
              </h3>
              <button
                onClick={() => setShowAddDocModal(false)}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase">Τίτλος Εγγράφου</label>
                <input
                  type="text"
                  placeholder="π.χ. Μηχανολογική Μελέτη ή Ηλεκτρολογική Προσφορά"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase">Τύπος Μελέτης</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white"
                >
                  <option value="mechanical">Μηχανολογική Μελέτη</option>
                  <option value="electrical">Ηλεκτρολογική Μελέτη</option>
                  <option value="combined">Συνδυασμένη Μελέτη (Η/Μ)</option>
                  <option value="other">Άλλο Έγγραφο</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase">Link ή URL Προεπισκόπησης</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-white"
                />
              </div>

              {/* Local File upload alternative */}
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <label className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase block mb-1">
                  Ή Επιλογή τοπικού αρχείου PDF:
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleLocalFileUpload}
                  className="block w-full text-xs text-neutral-500 dark:text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 dark:file:bg-neutral-800 file:text-neutral-700 dark:file:text-neutral-200 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setShowAddDocModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                Ακύρωση
              </button>
              <button
                onClick={handleAddDriveDoc}
                disabled={!newDocTitle.trim() || !newDocUrl.trim()}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md"
              >
                Προσθήκη
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
