import express from 'express';
import initDB from '../db.js';

let db;
(async () => {
  db = await initDB();
})();

const router = express.Router();

// GET semua history keluar
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM history_keluar ORDER BY tanggal DESC');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error GET /historyKeluar:', err);
    res.status(500).send('Server error');
  }
});

// POST tambah history keluar
router.post('/', async (req, res) => {
  try {
    const { itemId, jumlah, tanggal } = req.body;
    await db.query(
      'INSERT INTO history_keluar (item_id, jumlah, tanggal) VALUES (?, ?, ?)',
      [itemId, jumlah, tanggal]
    );
    res.status(201).send('History keluar ditambahkan');
  } catch (err) {
    console.error('❌ Error POST /historyKeluar:', err);
    res.status(500).send('Server error');
  }
});

export default router;