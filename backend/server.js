// backend/server.js
import express from 'express';
import cors from 'cors';
import itemsRouter from './routes/items.js'; // ⬅️ Ini file router yang kamu buat tadi
import categoriesRouter from './routes/categories.js';
import stockOutRouter from './routes/stockOut.js';
import historyKeluarRoute from './routes/historyKeluar.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Pakai router untuk /items
app.use('/items', itemsRouter);
app.use('/categories', categoriesRouter);
app.use('/stock-out', stockOutRouter);
app.use('/history-keluar', historyKeluarRoute);

// Jalankan server
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
