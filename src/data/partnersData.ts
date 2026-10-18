// Data structures and initial data for Civil Engineers and Subcontractors

export interface CivilEngineer {
  id: string;
  name: string;
  firmName?: string;
  role: string;
  phone: string;
  altPhone?: string;
  email?: string;
  website?: string;
  address?: string;
  principals?: string[];
  specialties: string[];
  status: 'contacted' | 'pending_offer' | 'reviewing' | 'selected';
  statusLabel: string;
  notes: string;
}

export interface Subcontractor {
  id: string;
  name: string;
  specialty: string; // e.g. 'Σιδεράς / Μεταλλικές Κατασκευές'
  workScope: string; // e.g. 'Πόρτες έξω του μικρού parking'
  phone: string;
  altPhone?: string;
  email?: string;
  website?: string;
  status: 'contacted' | 'pending_quote' | 'selected' | 'completed';
  statusLabel: string;
  notes: string;
}

export const INITIAL_CIVIL_ENGINEERS: CivilEngineer[] = [
  {
    id: 'civil_1',
    name: 'Πόλυς Παπαχριστοφόρου (Polis Papachristoforou)',
    role: 'Πολιτικός / Δομοστατικός Μηχανικός',
    phone: '99 533660',
    specialties: [
      'Στατική & Δυναμική Μελέτη',
      'Αντισεισμικός Σχεδιασμός',
      'Έλεγχος Οπλισμένου Σκυροδέματος',
      'Επιβλέψεις Φέροντος Οργανισμού'
    ],
    status: 'pending_offer',
    statusLabel: 'Υπό Επικοινωνία / Προσφορά',
    notes: 'Πολιτικός Μηχανικός. Τηλέφωνο επικοινωνίας: 99 533660.'
  },
  {
    id: 'civil_2',
    name: 'D&K E.P.S. L.L.C. (D&K EPS)',
    firmName: 'D&K Earthquake Protected Structures L.L.C.',
    role: 'Γραφείο Πολιτικών & Δομοστατικών Μηχανικών',
    principals: [
      'Νίκος Καλαθάς (M.Sc. Structural Engineering)',
      'Γεώργιος Δημητριάδης (M.Sc. Structural Engineering)'
    ],
    phone: '22 495133',
    altPhone: '25 770978',
    email: 'earth@spidernet.com.cy',
    website: 'https://dkeps.com/',
    address: 'Οδός Αθηνών 111, 2035 Στρόβολος, Λευκωσία',
    specialties: [
      'Αντισεισμικός Σχεδιασμός (Earthquake Protected Structures)',
      'Στατική & Δυναμική Ανάλυση Κατοικιών',
      'Σεισμική Μόνωση & Ενισχύσεις',
      'Γεωτεχνικές Μελέτες & Θεμελιώσεις',
      'Επιβλέψεις Σκελετού (Σκυρόδεμα & Χάλυβας)'
    ],
    status: 'pending_offer',
    statusLabel: 'Υπό Επικοινωνία / Προσφορά',
    notes: 'Καταξιωμένο μελετητικό γραφείο Πολιτικών & Δομοστατικών Μηχανικών (ίδρυση 1992, διευθυντές: Νίκος Καλαθάς & Γεώργιος Δημητριάδης). Εξειδίκευση σε αντισεισμικές κατασκευές, στατικές μελέτες κατοικιών και επιβλέψεις. Γραφεία σε Λευκωσία (22 495133) και Λεμεσό (25 770978).'
  }
];

export const INITIAL_SUBCONTRACTORS: Subcontractor[] = [
  {
    id: 'sub_1',
    name: 'Σταύρος Χαραλάμπους (Stavros Charalambous)',
    specialty: 'Σιδεράς / Μεταλλικές Κατασκευές',
    workScope: 'Σιδεράς για πόρτες έξω του μικρού parking (Εξωτερικές θυρίδες / πόρτες μονού parking)',
    phone: '99 643282',
    status: 'contacted',
    statusLabel: 'Σε Επικοινωνία',
    notes: 'Υπεργολάβος σιδεράς για την κατασκευή και τοποθέτηση των εξωτερικών μεταλλικών θυρίδων και πορτών έξω από το μικρό (μονό) parking.'
  },
  {
    id: 'sub_veluda',
    name: 'Veluda Water Filters Cyprus (Ιταλικό Blupura)',
    specialty: '💧 Συστήματα Νερού, Chiller & Φίλτρα',
    workScope: 'Εγκατάσταση υποπάγκιου συστήματος νερού / ψύκτη Blupura (Ιταλίας) με ειδικό Mixer (3-way/4-way βρύση νεροχύτη)',
    phone: '77 78 89 18',
    altPhone: '22 878500',
    email: 'info@veluda.com.cy',
    website: 'https://www.veluda.com.cy',
    status: 'pending_quote',
    statusLabel: 'Αναμονή Προσφοράς',
    notes: 'Ιταλικό Blupura undercounter σύστημα νερού/chiller. Κόστος: ~€2,500 (2.5K) μαζί με το mixer (μπαταρία νεροχύτη). Ηλεκτρολογική απαίτηση: Μόνο 1 πρίζα ρεύματος 230V κάτω από το νεροχύτη (1 πρίζα εν οκ). Showroom: Λεωφ. Αθαλάσσας 16, Στρόβολος, 2018 Λευκωσία.'
  },
  {
    id: 'sub_chm',
    name: 'CHM Security Systems',
    specialty: '🔒 Συστήματα Ασφαλείας & Συναγερμοί',
    workScope: 'Κεντρικός συναγερμός, καλωδίωση επαφών κουφωμάτων (contact sensors), αισθητήρες θραύσης κρυστάλλων και κάμερες CCTV',
    phone: '700 70 246',
    altPhone: '99 303221',
    email: 'info@chmsecurity.com.cy',
    website: 'https://chmsecurity.com.cy',
    status: 'contacted',
    statusLabel: 'Σε Επικοινωνία',
    notes: 'Εταιρεία συστημάτων ασφαλείας, συναγερμών και καμερών CCTV στην Κύπρο. Μελέτη για ενσύρματο σύστημα ασφαλείας και περιμετρική προστασία (σταθερό: 22 370246, κινητό: 99 303221).'
  },
  {
    id: 'sub_eyetouch',
    name: 'Eyetouch (Eye Touch Security & Smart Solutions)',
    specialty: '🔒 Συστήματα Ασφαλείας & Smart Automation',
    workScope: 'Σύστημα συναγερμού, εξωτερικές κάμερες CCTV, θυροτηλεόραση και διασύνδεση με Smart Home',
    phone: '22 444400',
    altPhone: '96 000102',
    email: 'info@eyetouchlife.com',
    website: 'https://eyetouchlife.com',
    status: 'contacted',
    statusLabel: 'Σε Επικοινωνία',
    notes: 'Εξειδικευμένη εταιρεία συστημάτων ασφαλείας, συναγερμών, καμερών και έξυπνων αυτοματισμών στη Λευκωσία (Γεωργίου Γρίβα Διγενή 42, 1096 Λευκωσία). Προσφορά για συναγερμό και κάμερες.'
  }
];
