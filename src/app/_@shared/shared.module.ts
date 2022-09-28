import { NgModule } from '@angular/core';
import { ButtonComponent } from './button/button.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { ModalService } from './modal-service/modal.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NumberDialogComponent } from './number-dialog/number-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { EdgeDialogComponent } from './edge-dialog/edge-dialog.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
    ],
  declarations: [
    ButtonComponent,
    HeaderComponent,
    ConfirmationModalComponent,
    NumberDialogComponent,
    EdgeDialogComponent,
  ],
  exports: [
    ButtonComponent,
    HeaderComponent,
    ConfirmationModalComponent,
  ],
  providers: [
    NgbActiveModal,
    ModalService,
  ]
})
export class SharedModule { }
