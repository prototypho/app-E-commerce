import React, { useState, useMemo } from 'react';
import { Search, Plus } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/format';

const HomePage: React.FC = () => {
  const { products, loading, error } = useProducts();
  const { addItem } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Derive categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['Todos', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando productos...</div>;
  if (error) return <div className="p-8 text-center text-red-400">Error: {error}</div>;

  return (
    <div className="pb-24">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 placeholder-gray-500"
          placeholder="Buscar bebidas, snacks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto gap-3 mb-6 pb-2 scrollbar-hide">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-yellow-500 text-gray-900'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <h2 className="text-xl font-bold text-white mb-4">
        {selectedCategory === 'Todos' ? 'Destacados' : selectedCategory}
      </h2>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No se encontraron productos.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition-colors shadow-lg">
              <Link to={`/product/${product.id}`} className="block relative aspect-square bg-gray-700 flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                ) : (
                  <Plus size={40} className="text-gray-600 rotate-45" /> // Un icono de placeholder
                )}
              </Link>
              <div className="p-3">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-sm font-bold text-white line-clamp-2 min-h-[2.5em]">{product.name}</h3>
                </Link>
                <div className="flex justify-between items-end mt-2">
                  <span className="text-yellow-500 font-bold">{formatCurrency(product.price)}</span>
                  <button
                    onClick={() => addItem(product)}
                    className="w-8 h-8 bg-gray-700 hover:bg-yellow-500 hover:text-gray-900 rounded-full flex items-center justify-center text-yellow-500 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
