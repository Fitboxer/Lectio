import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map, of, tap, catchError, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { Libro } from '../models/libro.model';

interface CacheItem {
  data: any;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class LibrosService {
  private googleApi = 'https://www.googleapis.com/books/v1';
  private apiUrl = `${environment.apiUrl}/libros`;
  
  // Cache en memoria
  private cache = new Map<string, CacheItem>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas
  private readonly CACHE_KEY = 'google_books_cache';

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined') {
      this.loadCacheFromStorage();
    }
  }

  /** Búsqueda genérica en Google Books CON CACHE */
  buscarGoogle(query: string, maxResults = 24): Observable<Libro[]> {
    const cacheKey = `buscar_${query}_${maxResults}`;
    
    // Verificar caché
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log('📚 Retornando desde caché:', query);
      return of(cached.data);
    }
    
    // ✅ SIN API KEY - Solo parámetros básicos
    const params = new HttpParams()
      .set('q', query)
      .set('maxResults', String(maxResults));

    console.log('🌐 Petición a API:', query);
    
    return this.http
      .get<any>(`${this.googleApi}/volumes`, { params })
      .pipe(
        map(res => (res.items ?? []).map((it: any) => this.mapGoogleToLibro(it))),
        tap(data => {
          this.saveToCache(cacheKey, data);
        }),
        catchError(error => {
          console.error('Error en búsqueda Google:', error);
          
          // Si hay error, devolver datos mock
          return this.getMockLibros(query, maxResults);
        })
      );
  }

  /** Obtener un único libro de Google Books por su id CON CACHE */
  getLibroGoogleById(googleId: string): Observable<Libro> {
    const cacheKey = `libro_${googleId}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return of(cached.data);
    }
    
    // ✅ SIN API KEY
    return this.http
      .get<any>(`${this.googleApi}/volumes/${googleId}`)
      .pipe(
        map(v => this.mapGoogleToLibro(v)),
        tap(libro => {
          this.saveToCache(cacheKey, libro);
        }),
        catchError(error => {
          console.error('Error obteniendo libro por ID:', error);
          
          if (cached) {
            return of(cached.data);
          }
          
          // Mock de libro por ID
          return of(this.createMockLibro(googleId));
        })
      );
  }

  getLibroBackendById(id: number): Observable<Libro> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(data => ({
        id: data.id?.toString() || data.id,
        titulo: data.titulo || '',
        sinopsis: data.sinopsis || '',
        // ✅ Usar 'imagen' del backend
        imagen: data.imagen ? data.imagen.replace('http://', 'https://') : '',
        anioPublicacion: data.anioPublicacion,
        editorial: data.editorial,
        autores: data.autores || [],
        generos: data.generos || [],
        googleId: data.googleId,
        isbn13: data.isbn13
      } as Libro))
    );
  }

  buscarLibroPorGoogleId(googleId: string): Observable<{ id: number; existe: boolean }> {
    return this.http.get<{ id: number; existe: boolean }>(`${this.apiUrl}/google/${googleId}`)
      .pipe(
        catchError(error => {
          if (error.status === 404) {
            // El libro NO existe (es normal, devolvemos existe=false)
            return of({ id: 0, existe: false });
          }
          // Otro tipo de error (500, 403, etc.) lo propagamos
          return throwError(() => error);
        })
      );
  }

  /** Catálogo inicial con caché mejorado */
  getCatalogoInicial(): Observable<Libro[]> {
    const cacheKey = 'catalogo_inicial';
    
    // Verificar caché primero
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log('📚 Catálogo desde caché');
      return of(cached.data);
    }
    
    const temas = [
      'subject:fiction',
      'subject:fantasy',
      'subject:history',
      'subject:romance',
      'subject:mystery',
      'subject:thriller'
    ];

    // Solo hacer peticiones si no están en caché individualmente
      const peticiones = temas.map((tema) => {
      const temaCacheKey = `tema_${tema}`;
      const temaCached = this.cache.get(temaCacheKey);
      
      if (temaCached && this.isCacheValid(temaCached)) {
        return of(temaCached.data);
      }
      
      return this.buscarGoogle(tema, 8).pipe(
        tap(data => this.saveToCache(temaCacheKey, data))
      );
    });

    return forkJoin(peticiones).pipe(
      map((listas) => {
        const todos = listas.flat();
        const mapa = new Map<string, Libro>();
        
        for (const libro of todos) {
          mapa.set(libro.id, libro);
        }
        
        const resultado = Array.from(mapa.values());
        
        // Guardar catálogo completo en caché
        this.saveToCache(cacheKey, resultado);
        
        return resultado;
      }),
      catchError(error => {
        console.error('Error en catálogo inicial:', error);
        
        if (cached) {
          return of(cached.data);
        }
        
        // Si todo falla, devolver catálogo mock
        return of(this.createMockCatalogo());
      })
    );
  }

  /** Métodos originales (sin cambios) */
  crearLibroEnBackendDesdeGoogle(libroGoogle: Libro): Observable<{ id: number }> {
    
    const autores = (libroGoogle.autores || []).map(autor => 
      autor.nombre || autor
    );
    
    const generos = (libroGoogle.generos || []).map(genero => 
      genero.nombre || genero
    );
    
    // ⚠️ EXTRAE EL NOMBRE COMO STRING (no envíes objeto)
    const editorial = libroGoogle.editorial?.nombre || libroGoogle.editorial;
    
    const payload = {
      titulo: libroGoogle.titulo,
      sinopsis: libroGoogle.sinopsis,
      imagen: libroGoogle.imagen,
      anioPublicacion: libroGoogle.anioPublicacion,
      editorial: editorial,  // ← AHORA ES UN STRING (no objeto)
      autores: autores,
      generos: generos,
      googleId: libroGoogle.id,
      isbn13: (libroGoogle as any).isbn13 || null
    };

    console.log('📤 Enviando payload a /api/libros/google (como String):', payload);
    
    return this.http.post<{ id: number }>(`${this.apiUrl}/google`, payload);
  }

  getCatalogoGoogle(porDefecto = 'bestseller'): Observable<Libro[]> {
    return this.buscarGoogle(porDefecto);
  }

  getLibrosBackend(): Observable<Libro[]> {
    return this.http.get<Libro[]>(`${this.apiUrl}`);
  }

  // -------------------------
  // Sistema de Caché
  // -------------------------
  
  private isCacheValid(cachedItem: CacheItem): boolean {
    const now = Date.now();
    return (now - cachedItem.timestamp) < this.CACHE_DURATION;
  }

  private saveToCache(key: string, data: any): void {
    const cacheItem: CacheItem = {
      data: data,
      timestamp: Date.now()
    };
    
    this.cache.set(key, cacheItem);
    this.saveCacheToStorage();
  }

  private saveCacheToStorage(): void {
    try {
      const cacheObj = Object.fromEntries(this.cache);
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheObj));
    } catch (e) {
      console.warn('No se pudo guardar caché en localStorage:', e);
    }
  }

  private loadCacheFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(this.CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          for (const [key, value] of Object.entries(parsed)) {
            this.cache.set(key, value as CacheItem);
          }
          console.log('Caché cargado:', this.cache.size, 'items');
        }
      } else {
        console.log('Entorno no navegador, caché no cargado');
      }
    } catch (e) {
      console.warn('Error cargando caché:', e);
    }
  }

  /** Métodos para debug/control del caché */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(this.CACHE_KEY);
    console.log('✅ Caché limpiado');
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  // -------------------------
  // Datos Mock (respaldo)
  // -------------------------
  
  private getMockLibros(query: string, count: number): Observable<Libro[]> {
    const mockLibros: Libro[] = [];
    
    for (let i = 1; i <= count; i++) {
      mockLibros.push(this.createMockLibro(`${query}_${i}`));
    }
    
    return of(mockLibros);
  }

  private createMockLibro(id: string): Libro {
    const temas = ['Ficción', 'Fantasía', 'Historia', 'Romance', 'Misterio', 'Thriller'];
    const temaAleatorio = temas[Math.floor(Math.random() * temas.length)];
    
    return {
      id: id,
      titulo: `Libro ${temaAleatorio} ${Math.floor(Math.random() * 1000)}`,
      sinopsis: `Esta es una descripción de ejemplo para un libro de ${temaAleatorio.toLowerCase()}.`,
      portadaUrl: 'assets/book-placeholder.jpg',
      anioPublicacion: 2000 + Math.floor(Math.random() * 24),
      editorial: { nombre: 'Editorial Ejemplo' },
      autores: [{ nombre: 'Autor Ejemplo' }],
      generos: [{ nombre: temaAleatorio }],
      googleAverageRating: 3 + Math.random() * 2,
      googleRatingsCount: Math.floor(Math.random() * 1000)
    } as any;
  }

  private createMockCatalogo(): Libro[] {
    const catalogo: Libro[] = [];
    const temas = ['Ficción', 'Fantasía', 'Historia', 'Romance', 'Misterio', 'Thriller'];
    
    temas.forEach((tema, index) => {
      for (let i = 1; i <= 8; i++) {
        catalogo.push({
          id: `${tema.toLowerCase()}_${index}_${i}`,
          titulo: `${tema} Libro ${i}`,
          sinopsis: `Una emocionante historia de ${tema.toLowerCase()}.`,
          portadaUrl: 'assets/book-placeholder.jpg',
          anioPublicacion: 2010 + i,
          editorial: { nombre: `${tema} Publishing` },
          autores: [{ nombre: `Autor ${tema} ${i}` }],
          generos: [{ nombre: tema }],
          googleAverageRating: 4.0 + Math.random(),
          googleRatingsCount: 100 + Math.floor(Math.random() * 900)
        } as any);
      }
    });
    
    return catalogo;
  }

  // -------------------------
  // Mapeo Google -> Libro (sin cambios)
  // -------------------------
  private mapGoogleToLibro(v: any): Libro {
    const info = v.volumeInfo ?? {};
    
    let imagen = '';
    
    if (v.id) {
      imagen = `https://books.google.com/books/content?id=${v.id}&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api`;
    } 
    else {
      imagen = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
    }
    
    if (imagen) {
      imagen = imagen.replace('http://', 'https://');
    }
    
    return {
      id: v.id,
      titulo: info.title ?? 'Sin título',
      sinopsis: info.description ?? '',
      imagen: imagen,
      anioPublicacion: info.publishedDate
        ? Number(String(info.publishedDate).slice(0, 4))
        : null,
      editorial: info.publisher ? { nombre: info.publisher } : null,
      autores: (info.authors ?? []).map((n: string) => ({ nombre: n })),
      generos: (info.categories ?? []).map((c: string) => ({ nombre: c })),
      googleAverageRating: info.averageRating ?? null,
      googleRatingsCount: info.ratingsCount ?? null,
      isbn13: this.extraerIsbn13(info)
    } as Libro;
  }

  private extraerIsbn13(info: any): string | null {
      if (info.industryIdentifiers) {
          const isbn13Obj = info.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
          if (isbn13Obj) return isbn13Obj.identifier;
          const isbn10Obj = info.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
          if (isbn10Obj) return isbn10Obj.identifier;
      }
      return null;
  }

}