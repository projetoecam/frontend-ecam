import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Lideranca {
  id?: number;
  idPessoa?: number;
  tipoLideranca: string;
  classificacao: string;
  qtdPessoasMobiliza?: number | null;
  historicoPolitico?: string;
  pessoa?: {
    id?: number;
    nomeCompleto?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LiderancaService {
  private apiUrl = `${environment.apiUrl}/liderancas`;
  private liderancasSubject = new BehaviorSubject<Lideranca[]>([]);
  public liderancas$ = this.liderancasSubject.asObservable();

  constructor(private http: HttpClient) {}

  obterTodos(): Observable<Lideranca[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => this.extrairListaLiderancas(response)),
      tap((liderancas) => this.liderancasSubject.next(liderancas)),
      catchError((err) => this.handleError(err)),
    );
  }

  obterPorId(id: number): Observable<Lideranca> {
    return this.http.get<Lideranca>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  criar(lideranca: Lideranca): Observable<Lideranca> {
    return this.http.post<Lideranca>(this.apiUrl, lideranca).pipe(
      tap((novaLideranca) => {
        const atual = this.liderancasSubject.value;
        this.liderancasSubject.next([...atual, novaLideranca]);
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  atualizar(id: number, lideranca: Lideranca): Observable<Lideranca> {
    return this.http.put<Lideranca>(`${this.apiUrl}/${id}`, lideranca).pipe(
      tap((liderancaAtualizada) => {
        const atual = this.liderancasSubject.value;
        const indice = atual.findIndex((item) => this.getId(item) === id);

        if (indice !== -1) {
          const novaLista = [...atual];
          novaLista[indice] = liderancaAtualizada;
          this.liderancasSubject.next(novaLista);
        }
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const atual = this.liderancasSubject.value;
        this.liderancasSubject.next(atual.filter((item) => this.getId(item) !== id));
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  private extrairListaLiderancas(response: any): Lideranca[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.liderancas)) {
      return response.liderancas;
    }

    return [];
  }

  private getId(item: Lideranca): number | undefined {
    return item.id ?? item.idPessoa ?? item.pessoa?.id;
  }

  private handleError(error: any) {
    let mensagem = 'Erro ao processar requisição';

    if (error.error instanceof ErrorEvent) {
      mensagem = error.error.message;
    } else {
      if (error.status === 409) {
        mensagem =
          error.error?.mensagem || error.error?.message || 'Conflito: liderança já cadastrada';
      } else {
        mensagem = error.error?.mensagem || error.error?.message || error.statusText || mensagem;
      }
    }

    return throwError(() => new Error(mensagem));
  }
}

