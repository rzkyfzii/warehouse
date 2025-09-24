import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const CategoryManager = ({ categories, onAddCategory, onUpdateCategory, onDeleteCategory, onClose }) => {
  // ✅ pastikan categories selalu array
  const safeCategories = Array.isArray(categories) ? categories : [];

  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const { toast } = useToast();

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error! ❌",
        description: "Nama kategori wajib diisi",
        variant: "destructive"
      });
      return;
    }

    const categoryData = {
  id: Date.now(), // id unik
  value: newCategory.name,
  label: newCategory.name,
  icon: newCategory.icon || '📦'
};


    onAddCategory(categoryData);
    setNewCategory({ name: '', icon: '' });
    
    toast({
      title: "Kategori Berhasil Ditambahkan! 🎉",
      description: `${newCategory.name} telah ditambahkan`,
    });
  };

  const handleEditCategory = (category) => {
    setEditingCategory({
      ...category,
      name: category.label,
      icon: category.icon
    });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory.name.trim()) {
      toast({
        title: "Error! ❌",
        description: "Nama kategori wajib diisi",
        variant: "destructive"
      });
      return;
    }

    const updatedCategory = {
      ...editingCategory,
      value: editingCategory.name,
      label: editingCategory.name
    };

    onUpdateCategory(updatedCategory);
    setEditingCategory(null);
    
    toast({
      title: "Kategori Berhasil Diperbarui! ✅",
      description: `${editingCategory.name} telah diperbarui`,
    });
  };

  const handleDeleteCategory = (category) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${category.label}"?`)) {
      onDeleteCategory(category.id); // ✅ gunakan category.id, bukan value!
      
      toast({
        title: "Kategori Berhasil Dihapus! 🗑️",
        description: `${category.label} telah dihapus`,
      });
    }
  };

  const defaultCategories = [
    'Parfum - Eksklusif',
    'Parfum - Classic', 
    'Parfum - Sanju',
    'Parfum - Balinese',
    'Parfum - Ocassion',
    'Body Spray - Aerosols',
    'Home Care - Diffuser',
    'Hair Care',
    'Vial 3ml Classic',
    'Vial 3ml Eksklusif',
    'Vial 2ml',
    'Roll On 10ml',
  ];

  // ✅ gunakan safeCategories agar tidak error
  const customCategories = safeCategories.filter(cat => 
    cat.value !== 'all' && !defaultCategories.includes(cat.value)
  );

  return (
    <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900 to-purple-900 border-purple-500 max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-white flex items-center gap-2">
          <Tag className="w-5 h-5" />
          Kelola Kategori
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Tambah kategori */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-300 p-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Tambah Kategori Baru</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-purple-200">Nama Kategori</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama kategori"
                className="bg-white/10 border-purple-300 text-white placeholder:text-purple-300"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-purple-200">Icon (Emoji)</Label>
              <Input
                value={newCategory.icon}
                onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="📦"
                className="bg-white/10 border-purple-300 text-white placeholder:text-purple-300"
                maxLength={2}
              />
            </div>
          </div>
          
          <Button
            onClick={handleAddCategory}
            className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kategori
          </Button>
        </motion.div>

        {/* Kategori Default */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-300 p-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Kategori Default</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {safeCategories
              .filter(cat => cat.value !== 'all' && defaultCategories.includes(cat.value))
              .map((category, idx) => (
                <div
                  key={category.id || idx} // fallback index
                  className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{category.icon}</span>
                    <span className="text-white">{category.label}</span>
                  </div>
                  <span className="text-purple-300 text-sm">Default</span>
                </div>
            ))}
          </div>
        </motion.div>

        {/* Kategori Custom */}
        {customCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-300 p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Kategori Custom</h3>
            
            <div className="space-y-3">
              {customCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                >
                  {editingCategory && editingCategory.value === category.value ? (
                    <div className="flex-1 grid grid-cols-3 gap-2 mr-3">
                      <div className="col-span-2">
                        <Input
                          value={editingCategory.name}
                          onChange={(e) => setEditingCategory(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-white/10 border-purple-300 text-white text-sm"
                        />
                      </div>
                      <Input
                        value={editingCategory.icon}
                        onChange={(e) => setEditingCategory(prev => ({ ...prev, icon: e.target.value }))}
                        className="bg-white/10 border-purple-300 text-white text-sm"
                        maxLength={2}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-xl">{category.icon}</span>
                      <span className="text-white">{category.label}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-1">
                    {editingCategory && editingCategory.value === category.value ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleUpdateCategory}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 p-2"
                        >
                          ✓
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setEditingCategory(null)}
                          variant="outline"
                          className="border-red-300 text-red-100 hover:bg-red-800 p-2"
                        >
                          ✕
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                          className="border-blue-300 text-blue-100 hover:bg-blue-800 p-2"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCategory(category)}
                          className="border-red-300 text-red-100 hover:bg-red-800 p-2"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-purple-300 text-purple-100 hover:bg-purple-800"
          >
            Tutup
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default CategoryManager;
