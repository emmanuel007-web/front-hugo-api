/**
 * =============================================================================
 * Modelos TypeScript - NYTimes Books Explorer
 * =============================================================================
 * Interfaces que reflejan la estructura de datos devuelta por el backend FastAPI.
 * Garantizan type-safety en todo el frontend Angular.
 * =============================================================================
 */

// ---------------------------------------------------------------------------
// Modelo: Autor destacado
// ---------------------------------------------------------------------------
export interface AuthorInfo {
  name: string;
  book_count: number;
  primary_list?: string;
}

// ---------------------------------------------------------------------------
// Modelo: Libro individual en una lista best-seller
// ---------------------------------------------------------------------------
export interface BookItem {
  rank: number;
  rank_last_week: number;
  weeks_on_list: number;
  title: string;
  author: string;
  description: string;
  publisher: string;
  book_image: string;
  amazon_product_url: string;
  primary_isbn13: string;
  primary_isbn10: string;
  buy_links?: BuyLink[];
  sunday_review_link?: string;
  article_chapter_link?: string;
  found_in_lists?: string[];
  list_name_encoded?: string;
  // Propiedades adicionales para historial
  ranks_history?: any[];
  isbns?: any[];
  price?: string;
}

// ---------------------------------------------------------------------------
// Modelo: Link de compra
// ---------------------------------------------------------------------------
export interface BuyLink {
  name: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Modelo: Una lista de best-sellers (ej. hardcover-fiction)
// ---------------------------------------------------------------------------
export interface BestSellerList {
  list_id?: number;
  list_name: string;
  list_name_encoded: string;
  display_name: string;
  updated?: string;
  books: BookItem[];
}

// ---------------------------------------------------------------------------
// Respuesta: Overview - Endpoint 1
// ---------------------------------------------------------------------------
export interface OverviewResponse {
  status: string;
  endpoint: string;
  bestsellers_date: string;
  published_date: string;
  published_date_description?: string;
  num_lists: number;
  lists: BestSellerList[];
}

// ---------------------------------------------------------------------------
// Respuesta: Lista específica (actual o histórica) - Endpoints 2, 3, 4
// ---------------------------------------------------------------------------
export interface ListResponse {
  status: string;
  endpoint: string;
  list_name?: string;
  display_name?: string;
  description?: string;
  bestsellers_date?: string;
  published_date?: string;
  published_date_description?: string;
  requested_date?: string;
  updated?: string;
  num_results: number;
  books: BookItem[];
}

// ---------------------------------------------------------------------------
// Modelo: Historial de best-sellers
// ---------------------------------------------------------------------------
export interface HistoryBookItem {
  title: string;
  author: string;
  description: string;
  publisher: string;
  isbns: any[];
  ranks_history: any[];
}

export interface HistoryResponse {
  status: string;
  endpoint: string;
  query: string;
  page: number;
  total_results: number;
  total_pages: number;
  num_results: number;
  books: HistoryBookItem[];
}

// ---------------------------------------------------------------------------
// Respuesta: Búsqueda de best-sellers - Endpoint 6
// ---------------------------------------------------------------------------
export interface BestsellerSearchResponse {
  status: string;
  endpoint: string;
  query: string;
  search_type: string;
  num_results: number;
  books: BookItem[];
  prominent_authors: AuthorInfo[];
}

// ---------------------------------------------------------------------------
// Modelo: Artículo de reseña de libro
// ---------------------------------------------------------------------------
export interface ReviewArticle {
  url: string;
  publication_dt?: string;
  byline?: string;
  book_title?: string;
  book_author?: string;
  summary?: string;
  isbn13: string[];
}

export interface ReviewResponse {
  status: string;
  num_results: number;
  query_type: string;
  query_value: string;
  results: ReviewArticle[];
}

// ---------------------------------------------------------------------------
// Modelo: Error del backend
// ---------------------------------------------------------------------------
export interface ErrorResponse {
  status: string;
  error_code?: string;
  message: string;
  detail?: string;
}

// ---------------------------------------------------------------------------
// Modelo: Configuración de un menú del explorador
// ---------------------------------------------------------------------------
export interface MenuOption {
  id: number;
  label: string;
  icon: string;
  description: string;
  endpointTag: string;
  nytUrl: string;
  fields: FormField[];
}

// ---------------------------------------------------------------------------
// Modelo: Campo de formulario dinámico
// ---------------------------------------------------------------------------
export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'radio' | 'number';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  hint?: string;
}

// ---------------------------------------------------------------------------
// Modelo: Nombres de listas (Categorías) - Endpoint 4
// ---------------------------------------------------------------------------
export interface ListName {
  list_name: string;
  display_name: string;
  list_name_encoded: string;
  oldest_published_date: string;
  newest_published_date: string;
  updated: string;
}

export interface ListNamesResponse {
  status: string;
  num_results: number;
  results: ListName[];
}
