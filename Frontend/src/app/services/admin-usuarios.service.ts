import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioAdmin {
  id: number;
  username: string;
  email: string;
  activo: boolean;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AdminUsuariosService {
  private apiUrl = `${environment.apiUrl}/admin/usuarios`;

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(this.apiUrl);
  }

  banearUsuario(id: number): Observable<UsuarioAdmin> {
    return this.http.post<UsuarioAdmin>(`${this.apiUrl}/${id}/ban`, {});
  }

  desbanearUsuario(id: number): Observable<UsuarioAdmin> {
    return this.http.post<UsuarioAdmin>(`${this.apiUrl}/${id}/unban`, {});
  }
}
