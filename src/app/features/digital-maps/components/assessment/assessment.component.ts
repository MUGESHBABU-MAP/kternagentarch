import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NzModalService } from 'ng-zorro-antd/modal';

interface WizardStep {
  id: number;
  name: string;
  route: string;
  icon: string;
  description: string;
  completed: boolean;
}

interface SystemConnectionDetails {
  systemId: string;
  connectionType: string;
  version: string;
  client: string;
  database?: string;
  landscapeType?: string;
}

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessmentComponent implements OnInit {
  currentStepIndex = 0;
  systemConnectionDetails: SystemConnectionDetails | null = null;

  wizardSteps: WizardStep[] = [
    {
      id: 1,
      name: 'Prerequisites & System Connection',
      route: '/digital-maps/assessment/system-setup',
      icon: 'setting',
      description: 'Verify prerequisites and establish SAP system connection',
      completed: false
    },
    {
      id: 2,
      name: 'Usage Logs Collection',
      route: '/digital-maps/assessment/usage-logs',
      icon: 'file-text',
      description: 'Upload and analyze system usage logs',
      completed: false
    },
    {
      id: 3,
      name: 'Assessment Selection',
      route: '/digital-maps/assessment/selection',
      icon: 'audit',
      description: 'Select assessment scope and criteria',
      completed: false
    },
    {
      id: 4,
      name: 'Assessment Progress',
      route: '/digital-maps/assessment/progress',
      icon: 'loading',
      description: 'Monitor live assessment progress and completion',
      completed: false
    }
  ];

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEvent = event as NavigationEnd;
        this.updateCurrentStep(navEvent.url);
        this.cdr.markForCheck();
      });
    
    this.updateCurrentStep(this.router.url);
    this.loadSystemConnectionDetails();
    
    // For demo purposes, set mock system connection details if not present
    if (!this.systemConnectionDetails && this.currentStepIndex > 0) {
      this.setMockSystemConnectionDetails();
    }
  }

  private updateCurrentStep(url: string): void {
    if (url.includes('system-setup')) {
      this.currentStepIndex = 0;
    } else if (url.includes('usage-logs')) {
      this.currentStepIndex = 1;
    } else if (url.includes('selection')) {
      this.currentStepIndex = 2;
    } else if (url.includes('progress')) {
      this.currentStepIndex = 3;
    }
  }

  getCurrentStepTitle(): string {
    const step = this.wizardSteps[this.currentStepIndex];
    return step ? step.name : 'Assessment';
  }

  getCurrentStepIcon(): string {
    const step = this.wizardSteps[this.currentStepIndex];
    return step ? step.icon : 'audit';
  }

  getOverallProgress(): number {
    const completedSteps = this.wizardSteps.filter(step => step.completed).length;
    const currentProgress = (this.currentStepIndex + 1) / this.wizardSteps.length;
    const completedProgress = completedSteps / this.wizardSteps.length;
    return Math.max(currentProgress, completedProgress) * 100;
  }

  getStepClass(index: number): string {
    const baseClass = 'step-item';
    if (this.wizardSteps[index].completed) {
      return `${baseClass} step-completed`;
    } else if (index === this.currentStepIndex) {
      return `${baseClass} step-active`;
    } else if (index < this.currentStepIndex) {
      return `${baseClass} step-accessible`;
    } else {
      return `${baseClass} step-inactive`;
    }
  }

  navigateToStep(route: string): void {
    this.router.navigate([route]);
  }

  previousStep(): void {
    if (this.currentStepIndex > 0) {
      const previousStep = this.wizardSteps[this.currentStepIndex - 1];
      this.router.navigate([previousStep.route]);
    }
  }

  nextStep(): void {
    if (this.currentStepIndex < this.wizardSteps.length - 1) {
      const nextStep = this.wizardSteps[this.currentStepIndex + 1];
      this.router.navigate([nextStep.route]);
    }
  }

  resetAssessment(): void {
    this.wizardSteps.forEach(step => step.completed = false);
    this.currentStepIndex = 0;
    this.router.navigate(['/digital-maps/assessment/system-setup']);
    this.cdr.markForCheck();
  }

  // Method to mark a step as completed (can be called from child components)
  markStepCompleted(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.wizardSteps.length) {
      this.wizardSteps[stepIndex].completed = true;
      this.cdr.markForCheck();
    }
  }

  // Method to check if a step is accessible
  isStepAccessible(stepIndex: number): boolean {
    // First step is always accessible
    if (stepIndex === 0) return true;
    
    // Other steps are accessible if previous step is completed or current step
    return this.wizardSteps[stepIndex - 1].completed || stepIndex <= this.currentStepIndex;
  }

  // System connection methods
  private loadSystemConnectionDetails(): void {
    const saved = localStorage.getItem('system_connection_details');
    if (saved) {
      try {
        this.systemConnectionDetails = JSON.parse(saved);
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading system connection details:', error);
      }
    }
  }

  setSystemConnectionDetails(details: SystemConnectionDetails): void {
    this.systemConnectionDetails = details;
    localStorage.setItem('system_connection_details', JSON.stringify(details));
    this.cdr.markForCheck();
  }

  private setMockSystemConnectionDetails(): void {
    const mockDetails: SystemConnectionDetails = {
      systemId: 'PRD-001',
      connectionType: 'VPN',
      version: 'SAP ECC 6.0 EHP8',
      client: '100',
      database: 'Oracle 19c',
      landscapeType: 'Production'
    };
    this.setSystemConnectionDetails(mockDetails);
  }

  editSystemConnection(): void {
    this.modal.confirm({
      nzTitle: 'Edit System Connection',
      nzContent: 'Editing system connection details will reset the current assessment progress. All steps will need to be completed again. Do you want to continue?',
      nzOkText: 'Yes, Edit Connection',
      nzOkType: 'danger',
      nzCancelText: 'Cancel',
      nzOnOk: () => {
        // Reset assessment progress
        this.resetAssessment();
        // Clear system connection details
        this.systemConnectionDetails = null;
        localStorage.removeItem('system_connection_details');
        // Navigate to system setup
        this.router.navigate(['/digital-maps/assessment/system-setup']);
        this.cdr.markForCheck();
      }
    });
  }
}
