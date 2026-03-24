/**
 * Definición de rutas de la aplicación
 * La aplicación es SPA con una sola vista principal
 */
import { Routes } from '@angular/router';

export const routes: Routes = [
  // Ruta principal - el menú y todo el contenido está en AppComponent
  { path: '', redirectTo: '/', pathMatch: 'full' },
  // Ruta comodín - redirige al inicio
  { path: '**', redirectTo: '/' }
];
