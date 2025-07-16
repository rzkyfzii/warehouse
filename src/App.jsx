import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Plus, Scan, Download, Upload, LogOut, Settings, TrendingDown, TrendingUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";


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


  const defaultCategories = [
    { value: 'all', label: 'Semua Kategori', icon: '📦' },
    { value: 'Parfum - Eksklusif', label: 'Parfum Eksklusif', icon: '💎' },
    { value: 'Parfum - Classic', label: 'Parfum Classic', icon: '🌹' },
    { value: 'Parfum - Sanju', label: 'Parfum Sanju', icon: '🌸' },
    { value: 'Parfum - Balinese', label: 'Parfum Balinese', icon: '🌺' },
    { value: 'Parfum - Follow Me', label: 'Parfum Follow Me', icon: '💫' },
    { value: 'Body Spray - Aerosols', label: 'Body Spray Aerosols', icon: '💨' },
    { value: 'Home Care - Diffuser', label: 'Home Care Diffuser', icon: '🏠' },
    { value: 'Hair Care', label: 'Hair Care', icon: '💇' }
  ];

  const fetchItems = () => {
  fetch("http://localhost:3000/items")
    .then(res => res.json())
    .then(data => setItems(data))
    .catch(err => console.error("Gagal mengambil ulang data items:", err));
};

useEffect(() => {
  // Ambil data kategori dari backend
  fetch("http://localhost:3000/categories")
    .then(res => res.json())
    .then(data => setCategories(data))
    .catch(err => console.error("Gagal ambil kategori:", err));

  // Ambil data stok barang
  fetch("http://localhost:3000/items")
    .then((res) => res.json())
    .then((data) => setItems(data))
    .catch((err) => console.error("Gagal ambil data:", err));

  // Ambil data stok keluar dari backend (history_keluar)
fetch("http://localhost:3000/history-keluar")
  .then((res) => res.json())
  .then((data) => {
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
  .catch((err) => console.error("Gagal ambil history_keluar:", err));

  // Ambil status admin
  const savedAdminStatus = localStorage.getItem('isAdmin');
  if (savedAdminStatus === 'true') {
    setIsAdmin(true);
  }
}, []);
useEffect(() => {
  fetch("http://localhost:3000/categories")
    .then(res => res.json())
    .then(data => setCategories(data))
    .catch(err => console.error("Gagal ambil kategori:", err));

  fetch("http://localhost:3000/items")
    .then((res) => res.json())
    .then((data) => setItems(data))
    .catch((err) => console.error("Gagal ambil data:", err));

  fetch("http://localhost:3000/history-keluar")
    .then((res) => res.json())
    .then((data) => {
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
    .catch((err) => console.error("Gagal ambil history_keluar:", err));

  const savedAdminStatus = localStorage.getItem('isAdmin');
  if (savedAdminStatus === 'true') {
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

    fetch(`http://localhost:3000/items/${items[existingItemIndex].id}`, {
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
    fetch("http://localhost:3000/items", {
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

const handleStockOut = ({ barcode, qty, metode, sumber }) => {
  fetch('http://localhost:3000/items/out', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ barcode, qty, metode, sumber }),
  })
    .then(res => res.json()) // ✅ ini wajib ada untuk parsing JSON
    .then(data => {
      if (data.success) {
        console.log("✅ Barang keluar berhasil dicatat:", data);
        toast({ title: "Barang Keluar", description: `Barcode ${barcode} - Qty: ${qty}` });

        // ✅ Update stok secara lokal di state
        setItems(prev =>
          prev.map(item =>
            item.barcode === barcode
              ? {
                  ...item,
                  stock: item.stock - qty,
                  lastUpdated: new Date().toISOString()
                }
              : item
          )
        );
      } else {
        throw new Error(data.message || "Unknown error");
      }
    })
    .catch(err => {
      console.error("❌ Gagal input barang keluar:", err);
      toast({
        title: "Error",
        description: "Gagal mencatat barang keluar",
        variant: "destructive"
      });
    });
};


const handleUpdateStock = (id, newStock) => {
  fetch(`http://localhost:3000/items/${id}`, {
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

      fetch("http://localhost:3000/stock-out", {
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

  fetch(`http://localhost:3000/items/${id}`, {
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
  fetch("http://localhost:3000/categories", {
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
  fetch(`http://localhost:3000/categories/${id}`, {
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
