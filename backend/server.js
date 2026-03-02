import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { Configuration, OpenAIApi } from "openai";
import fs from "fs"; // הוספתי את זה - זה היה חסר!

dotenv.config();

const app = express();

// הגדרת CORS שתאפשר לכל אחד לדבר עם השרת
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.get("/", (req, res) => {
  res.json({ message: "Backend עובד 🚀" });
});

// שיניתי ל- /api/search שיתאים למה שכתבנו ב-Frontend
app.post("/api/search", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "לא התקבלה תמונה" });

    // כאן בהמשך נוסיף את החיפוש האמיתי בגוגל
    // כרגע השרת יחזיר תשובה חיובית כדי לבדוק שהקשר עובד
    res.json({
      name: "מוצר מזוהה (בבדיקה)",
      price: "בבדיקה...",
      store: "SnapShop AI",
      link: "https://google.com"
    });

    // מחיקת הקובץ הזמני מהשרת כדי לא למלא את הזיכרון
    fs.unlinkSync(req.file.path);

  } catch (err) {
    console.error("שגיאה בשרת:", err);
    res.status(500).json({ error: "שגיאה בתהליך הזיהוי" });
  }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend רץ על פורט ${PORT} 🚀`));