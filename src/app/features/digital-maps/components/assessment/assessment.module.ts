import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';

import { SystemConnectionComponent } from './system-connection/system-connection.component';
import { PrerequisitesComponent } from './prerequisites/prerequisites.component';
import { SystemSetupComponent } from './system-setup/system-setup.component';
import { AssessmentSelectionComponent } from './assessment-selection/assessment-selection.component';
import { AssessmentProgressComponent } from './assessment-progress/assessment-progress.component';
import { HelpModalComponent } from './components/help-modal/help-modal.component';

const routes = [
  { path: '', redirectTo: 'system-setup', pathMatch: 'full' },
  { path: 'system-setup', component: SystemSetupComponent },
  { path: 'usage-logs', loadChildren: () => import('../../../usage-logs/usage-logs.module').then(m => m.UsageLogsModule) },
  { path: 'selection', component: AssessmentSelectionComponent },
  { path: 'progress', component: AssessmentProgressComponent }
];

@NgModule({
  declarations: [
    SystemConnectionComponent,
    PrerequisitesComponent,
    SystemSetupComponent,
    AssessmentSelectionComponent,
    AssessmentProgressComponent,
    HelpModalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class AssessmentModule { }
