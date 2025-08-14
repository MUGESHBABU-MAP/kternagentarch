import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AgentHubComponent } from './components/agent-hub/agent-hub.component';
import { MyAgentsComponent } from './components/my-agents/my-agents.component';
import { PinnedAgentsComponent } from './components/pinned-agents/pinned-agents.component';
import { AgentProgressComponent } from './components/agent-progress/agent-progress.component';
import { AgentDetailComponent } from './components/agent-detail/agent-detail.component';
import { AgentResultsComponent } from './components/agent-results/agent-results.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        redirectTo: 'hub',
        pathMatch: 'full'
      },
      // Main hub listing all agents
      {
        path: 'hub',
        component: AgentHubComponent,
        data: { title: 'Agent Hub', breadcrumb: 'Hub' }
      },
      // Agent detail and execution flow
      {
        path: 'agent/:id',
        children: [
          {
            path: '',
            component: AgentDetailComponent,
            data: { title: 'Agent Details', breadcrumb: 'Details' }
          },
          {
            path: 'progress',
            component: AgentProgressComponent,
            data: { title: 'Agent Progress', breadcrumb: 'Progress' }
          },
          {
            path: 'results',
            component: AgentResultsComponent,
            data: { title: 'Agent Results', breadcrumb: 'Results' }
          },
          {
            path: 'results/:executionId',
            component: AgentResultsComponent,
            data: { title: 'Agent Results', breadcrumb: 'Results' }
          }
        ]
      },
      // Legacy routes (to be deprecated)
      {
        path: 'my-agents',
        component: MyAgentsComponent,
        data: { title: 'My Agents', breadcrumb: 'My Agents' }
      },
      {
        path: 'pinned',
        component: PinnedAgentsComponent,
        data: { title: 'Pinned Agents', breadcrumb: 'Pinned' }
      },
      {
        path: '**',
        redirectTo: 'hub'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgenticFrameworkRoutingModule { }
