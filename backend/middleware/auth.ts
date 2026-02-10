import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { query } from "../config/database";
import { AuthRequest, ApiResponse } from "../types";

export const auth = {
  verifyToken: (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      const response: ApiResponse = {
        status: 401,
        error: "Access denied. No token provided.",
      };
      res.status(401).json(response);
      return;
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "my-secret-key") as any;
      req.user = decoded;
      next();
    } catch (err) {
      const response: ApiResponse = {
        status: 400,
        error: "Invalid token.",
      };
      res.status(400).json(response);
    }
  },

  isAdmin: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        const response: ApiResponse = {
          status: 401,
          error: "Authentication required.",
        };
        res.status(401).json(response);
        return;
      }
      const result = await query("SELECT is_admin FROM users WHERE id = $1", [userId]);
      if (result.rows.length === 0 || !result.rows[0].is_admin) {
        const response: ApiResponse = {
          status: 403,
          error: "Access denied. Admin privileges required.",
        };
        res.status(403).json(response);
        return;
      }
      next();
    } catch (err) {
      const response: ApiResponse = {
        status: 500,
        error: "Database error",
      };
      res.status(500).json(response);
    }
  },

  checkRecordOwnership: (table: string) => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const recordId = req.params.id;
        const userId = req.user?.id;
        if (!userId) {
          const response: ApiResponse = {
            status: 401,
            error: "Authentication required.",
          };
          res.status(401).json(response);
          return;
        }
        const result = await query(`SELECT user_id FROM ${table} WHERE id = $1`, [recordId]);
        if (result.rows.length === 0) {
          const response: ApiResponse = {
            status: 404,
            error: "Record not found",
          };
          res.status(404).json(response);
          return;
        }
        if (result.rows[0].user_id !== userId && !req.user?.isAdmin) {
          const response: ApiResponse = {
            status: 403,
            error: "Access denied. You can only modify your own records.",
          };
          res.status(403).json(response);
          return;
        }
        next();
      } catch (err) {
        const response: ApiResponse = {
          status: 500,
          error: "Database error",
        };
        res.status(500).json(response);
      }
    };
  },
};

export default auth;
