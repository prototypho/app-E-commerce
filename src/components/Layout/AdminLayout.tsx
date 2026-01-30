import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ListOrdered, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout: React.FC = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-yellow-500">Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/admin"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin') ? 'bg-gray-700 text-yellow-500' : 'hover:bg-gray-700/50'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/admin/products"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/products') ? 'bg-gray-700 text-yellow-500' : 'hover:bg-gray-700/50'
            }`}
          >
            <Package size={20} />
            <span>Productos</span>
          </Link>
          <Link
            to="/admin/orders"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/admin/orders') ? 'bg-gray-700 text-yellow-500' : 'hover:bg-gray-700/50'
            }`}
          >
            <ListOrdered size={20} />
            <span>Pedidos</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-700 space-y-2">
          <Link
            to="/profile"
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-400 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver al Perfil</span>
          </Link>
          <button
            onClick={signOut}
            className="flex items-center space-x-3 px-4 py-3 w-full text-left text-red-400 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header (visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full bg-gray-800 z-50 p-4 flex justify-between items-center border-b border-gray-700">
        <span className="font-bold text-yellow-500">Admin Panel</span>
        <Link to="/profile" className="text-gray-400 hover:text-white">
           <ArrowLeft size={24} />
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 pt-20 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
