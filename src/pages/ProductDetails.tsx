import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/format';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const controller = new AbortController();
    
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        if (!controller.signal.aborted) setProduct(data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;
  if (!product) return <div className="p-8 text-center text-gray-400">Producto no encontrado</div>;

  const handleAddToCart = () => {
    addItem(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="pb-24">
      <button 
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-gray-400 hover:text-white"
      >
        <ArrowLeft size={20} className="mr-1" />
        Volver
      </button>

      <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-700">
        <div className="aspect-video w-full bg-gray-700">
          <img
            src={product.image_url || 'https://via.placeholder.com/600?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-6">
            <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-bold text-white">{product.name}</h1>
                <span className="text-xl font-bold text-yellow-500">{formatCurrency(product.price)}</span>
            </div>
            
            <span className="inline-block px-3 py-1 bg-gray-700 text-xs rounded-full text-gray-300 mb-4">
                {product.category}
            </span>

            <p className="text-gray-400 mb-6 leading-relaxed">
                {product.description || 'Sin descripción disponible.'}
            </p>

            <div className="flex items-center justify-between mt-8">
                <div className="flex items-center bg-gray-900 rounded-lg p-1">
                    <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 text-gray-400 hover:text-white"
                    >
                        <Minus size={18} />
                    </button>
                    <span className="w-8 text-center font-bold">{quantity}</span>
                    <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 text-gray-400 hover:text-white"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                <button
                    onClick={handleAddToCart}
                    className="flex-1 ml-4 bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-transform"
                >
                    <ShoppingCart size={20} />
                    <span>Agregar ({formatCurrency(product.price * quantity)})</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
