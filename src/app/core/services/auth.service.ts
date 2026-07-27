import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(dadosLogin: { login: string, senha: string }): Observable<any> {
    const url = `${environment.apiUrl}/login`; 
    
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post<any>(url, dadosLogin, { headers }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  private decodificarPayloadDoToken(token: string): any {
    try {
      const payloadBase64 = token.split('.')[1];
      return JSON.parse(atob(payloadBase64));
    } catch (e) {
      return null;
    }
  }

  hasPermissao(permissaoDesejada: string): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const payload = this.decodificarPayloadDoToken(token);
    if (!payload || !payload.permissoes) return false;
    return payload.permissoes.includes(permissaoDesejada);
  }
}