import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/format';
import { supabase } from '../lib/supabase';

const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'cart' | 'address' | 'payment'>('cart');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0 && step === 'cart') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
        <p className="mb-4">Tu carrito está vacío</p>
        <button 
          onClick={() => navigate('/home')}
          className="px-6 py-2 bg-yellow-500 text-gray-900 rounded-lg font-bold"
        >
          Ir a comprar
        </button>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) {
        // Requirement implies linking to UID. If guest, strict requirement might fail.
        // I'll redirect to login or allow guest if I handle anonymous orders (but requirement says "linked to UID").
        // I will prompt for login.
        navigate('/login?redirect=cart');
        return;
    }
    setStep('address');
  };

  const handlePlaceOrder = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
        items: items, // JSONB
        total: total,
        status: 'pending',
        shipping_address: address,
      });

      if (error) throw error;

      clearCart();
      navigate('/success');
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Hubo un error al procesar tu pedido. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24">
      <h1 className="text-2xl font-bold mb-6 text-white">
        {step === 'cart' && 'Mi Carrito'}
        {step === 'address' && 'Dirección de Entrega'}
        {step === 'payment' && 'Método de Pago'}
      </h1>

      {step === 'cart' && (
        <>
          <div className="space-y-4 mb-8">
            {items.map((item) => (
              <div key={item.id} className="flex bg-gray-800 p-3 rounded-xl border border-gray-700">
                <img 
                  src={item.image_url || 'https://via.placeholder.com/100'} 
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-700"
                />
                <div className="flex-1 ml-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <p className="text-yellow-500 font-bold">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-gray-900 rounded-lg p-1 h-8">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 px-2 text-gray-400 hover:text-white"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 px-2 text-gray-400 hover:text-white"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 p-2 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-20 left-0 w-full px-4 max-w-md mx-auto">
             <div className="bg-gray-800 p-4 rounded-xl shadow-2xl border border-gray-700">
                <div className="flex justify-between mb-4 text-lg font-bold">
                    <span>Total</span>
                    <span className="text-yellow-500">{formatCurrency(total)}</span>
                </div>
                <button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-2"
                >
                    <span>Continuar</span>
                    <ArrowRight size={20} />
                </button>
             </div>
          </div>
        </>
      )}

      {step === 'address' && (
        <div className="space-y-6">
           <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <label className="block text-gray-400 mb-2 text-sm">Dirección completa</label>
              <textarea 
                 value={address}
                 onChange={(e) => setAddress(e.target.value)}
                 placeholder="Calle, Número, Piso, Referencias..."
                 className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-500 outline-none h-32"
              />
           </div>
           
           <button
              disabled={!address.trim()}
              onClick={() => setStep('payment')}
              className="w-full bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
           >
              Continuar al Pago
           </button>
           <button onClick={() => setStep('cart')} className="w-full text-gray-400 py-3">Volver</button>
        </div>
      )}

      {step === 'payment' && (
          <div className="space-y-6">
             <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                <p className="text-gray-300 mb-4">Monto a pagar</p>
                <p className="text-3xl font-bold text-yellow-500 mb-8">{formatCurrency(total)}</p>
                
                <div className="space-y-3">
                   <div className="flex items-center p-4 bg-gray-900 rounded-lg border border-yellow-500/50">
                      <CreditCard className="text-yellow-500 mr-3" />
                      <span className="text-white">Pago en Efectivo / QR al recibir</span>
                   </div>
                   {/* More methods could be added */}
                </div>
             </div>

             <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg flex items-center justify-center"
             >
                {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
             </button>
             <button onClick={() => setStep('address')} className="w-full text-gray-400 py-3">Volver</button>
          </div>
      )}
    </div>
  );
};

export default CartPage;
