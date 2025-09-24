import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, Package, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { variantCategoryMap } from '@/data/variantCategoryMap';
import { variantImageMap } from '@/data/variantImageMap';


const StockTable = ({
  items,
  onEdit,
  onDelete,
  selectedCategory,
  isAdmin
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
      'Hair Care': '💇',
      'Vial 3ml Classic': '🧪',
      'Vial 3ml Eksklusif': '🔮',
      'Vial 2ml': '🥼',
      'Roll On 10ml': '🧴',
    };
    return iconMap[category] || '📦';
  };

  if (!items || items.length === 0) {
    return (
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
            : 'Coba pilih kategori lain atau tambahkan item baru'}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-300 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-purple-600/50">
            <tr>
              <th className="px-4 py-3 text-left text-white font-semibold">No</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Tanggal</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Kategori</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Foto</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Varian</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Kode Barcode</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Stock</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Price</th>
              <th className="px-4 py-3 text-left text-white font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {items.map((item, index) => {
                const stock = typeof item.stock === 'number' ? item.stock : 0;
                const stockStatus = getStockStatus(stock, item.minStock);

               // Ambil kategori dari variantCategoryMap
const variantData = variantCategoryMap[item.code] || {};
const categoryName = item.category || variantData.category || 'Tidak Ada Kategori';
const categoryIcon = getCategoryIcon(categoryName);

// Ambil foto dari variantImageMap berdasarkan varian
const imageSrc = variantImageMap[item.name] || '/images/default.jpg';
console.log("Image source for", item.name, ":", imageSrc);



                return (
                  <motion.tr
                    key={item.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-purple-300/30 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4 text-white font-medium">{index + 1}</td>
                    <td className="px-4 py-4 text-purple-200">{formatDate(item.lastUpdated)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryIcon}</span>
                        <span className="text-white text-sm">{categoryName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <img
                        src={imageSrc}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded border border-purple-400/50"
                      />
                    </td>
                    <td className="px-4 py-4 text-white font-medium">{item.name}</td>
                    <td className="px-4 py-4">
                      <code className="text-purple-200 bg-black/20 px-2 py-1 rounded text-sm">{item.barcode}</code>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${stockStatus.color} text-white text-xs`}>
                            {stockStatus.text}
                          </Badge>
                          <span className="text-white font-bold">{stock}</span>
                        </div>
                        {!isAdmin && (
                          <div className="flex items-center gap-1 text-purple-400">
                            <Lock className="w-3 h-3" />
                            <span className="text-xs">Admin Only</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-white font-medium">
                      Rp {item.price?.toLocaleString('id-ID') || '-'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(item)}
                          className="border-blue-300 text-blue-100 hover:bg-blue-800 p-1 h-7 w-7"
                          disabled={!isAdmin}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDelete(item)}
                          className="border-red-300 text-red-100 hover:bg-red-800 p-1 h-7 w-7"
                          disabled={!isAdmin}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 bg-purple-600/30 border-t border-purple-300/30">
        <div className="flex justify-between items-center">
          <p className="text-purple-200 text-sm">Total: {items.length} item</p>
          {!isAdmin && (
            <p className="text-purple-300 text-xs flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Login admin untuk akses penuh
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StockTable;
