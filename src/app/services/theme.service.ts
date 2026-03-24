/**
 * =============================================================================
 * Servicio: Gestión del Tema (Modo Oscuro/Claro)
 * =============================================================================
 * Persiste la preferencia del usuario en localStorage.
 * Aplica/quita la clase 'dark' en el elemento <html>.
 * Detecta automáticamente la preferencia del sistema operativo.
 * =============================================================================
 */

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  // Signal de Angular 18 para reactividad del tema
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.initTheme();
  }

  /**
   * Inicializa el tema al cargar la aplicación.
   * Prioridad: 1) localStorage, 2) preferencia del OS, 3) claro por defecto
   */
  private initTheme(): void {
    const saved = localStorage.getItem('nyt-theme');

    if (saved) {
      // Usar preferencia guardada previamente
      this.applyTheme(saved === 'dark');
    } else {
      // Detectar preferencia del sistema operativo
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark);
    }
  }

  /**
   * Alterna entre modo oscuro y claro.
   */
  toggleTheme(): void {
    this.applyTheme(!this.isDarkMode());
  }

  /**
   * Aplica el tema y lo persiste en localStorage.
   * 
   * @param dark - true para modo oscuro, false para claro
   */
  private applyTheme(dark: boolean): void {
    this.isDarkMode.set(dark);

    // Aplicar/quitar clase 'dark' en <html> (Tailwind darkMode: 'class')
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Persistir en localStorage
    localStorage.setItem('nyt-theme', dark ? 'dark' : 'light');
  }
}
