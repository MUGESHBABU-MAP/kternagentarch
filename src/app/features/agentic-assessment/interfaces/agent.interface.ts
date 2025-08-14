export enum AgentStatus {
  IDLE = 'idle',
  INITIALIZING = 'initializing',
  RUNNING = 'running',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

export interface ExecutionState {
  isPaused: boolean;
  isCancelled: boolean;
  lastUpdated: Date;
}

export enum AgentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AgentTask {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: AgentStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  result?: any;
  error?: string;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksInProgress: number;
  tasksFailed: number;
  averageExecutionTime: number;
  successRate: number;
  lastActivity: Date;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  status: AgentStatus;
  priority: AgentPriority;
  avatar: string;
  color: string;
  capabilities: AgentCapability[];
  currentTask?: AgentTask;
  taskHistory: AgentTask[];
  metrics: AgentMetrics;
  dependencies: string[];
  outputs: string[];
  isActive: boolean;
  lastHeartbeat: Date;
}

export interface AgentMessage {
  id: string;
  agentId: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

export interface AgentWorkflow {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
  currentStep: number;
  totalSteps: number;
  status: AgentStatus;
  startTime?: Date;
  endTime?: Date;
  progress: number;
}
