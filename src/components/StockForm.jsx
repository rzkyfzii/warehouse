import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const StockForm = ({ onSubmit, onClose, initialData = null }) => {
  const [formData, setFormData] = useState({
    category: initialData?.category || '',
    name: initialData?.name || '',
    barcode: initialData?.barcode || '',
    stock: initialData?.stock || 0
  });
  
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const categories = [
    { value: 'Parfum - Eksklusif', label: 'Parfum Eksklusif', icon: '💎' },
    { value: 'Parfum - Classic', label: 'Parfum Classic', icon: '🌹' },
    { value: 'Parfum - Sanju', label: 'Parfum Sanju', icon: '🌸' },
    { value: 'Parfum - Balinese', label: 'Parfum Balinese', icon: '🌺' },
    { value: 'Parfum - Ocassion', label: 'Parfum Ocassion', icon: '💫' },
    { value: 'Body Spray - Aerosols', label: 'Body Spray Aerosols', icon: '💨' },
    { value: 'Home Care - Diffuser', label: 'Home Care Diffuser', icon: '🏠' },
    { value: 'Hair Care', label: 'Hair Care', icon: '💇' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category) {
      newErrors.category = 'Kategori wajib dipilih';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Varian wajib diisi';
    }
    
    if (!formData.barcode.trim()) {
      newErrors.barcode = 'Kode Barcode wajib diisi';
    }
    
    if (formData.stock < 0) {
      newErrors.stock = 'Stock tidak boleh negatif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        stock: parseInt(formData.stock),
        minStock: 0,
        price: 0,
        location: 'Gudang A-1'
      };
      
      onSubmit(submitData);
      
      toast({
        title: "Berhasil! 🎉",
        description: `${formData.name} telah ${initialData ? 'diperbarui' : 'ditambahkan'}`,
      });
    } else {
      toast({
        title: "Error Validasi! ❌",
        description: "Mohon periksa kembali data yang diisi",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generateBarcode = () => {
    const barcode = Date.now().toString();
    handleInputChange('barcode', barcode);
    toast({
      title: "Barcode Dibuat! 🏷️",
      description: `Barcode baru: ${barcode}`,
    });
  };

  return (
    <DialogContent className="max-w-lg bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2">
          <Package className="w-5 h-5" />
          {initialData ? 'Edit Item' : 'Tambah Item Baru'}
        </DialogTitle>
      </DialogHeader>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-purple-200">Kategori *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger className="bg-white/10 border-purple-300 text-white">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-purple-500">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-white hover:bg-purple-700">
                    <span className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-red-400 text-sm">{errors.category}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-purple-200">
              Varian *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Masukkan varian produk"
              className="bg-white/10 border-purple-300 text-white placeholder:text-purple-300"
            />
            {errors.name && (
              <p className="text-red-400 text-sm">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode" className="text-purple-200">
              Kode Barcode *
            </Label>
            <div className="flex gap-2">
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                placeholder="Masukkan kode barcode"
                className="bg-white/10 border-purple-300 text-white placeholder:text-purple-300"
              />
              <Button
                type="button"
                onClick={generateBarcode}
                variant="outline"
                className="border-purple-300 text-purple-100 hover:bg-purple-800 whitespace-nowrap"
              >
                Generate
              </Button>
            </div>
            {errors.barcode && (
              <p className="text-red-400 text-sm">{errors.barcode}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock" className="text-purple-200">
              Stock *
            </Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
              placeholder="0"
              className="bg-white/10 border-purple-300 text-white placeholder:text-purple-300"
            />
            {errors.stock && (
              <p className="text-red-400 text-sm">{errors.stock}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="border-red-300 text-red-100 hover:bg-red-800"
          >
            <X className="w-4 h-4 mr-2" />
            Batal
          </Button>
          
          <Button
            type="submit"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {initialData ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </motion.form>
    </DialogContent>
  );
};

export default StockForm;