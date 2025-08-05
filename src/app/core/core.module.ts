import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Services
import { SystemConnectionService } from './services/system-connection.service';
import { LogsService } from './services/logs.service';
import { PrerequisiteService } from './services/prerequisite.service';
import { AssessmentService } from './services/assessment.service';

// Interceptors
import { MockApiInterceptor } from './interceptors/mock-api.interceptor';

// Guards
import { WizardGuard } from './guards/wizard.guard';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    SystemConnectionService,
    LogsService,
    PrerequisiteService,
    AssessmentService,
    WizardGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MockApiInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
  }
}
