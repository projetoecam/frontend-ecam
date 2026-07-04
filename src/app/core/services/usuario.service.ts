import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Usuario {
  id?: number;
  nome: string;
  login_usuario: string;
  senha_hash: string;
  perfil: string;
  ativo: boolean;
  data_criacao?: string | Date;
  codigo_sessao?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuarios`;
  private usuariosSubject = new BehaviorSubject<Usuario[]>([]);
  public usuarios$ = this.usuariosSubject.asObservable();

  constructor(private http: HttpClient) {}

  private logResposta(operacao: string, payload: any) {
    
  }

  obterTodos(): Observable<Usuario[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => this.extrairListaUsuarios(response)),
      tap((usuarios) => {
        this.logResposta('GET usuarios', usuarios);
        this.usuariosSubject.next(usuarios);
      }),
      catchError(this.handleError),
    );
  }

  private extrairListaUsuarios(response: any): Usuario[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.usuarios)) {
      return response.usuarios;
    }

    return [];
  }

  obterPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`).pipe(catchError(this.handleError));
  }

  criar(usuario: Usuario): Observable<any> {
    const urlRegistro = `${environment.apiUrl}/login/registrar`;
    return this.http.post(urlRegistro, usuario, { responseType: 'text' }).pipe(
      tap(resposta => {
        this.logResposta('POST usuario (registro)', resposta);
      }),
      catchError(this.handleError)
    );
  }

  atualizar(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario).pipe(
      tap((usuarioAtualizado) => {
        this.logResposta('PUT usuario', usuarioAtualizado);
        const atual = this.usuariosSubject.value;
        const indice = atual.findIndex((u) => u.id === id);
        if (indice !== -1) {
          const novaLista = [...atual];
          novaLista[indice] = usuarioAtualizado;
          this.usuariosSubject.next(novaLista);
        }
      }),
      catchError(this.handleError),
    );
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.logResposta('DELETE usuario', { id });
        const atual = this.usuariosSubject.value;
        const novaLista = atual.filter((u) => u.id !== id);
        this.usuariosSubject.next(novaLista);
      }),
      catchError(this.handleError),
    );
  }

  private handleError(error: any) {
    let mensagem = 'Erro ao processar requisição';

    if (error.error instanceof ErrorEvent) {
      mensagem = error.error.message;
    } else {
      if (error.status === 409) {
        mensagem =
          error.error?.mensagem || error.error?.message || 'Conflito: usuário já cadastrado';
      } else {
        mensagem = error.error?.mensagem || error.error?.message || error.statusText || mensagem;
      }
    }

    console.error('Erro:', mensagem);
    return throwError(() => new Error(mensagem));
  }
}
