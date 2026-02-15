import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'lectio_token';
  private readonly USERNAME_KEY = 'lectio_username';
  private readonly USERID_KEY = 'lectio_userid'; // ✅ NUEVO: clave para userId
  private readonly ROLES_KEY = 'lectio_roles';

  private readonly isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => this.storeSession(res))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.storeSession(res))
    );
  }

  private storeSession(res: AuthResponse): void {
    if (!this.isBrowser) return;

    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USERNAME_KEY, res.username);
    localStorage.setItem(this.USERID_KEY, String(res.userId));
    localStorage.setItem(this.ROLES_KEY, JSON.stringify(res.roles ?? []));
    
    console.log('🔐 Sesión almacenada:', {
      userId: res.userId,
      username: res.username,
      token: res.token?.substring(0, 20) + '...'
    });
  }

  logout(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USERNAME_KEY);
    localStorage.removeItem(this.USERID_KEY); // ✅ Remover userId también
    localStorage.removeItem(this.ROLES_KEY);
    console.log('🔓 Sesión cerrada');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUsername(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.USERNAME_KEY);
  }

  // ✅ NUEVO MÉTODO: Obtener userId
  getUserId(): number {
    if (!this.isBrowser) return 0;
    
    try {
      const userIdStr = localStorage.getItem(this.USERID_KEY);
      if (!userIdStr) return 0;
      
      const userId = parseInt(userIdStr, 10);
      return isNaN(userId) ? 0 : userId;
    } catch (error) {
      console.error('Error obteniendo userId:', error);
      return 0;
    }
  }

  getRoles(): string[] {
    if (!this.isBrowser) return [];
    try {
      return JSON.parse(localStorage.getItem(this.ROLES_KEY) || '[]');
    } catch {
      return [];
    }
  }

  isAdmin(): boolean {
    return this.getRoles().includes('ADMIN');
  }
}