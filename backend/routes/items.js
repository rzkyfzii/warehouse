// routes/items.js
import express from 'express';
import db from '../db.js'; // ✅ FIXED: naik 1 folder ke backend/db.js

const router = express.Router();

/*
  GET /items
  Mengambil semua item dari database
*/
router.get('/', (req, res) => {
  db.query('SELECT * FROM items', (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/*
  POST /items
  Menambahkan item baru ke database
*/
router.post('/', (req, res) => {
  const item = {
    ...req.body,
    price: Number(req.body.price) || 0 // ⬅️ pastikan price angka
  };
  
  console.log("📥 Item diterima:", item);

  const sql = `
    INSERT INTO items (name, barcode, category, stock, price, minStock)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
  item.name,
  item.barcode,
  item.category,
  Number(item.stock),
  Number(item.price), 
  Number(item.minStock)
  ], (err, result) => {
    if (err) {
      console.error("❌ Gagal insert item:", err);
      return res.status(500).json({ success: false, message: "Gagal menambahkan item", error: err });
    }
    res.json({ success: true, id: result.insertId });
  });
});

/*
  PUT /items/:id
  Mengupdate stok item berdasarkan ID
*/
router.put('/:id', (req, res) => {
  console.log("➡️ PUT /items/:id dipanggil");
  const id = req.params.id;
  const { stock, price } = req.body;

  const sql = `
    UPDATE items 
    SET stock = ?, price = ?, lastUpdated = NOW()
    WHERE id = ?
  `;

  db.query(sql, [stock, price, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "ID tidak ditemukan" });
    }
    res.json({ success: true });
  });
});


/*
  DELETE /items/:id
  Menghapus item berdasarkan ID
*/
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM items WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

/*
  POST /items/out
  Mengurangi stok & mencatat ke history_keluar
*/
router.post('/out', (req, res) => {
  const { barcode, qty, metode, sumber } = req.body;
  const tanggal = new Date();

  // Ambil info varian dan kategori dari item
  const selectSql = 'SELECT category AS kategori, name AS varian FROM items WHERE barcode = ?';
  db.query(selectSql, [barcode], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Item tidak ditemukan' });

    const { kategori, varian } = rows[0];

    // Kurangi stok
    const updateSql = 'UPDATE items SET stock = stock - ? WHERE barcode = ?';
    db.query(updateSql, [qty, barcode], (err2) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });

      // Catat ke history_keluar
      const insertSql = `
        INSERT INTO history_keluar (tanggal, kodebarang, varian, kategori, qty, metode, sumber)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(insertSql, [tanggal, barcode, varian, kategori, qty, metode, sumber], (err3) => {
        if (err3) return res.status(500).json({ success: false, error: err3.message });
        res.json({ success: true, message: 'Stok keluar dicatat' });
      });
    });
  });
});


export default router;
