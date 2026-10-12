import { useState, useEffect } from 'react';
import { 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Eye, 
  AlertCircle, 
  FolderOpen, 
  Edit3, 
  Check, 
  Scale 
} from 'lucide-react';
import { INITIAL_VENDOR_OFFERS, VendorOffer, OfferDocument } from './data/offersData';

const STORAGE_KEY = 'pronies_vendor_offers_v1';

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

  const [selectedVendorId, setSelectedVendorId] = useState<string>('vendor_1');
  const [activeDocId, setActiveDocId] = useState<string>('doc_ca_pr_2660_mech');
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
  }, [selectedVendorId, currentVendor]);

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
        <div className="bg-gradient-to-br from-indigo-950/60 to-neutral-900/90 border border-indigo-800/40 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Προσφορές Μελετών</span>
            <FolderOpen size={16} />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {totalOffersCount} <span className="text-sm font-normal text-neutral-400">Γραφεία</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {receivedOffersCount} διαθέσιμες / {totalOffersCount - receivedOffersCount} σε αναμονή
          </div>
        </div>

        {/* Total PDFs */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Συνημμένα Τεύχη PDF</span>
            <FileText size={16} />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {totalPdfsCount} <span className="text-sm font-normal text-neutral-400">έγγραφα</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Μηχανολογικά & Ηλεκτρολογικά
          </div>
        </div>

        {/* Current Active Vendor */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 shadow-lg">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Επιλεγμένος Μελετητής</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-lg font-bold text-emerald-300 tracking-tight truncate">
            {currentVendor.vendorName}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 truncate">
            {currentVendor.referenceCode ? `Κωδ: ${currentVendor.referenceCode}` : 'Χωρίς κωδικό'} • {currentVendor.statusLabel}
          </div>
        </div>

        {/* View Toggle */}
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Προβολή</span>
            <Scale size={16} />
          </div>
          <div className="flex items-center gap-1.5 bg-neutral-950/80 p-1 rounded-lg border border-neutral-800">
            <button
              onClick={() => setSubViewMode('details')}
              className={`flex-1 py-1 px-2 rounded text-xs font-semibold transition-all ${
                viewMode === 'details' ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              PDF & Λεπτομέρειες
            </button>
            <button
              onClick={() => setSubViewMode('compare')}
              className={`flex-1 py-1 px-2 rounded text-xs font-semibold transition-all ${
                viewMode === 'compare' ? 'bg-purple-600 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Σύγκριση Μελετητών
            </button>
          </div>
        </div>

      </div>

      {/* Main Vendor Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2 overflow-x-auto flex-shrink-0">
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                isSelected && viewMode === 'details'
                  ? 'bg-indigo-600/30 border-indigo-500 text-indigo-100 shadow-md'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              <span>{vendor.vendorName}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                hasDocs 
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/40' 
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                {hasDocs ? `${vendor.documents.length} PDFs` : 'Αναμονή'}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setSubViewMode('compare')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ml-auto ${
            viewMode === 'compare'
              ? 'bg-purple-600/30 border-purple-500 text-purple-100 shadow-md'
              : 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
          }`}
        >
          <Scale size={14} />
          <span>Συγκριτικός Πίνακας</span>
        </button>
      </div>

      {/* View Content: Details with PDF vs Compare Table */}
      {viewMode === 'compare' ? (
        /* COMPARISON TABLE */
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Scale size={18} className="text-purple-400" />
                Συγκριτικός Πίνακας Προσφορών Μελετών
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Σύγκριση παραδοτέων, κόστους και τεχνικών προδιαγραφών μεταξύ των 3 γραφείων μελετών.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Κριτήριο / Πεδίο</th>
                  {offers.map(v => (
                    <th key={v.id} className="py-3 px-4 min-w-[220px]">
                      <div className="font-bold text-neutral-200 text-xs">{v.vendorName}</div>
                      <div className="text-[10px] text-neutral-400 normal-case">{v.referenceCode || '-'}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {/* Status */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-300">Κατάσταση Προσφοράς</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                        v.status === 'received' || v.documents.length > 0
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                      }`}>
                        {v.status === 'received' || v.documents.length > 0 ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                        {v.statusLabel}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Scope */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-300">Αντικείμενο Μελετών</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {v.scope.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* PDFs count & links */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-300">Έγγραφα & PDFs</td>
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
                              className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 underline font-medium"
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

                {/* Electrical Cost */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-300">Κόστος Ηλεκτρολογικών (€)</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4">
                      {v.electricalCostEur ? `€${v.electricalCostEur.toLocaleString()}` : <span className="text-neutral-400 italic">Εκκρεμεί</span>}
                    </td>
                  ))}
                </tr>

                {/* Mechanical Cost */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-300">Κόστος Μηχανολογικών (€)</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4">
                      {v.mechanicalCostEur ? `€${v.mechanicalCostEur.toLocaleString()}` : <span className="text-neutral-400 italic">Εκκρεμεί</span>}
                    </td>
                  ))}
                </tr>

                {/* Total Cost */}
                <tr className="bg-neutral-950/40">
                  <td className="py-3 px-3 font-bold text-white">Συνολικό Κόστος Μελετών (€)</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4 font-black text-sm text-emerald-400">
                      {v.totalCostEur ? `€${v.totalCostEur.toLocaleString()}` : <span className="text-xs text-neutral-400 font-normal italic">Υπό διαμόρφωση</span>}
                    </td>
                  ))}
                </tr>

                {/* Delivery Time */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-300">Χρόνος Παράδοσης</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4 text-neutral-300">
                      {v.deliveryTimeWeeks || 'Εκκρεμεί'}
                    </td>
                  ))}
                </tr>

                {/* Action */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-neutral-300">Ενέργειες</td>
                  {offers.map(v => (
                    <td key={v.id} className="py-3 px-4">
                      <button
                        onClick={() => {
                          setSelectedVendorId(v.id);
                          setSubViewMode('details');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/40 text-indigo-300 hover:text-white font-semibold transition-all inline-flex items-center gap-1.5"
                      >
                        <Eye size={12} />
                        <span>Προβολή Μελετητή</span>
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
          
          {/* Left Panel: Vendor Info & Sub-Tabs */}
          <div className="w-full lg:w-96 flex flex-col gap-3 flex-shrink-0">
            
            {/* Vendor Profile Card */}
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-sm font-black text-white leading-tight">
                    {currentVendor.vendorName}
                  </h3>
                  {currentVendor.referenceCode && (
                    <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                      Ref: {currentVendor.referenceCode}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    isEditing 
                      ? 'bg-emerald-600 text-white border-emerald-500' 
                      : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
                  }`}
                  title={isEditing ? 'Αποθήκευση' : 'Επεξεργασία Στοιχείων'}
                >
                  {isEditing ? <Check size={14} /> : <Edit3 size={14} />}
                </button>
              </div>

              {/* Editable or View Mode Details */}
              {isEditing ? (
                <div className="space-y-2 mt-3 pt-3 border-t border-neutral-800 text-xs">
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold uppercase">Όνομα Μελετητή</label>
                    <input 
                      type="text" 
                      value={currentVendor.vendorName} 
                      onChange={(e) => updateCurrentVendor({ vendorName: e.target.value })}
                      className="w-full mt-0.5 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold uppercase">Κωδικός Προσφοράς</label>
                    <input 
                      type="text" 
                      value={currentVendor.referenceCode || ''} 
                      onChange={(e) => updateCurrentVendor({ referenceCode: e.target.value })}
                      className="w-full mt-0.5 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase">Κόστος Ηλεκτρ. (€)</label>
                      <input 
                        type="number" 
                        value={currentVendor.electricalCostEur || ''} 
                        onChange={(e) => updateCurrentVendor({ electricalCostEur: Number(e.target.value) || null })}
                        className="w-full mt-0.5 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-neutral-400 font-bold uppercase">Κόστος Μηχαν. (€)</label>
                      <input 
                        type="number" 
                        value={currentVendor.mechanicalCostEur || ''} 
                        onChange={(e) => updateCurrentVendor({ mechanicalCostEur: Number(e.target.value) || null })}
                        className="w-full mt-0.5 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 font-bold uppercase">Σημειώσεις</label>
                    <textarea 
                      rows={2}
                      value={currentVendor.notes} 
                      onChange={(e) => updateCurrentVendor({ notes: e.target.value })}
                      className="w-full mt-0.5 px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 mt-3 pt-3 border-t border-neutral-800 text-xs">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="text-neutral-400">Κατάσταση:</span>
                    <span className="font-semibold text-emerald-400">{currentVendor.statusLabel}</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="text-neutral-400">Χρόνος Παράδοσης:</span>
                    <span className="font-semibold">{currentVendor.deliveryTimeWeeks || 'Εκκρεμεί'}</span>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/60">
                    <div className="text-[10px] uppercase font-bold text-neutral-400 mb-1">Αντικείμενο Μελετών:</div>
                    <div className="flex flex-wrap gap-1">
                      {currentVendor.scope.map(s => (
                        <span key={s} className="px-2 py-0.5 rounded bg-neutral-800/80 text-neutral-300 text-[10px] border border-neutral-700/40">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-neutral-400 text-[11px] leading-relaxed pt-2 border-t border-neutral-800/60">
                    {currentVendor.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Documents List & Sub-Tabs */}
            <div className="bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 shadow-lg backdrop-blur-md flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-400" />
                  Τεύχη & Έγγραφα ({currentVendor.documents.length})
                </span>
                <button
                  onClick={() => setShowAddDocModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/50 text-indigo-200 hover:text-white text-[11px] font-semibold transition-all inline-flex items-center gap-1"
                >
                  <Plus size={12} />
                  <span>Προσθήκη PDF</span>
                </button>
              </div>

              {currentVendor.documents.length > 0 ? (
                <div className="space-y-2 flex-1">
                  {currentVendor.documents.map(doc => {
                    const isActive = activeDocId === doc.id;
                    return (
                      <div
                        key={doc.id}
                        onClick={() => setActiveDocId(doc.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isActive
                            ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                            : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <div className="font-bold text-xs flex items-center gap-1.5 truncate">
                            <FileText size={14} className={isActive ? 'text-indigo-400' : 'text-neutral-500'} />
                            <span className="truncate">{doc.title}</span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wider ${
                            doc.type === 'mechanical' 
                              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/40' 
                              : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                          }`}>
                            {doc.type === 'mechanical' ? 'Μηχανολογικά' : 'Ηλεκτρολογικά'}
                          </span>
                        </div>

                        <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                          {doc.notes}
                        </p>

                        <div className="flex items-center justify-between pt-2 mt-2 border-t border-neutral-800/60 text-[10px]">
                          <a
                            href={doc.driveViewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline"
                          >
                            <span>Google Drive</span>
                            <ExternalLink size={10} />
                          </a>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDocument(doc.id);
                            }}
                            className="text-neutral-600 hover:text-red-400 transition-colors p-1"
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
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border border-dashed border-neutral-800 rounded-xl text-neutral-500">
                  <FileText size={32} className="mb-2 opacity-30" />
                  <p className="text-xs font-semibold text-neutral-400">Δεν έχουν προστεθεί PDFs ακόμα</p>
                  <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px]">
                    Κάντε κλικ στο «Προσθήκη PDF» για να καταχωρήσετε σύνδεσμο Google Drive ή τοπικό αρχείο.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Right Panel: Interactive PDF Preview / Embed */}
          <div className="flex-1 bg-neutral-900/70 border border-neutral-800 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col min-h-[600px]">
            
            {currentDoc ? (
              <>
                {/* PDF Viewer Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800 mb-3 flex-shrink-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white flex items-center gap-1.5">
                        <FileText size={16} className="text-indigo-400" />
                        {currentDoc.title}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        currentDoc.type === 'mechanical' 
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/40' 
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                      }`}>
                        {currentDoc.type === 'mechanical' ? 'Μηχανολογική Μελέτη' : 'Ηλεκτρολογική Μελέτη'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-mono truncate max-w-lg mt-0.5">
                      {currentDoc.fileName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={currentDoc.driveViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all inline-flex items-center gap-1.5"
                    >
                      <span>Άνοιγμα στο Google Drive</span>
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>

                {/* Helpful Note for Drive Viewer */}
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg px-3 py-2 text-[11px] text-neutral-400 mb-3 flex items-center justify-between gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-indigo-400 flex-shrink-0" />
                    <span>
                      Προεπισκόπηση εγγράφου μέσω Google Drive Viewer. Σε περίπτωση που ο browser σας περιορίζει τα cookies τρίτων, κάντε κλικ στο παραπάνω κουμπί για άμεσο άνοιγμα.
                    </span>
                  </div>
                </div>

                {/* PDF Embed iFrame */}
                <div className="flex-1 w-full bg-neutral-950 rounded-xl border border-neutral-800 overflow-hidden relative min-h-[500px]">
                  <iframe
                    key={currentDoc.id}
                    src={currentDoc.drivePreviewUrl}
                    className="w-full h-full min-h-[500px] border-0"
                    title={currentDoc.title}
                    allow="autoplay"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-neutral-500">
                <FileText size={48} className="mb-3 opacity-20" />
                <h4 className="text-sm font-bold text-neutral-300">Αναμονή Προσφοράς & Εγγράφων</h4>
                <p className="text-xs text-neutral-400 max-w-sm mt-1 mb-4 leading-relaxed">
                  Δεν υπάρχουν ακόμη συνημμένα αρχεία PDF για τον <strong>{currentVendor.vendorName}</strong>.
                  Μόλις παραληφθεί η προσφορά, προσθέστε το Google Drive link ή ανεβάστε το αρχείο.
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
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus size={16} className="text-indigo-400" />
                Προσθήκη Εγγράφου PDF
              </h3>
              <button
                onClick={() => setShowAddDocModal(false)}
                className="text-neutral-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Τίτλος Εγγράφου</label>
                <input
                  type="text"
                  placeholder="π.χ. Μηχανολογική Μελέτη ή Ηλεκτρολογική Προσφορά"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Τύπος Μελέτης</label>
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as any)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="mechanical">Μηχανολογική Μελέτη</option>
                  <option value="electrical">Ηλεκτρολογική Μελέτη</option>
                  <option value="combined">Συνδυασμένη Μελέτη (Η/Μ)</option>
                  <option value="other">Άλλο Έγγραφο</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Google Drive Link ή URL Προεπισκόπησης</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/.../view"
                  value={newDocUrl}
                  onChange={(e) => setNewDocUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-neutral-400 font-bold uppercase">Σημειώσεις / Περιγραφή</label>
                <textarea
                  rows={2}
                  placeholder="Σύντομη περιγραφή των περιεχομένων της μελέτης..."
                  value={newDocNotes}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Local File upload alternative */}
              <div className="pt-2 border-t border-neutral-800">
                <label className="text-[10px] text-neutral-400 font-bold uppercase block mb-1">
                  Ή Επιλογή τοπικού αρχείου PDF:
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleLocalFileUpload}
                  className="block w-full text-xs text-neutral-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-neutral-800 file:text-neutral-200 hover:file:bg-neutral-700 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setShowAddDocModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:text-white"
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
