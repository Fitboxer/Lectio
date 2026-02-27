import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BibliotecaService, LibroBiblioteca } from '../../services/biblioteca.service';
import { AuthService } from '../../services/auth.service';

// Extendemos la interfaz localmente
interface LibroBibliotecaConEstado extends LibroBiblioteca {
  estado: string;  // Propiedad que añadimos nosotros
}

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './biblioteca.component.html',
  styleUrls: ['./biblioteca.component.css']
})
export class BibliotecaComponent implements OnInit {
  libros: LibroBibliotecaConEstado[] = [];  // ← Usamos la interfaz extendida
  cargando = true;
  error = '';
  usuarioId: number | null = null;
  
  estadoActivo: string = 'TODOS';
  librosPorEstado: { [key: string]: LibroBibliotecaConEstado[] } = {};
  
  ordenEstados = ['Leyendo', 'Pendiente', 'Terminado', 'Abandonado'];
  labelsEstado: { [key: string]: string } = {
    'Leyendo': 'Leyendo',
    'Pendiente': 'Pendientes',
    'Terminado': 'Completados',
    'Abandonado': 'Abandonados'
  };
  
  totalLibros: number = 0;
  favoritos: LibroBibliotecaConEstado[] = [];

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
        console.log('✅ Biblioteca cargada - RAW:', data);
        
        // ✅ CORREGIDO: Mapear a nuestra interfaz extendida
        const librosMapeados: LibroBibliotecaConEstado[] = data.map(item => {
          // El estado viene en el campo "estadoActual" del backend
          let estado = 'Pendiente'; // Valor por defecto
          
          if ((item as any).estadoActual) {
            estado = (item as any).estadoActual;
            console.log(`📖 ${item.libro?.titulo}: estadoActual = ${(item as any).estadoActual}`);
          } else {
            console.log(`📖 ${item.libro?.titulo}: ⚠️ NO TIENE ESTADO - usando "Pendiente"`);
          }
          
          return {
            ...item,
            estado: estado  // ← AÑADIMOS esta propiedad
          };
        });
        
        console.log('✅ Libros después de mapear:', librosMapeados.map(l => ({
          titulo: l.libro?.titulo,
          estado: l.estado
        })));
        
        this.libros = librosMapeados;
        this.totalLibros = librosMapeados.length;
        this.favoritos = librosMapeados.filter(item => item.esFavorito);
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
      // ✅ AHORA TypeScript reconoce 'estado'
      const estado = item.estado || 'Pendiente';
      if (!this.librosPorEstado[estado]) {
        this.librosPorEstado[estado] = [];
      }
      this.librosPorEstado[estado].push(item);
    }
    
    console.log('📊 Libros por estado (FINAL):', this.librosPorEstado);
  }

  get seccionesOrdenadas(): { estado: string; label: string; libros: LibroBibliotecaConEstado[] }[] {
    return this.ordenEstados
      .filter(estado => this.librosPorEstado[estado]?.length > 0)
      .map(estado => ({
        estado: estado,
        label: this.labelsEstado[estado] || estado,
        libros: this.librosPorEstado[estado]
      }));
  }

  getBackendEstado(estadoFrontend: string): string {
    const mapa: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente',
      'LEYENDO': 'Leyendo',
      'LEIDO': 'Terminado',
      'ABANDONADO': 'Abandonado',
      'Pendiente': 'Pendiente',
      'Leyendo': 'Leyendo',
      'Terminado': 'Terminado',
      'Abandonado': 'Abandonado'
    };
    return mapa[estadoFrontend] || estadoFrontend;
  }

  getLibrosPorEstado(estado: string): LibroBibliotecaConEstado[] {
    const estadoBackend = this.getBackendEstado(estado);
    return this.librosPorEstado[estadoBackend] || [];
  }

  getConteoPorEstado(estado: string): number {
    const estadoBackend = this.getBackendEstado(estado);
    return this.librosPorEstado[estadoBackend]?.length || 0;
  }

  verDetalle(libroId: number): void {
    this.router.navigate(['/libro', libroId]);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  getPortadaUrl(item: LibroBibliotecaConEstado): string {
    return item.libro?.imagen || '';
  }

  getTitulo(item: LibroBibliotecaConEstado): string {
    return item.libro?.titulo || 'Sin título';
  }

  obtenerAutores(item: LibroBibliotecaConEstado): string {
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
      case 'Terminado': return 'estado-leido';
      case 'Leyendo': return 'estado-leyendo';
      case 'Pendiente': return 'estado-pendiente';
      case 'Abandonado': return 'estado-abandonado';
      default: return '';
    }
  }

  esFavorito(item: LibroBibliotecaConEstado): boolean {
    return item.esFavorito || false;
  }
}