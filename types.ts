
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
}

export interface AppState {
  notes: Note[];
  openNoteIds: string[];
  activeNoteId: string | null;
  showLineNumbers: boolean;
  selectedDate: Date;
  searchQuery: string;
}

export interface NoteStats {
  countToday: number;
}
