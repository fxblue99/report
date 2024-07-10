import { promises as fs } from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    const postsDirectory = path.join(process.cwd(), "posts");
    const files = await fs.readdir(postsDirectory);

    const normalizedTitle = title.replace(/\s+/g, "-").toLowerCase();
    const fileToDelete = files.find((file) => file.includes(normalizedTitle));

    if (!fileToDelete) {
      return res.status(404).json({ error: "Post not found" });
    }

    const filePath = path.join(postsDirectory, fileToDelete);
    const fileContent = await fs.readFile(filePath, 'utf-8');

    const imageRegex = /<img\s+src="\/([^"]+)"\s+alt="[^"]*"\s*\/?>/g;
    const imagePaths = [];
    let match;
    while ((match = imageRegex.exec(fileContent)) !== null) {
      imagePaths.push(match[1]);
    }

    for (const imagePath of imagePaths) {
      const fullImagePath = path.join(process.cwd(), 'public', imagePath);
      try {
        await fs.unlink(fullImagePath);
        console.log(`Image deleted: ${fullImagePath}`);
      } catch (error) {
        console.error(`Error deleting image ${imagePath}:`, error);
      }
    }

    await fs.unlink(filePath);
    console.log(`Post deleted: ${filePath}`);

    res.status(200).json({ message: "Post and images successfully deleted" });
  } catch (error) {
    console.error("Error deleting the post:", error);
    res.status(500).json({ error: "Error deleting the post" });
  }
}
