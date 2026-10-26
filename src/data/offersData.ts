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
  // 1. C.S. Kettis Ltd & CEVH Engineers
  {
    id: 'vendor_4',
    vendorName: 'C.S. Kettis Ltd & CEVH Engineers',
    referenceCode: 'Arch.no: 81/26',
    status: 'received',
    statusLabel: 'Λήφθηκε (€4,300 + ΦΠΑ)',
    contactPerson: 'Χριστόφορος Κεττής (Μηχ.) & Βαρνάβας Βαρνάβα (Ηλεκτρ.)',
    phone: '+357 99836056 / 99140481',
    email: 'ckettis@ckettis-engineers.com',
    address: 'Σπύρου Κυπριανού 70, 1ος όροφος, Γρ. 103, Λάρνακα',
    dateReceived: '18 Οκτωβρίου 2026',
    scope: [
      'Μηχανολογική Μελέτη Άδειας Οικοδομής (€900)',
      'Ηλεκτρολογική Μελέτη Άδειας Οικοδομής (€900)',
      'Ενεργειακή Μελέτη & Έκδοση ΠΕΑ (συμπ. bonus 5% κάλυψης) (€500)',
      'Διαδικασία Προσφορών Μηχανολογικού Εργολάβου (€250)',
      'Διαδικασία Προσφορών Ηλεκτρολογικού Εργολάβου (€250)',
      'Επιβλέψεις Εργοταξίου (12 Επισκέψεις: 6 Μηχ. + 6 Ηλεκτρ.) (€1.500)'
    ],
    electricalCostEur: 1900,
    mechanicalCostEur: 1900,
    energyCertCostEur: 500,
    supervisionCostEur: 1500,
    totalCostEur: 4300,
    paymentTerms: 'Ανά στάδιο / κατόπιν συνεννόησης. Επιπλέον επισκέψεις επίβλεψης αν χρειαστούν: €125/επίσκεψη.',
    deliveryTimeWeeks: '3-4 εβδομάδες',
    notes: 'Αναθεωρημένη προσφορά (Arch.no: 81/26 - 18/10/2026) από C.S. Kettis Ltd (Χριστόφορος Κεττής) & CEVH Engineers (Βαρνάβας Βαρνάβα) για κατοικία 190 τ.μ. στα Λατσιά (ΤΕΜ. 2021). Συνολικό ποσό: €4.300 + ΦΠΑ. Περιλαμβάνει 12 επιτόπιες επισκέψεις επίβλεψης (6 Μηχ. + 6 Ηλ.) και κάλυψη διαδικασίας για το bonus 5% συντελεστή δόμησης/κάλυψης στο ΠΕΑ.',
    documents: [
      {
        id: 'doc_cs_kettis_full',
        title: 'Προσφορά Η/Μ & Ενέργειας (Arch.no: 81/26)',
        type: 'combined',
        fileName: 'Tender for Electrical and Mechanical Services - revised (81-26).pdf',
        driveViewUrl: '/offers/offer_cs_kettis.pdf',
        drivePreviewUrl: '/offers/offer_cs_kettis.pdf',
        localFileUrl: '/offers/offer_cs_kettis.pdf',
        uploadDate: '18/10/2026',
        notes: 'Επίσημο τεύχος προσφοράς από C.S. Kettis Ltd & CEVH Engineers. Καλύπτει Μελέτη Άδειας Οικοδομής, ΠΕΑ με bonus 5%, Προσφορές Εργολάβων και 12 Επισκέψεις Επίβλεψης (€4.300 + ΦΠΑ).'
      }
    ],
    pricingBreakdown: {
      vatNote: 'Στις πιο πάνω τιμές δεν συμπεριλαμβάνεται ο Φ.Π.Α.',
      totalWithoutVatEur: 4300,
      stages: [
        {
          stageTitle: '1. Μελέτες Άδειας Οικοδομής (Στάδιο Α.Ο.)',
          subtotalEur: 2300,
          items: [
            {
              description: 'Μηχανολογική Μελέτη (Ύδρευση, Αποχέτευση, A/C, Θέρμανση, Ψυκτικά/Θερμικά Φορτία)',
              amountEur: 900,
              percentageOrUnit: 'Μελέτη Α.Ο.',
              notes: 'Υποβολή φακέλου μηχανολογικών για έκδοση Άδειας Οικοδομής'
            },
            {
              description: 'Ηλεκτρολογική Μελέτη (Φωτισμός, Ισχύς/Πίνακες, TV/Τηλέφωνο/Cat6a, Γείωση/Bonding 17th ed.)',
              amountEur: 900,
              percentageOrUnit: 'Μελέτη Α.Ο.',
              notes: 'Ηλεκτρολογικοί υπολογισμοί, μονογραμμικά σχέδια & υποβολή για Άδεια Οικοδομής'
            },
            {
              description: 'Μελέτη Ενεργειακής Απόδοσης & Έκδοση ΠΕΑ (συμπ. διαδικασίας για bonus 5% κάλυψης)',
              amountEur: 500,
              percentageOrUnit: 'ΠΕΑ & Θερμομόνωση',
              notes: 'Μελέτη θερμομόνωσης, έκδοση επίσημου πιστοποιητικού ΠΕΑ και κάλυψη διαδικασίας 5% bonus κάλυψης'
            }
          ]
        },
        {
          stageTitle: '2. Διαδικασίες Προσφορών Εργολάβων (Tenders)',
          subtotalEur: 500,
          items: [
            {
              description: 'Διαδικασία Προσφορών Μηχανολογικής Εγκατάστασης (Tender Mechanical)',
              amountEur: 250,
              percentageOrUnit: 'Tender Procedure',
              notes: 'Ετοιμασία όρων & διαδικασία επιλογής μηχανολογικού εργολάβου'
            },
            {
              description: 'Διαδικασία Προσφορών Ηλεκτρολογικής Εγκατάστασης (Tender Electrical)',
              amountEur: 250,
              percentageOrUnit: 'Tender Procedure',
              notes: 'Ετοιμασία όρων & διαδικασία επιλογής ηλεκτρολογικού εργολάβου'
            }
          ]
        },
        {
          stageTitle: '3. Επιβλέψεις Εργοταξίου (12 Επισκέψεις)',
          subtotalEur: 1500,
          items: [
            {
              description: 'Επίβλεψη Μηχανολογικών Εγκαταστάσεων (6 Επιτόπιες Επισκέψεις)',
              amountEur: 750,
              percentageOrUnit: '6 Επισκέψεις (€125/επίσκεψη)',
              notes: 'Έλεγχος υποδομών ύδρευσης, αποχέτευσης, κλιματισμού, θέρμανσης'
            },
            {
              description: 'Επίβλεψη Ηλεκτρολογικών Εγκαταστάσεων (6 Επιτόπιες Επισκέψεις)',
              amountEur: 750,
              percentageOrUnit: '6 Επισκέψεις (€125/επίσκεψη)',
              notes: 'Έλεγχος ηλεκτρολογικών σωληνώσεων, καλωδιώσεων, πινάκων, γειώσεων'
            }
          ]
        }
      ],
      optionalItems: [
        {
          description: 'Επιπλέον Επίβλεψη (πέραν των 12 προγραμματισμένων επισκέψεων)',
          amountEur: 125,
          percentageOrUnit: '€125 / επίσκεψη'
        }
      ],
      paymentTerms: 'Στις τιμές δεν συμπεριλαμβάνεται ο Φ.Π.Α. Επιπλέον επισκέψεις επίβλεψης αν χρειαστούν: €125 ανά επίσκεψη.'
    },
    pros: [
      'Η οικονομικότερη πρόταση: €4.300 + ΦΠΑ για το πλήρες πακέτο',
      'Περιλαμβάνει 12 επιτόπιες επισκέψεις επίβλεψης (6 Μηχανολογικές + 6 Ηλεκτρολογικές), περισσότερες από όλους',
      'Πολύ χαμηλό κόστος βασικών μελετών άδειας οικοδομής: €900 Μηχ. + €900 Ηλεκτρ. = €1.800',
      'Περιλαμβάνει ετοιμασία & διαδικασία προσφορών εργολάβων (tenders) τόσο για μηχανολογικά (€250) όσο και για ηλεκτρολογικά (€250)',
      'Το ΠΕΑ (€500) περιλαμβάνει ρητά τη διαδικασία αίτησης για το bonus 5% συντελεστή κάλυψης/δόμησης',
      'Συνεργασία δύο έμπειρων γραφείων της Λάρνακας (C.S. Kettis Ltd & CEVH Engineers)'
    ],
    cons: [
      'Υψηλότερο κόστος ανά επιπλέον επίσκεψη επίβλεψης (€125/επίσκεψη έναντι €100 των άλλων)',
      'Δεν επισυνάπτεται πιστοποιητικό ασφάλισης επαγγελματικής ευθύνης στο τεύχος προσφοράς',
      'Δεν διευκρινίζονται ρητά οι όροι αποπληρωμής ανά στάδιο (χρειάζεται επιβεβαίωση ώστε οι επιβλέψεις να πληρώνονται σταδιακά και όχι 100% προκαταβολικά)'
    ]
  },

  // 2. Ανδρέας & Γιάννος Χαραλάμπους (CA-PR-2660 & CY-PR-2693)
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
    notes: 'Προσφορά από τους μελετητές Ανδρέα Χαραλάμπους (Μηχανολόγο Μηχανικό - CA/PR/2660) και Γιάννο Χαραλάμπους (Ηλεκτρολόγο Μηχανικό - CY/PR/2693). Περιλαμβάνει 2 αναλυτικά τεύχη για την κατοικία στα Λατσιά (ΤΕΜ. 2021). Συνολικό ποσό: €4.500 + ΦΠΑ (€4.050 χωρίς τα προαιρετικά ηλεκτρολογικά συστήματα). Προσοχή: Δεν περιλαμβάνει τεύχος προσφορών εργολάβων (BoQ) ούτε σχέδια ΑΗΚ.',
    documents: [
      {
        id: 'doc_ca_pr_2660_mech',
        title: 'Μηχανολογικά & Ενέργεια (CA/PR/2660)',
        type: 'mechanical',
        fileName: 'CΑ-PR-2660 ΠΡΟΣΦΟΡA ΜΗΧΑΝΟΛΟΓΙΚΑ ΟΙΚΙΑΣ ΑΝΔΡΕΑ ΚΑΙ ΜΑΡΙΑΣ ΣΤΑ ΛΑΤΣΙΑ ΤΕΜ.2021 (ΑΝΔΡΕΑΣ ΛΕΥΚΑΤΗΣ).pdf',
        driveViewUrl: '/offers/offer_ca_mech_2660.pdf',
        drivePreviewUrl: '/offers/offer_ca_mech_2660.pdf',
        localFileUrl: '/offers/offer_ca_mech_2660.pdf',
        uploadDate: '07/10/2026',
        notes: 'Μελετητής: Ανδρέας Χαραλάμπους (Μηχανολόγος Μηχανικός). Περιλαμβάνει: Μέρος Α ΠΕΑ (€400), Μέρος Β Μηχανολογική Μελέτη Α.Ο. (€1.800) και Μέρος Γ 6 Επιβλέψεις (€600). Σύνολο Μηχανολογικών: €2.800 + ΦΠΑ.'
      },
      {
        id: 'doc_ca_pr_2660_elec',
        title: 'Ηλεκτρολογικά (CY/PR/2693)',
        type: 'electrical',
        fileName: 'CY-PR-2693 Προσφορά Ηλεκτρολογικών Οικίας Ανδρέα & Μαρίας στα Λατσιά ΤΕΜ.2021 (Aνδρέας Λευκάτης).pdf',
        driveViewUrl: '/offers/offer_ca_elec_2693.pdf',
        drivePreviewUrl: '/offers/offer_ca_elec_2693.pdf',
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
          stageTitle: 'Μηχανολογικά & Ενέργεια (Ανδρέας Χαραλάμπους CA/PR/2660)',
          subtotalEur: 2800,
          items: [
            {
              description: 'Μέρος Α: Πιστοποιητικό Ενεργειακής Απόδοσης (ΠΕΑ)',
              amountEur: 400,
              percentageOrUnit: 'ΠΕΑ',
              notes: 'Έκδοση πιστοποιητικού ενεργειακής απόδοσης κατοικίας'
            },
            {
              description: 'Μέρος Β: Μηχανολογική Μελέτη Άδειας Οικοδομής',
              amountEur: 1800,
              percentageOrUnit: 'Μελέτη Α.Ο.',
              notes: 'Ύδρευση, αποχέτευση, κλιματισμός, ενδοδαπέδια θέρμανση, ηλιακά, πισίνα, εξαερισμοί'
            },
            {
              description: 'Μέρος Γ: Υποχρεωτική Επίβλεψη Εργοταξίου',
              amountEur: 600,
              percentageOrUnit: '6 επισκέψεις (€100/επίσκεψη)',
              notes: '6 επιτόπιες επισκέψεις κατά την κατασκευή'
            }
          ]
        },
        {
          stageTitle: 'Ηλεκτρολογικά (Γιάννος Χαραλάμπους CY/PR/2693)',
          subtotalEur: 1700,
          items: [
            {
              description: 'Μέρος Α: Ηλεκτρολογική Μελέτη Άδειας Οικοδομής',
              amountEur: 850,
              percentageOrUnit: 'Μελέτη Α.Ο.',
              notes: 'Φωτισμός, ρευματοδότες, ηλεκτρικός πίνακας, πρόνοια Φ/Β, γείωση'
            },
            {
              description: 'Μέρος Β: Ηλεκτρολογική Μελέτη Συστημάτων',
              amountEur: 450,
              percentageOrUnit: 'Συστήματα',
              notes: 'Συναγερμός, κάμερες ασφαλείας CCTV, δίκτυο δομημένης καλωδίωσης, σύστημα ήχου'
            },
            {
              description: 'Μέρος Γ: Υποχρεωτική Επίβλεψη Εργοταξίου',
              amountEur: 400,
              percentageOrUnit: '4 επισκέψεις (€100/επίσκεψη)',
              notes: '4 επιτόπιες επισκέψεις κατά την κατασκευή'
            }
          ]
        }
      ],
      optionalItems: [
        {
          description: 'Έκπτωση εάν δεν επιλεγεί το Μέρος Β Ηλεκτρολογικών (Συστήματα)',
          amountEur: -450,
          notes: 'Το σύνολο διαμορφώνεται σε €4.050 + ΦΠΑ'
        },
        {
          description: 'Επιπλέον επιβλέψεις πέραν των προβλεπόμενων (10 σύνολο)',
          amountEur: 100,
          percentageOrUnit: '€100 / επίσκεψη'
        }
      ],
      paymentTerms: '100% πλήρης εξόφληση με την ολοκλήρωση των μελετών και πριν την κατάθεση της αίτησης για Άδεια Οικοδομής.'
    },
    pros: [
      'Αναλυτικός διαχωρισμός σε 2 εξειδικευμένα τεύχη (Μηχανολογικά CA/PR/2660 & Ηλεκτρολογικά CY/PR/2693)',
      'Ακριβής κατανομή επιβλέψεων: 6 Μηχανολογικές + 4 Ηλεκτρολογικές (Σύνολο 10 επισκέψεις)',
      'Δυνατότητα επιλογής χωρίς τα προαιρετικά ηλεκτρολογικά συστήματα Μέρους Β (€4.050 αντί €4.500)',
      'Περιλαμβάνει έκδοση Πιστοποιητικού Ενεργειακής Απόδοσης (ΠΕΑ €400)'
    ],
    cons: [
      'ΔΕΝ περιλαμβάνει ετοιμασία τεύχους προσφορών εργολάβων ή επιμετρήσεις (BoQ / Tenders)',
      'Απαιτεί 100% πλήρη εξόφληση πριν την υποβολή της Άδειας Οικοδομής (πληρωμή όλων των επιβλέψεων πριν καν ξεκινήσει το εργοτάξιο)',
      'ΔΕΝ περιλαμβάνει τελική ηλεκτρολογική μελέτη & τεύχη υπολογισμών ΑΗΚ (αναγράφεται ρητά ως υποχρέωση του ηλεκτρολόγου εγκαταστάτη)',
      'Δεν προσκομίστηκε ασφαλιστήριο επαγγελματικής ευθύνης στο τεύχος προσφοράς',
      'Επιπλέον χρέωση για οποιεσδήποτε αλλαγές μετά την αποπεράτωση'
    ]
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
      'Υψηλότερο συνολικό κόστος (€6.100 vs €4.300 του Κεττή)',
      'Περιορισμός επιβλέψεων σε 5 επισκέψεις ανά ειδικότητα (μετά χρεώνεται €100/επίσκεψη)'
    ]
  }
];
