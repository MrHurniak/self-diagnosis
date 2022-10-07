import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalService } from '../_@shared/modal-service/modal.service';
import { MAX_COUNT, MIN_COUNT } from '../_@shared/utils/constants';

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  constructor(
    private router: Router,
    private modal: ModalService,
  ) { }


  openDiagnosis(type: 'manual' | 'random'): Promise<any> {
    if (type === 'random') {
      return this.router.navigate(['task'])
    }
    return this.modal.numberDialog(MIN_COUNT, MAX_COUNT)
      .then(size =>
          this.router.navigate(['task'], { queryParams: { size } }),
        () => null
      );
  }
}
