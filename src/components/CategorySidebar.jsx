import React from "react";
import { motion } from "framer-motion";
import { variantCategoryMap } from "@/data/variantCategoryMap";

const CategorySidebar = ({ items = [], selectedCategory, onSelectCategory }) => {
  // Hitung jumlah item per kategori
  const categoryCount = items.reduce((acc, item) => {
    const variantData = variantCategoryMap[item.code] || {};
    const category = variantData.category || item.category || "Tidak Ada Kategori";

    if (!acc[category]) acc[category] = 0;
    acc[category] += 1;

    return acc;
  }, {});

  // Ambil daftar kategori unik
  const categories = Object.keys(categoryCount);

  const getCategoryIcon = (category) => {
    const iconMap = {
      "Parfum - Eksklusif": "💎",
      "Parfum - Classic": "🌹",
      "Parfum - Sanju": "🌸",
      "Parfum - Balinese": "🌺",
      "Parfum - Ocassion": "💫",
      "Body Spray - Aerosols": "💨",
      "Home Care - Diffuser": "🏠",
      "Hair Care": "💇",
      "Vial 3ml Classic": "🧪",
      "Vial 3ml Eksklusif": "🔮",
      "Vial 2ml": "🥼",
      "Roll On 10ml": "🧴",
    };
    return iconMap[category] || "📦";
  };

  return (
    <div className="bg-purple-600/30 p-4 rounded-lg">
      <h3 className="text-white font-semibold mb-4">Kategori</h3>

      <motion.ul layout>
        {/* Semua */}
        <li
          className={`flex justify-between items-center p-2 mb-2 rounded cursor-pointer ${
            selectedCategory === "all"
              ? "bg-purple-700"
              : "hover:bg-purple-500/50"
          }`}
          onClick={() => onSelectCategory("all")}
        >
          <span>📦 Semua</span>
          <span>{items.length}</span>
        </li>

        {/* Per kategori */}
        {categories.map((cat) => (
          <li
            key={cat}
            className={`flex justify-between items-center p-2 mb-2 rounded cursor-pointer ${
              selectedCategory === cat
                ? "bg-purple-700"
                : "hover:bg-purple-500/50"
            }`}
            onClick={() => onSelectCategory(cat)}
          >
            <span>
              {getCategoryIcon(cat)} {cat}
            </span>
            <span>{categoryCount[cat]}</span>
          </li>
        ))}
      </motion.ul>
    </div>
  );
};

export default CategorySidebar;
