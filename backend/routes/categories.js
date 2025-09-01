import express from 'express';
import initDB from '../db.js';

let db;
(async () => {
  db = await initDB();
})();

const router = express.Router();

// GET semua kategori
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categories');
    res.json(rows);
  } catch (err) {
    console.error('❌ Error GET /categories:', err);
    res.status(500).send('Server error');
  }
});

// POST tambah kategori
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).send('Kategori ditambahkan');
  } catch (err) {
    console.error('❌ Error POST /categories:', err);
    res.status(500).send('Server error');
  }
});

export default router;