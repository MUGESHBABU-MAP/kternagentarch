import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentManagerService } from '../../../../core/services/agent-manager.service';
import { AgentConfiguration } from '../../../../core/interfaces/agentic-core.interface';

@Component({
  selector: 'app-my-agents',
  templateUrl: './my-agents.component.html',
  styleUrls: ['./my-agents.component.scss']
})
export class MyAgentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  myAgents: AgentConfiguration[] = [];
  recentAgents: AgentConfiguration[] = [];
  filteredAgents: AgentConfiguration[] = [];
  viewMode: 'grid' | 'list' | 'timeline' = 'grid';
  loading = false;

  constructor(
    private agentManager: AgentManagerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Subscribe to filtered agents (represents user's agents based on filters)
    this.agentManager.getFilteredAgents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(agents => {
        this.filteredAgents = agents;
        this.myAgents = agents; // For now, all agents are considered "my agents"
        this.loading = false;
      });

    // Subscribe to recent agents
    this.agentManager.getRecentAgents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(agents => {
        this.recentAgents = agents;
      });

    // Subscribe to view mode changes
    this.agentManager.navigationState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.viewMode = state.viewMode;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onAgentSelect(agent: AgentConfiguration): void {
    this.agentManager.setSelectedAgent(agent.id);
    this.router.navigate(['/agents/agent', agent.id]);
  }

  onAgentPin(agent: AgentConfiguration): void {
    this.agentManager.pinAgent(agent.id);
  }

  onAgentExecute(agent: AgentConfiguration): void {
    this.router.navigate(['/agents/agent', agent.id], { 
      queryParams: { action: 'execute' } 
    });
  }

  onAgentConfigure(agent: AgentConfiguration): void {
    this.router.navigate(['/agents/agent', agent.id], { 
      queryParams: { action: 'configure' } 
    });
  }

  createNewAgent(): void {
    // Navigate to agent creation/template selection
    this.router.navigate(['/agents/create']);
  }

  importAgent(): void {
    // Navigate to agent import functionality
    this.router.navigate(['/agents/import']);
  }

  getAgentsByCategory(category: string): AgentConfiguration[] {
    return this.myAgents.filter(agent => agent.category === category);
  }

  getUniqueCategories(): string[] {
    return [...new Set(this.myAgents.map(agent => agent.category))];
  }
}
