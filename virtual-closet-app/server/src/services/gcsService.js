import { Storage } from "@google-cloud/storage";
import path from "path";
import url from "url";
import fs from "fs";

// Resolve directory path (for ES modules)
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple possible credential paths
const possiblePaths = [
  path.join(__dirname, "../config/gcs-credentials.json"),
  path.join(__dirname, "../../gcs-credentials.json"),
  path.resolve("gcs-credentials.json"),
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  process.env.GCS_CREDENTIALS,
].filter(Boolean);

let storage = null;
let credentialsAvailable = false;
let credentialsPath = null;

// Find and initialize storage with first available credentials file
for (const testPath of possiblePaths) {
  if (fs.existsSync(testPath)) {
    try {
      storage = new Storage({ keyFilename: testPath });
      credentialsAvailable = true;
      credentialsPath = testPath;
      console.log(`GCS Storage initialized successfully with ${testPath}`);
      break;
    } catch (err) {
      console.error(`GCS Storage initialization failed for ${testPath}:`, err.message);
    }
  }
}

if (!credentialsAvailable) {
  console.warn("GCS credentials file not found in any expected location");
  console.warn("GCS features will be unavailable until credentials are added");
  console.warn("Expected paths:", possiblePaths.join(", "));
}

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || "pfw-virtual-close";

/**
 * Generate a signed URL for a given file in the bucket
 * @param {string} filePath - The path/filename of the file in the bucket
 * @param {number} expiresInSeconds - How long the URL should be valid (default: 1 hour)
 * @returns {Promise<string>} - The signed URL
 */
export async function getSignedUrl(filePath, expiresInSeconds = 3600) {
  if (!filePath) return null;
  
  if (!credentialsAvailable || !storage) {
    throw new Error(
      "GCS credentials not configured. Please add gcs-credentials.json to server root or set GCS_CREDENTIALS env var"
    );
  }

  try {
    const [url] = await storage
      .bucket(BUCKET_NAME)
      .file(filePath)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + expiresInSeconds * 1000,
      });
    return url;
  } catch (err) {
    console.error("GCS SIGNED URL ERROR:", err);
    throw err;
  }
}

// Alias for compatibility
export const generateSignedUrl = getSignedUrl;
