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
  const [loading, setLoading] = useState(false);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setLoading(true);
    setProduct(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      // שימוש בכתובת הציבורית של ה-Backend שלך
      const response = await fetch("https://innovative-dream-production-b053.up.railway.app/api/search", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error("Error:", error);
      alert("משהו השתבש בחיפוש המוצר. וודא שה-Backend רץ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-4 text-white overflow-hidden">
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full">
        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter italic">
          SnapShop <span className="text-pink-400">✨</span>
        </h1>
        <p className="text-lg md:text-xl mb-12 opacity-80 font-medium">
          צלם – גלה מחירים – קנה מיד
        </p>

        <label className="relative cursor-pointer group">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapture}
            className="sr-only"
          />
          <div className="px-10 py-5 bg-white text-indigo-900 font-black text-xl rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95">
            {loading ? "סורק מוצר... 🔍" : "צלם מוצר עכשיו"}
          </div>
        </label>

        {image && (
          <div className="mt-12 flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <img
              src={image}
              alt="Product"
              className="w-48 h-48 object-cover rounded-3xl shadow-2xl border-4 border-white/20 mb-8"
            />
          </div>
        )}

        {product && (
          <div className="bg-white text-black rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in slide-in-from-bottom duration-500">
            <h3 className="text-2xl font-black mb-2 text-indigo-900">{product.name}</h3>
            <div className="space-y-1 mb-6 text-gray-600 font-bold">
              <p>💰 מחיר: {product.price}</p>
              <p>🏪 חנות: {product.store}</p>
            </div>
            <a
              href={product.link}
              target="_blank"
              className="block w-full text-center py-4 bg-pink-500 text-white rounded-2xl font-black text-lg hover:bg-pink-600 transition-colors shadow-lg"
            >
              לקנייה עכשיו
            </a>
          </div>
        )}
      </div>
    </div>
  );
}