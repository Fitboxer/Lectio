import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
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

  // ---------- CARGA DE DATOS ----------

  cargarLibros(): void {
    this.cargando = true;
    this.errorMsg = '';

    this.librosService.getCatalogoInicial()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data) => {
          this.libros = data ?? [];
          this.configurarFiltros();
          this.aplicarFiltros();
        },
        error: (err) => {
          console.error('Error cargando libros:', err);
          this.errorMsg = 'No se han podido cargar los libros. Revisa la conexión o la API.';
          this.libros = [];
          this.librosFiltrados = [];
        }
      });
  }

  // ---------- FILTROS ----------

  private configurarFiltros(): void {
    const generos = new Set<string>();
    const anios = new Set<number>();

    for (const libro of this.libros) {
      if ((libro as any).generos && Array.isArray((libro as any).generos)) {
        (libro as any).generos.forEach((g: any) => {
          const nombre = typeof g === 'string' ? g : g.nombre;
          if (nombre) generos.add(nombre);
        });
      }

      if (libro.anioPublicacion) {
        anios.add(Number(libro.anioPublicacion));
      }
    }

    this.generosDisponibles = ['Todos', ...Array.from(generos).sort()];
    this.aniosDisponibles = ['Todos', ...Array.from(anios).sort((a, b) => b - a)];
  }

  aplicarFiltros(): void {
    const termino = this.searchTerm?.toLowerCase().trim() ?? '';
    const genero = this.selectedGenero;
    const anio = this.selectedAnio;

    this.librosFiltrados = this.libros.filter((libro) => {
      const titulo = libro.titulo?.toLowerCase() ?? '';
      const autores = this.autoresToString(libro).toLowerCase();
      const coincideTexto =
        !termino || titulo.includes(termino) || autores.includes(termino);

      // filtro por género
      let coincideGenero = true;
      if (genero && genero !== 'Todos') {
        const generosLibro: string[] =
          (libro as any).generos?.map((g: any) => (typeof g === 'string' ? g : g.nombre)) ?? [];
        coincideGenero = generosLibro.includes(genero);
      }

      // filtro por año
      let coincideAnio = true;
      if (anio && anio !== 'Todos') {
        coincideAnio = String(libro.anioPublicacion) === String(anio);
      }

      return coincideTexto && coincideGenero && coincideAnio;
    });

    // al cambiar filtros, volvemos a la primera página
    this.currentPage = 1;
  }

  // ---------- PAGINACIÓN ----------

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

  // ---------- ACCIONES ----------

  verDetalle(id: string): void {
    console.log('Navegando a libro con ID:', id);
    
    this.router.navigate(['/libro', id]);
  }

  sorprenderme(): void {
    if (!this.librosFiltrados.length) return;
    const idx = Math.floor(Math.random() * this.librosFiltrados.length);
    const libro = this.librosFiltrados[idx];
    console.log('Libro sorpresa seleccionado:', libro.titulo, 'ID:', libro.id);
    this.verDetalle(libro.id);
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'assets/book-placeholder.jpg';
  }

  autoresToString(libro: Libro): string {
    // Ajusta según tu modelo real de autores
    const autores = (libro as any).autores ?? [];
    if (Array.isArray(autores)) {
      return autores
        .map((a: any) => (typeof a === 'string' ? a : a.nombre))
        .filter(Boolean)
        .join(', ');
    }
    return String(autores ?? '');
  }

  getPortadaUrl(libro: any): string {
    if (!libro) return '';
    return libro.imagen || libro.portadaUrl || '';
  }
}
