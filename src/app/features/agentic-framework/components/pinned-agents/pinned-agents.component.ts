import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentManagerService } from '../../../../core/services/agent-manager.service';
import { AgentConfiguration } from '../../../../core/interfaces/agentic-core.interface';

@Component({
  selector: 'app-pinned-agents',
  templateUrl: './pinned-agents.component.html',
  styleUrls: ['./pinned-agents.component.scss']
})
export class PinnedAgentsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  pinnedAgents: AgentConfiguration[] = [];
  viewMode: 'grid' | 'list' | 'timeline' = 'grid';
  loading = false;

  constructor(
    private agentManager: AgentManagerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loading = true;

    // Subscribe to pinned agents
    this.agentManager.getPinnedAgents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(agents => {
        this.pinnedAgents = agents;
        this.loading = false;
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

  onAgentUnpin(agent: AgentConfiguration): void {
    this.agentManager.unpinAgent(agent.id);
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

  navigateToHub(): void {
    this.router.navigate(['/agents/hub']);
  }

  getAgentsByCategory(category: string): AgentConfiguration[] {
    return this.pinnedAgents.filter(agent => agent.category === category);
  }

  getUniqueCategories(): string[] {
    return [...new Set(this.pinnedAgents.map(agent => agent.category))];
  }

  clearAllPins(): void {
    this.pinnedAgents.forEach(agent => {
      this.agentManager.unpinAgent(agent.id);
    });
  }
}
