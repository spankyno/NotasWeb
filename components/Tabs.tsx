
import React from 'react';
import { Note } from '../types';

interface TabsProps {
  notes: Note[];
  openNoteIds: string[];
  activeNoteId: string | null;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ notes, openNoteIds, activeNoteId, onTabSelect, onTabClose }) => {
  return (
    <div className="flex bg-slate-200 p-1 border-b border-slate-300 overflow-x-auto hide-scrollbar">
      {openNoteIds.map(id => {
        const note = notes.find(n => n.id === id);
        if (!note) return null;
        const isActive = activeNoteId === id;

        return (
          <div
            key={id}
            onClick={() => onTabSelect(id)}
            className={`flex items-center space-x-2 px-4 py-2 min-w-[120px] max-w-[200px] cursor-pointer rounded-t-lg transition-all text-sm font-medium
              ${isActive ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <span className="truncate flex-1">{note.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(id);
              }}
              className={`p-1 rounded-full hover:bg-slate-200 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Tabs;
