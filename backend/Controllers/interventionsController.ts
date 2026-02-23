
import { Response } from "express";
import { query } from "../config/database";
import {
  AuthRequest,
  CreateRecordData,
  UpdateLocationData,
  UpdateCommentData,
  UpdateStatusData,
  InterventionWithUser,
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

export const interventionsController = {
  
  getAllInterventions: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.isAdmin;

      // Validate that userId exists for non-admin requests
      if (!isAdmin && userId === undefined) {
        sendError(res, 401, "Authentication required");
        return;
      }

      const sql = isAdmin
        ? `
          SELECT i.*, u.first_name, u.last_name, u.email
          FROM interventions i
          JOIN users u ON i.user_id = u.id
          ORDER BY i.created_at DESC
        `
        : `
          SELECT i.*, u.first_name, u.last_name, u.email
          FROM interventions i
          JOIN users u ON i.user_id = u.id
          WHERE i.user_id = $1
          ORDER BY i.created_at DESC
        `;

      const result = await query(sql, isAdmin ? [] : [userId as number]);

      const interventionsWithParsedMedia = parseMedia(result.rows);

      sendSuccess(res, 200, interventionsWithParsedMedia);
    } catch (err) {
      sendError(res, 500, "Database error", err);
    }
  },

  
  getIntervention: async (req: AuthRequest, res: Response): Promise<void> => {
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
        SELECT i.*, u.first_name, u.last_name, u.email
        FROM interventions i
        JOIN users u ON i.user_id = u.id
        WHERE i.id = $1
      `;

      const result = await query(sql, [id]);

      if (result.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
        });
        return;
      }

      const intervention = result.rows[0];

      const interventionWithParsedMedia = {
        ...intervention,
        images: intervention?.images ? JSON.parse(intervention.images) : [],
        videos: intervention?.videos ? JSON.parse(intervention.videos) : [],
      };

      sendSuccess(res, 200, interventionWithParsedMedia);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({
        status: 500,
        error: "Database error",
      });
    }
  },

  
  createIntervention: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
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

      // Filter files to images and videos
      const validFiles = files ? files.filter(file =>
        file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')
      ) : [];

      const media =
        validFiles && validFiles.length > 0
          ? processMediaFiles(validFiles)
          : { images: [], videos: [] };

      const sql = `
        INSERT INTO interventions (user_id, title, description, latitude, longitude, images, videos)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
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
      ]);

      sendSuccess(
        res,
        201,
        { id: result.rows[0].id, message: "Created intervention record" }
      );
    } catch (error) {
      sendError(res, 500, "Server error during intervention creation", error);
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
        "SELECT user_id, status, images, videos FROM interventions WHERE id = $1";
      const checkResult = await query(checkSql, [id]);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
        });
        return;
      }

      const intervention = checkResult.rows[0];

      if (intervention.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }

      if (intervention.status !== "draft") {
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

      const existingImages = intervention.images ? JSON.parse(intervention.images) : [];
      const existingVideos = intervention.videos ? JSON.parse(intervention.videos) : [];

      const newImages = imageFiles.map((file) => file.filename);
      const newVideos = videoFiles.map((file) => file.filename);

      const updatedImages = [...existingImages, ...newImages];
      const updatedVideos = [...existingVideos, ...newVideos];

      const updateSql =
        "UPDATE interventions SET images = $1, videos = $2 WHERE id = $3";
      await query(updateSql, [
        updatedImages.length > 0 ? JSON.stringify(updatedImages) : null,
        updatedVideos.length > 0 ? JSON.stringify(updatedVideos) : null,
        id,
      ]);

      sendSuccess(res, 200, {
        id: parseInt(id),
        message: `Added ${newImages.length} images and ${newVideos.length} videos to intervention record`,
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

      const checkSql = "SELECT user_id, status FROM interventions WHERE id = $1";
      const checkResult = await query(checkSql, [id]);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
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
        "UPDATE interventions SET latitude = $1, longitude = $2 WHERE id = $3";
      await query(updateSql, [latitude, longitude, id]);

      sendSuccess(res, 200, {
        id: parseInt(id),
        message: "Updated intervention record's location",
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

      const checkSql = "SELECT user_id, status FROM interventions WHERE id = $1";
      const checkResult = await query(checkSql, [id]);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
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

      const updateSql = "UPDATE interventions SET description = $1 WHERE id = $2";
      await query(updateSql, [description, id]);

      sendSuccess(res, 200, {
        id: parseInt(id),
        message: "Updated intervention record's comment",
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to update comment",
      });
    }
  },

  
  deleteIntervention: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      const checkSql = "SELECT user_id, status FROM interventions WHERE id = $1";
      const checkResult = await query(checkSql, [id]);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
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

      const deleteSql = "DELETE FROM interventions WHERE id = $1";
      await query(deleteSql, [id]);

      sendSuccess(res, 200, {
        id: parseInt(id),
        message: "Intervention record has been deleted",
      });
    } catch (error) {
      console.error("Error deleting intervention:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to delete intervention record",
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
        "SELECT i.*, u.email FROM interventions i JOIN users u ON i.user_id = u.id WHERE i.id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        res
          .status(404)
          .json({ status: 404, error: "Intervention record not found" });
        return;
      }
      const report = result.rows[0] as {
        user_id: number;
        title: string;
        email: string;
        status: string;
      };

      const updateSql = "UPDATE interventions SET status = $1 WHERE id = $2";
      const updateResult = await query(updateSql, [status, id]);

      if (updateResult.rowCount === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
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
          `Your intervention "${report.title}" status changed to "${status}"`,
          "info",
          "intervention",
          parseInt(id, 10),
        ]);
      } catch (nErr) {
        console.error(
          "Failed to create notification after status change:",
        );
      }

      try {
        await EmailService.sendReportStatusNotification(
          report.email,
          "intervention",
          report.title,
          report.status,
          status
        );
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }

      sendSuccess(res, 200, {
        id: parseInt(id),
        message: "Updated intervention record status",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to update status",
      });
    }
  },

  
  updateIntervention: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const startTime = Date.now();
    console.log(`🔄 Starting updateIntervention for ID: ${req.params.id}`);
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
        "SELECT user_id, status, images, videos FROM interventions WHERE id = $1";
      const checkResult = await query(checkSql, [id]);
      console.log(`✅ Record check took ${Date.now() - checkStart}ms`);

      if (checkResult.rows.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
        });
        return;
      }

      const intervention = checkResult.rows[0];

      if (intervention.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }

      if (intervention.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot modify record that is under investigation, rejected, or resolved",
        });
        return;
      }

      let updatedImages = intervention.images ? JSON.parse(intervention.images) : [];
      let updatedVideos = intervention.videos ? JSON.parse(intervention.videos) : [];

      if (files && files.length > 0) {
        console.log(`📁 Processing ${files.length} files...`);
        const fileStart = Date.now();
        // Filter files to images and videos
        const validFiles = files.filter(file =>
          file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')
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
        UPDATE interventions
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
        id: parseInt(id),
        message: "Updated intervention record",
      });
    } catch (error) {
      console.error("Error updating intervention:", error);
      res.status(500).json({
        status: 500,
        error: "Server error during intervention update",
      });
    }
  },
};

export default interventionsController;
