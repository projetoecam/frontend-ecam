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
    const url = `${environment.apiUrl}/api/login`; 
    
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