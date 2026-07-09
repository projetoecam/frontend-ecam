import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Comunidade {
  id?: number;
  nome: string;
  cep?: string;
  enderecoPrincipal?: string;
  pontoReferencia?: string;
  qtdAproximadaMoradores?: number | null;
  grauPrioridade?: string;
  classificacao?: string;

  // IDs para escrita (POST/PUT)
  idBairro?: number;
  idMacroRegiao?: number | null;

  // Objetos para leitura (GET)
  bairro?: any;
  macroRegiao?: any;
}

@Injectable({
  providedIn: 'root',
})
export class ComunidadeService {
  private apiUrl = `${environment.apiUrl}/comunidades`;
  private comunidadesSubject = new BehaviorSubject<Comunidade[]>([]);
  public comunidades$ = this.comunidadesSubject.asObservable();

  constructor(private http: HttpClient) {}

  obterTodos(): Observable<Comunidade[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => this.extrairListaComunidades(response)),
      tap((comunidades) => this.comunidadesSubject.next(comunidades)),
      catchError((err) => this.handleError(err)),
    );
  }

  private extrairListaComunidades(response: any): Comunidade[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.comunidades)) {
      return response.comunidades;
    }

    return [];
  }

  obterPorId(id: number): Observable<Comunidade> {
    return this.http.get<Comunidade>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  criar(comunidade: Comunidade): Observable<Comunidade> {
    return this.http.post<Comunidade>(this.apiUrl, comunidade).pipe(
      tap((novaComunidade) => {
        const atual = this.comunidadesSubject.value;
        this.comunidadesSubject.next([...atual, novaComunidade]);
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  atualizar(id: number, comunidade: Comunidade): Observable<Comunidade> {
    return this.http.put<Comunidade>(`${this.apiUrl}/${id}`, comunidade).pipe(
      tap((comunidadeAtualizada) => {
        const atual = this.comunidadesSubject.value;
        const indice = atual.findIndex((item) => item.id === id);
        if (indice !== -1) {
          const novaLista = [...atual];
          novaLista[indice] = comunidadeAtualizada;
          this.comunidadesSubject.next(novaLista);
        }
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const atual = this.comunidadesSubject.value;
        this.comunidadesSubject.next(atual.filter((item) => item.id !== id));
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  private handleError(error: any) {
    let mensagem = 'Erro ao processar requisição';

    if (error.error instanceof ErrorEvent) {
      mensagem = error.error.message;
    } else {
      if (error.status === 409) {
        mensagem = error.error?.mensagem || error.error?.message || 'Conflito: comunidade já cadastrada';
      } else if (error.status === 403) {
        mensagem = 'Acesso negado (403). Verifique se você está logado, se seu token não expirou e se tem permissão de ADMIN.';
      } else {
        mensagem = error.error?.mensagem || error.error?.message || error.statusText || mensagem;
      }
    }

    return throwError(() => new Error(mensagem));
  }
}