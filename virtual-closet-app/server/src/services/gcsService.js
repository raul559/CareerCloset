import { Storage } from "@google-cloud/storage";
import path from "path";
import url from "url";

// Resolve directory path (for ES modules)
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = new Storage({
  keyFilename: path.join(__dirname, "../config/gcs-credentials.json"),
});

const BUCKET = "pfw-virtual-close";

// Generate a signed URL for a filename
export async function generateSignedUrl(filename) {
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
