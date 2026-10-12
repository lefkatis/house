export interface BlueprintRoomZone {
  id: string;
  name: string;
  // Normalized percentage bounds on plan_ground_floor.png
  x: number; // left %
  y: number; // top %
  w: number; // width %
  h: number; // height %
  center: { x: number; y: number };
  color: string;
}

export const BLUEPRINT_ROOMS: BlueprintRoomZone[] = [
  {
    id: '🚗 Parking',
    name: 'Parking / Χώροι Στάθμευσης',
    x: 18,
    y: 26,
    w: 10,
    h: 15,
    center: { x: 23, y: 34 },
    color: '#10b981'
  },
  {
    id: '🍳 Κουζίνα',
    name: 'Κουζίνα & Νησίδα',
    x: 28.5,
    y: 25,
    w: 8.5,
    h: 14,
    center: { x: 33, y: 32 },
    color: '#06b6d4'
  },
  {
    id: '🛋️ Σαλόνι / Τραπεζαρία',
    name: 'Σαλόνι & Τραπεζαρία',
    x: 29.5,
    y: 39,
    w: 8.5,
    h: 18.5,
    center: { x: 34, y: 48 },
    color: '#6366f1'
  },
  {
    id: '🖥️ Γραφείο',
    name: 'Γραφείο',
    x: 23.5,
    y: 44.5,
    w: 6,
    h: 12,
    center: { x: 26.5, y: 50.5 },
    color: '#3b82f6'
  },
  {
    id: '🚪 Χώρος Εισόδου',
    name: 'Χώρος Εισόδου',
    x: 29.5,
    y: 57.5,
    w: 5.5,
    h: 5.5,
    center: { x: 32.5, y: 60.5 },
    color: '#8b5cf6'
  },
  {
    id: '🚽 WC Ξένων',
    name: 'WC Ξένων',
    x: 30,
    y: 63,
    w: 5,
    h: 5.5,
    center: { x: 32.5, y: 65.5 },
    color: '#f43f5e'
  },
  {
    id: '🧺 Πλυσταριό',
    name: 'Πλυσταριό',
    x: 41,
    y: 58,
    w: 4,
    h: 9,
    center: { x: 43, y: 62.5 },
    color: '#a855f7'
  },
  {
    id: '🚽 WC - Main',
    name: 'Κυρίως Μπάνιο',
    x: 45,
    y: 58,
    w: 3.5,
    h: 9,
    center: { x: 46.8, y: 62.5 },
    color: '#ec4899'
  },
  {
    id: '🛏️ Bedroom 1',
    name: 'Υπνοδωμάτιο 1',
    x: 48.5,
    y: 54.5,
    w: 6,
    h: 12.5,
    center: { x: 51.5, y: 60.5 },
    color: '#8b5cf6'
  },
  {
    id: '🛏️ Bedroom 2',
    name: 'Υπνοδωμάτιο 2',
    x: 54.5,
    y: 54.5,
    w: 6,
    h: 12.5,
    center: { x: 57.5, y: 60.5 },
    color: '#8b5cf6'
  },
  {
    id: '🚽 WC Ensuite',
    name: 'WC Ensuite',
    x: 60.5,
    y: 57.5,
    w: 3.5,
    h: 9.5,
    center: { x: 62.2, y: 62.5 },
    color: '#ec4899'
  },
  {
    id: '🛏️ Master Bedroom',
    name: 'Master Bedroom',
    x: 64,
    y: 54.5,
    w: 8.5,
    h: 12.5,
    center: { x: 68, y: 60.5 },
    color: '#4f46e5'
  },
  {
    id: '🌳 Κήπος / Πισίνα',
    name: 'Πισίνα & Κήπος',
    x: 51,
    y: 32,
    w: 16,
    h: 15,
    center: { x: 59, y: 39 },
    color: '#14b8a6'
  },
  {
    id: '🪑 Βεράντα / BBQ',
    name: 'Καλυμμένη Βεράντα & BBQ',
    x: 37.5,
    y: 31,
    w: 7,
    h: 23,
    center: { x: 41, y: 42 },
    color: '#f59e0b'
  },
  {
    id: '⚙️ Μηχανοστάσιο',
    name: 'Μηχανοστάσιο / ΧΣ3',
    x: 23.5,
    y: 67.5,
    w: 7.5,
    h: 8.5,
    center: { x: 27, y: 71.5 },
    color: '#ea580c'
  },
  {
    id: '🏠 Βοηθητικό Σπίτι',
    name: 'Βοηθητικό Σπίτι',
    x: 20,
    y: 67,
    w: 11,
    h: 10,
    center: { x: 25.5, y: 72 },
    color: '#0284c7'
  }
];

// Default mapped pin locations for provisions on the ground floor plan
export interface DefaultProvisionPin {
  provisionId: string;
  xPercent: number;
  yPercent: number;
}

export const DEFAULT_PROVISION_PINS: DefaultProvisionPin[] = [
  // Κουζίνα
  { provisionId: 'kitch_island_sockets', xPercent: 33.2, yPercent: 33.5 },
  { provisionId: 'kitch_sink_sockets', xPercent: 30.5, yPercent: 32.5 },
  { provisionId: 'kitch_strip_lights', xPercent: 34.5, yPercent: 30.5 },
  { provisionId: 'kitch_driver_space', xPercent: 35.8, yPercent: 30.0 },
  { provisionId: 'kitch_appliances_wall', xPercent: 29.5, yPercent: 30.0 },
  { provisionId: 'kitch_light_switch', xPercent: 34.8, yPercent: 35.8 },
  { provisionId: 'kitch_presence_sensor', xPercent: 35.5, yPercent: 32.0 },
  { provisionId: 'kitch_smoke_detector', xPercent: 33.0, yPercent: 31.5 },
  { provisionId: 'kitch_glass_break', xPercent: 35.2, yPercent: 26.5 },
  { provisionId: 'kitch_water_drain', xPercent: 30.8, yPercent: 34.0 },

  // Σαλόνι / Τραπεζαρία
  { provisionId: 'liv_touch_panel', xPercent: 32.5, yPercent: 47.5 },
  { provisionId: 'liv_light_switch', xPercent: 31.0, yPercent: 52.0 },
  { provisionId: 'liv_tv_media', xPercent: 32.0, yPercent: 55.5 },
  { provisionId: 'liv_presence_sensor', xPercent: 37.0, yPercent: 48.0 },
  { provisionId: 'liv_ap', xPercent: 34.0, yPercent: 50.0 },
  { provisionId: 'liv_glass_break', xPercent: 36.8, yPercent: 56.5 },
  { provisionId: 'liv_curtain_motor', xPercent: 37.5, yPercent: 53.0 },

  // Γραφείο
  { provisionId: 'off_desk_sockets', xPercent: 25.5, yPercent: 49.0 },
  { provisionId: 'off_network_data', xPercent: 25.5, yPercent: 52.0 },
  { provisionId: 'off_light_switch', xPercent: 28.5, yPercent: 53.5 },
  { provisionId: 'off_presence_sensor', xPercent: 27.5, yPercent: 46.5 },

  // Master Bedroom
  { provisionId: 'mb_bed_headboard', xPercent: 67.5, yPercent: 63.5 },
  { provisionId: 'mb_tv_provision', xPercent: 64.5, yPercent: 59.0 },
  { provisionId: 'mb_closet_led', xPercent: 69.5, yPercent: 57.5 },
  { provisionId: 'mb_light_switch', xPercent: 64.0, yPercent: 56.5 },
  { provisionId: 'mb_presence_sensor', xPercent: 70.0, yPercent: 64.0 },

  // Υπνοδωμάτιο 1 & 2
  { provisionId: 'bed1_bed_sockets', xPercent: 51.5, yPercent: 63.5 },
  { provisionId: 'bed1_light_switch', xPercent: 49.5, yPercent: 56.5 },
  { provisionId: 'bed2_bed_sockets', xPercent: 57.5, yPercent: 63.5 },
  { provisionId: 'bed2_light_switch', xPercent: 55.5, yPercent: 56.5 },

  // Μπάνια
  { provisionId: 'wc_main_towel', xPercent: 46.5, yPercent: 60.5 },
  { provisionId: 'wc_main_vent', xPercent: 47.0, yPercent: 64.5 },
  { provisionId: 'wc_ensuite_towel', xPercent: 62.0, yPercent: 60.5 },
  { provisionId: 'wc_ensuite_vent', xPercent: 62.5, yPercent: 64.5 },
  { provisionId: 'wc_guest_vent', xPercent: 32.5, yPercent: 66.5 },

  // Πλυσταριό
  { provisionId: 'laundry_washer', xPercent: 43.0, yPercent: 61.5 },
  { provisionId: 'laundry_vent', xPercent: 43.0, yPercent: 64.5 },

  // Parking
  { provisionId: 'park_bmw_charger', xPercent: 21.0, yPercent: 30.0 },
  { provisionId: 'park_garage_button', xPercent: 25.5, yPercent: 35.0 },
  { provisionId: 'park_light_switch', xPercent: 26.5, yPercent: 38.0 },
  { provisionId: 'park_presence_sensor', xPercent: 23.5, yPercent: 36.0 },

  // Μηχανοστάσιο
  { provisionId: 'mech_server_rack', xPercent: 27.0, yPercent: 71.0 },
  { provisionId: 'mech_hvac_board', xPercent: 28.5, yPercent: 73.0 },
  { provisionId: 'mech_water_softener', xPercent: 25.5, yPercent: 73.0 }
];
