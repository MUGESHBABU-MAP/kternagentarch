import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { map, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { 
  AgentConfiguration, 
  AgentRegistry, 
  AgentCategory, 
  AgentTemplate,
  UserAgentPreferences,
  AgentExecutionContext,
  AgentNavigationState,
  AgentFilters
} from '../interfaces/agentic-core.interface';
import { Agent, AgentStatus, AgentWorkflow } from '../../features/agentic-assessment/interfaces/agent.interface';

@Injectable({
  providedIn: 'root'
})
export class AgentManagerService {
  private agentRegistrySubject = new BehaviorSubject<AgentRegistry>({
    agents: new Map(),
    categories: [],
    workflows: [],
    templates: []
  });

  private userPreferencesSubject = new BehaviorSubject<UserAgentPreferences>({
    userId: 'current-user',
    pinnedAgents: [],
    favoriteAgents: [],
    recentAgents: [],
    customCategories: [],
    notifications: {
      enabled: true,
      types: ['status', 'completion', 'error'],
      channels: ['ui'],
      frequency: 'immediate'
    }
  });

  private navigationStateSubject = new BehaviorSubject<AgentNavigationState>({
    currentView: 'hub',
    filters: {
      categories: [],
      statuses: [],
      priorities: [],
      tags: []
    },
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
    viewMode: 'grid'
  });

  private activeExecutionsSubject = new BehaviorSubject<AgentExecutionContext[]>([]);
  private agentUpdatesSubject = new Subject<{ agentId: string; type: string; data: any }>();

  // Public observables
  public agentRegistry$ = this.agentRegistrySubject.asObservable();
  public userPreferences$ = this.userPreferencesSubject.asObservable();
  public navigationState$ = this.navigationStateSubject.asObservable();
  public activeExecutions$ = this.activeExecutionsSubject.asObservable();
  public agentUpdates$ = this.agentUpdatesSubject.asObservable();

  constructor() {
    this.initializeDefaultAgents();
    this.initializeDefaultCategories();
    this.initializeDefaultTemplates();
  }

  // Agent Registry Management
  registerAgent(config: AgentConfiguration): void {
    const registry = this.agentRegistrySubject.value;
    registry.agents.set(config.id, config);
    this.agentRegistrySubject.next(registry);
    this.agentUpdatesSubject.next({ agentId: config.id, type: 'registered', data: config });
  }

  unregisterAgent(agentId: string): void {
    const registry = this.agentRegistrySubject.value;
    registry.agents.delete(agentId);
    this.agentRegistrySubject.next(registry);
    this.agentUpdatesSubject.next({ agentId, type: 'unregistered', data: null });
  }

  getAgent(agentId: string): AgentConfiguration | undefined {
    return this.agentRegistrySubject.value.agents.get(agentId);
  }

  getAllAgents(): AgentConfiguration[] {
    return Array.from(this.agentRegistrySubject.value.agents.values());
  }

  // Filtered Agent Queries
  getFilteredAgents(): Observable<AgentConfiguration[]> {
    return combineLatest([
      this.agentRegistry$,
      this.navigationState$
    ]).pipe(
      map(([registry, navState]) => {
        let agents = Array.from(registry.agents.values());

        // Apply search filter
        if (navState.searchQuery) {
          const query = navState.searchQuery.toLowerCase();
          agents = agents.filter(agent => 
            agent.name.toLowerCase().includes(query) ||
            agent.description.toLowerCase().includes(query) ||
            agent.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }

        // Apply category filter
        if (navState.filters.categories.length > 0) {
          agents = agents.filter(agent => 
            navState.filters.categories.includes(agent.category)
          );
        }

        // Apply tag filter
        if (navState.filters.tags.length > 0) {
          agents = agents.filter(agent => 
            navState.filters.tags.some(tag => agent.tags.includes(tag))
          );
        }

        // Apply sorting
        agents.sort((a, b) => {
          let comparison = 0;
          switch (navState.sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'category':
              comparison = a.category.localeCompare(b.category);
              break;
            default:
              comparison = a.name.localeCompare(b.name);
          }
          return navState.sortOrder === 'desc' ? -comparison : comparison;
        });

        return agents;
      })
    );
  }

  getPinnedAgents(): Observable<AgentConfiguration[]> {
    return combineLatest([
      this.agentRegistry$,
      this.userPreferences$
    ]).pipe(
      map(([registry, preferences]) => {
        return preferences.pinnedAgents
          .map(agentId => registry.agents.get(agentId))
          .filter(agent => agent !== undefined) as AgentConfiguration[];
      })
    );
  }

  getRecentAgents(): Observable<AgentConfiguration[]> {
    return combineLatest([
      this.agentRegistry$,
      this.userPreferences$
    ]).pipe(
      map(([registry, preferences]) => {
        return preferences.recentAgents
          .map(agentId => registry.agents.get(agentId))
          .filter(agent => agent !== undefined) as AgentConfiguration[];
      })
    );
  }

  // User Preferences Management
  pinAgent(agentId: string): void {
    const preferences = this.userPreferencesSubject.value;
    if (!preferences.pinnedAgents.includes(agentId)) {
      preferences.pinnedAgents.push(agentId);
      this.userPreferencesSubject.next(preferences);
    }
  }

  unpinAgent(agentId: string): void {
    const preferences = this.userPreferencesSubject.value;
    preferences.pinnedAgents = preferences.pinnedAgents.filter(id => id !== agentId);
    this.userPreferencesSubject.next(preferences);
  }

  addToRecent(agentId: string): void {
    const preferences = this.userPreferencesSubject.value;
    preferences.recentAgents = preferences.recentAgents.filter(id => id !== agentId);
    preferences.recentAgents.unshift(agentId);
    preferences.recentAgents = preferences.recentAgents.slice(0, 10); // Keep only last 10
    this.userPreferencesSubject.next(preferences);
  }

  // Navigation State Management
  setCurrentView(view: AgentNavigationState['currentView']): void {
    const state = this.navigationStateSubject.value;
    state.currentView = view;
    this.navigationStateSubject.next(state);
  }

  setSelectedAgent(agentId: string): void {
    const state = this.navigationStateSubject.value;
    state.selectedAgentId = agentId;
    this.navigationStateSubject.next(state);
    this.addToRecent(agentId);
  }

  updateFilters(filters: Partial<AgentFilters>): void {
    const state = this.navigationStateSubject.value;
    state.filters = { ...state.filters, ...filters };
    this.navigationStateSubject.next(state);
  }

  updateSearchQuery(query: string): void {
    const state = this.navigationStateSubject.value;
    state.searchQuery = query;
    this.navigationStateSubject.next(state);
  }

  updateSorting(sortBy: AgentNavigationState['sortBy'], sortOrder: AgentNavigationState['sortOrder']): void {
    const state = this.navigationStateSubject.value;
    state.sortBy = sortBy;
    state.sortOrder = sortOrder;
    this.navigationStateSubject.next(state);
  }

  setViewMode(viewMode: AgentNavigationState['viewMode']): void {
    const state = this.navigationStateSubject.value;
    state.viewMode = viewMode;
    this.navigationStateSubject.next(state);
  }

  // Agent Execution Management
  executeAgent(agentId: string, parameters: Record<string, any>): Observable<AgentExecutionContext> {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const executionContext: AgentExecutionContext = {
      id: this.generateId(),
      agentId,
      userId: 'current-user',
      environment: 'development',
      parameters,
      dependencies: [],
      startTime: new Date(),
      status: AgentStatus.INITIALIZING,
      progress: 0,
      logs: [],
      metrics: {
        duration: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        networkCalls: 0,
        errorCount: 0,
        warningCount: 0
      },
      outputs: {},
      executionState: {
        isPaused: false,
        isCancelled: false,
        lastUpdated: new Date()
      }
    };

    const executions = this.activeExecutionsSubject.value;
    executions.push(executionContext);
    this.activeExecutionsSubject.next(executions);

    // Simulate agent execution lifecycle
    this.simulateAgentExecution(executionContext);

    return new BehaviorSubject(executionContext).asObservable();
  }

  /**
   * Retrieves an execution context by its ID
   * @param executionId The ID of the execution to retrieve
   * @returns The execution context if found, undefined otherwise
   */
  getExecutionById(executionId: string): AgentExecutionContext | undefined {
    if (!executionId) {
      console.error('No execution ID provided');
      return undefined;
    }
    
    const executions = this.activeExecutionsSubject.value;
    const execution = executions.find(exec => exec.id === executionId);
    
    if (!execution) {
      console.warn(`No execution found with ID: ${executionId}`);
    }
    
    return execution;
  }

  pauseExecution(executionId: string): boolean {
    const executions = this.activeExecutionsSubject.value;
    const execution = executions.find(e => e.id === executionId);
    
    if (!execution) {
      return false;
    }

    // Only allow pausing if execution is in progress
    if (execution.status === AgentStatus.RUNNING || execution.status === AgentStatus.PROCESSING) {
      execution.status = AgentStatus.PAUSED;
      if (execution.executionState) {
        execution.executionState.isPaused = true;
        execution.executionState.lastUpdated = new Date();
      }
      this.updateExecutionContext(execution);
      return true;
    }
    
    return false;
  }

  resumeExecution(executionId: string): boolean {
    const executions = this.activeExecutionsSubject.value;
    const execution = executions.find(e => e.id === executionId);
    
    if (!execution || !execution.executionState.isPaused) {
      return false;
    }

    // Only allow resuming if execution was paused
    if (execution.status === AgentStatus.PAUSED) {
      execution.status = AgentStatus.RUNNING;
      if (execution.executionState) {
        execution.executionState.isPaused = false;
        execution.executionState.lastUpdated = new Date();
      }
      this.updateExecutionContext(execution);
      return true;
    }
    
    return false;
  }

  cancelExecution(executionId: string): boolean {
    const executions = this.activeExecutionsSubject.value;
    const execution = executions.find(e => e.id === executionId);
    
    if (!execution) {
      return false;
    }

    // Only allow cancelling if execution is not already completed/failed/cancelled
    if (execution.status !== AgentStatus.COMPLETED && 
        execution.status !== AgentStatus.FAILED && 
        execution.status !== AgentStatus.CANCELLED) {
      
      execution.status = AgentStatus.CANCELLED;
      execution.endTime = new Date();
      if (execution.executionState) {
        execution.executionState.isCancelled = true;
        execution.executionState.lastUpdated = new Date();
      }
      this.updateExecutionContext(execution);
      return true;
    }
    
    return false;
  }

  retryExecution(executionId: string): Observable<AgentExecutionContext> | null {
    const executions = this.activeExecutionsSubject.value;
    const execution = executions.find(e => e.id === executionId);
    
    if (!execution) {
      return null;
    }

    // Only allow retrying if execution has completed, failed, or was cancelled
    if (execution.status === AgentStatus.COMPLETED || 
        execution.status === AgentStatus.FAILED || 
        execution.status === AgentStatus.CANCELLED) {
      
      // Create a new execution context with the same parameters
      const newExecution: AgentExecutionContext = {
        ...execution,
        id: this.generateId(),
        startTime: new Date(),
        status: AgentStatus.INITIALIZING,
        progress: 0,
        endTime: undefined,
        logs: [],
        metrics: {
          ...execution.metrics,
          duration: 0,
          errorCount: 0,
          warningCount: 0
        },
        outputs: {},
        executionState: {
          isPaused: false,
          isCancelled: false,
          lastUpdated: new Date()
        }
      };

      const updatedExecutions = [...executions, newExecution];
      this.activeExecutionsSubject.next(updatedExecutions);

      // Simulate agent execution lifecycle
      this.simulateAgentExecution(newExecution);

      return new BehaviorSubject(newExecution).asObservable();
    }
    
    return null;
  }

  // Categories Management
  getCategories(): Observable<AgentCategory[]> {
    return this.agentRegistry$.pipe(
      map(registry => registry.categories)
    );
  }

  // Templates Management
  getTemplates(): Observable<AgentTemplate[]> {
    return this.agentRegistry$.pipe(
      map(registry => registry.templates)
    );
  }

  createAgentFromTemplate(templateId: string, customConfig: Partial<AgentConfiguration>): AgentConfiguration {
    const registry = this.agentRegistrySubject.value;
    const template = registry.templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const newAgent: AgentConfiguration = {
      ...template.configuration,
      ...customConfig,
      id: customConfig.id || this.generateId(),
      version: '1.0.0'
    } as AgentConfiguration;

    this.registerAgent(newAgent);
    return newAgent;
  }

  // Private helper methods
  private generateId(): string {
    return 'agent_' + Math.random().toString(36).substr(2, 9);
  }

  private simulateAgentExecution(context: AgentExecutionContext): void {
    // Simulate agent lifecycle stages
    setTimeout(() => {
      context.status = AgentStatus.RUNNING;
      context.progress = 25;
      this.updateExecutionContext(context);
    }, 1000);

    setTimeout(() => {
      context.status = AgentStatus.PROCESSING;
      context.progress = 50;
      this.updateExecutionContext(context);
    }, 3000);

    setTimeout(() => {
      context.status = AgentStatus.PROCESSING;
      context.progress = 75;
      this.updateExecutionContext(context);
    }, 5000);

    setTimeout(() => {
      context.status = AgentStatus.COMPLETED;
      context.progress = 100;
      context.endTime = new Date();
      context.metrics.duration = context.endTime.getTime() - context.startTime.getTime();
      context.outputs = { result: 'Agent execution completed successfully' };
      this.updateExecutionContext(context);
    }, 7000);
  }

  private updateExecutionContext(context: AgentExecutionContext): void {
    const executions = this.activeExecutionsSubject.value;
    const index = executions.findIndex(e => e.id === context.id);
    if (index !== -1) {
      executions[index] = context;
      this.activeExecutionsSubject.next(executions);
    }
  }

  private initializeDefaultAgents(): void {
    const defaultAgents: AgentConfiguration[] = [
      {
        id: 'system-analysis-agent',
        name: 'System Analysis Agent',
        type: 'analysis',
        version: '1.0.0',
        description: 'Analyzes system architecture and identifies potential issues',
        category: 'analysis',
        tags: ['system', 'analysis', 'architecture'],
        parameters: [
          {
            id: 'target-system',
            name: 'Target System',
            type: 'string',
            required: true,
            description: 'The system to analyze'
          }
        ],
        dependencies: [],
        outputs: [
          {
            id: 'analysis-report',
            name: 'Analysis Report',
            type: 'report',
            description: 'Detailed system analysis report',
            format: 'json'
          }
        ],
        lifecycle: {
          stages: [
            {
              id: 'initialize',
              name: 'Initialize',
              description: 'Initialize analysis parameters',
              order: 1,
              required: true,
              actions: [],
              validations: []
            },
            {
              id: 'analyze',
              name: 'Analyze',
              description: 'Perform system analysis',
              order: 2,
              required: true,
              actions: [],
              validations: []
            },
            {
              id: 'report',
              name: 'Generate Report',
              description: 'Generate analysis report',
              order: 3,
              required: true,
              actions: [],
              validations: []
            }
          ]
        },
        ui: {
          icon: 'search',
          color: '#1890ff',
          theme: 'light',
          layout: 'card',
          displayFields: ['name', 'status', 'progress'],
          actionButtons: [
            {
              id: 'run',
              label: 'Run Analysis',
              icon: 'play-circle',
              type: 'primary',
              action: 'execute'
            }
          ]
        },
        metadata: {}
      },
      {
        id: 'data-processing-agent',
        name: 'Data Processing Agent',
        type: 'processing',
        version: '1.0.0',
        description: 'Processes and transforms data according to specified rules',
        category: 'processing',
        tags: ['data', 'processing', 'transformation'],
        parameters: [
          {
            id: 'input-data',
            name: 'Input Data',
            type: 'object',
            required: true,
            description: 'Data to be processed'
          },
          {
            id: 'processing-rules',
            name: 'Processing Rules',
            type: 'array',
            required: true,
            description: 'Rules for data processing'
          }
        ],
        dependencies: [],
        outputs: [
          {
            id: 'processed-data',
            name: 'Processed Data',
            type: 'data',
            description: 'Transformed data output',
            format: 'json'
          }
        ],
        lifecycle: {
          stages: [
            {
              id: 'validate',
              name: 'Validate Input',
              description: 'Validate input data and rules',
              order: 1,
              required: true,
              actions: [],
              validations: []
            },
            {
              id: 'process',
              name: 'Process Data',
              description: 'Apply processing rules to data',
              order: 2,
              required: true,
              actions: [],
              validations: []
            },
            {
              id: 'output',
              name: 'Generate Output',
              description: 'Generate processed data output',
              order: 3,
              required: true,
              actions: [],
              validations: []
            }
          ]
        },
        ui: {
          icon: 'database',
          color: '#52c41a',
          theme: 'light',
          layout: 'card',
          displayFields: ['name', 'status', 'progress'],
          actionButtons: [
            {
              id: 'run',
              label: 'Process Data',
              icon: 'play-circle',
              type: 'primary',
              action: 'execute'
            }
          ]
        },
        metadata: {}
      }
    ];

    defaultAgents.forEach(agent => this.registerAgent(agent));
  }

  private initializeDefaultCategories(): void {
    const registry = this.agentRegistrySubject.value;
    registry.categories = [
      {
        id: 'analysis',
        name: 'Analysis',
        description: 'Agents that analyze systems, data, and processes',
        icon: 'search',
        color: '#1890ff',
        agentCount: 0
      },
      {
        id: 'processing',
        name: 'Processing',
        description: 'Agents that process and transform data',
        icon: 'database',
        color: '#52c41a',
        agentCount: 0
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Agents focused on security assessment and monitoring',
        icon: 'shield',
        color: '#fa541c',
        agentCount: 0
      },
      {
        id: 'reporting',
        name: 'Reporting',
        description: 'Agents that generate reports and documentation',
        icon: 'file-text',
        color: '#722ed1',
        agentCount: 0
      }
    ];
    this.agentRegistrySubject.next(registry);
  }

  private initializeDefaultTemplates(): void {
    const registry = this.agentRegistrySubject.value;
    registry.templates = [
      {
        id: 'basic-analysis-template',
        name: 'Basic Analysis Template',
        description: 'Template for creating basic analysis agents',
        category: 'analysis',
        configuration: {
          type: 'analysis',
          category: 'analysis',
          tags: ['analysis'],
          parameters: [],
          dependencies: [],
          outputs: [],
          lifecycle: {
            stages: [
              {
                id: 'initialize',
                name: 'Initialize',
                description: 'Initialize analysis',
                order: 1,
                required: true,
                actions: [],
                validations: []
              }
            ]
          },
          ui: {
            icon: 'search',
            color: '#1890ff',
            theme: 'light',
            layout: 'card',
            displayFields: ['name', 'status'],
            actionButtons: []
          },
          metadata: {}
        },
        isPublic: true,
        author: 'System',
        version: '1.0.0',
        tags: ['template', 'analysis']
      }
    ];
    this.agentRegistrySubject.next(registry);
  }
}
