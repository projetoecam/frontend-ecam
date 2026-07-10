import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Pessoa {
  id?: number;
  nomeCompleto: string;
  cpf: string;
  tituloEleitor: string;
  nomeMae: string;
  dataNascimento: string;
  telefone: string;
  whatsapp: string;
  enderecoCompleto: string;
  cep: string;
  origemCadastro: string;
  status: string;
  observacoes?: string;
  dataCadastro?: string;

  // IDs para escrita plana (API recebe esses dados, sem objetos)
  idComunidade?: number;
  idLiderResponsavel?: number | null;
  idLiderRegional?: number | null;
  idUsuarioCadastro?: number;

  // Propriedades opcionais para caso o DTO de retorno contenha dados aninhados
  comunidade?: any;
  usuarioCadastro?: any;
  liderResponsavel?: any;
  liderRegional?: any;
}

@Injectable({
  providedIn: 'root',
})
export class FichaService {
  private apiUrl = `${environment.apiUrl}/pessoas`;
  private pessoasSubject = new BehaviorSubject<Pessoa[]>([]);
  public pessoas$ = this.pessoasSubject.asObservable();

  constructor(private http: HttpClient) {}

  obterTodos(): Observable<Pessoa[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => this.extrairListaPessoas(response)),
      tap((pessoas) => this.pessoasSubject.next(pessoas)),
      catchError((err) => this.handleError(err)),
    );
  }

  private extrairListaPessoas(response: any): Pessoa[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (Array.isArray(response?.content)) {
      return response.content;
    }
    if (Array.isArray(response?.data)) {
      return response.data;
    }
    if (Array.isArray(response?.pessoas)) {
      return response.pessoas;
    }
    return [];
  }

  obterPorId(id: number): Observable<Pessoa> {
    return this.http.get<Pessoa>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  criar(pessoa: Pessoa): Observable<Pessoa> {
    return this.http.post<Pessoa>(this.apiUrl, pessoa).pipe(
      tap((novaPessoa) => {
        const atual = this.pessoasSubject.value;
        this.pessoasSubject.next([...atual, novaPessoa]);
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  atualizar(id: number, pessoa: Pessoa): Observable<Pessoa> {
    return this.http.put<Pessoa>(`${this.apiUrl}/${id}`, pessoa).pipe(
      tap((pessoaAtualizada) => {
        const atual = this.pessoasSubject.value;
        const indice = atual.findIndex((item) => item.id === id);

        if (indice !== -1) {
          const novaLista = [...atual];
          novaLista[indice] = pessoaAtualizada;
          this.pessoasSubject.next(novaLista);
        }
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const atual = this.pessoasSubject.value;
        this.pessoasSubject.next(atual.filter((item) => item.id !== id));
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
        mensagem = error.error?.mensagem || error.error?.message || 'Conflito: pessoa já cadastrada';
      } else if (error.status === 403) {
        mensagem = error.error?.mensagem || 'Usuário não possui permissão para realizar a operação.';
      } else {
        mensagem = error.error?.mensagem || error.error?.message || error.statusText || mensagem;
      }
    }

    return throwError(() => new Error(mensagem));
  }
}
