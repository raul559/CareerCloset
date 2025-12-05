import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
dotenv.config();

// Initialize storage based on environment
const storage = process.env.NODE_ENV === 'production'
  ? new Storage({ projectId: process.env.GCS_PROJECT_ID || 'virtualcloset-477422' })
  : new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || process.env.GCS_BUCKET || 'pfw-virtual-close';
const bucket = storage.bucket(BUCKET_NAME);

console.log(`📦 Storage Service initialized with bucket: ${BUCKET_NAME}`);

export async function uploadImage(fileBuffer, originalName) {
  return new Promise(async (resolve, reject) => {
    try {
      const fileName = `uploads/${Date.now()}_${originalName}`;
      const file = bucket.file(fileName);

      const stream = file.createWriteStream({
        metadata: {
          contentType: "image/jpeg",
        },
        resumable: false,
      });

      stream.on("error", (err) => reject(err));

      stream.on("finish", async () => {
        // No makePublic() because UBLA is enabled
        // Instead generate a SIGNED URL for viewing
        const [signedUrl] = await file.getSignedUrl({
          action: "read",
          expires: "03-17-2050", // Long-lived for project demo
        });

        resolve(signedUrl);
      });

      stream.end(fileBuffer);
    } catch (err) {
      reject(err);
    }
  });
}
