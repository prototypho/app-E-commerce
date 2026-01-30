import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    recentOrders: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Parallel requests for stats
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from('orders').select('total, created_at, status').order('created_at', { ascending: false }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
      ]);

      const orders = ordersRes.data || [];
      const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      setStats({
        totalSales,
        totalOrders: orders.length,
        totalProducts: productsRes.count || 0,
        recentOrders: orders.slice(0, 5),
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-gray-400">Cargando estadísticas...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Link 
           to="/admin/products" 
           className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
        >
           <ShoppingBag size={20} />
           <span>Gestionar Productos</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Sales */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
           <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Ventas Totales</span>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                 <DollarSign className="text-yellow-500" size={24} />
              </div>
           </div>
           <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalSales)}</p>
        </div>

        {/* Total Orders */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
           <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Pedidos Totales</span>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                 <ShoppingBag className="text-blue-500" size={24} />
              </div>
           </div>
           <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
        </div>

        {/* Products */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
           <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Productos Activos</span>
              <div className="p-2 bg-green-500/20 rounded-lg">
                 <TrendingUp className="text-green-500" size={24} />
              </div>
           </div>
           <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-4">Pedidos Recientes</h2>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
         <table className="w-full text-left text-gray-400">
            <thead className="bg-gray-900 text-gray-500 uppercase text-xs">
               <tr>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Estado</th>
               </tr>
            </thead>
            <tbody>
               {stats.recentOrders.map((order, idx) => (
                  <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50">
                     <td className="p-4">{new Date(order.created_at).toLocaleDateString()}</td>
                     <td className="p-4 font-bold text-white">{formatCurrency(order.total)}</td>
                     <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                           order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                           order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'text-gray-400'
                        }`}>
                           {order.status}
                        </span>
                     </td>
                  </tr>
               ))}
               {stats.recentOrders.length === 0 && (
                  <tr>
                     <td colSpan={3} className="p-4 text-center">No hay pedidos recientes.</td>
                  </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default Dashboard;
