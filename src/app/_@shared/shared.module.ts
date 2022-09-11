import { NgModule } from "@angular/core";
import { ButtonComponent } from './button/button.component';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { HeaderComponent } from './header/header.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [
    ButtonComponent,
    HeaderComponent,
    ConfirmationModalComponent,
  ],
  exports: [
    ButtonComponent,
    HeaderComponent,
    ConfirmationModalComponent,
  ],
})
export class SharedModule { }
