import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
dotenv.config();

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCS_BUCKET);

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
