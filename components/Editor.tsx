
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
  const [history, setHistory] = useState<string[]>([]);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Sincronizar con la nota cuando cambia el ID
  useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
    setHistory([note.content]);
    if (editorRef.current) editorRef.current.scrollTop = 0;
  }, [note.id]);

  // Sincronizar el scroll de los números de línea con el editor
  const handleScroll = () => {
    if (editorRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = editorRef.current.scrollTop;
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val !== content) {
      setHistory(prev => [...prev, content].slice(-50));
      setContent(val);
      onUpdate(note.id, { content: val });
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setContent(prev);
      onUpdate(note.id, { content: prev });
    }
  };

  const downloadNote = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'nota'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const linesCount = content.split('\n').length;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Barra de Herramientas (4 botones limpios) */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 shrink-0 z-30 bg-white shadow-sm">
        <div className="flex-1 min-w-0 mr-4">
          {isEditingTitle ? (
            <input
              autoFocus
              className="text-xl font-bold text-slate-900 border-b-2 border-indigo-600 outline-none w-full bg-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                onUpdate(note.id, { title: title || 'Sin título' });
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          ) : (
            <h2 
              className="text-xl font-bold text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </h2>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handleUndo} 
            disabled={history.length === 0} 
            className={`p-2 rounded-lg transition-colors ${history.length === 0 ? 'text-slate-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`} 
            title="Deshacer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" /></svg>
          </button>
          
          <div className="w-px h-6 bg-slate-100 mx-1"></div>

          <button 
            onClick={onToggleLineNumbers} 
            className={`p-2 rounded-lg transition-all ${showLineNumbers ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`} 
            title="Números de línea"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
          </button>

          <button 
            onClick={downloadNote} 
            className="p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 rounded-lg transition-colors" 
            title="Descargar nota"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>

          <button 
            onClick={() => onDelete(note.id)} 
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
            title="Eliminar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {/* Área del Editor de Capa Única */}
      <div className="flex-1 relative bg-white overflow-hidden">
        <div className="editor-container">
          {showLineNumbers && (
            <div ref={lineNumbersRef} className="line-numbers">
              {Array.from({ length: linesCount }).map((_, i) => (
                <div key={i} style={{ height: '26px' }}>{i + 1}</div>
              ))}
            </div>
          )}
          
          <textarea
            ref={editorRef}
            className="notepad-editor"
            value={content}
            onChange={handleContentChange}
            onScroll={handleScroll}
            spellCheck={false}
            autoFocus
            placeholder="Empieza a escribir tus pensamientos..."
          />
        </div>

        {/* Status Bar Estática */}
        <div className="status-pill">
          <span>{content.length} CHARS</span>
          <span className="mx-3 opacity-20">|</span>
          <span>{linesCount} LINES</span>
        </div>
      </div>
    </div>
  );
};

export default Editor;
