import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Segmento {
  id?: number;
  nome: string;
}

@Injectable({
  providedIn: 'root',
})
export class SegmentoService {
  private apiUrl = `${environment.apiUrl}/segmentos`;
  private segmentosSubject = new BehaviorSubject<Segmento[]>([]);
  public segmentos$ = this.segmentosSubject.asObservable();

  constructor(private http: HttpClient) {}

  obterTodos(): Observable<Segmento[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => this.extrairListaSegmentos(response)),
      tap((segmentos) => this.segmentosSubject.next(segmentos)),
      catchError((err) => this.handleError(err)),
    );
  }

  obterPorId(id: number): Observable<Segmento> {
    return this.http.get<Segmento>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => this.handleError(err)),
    );
  }

  criar(segmento: Segmento): Observable<Segmento> {
    return this.http.post<Segmento>(this.apiUrl, segmento).pipe(
      tap((novoSegmento) => {
        const atual = this.segmentosSubject.value;
        this.segmentosSubject.next([...atual, novoSegmento]);
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  atualizar(id: number, segmento: Segmento): Observable<Segmento> {
    return this.http.put<Segmento>(`${this.apiUrl}/${id}`, segmento).pipe(
      tap((segmentoAtualizado) => {
        const atual = this.segmentosSubject.value;
        const indice = atual.findIndex((item) => item.id === id);

        if (indice !== -1) {
          const novaLista = [...atual];
          novaLista[indice] = segmentoAtualizado;
          this.segmentosSubject.next(novaLista);
        }
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const atual = this.segmentosSubject.value;
        this.segmentosSubject.next(atual.filter((item) => item.id !== id));
      }),
      catchError((err) => this.handleError(err)),
    );
  }

  private extrairListaSegmentos(response: any): Segmento[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.segmentos)) {
      return response.segmentos;
    }

    return [];
  }

  private handleError(error: any) {
    let mensagem = 'Erro ao processar requisição';

    if (error.error instanceof ErrorEvent) {
      mensagem = error.error.message;
    } else {
      if (error.status === 409) {
        mensagem = error.error?.mensagem || error.error?.message || 'Conflito: segmento já cadastrado';
      } else {
        mensagem = error.error?.mensagem || error.error?.message || error.statusText || mensagem;
      }
    }

    return throwError(() => new Error(mensagem));
  }
}

