import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { Configuration, OpenAIApi } from "openai";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup
const upload = multer({ dest: "uploads/" });

// OpenAI setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get("/", (req, res) => {
  res.json({ message: "Backend עובד 🚀" });
});

app.post("/identify-image", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "לא התקבלה תמונה" });

  try {
    // קרא את הקובץ
    const imagePath = req.file.path;

    // שלח את התמונה ל-OpenAI לזיהוי
    const response = await openai.createImageVariation(
      fs.createReadStream(imagePath),
      1,
      "512x512"
    );

    // כרגע מחזיר מידע לדוגמה עם שם התמונה
    res.json({
      product: "מוצר אמיתי לפי התמונה",
      price: "$XXX", // אפשר למלא מאוחר יותר לפי חיפוש SerpAPI
      source: "OpenAI API",
      filename: req.file.originalname,
      openaiResult: response.data,
    });
  } catch (err) {
    console.error("שגיאה בשרת:", err);
    res.status(500).json({ error: "שגיאה בשרת" });
  }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`Backend של SnapShop רץ על פורט ${PORT} 🚀`));