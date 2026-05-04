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

// Initialize storage based on environment
if (process.env.NODE_ENV === 'production') {
  // Production: Use Application Default Credentials (Cloud Run IAM)
  try {
    storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID
    });
    credentialsAvailable = true;
    console.log('✅ GCS Storage initialized with Application Default Credentials (production)');
    console.log(`   Project ID: ${process.env.GCS_PROJECT_ID}`);
    console.log(`   Bucket: ${process.env.GCS_BUCKET_NAME || 'pfw-virtual-closet'}`);
  } catch (err) {
    console.error('❌ GCS Storage initialization failed in production:', err.message);
    credentialsAvailable = false;
  }
} else {
  // Development: Use credential files
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      try {
        storage = new Storage({ keyFilename: testPath });
        credentialsAvailable = true;
        credentialsPath = testPath;
        console.log(`✅ GCS Storage initialized successfully with ${testPath}`);
        break;
      } catch (err) {
        console.error(`❌ GCS Storage initialization failed for ${testPath}:`, err.message);
      }
    }
  }

  if (!credentialsAvailable) {
    console.warn("⚠️  GCS credentials file not found in any expected location");
    console.warn("    GCS features will be unavailable until credentials are added");
    console.warn("    Expected paths:", possiblePaths.join(", "));
  }
}

const BUCKET_NAME = process.env.GCS_BUCKET_NAME || "pfw-virtual-close";
const urlCache = new Map();
const CACHE_BUFFER_MS = 3600000; // Refresh 1 hour before expiry

/**
 * Generate a signed URL for a given file in the bucket with caching
 * @param {string} filePath - The path/filename of the file in the bucket
 * @param {number} expiresInSeconds - How long the URL should be valid (default: 1 hour)
 * @returns {Promise<string>} - The signed URL
 */
export async function getSignedUrl(filePath, expiresInSeconds = 3600) {
  if (!filePath) return null;
  
  if (!storage) {
    const errorMsg = process.env.NODE_ENV === 'production' 
      ? "GCS Storage not initialized. Check Cloud Run service account permissions." 
      : "GCS credentials not configured. Please add gcs-credentials.json to server root or set GOOGLE_APPLICATION_CREDENTIALS env var";
    throw new Error(errorMsg);
  }

  // Normalize file path formats:
  // 1. gs://bucket/path -> path
  // 2. Relative paths like "Thumbnails-webp/IMG_6710.webp" -> as-is
  let cleanPath = filePath;
  if (filePath.startsWith('gs://')) {
    const parts = filePath.slice(5).split('/');
    cleanPath = parts.slice(1).join('/'); // Remove bucket name, keep path
  }
  // If it's a relative path like "Thumbnails-webp/IMG_6710.webp", use as-is
  // It's already in the format GCS expects

  // Check cache first
  const cached = urlCache.get(filePath);
  const now = Date.now();
  
  if (cached && cached.expiresAt > now + CACHE_BUFFER_MS) {
    // Return cached URL if it's still valid (with buffer time)
    return cached.url;
  }

  try {
    const expiresAt = now + expiresInSeconds * 1000;
    const [url] = await storage
      .bucket(BUCKET_NAME)
      .file(cleanPath)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: expiresAt,
      });
    
    // Cache the signed URL
    urlCache.set(filePath, { url, expiresAt });
    
    return url;
  } catch (err) {
    console.error(`❌ GCS SIGNED URL ERROR for ${filePath}:`, err.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('   Hint: Check that Cloud Run service account has Storage Object Viewer role');
    }
    throw err;
  }
}

// Alias for compatibility
export const generateSignedUrl = getSignedUrl;

/**
 * Delete a file from the configured bucket
 * @param {string} filePath - path of the file in the bucket
 * @returns {Promise<boolean>} - true if deleted
 */
export async function deleteFile(filePath) {
  if (!filePath) return false;

  if (!storage) {
    const errorMsg = process.env.NODE_ENV === 'production'
      ? "GCS Storage not initialized. Check Cloud Run service account permissions."
      : "GCS credentials not configured. Cannot delete file without credentials.";
    throw new Error(errorMsg);
  }

  try {
    await storage.bucket(BUCKET_NAME).file(filePath).delete();
    return true;
  } catch (err) {
    // If file not found, treat as success for idempotency
    if (err && err.code === 404) {
      return true;
    }
    console.error(`❌ GCS DELETE ERROR for ${filePath}:`, err.message);
    throw err;
  }
}
