import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentOrchestrationService } from '../../services/agent-orchestration.service';
import { Agent, AgentStatus, AgentMessage } from '../../interfaces/agent.interface';

@Component({
  selector: 'app-agent-dashboard',
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  agents: Agent[] = [];
  messages: AgentMessage[] = [];

  constructor(
    private orchestrationService: AgentOrchestrationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscribeToServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToServices(): void {
    this.orchestrationService.getAgents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(agents => {
        this.agents = agents;
        this.cdr.markForCheck();
      });

    this.orchestrationService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.cdr.markForCheck();
      });
  }

  getSystemOverview() {
    return {
      totalAgents: this.agents.length,
      activeAgents: this.agents.filter(a => a.status === AgentStatus.RUNNING || a.status === AgentStatus.PROCESSING).length,
      completedAgents: this.agents.filter(a => a.status === AgentStatus.COMPLETED).length,
      errorAgents: this.agents.filter(a => a.status === AgentStatus.ERROR).length,
      totalTasks: this.agents.reduce((sum, agent) => sum + agent.metrics.tasksCompleted, 0),
      averageSuccessRate: this.agents.length > 0 ? 
        Math.round(this.agents.reduce((sum, agent) => sum + agent.metrics.successRate, 0) / this.agents.length) : 0
    };
  }

  getRecentMessages() {
    return this.messages.slice(0, 10);
  }

  // Helper methods for template
  getAgentNameById(agentId: string): string {
    const agent = this.agents.find(a => a.id === agentId);
    return agent ? agent.name : 'System';
  }

  trackByAgentId(index: number, agent: Agent): string {
    return agent.id;
  }

  trackByMessageId(index: number, message: AgentMessage): string {
    return message.id;
  }
}
