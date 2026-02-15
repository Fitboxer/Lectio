import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule, RouterLink],
})
export class LoginComponent {
  username = '';
  password = '';

  errorMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  // ✅ Método que espera el HTML (ngSubmit)="login()"
  login(): void {
    this.errorMessage = '';

    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Debes introducir usuario y contraseña.';
      return;
    }

    const payload: LoginRequest = {
      username: this.username.trim(),
      password: this.password,
    };

    this.loading = true;

    this.authService.login(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;

        // Mensaje por defecto
        this.errorMessage = 'Usuario o contraseña incorrectos.';

        // Si el backend devuelve un mensaje útil, lo mostramos
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          err?.message;

        if (typeof msg === 'string' && msg.trim().length > 0) {
          this.errorMessage = msg;
        }
      },
    });
  }

  onSubmit(): void {
    this.login();
  }
}
