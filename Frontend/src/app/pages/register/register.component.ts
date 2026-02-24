import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  email = '';
  username = '';
  password = '';
  confirmPassword = '';
  errorMsg = '';        // 👈 ANTES: errorMessage
  successMsg = '';      // 👈 ANTES: successMessage
  cargando = false;     // 👈 ANTES: loading

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {    // 👈 CAMBIADO de register() a onSubmit()
    // Validaciones
    if (!this.email || !this.username || !this.password || !this.confirmPassword) {
      this.errorMsg = 'Por favor completa todos los campos';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden';
      return;
    }

    if (this.password.length < 6) {
      this.errorMsg = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.cargando = true;
    this.errorMsg = '';

    const payload = {
      email: this.email.trim(),
      username: this.username.trim(),
      password: this.password
    };

    this.authService.register(payload).subscribe({
      next: (response) => {
        console.log('✅ Registro exitoso:', response);
        this.successMsg = 'Registro completado. Ahora puedes iniciar sesión.';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err: any) => {
        console.error('❌ Error registro:', err);
        this.errorMsg = err.error?.message || 'Error al registrar usuario';
        this.cargando = false;
      }
    });
  }
}