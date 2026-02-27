import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, of, tap, map, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Libro } from '../models/libro.model';

interface CacheItem {
  data: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class LibrosService {
  private googleApi = 'https://www.googleapis.com/books/v1';
  private apiUrl = `${environment.apiUrl}/libros`;
  
  private cache = new Map<string, CacheItem>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000;
  private readonly CACHE_KEY = 'google_books_cache';

  constructor(private http: HttpClient) {
    this.loadCacheFromStorage();
  }

  /**
   * Búsqueda genérica en Google Books
   */
  buscarGoogle(query: string, maxResults = 24): Observable<Libro[]> {
    const cacheKey = `buscar_${query}_${maxResults}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log('📚 Retornando desde caché:', query);
      return of(cached.data);
    }
    
    const params = new HttpParams()
      .set('q', query)
      .set('maxResults', String(maxResults))
      .set('langRestrict', 'es');

    console.log('🌐 Petición a API Google Books:', query);
    
    return this.http
      .get<any>(`${this.googleApi}/volumes`, { params })
      .pipe(
        map(res => {
          const items = res.items ?? [];
          console.log(`📖 Google devolvió ${items.length} libros para "${query}"`);
          return items.map((item: any) => this.mapGoogleToLibro(item));
        }),
        tap(data => {
          if (data.length > 0) {
            console.log('💾 Guardando en caché:', data.length, 'libros');
            this.saveToCache(cacheKey, data);
          }
        }),
        catchError(error => {
          console.error('❌ Error en búsqueda Google:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtener un libro específico de Google Books por su ID - CORREGIDO
   * Ahora usa el endpoint público sin necesidad de API key
   */
  getLibroGoogleById(googleId: string): Observable<Libro> {
    const cacheKey = `libro_${googleId}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log('📚 Libro desde caché:', googleId);
      return of(cached.data);
    }
    
    console.log('🌐 Obteniendo libro de Google Books por ID:', googleId);
    
    // ✅ SIN PARÁMETROS - URL limpia
    // Para volúmenes específicos, a veces funciona mejor sin parámetros
    return this.http
      .get<any>(`${this.googleApi}/volumes/${googleId}`)
      .pipe(
        map(item => {
          console.log('✅ Libro obtenido de Google:', item.id);
          return this.mapGoogleToLibro(item);
        }),
        tap(libro => {
          console.log('💾 Guardando libro en caché:', libro.titulo);
          this.saveToCache(cacheKey, libro);
        }),
        catchError(error => {
          console.error('❌ Error obteniendo libro por ID:', {
            id: googleId,
            status: error.status,
            message: error.message
          });
          
          // ✅ Intentar con otro formato si falla
          return this.getLibroGoogleByIdAlternativo(googleId);
        })
      );
  }

  /**
   * Método alternativo para obtener libro por ID (con proyección)
   */
  private getLibroGoogleByIdAlternativo(googleId: string): Observable<Libro> {
    console.log('🔄 Intentando método alternativo para:', googleId);
    
    const params = new HttpParams()
      .set('projection', 'full')
      .set('country', 'ES');

    return this.http
      .get<any>(`${this.googleApi}/volumes/${googleId}`, { params })
      .pipe(
        map(item => this.mapGoogleToLibro(item)),
        tap(libro => {
          console.log('✅ Libro obtenido con método alternativo');
          this.saveToCache(`libro_${googleId}`, libro);
        }),
        catchError(error => {
          console.error('❌ También falló método alternativo:', error);
          return throwError(() => new Error(`No se pudo obtener el libro ${googleId}`));
        })
      );
  }

  crearLibroEnBackendDesdeGoogle(libroGoogle: Libro): Observable<{ id: number }> {
    console.log('📤 Creando libro en backend desde Google:', libroGoogle.titulo);
    
    // Preparar autores como strings
    const autores = (libroGoogle.autores || []).map(autor => 
      typeof autor === 'string' ? autor : (autor.nombre || '')
    ).filter(Boolean);
    
    // Preparar géneros como strings
    const generos = (libroGoogle.generos || []).map(genero => 
      typeof genero === 'string' ? genero : (genero.nombre || '')
    ).filter(Boolean);
    
    // Editorial como string
    const editorial = typeof libroGoogle.editorial === 'string' 
      ? libroGoogle.editorial 
      : (libroGoogle.editorial?.nombre || '');
    
    const payload = {
      titulo: libroGoogle.titulo,
      sinopsis: libroGoogle.sinopsis || '',
      imagen: libroGoogle.imagen || '',
      anioPublicacion: libroGoogle.anioPublicacion,
      editorial: editorial,
      autores: autores,
      generos: generos,
      googleId: libroGoogle.id,
      isbn13: (libroGoogle as any).isbn13 || null
    };

    console.log('📤 Payload:', payload);
    
    return this.http.post<{ id: number }>(`${this.apiUrl}/google`, payload).pipe(
      tap(response => console.log('✅ Libro creado:', response)),
      catchError(error => {
        console.error('❌ Error creando libro:', error);
        // Devolver un error para que el componente lo maneje
        return throwError(() => error);
      })
    );
  }

  /**
   * Obtener libro del backend por ID
   */
  getLibroBackendById(id: number): Observable<Libro> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(data => ({
        id: data.id?.toString() || data.id,
        titulo: data.titulo || '',
        sinopsis: data.sinopsis || '',
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

  /**
   * Buscar si un libro existe en el backend por su Google ID
   */
  buscarLibroPorGoogleId(googleId: string): Observable<{ id: number; existe: boolean }> {
    return this.http.get<{ id: number; existe: boolean }>(`${this.apiUrl}/google/${googleId}`)
      .pipe(
        catchError(error => {
          if (error.status === 404) {
            return of({ id: 0, existe: false });
          }
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtener libros destacados
   */
  getLibrosDestacados(consulta: string = 'bestseller'): Observable<Libro[]> {
    return this.buscarGoogle(consulta, 24);
  }

  /**
   * Catálogo inicial
   */
  getCatalogoInicial(): Observable<Libro[]> {
    const cacheKey = 'catalogo_inicial';
    
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log('📚 Catálogo desde caché:', cached.data.length, 'libros');
      return of(cached.data);
    }
    
    const temas = [
      'subject:fiction',
      'subject:fantasy',
      'subject:history',
      'subject:romance',
      'subject:science+fiction',
      'subject:mystery',
      'subject:thriller',
      'subject:biography'
    ];

    console.log('🌐 Cargando catálogo inicial desde Google Books...');
    
    const peticiones = temas.map(tema => 
      this.buscarGoogle(tema, 8).pipe(
        catchError(err => {
          console.warn(`Error cargando tema ${tema}:`, err);
          return of([]);
        })
      )
    );

    return forkJoin(peticiones).pipe(
      map(listas => {
        const todos = listas.flat();
        const mapa = new Map<string, Libro>();
        for (const libro of todos) {
          if (libro?.id) {
            mapa.set(libro.id, libro);
          }
        }
        const resultado = Array.from(mapa.values());
        console.log(`✅ Catálogo generado: ${resultado.length} libros únicos`);
        this.saveToCache(cacheKey, resultado);
        return resultado;
      }),
      catchError(error => {
        console.error('❌ Error fatal en catálogo inicial:', error);
        if (cached) {
          return of(cached.data);
        }
        return of([]);
      })
    );
  }

  /**
   * Mapear respuesta de Google Books a nuestro modelo Libro
   */
  private mapGoogleToLibro(item: any): Libro {
    try {
      const info = item.volumeInfo ?? {};
      const id = item.id || `google_${Date.now()}_${Math.random()}`;
      
      let imagen = '';
      if (info.imageLinks) {
        imagen = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '';
        if (imagen) {
          imagen = imagen.replace('http://', 'https://');
          imagen = imagen.replace('&zoom=1', '&zoom=3');
        }
      }
      
      if (!imagen) {
        imagen = 'assets/book-placeholder.jpg';
      }
      
      let anioPublicacion: number | undefined = undefined;
      if (info.publishedDate) {
        const añoStr = String(info.publishedDate).slice(0, 4);
        const anio = parseInt(añoStr, 10);
        if (!isNaN(anio)) {
          anioPublicacion = anio;
        }
      }
      
      const autores = (info.authors ?? []).map((nombre: string) => ({ 
        id: undefined, 
        nombre: nombre 
      }));
      
      const generos = (info.categories ?? []).map((categoria: string) => ({ 
        id: undefined, 
        nombre: categoria.split('/')[0].trim()
      }));
      
      return {
        id: id,
        titulo: info.title ?? 'Título no disponible',
        sinopsis: info.description ?? '',
        imagen: imagen,
        anioPublicacion: anioPublicacion,
        editorial: info.publisher ? { id: undefined, nombre: info.publisher } : undefined,
        autores: autores,
        generos: generos
      } as Libro;
      
    } catch (error) {
      console.error('❌ Error mapeando libro:', error);
      return {
        id: `error_${Date.now()}`,
        titulo: 'Error al cargar libro',
        imagen: 'assets/book-placeholder.jpg',
        autores: []
      } as Libro;
    }
  }

  // Sistema de Caché
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
      const stored = localStorage.getItem(this.CACHE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        for (const [key, value] of Object.entries(parsed)) {
          this.cache.set(key, value as CacheItem);
        }
        console.log('Caché cargado:', this.cache.size, 'items');
      }
    } catch (e) {
      console.warn('Error cargando caché:', e);
    }
  }

  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(this.CACHE_KEY);
    console.log('✅ Caché limpiado');
  }
}