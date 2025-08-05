import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-wizard-navigation',
  template: `
    <div class="wizard-navigation">
      <button 
        type="button" 
        class="btn-secondary" 
        [disabled]="!canGoBack"
        (click)="onBack()">
        <i class="material-icons">arrow_back</i>
        Back
      </button>
      
      <div class="step-info">
        Step {{ currentStep }} of {{ totalSteps }}
      </div>
      
      <button 
        type="button" 
        [class]="isLastStep ? 'btn-primary' : 'btn-primary'" 
        [disabled]="!canGoNext || isLoading"
        (click)="onNext()">
        <app-loading-spinner 
          *ngIf="isLoading" 
          [inline]="true">
        </app-loading-spinner>
        <span *ngIf="!isLoading">
          {{ isLastStep ? 'Complete' : 'Next' }}
          <i class="material-icons" *ngIf="!isLastStep">arrow_forward</i>
        </span>
      </button>
    </div>
  `,
  styles: [`
    .wizard-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 0;
      border-top: 1px solid #f0f0f0;
      margin-top: 32px;
    }

    .step-info {
      color: #6c757d;
      font-size: 14px;
      font-weight: 500;
    }

    button {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    i {
      font-size: 18px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WizardNavigationComponent {
  @Input() currentStep: number = 1;
  @Input() totalSteps: number = 5;
  @Input() canGoBack: boolean = true;
  @Input() canGoNext: boolean = true;
  @Input() isLoading: boolean = false;

  @Output() back = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  get isLastStep(): boolean {
    return this.currentStep === this.totalSteps;
  }

  onBack(): void {
    if (this.canGoBack) {
      this.back.emit();
    }
  }

  onNext(): void {
    if (this.canGoNext && !this.isLoading) {
      this.next.emit();
    }
  }
}
