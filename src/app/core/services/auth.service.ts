import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/login';

  constructor(private http: HttpClient) { }

  login(login: string, senha: string): Observable<any> {
    const payload = { login, senha };
    return this.http.post(this.apiUrl, payload);
  }
}