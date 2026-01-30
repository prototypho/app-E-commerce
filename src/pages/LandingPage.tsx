import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-red-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="z-10 bg-gray-800/50 p-8 rounded-2xl backdrop-blur-sm border border-gray-700 shadow-2xl max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <img src="https://pvjvfshkfhqdssxnczkm.supabase.co/storage/v1/object/public/branding/logos/Logo_Solares.png" alt="Logo" />
        </div>

        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mb-2">
          Bienbenid@ !
        </h1>
        <p className="text-gray-400 mb-8">
          Tus productos favoritos, a un click de distancia.
        </p>

        <div className="space-y-4">
          <Link
            to="/login"
            className="block w-full bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-orange-500/20 transition-all transform hover:-translate-y-0.5"
          >
            Iniciar Sesión
          </Link>
          
          <Link
            to="/home"
            className="flex items-center justify-center w-full bg-gray-700 text-gray-200 font-semibold py-3 px-6 rounded-xl hover:bg-gray-600 transition-colors group"
          >
            Invitarme unos mates
            <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          {/* Note: "Invitarme unos mates" is maybe the guest access or placeholder text? User asked for "Acceso como Invitado". I'll caption it "Ingresar como Invitado" */}
        </div>
      </div>
      
      {/* Correction on button text */}
      <div className="mt-4">
        <Link to="/home" className="text-sm text-gray-500 hover:text-gray-300 underline">
            Ingresar como Invitado
        </Link>
      </div>

    </div>
  );
};

export default LandingPage;
