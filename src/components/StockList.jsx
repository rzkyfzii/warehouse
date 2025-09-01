import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Edit, Trash2, AlertTriangle, MapPin, Calendar, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import StockForm from '@/components/StockForm';

const StockList = ({ items, onUpdateStock, onDeleteItem, selectedCategory }) => {
  const [editingItem, setEditingItem] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [stockAdjustments, setStockAdjustments] = useState({});
  const { toast } = useToast();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatus = (current, minimum) => {
    if (current === 0) return { status: 'out', color: 'bg-red-500', text: 'Habis' };
    if (current <= minimum) return { status: 'low', color: 'bg-yellow-500', text: 'Rendah' };
    return { status: 'good', color: 'bg-green-500', text: 'Baik' };
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'Parfum - Eksklusif': '💎',
      'Parfum - Classic': '🌹',
      'Parfum - Sanju': '🌸',
      'Parfum - Balinese': '🌺',
      'Parfum - Ocassion': '💫',
      'Body Spray - Aerosols': '💨',
      'Home Care - Diffuser': '🏠',
      'Hair Care': '💇'
    };
    return iconMap[category] || '📦';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'Parfum - Eksklusif': 'from-yellow-500 to-amber-500',
      'Parfum - Classic': 'from-rose-500 to-pink-500',
      'Parfum - Sanju': 'from-purple-500 to-violet-500',
      'Parfum - Balinese': 'from-emerald-500 to-teal-500',
      'Parfum - Ocassion': 'from-blue-500 to-cyan-500',
      'Body Spray - Aerosols': 'from-gray-500 to-slate-500',
      'Home Care - Diffuser': 'from-orange-500 to-red-500',
      'Hair Care': 'from-indigo-500 to-purple-500'
    };
    return colorMap[category] || 'from-purple-500 to-pink-500';
  };

  const handleStockAdjustment = (itemId, adjustment) => {
    const currentAdjustment = stockAdjustments[itemId] || 0;
    const newAdjustment = currentAdjustment + adjustment;
    
    setStockAdjustments(prev => ({
      ...prev,
      [itemId]: newAdjustment
    }));
  };

  const applyStockAdjustment = (item) => {
    const adjustment = stockAdjustments[item.id] || 0;
    if (adjustment !== 0) {
      const newStock = Math.max(0, item.stock + adjustment);
      onUpdateStock(item.id, newStock);
      setStockAdjustments(prev => ({
        ...prev,
        [item.id]: 0
      }));
      
      toast({
        title: "Stok Diperbarui! ✅",
        description: `${item.name}: ${item.stock} → ${newStock}`,
      });
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowEditForm(true);
  };

  const handleEditSubmit = (updatedData) => {
    const updatedItem = { ...editingItem, ...updatedData };
    toast({
      title: "🚧 Fitur ini belum diimplementasikan—tapi jangan khawatir! Anda bisa memintanya di prompt berikutnya! 🚀",
    });
    setShowEditForm(false);
    setEditingItem(null);
  };

  const handleDelete = (item) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus ${item.name}?`)) {
      onDeleteItem(item.id);
    }
  };

  const groupedItems = items.reduce((groups, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <Package className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          {selectedCategory === 'all' ? 'Belum Ada Item' : 'Tidak Ada Item di Kategori Ini'}
        </h3>
        <p className="text-purple-200">
          {selectedCategory === 'all' 
            ? 'Mulai dengan menambahkan item pertama atau scan barcode'
            : 'Coba pilih kategori lain atau tambahkan item baru'
          }
        </p>
      </motion.div>
    );
  }

  if (selectedCategory !== 'all') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {items.map((item, index) => {
            const stockStatus = getStockStatus(item.stock, item.minStock);
            const adjustment = stockAdjustments[item.id] || 0;
            const projectedStock = item.stock + adjustment;
            const categoryIcon = getCategoryIcon(item.category);
            const categoryColor = getCategoryColor(item.category);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/10 border-purple-300 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white text-lg mb-1 flex items-center gap-2">
                          <span className="text-xl">{categoryIcon}</span>
                          {item.name}
                        </CardTitle>
                        <p className="text-purple-200 text-sm font-mono">
                          {item.barcode}
                        </p>
                      </div>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                          className="border-blue-300 text-blue-100 hover:bg-blue-800 p-2"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item)}
                          className="border-red-300 text-red-100 hover:bg-red-800 p-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`bg-gradient-to-r ${categoryColor} text-white border-0`}>
                        {item.category}
                      </Badge>
                      <Badge variant="outline" className="border-purple-300 text-purple-100">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.location}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200">Stok:</span>
                        <div className="flex items-center gap-2">
                          <Badge className={`${stockStatus.color} text-white`}>
                            {stockStatus.text}
                          </Badge>
                          <span className="text-white font-bold">
                            {item.stock}
                          </span>
                        </div>
                      </div>
                      
                      {item.stock <= item.minStock && (
                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Min: {item.minStock}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-purple-200">Harga:</span>
                      <span className="text-white font-semibold">
                        {formatCurrency(item.price)}
                      </span>
                    </div>

                    <div className="space-y-2 p-3 bg-black/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-200 text-sm">Adjust Stok:</span>
                        {adjustment !== 0 && (
                          <span className={`text-sm font-medium ${adjustment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {adjustment > 0 ? '+' : ''}{adjustment}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStockAdjustment(item.id, -1)}
                          className="border-red-300 text-red-100 hover:bg-red-800 p-2"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        
                        <div className="flex-1 text-center">
                          <span className="text-white font-medium">
                            {projectedStock}
                          </span>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStockAdjustment(item.id, 1)}
                          className="border-green-300 text-green-100 hover:bg-green-800 p-2"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      {adjustment !== 0 && (
                        <Button
                          size="sm"
                          onClick={() => applyStockAdjustment(item)}
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                        >
                          Terapkan
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-purple-300 text-xs">
                      <Calendar className="w-3 h-3" />
                      <span>Update: {formatDate(item.lastUpdated)}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedItems).map(([category, categoryItems]) => {
        const categoryIcon = getCategoryIcon(category);
        const categoryColor = getCategoryColor(category);
        
        return (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={`flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r ${categoryColor} bg-opacity-20 border border-white/20`}>
              <span className="text-2xl">{categoryIcon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{category}</h2>
                <p className="text-white/80">{categoryItems.length} item</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {categoryItems.map((item, index) => {
                  const stockStatus = getStockStatus(item.stock, item.minStock);
                  const adjustment = stockAdjustments[item.id] || 0;
                  const projectedStock = item.stock + adjustment;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white/10 border-purple-300 backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-white text-lg mb-1">
                                {item.name}
                              </CardTitle>
                              <p className="text-purple-200 text-sm font-mono">
                                {item.barcode}
                              </p>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(item)}
                                className="border-blue-300 text-blue-100 hover:bg-blue-800 p-2"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(item)}
                                className="border-red-300 text-red-100 hover:bg-red-800 p-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="border-purple-300 text-purple-100">
                              <MapPin className="w-3 h-3 mr-1" />
                              {item.location}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-purple-200">Stok:</span>
                              <div className="flex items-center gap-2">
                                <Badge className={`${stockStatus.color} text-white`}>
                                  {stockStatus.text}
                                </Badge>
                                <span className="text-white font-bold">
                                  {item.stock}
                                </span>
                              </div>
                            </div>
                            
                            {item.stock <= item.minStock && (
                              <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Min: {item.minStock}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-purple-200">Harga:</span>
                            <span className="text-white font-semibold">
                              {formatCurrency(item.price)}
                            </span>
                          </div>

                          <div className="space-y-2 p-3 bg-black/20 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-purple-200 text-sm">Adjust Stok:</span>
                              {adjustment !== 0 && (
                                <span className={`text-sm font-medium ${adjustment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {adjustment > 0 ? '+' : ''}{adjustment}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStockAdjustment(item.id, -1)}
                                className="border-red-300 text-red-100 hover:bg-red-800 p-2"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              
                              <div className="flex-1 text-center">
                                <span className="text-white font-medium">
                                  {projectedStock}
                                </span>
                              </div>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStockAdjustment(item.id, 1)}
                                className="border-green-300 text-green-100 hover:bg-green-800 p-2"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            
                            {adjustment !== 0 && (
                              <Button
                                size="sm"
                                onClick={() => applyStockAdjustment(item)}
                                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                              >
                                Terapkan
                              </Button>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-purple-300 text-xs">
                            <Calendar className="w-3 h-3" />
                            <span>Update: {formatDate(item.lastUpdated)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}

      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        {editingItem && (
          <StockForm
            initialData={editingItem}
            onSubmit={handleEditSubmit}
            onClose={() => setShowEditForm(false)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default StockList;