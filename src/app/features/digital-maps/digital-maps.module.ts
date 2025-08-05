import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { DigitalMapsLayoutComponent } from './components/digital-maps-layout/digital-maps-layout.component';
import { DigitalMapsOverviewComponent } from './components/digital-maps-overview/digital-maps-overview.component';
import { MapDashboardComponent } from './components/map-dashboard/map-dashboard.component';
import { ProcessFlowsComponent } from './components/process-flows/process-flows.component';
import { CollaborationComponent } from './components/collaboration/collaboration.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { AssessmentComponent } from './components/assessment/assessment.component';

const routes = [
  {
    path: '',
    component: DigitalMapsLayoutComponent,
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },
      { path: 'overview', component: DigitalMapsOverviewComponent },
      { path: 'maps', component: MapDashboardComponent },
      { path: 'processes', component: ProcessFlowsComponent },
      { path: 'collaboration', component: CollaborationComponent },
      { path: 'documentation', component: DocumentationComponent },
      { 
        path: 'assessment', 
        loadChildren: () => import('./components/assessment/assessment.module').then(m => m.AssessmentModule)
      },
      { 
        path: 'agentic-assessment', 
        loadChildren: () => import('../agentic-assessment/agentic-assessment.module').then(m => m.AgenticAssessmentModule)
      }
    ]
  }
];

@NgModule({
  declarations: [
    DigitalMapsLayoutComponent,
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
  ]
})
export class DigitalMapsModule { }
