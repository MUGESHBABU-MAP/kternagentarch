import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Agent } from '../../../agentic-assessment/interfaces/agent.interface';
import { AgentExecutionContext } from '../../../../core/interfaces/agentic-core.interface';

interface WorkflowStep {
  id: string;
  name: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  dependencies: string[];
  outputs: string[];
}

@Component({
  selector: 'app-agent-workflow',
  templateUrl: './agent-workflow.component.html',
  styleUrls: ['./agent-workflow.component.scss']
})
export class AgentWorkflowComponent {
  @Input() agents: Agent[] = [];
  @Input() executions: AgentExecutionContext[] = [];
  @Input() workflowId: string | null = null;
  @Input() showTimeline = true;
  @Input() interactive = true;

  @Output() stepClick = new EventEmitter<WorkflowStep>();
  @Output() agentClick = new EventEmitter<Agent>();

  // Map status to CSS classes
  getStepClass(status: WorkflowStep['status']): string {
    const statusMap = {
      'pending': 'status-pending',
      'running': 'status-running',
      'completed': 'status-completed',
      'failed': 'status-failed',
      'skipped': 'status-skipped',
      'idle': 'status-pending' // Map 'idle' to 'pending' for backward compatibility
    };
    return statusMap[status as keyof typeof statusMap] || '';
  }

  @Output() workflowStart = new EventEmitter<void>();
  @Output() workflowStop = new EventEmitter<void>();
  @Output() workflowReset = new EventEmitter<void>();

  workflowSteps: WorkflowStep[] = [
    { id: '1', name: 'Step 1', agentId: 'agent1', status: 'pending', dependencies: [], outputs: [] },
    { id: '2', name: 'Step 2', agentId: 'agent2', status: 'pending', dependencies: ['1'], outputs: [] },
    { id: '3', name: 'Step 3', agentId: 'agent3', status: 'pending', dependencies: ['2'], outputs: [] },
  ];

  get workflowStatus(): 'pending' | 'running' | 'completed' | 'failed' | 'skipped' {
    const runningSteps = this.workflowSteps.filter(s => s.status === 'running');
    const completedSteps = this.workflowSteps.filter(s => s.status === 'completed');
    const failedSteps = this.workflowSteps.filter(s => s.status === 'failed');

    if (failedSteps.length > 0) {
      return 'failed';
    } else if (runningSteps.length > 0) {
      return 'running';
    } else if (completedSteps.length === this.workflowSteps.length) {
      return 'completed';
    } else {
      return 'pending';
    }
  }

  currentStepIndex = 0;

  ngOnChanges(): void {
    this.buildWorkflow();
  }

  private buildWorkflow(): void {
    this.workflowSteps = this.agents.map((agent, index) => ({
      id: `step-${index + 1}`,
      name: agent.name,
      agentId: agent.id,
      status: this.getStepStatus(agent),
      startTime: this.getStepStartTime(agent),
      endTime: this.getStepEndTime(agent),
      duration: this.getStepDuration(agent),
      dependencies: agent.dependencies,
      outputs: []
    }));

    this.updateWorkflowSteps();
  }

  private getStepStatus(agent: Agent): WorkflowStep['status'] {
    const execution = this.executions.find(e => e.agentId === agent.id);
    if (!execution) return 'pending';

    if (!execution.status) return 'pending';
    
    const status = execution.status.toString();
    switch (status) {
      case 'completed':
        return 'completed';
      case 'running':
        return 'running';
      case 'failed':
      case 'error':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private getStepStartTime(agent: Agent): Date | undefined {
    const execution = this.executions.find(e => e.agentId === agent.id);
    return execution ? execution.startTime : undefined;
  }

  private getStepEndTime(agent: Agent): Date | undefined {
    const execution = this.executions.find(e => e.agentId === agent.id);
    return execution ? execution.endTime : undefined;
  }

  private getStepDuration(agent: Agent): number | undefined {
    const execution = this.executions.find(e => e.agentId === agent.id);
    if (!execution || !execution.startTime) return undefined;

    const endTime = execution.endTime || new Date();
    return endTime.getTime() - execution.startTime.getTime();
  }

  private updateWorkflowSteps(): void {
    // Update current step index
    const currentStep = this.workflowSteps.find(step => step.status === 'running');
    if (currentStep) {
      this.currentStepIndex = this.workflowSteps.indexOf(currentStep);
    } else {
      this.currentStepIndex = this.workflowSteps.findIndex(step => step.status === 'pending');
      if (this.currentStepIndex === -1) {
        this.currentStepIndex = this.workflowSteps.length;
      }
    }
  }

  onStepClick(step: WorkflowStep): void {
    if (!this.interactive) return;
    this.stepClick.emit(step);
  }

  onAgentClick(step: WorkflowStep): void {
    if (!this.interactive) return;
    const agent = this.agents.find(a => a.id === step.agentId);
    if (agent) {
      this.agentClick.emit(agent);
    }
  }

  onStartWorkflow(): void {
    if (this.workflowStatus === 'pending' || this.workflowStatus === 'completed' || this.workflowStatus === 'failed') {
      this.workflowStart.emit();
      this.currentStepIndex = 0;
      this.executeNextStep();
    }
  }

  onStopWorkflow(): void {
    this.workflowStop.emit();
  }

  resetWorkflow(): void {
    this.workflowReset.emit();
    this.currentStepIndex = 0;
    this.workflowSteps.forEach(step => {
      step.status = 'pending';
      step.startTime = undefined;
      step.endTime = undefined;
      step.duration = undefined;
    });
  }

  private executeNextStep(): void {
    if (this.currentStepIndex >= this.workflowSteps.length) {
      return;
    }

    const currentStep = this.workflowSteps[this.currentStepIndex];
    currentStep.status = 'running';
    currentStep.startTime = new Date();

    // Simulate step execution
    setTimeout(() => {
      currentStep.endTime = new Date();
      currentStep.duration = currentStep.endTime.getTime() - currentStep.startTime!.getTime();
      currentStep.status = 'completed';
      this.currentStepIndex++;
      this.executeNextStep();
    }, 2000);
  }

  getStepStatusColor(status: WorkflowStep['status']): string {
    const colors = {
      'pending': '#d9d9d9',
      'running': '#1890ff',
      'completed': '#52c41a',
      'failed': '#ff4d4f',
      'skipped': '#faad14'
    };
    return colors[status];
  }

  getStepStatusIcon(status: WorkflowStep['status']): string {
    const icons = {
      'pending': 'clock-circle',
      'running': 'loading',
      'completed': 'check-circle',
      'failed': 'close-circle',
      'skipped': 'minus-circle'
    };
    return icons[status];
  }

  getWorkflowProgress(): number {
    const completedSteps = this.workflowSteps.filter(s => s.status === 'completed').length;
    return Math.round((completedSteps / this.workflowSteps.length) * 100);
  }

  formatDuration(duration: number): string {
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

  canStartWorkflow(): boolean {
    return this.workflowStatus === 'pending' || this.workflowStatus === 'failed';
  }

  canStopWorkflow(): boolean {
    return this.workflowStatus === 'running';
  }

  canResetWorkflow(): boolean {
    return this.workflowStatus !== 'pending';
  }

  trackByStepId(index: number, step: WorkflowStep): string {
    return step.id;
  }
}
