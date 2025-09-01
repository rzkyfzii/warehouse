import express from 'express';
import initDB from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { itemId, varian, category, quantity, metode, sumber } = req.body;
  console.log("📥 POST /stock-in", { itemId, varian, category, quantity, metode, sumber });

  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    return res.status(400).json({ success: false, message: "Quantity harus lebih besar dari 0" });
  }

  try {
    const db = await initDB(); // ✅ gunakan koneksi DB

    // Cari item
    let findSql, findParams;
    if (itemId) {
      findSql = 'SELECT * FROM items WHERE id = ?';
      findParams = [itemId];
    } else if (varian) {
      if (category) {
        findSql = 'SELECT * FROM items WHERE category = ? AND name LIKE ? LIMIT 1';
        findParams = [category, `%${varian}%`];
      } else {
        findSql = 'SELECT * FROM items WHERE name LIKE ? LIMIT 1';
        findParams = [`%${varian}%`];
      }
    } else {
      return res.status(400).json({ success: false, message: "Harus ada itemId atau varian" });
    }

    const [items] = await db.query(findSql, findParams);

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: "Item tidak ditemukan" });
    }

    const item = items[0];
    console.log("🔍 Item ditemukan:", item);

    // Update stok
    const updateSql = `
      UPDATE items 
      SET stock = stock + ?, lastUpdated = NOW() 
      WHERE id = ?
    `;
    const [updateResult] = await db.query(updateSql, [qty, item.id]);

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ success: false, message: "Item tidak ditemukan saat update" });
    }

    // Catat history
    const logSql = `
      INSERT INTO history_masuk (tanggal, kodebarang, varian, kategori, qty, metode, sumber)
      SELECT NOW(), barcode, name, category, ?, ?, ?
      FROM items WHERE id = ?
    `;

    const metodeToUse = metode?.trim() || 'Manual';
    const sumberToUse = sumber?.trim() || '-';

    await db.query(logSql, [qty, metodeToUse, sumberToUse, item.id]);

    console.log("✅ Log berhasil ditambahkan ke history_masuk");
    res.json({ success: true, newStock: item.stock + qty });

  } catch (err) {
    console.error("❌ Gagal proses stok masuk:", err.message || err);
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat proses stok masuk" });
  }
});

export default router;
