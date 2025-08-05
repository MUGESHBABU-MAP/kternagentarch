import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { AssessmentLayoutComponent } from './components/assessment-layout/assessment-layout.component';

const routes = [
  {
    path: '',
    component: AssessmentLayoutComponent,
    children: [
      { path: '', redirectTo: 'system-connection', pathMatch: 'full' },
      { 
        path: 'system-connection', 
        loadChildren: () => import('../system-connection/system-connection.module').then(m => m.SystemConnectionModule)
      },
      { 
        path: 'usage-logs', 
        loadChildren: () => import('../usage-logs/usage-logs.module').then(m => m.UsageLogsModule)
      }
    ]
  }
];

@NgModule({
  declarations: [
    AssessmentLayoutComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AssessmentModule { }
