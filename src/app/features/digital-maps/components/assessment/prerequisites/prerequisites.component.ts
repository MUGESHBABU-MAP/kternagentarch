import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { PrerequisiteService, PrerequisiteCheckResult } from '../../../../../core/services/prerequisite.service';

interface PrerequisiteItem {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  autoCheckable: boolean;
}

interface AutoCheckResult {
  success: boolean;
  message: string;
  description: string;
}

@Component({
  selector: 'app-prerequisites',
  templateUrl: './prerequisites.component.html',
  styleUrls: ['./prerequisites.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrerequisitesComponent implements OnInit {
  isChecking = false;
  autoCheckResults: AutoCheckResult | null = null;

  systemRequirements: PrerequisiteItem[] = [
    {
      id: 'sap_version',
      title: 'SAP System Version',
      description: 'SAP ECC 6.0 or higher, or SAP S/4HANA system',
      checked: false,
      autoCheckable: true
    },
    {
      id: 'database_access',
      title: 'Database Access',
      description: 'Read access to SAP database tables and transaction logs',
      checked: false,
      autoCheckable: true
    },
    {
      id: 'system_resources',
      title: 'System Resources',
      description: 'Minimum 4GB RAM and 10GB free disk space for analysis',
      checked: false,
      autoCheckable: true
    },
    {
      id: 'backup_verification',
      title: 'System Backup',
      description: 'Recent system backup available (recommended before assessment)',
      checked: false,
      autoCheckable: false
    }
  ];

  accessPermissions: PrerequisiteItem[] = [
    {
      id: 'admin_access',
      title: 'Administrator Access',
      description: 'SAP system administrator or equivalent privileges',
      checked: false,
      autoCheckable: false
    },
    {
      id: 'table_access',
      title: 'Table Access Rights',
      description: 'Read access to system tables (TADIR, TDEVC, TFDIR, etc.)',
      checked: false,
      autoCheckable: true
    },
    {
      id: 'transaction_access',
      title: 'Transaction Access',
      description: 'Access to key transactions (SE80, SM30, SPRO, etc.)',
      checked: false,
      autoCheckable: true
    },
    {
      id: 'rfc_access',
      title: 'RFC Connection',
      description: 'RFC user with appropriate authorizations for data extraction',
      checked: false,
      autoCheckable: true
    }
  ];

  networkRequirements: PrerequisiteItem[] = [
    {
      id: 'network_connectivity',
      title: 'Network Connectivity',
      description: 'Stable network connection to SAP system',
      checked: false,
      autoCheckable: true
    },
    {
      id: 'firewall_config',
      title: 'Firewall Configuration',
      description: 'Required ports open for SAP communication (3300, 3600, etc.)',
      checked: false,
      autoCheckable: true
    },
    {
      id: 'ssl_certificates',
      title: 'SSL Certificates',
      description: 'Valid SSL certificates for secure communication',
      checked: false,
      autoCheckable: true
    },
    {
      id: 'bandwidth',
      title: 'Network Bandwidth',
      description: 'Minimum 10 Mbps bandwidth for data transfer',
      checked: false,
      autoCheckable: true
    }
  ];

  constructor(
    private router: Router,
    private message: NzMessageService,
    private prerequisiteService: PrerequisiteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSavedPrerequisites();
  }

  onPrerequisiteChange(): void {
    this.savePrerequisites();
    this.cdr.markForCheck();
  }

  runAutomaticCheck(): void {
    this.isChecking = true;
    this.autoCheckResults = null;
    this.cdr.markForCheck();

    // Mock API call to check prerequisites
    this.prerequisiteService.runPrerequisiteChecks().subscribe({
      next: (results: PrerequisiteCheckResult) => {
        this.processAutoCheckResults(results);
        this.isChecking = false;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        this.autoCheckResults = {
          success: false,
          message: 'Automatic Check Failed',
          description: 'Unable to verify prerequisites automatically. Please check manually.'
        };
        this.isChecking = false;
        this.message.error('Failed to run automatic prerequisite check');
        this.cdr.markForCheck();
      }
    });
  }

  private processAutoCheckResults(results: PrerequisiteCheckResult): void {
    let checkedCount = 0;
    let totalAutoCheckable = 0;

    // Map service results to our component structure
    const allItems = [...this.systemRequirements, ...this.accessPermissions, ...this.networkRequirements];
    
    allItems.forEach(item => {
      if (item.autoCheckable) {
        totalAutoCheckable++;
        // Find matching item from service results
        const serviceItem = results.items.find(si => si.id === item.id);
        if (serviceItem && serviceItem.status === 'success') {
          item.checked = true;
          checkedCount++;
        }
      }
    });

    // Set results message
    const successRate = totalAutoCheckable > 0 ? (checkedCount / totalAutoCheckable) * 100 : 0;
    this.autoCheckResults = {
      success: results.overallStatus === 'success',
      message: `Automatic Check ${results.overallStatus === 'success' ? 'Completed' : 'Completed with Issues'}`,
      description: `${checkedCount} of ${totalAutoCheckable} automatically verifiable prerequisites passed. ${results.canProceed ? 'You can proceed to the next step.' : 'Please review and manually verify remaining items.'}`
    };

    this.savePrerequisites();
    this.message.success(`Automatic check completed: ${checkedCount}/${totalAutoCheckable} items verified`);
  }

  getCompletedCount(): number {
    return [...this.systemRequirements, ...this.accessPermissions, ...this.networkRequirements]
      .filter(item => item.checked).length;
  }

  getTotalCount(): number {
    return this.systemRequirements.length + this.accessPermissions.length + this.networkRequirements.length;
  }

  getProgressPercentage(): number {
    const completed = this.getCompletedCount();
    const total = this.getTotalCount();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  allPrerequisitesMet(): boolean {
    return this.getCompletedCount() === this.getTotalCount();
  }

  resetPrerequisites(): void {
    [...this.systemRequirements, ...this.accessPermissions, ...this.networkRequirements]
      .forEach(item => item.checked = false);
    
    this.autoCheckResults = null;
    this.savePrerequisites();
    this.message.info('All prerequisites have been reset');
    this.cdr.markForCheck();
  }

  proceedToNext(): void {
    if (this.allPrerequisitesMet()) {
      this.message.success('All prerequisites verified! Proceeding to system connection...');
      this.router.navigate(['/digital-maps/assessment/system-connection']);
    } else {
      this.message.warning('Please complete all prerequisites before proceeding');
    }
  }

  private savePrerequisites(): void {
    const data = {
      systemRequirements: this.systemRequirements,
      accessPermissions: this.accessPermissions,
      networkRequirements: this.networkRequirements,
      autoCheckResults: this.autoCheckResults,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('assessment_prerequisites', JSON.stringify(data));
  }

  private loadSavedPrerequisites(): void {
    const saved = localStorage.getItem('assessment_prerequisites');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.systemRequirements) this.systemRequirements = data.systemRequirements;
        if (data.accessPermissions) this.accessPermissions = data.accessPermissions;
        if (data.networkRequirements) this.networkRequirements = data.networkRequirements;
        if (data.autoCheckResults) this.autoCheckResults = data.autoCheckResults;
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading saved prerequisites:', error);
      }
    }
  }
}
