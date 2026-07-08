const path = require("path");
const fs = require("fs");
const multer = require("multer");
const rootDir = require("./pathutil");

const randomString = (length) => {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, and PNG images are allowed."));
  }
};

const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

let cloudinary;

if (useCloudinary) {
  cloudinary = require("cloudinary").v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Image uploads: Cloudinary");
} else {
  const uploadsDir = path.join(rootDir, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  console.log("Image uploads: local uploads/ folder");
}

const storage = useCloudinary
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, path.join(rootDir, "uploads"));
      },
      filename: (req, file, cb) => {
        cb(null, randomString(10) + "_" + file.originalname);
      },
    });

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("photo");

async function uploadToCloudinary(file) {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  return cloudinary.uploader.upload(dataUri, { folder: "homenest" });
}

function upload(req, res, next) {
  const isHomeForm =
    req.method === "POST" &&
    (req.path.endsWith("/add-home") || req.path.endsWith("/edit-home"));

  if (!isHomeForm) {
    return next();
  }

  multerUpload(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    if (!useCloudinary || !req.file) {
      return next();
    }

    try {
      const result = await uploadToCloudinary(req.file);
      req.file.path = result.secure_url;
      req.file.filename = result.public_id;
      next();
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      next(uploadError);
    }
  });
}

module.exports = { upload, useCloudinary };
