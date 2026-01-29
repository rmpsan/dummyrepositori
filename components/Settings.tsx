import React, { useState } from 'react';
import { User } from '../types';
import { Save, Lock, User as UserIcon } from 'lucide-react';

interface SettingsProps {
  currentUser: User;
  onUpdateProfile: (name: string, password?: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser, onUpdateProfile }) => {
  const [name, setName] = useState(currentUser.name);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    onUpdateProfile(name, password || undefined);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
       <div className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Configurações</h1>
          <p className="text-gray-500 mt-1">Gerencie suas preferências e dados de acesso.</p>
        </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-indigo-900 p-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-4 border-white/20 p-1 mb-4 relative">
                 <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full bg-slate-800 object-cover" />
                 <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
            <p className="text-indigo-200 text-sm capitalize">{currentUser.role}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
            <div className="relative">
              <UserIcon size={18} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-700 mb-2">Email (Não editável)</label>
             <input 
                type="email" 
                disabled
                value={currentUser.email}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg"
              />
          </div>

          <div className="pt-4 border-t border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock size={16} className="text-indigo-500" /> Alterar Senha
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nova Senha</label>
                    <input 
                        type="password" 
                        placeholder="Deixe em branco para manter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Confirmar Senha</label>
                    <input 
                        type="password" 
                        placeholder="Repita a nova senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
             </div>
          </div>

          <div className="flex justify-end pt-4">
             <button 
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow-lg shadow-indigo-200"
             >
                <Save size={18} /> Salvar Alterações
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};