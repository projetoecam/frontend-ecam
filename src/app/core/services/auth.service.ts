import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(dadosLogin: { login: string, senha: string }): Observable<any> {
  const url = `${environment.apiUrl}/api/login`;
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  return this.http.post(url, dadosLogin, { headers });
  }
}