import { QuestionnaireAnswers, CustomProvision, CustomProcurementItem } from '../types/questionnaire';

export function generateProvisionsFromAnswers(answers: QuestionnaireAnswers) {
  const rooms: string[] = [];
  const provisions: CustomProvision[] = [];
  const procurement: CustomProcurementItem[] = [];
  const rules: {
    id: string;
    title: string;
    category: string;
    scope: string;
    criticalRequirement: string;
    notes: string;
  }[] = [];

  // 1. Rooms
  rooms.push('🛋️ Σαλόνι / Τραπεζαρία');
  rooms.push('🍳 Κουζίνα');
  if (answers.hasPantry) rooms.push('🥫 Pantry');
  if (answers.hasOffice) rooms.push('🖥️ Γραφείο');

  if (answers.hasMasterEnsuite) {
    rooms.push('🛏️ Master Bedroom');
    rooms.push('🚽 WC Ensuite');
  } else {
    rooms.push('🛏️ Master Bedroom');
  }

  const bedCount = answers.bedroomsCount || 2;
  for (let i = 1; i <= Math.max(1, bedCount - 1); i++) {
    rooms.push(`🛏️ Bedroom ${i}`);
  }

  rooms.push('🚽 WC - Main');
  if (answers.hasGuestWc) rooms.push('🚽 WC Ξένων');
  if (answers.hasLaundryRoom) rooms.push('🧺 Πλυσταριό');

  rooms.push('🚪 Χώρος Εισόδου');
  rooms.push('🛤️ Διάδρομος');
  if (answers.hasGarageParking) rooms.push('🚗 Parking');
  if (answers.hasVerandaBbq) rooms.push('🪑 Βεράντα / BBQ');
  if (answers.hasGarden || answers.hasPool) rooms.push('🌳 Κήπος / Πισίνα');
  if (answers.hasMachineRoom) rooms.push('⚙️ Μηχανοστάσιο');
  if (answers.hasAuxiliaryHouse) rooms.push('🏠 Βοηθητικό Σπίτι');

  let pId = 1;
  const addProv = (name: string, room: string, wall: string, type: string, details = '', pendingReview = false) => {
    provisions.push({
      id: `prov_${pId++}`,
      name,
      room,
      wall,
      type,
      completed: false,
      pendingReview,
      details
    });
  };

  let bId = 1;
  const addProc = (name: string, category: string, quantity: number, estimatedPriceEur: number, brand: string, model: string, notes: string, isTask = false) => {
    procurement.push({
      id: `proc_${bId++}`,
      name,
      category,
      quantity,
      estimatedPriceEur,
      brand,
      model,
      notes,
      isTask,
      purchased: false
    });
  };

  // --- ΣΑΛΟΝΙ / ΤΡΑΠΕΖΑΡΙΑ ---
  if (answers.centralTouchPanel) {
    addProv('Κεντρικό Touch Panel (Ύψος Ματιού 150cm)', '🛋️ Σαλόνι / Τραπεζαρία', 'Κεντρικός Τοίχος', '📡 Έξυπνο Σπίτι', 'Κεντρικό σημείο οπτικού ελέγχου Home Assistant / Έξυπνου Σπιτιού');
    addProv('Ethernet Port PoE για Touch Panel', '🛋️ Σαλόνι / Τραπεζαρία', 'Κεντρικός Τοίχος', '🖥️ Server Cabinet', 'Αναμονή Cat6 PoE στο ύψος του ματιού για απευθείας τροφοδοσία και δίκτυο');
    addProc('Wall Touch Panel 8" / 10"', '📡 Έξυπνο Σπίτι', 1, 180, 'Tuya / Sonoff / NSPanel', 'NSPanel Pro / Android POE', 'Οθόνη αφής τοίχου με τροφοδοσία PoE για έλεγχο φωτισμού & σεναρίων');
  }

  if (answers.smartLightingRelays) {
    addProv('Έξυπνοι Διακόπτες / Ρελέ (Βαθιά Κουτιά 6cm & Ουδέτερος)', '🛋️ Σαλόνι / Τραπεζαρία', 'Τοίχος Εισόδου', '📡 Έξυπνο Σπίτι', 'Υποχρεωτικός ουδέτερος και βαθιά back-box 6cm');
  }

  if (answers.motorizedCurtains) {
    addProv('Ηλεκτρικές Κουρτίνες / Ρολά (Παροχή Ρεύματος)', '🛋️ Σαλόνι / Τραπεζαρία', 'Παράθυρα / Μπαλκονόπορτα', '📡 Έξυπνο Σπίτι', 'Αναμονή 230V στο κουτί της κουρτίνας/ρολού');
    addProc('Μοτέρ Έξυπνης Κουρτίνας', '📡 Έξυπνο Σπίτι', 2, 85, 'Aqara / Zemismart', 'Curtain Driver E1 / B1', 'Μοτέρ για αυτοματισμό κουρτίνας σαλονιού');
  }

  if (answers.mmWavePresence) {
    addProv('Presense Sensor mmWave (220V/12V)', '🛋️ Σαλόνι / Τραπεζαρία', 'Γωνία 1 (Ψηλά)', '📡 Έξυπνο Σπίτι', 'Αδιάλειπτη τροφοδοσία 220V/12V (όχι μπαταρία) για αληθινή ανίχνευση παρουσίας');
    addProc('Αισθητήρας Παρουσίας mmWave FP2', '📡 Έξυπνο Σπίτι', 1, 75, 'Aqara', 'Presence Sensor FP2', 'Ανίχνευση μικροκινήσεων, πολλαπλών ζωνών & παρακολούθηση θέσης');
  }

  if (answers.poeAccessPoints) {
    addProv('Access Point (Ethernet Port PoE)', '🛋️ Σαλόνι / Τραπεζαρία', 'Οροφή', '🖥️ Server Cabinet', 'Αναμονή Cat6 PoE στην οροφή για απρόσκοπτο Wi-Fi');
  }

  if (answers.hvacType === 'hidden_ducted') {
    addProv('Κρυφός Κλιματισμός (Έλεγχος Modbus/Dry Contact)', '🛋️ Σαλόνι / Τραπεζαρία', 'Οροφή', '🔧 Συντήρηση', 'Διασύνδεση μονάδας VRV/ducted με σύστημα αυτοματισμού');
    addProc('Modbus / Dry Contact Gateway Κλιματισμού', '🔧 Συντήρηση / HVAC', 1, 140, 'Intesis / Airzone', 'Modbus to AC Bridge', 'Γέφυρα διασύνδεσης κλιματιστικού με Home Assistant / BMS');
  }

  if (answers.underfloorHeating) {
    addProv('Θερμοστάτης Ενδοδαπέδιας (Smart)', '🛋️ Σαλόνι / Τραπεζαρία', 'Κεντρικός Τοίχος', '📡 Έξυπνο Σπίτι', 'Έξυπνος θερμοστάτης ζώνης σαλονιού/τραπεζαρίας');
  }

  if (answers.wiredMagneticContacts) {
    addProv('Contact Sensors & Αισθητήρας Θραύσης (12V)', '🛋️ Σαλόνι / Τραπεζαρία', 'Κουφώματα / Τζαμαρίες', '🔒 Ασφάλεια', 'Ενσύρματες επαφές στα κουφώματα και αισθητήρας θραύσης');
  }

  addProv('Πρίζες TV & Ηχοσυστήματος (4x 13A + 2x Cat6)', '🛋️ Σαλόνι / Τραπεζαρία', 'Τοίχος Τηλεόρασης', '🔌 Πρίζες', 'Συγκέντρωση παροχών ρεύματος και δικτύου για media center');
  addProv('Κρυφός Φωτισμός Οροφής LED', '🛋️ Σαλόνι / Τραπεζαρία', 'Οροφή', '💡 Φώτα', 'Περιμετρική αναμονή ταινίας LED');

  // --- ΚΟΥΖΙΝΑ ---
  if (answers.underSink4Outlets) {
    addProv('4x Πρίζες 13A Κάτω από Νεροχύτη (RO, Chiller, Boiler, Σκουπιδοφάγος)', '🍳 Κουζίνα', 'Πάγκος Νεροχύτη', '🔌 Πρίζες', '1: Αντίστροφη Όσμωση, 2: Chiller Sparkling, 3: Boiler Βραστού, 4: Σκουπιδοφάγος');
    addProv('Υδραυλικά: Σύνδεση RO, Chiller, Boiler & Σκουπιδοφάγου', '🍳 Κουζίνα', 'Πάγκος Νεροχύτη', '🚰 Υδραυλικά', 'Αποχετεύσεις, παροχές κρύου νερού & bypass');
  }

  if (answers.garbageDisposalSwitch) {
    addProv('Διακόπτης / Air Switch Σκουπιδοφάγου', '🍳 Κουζίνα', 'Πάγκος Νεροχύτη', '🔌 Πρίζες', 'Πνευματικός ή ηλεκτρικός διακόπτης στον πάγκο');
  }

  if (answers.kitchenIslandSockets) {
    addProv('Χωνευτές / Pop-up Πρίζες 13A Νησίδας', '🍳 Κουζίνα', 'Νησίδα (Πλαϊνό / Πάγκος)', '🔌 Πρίζες', 'Παροχή 230V μέσα από το δάπεδο στη βάση της νησίδας');
    addProv('Εφεδρική Πρίζα 13A Νησίδας', '🍳 Κουζίνα', 'Νησίδα (Πάγκος)', '🔌 Πρίζες', 'Επιπλέον πρίζα για μικροσυσκευές');
  }

  if (answers.fridgeWaterLine) {
    addProv('Σωληνίσκος 1/4" για Παροχή Νερού από Όσμωση στο Ψυγείο', '🍳 Κουζίνα', 'Τοίχος Ψυγείου', '🚰 Υδραυλικά', 'Παροχή φιλτραρισμένου νερού για παγάκια & κρύο νερό');
  }

  if (answers.ledDriverLocation) {
    addProv('Χώρος για Τροφοδοτικά (LED Drivers)', '🍳 Κουζίνα', 'Ψευδοροφή / Ντουλάπι (TBD)', '💡 Φώτα', 'Επισκέψιμος αεριζόμενος χώρος για τροφοδοτικά LED πάγκου', true);
  }

  addProv('Πρίζες Συσκευών (Φούρνος, Επαγωγική, Μικροκύματα, Πλυντήριο Πιάτων)', '🍳 Κουζίνα', 'Τοίχοι Συσκευών', '🔌 Πρίζες', 'Αποκλειστικές γραμμές κατάλληλης διατομής');
  addProv('Ανιχνευτής Καπνού & Θερμότητας', '🍳 Κουζίνα', 'Οροφή', '🔒 Ασφάλεια', 'Ανίχνευση φωτιάς χωρίς ψευδείς συναγερμούς από μαγείρεμα');

  if (answers.mmWavePresence) {
    addProv('Presense Sensor mmWave (220V/12V)', '🍳 Κουζίνα', 'Γωνία 1 (Ψηλά)', '📡 Έξυπνο Σπίτι', 'Αυτόματος έλεγχος φωτισμού κουζίνας');
  }

  // --- PANTRY ---
  if (answers.hasPantry) {
    if (answers.pantryPlumbing) {
      addProv('Αναμονές Νερού (Ζεστό/Κρύο) & Αποχέτευση', '🥫 Pantry', 'Τοίχος Υδραυλικών', '🚰 Υδραυλικά', 'Πρόνοια για δεύτερο νεροχύτη ή πλυντήριο');
    }
    addProv('Αναμονές Ρεύματος (Πρίζες 13A για συσκευές)', '🥫 Pantry', 'Τοίχος Συσκευών', '🔌 Πρίζες', 'Πρίζες για καταψύκτη, καφετιέρα, ρομπότ');
  }

  // --- ΓΡΑΦΕΙΟ ---
  if (answers.hasOffice) {
    addProv('Πολλαπλές Πρίζες 13A/16A & Cat6 (Θέση Γραφείου)', '🖥️ Γραφείο', 'Κύριος Τοίχος Γραφείου', '🔌 Πρίζες', '4x Πρίζες 13A + 2x Ethernet Cat6');
    if (answers.dualEthernetInOffice) {
      addProv('Διπλό Ethernet Port Cat6', '🖥️ Γραφείο', 'Κύριος Τοίχος Γραφείου', '🖥️ Server Cabinet', 'Ενσύρματο Gigabit LAN για σταθμό εργασίας / NAS');
    }
    if (answers.mmWavePresence) {
      addProv('Presense Sensor mmWave (220V/12V)', '🖥️ Γραφείο', 'Γωνία (Ψηλά)', '📡 Έξυπνο Σπίτι', 'Ανίχνευση καθιστής εργασίας χωρίς σβήσιμο φώτων');
    }
    if (answers.poeAccessPoints) {
      addProv('Access Point (Ethernet Port PoE)', '🖥️ Γραφείο', 'Οροφή', '🖥️ Server Cabinet', 'PoE αναμονή οροφής');
    }
    if (answers.motorizedCurtains) {
      addProv('Ηλεκτρικό Ρολό / Κουρτίνα (Παροχή 230V)', '🖥️ Γραφείο', 'Παράθυρο', '📡 Έξυπνο Σπίτι', 'Έλεγχος σκίασης για μείωση αντανάκλασης οθόνης');
    }
  }

  // --- ΥΠΝΟΔΩΜΑΤΙΑ ---
  const allBedrooms = rooms.filter(r => r.includes('Bedroom'));
  allBedrooms.forEach((bedRoom) => {
    addProv('Πρίζες Κομοδίνων & USB Φόρτισης (Και στις 2 πλευρές)', bedRoom, 'Τοίχος Κρεβατιού', '🔌 Πρίζες', '2x 13A ανά πλευρά + διακόπτες αλέ-ρετούρ');
    addProv('Πρίζα TV & Cat6 Ethernet Port', bedRoom, 'Τοίχος Τηλεόρασης', '🔌 Πρίζες', 'Αναμονή για Smart TV');
    if (answers.smartLightingRelays) {
      addProv('Έξυπνος Διακόπτης / Ρελέ (Βαθύ Κουτί 6cm με Ουδέτερο)', bedRoom, 'Είσοδος Δωματίου', '📡 Έξυπνο Σπίτι', 'Έλεγχος κύριου φωτισμού');
    }
    if (answers.motorizedCurtains) {
      addProv('Ηλεκτρικό Ρολό / Κουρτίνα (Παροχή 230V)', bedRoom, 'Παράθυρο', '📡 Έξυπνο Σπίτι', 'Αυτοματισμός πρωινού ξυπνήματος');
    }
    if (answers.mmWavePresence) {
      addProv('Presense Sensor mmWave (220V/12V)', bedRoom, 'Γωνία (Ψηλά)', '📡 Έξυπνο Σπίτι', 'Ανίχνευση ύπνου & απαλός νυχτερινός φωτισμός');
    }
    if (answers.underfloorHeating) {
      addProv('Θερμοστάτης Ενδοδαπέδιας', bedRoom, 'Τοίχος Εισόδου', '📡 Έξυπνο Σπίτι', 'Ανεξάρτητη ζώνη θερμοκρασίας');
    }
  });

  // --- ΜΠΑΝΙΑ & WC ---
  const allBathrooms = rooms.filter(r => r.includes('WC') || r.includes('Bathroom'));
  allBathrooms.forEach((bathRoom) => {
    if (answers.cyprusShaverSockets) {
      addProv('Shaver Supply Unit IP44 (BS EN 61558-2-5)', bathRoom, 'Δίπλα σε Καθρέφτη / Νιπτήρα', '🔌 Πρίζες', 'Αποκλειστικά εγκεκριμένη πρίζα ξυριστικής βάσει BS 7671 (απαγορεύονται κοινές 13A)');
    }
    if (answers.mechanicalVentilation) {
      addProv('Μηχανικός Εξαερισμός Οροφής με Timer CRZ (230V)', bathRoom, 'Οροφή', '🚰 Υδραυλικά', 'Αθόρυβος εξαεριστήρας για απομάκρυνση υδρατμών');
    }
    addProv('Φωτισμός Καθρέφτη LED & Κρυφός Φωτισμός', bathRoom, 'Τοίχος Νιπτήρα', '💡 Φώτα', 'Παροχή ρεύματος για φωτιζόμενο καθρέφτη');
    addProv('Πρόνοια Ηλεκτρικής Πετσετοκρεμάστρας (IPX4)', bathRoom, 'Τοίχος Πετσετοκρεμάστρας', '🔌 Πρίζες', 'Ανεξάρτητος διακόπτης / αναμονή ρεύματος');
  });

  // --- ΠΛΥΣΤΑΡΙΟ ---
  if (answers.hasLaundryRoom) {
    addProv('Πρίζες Πλυντηρίου & Στεγνωτηρίου (Ανεξάρτητες γραμμές)', '🧺 Πλυσταριό', 'Τοίχος Συσκευών', '🔌 Πρίζες', '2x 16A ανεξάρτητες ασφάλειες στον πίνακα');
    addProv('Αναμονές Νερού & Διπλή Αποχέτευση', '🧺 Πλυσταριό', 'Τοίχος Συσκευών', '🚰 Υδραυλικά', 'Παροχές κρύου νερού & σιφόνια');
    if (answers.mechanicalVentilation) {
      addProv('Μηχανικός Εξαερισμός Οροφής (230V)', '🧺 Πλυσταριό', 'Οροφή', '🚰 Υδραυλικά', 'Ταχεία απομάκρυνση υγρασίας στεγνώματος');
    }
  }

  // --- ΕΙΣΟΔΟΣ & ΔΙΑΔΡΟΜΟΙ ---
  if (answers.smartDoorbellPoe) {
    addProv('Smart Video Doorbell (Cat6 PoE)', '🚪 Χώρος Εισόδου', 'Εξωτερική Πόρτα Εισόδου', '🔒 Ασφάλεια', 'Αναμονή Cat6 PoE για έξυπνο κουδούνι με κάμερα');
    addProc('Smart Video Doorbell PoE', '🔒 Ασφάλεια', 1, 190, 'Reolink / UniFi', 'Doorbell PoE / G4 Doorbell', 'Ενσύρματο έξυπνο κουδούνι με κάμερα δύο δρόμων');
  }
  addProv('Πληκτρολόγιο Συναγερμού (Αναμονή 12V / Bus)', '🚪 Χώρος Εισόδου', 'Τοίχος Εισόδου', '🔒 Ασφάλεια', 'Σημείο όπλισης / αφόπλισης');
  addProv('Master Switch "All Off" (Αναμονή Έξυπνου Σεναρίου)', '🚪 Χώρος Εισόδου', 'Τοίχος Εισόδου', '📡 Έξυπνο Σπίτι', 'Μπουτόν απενεργοποίησης όλων των φώτων κατά την έξοδο');

  // --- ΜΗΧΑΝΟΣΤΑΣΙΟ / SERVER CABINET ---
  if (answers.hasMachineRoom || answers.serverRackInUtility) {
    const rackRoom = answers.hasMachineRoom ? '⚙️ Μηχανοστάσιο' : '🚪 Χώρος Εισόδου';
    addProv('Server Rack 10"/19" με Patch Panel Cat6', rackRoom, 'Τοίχος Δικτύου', '🖥️ Server Cabinet', 'Κεντρικό σημείο συγκέντρωσης όλων των καλωδίων Cat6 του σπιτιού');
    addProv('PoE Gigabit Managed Switch', rackRoom, 'Server Rack', '🖥️ Server Cabinet', 'Τροφοδοσία καμερών, access points και touch panel');
    
    addProc('Server Rack 10" ή 19" (6U / 9U)', '🖥️ Server Cabinet', 1, 110, 'Triton / Lanberg', 'Wall-mount 9U 19" Rack', 'Επιτοίχιο rack για patch panel, switch και mini PC');
    addProc('Cat6 Patch Panel 24 Θυρών', '🖥️ Server Cabinet', 1, 45, 'Digitus / Excel', 'Cat6 24-port UTP/FTP', 'Τερματισμός ενσύρματων γραμμών');
    addProc('PoE+ Gigabit Switch 16/24 Θυρών', '🖥️ Server Cabinet', 1, 195, 'UniFi / TP-Link Omada', 'USW-16-POE / TL-SG2218P', 'Διακόπτης δικτύου PoE για τροφοδοσία APs και καμερών');

    if (answers.centralUps) {
      addProv('Κεντρικό UPS Rack-mount (Αδιάλειπτη Τροφοδοσία)', rackRoom, 'Server Rack', '🔒 Ασφάλεια', 'Backup τροφοδοσίας δικτύου, καμερών, modem & Home Assistant');
      addProc('Line-Interactive UPS 1000VA-1500VA', '🔒 Ασφάλεια', 1, 160, 'APC / Eaton', 'Smart-UPS / Eaton 5SC', 'Αδιάλειπτη τροφοδοσία server rack και συναγερμού');
    }

    addProc('Home Assistant Green / Mini PC Server', '📡 Έξυπνο Σπίτι', 1, 120, 'Home Assistant / Intel N100', 'HA Green / N100 Mini PC', 'Κεντρικός τοπικός ελεγκτής αυτοματισμού σπιτιού');
    addProc('Zigbee / Matter USB Coordinator', '📡 Έξυπνο Σπίτι', 1, 35, 'Sonoff / SkyConnect', 'Sonoff ZBDongle-E', 'Κεντρικός πομποδέκτης Zigbee 3.0 & Thread');
  }

  // --- PARKING & EV CHARGER ---
  if (answers.hasGarageParking) {
    if (answers.evCharger) {
      addProv('Τριφασική Παροχή EV Charger 32A (5x6mm² με RCD Type B)', '🚗 Parking', 'Κεντρικός Τοίχος Parking', '🔌 Πρίζες', 'Αποκλειστική γραμμή για φορτιστή ηλεκτρικού αυτοκινήτου 11kW/22kW');
      addProc('Smart EV Charger 11kW / 22kW', '🔌 Πρίζες', 1, 550, 'Wallbox / Fronius / Tesla', 'Pulsar Plus 22kW', 'Έξυπνος σταθμός φόρτισης ηλεκτρικού αυτοκινήτου με Wi-Fi/OCPP');
    }
    addProv('Μπουτόν / Έλεγχος Γκαραζόπορτας (Dry Contact)', '🚗 Parking', 'Τοίχος Εισόδου Parking', '📡 Έξυπνο Σπίτι', 'Έξυπνο ρελέ για αυτόματο άνοιγμα γκαραζόπορτας');
    addProv('Εφεδρικές Πρίζες 13A IP65 (Εξωτερικές)', '🚗 Parking', 'Πλαϊνός Τοίχος', '🔌 Πρίζες', 'Πρίζες για ηλεκτρικά εργαλεία / σκούπα');
    if (answers.poeCCTV) {
      addProv('Κάμερα Ασφαλείας PoE (Εξωτερική IP66)', '🚗 Parking', 'Γωνία Οροφής Parking', '🔒 Ασφάλεια', 'Κάλυψη εισόδου γκαράζ');
    }
  }

  // --- ΒΕΡΑΝΤΑ / BBQ ---
  if (answers.hasVerandaBbq) {
    addProv('Στεγανές Πρίζες 13A IP66 (Πάγκος BBQ)', '🪑 Βεράντα / BBQ', 'Τοίχος BBQ', '🔌 Πρίζες', 'Πρίζες για ψησταριά, ψυγείο βεράντας, μοτέρ σούβλας');
    addProv('Παροχή Νερού & Αποχέτευση Νεροχύτη BBQ', '🪑 Βεράντα / BBQ', 'Πάγκος BBQ', '🚰 Υδραυλικά', 'Εξωτερικός νεροχύτης');
    addProv('Φωτισμός Βεράντας & Ανεμιστήρες Οροφής', '🪑 Βεράντα / BBQ', 'Οροφή Βεράντας', '💡 Φώτα', 'Ανεξάρτητοι διακόπτες για φωτισμό & ανεμιστήρες');
    if (answers.poeAccessPoints) {
      addProv('Access Point Εξωτερικού Χώρου (Cat6 PoE Outdoor)', '🪑 Βεράντα / BBQ', 'Οροφή / Τοίχος', '🖥️ Server Cabinet', 'Wi-Fi κάλυψη εξωτερικού χώρου & κήπου');
    }
  }

  // --- ΚΗΠΟΣ & ΠΙΣΙΝΑ ---
  if (answers.hasGarden || answers.hasPool) {
    if (answers.smartIrrigation) {
      addProv('Αναμονή Ηλεκτροβανών Αυτόματου Ποτίσματος (24V)', '🌳 Κήπος / Πισίνα', 'Φρεάτιο Ποτίσματος', '🚰 Υδραυλικά', 'Καλωδίωση πολλαπλών ζωνών για smart controller');
      addProc('Smart Irrigation Controller 4-8 Ζωνών', '🚰 Υδραυλικά', 1, 110, 'LinkTap / Netro / Sonoff', 'Smart Watering Controller', 'Έξυπνος ελεγκτής ποτίσματος με πρόβλεψη καιρού');
    }
    if (answers.gardenLightingCircuits) {
      addProv('Ξεχωριστά Κυκλώματα Φωτισμού Κήπου (IP67)', '🌳 Κήπος / Πισίνα', 'Παρτέρια / Διάδρομοι', '💡 Φώτα', 'Αυτόνομη ασφάλιση στον πίνακα για αποφυγή πτώσης γενικού σε υγρασία');
    }
    if (answers.hasPool) {
      addProv('Ηλεκτρολογικός Πίνακας & Αυτοματισμός Πισίνας', '🌳 Κήπος / Πισίνα', 'Μηχανοστάσιο Πισίνας', '🔧 Συντήρηση', 'Αναμονή για αντλία inverter, φωτισμό πισίνας & μετρητές PH/Cl');
    }
    if (answers.poeCCTV) {
      addProv('Κάμερες CCTV PoE Περιμετρικά Κήπου', '🌳 Κήπος / Πισίνα', 'Εξωτερικοί Τοίχοι', '🔒 Ασφάλεια', 'Περιμετρική εποπτεία με αναγνώριση ανθρώπου/οχήματος');
    }
  }

  // --- CCTV & SENSORS PROCUREMENT CALCULATIONS ---
  const cctvCount = (answers.poeCCTV ? 4 : 0) + (answers.hasGarageParking && answers.poeCCTV ? 1 : 0) + (answers.hasGarden && answers.poeCCTV ? 2 : 0);
  if (cctvCount > 0) {
    addProc('Κάμερες Ασφαλείας PoE 4K/5MP (IP66/IP67)', '🔒 Ασφάλεια', cctvCount, 75, 'Reolink / UniFi Protect', 'RLC-810A / G5 Bullet', 'Κάμερες εξωτερικού χώρου με ανίχνευση AI & νυχτερινή όραση');
    addProc('NVR Καταγραφικό 8/16 Καναλιών ή Hard Drive NAS', '🔒 Ασφάλεια', 1, 210, 'Reolink / Synology', 'RLN8-410 / WD Purple 4TB', 'Τοπική συνεχής καταγραφή 24/7 χωρίς συνδρομές cloud');
  }

  const apCount = (answers.poeAccessPoints ? 2 : 0) + (answers.floors > 1 ? (answers.floors - 1) : 0) + (answers.hasVerandaBbq ? 1 : 0);
  if (apCount > 0) {
    addProc('Wi-Fi 6 / 6E Access Points PoE', '🖥️ Server Cabinet', apCount, 120, 'Ubiquiti / TP-Link Omada', 'U6+ / EAP653', 'Επιτοίχια / οροφής Access Points για gigabit roaming');
  }

  if (answers.smartLightingRelays) {
    const totalRelays = Math.max(8, rooms.length * 2);
    addProc('Έξυπνα Ρελέ Διακοπτών (Shelly Plus 1PM / 2PM)', '📡 Έξυπνο Σπίτι', totalRelays, 18, 'Shelly', 'Plus 1PM (Wi-Fi/Bluetooth)', 'Μονάδες μέτρησης κατανάλωσης & ελέγχου πίσω από τους διακόπτες');
  }

  // --- GENERAL RULES ---
  if (answers.deepBackboxes6cm) {
    rules.push({
      id: 'rule_deep_boxes',
      title: 'Βαθιά Κουτιά 6cm & Ουδέτερος σε Όλους τους Διακόπτες',
      category: '🔌 Πρίζες & Διακόπτες',
      scope: 'Όλοι οι διακόπτες φωτισμού και πρίζες του σπιτιού',
      criticalRequirement: '1) Βαθιά back-boxes τουλάχιστον 6cm βάθος.\n2) Υποχρεωτικό καλώδιο ουδέτερου (Neutral) σε κάθε διακόπτη.',
      notes: 'Απαραίτητο για εγκατάσταση έξυπνων ρελέ χωρίς σκαψίματα εκ των υστέρων.'
    });
  }

  if (answers.spareSocketPerWall) {
    rules.push({
      id: 'rule_spare_plugs',
      title: 'Εφεδρική Πρίζα (Spare) σε Κάθε Τοίχο',
      category: '🔌 Πρίζες & Διακόπτες',
      scope: 'Όλοι οι τοίχοι σε όλα τα δωμάτια',
      criticalRequirement: 'Τουλάχιστον 1x ελεύθερη πρίζα 13A ανά τοίχο πέραν των αποκλειστικών συσκευών.',
      notes: 'Εξασφαλίζει ευελιξία για σκούπες, φωτιστικά και μελλοντική επίπλωση.'
    });
  }

  if (answers.cyprusShaverSockets) {
    rules.push({
      id: 'rule_bathroom_sockets',
      title: 'Πρότυπα Ασφαλείας Μπάνιων Κύπρου (BS 7671 / ΑΗΚ)',
      category: '🔌 Πρίζες & Διακόπτες',
      scope: 'Όλα τα μπάνια και WC',
      criticalRequirement: 'Απαγορεύονται κοινές πρίζες 13A σε υγρές ζώνες. Χρήση αποκλειστικά Shaver Supply Unit IP44 (BS EN 61558-2-5).',
      notes: 'Συμμόρφωση με τους κανονισμούς ηλεκτρικών εγκαταστάσεων της ΑΗΚ.'
    });
  }

  if (answers.evCharger) {
    rules.push({
      id: 'rule_ev_power',
      title: 'Τριφασική Παροχή EV Charger 32A',
      category: '🔌 Πρίζες & Διακόπτες',
      scope: 'Parking',
      criticalRequirement: 'Ανεξάρτητη τριφασική γραμμή 32A (5x6mm²) με διακόπτη διαρροής RCD Type B στον κεντρικό πίνακα.',
      notes: 'Επιτρέπει φόρτιση 11kW ή 22kW για όλα τα σύγχρονα ηλεκτρικά οχήματα.'
    });
  }

  return {
    rooms,
    provisions,
    procurement,
    rules
  };
}
