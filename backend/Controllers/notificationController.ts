import { Response } from "express";
import { getDatabase } from "../config/database.local";
import { AuthRequest, ApiResponse } from "../types";
import { sendError, sendSuccess } from "../utils/controllerHelpers";

export const notificationController = {
  createNotificationForUser: async (payload: {
    user_id: number;
    title: string;
    message: string;
    type?: string;
    related_entity_type?: string;
    related_entity_id?: number;
  }) => {
    const db = getDatabase();
    const { user_id, title, message, type = "info", related_entity_type = null, related_entity_id = null } = payload;
    const query = `
      INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
      VALUES (?, ?, ?, ?, ?, ?)`;
    db.prepare(query).run([user_id, title, message, type, related_entity_type, related_entity_id]);
  },

  getUserNotifications: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const db = getDatabase();
      const userId = req.user?.id;
      if (!userId) {
        sendError(res, 401, "Authentication required");
        return;
      }

      const query = `SELECT id, title, message, type, is_read, related_entity_type, related_entity_id, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
      const result = db.prepare(query).all(userId);

      sendSuccess(res, 200, result);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      sendError(res, 500, "Failed to fetch notifications", err);
    }
  },

  markAllAsRead: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const db = getDatabase();
      const userId = req.user?.id;
      if (!userId) {
        sendError(res, 401, "Authentication required");
        return;
      }

      const query = "UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false";
      db.prepare(query).run([userId]);

      sendSuccess(res, 200, { message: "Marked notifications as read" });
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      sendError(res, 500, "Failed to mark notifications as read", err);
    }
  },

  deleteNotification: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const db = getDatabase();
      const userId = req.user?.id;
      const notificationIdParam = req.params.id;

      if (!userId) {
        sendError(res, 401, "Authentication required");
        return;
      }

      if (!notificationIdParam) {
        sendError(res, 400, "Notification ID required");
        return;
      }

      const notificationId = parseInt(notificationIdParam);
      if (isNaN(notificationId)) {
        sendError(res, 400, "Invalid notification ID");
        return;
      }

      const query = "DELETE FROM notifications WHERE id = ? AND user_id = ?";
      const result = db.prepare(query).run([notificationId, userId]);

      if (result.changes === 0) {
        sendError(res, 404, "Notification not found");
        return;
      }
      sendSuccess(res, 200, { message: "Notification deleted successfully" });
    } catch (err) {
      console.error("Error deleting notification:", err);
      sendError(res, 500, "Failed to delete notification", err);
    }
  },

  deleteOldNotifications: async (daysOld: number = 30): Promise<void> => {
    try {
      const db = getDatabase();
      const query = "DELETE FROM notifications WHERE created_at < datetime('now', '-" + daysOld + " days')";
      const result = db.prepare(query).run();
      console.log(`Deleted ${result.changes} notifications older than ${daysOld} days`);
    } catch (err) {
      console.error("Error deleting old notifications:", err);
    }
  },
};

export default notificationController;
              