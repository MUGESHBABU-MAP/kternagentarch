import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SystemConnectionService, ConnectionType, SystemInfo, ConnectionRequest } from '../../../../core/services/system-connection.service';

@Component({
  selector: 'app-system-connection',
  template: `
    <div class="enterprise-card">
      <div class="enterprise-card-header">
        <div class="step-indicator">1</div>
        <h2>System Connection</h2>
      </div>

      <div class="connection-content">
        <p class="mb-3">
          Choose your preferred connection method to connect to the SAP system for assessment.
        </p>

        <form [formGroup]="connectionForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label>Connection Type</label>
            <nz-select 
              formControlName="connectionType"
              nzPlaceHolder="Select connection type"
              nzSize="large"
              (ngModelChange)="onConnectionTypeChange($event)">
              <nz-option 
                *ngFor="let type of connectionTypes" 
                [nzValue]="type.id" 
                [nzLabel]="type.name">
                <div>
                  <strong>{{ type.name }}</strong>
                  <div class="text-muted">{{ type.description }}</div>
                </div>
              </nz-option>
            </nz-select>
          </div>

          <div class="connection-form-container" *ngIf="connectionForm.get('connectionType')?.value">
            <app-vpn-form 
              *ngIf="connectionForm.get('connectionType')?.value === 'vpn'"
              [parentForm]="connectionForm"
              (formValid)="onFormValidChange($event)">
            </app-vpn-form>

            <app-ipsec-form 
              *ngIf="connectionForm.get('connectionType')?.value === 'ipsec'"
              [parentForm]="connectionForm"
              (formValid)="onFormValidChange($event)">
            </app-ipsec-form>

            <app-connector-instructions 
              *ngIf="connectionForm.get('connectionType')?.value === 'ktern-connector'"
              (connectionChecked)="onConnectionChecked($event)">
            </app-connector-instructions>
          </div>
        </form>

        <div class="connection-status" *ngIf="systemInfo">
          <div class="status-card">
            <h3>Connection Established</h3>
            <div class="system-details">
              <div class="detail-item">
                <strong>SAP Version:</strong> {{ systemInfo.version }}
              </div>
              <div class="detail-item">
                <strong>Destination:</strong> {{ systemInfo.destination }}
              </div>
              <div class="detail-item">
                <strong>Client:</strong> {{ systemInfo.client }}
              </div>
              <div class="detail-item">
                <app-status-indicator 
                  status="success" 
                  message="Connected successfully">
                </app-status-indicator>
              </div>
            </div>
          </div>
        </div>
      </div>

      <app-wizard-navigation
        [currentStep]="1"
        [totalSteps]="5"
        [canGoBack]="false"
        [canGoNext]="canProceed"
        [isLoading]="isConnecting"
        (next)="onNext()">
      </app-wizard-navigation>
    </div>
  `,
  styles: [`
    .connection-content {
      min-height: 400px;
    }

    .connection-form-container {
      margin-top: 24px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .connection-status {
      margin-top: 24px;
    }

    .status-card {
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 8px;
      padding: 20px;
    }

    .status-card h3 {
      color: #155724;
      margin: 0 0 16px 0;
      font-size: 18px;
    }

    .system-details {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 12px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .text-muted {
      color: #6c757d;
      font-size: 12px;
      margin-top: 2px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemConnectionComponent implements OnInit, OnDestroy {
  connectionForm: FormGroup;
  connectionTypes: ConnectionType[] = [];
  selectedConnectionType: ConnectionType | null = null;
  systemInfo: SystemInfo | null = null;
  isConnecting = false;
  isFormValid = false;
  canProceed = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private systemConnectionService: SystemConnectionService,
    private cdr: ChangeDetectorRef
  ) {
    this.connectionForm = this.fb.group({
      connectionType: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadConnectionTypes();
    this.subscribeToConnectionStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadConnectionTypes(): void {
    this.systemConnectionService.getConnectionTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((types: any) => {
        this.connectionTypes = types;
        this.cdr.markForCheck();
      });
  }

  private subscribeToConnectionStatus(): void {
    this.systemConnectionService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status: any) => {
        this.systemInfo = status;
        this.canProceed = status && status.status === 'connected';
        this.cdr.markForCheck();
      });
  }

  onConnectionTypeChange(selectedId: string): void {
    this.selectedConnectionType = this.connectionTypes.find(type => type.id === selectedId) || null;
    this.isFormValid = false;
    this.canProceed = false;
    this.systemInfo = null;
    this.cdr.markForCheck();
  }

  onFormValidChange(isValid: boolean): void {
    this.isFormValid = isValid;
    this.cdr.markForCheck();
  }

  onConnectionChecked(isConnected: boolean): void {
    this.canProceed = isConnected;
    this.cdr.markForCheck();
  }

  onSubmit(): void {
    if (this.connectionForm.valid && this.isFormValid) {
      this.connectToSystem();
    }
  }

  private connectToSystem(): void {
    const connectionTypeControl = this.connectionForm.get('connectionType');
    const connectionType = connectionTypeControl ? connectionTypeControl.value : null;
    if (!connectionType) return;

    this.isConnecting = true;
    this.cdr.markForCheck();

    const credentialsControl = this.connectionForm.get('credentials');
    const templateControl = this.connectionForm.get('template');

    const request: ConnectionRequest = {
      type: connectionType,
      credentials: credentialsControl ? credentialsControl.value : undefined,
      template: templateControl ? templateControl.value : undefined
    };

    this.systemConnectionService.connect(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (systemInfo: any) => {
          this.systemInfo = systemInfo;
          this.canProceed = true;
          this.isConnecting = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isConnecting = false;
          this.cdr.markForCheck();
        }
      });
  }

  onNext(): void {
    if (this.canProceed) {
      this.router.navigate(['/usage-logs']);
    }
  }
}
