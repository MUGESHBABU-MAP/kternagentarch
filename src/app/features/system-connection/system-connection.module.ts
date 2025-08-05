import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { SystemConnectionComponent } from './components/system-connection/system-connection.component';
import { VpnFormComponent } from './components/vpn-form/vpn-form.component';
import { IpsecFormComponent } from './components/ipsec-form/ipsec-form.component';
import { ConnectorInstructionsComponent } from './components/connector-instructions/connector-instructions.component';

const routes: Routes = [
  {
    path: '',
    component: SystemConnectionComponent
  }
];

@NgModule({
  declarations: [
    SystemConnectionComponent,
    VpnFormComponent,
    IpsecFormComponent,
    ConnectorInstructionsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class SystemConnectionModule { }
