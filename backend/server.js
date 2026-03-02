import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import OpenAI from "openai"; 
import { getJson } from "serpapi";
import fs from "fs";

dotenv.config();

const app = express();

// הגדרת CORS מורחבת כדי למנוע חסימות דפדפן
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const upload = multer({ dest: "uploads/" });

// הגדרת OpenAI בגרסה החדשה (v4+)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// בדיקת תקינות בסיסית - לוודא שהשרת חי
app.get("/", (req, res) => {
  res.json({ message: "SnapShop API is Online and CORS is open! 🚀" });
});

app.post("/api/search", upload.single("image"), async (req, res) => {
  try {
    console.log("Request received at /api/search");

    if (!req.file) {
      console.log("No file received");
      return res.status(400).json({ error: "No image uploaded" });
    }

    // 1. קריאת התמונה והמרתה ל-Base64 עבור OpenAI
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    console.log("Identifying product with AI...");

    // 2. זיהוי התמונה עם דגם Vision (משתמש ב-gpt-4o-mini שזה זול ומהיר)
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Identify this product exactly. Return only the brand and model name." },
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
    console.log("Searching for prices with SerpApi...");
    const searchResult = await getJson({
      engine: "google_shopping",
      q: productName,
      api_key: process.env.SERPAPI_KEY,
      hl: "he",
      gl: "il"
    });

    const topProduct = searchResult.shopping_results?.[0];

    // 4. שליחת התוצאה הסופית ל-Frontend
    res.json({
      name: topProduct?.title || productName,
      price: topProduct?.price || "מחיר לא זמין",
      store: topProduct?.source || "חנות כללית",
      link: topProduct?.link || `https://www.google.com/search?q=${productName}`
    });

    // ניקוי הקובץ הזמני מהשרת
    fs.unlinkSync(req.file.path);

  } catch (err) {
    console.error("Server Error Detailed:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

// שימוש בפורט של Railway או 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend is live on port ${PORT} - Listening to all hosts (0.0.0.0)`);
});