import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Plus, Scan, Download, Upload, LogOut, Settings, TrendingDown, TrendingUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import BarcodeScanner from '@/components/BarcodeScanner';
import StockInForm from '@/components/StockInForm';
import StockOutForm from '@/components/StockOutForm';
import InventoryView from '@/components/InventoryView';
import StockOutView from '@/components/StockOutView';
import Dashboard from '@/components/Dashboard';
import LoginForm from '@/components/LoginForm';
import CategoryManager from '@/components/CategoryManager';
import { getBarcodeInfo } from '@/data/barcodeMap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { variantCategoryMap } from "@/data/variantCategoryMap";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";




function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [stockOutRecords, setStockOutRecords] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showStockInForm, setShowStockInForm] = useState(false);
  const [showStockOutForm, setShowStockOutForm] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const [notMappedBarcodes, setNotMappedBarcodes] = useState([]);
  const varianList = ['Lavender'];
  const [showManualIn, setShowManualIn] = useState(false);
  const [showManualOut, setShowManualOut] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
const [formType, setFormType] = useState('masuk'); // "masuk" atau "keluar"

const variantsPerCategory = {
  "Vial 3ml Classic": [
    "Roses",
    "Ombre",
    "Magic",
    "Love Oud",
    "Amethyst",
    "Happines",
    "Jasminum",
    "Amber",
    "Matcher"
  ],
  "Vial 3ml Eksklusif": [
    "L'AME",
    "Sunset",
    "Senso",
    "Glorious"
  ],
  "Vial 2ml": [
    "Roses",
    "Ombre",
    "Magic",
    "Love Oud",
    "Amethyst",
    "Happines",
    "Jasminum",
    "Amber",
    "Matcher",
    "L'AME",
    "Sunset",
    "Senso",
    "Glorious",
    "BrotherHood"
  ],
  "Roll On 10ml": [
    "Roses",
    "Ombre",
    "Magic",
    "Love Oud",
    "Amethyst",
    "Happines",
    "Jasminum",
    "Amber",
    "Matcher",
    "L'AME",
    "Sunset",
    "Senso",
    "Glorious"
  ],
  "Hairmist": [
  "Midnight Bloom",
  "Amber Vougere",
  "Luxe Mist",
  "Silky Smooth",
  "Rose Dew"
]

};


const allowedCategories = [
  { value: "Vial 3ml Classic", label: "Vial 3ml Classic" },
  { value: "Vial 3ml Eksklusif", label: "Vial 3ml Eksklusif" },
  { value: "Vial 2ml", label: "Vial 2ml" },
  { value: "Roll On 10ml", label: "Roll On 10ml" },
  { value: "Hairmist", label: "Hairmist" }
];

const [selectedReason, setSelectedReason] = useState('');
const reasons = [
  { value: 'Retur', label: 'Retur' },
  { value: 'Rusak', label: 'Rusak' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Kehilangan', label: 'Kehilangan' },
  { value: 'Pameran', label: 'Pameran' },
  { value: 'OnlineShop', label: 'OnlineShop' },
  { value: 'Lainnya', label: 'Lainnya' }
];
const [manualData, setManualData] = useState({
  category: 'Vial',
  varian: '',
  qty: '',
  metode: '',
  sumber: ''
});


  const defaultCategories = [
    { value: 'all', label: 'Semua Kategori', icon: '📦' },
    { value: 'Parfum - Eksklusif', label: 'Parfum Eksklusif', icon: '💎' },
    { value: 'Parfum - Classic', label: 'Parfum Classic', icon: '🌹' },
    { value: 'Parfum - Sanju', label: 'Parfum Sanju', icon: '🌸' },
    { value: 'Parfum - Balinese', label: 'Parfum Balinese', icon: '🌺' },
    { value: 'Parfum - Ocassion', label: 'Parfum Ocassion', icon: '💫' },
    { value: 'Body Spray - Aerosols', label: 'Body Spray Aerosols', icon: '💨' },
    { value: 'Home Care - Diffuser', label: 'Home Care Diffuser', icon: '🏠' },
    { value: 'Hair Care', label: 'Hair Care', icon: '💇' },
    { value: 'Vial', label: 'Vial', icon: '🧪' },
    { value: 'Roll On 10ml', label: 'Roll On 10ml', icon: '🧴' },

  ];

  const fetchItems = () => {
  fetch(`${import.meta.env.VITE_API_BASE}/items`)
    .then(res => res.json())
    .then(data => setItems(data))
    .catch(err => console.error("Gagal mengambil ulang data items:", err));
};

useEffect(() => {
  fetch("https://fmiwarehouse.shop/api/categories")
    .then(res => res.json())
    .then(data => {
      setCategories(Array.isArray(data) ? data : []);
    })
    .catch(err => {
      console.error("Gagal ambil kategori:", err);
      setCategories([]);
    });

  fetch("https://fmiwarehouse.shop/api/items")
    .then(res => res.json())
    .then(data => {
      setItems(Array.isArray(data) ? data : []);
    })
    .catch(err => {
      console.error("Gagal ambil data items:", err);
      setItems([]);
    });

  fetch("https://fmiwarehouse.shop/api/history-keluar")
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) {
        console.error("⚠️ history-keluar bukan array:", data);
        setStockOutRecords([]);
        return;
      }

      const mapped = data.map((row) => ({
        id: row.id,
        date: row.tanggal,
        item: {
          name: row.varian,
          category: row.kategori,
        },
        quantity: row.qty,
        reason: row.metode || "Upload",
        description: row.sumber || "-",
      }));
      setStockOutRecords(mapped);
    })
    .catch(err => {
      console.error("Gagal ambil history_keluar:", err);
      setStockOutRecords([]);
    });

  const savedAdminStatus = localStorage.getItem("isAdmin");
  if (savedAdminStatus === "true") {
    setIsAdmin(true);
  }
}, []);


  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('isAdmin', isAdmin.toString());
  }, [isAdmin]);

  const handleBarcodeDetected = (barcode) => {
    const existingItem = items.find(item => item.barcode === barcode);
    const barcodeInfo = getBarcodeInfo(barcode);
    
    if (existingItem) {
      toast({
        title: "Barcode Ditemukan! 📦",
        description: `${existingItem.name} - Stok: ${existingItem.stock}`,
      });
      setActiveTab('inventory');
    } else if (barcodeInfo) {
      toast({
        title: "Produk Dikenali! ✨",
        description: `${barcodeInfo.variant} - Tinggal input stok masuk`,
      });
      setScannedBarcode(barcode);
      setShowStockInForm(true);
    } else {
      toast({
        title: "Barcode Baru Terdeteksi! ✨",
        description: `Barcode: ${barcode} - Tambahkan item baru?`,
      });
      setScannedBarcode(barcode);
      setShowStockInForm(true);
    }
    setShowScanner(false);
  };

const handleStockIn = (newItem) => {
  const existingItemIndex = items.findIndex(item => item.barcode === newItem.barcode);

  if (existingItemIndex !== -1) {
    // ✅ Update stok dan harga ke backend (PUT)
    const updatedStock = items[existingItemIndex].stock + newItem.stock;
    const updatedPrice = newItem.price || items[existingItemIndex].price || 0;

    fetch(`https://fmiwarehouse.shop/api/items/${items[existingItemIndex].id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: updatedStock, price: updatedPrice }) // ✅ Tambahkan price
    })
    .then(() => {
      setItems(prev => prev.map((item, index) =>
        index === existingItemIndex
          ? { ...item, stock: updatedStock, price: updatedPrice, lastUpdated: new Date().toISOString() }
          : item
      ));
      toast({ title: "Stok Ditambahkan", description: `${newItem.name} +${newItem.stock}` });
    });
  } else {
    // ✅ Tambahkan item baru (POST)
    fetch("https://fmiwarehouse.shop/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem)
    })
    .then(res => res.json())
    .then((data) => {
      const item = {
        ...newItem,
        id: data.id,
        lastUpdated: new Date().toISOString()
      };
      setItems(prev => [...prev, item]);
      toast({ title: "Item Baru Ditambahkan", description: newItem.name });
    });
  }

  setShowStockInForm(false);
  setScannedBarcode(null);
};

const handleStockOut = ({ barcode, varian, category, qty, metode, sumber }) => {
  const payload = (barcode && barcode.trim() !== "")
    ? { barcode, quantity: qty, metode, sumber }
    : { varian, category, quantity: qty, metode, sumber };

  console.log("📤 Kirim stok keluar:", payload);

  fetch("https://fmiwarehouse.shop/api/stock-out", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mencatat barang keluar");
      return data;
    })
    .then((data) => {
      console.log("✅ Berhasil:", data);
      setItems(prev =>
        prev.map(item =>
          (barcode && item.barcode === barcode) ||
          (!barcode && item.name.toLowerCase().includes(varian.toLowerCase()))
            ? { ...item, stock: Math.max(0, item.stock - qty), lastUpdated: new Date().toISOString() }
            : item
        )
      );
    })
    .catch((err) => {
      console.error("❌ Error stok keluar:", err);
    });
};


const handleUpdateStock = (id, newStock) => {
  fetch(`https://fmiwarehouse.shop/api/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock: newStock })
  })
    .then(res => res.json())
    .then((data) => {
      if (data.success) {
        setItems(prev =>
          prev.map(item =>
            item.id === id ? { ...item, stock: newStock, lastUpdated: new Date().toISOString() } : item
          )
        );
      }
    });
};

const handleChiperlabUpload = (event) => {
  console.log("📥 Upload Stok MASUK dimulai");
  const file = event.target.files[0];
  if (!file || !requireAdmin()) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.trim().split("\n");

    if (lines.length === 0) {
      toast({
        title: "File Kosong",
        description: "File tidak berisi data.",
        variant: "destructive"
      });
      return;
    }

    const parsedData = lines
      .map(line => {
        const [barcode, qty] = line.trim().split(",");
        if (!barcode || isNaN(Number(qty))) {
          console.warn("⛔ Format tidak valid:", line);
          return null;
        }
        return { barcode, qty: Number(qty) };
      })
      .filter(Boolean);

    const notFoundBarcodes = [];

    parsedData.forEach(({ barcode, qty }) => {
      const barcodeInfo = getBarcodeInfo(barcode);

      if (barcodeInfo) {
        const itemData = {
          category: barcodeInfo.category || "Uncategorized",
          name: barcodeInfo.variant || "Tanpa Nama",
          barcode: barcode,
          stock: qty,
          minStock: 0,
          price: barcodeInfo.price ?? 0,
        };

        // ✅ STOK MASUK
        handleStockIn(itemData);

      } else {
        notFoundBarcodes.push(barcode);

        toast({
          title: "⚠️ Barcode Tidak Dikenali",
          description: `Barcode: ${barcode} belum dimapping`,
          variant: "destructive"
        });
      }
    });

    setNotMappedBarcodes(notFoundBarcodes);
    if (notFoundBarcodes.length > 0) {
      console.log("📛 Barcode yang tidak dikenali:", notFoundBarcodes);
    }
  };

  reader.readAsText(file);
  event.target.value = "";
};


const handleChiperlabStockOutUpload = (event) => {
  const file = event.target.files[0];
  if (!file || !requireAdmin()) return;

  if (!selectedReason) {
    toast({
      title: "Alasan Wajib Diisi ⚠️",
      description: "Pilih alasan stok keluar sebelum mengunggah",
      variant: "destructive"
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const lines = e.target.result.trim().split("\n");

    if (lines.length === 0) {
      toast({
        title: "File Kosong",
        description: "File tidak mengandung data yang bisa diproses",
        variant: "destructive"
      });
      return;
    }

    const parsedData = lines
      .map(line => {
        const [barcode, qty] = line.trim().split(",");
        if (!barcode || isNaN(Number(qty))) {
          console.warn("⛔ Format tidak valid:", line);
          return null;
        }
        return { barcode: barcode.trim(), qty: Number(qty) };
      })
      .filter(Boolean);

    parsedData.forEach(({ barcode, qty }) => {
      const item = items.find(i => i.barcode === barcode);
      if (!item) {
        toast({
          title: "Item Tidak Ditemukan 😕",
          description: `Barcode ${barcode} tidak ditemukan di database`,
          variant: "destructive"
        });
        return;
      }

      if (item.stock < qty) {
        toast({
          title: "Stok Tidak Cukup 🚫",
          description: `${item.name} hanya tersisa ${item.stock}, tidak bisa dikurangi ${qty}`,
          variant: "destructive"
        });
        return;
      }

      console.log("📤 Upload dengan alasan:", selectedReason);

      fetch("https://fmiwarehouse.shop/api/stock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          quantity: qty,
          metode: selectedReason,
          sumber: 'Chiperlab'
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setItems(prev =>
              prev.map(i =>
                i.id === item.id
                  ? { ...i, stock: i.stock - qty, lastUpdated: new Date().toISOString() }
                  : i
              )
            );

            const record = {
              id: Date.now().toString(),
              date: new Date().toISOString(),
              item: {
                name: item.name,
                category: item.category
              },
              quantity: qty,
              reason: selectedReason,
              description: "Upload"
            };
            setStockOutRecords(prev => [...prev, record]);

            toast({
              title: "Stok Keluar Berhasil 📤",
              description: `${item.name} -${qty} (${selectedReason})`
            });
          } else {
            throw new Error(data.message || "Gagal mencatat stok keluar");
          }
        })
        .catch(err => {
          console.error("❌ Gagal input barang keluar:", err);
          toast({
            title: "Error",
            description: `Gagal mencatat barang keluar: ${item.name}`,
            variant: "destructive"
          });
        });
    });
  };

  reader.readAsText(file);
  event.target.value = ""; // ✅ reset input SETELAH readAsText
};


  const handleDeleteItem = (id) => {
  if (!isAdmin) {
    toast({
      title: "Akses Ditolak! 🔒",
      description: "Hanya admin yang dapat menghapus item",
      variant: "destructive"
    });
    return;
  }

  fetch(`https://fmiwarehouse.shop/api/items/${id}`, {
    method: "DELETE"
  })
  .then(() => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast({ title: "Item Dihapus", description: "Data berhasil dihapus dari database" });
  });
};


  const handleLogin = (success) => {
    setIsAdmin(success);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    toast({
      title: "Logout Berhasil! 👋",
      description: "Anda telah keluar dari mode admin",
    });
  };

  const handleAddCategory = (categoryData) => {
  fetch("https://fmiwarehouse.shop/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(categoryData)
  })
    .then(res => res.json())
    .then((data) => {
      const newCategory = { ...categoryData, id: data.id };
      setCategories(prev => [...prev, newCategory]);
      toast({ title: "Kategori Ditambahkan", description: categoryData.label });
    })
    .catch(err => {
      console.error("Gagal menambahkan kategori:", err);
      toast({ title: "Gagal Menambahkan", description: "Terjadi kesalahan", variant: "destructive" });
    });
};


  const handleUpdateCategory = (updatedCategory) => {
    setCategories(prev => prev.map(cat => 
      cat.value === updatedCategory.value ? updatedCategory : cat
    ));
  };

 const handleDeleteCategory = (id) => {
  fetch(`https://fmiwarehouse.shop/api/categories/${id}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
        toast({
          title: "Kategori Dihapus",
          description: "Kategori berhasil dihapus dari database",
        });
      } else {
        toast({
          title: "Gagal Menghapus",
          description: "Terjadi kesalahan saat menghapus kategori",
          variant: "destructive",
        });
      }
    })
    .catch((err) => {
      console.error("Gagal hapus kategori:", err);
      toast({
        title: "Error Server",
        description: "Tidak dapat menghubungi server",
        variant: "destructive",
      });
    });
};
const exportData = () => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text('LAPORAN STOK BARANG', 14, 15);
  doc.text('Followme Indonesia', 14, 22);

  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  doc.setFontSize(10);
  doc.text(`Tanggal Cetak: ${today}`, 14, 29);

  const headers = [['No', 'Nama Barang', 'Kategori', 'Barcode', 'Stok', 'Harga (Rp)', 'Total Nilai (Rp)']];
  const data = items.map((item, index) => {
    const total = item.stock * item.price;
    return [
      index + 1,
      item.name,
      item.category,
      item.barcode,
      item.stock,
      `Rp ${item.price.toLocaleString('id-ID')}`,
      `Rp ${total.toLocaleString('id-ID')}`
    ];
  });

  const totalNilai = items.reduce((acc, item) => acc + (item.stock * item.price), 0);

  autoTable(doc, {
    startY: 35,
    head: headers,
    body: data,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [111, 66, 193], textColor: 255 },
    margin: { left: 14, right: 14 }
  });

  // Tambahkan total keseluruhan
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Total Nilai Seluruh Produk: Rp ${totalNilai.toLocaleString('id-ID')}`, 14, finalY);

  doc.save(`laporan-stok-${new Date().toISOString().split('T')[0]}.pdf`);
};

const exportStockOut = () => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Laporan Stok Keluar - ${new Date().toLocaleDateString('id-ID')}`, 14, 15);

  const headers = [['No', 'Tanggal', 'Nama Barang', 'Kategori', 'Qty', 'Alasan', 'Keterangan']];
  const body = stockOutRecords.map((record, index) => [
    index + 1,
    new Date(record.date).toLocaleDateString('id-ID'),
    record.item.name,
    record.item.category,
    record.quantity,
    record.reason,
    record.description || '-'
  ]);

  autoTable(doc, {
    startY: 25,
    head: headers,
    body: body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [111, 66, 193] },
  });

  // Total qty
  const totalQty = stockOutRecords.reduce((sum, r) => sum + r.quantity, 0);
  doc.setFontSize(11);
  doc.text(`Total Barang Keluar: ${totalQty}`, 14, doc.lastAutoTable.finalY + 10);

  doc.save(`laporan-stok-keluar-${new Date().toISOString().split("T")[0]}.pdf`);
};

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          setItems(importedData);
          toast({
            title: "Data Berhasil Diimpor! 📥",
            description: `${importedData.length} item telah diimpor`,
          });
        } catch (error) {
          toast({
            title: "Error Import Data! ❌",
            description: "Format file tidak valid",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const requireAdmin = (action) => {
    if (!isAdmin) {
      toast({
        title: "Akses Ditolak! 🔒",
        description: "Silakan login sebagai admin terlebih dahulu",
        variant: "destructive"
      });
      setShowLoginForm(true);
      return false;
    }
    return true;
  };

  return (
    <>
      <Helmet>
        <title>Stok Opname Barcode - Sistem Manajemen Inventory</title>
        <meta name="description" content="Sistem manajemen stok opname dengan teknologi barcode scanner untuk tracking inventory yang efisien dan akurat" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  📦 Followme Indonesia
                </h1>
                <p className="text-purple-200">
                  Sistem manajemen inventory
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
             <Dialog open={showManualForm} onOpenChange={setShowManualForm}>
  <DialogContent className="bg-gray-900 text-white rounded-lg p-6">
    <DialogHeader>
      <DialogTitle>
        Input Manual Stok {manualData.type === "out" ? "Keluar" : "Masuk"}
      </DialogTitle>
      <DialogDescription>
        Form untuk mencatat stok keluar/masuk secara manual.
      </DialogDescription>
    </DialogHeader>

    {/* Jenis */}
    <div className="mb-4">
      <label className="block text-sm mb-2">Jenis</label>
      <select
        value={manualData.type}
        onChange={(e) =>
          setManualData({ ...manualData, type: e.target.value })
        }
        className="w-full p-2 rounded bg-gray-800 text-white"
      >
        <option value="in">Stok Masuk</option>
        <option value="out">Stok Keluar</option>
      </select>
    </div>

    {/* Kategori */}
    <div className="mb-4">
      <label className="block text-sm mb-2">Kategori</label>
      <select
        value={manualData.category}
        onChange={(e) =>
          setManualData({ ...manualData, category: e.target.value, varian: "" })
        }
        className="w-full p-2 rounded bg-gray-800 text-white"
      >
        <option value="">Pilih Kategori</option>
        {Object.keys(variantsPerCategory).map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>

    {/* Varian */}
    <div className="mb-4">
      <label className="block text-sm mb-2">Varian</label>
      <select
        value={manualData.varian}
        onChange={(e) =>
          setManualData({ ...manualData, varian: e.target.value })
        }
        className="w-full p-2 rounded bg-gray-800 text-white"
        disabled={!manualData.category}
      >
        <option value="">Pilih Varian</option>
        {variantsPerCategory[manualData.category]?.map((varian) => (
          <option key={varian} value={varian}>
            {varian}
          </option>
        ))}
      </select>
    </div>

    {/* Qty */}
    <div className="mb-4">
      <label className="block text-sm mb-2">Jumlah</label>
      <input
        type="number"
        value={manualData.qty}
        onChange={(e) =>
          setManualData({ ...manualData, qty: e.target.value })
        }
        className="w-full p-2 rounded bg-gray-800 text-white"
        placeholder="Masukkan jumlah"
      />
    </div>

    {/* Alasan */}
    <div className="mb-4">
      <label className="block text-sm mb-2">Alasan</label>
      <select
        value={manualData.metode}
        onChange={(e) =>
          setManualData({ ...manualData, metode: e.target.value })
        }
        className="w-full p-2 rounded bg-gray-800 text-white"
      >
        <option value="">Pilih Alasan</option>
        <option value="Penjualan">Penjualan</option>
        <option value="Sample">Sample</option>
        <option value="Rusak">Rusak</option>
        <option value="Kadaluarsa">Kadaluarsa</option>
      </select>
    </div>

    <DialogFooter>
      <Button
  onClick={() => {
    if (!requireAdmin()) return;

    const qty = parseInt(manualData.qty, 10);
    if (isNaN(qty) || qty <= 0) {
      toast({
        title: "Error",
        description: "Qty harus lebih besar dari 0",
        variant: "destructive",
      });
      return;
    }

    // 🔍 Cari item berdasarkan varian + kategori
    const selectedItem = items.find(
      (i) =>
        i.name.toLowerCase() === manualData.varian.toLowerCase() &&
        i.category.toLowerCase() === manualData.category.toLowerCase()
    );

    const endpoint =
  manualData.type === "out"
    ? "https://fmiwarehouse.shop/api/stock-out"
    : "https://fmiwarehouse.shop/api/items/in/manual";

const payload =
  manualData.type === "out"
    ? (
        selectedItem
          ? {
              itemId: selectedItem.id,
              quantity: qty,
              metode: manualData.metode || "Manual",
              sumber: "Manual",
            }
          : {
              varian: manualData.varian,
              category: manualData.category,
              quantity: qty,
              metode: manualData.metode || "Manual",
              sumber: "Manual",
            }
      )
    : {
        category: manualData.category,
        variant: manualData.varian, // 🔑 pakai "variant" (bukan varian)
        qty: qty, // 🔑 pakai "qty" (bukan quantity)
        price: 0,
        metode: manualData.metode || "Manual",
        sumber: "Manual",
      };


    console.log("🔁 Kirim ke endpoint:", endpoint);
    console.log("📦 Payload:", payload);

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (!res.ok)
            throw new Error(data.message || "Gagal input stok");
          return data;
        } catch (e) {
          throw new Error(`Respon server bukan JSON: ${text}`);
        }
      })
      .then(() => {
        toast({
          title:
            manualData.type === "out"
              ? "Barang Keluar"
              : "Barang Masuk",
          description: `${manualData.varian} (${manualData.category}) - Qty: ${qty}`,
        });

        const updatedItems = [...items];
        if (selectedItem) {
          const index = items.findIndex((i) => i.id === selectedItem.id);
          updatedItems[index] = {
            ...updatedItems[index],
            stock:
              manualData.type === "out"
                ? Math.max(0, updatedItems[index].stock - qty)
                : updatedItems[index].stock + qty,
            lastUpdated: new Date().toISOString(),
          };
        } else {
          updatedItems.push({
            name: manualData.varian,
            category: manualData.category,
            stock: qty,
            lastUpdated: new Date().toISOString(),
            price: 0,
          });
        }

        setItems(updatedItems);
        setShowManualForm(false);
        setManualData({
          type: "in",
          category: "",
          varian: "",
          qty: "",
          metode: "",
          sumber: "Manual",
        });
      })
      .catch((err) => {
        console.error("❌ Error input stok:", err);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      });
  }}
>
  Simpan
</Button>

    </DialogFooter>
  </DialogContent>
</Dialog>

              <Button
  onClick={() => {
    setFormType('masuk'); // default ke masuk
    setShowManualForm(true);
  }}
  className="bg-indigo-600 text-white"
>
  + Input Manual
</Button>
                <Button
                  onClick={() => {
                    if (!isAdmin) {
                      toast({
                        title: "Login Admin Diperlukan 🔐",
                        description: "Silakan login sebagai admin untuk menggunakan fitur scan",
                        variant: "destructive"
                      });
                      setShowLoginForm(true);
                      return;
                    }
                    setShowScanner(true);
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Barcode
                </Button>   
                <div className="relative">
                  <input
                    type="file"
                    id="uploadChiperlab"
                    accept=".txt"
                    onChange={(e) => {
                      if (!requireAdmin()) return;
                      handleChiperlabUpload(e);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />

                  <label
                    htmlFor="uploadChiperlab"
                    className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium py-2 px-4 rounded hover:from-blue-600 hover:to-cyan-600 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Stok (Chiperlab)
                  </label>
                </div>
                
                {/* Dropdown Alasan */}
              <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger className="bg-white/10 border-purple-300 text-white">
                    <SelectValue placeholder="Pilih alasan" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-purple-500">
                    {reasons.map((reason) => (
                      <SelectItem
                        key={reason.value}
                        value={reason.value}
                        className="text-white hover:bg-purple-700"
                      >
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedReason && (
                  <p className="text-white text-sm">
                    Alasan dipilih: <strong>{selectedReason}</strong>
                  </p>
                )}
                <div className="relative">
                  <input
                  type="file"
                  id="uploadChiperlab"
                  accept=".txt"
                  onChange={(e) => {
                    if (!requireAdmin()) return;
                    handleChiperlabStockOutUpload(e);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                  <Button
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white text-sm px-3 py-2"
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Upload Keluar
                  </Button>
                </div>
                <Button
                  onClick={exportData}
                  variant="outline"
                  className="border-purple-300 text-purple-100 hover:bg-purple-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Button
                    variant="outline"
                    className="border-purple-300 text-purple-100 hover:bg-purple-800"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>

                {isAdmin && (
                  <Button
                    onClick={() => setShowCategoryManager(true)}
                    variant="outline"
                    className="border-yellow-300 text-yellow-100 hover:bg-yellow-800"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Kategori
                  </Button>
                )}

                {isAdmin ? (
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-red-300 text-red-100 hover:bg-red-800"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowLoginForm(true)}
                    variant="outline"
                    className="border-green-300 text-green-100 hover:bg-green-800"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Login Admin
                  </Button>
                )}
              </div>
            </div>

            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-emerald-800/30 border border-emerald-500/50 rounded-lg"
              >
                <p className="text-emerald-300 text-sm">
                  🔓 Mode Admin Aktif - Anda memiliki akses penuh ke semua fitur
                </p>
              </motion.div>
            )}
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                onClick={() => setActiveTab('dashboard')}
                variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                className={activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'border-purple-300 text-purple-100 hover:bg-purple-800'
                }
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              
              <Button
                onClick={() => setActiveTab('inventory')}
                variant={activeTab === 'inventory' ? 'default' : 'outline'}
                className={activeTab === 'inventory' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'border-purple-300 text-purple-100 hover:bg-purple-800'
                }
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Inventory
              </Button>

              <Button
                onClick={() => setActiveTab('stock-out')}
                variant={activeTab === 'stock-out' ? 'default' : 'outline'}
                className={activeTab === 'stock-out' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'border-purple-300 text-purple-100 hover:bg-purple-800'
                }
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Stok Keluar
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Dashboard items={items} stockOutRecords={stockOutRecords} />
                </motion.div>
              )}

              {activeTab === 'inventory' && (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <InventoryView
                  items={items}
                  setItems={setItems}        
                  categories={categories}
                  onUpdateStock={handleUpdateStock}
                  onDeleteItem={handleDeleteItem}
                  isAdmin={isAdmin}
                  />
                </motion.div>
              )}

              {activeTab === 'stock-out' && (
                <motion.div
                  key="stock-out"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                <StockOutView 
                  stockOutRecords={stockOutRecords} 
                  filterReason={selectedReason}
                  onExport={exportStockOut}
                />
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>

        <Dialog open={showScanner} onOpenChange={setShowScanner}>
          <BarcodeScanner
            onDetected={handleBarcodeDetected}
            onClose={() => setShowScanner(false)}
          />
        </Dialog>

        <Dialog open={showStockInForm} onOpenChange={setShowStockInForm}>
          <StockInForm
            onSubmit={handleStockIn}
            onClose={() => {
              setShowStockInForm(false);
              setScannedBarcode(null);
            }}
            categories={categories}
            scannedBarcode={scannedBarcode}
          />
        </Dialog>

        {/* <Dialog open={showStockOutForm} onOpenChange={setShowStockOutForm}>
          <StockOutForm
            onSubmit={handleStockOut}
            onClose={() => setShowStockOutForm(false)}
            items={items}
          />
        </Dialog> */}

        <Dialog open={showLoginForm} onOpenChange={setShowLoginForm}>
          <LoginForm
            onLogin={handleLogin}
            onClose={() => setShowLoginForm(false)}
          />
        </Dialog>

        <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
          <CategoryManager
            categories={categories}
            onAddCategory={handleAddCategory}
            onUpdateCategory={handleUpdateCategory}
            onDeleteCategory={handleDeleteCategory}
            onClose={() => setShowCategoryManager(false)}
          />
        </Dialog>

        <Toaster />
      </div>
    </>
  );
}

export default App;
