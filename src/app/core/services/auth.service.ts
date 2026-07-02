import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  login(dadosLogin: any) {
    const url = `${environment.apiUrl}/api/login`;
    return this.http.post(url, dadosLogin);
  }
}