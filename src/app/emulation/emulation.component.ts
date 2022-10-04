import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DEFAULT_COUNT,
  RandomService
} from '../_@shared/services/random.service';
import { GraphEvent } from './emulation.component.types';
import { ModalService } from '../_@shared/modal-service/modal.service';
import { MatrixService } from '../_@shared/services/matrix.service';
import { Subscription } from 'rxjs';
import { IDS_DELIMITER } from '../_@shared/utils/constants';
import { EmulationService } from './logic/emulation.service';

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
  public selectedItems = [];

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
    this.result = this.matrixService.initEmptyMatrix(this.size);

    this.subscription.add(
      this.emulation.processing.subscribe(ids => {
        this.selectedItems = ids;
      })
    );

    this.subscription.add(
      this.emulation.stateChange.subscribe(state => {
        this.running = !state.paused;
        this.started = state.started;
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
    this.selectedItems = [];
    this.disabledEdges = [];
    this.disabledNodes = [];
    this.result = this.matrixService.initEmptyMatrix(this.size);
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
    this.result = this.matrixService.initEmptyMatrix(this.size);
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
    this.result = this.matrixService.initEmptyMatrix(this.size);
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

  private initToggle(id: string, type: 'node' | 'edge'): void {
    const items = type === 'node' ? this.disabledNodes : this.disabledEdges;
    const index = items.indexOf(id);
    if (index > -1) {
      items.splice(index, 1);
    } else {
      items.push(id);
    }
  }
}
