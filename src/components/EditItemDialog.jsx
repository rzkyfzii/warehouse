// src/components/EditItemDialog.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

const EditItemDialog = ({ isOpen = false, onClose, itemToEdit, onSave }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    barcode: "",
    stock: 0,
    price: 0,
    minStock: 0,
  });

  const { toast } = useToast();

  // ✅ Saat itemToEdit berubah, isi form otomatis
  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        id: itemToEdit.id || "",
        name: itemToEdit.name || "",
        category: itemToEdit.category || "",
        barcode: itemToEdit.barcode || "",
        stock: Number(itemToEdit.stock) || 0,
        price: Number(itemToEdit.price) || 0,
        minStock: Number(itemToEdit.minStock) || 0,
      });
    } else {
      // Jika dialog dibuka tanpa itemToEdit (misal tambah baru)
      setFormData({
        id: "",
        name: "",
        category: "",
        barcode: "",
        stock: 0,
        price: 0,
        minStock: 0,
      });
    }
  }, [itemToEdit]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.barcode.trim()) {
      toast({
        title: "Gagal Menyimpan ⚠️",
        description: "Nama varian dan kode barcode wajib diisi.",
        variant: "destructive",
      });
      return;
    }

    if (typeof onSave === "function") {
      onSave(formData);
      toast({
        title: "Berhasil ✅",
        description: `Data "${formData.name}" telah diperbarui.`,
      });
      onClose();
    } else {
      console.error("⚠️ Fungsi onSave belum dikirim dari App.jsx");
      toast({
        title: "Error",
        description: "Fungsi penyimpanan belum dikonfigurasi di App.jsx.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-slate-900 to-purple-900 border border-purple-500 text-white">
        <DialogHeader>
          <DialogTitle>
            {itemToEdit ? `Edit Item: ${itemToEdit.name}` : "Tambah Item Baru"}
          </DialogTitle>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* Nama Varian */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Varian</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-white/10 border-purple-300 text-white"
              placeholder="Contoh: Parfum Floral Blossom"
            />
          </div>

          {/* Kategori */}
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className="bg-white/10 border-purple-300 text-white"
              placeholder="Contoh: Parfum / Diffuser"
            />
          </div>

          {/* Barcode */}
          <div className="space-y-2">
            <Label htmlFor="barcode">Kode Barcode</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => handleInputChange("barcode", e.target.value)}
              className="bg-white/10 border-purple-300 text-white"
              placeholder="Contoh: 8997001234567"
            />
          </div>

          {/* Stok, Harga, Min. Stok */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stok</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  handleInputChange("stock", Number(e.target.value))
                }
                className="bg-white/10 border-purple-300 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Harga</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  handleInputChange("price", Number(e.target.value))
                }
                className="bg-white/10 border-purple-300 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStock">Min. Stok</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) =>
                  handleInputChange("minStock", Number(e.target.value))
                }
                className="bg-white/10 border-purple-300 text-white"
              />
            </div>
          </div>

          {/* Tombol Aksi */}
          <DialogFooter className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-white border-gray-400 hover:bg-gray-700"
            >
              <X className="w-4 h-4 mr-2" /> Batal
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" /> Simpan
            </Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
