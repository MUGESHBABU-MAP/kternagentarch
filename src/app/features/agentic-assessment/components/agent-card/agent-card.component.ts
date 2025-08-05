import { Component, Input } from '@angular/core';
import { Agent } from '../../interfaces/agent.interface';

@Component({
  selector: 'app-agent-card',
  template: `<div>Agent Card Component</div>`,
  styles: []
})
export class AgentCardComponent {
  @Input() agent!: Agent;
}
