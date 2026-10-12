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

export interface VendorOffer {
  id: string;
  vendorName: string;
  referenceCode?: string;
  status: 'received' | 'pending' | 'reviewing' | 'accepted' | 'rejected';
  statusLabel: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  dateReceived?: string;
  scope: string[];
  electricalCostEur?: number | null;
  mechanicalCostEur?: number | null;
  supervisionCostEur?: number | null;
  totalCostEur?: number | null;
  paymentTerms?: string;
  deliveryTimeWeeks?: number | string;
  documents: OfferDocument[];
  pros?: string[];
  cons?: string[];
  notes: string;
}

export const INITIAL_VENDOR_OFFERS: VendorOffer[] = [
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
    supervisionCostEur: null,
    totalCostEur: null,
    paymentTerms: 'Σταδιακή εξόφληση ανά παραδοτέο',
    deliveryTimeWeeks: '3-4 εβδομάδες',
    notes: 'Προσφορά για την κατοικία Ανδρέα & Μαρίας στα Λατσιά (ΤΕΜ. 2021). Περιλαμβάνει 2 ξεχωριστά τεύχη/μελέτες: Μηχανολογική Μελέτη (CA-PR-2660) και Ηλεκτρολογική Μελέτη.',
    documents: [
      {
        id: 'doc_ca_pr_2660_mech',
        title: 'Μηχανολογικά (CΑ-PR-2660)',
        type: 'mechanical',
        fileName: 'CΑ-PR-2660 ΠΡΟΣΦΟΡA ΜΗΧΑΝΟΛΟΓΙΚΑ ΟΙΚΙΑΣ ΑΝΔΡΕΑ ΚΑΙ ΜΑΡΙΑΣ ΣΤΑ ΛΑΤΣΙΑ ΤΕΜ.2021 (ΑΝΔΡΕΑΣ ΛΕΥΚΑΤΗΣ).pdf',
        driveViewUrl: 'https://drive.google.com/file/d/1MiHsse-N1joFImPT6mUMrPn4c9cq4Dfs/view?usp=drivesdk',
        drivePreviewUrl: 'https://drive.google.com/file/d/1MiHsse-N1joFImPT6mUMrPn4c9cq4Dfs/preview',
        uploadDate: 'Οκτώβριος 2026',
        notes: 'Πλήρης μηχανολογική μελέτη: Υδραυλικές εγκαταστάσεις (ζεστό/κρύο νερό, ανακυκλοφορία), αποχετεύσεις/όμβρια, κεντρικός κλιματισμός VRV/Split units, ενδοδαπέδια θέρμανση, μηχανικός εξαερισμός λουτρών/πλυσταριού, αποσκληρυντής νερού, ηλιακό σύστημα & boiler.'
      },
      {
        id: 'doc_ca_pr_2660_elec',
        title: 'Ηλεκτρολογικά',
        type: 'electrical',
        fileName: 'Προσφορά Ηλεκτρολογικών Οικίας Ανδρέα & Μαρίας στα Λατσιά ΤΕΜ.2021 (Aνδρέας Λευκάτης).pdf',
        driveViewUrl: 'https://drive.google.com/file/d/14V39SedX5_DqHEne-T5tKHp7KTh_L-NI/view?usp=drivesdk',
        drivePreviewUrl: 'https://drive.google.com/file/d/14V39SedX5_DqHEne-T5tKHp7KTh_L-NI/preview',
        uploadDate: 'Οκτώβριος 2026',
        notes: 'Πλήρης ηλεκτρολογική μελέτη: Ισχυρά ρεύματα (φωτισμός, διακόπτες, πρίζες 13A/16A, παροχές κουζίνας & πλυντηρίων), ασθενή ρεύματα (δομημένη καλωδίωση Cat6, PoE APs, Touch Panel, κάμερες ασφαλείας, σύστημα συναγερμού, θυροτηλεόραση), πρόνοια για έξυπνα relays (Shelly με ουδέτερο & βαθιά κουτιά), φορτιστή BMW EV & φωτοβολταϊκό σύστημα.'
      }
    ],
    pros: [
      'Αναλυτικότατη περιγραφή παραδοτέων',
      'Ξεχωριστή ανάλυση για Μηχανολογικά και Ηλεκτρολογικά',
      'Συμπερίληψη επίβλεψης εγκατάστασης'
    ],
    cons: []
  },
  {
    id: 'vendor_2',
    vendorName: 'Μελετητής 2',
    referenceCode: 'OFFER-02',
    status: 'pending',
    statusLabel: 'Σε Αναμονή Προσφοράς',
    contactPerson: 'Υπό ανάθεση / επικοινωνία',
    scope: ['Μηχανολογική Μελέτη', 'Ηλεκτρολογική Μελέτη'],
    electricalCostEur: null,
    mechanicalCostEur: null,
    supervisionCostEur: null,
    totalCostEur: null,
    paymentTerms: 'Εκκρεμεί',
    deliveryTimeWeeks: 'Εκκρεμεί',
    notes: 'Έχουν παραδοθεί τα αρχιτεκτονικά σχέδια και οι τεχνικές απαιτήσεις για το Smart Home και τις πρόνοιες. Αναμένεται η παραλαβή της προσφοράς.',
    documents: [],
    pros: [],
    cons: []
  },
  {
    id: 'vendor_3',
    vendorName: 'Μελετητής 3',
    referenceCode: 'OFFER-03',
    status: 'pending',
    statusLabel: 'Σε Αναμονή Προσφοράς',
    contactPerson: 'Υπό ανάθεση / επικοινωνία',
    scope: ['Μηχανολογική Μελέτη', 'Ηλεκτρολογική Μελέτη'],
    electricalCostEur: null,
    mechanicalCostEur: null,
    supervisionCostEur: null,
    totalCostEur: null,
    paymentTerms: 'Εκκρεμεί',
    deliveryTimeWeeks: 'Εκκρεμεί',
    notes: 'Αναμονή για παραλαβή 3ης προσφοράς ώστε να γίνει ολοκληρωμένη σύγκριση κόστους και χρόνου παράδοσης.',
    documents: [],
    pros: [],
    cons: []
  }
];
