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

export interface Tag {
  id: string;
  name: string;
}

export interface AdminTag extends Tag {
  _count: { cocktails: number };
}

export interface Cocktail {
  id: string;
  name: string;
  glassware: string;
  directions: string;
  imageUrl: string | null;
  ingredients: Ingredient[];
  tags: Tag[];
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
  imageUrl: string | null;
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
  imageUrl: string | null;
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

export interface BourbonReviewReply {
  id: string;
  content: string;
  ratingId: string;
  createdBy: { id: string; name: string };
  createdById: string;
  createdAt: string;
}

export interface BourbonRating {
  id: string;
  stars: number;
  review: string | null;
  bourbonId: string;
  createdBy: { id: string; name: string };
  createdById: string;
  replies: BourbonReviewReply[];
  createdAt: string;
}

export interface BourbonSummary {
  id: string;
  name: string;
  locationPurchased: string;
  createdBy: { id: string; name: string };
  createdAt: string;
  averageRating: number | null;
  ratingCount: number;
}

export interface BourbonDetail extends BourbonSummary {
  ratings: BourbonRating[];
  userRating: BourbonRating | null;
}

export interface WineReviewReply {
  id: string;
  content: string;
  ratingId: string;
  createdBy: { id: string; name: string };
  createdById: string;
  createdAt: string;
}

export interface WineRating {
  id: string;
  stars: number;
  review: string | null;
  wineId: string;
  createdBy: { id: string; name: string };
  createdById: string;
  replies: WineReviewReply[];
  createdAt: string;
}

export interface WineSummary {
  id: string;
  name: string;
  locationPurchased: string;
  createdBy: { id: string; name: string };
  createdAt: string;
  averageRating: number | null;
  ratingCount: number;
}

export interface WineDetail extends WineSummary {
  ratings: WineRating[];
  userRating: WineRating | null;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  createdAt: string;
  _count: { cocktails: number; notes: number };
}
