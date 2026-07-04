import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Municipio {
  id?: number;
  nome: string;
  uf: string;
}

@Injectable({
  providedIn: 'root'
})
export class MunicipioService {
  private apiUrl = `${environment.apiUrl}/municipios`;
  private municipiosSubject = new BehaviorSubject<Municipio[]>([]);
  public municipios$ = this.municipiosSubject.asObservable();

  constructor(private http: HttpClient) {}

  private logResposta(operacao: string, payload: any) {
    console.log(`[MunicipioService] ${operacao}:`, payload);
  }

  // Obter todos os municipios
  obterTodos(): Observable<Municipio[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => this.extrairListaMunicipios(response)),
      tap(municipios => {
        this.logResposta('GET municipios', municipios);
        this.municipiosSubject.next(municipios);
      }),
      catchError(this.handleError)
    );
  }

  private extrairListaMunicipios(response: any): Municipio[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.municipios)) {
      return response.municipios;
    }

    return [];
  }

  // Obter municipio por ID
  obterPorId(id: number): Observable<Municipio> {
    return this.http.get<Municipio>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Criar novo municipio
  criar(municipio: Municipio): Observable<Municipio> {
    return this.http.post<Municipio>(this.apiUrl, municipio).pipe(
      tap(novoMunicipio => {
        this.logResposta('POST municipio', novoMunicipio);
        const atual = this.municipiosSubject.value;
        this.municipiosSubject.next([...atual, novoMunicipio]);
      }),
      catchError(this.handleError)
    );
  }

  // Atualizar municipio
  atualizar(id: number, municipio: Municipio): Observable<Municipio> {
    return this.http.put<Municipio>(`${this.apiUrl}/${id}`, municipio).pipe(
      tap(municipioAtualizado => {
        this.logResposta('PUT municipio', municipioAtualizado);
        const atual = this.municipiosSubject.value;
        const indice = atual.findIndex(m => m.id === id);
        if (indice !== -1) {
          const novaLista = [...atual];
          novaLista[indice] = municipioAtualizado;
          this.municipiosSubject.next(novaLista);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Deletar municipio
  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.logResposta('DELETE municipio', { id });
        const atual = this.municipiosSubject.value;
        const novaLista = atual.filter(m => m.id !== id);
        this.municipiosSubject.next(novaLista);
      }),
      catchError(this.handleError)
    );
  }

  // Tratamento de erros
  private handleError(error: any) {
    let mensagem = 'Erro ao processar requisição';
    
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      mensagem = error.error.message;
    } else {
      // Erro do servidor
      if (error.status === 409) {
        mensagem = error.error?.mensagem || error.error?.message || 'Conflito: município já cadastrado';
      } else {
        mensagem = error.error?.mensagem || error.error?.message || error.statusText || mensagem;
      }
    }
    
    console.error('Erro:', mensagem);
    return throwError(() => new Error(mensagem));
  }
}
