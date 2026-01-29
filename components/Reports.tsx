import React, { useState, useMemo } from 'react';
import { Project, User, TimeLog } from '../types';
import { FileText, Printer, Filter, Calendar, User as UserIcon, Briefcase, X } from 'lucide-react';

interface ReportsProps {
  projects: Project[];
  users: User[];
}

interface EnrichedLog extends TimeLog {
  projectName: string;
  projectId: string;
  userRole: string;
}

export const Reports: React.FC<ReportsProps> = ({ projects, users }) => {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // 1. Flatten all logs from all projects into a single array
  const allLogs: EnrichedLog[] = useMemo(() => {
    return projects.flatMap(project => 
      project.timeLogs.map(log => {
        const user = users.find(u => u.id === log.userId);
        return {
          ...log,
          projectName: project.name,
          projectId: project.id,
          userRole: user ? user.role : 'Desconhecido'
        };
      })
    );
  }, [projects, users]);

  // 2. Filter logs based on selection
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchProject = selectedProject === 'all' || log.projectId === selectedProject;
      const matchUser = selectedUser === 'all' || log.userId === selectedUser;
      
      // Date Logic: log.date is YYYY-MM-DD
      const matchStart = startDate ? log.date >= startDate : true;
      const matchEnd = endDate ? log.date <= endDate : true;

      return matchProject && matchUser && matchStart && matchEnd;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allLogs, selectedProject, selectedUser, startDate, endDate]);

  // 3. Calculate Stats
  const totalHours = filteredLogs.reduce((acc, log) => acc + log.hours, 0);

  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setSelectedProject('all');
    setSelectedUser('all');
    setStartDate('');
    setEndDate('');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR'); // Adjusts timezone automatically for simple dates usually, but explicit split is safer for exact YYYY-MM-DD
  };

  const getDateRangeLabel = () => {
    if (startDate && endDate) return `${formatDate(startDate)} até ${formatDate(endDate)}`;
    if (startDate) return `A partir de ${formatDate(startDate)}`;
    if (endDate) return `Até ${formatDate(endDate)}`;
    return 'Todo o período';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Controls (Hidden on Print) */}
      <div className="no-print flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Relatórios Gerenciais</h1>
          <p className="text-gray-500 mt-1">Analise a performance e gere extratos de horas da equipe.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={clearFilters}
                className="px-4 py-2.5 text-gray-600 bg-white border border-gray-300 font-medium rounded-xl hover:bg-gray-50 transition shadow-sm flex items-center gap-2"
            >
                <X size={16} />
                <span>Limpar Filtros</span>
            </button>
            <button 
            onClick={handlePrint}
            className="px-5 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition shadow-lg flex items-center gap-2"
            >
            <Printer size={18} />
            <span>Exportar PDF</span>
            </button>
        </div>
      </div>

      {/* Filters (Hidden on Print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar por Projeto</label>
          <div className="relative">
            <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 cursor-pointer"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="all">Todos os Projetos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar por Membro</label>
          <div className="relative">
            <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 cursor-pointer"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="all">Toda a Equipe</option>
              {users.filter(u => u.role !== 'admin').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Início</label>
            <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="date"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 cursor-pointer"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
        </div>

        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data Fim</label>
            <div className="relative">
                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="date"
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 cursor-pointer"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Printable Report Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden print:border-0 print:shadow-none">
        
        {/* Report Header */}
        <div className="bg-indigo-900 text-white p-6 print:bg-white print:text-black print:border-b-2 print:border-black print:p-0 print:mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">Relatório de Atividades</h2>
              <p className="text-indigo-200 print:text-gray-600 text-sm">
                Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{totalHours}h</p>
              <p className="text-xs uppercase opacity-70">Total Registrado</p>
            </div>
          </div>
        </div>

        {/* Summary Info (Visible in UI and Print) */}
        <div className="p-6 bg-gray-50 border-b border-gray-100 print:bg-white print:p-0 print:mb-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="block text-gray-500 text-xs uppercase font-bold">Filtro de Projeto</span>
                <span className="font-medium text-gray-900">
                  {selectedProject === 'all' ? 'Todos os Projetos' : projects.find(p => p.id === selectedProject)?.name}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs uppercase font-bold">Filtro de Membro</span>
                <span className="font-medium text-gray-900">
                  {selectedUser === 'all' ? 'Toda a Equipe' : users.find(u => u.id === selectedUser)?.name}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs uppercase font-bold">Período</span>
                <span className="font-medium text-gray-900">
                  {getDateRangeLabel()}
                </span>
              </div>
           </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs print:bg-gray-200 print:text-black">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Membro</th>
                <th className="px-6 py-3">Projeto</th>
                <th className="px-6 py-3">Atividade</th>
                <th className="px-6 py-3 text-right">Horas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 print:divide-gray-300">
              {filteredLogs.map((log) => (
                <tr key={`${log.id}-${log.projectId}`} className="hover:bg-gray-50 print:hover:bg-white">
                  <td className="px-6 py-3 whitespace-nowrap text-gray-600">
                    {new Date(log.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{log.userName}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{log.userRole}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3 font-medium text-indigo-700 print:text-black">
                    {log.projectName}
                  </td>
                  <td className="px-6 py-3 text-gray-600 max-w-xs truncate print:whitespace-normal">
                    {log.description}
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-gray-900">
                    {log.hours}h
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50 font-bold text-gray-900 print:bg-gray-100">
               <tr>
                 <td colSpan={4} className="px-6 py-3 text-right uppercase text-xs tracking-wider">Total Geral</td>
                 <td className="px-6 py-3 text-right">{totalHours}h</td>
               </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};