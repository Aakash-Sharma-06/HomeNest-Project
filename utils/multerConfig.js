const path = require("path");
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
    cb(null, false);
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

const multerUpload = multer({ storage, fileFilter }).single("photo");

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "homenest" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

function upload(req, res, next) {
  multerUpload(req, res, async (err) => {
    if (err) return next(err);

    if (!useCloudinary || !req.file) {
      return next();
    }

    try {
      const result = await uploadToCloudinary(req.file.buffer);
      req.file.path = result.secure_url;
      req.file.filename = result.public_id;
    } catch (uploadError) {
      return next(uploadError);
    }

    next();
  });
}

module.exports = { upload, useCloudinary };
