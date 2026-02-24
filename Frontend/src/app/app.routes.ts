import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { BibliotecaComponent } from './pages/biblioteca/biblioteca.component';
import { LibroDetalleComponent } from './pages/libro-detalle/libro-detalle.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'biblioteca', component: BibliotecaComponent },
  { path: 'libro/:id', component: LibroDetalleComponent },
  { path: '**', redirectTo: '/home' }
];