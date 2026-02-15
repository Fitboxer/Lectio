import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UsuarioLibro } from '../models/usuario-libro.model';
import { EstadoLectura } from '../models/usuario-libro.model';

export type EstadoLecturaBackend = 'Pendiente' | 'Leyendo' | 'Terminado' | 'Abandonado' | 'Favorito';

@Injectable({
  providedIn: 'root'
})
export class BibliotecaService {

  private apiUrl = `${environment.apiUrl}/biblioteca`;

  constructor(private http: HttpClient) {}

  /** 📚 Obtener biblioteca del usuario */
  getBiblioteca(usuarioId: number): Observable<UsuarioLibro[]> {
    return this.http.get<UsuarioLibro[]>(`${this.apiUrl}/${usuarioId}/libros`);
  }

  /** ➕ Añadir libro */
  agregarLibro(usuarioId: number, libroId: number): Observable<UsuarioLibro> {
    const url = `${this.apiUrl}/${usuarioId}/libros/${libroId}`;
    console.log('📤 Llamando a POST:', url);
    return this.http.post<UsuarioLibro>(url, {});
  }

  /** ❌ Eliminar libro */
  eliminarLibro(usuarioId: number, libroId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${usuarioId}/libros/${libroId}`
    );
  }

  /** 🔄 Cambiar estado */
  cambiarEstado(usuarioId: number, libroId: number, estado: EstadoLecturaBackend): Observable<any> {
    const url = `${this.apiUrl}/${usuarioId}/libros/${libroId}/estado`;
    console.log('📤 Llamando a:', url);
    console.log('📤 Payload:', { estado });
    
    return this.http.post(url, { estado });
  }

  getBibliotecaUsuario(usuarioId: number) {
    return this.http.get<any[]>(`${this.apiUrl}/${usuarioId}/libros`);
  }

  verificarLibroEnBiblioteca(usuarioId: number, libroId: number): Observable<{
    enBiblioteca: boolean;
    estado: EstadoLecturaBackend | null;
  }> {
    return this.http.get<{ enBiblioteca: boolean; estado: EstadoLecturaBackend | null }>(
      `${this.apiUrl}/usuarios/${usuarioId}/libros/${libroId}/verificar`
    );
  }
}
