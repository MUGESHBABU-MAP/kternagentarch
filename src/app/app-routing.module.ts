import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'digital-maps',
        pathMatch: 'full'
      },
      {
        path: 'digital-maps',
        loadChildren: () => import('./features/digital-maps/digital-maps.module').then(m => m.DigitalMapsModule),
        data: { breadcrumb: 'Digital Maps' }
      },
      {
        path: 'agents',
        loadChildren: () => import('./features/agentic-framework/agentic-framework.module').then(m => m.AgenticFrameworkModule),
        data: { breadcrumb: 'Agent Framework' }
      },
      {
        path: 'agentic-assessment',
        loadChildren: () => import('./features/agentic-assessment/agentic-assessment.module').then(m => m.AgenticAssessmentModule),
        data: { breadcrumb: 'Agentic Assessment' }
      },
      {
        path: '**',
        redirectTo: 'digital-maps/overview'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
