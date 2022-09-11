import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', loadChildren:
      () => import('./dashboard/dashboard.module')
        .then((m) => m.DashboardModule),
  },
  {
    path: 'task', loadChildren:
      () => import('./emulation/emulation.module')
        .then((m) => m.EmulationModule),
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
