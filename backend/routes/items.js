import express from 'express';
import initDB from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const item = {
    ...req.body,
    price: Number(req.body.price) || 0,
    photo: req.body.photo || null,   // ✅ tambahkan photo
  };

  console.log("📥 Item diterima:", item);

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
});

// Ambil semua item
router.get('/', async (req, res) => {
  try {
    const db = await initDB();
    const [rows] = await db.query('SELECT * FROM items ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error saat mengambil items:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Tambah item baru
router.post('/', async (req, res) => {
  const { name, barcode, category, stock, minStock, price } = req.body;
  try {
    const db = await initDB();
    const [result] = await db.query(
      'INSERT INTO items (name, barcode, category, stock, minStock, price) VALUES (?, ?, ?, ?, ?, ?)',
      [name, barcode, category, stock, minStock, price]
    );
    res.json({ id: result.insertId, message: 'Item berhasil ditambahkan' });
  } catch (err) {
    console.error('Error saat menambah item:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Update item berdasarkan ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, barcode, category, stock, minStock, price } = req.body;
  try {
    const db = await initDB();
    const [result] = await db.query(
      'UPDATE items SET name=?, barcode=?, category=?, stock=?, minStock=?, price=? WHERE id=?',
      [name, barcode, category, stock, minStock, price, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }
    res.json({ message: 'Item berhasil diperbarui' });
  } catch (err) {
    console.error('Error saat update item:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// Hapus item berdasarkan ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await initDB();
    const [result] = await db.query('DELETE FROM items WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }
    res.json({ message: 'Item berhasil dihapus' });
  } catch (err) {
    console.error('Error saat hapus item:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

app.post("/api/items/in/manual", async (req, res) => {
  const { category, variant, qty, price, metode, sumber } = req.body;

  if (!qty || qty <= 0) {
    return res.status(400).json({ message: "Quantity wajib diisi" });
  }

  if (!category || !variant) {
    return res.status(400).json({ message: "Kategori & Varian wajib diisi" });
  }

  // Cek item di database
  let item = await db.items.findOne({ category, variant });

  if (!item) {
    // Kalau belum ada, buat item baru
    item = await db.items.create({
      category,
      variant,
      stock: 0,
      price,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Tambah stok
  item.stock += qty;
  item.updatedAt = new Date();
  await item.save();

  return res.json({
    message: "Stok berhasil ditambahkan",
    item,
  });
});

export default router;