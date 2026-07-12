import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Municipio } from './municipio.service';

export interface MacroRegiao {
  id?: number;
  municipio: Municipio;
  nome: string;
  regiao_apelido: string;
}

@Injectable({
  providedIn: 'root',
})
export class MacroRegiaoService {
  private apiUrl = `${environment.apiUrl}/macro-regioes`;
  private macroRegioesSubject = new BehaviorSubject<MacroRegiao[]>([]);
  public macroRegioes$ = this.macroRegioesSubject.asObservable();

  constructor(private http: HttpClient) {}

  private logResposta(operacao: string, payload: any) {
    // Mantido silencioso para seguir o padrão do serviço de usuário
  }

  obterTodos(): Observable<MacroRegiao[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => this.extrairListaMacroRegioes(response)),
      tap((macroRegioes) => {
        this.logResposta('GET macro-regioes', macroRegioes);
        this.macroRegioesSubject.next(macroRegioes);
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  private extrairListaMacroRegioes(response: any): MacroRegiao[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.macroRegioes)) {
      return response.macroRegioes;
    }

    return [];
  }

  obterPorId(id: number): Observable<MacroRegiao> {
    return this.http.get<MacroRegiao>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  criar(macroRegiao: MacroRegiao): Observable<MacroRegiao> {
    return this.http.post<MacroRegiao>(this.apiUrl, macroRegiao).pipe(
      tap((novaMacroRegiao) => {
        this.logResposta('POST macro-regiao', novaMacroRegiao);
        const atual = this.macroRegioesSubject.value;
        this.macroRegioesSubject.next([...atual, novaMacroRegiao]);
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  atualizar(id: number, macroRegiao: MacroRegiao): Observable<MacroRegiao> {
    return this.http.put<MacroRegiao>(`${this.apiUrl}/${id}`, macroRegiao).pipe(
      tap((macroRegiaoAtualizada) => {
        this.logResposta('PUT macro-regiao', macroRegiaoAtualizada);
        const atual = this.macroRegioesSubject.value;
        const indice = atual.findIndex((item) => item.id === id);
        if (indice !== -1) {
          const novaLista = [...atual];
          novaLista[indice] = macroRegiaoAtualizada;
          this.macroRegioesSubject.next(novaLista);
        }
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.logResposta('DELETE macro-regiao', { id });
        const atual = this.macroRegioesSubject.value;
        this.macroRegioesSubject.next(atual.filter((item) => item.id !== id));
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
        mensagem = error.error?.mensagem || error.error?.message || 'Conflito: macro região já cadastrada';
      } else {
        mensagem = error.error?.mensagem || error.error?.message || error.statusText || mensagem;
      }
    }

    console.error('Erro:', mensagem);
    return throwError(() => new Error(mensagem));
  }
}

