import type { Request } from "express";
import multer from "multer";
import { config } from "../config/config.js";
import createError from "http-errors";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tmpDir = "/tmp/uploads/";
    fs.mkdirSync(tmpDir, { recursive: true }); // Create tmp folder if not exists
    cb(null, tmpDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (config.allowedFileTypes.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(createError(400, "Invalid file type. Only Images and PDFs are allowed."));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { files: 1, fileSize: config.maxFileSize },
});
