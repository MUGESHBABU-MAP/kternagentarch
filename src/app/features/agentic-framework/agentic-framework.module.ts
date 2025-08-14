import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// ng-zorro-antd modules
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';

import { SharedModule } from '../../shared/shared.module';
import { AgenticFrameworkRoutingModule } from './agentic-framework-routing.module';

// Components
import { AgentSearchComponent } from './components/agent-search/agent-search.component';
import { AgentFiltersComponent } from './components/agent-filters/agent-filters.component';
import { AgentHubComponent } from './components/agent-hub/agent-hub.component';
import { AgentCardComponent } from './components/agent-card/agent-card.component';
import { AgentListComponent } from './components/agent-list/agent-list.component';
import { MyAgentsComponent } from './components/my-agents/my-agents.component';
import { PinnedAgentsComponent } from './components/pinned-agents/pinned-agents.component';
import { AgentProgressComponent } from './components/agent-progress/agent-progress.component';
import { AgentDetailComponent } from './components/agent-detail/agent-detail.component';
import { AgentGridComponent } from './components/agent-grid/agent-grid.component';
import { AgentTimelineComponent } from './components/agent-timeline/agent-timeline.component';
import { AgentExecutionComponent } from './components/agent-execution/agent-execution.component';
import { AgentConfigurationComponent } from './components/agent-configuration/agent-configuration.component';
import { AgentDependencyGraphComponent } from './components/agent-dependency-graph/agent-dependency-graph.component';
import { AgentWorkflowComponent } from './components/agent-workflow/agent-workflow.component';
import { AgentResultsComponent } from './components/agent-results/agent-results.component';



@NgModule({
  declarations: [
    AgentSearchComponent,
    AgentFiltersComponent,
    AgentHubComponent,
    AgentCardComponent,
    AgentListComponent,
    MyAgentsComponent,
    PinnedAgentsComponent,
    AgentProgressComponent,
    AgentDetailComponent,
    AgentGridComponent,
    AgentTimelineComponent,
    AgentExecutionComponent,
    AgentConfigurationComponent,
    AgentDependencyGraphComponent,
    AgentWorkflowComponent,
    AgentResultsComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AgenticFrameworkRoutingModule,
    NzBadgeModule,
    NzSpinModule,
    NzCheckboxModule,
    NzTagModule,
    NzProgressModule,
    NzDropDownModule,
    NzPopconfirmModule,
    NzInputModule,
    NzSelectModule,
    NzIconModule,
    NzRadioModule,
    NzBreadCrumbModule,
    NzButtonModule,
    NzCardModule,
    NzListModule,
    NzEmptyModule,
    NzTimelineModule,
    NzTabsModule,
    NzFormModule,
    NzResultModule,
    NzMenuModule,
    NzDescriptionsModule,
    SharedModule
  ]
})
export class AgenticFrameworkModule { }
