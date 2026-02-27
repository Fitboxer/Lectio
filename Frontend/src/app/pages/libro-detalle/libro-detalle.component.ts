import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LibrosService } from '../../services/libros.service';
import { BibliotecaService, NotaLibro } from '../../services/biblioteca.service';
import { ComentarioService, Comentario } from '../../services/comentario.service';
import { AuthService } from '../../services/auth.service';
import { Libro } from '../../models/libro.model';

@Component({
  selector: 'app-libro-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './libro-detalle.component.html',
  styleUrls: ['./libro-detalle.component.css']
})
export class LibroDetalleComponent implements OnInit {
  libro: Libro | null = null;
  libroId: string | null = null;
  libroBackendId: number | null = null;
  cargando = true;
  error = '';
  
  estadoActual: string = '';
  esFavorito: boolean = false;
  libroEnBiblioteca: boolean = false;
  
  estadosDisponibles = ['PENDIENTE', 'LEYENDO', 'LEIDO', 'ABANDONADO'];
  cargandoEstado = false;
  cargandoFavorito = false;

  // 📝 NOTAS
  notas: NotaLibro[] = [];
  nuevaNota: string = '';
  notaEditando: NotaLibro | null = null;
  notaEditandoTexto: string = '';
  cargandoNotas = false;
  mostrandoFormularioNota = false;

  // 💬 COMENTARIOS
  todosLosComentarios: Comentario[] = [];
  comentariosVisibles: Comentario[] = [];
  nuevoComentario: string = '';
  enviandoComentario: boolean = false;
  cargandoComentarios: boolean = false;
  mostrandoTodos: boolean = false;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private librosService: LibrosService,
    private bibliotecaService: BibliotecaService,
    private comentarioService: ComentarioService,
    public authService: AuthService
  ) {}

  // ============================================
  // 📚 CARGA DE LIBRO
  // ============================================

  ngOnInit(): void {
    this.libroId = this.route.snapshot.paramMap.get('id');
    console.log('📖 ID del libro:', this.libroId);
    
    if (this.libroId) {
      this.cargarLibro();  // ✅ LLAMA AL MÉTODO
    } else {
      this.error = 'ID de libro no válido';
      this.cargando = false;
    }
  }

  cargarLibro(): void {
    this.cargando = true;
    
    if (/^\d+$/.test(this.libroId!)) {
      const idBackend = Number(this.libroId);
      console.log('🔍 Cargando libro desde backend por ID:', idBackend);
      
      this.librosService.getLibroBackendById(idBackend).subscribe({
        next: (libro) => {
          console.log('✅ Libro cargado desde backend:', libro);
          this.libro = libro;
          this.libroBackendId = idBackend;
          this.cargando = false;
          this.verificarEstadoEnBiblioteca();
          this.cargarNotas();
          this.cargarComentarios();
        },
        error: () => {
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
    console.log('🔍 Verificando si el libro existe en backend con Google ID:', googleId);
    
    this.librosService.buscarLibroPorGoogleId(googleId).subscribe({
      next: (respuesta) => {
        if (respuesta.existe) {
          console.log('✅ Libro YA EXISTE en backend con ID:', respuesta.id);
          this.libroBackendId = respuesta.id;
          this.verificarEstadoEnBiblioteca();
          this.cargarNotas();
          this.cargarComentarios();
        } else {
          console.log('📝 Libro NO existe en backend');
        }
      },
      error: (error) => {
        console.error('❌ Error verificando existencia:', error);
      }
    });
  }

  verificarEstadoEnBiblioteca(): void {
    if (!this.libroBackendId) return;
    
    console.log('🔍 Verificando estado en biblioteca para libro ID:', this.libroBackendId);
    
    this.bibliotecaService.obtenerEstado(this.libroBackendId).subscribe({
      next: (data) => {
        console.log('📚 Estado recibido:', data);
        if (data) {
          this.libroEnBiblioteca = true;
          
          if (data.estadoNombre) {
            switch (data.estadoNombre) {
              case 'Pendiente': this.estadoActual = 'PENDIENTE'; break;
              case 'Leyendo': this.estadoActual = 'LEYENDO'; break;
              case 'Terminado': this.estadoActual = 'LEIDO'; break;
              case 'Abandonado': this.estadoActual = 'ABANDONADO'; break;
              default: this.estadoActual = data.estadoNombre;
            }
          }
          this.esFavorito = data.esFavorito || false;
        } else {
          console.log('📝 Libro no está en biblioteca aún');
          this.libroEnBiblioteca = false;
          this.estadoActual = '';
          this.esFavorito = false;
        }
      },
      error: (error) => {
        console.error('❌ Error obteniendo estado:', error);
        this.libroEnBiblioteca = false;
        this.estadoActual = '';
        this.esFavorito = false;
      }
    });
  }

  // ============================================
  // 📝 GESTIÓN DE NOTAS
  // ============================================

  cargarNotas(): void {
    if (!this.libroBackendId) return;
    
    this.cargandoNotas = true;
    console.log('📝 Cargando notas para libro ID:', this.libroBackendId);
    
    this.bibliotecaService.obtenerNotas(this.libroBackendId).subscribe({
      next: (notas) => {
        console.log('📝 Notas cargadas:', notas);
        this.notas = notas;
        this.cargandoNotas = false;
      },
      error: (error) => {
        console.error('❌ Error cargando notas:', error);
        this.cargandoNotas = false;
      }
    });
  }

  crearNota(): void {
    if (!this.libroBackendId || !this.nuevaNota.trim()) return;
    
    this.cargandoNotas = true;
    
    this.bibliotecaService.crearNota(this.libroBackendId, this.nuevaNota).subscribe({
      next: (nota) => {
        console.log('✅ Nota creada:', nota);
        this.notas = [nota, ...this.notas];
        this.nuevaNota = '';
        this.mostrandoFormularioNota = false;
        this.cargandoNotas = false;
      },
      error: (error) => {
        console.error('❌ Error creando nota:', error);
        this.cargandoNotas = false;
      }
    });
  }

  editarNota(nota: NotaLibro): void {
    this.notaEditando = nota;
    this.notaEditandoTexto = nota.contenido;
  }

  cancelarEdicion(): void {
    this.notaEditando = null;
    this.notaEditandoTexto = '';
  }

  guardarEdicion(): void {
    if (!this.notaEditando || !this.notaEditandoTexto.trim()) return;
    
    this.cargandoNotas = true;
    
    this.bibliotecaService.actualizarNota(this.notaEditando.id!, this.notaEditandoTexto).subscribe({
      next: (notaActualizada) => {
        console.log('✅ Nota actualizada:', notaActualizada);
        const index = this.notas.findIndex(n => n.id === notaActualizada.id);
        if (index !== -1) {
          this.notas[index] = notaActualizada;
        }
        this.cancelarEdicion();
        this.cargandoNotas = false;
      },
      error: (error) => {
        console.error('❌ Error actualizando nota:', error);
        this.cargandoNotas = false;
      }
    });
  }

  eliminarNota(notaId: number): void {
    if (!confirm('¿Eliminar esta nota?')) return;
    
    this.cargandoNotas = true;
    
    this.bibliotecaService.eliminarNota(notaId).subscribe({
      next: () => {
        console.log('✅ Nota eliminada');
        this.notas = this.notas.filter(n => n.id !== notaId);
        this.cargandoNotas = false;
      },
      error: (error) => {
        console.error('❌ Error eliminando nota:', error);
        this.cargandoNotas = false;
      }
    });
  }

  // ============================================
  // 🗑️ QUITAR ESTADO
  // ============================================

  quitarEstado(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.libroBackendId) {
      console.log('📝 El libro no está en biblioteca');
      return;
    }
    
    if (!confirm('¿Estás seguro de que quieres quitar este libro de tu biblioteca? Se perderán el estado y las notas.')) {
      return;
    }
    
    this.cargandoEstado = true;
    console.log('🗑️ Quitando estado del libro:', this.libroBackendId);
    
    this.bibliotecaService.eliminarLibroDeBiblioteca(this.libroBackendId).subscribe({
      next: () => {
        console.log('✅ Libro eliminado de biblioteca');
        this.libroEnBiblioteca = false;
        this.estadoActual = '';
        this.esFavorito = false;
        this.notas = [];
        this.cargandoEstado = false;
        
        setTimeout(() => {
          this.volver();
        }, 1500);
      },
      error: (error) => {
        console.error('❌ Error quitando estado:', error);
        this.cargandoEstado = false;
      }
    });
  }

  // ============================================
  // ⭐ ESTADOS Y FAVORITOS
  // ============================================

  cambiarEstado(estado: string): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.libroBackendId) {
      console.log('📝 No hay ID de backend, creando libro primero...');
      this.crearLibroEnBackend(() => {
        this.verificarYAgregarABiblioteca(estado);
      });
      return;
    }
    
    this.verificarYAgregarABiblioteca(estado);
  }

  private verificarYAgregarABiblioteca(estado: string): void {
    console.log('🔍 Verificando si libro está en biblioteca antes de cambiar estado');
    
    this.bibliotecaService.obtenerEstado(this.libroBackendId!).subscribe({
      next: (data) => {
        if (data) {
          console.log('✅ Libro ya está en biblioteca, cambiando estado...');
          this.ejecutarCambioEstado(estado);
        } else {
          console.log('📝 Libro no está en biblioteca, agregando...');
          this.bibliotecaService.agregarLibroABiblioteca(this.libroBackendId!).subscribe({
            next: () => {
              console.log('✅ Libro agregado a biblioteca');
              this.libroEnBiblioteca = true;
              this.ejecutarCambioEstado(estado);
              this.cargarNotas();
            },
            error: (error) => {
              console.error('❌ Error agregando a biblioteca:', error);
              this.cargandoEstado = false;
            }
          });
        }
      },
      error: (error) => {
        console.error('❌ Error verificando estado:', error);
        this.cargandoEstado = false;
      }
    });
  }

  private ejecutarCambioEstado(estado: string): void {
    if (!this.libroBackendId) return;
    
    this.cargandoEstado = true;
    console.log('📤 Cambiando estado a:', estado);
    
    this.bibliotecaService.cambiarEstadoLectura(this.libroBackendId, estado).subscribe({
      next: (response) => {
        console.log('✅ Estado actualizado:', response);
        this.estadoActual = estado;
        this.cargandoEstado = false;
      },
      error: (error) => {
        console.error('❌ Error cambiando estado:', error);
        this.cargandoEstado = false;
      }
    });
  }

  toggleFavorito(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.libroBackendId) {
      console.log('📝 No hay ID de backend, creando libro primero...');
      this.crearLibroEnBackend(() => {
        this.verificarYAgregarABibliotecaParaFavorito();
      });
      return;
    }
    
    this.verificarYAgregarABibliotecaParaFavorito();
  }

  private verificarYAgregarABibliotecaParaFavorito(): void {
    console.log('🔍 Verificando si libro está en biblioteca para favorito');
    
    this.bibliotecaService.obtenerEstado(this.libroBackendId!).subscribe({
      next: (data) => {
        if (data) {
          this.ejecutarToggleFavorito();
        } else {
          console.log('📝 Libro no está en biblioteca, agregando...');
          this.bibliotecaService.agregarLibroABiblioteca(this.libroBackendId!).subscribe({
            next: () => {
              console.log('✅ Libro agregado a biblioteca');
              this.libroEnBiblioteca = true;
              this.ejecutarToggleFavorito();
              this.cargarNotas();
            },
            error: (error) => {
              console.error('❌ Error agregando a biblioteca:', error);
              this.cargandoFavorito = false;
            }
          });
        }
      },
      error: (error) => {
        console.error('❌ Error verificando estado:', error);
        this.cargandoFavorito = false;
      }
    });
  }

  private ejecutarToggleFavorito(): void {
    if (!this.libroBackendId) return;
    
    this.cargandoFavorito = true;
    console.log('⭐ Toggle favorito para libro:', this.libroBackendId);
    
    this.bibliotecaService.toggleFavorito(this.libroBackendId).subscribe({
      next: () => {
        console.log('⭐ Favorito toggled');
        this.esFavorito = !this.esFavorito;
        this.cargandoFavorito = false;
      },
      error: (error) => {
        console.error('❌ Error toggling favorito:', error);
        this.cargandoFavorito = false;
      }
    });
  }

  private crearLibroEnBackend(callback: () => void): void {
    if (!this.libro) {
      console.error('❌ No hay libro para crear');
      return;
    }
    
    this.cargandoEstado = true;
    console.log('📤 Creando libro en backend:', this.libro.titulo);
    
    this.librosService.crearLibroEnBackendDesdeGoogle(this.libro).subscribe({
      next: (respuesta) => {
        console.log('✅ Libro creado en backend con ID:', respuesta.id);
        this.libroBackendId = respuesta.id;
        callback();
      },
      error: (error) => {
        console.error('❌ Error creando libro:', error);
        this.cargandoEstado = false;
      }
    });
  }

  // ============================================
  // 💬 GESTIÓN DE COMENTARIOS
  // ============================================

  cargarComentarios(): void {
    if (!this.libroBackendId) {
      console.log('⚠️ No hay libroBackendId para cargar comentarios');
      return;
    }
    
    this.cargandoComentarios = true;
    console.log('🔄 Cargando TODOS los comentarios para libro ID:', this.libroBackendId);
    
    this.comentarioService.obtenerComentarios(this.libroBackendId).subscribe({
      next: (comentarios) => {
        console.log('💬 Comentarios cargados (TOTAL):', comentarios.length);
        
        // Ordenar por fecha (más recientes primero)
        this.todosLosComentarios = comentarios.sort((a, b) => 
          new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
        );
        
        this.actualizarComentariosVisibles();
        this.cargandoComentarios = false;
      },
      error: (error) => {
        console.error('❌ Error cargando comentarios:', error);
        this.todosLosComentarios = [];
        this.comentariosVisibles = [];
        this.cargandoComentarios = false;
      }
    });
  }

  actualizarComentariosVisibles(): void {
    if (this.mostrandoTodos) {
      this.comentariosVisibles = this.todosLosComentarios;
      console.log('👁️ Mostrando TODOS los comentarios:', this.comentariosVisibles.length);
    } else {
      this.comentariosVisibles = this.todosLosComentarios.slice(0, 5);
      console.log('👁️ Mostrando últimos 5 comentarios:', this.comentariosVisibles.length);
    }
  }

  toggleMostrarComentarios(): void {
    this.mostrandoTodos = !this.mostrandoTodos;
    this.actualizarComentariosVisibles();
  }

  enviarComentario(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!this.libroBackendId || !this.nuevoComentario.trim()) return;
    
    this.enviandoComentario = true;
    
    this.comentarioService.crearComentario(this.libroBackendId, this.nuevoComentario).subscribe({
      next: (nuevoComentario) => {
        console.log('✅ Comentario creado:', nuevoComentario);
        
        // Añadir al principio (es más reciente)
        this.todosLosComentarios = [nuevoComentario, ...this.todosLosComentarios];
        
        // Actualizar la vista
        this.actualizarComentariosVisibles();
        
        this.nuevoComentario = '';
        this.enviandoComentario = false;
      },
      error: (error) => {
        console.error('❌ Error creando comentario:', error);
        this.enviandoComentario = false;
      }
    });
  }

  eliminarComentario(comentarioId: number): void {
    if (!this.authService.isAdmin()) {
      alert('No tienes permisos para eliminar comentarios');
      return;
    }
    
    if (!confirm('¿Eliminar este comentario?')) return;
    
    this.comentarioService.eliminarComentario(comentarioId).subscribe({
      next: () => {
        console.log('✅ Comentario eliminado');
        this.todosLosComentarios = this.todosLosComentarios.filter(c => c.id !== comentarioId);
        this.actualizarComentariosVisibles();
      },
      error: (error) => {
        console.error('❌ Error eliminando comentario:', error);
      }
    });
  }

  // ============================================
  // 🛠️ MÉTODOS AUXILIARES
  // ============================================

  onImgError(event: any): void {
    event.target.src = 'assets/book-placeholder.jpg';
  }

  autoresToString(libro: Libro): string {
    if (!libro.autores) return 'Autor desconocido';
    return libro.autores.map((a: any) => a.nombre || a).join(', ');
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'PENDIENTE': return 'estado-pendiente';
      case 'LEYENDO': return 'estado-leyendo';
      case 'LEIDO': return 'estado-leido';
      case 'ABANDONADO': return 'estado-abandonado';
      default: return '';
    }
  }

  volver(): void {
    this.router.navigate(['/home']);
  }
}