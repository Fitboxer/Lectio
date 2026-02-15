import { Libro } from './libro.model';

export type EstadoLectura =
  | 'PENDIENTE'
  | 'LEYENDO'
  | 'LEIDO'
  | 'ABANDONADO'
  | 'FAVORITO';

export interface UsuarioLibro {
  id: number;                 // id de la relación usuario-libro
  usuarioId: number;          // id del usuario
  libro: Libro;               // datos del libro
  estadoActual: EstadoLectura;
  fechaUltimoEstado: string;  // ISO string
}