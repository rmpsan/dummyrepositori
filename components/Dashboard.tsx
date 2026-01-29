import React, { useState, useMemo } from 'react';
import { Project, User, ProjectStatus, TimeLog } from '../types';
import { Clock, Calendar, AlertCircle, TrendingUp, Search, LayoutGrid, Kanban as KanbanIcon, Filter, AlertTriangle, CheckCircle2, MoreHorizontal, ArrowRight, Plus, Layers, PlayCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { QuickTimeLogModal } from './QuickTimeLogModal';

interface DashboardProps {
  currentUser: User;
  projects: Project[];
  users: User[];
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
  onUpdateProject: (project: Project) => void;
}

// Visual Helpers
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Em andamento': return 'text-blue-700 bg-blue-50 border-blue-100 ring-blue-500/20';
    case 'Finalizado': return 'text-emerald-700 bg-emerald-50 border-emerald-100 ring-emerald-500/20';
    case 'Pausado': return 'text-amber-700 bg-amber-50 border-amber-100 ring-amber-500/20';
    case 'Cancelado': return 'text-gray-600 bg-gray-50 border-gray-100 ring-gray-500/20';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const getHoursProgressColor = (used: number, budget: number) => {
  const percentage = (used / budget) * 100;
  if (percentage >= 100) return 'bg-gradient-to-r from-rose-500 to-red-600';
  if (percentage >= 80) return 'bg-gradient-to-r from-amber-400 to-orange-500';
  return 'bg-gradient-to-r from-emerald-400 to-emerald-600';
};

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, projects, users, onSelectProject, onNewProject, onUpdateProject }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'Todos' | 'Criticos'>('Todos');
  
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [preSelectedTimeProject, setPreSelectedTimeProject] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin';

  // Lógica de Filtragem (Mantida igual)
  const criticalProjects = useMemo(() => {
    return projects.filter(p => {
        if (p.status === 'Finalizado' || p.status === 'Cancelado') return false;
        const isOverBudget = p.hoursUsed > p.hoursBudgeted;
        const isOverdue = new Date(p.deadline) < new Date() && new Date(p.deadline).toDateString() !== new Date().toDateString();
        return isOverBudget || isOverdue;
    });
  }, [projects]);

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

    if (statusFilter === 'Criticos') {
        filtered = filtered.filter(p => {
            if (p.status === 'Finalizado' || p.status === 'Cancelado') return false;
            return p.hoursUsed > p.hoursBudgeted || new Date(p.deadline) < new Date();
        });
    } else if (statusFilter !== 'Todos') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    return filtered;
  }, [projects, currentUser, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    return {
      active: projects.filter(p => p.status === 'Em andamento').length,
      finished: projects.filter(p => p.status === 'Finalizado').length,
      hoursTotal: projects.reduce((acc, p) => acc + p.hoursUsed, 0),
      criticalCount: criticalProjects.length
    };
  }, [projects, criticalProjects]);

  // Gráfico (Dados)
  const chartData = filteredProjects
    .filter(p => p.status === 'Em andamento')
    .map(p => ({
        name: p.name.length > 10 ? p.name.substring(0, 10) + '...' : p.name,
        Utilizado: p.hoursUsed,
        Restante: Math.max(0, p.hoursBudgeted - p.hoursUsed),
        Estourado: Math.max(0, p.hoursUsed - p.hoursBudgeted),
    }))
    .sort((a, b) => (b.Utilizado + b.Restante) - (a.Utilizado + a.Restante))
    .slice(0, 8);

  const openTimeLogModal = (projectId?: string) => {
      setPreSelectedTimeProject(projectId || null);
      setIsTimeModalOpen(true);
  };

  const handleTimeLogSave = (updatedProject: Project, log: TimeLog) => {
      onUpdateProject(updatedProject);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{currentUser.name.split(' ')[0]}</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
             {isAdmin 
                ? 'Painel de controle geral da produtora.' 
                : 'Seu workspace criativo de hoje.'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {!isAdmin && (
              <button 
                onClick={() => openTimeLogModal()}
                className="group px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 border border-indigo-100 transition shadow-sm hover:shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <Clock size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                <span>Registrar Horas</span>
              </button>
          )}

          {isAdmin && (
            <button 
              onClick={onNewProject}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 hover:-translate-y-0.5"
            >
              <Plus size={20} strokeWidth={3} />
              <span>Novo Projeto</span>
            </button>
          )}
        </div>
      </div>

      {/* --- KPI STATS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Em Produção" 
          value={stats.active} 
          icon={<PlayCircle size={22} strokeWidth={2.5} />} 
          variant="blue" 
          onClick={() => setStatusFilter('Em andamento')}
          isActive={statusFilter === 'Em andamento'}
        />
        <StatCard 
          title="Finalizados" 
          value={stats.finished} 
          icon={<CheckCircle2 size={22} strokeWidth={2.5} />} 
          variant="emerald" 
          onClick={() => setStatusFilter('Finalizado')}
          isActive={statusFilter === 'Finalizado'}
        />
        <StatCard 
          title="Alertas / Atrasos" 
          value={stats.criticalCount} 
          icon={<AlertTriangle size={22} strokeWidth={2.5} />} 
          variant="red" 
          onClick={() => setStatusFilter('Criticos')}
          isActive={statusFilter === 'Criticos'}
        />
        <StatCard 
          title="Horas Totais" 
          value={stats.hoursTotal} 
          icon={<Clock size={22} strokeWidth={2.5} />} 
          variant="purple" 
          suffix="h"
        />
      </div>

      {/* --- ADMIN ALERTS --- */}
      {isAdmin && criticalProjects.length > 0 && (
        <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-2xl p-6 shadow-sm animate-in slide-in-from-top-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4 text-rose-700">
                    <div className="bg-rose-100 p-1.5 rounded-lg">
                        <AlertTriangle className="text-rose-600" size={18} />
                    </div>
                    <h2 className="text-lg font-bold">Atenção Prioritária ({criticalProjects.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {criticalProjects.map(p => {
                        const isOverdue = new Date(p.deadline) < new Date();
                        const isOverBudget = p.hoursUsed > p.hoursBudgeted;
                        const overdueDays = Math.ceil((new Date().getTime() - new Date(p.deadline).getTime()) / (1000 * 3600 * 24));
                        const budgetPercent = Math.round((p.hoursUsed / p.hoursBudgeted) * 100);

                        return (
                            <div key={p.id} onClick={() => onSelectProject(p)} className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-rose-200 shadow-sm cursor-pointer hover:shadow-md hover:border-rose-300 transition group">
                                <h3 className="font-bold text-slate-800 truncate mb-2 group-hover:text-rose-600 transition-colors">{p.name}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {isOverdue && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded">
                                            Atrasado ({overdueDays}d)
                                        </span>
                                    )}
                                    {isOverBudget && (
                                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                                            Orçamento ({budgetPercent}%)
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      {/* --- MAIN CONTENT LAYOUT --- */}
      <div className="grid grid-cols-1 gap-8">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white/40 shadow-sm sticky top-4 z-20">
                <div className="flex items-center gap-3 w-full md:w-auto px-2">
                    <div className="relative w-full md:w-80 group">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                        type="text"
                        placeholder="Buscar projeto, cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-transparent focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm outline-none transition font-medium text-slate-700 placeholder:text-slate-400"
                        />
                    </div>
                    
                    <div className="relative hidden md:block group">
                        <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="pl-10 pr-10 py-2.5 bg-slate-100/50 border border-transparent focus:bg-white focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm outline-none appearance-none cursor-pointer hover:bg-white transition font-bold text-slate-600"
                        >
                        <option value="Todos">Todos os Status</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Pausado">Pausado</option>
                        <option value="Finalizado">Finalizado</option>
                        {isAdmin && <option value="Criticos">⚠️ Apenas Críticos</option>}
                        </select>
                    </div>
                </div>

                <div className="flex bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid size={18} strokeWidth={2.5} />
                    </button>
                    <button 
                        onClick={() => setViewMode('kanban')}
                        className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'kanban' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <KanbanIcon size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* --- ADMIN CHART --- */}
            {isAdmin && viewMode === 'grid' && chartData.length > 0 && (
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Carga de Trabalho</h3>
                            <p className="text-slate-400 text-sm">Horas consumidas vs Orçamento</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={12}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#94A3B8', fontWeight: 500}} dy={10} />
                            <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#94A3B8'}} />
                            <Tooltip 
                            cursor={{ fill: '#F8FAFC' }}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="Utilizado" stackId="a" fill="#6366F1" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="Restante" stackId="a" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Estourado" stackId="a" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* --- PROJECTS GRID --- */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                    <ProjectCard 
                        key={project.id} 
                        project={project} 
                        users={users} 
                        onClick={() => onSelectProject(project)}
                        onQuickLog={() => openTimeLogModal(project.id)}
                        canLogTime={!isAdmin || project.status === 'Em andamento'}
                    />
                ))}
                
                {filteredProjects.length === 0 && (
                    <div className="col-span-full py-32 text-center">
                        <div className="mx-auto w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                            <Search size={32} />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg mb-1">Nenhum projeto encontrado</h3>
                        <p className="text-slate-500">Tente ajustar seus filtros de busca.</p>
                    </div>
                )}
                </div>
            ) : (
                <div className="flex overflow-x-auto gap-6 pb-8 pt-2 px-2 items-start min-h-[500px]">
                    <KanbanColumn 
                        title="Em Produção" 
                        status="Em andamento" 
                        projects={filteredProjects.filter(p => p.status === 'Em andamento')} 
                        onSelect={onSelectProject} 
                        variant="blue"
                    />
                    <KanbanColumn 
                        title="Pausado / Aguardando" 
                        status="Pausado" 
                        projects={filteredProjects.filter(p => p.status === 'Pausado')} 
                        onSelect={onSelectProject} 
                        variant="amber"
                    />
                    <KanbanColumn 
                        title="Finalizado" 
                        status="Finalizado" 
                        projects={filteredProjects.filter(p => p.status === 'Finalizado')} 
                        onSelect={onSelectProject} 
                        variant="emerald"
                    />
                </div>
            )}
      </div>

      <QuickTimeLogModal 
        isOpen={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        projects={projects}
        currentUser={currentUser}
        onSave={handleTimeLogSave}
        preSelectedProjectId={preSelectedTimeProject}
      />
    </div>
  );
};

// --- Subcomponents Visuals ---

const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    variant: 'blue' | 'red' | 'purple' | 'emerald';
    suffix?: string;
    onClick?: () => void;
    isActive?: boolean;
}> = ({ title, value, icon, variant, suffix = '', onClick, isActive }) => {
    
    const variants = {
        blue: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
        red: 'from-rose-500 to-red-600 shadow-rose-500/20',
        emerald: 'from-emerald-400 to-emerald-600 shadow-emerald-500/20',
        purple: 'from-violet-500 to-purple-600 shadow-purple-500/20'
    };

    const bgStyles = isActive 
        ? `bg-gradient-to-br ${variants[variant]} text-white transform scale-[1.02]` 
        : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-100 hover:border-slate-200';

    const iconStyles = isActive ? 'text-white/90 bg-white/20' : `text-${variant === 'purple' ? 'violet' : variant}-600 bg-${variant === 'purple' ? 'violet' : variant}-50`;
    
    const textStyles = isActive ? 'text-white/80' : 'text-slate-400';
    const valueStyles = isActive ? 'text-white' : 'text-slate-900';

    return (
        <div 
            onClick={onClick}
            className={`p-6 rounded-3xl transition-all duration-300 shadow-lg cursor-pointer flex flex-col justify-between h-full ${bgStyles} ${!isActive ? 'shadow-slate-200/50' : ''}`}
        >
            <div className="flex justify-between items-start mb-4">
                <p className={`text-xs font-bold uppercase tracking-wider ${textStyles}`}>{title}</p>
                <div className={`p-2.5 rounded-xl ${iconStyles}`}>
                    {icon}
                </div>
            </div>
            <p className={`text-3xl font-extrabold tracking-tight ${valueStyles}`}>{value}{suffix}</p>
        </div>
    );
};

const ProjectCard: React.FC<{
    project: Project;
    users: User[];
    onClick: () => void;
    onQuickLog: () => void;
    canLogTime: boolean;
}> = ({ project, users, onClick, onQuickLog, canLogTime }) => {
    
    const hoursPercent = Math.min(100, (project.hoursUsed / project.hoursBudgeted) * 100);
    const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'Finalizado';
    
    return (
        <div 
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group relative flex flex-col h-full"
        >
            <div className="cursor-pointer flex-1" onClick={onClick}>
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg border shadow-sm ring-1 ${getStatusColor(project.status)}`}>
                        {project.status}
                    </span>
                    {project.priority === 'Urgente' && !isOverdue && (
                        <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded-md text-[10px] font-bold border border-rose-100">URGENTE</span>
                    )}
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2" title={project.name}>{project.name}</h3>
                    <p className="text-sm text-slate-500 font-medium truncate">{project.client}</p>
                </div>

                {/* Progress Bar styled like a video timeline */}
                <div className="mb-5">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                        <span>Timeline / Horas</span>
                        <span className={project.hoursUsed > project.hoursBudgeted ? 'text-rose-500' : 'text-emerald-600'}>{Math.round(hoursPercent)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
                         {/* Tick marks to look like timeline */}
                        <div className="absolute inset-0 flex justify-between px-1">
                            {[...Array(5)].map((_, i) => <div key={i} className="w-[1px] h-full bg-white/50 z-10"></div>)}
                        </div>
                        <div 
                            className={`h-2 rounded-full transition-all duration-700 ${getHoursProgressColor(project.hoursUsed, project.hoursBudgeted)}`}
                            style={{ width: `${hoursPercent}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                        <span>0h</span>
                        <span>{project.hoursBudgeted}h</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors">
                     <div className="bg-white p-2 rounded-xl shadow-sm text-indigo-500">
                        <Calendar size={16} />
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Próxima Entrega</p>
                        <p className={`text-sm font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                            {new Date(project.versionDeadlines.v1).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}
                            {isOverdue && ' (!)'}
                        </p>
                     </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                 <div className="flex -space-x-3">
                    {project.editorIds.slice(0, 3).map(id => {
                        const user = users.find(u => u.id === id);
                        return (
                            <div key={id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 shadow-sm overflow-hidden" title={user?.name}>
                                {user ? <img src={user.avatar} className="w-full h-full object-cover" /> : null}
                            </div>
                        )
                    })}
                 </div>

                 {canLogTime && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); onQuickLog(); }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm hover:shadow-indigo-200"
                        title="Registrar horas"
                     >
                         <Plus size={18} strokeWidth={3} />
                     </button>
                 )}
            </div>
        </div>
    );
};

const KanbanColumn: React.FC<{
    title: string;
    status: string;
    projects: Project[];
    onSelect: (p: Project) => void;
    variant: 'blue' | 'amber' | 'emerald';
}> = ({ title, status, projects, onSelect, variant }) => {
    
    const colors = {
        blue: 'bg-blue-500',
        amber: 'bg-amber-500',
        emerald: 'bg-emerald-500'
    };

    const headerColors = {
        blue: 'bg-blue-50 border-blue-100 text-blue-700',
        amber: 'bg-amber-50 border-amber-100 text-amber-700',
        emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700'
    };

    return (
        <div className="min-w-[320px] max-w-sm flex flex-col h-full bg-slate-100/50 rounded-3xl p-2 border border-slate-200/60">
            <div className={`p-4 rounded-2xl mb-2 flex justify-between items-center border ${headerColors[variant]}`}>
                <h3 className="font-bold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${colors[variant]}`}></span>
                    {title}
                </h3>
                <span className="bg-white/50 px-2 py-0.5 rounded-md text-xs font-bold">{projects.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-2 custom-scrollbar">
                {projects.map(p => (
                    <div key={p.id} onClick={() => onSelect(p)} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-indigo-300 hover:-translate-y-0.5 transition-all group">
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[150px]">{p.client}</span>
                            {p.hoursUsed > p.hoursBudgeted && <AlertTriangle size={14} className="text-amber-500" />}
                        </div>
                        <h4 className="font-bold text-slate-800 mb-3 leading-tight group-hover:text-indigo-600">{p.name}</h4>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                             <div 
                                className={`h-1.5 rounded-full ${getHoursProgressColor(p.hoursUsed, p.hoursBudgeted)}`}
                                style={{ width: `${Math.min(100, (p.hoursUsed / p.hoursBudgeted) * 100)}%` }}
                             ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};