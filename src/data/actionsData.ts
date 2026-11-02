export interface ActionItem {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
  checklist?: string[];
  tags?: string[];
  createdAt: string;
  completedAt?: string;
}

export const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'action_nabu_casa',
    title: 'Create and integrate Nabu Casa account',
    category: '📡 Smart Home & Cloud',
    priority: 'high',
    status: 'pending',
    description: 'Δημιουργία επίσημου λογαριασμού Home Assistant Cloud (Nabu Casa) και πλήρης ενσωμάτωση με τον κεντρικό server του σπιτιού στο Server Cabinet.',
    tags: ['Nabu Casa', 'Home Assistant', 'Cloud', 'Remote Access'],
    createdAt: '2026-11-02'
  },
  {
    id: 'action_false_ceilings',
    title: 'Σχεδιασμός Ψευδοροφών (Κουζίνα, Σαλόνι & Γραφείο)',
    category: '🏗️ Αρχιτεκτονικά & Μελέτη',
    priority: 'high',
    status: 'pending',
    description: 'Συνεννόηση με αρχιτέκτονα και γυψοσανιδά για τον ακριβή σχεδιασμό των ψευδοροφών σε κουζίνα, σαλόνι/τραπεζαρία και γραφείο: στάθμες, κρυφοί φωτισμοί LED, χωνευτά σποτάκια και εντοιχισμός των καναλάτων κλιματιστικών.',
    tags: ['Ψευδοροφές', 'Γυψοσανίδα', 'Κουζίνα', 'Σαλόνι', 'Γραφείο', 'Κρυφός Φωτισμός'],
    createdAt: '2026-11-02'
  },
  {
    id: 'action_bbq_island',
    title: 'Χωροθέτηση & Πρόνοιες για Island στο BBQ Area',
    category: '🪑 Βεράντα & Εξωτερικοί Χώροι',
    priority: 'high',
    status: 'pending',
    description: 'Οριστικοποίηση σχεδίου για εξωτερικό νησί (island / πάγκο εργασίας) μπροστά από την ψησταριά στο BBQ. Απαιτούνται αναμονές στο δάπεδο για: 1) Ρεύμα (στεγανές πρίζες 13A), 2) Παροχή νερού & αποχέτευση για βοηθητικό νεροχύτη, 3) Φωτισμός πάγκου.',
    tags: ['BBQ Area', 'Island', 'Εξωτερική Κουζίνα', 'Αναμονές Δαπέδου', 'Νεροχύτης'],
    createdAt: '2026-11-02'
  },
  {
    id: 'action_ac_placement',
    title: 'Οριστικοποίηση Θέσεων A/C (Ενιαίος Χώρος & Γραφείο)',
    category: '🔧 HVAC & Μηχανολογικά',
    priority: 'high',
    status: 'pending',
    description: 'Απόφαση με τον μηχανολόγο για τις ακριβείς θέσεις των εσωτερικών μονάδων κλιματισμού: καναλάτες κρυφές μονάδες ψευδοροφής ή επίτοιχα split units σε ενιαίο χώρο (σαλόνι/κουζίνα) και γραφείο, ώστε να μην φυσούν απευθείας σε καναπέδες/γραφείο και να ευθυγραμμιστούν οι αποχετεύσεις συμπυκνωμάτων.',
    tags: ['HVAC', 'Air Condition', 'Σαλόνι', 'Κουζίνα', 'Γραφείο', 'Μηχανολογικά'],
    createdAt: '2026-11-02'
  },
  {
    id: 'action_roller_shutters',
    title: 'Απόφαση για Ηλεκτρικά Ρολά (Shutters) & Επιλογή Ανοιγμάτων',
    category: '🪟 Σκίαση & Κουφώματα',
    priority: 'high',
    status: 'pending',
    description: 'Απόφαση αν θα τοποθετηθούν εξωτερικά ηλεκτρικά ρολά (roller shutters) στα υπνοδωμάτια (πλήρης συσκότιση / ασφάλεια) ή/και σε άλλα ανοίγματα. Αν ναι, απαιτείται πρόνοια 230V σε κάθε κούφωμα και έξυπνα ρελέ Shelly Plus 2PM για έλεγχο από το Home Assistant.',
    tags: ['Shutters', 'Ρολά', 'Σκίαση', 'Κουφώματα', 'Shelly Plus 2PM'],
    createdAt: '2026-11-02'
  },
  {
    id: 'action_firewall_sim_failover',
    title: 'Επιλογή Firewall / Router με Υποδοχή Κάρτας SIM (4G/5G Failover)',
    category: '🖥️ Server Cabinet & Δίκτυο',
    priority: 'high',
    status: 'pending',
    description: 'Επιλογή κύριου router/firewall (π.χ. UniFi Cloud Gateway Max / Ultra συνδεδεμένο με UniFi Mobile Router ή GL.iNet / Teltonika 4G/5G failover gateway). Στόχος: αν κοπεί η οπτική ίνα, το internet να γυρίζει αυτόματα και ακαριαία σε κάρτα SIM χωρίς να πέσουν οι κάμερες, ο συναγερμός και το Home Assistant.',
    tags: ['Firewall', 'UniFi', 'SIM Card', '4G/5G Failover', 'LTE Backup', 'High Availability'],
    createdAt: '2026-11-02'
  },
  {
    id: 'action_server_rack_ups',
    title: 'Επιλογή Rackmount UPS για Αδιάλειπτη Λειτουργία Συναγερμού & Δικτύου',
    category: '🖥️ Server Cabinet & Δίκτυο',
    priority: 'high',
    status: 'pending',
    description: 'Επιλογή 19" Rackmount UPS (1000VA - 1500VA, π.χ. APC Smart-UPS / CyberPower / Eaton) στο κάτω μέρος του rack. Σε διακοπή ρεύματος πρέπει να συνεχίσουν να λειτουργούν αδιάλειπτα: 1) Το Konnected alarm panel & σειρήνες, 2) Το PoE Switch (κάμερες CCTV, doorbells, UniFi APs), 3) Το Mini PC Home Assistant, 4) Το 4G/5G failover router.',
    tags: ['UPS', 'Server Rack', 'Battery Backup', 'Power Outage', 'Alarm Keep-Alive', 'PoE'],
    createdAt: '2026-11-02'
  },
  {
    id: 'action_homeassistant_pc_decision',
    title: 'Τελική Επιλογή Hardware PC για το Home Assistant',
    category: '📡 Smart Home & Cloud',
    priority: 'high',
    status: 'pending',
    description: 'Οριστικοποίηση αγοράς hardware για τον κεντρικό server: Beelink S12 Pro (Intel N100 / 16GB / 500GB SSD, εξαιρετικά χαμηλή κατανάλωση 6W, ιδανικό για Proxmox ή Bare Metal HAOS) vs Apple Mac mini M2/M4 (κορυφαία απόδοση video stream decoding Scrypted/Frigate).',
    tags: ['Mini PC', 'Beelink N100', 'Mac mini', 'Home Assistant', 'Proxmox', 'Server Hardware'],
    createdAt: '2026-11-02'
  }
];
