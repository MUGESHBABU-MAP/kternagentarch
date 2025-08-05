import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface PrerequisiteItem {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  message: string;
  required: boolean;
}

export interface PrerequisiteCheckResult {
  overallStatus: 'success' | 'warning' | 'error';
  items: PrerequisiteItem[];
  canProceed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PrerequisiteService {
  private checkStatusSubject = new BehaviorSubject<PrerequisiteCheckResult | null>(null);
  public checkStatus$ = this.checkStatusSubject.asObservable();

  private prerequisites: PrerequisiteItem[] = [
    {
      id: 'node',
      name: 'Node.js Installation',
      description: 'Node.js runtime environment is required',
      status: 'pending',
      message: '',
      required: true
    },
    {
      id: 'bapi',
      name: 'BAPI Availability',
      description: 'Required BAPIs must be available in the system',
      status: 'pending',
      message: '',
      required: true
    },
    {
      id: 'authorization',
      name: 'Authorization Checks',
      description: 'User must have required authorizations',
      status: 'pending',
      message: '',
      required: true
    },
    {
      id: 'network',
      name: 'Network Connectivity',
      description: 'Stable network connection to SAP system',
      status: 'pending',
      message: '',
      required: true
    },
    {
      id: 'memory',
      name: 'Memory Requirements',
      description: 'Sufficient memory for assessment processing',
      status: 'pending',
      message: '',
      required: false
    }
  ];

  runPrerequisiteChecks(): Observable<PrerequisiteCheckResult> {
    // Reset all items to pending
    this.prerequisites.forEach(item => {
      item.status = 'pending';
      item.message = '';
    });

    this.simulateChecks();

    // Return final result after all checks complete
    return new Observable<PrerequisiteCheckResult>(observer => {
      setTimeout(() => {
        const result = this.getFinalResult();
        this.checkStatusSubject.next(result);
        observer.next(result);
        observer.complete();
      }, 6000);
    });
  }

  getPrerequisites(): Observable<PrerequisiteItem[]> {
    return of([...this.prerequisites]).pipe(delay(300));
  }

  private simulateChecks(): void {
    const checkSequence = [
      { id: 'node', delay: 1000, success: true, message: 'Node.js v16.14.0 detected' },
      { id: 'network', delay: 2000, success: true, message: 'Connection established successfully' },
      { id: 'bapi', delay: 3500, success: true, message: 'All required BAPIs are available' },
      { id: 'authorization', delay: 4500, success: Math.random() > 0.3, message: '' },
      { id: 'memory', delay: 5500, success: true, message: '8GB available, 4GB required' }
    ];

    checkSequence.forEach(check => {
      setTimeout(() => {
        const item = this.prerequisites.find(p => p.id === check.id);
        if (item) {
          item.status = 'checking';
          this.notifyStatusChange();

          setTimeout(() => {
            if (item) {
              item.status = check.success ? 'success' : 'error';
              item.message = check.message || (check.success ? 
                'Check completed successfully' : 
                'Check failed - please contact administrator');
              this.notifyStatusChange();
            }
          }, 800);
        }
      }, check.delay);
    });
  }

  private getFinalResult(): PrerequisiteCheckResult {
    const requiredItems = this.prerequisites.filter(p => p.required);
    const failedRequired = requiredItems.filter(p => p.status === 'error');
    const failedOptional = this.prerequisites.filter(p => !p.required && p.status === 'error');

    let overallStatus: 'success' | 'warning' | 'error';
    let canProceed: boolean;

    if (failedRequired.length > 0) {
      overallStatus = 'error';
      canProceed = false;
    } else if (failedOptional.length > 0) {
      overallStatus = 'warning';
      canProceed = true;
    } else {
      overallStatus = 'success';
      canProceed = true;
    }

    return {
      overallStatus,
      items: [...this.prerequisites],
      canProceed
    };
  }

  private notifyStatusChange(): void {
    const result = this.getFinalResult();
    this.checkStatusSubject.next(result);
  }

  resetChecks(): void {
    this.prerequisites.forEach(item => {
      item.status = 'pending';
      item.message = '';
    });
    this.checkStatusSubject.next(null);
  }
}
