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
    let baseUrl = environment.apiUrl.replace(/\/$/, ""); 
    if (!baseUrl.endsWith('/api')) {
      baseUrl += '/api';
    }
    
    const url = `${baseUrl}/login`; 
  
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