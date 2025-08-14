import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentManagerService } from '../../../../core/services/agent-manager.service';
import { AgentFilters, AgentCategory } from '../../../../core/interfaces/agentic-core.interface';
import { AgentStatus } from '../../../agentic-assessment/interfaces/agent.interface';

@Component({
  selector: 'app-agent-filters',
  templateUrl: './agent-filters.component.html',
  styleUrls: ['./agent-filters.component.scss']
})
export class AgentFiltersComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  categories: AgentCategory[] = [];
  filters: AgentFilters = {
    categories: [],
    statuses: [],
    priorities: [],
    tags: []
  };

  statusOptions = [
    { label: 'Idle', value: AgentStatus.IDLE },
    { label: 'Running', value: AgentStatus.RUNNING },
    { label: 'Processing', value: AgentStatus.PROCESSING },
    { label: 'Completed', value: AgentStatus.COMPLETED },
    { label: 'Error', value: AgentStatus.ERROR },
    { label: 'Paused', value: AgentStatus.PAUSED }
  ];

  priorityOptions = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Critical', value: 'critical' }
  ];

  constructor(private agentManager: AgentManagerService) {}

  ngOnInit(): void {
    // Subscribe to categories
    this.agentManager.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories = categories;
      });

    // Subscribe to navigation state for current filters
    this.agentManager.navigationState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.filters = { ...state.filters };
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onCategoryChange(categories: string[]): void {
    this.agentManager.updateFilters({ categories });
  }

  onStatusChange(statuses: AgentStatus[]): void {
    this.agentManager.updateFilters({ statuses });
  }

  onPriorityChange(priorities: string[]): void {
    this.agentManager.updateFilters({ priorities });
  }

  clearAllFilters(): void {
    this.agentManager.updateFilters({
      categories: [],
      statuses: [],
      priorities: [],
      tags: []
    });
  }

  hasActiveFilters(): boolean {
    return this.filters.categories.length > 0 ||
           this.filters.statuses.length > 0 ||
           this.filters.priorities.length > 0 ||
           this.filters.tags.length > 0;
  }
}
