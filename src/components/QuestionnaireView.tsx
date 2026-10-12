import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Cpu, 
  Network, 
  Zap, 
  UtensilsCrossed, 
  Thermometer, 
  ShieldCheck, 
  Trees, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles,
  Database,
  Layers,
  ArrowRight
} from 'lucide-react';
import { QuestionnaireAnswers, HouseType, HvacType, SmartPlatform } from '../types/questionnaire';
import { DEFAULT_QUESTIONNAIRE_ANSWERS } from '../services/api';

interface QuestionnaireViewProps {
  answers: QuestionnaireAnswers;
  onSave: (updated: QuestionnaireAnswers) => Promise<void>;
  isSaving: boolean;
  isSqliteConnected: boolean;
  onViewProvisions?: () => void;
}

export default function QuestionnaireView({
  answers: initialAnswers,
  onSave,
  isSaving,
  isSqliteConnected,
  onViewProvisions
}: QuestionnaireViewProps) {
  const [formData, setFormData] = useState<QuestionnaireAnswers>(initialAnswers);
  const [activeSection, setActiveSection] = useState<number>(0);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const updateField = <K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await onSave(formData);
    setSaveSuccessMsg('Οι επιλογές σας αποθηκεύτηκαν επιτυχώς στη βάση SQLite και οι πρόνοιες ενημερώθηκαν!');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleReset = () => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να επαναφέρετε το ερωτηματολόγιο στις προεπιλογές;')) {
      setFormData(DEFAULT_QUESTIONNAIRE_ANSWERS);
    }
  };

  const sections = [
    { id: 'house', title: '1. Χαρακτηριστικά Σπιτιού', icon: Home, color: 'text-indigo-500' },
    { id: 'smart', title: '2. Έξυπνο Σπίτι & Αυτοματισμοί', icon: Cpu, color: 'text-cyan-500' },
    { id: 'network', title: '3. Δίκτυο & Server Rack', icon: Network, color: 'text-blue-500' },
    { id: 'electrical', title: '4. Ηλεκτρολογικά & Πρίζες', icon: Zap, color: 'text-amber-500' },
    { id: 'kitchen', title: '5. Κουζίνα & Υδραυλικά', icon: UtensilsCrossed, color: 'text-emerald-500' },
    { id: 'hvac', title: '6. Κλιματισμός & Εξαερισμός', icon: Thermometer, color: 'text-rose-500' },
    { id: 'security', title: '7. Ασφάλεια & CCTV', icon: ShieldCheck, color: 'text-red-500' },
    { id: 'outdoor', title: '8. Εξωτερικοί Χώροι & Extras', icon: Trees, color: 'text-green-500' }
  ];

  return (
    <div className="flex-1 w-full flex flex-col gap-5 overflow-y-auto max-h-[85vh] pr-1">
      
      {/* Top Banner with SQLite Status */}
      <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-neutral-900/60 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Sparkles size={18} />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Ερωτηματολόγιο Επιλογής Προνοιών Κατοικίας
            </h2>
          </div>
          <p className="text-neutral-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Απαντήστε στις παρακάτω ερωτήσεις για να διαμορφώσετε τις ακριβείς ηλεκτρολογικές, υδραυλικές, δικτυακές και smart home πρόνοιες του σπιτιού σας. Μπορείτε να τροποποιήσετε τις επιλογές σας όποτε θέλετε.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* SQLite Badge */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            isSqliteConnected 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
          }`}>
            <Database size={14} className={isSqliteConnected ? 'animate-pulse text-emerald-400' : 'text-amber-400'} />
            <span>{isSqliteConnected ? 'Βάση SQLite: Συνδεδεμένη' : 'Τοπική Αποθήκευση (Cache)'}</span>
          </div>

          {/* Quick Action Button */}
          {onViewProvisions && (
            <button
              onClick={onViewProvisions}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 flex items-center justify-center gap-1.5 transition-all"
            >
              <Layers size={14} />
              <span>Προβολή Προνοιών</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {saveSuccessMsg && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2.5"
        >
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </motion.div>
      )}

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          const isActive = activeSection === idx;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(idx)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all border ${
                isActive 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30' 
                  : 'bg-neutral-900/50 hover:bg-neutral-850 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : sec.color} />
              <span>{sec.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Form Content */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 md:p-6 space-y-6 backdrop-blur-xl">
        
        {/* SECTION 1: HOUSE CHARACTERISTICS */}
        {activeSection === 0 && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Home size={18} className="text-indigo-400" />
                Βασικά Χαρακτηριστικά & Χώροι Κατοικίας
              </h3>
              <p className="text-xs text-neutral-400">Καθορίστε τους χώρους του σπιτιού ώστε να δημιουργηθούν αυτόματα οι αντίστοιχοι τοίχοι και παροχές.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Όνομα Έργου / Κατοικίας</label>
                <input 
                  type="text"
                  value={formData.projectName}
                  onChange={e => updateField('projectName', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-white outline-none"
                  placeholder="π.χ. Η Κατοικία Μου"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Τύπος Κατοικίας</label>
                <select
                  value={formData.houseType}
                  onChange={e => updateField('houseType', e.target.value as HouseType)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-sm text-white outline-none"
                >
                  <option value="detached">Μονοκατοικία (Detached House)</option>
                  <option value="maisonette">Μεζονέτα (Maisonette)</option>
                  <option value="apartment">Διαμέρισμα (Apartment)</option>
                  <option value="renovation">Ανακαίνιση (Renovation)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Αριθμός Ορόφων</label>
                <input 
                  type="number"
                  min="1"
                  max="4"
                  value={formData.floors}
                  onChange={e => updateField('floors', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Αριθμός Υπνοδωματίων</label>
                <input 
                  type="number"
                  min="1"
                  max="6"
                  value={formData.bedroomsCount}
                  onChange={e => updateField('bedroomsCount', Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-white outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider mb-3">Επιπλέον Χώροι & Δωμάτια</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                
                <ToggleCard 
                  title="Master Bedroom Ensuite"
                  description="Ιδιωτικό μπάνιο εντός του κυρίως υπνοδωματίου"
                  checked={formData.hasMasterEnsuite}
                  onChange={v => updateField('hasMasterEnsuite', v)}
                />

                <ToggleCard 
                  title="Γραφείο (Home Office)"
                  description="Ξεχωριστό δωμάτιο γραφείου με πολλαπλές πρίζες και Cat6"
                  checked={formData.hasOffice}
                  onChange={v => updateField('hasOffice', v)}
                />

                <ToggleCard 
                  title="Pantry (Τροφοθήκη)"
                  description="Βοηθητικός χώρος αποθήκευσης δίπλα στην κουζίνα με υδραυλικά & ρεύμα"
                  checked={formData.hasPantry}
                  onChange={v => updateField('hasPantry', v)}
                />

                <ToggleCard 
                  title="Πλυσταριό (Laundry Room)"
                  description="Ανεξάρτητος χώρος για πλυντήριο, στεγνωτήριο & εξαερισμό"
                  checked={formData.hasLaundryRoom}
                  onChange={v => updateField('hasLaundryRoom', v)}
                />

                <ToggleCard 
                  title="WC Ξένων (Guest Toilet)"
                  description="Ξεχωριστό WC επισκεπτών στο ισόγειο"
                  checked={formData.hasGuestWc}
                  onChange={v => updateField('hasGuestWc', v)}
                />

                <ToggleCard 
                  title="Parking / Γκαράζ"
                  description="Στεγασμένο parking με πρόνοια φόρτισης EV & μοτέρ πόρτας"
                  checked={formData.hasGarageParking}
                  onChange={v => updateField('hasGarageParking', v)}
                />

                <ToggleCard 
                  title="Βεράντα / BBQ"
                  description="Εξωτερικός καλυμμένος χώρος καθιστικού & ψησταριάς"
                  checked={formData.hasVerandaBbq}
                  onChange={v => updateField('hasVerandaBbq', v)}
                />

                <ToggleCard 
                  title="Κήπος (Garden)"
                  description="Αυλή με αυτόματο πότισμα και φωτισμό"
                  checked={formData.hasGarden}
                  onChange={v => updateField('hasGarden', v)}
                />

                <ToggleCard 
                  title="Πισίνα (Pool)"
                  description="Πρόνοιες για μηχανοστάσιο πισίνας, αντλία και υποβρύχιο φωτισμό"
                  checked={formData.hasPool}
                  onChange={v => updateField('hasPool', v)}
                />

                <ToggleCard 
                  title="Μηχανοστάσιο (Utility / Plant Room)"
                  description="Κεντρικός τεχνικός χώρος για Server Rack, boiler & πίνακες"
                  checked={formData.hasMachineRoom}
                  onChange={v => updateField('hasMachineRoom', v)}
                />

                <ToggleCard 
                  title="Βοηθητικό Σπίτι (Guest House)"
                  description="Ανεξάρτητος ξενώνας / studio στην αυλή με δικές του παροχές"
                  checked={formData.hasAuxiliaryHouse}
                  onChange={v => updateField('hasAuxiliaryHouse', v)}
                />

              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: SMART HOME */}
        {activeSection === 1 && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu size={18} className="text-cyan-400" />
                Έξυπνο Σπίτι & Αυτοματισμοί
              </h3>
              <p className="text-xs text-neutral-400">Επιλέξτε επίπεδο αυτοματισμού και υποδομών έξυπνου σπιτιού.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleCard 
                title="Έξυπνα Ρελέ Διακοπτών (Shelly / Zigbee)"
                description="Απαιτεί ουδέτερο (Neutral) σε κάθε διακόπτη και βαθιά κουτιά 6cm για αυτόνομο έλεγχο φωτισμού και μετρήσεις kwh."
                whyNeeded="Επιτρέπει την τοποθέτηση smart micro-relays πίσω από κανονικούς διακόπτες χωρίς ειδική καλωδίωση KNX, διατηρώντας την κανονική λειτουργία του διακόπτη."
                checked={formData.smartLightingRelays}
                onChange={v => updateField('smartLightingRelays', v)}
              />

              <ToggleCard 
                title="Κεντρικό Touch Panel 150cm (Σαλόνι)"
                description="Οθόνη αφής τοίχου στο ύψος του ματιού με αποκλειστική αναμονή Cat6 PoE."
                whyNeeded="Παρέχει ταυτόχρονη gigabit σύνδεση δικτύου και ρεύμα Power-over-Ethernet χωρίς αντιαισθητικά εξωτερικά καλώδια ή τροφοδοτικά."
                checked={formData.centralTouchPanel}
                onChange={v => updateField('centralTouchPanel', v)}
              />

              <ToggleCard 
                title="Ηλεκτρικές Κουρτίνες & Ρολά"
                description="Αναμονή παροχής 230V σε κάθε παράθυρο και μπαλκονόπορτα (κουτί ρολού/κουρτίνας)."
                whyNeeded="Επιτρέπει αυτόματο άνοιγμα/κλείσιμο κουρτινών με την ανατολή/δύση ή για προστασία από τη ζέστη του κυπριακού ήλιου."
                checked={formData.motorizedCurtains}
                onChange={v => updateField('motorizedCurtains', v)}
              />

              <ToggleCard 
                title="Αισθητήρες Παρουσίας mmWave (Aqara FP2)"
                description="Συνεχής παροχή 220V/12V (όχι μπαταρία) στις γωνίες ψηλά σε σαλόνι, κουζίνα, γραφείο, υπνοδωμάτια."
                whyNeeded="Οι αισθητήρες mmWave ανιχνεύουν μικροκινήσεις (αναπνοή) και κρατούν τα φώτα αναμμένα όσο κάθεστε ακίνητοι, σε αντίθεση με τα απλά PIR."
                checked={formData.mmWavePresence}
                onChange={v => updateField('mmWavePresence', v)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Προτιμώμενη Πλατφόρμα Έξυπνου Σπιτιού</label>
              <select
                value={formData.smartPlatform}
                onChange={e => updateField('smartPlatform', e.target.value as SmartPlatform)}
                className="w-full max-w-md bg-neutral-950 border border-neutral-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-white outline-none"
              >
                <option value="home_assistant">Home Assistant (Τοπικό, ανοιχτό, χωρίς συνδρομές - Προτεινόμενο)</option>
                <option value="homekit">Apple HomeKit (Apple οικοσύστημα)</option>
                <option value="knx">KNX Ενσύρματο Σύστημα</option>
                <option value="generic">Ανεξάρτητο / Google Home / Alexa</option>
              </select>
            </div>
          </div>
        )}

        {/* SECTION 3: NETWORK & RACK */}
        {activeSection === 2 && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Network size={18} className="text-blue-400" />
                Δικτυακή Υποδομή & Server Rack
              </h3>
              <p className="text-xs text-neutral-400">Ενσύρματη υποδομή Cat6 για αξιόπιστο internet χωρίς νεκρές ζώνες.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleCard 
                title={'Server Rack 10"/19" στο Μηχανοστάσιο'}
                description="Κεντρικό σημείο συγκέντρωσης όλων των καλωδίων δικτύου με Patch Panel και PoE Switch."
                whyNeeded="Όλες οι γραμμές του σπιτιού καταλήγουν οργανωμένα σε ένα σημείο αντί να διασκορπίζονται σε διάφορα κουτιά."
                checked={formData.serverRackInUtility}
                onChange={v => updateField('serverRackInUtility', v)}
              />

              <ToggleCard 
                title="Access Points Οροφής με PoE"
                description="Αναμονές Cat6 στις οροφές για επιτοίχια UniFi / Omada Wi-Fi 6 Access Points."
                whyNeeded="Τα Access Points στην οροφή καλύπτουν ομοιόμορφα μεγάλους χώρους και διαπερνούν μπετόν/τοιχοποιίες."
                checked={formData.poeAccessPoints}
                onChange={v => updateField('poeAccessPoints', v)}
              />

              <ToggleCard 
                title="Διπλό Ethernet Cat6 σε Γραφεία & TV"
                description="Τουλάχιστον δύο ενσύρματες πρίζες RJ45 σε κάθε θέση εργασίας και πίσω από κάθε τηλεόραση."
                whyNeeded="Σταθερό gigabit streaming για 4K TV, gaming κονσόλες και video calls χωρίς αστάθειες Wi-Fi."
                checked={formData.dualEthernetInOffice}
                onChange={v => updateField('dualEthernetInOffice', v)}
              />

              <ToggleCard 
                title="Smart Doorbell με Cat6 PoE στην Είσοδο"
                description="Ενσύρματη αναμονή Cat6 στην εξωτερική είσοδο και στην εξωτερική αυλόπορτα."
                whyNeeded="Αποφυγή μπαταριών και καθυστερήσεων Wi-Fi στο κουδούνι με κάμερα."
                checked={formData.smartDoorbellPoe}
                onChange={v => updateField('smartDoorbellPoe', v)}
              />
            </div>
          </div>
        )}

        {/* SECTION 4: ELECTRICAL & SOCKETS */}
        {activeSection === 3 && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap size={18} className="text-amber-400" />
                Ηλεκτρολογικές Πρόνοιες & Πρίζες
              </h3>
              <p className="text-xs text-neutral-400">Κρίσιμες οδηγίες για το βάθος των κουτιών και την ασφάλεια βάσει κυπριακών κανονισμών.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleCard 
                title="Βαθιά Κουτιά 6cm & Ουδέτερος Παντού"
                description="Όλα τα back-boxes διακοπτών και πριζών να έχουν βάθος τουλάχιστον 6cm και υποχρεωτικό ουδέτερο."
                whyNeeded="Χωρίς βάθος 6cm δεν χωράνε τα έξυπνα ρελέ πίσω από το μηχανισμό, απαιτώντας εκ των υστέρων σκάψιμο."
                checked={formData.deepBackboxes6cm}
                onChange={v => updateField('deepBackboxes6cm', v)}
              />

              <ToggleCard 
                title="Εφεδρική Πρίζα 13A (Spare) σε Κάθε Τοίχο"
                description="Κάθε τοίχος κάθε δωματίου να διαθέτει τουλάχιστον 1 ελεύθερη πρίζα 13A."
                whyNeeded="Εξασφαλίζει ευελιξία για σκούπες, φορτιστές ή αλλαγή διάταξης επίπλων στο μέλλον."
                checked={formData.spareSocketPerWall}
                onChange={v => updateField('spareSocketPerWall', v)}
              />

              <ToggleCard 
                title="Πρίζες Νησίδας Κουζίνας (Pop-up / Χωνευτές)"
                description="Παροχή ρεύματος 230V μέσα από το δάπεδο στη βάση της νησίδας για pop-up ή πλαϊνές πρίζες."
                whyNeeded="Απαραίτητο για μίξερ, μπλέντερ και συσκευές στον πάγκο της νησίδας."
                checked={formData.kitchenIslandSockets}
                onChange={v => updateField('kitchenIslandSockets', v)}
              />

              <ToggleCard 
                title="Τριφασικός Φορτιστής EV Charger 32A"
                description="Ανεξάρτητη τριφασική γραμμή 5x6mm² με RCD Type B στο Parking για ταχεία φόρτιση 11kW/22kW."
                whyNeeded="Έτοιμη υποδομή για άμεση ή μελλοντική φόρτιση ηλεκτρικού αυτοκινήτου."
                checked={formData.evCharger}
                onChange={v => updateField('evCharger', v)}
              />

              <ToggleCard 
                title="Πρότυπα Μπάνιων Κύπρου (BS 7671 Shaver Units)"
                description="Χρήση αποκλειστικά Shaver Supply Unit IP44 (BS EN 61558-2-5) δίπλα στο νιπτήρα."
                whyNeeded="Βάσει των κανονισμών της ΑΗΚ / BS 7671 απαγορεύονται κοινές πρίζες 13A σε υγρές ζώνες μπάνιων."
                checked={formData.cyprusShaverSockets}
                onChange={v => updateField('cyprusShaverSockets', v)}
              />
            </div>
          </div>
        )}

        {/* SECTION 5: KITCHEN & PLUMBING */}
        {activeSection === 4 && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-emerald-400" />
                Κουζίνα & Υδραυλικές Υποδομές
              </h3>
              <p className="text-xs text-neutral-400">Εξειδικευμένες παροχές για σύγχρονες συσκευές νερού και καθαρισμού.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleCard 
                title="4x Πρίζες 13A Κάτω από Νεροχύτη"
                description="Ανεξάρτητες πρίζες για: 1) Αντίστροφη Όσμωση (RO), 2) Chiller Sparkling, 3) Boiler Βραστού 100°C, 4) Σκουπιδοφάγος."
                whyNeeded="Αποτρέπει πολύπριζα μέσα σε ντουλάπια με υγρασία και καλύπτει όλες τις σύγχρονες βρύσες all-in-one."
                checked={formData.underSink4Outlets}
                onChange={v => updateField('underSink4Outlets', v)}
              />

              <ToggleCard 
                title="Διακόπτης / Air Switch Σκουπιδοφάγου"
                description="Πνευματικό μπουτόν στον πάγκο του νεροχύτη για ασφαλές άνοιγμα/κλείσιμο του σκουπιδοφάγου με βρεγμένα χέρια."
                whyNeeded="Απόλυτη ασφάλεια χρήσης χωρίς κίνδυνο ηλεκτροπληξίας."
                checked={formData.garbageDisposalSwitch}
                onChange={v => updateField('garbageDisposalSwitch', v)}
              />

              <ToggleCard 
                title={'Σωληνίσκος 1/4" από Όσμωση στο Ψυγείο'}
                description={'Υδραυλική όδευση λεπτού σωλήνα 1/4" από τη μονάδα όσμωσης στον τοίχο του ψυγείου.'}
                whyNeeded="Τροφοδοτεί το ψυγείο με πεντακάθαρο φιλτραρισμένο νερό για κρύο νερό και παγάκια."
                checked={formData.fridgeWaterLine}
                onChange={v => updateField('fridgeWaterLine', v)}
              />

              <ToggleCard 
                title="Χώρος για Τροφοδοτικά LED (LED Drivers)"
                description="Ειδικός επισκέψιμος χώρος (σε ψευδοροφή ή πάνω ντουλάπι) για τα τροφοδοτικά ταινιών LED."
                whyNeeded="Τα τροφοδοτικά θερμαίνονται και χρειάζονται αερισμό και εύκολη πρόσβαση για μελλοντική αντικατάσταση."
                checked={formData.ledDriverLocation}
                onChange={v => updateField('ledDriverLocation', v)}
              />

              <ToggleCard 
                title="Υδραυλικά Pantry (Νερό & Αποχέτευση)"
                description="Αναμονές ζεστού/κρύου νερού και αποχέτευσης μέσα στην τροφοθήκη."
                whyNeeded="Δυνατότητα για βοηθητικό νεροχύτη, παγομηχανή ή δεύτερο πλυντήριο πιάτων."
                checked={formData.pantryPlumbing}
                onChange={v => updateField('pantryPlumbing', v)}
              />
            </div>
          </div>
        )}

        {/* SECTION 6: HVAC */}
        {activeSection === 5 && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Thermometer size={18} className="text-rose-400" />
                Κλιματισμός, Θέρμανση & Εξαερισμός
              </h3>
              <p className="text-xs text-neutral-400">Έλεγχος θερμοκρασίας και αποτροπή υγρασίας και μούχλας.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Τύπος Κλιματισμού</label>
              <select
                value={formData.hvacType}
                onChange={e => updateField('hvacType', e.target.value as HvacType)}
                className="w-full max-w-md bg-neutral-950 border border-neutral-800 focus:border-rose-500 rounded-xl px-3 py-2 text-sm text-white outline-none"
              >
                <option value="hidden_ducted">Κρυφός Κλιματισμός Αεραγωγών (Ducted / VRV με Modbus / Dry Contact)</option>
                <option value="split_units">Επίτοιχα Split Units</option>
                <option value="none">Χωρίς πρόνοια κεντρικού κλιματισμού</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleCard 
                title="Ενδοδαπέδια Θέρμανση με Smart Θερμοστάτες"
                description="Ανεξάρτητη ζώνη θερμοκρασίας σε κάθε δωμάτιο με smart θερμοστάτη τοίχου."
                whyNeeded="Εξοικονόμηση ενέργειας και βέλτιστη θερμική άνεση ανά δωμάτιο."
                checked={formData.underfloorHeating}
                onChange={v => updateField('underfloorHeating', v)}
              />

              <ToggleCard 
                title="Μηχανικός Εξαερισμός Οροφής με Timer CRZ"
                description="Αθόρυβοι εξαεριστήρες οροφής σε όλα τα μπάνια, WC και πλυσταριό με χρονοδιακόπτη."
                whyNeeded="Ταχεία απομάκρυνση υδρατμών και αποτροπή μούχλας χωρίς ανάγκη ανοιχτών παραθύρων τον χειμώνα."
                checked={formData.mechanicalVentilation}
                onChange={v => updateField('mechanicalVentilation', v)}
              />
            </div>
          </div>
        )}

        {/* SECTION 7: SECURITY */}
        {activeSection === 6 && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-red-400" />
                Σύστημα Ασφαλείας & Προστασίας
              </h3>
              <p className="text-xs text-neutral-400">Ενσύρματη θωράκιση του σπιτιού και αδιάλειπτη λειτουργία σε διακοπή ρεύματος.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleCard 
                title="Contact Sensors (Ενσύρματες στα Κουφώματα)"
                description="Κρυφές χωνευτές επαφές σε όλα τα παράθυρα και μπαλκονόπορτες."
                whyNeeded="Ενεργοποιούν συναγερμό πριν σπάσει το τζάμι και επιτρέπουν αυτόματο κλείσιμο του κλιματιστικού όταν ανοίγει παράθυρο."
                checked={formData.wiredMagneticContacts}
                onChange={v => updateField('wiredMagneticContacts', v)}
              />

              <ToggleCard 
                title="Αισθητήρες Θραύσης Κρυστάλλων"
                description="Ακουστικοί ανιχνευτές θραύσης τζαμιών σε μεγάλες τζαμαρίες και σαλόνι."
                whyNeeded="Άμεση ανίχνευση απόπειρας παραβίασης χωρίς ψευδείς συναγερμούς."
                checked={formData.glassBreakSensors}
                onChange={v => updateField('glassBreakSensors', v)}
              />

              <ToggleCard 
                title="Ανιχνευτές Καπνού & Θερμότητας"
                description="Ενσύρματη αναμονή οροφής στην κουζίνα, διαδρόμους και λεβητοστάσιο."
                whyNeeded="Προστασία ζωής και έγκαιρη ειδοποίηση φωτιάς στο κινητό."
                checked={formData.smokeFireSensors}
                onChange={v => updateField('smokeFireSensors', v)}
              />

              <ToggleCard 
                title="Κάμερες Ασφαλείας CCTV PoE Περιμετρικά"
                description="Αναμονές Cat6 PoE στις γωνίες του σπιτιού και καταγραφικό NVR στο rack."
                whyNeeded="Συνεχής 24/7 καταγραφή υψηλής ανάλυσης 4K χωρίς εξάρτηση από αδύναμο Wi-Fi."
                checked={formData.poeCCTV}
                onChange={v => updateField('poeCCTV', v)}
              />

              <ToggleCard 
                title="Κεντρικό UPS στο Server Rack"
                description="Line-Interactive UPS 1500VA για συνεχή λειτουργία καμερών, δικτύου & συναγερμού."
                whyNeeded="Διατηρεί ενεργό το internet και τις κάμερες ακόμα και αν κοπεί το ρεύμα από κακοκαιρία ή δολιοφθορά."
                checked={formData.centralUps}
                onChange={v => updateField('centralUps', v)}
              />
            </div>
          </div>
        )}

        {/* SECTION 8: OUTDOOR */}
        {activeSection === 7 && (
          <div className="space-y-6">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trees size={18} className="text-green-400" />
                Εξωτερικοί Χώροι, Κήπος & Πισίνα
              </h3>
              <p className="text-xs text-neutral-400">Υπαίθριες υποδομές, φωτισμός και έλεγχος περιβάλλοντος.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleCard 
                title="Αυτοματισμός Ποτίσματος (Ηλεκτροβάνες 24V)"
                description="Καλωδίωση από το φρεάτιο ποτίσματος στον έξυπνο controller με πρόβλεψη βροχής."
                whyNeeded="Εξοικονόμηση νερού και υγιής κήπος με αυτόματο πότισμα βάσει καιρικών συνθηκών."
                checked={formData.smartIrrigation}
                onChange={v => updateField('smartIrrigation', v)}
              />

              <ToggleCard 
                title="Αυτόνομα Κυκλώματα Φωτισμού Κήπου (IP67)"
                description="Ξεχωριστή ασφάλεια και ρελέ διαρροής στον πίνακα για τα εξωτερικά φώτα."
                whyNeeded="Αποτρέπει την πτώση του γενικού διακόπτη σε όλο το σπίτι σε περίπτωση υγρασίας στον κήπο."
                checked={formData.gardenLightingCircuits}
                onChange={v => updateField('gardenLightingCircuits', v)}
              />

              <ToggleCard 
                title="Πρόνοιες Πισίνας & Αυτοματισμού"
                description="Αναμονές για αντλία inverter, φωτισμό LED και αυτόματη δοσομέτρηση PH/Χλωρίου."
                whyNeeded="Πλήρης έλεγχος λειτουργίας της πισίνας και εξοικονόμηση ρεύματος."
                checked={formData.poolProvisions}
                onChange={v => updateField('poolProvisions', v)}
              />

              <ToggleCard 
                title="Υποδομές BBQ (Ρεύμα, Νερό, Αποχέτευση)"
                description="Στεγανές πρίζες IP66 και παροχές νερού στον εξωτερικό πάγκο ψησταριάς."
                whyNeeded="Άνετη λειτουργία ψησταριάς, σούβλας, ψυγείου και νεροχύτη στην αυλή."
                checked={formData.bbqProvisions}
                onChange={v => updateField('bbqProvisions', v)}
              />

              <ToggleCard 
                title="Ηλεκτρική Καγκελόπορτα & Θυροτηλεόραση"
                description="Καλωδίωση ισχυρών και ασθενών ρευμάτων στην είσοδο του οικοπέδου."
                whyNeeded="Έλεγχος ανοίγματος της αυλόπορτας από το κινητό ή το touch panel."
                checked={formData.electricGateIntercom}
                onChange={v => updateField('electricGateIntercom', v)}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 hover:border-neutral-700 flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw size={14} />
              <span>Επαναφορά Προεπιλογών</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeSection < sections.length - 1 && (
              <button
                onClick={() => setActiveSection(prev => prev + 1)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Επόμενη Ενότητα</span>
                <ArrowRight size={14} />
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              <span>{isSaving ? 'Αποθήκευση στη Βάση...' : 'Αποθήκευση στη Βάση SQLite & Ενημέρωση'}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

function ToggleCard({
  title,
  description,
  whyNeeded,
  checked,
  onChange
}: {
  title: string;
  description: string;
  whyNeeded?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <div 
      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
        checked 
          ? 'bg-neutral-950/80 border-indigo-500/50 shadow-sm shadow-indigo-500/5' 
          : 'bg-neutral-950/30 border-neutral-800/80 hover:border-neutral-700 opacity-70'
      }`}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
              {title}
            </h4>
            {whyNeeded && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowWhy(!showWhy);
                }}
                className="text-neutral-500 hover:text-cyan-400 p-0.5 rounded transition-colors"
                title="Γιατί χρειάζεται;"
              >
                <HelpCircle size={13} />
              </button>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-neutral-400 leading-snug">
            {description}
          </p>

          {showWhy && whyNeeded && (
            <div 
              onClick={(e) => e.stopPropagation()}
              className="mt-2 p-2 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[10px] sm:text-[11px] text-indigo-300 leading-relaxed"
            >
              <strong className="text-indigo-200">💡 Γιατί χρειάζεται: </strong>
              {whyNeeded}
            </div>
          )}
        </div>

        {/* Switch pill */}
        <div 
          className={`w-9 h-5 rounded-full p-0.5 transition-colors shrink-0 ${
            checked ? 'bg-indigo-600' : 'bg-neutral-800'
          }`}
        >
          <div 
            className={`w-4 h-4 rounded-full bg-white transition-transform ${
              checked ? 'translate-x-4' : 'translate-x-0'
            }`} 
          />
        </div>
      </div>
    </div>
  );
}
