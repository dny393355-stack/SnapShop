import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { Configuration, OpenAIApi } from "openai";
import fs from "fs";

dotenv.config();

const app = express();

// הגדרת CORS - חשוב מאוד כדי שה-Frontend יוכל לדבר עם השרת
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

// הנתיב שמתאים ל-Frontend
app.post("/api/search", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "לא התקבלה תמונה" });

    // כאן השרת מחזיר תשובה זמנית כדי לבדוק שהקשר עובד
    // בקרוב נחליף את זה בחיפוש אמיתי בגוגל
    res.json({
      name: "מוצר מזוהה (בבדיקת חיבור)",
      price: "199 ש''ח",
      store: "SnapShop AI Store",
      link: "https://www.google.com"
    });

    // מחיקת הקובץ הזמני
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

  } catch (err) {
    console.error("שגיאה בשרת:", err);
    res.status(500).json({ error: "שגיאה בתהליך הזיהוי" });
  }
});

// שימוש בפורט ש-Railway נותן או 8080 כברירת מחדל
const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => console.log(`Backend רץ על פורט ${PORT} 🚀`));