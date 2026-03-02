import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { Configuration, OpenAIApi } from "openai";
import { getJson } from "serpapi";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// הגדרת OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get("/", (req, res) => {
  res.json({ message: "SnapShop API is Running 🚀" });
});

app.post("/api/search", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "לא התקבלה תמונה" });

    // 1. זיהוי התמונה בעזרת OpenAI Vision
    // הערה: בגרסאות חדשות משתמשים ב-chat.completions. אנחנו נתמקד בזיהוי טקסטואלי מהיר
    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    // כאן אנחנו מבקשים מה-AI לזהות את המוצר
    const aiResponse = await openai.createChatCompletion({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What is this product? Give me only the brand and model name in 5 words max." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ],
        },
      ],
      max_tokens: 50,
    });

    const productName = aiResponse.data.choices[0].message.content || "Product";

    // 2. חיפוש המוצר ב-Google Shopping דרך SerpApi
    const searchResult = await getJson({
      engine: "google_shopping",
      q: productName,
      api_key: process.env.SERPAPI_KEY,
      hl: "he",
      gl: "il" // חיפוש בישראל
    });

    const topProduct = searchResult.shopping_results?.[0];

    // 3. החזרת התוצאה ל-Frontend
    res.json({
      name: topProduct?.title || productName,
      price: topProduct?.price || "לא נמצא מחיר",
      store: topProduct?.source || "חנות לא ידועה",
      link: topProduct?.link || `https://www.google.com/search?q=${productName}`
    });

    // מחיקת הקובץ הזמני
    fs.unlinkSync(req.file.path);

  } catch (err) {
    console.error("Error details:", err.response?.data || err.message);
    res.status(500).json({ error: "תהליך הזיהוי נכשל" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend רץ על פורט ${PORT}`));