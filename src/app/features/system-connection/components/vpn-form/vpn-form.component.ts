import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-vpn-form',
  template: `
    <div class="vpn-form">
      <h3>OpenVPN Configuration</h3>
      <p class="mb-3">Enter your VPN credentials to establish connection.</p>

      <form [formGroup]="vpnForm">
        <div class="form-row">
          <div class="form-group">
            <label>VPN Server</label>
            <input 
              type="text" 
              formControlName="server"
              placeholder="vpn.company.com"
              class="form-control">
          </div>
          <div class="form-group">
            <label>Port</label>
            <input 
              type="number" 
              formControlName="port"
              placeholder="1194"
              class="form-control">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Username</label>
            <input 
              type="text" 
              formControlName="username"
              placeholder="Enter username"
              class="form-control">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input 
              type="password" 
              formControlName="password"
              placeholder="Enter password"
              class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label>Protocol</label>
          <nz-select 
            formControlName="protocol"
            nzPlaceHolder="Select protocol"
            nzSize="large">
            <nz-option 
              *ngFor="let option of protocolOptions" 
              [nzValue]="option.value" 
              [nzLabel]="option.label">
            </nz-option>
          </nz-select>
        </div>

        <div class="connection-test" *ngIf="vpnForm.valid">
          <button 
            type="button" 
            class="btn-primary"
            (click)="testConnection()"
            [disabled]="isTesting">
            <app-loading-spinner *ngIf="isTesting" [inline]="true"></app-loading-spinner>
            <span *ngIf="!isTesting">Test Connection</span>
          </button>
          
          <app-status-indicator 
            *ngIf="connectionStatus"
            [status]="connectionStatus.type"
            [message]="connectionStatus.message">
          </app-status-indicator>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .vpn-form h3 {
      color: #495057;
      margin-bottom: 8px;
      font-size: 18px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .connection-test {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VpnFormComponent implements OnInit, OnDestroy {
  @Input() parentForm!: FormGroup;
  @Output() formValid = new EventEmitter<boolean>();

  vpnForm: FormGroup;
  isTesting = false;
  connectionStatus: { type: string; message: string } | null = null;

  protocolOptions = [
    { label: 'UDP', value: 'udp' },
    { label: 'TCP', value: 'tcp' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.vpnForm = this.fb.group({
      server: ['', [Validators.required]],
      port: [1194, [Validators.required, Validators.min(1), Validators.max(65535)]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      protocol: ['udp', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Add credentials form group to parent form
    this.parentForm.addControl('credentials', this.vpnForm);

    // Watch form validity
    this.vpnForm.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.formValid.emit(this.vpnForm.valid);
        this.cdr.markForCheck();
      });

    // Initial validity check
    this.formValid.emit(this.vpnForm.valid);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  testConnection(): void {
    if (!this.vpnForm.valid) return;

    this.isTesting = true;
    this.connectionStatus = null;
    this.cdr.markForCheck();

    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate
      this.connectionStatus = {
        type: success ? 'success' : 'error',
        message: success ? 'VPN connection successful' : 'Connection failed - check credentials'
      };
      this.isTesting = false;
      this.cdr.markForCheck();
    }, 2000);
  }
}
