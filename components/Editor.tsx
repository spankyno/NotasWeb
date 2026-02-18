
import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';

interface EditorProps {
  note: Note;
  showLineNumbers: boolean;
  onToggleLineNumbers: () => void;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

const Editor: React.FC<EditorProps> = ({ note, showLineNumbers, onToggleLineNumbers, onUpdate, onDelete }) => {
  const [content, setContent] = useState(note.content);
  const [title, setTitle] = useState(note.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date(note.updated_at));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
    setLastSaved(new Date(note.updated_at));
  }, [note.id]);

  // Sync scroll between textarea and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    onUpdate(note.id, { content: val });
    setLastSaved(new Date());
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== note.title) {
      onUpdate(note.id, { title: title || 'Untitled Note' });
    }
  };

  const lines = content.split('\n');

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
        <div className="flex-1 min-w-0 flex items-center">
          {isEditingTitle ? (
            <input
              autoFocus
              className="text-lg font-bold text-slate-800 border-b-2 border-indigo-600 focus:outline-none w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            />
          ) : (
            <h2 
              className="text-lg font-bold text-slate-800 truncate cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </h2>
          )}
          <span className="ml-4 text-[10px] text-slate-400 whitespace-nowrap hidden sm:inline">
            Last saved: {lastSaved.toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={onToggleLineNumbers}
            className={`p-2 rounded-lg transition-colors ${showLineNumbers ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
            title="Toggle Line Numbers"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Note"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden relative group">
        {showLineNumbers && (
          <div 
            ref={lineNumbersRef}
            className="w-12 bg-slate-50 text-slate-300 py-6 text-right pr-3 select-none mono-font text-sm overflow-hidden border-r border-slate-100"
          >
            {lines.map((_, i) => (
              <div key={i} className="leading-relaxed h-[1.625rem]">{i + 1}</div>
            ))}
          </div>
        )}
        
        <textarea
          ref={textareaRef}
          className="flex-1 p-6 outline-none resize-none mono-font text-sm leading-relaxed text-slate-700 h-full w-full hide-scrollbar overflow-y-auto"
          value={content}
          onChange={handleContentChange}
          onScroll={handleScroll}
          placeholder="Start typing your note here..."
          spellCheck={false}
        />

        {/* Floating status */}
        <div className="absolute bottom-4 right-6 text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
          {content.length} characters | {content.split(/\s+/).filter(x => x).length} words
        </div>
      </div>
    </div>
  );
};

export default Editor;
