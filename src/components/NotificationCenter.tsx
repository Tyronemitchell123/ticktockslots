import { useState, useEffect } from "react";
import { Bell, X, Check, Sparkles, AlertTriangle, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationEngine, type AppNotification } from "@/lib/notifications";

const typeIcons = {
  slot_new: <Sparkles className="w-4 h-4 text-primary" />,
  slot_expiring: <Clock className="w-4 h-4 text-destructive" />,
  booking_confirmed: <Check className="w-4 h-4 text-green-400" />,
  price_drop: <DollarSign className="w-4 h-4 text-secondary" />,
  ai_suggestion: <AlertTriangle className="w-4 h-4 text-purple-400" />,
};

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationEngine.requestPermission();
    const unsub = notificationEngine.subscribe(() => {
      setNotifications(notificationEngine.getAll());
      setUnread(notificationEngine.getUnreadCount());
    });
    setNotifications(notificationEngine.getAll());
    setUnread(notificationEngine.getUnreadCount());
    return unsub;
  }, []);

  const handleMarkAllRead = () => {
    notificationEngine.markAllRead();
    setNotifications(notificationEngine.getAll());
    setUnread(0);
  };

  const timeAgo = (date: Date) => {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-countdown">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 glass rounded-xl border border-border/50 shadow-2xl overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-border/30">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleMarkAllRead}>
                    Mark all read
                  </Button>
                )}
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet</div>
              ) : (
                notifications.slice(0, 15).map((n) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border/20 hover:bg-muted/30 transition-colors cursor-pointer ${!n.read ? "bg-primary/5" : ""}`}
                    onClick={() => {
                      notificationEngine.markRead(n.id);
                      setNotifications(notificationEngine.getAll());
                      setUnread(notificationEngine.getUnreadCount());
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{typeIcons[n.type]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-foreground">{n.title}</span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(n.timestamp)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      </div>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
