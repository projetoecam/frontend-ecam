import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DemandaTipo {
  id?: number;
  idDemanda?: number;
  tipoSaude?: boolean;
  descricaoTipoSaude?: string;
  tipoInfraestrutura?: boolean;
  descricaoTipoInfraestrutura?: string;
  tipoEducacao?: boolean;
  descricaoTipoEducacao?: string;
  tipoSeguranca?: boolean;
  descricaoTipoSeguranca?: string;
  tipoOutros?: boolean;
  descricaoTipoOutros?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DemandaTipoService {
  // CORREÇÃO: URL exata do controller do Spring Boot (/demanda-tipos em vez de /demandas-tipos)
  private apiUrl = `${environment.apiUrl}/demanda-tipos`;

  constructor(private http: HttpClient) {}

  criar(demandaTipo: DemandaTipo): Observable<DemandaTipo> {
    return this.http.post<DemandaTipo>(this.apiUrl, demandaTipo).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  atualizar(id: number, demandaTipo: DemandaTipo): Observable<DemandaTipo> {
    return this.http.put<DemandaTipo>(`${this.apiUrl}/${id}`, demandaTipo).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(error: any) {
    let mensagem = 'Erro ao processar o tipo de demanda';
    if (error.error instanceof ErrorEvent) {
      mensagem = error.error.message;
    } else {
      mensagem = error.error?.mensagem || error.error?.message || error.statusText || mensagem;
    }
    return throwError(() => new Error(mensagem));
  }
}
