import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PerfilAcesso {
  id: number;
  nome: string;
  descricao: string;
  permissoes?: any[];
}

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private apiUrl = `${environment.apiUrl}/perfis`;
  private apiPermissoesUrl = `${environment.apiUrl}/permissoes`;

  constructor(private http: HttpClient) {}

  listarPerfis(): Observable<PerfilAcesso[]> {
    return this.http.get<PerfilAcesso[]>(this.apiUrl);
  }

  listarTodasPermissoes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiPermissoesUrl);
  }

  atualizarPermissoes(perfilId: number, permissoesIds: number[]): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${perfilId}/permissoes`, permissoesIds);
  }
}