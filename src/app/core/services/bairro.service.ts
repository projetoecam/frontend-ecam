import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MacroRegiao } from './macro-regiao.service';

export interface Bairro {
  id?: number;
  nome: string;
  macroRegiao: MacroRegiao;
}

@Injectable({
  providedIn: 'root',
})
export class BairroService {
  private apiUrl = `${environment.apiUrl}/bairros`;
  private bairrosSubject = new BehaviorSubject<Bairro[]>([]);
  public bairros$ = this.bairrosSubject.asObservable();

  constructor(private http: HttpClient) {}

  obterTodos(): Observable<Bairro[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => this.extrairListaBairros(response)),
      tap((bairros) => this.bairrosSubject.next(bairros)),
      catchError((err) => this.handleError(err)),
    );
  }

  obterPorId(id: number): Observable<Bairro> {
    return this.http.get<Bairro>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  criar(bairro: Bairro): Observable<Bairro> {
    return this.http.post<Bairro>(this.apiUrl, bairro).pipe(
      tap((novoBairro) => {
        const atual = this.bairrosSubject.value;
        this.bairrosSubject.next([...atual, novoBairro]);
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  atualizar(id: number, bairro: Bairro): Observable<Bairro> {
    return this.http.put<Bairro>(`${this.apiUrl}/${id}`, bairro).pipe(
      tap((bairroAtualizado) => {
        const atual = this.bairrosSubject.value;
        const indice = atual.findIndex((item) => item.id === id);
        if (indice !== -1) {
          const novaLista = [...atual];
          novaLista[indice] = bairroAtualizado;
          this.bairrosSubject.next(novaLista);
        }
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const atual = this.bairrosSubject.value;
        this.bairrosSubject.next(atual.filter((item) => item.id !== id));
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  private extrairListaBairros(response: any): Bairro[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.bairros)) {
      return response.bairros;
    }

    return [];
  }

  private handleError(error: any) {
    let mensagem = 'Erro ao processar requisição';

    if (error.error instanceof ErrorEvent) {
      mensagem = error.error.message;
    } else {
      if (error.status === 409) {
        mensagem = error.error?.mensagem || error.error?.message || 'Conflito: bairro já cadastrado';
      } else {
        mensagem = error.error?.mensagem || error.error?.message || error.statusText || mensagem;
      }
    }

    return throwError(() => new Error(mensagem));
  }
}

