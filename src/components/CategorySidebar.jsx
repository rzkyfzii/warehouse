import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CategorySidebar = ({ categories, selectedCategory, onCategorySelect, items }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-64 bg-white/10 backdrop-blur-sm rounded-lg border border-purple-300 p-4"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Kategori</h3>
      
      <div className="space-y-2">
        {categories.map((category) => {
          const count = category.value === 'all' 
            ? items.length 
            : items.filter(item => item.category === category.value).length;
          
          return (
            <Button
              key={category.value}
              onClick={() => onCategorySelect(category.value)}
              variant={selectedCategory === category.value ? 'default' : 'ghost'}
              className={`w-full justify-start text-left ${
                selectedCategory === category.value
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'text-purple-100 hover:bg-purple-800/50'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              <span className="flex-1 truncate">
  {category.label === 'Parfum Follow Me' ? 'Parfum Ocassion' : category.label}
</span>

              <Badge 
                variant="secondary" 
                className={`ml-2 ${
                  selectedCategory === category.value
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default CategorySidebar;