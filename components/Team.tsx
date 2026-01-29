import React, { useState } from 'react';
import { User, Role } from '../types';
import { Trash2, UserPlus, Shield, Mail, Search, Check } from 'lucide-react';

interface TeamProps {
  users: User[];
  currentUser: User;
  onAddUser: (name: string, email: string, role: Role) => void;
  onDeleteUser: (userId: string) => void;
}

export const Team: React.FC<TeamProps> = ({ users, currentUser, onAddUser, onDeleteUser }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Role>('editor');

  const isAdmin = currentUser.role === 'admin';

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newEmail) {
      onAddUser(newName, newEmail, newRole);
      setNewName('');
      setNewEmail('');
      setNewRole('editor');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Equipe</h1>
          <p className="text-gray-500 mt-1">Gerencie os membros da sua produtora.</p>
        </div>
        
        {isAdmin && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2"
          >
            <UserPlus size={18} />
            <span>Adicionar Membro</span>
          </button>
        )}
      </div>

      {/* Add User Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-50/50 mb-8 animate-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Novo Membro</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome</label>
              <input 
                type="text" 
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: Maria Silva"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
              <input 
                type="email" 
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="maria@dummy.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cargo</label>
              <select 
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="editor">Editor</option>
                <option value="assistant">Assistente</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button 
                type="submit" 
                className="flex-1 bg-emerald-500 text-white py-2.5 rounded-lg font-bold hover:bg-emerald-600 transition"
              >
                Salvar
              </button>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Buscar membro por nome ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition shadow-sm"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition group">
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full bg-gray-100 object-cover border-2 border-white shadow-sm" />
            
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
                {user.role === 'admin' && <Shield size={14} className="text-indigo-500 shrink-0" />}
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1 truncate mb-2">
                <Mail size={12} /> {user.email}
              </p>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                user.role === 'editor' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {user.role}
              </span>
            </div>

            {isAdmin && user.id !== currentUser.id && (
              <button 
                onClick={() => onDeleteUser(user.id)}
                className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition opacity-0 group-hover:opacity-100"
                title="Remover usuário"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
