import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Edit, Trash2, Plus, X, Image as ImageIcon } from 'lucide-react';

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    stock: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('name');
    if (data) setProducts(data);
    setLoading(false);
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image_url: product.image_url,
        stock: product.stock,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        image_url: '',
        stock: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, image_url: data.publicUrl }));
    } catch (error: any) {
      alert('Error cargando la imagen: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    } else {
      alert('Error al eliminar producto');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        // Update
        const { data, error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', editingProduct.id)
          .select()
          .single();
        
        if (error) throw error;
        if (data) {
          setProducts(products.map(p => p.id === editingProduct.id ? data : p));
        }
      } else {
        // Create
        const { data, error } = await supabase
          .from('products')
          .insert(formData)
          .select()
          .single();
        
        if (error) throw error;
        if (data) {
          setProducts([...products, data]);
        }
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert('Error al guardar el producto: ' + err.message);
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Cargando productos...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gestión de Productos</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-yellow-400"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
             <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
               {product.image_url ? (
                 <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <ImageIcon size={24} />
                 </div>
               )}
             </div>
             
             <div className="flex-1">
                <h3 className="text-white font-bold">{product.name}</h3>
                <p className="text-sm text-gray-400">{product.category} • Stock: {product.stock}</p>
             </div>

             <div className="text-right mr-4">
                <p className="text-yellow-500 font-bold">{formatCurrency(product.price)}</p>
             </div>

             <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenModal(product)}
                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                >
                   <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                   <Trash2 size={18} />
                </button>
             </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
           <div className="bg-gray-800 w-full max-w-lg rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900">
                 <h2 className="text-xl font-bold text-white">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                 </h2>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                    <X size={24} />
                 </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                    <input 
                      type="text" required 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Precio</label>
                        <input 
                          type="number" required min="0" step="100" // ARS logic often no decimals or large numbers
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                          className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Stock</label>
                        <input 
                          type="number" required min="0"
                          value={formData.stock}
                          onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                          className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                        />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Categoría</label>
                    <input 
                      type="text" required
                      value={formData.category} // Could be select: Bebidas, Snacks, etc.
                      onChange={e => setFormData({...formData, category: e.target.value})}
                      placeholder="Ej: Bebidas, Kiosco, Varios"
                      className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none"
                    />
                 </div>

                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none h-24"
                    />
                 </div>

                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Imagen del Producto</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="w-full bg-gray-900 text-white p-2 rounded border border-gray-600 focus:border-yellow-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-gray-900 hover:file:bg-yellow-400"
                    />
                    {uploading && <p className="text-sm text-yellow-500 mt-1">Subiendo imagen...</p>}
                    {formData.image_url && (
                        <div className="mt-2 relative w-full h-32 bg-gray-700 rounded-lg overflow-hidden">
                           <img src={formData.image_url} alt="Vista previa" className="w-full h-full object-cover" />
                        </div>
                    )}
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-yellow-500 text-gray-900 font-bold rounded-xl hover:bg-yellow-400"
                    >
                      Guardar
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
