import { Component, Input } from '@angular/core';
import { Agent } from '../../interfaces/agent.interface';

@Component({
  selector: 'app-agent-timeline',
  template: `<div>Agent Timeline Component</div>`,
  styles: []
})
export class AgentTimelineComponent {
  @Input() agents: Agent[] = [];
}
