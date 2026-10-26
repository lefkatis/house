import initSqlJs, { Database } from 'sql.js';
import { useState, useEffect } from 'react';
import { PROVISIONS, Provision } from '../data/provisions';
import { PROCUREMENT_ITEMS, ProcurementItem } from '../data/procurementItems';
import { GENERAL_RULES, GeneralRule } from '../data/generalRules';
import { INITIAL_VENDOR_OFFERS, VendorOffer } from '../data/offersData';

const STORAGE_KEY = 'house_sqlite_db_v1';
const LEGACY_STORAGE_KEY = 'lefkpronies_sqlite_db_v2';
const UNDO_STORAGE_KEY = 'house_sqlite_undo_stack_v1';
const REDO_STORAGE_KEY = 'house_sqlite_redo_stack_v1';
const LAST_ACTION_STORAGE_KEY = 'house_sqlite_last_action_v1';
const MAX_UNDO_STACK = 100;

export interface UndoAction {
  id: string;
  timestamp: number;
  description: string;
  inverseSql: string[];
  forwardSql: string[];
}

type Listener = () => void;

class SQLiteService {
  private db: Database | null = null;
  private isInitializing = false;
  private listeners: Set<Listener> = new Set();
  private undoStack: UndoAction[] = [];
  private redoStack: UndoAction[] = [];
  private lastActionDescription: string | null = null;
  private isReady = false;

  public async init(): Promise<Database> {
    if (this.db) return this.db;
    if (this.isInitializing) {
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (this.db) {
            clearInterval(check);
            resolve(this.db);
          }
        }, 50);
      });
    }

    this.isInitializing = true;

    try {
      const base = import.meta.env.BASE_URL || '/';
      const wasmPath = `${base.endsWith('/') ? base : base + '/'}sql-wasm.wasm`;

      let SQL: any;
      try {
        SQL = await initSqlJs({
          locateFile: (file) => (file === 'sql-wasm.wasm' ? wasmPath : file)
        });
      } catch (primaryErr) {
        console.warn('Primary SQLite WASM failed, attempting CDN fallback:', primaryErr);
        SQL = await initSqlJs({
          locateFile: (file) => (file === 'sql-wasm.wasm' ? 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm' : file)
        });
      }

      let activeDb: Database;
      const savedDbBase64 = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (savedDbBase64) {
        try {
          const binaryString = atob(savedDbBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          activeDb = new SQL.Database(bytes);
        } catch (err) {
          console.warn('Failed to restore SQLite database from storage, initializing fresh:', err);
          activeDb = new SQL.Database();
          this.seedInitialData(activeDb);
        }
      } else {
        activeDb = new SQL.Database();
        this.seedInitialData(activeDb);
      }

      this.ensureSchema(activeDb);
      this.db = activeDb;
      this.restoreStacksFromStorage();
      this.saveToStorage();
      this.isReady = true;
      this.notify();
      return this.db;
    } catch (error) {
      console.error('Failed to initialize SQLite WASM:', error);
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => (file === 'sql-wasm.wasm' ? 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/sql-wasm.wasm' : file)
        });
        const fallbackDb = new SQL.Database();
        this.seedInitialData(fallbackDb);
        this.ensureSchema(fallbackDb);
        this.db = fallbackDb;
        this.restoreStacksFromStorage();
        this.saveToStorage();
        this.isReady = true;
        this.notify();
        return this.db;
      } catch (fallbackErr) {
        console.error('All SQLite WASM initializations failed:', fallbackErr);
        throw fallbackErr;
      }
    } finally {
      this.isInitializing = false;
    }
  }

  private restoreStacksFromStorage() {
    try {
      const savedUndo = localStorage.getItem(UNDO_STORAGE_KEY);
      if (savedUndo) {
        const parsed = JSON.parse(savedUndo);
        if (Array.isArray(parsed)) {
          this.undoStack = parsed;
        }
      }
      const savedRedo = localStorage.getItem(REDO_STORAGE_KEY);
      if (savedRedo) {
        const parsed = JSON.parse(savedRedo);
        if (Array.isArray(parsed)) {
          this.redoStack = parsed;
        }
      }
      const savedLast = localStorage.getItem(LAST_ACTION_STORAGE_KEY);
      if (savedLast) {
        this.lastActionDescription = savedLast;
      }
    } catch (stackLoadErr) {
      console.warn('Could not restore undo/redo stack from storage:', stackLoadErr);
    }
  }

  public getIsReady(): boolean {
    return this.isReady;
  }

  private ensureSchema(db: Database) {
    db.run(`
      CREATE TABLE IF NOT EXISTS provisions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        room TEXT NOT NULL,
        wall TEXT NOT NULL,
        type TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        pending_review INTEGER NOT NULL DEFAULT 0,
        details TEXT
      );

      CREATE TABLE IF NOT EXISTS procurement_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        brand TEXT,
        model TEXT,
        link TEXT,
        estimated_price_eur REAL,
        price_range TEXT,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit TEXT NOT NULL,
        rooms TEXT NOT NULL,
        is_task INTEGER NOT NULL DEFAULT 0,
        is_optional INTEGER NOT NULL DEFAULT 0,
        task_description TEXT,
        notes TEXT NOT NULL,
        purchased INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS general_rules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        scope TEXT NOT NULL,
        rule TEXT NOT NULL,
        critical_requirement TEXT NOT NULL,
        notes TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS vendor_offers (
        id TEXT PRIMARY KEY,
        vendor_id TEXT NOT NULL,
        vendor_name TEXT NOT NULL,
        data_json TEXT NOT NULL
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        id TEXT PRIMARY KEY,
        applied_at INTEGER NOT NULL
      );
    `);

    this.applyMigrations(db);

    db.run(`

      -- Data migration: insert Samsung Bespoke AI Refrigerator RF65DG9H0EB1EF
      INSERT OR IGNORE INTO procurement_items (
        id, name, category, brand, model, link, estimated_price_eur, price_range,
        quantity, unit, rooms, is_task, is_optional, task_description, notes, purchased
      ) VALUES (
        'buy_samsung_fridge_rf65',
        'Ψυγείο Ντουλάπα Samsung Bespoke AI Family Hub™ (RF65DG9H0EB1EF)',
        '🍳 Οικιακές Συσκευές & Κουζίνα',
        'Samsung',
        'RF65DG9H0EB1EF (Bespoke AI Family Hub™ 4-Door French Door 636L)',
        'https://www.samsung.com/',
        2800,
        '€2.500 - €3.200',
        1,
        'τεμ.',
        '["🍳 Κουζίνα"]',
        0,
        0,
        NULL,
        'Bespoke AI 4-Door French Door (636L) με έξυπνη οθόνη αφής Family Hub™ και εσωτερική κάμερα AI Vision. Διαθέτει Beverage Center™ (εσωτερική βρύση & αυτόματη κανάτα νερού) και Dual Auto Ice Maker (παγάκια & Ice Bites™). ΚΡΙΣΙΜΟ ΓΙΑ ΠΡΟΝΟΙΕΣ: Απαιτεί μόνιμη παροχή νερού 1/4" (συνδέεται με την πρόνοια kou_7) και πρίζα ρεύματος 13A/16A στον τοίχο του ψυγείου. Διαστάσεις: 91.2cm (Π) x 183.0cm (Υ) x 72.3cm (Β).',
        0
      );

      -- Data migration: insert provisions for heated pool (kyp_11, kyp_12)
      INSERT OR IGNORE INTO provisions (id, name, room, wall, type, completed, pending_review, details)
      VALUES (
        'kyp_11',
        'Θερμαινόμενη Πισίνα: Υδραυλικό Bypass & 2x Σωλήνες PVC d50/d63 για Heat Pump',
        '🌳 Κήπος / Πισίνα',
        'Μηχανοστάσιο Πισίνας',
        '🚰 Υδραυλικά',
        0,
        0,
        'Αναμονή υδραυλικού Bypass με 3 βάνες PVC (Ø50mm ή Ø63mm) στην έξοδο του φίλτρου πισίνας και 2 σωλήνες PVC πιέσεως (προσαγωγή & επιστροφή) που καταλήγουν στην εξωτερική βάση της αντλίας θερμότητας πισίνας.'
      );

      INSERT OR IGNORE INTO provisions (id, name, room, wall, type, completed, pending_review, details)
      VALUES (
        'kyp_12',
        'Θερμαινόμενη Πισίνα: Παροχή Ρεύματος & Καλώδιο Εντολής Αντλίας Θερμότητας (Interlock)',
        '🌳 Κήπος / Πισίνα',
        'Βάση Αντλίας Θερμότητας Πισίνας',
        '🔌 Πρίζες',
        0,
        0,
        'Ανεξάρτητη γραμμή ρεύματος (μονοφασική 3x6mm² 25A-32A C-curve ή τριφασική 5x2.5mm²/5x4mm²) από τον κεντρικό/υποπίνακα προς την εξωτερική βάση της Pool Heat Pump + καλώδιο εντολής/σήματος (interlock 2x1mm² ή Cat6a) προς τον πίνακα της αντλίας κυκλοφορίας για αυτόματη έναρξη ροής όταν ζητείται θέρμανση.'
      );

      -- Data migration: insert procurement items for Pool Heat Pump and Cover
      INSERT OR IGNORE INTO procurement_items (
        id, name, category, brand, model, link, estimated_price_eur, price_range,
        quantity, unit, rooms, is_task, is_optional, task_description, notes, purchased
      ) VALUES (
        'buy_pool_heat_pump',
        'Inverter Αντλία Θερμότητας Πισίνας (Pool Heat Pump με Εναλλάκτη Τιτανίου & Wi-Fi)',
        '🌿 Κήπος, Deck & Εξωτερικοί Χώροι',
        'Fairland / Hayward / Zodiac / AstralPool',
        'Full-Inverter Pool Heat Pump (~13kW - 18kW, COP έως 15, R32, Wi-Fi Smart)',
        NULL,
        1800,
        '€1.400 - €2.500',
        1,
        'τεμ.',
        '["🌳 Κήπος / Πισίνα"]',
        1,
        0,
        'Διαστασιολόγηση Inverter αντλίας θερμότητας πισίνας βάσει κυβικών νερού (m³) και επιφάνειας για επέκταση της κολυμβητικής σεζόν (π.χ. Απρίλιο - Νοέμβριο στους 28°C-30°C). Απαιτείται εξωτερική βάση έδρασης με καλό εξαερισμό, υδραυλικό bypass d50/d63 στο μηχανοστάσιο και ανεξάρτητη γραμμή ρεύματος (3x6mm² μονοφασική ή 5x2.5mm² τριφασική) + interlock με την αντλία φίλτρου.',
        'Αυτόνομη Pool Heat Pump με εναλλάκτη τιτανίου ανθεκτικό σε χλώριο/αλάτι. Συνδέεται στο bypass του μηχανοστασίου. Το θερμομονωτικό κάλυμμα είναι υποχρεωτικό για να μην χάνεται η θερμότητα τη νύχτα.',
        0
      );

      INSERT OR IGNORE INTO procurement_items (
        id, name, category, brand, model, link, estimated_price_eur, price_range,
        quantity, unit, rooms, is_task, is_optional, task_description, notes, purchased
      ) VALUES (
        'buy_pool_cover',
        'Θερμομονωτικό Κάλυμμα Πισίνας (Solar Bubble Cover ή Αυτόματο Slat Cover)',
        '🌿 Κήπος, Deck & Εξωτερικοί Χώροι',
        'Προς Επιλογή',
        'Geobubble 500 micron Thermal Cover με μηχανισμό τύλιξης (Roller) ή Αυτόματο Slat',
        NULL,
        650,
        '€400 - €1.200 (ή €4.000+ για ηλεκτρικό slat)',
        1,
        'σετ',
        '["🌳 Κήπος / Πισίνα"]',
        1,
        0,
        'Χωρίς θερμομονωτικό κάλυμμα, το 75% της θερμότητας της πισίνας χάνεται τη νύχτα μέσω εξάτμισης. Επιλογή θερμομονωτικού καλύμματος (π.χ. Geobubble 500 micron με κύλινδρο τύλιξης inox) για διατήρηση της θερμοκρασίας και μείωση της κατανάλωσης ρεύματος της αντλίας κατά 60-70%.',
        'Απολύτως απαραίτητο για θερμαινόμενη πισίνα. Εμποδίζει την εξάτμιση και κρατά το νερό ζεστό τη νύχτα.',
        0
      );
    `);

    // Migration: ensure is_optional column exists in procurement_items
    try {
      const checkCol = db.exec("PRAGMA table_info(procurement_items)");
      if (checkCol.length > 0) {
        const hasOptional = checkCol[0].values.some((col: any[]) => col[1] === 'is_optional');
        if (!hasOptional) {
          db.run("ALTER TABLE procurement_items ADD COLUMN is_optional INTEGER NOT NULL DEFAULT 0;");
        }
      }
    } catch (e) {
      console.warn("Could not alter procurement_items table:", e);
    }

    // Ensure all default provisions are seeded (for existing DB instances)
    try {
      const insertProvStmt = db.prepare(`
        INSERT OR IGNORE INTO provisions (id, name, room, wall, type, completed, pending_review, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of PROVISIONS) {
        insertProvStmt.run([
          p.id,
          p.name,
          p.room,
          p.wall || '',
          p.type,
          p.completed ? 1 : 0,
          p.pendingReview ? 1 : 0,
          p.details || null
        ]);
      }
      insertProvStmt.free();
    } catch (e) {
      console.warn("Could not seed default provisions:", e);
    }

    // Ensure all default procurement items are seeded (for existing DB instances)
    try {
      const insertProcStmt = db.prepare(`
        INSERT OR IGNORE INTO procurement_items (
          id, name, category, brand, model, link, estimated_price_eur, price_range,
          quantity, unit, rooms, is_task, is_optional, task_description, notes, purchased
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const item of PROCUREMENT_ITEMS) {
        insertProcStmt.run([
          item.id,
          item.name,
          item.category,
          item.brand || null,
          item.model || null,
          item.link || null,
          item.estimatedPriceEur ?? null,
          item.priceRange || null,
          item.quantity,
          item.unit,
          JSON.stringify(item.rooms),
          item.isTask ? 1 : 0,
          item.isOptional ? 1 : 0,
          item.taskDescription || null,
          item.notes,
          item.purchased ? 1 : 0
        ]);
      }
      insertProcStmt.free();
    } catch (e) {
      console.warn("Could not seed default procurement items:", e);
    }

    // Ensure all default general rules are seeded (for existing DB instances)
    try {
      const insertRuleStmt = db.prepare(`
        INSERT OR IGNORE INTO general_rules (id, title, category, scope, rule, critical_requirement, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of GENERAL_RULES) {
        insertRuleStmt.run([
          r.id,
          r.title,
          r.category,
          r.scope,
          r.rule,
          r.criticalRequirement,
          r.notes
        ]);
      }
      insertRuleStmt.free();
    } catch (e) {
      console.warn("Could not seed default general rules:", e);
    }

    // Ensure all default vendor offers are seeded (for existing DB instances)
    try {
      const insertOfferStmt = db.prepare(`
        INSERT OR IGNORE INTO vendor_offers (id, vendor_id, vendor_name, data_json)
        VALUES (?, ?, ?, ?)
      `);
      for (const o of INITIAL_VENDOR_OFFERS) {
        insertOfferStmt.run([
          o.id,
          o.id,
          o.vendorName,
          JSON.stringify(o)
        ]);
      }
      insertOfferStmt.free();
    } catch (e) {
      console.warn("Could not seed default vendor offers:", e);
    }
  }

  private applyMigrations(db: Database) {
    try {
      const check = db.exec("SELECT 1 FROM _schema_migrations WHERE id = 'initial_sync_v1'");
      if (check.length > 0 && check[0].values.length > 0) {
        // Migration has already run. Do NOT overwrite user modifications!
        return;
      }

      // 1. Move server cabinet provisions from mechanical room to dedicated server cabinet
      db.run(`
        UPDATE provisions 
        SET room = '🖥️ Server Cabinet' 
        WHERE id IN ('mix_1', 'mix_2', 'mix_3', 'mix_4') AND room = '⚙️ Μηχανοστάσιο';
      `);

      // 2. Update Cat6 to Cat6a
      db.run(`
        UPDATE provisions SET name = REPLACE(name, 'Cat6', 'Cat6a') WHERE name LIKE '%Cat6%';
        UPDATE provisions SET details = REPLACE(details, 'Cat6', 'Cat6a') WHERE details LIKE '%Cat6%';
        UPDATE procurement_items SET notes = REPLACE(notes, 'Cat6', 'Cat6a') WHERE notes LIKE '%Cat6%';
      `);

      // 3. Remove obsolete items
      db.run(`
        DELETE FROM procurement_items WHERE id = 'buy_towel_rail_switches';
        DELETE FROM general_rules WHERE id = 'rule_towel_rail';
        DELETE FROM provisions WHERE id IN ('wcm_5', 'ens_5');
        DELETE FROM procurement_items WHERE id = 'buy_ev_charger';
      `);

      // Mark initial migration as completed
      db.run("INSERT OR REPLACE INTO _schema_migrations (id, applied_at) VALUES ('initial_sync_v1', ?)", [Date.now()]);
    } catch (e) {
      console.warn("applyMigrations notice:", e);
    }

    // Migration: Rename 'Παροχή Ηλεκτρικής Πετσετοκρεμάστρας' to 'Παροχή Towel Rail'
    try {
      const checkTowel = db.exec("SELECT 1 FROM _schema_migrations WHERE id = 'rename_towel_rail_v1'");
      if (checkTowel.length === 0 || checkTowel[0].values.length === 0) {
        db.run(`
          UPDATE provisions 
          SET name = REPLACE(name, 'Παροχή Ηλεκτρικής Πετσετοκρεμάστρας', 'Παροχή Towel Rail') 
          WHERE name LIKE '%Παροχή Ηλεκτρικής Πετσετοκρεμάστρας%';

          UPDATE provisions 
          SET name = REPLACE(name, 'Ηλεκτρικής Πετσετοκρεμάστρας', 'Towel Rail') 
          WHERE name LIKE '%Ηλεκτρικής Πετσετοκρεμάστρας%';

          UPDATE procurement_items
          SET name = REPLACE(name, 'Ηλεκτρικές Πετσετοκρεμάστρες', 'Towel Rails')
          WHERE name LIKE '%Ηλεκτρικές Πετσετοκρεμάστρες%';

          UPDATE procurement_items
          SET model = REPLACE(model, 'Ηλεκτρική Πετσετοκρεμάστρα', 'Ηλεκτρικό Towel Rail')
          WHERE model LIKE '%Ηλεκτρική Πετσετοκρεμάστρα%';

          INSERT OR REPLACE INTO _schema_migrations (id, applied_at) VALUES ('rename_towel_rail_v1', ${Date.now()});
        `);
      }
    } catch (e) {
      console.warn("rename_towel_rail migration notice:", e);
    }

    // Migration: Update Contact Sensors procurement item and ensure contact provisions are present
    try {
      const checkContact = db.exec("SELECT 1 FROM _schema_migrations WHERE id = 'add_all_contact_sensors_v1'");
      if (checkContact.length === 0 || checkContact[0].values.length === 0) {
        db.run(`
          UPDATE procurement_items 
          SET quantity = 20,
              rooms = '["🛋️ Σαλόνι / Τραπεζαρία","🍳 Κουζίνα","🥫 Pantry","🖥️ Γραφείο","🛏️ Master Bedroom","🛏️ Bedroom 1","🛏️ Bedroom 2","🚽 WC - Main","🚽 WC Ensuite","🚽 WC Ξένων","🧺 Πλυσταριό","🚪 Χώρος Εισόδου","🚗 Parking","⚙️ Μηχανοστάσιο","🏠 Βοηθητικό Σπίτι"]',
              task_description = 'Συνεννόηση με τον εγκαταστάτη κουφωμάτων & συναγερμού (CHM Security / Eyetouch) για χωνευτές contact sensors στα προφίλ αλουμινίου σε όλα τα παράθυρα (συμπεριλαμβανομένων όλων των τουαλετών/WC), μπαλκονόπορτες και εξωτερικές πόρτες πριν την τοποθέτηση.',
              notes = 'Ενσύρματη καλωδίωση συναγερμού σε όλα τα ανοιγόμενα/συρόμενα κουφώματα και πόρτες σε όλο το σπίτι (συμπεριλαμβανομένων των WC Main, Ensuite, Ξένων, εισόδου, μηχανοστασίου, βοηθητικού) για πλήρη περιμετρική προστασία (CHM Security / Eyetouch).'
          WHERE id = 'buy_reed_switches';

          INSERT OR REPLACE INTO _schema_migrations (id, applied_at) VALUES ('add_all_contact_sensors_v1', ${Date.now()});
        `);
      }
    } catch (e) {
      console.warn("add_all_contact_sensors migration notice:", e);
    }
  }

  private seedInitialData(db: Database) {
    this.ensureSchema(db);

    // 1. Seed provisions
    const provCountRes = db.exec("SELECT COUNT(*) FROM provisions");
    const provCount = provCountRes.length > 0 ? (provCountRes[0].values[0][0] as number) : 0;
    if (provCount === 0) {
      const stmt = db.prepare(`
        INSERT INTO provisions (id, name, room, wall, type, completed, pending_review, details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of PROVISIONS) {
        stmt.run([
          p.id,
          p.name,
          p.room,
          p.wall || '',
          p.type,
          p.completed ? 1 : 0,
          p.pendingReview ? 1 : 0,
          p.details || null
        ]);
      }
      stmt.free();
    }

    // 2. Seed procurement items
    const procCountRes = db.exec("SELECT COUNT(*) FROM procurement_items");
    const procCount = procCountRes.length > 0 ? (procCountRes[0].values[0][0] as number) : 0;
    if (procCount === 0) {
      const stmt = db.prepare(`
        INSERT INTO procurement_items (
          id, name, category, brand, model, link, estimated_price_eur, price_range,
          quantity, unit, rooms, is_task, is_optional, task_description, notes, purchased
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const item of PROCUREMENT_ITEMS) {
        stmt.run([
          item.id,
          item.name,
          item.category,
          item.brand || null,
          item.model || null,
          item.link || null,
          item.estimatedPriceEur ?? null,
          item.priceRange || null,
          item.quantity,
          item.unit,
          JSON.stringify(item.rooms),
          item.isTask ? 1 : 0,
          item.isOptional ? 1 : 0,
          item.taskDescription || null,
          item.notes,
          item.purchased ? 1 : 0
        ]);
      }
      stmt.free();
    }

    // 3. Seed general rules
    const rulesCountRes = db.exec("SELECT COUNT(*) FROM general_rules");
    const rulesCount = rulesCountRes.length > 0 ? (rulesCountRes[0].values[0][0] as number) : 0;
    if (rulesCount === 0) {
      const stmt = db.prepare(`
        INSERT INTO general_rules (id, title, category, scope, rule, critical_requirement, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const r of GENERAL_RULES) {
        stmt.run([
          r.id,
          r.title,
          r.category,
          r.scope,
          r.rule,
          r.criticalRequirement,
          r.notes
        ]);
      }
      stmt.free();
    }

    // 4. Seed vendor offers
    const offersCountRes = db.exec("SELECT COUNT(*) FROM vendor_offers");
    const offersCount = offersCountRes.length > 0 ? (offersCountRes[0].values[0][0] as number) : 0;
    if (offersCount === 0) {
      const stmt = db.prepare(`
        INSERT INTO vendor_offers (id, vendor_id, vendor_name, data_json)
        VALUES (?, ?, ?, ?)
      `);
      for (const o of INITIAL_VENDOR_OFFERS) {
        stmt.run([
          o.id,
          o.id,
          o.vendorName,
          JSON.stringify(o)
        ]);
      }
      stmt.free();
    }
  }

  public saveToStorage() {
    if (!this.db) return;
    try {
      const binary = this.db.export();
      let binaryString = '';
      const chunkSize = 8192;
      for (let i = 0; i < binary.length; i += chunkSize) {
        const chunk = binary.subarray(i, i + chunkSize);
        binaryString += String.fromCharCode.apply(null, Array.from(chunk));
      }
      const base64 = btoa(binaryString);
      localStorage.setItem(STORAGE_KEY, base64);

      try {
        localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(this.undoStack));
        localStorage.setItem(REDO_STORAGE_KEY, JSON.stringify(this.redoStack));
        if (this.lastActionDescription) {
          localStorage.setItem(LAST_ACTION_STORAGE_KEY, this.lastActionDescription);
        } else {
          localStorage.removeItem(LAST_ACTION_STORAGE_KEY);
        }
      } catch (stackSaveErr) {
        console.warn('Could not persist undo/redo stack:', stackSaveErr);
      }
    } catch (err) {
      console.error('Error saving SQLite to localStorage:', err);
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // --- QUERIES ---

  public getProvisions(): Provision[] {
    if (!this.db) return PROVISIONS;
    const res = this.db.exec("SELECT id, name, room, wall, type, completed, pending_review, details FROM provisions ORDER BY id ASC");
    if (res.length === 0) return [];
    return res[0].values.map((row) => ({
      id: row[0] as string,
      name: row[1] as string,
      room: row[2] as string,
      wall: (row[3] as string) || '',
      type: row[4] as string,
      completed: Boolean(row[5]),
      pendingReview: Boolean(row[6]),
      details: (row[7] as string) || undefined
    }));
  }

  public getProcurementItems(): ProcurementItem[] {
    if (!this.db) return PROCUREMENT_ITEMS;
    const res = this.db.exec(`
      SELECT id, name, category, brand, model, link, estimated_price_eur, price_range,
             quantity, unit, rooms, is_task, task_description, notes, purchased, is_optional
      FROM procurement_items
      ORDER BY id ASC
    `);
    if (res.length === 0) return [];
    return res[0].values.map((row) => {
      let rooms: string[] = [];
      try {
        rooms = JSON.parse(row[10] as string);
      } catch {
        rooms = [];
      }
      return {
        id: row[0] as string,
        name: row[1] as string,
        category: row[2] as string,
        brand: (row[3] as string) || undefined,
        model: (row[4] as string) || undefined,
        link: (row[5] as string) || undefined,
        estimatedPriceEur: row[6] !== null ? (row[6] as number) : null,
        priceRange: (row[7] as string) || undefined,
        quantity: row[8] as number,
        unit: row[9] as string,
        rooms,
        isTask: Boolean(row[11]),
        taskDescription: (row[12] as string) || undefined,
        notes: row[13] as string,
        purchased: Boolean(row[14]),
        isOptional: Boolean(row[15])
      };
    });
  }

  public getGeneralRules(): GeneralRule[] {
    if (!this.db) return GENERAL_RULES;
    const res = this.db.exec("SELECT id, title, category, scope, rule, critical_requirement, notes FROM general_rules ORDER BY id ASC");
    if (res.length === 0) return [];
    return res[0].values.map((row) => ({
      id: row[0] as string,
      title: row[1] as string,
      category: row[2] as GeneralRule['category'],
      scope: row[3] as string,
      rule: row[4] as string,
      criticalRequirement: row[5] as string,
      notes: row[6] as string
    }));
  }

  public getVendorOffers(): VendorOffer[] {
    if (!this.db) return INITIAL_VENDOR_OFFERS;
    const res = this.db.exec("SELECT data_json FROM vendor_offers WHERE vendor_id != 'vendor_2' ORDER BY CASE vendor_id WHEN 'vendor_4' THEN 1 WHEN 'vendor_1' THEN 2 WHEN 'vendor_3' THEN 3 ELSE 99 END, rowid ASC");
    if (res.length === 0) return [];
    return res[0].values.map((row) => JSON.parse(row[0] as string));
  }

  // --- MUTATION WITH UNDO LOGGING ---

  private executeWithUndo(description: string, forwardSql: string[], inverseSql: string[]) {
    if (!this.db) return;
    let inTx = false;
    try {
      try {
        this.db.run("BEGIN TRANSACTION;");
        inTx = true;
      } catch (e: any) {
        // Continue if already within transaction
      }

      for (const sql of forwardSql) {
        this.db.run(sql);
      }

      if (inTx) {
        this.db.run("COMMIT;");
      }

      const action: UndoAction = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        description,
        forwardSql,
        inverseSql
      };

      this.undoStack.push(action);
      if (this.undoStack.length > MAX_UNDO_STACK) {
        this.undoStack.shift();
      }
      this.redoStack = [];
      this.lastActionDescription = description;

      this.saveToStorage();
      this.notify();
    } catch (error) {
      if (this.db && inTx) {
        try { this.db.run("ROLLBACK;"); } catch { /* ignore */ }
      }
      console.error('SQLite execution failed:', error);
      throw error;
    }
  }

  // Toggle provision completed tickbox
  public toggleProvisionCompleted(id: string) {
    if (!this.db) return;
    const current = this.db.exec(`SELECT completed, name FROM provisions WHERE id = '${id}'`);
    if (current.length === 0 || current[0].values.length === 0) return;
    const currVal = current[0].values[0][0] as number;
    const name = current[0].values[0][1] as string;
    const newVal = currVal === 1 ? 0 : 1;

    const desc = `${newVal === 1 ? 'Ολοκλήρωση' : 'Επαναφορά'} πρόνοιας: "${name}"`;
    const forwardSql = [`UPDATE provisions SET completed = ${newVal} WHERE id = '${id}';`];
    const inverseSql = [`UPDATE provisions SET completed = ${currVal} WHERE id = '${id}';`];

    this.executeWithUndo(desc, forwardSql, inverseSql);
  }

  // Toggle provision pendingReview tickbox
  public toggleProvisionPending(id: string) {
    if (!this.db) return;
    const current = this.db.exec(`SELECT pending_review, name FROM provisions WHERE id = '${id}'`);
    if (current.length === 0 || current[0].values.length === 0) return;
    const currVal = current[0].values[0][0] as number;
    const name = current[0].values[0][1] as string;
    const newVal = currVal === 1 ? 0 : 1;

    const desc = `${newVal === 1 ? 'Επισήμανση ως TBD' : 'Αφαίρεση TBD'} για: "${name}"`;
    const forwardSql = [`UPDATE provisions SET pending_review = ${newVal} WHERE id = '${id}';`];
    const inverseSql = [`UPDATE provisions SET pending_review = ${currVal} WHERE id = '${id}';`];

    this.executeWithUndo(desc, forwardSql, inverseSql);
  }

  // Update whole provision
  public updateProvision(id: string, updates: Partial<Provision>): boolean {
    if (!this.db) {
      console.warn('Database not ready during updateProvision');
      return false;
    }

    let currentRes = this.db.exec(`SELECT name, room, wall, type, completed, pending_review, details FROM provisions WHERE id = '${id.replace(/'/g, "''")}'`);
    if (currentRes.length === 0 || currentRes[0].values.length === 0) {
      const fallback = PROVISIONS.find(p => p.id === id);
      if (fallback) {
        this.db.run(
          `INSERT OR IGNORE INTO provisions (id, name, room, wall, type, completed, pending_review, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [fallback.id, fallback.name, fallback.room, fallback.wall || '', fallback.type, fallback.completed ? 1 : 0, fallback.pendingReview ? 1 : 0, fallback.details || null]
        );
        currentRes = this.db.exec(`SELECT name, room, wall, type, completed, pending_review, details FROM provisions WHERE id = '${id.replace(/'/g, "''")}'`);
      }
    }

    if (currentRes.length === 0 || currentRes[0].values.length === 0) {
      console.error(`Provision with id ${id} not found in database`);
      return false;
    }

    const row = currentRes[0].values[0];
    const prev: Provision = {
      id,
      name: row[0] as string,
      room: row[1] as string,
      wall: (row[2] as string) || '',
      type: row[3] as string,
      completed: Boolean(row[4]),
      pendingReview: Boolean(row[5]),
      details: (row[6] as string) || undefined
    };

    const next: Provision = { ...prev, ...updates };

    const escapeText = (str?: string) => (str !== undefined && str !== null ? `'${str.replace(/'/g, "''")}'` : "''");
    const escapeNullable = (str?: string) => (str !== undefined && str !== null && str.trim() !== '' ? `'${str.replace(/'/g, "''")}'` : 'NULL');

    const forwardSql = [`
      UPDATE provisions 
      SET name = ${escapeText(next.name)},
          room = ${escapeText(next.room)},
          wall = ${escapeText(next.wall)},
          type = ${escapeText(next.type)},
          completed = ${next.completed ? 1 : 0},
          pending_review = ${next.pendingReview ? 1 : 0},
          details = ${escapeNullable(next.details)}
      WHERE id = '${id.replace(/'/g, "''")}';
    `];

    const inverseSql = [`
      UPDATE provisions 
      SET name = ${escapeText(prev.name)},
          room = ${escapeText(prev.room)},
          wall = ${escapeText(prev.wall)},
          type = ${escapeText(prev.type)},
          completed = ${prev.completed ? 1 : 0},
          pending_review = ${prev.pendingReview ? 1 : 0},
          details = ${escapeNullable(prev.details)}
      WHERE id = '${id.replace(/'/g, "''")}';
    `];

    this.executeWithUndo(`Επεξεργασία πρόνοιας: "${next.name}"`, forwardSql, inverseSql);
    return true;
  }

  // Toggle procurement purchased tickbox
  public toggleProcurementPurchased(id: string) {
    if (!this.db) return;
    const current = this.db.exec(`SELECT purchased, name FROM procurement_items WHERE id = '${id}'`);
    if (current.length === 0 || current[0].values.length === 0) return;
    const currVal = current[0].values[0][0] as number;
    const name = current[0].values[0][1] as string;
    const newVal = currVal === 1 ? 0 : 1;

    const desc = `${newVal === 1 ? 'Μαρκάρισμα ως Αγορασμένο' : 'Επαναφορά σε Εκκρεμές'}: "${name}"`;
    const forwardSql = [`UPDATE procurement_items SET purchased = ${newVal} WHERE id = '${id}';`];
    const inverseSql = [`UPDATE procurement_items SET purchased = ${currVal} WHERE id = '${id}';`];

    this.executeWithUndo(desc, forwardSql, inverseSql);
  }

  // Update procurement item
  public updateProcurementItem(id: string, updates: Partial<ProcurementItem>) {
    if (!this.db) return;
    const currentRes = this.db.exec(`
      SELECT name, category, brand, model, link, estimated_price_eur, price_range,
             quantity, unit, rooms, is_task, task_description, notes, purchased, is_optional
      FROM procurement_items WHERE id = '${id}'
    `);
    if (currentRes.length === 0 || currentRes[0].values.length === 0) return;
    const row = currentRes[0].values[0];
    let prevRooms: string[] = [];
    try {
      prevRooms = JSON.parse(row[9] as string);
    } catch {
      prevRooms = [];
    }

    const prev: ProcurementItem = {
      id,
      name: row[0] as string,
      category: row[1] as string,
      brand: (row[2] as string) || undefined,
      model: (row[3] as string) || undefined,
      link: (row[4] as string) || undefined,
      estimatedPriceEur: row[5] !== null ? (row[5] as number) : null,
      priceRange: (row[6] as string) || undefined,
      quantity: row[7] as number,
      unit: row[8] as string,
      rooms: prevRooms,
      isTask: Boolean(row[10]),
      taskDescription: (row[11] as string) || undefined,
      notes: row[12] as string,
      purchased: Boolean(row[13]),
      isOptional: Boolean(row[14])
    };

    const next: ProcurementItem = { ...prev, ...updates };

    const escape = (str?: string) => (str !== undefined && str !== null ? `'${str.replace(/'/g, "''")}'` : 'NULL');
    const numOrNull = (n?: number | null) => (n !== undefined && n !== null ? n : 'NULL');

    const forwardSql = [`
      UPDATE procurement_items
      SET name = ${escape(next.name)},
          category = ${escape(next.category)},
          brand = ${escape(next.brand)},
          model = ${escape(next.model)},
          link = ${escape(next.link)},
          estimated_price_eur = ${numOrNull(next.estimatedPriceEur)},
          price_range = ${escape(next.priceRange)},
          quantity = ${next.quantity},
          unit = ${escape(next.unit)},
          rooms = ${escape(JSON.stringify(next.rooms))},
          is_task = ${next.isTask ? 1 : 0},
          is_optional = ${next.isOptional ? 1 : 0},
          task_description = ${escape(next.taskDescription)},
          notes = ${escape(next.notes)},
          purchased = ${next.purchased ? 1 : 0}
      WHERE id = '${id}';
    `];

    const inverseSql = [`
      UPDATE procurement_items
      SET name = ${escape(prev.name)},
          category = ${escape(prev.category)},
          brand = ${escape(prev.brand)},
          model = ${escape(prev.model)},
          link = ${escape(prev.link)},
          estimated_price_eur = ${numOrNull(prev.estimatedPriceEur)},
          price_range = ${escape(prev.priceRange)},
          quantity = ${prev.quantity},
          unit = ${escape(prev.unit)},
          rooms = ${escape(JSON.stringify(prev.rooms))},
          is_task = ${prev.isTask ? 1 : 0},
          is_optional = ${prev.isOptional ? 1 : 0},
          task_description = ${escape(prev.taskDescription)},
          notes = ${escape(prev.notes)},
          purchased = ${prev.purchased ? 1 : 0}
      WHERE id = '${id}';
    `];

    this.executeWithUndo(`Επεξεργασία εξοπλισμού: "${next.name}"`, forwardSql, inverseSql);
  }

  // Update general rule
  public updateGeneralRule(id: string, updates: Partial<GeneralRule>) {
    if (!this.db) return;
    const currentRes = this.db.exec(`SELECT title, category, scope, rule, critical_requirement, notes FROM general_rules WHERE id = '${id}'`);
    if (currentRes.length === 0 || currentRes[0].values.length === 0) return;
    const row = currentRes[0].values[0];
    const prev: GeneralRule = {
      id,
      title: row[0] as string,
      category: row[1] as GeneralRule['category'],
      scope: row[2] as string,
      rule: row[3] as string,
      criticalRequirement: row[4] as string,
      notes: row[5] as string
    };

    const next: GeneralRule = { ...prev, ...updates };
    const escape = (str: string) => `'${str.replace(/'/g, "''")}'`;

    const forwardSql = [`
      UPDATE general_rules
      SET title = ${escape(next.title)},
          category = ${escape(next.category)},
          scope = ${escape(next.scope)},
          rule = ${escape(next.rule)},
          critical_requirement = ${escape(next.criticalRequirement)},
          notes = ${escape(next.notes)}
      WHERE id = '${id}';
    `];

    const inverseSql = [`
      UPDATE general_rules
      SET title = ${escape(prev.title)},
          category = ${escape(prev.category)},
          scope = ${escape(prev.scope)},
          rule = ${escape(prev.rule)},
          critical_requirement = ${escape(prev.criticalRequirement)},
          notes = ${escape(prev.notes)}
      WHERE id = '${id}';
    `];

    this.executeWithUndo(`Επεξεργασία κανόνα: "${next.title}"`, forwardSql, inverseSql);
  }

  // --- UNDO / REDO ---

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public getUndoCount(): number {
    return this.undoStack.length;
  }

  public getRedoCount(): number {
    return this.redoStack.length;
  }

  public getLastActionDescription(): string | null {
    return this.lastActionDescription;
  }

  public undo(): boolean {
    if (!this.db || this.undoStack.length === 0) return false;
    const action = this.undoStack.pop()!;
    let inTx = false;
    try {
      try {
        this.db.run("BEGIN TRANSACTION;");
        inTx = true;
      } catch (e: any) {
        // Continue if already within transaction
      }

      for (const sql of action.inverseSql) {
        this.db.run(sql);
      }

      if (inTx) {
        this.db.run("COMMIT;");
      }

      this.redoStack.push(action);
      this.lastActionDescription = `Αναίρεση: ${action.description}`;
      this.saveToStorage();
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to execute undo:', err);
      // Restore action to undoStack so it is not permanently lost
      this.undoStack.push(action);
      if (this.db && inTx) {
        try { this.db.run("ROLLBACK;"); } catch { /* ignore */ }
      }
      return false;
    }
  }

  public redo(): boolean {
    if (!this.db || this.redoStack.length === 0) return false;
    const action = this.redoStack.pop()!;
    let inTx = false;
    try {
      try {
        this.db.run("BEGIN TRANSACTION;");
        inTx = true;
      } catch (e: any) {
        // Continue if already within transaction
      }

      for (const sql of action.forwardSql) {
        this.db.run(sql);
      }

      if (inTx) {
        this.db.run("COMMIT;");
      }

      this.undoStack.push(action);
      this.lastActionDescription = `Επανάληψη: ${action.description}`;
      this.saveToStorage();
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to execute redo:', err);
      // Restore action to redoStack so it is not permanently lost
      this.redoStack.push(action);
      if (this.db && inTx) {
        try { this.db.run("ROLLBACK;"); } catch { /* ignore */ }
      }
      return false;
    }
  }

  // --- EXPORT & IMPORT ---

  public exportDatabaseBlob(): Uint8Array | null {
    if (!this.db) return null;
    return this.db.export();
  }

  public downloadDatabaseFile() {
    const data = this.exportDatabaseBlob();
    if (!data) return;
    const blob = new Blob([new Uint8Array(data)], { type: 'application/x-sqlite3' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `house_${new Date().toISOString().slice(0, 10)}.sqlite`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public async importDatabaseFile(buffer: ArrayBuffer) {
    const SQL = await initSqlJs({
      locateFile: (file) => (file === 'sql-wasm.wasm' ? `${import.meta.env.BASE_URL || '/'}sql-wasm.wasm` : file)
    });
    this.db = new SQL.Database(new Uint8Array(buffer));
    this.ensureSchema(this.db);
    this.undoStack = [];
    this.redoStack = [];
    this.lastActionDescription = 'Εισαγωγή αρχείου SQLite';
    this.saveToStorage();
    this.notify();
  }

  public resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    localStorage.removeItem(UNDO_STORAGE_KEY);
    localStorage.removeItem(REDO_STORAGE_KEY);
    localStorage.removeItem(LAST_ACTION_STORAGE_KEY);
    this.undoStack = [];
    this.redoStack = [];
    this.lastActionDescription = 'Επαναφορά αρχικών δεδομένων';
    if (this.db) {
      this.db.run("DROP TABLE IF EXISTS provisions;");
      this.db.run("DROP TABLE IF EXISTS procurement_items;");
      this.db.run("DROP TABLE IF EXISTS general_rules;");
      this.db.run("DROP TABLE IF EXISTS vendor_offers;");
      this.seedInitialData(this.db);
      this.saveToStorage();
      this.notify();
    }
  }
}

export const sqliteService = new SQLiteService();

// --- REACT HOOK FOR EASY STATE SYNC ---
export function useSqlite() {
  const [isReady, setIsReady] = useState(sqliteService.getIsReady());
  const [provisions, setProvisions] = useState<Provision[]>(sqliteService.getProvisions());
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>(sqliteService.getProcurementItems());
  const [generalRules, setGeneralRules] = useState<GeneralRule[]>(sqliteService.getGeneralRules());
  const [offers, setOffers] = useState<VendorOffer[]>(sqliteService.getVendorOffers());
  const [canUndo, setCanUndo] = useState(sqliteService.canUndo());
  const [canRedo, setCanRedo] = useState(sqliteService.canRedo());
  const [undoCount, setUndoCount] = useState(sqliteService.getUndoCount());
  const [redoCount, setRedoCount] = useState(sqliteService.getRedoCount());
  const [lastAction, setLastAction] = useState<string | null>(sqliteService.getLastActionDescription());

  useEffect(() => {
    sqliteService.init().then(() => {
      setIsReady(true);
      setProvisions(sqliteService.getProvisions());
      setProcurementItems(sqliteService.getProcurementItems());
      setGeneralRules(sqliteService.getGeneralRules());
      setOffers(sqliteService.getVendorOffers());
      setCanUndo(sqliteService.canUndo());
      setCanRedo(sqliteService.canRedo());
      setUndoCount(sqliteService.getUndoCount());
      setRedoCount(sqliteService.getRedoCount());
      setLastAction(sqliteService.getLastActionDescription());
    });

    const unsubscribe = sqliteService.subscribe(() => {
      setProvisions(sqliteService.getProvisions());
      setProcurementItems(sqliteService.getProcurementItems());
      setGeneralRules(sqliteService.getGeneralRules());
      setOffers(sqliteService.getVendorOffers());
      setCanUndo(sqliteService.canUndo());
      setCanRedo(sqliteService.canRedo());
      setUndoCount(sqliteService.getUndoCount());
      setRedoCount(sqliteService.getRedoCount());
      setLastAction(sqliteService.getLastActionDescription());
    });

    return unsubscribe;
  }, []);

  return {
    isReady,
    provisions,
    procurementItems,
    generalRules,
    offers,
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    lastAction,
    toggleProvisionCompleted: (id: string) => {
      setProvisions(prev => prev.map(p => p.id === id ? { ...p, completed: !p.completed } : p));
      sqliteService.toggleProvisionCompleted(id);
    },
    toggleProvisionPending: (id: string) => {
      setProvisions(prev => prev.map(p => p.id === id ? { ...p, pendingReview: !p.pendingReview } : p));
      sqliteService.toggleProvisionPending(id);
    },
    updateProvision: (id: string, updates: Partial<Provision>) => {
      setProvisions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return sqliteService.updateProvision(id, updates);
    },
    toggleProcurementPurchased: (id: string) => {
      setProcurementItems(prev => prev.map(item => item.id === id ? { ...item, purchased: !item.purchased } : item));
      sqliteService.toggleProcurementPurchased(id);
    },
    updateProcurementItem: (id: string, updates: Partial<ProcurementItem>) => {
      setProcurementItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      return sqliteService.updateProcurementItem(id, updates);
    },
    updateGeneralRule: (id: string, updates: Partial<GeneralRule>) => {
      setGeneralRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      return sqliteService.updateGeneralRule(id, updates);
    },
    undo: () => {
      const res = sqliteService.undo();
      if (res) {
        setProvisions(sqliteService.getProvisions());
        setProcurementItems(sqliteService.getProcurementItems());
        setGeneralRules(sqliteService.getGeneralRules());
        setOffers(sqliteService.getVendorOffers());
        setCanUndo(sqliteService.canUndo());
        setCanRedo(sqliteService.canRedo());
        setUndoCount(sqliteService.getUndoCount());
        setRedoCount(sqliteService.getRedoCount());
        setLastAction(sqliteService.getLastActionDescription());
      }
      return res;
    },
    redo: () => {
      const res = sqliteService.redo();
      if (res) {
        setProvisions(sqliteService.getProvisions());
        setProcurementItems(sqliteService.getProcurementItems());
        setGeneralRules(sqliteService.getGeneralRules());
        setOffers(sqliteService.getVendorOffers());
        setCanUndo(sqliteService.canUndo());
        setCanRedo(sqliteService.canRedo());
        setUndoCount(sqliteService.getUndoCount());
        setRedoCount(sqliteService.getRedoCount());
        setLastAction(sqliteService.getLastActionDescription());
      }
      return res;
    },
    downloadDatabase: () => sqliteService.downloadDatabaseFile(),
    importDatabase: (buffer: ArrayBuffer) => sqliteService.importDatabaseFile(buffer),
    resetToDefaults: () => sqliteService.resetToDefaults()
  };
}
