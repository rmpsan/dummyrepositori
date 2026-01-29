import { supabase } from '../supabaseClient';
import { Project, User } from '../types';

// --- Users / Auth ---

export const api = {
  // Auth & Profiles
  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;
    
    // Fetch profile details
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
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
    // Remove password if present before inserting to profiles
    const { password, ...profileData } = user;
    
    const { error } = await supabase
      .from('profiles')
      .insert(profileData);
    if (error) throw error;
  },

  async updateUserProfile(userId: string, updates: Partial<User>) {
      // Remove password from profile update as it's handled by Auth
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

    // Map DB snake_case to Types camelCase and provide defaults
    return data.map((p: any) => ({
      ...p,
      versionDeadlines: p.version_deadlines || { v1: '', final: '' },
      hoursBudgeted: p.hours_budgeted || 0,
      hoursUsed: p.hours_used || 0,
      editorIds: p.editor_ids || [],
      deliverables: p.deliverables || [],
      comments: p.comments || [],
      timeLogs: p.time_logs || [],
      startDate: p.start_date || new Date().toISOString(),
      deadline: p.deadline || new Date().toISOString(),
    })) as Project[];
  },

  async saveProject(project: Project) {
    // Map UI Type to DB Columns
    const dbProject = {
      id: project.id,
      name: project.name,
      client: project.client,
      type: project.type,
      structure: project.structure,
      status: project.status,
      priority: project.priority,
      description: project.description,
      start_date: project.startDate,
      deadline: project.deadline,
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

    if (error) throw error;
  },

  async deleteProject(projectId: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);
    
    if (error) throw error;
  },

  async deleteUser(userId: string) {
      // Note: Only deletes the profile.
      const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
      if (error) throw error;
  }
};