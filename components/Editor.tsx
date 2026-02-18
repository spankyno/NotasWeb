
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
  const [isWordWrap, setIsWordWrap] = useState(true); // Por defecto ajustado a pantalla
  
  // Gestión de historial para deshacer
  const [history, setHistory] = useState<string[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
    setLastSaved(new Date(note.updated_at));
    setHistory([note.content]);
  }, [note.id]);

  // Aplicar Prism highlighting
  useEffect(() => {
    const prism = (window as any).Prism;
    if (prism) {
      prism.highlightAll();
    }
  }, [content, note.id, isWordWrap]); // Recalcular al cambiar wrap para evitar saltos

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      // Sincronizar scroll vertical y horizontal
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
      if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val !== content) {
      setHistory(prev => {
        const newHistory = [...prev, content];
        return newHistory.slice(-50);
      });
      setContent(val);
      onUpdate(note.id, { content: val });
      setLastSaved(new Date());
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setContent(previousState);
      onUpdate(note.id, { content: previousState });
      setLastSaved(new Date());
    }
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title !== note.title) {
      onUpdate(note.id, { title: title || 'Nota sin título' });
    }
  };

  const downloadNote = () => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.replace(/\s+/g, '_') || 'nota'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getLanguage = () => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.endsWith('.html') || lowerTitle.endsWith('.htm')) return 'language-markup';
    if (lowerTitle.endsWith('.css')) return 'language-css';
    if (lowerTitle.endsWith('.js') || lowerTitle.endsWith('.ts')) return 'language-javascript';
    
    if (content.trim().startsWith('<!DOCTYPE html>') || content.includes('</html>')) return 'language-markup';
    if (content.includes('const ') || content.includes('function ') || content.includes('=>')) return 'language-javascript';
    if (content.includes('{') && content.includes('}') && (content.includes('margin:') || content.includes('color:'))) return 'language-css';

    return 'language-none';
  };

  const lines = content.split('\n');
  const langClass = getLanguage();
  const wrapClass = isWordWrap ? 'wrap-on' : 'wrap-off';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shadow-sm z-10">
        <div className="flex-1 min-w-0 flex items-center">
          {isEditingTitle ? (
            <input
              autoFocus
              className="text-lg font-bold text-slate-900 border-b-2 border-indigo-600 focus:outline-none w-full bg-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            />
          ) : (
            <h2 
              className="text-lg font-bold text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </h2>
          )}
          <span className="ml-4 text-[10px] text-slate-400 whitespace-nowrap hidden sm:inline font-medium">
            Guardado: {lastSaved.toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center space-x-1 ml-4">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`p-2 rounded-lg transition-all ${history.length === 0 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'}`}
            title="Deshacer (Ctrl+Z)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" />
            </svg>
          </button>
          
          <div className="w-px h-6 bg-slate-100 mx-1"></div>

          <button
            onClick={() => setIsWordWrap(!isWordWrap)}
            className={`p-2 rounded-lg transition-all ${isWordWrap ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
            title={isWordWrap ? "Desactivar Ajuste de Línea" : "Activar Ajuste de Línea"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
            </svg>
          </button>

          <button
            onClick={downloadNote}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Descargar (.txt)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          
          <button
            onClick={onToggleLineNumbers}
            className={`p-2 rounded-lg transition-all ${showLineNumbers ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
            title="Números de línea"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Eliminar Nota"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Workspace */}
      <div className={`flex-1 flex overflow-hidden relative group ${showLineNumbers ? 'with-line-numbers' : ''}`}>
        {showLineNumbers && (
          <div 
            ref={lineNumbersRef}
            className="w-12 bg-slate-50 text-slate-400 py-6 text-right pr-3 select-none mono-font text-xs overflow-hidden border-r border-slate-100 z-10 font-bold"
          >
            {lines.map((_, i) => (
              <div key={i} className="leading-[1.625rem] h-[1.625rem]">{i + 1}</div>
            ))}
          </div>
        )}
        
        <div className="editor-container">
          <textarea
            ref={textareaRef}
            className={`editor-textarea ${wrapClass}`}
            value={content}
            onChange={handleContentChange}
            onScroll={handleScroll}
            placeholder="Empieza a escribir..."
            spellCheck={false}
          />
          <pre 
            ref={preRef}
            className={`editor-highlight ${wrapClass}`}
            aria-hidden="true"
          >
            <code className={langClass}>
              {content + (content.endsWith('\n') ? ' ' : '')}
            </code>
          </pre>
        </div>

        {/* Floating status */}
        <div className="absolute bottom-4 right-8 flex items-center space-x-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200 shadow-md text-[10px] text-slate-700 font-bold z-20">
          <span className="text-indigo-600">{langClass.replace('language-', '').toUpperCase()}</span>
          <span>{isWordWrap ? "Ajustado" : "Original"}</span>
          <span>{content.length} caracteres</span>
        </div>
      </div>
    </div>
  );
};

export default Editor;
