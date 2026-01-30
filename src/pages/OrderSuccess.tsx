import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
         <CheckCircle size={48} className="text-green-500" />
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-2">¡Pedido Exitoso!</h1>
      <p className="text-gray-400 mb-8 max-w-xs mx-auto">
        Recibimos tu pedido correctamente. Te avisaremos cuando esté en camino.
      </p>

      <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-gray-700 transition-colors"
          >
            Ver mis pedidos
          </button>
          <button
            onClick={() => navigate('/home')}
            className="w-full text-yellow-500 font-bold py-3 px-6"
          >
            Volver al inicio
          </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
