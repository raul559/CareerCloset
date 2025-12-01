import { Storage } from "@google-cloud/storage";
import path from "path";
import url from "url";
import fs from "fs";

// Resolve directory path (for ES modules)
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const credentialsPath = path.join(__dirname, "../config/gcs-credentials.json");
let storage = null;
let credentialsAvailable = false;

// Initialize storage only if credentials file exists
if (fs.existsSync(credentialsPath)) {
  try {
    storage = new Storage({
      keyFilename: credentialsPath,
    });
    credentialsAvailable = true;
    console.log("GCS Storage initialized successfully");
  } catch (err) {
    console.error("GCS Storage initialization failed:", err.message);
  }
} else {
  console.warn(`GCS credentials file not found at ${credentialsPath}`);
  console.warn("GCS features will be unavailable until credentials are added");
}

const BUCKET = "pfw-virtual-close";

// Generate a signed URL for a filename
export async function generateSignedUrl(filename) {
  if (!credentialsAvailable || !storage) {
    throw new Error(
      "GCS credentials not configured. Please add server/config/gcs-credentials.json"
    );
  }

  try {
    const options = {
      version: "v4",
      action: "read",
      expires: Date.now() + 60 * 60 * 1000, // 60 minutes
    };

    const [url] = await storage
      .bucket(BUCKET)
      .file(filename)
      .getSignedUrl(options);
    return url;
  } catch (err) {
    console.error("GCS SIGNED URL ERROR:", err);
    throw err;
  }
}
