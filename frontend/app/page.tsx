"use client";

import { useState } from "react";

interface ProductInfo {
  name: string;
  price: string;
  store: string;
  link: string;
}

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const [loading, setLoading] = useState(false); // הוספתי מצב טעינה

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setLoading(true); // מתחילים לחפש...
    setProduct(null);

    // יצירת פורמט לשליחת קובץ
    const formData = new FormData();
    formData.append("image", file);

    try {
      // כאן אנחנו פונים לכתובת ה-Backend שלך ב-Railway
      const response = await fetch("https://innovative-dream-production-b053.up.railway.app/api/search", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setProduct(data); // מעדכנים את המוצר האמיתי שחזר מה-AI
    } catch (error) {
      console.error("Error:", error);
      alert("משהו השתבש בחיפוש המוצר. וודא שה-Backend רץ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex flex-col items-center justify-center overflow-hidden p-4 text-white">
      
      {/* רקע בועות */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-white/20 rounded-full animate-floatY -top-24 -left-24"></div>
        <div className="absolute w-80 h-80 bg-white/15 rounded-full animate-floatY -bottom-16 -right-20"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent drop-shadow-md mb-4">
          SnapShop ✨
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          צלם מוצר – גלה מחירים וחנויות בזמן אמת
        </p>

        <label className="relative cursor-pointer inline-block mb-8">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapture}
            className="sr-only"
          />
          <span className="inline-block px-12 py-5 bg-gradient-to-r from-secondary to-highlight font-bold text-lg rounded-full shadow-2xl transition-transform hover:scale-105">
            {loading ? "מחפש מוצרים... 🔍" : "צלם או העלה תמונה"}
          </span>
        </label>

        {image && (
          <div className="flex flex-col items-center">
            <img
              src={image}
              alt="Captured"
              className="w-64 h-64 object-cover rounded-xl shadow-2xl border-4 border-white/30 mb-6"
            />
          </div>
        )}

        {product && (
          <div className="bg-white rounded-xl shadow-2xl p-6 w-80 text-left text-gray-900 animate-fadeIn">
            <h3 className="text-2xl font-bold text-primary mb-2">{product.name}</h3>
            <p className="text-lg mb-1">מחיר: {product.price}</p>
            <p className="text-lg mb-3">חנות: {product.store}</p>
            <a
              href={product.link}
              target="_blank"
              className="inline-block w-full text-center py-2 bg-accent text-white rounded-lg font-semibold hover:bg-secondary transition-colors"
            >
              לקנייה עכשיו
            </a>
          </div>
        )}
      </div>
    </div>
  );
}