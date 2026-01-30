import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Grid, User, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const MainLayout: React.FC = () => {
  const { itemCount } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-transparent text-gray-100 pb-20">
      {/* Header / Top Bar (Optional, simpler to keep clean for mobile) */}
      <header className="top-0 w-full bg-transparent z-40 p-3">
        <div className="logo_head">
          <img src="https://pvjvfshkfhqdssxnczkm.supabase.co/storage/v1/object/public/branding/logos/Logo_Solares.png" alt="Logo" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 max-w-md mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-gray-900 border-t border-gray-800 z-50 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto relative">
          
          <Link
            to="/home"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/home') ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            <Home size={24} />
            <span className="text-xs">Inicio</span>
          </Link>

          <Link
            to="/products"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/products') ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            <Grid size={24} />
            <span className="text-xs">Productos</span>
          </Link>

          {/* FAB Cart Button */}
          <div className="relative -top-6">
            <Link
              to="/cart"
              className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-yellow-500 to-red-600 rounded-full shadow-lg shadow-yellow-500/20 text-white"
            >
              <ShoppingCart size={24} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-gray-900">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

          <Link
            to="/profile"
            className={`flex flex-col items-center space-y-1 ${
              isActive('/profile') ? 'text-yellow-500' : 'text-gray-400'
            }`}
          >
            <User size={24} />
            <span className="text-xs">Perfil</span>
          </Link>

        </div>
      </nav>
    </div>
  );
};

export default MainLayout;
