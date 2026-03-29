/**
 * =============================================================================
 * AppComponent - Componente Raíz (Standalone)
 * =============================================================================
 * Orquesta toda la aplicación: menú principal, formularios dinámicos,
 * llamadas al backend y visualización de resultados.
 * 
 * Usa Signals de Angular 18 para estado reactivo sin RxJS en el template.
 * =============================================================================
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';

import { NytApiService } from './services/nyt-api.service';
import { ExportService } from './services/export.service';
import { ThemeService } from './services/theme.service';

import {
  MenuOption,
  BookItem,
  BestSellerList,
  HistoryBookItem,
  AuthorInfo,
  ErrorResponse,
  ReviewArticle
} from './models/nyt.models';

// ---------------------------------------------------------------------------
// Configuración de las 6 opciones del menú principal
// ---------------------------------------------------------------------------
const MENU_OPTIONS: MenuOption[] = [
  {
    id: 1,
    label: 'Overview General',
    icon: '📋',
    description: 'Todas las listas best-sellers actuales o por fecha',
    endpointTag: 'lists/overview.json',
    nytUrl: 'https://api.nytimes.com/svc/books/v3/lists/overview.json',
    fields: [
      {
        key: 'published_date',
        label: 'Fecha de publicación',
        type: 'date',
        required: false,
        hint: 'Opcional. Si se deja vacío, devuelve la semana actual.'
      }
    ]
  },
  {
    id: 2,
    label: 'Lista Actual por Nombre',
    icon: '📗',
    description: 'Lista específica de best-sellers (ej. hardcover-fiction)',
    endpointTag: 'lists/current/{list-name}.json',
    nytUrl: 'https://api.nytimes.com/svc/books/v3/lists/current/{list-name}.json',
    fields: [
      {
        key: 'list_name',
        label: 'Nombre de la Lista',
        type: 'select',
        required: true,
        hint: 'Selecciona la categoría de best-sellers que deseas consultar.',
        options: [
          { value: 'hardcover-fiction', label: '📖 Hardcover Fiction' },
          { value: 'hardcover-nonfiction', label: '📘 Hardcover Nonfiction' },
          { value: 'paperback-nonfiction', label: '📄 Paperback Nonfiction' },
          { value: 'young-adult', label: '👦 Young Adult' },
          { value: 'childrens-middle-grade', label: '🧒 Children\'s Middle Grade' },
          { value: 'graphic-books-and-manga', label: '🎭 Graphic Books & Manga' },
          { value: 'science', label: '🔬 Science' },
          { value: 'business-books', label: '💼 Business Books' },
          { value: 'advice-how-to-and-miscellaneous', label: '💡 Advice & How-To' },
          { value: 'mass-market-paperback', label: '📃 Mass Market Paperback' },
        ]
      }
    ]
  },
  {
    id: 3,
    label: 'Búsqueda por Año',
    icon: '🗓️',
    description: 'Consulta los best-sellers de un año específico del pasado',
    endpointTag: 'lists/{ año }/{-list-name}.json',
    nytUrl: 'https://api.nytimes.com/svc/books/v3/lists/{ año }/{-list-name}.json',
    fields: [
      {
        key: 'date',
        label: 'Año (YYYY)',
        type: 'number',
        placeholder: 'Ej: 2020',
        required: true,
        hint: 'Escribe el año que deseas consultar.'
      },
      {
        key: 'list_name',
        label: 'Categoría',
        type: 'select',
        required: true,
        hint: 'Selecciona la categoría de best-sellers.',
        options: [
          { value: 'hardcover-fiction', label: '📖 Hardcover Fiction' },
          { value: 'hardcover-nonfiction', label: '📘 Hardcover Nonfiction' },
          { value: 'paperback-nonfiction', label: '📄 Paperback Nonfiction' },
          { value: 'young-adult', label: '👦 Young Adult' },
          { value: 'childrens-middle-grade', label: '🧒 Children\'s Middle Grade' },
          { value: 'graphic-books-and-manga', label: '🎭 Graphic Books & Manga' },
          { value: 'science', label: '🔬 Science' },
          { value: 'business-books', label: '💼 Business Books' },
          { value: 'advice-how-to-and-miscellaneous', label: '💡 Advice & How-To' },
          { value: 'mass-market-paperback', label: '📃 Mass Market Paperback' },
        ]
      }
    ]
  },
  {
    id: 4,
    label: 'Explorador de Categorías',
    icon: '📋',
    description: 'Listado completo de todas las categorías de libros en NYT',
    endpointTag: 'lists/names.json',
    nytUrl: 'https://api.nytimes.com/svc/books/v3/lists/names.json',
    fields: []  // No requiere parámetros
  },
  {
    id: 5,
    label: 'Historial de Best-Sellers',
    icon: '📚',
    description: 'Busca cualquier libro que haya sido best-seller en el historial del NYT',
    endpointTag: 'lists/best-sellers/history.json',
    nytUrl: 'https://api.nytimes.com/svc/books/v3/lists/best-sellers/history.json',
    fields: [
      {
        key: 'query',
        label: 'Título o Autor',
        type: 'text',
        placeholder: 'Ej: Stephen King, The Road, Atomic Habits...',
        required: true,
        hint: 'Busca en el historial completo de libros best-sellers.'
      }
    ]
  },
  {
    id: 6,
    label: 'Autores Populares (No Ficción)',
    icon: '✍️',
    description: 'Ranking de autores más destacados en No Ficción (Hardcover)',
    endpointTag: 'lists/current/hardcover-nonfiction.json',
    nytUrl: 'https://api.nytimes.com/svc/books/v3/lists/current/hardcover-nonfiction.json',
    fields: [
      {
        key: 'query',
        label: 'Buscar Autor',
        type: 'text',
        placeholder: 'Ej: James Clear, Walter Isaacson...',
        required: false,
        hint: 'Deja vacío para ver el ranking completo de los autores actuales.'
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// Imagen por defecto cuando el libro no tiene portada
// ---------------------------------------------------------------------------
const DEFAULT_BOOK_COVER = 'data:image/svg+xml,' + encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="120" viewBox="0 0 80 120">
    <rect width="80" height="120" fill="#E2E2E2" rx="2"/>
    <rect x="8" y="10" width="64" height="3" fill="#C8C8C8" rx="1"/>
    <rect x="8" y="20" width="45" height="3" fill="#C8C8C8" rx="1"/>
    <rect x="8" y="55" width="64" height="40" fill="#C8C8C8" rx="2"/>
    <text x="40" y="108" text-anchor="middle" fill="#999" font-size="8" font-family="sans-serif">Sin portada</text>
  </svg>
`);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  // -------------------------------------------------------------------------
  // Inyección de servicios (Angular 18 inject())
  // -------------------------------------------------------------------------
  private nytService = inject(NytApiService);
  private exportService = inject(ExportService);
  themeService = inject(ThemeService);

  // -------------------------------------------------------------------------
  // Estado de la aplicación usando Signals de Angular 18
  // -------------------------------------------------------------------------

  // Opción del menú actualmente seleccionada (null = menú principal visible)
  selectedOption = signal<MenuOption | null>(null);

  // Estado de carga durante las peticiones HTTP
  isLoading = signal<boolean>(false);

  // Mensaje de error (null = sin error)
  errorMessage = signal<ErrorResponse | null>(null);

  // Resultados de la última consulta
  results = signal<any>(null);

  // Tipo de resultado para renderizado condicional
  resultType = signal<string>('');

  // Número total de resultados
  totalResults = signal<number>(0);

  // Página actual para búsqueda (Endpoint 5)
  currentPage = signal<number>(0);

  // Total de páginas para paginación (Endpoint 5)
  totalPages = signal<number>(0);

  // Autores destacados (Endpoint 6)
  prominentAuthors = signal<AuthorInfo[]>([]);

  // Texto del query actual
  currentQuery = signal<string>('');
  currentSort = signal<string>('relevance');

  // Expandir/colapsar listas en el Overview
  expandedLists = signal<Set<string>>(new Set());

  // Autores sugeridos para búsqueda rápida (Opción 5 y 6)
  suggestedAuthors = [
    'Stephen King', 'Michelle Obama', 'James Clear', 'Walter Isaacson',
    'Colleen Hoover', 'John Grisham', 'Brit Bennett', 'Matt Haig'
  ];

  // -------------------------------------------------------------------------
  // Datos de los menús
  // -------------------------------------------------------------------------
  menuOptions = MENU_OPTIONS;
  defaultBookCover = DEFAULT_BOOK_COVER;

  // Modelo del formulario dinámico (ngModel)
  formValues: { [key: string]: string } = {};

  // -------------------------------------------------------------------------
  // Computed signals
  // -------------------------------------------------------------------------
  hasResults = computed(() => {
    const r = this.results();
    if (!r) return false;
    if (Array.isArray(r)) return r.length > 0;
    if (r.books) return r.books.length > 0;
    if (r.lists) return r.lists.length > 0;
    if (r.results) return r.results.length > 0; // For reviews
    return false;
  });

  ngOnInit(): void {
    // La app inicia mostrando el menú principal (selectedOption = null)
  }

  // -------------------------------------------------------------------------
  // Seleccionar opción del menú
  // -------------------------------------------------------------------------
  selectOption(option: MenuOption): void {
    this.selectedOption.set(option);
    this.results.set(null);
    this.errorMessage.set(null);
    this.currentPage.set(0);
    this.totalPages.set(0);
    this.formValues = {};

    // Pre-rellenar valores por defecto para selects
    for (const field of option.fields) {
      if (field.type === 'select' && field.options && field.options.length > 0) {
        this.formValues[field.key] = field.options[0].value;
      }
    }

    // Auto-ejecutar Opción 6 para mostrar el ranking de inmediato
    if (option.id === 6) {
      // Usar un pequeño timeout para que el DOM se actualice antes
      setTimeout(() => this.executeQuery(), 100);
    }
  }

  /** Selecciona un autor sugerido y lanza la búsqueda */
  selectAuthor(name: string): void {
    const optionId = this.selectedOption()?.id;
    // Si es Opción 5 o 6, el campo de búsqueda es 'query'
    if (optionId === 5 || optionId === 6) {
      this.formValues['query'] = name;
      this.executeQuery();
    }
  }

  // -------------------------------------------------------------------------
  // Volver al menú principal
  // -------------------------------------------------------------------------
  goToMenu(): void {
    this.selectedOption.set(null);
    this.results.set(null);
    this.errorMessage.set(null);
    this.resultType.set('');
    this.currentPage.set(0);
    this.totalPages.set(0);
  }

  // -------------------------------------------------------------------------
  // Ejecutar la consulta según la opción seleccionada
  // -------------------------------------------------------------------------
  executeQuery(): void {
    const option = this.selectedOption();
    if (!option) return;

    // Validar campos requeridos
    for (const field of option.fields) {
      const value = this.formValues[field.key];
      const isString = typeof value === 'string';
      const isEmpty = isString ? !value.trim() : (value === undefined || value === null || value === '');

      if (field.required && isEmpty) {
        this.errorMessage.set({
          status: 'error',
          error_code: 'VALIDATION_ERROR',
          message: `El campo "${field.label}" es obligatorio`,
          detail: 'Por favor completa todos los campos requeridos antes de consultar.'
        });
        return;
      }
    }

    // Specific validation for Endpoint 7 (at least one field required)
    if (option.id === 7) {
      const { title, author, isbn } = this.formValues;
      if (!title?.trim() && !author?.trim() && !isbn?.trim()) {
        this.errorMessage.set({
          status: 'error',
          error_code: 'VALIDATION_ERROR',
          message: 'Al menos un campo es obligatorio',
          detail: 'Para buscar reseñas, debes proporcionar al menos un Título, Autor o ISBN.'
        });
        return;
      }
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.results.set(null);
    this.totalPages.set(0);

    switch (option.id) {
      case 1: this.fetchOverview(); break;
      case 2: this.fetchCurrentList(); break;
      case 3: this.fetchHistoricalList(); break;
      case 4:
        this.fetchListNames();
        break;
      case 5: this.fetchHistory(0); break;
      case 6: this.fetchBestsellers(); break;
    }
  }


  // -------------------------------------------------------------------------
  // Endpoint 1: Overview
  // -------------------------------------------------------------------------
  private fetchOverview(): void {
    const date = this.formValues['published_date'] || undefined;

    this.nytService.getOverview(date).subscribe({
      next: (data) => {
        this.results.set(data);
        this.resultType.set('overview');
        this.totalResults.set(data.num_lists);
        this.isLoading.set(false);
      },
      error: (err: ErrorResponse) => {
        this.handleError(err);
      }
    });
  }

  // -------------------------------------------------------------------------
  // Endpoint 2: Lista actual por nombre
  // -------------------------------------------------------------------------
  private fetchCurrentList(): void {
    const listName = this.formValues['list_name'];

    this.nytService.getCurrentList(listName).subscribe({
      next: (data) => {
        this.results.set(data);
        this.resultType.set('book_list');
        this.totalResults.set(data.num_results);
        this.isLoading.set(false);
      },
      error: (err: ErrorResponse) => this.handleError(err)
    });
  }

  // -------------------------------------------------------------------------
  // Endpoint 3: Lista histórica
  // -------------------------------------------------------------------------
  private fetchHistoricalList(): void {
    const date = this.formValues['date'];
    const listName = this.formValues['list_name'];

    this.nytService.getHistoricalList(date, listName).subscribe({
      next: (data) => {
        this.results.set(data);
        this.resultType.set('book_list');
        this.totalResults.set(data.num_results);
        this.isLoading.set(false);
      },
      error: (err: ErrorResponse) => this.handleError(err)
    });
  }

  // -------------------------------------------------------------------------
  // Endpoint 4: Explorador de Categorías
  // -------------------------------------------------------------------------
  private fetchListNames(): void {
    this.isLoading.set(true);
    this.nytService.getListNames().subscribe({
      next: (data) => {
        this.results.set(data);
        this.resultType.set('list_names');
        this.totalResults.set(data.num_results);
        this.isLoading.set(false);
      },
      error: (err: ErrorResponse) => this.handleError(err)
    });
  }

  // -------------------------------------------------------------------------
  // Endpoint 5: Historial (con paginación)
  // -------------------------------------------------------------------------
  fetchHistory(page: number): void {
    const query = this.formValues['query'] || this.currentQuery();

    this.currentQuery.set(query);
    this.currentPage.set(page);
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.results.set(null); // Clear previous results
    this.totalPages.set(0);

    this.nytService.searchBestSellerHistory(query, page).subscribe({
      next: (data) => {
        this.results.set(data);
        this.resultType.set('history');
        this.totalResults.set(data.total_results);
        this.totalPages.set(data.total_pages);
        this.isLoading.set(false);
      },
      error: (err: ErrorResponse) => this.handleError(err)
    });
  }

  /** Endpoint 6: Autores Populares No Ficción */
  private fetchBestsellers(): void {
    const query = this.formValues['query'];

    this.nytService.searchBestsellers(query).subscribe({
      next: (data) => {
        this.results.set(data);
        this.resultType.set('bestseller_search');
        this.totalResults.set(data.num_results);
        this.prominentAuthors.set(data.prominent_authors || []);
        this.isLoading.set(false);
      },
      error: (err: ErrorResponse) => this.handleError(err)
    });
  }


  // -------------------------------------------------------------------------
  // Manejador de errores central
  // -------------------------------------------------------------------------
  private handleError(err: ErrorResponse): void {
    this.errorMessage.set(err);
    this.isLoading.set(false);
    this.results.set(null);
    this.totalPages.set(0);
  }

  // -------------------------------------------------------------------------
  // Exportar resultados
  // -------------------------------------------------------------------------

  exportCsv(): void {
    const data = this.results();
    if (!data) return;

    let rows: any[] = [];
    const type = this.resultType();

    if (type === 'overview') {
      // Aplanar todas las listas para CSV
      for (const list of data.lists || []) {
        for (const book of list.books || []) {
          rows.push({ lista: list.display_name, ...book });
        }
      }
      rows = this.exportService.normalizeBooksForExport(rows);
    } else if (type === 'book_list' || type === 'bestseller_search' || type === 'history') {
      rows = this.exportService.normalizeBooksForExport(data.books || []);
    } else if (type === 'reviews') {
      rows = data.results || [];
    }

    if (rows.length === 0) {
      alert('No hay datos para exportar a CSV');
      return;
    }

    this.exportService.exportToCsv(rows, `nytimes-${type}-${Date.now()}`);
  }

  // -------------------------------------------------------------------------
  // Helpers para el template
  // -------------------------------------------------------------------------

  /** Imagen de portada con fallback a imagen genérica */
  getBookCover(book: BookItem): string {
    return book.book_image && book.book_image.startsWith('http')
      ? book.book_image
      : this.defaultBookCover;
  }

  /** Obtener clase CSS del badge de ranking */
  getRankClass(rank: number): string {
    if (rank === 1) return 'rank-badge rank-1';
    if (rank === 2) return 'rank-badge rank-2';
    if (rank === 3) return 'rank-badge rank-3';
    return 'rank-badge';
  }

  /** Toggle de lista expandida en Overview */
  toggleList(listName: string): void {
    const expanded = new Set(this.expandedLists());
    if (expanded.has(listName)) {
      expanded.delete(listName);
    } else {
      expanded.add(listName);
    }
    this.expandedLists.set(expanded);
  }

  isListExpanded(listName: string): boolean {
    return this.expandedLists().has(listName);
  }

  /** Formatear fecha ISO para display */
  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  /** Formatear fecha ISO completa (con hora) */
  formatDateTime(dateStr: string): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

  /** Obtener resultados de la respuesta actual como libros */
  get currentBooks(): BookItem[] {
    const r = this.results();
    return r?.books || [];
  }

  /** Obtener listas del overview */
  get overviewLists(): BestSellerList[] {
    const r = this.results();
    return r?.lists || [];
  }

  /** Obtener libros del historial */
  get currentHistoryBooks(): HistoryBookItem[] {
    const r = this.results();
    return r?.books || [];
  }

  /** Número de páginas totales para paginación de historial */
  get totalPagesCount(): number {
    const r = this.results();
    return r?.total_pages || 0;
  }

  /** Array de páginas para renderizar botones de paginación */
  get pageRange(): number[] {
    const total = this.totalPagesCount;
    const current = this.currentPage();
    const pages: number[] = [];

    // Mostrar máximo 5 páginas centradas en la actual
    let start = Math.max(0, current - 2);
    let end = Math.min(total, start + 5);
    if (end - start < 5) start = Math.max(0, end - 5);

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  /** Indicador de cambio de posición en ranking */
  getRankChange(book: BookItem): { direction: string; value: number } {
    const lastWeek = book.rank_last_week || 0;
    if (lastWeek === 0) return { direction: 'new', value: 0 };
    const change = (lastWeek || 0) - (book.rank || 0);
    if (change > 0) return { direction: 'up', value: change };
    if (change < 0) return { direction: 'down', value: Math.abs(change) };
    return { direction: 'same', value: 0 };
  }

  /** Truncar texto largo con ellipsis */
  truncate(text: string, maxLength: number = 200): string {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength) + '...';
  }
}
