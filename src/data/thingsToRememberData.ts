export interface RememberItem {
  id: string;
  title: string;
  category: string;
  importance: 'critical' | 'high' | 'medium';
  summary: string;
  details: string;
  points?: string[];
  tags?: string[];
  createdAt: string;
}

export const INITIAL_REMEMBER_ITEMS: RememberItem[] = [
  {
    id: 'remember_konnected',
    title: 'Konnected (Konnected.io) - Alarm Panel Integration',
    category: '🔒 Συναγερμός & Ασφάλεια',
    importance: 'critical',
    summary: 'Πλακέτα μετατροπής ενσύρματων ζωνών συναγερμού σε native Home Assistant sensors (Konnected Alarm Panel Pro).',
    details: 'Το Konnected είναι η κορυφαία λύση για να συνδέσεις όλες τις ενσύρματες μαγνητικές επαφές (reed switches) κουφωμάτων/θυρών, τα ραντάρ κίνησης (PIR), τις σειρήνες και τα buzzers απευθείας στο Home Assistant με μηδενικό latency και χωρίς συνδρομές.',
    points: [
      'Μοντέλο: Konnected Alarm Panel Pro (με υποστήριξη 12 ενσύρματων ζωνών ανά πλακέτα, θύρα Ethernet και τροφοδοσία PoE).',
      'Τοποθέτηση: Στο Server Cabinet (ή δίπλα στον κεντρικό υποπίνακα ασθενών ρευμάτων).',
      'Καλωδιώσεις: Όλα τα καλώδια συναγερμού (μαγνητικές επαφές, ραντάρ) τερματίζουν απευθείας στις κλέμες της πλακέτας Konnected.',
      'Έξοδοι Σειρήνας & Buzzer: Διαθέτει αποκλειστικές εξόδους 12V relay για εσωτερική/εξωτερική σειρήνα και piezo buzzer για τα "beep beep" κατά το arming/disarming.',
      'Αδιάλειπτη Λειτουργία: Τροφοδοτείται με PoE από το UPS του rack ή με 12V DC μπαταρία μολύβδου (backup battery).',
      'Τοπική Επικοινωνία: 100% Local LAN API / MQTT στο Home Assistant χωρίς καμία εξάρτηση από internet/cloud.'
    ],
    tags: ['Konnected', 'Alarm', 'PoE', 'Wired Sensors', 'Home Assistant'],
    createdAt: '2026-11-02'
  }
];
