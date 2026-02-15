import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BibliotecaService, EstadoLecturaBackend } from '../../services/biblioteca.service';  
import { LibrosService } from '../../services/libros.service';
import { Libro } from '../../models/libro.model';
import { of, switchMap, catchError, tap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

type EstadoUI = 'PENDIENTE' | 'LEYENDO' | 'ABANDONADO' | 'LEIDO' | 'FAVORITO';

@Component({
  selector: 'app-libro-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './libro-detalle.component.html',
  styleUrls: ['./libro-detalle.component.css']
})
export class LibroDetalleComponent implements OnInit {
  libro?: Libro | null = null;
  cargando = true;
  error = '';
  libroDbId?: number;
  usuarioId: number = 0;
  enBiblioteca = false; 
  estadoActual: EstadoLecturaBackend | null = null;

  googleAverageRating: number | null = null;
  googleRatingsCount: number | null = null;

  sinopsisHtml: SafeHtml | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private librosService: LibrosService,
    private sanitizer: DomSanitizer,
    private bibliotecaService: BibliotecaService,
    public authService: AuthService
  ) {
    if (this.authService.isLoggedIn()) {
      this.usuarioId = this.authService.getUserId();
    }
  }

  ngOnInit(): void {
    const libroId = this.route.snapshot.paramMap.get('id');
    console.log('📖 ID recibido en detalle:', libroId);

    if (!libroId) {
      this.cargando = false;
      this.error = 'Identificador de libro no válido.';
      return;
    }

    this.cargando = true;
    this.error = '';

    if (this.esGoogleId(libroId)) {
      this.cargarLibroGoogle(libroId);
    } else {
      this.cargarLibroBackend(Number(libroId));
    }
  }

  private esGoogleId(id: string): boolean {
    return !/^\d+$/.test(id) || id.includes('_') || id.includes('-');
  }

  private cargarLibroGoogle(googleId: string): void {
    console.log('🌐 Cargando libro de Google:', googleId);
    
    this.librosService.getLibroGoogleById(googleId).subscribe({
      next: (libroGoogle: Libro) => {
        this.libro = libroGoogle;
        this.sinopsisHtml = this.sanitizer.bypassSecurityTrustHtml(libroGoogle.sinopsis || '');
        
        this.googleAverageRating = (libroGoogle as any).googleAverageRating || null;
        this.googleRatingsCount = (libroGoogle as any).googleRatingsCount || null;
        
        if (this.authService.isLoggedIn()) {
          this.verificarOCrearLibroEnBackend(googleId, libroGoogle);
        } else {
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error('Error cargando libro desde Google', err);
        this.error = 'No se ha podido cargar la información del libro.';
        this.cargando = false;
      }
    });
  }

  private verificarOCrearLibroEnBackend(googleId: string, libroGoogle: Libro): void {
    console.log('🔍 Verificando si el libro existe en backend...');
    
    this.librosService.buscarLibroPorGoogleId(googleId).subscribe({
      next: (respuesta) => {
        if (respuesta.existe && respuesta.id > 0) {
          this.libroDbId = respuesta.id;
          console.log('✅ Libro YA EXISTE en backend con ID:', this.libroDbId);
          this.cargando = false;
          this.verificarBiblioteca();
        } else {
          console.log('📚 Libro NO existe en backend. Creándolo con datos REALES...');
          this.crearLibroEnBackend(libroGoogle);
        }
      },
      error: (err) => {
        console.error('Error verificando libro:', err);
        this.crearLibroEnBackend(libroGoogle);
      }
    });
  }

  private crearLibroEnBackend(libroGoogle: Libro): void {
    this.librosService.crearLibroEnBackendDesdeGoogle(libroGoogle).subscribe({
      next: (resp) => {
        this.libroDbId = resp.id;
        console.log('✅ Libro CREADO en backend con ID:', this.libroDbId);
        this.cargando = false;
        this.verificarBiblioteca();
      },
      error: (err) => {
        console.error('❌ Error creando libro:', err);
        this.cargando = false;
      }
    });
  }

  cargarLibroBackend(id: number): void {
    this.librosService.getLibroBackendById(id).subscribe({
      next: (libro) => {
        console.log('📸 URL de la portada:', libro.imagen);
        this.libro = libro;
        this.libroDbId = id;
        this.sinopsisHtml = this.sanitizer.bypassSecurityTrustHtml(libro.sinopsis || '');
        this.cargando = false;
        this.verificarBiblioteca();
      },
      error: (err) => {
        console.error('Error cargando libro del backend:', err);
        this.error = 'Error al cargar el libro.';
        this.cargando = false;
      }
    });
  }

  private verificarBiblioteca(): void {
    if (!this.authService.isLoggedIn() || !this.libroDbId) return;
    
    this.bibliotecaService.verificarLibroEnBiblioteca(this.usuarioId, this.libroDbId)
      .subscribe({
        next: (resp) => {
          this.enBiblioteca = resp.enBiblioteca;
          this.estadoActual = resp.estado;
          console.log('📚 Estado biblioteca:', resp);
        },
        error: (err) => {
          console.warn('Error verificando biblioteca:', err);
        }
      });
  }

  volver(): void {
    this.router.navigate(['/']);
  }

  autoresToString(libro: Libro | null): string {
    if (!libro?.autores?.length) return 'Autor desconocido';
    return libro.autores.map(a => a.nombre).join(', ');
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.error('Error cargando imagen:', img.src);
    img.style.display = 'none';
  }

  // ✅ MÉTODO PARA CAMBIAR ESTADO (FAVORITO INCLUIDO)
  setEstado(nuevo: EstadoUI): void {
    if (!this.libroDbId) {
      console.error('No hay libroDbId para cambiar estado');
      return;
    }

    // Mapeo de valores
    const mapeoEstados: Record<string, string> = {
      'PENDIENTE': 'Pendiente',
      'LEYENDO': 'Leyendo',
      'LEIDO': 'Terminado',
      'ABANDONADO': 'Abandonado',
      'FAVORITO': 'Favorito'
    };
    
    const estadoBackend = mapeoEstados[nuevo] as EstadoLecturaBackend;
    
    // Primero verificar si ya está en biblioteca
    if (this.enBiblioteca) {
      // Si ya está, cambiar estado directamente
      this.cambiarEstadoDirecto(estadoBackend);
    } else {
      // Si no está, añadir a biblioteca y luego cambiar estado
      this.bibliotecaService.agregarLibro(this.usuarioId, this.libroDbId)
        .pipe(
          tap(() => {
            this.enBiblioteca = true;
            console.log('➕ Libro añadido a biblioteca');
          }),
          switchMap(() => this.bibliotecaService.cambiarEstado(this.usuarioId, this.libroDbId!, estadoBackend))
        )
        .subscribe({
          next: () => {
            this.estadoActual = estadoBackend;
            console.log('✅ Estado cambiado a:', estadoBackend);
          },
          error: (err) => console.error('Error:', err)
        });
    }
  }

  agregarYCambiarEstado(estado: EstadoLecturaBackend): void {
    this.bibliotecaService.agregarLibro(this.usuarioId, this.libroDbId!)
      .pipe(
        tap(() => console.log('➕ Libro añadido a biblioteca')),
        switchMap(() => this.bibliotecaService.cambiarEstado(this.usuarioId, this.libroDbId!, estado))
      )
      .subscribe({
        next: () => {
          this.enBiblioteca = true;
          this.estadoActual = estado;
          console.log('✅ Estado cambiado a:', estado);
        },
        error: (err) => console.error('Error:', err)
      });
  }

  // libro-detalle.component.ts - En el método cambiarEstadoDirecto
private cambiarEstadoDirecto(estado: EstadoLecturaBackend): void {
  if (!this.libroDbId || !this.usuarioId) {
    console.error('Faltan datos para cambiar estado');
    return;
  }

  const url = `${environment.apiUrl}/biblioteca/${this.usuarioId}/libros/${this.libroDbId}/estado`;
  console.log('🔄 URL COMPLETA:', url);
  console.log('🔄 Estado a enviar:', estado);
  
  this.bibliotecaService.cambiarEstado(this.usuarioId, this.libroDbId, estado)
    .subscribe({
      next: () => {
        this.estadoActual = estado;
        console.log('✅ Estado actualizado a:', estado);
      },
      error: (err) => {
        console.error('❌ Error completo:', err);
        console.error('❌ URL que falló:', err.url);
      }
    });
  }

}