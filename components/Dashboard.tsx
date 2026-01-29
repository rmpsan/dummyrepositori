import React, { useState, useMemo } from 'react';
import { Project, User, ProjectStatus } from '../types';
import { Clock, Calendar, AlertCircle, TrendingUp, Search, LayoutGrid, Kanban as KanbanIcon, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  currentUser: User;
  projects: Project[];
  users: User[];
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em andamento': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'Finalizado': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'Pausado': return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'Cancelado': return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const getHoursColor = (used: number, budget: number) => {
  const percentage = (used / budget) * 100;
  if (percentage >= 100) return 'bg-rose-500';
  if (percentage >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
};

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, projects, users, onSelectProject, onNewProject }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'Todos'>('Todos');

  // Filtragem Lógica
  const filteredProjects = useMemo(() => {
    let filtered = currentUser.role === 'admin' 
      ? projects 
      : projects.filter(p => p.editorIds.includes(currentUser.id));

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.client.toLowerCase().includes(lower)
      );
    }

    if (statusFilter !== 'Todos') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    return filtered;
  }, [projects, currentUser, searchTerm, statusFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    return {
      active: filteredProjects.filter(p => p.status === 'Em andamento').length,
      critical: filteredProjects.filter(p => (p.hoursUsed / p.hoursBudgeted) > 0.9 && p.status !== 'Finalizado').length,
      total: filteredProjects.length
    };
  }, [filteredProjects]);

  // Dados do Gráfico
  const chartData = filteredProjects.map(p => ({
    name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name,
    used: p.hoursUsed,
    budget: p.hoursBudgeted
  })).slice(0, 10); // Limita a 10 para não quebrar o gráfico visualmente

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Olá, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1">Gerencie suas produções com eficiência máxima.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {currentUser.role === 'admin' && (
            <button 
              onClick={onNewProject}
              className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95 transform duration-150"
            >
              <span>+ Novo Projeto</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard 
          title="Em Produção" 
          value={stats.active} 
          icon={<TrendingUp size={22} />} 
          color="blue" 
        />
        <StatCard 
          title="Atenção Necessária" 
          value={stats.critical} 
          icon={<AlertCircle size={22} />} 
          color="red" 
        />
        <StatCard 
          title="Projetos Totais" 
          value={stats.total} 
          icon={<LayoutGrid size={22} />} 
          color="purple" 
        />
      </div>

      {/* Admin Analytics */}
      {currentUser.role === 'admin' && viewMode === 'grid' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-gray-800">Carga de Trabalho (Horas)</h3>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#9ca3af'}} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#9ca3af'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="used" name="Utilizado" stackId="a" radius={[0, 0, 4, 4]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.used > entry.budget ? '#f43f5e' : '#6366f1'} />
                  ))}
                </Bar>
                <Bar dataKey="budget" name="Orçamento Restante" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 w-full md:w-auto p-1">
          <div className="relative w-full md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar cliente, projeto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded-lg text-sm outline-none transition"
            />
          </div>
          
          <div className="relative hidden md:block">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="pl-10 pr-8 py-2 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-300 rounded-lg text-sm outline-none appearance-none cursor-pointer hover:bg-gray-100 transition"
            >
              <option value="Todos">Todos Status</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Pausado">Pausado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            title="Visualização em Grade"
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded-md transition ${viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            title="Visualização em Quadro (Kanban)"
          >
            <KanbanIcon size={18} />
          </button>
        </div>
      </div>

      {/* Content View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} users={users} onClick={() => onSelectProject(project)} />
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={24} />
              </div>
              <p>Nenhum projeto encontrado com os filtros atuais.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-6 items-start h-[calc(100vh-350px)]">
           <KanbanColumn 
              title="Em Andamento" 
              status="Em andamento" 
              projects={filteredProjects.filter(p => p.status === 'Em andamento')} 
              onSelect={onSelectProject} 
            />
           <KanbanColumn 
              title="Pausado / Aguardando" 
              status="Pausado" 
              projects={filteredProjects.filter(p => p.status === 'Pausado')} 
              onSelect={onSelectProject} 
            />
           <KanbanColumn 
              title="Finalizado" 
              status="Finalizado" 
              projects={filteredProjects.filter(p => p.status === 'Finalizado')} 
              onSelect={onSelectProject} 
            />
        </div>
      )}
    </div>
  );
};

// --- Subcomponents ---

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'red' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    red: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition duration-300">
      <div>
        <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${colors[color]}`}>
        {icon}
      </div>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  users: User[];
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, users, onClick }) => {
  const hoursPercent = Math.min(100, (project.hoursUsed / project.hoursBudgeted) * 100);
  
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition duration-300 cursor-pointer flex flex-col justify-between group overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md border ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          {project.priority === 'Urgente' && (
            <span className="flex items-center text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-md">
              <AlertCircle size={14} className="mr-1" /> URGENTE
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-indigo-600 transition">{project.name}</h3>
        <p className="text-sm text-gray-500 mb-6 font-medium">{project.client}</p>

        <div className="space-y-4">
          {/* Hours Progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5 font-medium">
              <span>{project.hoursUsed}h utilizadas</span>
              <span>{Math.round(hoursPercent)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${getHoursColor(project.hoursUsed, project.hoursBudgeted)}`}
                style={{ width: `${hoursPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Next Deadline */}
          <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div className="bg-white p-1.5 rounded-lg shadow-sm mr-3 text-indigo-500">
              <Clock size={16} />
            </div>
            <div>
              <span className="block text-[10px] uppercase text-gray-400 font-bold tracking-wide">Próxima Entrega</span>
              <span className="font-semibold text-gray-800">V1: {new Date(project.versionDeadlines.v1).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-xs">
        <span className="font-medium text-gray-500">{project.type}</span>
        <div className="flex -space-x-2">
            {project.editorIds.map(id => {
              const user = users.find(u => u.id === id);
              return (
                <div key={id} className="w-7 h-7 rounded-full bg-white border-2 border-white flex items-center justify-center shadow-sm overflow-hidden" title={user?.name || 'Usuário removido'}>
                   {user ? (
                       <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                       <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-500">?</div>
                   )}
                </div>
              );
            })}
             {project.editorIds.length === 0 && <span className="text-gray-400 italic">Sem editor</span>}
        </div>
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  title: string;
  status: string;
  projects: Project[];
  onSelect: (p: Project) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, status, projects, onSelect }) => {
  return (
    <div className="min-w-[320px] w-full max-w-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-gray-700 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            status === 'Em andamento' ? 'bg-blue-500' : 
            status === 'Finalizado' ? 'bg-emerald-500' : 'bg-amber-500'
          }`}></span>
          {title}
        </h3>
        <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">{projects.length}</span>
      </div>
      
      <div className="bg-gray-100/50 p-2 rounded-xl border border-gray-200/50 flex-1 overflow-y-auto space-y-3">
        {projects.map(p => (
          <div key={p.id} onClick={() => onSelect(p)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-indigo-300 transition group">
            <div className="flex justify-between items-start mb-2">
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{p.client}</span>
               {p.priority === 'Urgente' && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>}
            </div>
            <h4 className="font-bold text-gray-800 mb-2 leading-tight group-hover:text-indigo-600">{p.name}</h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-50">
               <Calendar size={12} />
               <span>{new Date(p.deadline).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</span>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
           <div className="text-center py-10 text-gray-400 text-sm italic">
             Nenhum projeto
           </div>
        )}
      </div>
    </div>
  );
};