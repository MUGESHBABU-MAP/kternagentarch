import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Agent } from '../../../agentic-assessment/interfaces/agent.interface';

@Component({
  selector: 'app-agent-timeline',
  templateUrl: './agent-timeline.component.html',
  styleUrls: ['./agent-timeline.component.scss']
})
export class AgentTimelineComponent {
  @Input() agents: Agent[] = [];
  @Input() loading = false;
  @Input() showActions = true;
  @Input() emptyMessage = 'No agents found';
  @Input() emptyDescription = 'Try adjusting your filters or search criteria.';

  @Output() timelineItemClick = new EventEmitter<{ agent: Agent; timestamp: Date }>();
  @Output() agentClick = new EventEmitter<Agent>();
  @Output() agentPin = new EventEmitter<Agent>();
  @Output() agentRun = new EventEmitter<Agent>();
  @Output() agentConfigure = new EventEmitter<Agent>();

  onAgentClick(agent: Agent): void {
    this.agentClick.emit(agent);
  }

  onAgentPin(agent: Agent): void {
    this.agentPin.emit(agent);
  }

  onAgentRun(agent: Agent): void {
    this.agentRun.emit(agent);
  }

  onAgentConfigure(agent: Agent): void {
    this.agentConfigure.emit(agent);
  }

  getTimelineIcon(agent: Agent): string {
    return (agent && agent.avatar) ? agent.avatar : 'anticon-robot';
  }

  getTimelineColor(agent: Agent): string {
    return (agent && agent.color) ? agent.color : '#1890ff';
  }

  getTimelineDate(agent: Agent): string {
    if (!agent || !agent.lastHeartbeat) return '';
    try {
      const date = new Date(agent.lastHeartbeat);
      return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
    } catch (e) {
      console.error('Error parsing date:', e);
      return '';
    }
  }

  getTimelineTime(agent: Agent): string {
    if (!agent || !agent.lastHeartbeat) return '';
    try {
      const date = new Date(agent.lastHeartbeat);
      return isNaN(date.getTime()) ? '' : date.toLocaleTimeString();
    } catch (e) {
      console.error('Error parsing time:', e);
      return '';
    }
    return new Date(agent.lastHeartbeat).toLocaleTimeString();
  }

  getStatusColor(status: string): string {
    const statusColors: { [key: string]: string } = {
      'active': '#52c41a',
      'idle': '#faad14',
      'error': '#ff4d4f',
      'disabled': '#d9d9d9',
      'configuring': '#1890ff'
    };
    return statusColors[status] || '#d9d9d9';
  }

  trackByAgent(index: number, agent: Agent): string {
    return agent.id;
  }
}
