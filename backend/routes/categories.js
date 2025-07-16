import express from "express";
import db from "../db.js";

const router = express.Router();

// GET semua kategori
router.get("/", (req, res) => {
  db.query("SELECT * FROM categories", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// POST kategori baru
router.post("/", (req, res) => {
  console.log("📩 POST /categories - Body Diterima:", req.body);

  const { value, label, icon } = req.body;

  db.query(
    "INSERT INTO categories (value, label, icon) VALUES (?, ?, ?)",
    [value, label, icon || "📦"],
    (err, result) => {
      if (err) {
        console.error("❌ Gagal insert ke database:", err);
        return res.status(500).json(err);
      }
      console.log("✅ Berhasil insert kategori:", result);
      res.json({ id: result.insertId });
    }
  );
});

// ✅ DELETE kategori berdasarkan ID
router.delete("/:id", (req, res) => {
  const categoryId = req.params.id;

  db.query("DELETE FROM categories WHERE id = ?", [categoryId], (err, result) => {
    if (err) {
      console.error("❌ Gagal hapus kategori:", err);
      return res.status(500).json({ success: false, message: "Gagal menghapus kategori" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    }

    res.json({ success: true, message: "Kategori berhasil dihapus" });
  });
});

export default router;
