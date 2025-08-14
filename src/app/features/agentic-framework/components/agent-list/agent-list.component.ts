import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AgentConfiguration } from '../../../../core/interfaces/agentic-core.interface';

@Component({
  selector: 'app-agent-list',
  templateUrl: './agent-list.component.html',
  styleUrls: ['./agent-list.component.scss']
})
export class AgentListComponent {
  @Input() agents: AgentConfiguration[] = [];
  @Input() showActions: boolean = true;
  @Input() loading: boolean = false;

  @Output() agentSelect = new EventEmitter<AgentConfiguration>();
  @Output() agentPin = new EventEmitter<AgentConfiguration>();
  @Output() agentUnpin = new EventEmitter<AgentConfiguration>();
  @Output() agentExecute = new EventEmitter<AgentConfiguration>();
  @Output() agentConfigure = new EventEmitter<AgentConfiguration>();

  onAgentSelect(agent: AgentConfiguration): void {
    this.agentSelect.emit(agent);
  }

  onAgentPin(agent: AgentConfiguration): void {
    this.agentPin.emit(agent);
  }

  onAgentUnpin(agent: AgentConfiguration): void {
    this.agentUnpin.emit(agent);
  }

  onAgentExecute(agent: AgentConfiguration): void {
    this.agentExecute.emit(agent);
  }

  onAgentConfigure(agent: AgentConfiguration): void {
    this.agentConfigure.emit(agent);
  }

  getRequiredParametersCount(agent: AgentConfiguration): number {
    return agent.parameters.filter(p => p.required).length;
  }

  getDependenciesCount(agent: AgentConfiguration): number {
    return agent.dependencies.length;
  }

  getOutputsCount(agent: AgentConfiguration): number {
    return agent.outputs.length;
  }

  trackByAgentId(index: number, agent: AgentConfiguration): string {
    return agent.id;
  }
}
