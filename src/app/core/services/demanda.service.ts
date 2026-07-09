import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Demanda {
  id?: number;
  numeroSequencial?: number;
  ano?: number;
  idSolicitante?: number;
  idComunidade?: number;
  idLiderResponsavel?: number | null;
  orgaoResponsavel?: string;
  status?: string;
  dataSolicitacao?: string;
  idOperador?: number;
}

@Injectable({
  providedIn: 'root',
})
export class DemandaService {
  private apiUrl = `${environment.apiUrl}/demandas`;

  constructor(private http: HttpClient) {}

  criar(demanda: Demanda): Observable<Demanda> {
    return this.http.post<Demanda>(this.apiUrl, demanda).pipe(
      catchError((err) => this.handleError(err))
    );
  }

  private handleError(error: any) {
    let mensagem = 'Erro ao processar demanda';
    if (error.error instanceof ErrorEvent) {
      mensagem = error.error.message;
    } else {
      mensagem = error.error?.mensagem || error.error?.message || error.statusText || mensagem;
    }
    return throwError(() => new Error(mensagem));
  }
}