import React, { useState, useEffect } from 'react';
import { Project, User, TimeLog } from '../types';
import { X, Clock, CheckCircle2, Calendar } from 'lucide-react';

interface QuickTimeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentUser: User;
  onSave: (project: Project, log: TimeLog) => void;
  preSelectedProjectId?: string | null;
}

export const QuickTimeLogModal: React.FC<QuickTimeLogModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentUser,
  onSave,
  preSelectedProjectId
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [hours, setHours] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter only active projects assigned to user (or all if admin)
  const availableProjects = currentUser.role === 'admin' 
    ? projects.filter(p => p.status === 'Em andamento')
    : projects.filter(p => p.status === 'Em andamento' && p.editorIds.includes(currentUser.id));

  useEffect(() => {
    if (isOpen) {
      if (preSelectedProjectId) {
        setSelectedProjectId(preSelectedProjectId);
      } else if (availableProjects.length === 1) {
        setSelectedProjectId(availableProjects[0].id);
      } else {
        setSelectedProjectId('');
      }
      setHours('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsSubmitting(false);
    }
  }, [isOpen, preSelectedProjectId, availableProjects.length]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !hours || !description) return;

    setIsSubmitting(true);

    const project = projects.find(p => p.id === selectedProjectId);
    if (project) {
        const newLog: TimeLog = {
            id: `t${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            hours: Number(hours),
            date: date,
            description: description
        };

        const updatedProject = {
            ...project,
            hoursUsed: project.hoursUsed + Number(hours),
            timeLogs: [newLog, ...project.timeLogs]
        };

        onSave(updatedProject, newLog);
        
        // Small delay to show success state or just close
        setTimeout(() => {
            onClose();
        }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="text-indigo-200" /> Registrar Horas
                </h2>
                <p className="text-indigo-100 text-sm mt-1">Lançamento rápido de atividades.</p>
            </div>
            <button onClick={onClose} className="text-indigo-200 hover:text-white transition">
                <X size={24} />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Projeto</label>
                <select 
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white text-gray-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                >
                    <option value="">Selecione um projeto...</option>
                    {availableProjects.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {p.client}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Data</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input 
                            type="date"
                            required
                            className="w-full border border-gray-300 rounded-xl pl-10 pr-3 py-2.5 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Horas Trabalhadas</label>
                    <input 
                        type="number"
                        step="0.5"
                        min="0.1"
                        required
                        placeholder="0.0"
                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">O que foi feito?</label>
                <textarea 
                    required
                    rows={3}
                    placeholder="Descreva brevemente a atividade (ex: Edição do primeiro corte)"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95 transform duration-150 flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    'Salvando...'
                ) : (
                    <>
                        <CheckCircle2 size={20} /> Confirmar Lançamento
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
};