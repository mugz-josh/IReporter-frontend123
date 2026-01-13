import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useNavigate } from "react-router-dom";
import "./notifications.css";

interface NotificationItem {
  id: number;
  title?: string;
  message: string;
  is_read: boolean;
  related_entity_type?: string | null;
  related_entity_id?: number | null;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.getNotifications();
      if (res && res.data) setNotifications(res.data as NotificationItem[]);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAll = async () => {
    try {
      await api.markAllNotificationsRead();
      
      await load();
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  return (
    <div className="page-notifications">
      <div className="page-header">
        <h2 className="text-2xl font-semibold">Notifications</h2>
        <div className="button-group">
          <button className="btn" onClick={() => navigate("/dashboard")}>
            Back
          </button>
          <button className="btn" onClick={markAll}>
            Mark all read
          </button>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="loading-state">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>You'll see updates about your reports here.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notification-card ${!n.is_read ? "unread" : ""}`}
              >
                <div className="notification-header">
                  <h4 className="notification-title">{n.title || "Update"}</h4>
                  {!n.is_read && <span className="unread-badge">New</span>}
                </div>
                <div className="notification-message">{n.message}</div>
                <div className="notification-meta">
                  {n.related_entity_type && (
                    <span className="related-info">
                      Related: {n.related_entity_type}{" "}
                      {n.related_entity_id ? `#${n.related_entity_id}` : ""}
                    </span>
                  )}
                  <span className="notification-date">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
