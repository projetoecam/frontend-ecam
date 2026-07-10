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
    // Remove barra no final (se houver) e garante o sufixo /api
    let baseUrl = environment.apiUrl.replace(/\/$/, ""); 
    if (!baseUrl.endsWith('/api')) {
      baseUrl += '/api';
    }
    
    // Concatena a rota final do controller
    const url = `${baseUrl}/login`; 
    
    // Log para você validar no console do navegador em produção se a URL ficou correta
    console.log('[AuthService] Disparando POST de login para:', url);
    
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    
    return this.http.post<any>(url, dadosLogin, { headers }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          console.log('[AuthService] Token salvo com sucesso!');
        }
      })
    );
  }
}