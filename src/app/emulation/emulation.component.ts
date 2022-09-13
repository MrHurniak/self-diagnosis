import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  templateUrl: './emulation.component.html',
  styleUrls: ['./emulation.component.scss']
})
export class EmulationComponent implements OnDestroy {

  private subscription = new Subscription();
  private readonly minNodes = 10;
  private readonly maxNodes = 25;

  public modulesCount: number;
  public matrix: string[][];

  constructor(
    private route: ActivatedRoute
  ) {
    this.route.queryParams
      .subscribe(params => {
        if (params['mode'] === 'random') {
          this.modulesCount = EmulationComponent.randomInt(
            this.minNodes, this.maxNodes
          );
          return;
        }
        this.modulesCount = 18;
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.matrix = [
      ['0', '1', '1', '1'],
      ['1', '0', '1', '0'],
      ['1', '1', '0', '0'],
      ['1', '0', '0', '0'],
    ]
  }

  public static randomInt(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max - min + 1));
  }
}
