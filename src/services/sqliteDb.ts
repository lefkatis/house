import initSqlJs, { Database } from 'sql.js';
import { useState, useEffect } from 'react';
import { PROVISIONS, Provision } from '../data/provisions';
import { PROCUREMENT_ITEMS, ProcurementItem } from '../data/procurementItems';
import { GENERAL_RULES, GeneralRule } from '../data/generalRules';
import { INITIAL_VENDOR_OFFERS, VendorOffer } from '../data/offersData';

const STORAGE_KEY = 'house_sqlite_db_v1';
const LEGACY_STORAGE_KEY = 'lefkpronies_sqlite_db_v2';
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

      const SQL = await initSqlJs({
        locateFile: (file) => (file === 'sql-wasm.wasm' ? wasmPath : file)
      });

      const savedDbBase64 = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (savedDbBase64) {
        try {
          const binaryString = atob(savedDbBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          this.db = new SQL.Database(bytes);
        } catch (err) {
          console.warn('Failed to restore SQLite database from storage, initializing fresh:', err);
          this.db = new SQL.Database();
          this.seedInitialData(this.db);
        }
      } else {
        this.db = new SQL.Database();
        this.seedInitialData(this.db);
      }

      this.ensureSchema(this.db);
      this.saveToStorage();
      this.isReady = true;
      this.notify();
      return this.db;
    } catch (error) {
      console.error('Failed to initialize SQLite WASM:', error);
      const SQL = await initSqlJs();
      this.db = new SQL.Database();
      this.seedInitialData(this.db);
      this.isReady = true;
      this.notify();
      return this.db;
    } finally {
      this.isInitializing = false;
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
      );

      -- Data migration: move server cabinet provisions from mechanical room to dedicated server cabinet
      UPDATE provisions 
      SET room = '🖥️ Server Cabinet' 
      WHERE id IN ('mix_1', 'mix_2', 'mix_3', 'mix_4') AND room = '⚙️ Μηχανοστάσιο';

      -- Data migration: update Cat6 to Cat6a across tables
      UPDATE provisions SET name = REPLACE(name, 'Cat6', 'Cat6a') WHERE name LIKE '%Cat6%';
      UPDATE provisions SET details = REPLACE(details, 'Cat6', 'Cat6a') WHERE details LIKE '%Cat6%';
      UPDATE procurement_items SET notes = REPLACE(notes, 'Cat6', 'Cat6a') WHERE notes LIKE '%Cat6%';

      -- Data migration: remove separate towel rail switch rule, procurement item, and separate provisions
      DELETE FROM procurement_items WHERE id = 'buy_towel_rail_switches';
      DELETE FROM general_rules WHERE id = 'rule_towel_rail';
      DELETE FROM provisions WHERE id IN ('wcm_5', 'ens_5');

      -- Data migration: remove BMW Wallbox from procurement items (already owned)
      DELETE FROM procurement_items WHERE id = 'buy_ev_charger';

      -- Data migration: update garage switch provision name to simple Switch για Πόρτα Garage
      UPDATE provisions 
      SET name = 'Switch για Πόρτα Garage', 
          wall = 'Τοίχος Εισόδου Parking',
          type = '🔌 Πρίζες',
          details = 'Επίτοιχος διακόπτης / switch για τοπικό άνοιγμα και κλείσιμο της πόρτας του γκαράζ.'
      WHERE id = 'par_1';

      -- Data migration: update garage motor provision name & ceiling location
      UPDATE provisions 
      SET name = 'Παροχή Ρεύματος για Μοτέρ Γκαραζόπορτας (Στο ταβάνι του garage)',
          wall = 'Ταβάνι Garage (Οροφή)',
          type = '🔌 Πρίζες',
          details = 'Παροχή ρεύματος στο ταβάνι του garage, τοποθετημένη 3.5 μέτρα μακριά από το άνοιγμα της γκαραζόπορτας και ακριβώς στη μέση του ανοίγματος για τον κινητήρα οροφής.'
      WHERE id = 'par_7';

      -- Data migration: update towel rail provision names & details with ~60cm height and heater switch
      UPDATE provisions 
      SET name = 'Παροχή Ηλεκτρικής Πετσετοκρεμάστρας (~60cm από το δάπεδο, με Heater Switch)',
          details = 'Αναμονή παροχής ρεύματος 230V (χωνευτό κουτί / flex outlet) σε ύψος περίπου 60cm από το τελειωμένο δάπεδο, ακριβώς στο σημείο τοποθέτησης της πετσετοκρεμάστρας. Περιλαμβάνει διακόπτη λειτουργίας/απομόνωσης (heater switch) εκτός Zone 2 (π.χ. στην είσοδο του WC).'
      WHERE id = 'wcm_1';

      UPDATE provisions 
      SET name = 'Παροχή Ηλεκτρικής Πετσετοκρεμάστρας (~60cm από το δάπεδο, με Heater Switch)',
          details = 'Αναμονή παροχής ρεύματος 230V (χωνευτό κουτί / flex outlet) σε ύψος περίπου 60cm από το τελειωμένο δάπεδο, ακριβώς στο σημείο τοποθέτησης της πετσετοκρεμάστρας. Περιλαμβάνει διακόπτη λειτουργίας/απομόνωσης (heater switch) εκτός Zone 2 (π.χ. στην είσοδο του Ensuite).'
      WHERE id = 'ens_1';

      -- Data migration: update solar/boiler smart thermostat provision (mix_7)
      UPDATE provisions 
      SET name = 'Smart Θερμοστάτης Ηλιακού & Boiler (Σωλήνα Πίνακα προς Solar, Boiler Pocket & Shelly στον Πίνακα)',
          wall = 'Υδραυλικά / Ηλεκτρολογικός Πίνακας',
          details = 'Απευθείας σωλήνωση από τον κεντρικό ηλεκτρολογικό πίνακα προς το ηλιακό σύστημα/boiler. Ο θερμολουτήρας (boiler) πρέπει υποχρεωτικά να διαθέτει βάραθρο (pocket) για τον αισθητήρα θερμοκρασίας (probe DS18B20). Το κόκκινο Shelly Plus 1 (ή Shelly Pro) μπαίνει ΣΤΟΝ ΠΙΝΑΚΑ και οπλίζει ρελέ ισχύος (contactor 20A/25A) για την αντίσταση 3000W.'
      WHERE id = 'mix_7';

      -- Data migration: update grass & pool deck specifications
      UPDATE procurement_items
      SET task_description = 'Απόφαση και επιλογή τύπου γρασιδιού. ΥΠΟΧΡΕΩΤΙΚΟ ΥΠΟΣΤΡΩΜΑ: Σπαστή άμμος τουλάχιστον 5cm (≥5cm) πριν το γρασίδι για αποστράγγιση και τέλειο αλφάδιασμα. Γεωύφασμα τοποθετημένο είτε πάνω είτε κάτω από τη σπαστή άμμο για αποτροπή ζιζανίων/αγριόχορτων.',
          notes = 'Σπαστή άμμος ≥5cm + γεωύφασμα (πάνω ή κάτω από την άμμο). Συνδέεται με τις αναμονές αυτόματου ποτίσματος και τη γεώτρηση εάν επιλεγεί φυσικό.'
      WHERE id = 'buy_grass';

      UPDATE procurement_items
      SET name = 'Deck Πισίνας (Συνθετικό WPC: Ξύλο & Πλαστικό, Ύψος ~6cm με Δοκάρι)',
          model = 'Συνθετικό Ξύλο WPC (Wood-Plastic Composite) - ~6cm με δοκάρι βάσης',
          task_description = 'Επιλογή συνθετικού deck WPC (ξύλο & πλαστικό) για μηδενική συντήρηση. Εγκατάσταση: Τοποθετείται δοκάρι υποδομής (beam) στη βάση και οι σανίδες deck από πάνω, με συνολικό τελικό ύψος περίπου 6cm. ΚΡΙΣΙΜΟ: Ενημέρωση του εργολάβου εκ των προτέρων για τα ακριβή εκατοστά (cm) ώστε να ρίξει το μπετόν 6cm χαμηλότερα για flush τελείωμα με την πισίνα.',
          notes = 'Συνθετικό WPC (ξύλο & πλαστικό). Δοκάρι βάσης (beam) + deck = συνολικό ύψος ~6cm. Έγκαιρη συνεννόηση με τον εργολάβο για τη στάθμη του μπετόν.'
      WHERE id = 'buy_pool_deck';

      -- Data migration: update auxiliary house lighting (aux_4) to room ceiling light
      UPDATE provisions 
      SET name = 'Κεντρικός Φωτισμός Δωματίου στο Ταβάνι',
          wall = 'Ταβάνι (Οροφή)',
          details = 'Αναμονή παροχής ρεύματος στο ταβάνι (οροφή) για τον κανονικό κεντρικό φωτισμό του δωματίου στο βοηθητικό σπίτι.'
      WHERE id = 'aux_4';
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
    const res = this.db.exec("SELECT data_json FROM vendor_offers ORDER BY id ASC");
    if (res.length === 0) return [];
    return res[0].values.map((row) => JSON.parse(row[0] as string));
  }

  // --- MUTATION WITH UNDO LOGGING ---

  private executeWithUndo(description: string, forwardSql: string[], inverseSql: string[]) {
    if (!this.db) return;
    try {
      this.db.run("BEGIN TRANSACTION;");
      for (const sql of forwardSql) {
        this.db.run(sql);
      }
      this.db.run("COMMIT;");

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
      if (this.db) {
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
  public updateProvision(id: string, updates: Partial<Provision>) {
    if (!this.db) return;
    const currentRes = this.db.exec(`SELECT name, room, wall, type, completed, pending_review, details FROM provisions WHERE id = '${id}'`);
    if (currentRes.length === 0 || currentRes[0].values.length === 0) return;
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

    const escape = (str?: string) => (str !== undefined && str !== null ? `'${str.replace(/'/g, "''")}'` : 'NULL');

    const forwardSql = [`
      UPDATE provisions 
      SET name = ${escape(next.name)},
          room = ${escape(next.room)},
          wall = ${escape(next.wall)},
          type = ${escape(next.type)},
          completed = ${next.completed ? 1 : 0},
          pending_review = ${next.pendingReview ? 1 : 0},
          details = ${escape(next.details)}
      WHERE id = '${id}';
    `];

    const inverseSql = [`
      UPDATE provisions 
      SET name = ${escape(prev.name)},
          room = ${escape(prev.room)},
          wall = ${escape(prev.wall)},
          type = ${escape(prev.type)},
          completed = ${prev.completed ? 1 : 0},
          pending_review = ${prev.pendingReview ? 1 : 0},
          details = ${escape(prev.details)}
      WHERE id = '${id}';
    `];

    this.executeWithUndo(`Επεξεργασία πρόνοιας: "${next.name}"`, forwardSql, inverseSql);
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
    try {
      this.db.run("BEGIN TRANSACTION;");
      for (const sql of action.inverseSql) {
        this.db.run(sql);
      }
      this.db.run("COMMIT;");

      this.redoStack.push(action);
      this.lastActionDescription = `Αναίρεση: ${action.description}`;
      this.saveToStorage();
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to execute undo:', err);
      if (this.db) {
        try { this.db.run("ROLLBACK;"); } catch { /* ignore */ }
      }
      return false;
    }
  }

  public redo(): boolean {
    if (!this.db || this.redoStack.length === 0) return false;
    const action = this.redoStack.pop()!;
    try {
      this.db.run("BEGIN TRANSACTION;");
      for (const sql of action.forwardSql) {
        this.db.run(sql);
      }
      this.db.run("COMMIT;");

      this.undoStack.push(action);
      this.lastActionDescription = `Επανάληψη: ${action.description}`;
      this.saveToStorage();
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to execute redo:', err);
      if (this.db) {
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
    toggleProvisionCompleted: (id: string) => sqliteService.toggleProvisionCompleted(id),
    toggleProvisionPending: (id: string) => sqliteService.toggleProvisionPending(id),
    updateProvision: (id: string, updates: Partial<Provision>) => sqliteService.updateProvision(id, updates),
    toggleProcurementPurchased: (id: string) => sqliteService.toggleProcurementPurchased(id),
    updateProcurementItem: (id: string, updates: Partial<ProcurementItem>) => sqliteService.updateProcurementItem(id, updates),
    updateGeneralRule: (id: string, updates: Partial<GeneralRule>) => sqliteService.updateGeneralRule(id, updates),
    undo: () => sqliteService.undo(),
    redo: () => sqliteService.redo(),
    downloadDatabase: () => sqliteService.downloadDatabaseFile(),
    importDatabase: (buffer: ArrayBuffer) => sqliteService.importDatabaseFile(buffer),
    resetToDefaults: () => sqliteService.resetToDefaults()
  };
}
