"use client";
import React, { useState, ChangeEvent } from "react";
import axios from "axios";

interface ImageFile {
  name: string;
  file: File;
}

export default function AdminPanel() {
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTitle, setDeleteTitle] = useState("");
  //const [videoId, setVideoId] = useState("");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const fileList = Array.from(e.target.files);
    const selectedImages: ImageFile[] = fileList
      .filter((file) => /\.(png|jpe?g)$/i.test(file.name))
      .filter((file) => {
        if (/\s/.test(file.name)) {
          return false;
        }
        return true;
      })
      .map((file) => ({
        name: file.name,
        file: file,
      }));

    setImages(selectedImages);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (images.length > 0) {
        const imageFormData = new FormData();
        images.forEach((image) => {
          imageFormData.append("images", image.file, image.name);
        });

        const uploadResponse = await axios.post("/api/upload", imageFormData);
        if (uploadResponse.status !== 200) {
          throw new Error("Error uploading images");
        }
      }

      let modifiedContent = "";
      images.forEach((image) => {
        modifiedContent += `<a href="/${image.name}" target="_blank"><img style="width: 100%" src="/${image.name}" alt="${image.name}" /></a>`;
      });

      //if (videoId) {
      //  modifiedContent = `<iframe  style="border: none; width: 100%; aspect-ratio: 16/9;" src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>\n${modifiedContent}`;
      //}

      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, "0");
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = currentDate.getFullYear().toString();
      const formattedDate = `${day}-${month}-${year}`;
      const baseFilename = `${day}${month}${year}`;
      const checkFilenameResponse = await axios.post("/api/check-filename", {
        filename: baseFilename,
      });
      const { newFilename } = checkFilenameResponse.data;
      const formData = new FormData();

      formData.append("filename", newFilename);
      formData.append("title", title);
      formData.append("date", formattedDate);
      formData.append("content", modifiedContent);

      await axios.post("/api/markdown", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      window.location.reload();
    }
  };

  const handleDeletePost = async () => {
    setIsLoading(true);
    try {
      await axios.request({
        url: "/api/delete-post",
        method: "DELETE",
        data: { title: deleteTitle },
      });
    } catch (error) {
      console.error("Error deleting the post:", error);
    } finally {
      window.location.reload();
    }
  };

  return (
    <div>
      <p>
        <input
          type="radio"
          value="DTR"
          checked={title === "DTR"}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />{" "}
        DTR
        <input
          type="radio"
          value="NTD"
          checked={title === "NTD"}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />{" "}
        NTD{" "}
        <input
          type="radio"
          value="NTW"
          checked={title === "NTW"}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />{" "}
        NTW{" "}
        <input
          type="radio"
          value="WTR"
          checked={title === "WTR"}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
        />{" "}
        WTR
      </p>
      <p>
        <input
          type="file"
          id="imageUpload"
          multiple
          onChange={handleImageChange}
          disabled={isLoading}
        />
      </p>
      <p>
        <button onClick={handleSave} disabled={isLoading}>
          Publish
        </button>
      </p>
      <p>
        <input
          type="text"
          placeholder="Filename to delete"
          value={deleteTitle}
          onChange={(e) => setDeleteTitle(e.target.value)}
          disabled={isLoading}
        />
        <button onClick={handleDeletePost} disabled={isLoading}>
          Delete
        </button>
      </p>
    </div>
  );
}

//<input
//type="text"
//placeholder="YouTube video ID"
//value={videoId}
//onChange={(e) => setVideoId(e.target.value)}
//disabled={isLoading}
///>
