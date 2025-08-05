import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AssessmentService } from '../../../../../core/services/assessment.service';
import { interval, Subscription } from 'rxjs';

interface CategoryProgress {
  id: string;
  title: string;
  icon: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  estimatedDuration: string;
  startTime?: Date;
  endTime?: Date;
  itemsProcessed: number;
  totalItems: number;
  currentTask?: string;
  resultSummary?: string;
}

interface StatusMessage {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  content: string;
}

@Component({
  selector: 'app-assessment-progress',
  templateUrl: './assessment-progress.component.html',
  styleUrls: ['./assessment-progress.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssessmentProgressComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer', { static: false }) messagesContainer!: ElementRef;

  assessmentProgress: CategoryProgress[] = [];
  statusMessages: StatusMessage[] = [];
  autoScroll = true;
  
  private progressSubscription?: Subscription;
  private messageSubscription?: Subscription;
  private shouldScrollToBottom = false;

  constructor(
    private router: Router,
    private message: NzMessageService,
    private assessmentService: AssessmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeAssessment();
    this.startProgressMonitoring();
  }

  ngOnDestroy(): void {
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom && this.autoScroll) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  private initializeAssessment(): void {
    // Load selected categories from localStorage
    const savedSelection = localStorage.getItem('assessment_selection');
    if (savedSelection) {
      try {
        const selectionData = JSON.parse(savedSelection);
        const selectedCategories = selectionData.categories.filter((cat: any) => cat.selected);
        
        this.assessmentProgress = selectedCategories.map((cat: any) => {
          const categoryData = this.getCategoryData(cat.id);
          return {
            id: cat.id,
            title: categoryData.title,
            icon: categoryData.icon,
            status: 'pending' as const,
            progress: 0,
            estimatedDuration: categoryData.estimatedDuration,
            itemsProcessed: 0,
            totalItems: categoryData.totalItems,
            resultSummary: ''
          };
        });

        this.addStatusMessage('info', 'Assessment initialized with ' + this.assessmentProgress.length + ' categories');
        this.cdr.markForCheck();
      } catch (error) {
        console.error('Error loading assessment selection:', error);
        this.addStatusMessage('error', 'Failed to load assessment configuration');
      }
    }
  }

  private getCategoryData(id: string): any {
    const categoryMap: { [key: string]: any } = {
      'landscape': {
        title: 'Landscape Assessment',
        icon: 'cluster',
        estimatedDuration: '2-3 hours',
        totalItems: 150
      },
      'business-transformation': {
        title: 'Business Transformation',
        icon: 'rocket',
        estimatedDuration: '4-6 hours',
        totalItems: 200
      },
      'process': {
        title: 'Process Assessment',
        icon: 'flow-chart',
        estimatedDuration: '3-4 hours',
        totalItems: 120
      },
      'custom-objects': {
        title: 'Custom Objects Assessment',
        icon: 'code',
        estimatedDuration: '2-4 hours',
        totalItems: 80
      },
      'timeline': {
        title: 'Timeline Assessment',
        icon: 'schedule',
        estimatedDuration: '1-2 hours',
        totalItems: 50
      }
    };
    return categoryMap[id] || { title: 'Unknown', icon: 'question', estimatedDuration: '1 hour', totalItems: 10 };
  }

  private startProgressMonitoring(): void {
    // Start the first category
    if (this.assessmentProgress.length > 0) {
      this.startNextCategory();
    }

    // Monitor progress every 2 seconds
    this.progressSubscription = interval(2000).subscribe(() => {
      this.updateProgress();
    });
  }

  private startNextCategory(): void {
    const nextCategory = this.assessmentProgress.find(cat => cat.status === 'pending');
    if (nextCategory) {
      nextCategory.status = 'running';
      nextCategory.startTime = new Date();
      nextCategory.progress = 0;
      nextCategory.currentTask = 'Initializing assessment...';
      
      this.addStatusMessage('info', `Started ${nextCategory.title} assessment`);
      this.cdr.markForCheck();
    }
  }

  private updateProgress(): void {
    const runningCategory = this.assessmentProgress.find(cat => cat.status === 'running');
    if (!runningCategory) return;

    // Simulate progress
    const progressIncrement = Math.random() * 15 + 5; // 5-20% increment
    runningCategory.progress = Math.min(100, runningCategory.progress + progressIncrement);
    
    // Update items processed
    const targetItems = Math.floor((runningCategory.progress / 100) * runningCategory.totalItems);
    runningCategory.itemsProcessed = Math.min(targetItems, runningCategory.totalItems);

    // Update current task
    runningCategory.currentTask = this.getCurrentTask(runningCategory.id, runningCategory.progress);

    // Add random status messages
    if (Math.random() < 0.3) { // 30% chance
      this.addStatusMessage('info', this.getRandomStatusMessage(runningCategory));
    }

    // Check if category is complete
    if (runningCategory.progress >= 100) {
      this.completeCategory(runningCategory);
    }

    this.cdr.markForCheck();
  }

  private getCurrentTask(categoryId: string, progress: number): string {
    const tasks: { [key: string]: string[] } = {
      'landscape': [
        'Analyzing system architecture...',
        'Mapping component dependencies...',
        'Evaluating infrastructure setup...',
        'Identifying integration points...',
        'Generating landscape report...'
      ],
      'business-transformation': [
        'Analyzing business processes...',
        'Evaluating digital readiness...',
        'Assessing change impact...',
        'Calculating ROI projections...',
        'Generating transformation roadmap...'
      ],
      'process': [
        'Mapping process flows...',
        'Identifying bottlenecks...',
        'Analyzing automation opportunities...',
        'Measuring performance metrics...',
        'Generating process report...'
      ],
      'custom-objects': [
        'Scanning custom code...',
        'Analyzing modifications...',
        'Checking upgrade compatibility...',
        'Generating simplification recommendations...',
        'Creating custom objects report...'
      ],
      'timeline': [
        'Estimating project timeline...',
        'Analyzing resource requirements...',
        'Assessing project risks...',
        'Planning milestones...',
        'Generating timeline report...'
      ]
    };

    const categoryTasks = tasks[categoryId] || ['Processing...'];
    const taskIndex = Math.floor((progress / 100) * categoryTasks.length);
    return categoryTasks[Math.min(taskIndex, categoryTasks.length - 1)];
  }

  private getRandomStatusMessage(category: CategoryProgress): string {
    const messages = [
      `Processing ${category.itemsProcessed} of ${category.totalItems} items in ${category.title}`,
      `${category.title}: Analyzing data patterns and trends`,
      `${category.title}: Generating insights and recommendations`,
      `${category.title}: Validating assessment results`,
      `${category.title}: Optimizing analysis algorithms`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private completeCategory(category: CategoryProgress): void {
    category.status = 'completed';
    category.endTime = new Date();
    category.progress = 100;
    category.itemsProcessed = category.totalItems;
    category.currentTask = 'Assessment completed';
    category.resultSummary = this.generateResultSummary(category.id);

    this.addStatusMessage('success', `${category.title} assessment completed successfully`);

    // Start next category
    setTimeout(() => {
      this.startNextCategory();
    }, 1000);
  }

  private generateResultSummary(categoryId: string): string {
    const summaries: { [key: string]: string } = {
      'landscape': 'System architecture analyzed with 15 components identified and 8 integration points mapped.',
      'business-transformation': 'Digital readiness score: 78%. Identified 12 optimization opportunities.',
      'process': 'Analyzed 25 business processes. Found 8 bottlenecks and 15 automation opportunities.',
      'custom-objects': 'Scanned 150 custom objects. 85% are upgrade-compatible with 12 requiring modifications.',
      'timeline': 'Estimated project duration: 18 months with 5 major milestones identified.'
    };
    return summaries[categoryId] || 'Assessment completed with detailed analysis.';
  }

  private addStatusMessage(type: 'info' | 'success' | 'warning' | 'error', content: string): void {
    const message: StatusMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type,
      content
    };

    this.statusMessages.unshift(message); // Add to beginning
    
    // Keep only last 50 messages
    if (this.statusMessages.length > 50) {
      this.statusMessages = this.statusMessages.slice(0, 50);
    }

    this.shouldScrollToBottom = true;
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  // Template methods
  getOverallProgressPercentage(): number {
    if (this.assessmentProgress.length === 0) return 0;
    
    const totalProgress = this.assessmentProgress.reduce((sum, cat) => sum + cat.progress, 0);
    return Math.round(totalProgress / this.assessmentProgress.length);
  }

  getProgressStatusMessage(): string {
    const runningCategory = this.assessmentProgress.find(cat => cat.status === 'running');
    if (runningCategory) {
      return `Currently processing: ${runningCategory.title}`;
    }
    
    const completedCount = this.assessmentProgress.filter(cat => cat.status === 'completed').length;
    if (completedCount === this.assessmentProgress.length) {
      return 'All assessments completed successfully';
    }
    
    return `${completedCount} of ${this.assessmentProgress.length} assessments completed`;
  }

  getProgressColor(): string {
    const percentage = this.getOverallProgressPercentage();
    if (percentage === 100) return '#52c41a';
    if (percentage >= 75) return '#1890ff';
    if (percentage >= 50) return '#faad14';
    return '#ff4d4f';
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'pending': return 'clock-circle';
      case 'running': return 'loading';
      case 'completed': return 'check-circle';
      case 'failed': return 'close-circle';
      default: return 'question-circle';
    }
  }

  getStatusIconClass(status: string): string {
    switch (status) {
      case 'pending': return 'pending-icon';
      case 'running': return 'running-icon';
      case 'completed': return 'completed-icon';
      case 'failed': return 'failed-icon';
      default: return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending': return 'Pending';
      case 'running': return 'In Progress';
      case 'completed': return 'Completed';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending': return 'gold';
      case 'running': return 'blue';
      case 'completed': return 'green';
      case 'failed': return 'red';
      default: return 'default';
    }
  }

  getProgressStatus(status: string): string {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'exception';
      default: return 'active';
    }
  }

  getProgressColorByStatus(status: string): string {
    switch (status) {
      case 'completed': return '#52c41a';
      case 'failed': return '#ff4d4f';
      case 'running': return '#1890ff';
      default: return '#d9d9d9';
    }
  }

  getMessageIcon(type: string): string {
    switch (type) {
      case 'info': return 'info-circle';
      case 'success': return 'check-circle';
      case 'warning': return 'warning';
      case 'error': return 'close-circle';
      default: return 'info-circle';
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString();
  }

  trackByMessageId(index: number, message: StatusMessage): string {
    return message.id;
  }

  isAssessmentComplete(): boolean {
    return this.assessmentProgress.length > 0 && 
           this.assessmentProgress.every(cat => cat.status === 'completed');
  }

  isAssessmentRunning(): boolean {
    return this.assessmentProgress.some(cat => cat.status === 'running');
  }

  getCompletedCategoriesCount(): number {
    return this.assessmentProgress.filter(cat => cat.status === 'completed').length;
  }

  getTotalProcessedItems(): number {
    return this.assessmentProgress.reduce((sum, cat) => sum + cat.itemsProcessed, 0);
  }

  getTotalDuration(): string {
    const completedCategories = this.assessmentProgress.filter(cat => cat.status === 'completed');
    if (completedCategories.length === 0) return '0 min';
    
    let totalMinutes = 0;
    completedCategories.forEach(cat => {
      if (cat.startTime && cat.endTime) {
        const duration = cat.endTime.getTime() - cat.startTime.getTime();
        totalMinutes += Math.round(duration / (1000 * 60));
      }
    });
    
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  }

  getCompletedCategories(): CategoryProgress[] {
    return this.assessmentProgress.filter(cat => cat.status === 'completed');
  }

  // Action methods
  retryCategory(categoryId: string): void {
    const category = this.assessmentProgress.find(cat => cat.id === categoryId);
    if (category) {
      category.status = 'pending';
      category.progress = 0;
      category.itemsProcessed = 0;
      category.currentTask = undefined;
      category.startTime = undefined;
      category.endTime = undefined;
      
      this.addStatusMessage('info', `Retrying ${category.title} assessment`);
      this.cdr.markForCheck();
    }
  }

  clearMessages(): void {
    this.statusMessages = [];
    this.cdr.markForCheck();
  }

  toggleAutoScroll(): void {
    this.autoScroll = !this.autoScroll;
    this.cdr.markForCheck();
  }

  cancelAssessment(): void {
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
    
    this.assessmentProgress.forEach(cat => {
      if (cat.status === 'running' || cat.status === 'pending') {
        cat.status = 'pending';
        cat.progress = 0;
        cat.itemsProcessed = 0;
        cat.currentTask = undefined;
      }
    });
    
    this.addStatusMessage('warning', 'Assessment cancelled by user');
    this.message.warning('Assessment has been cancelled. Redirecting to assessment selection...');
    
    // Navigate back to assessment selection
    setTimeout(() => {
      this.router.navigate(['/digital-maps/assessment/selection']);
    }, 1500);
    
    this.cdr.markForCheck();
  }

  viewResults(): void {
    if (this.isAssessmentComplete()) {
      this.message.success('Redirecting to detailed results...');
      // In a real application, this would navigate to a results page
      // For now, we'll just show a message
      setTimeout(() => {
        this.message.info('Results page would be displayed here in a complete implementation');
      }, 1000);
    }
  }
}
