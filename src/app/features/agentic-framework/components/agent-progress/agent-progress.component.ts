import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentManagerService } from '../../../../core/services/agent-manager.service';
import { AgentExecutionContext } from '../../../../core/interfaces/agentic-core.interface';
import { AgentStatus } from '../../../agentic-assessment/interfaces/agent.interface';

// Helper function to format duration
const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

@Component({
  selector: 'app-agent-progress',
  templateUrl: './agent-progress.component.html',
  styleUrls: ['./agent-progress.component.scss']
})
export class AgentProgressComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeExecutions: AgentExecutionContext[] = [];
  completedExecutions: AgentExecutionContext[] = [];
  failedExecutions: AgentExecutionContext[] = [];
  loading = false;

  // Status filters
  statusFilters = {
    running: true,
    completed: true,
    failed: true,
    paused: true,
    cancelled: true
  };

  constructor(
    private agentManager: AgentManagerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Subscribe to active executions with real-time updates
    this.agentManager.activeExecutions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(executions => {
        this.updateExecutionLists(executions);
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateExecutionLists(executions: AgentExecutionContext[]): void {
    if (!executions) {
      this.activeExecutions = [];
      this.completedExecutions = [];
      this.failedExecutions = [];
      this.cdr.markForCheck();
      return;
    }

    // Filter executions by status
    this.activeExecutions = executions.filter(exec => {
      return exec.status === AgentStatus.RUNNING || 
             exec.status === AgentStatus.PROCESSING ||
             exec.status === AgentStatus.INITIALIZING ||
             exec.status === AgentStatus.PAUSED;
    });

    this.completedExecutions = executions.filter(exec => 
      exec.status === AgentStatus.COMPLETED
    );

    this.failedExecutions = executions.filter(exec => 
      exec.status === AgentStatus.ERROR || 
      exec.status === AgentStatus.FAILED ||
      exec.status === AgentStatus.CANCELLED
    );
    
    // Update change detection
    this.cdr.markForCheck();
  }

  onExecutionSelect(execution: AgentExecutionContext): void {
    this.agentManager.setSelectedAgent(execution.agentId);
    this.router.navigate(['/agents/agent', execution.agentId], {
      queryParams: { execution: execution.id }
    });
  }

  onAgentSelect(agentId: string): void {
    this.agentManager.setSelectedAgent(agentId);
    this.router.navigate(['/agents/agent', agentId]);
  }

  pauseExecution(execution: AgentExecutionContext, event: Event): void {
    event.stopPropagation();
    if (!execution || !execution.id) {
      console.error('Cannot pause execution: Invalid execution');
      return;
    }
    
    const result = this.agentManager.pauseExecution(execution.id);
    if (!result) {
      console.error('Failed to pause execution: Invalid state or execution not found');
    }
  }

  resumeExecution(execution: AgentExecutionContext, event: Event): void {
    event.stopPropagation();
    if (!execution || !execution.id) {
      console.error('Cannot resume execution: Invalid execution');
      return;
    }
    
    const result = this.agentManager.resumeExecution(execution.id);
    if (!result) {
      console.error('Failed to resume execution: Invalid state or execution not found');
    }
  }

  cancelExecution(execution: AgentExecutionContext, event: Event): void {
    event.stopPropagation();
    if (!execution || !execution.id) {
      console.error('Cannot cancel execution: Invalid execution');
      return;
    }
    
    const result = this.agentManager.cancelExecution(execution.id);
    if (!result) {
      console.error('Failed to cancel execution: Invalid state or execution not found');
    }
  }

  retryExecution(execution: AgentExecutionContext, event: Event): void {
    event.stopPropagation();
    if (!execution || !execution.id) {
      console.error('Cannot retry execution: Invalid execution');
      return;
    }
    
    const retryResult = this.agentManager.retryExecution(execution.id);
    if (retryResult) {
      retryResult.subscribe({
        next: (newExecution) => {
          console.log('Execution retried successfully with ID:', newExecution.id);
        },
        error: (error) => {
          console.error('Error retrying execution:', error);
        }
      });
    } else {
      console.error('Cannot retry execution: Invalid state or execution not found');
    }
  }

  getExecutionDuration(execution: AgentExecutionContext): string {
    if (!execution || !execution.startTime) {
      return 'N/A';
    }
    
    try {
      const now = new Date();
      const start = new Date(execution.startTime);
      const end = execution.endTime ? new Date(execution.endTime) : now;
      const duration = end.getTime() - start.getTime();
      return formatDuration(duration);
    } catch (e) {
      console.error('Error calculating execution duration:', e);
      return 'N/A';
    }
  }

  getStatusColor(status: AgentStatus): string {
    const colors: Record<AgentStatus, string> = {
      [AgentStatus.IDLE]: '#d9d9d9',
      [AgentStatus.INITIALIZING]: '#1890ff',
      [AgentStatus.RUNNING]: '#52c41a',
      [AgentStatus.PROCESSING]: '#faad14',
      [AgentStatus.COMPLETED]: '#52c41a',
      [AgentStatus.ERROR]: '#ff4d4f',
      [AgentStatus.FAILED]: '#ff4d4f',
      [AgentStatus.CANCELLED]: '#ffa940',
      [AgentStatus.PAUSED]: '#fa8c16'
    };
    return colors[status] || '#d9d9d9';
  }

  getStatusIcon(status: AgentStatus): string {
    const icons: Record<AgentStatus, string> = {
      [AgentStatus.IDLE]: 'pause-circle',
      [AgentStatus.INITIALIZING]: 'loading',
      [AgentStatus.RUNNING]: 'play-circle',
      [AgentStatus.PROCESSING]: 'sync',
      [AgentStatus.COMPLETED]: 'check-circle',
      [AgentStatus.ERROR]: 'close-circle',
      [AgentStatus.FAILED]: 'close-circle',
      [AgentStatus.CANCELLED]: 'stop',
      [AgentStatus.PAUSED]: 'pause-circle'
    };
    return icons[status] || 'question-circle';
  }

  getFilteredExecutions(): AgentExecutionContext[] {
    let filtered: AgentExecutionContext[] = [];

    if (this.statusFilters.running) {
      filtered = filtered.concat(this.activeExecutions);
    }
    if (this.statusFilters.completed) {
      filtered = filtered.concat(this.completedExecutions);
    }
    if (this.statusFilters.failed) {
      filtered = filtered.concat(this.failedExecutions);
    }

    return filtered.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  clearCompletedExecutions(): void {
    const executions = this.agentManager['activeExecutionsSubject'].value;
    const filtered = executions.filter(exec => exec.status !== AgentStatus.COMPLETED);
    this.agentManager['activeExecutionsSubject'].next(filtered);
  }

  clearFailedExecutions(): void {
    const executions = this.agentManager['activeExecutionsSubject'].value;
    const filtered = executions.filter(exec => 
      exec.status !== AgentStatus.ERROR && 
      exec.status !== AgentStatus.FAILED &&
      exec.status !== AgentStatus.CANCELLED
    );
    this.agentManager['activeExecutionsSubject'].next(filtered);
  }

  trackByExecutionId(_index: number, execution: AgentExecutionContext): string {
    return execution.id;
  }

  // Execution control methods with event handling
  // Implementations depend on AgentManagerService methods

  getAgentName(agentId: string): string {
    const agent = this.agentManager.getAgent(agentId);
    return agent ? agent.name : 'Unknown Agent';
  }

  getProgressStatus(status: AgentStatus): 'success' | 'exception' | 'active' | 'normal' {
    switch (status) {
      case AgentStatus.COMPLETED:
        return 'success';
      case AgentStatus.ERROR:
        return 'exception';
      case AgentStatus.RUNNING:
      case AgentStatus.PROCESSING:
        return 'active';
      default:
        return 'normal';
    }
  }

  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
}
