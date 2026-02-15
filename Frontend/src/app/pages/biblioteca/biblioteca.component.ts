import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { BibliotecaService } from '../../services/biblioteca.service';
import { UsuarioLibro, EstadoLectura } from '../../models/usuario-libro.model';
import { Libro } from '../../models/libro.model';
import { AuthService } from '../../services/auth.service';

type EstadoLecturaUI = EstadoLectura | 'TODOS';

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  templateUrl: './biblioteca.component.html',
  styleUrls: ['./biblioteca.component.css'],
  imports: [CommonModule, RouterLink],
})
export class BibliotecaComponent implements OnInit {
  librosUsuario: UsuarioLibro[] = [];
  cargando = false;

  estadoActivo: EstadoLecturaUI = 'TODOS';

  usuarioId: number = 0;

  constructor(
    private bibliotecaService: BibliotecaService,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.usuarioId = this.authService.getUserId();
    
    if (!this.usuarioId || this.usuarioId === 0) {
      console.error('No se pudo obtener el ID del usuario');
      this.router.navigate(['/login']);
      return;
    }

    console.log('📚 Cargando biblioteca para usuario ID:', this.usuarioId);
    this.cargarBiblioteca();
  }

  cargarBiblioteca(): void {
    this.cargando = true;
    console.log('📚 Cargando biblioteca para usuario ID:', this.usuarioId);

    this.bibliotecaService.getBiblioteca(this.usuarioId).subscribe({
      next: (data) => {
        console.log('📦 Datos de biblioteca RECIBIDOS (COMPLETOS):', JSON.stringify(data, null, 2));

        // ✅ CORREGIDO: Verificar la estructura correcta
        if (data.length > 0) {
          const primerLibro = data[0];
          console.log('🔍 Primer elemento:', primerLibro);
          console.log('🔍 libro dentro del elemento:', primerLibro.libro);
          
          if (primerLibro.libro) {
            console.log('🔍 portadaUrl:', primerLibro.libro.imagen);
            console.log('🔍 imagen:', primerLibro.libro.imagen);
            console.log('🔍 Propiedades del libro:', Object.keys(primerLibro.libro));
          }
        }

        this.librosUsuario = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar biblioteca', err);
        this.cargando = false;
      }
    });
  }

  get estadoSeleccionado(): EstadoLectura {
    return this.estadoActivo as EstadoLectura;
  }

  get totalLibros(): number {
    return this.librosUsuario.length;
  }

  get librosPorEstado(): Record<string, Libro[]> {
    console.log('📊 Calculando librosPorEstado. librosUsuario:', this.librosUsuario.length);
    
    const map: Record<string, Libro[]> = {
      'FAVORITO': [],
      'LEYENDO': [],
      'PENDIENTE': [],
      'ABANDONADO': [],
      'LEIDO': []
    };

    for (const ul of this.librosUsuario) {
      console.log('📊 Procesando UsuarioLibro:', ul);
      console.log('📊 ul.libro:', ul.libro);
      console.log('📊 ul.estadoActual:', ul.estadoActual);
      
      let estado: string = ul.estadoActual;
      
      // Mapear "Terminado" a "LEIDO"
      if (estado === 'Terminado') {
        estado = 'LEIDO';
      }
      
      if (estado && map[estado]) {
        if (ul.libro) {
          map[estado].push(ul.libro);
          console.log(`✅ Libro añadido a ${estado}:`, ul.libro.titulo);
        } else {
          console.warn('⚠️ ul.libro es undefined');
        }
      } else {
        console.warn(`⚠️ Estado no reconocido: ${estado}`);
        if (ul.libro) {
          map['PENDIENTE'].push(ul.libro);
          console.log('✅ Libro añadido a PENDIENTE por defecto');
        }
      }
    }

    // ✅ UN SOLO console.log con todos los estados
    console.log('📊 Resultado final:', {
      FAVORITO: map['FAVORITO'].length,
      LEYENDO: map['LEYENDO'].length,
      PENDIENTE: map['PENDIENTE'].length,
      ABANDONADO: map['ABANDONADO'].length,
      LEIDO: map['LEIDO'].length
    });
    
    return map;
  }

  get seccionesOrdenadas(): Array<{ key: string; label: string; libros: Libro[] }> {
    console.log('📊 Calculando seccionesOrdenadas');
    
    const labels: Record<string, string> = {
      'FAVORITO': 'Favoritos',
      'LEYENDO': 'Leyendo',
      'PENDIENTE': 'Pendientes',
      'ABANDONADO': 'Abandonados',
      'LEIDO': 'Completados',
    };

    const orden = ['FAVORITO', 'LEYENDO', 'PENDIENTE', 'ABANDONADO', 'LEIDO'];

    const resultado = orden.map((k) => {
      const libros = this.librosPorEstado[k] || [];
      console.log(`📊 Estado ${k}: ${libros.length} libros`);
      return {
        key: k,
        label: labels[k],
        libros: libros
      };
    });

    return resultado;
  }

  getPortadaUrl(libro: any): string {
    if (!libro) return '';
    
    // El backend envía la imagen en 'imagen'
    const url = libro.imagen || libro.portadaUrl || '';
    
    // Convertir HTTP a HTTPS
    if (url && url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    
    return url;
  }

  getImagenUrl(libro: Libro | any): string {
    if (!libro) return '';
    
    // Intentar con diferentes nombres de propiedad
    const url = (libro as any).imagen || libro.portadaUrl || '';
    
    // Convertir HTTP a HTTPS
    if (url && url.startsWith('http://')) {
      return url.replace('http://', 'https://');
    }
    
    return url;
  }

  verDetalle(libroId: string): void {
    this.router.navigate(['/libros', libroId]);
  }

  obtenerAutores(libro: any): string {
    if (!libro) return 'Autor desconocido';
    
    if (typeof libro.autores === 'string') return libro.autores;
    
    if (Array.isArray(libro.autores)) {
      return libro.autores
        .map((a: any) => a.nombre || a)
        .filter(Boolean)
        .join(', ') || 'Autor desconocido';
    }
    
    return 'Autor desconocido';
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}