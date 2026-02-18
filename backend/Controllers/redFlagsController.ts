

import { Response } from "express";
import { query } from "../config/database";
import {
  AuthRequest,
  CreateRecordData,
  UpdateLocationData,
  UpdateCommentData,
  UpdateStatusData,
  RedFlagWithUser,
} from "../types";

import EmailService from "../services/emailService";
import SMSService from "../services/smsService";
import GovernmentAPIService from "../services/governmentAPIService";
import {
  sendError,
  sendSuccess,
  processMediaFiles,
  parseMedia,
  validateCreateRecord,
  validateUserAuth,
  buildRecordResponse,
} from "../utils/controllerHelpers";

export const redFlagsController = {
  getAllRedFlags: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.isAdmin;

      const sql = isAdmin
        ? `
          SELECT rf.*, u.first_name, u.last_name, u.email
          FROM red_flags rf
          JOIN users u ON rf.user_id = u.id
          ORDER BY rf.created_at DESC
        `
        : `
          SELECT rf.*, u.first_name, u.last_name, u.email
          FROM red_flags rf
          JOIN users u ON rf.user_id = u.id
          WHERE rf.user_id = $1
          ORDER BY rf.created_at DESC
        `;

      const result = await query(sql, isAdmin ? [] : [userId as number]);

      const redFlagsWithParsedMedia = parseMedia(result.rows);

      sendSuccess(res, 200, redFlagsWithParsedMedia);
    } catch (err) {
      sendError(res, 500, "Database error", err);
    }
  },

  getRedFlag: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      const sql = `
        SELECT rf.*, u.first_name, u.last_name, u.email
        FROM red_flags rf
        JOIN users u ON rf.user_id = u.id
        WHERE rf.id = $1
      `;

      const result = await query(sql, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const redFlag = result.rows[0];

      const redFlagWithParsedMedia = {
        ...redFlag,
        images: redFlag?.images ? JSON.parse(redFlag.images) : [],
        videos: redFlag?.videos ? JSON.parse(redFlag.videos) : [],
      };

      sendSuccess(res, 200, redFlagWithParsedMedia);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({
        status: 500,
        error: "Database error",
      });
    }
  },

  createRedFlag: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description, latitude, longitude }: CreateRecordData =
        req.body;
      const userId = req.user?.id;
      const files = req.files as Express.Multer.File[];

      const authCheck = validateUserAuth(userId);
      if (!authCheck.valid) {
        sendError(res, 401, authCheck.error!);
        return;
      }

      // Parse latitude and longitude to numbers (they come as strings from FormData)
      const parsedLatitude = parseFloat(latitude);
      const parsedLongitude = parseFloat(longitude);

      const validation = validateCreateRecord(
        title,
        description,
        parsedLatitude,
        parsedLongitude
      );
      if (!validation.valid) {
        sendError(res, 400, validation.error!);
        return;
      }

      // Filter files to images, videos, and audio
      const validFiles = files ? files.filter(file =>
        file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')
      ) : [];

      const media =
        validFiles && validFiles.length > 0
          ? processMediaFiles(validFiles)
          : { images: [], videos: [], audio: [] };

      const sql = `
        INSERT INTO red_flags (user_id, title, description, latitude, longitude, images, videos, audio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;

      const result = await query(sql, [
        userId as number,
        title,
        description,
        parsedLatitude,
        parsedLongitude,
        media.images.length > 0 ? JSON.stringify(media.images) : null,
        media.videos.length > 0 ? JSON.stringify(media.videos) : null,
        media.audio.length > 0 ? JSON.stringify(media.audio) : null,
      ]);

      sendSuccess(
        res,
        201,
        { id: result.rows[0].id, message: "Created red-flag record" }
      );
    } catch (error) {
      sendError(res, 500, "Server error during red-flag creation", error);
    }
  },

  addMedia: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      if (!files || files.length === 0) {
        res.status(400).json({
          status: 400,
          error: "No files uploaded",
        });
        return;
      }

      const checkSql =
        "SELECT user_id, status, images, videos FROM red_flags WHERE id = $1";
      const checkResult = await query(checkSql, [id]);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const redFlag = checkResult.rows[0];

      if (redFlag.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }

      if (redFlag.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot modify record that is under investigation, rejected, or resolved",
        });
        return;
      }

      const imageFiles = files.filter((file) =>
        file.mimetype.startsWith("image/")
      );
      const videoFiles = files.filter((file) =>
        file.mimetype.startsWith("video/")
      );

      const existingImages = redFlag.images ? JSON.parse(redFlag.images) : [];
      const existingVideos = redFlag.videos ? JSON.parse(redFlag.videos) : [];

      const newImages = imageFiles.map((file) => file.filename);
      const newVideos = videoFiles.map((file) => file.filename);

      const updatedImages = [...existingImages, ...newImages];
      const updatedVideos = [...existingVideos, ...newVideos];

      const updateSql =
        "UPDATE red_flags SET images = $1, videos = $2, audio = $3 WHERE id = $4";
      await query(updateSql, [
        updatedImages.length > 0 ? JSON.stringify(updatedImages) : null,
        updatedVideos.length > 0 ? JSON.stringify(updatedVideos) : null,
        null,
        id,
      ]);

      sendSuccess(res, 200, {
        id: parseInt(id),
        message: `Added ${newImages.length} images and ${newVideos.length} videos to red-flag record`,
      });
    } catch (error) {
      console.error("Error adding media:", error);
      res.status(500).json({
        status: 500,
        error: "Server error during media upload",
      });
    }
  },

  updateLocation: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { latitude, longitude }: UpdateLocationData = req.body;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      const checkSql = "SELECT user_id, status FROM red_flags WHERE id = $1";
      const checkResult = await query(checkSql, [id]);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const record = checkResult.rows[0];

      if (record.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }

      if (record.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot modify record that is under investigation, rejected, or resolved",
        });
        return;
      }

      const updateSql =
        "UPDATE red_flags SET latitude = $1, longitude = $2 WHERE id = $3";
      await query(updateSql, [latitude, longitude, id]);

      res.status(200).json({
        status: 200,
        data: [
          {
            id: parseInt(id),
            message: "Updated red-flag record's location",
          },
        ],
      });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to update location",
      });
    }
  },

  updateComment: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { description }: UpdateCommentData = req.body;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      const checkSql = "SELECT user_id, status FROM red_flags WHERE id = $1";
      const checkResult = await query(checkSql, [id]);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const record = checkResult.rows[0];

      if (record.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }

      if (record.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot modify record that is under investigation, rejected, or resolved",
        });
        return;
      }

      const updateSql = "UPDATE red_flags SET description = $1 WHERE id = $2";
      await query(updateSql, [description, id]);

      sendSuccess(res, 200, {
        id: parseInt(String(id)),
        message: "Updated red-flag record's comment",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to update comment",
      });
    }
  },

  deleteRedFlag: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      const checkSql = "SELECT user_id, status FROM red_flags WHERE id = $1";
      const checkResult = await query(checkSql, [id]);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const record = checkResult.rows[0];

      if (record.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only delete your own records.",
        });
        return;
      }

      if (record.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot delete record that is under investigation, rejected, or resolved",
        });
        return;
      }

      const deleteSql = "DELETE FROM red_flags WHERE id = $1";
      await query(deleteSql, [id]);

      sendSuccess(res, 200, {
        id: parseInt(String(id)),
        message: "Red-flag record has been deleted",
      });
    } catch (error) {
      console.error("Error deleting red flag:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to delete red-flag record",
      });
    }
  },

  updateStatus: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status }: UpdateStatusData = req.body;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      const validStatuses = ["under-investigation", "rejected", "resolved"];
      if (!status || !validStatuses.includes(status)) {
        res.status(400).json({
          status: 400,
          error:
            "Invalid status. Must be one of: under-investigation, rejected, resolved",
        });
        return;
      }

      const result = await query(
        "SELECT rf.*, u.email FROM red_flags rf JOIN users u ON rf.user_id = u.id WHERE rf.id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        res
          .status(404)
          .json({ status: 404, error: "Red-flag record not found" });
        return;
      }
      const report = result.rows[0] as {
        user_id: number;
        title: string;
        email: string;
        status: string;
      };

      const updateSql = "UPDATE red_flags SET status = $1 WHERE id = $2";
      const updateResult = await query(updateSql, [status, id]);

      if (updateResult.rowCount === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }
      try {
        const notificationSql = `
          INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await query(notificationSql, [
          report.user_id,
          "Report status updated",
          `Your report "${report.title}" status changed to "${status}"`,
          "info",
          "red_flag",
          parseInt(String(id), 10),
        ]);
      } catch (nErr) {
        console.error("Failed to create notification after status change:");
      }
      try {
        await EmailService.sendReportStatusNotification(
          report.email,
          "redflag",
          report.title,
          report.status,
          status
        );
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }

      try {
        await SMSService.sendStatusUpdateSMS(
          "0754316375", // Admin phone number
          "red-flag",
          report.title,
          status
        );
      } catch (smsError) {
        console.error("Failed to send SMS notification:", smsError);
      }

      // Forward to government API if status is under-investigation
      if (status === "under-investigation") {
        try {
          // Get full report data for government API
          const fullReportSql = `
            SELECT rf.*, u.email
            FROM red_flags rf
            JOIN users u ON rf.user_id = u.id
            WHERE rf.id = $1
          `;
          const fullReportResult = await query(fullReportSql, [id]);
          const fullReport = fullReportResult.rows[0];

          if (!fullReport) {
            console.warn(`Failed to retrieve full report data for red flag ${id}`);
            return;
          }

          const governmentReportData = {
            id: parseInt(String(id)),
            title: fullReport.title,
            description: fullReport.description || '',
            latitude: fullReport.latitude,
            longitude: fullReport.longitude,
            status: status,
            images: fullReport.images ? JSON.parse(fullReport.images) : [],
            videos: fullReport.videos ? JSON.parse(fullReport.videos) : [],
            user_email: fullReport.email,
            created_at: fullReport.created_at.toISOString(),
            report_type: 'red_flag' as const,
          };

          const forwarded = await GovernmentAPIService.forwardReportToGovernment(governmentReportData);
          if (forwarded) {
            console.log(`Red flag report ${id} forwarded to government API`);
          } else {
            console.warn(`Failed to forward red flag report ${id} to government API`);
          }
        } catch (govError) {
          console.error("Error forwarding report to government API:", govError);
          // Don't fail the entire request if government API fails
        }
      }

      sendSuccess(res, 200, {
        id: parseInt(String(id)),
        message: "Updated red-flag record status",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to update status",
      });
    }
  },


  updateRedFlag: async (req: AuthRequest, res: Response): Promise<void> => {
    const startTime = Date.now();
    console.log(`🔄 Starting updateRedFlag for ID: ${req.params.id}`);
    try {
      const { id } = req.params;
      const { title, description, latitude, longitude }: CreateRecordData =
        req.body;
      const files = req.files as Express.Multer.File[];

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      console.log(`⏳ Checking record existence...`);
      const checkStart = Date.now();
      const checkSql =
        "SELECT user_id, status, images, videos, audio FROM red_flags WHERE id = $1";
      const checkResult = await query(checkSql, [id]);
      console.log(`✅ Record check took ${Date.now() - checkStart}ms`);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const redFlag = checkResult.rows[0];

      if (redFlag.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }

      if (redFlag.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot modify record that is under investigation, rejected, or resolved",
        });
        return;
      }
      let updatedImages = redFlag.images ? JSON.parse(redFlag.images) : [];
      let updatedVideos = redFlag.videos ? JSON.parse(redFlag.videos) : [];
      let updatedAudio = redFlag.audio ? JSON.parse(redFlag.audio) : [];

      if (files && files.length > 0) {
        console.log(`📁 Processing ${files.length} files...`);
        const fileStart = Date.now();
        // Filter files to images, videos, and audio
        const validFiles = files.filter(file =>
          file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')
        );

        const imageFiles = validFiles.filter((file) =>
          file.mimetype.startsWith("image/")
        );
        const videoFiles = validFiles.filter((file) =>
          file.mimetype.startsWith("video/")
        );

        updatedImages = imageFiles.map((file) => file.filename);
        updatedVideos = videoFiles.map((file) => file.filename);
        console.log(`✅ File processing took ${Date.now() - fileStart}ms`);
      } else {
        console.log(`📁 No new files uploaded, keeping existing media`);
      }

      console.log(`💾 Updating database...`);
      const dbStart = Date.now();
      const updateSql = `
        UPDATE red_flags
        SET title = $1, description = $2, latitude = $3, longitude = $4, images = $5, videos = $6
        WHERE id = $7
      `;

      await query(updateSql, [
        title,
        description,
        latitude,
        longitude,
        updatedImages.length > 0 ? JSON.stringify(updatedImages) : null,
        updatedVideos.length > 0 ? JSON.stringify(updatedVideos) : null,
        id,
      ]);
      console.log(`✅ Database update took ${Date.now() - dbStart}ms`);

      console.log(`🎉 Total update time: ${Date.now() - startTime}ms`);
      sendSuccess(res, 200, {
        id: parseInt(String(id)),
        message: "Updated red-flag record",
      });
    } catch (error) {
      console.error("Error updating red flag:", error);
      res.status(500).json({
        status: 500,
        error: "Server error during red-flag update",
      });
    }
  },
};

export default redFlagsController;
