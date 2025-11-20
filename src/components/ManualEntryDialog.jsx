// src/components/ManualEntryDialog.jsx
import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ManualEntryDialog = ({ isOpen, onClose, items, setItems, isAdmin, requireAdmin }) => {
  const { toast } = useToast();
  const [manualData, setManualData] = useState({
    type: 'in',
    category: '',
    varian: '',
    qty: '',
    metode: '',
    sumber: 'Manual'
  });

  // --- LOGIKA DINAMIS UNTUK KATEGORI & VARIAN ---
  // 1. Ambil daftar kategori unik dari data 'items' yang ada di database
  const dynamicCategories = useMemo(() => {
    const uniqueCategories = [...new Set(items.map(item => item.category))].filter(Boolean).sort();
    return uniqueCategories;
  }, [items]);

  // 2. Ambil daftar varian berdasarkan kategori yang dipilih
  const dynamicVariants = useMemo(() => {
    if (!manualData.category) return [];
    return items
      .filter(item => item.category === manualData.category)
      .map(item => item.name)
      .filter(Boolean)
      .sort();
  }, [items, manualData.category]);
  // ---------------------------------------------

  const handleSubmit = async () => {
    if (!requireAdmin()) return;

    const qtyInt = parseInt(manualData.qty, 10);
    if (isNaN(qtyInt) || qtyInt <= 0) {
        toast({ title: "Error", description: "Qty harus lebih besar dari 0", variant: "destructive" });
        return;
    }

    // Validasi input wajib
    if (!manualData.category || !manualData.varian) {
        toast({ title: "Error", description: "Kategori dan Varian wajib dipilih", variant: "destructive" });
        return;
    }

    const selectedItem = items.find(
        (i) => i.name.toLowerCase() === manualData.varian.toLowerCase() &&
               i.category.toLowerCase() === manualData.category.toLowerCase()
    );

    const endpoint = manualData.type === "out"
        ? `/api/stock-out`
        : `/api/stock-in/manual`;

    const payload = manualData.type === "out"
        ? selectedItem
            ? { itemId: selectedItem.id, quantity: qtyInt, metode: manualData.metode || "Manual", sumber: "Manual" }
            : { variant: manualData.varian, category: manualData.category, quantity: qtyInt, metode: manualData.metode || "Manual", sumber: "Manual" }
        : {
            category: manualData.category,
            variant: manualData.varian,
            quantity: qtyInt,
            price: 0,
            metode: manualData.metode || "Manual",
            sumber: "Manual",
        };

    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal input stok");

        toast({
            title: manualData.type === "out" ? "Barang Keluar" : "Barang Masuk",
            description: `${manualData.varian} (${manualData.category}) - Qty: ${qtyInt}`,
        });

        // Update state lokal agar UI langsung berubah
        const updatedItems = [...items];
        if (selectedItem) {
             const index = items.findIndex((i) => i.id === selectedItem.id);
             updatedItems[index] = {
                 ...updatedItems[index],
                 stock: manualData.type === "out"
                     ? Math.max(0, updatedItems[index].stock - qtyInt)
                     : updatedItems[index].stock + qtyInt,
                 lastUpdated: new Date().toISOString(),
             };
         } else if (manualData.type === 'in') {
              updatedItems.push({
                 id: data.item?.id || Date.now(),
                 name: manualData.varian,
                 category: manualData.category,
                 stock: qtyInt,
                 lastUpdated: new Date().toISOString(),
                 price: 0,
             });
         }
        setItems(updatedItems);

        setManualData({ type: "in", category: "", varian: "", qty: "", metode: "", sumber: "Manual" });
        onClose();

    } catch (err) {
        console.error("❌ Error input stok:", err);
        toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 text-white rounded-lg p-6 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Input Manual Stok {manualData.type === "out" ? "Keluar" : "Masuk"}</DialogTitle>
          <DialogDescription>Form untuk mencatat stok secara manual.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label>Jenis Transaksi</Label>
                <Select value={manualData.type} onValueChange={(val) => setManualData({ ...manualData, type: val })}>
                    <SelectTrigger className="bg-gray-800"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="in">Stok Masuk (+)</SelectItem>
                        <SelectItem value="out">Stok Keluar (-)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label>Kategori</Label>
                <Select value={manualData.category} onValueChange={(val) => setManualData({ ...manualData, category: val, varian: "" })}>
                    <SelectTrigger className="bg-gray-800"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {dynamicCategories.map((cat, idx) => (
                            <SelectItem key={idx} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-2">
                <Label>Varian</Label>
                {/* Jika ingin bisa ketik varian baru untuk stok masuk, bisa ganti Select dengan Input/Combobox */}
                <Select value={manualData.varian} onValueChange={(val) => setManualData({ ...manualData, varian: val })} disabled={!manualData.category}>
                    <SelectTrigger className="bg-gray-800"><SelectValue placeholder="Pilih Varian" /></SelectTrigger>
                    <SelectContent className="max-h-[200px]">
                        {dynamicVariants.map((varian, idx) => (
                            <SelectItem key={idx} value={varian}>{varian}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

             <div className="grid gap-2">
                <Label>Jumlah</Label>
                <Input 
                    type="number" 
                    value={manualData.qty} 
                    onChange={(e) => setManualData({ ...manualData, qty: e.target.value })}
                    className="bg-gray-800"
                    placeholder="0"
                    min="1"
                />
            </div>

             <div className="grid gap-2">
                <Label>Keterangan / Alasan</Label>
                 <Select value={manualData.metode} onValueChange={(val) => setManualData({ ...manualData, metode: val })}>
                    <SelectTrigger className="bg-gray-800"><SelectValue placeholder="Pilih Keterangan" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Penjualan">Penjualan</SelectItem>
                        <SelectItem value="Restock">Restock (Masuk)</SelectItem>
                        <SelectItem value="Sample">Sample</SelectItem>
                        <SelectItem value="Rusak">Rusak</SelectItem>
                        <SelectItem value="Kadaluarsa">Kadaluarsa</SelectItem>
                         <SelectItem value="Opname">Selisih Opname</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>

        <DialogFooter>
           <Button variant="outline" onClick={onClose}><X className="w-4 h-4 mr-2"/> Batal</Button>
           <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700"><Save className="w-4 h-4 mr-2"/> Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualEntryDialog;