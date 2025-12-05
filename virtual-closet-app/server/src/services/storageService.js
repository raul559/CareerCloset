
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
dotenv.config();

// When running tests, avoid initializing GCS client or calling bucket()
// which will throw if environment variables are not present in CI.
let uploadImage;
if (process.env.NODE_ENV === "test") {
  // Safe stub for tests: return null (no URL) and avoid external calls
  uploadImage = async function /* uploadImage */ () {
    return null;
  };
} else {
  // Initialize storage based on environment
  const storage = process.env.NODE_ENV === 'production'
    ? new Storage({ projectId: process.env.GCS_PROJECT_ID || 'virtualcloset-477422' })
    : new Storage({ keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS });

  const BUCKET_NAME = process.env.GCS_BUCKET_NAME || process.env.GCS_BUCKET || 'pfw-virtual-close';
  const bucket = storage.bucket(BUCKET_NAME);

  console.log(`📦 Storage Service initialized with bucket: ${BUCKET_NAME}`);

  uploadImage = async function (fileBuffer, originalName) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!bucket) return reject(new Error("GCS bucket not configured"));

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
          const [signedUrl] = await file.getSignedUrl({
            action: "read",
            expires: "03-17-2050",
          });

          resolve(signedUrl);
        });

        stream.end(fileBuffer);
      } catch (err) {
        reject(err);
      }
    });
  };
}

export { uploadImage };
