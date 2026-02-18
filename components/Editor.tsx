
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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
  const [lineHeights, setLineHeights] = useState<number[]>([]);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);

  // Sincronizar con la nota cuando cambia el ID
  useEffect(() => {
    setContent(note.content);
    setTitle(note.title);
    setHistory([note.content]);
    if (editorRef.current) {
        editorRef.current.scrollTop = 0;
        if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = 0;
    }
  }, [note.id]);

  // MAGIC: Medir alturas reales de cada línea lógica (incluyendo wraps)
  useLayoutEffect(() => {
    if (!editorRef.current || !ghostRef.current) return;

    // Sincronizamos el ancho del ghost mirror con el del textarea
    const editorWidth = editorRef.current.clientWidth;
    ghostRef.current.style.width = `${editorWidth}px`;

    // Normalizamos los saltos de línea para un conteo robusto
    const lines = content.split(/\r\n|\r|\n/);
    
    // Limpiamos y recreamos mediciones en el mirror
    ghostRef.current.innerHTML = '';
    const heights: number[] = [];

    // Para cada línea lógica, creamos un bloque y medimos su altura renderizada
    lines.forEach((lineText) => {
      const lineDiv = document.createElement('div');
      lineDiv.style.whiteSpace = 'pre-wrap';
      lineDiv.style.wordWrap = 'break-word';
      // Mismo estilo que el textarea
      lineDiv.style.fontFamily = "'JetBrains Mono', monospace";
      lineDiv.style.fontSize = "14px";
      lineDiv.style.lineHeight = "26px";
      
      // Si la línea está vacía, le damos un espacio para que mantenga altura mínima
      lineDiv.textContent = lineText === '' ? ' ' : lineText;
      ghostRef.current?.appendChild(lineDiv);
      heights.push(lineDiv.offsetHeight);
    });

    setLineHeights(heights);
  }, [content, showLineNumbers]);

  // Sincronizar el scroll de los números con el editor
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

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Editor Header / Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-white z-10">
        <div className="flex items-center flex-1 min-w-0 mr-4">
          {isEditingTitle ? (
            <input
              autoFocus
              className="text-lg font-bold text-slate-800 bg-slate-50 border-none rounded px-2 py-0.5 focus:ring-2 focus:ring-indigo-500 w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                onUpdate(note.id, { title });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false);
                  onUpdate(note.id, { title });
                }
              }}
            />
          ) : (
            <h2 
              onClick={() => setIsEditingTitle(true)}
              className="text-lg font-bold text-slate-800 truncate cursor-pointer hover:bg-slate-50 px-2 py-0.5 rounded transition-colors"
            >
              {title}
            </h2>
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          <button 
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-30"
            title="Deshacer (Ctrl+Z)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          
          <button 
            onClick={downloadNote}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Descargar como .txt"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <button 
            onClick={onToggleLineNumbers}
            className={`p-2 rounded-lg transition-all ${showLineNumbers ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            title="Alternar números de línea"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          <div className="w-px h-6 bg-slate-100 mx-1"></div>

          <button 
            onClick={() => onDelete(note.id)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            title="Eliminar Nota"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Ghost element for measurements */}
        <div 
          ref={ghostRef} 
          className="absolute opacity-0 pointer-events-none whitespace-pre-wrap invisible"
          style={{ 
            fontFamily: "'JetBrains Mono', monospace", 
            fontSize: "14px", 
            lineHeight: "26px",
            padding: "1.5rem"
          }}
        ></div>

        {showLineNumbers && (
          <div 
            ref={lineNumbersRef}
            className="w-12 bg-slate-50 border-r border-slate-100 flex flex-col text-right pr-3 select-none overflow-hidden pt-6"
          >
            {lineHeights.map((height, i) => (
              <div 
                key={i} 
                className="text-[11px] text-slate-300 font-mono" 
                style={{ height: `${height}px`, lineHeight: "26px" }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          onScroll={handleScroll}
          spellCheck={false}
          className="flex-1 p-6 resize-none focus:outline-none font-mono text-sm leading-[26px] text-slate-700 bg-transparent overflow-y-auto"
          placeholder="Escribe algo increíble..."
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
      </div>

      {/* Status Bar */}
      <div className="px-6 py-2 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <div className="flex items-center space-x-4">
          <span>{content.length} caracteres</span>
          <span>{content.split(/\s+/).filter(Boolean).length} palabras</span>
          <span>{content.split(/\n/).length} líneas</span>
        </div>
        <div className="flex items-center">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></div>
          Sincronizado con Supabase
        </div>
      </div>
    </div>
  );
};

// Fix: Add the missing default export
export default Editor;
