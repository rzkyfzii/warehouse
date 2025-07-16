import express from 'express';
import db from '../db.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { itemId, quantity, metode, sumber } = req.body;

  console.log("📤 POST /stock-out", { itemId, quantity, metode, sumber });

  const updateSql = `
    UPDATE items 
    SET stock = stock - ?, lastUpdated = NOW() 
    WHERE id = ? AND stock >= ?
  `;

  db.query(updateSql, [quantity, itemId, quantity], (err, result) => {
    if (err) {
      console.error("❌ Gagal update stok:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ success: false, message: "Stok tidak cukup atau item tidak ditemukan" });
    }

    const logSql = `
      INSERT INTO history_keluar (tanggal, kodebarang, varian, kategori, qty, metode, sumber)
      SELECT NOW(), barcode, name, category, ?, ?, ?
      FROM items WHERE id = ?
    `;

    // Perbaikan utama ada di sini:
    const metodeToUse = typeof metode === 'string' && metode.trim() !== '' ? metode : 'Upload';
    const sumberToUse = typeof sumber === 'string' && sumber.trim() !== '' ? sumber : 'Chiperlab';

    db.query(logSql, [quantity, metodeToUse, sumberToUse, itemId], (err2) => {
      if (err2) {
        console.error("❌ Gagal insert ke history_keluar:", err2);
        return res.status(500).json({ success: false, message: "Stok terupdate, tapi gagal log" });
      }

      res.json({ success: true });
    });
  });
});

export default router;
