import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BibliotecaService, LibroBiblioteca } from '../../services/biblioteca.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './biblioteca.component.html',
  styleUrls: ['./biblioteca.component.css']
})
export class BibliotecaComponent implements OnInit {
  libros: LibroBiblioteca[] = [];
  cargando = true;
  error = '';
  usuarioId: number | null = null;
  
  estadoActivo: string = 'TODOS';
  librosPorEstado: { [key: string]: LibroBiblioteca[] } = {};
  
  ordenEstados = ['FAVORITO', 'LEYENDO', 'PENDIENTE', 'LEIDO', 'ABANDONADO'];
  labelsEstado: { [key: string]: string } = {
    'FAVORITO': 'Favoritos',
    'LEYENDO': 'Leyendo',
    'PENDIENTE': 'Pendientes',
    'LEIDO': 'Completados',
    'ABANDONADO': 'Abandonados'
  };
  
  totalLibros: number = 0;

  constructor(
    private bibliotecaService: BibliotecaService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.usuarioId = this.authService.getUsuarioId();
    
    if (this.usuarioId) {
      this.cargarBiblioteca();
    } else {
      this.error = 'Usuario no autenticado';
      this.cargando = false;
    }
  }

  cargarBiblioteca(): void {
    if (!this.usuarioId) return;
    
    this.cargando = true;
    this.error = '';
    
    this.bibliotecaService.getBiblioteca(this.usuarioId).subscribe({
      next: (data: LibroBiblioteca[]) => {
        console.log('✅ Biblioteca cargada:', data);
        this.libros = data;
        this.totalLibros = data.length;
        this.agruparPorEstado();
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('❌ Error cargando biblioteca:', err);
        this.error = 'Error al cargar la biblioteca';
        this.cargando = false;
      }
    });
  }

  agruparPorEstado(): void {
    this.librosPorEstado = {};
    
    for (const item of this.libros) {
      const estado = item.estado || 'PENDIENTE';
      if (!this.librosPorEstado[estado]) {
        this.librosPorEstado[estado] = [];
      }
      this.librosPorEstado[estado].push(item);
    }
  }

  get seccionesOrdenadas(): { estado: string; label: string; libros: LibroBiblioteca[] }[] {
    return this.ordenEstados
      .filter(estado => this.librosPorEstado[estado]?.length > 0)
      .map(estado => ({
        estado: estado,
        label: this.labelsEstado[estado] || estado,
        libros: this.librosPorEstado[estado]
      }));
  }

  // ✅ Método auxiliar para obtener libros por estado de forma segura
  getLibrosPorEstado(estado: string): LibroBiblioteca[] {
    return this.librosPorEstado[estado] || [];
  }

  // ✅ Método auxiliar para obtener el conteo por estado
  getConteoPorEstado(estado: string): number {
    return this.librosPorEstado[estado]?.length || 0;
  }

  verDetalle(libroId: number): void {
    this.router.navigate(['/libro', libroId]);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  getPortadaUrl(item: LibroBiblioteca): string {
    return item.libro?.imagen || '';
  }

  getTitulo(item: LibroBiblioteca): string {
    return item.libro?.titulo || 'Sin título';
  }

  obtenerAutores(item: LibroBiblioteca): string {
    if (item.libro?.autores && Array.isArray(item.libro.autores)) {
      return item.libro.autores.map((a: any) => a.nombre).join(', ');
    }
    return '';
  }

  onImgError(event: any): void {
    event.target.src = 'assets/book-placeholder.jpg';
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'LEIDO': return 'estado-leido';
      case 'LEYENDO': return 'estado-leyendo';
      case 'PENDIENTE': return 'estado-pendiente';
      case 'ABANDONADO': return 'estado-abandonado';
      case 'FAVORITO': return 'estado-favorito';
      default: return '';
    }
  }
}