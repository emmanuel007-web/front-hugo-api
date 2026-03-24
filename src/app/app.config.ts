/**
 * Configuración central de la aplicación Angular 18
 * Configura HttpClient y proveedores globales sin NgModule
 */
import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    // Router de Angular con las rutas definidas
    provideRouter(routes),
    
    // HttpClient con Fetch API (mejor rendimiento en Angular 18)
    provideHttpClient(withFetch()),
    
    // Animaciones de Angular
    provideAnimations(), provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ]
};
