import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Agent } from '../../../agentic-assessment/interfaces/agent.interface';

@Component({
  selector: 'app-agent-grid',
  templateUrl: './agent-grid.component.html',
  styleUrls: ['./agent-grid.component.scss']
})
export class AgentGridComponent {
  @Input() agents: Agent[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No agents found';
  @Input() emptyDescription = 'Try adjusting your filters or search criteria.';

  @Output() agentClick = new EventEmitter<Agent>();
  @Output() agentAction = new EventEmitter<{ action: string; agent: Agent }>();
  @Output() agentRun = new EventEmitter<Agent>();
  @Output() agentConfigure = new EventEmitter<Agent>();

  onAgentClick(agent: Agent): void {
    this.agentClick.emit(agent);
  }

  onAgentPin(agent: Agent): void {
    this.agentAction.emit({ action: 'pin', agent });
  }

  onAgentRun(agent: Agent): void {
    this.agentRun.emit(agent);
  }

  onAgentConfigure(agent: Agent): void {
    this.agentConfigure.emit(agent);
  }

  trackByAgent(index: number, agent: Agent): string {
    return agent.id;
  }
}
