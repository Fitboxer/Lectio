export interface Autor {
  id?: number;
  nombre: string;
}

export interface Editorial {
  id?: number;
  nombre: string;
}

export interface Genero {
  id?: number;
  nombre: string;
}

export interface Formato {
  id?: number;
  nombre: string;
}

export interface PublicoObjetivo {
  id?: number;
  nombre: string;
}

export interface Libro {
  id: string;
  titulo: string;
  sinopsis?: string;
  isbn?: string;
  anioPublicacion?: number;
  imagen?: string;
  editorial?: Editorial;
  generos?: Genero[];
  isbn13?: string;
  formatos?: Formato[];
  autores?: Autor[];
  publicoObjetivo?: PublicoObjetivo;

  // SOLO LECTURA (Google Books)
  googleAverageRating?: number | null;
  googleRatingsCount?: number | null;
}