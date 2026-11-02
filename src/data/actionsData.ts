export interface ActionItem {
  id: string;
  title: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  description: string;
  checklist?: string[];
  tags?: string[];
  createdAt: string;
  completedAt?: string;
}

export const INITIAL_ACTION_ITEMS: ActionItem[] = [
  {
    id: 'action_nabu_casa',
    title: 'Create and integrate Nabu Casa account',
    category: '📡 Smart Home & Cloud',
    priority: 'high',
    status: 'pending',
    description: 'Δημιουργία επίσημου λογαριασμού Home Assistant Cloud (Nabu Casa) και πλήρης ενσωμάτωση με τον κεντρικό server του σπιτιού στο Server Cabinet.',
    checklist: [
      'Εγγραφή λογαριασμού στο Nabu Casa (account.nabucasa.com)',
      'Ενεργοποίηση ασφαλούς απομακρυσμένης πρόσβασης (Remote UI) χωρίς port forwarding στο router',
      'Σύνδεση με φωνητικούς βοηθούς (Apple HomeKit / Siri, Amazon Alexa, Google Assistant)',
      'Ενεργοποίηση Cloud Text-to-Speech (TTS) για ηχητικές ανακοινώσεις συναγερμού και καταστάσεων',
      'Ρύθμιση αυτοματοποιημένων κρυπτογραφημένων Cloud Backups του Home Assistant'
    ],
    tags: ['Nabu Casa', 'Home Assistant', 'Cloud', 'Remote Access'],
    createdAt: '2026-11-02'
  }
];
