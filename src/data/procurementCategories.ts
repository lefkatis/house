export const PROCUREMENT_CATEGORIES = [
  '📡 Αισθητήρες (Sensors)',
  '💡 Έξυπνοι Διακόπτες & Relays',
  '🖥️ Κεντρικός Έλεγχος & Δίκτυο',
  '🔒 Συναγερμός & Ασφάλεια',
  '🪟 Σκίαση & Αυτοματισμός',
  '🔧 HVAC & Μηχανοστάσιο',
  '⚡ Ηλεκτρολογικός Εξοπλισμός (Sockets/Plugs)',
  'Εργασίες Έρευνας (Tasks to Find)'
] as const;

export type ProcurementCategory = typeof PROCUREMENT_CATEGORIES[number];
