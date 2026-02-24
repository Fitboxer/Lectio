import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  errorMsg = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si ya está autenticado, redirigir inmediatamente
    if (this.authService.isAuthenticated()) {
      console.log('👤 Usuario ya autenticado, redirigiendo a home');
      this.router.navigate(['/home']);
    }
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMsg = 'Por favor completa todos los campos';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';

    console.log('📤 Intentando login con:', this.username);

    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('✅ Login exitoso en componente');
        
        // Pequeño delay para asegurar que todo se actualizó
        setTimeout(() => {
          if (this.authService.isAuthenticated()) {
            console.log('🎉 Usuario autenticado, redirigiendo a home');
            this.router.navigate(['/home']);
          } else {
            console.error('❌ Error: Usuario no se autenticó');
            this.errorMsg = 'Error al iniciar sesión';
            this.cargando = false;
          }
        }, 100);
      },
      error: (error) => {
        console.error('❌ Error login:', error);
        this.errorMsg = error.error?.message || 'Usuario o contraseña incorrectos';
        this.cargando = false;
      }
    });
  }
}