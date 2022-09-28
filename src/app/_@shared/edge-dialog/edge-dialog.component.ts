import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-edge-dialog',
  templateUrl: './edge-dialog.component.html',
  styleUrls: ['./edge-dialog.component.scss']
})
export class EdgeDialogComponent implements OnInit {

  @Input() message = 'Enter nodes ids:';

  public form;

  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.initForm()
  }

  private initForm(): void {
    this.form = new FormGroup({
        id1: new FormControl('', [Validators.required]),
        id2: new FormControl('', [Validators.required])
      },
      [this.validateNodes]);
  }

  submit(): void {
    if (this.form.valid) {
      const { id1, id2 } = this.form.value;
      this.modal.close([id1, id2]);
    }
  }

  private validateNodes(control: AbstractControl): ValidationErrors | null {
    const { id1, id2 } = control.value;

    if (id1 === id2) {
      return {
        id1: 'Cannot match id2',
        id2: 'Cannot match id1',
      }
    }
    return null;
  }
}
