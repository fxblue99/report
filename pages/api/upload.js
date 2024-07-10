import { IncomingForm } from "formidable";
import { promises as fs } from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    const form = new IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'public/');
    form.keepExtensions = true;
    form.multiples = true;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing the form:", err);
        res.status(500).json({ error: err.message });
        return;
      }

      try {
        const uploadedFiles = Array.isArray(files.images)
          ? files.images
          : [files.images];

        for (const file of uploadedFiles) {
          if (/\s/.test(file.originalFilename)) {
            res.status(400).json({ error: `The filename "${file.originalFilename}" contains spaces. Filenames should not contain spaces.` });
            return;
          }
        }

        const fileMovePromises = uploadedFiles.map((file) => {
          const oldPath = file.filepath;
          const newPath = path.join(form.uploadDir, file.originalFilename);

          console.log(`Moving file from ${oldPath} to ${newPath}`);
          return fs.rename(oldPath, newPath);
        });

        await Promise.all(fileMovePromises);

        res.status(200).json({ message: "Files uploaded successfully" });
      } catch (error) {
        console.error("Error moving the files:", error);
        res.status(500).json({ error: error.message });
      }
    });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
