import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/digital-maps',
    pathMatch: 'full'
  },
  {
    path: 'digital-maps',
    loadChildren: () => import('./features/digital-maps/digital-maps.module').then(m => m.DigitalMapsModule)
  },
  {
    path: '**',
    redirectTo: '/digital-maps'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
