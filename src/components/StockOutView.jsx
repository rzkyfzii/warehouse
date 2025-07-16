import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Download, Package, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StockOutView = ({ stockOutRecords }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedReason, setSelectedReason] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Ambil alasan unik dari data stockOutRecords
const uniqueReasons = Array.from(
  new Set(stockOutRecords.map(r => r.reason).filter(Boolean))
);

// Mapping label (opsional, untuk mempercantik tampilan label dropdown)
const reasonLabels = {
  'Retur': 'Retur',
  'Rusak': 'Rusak',
  'Expired': 'Expired',
  'Kehilangan': 'Kehilangan',
  'Pameran': 'Pameran',
  'OnlineShop': 'OnlineShop',
  'Lainnya': 'Lainnya'
};

// Buat array alasan untuk dropdown
const reasons = [
  { value: 'all', label: 'Semua Alasan' },
  ...uniqueReasons.map(reason => ({
    value: reason,
    label: reasonLabels[reason] || reason
  }))
];


console.log('Semua Data stockOutRecords:', stockOutRecords);
if (stockOutRecords.length > 0) {
  console.log('🧪 Contoh record pertama:', stockOutRecords[0]);
}
 const filteredRecords = stockOutRecords.filter(record => {
  if (!record.date || isNaN(new Date(record.date))) return false;

  const recordMonth = new Date(record.date).toISOString().slice(0, 7);
  const matchesMonth = recordMonth === selectedMonth;
  const matchesReason = selectedReason === 'all' || (record.reason && record.reason.trim() === selectedReason);
  const matchesSearch = record.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        record.description.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesMonth && matchesReason && matchesSearch;
});

// Letakkan log di sini, SETELAH filteredRecords selesai
console.log('Filtered Records Preview:', filteredRecords);
console.log('Available Reasons:', stockOutRecords.map(r => r.reason));


  const monthlyStats = filteredRecords.reduce((stats, record) => {
    stats.totalItems += record.quantity;
    stats.totalRecords += 1;
    stats.byReason[record.reason] = (stats.byReason[record.reason] || 0) + record.quantity;
    return stats;
  }, { totalItems: 0, totalRecords: 0, byReason: {} });

  const formatDate = (dateString) => {
    if (!dateString) return "–";
    const date = new Date(dateString);
    if (isNaN(date)) return "–";
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const exportPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(`Laporan Stok Keluar - ${selectedMonth}`, 14, 15);

  const headers = [['No', 'Tanggal', 'Nama Barang', 'Kategori', 'Qty', 'Alasan', 'Keterangan']];
  const body = filteredRecords.map((record, index) => [
    index + 1,
    formatDate(record.date),
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
    headStyles: { fillColor: [123, 104, 238] }, // ungu
  });

  // Tambahkan total di bawah
  const totalQty = filteredRecords.reduce((sum, r) => sum + r.quantity, 0);
  doc.setFontSize(11);
  doc.text(`Total Barang Keluar: ${totalQty}`, 14, doc.lastAutoTable.finalY + 10);

  doc.save(`laporan-stok-keluar-${selectedMonth}.pdf`);
};


  const getReasonColor = (reason) => {
    const colorMap = {
      'Retur': 'bg-green-500',
      'Rusak': 'bg-red-500',
      'Expired': 'bg-orange-500',
      'Kehilangan': 'bg-blue-500',
      'Pameran': 'bg-purple-500',
      'OnlineShop': 'bg-cyan-500',
      'Lainnya': 'bg-gray-500'
    };
    return colorMap[reason] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">📦 Laporan Stok Keluar</h2>
          <p className="text-purple-200">Monitor dan analisis barang keluar per bulan</p>
        </div>
        <Button onClick={exportPDF} className="bg-green-600 hover:bg-green-700 text-white">
    <Download className="w-4 h-4 mr-2" />
    Export PDF
  </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Total Item Keluar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-white font-bold">{monthlyStats.totalItems}</p>
            <p className="text-purple-200 text-sm">Bulan {selectedMonth}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Package className="w-5 h-5 text-blue-400" />
              Total Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl text-white font-bold">{monthlyStats.totalRecords}</p>
            <p className="text-purple-200 text-sm">Transaksi keluar</p>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-purple-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-green-400" />
              Periode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl text-white font-bold">
              {new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </p>
            <p className="text-purple-200 text-sm">Laporan bulanan</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="bg-white/10 p-6 rounded-lg border border-purple-300 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Filter & Pencarian</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-purple-200">Bulan</label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-white border-purple-300 bg-white/10"
            />
          </div>
          <div>
            <label className="text-sm text-purple-200">Alasan</label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className="text-white border-purple-300 bg-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-purple-500">
                {reasons.map(reason => (
                  <SelectItem key={reason.value} value={reason.value} className="text-white">
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-purple-200">Pencarian</label>
            <Input
              placeholder="Cari item atau keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-white border-purple-300 bg-white/10"
            />
          </div>
        </div>
      </div>

      {/* Statistik per alasan */}
      {Object.keys(monthlyStats.byReason).length > 0 && (
        <div className="bg-white/10 p-6 rounded-lg border border-purple-300 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-4">Statistik per Alasan</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(monthlyStats.byReason).map(([reason, count]) => (
              <div key={reason} className="text-center">
                <Badge className={`${getReasonColor(reason)} text-white mb-1`}>{reason}</Badge>
                <p className="text-2xl text-white font-bold">{count}</p>
                <p className="text-purple-200 text-sm">item</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white/10 rounded-lg border border-purple-300 overflow-hidden">
        <div className="p-4 border-b border-purple-300/30">
          <h3 className="text-lg font-semibold text-white">Riwayat Stok Keluar</h3>
        </div>
        {filteredRecords.length === 0 ? (
          <div className="text-center py-10">
            <Package className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl text-white font-semibold">Tidak Ada Data</h3>
            <p className="text-purple-200">Tidak ada transaksi sesuai filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Jumlah</th>
                  <th className="px-4 py-3 text-left">Alasan</th>
                  <th className="px-4 py-3 text-left">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, i) => (
                  <tr key={record.id} className="border-b border-purple-300/20 hover:bg-white/5">
                    <td className="px-4 py-3 text-white">{i + 1}</td>
                    <td className="px-4 py-3 text-purple-200">{formatDate(record.date)}</td>
                    <td className="px-4 py-3">
                      <p className="text-white">{record.item.name}</p>
                      <p className="text-purple-300 text-sm">{record.item.category}</p>
                    </td>
                    <td className="px-4 py-3 text-white font-bold">{record.quantity}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${getReasonColor(record.reason)} text-white`}>{record.reason}</Badge>
                    </td>
                    <td className="px-4 py-3 text-purple-200">{record.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockOutView;
