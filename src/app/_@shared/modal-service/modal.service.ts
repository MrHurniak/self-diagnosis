import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ConfirmationModalComponent
} from '../confirmation-modal/confirmation-modal.component';
import {
  NumberDialogComponent
} from '../number-dialog/number-dialog.component';

@Injectable()
export class ModalService {

  constructor(
    private modal: NgbModal
  ) { }

  public numberDialog(min?: number, max?: number, message?: string): Promise<number> {
    const dialog = this.modal.open(NumberDialogComponent);

    if (min) dialog.componentInstance.minSetter = min;
    if (max) dialog.componentInstance.maxSetter = max;
    if (message) dialog.componentInstance.message = message;

    return dialog.result
      .then(value => parseInt(value, 10));
  }

  public confirm(message?: string, title?: string): Promise<boolean> {
    const confirmation = this.modal.open(ConfirmationModalComponent);

    if (message) confirmation.componentInstance.message = message;
    if (title) confirmation.componentInstance.title = title;

    return confirmation.result
      .then(() => true, () => false);
  }
}
