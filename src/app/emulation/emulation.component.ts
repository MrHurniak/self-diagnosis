import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RandomService } from '../_@shared/services/random.service';
import { GraphEvent } from './emulation.component.types';
import { ModalService } from '../_@shared/modal-service/modal.service';
import { MatrixService } from '../_@shared/services/matrix.service';
import { Subscription } from 'rxjs';
import { DEFAULT_COUNT, IDS_DELIMITER } from '../_@shared/utils/constants';
import {
  DiagnosticResult,
  EmulationService,
  Processing
} from './logic/emulation.service';
import { ItemType } from './logic/emulation.types';
import {
  TEST_CYCLES,
  TEST_DISABLED_NODES_COUNT,
  TEST_ENABLED,
  TEST_REGENERATE_MATRIX,
} from '../_@shared/utils/configs';

@Component({
  templateUrl: './emulation.component.html',
  styleUrls: ['./emulation.component.scss']
})
export class EmulationComponent implements OnDestroy {

  private subscription = new Subscription();

  public size: number;
  public matrix: string[][];
  public result: string[][];
  public failures = [];
  public selectedItems = {};
  public disabledItems: string[] = [];

  public started = false;
  public running = false;

  private testingCounter = TEST_CYCLES;
  private testingResult = [];

  constructor(
    private route: ActivatedRoute,
    private randomService: RandomService,
    private matrixService: MatrixService,
    private modalService: ModalService,
    private emulation: EmulationService,
  ) {
    this.route.queryParams
      .subscribe(params => {
        if (params['size']) {
          this.size = parseInt(params['size'], 10) || DEFAULT_COUNT;
        } else {
          this.size = this.randomService.generateSize();
        }
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.matrix = this.randomService.generateMatrix(this.size);
    if (TEST_ENABLED && !this.disabledItems.length) {
      this.generateDisabledItems();
    }

    this.subscription.add(
      this.emulation.processing.subscribe(
        event => this.updateHighlight(event)
      )
    );

    this.subscription.add(
      this.emulation.stateChange.subscribe(state => {
        this.running = !state.paused;
        this.started = state.started;
      })
    );

    this.subscription.add(
      this.emulation.diagnosticResult.subscribe(info => {
        this.result = info.result;
        this.failures = this.getFailures(info);
        this.processMeta(info.meta);
      })
    );
  }

  private generateDisabledItems(): void {
    this.disabledItems = RandomService.randomSample(this.size, TEST_DISABLED_NODES_COUNT)
      .map(value => `${value}`);
  }

  public run() {
    if (!this.started) {
      this.emulation.start(this.matrix, this.disabledItems);
      return;
    }
    this.emulation.pause();
  }

  public reset() {
    this.emulation.stop();
    this.failures = [];
    this.selectedItems = {};
    this.disabledItems = [];
    this.result = null;
  }

  async handleGraphEvent($event: GraphEvent): Promise<void> {
    switch ($event.type) {
      case 'add':
        if ($event.target === 'node') {
          this.createNode();
        } else {
          await this.createEdge();
        }
        break;
      case 'delete':
        if ($event.target === 'node') {
          await this.deleteNode($event.id);
        } else {
          await this.deleteEdge($event.id);
        }
        break;
      case 'toggle':
        this.toggle($event.id, $event.target);
        break;
    }
  }

  // create
  private createNode(): void {
    this.matrix = this.matrixService.createNode(this.matrix);
    this.size = this.matrix.length;
  }

  private async createEdge(): Promise<void> {
    const result = await this.modalService.edgeDialog();
    if (!result) {
      return Promise.resolve();
    }

    const [id1, id2] = result;
    this.matrix = this.matrixService.createEdge(this.matrix, id1, id2);
  }

  // delete
  private async deleteNode(id: string): Promise<void> {
    if (!await this.modalService.confirm()) {
      return;
    }

    this.matrix = this.matrixService.deleteNode(
      this.matrix, parseInt(id, 10)
    );
    this.size = this.matrix.length;
  }

  private async deleteEdge(id?: string): Promise<void> {
    let id1, id2;
    if (id) {
      [id1, id2] = id.split(IDS_DELIMITER)
        .map(value => parseInt(value, 10));
    } else {
      const result = await this.modalService.edgeDialog();
      if (!result) {
        return Promise.resolve();
      }
      [id1, id2] = result;
    }
    this.matrix = this.matrixService.deleteEdge(this.matrix, id1, id2);
  }

  private toggle(id: string, type: ItemType): void {
    const index = this.disabledItems.indexOf(id);
    const isActive = index > -1;
    if (isActive) {
      this.disabledItems.splice(index, 1);
    } else {
      this.disabledItems.push(id);
    }

    if (this.started) {
      this.emulation.setItemActive(id, isActive, type);
    }
  }

  private updateHighlight(event: Processing): void {
    const itemExists = Object.keys(this.selectedItems).includes(event.id);

    if (event.value) {
      if (!itemExists) {
        this.selectedItems[event.id] = event.type;
      }
      return;
    }
    if (itemExists) {
      delete this.selectedItems[event.id];
    }
  }

  private getFailures(info: DiagnosticResult): string[] {
    return Array.from(info.probability,
      ([name, value]) => (`${name}: ${value}`));
  }

  private processMeta(meta): void {
    if (!TEST_ENABLED) {
      return;
    }

    this.testingCounter--;
    this.testingResult.push(meta);

    if (this.testingCounter < 1) {
      this.stopTesting();
      return;
    }
    this.nextTestingCycle();
  }

  private nextTestingCycle(): void {
    this.reset();

    this.generateDisabledItems();
    if (TEST_REGENERATE_MATRIX) {
      this.matrix = this.randomService.generateMatrix(this.size);
    }

    setTimeout(() => this.run(), 100);
  }

  private stopTesting(): void {
    this.reset();
    this.analyzeTestResult();

    this.testingResult = [];
    this.testingCounter = TEST_CYCLES;
  }

  private analyzeTestResult(): void {
    let avgTime = 0;
    let sumPos = 0;
    for (let i = 0; i < this.testingResult.length; i++) {
      const test = this.testingResult[i];
      avgTime += test.analysisTime - test.startTime;
      sumPos += test.isCorrect ? 1 : 0;
    }
    console.log('Dis nodes:', TEST_DISABLED_NODES_COUNT ,
      'Avg time:', avgTime / this.testingResult.length,
      '\n% ', sumPos / this.testingResult.length * 100);
  }
}
