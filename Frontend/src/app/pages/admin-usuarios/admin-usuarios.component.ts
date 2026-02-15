import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminUsuariosService, UsuarioAdmin } from '../../services/admin-usuarios.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.css'],
  imports: [CommonModule, RouterModule]
})
export class AdminUsuariosComponent implements OnInit {

  usuarios: UsuarioAdmin[] = [];
  cargando = false;
  error = '';

  constructor(
    private adminService: AdminUsuariosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // opcional: podrías comprobar rol aquí y redirigir si no es admin
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = '';

    this.adminService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
        this.error = 'No se han podido cargar los usuarios.';
        this.cargando = false;
      }
    });
  }

  toggleBan(usuario: UsuarioAdmin): void {
    const accion = usuario.activo ? 'banear' : 'desbanear';

    const peticion = usuario.activo
      ? this.adminService.banearUsuario(usuario.id)
      : this.adminService.desbanearUsuario(usuario.id);

    peticion.subscribe({
      next: (uActualizado) => {
        usuario.activo = uActualizado.activo;
      },
      error: (err) => {
        console.error(`Error al ${accion} usuario`, err);
      }
    });
  }

  esAdminLogueado(): boolean {
    return this.authService.isAdmin();
  }

}
