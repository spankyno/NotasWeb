
import { createClient } from '@supabase/supabase-js';

/**
 * Intenta obtener una variable de entorno de todas las fuentes posibles 
 * en un entorno de navegador/cliente.
 */
const getEnv = (name: string): string => {
  try {
    // 1. Intentar vía process.env (estándar de Node/Vercel/Bundlers)
    if (typeof process !== 'undefined' && process.env) {
      if (process.env[name]) return process.env[name] as string;
    }

    // 2. Intentar vía import.meta.env (específico de Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // @ts-ignore
      if (import.meta.env[name]) return import.meta.env[name] as string;
    }

    // 3. Intentar vía window (algunas inyecciones directas)
    if (typeof window !== 'undefined') {
      if ((window as any).process?.env?.[name]) return (window as any).process.env[name];
      if ((window as any).__ENV__?.[name]) return (window as any).__ENV__[name];
    }
  } catch (e) {
    // Ignorar errores de acceso
  }
  return '';
};

// Priorizar variables sin prefijo según lo solicitado, pero mantener fallbacks
const supabaseUrl = 
  getEnv('SUPABASE_URL') || 
  getEnv('NEXT_PUBLIC_SUPABASE_URL') || 
  getEnv('VITE_SUPABASE_URL') || 
  '';

const supabaseAnonKey = 
  getEnv('SUPABASE_ANON_KEY') || 
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
  getEnv('VITE_SUPABASE_ANON_KEY') || 
  '';

// Exportar estado de configuración (evita falsos positivos con placeholders)
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'https://placeholder-url.supabase.co' &&
  !supabaseUrl.includes('placeholder');

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
