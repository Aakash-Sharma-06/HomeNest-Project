const fs = require("fs");
const path = require("path");

const useCloudinary =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

function getPhotoUrl(file) {
  if (!file) return null;

  if (file.path && file.path.startsWith("http")) {
    return file.path;
  }

  const filename = file.filename || path.basename(file.path);
  return `/uploads/${filename}`;
}

async function deletePhoto(photoPath) {
  if (!photoPath) return;

  if (photoPath.startsWith("http")) {
    if (!useCloudinary) return;

    const cloudinary = require("cloudinary").v2;
    const publicId = photoPath.split("/upload/")[1]?.replace(/^v\d+\//, "");
    if (publicId) {
      await cloudinary.uploader.destroy(publicId.replace(/\.[^/.]+$/, ""));
    }
    return;
  }

  const localPath = path.isAbsolute(photoPath)
    ? photoPath
    : path.join(process.cwd(), photoPath.replace(/^\//, ""));

  await fs.promises.unlink(localPath).catch(() => {});
}

module.exports = { getPhotoUrl, deletePhoto };
