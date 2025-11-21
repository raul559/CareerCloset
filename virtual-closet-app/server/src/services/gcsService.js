import { Storage } from "@google-cloud/storage";
import path from "path";

// Configure GCS bucket name and credentials
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || "pfw-virtual-close";
const storage = new Storage({
  keyFilename: process.env.GCS_CREDENTIALS || path.resolve("gcs-credentials.json"),
});
const bucket = storage.bucket(BUCKET_NAME);

/**
 * Generate a signed URL for a given file in the bucket
 * @param {string} filePath - The path to the file in the bucket
 * @param {number} expiresInSeconds - How long the URL should be valid (default: 1 hour)
 * @returns {Promise<string>} - The signed URL
 */
export async function getSignedUrl(filePath, expiresInSeconds = 3600) {
  if (!filePath) return null;
  const [url] = await bucket.file(filePath).getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInSeconds * 1000,
  });
  return url;
}
