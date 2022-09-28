import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  DEFAULT_COUNT,
  RandomService
} from '../_@shared/services/random.service';
import { GraphEvent } from './emulation.component.types';
import { ModalService } from '../_@shared/modal-service/modal.service';
import { MatrixService } from '../_@shared/services/matrix.service';

@Component({
  templateUrl: './emulation.component.html',
  styleUrls: ['./emulation.component.scss']
})
export class EmulationComponent {

  public modulesCount: number;
  public matrix: string[][];

  constructor(
    private route: ActivatedRoute,
    private randomService: RandomService,
    private matrixService: MatrixService,
    private modalService: ModalService,
  ) {
    this.route.queryParams
      .subscribe(params => {
        if (params['size']) {
          this.modulesCount = parseInt(params['size'], 10) || DEFAULT_COUNT;
        } else {
          this.modulesCount = this.randomService.generateSize();
        }

        this.matrix = this.randomService.generateMatrix(this.modulesCount);
      });
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
        break;
    }
  }

  // create
  private createNode(): void {
    this.matrix = this.matrixService.createNode(this.matrix);
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
  }

  private async deleteEdge(id?: string): Promise<void> {
    let id1, id2;
    if (id) {
      [id1, id2] = id.split(':')
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
}
