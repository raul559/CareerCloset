import { Storage } from "@google-cloud/storage";
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

        const fileName = `uploads/${Date.now()}_${originalName}`;
        const file = bucket.file(fileName);

        const stream = file.createWriteStream({
          metadata: { contentType: "image/jpeg" },
          resumable: false,
        });

        stream.on("error", (err) => reject(err));

        stream.on("finish", () => {
          // Return the GCS path (not the signed URL)
          // Signed URLs will be generated on-demand by gcsService
          resolve(fileName);
        });

        stream.end(fileBuffer);
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
