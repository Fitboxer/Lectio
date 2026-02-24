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
    
    const params = new HttpParams()
      .set('q', query)
      .set('maxResults', String(maxResults));

    console.log('🌐 Petición a API Google Books:', query);
    
    return this.http
      .get<any>(`${this.googleApi}/volumes`, { params })
      .pipe(
        map((res: any) => {
          const items = res.items ?? [];
          console.log(`📖 Google devolvió ${items.length} libros para "${query}"`);
          
          // ✅ SIMPLEMENTE mapear todos los libros SIN filtrar
          const libros: Libro[] = items.map((item: any) => this.mapGoogleToLibro(item));
          
          console.log(`✅ ${libros.length} libros mapeados`);
          return libros; // ← Devolver TODOS los libros
        }),
        tap((data: Libro[]) => {
          if (data.length > 0) {
            console.log('💾 Guardando en caché:', data.length, 'libros');
            this.saveToCache(cacheKey, data);
          }
        }),
        catchError((error: any) => {
          console.error('❌ Error en búsqueda Google:', error);
          return of([]);
        })
      );
  }

  /** Obtener un único libro de Google Books por su id CON CACHE */
  getLibroGoogleById(googleId: string): Observable<Libro> {
    const cacheKey = `libro_${googleId}`;
    
    // Verificar caché
    const cached = this.cache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      console.log('📚 Libro desde caché:', googleId);
      return of(cached.data);
    }
    
    console.log('🌐 Obteniendo libro de Google Books por ID:', googleId);
    
    // ✅ Para volúmenes específicos, a veces funciona mejor sin parámetros adicionales
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
          
          // Intentar con un enfoque alternativo? No, mejor devolver error
          return throwError(() => new Error(`No se pudo obtener el libro ${googleId}`));
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
      console.log('📚 Catálogo desde caché:', cached.data.length, 'libros');
      return of(cached.data);
    }
    
    // Temas variados para tener un catálogo diverso
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
          return of([]); // Si un tema falla, continuamos con los demás
        })
      )
    );

    return forkJoin(peticiones).pipe(
      map(listas => {
        const todos = listas.flat();
        // Eliminar duplicados por ID
        const mapa = new Map<string, Libro>();
        for (const libro of todos) {
          if (libro?.id) {
            mapa.set(libro.id, libro);
          }
        }
        const resultado = Array.from(mapa.values());
        console.log(`✅ Catálogo generado: ${resultado.length} libros únicos`);
        
        // Guardar catálogo completo en caché
        this.saveToCache(cacheKey, resultado);
        return resultado;
      }),
      catchError(error => {
        console.error('❌ Error fatal en catálogo inicial:', error);
        
        // Si todo falla y tenemos caché, usarlo
        if (cached) {
          console.log('⚠️ Usando caché antiguo como fallback');
          return of(cached.data);
        }
        
        // Último recurso: array vacío
        return of([]);
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
  private mapGoogleToLibro(item: any): Libro {
    try {
      const info = item.volumeInfo ?? {};
      const id = item.id || `google_${Date.now()}_${Math.random()}`;
      
      // Construir URL de imagen de manera robusta
      let imagen = '';
      
      // Intentar obtener la mejor imagen disponible
      if (info.imageLinks) {
        // Preferir thumbnail, luego smallThumbnail
        imagen = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '';
        
        // Asegurar HTTPS
        if (imagen) {
          imagen = imagen.replace('http://', 'https://');
          
          // Eliminar parámetros de zoom para imagen más grande
          imagen = imagen.replace('&zoom=1', '&zoom=3');
        }
      }
      
      // Si no hay imagen, usar placeholder pero NO mock
      if (!imagen) {
        imagen = 'assets/book-placeholder.jpg';
      }
      
      // Extraer año de publicación
      let anioPublicacion: number | undefined = undefined;
        if (info.publishedDate) {
          const añoStr = String(info.publishedDate).slice(0, 4);
          const anio = parseInt(añoStr, 10);
          if (!isNaN(anio)) {
            anioPublicacion = anio;
          }
        }
      
      // Procesar autores
      const autores = (info.authors ?? []).map((nombre: string) => ({ 
        id: undefined, 
        nombre: nombre 
      }));
      
      // Procesar géneros (categorías)
      const generos = (info.categories ?? []).map((categoria: string) => ({ 
        id: undefined, 
        nombre: categoria.split('/')[0].trim() // Tomar solo primera categoría
      }));
      
      // Extraer ISBN
      let isbn13 = null;
      if (info.industryIdentifiers) {
        const isbn13Obj = info.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
        if (isbn13Obj) isbn13 = isbn13Obj.identifier;
        else {
          const isbn10Obj = info.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
          if (isbn10Obj) isbn13 = isbn10Obj.identifier;
        }
      }
      
      // Construir objeto Libro
      const libro: Libro = {
        id: id,
        titulo: info.title ?? 'Título no disponible',
        sinopsis: info.description ?? '',
        imagen: imagen,
        anioPublicacion: anioPublicacion,
        editorial: info.publisher ? { id: undefined, nombre: info.publisher } : undefined,
        autores: autores,
        generos: generos,
        isbn13: isbn13,
        googleAverageRating: info.averageRating ?? null,
        googleRatingsCount: info.ratingsCount ?? null
      };
      
      // Log para debug (primeros 3 libros)
      if (Math.random() < 0.1) { // Solo log 10% de las veces para no saturar
        console.log('📖 Libro mapeado:', {
          titulo: libro.titulo,
          autores: autores.length,
          generos: generos.length,
          tieneImagen: !!imagen && !imagen.includes('placeholder')
        });
      }
      
      return libro;
      
    } catch (error) {
      console.error('❌ Error mapeando libro:', error, item);
      // Devolver un libro mínimo pero válido
      return {
        id: item.id || `error_${Date.now()}`,
        titulo: 'Error al cargar libro',
        imagen: 'assets/book-placeholder.jpg',
        autores: []
      } as Libro;
    }
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