import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LibrosService } from '../../services/libros.service';
import { Libro } from '../../models/libro.model';

@Component({
  selector: 'app-libros-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './libros-list.component.html',
  styleUrls: ['./libros-list.component.css']
})
export class LibrosListComponent implements OnInit {
  libros: Libro[] = [];
  librosFiltrados: Libro[] = [];
  searchTerm = '';
  cargando = true;

  constructor(
    private librosService: LibrosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.cargando = true;
    // ✅ CORREGIDO: usar getLibrosDestacados en lugar de getCatalogGoogle
    this.librosService.getLibrosDestacados('bestseller').subscribe({
      next: (data) => {
        this.libros = data;
        this.librosFiltrados = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando libros:', error);
        this.cargando = false;
      }
    });
  }

  filtrarLibros(): void {
    const term = this.searchTerm.toLowerCase();
    this.librosFiltrados = this.libros.filter(libro => 
      libro.titulo.toLowerCase().includes(term) ||
      (libro.autores && libro.autores.some(a => a.nombre.toLowerCase().includes(term)))
    );
  }

  verDetalle(id: string): void {
    this.router.navigate(['/libro', id]);
  }

  onImgError(event: any): void {
    event.target.src = 'assets/book-placeholder.jpg';
  }
}