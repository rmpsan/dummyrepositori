import React, { useState, useEffect } from 'react';
import { Project, User, Role, ToastNotification } from './types';
import { Dashboard } from './components/Dashboard';
import { ProjectDetails } from './components/ProjectDetails';
import { ProjectForm } from './components/ProjectForm';
import { Team } from './components/Team';
import { Settings } from './components/Settings';
import { Reports } from './components/Reports';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ToastContainer } from './components/Toast';
import { Film, Users, LogOut, Settings as SettingsIcon, BarChart2, Loader2, AlertTriangle, FileText, Clapperboard } from 'lucide-react';
import { supabase } from './supabaseClient';
import { api } from './services/api';

type ViewState = 'login' | 'register' | 'dashboard' | 'project-details' | 'project-form' | 'team' | 'settings' | 'reports';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string>('');
  
  const [view, setView] = useState<ViewState>('login');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Config Error State
  const [isConfigError, setIsConfigError] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          const user = await api.getCurrentUser();
          if (user) {
            setCurrentUser(user);
            setView('dashboard');
            await loadData();
          }
        }
      } catch (err: any) {
        console.error("Auth Init Error:", err);
        // Detect Invalid API Key
        if (err.message && (err.message.includes('Invalid API key') || err.message.includes('configuration'))) {
            setIsConfigError(true);
        }
      } finally {
        setAuthLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setView('login');
        setProjects([]);
        setUsers([]);
      } else if (event === 'SIGNED_IN' && session) {
        // Only fetch if we don't have a user yet to avoid double fetch
        if (!currentUser) {
            try {
                const user = await api.getCurrentUser();
                if (user) {
                    setCurrentUser(user);
                    setView('dashboard');
                    await loadData();
                }
            } catch (e) {
                console.error(e);
            }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const [fetchedProjects, fetchedUsers] = await Promise.all([
        api.getProjects(),
        api.getUsers()
      ]);
      setProjects(fetchedProjects);
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('Invalid API key')) {
        setIsConfigError(true);
      } else {
        // Don't show toast on initial load error if it's just empty
        console.warn('Erro ao carregar dados iniciais');
      }
    }
  };

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const newToast = { id: Date.now().toString(), type, message };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogin = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw error;
      // onAuthStateChange will handle the rest
      addToast('success', 'Login realizado com sucesso!');
    } catch (error: any) {
      if (error.message?.includes('Invalid API key')) {
          setIsConfigError(true);
      } else {
          setAuthError(error.message || 'Erro no login.');
          addToast('error', 'Falha no login. Verifique suas credenciais.');
      }
    }
  };

  const handleRegister = async (name: string, email: string, pass: string, role: Role) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });

      if (error) throw error;

      if (data.user) {
        const newUser: User = {
            id: data.user.id,
            name,
            email,
            role,
            avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff`
        };
        
        await api.createUserProfile(newUser);
        addToast('success', 'Conta criada! Você já pode entrar.');
      }
    } catch (error: any) {
      if (error.message?.includes('Invalid API key')) {
          setIsConfigError(true);
      } else {
          console.error(error);
          addToast('error', error.message || 'Erro ao criar conta.');
      }
    }
  };

  const handleLogout = async () => {
    try {
        await supabase.auth.signOut();
    } catch (error) {
        console.error("Error signing out:", error);
    } finally {
        // Force state cleanup immediately
        setCurrentUser(null);
        setView('login');
        setProjects([]);
        setUsers([]);
        addToast('info', 'Você saiu do sistema.');
    }
  };

  const handleAddUser = async (name: string, email: string, role: Role) => {
    addToast('info', 'Para adicionar um membro, peça para ele se cadastrar na tela de login com este email.');
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Remover este usuário da equipe?')) {
        try {
            await api.deleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
            addToast('success', 'Usuário removido da lista de perfis.');
        } catch (e) {
            addToast('error', 'Erro ao remover usuário.');
        }
    }
  };

  const handleUpdateProfile = async (name: string, password?: string) => {
    if (!currentUser) return;
    try {
        const updates = {
            name,
            avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff`
        };
        await api.updateUserProfile(currentUser.id, updates);
        if (password) {
            await supabase.auth.updateUser({ password });
        }
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
        addToast('success', 'Perfil atualizado com sucesso!');
    } catch (e) {
        addToast('error', 'Erro ao atualizar perfil.');
    }
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setView('project-details');
  };

  const handleBackToDashboard = async () => {
    setSelectedProject(null);
    setView('dashboard');
    await loadData();
  };

  const handleNewProjectClick = () => {
    setSelectedProject(null);
    setView('project-form');
  };

  const handleEditProjectClick = (project: Project) => {
    setSelectedProject(project);
    setView('project-form');
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    // Optimistic update
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (selectedProject?.id === updatedProject.id) {
        setSelectedProject(updatedProject);
    }
    
    try {
        await api.saveProject(updatedProject);
        addToast('success', 'Salvo com sucesso!');
    } catch (e) {
        console.error(e);
        addToast('error', 'Erro ao salvar alterações no servidor.');
        await loadData(); // Revert on error
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
        try {
            await api.deleteProject(projectId);
            setProjects(projects.filter(p => p.id !== projectId));
            handleBackToDashboard();
            addToast('success', 'Projeto excluído.');
        } catch (e) {
            addToast('error', 'Erro ao excluir projeto.');
        }
    }
  };

  const handleSaveForm = async (projectData: Project) => {
    try {
        await api.saveProject(projectData);
        // Reload data to get any DB-generated fields or triggers
        await loadData();
        setView('dashboard');
        addToast('success', 'Projeto salvo com sucesso!');
    } catch (e: any) {
        console.error("Save Project Error:", e);
        addToast('error', `Erro ao salvar projeto: ${e.message || 'Erro desconhecido'}`);
    }
  };

  if (isConfigError) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 border border-amber-200">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6 text-amber-600">
                          <AlertTriangle size={32} />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuração Necessária</h1>
                      <p className="text-gray-600 mb-6">A aplicação não consegue se conectar ao Supabase porque a chave de API é inválida ou não foi configurada.</p>
                      
                      <div className="bg-gray-50 p-4 rounded-xl text-left text-sm border border-gray-200 w-full mb-6">
                          <p className="font-bold text-gray-800 mb-2">Como corrigir:</p>
                          <ol className="list-decimal list-inside space-y-2 text-gray-600">
                              <li>Abra o arquivo <code>supabaseClient.ts</code></li>
                              <li>Localize a variável <code>SUPABASE_ANON_KEY</code></li>
                              <li>Substitua o texto atual pela sua chave <strong>anon public</strong> do Supabase</li>
                          </ol>
                      </div>

                      <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition"
                      >
                        Já atualizei, recarregar página
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (authLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-900 text-indigo-500">
              <Loader2 className="animate-spin" size={48} />
          </div>
      );
  }

  if (view === 'login') {
    return (
      <>
        <Login 
          onLogin={handleLogin} 
          onNavigateToRegister={() => setView('register')} 
          error={authError}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  if (view === 'register') {
    return (
      <>
        <Register 
          onRegister={handleRegister} 
          onNavigateToLogin={() => setView('login')} 
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    );
  }

  if (!currentUser) return null; 

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* Sidebar - Visual Update */}
      <aside className="w-72 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col fixed h-full z-30 hidden md:flex shadow-2xl transition-all duration-300 border-r border-white/5">
        <div className="p-8 flex items-center gap-3 border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Clapperboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-none tracking-tight text-white">Dummy</h1>
            <span className="text-[10px] text-indigo-400 tracking-[0.2em] uppercase font-bold">Manager</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Principal</div>
          
          <MenuButton 
            active={view === 'dashboard' || view === 'project-details' || view === 'project-form'}
            onClick={handleBackToDashboard}
            icon={<BarChart2 size={20} />}
            label="Dashboard"
          />
          
          {currentUser.role === 'admin' && (
             <MenuButton 
                active={view === 'reports'}
                onClick={() => setView('reports')}
                icon={<FileText size={20} />}
                label="Relatórios"
             />
          )}
          
          <MenuButton 
             active={view === 'team'}
             onClick={() => setView('team')}
             icon={<Users size={20} />}
             label="Equipe"
          />

          <MenuButton 
             active={view === 'settings'}
             onClick={() => setView('settings')}
             icon={<SettingsIcon size={20} />}
             label="Configurações"
          />
        </nav>

        <div className="p-4 m-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <img src={currentUser.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{currentUser.name}</p>
              <p className="text-xs text-indigo-300 capitalize font-medium">{currentUser.role}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <LogOut size={14} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 overflow-x-hidden min-h-screen bg-[#F8FAFC]">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-4 z-40">
           <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Film size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 tracking-tight">Dummy Filmes</span>
           </div>
           <button onClick={handleLogout} className="text-gray-400 hover:text-rose-600 transition">
             <LogOut size={20} />
           </button>
        </div>

        <div className="max-w-7xl mx-auto">
          {view === 'dashboard' && (
            <Dashboard 
              currentUser={currentUser} 
              projects={projects}
              users={users}
              onSelectProject={handleSelectProject}
              onNewProject={handleNewProjectClick}
              onUpdateProject={handleUpdateProject}
            />
          )}

          {view === 'project-details' && selectedProject && (
            <ProjectDetails 
              project={selectedProject}
              currentUser={currentUser}
              users={users}
              onBack={handleBackToDashboard}
              onUpdateProject={handleUpdateProject}
              onEditProject={() => handleEditProjectClick(selectedProject)}
              onDeleteProject={() => handleDeleteProject(selectedProject.id)}
            />
          )}

          {view === 'project-form' && (
            <ProjectForm 
              project={selectedProject} // If null, create mode
              users={users}
              onSave={handleSaveForm}
              onCancel={handleBackToDashboard}
            />
          )}

          {view === 'team' && (
             <Team 
                users={users}
                currentUser={currentUser}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
             />
          )}

          {view === 'settings' && (
             <Settings 
                currentUser={currentUser}
                onUpdateProfile={handleUpdateProfile}
             />
          )}

          {view === 'reports' && (
             <Reports 
                projects={projects}
                users={users}
             />
          )}
        </div>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

// Helper for Sidebar Buttons
const MenuButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium text-sm group relative overflow-hidden ${
            active 
            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-900/40' 
            : 'text-slate-400 hover:bg-white/5 hover:text-white'
        }`}
    >
        <span className={`relative z-10 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}`}>
            {icon}
        </span>
        <span className="relative z-10">{label}</span>
        {active && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20"></div>}
    </button>
);

export default App;