import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type OperationFeedbackType = 'sucesso' | 'erro';

export interface OperationFeedbackMessage {
  text: string;
  type: OperationFeedbackType;
}

@Injectable({
  providedIn: 'root',
})
export class OperationFeedbackService {
  private readonly messageSubject = new BehaviorSubject<OperationFeedbackMessage | null>(null);
  readonly message$ = this.messageSubject.asObservable();

  private hideTimeout?: ReturnType<typeof setTimeout>;

  show(text: string, type: OperationFeedbackType, durationMs: number = 1000): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    this.messageSubject.next({ text, type });

    this.hideTimeout = setTimeout(() => {
      this.messageSubject.next(null);
    }, durationMs);
  }
}
