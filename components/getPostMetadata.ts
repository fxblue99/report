import fs from "fs";
import matter from "gray-matter";
import { PostMetadata } from "./PostMetadata";

const getPostMetadata = (): PostMetadata[] => {
  const folder = "posts/";
  const files = fs.readdirSync(folder);
  const markdownPosts = files.filter((file) => file.endsWith(".md"));

  const posts = markdownPosts.map((fileName) => {
    const fileContents = fs.readFileSync(`posts/${fileName}`, "utf8");
    const matterResult = matter(fileContents);
    return {
      date: matterResult.data.date,
      title: matterResult.data.title,
      slug: fileName.replace(".md", ""),
    };
  });

  posts.sort((a, b) => {
    const [aDay, aMonth, aYear] = a.date.split("-");
    const [bDay, bMonth, bYear] = b.date.split("-");

    const aDate = new Date(`${aYear} ${aMonth} ${aDay}`);
    const bDate = new Date(`${bYear} ${bMonth} ${bDay}`);

    if (aDate.getTime() === bDate.getTime()) {
      const aMatch = a.slug.match(/(\d+)$/);
      const bMatch = b.slug.match(/(\d+)$/);
      const aSuffix = aMatch ? parseInt(aMatch[0], 10) : 0;
      const bSuffix = bMatch ? parseInt(bMatch[0], 10) : 0;
      return bSuffix - aSuffix;
    }

    return bDate.getTime() - aDate.getTime();
  });

  return posts;
};

export default getPostMetadata;
