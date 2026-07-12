import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface OperationConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface OperationConfirmState {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

@Injectable({
  providedIn: 'root',
})
export class OperationConfirmService {
  private readonly stateSubject = new BehaviorSubject<OperationConfirmState | null>(null);
  readonly state$ = this.stateSubject.asObservable();

  private resolver?: (value: boolean) => void;

  confirm(options: OperationConfirmOptions): Promise<boolean> {
    if (this.resolver) {
      this.resolver(false);
      this.resolver = undefined;
    }

    this.stateSubject.next({
      title: options.title || 'Confirmar exclusao',
      message: options.message,
      confirmText: options.confirmText || 'Excluir',
      cancelText: options.cancelText || 'Cancelar',
    });

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  close(answer: boolean): void {
    if (this.resolver) {
      this.resolver(answer);
      this.resolver = undefined;
    }

    this.stateSubject.next(null);
  }
}
