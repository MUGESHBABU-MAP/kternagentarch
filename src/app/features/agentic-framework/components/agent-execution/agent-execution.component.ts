import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AgentExecutionContext } from '../../../../core/interfaces/agentic-core.interface';

@Component({
  selector: 'app-agent-execution',
  templateUrl: './agent-execution.component.html',
  styleUrls: ['./agent-execution.component.scss']
})
export class AgentExecutionComponent {
  @Input() execution: AgentExecutionContext | null = null;
  @Input() showLogs = true;
  @Input() showActions = true;

  @Output() executionClick = new EventEmitter<AgentExecutionContext>();
  @Output() executionAction = new EventEmitter<{ action: string; execution: AgentExecutionContext }>();
  @Output() executionRestart = new EventEmitter<AgentExecutionContext>();
  @Output() executionDelete = new EventEmitter<AgentExecutionContext>();

  onExecutionClick(): void {
    if (this.execution) {
      this.executionClick.emit(this.execution);
    }
  }

  onStopExecution(): void {
    if (this.execution) {
      if (this.execution) {
      this.executionAction.emit({ action: 'stop', execution: this.execution });
    }
    }
  }

  onRestartExecution(): void {
    if (this.execution) {
      this.executionRestart.emit(this.execution);
    }
  }

  onDeleteExecution(): void {
    if (this.execution) {
      this.executionDelete.emit(this.execution);
    }
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'running': '#1890ff',
      'completed': '#52c41a',
      'failed': '#ff4d4f',
      'pending': '#faad14',
      'cancelled': '#d9d9d9'
    };
    return statusColors[status] || '#d9d9d9';
  }

  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'running': 'loading',
      'completed': 'check-circle',
      'failed': 'close-circle',
      'pending': 'clock-circle',
      'cancelled': 'stop'
    };
    return statusIcons[status] || 'question-circle';
  }

  formatDuration(startTime: Date, endTime?: Date): string {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diff = end.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getProgressStatus(): 'success' | 'exception' | 'active' | 'normal' {
    if (!this.execution) return 'normal';
    
    if (this.execution.status && this.execution.status.toString() === 'failed') {
      return 'exception';
    }

    switch (this.execution.status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'active';
      default:
        return 'normal';
    }
  }
}
