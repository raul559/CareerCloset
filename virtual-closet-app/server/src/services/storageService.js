import { Storage } from "@google-cloud/storage";
import sharp from "sharp";
import dotenv from "dotenv";
dotenv.config();

// When running tests, avoid initializing GCS client
let uploadImage;
let deleteFromGCS;

if (process.env.NODE_ENV === "test") {
  uploadImage = async () => null;
  deleteFromGCS = async () => null;
} else {
  const storage =
    process.env.NODE_ENV === "production"
      ? new Storage({
          projectId: process.env.GCS_PROJECT_ID || "virtualcloset-477422",
        })
      : new Storage({
          keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        });

  const BUCKET_NAME =
    process.env.GCS_BUCKET_NAME ||
    process.env.GCS_BUCKET ||
    "pfw-virtual-close";

  const bucket = storage.bucket(BUCKET_NAME);

  // ----------------------
  // UPLOAD IMAGE
  // ----------------------
  uploadImage = async function (fileBuffer, originalName) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!bucket) return reject(new Error("GCS bucket not configured"));

        // Convert image to WebP for better compression
        const webpBuffer = await sharp(fileBuffer)
          .webp({ quality: 80 })
          .toBuffer();

        // Remove original extension and add .webp
        const baseName = originalName.split('.')[0];
        const fileName = `uploads/${Date.now()}_${baseName}.webp`;
        const file = bucket.file(fileName);

        const stream = file.createWriteStream({
          metadata: {
            contentType: "image/webp",
          },
          resumable: false,
        });

        stream.on("error", (err) => reject(err));

        stream.on("finish", async () => {
          // Return the public HTTPS URL (bucket is public with CORS configured)
          const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
          resolve(publicUrl);
        });

        stream.end(webpBuffer);
      } catch (err) {
        reject(err);
      }
    });
  };

  // ----------------------
  // DELETE IMAGE (SILENT)
  // ----------------------
  deleteFromGCS = async function (publicUrl) {
    if (!publicUrl) return;

    try {
      const url = new URL(publicUrl);
      const key = url.pathname.replace(/^\/+/, "");
      const file = bucket.file(key);

      await file.delete();
      // Silent: no console output
    } catch (err) {
      // Silent fail
    }
  };
}

export { uploadImage, deleteFromGCS };
