
import React, { useState } from 'react';
import { Note } from '../types';
import Calendar from './Calendar';

interface SidebarProps {
  notes: Note[];
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  onNoteSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddNote: () => void;
  onSignOut: () => void;
  userEmail: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedDate,
  onDateSelect,
  onNoteSelect,
  searchQuery,
  onSearchChange,
  onAddNote,
  onSignOut,
  userEmail
}) => {
  const [view, setView] = useState<'list' | 'calendar'>('list');

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedDate) {
      const noteDate = new Date(note.created_at);
      const isSameDay = noteDate.getFullYear() === selectedDate.getFullYear() &&
                        noteDate.getMonth() === selectedDate.getMonth() &&
                        noteDate.getDate() === selectedDate.getDate();
      return matchesSearch && isSameDay;
    }
    
    return matchesSearch;
  });

  return (
    <div className="w-80 flex flex-col border-r border-slate-200 bg-white h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-indigo-700">QuickNotes</h2>
          <button 
            onClick={onAddNote}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors"
            title="Create Note (Daily limit: 10)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <svg className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => { setView('list'); onDateSelect(null); }}
          >
            All Notes
          </button>
          <button
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-600 hover:text-slate-900'}`}
            onClick={() => setView('calendar')}
          >
            Calendar
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-2">
        {view === 'calendar' ? (
          <div className="p-2">
            <Calendar 
              selectedDate={selectedDate || new Date()} 
              onDateSelect={onDateSelect} 
              notes={notes}
            />
            {selectedDate && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Notes for {selectedDate.toLocaleDateString()}
                </h4>
                {filteredNotes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No notes found for this date.</p>
                ) : (
                  <div className="space-y-1">
                    {filteredNotes.map(note => (
                      <NoteListItem key={note.id} note={note} onSelect={onNoteSelect} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1 pb-4">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400">No notes found</p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <NoteListItem key={note.id} note={note} onSelect={onNoteSelect} />
              ))
            )}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-900 truncate">{userEmail}</p>
            <p className="text-[10px] text-slate-500">Premium Account</p>
          </div>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center space-x-2 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

const NoteListItem: React.FC<{ note: Note; onSelect: (id: string) => void }> = ({ note, onSelect }) => (
  <button
    onClick={() => onSelect(note.id)}
    className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition-colors group"
  >
    <div className="flex justify-between items-start mb-1">
      <h3 className="text-sm font-semibold text-slate-800 truncate pr-2 flex-1">{note.title}</h3>
      <span className="text-[10px] text-slate-400 shrink-0">
        {new Date(note.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
      </span>
    </div>
    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
      {note.content || <span className="italic opacity-50">Empty note...</span>}
    </p>
  </button>
);

export default Sidebar;
