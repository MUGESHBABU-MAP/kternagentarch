import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil, map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, combineLatest } from 'rxjs';
import { AgentManagerService } from '@core/services/agent-manager.service';
// Using relative imports to avoid module resolution issues
import { AgentConfiguration, AgentCategory } from '../../../../core/interfaces/agentic-core.interface';

// Simplified Agent interface for type safety
// Extend the base AgentConfiguration to include our UI-specific properties
interface Agent extends AgentConfiguration {
  pinned?: boolean;
  icon?: string;
}

interface AgentHubState {
  agents: AgentConfiguration[];
  filteredAgents: AgentConfiguration[];
  categories: AgentCategory[];
  viewMode: 'grid' | 'list' | 'timeline';
  loading: boolean;
}

@Component({
  selector: 'app-agent-hub',
  templateUrl: './agent-hub.component.html',
  styleUrls: ['./agent-hub.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgentHubComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  state: AgentHubState = {
    agents: [],
    filteredAgents: [],
    categories: [],
    viewMode: 'grid',
    loading: true
  };

  constructor(
    private agentManager: AgentManagerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    combineLatest([
      this.agentManager.agentRegistry$.pipe(
        map(registry => Array.from(registry.agents.values())),
        debounceTime(50),
        distinctUntilChanged((prev, curr) => {
          if (prev.length !== curr.length) return false;
          // Compare JSON string representations of the agent IDs for simplicity
          return JSON.stringify(prev.map(a => a.id)) === JSON.stringify(curr.map(a => a.id));
        })
      ),
      this.agentManager.getCategories().pipe(
        debounceTime(50),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      ),
      this.agentManager.navigationState$.pipe(
        map(state => state.viewMode),
        distinctUntilChanged()
      )
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([agents, categories, viewMode]) => {
        this.state = {
          ...this.state,
          agents,
          filteredAgents: [...agents],
          categories: [...categories],
          viewMode,
          loading: false
        };
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error loading agent data:', error);
        this.state.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  getAgentsByCategory(categoryId: string): AgentConfiguration[] {
    if (!categoryId) return [];
    return this.state.filteredAgents.filter(agent => agent.category === categoryId);
  }

  getCategoryStats(): Array<AgentCategory & { agentCount: number; icon: string }> {
    const categoryIcons: { [key: string]: string } = {
      'security': 'safety-certificate',
      'data': 'database',
      'automation': 'robot',
      'monitoring': 'dashboard',
      'networking': 'global',
      'default': 'appstore'
    };

    return this.state.categories.map(category => ({
      ...category,
      icon: categoryIcons[category.id.toLowerCase()] || categoryIcons['default'],
      agentCount: this.getAgentsByCategory(category.id).length
    }));
  }

  onAgentSelect(agent: AgentConfiguration): void {
    this.agentManager.setSelectedAgent(agent.id);
    this.router.navigate(['/digital-maps/agents', agent.id]);
  }

  onAgentPin(agent: Agent): void {
    // Toggle pin status - update local state immediately for better UX
    const agents = [...this.state.agents];
    const index = agents.findIndex(a => a.id === agent.id);
    
    if (index > -1) {
      const isPinned = this.agentManager.getPinnedAgents()
        .pipe(takeUntil(this.destroy$))
        .subscribe(pinnedAgents => {
          const isCurrentlyPinned = pinnedAgents.some(a => a.id === agent.id);
          
          if (isCurrentlyPinned) {
            this.agentManager.unpinAgent(agent.id);
          } else {
            this.agentManager.pinAgent(agent.id);
          }
          
          // Update local state
          const updatedAgents = agents.map(a => 
            a.id === agent.id ? { ...a, pinned: !isCurrentlyPinned } : a
          );
          
          this.state = { 
            ...this.state, 
            agents: updatedAgents,
            filteredAgents: this.state.filteredAgents.map(a => 
              a.id === agent.id ? { ...a, pinned: !isCurrentlyPinned } : a
            )
          };
          
          this.cdr.markForCheck();
        });
    }
  }

  /**
   * Navigate to the agent detail page
   * @param agent The agent to view details for
   */
  viewAgentDetails(agent: Agent): void {
    if (agent && agent.id) {
      // Navigate to the agent detail page using the same route as my-agents
      this.router.navigate(['/agents', agent.id]);
    }
  }

  onAgentExecute(agent: AgentConfiguration): void {
    this.router.navigate(['/digital-maps/agents', agent.id], { 
      queryParams: { action: 'execute' } 
    });
  }

  onCategorySelect(category: AgentCategory): void {
    this.agentManager.updateFilters({ 
      categories: [category.id] 
    });
  }

  createNewAgent(): void {
    this.router.navigate(['/digital-maps/agents/create']);
  }

  trackByAgentId(index: number, agent: AgentConfiguration): string {
    return agent.id;
  }

  trackByCategoryId(index: number, category: AgentCategory): string {
    return category.id;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}