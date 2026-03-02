import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import multer from "multer";
import OpenAI from "openai"; 
import { getJson } from "serpapi";
import fs from "fs";

// הגדרת נתיבים עבור טעינת קובץ .env בצורה תקינה
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// בדיקה בלוגים שהמפתח נטען
console.log("-----------------------------------------");
console.log("מצב טעינת מפתח OpenAI:", process.env.OPENAI_API_KEY ? "נמצא ✅" : "לא נמצא ❌");
console.log("-----------------------------------------");

const app = express();

// הגדרת CORS - מאפשר לכל דומיין (Frontend) לדבר עם השרת
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// הגדרת multer - שומר תמונות זמנית בתיקיית uploads
const upload = multer({ dest: "uploads/" });

// אתחול OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// בדיקת "דופק" לשרת
app.get("/", (req, res) => {
  res.json({ message: "SnapShop API is Online! 🚀" });
});

// נקודת הקצה המרכזית - זיהוי מוצר וחיפוש מחיר
app.post("/api/search", upload.single("image"), async (req, res) => {
  try {
    console.log("בקשה חדשה התקבלה ב-/api/search");

    if (!req.file) {
      console.log("שגיאה: לא הועלה קובץ");
      return res.status(400).json({ error: "No image uploaded" });
    }

    // 1. קריאת התמונה והמרתה ל-Base64
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // שליפת סוג התמונה (MIME Type) למשל: image/webp או image/jpeg
    const mimeType = req.file.mimetype;
    console.log(`מזהה מוצר בתמונה מסוג: ${mimeType}`);

    // 2. זיהוי התמונה עם OpenAI Vision
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Identify the product in this image. Return ONLY the brand name and the specific model. Be extremely concise." 
            },
            {
              type: "image_url",
              // התיקון הקריטי: שולח את סוג התמונה המדויק שהועלה
              image_url: { url: `data:${mimeType};base64,${base64Image}` },
            },
          ],
        },
      ],
    });

    const productName = aiResponse.choices[0].message.content || "Product";
    console.log("ה-AI זיהה:", productName);

    // 3. חיפוש ב-Google Shopping דרך SerpApi
    console.log("מחפש מחירים עבור:", productName);
    const searchResult = await getJson({
      engine: "google_shopping",
      q: productName,
      api_key: process.env.SERPAPI_KEY,
      hl: "he",
      gl: "il"
    });

    const topProduct = searchResult.shopping_results?.[0];

    // 4. שליחת התשובה הסופית
    res.json({
      name: topProduct?.title || productName,
      price: topProduct?.price || "מחיר לא זמין",
      store: topProduct?.source || "חנות כללית",
      link: topProduct?.link || `https://www.google.com/search?q=${encodeURIComponent(productName)}`
    });

    // ניקוי הקובץ הזמני
    if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
    }

  } catch (err) {
    console.error("שגיאת שרת מפורטת:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

const PORT = process.env.PORT || 8080; 
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ SnapShop Backend is live on port ${PORT}`);
});