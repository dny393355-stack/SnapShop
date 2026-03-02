import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import OpenAI from "openai"; // שיטה חדשה
import { getJson } from "serpapi";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// הגדרת OpenAI בגרסה החדשה
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({ message: "SnapShop API is Online 🚀" });
});

app.post("/api/search", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    // 1. קריאת התמונה והמרתה ל-Base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // 2. זיהוי התמונה עם OpenAI (גרסה חדשה)
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // דגם מהיר וזול יותר שתומך בראייה
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Identify this product. Respond only with the exact brand and model name." },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
    });

    const productName = aiResponse.choices[0].message.content || "Product";
    console.log("AI Identified:", productName);

    // 3. חיפוש ב-Google Shopping דרך SerpApi
    const searchResult = await getJson({
      engine: "google_shopping",
      q: productName,
      api_key: process.env.SERPAPI_KEY,
      hl: "he",
      gl: "il"
    });

    const topProduct = searchResult.shopping_results?.[0];

    // 4. שליחת התוצאה
    res.json({
      name: topProduct?.title || productName,
      price: topProduct?.price || "מחיר לא זמין",
      store: topProduct?.source || "חנות כללית",
      link: topProduct?.link || `https://www.google.com/search?q=${productName}`
    });

    // ניקוי הקובץ
    fs.unlinkSync(req.file.path);

  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Identification failed" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend live on port ${PORT}`));