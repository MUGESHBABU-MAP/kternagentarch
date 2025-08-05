import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

interface ConnectionStatus {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  description: string;
}

@Component({
  selector: 'app-system-connection',
  templateUrl: './system-connection.component.html',
  styleUrls: ['./system-connection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SystemConnectionComponent implements OnInit {
  connectionForm: FormGroup;
  connectionType: string = '';
  connectionStatus: ConnectionStatus | null = null;
  isTestingConnection = false;
  isConnectionValid = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private message: NzMessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.connectionForm = this.fb.group({
      host: ['', [Validators.required]],
      port: [3300, [Validators.required, Validators.min(1), Validators.max(65535)]],
      client: ['', [Validators.required]],
      systemId: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Load saved connection data if available
    this.loadSavedConnection();
    
    // Watch form changes
    this.connectionForm.valueChanges.subscribe(() => {
      this.isConnectionValid = false;
      this.connectionStatus = null;
      this.cdr.markForCheck();
    });
  }

  onConnectionTypeChange(): void {
    this.connectionStatus = null;
    this.isConnectionValid = false;
    this.cdr.markForCheck();
  }

  testConnection(): void {
    if (!this.connectionForm.valid) {
      this.message.error('Please fill in all required fields');
      return;
    }

    this.isTestingConnection = true;
    this.connectionStatus = null;
    this.cdr.markForCheck();

    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        this.connectionStatus = {
          type: 'success',
          message: 'Connection Successful',
          description: 'Successfully connected to the SAP system. All services are accessible.'
        };
        this.isConnectionValid = true;
      } else {
        this.connectionStatus = {
          type: 'error',
          message: 'Connection Failed',
          description: 'Unable to connect to the SAP system. Please check your connection details and network settings.'
        };
        this.isConnectionValid = false;
      }
      
      this.isTestingConnection = false;
      this.cdr.markForCheck();
    }, 2000);
  }

  saveAndContinue(): void {
    if (!this.isConnectionValid) {
      this.message.warning('Please test the connection first');
      return;
    }

    // Save connection details
    const connectionData = {
      type: this.connectionType,
      ...this.connectionForm.value,
      password: '***' // Don't save actual password
    };

    localStorage.setItem('assessment_connection', JSON.stringify(connectionData));
    
    this.message.success('Connection settings saved successfully');
    
    // Navigate to next step
    this.router.navigate(['/digital-maps/assessment/usage-logs']);
  }

  private loadSavedConnection(): void {
    const saved = localStorage.getItem('assessment_connection');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.connectionType = data.type || '';
        
        // Don't load password for security
        const { password, ...formData } = data;
        this.connectionForm.patchValue(formData);
        
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading saved connection:', error);
      }
    }
  }
}
