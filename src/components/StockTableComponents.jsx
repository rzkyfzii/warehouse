import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Plus, Minus, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const StockTableHeader = () => (
  <thead className="bg-purple-600/50">
    <tr>
      <th className="px-4 py-3 text-left text-white font-semibold">No</th>
      <th className="px-4 py-3 text-left text-white font-semibold">Tanggal</th>
      <th className="px-4 py-3 text-left text-white font-semibold">Kategori</th>
      <th className="px-4 py-3 text-left text-white font-semibold">Varian</th>
      <th className="px-4 py-3 text-left text-white font-semibold">Kode Barcode</th>
      <th className="px-4 py-3 text-left text-white font-semibold">Stock</th>
      <th className="px-4 py-3 text-left text-white font-semibold">Aksi</th>
    </tr>
  </thead>
);

export const StockTableRow = ({ 
  item, 
  index, 
  stockAdjustments, 
  onStockAdjustment, 
  onApplyAdjustment, 
  onEdit, 
  onDelete 
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStockStatus = (current, minimum) => {
    if (current === 0) return { color: 'bg-red-500', text: 'Habis' };
    if (current <= minimum) return { color: 'bg-yellow-500', text: 'Rendah' };
    return { color: 'bg-green-500', text: 'Baik' };
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

  const stockStatus = getStockStatus(item.stock, item.minStock);
  const adjustment = stockAdjustments[item.id] || 0;
  const categoryIcon = getCategoryIcon(item.category);

  return (
    <motion.tr
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-purple-300/30 hover:bg-white/5 transition-colors"
    >
      <td className="px-4 py-4 text-white font-medium">
        {index + 1}
      </td>
      
      <td className="px-4 py-4 text-purple-200">
        {formatDate(item.lastUpdated)}
      </td>
      
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{categoryIcon}</span>
          <span className="text-white text-sm">{item.category}</span>
        </div>
      </td>
      
      <td className="px-4 py-4 text-white font-medium">
        {item.name}
      </td>
      
      <td className="px-4 py-4">
        <code className="text-purple-200 bg-black/20 px-2 py-1 rounded text-sm">
          {item.barcode}
        </code>
      </td>
      
      <td className="px-4 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className={`${stockStatus.color} text-white text-xs`}>
              {stockStatus.text}
            </Badge>
            <span className="text-white font-bold">
              {item.stock}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStockAdjustment(item.id, -1)}
              className="border-red-300 text-red-100 hover:bg-red-800 p-1 h-6 w-6"
            >
              <Minus className="w-3 h-3" />
            </Button>
            
            <span className="text-white text-sm min-w-[2rem] text-center">
              {adjustment !== 0 && (
                <span className={adjustment > 0 ? 'text-green-400' : 'text-red-400'}>
                  {adjustment > 0 ? '+' : ''}{adjustment}
                </span>
              )}
            </span>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStockAdjustment(item.id, 1)}
              className="border-green-300 text-green-100 hover:bg-green-800 p-1 h-6 w-6"
            >
              <Plus className="w-3 h-3" />
            </Button>
            
            {adjustment !== 0 && (
              <Button
                size="sm"
                onClick={() => onApplyAdjustment(item)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-xs px-2 py-1 h-6 ml-1"
              >
                Apply
              </Button>
            )}
          </div>
        </div>
      </td>
      
      <td className="px-4 py-4">
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(item)}
            className="border-blue-300 text-blue-100 hover:bg-blue-800 p-1 h-7 w-7"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(item)}
            className="border-red-300 text-red-100 hover:bg-red-800 p-1 h-7 w-7"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </td>
    </motion.tr>
  );
};

export const EmptyState = ({ selectedCategory }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-lg border border-purple-300"
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