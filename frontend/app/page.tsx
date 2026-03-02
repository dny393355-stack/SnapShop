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

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setTimeout(() => {
      setProduct({
        name: "Luxury Product",
        price: "$299",
        store: "Premium Store",
        link: "https://example.com/product",
      });
    }, 1000);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-primary via-secondary to-accent flex flex-col items-center justify-center overflow-hidden p-4">
      
      {/* רקע בועות */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-white/20 rounded-full animate-floatY -top-24 -left-24"></div>
        <div className="absolute w-80 h-80 bg-white/15 rounded-full animate-floatY -bottom-16 -right-20"></div>
        <div className="absolute w-72 h-72 bg-white/10 rounded-full animate-floatY -top-10 right-10"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <h1 className="text-7xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent drop-shadow-md animate-fadeIn mb-4">
          SnapShop ✨
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fadeIn">
          צלם מוצר או העלה תמונה – גלה פרטי מוצר ומחירים ברמה פסיכית וצעירה
        </p>

        <label className="relative cursor-pointer inline-block group mb-8">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapture}
            className="sr-only"
          />
          <span className="inline-block px-12 py-5 bg-gradient-to-r from-secondary via-accent to-highlight text-white font-bold text-lg rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 animate-shimmer">
            העלה תמונה עכשיו
          </span>
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-accent rounded-full transition-all duration-300 group-hover:w-1/2"></span>
        </label>

        {image && (
          <div className="flex flex-col items-center animate-fadeIn">
            <h2 className="text-3xl font-semibold text-white mb-4 drop-shadow-md">
              התמונה שלך:
            </h2>
            <img
              src={image}
              alt="Captured"
              className="w-80 h-80 object-contain rounded-xl shadow-2xl border-4 border-white/30 mb-6"
            />
          </div>
        )}

        {product && (
          <div className="bg-white/90 rounded-xl shadow-2xl p-6 w-80 text-left animate-fadeIn">
            <h3 className="text-2xl font-bold text-primary mb-2">{product.name}</h3>
            <p className="text-lg text-gray-700 mb-1">Price: {product.price}</p>
            <p className="text-lg text-gray-700 mb-3">Store: {product.store}</p>
            <a
              href={product.link}
              target="_blank"
              className="text-accent font-semibold hover:underline"
            >
              Go to product
            </a>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/30 via-transparent animate-fadeIn"></div>
    </div>
  );
}