import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  // Recebe um único objeto com login e senha
  login(dadosLogin: { login: string, senha: string }): Observable<any> {
    const url = `${environment.apiUrl}/api/login`;
    return this.http.post(url, dadosLogin);
  }
}