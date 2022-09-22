import { Injectable } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  ConfirmationModalComponent
} from "../confirmation-modal/confirmation-modal.component";

@Injectable()
export class ModalService {

  constructor(
    private modal: NgbModal
  ) { }

  public confirm(): Promise<boolean> {
    return this.modal.open(ConfirmationModalComponent).result
      .then(value => true, error => false);
  }

}
