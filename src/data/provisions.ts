export type Provision = {
  id: string;
  name: string;
  room: string;
  wall: string;
  type: string;
  completed: boolean;
};

export const PROVISIONS: Provision[] = [
  // --- Σαλόνι / Τραπεζαρία ---
  { id: '1', name: 'Κρυφός Φωτισμός', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Οροφή', type: '💡 Φώτα', completed: false },
  { id: '2', name: 'Πρίζα TV', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Τοίχος Τηλεόρασης', type: '🔌 Πρίζες', completed: false },
  { id: '3', name: 'Πρίζα Ηχοσυστήματος', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Τοίχος Τηλεόρασης', type: '🔌 Πρίζες', completed: false },
  { id: '4', name: 'Πρίζα (Αναμονή)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Τοίχος Τηλεόρασης', type: '🔌 Πρίζες', completed: false },
  { id: '5', name: 'Πρίζα Φωτιστικού', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Τοίχος Καναπέ', type: '🔌 Πρίζες', completed: false },
  { id: '6', name: 'Πρίζα Φόρτισης', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Τοίχος Καναπέ', type: '🔌 Πρίζες', completed: false },
  { id: '7', name: 'Πρίζα (Αναμονή)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Τοίχος Καναπέ', type: '🔌 Πρίζες', completed: false },
  { id: '8', name: 'Πρίζα (Αναμονή)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Τοίχος Τραπεζαρίας', type: '🔌 Πρίζες', completed: false },
  { id: '8_1', name: 'Κρυφός Κλιματισμός (Σημείο 1)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },
  { id: '8_2', name: 'Κρυφός Κλιματισμός (Σημείο 2)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },

  // --- Κουζίνα ---
  { id: '9', name: 'Φωτισμός Πάγκου', room: '🍳 Κουζίνα', wall: 'Ντουλάπια Πάνω', type: '💡 Φώτα', completed: false },
  { id: '10', name: 'Βρύση Νεροχύτη', room: '🍳 Κουζίνα', wall: 'Νησίδα / Πάγκος', type: '🚰 Υδραυλικά', completed: false },
  { id: '11', name: 'Πρίζα Πλυντηρίου Πιάτων', room: '🍳 Κουζίνα', wall: 'Κάτω Ντουλάπια', type: '🔌 Πρίζες', completed: false },
  { id: '12', name: 'Πρίζα Φούρνου', room: '🍳 Κουζίνα', wall: 'Τοίχος Εστιών', type: '🔌 Πρίζες', completed: false },
  { id: '13', name: 'Πρίζα Απορροφητήρα', room: '🍳 Κουζίνα', wall: 'Τοίχος Εστιών', type: '🔌 Πρίζες', completed: false },
  { id: '14', name: 'Πρίζα Φούρνου Μικροκυμάτων', room: '🍳 Κουζίνα', wall: 'Ψηλά Ντουλάπια', type: '🔌 Πρίζες', completed: false },
  { id: '15', name: 'Πρίζα Ψυγείου', room: '🍳 Κουζίνα', wall: 'Τοίχος Ψυγείου', type: '🔌 Πρίζες', completed: false },
  { id: '16', name: 'Πρίζα Καταψύκτη / Συντηρητή Κρασιών', room: '🍳 Κουζίνα', wall: 'Τοίχος Ψυγείου', type: '🔌 Πρίζες', completed: false },
  { id: '17', name: 'Πρίζα Μηχανής Espresso', room: '🍳 Κουζίνα', wall: 'Πάγκος Εργασίας (Δεξιά)', type: '🔌 Πρίζες', completed: false },
  { id: '18', name: 'Πρίζα Τοστιέρας / Βραστήρα', room: '🍳 Κουζίνα', wall: 'Πάγκος Εργασίας (Δεξιά)', type: '🔌 Πρίζες', completed: false },
  { id: '19', name: 'Πρίζα Μίξερ / Blender', room: '🍳 Κουζίνα', wall: 'Πάγκος Εργασίας (Αριστερά)', type: '🔌 Πρίζες', completed: false },
  { id: '20', name: 'Πρίζα (Αναμονή)', room: '🍳 Κουζίνα', wall: 'Πάγκος Εργασίας (Αριστερά)', type: '🔌 Πρίζες', completed: false },
  { id: '20_1', name: 'Πρίζα Νησίδας (Pop-up)', room: '🍳 Κουζίνα', wall: 'Νησίδα / Πάγκος', type: '🔌 Πρίζες', completed: false },
  { id: '20_2', name: 'Κρυφός Κλιματισμός (Σημείο 1)', room: '🍳 Κουζίνα', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },
  { id: '20_3', name: 'Κρυφός Κλιματισμός (Σημείο 2)', room: '🍳 Κουζίνα', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },

  // --- Pantry ---
  { id: '20_4', name: 'Πρίζα Φούρνου Μικροκυμάτων / Εφεδρικού Ψυγείου', room: '🥫 Pantry', wall: 'Αριστερός Τοίχος', type: '🔌 Πρίζες', completed: false },
  { id: '20_5', name: 'Πρίζα (Αναμονή)', room: '🥫 Pantry', wall: 'Δεξιός Τοίχος', type: '🔌 Πρίζες', completed: false },
  { id: '20_6', name: 'Φωτισμός', room: '🥫 Pantry', wall: 'Οροφή', type: '💡 Φώτα', completed: false },

  // --- Γραφείο ---
  { id: '21', name: 'Πρίζα Υπολογιστή', room: '🖥️ Γραφείο', wall: 'Τοίχος Γραφείου', type: '🔌 Πρίζες', completed: false },
  { id: '22', name: 'Πρίζα Οθόνης', room: '🖥️ Γραφείο', wall: 'Τοίχος Γραφείου', type: '🔌 Πρίζες', completed: false },
  { id: '23', name: 'Πρίζα (Αναμονή)', room: '🖥️ Γραφείο', wall: 'Τοίχος Γραφείου', type: '🔌 Πρίζες', completed: false },
  { id: '24', name: 'Πρίζα Printer / Scanner', room: '🖥️ Γραφείο', wall: 'Τοίχος Βιβλιοθήκης', type: '🔌 Πρίζες', completed: false },
  { id: '25', name: 'Πρίζα (Αναμονή)', room: '🖥️ Γραφείο', wall: 'Τοίχος Βιβλιοθήκης', type: '🔌 Πρίζες', completed: false },
  { id: '25_1', name: 'Κρυφός Κλιματισμός (Σημείο 1)', room: '🖥️ Γραφείο', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },
  { id: '25_2', name: 'Κρυφός Κλιματισμός (Σημείο 2)', room: '🖥️ Γραφείο', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },

  // --- Server Cabinet (Now placed in Mixanostasio) ---
  { id: '26', name: 'Mini PC', room: '⚙️ Μηχανοστάσιο', wall: 'Rack Server', type: '🖥️ Server Cabinet', completed: false },
  { id: '27', name: 'PDU (Πολύπριζο Rack)', room: '⚙️ Μηχανοστάσιο', wall: 'Rack Server', type: '🖥️ Server Cabinet', completed: false },
  { id: '28', name: '1U Fans (Ανεμιστήρες)', room: '⚙️ Μηχανοστάσιο', wall: 'Rack Server', type: '🖥️ Server Cabinet', completed: false },
  { id: '29', name: 'Switch 16 Port', room: '⚙️ Μηχανοστάσιο', wall: 'Rack Server', type: '🖥️ Server Cabinet', completed: false },
  { id: '30', name: 'Κεραία Zigbee & Matter', room: '⚙️ Μηχανοστάσιο', wall: 'Rack Server', type: '🖥️ Server Cabinet', completed: false },
  { id: '31', name: 'Καταγραφικό (NVR)', room: '⚙️ Μηχανοστάσιο', wall: 'Rack Server', type: '🖥️ Server Cabinet', completed: false },
  { id: '32', name: 'Cyta Modem', room: '⚙️ Μηχανοστάσιο', wall: 'Rack Server', type: '🖥️ Server Cabinet', completed: false },
  { id: '33', name: 'TV Signal Booster', room: '⚙️ Μηχανοστάσιο', wall: 'Rack Server', type: '🖥️ Server Cabinet', completed: false },
  { id: '33_1', name: 'Γενικός Πίνακας PDU', room: '⚙️ Μηχανοστάσιο', wall: 'Τοίχος Πίνακα', type: '🔌 Πρίζες', completed: false },
  { id: '33_2', name: 'Πρίζα (Αναμονή)', room: '⚙️ Μηχανοστάσιο', wall: 'Τοίχος Εισόδου', type: '🔌 Πρίζες', completed: false },

  // --- Master Bedroom ---
  { id: '34', name: 'Φωτισμός Ανάγνωσης', room: '🛏️ Master Bedroom', wall: 'Τοίχος Κρεβατιού', type: '💡 Φώτα', completed: false },
  { id: '35', name: 'Πρίζα Πορτατίφ', room: '🛏️ Master Bedroom', wall: 'Δεξιά Κρεβατιού', type: '🔌 Πρίζες', completed: false },
  { id: '36', name: 'Πρίζα Φόρτισης', room: '🛏️ Master Bedroom', wall: 'Δεξιά Κρεβατιού', type: '🔌 Πρίζες', completed: false },
  { id: '37', name: 'Πρίζα (Αναμονή)', room: '🛏️ Master Bedroom', wall: 'Δεξιά Κρεβατιού', type: '🔌 Πρίζες', completed: false },
  { id: '38', name: 'Πρίζα Πορτατίφ', room: '🛏️ Master Bedroom', wall: 'Αριστερά Κρεβατιού', type: '🔌 Πρίζες', completed: false },
  { id: '39', name: 'Πρίζα Φόρτισης', room: '🛏️ Master Bedroom', wall: 'Αριστερά Κρεβατιού', type: '🔌 Πρίζες', completed: false },
  { id: '40', name: 'Πρίζα (Αναμονή)', room: '🛏️ Master Bedroom', wall: 'Αριστερά Κρεβατιού', type: '🔌 Πρίζες', completed: false },
  { id: '41', name: 'Πρίζα TV', room: '🛏️ Master Bedroom', wall: 'Απέναντι Τοίχος', type: '🔌 Πρίζες', completed: false },
  { id: '42', name: 'Πρίζα Σίδερου / Ατμοσίδερου', room: '🛏️ Master Bedroom', wall: 'Ντουλάπα', type: '🔌 Πρίζες', completed: false },
  { id: '43', name: 'Πρίζα (Αναμονή)', room: '🛏️ Master Bedroom', wall: 'Ντουλάπα', type: '🔌 Πρίζες', completed: false },

  // --- Bedroom 1 ---
  { id: 'b1_1', name: 'Πρίζα A/C (Split Unit)', room: '🛏️ Bedroom 1', wall: 'Τοίχος A/C', type: '🔌 Πρίζες', completed: false },
  { id: 'b1_2', name: 'Πρίζα Πορτατίφ', room: '🛏️ Bedroom 1', wall: 'Κομοδίνο', type: '🔌 Πρίζες', completed: false },
  { id: 'b1_3', name: 'Πρίζα Γραφείου', room: '🛏️ Bedroom 1', wall: 'Τοίχος Μελέτης', type: '🔌 Πρίζες', completed: false },
  { id: 'b1_4', name: 'Πρίζα (Αναμονή)', room: '🛏️ Bedroom 1', wall: 'Απέναντι Τοίχος', type: '🔌 Πρίζες', completed: false },

  // --- Bedroom 2 ---
  { id: 'b2_1', name: 'Πρίζα A/C (Split Unit)', room: '🛏️ Bedroom 2', wall: 'Τοίχος A/C', type: '🔌 Πρίζες', completed: false },
  { id: 'b2_2', name: 'Πρίζα Πορτατίφ', room: '🛏️ Bedroom 2', wall: 'Κομοδίνο', type: '🔌 Πρίζες', completed: false },
  { id: 'b2_3', name: 'Πρίζα Γραφείου', room: '🛏️ Bedroom 2', wall: 'Τοίχος Μελέτης', type: '🔌 Πρίζες', completed: false },
  { id: 'b2_4', name: 'Πρίζα (Αναμονή)', room: '🛏️ Bedroom 2', wall: 'Απέναντι Τοίχος', type: '🔌 Πρίζες', completed: false },

  // --- WC - Main ---
  { id: '44', name: 'Φωτισμός Καθρέφτη', room: '🚽 WC - Main', wall: 'Τοίχος Καθρέφτη', type: '💡 Φώτα', completed: false },
  { id: '45', name: 'Τηλέφωνο Ντουζιέρας', room: '🚽 WC - Main', wall: 'Τοίχος Ντουζιέρας', type: '🚰 Υδραυλικά', completed: false },
  { id: '46', name: 'Πρίζα Πιστολάκι Μαλλιών', room: '🚽 WC - Main', wall: 'Τοίχος Νιπτήρα', type: '🔌 Πρίζες', completed: false },
  { id: '47', name: 'Πρίζα Ηλεκτρικής Οδοντόβουρτσας', room: '🚽 WC - Main', wall: 'Τοίχος Νιπτήρα', type: '🔌 Πρίζες', completed: false },
  { id: '48', name: 'Πρίζα (Αναμονή)', room: '🚽 WC - Main', wall: 'Τοίχος Πόρτας', type: '🔌 Πρίζες', completed: false },

  // --- Ensuite Bathroom ---
  { id: 'en_1', name: 'Φωτισμός Καθρέφτη', room: '🚽 Ensuite Bathroom', wall: 'Τοίχος Καθρέφτη', type: '💡 Φώτα', completed: false },
  { id: 'en_2', name: 'Πρίζα Πιστολάκι Μαλλιών', room: '🚽 Ensuite Bathroom', wall: 'Τοίχος Νιπτήρα', type: '🔌 Πρίζες', completed: false },
  { id: 'en_3', name: 'Πρίζα (Αναμονή)', room: '🚽 Ensuite Bathroom', wall: 'Τοίχος Εισόδου', type: '🔌 Πρίζες', completed: false },

  // --- WC Ξένων ---
  { id: 'wcx_1', name: 'Είδη Υγιεινής', room: '🚽 WC Ξένων', wall: 'Τοίχος Νιπτήρα', type: '🚰 Υδραυλικά', completed: false },
  { id: 'wcx_2', name: 'Πρίζα (Αναμονή)', room: '🚽 WC Ξένων', wall: 'Τοίχος Εισόδου', type: '🔌 Πρίζες', completed: false },

  // --- Πλυσταριό ---
  { id: 'l_1', name: 'Πρίζα Πλυντηρίου', room: '🧺 Πλυσταριό', wall: 'Τοίχος Συσκευών', type: '🔌 Πρίζες', completed: false },
  { id: 'l_2', name: 'Πρίζα Στεγνωτηρίου', room: '🧺 Πλυσταριό', wall: 'Τοίχος Συσκευών', type: '🔌 Πρίζες', completed: false },
  { id: 'l_3', name: 'Πρίζα Συστήματος Σιδερώματος', room: '🧺 Πλυσταριό', wall: 'Πάγκος Εργασίας', type: '🔌 Πρίζες', completed: false },
  { id: 'l_4', name: 'Πρίζα Ηλεκτρικής Σκούπας (Φόρτιση)', room: '🧺 Πλυσταριό', wall: 'Αποθηκευτικός Τοίχος', type: '🔌 Πρίζες', completed: false },
  { id: 'l_5', name: 'Πρίζα (Αναμονή)', room: '🧺 Πλυσταριό', wall: 'Τοίχος Πόρτας', type: '🔌 Πρίζες', completed: false },
  { id: 'l_6', name: 'Παροχή Νερού Πλυντηρίου', room: '🧺 Πλυσταριό', wall: 'Τοίχος Συσκευών', type: '🚰 Υδραυλικά', completed: false },

  // --- Χώρος Εισόδου ---
  { id: '49', name: 'Έξυπνη Κλειδαριά', room: '🚪 Χώρος Εισόδου', wall: 'Εξώπορτα', type: '🔒 Ασφάλεια', completed: false },
  { id: '50', name: 'Πρίζα (Αναμονή)', room: '🚪 Χώρος Εισόδου', wall: 'Τοίχος Κονσόλας', type: '🔌 Πρίζες', completed: false },

  // --- Exterior ---
  { id: '51', name: 'Φωτισμός Αισθητήρα', room: '🚗 Parking', wall: 'Οροφή', type: '💡 Φώτα', completed: false },
  { id: '52', name: 'Πρίζα Φόρτισης EV', room: '🚗 Parking', wall: 'Τοίχος Στάθμευσης', type: '🔌 Πρίζες', completed: false },
  { id: '53', name: 'Πρίζα Εργαλείων / Σκούπας', room: '🚗 Parking', wall: 'Τοίχος Στάθμευσης', type: '🔌 Πρίζες', completed: false },
  { id: '54', name: 'Φώτα Οροφής Εξωτερικά', room: '🪑 Βεράντα', wall: 'Οροφή', type: '💡 Φώτα', completed: false },
  { id: '54_1', name: 'Επιδαπέδια Πρίζα (Φώτα)', room: '🪑 Βεράντα', wall: 'Δάπεδο (Ελιά)', type: '🔌 Πρίζες', completed: false },
  { id: '54_2', name: 'Πρίζα (Αναμονή)', room: '🪑 Βεράντα', wall: 'Τοίχος Ψησταριάς', type: '🔌 Πρίζες', completed: false },
  { id: '55', name: 'Αντλία Πισίνας', room: '🌳 Κήπος / Πισίνα', wall: 'Μηχανοστάσιο Πισίνας', type: '🔧 Συντήρηση', completed: false },
  { id: '56', name: 'Κάμερες Περιμετρικά', room: '🌳 Κήπος / Πισίνα', wall: 'Περίφραξη', type: '🔒 Ασφάλεια', completed: false },
];
