import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { filename, title, date, content } = req.body;

      if (!filename || !title || !date || !content) {
        return res
          .status(400)
          .json({
            message: "Filename, title, date, and content are required.",
          });
      }

      const markdownContent = `---
date: "${date}"
title: "${title.replace(/"/g, '\\"')}"
---
${content}`;

      const filePath = path.join(process.cwd(), "posts", `${filename}.md`);

      if (!fs.existsSync(path.join(process.cwd(), "posts"))) {
        fs.mkdirSync(path.join(process.cwd(), "posts"));
      }

      fs.writeFileSync(filePath, markdownContent, "utf8");
      res.status(200).json({ message: "File created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
