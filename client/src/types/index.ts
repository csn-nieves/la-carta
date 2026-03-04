export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  volume: string;
}

export interface Cocktail {
  id: string;
  name: string;
  glassware: string;
  directions: string;
  imageUrl: string | null;
  ingredients: Ingredient[];
  createdBy: { id: string; name: string };
  createdById: string;
  isFavorited?: boolean;
  favoriteCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CocktailsResponse {
  cocktails: Cocktail[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface IngredientInput {
  name: string;
  volume: string;
}

export interface Note {
  id: string;
  content: string;
  createdBy: { id: string; name: string };
  createdById: string;
  createdAt: string;
  _count?: { replies: number };
}

export interface NotesResponse {
  notes: Note[];
}

export interface Reply {
  id: string;
  content: string;
  noteId: string;
  createdBy: { id: string; name: string };
  createdById: string;
  createdAt: string;
}

export interface NoteWithReplies extends Note {
  replies: Reply[];
}

export interface NoteWithRepliesResponse {
  note: NoteWithReplies;
}

export interface StockItem {
  name: string;
  count: number;
}

export interface StockCategory {
  label: string;
  items: StockItem[];
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  _count: { cocktails: number; notes: number };
}
