import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule, RouterLink],
})
export class RegisterComponent {
  username = '';
  password = '';
  confirmPassword = '';
  email = '';

  errorMessage = '';
  successMessage = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim() || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Completa todos los campos.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.password.length < 4) {
      this.errorMessage = 'La contraseña debe tener al menos 4 caracteres.';
      return;
    }

    this.loading = true;

    // ✅ Si tu AuthService tiene register({username, password}) úsalo así:
    this.authService.register({ email: this.email.trim(), username: this.username.trim(), password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Usuario creado correctamente. Ya puedes iniciar sesión.';

        // Opcional: redirigir al login tras 1s
        setTimeout(() => this.router.navigate(['/login']), 900);
      },
      error: (err) => {
        this.loading = false;
        const msg =
          err?.error?.message ||
          err?.error?.error ||
          err?.message;

        this.errorMessage =
          (typeof msg === 'string' && msg.trim().length > 0)
            ? msg
            : 'No se ha podido crear el usuario.';
      },
    });
  }
}
