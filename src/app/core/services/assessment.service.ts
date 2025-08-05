import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AssessmentType {
  id: string;
  name: string;
  description: string;
  estimatedTime: number; // in minutes
  modules: string[];
}

export interface AssessmentStatus {
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  currentModule: string;
  estimatedTimeRemaining: number;
  message: string;
}

export interface AssessmentResult {
  id: string;
  type: string;
  startTime: Date;
  endTime: Date;
  status: 'completed' | 'failed';
  summary: {
    totalModules: number;
    processedTransactions: number;
    identifiedIssues: number;
    recommendations: number;
  };
  downloadUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private assessmentStatusSubject = new BehaviorSubject<AssessmentStatus>({
    status: 'idle',
    progress: 0,
    currentModule: '',
    estimatedTimeRemaining: 0,
    message: ''
  });
  public assessmentStatus$ = this.assessmentStatusSubject.asObservable();

  private assessmentTypes: AssessmentType[] = [
    {
      id: 'business-landscape',
      name: 'Business Landscape',
      description: 'Comprehensive analysis of 5 core SAP modules',
      estimatedTime: 45,
      modules: ['FI', 'MM', 'SD', 'HR', 'PP']
    },
    {
      id: 'custom-code',
      name: 'Custom Code Impact',
      description: 'Analysis of custom code and modifications',
      estimatedTime: 60,
      modules: ['Custom Objects', 'Modifications', 'Enhancements']
    }
  ];

  getAssessmentTypes(): Observable<AssessmentType[]> {
    return of(this.assessmentTypes).pipe(delay(300));
  }

  startAssessment(typeId: string, allowKternAccess: boolean = false): Observable<AssessmentResult> {
    const assessmentType = this.assessmentTypes.find(t => t.id === typeId);
    if (!assessmentType) {
      throw new Error('Invalid assessment type');
    }

    this.simulateAssessmentProgress(assessmentType);

    return new Observable<AssessmentResult>((observer: any) => {
      const totalTime = assessmentType.estimatedTime * 1000; // Convert to milliseconds for simulation
      
      setTimeout(() => {
        const result: AssessmentResult = {
          id: `assessment_${Date.now()}`,
          type: assessmentType.name,
          startTime: new Date(Date.now() - totalTime),
          endTime: new Date(),
          status: 'completed',
          summary: {
            totalModules: assessmentType.modules.length,
            processedTransactions: Math.floor(Math.random() * 50000) + 10000,
            identifiedIssues: Math.floor(Math.random() * 25) + 5,
            recommendations: Math.floor(Math.random() * 15) + 3
          },
          downloadUrl: '/api/assessments/download/' + Date.now()
        };

        this.assessmentStatusSubject.next({
          status: 'completed',
          progress: 100,
          currentModule: '',
          estimatedTimeRemaining: 0,
          message: 'Assessment completed successfully'
        });

        observer.next(result);
        observer.complete();
      }, totalTime);
    });
  }

  private simulateAssessmentProgress(assessmentType: AssessmentType): void {
    const totalSteps = assessmentType.modules.length * 4; // 4 sub-steps per module
    const stepDuration = (assessmentType.estimatedTime * 60 * 1000) / totalSteps; // Convert to milliseconds
    let currentStep = 0;

    this.assessmentStatusSubject.next({
      status: 'running',
      progress: 0,
      currentModule: assessmentType.modules[0],
      estimatedTimeRemaining: assessmentType.estimatedTime,
      message: 'Starting assessment...'
    });

    const progressInterval = setInterval(() => {
      currentStep++;
      const progress = Math.round((currentStep / totalSteps) * 100);
      const moduleIndex = Math.floor((currentStep - 1) / 4);
      const currentModule = assessmentType.modules[moduleIndex] || '';
      const estimatedTimeRemaining = Math.round(assessmentType.estimatedTime * (1 - progress / 100));

      const subStepMessages = [
        'Analyzing structure...',
        'Processing transactions...',
        'Identifying issues...',
        'Generating recommendations...'
      ];
      const subStep = (currentStep - 1) % 4;
      const message = `${currentModule}: ${subStepMessages[subStep]}`;

      this.assessmentStatusSubject.next({
        status: 'running',
        progress,
        currentModule,
        estimatedTimeRemaining,
        message
      });

      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);
      }
    }, stepDuration);
  }

  downloadAssessmentReport(downloadUrl: string): Observable<Blob> {
    // Simulate file download
    const mockPdfContent = new Blob(['Mock PDF content for assessment report'], 
      { type: 'application/pdf' });
    return of(mockPdfContent).pipe(delay(1000));
  }

  resetAssessment(): void {
    this.assessmentStatusSubject.next({
      status: 'idle',
      progress: 0,
      currentModule: '',
      estimatedTimeRemaining: 0,
      message: ''
    });
  }

  getCurrentStatus(): AssessmentStatus {
    return this.assessmentStatusSubject.value;
  }
}
