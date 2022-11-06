import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as CONFIG from '../utils/configs';
import { debounceTime, Subscription } from 'rxjs';
import { update } from '../utils/configs';

@Component({
  selector: 'app-config-modal',
  templateUrl: './config-modal.component.html',
  styleUrls: ['./config-modal.component.scss']
})
export class ConfigModalComponent implements OnInit, OnDestroy {

  private subscription = new Subscription();

  public form;

  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm(): void {
    this.form = new FormGroup({
      delay: new FormControl(CONFIG.DELAY,
        [Validators.min(0)]),
      runProbability: new FormControl(CONFIG.RUN_PROBABILITY,
        [Validators.min(0), Validators.max(1)]),
      nodeLinkProbability: new FormControl(CONFIG.NODE_LINK_PROBABILITY,
        [Validators.min(0), Validators.max(1)]),
      coefOfSufficiency: new FormControl(CONFIG.COEFFICIENT_OF_SUFFICIENCY,
        [Validators.min(0)]),
      accuracy: new FormControl(CONFIG.ACCURACY,
        [Validators.min(0), Validators.max(1)]),
    });

    this.subscription.add(
      this.form.valueChanges
        .pipe(debounceTime(500))
        .subscribe(event => update(event))
    );
  }
}
