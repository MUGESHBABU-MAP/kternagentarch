import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subject } from 'rxjs';
import { Agent, AgentStatus, AgentPriority, AgentTask, AgentMessage, AgentWorkflow } from '../interfaces/agent.interface';

@Injectable({
  providedIn: 'root'
})
export class AgentOrchestrationService {
  private agents$ = new BehaviorSubject<Agent[]>([]);
  private messages$ = new BehaviorSubject<AgentMessage[]>([]);
  private workflow$ = new BehaviorSubject<AgentWorkflow | null>(null);
  private isRunning$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeAgents();
    this.startHeartbeat();
  }

  // Public observables
  getAgents(): Observable<Agent[]> {
    return this.agents$.asObservable();
  }

  getMessages(): Observable<AgentMessage[]> {
    return this.messages$.asObservable();
  }

  getWorkflow(): Observable<AgentWorkflow | null> {
    return this.workflow$.asObservable();
  }

  getIsRunning(): Observable<boolean> {
    return this.isRunning$.asObservable();
  }

  // Agent management
  private initializeAgents(): void {
    const agents: Agent[] = [
      {
        id: 'system-analysis-agent',
        name: 'System Analysis Agent',
        type: 'analysis',
        description: 'Analyzes SAP system architecture, configurations, and performance metrics',
        status: AgentStatus.IDLE,
        priority: AgentPriority.HIGH,
        avatar: 'robot',
        color: '#1890ff',
        capabilities: [
          { id: 'system-scan', name: 'System Scanning', description: 'Deep system architecture analysis', enabled: true },
          { id: 'performance-analysis', name: 'Performance Analysis', description: 'System performance evaluation', enabled: true },
          { id: 'config-review', name: 'Configuration Review', description: 'System configuration assessment', enabled: true }
        ],
        taskHistory: [],
        metrics: {
          tasksCompleted: 0,
          tasksInProgress: 0,
          tasksFailed: 0,
          averageExecutionTime: 0,
          successRate: 100,
          lastActivity: new Date()
        },
        dependencies: [],
        outputs: ['system-data', 'performance-metrics'],
        isActive: true,
        lastHeartbeat: new Date()
      },
      {
        id: 'data-processing-agent',
        name: 'Data Processing Agent',
        type: 'processing',
        description: 'Processes and transforms raw system data into actionable insights',
        status: AgentStatus.IDLE,
        priority: AgentPriority.HIGH,
        avatar: 'database',
        color: '#52c41a',
        capabilities: [
          { id: 'data-extraction', name: 'Data Extraction', description: 'Extract data from various sources', enabled: true },
          { id: 'data-transformation', name: 'Data Transformation', description: 'Transform and normalize data', enabled: true },
          { id: 'pattern-recognition', name: 'Pattern Recognition', description: 'Identify patterns and anomalies', enabled: true }
        ],
        taskHistory: [],
        metrics: {
          tasksCompleted: 0,
          tasksInProgress: 0,
          tasksFailed: 0,
          averageExecutionTime: 0,
          successRate: 100,
          lastActivity: new Date()
        },
        dependencies: ['system-analysis-agent'],
        outputs: ['processed-data', 'insights'],
        isActive: true,
        lastHeartbeat: new Date()
      },
      {
        id: 'security-assessment-agent',
        name: 'Security Assessment Agent',
        type: 'security',
        description: 'Evaluates system security posture and identifies vulnerabilities',
        status: AgentStatus.IDLE,
        priority: AgentPriority.CRITICAL,
        avatar: 'safety-certificate',
        color: '#fa8c16',
        capabilities: [
          { id: 'vulnerability-scan', name: 'Vulnerability Scanning', description: 'Scan for security vulnerabilities', enabled: true },
          { id: 'compliance-check', name: 'Compliance Check', description: 'Verify regulatory compliance', enabled: true },
          { id: 'risk-assessment', name: 'Risk Assessment', description: 'Assess security risks', enabled: true }
        ],
        taskHistory: [],
        metrics: {
          tasksCompleted: 0,
          tasksInProgress: 0,
          tasksFailed: 0,
          averageExecutionTime: 0,
          successRate: 100,
          lastActivity: new Date()
        },
        dependencies: ['system-analysis-agent'],
        outputs: ['security-report', 'risk-matrix'],
        isActive: true,
        lastHeartbeat: new Date()
      },
      {
        id: 'report-generation-agent',
        name: 'Report Generation Agent',
        type: 'reporting',
        description: 'Generates comprehensive assessment reports and visualizations',
        status: AgentStatus.IDLE,
        priority: AgentPriority.MEDIUM,
        avatar: 'file-text',
        color: '#722ed1',
        capabilities: [
          { id: 'report-creation', name: 'Report Creation', description: 'Generate detailed reports', enabled: true },
          { id: 'visualization', name: 'Data Visualization', description: 'Create charts and graphs', enabled: true },
          { id: 'export', name: 'Export Functionality', description: 'Export reports in various formats', enabled: true }
        ],
        taskHistory: [],
        metrics: {
          tasksCompleted: 0,
          tasksInProgress: 0,
          tasksFailed: 0,
          averageExecutionTime: 0,
          successRate: 100,
          lastActivity: new Date()
        },
        dependencies: ['data-processing-agent', 'security-assessment-agent'],
        outputs: ['final-report', 'visualizations'],
        isActive: true,
        lastHeartbeat: new Date()
      }
    ];

    this.agents$.next(agents);
  }

  // Workflow management
  startAssessmentWorkflow(): void {
    const workflow: AgentWorkflow = {
      id: 'sap-assessment-workflow',
      name: 'SAP System Assessment',
      description: 'Comprehensive SAP system analysis and assessment workflow',
      agents: this.agents$.value,
      currentStep: 0,
      totalSteps: 4,
      status: AgentStatus.RUNNING,
      startTime: new Date(),
      progress: 0
    };

    this.workflow$.next(workflow);
    this.isRunning$.next(true);
    this.executeWorkflow();
  }

  private async executeWorkflow(): Promise<void> {
    const agents = this.agents$.value;
    
    // Step 1: System Analysis
    await this.executeAgent('system-analysis-agent');
    
    // Step 2: Data Processing (parallel with Security Assessment)
    await Promise.all([
      this.executeAgent('data-processing-agent'),
      this.executeAgent('security-assessment-agent')
    ]);
    
    // Step 3: Report Generation
    await this.executeAgent('report-generation-agent');
    
    // Complete workflow
    this.completeWorkflow();
  }

  private async executeAgent(agentId: string): Promise<void> {
    const agents = this.agents$.value;
    const agentIndex = agents.findIndex(a => a.id === agentId);
    
    if (agentIndex === -1) return;

    const agent = { ...agents[agentIndex] };
    
    // Update agent status to running
    agent.status = AgentStatus.RUNNING;
    agent.lastHeartbeat = new Date();
    
    // Create and start task
    const task: AgentTask = {
      id: `task-${Date.now()}`,
      name: `${agent.name} Execution`,
      description: `Executing ${agent.name} capabilities`,
      progress: 0,
      status: AgentStatus.RUNNING,
      startTime: new Date()
    };
    
    agent.currentTask = task;
    agents[agentIndex] = agent;
    this.agents$.next([...agents]);
    
    // Add message
    this.addMessage({
      id: `msg-${Date.now()}`,
      agentId: agent.id,
      timestamp: new Date(),
      type: 'info',
      message: `${agent.name} has started processing...`
    });

    // Simulate task execution with progress updates
    await this.simulateTaskExecution(agentId, task);
  }

  private async simulateTaskExecution(agentId: string, task: AgentTask): Promise<void> {
    const agents = this.agents$.value;
    const agentIndex = agents.findIndex(a => a.id === agentId);
    
    if (agentIndex === -1) return;

    const agent = { ...agents[agentIndex] };
    const totalSteps = 10;
    
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate work
      
      const progress = (step / totalSteps) * 100;
      task.progress = progress;
      
      agent.currentTask = { ...task };
      agent.lastHeartbeat = new Date();
      agents[agentIndex] = agent;
      this.agents$.next([...agents]);
      
      // Add progress message
      if (step === Math.floor(totalSteps / 2)) {
        this.addMessage({
          id: `msg-${Date.now()}`,
          agentId: agent.id,
          timestamp: new Date(),
          type: 'info',
          message: `${agent.name} is 50% complete...`
        });
      }
    }
    
    // Complete task
    task.status = AgentStatus.COMPLETED;
    task.endTime = new Date();
    task.duration = task.endTime.getTime() - task.startTime!.getTime();
    
    agent.status = AgentStatus.COMPLETED;
    agent.currentTask = undefined;
    agent.taskHistory.push(task);
    agent.metrics.tasksCompleted++;
    agent.metrics.lastActivity = new Date();
    
    agents[agentIndex] = agent;
    this.agents$.next([...agents]);
    
    // Add completion message
    this.addMessage({
      id: `msg-${Date.now()}`,
      agentId: agent.id,
      timestamp: new Date(),
      type: 'success',
      message: `${agent.name} has completed successfully! Duration: ${task.duration}ms`
    });
  }

  private completeWorkflow(): void {
    const workflow = this.workflow$.value;
    if (workflow) {
      workflow.status = AgentStatus.COMPLETED;
      workflow.endTime = new Date();
      workflow.progress = 100;
      this.workflow$.next(workflow);
    }
    
    this.isRunning$.next(false);
    
    this.addMessage({
      id: `msg-${Date.now()}`,
      agentId: 'system',
      timestamp: new Date(),
      type: 'success',
      message: 'Assessment workflow completed successfully! All agents have finished their tasks.'
    });
  }

  // Agent control methods
  pauseAgent(agentId: string): void {
    const agents = this.agents$.value;
    const agentIndex = agents.findIndex(a => a.id === agentId);
    
    if (agentIndex !== -1) {
      agents[agentIndex].status = AgentStatus.PAUSED;
      this.agents$.next([...agents]);
      
      this.addMessage({
        id: `msg-${Date.now()}`,
        agentId: agentId,
        timestamp: new Date(),
        type: 'warning',
        message: `${agents[agentIndex].name} has been paused.`
      });
    }
  }

  resumeAgent(agentId: string): void {
    const agents = this.agents$.value;
    const agentIndex = agents.findIndex(a => a.id === agentId);
    
    if (agentIndex !== -1) {
      agents[agentIndex].status = AgentStatus.RUNNING;
      this.agents$.next([...agents]);
      
      this.addMessage({
        id: `msg-${Date.now()}`,
        agentId: agentId,
        timestamp: new Date(),
        type: 'info',
        message: `${agents[agentIndex].name} has been resumed.`
      });
    }
  }

  restartAgent(agentId: string): void {
    const agents = this.agents$.value;
    const agentIndex = agents.findIndex(a => a.id === agentId);
    
    if (agentIndex !== -1) {
      agents[agentIndex].status = AgentStatus.INITIALIZING;
      agents[agentIndex].currentTask = undefined;
      this.agents$.next([...agents]);
      
      this.addMessage({
        id: `msg-${Date.now()}`,
        agentId: agentId,
        timestamp: new Date(),
        type: 'info',
        message: `${agents[agentIndex].name} is restarting...`
      });
      
      // Restart after a delay
      setTimeout(() => {
        agents[agentIndex].status = AgentStatus.IDLE;
        this.agents$.next([...agents]);
      }, 2000);
    }
  }

  // Message management
  private addMessage(message: AgentMessage): void {
    const messages = this.messages$.value;
    messages.unshift(message); // Add to beginning
    
    // Keep only last 100 messages
    if (messages.length > 100) {
      messages.splice(100);
    }
    
    this.messages$.next([...messages]);
  }

  clearMessages(): void {
    this.messages$.next([]);
  }

  // Heartbeat system
  private startHeartbeat(): void {
    interval(5000).subscribe(() => {
      const agents = this.agents$.value;
      const now = new Date();
      
      agents.forEach(agent => {
        if (agent.isActive && agent.status === AgentStatus.RUNNING) {
          agent.lastHeartbeat = now;
        }
      });
      
      this.agents$.next([...agents]);
    });
  }

  // Utility methods
  getAgentById(agentId: string): Agent | undefined {
    return this.agents$.value.find(agent => agent.id === agentId);
  }

  getAgentsByStatus(status: AgentStatus): Agent[] {
    return this.agents$.value.filter(agent => agent.status === status);
  }

  getActiveAgents(): Agent[] {
    return this.agents$.value.filter(agent => agent.isActive);
  }
}
