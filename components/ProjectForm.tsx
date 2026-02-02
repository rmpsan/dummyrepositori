import React, { useState, useEffect } from 'react';
import { Project, User, ProjectStatus, Priority, ProjectStructure, Deliverable } from '../types';
import { Save, X, Calendar, DollarSign, Layers, Plus, Trash2, FolderPlus, Video } from 'lucide-react';

interface ProjectFormProps {
  project?: Project | null;
  users: User[];
  onSave: (project: Project) => void;
  onCancel: () => void;
}

// UUID Generator helper for Supabase compatibility
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const ProjectForm: React.FC<ProjectFormProps> = ({ project, users, onSave, onCancel }) => {
  const isEditing = !!project;

  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    client: '',
    type: 'Institucional',
    structure: 'Simples',
    status: 'Em andamento',
    priority: 'Média',
    description: '',
    hoursBudgeted: 0,
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    versionDeadlines: { v1: '', final: '' },
    editorIds: [],
    deliverables: [],
    comments: [],
    timeLogs: [],
    hoursUsed: 0
  });

  // Builder State
  const [modules, setModules] = useState<string[]>(['Módulo 1']);
  const [tempDeliverables, setTempDeliverables] = useState<Partial<Deliverable>[]>([]);

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        deadline: project.deadline ? project.deadline.split('T')[0] : '',
        versionDeadlines: {
          v1: project.versionDeadlines?.v1 ? project.versionDeadlines.v1.split('T')[0] : '',
          v2: project.versionDeadlines?.v2 ? project.versionDeadlines.v2.split('T')[0] : '',
          final: project.versionDeadlines?.final ? project.versionDeadlines.final.split('T')[0] : '',
        }
      });
      setTempDeliverables(project.deliverables || []);
      
      // Extract unique groups if Course
      if (project.structure === 'Curso') {
        const uniqueGroups = Array.from(new Set(project.deliverables.map(d => d.group).filter(Boolean))) as string[];
        if (uniqueGroups.length > 0) setModules(uniqueGroups);
      }
    } else {
        // Initial setup for new project
        setTempDeliverables([{ id: 'd-init', title: 'Vídeo Principal', status: 'Em andamento', versions: [] }]);
    }
  }, [project]);

  // Handler for Structure Change
  const handleStructureChange = (newStructure: ProjectStructure) => {
    setFormData({ ...formData, structure: newStructure });
    if (newStructure === 'Simples') {
        setTempDeliverables([{ id: `d${Date.now()}`, title: formData.name || 'Vídeo Principal', status: 'Em andamento', versions: [] }]);
    } else if (newStructure === 'Campanha' && tempDeliverables.length === 1 && tempDeliverables[0].group === undefined) {
         setTempDeliverables([]); // Clear simple default if switching to complex
    } else if (newStructure === 'Curso') {
         // Keep existing if any, otherwise reset
         if (tempDeliverables.length === 1 && !tempDeliverables[0].group) setTempDeliverables([]);
    }
  };

  const addDeliverable = (group?: string) => {
    const newDel: Partial<Deliverable> = {
      id: `d${Date.now()}-${Math.random()}`,
      title: '',
      group: group,
      status: 'Em andamento',
      versions: []
    };
    setTempDeliverables([...tempDeliverables, newDel]);
  };

  const updateDeliverableTitle = (id: string, title: string) => {
    setTempDeliverables(tempDeliverables.map(d => d.id === id ? { ...d, title } : d));
  };

  const removeDeliverable = (id: string) => {
    setTempDeliverables(tempDeliverables.filter(d => d.id !== id));
  };

  const addModule = () => {
    setModules([...modules, `Módulo ${modules.length + 1}`]);
  };

  const updateModuleName = (index: number, name: string) => {
    const oldName = modules[index];
    const newModules = [...modules];
    newModules[index] = name;
    setModules(newModules);
    // Update linked deliverables
    setTempDeliverables(tempDeliverables.map(d => d.group === oldName ? { ...d, group: name } : d));
  };

  const removeModule = (index: number) => {
    const moduleName = modules[index];
    setModules(modules.filter((_, i) => i !== index));
    // Remove deliverables in this module
    setTempDeliverables(tempDeliverables.filter(d => d.group !== moduleName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Structure
    if (formData.structure !== 'Simples' && tempDeliverables.length === 0) {
        alert('Adicione pelo menos um item ao conteúdo do projeto.');
        return;
    }

    // Ensure titles
    const validDeliverables = tempDeliverables.map(d => ({
        ...d,
        title: d.title || 'Sem título',
        status: d.status || 'Em andamento',
        versions: d.versions || []
    })) as Deliverable[];

    const finalProject: Project = {
      // Use UUID if new project
      id: project?.id || generateUUID(),
      name: formData.name!,
      client: formData.client!,
      type: formData.type!,
      structure: formData.structure!,
      status: formData.status as ProjectStatus,
      priority: formData.priority as Priority,
      description: formData.description!,
      startDate: new Date(formData.startDate!).toISOString(),
      deadline: new Date(formData.deadline!).toISOString(),
      versionDeadlines: {
        v1: new Date(formData.versionDeadlines!.v1).toISOString(),
        v2: formData.versionDeadlines!.v2 ? new Date(formData.versionDeadlines!.v2).toISOString() : undefined,
        final: new Date(formData.versionDeadlines!.final).toISOString(),
      },
      hoursBudgeted: Number(formData.hoursBudgeted),
      hoursUsed: formData.hoursUsed || 0,
      editorIds: formData.editorIds || [],
      deliverables: validDeliverables,
      comments: formData.comments || [],
      timeLogs: formData.timeLogs || []
    };

    onSave(finalProject);
  };

  const toggleEditor = (userId: string) => {
    const currentIds = formData.editorIds || [];
    if (currentIds.includes(userId)) {
      setFormData({ ...formData, editorIds: currentIds.filter(id => id !== userId) });
    } else {
      setFormData({ ...formData, editorIds: [...currentIds, userId] });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        <form id="project-form" onSubmit={handleSubmit} className="space-y-8">
          
          {/* Section 1: Definition */}
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-2">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Projeto</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                    value={formData.client}
                    onChange={e => setFormData({...formData, client: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 bg-white"
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                        >
                            <option>Institucional</option>
                            <option>Publicidade / Comercial</option>
                            <option>Social Media (Reels/TikTok)</option>
                            <option>YouTube / Vlog</option>
                            <option>Podcast / Videocast</option>
                            <option>Live / Streaming</option>
                            <option>Educacional / Curso</option>
                            <option>Videoclipe</option>
                            <option>Documentário</option>
                            <option>Cobertura de Eventos</option>
                            <option>Animação / Motion</option>
                            <option>Vídeo de Vendas (VSL)</option>
                            <option>Outros</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 bg-white"
                            value={formData.priority}
                            onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
                        >
                            <option>Baixa</option>
                            <option>Média</option>
                            <option>Alta</option>
                            <option>Urgente</option>
                        </select>
                    </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Briefing / Descrição</label>
                  <textarea 
                    rows={2}
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Structure & Content */}
          <div className="space-y-6">
             <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estrutura e Conteúdo</h3>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {['Simples', 'Campanha', 'Curso'].map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => handleStructureChange(s as ProjectStructure)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${formData.structure === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
             </div>

             <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                {formData.structure === 'Simples' && (
                    <div className="text-center py-4 text-gray-500">
                        <Video className="mx-auto mb-2 opacity-50" size={32} />
                        <p className="text-sm">Projeto de vídeo único. O gerenciamento de versões será feito diretamente na linha do tempo principal.</p>
                    </div>
                )}

                {formData.structure === 'Campanha' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <p className="text-sm font-bold text-gray-700">Lista de Entregáveis</p>
                            <button type="button" onClick={() => addDeliverable()} className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:bg-indigo-50 px-2 py-1 rounded">
                                <Plus size={14} /> Adicionar Vídeo
                            </button>
                        </div>
                        {tempDeliverables.map((del, idx) => (
                             <div key={del.id} className="flex gap-3 items-center">
                                <div className="bg-white p-2 rounded-lg border border-gray-200 flex-1 flex gap-3 items-center">
                                    <span className="text-xs font-bold text-gray-400 w-6 text-center">{idx + 1}</span>
                                    <input 
                                        type="text"
                                        placeholder="Nome do vídeo (ex: Reels Teaser)"
                                        className="flex-1 outline-none text-sm font-medium"
                                        value={del.title}
                                        onChange={(e) => updateDeliverableTitle(del.id!, e.target.value)}
                                        autoFocus={!del.title}
                                    />
                                </div>
                                <button type="button" onClick={() => removeDeliverable(del.id!)} className="text-gray-400 hover:text-rose-500">
                                    <Trash2 size={16} />
                                </button>
                             </div>
                        ))}
                        {tempDeliverables.length === 0 && <p className="text-sm text-gray-400 italic">Nenhum item adicionado à campanha.</p>}
                    </div>
                )}

                {formData.structure === 'Curso' && (
                    <div className="space-y-6">
                        {modules.map((modName, modIdx) => (
                            <div key={modIdx} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gray-100/50 p-3 border-b border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center gap-2 flex-1">
                                        <FolderPlus size={16} className="text-indigo-500" />
                                        <input 
                                            className="bg-transparent font-bold text-sm text-gray-700 outline-none w-full"
                                            value={modName}
                                            onChange={(e) => updateModuleName(modIdx, e.target.value)}
                                        />
                                    </div>
                                    <button type="button" onClick={() => removeModule(modIdx)} className="text-gray-400 hover:text-rose-500">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="p-3 space-y-2">
                                    {tempDeliverables.filter(d => d.group === modName).map((del) => (
                                         <div key={del.id} className="flex gap-2 items-center pl-4">
                                            <Video size={14} className="text-gray-400" />
                                            <input 
                                                type="text"
                                                placeholder="Título da Aula"
                                                className="flex-1 border-b border-transparent hover:border-gray-200 focus:border-indigo-300 outline-none text-sm py-1"
                                                value={del.title}
                                                onChange={(e) => updateDeliverableTitle(del.id!, e.target.value)}
                                            />
                                            <button type="button" onClick={() => removeDeliverable(del.id!)} className="text-gray-300 hover:text-rose-500">
                                                <X size={14} />
                                            </button>
                                         </div>
                                    ))}
                                    <button type="button" onClick={() => addDeliverable(modName)} className="text-xs flex items-center gap-1 text-indigo-600 font-medium mt-2 pl-4 hover:underline">
                                        <Plus size={12} /> Adicionar Aula
                                    </button>
                                </div>
                            </div>
                        ))}
                         <button type="button" onClick={addModule} className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition flex items-center justify-center gap-2">
                            <Plus size={16} /> Novo Módulo
                        </button>
                    </div>
                )}
             </div>
          </div>

          {/* Section 3: Resources & Team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
             <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Orçamento e Equipe</h3>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento de Horas</label>
                        <div className="relative">
                            <DollarSign size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input 
                            type="number" 
                            min="1"
                            required
                            className="w-full border border-gray-300 rounded-lg p-2.5 pl-10 focus:ring-2 focus:ring-indigo-500"
                            value={formData.hoursBudgeted}
                            onChange={e => setFormData({...formData, hoursBudgeted: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Equipe</label>
                        <div className="border border-gray-300 rounded-lg p-2 max-h-32 overflow-y-auto bg-gray-50">
                            {users.filter(u => u.role !== 'admin').map(user => (
                            <label key={user.id} className="flex items-center space-x-2 p-1 hover:bg-gray-200 rounded cursor-pointer">
                                <input 
                                type="checkbox" 
                                checked={formData.editorIds?.includes(user.id)}
                                onChange={() => toggleEditor(user.id)}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-700">{user.name}</span>
                            </label>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
             <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Cronograma Geral</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Início</label>
                        <input 
                            type="date" 
                            required
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            value={formData.startDate}
                            onChange={e => setFormData({...formData, startDate: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Entrega V1</label>
                        <input 
                            type="date" 
                            required
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                            value={formData.versionDeadlines?.v1}
                            onChange={e => setFormData({
                                ...formData, 
                                versionDeadlines: { ...formData.versionDeadlines!, v1: e.target.value }
                            })}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs font-bold text-indigo-700 mb-1">Prazo Final</label>
                        <input 
                            type="date" 
                            required
                            className="w-full border border-indigo-200 rounded-lg p-2 text-sm bg-indigo-50"
                            value={formData.versionDeadlines?.final}
                            onChange={e => setFormData({
                                ...formData, 
                                deadline: e.target.value, 
                                versionDeadlines: { ...formData.versionDeadlines!, final: e.target.value }
                            })}
                        />
                    </div>
                </div>
             </div>
          </div>
        </form>
      </div>

      <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="project-form"
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
          >
            <Save size={18} />
            {isEditing ? 'Salvar Projeto' : 'Criar Projeto'}
          </button>
      </div>
    </div>
  );
};