import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentManagerService } from '../../../../core/services/agent-manager.service';
import { AgentExecutionContext } from '../../../../core/interfaces/agentic-core.interface';
import { AgentStatus } from '../../../agentic-assessment/interfaces/agent.interface';

@Component({
  selector: 'app-agent-results',
  templateUrl: './agent-results.component.html',
  styleUrls: ['./agent-results.component.scss']
})
export class AgentResultsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  execution: AgentExecutionContext | null = null;
  loading = true;
  error: string | null = null;
  activeTab = 'output';
  
  // Status colors for the UI
  statusColors: Record<string, string> = {
    [AgentStatus.COMPLETED]: 'success',
    [AgentStatus.ERROR]: 'danger',
    [AgentStatus.FAILED]: 'danger',
    [AgentStatus.CANCELLED]: 'warning',
    [AgentStatus.RUNNING]: 'primary',
    [AgentStatus.PAUSED]: 'info',
    [AgentStatus.INITIALIZING]: 'info',
    [AgentStatus.PROCESSING]: 'info'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agentManager: AgentManagerService
  ) { }

  ngOnInit() {
    // First check query params for executionId
    this.route.queryParams.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const executionId = params['executionId'];
      if (executionId) {
        this.loadExecution(executionId);
      } else {
        // If no executionId in query params, check route params
        this.route.params.pipe(
          takeUntil(this.destroy$)
        ).subscribe(routeParams => {
          const routeExecutionId = routeParams['executionId'];
          if (routeExecutionId) {
            this.loadExecution(routeExecutionId);
          } else {
            this.error = 'No execution ID provided';
            this.loading = false;
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadExecution(executionId: string) {
    this.loading = true;
    this.error = null;
    
    // Get the execution from the agent manager
    const execution = this.agentManager.getExecutionById(executionId);
    
    if (execution) {
      this.execution = execution;
      this.loading = false;
    } else {
      this.error = 'Execution not found';
      this.loading = false;
    }
  }

  getStatusColor(status: AgentStatus): string {
    return this.statusColors[status] || 'secondary';
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  formatDuration(start: string | Date, end?: string | Date): string {
    if (!start) return 'N/A';
    
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const duration = endDate.getTime() - startDate.getTime();
    
    const seconds = Math.floor(duration / 1000);
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

  getOutputLogs(): string {
    if (!this.execution || !this.execution.logs || !this.execution.logs.length) return 'No output available';
    return this.execution.logs
      .map(log => `[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}`)
      .join('\n');
  }

  getErrorDetails(): string {
    if (!this.execution || !this.execution.logs || !this.execution.logs.length) return 'No error details available';
    const errorLogs = this.execution.logs.filter(log => log.level === 'error');
    if (!errorLogs.length) return 'No error details available';
    return errorLogs
      .map(log => `[${new Date(log.timestamp).toLocaleString()}] ${log.message}`)
      .join('\n\n');
  }

  getAgentName(agentId: string): string {
    const agent = this.agentManager.getAgent(agentId);
    return agent ? agent.name : `Agent ${agentId}`;
  }

  getProgressStatus(status: AgentStatus): 'success' | 'exception' | 'active' | 'normal' {
    switch (status) {
      case AgentStatus.COMPLETED:
        return 'success';
      case AgentStatus.ERROR:
      case AgentStatus.FAILED:
      case AgentStatus.CANCELLED:
        return 'exception';
      case AgentStatus.RUNNING:
      case AgentStatus.PROCESSING:
        return 'active';
      default:
        return 'normal';
    }
  }

  getExecutionParameters(): Array<{key: string, value: string}> {
    if (!this.execution || !this.execution.parameters) return [];
    return Object.entries(this.execution.parameters).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    }));
  }

  getExecutionMetrics(): Array<{key: string, value: string}> {
    if (!this.execution || !this.execution.metrics) return [];
    return Object.entries(this.execution.metrics).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    }));
  }

  hasErrors(): boolean {
    if (!this.execution) return false;
    
    const hasErrorStatus = this.execution.status === AgentStatus.ERROR || 
                         this.execution.status === AgentStatus.FAILED;
    
    const hasErrorLogs = this.execution.logs && 
                        Array.isArray(this.execution.logs) && 
                        this.execution.logs.some(log => log && log.level === 'error');
    
    return hasErrorStatus || hasErrorLogs;
  }

  canRetry(): boolean {
    if (!this.execution) return false;
    return [
      AgentStatus.ERROR, 
      AgentStatus.FAILED, 
      AgentStatus.CANCELLED,
      AgentStatus.COMPLETED
    ].includes(this.execution.status);
  }

  retryExecution(): void {
    if (!this.execution || !this.execution.id || !this.execution.agentId) {
      console.error('Cannot retry: Missing execution ID or agent ID');
      return;
    }
    
    const retryResult = this.agentManager.retryExecution(this.execution.id);
    
    if (retryResult) {
      retryResult.subscribe({
        next: () => {
          // Navigate to the progress page for the new execution
          this.router.navigate(['/agent', this.execution!.agentId, 'progress']);
        },
        error: (err) => {
          console.error('Failed to retry execution:', err);
        }
      });
    } else {
      console.error('Failed to retry execution: Invalid execution state');
    }
  }

  goBack(): void {
    if (this.execution && this.execution.agentId) {
      this.router.navigate(['/agent', this.execution.agentId, 'progress']);
    } else {
      this.router.navigate(['/agent/hub']);
    }
  }
}
