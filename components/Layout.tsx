
import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Editor from './Editor';
import Tabs from './Tabs';
import { UserProfile, Note } from '../types';
import { notesService } from '../services/notesService';
import { supabase } from '../services/supabase';

interface LayoutProps {
  user: UserProfile;
}

const Layout: React.FC<LayoutProps> = ({ user }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [openNoteIds, setOpenNoteIds] = useState<string[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dailyCount, setDailyCount] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const data = await notesService.fetchNotes(user.id);
      setNotes(data);
      const count = await notesService.getNotesCountToday(user.id);
      setDailyCount(count);
    } catch (err) {
      console.error('Error loading notes:', err);
    }
  }, [user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateNote = async () => {
    if (dailyCount >= 10) {
      alert("Daily limit reached! You can create up to 10 new notes per day.");
      return;
    }
    
    try {
      const newNote = await notesService.createNote(user.id);
      setNotes([newNote, ...notes]);
      setDailyCount(prev => prev + 1);
      openNote(newNote.id);
    } catch (err) {
      console.error('Failed to create note:', err);
    }
  };

  const openNote = (id: string) => {
    if (!openNoteIds.includes(id)) {
      if (openNoteIds.length >= 10) {
        alert("Tab limit reached! Please close some tabs before opening a new one.");
        return;
      }
      setOpenNoteIds([...openNoteIds, id]);
    }
    setActiveNoteId(id);
  };

  const closeNote = (id: string) => {
    const newOpenIds = openNoteIds.filter(nId => nId !== id);
    setOpenNoteIds(newOpenIds);
    if (activeNoteId === id) {
      setActiveNoteId(newOpenIds.length > 0 ? newOpenIds[newOpenIds.length - 1] : null);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await notesService.deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
      closeNote(id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    try {
      await notesService.updateNote(id, updates);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const activeNote = notes.find(n => n.id === activeNoteId) || null;

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar 
        notes={notes}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onNoteSelect={openNote}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddNote={handleCreateNote}
        onSignOut={handleSignOut}
        userEmail={user.email}
      />
      
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <Tabs 
          notes={notes}
          openNoteIds={openNoteIds}
          activeNoteId={activeNoteId}
          onTabSelect={setActiveNoteId}
          onTabClose={closeNote}
        />
        
        <div className="flex-1 overflow-hidden relative">
          {activeNote ? (
            <Editor 
              note={activeNote}
              showLineNumbers={showLineNumbers}
              onToggleLineNumbers={() => setShowLineNumbers(!showLineNumbers)}
              onUpdate={handleUpdateNote}
              onDelete={handleDeleteNote}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-60h-6" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-slate-600 mb-2">No active note</h3>
              <p className="max-w-xs">Select a note from the sidebar or create a new one to start writing.</p>
              <button 
                onClick={handleCreateNote}
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
              >
                Create New Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Layout;
