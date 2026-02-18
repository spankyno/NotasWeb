
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
      alert("¡Límite diario alcanzado! Puedes crear hasta 10 notas nuevas por día.");
      return;
    }
    
    try {
      const newNote = await notesService.createNote(user.id);
      setNotes([newNote, ...notes]);
      setDailyCount(prev => prev + 1);
      openNote(newNote.id);
    } catch (err) {
      console.error('Error al crear nota:', err);
    }
  };

  const openNote = (id: string) => {
    if (!openNoteIds.includes(id)) {
      if (openNoteIds.length >= 10) {
        alert("¡Límite de pestañas alcanzado! Por favor, cierra algunas antes de abrir una nueva.");
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
    if (!confirm('¿Estás seguro de que deseas eliminar esta nota?')) return;
    try {
      await notesService.deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
      closeNote(id);
    } catch (err) {
      console.error('Eliminación fallida:', err);
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    try {
      await notesService.updateNote(id, updates);
    } catch (err) {
      console.error('Actualización fallida:', err);
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
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
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
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-2">Bienvenido a QuickNotes Pro</h3>
                <p className="max-w-md text-slate-500 mb-8 leading-relaxed">
                  Tus pensamientos, código y notas seguras en un solo lugar. Selecciona una nota existente o crea una nueva para comenzar.
                </p>
                <button 
                  onClick={handleCreateNote}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-semibold"
                >
                  Nueva Nota
                </button>
              </div>
            )}
          </div>

          {/* Footer Section */}
          <footer className="bg-white border-t border-slate-100 py-3 px-6 text-center">
            <div className="flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-400 space-y-2 md:space-y-0">
              <p className="font-medium">
                Aitor Sánchez Gutiérrez &copy; 2026 - Reservados todos los derechos
              </p>
              <div className="flex items-center space-x-6">
                <a href="mailto:blog.cottage627@passinbox.com" className="hover:text-indigo-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Contacto
                </a>
                <a href="https://aitorblog.infinityfreeapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Blog Personal
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;
