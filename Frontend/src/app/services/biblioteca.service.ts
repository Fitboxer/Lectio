import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface EstadoLectura {
  libroId: number;
  estado: 'Pendiente' | 'Leyendo' | 'Terminado' | 'Abandonado';
  esFavorito: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  paginasLeidas?: number;
}

export interface NotaLibro {
  id?: number;
  usuarioId: number;
  libroId: number;
  contenido: string;
  fechaCreacion?: string;
  fechaActualizacion?: string;
}

export interface LibroBiblioteca {
  id: number;
  usuarioId: number;
  libroId: number;
  libro: {
    id: number;
    titulo: string;
    imagen?: string;
    autores?: { nombre: string }[];
    anioPublicacion?: number;
  };
  fechaAgregado: string;
  estadoActual: string;
  esFavorito?: boolean;
  notas?: NotaLibro[];
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

  // ============================================
  // 📚 GESTIÓN DE BIBLIOTECA
  // ============================================

  getBiblioteca(usuarioId: number): Observable<LibroBiblioteca[]> {
    const url = `${this.apiUrl}/${usuarioId}/libros`;
    console.log('📚 Obteniendo biblioteca de:', url);
    
    return this.http.get<LibroBiblioteca[]>(url).pipe(
      catchError(error => {
        console.error('❌ Error obteniendo biblioteca:', error);
        return of([]);
      })
    );
  }

  agregarLibroABiblioteca(libroId: number): Observable<any> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const url = `${this.apiUrl}/${usuarioId}/libros/${libroId}`;
    console.log('📤 Agregando libro a biblioteca:', url);
    
    return this.http.post(url, {}).pipe(
      tap(response => console.log('✅ Libro agregado a biblioteca:', response)),
      catchError(error => {
        console.error('❌ Error agregando libro a biblioteca:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * 🗑️ ELIMINAR LIBRO DE LA BIBLIOTECA (quitar estado)
   */
  eliminarLibroDeBiblioteca(libroId: number): Observable<void> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const url = `${this.apiUrl}/${usuarioId}/libros/${libroId}`;
    console.log('🗑️ Eliminando libro de biblioteca:', url);
    
    return this.http.delete<void>(url).pipe(
      tap(() => console.log('✅ Libro eliminado de biblioteca')),
      catchError(error => {
        console.error('❌ Error eliminando libro de biblioteca:', error);
        return throwError(() => error);
      })
    );
  }

  obtenerEstado(libroId: number): Observable<any> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const url = `${this.apiUrl}/${usuarioId}/libros/${libroId}/estado`;
    console.log('🔍 Obteniendo estado de:', url);
    
    return this.http.get(url).pipe(
      tap(data => console.log('✅ Estado obtenido:', data)),
      catchError(error => {
        console.error('❌ Error obteniendo estado:', error);
        if (error.status === 403 || error.status === 404) {
          return of(null);
        }
        return throwError(() => error);
      })
    );
  }

  cambiarEstadoLectura(libroId: number, estado: string): Observable<any> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    let estadoBackend = '';
    switch (estado) {
      case 'PENDIENTE': estadoBackend = 'Pendiente'; break;
      case 'LEYENDO': estadoBackend = 'Leyendo'; break;
      case 'LEIDO': 
      case 'TERMINADO': estadoBackend = 'Terminado'; break;
      case 'ABANDONADO': estadoBackend = 'Abandonado'; break;
      default: estadoBackend = estado;
    }
    
    const url = `${this.apiUrl}/${usuarioId}/libros/${libroId}/estado`;
    const payload = { estado: estadoBackend };
    
    console.log('📤 Cambiando estado lectura:', { url, payload });
    
    return this.http.post(url, payload).pipe(
      tap(response => console.log('✅ Estado actualizado:', response)),
      catchError(error => {
        console.error('❌ Error cambiando estado:', error);
        return throwError(() => error);
      })
    );
  }

  toggleFavorito(libroId: number): Observable<any> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const url = `${this.apiUrl}/${usuarioId}/libros/${libroId}/favorito`;
    console.log('⭐ Toggle favorito:', url);
    
    return this.http.post(url, {}).pipe(
      catchError(error => {
        console.error('❌ Error toggling favorito:', error);
        return throwError(() => error);
      })
    );
  }

  // ============================================
  // 📝 GESTIÓN DE NOTAS PERSONALES
  // ============================================

  obtenerNotas(libroId: number): Observable<NotaLibro[]> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const url = `${this.apiUrl}/${usuarioId}/libros/${libroId}/notas`;
    console.log('📝 Obteniendo notas de:', url);
    
    return this.http.get<NotaLibro[]>(url).pipe(
      tap(notas => console.log(`✅ ${notas.length} notas obtenidas`)),
      catchError(error => {
        console.error('❌ Error obteniendo notas:', error);
        return of([]);
      })
    );
  }

  crearNota(libroId: number, contenido: string): Observable<NotaLibro> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const url = `${this.apiUrl}/${usuarioId}/libros/${libroId}/notas`;
    const payload = { contenido };
    
    console.log('📝 Creando nota:', { url, contenido });
    
    return this.http.post<NotaLibro>(url, payload).pipe(
      tap(nota => console.log('✅ Nota creada:', nota)),
      catchError(error => {
        console.error('❌ Error creando nota:', error);
        return throwError(() => error);
      })
    );
  }

  actualizarNota(notaId: number, contenido: string): Observable<NotaLibro> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const url = `${this.apiUrl}/notas/${notaId}`;
    const payload = { contenido };
    
    console.log('📝 Actualizando nota:', { url, contenido });
    
    return this.http.put<NotaLibro>(url, payload).pipe(
      tap(nota => console.log('✅ Nota actualizada:', nota)),
      catchError(error => {
        console.error('❌ Error actualizando nota:', error);
        return throwError(() => error);
      })
    );
  }

  eliminarNota(notaId: number): Observable<void> {
    const usuarioId = this.authService.getUsuarioId();
    
    if (!usuarioId) {
      return throwError(() => new Error('Usuario no autenticado'));
    }
    
    const url = `${this.apiUrl}/notas/${notaId}`;
    console.log('📝 Eliminando nota:', url);
    
    return this.http.delete<void>(url).pipe(
      tap(() => console.log('✅ Nota eliminada')),
      catchError(error => {
        console.error('❌ Error eliminando nota:', error);
        return throwError(() => error);
      })
    );
  }
}