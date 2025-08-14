import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AgentConfiguration } from '../../../../core/interfaces/agentic-core.interface';

@Component({
  selector: 'app-agent-card',
  templateUrl: './agent-card.component.html',
  styleUrls: ['./agent-card.component.scss']
})
export class AgentCardComponent {
  @Input() agent!: AgentConfiguration;
  @Input() showActions: boolean = true;
  @Input() compact: boolean = false;
  @Input() isPinned: boolean = false;

  @Output() agentSelect = new EventEmitter<AgentConfiguration>();
  @Output() agentPin = new EventEmitter<AgentConfiguration>();
  @Output() agentUnpin = new EventEmitter<AgentConfiguration>();
  @Output() agentExecute = new EventEmitter<AgentConfiguration>();
  @Output() agentConfigure = new EventEmitter<AgentConfiguration>();

  onCardClick(): void {
    this.agentSelect.emit(this.agent);
  }

  onPinClick(event: Event): void {
    event.stopPropagation();
    if (this.isPinned) {
      this.agentUnpin.emit(this.agent);
    } else {
      this.agentPin.emit(this.agent);
    }
  }

  onExecuteClick(event: Event): void {
    event.stopPropagation();
    this.agentExecute.emit(this.agent);
  }

  onConfigureClick(event: Event): void {
    event.stopPropagation();
    this.agentConfigure.emit(this.agent);
  }

  getRequiredParametersCount(): number {
    return this.agent.parameters.filter(p => p.required).length;
  }

  getDependenciesCount(): number {
    return this.agent.dependencies.length;
  }

  getOutputsCount(): number {
    return this.agent.outputs.length;
  }

  getLifecycleStagesCount(): number {
    return this.agent.lifecycle.stages.length;
  }
}
