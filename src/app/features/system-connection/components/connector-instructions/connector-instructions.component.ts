import { Component, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-connector-instructions',
  template: `
    <div class="connector-instructions">
      <h3>KTern Connector Setup</h3>
      <p class="mb-3">Follow these steps to install and configure the KTern Connector.</p>

      <div class="installation-steps">
        <div class="step-card">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>Download Connector</h4>
            <p>Download the KTern Connector package for your operating system.</p>
            <button type="button" class="btn-secondary">
              <i class="material-icons">download</i>
              Download for Windows
            </button>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>Install Connector</h4>
            <p>Run the installer and follow the setup wizard.</p>
            <div class="code-block">
              <code>ktern-connector-setup.exe</code>
            </div>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>Configure Connection</h4>
            <p>Enter your SAP system details in the connector configuration.</p>
            <div class="config-example">
              <strong>Example Configuration:</strong>
              <ul>
                <li>Host: sap-server.company.com</li>
                <li>System Number: 00</li>
                <li>Client: 100</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="step-card">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>Test Connection</h4>
            <p>Verify that the connector can communicate with your SAP system.</p>
            <button 
              type="button" 
              class="btn-primary"
              (click)="checkConnection()"
              [disabled]="isChecking">
              <app-loading-spinner *ngIf="isChecking" [inline]="true"></app-loading-spinner>
              <span *ngIf="!isChecking">
                <i class="material-icons">wifi_find</i>
                Check Connection
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="connection-status" *ngIf="connectionResult">
        <app-status-indicator 
          [status]="connectionResult.type"
          [message]="connectionResult.message">
        </app-status-indicator>
        
        <div class="system-info" *ngIf="connectionResult.type === 'success'">
          <h4>Connected System Information</h4>
          <div class="info-grid">
            <div class="info-item">
              <strong>System ID:</strong> PRD
            </div>
            <div class="info-item">
              <strong>Version:</strong> SAP ECC 6.0 EHP8
            </div>
            <div class="info-item">
              <strong>Client:</strong> 100
            </div>
            <div class="info-item">
              <strong>Connector Version:</strong> 2.1.4
            </div>
          </div>
        </div>
      </div>

      <div class="help-section">
        <h4>Need Help?</h4>
        <div class="help-links">
          <a href="#" class="help-link">
            <i class="material-icons">description</i>
            Installation Guide
          </a>
          <a href="#" class="help-link">
            <i class="material-icons">help</i>
            Troubleshooting
          </a>
          <a href="#" class="help-link">
            <i class="material-icons">support</i>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .connector-instructions h3 {
      color: #495057;
      margin-bottom: 8px;
      font-size: 18px;
    }

    .installation-steps {
      margin: 24px 0;
    }

    .step-card {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      padding: 20px;
      background: #ffffff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .step-number {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      background: #007bff;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .step-content {
      flex: 1;
    }

    .step-content h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #495057;
    }

    .step-content p {
      margin: 0 0 12px 0;
      color: #6c757d;
    }

    .code-block {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 8px 12px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      margin: 8px 0;
    }

    .config-example {
      background: #f8f9fa;
      border-left: 4px solid #007bff;
      padding: 12px 16px;
      margin: 8px 0;
    }

    .config-example ul {
      margin: 8px 0 0 0;
      padding-left: 20px;
    }

    .config-example li {
      margin-bottom: 4px;
      font-family: 'Courier New', monospace;
      font-size: 13px;
    }

    .connection-status {
      margin: 24px 0;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .system-info {
      margin-top: 16px;
    }

    .system-info h4 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #495057;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .info-item {
      font-size: 14px;
    }

    .help-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e9ecef;
    }

    .help-section h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #495057;
    }

    .help-links {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .help-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #ffffff;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      text-decoration: none;
      color: #495057;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .help-link:hover {
      background: #f8f9fa;
      border-color: #007bff;
      color: #007bff;
    }

    .help-link i {
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .step-card {
        flex-direction: column;
        text-align: center;
      }
      
      .help-links {
        flex-direction: column;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConnectorInstructionsComponent {
  @Output() connectionChecked = new EventEmitter<boolean>();

  isChecking = false;
  connectionResult: { type: string; message: string } | null = null;

  constructor(private cdr: ChangeDetectorRef) {}

  checkConnection(): void {
    this.isChecking = true;
    this.connectionResult = null;
    this.cdr.markForCheck();

    // Simulate connection check
    setTimeout(() => {
      const success = Math.random() > 0.25; // 75% success rate
      
      this.connectionResult = {
        type: success ? 'success' : 'error',
        message: success 
          ? 'KTern Connector connected successfully'
          : 'Connection failed - check connector installation and configuration'
      };
      
      this.isChecking = false;
      this.connectionChecked.emit(success);
      this.cdr.markForCheck();
    }, 3000);
  }
}
