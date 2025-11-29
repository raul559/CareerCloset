// upload-test.js
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
import path from "path";
dotenv.config();

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucketName = process.env.GCS_BUCKET;

// Change this to the test file you want to upload
const localFilePath = path.resolve("./test-upload.jpg");

// Where it will appear in your bucket
const destination = `uploads/test-upload.jpg`;

async function uploadFile() {
  try {
    await storage.bucket(bucketName).upload(localFilePath, {
      destination,
      metadata: {
        cacheControl: "public,max-age=31536000",
      },
    });

    console.log(`✅ Uploaded file → gs://${bucketName}/${destination}`);
  } catch (err) {
    console.error("❌ Upload failed:");
    console.error(err.message);
  }
}

uploadFile();
