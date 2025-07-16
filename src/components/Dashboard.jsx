
import React from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, TrendingUp, DollarSign, BarChart3, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Dashboard = ({ items }) => {
  const totalItems = items.length;
  const totalStock = items.reduce((sum, item) => sum + item.stock, 0);
  const totalValue = items.reduce((sum, item) => sum + (item.stock * item.price), 0);
  const lowStockItems = items.filter(item => item.stock <= item.minStock);
  const outOfStockItems = items.filter(item => item.stock === 0);
  
  const categories = [...new Set(items.map(item => item.category))];
  const categoryStats = categories.map(category => {
    const categoryItems = items.filter(item => item.category === category);
    return {
      name: category,
      count: categoryItems.length,
      stock: categoryItems.reduce((sum, item) => sum + item.stock, 0),
      value: categoryItems.reduce((sum, item) => sum + (item.stock * item.price), 0)
    };
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`bg-gradient-to-br ${color} border-0 text-white`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium opacity-90">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 opacity-90" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs opacity-75 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              <span>{trend}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Item"
          value={totalItems}
          icon={Package}
          color="from-blue-500 to-blue-600"
          subtitle="Jenis barang"
        />
        
        <StatCard
          title="Total Stok"
          value={totalStock.toLocaleString('id-ID')}
          icon={BarChart3}
          color="from-emerald-500 to-emerald-600"
          subtitle="Unit tersedia"
        />
        
        <StatCard
          title="Nilai Inventory"
          value={formatCurrency(totalValue)}
          icon={DollarSign}
          color="from-purple-500 to-purple-600"
          subtitle="Total nilai stok"
        />
        
        <StatCard
          title="Stok Rendah"
          value={lowStockItems.length}
          icon={AlertTriangle}
          color="from-orange-500 to-orange-600"
          subtitle="Perlu restock"
        />
      </div>

      {/* Alerts Section */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Peringatan Stok
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {outOfStockItems.length > 0 && (
                <div>
                  <h4 className="text-red-300 font-medium mb-2">Stok Habis ({outOfStockItems.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {outOfStockItems.map(item => (
                      <Badge key={item.id} variant="destructive">
                        {item.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {lowStockItems.filter(item => item.stock > 0).length > 0 && (
                <div>
                  <h4 className="text-yellow-300 font-medium mb-2">
                    Stok Rendah ({lowStockItems.filter(item => item.stock > 0).length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {lowStockItems.filter(item => item.stock > 0).map(item => (
                      <Badge key={item.id} className="bg-yellow-600 text-white">
                        {item.name} ({item.stock})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white/10 border-purple-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Breakdown per Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.map((category, index) => (
                <motion.div
                  key={category.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-4 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-lg border border-purple-400/30"
                >
                  <h4 className="text-white font-semibold mb-2">{category.name}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-purple-200">
                      <span>Item:</span>
                      <span className="text-white font-medium">{category.count}</span>
                    </div>
                    <div className="flex justify-between text-purple-200">
                      <span>Stok:</span>
                      <span className="text-white font-medium">{category.stock.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-purple-200">
                      <span>Nilai:</span>
                      <span className="text-white font-medium">{formatCurrency(category.value)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-white/10 border-purple-300 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              Item Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items
                .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
                .slice(0, 5)
                .map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-purple-300 text-sm">{item.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">Stok: {item.stock}</p>
                      <p className="text-purple-300 text-sm">
                        {new Date(item.lastUpdated).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
