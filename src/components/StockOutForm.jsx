import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Save, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const StockOutForm = ({ onSubmit, onClose, items }) => {
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: 1,
    reason: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const reasons = [
    'Penjualan',
    'Rusak/Expired',
    'Hilang',
    'Return/Retur',
    'Sample/Demo',
    'Transfer Gudang',
    'Lainnya'
  ];

  const validateForm = () => {
    const newErrors = {};
    const selectedItem = items.find(item => item.id === formData.itemId);

    if (!formData.itemId) {
      newErrors.itemId = 'Item wajib dipilih';
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Jumlah harus lebih dari 0';
    }

    if (selectedItem && formData.quantity > selectedItem.stock) {
      newErrors.quantity = `Stok tidak mencukupi (tersedia: ${selectedItem.stock})`;
    }

    if (!formData.reason) {
      newErrors.reason = 'Alasan wajib dipilih';
    }

    if (!formData.date) {
      newErrors.date = 'Tanggal wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const selectedItem = items.find(item => item.id === formData.itemId);
      const stockOutData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        item: selectedItem,
        timestamp: new Date().toISOString()
      };

      onSubmit(stockOutData);

      toast({
        title: 'Stok Keluar Berhasil! 📦',
        description: `${selectedItem.name} - ${formData.quantity} unit`
      });
    } else {
      toast({
        title: 'Error Validasi! ❌',
        description: 'Mohon periksa kembali data yang diisi',
        variant: 'destructive'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedItem = items.find(item => item.id === formData.itemId);

  return (
    <DialogContent className="max-w-lg bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2">
          <Package className="w-5 h-5" />
          Form Barang Keluar
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
            <Label className="text-purple-200">Item Barang *</Label>
            <Select
              value={formData.itemId?.toString()}
              onValueChange={value =>
                handleInputChange('itemId', parseInt(value))
              }
            >
              <SelectTrigger className="bg-white/10 border-purple-300 text-white">
                <SelectValue placeholder="Pilih item barang" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-purple-500">
                {items.map(item => (
                  <SelectItem
                    key={item.id}
                    value={item.id.toString()}
                    className="text-white hover:bg-purple-700"
                  >
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      <span className="text-xs text-purple-300">
                        Stok: {item.stock} | {item.category}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.itemId && (
              <p className="text-red-400 text-sm">{errors.itemId}</p>
            )}
          </div>

          {selectedItem && (
            <div className="bg-purple-800/30 p-3 rounded-lg">
              <p className="text-purple-200 text-sm">Item Terpilih:</p>
              <p className="text-white font-medium">{selectedItem.name}</p>
              <p className="text-purple-300 text-sm">
                Stok Tersedia: {selectedItem.stock}
              </p>
              <p className="text-purple-300 text-sm">
                Kategori: {selectedItem.category}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-purple-200">
              Jumlah Keluar *
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={selectedItem?.stock || 999}
              value={formData.quantity}
              onChange={e =>
                handleInputChange('quantity', parseInt(e.target.value))
              }
              placeholder="0"
              className="bg-white/10 border-purple-300 text-white placeholder:text-purple-300"
            />
            {errors.quantity && (
              <p className="text-red-400 text-sm">{errors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-purple-200">Alasan Keluar *</Label>
            <Select
              value={formData.reason}
              onValueChange={value => handleInputChange('reason', value)}
            >
              <SelectTrigger className="bg-white/10 border-purple-300 text-white">
                <SelectValue placeholder="Pilih alasan" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-purple-500">
                {reasons.map(reason => (
                  <SelectItem
                    key={reason}
                    value={reason}
                    className="text-white hover:bg-purple-700"
                  >
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.reason && (
              <p className="text-red-400 text-sm">{errors.reason}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-purple-200">
              Keterangan Tambahan
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={e =>
                handleInputChange('description', e.target.value)
              }
              placeholder="Keterangan tambahan (opsional)"
              className="bg-white/10 border-purple-300 text-white placeholder:text-purple-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-purple-200">
              Tanggal *
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={e => handleInputChange('date', e.target.value)}
                className="pl-10 bg-white/10 border-purple-300 text-white"
              />
            </div>
            {errors.date && (
              <p className="text-red-400 text-sm">{errors.date}</p>
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
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Simpan
          </Button>
        </div>
      </motion.form>
    </DialogContent>
  );
};

export default StockOutForm;
