import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface EstadoLectura {
  libroId: number;
  estado: 'PENDIENTE' | 'LEYENDO' | 'TERMINADO' | 'ABANDONADO' | 'FAVORITO';
  fechaInicio?: string;
  fechaFin?: string;
  paginasLeidas?: number;
}

export interface LibroBiblioteca {
  id: number;
  libroId: number;
  usuarioId: number;
  estado: string;
  fechaAgregado: string;
  libro: {
    id: number;
    titulo: string;
    imagen?: string;
    autores?: { nombre: string }[];
    anioPublicacion?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BibliotecaService {
  private apiUrl = `${environment.apiUrl}/biblioteca`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtener biblioteca del usuario
   */
  getBiblioteca(usuarioId: number): Observable<LibroBiblioteca[]> {
    const url = `${this.apiUrl}/${usuarioId}/libros`;
    console.log('📚 Obteniendo biblioteca:', url);
    
    return this.http.get<LibroBiblioteca[]>(url).pipe(
      catchError(error => {
        console.error('❌ Error obteniendo biblioteca:', error);
        return of([]);
      })
    );
  }

  /**
   * Cambiar estado de un libro - CORREGIDO
   */
  cambiarEstado(libroId: number, estado: string): Observable<any> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      console.error('❌ No hay usuario autenticado');
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    // Mapeo de estados según tu backend
    let estadoBackend = estado;
    
    // Mapeo de estados del frontend al backend
    switch (estado) {
      case 'Terminado':
      case 'TERMINADO':
      case 'LEIDO':
        estadoBackend = 'LEIDO';
        break;
      case 'Favorito':
      case 'FAVORITO':
        estadoBackend = 'FAVORITO';
        break;
      case 'Pendiente':
      case 'PENDIENTE':
        estadoBackend = 'PENDIENTE';
        break;
      case 'Leyendo':
      case 'LEYENDO':
        estadoBackend = 'LEYENDO';
        break;
      case 'Abandonado':
      case 'ABANDONADO':
        estadoBackend = 'ABANDONADO';
        break;
      default:
        estadoBackend = estado;
    }
    
    // ✅ FORMATO CORRECTO según el error 403
    // El backend espera { estado: "LEIDO" } no { estadoBackend: "LEIDO" }
    const payload = { estado: estadoBackend };
    
    // URL correcta: /api/biblioteca/{usuarioId}/libros/{libroId}/estado
    const url = `${this.apiUrl}/${usuarioId}/libros/${libroId}/estado`;
    
    console.log('📤 Cambiando estado:', { 
      url, 
      payload,
      estadoOriginal: estado,
      estadoMapeado: estadoBackend
    });
    
    return this.http.post(url, payload).pipe(
      catchError(error => {
        console.error('❌ Error en cambiarEstado:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener estado de un libro
   */
  obtenerEstado(libroId: number): Observable<any> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const url = `${this.apiUrl}/${usuarioId}/libros/${libroId}/estado`;
    
    return this.http.get(url).pipe(
      catchError(error => {
        if (error.status === 404) {
          return of(null);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Marcar libro como favorito
   */
  marcarFavorito(libroId: number): Observable<any> {
    return this.cambiarEstado(libroId, 'FAVORITO');
  }

  /**
   * Quitar de favoritos (establecer a PENDIENTE por defecto)
   */
  quitarFavorito(libroId: number): Observable<any> {
    return this.cambiarEstado(libroId, 'PENDIENTE');
  }

  /**
   * Obtener todos los libros favoritos del usuario
   */
  obtenerFavoritos(): Observable<any[]> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const url = `${this.apiUrl}/${usuarioId}/favoritos`;
    return this.http.get<any[]>(url).pipe(
      catchError(error => {
        console.error('Error obteniendo favoritos:', error);
        return of([]);
      })
    );
  }
}