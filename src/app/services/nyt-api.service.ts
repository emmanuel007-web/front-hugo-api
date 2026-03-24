/**
 * =============================================================================
 * Servicio Angular: NYT Books API
 * =============================================================================
 * Centraliza todas las llamadas HTTP al backend FastAPI proxy.
 * Usa HttpClient de Angular con Observables y manejo de errores.
 * 
 * La URL base del backend se puede configurar en environment.ts.
 * La API Key NUNCA pasa por este servicio (está en el backend).
 * =============================================================================
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

import {
  OverviewResponse,
  ListResponse,
  HistoryResponse,
  BestsellerSearchResponse,
  AuthorInfo,
  ReviewResponse,
  ErrorResponse,
  ListNamesResponse
} from '../models/nyt.models';

@Injectable({
  providedIn: 'root'  // Singleton en toda la app (standalone)
})
export class NytApiService {

  // Inyección del HttpClient usando inject() de Angular 18 (sin constructor)
  private http = inject(HttpClient);

  // URL base — localhost en dev, Render en producción
  private readonly BASE_URL = environment.apiUrl;

  // -------------------------------------------------------------------------
  // ENDPOINT 1: Overview - Todas las listas best-sellers
  // Backend: GET /api/books/overview?published_date=YYYY-MM-DD (opcional)
  // -------------------------------------------------------------------------
  getOverview(publishedDate?: string): Observable<OverviewResponse> {
    let params = new HttpParams();
    if (publishedDate) {
      params = params.set('published_date', publishedDate);
    }

    return this.http.get<OverviewResponse>(`${this.BASE_URL}/books/overview`, { params })
      .pipe(
        // Manejar errores HTTP y de red
        catchError(err => this.handleError(err))
      );
  }

  // -------------------------------------------------------------------------
  // ENDPOINT 2: Lista específica ACTUAL por nombre
  // Backend: GET /api/books/current/{list_name}
  // -------------------------------------------------------------------------
  getCurrentList(listName: string): Observable<ListResponse> {
    return this.http.get<ListResponse>(`${this.BASE_URL}/books/current/${listName}`)
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  // -------------------------------------------------------------------------
  // ENDPOINT 3: Lista específica HISTÓRICA por nombre y fecha
  // Backend: GET /api/books/history/{date}/{list_name}
  // -------------------------------------------------------------------------
  getHistoricalList(date: string, listName: string): Observable<ListResponse> {
    return this.http.get<ListResponse>(`${this.BASE_URL}/books/history/${date}/${listName}`)
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  // -------------------------------------------------------------------------
  // ENDPOINT 4: Lista nonfiction combinada actual
  // Backend: GET /api/books/nonfiction
  // -------------------------------------------------------------------------
  getNonfictionCombined(): Observable<ListResponse> {
    return this.http.get<ListResponse>(`${this.BASE_URL}/books/nonfiction`)
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  // -------------------------------------------------------------------------
  // NUEVO ENDPOINT: Listado de todos los nombres de categorías/listas
  // Backend: GET /api/books/names
  // -------------------------------------------------------------------------
  getListNames(): Observable<ListNamesResponse> {
    return this.http.get<ListNamesResponse>(`${this.BASE_URL}/books/names`)
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  // -------------------------------------------------------------------------
  // ENDPOINT 5: Búsqueda en el historial completo de Best-Sellers
  // Backend: GET /api/search/history?query=...&page=0
  // -------------------------------------------------------------------------
  searchBestSellerHistory(
    query: string,
    page: number = 0
  ): Observable<HistoryResponse> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString());

    return this.http.get<HistoryResponse>(`${this.BASE_URL}/search/history`, { params })
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  // -------------------------------------------------------------------------
  // ENDPOINT 6: Búsqueda de BEST-SELLERS por autor o título + Autores destacados
  // Backend: GET /api/search/bestsellers?query=...&search_type=both
  // -------------------------------------------------------------------------
  searchBestsellers(
    query?: string
  ): Observable<BestsellerSearchResponse> {
    let params = new HttpParams();
    if (query) {
      params = params.set('query', query);
    }

    return this.http.get<BestsellerSearchResponse>(`${this.BASE_URL}/search/bestsellers`, { params })
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  /**
   * Endpoint 7: Búsqueda de reseñas críticas (NYT Critic Reviews).
   */
  searchCriticReviews(params: { title?: string, author?: string, isbn?: string }): Observable<ReviewResponse> {
    let httpParams = new HttpParams();
    if (params.title) httpParams = httpParams.set('title', params.title);
    if (params.author) httpParams = httpParams.set('author', params.author);
    if (params.isbn) httpParams = httpParams.set('isbn', params.isbn);

    return this.http.get<ReviewResponse>(`${this.BASE_URL}/search/reviews`, { params: httpParams })
      .pipe(
        catchError(err => this.handleError(err))
      );
  }

  // -------------------------------------------------------------------------
  // Manejador central de errores HTTP
  // Convierte errores de red y del backend en mensajes amigables
  // -------------------------------------------------------------------------
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorData: ErrorResponse;

    if (error.status === 0) {
      // Error de red (sin conexión, CORS, backend caído)
      errorData = {
        status: 'error',
        error_code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor',
        detail: 'Verifica que el backend FastAPI está corriendo en puerto 8000. ' +
                'Ejecuta: deactivate && python run.py'
      };
    } else if (error.error?.detail) {
      // Error estructurado del backend FastAPI
      const detail = error.error.detail;
      if (typeof detail === 'object') {
        errorData = {
          status: 'error',
          error_code: detail.error_code || 'BACKEND_ERROR',
          message: detail.message || 'Error del servidor',
          detail: detail.detail
        };
      } else {
        errorData = {
          status: 'error',
          error_code: 'BACKEND_ERROR',
          message: typeof detail === 'string' ? detail : 'Error del servidor',
        };
      }
    } else {
      // Error HTTP genérico
      errorData = {
        status: 'error',
        error_code: `HTTP_${error.status}`,
        message: `Error HTTP ${error.status}: ${error.statusText}`,
        detail: 'Consulta los logs del backend para más detalles'
      };
    }

    // Re-lanzar como Observable de error para que el componente lo maneje
    return throwError(() => errorData);
  }
}
