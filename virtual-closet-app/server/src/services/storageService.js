// server/src/services/storageService.js
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
dotenv.config();

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET);

/**
 * Uploads an image buffer to Google Cloud Storage
 * @param {Buffer} fileBuffer - The uploaded file buffer
 * @param {string} originalName - Original file name
 * @returns {string} public URL of uploaded image
 */
export async function uploadImage(fileBuffer, originalName) {
  return new Promise((resolve, reject) => {
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
      // Make file public so client can display it
      await file.makePublic();
      resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`);
    });

    stream.end(fileBuffer);
  });
}
