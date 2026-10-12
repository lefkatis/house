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
  { id: 'sal_1', name: 'Κεντρικό Touch Panel (Ύψος Ματιού)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Κεντρικός Τοίχος', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'sal_2', name: 'Καλωδίωση Cat6 PoE (Touch Panel)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Κεντρικός Τοίχος', type: '🖥️ Server Cabinet', completed: false },
  { id: 'sal_3', name: 'Έξυπνοι Διακόπτες / Έξυπνα Ρελέ (Βαθιά Κουτιά 6cm & Ουδέτερος)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Τοίχος Εισόδου', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'sal_4', name: 'Ηλεκτρικές Κουρτίνες (Παροχή Ρεύματος)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Παράθυρα / Μπαλκονόπορτα', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'sal_5', name: 'Αισθητήρας Παρουσίας mmWave (220V/12V)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Γωνία 1 (Ψηλά)', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'sal_6', name: 'PoE Access Point', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Οροφή', type: '🖥️ Server Cabinet', completed: false },
  { id: 'sal_7', name: 'Κρυφός Κλιματισμός (Έλεγχος Modbus/Dry Contact) Σημείο 1', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },
  { id: 'sal_8', name: 'Κρυφός Κλιματισμός (Έλεγχος Modbus/Dry Contact) Σημείο 2', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },
  { id: 'sal_9', name: 'Μαγνητικές Επαφές & Αισθητήρας Θραύσης Κρυστάλλων (12V ψηλά)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Παράθυρα / Μπαλκονόπορτα', type: '🔒 Ασφάλεια', completed: false },
  { id: 'sal_10', name: 'Πρίζα TV & Ηχοσυστήματος', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Τοίχος Τηλεόρασης', type: '🔌 Πρίζες', completed: false },
  { id: 'sal_11', name: 'Κρυφός Φωτισμός', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Οροφή', type: '💡 Φώτα', completed: false },
  { id: 'sal_12', name: 'Θερμοστάτης Ενδοδαπέδιας (Smart)', room: '🛋️ Σαλόνι / Τραπεζαρία', wall: 'Κεντρικός Τοίχος', type: '📡 Έξυπνο Σπίτι', completed: false },

  // --- Κουζίνα ---
  { id: 'kou_1', name: 'Αισθητήρας Καπνού & Φωτιάς', room: '🍳 Κουζίνα', wall: 'Οροφή (Πάνω από Νησίδα)', type: '🔒 Ασφάλεια', completed: false },
  { id: 'kou_2', name: 'Αισθητήρας Παρουσίας mmWave (220V/12V)', room: '🍳 Κουζίνα', wall: 'Γωνία 1 (Ψηλά)', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'kou_3', name: 'PoE Access Point', room: '🍳 Κουζίνα', wall: 'Οροφή', type: '🖥️ Server Cabinet', completed: false },
  { id: 'kou_4', name: '4x Πρίζες 13A (Κάτω από Νεροχύτη)', room: '🍳 Κουζίνα', wall: 'Νησίδα (Νεροχύτης)', type: '🔌 Πρίζες', completed: false },
  { id: 'kou_5', name: 'Διακόπτης Σκουπιδοφάγου', room: '🍳 Κουζίνα', wall: 'Νησίδα (Νεροχύτης)', type: '🔌 Πρίζες', completed: false },
  { id: 'kou_6', name: 'Υδραυλικά: Αντίστροφη Όσμωση, Chiller, Boiler, Σκουπιδοφάγος', room: '🍳 Κουζίνα', wall: 'Νησίδα (Νεροχύτης)', type: '🚰 Υδραυλικά', completed: false },
  { id: 'kou_isl_1', name: 'Χωνευτές / Pop-up Πρίζες Πάγκου Νησίδας (13A για Μικροσυσκευές)', room: '🍳 Κουζίνα', wall: 'Νησίδα (Πάγκος)', type: '🔌 Πρίζες', completed: false },
  { id: 'kou_isl_2', name: 'Εφεδρική Πρίζα 13A Νησίδας', room: '🍳 Κουζίνα', wall: 'Νησίδα (Πάγκος)', type: '🔌 Πρίζες', completed: false },
  { id: 'kou_7', name: 'Σωληνίσκος 1/4" για Παροχή Νερού από Όσμωση στο Ψυγείο', room: '🍳 Κουζίνα', wall: 'Τοίχος Ψυγείου', type: '🚰 Υδραυλικά', completed: false },
  { id: 'kou_8', name: 'Κρυφοί Φωτισμοί (Κάτω από Πάγκους + Χώρος για Τροφοδοτικά)', room: '🍳 Κουζίνα', wall: 'Ντουλάπια Πάνω', type: '💡 Φώτα', completed: false },
  { id: 'kou_9', name: 'Πρίζες Συσκευών (Φούρνος, Μικροκύματα, Πλυντήριο Πιάτων)', room: '🍳 Κουζίνα', wall: 'Τοίχος Εστιών', type: '🔌 Πρίζες', completed: false },
  { id: 'kou_10', name: 'Έξυπνοι Διακόπτες / Έξυπνα Ρελέ (Βαθιά Κουτιά 6cm & Ουδέτερος)', room: '🍳 Κουζίνα', wall: 'Τοίχος Εισόδου', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'kou_11', name: 'Μαγνητικές Επαφές & Αισθητήρας Θραύσης Κρυστάλλων', room: '🍳 Κουζίνα', wall: 'Παράθυρα', type: '🔒 Ασφάλεια', completed: false },
  
  // --- Pantry ---
  { id: 'pan_1', name: 'Μελλοντικές Αναμονές Νερού (Ζεστό/Κρύο) & Αποχέτευση', room: '🥫 Pantry', wall: 'Τοίχος Υδραυλικών', type: '🚰 Υδραυλικά', completed: false },
  { id: 'pan_2', name: 'Αναμονές Ρεύματος (Πρίζες 13A)', room: '🥫 Pantry', wall: 'Τοίχος Συσκευών', type: '🔌 Πρίζες', completed: false },
  { id: 'pan_3', name: 'Έξυπνοι Διακόπτες Φωτισμού', room: '🥫 Pantry', wall: 'Είσοδος Pantry', type: '📡 Έξυπνο Σπίτι', completed: false },

  // --- Γραφείο ---
  { id: 'gra_1', name: 'Πολλαπλές Πρίζες 16A (Γραφείο Επιλογή Α)', room: '🖥️ Γραφείο', wall: 'Αριστερός Τοίχος', type: '🔌 Πρίζες', completed: false },
  { id: 'gra_2', name: 'Πολλαπλές Πρίζες 16A (Γραφείο Επιλογή Β)', room: '🖥️ Γραφείο', wall: 'Δεξιός Τοίχος', type: '🔌 Πρίζες', completed: false },
  { id: 'gra_3', name: 'Αναμονές Δικτύου Cat6 (Πολλαπλές) - Τοίχος Α', room: '🖥️ Γραφείο', wall: 'Αριστερός Τοίχος', type: '🖥️ Server Cabinet', completed: false },
  { id: 'gra_4', name: 'Αναμονές Δικτύου Cat6 (Πολλαπλές) - Τοίχος Β', room: '🖥️ Γραφείο', wall: 'Δεξιός Τοίχος', type: '🖥️ Server Cabinet', completed: false },
  { id: 'gra_5', name: 'Αισθητήρας Παρουσίας mmWave', room: '🖥️ Γραφείο', wall: 'Γωνία 1 (Ψηλά)', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'gra_6', name: 'PoE Access Point', room: '🖥️ Γραφείο', wall: 'Οροφή', type: '🖥️ Server Cabinet', completed: false },
  { id: 'gra_7', name: 'Split Unit (A/C) & Ενδοδαπέδια Θέρμανση', room: '🖥️ Γραφείο', wall: 'Τοίχος A/C', type: '🔧 Συντήρηση', completed: false },
  { id: 'gra_8', name: 'Μαγνητικές Επαφές & Αισθητήρας Θραύσης Κρυστάλλων', room: '🖥️ Γραφείο', wall: 'Παράθυρα', type: '🔒 Ασφάλεια', completed: false },

  // --- Master Bedroom ---
  { id: 'mb_1', name: 'Παροχή Ρεύματος & Cat6 στο 150cm (Για TV)', room: '🛏️ Master Bedroom', wall: 'Τοίχος Απέναντι Κρεβατιού', type: '🔌 Πρίζες', completed: false },
  { id: 'mb_2', name: 'Κρυφός Φωτισμός (Οροφή & Περιμετρικά)', room: '🛏️ Master Bedroom', wall: 'Οροφή', type: '💡 Φώτα', completed: false },
  { id: 'mb_3', name: 'Φωτισμός Ντουλάπας & Αισθητήρες (LED Drivers)', room: '🛏️ Master Bedroom', wall: 'Γκαρνταρόμπα', type: '💡 Φώτα', completed: false },
  { id: 'mb_4', name: 'Split Unit & Θερμοστάτης Ενδοδαπέδιας', room: '🛏️ Master Bedroom', wall: 'Τοίχος A/C', type: '🔧 Συντήρηση', completed: false },
  { id: 'mb_5', name: 'Αισθητήρας Παρουσίας mmWave', room: '🛏️ Master Bedroom', wall: 'Γωνία 1 (Ψηλά)', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'mb_6', name: 'Μαγνητικές Επαφές & Αισθητήρας Θραύσης Κρυστάλλων', room: '🛏️ Master Bedroom', wall: 'Παράθυρα / Μπαλκονόπορτα', type: '🔒 Ασφάλεια', completed: false },
  { id: 'mb_7', name: 'Έξυπνοι Διακόπτες / Ρελέ (Smart Relays) - Αλέ Ρετούρ', room: '🛏️ Master Bedroom', wall: 'Κομοδίνα & Είσοδος', type: '📡 Έξυπνο Σπίτι', completed: false },

  // --- Bedroom 1 ---
  { id: 'b1_1', name: 'Split Unit & Θερμοστάτης Ενδοδαπέδιας', room: '🛏️ Bedroom 1', wall: 'Τοίχος A/C', type: '🔧 Συντήρηση', completed: false },
  { id: 'b1_2', name: 'Αισθητήρας Παρουσίας mmWave', room: '🛏️ Bedroom 1', wall: 'Γωνία 1 (Ψηλά)', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'b1_3', name: 'Πρίζες & Cat6 (Γραφείο/TV)', room: '🛏️ Bedroom 1', wall: 'Τοίχος Γραφείου', type: '🔌 Πρίζες', completed: false },
  { id: 'b1_4', name: 'Μαγνητικές Επαφές', room: '🛏️ Bedroom 1', wall: 'Παράθυρα', type: '🔒 Ασφάλεια', completed: false },

  // --- Bedroom 2 ---
  { id: 'b2_1', name: 'Split Unit & Θερμοστάτης Ενδοδαπέδιας', room: '🛏️ Bedroom 2', wall: 'Τοίχος A/C', type: '🔧 Συντήρηση', completed: false },
  { id: 'b2_2', name: 'Αισθητήρας Παρουσίας mmWave', room: '🛏️ Bedroom 2', wall: 'Γωνία 1 (Ψηλά)', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'b2_3', name: 'Πρίζες & Cat6 (Γραφείο/TV)', room: '🛏️ Bedroom 2', wall: 'Τοίχος Γραφείου', type: '🔌 Πρίζες', completed: false },
  { id: 'b2_4', name: 'Μαγνητικές Επαφές', room: '🛏️ Bedroom 2', wall: 'Παράθυρα', type: '🔒 Ασφάλεια', completed: false },

  // --- Bathrooms & WC ---
  // WC - Main
  { id: 'wcm_1', name: 'Πρόνοια Ηλεκτρικής Πετσετοκρεμάστρας / Θερμαντικού Σώματος (Towel Rail Heater 230V)', room: '🚽 WC - Main', wall: 'Τοίχος Μπάνιου', type: '🔧 Συντήρηση', completed: false },
  { id: 'wcm_2', name: 'Πρόνοια Μηχανικού Εξαερισμού (Extractor Fan)', room: '🚽 WC - Main', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },
  { id: 'wcm_3', name: 'Πρίζα Μπάνιου (Shaver Socket BS EN 61558-2-5 / IP44)', room: '🚽 WC - Main', wall: 'Τοίχος Νιπτήρα', type: '🔌 Πρίζες', completed: false },
  { id: 'wcm_4', name: 'Έξυπνος Διακόπτης / Ρελέ Φωτισμού', room: '🚽 WC - Main', wall: 'Είσοδος WC', type: '📡 Έξυπνο Σπίτι', completed: false },

  // Ensuite Bathroom
  { id: 'ens_1', name: 'Πρόνοια Ηλεκτρικής Πετσετοκρεμάστρας / Θερμαντικού Σώματος (Towel Rail Heater 230V)', room: '🚽 Ensuite Bathroom', wall: 'Τοίχος Μπάνιου', type: '🔧 Συντήρηση', completed: false },
  { id: 'ens_2', name: 'Πρόνοια Μηχανικού Εξαερισμού (Extractor Fan)', room: '🚽 Ensuite Bathroom', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },
  { id: 'ens_3', name: 'Πρίζα Μπάνιου (Shaver Socket BS EN 61558-2-5 / IP44)', room: '🚽 Ensuite Bathroom', wall: 'Τοίχος Νιπτήρα', type: '🔌 Πρίζες', completed: false },
  { id: 'ens_4', name: 'Έξυπνος Διακόπτης / Ρελέ Φωτισμού', room: '🚽 Ensuite Bathroom', wall: 'Είσοδος Ensuite', type: '📡 Έξυπνο Σπίτι', completed: false },

  // WC Ξένων (χωρίς πετσετοκρεμάστρα)
  { id: 'wcx_1', name: 'Πρόνοια Μηχανικού Εξαερισμού (Extractor Fan)', room: '🚽 WC Ξένων', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },
  { id: 'wcx_2', name: 'Πρίζα Μπάνιου (Shaver Socket BS EN 61558-2-5 / IP44)', room: '🚽 WC Ξένων', wall: 'Τοίχος Νιπτήρα', type: '🔌 Πρίζες', completed: false },
  { id: 'wcx_3', name: 'Έξυπνος Διακόπτης / Ρελέ Φωτισμού', room: '🚽 WC Ξένων', wall: 'Είσοδος WC', type: '📡 Έξυπνο Σπίτι', completed: false },

  // --- Πλυσταριό ---
  { id: 'ply_1', name: 'Πρίζες 16A (Πλυντήριο / Στεγνωτήριο)', room: '🧺 Πλυσταριό', wall: 'Τοίχος Συσκευών', type: '🔌 Πρίζες', completed: false },
  { id: 'ply_2', name: 'Παροχή & Αποχέτευση Νερού', room: '🧺 Πλυσταριό', wall: 'Τοίχος Συσκευών', type: '🚰 Υδραυλικά', completed: false },
  { id: 'ply_3', name: 'Πρόνοια Μηχανικού Εξαερισμού (Extractor Fan / Ventilation)', room: '🧺 Πλυσταριό', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },
  { id: 'ply_4', name: 'Μαγνητικές Επαφές (Αν υπάρχει εξωτερική πόρτα)', room: '🧺 Πλυσταριό', wall: 'Πόρτα', type: '🔒 Ασφάλεια', completed: false },

  // --- Διάδρομος ---
  { id: 'dia_1', name: 'Αισθητήρας Θερμοκρασίας & Υγρασίας (Κεντρικός Έλεγχος)', room: '🛤️ Διάδρομος', wall: 'Κεντρικός Τοίχος', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'dia_2', name: 'Εσωτερική Σειρήνα Συναγερμού', room: '🛤️ Διάδρομος', wall: 'Οροφή', type: '🔒 Ασφάλεια', completed: false },
  { id: 'dia_3', name: 'PoE Access Point', room: '🛤️ Διάδρομος', wall: 'Οροφή', type: '🖥️ Server Cabinet', completed: false },
  { id: 'dia_4', name: 'Φωτισμός Αισθητήρα', room: '🛤️ Διάδρομος', wall: 'Δάπεδο / Οροφή', type: '💡 Φώτα', completed: false },

  // --- Χώρος Εισόδου ---
  { id: 'eis_1', name: 'Smart Doorbell (Κύρια Πόρτα) - PoE Cat6', room: '🚪 Χώρος Εισόδου', wall: 'Εξώπορτα', type: '🔒 Ασφάλεια', completed: false },
  { id: 'eis_2', name: 'Έξυπνη Κλειδαριά (Smart Lock)', room: '🚪 Χώρος Εισόδου', wall: 'Εξώπορτα', type: '🔒 Ασφάλεια', completed: false },
  { id: 'eis_3', name: 'Πληκτρολόγιο Συναγερμού', room: '🚪 Χώρος Εισόδου', wall: 'Εσωτερικός Τοίχος', type: '🔒 Ασφάλεια', completed: false },
  { id: 'eis_4', name: 'Έξυπνοι Διακόπτες Φωτισμού', room: '🚪 Χώρος Εισόδου', wall: 'Εσωτερικός Τοίχος', type: '📡 Έξυπνο Σπίτι', completed: false },

  // --- Βεράντα / BBQ ---
  { id: 'bbq_1', name: 'BBQ Area: Παροχές Ρεύματος & Νερού & Αποχέτευση', room: '🪑 Βεράντα / BBQ', wall: 'Ψησταριά', type: '🚰 Υδραυλικά', completed: false },
  { id: 'bbq_2', name: 'Cinema: Projector (Ταβάνι) - Cat6 & Ρεύμα', room: '🪑 Βεράντα / BBQ', wall: 'Οροφή', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'bbq_3', name: 'Cinema: TV / Οθόνη - HDMI, Cat6, Ρεύμα', room: '🪑 Βεράντα / BBQ', wall: 'Τοίχος Προβολής', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'bbq_4', name: 'Εξωτερικά Heaters (Οροφή) & Ceiling Fans', room: '🪑 Βεράντα / BBQ', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },
  { id: 'bbq_5', name: 'Επιδαπέδια Πρίζα Φωτισμού (Ελιά)', room: '🪑 Βεράντα / BBQ', wall: 'Δάπεδο (Ελιά)', type: '🔌 Πρίζες', completed: false },

  // --- Κήπος / Πισίνα ---
  { id: 'kyp_1', name: 'Φωτισμός Overflow Πισίνας (Ειδική καλωδίωση)', room: '🌳 Κήπος / Πισίνα', wall: 'Υπερυψωμένο Overflow', type: '💡 Φώτα', completed: false },
  { id: 'kyp_2', name: 'Εξωτερική Τουαλέτα & Ντους Πισίνας (Υδραυλικά/Ρεύμα)', room: '🌳 Κήπος / Πισίνα', wall: 'Χώρος Ντους', type: '🚰 Υδραυλικά', completed: false },
  { id: 'kyp_3', name: 'Smart Doorbell (Καγκελόπορτα) - PoE Cat6', room: '🌳 Κήπος / Πισίνα', wall: 'Καγκελόπορτα', type: '🔒 Ασφάλεια', completed: false },
  { id: 'kyp_4', name: 'Πρόνοια Remote Ανοίγματος Καγκελόπορτας', room: '🌳 Κήπος / Πισίνα', wall: 'Καγκελόπορτα', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'kyp_5', name: 'Κάμερες Παρακολούθησης PoE (Περιμετρικά)', room: '🌳 Κήπος / Πισίνα', wall: 'Περίφραξη', type: '🔒 Ασφάλεια', completed: false },
  { id: 'kyp_6', name: 'Εξωτερική Σειρήνα Συναγερμού', room: '🌳 Κήπος / Πισίνα', wall: 'Πρόσοψη', type: '🔒 Ασφάλεια', completed: false },
  { id: 'kyp_7', name: 'Αδιάβροχες Πρίζες Κήπου (π.χ. για φουσκωτό)', room: '🌳 Κήπος / Πισίνα', wall: 'Κήπος', type: '🔌 Πρίζες', completed: false },
  { id: 'kyp_8', name: 'Φωτισμός Περιμετρικά & Ανθώνας', room: '🌳 Κήπος / Πισίνα', wall: 'Κήπος', type: '💡 Φώτα', completed: false },
  { id: 'kyp_9', name: 'Βρύσες Ποτίσματος / Λασάνι', room: '🌳 Κήπος / Πισίνα', wall: 'Κήπος', type: '🚰 Υδραυλικά', completed: false },
  { id: 'kyp_10', name: 'Γεώτρηση (Πρόνοια, Αναμονές Ρεύματος & Αντλίας)', room: '🌳 Κήπος / Πισίνα', wall: 'Μηχανοστάσιο Γεώτρησης', type: '🚰 Υδραυλικά', completed: false },

  // --- Garage / Parking ---
  { id: 'gar_1', name: 'Μπουτόν Ανοίγματος Γκαραζόπορτας (Push Button Control)', room: '🚗 Garage / Parking', wall: 'Τοίχος Εισόδου Γκαράζ', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'gar_2', name: 'Τριφασική Παροχή για EV Charger', room: '🚗 Garage / Parking', wall: 'Τοίχος Φόρτισης', type: '🔌 Πρίζες', completed: false },
  { id: 'gar_3', name: 'Βρύση Πλυσίματος Αυτοκινήτου', room: '🚗 Garage / Parking', wall: 'Τοίχος Φόρτισης', type: '🚰 Υδραυλικά', completed: false },
  { id: 'gar_4', name: 'PoE Κάμερα Garage / Parking', room: '🚗 Garage / Parking', wall: 'Οροφή Garage', type: '🔒 Ασφάλεια', completed: false },
  { id: 'gar_5', name: 'Φωτισμός Αισθητήρα', room: '🚗 Garage / Parking', wall: 'Οροφή Garage', type: '💡 Φώτα', completed: false },

  // --- Μηχανοστάσιο ---
  { id: 'mix_1', name: 'Server Rack (Mini PC, Switch, NVR, Modem, Firewall)', room: '⚙️ Μηχανοστάσιο', wall: 'Rack (Εσωτερικά)', type: '🖥️ Server Cabinet', completed: false },
  { id: 'mix_2', name: '1U Fans για Εξαερισμό Rack', room: '⚙️ Μηχανοστάσιο', wall: 'Rack (Εσωτερικά)', type: '🖥️ Server Cabinet', completed: false },
  { id: 'mix_3', name: 'Παροχή 16A/32A για Server Cabinet', room: '⚙️ Μηχανοστάσιο', wall: 'Τοίχος Rack', type: '🔌 Πρίζες', completed: false },
  { id: 'mix_4', name: 'Ενεργός Εξαερισμός Δωματίου (Αποφυγή Υπερθέρμανσης)', room: '⚙️ Μηχανοστάσιο', wall: 'Οροφή', type: '🔧 Συντήρηση', completed: false },
  { id: 'mix_5', name: 'Φίλτρο Στερεών & Water Softener (Αδιάβροχη Πρίζα & Drain)', room: '⚙️ Μηχανοστάσιο', wall: 'Υδραυλικά', type: '🚰 Υδραυλικά', completed: false },
  { id: 'mix_6', name: 'Ντεπόζιτο Νερού, Boiler & Heat Pump', room: '⚙️ Μηχανοστάσιο', wall: 'Υδραυλικά', type: '🚰 Υδραυλικά', completed: false },
  { id: 'mix_7', name: 'Smart Θερμοστάτης Νερού (Cat6 στο Ντεπόζιτο)', room: '⚙️ Μηχανοστάσιο', wall: 'Υδραυλικά', type: '📡 Έξυπνο Σπίτι', completed: false },
  { id: 'mix_8', name: 'Σύστημα Ανακυκλοφορίας Ζεστού Νερού', room: '⚙️ Μηχανοστάσιο', wall: 'Υδραυλικά', type: '🔧 Συντήρηση', completed: false },
  { id: 'mix_9', name: 'Inverter Φωτοβολταϊκών & Μπαταρία (Cat6 & Σωληνώσεις)', room: '⚙️ Μηχανοστάσιο', wall: 'Τοίχος Φωτοβολταϊκών', type: '🔌 Πρίζες', completed: false },
  
  // --- Βοηθητικό Σπίτι ---
  { id: 'aux_1', name: 'Αναμονές Κρύο/Ζεστό Νερό & Αποχέτευση', room: '🏠 Βοηθητικό Σπίτι', wall: 'Τοίχος Κουζίνας', type: '🚰 Υδραυλικά', completed: false },
  { id: 'aux_2', name: 'Πρίζες Κουζίνας & Συσκευών', room: '🏠 Βοηθητικό Σπίτι', wall: 'Τοίχος Κουζίνας', type: '🔌 Πρίζες', completed: false },
  { id: 'aux_3', name: 'Πρίζες Κομοδίνων & Φόρτισης', room: '🏠 Βοηθητικό Σπίτι', wall: 'Τοίχος Κρεβατιού', type: '🔌 Πρίζες', completed: false },
  { id: 'aux_4', name: 'Φωτισμός Ανάγνωσης', room: '🏠 Βοηθητικό Σπίτι', wall: 'Τοίχος Κρεβατιού', type: '💡 Φώτα', completed: false },
  { id: 'aux_5', name: 'Υποπίνακας Ρεύματος (Αυτόνομο Σύστημα)', room: '🏠 Βοηθητικό Σπίτι', wall: 'Είσοδος', type: '🔌 Πρίζες', completed: false },
  { id: 'aux_6', name: 'Cat6 Σύνδεση με Κυρίως Σπίτι', room: '🏠 Βοηθητικό Σπίτι', wall: 'Είσοδος', type: '🖥️ Server Cabinet', completed: false },
];
