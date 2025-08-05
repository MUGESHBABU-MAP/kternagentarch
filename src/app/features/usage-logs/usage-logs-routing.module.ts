import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsageLogsComponent } from './components/usage-logs/usage-logs.component';

const routes: Routes = [
  {
    path: '',
    component: UsageLogsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsageLogsRoutingModule { }
