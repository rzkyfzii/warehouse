import express from 'express';
import initDB from '../db.js';

const router = express.Router();

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

// Tambah stok manual
router.post('/in/manual', async (req, res) => {
  try {
    const { barcode, quantity } = req.body;

    if (!barcode || !quantity) {
      return res.status(400).json({ message: 'Barcode dan quantity wajib diisi' });
    }

    const db = await initDB();

    // Ambil item berdasarkan barcode
    const [rows] = await db.query('SELECT * FROM items WHERE barcode = ?', [barcode]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }

    // Update stok
    await db.query('UPDATE items SET stock = stock + ?, lastUpdated = NOW() WHERE barcode = ?', [quantity, barcode]);

    res.json({ message: 'Stok berhasil ditambahkan' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

export default router;