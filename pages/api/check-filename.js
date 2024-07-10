import { promises as fs } from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { filename } = req.body;
      const uploadDir = path.join(process.cwd(), 'posts');
      
      await fs.mkdir(uploadDir, { recursive: true });

      const files = await fs.readdir(uploadDir);
      let count = 1;
      let newFilename = `${filename}${count}`;

      const matchingFiles = files.filter(file => file.startsWith(filename));

      if (matchingFiles.length > 0) {
        while (matchingFiles.some(file => file.startsWith(newFilename))) {
          count += 1;
          newFilename = `${filename}${count}`;
        }
      } else {
        newFilename = `${filename}1`;
      }

      res.status(200).json({ newFilename });
    } catch (error) {
      console.error('Error checking the filename:', error);
      res.status(500).json({ error: 'Error checking the filename' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
