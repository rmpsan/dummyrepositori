import React, { useState } from 'react';
import { Film, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, pass: string) => void;
  onNavigateToRegister: () => void;
  error?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4">
            <Film size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Bem-vindo de volta</h1>
          <p className="text-slate-400 text-sm">Acesse o Dummy Filmes Manager</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center justify-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="email" 
                  required
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              Entrar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Não tem uma conta?{' '}
              <button 
                onClick={onNavigateToRegister}
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 text-center">
            <p className="font-semibold mb-1">Credenciais de Teste:</p>
            <p>Admin: admin@dummy.com / 123</p>
            <p>Editor: ana@dummy.com / 123</p>
          </div>
        </div>
      </div>
    </div>
  );
};