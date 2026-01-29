import React, { useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_PROJECTS } from './constants';
import { Project, User, Role, ToastNotification } from './types';
import { Dashboard } from './components/Dashboard';
import { ProjectDetails } from './components/ProjectDetails';
import { ProjectForm } from './components/ProjectForm';
import { Team } from './components/Team';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ToastContainer } from './components/Toast';
import { Film, Users, LogOut, Settings as SettingsIcon, BarChart2 } from 'lucide-react';

type ViewState = 'login' | 'register' | 'dashboard' | 'project-details' | 'project-form' | 'team' | 'settings';

const App: React.FC = () => {
  // Global State with Persistence
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('dummy_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('dummy_projects');
    return saved ? JSON.parse(saved) : MOCK_PROJECTS;
  });
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('dummy_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authError, setAuthError] = useState<string>('');
  
  // Navigation State
  const [view, setView] = useState<ViewState>(() => {
    return localStorage.getItem('dummy_current_user') ? 'dashboard' : 'login';
  });
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Notification State
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // --- Persistence Effects ---
  useEffect(() => {
    localStorage.setItem('dummy_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dummy_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dummy_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dummy_current_user');
    }
  }, [currentUser]);

  // --- Toast Handlers ---
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const newToast = { id: Date.now().toString(), type, message };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Auth Handlers ---

  const handleLogin = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      setAuthError('');
      setView('dashboard');
      addToast('success', `Bem-vindo, ${user.name.split(' ')[0]}!`);
    } else {
      setAuthError('Email ou senha inválidos.');
      addToast('error', 'Falha no login. Verifique suas credenciais.');
    }
  };

  const handleRegister = (name: string, email: string, pass: string, role: Role) => {
    // Check if email exists
    if (users.some(u => u.email === email)) {
      addToast('error', 'Este email já está cadastrado.');
      return;
    }

    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      password: pass,
      role,
      avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff`
    };

    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setView('dashboard');
    addToast('success', 'Conta criada com sucesso!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedProject(null);
    setView('login');
    setAuthError('');
    localStorage.removeItem('dummy_current_user');
    addToast('info', 'Você saiu do sistema.');
  };

  // --- Team Management Handlers ---

  const handleAddUser = (name: string, email: string, role: Role) => {
    if (users.some(u => u.email === email)) {
      addToast('error', 'Email já cadastrado.');
      return;
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      password: '123', // Default password
      role,
      avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff`
    };
    setUsers([...users, newUser]);
    addToast('success', `${name} adicionado(a) à equipe! Senha padrão: 123`);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Remover este usuário da equipe?')) {
      setUsers(users.filter(u => u.id !== userId));
      // Optional: Remove user from assigned projects
      addToast('success', 'Usuário removido.');
    }
  };

  // --- User Profile Handlers ---

  const handleUpdateProfile = (name: string, password?: string) => {
    if (!currentUser) return;
    
    const updatedUser = {
        ...currentUser,
        name,
        avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff`,
        ...(password ? { password } : {})
    };

    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    addToast('success', 'Perfil atualizado com sucesso!');
  };

  // --- Navigation Handlers ---

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setView('project-details');
  };

  const handleBackToDashboard = () => {
    setSelectedProject(null);
    setView('dashboard');
  };

  // Open Form to Create New
  const handleNewProjectClick = () => {
    setSelectedProject(null); // No project selected means "New"
    setView('project-form');
  };

  // Open Form to Edit
  const handleEditProjectClick = (project: Project) => {
    setSelectedProject(project);
    setView('project-form');
  };

  // --- Data Logic ---

  const handleUpdateProject = (updatedProject: Project) => {
    const updatedList = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    setProjects(updatedList);
    if (selectedProject?.id === updatedProject.id) {
        setSelectedProject(updatedProject);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto? Esta ação é irreversível.')) {
        const updatedList = projects.filter(p => p.id !== projectId);
        setProjects(updatedList);
        handleBackToDashboard();
        addToast('success', 'Projeto excluído.');
    }
  };

  const handleSaveForm = (projectData: Project) => {
    const exists = projects.find(p => p.id === projectData.id);
    if (exists) {
        handleUpdateProject(projectData);
        setView('project-details'); 
        addToast('success', 'Projeto atualizado com sucesso!');
    } else {
        setProjects([projectData, ...projects]);
        setView('dashboard'); 
        addToast('success', 'Novo projeto criado!');
    }
  };

  // --- Render ---

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