import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Comentario {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  libroId: number;
  contenido: string;
  fechaCreacion: string;
  editado: boolean;
}

export interface NuevoComentario {
  contenido: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComentarioService {
  private apiUrl = `${environment.apiUrl}/comentarios`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener TODOS los comentarios de un libro (acceso público)
   */
  obtenerComentarios(libroId: number): Observable<Comentario[]> {
    const url = `${this.apiUrl}/libro/${libroId}`;
    console.log('💬 Obteniendo TODOS los comentarios de:', url);
    return this.http.get<Comentario[]>(url);
  }

  /**
   * Crear un nuevo comentario (requiere autenticación)
   */
  crearComentario(libroId: number, contenido: string): Observable<Comentario> {
    const url = `${this.apiUrl}/libro/${libroId}`;
    const payload: NuevoComentario = { contenido };
    console.log('💬 Creando comentario:', { url, contenido });
    return this.http.post<Comentario>(url, payload);
  }

  /**
   * Eliminar un comentario (solo admin)
   */
  eliminarComentario(comentarioId: number): Observable<void> {
    const url = `${this.apiUrl}/${comentarioId}`;
    console.log('💬 Eliminando comentario:', url);
    return this.http.delete<void>(url);
  }
}