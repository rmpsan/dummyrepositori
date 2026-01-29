import React, { useState, useEffect } from 'react';
import { Project, User, VersionType, TimeLog, VersionLog, Comment, ProjectStatus, Deliverable } from '../types';
import { ArrowLeft, Clock, Calendar, CheckCircle2, Send, FileText, Plus, AlertTriangle, Edit, Trash2, Link as LinkIcon, Download, Layers, PlayCircle, Folder, Users } from 'lucide-react';

interface ProjectDetailsProps {
  project: Project;
  currentUser: User;
  users: User[];
  onBack: () => void;
  onUpdateProject: (updatedProject: Project) => void;
  onEditProject: () => void;
  onDeleteProject: () => void;
}

export const ProjectDetails: React.FC<ProjectDetailsProps> = ({ 
  project, 
  currentUser, 
  users,
  onBack, 
  onUpdateProject,
  onEditProject,
  onDeleteProject
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'hours'>('overview');
  
  // Content Navigation State
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);

  // Form States
  const [newComment, setNewComment] = useState('');
  const [timeLogHours, setTimeLogHours] = useState(0);
  const [timeLogDesc, setTimeLogDesc] = useState('');
  
  // Version Form States
  const [versionLink, setVersionLink] = useState('');
  const [versionType, setVersionType] = useState<VersionType>('V1');
  const [versionNotes, setVersionNotes] = useState('');

  const isAdmin = currentUser.role === 'admin';

  // Set initial selected deliverable when project changes or tab changes
  useEffect(() => {
    if (project.deliverables.length > 0 && !selectedDeliverableId) {
        setSelectedDeliverableId(project.deliverables[0].id);
    }
  }, [project, selectedDeliverableId]);

  const selectedDeliverable = project.deliverables.find(d => d.id === selectedDeliverableId);

  // --- Handlers ---

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      text: newComment,
      createdAt: new Date().toISOString()
    };
    onUpdateProject({
      ...project,
      comments: [...project.comments, comment]
    });
    setNewComment('');
  };

  const handleAddTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (timeLogHours <= 0) return;
    const log: TimeLog = {
      id: `t${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      hours: Number(timeLogHours),
      date: new Date().toISOString().split('T')[0],
      description: timeLogDesc
    };
    onUpdateProject({
      ...project,
      hoursUsed: project.hoursUsed + Number(timeLogHours),
      timeLogs: [log, ...project.timeLogs]
    });
    setTimeLogHours(0);
    setTimeLogDesc('');
  };

  const handleAddVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionLink || !selectedDeliverableId) return;

    const version: VersionLog = {
      id: `v${Date.now()}`,
      versionType,
      link: versionLink,
      submittedAt: new Date().toISOString(),
      notes: versionNotes
    };

    // Update specific deliverable
    const updatedDeliverables = project.deliverables.map(d => {
        if (d.id === selectedDeliverableId) {
            return {
                ...d,
                status: versionType === 'Final' ? 'Finalizado' as ProjectStatus : d.status,
                versions: [version, ...d.versions]
            };
        }
        return d;
    });

    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables
    });

    setVersionLink('');
    setVersionNotes('');
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateProject({ ...project, status: e.target.value as ProjectStatus });
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // Group Deliverables for Navigation (for Courses/Campaigns)
  const groupedDeliverables = project.deliverables.reduce((acc, curr) => {
    const group = curr.group || 'Geral';
    if (!acc[group]) acc[group] = [];
    acc[group].push(curr);
    return acc;
  }, {} as Record<string, Deliverable[]>);

  const assignedTeam = users.filter(u => project.editorIds.includes(u.id));

  return (
    <div className="bg-white min-h-[calc(100vh-2rem)] rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="relative bg-slate-900 text-white p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <button onClick={onBack} className="flex items-center text-sm text-slate-300 hover:text-white transition group">
              <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
              Voltar ao Dashboard
            </button>
            
            {isAdmin && (
              <div className="flex gap-3">
                <button 
                  onClick={onEditProject}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg transition border border-white/10"
                >
                  <Edit size={14} /> Editar
                </button>
                <button 
                  onClick={onDeleteProject}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 backdrop-blur-sm rounded-lg transition border border-rose-500/20"
                >
                  <Trash2 size={14} /> Excluir
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500 text-white shadow-sm shadow-indigo-500/50">
                   {project.structure}
                 </span>
                 <span className="text-slate-400 text-sm font-medium border-l border-slate-700 pl-3">{project.client}</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-300">
                 <span className="flex items-center gap-1"><Calendar size={14} /> Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}</span>
                 <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-xs"><Layers size={12} /> {project.deliverables.length} Itens</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
              <select 
                value={project.status} 
                onChange={handleStatusChange}
                className={`block w-full py-2 px-3 rounded-md text-sm font-semibold border-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none cursor-pointer
                  ${project.status === 'Em andamento' ? 'bg-blue-500 text-white' : ''}
                  ${project.status === 'Finalizado' ? 'bg-emerald-500 text-white' : ''}
                  ${project.status === 'Pausado' ? 'bg-amber-500 text-white' : ''}
                  ${project.status === 'Cancelado' ? 'bg-slate-700 text-gray-300' : ''}
                `}
              >
                <option value="Em andamento">EM ANDAMENTO</option>
                <option value="Pausado">PAUSADO</option>
                <option value="Finalizado">FINALIZADO</option>
                <option value="Cancelado">CANCELADO</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 px-8 bg-white sticky top-0 z-20">
        {[
          { id: 'overview', label: 'Visão Geral' },
          { id: 'content', label: `Conteúdo & Versões (${project.deliverables.length})` },
          { id: 'hours', label: 'Controle de Horas' },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-5 px-6 text-sm font-semibold border-b-2 transition relative ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8 flex-1 overflow-y-auto bg-gray-50/50">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={16} /> Briefing & Escopo
                </h3>
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </div>
              </section>

              <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Comentários do Projeto</h3>
                <div className="space-y-6 max-h-[400px] overflow-y-auto mb-6 pr-2">
                  {project.comments.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <p className="text-gray-400 italic">Nenhum comentário. Inicie a conversa!</p>
                    </div>
                  ) : (
                    project.comments.map(c => (
                      <div key={c.id} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 shadow-sm">
                          {c.userName.charAt(0)}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-baseline justify-between mb-1">
                             <span className="font-bold text-gray-900 text-sm">{c.userName}</span>
                             <span className="text-xs text-gray-400">{formatDateTime(c.createdAt)}</span>
                           </div>
                           <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none border border-gray-100 text-gray-700 text-sm leading-relaxed shadow-sm">
                             {c.text}
                           </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-3 bg-white border border-gray-200 p-2 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition shadow-sm">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário ou atualização..."
                    className="flex-1 px-3 py-2 outline-none text-sm bg-transparent"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button 
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </section>
            </div>

            <div className="space-y-6">
               <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Calendar size={16} /> Prazos Globais
                </h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-500">Início</span>
                        <span className="font-bold text-gray-800">{new Date(project.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                        <span className="text-sm text-indigo-600 font-medium">Prazo V1</span>
                        <span className="font-bold text-indigo-900">{new Date(project.versionDeadlines.v1).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-900 text-white rounded-lg shadow-lg shadow-gray-900/20">
                        <span className="text-sm font-medium">ENTREGA FINAL</span>
                        <span className="font-bold">{new Date(project.versionDeadlines.final).toLocaleDateString('pt-BR')}</span>
                    </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Users size={16} /> Equipe Responsável
                </h3>
                <div className="space-y-3">
                    {assignedTeam.map(user => (
                        <div key={user.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full bg-gray-200 object-cover" />
                            <div>
                                <p className="text-sm font-bold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                            </div>
                        </div>
                    ))}
                    {assignedTeam.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum membro atribuído.</p>}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* CONTENT HUB TAB (Master-Detail View) */}
        {activeTab === 'content' && (
          <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-16rem)] min-h-[500px]">
            
            {/* Sidebar List (Master) */}
            <div className="w-full lg:w-1/3 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estrutura do Projeto</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {Object.keys(groupedDeliverables).map(group => (
                    <div key={group}>
                        {project.structure !== 'Simples' && (
                            <div className="flex items-center gap-2 mb-3 text-gray-800 font-bold text-sm px-2">
                                <Folder size={16} className="text-indigo-500" />
                                {group}
                            </div>
                        )}
                        <div className="space-y-2">
                            {groupedDeliverables[group].map(del => (
                                <button
                                    key={del.id}
                                    onClick={() => setSelectedDeliverableId(del.id)}
                                    className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between border ${selectedDeliverableId === del.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`p-1.5 rounded-lg ${del.status === 'Finalizado' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {del.status === 'Finalizado' ? <CheckCircle2 size={16} /> : <PlayCircle size={16} />}
                                        </div>
                                        <span className={`text-sm font-medium truncate ${selectedDeliverableId === del.id ? 'text-indigo-900' : 'text-gray-700'}`}>{del.title}</span>
                                    </div>
                                    {del.versions.length > 0 && (
                                        <span className="text-[10px] font-bold bg-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                                            {del.versions[0].versionType}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
              </div>
            </div>

            {/* Content Details (Detail) */}
            <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                {selectedDeliverable ? (
                    <>
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {project.structure !== 'Simples' && <span className="text-xs font-bold text-gray-400 uppercase">{selectedDeliverable.group}</span>}
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${selectedDeliverable.status === 'Finalizado' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                                            {selectedDeliverable.status}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedDeliverable.title}</h2>
                                </div>
                            </div>
                            
                            {/* New Version Form */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Plus size={16} /> Nova Entrega para este vídeo
                                </h4>
                                <form onSubmit={handleAddVersion} className="flex flex-col md:flex-row gap-3">
                                    <select 
                                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                        value={versionType}
                                        onChange={(e) => setVersionType(e.target.value as VersionType)}
                                    >
                                        <option>V1</option>
                                        <option>V2</option>
                                        <option>V3</option>
                                        <option>Final</option>
                                    </select>
                                    <input 
                                        type="url"
                                        placeholder="Link do arquivo (Drive/Dropbox/Frame.io)..."
                                        required
                                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                        value={versionLink}
                                        onChange={(e) => setVersionLink(e.target.value)}
                                    />
                                    <input 
                                        type="text"
                                        placeholder="Notas curtas (opcional)"
                                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500"
                                        value={versionNotes}
                                        onChange={(e) => setVersionNotes(e.target.value)}
                                    />
                                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 transition">
                                        Enviar
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Versions List */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {selectedDeliverable.versions.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl p-8">
                                    <Layers size={48} className="mb-4 opacity-50" />
                                    <p>Nenhuma versão entregue para este vídeo ainda.</p>
                                </div>
                            ) : (
                                selectedDeliverable.versions.map((version) => (
                                    <div key={version.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex gap-4 transition hover:border-indigo-300">
                                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md ${version.versionType === 'Final' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                                                {version.versionType}
                                            </div>
                                            <div className="h-full w-0.5 bg-gray-100 my-1"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase">{formatDateTime(version.submittedAt)}</p>
                                                    {version.notes && <p className="text-gray-700 mt-1 italic">"{version.notes}"</p>}
                                                </div>
                                                <a 
                                                    href={version.link} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
                                                >
                                                    <LinkIcon size={14} /> Abrir Link
                                                </a>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-xs text-gray-500 truncate font-mono">
                                                {version.link}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                     <div className="flex items-center justify-center h-full text-gray-400">
                        Selecione um item ao lado para ver detalhes.
                     </div>
                )}
            </div>
          </div>
        )}

        {/* HOURS TAB */}
        {activeTab === 'hours' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-lg shadow-indigo-900/20 flex items-center justify-between">
                <div>
                   <p className="text-indigo-200 text-sm font-medium mb-1">Orçamento Consumido</p>
                   <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-bold">{project.hoursUsed}h</span>
                     <span className="text-indigo-300">de {project.hoursBudgeted}h</span>
                   </div>
                </div>
                <div className="w-24 h-24 relative flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        className="text-indigo-800"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className={`${project.hoursUsed > project.hoursBudgeted ? 'text-rose-500' : 'text-emerald-400'}`}
                        strokeDasharray={`${Math.min(100, (project.hoursUsed / project.hoursBudgeted) * 100)}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute font-bold text-sm">{Math.round((project.hoursUsed / project.hoursBudgeted) * 100)}%</span>
                </div>
              </div>
              
              {project.hoursUsed > project.hoursBudgeted && (
                <div className="bg-rose-50 text-rose-800 p-4 rounded-xl flex items-center gap-3 border border-rose-100 animate-pulse">
                  <AlertTriangle size={24} className="shrink-0" />
                  <div>
                    <p className="font-bold">Orçamento Estourado!</p>
                    <p className="text-sm text-rose-600">Este projeto ultrapassou as horas planejadas. Revise o escopo.</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wide">Registro de Atividades</h4>
                </div>
                <div className="divide-y divide-gray-100">
                  {project.timeLogs.map(log => (
                    <div key={log.id} className="p-4 hover:bg-gray-50 transition flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center w-12 shrink-0">
                           <span className="block text-xs font-bold text-gray-400 uppercase">{new Date(log.date).toLocaleString('default', { month: 'short' })}</span>
                           <span className="block text-lg font-bold text-gray-800">{new Date(log.date).getDate()}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{log.userName}</p>
                          <p className="text-gray-600 text-sm">{log.description}</p>
                        </div>
                      </div>
                      <div className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-sm">
                        {log.hours}h
                      </div>
                    </div>
                  ))}
                  {project.timeLogs.length === 0 && (
                    <div className="p-8 text-center text-gray-400 italic">Nenhum registro de horas ainda.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-24">
              <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><Clock size={18} /></span>
                Lançar Horas
              </h3>
              <form onSubmit={handleAddTime} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Duração (Horas)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0.5"
                    required
                    value={timeLogHours === 0 ? '' : timeLogHours}
                    onChange={(e) => setTimeLogHours(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-lg font-bold text-gray-800 transition placeholder:font-normal"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">O que foi feito?</label>
                  <textarea 
                    rows={3}
                    required
                    value={timeLogDesc}
                    onChange={(e) => setTimeLogDesc(e.target.value)}
                    placeholder="Ex: Ingest, Corte inicial, Color grading..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition resize-none"
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95 transform duration-150 flex items-center justify-center gap-2">
                  <Plus size={18} /> Lançar Horas
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};