import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'loading';

@Component({
  selector: 'app-status-indicator',
  template: `
    <div [class]="getStatusClass()">
      <i class="material-icons">{{ getIcon() }}</i>
      <span>{{ message }}</span>
    </div>
  `,
  styles: [`
    div {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
    }

    i {
      font-size: 18px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusIndicatorComponent {
  @Input() status: StatusType = 'info';
  @Input() message: string = '';

  getStatusClass(): string {
    return `status-${this.status}`;
  }

  getIcon(): string {
    switch (this.status) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'loading':
        return 'hourglass_empty';
      default:
        return 'info';
    }
  }
}
