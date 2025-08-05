import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface WizardStep {
  id: number;
  name: string;
  route: string;
  icon: string;
  description: string;
  completed: boolean;
}

@Component({
  selector: 'app-assessment-layout',
  templateUrl: './assessment-layout.component.html',
  styleUrls: ['./assessment-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    .h-full { height: 100%; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-1 { flex: 1 1 0%; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .space-x-4 > * + * { margin-left: 1rem; }
    .bg-background { background-color: #ffffff; }
    .bg-card { background-color: #ffffff; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
    .border-b { border-bottom: 1px solid #e5e7eb; }
    .border-border { border-color: #e5e7eb; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .text-xl { font-size: 1.25rem; }
    .text-sm { font-size: 0.875rem; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    .text-foreground { color: #262626; }
    .text-muted-foreground { color: #8c8c8c; }
    .w-32 { width: 8rem; }
    .w-8 { width: 2rem; }
    .h-8 { height: 2rem; }
    .h-2 { height: 0.5rem; }
    .bg-gray-200 { background-color: #e5e7eb; }
    .bg-primary { background-color: #1890ff; }
    .rounded-full { border-radius: 9999px; }
    .rounded { border-radius: 0.25rem; }
    .transition-all { transition-property: all; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .duration-300 { transition-duration: 300ms; }
    .duration-200 { transition-duration: 200ms; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .bg-red-50 { background-color: #fef2f2; }
    .text-red-600 { color: #dc2626; }
    .hover\\:bg-red-100:hover { background-color: #fee2e2; }
    .max-w-4xl { max-width: 56rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .ml-3 { margin-left: 0.75rem; }
    .mx-4 { margin-left: 1rem; margin-right: 1rem; }
    .h-0\\.5 { height: 0.125rem; }
    .overflow-hidden { overflow: hidden; }
    .text-white { color: white; }
    .hidden { display: none; }
    
    @media (min-width: 640px) {
      .sm\\:block { display: block; }
    }
    
    .step-circle-active {
      background-color: #1890ff;
      color: white;
    }
    .step-circle-completed {
      background-color: #52c41a;
      color: white;
    }
    .step-circle-inactive {
      background-color: #f5f5f5;
      color: #8c8c8c;
    }
    .step-text-active {
      color: #1890ff;
    }
    .step-text-completed {
      color: #52c41a;
    }
    .step-text-inactive {
      color: #8c8c8c;
    }
    .connector-completed {
      background-color: #52c41a;
    }
    .connector-inactive {
      background-color: #e5e7eb;
    }
  `]
})
export class AssessmentLayoutComponent implements OnInit {
  currentStepIndex = 0;
  isCollapsed = false;

  wizardSteps: WizardStep[] = [
    {
      id: 1,
      name: 'System Connection',
      route: '/digital-maps/assessment/system-connection',
      icon: 'link',
      description: 'Configure your SAP system connection settings',
      completed: false
    },
    {
      id: 2,
      name: 'Usage Logs',
      route: '/digital-maps/assessment/usage-logs',
      icon: 'file-text',
      description: 'Upload and analyze system usage logs',
      completed: false
    },
    {
      id: 3,
      name: 'Prerequisites',
      route: '/digital-maps/assessment/prerequisites',
      icon: 'check-square',
      description: 'Verify system prerequisites and requirements',
      completed: false
    },
    {
      id: 4,
      name: 'Assessment Selection',
      route: '/digital-maps/assessment/selection',
      icon: 'audit',
      description: 'Select assessment criteria and parameters',
      completed: false
    },
    {
      id: 5,
      name: 'Summary',
      route: '/digital-maps/assessment/summary',
      icon: 'file-done',
      description: 'Review assessment results and generate report',
      completed: false
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEvent = event as NavigationEnd;
        this.updateCurrentStep(navEvent.url);
      });
    
    this.updateCurrentStep(this.router.url);
  }

  private updateCurrentStep(url: string) {
    if (url.includes('system-connection')) {
      this.currentStepIndex = 0;
    } else if (url.includes('usage-logs')) {
      this.currentStepIndex = 1;
    } else if (url.includes('prerequisites')) {
      this.currentStepIndex = 2;
    } else if (url.includes('selection')) {
      this.currentStepIndex = 3;
    } else if (url.includes('summary')) {
      this.currentStepIndex = 4;
    }
  }

  getCurrentStepTitle(): string {
    const step = this.wizardSteps[this.currentStepIndex];
    return step ? step.name : 'Assessment';
  }

  getCurrentStepDescription(): string {
    const step = this.wizardSteps[this.currentStepIndex];
    return step ? step.description : 'Digital Maps Assessment Process';
  }

  getOverallProgress(): number {
    const completedSteps = this.wizardSteps.filter(step => step.completed).length;
    const currentProgress = (this.currentStepIndex + 1) / this.wizardSteps.length;
    const completedProgress = completedSteps / this.wizardSteps.length;
    return Math.max(currentProgress, completedProgress) * 100;
  }

  getStepCircleClass(index: number): string {
    if (this.wizardSteps[index].completed) {
      return 'step-circle-completed';
    } else if (index === this.currentStepIndex) {
      return 'step-circle-active';
    } else {
      return 'step-circle-inactive';
    }
  }

  getStepTextClass(index: number): string {
    if (this.wizardSteps[index].completed) {
      return 'step-text-completed';
    } else if (index === this.currentStepIndex) {
      return 'step-text-active';
    } else {
      return 'step-text-inactive';
    }
  }

  getConnectorClass(index: number): string {
    if (this.wizardSteps[index].completed) {
      return 'connector-completed';
    } else {
      return 'connector-inactive';
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  navigateToStep(route: string): void {
    this.router.navigate([route]);
  }

  backToDigitalMaps(): void {
    this.router.navigate(['/digital-maps']);
  }

  resetAssessment(): void {
    this.wizardSteps.forEach(step => step.completed = false);
    this.currentStepIndex = 0;
    this.router.navigate(['/digital-maps/assessment/system-connection']);
  }
}
