import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Lista blanca de URLs públicas
    const urlsPublicas = [
      'googleapis.com/books',
      '/auth/login',
      '/auth/register',
      '/api/libros/google',
    ];

    const esUrlPublica = urlsPublicas.some(url => req.url.includes(url));

    if (esUrlPublica) {
      console.log('🔓 URL pública, sin token:', req.url);
      return next.handle(req);
    }

    const token = this.authService.getToken();
    
    if (token) {
      console.log('🔐 Token siendo enviado:', token.substring(0, 20) + '...');
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error HTTP:', error.status, req.url);
        
        // ✅ SOLO cerrar sesión si es 401 (no autorizado)
        // ✅ NO cerrar sesión en 403 (prohibido) porque puede ser que el libro no esté en biblioteca
        if (error.status === 401) {
          console.log('🔐 Error de autenticación (401), cerrando sesión');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // 403 puede ser "libro no en biblioteca" - NO cerrar sesión
          console.log('⚠️ Error 403 - NO se cierra sesión (puede ser libro no en biblioteca)');
        }
        
        return throwError(() => error);
      })
    );
  }
}