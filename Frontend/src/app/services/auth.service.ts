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

  login(credentials: { username: string; password: string }): Observable<LoginResponse> {
    console.log('📤 Intentando login con:', credentials.username);
    
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('✅ Login response:', response);
        
        if (response.token && response.username && response.userId && this.isBrowser) {
          const usuario: Usuario = {
            id: response.userId,
            nombre: response.username,
            email: '',
            rol: response.roles && response.roles.length > 0 ? response.roles[0] : undefined
          };
          
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(usuario));
          this.currentUserSubject.next(usuario);
          
          console.log('💾 Usuario guardado:', usuario.nombre);
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

  /**
   * Registro de usuario - CORREGIDO para manejar mejor los errores
   */
  register(data: { email: string; username: string; password: string }): Observable<any> {
    console.log('📤 Intentando registro con:', data.email, data.username);
    
    return this.http.post<any>(`${this.apiUrl}/register`, data).pipe(
      tap(response => console.log('✅ Registro response:', response)),
      catchError(error => {
        console.error('❌ Error en registro:', error);
        
        // ✅ Extraer mensaje de error del backend
        let mensajeError = 'Error al registrar usuario';
        
        if (error.error) {
          // Si el backend devuelve un mensaje específico
          if (typeof error.error === 'string') {
            mensajeError = error.error;
          } else if (error.error.message) {
            mensajeError = error.error.message;
          } else if (error.error.error) {
            mensajeError = error.error.error;
          }
          
          // Mensajes específicos para errores comunes
          if (error.status === 409) {
            if (mensajeError.includes('email')) {
              mensajeError = 'El email ya está registrado';
            } else if (mensajeError.includes('username') || mensajeError.includes('nombre')) {
              mensajeError = 'El nombre de usuario ya existe';
            } else {
              mensajeError = 'El email o usuario ya están registrados';
            }
          } else if (error.status === 400) {
            mensajeError = 'Datos de registro inválidos';
          }
        }
        
        // Devolver un error con el mensaje personalizado
        return throwError(() => ({
          status: error.status,
          message: mensajeError
        }));
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

  debugState(): void {
    console.log('🔍 Estado AuthService:', {
      isBrowser: this.isBrowser,
      hasToken: !!this.getToken(),
      currentUser: this.currentUser,
      tokenPreview: this.getToken()?.substring(0, 20)
    });
  }
}