import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LibrosService } from '../../services/libros.service';
import { Libro } from '../../models/libro.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
  ]
})
export class HomeComponent implements OnInit {
  libros: Libro[] = [];
  librosFiltrados: Libro[] = [];

  // filtros
  searchTerm = '';
  selectedGenero = 'Todos';
  selectedAnio = 'Todos';
  generosDisponibles: string[] = ['Todos'];
  aniosDisponibles: (string | number)[] = ['Todos'];

  // estado de carga / error
  cargando = false;
  errorMsg = '';

  // paginación
  pageSize = 21;
  currentPage = 1;

  constructor(
    private librosService: LibrosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.cargando = true;
    this.errorMsg = '';
    
    console.log('🔄 Iniciando carga de catálogo...');
    
    this.librosService.getCatalogoInicial().subscribe({
      next: (libros: Libro[]) => {
        console.log('✅ Catálogo recibido:', libros.length, 'libros');
        
        if (libros.length > 0) {
          console.log('📋 Primeros 3 títulos:', libros.slice(0, 3).map(l => l.titulo));
        }
        
        this.libros = libros;
        
        // Resetear filtros
        this.searchTerm = '';
        this.selectedGenero = 'Todos';
        this.selectedAnio = 'Todos';
        
        // Configurar y aplicar filtros
        this.configurarFiltros();
        this.aplicarFiltros();
        
        this.cargando = false;
        
        console.log('📊 Estado final:', {
          libros: this.libros.length,
          filtrados: this.librosFiltrados.length,
          pagina: this.librosPagina.length
        });
      },
      error: (error) => {
        console.error('❌ Error:', error);
        this.errorMsg = 'Error al cargar el catálogo';
        this.cargando = false;
      }
    });
  }

  private configurarFiltros(): void {
    const generos = new Set<string>();
    const anios = new Set<number>();

    for (const libro of this.libros) {
      // Extraer géneros
      if (libro.generos && Array.isArray(libro.generos)) {
        libro.generos.forEach((g: any) => {
          const nombre = typeof g === 'string' ? g : g.nombre;
          if (nombre) generos.add(nombre);
        });
      }

      // Extraer años
      if (libro.anioPublicacion) {
        anios.add(Number(libro.anioPublicacion));
      }
    }

    this.generosDisponibles = ['Todos', ...Array.from(generos).sort()];
    this.aniosDisponibles = ['Todos', ...Array.from(anios).sort((a, b) => b - a)];
  }

  aplicarFiltros(): void {
    if (!this.libros || this.libros.length === 0) {
      this.librosFiltrados = [];
      return;
    }

    const termino = this.searchTerm?.toLowerCase().trim() ?? '';
    const genero = this.selectedGenero;
    const anio = this.selectedAnio;

    this.librosFiltrados = this.libros.filter((libro) => {
      const titulo = libro.titulo?.toLowerCase() ?? '';
      const autores = this.autoresToString(libro).toLowerCase();
      const coincideTexto = !termino || titulo.includes(termino) || autores.includes(termino);

      let coincideGenero = true;
      if (genero && genero !== 'Todos') {
        const generosLibro: string[] =
          (libro as any).generos?.map((g: any) => (typeof g === 'string' ? g : g.nombre)) ?? [];
        coincideGenero = generosLibro.includes(genero);
      }

      let coincideAnio = true;
      if (anio && anio !== 'Todos') {
        coincideAnio = String(libro.anioPublicacion) === String(anio);
      }

      return coincideTexto && coincideGenero && coincideAnio;
    });

    this.currentPage = 1;
  }

  // Paginación
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.librosFiltrados.length / this.pageSize));
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get librosPagina(): Libro[] {
    const inicio = (this.currentPage - 1) * this.pageSize;
    return this.librosFiltrados.slice(inicio, inicio + this.pageSize);
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages) return;
    this.currentPage = pagina;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Acciones
  verDetalle(id: string): void {
    this.router.navigate(['/libro', id]);
  }

  sorprenderme(): void {
    if (!this.librosFiltrados.length) return;
    const idx = Math.floor(Math.random() * this.librosFiltrados.length);
    const libro = this.librosFiltrados[idx];
    this.verDetalle(libro.id);
  }

  onImgError(event: any): void {
    event.target.src = 'assets/book-placeholder.jpg';
  }

  autoresToString(libro: Libro): string {
    if (!libro.autores) return 'Autor desconocido';
    
    const autores = libro.autores;
    if (Array.isArray(autores)) {
      return autores
        .map((a: any) => (typeof a === 'string' ? a : a.nombre))
        .filter(Boolean)
        .join(', ');
    }
    return String(autores ?? 'Autor desconocido');
  }
}