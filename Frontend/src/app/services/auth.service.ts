import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol?: {
    id: number;
    nombre: string;
  };
}

export interface LoginResponse {
  token: string;
  username: string;
  userId: number;
  roles: Array<{ id: number; nombre: string }>;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject: BehaviorSubject<Usuario | null>;
  public currentUser$: Observable<Usuario | null>;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(this.getUserFromStorage());
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    console.log('🔍 AuthService iniciado. Usuario en storage:', this.currentUserSubject.value);
  }

  public get currentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const autenticado = !!this.getToken() && !!this.currentUser;
    return autenticado;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.currentUser?.rol?.nombre === 'ADMIN';
  }

  getUsername(): string {
    return this.currentUser?.nombre || '';
  }

  getUsuarioId(): number | null {
    return this.currentUser?.id || null;
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  /**
   * Login - CORREGIDO para el formato de tu backend
   */
  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    console.log('📤 Intentando login con:', credentials.username);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('✅ Login response:', response);
        
        if (response.token && response.username && response.userId && this.isBrowser) {
          // Transformar la respuesta al formato Usuario
          const usuario: Usuario = {
            id: response.userId,
            nombre: response.username,
            email: '', // Si el backend no devuelve email, lo dejamos vacío
            rol: response.roles && response.roles.length > 0 ? response.roles[0] : undefined
          };
          
          // Guardar en localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(usuario));
          
          // Actualizar BehaviorSubject
          this.currentUserSubject.next(usuario);
          
          console.log('💾 Usuario guardado:', usuario.nombre);
          console.log('🔑 Token guardado:', response.token.substring(0, 20) + '...');
        } else {
          console.error('❌ Respuesta de login incompleta:', response);
        }
      }),
      catchError(error => {
        console.error('❌ Error en login:', error);
        return throwError(() => error);
      })
    );
  }

  register(data: { email: string; username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      tap(response => console.log('✅ Registro response:', response)),
      catchError(error => {
        console.error('❌ Error en registro:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    console.log('👋 Logout');
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  private getUserFromStorage(): Usuario | null {
    if (!this.isBrowser) return null;
    
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('📖 Usuario cargado de storage:', user.nombre);
        return user;
      } catch (e) {
        console.error('Error parsing user from storage:', e);
        return null;
      }
    }
    return null;
  }

}