// src/api.js
import { API_BASE } from "./config";

const api = {
  // Ambil semua items
  getItems: async () => {
    try {
      const res = await fetch(`${API_BASE}/items`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("getItems error:", err);
      return [];
    }
  },

  // Ambil semua categories
  getCategories: async () => {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("getCategories error:", err);
      return [];
    }
  },

  // Ambil history masuk
  getHistoryMasuk: async () => {
    try {
      const res = await fetch(`${API_BASE}/history-masuk`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("getHistoryMasuk error:", err);
      return [];
    }
  },

  // Ambil history keluar
  getHistoryKeluar: async () => {
    try {
      const res = await fetch(`${API_BASE}/history-keluar`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("getHistoryKeluar error:", err);
      return [];
    }
  },

  // Tambah item (POST)
  addItem: async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/items/in/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("addItem error:", err);
      return null;
    }
  },

  // Update item (PUT)
  updateItem: async (id, payload) => {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("updateItem error:", err);
      return null;
    }
  },

  // Hapus item (DELETE)
  deleteItem: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("deleteItem error:", err);
      return null;
    }
  },
};

export default api;
