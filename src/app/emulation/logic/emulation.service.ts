import { EventEmitter, Injectable } from '@angular/core';
import { DELAY, PRESENT } from '../../_@shared/utils/constants';
import { RandomService } from '../../_@shared/services/random.service';
import { Item } from './item';

export interface State {
  started: boolean,
  paused: boolean,
}

@Injectable()
export class EmulationService {

  public readonly processing = new EventEmitter<string[]>();
  public readonly state = new EventEmitter<State>();

  private started = false;
  private paused = false;
  private nodes = [];
  private edges = [];

  constructor(
    private random: RandomService
  ) { }

  public pause(): void {
    this.paused = !this.paused;
    this.publishState();
  }

  public stop(): void {
    this.started = false;
    this.paused = false;
    this.nodes = [];
    this.edges = [];
    this.publishState();
  }

  public toggle(): void {

  }

  public start(matrix: string[][]): void {
    this.started = true;
    this.paused = false;
    this.publishState();

    // initialization
    this.createNodes(matrix);
    this.createEdges(matrix);

    // start
    const id = this.random.randomInt(0, matrix.length - 1);
    this.call([this.nodes[id]]);
  }

  private call(items: Item[]): void {
    if (!this.started) {
      return;
    }

    if (this.paused) {
      setTimeout(() => this.call(items), DELAY);
      return;
    }

    console.log('call', items);
    this.processing.emit(items.map(item => item.id));

    let newItems = [];
    for (let item of items) {
      const items1 = item.pass();
      newItems = newItems.concat(items1);
    }

    if (!newItems.length) {
      console.error('There is no any items');
      return;
    }

    setTimeout(() => this.call(newItems), DELAY);
  }

  private publishState(): void {
    this.state.emit({
      started: this.started,
      paused: this.paused
    });
  }

  private createNodes(matrix: string[][]): void {
    for (let i = 0; i < matrix.length; i++) {
      let node = new Item(i);
      this.nodes.push(node);
    }
  }

  private createEdges(matrix: string[][]): void {
    for (let i = 0; i < matrix.length; i++) {
      for (let j = i; j < matrix[i].length; j++) {
        if (i === j) continue;

        if (matrix[i][j] === PRESENT) {
          const node1 = this.nodes[i];
          const node2 = this.nodes[j];
          const edge = new Item(i, j);
          edge.links.push(node1, node2);
          node1.links.push(edge);
          node2.links.push(edge);
          this.edges.push(edge);
        }
      }
    }
  }
}
