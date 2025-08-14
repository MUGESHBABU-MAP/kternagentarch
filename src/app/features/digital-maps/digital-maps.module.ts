import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

// Layout component removed to use shared main layout
import { DigitalMapsOverviewComponent } from './components/digital-maps-overview/digital-maps-overview.component';
import { MapDashboardComponent } from './components/map-dashboard/map-dashboard.component';
import { ProcessFlowsComponent } from './components/process-flows/process-flows.component';
import { CollaborationComponent } from './components/collaboration/collaboration.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { AssessmentComponent } from './components/assessment/assessment.component';

const routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: DigitalMapsOverviewComponent, data: { title: 'Overview', breadcrumb: 'Overview' } },
      { path: 'maps', component: MapDashboardComponent, data: { title: 'Maps', breadcrumb: 'Maps' } },
      { path: 'processes', component: ProcessFlowsComponent, data: { title: 'Processes', breadcrumb: 'Processes' } },
      { path: 'collaboration', component: CollaborationComponent, data: { title: 'Collaboration', breadcrumb: 'Collaboration' } },
      { path: 'documentation', component: DocumentationComponent, data: { title: 'Documentation', breadcrumb: 'Documentation' } },
      { 
        path: 'assessment', 
        loadChildren: () => import('./components/assessment/assessment.module').then(m => m.AssessmentModule),
        data: { breadcrumb: 'Assessment' }
      },
      // { 
      //   path: 'agentic-assessment', 
      //   loadChildren: () => import('../agentic-assessment/agentic-assessment.module').then(m => m.AgenticAssessmentModule),
      //   data: { breadcrumb: 'Agentic Assessment' }
      // },
      // {
      //   path: 'agents',
      //   loadChildren: () => import('../agentic-framework/agentic-framework.module').then(m => m.AgenticFrameworkModule),
      //   data: { breadcrumb: 'Agents' }
      // }
    ]
  }
];

@NgModule({
  declarations: [
    DigitalMapsOverviewComponent,
    MapDashboardComponent,
    ProcessFlowsComponent,
    CollaborationComponent,
    DocumentationComponent,
    AssessmentComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: []
})
export class DigitalMapsModule { }
