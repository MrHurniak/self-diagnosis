import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import {
  ModalService
} from "../_@shared/modal-service/modal.service";

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private router: Router,
    private modal: ModalService,
  ) { }

  ngOnInit(): void {
  }

  openDiagnosis(type: 'manual' | 'random'): Promise<any> {
    if (type === 'random') {
      return this.router.navigate(['task'])
    }
    return this.modal.confirm()
      .then(result => {
        if (result) {
          return this.router.navigate(['task']);
        } else return null;
      });
  }
}
