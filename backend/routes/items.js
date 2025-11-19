import express from "express";
import initDB from "../db.js";

const router = express.Router();

/* =====================================================
   CREATE ITEM
===================================================== */
router.post("/", async (req, res) => {
  try {
    const item = {
      ...req.body,
      price: Number(req.body.price) || 0,
      photo: req.body.photo || null,
    };

    console.log("📥 Input item baru:", item);

    const sql = `
      INSERT INTO items (name, barcode, category, stock, price, minStock, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const db = await initDB();
    const [result] = await db.query(sql, [
      item.name,
      item.barcode,
      item.category,
      Number(item.stock),
      Number(item.price),
      Number(item.minStock),
      item.photo,
    ]);

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ Error tambah item:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

/* =====================================================
   GET ALL ITEMS
===================================================== */
router.get("/", async (req, res) => {
  try {
    const db = await initDB();
    const [rows] = await db.query("SELECT * FROM items ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error ambil items:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

/* =====================================================
   UPDATE ITEM
===================================================== */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, barcode, category, stock, minStock, price } = req.body;

    const db = await initDB();
    const [result] = await db.query(
      "UPDATE items SET name=?, barcode=?, category=?, stock=?, minStock=?, price=? WHERE id=?",
      [name, barcode, category, stock, minStock, price, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    res.json({ message: "Item berhasil diperbarui" });
  } catch (err) {
    console.error("❌ Error update item:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

/* =====================================================
   DELETE ITEM
===================================================== */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const db = await initDB();

    const [result] = await db.query("DELETE FROM items WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }

    res.json({ message: "Item berhasil dihapus" });
  } catch (err) {
    console.error("❌ Error hapus item:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

/* =====================================================
   MANUAL STOCK IN
===================================================== */
router.post("/in/manual", async (req, res) => {
  console.log("📥 INPUT MANUAL:", req.body);

  const { category, variant, qty, quantity, price } = req.body;

  const finalQty = Number(qty ?? quantity);

  if (!finalQty || isNaN(finalQty) || finalQty <= 0) {
    return res.status(400).json({ message: "Quantity tidak valid" });
  }

  if (!category || !variant) {
    return res.status(400).json({ message: "Kategori & Varian wajib diisi" });
  }

  try {
    const db = await initDB();

    // 🔥 Cari berdasarkan nama kategori, bukan category_id
    const [rows] = await db.query(
      "SELECT * FROM items WHERE category=? AND name=? LIMIT 1",
      [category, variant]
    );

    let item;

    if (rows.length === 0) {
      // Jika belum ada → buat baru
      const [result] = await db.query(
        "INSERT INTO items (name, category, stock, price) VALUES (?, ?, ?, ?)",
        [variant, category, 0, price]
      );

      item = { id: result.insertId, name: variant, category, stock: 0, price };
    } else {
      item = rows[0];
    }

    // Update stock
    await db.query("UPDATE items SET stock = stock + ? WHERE id = ?", [
      finalQty,
      item.id,
    ]);

    res.json({
      message: "Stok berhasil ditambahkan",
      item: { ...item, stock: item.stock + finalQty },
    });
  } catch (err) {
    console.error("❌ Error manual stock-in:", err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

export default router;
