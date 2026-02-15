import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { LibrosListComponent } from './pages/libros-list/libros-list.component';
import { LibroDetalleComponent } from './pages/libro-detalle/libro-detalle.component';
import { BibliotecaComponent } from './pages/biblioteca/biblioteca.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { AdminUsuariosComponent } from './pages/admin-usuarios/admin-usuarios.component';

export const routes: Routes = [
  // Ruta por defecto → Inicio
  { path: '', component: HomeComponent },

  // Resto de páginas
  { path: 'libros', component: LibrosListComponent },
  { path: 'libro/:id', component: LibroDetalleComponent },
  { path: 'biblioteca', component: BibliotecaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin/usuarios', component: AdminUsuariosComponent },
  
  // Cualquier otra ruta redirige al inicio
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
