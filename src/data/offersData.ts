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
  // 1. Ανδρέας & Γιάννος Χαραλάμπους (CA-PR-2660 & CY-PR-2693)
  {
    id: 'vendor_1',
    vendorName: 'Ανδρέας & Γιάννος Χαραλάμπους (CA / CY)',
    referenceCode: 'CA/PR/2660 & CY/PR/2693',
    status: 'received',
    statusLabel: 'Λήφθηκε (€4,500 + ΦΠΑ)',
    contactPerson: 'Ανδρέας Χαραλάμπους (Μηχ.) & Γιάννος Χαραλάμπους (Ηλεκτρ.)',
    phone: '99 373844',
    email: 'andreas.charalampous@gmail.com',
    address: 'Οθέλλου 22, Hellenical Court, Γρ. 206, 7104 Αραδίππου, Λάρνακα',
    dateReceived: '07 Οκτωβρίου 2026',
    scope: [
      'Ενεργειακή Μελέτη & Έκδοση ΠΕΑ (€400)',
      'Μηχανολογική Μελέτη Άδειας Οικοδομής (€1.800)',
      'Ηλεκτρολογική Μελέτη Άδειας Οικοδομής (€850)',
      'Ηλεκτρολογική Μελέτη Συστημάτων (€450)',
      'Υποχρεωτικές Επιβλέψεις Εργοταξίου (10 Επισκέψεις: 6 Μηχ. + 4 Ηλεκτρ.) (€1.000)'
    ],
    electricalCostEur: 1700,
    mechanicalCostEur: 2400,
    energyCertCostEur: 400,
    supervisionCostEur: 1000,
    totalCostEur: 4500,
    paymentTerms: 'Πλήρης εξόφληση με την ολοκλήρωση των μελετών και πριν την υποβολή της αίτησης για έκδοση Άδειας Οικοδομής (κατά το στάδιο υπογραφής εγγράφων υποβολής από τον Ιδιοκτήτη).',
    deliveryTimeWeeks: '3-4 εβδομάδες',
    notes: 'Προσφορά από τους μελετητές Ανδρέα Χαραλάμπους (Μηχανολόγο Μηχανικό - CA/PR/2660) και Γιάννο Χαραλάμπους (Ηλεκτρολόγο Μηχανικό - CY/PR/2693). Περιλαμβάνει 2 αναλυτικά τεύχη για την κατοικία στα Λατσιά (ΤΕΜ. 2021). Συνολικό ποσό: €4.500 + ΦΠΑ (€4.050 χωρίς τα προαιρετικά ηλεκτρολογικά συστήματα).',
    documents: [
      {
        id: 'doc_ca_pr_2660_mech',
        title: 'Μηχανολογικά & Ενέργεια (CA/PR/2660)',
        type: 'mechanical',
        fileName: 'CΑ-PR-2660 ΠΡΟΣΦΟΡA ΜΗΧΑΝΟΛΟΓΙΚΑ ΟΙΚΙΑΣ ΑΝΔΡΕΑ ΚΑΙ ΜΑΡΙΑΣ ΣΤΑ ΛΑΤΣΙΑ ΤΕΜ.2021 (ΑΝΔΡΕΑΣ ΛΕΥΚΑΤΗΣ).pdf',
        driveViewUrl: 'https://drive.google.com/file/d/1MiHsse-N1joFImPT6mUMrPn4c9cq4Dfs/view?usp=drivesdk',
        drivePreviewUrl: 'https://drive.google.com/file/d/1MiHsse-N1joFImPT6mUMrPn4c9cq4Dfs/preview',
        localFileUrl: '/offers/offer_ca_mech_2660.pdf',
        uploadDate: '07/10/2026',
        notes: 'Μελετητής: Ανδρέας Χαραλάμπους (Μηχανολόγος Μηχανικός). Περιλαμβάνει: Μέρος Α ΠΕΑ (€400), Μέρος Β Μηχανολογική Μελέτη Α.Ο. (€1.800) και Μέρος Γ 6 Επιβλέψεις (€600). Σύνολο Μηχανολογικών: €2.800 + ΦΠΑ.'
      },
      {
        id: 'doc_ca_pr_2660_elec',
        title: 'Ηλεκτρολογικά (CY/PR/2693)',
        type: 'electrical',
        fileName: 'CY-PR-2693 Προσφορά Ηλεκτρολογικών Οικίας Ανδρέα & Μαρίας στα Λατσιά ΤΕΜ.2021 (Aνδρέας Λευκάτης).pdf',
        driveViewUrl: 'https://drive.google.com/file/d/14V39SedX5_DqHEne-T5tKHp7KTh_L-NI/view?usp=drivesdk',
        drivePreviewUrl: 'https://drive.google.com/file/d/14V39SedX5_DqHEne-T5tKHp7KTh_L-NI/preview',
        localFileUrl: '/offers/offer_ca_elec_2693.pdf',
        uploadDate: '07/10/2026',
        notes: 'Μελετητής: Γιάννος Χαραλάμπους (Ηλεκτρολόγος Μηχανικός). Περιλαμβάνει: Μέρος Α Ηλεκτρολογική Μελέτη Α.Ο. (€850), Μέρος Β Μελέτη Συστημάτων (€450) και Μέρος Γ 4 Επιβλέψεις (€400). Σύνολο Ηλεκτρολογικών: €1.700 + ΦΠΑ.'
      }
    ],
    pricingBreakdown: {
      vatNote: 'Στις πιο πάνω τιμές δεν συμπεριλαμβάνεται ο Φ.Π.Α.',
      totalWithoutVatEur: 4500,
      stages: [
        {
          stageTitle: 'Μηχανολογικά & Ενέργεια (CA/PR/2660 - Ανδρέας Χαραλάμπους)',
          subtotalEur: 2800,
          items: [
            { 
              description: 'Μέρος Α: Ενεργειακή Μελέτη (Έκδοση Πιστοποιητικού ΠΕΑ)', 
              amountEur: 400, 
              percentageOrUnit: 'ΠΕΑ Α.Ο.',
              notes: 'Υπολογισμοί & έκδοση επίσημου ΠΕΑ για σκοπούς έκδοσης Άδειας Οικοδομής' 
            },
            { 
              description: 'Μέρος Β: Μηχανολογική Μελέτη Άδειας Οικοδομής (Α.Ο.)', 
              amountEur: 1800, 
              percentageOrUnit: 'Μελέτη Α.Ο.',
              notes: 'Κλιματισμός, θέρμανση, αποχετεύσεις, κρύα/ζεστά νερά χρήσης, πισίνα, γενικές & τεχνικές προδιαγραφές' 
            },
            { 
              description: 'Μέρος Γ: Υποχρεωτικές Επιβλέψεις Εργοταξίου (6 Επισκέψεις)', 
              amountEur: 600, 
              percentageOrUnit: '6 Επιβλέψεις',
              notes: '6 επιτόπιες επισκέψεις εργοταξίου για έλεγχο μηχανολογικών (€100/επίσκεψη). Πέραν των 6: €100/επίσκεψη' 
            }
          ]
        },
        {
          stageTitle: 'Ηλεκτρολογικά (CY/PR/2693 - Γιάννος Χαραλάμπους)',
          subtotalEur: 1700,
          items: [
            { 
              description: 'Μέρος Α: Ηλεκτρολογική Μελέτη Άδειας Οικοδομής (Α.Ο.)', 
              amountEur: 850, 
              percentageOrUnit: 'Μελέτη Α.Ο.',
              notes: 'Φωτισμός, εξωτερικός φωτισμός/κήπος, ισχύς, πίνακες διανομής, ρολά, κουρτίνες, τηλέφωνα/δομημένη Cat6, tv, θυροτηλεόραση, πρόνοιες Φ/Β' 
            },
            { 
              description: 'Μέρος Β: Ηλεκτρολογική Μελέτη Συστημάτων (Προαιρετική)', 
              amountEur: 450, 
              percentageOrUnit: 'Συστήματα',
              notes: 'Σύστημα συναγερμού/πυρανίχνευσης, κάμερες παρακολούθησης CCTV, σύστημα ήχου/μουσικής' 
            },
            { 
              description: 'Μέρος Γ: Υποχρεωτικές Επιβλέψεις Εργοταξίου (4 Επισκέψεις)', 
              amountEur: 400, 
              percentageOrUnit: '4 Επιβλέψεις',
              notes: '4 επιτόπιες επισκέψεις εργοταξίου για έλεγχο ηλεκτρολογικών (€100/επίσκεψη). Πέραν των 4: €100/επίσκεψη' 
            }
          ]
        }
      ],
      optionalItems: [
        {
          description: 'Επιπλέον Μηχανολογική Επίβλεψη (πέραν των 6)',
          amountEur: 100,
          percentageOrUnit: '€100 / επίσκεψη'
        },
        {
          description: 'Επιπλέον Ηλεκτρολογική Επίβλεψη (πέραν των 4)',
          amountEur: 100,
          percentageOrUnit: '€100 / επίσκεψη'
        }
      ],
      paymentTerms: 'Πλήρης εξόφληση των Μερών Α, Β & Γ με την ολοκλήρωση των μελετών και πριν την υποβολή της αίτησης για έκδοση Άδειας Οικοδομής (κατά το στάδιο υπογραφής εγγράφων υποβολής από τον Ιδιοκτήτη).'
    },
    pros: [
      'Αναλυτικός διαχωρισμός σε 2 εξειδικευμένα τεύχη (Μηχανολογικά & Ηλεκτρολογικά)',
      'Ακριβής κατανομή επιβλέψεων: 6 Μηχανολογικές + 4 Ηλεκτρολογικές (Σύνολο 10 επισκέψεις)',
      'Δυνατότητα επιλογής χωρίς τα προαιρετικά ηλεκτρολογικά συστήματα Μέρους Β (€4.050 αντί €4.500)',
      'Περιλαμβάνει έκδοση Πιστοποιητικού Ενεργειακής Απόδοσης (ΠΕΑ €400)'
    ],
    cons: []
  },

  // 2. LOUIS VACANAS MEP Consulting Engineers LLC
  {
    id: 'vendor_2',
    vendorName: 'Louis Vacanas MEP Consulting Engineers LLC',
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
    notes: 'Πλήρης προσφορά 15 σελίδων από το γραφείο Louis Vacanas MEP Consulting Engineers LLC (Μελετητής: Λούης Βακανάς). Καλύπτει Μελέτη, Επίβλεψη, Παραλαβή και έκδοση ΠΕΑ. Συνοδεύεται από Ασφάλεια Επαγγελματικής Ευθύνης €1,000,000 (Κεντρική Ασφαλιστική) και αναλυτικό βιογραφικό έργων.',
    documents: [
      {
        id: 'doc_vacanas_full',
        title: 'Προσφορά Η/Μ & Ενεργειακής Μελέτης (39-2026)',
        type: 'combined',
        fileName: '39-2026 Προσφορά - Louis Vacanas MEP Consulting Engineers.pdf',
        driveViewUrl: '/offers/offer_louis_vacanas.pdf',
        drivePreviewUrl: '/offers/offer_louis_vacanas.pdf',
        localFileUrl: '/offers/offer_louis_vacanas.pdf',
        uploadDate: '24/09/2026',
        notes: 'Επίσημη υπογεγραμμένη προσφορά (Αρ. Πρ.: 39-2026/1 ΛΒ - Μελετητής: Λούης Βακανάς). Περιλαμβάνει ανάλυση σταδίων μελέτης/επίβλεψης, ασφάλεια επαγγελματικής ευθύνης (€1.000.000) και portfolio έργων.'
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
    referenceCode: 'PR.808-MEP-ELEC-MECH',
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
    notes: 'Προσφορά από το γραφείο THE E&E MEP STUDIO LLC (Κωδ: PR.808-MEP-ELEC-MECH / Ref.808.OF.1/2025 - Μελετητής: Ευριπίδης Παπαχριστοφόρου). Χωρίζεται σε 3 διακριτά στάδια: Σχεδιασμός/Άδεια (€3.900), Προσφορές (€1.200) και Επίβλεψη (€1.000).',
    documents: [
      {
        id: 'doc_mep_studio_full',
        title: 'Προσφορά Η/Μ Μελέτης, Προσφορών & Επίβλεψης (PR.808)',
        type: 'combined',
        fileName: 'PR.808-MEP-ELEC-MECH - THE E&E MEP STUDIO.pdf',
        driveViewUrl: '/offers/offer_the_mep_studio.pdf',
        drivePreviewUrl: '/offers/offer_the_mep_studio.pdf',
        localFileUrl: '/offers/offer_the_mep_studio.pdf',
        uploadDate: '08/10/2025',
        notes: 'Επίσημη προσφορά από τον μελετητή Ευριπίδη Παπαχριστοφόρου με πλήρη διαχωρισμό σταδίων Α.Ο., προσφοροδότησης εργολάβων και 10 επισκέψεων επίβλεψης.'
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
