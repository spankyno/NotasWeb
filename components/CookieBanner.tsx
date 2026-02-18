
import React, { useState, useEffect } from 'react';

const CookieBanner: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setShow(true);
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-8 z-[100] border border-slate-700/50 backdrop-blur-sm">
      <div className="text-sm flex-1">
        <p className="leading-relaxed opacity-90">
          Utilizamos cookies para mejorar tu experiencia de usuario, gestionar sesiones de Supabase y asegurar que la aplicación funcione correctamente. Al usar nuestro sitio, aceptas nuestra política de cookies.
        </p>
      </div>
      <div className="flex space-x-3 shrink-0">
        <button 
          onClick={accept}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-xs transition-all uppercase tracking-widest shadow-lg shadow-indigo-500/20"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
