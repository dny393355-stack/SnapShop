"use client"; // אם זה ב־Next.js App Router

import { useState } from "react";

export default function UploadImage() {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("בחר קובץ קודם!");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5500/identify-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error("שגיאה ב-Upload:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Upload תמונה</h2>
      <input type="file" onChange={handleChange} className="mb-2" />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        שלח
      </button>

      {response && (
        <div className="mt-4 p-2 border rounded bg-gray-100">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}