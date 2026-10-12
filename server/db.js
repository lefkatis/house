import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { generateFromAnswers } from './generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../pronies_app.sqlite');

export const DEFAULT_QUESTIONNAIRE = {
  projectName: 'Το Σύγχρονο Σπίτι Μου',
  houseType: 'detached', // 'detached' | 'maisonette' | 'apartment' | 'renovation'
  floors: 2,
  bedroomsCount: 3,
  hasMasterEnsuite: true,
  hasOffice: true,
  hasPantry: true,
  hasLaundryRoom: true,
  hasGuestWc: true,
  hasGarageParking: true,
  hasVerandaBbq: true,
  hasGarden: true,
  hasPool: false,
  hasAuxiliaryHouse: false,
  hasMachineRoom: true,

  // Smart Home
  smartLightingRelays: true,
  centralTouchPanel: true,
  motorizedCurtains: true,
  mmWavePresence: true,
  smartPlatform: 'home_assistant',

  // Network & Rack
  serverRackInUtility: true,
  poeAccessPoints: true,
  dualEthernetInOffice: true,
  smartDoorbellPoe: true,

  // Electrical & Plugs
  deepBackboxes6cm: true,
  spareSocketPerWall: true,
  kitchenIslandSockets: true,
  evCharger: true,
  cyprusShaverSockets: true,

  // Kitchen & Plumbing
  underSink4Outlets: true,
  garbageDisposalSwitch: true,
  fridgeWaterLine: true,
  ledDriverLocation: true,
  pantryPlumbing: true,

  // HVAC
  hvacType: 'hidden_ducted', // 'hidden_ducted' | 'split_units' | 'none'
  underfloorHeating: true,
  mechanicalVentilation: true,

  // Security
  wiredMagneticContacts: true,
  glassBreakSensors: true,
  smokeFireSensors: true,
  poeCCTV: true,
  centralUps: true,

  // Outdoor
  smartIrrigation: true,
  gardenLightingCircuits: true,
  poolProvisions: false,
  bbqProvisions: true,
  electricGateIntercom: true
};

let dbInstance = null;

export function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initTables(dbInstance);
  }
  return dbInstance;
}

function initTables(db) {
  // 1. Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      house_type TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Questionnaire Answers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS questionnaire_answers (
      project_id TEXT PRIMARY KEY,
      answers_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // 3. Custom Provisions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_provisions (
      id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      room TEXT NOT NULL,
      wall TEXT NOT NULL,
      type TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      pending_review INTEGER NOT NULL DEFAULT 0,
      details TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (id, project_id),
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // 4. Custom Procurement Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS custom_procurement (
      id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      estimated_price_eur REAL NOT NULL DEFAULT 0,
      brand TEXT,
      model TEXT,
      notes TEXT,
      is_task INTEGER NOT NULL DEFAULT 0,
      purchased INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (id, project_id),
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);

  // Seed default project if empty
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM projects');
  const result = countStmt.get();
  if (result.count === 0) {
    const defaultId = 'project_default';
    const now = new Date().toISOString();
    
    const insertProj = db.prepare(`
      INSERT INTO projects (id, name, house_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertProj.run(defaultId, DEFAULT_QUESTIONNAIRE.projectName, DEFAULT_QUESTIONNAIRE.houseType, now, now);

    saveQuestionnaireAnswers(defaultId, DEFAULT_QUESTIONNAIRE, db);
  }
}

export function getAllProjects() {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC');
  return stmt.all();
}

export function getProjectDetails(projectId) {
  const db = getDb();
  const projStmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  const project = projStmt.get(projectId);
  if (!project) return null;

  const answersStmt = db.prepare('SELECT answers_json FROM questionnaire_answers WHERE project_id = ?');
  const answersRow = answersStmt.get(projectId);
  const answers = answersRow ? JSON.parse(answersRow.answers_json) : DEFAULT_QUESTIONNAIRE;

  const provStmt = db.prepare('SELECT * FROM custom_provisions WHERE project_id = ? ORDER BY sort_order ASC, id ASC');
  const provisionsRows = provStmt.all(projectId);
  const provisions = provisionsRows.map(r => ({
    id: r.id,
    name: r.name,
    room: r.room,
    wall: r.wall,
    type: r.type,
    completed: Boolean(r.completed),
    pendingReview: Boolean(r.pending_review),
    details: r.details || ''
  }));

  const procStmt = db.prepare('SELECT * FROM custom_procurement WHERE project_id = ? ORDER BY id ASC');
  const procRows = procStmt.all(projectId);
  const procurement = procRows.map(r => ({
    id: r.id,
    name: r.name,
    category: r.category,
    quantity: r.quantity,
    estimatedPriceEur: r.estimated_price_eur,
    brand: r.brand || '',
    model: r.model || '',
    notes: r.notes || '',
    isTask: Boolean(r.is_task),
    purchased: Boolean(r.purchased)
  }));

  const generated = generateFromAnswers(answers);

  return {
    project,
    answers,
    rooms: generated.rooms,
    provisions,
    procurement,
    rules: generated.rules
  };
}

export function saveQuestionnaireAnswers(projectId, answers, passedDb = null) {
  const db = passedDb || getDb();
  const now = new Date().toISOString();

  // 1. Update projects table
  const updateProj = db.prepare(`
    UPDATE projects 
    SET name = ?, house_type = ?, updated_at = ?
    WHERE id = ?
  `);
  updateProj.run(answers.projectName || 'Το Σπίτι Μου', answers.houseType || 'detached', now, projectId);

  // 2. Save answers
  const saveAnswers = db.prepare(`
    INSERT INTO questionnaire_answers (project_id, answers_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(project_id) DO UPDATE SET
      answers_json = excluded.answers_json,
      updated_at = excluded.updated_at
  `);
  saveAnswers.run(projectId, JSON.stringify(answers), now);

  // 3. Generate dynamic provisions & procurement
  const generated = generateFromAnswers(answers);

  // Fetch current completion states if provisions existed before, so we don't wipe out checked checkboxes
  const existingProvStmt = db.prepare('SELECT name, room, completed FROM custom_provisions WHERE project_id = ?');
  const existingProvs = existingProvStmt.all(projectId);
  const completedMap = new Map();
  existingProvs.forEach(p => {
    completedMap.set(`${p.room}__${p.name}`, Boolean(p.completed));
  });

  const existingProcStmt = db.prepare('SELECT name, purchased FROM custom_procurement WHERE project_id = ?');
  const existingProcs = existingProcStmt.all(projectId);
  const purchasedMap = new Map();
  existingProcs.forEach(p => {
    purchasedMap.set(p.name, Boolean(p.purchased));
  });

  // 4. Replace provisions
  db.prepare('DELETE FROM custom_provisions WHERE project_id = ?').run(projectId);

  const insertProv = db.prepare(`
    INSERT INTO custom_provisions (id, project_id, name, room, wall, type, completed, pending_review, details, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  generated.provisions.forEach((p, idx) => {
    const isCompleted = completedMap.get(`${p.room}__${p.name}`) ? 1 : (p.completed ? 1 : 0);
    insertProv.run(
      p.id,
      projectId,
      p.name,
      p.room,
      p.wall,
      p.type,
      isCompleted,
      p.pendingReview ? 1 : 0,
      p.details || '',
      idx
    );
  });

  // 5. Replace procurement
  db.prepare('DELETE FROM custom_procurement WHERE project_id = ?').run(projectId);

  const insertProc = db.prepare(`
    INSERT INTO custom_procurement (id, project_id, name, category, quantity, estimated_price_eur, brand, model, notes, is_task, purchased)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  generated.procurement.forEach((item) => {
    const isPurchased = purchasedMap.get(item.name) ? 1 : (item.purchased ? 1 : 0);
    insertProc.run(
      item.id,
      projectId,
      item.name,
      item.category,
      item.quantity,
      item.estimatedPriceEur,
      item.brand || '',
      item.model || '',
      item.notes || '',
      item.isTask ? 1 : 0,
      isPurchased
    );
  });

  return getProjectDetails(projectId);
}

export function updateProvisionStatus(projectId, provisionId, updates) {
  const db = getDb();
  if (typeof updates.completed !== 'undefined') {
    db.prepare('UPDATE custom_provisions SET completed = ? WHERE project_id = ? AND id = ?')
      .run(updates.completed ? 1 : 0, projectId, provisionId);
  }
  if (typeof updates.wall !== 'undefined') {
    db.prepare('UPDATE custom_provisions SET wall = ? WHERE project_id = ? AND id = ?')
      .run(updates.wall, projectId, provisionId);
  }
  if (typeof updates.details !== 'undefined') {
    db.prepare('UPDATE custom_provisions SET details = ? WHERE project_id = ? AND id = ?')
      .run(updates.details, projectId, provisionId);
  }
  return true;
}

export function addCustomProvision(projectId, provision) {
  const db = getDb();
  const id = `cust_manual_${Date.now()}`;
  db.prepare(`
    INSERT INTO custom_provisions (id, project_id, name, room, wall, type, completed, pending_review, details, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    projectId,
    provision.name,
    provision.room,
    provision.wall || 'Γενικός Τοίχος',
    provision.type || '🔌 Πρίζες',
    provision.completed ? 1 : 0,
    provision.pendingReview ? 1 : 0,
    provision.details || '',
    999
  );
  return { id, ...provision };
}

export function deleteCustomProvision(projectId, provisionId) {
  const db = getDb();
  db.prepare('DELETE FROM custom_provisions WHERE project_id = ? AND id = ?').run(projectId, provisionId);
  return true;
}

export function updateProcurementStatus(projectId, itemId, updates) {
  const db = getDb();
  if (typeof updates.purchased !== 'undefined') {
    db.prepare('UPDATE custom_procurement SET purchased = ? WHERE project_id = ? AND id = ?')
      .run(updates.purchased ? 1 : 0, projectId, itemId);
  }
  if (typeof updates.quantity !== 'undefined') {
    db.prepare('UPDATE custom_procurement SET quantity = ? WHERE project_id = ? AND id = ?')
      .run(updates.quantity, projectId, itemId);
  }
  return true;
}
