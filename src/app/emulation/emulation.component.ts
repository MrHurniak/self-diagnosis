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

@Component({
  templateUrl: './emulation.component.html',
  styleUrls: ['./emulation.component.scss']
})
export class EmulationComponent implements OnDestroy {

  private subscription = new Subscription();

  private disabledNodes: string[] = [];
  private disabledEdges: string[] = [];

  public size: number;
  public matrix: string[][];
  public result: string[][];
  public failures = [];
  public selectedItems = {};

  public started = false;
  public running = false;

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
        console.log(info.meta);
      })
    );
  }

  public run() {
    if (!this.started) {
      this.emulation.start(this.matrix, this.disabledNodes, this.disabledEdges);
      this.disabledNodes = [];
      this.disabledEdges = [];
      return;
    }
    this.emulation.pause();
  }

  public reset() {
    this.emulation.stop();
    this.failures = [];
    this.selectedItems = {};
    this.disabledEdges = [];
    this.disabledNodes = [];
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
        if (this.started) {
          this.emulation.toggle($event.id, $event.target);
        } else {
          this.initToggle($event.id, $event.target);
        }
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

  private initToggle(id: string, type: ItemType): void {
    const items = (type === 'node') ? this.disabledNodes : this.disabledEdges;
    const index = items.indexOf(id);
    if (index > -1) {
      items.splice(index, 1);
    } else {
      items.push(id);
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
}
