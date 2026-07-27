import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OperationConfirmService } from '../../services/operation-confirm.service';

@Component({
  selector: 'app-operation-confirm',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="confirmService.state$ | async as state" class="fixed inset-0 z-[1900] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/55 backdrop-blur-sm" (click)="confirmService.close(false)"></div>

      <div class="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-confirm-in">
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86l-8.55 14.1A1 1 0 002.6 20h18.8a1 1 0 00.86-1.52l-8.55-14.1a1 1 0 00-1.72 0z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-slate-900">{{ state.title }}</h3>
        </div>

        <p class="text-sm leading-6 text-slate-600">{{ state.message }}</p>

        <div class="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            (click)="confirmService.close(false)"
            class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {{ state.cancelText }}
          </button>
          <button
            type="button"
            (click)="confirmService.close(true)"
            class="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
          >
            {{ state.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes confirm-in {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .animate-confirm-in {
        animation: confirm-in 160ms ease-out;
      }
    `,
  ],
})
export class OperationConfirmComponent {
  constructor(public confirmService: OperationConfirmService) {}
}
