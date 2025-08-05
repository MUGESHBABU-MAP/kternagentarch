import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-ipsec-form',
  template: `
    <div class="ipsec-form">
      <h3>IPSec Configuration</h3>
      <p class="mb-3">Upload your IPSec template or fill in the sample configuration.</p>

      <form [formGroup]="ipsecForm">
        <div class="config-options">
          <nz-radio-group formControlName="configMethod">
            <label nz-radio nzValue="upload">Upload Template File</label>
            <label nz-radio nzValue="manual">Fill Sample Configuration</label>
          </nz-radio-group>
        </div>

        <div class="config-content" [ngSwitch]="ipsecForm.get('configMethod')?.value">
          <!-- Upload Template -->
          <div *ngSwitchCase="'upload'" class="upload-section">
            <div class="form-group">
              <label>Template File</label>
              <nz-upload
                nzAccept=".conf,.txt,.ovpn"
                [nzBeforeUpload]="beforeUpload"
                [nzFileList]="fileList"
                (nzChange)="handleChange($event)">
                <button nz-button>
                  <i nz-icon nzType="upload"></i>
                  Choose Template
                </button>
              </nz-upload>
              <small class="text-muted">Supported formats: .conf, .txt, .ovpn (Max 1MB)</small>
            </div>

            <div class="template-preview" *ngIf="selectedFile">
              <h4>Selected File</h4>
              <div class="file-info">
                <i class="material-icons">description</i>
                <div>
                  <strong>{{ selectedFile.name }}</strong>
                  <div class="text-muted">{{ formatFileSize(selectedFile.size) }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Manual Configuration -->
          <div *ngSwitchCase="'manual'" class="manual-section">
            <div class="form-row">
              <div class="form-group">
                <label>Gateway Address</label>
                <input 
                  type="text" 
                  formControlName="gateway"
                  placeholder="192.168.1.1"
                  class="form-control">
              </div>
              <div class="form-group">
                <label>Subnet</label>
                <input 
                  type="text" 
                  formControlName="subnet"
                  placeholder="192.168.0.0/24"
                  class="form-control">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Pre-shared Key</label>
                <input 
                  type="password" 
                  formControlName="presharedKey"
                  placeholder="Enter pre-shared key"
                  class="form-control">
              </div>
              <div class="form-group">
                <label>Encryption</label>
                <nz-select 
                  formControlName="encryption"
                  nzPlaceHolder="Select encryption"
                  nzSize="large">
                  <nz-option 
                    *ngFor="let option of encryptionOptions" 
                    [nzValue]="option.value" 
                    [nzLabel]="option.label">
                  </nz-option>
                </nz-select>
              </div>
            </div>

            <div class="form-group">
              <label>Authentication</label>
              <nz-select 
                formControlName="authentication"
                nzPlaceHolder="Select authentication method"
                nzSize="large">
                <nz-option 
                  *ngFor="let option of authOptions" 
                  [nzValue]="option.value" 
                  [nzLabel]="option.label">
                </nz-option>
              </nz-select>
            </div>
          </div>
        </div>

        <div class="connection-test" *ngIf="isFormValid()">
          <button 
            type="button" 
            class="btn-primary"
            (click)="testConnection()"
            [disabled]="isTesting">
            <app-loading-spinner *ngIf="isTesting" [inline]="true"></app-loading-spinner>
            <span *ngIf="!isTesting">Test Configuration</span>
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
    .ipsec-form h3 {
      color: #495057;
      margin-bottom: 8px;
      font-size: 18px;
    }

    .config-options {
      display: flex;
      align-items: center;
      margin-bottom: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .config-content {
      margin-bottom: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    .upload-section {
      padding: 20px;
      border: 2px dashed #dee2e6;
      border-radius: 8px;
      text-align: center;
    }

    .template-preview {
      margin-top: 16px;
      padding: 16px;
      background: #e9ecef;
      border-radius: 8px;
    }

    .template-preview h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #495057;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-info i {
      color: #007bff;
      font-size: 24px;
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
      
      .config-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IpsecFormComponent implements OnInit, OnDestroy {
  @Input() parentForm!: FormGroup;
  @Output() formValid = new EventEmitter<boolean>();

  ipsecForm: FormGroup;
  selectedFile: File | null = null;
  isTesting = false;
  connectionStatus: { type: string; message: string } | null = null;
  fileList: any[] = [];

  encryptionOptions = [
    { label: 'AES-256', value: 'aes256' },
    { label: 'AES-128', value: 'aes128' },
    { label: '3DES', value: '3des' }
  ];

  authOptions = [
    { label: 'SHA-256', value: 'sha256' },
    { label: 'SHA-1', value: 'sha1' },
    { label: 'MD5', value: 'md5' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.ipsecForm = this.fb.group({
      configMethod: ['upload', [Validators.required]],
      // Manual config fields
      gateway: [''],
      subnet: [''],
      presharedKey: [''],
      encryption: ['aes256'],
      authentication: ['sha256']
    });
  }

  ngOnInit(): void {
    // Add template form group to parent form
    this.parentForm.addControl('template', this.ipsecForm);

    // Watch form validity and config method changes
    this.ipsecForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateValidators();
        this.formValid.emit(this.isFormValid());
        this.cdr.markForCheck();
      });

    // Initial setup
    this.updateValidators();
    this.formValid.emit(this.isFormValid());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateValidators(): void {
    const configMethodControl = this.ipsecForm.get('configMethod');
    const configMethod = configMethodControl ? configMethodControl.value : null;
    
    if (configMethod === 'upload') {
      // Clear manual config validators
      const gatewayControl = this.ipsecForm.get('gateway');
      const subnetControl = this.ipsecForm.get('subnet');
      const keyControl = this.ipsecForm.get('presharedKey');
      
      if (gatewayControl) gatewayControl.clearValidators();
      if (subnetControl) subnetControl.clearValidators();
      if (keyControl) keyControl.clearValidators();
    } else {
      // Add manual config validators
      const gatewayControl = this.ipsecForm.get('gateway');
      const subnetControl = this.ipsecForm.get('subnet');
      const keyControl = this.ipsecForm.get('presharedKey');
      
      if (gatewayControl) gatewayControl.setValidators([Validators.required]);
      if (subnetControl) subnetControl.setValidators([Validators.required]);
      if (keyControl) keyControl.setValidators([Validators.required]);
    }

    // Update validity
    const gatewayControl = this.ipsecForm.get('gateway');
    const subnetControl = this.ipsecForm.get('subnet');
    const keyControl = this.ipsecForm.get('presharedKey');
    
    if (gatewayControl) gatewayControl.updateValueAndValidity();
    if (subnetControl) subnetControl.updateValueAndValidity();
    if (keyControl) keyControl.updateValueAndValidity();
  }

  isFormValid(): boolean {
    const configMethodControl = this.ipsecForm.get('configMethod');
    const configMethod = configMethodControl ? configMethodControl.value : null;
    
    if (configMethod === 'upload') {
      return this.selectedFile !== null;
    } else {
      const gatewayControl = this.ipsecForm.get('gateway');
      const subnetControl = this.ipsecForm.get('subnet');
      const keyControl = this.ipsecForm.get('presharedKey');
      
      return !!(gatewayControl && gatewayControl.valid &&
                subnetControl && subnetControl.valid &&
                keyControl && keyControl.valid);
    }
  }

  onFileSelect(event: any): void {
    this.selectedFile = event.files[0];
    this.formValid.emit(this.isFormValid());
    this.cdr.markForCheck();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  beforeUpload = (file: File): boolean => {
    // Check file size (1MB limit)
    if (file.size > 1000000) {
      return false;
    }
    
    // Check file type
    const allowedTypes = ['.conf', '.txt', '.ovpn'];
    const fileExtension = '.' + file.name.split('.').pop();
    if (!allowedTypes.includes(fileExtension)) {
      return false;
    }
    
    this.selectedFile = file;
    this.formValid.emit(this.isFormValid());
    this.cdr.markForCheck();
    return false; // Prevent automatic upload
  };

  handleChange(info: any): void {
    if (info.file.status === 'removed') {
      this.selectedFile = null;
      this.formValid.emit(this.isFormValid());
      this.cdr.markForCheck();
    }
  }

  testConnection(): void {
    if (!this.isFormValid()) return;

    this.isTesting = true;
    this.connectionStatus = null;
    this.cdr.markForCheck();

    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      this.connectionStatus = {
        type: success ? 'success' : 'error',
        message: success ? 'IPSec configuration valid' : 'Configuration error - check settings'
      };
      this.isTesting = false;
      this.cdr.markForCheck();
    }, 2500);
  }
}
