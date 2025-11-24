import express from 'express';
import initDB from '../db.js';

const router = express.Router();

// 1. GET: Ambil semua item
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

// 2. POST: Tambah item baru (Sudah digabung dan dirapikan)
router.post('/', async (req, res) => {
  const { name, barcode, category, stock, minStock, price, photo } = req.body;
  
  try {
    const db = await initDB();
    const sql = `
      INSERT INTO items (name, barcode, category, stock, price, minStock, photo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [
      name,
      barcode,
      category,
      Number(stock) || 0,
      Number(price) || 0,
      Number(minStock) || 0,
      photo || null,
    ]);

    res.json({ success: true, id: result.insertId, message: 'Item berhasil ditambahkan' });
  } catch (err) {
    console.error('Error saat menambah item:', err);
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Barcode sudah terdaftar!' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// 3. PUT: Update item (Partial Update)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Hanya izinkan update kolom yang valid
  const allowedFields = ['name', 'barcode', 'category', 'stock', 'minStock', 'price', 'photo'];
  const keysToUpdate = Object.keys(updates).filter(key => allowedFields.includes(key) && updates[key] !== undefined);

  if (keysToUpdate.length === 0) {
    return res.status(400).json({ message: 'Tidak ada data yang dikirim untuk diperbarui' });
  }

  const setClause = keysToUpdate.map(key => `${key} = ?`).join(', ');
  const values = keysToUpdate.map(key => updates[key]);
  values.push(id);

  const sql = `UPDATE items SET ${setClause} WHERE id = ?`;

  try {
    const db = await initDB();
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }
    res.json({ message: 'Item berhasil diperbarui' });
  } catch (err) {
    console.error('Error saat update item:', err);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

// 4. DELETE: Hapus item
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

export default router;