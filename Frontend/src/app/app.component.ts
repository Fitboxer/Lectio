import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Lectio';
  currentYear = new Date().getFullYear();

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('📍 Ruta actual:', this.router.url);
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  onProfileClick(): void {
    console.log('👤 Click en perfil. Estado actual:');
    
    if (this.authService.isAuthenticated()) {
      console.log('✅ Usuario autenticado, redirigiendo a biblioteca');
      this.router.navigate(['/biblioteca']);
    } else {
      console.log('🔓 Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}