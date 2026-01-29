import { supabase } from '../supabaseClient';
import { Project, User } from '../types';

// --- Users / Auth ---

export const api = {
  // Auth & Profiles
  async getCurrentUser() {
    // Check session explicitly to catch API Key errors
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
        // Propagate error (e.g., Invalid API key) to be caught by App.tsx
        throw sessionError;
    }
    
    if (!sessionData.session?.user) return null;
    
    // Fetch profile details
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', sessionData.session.user.id)
      .single();

    if (error) {
        // If profile doesn't exist yet (race condition on signup), try to create default or return null
        console.warn('Error fetching profile:', error.message);
        return null;
    }

    return profile as User;
  },

  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) throw error;
    return data as User[];
  },

  async createUserProfile(user: User) {
    const { password, ...profileData } = user;
    
    const { error } = await supabase
      .from('profiles')
      .insert(profileData);
    if (error) throw error;
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
      const { password, ...cleanUpdates } = updates as any; 
      
      const { error } = await supabase
        .from('profiles')
        .update(cleanUpdates)
        .eq('id', userId);
        
      if (error) throw error;
  },

  // Projects

  async getProjects() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      client: p.client,
      type: p.type,
      structure: p.structure,
      status: p.status,
      priority: p.priority,
      description: p.description,
      
      startDate: p.start_date || new Date().toISOString(),
      deadline: p.deadline || new Date().toISOString(),
      
      // JSON fields might return null if empty in DB
      versionDeadlines: p.version_deadlines || { v1: '', final: '' },
      hoursBudgeted: p.hours_budgeted || 0,
      hoursUsed: p.hours_used || 0,
      editorIds: p.editor_ids || [],
      deliverables: p.deliverables || [],
      comments: p.comments || [],
      timeLogs: p.time_logs || [],
    })) as Project[];
  },

  async saveProject(project: Project) {
    // Ensure we are sending data that matches Supabase column expectations
    const dbProject = {
      id: project.id,
      name: project.name,
      client: project.client,
      type: project.type,
      structure: project.structure,
      status: project.status,
      priority: project.priority,
      description: project.description,
      
      start_date: project.startDate, // Needs to be ISO string or YYYY-MM-DD
      deadline: project.deadline,     // Needs to be ISO string or YYYY-MM-DD
      
      // Map camelCase to snake_case for DB columns
      version_deadlines: project.versionDeadlines,
      hours_budgeted: project.hoursBudgeted,
      hours_used: project.hoursUsed,
      editor_ids: project.editorIds,
      deliverables: project.deliverables,
      comments: project.comments,
      time_logs: project.timeLogs
    };

    const { error } = await supabase
      .from('projects')
      .upsert(dbProject);

    if (error) {
        console.error("Supabase Save Error:", error);
        throw error;
    }
  },

  async deleteProject(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
  },

  async deleteUser(userId: string) {
      const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
      if (error) throw error;
  }
};