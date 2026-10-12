import React from 'react';

export type IECSymbolType = 
  | 'socket'
  | 'socket_multi'
  | 'socket_shaver'
  | 'light'
  | 'light_strip'
  | 'switch'
  | 'switch_dimmer'
  | 'button'
  | 'presence_sensor'
  | 'smoke_detector'
  | 'temp_sensor'
  | 'thermostat'
  | 'ethernet'
  | 'access_point'
  | 'doorbell'
  | 'reed_contact'
  | 'glass_break'
  | 'camera'
  | 'siren'
  | 'towel_heater'
  | 'ev_charger'
  | 'extractor_fan'
  | 'panel';

export function getIECSymbolType(provisionName: string, category: string): { type: IECSymbolType; label: string; code: string } {
  const n = provisionName.toLowerCase();
  const c = category.toLowerCase();

  // Button
  if (n.includes('button') || n.includes('μπουτόν')) {
    return { type: 'button', label: 'IEC 60617-11-14-11: Μπουτόν Επαφής (Push Button)', code: '11-14-11' };
  }

  // Sockets
  if (n.includes('shaver') || n.includes('ξυριστικής') || n.includes('πρίζα μπάνιου')) {
    return { type: 'socket_shaver', label: 'IEC 60617: Πρίζα Ξυριστικής Μηχανής IP44 (Μετασχηματιστής Απομόνωσης)', code: '11-13-05' };
  }
  if (n.includes('4x πρίζες') || n.includes('πολλαπλές πρίζες') || n.includes('πολύπριζο')) {
    return { type: 'socket_multi', label: 'IEC 60617: Πολύπριζο / Πολλαπλός Ρευματοδότης 13A', code: '11-13-02' };
  }
  if (c.includes('πρίζες') || n.includes('πρίζα') || n.includes('πρίζες')) {
    return { type: 'socket', label: 'IEC 60617-11-13-01: Μονός Ρευματοδότης (Socket Outlet 13A)', code: '11-13-01' };
  }

  // EV Charger
  if (n.includes('ev charger') || n.includes('φόρτισης')) {
    return { type: 'ev_charger', label: 'IEC 60617: Σταθμός Φόρτισης Ηλεκτρικού Οχήματος (EV Outlet)', code: '11-13-08' };
  }

  // Switches
  if (n.includes('διακόπτες') || n.includes('διακόπτης') || n.includes('ρελέ')) {
    if (n.includes('dimmer')) {
      return { type: 'switch_dimmer', label: 'IEC 60617: Ροοστάτης / Dimmer Φωτισμού', code: '11-14-04' };
    }
    return { type: 'switch', label: 'IEC 60617-11-14-02: Διακόπτης Φωτισμού (One-way / Two-way Switch)', code: '11-14-02' };
  }

  // Lights
  if (n.includes('κρυφός φωτισμός') || n.includes('κρυφοί φωτισμοί') || n.includes('led')) {
    return { type: 'light_strip', label: 'IEC 60617: Γραμμικός Κρυφός Φωτισμός (LED Strip)', code: '11-14-05' };
  }
  if (c.includes('φώτα') || n.includes('φωτισμός')) {
    return { type: 'light', label: 'IEC 60617-11-14-01: Σημείο Φωτισμού (Lighting Point)', code: '11-14-01' };
  }

  // Sensors
  if (n.includes('presense') || n.includes('παρουσίας') || n.includes('mmwave')) {
    return { type: 'presence_sensor', label: 'IEC 60617-11-16-01: Αισθητήρας Παρουσίας / Κίνησης (Presence Detector)', code: '11-16-01' };
  }
  if (n.includes('καπνού') || n.includes('smoke')) {
    return { type: 'smoke_detector', label: 'IEC 60617-11-16-03: Ανιχνευτής Καπνού & Πυρκαγιάς (Smoke Detector)', code: '11-16-03' };
  }
  if (n.includes('θερμοστάτης')) {
    return { type: 'thermostat', label: 'IEC 60617-08-01-01: Θερμοστάτης Χώρου (Room Thermostat)', code: '08-01-01' };
  }
  if (n.includes('θερμοκρασίας')) {
    return { type: 'temp_sensor', label: 'IEC 60617: Αισθητήρας Θερμοκρασίας & Υγρασίας', code: '08-02-01' };
  }

  // Network & Comms
  if (n.includes('access point')) {
    return { type: 'access_point', label: 'IEC 60617: Σημείο Ασύρματης Πρόσβασης Wi-Fi (PoE Access Point)', code: '11-18-04' };
  }
  if (n.includes('ethernet') || n.includes('cat6') || n.includes('δίκτυο')) {
    return { type: 'ethernet', label: 'IEC 60617-11-18-01: Τηλεπικοινωνιακή Πρίζα RJ45 (Data Outlet)', code: '11-18-01' };
  }
  if (n.includes('doorbell') || n.includes('κουδούνι')) {
    return { type: 'doorbell', label: 'IEC 60617-11-15-01: Κουδούνι Εισόδου (Doorbell Chime / Push)', code: '11-15-01' };
  }

  // Safety
  if (n.includes('contact sensor') || n.includes('μαγνητικές επαφές') || n.includes('κούφωμα')) {
    return { type: 'reed_contact', label: 'IEC 60617: Contact Sensor Κουφώματος (Magnetic Reed Contact)', code: '11-16-05' };
  }
  if (n.includes('θραύσης') || n.includes('glass break')) {
    return { type: 'glass_break', label: 'IEC 60617: Αισθητήρας Θραύσης Κρυστάλλων (Glass Break Detector)', code: '11-16-06' };
  }
  if (n.includes('κάμερα') || n.includes('camera')) {
    return { type: 'camera', label: 'IEC 60617: Κάμερα Κλειστού Κυκλώματος CCTV / PoE', code: '11-17-01' };
  }
  if (n.includes('σειρήνα') || n.includes('siren')) {
    return { type: 'siren', label: 'IEC 60617-11-15-04: Σειρήνα Συναγερμού (Acoustic Siren)', code: '11-15-04' };
  }

  // HVAC / Plumbing
  if (n.includes('εξαερισμού') || n.includes('extractor') || n.includes('εξαερισμός')) {
    return { type: 'extractor_fan', label: 'IEC 60617-11-19-01: Μηχανικός Εξαεριστήρας (Extractor Fan)', code: '11-19-01' };
  }
  if (n.includes('πετσετοκρεμάστρα') || n.includes('θερμαντικά')) {
    return { type: 'towel_heater', label: 'IEC 60617: Ηλεκτρική Πετσετοκρεμάστρα / Θερμαντικό Σώμα (Electric Towel Rail)', code: '11-12-01' };
  }

  if (n.includes('υποπίνακας') || n.includes('cabinet') || n.includes('rack')) {
    return { type: 'panel', label: 'IEC 60617-11-01-01: Υποπίνακας / Rack Διανομής (Distribution Board)', code: '11-01-01' };
  }

  return { type: 'socket', label: 'IEC 60617: Ηλεκτρολογικό Σημείο', code: '11-00-01' };
}

interface IECSymbolProps {
  provisionName: string;
  category: string;
  size?: number;
  showTooltip?: boolean;
}

export const IECSymbol: React.FC<IECSymbolProps> = ({ 
  provisionName, 
  category, 
  size = 22,
  showTooltip = true
}) => {
  const { type, label, code } = getIECSymbolType(provisionName, category);

  const renderSvg = () => {
    switch (type) {
      // 1. Single Socket: Semicircle with vertical stem
      case 'socket':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Semicircle */}
            <path d="M5 14 A 7 7 0 0 1 19 14 Z" fill="currentColor" fillOpacity="0.15" />
            {/* Radial Line / Pin */}
            <line x1="12" y1="14" x2="12" y2="4" />
          </svg>
        );

      // 2. Multiple Socket: Semicircle with two radial lines
      case 'socket_multi':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 15 A 8 8 0 0 1 20 15 Z" fill="currentColor" fillOpacity="0.15" />
            <line x1="9" y1="15" x2="9" y2="5" />
            <line x1="15" y1="15" x2="15" y2="5" />
          </svg>
        );

      // 3. Shaver Socket (Isolating transformer): Semicircle with double circle inside
      case 'socket_shaver':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 16 A 8 8 0 0 1 20 16 Z" fill="currentColor" fillOpacity="0.15" />
            <circle cx="9" cy="11" r="3" />
            <circle cx="15" cy="11" r="3" />
            <line x1="12" y1="16" x2="12" y2="4" />
          </svg>
        );

      // 4. Lighting Point: Circle with 45 degree cross (IEC 60617-11-14-01)
      case 'light':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.1" />
            <line x1="6.3" y1="6.3" x2="17.7" y2="17.7" />
            <line x1="17.7" y1="6.3" x2="6.3" y2="17.7" />
          </svg>
        );

      // 5. Light Strip / Hidden LED: Dashed track with cross
      case 'light_strip':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="9" width="18" height="6" rx="2" strokeDasharray="3 2" fill="currentColor" fillOpacity="0.1" />
            <line x1="8" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="8" y2="15" />
          </svg>
        );

      // 6. Switch: Circle with open terminal lever (IEC 60617-11-14-02)
      case 'switch':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="14" r="4" fill="currentColor" fillOpacity="0.2" />
            <line x1="12" y1="10" x2="19" y2="4" />
          </svg>
        );

      // 7. Dimmer: Switch with arrow
      case 'switch_dimmer':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="14" r="4" fill="currentColor" fillOpacity="0.2" />
            <line x1="12" y1="10" x2="19" y2="4" />
            <path d="M16 4 L19 4 L19 7" />
          </svg>
        );

      // 8. Button (Push Button - IEC 60617-11-14-11)
      case 'button':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="7" strokeDasharray="2 2" />
            <line x1="12" y1="16" x2="12" y2="8" />
            <line x1="8" y1="8" x2="16" y2="8" strokeWidth="3" />
          </svg>
        );

      // 9. Presence Sensor (Radar / Motion Detector - IEC 60617-11-16-01)
      case 'presence_sensor':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.1" />
            <path d="M12 9 A 3 3 0 0 1 15 12" />
            <path d="M12 6 A 6 6 0 0 1 18 12" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        );

      // 10. Smoke Detector: Circle with 'S' (IEC 60617-11-16-03)
      case 'smoke_detector':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.1" />
            <path d="M14 9 C 13.5 8 10.5 8 10.5 9.5 C 10.5 11 13.5 11.5 13.5 13 C 13.5 14.5 10.5 14.5 10 13.5" strokeWidth="2" />
          </svg>
        );

      // 11. Thermostat (IEC 60617-08-01-01)
      case 'thermostat':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="5" width="14" height="14" rx="2" fill="currentColor" fillOpacity="0.1" />
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="12" x2="15" y2="9" />
          </svg>
        );

      // 12. Temperature Sensor
      case 'temp_sensor':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.1" />
            <text x="12" y="15" textAnchor="middle" fontSize="10" fontWeight="bold" fill="currentColor" stroke="none">θ</text>
          </svg>
        );

      // 13. Ethernet / Data RJ45 (IEC 60617-11-18-01)
      case 'ethernet':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12,5 20,18 4,18" fill="currentColor" fillOpacity="0.15" />
            <line x1="12" y1="18" x2="12" y2="12" strokeWidth="2" />
          </svg>
        );

      // 14. Access Point: Triangle with broadcast arcs
      case 'access_point':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12,10 17,19 7,19" fill="currentColor" fillOpacity="0.15" />
            <path d="M8 7 A 6 6 0 0 1 16 7" />
            <path d="M5 4 A 10 10 0 0 1 19 4" />
          </svg>
        );

      // 15. Doorbell Chime / Bell (IEC 60617-11-15-01)
      case 'doorbell':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4 A 7 7 0 0 1 19 11 L 19 15 L 21 17 L 3 17 L 5 15 L 5 11 A 7 7 0 0 1 12 4 Z" fill="currentColor" fillOpacity="0.15" />
            <path d="M10 18 A 2 2 0 0 0 14 18" />
          </svg>
        );

      // 16. Reed Contact / Magnetic
      case 'reed_contact':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="8" width="16" height="8" rx="4" fill="currentColor" fillOpacity="0.15" />
            <line x1="8" y1="12" x2="11" y2="12" strokeWidth="2" />
            <line x1="13" y1="12" x2="16" y2="12" strokeWidth="2" />
          </svg>
        );

      // 17. Glass Break
      case 'glass_break':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12,3 21,12 12,21 3,12" fill="currentColor" fillOpacity="0.1" />
            <path d="M10 7 L14 12 L9 14 L13 18" />
          </svg>
        );

      // 18. Camera
      case 'camera':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="7" width="13" height="10" rx="2" fill="currentColor" fillOpacity="0.15" />
            <polygon points="16,10 21,7 21,17 16,14" fill="currentColor" fillOpacity="0.2" />
          </svg>
        );

      // 19. Siren (IEC 60617-11-15-04)
      case 'siren':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.15" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="12" y1="4" x2="12" y2="20" />
            <circle cx="12" cy="12" r="4" fill="currentColor" />
          </svg>
        );

      // 20. Towel Heater / Radiator
      case 'towel_heater':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="4" width="14" height="16" rx="2" fill="currentColor" fillOpacity="0.1" />
            <line x1="8" y1="8" x2="16" y2="8" />
            <line x1="8" y1="12" x2="16" y2="12" />
            <line x1="8" y1="16" x2="16" y2="16" />
          </svg>
        );

      // 21. EV Charger
      case 'ev_charger':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="5" width="16" height="14" rx="3" fill="currentColor" fillOpacity="0.15" />
            <text x="12" y="15" textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor" stroke="none">EV</text>
          </svg>
        );

      // 22. Extractor Fan (IEC 60617-11-19-01)
      case 'extractor_fan':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" fill="currentColor" fillOpacity="0.1" />
            <path d="M12 4 C 14 8 16 10 20 12 C 16 14 14 16 12 20 C 10 16 8 14 4 12 C 8 10 10 8 12 4 Z" fill="currentColor" fillOpacity="0.25" />
          </svg>
        );

      // 23. Distribution Board / Sub-Panel (IEC 60617-11-01-01)
      case 'panel':
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" fill="currentColor" fillOpacity="0.1" />
            <polygon points="4,4 20,4 4,20" fill="currentColor" fillOpacity="0.4" />
          </svg>
        );

      default:
        return (
          <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="7" />
          </svg>
        );
    }
  };

  return (
    <div 
      className="inline-flex items-center justify-center p-1 rounded-md bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700/80 shadow-xs group relative flex-shrink-0"
      title={showTooltip ? `${label} (IEC 60617 Code: ${code})` : undefined}
    >
      {renderSvg()}
    </div>
  );
};
