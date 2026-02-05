import { Response } from "express";

export const sendError = (res: Response, status: number, message: string, error?: any): void => {
  console.error(`Error ${status}: ${message}`, error);
  res.status(status).json({
    status,
    error: message,
  });
};

export const sendSuccess = (res: Response, status: number, data: any): void => {
  res.status(status).json({
    status,
    data: Array.isArray(data) ? data : [data],
  });
};

export const validateUserAuth = (userId: number | undefined): { valid: boolean; error?: string } => {
  if (!userId) {
    return { valid: false, error: "Authentication required" };
  }
  return { valid: true };
};

export const validateCreateRecord = (
  title: string,
  description: string,
  latitude: number,
  longitude: number
): { valid: boolean; error?: string } => {
  if (!title || !description || latitude === undefined || longitude === undefined) {
    return { valid: false, error: "Title, description, latitude, and longitude are required" };
  }
  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: "Latitude must be between -90 and 90" };
  }
  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: "Longitude must be between -180 and 180" };
  }
  return { valid: true };
};

export const processMediaFiles = (files: Express.Multer.File[]): { images: string[]; videos: string[]; audio: string[] } => {
  const images: string[] = [];
  const videos: string[] = [];
  const audio: string[] = [];

  files.forEach((file) => {
    if (file.mimetype.startsWith('image/')) {
      images.push(file.filename);
    } else if (file.mimetype.startsWith('video/')) {
      videos.push(file.filename);
    } else if (file.mimetype.startsWith('audio/')) {
      audio.push(file.filename);
    }
  });

  return { images, videos, audio };
};

export const parseMedia = (rows: any[]): any[] => {
  return rows.map((row) => ({
    ...row,
    images: row.images ? JSON.parse(row.images) : [],
    videos: row.videos ? JSON.parse(row.videos) : [],
    audio: row.audio ? JSON.parse(row.audio) : [],
  }));
};

export const buildRecordResponse = (record: any, user: any): any => {
  return {
    ...record,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    },
  };
};
