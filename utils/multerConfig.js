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

let cloudinary;

function isCloudinaryConfigured() {
  if (process.env.CLOUDINARY_URL?.trim()) {
    return true;
  }

  return !!(
    process.env.CLOUDINARY_CLOUD_NAME?.trim() &&
    process.env.CLOUDINARY_API_KEY?.trim() &&
    process.env.CLOUDINARY_API_SECRET?.trim()
  );
}

function getCloudinary() {
  if (!cloudinary) {
    cloudinary = require("cloudinary").v2;

    if (process.env.CLOUDINARY_URL?.trim()) {
      cloudinary.config();
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        api_key: process.env.CLOUDINARY_API_KEY.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
      });
    }
  }

  return cloudinary;
}

function logUploadConfig() {
  if (isCloudinaryConfigured()) {
    const source = process.env.CLOUDINARY_URL?.trim()
      ? "CLOUDINARY_URL"
      : "CLOUDINARY_CLOUD_NAME + API_KEY + API_SECRET";
    console.log(`Image uploads: Cloudinary (${source})`);
    return;
  }

  console.log("Image uploads: local uploads/ folder");
  console.warn(
    "Cloudinary is NOT configured. Set CLOUDINARY_URL or all three CLOUDINARY_* vars on Render."
  );

  if (!process.env.CLOUDINARY_CLOUD_NAME?.trim()) {
    console.warn("Missing: CLOUDINARY_CLOUD_NAME");
  }
  if (!process.env.CLOUDINARY_API_KEY?.trim()) {
    console.warn("Missing: CLOUDINARY_API_KEY");
  }
  if (!process.env.CLOUDINARY_API_SECRET?.trim()) {
    console.warn("Missing: CLOUDINARY_API_SECRET");
  }
}

const multerUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("photo");

async function saveLocalPhoto(file) {
  const uploadsDir = path.join(rootDir, "uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filename = randomString(10) + "_" + file.originalname;
  const filePath = path.join(uploadsDir, filename);

  await fs.promises.writeFile(filePath, file.buffer);

  return {
    url: `/uploads/${filename}`,
    publicId: filename,
  };
}

async function saveCloudinaryPhoto(file) {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await getCloudinary().uploader.upload(dataUri, {
    folder: "homenest",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

function upload(req, res, next) {
  const isHomeForm =
    req.method === "POST" &&
    (req.originalUrl.includes("/add-home") ||
      req.originalUrl.includes("/edit-home"));

  if (!isHomeForm) {
    return next();
  }

  multerUpload(req, res, async (err) => {
    if (err) {
      return next(err);
    }

    if (!req.file) {
      return next();
    }

    try {
      const saved = isCloudinaryConfigured()
        ? await saveCloudinaryPhoto(req.file)
        : await saveLocalPhoto(req.file);

      req.file.path = saved.url;
      req.file.filename = saved.publicId;
      next();
    } catch (uploadError) {
      console.error("Photo upload failed:", uploadError);
      next(uploadError);
    }
  });
}

module.exports = {
  upload,
  isCloudinaryConfigured,
  logUploadConfig,
};
