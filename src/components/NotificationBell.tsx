import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NotificationItem {
  id: number;
  title?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.getNotifications();
        if (res && res.data) setNotifications(res.data as NotificationItem[]);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  
  const unreadNotifications = notifications.filter((n) => !n.is_read);

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  };

  const navigate = useNavigate();

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-2 border-b font-semibold">Notifications</div>
          <div className="max-h-64 overflow-auto">
            {unreadNotifications.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">
                No unread notifications
              </div>
            )}
            {unreadNotifications.map((n) => (
              <div key={n.id} className={`p-3 text-sm border-b bg-gray-50`}>
                <div className="font-medium">{n.title || "Update"}</div>
                <div className="text-xs text-muted-foreground">{n.message}</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 flex justify-center space-x-4">
            <button
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                transition: "background-color 0.2s",
              }}
              onClick={markAllAsRead}
            >
              Mark all read
            </button>
            <button
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                padding: "0.25rem 0.5rem",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                transition: "background-color 0.2s",
              }}
              onClick={() => navigate("/notifications")}
            >
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
