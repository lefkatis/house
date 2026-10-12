export type HouseType = 'detached' | 'maisonette' | 'apartment' | 'renovation';
export type HvacType = 'hidden_ducted' | 'split_units' | 'none';
export type SmartPlatform = 'home_assistant' | 'homekit' | 'knx' | 'generic';

export interface QuestionnaireAnswers {
  projectName: string;
  houseType: HouseType;
  floors: number;
  bedroomsCount: number;
  hasMasterEnsuite: boolean;
  hasOffice: boolean;
  hasPantry: boolean;
  hasLaundryRoom: boolean;
  hasGuestWc: boolean;
  hasGarageParking: boolean;
  hasVerandaBbq: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  hasAuxiliaryHouse: boolean;
  hasMachineRoom: boolean;

  // Smart Home
  smartLightingRelays: boolean;
  centralTouchPanel: boolean;
  motorizedCurtains: boolean;
  mmWavePresence: boolean;
  smartPlatform: SmartPlatform;

  // Network & Rack
  serverRackInUtility: boolean;
  poeAccessPoints: boolean;
  dualEthernetInOffice: boolean;
  smartDoorbellPoe: boolean;

  // Electrical & Plugs
  deepBackboxes6cm: boolean;
  spareSocketPerWall: boolean;
  kitchenIslandSockets: boolean;
  evCharger: boolean;
  cyprusShaverSockets: boolean;

  // Kitchen & Plumbing
  underSink4Outlets: boolean;
  garbageDisposalSwitch: boolean;
  fridgeWaterLine: boolean;
  ledDriverLocation: boolean;
  pantryPlumbing: boolean;

  // HVAC
  hvacType: HvacType;
  underfloorHeating: boolean;
  mechanicalVentilation: boolean;

  // Security
  wiredMagneticContacts: boolean;
  glassBreakSensors: boolean;
  smokeFireSensors: boolean;
  poeCCTV: boolean;
  centralUps: boolean;

  // Outdoor
  smartIrrigation: boolean;
  gardenLightingCircuits: boolean;
  poolProvisions: boolean;
  bbqProvisions: boolean;
  electricGateIntercom: boolean;
}

export interface CustomProvision {
  id: string;
  name: string;
  room: string;
  wall: string;
  type: string;
  completed: boolean;
  pendingReview?: boolean;
  details?: string;
}

export interface CustomProcurementItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  estimatedPriceEur: number;
  brand?: string;
  model?: string;
  notes: string;
  isTask?: boolean;
  purchased: boolean;
}

export interface CustomProjectData {
  project: {
    id: string;
    name: string;
    house_type: string;
    created_at: string;
    updated_at: string;
  };
  answers: QuestionnaireAnswers;
  rooms: string[];
  provisions: CustomProvision[];
  procurement: CustomProcurementItem[];
  rules: {
    id: string;
    title: string;
    category: string;
    scope: string;
    criticalRequirement: string;
    notes: string;
  }[];
}
