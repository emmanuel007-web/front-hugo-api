/**
 * Punto de entrada principal de la aplicación Angular 18
 * Usa bootstrapApplication para standalone components (sin NgModule)
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error('Error iniciando Angular:', err));
