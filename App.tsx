
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './services/supabase';
import Auth from './components/Auth';
import Layout from './components/Layout';
import { UserProfile } from './types';
import CookieBanner from './components/CookieBanner';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setConfigError("Supabase no está configurado correctamente. Por favor, verifica que las variables SUPABASE_URL y SUPABASE_ANON_KEY estén configuradas en tu proyecto de Vercel.");
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email || '' });
        }
      } catch (err: any) {
        console.error('Error al verificar sesión de Supabase:', err);
        if (err.message === 'Failed to fetch') {
          setConfigError("No se pudo conectar con Supabase. Verifica tu conexión a internet o que la URL de Supabase sea correcta.");
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-red-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Configuración Requerida</h2>
          <p className="text-slate-600 mb-6">{configError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {!user ? (
        <Auth />
      ) : (
        <Layout user={user} />
      )}
      <CookieBanner />
    </div>
  );
};

export default App;
