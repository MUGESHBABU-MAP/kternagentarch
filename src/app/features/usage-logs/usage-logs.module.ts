import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { UsageLogsRoutingModule } from './usage-logs-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { UsageLogsComponent } from './components/usage-logs/usage-logs.component';
import { LogsUploadComponent } from './components/logs-upload/logs-upload.component';
import { LogsFetchComponent } from './components/logs-fetch/logs-fetch.component';
import { LogsTableComponent } from './components/logs-table/logs-table.component';

@NgModule({
  declarations: [
    UsageLogsComponent,
    LogsUploadComponent,
    LogsFetchComponent,
    LogsTableComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UsageLogsRoutingModule,
    SharedModule
  ]
})
export class UsageLogsModule { }
