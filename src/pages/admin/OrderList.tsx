import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Order } from '../../types';
import { formatCurrency } from '../../utils/format';


const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (!error) {
       setOrders(orders.map(o => o.id === id ? { ...o, status: status as any } : o));
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Cargando pedidos...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gestión de Pedidos</h1>
        {/* Placeholder for search */}
      </div>

      <div className="space-y-4">
         {orders.map((order) => (
             <div key={order.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between md:items-center">
                <div className="mb-4 md:mb-0">
                   <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-gray-500 bg-gray-900 px-2 py-1 rounded">
                         ID: {order.id.slice(0, 8)}
                      </span>
                      <span className="text-xs text-gray-400">
                         {new Date(order.created_at || '').toLocaleString()}
                      </span>
                   </div>
                   <p className="font-bold text-white text-lg">{formatCurrency(order.total)}</p>
                   <p className="text-sm text-gray-400 mt-1 max-w-md truncate">
                      Envío a: {order.shipping_address}
                   </p>
                </div>

                <div className="flex items-center gap-4">
                   <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-yellow-500 outline-none"
                   >
                      <option value="pending">Pendiente</option>
                      <option value="processing">En Proceso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                   </select>

                   {/* Add 'View Details' button if needed */}
                </div>
             </div>
         ))}
      </div>
    </div>
  );
};

export default OrderList;
