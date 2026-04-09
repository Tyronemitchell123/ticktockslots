// Real-time notification system
export interface AppNotification {
  id: string;
  type: "slot_new" | "slot_expiring" | "booking_confirmed" | "price_drop" | "ai_suggestion";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: Record<string, unknown>;
}

type NotificationListener = (notification: AppNotification) => void;

class NotificationEngine {
  private listeners: NotificationListener[] = [];
  private notifications: AppNotification[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Only start simulation in browser environments
    if (typeof window !== "undefined") {
      this.startSimulation();
    }
  }

  subscribe(listener: NotificationListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getAll() {
    return [...this.notifications];
  }

  markRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
  }

  markAllRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
  }

  getUnreadCount() {
    return this.notifications.filter((n) => !n.read).length;
  }

  private emit(notification: AppNotification) {
    this.notifications.unshift(notification);
    if (this.notifications.length > 50) this.notifications.pop();
    this.listeners.forEach((l) => l(notification));

    // Browser notification
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(notification.title, { body: notification.message, icon: "/placeholder.svg" });
    }
  }

  private startSimulation() {
    const templates = [
      { type: "slot_new" as const, title: "New Slot Available", messages: [
        "Luxe Spa Manhattan — 60% off deep tissue massage in 45 min",
        "JetBlue empty leg TEB→MIA — $3,200 (was $12,000)",
        "Nobu Downtown — 2 seats tonight at 8 PM, 40% off",
        "Dr. Kim Dermatology — Botox slot in 20 min, $199",
      ]},
      { type: "slot_expiring" as const, title: "⏰ Slot Expiring", messages: [
        "Atlantic Charter flight expires in 30 seconds!",
        "SoulCycle Tribeca spot disappears in 1 minute",
        "Port of Rotterdam berth releasing in 2 minutes",
      ]},
      { type: "price_drop" as const, title: "💰 Price Drop Alert", messages: [
        "Luxe Hair Studio dropped another 15% — now $76",
        "Noma table dropped to $220 — lowest ever",
        "Charter price cut: TEB→MIA now $3,800",
      ]},
      { type: "ai_suggestion" as const, title: "🤖 AI Recommendation", messages: [
        "Based on your history: Spa + Dinner bundle saves $340",
        "Predicted: 3 new aviation slots in next 30 min",
        "Smart match: Dr. Chen has your preferred time slot",
      ]},
    ];

    this.intervalId = setInterval(() => {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const message = template.messages[Math.floor(Math.random() * template.messages.length)];
      this.emit({
        id: crypto.randomUUID(),
        type: template.type,
        title: template.title,
        message,
        timestamp: new Date(),
        read: false,
      });
    }, 8000 + Math.random() * 12000);
  }

  requestPermission() {
    if (typeof Notification !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}

export const notificationEngine = new NotificationEngine();
