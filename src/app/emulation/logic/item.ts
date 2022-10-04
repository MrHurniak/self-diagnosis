import {
  DELAY,
  ERROR,
  IDS_DELIMITER,
  PRESENT,
  UNKNOWN
} from '../../_@shared/utils/constants';
import { Processing, State } from './emulation.service';
import { EventEmitter } from '@angular/core';

export interface Item {

  id: string;
  active: boolean;

  pass(id: string, result: string[][]): void;

  isActive(): boolean;
}

export class Node implements Item {

  public id;
  public active = true;
  public links: Edge[] = [];

  private result: string[][] = null;

  constructor(id: number,
              private state: State,
              private processing: EventEmitter<Processing>) {
    this.id = `${id}`;
  }

  isActive(): boolean {
    return this.active;
  }

  pass(id: string, result: string[][]): void {
    if (!this.isActive() || !this.state.started) {
      return;
    }

    this.processing.emit({ id: this.id, value: true, });

    console.log('pass', this.id);

    const validEdges: Edge[] = [];
    for (let edge of this.links) {

      if (edge.id === id) {
        continue; // !do not send back
      }

      const edgeActive = edge.isActive(); // !validity check
      if (edgeActive) {
        validEdges.push(edge);
      }
    }

    setTimeout(
      () => this.call(validEdges, this.id, this.result),
      DELAY
    );
  }

  private call(edges, id, result): void {
    if (this.state.paused) {
      setTimeout(() => this.call(edges, id, result), DELAY);
      return;
    }

    edges.forEach(edge => edge.pass(id, result));

    this.processing.emit({ id, value: false, });
  }

  private updateResult(edge: Edge, active: boolean): void {
    const id1 = parseInt(this.id, 10);
    const id2Str = edge.id.split(IDS_DELIMITER).find(id => id !== this.id);
    const id2 = parseInt(id2Str, 10);

    this.result[id1][id2] = active ? PRESENT : ERROR;
  }

  private append(appender: string[][]): void {
    for (let i = 0; i < this.result.length; i++) {
      for (let j = 0; j < this.result[i].length; j++) {
        if (this.result[i][j] !== UNKNOWN) {
          continue;
        }
        this.result[i][j] = appender[i][j];
      }
    }
  }
}

export class Edge implements Item {

  public id;
  public active = true;
  public links: Node[] = [];

  constructor(id1: number, id2: number,
              private state: State,
              private processing: EventEmitter<Processing>) {
    this.id = `${id1}${IDS_DELIMITER}${id2}`;
  }

  public isActive(): boolean {
    return this.active
      && !this.links.some(node => !node.isActive());
  }

  pass(id: string, result: string[][]): void {
    if (!this.isActive || !this.state.started) {
      return;
    }

    this.processing.emit({ id: this.id, value: true, });

    console.log('pass', this.id);

    const validNodes = this.links.filter(node => node?.id !== id);

    setTimeout(
      () => this.call(validNodes, this.id, result),
      DELAY
    );
  }

  private call(validNodes: Node[], id, result): void {
    if (this.state.paused) {
      setTimeout(() => this.call(validNodes, id, result), DELAY);
      return;
    }

    validNodes.forEach(node => node.pass(id, result));

    this.processing.emit({ id, value: false, });
  }
}
