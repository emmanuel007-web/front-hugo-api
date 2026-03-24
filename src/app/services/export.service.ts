/**
 * =============================================================================
 * Servicio: Exportación de datos a JSON y CSV
 * =============================================================================
 * Permite exportar cualquier resultado del explorador a archivos descargables.
 * No depende de librerías externas - usa APIs nativas del navegador.
 * =============================================================================
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  /**
   * Exporta datos a un archivo JSON descargable.
   * 
   * @param data - Objeto o array a exportar
   * @param filename - Nombre del archivo (sin extensión)
   */
  exportToJson(data: any, filename: string = 'nytimes-export'): void {
    // Convertir a JSON con formato legible (2 espacios de indentación)
    const jsonString = JSON.stringify(data, null, 2);

    // Crear Blob con tipo MIME correcto
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });

    // Disparar descarga en el navegador
    this.downloadBlob(blob, `${filename}.json`);
  }

  /**
   * Exporta un array de objetos a archivo CSV.
   * Detecta automáticamente las columnas desde las keys del primer objeto.
   * 
   * @param data - Array de objetos a exportar
   * @param filename - Nombre del archivo (sin extensión)
   */
  exportToCsv(data: any[], filename: string = 'nytimes-export'): void {
    if (!data || data.length === 0) {
      console.warn('ExportService: No hay datos para exportar a CSV');
      return;
    }

    // Obtener cabeceras desde las keys del primer objeto
    const headers = Object.keys(data[0]);

    // Construir filas CSV
    const csvRows: string[] = [];

    // Agregar fila de cabeceras
    csvRows.push(headers.map(h => this.escapeCSVValue(h)).join(','));

    // Agregar fila de datos para cada objeto
    for (const row of data) {
      const values = headers.map(header => {
        let value = row[header];
        // Convertir arrays y objetos a string JSON
        if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
          value = JSON.stringify(value);
        }
        return this.escapeCSVValue(String(value ?? ''));
      });
      csvRows.push(values.join(','));
    }

    // Unir todas las filas con salto de línea
    const csvString = '\uFEFF' + csvRows.join('\n'); // BOM para Excel en Windows

    // Crear Blob y descargar
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  /**
   * Normaliza libros para exportación (aplana estructura para CSV)
   */
  normalizeBooksForExport(books: any[]): any[] {
    return books.map(book => ({
      rank: book.rank ?? '',
      titulo: book.title ?? '',
      autor: book.author ?? '',
      editorial: book.publisher ?? '',
      semanas_en_lista: book.weeks_on_list ?? '',
      posicion_semana_pasada: book.rank_last_week ?? '',
      isbn13: book.primary_isbn13 ?? '',
      isbn10: book.primary_isbn10 ?? '',
      descripcion: (book.description ?? '').replace(/,/g, ';'),
      portada_url: book.book_image ?? '',
      amazon_url: book.amazon_product_url ?? '',
      listas: Array.isArray(book.found_in_lists) ? book.found_in_lists.join(' | ') : '',
    }));
  }

  /**
   * Normaliza artículos de reseña para exportación
   */
  normalizeArticlesForExport(articles: any[]): any[] {
    return articles.map(article => ({
      titular: (article.headline ?? '').replace(/,/g, ';'),
      resumen: (article.abstract ?? '').replace(/,/g, ';'),
      fecha_publicacion: article.pub_date ?? '',
      autor_resena: (article.byline ?? '').replace(/,/g, ';'),
      seccion: article.section_name ?? '',
      fuente: article.source ?? '',
      url: article.web_url ?? '',
    }));
  }

  /**
   * Escapa un valor para uso seguro en CSV.
   * Encierra en comillas si contiene comas, comillas o saltos de línea.
   */
  private escapeCSVValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      // Escapar comillas internas duplicándolas
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Crea un enlace temporal y dispara la descarga del Blob.
   */
  private downloadBlob(blob: Blob, filename: string): void {
    // Crear URL temporal para el Blob
    const url = URL.createObjectURL(blob);

    // Crear elemento <a> temporal e invisible
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    // Agregar al DOM, hacer click y limpiar
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar la URL del Blob (buena práctica)
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
}
