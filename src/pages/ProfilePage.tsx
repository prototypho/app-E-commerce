import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { Order } from '../types';
import { formatCurrency } from '../utils/format';
import { LogOut, Package, User as UserIcon, Camera } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (data) setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [profile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Debes seleccionar una imagen para subir.');
      }

      if (!profile) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get Public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profile in DB
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Force refresh/update context (In a real app, you might update a local state or refetch context)
      // Since context listens to auth changes, we might need to manually trigger a fetch or just reload window for simplicity in this MVP
      window.location.reload(); 

    } catch (error: any) {
      alert('Error actualizando avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pb-24">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 relative group">
           <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-yellow-500 transition-colors">
              {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                  <UserIcon size={32} className="text-gray-400" />
              )}
           </div>
           
           {/* Overlay Button */}
           <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
               <Camera size={20} className="text-white" />
               <input 
                 type="file" 
                 accept="image/*" 
                 className="hidden" 
                 onChange={handleAvatarUpload}
                 disabled={uploading}
               />
           </label>
           
           {uploading && (
             <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-full">
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
           )}
        </div>
        <div>
           <h1 className="text-xl font-bold text-white">{profile?.full_name || 'Usuario'}</h1>
           <p className="text-gray-400 text-sm">{profile?.email}</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-8">
        {profile?.role === 'admin' && (
          <button 
             onClick={() => window.location.hash = '/admin'}
             className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg transition-colors shadow-lg"
          >
             <Package size={18} />
             <span>Admin Panel</span>
          </button>
        )}
        <button 
           onClick={() => signOut()}
           className="flex items-center space-x-2 bg-gray-800 hover:bg-red-500/10 text-red-400 px-4 py-2 rounded-lg transition-colors border border-gray-700"
        >
           <LogOut size={18} />
           <span>Cerrar Sesión</span>
        </button>
      </div>

      <h2 className="text-lg font-bold text-white mb-4 flex items-center">
         <Package className="mr-2 text-yellow-500" size={20} />
         Mis Pedidos
      </h2>

      {loading ? (
        <p className="text-gray-400">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center text-gray-400">
           No has realizado pedidos aún.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-400">ID: {order.id.slice(0, 8)}...</span>
                <span className={`text-xs px-2 py-1 rounded-full capitalize font-bold ${
                   order.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                   order.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                   'bg-yellow-500/20 text-yellow-500'
                }`}>
                   {order.status}
                </span>
              </div>
              <p className="text-white font-bold text-lg mb-1">{formatCurrency(order.total)}</p>
              <div className="flex justify-between items-end">
                <p className="text-sm text-gray-400">
                   {new Date(order.created_at || '').toLocaleDateString()}
                </p>
                
                {order.status === 'pending' && (
                  <button
                    onClick={async () => {
                      if (!confirm('¿Estás seguro de que deseas cancelar este pedido?')) return;
                      
                      const { error } = await supabase
                        .from('orders')
                        .update({ status: 'cancelled' })
                        .eq('id', order.id);

                      if (error) {
                        alert('Error al cancelar el pedido');
                      } else {
                        // Optimistic update
                        setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
                      }
                    }}
                    className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-3 py-1 rounded-lg transition-colors"
                  >
                    Cancelar Pedido
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
