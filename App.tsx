import React, { useState, useEffect } from 'react';
import { Project, User, Role, ToastNotification } from './types';
import { Dashboard } from './components/Dashboard';
import { ProjectDetails } from './components/ProjectDetails';
import { ProjectForm } from './components/ProjectForm';
import { Team } from './components/Team';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ToastContainer } from './components/Toast';
import { Film, Users, LogOut, Settings as SettingsIcon, BarChart2, Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';
import { api } from './services/api';

type ViewState = 'login' | 'register' | 'dashboard' | 'project-details' | 'project-form' | 'team' | 'settings';

const App: React.FC = () => {
  // Global State
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string>('');
  
  // Navigation State
  const [view, setView] = useState<ViewState>('login');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Notification State
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // --- Initial Data Loading ---
  
  useEffect(() => {
    // Check active session
    const initSession = async () => {
      const user = await api.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setView('dashboard');
        await loadData();
      }
      setAuthLoading(false);
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setView('login');
        setProjects([]);
        setUsers([]);
      } else if (event === 'SIGNED_IN' && session) {
        // Need to wait a bit for profile creation triggers if any, or fetch manually
        const user = await api.getCurrentUser();
        if (user) {
             setCurrentUser(user);
             setView('dashboard');
             await loadData();
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
    } catch (error) {
      console.error(error);
      addToast('error', 'Erro ao carregar dados do servidor.');
    }
  };

  // --- Toast Handlers ---
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const newToast = { id: Date.now().toString(), type, message };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Auth Handlers ---

  const handleLogin = async (email: string, pass: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) throw error;
      // Auth state listener will handle the rest
      addToast('success', 'Login realizado com sucesso!');
    } catch (error: any) {
      setAuthError(error.message || 'Erro no login.');
      addToast('error', 'Falha no login. Verifique suas credenciais.');
    }
  };

  const handleRegister = async (name: string, email: string, pass: string, role: Role) => {
    try {
      // 1. Create Auth User
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });

      if (error) throw error;

      if (data.user) {
        // 2. Create Profile
        const newUser: User = {
            id: data.user.id,
            name,
            email,
            role,
            avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff`
        };
        
        await api.createUserProfile(newUser);
        addToast('success', 'Conta criada! Você já pode entrar.');
        // If auto-confirm is on in Supabase, they are logged in.
        // If email confirm is on, they need to check email. Assuming auto-confirm for this prototype.
      }
    } catch (error: any) {
      console.error(error);
      addToast('error', error.message || 'Erro ao criar conta.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    addToast('info', 'Você saiu do sistema.');
  };

  // --- Team Management Handlers ---

  const handleAddUser = async (name: string, email: string, role: Role) => {
    // Note: Creating a user via API usually requires admin privileges or specific edge functions.
    // For this prototype, we'll simulate the "Invitation" by just showing a toast
    // telling the user to Register.
    // In a real app, you would use supabase.auth.admin.inviteUserByEmail (requires service role key).
    
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

  // --- User Profile Handlers ---

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

  // --- Navigation Handlers ---

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setView('project-details');
  };

  const handleBackToDashboard = async () => {
    setSelectedProject(null);
    setView('dashboard');
    await loadData(); // Refresh data
  };

  const handleNewProjectClick = () => {
    setSelectedProject(null);
    setView('project-form');
  };

  const handleEditProjectClick = (project: Project) => {
    setSelectedProject(project);
    setView('project-form');
  };

  // --- Data Logic ---

  const handleUpdateProject = async (updatedProject: Project) => {
    // Optimistic Update
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
    if (selectedProject?.id === updatedProject.id) {
        setSelectedProject(updatedProject);
    }
    
    try {
        await api.saveProject(updatedProject);
    } catch (e) {
        addToast('error', 'Erro ao salvar alterações no servidor.');
        await loadData(); // Revert
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto? Esta ação é irreversível.')) {
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
        await loadData(); // Reload to ensure sync
        if (projects.find(p => p.id === projectData.id)) {
            setView('project-details');
            addToast('success', 'Projeto atualizado com sucesso!');
            // Re-select if we were editing
            setSelectedProject(projectData);
        } else {
            setView('dashboard');
            addToast('success', 'Novo projeto criado!');
        }
    } catch (e) {
        addToast('error', 'Erro ao salvar projeto.');
    }
  };

  // --- Render ---

  if (authLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600">
              <Loader2 className="animate-spin" size={48} />
          </div>
      );
  }

  // Auth Views
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

  // Authenticated App Layout
  if (!currentUser) return null; 

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white flex flex-col fixed h-full z-30 hidden md:flex shadow-2xl transition-all duration-300">
        <div className="p-8 flex items-center gap-3 border-b border-slate-800/50 bg-slate-900">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Film size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-none tracking-tight">Dummy</h1>
            <span className="text-[10px] text-indigo-300 tracking-[0.2em] uppercase font-bold">Filmes Manager</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Menu Principal</div>
          <button 
            onClick={handleBackToDashboard}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition font-medium text-sm group ${view === 'dashboard' || view === 'project-details' || view === 'project-form' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <BarChart2 size={20} className={view.includes('dashboard') || view.includes('project') ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
            <span className="">Dashboard</span>
          </button>
          
          <button 
             onClick={() => setView('team')}
             className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition font-medium text-sm group ${view === 'team' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
             <Users size={20} className={view === 'team' ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
             <span>Equipe</span>
          </button>

          <button 
             onClick={() => setView('settings')}
             className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition font-medium text-sm group ${view === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
             <SettingsIcon size={20} className={view === 'settings' ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
             <span>Configurações</span>
          </button>
        </nav>

        <div className="p-4 m-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-4">
            <img src={currentUser.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-slate-600 bg-slate-700 object-cover" />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{currentUser.name}</p>
              <p className="text-xs text-indigo-300 capitalize font-medium">{currentUser.role}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-slate-700 rounded-lg transition border border-slate-600/50 hover:border-slate-500"
          >
            <LogOut size={14} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 overflow-x-hidden min-h-screen">
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
        </div>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default App;