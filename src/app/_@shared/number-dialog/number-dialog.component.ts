import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormControl, Validators } from "@angular/forms";

@Component({
  selector: 'app-number-dialog',
  templateUrl: './number-dialog.component.html',
  styleUrls: ['./number-dialog.component.scss']
})
export class NumberDialogComponent implements OnInit {

  public min = 0;
  public max = 0;

  @Input() message = 'Enter size';

  public form;

  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  public submit(): void {
    if (this.form.valid) {
      this.modal.close(this.form.value);
    }
  }

  @Input("min")
  set minSetter(min: number) {
    this.min = min;
    this.form?.updateValueAndValidity();
  }

  @Input("max")
  set maxSetter(max: number) {
    this.max = max;
    this.form?.updateValueAndValidity();
  }

  private initForm(): void {
    this.form = new FormControl(
      this.min,
      [
        Validators.required,
        Validators.min(this.min),
        Validators.max(this.max),
      ]
    );
  }
}
