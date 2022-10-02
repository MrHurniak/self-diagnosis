import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmulationComponent } from './emulation.component';
import { GraphViewComponent } from './graph-view/graph-view.component';
import { TaskInfoComponent } from './task-info/task-info.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../_@shared/shared.module';
import { EmulationService } from './logic/emulation.service';


@NgModule({
  declarations: [
    EmulationComponent,
    GraphViewComponent,
    TaskInfoComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: EmulationComponent },
    ]),
    SharedModule,
  ],
  providers: [
    EmulationService,
  ]
})
export class EmulationModule { }
