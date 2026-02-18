
import { supabase } from './supabase';
import { Note } from '../types';

export const notesService = {
  async fetchNotes(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createNote(userId: string, title?: string, content: string = ''): Promise<Note> {
    const now = new Date();
    const defaultTitle = `Note ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    
    const { data, error } = await supabase
      .from('notes')
      .insert([
        { 
          user_id: userId, 
          title: title || defaultTitle, 
          content,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateNote(noteId: string, updates: Partial<Note>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', noteId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteNote(noteId: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (error) throw error;
  },

  async getNotesCountToday(userId: string): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString());

    if (error) throw error;
    return count || 0;
  }
};
