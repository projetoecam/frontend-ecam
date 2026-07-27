import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationFeedbackService } from '../../services/operation-feedback.service';

@Component({
  selector: 'app-operation-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[2000] pointer-events-none flex items-center justify-center px-4">
      <div
        *ngIf="feedbackService.message$ | async as msg"
        class="min-w-[320px] max-w-[90vw] rounded-2xl border px-5 py-4 shadow-2xl backdrop-blur-md animate-toast"
        [ngClass]="
          msg.type === 'sucesso'
            ? 'bg-emerald-50/95 border-emerald-200 text-emerald-800 shadow-emerald-200/70'
            : 'bg-red-50/95 border-red-200 text-red-800 shadow-red-200/70'
        "
      >
        <div class="flex items-start gap-3">
          <div
            class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            [ngClass]="msg.type === 'sucesso' ? 'bg-emerald-200 text-emerald-800' : 'bg-red-200 text-red-800'"
          >
            {{ msg.type === 'sucesso' ? '\u2713' : '!' }}
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold leading-5">
              {{ msg.type === 'sucesso' ? 'Operação concluída' : 'Atenção' }}
            </p>
            <p class="text-sm leading-5 break-words">{{ msg.text }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes toast-in {
        from {
          opacity: 0;
          transform: translateY(-12px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .animate-toast {
        animation: toast-in 180ms ease-out;
      }
    `,
  ],
})
export class OperationToastComponent {
  constructor(public feedbackService: OperationFeedbackService) {}
}

