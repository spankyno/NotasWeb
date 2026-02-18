
-- INSTRUCCIONES DE CONFIGURACIÓN DE BASE DE DATOS PARA QUICKNOTES PRO
-- =================================================================

-- OPCIÓN A: USANDO EL EDITOR SQL (RECOMENDADO)
-- --------------------------------------------
-- 1. Copia y pega el código de abajo en el "SQL Editor" de tu panel de Supabase.
-- 2. Esto creará la tabla, los índices y las políticas de seguridad necesarias.

CREATE TABLE notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Nota sin título',
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
-- Esto es CRITICO para la privacidad de los usuarios
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso (RLS)
CREATE POLICY "Users can see their own notes" ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON notes FOR DELETE USING (auth.uid() = user_id);

-- Índices para búsqueda rápida y filtrado por fecha
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at);


-- OPCIÓN B: IMPORTACIÓN POR CSV
-- ----------------------------
-- Si vas a importar datos manualmente, usa esta estructura de columnas:
-- user_id, title, content, created_at, updated_at
--
-- Nota: El 'user_id' debe ser un UUID válido que ya exista en la tabla 'auth.users'.

/*
Ejemplo de contenido CSV:
user_id,title,content,created_at,updated_at
"7b9e...","Mi Primera Nota","Hola mundo","2024-05-20T10:00:00Z","2024-05-20T10:00:00Z"
*/
