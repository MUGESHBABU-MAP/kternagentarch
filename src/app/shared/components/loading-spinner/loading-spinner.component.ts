import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  template: `
    <div class="loading-container" [class.inline]="inline">
      <div class="loading-spinner"></div>
      <span *ngIf="message" class="loading-message">{{ message }}</span>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .loading-container.inline {
      flex-direction: row;
      padding: 0;
      gap: 8px;
    }

    .loading-message {
      margin-top: 12px;
      color: #6c757d;
      font-size: 14px;
    }

    .loading-container.inline .loading-message {
      margin-top: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {
  @Input() message: string = '';
  @Input() inline: boolean = false;
}
