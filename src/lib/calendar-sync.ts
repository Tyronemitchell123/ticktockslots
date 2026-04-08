// Calendar Sync — simulated integration with Google Calendar / Outlook / Calendly

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: "confirmed" | "cancelled" | "tentative";
  source: "google" | "outlook" | "calendly";
  cancellationDetected?: boolean;
}

export interface CalendarConnection {
  id: string;
  provider: "google" | "outlook" | "calendly";
  email: string;
  connected: boolean;
  lastSync: Date;
  eventsTracked: number;
  cancellationsDetected: number;
}

const STORAGE_KEY = "ticktockslots_calendars";

export function getConnections(): CalendarConnection[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored).map((c: CalendarConnection) => ({ ...c, lastSync: new Date(c.lastSync) }));
  } catch {}
  return [];
}

export function connectCalendar(provider: "google" | "outlook" | "calendly", email: string): CalendarConnection {
  const connections = getConnections();
  const conn: CalendarConnection = {
    id: crypto.randomUUID(),
    provider,
    email,
    connected: true,
    lastSync: new Date(),
    eventsTracked: Math.floor(Math.random() * 50) + 20,
    cancellationsDetected: Math.floor(Math.random() * 8) + 2,
  };
  connections.push(conn);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  return conn;
}

export function disconnectCalendar(id: string) {
  const connections = getConnections().filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
}

export function getRecentEvents(): CalendarEvent[] {
  const now = new Date();
  return [
    { id: "e1", title: "Hair Appointment - Luxe Studio", start: new Date(now.getTime() + 3600000), end: new Date(now.getTime() + 7200000), status: "cancelled", source: "google", cancellationDetected: true },
    { id: "e2", title: "Team Standup", start: new Date(now.getTime() + 1800000), end: new Date(now.getTime() + 3600000), status: "confirmed", source: "outlook" },
    { id: "e3", title: "Dermatology Consultation", start: new Date(now.getTime() + 86400000), end: new Date(now.getTime() + 90000000), status: "cancelled", source: "calendly", cancellationDetected: true },
    { id: "e4", title: "Dinner at Nobu", start: new Date(now.getTime() + 28800000), end: new Date(now.getTime() + 36000000), status: "tentative", source: "google" },
    { id: "e5", title: "Yoga Class", start: new Date(now.getTime() + 43200000), end: new Date(now.getTime() + 46800000), status: "cancelled", source: "calendly", cancellationDetected: true },
  ];
}
