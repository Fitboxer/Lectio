import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();
  
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(clonedRequest).pipe(
      catchError((error: any) => {
        console.error(`❌ Error HTTP ${error.status}: ${req.url}`);
        
        // 🟢 CASO 1: Error de Google Books API - NO cerrar sesión
        if (req.url.includes('googleapis.com')) {
          console.warn('⚠️ Error en Google Books API - NO se cierra sesión');
          return throwError(() => error);
        }
        
        // 🟢 CASO 2: Error en endpoints de libros - NO cerrar sesión
        if (req.url.includes('/api/libros')) {
          console.warn('⚠️ Error en endpoint de libros - NO se cierra sesión');
          return throwError(() => error);
        }
        
        // 🟢 CASO 3: Error en biblioteca - NO cerrar sesión (temporal)
        if (req.url.includes('/api/biblioteca/')) {
          console.warn('⚠️ Error en biblioteca - NO se cierra sesión (temporal)');
          return throwError(() => error);
        }
        
        // 🔴 Solo cerrar sesión para errores 401/403 en endpoints CRÍTICOS
        if (error.status === 401 || error.status === 403) {
          console.error('🔒 Acceso no autorizado a endpoint crítico. Cerrando sesión...');
          authService.logout();
          router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
  
  return next(req);
};
