import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Agent } from '../../../agentic-assessment/interfaces/agent.interface';

interface GraphNode {
  id: string;
  name: string;
  type: string;
  status: string;
  icon: string;
  color: string;
  x: number;
  y: number;
  dependencies: string[];
}

interface GraphEdge {
  source: string;
  target: string;
  type: 'dependency' | 'output';
}

@Component({
  selector: 'app-agent-dependency-graph',
  templateUrl: './agent-dependency-graph.component.html',
  styleUrls: ['./agent-dependency-graph.component.scss']
})
export class AgentDependencyGraphComponent {
  @Input() agents: Agent[] = [];
  @Input() centerAgentId: string | null = null;
  @Input() showLabels = true;
  @Input() interactive = true;

  @Output() agentClick = new EventEmitter<Agent>();
  @Output() nodeHover = new EventEmitter<Agent | null>();

  nodes: GraphNode[] = [];
  edges: GraphEdge[] = [];
  selectedNodeId: string | null = null;
  hoveredNodeId: string | null = null;

  ngOnInit(): void {
    this.buildGraph();
  }

  ngOnChanges(): void {
    this.buildGraph();
  }

  private buildGraph(): void {
    this.nodes = this.agents.map((agent, index) => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      icon: agent.avatar,
      color: agent.color,
      x: Math.random() * 400,
      y: Math.random() * 300,
      dependencies: agent.dependencies
    }));

    this.edges = [];
    this.agents.forEach(agent => {
      agent.dependencies.forEach((depId: string) => {
        if (this.agents.find(a => a.id === depId)) {
          this.edges.push({
            source: depId,
            target: agent.id,
            type: 'dependency'
          });
        }
      });
    });

    if (this.centerAgentId) {
      this.centerGraph();
    }
  }

  private calculateNodeX(index: number): number {
    const radius = 200;
    const angle = (index * 2 * Math.PI) / this.agents.length;
    return 300 + radius * Math.cos(angle);
  }

  private calculateNodeY(index: number): number {
    const radius = 200;
    const angle = (index * 2 * Math.PI) / this.agents.length;
    return 300 + radius * Math.sin(angle);
  }

  public centerGraph(): void {
    if (!this.centerAgentId) return;

    const centerNode = this.nodes.find(n => n.id === this.centerAgentId);
    if (!centerNode) return;

    // Move center node to center
    centerNode.x = 300;
    centerNode.y = 300;

    // Arrange dependencies in a circle around center
    const dependencies = this.nodes.filter(n => 
      centerNode.dependencies.includes(n.id)
    );

    dependencies.forEach((dep, index) => {
      const angle = (index * 2 * Math.PI) / dependencies.length;
      dep.x = 300 + 150 * Math.cos(angle);
      dep.y = 300 + 150 * Math.sin(angle);
    });

    // Arrange dependents in outer circle
    const dependents = this.nodes.filter(n => 
      n.dependencies.includes(this.centerAgentId!)
    );

    dependents.forEach((dep, index) => {
      const angle = (index * 2 * Math.PI) / dependents.length;
      dep.x = 300 + 250 * Math.cos(angle);
      dep.y = 300 + 250 * Math.sin(angle);
    });
  }

  onNodeClick(node: GraphNode): void {
    if (!this.interactive) return;

    this.selectedNodeId = node.id;
    const agent = this.agents.find(a => a.id === node.id);
    if (agent) {
      this.agentClick.emit(agent);
    }
  }

  onNodeMouseEnter(node: GraphNode): void {
    if (!this.interactive) return;

    this.hoveredNodeId = node.id;
    const agent = this.agents.find(a => a.id === node.id);
    this.nodeHover.emit(agent || null);
  }

  onNodeMouseLeave(): void {
    if (!this.interactive) return;

    this.hoveredNodeId = null;
    this.nodeHover.emit(null);
  }

  getNodeClass(node: GraphNode): string {
    const classes = ['graph-node', `status-${node.status}`];
    
    if (node.id === this.selectedNodeId) {
      classes.push('selected');
    }
    
    if (node.id === this.hoveredNodeId) {
      classes.push('hovered');
    }
    
    if (node.id === this.centerAgentId) {
      classes.push('center');
    }

    return classes.join(' ');
  }

  getEdgePath(edge: GraphEdge): string {
    const sourceNode = this.nodes.find(n => n.id === edge.source);
    const targetNode = this.nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return '';

    return `M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`;
  }

  getEdgeClass(edge: GraphEdge): string {
    const classes = ['graph-edge', `edge-${edge.type}`];
    
    if (this.hoveredNodeId === edge.source || this.hoveredNodeId === edge.target) {
      classes.push('highlighted');
    }

    return classes.join(' ');
  }

  trackByNodeId(index: number, node: GraphNode): string {
    return node.id;
  }

  trackByEdge(index: number, edge: GraphEdge): string {
    return `${edge.source}-${edge.target}`;
  }

  getNodeIconText(iconClass: string): string {
    // Extract icon text from class name for SVG display
    const iconMap: { [key: string]: string } = {
      'anticon-robot': '🤖',
      'anticon-tool': '🔧',
      'anticon-database': '💾',
      'anticon-api': '🔌',
      'anticon-setting': '⚙️',
      'anticon-cloud': '☁️',
      'anticon-security-scan': '🔒',
      'anticon-monitor': '📊'
    };
    return iconMap[iconClass] || '⚡';
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
}
