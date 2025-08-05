import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// ng-zorro imports
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzBadgeModule } from 'ng-zorro-antd/badge';

// Shared components
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { StatusIndicatorComponent } from './components/status-indicator/status-indicator.component';
import { WizardNavigationComponent } from './components/wizard-navigation/wizard-navigation.component';

// Shared pipes
import { SafeHtmlPipe } from './pipes/safe-html.pipe';

const NGZORRO_MODULES = [
  NzCardModule,
  NzButtonModule,
  NzIconModule,
  NzGridModule,
  NzTypographyModule,
  NzStepsModule,
  NzUploadModule,
  NzInputModule,
  NzSelectModule,
  NzTableModule,
  NzProgressModule,
  NzCheckboxModule,
  NzRadioModule,
  NzMessageModule,
  NzModalModule,
  NzFormModule,
  NzDatePickerModule,
  NzInputNumberModule,
  NzAlertModule,
  NzTagModule,
  NzEmptyModule,
  NzLayoutModule,
  NzMenuModule,
  NzBreadCrumbModule,
  NzDividerModule,
  NzToolTipModule,
  NzAvatarModule,
  NzDropDownModule,
  NzTabsModule,
  NzTimelineModule,
  NzCollapseModule,
  NzResultModule,
  NzStatisticModule,
  NzNotificationModule,
  NzBadgeModule
];

const SHARED_COMPONENTS = [
  LoadingSpinnerComponent,
  StatusIndicatorComponent,
  WizardNavigationComponent
];

const SHARED_PIPES = [
  SafeHtmlPipe
];

@NgModule({
  declarations: [
    ...SHARED_COMPONENTS,
    ...SHARED_PIPES
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ...NGZORRO_MODULES
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ...NGZORRO_MODULES,
    ...SHARED_COMPONENTS,
    ...SHARED_PIPES
  ]
})
export class SharedModule { }
