import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { RandomService } from "../_@shared/services/random.service";

@Component({
  templateUrl: './emulation.component.html',
  styleUrls: ['./emulation.component.scss']
})
export class EmulationComponent implements OnDestroy {

  private subscription = new Subscription();

  public modulesCount: number;
  public matrix: string[][];

  constructor(
    private route: ActivatedRoute,
    private randomService: RandomService,
  ) {
    this.route.queryParams
      .subscribe(params => {
        if (params['size']) {
          this.modulesCount = parseInt(params['size'], 10) || 18;
        } else {
          this.modulesCount = this.randomService.generateSize();
        }

        this.matrix = this.randomService.generateMatrix(this.modulesCount);
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
