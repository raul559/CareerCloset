// test-gcs.js
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
dotenv.config();

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucketName = process.env.GCS_BUCKET;

async function testConnection() {
  try {
    const [files] = await storage.bucket(bucketName).getFiles({ maxResults: 5 });

    console.log(`✅ Successfully connected to bucket: ${bucketName}`);

    if (!files || files.length === 0) {
      console.log("The bucket is empty (no files yet).");
    } else {
      console.log("Files found:");
      files.forEach((file) => console.log(` - ${file.name}`));
    }
  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err.message);
  }
}

testConnection();
