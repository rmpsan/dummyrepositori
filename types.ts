export type Role = 'admin' | 'editor' | 'assistant';
export type ProjectStatus = 'Em andamento' | 'Pausado' | 'Finalizado' | 'Cancelado';
export type Priority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';
export type VersionType = 'V1' | 'V2' | 'V3' | 'Final';
export type ProjectStructure = 'Simples' | 'Campanha' | 'Curso';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatar: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface VersionLog {
  id: string;
  versionType: VersionType;
  link: string;
  submittedAt: string;
  notes: string;
}

export interface Deliverable {
  id: string;
  title: string;
  group?: string; // Para Cursos: Nome do Módulo. Para Campanhas: Categoria (ex: Reels, Stories)
  status: ProjectStatus;
  versions: VersionLog[];
  description?: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  userName: string;
  hours: number;
  date: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  structure: ProjectStructure;
  status: ProjectStatus;
  priority: Priority;
  description: string;
  
  // Dates
  startDate: string;
  deadline: string;
  versionDeadlines: {
    v1: string;
    v2?: string;
    final: string;
  };

  // Resources
  hoursBudgeted: number;
  hoursUsed: number;
  
  // Team
  editorIds: string[];
  
  // Data
  deliverables: Deliverable[]; // Replaces direct versions
  comments: Comment[];
  timeLogs: TimeLog[];
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}