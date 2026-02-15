import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { LibrosService } from '../../services/libros.service';
import { Libro } from '../../models/libro.model';

@Component({
  selector: 'app-libros-list',
  standalone: true,
  templateUrl: './libros-list.component.html',
  styleUrls: ['./libros-list.component.css'],
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class LibrosListComponent implements OnInit {

  libros: Libro[] = [];
  librosFiltrados: Libro[] = [];
  searchTerm = '';

  constructor(private librosService: LibrosService, private router: Router) {}

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.librosService.getCatalogoGoogle('bestseller').subscribe({
      next: data => {
        this.libros = data;
        this.librosFiltrados = data;
      }
    });
  }

  filtrarLibros(): void {
    const term = this.searchTerm.toLowerCase();
    this.librosFiltrados = this.libros.filter(l =>
      l.titulo.toLowerCase().includes(term)
    );
  }

  verDetalle(id: string): void {
    this.router.navigate(['/libros', id]);
  }

  obtenerAutores(libro: Libro): string {
    if (!libro.autores || libro.autores.length === 0) {
      return 'Autor desconocido';
    }
    return libro.autores.map(a => a.nombre).join(', ');
  }
  
}
