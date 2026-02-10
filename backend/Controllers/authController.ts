import { Request, Response } from "express";
import bcrypt from "bcryptjs";
 import jwt from "jsonwebtoken";
import { getDatabase } from "../config/database.local";
import {
  AuthRequest,
  SignupData,
  LoginData,
  AuthResponse,
  User,
} from "../types";
import {
  sendError,
  sendSuccess,
  validateUserAuth,
} from "../utils/controllerHelpers";
function formatUser(userData: any): Omit<User, "password"> {
  return {
    id: userData.id,
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    phone: userData.phone || undefined,
    is_admin: userData.is_admin,
    profile_picture: userData.profile_picture || undefined,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
  };
}
function generateToken(payload: object): string {
  const JWT_SECRET = process.env.JWT_SECRET || "my-secret-key";
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}
export const authController = {
  signup: async (req: Request, res: Response): Promise<void> => {
    const db = getDatabase();
    try {
      console.log("Signup request body:", req.body);
      const { first_name, last_name, email, password, phone }: SignupData =
        req.body;
      console.log("Extracted data:", { first_name, last_name, email, password: password ? "provided" : "missing", phone });

      if (!first_name || !last_name || !email || !password) {
        console.log("Missing required fields");
        return sendError(
          res,
          400,
          "First name, last name, email, and password are required"
        );
      }

      const existingUsers = db.prepare("SELECT id FROM users WHERE email = ?").get([email]);

      if (existingUsers) {
        return sendError(res, 400, "User already exists with this email");
      }

      console.log("Hashing password...");
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Password hashed successfully");

      console.log("Inserting new user into database...");
      const result = db.prepare("INSERT INTO users (first_name, last_name, email, password, phone) VALUES (?, ?, ?, ?, ?)").run([first_name, last_name, email, hashedPassword, phone || null]);
      console.log("User inserted, returned ID:", result.lastInsertRowid);

      const userResults = db.prepare("SELECT id, first_name, last_name, email, phone, is_admin, created_at, updated_at FROM users WHERE id = ?").get([result.lastInsertRowid]) as Omit<User, "password"> | undefined;

      if (!userResults) {
        return sendError(res, 500, "Failed to retrieve user after creation");
      }

      const user = formatUser(userResults);

      const token = generateToken({ id: user.id, email: user.email });

      const authResponse: AuthResponse = { token, user };
      sendSuccess(res, 201, authResponse);
    } catch (error) {
      console.error("Signup error:", error);
      sendError(res, 500, "Server error during signup", error);
    }
  },
  login: async (req: Request, res: Response): Promise<void> => {
    const db = getDatabase();
    try {
      const { email, password }: LoginData = req.body;
      console.log("Login attempt for email:", email);
      console.log("Password provided (first 10 chars):", password ? password.substring(0, 10) + "..." : "undefined");

      if (!email || !password) {
        console.log("Missing email or password");
        return sendError(res, 400, "Email and password are required");
      }

      const result = db.prepare("SELECT * FROM users WHERE email = ?").get([email]) as User | undefined;
      console.log("Query results:", result ? "found" : "not found");

      if (!result) {
        console.log("User not found for email:", email);
        return sendError(res, 400, "Invalid email or password");
      }

      const userData = result;
      console.log("User found:", userData.email, "Password hash:", userData.password.substring(0, 20) + "...");
      const isPasswordValid = await bcrypt.compare(password, userData.password);
      console.log("Password valid:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("Invalid password for user:", email);
        return sendError(res, 400, "Invalid email or password");
      }

      const user = formatUser(userData);

      const token = generateToken({
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin,
      });

      const authResponse: AuthResponse = { token, user };
      sendSuccess(res, 200, authResponse);
    } catch (error) {
      console.error("Login error:", error);
      sendError(res, 500, "Server error during login", error);
    }
  },
  getProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    const db = getDatabase();
    try {
      const userId = req.user?.id;
      const authCheck = validateUserAuth(userId);
      if (!authCheck.valid) {
        return sendError(
          res,
          401,
          authCheck.error || "Authentication required"
        );
      }

      const results = db.prepare("SELECT id, first_name, last_name, email, phone, is_admin, profile_picture, created_at, updated_at FROM users WHERE id = ?").get([userId]);

      if (!results) {
        return sendError(res, 404, "User not found");
      }

      const user = formatUser(results);
      sendSuccess(res, 200, user);
    } catch (error) {
      sendError(res, 500, "Server error while fetching profile", error);
    }
  },
  updateProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    const db = getDatabase();
    try {
      const userId = req.user?.id;
      const {
        first_name,
        last_name,
        email,
        phone,
      }: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
      } = req.body;

      const authCheck = validateUserAuth(userId);
      if (!authCheck.valid) {
        return sendError(
          res,
          401,
          authCheck.error || "Authentication required"
        );
      }


      if (!first_name && !last_name && !email && phone === undefined) {
        return sendError(
          res,
          400,
          "At least one field must be provided for update"
        );
      }
      if (email) {
        const existingUsers = db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").get([email, userId]);
        if (existingUsers) {
          return sendError(res, 400, "Email is already in use by another user");
        }
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (first_name) {
        updates.push(`first_name = ?`);
        values.push(first_name);
      }
      if (last_name) {
        updates.push(`last_name = ?`);
        values.push(last_name);
      }
      if (email) {
        updates.push(`email = ?`);
        values.push(email);
      }
      if (phone !== undefined) {
        updates.push(`phone = ?`);
        values.push(phone || null);
      }

      updates.push("updated_at = datetime('now')");
      values.push(userId);

      const updateQuery = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;

      db.prepare(updateQuery).run(values);


      const results = db.prepare("SELECT id, first_name, last_name, email, phone, is_admin, profile_picture, created_at, updated_at FROM users WHERE id = ?").get([userId]) as Omit<User, "password"> | undefined;

      if (!results) {
        return sendError(res, 404, "User not found after update");
      }

    const user = formatUser(results);
      sendSuccess(res, 200, user);
    } catch (error) {
      sendError(res, 500, "Server error while updating profile", error);
    }
  },

  uploadProfilePicture: async (req: AuthRequest, res: Response): Promise<void> => {
    const db = getDatabase();
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 401, "Authentication required");
      }

      if (!req.file) {
        return sendError(res, 400, "No file uploaded");
      }

      const filePath = `/uploads/${req.file.filename}`;

      db.prepare("UPDATE users SET profile_picture = ?, updated_at = datetime('now') WHERE id = ?").run([filePath, userId]);

      sendSuccess(res, 200, [{ profile_picture: filePath }]);
    } catch (error) {
      sendError(res, 500, "Server error while uploading profile picture", error);
    }
  },

  getUsers: async (req: AuthRequest, res: Response): Promise<void> => {
    const db = getDatabase();
    try {
      const userId = req.user?.id;

    const authCheck = validateUserAuth(userId);
      if (!authCheck.valid) {
        return sendError(
          res,
          401,
          authCheck.error || "Authentication required"
        );
      }

      const userResults = db.prepare("SELECT is_admin FROM users WHERE id = ?").get([userId]) as { is_admin: boolean } | undefined;

      if (!userResults || !userResults.is_admin) {
        return sendError(res, 403, "Admin access required");
      }

    const results = db.prepare("SELECT id, first_name, last_name, email, phone, is_admin, profile_picture, created_at, updated_at FROM users ORDER BY created_at DESC").all();

   const users = results.map(formatUser);
      sendSuccess(res, 200, users);
    } catch (error) {
      sendError(res, 500, "Server error while fetching users", error);
    }
  },
};

export default authController;
