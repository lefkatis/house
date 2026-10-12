import { 
  QuestionnaireAnswers, 
  CustomProjectData, 
  CustomProvision 
} from '../types/questionnaire';
import { generateProvisionsFromAnswers } from './provisionsGenerator';

const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'pronies_custom_project_v1';

export const DEFAULT_QUESTIONNAIRE_ANSWERS: QuestionnaireAnswers = {
  projectName: 'Το Σύγχρονο Σπίτι Μου',
  houseType: 'detached',
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
  hvacType: 'hidden_ducted',
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

export function getLocalFallbackData(answers: QuestionnaireAnswers = DEFAULT_QUESTIONNAIRE_ANSWERS): CustomProjectData {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not parse localStorage project data', e);
  }

  const generated = generateProvisionsFromAnswers(answers);
  const initialData: CustomProjectData = {
    project: {
      id: 'project_default',
      name: answers.projectName,
      house_type: answers.houseType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    answers,
    rooms: generated.rooms,
    provisions: generated.provisions,
    procurement: generated.procurement,
    rules: generated.rules
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialData));
  } catch {}

  return initialData;
}

export async function checkBackendHealth(): Promise<{ isOnline: boolean; engine?: string; file?: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      return { isOnline: true, engine: data.databaseEngine || 'SQLite', file: data.file || 'pronies_app.sqlite' };
    }
  } catch {
    // Offline / fallback
  }
  return { isOnline: false };
}

export async function loadProjectData(projectId = 'project_default'): Promise<{ data: CustomProjectData; isFromSqlite: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data: CustomProjectData = await res.json();
      // Cache locally
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      } catch {}
      return { data, isFromSqlite: true };
    }
  } catch (err) {
    console.info('SQLite backend not reachable, using cached project data', err);
  }

  // Fallback to local storage
  return { data: getLocalFallbackData(), isFromSqlite: false };
}

export async function saveQuestionnaire(
  answers: QuestionnaireAnswers, 
  projectId = 'project_default'
): Promise<{ data: CustomProjectData; isSavedToSqlite: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}/questionnaire`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(answers),
      signal: AbortSignal.timeout(3000)
    });

    if (res.ok) {
      const json = await res.json();
      const updatedData: CustomProjectData = json.data;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedData));
      } catch {}
      return { data: updatedData, isSavedToSqlite: true };
    }
  } catch (err) {
    console.warn('Failed to save to SQLite server directly, persisting to local storage', err);
  }

  // Local fallback persistence
  const existing = getLocalFallbackData(answers);
  const generated = generateProvisionsFromAnswers(answers);
  
  // Preserve checked states
  const completedMap = new Map<string, boolean>();
  existing.provisions.forEach(p => completedMap.set(`${p.room}__${p.name}`, p.completed));
  const newProvisions = generated.provisions.map(p => ({
    ...p,
    completed: completedMap.get(`${p.room}__${p.name}`) ?? p.completed
  }));

  const purchasedMap = new Map<string, boolean>();
  existing.procurement.forEach(pr => purchasedMap.set(pr.name, pr.purchased));
  const newProcurement = generated.procurement.map(pr => ({
    ...pr,
    purchased: purchasedMap.get(pr.name) ?? pr.purchased
  }));

  const localUpdated: CustomProjectData = {
    project: {
      ...existing.project,
      name: answers.projectName,
      house_type: answers.houseType,
      updated_at: new Date().toISOString()
    },
    answers,
    rooms: generated.rooms,
    provisions: newProvisions,
    procurement: newProcurement,
    rules: generated.rules
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localUpdated));
  } catch {}

  return { data: localUpdated, isSavedToSqlite: false };
}

export async function updateProvision(
  projectId: string, 
  provisionId: string, 
  updates: Partial<CustomProvision>
): Promise<boolean> {
  // Update local storage first
  try {
    const local = getLocalFallbackData();
    const updatedProvs = local.provisions.map(p => 
      p.id === provisionId ? { ...p, ...updates } : p
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...local, provisions: updatedProvs }));
  } catch {}

  // Try SQLite backend
  try {
    await fetch(`${API_BASE}/projects/${projectId}/provisions/${provisionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      signal: AbortSignal.timeout(2000)
    });
    return true;
  } catch {
    return false;
  }
}

export async function addCustomProvision(
  projectId: string, 
  provision: Omit<CustomProvision, 'id'>
): Promise<CustomProvision> {
  const localId = `cust_manual_${Date.now()}`;
  const newProv: CustomProvision = { id: localId, ...provision };

  try {
    const local = getLocalFallbackData();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      ...local,
      provisions: [...local.provisions, newProv]
    }));
  } catch {}

  try {
    const res = await fetch(`${API_BASE}/projects/${projectId}/provisions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(provision),
      signal: AbortSignal.timeout(2000)
    });
    if (res.ok) {
      const data = await res.json();
      return data.provision;
    }
  } catch {}

  return newProv;
}

export async function deleteProvision(projectId: string, provisionId: string): Promise<boolean> {
  try {
    const local = getLocalFallbackData();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      ...local,
      provisions: local.provisions.filter(p => p.id !== provisionId)
    }));
  } catch {}

  try {
    await fetch(`${API_BASE}/projects/${projectId}/provisions/${provisionId}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(2000)
    });
    return true;
  } catch {
    return false;
  }
}

export async function updateProcurement(
  projectId: string, 
  itemId: string, 
  updates: { purchased?: boolean; quantity?: number }
): Promise<boolean> {
  try {
    const local = getLocalFallbackData();
    const updatedProc = local.procurement.map(i => 
      i.id === itemId ? { ...i, ...updates } : i
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...local, procurement: updatedProc }));
  } catch {}

  try {
    await fetch(`${API_BASE}/projects/${projectId}/procurement/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
      signal: AbortSignal.timeout(2000)
    });
    return true;
  } catch {
    return false;
  }
}
