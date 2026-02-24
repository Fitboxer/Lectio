import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibrosService } from '../../services/libros.service';
import { BibliotecaService } from '../../services/biblioteca.service';
import { AuthService } from '../../services/auth.service';
import { Libro } from '../../models/libro.model';

@Component({
  selector: 'app-libro-detalle',
  standalone: true,
  templateUrl: './libro-detalle.component.html',
  styleUrls: ['./libro-detalle.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LibroDetalleComponent implements OnInit {
  libro: Libro | null = null;
  libroId: string | null = null;
  libroBackendId: number | null = null;
  cargando = true;
  error = '';
  
  estadoActual: string = '';
  estadosDisponibles = ['PENDIENTE', 'LEYENDO', 'LEIDO', 'ABANDONADO', 'FAVORITO'];
  cargandoEstado = false;
  esFavorito = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private librosService: LibrosService,
    private bibliotecaService: BibliotecaService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.libroId = this.route.snapshot.paramMap.get('id');
    console.log('📖 ID del libro:', this.libroId);
    
    if (this.libroId) {
      this.cargarLibro();
    } else {
      this.error = 'ID de libro no válido';
      this.cargando = false;
    }
  }

  // ✅ MÉTODO CORREGIDO
  setEstado(estado: string): void {
    if (!this.libroBackendId) {
      console.error('❌ No hay ID de backend');
      return;
    }
    
    if (!this.authService.isAuthenticated()) {
      console.log('🔐 Usuario no autenticado');
      this.router.navigate(['/login']);
      return;
    }
    
    this.cargandoEstado = true;
    
    console.log(`📤 Cambiando estado del libro ${this.libroBackendId} a:`, estado);
    
    this.bibliotecaService.cambiarEstado(this.libroBackendId, estado).subscribe({
      next: (response) => {
        console.log('✅ Estado actualizado:', response);
        this.estadoActual = estado;
        this.esFavorito = (estado === 'FAVORITO');
        this.cargandoEstado = false;
      },
      error: (error) => {
        console.error('❌ Error cambiando estado:', error);
        this.cargandoEstado = false;
      }
    });
  }

  onImgError(event: any): void {
    event.target.src = 'assets/book-placeholder.jpg';
  }

  autoresToString(libro: Libro): string {
    if (!libro.autores || !Array.isArray(libro.autores)) return 'Autor desconocido';
    return libro.autores.map((a: any) => a.nombre || a).join(', ');
  }

  esNumero(valor: string): boolean {
    return /^\d+$/.test(valor);
  }

  cargarLibro(): void {
    this.cargando = true;
    
    if (this.esNumero(this.libroId!)) {
      const idBackend = Number(this.libroId);
      console.log('🔍 Cargando libro desde backend por ID:', idBackend);
      
      this.librosService.getLibroBackendById(idBackend).subscribe({
        next: (libro) => {
          console.log('✅ Libro cargado desde backend:', libro);
          this.libro = libro;
          this.libroBackendId = idBackend;
          this.cargando = false;
          this.verificarEstadoEnBiblioteca();
        },
        error: (error) => {
          console.error('❌ Error cargando desde backend:', error);
          this.intentarCargarDesdeGoogle();
        }
      });
    } else {
      this.intentarCargarDesdeGoogle();
    }
  }

  intentarCargarDesdeGoogle(): void {
    console.log('🔍 Intentando cargar desde Google Books por ID:', this.libroId);
    
    this.librosService.getLibroGoogleById(this.libroId!).subscribe({
      next: (libro) => {
        console.log('✅ Libro cargado desde Google:', libro);
        this.libro = libro;
        this.cargando = false;
        this.verificarExistenciaEnBackend();
      },
      error: (error) => {
        console.error('❌ Error cargando desde Google:', error);
        this.error = 'No se pudo cargar el libro';
        this.cargando = false;
      }
    });
  }

  verificarExistenciaEnBackend(): void {
    if (!this.libro || !this.libro.id) return;
    
    const googleId = this.libro.id;
    
    this.librosService.buscarLibroPorGoogleId(googleId).subscribe({
      next: (respuesta) => {
        if (respuesta.existe) {
          console.log('✅ Libro YA EXISTE en backend con ID:', respuesta.id);
          this.libroBackendId = respuesta.id;
          this.verificarEstadoEnBiblioteca();
        } else {
          console.log('📝 Libro NO existe en backend');
        }
      },
      error: (error) => {
        console.log('❌ Error verificando existencia:', error);
      }
    });
  }

  verificarEstadoEnBiblioteca(): void {
    if (!this.libroBackendId) return;
    
    this.bibliotecaService.obtenerEstado(this.libroBackendId).subscribe({
      next: (estado) => {
        console.log('📚 Estado en biblioteca:', estado);
        if (estado?.estado) {
          this.estadoActual = estado.estado;
          this.esFavorito = (estado.estado === 'FAVORITO');
        }
      },
      error: (error) => {
        console.log('❌ Error obteniendo estado:', error);
      }
    });
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}