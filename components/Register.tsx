import React, { useState } from 'react';
import { Film, Mail, Lock, User as UserIcon, Briefcase } from 'lucide-react';
import { Role } from '../types';

interface RegisterProps {
  onRegister: (name: string, email: string, pass: string, role: Role) => void;
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('editor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(name, email, password, role);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-indigo-900 p-8 text-center">
           <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4">
            <Film size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Criar Conta</h1>
          <p className="text-indigo-200 text-sm">Junte-se ao time da Dummy Filmes</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <div className="relative">
                <UserIcon size={18} className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  required
                  placeholder="João Silva"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

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

            <div className="grid grid-cols-2 gap-4">
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-3 top-3 text-gray-400" />
                  <select 
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                  >
                    <option value="editor">Editor</option>
                    <option value="assistant">Assistente</option>
                    <option value="admin">Gerente</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg mt-2"
            >
              Criar Conta
            </button>
          </form>

          <div className="mt-6 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Já tem uma conta?{' '}
              <button 
                onClick={onNavigateToLogin}
                className="text-indigo-600 font-semibold hover:text-indigo-700 transition hover:underline"
              >
                Fazer Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};