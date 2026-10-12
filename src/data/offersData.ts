export interface OfferDocument {
  id: string;
  title: string;
  type: 'mechanical' | 'electrical' | 'combined' | 'other';
  fileName: string;
  driveViewUrl: string;
  drivePreviewUrl: string;
  uploadDate?: string;
  notes?: string;
  localFileUrl?: string;
}

export interface PriceLineItem {
  description: string;
  amountEur: number;
  percentageOrUnit?: string;
  notes?: string;
}

export interface PricingStage {
  stageTitle: string;
  subtotalEur: number;
  items: PriceLineItem[];
}

export interface PricingBreakdown {
  vatNote: string;
  stages: PricingStage[];
  totalWithoutVatEur: number;
  optionalItems?: PriceLineItem[];
  paymentTerms?: string;
}

export interface VendorOffer {
  id: string;
  vendorName: string;
  referenceCode?: string;
  status: 'received' | 'pending' | 'reviewing' | 'accepted' | 'rejected';
  statusLabel: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  dateReceived?: string;
  scope: string[];
  electricalCostEur?: number | null;
  mechanicalCostEur?: number | null;
  energyCertCostEur?: number | null;
  supervisionCostEur?: number | null;
  totalCostEur?: number | null;
  paymentTerms?: string;
  deliveryTimeWeeks?: number | string;
  documents: OfferDocument[];
  pricingBreakdown?: PricingBreakdown;
  pros?: string[];
  cons?: string[];
  notes: string;
}

export const INITIAL_VENDOR_OFFERS: VendorOffer[] = [
  // 1. Μελετητής 1 (CA-PR-2660)
  {
    id: 'vendor_1',
    vendorName: 'Μελετητής 1 (CA-PR-2660)',
    referenceCode: 'CA-PR-2660',
    status: 'received',
    statusLabel: 'Λήφθηκε & Σε Αξιολόγηση',
    contactPerson: 'Τεχνικό Γραφείο Μελετών',
    scope: ['Μηχανολογική Μελέτη', 'Ηλεκτρολογική Μελέτη', 'Επίβλεψη Η/Μ'],
    electricalCostEur: null,
    mechanicalCostEur: null,
    energyCertCostEur: null,
    supervisionCostEur: null,
    totalCostEur: null,
    paymentTerms: 'Σταδιακή εξόφληση ανά παραδοτέο',
    deliveryTimeWeeks: '3-4 εβδομάδες',
    notes: 'Προσφορά για την κατοικία Ανδρέα & Μαρίας στα Λατσιά (ΤΕΜ. 2021). Περιλαμβάνει 2 ξεχωριστά τεύχη: Μηχανολογική Μελέτη (CA-PR-2660) και Ηλεκτρολογική Μελέτη.',
    documents: [
      {
        id: 'doc_ca_pr_2660_mech',
        title: 'Μηχανολογικά (CΑ-PR-2660)',
        type: 'mechanical',
        fileName: 'CΑ-PR-2660 ΠΡΟΣΦΟΡA ΜΗΧΑΝΟΛΟΓΙΚΑ ΟΙΚΙΑΣ ΑΝΔΡΕΑ ΚΑΙ ΜΑΡΙΑΣ ΣΤΑ ΛΑΤΣΙΑ ΤΕΜ.2021 (ΑΝΔΡΕΑΣ ΛΕΥΚΑΤΗΣ).pdf',
        driveViewUrl: 'https://drive.google.com/file/d/1MiHsse-N1joFImPT6mUMrPn4c9cq4Dfs/view?usp=drivesdk',
        drivePreviewUrl: 'https://drive.google.com/file/d/1MiHsse-N1joFImPT6mUMrPn4c9cq4Dfs/preview',
        uploadDate: 'Οκτώβριος 2026',
        notes: 'Πλήρης μηχανολογική μελέτη: Υδραυλικά, αποχετεύσεις, κλιματισμός VRV/Split, ενδοδαπέδια θέρμανση, εξαερισμοί, αποσκληρυντής, ηλιακό σύστημα & boiler.'
      },
      {
        id: 'doc_ca_pr_2660_elec',
        title: 'Ηλεκτρολογικά',
        type: 'electrical',
        fileName: 'Προσφορά Ηλεκτρολογικών Οικίας Ανδρέα & Μαρίας στα Λατσιά ΤΕΜ.2021 (Aνδρέας Λευκάτης).pdf',
        driveViewUrl: 'https://drive.google.com/file/d/14V39SedX5_DqHEne-T5tKHp7KTh_L-NI/view?usp=drivesdk',
        drivePreviewUrl: 'https://drive.google.com/file/d/14V39SedX5_DqHEne-T5tKHp7KTh_L-NI/preview',
        uploadDate: 'Οκτώβριος 2026',
        notes: 'Πλήρης ηλεκτρολογική μελέτη: Ισχυρά ρεύματα, ασθενή ρεύματα Cat6 PoE, αυτοματισμοί Shelly, κάμερες ασφαλείας, συναγερμός, θυροτηλεόραση, φορτιστής BMW EV & Φ/Β.'
      }
    ],
    pricingBreakdown: {
      vatNote: 'Δεν συμπεριλαμβάνεται ο Φ.Π.Α.',
      totalWithoutVatEur: 0,
      stages: [
        {
          stageTitle: 'Ανάλυση Κόστους Μελέτης',
          subtotalEur: 0,
          items: [
            { description: 'Ηλεκτρολογική Μελέτη & Επίβλεψη', amountEur: 0, notes: 'Εκκρεμεί καταχώρηση ποσού' },
            { description: 'Μηχανολογική Μελέτη & Επίβλεψη', amountEur: 0, notes: 'Εκκρεμεί καταχώρηση ποσού' }
          ]
        }
      ],
      paymentTerms: 'Σταδιακή εξόφληση με την παράδοση των σχεδίων.'
    },
    pros: [
      'Αναλυτικότατη περιγραφή παραδοτέων στα δύο τεύχη',
      'Συμπερίληψη επίβλεψης εγκατάστασης'
    ],
    cons: []
  },

  // 2. LOUIS VACANAS MEP Consulting Engineers LLC
  {
    id: 'vendor_2',
    vendorName: 'LOUIS VACANAS MEP Consulting Engineers',
    referenceCode: '39-2026/1 ΛΒ',
    status: 'received',
    statusLabel: 'Λήφθηκε (€4,100 + ΦΠΑ)',
    contactPerson: 'Λούης Βακανάς (Μηχανολόγος Μηχανικός)',
    phone: '+357 22 519193',
    email: 'lvme_consulting@cytanet.com.cy',
    address: 'Προδρόμου 97, Entechno Court No.1, Ημιώροφος, Γρ. 2, 2063 Στρόβολος, Λευκωσία',
    dateReceived: '24 Σεπτεμβρίου 2026',
    scope: [
      'Ηλεκτρολογική Μελέτη (65% Μελέτη / 35% Επίβλεψη)',
      'Μηχανολογική Μελέτη (65% Μελέτη / 35% Επίβλεψη)',
      'Πιστοποιητικό Ενεργειακής Απόδοσης (ΠΕΑ)',
      'Στάδιο Προσφορών & Επίβλεψης',
      'Τελική Παραλαβή & Τελικός Λογαριασμός'
    ],
    electricalCostEur: 1500,
    mechanicalCostEur: 1800,
    energyCertCostEur: 800,
    supervisionCostEur: 1155, // (35% of 1500 + 1800 included)
    totalCostEur: 4100,
    paymentTerms: 'Διακανονισμός εντός 15 ημερών από την υποβολή τιμολογίου. Πληρωμή επίβλεψης σε 2 στάδια (μέσο & τέλος).',
    deliveryTimeWeeks: '3-4 εβδομάδες',
    notes: 'Πλήρης προσφορά 15 σελίδων από το γραφείο Louis Vacanas. Καλύπτει Μελέτη, Επίβλεψη, Παραλαβή και έκδοση ΠΕΑ. Συνοδεύεται από Ασφάλεια Επαγγελματικής Ευθύνης €1,000,000 (Κεντρική Ασφαλιστική) και αναλυτικό βιογραφικό έργων.',
    documents: [
      {
        id: 'doc_vacanas_full',
        title: 'Προσφορά Η/Μ & Ενεργειακής Μελέτης (15 Σελ.)',
        type: 'combined',
        fileName: 'Προσφορά_Louis_Vacanas_39-2026_Λατσιά.pdf',
        driveViewUrl: '/offers/offer_louis_vacanas.pdf',
        drivePreviewUrl: '/offers/offer_louis_vacanas.pdf',
        localFileUrl: '/offers/offer_louis_vacanas.pdf',
        uploadDate: '24/09/2026',
        notes: 'Επίσημη υπογεγραμμένη προσφορά (Αρ. Πρ.: 39-2026/1 ΛΒ). Περιλαμβάνει ανάλυση σταδίων μελέτης/επίβλεψης, ασφάλεια επαγγελματικής ευθύνης (€1.000.000) και portfolio έργων.'
      }
    ],
    pricingBreakdown: {
      vatNote: 'Στο πιο πάνω ποσό δεν συμπεριλαμβάνεται ο Φ.Π.Α.',
      totalWithoutVatEur: 4100,
      stages: [
        {
          stageTitle: 'Αμοιβές Μελετών & Επίβλεψης (Στάδια Α, Β & Γ)',
          subtotalEur: 4100,
          items: [
            {
              description: 'Ηλεκτρολογική Μελέτη (65% Μελέτη & 35% Επίβλεψη)',
              amountEur: 1500,
              percentageOrUnit: '65% Μελέτη / 35% Επίβλεψη',
              notes: 'Φωτισμός, αυτοματισμοί, ασθενή ρεύματα, CCTV, συναγερμός, Φ/Β, πίνακες διανομής'
            },
            {
              description: 'Μηχανολογική Μελέτη (65% Μελέτη & 35% Επίβλεψη)',
              amountEur: 1800,
              percentageOrUnit: '65% Μελέτη / 35% Επίβλεψη',
              notes: 'Ύδρευση, αποχετεύσεις, κλιματισμός, ενδοδαπέδια, εξαερισμοί, πισίνα, κεντρική σκούπα'
            },
            {
              description: 'Μελέτη Ενεργειακής Απόδοσης (Οδηγία 2002/91 ΕΚ) & Έκδοση ΠΕΑ',
              amountEur: 800,
              percentageOrUnit: 'Ειδικευμένος Εμπειρογνώμονας',
              notes: 'Υπολογισμοί ενεργειακής απόδοσης και επίσημο Πιστοποιητικό Ενεργειακής Απόδοσης Κτιρίου'
            }
          ]
        }
      ],
      paymentTerms: 'Πληρωμή εντός 15 ημερών. Η επίβλεψη καταβάλλεται στο μέσο και στο τέλος της κατασκευαστικής περιόδου με την έκδοση του Πιστοποιητικού Προσωρινής Παραλαβής.'
    },
    pros: [
      'Πολύ ανταγωνιστική τιμή: €4,100 σύνολο (περιλαμβάνει και μελέτη και επίβλεψη)',
      'Ενσωματωμένη έκδοση Πιστοποιητικού Ενεργειακής Απόδοσης (ΠΕΑ)',
      'Συνοδεύεται από Ασφάλεια Επαγγελματικής Ευθύνης €1.000.000 (Κεντρική Ασφαλιστική)',
      'Εκτενές portfolio πολυτελών κατοικιών & μεγάλων έργων στη Λευκωσία (Λατσιά, Στρόβολος κ.α.)'
    ],
    cons: []
  },

  // 3. THE E&E MEP STUDIO LLC
  {
    id: 'vendor_3',
    vendorName: 'THE E&E MEP STUDIO LLC',
    referenceCode: 'Ref.808.OF.1/2025',
    status: 'received',
    statusLabel: 'Λήφθηκε (€6,100 + ΦΠΑ)',
    contactPerson: 'Ευριπίδης Παπαχριστοφόρου (Ηλεκτρομηχανολόγος Μηχανικός)',
    phone: '99495300',
    email: 'info@themepstudio.com.cy',
    address: 'Δράμας 9, Διαμ. 301, 1077 Λευκωσία',
    dateReceived: '08 Οκτωβρίου 2025',
    scope: [
      'Ι. Στάδιο Σχεδιασμού / Άδειας Οικοδομής (Η/Μ & ΠΕΑ)',
      'ΙΙ. Στάδιο Προσφοροδότησης & Αξιολόγησης Προσφορών',
      'ΙΙΙ. Στάδιο Επίβλεψης (5 συναντήσεις Ηλεκτρολογικών + 5 Μηχανολογικών)',
      'Πιστοποιητικό Ενεργειακής Απόδοσης (ΠΕΑ)'
    ],
    electricalCostEur: 2500, // 1500 + 500 + 500
    mechanicalCostEur: 3200, // 2000 + 700 + 500
    energyCertCostEur: 400,
    supervisionCostEur: 1000,
    totalCostEur: 6100,
    paymentTerms: 'Ανά στάδιο εργασιών (Σχεδιασμός, Προσφορές, Επίβλεψη).',
    deliveryTimeWeeks: '3-4 εβδομάδες',
    notes: 'Προσφορά από το γραφείο The E&E MEP Studio LLC (Ref.808.OF.1/2025). Χωρίζεται αυστηρά σε 3 διακριτά στάδια: Σχεδιασμός/Άδεια (€3.900), Προσφορές (€1.200) και Επίβλεψη (€1.000).',
    documents: [
      {
        id: 'doc_mep_studio_full',
        title: 'Προσφορά Η/Μ Μελέτης, Προσφορών & Επίβλεψης (3 Σελ.)',
        type: 'combined',
        fileName: 'Προσφορά_THE_MEP_STUDIO_808-OF-1-2025.pdf',
        driveViewUrl: '/offers/offer_the_mep_studio.pdf',
        drivePreviewUrl: '/offers/offer_the_mep_studio.pdf',
        localFileUrl: '/offers/offer_the_mep_studio.pdf',
        uploadDate: '08/10/2025',
        notes: 'Επίσημη προσφορά 3 σελίδων με πλήρη διαχωρισμό σταδίων Α.Ο., προσφοροδότησης εργολάβων και 10 επισκέψεων επίβλεψης.'
      }
    ],
    pricingBreakdown: {
      vatNote: 'Σε όλες τις τιμές δεν περιλαμβάνεται ο Φ.Π.Α.',
      totalWithoutVatEur: 6100,
      stages: [
        {
          stageTitle: 'Ι. Στάδιο Σχεδιασμού / Άδειας Οικοδομής (Α.Ο.)',
          subtotalEur: 3900,
          items: [
            {
              description: 'Ηλεκτρολογική Μελέτη (συμπ. Φωτοβολταϊκών)',
              amountEur: 1500,
              notes: 'Συναντήσεις, προκαταρκτικά & τελικά σχέδια Α.Ο., τεχνικές προδιαγραφές, πίνακες διανομής'
            },
            {
              description: 'Μηχανολογική Μελέτη (συμπ. Κολυμβητικής Δεξαμενής)',
              amountEur: 2000,
              notes: 'Κλιματισμός, θέρμανση, εξαερισμοί, αποχετεύσεις, όμβρια, ζεστά/κρύα νερά, πισίνα'
            },
            {
              description: 'Πιστοποιητικό Ενεργειακής Απόδοσης (ΠΕΑ)',
              amountEur: 400,
              notes: 'Έκδοση & τεύχη υπολογισμών ΠΕΑ'
            }
          ]
        },
        {
          stageTitle: 'ΙΙ. Στάδιο Προσφοροδότησης & Αξιολόγησης Προσφορών',
          subtotalEur: 1200,
          items: [
            {
              description: 'Ηλεκτρολογική Μελέτη Προσφορών (συμπ. Φ/Β)',
              amountEur: 500,
              notes: 'Τελικά σχέδια προσφορών, όροι προσφοράς, αναλυτική κατάσταση & τιμές μονάδος, αξιολόγηση'
            },
            {
              description: 'Μηχανολογική Μελέτη Προσφορών (συμπ. Πισίνας)',
              amountEur: 700,
              notes: 'Τελικά μηχανολογικά σχέδια προσφορών, αξιολόγηση προσφορών εργολάβων & εισηγήσεις'
            }
          ]
        },
        {
          stageTitle: 'ΙΙΙ. Στάδιο Επίβλεψης (10 Επισκέψεις/Έλεγχοι)',
          subtotalEur: 1000,
          items: [
            {
              description: 'Ηλεκτρολογικές Τεχνικές Συναντήσεις / Έλεγχοι / Επιβλέψεις (5)',
              amountEur: 500,
              notes: '5 επιτόπιες επισκέψεις, συντονισμός, έλεγχος υλικών & πιστοποίηση πληρωμών'
            },
            {
              description: 'Μηχανολογικές Τεχνικές Συναντήσεις / Έλεγχοι / Επιβλέψεις (5)',
              amountEur: 500,
              notes: '5 επιτόπιες επισκέψεις, συντονισμός, έλεγχος εγκαταστάσεων & πιστοποίηση πληρωμών'
            }
          ]
        }
      ],
      optionalItems: [
        {
          description: 'Επιπλέον Ηλεκτρολογική Επίβλεψη (πέραν των 5)',
          amountEur: 100,
          percentageOrUnit: '€100 / επίσκεψη (επαρχία Λ/κας)'
        },
        {
          description: 'Επιπλέον Μηχανολογική Επίβλεψη (πέραν των 5)',
          amountEur: 100,
          percentageOrUnit: '€100 / επίσκεψη (επαρχία Λ/κας)'
        },
        {
          description: 'Προσφοροδότηση & Αξιολόγηση Φωτιστικών Σωμάτων',
          amountEur: 1000,
          percentageOrUnit: 'Προαιρετικό'
        },
        {
          description: 'Προσφοροδότηση & Αξιολόγηση Συστημάτων Αυτοματισμού',
          amountEur: 500,
          percentageOrUnit: 'Προαιρετικό'
        }
      ],
      paymentTerms: 'Ανά στάδιο εργασιών (Σχεδιασμός, Προσφορές, Επίβλεψη).'
    },
    pros: [
      'Απόλυτα αναλυτικός διαχωρισμός σταδίων: δυνατότητα επιλογής μόνο του Σταδίου Ι (€3.900)',
      'Χαμηλό κόστος έκδοσης ΠΕΑ (€400)',
      'Εξειδίκευση σε ηλεκτρομηχανολογικές μελέτες & αξιολόγηση προσφορών'
    ],
    cons: [
      'Υψηλότερο συνολικό κόστος (€6.100 vs €4.100)',
      'Περιορισμός επιβλέψεων σε 5 επισκέψεις ανά ειδικότητα (μετά χρεώνεται €100/επίσκεψη)'
    ]
  }
];
