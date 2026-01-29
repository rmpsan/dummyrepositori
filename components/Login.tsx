import React, { useState } from 'react';
import { Film, Mail, Lock, ArrowRight, Clapperboard } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Cinematic Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-4.0.3&auto=format&fit=crop&w=2600&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[2px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8 animate-in slide-in-from-bottom-8 duration-700">
           <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mx-auto mb-6 transform rotate-3">
            <Clapperboard size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Dummy Filmes</h1>
          <p className="text-indigo-200 font-medium">Production Management System</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-white">Bem-vindo de volta</h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/20 text-rose-100 text-sm font-medium rounded-xl border border-rose-500/30 flex items-center justify-center backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider ml-1">Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-3.5 text-indigo-300 group-focus-within:text-white transition-colors" />
                <input 
                  type="email" 
                  required
                  placeholder="editor@dummy.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white placeholder:text-slate-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-indigo-200 uppercase tracking-wider ml-1">Senha</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-3.5 text-indigo-300 group-focus-within:text-white transition-colors" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition text-white placeholder:text-slate-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 group mt-2"
            >
              Acessar Painel <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-white/10">
            <p className="text-slate-300 text-sm">
              Não tem acesso?{' '}
              <button 
                onClick={onNavigateToRegister}
                className="text-white font-bold hover:text-indigo-300 transition hover:underline decoration-2 underline-offset-4"
              >
                Solicitar conta
              </button>
            </p>
          </div>
        </div>
        
        <p className="text-center text-slate-500 text-xs mt-8">© 2024 Dummy Filmes. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};