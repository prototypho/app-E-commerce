import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'customer' // Default role
          }
        }
      });

      if (authError) throw authError;

      // Create profile entry
      if (data.user) {
         // Wait for profile trigger or create manually?
         // Assuming trigger or just insert. Best practice: RLS allows user to insert own profile.
         // Or rely on metadata. But let's insert to ensure it exists.
         const { error: profileError } = await supabase.from('profiles').insert({
             id: data.user.id,
             email: email,
             full_name: fullName,
             role: 'customer'
         });
         
         if (profileError) {
             console.error("Profile creation error", profileError);
             // Don't block flow, maybe auth trigger handles it?
         }
      }

      alert('Registro exitoso! Por favor inicia sesión.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col p-6">
      <button 
        onClick={() => navigate('/')}
        className="mb-8 flex items-center text-gray-400 hover:text-white"
      >
        <ArrowLeft size={20} className="mr-1" />
        Volver
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-red-600 bg-clip-text text-transparent mb-2">
          Crear Cuenta
        </h1>
        <p className="text-gray-400 mb-8">Únete a Solares Maxi Kiosco</p>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Nombre Completo"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-500" size={20} />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
            <input
              type="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-xl border border-gray-700 focus:border-yellow-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-red-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg mt-4 disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-yellow-500 font-bold hover:underline">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
