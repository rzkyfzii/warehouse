import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import CategorySidebar from '@/components/CategorySidebar';
import StockTable from '@/components/StockTable';

const InventoryView = ({
  items,
  categories,
  onUpdateStock,
  onDeleteItem,
  isAdmin,
  setItems,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockAdjustments, setStockAdjustments] = useState({});
  const { toast } = useToast();

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.barcode.includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleStockAdjustment = (itemId, adjustment) => {
    if (!isAdmin) {
      toast({
        title: 'Akses Ditolak! 🔒',
        description: 'Hanya admin yang dapat mengubah stok',
        variant: 'destructive',
      });
      return;
    }

    const currentAdjustment = stockAdjustments[itemId] || 0;
    const newAdjustment = currentAdjustment + adjustment;

    setStockAdjustments((prev) => ({
      ...prev,
      [itemId]: newAdjustment,
    }));
  };

  const applyStockAdjustment = (item) => {
    if (!isAdmin) {
      toast({
        title: 'Akses Ditolak! 🔒',
        description: 'Hanya admin yang dapat mengubah stok',
        variant: 'destructive',
      });
      return;
    }

    const adjustment = stockAdjustments[item.id] || 0;
    if (adjustment !== 0) {
      const newStock = Math.max(0, item.stock + adjustment);

      fetch(`http://localhost:3001/items/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === 'success') {
            setItems((prev) =>
              prev.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      stock: newStock,
                      lastUpdated: new Date().toISOString(),
                    }
                  : i
              )
            );

            setStockAdjustments((prev) => ({
              ...prev,
              [item.id]: 0,
            }));

            toast({
              title: "Stok Diperbarui! ✅",
              description: `${item.name}: ${item.stock} → ${newStock}`,
            });
          } else {
            toast({
              title: "Gagal Update",
              description: data.message || "Respons tidak valid dari server",
              variant: "destructive",
            });
          }
        })
        .catch((err) => {
          console.error('Gagal update stok:', err);
          toast({
            title: 'Gagal',
            description: 'Tidak bisa terhubung ke server',
            variant: 'destructive',
          });
        });
    }
  };

  const handleEdit = (item) => {
    toast({
      title:
        '🚧 Fitur ini belum diimplementasikan—tapi bisa ditambahkan nanti!',
    });
  };

  const handleDelete = (item) => {
    if (!isAdmin) {
      toast({
        title: 'Akses Ditolak! 🔒',
        description: 'Hanya admin yang dapat menghapus item',
        variant: 'destructive',
      });
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus ${item.name}?`)) {
      onDeleteItem(item.id);
    }
  };

    // Ambil emoji kategori
  const getCategoryIcon = (category) => {
    const found = categories.find(
      cat => cat.value === category || cat.label === category
    );
    return found ? found.icon : "📦";
  };

  // Tambahkan icon dan totalValue ke setiap item
  const enrichedItems = filteredItems.map(item => ({
    ...item,
    icon: getCategoryIcon(item.category),
    totalValue: (item.stock || 0) * (item.price || 0)
  }));

  // Hitung total inventory
  const totalInventoryValue = enrichedItems.reduce(
    (sum, item) => sum + item.totalValue,
    0
  );


  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 px-4">
      <div className="lg:w-1/4">
        <CategorySidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          items={items}
        />
      </div>

      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <div className="relative w-full max-w-md mx-auto lg:mx-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari berdasarkan nama, barcode, atau kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-purple-300 text-white placeholder:text-purple-200 w-full"
            />
          </div>
        </motion.div>

        <StockTable
  items={enrichedItems}
  stockAdjustments={stockAdjustments}
  onStockAdjustment={handleStockAdjustment}
  onApplyAdjustment={applyStockAdjustment}
  onEdit={handleEdit}
  onDelete={handleDelete}
  selectedCategory={selectedCategory}
  isAdmin={isAdmin}
/>

{/* Total Nilai Inventory */}
<div className="mt-4 p-4 bg-purple-800/40 border border-purple-500/50 rounded-lg text-white">
  <p className="text-lg font-bold">
    💰 Total Nilai Inventory: Rp {totalInventoryValue.toLocaleString('id-ID')}
  </p>
</div>

      </div>
    </div>
  );
};

export default InventoryView;
